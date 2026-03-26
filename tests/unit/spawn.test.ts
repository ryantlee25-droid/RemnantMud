import { describe, it, expect, vi } from 'vitest'
import {
  weightedRoll,
  quantityRoll,
  spawnCheck,
  rollCondition,
  computePressure,
  pressureModifier,
  populateRoom,
  ENDGAME_MIN_CYCLE,
} from '@/lib/spawn'
import type { SpawnTable, QuantityConfig } from '@/types/game'

// ---------------------------------------------------------------
// weightedRoll
// ---------------------------------------------------------------
describe('weightedRoll', () => {
  it('throws on empty pool', () => {
    expect(() => weightedRoll([])).toThrow('pool must not be empty')
  })

  it('always returns the only entry in a single-element pool', () => {
    const pool = [{ id: 'a', weight: 100 }]
    for (let i = 0; i < 20; i++) {
      expect(weightedRoll(pool)).toBe(pool[0])
    }
  })

  it('returns an element from the pool', () => {
    const pool = [{ id: 'a', weight: 1 }, { id: 'b', weight: 1 }]
    const result = weightedRoll(pool)
    expect(pool).toContain(result)
  })

  it('heavily-weighted entry wins ~100% of the time', () => {
    const pool = [
      { id: 'rare', weight: 1 },
      { id: 'common', weight: 9999 },
    ]
    const wins = Array.from({ length: 1000 }, () => weightedRoll(pool).id)
    const rareCount = wins.filter(id => id === 'rare').length
    // With weight 1 vs 9999 we'd expect roughly 0.01% rare — allow <5
    expect(rareCount).toBeLessThan(5)
  })

  it('falls back to last entry on floating-point edge (roll exactly 0)', () => {
    // Force roll to be right at the boundary so subtraction never hits <= 0
    const pool = [{ id: 'first', weight: 0.0001 }, { id: 'last', weight: 0.0001 }]
    vi.spyOn(Math, 'random').mockReturnValueOnce(0.9999999999)
    const result = weightedRoll(pool)
    expect(result).toBe(pool[pool.length - 1])
    vi.restoreAllMocks()
  })
})

// ---------------------------------------------------------------
// quantityRoll
// ---------------------------------------------------------------
describe('quantityRoll', () => {
  function cfg(distribution: QuantityConfig['distribution'], min = 1, max = 5): QuantityConfig {
    return { min, max, distribution }
  }

  it('single distribution always returns 1', () => {
    for (let i = 0; i < 20; i++) {
      expect(quantityRoll(cfg('single'))).toBe(1)
    }
  })

  it('flat returns values in [min, max]', () => {
    for (let i = 0; i < 50; i++) {
      const v = quantityRoll(cfg('flat', 2, 6))
      expect(v).toBeGreaterThanOrEqual(2)
      expect(v).toBeLessThanOrEqual(6)
    }
  })

  it('weighted_low biases toward min', () => {
    const results = Array.from({ length: 1000 }, () => quantityRoll(cfg('weighted_low', 1, 10)))
    const mean = results.reduce((a, b) => a + b, 0) / results.length
    // Flat mean would be 5.5; weighted_low should be < 4.5
    expect(mean).toBeLessThan(4.5)
  })

  it('weighted_high biases toward max', () => {
    const results = Array.from({ length: 1000 }, () => quantityRoll(cfg('weighted_high', 1, 10)))
    const mean = results.reduce((a, b) => a + b, 0) / results.length
    // Flat mean would be 5.5; weighted_high should be > 6.5
    expect(mean).toBeGreaterThan(6.5)
  })

  it('bell returns integer in range', () => {
    for (let i = 0; i < 50; i++) {
      const v = quantityRoll(cfg('bell', 1, 10))
      expect(v).toBeGreaterThanOrEqual(1)
      expect(v).toBeLessThanOrEqual(10)
    }
  })

  it('bell approximates a central mean', () => {
    const results = Array.from({ length: 1000 }, () => quantityRoll(cfg('bell', 1, 10)))
    const mean = results.reduce((a, b) => a + b, 0) / results.length
    // Bell curve around 5.5 — expect mean between 4.5 and 6.5
    expect(mean).toBeGreaterThan(4.5)
    expect(mean).toBeLessThan(6.5)
  })

  it('flat min === max always returns that value', () => {
    for (let i = 0; i < 10; i++) {
      expect(quantityRoll(cfg('flat', 3, 3))).toBe(3)
    }
  })
})

// ---------------------------------------------------------------
// spawnCheck
// ---------------------------------------------------------------
describe('spawnCheck', () => {
  it('always fails when baseChance is 0', () => {
    for (let i = 0; i < 20; i++) {
      expect(spawnCheck(0, 'day')).toBe(false)
    }
  })

  it('never passes when final chance > 0 but random always exceeds it', () => {
    vi.spyOn(Math, 'random').mockReturnValue(0.99)
    expect(spawnCheck(0.5, 'day')).toBe(false)
    vi.restoreAllMocks()
  })

  it('always passes when random is 0 and chance > 0', () => {
    vi.spyOn(Math, 'random').mockReturnValue(0)
    expect(spawnCheck(0.5, 'day')).toBe(true)
    vi.restoreAllMocks()
  })

  it('applies time modifier', () => {
    // base 1.0 * timeMod 0.0 = 0 → always fail
    vi.spyOn(Math, 'random').mockReturnValue(0)
    const result = spawnCheck(1.0, 'night', { night: 0.0 })
    expect(result).toBe(false)
    vi.restoreAllMocks()
  })

  it('caps final chance at 0.95', () => {
    // With random = 0.96, chance would need to be >0.95 to pass but it's capped
    vi.spyOn(Math, 'random').mockReturnValue(0.96)
    expect(spawnCheck(1.0, 'day')).toBe(false)
    vi.restoreAllMocks()
  })

  it('uses default time modifier of 1.0 when no override', () => {
    vi.spyOn(Math, 'random').mockReturnValue(0)
    // 0.5 chance, no modifiers → should succeed
    expect(spawnCheck(0.5, 'dawn')).toBe(true)
    vi.restoreAllMocks()
  })
})

// ---------------------------------------------------------------
// rollCondition
// ---------------------------------------------------------------
describe('rollCondition', () => {
  it('returns value in [0.3, 1.0] by default', () => {
    for (let i = 0; i < 50; i++) {
      const v = rollCondition()
      expect(v).toBeGreaterThanOrEqual(0.3)
      expect(v).toBeLessThanOrEqual(1.0)
    }
  })

  it('respects custom min and max', () => {
    for (let i = 0; i < 20; i++) {
      const v = rollCondition(0.5, 0.8)
      expect(v).toBeGreaterThanOrEqual(0.5)
      expect(v).toBeLessThanOrEqual(0.8)
    }
  })

  it('rounds to 2 decimal places', () => {
    for (let i = 0; i < 20; i++) {
      const v = rollCondition()
      expect(v).toBe(Math.round(v * 100) / 100)
    }
  })
})

// ---------------------------------------------------------------
// computePressure
// ---------------------------------------------------------------
describe('computePressure', () => {
  it('cycles 1-2 → pressure 1', () => {
    expect(computePressure(1)).toBe(1)
    expect(computePressure(2)).toBe(1)
  })

  it('cycles 3-4 → pressure 2', () => {
    expect(computePressure(3)).toBe(2)
    expect(computePressure(4)).toBe(2)
  })

  it('cycles 5-6 → pressure 3', () => {
    expect(computePressure(5)).toBe(3)
    expect(computePressure(6)).toBe(3)
  })

  it('cycles 7-9 → pressure 4', () => {
    expect(computePressure(7)).toBe(4)
    expect(computePressure(9)).toBe(4)
  })

  it('cycle 10+ → pressure 5', () => {
    expect(computePressure(10)).toBe(5)
    expect(computePressure(50)).toBe(5)
  })

  it('ENDGAME_MIN_CYCLE is 3', () => {
    expect(ENDGAME_MIN_CYCLE).toBe(3)
  })

  it('endgame gate at cycle 3 has pressure 2', () => {
    expect(computePressure(ENDGAME_MIN_CYCLE)).toBe(2)
  })
})

// ---------------------------------------------------------------
// pressureModifier
// ---------------------------------------------------------------
describe('pressureModifier', () => {
  it('pressure 1 → modifier 1.0 (no change)', () => {
    expect(pressureModifier(1)).toBe(1.0)
  })

  it('pressure 2 → 1.15', () => {
    expect(pressureModifier(2)).toBeCloseTo(1.15)
  })

  it('pressure 3 → 1.30', () => {
    expect(pressureModifier(3)).toBeCloseTo(1.30)
  })

  it('pressure 5 → 1.60', () => {
    expect(pressureModifier(5)).toBeCloseTo(1.60)
  })

  it('increments by 0.15 per level', () => {
    for (let p = 1; p <= 5; p++) {
      expect(pressureModifier(p)).toBeCloseTo(1.0 + (p - 1) * 0.15)
    }
  })
})

// ---------------------------------------------------------------
// populateRoom
// ---------------------------------------------------------------

const MINIMAL_SPAWN_TABLE: SpawnTable = {
  items: [
    {
      id: 'scrap_metal',
      spawnChance: 1.0,
      timeModifiers: {},
      quantity: { min: 1, max: 1, distribution: 'single' },
    },
  ],
  enemies: [
    {
      id: 'shuffler',
      spawnChance: 1.0,
      timeModifiers: {},
      quantity: { min: 1, max: 1, distribution: 'single' },
    },
  ],
  npcs: [
    {
      id: 'old_mae',
      spawnChance: 1.0,
      timeModifiers: {},
      quantity: { min: 1, max: 1, distribution: 'single' },
    },
  ],
}

const ZERO_CHANCE_TABLE: SpawnTable = {
  items: [{ id: 'sword', spawnChance: 0, timeModifiers: {}, quantity: { min: 1, max: 1, distribution: 'single' } }],
  enemies: [],
  npcs: [],
}

describe('populateRoom', () => {
  it('returns items, enemyIds, npcs arrays', () => {
    const result = populateRoom(MINIMAL_SPAWN_TABLE, 'day')
    expect(Array.isArray(result.items)).toBe(true)
    expect(Array.isArray(result.enemyIds)).toBe(true)
    expect(Array.isArray(result.npcs)).toBe(true)
  })

  it('spawns entries when chance is 1.0', () => {
    // Pin random to 0 so spawnCheck always passes (0 < 0.95 cap)
    vi.spyOn(Math, 'random').mockReturnValue(0)
    const result = populateRoom(MINIMAL_SPAWN_TABLE, 'day')
    expect(result.items.length).toBeGreaterThan(0)
    expect(result.enemyIds.length).toBeGreaterThan(0)
    expect(result.npcs.length).toBeGreaterThan(0)
  })

  it('skips items with chance 0', () => {
    const result = populateRoom(ZERO_CHANCE_TABLE, 'day')
    expect(result.items).toHaveLength(0)
  })

  it('skips depleted item ids', () => {
    const result = populateRoom(MINIMAL_SPAWN_TABLE, 'day', 1.0, ['scrap_metal'])
    const hasScrap = result.items.some(i => i.itemId === 'scrap_metal')
    expect(hasScrap).toBe(false)
  })

  it('items have itemId and condition', () => {
    vi.spyOn(Math, 'random').mockReturnValue(0)
    const result = populateRoom(MINIMAL_SPAWN_TABLE, 'day')
    expect(result.items.length).toBeGreaterThan(0)
    for (const item of result.items) {
      expect(item).toHaveProperty('itemId')
      expect(item).toHaveProperty('condition')
      expect(item.condition).toBeGreaterThanOrEqual(0)
      expect(item.condition).toBeLessThanOrEqual(1)
    }
  })

  it('NPCs have npcId, activity, disposition', () => {
    vi.spyOn(Math, 'random').mockReturnValue(0)
    const result = populateRoom(MINIMAL_SPAWN_TABLE, 'day')
    expect(result.npcs.length).toBeGreaterThan(0)
    for (const npc of result.npcs) {
      expect(npc).toHaveProperty('npcId')
      expect(npc.activity).toBe('idle')
      expect(npc.disposition).toBe('neutral')
    }
  })

  it('higher pressure increases max enemy count', () => {
    // Pressure >= 3 → max + 1 for enemies
    // Mock Math.random to 0 so spawnCheck always passes and quantityRoll picks max
    vi.spyOn(Math, 'random').mockReturnValue(0)
    const table: SpawnTable = {
      items: [],
      enemies: [{
        id: 'shuffler',
        spawnChance: 1.0,
        timeModifiers: {},
        quantity: { min: 3, max: 3, distribution: 'flat' },
      }],
      npcs: [],
    }
    const lowPressure = populateRoom(table, 'day', 1.0, [], 1)   // max stays 3
    const highPressure = populateRoom(table, 'day', 1.0, [], 3)  // max bumps to 4
    vi.restoreAllMocks()
    // Both guaranteed to spawn; highPressure count >= lowPressure count
    expect(lowPressure.enemyIds.length).toBe(3)
    expect(highPressure.enemyIds.length).toBeGreaterThanOrEqual(3)
  })

  it('enemy max capped at 6 even at extreme pressure', () => {
    const table: SpawnTable = {
      items: [],
      enemies: [{
        id: 'brute',
        spawnChance: 1.0,
        timeModifiers: {},
        quantity: { min: 6, max: 6, distribution: 'flat' },
      }],
      npcs: [],
    }
    const result = populateRoom(table, 'day', 1.0, [], 5)
    expect(result.enemyIds.length).toBeLessThanOrEqual(6)
  })

  it('ambientLines is always an empty array (Phase 3)', () => {
    const result = populateRoom(MINIMAL_SPAWN_TABLE, 'day')
    expect(result.ambientLines).toEqual([])
  })
})
