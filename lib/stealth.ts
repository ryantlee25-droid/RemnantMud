import { rollCheck, DC } from '@/lib/dice'
import { getClassSkillBonus } from '@/lib/skillBonus'
import type { CheckResult, Player, Room } from '@/types/game'

export interface StealthResult {
  success: boolean
  roll: CheckResult
  message: string
}

export function attemptStealth(player: Player, room: Room): StealthResult {
  // DC based on room difficulty (default 1 → DC.MODERATE = 8)
  // difficulty 1=8, 2=10, 3=12, 4=14, 5=16
  const difficulty = room.difficulty ?? 1
  const dc = DC.MODERATE + ((difficulty - 1) * 2)

  // Shadow stat is the governing stat for stealth; class skill bonus is additive
  const classSkillBonus = getClassSkillBonus(player.characterClass, 'stealth')
  const effectiveStat = player.shadow + classSkillBonus

  const check = rollCheck(effectiveStat, dc)

  if (check.success) {
    return {
      success: true,
      roll: check,
      message: 'You slip through the shadows undetected.',
    }
  } else {
    return {
      success: false,
      roll: check,
      message: 'You are spotted! The element of surprise is lost.',
    }
  }
}

/** Bonus applied to the first attack roll when the player has the initiative from stealth. */
export function getSurpriseRoundBonus(): number {
  return 3  // +3 to first attack roll from ambush
}
