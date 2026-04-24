# Dialogue Tree Health Report

**Generated:** 2026-04-23  
**Howler:** C — Dialogue Tree Health  
**Test file:** `tests/integration/dialogueHealth.test.ts`

---

## 1. Summary

| Metric | Count |
|--------|-------|
| Unique dialogue trees analyzed | 21 |
| Registry keys (including aliases) | 24 |
| Total nodes across all trees | ~236 |
| Total test cases | 173 |
| Passing | 147 |
| Failing | 26 |

### Violation Totals by Category

| Category | Count | Severity |
|----------|-------|----------|
| Orphan `targetNode` (missing node definition) | 1 | **CRITICAL** |
| Unreachable nodes (no incoming edges) | 3 | **HIGH** |
| Smart/curly quotes in dialogue strings | 21 trees | **MEDIUM** |
| NPC cross-reference broken (`faction_representatives` missing from NPCS) | 1 | **MEDIUM** |
| Named NPCs without dialogue trees | 6 | **LOW** |

---

## 2. Per-NPC Health Card

### lev (levTree)
- **Nodes:** 11 | **Unreachable:** 0 | **Broken refs:** 0
- **Smart quotes:** YES — all dialogue text uses curly quotes
- **Notable:** Two registry aliases (`lev_entry_hall`, `lev_office_quest`) point to same tree — correct behavior per comments

### sparks_radio / sparksTree
- **Nodes:** 11 | **Unreachable:** 0 | **Broken refs:** 0
- **Smart quotes:** YES

### sparks_radio / sparksSignalQuestTree
- **Nodes:** 6 | **Unreachable:** 2 | **Broken refs:** 0
- **Unreachable:** `sparks_quest_booster_return`, `sparks_quest_final` — these are the item-delivery nodes. No branch in the tree points to them; the game engine presumably routes to these nodes when the player returns with the crafted `signal_booster` item. This is a cross-tree routing pattern that bypasses the normal branch navigation. The nodes are valid but are only reachable via external game engine logic, not dialogue branches.
- **Smart quotes:** YES
- **Narrative importance:** HIGH — these nodes contain the emotional climax of Sparks's quest arc

### marshal_cross / crossTree
- **Nodes:** 17 | **Unreachable:** 1 | **Broken refs:** 0
- **Unreachable:** `cross_start_return` — a second root node for return visits. No branch in the tree points to it; the engine presumably selects it as the `startNode` on subsequent visits. Not reachable from the normal `cross_start` path.
- **Smart quotes:** YES

### warlord_briggs / briggsTree
- **Nodes:** 15 | **Unreachable:** 0 | **Broken refs:** 0
- **Smart quotes:** YES

### patch / patchTree
- **Nodes:** 10 | **Unreachable:** 0 | **Broken refs:** 0
- **Smart quotes:** YES

### howard_bridge_keeper / howardTree
- **Nodes:** 5 | **Unreachable:** 0 | **Broken refs:** 0
- **Smart quotes:** YES

### marta_food_vendor / martaTree
- **Nodes:** 5 | **Unreachable:** 0 | **Broken refs:** 0
- **Smart quotes:** YES

### prisoner_dell / dellTree
- **Nodes:** 6 | **Unreachable:** 0 | **Broken refs:** 0
- **Smart quotes:** YES

### dr_ama_osei / oseiTree
- **Nodes:** 4 | **Unreachable:** 0 | **Broken refs:** 0
- **Smart quotes:** YES

### elder_kai_nez / kaiNezTree
- **Nodes:** 6 | **Unreachable:** 0 | **Broken refs:** 0
- **Smart quotes:** YES

### the_wren / wrenTree
- **Nodes:** 5 | **Unreachable:** 0 | **Broken refs:** 0
- **Smart quotes:** YES

### shepherd_hermit / shepherdHermitTree
- **Nodes:** 6 | **Unreachable:** 0 | **Broken refs:** 0
- **Smart quotes:** YES

### deacon_harrow / harrowTree
- **Nodes:** 17 | **Unreachable:** 0 | **Broken refs:** 0
- **Smart quotes:** YES

### kindling_doubter_avery / averyTree
- **Nodes:** 14 | **Unreachable:** 0 | **Broken refs:** 0
- **Notable:** `avery_encourage_leave` and `avery_betrayed` are terminal nodes (no branches). `avery_encourage_leave` is intentional — player has committed Avery to leaving; `avery_betrayed` is intentional — conversation ends in shock/conflict.
- **Smart quotes:** YES

### vane_broadcaster / vaneTree
- **Nodes:** 16 | **Unreachable:** 0 | **Broken refs:** 0
- **Smart quotes:** YES

### elder_sanguine_npc / elderSanguineTree
- **Nodes:** 11 | **Unreachable:** 0 | **Broken refs:** 0
- **Smart quotes:** YES

### vesper / vesperTree
- **Nodes:** 14 | **Unreachable:** 0 | **Broken refs:** 0
- **Smart quotes:** YES

### rook / rookTree
- **Nodes:** 12 | **Unreachable:** 0 | **Broken refs:** 0
- **Smart quotes:** YES

### echo_hollow / echoTree
- **Nodes:** 25 | **Unreachable:** 0 | **Broken refs:** 1
- **CRITICAL BUG:** `echo_start` has a branch targeting `'echo_recognition'` (with `requiresCycleMin: 2`), but no node with that id exists in the tree. This branch is permanently broken — players on cycle 2+ who have visited Echo before will see the option but cannot navigate to it.
- **Smart quotes:** YES
- **Narrative importance:** MAJOR — Echo is a key emotional NPC in the post-Convoy narrative overhaul. The broken branch hides cycle-2 recognition content.

### faction_representatives / act1ClimaxTree
- **Nodes:** 9 | **Unreachable:** 0 | **Broken refs:** 0
- **NPC cross-ref:** `faction_representatives` is the `npcId` but does NOT exist in `data/npcs.ts`. The act1 climax tree is a system-triggered event (not a spawned NPC), so this may be intentional — but it breaks the NPC cross-reference check.
- **Smart quotes:** YES

---

## 3. Cross-Tree Findings

### Flag Round-Trip Orphans

All `requiresFlag` values resolve — either set within the dialogue trees themselves or via the external systems catalogued below. No orphaned requires found at the cross-tree level.

**Flags set outside dialogue trees (verified):**
- `found_r1_sequencing_data` — `data/rooms/the_stacks.ts`
- `discovered_field_station_echo` — `data/rooms/the_stacks.ts`
- `em_incinerator_radiation_investigated` — `data/rooms/the_ember.ts`
- `duskhollow_cistern_contamination_identified` — `data/rooms/duskhollow.ts`
- `discovered_archive_meridian_connection` — `data/rooms/the_deep.ts`
- `pens_rooks_letter_found` — `data/rooms/the_pens.ts`
- `pens_rook_met_in_office` — `data/rooms/the_pens.ts`
- `harrow_mentioned_tunnels` — `data/npcTopics.ts` (setsFlag)
- `bombing_revealed` — referenced in `npcTopics.ts` (requiresFlag only; source not found in grep scope — may be set by a room or quest not covered)
- `salters_contact`, `kindling_contact`, `drifters_contact`, `red_court_contact` — quest/world system

**Warning:** `bombing_revealed` is required by the Briggs tree (`requiresFlag: 'bombing_revealed'`) and used in npcTopics but its setter was not found in the codebase grep. If no code sets this flag, those branches are permanently locked. Needs investigation.

### Faction Reference Validity

All 9 faction types checked. No invalid faction references found across 21 trees.

### Skill Reference Validity

All skill checks checked. No invalid skill references found. Skills used: `lore`, `negotiation`, `intimidation`, `presence`, `stealth`, `survival`.

### Smart Quotes — Pervasive Global Issue

The entire `data/dialogueTrees.ts` file uses Unicode curly/smart quotation marks (`"`, `"`, `'`, `'`) throughout all dialogue text and branch labels. This affects all 21 trees. Per the LESSONS note from convoy-remnant-narrative-0329, smart quotes in data files have caused rendering bugs and parsing failures. **This is a systemic authoring problem, not isolated incidents.**

Total violations: hundreds across all trees. Recommend a one-time automated replacement pass converting all curly quotes to straight ASCII quotes in `data/dialogueTrees.ts`.

---

## 4. Reachability in Narrative

### CRITICAL: Echo Tree — Broken Cycle-2 Branch

`echo_hollow` / `echo_start` contains:
```
{ label: '"I\'ve seen you here before."', targetNode: 'echo_recognition', requiresCycleMin: 2 }
```

Node `echo_recognition` does not exist in `echoTree.nodes`. This branch is entirely broken. Players on cycle 2+ visiting Echo will see the option but the game engine will fail to navigate to it (likely returning to start or throwing a runtime error depending on the social action handler's null check behavior).

**Echo is a named NPC central to the post-narrative-overhaul story.** The deleted or never-authored `echo_recognition` node was likely meant to be the main cycle-2 Echo encounter pathway. This is missing narrative content that can never be seen.

**Action required:** Author `echo_recognition` node, or remove the branch from `echo_start`.

### HIGH: Sparks Quest — Booster Return Nodes Unreachable via Branch Navigation

`sparks_quest_booster_return` and `sparks_quest_final` have no incoming edges from any branch in `sparksSignalQuestTree`. They appear to require external engine routing (player arrives with item in hand). This is a known pattern (the engine's social action handler likely switches `startNode` based on item presence), but it means these emotionally significant nodes — including Sparks's vindication scene — are invisible to the test's reachability analysis.

**Action required:** Document the external routing in a comment on the tree, or add a "stub" entry node that routes to `sparks_quest_booster_return` when `quest_signal_booster_active` is set and player has the item.

### MEDIUM: Cross Tree — `cross_start_return` Unreachable

`cross_start_return` is defined but no branch points to it. If this is meant to be an alternate `startNode` for return visits, the engine must swap `startNode` dynamically based on cycle/quest state. This pattern is also used by the echoTree branching, but unlike echoTree there is no `requiresCycleMin` branch guarding — it's purely an engine-selected alternate root.

---

## 5. Tooling Note

`tests/integration/dialogueHealth.test.ts` provides exhaustive static analysis covering:

- Orphan `targetNode`/`failNode` references
- Unreachable nodes via BFS from `startNode`
- Terminal dead-end detection
- Faction and skill closed-set validation
- Flag round-trip verification (dialogue trees + externally-set flags)
- Smart-quote hygiene
- NPC cross-reference (trees ↔ `data/npcs.ts`)
- Node id consistency
- `failNode` exit availability

**Recommend running in CI on every PR that touches `data/dialogueTrees.ts` or `data/npcs.ts`.** The test catches integration-layer bugs (wrong node IDs, missing definitions) that type checking cannot catch because node IDs are runtime strings, not type-checked keys.

---

## 6. Severity-Ranked Backlog

| # | Severity | Finding | File | Fix |
|---|----------|---------|------|-----|
| 1 | CRITICAL | `echo_recognition` node referenced but never defined | `data/dialogueTrees.ts` | Author node or remove branch |
| 2 | HIGH | All 21 trees use smart/curly quotes throughout | `data/dialogueTrees.ts` | Automated sed replacement pass |
| 3 | HIGH | `sparks_quest_booster_return` / `_final` unreachable via branches | `data/dialogueTrees.ts` | Document external routing or add stub entry node |
| 4 | MEDIUM | `cross_start_return` unreachable (engine-selected alternate root) | `data/dialogueTrees.ts` | Document external routing in comment |
| 5 | MEDIUM | `faction_representatives` npcId not in `data/npcs.ts` | `data/npcs.ts` | Add stub NPC entry or change npcId to existing ID |
| 6 | MEDIUM | `bombing_revealed` required but setter not found in codebase grep | multiple | Verify setter exists or add one |
| 7 | LOW | 6 named NPCs (`the_dog`, `dory`, `leatherworker_vin`, `kade_red_court`, `vex_red_court`, `lyris_red_court`) have `isNamed: true` but no dialogue tree | `data/npcs.ts` | Add dialogue trees or downgrade `isNamed` if intentionally vendor-only |
