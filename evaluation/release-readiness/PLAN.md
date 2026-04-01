# Release Readiness Evaluation — The Remnant MUD
**Date**: 2026-03-31
**Live URL**: https://y-kappa-green-78.vercel.app
**Stack**: Next.js 16, Supabase (Postgres + Auth + RLS), Vercel, Vitest (417+ tests)
**Planner**: Blue (Sonnet)
**Mode**: Reaping (5 pure-research Howlers, no integration Howler, no shared interfaces)

---

## Executive Context

The Remnant is a single-player post-apocalyptic text MUD with 271 hand-crafted rooms, 4 endings, 18 NPCs, 15 enemy types, and 7 character classes. The game has been through multiple convoy deployments. Recent history:

- `20260328000002_save_fix.sql` — patched `active_buffs`, `pending_stat_increase`, `discovered_enemies` columns missing from DB despite being in code
- `20260329000001_rls_world_state.sql` — enabled RLS on `world_state`, dropped unused `game_log`
- `20260401000001_add_narrative_progress.sql` — patched `narrative_progress` JSONB column missing from `players` table
- `remnant-narrative-0329` convoy — added hollow pressure, NPC initiative, companion system, faction web, player voice, narrator voice
- `remnant-ux-0329` convoy — quest audit, missing items added, terminal UX rewrite

The pattern of "code added, migration forgotten" has occurred twice already. This is the primary schema risk to investigate.

**Known fixed bugs**: save error (missing columns), duplicate key on inventory upsert.

---

## Evaluation Scope — 5 Howlers

All Howlers are pure research — read code and schema, produce findings. No source modifications. No shared TypeScript interfaces between Howlers. Reaping mode applies.

---

## H1 — Database + Schema Audit

**Goal**: Determine if the database schema is fully consistent with application code. Find any columns referenced in code that have no migration, any orphaned columns, and any missing indexes on hot query paths.

**Scope**:

### What to read
- All 21 migration files in `supabase/migrations/` (in timestamp order)
- `lib/gameEngine.ts` — the `_savePlayer()` method (line ~395) and `loadPlayer()` method (line ~689) — these are the canonical lists of every column read/written
- `lib/actions/items.ts` — stash operations (`handleStash`, `handleUnstash`, `handleStashList`) — hits `player_stash` directly
- `lib/inventory.ts` — inventory read/write
- `lib/world.ts` — `room_state` and `generated_rooms` operations
- `lib/echoes.ts` — `cycle_history` on `player_ledger`
- `types/game.ts` — the `Player` and `PlayerLedger` TypeScript interfaces

### What to verify

**Column completeness check** — for each table, cross-reference every column name used in `_savePlayer()` / `loadPlayer()` / DB query code against the cumulative migration history:

| Table | Key columns to verify present in migrations |
|---|---|
| `players` | `vigor`, `grit`, `reflex`, `wits`, `presence`, `shadow`, `character_class`, `actions_taken`, `cycle`, `total_deaths`, `is_dead`, `personal_loss_type`, `personal_loss_detail`, `saw_prologue`, `squirrel_trust`, `squirrel_name`, `faction_reputation`, `quest_flags`, `active_buffs`, `pending_stat_increase`, `narrative_progress`, `hollow_pressure` (check if this one is separate or rolled into `narrative_progress`) |
| `player_ledger` | `cycle_history`, `discovered_enemies`, `squirrel_alive`, `squirrel_trust`, `squirrel_cycles_known`, `squirrel_name`, `faction_reputation_best`, `quest_flags_completed` |
| `player_inventory` | `equipped` column (check constraint `player_inventory_player_item_unique`) |
| `player_stash` | `player_stash_player_item_unique` unique constraint |
| `room_state` | `WITH CHECK` clause on RLS policy (fixed in `20260327000009`) |
| `generated_rooms` | zone constraint covers all 13 zones including `the_pens` |

**Index audit** — identify hot query paths without indexes:
- `player_inventory` queried by `player_id` — index exists?
- `room_state` queried by `(player_id, room_id)` — UNIQUE constraint doubles as index?
- `player_ledger` queried by `player_id` — UNIQUE constraint exists?
- `player_stash` queried by `player_id` — index exists?
- `generated_rooms` queried by `(player_id, id)` — UNIQUE constraint exists?

**Orphaned columns check** — any columns in migrations that no longer appear in application code (dead schema weight):
- `saw_prologue` on `players` — used in DB or only in `localStorage`? (code uses `localStorage` key `remnant_saw_prologue`)
- `game_log` table dropped in `20260329000001` — confirm no code still writes to it (the mock's `freshTables()` still includes `game_log`)
- `world_state` table — marked "not used in single-player MVP" in init migration — confirm no code reads/writes it in production path

**Migration gaps** — the two prior "code without migration" incidents suggest checking:
- `hollow_pressure` as a standalone column vs. being serialized inside `narrative_progress` JSONB — which is authoritative?
- Any columns in the `Player` TypeScript type not accounted for in migrations

**Deliverable**: List of (a) confirmed consistent columns, (b) any column present in code but missing from migrations, (c) any orphaned schema, (d) missing indexes on hot paths. Flag any finding as BLOCKER / WARNING / INFO.

---

## H2 — Auth + Security Audit

**Goal**: Verify auth is correctly gated, RLS policies cover all tables, no secrets are exposed client-side, and dev-mode flags are not present in production.

**Scope**:

### What to read
- `lib/supabase.ts` — client creation, env var validation, dev-mode guard
- `lib/supabaseMock.ts` — `isDevMode()` implementation and the warning on non-localhost domains
- `middleware.ts` — auth enforcement, public route exceptions
- `app/auth/callback/route.ts` — magic-link exchange
- `app/login/page.tsx` — OTP flow
- `app/page.tsx` — client-side auth init, the `init()` function
- `.env.local` — actual values (already confirmed: `NEXT_PUBLIC_DEV_MODE=false`, real Supabase URL/keys present)
- `vercel.json` — security headers
- All migration files for RLS policy completeness

### What to verify

**Dev-mode safety**:
- `NEXT_PUBLIC_DEV_MODE=false` in `.env.local` — confirmed. Verify it is also `false` (or absent) in Vercel env vars for production. The `isDevMode()` check uses `process.env.NEXT_PUBLIC_DEV_MODE === 'true'` — any non-"true" value is safe.
- The `createSupabaseBrowserClient()` warning fires if dev mode is active on a non-localhost domain — confirm this guard is correct and complete.
- `app/page.tsx` `init()` calls `resetDevDb()` in dev mode — confirm this only runs in dev mode, not production.

**RLS policy audit** — check every table has RLS enabled AND correct policies:

| Table | RLS enabled | Policy coverage | Notes |
|---|---|---|---|
| `players` | Migration 001 | `auth.uid() = id` FOR ALL with CHECK | Verify |
| `player_inventory` | Migration 001 | `auth.uid() = player_id` FOR ALL with CHECK | Verify |
| `player_ledger` | Migration 20260327000001 | `auth.uid() = player_id` FOR ALL with CHECK | Verify |
| `room_state` | Migration 004 | Fixed in 20260327000009 to add WITH CHECK | Verify fix applied |
| `generated_rooms` | Migration 001 | `auth.uid() = player_id` FOR ALL with CHECK | Verify |
| `player_stash` | Migration 20260327000002 | `auth.uid() = player_id` FOR ALL with CHECK | Verify |
| `world_state` | Migration 20260329000001 | RLS enabled, NO policy (service_role only) | Intentional — verify |

**Middleware completeness**:
- Public routes: `/login`, `/landing`, `/auth/callback` — plus static assets
- `/` (game page) is gated — correct
- The middleware has a fallback `NextResponse.next()` when Supabase env vars are missing — this is a potential bypass in misconfigured environments. Assess severity.
- `next` redirect param in login URL — is it validated server-side before redirect? (The callback route validates `rawNext.startsWith('/')` — confirm this is sufficient open-redirect protection.)

**Secret exposure**:
- `SUPABASE_SERVICE_ROLE_KEY` — confirm it is NOT referenced in any file under `app/` or `lib/` with `NEXT_PUBLIC_` prefix, and not used in any client component. Search for `service_role` in client-side code.
- `NEXT_PUBLIC_SUPABASE_ANON_KEY` — this is intentionally public (anon key), RLS is the guard. Confirm that's the correct architecture.
- Check `.gitignore` — confirm `.env.local` is excluded from git.

**Security headers**:
- `vercel.json` sets `X-Content-Type-Options: nosniff`, `X-Frame-Options: DENY`, `Referrer-Policy: strict-origin-when-cross-origin`
- Missing: `Content-Security-Policy` (CSP), `Strict-Transport-Security` (HSTS), `Permissions-Policy` — assess risk for production release
- Magic-link email — Supabase handles delivery. No custom SMTP to audit.

**Deliverable**: List of (a) RLS gaps or policy weaknesses, (b) any dev-mode bypass risk, (c) any exposed secrets, (d) missing security headers with severity. Flag each as BLOCKER / WARNING / INFO.

---

## H3 — Gameplay Flow Walkthrough

**Goal**: Trace the complete happy path through source code — new player through to active gameplay — and identify any dead ends, broken transitions, or unhandled state.

**Scope**:

### What to read
- `app/page.tsx` — full auth phase state machine (`'checking' | 'unauthenticated' | 'loading-player' | 'creating' | 'ready'`) and game flow state machine (`'prologue' | 'playing' | 'dead' | 'between' | 'rebirth' | 'ending'`)
- `lib/terminalCreation.ts` — character creation state machine
- `lib/gameEngine.ts` — `createCharacter()`, `loadPlayer()`, `_savePlayer()`, `dispatch()` (the main action dispatcher)
- `lib/actions/movement.ts` — `handleMove()`, `handleLook()`
- `lib/actions/combat.ts` — `handleAttack()`, `handleFlee()`
- `lib/actions/system.ts` — `handleSave()`, `handleStats()`, `handleRestart()`
- `lib/actions/items.ts` — `handleTake()`, `handleDrop()`, `handleEquip()`
- `lib/world.ts` — room loading, world generation
- `lib/terminalDeath.ts` — death, between, rebirth messages
- `data/rooms/index.ts` — confirm start room exists

### Happy path to trace

1. **New user arrives** → middleware redirects to `/login` → user enters email → OTP sent → clicks magic link → `/auth/callback` exchanges code → redirected to `/`
2. **Auth check** → `init()` runs → `supabase.auth.getUser()` succeeds → `engine.loadPlayer(userId)` returns `false` (no player)
3. **Prologue** → `prologueMessages()` rendered → user types SKIP or ENTER → creation starts
4. **Character creation** → `initialCreationState()` → 6-step terminal wizard (name, class, stats, personal loss) → `handleCreationInput()` state transitions → `engine.createCharacter()` called → player row upserted → starting room loaded → `loadPlayer()` called again to populate state
5. **First room** → `handleLook()` fires on load → room description rendered → exits listed → items/enemies/NPCs listed
6. **Movement** → `go north` → `handleMove()` → new room loaded → look fires → `_savePlayer()` called? (check if movement auto-saves)
7. **Combat** → `attack <enemy>` → `handleAttack()` → `startCombat()` → player/enemy turn loop → enemy defeated → loot granted → XP awarded → level-up check
8. **Save** → `save` command → `_savePlayer()` → upsert to `players` table → success confirmation
9. **Reload** → refresh page → `loadPlayer()` → player state restored from DB → correct room, inventory, HP, XP
10. **Death** → HP drops to 0 → `playerDead` state → death messages → `BEGIN` command → between messages → new cycle character creation
11. **Ending** → `charon_choice` quest flag set → `endingTriggered` → ending messages → `BEGIN` → player data deleted → reload

### Edge cases within happy path
- What happens if `createCharacter()` throws? (e.g. DB unavailable) — does the creation wizard reset or hang?
- What happens if `loadPlayer()` returns false after `createCharacter()` succeeds? (line ~978 in gameEngine — throws)
- Is the `cancelled` ref in `init()` properly preventing state updates after unmount?
- Is there a race condition between `authPhase === 'creating' && state.initialized` watcher and the creation form?
- The `CONFIRM RESTART` command deletes all player data without a second confirmation prompt — is this intentional?
- During the ending `BEGIN` flow, the same delete+reload sequence runs — is there a risk of race between delete operations?

**Deliverable**: Step-by-step trace with pass/fail at each transition. List any dead ends, stuck states, or missing guard conditions. Flag BLOCKER / WARNING / INFO.

---

## H4 — Error Handling + Edge Cases

**Goal**: Find unhandled errors, missing recovery paths, and behaviors on network failure, invalid input, and race conditions.

**Scope**:

### What to read
- `lib/gameEngine.ts` — `_savePlayer()` (has retry logic), `loadPlayer()` (throws on error), `dispatch()` (has top-level catch), `createCharacter()` (throws on validation and DB failure)
- `lib/actions/items.ts` — stash operations (no error handling visible on initial scan — check return values)
- `lib/actions/trade.ts` — trade operations
- `lib/actions/survival.ts` — rest/camp operations
- `lib/actions/craft.ts` — crafting operations
- `components/ErrorBoundary.tsx` — last-resort React error boundary
- `app/page.tsx` — `handleCommand()` try/catch, `init()` catch block
- `lib/parser.ts` — input parsing edge cases
- `lib/supabaseMock.ts` — mock's `then()` handler (does it handle all operations gracefully?)

### What to verify

**Supabase failure modes**:
- `_savePlayer()` at line ~430: on error, logs + retries with upsert. If retry also fails, error is logged but game continues silently — player sees no feedback. Is this acceptable UX?
- `loadPlayer()` at line ~700: on error, throws — caught in `app/page.tsx` `init()` catch block, which starts character creation. This means a DB timeout at load time silently drops to character creation even if the player has a save. BLOCKER candidate.
- Stash operations in `items.ts` — initial scan shows no error handling on the Supabase calls (no `error` destructuring). If stash DB call fails, the operation silently fails. Check if this is consistent.
- Reputation persist at line ~1142: on error, logs to console but player sees nothing. Rep change lost. WARNING candidate.
- Quest flag persist at line ~1189: same pattern — silent loss on failure.
- Ending snapshot persist at line ~1218: on error, logs to console. Ending data lost permanently. BLOCKER candidate.

**Network timeout behavior**:
- Supabase client has a default timeout. Check if any operations hang indefinitely or if Next.js/Supabase SDK applies timeouts automatically.
- During character creation, if the upsert at line ~600 hangs, the terminal shows no feedback — player sees a frozen prompt. Is there a loading state or timeout?

**Invalid input handling**:
- Parser handles unknown commands with "Did you mean X?" or generic error — confirm no crash path
- Dialogue input while not in dialogue — `parseDialogueInput()` called only when `activeDialogue` is set
- Commands during prologue/dead/between/ending phases — all have explicit handlers in `handleCommand()`
- Empty input — `if (!trimmed) return` guard present
- Extremely long input — no character limit visible on the input element. Parser may behave unexpectedly.
- Injection via command input — input is rendered as text, not HTML (Terminal uses message objects). Confirm no `dangerouslySetInnerHTML` in Terminal component.

**Race conditions**:
- Multiple rapid commands before async dispatch resolves — `handleCommand` is async but not queued. Rapid clicks/enters could fire overlapping dispatches. Check if `dispatch()` is reentrant-safe.
- Auth state change (e.g. token expiry) mid-session — middleware refreshes on request, but client-side session may expire. Does `createSupabaseBrowserClient()` auto-refresh?
- The `deathPendingRef` guards against double-death but uses `setTimeout` — potential issue if component unmounts during the 1500ms window.

**Mock gaps**:
- `supabaseMock.ts` `freshTables()` still includes `game_log` table even though it was dropped in production by `20260329000001_rls_world_state.sql`. If any code path calls `from('game_log')` in dev mode, it silently succeeds (returns empty). In production, the table doesn't exist — this is a divergence risk.
- The mock's `upsert` conflict resolution uses a multi-field heuristic (`r.player_id === row.player_id && r.item_id === row.item_id`) — this may not match Postgres's behavior with `onConflict` clauses precisely.

**Crafting/stealth — untested paths**:
- `lib/actions/craft.ts` and `lib/stealth.ts` have no dedicated test files. Check for obvious error paths (invalid recipe, missing materials).

**Deliverable**: Prioritized list of unhandled error paths. For each: the code location, what happens today, what the correct behavior should be, and BLOCKER / WARNING / INFO classification.

---

## H5 — Test Coverage Gaps + Production Config

**Goal**: Identify critical untested paths given the 417-test suite. Verify Vercel production configuration is correct.

**Scope**:

### What to read — test coverage
- `tests/integration/` — all 15 test files (abilities, combat x3, conditions, death-rebirth, dialogue, ending, inventory, levelup, personalLoss, survival, trade, traits, worldGen)
- `tests/unit/` — 5 test files (dice, npcs, parser, spawn, stats)
- `tests/setup.ts` — global test setup
- `tests/mocks/supabase.ts` — Supabase mock used by tests
- `lib/actions/craft.ts` — crafting (no test file found)
- `lib/actions/travel.ts` — fast travel/map (no test file found)
- `lib/actions/movement.ts` — movement/look (no dedicated test file found — only parser tests cover command parsing)
- `lib/stealth.ts` — stealth system (no test file found)
- `lib/crafting.ts` — crafting logic (no test file found)
- `lib/mapRenderer.ts` — map rendering (no test file found)
- `lib/narratorVoice.ts`, `lib/playerMonologue.ts`, `lib/companionSystem.ts`, `lib/factionWeb.ts` — narrative modules (partially tested via worldEvents and hollowPressure tests in lib/)
- `lib/hollowPressure.test.ts` and `lib/worldEvents.test.ts` — note these are in `lib/`, not `tests/` — confirm vitest picks them up
- `vitest.config.ts` — confirm test discovery pattern covers `lib/*.test.ts`

### Coverage gaps to identify
- Is `handleMove()` / `handleLook()` tested? (Movement is a core gameplay path)
- Is the auth flow (createCharacter → loadPlayer → state initialization) tested anywhere?
- Are save/load round-trips tested? (The two prior schema bugs suggest this is high-value)
- Is `_savePlayer()` retry logic tested?
- Is the death → rebirth cycle tested end-to-end? (death-rebirth.test.ts exists — check scope)
- Is crafting tested at all?
- Is stealth tested?
- Is fast travel tested?
- Are the 4 endings tested for DB persistence (not just logic)?
- Is the prologue/creation state machine in `app/page.tsx` tested? (UI tests)
- Is the error boundary tested?
- Is input with special characters / long strings tested?

### What to read — production config
- `.env.local` — actual env values (already read: `NEXT_PUBLIC_DEV_MODE=false`, real Supabase URL/keys)
- `vercel.json` — framework, region, headers
- `next.config.ts` — Next.js config (currently empty)
- `middleware.ts` — auth middleware matcher
- `package.json` — build script is `next build`

### Production config to verify
- **DEV_MODE**: `NEXT_PUBLIC_DEV_MODE=false` in `.env.local`. Must verify this is also set in Vercel project environment variables (not just local). If Vercel falls back to the checked-in `.env.local`, it's fine — but `.gitignore` must include `.env.local`.
- **Vercel env vars**: The three required vars (`NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`, `SUPABASE_SERVICE_ROLE_KEY`) should be set in Vercel dashboard. `SUPABASE_SERVICE_ROLE_KEY` is not currently used in application code (no references in app/ or lib/), so it's harmless but vestigial.
- **Region**: `iad1` (US East) — single region. Supabase project should be in the same or nearby region to minimize latency. Check Supabase project URL for region hint.
- **Domain**: Live URL is `y-kappa-green-78.vercel.app` — Vercel auto-provisioned domain. No custom domain configured. For a public release, consider whether a custom domain is needed.
- **Security headers**: `vercel.json` adds 3 headers. Missing CSP and HSTS — assess for release readiness.
- **Analytics**: `@vercel/analytics` and `@vercel/speed-insights` are in `app/layout.tsx`. These are production-safe.
- **Build output**: Confirm `next build` completes without errors. Check if TypeScript strict mode is configured.
- **`next.config.ts`**: Currently empty — no custom webpack, no image domains, no redirects configured. Is this complete?
- **Supabase email templates**: Magic-link auth relies on Supabase email delivery. Confirm Supabase email is not rate-limited for new signups.
- **Auth callback URL**: The OTP redirect uses `window.location.origin` — on Vercel this becomes `https://y-kappa-green-78.vercel.app`. Confirm this domain is whitelisted in Supabase Auth → URL Configuration.

### Vercel deployment to check via CLI (if available)
- `vercel env ls` — confirm production env vars are set
- Recent deployment logs — any build warnings or errors

**Deliverable**: (a) Prioritized list of untested critical paths with suggested test descriptions. (b) Production config findings — missing env vars, wrong settings, domain issues. Flag each BLOCKER / WARNING / INFO.

---

## File Ownership Matrix

| File / Directory | Howler | Operation |
|---|---|---|
| `supabase/migrations/` (all 21) | H1 | READ |
| `lib/gameEngine.ts` | H1, H3, H4 | READ (each for different methods) |
| `lib/inventory.ts` | H1 | READ |
| `lib/world.ts` | H1 | READ |
| `lib/echoes.ts` | H1 | READ |
| `types/game.ts` | H1 | READ |
| `lib/supabase.ts` | H2 | READ |
| `lib/supabaseMock.ts` | H2, H4 | READ |
| `middleware.ts` | H2 | READ |
| `app/auth/callback/route.ts` | H2 | READ |
| `app/login/page.tsx` | H2 | READ |
| `.env.local` | H2, H5 | READ |
| `vercel.json` | H2, H5 | READ |
| `app/page.tsx` | H3, H4 | READ |
| `lib/terminalCreation.ts` | H3 | READ |
| `lib/terminalDeath.ts` | H3 | READ |
| `lib/actions/movement.ts` | H3, H4 | READ |
| `lib/actions/combat.ts` | H3, H4 | READ |
| `lib/actions/system.ts` | H3 | READ |
| `lib/actions/items.ts` | H1, H4 | READ |
| `lib/actions/trade.ts` | H4 | READ |
| `lib/actions/craft.ts` | H4, H5 | READ |
| `lib/actions/survival.ts` | H4 | READ |
| `lib/stealth.ts` | H4, H5 | READ |
| `lib/parser.ts` | H4 | READ |
| `components/ErrorBoundary.tsx` | H4 | READ |
| `tests/` (all files) | H5 | READ |
| `lib/hollowPressure.test.ts` | H5 | READ |
| `lib/worldEvents.test.ts` | H5 | READ |
| `vitest.config.ts` | H5 | READ |
| `next.config.ts` | H5 | READ |
| `package.json` | H5 | READ |

**Note**: Multiple Howlers reading the same file is acceptable in reaping mode (pure research, no writes). No two Howlers produce overlapping output files.

---

## Output Files

Each Howler produces one findings file:

| Howler | Output |
|---|---|
| H1 | `evaluation/release-readiness/H1-database-audit.md` |
| H2 | `evaluation/release-readiness/H2-auth-security-audit.md` |
| H3 | `evaluation/release-readiness/H3-gameplay-flow.md` |
| H4 | `evaluation/release-readiness/H4-error-handling.md` |
| H5 | `evaluation/release-readiness/H5-test-coverage-prod-config.md` |

Each file uses this structure:
```
# H[N] — [Title]
## BLOCKERS
## WARNINGS
## INFO
## Summary verdict: GO / NO-GO / GO WITH CAVEATS
```

---

## Acceptance Criteria

The evaluation is complete when:
1. All 5 Howlers have produced their findings file
2. Every finding is classified BLOCKER / WARNING / INFO
3. Every table in H1 schema check has been explicitly verified or flagged
4. The happy path in H3 has been traced step-by-step with explicit pass/fail per step
5. H5 produces a final GO / NO-GO / GO WITH CAVEATS recommendation

**Release criteria**: Zero BLOCKERs. Any GO WITH CAVEATS verdict must list the caveats explicitly and get human sign-off.

---

## Known Risk Areas (pre-seeded from code reading)

These are high-probability finding locations for Howlers to prioritize:

1. **H1**: The `saw_prologue` column exists in `players` table (Migration 005) but `app/page.tsx` uses `localStorage` for prologue tracking — the DB column appears unused. Investigate whether this is intentional divergence.

2. **H1**: The `game_log` table was dropped in `20260329000001` but `supabaseMock.ts` `freshTables()` still lists it. In dev mode, any write to `game_log` silently succeeds. In production, the table is gone. Check if any production code path still references `game_log`.

3. **H2**: `middleware.ts` has a safety fallback — if Supabase env vars are missing, it calls `NextResponse.next()` (allows the request through unauthenticated). This is a misconfiguration escape hatch, not a policy bypass in normal operation, but should be documented.

4. **H3**: After `createCharacter()` succeeds, `loadPlayer(player.id)` is called immediately (line ~975). If this `loadPlayer` call fails, the engine throws `'Failed to reload player after rebirth'` — which bubbles up to the creation catch block in `app/page.tsx` and starts a new creation wizard. The player row exists but the game thinks it doesn't. This is a potential stuck state.

5. **H4**: `_savePlayer()` retry path (line ~435): on retry failure, the error is logged but the user sees no message. The player may believe the game saved when it did not.

6. **H4**: Stash operations in `items.ts` appear to have no error handling on the Supabase return values — if the DB is unavailable, stash items silently vanish or fail to persist.

7. **H5**: No test covers the `auth → createCharacter → loadPlayer → ready` full initialization sequence. The two prior schema bugs (save_fix, narrative_progress) were caught in production, not tests. A round-trip integration test for `_savePlayer()` / `loadPlayer()` would have caught both.

8. **H5**: `NEXT_PUBLIC_DEV_MODE` must be verified as `false` in Vercel's environment variables, not just in `.env.local`. If the Vercel project was set up without explicitly setting this var and `.env.local` is gitignored, the production deployment may have no value for this var — which evaluates as `undefined !== 'true'` (safe), but should be confirmed.

---

## Execution Notes

- All Howlers run in parallel (no dependencies between them)
- Howlers read only — no source file modifications
- Each Howler produces exactly one output file
- If a Howler finds a BLOCKER, it completes its full audit before reporting — do not stop early
- Cross-references between Howlers' findings are resolved by the human reviewer post-eval
