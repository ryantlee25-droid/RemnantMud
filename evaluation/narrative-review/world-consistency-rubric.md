# Rubric 4: World Consistency
_The Remnant — Eval Phase 5-D | Created: 2026-05-03_

---

## Purpose

This rubric evaluates whether the game world holds together across content layers.
A consistent world is one where:

- Every exit that prose describes exists in code
- Every NPC named in a static description can actually spawn there
- Zone faction tone matches the faction that controls the zone
- Cycle-aware content is gated correctly
- Hidden content is discoverable only via the lore hints that exist in the world

This document defines scoring criteria, application method, automated gate wiring,
and a worked example against Zone A (Crossroads).

---

## Dimensions

### D1 — Cross-Zone NPC Uniqueness

**What it checks**: No NPC ID appears in the `npcSpawns` arrays of two different
zone files' rooms as an anchored fixture. Wanderer NPCs (generic encounter types
such as `scavenger_rival` or `drifter_newcomer`) are exempt because they are
explicitly designed to appear across zones.

**Anchored NPC definition**: An `npcSpawn` entry with `spawnType: 'anchored'` or
`spawnChance >= 0.60` with no `spawnType` specified. These are named, place-bound
characters whose presence in two different zones would be a continuity error.

| Score | Criteria |
|-------|----------|
| Pass | No anchored NPC ID appears in rooms from two different zone files |
| Warning | A named NPC (`isNamed: true`) has `spawnChance < 0.60` but no `spawnType`, creating ambiguity about intended exclusivity |
| Fail | An anchored NPC ID (e.g. `patch`, `bridge_keeper_howard`) is found in rooms belonging to two different zones |

**Automated gate**: `scripts/validate-npc-cross-refs.ts` Check 1 covers undefined
NPC IDs. D1 uniqueness checking requires an additional pass in the same script
(or an extension) that groups anchored spawns by zone and reports cross-zone
duplicates.

---

### D2 — Room Description vs NPC Presence

**What it checks**: Room `description`, `descriptionNight`, `descriptionDawn`, and
`descriptionDusk` fields must not refer to a specific named NPC by their proper
name when that NPC's `spawnChance` is below 1.0 in that room.

**Rationale**: If Marta is mentioned by name in the default room description but
her `spawnChance` is 0.85, a player who arrives on the 15% roll where she is
absent will read about a person who is not there. This breaks immersion.
Generic references ("a food vendor", "the checkpoint arbiter") are acceptable
regardless of spawn probability.

| Score | Criteria |
|-------|----------|
| Pass | All proper-name references in static description fields match an NPC with `spawnChance: 1.0` in that room (or no `npcSpawns` referencing that NPC at all — i.e., it is a permanent fixture handled elsewhere) |
| Warning | Proper-name reference to an NPC with `spawnChance >= 0.85`. Likely to appear but technically probabilistic; cosmetically acceptable but flagged |
| Fail | Proper-name reference to an NPC with `spawnChance < 0.85`, including any NPC referenced only in `descriptionDawn` or `descriptionDusk` variants |

**Automated gate**: `scripts/validate-npc-cross-refs.ts` Check 5 (proposed
extension) performs a string-match scan of all description fields against the
`name` property of NPCs whose `spawnChance < 1.0` in the same room. This is the
"hard-code-in-prose detection" called for in PLAN-EVAL.md T1-A spec item 3.

---

### D3 — Faction Tone Per Zone

**What it checks**: Rooms within a faction-controlled zone use vocabulary and
details consistent with that faction's established tone from the world bible.
This is a manual dimension — no automated gate can evaluate prose register.

**Faction tone references**:

| Zone | Controlling Faction | Expected Tone Keywords |
|------|---------------------|------------------------|
| `crossroads` | Drifters (neutral) | Pragmatic, transactional, "no faction colors", neutral gray, commerce |
| `river_road` | Mixed / Accord border | Travel, danger, river, Accord law appearing at northern end |
| `covenant` | The Accord | Law, order, "running water", civil administration, exhausted competence |
| `salt_creek` | The Salters | Military, walls, ranks, strength, Briggs, shipping containers |
| `the_ember` | The Kindling | Fire motifs, faith, purification, Deacon Harrow, zealotry |
| `the_stacks` | The Reclaimers | Electronics, solar, data, mesh network, isolationism |
| `duskhollow` | Covenant of Dusk | Candlelight, iron, velvet dark, copper smell, uncanny grace |
| `the_pens` | Red Court | Livestock imagery, clinical detachment, Castellan Rook, hierarchy |
| `the_scar` | None (extreme zone) | Blast, deadlands, radiation whispers, military artifacts |
| `the_breaks` | None (wilderness) | Canyon, red sandstone, ambush country, Ferals |
| `the_pine_sea` | None (wilderness) | Mountain, altitude, cold, pine density, sparse Hollow |
| `the_deep` | None (underground) | Complete dark, mine shafts, nesting Hollow, sulfur |
| `the_dust` | None (wilderness) | Heat, flat, sightlines, migrating Hollow herds |

**Scoring method**: Select 5 rooms per zone. For each room, read the default
description and score on two criteria:

1. **Faction keyword presence** — Does the prose use at least one vocabulary
   element from the expected tone list? (1 = yes, 0 = no)
2. **Faction contradiction absence** — Does the prose avoid vocabulary from
   a rival faction's tone? (1 = no contradiction, 0 = contradiction present)

**Zone score** = (sum of 5 rooms × 2 criteria) / 10. A score of 0.80 or higher
is passing.

| Score | Criteria |
|-------|----------|
| Pass | Zone score ≥ 0.80 across sampled rooms |
| Warning | Zone score 0.60–0.79; faction flavor is present but diluted |
| Fail | Zone score < 0.60, or any room contains vocabulary from a rival faction that contradicts the zone's controlling faction |

---

### D4 — Exit Sign Consistency

**What it checks**: Every exit direction described in room prose has a matching
entry in either `exits` or `richExits`. Conversely, every `richExits` entry that
includes a `descriptionVerbose` field should be navigable (not silently broken).

**What counts as a "described exit"**:
- Explicit bracketed notation: `[Exits: north, south]` in any description field
- Prose phrases: "a door to the north", "the path continues east", "a ladder
  leads down", "the trail north"
- Room `extras` entries whose `description` mentions a direction of travel

This is partially automated (exit target validity) by `tests/eval/mapIntegrity.test.ts`
which already checks all exit destinations resolve to real room IDs. The manual
dimension adds: do the exit descriptions in prose match what the player can
actually do?

| Score | Criteria |
|-------|----------|
| Pass | All directions mentioned in prose have a matching `exits` or `richExits` entry; no `richExits` `descriptionVerbose` references a direction that is locked without explanation |
| Warning | An exit mentioned in prose is gated by a `skillGate` or `cycleGate` but the gate condition is not hinted in prose |
| Fail | A direction is mentioned in prose with no corresponding entry in `exits` or `richExits`; or an exit exists in `exits`/`richExits` whose `descriptionVerbose` contradicts the room's prose (e.g., prose says "north to the river" but `richExits.north.descriptionVerbose` says "east toward the ridge") |

**Semi-automated gate**: `tests/eval/mapIntegrity.test.ts` already validates exit
target existence (all destination IDs resolve to real rooms). The prose
contradiction check is manual. A future extension to the validator script could
grep description fields for compass directions and cross-reference them against
`exits` keys.

---

### D5 — Cycle-Aware Content Gating

**What it checks**: Content that references cycle-N events (past deaths, Revenant
recognition, cycle-specific lore) is only visible when the cycle gate condition
is met. Conversely, cycle-1 content must not reference events that could not have
happened yet.

**Sources of cycle-aware content**:
- `richExits` with `cycleGate: N` — blocked in cycles below N
- `descriptionPool` entries with `cycleGate: N` — only rendered at cycle N+
- `npcSpawns` with `activityPool` entries bearing `quest_trigger` flags whose
  availability depends on cycle count
- `narrativeNotes` or inline prose that mentions "Revenants" or past-cycle events

**Scoring**:

| Score | Criteria |
|-------|----------|
| Pass | All cycle-gated content is behind a verified `cycleGate` field; cycle-1 descriptions contain no references to past deaths, prior cycle events, or Revenant status |
| Warning | A `narrativeNotes` field references a cycle-gated event but the corresponding room description does not vary by cycle (low player-impact risk) |
| Fail | A room `description` (non-gated, always-rendered) references events that require prior cycles; or a `cycleGate: N` exit's `descriptionVerbose` is visible at cycle < N |

**Automated gate**: `lib/echoes.ts` `getCycleAwareDialogue()` and related
functions gate dialogue content. Room-level `cycleGate` fields are enforced by
`lib/actions/movement.ts`. The integration test coverage gap in `lib/echoes.ts`
(lines 437–543) noted in PLAN-EVAL.md is directly relevant here: the manual
rubric check provides coverage until those tests exist.

---

### D6 — Hidden Content Discoverability vs Lore Hints

**What it checks**: Every hidden room or hidden exit (flagged `hidden: true` with
`discoverSkill` + `discoverDc`) must have at least one observable lore hint in
the world that points toward its existence. The hint can be in an `extras` entry,
a room description, an NPC dialogue line, a bulletin board posting, or an item
description.

**What counts as a lore hint**:
- An `extras` entry in the same room or an adjacent room whose description
  alludes to what is hidden (e.g., "The tiles near the back wall are loose")
- An NPC dialogue node that mentions the hidden location by indirect reference
- A readable item (`letter_XXX`, `torn_note`, `discarded_flyer`) whose text
  directs attention to the hidden feature
- A `skillCheck` `successAppend` in an `extras` entry that reveals the hidden
  feature's existence

**Anti-pattern (fail case)**: A hidden exit with `discoverSkill: scavenging`
and `discoverDc: 12` but no `extras` entry in that room mentioning anything
suspicious about the walls, floor, or architecture. The player has no reason to
examine — they must either stumble or know from out-of-game sources.

| Score | Criteria |
|-------|----------|
| Pass | Every hidden exit or hidden room has at least one in-world lore hint accessible before the skill check fires |
| Warning | The lore hint is in a room two or more exits away from the hidden content (weakly telegraphed) |
| Fail | No lore hint exists in the game world for the hidden content; the only discovery path is the skill roll itself |

---

## Scoring Summary Sheet

For each zone evaluated, complete this table:

| Dimension | Pass / Warning / Fail | Notes |
|-----------|----------------------|-------|
| D1 — Cross-zone NPC uniqueness | | |
| D2 — Description vs NPC presence | | |
| D3 — Faction tone | | |
| D4 — Exit sign consistency | | |
| D5 — Cycle-aware gating | | |
| D6 — Hidden content discoverability | | |
| **Zone overall** | **Pass if all D1–D4 pass; D5–D6 warnings acceptable** | |

**Definition of Pass (zone level)**: D1, D2, D4 must all be Pass. D3 zone score
must be ≥ 0.80. D5 and D6 failures are blockers; warnings are recorded but do
not fail the zone.

---

## Application Method

1. Run `pnpm validate` to get automated results for D1 (NPC uniqueness) and D2
   (NPC-in-prose). These checks exit 1 on any finding.

2. Run `pnpm test:eval` to confirm D4 automated exit-target validity via
   `mapIntegrity.test.ts`.

3. For D3 (faction tone), manually sample 5 rooms per zone. Score each room
   against the tone table. Record in the zone score column.

4. For D5 (cycle-aware gating), search each zone file for `cycleGate` and verify
   that every gated exit or description pool entry is correctly conditioned. Then
   read all non-gated `description` fields for cycle-N references.

5. For D6 (hidden content), list all rooms with `hidden: true` exits. For each,
   trace back through the extras entries and adjacent rooms for lore hints. Record
   findings.

6. Record all findings in the Scoring Summary Sheet. Any Fail in D1–D4 requires
   a content fix before the evaluation pass is declared complete.

---

## Worked Example: Zone A — Crossroads

### D1: Cross-Zone NPC Uniqueness

Crossroads NPC IDs in `npcSpawns` (from `data/rooms/crossroads.ts`):
`board_manager`, `camp_elder_rosa`, `campfire_storyteller`, `checkpoint_arbiter`,
`components_vendor`, `crossroads_gate_guard`, `drifter_newcomer`, `echo_hollow`,
`leatherworker_vin`, `map_seller_reno`, `marta_food_vendor`, `mysterious_stranger_sanguine`,
`patch`, `pit_bookie`, `pit_fighter`, `scavenger_rival`, `sparks_radio_repair`,
`water_attendant`, `weapons_vendor_cole`, `wounded_drifter`

Cross-check against `data/rooms/river_road.ts` NPC IDs:
`accord_sentry_river`, `accord_trail_marker`, `bridge_keeper_howard`,
`covenant_gate_sentry`, `covenant_wall_child`, `drifter_cart_team`,
`fisher_npc`, `lone_fisher`, `motel_survivor`, `narrows_ambusher`,
`rest_stop_squatter`, `stray_dog`, `traveling_merchant`

**Intersection**: Zero. No anchored NPC ID from crossroads.ts appears in
river_road.ts.

Note: `map_seller_reno` (crossroads, `spawnChance: 0.55`) and
`traveling_merchant` (river_road, `spawnType: 'wanderer'`) are different entity
IDs despite similar function — correct.

**D1 result for Crossroads: PASS**

---

### D2: Room Description vs NPC Presence

Examining rooms where named NPCs are referenced in static description fields:

**cr_03_market_south (`descriptionDawn`)**: "Marta's fire is barely a thread of smoke."
- `marta_food_vendor` has `spawnChance: 0.85`
- Marta is referenced by name with a subunit probability of presence.
- This is above the 0.85 warning threshold but below the 1.0 pass threshold.
- **Result: WARNING** — Marta absent 15% of dawn entrances; prose still names her.

**cr_03_market_south (`descriptionDusk`)**: "Marta banks her fire hard..."
- Same NPC, same spawnChance: 0.85. Same warning.
- **Result: WARNING**

**cr_04_market_center (`description`)**: "Marcus Cole stands behind his counter..."
  — this is in the `activityPool`, not the static `description`. Static
  description uses "The vendors here are professionals, not cooks." Generic.
- **Result: PASS** for static description.

**cr_05_market_north (`description`)**: "a woman who repairs radios, a man who claims
to sell maps" — generic descriptions, no proper names.
- `sparks_radio_repair` has `spawnChance: 0.75`. The prose uses "a woman",
  not "Sparks". Correct.
- **Result: PASS**

**Overall D2 result for Crossroads: WARNING** (2 warnings, both in cr_03, both
referring to Marta in time-variant descriptions. No Fail-level violations found.)

**Recommended fix**: Change `descriptionDawn` and `descriptionDusk` for cr_03 to
use "the cook fire" or "the food stalls" rather than "Marta's fire" unless Marta's
`spawnChance` is raised to 1.0.

---

### D3: Faction Tone Per Zone

Crossroads is Drifter-controlled neutral ground. Expected vocabulary: pragmatic,
transactional, neutral gray, no faction colors, commerce, survival.

Sample of 5 rooms:

| Room | Faction Keywords Present | Rival Faction Contradiction | Score |
|------|--------------------------|----------------------------|-------|
| cr_01_approach | "neutral ground", "no faction wars", "hand-painted sign" | None | 2/2 |
| cr_02_gate | "gray armbands", "no faction colors", "loyalty is to the market" | None | 2/2 |
| cr_03_market_south | "focused efficiency of survivors", "how many rounds it costs" | None | 2/2 |
| cr_09_campground | "no faction" (implied by lack of faction imagery), trade/survival details | None | 2/2 |
| cr_06_info_broker | "antiseptic and tobacco", pragmatic detail, no faction signaling | None | 2/2 |

**Zone D3 score: 10/10 = 1.0**

**D3 result for Crossroads: PASS**

---

### D4: Exit Sign Consistency

Selected rooms with complex exits:

**cr_01_approach**: Prose mentions "a wall of stacked tires and corrugated steel —
that's Crossroads to the north". `exits.north: 'cr_02_gate'`. Consistent.
`richExits.south` has `skillGate`. The prose does not explicitly name the south
exit but does say "the painted lines long surrendered to sun and weeds" and the
extras describe "Highway 550, south toward The Breaks" — the gate condition is
not hinted in the default prose but the extras entry for "highway / road / asphalt"
explains all four exits. **WARNING level**: skill gate not telegraphed in
description prose, only in extras.

**cr_05_market_north**: Has `richExits.north` with `cycleGate: 2`. The description
says "a trail leads north into the hills" with no mention of it being inaccessible.
At cycle 1 the exit is blocked. The `descriptionPool` bulletin board entry with
`cycleGate: 2` (Revenants note) is separately gated. However, the description
itself does not hint the north trail is impassable at cycle 1. **WARNING level**:
cycle-gated exit not flagged in prose.

**cr_11_old_gas_station**: Has `exits.down: 'cr_12_gas_station_basement'` with
`hidden: true`. The extras entry `keywords: ['floor', 'tiles', 'hatch']`
includes `skillCheck: { skill: 'scavenging', dc: 10 }` with success text that
reveals the opening. This is the D6 pattern — handled there.

**Overall D4 result for Crossroads: WARNING** (skill-gated exits in cr_01 south
and cr_01 west not telegraphed in prose; cycle-gated north exit in cr_05 not
mentioned in prose. No Fail-level violations — all exit IDs resolve to valid rooms.)

---

### D5: Cycle-Aware Content Gating

**cr_05_market_north `richExits.north`** has `cycleGate: 2`. The exit blocks
cycle-1 players from reaching `rr_07_north_fork` directly. The cycle-1 default
description says "a trail leads north" with no indication it is blocked. A cycle-1
player who tries the exit will receive the gate message, but the prose primes an
expectation of free access. **WARNING**: cycle-gate not hinted in description.

**cr_05_market_north `descriptionPool` bulletin board**: Entry with `cycleGate: 2`
("REVENANTS — if you've died and come back...") correctly gated at the content
level. **PASS**.

**cr_08_job_board `descriptionPool`**: Entry "WORK FOR REVENANTS" has
`cycle_gate: 2`. Correctly gated. **PASS**.

No cycle-1 default `description` field in crossroads.ts was found to reference
past-cycle events.

**D5 result for Crossroads: WARNING** (cr_05 north exit description primes access
expectation without gating hint; no Fail-level violations)

---

### D6: Hidden Content Discoverability

**cr_11_old_gas_station → cr_12_gas_station_basement**:
- Hidden exit: `exits.down: 'cr_12_gas_station_basement'` with `hidden: true`,
  `discoverSkill: 'scavenging'`, `discoverDc: 10`
- Lore hint in same room: `extras` entry with keywords `['floor', 'tiles', 'hatch']`
  whose description reads "The tiles near the back wall are loose. Beneath them,
  a plywood panel. Beneath that — darkness and the smell of stale air." The
  `skillCheck` success text completes the discovery.
- The main room description ("the building isn't empty — things keep turning up
  in the rubble") motivates the `examine` behavior.
- **D6 result: PASS** — lore hint is present in the same room with clear sensory
  cues leading to the skill check.

No other hidden exits exist in the crossroads zone.

**D6 result for Crossroads: PASS**

---

### Crossroads Zone Summary Score

| Dimension | Result | Notes |
|-----------|--------|-------|
| D1 — Cross-zone NPC uniqueness | **PASS** | Zero overlap with river_road or any other zone |
| D2 — Description vs NPC presence | **WARNING** | Marta named by name in two time-variant descriptions at spawnChance 0.85 |
| D3 — Faction tone | **PASS** | Score 10/10; Drifter neutral tone consistent throughout |
| D4 — Exit sign consistency | **WARNING** | Skill-gated and cycle-gated exits lack prose hints |
| D5 — Cycle-aware gating | **WARNING** | cr_05 north exit description doesn't reflect cycle-1 block |
| D6 — Hidden content | **PASS** | Gas station basement fully telegraphed |
| **Zone overall** | **PASS** | All D1/D3/D4 (no Fails); D2/D5 warnings are content polish, not blockers |

---

## Top Consistency Gaps Identified During Rubric Design

The following gaps were identified by analyzing the source files while defining
the rubric dimensions. They are listed in descending severity.

**Gap 1 — NPC name in time-variant descriptions (D2 Warning)**: `cr_03_market_south`
names Marta explicitly in `descriptionDawn` and `descriptionDusk` at `spawnChance: 0.85`.
The `descriptionPool` pattern (used for the bulletin board) is the correct pattern
for probabilistic content. The same pattern should apply to time-variant descriptions
that reference probabilistic NPCs. Fix: replace proper-name references with generic
descriptions, or raise Marta's `spawnChance` to 1.0 if she is intended as always
present.

**Gap 2 — Cycle-gated exits silent in prose (D4/D5 Warning)**: The north exit
of `cr_05_market_north` is cycle-gated at cycle 2 but the prose says "a trail
leads north" without qualification. Players at cycle 1 will attempt the exit and
receive a gate rejection that feels arbitrary rather than world-grounded. Fix:
Add a description variant or an `extras` entry noting the trail north was recently
blocked, or add a cycle-gate note in the description (e.g., "a trail leads north
that you remember from another life").

**Gap 3 — Skill gate exits not telegraphed in prose (D4 Warning)**: The south
and west exits of `cr_01_approach` have `skillGate` conditions but the room
description does not signal danger for those directions. The gating appears only
on attempt. Fix: The `extras` entries already describe the south and west roads
in detail — add a survival-relevant warning ("The canyon country south is rough
wilderness; without experience it would be folly") to the `extras` descriptions
so the gate feels organic.

**Gap 4 — `drifter_road_warden` in hollowEncounter threatPool (D1 potential)**: In
`cr_01_approach`'s `hollowEncounter.threatPool`, the type `drifter_road_warden`
appears alongside `shuffler` and `remnant`. Hollow encounter types should be
Hollow variants only (the threat pool is the hollow enemy list, not NPCs). A
non-Hollow type appearing in a Hollow encounter pool is either a content error
or an undocumented design intention. Recommend checking whether `drifter_road_warden`
is a defined enemy type in `data/enemies.ts` or an NPC that leaked into the wrong
pool.

**Gap 5 — `rr_07_north_fork` as exit from cr_05 (cross-zone exit validation)**:
`cr_05_market_north`'s north exit leads to `rr_07_north_fork`, a river_road zone
room. This cross-zone direct exit is the only case in the crossroads zone where
an exit crosses zone boundaries without going through a zone-boundary room
(cr_01_approach as the canonical boundary node). If `mapIntegrity.test.ts`
validates zone-cohesion (rooms in a zone connect to zone neighbors via a single
boundary room), this shortcut may trigger a zone-cohesion warning. The cycle gate
(cycle 2 required) mitigates its impact on Act 1 players but the structural
anomaly should be documented.

---

## Automated Gate Wiring Summary

| Check | Tool | Current Status | Action Needed |
|-------|------|---------------|---------------|
| D1 (cross-zone NPC uniqueness) | `scripts/validate-npc-cross-refs.ts` | Not yet implemented | Add Check 6 to validate-npc-cross-refs.ts: group anchored npcSpawns by zone, report duplicates |
| D2 (NPC name in prose) | `scripts/validate-npc-cross-refs.ts` Check 5 | Not yet implemented | Add Check 5 per T1-A spec item 3 |
| D3 (faction tone) | Manual | Manual only | No automated path; sample 5 rooms per zone per release |
| D4 (exit target validity) | `tests/eval/mapIntegrity.test.ts` | Exits target existence covered | Add prose-direction cross-reference check as manual step |
| D5 (cycle gate enforcement) | `lib/actions/movement.ts`, `lib/echoes.ts` tests | Integration coverage gap (lines 437–543) | P3-D closes coverage gap; manual rubric bridges until then |
| D6 (hidden content hints) | Manual | Manual only | No automated path; enumerate hidden exits per zone |

---

_Rubric design complete. Manual evaluation pass: apply to all 13 zones before
Phase 5 exit criteria are declared met. See PLAN-EVAL.md Phase 5 exit criteria
for the 10-sample minimum requirement per rubric._
