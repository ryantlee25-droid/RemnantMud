# PLAN: The Remnant — Current State & Roadmap
**Updated:** 2026-03-27
**Stack:** Next.js 16 · TypeScript strict · Supabase · Tailwind CSS 4 · Vitest
**Constraint:** `npx tsc --noEmit` zero-error before any commit. All migrations via `supabase db push --yes`.

---

## Current State Summary

### What's Done (Strong Foundation)
- ✅ **Core engine:** time-of-day, probabilistic spawning, combat, movement, inventory, stash, death/rebirth cycle
- ✅ **DB schema:** players, player_inventory, player_stash, player_ledger, generated_rooms, faction_reputation, quest_flags
- ✅ **Gate system:** skill gates, reputation gates, cycle gates, quest gates — all checked in movement.ts
- ✅ **Faction reputation:** tracked, displayed via `rep` command, gates enforced
- ✅ **Quest flags:** set/read in DB, gates enforced on exits
- ✅ **Lore reader:** `use [item]` / `read [item]` display loreText for lore-type items
- ✅ **The Between:** death screen with cycle-aware memory fragment text fully implemented
- ✅ **Actions split:** lib/actions/ (movement, combat, items, social, system, examine)
- ✅ **170 rooms:** 12 of 13 zones have content (The Pens is the only missing zone)
- ✅ **Landing page:** /landing static marketing page

### Room Count vs Target

| Zone | Act | Target | Have | Gap |
|------|-----|--------|------|-----|
| Crossroads | I | 18 | 18 | ✅ Done |
| River Road | I | 22 | 23 | ✅ Done |
| Covenant | I-II | 28 | 18 | -10 |
| Salt Creek Stronghold | I-II | 20 | 14 | -6 |
| The Ember | I-II | 16 | 10 | -6 |
| The Breaks | I-II | 22 | 16 | -6 |
| The Dust | II | 18 | 12 | -6 |
| The Stacks | II | 14 | 10 | -4 |
| Duskhollow Manor | II | 18 | 12 | -6 |
| The Pens | II-III | 14 | 0 | -14 |
| The Deep | II-III | 20 | 14 | -6 |
| The Pine Sea | II-III | 12 | 8 | -4 |
| The Scar / MERIDIAN | III | 28 | 15 | -13 |
| **TOTAL** | | **250** | **170** | **-80** |

---

## Track 1 — Quick Wins (Wiring Gaps)

These are systems that are ~70% built. Each is a focused 2–8 hour task.

### W-1 — `examine_extra` / `look <keyword>` handler
**Files:** `lib/actions/examine.ts`, `lib/gameEngine.ts`
**Problem:** `handleExamineExtra` is imported in gameEngine.ts line 33 and dispatched at line 778 but the handler body is empty (or missing). The `extras` array on rooms is richly populated but untriggerable.
**Fix:**
1. Implement `handleExamineExtra(keyword: string, state, supabase)` in examine.ts.
2. Match keyword against `room.extras[].keywords` (case-insensitive, partial match OK).
3. If `extra.skillCheck` exists, roll check against player stat. On fail: show `failMessage`. On success: show `description` and set `questFlagOnSuccess` if defined.
4. If no match: "You don't see anything special about that."
**Done when:** `look sign`, `look wall`, `look ground` work in cr_01; skill-checked extras resolve correctly.

### W-2 — NPC activity & disposition at runtime
**Files:** `lib/spawn.ts`, `lib/actions/social.ts`, `lib/gameEngine.ts`
**Problem:** `activityPool` and `dispositionRoll` are defined on every NPC spawn entry but never rolled. All NPCs show a static `room_description` and always have `neutral` disposition.
**Fix:**
1. Add `rollNpcActivity(npcSpawn: NpcSpawnEntry, timeOfDay: TimeOfDay): string` to spawn.ts — weighted random from `activityPool` filtered by current time.
2. Add `rollNpcDisposition(npcSpawn: NpcSpawnEntry): NpcDisposition` to spawn.ts — weighted random from `dispositionRoll`.
3. In `_applyPopulation()` (gameEngine.ts), call both when building the spawned NPC object.
4. In `handleTalk()` (social.ts), gate responses by disposition: `wary` → terse/reluctant, `hostile` → refuses or threatens, `friendly` → extra info.
5. Replace static NPC room line with rolled activity string.
**Done when:** Gate guard at cr_01 shows varied activity on room entry; disposition affects `talk` response.

### W-3 — Item depletion tracking
**Files:** `lib/actions/items.ts`, `lib/world.ts`, `lib/gameEngine.ts`
**Problem:** `room_state` table exists (with `depleted_item_ids`) but `handleTake` never writes to it. Items respawn on every room re-entry.
**Fix:**
1. In `handleTake()`, after successful item removal, call `recordDepletion(playerId, roomId, itemId)`.
2. In `_applyPopulation()`, fetch `room_state.depleted_item_ids` for current room and pass to `populateRoom()`.
3. In `populateRoom()`, skip any item whose id is in `depleted_item_ids`.
4. Respawn: each `ItemSpawnEntry` has `depletion.cooldownMinutes`. Clear depletion when `actionsTaken` has advanced enough time periods.
**Done when:** Taking a bandage from cr_07 means it's gone on re-entry; it respawns after ~1 in-game day.

### W-4 — Enemy defeat persistence
**Files:** `lib/actions/combat.ts`, `lib/world.ts`
**Problem:** Enemy defeat clears enemy from in-memory state but enemy re-spawns on next room re-entry.
**Fix:** Extend `room_state` to include `defeated_enemy_ids TEXT[]`. On kill, record enemy type + instance. In `_applyPopulation()`, pass defeated ids to `populateRoom()` to suppress re-spawn for 8 time periods.
**Done when:** Killing the Shuffler in a room means it's gone for a meaningful duration.

### W-5 — Squirrel companion wiring
**Files:** `lib/spawn.ts`, `lib/actions/social.ts`, `lib/gameEngine.ts`
**Problem:** `player_ledger` has `squirrel_alive`, `squirrel_trust`, `squirrel_name` columns. Character creation asks for squirrel name. Zero spawn/interaction logic.
**Fix:**
1. After cycle 1 death, if `squirrel_alive: true`, spawn squirrel as special NPC in shelter zone rooms.
2. `feed squirrel` command: increment trust (max 10), consume 1 food item from inventory.
3. Trust tiers: 0–3 skittish (flees on approach), 4–6 curious (follows to adjacent rooms), 7–10 loyal (prints warning on room entry if enemies present).
4. Squirrel can be killed by Brute/Hive Mother in occupied rooms. Sets `squirrel_alive: false`.
5. `name squirrel <name>` sets `squirrel_name` (constrained to Chippy/Stumpy per existing DB constraint).
**Done when:** Squirrel appears in Crossroads from cycle 2; trust increments; warning fires at high trust; can be named.

---

## Track 2 — Content: Zone Completion

Write rooms using the existing zone file schema. Match quality of crossroads.ts and river_road.ts — four time-of-day descriptions, extras with 3–5 keywords each, npcSpawns with activityPool and dispositionRoll, richExits with gating.

### C-1 — Covenant (+10 rooms, target 28)
**Current:** 18 rooms
**Needed:** Marshal Cross's inner office, courthouse, garrison barracks, underground archives, council chamber, Accord clinic overflow, holding cells, the wall walk, refugee processing, Accord quartermaster
**Priority lore hooks:** CHARON-7 suppression evidence in archives (sets quest flag for Scar access), Cross's faction questline entry

### C-2 — Salt Creek Stronghold (+6 rooms, target 20)
**Current:** 14 rooms
**Needed:** Briggs's command bunker, firing range, weapon depot, outer patrol circuit, prisoner pen, underground water reserve
**Priority lore hooks:** Salter defection subplot, prisoner who knows The Pens location

### C-3 — The Ember (+6 rooms, target 16)
**Current:** 10 rooms
**Needed:** Deacon Harrow's sanctum, the pyre room (active ritual), underground catacombs, bell tower, penitent quarters, reliquary
**Priority lore hooks:** Broadcaster signal received here, Kindling's CHARON-7 theology

### C-4 — The Breaks (+6 rooms, target 22)
**Current:** 16 rooms
**Needed:** Box canyon dead end (cache room), rope bridge crossing, Drifter camp, canyon shelter overnight spot, ancient petroglyphs site, slot canyon shortcut
**Priority lore hooks:** Petroglyphs reference pre-Collapse MERIDIAN surveying

### C-5 — The Dust (+6 rooms, target 18)
**Current:** 12 rooms
**Needed:** Abandoned ranch house, dry creek bed ambush point, ruined gas station, dust storm shelter, burned vehicle graveyard, border post ruins
**Priority lore hooks:** Letters Home lore items concentrate here

### C-6 — The Stacks (+4 rooms, target 14)
**Current:** 10 rooms
**Needed:** Lev's private workshop, server room (Broadcaster origin hint), roof observatory, sub-basement archive
**Priority lore hooks:** Reclaimers have partial MERIDIAN schematics

### C-7 — Duskhollow Manor (+6 rooms, target 18)
**Current:** 12 rooms
**Needed:** Lord Vayne's receiving hall, the blood tithe chamber, servant quarters, greenhouse (silver plants — danger), wine cellar, manor roof
**Priority lore hooks:** Covenant of Dusk's offer to player, Sanguine faction entry point

### C-8 — The Pens (14 rooms, entirely new)
**Current:** 0 rooms
**Zone theme:** The Red Court's livestock operation. Horror and rescue. Humans kept for blood. Former hospital repurposed.
**Rooms:** Intake processing, holding ward A/B/C, feeding chamber, guard station, Warden's office, escape tunnel entrance, underground passage, extraction room, incinerator, loading dock, perimeter fence, rooftop escape
**Gate:** Quest (must have Pens intel from prisoner in Salt Creek) + combat skill ≥ 6
**Priority:** This zone unlocks Act II-III and introduces the Red Court as primary antagonist

### C-9 — The Deep (+6 rooms, target 20)
**Current:** 14 rooms
**Needed:** Collapsed tunnel bypass, underground river crossing, bioluminescent fungus chamber, old mine foreman office, sinkhole descent, pressure seal door
**Priority lore hooks:** CHARON-7 spread underground via water table

### C-10 — The Pine Sea (+4 rooms, target 12)
**Current:** 8 rooms
**Needed:** Mountain overlook (sight line to The Scar), alpine meadow, ruined ski lodge, hidden Lucid camp
**Priority lore hooks:** The Lucid faction's cure research

### C-11 — The Scar / MERIDIAN (+13 rooms, target 28)
**Current:** 15 rooms
**Needed:** Facility exterior perimeter, checkpoint ruins, blast crater, underground entry, decontamination corridor, lab wing A (failed experiments), lab wing B (Sanguine origin), control room, broadcast station, Director's office, specimen vault, final chamber (MERIDIAN choice room × 4 variants)
**Gate:** Cycle 3+ AND multiple quest flags
**Priority:** This is the endgame. The Scar rooms can be written as a single focused session.

---

## Track 3 — Systems: Medium Effort

### S-1 — Hidden exits discovery
**Files:** `lib/actions/movement.ts`, `types/game.ts`
**Problem:** `RoomExit.hidden`, `discoverSkill`, `discoverDc`, `discoverMessage` exist in types but movement.ts never surfaces hidden exits.
**Fix:** In `handleLook()` or `handleSearch()`, roll skill check for any exit where `hidden: true`. On success, add exit to player's known exits for that room (stored in room flags). Hidden exits then appear in subsequent `look` output.

### S-2 — Flavor lines and flavor rolls
**Files:** `lib/gameEngine.ts`, `data/rooms/*.ts`
**Problem:** `environmentalRolls.flavorLines` is defined on room type but never rolled or displayed.
**Fix:** In `_applyPopulation()` or `handleLook()`, roll each flavor line against its spawnChance. Append triggered lines to room description. Low-probability lines (0.01) create rare memorable moments.

### S-3 — Personal loss echoes (room-level)
**Files:** `data/rooms/*.ts`, `lib/actions/movement.ts`
**Problem:** `personalLossEchoes` is read in movement.ts but no rooms have this field populated.
**Fix:** Add `personalLossEchoes` to 3–4 rooms per zone (type-gated: `loss_of_child`, `loss_of_partner`, etc.). These fire based on `player.personalLossType` set during character creation.

### S-4 — Infection system
**Files:** `lib/combat.ts`, `lib/actions/combat.ts`, `types/game.ts`
**Design:** Hollow bites have `infectionChance` (0.0–0.3 by type). Player tracks `infectionLevel` (0–100). Every 10 actions while infected, level rises by `pressureLevel`. At 100: death. Antibiotics clear infection. Between 50–99: hallucination flavor lines, stat debuffs, Hollow don't immediately attack.
**Done when:** Bite from Remnant can infect; antibiotics cure; infection visible in StatusBar.

### S-5 — Barter economy
**Files:** `lib/actions/social.ts`, `data/npcs.ts`, `types/game.ts`
**Design:** `trade <npc>` opens barter prompt. NPCs with `tradeInventory` defined will swap items. Currencies: Pennies (9mm ammo), Clears (water), White (salt), Miracles (antibiotics). No universal currency — faction preference matters.
**Done when:** `trade patch` in cr_07 lets you swap ammo for medical supplies.

---

## Track 4 — Endgame (Large Effort, Do After Content Is Complete)

### E-1 — MERIDIAN endings (4 endings)
Requires The Scar rooms complete (C-11). Four choices in the final chamber:
- **Cure:** Destroy CHARON-7 origin data. Hollow slow and begin to degrade over years. Pyrrhic.
- **Weapon:** Weaponize CHARON-7 variant. One faction gains decisive military advantage. Ambiguous.
- **Seal:** Bury it. Nothing changes. The world keeps going. Honest.
- **Throne:** Become the host. The virus completes you. You're the next Hive Mother. Dark.

### E-2 — Faction questlines (2–3 per faction)
Accord, Salters, Drifters, Kindling, Reclaimers each need:
- Entry quest (given by faction leader NPC)
- Mid-game quest (reputation ≥ Recognized)
- Climax quest (unlocks The Scar access via that faction's path)

### E-3 — The Echo mechanic
Previous-cycle Hollow: a Hollow in The Breaks or The Dust that exhibits the player's previous-cycle motor patterns. First encounter triggers a unique recognition moment. Requires tracking `player_echo_seed` in ledger.

### E-4 — The Broadcaster
Radio fragments scattered across zones (The Ember gets the signal strongest, The Stacks can decode it, MERIDIAN is the source). Assembling all fragments reveals the true nature of the facility and unlocks alternate path to The Scar.

---

## Convoy Plan

### Wave 1 — Quick Wins (sequential, ~2 days)
- **W-1** (examine_extra) — solo, no dependencies
- **W-2** (NPC activity/disposition) — solo, no dependencies
- **W-3 + W-4** (depletion + enemy defeat) — sequential (shared room_state)

### Wave 2 — Content Sprint (parallel-safe, can convoy)
All zone files are independent. Safe to spawn parallel workers.

- **Worker A:** C-1 (Covenant +10 rooms)
- **Worker B:** C-8 (The Pens, 14 new rooms) — highest priority, unlocks Act II-III
- **Worker C:** C-11 (The Scar +13 rooms) — highest narrative priority
- **Worker D:** C-3 + C-5 (Ember +6, Dust +6)
- **Worker E:** C-4 + C-6 (Breaks +6, Stacks +4)

Workers F–H can do remaining zones (C-2, C-7, C-9, C-10) in a second content convoy after Wave 2 merges.

**File scope per worker:**
- Worker A: `data/rooms/covenant.ts` only
- Worker B: `data/rooms/the_pens.ts` (new file) + `data/rooms/index.ts`
- Worker C: `data/rooms/the_scar.ts` only
- Worker D: `data/rooms/the_ember.ts`, `data/rooms/the_dust.ts`
- Worker E: `data/rooms/the_breaks.ts`, `data/rooms/the_stacks.ts`

### Wave 3 — Medium Systems (after content lands)
- **W-5** (squirrel)
- **S-1** (hidden exits)
- **S-2** (flavor lines)
- **S-3** (personal loss echoes)

### Wave 4 — Endgame (after medium systems)
- **S-4** (infection system)
- **S-5** (barter economy)
- **E-1** (MERIDIAN endings)
- **E-2** (faction questlines)

---

## Definition of Done

- [ ] **250 rooms:** All 13 zones complete with target room counts
- [ ] **Examine_extra:** `look <keyword>` works in every room with extras defined
- [ ] **NPC behavior live:** Activity pools rolled; dispositions affect dialogue
- [ ] **Depletion wired:** Taken items don't re-spawn immediately; enemies stay dead
- [ ] **Squirrel functional:** Spawns cycle 2+, trust system works, warning mechanic
- [ ] **The Pens built:** All 14 rooms with Red Court horror tone
- [ ] **The Scar complete:** All 28 rooms; MERIDIAN accessible at cycle 3+
- [ ] **Hidden exits:** discoverable via search/skill checks
- [ ] **Infection system:** Bite exposure → degradation → death; antibiotic cure
- [ ] **Barter:** `trade <npc>` functional for at least 5 NPCs
- [ ] **At least 2 faction questlines:** Accord and one other complete end-to-end
- [ ] **MERIDIAN endings:** All 4 endings reachable; Cure/Seal/Weapon/Throne
- [ ] **Tests:** >80% coverage on lib/ files; vitest zero failures
- [ ] **Zero TypeScript errors:** `npx tsc --noEmit` clean at all times

---

## Reference

- Room schema: see `data/rooms/crossroads.ts` (canonical example — best quality)
- Zone targets + lore: `content/the-remnant-MASTER-GAME-BIBLE.md` §1.4
- Room display spec: `content/the-remnant-room-display-spec.md`
- RNG system: `content/the-remnant-rng-system.md`
- Zone A script: `content/zone_a_crossroads.md`
- Zone B script: `content/zone_b_river_road.md`
- TypeScript check: `npx tsc --noEmit`
- Migration: `supabase db push --yes`
- Tests: `pnpm vitest run`
