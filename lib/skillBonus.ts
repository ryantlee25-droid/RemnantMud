// ============================================================
// lib/skillBonus.ts — Character class skill bonuses
// Different classes get +2 (or +3/+1) to relevant skills
// when performing skill gate checks.
// ============================================================

import type { CharacterClass, Player, SkillType } from '@/types/game'

const CLASS_SKILL_BONUSES: Record<CharacterClass, Partial<Record<SkillType, number>>> = {
  enforcer:  { brawling: 2, intimidation: 2, vigor: 2, endurance: 1 },
  scout:     { tracking: 2, stealth: 2, perception: 2 },
  wraith:    { stealth: 3, daystalking: 2, lockpicking: 2 },
  shepherd:  { field_medicine: 2, negotiation: 2, lore: 2, composure: 1 },
  reclaimer: { mechanics: 2, electronics: 2, scavenging: 2 },
  warden:    { survival: 2, climbing: 2, marksmanship: 2, resilience: 2 },
  broker:    { negotiation: 3, intimidation: 2, lore: 1 },
}

export function getClassSkillBonus(characterClass: CharacterClass, skill: SkillType): number {
  return CLASS_SKILL_BONUSES[characterClass]?.[skill] ?? 0
}

// ------------------------------------------------------------
// Skill → governing stat mapping (shared across all action files)
// ------------------------------------------------------------

const SKILL_TO_STAT: Record<string, keyof Player> = {
  // Vigor — raw physicality
  survival: 'vigor',
  brawling: 'vigor',
  climbing: 'vigor',
  vigor: 'vigor',
  // Grit — endurance, willpower, steady hands under pressure
  endurance: 'grit',
  resilience: 'grit',
  composure: 'grit',
  field_medicine: 'grit',
  // Reflex — speed, dexterity, quick reactions
  bladework: 'reflex',
  marksmanship: 'reflex',
  mechanics: 'reflex',
  perception: 'reflex',
  // Wits — knowledge, analysis, awareness
  lore: 'wits',
  electronics: 'wits',
  tracking: 'wits',
  blood_sense: 'wits',
  // Presence — social force, authority, persuasion
  negotiation: 'presence',
  intimidation: 'presence',
  mesmerize: 'presence',
  // Shadow — stealth, subtlety, operating unseen
  stealth: 'shadow',
  lockpicking: 'shadow',
  daystalking: 'shadow',
  scavenging: 'shadow',
}

/**
 * Return the governing stat name for a skill (e.g. 'perception' → 'reflex').
 */
export function getStatNameForSkill(skill: string): string | null {
  return (SKILL_TO_STAT[skill] as string) ?? null
}

/**
 * Return the player's stat value for a skill, including class bonus.
 */
export function getStatForSkill(skill: string, player: Player | null): number | null {
  if (!player) return null
  const statKey = SKILL_TO_STAT[skill]
  if (!statKey) return null
  const base = player[statKey]
  if (typeof base !== 'number') return null
  return base + getClassSkillBonus(player.characterClass, skill as SkillType)
}
