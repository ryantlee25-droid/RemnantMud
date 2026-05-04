# Rubric 3: Dialogue Coherence
**Plan reference**: `PLAN-EVAL.md` Phase 5 / Rubric 3  
**Scope**: All authored dialogue trees in `data/dialogueTrees.ts` (24 unique trees, 335 nodes as of 2026-05-03)  
**Automated gate**: `tests/eval/dialogueHealth.test.ts` (sections 1–20)  
**Manual gate**: Dimensions 1 and 2 below require human scoring  
**Date**: 2026-05-03

---

## Rubric Overview

Two automated dimensions are already enforced by `dialogueHealth.test.ts` and do not require manual scoring:

| Dimension | Enforcement | Details |
|-----------|-------------|---------|
| Flag round-trip | Auto — test section 6 | Every `requiresFlag` has a `setFlag` setter or is a known external flag |
| Smart-quote hygiene | Auto — test section 7 | Zero Unicode curly/smart quotes in node text or branch labels |

Three dimensions require manual scoring. Score each 1–5 per tree. A score of **3 or higher on all three** is a passing result. Any score of 1 is a blocker.

---

## Manual Scoring Dimensions

### Dimension 1 — NPC Voice Consistency (1–5)

**What to check**: Does the same NPC maintain consistent vocabulary register, sentence structure, and emotional register across every node in their tree?

| Score | Description |
|-------|-------------|
| 5 | Unmistakable voice: the NPC's vocabulary, sentence length, and emotional register are consistent across all nodes. You could identify the speaker from any single node without seeing the `speaker` field. |
| 4 | Consistent with one minor slip — a phrase or sentence that sounds more generic than the established voice, but does not contradict it. |
| 3 | Generally consistent, but two or more nodes feel interchangeable with other NPCs. The core register holds. |
| 2 | Noticeable register drift: at least one node reads as a different character entirely. The player would notice. |
| 1 | Register is undefined, contradictory, or generic throughout. The NPC has no voice. |

**Scoring guidance — vocabulary register cues for existing NPCs**:

- **Lev**: Clinical, data-first, avoids metaphor, uses parenthetical self-corrections ("That was clinical. I'm aware."), long complex sentences when presenting evidence, short declarative sentences for conclusions. Never expresses emotion directly — names the data, lets the player infer.
- **Sparks**: Fast, associative, follows her own thoughts across a comma, interrupts herself, tactile details (soldering iron, frequency chart, notebook). Questions are direct. Emotions leak sideways — she says things like "That's enough. For now." not "I'm disappointed."
- **Patch**: Transactional and observational. Short sentences. Always watching the wound, not the person. Conditional constructions ("If you're here because..."). Never warm, but not cold — precise.
- **Vesper**: Academic cadence, philosophical vocabulary, uses the second person naturally ("You find that transactional? Good."), doesn't hedge, photosensitivity is present in how she positions herself relative to light.
- **Warlord Briggs**: Ex-military directness, no subordinate clauses when a declarative will do, treats ideology as arithmetic, carries knowledge he does not volunteer.
- **Deacon Harrow**: Rhetorical, constructs ideas in pairs (CHARON-7 is both gospel and protein), holds eye contact too long, evaluating. Never confesses doubt, never explains — asserts.
- **Marshal Cross**: Exhausted authority. Economy of words. "I have capacity for decisions" not "I've been thinking about your request." Does not make promises.

### Dimension 2 — Faction Alignment (1–5)

**What to check**: Does the NPC's dialogue reflect their faction's values and worldview without explicitly stating its ideology?

| Score | Description |
|-------|-------------|
| 5 | Faction values emerge entirely through action and word choice — the NPC never states the faction's ideology, but the player understands it clearly. |
| 4 | Faction values evident, with one moment where the NPC "speeches" their faction's position instead of embodying it. |
| 3 | Faction values detectable but underdeveloped. The player can identify the faction but the NPC sounds generic-faction rather than specific-character. |
| 2 | Faction values stated explicitly ("As a member of the Accord, I believe...") or directly contradicted by the NPC's word choice or choices. |
| 1 | No detectable faction signature. NPC could belong to any faction or none. |

**Faction alignment cues**:

| Faction | Core worldview | In-dialogue signal (never stated explicitly) |
|---------|---------------|---------------------------------------------|
| Accord | Order through structure; pragmatic hierarchy | Talk about logistics, capacity, resource math; no appeals to feeling |
| Drifters | Autonomy; information as currency; neutral-ground ethic | Trades information freely but won't take sides; uses "we" reluctantly |
| Reclaimers | Evidence-based; pre-Collapse knowledge recovery | Cites data, records, documents; treats anecdote as inadmissible |
| Kindling | CHARON-7 as transformation, not disaster | Fire metaphors; "conversion" not "infection"; finds meaning in the Hollow |
| Covenant of Dusk | Managed coexistence; the tithe as a civilized agreement | Uses contract vocabulary; never demonizes the Sanguine; "arrangement" not "submission" |
| Salters | Eliminating the threat is arithmetic, not ideology | Concrete threat quantification; no philosophy, no mercy window |
| Red Court | Power and predation as natural law | Absent from current authored trees — watch for it in future authoring |

### Dimension 3 — Branch Meaningfulness (1–5)

**What to check**: Does each player branch option lead to a meaningfully different NPC response or outcome, or do two or more branches converge on the same content?

| Score | Description |
|-------|-------------|
| 5 | Every branch on every node leads to content that could not be reached via another branch. Information, emotional beats, and flag outcomes are distinct. |
| 4 | One pair of branches leads to very similar content (same information, different phrasing). No false choices on story-critical nodes. |
| 3 | Up to two nodes have branches that converge on identical or near-identical next nodes. The player can see the seams. |
| 2 | Multiple false choices: branches labeled differently but resolving to functionally the same node. |
| 1 | Branches are cosmetic throughout. Player choice has no narrative consequence. |

**Mechanical signal for score 1–2**: Test section 1 (orphan targetNodes) and the structural checks will not catch duplicate targetNodes within a node. Manual check: scan each node's branch list for two entries that share the same `targetNode` value without differing on `requiresFlag`, `requiresRep`, `requiresCycleMin`, or `skillCheck`. That is a false choice.

---

## Scoring Sheet Template

Copy this block for each tree reviewed:

```
Tree ID: _______________
NPC ID: _______________
Reviewer: _______________
Date: _______________

Dim 1 — NPC Voice Consistency: __ / 5
  Notes: 

Dim 2 — Faction Alignment:     __ / 5
  Notes: 

Dim 3 — Branch Meaningfulness: __ / 5
  Notes: 

Overall pass/fail: PASS / FAIL (pass = all dims >= 3, no dim = 1)
Blockers found: 
```

---

## Worked Example: `cr_sparks_intro` (Sparks Tree)

**Tree**: `sparksTree` in `data/dialogueTrees.ts`, registered as `cr_sparks_intro`  
**NPC**: `sparks_radio` (Crossroads, Drifters, `isNamed: true`)  
**Node count**: 17 nodes, startNode: `sparks_start`  
**Why chosen**: Sparks is the most complete authored tree with all branches resolving to non-trivial terminal or return nodes, multi-cycle echo paths, skill-gated branches, item-gated branches, and hollow-kills reactivity (three tiers). It exercises every structural feature the rubric is designed to evaluate.

### Automated checks (from `dialogueHealth.test.ts`)

| Check | Result |
|-------|--------|
| Section 1: orphan targetNodes | PASS — all targetNodes resolve |
| Section 2: unreachable nodes | PASS — all nodes reachable from `sparks_start` (ENGINE_ENTRY_NODES not needed here) |
| Section 3: terminal closure | PASS — `sparks_leave` is the sole terminal, reached from every path |
| Section 4: faction refs | PASS — no `grantRep` / `requiresRep` in this tree |
| Section 5: skill refs | PASS — `negotiation` on `sparks_equipment` is a valid SkillType |
| Section 6: flag round-trip | PASS — `sparks_shared_decode` is set in `sparks_signal.onEnter` before being required in `sparks_start` |
| Section 7: smart quotes | PASS — zero Unicode curly quotes |
| Section 10: node id consistency | PASS — every `node.id` matches its map key |
| Section 11: failNode exits | PASS — `sparks_equipment_fail` has exit branches |
| Section 13: cycle-gate fallbacks | PASS — cycle-2+ echo branch (`sparks_echo_broadcaster`) has cycle-agnostic fallback branches on `sparks_start` |
| Section 14: rep-gate fallbacks | PASS — no rep-gated branches |
| Section 16: node text length | PASS — all nodes have text >= 5 chars trimmed |

### Manual scoring

**Dimension 1 — NPC Voice Consistency: 5 / 5**

Sparks's register holds across all 17 nodes. Markers that persist:
- Technical vocabulary: "frequency chart", "capacitors", "soldering iron", "modulation", "noise floor"
- Self-interruption structure: "Give me — She's already working." / "That's — that's enough."
- Flat directness when asking about killing: "Do you enjoy it? You can tell me. I won't judge." No soft framing.
- Physical anchoring to her equipment in every node — the iron appears in five nodes, the frequency chart in three, the notebook in one
- One potential slip: `sparks_hollow_t3_choose` ("That's the best answer") is slightly warmer than Sparks's usual register, but it's marked by making a small notation in her chart — an action consistent with her data-first character

**Dimension 2 — Faction Alignment: 4 / 5**

Drifter values emerge correctly: Sparks volunteers information freely, trades on exchange not loyalty, maintains neutrality about factions. The Drifter ethic of "information moves things" is intact — she decoded forty percent of the signal and shares the frequency in `sparks_signal` without extracting faction allegiance.

Minor flag: `sparks_quest_why` has Sparks say "someone else was alive and trying to reach someone. Anyone." This is personal testimony about the worst night of her life, which is effective, but the backstory-dump pattern slightly over-explains her motivation. The Drifter ethic (information as currency, personal history as irrelevant) is briefly suspended here. A score of 4 not 5 — the slip is intentional characterization but breaks the faction-show-don't-tell rule once.

**Dimension 3 — Branch Meaningfulness: 5 / 5**

Every branch on every node leads to distinct content:
- `sparks_equipment` has three branches: item-gated (removes item, grants receiver), negotiation-gated (grants receiver, no item cost), and fail node — all resolve differently
- `sparks_hollow_t2` has "Sometimes. Is that wrong?" → `sparks_hollow_t2_honest` (absolution) vs "It's necessary" → `sparks_hollow_t2_practical` (challenge-without-cruelty). Both reach `sparks_leave` but via genuinely different NPC responses
- `sparks_echo_broadcaster` has two branches leading to different flag sets (`sparks_knows_vane` + `sparks_shared_decode` + `sparks_mentioned_broadcaster` vs only `sparks_echo_acknowledged` + `sparks_shared_decode`)
- Only apparent false-choice candidate: multiple paths eventually reach `sparks_leave`, but `sparks_leave` is a proper terminal node with a distinct piece of prose ("You are no longer in the room as far as she's concerned"), not a blank end-of-tree stub

**Summary**:

| Dimension | Score | Pass? |
|-----------|-------|-------|
| Dim 1 — NPC Voice Consistency | 5/5 | PASS |
| Dim 2 — Faction Alignment | 4/5 | PASS |
| Dim 3 — Branch Meaningfulness | 5/5 | PASS |

**Overall: PASS.** `cr_sparks_intro` is the current quality ceiling. It should be used as the reference when authoring the 78 missing trees.

---

## Triage: 78 Missing Dialogue Trees by Priority

The full missing-tree set is captured in `tests/eval/__snapshots__/dialogueHealth.test.ts.snap` (section 19). All 78 trees are referenced in `npcSpawns[].dialogueTree` across room files but have no corresponding entry in `DIALOGUE_TREES`.

Priority is determined by two signals:
1. **Playthrough blocking**: Does the missing tree block a named NPC quest, a gate, or the player's first contact with a faction?
2. **Zone coverage**: Is the zone's tree coverage currently zero, leaving whole zones with no working dialogue?

### Tier 1 — Playthrough Blocking (author first)

These trees gate critical quest paths or first-contact faction moments. A player hitting these rooms gets no dialogue, which breaks quest state.

| Tree ID | Zone | Reason for priority |
|---------|------|---------------------|
| `cv_marshal_cross_intro` | covenant | Marshal Cross (`marshal_cross`) is a named NPC (`isNamed: true`), Act 1 faction leader, first Accord contact for most players entering Covenant. No dialogue = no Accord faction entry. Room CV-02 or CV-03 area. |
| `cv_gate_militia_intro` | covenant | The Covenant main gate (`cv_01_main_gate`) references this tree on the `accord_gate_militiaman` spawn (spawnChance 0.95). This is the first NPC every player encounters entering Covenant. |
| `sc_perimeter_challenge` | salt_creek | SC-01 Outer Perimeter, `salter_perimeter_guard` (spawnChance 0.95). First contact with Salters. Blocking the Salter faction-entry path. |
| `sc_inner_gate_challenge` | salt_creek | Referenced in SC-03 area. Second gate check. Without this, players who pass the perimeter face a dead interaction on the inner gate guard. |
| `duskhollow_elder_main` | duskhollow | Covenant of Dusk faction — likely linked to a named elder NPC or Vesper's zone entry. First faction contact for the Duskhollow path. |
| `cr_sparks_signal_quest` | crossroads | Note: this tree IS authored (see `sparksSignalQuestTree` in `data/dialogueTrees.ts`) but may be missing its DIALOGUE_TREES registry key. Verify whether `cr_sparks_signal_quest` is exported and registered; if not, add it — this is a one-line fix, not a full authoring task. |

### Tier 2 — Salt Creek Zone (12+ missing trees)

Salt Creek has the highest concentration of missing trees (13 entries in the snapshot: `sc_barracks_soldier`, `sc_brig_accord_prisoner`, `sc_brig_exterior_guard`, `sc_brig_guard`, `sc_cutter_motor_pool`, `sc_cutter_workshop`, `sc_enlisted_common_salter`, `sc_ford_toll_patrol`, `sc_lookout_bluff_sniper`, `sc_mess_cook`, `sc_mess_cook_offduty`, `sc_reyes_armory`, `sc_south_wall_defense`, `sc_torque_workshop`, `sc_trainer_yard`, `sc_watchtower_sniper`). Every room inside the Stronghold is non-functional for NPC interaction. The Salter faction is currently the weakest in dialogue coverage. This tier should be batched to a single Howler as Salt Creek dialogues share the Salter voice register and faction worldview.

### Tier 3 — Covenant Zone (11 missing trees)

Covenant has 11 missing trees (`cv_clerk_intro`, `cv_garden_keeper`, `cv_holding_guard`, `cv_holding_prisoner`, `cv_marsh_healer`, `cv_militia_barracks`, `cv_north_wall_sentry`, `cv_nwosu_teacher`, `cv_okafor_armory`, `cv_okafor_depot`, `cv_refugee_intake`, `cv_south_wall_sentry`, `cv_storekeeper_granary`, `cv_torque_workshop`, `cv_wall_defense_quest`). Covenant is Act 1's main settlement hub; missing trees here hurt Act 1 playability broadly. However the Tier 1 cross-gate trees (`cv_gate_militia_intro`, `cv_marshal_cross_intro`) must be authored before this tier runs.

### Tier 4 — Crossroads Non-Blocking (5 missing trees)

`cr_arbiter_intro`, `cr_cole_intro`, `cr_pit_bookie`, `cr_rosa_camp_lore`, `cr_stranger_sanguine_hint`, `cr_vin_intro` are missing Crossroads trees. These are flavor and world-building NPCs, not quest gates. The core Crossroads experience already works (Sparks, Patch, Marta, Howard all have authored trees). These can follow Tier 3.

### Tier 5 — The Ember, The Breaks, Duskhollow (remainder)

The Ember has 9 missing trees (`em_annex_faithful`, `em_dormitory_resident`, `em_gate_keeper_intro`, `em_incinerator_faithful`, `em_reclaimer_craftsperson_factory`, `em_reclaimer_signal_tech_office`, `em_scavenger_rail_yard`, `em_scavenger_rival_dock`, `em_scavenger_rival_factory`, `em_scavenger_rival_fields`, `em_torch_tender_approach`, `em_treatment_aide`). The Breaks has 3 (`br_dusk_patrol_encounter`, `br_overhang_shelter_traveler`, `br_waypoint_traveler`). Several Duskhollow trees are missing (`duskhollow_night_market_resident`, `duskhollow_tithe_resident_perspective`, `tithe_human_perspective`). These are Act 2 zones; playthrough impact is lower but the faction world-building cost is high if the Ember (Kindling faction) is silent.

### Tier 6 — Scar, Pine Sea, River Road (low volume)

`scar_14` zone: one or two missing trees. Pine Sea: no confirmed missing trees in the snapshot. River Road: `rr_fisher_lore` only — low priority. The Scar is Act 3 endgame; the handful of missing trees there affect only players who reach the final zone.

### Triage summary table

| Tier | Trees | Zone(s) | Condition for done |
|------|-------|---------|-------------------|
| 1 — Blocking | 5–6 | Covenant, Salt Creek, Crossroads | Author before any P4 playtest runs |
| 2 — Salt Creek batch | 13 | salt_creek | Single convoy, Salter voice brief |
| 3 — Covenant batch | 11+ | covenant | After Tier 1 unblocked |
| 4 — Crossroads flavor | 6 | crossroads | After Tiers 1–3 |
| 5 — Ember/Breaks/Dusk | 12 | the_ember, the_breaks, duskhollow | After Tiers 1–3 |
| 6 — Late zones | 3–4 | the_scar, river_road | Before final playtest |

---

## How to Run the Automated Gate

```bash
pnpm test --reporter=verbose tests/eval/dialogueHealth.test.ts
```

The 78 missing trees will show as `it.fails()` entries in section 19 — these are expected failures and will not block CI. When a tree is authored and added to `DIALOGUE_TREES`, remove its corresponding `it.fails()` entry from section 19.

To update the snapshot after authoring new trees:

```bash
pnpm test --reporter=verbose tests/eval/dialogueHealth.test.ts -- --update-snapshots
```

---

## Recording Scores

Manual scoring results go in a companion file:

`evaluation/narrative-review/dialogue-coherence-scores.md`

Format per tree:

```
## [Tree ID] — [NPC name] — scored [date]
Dim 1: [score] — [one line]
Dim 2: [score] — [one line]  
Dim 3: [score] — [one line]
Pass/Fail: [result]
```

Minimum sample to satisfy Phase 5 exit criteria: 10 authored trees manually scored (all 24 existing trees are the target; 10 is the floor).
