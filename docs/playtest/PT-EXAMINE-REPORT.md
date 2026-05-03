# PT-EXAMINE-ALL — Room Extras Coverage Report

**Generated**: 2026-04-30  
**Test file**: `tests/playtest/examine-exhaustive.test.ts`  
**Suite run**: 2036 passed / 0 failed — exit 0

---

## 1. Summary

| Metric | Count |
|--------|-------|
| Rooms total | 268 |
| Rooms with extras | 268 / 268 (100%) |
| Total extras | 951 |
| Extras with `skillCheck` | 328 |
| Extras with `questFlagOnSuccess` | 62 |
| Extras with `narrativeKeyOnExamine` | 2 |
| Extras with `narrativeKeyOnDeduction` | 3 |
| Extras with `questGate` | 40 |
| Multi-keyword extras | 951 (all extras have ≥2 keywords) |
| **Blockers found** | **4** |
| **Majors found** | **2** (duplicate-keyword shadowing of quest-gated extras) |
| **Minors found** | **38** (duplicate exact keywords across extras in same room, causing first-match shadowing) |

---

## 2. Blockers

**4 extras in `scar_14_the_core` are completely unreachable** — all keywords are substring-matched by an earlier extra with keyword `"after"`, causing `find()` to never reach them.

| Room | Extra Index | Keywords | Gated On | Blocker |
|------|-------------|----------|----------|---------|
| `scar_14_the_core` | 7 | `cure aftermath`, `after cure`, `cure cover-up` | `bombing_cover_confirmed` | `after` keyword on extra[6] (`result, after, done, chosen`) matches `after cure` via substring — extra[6] wins the `find()` |
| `scar_14_the_core` | 8 | `weapon aftermath`, `after weapon`, `weapon cover-up` | `bombing_cover_confirmed` | same as above — `after` in extra[6] captures `after weapon` |
| `scar_14_the_core` | 9 | `seal aftermath`, `after seal`, `seal cover-up` | `bombing_cover_confirmed` | same as above — `after` in extra[6] captures `after seal` |
| `scar_14_the_core` | 10 | `throne aftermath`, `after throne`, `throne cover-up` | `bombing_cover_confirmed` | same as above — `after` in extra[6] captures `after throne` |

**Root cause**: `handleExamineExtra` uses `k.toLowerCase().includes(kw) || kw.includes(k.toLowerCase())`. The short keyword `"after"` in extra[6] matches the compound keywords `"after cure"`, `"after weapon"`, etc. in extras[7-10] because `"after cure".includes("after")` is `true`. Extra[6] is found first by `find()`.

**Fix**: Remove `"after"` from extra[6]'s keyword list, or rename the compound keywords to something that doesn't contain `"after"` as a substring (e.g., `"cure-aftermath"`, `"weapon-aftermath"`).

---

## 3. Majors

### M1: `st_08_levs_office` — questGate extra shadowed by identical keywords

Extra[5] (`keywords: ['keycard', 'lev', 'meridian', 'access', 'lockbox', 'give', 'offer']`, `questGate: 'discovered_field_station_echo'`) is shadowed by extra[4] (`keywords: ['keycard', 'MERIDIAN', 'access', 'key']`, no gate). Keywords `keycard`, `meridian`, and `access` all appear in extra[4] first, so `look keycard` / `look meridian` / `look access` always returns the ungated description. The gated Lev-gives-you-the-keycard description is functionally unreachable unless the player uses a unique keyword like `lev`, `lockbox`, `give`, or `offer`.

**Impact**: Players who type `examine keycard` in Lev's office when they have the `discovered_field_station_echo` flag will get the wrong extra. They need to type `examine lev` or `examine lockbox` instead. The quest path works if players know the unique keywords but it's not obvious from the room description.

### M2: Impossible DCs via substring collision

The substring matching in `handleExamineExtra` (`kw.includes(k.toLowerCase()) || k.toLowerCase().includes(kw)`) creates an asymmetric keyword-collision problem: short single-word keywords in earlier extras absorb longer compound keywords in later extras. In total, 38 keyword collisions exist (see Minors section). The engine resolves them silently in favor of whichever extra appears first in the room's `extras[]` array.

---

## 4. Minors — Duplicate Keywords (38 collisions, 4 complete-shadow cases)

These are exact keyword matches across two extras in the same room. In each case, the earlier extra (lower index) wins all `look <keyword>` dispatches for that keyword. The later extra is only reachable via its non-duplicated keywords.

| Room | Shared Keyword | Extra Indices | Notes |
|------|----------------|---------------|-------|
| `cr_08_job_board` | `echo` | 2, 3 | — |
| `rr_03_east_bank` | `cottonwood` | 0, 3 | — |
| `rr_08_burned_farmhouse` | `yard` | 2, 3 | — |
| `cv_09_the_school` | `children` | 0, 2 | — |
| `cv_28_signal_post` | `radio` | 0, 3 | — |
| `sc_11_motor_pool` | `diesel` | 0, 2 | — |
| `em_01_the_approach` | `smoke` | 0, 2 | — |
| `em_03_the_nave` | `faithful` | 3, 4 | — |
| `em_10_hidden_chapel` | `meridian` | 0, 1 | — |
| `em_16_loading_dock` | `tracks` | 0, 1, 3 | 3-way collision |
| `br_03_narrow_slot_canyon` | `walls` | 0, 2 | — |
| `br_07_canyon_crossroads` | `orientation` | 0, 2 | — |
| `br_19_bleached_mesa_edge` | `edge` | 0, 1 | — |
| `du_06_hardware` | `tools` | 1, 2 | — |
| `st_08_levs_office` | `keycard`, `meridian`, `access` | 4, 5 | **Major M1** |
| `st_15_preservation_vault` | `sealed` | 1, 3 | — |
| `st_16_reading_room` | `reading` | 0, 3 | — |
| `dh_04_vespers_study` | `writing` | 1, 2 | — |
| `dh_05_tithe_room` | `woman`, `dory` | 0, 4 | 2 keywords shared |
| `dh_11_sub_basement` | `records` | 0, 1 | — |
| `dh_11_sub_basement` | `old` | 1, 2 | — |
| `dh_17_cistern` | `hatch` | 1, 1 | Self-reference (same index) |
| `dp_18_fault_line` | `heat` | 0, 2 | — |
| `ps_09_old_growth_heart` | `dark` | 1, 3 | — |
| `ps_11_bone_grove` | `skull` | 0, 3 | — |
| `ps_11_bone_grove` | `avoid` | 1, 2 | — |
| `ps_14_still_creek` | `surface` | 1, 3 | — |
| `ps_17_quarantine_camp` | `biohazard` | 1, 4 | — |
| `scar_01_crater_rim` | `history` | 2, 3 | — |
| `scar_17_lab_wing_a_entrance` | `timeline` | 1, 2 | — |
| `scar_19_lab_wing_b_entrance` | `alpha` | 0, 4 | — |
| `scar_23_medical_bay` | `sanguine` | 0, 3 | — |
| `scar_27_the_antechamber` | `recording` | 0, 3 | — |
| `scar_28_junction` | `scale` | 1, 2 | — |
| `pens_14_rooks_office` | `rook` | 2, 3 | — |

**Completely unreachable extras (all keywords shadowed)**:

| Room | Extra Index | Keywords | Shadowed By |
|------|-------------|----------|-------------|
| `scar_14_the_core` | 7 | `cure aftermath`, `after cure`, `cure cover-up` | extra[6] keyword `after` |
| `scar_14_the_core` | 8 | `weapon aftermath`, `after weapon`, `weapon cover-up` | extra[6] keyword `after` |
| `scar_14_the_core` | 9 | `seal aftermath`, `after seal`, `seal cover-up` | extra[6] keyword `after` |
| `scar_14_the_core` | 10 | `throne aftermath`, `after throne`, `throne cover-up` | extra[6] keyword `after` |

---

## 5. Grant Flags Never Read by Any `questGate` or Deduction `requires[]` in Room Data

These flags are set by `questFlagOnSuccess` in room extras but do not appear as `questGate` values on any extra or as `requires[]` entries in any `narrativeKeyOnDeduction`. They may still be consumed by dialogue trees, NPC initiative, or `gameEngine.ts` logic — this list is for cross-referencing, not a definitive orphan analysis.

```
echo_encountered, echo_meridian_connection, meridian_archive_accessed,
cv_overflow_refugees_noted, meridian_signal_traced, harlow_harrow_connection,
em_tank_farm_valve_investigated, em_foreman_schedule_read, em_foreman_locker_opened,
em_rail_tanker_investigated, em_incinerator_bone_found, em_incinerator_sweeper_tracked,
found_meridian_edge_node, found_meridian_office_directory, found_r1_sequencing_data,
found_cdc_encrypted_files, found_charon_ethics_proceedings, found_meridian_building_permit,
duskhollow_tithe_arrears_seen, duskhollow_rim_hollow_pattern_seen,
duskhollow_kindling_cell_maps_read, duskhollow_kindling_documents_read,
duskhollow_elder_legal_research_seen, duskhollow_cistern_device_found,
duskhollow_cistern_investigation, duskhollow_kindling_market_drops_seen,
explained_hollow_adaptation, discovered_charon7_deliberate_release,
discovered_fault_entity, discovered_fault_scar_connection, scar_overlook_visited,
meridian_timeline_clarified, broadcaster_found, game_ending,
found_sanguine_origin, found_hollow_origin, hollow_origin_understood,
found_broadcaster_identity, discovered_vane_self_administered_r1,
meridian_antechamber_heard, fault_scar_connection_confirmed,
pens_rooks_letter_found, transit_point_4_schedule_noted, pens_yield_discrepancy_found,
pens_rook_dialogue_unlocked, pens_rook_met_in_office
```

Flags that DO appear in room logic (questGate or deduction prereqs):
- `discovered_field_station_echo` — questGate on `st_08_levs_office[5]`
- `scar_blast_pattern_analyzed`, `scar_bombing_intent_understood`, `meridian_bombing_orders_found` — all required for `scar_bombing_truth` deduction
- `reclaimers_meridian_keycard` — questGate on `st_09_comm_center[...]`
- `deep_utility_access` — questGate on `scar_01_crater_rim` richExit
- `duskhollow_cistern_contamination_identified` — questGate on `dh_04_vespers_study[2]`
- `sanguine_biometric_obtained`, `kindling_tunnel_access` — unlockFlags on scar main entrance

---

## 6. Test Coverage Method

- **Keyword dispatch**: every extra's first non-shadowed keyword verified via `look <kw>` → non-error output containing description prefix.
- **Skill check pass**: high-stat player (all stats=10) + `Math.random` pinned to 0.9 → roll of 20 → `successAppend` in output.
- **Skill check fail**: low-stat player (all stats=1) + `Math.random` pinned to 0.0 → roll of 2 → failure system message in output, `successAppend` absent.
- **questFlagOnSuccess**: after `look <kw>`, `player.questFlags[flag] === value`.
- **narrativeKeyOnExamine**: after `look <kw>`, `player.narrativeKeys.includes(key)`.
- **narrativeKeyOnDeduction**: after pre-seeding all `requires[]` flags then `look <kw>`, key granted; without prereqs, key absent.
- **questGate blocking**: player with no flags + unique-to-extra keyword → "don't have enough context" in output.
- **questGate pass-through**: player with gate flag set + unique-to-extra keyword → real description returned.
- **Duplicate keyword detection**: exact keyword match across extras in same room flagged as minor.
- **Shadowing analysis**: extras with all keywords covered by earlier extras reported as blockers.
