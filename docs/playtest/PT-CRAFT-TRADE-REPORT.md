# PT-CRAFT-TRADE Report
**Playtest:** Exhaustive Crafting + Vendor Coverage
**Branch:** `playtest/pt-craft-trade-0503`
**Date:** 2026-04-30
**Test file:** `tests/playtest/craft-trade-exhaustive.test.ts`

---

## 1. Summary

| Metric | Count |
|--------|-------|
| Total recipes | 15 |
| Recipes with skill checks | 15 |
| Quest-gated recipes (discoveredBy) | 3 |
| Broken ingredient refs | **0** |
| Broken output refs | **0** |
| Total vendors enumerated | 20 |
| Zones with vendors | 7 (crossroads, covenant, salt_creek, duskhollow, the_deep, the_dust, the_stacks) |
| Total trade inventory item slots | 84 |
| Broken trade item refs | **0** |
| Invalid skill types in recipes | **0** |
| DCs > 20 (unachievable) | **0** |
| Blockers | **0** |

**Overall status: CLEAN.** All 36 tests pass. No broken refs in recipes or vendor inventories.

---

## 2. Broken-Recipe Table

None found. Every recipe's `components[].itemId` and `result.itemId` resolves to a valid entry in `data/items.ts`.

| Recipe | Issue | Fix proposal |
|--------|-------|--------------|
| (none) | — | — |

---

## 3. Broken-Vendor Table

None found. Every `tradeInventory` item ID across all 20 vendor entries resolves to a valid item in `data/items.ts`.

| Vendor | Room | Issue |
|--------|------|-------|
| (none) | — | — |

### Full Vendor Inventory (verified clean)

| NPC ID | Zone | Trade Inventory |
|--------|------|-----------------|
| marta_food_vendor | crossroads | boiled_rations, elk_jerky, purification_tabs, salt_1kg |
| weapons_vendor_cole | crossroads | pipe_wrench, hatchet, combat_knife, machete, 22_rifle, 9mm_pistol, ammo_22lr, ammo_9mm, ammo_shotgun_shell |
| components_vendor | crossroads | scrap_metal, textiles, electronics_salvage, chemicals_basic, rare_parts_random |
| map_seller_reno | crossroads | map_breaks_basic, map_river_road, map_dust_partial |
| patch | crossroads | antibiotics_01, bandages, quiet_drops, stim_shot |
| water_attendant | crossroads | clean_water_1L, purification_tabs |
| leatherworker_vin | crossroads | leather_belt, knife_sheath, pistol_holster, scrap_vest, runners_kit |
| market_vendor_covenant | covenant | purification_tabs, gauze, canned_food, salt_1kg |
| quartermaster_okafor (main) | covenant | accord_issue_rifle, accord_issue_pistol, ammo_22lr, ammo_9mm, leather_armor, militia_vest |
| medic_marsh | covenant | field_dressing, antiseptic, pain_tabs, antibiotics_single_dose |
| mechanic_torque | covenant | scrap_metal, basic_repair_kit, leather_patch_kit, salvaged_components |
| quartermaster_okafor (south wall) | covenant | field_dressing, bandages, canned_food, scrap_metal, basic_repair_kit |
| armorer_reyes | salt_creek | ar_platform_rifle, sniper_rifle, military_sidearm, fragmentation_grenade, ammo_556, ammo_762, body_armor_military |
| tithe_human_resident | duskhollow | boiled_rations, bandages, purification_tabs, scrap_metal, textiles, ammo_22lr |
| kindling_resident_faithful | duskhollow | kindling_treatment_compound, purification_tabs, quiet_drops |
| elder_sanguine_npc | the_deep | sanguine_blood_vial |
| mysterious_stranger_sanguine | the_deep | sanguine_blood_vial |
| drifter_cart_team | the_dust | purification_tabs, dried_meat_strip, bandages, scrap_metal, ammo_22lr, crafting_components |
| map_seller_reno | the_dust | radio_fragment, torn_note_fragment |
| reclaimer_craftsperson | the_stacks | crafting_components, electronics_kit, welding_rod |

---

## 4. Skill-Check Sanity Warnings

All recipe DCs are in the achievable range (8–15). No DC exceeds 20. No invalid skill type names.

| Recipe | Skill | DC | Note |
|--------|-------|----|------|
| field_dressing | field_medicine | 8 | Low — very accessible |
| combat_medkit | field_medicine | 9 | Low |
| purified_antiseptic | field_medicine | 10 | Moderate |
| trauma_kit | field_medicine | 12 | Moderate — 4 components + DC 12 is the highest medical hurdle |
| improvised_trap | mechanics | 9 | Low |
| reinforced_plate | mechanics | 8 | Low — single component recipe |
| armor_patch | mechanics | 8 | Low |
| lockpick_set | mechanics | 10 | Moderate |
| pipe_weapon_improved | mechanics | 11 | Moderate |
| fortified_armor | mechanics | 13 | Elevated — gated by quest flag, appropriate |
| chemical_light | electronics | 9 | Low |
| signal_booster | electronics | 11 | Moderate |
| incendiary_charge | mechanics | 12 | Moderate |
| emp_device | electronics | 14 | High — gated by quest flag `stacks_blueprint_found` |
| antiviral_compound | field_medicine | 15 | High — gated by `found_r1_sequencing_data`. Highest DC in game. Acceptable given narrative weight. |

**Notable:** `antiviral_compound` at DC 15 with `field_medicine` is the hardest craft. A baseline `wits` of 5 gives a ~35% success rate. Classes with `field_medicine` bonuses (shepherd) have better odds. This is intentional — the compound's story role makes it appropriate to be hard.

---

## 5. Minor Issues

### Recipes without description
None — all 15 recipes have non-empty descriptions.

### Duplicate vendor spawn
`quartermaster_okafor` appears twice in the covenant zone (armory room and south wall fallback room). Both instances have valid inventories. This is intentional (the NPC can be found in two locations), not a bug.

### `field_dressing` recipe output: non-`crafted_` prefix
The `field_dressing` recipe produces `field_dressing` (no `crafted_` prefix), unlike most other crafting recipes. This means crafting yields the same item as the world-found version — no distinct crafted variant. This is consistent, not broken.

### Zones with no vendors
Zones `river_road`, `the_ember`, `the_breaks`, `the_pine_sea`, `the_scar`, and `the_pens` have no `tradeInventory` entries. This is intentional per the world design (hostile / wilderness zones).

---

## 6. Trade Reachability via `talk` Verb

The `handleTrade` function (`lib/actions/trade.ts`) is invoked by the `trade`/`barter` verb directly, not via the `talk` dialogue tree. The `talk` verb routes through `handleTalk` → dialogue system, and vendor NPCs do not expose a "trade" dialogue option as a node in `data/dialogueTrees.ts`.

**All vendors are reachable via `trade <npc-name>` or `trade` (first trading NPC in room).** None require routing through `talk`.

This means players who try `talk patch` → look for a trade option will not find one in the dialogue tree — `trade patch` is the correct verb. This is not a bug in the item registry, but it is a discoverability issue. Players unfamiliar with the `trade` command may miss vendors. The `help` command and any in-game prompting should surface `trade` as a verb.

---

## 7. Test Coverage

| Section | Tests | Result |
|---------|-------|--------|
| Recipe data integrity (static) | 8 | All pass |
| Craft simulation — success path | 5 | All pass |
| Craft simulation — failure path | 5 | All pass |
| Vendor data integrity (static) | 5 | All pass |
| Trade simulation — patch (crossroads) | 4 | All pass |
| Trade simulation — mechanic_torque (covenant) | 2 | All pass |
| Trade simulation — armorer_reyes (salt_creek) | 3 | All pass |
| Summary / data overview | 4 | All pass |
| **Total** | **36** | **36/36 pass** |
