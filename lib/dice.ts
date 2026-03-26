import type { CheckResult } from '@/types/game'

// ------------------------------------------------------------
// Difficulty Classes
// ------------------------------------------------------------

export const DC = {
  TRIVIAL: 3,
  EASY: 5,
  MODERATE: 8,
  HARD: 11,
  VERY_HARD: 14,
  NEARLY_IMPOSSIBLE: 17,
} as const

// ------------------------------------------------------------
// Core dice functions
// ------------------------------------------------------------

/** Roll a single d10 (1–10). */
export function roll1d10(): number {
  return Math.floor(Math.random() * 10) + 1
}

/**
 * Get the modifier for a stat value.
 * Modifier = stat - 5 (stat 7 → +2, stat 3 → −2, stat 5 → 0).
 */
export function statModifier(stat: number): number {
  return stat - 5
}

/**
 * Roll a check: 1d10 + statModifier(stat) vs dc.
 * Natural 10 is a critical (always succeeds).
 * Natural 1 is a fumble (always fails).
 */
export function rollCheck(stat: number, dc: number): CheckResult {
  const roll = roll1d10()
  const modifier = statModifier(stat)
  const total = roll + modifier
  const critical = roll === 10
  const fumble = roll === 1

  let success: boolean
  if (critical) {
    success = true
  } else if (fumble) {
    success = false
  } else {
    success = total >= dc
  }

  return { roll, modifier, total, dc, success, critical, fumble }
}

/**
 * Roll damage in a [min, max] range (inclusive on both ends).
 */
export function rollDamage(range: [number, number]): number {
  const [min, max] = range
  return Math.floor(Math.random() * (max - min + 1)) + min
}
