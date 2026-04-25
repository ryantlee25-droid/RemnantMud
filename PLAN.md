# Plan: Robust Playtest Suite
_Created: 2026-04-24 | Type: New Feature (test infrastructure)_

---

## Situation

The Remnant has 1,170+ passing tests covering individual verb handlers, dialogue trees, combat math, and save/load mechanics. What it lacks is a **scenario-driven integration harness** that walks three distinct characters through 50 rooms each, fires every verb in the parser, and asserts on compound state transitions the way a real player session would. Unit tests verify handlers in isolation; this convoy verifies the engine as a system.

The immediate motivation is safety before the next feature convoy. The world is now fully connected (all 268 rooms reachable from BFS), the combat system has been overhauled, and narrative phases 1–5 have shipped. A playtest suite run against the dev mock will catch regressions — silent null-ref errors, broken state transitions on move/combat/dialogue sequences, and edge cases where verb handlers compose incorrectly — before they reach the branch protection gate.

This convoy produces zero source-code changes. Howlers report any engine defects they discover using `it.fails()` or `.skip` with a `// TODO: flagged by playtest convoy — engine bug` comment and a written finding in their commit message. Defects become the next convoy's scope.

---

## Goal

Ship a `tests/playtest/` suite that: (1) exercises three distinct archetypes through 50 rooms each across at least 10 zones, (2) covers 100% of the 42 normalized verbs the parser understands, (3) asserts on compound state at every stage, and (4) runs in under 60 seconds total against the dev mock.

---

## Scope

**In scope:**
- `tests/playtest/harness.ts` — shared PlayerSession class (H1)
- Three character playthrough files: enforcer, broker, wraith (H2, H3, H4)
- Full verb coverage test file (H5)
- Cross-cutting tests: save/load round-trip, interrupts, death/rebirth, verb safety (H6)

**Out of scope:**
- Source code changes to engine, parser, or action handlers
- Tests for React components or UI
- Tests for the eval suite (`tests/eval/`)
- Performance benchmarking or load testing
- Coverage reporter / HTML output (deferred)

**Ambiguities resolved:**
- Room paths are scripted (deterministic room IDs), not random-walk, so tests are not flaky by path
- `it.fails()` or `.skip` used for discovered engine bugs, never just a plain skip; comment must name the symptom
- All tests run against the dev mock (`isDevMode()` = true); no real Supabase
- RNG-driven systems (hollowEncounter, itemSpawns, npcSpawns) are mocked to deterministic returns in the harness
- H1 must finalize and commit before H2–H6 begin; if harness API changes, H1 re-delivers first

---

## Character Specs

### Character A — Kael Morrow (Enforcer)

| Field | Value |
|-------|-------|
| Class | `enforcer` |
| Stats | vigor 8, grit 6, reflex 4, wits 2, presence 2, shadow 2 |
| maxHp | 20 (formula: `8 + (8-2)*2`) |
| PersonalLoss | `community` — "Lost the settlement at Animas Fork to a Hollow swarm. Forty-three people." |
| Path emphasis | Combat-primary. Fights every enemy; uses called shots, ability (overwhelm), defend, wait, analyze. |
| Play summary | Walk Crossroads and River Road, push into The Breaks and Salt Creek. Trades blows; does not flee unless near death. |

**Point-buy validation:** totalBonus = 12, expected = 12. PASS.

### Character B — Sable Rein (Broker)

| Field | Value |
|-------|-------|
| Class | `broker` |
| Stats | vigor 2, grit 4, reflex 2, wits 4, presence 6, shadow 6 |
| maxHp | 8 (formula: `8 + (2-2)*2`) |
| PersonalLoss | `promise` — "Promised a contact at Covenant a way out before the gates closed. Never came back." |
| Path emphasis | Social/trade-primary. Opens dialogue trees, runs trade sessions, buys/sells, gives items for quest flags. Flees combat. |
| Play summary | Crossroads full market circuit, then all of Covenant, then Duskhollow. Exhausts NPC trees, tracks faction rep. |

**Point-buy validation:** totalBonus = 12, expected = 12. PASS.

### Character C — Vesna (Wraith)

| Field | Value |
|-------|-------|
| Class | `wraith` |
| Stats | vigor 2, grit 4, reflex 4, wits 6, presence 2, shadow 6 |
| maxHp | 8 (formula: `8 + (2-2)*2`) |
| PersonalLoss | `identity` — "The person she was before the facility doesn't have a name anymore." |
| Path emphasis | Stealth/exploration-primary. Sneak moves, search, examine extras, reads lore, unlocks locked exits, stashes. |
| Play summary | Crossroads (including locked basement) then northeast arc: Pine Sea, The Stacks, The Deep. |

**Point-buy validation:** totalBonus = 12, expected = 12. PASS.

---

## Path Sketches

Room IDs are verified against zone files. The Howler's responsibility is to pick the exact per-room sequence within the zone; the plan mandates zones visited and minimum unique room count. Rooms with `cycleGate` or `questGate` that would block cycle-1 access must be skipped.

### Character A — Kael Morrow (Enforcer): Combat Circuit

Zones (in order): `crossroads` (5 rooms) → `river_road` (10 rooms) → `the_breaks` (10 rooms) → `salt_creek` (10 rooms) → return through `river_road` (5 new rooms) → `crossroads` (10 new rooms including market, The Pit, overlook)

Zone sketch:
- Crossroads entry 5: `cr_01_approach` → `cr_02_gate` → `cr_03_market_south` → `cr_18_the_pit` → `cr_10_overlook`
- River Road 10: `rr_01_west_approach` through `rr_10` (bridge ruins, ford, east bank, river camp area)
- The Breaks 10: `br_01_canyon_mouth` through `br_10` (canyon country, high enemy density)
- Salt Creek 10: `sc_01_outer_perimeter` through `sc_10` (fortified zone, faction patrols)
- River Road return 5: `rr_11` through `rr_15` (rooms not visited in first pass)
- Crossroads 10: `cr_04_market_center`, `cr_05_market_north`, `cr_06_info_broker`, `cr_07_patch_clinic`, `cr_08_job_board`, `cr_09_campground`, `cr_11_old_gas_station`, `cr_12_gas_station_basement`, `cr_13_water_station`, `cr_14_leather_shop`

Combat milestones: at least 5 distinct enemy encounters; at least one called shot (`attack_called`), one `ability` use, one `defend`, one `wait` (assert `waitingBonus === 3`), one `analyze`; one enemy defeat with loot drop; one `flee` attempt from a scripted near-death fight.

### Character B — Sable Rein (Broker): Social Circuit

Zones (in order): `crossroads` (all 15 rooms) → `covenant` (all 28 rooms, skip any with hard quest/cycle gates) → `duskhollow` (rooms 1–15, `dh_01` through approximately `dh_15`)

Zone sketch:
- All 15 Crossroads rooms: full market circuit through `cr_01` → `cr_14`, including `cr_18_the_pit` (observe only)
- All accessible Covenant rooms (`cv_01_main_gate` through `cv_28`): gates → courthouse → main street → residential → chapel → outlying buildings → underground access
- Duskhollow 15 rooms: `dh_01_long_drive` → `dh_02_entrance_hall` → `dh_03_great_hall` → `dh_04_vespers_study` → `dh_05_tithe_room` → continuing through `dh_15`

Social milestones: at least 8 distinct NPC dialogue trees opened; at least 3 `onEnter` effects triggered (setFlag, grantItem, grantRep); one full `trade` session with `buy` and `sell`; one `give` to NPC advancing a quest flag; `rep` checked after each faction interaction; one `flee` from the single scripted combat encounter.

### Character C — Vesna (Wraith): Exploration Circuit

Zones (in order): `crossroads` (10 rooms including basement) → `the_pine_sea` (15 rooms) → `the_stacks` (15 rooms) → `the_deep` (10 rooms)

Zone sketch:
- Crossroads 10: `cr_01_approach` → `cr_11_old_gas_station` → `cr_12_gas_station_basement` (locked exit test) → `cr_07_patch_clinic` → 6 more market rooms
- Pine Sea 15: `ps_01_tree_line` through `ps_15`; use `sneak` on at least 3 moves; `search` in at least 3 rooms
- The Stacks 15: `st_01_approach` through `st_15`; `examine_extra` on every available extra keyword; `read` on any lore items; `unlock` at least one locked exit
- The Deep 10: `dp_01_mine_entrance` through `dp_10`; `stash` / `unstash` round-trip; `drink` at water source; `camp` if `campfireAllowed` room found

Exploration milestones: at least 10 `examine_extra` calls with assertions; at least 3 successful skill-check extras (wits=6 makes DC≤6 checks reliable); `sneak` succeeds at least once; `unlock` fires on locked exit; `search` reveals item; `stash` + `unstash` round-trip asserted; `read` lore item.

**Coverage totals:** A=50, B=50 (crossroads 15 + covenant 28 + duskhollow 15 ≈ 58; Howler caps at 50 unique first-visits), C=50. Crossroads overlaps ~10 rooms between A and B. Total unique rooms: at minimum 50 + 35 + 50 = 135, comfortably above the 120 target. Zones: crossroads, river_road, the_breaks, salt_creek, covenant, duskhollow, the_pine_sea, the_stacks, the_deep = 9 of 13 within the three paths. H5 adds spot-check rooms in `the_ember` and `the_dust`, bringing the total to 11 of 13.

---

## Verb Coverage Matrix

All 42 normalized verbs confirmed from `lib/parser.ts`. Each must fire at least once with an assertion on the engine response.

| Verb (normalized) | Covered by | Scenario |
|---|---|---|
| `go` | H2, H3, H4 | all character paths — directional movement |
| `swim` | H5 | dedicated verb-coverage test or verb-safety fallback |
| `climb` | H5 | dedicated verb-coverage test or verb-safety fallback |
| `sneak` | H4 | Vesna sneak moves through Pine Sea (at least 3) |
| `look` | H2, H3, H4 | every room entry: assert description returned |
| `examine_extra` | H4 | Vesna examines room extras; also H2 at Crossroads |
| `examine_spatial` | H5 | `look under`, `look behind`, `look inside` — three subtests |
| `search` | H4 | Vesna searches rooms in Pine Sea and The Stacks |
| `smell` | H5 | sensory verb test — assert message, no crash |
| `listen` | H5 | sensory verb test — assert message, no crash |
| `touch` | H5 | sensory verb test — assert message, no crash |
| `read` | H4 | Vesna reads lore items in The Stacks |
| `journal` | H5 | system verb — assert message returned |
| `take` | H2, H4 | Kael takes loot drops; Vesna takes ground items |
| `drop` | H5 | drop item: assert inventoryCount decreases, room items increases |
| `use` | H2, H4 | consumable use: assert HP delta or use-text message |
| `equip` | H2 | Kael equips weapon / armor: assert `equipped` flag |
| `unequip` | H2 | Kael unequips item: assert `equipped` false |
| `stash` | H4 | Vesna stashes a key item: assert stashCount increases |
| `unstash` | H4 | Vesna retrieves from stash: assert stashCount decreases |
| `inventory` | H2, H3, H4 | post-pickup inventory count assertions |
| `attack` | H2 | Kael attacks shuffler: combat state active |
| `attack_called` | H2 | Kael called-shot head: parses to attack_called |
| `flee` | H3 | Sable flees: combatState becomes null |
| `ability` | H2 | Kael fires overwhelm: `abilityUsed = true` |
| `defend` | H2 | Kael defends: `defendingThisTurn = true` |
| `wait` | H2 | Kael waits: `waitingBonus === 3` |
| `analyze` | H2 | Kael analyzes enemy: message returned |
| `rest` | H3 | Sable rests in safe zone: assert HP recovery |
| `camp` | H4 | Vesna camps if campfireAllowed room found |
| `drink` | H4 | Vesna drinks at water source in The Deep |
| `talk` | H3 | Sable opens at least 8 NPC dialogue trees |
| `dialogue_choice` | H3 | Sable picks numbered branch options |
| `dialogue_leave` | H3 | Sable types `leave` to exit dialogue: activeDialogue cleared |
| `dialogue_blocked` | H6 | While in active dialogue, issue non-numeric input: blocked message |
| `open` | H4 | open container/door where present in The Stacks or The Deep |
| `trade` | H3 | Sable opens trade menu |
| `buy` | H3 | Sable buys item: currency decreases, inventoryCount increases |
| `sell` | H3 | Sable sells item: currency increases, inventoryCount decreases |
| `give` | H3 | Sable gives item to NPC: quest flag set |
| `unlock` | H4 | Vesna unlocks locked exit: subsequent move succeeds |
| `travel` | H3 | Sable fast-travels after discovering a waypoint |
| `map` | H5 | map display: assert message array non-empty |
| `stats` | H2 | post-creation stats check: values match spec |
| `equipment` | H2 | after equipping: assert equipped item shown |
| `rep` | H3 | after faction interaction: assert rep value |
| `quests` | H3 | after quest flag set: assert flag appears |
| `boost` | H6 | level-to-3 then boost vigor: stat increases, pendingStatIncrease false |
| `help` | H5 | help output: assert at least 10 lines |
| `save` | H6 | save/load round-trip: assertSnapshotEqual before and after |
| `craft` | H5 | craft recipe: either inventory change or clean error |
| `restart` | H6 | two-step confirmation gate tested |
| `hint` | H5 | hint output: assert message returned |

---

## Frozen Harness API

`tests/playtest/harness.ts` — H2 through H6 import from this file only. H1 must finalize and commit before other Howlers begin.

```typescript
// tests/playtest/harness.ts — frozen API

import type { GameState, StatBlock, CharacterClass, PersonalLossType } from '@/types/game'
import { GameEngine } from '@/lib/gameEngine'

export interface CharacterSpec {
  name: string
  stats: StatBlock
  characterClass: CharacterClass
  personalLoss: { type: PersonalLossType; detail: string }
}

export interface SessionSnapshot {
  playerId: string
  roomId: string
  hp: number
  maxHp: number
  inventoryCount: number
  stashCount: number
  xp: number
  level: number
  cycle: number
  totalDeaths: number
  questFlags: Record<string, string | boolean | number>
  factionReputation: Partial<Record<string, number>>
  discoveredRoomIds: string[]
  combatActive: boolean
  playerDead: boolean
  narrativeKeys: string[]
}

export class PlayerSession {
  readonly engine: GameEngine

  constructor()

  /** Create character and initialize state. Must be called before any cmd(). */
  async init(spec: CharacterSpec): Promise<GameState>

  /** Execute one raw command string via engine.executeAction(). Returns resulting GameState. */
  async cmd(command: string): Promise<GameState>

  /** Walk a list of direction strings in sequence. Asserts each move lands in a different room. */
  async walk(directions: string[]): Promise<void>

  /** Snapshot current engine state for assertions. */
  snapshot(): SessionSnapshot

  /** Assert snapshot matches partial expected values. Throws descriptive error on mismatch. */
  expectState(partial: Partial<SessionSnapshot>): void

  /** Assert the most recent N messages (default 5) include a substring. */
  expectMessage(substring: string, inLastN?: number): void

  /** Assert no message of type 'error' in the most recent N messages (default 5). */
  expectNoError(inLastN?: number): void

  /** Reset engine to a blank state (call before a new scenario in the same file). */
  reset(): void
}

/** Build a GameEngine with all narrative pipeline modules mocked to deterministic no-ops
 *  and spawn tables shimmed to return unchanged rooms. All Howler test files must
 *  use this factory — never construct GameEngine directly in playtest files. */
export function makeTestEngine(): GameEngine

/** Deep-equality check on two SessionSnapshots. Throws on any field mismatch. */
export function assertSnapshotEqual(a: SessionSnapshot, b: SessionSnapshot): void
```

All Howlers must import `PlayerSession`, `CharacterSpec`, `SessionSnapshot`, `makeTestEngine`, and `assertSnapshotEqual` exclusively from `../playtest/harness`. No direct `GameEngine` construction in test files.

---

## File Ownership Matrix

| Howler | Creates | Modifies |
|--------|---------|----------|
| H1 | `tests/playtest/harness.ts` | none |
| H2 | `tests/playtest/enforcer-path.test.ts` | none |
| H3 | `tests/playtest/broker-path.test.ts` | none |
| H4 | `tests/playtest/wraith-path.test.ts` | none |
| H5 | `tests/playtest/verb-coverage.test.ts` | none |
| H6 | `tests/playtest/cross-cutting.test.ts` | none |

No file appears in more than one Howler's ownership. H2–H6 all read (import from) `tests/playtest/harness.ts` but do not modify it.

Note: `tests/playtest/harness.ts` is shared infrastructure. It is owned exclusively by H1. Any breaking API change mid-convoy requires H1 to re-deliver and all downstream Howlers to update imports.

---

## Per-Howler Specs

### H1 — Harness

**Deliverables:** `tests/playtest/harness.ts` implementing the frozen API. Includes all mock boilerplate: narrative pipeline silenced (hollowPressure, npcInitiative, companionSystem, factionWeb, playerMonologue, narratorVoice, worldEvents), Supabase dev mock, and a spawn-table shim that makes `_applyPopulation` return the room unchanged (deterministic NPC/enemy/item presence). Must export `PlayerSession`, `makeTestEngine`, `CharacterSpec`, `SessionSnapshot`, `assertSnapshotEqual`. Includes a self-test `describe('harness smoke')` block.

**Files:** `tests/playtest/harness.ts` (create)

**Tests:** Self-test: create a PlayerSession with Enforcer spec, call `cmd('look')`, assert messages.length > 0 and `snapshot().roomId === 'cr_01_approach'`. Assert `snapshot().hp === 20` for Enforcer (vigor 8).

**Depends on:** nothing

**Effort:** M

**Pre-mortem:** If this task fails or takes 3x longer, it will be because: `createCharacter()` needs a fully wired Supabase mock chain plus auth mock returning a user object — the pattern exists in `gameEngine-core.test.ts` but the mock is ~60 lines and any missing piece fails silently with a "Not authenticated" throw. Mirror that mock exactly before adding harness logic.

**Notes:** Do not use `any`. Derive all state access from `GameState` and `Player` types in `@/types/game`. The spawn-table shim must intercept `_applyPopulation` at the engine level, not by mocking `@/lib/spawn`.

---

### H2 — Enforcer Path

**Deliverables:** `tests/playtest/enforcer-path.test.ts` — 50-room playthrough for Kael Morrow. Covers character creation assertions, 50-room walk (crossroads → river_road → the_breaks → salt_creek circuit), at least 5 combat encounters with full state-transition assertions, called shot, ability, defend, wait, analyze, loot pickup, equip/unequip, stash, and `stats` / `equipment` system commands.

**Files:** `tests/playtest/enforcer-path.test.ts` (create)

**Tests:**
- Post-creation: `ledger` not null, `snapshot().hp === 20`, `snapshot().roomId === 'cr_01_approach'`
- After stat check: `player.vigor === 8`, `player.characterClass === 'enforcer'`
- Per move: `snapshot().roomId` changes; `snapshot().discoveredRoomIds` length grows
- Combat enter: `snapshot().combatActive === true` after first `attack` command
- Combat resolve: `snapshot().combatActive === false` after enemy defeated; `snapshot().xp > 0`
- Called shot: `cmd('attack shuffler head')` — assert message returned, no crash
- Ability: `cmd('ability')` — assert `engine.getState().combatState?.abilityUsed === true`
- Defend: `cmd('defend')` — assert `defendingThisTurn === true`
- Wait: `cmd('wait')` — assert `waitingBonus === 3`
- Analyze: `cmd('analyze shuffler')` — assert message returned
- Loot: after enemy defeated, `take` loot item — assert `inventoryCount` increases
- Equip: `cmd('equip <item>')` — assert `equipped === true` on that inventory item
- Unequip: assert `equipped === false` after unequip
- 50-room milestone: after full walk, `snapshot().discoveredRoomIds.length >= 50`

**Depends on:** H1

**Effort:** L

**Pre-mortem:** If this task fails or takes 3x longer, it will be because: The Breaks exits from cr_01 have `skillGate` DC 5 on the south exit (`survival` check). Kael's wits/survival is low. Howler must read `cr_01_approach.richExits.south.skillGate` and either find a non-gated alternate route into The Breaks or mock the skill check to pass for this test.

**Notes:** Combat mocks must use the same `vi.mock('@/lib/combat', ...)` pattern as `tests/integration/combat.test.ts` to deterministic outcomes. Enforcer's `overwhelmActive` ability auto-hits and ignores armor — assert `overwhelmActive` flag set on `combatState` before it clears on enemy attack.

---

### H3 — Broker Path

**Deliverables:** `tests/playtest/broker-path.test.ts` — 50-room playthrough for Sable Rein. Covers all Crossroads rooms, all accessible Covenant rooms, 15 Duskhollow rooms; at least 8 NPC dialogue trees opened with node-transition assertions; `onEnter` effects (setFlag, grantItem, grantRep, grantNarrativeKey) each asserted at least once; full trade session; `give` to NPC; `flee` from combat; `rest`; `travel` fast-travel; `rep` / `quests` commands.

**Files:** `tests/playtest/broker-path.test.ts` (create)

**Tests:**
- Post-creation: `snapshot().hp === 8`, `player.presence === 6`
- Per dialogue tree: `engine.getState().activeDialogue?.currentNodeId` transitions on `cmd('1')`
- `onEnter.setFlag`: `snapshot().questFlags[flag]` set after entering grantFlag node
- `onEnter.grantItem`: `snapshot().inventoryCount` increases
- `onEnter.grantRep`: `snapshot().factionReputation[faction]` changes
- `onEnter.grantNarrativeKey`: `snapshot().narrativeKeys` array grows
- `dialogue_leave`: `engine.getState().activeDialogue` is undefined after `cmd('leave')`
- Trade: `cmd('buy <item>')` — `inventoryCount` increases
- Trade: `cmd('sell <item>')` — assert currency item (ammo_22lr) increases in inventory
- Give: `cmd('give <item> <npc>')` — assert quest flag set
- Flee: `snapshot().combatActive === false` after flee; `snapshot().roomId` changes
- Rest: `snapshot().hp` increases after `cmd('rest')` in safeRest room
- Travel: `snapshot().roomId` jumps to waypoint room after `cmd('travel crossroads')`
- 50-room milestone: `snapshot().discoveredRoomIds.length >= 50`

**Depends on:** H1

**Effort:** L

**Pre-mortem:** If this task fails or takes 3x longer, it will be because: Covenant has `reputationGate` exits requiring accord/covenant_of_dusk rep >= 1. Sable starts at rep 0. Howler must audit Covenant room `richExits` and either route around gated exits or seed rep in test setup before entering Covenant. Secondary risk: finding an NPC that accepts a `give` interaction requires cross-referencing `data/npcs.ts` trade fields and `data/dialogueTrees.ts` `removeItem`/`grantItem` patterns.

**Notes:** Broker's intimidate ability: if tested in combat, assert `enemyIntimidated = true` on combatState. The `give` handler in `lib/actions/social.ts` (`handleGive`) is the target — use Patch at `cr_07_patch_clinic` as the NPC, which has documented quest interactions in release notes.

---

### H4 — Wraith Path

**Deliverables:** `tests/playtest/wraith-path.test.ts` — 50-room playthrough for Vesna. Covers Crossroads (including locked basement exit), Pine Sea sneak path, The Stacks examine/lore/unlock path, The Deep stash/drink/camp path; at least 10 `examine_extra` calls with extras state assertions; at least 3 successful skill-check extras; `sneak` move asserts; `unlock` on locked exit; `search` reveals item; `stash`/`unstash` round-trip; `read` lore item.

**Files:** `tests/playtest/wraith-path.test.ts` (create)

**Tests:**
- Post-creation: `snapshot().hp === 8`, `player.shadow === 6`, `player.wits === 6`
- Sneak: `cmd('sneak north')` — assert roomId changes; assert no new combatState (sneak suppressed encounter)
- `examine_extra`: `cmd('examine <keyword>')` — assert message contains description text (not error)
- Skill-check extra: assert `snapshot().questFlags[flag]` set on extra with `skillCheck.dc <= 6`
- `search`: assert message returned; assert `inventoryCount` increases when item found
- `unlock`: `cmd('unlock north')` — subsequent `cmd('north')` succeeds (roomId changes, no error)
- `stash <item>`: assert `snapshot().stashCount` increases, `snapshot().inventoryCount` decreases
- `unstash <item>`: assert `snapshot().stashCount` decreases, `snapshot().inventoryCount` increases
- `read <item>`: assert message returned contains lore text (not error)
- `drink`: assert message returned at water source
- `camp`: assert HP recovery if campfireAllowed room found; else skip gracefully
- 50-room milestone: `snapshot().discoveredRoomIds.length >= 50`

**Depends on:** H1

**Effort:** L

**Pre-mortem:** If this task fails or takes 3x longer, it will be because: The Stacks and The Deep have rooms with `cycleGate: 2` or `questGate` requirements. Howler must read every room definition in `data/rooms/the_stacks.ts` and `data/rooms/the_deep.ts` for gate fields, excluding gated rooms from the scripted path. The Wraith shadowstrike ability sets `cantFlee = true` after use — if used and enemy not defeated, the test is stuck. Test ability only in encounters where enemy hp is mockable to low values.

**Notes:** Shadow=6 should reliably pass sneak exit checks (DC typically 4–6 in Pine Sea). Wits=6 makes DC≤6 skill-check extras reliable. The Wraith's `shadowstrike` sets `shadowstrikeActive` and `cantFlee`; verify `abilityUsed = true` after activation.

---

### H5 — Verb Coverage

**Deliverables:** `tests/playtest/verb-coverage.test.ts` — covers every verb in the matrix not already owned by H2–H4: `swim`, `climb`, `examine_spatial`, `smell`, `listen`, `touch`, `journal`, `drop`, `craft`, `map`, `help`, `hint`. Includes spot-check room entries in `the_ember` and `the_dust` zones to push zone coverage to 11. Each verb fires at least once with assertion on messages and state.

**Files:** `tests/playtest/verb-coverage.test.ts` (create)

**Tests:**
- `swim north` / `climb north` — assert message returned, no crash; if no swim/climb exit in current room, assert safe error message
- `examine_spatial`: `cmd('look under table')` — assert parses to `examine_spatial`, message returned
- `cmd('look behind wall')` — same pattern
- `cmd('look inside container')` — same pattern
- `smell` / `listen` / `touch` — assert message returned, not `unknown` verb
- `journal` — assert message returned
- `drop <item>` (with item in inventory) — assert `inventoryCount` decreases; no crash
- `drop nonexistent` — assert safe error message, no crash, no state change
- `craft` (check `data/recipes.ts` for a valid recipe, seed required items) — assert either craft success (inventoryCount changes) or clean error
- `map` — assert messages array length > 0
- `help` — assert message text contains at least 10 distinct command names
- `hint` — assert message returned
- `dialogue_blocked` test: open dialogue via `talk <npc>`, then `cmd('inventory')` — assert blocked message
- Spot-check `the_ember`: enter `em_01_the_approach`, `cmd('look')` — assert `engine.getState().currentRoom?.zone === 'the_ember'`
- Spot-check `the_dust`: enter `du_01_dust_edge`, `cmd('look')` — assert zone === `the_dust`

**Depends on:** H1

**Effort:** M

**Pre-mortem:** If this task fails or takes 3x longer, it will be because: `craft` requires reading `data/recipes.ts` to find a recipe with ingredients that exist in `data/items.ts`, then seeding those items into the test inventory. If recipes are complex or have unlock gates, the test needs to be narrowed to the simplest available recipe.

**Notes:** `swim` and `climb` exits exist in specific rooms (waterfall in Pine Sea, mine shaft in The Deep). If the harness mock makes `getRoom` return a deterministic room without those exits, the verb will return a safe error — that is still a valid passing test as long as no crash occurs and a message is returned.

---

### H6 — Cross-Cutting Tests

**Deliverables:** `tests/playtest/cross-cutting.test.ts` — four scenario groups.

1. **Save/Load Round-Trip:** Create Enforcer, take 10 commands, call `cmd('save')`, call `snapshot()` to capture before-state, simulate `loadPlayer()` using the dev mock DB row written by `_savePlayer()`, call `assertSnapshotEqual(before, after)` on all fields except `log`.
2. **Interrupt Handling:** (a) In active combat, issue `cmd('north')` — assert `snapshot().combatActive === true` still, error message returned; (b) in active dialogue, issue `cmd('attack npc')` — assert `activeDialogue` still set, blocked message; (c) with `playerDead = true`, issue `cmd('inventory')` — assert message routes to restart hint.
3. **Death/Rebirth Cycle:** Kill Enforcer by injecting repeated combat damage until `playerDead = true`; assert `snapshot().totalDeaths === 1` and `engine.getState().ledger?.cycleHistory?.length === 1`. Simulate rebirth via `rebirthWithStats()` — assert `snapshot().cycle === 2`, `snapshot().hp === snapshot().maxHp`, ledger `discoveredRoomIds` persists.
4. **Verb Safety:** Fire all invalid forms — `take nonexistent_item`, `attack nobody`, `travel unknown_zone`, `use nonexistent_item`, `equip nonexistent_item`, `boost badstat` — each in a separate `it` block; assert each returns a message of type `'error'` or `'system'`, no exception thrown.
5. **Boost Stat:** Inject XP to level 3 (`player.xp = 150`), trigger `_checkLevelUp()`, assert `pendingStatIncrease === true`, call `cmd('boost vigor')`, assert `player.vigor` increases by 1 and `pendingStatIncrease === false`.
6. **Restart Gate:** `cmd('restart')` — assert prompt for confirmation returned; `cmd('CONFIRM RESTART')` — assert state reset (player becomes null or new game starts).

**Files:** `tests/playtest/cross-cutting.test.ts` (create)

**Tests:** All scenarios above, each in a separate `describe` block with `beforeEach` state reset.

**Depends on:** H1

**Effort:** L

**Pre-mortem:** If this task fails or takes 3x longer, it will be because: save/load round-trip requires the Supabase mock to persist what `_savePlayer()` writes so `loadPlayer()` can read it back — this is the hardest mock chain in the project. The existing `save-load-roundtrip.test.ts` shows the pattern (`makePlayersBuilder()` that captures `.update()` payload and returns it via `.maybeSingle()`), but it is ~80 lines of mock scaffolding. Copy it directly rather than reinventing.

**Notes:** Use `expect.assertions(N)` in verb-safety tests to guard against tests silently passing by throwing before the assertion. The restart flow checks for the exact string `'CONFIRM RESTART'` — test both the prompt step (returns confirmation message) and the confirm step (state resets).

---

## Acceptance Criteria

- [ ] All playtest tests pass: `pnpm test --run` green, no skipped tests except explicitly flagged `it.fails()` engine bugs
- [ ] `npx tsc --noEmit` clean across `tests/playtest/` — zero `any` types
- [ ] Verb coverage: all 42 normalized verbs in the matrix are covered by at least one asserting test
- [ ] Room coverage: sum of unique room IDs discovered across the three character sessions is at least 120
- [ ] Zone coverage: at least 10 of 13 zones entered (confirmed by `room.zone` field assertions)
- [ ] Test runtime: full `pnpm test --run` including playtest suite completes in under 60 seconds
- [ ] No source code modified — only files under `tests/playtest/` created
- [ ] Any `it.fails()` entry includes a comment with: symptom, expected value, actual value, and recommended next-convoy fix target

---

## Risks

1. **RNG combat breaks path determinism.** `playerAttack`, `enemyAttack`, and `flee` all use dice rolls. Without mocking, combat outcomes vary and tests become flaky. Mitigation: harness factory (`makeTestEngine`) must mock `@/lib/combat` to deterministic functions following the exact pattern in `tests/integration/combat.test.ts`. H2 is most exposed; H4 and H3 also fight at least once.

2. **Skill-gate exits block scripted paths.** `richExits` in crossroads (survival DC 5/8), river_road, and possibly covenant have skill gates. Characters with low relevant stats may fail. Mitigation: each Howler (H2–H4) must read `richExits` in the actual zone files before committing to a route. The plan's character stats are designed to match the primary path (Kael has vigor/grit for combat zones, Vesna has wits/shadow for exploration zones) but gate DCs must be spot-checked.

3. **Engine bugs surface mid-path.** A Howler scripting room 30 discovers a real engine defect — for example, `handleMove` leaves `combatState` non-null in a specific edge case. The test cannot proceed. Mitigation: use `it.fails()` with a clear comment, reduce the walk to the last clean room, and report. The suite must still pass overall on the remaining tests.

4. **Save/load mock threading complexity.** `_savePlayer()` writes to `players`, `player_ledger`, and `player_inventory` tables. The dev mock must capture all three and return them correctly to `loadPlayer()`. The `save-load-roundtrip.test.ts` shows the pattern but it is non-trivial. Mitigation: H6 must copy the `makePlayersBuilder` pattern verbatim rather than creating a new mock approach.

5. **NPC spawn probability.** `_applyPopulation` rolls random spawn chances (0.20–0.90 per NPC entry). If the harness doesn't shim this, NPCs may not be present in a room and `talk <npc>` silently fails. Mitigation: H1 harness shims `_applyPopulation` to return the room unchanged (static `npcs` array only, no random rolls). H3 must use NPC IDs that appear in the static `npcs: []` arrays of Crossroads rooms, or coordinate with H1 on the shim strategy.

6. **cycleGate and questGate rooms block paths.** Several rooms in The Stacks, The Deep, and Duskhollow carry `cycleGate: 2` or `questGate` requirements. At cycle=1 with no quest flags, these rooms return an error on entry attempt. Mitigation: H3 and H4 must read every room definition in their target zones, enumerate gated rooms, and route around them. The plan deliberately targets early-arc zones (no known cycleGate=2 in Pine Sea or the_stacks lower floors) but Howlers must verify.

7. **Test runtime blowout.** Six test files, ~200 assertions each, with async `executeAction()` calls chained over 50+ steps per character. Even against an in-memory mock, 300 async awaits per file could hit the 60-second wall. Mitigation: group scenarios with `beforeAll` state setup instead of re-creating the engine per test; batch verifications into fewer `cmd` calls where possible; mock all Supabase async calls to resolve immediately.

---

## Open Questions

- [ ] Does `handleSneak` suppress hollow encounters deterministically or only probabilistically? — Blocks: H4 sneak assertions. Default if unresolved: mock `Math.random` to `() => 0.0` within sneak tests so the encounter spawn chance always resolves to zero.
- [ ] Does `give <item> <npc>` require the NPC to have a specific `tradeInventory` field, or will any NPC present in the room accept a give? — Blocks: H3 give test. Default if unresolved: use Patch at `cr_07_patch_clinic` who has documented quest interactions; cross-check `handleGive` in `lib/actions/social.ts` before committing to the NPC target.

---

## Definition of Done

- [ ] Code written and self-reviewed (no `any`, no unused imports, no dead branches)
- [ ] `npx tsc --noEmit` passes
- [ ] `pnpm test --run` passes (all test files in `tests/playtest/` green or explicitly flagged)
- [ ] Verb coverage matrix: 42/42 verbs covered
- [ ] Unique rooms covered: at least 120 across three sessions
- [ ] Zones entered: at least 10 of 13
- [ ] Engine bugs found logged as findings in commit messages — not patched in source
- [ ] PR description lists any `it.fails()` entries with bug symptom and recommended fix
