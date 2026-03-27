// ============================================================
// lib/skillBonus.ts — Character class skill bonuses
// Different classes get +2 (or +3/+1) to relevant skills
// when performing skill gate checks.
// ============================================================

import type { CharacterClass, SkillType } from '@/types/game'

const CLASS_SKILL_BONUSES: Record<CharacterClass, Partial<Record<SkillType, number>>> = {
  enforcer:  { brawling: 2, intimidation: 2, vigor: 2 },
  scout:     { tracking: 2, stealth: 2, perception: 2 },
  wraith:    { stealth: 3, daystalking: 2, lockpicking: 2 },
  shepherd:  { field_medicine: 2, negotiation: 2, lore: 2 },
  reclaimer: { mechanics: 2, electronics: 2, scavenging: 2 },
  warden:    { survival: 2, climbing: 2, marksmanship: 2 },
  broker:    { negotiation: 3, intimidation: 2, lore: 1 },
}

export function getClassSkillBonus(characterClass: CharacterClass, skill: SkillType): number {
  return CLASS_SKILL_BONUSES[characterClass]?.[skill] ?? 0
}
