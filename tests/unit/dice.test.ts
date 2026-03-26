import { describe, it, expect, vi } from 'vitest'
import { roll1d10, statModifier, rollCheck, rollDamage, DC } from '@/lib/dice'

describe('statModifier', () => {
  it('returns 0 for stat 5', () => expect(statModifier(5)).toBe(0))
  it('returns +1 for stat 6', () => expect(statModifier(6)).toBe(1))
  it('returns +2 for stat 7', () => expect(statModifier(7)).toBe(2))
  it('returns -1 for stat 4', () => expect(statModifier(4)).toBe(-1))
  it('returns -2 for stat 3', () => expect(statModifier(3)).toBe(-2))
  it('returns -4 for stat 1', () => expect(statModifier(1)).toBe(-4))
  it('returns +5 for stat 10', () => expect(statModifier(10)).toBe(5))
})

describe('roll1d10', () => {
  it('returns integer in [1, 10]', () => {
    for (let i = 0; i < 50; i++) {
      const r = roll1d10()
      expect(r).toBeGreaterThanOrEqual(1)
      expect(r).toBeLessThanOrEqual(10)
      expect(Number.isInteger(r)).toBe(true)
    }
  })

  it('returns 1 when Math.random() returns 0', () => {
    vi.spyOn(Math, 'random').mockReturnValueOnce(0)
    expect(roll1d10()).toBe(1)
    vi.restoreAllMocks()
  })

  it('returns 10 when Math.random() returns 0.999', () => {
    vi.spyOn(Math, 'random').mockReturnValueOnce(0.999)
    expect(roll1d10()).toBe(10)
    vi.restoreAllMocks()
  })
})

describe('rollDamage', () => {
  it('returns value in range inclusive', () => {
    for (let i = 0; i < 50; i++) {
      const r = rollDamage([2, 5])
      expect(r).toBeGreaterThanOrEqual(2)
      expect(r).toBeLessThanOrEqual(5)
    }
  })

  it('handles single-value range', () => {
    expect(rollDamage([3, 3])).toBe(3)
  })

  it('returns min when random is 0', () => {
    vi.spyOn(Math, 'random').mockReturnValueOnce(0)
    expect(rollDamage([2, 8])).toBe(2)
    vi.restoreAllMocks()
  })

  it('returns max when random is near 1', () => {
    vi.spyOn(Math, 'random').mockReturnValueOnce(0.9999)
    expect(rollDamage([2, 8])).toBe(8)
    vi.restoreAllMocks()
  })
})

describe('rollCheck', () => {
  it('returns structured CheckResult', () => {
    const r = rollCheck(7, DC.MODERATE)
    expect(r).toHaveProperty('roll')
    expect(r).toHaveProperty('modifier')
    expect(r).toHaveProperty('total')
    expect(r).toHaveProperty('dc')
    expect(r).toHaveProperty('success')
    expect(r).toHaveProperty('critical')
    expect(r).toHaveProperty('fumble')
    expect(r.dc).toBe(DC.MODERATE)
  })

  it('natural 10 is always a critical success regardless of dc', () => {
    vi.spyOn(Math, 'random').mockReturnValueOnce(0.9)  // roll = 10
    const r = rollCheck(1, DC.NEARLY_IMPOSSIBLE)
    expect(r.roll).toBe(10)
    expect(r.critical).toBe(true)
    expect(r.success).toBe(true)
    vi.restoreAllMocks()
  })

  it('natural 1 is always a fumble regardless of stat', () => {
    vi.spyOn(Math, 'random').mockReturnValueOnce(0)  // roll = 1
    const r = rollCheck(10, DC.TRIVIAL)
    expect(r.roll).toBe(1)
    expect(r.fumble).toBe(true)
    expect(r.success).toBe(false)
    vi.restoreAllMocks()
  })

  it('succeeds when total >= dc and not fumble', () => {
    // roll = 6, stat = 7 (mod +2), total = 8, dc = 8
    vi.spyOn(Math, 'random').mockReturnValueOnce(0.5) // roll = 6
    const r = rollCheck(7, 8)
    expect(r.roll).toBe(6)
    expect(r.modifier).toBe(2)
    expect(r.total).toBe(8)
    expect(r.success).toBe(true)
    vi.restoreAllMocks()
  })

  it('fails when total < dc', () => {
    // roll = 2, stat = 5 (mod 0), total = 2, dc = 8
    vi.spyOn(Math, 'random').mockReturnValueOnce(0.1) // roll = 2
    const r = rollCheck(5, 8)
    expect(r.success).toBe(false)
    vi.restoreAllMocks()
  })

  it('DC constants are correct', () => {
    expect(DC.TRIVIAL).toBe(3)
    expect(DC.EASY).toBe(5)
    expect(DC.MODERATE).toBe(8)
    expect(DC.HARD).toBe(11)
    expect(DC.VERY_HARD).toBe(14)
    expect(DC.NEARLY_IMPOSSIBLE).toBe(17)
  })
})
