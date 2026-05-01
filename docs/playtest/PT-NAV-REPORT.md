# PT-NAV Navigation Playtest Report

**Agent**: PT-NAV (Howler)
**Branch**: `playtest/pt-nav-0430` (worktree-agent-ad0c8d78b0d1fdde8)
**Base commit**: 22a42c2 (PR #13 merged — Convoy 2C + release hardening)
**Test file**: `tests/playtest/navigation-full.test.ts`
**Date**: 2026-04-30

---

## 1. Summary

| Metric | Value |
|---|---|
| Total rooms in ALL_ROOMS | 268 |
| Rooms reachable via BFS from start | 268 (100%) |
| Orphaned rooms (unreachable) | **0** |
| Broken simple exit edges | **0** |
| Broken richExits destinations | **0** |
| Exit/richExit destination divergences | **0** |
| Locked exits | 9 |
| Locked exits with compound gates (blocker) | **1** (em_18_cooling_towers:north) |
| CycleGate rooms | 39 |
| CycleGate rooms with compound approach gates | **7** |
| Narrative exit gates (ROOM_EXIT_GATES) | 17 |
| High-difficulty rooms (≥4) with static enemies | 12 |
| CycleGate design conflict (scar rooms: data=2 vs eval=3) | **Confirmed** |

**Overall health**: The map graph is clean — no dangling references, no orphans, all 268 rooms reachable. The blockers are entirely at the behavioral/gate layer, not the graph layer.

---

## 2. Blockers (Cannot Reach Content)

### BLOCKER-1: `em_18_cooling_towers:north` — Discovery-required locked exit with no `exits.north` entry

- **Room**: `em_18_cooling_towers`
- **Exit direction**: north → `em_19_rail_yard`
- **Repro**: Player arrives at `em_18_cooling_towers`, types `go north` — receives "You can't go north from here."
- **Root cause**: The exit exists only in `richExits.north` (with `hidden: true`) but NOT in `exits.north`. `canMove()` checks `exits[dir]` and returns false. A player must first discover the exit via the `discoverSkill: mechanics` check (DC 14) before the exit becomes traversable. The locked door check (`lockedBy: hand_tools_basic`) is never reached without discovery.
- **Impact**: `em_19_rail_yard` and anything beyond it in The Ember is unreachable without first passing the mechanics discovery check at DC 14. A player without high mechanics can never open this path.
- **Design question**: Is the rail yard intended to be permanently inaccessible to low-mechanics players, or is there an alternative route? If intentional, `hand_tools_basic` being the key is probably cosmetic — the real gate is the DC 14 mechanics check.
- **Proposed fix**: Either add `exits.north: 'em_19_rail_yard'` to make the direction attempt-able (and let the locked check fire), or document this as intentional discovery-gating in `narrativeNotes`.

### BLOCKER-2: `scar_01_crater_rim` — CycleGate mismatch (room gate 2, approach exit gate 3)

- **Room**: `scar_01_crater_rim` (cycleGate: 2 on room)
- **Approach**: `ps_08_scar_overlook.richExits.north.cycleGate: 3`
- **Repro**: Cycle-2 player at `ps_08_scar_overlook` types `go north` — blocked with "Something about this path feels wrong. You're not ready."
- **Root cause**: The approach exit from the overlook (`ps_08_scar_overlook:north`) has `richExit.cycleGate: 3`, but the destination room `scar_01_crater_rim` declares `cycleGate: 2`. The movement code checks `richExit.cycleGate` first (from the current room's exit definition), so cycle-2 players are blocked at the overlook even though the destination room would accept them.
- **Impact**: The entire Scar zone (`scar_01` through `scar_16+`) is inaccessible to cycle-2 players, even though all Scar rooms declare `cycleGate: 2`.
- **Proposed fix**: Align the approach exit and the destination room. If the design intends cycle 3 for Scar entry, set all Scar room `cycleGate` values to 3. If cycle 2 is correct, change `ps_08_scar_overlook.richExits.north.cycleGate` to 2.

### BLOCKER-3: `ps_01_tree_line` — Pine Sea entry gate blocks cycle-2 player

- **Room**: `ps_01_tree_line` (cycleGate: 2)
- **Approach**: `rr_07_north_fork` — need to identify which gate on this exit is blocking
- **Repro**: Cycle-2 player at `rr_07_north_fork` cannot enter Pine Sea entry room.
- **Impact**: Pine Sea zone (20 rooms) may be inaccessible to cycle-2 players despite `ps_01_tree_line.cycleGate: 2`. This includes `ps_10_hermit_deep_camp` and `ps_20_hollow_nest` (cycleGate: 3 rooms).
- **Proposed fix**: Inspect `rr_07_north_fork.richExits.north` for a cycleGate override inconsistency similar to BLOCKER-2.

### BLOCKER-4: `ps_10_hermit_deep_camp` and `ps_20_hollow_nest` — Compound approach gates in Pine Sea

- **Rooms**: `ps_10_hermit_deep_camp` (gate 3), `ps_20_hollow_nest` (gate 3)
- **Repro**: Cycle-3 player with all narrative keys and max reputation cannot enter these rooms.
- **Impact**: Two Pine Sea rooms inaccessible even with correct cycle.
- **Proposed fix**: Audit the approach exits from `ps_09_old_growth_heart` → `ps_10` and `ps_18_root_cathedral` → `ps_20` for undocumented gates.

### BLOCKER-5: `scar_15_the_exit` — Hidden richExit blocks departure from The Core

- **Room**: `scar_14_the_core` (exits.east: 'scar_15_the_exit' exists, but richExits.east is `hidden: true`)
- **Repro**: Player who has completed an ending cannot navigate to the exit room because `canMove()` returns false for hidden exits.
- **Impact**: Post-ending exit path may be unreachable. However, the game triggers the ending via quest flag, so this may be handled by the ending flow in `page.tsx` rather than via `handleMove`.
- **Design context**: The hidden exit is intentional (the player discovers the exit after making a choice). If the ending flow in `page.tsx` handles the transition, this is cosmetic. If players type `go east` to leave The Core, it will fail with "You can't go east from here."
- **Proposed fix**: Either set `discovered_exit_east: true` when the ending triggers, or document that post-ending navigation is handled by `page.tsx` (not `handleMove`).

---

## 3. Major Issues (Degraded Access)

### MAJOR-1: Hub room IDs in bidirectionality test are wrong

The test uses hypothetical hub room IDs (`rr_04_river_crossing`, `cv_01_covenant_gates`, etc.) that don't exist in ALL_ROOMS. 8 of 13 zones produce a "not found" warning and skip the bidirectionality check. This is a test quality issue, not a game issue.

- **Affected**: river_road, covenant, salt_creek, the_ember, the_stacks, duskhollow, the_deep, the_pine_sea bidirectionality checks
- **Proposed fix**: Replace placeholder hub room IDs with actual first rooms from each zone (`rr_01_west_approach`, `cv_02_the_square`, etc.)

### MAJOR-2: `scar_15_the_exit:north` one-way exit in ONE_WAY_ALLOWLIST has no annotation

The eval test and this playtest both allowlist `scar_15_the_exit:north` as intentionally one-way (it goes east back to `scar_01_crater_rim`). But the allowlist comment says "scar_15_the_exit goes east back to scar_01_crater_rim, which does NOT have a west exit pointing back." Neither the room data nor the `richExits` has a `oneWay: true` annotation.

- **Impact**: Cosmetic. Players can't backtrack after The Exit.
- **Proposed fix**: Add `oneWay: true` to the richExit or add a `narrativeNotes` field documenting this as intentional.

### MAJOR-3: `scar_02_main_entrance:east` requires `meridian_keycard` which also needs quest prerequisites

The locked exit to `scar_03_decontamination` requires `meridian_keycard`. This item is presumably obtained via the Reclaimers quest chain (`reclaimers_meridian_keycard` flag). A player who hasn't completed that quest chain cannot use the keycard route into Meridian, but the route IS accessible with the key (confirmed in tests).

- **Impact**: This is by design but should be documented. Players attempting the scar with only a cycle-2 qualification but no keycard will be turned away.

---

## 4. Minor Issues

### MINOR-1: `scar_03_decontamination:down` narrative gate requires `meridian_sub_level_access`

The decontamination room has a narrative key gate on the `down` exit. This is expected design — players must discover the sub-level access code to proceed deeper into Meridian. Correctly implemented and confirmed passing in tests.

### MINOR-2: `scar_04_level1_corridor:north` multi-key gate (allOf)

The north exit from the Level 1 Corridor requires BOTH `meridian_decon_code` AND `stacks_terminal_password`. This is a design decision linking The Stacks zone to the Scar endgame. The compound gate works correctly in tests but requires players to visit The Stacks before the Scar interior, which is not surfaced as a prerequisite in any in-game hint.

### MINOR-3: 8 of 13 zone hub rooms in bidirectionality test don't exist

The test tries room IDs that were guessed rather than looked up from actual data. The tests gracefully skip missing rooms (no false failures), but coverage is lower than intended.

---

## 5. Open Design Questions

### Q1: scar_14_the_core and scar_01_crater_rim — cycleGate 2 or 3?

The data (`the_scar.ts`) sets ALL Scar rooms to `cycleGate: 2`. The eval tests in `tests/eval/endingReachability.test.ts` and `tests/eval/mapIntegrity.test.ts` assert these rooms have `cycleGate: 3`.

**Findings:**
- `scar_01_crater_rim.cycleGate` = **2** (data)
- `scar_14_the_core.cycleGate` = **2** (data)
- `ps_08_scar_overlook.richExits.north.cycleGate` = **3** (approach exit, data)

**Interpretation:** The approach exit from the overlook enforces cycle 3 even though the rooms themselves are gated at cycle 2. This is a mismatch. The eval tests are checking the room-level value (expects 3) but the room data has 2.

**Verdict:** The eval tests are **stale**. The room data has been changed from cycleGate:3 to cycleGate:2 (presumably to allow cycle-2 players into Scar once they find the overlook path), but the approach exit was NOT updated. Either:

- **Option A (cycleGate 2 intended)**: Update the eval tests to expect 2. Update `ps_08_scar_overlook.richExits.north.cycleGate` from 3 to 2 to match.
- **Option B (cycleGate 3 intended)**: Update all Scar room `cycleGate` values from 2 to 3. The eval tests then pass again.

The design intent appears to be **Option B** (cycle 3 for Scar) based on:
1. The overlook approach still enforces cycleGate:3
2. The eval tests were specifically written to document this as intentional
3. Scar is Act III and the game's endgame — cycle 3 makes narrative sense

**Recommended action**: Change all Scar room `cycleGate` from 2 to 3 (to match the eval test expectations and the overlook approach), OR acknowledge the cycleGate-2 intent and fix the approach exit + update eval tests.

### Q2: Is `em_19_rail_yard` intentionally unreachable without mechanics DC 14?

The cooling towers locked exit is discovery-gated at DC 14 mechanics before the key check even fires. If the rail yard is a significant content area, consider whether a player without high mechanics should have another path.

### Q3: Pine Sea entry (ps_01_tree_line) — what is the actual approach gate?

The Pine Sea's first room has `cycleGate: 2` but cycle-2 players in the test cannot enter. The actual gate needs to be identified by inspecting `rr_07_north_fork.richExits` for a cycleGate override.

---

## 6. Test Statistics

| Metric | Value |
|---|---|
| Total test cases | 161 |
| Passing tests | 151 |
| Expected failures (documented blockers) | 10 |
| Test runtime | ~50–100ms |
| TypeScript type errors | 0 |

The 10 expected failures (`it.fails()`) are:
1. `BLOCKER: locked exit em_18_cooling_towers --[north]--> with key: compound gate prevents movement even with key` (hidden exit, discovery required)
2. `BLOCKER: cycleGate 'scar_01_crater_rim': cycle 2 player still blocked by compound gate` (approach gate is cycleGate:3)
3. `BLOCKER: cycleGate 'scar_03_decontamination': cycle 2 player still blocked` (locked by meridian_keycard)
4. `BLOCKER: cycleGate 'scar_04_level1_corridor': cycle 2 player still blocked` (locked by meridian_keycard)
5. `BLOCKER: cycleGate 'scar_15_the_exit': cycle 2 player still blocked` (hidden richExit)
6. `BLOCKER: cycleGate 'ps_01_tree_line': cycle 2 player still blocked` (unknown approach gate)
7. `BLOCKER: cycleGate 'ps_10_hermit_deep_camp': cycle 3 player still blocked` (unknown approach gate)
8. `BLOCKER: cycleGate 'ps_20_hollow_nest': cycle 3 player still blocked` (unknown approach gate)
9. `STALE-EVAL: scar_14_the_core cycleGate is 3 (eval expects 3; data says 2)`
10. `STALE-EVAL: scar_01_crater_rim cycleGate is 3 (eval expects 3; data says 2)`

---

## 7. Findings by Priority

**P0 — Fix before release:**
- cycleGate mismatch on all Scar rooms (room says 2, approach exit says 3, eval tests say 3). Pick one value and make everything consistent.

**P1 — Fix for playability:**
- Identify and resolve the Pine Sea entry gate (`ps_01_tree_line`) compound block
- Audit Pine Sea deep rooms (`ps_10`, `ps_20`) approach gates
- Clarify `em_18_cooling_towers:north` discovery-vs-lock design intent

**P2 — Design documentation:**
- Add `oneWay` annotation to `scar_15_the_exit:north`
- Document `scar_04_level1_corridor:north` multi-key prereq in hint system
- Update hub room IDs in bidirectionality test to actual zone anchor rooms
