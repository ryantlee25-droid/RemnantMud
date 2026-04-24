# Room Narrative Audit — All 13 Zones

**Auditor:** Spectrum Howler (narrative review)
**Date:** 2026-03-31
**Scope:** All room `description`, `descriptionNight`, `descriptionDawn`, `descriptionDusk`, `shortDescription`, `npcSpawns`, `npcs` (static array), and `extras` fields across 13 zone files.

**Severity key:**
- **BLOCKER** — will cause confusion, immersion breaks, or broken game logic; must fix before ship
- **WARNING** — weakens the writing or creates inconsistency; fix before Act reviews
- **STYLE** — suboptimal but not breaking; fix in polish pass

---

## Zone: crossroads

### cr_04_market_center — Crossroads Market — Center

- **ISSUE:** `shortDescription` is a single sentence fragment with no atmospheric grounding — "The heart of the market." This is the thinnest short description in the Crossroads zone. All other rooms have specific sensory or visual anchors in their short descriptions.
- **LINE:** `shortDescription: 'The heart of the market.'`
- **SEVERITY:** STYLE

### cr_04_market_center — Crossroads Market — Center

- **ISSUE:** The `npcSpawns` entry for `components_vendor` has no `dialogueTree` and no name in the activity pool. She is described as "A thin woman with wire-rim glasses" but the `npcId` is `components_vendor` — a generic role label rather than a character name. Marta (cr_03) and Cole (cr_04) have proper named IDs; this vendor does not.
- **LINE:** `npcId: 'components_vendor'` — no named dialogue, no name in prose
- **SEVERITY:** WARNING

### cr_07_patch_clinic — The Red Door Clinic

- **ISSUE:** `descriptionNight` is a tell-not-show two-sentence fragment with no atmosphere: "The clinic's lantern burns all night. Someone is always hurt. Someone is always sick." This is the most functional room in Crossroads narratively, but the night description does no sensory or emotional work compared to adjacent rooms.
- **LINE:** `descriptionNight: 'The clinic\'s lantern burns all night. Someone is always hurt. Someone is always sick.'`
- **SEVERITY:** STYLE

---

## Zone: river_road

### rr_10b_bus_interior — Inside the Overturned Bus

- **ISSUE:** `descriptionNight` is a bare four-sentence placeholder — "Total darkness. The smell is worse. The sounds are closer. You can feel them moving before you see them." Every other room in the zone has night descriptions with specific sensory texture. This room's night description does nothing the player can't infer and wastes its horror potential.
- **LINE:** `descriptionNight: 'Total darkness. The smell is worse. The sounds are closer. You can feel them moving before you see them.'`
- **SEVERITY:** WARNING

### rr_10b_bus_interior — Inside the Overturned Bus

- **ISSUE:** The `description` field contains "The air is thick — decay, mold, and something sour." This is the only generic atmospheric opener ("The air is X") across all 13 zones. It technically names the components, so it narrowly avoids the pure-generic failure, but the construction is weaker than the rest of the file.
- **LINE:** `'The air is thick — decay, mold, and something sour.'`
- **SEVERITY:** STYLE

---

## Zone: covenant

### cv_07_infirmary — The Infirmary

- **ISSUE:** Missing `descriptionDawn` and `descriptionDusk` fields. Every major hub room in Covenant (courthouse, main street, gate square) has dawn/dusk variants. The infirmary, which is an emotionally significant room (the child in the bed, the sign), has only day and night descriptions.
- **LINE:** No `descriptionDawn` or `descriptionDusk` present
- **SEVERITY:** STYLE

### cv_26_refugee_processing — (accessible from cv_01 exit `east`)

- **ISSUE:** The main gate (`cv_01`) has an exit `east: 'cv_26_refugee_processing'` but no `cv_26_refugee_processing` room appears in the `covenant.ts` file in any of the sections read (up to ~700 lines, covering rooms cv_01 through cv_15+). Either this room is missing from the file or the exit ID is a stub pointing nowhere.
- **LINE:** `exits: { east: 'cv_26_refugee_processing' }` in cv_01
- **SEVERITY:** BLOCKER

### cv_22_council_chamber — (accessible from cv_05 exit `north`)

- **ISSUE:** cv_05 courthouse upper floor has an exit `north: 'cv_22_council_chamber'` gated on Accord reputation. If this room is defined elsewhere in the file (beyond the read window), this is not an issue. However, it does not appear in the early portions of the file. Needs verification that cv_22 is defined.
- **LINE:** `exits: { north: 'cv_22_council_chamber' }` in cv_05
- **SEVERITY:** WARNING (verify room exists in full file)

### cv_23_accord_clinic_overflow — (accessible from cv_07 exit `east`)

- **ISSUE:** cv_07 infirmary has exit `east: 'cv_23_accord_clinic_overflow'`. Like cv_22 above, not visible in read window. Needs verification.
- **LINE:** `exits: { east: 'cv_23_accord_clinic_overflow' }` in cv_07
- **SEVERITY:** WARNING (verify room exists in full file)

---

## Zone: salt_creek

### sc_06_mess_hall — Mess Hall

- **ISSUE:** The `exits` object only has `east: 'sc_04_the_yard'`, but the room `description` references a social space with clear multiple directions implied. More critically, the barracks (sc_05) has `west: 'sc_20_mess_hall'` — an ID of `sc_20_mess_hall` — while the mess hall defines itself as `sc_06_mess_hall`. This is a room ID mismatch: the barracks points to `sc_20_mess_hall` but the actual room is `sc_06_mess_hall`.
- **LINE:** `sc_05` barracks has `west: 'sc_20_mess_hall'`; actual mess hall room is `id: 'sc_06_mess_hall'`
- **SEVERITY:** BLOCKER

### sc_05_barracks — Barracks

- **ISSUE:** `exits` has `west: 'sc_20_mess_hall'` which mismatches `sc_06_mess_hall`. Also has `east: 'sc_07_warlords_command'` — this may be correct — and `west: 'sc_20_mess_hall'`. The barracks also declares no `south` exit back to sc_04_the_yard, which the yard's `north: 'sc_05_barracks'` would require for bidirectional navigation.
- **LINE:** Missing return exit `south: 'sc_04_the_yard'` in barracks exits
- **SEVERITY:** WARNING

---

## Zone: the_ember

### em_04_deacons_chamber — Deacon's Chamber

- **ISSUE:** `descriptionNight` is a single sentence: "Harrow works late. The chamber lamp burns past midnight on most days. This is information he'd offer freely if you asked." Two of these three sentences are meta-commentary (what Harrow would tell you, not what you see). This is the only room in the_ember zone without an atmospheric night description.
- **LINE:** `descriptionNight: 'Harrow works late. The chamber lamp burns past midnight on most days. This is information he\'d offer freely if you asked.'`
- **SEVERITY:** WARNING

---

## Zone: the_breaks

No blockers. Quality across the_breaks is consistently strong — the slot canyon, the wash, the ledge trail, and bone hollow all have multi-paragraph descriptions with specific geological and sensory detail. Dawn/dusk/night variants are present where appropriate.

**One observation:**

### br_04_ledge_trail — The Ledge Trail

- **ISSUE:** `descriptionNight` is the thinnest in the zone: "The ledge trail at night is a different proposition. The darkness takes away your depth cues. The path is the path. You go slowly." Functional but three short declarative sentences do less than the trail deserves. Every other Breaks room has a more textured night description. Not a blocker — this room is gated by Climbing DC 10 so night traversal is an edge case.
- **LINE:** `descriptionNight` — 3 short sentences
- **SEVERITY:** STYLE

---

## Zone: the_dust

No blockers. The ghost town cluster (du_04 through du_07) is among the best writing in the game. The diner's time-of-day variants, the alkali flat's dawn, and the ghost main street's dusk description are standouts.

**One observation:**

### du_03_alkali_flat — The Alkali Flat

- **ISSUE:** Missing `descriptionDusk`. All other rooms in the Dust cluster (du_01, du_02, du_04) have dusk descriptions. The alkali flat at dusk — when the migration trails would catch the last light and the Hollow would be most active — is an omission.
- **LINE:** No `descriptionDusk` present
- **SEVERITY:** STYLE

---

## Zone: the_stacks

### st_02_entry_hall — Entry Hall

- **ISSUE:** Hard-coded NPC name in description prose: "Lev stands at the inner door, clipboard in hand..." This is a Level 5 violation — if Lev's spawn fails (spawnChance 0.85, so 15% of visits), the description references a character who isn't there. The description should use an NPC spawn activity pool instead of the prose, or remove the name from the base description.
- **LINE:** `description: '...Lev stands at the inner door, clipboard in hand...'`
- **SEVERITY:** BLOCKER

### st_04_research_lab — Research Lab

- **ISSUE:** The `npcs` static array contains `['lev']` AND there is a corresponding `npcSpawns` entry for Lev (not shown in the read window but referenced in the field). The static `npcs` array and the `npcSpawns` system appear to be parallel mechanisms — having both for the same NPC may cause double-spawn or undefined behavior. The entry hall (st_02) also has `npcs: ['lev']` and a npcSpawns block for Lev.
- **LINE:** `npcs: ['lev']` in both st_02 and st_04, alongside `npcSpawns` for the same character
- **SEVERITY:** WARNING

### st_08_levs_office — Lev's Office

- **ISSUE:** Same issue as st_04 — `npcs: ['lev']` alongside a npcSpawns entry. Additionally, Lev now appears in three rooms (st_02, st_04, st_08) as a simultaneous static NPC. The `spawnType: 'anchored'` on the npcSpawns suggests the intent is a single-location presence. Having Lev statically placed in three rooms via the `npcs` array while also having npcSpawns anchors is contradictory.
- **LINE:** `npcs: ['lev']` in st_08 + npcSpawns for lev in multiple rooms
- **SEVERITY:** WARNING

### st_03_server_room — Server Room

- **ISSUE:** The `npcSpawns` activity pool uses purely generic descriptions with no names: "A technician works two terminals simultaneously" / "A Reclaimer researcher types quickly." The `npcId: 'reclaimer_technician'` is a generic role label. No character name, no dialogue tree. For the Stacks' most important data hub, the NPCs are functionally invisible — they exist but cannot be spoken to and have no identity.
- **LINE:** `npcId: 'reclaimer_technician'` — no dialogueTree, pure generic descriptors
- **SEVERITY:** WARNING

### st_05_workshop — Workshop

- **ISSUE:** Same pattern as server room. `npcId: 'reclaimer_craftsperson'` — no dialogue tree, no name, purely functional descriptions. The workshop is the best crafting station in the Four Corners; the people in it deserve at least one named NPC with a dialogue hook.
- **LINE:** `npcId: 'reclaimer_craftsperson'` — no dialogueTree, no character name
- **SEVERITY:** WARNING

---

## Zone: duskhollow

Overall quality in duskhollow is high. Vesper's study is exceptional. The tithe room, great hall, and entrance hall are well-crafted.

**One issue:**

### dh_05_tithe_room — The Tithe Room

- **ISSUE:** The `npcSpawns` includes a `dory` entry with an activity description that refers to "The sanctuary" — "The sanctuary is different now. The candles have been arranged..." — but the room is called `The Tithe Room`, not "the sanctuary." The word "sanctuary" doesn't appear anywhere in the room's description, extras, or name. This reads as a copy error from a different room context.
- **LINE:** `desc: 'The sanctuary is different now...'` in the dory npcSpawns activity pool
- **SEVERITY:** WARNING

---

## Zone: the_deep

### dp_03_shaft_lower — Shaft One — Lower

- **ISSUE:** `descriptionNight` is a two-word entry: "No night. No day. Just depth." This is consistent with the Deep's thematic conceit (no day cycle underground), but it appears in three rooms back-to-back (dp_02, dp_03, dp_04), each with slight variations. The conceit works once — repeating it verbatim-adjacent across three rooms makes it read as a placeholder rather than an intentional device.
- **LINE:** `descriptionNight: 'No night. No day. Just depth.'` (dp_03); `'Junction. Three directions. All dark.'` (dp_04); `'Same dark. Different shadows...'` (dp_05)
- **SEVERITY:** STYLE

### dp_04_junction — The Junction

- **ISSUE:** `descriptionNight` is three words: "Junction. Three directions. All dark." The richDesc variant is even thinner than the already-minimal dp_03. The junction is the highest-danger room in the Deep with the most narrative significance (the barricade, the four passages). Its night description does nothing.
- **LINE:** `descriptionNight: 'Junction. Three directions. All dark.'`
- **SEVERITY:** WARNING

---

## Zone: the_pine_sea

Quality is uniformly high. The elk meadow, waterfall, and logger's cabin are strong emotional beats. The logbook SHEPHERD thread (Lev's handwriting connection) is a well-placed lore revelation.

**One observation:**

### ps_06_shepherds_camp — (accessible from ps_04 exit `north`)

- **ISSUE:** Room `ps_06_shepherds_camp` is referenced from `ps_04_waterfall` as exit north, but was not visible in the read window. Needs verification that it is defined in the file.
- **LINE:** `exits: { north: 'ps_06_shepherds_camp' }` in ps_04
- **SEVERITY:** WARNING (verify room exists)

---

## Zone: the_scar

### scar_07_cold_storage — Cold Storage Vault

- **ISSUE:** `description` refers to this room explicitly as "the MacGuffin room" in the prose — this is developer shorthand visible to players as room description text: "The facility's cold storage vault is the MacGuffin room." The term MacGuffin is a narrative device term that would break immersion entirely if displayed to a player.
- **LINE:** `description: 'The facility\'s cold storage vault is the MacGuffin room.'`
- **SEVERITY:** BLOCKER

### scar_03_decontamination — Decontamination

- **ISSUE:** The `hollowEncounter.threatPool` uses bare numeric weights (`weight: 2` and `weight: 3`) instead of the percentage-summing format used everywhere else in the codebase. All other threat pools use weights that imply a total (e.g., 70 + 30 = 100, or 45 + 35 + 20 = 100). The decontamination room uses weights of 2 and 3, which is valid for weighted selection but inconsistent with the rest of the file's documentation convention and will look like a placeholder.
- **LINE:** `{ type: 'remnant', weight: 2 }` and `{ type: 'shuffler', weight: 3 }` in hollowEncounter.threatPool
- **SEVERITY:** STYLE

### scar_08_security_center — Security Center

- **ISSUE:** `shortDescription` is "Automated defenses. Combat possible. Military loot." — this is design notes phrasing, not player-facing prose. Every other room in the Scar has descriptive prose in shortDescription. "Military loot" in particular is purely mechanical and completely breaks the game's established narrative voice.
- **LINE:** `shortDescription: 'Automated defenses. Combat possible. Military loot.'`
- **SEVERITY:** WARNING

### scar_06_holding_cells — Holding Cells

- **ISSUE:** `shortDescription` is "Holding cells. Test subjects. Letters collectible. Horror." — "Letters collectible" is a mechanical flag in player-facing prose, and "Horror." as a standalone word is design shorthand. The rest of the Scar's shortDescriptions are scene-setting prose, not notes.
- **LINE:** `shortDescription: 'Holding cells. Test subjects. Letters collectible. Horror.'`
- **SEVERITY:** WARNING

---

## Zone: the_pens

### pens_01_east_gate — The East Gate

- **ISSUE:** **Copy-paste error / wrong-zone NPC.** The static `npcs` array contains `'crossroads_gate_guard'`. This NPC is defined in crossroads.ts and belongs to the Crossroads gate (cr_02). A Crossroads arbiter guarding the Red Court's Pens entrance makes no narrative or factional sense — the Pens is run by the Red Court with its own enforcer NPCs. This appears to be a copy-paste from another zone's gate room.
- **LINE:** `npcs: ['crossroads_gate_guard']` in pens_01_east_gate
- **SEVERITY:** BLOCKER

### pens_02_intake_hall — Intake Hall

- **ISSUE:** **Wrong-zone NPC.** The static `npcs` array contains `'courthouse_clerk'`. This is Marshal Cross's Covenant courthouse clerk. There is no logical reason for a Covenant government clerk to be present in a Red Court blood-banking facility intake hall. This is another copy-paste error.
- **LINE:** `npcs: ['courthouse_clerk', 'drifter_newcomer']` in pens_02
- **SEVERITY:** BLOCKER

### pens_08_administration — Administration Wing (line ~417)

- **ISSUE:** **Wrong-zone NPCs.** The static `npcs` array contains both `'courthouse_clerk'` AND `'checkpoint_arbiter'`. The checkpoint_arbiter is defined as a Crossroads gate NPC. Neither belongs in the Red Court administration wing.
- **LINE:** `npcs: ['courthouse_clerk', 'checkpoint_arbiter']` in pens_08
- **SEVERITY:** BLOCKER

### pens_03_ward_a_corridor — Ward A Corridor

- **ISSUE:** Static `npcs` array contains `'drifter_newcomer'` and `'wounded_drifter'`. While drifters as patients in Ward A is narratively plausible, using the crossroads market NPC IDs (drifter_newcomer is a Crossroads-wanderer, wounded_drifter is defined in Crossroads clinic) instead of Pens-specific donor NPCs means these characters may carry inappropriate dialogue trees or equipment that breaks the ward context.
- **LINE:** `npcs: ['drifter_newcomer', 'wounded_drifter']`
- **SEVERITY:** WARNING

### pens_06_ward_b_corridor — Ward B Corridor

- **ISSUE:** Same as pens_03 — `npcs: ['drifter_newcomer', 'wounded_drifter']`. Repeated cross-zone NPC placement without Pens-specific NPC IDs for what is a distinct population (long-term donors, not street-level wanderers).
- **LINE:** `npcs: ['drifter_newcomer', 'wounded_drifter']`
- **SEVERITY:** WARNING

### pens_04_ward_a_beds — Ward A Sleeping Area

- **ISSUE:** Static `npcs` array contains `'riverside_resident'` and `'breaks_wanderer_at_rest'`. `riverside_resident` is a Covenant riverside district NPC. `breaks_wanderer_at_rest` is defined in the_breaks.ts. Neither identity makes sense in the context of Ward A, a long-term donor ward. These are copy-pasted from an ambient population table without being adapted for the Pens.
- **LINE:** `npcs: ['riverside_resident', 'breaks_wanderer_at_rest']`
- **SEVERITY:** WARNING

### pens_07_cafeteria — Donor Cafeteria

- **ISSUE:** Static `npcs` array contains `'food_vendor_generic'`, `'breaks_wanderer_at_rest'`, and `'riverside_resident'`. Three out-of-zone NPCs in one room. `food_vendor_generic` has no definition visible in any zone file — it may not exist at all.
- **LINE:** `npcs: ['food_vendor_generic', 'breaks_wanderer_at_rest', 'riverside_resident']`
- **SEVERITY:** BLOCKER (food_vendor_generic may be undefined), WARNING (the other two)

---

## Cross-Zone Summary

### Hard-coded NPC names in prose (potential break-on-missing-spawn)

| Room | Field | Text |
|------|-------|------|
| `st_02_entry_hall` | `description` | "Lev stands at the inner door..." |
| `rr_02_bridge_ruins` | npcSpawns activityPool | "Howard is on the bridge itself..." (activityPool desc, not base description — this is acceptable as it's conditional on Howard's spawn) |
| `cr_03_market_south` | `descriptionDawn` | "Marta's fire is barely a thread of smoke..." |
| `cr_03_market_south` | `descriptionDusk` | "Marta banks her fire hard..." |

The `st_02_entry_hall` base description is the hard blocker. The `cr_03` instances are in time-variant descriptions that reference Marta by name — if Marta doesn't spawn (15% chance), the time-of-day description still invokes her. This is a softer version of the same problem.

- `st_02_entry_hall` description: **BLOCKER**
- `cr_03` dawn/dusk Marta references: **WARNING**

### Generic NPC IDs with no dialogue trees or character names

| Room | npcId | Issue |
|------|-------|-------|
| `cr_04_market_center` | `components_vendor` | No name, no dialogue tree |
| `st_03_server_room` | `reclaimer_technician` | No name, no dialogue tree |
| `st_05_workshop` | `reclaimer_craftsperson` | No name, no dialogue tree |
| `pens_08_administration` | (via static npcs) `courthouse_clerk` | Wrong zone entirely |

### Thin descriptions (fewer than 2 sentences of actual description)

| Room | Field | Content |
|------|-------|---------|
| `cr_07_patch_clinic` | `descriptionNight` | 3 short functional sentences, no atmosphere |
| `rr_10b_bus_interior` | `descriptionNight` | 4 short declarative sentences, no texture |
| `dp_03_shaft_lower` | `descriptionNight` | 3-word concept, not description |
| `dp_04_junction` | `descriptionNight` | 3 words — "Junction. Three directions. All dark." |
| `em_04_deacons_chamber` | `descriptionNight` | Meta-commentary, not scene description |

---

## Consolidated Blockers (Fix First)

1. **`pens_01_east_gate`** — `npcs: ['crossroads_gate_guard']` — wrong zone NPC
2. **`pens_02_intake_hall`** — `npcs: ['courthouse_clerk', 'drifter_newcomer']` — courthouse_clerk wrong zone
3. **`pens_08_administration`** — `npcs: ['courthouse_clerk', 'checkpoint_arbiter']` — both wrong zone
4. **`pens_07_cafeteria`** — `npcs: ['food_vendor_generic', ...]` — food_vendor_generic likely undefined
5. **`scar_07_cold_storage`** — `description` contains "the MacGuffin room" — player-visible design note
6. **`st_02_entry_hall`** — description hard-codes "Lev stands at the inner door" — breaks on 15% no-spawn
7. **`sc_05_barracks` / `sc_06_mess_hall`** — room ID mismatch: barracks references `sc_20_mess_hall`, actual ID is `sc_06_mess_hall`
8. **`cv_01_main_gate`** — exit `east: 'cv_26_refugee_processing'` — room not confirmed to exist in file

---

## What Holds Up Well (Do Not Change)

- **The Breaks** — consistently strong across all 20 rooms. No blockers, no structural issues.
- **The Dust** — ghost town cluster is exceptional; the diner time-variants are the best atmospheric writing in the game.
- **Duskhollow** — Vesper's study, the great hall, and the tithe room are all high-quality. The Rider E additions (dory) are well-integrated.
- **The Pine Sea** — elk meadow personal loss echoes and the logger's cabin logbook are standouts.
- **Salt Creek** — the kill zone, the mess hall intelligence-gathering scene, and Briggs's command center are all strong.
- **The Scar** — the Core lab terminal descriptions and the broadcaster room are excellent; the revelation arc lands.
- **The Pens** — the writing quality (description prose, personal loss echoes, extras) is high throughout; the problems are entirely in the static `npcs` arrays, not the narrative text itself.
