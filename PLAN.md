# Plan: Convoy 2 — Gear Overhaul
_Created: 2026-04-24 | Type: New Feature_

---

## 1. Situation

### Convoy 1 retrospective

Convoy 1 shipped the combat spine (spawn density, wanderers, faction reactivity partial,
death prose variants, world events). Two Howlers stalled: H3 (7 new enemies x 11-zone
integration in one scope) and H7 (6 NPCs x 5,700-line dialogue tree in one scope). The
lesson is not that the work was wrong — it is that scopes touching many files with no
frozen contract collapse into research paralysis. Howlers read forever and write nothing.
The fix for Convoy 2 is enforced narrow ownership: every Howler owns 2 files or fewer
and is given an explicit frozen contract for any shared type it depends on.

### What Convoy 2 delivers

Convoy 2 completes PRD Pillars C (loot economy) and D (gear and class differentiation,
partial), plus the two deferred Convoy 1 pieces (H3 enemies, H7 faction dialogue). When
it lands, the game will have: 5-tier rarity labels on all items, a light random affix
system (1 optional roll from a curated pool on Uncommon+ drops), per-quantity loot entry
support, a statBonus field that actually applies on equip (it is defined in types/game.ts
line 399 but only applied for consumables today), 4-slot armor (head/chest/legs/feet),
an initiative field on weapons, resistance fields on armor, 7 new enemies, zone
integration for those enemies, 60+ new gear items, boss-unique drops, 3+ gear sets with
2/4-piece bonuses, gear lore on all Rare+ items, boss intros for 8-12 bosses, and faction
reactivity dialogue split across two focused Howlers.

### Locked decisions

- OQ2 — Random affixes: YES, light only. Uncommon and Rare items roll 1 optional affix
  from a curated pool of 20-30 entries (not a full prefix/suffix generator). Legendary
  items are hand-authored and never roll affixes — their identity is fixed.
- OQ4 — Durability: OPTIONAL, default OFF. If H15 ships, durability decays on hit and
  is repaired via crafting or hub NPCs. The player can ignore it entirely. It does not
  block any other Howler.

---

## 2. Architecture Decisions

### Tier scheme

Items carry `tier?: 1 | 2 | 3 | 4 | 5` today (cosmetic). Convoy 2 adds a parallel
`rarity?: 'common' | 'uncommon' | 'rare' | 'epic' | 'legendary'` field to Item in
types/game.ts. Tier (1-5) remains the numeric progression label. Rarity gates affix rolls
and display color. Color mapping via lib/ansiColors.ts:
- common: no prefix (default white)
- uncommon: green prefix
- rare: blue prefix
- epic: purple prefix
- legendary: gold prefix + [Legendary] suffix

Backfilling strategy for H1: map existing 182 items to rarity by heuristic bands (weapon
damage 4 or below, or armor defense 1 or below = common; dmg 5-6 or def 2 = uncommon;
dmg 7-9 or def 3-4 = rare; dmg 10-11 or def 5 = epic; named/boss-unique = legendary).
Backfill is data-only, no runtime logic change.

### Affix algorithm

New file lib/affixes.ts. Two exports: AFFIX_POOL (array of 20-30 curated entries, each
with id, name, description, statEffect: Partial<Record<Stat, number>>, traitAdd optional
WeaponTraitId or ArmorTraitId, appliesToType 'weapon' | 'armor' | 'any') and
rollAffix(item: Item): Item. Rolling logic: if item.rarity is 'uncommon' or 'rare', roll
once with 60% chance of an affix; 'epic' always gets one affix; 'legendary' never rolls.
rollAffix is called in the loot resolver lib/loot.ts on drop, not at item definition
time. Items in data/items.ts are never pre-affixed.

Note: lib/affixes.ts is new shared infrastructure — changes affect all loot paths.

### Armor slot expansion strategy

InventoryItem currently uses equipped: boolean with no slot discriminator. The equipItem()
function in lib/inventory.ts already unequips same-type items. Slot expansion adds
armorSlot?: 'head' | 'chest' | 'legs' | 'feet' to the Item interface. equipItem() is
updated to unequip only the item with the same armorSlot (not all armor). Defense
calculation in lib/actions/combat.ts (lines 249-250) currently reads one equipped armor.
After H6 it must sum defense across all equipped armor pieces.

H4 (stat bonus on equip) and H6 (armor slot expansion) both modify lib/actions/items.ts.
Resolution: H6 merges first; H4 is dropped after H6 lands.

No DB migration required for the slot expansion: equipped: boolean on player_inventory
still works — multiple armor rows can be equipped simultaneously. The migration file
20260327000004_fix_inventory_unique.sql likely constrains on (player_id, item_id), not
on (player_id, equipped) — verify before H6 merges.

### AoE primitive shape

New AoEDamage interface in types/game.ts: { radius: 'adjacent' | 'room', damage:
[number, number], condition?: ConditionId }. Added as optional field aoe? on Enemy.
Frenzy sets aoe: { radius: 'adjacent', damage: [1, 6], condition: 'burning' } and fires
on death via a new onDeath? hook field on Enemy. Weapons can declare aoeTrait hints but
weapon AoE resolution is Convoy 3 (class abilities). H5 only wires Frenzy's
death-explosion using the existing additionalEnemies path in CombatState.

Note: types/game.ts is shared infrastructure — H1, H3, H4, H5, H6, H10 all read or
extend it. Freeze the Wave 1 type contract before Howlers are dropped.

---

## 3. File Ownership Matrix

| Howler | Creates | Modifies |
|--------|---------|----------|
| H1 — Tier/rarity labels | — | types/game.ts (rarity on Item), data/items.ts (backfill 182 items) |
| H2 — Affix system | lib/affixes.ts | types/game.ts (AffixEntry interface), lib/loot.ts (rollAffix on drop) |
| H3 — LootEntry count | — | types/game.ts (LootEntry.count field), data/enemies.ts (update loot tables), lib/loot.ts (count resolver) |
| H4 — Stat bonus on equip | — | lib/actions/items.ts (equip/unequip applies statBonus) |
| H5 — AoE primitive | — | types/game.ts (AoEDamage, onDeath on Enemy), data/enemies.ts (Frenzy + Apex Screamer), lib/actions/combat.ts (onDeath handler) |
| H6 — Armor slot expansion | supabase/migrations/20260424000002_armor_slots.sql | types/game.ts (armorSlot on Item), lib/inventory.ts (slot-aware equip logic), lib/actions/combat.ts (sum multi-slot defense), lib/actions/items.ts (equip display) |
| H7 — 7 new enemies | — | data/enemies.ts (7 new entries, data only) |
| H8 — Zone integration | — | data/rooms/river_road.ts, data/rooms/salt_creek.ts, data/rooms/covenant.ts, data/rooms/the_ember.ts, data/rooms/the_breaks.ts, data/rooms/the_dust.ts, data/rooms/the_stacks.ts |
| H9 — 60+ new gear items | — | data/items.ts (60+ new entries) |
| H10 — Boss drops + sets | data/sets.ts | data/enemies.ts (boss loot tables), lib/loot.ts (set bonus detection), types/game.ts (setId on Item) |
| H11 — Gear lore | — | data/items.ts (loreText on all Rare+ items) |
| H12 — Boss intros | — | data/enemies.ts (bossIntro + combatIntro fields on 8-12 enemies) |
| H13 — Dialogue Part A | — | data/dialogueTrees.ts (Cross + Patch reactivity nodes) |
| H14 — Dialogue Part B | — | data/dialogueTrees.ts (Lev + Howard + Sparks reactivity nodes) |
| H15 — Durability (optional) | — | types/game.ts (durability on InventoryItem), lib/actions/combat.ts (decay), data/recipes.ts (repair recipes) |

No file overlap between any two simultaneous Howlers within a wave. types/game.ts and
data/enemies.ts are touched across waves — managed by the wave sequencing below.

Note: lib/loot.ts is touched by H2 (create), H3 (extend), and H10 (extend across waves).
Wave sequencing handles this — each Howler works on a distinct section of the file.

Note: data/dialogueTrees.ts is touched by H13 and H14 — they are sequenced, not parallel.

---

## 4. Per-Howler Specs

### Type Freeze Pre-Pass (manual or single focused Howler, ~1 hour before Wave 1)

Before dropping any Wave 1 Howler, add all of the following to types/game.ts in one
commit. This eliminates Wave 1 type conflicts entirely.

Fields to add:
- Item.rarity?: 'common' | 'uncommon' | 'rare' | 'epic' | 'legendary'
- Item.armorSlot?: 'head' | 'chest' | 'legs' | 'feet'
- Item.setId?: string
- LootEntry.count?: [number, number]
- AoEDamage interface: { radius: 'adjacent' | 'room'; damage: [number, number]; condition?: ConditionId }
- Enemy.onDeath?: { aoe?: AoEDamage }
- Enemy.bossIntro?: string
- Enemy.combatIntro?: string
- AffixEntry interface: { id: string; name: string; appliesToType: 'weapon' | 'armor' | 'any'; statEffect?: Partial<Record<Stat, number>>; traitAdd?: WeaponTraitId | ArmorTraitId }

This is a ~40-line addition to types/game.ts with zero logic. Safe to do manually.

---

### Wave 1 — Foundation (parallel after type freeze)

**H1 — Item Tier / Rarity Labels**

Backfill all 182 existing items in data/items.ts with a rarity field using the damage/
defense band heuristic. Bands: weapons dmg 4 or below or armor def 1 or below = common;
dmg 5-6 or def 2 = uncommon; dmg 7-9 or def 3-4 = rare; dmg 10-11 or def 5 = epic;
silver_knife and any meridian-tier gear = legendary. Add color rendering in the item
display path (examine output, loot summary) via lib/ansiColors.ts — add color constants
for 5 tiers if not present.

- Files: data/items.ts (182 items backfilled), lib/ansiColors.ts (verify/add tier colors)
- Tests: each rarity tier has >=1 item; color constants exist for all 5 tiers; examine
  output on a rare item shows the blue prefix
- Depends on: type freeze pre-pass
- Effort: S
- Pre-mortem: Will stall if the Howler reads each item individually rather than doing a
  bulk text replacement by damage band. Provide the bands table explicitly. Do not make
  it derive them from research.

---

**H2 — Affix System**

Create lib/affixes.ts with AFFIX_POOL and rollAffix(item: Item): Item. Create or extend
lib/loot.ts to call rollAffix on any drop where item.rarity is uncommon or higher. Affix
is applied as a runtime mutation of the dropped item copy — not to the source record in
data/items.ts.

AFFIX POOL SEED (use exactly these 10; add 10-20 more in the same format):
- { id: 'sharp',    appliesToType: 'weapon', statEffect: { reflex: 1 } }
- { id: 'brutal',   appliesToType: 'weapon', statEffect: { vigor: 1 } }
- { id: 'fleet',    appliesToType: 'any',    statEffect: { reflex: 1 } }
- { id: 'sturdy',   appliesToType: 'armor',  statEffect: { grit: 1 } }
- { id: 'warded',   appliesToType: 'armor',  traitAdd: 'warded' }
- { id: 'reactive', appliesToType: 'armor',  traitAdd: 'reactive' }
- { id: 'keen',     appliesToType: 'weapon', traitAdd: 'keen' }
- { id: 'draining', appliesToType: 'weapon', traitAdd: 'draining' }
- { id: 'silent',   appliesToType: 'weapon', traitAdd: 'silenced' }
- { id: 'blessed',  appliesToType: 'weapon', traitAdd: 'blessed' }

Rolling rule: common = no affix; uncommon/rare = 60% chance of one affix; epic = always
one affix; legendary = never (hand-authored identity preserved).

- Files: lib/affixes.ts (create), lib/loot.ts (create or extend — check first)
- Tests: rollAffix on a common item returns item unchanged; rollAffix on epic always
  returns item with an affix; legendary items not modified
- Depends on: type freeze pre-pass (AffixEntry type), H1 merged (rarity field populated)
- Effort: S
- Pre-mortem: Will stall if the Howler over-engineers this into prefix+suffix tables or
  compound affixes. One pool, one roll, one field. No compound affixes this convoy.

---

**H3 — LootEntry Count Field**

LootEntry in types/game.ts has { itemId: string; chance: number }. The type freeze adds
count?: [number, number]. This Howler wires the count resolver in lib/loot.ts and updates
the most imbalanced enemy loot tables in data/enemies.ts.

Specific loot table fixes required:
- All 16 enemies: add ammo_22lr drop with count [2,8] at chance 0.40 if not already
  present (the audit found no currency in any loot table)
- brute: reduce scrap_metal chance from 0.60 to 0.25
- screamer: add bandages 0.20 (currently only 2 drops — underfilled vs standard 3-5)
- elder_sanguine: add ammo_22lr count [5,15] at chance 0.60
- hive_mother variants: add ammo_22lr count [3,10] at chance 0.50

- Files: data/enemies.ts (loot table updates), lib/loot.ts (count resolver)
- Tests: loot resolver with count [2,8] returns quantity between 2 and 8 inclusive;
  count absent returns quantity 1; elder_sanguine loot table includes ammo_22lr
- Depends on: type freeze pre-pass
- Effort: S
- Pre-mortem: Will stall if the Howler reads room files looking for loot tables. Enemy
  loot tables are in data/enemies.ts only. Room item spawns are separate and out of scope.

---

**H5 — AoE Damage Primitive**

The type freeze adds AoEDamage interface and Enemy.onDeath. This Howler adds two new
enemy entries to data/enemies.ts and wires the death handler in lib/actions/combat.ts.

Frenzy stats: id='frenzy', name='Frenzy', HP 8, maxHp 8, attack 3, defense 6,
damage [6,12], xp 45, critChance 0.10,
onDeath: { aoe: { radius: 'adjacent', damage: [1,6], condition: 'burning' } },
loot: [{ itemId: 'scrap_metal', chance: 0.30 }, { itemId: 'ammo_22lr', chance: 0.40,
count: [1,3] }]

Apex Screamer stats: id='apex_screamer', name='Apex Screamer', HP 8, maxHp 8, attack 2,
defense 7, damage [4,10], xp 40, critChance 0.15,
loot: [{ itemId: 'ammo_22lr', chance: 0.50, count: [2,5] }]

Combat.ts change: in handleEnemyDefeated(), after enemy death confirmed, check
enemy.onDeath?.aoe — if present, compute damage [min,max] roll, apply to player HP,
output a message. Also apply to each enemy in activeCombat.additionalEnemies if any.

- Files: data/enemies.ts (2 new entries), lib/actions/combat.ts (onDeath handler)
- Tests: Frenzy death triggers AoE damage to player (HP decreases + message logged);
  standard enemy death does not trigger AoE
- Depends on: type freeze pre-pass
- Effort: S
- Pre-mortem: Will stall if the Howler tries to implement room-wide AoE, weapon AoE, or
  a new system for multi-enemy fights. Scope: one conditional in handleEnemyDefeated,
  damage applied to player only (and additionalEnemies already in combatState).

---

**H6 — Armor Slot Expansion**

armorSlot field added to Item in type freeze. This Howler updates the business logic.

lib/inventory.ts changes:
- equipItem(): when equipping armor, unequip only the item with the same armorSlot
  (not all armor). Items without armorSlot field use the old single-slot behavior.
- getEquipped(playerId, 'armor') either becomes getEquippedArmor returning an array,
  or a new function is added. Update all callers.

lib/actions/combat.ts changes:
- Lines 249-250: replace single equippedArmor lookup with all-armor sum.
  armorDefense = sum of defense across all equipped armor InventoryItems.

lib/actions/items.ts changes:
- Equip confirmation message: include slot name if armorSlot is set
  ("You equip the Salter Ironwork Helm [head slot].")

Migration: create supabase/migrations/20260424000002_armor_slots.sql. If no new columns
are needed on players table (slot state lives in player_inventory rows), the migration
body can be a comment-only placeholder confirming the decision. Write it anyway to keep
the migration log intact per project rules.

- Files: lib/inventory.ts, lib/actions/combat.ts, lib/actions/items.ts,
  supabase/migrations/20260424000002_armor_slots.sql
- Tests: equip head + chest simultaneously — both show equipped=true; equip second head
  piece — first head unequips; defense sum in combat = head.defense + chest.defense;
  existing equip tests updated (they will break and must be fixed)
- Depends on: type freeze pre-pass
- Effort: M (3 files + test updates for changed equip invariant)
- Pre-mortem: Existing integration tests assert "equipping armor unequips existing armor"
  — this is now true only within a slot, not globally. Run pnpm test immediately after
  changes. If >5 failures, escalate rather than patching blindly.

**H4 — Stat Bonus on Equip** (drops after H6 merges — same file conflict)

statBonus exists on Item (types/game.ts line 399) and is only applied for consumable use
(lib/actions/items.ts lines 298-300), not on equip/unequip. Wire the equip path.

In handleEquip() (lib/actions/items.ts ~line 220): after calling equipItem(), read the
new item's statBonus and apply deltas to player.[stat] in-memory. In handleUnequip():
reverse the deltas. The stat mutation is in-memory only — the normal save cycle persists
it. No new DB columns needed: statBonus applies to the Player record's existing stat
fields (vigor, grit, reflex, etc.) which are already saved.

Equip cycle test is mandatory: equip item with statBonus: { vigor: 2 }, verify vigor +2,
unequip, verify vigor returns to base, equip again, verify vigor +2 (no accumulation).

- Files: lib/actions/items.ts
- Tests: equip/unequip cycle does not accumulate stats; combat reads updated stat after
  equip (engine.getState().player already carries the stat — no combat.ts change needed)
- Depends on: H6 merged
- Effort: S
- Pre-mortem: Will stall if the Howler tries to add statBonus persistence to the DB schema
  or refactor the equip system. In-memory application only. If the equip system was
  substantially rewritten by H6, H4 must read H6's output before starting.

---

### Wave 2 — Content (after Wave 1 merges to feature branch)

**H7 — 7 New Enemies (data/enemies.ts only)**

Add exactly these 7 entries to data/enemies.ts. No zone integration (H8). No type
changes (Wave 1 handles those). Data rows only.

1. drifter_road_warden: HP 28, attack 4, defense 12, damage [4,9], xp 130,
   flavorText: ["Warden raises a hand — not in greeting."],
   loot: [ammo_22lr 0.60 count[3,8], combat_knife 0.15, scrap_vest 0.12]

2. salter_scout: HP 32, attack 4, defense 13, damage [4,8], xp 140,
   flavorText: ["The Scout moves in short deliberate bursts."],
   loot: [ammo_9mm 0.50 count[2,5], bandages 0.25, hatchet 0.10]

3. accord_peacekeeper: HP 26, attack 3, defense 12, damage [3,7], xp 110,
   flavorText: ["The Peacekeeper's eyes are tired. The baton is not."],
   loot: [ammo_22lr 0.55 count[4,10], field_dressing 0.20]

4. kindling_zealot: HP 32, attack 4, defense 11, damage [4,9], xp 120,
   flavorText: ["The Zealot does not speak. Fire is the only sermon."],
   resistanceProfile: { weaknesses: {}, resistances: {}, conditionImmunities: ['burning'] },
   loot: [ammo_22lr 0.50 count[2,6], scrap_metal 0.30]

5. lucid_thrall: HP 36, attack 3, defense 11, damage [3,8], xp 160,
   flavorText: ["The Thrall's movements are elegant. Wrong, but elegant."],
   loot: [sanguine_blood_vial 0.45, ammo_22lr 0.35 count[1,4]]

6. plague_carrier: HP 14, attack 2, defense 8, damage [2,5], xp 55,
   flavorText: ["It moves like something leaking."],
   onDeath: { spawnEnemy: { id: 'plague_carrier', maxDepth: 2 } },
   loot: [gauze 0.30, ammo_22lr 0.40 count[1,3]]

7. hive_worker: HP 6, attack 1, defense 6, damage [1,2], xp 20,
   quantity spawns in groups via room threat pool (weight them at 3x in H8),
   loot: [ammo_22lr 0.35 count[1,2]]

Note: plague_carrier's onDeath spawn requires extending the onDeath type to include
spawnEnemy?: { id: string; maxDepth: number }. Add this to types/game.ts before H7
drops — either in the type freeze pre-pass or as a Wave 2 pre-pass.

- Files: data/enemies.ts
- Tests: each enemy has id, name, hp, loot with >=1 entry; plague_carrier onDeath.spawnEnemy
  is present; kindling_zealot is immune to burning condition
- Depends on: Wave 1 merged (AoEDamage types, onDeath type must exist for plague_carrier)
- Effort: S
- Pre-mortem: Will stall if the Howler cross-references zone files or ability systems.
  This Howler writes data rows only.

---

**H8 — Zone Integration of New Enemies**

Inject the 9 new enemies (7 from H7 + Frenzy + Apex Screamer from H5) into threatPool
arrays across exactly 7 zone files. Do not change baseChance or existing enemy weights —
only add new entries. Verify total per-room probability does not exceed 0.95.

Exact zone assignments:
- data/rooms/river_road.ts: drifter_road_warden weight 0.15, frenzy weight 0.10
- data/rooms/salt_creek.ts: salter_scout weight 0.15, plague_carrier weight 0.08
- data/rooms/covenant.ts: accord_peacekeeper weight 0.10 in rooms with difficulty >= 2 only
- data/rooms/the_ember.ts: kindling_zealot weight 0.12, apex_screamer weight 0.10
- data/rooms/the_breaks.ts: frenzy weight 0.15
- data/rooms/the_dust.ts: frenzy weight 0.15
- data/rooms/the_stacks.ts: hive_worker weight 0.10, plague_carrier weight 0.08

- Files: 7 zone files in data/rooms/
- Tests: each modified zone has >=3 distinct enemy types in threat pools; no room's total
  spawn probability exceeds 0.95
- Depends on: H7 merged (enemy IDs must exist)
- Effort: S
- Pre-mortem: Will stall if the Howler reads all 13 zone files. Scope is exactly the 7
  listed files with the exact weights above. Grep for 'threatPool' in each file, append.

---

**H9 — 60+ New Gear Items**

Add 60+ new item entries to data/items.ts. All items must use rarity (H1 field) and
armorSlot if armor (H6 field). Rare+ items must have at least one statBonus field.

Target mix:
- 18 new weapons (3 per tier; each favors one stat via statBonus)
- 28 new armor pieces (7 per slot — head/chest/legs/feet — across 4-5 tiers)
- 8 faction-flavored Rare/Epic items with faction names in their names
- 6 boss-unique stubs (items with names like 'elder_sanguine_cloak' for H10 to assign)

Naming convention for faction gear: [Faction Adjective] [Item Type].
Examples: "Accord-Issue Vest", "Salter Ironwork Helm", "Red Court Bloodcoat".

Stat bonus alignment by class:
- vigor-boosting items: great weapons, heavy chestpieces (Enforcer/Warden)
- reflex-boosting items: light weapons, light helms, leg pieces (Scout/Wraith)
- shadow-boosting items: dark blades, hooded helms (Wraith/Broker)
- grit-boosting items: reinforced chests, heavy boots (Warden/Shepherd)
- presence-boosting items: Accord/Covenant gear, cloaks (Shepherd/Broker)
- wits-boosting items: precision weapons, MERIDIAN-tech (Reclaimer/Scout)

Stat band reference (tier = rarity map):
- tier 1 / common: dmg 3-4 or def 1
- tier 2 / uncommon: dmg 5-6 or def 2
- tier 3 / rare: dmg 7-9 or def 3-4
- tier 4 / epic: dmg 10-12 or def 5
- tier 5 / legendary: dmg 13-16 or def 6

Lore stubs: all Rare+ items get loreText: '' (empty string). H11 fills them.

- Files: data/items.ts
- Tests: total ITEMS count >= 240; every armor entry has armorSlot set; every Rare+ entry
  has statBonus with >=1 field; no duplicate IDs
- Depends on: H1 merged (rarity field), H6 merged (armorSlot field)
- Effort: M (high volume creative data authoring)
- Pre-mortem: Will stall if the Howler tries to balance every stat meticulously or waits
  on class build path research. Rough bands are sufficient — balance is Convoy 3. Risk:
  creative fatigue at item 30. Batch by slot type: all helms first, then all chests.

---

**H10 — Boss-Unique Drops + Set Bonuses**

Part A — Boss loot tables:
Add >=1 boss-unique drop to every enemy with xp >= 200 in data/enemies.ts. Use the 6
boss-unique item stubs created by H9. Each unique item must have a chance <= 0.15 (rare
but not impossible). The item must not appear in any other enemy's loot table.

Boss-tier enemies (xp >= 200): elder_sanguine (400xp), elder_sanguine_deep (600xp),
hive_mother (250xp), hive_mother_the_deep (350xp), red_court_enforcer (200xp),
meridian_ancient_hollow (180xp — borderline, include), plus lucid_thrall (160xp) and
salter_scout (140xp) from H7 (include the two highest new enemies).

Part B — Gear sets:
Create data/sets.ts. Minimum 3 sets. Each set has 4 piece IDs (referencing items from
H9), a 2-piece bonus (stat delta only), and a 4-piece bonus (stat delta + description).

Required sets:
1. salvagers_pact: pieces from H9 reclaimer-aligned items; 2pc: wits+1;
   4pc: wits+2 + reflex+1 + description "You see the weak point in everything."
2. accord_inquisitor: pieces from H9 presence/grit items; 2pc: presence+1;
   4pc: presence+2 + grit+1 + description "The Accord does not forget its own."
3. hollow_marked: pieces from H9 shadow items; 2pc: shadow+1;
   4pc: shadow+2 + vigor+1 + description "You move like something that was never there."

Add set bonus detection to lib/loot.ts or a new lib/sets.ts: on equip event, count
equipped items with matching setId; apply bonus to player stats at 2-piece and 4-piece
thresholds. Track via activeBuffs (existing GameState field) to keep reversal clean.

- Files: data/sets.ts (create), data/enemies.ts (boss loot additions), lib/loot.ts or
  lib/sets.ts (set detection), types/game.ts (setId already in type freeze)
- Tests: equipping 2 pieces of salvagers_pact applies wits+1; equipping all 4 applies
  4-piece bonus; unequipping 1 piece reverts to 2-piece bonus; boss enemy loot tables
  contain at least 1 item ID not found in any non-boss enemy table
- Depends on: H9 merged (set piece item IDs must exist)
- Effort: M
- Pre-mortem: Will stall if the Howler designs more than 3 sets or tries to make set
  bonuses interact with class abilities (Convoy 3). Bonuses are stat deltas only here.

---

### Wave 3 — Narrative + Carry-overs (after Wave 2 merges)

**H11 — Gear Lore**

Fill loreText on every item with rarity 'rare', 'epic', or 'legendary' in data/items.ts.
Target >=50 items. Each entry: 2-4 sentences, post-apocalyptic register, specific and
grounded (not fantasy-generic).

VOICE TEMPLATE — use this register exactly:
"The blade was Salter-issue once. The factory stamp is still readable under the rust:
MERIDIAN SUBSIDIARY / LOT 7-B. Whoever owned it last didn't bring it back."

BANNED WORDS: magical, enchanted, mystical, ancient power, imbued. If you write any of
these, delete the sentence and rewrite.

Batch order for voice consistency:
1. Drifter/Accord gear: grounded, pragmatic, community-built
2. Red Court/Salter gear: brutal, efficient, marked with authority
3. MERIDIAN/Pre-Collapse gear: clinical, cold, institutional
4. Kindling/Lucid gear: fervent, ritualistic, transformed

Do not split this Howler. Voice consistency > parallelism.

- Files: data/items.ts
- Tests: all items with rarity 'rare' or higher have loreText.length > 0;
  no loreText contains the strings "magical" or "enchanted"
- Depends on: H9 merged (new items must exist), H1 merged (rarity field set)
- Effort: M (serial creative bottleneck)
- Pre-mortem: Will stall if lore is written alphabetically rather than by faction batch
  (incoherent voice across adjacent items). Use the batch order above.

---

**H12 — Boss Intros**

Add bossIntro?: string and combatIntro?: string to Enemy (done in type freeze pre-pass).
Populate for exactly 8 required bosses, 4 bonus if time allows.

Required 8:
1. elder_sanguine
2. elder_sanguine_deep
3. hive_mother_the_deep
4. meridian_automated_turret
5. meridian_ancient_hollow
6. frenzy (boss-tier variant introduced by H5 as wave boss in the_breaks)
7. drifter_road_warden (boss-tier variant)
8. lucid_thrall

Wire bossIntro display: in the room-entry path (lib/actions/movement.ts or equivalent),
after loading the room, check if any static enemy in room.enemies is a boss-tier enemy
(xp >= 150) with a bossIntro field — if so, output the intro once (track via a per-room
flag or check if the player has previously entered the room). Wire combatIntro: output
once at the start of round 1 if not already shown, via the combat state.

INTRO TEMPLATE:
bossIntro: 3-6 line room-entry description. Present tense. Specific physical detail first,
then dread. End on a line that makes the player feel seen.
combatIntro: 1 sentence. Short. The moment the fight begins.

- Files: data/enemies.ts (8-12 entries with intro fields)
- Tests: all 8 required enemies have non-empty bossIntro and combatIntro; display path
  outputs bossIntro on first room entry
- Depends on: Wave 2 merged (enemy entries must exist)
- Effort: S-M
- Pre-mortem: Will stall if display wiring becomes a large refactor. The wiring is one
  conditional per display path — if it requires building new infrastructure, scope is
  wrong. Write the conditional directly and move on.

---

**H13 — Faction Dialogue Part A: Cross + Patch**

Add 3 reactivity dialogue nodes per NPC to data/dialogueTrees.ts, gated on hollowKills
tracking (via questFlags set by the combat handler when kill thresholds are crossed).

Before writing, grep for npcId: 'cross' and npcId: 'patch' to find their tree roots.
Do not read the full file — find those two subtrees only.

Three tiers per NPC (set questFlags: hollow_kills_tier_1/2/3 in combat handler or derive
from player.hollowKills directly if DialogueBranch supports numeric checks):

Cross tier gates:
- hollow_kills_tier_1 (>= 5 kills): "You've been busy outside the wire."
- hollow_kills_tier_2 (>= 20 kills): "The Hollow count on River Road dropped.
  I noticed. Was that you?"
- hollow_kills_tier_3 (>= 50 kills): "Stop. I'm not concerned about the Hollow.
  I'm concerned about what it takes to kill that many and feel nothing."

Patch tier gates:
- hollow_kills_tier_1: "Another one. Sit down before you fall down."
- hollow_kills_tier_2: "I've stopped asking what happened. The body tells me."
- hollow_kills_tier_3: "I patched the last one who fought like you.
  She didn't come back from her next run. I'm not saying you will too. I'm saying I
  remember their names."

For each tier, create a DialogueNode with id pattern 'cross_hollow_t1' etc., branching
from the NPC's start node with requiresFlag pointing to the appropriate flag key.

- Files: data/dialogueTrees.ts (Cross and Patch subtrees only)
- Tests: Cross dialogue shows tier-1 node when questFlags.hollow_kills_tier_1 is truthy;
  base node shows when no tier flags are set; Patch follows same pattern
- Depends on: Wave 2 complete; verify hollowKills is incremented in combat handler
- Effort: S
- Pre-mortem: Will stall if the Howler reads the entire 5,700-line file. Grep for the
  two NPC IDs and read only those subtrees.

---

**H14 — Faction Dialogue Part B: Lev + Howard + Sparks**

Same structure as H13 for three more NPCs. Drop after H13 merges to avoid same-file
conflict.

Grep first: npcId: 'lev', npcId: 'howard', npcId: 'sparks'.

Lev tier voice (data-driven, analytical):
- tier_1: "Cycle N, [K] Hollow eliminated. You're trending above the mortality curve."
- tier_2: "You're becoming a data point. I mean that as a compliment."
- tier_3: "The data is clear. You're going to die in the field. I'd rather it happened
  later. So would you, presumably."

Howard tier voice (practical, unsentimental):
- tier_1: "Good. Every one you put down is one less I need a plan for."
- tier_2: "You keep this up, the Hollow pressure on Duskhollow drops. That matters."
- tier_3: "Don't come to me expecting gratitude. This is what the job looks like."

Sparks tier voice (morally curious, unsettling):
- tier_1: "You smell like you've been busy. How many?"
- tier_2: "Do you enjoy it? You can tell me. I won't judge. I am genuinely asking."
- tier_3: "Most people who kill at your rate either stop entirely or can't stop at all.
  Which one are you?"

- Files: data/dialogueTrees.ts (Lev, Howard, Sparks subtrees only)
- Tests: each NPC shows tier-appropriate node; no corruption of H13's Cross/Patch nodes
- Depends on: H13 merged
- Effort: S
- Pre-mortem: Same as H13 — file size trap. Grep for three NPC IDs only.

---

### Optional (ship if time allows)

**H15 — Optional Durability (default OFF)**

Add durability?: number (0.0-1.0) to InventoryItem in types/game.ts. Decay 0.05 per hit
received. At 0.0 apply -2 to item's effective damage or defense. Add 2 repair recipes to
data/recipes.ts. Gate entire system behind player.questFlags.durability_enabled (default
unset = system inactive).

Before writing a line of logic: verify whether player_inventory has per-row DB columns
or is jsonb. If per-row columns are used, a migration for durability column is required
before any code change. Check supabase/migrations/ for player_inventory schema.

- Files: types/game.ts, lib/actions/combat.ts, data/recipes.ts
- Depends on: all Wave 2 content merged
- Effort: M (migration risk elevates from S)
- Pre-mortem: DB schema question is the blocker. Resolve it before writing logic.

---

## 5. Wave Sequencing

```
TYPE FREEZE PRE-PASS (manual, ~1 hour)
  One commit to types/game.ts adding all 9 type fields listed above.
  No logic. Safe to do by hand.
  |
  v
WAVE 1 (parallel — 5 Howlers after type freeze)
  H1 (rarity backfill)
  H2 (affix system)        -- H2 needs H1 merged to read rarity on items
  H3 (loot count)
  H5 (AoE primitive)
  H6 (armor slot expansion)
  -- H4 (stat bonus on equip) drops AFTER H6 merges --
  |
  v (merge all Wave 1 to feature branch, run pnpm test)
WAVE 2 (partial parallel)
  H7 (7 new enemies, data only)    -- then H8 drops after H7 merges
  H9 (60+ gear items)              -- parallel with H7/H8
  -- H10 drops after H9 merges --
  |
  v (merge all Wave 2 to feature branch, run pnpm test)
WAVE 3 (H11 + H12 parallel; H13 then H14 sequential)
  H11 (gear lore)      -- parallel with H12
  H12 (boss intros)    -- parallel with H11
  H13 (Cross + Patch)  -- then H14 after H13 merges
  H14 (Lev + Howard + Sparks)
  |
  v
White + Gray quality gate on full convoy diff
  |
  v
Optional: H15 (durability)
```

Wave 1 note: H2 nominally depends on H1 (needs rarity set) but H2's rollAffix function
can be written against the type definition alone and tested with mock rarity values. Drop
H2 in parallel with H1; merge order matters less than coding order here.

---

## 6. Type Dependencies

| Type / Interface | File | Used by |
|---|---|---|
| Item.rarity | types/game.ts | H1, H2, H9, H11 |
| Item.armorSlot | types/game.ts | H6, H9 |
| Item.setId | types/game.ts | H10 |
| LootEntry.count | types/game.ts | H3, H7 |
| AoEDamage / Enemy.onDeath | types/game.ts | H5, H7 |
| Enemy.bossIntro / Enemy.combatIntro | types/game.ts | H12 |
| AffixEntry | types/game.ts | H2 |
| GearSet (new interface) | data/sets.ts or types/game.ts | H10 |

All must be in place before the respective Howler is dropped. Type freeze pre-pass handles this.

---

## 7. Acceptance Criteria (Convoy Level)

- [ ] All 182 existing items have rarity field set
- [ ] rollAffix() callable; uncommon+ drops have >=60% chance of one affix; legendary unchanged
- [ ] LootEntry.count rolls correctly; ammo_22lr drops from >=10 enemy types
- [ ] Equipping item with statBonus: { vigor: 1 } raises player.vigor by 1; unequip reverses it
- [ ] 4 armor slots equip independently; defense in combat = sum of all equipped armor defense
- [ ] Frenzy death triggers AoE damage message to player
- [ ] All 7 new enemies exist in data/enemies.ts with stat blocks and loot tables
- [ ] All 7 new enemies appear in at least one zone threat pool
- [ ] data/items.ts has >=240 total items
- [ ] Every new armor item has armorSlot set
- [ ] Every boss-tier enemy (xp >= 200) has >=1 loot entry not shared with any non-boss enemy
- [ ] >=3 gear sets exist; 2-piece and 4-piece bonuses apply and revert correctly
- [ ] Every item with rarity 'rare' or higher has loreText.length > 0
- [ ] >=8 boss enemies have bossIntro and combatIntro populated
- [ ] Cross and Patch each have 3 hollowKills-gated dialogue nodes
- [ ] Lev, Howard, and Sparks each have 3 hollowKills-gated dialogue nodes
- [ ] pnpm test passes (all existing tests plus new tests for changed logic)
- [ ] npx tsc --noEmit reports 0 errors

---

## 8. Risks

| # | Risk | Probability | Impact | Mitigation |
|---|---|---|---|---|
| R1 | Another Howler stalls in research | High | High | Hard rule: every Howler owns <=2 files. Explicit "do NOT read X" note in each spec. Gold enforces at drop. If a Howler requests files outside its matrix, stop and re-scope. |
| R2 | types/game.ts merge conflicts from Wave 1 parallel edits | High | Medium | Resolved by type freeze pre-pass. All type changes land in one commit before any Howler is dropped. |
| R3 | H6 armor slot expansion breaks existing equip tests | Medium | Medium | Explicit in H6 pre-mortem. Run pnpm test after H6. Fix failures before merging. Expected scope. |
| R4 | H9 items have inconsistent stat bands — same tier, wildly different power | Medium | Medium | Stat band table provided in H9 spec. Balance tuning is Convoy 3 — rough bands are sufficient here. |
| R5 | statBonus accumulates on repeated equip/unequip cycles | Medium | High | H4 spec requires an equip-cycle test: equip, unequip, re-equip — stat must return to base, not accumulate. This test is mandatory before H4 merges. |
| R6 | Set bonuses double-apply with H4 statBonus on same equip event | Medium | Medium | H10 tracks set bonuses via activeBuffs (existing GameState field), not direct stat mutation. Same reversal pattern as H4. Keep the two systems separate. |
| R7 | data/dialogueTrees.ts corruption from H13/H14 if NPCs share node ID namespace | Medium | High | H13 uses node IDs prefixed 'cross_' and 'patch_'. H14 uses 'lev_', 'howard_', 'sparks_'. No overlap. H14 depends on H13 so no simultaneous writes. |
| R8 | player_inventory unique constraint prevents multiple equipped armor rows | Low | High | Verify 20260327000004_fix_inventory_unique.sql constrains on (player_id, item_id) not on equipped flag. If equipped is constrained to one row per player, migration needed before H6 ships. |

---

## 9. Out of Scope (Deferred to Convoy 3 / 4)

Convoy 3:
- Class-specific combat verbs (D3)
- 4 active abilities + 1 passive per class (D2)
- New status conditions: Marked, Silenced, Bound, Exposed (D6)
- 18 weapon traits / 10 armor traits expansion (D7)
- Build path documentation and class-gated gear sets (D9)
- Loadout quick-equip system (D10)
- Auto-loot UX parser verbs (C9)
- Round summary line, status icon prefix, combat log toggle (F1/F2/F3)
- Zone-signature mini-bosses as full encounters (B4)
- Resistance reveal on hit messaging (B9/F6)

Convoy 4:
- 4 ending-specific final bosses (B7, G1-G4)
- Echo boss — Revenant's prior self as an enemy (B8)
- Currency sink services (C8) beyond basic stubs
- Durability as a mandatory mechanic (C7 non-optional)
- Junk-salvage-to-materials crafting pipeline beyond H3 stubs
- Boss phase mechanics / enraged states (B5)

Indefinitely deferred:
- Socket / rune system (flagged in battle-mud-design.md as post-gear-count-expansion)
- Rebirth tree / permanent upgrade system
- New character classes (confirmed non-goal in PRD Section 3)

---

## Open Questions

- [ ] Does lib/loot.ts already exist from Convoy 1? H2 and H3 both reference it. Default
  if unresolved: H2 creates it if absent, H3 extends it. Verify at dispatch time before
  dropping Wave 1. Blocks: nothing (pre-check at dispatch).

- [ ] Does data/dialogueTrees.ts use a single export with all NPC trees as keys, or
  separate exports per NPC? H13 and H14 need to know the file structure before writing.
  Default if unresolved: grep for npcId: 'cross' in the file before starting.
  Blocks: H13, H14.

- [ ] Is player.hollowKills being incremented in the combat handler after Convoy 1?
  H13 and H14 depend on this field being live. Verify in lib/actions/combat.ts before
  dropping H13. Default if not wired: H13 adds the increment as part of its scope.
  Blocks: H13 (need to verify before drop, not before Wave 3).

---

## Definition of Done

- [ ] Code written and self-reviewed by each Howler
- [ ] Tests written for all changed logic (equip invariants, affix rolling, defense sum,
  AoE damage, loot count, set bonus application, dialogue tier gates)
- [ ] pnpm test passes with all existing and new tests
- [ ] npx tsc --noEmit reports 0 errors
- [ ] Supabase migration file created for any new player-level save fields (even if
  migration body is structural confirmation only)
- [ ] White + Gray quality gate passed on full convoy diff post-merge
- [ ] PR opened with coverage gaps noted in description
