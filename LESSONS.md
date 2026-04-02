# LESSONS.md — The Remnant MUD

Accumulated from: 10 spectrum runs, 5 release-readiness audit Howlers (H1–H5), harness review,
save-fix investigation, and post-launch TODO triage. Updated: 2026-03-31.

Read this before touching player save/load, schema, or error handling. Gold injects these into
Howler drop prompts at muster.

---

## Schema Drift Pattern (Most Critical)

**What happened — twice:**

1. `remnant-narrative-0329` convoy: code added `hollowPressure` and `narrativeKeys` to
   `_savePlayer()` as part of `narrative_progress`. No migration was written. Production broke
   on next deploy — `loadPlayer()` found no `narrative_progress` column and crashed or silently
   returned wrong data. Fixed post-launch by `20260401000001_add_narrative_progress.sql`.

2. Earlier convoy: `active_buffs`, `pending_stat_increase`, and `discovered_enemies` were added
   to the in-memory `Player` object and to `_savePlayer()` without matching columns in the DB.
   Players got save errors immediately on the next session. Fixed by `20260328000002_save_fix.sql`.

**How it was caught:** User-visible save errors in production. No test caught either bug first.

**The pattern:** A Howler adds a field to the `Player` TypeScript interface, writes the field in
`_savePlayer()`, reads it in `loadPlayer()`, but does not create a migration. CI passes (tsc sees
the type is valid), tests pass (the mock accepts any column name), and the bug ships.

**The rule:** Every field added to `_savePlayer()` requires a migration. No exceptions. The checklist
before declaring a Howler done:

1. Is the field in `_savePlayer()`? → Add it to `supabase/migrations/YYYYMMDDNNNNNN_<name>.sql`
2. Is the field in `loadPlayer()`? → Verify the migration column name matches exactly
3. Is it JSONB? → Do NOT use `JSON.stringify()` — pass the object directly (Supabase handles JSONB serialization)
4. Run `tsc --noEmit` — type checks pass but do not prove the migration exists

**Migration naming convention:** `YYYYMMDDNNNNNN_description.sql` — timestamp must be monotonically
increasing. Never reuse a timestamp. Pad to 6 digits (e.g., `20260401000001`).

**Until a save/load round-trip test exists (see Testing Gaps), any Howler touching `_savePlayer()`
or `loadPlayer()` must manually cross-reference every field in both methods against the cumulative
migration column list.**

---

## Data Integrity Lessons

### DB write before state mutation (stash bug)

`handleStash()` called `removeItem()` (removes from in-memory inventory) *then* inserted to
`player_stash`. If the insert fails, the item has left inventory and never reached stash — it is
gone. No error was shown.

**Rule:** For any operation that moves an item between two stores (inventory → stash, stash → inventory),
do the DB write first and only mutate local state after the write succeeds. Show a user-visible
error if the write fails. Never assume a Supabase call succeeded because no error was destructured —
always destructure `{ error }`.

### Error returns must be checked on every Supabase call

The audits found stash operations, rebirth operations, reputation persist, quest flag persist,
death persist, and ending snapshot persist all using bare `await supabase.from(...)...` without
destructuring `{ error }`. In several cases this caused silent data loss.

**Rule:** Every Supabase call in this codebase must destructure `{ error }` and handle the error
branch. The minimum acceptable handler for non-critical paths is `console.error` + a user-visible
`systemMsg`. For paths that gate progression (death, rebirth, ending), use the retry pattern from
`_savePlayer()` and block forward progress until the write succeeds or the player explicitly
acknowledges the failure.

### Ending persist must complete before player delete

The `charon_choice` handler saves a cycle snapshot to `player_ledger`, then shows ending messages,
then deletes the player row on BEGIN. If the snapshot persist fails and the game proceeds to delete,
the player's entire cycle history — echoes, faction inheritance, ending achievement — is permanently
lost with no recovery path.

**Rule:** The ending `BEGIN` flow must not delete player data until the cycle snapshot persist has
succeeded (or the player has explicitly acknowledged data loss). Apply the `_savePlayer()` retry
pattern to the snapshot persist. Block the delete path until persist confirms success.

### upsert instead of insert for character creation (duplicate key on restart)

Early in development, `createCharacter()` used `insert` on the players table. A player who
restarted (CONFIRM RESTART + create again) got a duplicate key error because their old row still
existed during the creation window. Fixed by switching to `upsert(..., { onConflict: 'id' })`.

**Rule:** Character creation and rebirth must always use `upsert` with `onConflict: 'id'`, never
`insert`. This applies to the `players`, `player_ledger`, and `generated_rooms` tables.

---

## Game Flow Lessons

### rebirthWithStats() vs createCharacter() — different code paths for new vs returning players

`createCharacter()` hardcodes `cycle: 1`, `total_deaths: 0`, and `is_dead: false`. It creates a
fresh ledger with no cycle history. This is correct for first-time players and wrong for players
who have died and are restarting a new cycle.

`rebirthWithStats()` increments cycle, carries `inheritedRep`, preserves `cycle_history`, and
correctly handles `total_deaths`. This is the method that must be called when a player completes
the creation wizard *after death* (i.e., when `gameFlow === 'rebirth'`).

The release-readiness audit (H3-B1) found that `page.tsx` was calling `createCharacter()` in the
rebirth path, silently resetting cycle to 1 on every death. The Revenant loop — the game's core
mechanic — was broken.

**Rule:** When `gameFlow === 'rebirth'`, call `engine.rebirthWithStats(name, stats, class, loss)`.
When `gameFlow === 'creating'` (first-time), call `engine.createCharacter(...)`. Never route rebirth
through `createCharacter`. Any Howler touching character creation or the between/rebirth flow must
verify this distinction explicitly.

### loadPlayer error must show retry, not trigger creation (save overwrite risk)

`loadPlayer()` throws on DB error. The `init()` catch block in `app/page.tsx` was routing all
errors — including transient DB failures — to character creation. A player with an existing save
who hit a network blip at page load would land in the creation wizard. If they completed it,
`createCharacter()` would upsert their player row, overwriting their save.

**Rule:** The `init()` catch block must distinguish between "player not found" (loadPlayer returns
`false` → start creation) and "DB error" (loadPlayer throws → show error + reload option, never
start creation). Character creation must only trigger when `loadPlayer` explicitly returns `false`.

### Command dispatch needs a concurrency guard (double XP/loot)

`dispatch()` in `GameContext` had no concurrency guard. Rapid Enter presses could fire two
simultaneous `executeAction()` calls. Both would read the same `this.state`, operate independently,
and the second write would win with potentially stale or doubled data. In combat, this could award
XP twice or apply two enemy attack rounds.

**Rule:** Any future changes to `GameContext` or `handleCommand` must preserve the concurrency guard
(an `isDispatching` ref or equivalent). The input element must be disabled while a command is
processing. Do not remove or bypass this guard for any reason.

### CONFIRM RESTART needs error handling (partial delete corruption)

CONFIRM RESTART issues five sequential `delete()` calls without error handling. If any delete fails
and the page reloads, the remaining player data (a partial player row, missing inventory, or missing
ledger) is loaded and the game is in a corrupted state.

**Rule:** The CONFIRM RESTART and ending BEGIN delete sequences must wrap each delete in a try/catch
(or check `{ error }`). On any delete failure, show an error message and do not reload. The player
must explicitly retry or acknowledge the failure before the page reloads. Delete order must be
child tables first (inventory, ledger, stash, rooms) before the parent `players` row.

---

## Architecture Lessons

### saw_prologue: localStorage is authoritative, not DB (intentional)

The `players` table has a `saw_prologue BOOLEAN` column (added in `20260326000005_narrative.sql`)
that is never read or written by application code. The app uses `localStorage` key
`remnant_saw_prologue` exclusively. The DB column is dead schema.

**Authoritative behavior:** `localStorage` is authoritative for prologue state. A player on a new
device or incognito browser will see the prologue again. This is accepted behavior. The DB column
was created speculatively and never wired up.

**Rule:** Do not write `saw_prologue` to the DB. Do not read it from `loadPlayer()`. If you need
to change prologue behavior, change the localStorage logic in `app/page.tsx`. The DB column may be
dropped in a future migration — do not add references to it.

### active_buffs: native JSONB, no JSON.stringify

`active_buffs` is a `JSONB DEFAULT '[]'` column. Supabase handles serialization of JavaScript
arrays/objects to JSONB natively. Do not call `JSON.stringify()` before writing or `JSON.parse()`
after reading.

**Rule:** For all JSONB columns (`active_buffs`, `narrative_progress`, `faction_reputation`,
`quest_flags`, `cycle_history`, `discovered_enemies`), pass native JavaScript values directly to
Supabase. Never stringify. If a column is being read back as a string instead of an object, the
bug is that stringify was applied on write — find and remove it.

### narrative_progress: JSONB with {hollowPressure, narrativeKeys}

`narrative_progress` is a `JSONB DEFAULT '{}'` column added in `20260401000001`. Its canonical
shape is `{ hollowPressure: number, narrativeKeys: string[] }`. Both fields are packed together in
`_savePlayer()` and unpacked in `loadPlayer()`.

Do not add unrelated fields to `narrative_progress`. If new narrative state needs persistence, add
a new column with a new migration and a new entry in `_savePlayer()` / `loadPlayer()`.

### world_state: RLS with no user policies (service_role only, currently unused)

The `world_state` table has RLS enabled but no authenticated or anon policy. Only service_role
bypasses RLS. No application code creates a service_role Supabase client. Any query from the
browser anon client against `world_state` will return silent empty results — not an error.

**Rule:** Do not query `world_state` from any client-side code. The table is reserved for a future
server-side admin path that does not exist yet. If you need to read or write `world_state`, you
must create a server Route Handler and use a service_role client instantiated from
`SUPABASE_SERVICE_ROLE_KEY`. Document the new route clearly.

### DEV_MODE: must be false in Vercel, guard all NEXT_PUBLIC_DEV_* vars with isDevMode()

`isDevMode()` returns `process.env.NEXT_PUBLIC_DEV_MODE === 'true'`. The var is absent from Vercel
production env vars — it defaults safely to `false` — but must be explicitly set to `false` in
Vercel for both Production and Preview environments.

All `NEXT_PUBLIC_DEV_*` variables (including `NEXT_PUBLIC_DEV_START_ROOM`) must be guarded by
`if (isDevMode())` before being read. Because `NEXT_PUBLIC_` variables are compiled into the client
bundle, an unguarded read that finds the var set in production would silently affect all users.
The alternative is to rename dev-only overrides to non-`NEXT_PUBLIC_` server-side vars.

**Rule:** Never read a `NEXT_PUBLIC_DEV_*` env var without first checking `isDevMode()`. If a
dev-only override does not need to be client-accessible, do not use the `NEXT_PUBLIC_` prefix.

---

## Testing Gaps

### Current state (as of 2026-03-31)

- **417 tests, 26.57% statement coverage**
- `gameEngine.ts` at **4.95%** — the command dispatch loop, save/load, and state machine are
  essentially untested
- `world.ts` at **0%**, `stealth.ts` at **0%**, `terminalCreation.ts` at **0%**,
  `terminalDeath.ts` at **0%**

### Integration tests mock away the module under test

The integration test anti-pattern found throughout the suite: `combat.test.ts` mocks
`@/lib/combat` (the module being exercised by `handleAttack`), so the test verifies call wiring
but not actual combat logic. `inventory.test.ts` mocks `lib/inventory`. These tests would pass even
if the underlying module was completely broken.

**Rule:** Integration tests must not mock the primary module under test. Mock only external
dependencies (Supabase, randomness, timers). A test titled "handleAttack integration" must exercise
real `startCombat`, `playerAttack`, and `enemyAttack` logic — not mock them away.

### No save/load round-trip test — caused two production bugs

Both production schema bugs (`active_buffs` missing, `narrative_progress` missing) would have been
caught by a single round-trip test that:

1. Constructs a fully-populated `Player` object with every field
2. Calls `engine._savePlayer()` and captures the upsert payload via the Supabase mock
3. Configures the mock to return that payload from `select()`
4. Calls `engine.loadPlayer(playerId)` and asserts every field matches field-for-field

The `tests/mocks/supabase.ts` mock supports `_setFromResult(data, error)` — no new infrastructure
needed. This test should live at `tests/integration/save-load-roundtrip.test.ts`.

**This is the highest-ROI test gap in the suite. Write it before touching `_savePlayer()` or
`loadPlayer()` for any reason.**

### Movement, stealth, crafting, and travel are all untested

| System | Files | Test status |
|---|---|---|
| Movement | `lib/actions/movement.ts` | No test — zone gating, fear checks, death room echoes all dark |
| Stealth | `lib/stealth.ts` | No test — surprise round bonus, class skill composition untested |
| Crafting | `lib/actions/craft.ts`, `lib/crafting.ts` | No test — recipe resolution, material consumption untested |
| Fast travel | `lib/actions/travel.ts`, `lib/mapRenderer.ts` | No test — map rendering, waypoint filter untested |
| Narrative modules | `lib/companionSystem.ts`, `lib/factionWeb.ts`, `lib/narratorVoice.ts`, `lib/playerMonologue.ts` | No test |

Any Howler adding features to these systems must write at least a smoke test covering the happy
path. Do not defer tests for secondary systems — they become debt that compounds with each convoy.

### Death and ending DB persistence paths are untested

`death-rebirth.test.ts` tests pure functions only — it does not assert that `is_dead = true`
reaches the DB or that the ledger is updated on death. `ending.test.ts` does not verify that the
cycle snapshot is persisted to `player_ledger.cycle_history`. These are the highest-stakes data
paths in the game and have zero DB-level test coverage.

---

## Process Lessons (From 10 Spectrum Runs)

### Pure-create reaping runs are fastest and cleanest

Spectrum runs where all Howlers only create new files (no MODIFIES entries in the ownership matrix)
complete without merge conflicts and finish in under 2 hours. The narrative-0329 and ux-0329 convoys
ran at this pace. Any convoy that introduces MODIFIES entries — especially to `gameEngine.ts` — is
high-risk and should be given a full muster with a Politico pass.

### gameEngine.ts is the highest-risk seam

Every convoy eventually touches `gameEngine.ts`. It contains `_savePlayer()`, `loadPlayer()`,
`dispatch()`, `createCharacter()`, `rebirthWithStats()`, and all the per-system hook points. File
ownership conflicts here cascade into structural failures. When multiple Howlers need to modify
`gameEngine.ts`, Gold must serialize them or extract the shared functionality into a new file that
both Howlers can depend on.

### The Supabase mock diverges from production schema

`lib/supabaseMock.ts` `freshTables()` still includes `game_log` after the table was dropped in
production by `20260329000001_rls_world_state.sql`. The mock accepts any column name without
validation, so a Howler can write to a non-existent column in dev and the test passes. The bug
only surfaces in production.

**Rule:** After any migration that drops a table or column, update `supabaseMock.ts` in the same
PR. After any migration that adds a column, check whether the mock needs to be updated to return
the new column in its seeded data. The mock and the production schema must stay in sync.

### No ARCHITECTURE.md exists for this project — Howlers operate without context

Despite 10 spectrum runs, no ARCHITECTURE.md was created or survived at
`~/.claude/projects/-Users-ryan-projects-mud-game/ARCHITECTURE.md`. The Spectrum Protocol requires
this file. Every convoy muster must create or update it. Without it, Howlers receive Spectrum
Protocol instructions but no knowledge of the room system, save mechanics, dev mock, or the
repeated "code without migration" failure pattern.

Gold must create ARCHITECTURE.md at the start of the next muster if it does not exist.

---

## Spectrum: narrative-quality-0401

### What Worked

- **5 parallel auditors** (room, NPC, ambient, items/enemies/events, monologue) found 40+ craft issues humans missed on casual play
- **File ownership split** (rooms/NPCs/items/monologues/ambient) eliminated merge conflicts entirely
- **Named NPCs were already strong** — Patch, Lev, Cross, Vesper, Sparks, Harrow, Briggs, Vane, Rook, Howard all pass voice tests
- **Enemies file is flawless** — every entry meets or exceeds standard, zero rewrites needed
- **The Breaks and The Dust** — consistently excellent writing across all 20+ rooms each, no blockers found
- **Identified the real problems** — localized to: generic NPC layer (31 NPCs identified by role, not name), scavenged item descriptions (17 items at UI tooltip quality), specific verbal tics ("specific" used 165+ times as precision substitute)

### Blockers Fixed (8 Items)

1. **Room NPC ID mismatches** — `sc_05_barracks` pointed to `sc_20_mess_hall` (actual ID `sc_06_mess_hall`); `pens_01/02/08` had cross-zone NPCs (Crossroads guards in Red Court, Covenant clerks in Pens)
2. **Hard-coded NPC names** — `st_02_entry_hall` description says "Lev stands at the inner door" but Lev spawns with 85% chance; breaks 15% of visits
3. **Developer placeholders visible to players** — `scar_07_cold_storage` description contained "the MacGuffin room" (narrative device note, not flavor text)
4. **Missing NPC definitions** — 5 NPCs spawned in rooms but undefined in npcs.ts: `wren_shelter`, `wren_ruins`, `old_mae`, `salter_perimeter_worker`, `duskhollow_child`
5. **Wrong-zone exits** — `cv_01_main_gate` exit to `cv_26_refugee_processing` (room not found in file)
6. **Duplicate NPC entries** — `marta_food_vendor` + `food_vendor_marta` (same character, two entries); `dr_ama_osei` + `lucid_sanguine_osei` (same character, both zone the_breaks)
7. **Duplicate item data** — `canned_food` and `canned_food_random` identical; needs differentiation or consolidation
8. **Item descriptions at UI tooltip quality** — `empty_water_bottle` ("worth something to someone who's thirsty"), `lighter_disposable` (two factual sentences, zero flavor), `gun_oil` (Wikipedia-level definition)

### Narrative Patterns to Avoid (Confirmed Across 5 Audits)

**Verbal tics** (high-frequency, low-precision):
- `"specific [adjective/noun]"` appears 165+ times as a claim of precision without delivering it. Test: "The specific quality of emptiness" — replace "specific" with "particular" and does the sentence change? If no, cut it. Rule: every use of "specific" must be tested; estimate 60% can be cut, 40% should be replaced with actual specificity.
- `"someone who [verb methodically]"` — 12+ uses in Salt Creek alone. Individually fine; collectively becomes wallpaper. Max 4 per zone.
- `"at night [location] is at night"` — tautological openers that restate nighttime without saying what night means *specifically* in that place. Rule: a `descriptionNight` that opens by stating it is nighttime without adding what dark specifically does to the location = failed opener.

**Tell-not-show failures** (identified in 6+ rooms):
- `"atmosphere made physical"` — writing about atmosphere rather than creating it through detail
- `"the feeling of being summoned"` — shortDescription that describes an emotion instead of orienting spatially
- `"the silence is heavy"` — generic atmospheric cliche from 1940s fiction, no specificity to context
- `"something changed their schedule"` — editorial gloss that tells the player what to think instead of letting observation stand

**NPC construction failures**:
- Generic role references ("the vendor", "the technician") without character names — every NPC referenced in a room spawn MUST exist in npcs.ts with a name and description
- `npcSpawns` activity pools using purely generic descriptions with no names, no dialogue trees
- `npcs` static arrays mixing cross-zone characters into single rooms (Red Court wards staffed with Crossroads drifters)
- Hard-coding NPC names in room descriptions when spawn is probabilistic — breaks immersion when the NPC doesn't appear

**Item description patterns**:
- Item descriptions that read as UI tooltips instead of flavor text (2 sentences, both factual, zero voice)
- Restating the item name in the description ("Old binoculars" → "Old binoculars. One lens cracked...")
- Tautological phrasing ("A bar of soap. Still works." / "Empty water bottle. Worth something to someone who's thirsty")
- Abandoning interesting details (the mineral sample's label; the motel Bible's margin notes)

**Class monologue issues** (Reclaimer/Scout crisis):
- Scout and Reclaimer voices are nearly identical — both use data/pattern/analysis lexicon without differentiation by terrain vs. systems
- Pressure spike and act transition triggers are thin (2 lines per personalLoss) — players see repeats immediately at act breaks
- Promise loss variants collapse into generic debt/obligation framing across multiple classes

### Rules for Future Text

1. **Every NPC referenced in room spawn MUST exist in npcs.ts with:**
   - A name (isNamed: true or unique ID that reads as a name, not a role)
   - A 2-3 sentence description with sensory or personality detail
   - At minimum a one-line dialogue piece; named NPCs need dialogue trees

2. **Room descriptions must not hard-code NPC names unless spawnChance is 1.0**
   - If an NPC has probability < 100%, use npcSpawns activity pools instead of base description
   - If you must reference an NPC by name in static prose, verify spawn is guaranteed

3. **Item descriptions: 2-3 sentences, grounded in post-collapse meaning**
   - Sentence 1: What is it, what state is it in, what does it smell/feel like
   - Sentence 2: Why this item matters in a post-collapse world (the stakes)
   - Sentence 3 (optional): A detail that earns player attachment or curiosity
   - Test: read the description without the item name visible — does it still evoke the object?

4. **Monologue voice must pass the blind test: can you identify the class without seeing the name?**
   - Scout: reads *terrain, bodies, exits, tracking* — not data structures or systems
   - Reclaimer: reads *systems, logs, information infrastructure* — not physical navigation
   - Expand thin triggers (act_transition, pressure_spike) to 3+ lines to prevent repeat detection
   - Differentiate loss types so each personalLoss variant has distinct vocabulary, not just tags

5. **"Specific" is banned as a descriptor — replace with actual specific detail**
   - Search and replace audit required — 60% of instances can be cut entirely
   - For the 40% that stay, the surrounding text must actually specify what "specific" promises
   - Test replacement: "The specific dark" → "The dark where you can't see past your own hand" (actual specificity)

6. **NPC activity pools and shortDescriptions must carry faction/tone consistency**
   - No methodical ledger-reviewing in every Accord room — show Accord through contrast or conflict
   - No "professional disinterest" for NPCs where this register isn't surprising
   - No cross-zone NPCs in static arrays (Crossroads guards don't appear in Red Court)

7. **Room exits and IDs must round-trip**
   - Every `exits: { north: 'room_id' }` must have a matching room definition with that exact ID
   - Verify bidirectional navigation — if A exits to B, B must have exit back to A (or justified one-way)
   - Check zone consistency — adjacent rooms should have matching zone prefix or justified boundaries
