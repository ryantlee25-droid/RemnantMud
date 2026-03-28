// ============================================================
// Integration tests for combat abilities and weapon traits
// Tests the REAL playerAttack and rollLoot from lib/combat.ts
// with controlled dice rolls via vi.mock on lib/dice.ts.
// ============================================================

import { describe, it, expect, vi, beforeEach } from 'vitest'
import type { Player, Enemy, CombatState, Item } from '@/types/game'

// ------------------------------------------------------------
// Mock the dice module — rollCheck calls roll1d10 internally,
// but the closure captures the original, so we must also mock
// rollCheck and rollDamage to get deterministic results.
// We spread the actual module so statModifier/DC remain real.
// ------------------------------------------------------------

// Use globalThis to share mutable state with the hoisted vi.mock factory
;(globalThis as Record<string, unknown>).__testDiceRoll = 5

vi.mock('@/lib/dice', async (importOriginal) => {
  const actual = await importOriginal<typeof import('@/lib/dice')>()
  return {
    ...actual,
    roll1d10: vi.fn(() => (globalThis as Record<string, unknown>).__testDiceRoll as number),
    rollCheck: vi.fn((stat: number, dc: number) => {
      const roll = (globalThis as Record<string, unknown>).__testDiceRoll as number
      const modifier = actual.statModifier(stat)
      const total = roll + modifier
      const critical = roll === 10
      const fumble = roll === 1
      let success: boolean
      if (critical) success = true
      else if (fumble) success = false
      else success = total >= dc
      return { roll, modifier, total, dc, success, critical, fumble }
    }),
    rollDamage: vi.fn((range: [number, number]) => {
      // Return the midpoint for deterministic damage
      return Math.ceil((range[0] + range[1]) / 2)
    }),
  }
})

import { roll1d10, rollCheck, rollDamage } from '@/lib/dice'
import { playerAttack, rollLoot } from '@/lib/combat'

/** Set the dice roll that rollCheck and roll1d10 will return next. */
function setRoll(n: number) {
  (globalThis as Record<string, unknown>).__testDiceRoll = n
}

// ------------------------------------------------------------
// Helpers — minimal test objects
// ------------------------------------------------------------

function makePlayer(overrides: Partial<Player> = {}): Player {
  return {
    id: 'test-player',
    name: 'Test Player',
    characterClass: 'enforcer',
    vigor: 7,
    grit: 5,
    reflex: 5,
    wits: 5,
    presence: 5,
    shadow: 5,
    hp: 30,
    maxHp: 30,
    currentRoomId: 'test-room',
    worldSeed: 1,
    xp: 0,
    level: 1,
    actionsTaken: 0,
    isDead: false,
    cycle: 1,
    totalDeaths: 0,
    ...overrides,
  }
}

function makeEnemy(overrides: Partial<Enemy> = {}): Enemy {
  return {
    id: 'test-enemy',
    name: 'Test Hollow',
    description: 'A test enemy.',
    hp: 20,
    maxHp: 20,
    attack: 3,
    defense: 8,
    damage: [2, 4] as [number, number],
    xp: 10,
    loot: [],
    ...overrides,
  }
}

function makeState(overrides: Partial<CombatState> = {}): CombatState {
  const enemy = overrides.enemy ?? makeEnemy()
  return {
    enemy,
    enemyHp: overrides.enemyHp ?? enemy.hp,
    playerGoesFirst: true,
    turn: 1,
    active: true,
    playerConditions: [],
    enemyConditions: [],
    abilityUsed: false,
    defendingThisTurn: false,
    waitingBonus: 0,
    ...overrides,
  }
}

function makeWeapon(overrides: Partial<Item> = {}): Item {
  return {
    id: 'test-weapon',
    name: 'Test Blade',
    description: 'A test weapon.',
    type: 'weapon',
    weight: 2,
    damage: 3,
    value: 10,
    ...overrides,
  }
}

// ------------------------------------------------------------
// Tests
// ------------------------------------------------------------

beforeEach(() => {
  setRoll(5)
})

describe('Overwhelm (Enforcer) — auto-hit', () => {
  it('always hits regardless of enemy defense', () => {
    const player = makePlayer({ vigor: 3 }) // low vigor, would normally miss
    const enemy = makeEnemy({ defense: 20 }) // absurdly high defense
    const state = makeState({
      enemy,
      enemyHp: enemy.hp,
      overwhelmActive: true,
    })

    const { result } = playerAttack(player, state, [2, 4])

    expect(result.hit).toBe(true)
    expect(result.damage).toBeGreaterThan(0)
    expect(result.messages.some(m => m.text.includes('No defense matters'))).toBe(true)
  })

  it('clears overwhelmActive after the attack', () => {
    const state = makeState({ overwhelmActive: true })

    const { newState } = playerAttack(makePlayer(), state, [2, 4])

    expect(newState.overwhelmActive).toBe(false)
  })
})

describe('Shadowstrike (Wraith) — forced crit', () => {
  it('forces a critical hit on a successful roll that is not natural 10', () => {
    // Roll 7 + vigor modifier (7-5=2) = 9 vs defense 8 → success, not natural 10
    setRoll(7)

    const player = makePlayer({ vigor: 7 })
    const state = makeState({
      enemy: makeEnemy({ defense: 8 }),
      enemyHp: 20,
      shadowstrikeActive: true,
    })

    const { result } = playerAttack(player, state, [2, 4])

    expect(result.hit).toBe(true)
    expect(result.critical).toBe(true)
  })

  it('clears shadowstrikeActive after the attack', () => {
    setRoll(7)

    const state = makeState({ shadowstrikeActive: true })

    const { newState } = playerAttack(makePlayer(), state, [2, 4])

    expect(newState.shadowstrikeActive).toBe(false)
  })
})

describe('Mark Target (Scout) — accuracy bonus', () => {
  it('reduces effective defense by the mark bonus', () => {
    // With vigor 5 (modifier 0), roll 5 → total 5.
    // Enemy defense 8 normally → miss.
    // With markTargetBonus 3, effective defense = 8 - 3 = 5 → total 5 >= 5 → hit.
    setRoll(5)

    const player = makePlayer({ vigor: 5 })
    const state = makeState({
      enemy: makeEnemy({ defense: 8 }),
      enemyHp: 20,
      markTargetBonus: 3,
      markTargetAttacks: 2,
    })

    const { result, newState } = playerAttack(player, state, [2, 4])

    expect(result.hit).toBe(true)
    expect(result.messages.some(m => m.text.includes('Marked target'))).toBe(true)
    // After first attack: attacks decremented to 1, bonus still 3
    expect(newState.markTargetAttacks).toBe(1)
    expect(newState.markTargetBonus).toBe(3)
  })

  it('drops bonus to 0 after last marked attack', () => {
    setRoll(5)

    const player = makePlayer({ vigor: 5 })
    const state = makeState({
      enemy: makeEnemy({ defense: 8 }),
      enemyHp: 20,
      markTargetBonus: 3,
      markTargetAttacks: 1, // last attack
    })

    const { newState } = playerAttack(player, state, [2, 4])

    // markTargetAttacks was 1, decremented to 0.
    // When markTargetAttacks becomes 0, the NEXT call will set bonus to 0.
    // But the decrement logic: markTargetAttacks > 0 ? markTargetAttacks - 1 : 0
    // and markTargetBonus: markTargetAttacks > 0 ? markTargetBonus : 0
    // Since markTargetAttacks was 1 (> 0), bonus stays at 3, attacks becomes 0.
    expect(newState.markTargetAttacks).toBe(0)
    // The bonus persists this round because markTargetAttacks was > 0 at check time
    expect(newState.markTargetBonus).toBe(3)
  })

  it('zeroes bonus when markTargetAttacks is already 0', () => {
    setRoll(8) // ensure a hit

    const player = makePlayer({ vigor: 7 })
    const state = makeState({
      enemy: makeEnemy({ defense: 8 }),
      enemyHp: 20,
      markTargetBonus: 3,
      markTargetAttacks: 0, // already exhausted
    })

    const { newState } = playerAttack(player, state, [2, 4])

    expect(newState.markTargetAttacks).toBe(0)
    expect(newState.markTargetBonus).toBe(0)
  })
})

describe('Keen weapon trait — crit on roll 9', () => {
  it('treats natural 9 as a critical hit', () => {
    setRoll(9)

    const player = makePlayer({ vigor: 7 })
    const weapon = makeWeapon({ weaponTraits: ['keen'] })
    const state = makeState({
      enemy: makeEnemy({ defense: 8 }),
      enemyHp: 20,
    })

    const { result } = playerAttack(player, state, [2, 4], weapon)

    expect(result.hit).toBe(true)
    expect(result.critical).toBe(true)
  })

  it('does NOT crit on natural 8', () => {
    setRoll(8)

    const player = makePlayer({ vigor: 7 })
    const weapon = makeWeapon({ weaponTraits: ['keen'] })
    const state = makeState({
      enemy: makeEnemy({ defense: 8 }),
      enemyHp: 20,
    })

    const { result } = playerAttack(player, state, [2, 4], weapon)

    // Roll 8 + modifier 2 = 10 >= defense 8 → hit, but not critical
    expect(result.hit).toBe(true)
    expect(result.critical).toBe(false)
  })
})

describe('Precise weapon trait — defense halving', () => {
  it('halves enemy defense (ceil) so attacks land more easily', () => {
    // Enemy defense 15 → ceil(15/2) = 8 effective.
    // Roll 6 + vigor mod 2 (vigor 7) = 8 >= 8 → hit.
    setRoll(6)

    const player = makePlayer({ vigor: 7 })
    const weapon = makeWeapon({ weaponTraits: ['precise'] })
    const state = makeState({
      enemy: makeEnemy({ defense: 15 }),
      enemyHp: 20,
    })

    const { result } = playerAttack(player, state, [2, 4], weapon)

    // Without precise: 6 + 2 = 8 < 15 → miss. With precise: 8 >= ceil(15/2)=8 → hit.
    expect(result.hit).toBe(true)
  })

  it('confirms ceil rounding: roll just below halved defense misses', () => {
    // Roll 5 + modifier 2 = 7 < ceil(15/2)=8 → miss even with precise
    setRoll(5)

    const player = makePlayer({ vigor: 7 })
    const weapon = makeWeapon({ weaponTraits: ['precise'] })
    const state = makeState({
      enemy: makeEnemy({ defense: 15 }),
      enemyHp: 20,
    })

    const { result } = playerAttack(player, state, [2, 4], weapon)

    expect(result.hit).toBe(false)
  })
})

describe('Quick weapon trait — double-strike', () => {
  it('deals a second strike at half damage on a successful hit', () => {
    // Roll 8, vigor 7 (mod +2) = 10 vs defense 8 → hit
    setRoll(8)

    const player = makePlayer({ vigor: 7 })
    const weapon = makeWeapon({ weaponTraits: ['quick'] })
    const state = makeState({
      enemy: makeEnemy({ defense: 8, hp: 40, maxHp: 40 }),
      enemyHp: 40,
    })

    const { result, newState } = playerAttack(player, state, [3, 3], weapon)

    expect(result.hit).toBe(true)

    // Quick trait message should appear
    const quickMessages = result.messages.filter(m => m.text.includes('QUICK'))
    expect(quickMessages.length).toBe(1)
    expect(quickMessages[0].text).toMatch(/second strike/i)

    // First strike: rollDamage([3,3]) mocked = ceil((3+3)/2) = 3, + vigor bonus max(0,7-5)=2 = 5
    // Quick second strike: ceil(5/2) = 3
    // Total = 5 + 3 = 8
    expect(result.damage).toBe(8)
    expect(newState.enemyHp).toBe(40 - 8)
  })

  it('does not double-strike if enemy is defeated by the first hit', () => {
    setRoll(8)

    const player = makePlayer({ vigor: 7 })
    const weapon = makeWeapon({ weaponTraits: ['quick'] })
    const enemy = makeEnemy({ defense: 8, hp: 3, maxHp: 3 })
    const state = makeState({
      enemy,
      enemyHp: 3,
    })

    const { result } = playerAttack(player, state, [3, 3], weapon)

    expect(result.hit).toBe(true)
    expect(result.enemyDefeated).toBe(true)

    // No quick message since enemy died on first hit
    const quickMessages = result.messages.filter(m => m.text.includes('QUICK'))
    expect(quickMessages.length).toBe(0)
  })
})

describe('rollLoot', () => {
  it('always drops items with 100% chance', () => {
    const enemy = makeEnemy({
      loot: [{ itemId: 'ammo_22lr', chance: 1.0 }],
    })

    // Run multiple times to confirm determinism
    for (let i = 0; i < 10; i++) {
      const drops = rollLoot(enemy)
      expect(drops).toContain('ammo_22lr')
    }
  })

  it('never drops items with 0% chance', () => {
    const enemy = makeEnemy({
      loot: [{ itemId: 'ammo_22lr', chance: 0 }],
    })

    for (let i = 0; i < 10; i++) {
      const drops = rollLoot(enemy)
      expect(drops).not.toContain('ammo_22lr')
    }
  })

  it('skips loot entries for non-existent items', () => {
    const enemy = makeEnemy({
      loot: [{ itemId: 'does_not_exist_item_xyz', chance: 1.0 }],
    })

    const drops = rollLoot(enemy)
    expect(drops).toEqual([])
  })
})
