// ============================================================
// Affix Tables — Convoy 2 H2
// Diablo-style prefix + suffix affix definitions.
// Prefixes prepend to item name; suffixes append ("of the X" pattern).
//
// Notes on statEffect:
//   - Damage and defense bonuses are Item-level fields applied at equip time
//     by the engine consuming affixes. statEffect tracks Stat (vigor/grit/etc.)
//     deltas only. Non-stat affixes (damage/defense) have no statEffect.
//   - traitAdd grants a WeaponTraitId or ArmorTraitId at equip time.
// ============================================================

import type { AffixEntry } from '@/types/game'

// ------------------------------------------------------------
// Prefixes (applied BEFORE item name, e.g. "Keen Knife")
// ------------------------------------------------------------

export const PREFIX_AFFIXES: AffixEntry[] = [
  {
    // +1 damage
    id: 'keen',
    name: 'Keen',
    appliesToType: 'weapon',
  },
  {
    // +1 damage, +0.5 weight (weight tracked by engine, not here)
    id: 'heavy',
    name: 'Heavy',
    appliesToType: 'weapon',
  },
  {
    // +1 reflex
    id: 'swift',
    name: 'Swift',
    appliesToType: 'weapon',
    statEffect: { reflex: 1 },
  },
  {
    // +2 damage, -1 reflex
    id: 'brutal',
    name: 'Brutal',
    appliesToType: 'weapon',
    statEffect: { reflex: -1 },
  },
  {
    // adds `blessed` weapon trait
    id: 'sanctified',
    name: 'Sanctified',
    appliesToType: 'weapon',
    traitAdd: 'blessed',
  },
  {
    // +1 defense
    id: 'reinforced',
    name: 'Reinforced',
    appliesToType: 'armor',
  },
  {
    // +2 defense, +1 weight (weight tracked by engine, not here)
    id: 'layered',
    name: 'Layered',
    appliesToType: 'armor',
  },
  {
    // adds `warded` armor trait
    id: 'warded',
    name: 'Warded',
    appliesToType: 'armor',
    traitAdd: 'warded',
  },
  {
    // adds `insulated` armor trait
    id: 'insulated',
    name: 'Insulated',
    appliesToType: 'armor',
    traitAdd: 'insulated',
  },
  {
    // +2 damage, -1 grit (cursed)
    id: 'bloody',
    name: 'Bloody',
    appliesToType: 'weapon',
    statEffect: { grit: -1 },
  },
  {
    // +1 shadow
    id: "stalker's",
    name: "Stalker's",
    appliesToType: 'weapon',
    statEffect: { shadow: 1 },
  },
  {
    // +1 presence
    id: "field-medic's",
    name: "Field-Medic's",
    appliesToType: 'armor',
    statEffect: { presence: 1 },
  },
]

// ------------------------------------------------------------
// Suffixes (applied AFTER item name — e.g. "Knife of the Brawler")
// ------------------------------------------------------------

export const SUFFIX_AFFIXES: AffixEntry[] = [
  {
    // +1 wits
    id: 'of_the_vigilant',
    name: 'of the Vigilant',
    appliesToType: 'armor',
    statEffect: { wits: 1 },
  },
  {
    // +1 vigor
    id: 'of_the_brawler',
    name: 'of the Brawler',
    appliesToType: 'weapon',
    statEffect: { vigor: 1 },
  },
  {
    // +1 shadow
    id: 'of_the_unseen',
    name: 'of the Unseen',
    appliesToType: 'armor',
    statEffect: { shadow: 1 },
  },
  {
    // adds `quick` weapon trait
    id: 'of_haste',
    name: 'of Haste',
    appliesToType: 'weapon',
    traitAdd: 'quick',
  },
  {
    // adds `silenced` weapon trait
    id: 'of_silence',
    name: 'of Silence',
    appliesToType: 'weapon',
    traitAdd: 'silenced',
  },
  {
    // +1 grit
    id: 'of_endurance',
    name: 'of Endurance',
    appliesToType: 'armor',
    statEffect: { grit: 1 },
  },
  {
    // +1 presence
    id: 'of_the_cure',
    name: 'of the Cure',
    appliesToType: 'armor',
    statEffect: { presence: 1 },
  },
  {
    // adds `precise` weapon trait
    id: 'of_precision',
    name: 'of Precision',
    appliesToType: 'weapon',
    traitAdd: 'precise',
  },
  {
    // +1 wits
    id: 'of_the_keen-eyed',
    name: 'of the Keen-Eyed',
    appliesToType: 'weapon',
    statEffect: { wits: 1 },
  },
  {
    // +2 defense
    id: 'of_warding',
    name: 'of Warding',
    appliesToType: 'armor',
  },
  {
    // +1 grit, +1 vigor
    id: 'of_the_field',
    name: 'of the Field',
    appliesToType: 'armor',
    statEffect: { grit: 1, vigor: 1 },
  },
  {
    // adds `disrupting` weapon trait
    id: 'of_the_pen',
    name: 'of the Pen',
    appliesToType: 'weapon',
    traitAdd: 'disrupting',
  },
]
