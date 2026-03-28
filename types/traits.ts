// ============================================================
// MUD Game — Weapon Traits, Armor Traits, and Conditions
// The Remnant — Enhanced Combat System
// ============================================================

// ------------------------------------------------------------
// Trait & Condition IDs
// ------------------------------------------------------------

/** Weapon trait IDs */
export type WeaponTraitId =
  | 'keen' | 'heavy' | 'vicious' | 'scorching' | 'draining'
  | 'quick' | 'silenced' | 'precise' | 'blessed' | 'disrupting'

/** Armor trait IDs */
export type ArmorTraitId = 'fortified' | 'reactive' | 'insulated' | 'warded'

/** Status condition IDs */
export type ConditionId = 'bleeding' | 'burning' | 'stunned' | 'frightened' | 'poisoned' | 'weakened'

// ------------------------------------------------------------
// Trait Interfaces
// ------------------------------------------------------------

export interface WeaponTrait {
  id: WeaponTraitId
  name: string
  description: string
  scalesStat?: string
}

export interface ArmorTrait {
  id: ArmorTraitId
  name: string
  description: string
}

// ------------------------------------------------------------
// Condition & Resistance Interfaces
// ------------------------------------------------------------

export interface ActiveCondition {
  id: ConditionId
  remainingTurns: number
  damagePerTurn: number
  rollPenalty: number
  source: string
}

export interface EnemyResistance {
  weaknesses: Partial<Record<WeaponTraitId, { bonusDamage: number; description: string }>>
  resistances: Partial<Record<WeaponTraitId, { reduction: number; description: string }>>
  conditionImmunities: ConditionId[]
}

// ------------------------------------------------------------
// Weapon Trait Definitions
// ------------------------------------------------------------

export const WEAPON_TRAITS: Record<WeaponTraitId, WeaponTrait> = {
  keen: {
    id: 'keen',
    name: 'Keen',
    description: '+15% critical hit chance. Honed to a razor edge.',
    scalesStat: 'reflex',
  },
  heavy: {
    id: 'heavy',
    name: 'Heavy',
    description: '+2 flat damage, -1 initiative. Built for force, not finesse.',
    scalesStat: 'vigor',
  },
  vicious: {
    id: 'vicious',
    name: 'Vicious',
    description: 'On hit, applies Bleeding (2 dmg/turn for 2 turns). Serrated or barbed.',
    scalesStat: undefined,
  },
  scorching: {
    id: 'scorching',
    name: 'Scorching',
    description: '30% chance to apply Burning (3 dmg/turn for 1 turn). Incendiary-tipped.',
    scalesStat: undefined,
  },
  draining: {
    id: 'draining',
    name: 'Draining',
    description: 'Heal 1 HP on hit (2 on crit). Something in the blade drinks deep.',
    scalesStat: 'presence',
  },
  quick: {
    id: 'quick',
    name: 'Quick',
    description: '+2 initiative, can double-strike at half damage. Light and fast.',
    scalesStat: 'reflex',
  },
  silenced: {
    id: 'silenced',
    name: 'Silenced',
    description: 'Kills generate no noise encounters. Muffled, wrapped, or suppressed.',
    scalesStat: undefined,
  },
  precise: {
    id: 'precise',
    name: 'Precise',
    description: 'Ignore 50% of enemy defense for attack roll. Surgical accuracy.',
    scalesStat: 'wits',
  },
  blessed: {
    id: 'blessed',
    name: 'Blessed',
    description: '+3 damage vs Sanguine, +1 vs Hollow. Presence 7+ adds +1. Consecrated steel.',
    scalesStat: 'presence',
  },
  disrupting: {
    id: 'disrupting',
    name: 'Disrupting',
    description: 'On kill, prevents enemy summons and buffs. Severing strike.',
    scalesStat: 'wits',
  },
}

// ------------------------------------------------------------
// Armor Trait Definitions
// ------------------------------------------------------------

export const ARMOR_TRAITS: Record<ArmorTraitId, ArmorTrait> = {
  fortified: {
    id: 'fortified',
    name: 'Fortified',
    description: 'Flat damage reduction on incoming hits. Reinforced plating.',
  },
  reactive: {
    id: 'reactive',
    name: 'Reactive',
    description: 'Chance to negate incoming Bleeding or Poisoned conditions. Sealed weave.',
  },
  insulated: {
    id: 'insulated',
    name: 'Insulated',
    description: 'Reduces or negates Burning condition. Heat-resistant lining.',
  },
  warded: {
    id: 'warded',
    name: 'Warded',
    description: 'Reduces Frightened duration. Etched with old symbols.',
  },
}
