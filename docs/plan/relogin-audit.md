# Re-login Path Audit — Returning Player Flow

**Audited by:** Howler 3 — Phase 4b  
**Date:** 2026-04-23  
**Files reviewed:** `app/page.tsx`, `app/auth/callback/route.ts`, `app/login/page.tsx`, `lib/gameEngine.ts` (`loadPlayer`, `_savePlayer`, `rebirthWithStats`, `rebirthCharacter`), `lib/world.ts`, `lib/supabaseMock.ts`

---

## (a) Happy Path — Returning Player Login

Scenario: player with cycle ≥ 2, saves, logs out, closes browser, returns one week later.

**Step 1 — Session restoration**  
Supabase auth is cookie-based (`@supabase/ssr` via `createServerClient`). The auth callback (`app/auth/callback/route.ts:37`) exchanges the OTP code for a session and stores it in HTTP cookies using `cookieStore.set`. On next visit, the browser sends the cookie; the `createSupabaseBrowserClient()` picks it up automatically. Access tokens expire in ~1 hour but the refresh token (60-day default) is stored in the same cookie. `supabase.auth.getUser()` in `app/page.tsx:121` triggers an implicit refresh if the access token is stale. After 60 days, both tokens expire; the user is redirected to `/login`.

**Step 2 — AuthPhase transition**  
`init()` calls `supabase.auth.getUser()`. On success, `user.id` is set and `attemptLoad(user.id)` is called. `setAuthPhase('loading-player')` fires immediately. `engine.loadPlayer(userId)` is awaited.

**Step 3 — `loadPlayer()` DB hydration** (`lib/gameEngine.ts:693`)  
Queries `players` table for the row. Reconstructs `Player` object from DB columns including: all six stats, hp/maxHp, currentRoomId, xp, level, actionsTaken, cycle, totalDeaths, isDead, factionReputation, questFlags, active_buffs, pending_stat_increase, narrative_progress (hollowPressure + narrativeKeys). Concurrently fetches the current room (via `getRoom`) and inventory. Then sequentially fetches the ledger (cycleHistory, discoveredRoomIds), stash, and a count of visited rooms.

**Step 4 — Room restoration**  
`getRoom(player.currentRoomId, userId)` loads from `generated_rooms` table. The `rowToRoom()` helper merges DB-persisted mutable state (visited, flags, items, enemies) with the static room definition (descriptions, richExits, extras). The player resumes exactly in the room where they saved.

**Step 5 — Auth phase ready**  
`loadPlayer()` returns `true`. Back in `page.tsx:66`, if `sawPrologue` (localStorage `remnant_saw_prologue`) is set, `gameFlow` stays `'playing'` and `setAuthPhase('ready')` fires. If NOT set (new browser), `gameFlow` is set to `'prologue'` and messages are appended — see Bug #1 below.

---

## (b) Identified Gaps / Bugs — Ranked by Severity

### Bug #1 — MEDIUM: Cycle 2+ players always see prologue on a new browser

**Location:** `app/page.tsx:68–74`  
**Severity:** Medium — cosmetically disorienting, functionally safe.

The prologue gate is:
```ts
const sawPrologue = isDevMode() || localStorage.getItem(PROLOGUE_KEY)
```

There is no `player.cycle > 1` bypass. A player on cycle 3, opening the game in a new browser (cleared storage, new device, private window), sees the prologue as if they were a brand-new player. The task description references a `player.cycle > 1` guard that was planned but never implemented.

After the player types SKIP, `gameFlow` transitions to `'playing'` and — because `state.initialized && state.player` are truthy — no character creation is started. The player resumes their game correctly. However, the disorientation is real, and on mobile where localStorage is frequently cleared, this is a frequent occurrence.

**Fix:** Add `player.cycle > 1` as an additional condition to skip the prologue for established players. The `loadPlayer()` call completes BEFORE the prologue check (line 64 resolves first), so `loaded.cycle` is available from the returned player object. The engine's state machine is the authority here.

### Bug #2 — LOW: `discoveredRoomIds` in the ledger is never populated during normal play

**Location:** `lib/gameEngine.ts:814` (loaded), `lib/world.ts:234` (markVisited)

`markVisited()` updates `generated_rooms.visited = true` for the specific room. But `player_ledger.discovered_room_ids` (a JSONB array) is **never written to** during normal gameplay. It is read at line 814 to populate `ledger.discoveredRoomIds`, which is then used by `lib/actions/items.ts:605` to compute exploration progress (the JOURNAL command).

For any cycle-1 player, `discoveredRoomIds` will always be `[]` because it is only written in the death path (`_handlePlayerDeath` writes to `player_ledger` but only updates `cycle_history` and `discovered_enemies`, not `discovered_room_ids`). The exploration-progress display in the journal will always show 0 rooms discovered regardless of how much the player has explored.

This is a pre-existing gap. The column exists in the schema (migration `20260327000001_cycle_system.sql:17`), the load path reads it, but nothing writes to it during play.

**Fix:** In `markVisited()`, also append the roomId to `player_ledger.discovered_room_ids` if not already present. Or, compute this on-the-fly from `generated_rooms` at journal time rather than from the stale ledger column. The simpler fix is to calculate from the live DB count of visited rooms, which is already done for `roomsExplored` (line 847–851), and bypass the stale ledger array for journal display.

### Bug #3 — LOW: `authError && data.user` case proceeds without session refresh

**Location:** `app/page.tsx:121–125`

When `getUser()` returns both `authError` and a non-null `data.user`, `signOut()` is skipped (correct — this is a network validation failure, not a bad session). However, the game proceeds to `loadPlayer()` without attempting a session refresh first. If the error indicates a genuinely expired token that the client has not yet auto-refreshed, the subsequent DB query may also fail, landing the player in `load-error` state. The `_savePlayer()` function correctly calls `refreshSession()` before retrying, but this pattern is absent from the load path.

In practice, `@supabase/ssr` auto-refreshes on requests made through the Supabase client, so this scenario is rare. No crash occurs — the player just sees the `load-error` UI and must RETRY.

### Bug #4 — NOTE: `shortDescription` vs full description on reload (by design)

**Location:** `lib/gameEngine.ts:872`

On `loadPlayer()`, the room description uses `currentRoom.visited ? currentRoom.shortDescription : fullDescription`. If a player save-quits in a visited room, they see the short description on reload (correct — they've been there). This is intentional and correct.

---

## (c) Recommended Fixes

### Fix 1 (implemented in this PR): cycle > 1 prologue bypass

In `app/page.tsx`, after `loadPlayer()` returns `found = true`, the player object is now in engine state. Retrieve `engine.getState().player?.cycle ?? 1` and use it as an additional bypass condition alongside the localStorage check.

```ts
// Before (app/page.tsx:68-74):
const sawPrologue =
  isDevMode() ||
  (typeof window !== 'undefined' && localStorage.getItem(PROLOGUE_KEY))

// After:
const loadedPlayer = engine.getState().player
const sawPrologue =
  isDevMode() ||
  (typeof window !== 'undefined' && localStorage.getItem(PROLOGUE_KEY)) ||
  ((loadedPlayer?.cycle ?? 1) > 1)
```

This is a one-line safety net: cycle 2+ players always bypass the prologue. Cycle 1 players still see it unless localStorage is set.

### Fix 2 (not implemented — out of scope): populate `discovered_room_ids`

Either wire `markVisited()` to also JSONB-append to `player_ledger.discovered_room_ids`, or change journal exploration-progress to query `generated_rooms WHERE visited = true COUNT(*)` instead of reading the stale ledger array.

### Fix 3 (not implemented): session refresh before load

Add `await supabase.auth.refreshSession()` before `attemptLoad()` when `authError` is non-null, paralleling `_savePlayer()`'s retry logic.
