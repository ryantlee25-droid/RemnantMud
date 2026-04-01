# Release TODO — Post-Launch Fixes

These issues were identified in the release readiness audit (2026-04-01)
and deferred from the initial launch. Fix this week.

> Blockers B1–B4 were resolved before launch:
> B1 rebirth wired to rebirthWithStats, B2 loadPlayer error no longer silently starts creation,
> B3 command queue added to prevent concurrent dispatch, B4 CONFIRM RESTART requires double-confirm.

---

## One-Command Fixes (trivial — do these first)

```bash
# B11 — Set DEV_MODE explicitly in Vercel (safe by default but must be declarative)
vercel env add NEXT_PUBLIC_DEV_MODE production <<< "false"
vercel env add NEXT_PUBLIC_DEV_MODE preview   <<< "false"

# H1-W1 / H4-I6 — Remove dropped game_log table from dev mock so it fails fast
# (edit lib/supabaseMock.ts and delete the `game_log: []` line from freshTables())

# H2-W2 — Remove dangling service role key from .env.local (unused in all app code)
# grep -n SUPABASE_SERVICE_ROLE_KEY .env.local   → then delete that line

# H2-W3 / H5-W9 — Add HSTS and Permissions-Policy to vercel.json
# (see Security/Config section below for exact JSON)
```

---

## Data Integrity

- [ ] **B5** — Ending snapshot persist failure is silent (HIGH)
  File: `lib/gameEngine.ts` ~line 1217
  Issue: `charon_choice` handler calls `supabase.from('player_ledger').update({ cycle_history, discovered_enemies })`;
  on error it only calls `console.error`. The ending `BEGIN` then deletes the player row regardless.
  If the snapshot persist failed, the entire cycle history — echoes, faction inheritance, ending achievement — is
  permanently gone. No retry, no user warning, no guard before delete.
  Fix: apply the same retry-with-session-refresh pattern used in `_savePlayer()` (line ~430). On retry failure,
  show a user-visible warning and block the `BEGIN`→delete path until the persist succeeds or the player
  explicitly acknowledges data loss.

- [ ] **B6** — handleStash removes item before confirming DB insert (HIGH)
  File: `lib/actions/items.ts` ~line 368 (handleStash), ~line 429 (handleUnstash)
  Issue: `handleStash` calls `removeItem()` (which mutates inventory state) and then calls
  `supabase.from('player_stash').insert(...)` without destructuring `{ error }`. If the insert fails,
  the item has already left inventory and never reached stash — permanently lost with no error shown.
  `handleUnstash` has the symmetric problem: if stash delete fails but `addItem` already ran, the item
  exists in both inventory and stash (duplicate).
  Fix: check `{ error }` on every stash Supabase call. In `handleStash`, perform the stash insert first;
  only call `removeItem` after confirming success. Show a user-visible error on failure and do not mutate
  inventory.

---

## Schema Cleanup

- [ ] **B7** — `saw_prologue` DB column is orphaned — decision required (MEDIUM)
  File: `supabase/migrations/20260326000005_narrative.sql` (column definition)
        `app/page.tsx` line 41 (localStorage usage)
  Issue: Migration adds `saw_prologue BOOLEAN NOT NULL DEFAULT false` to `players`. App code uses
  `localStorage` key `remnant_saw_prologue` exclusively. The column is never read in `loadPlayer()`
  and never written in `_savePlayer()` or `createCharacter()`. The two diverge silently — a player
  on a new device sees the prologue again despite it being "tracked."
  Fix (choose one):
  (a) Drop the column: write `ALTER TABLE players DROP COLUMN saw_prologue;` migration and document
      localStorage-primary as intentional.
  (b) Migrate to DB-primary: read `saw_prologue` in `loadPlayer()`, write it in `_savePlayer()` and
      `createCharacter()`, remove localStorage usage.
  (c) Document explicitly: add a code comment in `loadPlayer()` and `createCharacter()` stating
      "saw_prologue column intentionally unused — localStorage is authoritative for this flag."

- [ ] **B8** — `faction_reputation_best` and `quest_flags_completed` on `player_ledger` are dead schema (MEDIUM)
  File: `supabase/migrations/20260327000005_new_zones.sql` (column definition)
        `lib/gameEngine.ts` `loadPlayer()` / `_savePlayer()` (no reference to these columns)
        `types/game.ts` PlayerLedger interface (missing `factionReputationBest`, `questFlagsCompleted`)
  Issue: Both JSONB columns were added in the new_zones migration but are never written or read by
  application code. The echo/rebirth system uses `cycle_history` snapshots instead (via
  `computeInheritedReputation`). Both columns will remain `{}` permanently.
  Fix (choose one):
  (a) Wire up: add `factionReputationBest` and `questFlagsCompleted` to the `PlayerLedger` TypeScript
      interface in `types/game.ts`; write to them in `_handlePlayerDeath()` / rebirth paths;
      read them in `loadPlayer()`.
  (b) Drop: write a migration dropping both columns if they are superseded by `cycle_history`.
  (c) Document: add a comment in the migration file and in `types/game.ts` explaining they are
      planned-but-unimplemented, with a tracking issue reference.

---

## Security / Config

- [ ] **B9** — `NEXT_PUBLIC_DEV_START_ROOM` has no `isDevMode()` guard (HIGH)
  File: `lib/gameEngine.ts` line 568
  Issue: `process.env.NEXT_PUBLIC_DEV_START_ROOM` is read without checking `isDevMode()`. Because it
  is a `NEXT_PUBLIC_` variable it is compiled into the client bundle and visible to all users. If this
  var is ever set in Vercel production (e.g., during a debugging session), it silently overrides the
  start room for every player on that deployment with no warning or log.
  Fix: wrap the read in `if (isDevMode())`:
  ```ts
  const devOverrideRoom = isDevMode() ? process.env.NEXT_PUBLIC_DEV_START_ROOM : undefined
  ```
  Alternatively, rename to `DEV_START_ROOM` (drop the `NEXT_PUBLIC_` prefix) so it is a server-only
  variable that cannot be compiled into the client bundle.

- [ ] **B10** — `world_state` RLS-with-no-policy is undocumented at the code level (LOW)
  File: `supabase/migrations/20260329000001_rls_world_state.sql`
        `lib/supabase.ts` (no service_role client instantiated anywhere)
  Issue: RLS is enabled on `world_state` with no authenticated or anon policy — only `service_role`
  bypasses it. The migration comment says "service_role only" but no application code creates a
  service_role client (`SUPABASE_SERVICE_ROLE_KEY` is in `.env.local` but unused in all of `lib/`
  and `app/`). Any future developer who queries `world_state` from the browser client will get
  silent empty results — easily mistaken for "no data exists."
  Fix (choose one):
  (a) Add a comment in `lib/supabase.ts` and/or `lib/gameEngine.ts` explaining that `world_state`
      is intentionally inaccessible to the anon client and is reserved for a future service_role
      admin path.
  (b) Drop the table if multiplayer is not planned for this release cycle.
  Also: remove `SUPABASE_SERVICE_ROLE_KEY` from `.env.local` if no server-side service_role client
  is planned, to avoid credential sprawl.

- [ ] **B11** — `NEXT_PUBLIC_DEV_MODE` not explicitly set in Vercel production (LOW)
  File: Vercel project → Settings → Environment Variables
  Issue: `vercel env ls` confirms only `NEXT_PUBLIC_SUPABASE_ANON_KEY` and `NEXT_PUBLIC_SUPABASE_URL`
  are set in production. `NEXT_PUBLIC_DEV_MODE` is absent from all Vercel environments. The app is
  safe by default (`undefined !== 'true'` → dev mode off), but the intent is implicit rather than
  declarative. If `isDevMode()` logic ever changes, the production behavior could shift without a
  visible config change.
  Fix: one CLI command (see top of file). Set `false` for both Production and Preview environments.

---

## Test Coverage

- [ ] **B12** — No save/load round-trip integration test (HIGH)
  File: `tests/integration/` (new file: `save-load-roundtrip.test.ts`)
  Issue: No test exercises the `_savePlayer()` → `loadPlayer()` round-trip against the Supabase mock.
  The two prior production schema bugs (`20260328000002_save_fix.sql` — missing `active_buffs`,
  `pending_stat_increase`, `discovered_enemies`; `20260401000001_add_narrative_progress.sql` — missing
  `narrative_progress` column) were both column-mismatch bugs that would have been caught by this test.
  The mock in `tests/mocks/supabase.ts` already supports `_setFromResult(data, error)` — no new mock
  infrastructure needed.
  Fix: write a test that:
  1. Constructs a fully-populated `Player` object with every field in the `Player` interface
  2. Calls `engine._savePlayer()` and captures the upsert payload via the mock
  3. Configures the mock to return that payload from `select()`
  4. Calls `engine.loadPlayer(playerId)` and asserts the result equals the original object field-for-field
  Effort: ~1 hour. Highest ROI test gap in the suite.

- [ ] **B13** — `SUPABASE_SERVICE_ROLE_KEY` posture is undocumented (LOW)
  File: `.env.local` line 6, Vercel project env vars (key absent from Vercel)
  Issue: The service role key is in `.env.local` on the developer's machine but is not set in Vercel
  and is not referenced anywhere in `lib/` or `app/`. Its intended purpose is undocumented. If a future
  server route ever needs it, the production deployment will fail silently (var absent). If `.gitignore`
  is ever misconfigured, it could be committed.
  Fix (choose one):
  (a) Remove it from `.env.local` and add a comment in `.env.example` noting it is available for
      future server-side admin routes if needed.
  (b) Add it to Vercel scoped to production-only (not preview/development) and add a comment in
      `lib/supabase.ts` explaining when a service_role client should be instantiated.
  Either way: document the decision so the next developer is not left guessing.

---

## High-Severity Warnings (address before end of week)

These are WARNINGs from the audits — not release blockers, but represent real data-loss risk in production.

### Data Loss Warnings

- [ ] **W-reputation** — `adjustReputation()` persist failure is silent
  File: `lib/gameEngine.ts` ~line 1146
  `faction_reputation` is updated in-memory optimistically. On DB error, only `console.error` fires.
  On next page reload, the old reputation is restored from DB. Player saw the change; it did not save.
  Fix: show a `systemMsg` warning on persist failure (same pattern as `_savePlayer` retry warning).

- [ ] **W-questflag** — `setQuestFlag()` persist failure is silent
  File: `lib/gameEngine.ts` ~line 1192
  Quest flags gate NPC dialogues, endings, and act transitions. Silent failure means quest progress
  diverges from DB. On reload, the player's progress is silently rolled back.
  Fix: same as W-reputation — show a user-visible warning on persist failure.

- [ ] **W-death** — Death persist failure is silent; cycle history snapshot lost
  File: `lib/gameEngine.ts` ~lines 469–486
  `_handlePlayerDeath()` logs `deathError` and `ledgerError` to console only. If the DB is
  unavailable at death time, `is_dead: true` and `total_deaths` are not persisted. Cycle history
  snapshot used by echo stats and faction inheritance is also lost.
  Fix: apply one retry (with session refresh) on death persist, matching `_savePlayer` pattern.
  Show a warning if retry also fails.

- [ ] **W-rebirth-errors** — Rebirth DB operations have no error handling
  File: `lib/gameEngine.ts` ~lines 926–979 (rebirthCharacter), ~lines 1035–1085 (rebirthWithStats)
  Multiple Supabase operations (player update, ledger upsert, inventory delete) use bare `await`
  without destructuring `{ error }`. A mid-sequence failure leaves the player in a partially reset
  state (e.g., cycle incremented to 2, but inventory not cleared).
  Fix: check `{ error }` on each DB call. On failure, show an error message and do not proceed to
  `loadPlayer()`.

### Security Warnings

- [ ] **W-middleware-fallback** — Middleware passes all requests on missing env vars
  File: `middleware.ts` lines 32–35
  If Supabase env vars are absent (new preview deployment without vars set), middleware calls
  `NextResponse.next()` instead of redirecting. The page crashes at `createSupabaseBrowserClient()`
  rather than showing the login form — UX degradation, not auth bypass, but still wrong behavior.
  Fix: change fallback from `NextResponse.next()` to
  `NextResponse.redirect(new URL('/login', request.url))`.

- [ ] **W-hsts** — Missing HSTS and Permissions-Policy headers in vercel.json
  File: `vercel.json`
  Add to the headers array:
  ```json
  { "key": "Strict-Transport-Security", "value": "max-age=63072000; includeSubDomains" },
  { "key": "Permissions-Policy", "value": "camera=(), microphone=(), geolocation=()" }
  ```
  CSP can be deferred given the terminal architecture uses typed message objects (no innerHTML).

### UX / Correctness Warnings

- [ ] **W-input-maxlength** — No maxLength on command input (DoS vector)
  File: `app/page.tsx` CommandInputWrapper, the `<input>` element
  Levenshtein fuzzy matching in the parser has O(m×n) complexity. A pasted 10,000-character string
  triggers ~10.5M synchronous iterations and can freeze the tab.
  Fix: add `maxLength={200}` to the input element.

- [ ] **W-prologue-enter** — "Press ENTER to continue" prompt is non-functional
  File: `app/page.tsx` lines 203 and 228–248
  `handleCommand` returns early on empty string (line 203) before reaching the prologue handler.
  The `upper === ''` branch in the prologue handler is unreachable. A player who presses Enter
  with no text sees nothing happen.
  Fix: remove the early return guard for empty input when `gameFlow === 'prologue'`, or change the
  prologue prompt to "type SKIP to continue."

- [ ] **W-game_log-mock** — supabaseMock.ts includes dropped `game_log` table
  File: `lib/supabaseMock.ts` line 18 (the `game_log: []` entry in `freshTables()`)
  The table was dropped in production by `20260329000001_rls_world_state.sql`. The mock divergence
  means dev code that accidentally writes to `game_log` succeeds silently in dev and fails in prod.
  Fix: delete `game_log: []` from `freshTables()`. One line change.

---

## Deferred (post-launch sprint — lower priority)

- [ ] **Test: movement** — `handleMove()` / zone gating / fear checks (H5-W1)
- [ ] **Test: crafting** — `handleCraft()`, `attemptCraft()`, recipe validation (H5-W2)
- [ ] **Test: death→DB** — assert `is_dead=true` persisted; ledger updated on death (H5-W10)
- [ ] **Test: ending→DB** — assert cycle snapshot persisted before player delete (H5-W11)
- [ ] **Test: save retry** — assert retry fires on first-call failure; warning shown on second fail (H5-W8)
- [ ] **Test: narrative modules** — `companionSystem`, `factionWeb`, `narratorVoice`, `playerMonologue` (H5-W5)
- [ ] **Schema: discovered_room_ids** — ledger column is never written after creation; exploration
      journal always shows 0 rooms explored. Either write to it in `markVisited()` or rewrite
      `computeExplorationProgress()` to count from `generated_rooms.visited` instead. (H1-I9)
- [ ] **Multi-tab warning** — two open tabs silently corrupt each other's game state (H4-W13)
      Add a `localStorage` lock on load and warn if a second tab is detected.
