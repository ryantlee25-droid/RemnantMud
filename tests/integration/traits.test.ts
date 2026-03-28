// ============================================================
// Integration tests for lib/traits.ts — weapon and armor trait resolution
// ============================================================

import { describe, it, expect, vi, beforeEach } from 'vitest'
import type { Player, Enemy, Item } from '@/types/game'
import type { ConditionId } from '@/types/traits'
import { resolveWeaponTraits, resolveArmorTraits } from '@/lib/traits'

// ------------------------------------------------------------
// Helpers
// ------------------------------------------------------------

function makePlayer(overrides: Partial<Player> = {}): Player {
  return {
    id: 'p1', name: 'Tester', characterClass: 'enforcer',
    vigor: 10, grit: 8, reflex: 12, wits: 5, presence: 4, shadow: 3,
    hp: 20, maxHp: 20, currentRoomId: 'room_1', worldSeed: 1,
    xp: 0, level: 1, actionsTaken: 0, isDead: false, cycle: 1, totalDeaths: 0,
    ...overrides,
  }
}

function makeEnemy(overrides: Partial<Enemy> = {}): Enemy {
  return {
    id: 'shuffler', name: 'Shuffler', description: 'A shambling corpse.',
    hp: 20, maxHp: 20, attack: 2, defense: 8, damage: [1, 3] as [number, number],
    xp: 10, loot: [],
    ...overrides,
  }
}

function makeWeapon(overrides: Partial<Item> = {}): Item {
  return {
    id: 'test_weapon', name: 'Test Weapon', description: 'A test weapon.',
    type: 'weapon', weight: 1, damage: 5, value: 10,
    ...overrides,
  }
}

function makeArmor(overrides: Partial<Item> = {}): Item {
  return {
    id: 'test_armor', name: 'Test Armor', description: 'Test armor.',
    type: 'armor', weight: 3, defense: 2, value: 10,
    ...overrides,
  }
}

// ------------------------------------------------------------
// Weapon Trait Tests
// ------------------------------------------------------------

describe('resolveWeaponTraits', () => {
  beforeEach(() => {
    vi.restoreAllMocks()
  })

  it('keen trait notes critical aid on critical hit', () => {
    const player = makePlayer({ reflex: 14 })
    const weapon = makeWeapon({ weaponTraits: ['keen'] })
    const enemy = makeEnemy()

    const result = resolveWeaponTraits(player, weapon, enemy, true, 5)
    expect(result.messages).toEqual(
      expect.arrayContaining([expect.stringContaining('Keen')])
    )
  })

  it('vicious trait applies bleeding condition', () => {
    const player = makePlayer()
    const weapon = makeWeapon({ weaponTraits: ['vicious'] })
    const enemy = makeEnemy()

    const result = resolveWeaponTraits(player, weapon, enemy, false, 5)
    expect(result.conditionsToApply).toContain('bleeding')
    expect(result.messages).toEqual(
      expect.arrayContaining([expect.stringContaining('bleeding')])
    )
  })

  it('blessed trait adds +3 bonus damage vs sanguine enemy', () => {
    const player = makePlayer({ presence: 5 })
    const weapon = makeWeapon({ weaponTraits: ['blessed'] })
    const enemy = makeEnemy({ hollowType: 'elder_sanguine' })

    const result = resolveWeaponTraits(player, weapon, enemy, false, 5)
    expect(result.bonusDamage).toBe(3)
    expect(result.messages).toEqual(
      expect.arrayContaining([expect.stringContaining('Blessed')])
    )
  })

  it('blessed trait adds +4 vs sanguine when presence >= 7', () => {
    const player = makePlayer({ presence: 7 })
    const weapon = makeWeapon({ weaponTraits: ['blessed'] })
    const enemy = makeEnemy({ hollowType: 'sanguine_feral' })

    const result = resolveWeaponTraits(player, weapon, enemy, false, 5)
    expect(result.bonusDamage).toBe(4) // 3 base + 1 presence bonus
  })

  it('enemy weakness increases trait bonus damage', () => {
    const player = makePlayer()
    const weapon = makeWeapon({ weaponTraits: ['heavy'] })
    const enemy = makeEnemy({
      resistanceProfile: {
        weaknesses: {
          heavy: { bonusDamage: 3, description: 'Vulnerable to heavy blows.' },
        },
        resistances: {},
        conditionImmunities: [],
      },
    })

    const result = resolveWeaponTraits(player, weapon, enemy, false, 5)
    // heavy gives +2, weakness adds +3
    expect(result.bonusDamage).toBe(5)
    expect(result.messages).toEqual(
      expect.arrayContaining([expect.stringContaining('Vulnerable')])
    )
  })

  it('enemy resistance reduces trait bonus damage', () => {
    const player = makePlayer()
    const weapon = makeWeapon({ weaponTraits: ['heavy'] })
    const enemy = makeEnemy({
      resistanceProfile: {
        weaknesses: {},
        resistances: {
          heavy: { reduction: 0.5, description: 'Resistant to heavy blows.' },
        },
        conditionImmunities: [],
      },
    })

    const result = resolveWeaponTraits(player, weapon, enemy, false, 5)
    // heavy gives +2, but 50% reduction => +1
    expect(result.bonusDamage).toBe(1)
  })

  it('enemy condition immunity blocks condition application via vicious', () => {
    const player = makePlayer()
    const weapon = makeWeapon({ weaponTraits: ['vicious'] })
    const enemy = makeEnemy({
      resistanceProfile: {
        weaknesses: {},
        resistances: {
          vicious: { reduction: 1.0, description: 'Immune to serrated edges.' },
        },
        conditionImmunities: ['bleeding'],
      },
    })

    const result = resolveWeaponTraits(player, weapon, enemy, false, 5)
    // Full resistance (reduction=1.0 => reductionFactor=0) means condition not applied
    expect(result.conditionsToApply).not.toContain('bleeding')
    expect(result.messages).toEqual(
      expect.arrayContaining([expect.stringContaining('shrugs off')])
    )
  })
})

// ------------------------------------------------------------
// Armor Trait Tests
// ------------------------------------------------------------

describe('resolveArmorTraits', () => {
  it('fortified adds flat damage reduction based on tier', () => {
    const armor = makeArmor({ armorTraits: ['fortified'], tier: 3 })
    const result = resolveArmorTraits(armor, [], 0)
    expect(result.flatReduction).toBe(3)
  })

  it('fortified defaults to tier 1 when tier is missing', () => {
    const armor = makeArmor({ armorTraits: ['fortified'] })
    // tier is undefined, defaults to 1
    const result = resolveArmorTraits(armor, [], 0)
    expect(result.flatReduction).toBe(1)
  })

  it('reactive blocks bleeding condition', () => {
    const armor = makeArmor({ armorTraits: ['reactive'] })
    const incomingConditions: ConditionId[] = ['bleeding', 'burning']

    const result = resolveArmorTraits(armor, incomingConditions, 0)
    expect(result.conditionsBlocked).toContain('bleeding')
    expect(result.conditionsBlocked).not.toContain('burning')
  })

  it('reactive blocks poisoned condition', () => {
    const armor = makeArmor({ armorTraits: ['reactive'] })
    const incomingConditions: ConditionId[] = ['poisoned']

    const result = resolveArmorTraits(armor, incomingConditions, 0)
    expect(result.conditionsBlocked).toContain('poisoned')
  })

  it('insulated blocks burning condition', () => {
    const armor = makeArmor({ armorTraits: ['insulated'] })
    const incomingConditions: ConditionId[] = ['burning']

    const result = resolveArmorTraits(armor, incomingConditions, 0)
    expect(result.conditionsBlocked).toContain('burning')
  })

  it('warded reduces frightened duration', () => {
    const armor = makeArmor({ armorTraits: ['warded'] })
    const result = resolveArmorTraits(armor, [], 3)
    expect(result.adjustedFearDuration).toBe(2) // 3 - 1
  })

  it('warded does not reduce fear below 1', () => {
    const armor = makeArmor({ armorTraits: ['warded'] })
    const result = resolveArmorTraits(armor, [], 1)
    expect(result.adjustedFearDuration).toBe(1)
  })
})
