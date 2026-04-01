# H3 — Gameplay Flow Walkthrough

**Auditor**: Howler H3 (Sonnet)
**Date**: 2026-03-31
**Method**: Static code trace — no execution. Sources read: `app/page.tsx`, `lib/gameEngine.ts`, `lib/gameContext.tsx`, `lib/terminalCreation.ts`, `lib/terminalDeath.ts`, `lib/actions/movement.ts`, `lib/actions/combat.ts`, `lib/actions/system.ts`, `middleware.ts`, `data/rooms/index.ts`.

---

## BLOCKERS

### B1 — Rebirth via character creation wipes cycle history (CRITICAL)

**Location**: `app/page.tsx` lines 310–320, `lib/gameEngine.ts` `createCharacter()` lines 573–683

**What happens**: When a player dies and types BEGIN in the `between` phase, `page.tsx` sets `gameFlow = 'rebirth'` and `authPhase = 'creating'`. This routes future input to the creation wizard. When the player completes the wizard, `handleCommand` (line 259) calls `engine.createCharacter()` — the **same method used for first-time character creation**.

`createCharacter()` (line 600) performs:
```
await supabase.from('players').upsert(playerRow, { onConflict: 'id' })
```

The `playerRow` hardcodes `cycle: 1`, `total_deaths: 0`, and `is_dead: false`. This resets the cycle counter to 1 for returning players. The ledger upsert also resets `current_cycle: 1` and `total_deaths: 0`. The player's cycle history snapshot in `player_ledger.cycle_history` is **not carried forward** — the ledger is created fresh with `{ discovered_enemies: [] }`.

The engine also has `rebirthWithStats()` (line 1012) which correctly increments `cycle`, carries `inheritedRep`, preserves `cycle_history`, and handles `total_deaths`. **This method is never called from `page.tsx`**. The only call sites for `rebirthWithStats` and `rebirthCharacter` are inside `gameEngine.ts` itself (defined, not called externally).

**Consequence**: After death, a player completing the creation wizard starts at Cycle 1 with zero deaths. All cycle memory, echo stats, faction inheritance, and discovered enemies are lost. The Revenant mechanic — the game's central loop — is broken on rebirth.

**Correct fix**: In `page.tsx`, when `gameFlow === 'rebirth'` and creation completes, call `engine.rebirthWithStats(name, stats, characterClass, personalLoss)` instead of `engine.createCharacter(...)`.

---

### B2 — `loadPlayer()` DB error silently drops to character creation

**Location**: `app/page.tsx` lines 80–117, `lib/gameEngine.ts` `loadPlayer()` lines 700–703

**What happens**: `loadPlayer()` on DB error calls `this._setState({ loading: false })` then throws. The `init()` function in `page.tsx` catches any error from `loadPlayer()` (lines 111–117) and immediately starts character creation:

```typescript
} catch {
  // Failed to load player — start creation
  const cs = initialCreationState()
  setCreationState(cs)
  engine._appendMessages(creationPrompt(cs))
  if (!cancelled) setAuthPhase('creating')
}
```

There is no distinction between "player not found" (returns `false`, handled correctly at line 83) and "DB timeout or transient error" (throws, drops to creation). A player with an existing save who hits a DB timeout at load time will see the character creation wizard. If they complete it, `createCharacter()` upserts with `onConflict: 'id'`, overwriting their existing player row entirely.

**Consequence**: A transient DB failure at load time causes permanent, silent save destruction. No error message is shown. The player does not know their data was at risk.

**Correct fix**: In the `catch` block, show an error message and offer a reload option rather than silently starting creation. Do not call `createCharacter` unless the `loadPlayer` returned `false` (not an error).

---

### B3 — `rebirthCharacter()` `loadPlayer()` failure leaves player stuck with no recovery

**Location**: `lib/gameEngine.ts` `rebirthCharacter()` lines 975–979

**What happens**: After persisting the new cycle to DB, `rebirthCharacter()` calls `this.loadPlayer(player.id)`. If `loadPlayer` returns `false` (player row not found — e.g., if the preceding `update` call silently failed), the engine throws `'Failed to reload player after rebirth'`. This propagates up to the caller.

`rebirthCharacter()` is defined but (as noted in B1) not called from the main page flow. However, `rebirthWithStats()` has the identical pattern at lines 1081–1085 and **is** the correct rebirth path once B1 is fixed.

If `loadPlayer()` fails during rebirth, the error bubbles up through the creation handler's catch block in `page.tsx` (line 265–271), which shows an error message but leaves `authPhase === 'creating'` and `gameFlow === 'rebirth'`. The player is shown an error but the creation form stays active — they cannot progress without reloading the page. On reload, `loadPlayer()` will find the partially-updated player row (cycle incremented, inventory deleted, but state unclear) and may load it correctly or fail again.

**Consequence**: DB failure mid-rebirth leaves the player in a limbo state that requires a manual page reload. Not data-destroying, but a stuck state with no player-visible guidance to reload.

---

## WARNINGS

### W1 — Death watch `useEffect` has a race condition on unmount

**Location**: `app/page.tsx` lines 143–172

**What happens**: The death detection effect fires a `setTimeout(..., 1500)` and sets `deathPendingRef.current = true`. The cleanup function clears the timeout and resets the ref. However, if the component unmounts during the 1500ms window (e.g., user navigates away or session expires), the cleanup runs, but `deathPendingRef.current` is reset to `false`. If the component remounts before the timeout fires (unlikely but possible in React Strict Mode's double-invoke behavior), the death sequence could fire twice.

In development (React Strict Mode), `useEffect` is called twice intentionally. The second invocation will see `deathPendingRef.current = false` (cleaned up by the first) and fire the death messages again, appending duplicate death text to the terminal.

**Consequence**: In development, death messages may appear doubled. In production (single mount), this is low risk but not zero — any rapid state change that clears and re-triggers `state.playerDead` could cause duplicate death messages.

---

### W2 — `CONFIRM RESTART` and ending `BEGIN` delete rows without error handling

**Location**: `app/page.tsx` lines 213–225 (CONFIRM RESTART), lines 340–349 (ending BEGIN)

**What happens**: Both code paths issue 5 sequential Supabase `delete()` calls without checking errors:

```typescript
await supabase.from('player_inventory').delete().eq('player_id', userId)
await supabase.from('player_ledger').delete().eq('player_id', userId)
// ...etc
window.location.reload()
```

If any of these deletes fail (network error, auth expiry), the page reloads anyway. On reload, `loadPlayer()` finds the partially-deleted player row and loads it. The player may see their old room but with missing inventory or ledger data — an inconsistent state that silently corrupts their experience.

The `player_ledger` delete before `players` delete could also violate FK constraints if the schema enforces referential integrity (need to verify against H1 findings).

**Consequence**: Partial deletion on network failure leaves save data in an unknown state. No rollback or retry logic exists.

---

### W3 — Prologue `ENTER` command has a quirk

**Location**: `app/page.tsx` lines 228–248

**What happens**: The prologue handler checks:
```typescript
if (upper === 'SKIP' || upper === 'ENTER' || upper === '') {
```

However, `handleCommand` has an early return at line 203 (`if (!trimmed) return`), so an empty string never reaches the prologue handler. The `upper === ''` branch is unreachable. The prologue prompt tells users to "press ENTER to continue" — but pressing Enter with an empty field is filtered before the prologue handler sees it.

A player who follows the prompt literally (pressing Enter with no text) will see nothing happen. Only typing the word "ENTER" or "SKIP" advances the prologue.

**Consequence**: First-time UX friction. Players expecting to press Enter to advance will find it unresponsive. Not a blocker but misleading UI copy.

---

### W4 — Movement auto-save is the only save; explicit `save` does not auto-fire after character creation

**Location**: `lib/actions/movement.ts` line 485 (`await engine._savePlayer()`), `lib/gameEngine.ts` `createCharacter()` (no `_savePlayer()` call at end)

**What happens**: `createCharacter()` upserts the player row to DB and sets engine state, but does **not** call `_savePlayer()` at the end. The first explicit save only happens when the player moves rooms (via `handleMove` line 485) or explicitly types `save`.

If the browser crashes or the tab closes between character creation and the first room movement, the player row exists in the DB (created by upsert) but the following fields are NOT yet saved (they are only set in memory at this point):
- Any tutorial hint state
- `visited` flag on the start room (set by `markVisited` — this IS persisted)
- Engine log state

Actually re-examining: the upsert at `createCharacter()` line 600 persists the full player row including stats and starting room. So the core player data is safe. The only risk is if the DB upsert call itself fails — which would throw and show an error.

**Revised assessment**: W4 is lower risk than initially flagged. The `createCharacter` upsert is the save. Risk reduced to INFO level — see I2.

---

### W5 — `rebirthWithStats` does not persist `personal_loss` fields on rebirth

**Location**: `lib/gameEngine.ts` `rebirthWithStats()` lines 1035–1054

**What happens**: The `players.update()` in `rebirthWithStats()` includes `personal_loss_type` and `personal_loss_detail`. The `rebirthCharacter()` (auto-echo rebirth) at lines 928–941 does NOT include these fields in its update payload — the personal loss from the previous cycle is simply left in the DB column from the prior cycle. Since `loadPlayer()` reads `personal_loss_type` back, this is likely fine functionally, but it is an implicit dependency on leftover DB state rather than an explicit reset.

For `rebirthWithStats`, the player can choose a new personal loss, which IS written correctly.

**Consequence**: Low risk. Personal loss persists from prior cycle during auto-rebirth, which is arguably correct behavior (you carry your loss across death). But the asymmetry between the two rebirth paths is a maintenance hazard.

---

## INFO

### I1 — `dispatch()` is not queued; concurrent commands can race

**Location**: `lib/gameContext.tsx` lines 48–53, `app/page.tsx` lines 361–374

**What happens**: `handleCommand` is `async` and `dispatch(action)` is `async`. If the player types commands faster than the async handlers resolve (e.g., two rapid Enter presses), two `executeAction` calls can be in-flight simultaneously. Both read `this.state` at the start; the second may operate on stale state before the first has committed its `_setState` calls.

The most dangerous overlap is combat: two `handleAttack` calls in one round could apply two enemy attack rounds against the player or award XP twice. In practice, the 1500ms death delay and the DOM input clearing on submit make this unlikely for real users but not impossible.

**Consequence**: Potential for combat state corruption on rapid repeated commands. Low probability in normal play.

---

### I2 — No loading indicator during `createCharacter()` DB operations

**Location**: `lib/gameEngine.ts` `createCharacter()` lines 546–683

**What happens**: `createCharacter()` sets `this._setState({ loading: true })` at line 546 but `page.tsx` does not consume `state.loading` to display any UI feedback. During the DB upsert + `persistWorld()` call (which writes all 271 rooms to `generated_rooms`), the terminal shows "Initializing..." (from the creation confirm step) but the input is still active. A player could type commands into a frozen-looking terminal.

`persistWorld` is likely the slowest operation here — bulk-inserting room state records. The duration depends on DB latency.

**Consequence**: No user feedback during world generation. Perceived hang of 1–3 seconds on first character creation.

---

### I3 — Ending `BEGIN` deletes `players` last; FK cascade order matters

**Location**: `app/page.tsx` lines 340–349

**What happens**: The delete order is:
1. `player_inventory`
2. `player_ledger`
3. `player_stash`
4. `generated_rooms`
5. `players`

This is the correct order if FK constraints exist from child tables to `players`. However, if any intermediate delete fails and the page reloads, the next `loadPlayer()` will find a partially-deleted save. The `CONFIRM RESTART` path (lines 213–225) uses the same order.

**Consequence**: Correct order assuming FK constraints. Risk only materializes on partial failure (covered in W2).

---

### I4 — `saw_prologue` stored in `localStorage`, not DB; incognito / device change resets it

**Location**: `app/page.tsx` line 41 (`PROLOGUE_KEY = 'remnant_saw_prologue'`), lines 84–108

**What happens**: Whether the player has seen the prologue is tracked in `localStorage` only. If the player clears storage, uses a different browser, or goes incognito, they see the prologue again. For a returning player with an existing save, this means the prologue plays before the game loads — which is mildly disorienting but recoverable (type SKIP).

The DB has a `saw_prologue` column on `players` (per PLAN.md H1 reference) but it is never written or read in this code path. The column is dead schema weight.

**Consequence**: Non-breaking UX issue. The dead DB column is a schema hygiene problem (H1 territory).

---

### I5 — `deathMessages()` passes `xpGained` as `state.player?.xp` (total XP, not cycle XP)

**Location**: `app/page.tsx` lines 150–171

**What happens**: `deathMessages` is called with `xpGained: state.player?.xp ?? 0`. This is the player's total accumulated XP for the current cycle, not XP gained this session or this life. The label "XP Gained" on the death screen is technically "XP at time of death." For Cycle 1 this is identical; for later cycles with echo stats it may be misleading.

**Consequence**: Minor display inaccuracy. Cosmetic only.

---

## Step-by-Step Happy Path Trace

| Step | What Should Happen | Code Location | Result |
|------|-------------------|---------------|--------|
| 1. Auth | OTP login → session | `middleware.ts` gates `/` via `supabase.auth.getUser()`; `app/auth/callback/route.ts` exchanges OTP code; `/login` sends magic link | PASS — middleware correctly redirects unauthenticated requests; callback validates `next` param with `startsWith('/')` |
| 2. Init | `init()` runs, calls `loadPlayer(userId)` | `app/page.tsx` lines 57–121 | PASS — `loadPlayer` returns `false` for new user; `true` for returning |
| 3. Prologue | `prologueMessages()` appended, `gameFlow = 'prologue'` | `app/page.tsx` lines 88–101; `lib/terminalDeath.ts` `prologueMessages()` | PASS — prologue fires correctly for both new and returning users who haven't seen it. WARNING: "press ENTER" prompt is non-functional (see W3) |
| 4. Character creation | 6-step wizard via `terminalCreation.ts` state machine | `lib/terminalCreation.ts` `handleCreationInput()`; `app/page.tsx` lines 252–274 | PASS — state machine handles all steps including validation and RESTART. `createCharacter()` called on `result.done` |
| 5. First room | Room description, exits, NPCs rendered | `lib/gameEngine.ts` `createCharacter()` lines 643–682 | PASS — `startRoom` loaded via `getRoom`, `_applyPopulation()` applied, messages pushed to log including exits and NPC lines |
| 6. Movement | `go north` → `handleMove()` → new room → `_savePlayer()` | `lib/actions/movement.ts` `handleMove()` lines 194–485 | PASS — movement validates direction, loads room, applies population, fires narrative overlays, calls `_savePlayer()` at line 485. Save fires on every move. |
| 7. Combat | `attack` → `handleAttack()` → combat loop | `lib/actions/combat.ts` `handleAttack()` | PASS — combat initializes correctly, enemy HP tracked, death handled via `engine._handlePlayerDeath()` |
| 8. Save | `save` → `_savePlayer()` → upsert to DB | `lib/gameEngine.ts` lines 395–444 | PASS — saves HP, room, XP, stats, faction_reputation, quest_flags, active_buffs, narrative_progress. Retry logic present. User-visible error on retry failure. |
| 9. Reload | `loadPlayer()` restores state | `lib/gameEngine.ts` lines 689–887 | PASS — full state restored: player row, inventory, ledger, stash, visited room count, death state, ending state. RISK: `loadPlayer()` error → silent drop to creation (see B2) |
| 10. Death | HP=0 → `_handlePlayerDeath()` → `playerDead=true` → `gameFlow='dead'` | `lib/gameEngine.ts` lines 450–487; `app/page.tsx` lines 143–172 | PASS — death state set, DB persisted (`hp=0, is_dead=true, total_deaths+1`), death messages pushed after 1500ms delay |
| 11. Between | `BEGIN` in dead phase → `theBetweenMessages()` → `gameFlow='between'` | `app/page.tsx` lines 279–296 | PASS — correct messages, stash items and faction echoes included |
| 12. Rebirth creation | `BEGIN` in between → creation wizard → `createCharacter()` | `app/page.tsx` lines 310–330 | FAIL — calls `createCharacter()` instead of `rebirthWithStats()`. Cycle resets to 1. Echo stats not applied. See B1. |
| 13. Ending | `charon_choice` flag → `setQuestFlag()` → `endingTriggered` → `gameFlow='ending'` | `lib/gameEngine.ts` lines 1209–1286; `app/page.tsx` lines 176–192 | PASS — ending detection fires, 3s delay, ending messages rendered correctly for all 4 endings |
| 14. Ending BEGIN | `BEGIN` → delete all rows → `window.location.reload()` | `app/page.tsx` lines 340–349 | PASS with caveat — correct delete order, but no error handling (see W2) |

---

## Summary verdict: NO-GO

**One BLOCKER is release-critical**: B1 (rebirth resets cycle to 1 via `createCharacter` instead of `rebirthWithStats`) breaks the Revenant loop — the game's core progression mechanic. A player who dies and rebirths loses their cycle number, echo stats, faction inheritance, and cycle history. This is reproducible on every death.

**B2** (DB error at load silently destroys save) is a data-safety BLOCKER that should be fixed before production — any transient DB outage during page load can trigger overwrite of existing player data.

**B3** is a stuck-state risk on an already-broken code path; it becomes relevant once B1 is fixed.

The warnings (W1–W5) are not individually blocking but W2 (delete without error handling) adds risk to the ending flow.

**Minimum viable fix**: Wire rebirth `BEGIN` in `page.tsx` `between` handler to call `engine.rebirthWithStats(...)` on creation complete, and add a guard in the `init()` catch block to show an error + reload option instead of silently starting character creation.
