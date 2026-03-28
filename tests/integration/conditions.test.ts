// ============================================================
// Integration tests for lib/conditions.ts — DOTs, debuffs, status management
// ============================================================

import { describe, it, expect } from 'vitest'
import type { ActiveCondition, ConditionId } from '@/types/traits'
import {
  applyCondition,
  tickConditions,
  cureCondition,
  totalRollPenalty,
} from '@/lib/conditions'

// ------------------------------------------------------------
// Helpers
// ------------------------------------------------------------

function makeCondition(overrides: Partial<ActiveCondition> = {}): ActiveCondition {
  return {
    id: 'bleeding',
    remainingTurns: 2,
    damagePerTurn: 2,
    rollPenalty: 0,
    source: 'test',
    ...overrides,
  }
}

// ------------------------------------------------------------
// applyCondition
// ------------------------------------------------------------

describe('applyCondition', () => {
  it('adds a new condition to the array', () => {
    const conditions: ActiveCondition[] = []
    const result = applyCondition(conditions, 'bleeding', 'Machete')
    expect(result.applied).toBe(true)
    expect(result.conditions).toHaveLength(1)
    expect(result.conditions[0]!.id).toBe('bleeding')
    expect(result.conditions[0]!.source).toBe('Machete')
  })

  it('respects immunity and does not add condition', () => {
    const conditions: ActiveCondition[] = []
    const immunities: ConditionId[] = ['bleeding']
    const result = applyCondition(conditions, 'bleeding', 'Machete', immunities)
    expect(result.applied).toBe(false)
    expect(result.conditions).toHaveLength(0)
    expect(result.message).toContain('immune')
  })

  it('refreshes duration if condition already present', () => {
    const existing = makeCondition({ remainingTurns: 1 })
    const result = applyCondition([existing], 'bleeding', 'Another weapon')
    expect(result.applied).toBe(true)
    expect(result.conditions).toHaveLength(1)
    // Duration should be max of existing (1) and template (2) = 2
    expect(result.conditions[0]!.remainingTurns).toBe(2)
  })
})

// ------------------------------------------------------------
// tickConditions
// ------------------------------------------------------------

describe('tickConditions', () => {
  it('deals DOT damage from active conditions', () => {
    const conditions: ActiveCondition[] = [
      makeCondition({ id: 'bleeding', damagePerTurn: 2, remainingTurns: 2 }),
    ]
    const result = tickConditions(conditions)
    expect(result.damage).toBe(2)
    expect(result.messages).toEqual(
      expect.arrayContaining([expect.stringContaining('bleeding deals 2 damage')])
    )
  })

  it('decrements remaining turns', () => {
    const conditions: ActiveCondition[] = [
      makeCondition({ remainingTurns: 3 }),
    ]
    const result = tickConditions(conditions)
    expect(result.remaining).toHaveLength(1)
    expect(result.remaining[0]!.remainingTurns).toBe(2)
  })

  it('removes expired conditions (remainingTurns reaches 0)', () => {
    const conditions: ActiveCondition[] = [
      makeCondition({ remainingTurns: 1 }),
    ]
    const result = tickConditions(conditions)
    expect(result.remaining).toHaveLength(0)
    expect(result.messages).toEqual(
      expect.arrayContaining([expect.stringContaining('wears off')])
    )
  })

  it('accumulates roll penalties from frightened', () => {
    const conditions: ActiveCondition[] = [
      makeCondition({ id: 'frightened', rollPenalty: -2, damagePerTurn: 0, remainingTurns: 2 }),
    ]
    const result = tickConditions(conditions)
    expect(result.rollPenalty).toBe(-2)
  })

  it('hemorrhagic shock adds +1 damage when bleeding and burning both active', () => {
    const conditions: ActiveCondition[] = [
      makeCondition({ id: 'bleeding', damagePerTurn: 2, remainingTurns: 2 }),
      makeCondition({ id: 'burning', damagePerTurn: 3, remainingTurns: 1 }),
    ]
    const result = tickConditions(conditions)
    // bleeding (2) + burning (3) + hemorrhagic shock (1) = 6
    expect(result.damage).toBe(6)
    expect(result.messages).toEqual(
      expect.arrayContaining([expect.stringContaining('Hemorrhagic shock')])
    )
  })

  it('no hemorrhagic shock when only bleeding (no burning)', () => {
    const conditions: ActiveCondition[] = [
      makeCondition({ id: 'bleeding', damagePerTurn: 2, remainingTurns: 2 }),
    ]
    const result = tickConditions(conditions)
    expect(result.damage).toBe(2)
    expect(result.messages).not.toEqual(
      expect.arrayContaining([expect.stringContaining('Hemorrhagic shock')])
    )
  })
})

// ------------------------------------------------------------
// cureCondition
// ------------------------------------------------------------

describe('cureCondition', () => {
  it('removes a specific condition by ID', () => {
    const conditions: ActiveCondition[] = [
      makeCondition({ id: 'bleeding' }),
      makeCondition({ id: 'poisoned', damagePerTurn: 1, remainingTurns: 3, rollPenalty: -1 }),
    ]
    const result = cureCondition(conditions, 'bleeding')
    expect(result.cured).toBe(true)
    expect(result.conditions).toHaveLength(1)
    expect(result.conditions[0]!.id).toBe('poisoned')
  })

  it('returns cured=false if condition not present', () => {
    const conditions: ActiveCondition[] = []
    const result = cureCondition(conditions, 'burning')
    expect(result.cured).toBe(false)
    expect(result.message).toContain('Not affected')
  })
})

// ------------------------------------------------------------
// totalRollPenalty
// ------------------------------------------------------------

describe('totalRollPenalty', () => {
  it('sums all roll penalties across active conditions', () => {
    const conditions: ActiveCondition[] = [
      makeCondition({ id: 'frightened', rollPenalty: -2, damagePerTurn: 0, remainingTurns: 2 }),
      makeCondition({ id: 'poisoned', rollPenalty: -1, damagePerTurn: 1, remainingTurns: 3 }),
    ]
    expect(totalRollPenalty(conditions)).toBe(-3)
  })

  it('returns 0 when no conditions have penalties', () => {
    const conditions: ActiveCondition[] = [
      makeCondition({ id: 'bleeding', rollPenalty: 0 }),
    ]
    expect(totalRollPenalty(conditions)).toBe(0)
  })

  it('returns 0 for empty array', () => {
    expect(totalRollPenalty([])).toBe(0)
  })
})
