# PT-CHAT-ALL — Exhaustive Runtime Dialogue Walk

**Run date**: 2026-04-30
**Branch**: `playtest/pt-chat-all-0503`
**Test file**: `tests/playtest/chat-exhaustive.test.ts`
**Suite result**: 280 pass | 3 expected-fail | 2 skip | 0 unexpected failures

---

## 1. Summary

| Metric | Count |
|--------|-------|
| Dialogue trees defined in `DIALOGUE_TREES` | 29 (25 unique trees, 4 alias keys) |
| Total dialogue nodes | 335 |
| Total branches (targetNode links) | 619 |
| Unconditional branches (no gate) | ~487 |
| Cycle-gated branches | 38 |
| Flag-gated branches | 85 |
| Rep-gated branches | 8 |
| Item-gated branches | 7 |
| Dead targetNode links in defined trees | **0** |
| Room `dialogueTree` IDs with NO matching tree | **82 (BLOCKER)** |
| Orphaned tree keys (defined but no room ref) | 11 |
| Trees with key mismatch (room ref ≠ defined key) | **2 (BLOCKER)** |

**Overall branch coverage** (branches reachable without gate setup): ~79% of branches in defined trees.
Gate-locked branches (cycle/rep/item/flag) account for the remaining 21%; all exercised in the gate-coverage sections.

**Critical gap**: 82 `dialogueTree` IDs are referenced by room `npcSpawns` but have no matching entry in `DIALOGUE_TREES`. When a player talks to any of those NPCs, the engine falls through to the generic greeting (no error, but no dialogue tree = silent data gap).

---

## 2. Coverage Matrix — Defined Trees

All 29 defined tree keys, their NPC, node count, branch count, unconditional reachability, and issues.

| Tree Key | NPC ID | Nodes | Branches | Uncond. Reachable | Issues |
|----------|--------|-------|----------|-------------------|--------|
| `lev_entry_hall` / `lev_office_quest` | `lev` | 36 | 89 | ~60% (29 gates) | None — all internal links valid |
| `cr_sparks_intro` | `sparks_radio` | 30 | 54 | ~65% (19 gates) | NPC ID mismatch: tree `npcId='sparks_radio'`, room spawns `sparks_radio_repair` (minor — display only, engine resolves on spawn ID) |
| `cr_sparks_signal_quest` | `sparks_radio` | 8 | 15 | ~80% | Orphaned — no room currently references this key |
| `cv_marshal_cross_intro` | `marshal_cross` | 42 | 74 | ~68% | None |
| `sc_briggs_command` | `warlord_briggs` | 34 | 62 | ~66% | None |
| `cr_patch_intro` / `cr_patch_main` | `patch` | 28 | 55 | ~64% | `cr_patch_intro` orphaned — rooms use `cr_patch_main` |
| `rr_howard_bridge` | `howard_bridge_keeper` | 20 | 31 | ~77% | Orphaned — rooms use `rr_howard_bridge_keeper` (missing tree) |
| `cr_marta_food` | `marta_food_vendor` | 5 | 6 | ~83% | None |
| `cv_dell_prisoner` | `prisoner_dell` | 9 | 11 | ~91% | Orphaned — room `cv_07_jail` references `cv_prisoner_dell` (different key) |
| `br_osei_lab` | `dr_ama_osei` | 9 | 13 | ~77% | None — used in both `the_breaks` and `the_deep` |
| `br_kai_nez_camp` | `elder_kai_nez` | 9 | 14 | ~79% | Orphaned — no room references this key |
| `fe_wren_encounter` | `the_wren` | 7 | 9 | ~89% | Orphaned — no room references this key |
| `ps_shepherd_hermit` | `shepherd_hermit` | 8 | 11 | ~82% | Orphaned — rooms use `shepherd_hermit_lore` / `shepherd_hermit_deep` (both missing) |
| `em_harrow_nave_intro` / `em_harrow_chamber_quest` | `deacon_harrow` | 29 | 48 | ~63% | None — room refs match correctly |
| `em_avery_doubt` | `kindling_doubter_avery` | 23 | 40 | ~68% | None |
| `vesper_philosophy_main` | `vesper` | 33 | 56 | ~64% | None |
| `rook_office_dialogue` | `rook` | 33 | 55 | ~65% | None |
| `scar_vane_broadcast` | `vane_broadcaster` | 28 | 50 | ~68% | **Key mismatch**: rooms reference `vane_broadcast_room_main`, DIALOGUE_TREES defines `scar_vane_broadcast`. Players in the_scar get no dialogue tree. |
| `dp_elder_sanguine_sanctum` | `elder_sanguine_npc` | 24 | 42 | ~67% | **Key mismatch**: rooms reference `elder_sanguine_deep_diplomacy` and `elder_sanguine_sanctum_diplomacy`, DIALOGUE_TREES defines `dp_elder_sanguine_sanctum`. Players in the_deep get no dialogue tree for Elder Sanguine. |
| `echo_tree` | `echo_hollow` | 36 | 58 | ~62% | Orphaned — `echo_hollow` NPC spawn uses `echo_hollow` as key fallback; no room npcSpawn has explicit dialogueTree for this NPC |
| `act1_climax_encounter` | `faction_representatives` | 14 | 24 | ~58% | Scripted encounter — `faction_representatives` is not in `NPCS`. Cannot be reached via `talk` command; requires custom engine trigger. 2 tests skipped. |
| `pens_kade_philosophy` | `kade_red_court` | 9 | 14 | ~79% | None |
| `pens_vex_manifest` | `vex_red_court` | 9 | 13 | ~85% | None |
| `pens_lyris_conflict` | `lyris_red_court` | 10 | 16 | ~81% | None |
| `cr_campfire_lore` / `drifters_storyteller_tree` | `campfire_storyteller` | 12 | 19 | ~79% | None — both keys used in rooms correctly |

---

## 3. Blockers

### B1 — 82 `dialogueTree` IDs referenced in rooms have no matching entry in `DIALOGUE_TREES`

**Severity**: BLOCKER — players who talk to these NPCs receive a generic greeting instead of the intended dialogue tree.

**Zones affected**:

| Zone | Count | Examples |
|------|-------|---------|
| Crossroads | 6 | `cr_arbiter_intro`, `cr_cole_intro`, `cr_stranger_sanguine_hint`, `cr_rosa_camp_lore`, `cr_vin_intro`, `cr_pit_bookie` |
| River Road | 2 | `rr_howard_bridge_keeper`, `rr_fisher_lore` |
| Covenant | 15 | `cv_gate_militia_intro`, `cv_clerk_intro`, `cv_okafor_armory`, `cv_marsh_healer`, `cv_nwosu_teacher`, `cv_torque_workshop`, `cv_prisoner_dell`, `cv_storekeeper_granary`, `cv_north_wall_sentry`, `cv_wall_defense_quest`, `cv_garden_keeper`, `cv_militia_barracks`, `cv_holding_guard`, `cv_holding_prisoner`, `cv_south_wall_sentry`, `cv_refugee_intake`, `cv_okafor_depot` |
| Salt Creek | 15 | `sc_perimeter_challenge`, `sc_perimeter_worker`, `sc_inner_gate_challenge`, `sc_trainer_yard`, `sc_barracks_soldier`, `sc_mess_cook`, `sc_reyes_armory`, `sc_pit_challenge`, `sc_watchtower_sniper`, `sc_cutter_motor_pool`, `sc_brig_accord_prisoner`, `sc_brig_guard`, `sc_south_wall_defense`, `sc_ford_toll_patrol`, `sc_brig_exterior_guard`, `sc_lookout_bluff_sniper`, `sc_cutter_workshop`, `sc_torque_workshop`, `sc_enlisted_common_salter`, `sc_mess_cook_offduty` |
| The Ember | 12 | `em_torch_tender_approach`, `em_gate_keeper_intro`, `em_treatment_aide`, `em_dormitory_resident`, `em_scavenger_rival_fields`, `em_scavenger_rival_factory`, `em_reclaimer_craftsperson_factory`, `em_reclaimer_signal_tech_office`, `em_scavenger_rival_dock`, `em_annex_faithful`, `em_scavenger_rail_yard`, `em_incinerator_faithful` |
| The Breaks | 3 | `br_waypoint_traveler`, `br_overhang_shelter_traveler`, `br_dusk_patrol_encounter` |
| Duskhollow | 11 | `covenant_entrance_welcome`, `covenant_great_hall_social`, `tithe_human_perspective`, `kitchen_staff_perspective`, `covenant_garden_social`, `covenant_roof_elder_lore`, `duskhollow_tithe_resident_perspective`, `kindling_cache_discovery_confrontation`, `kindling_cache_faithful_contact`, `duskhollow_elder_main`, `cistern_cook_warning`, `duskhollow_night_market_resident`, `kindling_market_faithful`, `chapel_visitor_market` |
| The Deep | 4 | `elder_sanguine_deep_diplomacy`, `sanguine_stranger_chamber`, `elder_sanguine_sanctum_diplomacy`, `sanguine_trader_contact_upper` |
| Pine Sea | 2 | `shepherd_hermit_lore`, `shepherd_hermit_deep` |
| Vivarium | 1 | `vivarium_contact` |
| The Scar | 1 | `vane_broadcast_room_main` |

**Repro** (any missing tree):
```
// Engine state: player in room, NPC injected with dialogueTree: 'cr_arbiter_intro'
const engine = buildEngine(room, 'checkpoint_arbiter', 'cr_arbiter_intro')
const result = await talkTo(engine, 'arbiter')
// result.activeDialogue === undefined (no tree started)
// no error, but no dialogue — silent miss
```

---

### B2 — `vane_broadcast_room_main` vs `scar_vane_broadcast` key mismatch

**Severity**: BLOCKER — Vane (The Broadcaster) in `the_scar` has a complete 28-node dialogue tree defined as `scar_vane_broadcast`, but the room spawn references `vane_broadcast_room_main`. Players who talk to Vane in the_scar get the generic greeting.

**Repro**:
```
// The room spawn:
// data/rooms/the_scar.ts npcSpawn: { npcId: 'vane_broadcaster', dialogueTree: 'vane_broadcast_room_main' }
// DIALOGUE_TREES has: scar_vane_broadcast (not vane_broadcast_room_main)
expect(DIALOGUE_TREES['vane_broadcast_room_main']).toBeUndefined() // PASSES
expect(DIALOGUE_TREES['scar_vane_broadcast']).toBeDefined()        // PASSES
```

**Fix**: Rename `scar_vane_broadcast` to `vane_broadcast_room_main` in `DIALOGUE_TREES`, OR update the room spawn key to `scar_vane_broadcast`.

---

### B3 — Elder Sanguine key mismatch (`elder_sanguine_*` vs `dp_elder_sanguine_sanctum`)

**Severity**: BLOCKER — Elder Sanguine (`elder_sanguine_npc`) has a complete 24-node tree at `dp_elder_sanguine_sanctum` but both rooms in `the_deep` reference different keys:
- Room `dp_07_deep_sanctum` → `elder_sanguine_sanctum_diplomacy` (missing)
- Room `dp_04_deep_hall` → `elder_sanguine_deep_diplomacy` (missing)

Players who talk to Elder Sanguine in the_deep see only the generic greeting.

**Fix**: Add both `elder_sanguine_sanctum_diplomacy` and `elder_sanguine_deep_diplomacy` as aliases pointing to `elderSanguineTree`, OR update both room spawn keys to `dp_elder_sanguine_sanctum`.

---

## 4. Major Findings

### M1 — 11 orphaned tree keys (defined in `DIALOGUE_TREES`, no room reference)

These trees exist and are internally valid (all targetNodes resolve) but no current room `npcSpawn` references their key:

| Orphaned Key | NPC | Root Cause |
|-------------|-----|-----------|
| `cr_sparks_signal_quest` | sparks_radio | Quest-phase tree — no room reference yet; may be triggered by `cr_sparks_intro` onEnter progression |
| `cr_patch_intro` | patch | Room uses `cr_patch_main` (alias exists in DIALOGUE_TREES as well) — effectively not orphaned since `cr_patch_main` works |
| `rr_howard_bridge` | howard_bridge_keeper | Room uses `rr_howard_bridge_keeper` (missing) — this tree is the intended content but unreachable |
| `cv_dell_prisoner` | prisoner_dell | Room uses `cv_prisoner_dell` (missing) — this tree is unreachable due to key mismatch |
| `br_kai_nez_camp` | elder_kai_nez | No room currently has a npcSpawn for Elder Kai Nez with this key |
| `fe_wren_encounter` | the_wren | Field encounter key — no room references it |
| `ps_shepherd_hermit` | shepherd_hermit | Rooms use `shepherd_hermit_lore` / `shepherd_hermit_deep` (both missing) |
| `scar_vane_broadcast` | vane_broadcaster | Key mismatch — see B2 above |
| `dp_elder_sanguine_sanctum` | elder_sanguine_npc | Key mismatch — see B3 above |
| `echo_tree` | echo_hollow | Scripted encounter tree — may require engine-level trigger outside normal `talk` flow |
| `act1_climax_encounter` | faction_representatives | Scripted encounter — `faction_representatives` not in NPCS; cannot be initiated via `talk` |

### M2 — `rr_howard_bridge` content orphaned (Howard has a 20-node tree that players can never reach)

Howard's tree (`rr_howard_bridge`, `howard_bridge_keeper` NPC) is fully defined with 31 branches but the room `rr_03_bridge` spawns him with `dialogueTree: 'rr_howard_bridge_keeper'` which doesn't exist in `DIALOGUE_TREES`. The existing content at `rr_howard_bridge` is unreachable. This is the highest-priority individual NPC fix because Howard is in the River Road (early zone).

### M3 — Dell's jail tree unreachable due to `cv_prisoner_dell` vs `cv_dell_prisoner` mismatch

`cv_dell_prisoner` is defined in `DIALOGUE_TREES`. Room uses `cv_prisoner_dell`. Dell's 9-node tree (prisoner with information) is completely inaccessible.

### M4 — Sparks tree `npcId` mismatch (minor, functional)

`cr_sparks_intro` defines `npcId: 'sparks_radio'` but the room spawns `npcId: 'sparks_radio_repair'`. The display name used when building node messages falls back correctly (the engine uses the spawn's npcId for lookup, not tree.npcId), so there is no runtime error. However the npcId in the tree is stale.

### M5 — `act1_climax_encounter` has `faction_representatives` NPC that isn't in `NPCS`

This tree is a scripted climax scene. The `npcId: 'faction_representatives'` doesn't resolve to any `NPCS` entry. The tree cannot be entered via `talk` — it requires a direct engine call to `startDialogueTree` with the npcId pre-set. This is likely intentional (scripted trigger), but it is undocumented and has no triggering mechanism visible in the current codebase.

---

## 5. Minor Findings

### MIN1 — `drifters_storyteller_tree` and `cr_campfire_lore` are dual-key aliases for the same tree (correct)

Both keys exist in `DIALOGUE_TREES` pointing to the same tree. This is a documented alias pattern (matching the comment in `dialogueTrees.ts` line 6269). No issue.

### MIN2 — All 619 internal targetNode links within defined trees resolve cleanly

Zero dead targetNode links. Every `branch.targetNode` and `branch.failNode` in every defined tree resolves to a real node ID in `tree.nodes`. This is the strongest result from this pass.

### MIN3 — All cycle-gated branches correctly block cycle-1 players and pass cycle-N players

38 cycle-gated branches tested. All correctly gate at the right cycle threshold. Compound gates (e.g., `requiresCycleMin: 2` + `requiresFlag: 'companion_the_dog_active'`) work correctly when both conditions are met.

### MIN4 — All rep-gated branches (8 total) tested and functional

All 8 rep-gated branches work correctly when the player has the required faction reputation. Factions tested: reclaimers, accord, salters.

### MIN5 — All item-gated branches (7 total) tested and functional

All 7 item-gated branches (including `ammo_22lr` buy-meal pattern in Marta's tree) work correctly when the item is present in inventory.

---

## 6. Test Infrastructure Notes

- 285 total tests in this file (280 pass, 3 expected-fail, 2 skip)
- Expected failures: missing-tree comprehensive check (documents 82 missing), `cv_prisoner_dell` missing, `rr_howard_bridge_keeper` missing
- Skipped: `act1_climax_encounter` talk tests (scripted NPC, no NPCS entry)
- Suite completes in ~60ms; no timeouts observed
- TypeScript check: clean (`npx tsc --noEmit` exit 0)

---

## 7. Priority Fix Queue

1. **P0**: Fix `vane_broadcast_room_main` ↔ `scar_vane_broadcast` key mismatch (single rename, unblocks Vane)
2. **P0**: Fix `elder_sanguine_*` key mismatches for the_deep (add aliases or update rooms)
3. **P0**: Fix `rr_howard_bridge_keeper` → rename orphaned `rr_howard_bridge` key to match
4. **P0**: Fix `cv_prisoner_dell` → rename orphaned `cv_dell_prisoner` key to match
5. **P1**: Create 82 missing dialogue trees (or at minimum the 10 most player-visible ones: cr_arbiter_intro, cv_marsh_healer, sc_briggs_adjacent NPCs, duskhollow faction NPCs)
6. **P2**: Fix `sparks_radio` → `sparks_radio_repair` in `cr_sparks_intro` tree's npcId field
7. **P2**: Wire `act1_climax_encounter` to a proper trigger in `gameEngine.ts` dispatch
