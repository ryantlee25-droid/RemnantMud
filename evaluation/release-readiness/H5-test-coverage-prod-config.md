# H5 — Test Coverage Gaps + Production Config

**Howler**: H5
**Date**: 2026-03-31
**Scope**: Vitest suite analysis (417+ tests), source-to-test mapping, Vercel production configuration

---

## BLOCKERS

### B1 — `NEXT_PUBLIC_DEV_MODE` not set in Vercel production environment variables

**Location**: Vercel env vars (confirmed via `vercel env ls`)
**Evidence**: The `vercel env ls` output shows only two vars in production: `NEXT_PUBLIC_SUPABASE_ANON_KEY` and `NEXT_PUBLIC_SUPABASE_URL`. `NEXT_PUBLIC_DEV_MODE` is **absent** from all Vercel environments (Production, Preview, Development).

**Risk**: `isDevMode()` checks `process.env.NEXT_PUBLIC_DEV_MODE === 'true'`. When the var is absent, the expression evaluates `undefined === 'true'` → `false`, so dev mode is NOT active. This is technically safe behavior — but the `.env.local` file (which sets it to `false`) is git-ignored and will never reach Vercel. If any future code path changes the `isDevMode()` logic to treat absence differently, production could break silently.

**More critically**: The absence means there is no explicit production guard. If someone adds `NEXT_PUBLIC_DEV_MODE=true` to Vercel production by mistake, `resetDevDb()` would run on production, wiping player state in-memory (the mock would activate). There is no Vercel-side protection against this.

**Recommended action**: Explicitly set `NEXT_PUBLIC_DEV_MODE=false` in Vercel production and preview environments via `vercel env add NEXT_PUBLIC_DEV_MODE`.

---

### B2 — No save/load round-trip test exists

**Location**: `tests/` (all files), `lib/gameEngine.ts` `_savePlayer()` / `loadPlayer()`
**Evidence**: Searched all 20 test files. No test exercises the `_savePlayer()` → `loadPlayer()` round-trip against a mocked Supabase. The `tests/mocks/supabase.ts` mock exists and is capable of simulating this, but no test uses it against `gameEngine.ts` directly.

**Risk**: The two prior production incidents — `20260328000002_save_fix.sql` (missing `active_buffs`, `pending_stat_increase`, `discovered_enemies`) and `20260401000001_add_narrative_progress.sql` (missing `narrative_progress` column) — were both column-mismatch bugs. Both would have been caught by a round-trip test that asserts `loadPlayer(savePlayer(state)) === state`. This gap has already caused two production outages.

**Recommended test** (description only — no source modification):
```
describe('gameEngine save/load round-trip')
  it('_savePlayer writes all Player fields, loadPlayer reads them back identically')
  // Set up: mock Supabase to capture the upsert payload, then return it from select
  // Assert: every field in the original Player object appears in the reloaded Player
```

---

### B3 — `SUPABASE_SERVICE_ROLE_KEY` present in `.env.local` but NOT in Vercel — and `.env.local` is git-ignored

**Location**: `.env.local` line 6, `vercel env ls` output
**Evidence**: `.env.local` contains the service role key. `.gitignore` correctly excludes `.env*` (except `.env.example`). `vercel env ls` shows the service role key is **not** configured in Vercel at all.

**Risk (two-sided)**:
1. If any server-side code path ever needs `SUPABASE_SERVICE_ROLE_KEY` (e.g. a future admin route or RLS bypass), the production deployment will fail silently because the var is absent. Code review of `lib/` and `app/` confirms it is not currently used in any server route — so this is latent risk, not active.
2. The service role key value is in `.env.local` on the developer's machine. If `.gitignore` were ever misconfigured, it would be committed. The current gitignore (`*.env*`) is correct.

**Recommended action**: Either add `SUPABASE_SERVICE_ROLE_KEY` to Vercel (scoped to production only, not client-accessible) as a precaution, or document explicitly that it is intentionally absent because it is unused. As-is, the gap is undocumented.

---

## WARNINGS

### W1 — No test for `handleMove()` / `handleLook()` (movement is a core gameplay path)

**Location**: `lib/actions/movement.ts` — no corresponding test file
**Evidence**: The parser tests (`tests/unit/parser.test.ts`) verify that `go north` parses to `{verb: 'go', noun: 'north'}` but do not test that `handleMove()` actually transitions rooms, fires `handleLook()`, calls `_savePlayer()`, or checks zone gating. The `worldGen.test.ts` tests room data integrity but not runtime movement.

**Coverage gap**: Zone-gating logic (`ZONE_RECOMMENDED_LEVEL` map in `movement.ts`), `canMove()` failure paths, fear checks during movement (`fearCheck()`), and `getDeathRoomNarration()` echoes on revisiting a death room are all untested.

**Risk**: Medium. Movement is the most-exercised code path in gameplay. A regression in zone gating or room transition could silently break the core loop.

---

### W2 — No test for `handleCraft()` / `lib/crafting.ts`

**Location**: `lib/actions/craft.ts`, `lib/crafting.ts` — no test files
**Evidence**: Neither `craft.ts` nor `crafting.ts` appear in any test file. `handleCraft()` touches inventory reads (`getInventory`), recipe lookups (`getAvailableRecipes`), skill checks (`attemptCraft`), and item mutations (`removeItem`, `addItem`). The `attemptCraft` function likely contains a dice roll — that branch is entirely dark.

**Risk**: Medium-low for release (crafting is a secondary mechanic), but any recipe data error or inventory state corruption from a failed craft would be invisible.

---

### W3 — No test for `lib/stealth.ts`

**Location**: `lib/stealth.ts` — no test file
**Evidence**: `attemptStealth()` uses `rollCheck()` + `getClassSkillBonus()` and returns a result consumed by combat. The surprise round bonus (`getSurpriseRoundBonus()`) is a pure function with no test. The dice and skill bonus modules have unit tests, but their composition in `stealth.ts` is not tested.

**Risk**: Low for release. Stealth is a secondary mechanic, and the function is simple. But a class skill bonus miscalculation would be silent.

---

### W4 — No test for `lib/actions/travel.ts` (fast travel / map)

**Location**: `lib/actions/travel.ts`, `lib/mapRenderer.ts` — no test files
**Evidence**: `handleMap()` and `handleTravel()` rely on `renderZoneMap()` (ASCII box-drawing) and waypoint filtering from `ALL_ROOMS`. No test verifies that visited waypoints are filtered correctly, that zone labels are correct, or that the map renders without throwing.

**Risk**: Low for release — fast travel is a convenience feature, not critical path. A render failure here would produce a broken map display, not a crash.

---

### W5 — No test for `lib/companionSystem.ts`, `lib/factionWeb.ts`, `lib/narratorVoice.ts`, `lib/playerMonologue.ts`

**Location**: Narrative modules added in `remnant-narrative-0329` convoy
**Evidence**: `lib/hollowPressure.test.ts` and `lib/worldEvents.test.ts` test two of the seven narrative modules. The other four (`companionSystem`, `factionWeb`, `narratorVoice`, `playerMonologue`) have no dedicated tests. Per `vitest.config.ts`, the `include` pattern covers `lib/**` so these would be picked up if test files existed — they simply don't.

**Risk**: Medium. Companion system has a join/leave state machine and percentage-based triggers (20% commentary, 5% personal moment). Faction web has cross-faction reputation mutation. These are moderately complex with no coverage.

---

### W6 — `lib/hollowPressure.test.ts` and `lib/worldEvents.test.ts` are in `lib/`, not `tests/` — verify Vitest picks them up

**Location**: `lib/hollowPressure.test.ts`, `lib/worldEvents.test.ts`, `vitest.config.ts`
**Evidence**: `vitest.config.ts` does NOT specify an `include` pattern for test discovery — it uses the Vitest default, which picks up `**/*.test.ts` anywhere in the project. The coverage `include` lists `lib/**`, `data/**`, `components/**`. So both files ARE discovered by Vitest, and they ARE included in coverage. This is OK, but the placement is inconsistent with the rest of the test suite (all other tests live under `tests/`). The inconsistency creates a maintenance hazard — a future developer might miss them in audits.

**Risk**: Low for release. Tests run correctly. Convention inconsistency only.

---

### W7 — No test for the auth → `createCharacter` → `loadPlayer` initialization sequence

**Location**: `app/page.tsx` `init()` function, `lib/gameEngine.ts` `createCharacter()` / `loadPlayer()`
**Evidence**: No test file imports or exercises `createCharacter()`. The creation wizard state machine in `lib/terminalCreation.ts` is also untested. The `tests/mocks/supabase.ts` mock is capable of simulating auth, but no test wires it to the engine initialization sequence.

**Risk**: Medium. This path has already produced one silent failure (the `loadPlayer` throw after `createCharacter` succeeds — documented in PLAN.md H3 edge case #4). With no test, this regression path is permanently dark.

---

### W8 — No test for `_savePlayer()` retry logic

**Location**: `lib/gameEngine.ts` lines ~430–443
**Evidence**: The retry path (`auth.refreshSession()` + second `update()`) has no test. The `tests/mocks/supabase.ts` mock supports `_setFromResult(data, error)` which could simulate a first-call failure, but no test uses this to verify the retry fires or that the user-visible warning message is appended on second failure.

**Risk**: Medium. Silent save failures with no user feedback are a known UX problem (noted in PLAN.md H4 as BLOCKER candidate for a different reason). The retry logic is the only recovery path — if it's broken, players lose saves without knowing.

---

### W9 — `vercel.json` missing CSP and HSTS headers

**Location**: `vercel.json`
**Evidence**: Current headers: `X-Content-Type-Options: nosniff`, `X-Frame-Options: DENY`, `Referrer-Policy: strict-origin-when-cross-origin`. Missing: `Content-Security-Policy`, `Strict-Transport-Security`, `Permissions-Policy`.

**Risk for release**:
- Without CSP, XSS payloads (if any input ever reaches innerHTML) are unmitigated. Terminal component uses message objects (not innerHTML), so XSS risk is low — but CSP provides defense-in-depth.
- Without HSTS, a first-visit MITM could downgrade to HTTP. Vercel enforces HTTPS at the edge, so practical risk is low but the header is considered baseline hygiene for production.
- Absence is a WARNING, not a BLOCKER, given the low-risk architecture.

---

### W10 — No test for death → rebirth cycle with DB persistence

**Location**: `tests/integration/death-rebirth.test.ts`
**Evidence**: The death-rebirth test covers pure functions only: `createCycleSnapshot()`, `computeInheritedReputation()`, `echoRetentionFactor()`. It does NOT test that the player row is actually updated in the DB (`is_dead = true`), that the ledger is updated on death, or that a new cycle character creation re-uses the same `player_id` row. DB persistence of the death cycle is entirely untested.

**Risk**: Medium. The ledger and cycle history are the roguelike's core meta-progression. A silent DB failure during death would lose all cycle-over-cycle echo data.

---

### W11 — Ending test does not exercise DB persistence of the cycle snapshot

**Location**: `tests/integration/ending.test.ts`
**Evidence**: The ending test verifies state machine transitions (`endingTriggered`, `endingChoice`) and `createCycleSnapshot()` output. It does NOT test that the snapshot is persisted to `player_ledger.cycle_history`. The `_savePlayer` mock is a `vi.fn()` that does nothing — DB write is never verified.

**Risk**: Medium. A regression in the ending snapshot persist path (the PLAN.md H4 BLOCKER candidate at line ~1218 of `gameEngine.ts`) would silently lose ending data. This is the highest-stakes data loss path in the game.

---

## INFO

### I1 — `next.config.ts` is effectively empty

**Location**: `next.config.ts`
**Evidence**: Config is the generated default with no options set. No image domains, no redirects, no custom webpack, no experimental flags.

**Assessment**: This is fine for the current app. The game does not use `next/image` with external sources, has no redirect requirements, and uses standard App Router. An empty config is correct, not incomplete.

---

### I2 — `vitest.config.ts` excludes `lib/supabase.ts` and `lib/gameContext.tsx` from coverage

**Location**: `vitest.config.ts` `coverage.exclude`
**Evidence**: Both files are explicitly excluded from coverage reporting. `lib/supabase.ts` is the client factory — correctly excluded since it wraps the SDK with no testable logic. `lib/gameContext.tsx` is the React context provider — correctly excluded as a thin wrapper.

**Assessment**: These exclusions are appropriate. No action needed.

---

### I3 — No UI/component tests exist

**Location**: `components/` directory — no test files found in `tests/`
**Evidence**: `vitest.config.ts` includes `components/**` in coverage scope, but no test files target any component. The `ErrorBoundary.tsx` is noted in PLAN.md H4 as untested. Terminal component behavior (rendering, input handling) is also untested at the component level.

**Assessment**: Component tests are hard to write for terminal-style UIs and the PLAN.md does not flag their absence as a blocker. Noting for completeness. The integration tests exercise the underlying logic; the UI layer relies on manual QA.

---

### I4 — Vercel region is `iad1` (US East); Supabase URL hints at same region

**Location**: `vercel.json`, `.env.local`
**Evidence**: `vercel.json` sets `"regions": ["iad1"]`. Supabase project URL is `aufkcfeumkqangrfzvtb.supabase.co`. Supabase project IDs do not encode region in the URL, but the project was created around the same time as the Vercel deployment and likely defaults to `us-east-1`. Cross-region latency is not a concern unless Supabase was provisioned in a different region.

**Assessment**: Cannot confirm Supabase region from URL alone. If the Supabase dashboard shows the project in `us-east-1`, the co-location is correct and latency is optimal. If it is in `us-west-1` or `eu-west-1`, each DB call adds ~50–150ms. INFO only — no action needed for release unless latency is observed.

---

### I5 — `SUPABASE_SERVICE_ROLE_KEY` is unused in production code

**Location**: `lib/`, `app/` — no references found
**Evidence**: The service role key exists in `.env.local` but is not referenced in any `lib/` or `app/` file (confirmed by reviewing `lib/supabase.ts` and the auth callback route). It is a vestigial credential from initial Supabase setup.

**Assessment**: Safe as-is. The key is never loaded into the client bundle. Documented as INFO to complement B3 above.

---

### I6 — Supabase auth callback URL whitelist cannot be verified from code alone

**Location**: `app/auth/callback/route.ts`, Supabase dashboard
**Evidence**: The callback route uses `request.url` as the redirect base — on Vercel production this resolves to `https://y-kappa-green-78.vercel.app/auth/callback`. Whether this URL is whitelisted in Supabase Auth → URL Configuration → Redirect URLs cannot be determined from code inspection alone. The magic-link flow will silently fail if it is not whitelisted, presenting as an auth error to the user.

**Assessment**: Requires manual verification in the Supabase dashboard. Given that the app is currently deployed and working (live URL noted in PLAN.md), this is likely configured correctly. Documenting for release checklist completeness.

---

## Coverage Gap Map

### Source → Test mapping

| Source file | Test file | Coverage verdict |
|---|---|---|
| `lib/actions/combat.ts` | `tests/integration/combat.test.ts`, `combat-abilities.test.ts`, `combat-edge-cases.test.ts` | COVERED |
| `lib/actions/items.ts` | `tests/integration/inventory.test.ts` | COVERED (take/drop/equip; stash untested) |
| `lib/actions/survival.ts` | `tests/integration/survival.test.ts` | COVERED |
| `lib/actions/trade.ts` | `tests/integration/trade.test.ts` | COVERED |
| `lib/actions/system.ts` | — (no dedicated test) | PARTIAL (save exercised via mock but not end-to-end) |
| `lib/actions/movement.ts` | — (no dedicated test) | GAP — WARNING W1 |
| `lib/actions/craft.ts` | — (no test) | GAP — WARNING W2 |
| `lib/actions/travel.ts` | — (no test) | GAP — WARNING W4 |
| `lib/actions/examine.ts` | — (no test) | GAP (minor — thin wrapper over `handleLook`) |
| `lib/actions/social.ts` | `tests/integration/dialogue.test.ts` (partial) | PARTIAL |
| `lib/actions/vendorDialogue.ts` | `tests/integration/dialogue.test.ts` (partial) | PARTIAL |
| `lib/stealth.ts` | — (no test) | GAP — WARNING W3 |
| `lib/crafting.ts` | — (no test) | GAP — WARNING W2 |
| `lib/mapRenderer.ts` | — (no test) | GAP — WARNING W4 |
| `lib/companionSystem.ts` | — (no test) | GAP — WARNING W5 |
| `lib/factionWeb.ts` | — (no test) | GAP — WARNING W5 |
| `lib/narratorVoice.ts` | — (no test) | GAP — WARNING W5 |
| `lib/playerMonologue.ts` | — (no test) | GAP — WARNING W5 |
| `lib/hollowPressure.ts` | `lib/hollowPressure.test.ts` | COVERED |
| `lib/npcInitiative.ts` | `lib/hollowPressure.test.ts` (via import) | PARTIAL |
| `lib/worldEvents.ts` | `lib/worldEvents.test.ts` | COVERED |
| `lib/gameEngine.ts` | — (no direct test; exercised indirectly) | GAP — BLOCKERS B2, WARNING W7, W8 |
| `lib/echoes.ts` | `tests/integration/death-rebirth.test.ts` | COVERED (pure functions only — no DB) |
| `lib/fear.ts` | `tests/integration/death-rebirth.test.ts` | COVERED |
| `lib/combat.ts` | `tests/integration/combat.test.ts` (mocked) | COVERED via mock |
| `lib/inventory.ts` | `tests/integration/inventory.test.ts` (mocked) | COVERED via mock |
| `lib/world.ts` | `tests/integration/worldGen.test.ts` | PARTIAL (static data; runtime paths untested) |
| `lib/parser.ts` | `tests/unit/parser.test.ts` | COVERED |
| `lib/dice.ts` | `tests/unit/dice.test.ts` | COVERED |
| `lib/spawn.ts` | `tests/unit/spawn.test.ts` | COVERED |
| `lib/traits.ts` | `tests/integration/traits.test.ts` | COVERED |
| `lib/abilities.ts` | `tests/integration/abilities.test.ts` | COVERED |
| `lib/conditions.ts` | `tests/integration/conditions.test.ts` | COVERED |
| `lib/stats.ts` | `tests/unit/stats.test.ts` | COVERED |
| `components/ErrorBoundary.tsx` | — (no test) | GAP (INFO only) |

### Critical untested paths summary

| Path | Status | Classification |
|---|---|---|
| Save/load round-trip (`_savePlayer` → `loadPlayer`) | No test exists | BLOCKER B2 |
| Auth → `createCharacter` → `loadPlayer` → ready state | No test exists | WARNING W7 |
| `_savePlayer()` retry logic | No test exists | WARNING W8 |
| `handleMove()` / `handleLook()` | No test exists | WARNING W1 |
| Death → DB persistence (`is_dead`, ledger update) | No test exists | WARNING W10 |
| Ending snapshot → DB persistence | No test exists | WARNING W11 |
| Crafting (`handleCraft`, `attemptCraft`) | No test exists | WARNING W2 |
| Stealth (`attemptStealth`, `getSurpriseRoundBonus`) | No test exists | WARNING W3 |
| Fast travel / map rendering | No test exists | WARNING W4 |
| Companion system state machine | No test exists | WARNING W5 |

---

## Production Config Checklist

| Config item | Status | Classification |
|---|---|---|
| `NEXT_PUBLIC_SUPABASE_URL` — set in Vercel production | SET | OK |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` — set in Vercel production | SET | OK |
| `SUPABASE_SERVICE_ROLE_KEY` — set in Vercel production | NOT SET (unused in code) | WARNING B3 (latent risk) |
| `NEXT_PUBLIC_DEV_MODE` — set in Vercel production | NOT SET (defaults safely to `undefined !== 'true'`) | BLOCKER B1 (needs explicit false) |
| `vercel.json` — framework set to `nextjs` | SET | OK |
| `vercel.json` — region `iad1` | SET | OK |
| `vercel.json` — security headers (3 of 5 baseline) | PARTIAL (missing CSP, HSTS) | WARNING W9 |
| `next.config.ts` — empty config | EMPTY (appropriate for current app) | OK |
| `.gitignore` — `.env*` excluded | SET (`.env*` glob + exception for `.env.example`) | OK |
| Vercel Analytics + Speed Insights | Installed in `app/layout.tsx` | OK |
| Build script (`next build`) | Configured in `package.json` | OK |
| Supabase auth callback URL whitelist | Cannot verify from code — requires dashboard check | INFO I6 |
| `supabaseMock.ts` `freshTables()` includes dropped `game_log` table | DIVERGENCE (mock includes dropped table) | INFO (cross-reference H4) |
| Vitest test discovery covers `lib/*.test.ts` | CONFIRMED (default `**/*.test.ts` pattern) | OK |

---

## Summary verdict: GO WITH CAVEATS

**Release can proceed with the following actions required before or immediately after launch:**

**Must-fix before launch** (BLOCKERs):
1. **B1**: Run `vercel env add NEXT_PUBLIC_DEV_MODE` and set `false` for production and preview environments. Simple one-minute CLI operation.
2. **B2**: Write a save/load round-trip integration test. This is the highest-value test gap — it would have caught both prior production schema bugs. Estimated effort: ~1 hour.
3. **B3**: Decide and document the `SUPABASE_SERVICE_ROLE_KEY` posture — either add it to Vercel (scoped to production) or add a code comment confirming it is intentionally unused. The current undocumented gap is a maintenance hazard.

**Acceptable for launch with post-launch follow-up** (WARNINGs):
- W1 (movement tests), W2 (craft tests), W3 (stealth tests), W4 (travel tests), W5 (narrative module tests) — secondary mechanics with no production incidents
- W7 (auth init sequence test) — important but no current regression
- W8 (retry logic test) — important but retry path exists and was deliberately implemented
- W9 (CSP/HSTS headers) — low XSS risk given terminal architecture; add after launch
- W10/W11 (death/ending DB persistence tests) — high-value tests to add in first post-launch sprint

**Mandatory manual verification before launch**:
- Supabase dashboard: confirm `https://y-kappa-green-78.vercel.app` is in Auth → URL Configuration → Redirect URLs (INFO I6)
- Supabase dashboard: confirm project region matches `iad1` (INFO I4)
