import { describe, it, expect, vi, afterEach } from 'vitest'
import { rollLoot } from '@/lib/combat'
import type { Enemy } from '@/types/game'

// Minimal enemy factory — only fields rollLoot touches
function makeEnemy(loot: Enemy['loot']): Enemy {
  return {
    id: 'test_enemy',
    name: 'Test Enemy',
    description: 'A test enemy.',
    hp: 10,
    maxHp: 10,
    attack: 1,
    defense: 5,
    damage: [1, 2],
    xp: 10,
    loot,
  }
}

afterEach(() => {
  vi.restoreAllMocks()
})

// ------------------------------------------------------------------
// 1. Default behavior — count absent yields exactly 1 item per drop
// ------------------------------------------------------------------
describe('rollLoot — default count', () => {
  it('yields exactly 1 of an item when count is absent', () => {
    // Force the chance roll to always pass (return 0, below any chance)
    vi.spyOn(Math, 'random').mockReturnValue(0)
    const enemy = makeEnemy([{ itemId: 'scrap_metal', chance: 1.0 }])
    const result = rollLoot(enemy)
    expect(result).toHaveLength(1)
    expect(result[0]).toBe('scrap_metal')
  })
})

// ------------------------------------------------------------------
// 2. Fixed count — min === max yields exactly that many
// ------------------------------------------------------------------
describe('rollLoot — fixed count [3, 3]', () => {
  it('yields exactly min when min === max', () => {
    vi.spyOn(Math, 'random').mockReturnValue(0)
    const enemy = makeEnemy([{ itemId: 'bandages', chance: 1.0, count: [3, 3] }])
    const result = rollLoot(enemy)
    expect(result).toHaveLength(3)
    result.forEach(id => expect(id).toBe('bandages'))
  })
})

// ------------------------------------------------------------------
// 3. Randomized range — all 100 trials land within [min, max]
// ------------------------------------------------------------------
describe('rollLoot — randomized range [2, 5]', () => {
  it('yields a value in [min, max] across 100 trials', () => {
    const enemy = makeEnemy([{ itemId: 'ammo_22lr', chance: 1.0, count: [2, 5] }])

    for (let trial = 0; trial < 100; trial++) {
      vi.restoreAllMocks()
      const result = rollLoot(enemy)
      expect(result.length).toBeGreaterThanOrEqual(2)
      expect(result.length).toBeLessThanOrEqual(5)
      result.forEach(id => expect(id).toBe('ammo_22lr'))
    }
  })
})

// ------------------------------------------------------------------
// 4. Chance still gates the entry — failed roll yields nothing
// ------------------------------------------------------------------
describe('rollLoot — chance gating', () => {
  it('yields nothing when rng exceeds chance, regardless of count', () => {
    // random() returns 0.9 — above any reasonable chance threshold
    vi.spyOn(Math, 'random').mockReturnValue(0.9)
    const enemy = makeEnemy([{ itemId: 'ammo_22lr', chance: 0.5, count: [5, 10] }])
    const result = rollLoot(enemy)
    expect(result).toHaveLength(0)
  })

  it('yields items when rng is exactly below chance boundary', () => {
    // First call gates chance (0.49 < 0.5 passes), second call resolves quantity
    vi.spyOn(Math, 'random')
      .mockReturnValueOnce(0.49)  // chance roll — passes
      .mockReturnValueOnce(0)     // quantity roll — min
    const enemy = makeEnemy([{ itemId: 'ammo_22lr', chance: 0.5, count: [3, 6] }])
    const result = rollLoot(enemy)
    expect(result).toHaveLength(3)
  })
})

// ------------------------------------------------------------------
// 5. Multiple entries — each with counts, composed correctly
// ------------------------------------------------------------------
describe('rollLoot — multi-entry composition', () => {
  it('returns flattened list with correct quantities from each entry', () => {
    // All chance rolls pass (return 0), quantity rolls deterministic
    let callCount = 0
    vi.spyOn(Math, 'random').mockImplementation(() => {
      // Calls: chance_A, qty_A (per item in loop), chance_B, qty_B
      // We want: chance_A=0 (pass), qty_A=0 (min=2 → qty=2),
      //          chance_B=0 (pass), qty_B=0 (min=4 → qty=4)
      callCount++
      return 0
    })

    const enemy = makeEnemy([
      { itemId: 'scrap_metal', chance: 1.0, count: [2, 2] },
      { itemId: 'bandages',    chance: 1.0, count: [4, 4] },
    ])

    const result = rollLoot(enemy)
    const scrapCount = result.filter(id => id === 'scrap_metal').length
    const bandageCount = result.filter(id => id === 'bandages').length

    expect(scrapCount).toBe(2)
    expect(bandageCount).toBe(4)
    expect(result).toHaveLength(6)
  })

  it('skips an entry that fails its chance roll but still drops others', () => {
    let callIndex = 0
    const rngSequence = [
      0.99,  // chance for scrap_metal: 0.99 >= 0.5 → FAILS
      0.0,   // chance for bandages: 0.0 < 1.0 → passes
      0.0,   // qty for bandages: min = 3, max = 3 → 3
    ]
    vi.spyOn(Math, 'random').mockImplementation(() => rngSequence[callIndex++] ?? 0)

    const enemy = makeEnemy([
      { itemId: 'scrap_metal', chance: 0.5,  count: [2, 2] },
      { itemId: 'bandages',    chance: 1.0,  count: [3, 3] },
    ])

    const result = rollLoot(enemy)
    expect(result.filter(id => id === 'scrap_metal')).toHaveLength(0)
    expect(result.filter(id => id === 'bandages')).toHaveLength(3)
  })
})
