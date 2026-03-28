// ============================================================
// Condition Engine — DOTs, debuffs, and status management
// ============================================================

import type { ActiveCondition, ConditionId } from '@/types/traits'
import { rollCheck } from '@/lib/dice'

// ------------------------------------------------------------
// Default condition templates
// ------------------------------------------------------------

const CONDITION_DEFAULTS: Record<ConditionId, Omit<ActiveCondition, 'source'>> = {
  bleeding: { id: 'bleeding', remainingTurns: 2, damagePerTurn: 2, rollPenalty: 0 },
  burning: { id: 'burning', remainingTurns: 1, damagePerTurn: 3, rollPenalty: 0 },
  stunned: { id: 'stunned', remainingTurns: 1, damagePerTurn: 0, rollPenalty: 0 },
  frightened: { id: 'frightened', remainingTurns: 2, damagePerTurn: 0, rollPenalty: -2 },
  poisoned: { id: 'poisoned', remainingTurns: 3, damagePerTurn: 1, rollPenalty: -1 },
  weakened: { id: 'weakened', remainingTurns: 2, damagePerTurn: 0, rollPenalty: 0 },
}

// ------------------------------------------------------------
// Apply a condition
// ------------------------------------------------------------

/**
 * Apply a condition to a target's condition array.
 * Respects immunities and refreshes duration if already present.
 */
export function applyCondition(
  conditions: ActiveCondition[],
  conditionId: ConditionId,
  source: string,
  immunities?: ConditionId[],
): { conditions: ActiveCondition[]; applied: boolean; message: string } {
  // Check immunity
  if (immunities && immunities.includes(conditionId)) {
    return {
      conditions,
      applied: false,
      message: `${source} tries to inflict ${conditionId}, but the target is immune.`,
    }
  }

  const template = CONDITION_DEFAULTS[conditionId]
  const newCondition: ActiveCondition = { ...template, source }

  // If already present, refresh duration (don't stack)
  const existing = conditions.find(c => c.id === conditionId)
  if (existing) {
    const updated = conditions.map(c =>
      c.id === conditionId
        ? { ...c, remainingTurns: Math.max(c.remainingTurns, newCondition.remainingTurns), source }
        : c,
    )
    return {
      conditions: updated,
      applied: true,
      message: `${conditionId} refreshed by ${source}.`,
    }
  }

  return {
    conditions: [...conditions, newCondition],
    applied: true,
    message: `${conditionId} applied by ${source}.`,
  }
}

// ------------------------------------------------------------
// Tick conditions at start of turn
// ------------------------------------------------------------

/**
 * Process all active conditions at the start of a turn.
 * Returns total damage dealt, cumulative roll penalty, messages,
 * and the remaining (decremented) condition list.
 */
export function tickConditions(
  conditions: ActiveCondition[],
): { damage: number; rollPenalty: number; messages: string[]; remaining: ActiveCondition[] } {
  let damage = 0
  let rollPenalty = 0
  const messages: string[] = []
  const remaining: ActiveCondition[] = []

  // Detect hemorrhagic shock: Bleeding + Burning both active = +1 extra dmg
  const hasBleeding = conditions.some(c => c.id === 'bleeding')
  const hasBurning = conditions.some(c => c.id === 'burning')
  const hemorrhagicShock = hasBleeding && hasBurning

  for (const condition of conditions) {
    // Stunned: skip turn entirely (caller handles action prevention)
    if (condition.id === 'stunned') {
      messages.push('Stunned — cannot act this turn.')
    }

    // Weakened: deal half damage (caller handles the multiplier)
    if (condition.id === 'weakened') {
      messages.push('Weakened — damage output halved.')
    }

    // Frightened: grit DC 10 each turn to end early
    if (condition.id === 'frightened') {
      // The grit check happens externally with the player's grit stat;
      // here we just note the penalty. Early cure handled via cureCondition.
      messages.push(`Frightened — ${condition.rollPenalty} to all rolls.`)
    }

    // Apply DOT damage
    if (condition.damagePerTurn > 0) {
      damage += condition.damagePerTurn
      messages.push(`${condition.id} deals ${condition.damagePerTurn} damage.`)
    }

    // Accumulate roll penalty
    rollPenalty += condition.rollPenalty

    // Decrement turns
    const next: ActiveCondition = { ...condition, remainingTurns: condition.remainingTurns - 1 }
    if (next.remainingTurns > 0) {
      remaining.push(next)
    } else {
      messages.push(`${condition.id} wears off.`)
    }
  }

  // Hemorrhagic shock bonus
  if (hemorrhagicShock) {
    damage += 1
    messages.push('Hemorrhagic shock — bleeding and burning compound for +1 damage.')
  }

  return { damage, rollPenalty, messages, remaining }
}

// ------------------------------------------------------------
// Cure a specific condition
// ------------------------------------------------------------

/**
 * Remove a specific condition by ID.
 */
export function cureCondition(
  conditions: ActiveCondition[],
  conditionId: ConditionId,
): { conditions: ActiveCondition[]; cured: boolean; message: string } {
  const had = conditions.some(c => c.id === conditionId)
  if (!had) {
    return { conditions, cured: false, message: `Not affected by ${conditionId}.` }
  }
  return {
    conditions: conditions.filter(c => c.id !== conditionId),
    cured: true,
    message: `${conditionId} cured.`,
  }
}

// ------------------------------------------------------------
// Total roll penalty from all active conditions
// ------------------------------------------------------------

/**
 * Sum all roll penalties across active conditions.
 * Returns a non-positive number (penalties are negative).
 */
export function totalRollPenalty(conditions: ActiveCondition[]): number {
  return conditions.reduce((sum, c) => sum + c.rollPenalty, 0)
}

// ------------------------------------------------------------
// Frightened early-end check (grit DC 10)
// ------------------------------------------------------------

/**
 * Attempt a grit check to shake off Frightened early.
 * Should be called at the start of each turn while frightened.
 * Returns the updated condition list and whether the check succeeded.
 */
export function tryShakeFrightened(
  conditions: ActiveCondition[],
  gritStat: number,
): { conditions: ActiveCondition[]; shaken: boolean; message: string } {
  const frightened = conditions.find(c => c.id === 'frightened')
  if (!frightened) {
    return { conditions, shaken: false, message: '' }
  }

  const check = rollCheck(gritStat, 10)
  if (check.success) {
    return {
      conditions: conditions.filter(c => c.id !== 'frightened'),
      shaken: true,
      message: 'You steel yourself — the fear breaks.',
    }
  }

  return {
    conditions,
    shaken: false,
    message: 'The fear holds. You push through it.',
  }
}
