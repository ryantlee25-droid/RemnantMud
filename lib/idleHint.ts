// ============================================================
// idleHint.ts — Idle no-combat narrative hint
//
// Surfaces a one-shot system message after the player takes
// IDLE_HINT_CONFIG.threshold consecutive non-combat actions,
// nudging them toward higher-density zones.
//
// State is stored in localStorage so the hint fires at most
// once per cycle. Caller is responsible for incrementing the
// no-combat action counter and resetting it on combat start.
// ============================================================

export interface IdleHintConfig {
  threshold: number        // # of post-combat actions before surfacing
  cycleKeyPrefix: string   // localStorage key prefix
}

export const IDLE_HINT_CONFIG: IdleHintConfig = {
  threshold: 30,
  cycleKeyPrefix: 'remnant_idle_hint_cycle_',
}

/**
 * Returns true if the idle hint should fire RIGHT NOW.
 *
 * Conditions:
 *  1. noCombatActions >= threshold
 *  2. The cycle-specific localStorage flag has NOT been set yet
 *
 * Caller fires the hint message then immediately calls markIdleHintFired
 * to prevent double-fires.
 */
export function shouldFireIdleHint(
  noCombatActions: number,
  cycle: number,
  storage: Pick<Storage, 'getItem' | 'setItem'>,
): boolean {
  if (noCombatActions < IDLE_HINT_CONFIG.threshold) return false
  const key = IDLE_HINT_CONFIG.cycleKeyPrefix + cycle
  return storage.getItem(key) !== '1'
}

/**
 * Marks the idle hint as fired for this cycle.
 * Subsequent calls to shouldFireIdleHint with the same cycle return false.
 */
export function markIdleHintFired(
  cycle: number,
  storage: Pick<Storage, 'getItem' | 'setItem'>,
): void {
  const key = IDLE_HINT_CONFIG.cycleKeyPrefix + cycle
  storage.setItem(key, '1')
}

/**
 * The hint message shown to the player.
 * References specific high-density zone landmarks so the nudge is actionable.
 */
export const IDLE_HINT_MESSAGE =
  "The roads are quiet. The Hollow gather where blood has been shed — try the river, the breaks, or the old gas station."
