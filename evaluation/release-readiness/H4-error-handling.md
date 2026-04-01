# H4 — Error Handling + Edge Cases

**Date**: 2026-03-31
**Auditor**: H4 Howler (Sonnet)
**Files read**: `lib/gameEngine.ts`, `app/page.tsx`, `lib/gameContext.tsx`, `lib/parser.ts`, `lib/actions/items.ts`, `lib/actions/craft.ts`, `lib/actions/trade.ts`, `lib/actions/survival.ts`, `components/ErrorBoundary.tsx`, `lib/supabaseMock.ts`

---

## BLOCKERS

---

### B1 — `loadPlayer()` throws on DB error → silently drops to character creation

**Location**: `lib/gameEngine.ts` ~line 700; `app/page.tsx` ~line 111
**Severity**: BLOCKER

`loadPlayer()` throws `new Error('Failed to load player: ...')` on any Supabase error. In `app/page.tsx`, the `init()` function's catch block responds by starting character creation:

```ts
} catch {
  // Failed to load player — start creation
  const cs = initialCreationState()
  setCreationState(cs)
  engine._appendMessages(creationPrompt(cs))
  if (!cancelled) setAuthPhase('creating')
}
```

**What this means**: A transient network blip, a Supabase timeout, or an expired JWT at page load causes an existing player to lose their save access entirely and land in the character creation wizard with no warning. The player sees the creation prompts and has no indication anything went wrong. If they proceed, `createCharacter()` attempts to upsert their player row — which would overwrite their existing save.

**What the correct behavior should be**: The catch block should display an error message to the player ("Failed to load your save — check your connection and reload") and set `authPhase` to a holding state, not to `creating`. Character creation should never be triggered by a DB error when `userId` is known.

**Additional note**: `loadPlayer()` also throws `new Error('Current room not found')` if `getRoom()` returns null after loading the player row. This path has the same effect.

---

### B2 — No command queue — rapid input fires overlapping async dispatches

**Location**: `lib/gameContext.tsx` lines 48–53; `app/page.tsx` `handleCommand` callback
**Severity**: BLOCKER

`dispatch` calls `engine.executeAction(action)` with no concurrency guard:

```ts
const dispatch = useCallback(
  async (action: Action) => {
    await engine.executeAction(action)
  },
  [engine],
)
```

The `CommandInputWrapper` `submit()` function does `await onSubmit(trimmed)`, but the input value is cleared immediately before `await`, allowing the player to type and submit again before the prior dispatch resolves. In `app/page.tsx` `handleCommand`, there is also no lock: the function is async but nothing prevents it from being entered concurrently.

**What this means**: Rapid commands (e.g. pressing Enter twice quickly during combat) spawn two simultaneous calls into `executeAction()`. Both read the same initial `this.state`, both mutate it independently, and the second write wins with potentially stale data (e.g., double-spending HP, double-awarding XP, or double-applying stat buffs). During combat this could allow a player to kill an enemy twice and get double loot.

**What the correct behavior should be**: A `isDispatching` ref or command queue in `GameContext` should prevent concurrent dispatches. The input should be visually disabled while a command is processing.

---

### B3 — `CONFIRM RESTART` has no second confirmation and no error handling

**Location**: `app/page.tsx` lines 213–225
**Severity**: BLOCKER

The CONFIRM RESTART sequence (which deletes all player data) is a single-step command that can be typed in **any game phase** — including the normal playing phase, during combat, mid-dialogue, and even on the death screen. There is no second prompt ("Are you sure? Type CONFIRM RESTART again"), no countdown, and no undo path.

```ts
if (trimmed.toUpperCase() === 'CONFIRM RESTART') {
  // ... immediately deletes player_inventory, player_ledger, player_stash, generated_rooms, players
  window.location.reload()
  return
}
```

Additionally, the five delete operations have **no error handling**. If any delete fails (network error, RLS issue), the function continues to `window.location.reload()`. On reload, `loadPlayer()` may find a partially-deleted player row still in the DB and restore them to a corrupted state (player row exists but inventory/stash/rooms are gone).

**Compounding risk**: The command is checked before the `if (gameFlow === 'prologue')` block, meaning it works even during the prologue phase when a new player may not understand what it does. The RESTART command (which only shows the restart instructions screen) exists separately — but CONFIRM RESTART bypasses all of it.

**What the correct behavior should be**: (1) Two-step confirmation required. (2) All deletes should be wrapped in try/catch with user-visible failure message. (3) The command should be disabled during normal gameplay phases or require the player to have seen the restart warning first.

---

### B4 — Ending snapshot persist failure is silent; ending progress is lost permanently

**Location**: `lib/gameEngine.ts` ~line 1217–1225
**Severity**: BLOCKER

When the player triggers an ending via `charon_choice`, the game saves a cycle snapshot to `player_ledger`:

```ts
const { error: snapshotError } = await supabase2
  .from('player_ledger')
  .update({ cycle_history: cycleHistory, discovered_enemies: ... })
  .eq('player_id', player.id)
if (snapshotError) console.error('Failed to persist ending snapshot:', snapshotError.message)
```

The UI then proceeds to show ending messages and deletes the player row on BEGIN. If the snapshot persist failed (network error, expired token), the cycle history is permanently lost — not recoverable. The player completed the game, but their ending achievement and cycle progression are gone from the ledger.

Additionally, the `ending_triggered` quest flag is persisted inside a `setTimeout` callback (lines 1271–1283) with error handling that falls through to setting `endingTriggered: true` in local state — but the DB persist failure is only `console.error`. If the persist fails and the player reloads before clicking BEGIN, the game reloads without the `ending_triggered` flag and the ending state is lost.

**What the correct behavior should be**: Ending snapshot and quest flag persist should retry on failure (same pattern as `_savePlayer`). On failure, the player should see a warning and be instructed to save before proceeding. The ending BEGIN should not delete player data until the persist succeeds.

---

## WARNINGS

---

### W1 — `_savePlayer()` retry failure shows warning but game state appears normal

**Location**: `lib/gameEngine.ts` lines 439–442
**Severity**: WARNING

After both the initial save and the retry fail, the code does show a user-visible message:

```ts
this._appendMessages([systemMsg('⚠ Save failed. Your session may have expired — try reloading the page.')])
```

This is better than silent failure. However, the warning uses `systemMsg` which renders as a plain terminal line — it does not visually distinguish itself from normal game messages in the terminal flow. A player mid-combat reading fast may miss it. There is also no indication of which actions are unsaved since the last successful save.

**Recommendation**: Use `errorMsg` type for save failure messages. Consider tracking `lastSuccessfulSave` timestamp and showing it on the next `save` command so the player knows what is at risk.

---

### W2 — `adjustReputation()` persist failure is silent — reputation change lost on DB error

**Location**: `lib/gameEngine.ts` ~line 1146
**Severity**: WARNING

```ts
const { error } = await supabase.from('players').update({ faction_reputation: newFactionRep }).eq('id', player.id)
if (error) console.error('Failed to persist reputation:', error.message)
```

The in-memory state is updated optimistically before the persist. If the persist fails, the player sees the reputation change message in the terminal but the change is not saved. On next page reload, the old reputation is restored from the DB. The player has no way to know the change did not persist.

**Recommendation**: On persist failure, show a user-visible warning (same as the save retry warning). Optionally revert the in-memory state to avoid the optimistic/actual divergence.

---

### W3 — `setQuestFlag()` persist failure is silent — quest progress lost on DB error

**Location**: `lib/gameEngine.ts` ~line 1192
**Severity**: WARNING

Same pattern as W2. `quest_flags` updates are optimistic with a console-only error on failure. Quest flags gate NPC dialogues, endings, and act transitions. A silent failure here means the player's quest progress diverges from the DB silently.

```ts
if (flagError) console.error('Failed to persist quest flag:', flagError.message)
```

**Recommendation**: Same as W2.

---

### W4 — Death persist failure is silent — death count and cycle history not saved

**Location**: `lib/gameEngine.ts` ~lines 469–486
**Severity**: WARNING

`_handlePlayerDeath()` logs errors to console only:

```ts
if (deathError) console.error('Failed to persist death:', deathError.message)
if (ledgerError) console.error('Failed to persist cycle history:', ledgerError.message)
```

If the DB is unavailable when the player dies, `is_dead: true` and `total_deaths` are not persisted. On page reload after a crash, `loadPlayer()` will find the player alive with the pre-death state — though HP is presumably already at 0 in the DB from the last `_savePlayer()` call. The cycle history snapshot will be missing from the ledger, affecting future echo stats and faction inheritance.

**Recommendation**: Death persist should retry once with session refresh (same pattern as `_savePlayer`). Show a warning if the retry also fails.

---

### W5 — Stash operations have no error handling on Supabase calls

**Location**: `lib/actions/items.ts` lines 355–396 (handleStash), 408–448 (handleUnstash), 451–478 (handleStashList)
**Severity**: WARNING

All stash operations use the `{ data }` destructuring pattern without `{ data, error }`. Any Supabase failure (network issue, RLS violation, timeout) causes the operation to silently fail or use empty data:

- `handleStash`: The capacity check `{ count }` ignores errors — a failed count query returns `count = null`, which evaluates to `(null ?? 0) >= 20` = false, so the stash check always passes on error. Then the `{ data: existing }` check on the existing-item query also ignores errors. If the upsert/insert fails, the item is already removed from inventory via `removeItem()` — the item is gone from both inventory and stash.
- `handleUnstash`: `{ data: stashRows }` ignores errors. If the query fails, `stashRows` is null, the item is not found, and the player sees "That's not in your stash." No item loss here, but misleading message.
- `handleStashList`: `{ data: stashRows }` ignores errors. Empty list shown when DB is unavailable.

**The most dangerous case** is `handleStash`: if the insert/update to `player_stash` fails after `removeItem()` completes, the item is permanently lost from both inventory and stash with no error message.

**Recommendation**: Wrap stash DB operations in try/catch or check the `error` return. For `handleStash` specifically, the item removal should happen only after confirming the stash insert succeeded (or use a DB transaction).

---

### W6 — `rebirthCharacter()` and `rebirthWithStats()` DB operations have no error handling

**Location**: `lib/gameEngine.ts` ~lines 926–979, 1035–1085
**Severity**: WARNING

Both rebirth paths execute multiple Supabase operations (player update, ledger update/insert, inventory delete) with no error checking. The calls use bare `await supabase.from(...).update(...)` without destructuring `{ error }`. If any step fails mid-sequence, the player is in a partially reset state: e.g., player row updated to cycle 2 but inventory not cleared, or ledger not updated. The subsequent `loadPlayer()` call will load this inconsistent state.

**Recommendation**: Check error returns on each DB operation. If a critical step fails, show an error message and do not proceed to `loadPlayer()`.

---

### W7 — `deathPendingRef` race condition on component unmount

**Location**: `app/page.tsx` lines 143–172
**Severity**: WARNING

The death detection uses a `setTimeout` of 1500ms:

```ts
const t = setTimeout(() => {
  setGameFlow('dead')
  engine._appendMessages(deathMessages(...))
  deathPendingRef.current = false
}, 1500)
```

The cleanup function runs `clearTimeout(t)` and resets `deathPendingRef.current = false`. However, if the component unmounts between when `deathPendingRef.current` is set to `true` and when the timeout fires, the `deathPendingRef.current = false` in the cleanup runs before the timeout callback. The timeout fires on the unmounted component and calls `setGameFlow` and `engine._appendMessages` — `_appendMessages` mutates engine state (which persists beyond unmounts) and triggers listeners on the already-unmounted component. React 18 does not throw on setState after unmount, but it can cause stale state on remount.

**Recommendation**: The cleanup should cancel the timeout and guard against calling `setGameFlow` if cancelled (the `cancelled` ref pattern used in `init()` should be applied here too).

---

### W8 — `SEAL` ending uses nested `setTimeout` without cleanup — state corruption risk

**Location**: `lib/gameEngine.ts` lines 1235–1268
**Severity**: WARNING

The SEAL ending sequence uses nested `setTimeout` callbacks (3000ms outer, 2000ms inner) with no cancellation mechanism. These are called inside `setQuestFlag()` which has no lifecycle awareness. If the player triggers a page reload or the component unmounts during these 5 seconds, the timeouts fire on a stale engine instance and attempt DB operations and state mutations on a dead session.

The inner timeout calls `supabase.from('players').update(...)` with the captured `player` variable from the closure — this is the player at the time `setQuestFlag` was called, not the current player. If the player's state has changed in the interim (e.g., they somehow issued another command during the countdown), the update uses stale data.

**Recommendation**: Store the timeout IDs and provide a cleanup method. The ending trigger flow should use a more explicit state machine rather than nested timeouts.

---

### W9 — Trade and buy/sell operations have no error handling on DB calls

**Location**: `lib/actions/trade.ts` lines 259–262, 323–325
**Severity**: WARNING

`handleBuy` and `handleSell` call `removeItem()` and `addItem()` without checking errors. Both of these call into `lib/inventory.ts` which makes Supabase calls. If the DB is unavailable, the item is neither removed nor added, but the terminal messages confirm the transaction. On the next `getInventory()` call the real state is restored, but the player has seen a "You buy X" message that did not occur.

**Recommendation**: Wrap in try/catch and show error message on failure. Do not show the transaction success message until after DB calls confirm.

---

### W10 — `crafting` item consumption occurs before success check

**Location**: `lib/actions/craft.ts` lines 62–81
**Severity**: WARNING

Components are consumed regardless of craft success or failure:

```ts
// Consume components regardless of success
for (const comp of recipe.components) {
  for (let i = 0; i < comp.quantity; i++) {
    await removeItem(...)
  }
}
```

This is by design (the comment says so), but if `removeItem()` fails (DB unavailable), the component is not consumed but the code proceeds to `addItem(result.itemProduced)`. If `addItem()` also fails, the player loses the components from local state but neither remove nor add persists. On reload, items return to their persisted state. The bigger risk: if `removeItem()` fails partway through (e.g., fails on the second component), partial components are consumed. There is no transaction atomicity.

**Recommendation**: Craft operations should be wrapped in error handling. The "consume regardless" design is intentional but the silent failure path on DB error should be documented clearly.

---

### W11 — No input length limit on command input

**Location**: `app/page.tsx` `CommandInputWrapper` lines 477–494
**Severity**: WARNING

The `<input>` element has no `maxLength` attribute. A player can type or paste an arbitrarily long string. The parser calls `normalized.split(/\s+/)` and `levenshtein(lower, v)` on the input. The Levenshtein function has O(m×n) complexity — for a string of length 10,000 against the longest verb (~15 chars), this runs 150,000 iterations per verb candidate, with ~70 candidates = ~10.5M iterations synchronously on the main thread.

While this requires intentional abuse, it could freeze the tab temporarily and is worth guarding.

**Recommendation**: Add `maxLength={200}` to the input element.

---

### W12 — No protection against browser back/forward navigation

**Location**: `app/page.tsx`
**Severity**: WARNING

The game is a single-page app at `/`. Using the browser Back button (after navigating away) or Forward button does not trigger a component remount in Next.js App Router by default — the cached RSC payload may be served. This could result in a stale game state being rendered after navigation. The `useEffect` with `engine.loadPlayer()` will re-run on true navigation back, but page.tsx is a client component so bfcache behavior applies.

More critically: if the player opens the login page in the same tab (by navigating away) and then navigates back, the browser may restore the old game page from bfcache with `authPhase: 'ready'` and `gameFlow: 'playing'`, even though the session may have expired during the away time.

**Recommendation**: Consider adding `window.addEventListener('pageshow', ...)` to detect bfcache restores and re-run auth validation.

---

### W13 — Multiple tabs: two instances of the game share the same DB rows

**Location**: Architecture concern — no tab coordination mechanism
**Severity**: WARNING

If a player opens the game in two browser tabs, both tabs load the same player from the DB. Both tabs can dispatch commands independently, each optimistically updating their local engine state and then persisting to Supabase. The last write wins. Concurrently moving in two tabs will result in the player's `current_room_id` flip-flopping between the two tabs' chosen rooms, with neither tab aware of the other's changes.

There is no tab lock, no `localStorage` mutex, no Supabase Realtime subscription, and no last-write-wins conflict detection.

**Recommendation**: Add a `localStorage` lock (`remnant_active_tab`) on load, detect multiple tabs, and show a warning message if a second tab opens. Alternatively, use Supabase Realtime to subscribe to player row changes and warn on external modification.

---

## INFO

---

### I1 — `loadPlayer()` throws `'Current room not found'` with no user message

**Location**: `lib/gameEngine.ts` ~line 783
**Severity**: INFO

If a player's `current_room_id` references a room that no longer exists (e.g., a room removed in a code update), `getRoom()` returns null and `loadPlayer()` throws. The `init()` catch block in `app/page.tsx` sends the player to character creation (see B1). This is a data migration concern — if room IDs are ever renamed, existing players will hit this path.

---

### I2 — `ErrorBoundary` shows error message in production but no error ID / reporting

**Location**: `components/ErrorBoundary.tsx`
**Severity**: INFO

The `ErrorBoundary` component shows the raw `error.message` to the player and logs to `console.error`. There is no error reporting to an observability backend (e.g., Sentry, Vercel's built-in logging). A player hitting the "SYSTEM MALFUNCTION" screen generates no server-side signal.

The boundary wraps the entire `GamePage` — it will catch any unhandled thrown error from the React render tree. It will NOT catch errors in async event handlers (like `handleCommand`) since those are not in the render lifecycle. The `handleCommand` function has its own try/catch at line 366, so the boundary is a belt-and-suspenders fallback for synchronous render errors only.

---

### I3 — Auth error on load: `signOut()` is called even when `data.user` might exist

**Location**: `app/page.tsx` lines 66–69
**Severity**: INFO

```ts
const { data, error: authError } = await supabase.auth.getUser()
if (authError && !data.user) {
  await supabase.auth.signOut()
}
user = data.user
```

The condition `authError && !data.user` is correct — it only signs out when there is both an error and no user. However, the `signOut()` call has no error handling and its return value is ignored. If `signOut()` fails, the player is in an ambiguous auth state with no feedback.

---

### I4 — `createCharacter()` throws on stat validation failure — user sees raw error message

**Location**: `lib/gameEngine.ts` lines 553–559; `app/page.tsx` lines 265–271
**Severity**: INFO

If stat validation fails (e.g., a bug in the creation wizard submits invalid stats), `createCharacter()` throws with messages like `"Stat vigor out of range (2–8)"`. The `app/page.tsx` catch block renders this as:

```ts
text: `Character creation failed: ${err instanceof Error ? err.message : 'Unknown error'}`
```

The raw error message is somewhat technical but not harmful to show. However, a DB failure message (`"Failed to create character: duplicate key value violates unique constraint"`) is less friendly. Consider sanitizing DB error messages for user display.

---

### I5 — No Supabase client-side timeout configured

**Location**: `lib/supabase.ts` (not directly read, inferred from `createSupabaseBrowserClient` usage)
**Severity**: INFO

The Supabase JS client does not impose a default timeout on individual queries. In poor network conditions, a `_savePlayer()` call, a `loadPlayer()` call, or a stash operation could hang indefinitely with no user feedback. The page shows no loading indicator during most DB operations (the `state.loading` flag is set during load/create/rebirth but not during `_savePlayer()` or individual action handler DB calls).

**Recommendation**: Consider using `AbortController` with a 10-second timeout on critical DB calls, or at minimum show a loading indicator during `_savePlayer()`.

---

### I6 — `supabaseMock.ts` still includes `game_log` table in `freshTables()`

**Location**: `lib/supabaseMock.ts` line 19
**Severity**: INFO (cross-reference with H1)

The `game_log` table was dropped in production by `20260329000001_rls_world_state.sql`. The mock's `freshTables()` still includes it, meaning any code that writes to `game_log` in dev mode succeeds silently. A search of the codebase for `game_log` would confirm whether any production code path still references this table — if so, it would fail silently in production while succeeding in dev. This is a dev/prod divergence risk.

---

### I7 — `handleRestart()` outputs instructions but CONFIRM RESTART works globally

**Location**: `app/page.tsx` lines 295–301; `lib/actions/system.ts`
**Severity**: INFO

The `restart` / `RESTART` command calls `handleRestart()` which outputs the CONFIRM RESTART instructions. This is the intended two-step flow for the restart case. However, `CONFIRM RESTART` is checked globally (before phase routing) and works even if the player has never typed RESTART first — a player who discovers CONFIRM RESTART by accident (e.g., from a walkthrough, from typing it in the wrong context) triggers a full data wipe without the warning. This is partially mitigated by the unusual phrasing, but see B3 for the full blocker assessment.

---

## Summary Verdict: NO-GO

**BLOCKER count: 4**
**WARNING count: 13**
**INFO count: 7**

### Blockers that must be resolved before release:

| ID | Issue | Risk |
|---|---|---|
| B1 | DB timeout at load → silently starts character creation | Existing saves can be overwritten by a transient network error |
| B2 | No command queue → concurrent dispatches on rapid input | Double-spending HP/XP/loot; state corruption in combat |
| B3 | CONFIRM RESTART: no second confirmation, no error handling, works globally | Accidental save wipes; partial-delete corruption on network error |
| B4 | Ending snapshot persist failure silent; ending state not guaranteed before data delete | Player completes game, clicks BEGIN, loses all ending data permanently |

### Top warnings to address before release (in priority order):

1. **W5** — Stash operations can destroy items permanently on DB error (item leaves inventory, never reaches stash)
2. **W6** — Rebirth DB operations have no error handling; partial resets leave player in corrupted state
3. **W1** — Save failure warning uses system message type, easily missed mid-action
4. **W2/W3** — Reputation and quest flag persist failures are invisible to the player
5. **W13** — Multiple tabs silently corrupt each other's game state

The four blockers represent real data-loss and state-corruption risks that are triggered by plausible conditions (network instability, rapid typing, discovering the restart command). They should be fixed before the game goes public.
