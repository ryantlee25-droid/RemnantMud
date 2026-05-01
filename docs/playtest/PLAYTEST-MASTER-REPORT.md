# Playtest Master Report — 2026-05-01

**Triggered by**: User report of "issues trying to navigate and talk to people" after PR #13 (Convoy 2C + release hardening) merged.

**Approach**: Four-Howler parallel deep playtest covering every interaction surface — Navigation, Dialogue, Quests, Combat & Items. Three Howlers shipped clean test files + reports; the fourth (PT-QUEST) timed out twice and was completed inline via a static-analysis script.

**Output artifacts** (all on `dev/playtest-0430`):

```
tests/playtest/
  navigation-full.test.ts        # 161 tests, 10 documented failures
  dialogue-full.test.ts          # 156 tests, all green
  combat-items-full.test.ts      # 88 tests, all green
  quests-static.test.ts          # 5 known-orphan it.fails

docs/playtest/
  PT-NAV-REPORT.md
  PT-DIALOGUE-REPORT.md
  PT-COMBAT-REPORT.md
  PT-QUEST-REPORT.md
  PLAYTEST-MASTER-REPORT.md     # this file
```

---

## Top-of-page verdict — what it takes to be 100% playable

There are **3 hard blockers** and **5 soft blockers** that prevent the game from being 100% playable. Several "blockers" are actually well-flagged design ambiguities that just need a one-line decision. Below they're separated so the human can triage in priority order.

### Hard blockers (player gets stuck or sees broken state)

| # | Blocker | Domain | Where | Fix size |
|---|---|---|---|---|
| **B1** | Cycle-2 player blocked from Scar zone (16 rooms) due to approach-exit/destination-room cycleGate mismatch | Navigation | `data/rooms/the_pine_sea.ts` `ps_08_scar_overlook.richExits.north.cycleGate` says 3, all Scar rooms say 2 | One value to pick (2 or 3) and align both ends |
| **B2** | Cycle-2 player blocked from entire Pine Sea zone (20 rooms) by undocumented compound gate from `rr_07_north_fork` | Navigation | Approach exit on `rr_07_north_fork.richExits.north` has a hidden gate above what `ps_01_tree_line.cycleGate: 2` declares | Same shape as B1 — find the approach gate, decide |
| **B3** | 5 main-arc journal entries can NEVER show "complete" | Quests | Completion flags `broadcaster_found`, `fault_entity_observed`, `fault_scar_connection_confirmed`, `hollow_origin_understood`, `sanguine_origin_understood` have no setters anywhere | One `setFlag:` per quest (5 small edits) |

### Soft blockers (degraded but reachable, OR design-decision dependent)

| # | Issue | Domain | Severity | Where |
|---|---|---|---|---|
| **S1** | `em_18_cooling_towers:north` exit needs a DC-14 mechanics check before any attempt — low-mechanics players have no path to The Ember rail yard | Navigation | Major | Either intentional or needs alt-route. PT-NAV BLOCKER-1. |
| **S2** | `ps_10_hermit_deep_camp` and `ps_20_hollow_nest` (Pine Sea cycleGate-3 rooms) blocked even at cycle 3 with full keys | Navigation | Major | Hidden compound gates on approach. PT-NAV BLOCKER-4. |
| **S3** | `scar_15_the_exit` post-ending exit hidden — `go east` after ending may fail | Navigation | Major | Likely handled by `page.tsx` ending flow but needs confirmation. PT-NAV BLOCKER-5. |
| **S4** | `crossroads_signal_source` narrative key granted by Sparks but no `ROOM_EXIT_GATES` consumes it — dead reward | Dialogue | Major | Either remove the grant or add a gate that consumes it. PT-DIALOGUE finding 1. |
| **S5** | LootEntry `count` field not respected in `lib/actions/combat.ts:567-574` (inline loot loop bypasses `rollLoot()` utility) | Combat/Items | Major | One loop fix. PT-COMBAT finding 2. |

### Design ambiguities (need a human call before they're "fixable")

| # | Ambiguity | Where |
|---|---|---|
| **D1** | Is the Scar zone meant to gate at cycle 2 or cycle 3? Eval expects 3, room data says 2, approach exits say 3. | `tests/eval/endingReachability.test.ts` + `data/rooms/the_scar.ts` + `data/rooms/the_pine_sea.ts` |
| **D2** | Are the 5 orphan completion flags intentional dangling threads (player investigates but never gets closure) or unfinished writes? | `data/questDescriptions.ts` |
| **D3** | Should `game_ending` be one flag for all 4 endings, or 4 separate flags so the journal shows which ending was achieved? | `data/rooms/the_scar.ts:780-810`, `data/questDescriptions.ts` |

### Eval false positive to clean up

| # | Issue | Where |
|---|---|---|
| **E1** | `tests/eval/dialogueHealth.test.ts` reports 15 orphan `requiresFlag` entries (`hollow_kills_tier_1/2/3` × 5 NPCs). These are **not actually orphans** — `lib/gameEngine.ts:2219-2221` sets them when `hollowKills` reaches 5/20/50. The eval just doesn't know about gameEngine-set flags. | Add to `EXTERNALLY_SET_FLAGS` allowlist in the eval test. |

---

## What works (confirmed by the playtest)

- **Navigation graph integrity**: 268/268 rooms reachable from start. 0 dangling exit references (simple or rich). 0 orphan rooms. The game's connectivity is solid; the blockers are entirely at the gate-policy layer.
- **NPC dialogue trees**: 25 dialogue trees, 335 nodes, 619 branches. **0 broken `targetNode`/`failNode` references. 0 orphan dialogue nodes** (after subtracting the 3 known engine-entry exceptions). The Conversationalist Howler walked every tree by BFS and found no dead-ends that strand the player.
- **HollowKills tier wiring**: All 5 NPCs (Cross, Patch, Lev, Howard, Sparks) have tier 1/2/3 nodes correctly defined and reachable. `lib/gameEngine.ts:2219-2221` sets the flags at 5/20/50 kills as designed.
- **Boss intros + combat intros**: All 8 required bosses have both fields populated, and the display wiring (added on `dev/wave3-release-0430` commit `a51cf0e`) correctly fires intro text on first room entry and at combat start.
- **Combat round mechanics**: 88 representative scenarios pass, including AoE-on-death (Frenzy), flee, victory, defeat, and the H4 statBonus accumulation test (50 cycles, no drift).
- **Item invariants**: H6 armor slot exclusivity (head/chest/legs/feet equip independently), B6 stash race fix (item not lost on DB error), and consumable usage all confirmed.

---

## Per-domain findings — read the individual reports for the deep dive

### Navigation — `docs/playtest/PT-NAV-REPORT.md`

**Headline**: Map graph is clean; gate policy is broken in 4-5 places. The "someone ran into issues navigating" report most likely traces to **B1 or B2** — a cycle-2 player attempting to enter the Scar or the Pine Sea will hit an opaque "Something about this path feels wrong" message and have no in-game indicator that they need to die-and-rebirth to cycle 3+.

**Other findings**: hub-room IDs in the bidirectionality test were placeholders (test quality issue, MAJOR-1). One-way exits aren't always annotated (cosmetic, MAJOR-2). Locked exits like `meridian_keycard` are by design (MAJOR-3, document only).

### Dialogue — `docs/playtest/PT-DIALOGUE-REPORT.md`

**Headline**: 0 hard blockers. The "someone ran into issues talking to people" report does NOT trace to broken dialogue trees — it likely traces to dialogue branches gated on flags the player hasn't set yet (which is correct behavior but can feel like the NPC has nothing to say).

**Notable findings**:
- 0 true orphan flags (after subtracting gameEngine.ts and lib/actions/social.ts setters from the eval's flagged list).
- `crossroads_signal_source` narrative key has no consumer (S4 above).
- 3 NPCs intentionally have no dialogue tree (`the_dog`, `dory`, `leatherworker_vin`); allowlisted.

### Quests — `docs/playtest/PT-QUEST-REPORT.md`

**Headline**: 5 of 14 completion flags are orphan. **All five are main-arc.** Players reaching the late game will see 5 main-arc journal entries permanently in "in progress" state.

**Affected entries** (all in `data/questDescriptions.ts`):
1. `flag: found_hollow_origin` → completion `hollow_origin_understood` (NEVER SET)
2. `flag: found_sanguine_origin` → completion `sanguine_origin_understood` (NEVER SET)
3. broadcaster-identity quest → completion `broadcaster_found` (NEVER SET)
4. fault-entity quest → completion `fault_entity_observed` (NEVER SET)
5. `flag: discovered_fault_scar_connection` → completion `fault_scar_connection_confirmed` (NEVER SET)

### Combat & Items — `docs/playtest/PT-COMBAT-REPORT.md`

**Headline**: 0 blockers. All systems function. Two minor gaps for follow-up:
- `checkEnemyFlee()` defined for `screamer` and `stalker` but never invoked by `doAttackRound` — flee-threshold data is dead.
- Inline loot loop in `combat.ts:567-574` bypasses `rollLoot()`, so `LootEntry.count` only works when `rollLoot()` is called directly. The Wave-2 follow-up gap is real.

---

## Suggested fix order (smallest to largest)

1. **E1** (5 min): add `hollow_kills_tier_1/2/3` to the eval's `EXTERNALLY_SET_FLAGS` allowlist. Removes 15 noise-failures from `pnpm test:eval`.
2. **B3 + D2 + D3 batch** (~30 min): decide on the 5 orphan completion flags + ending-flag granularity, then add the setters in 5 places. Closes the main-arc journal hole.
3. **B1 + B2 + D1 batch** (~30 min): pick a cycle for Scar (2 or 3), align approach exits and destination rooms, update the eval test accordingly. Closes 16+20 rooms of access for cycle-2 players.
4. **S4** (~10 min): decide whether `crossroads_signal_source` should unlock something or be removed.
5. **S5** (~20 min): refactor `combat.ts:567-574` to call `rollLoot()` instead of inlining the loop.
6. **S1, S2, S3** (~1 hr together): each requires reading nearby room data to determine intent.

After all of the above, the game would be functionally 100% playable across navigation, dialogue, quests, combat, and items. The remaining items in `LESSONS.md` and `TODO-RELEASE.md` (multi-tab, `discovered_room_ids`, H15 durability) are operational hygiene, not playability blockers.

---

## How this report was generated

- 4 parallel Howlers dispatched off `main` post-PR-#13. 3 returned with comprehensive test files + per-domain reports. 1 (PT-QUEST) timed out twice; static analysis run inline via `/tmp/quest-orphan-check.mjs`.
- The 3 Howler test files mark their currently-failing assertions with `it.fails(...)` so the suite stays green; the markdown reports are the source of truth for which tests need fixing.
- This synthesis is the single read for triage. Per-domain reports drill down on context, repro, and proposed fixes.
