# PT-DIALOGUE Playtest Report

**Date**: 2026-04-30  
**Branch**: `playtest/pt-dialogue-0430`  
**Base commit**: `22a42c2` (PR #13 merged)  
**Test file**: `tests/playtest/dialogue-full.test.ts`  
**Tester**: Howler PT-DIALOGUE (Conversationalist)

---

## 1. Summary

| Metric | Count |
|--------|-------|
| Total NPC entries (`data/npcs.ts`) | 120 |
| Unique dialogue trees | 25 |
| DIALOGUE_TREES registry keys (incl. aliases) | 31 |
| Total dialogue nodes | 335 |
| Total branches | 619 |
| Flag-gated branches (`requiresFlag`) | 69 |
| Rep-gated branches (`requiresRep`) | 7 |
| Item-gated branches (`requiresItem`) | 6 |
| Cycle-gated branches (`requiresCycleMin`) | 30 |
| `grantItem` operations | 7 |
| `grantNarrativeKey` operations | 4 |
| Broken branch refs (missing `targetNode`/`failNode`) | 0 |
| True orphan flags (nothing sets them) | 0 |
| NPCs without a dialogue tree (named NPCs) | 3 (all intentional — see §3) |
| Unreachable branches catalogued | 0 |

**Overall verdict**: No blockers found. All 156 tests pass. The single pre-existing
failure in `tests/eval/dialogueHealth.test.ts` is a false positive addressed in §6.

---

## 2. Blockers

**None found.** BFS traversal across all 25 unique trees found 0 broken `targetNode`
or `failNode` references. Every `startNode` resolves. Every reachable node leads
to a valid terminal or further nodes.

---

## 3. Major

### 3.1 Named NPCs intentionally without a dialogue tree (allowlisted)

The following named NPCs have no dialogue tree. This is intentional per the eval
allowlist:

| NPC ID | Name | Reason |
|--------|------|--------|
| `the_dog` | The Dog | Companion — commentary only, no conversation |
| `dory` | Dory | Background NPC handled via room extras |
| `leatherworker_vin` | Leatherworker Vin | Trade interface only, no tree |

These are documented in `NAMED_NPCS_WITHOUT_TREE` in both `tests/eval/dialogueHealth.test.ts`
and `tests/playtest/dialogue-full.test.ts`.

### 3.2 `crossroads_signal_source` narrative key has no ROOM_EXIT_GATE consumer

**Severity**: Major — authored content that never unlocks anything.

`sparks_radio`'s tree (`cr_sparks_intro`) grants `grantNarrativeKey: 'crossroads_signal_source'`
(node `sparks_broadcaster`, line 585 of `data/dialogueTrees.ts`). This key exists in
`data/narrativeKeys/keys_by_zone.ts` but does not appear in `ROOM_EXIT_GATES` in
`lib/narrativeKeys.ts` and is not consumed by any room gate.

The key is granted when the player asks Sparks about the signal source and she shares
the decode. At the moment nothing happens downstream: no room unlocks, no travel option
opens.

**Player impact**: `talk sparks_radio` → ask about the signal → Sparks shares the
broadcaster location — but no exit or room elsewhere responds to the key. The discovery
feels hollow.

**Recommended fix**: Either add a `ROOM_EXIT_GATES` entry that consumes
`crossroads_signal_source` to unlock a scar/broadcaster-adjacent room, or remove the
`grantNarrativeKey` call if the quest progression is handled purely via the
`signal_triangulated` quest flag instead.

### 3.3 `avery_betrayed` / `avery_will_leave` are `requiresPreviousQuest` targets
(not `requiresFlag`) — no hard orphan but worth noting

Avery's tree uses `requiresPreviousQuest:` on two branches (nodes `avery_start` lines
3348/3354). These work via the cycle history echo system rather than the `questFlags`
map. They are not orphans. Documented here for completeness.

---

## 4. Minor

### 4.1 Informational: 15 requiresFlag entries not set by any dialogue tree (all resolved by external setters)

The §3 informational console output lists 29 `requiresFlag` values that are not set
within `data/dialogueTrees.ts`. After subtracting the external-setter allowlists,
**0 true orphans remain**:

- `hollow_kills_tier_1/2/3` (×15 across 5 trees): Set by `lib/gameEngine.ts` lines
  2219–2221 on hollowKills crossing 5/20/50. False positive in the eval suite
  (see §6).
- `companion_the_dog_active` (×3): Set by `lib/companionSystem.ts` when `addCompanion`
  fires for the dog.
- `found_r1_sequencing_data`, `discovered_field_station_echo`: Set by room examine
  extras in `data/rooms/the_stacks.ts`.
- `harrow_mentioned_tunnels`, `bombing_revealed`: Set by `data/npcTopics.ts` keyword
  topics.
- `em_incinerator_radiation_investigated`: Set by `data/rooms/the_ember.ts` examine.
- `duskhollow_cistern_contamination_identified`: Set by `data/rooms/duskhollow.ts`
  examine.
- `pens_rooks_letter_found`, `pens_rook_met_in_office`, `pens_yield_discrepancy_found`,
  `pens_covenant_arrangement`, `vesper_shared_origin`, `aid_lyris_extraction`,
  `lyris_doubter_revealed`, `found_sanguine_origin`: All set within dialogue trees
  elsewhere, or by room examine, or both.

### 4.2 `cr_sparks_signal_quest` tree has `sparks_quest_booster_return` and
`sparks_quest_final` as engine-entry nodes

These two nodes are not reachable via BFS from `startNode` (`sparks_quest_start`)
because the game engine enters them directly on quest completion. They are listed in
`ENGINE_ENTRY_NODES` in both the eval health test and the playtest test. This is
correct design, not a bug.

---

## 5. NPC x Tier Matrix

All five NPCs with hollow-kills tier dialogue have all three tier nodes wired and
reachable from `startNode`:

| NPC | Tree Key | T1 Node | T2 Node | T3 Node | All Wired |
|-----|----------|---------|---------|---------|-----------|
| `lev` | `lev_entry_hall` | `lev_hollow_t1` | `lev_hollow_t2` | `lev_hollow_t3` | YES |
| `sparks_radio` | `cr_sparks_intro` | `sparks_hollow_t1` | `sparks_hollow_t2` | `sparks_hollow_t3` | YES |
| `marshal_cross` | `cv_marshal_cross_intro` | `cross_hollow_t1` | `cross_hollow_t2` | `cross_hollow_t3` | YES |
| `patch` | `cr_patch_intro` | `patch_hollow_t1` | `patch_hollow_t2` | `patch_hollow_t3` | YES |
| `howard_bridge_keeper` | `rr_howard_bridge` | `howard_hollow_t1` | `howard_hollow_t2` | `howard_hollow_t3` | YES |

Each startNode has three branches gated on `hollow_kills_tier_1`, `_tier_2`, and
`_tier_3` respectively, all pointing to the correct tier nodes. All tier nodes have
at least one exit branch (no dead-ends at tier nodes).

All five startNodes also have non-tier fallback branches, so cycle-1 zero-kill players
are never presented with an empty conversation.

---

## 6. Eval Test Recommendations

### 6.1 Fix the `hollow_kills_tier_*` false positive (Priority: High)

**File**: `tests/eval/dialogueHealth.test.ts`  
**Test**: §6 "Flag round-trip — required flags are set somewhere"  
**Current state**: FAILING with 15 violations.

The eval's `EXTERNALLY_SET_FLAGS` set does not include the three hollow-kills tier
flags. They are set by `lib/gameEngine.ts` lines 2219–2221 (not by any dialogue
`setFlag` call), so the eval's scan of dialogue trees correctly misses them. But they
ARE wired — just wired outside the scan boundary.

**Fix** — add to `EXTERNALLY_SET_FLAGS` in `tests/eval/dialogueHealth.test.ts`:

```ts
// Flags set by lib/gameEngine.ts on hollowKills crossing thresholds (lines 2219-2221)
'hollow_kills_tier_1',
'hollow_kills_tier_2',
'hollow_kills_tier_3',
```

Once added, the eval flag-round-trip test will pass and the suite will be fully green.

### 6.2 Consider adding `crossroads_signal_source` to a narrative gate (Priority: Normal)

See §3.2 above. If the narrative key is intentionally dormant (quest progression is
handled by the `signal_triangulated` quest flag), add a comment to
`data/dialogueTrees.ts` line 585 explaining why the key is granted but currently
unused. This prevents future developers from flagging it as a mistake.

### 6.3 Extend eval §17 to also check `data/narrativeKeys/keys_by_zone.ts`

Currently the eval checks `grantNarrativeKey` values against `ROOM_EXIT_GATES` only.
The `crossroads_signal_source` key IS defined in `keys_by_zone.ts` but has no
ROOM_EXIT_GATE. The eval §17 check reports it as orphaned (no consumer in
ROOM_EXIT_GATES), which is correct — but it only warns, it does not fail.

Recommendation: promote §17 to a soft-fail that opens an issue rather than silently
logging, so orphaned narrative key grants surface in CI.

---

## 7. Test Coverage Map

The 156 tests in `tests/playtest/dialogue-full.test.ts` cover:

| Section | What is tested |
|---------|---------------|
| §1 (3 tests) | NPC enumeration, isNamed cross-ref, aggregate totals |
| §2 (78 tests) | BFS traversal per tree (broken refs, orphan nodes, terminals, startNode, id/key consistency) |
| §3 (4 tests) | Flag orphan detection, hollow_kills false-positive documentation, tier fallback presence |
| §4 (3 tests) | Rep gating — fallback presence, threshold range, informational listing |
| §5 (1 test) | requiresItem item validity |
| §6 (2 tests) | grantItem validity, grantNarrativeKey informational listing |
| §7 (32 tests) | Tier node existence + startNode branch wiring for all 5 hollow-tier NPCs + matrix table |
| §8 (2 tests) | Cycle-gate fallback presence, informational listing |
| §9 (1 test) | failNode trap detection |
| §10 (2 tests) | Smart-quote hygiene, minimum node text length |
| §11 (1 test) | Full aggregate summary |
