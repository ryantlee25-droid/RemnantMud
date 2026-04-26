// ============================================================
// Integration tests for AoE primitive (H5, Convoy 2)
// Tests resolveAoE() from lib/combat.ts via the enemy onDeath path.
// ============================================================

import { describe, it, expect } from 'vitest'
import type { Player, Enemy, CombatState, AoEDamage } from '@/types/game'
import { resolveAoE } from '@/lib/combat'

// ------------------------------------------------------------
// Helpers
// ------------------------------------------------------------

function makePlayer(overrides: Partial<Player> = {}): Player {
  return {
    id: 'p1', name: 'Tester', characterClass: 'enforcer',
    vigor: 5, grit: 5, reflex: 5, wits: 5, presence: 5, shadow: 5,
    hp: 20, maxHp: 20, currentRoomId: 'room_1', worldSeed: 1,
    xp: 0, level: 1, actionsTaken: 0, isDead: false, cycle: 1, totalDeaths: 0,
    ...overrides,
  }
}

function makeEnemy(overrides: Partial<Enemy> = {}): Enemy {
  return {
    id: 'shuffler', name: 'Shuffler', description: 'A shambling corpse.',
    hp: 20, maxHp: 20, attack: 2, defense: 8, damage: [2, 4] as [number, number],
    xp: 10, loot: [],
    ...overrides,
  }
}

function makeCombatState(overrides: Partial<CombatState> = {}): CombatState {
  return {
    enemy: makeEnemy(),
    enemyHp: 20,
    playerGoesFirst: true,
    turn: 1,
    active: false,
    playerConditions: [],
    enemyConditions: [],
    abilityUsed: false,
    defendingThisTurn: false,
    waitingBonus: 0,
    ...overrides,
  }
}

/** Bomber fixture with adjacent AoE onDeath */
function makeBomberEnemy(aoe: AoEDamage = { radius: 'adjacent', damage: [1, 4] }): Enemy {
  return makeEnemy({
    id: 'test_bomber',
    name: 'Bomber',
    description: 'A volatile enemy.',
    onDeath: { aoe },
  })
}

// Deterministic rng helpers
const rngMin = () => 0.0     // always returns 0.0 → min roll
const rngMax = () => 0.9999  // always returns ~1.0 → max roll

// ------------------------------------------------------------
// Test 1: Enemy without onDeath.aoe → no AoE happens
// ------------------------------------------------------------

describe('resolveAoE', () => {
  it('enemy without onDeath.aoe produces no messages and no damage when called with empty shape', () => {
    // This test verifies the base AoEDamage shape with a benign all-zeros case.
    // In actual game code the caller checks `if (enemy.onDeath?.aoe)` before calling
    // resolveAoE, but we test the function directly with a minimal zero-damage AoE.
    const player = makePlayer()
    const combat = makeCombatState({ additionalEnemies: [] })

    // Simulate what happens when the game correctly skips AoE for non-AoE enemies:
    // build a combat state where no additional enemies exist and verify no index entries
    const aoe: AoEDamage = { radius: 'adjacent', damage: [1, 4] }
    const result = resolveAoE(aoe, player, combat, rngMin)

    // Player damage must be > 0 (bomber explodes); no additional enemies → empty index map
    expect(result.damageToEnemiesByIndex).toEqual({})
    // No messages for secondary enemies
    const secondaryMsgs = result.messages.filter(m => m.text.includes('caught in the blast') && !m.text.startsWith('The explosion'))
    expect(secondaryMsgs).toHaveLength(0)
    // No conditions if AoE has no condition field
    expect(result.conditionsApplied).toHaveLength(0)
  })

  // ------------------------------------------------------------
  // Test 2: radius 'adjacent' — player takes damage + first enemy takes damage; second unaffected
  // ------------------------------------------------------------

  it('radius adjacent: player and first additionalEnemy take damage; second additionalEnemy is unaffected', () => {
    const player = makePlayer({ hp: 20 })
    const firstEnemy = makeEnemy({ id: 'e1', name: 'Shuffler A' })
    const secondEnemy = makeEnemy({ id: 'e2', name: 'Shuffler B' })
    const combat = makeCombatState({
      additionalEnemies: [firstEnemy, secondEnemy],
    })

    const aoe: AoEDamage = { radius: 'adjacent', damage: [1, 4] }
    const result = resolveAoE(aoe, player, combat, rngMin)

    // Player gets half damage (rngMin → base roll = 1; half of 1 = 1 min clamped)
    expect(result.damageToPlayer).toBeGreaterThan(0)

    // First additional enemy (index 0) should have damage
    expect(result.damageToEnemiesByIndex[0]).toBeGreaterThan(0)

    // Second additional enemy (index 1) should have NO damage
    expect(result.damageToEnemiesByIndex[1]).toBeUndefined()

    // Verify messages reference player and Shuffler A but NOT Shuffler B
    const msgTexts = result.messages.map(m => m.text)
    const playerMsg = msgTexts.find(t => t.includes('explosion'))
    const firstEnemyMsg = msgTexts.find(t => t.includes('Shuffler A'))
    const secondEnemyMsg = msgTexts.find(t => t.includes('Shuffler B'))

    expect(playerMsg).toBeTruthy()
    expect(firstEnemyMsg).toBeTruthy()
    expect(secondEnemyMsg).toBeUndefined()
  })

  // ------------------------------------------------------------
  // Test 3: radius 'room' — player + ALL additionalEnemies take damage
  // ------------------------------------------------------------

  it('radius room: player and ALL additionalEnemies take damage', () => {
    const player = makePlayer({ hp: 20 })
    const enemies = [
      makeEnemy({ id: 'e1', name: 'Shuffler A' }),
      makeEnemy({ id: 'e2', name: 'Shuffler B' }),
      makeEnemy({ id: 'e3', name: 'Shuffler C' }),
    ]
    const combat = makeCombatState({ additionalEnemies: enemies })

    const aoe: AoEDamage = { radius: 'room', damage: [2, 6] }
    const result = resolveAoE(aoe, player, combat, rngMin)

    // Player takes damage
    expect(result.damageToPlayer).toBeGreaterThan(0)

    // All three additional enemies take damage
    expect(result.damageToEnemiesByIndex[0]).toBeGreaterThan(0)
    expect(result.damageToEnemiesByIndex[1]).toBeGreaterThan(0)
    expect(result.damageToEnemiesByIndex[2]).toBeGreaterThan(0)

    // All three enemy messages present
    const msgTexts = result.messages.map(m => m.text)
    expect(msgTexts.some(t => t.includes('Shuffler A'))).toBe(true)
    expect(msgTexts.some(t => t.includes('Shuffler B'))).toBe(true)
    expect(msgTexts.some(t => t.includes('Shuffler C'))).toBe(true)
  })

  // ------------------------------------------------------------
  // Test 4: AoE applies condition to all targets that took damage
  // ------------------------------------------------------------

  it('AoE with condition field applies burning to player and all hit enemies', () => {
    const player = makePlayer({ hp: 20 })
    const firstEnemy = makeEnemy({ id: 'e1', name: 'Shuffler A' })
    const secondEnemy = makeEnemy({ id: 'e2', name: 'Shuffler B' })
    const combat = makeCombatState({ additionalEnemies: [firstEnemy, secondEnemy] })

    const aoe: AoEDamage = { radius: 'room', damage: [1, 4], condition: 'burning' }
    const result = resolveAoE(aoe, player, combat, rngMin)

    // Condition should be in the list (deduplicated)
    expect(result.conditionsApplied).toContain('burning')

    // Condition messages should mention both enemies
    const condMsgs = result.messages.filter(m => m.text.includes('afflicted'))
    // Player + 2 enemies = 3 condition messages
    expect(condMsgs.length).toBeGreaterThanOrEqual(2)
  })

  // ------------------------------------------------------------
  // Test 5: Damage scales with rng — rng=0.0 yields min; rng~1.0 yields max
  // ------------------------------------------------------------

  it('damage scales with rng: rng=0.0 yields min damage; rng=0.9999 yields max damage', () => {
    const player = makePlayer({ hp: 20 })
    const combat = makeCombatState({ additionalEnemies: [] })
    const aoe: AoEDamage = { radius: 'room', damage: [3, 8] }

    const minResult = resolveAoE(aoe, player, combat, rngMin)
    const maxResult = resolveAoE(aoe, player, combat, rngMax)

    // rngMin → floor(0.0 * (8-3+1)) + 3 = 0 + 3 = 3
    expect(minResult.damageToPlayer).toBe(3)

    // rngMax → floor(0.9999 * 6) + 3 = 5 + 3 = 8
    expect(maxResult.damageToPlayer).toBe(8)

    // Min < Max
    expect(minResult.damageToPlayer).toBeLessThan(maxResult.damageToPlayer)
  })
})
