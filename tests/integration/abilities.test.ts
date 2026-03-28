// ============================================================
// Integration tests for lib/abilities/class.ts — class combat abilities
// ============================================================

import { describe, it, expect, vi, beforeEach } from 'vitest'
import type { Player, Enemy, CombatState } from '@/types/game'
import { handleAbility, CLASS_ABILITIES } from '@/lib/abilities/class'

// ------------------------------------------------------------
// Mock dice module to control randomness
// ------------------------------------------------------------

vi.mock('@/lib/dice', () => ({
  statModifier: (stat: number) => Math.floor((stat - 10) / 2),
  rollCheck: vi.fn((_stat: number, _dc: number) => ({
    roll: 10,
    modifier: 0,
    total: 10,
    dc: _dc,
    success: true,
    critical: false,
    fumble: false,
  })),
  rollDamage: vi.fn((_range: [number, number]) => 4),
}))

import { rollCheck, rollDamage } from '@/lib/dice'

// ------------------------------------------------------------
// Helpers
// ------------------------------------------------------------

function makePlayer(overrides: Partial<Player> = {}): Player {
  return {
    id: 'p1', name: 'Tester', characterClass: 'enforcer',
    vigor: 10, grit: 10, reflex: 10, wits: 10, presence: 10, shadow: 10,
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

function makeCombatState(overrides: Partial<CombatState> = {}): CombatState {
  return {
    enemy: makeEnemy(),
    enemyHp: 20,
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

// ------------------------------------------------------------
// Tests
// ------------------------------------------------------------

describe('handleAbility', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('fails if not in combat (active=false)', () => {
    const player = makePlayer()
    const state = makeCombatState({ active: false })
    const result = handleAbility(player, state)
    expect(result.success).toBe(false)
    expect(result.messages[0]!.type).toBe('error')
    expect(result.messages[0]!.text).toContain('not in combat')
  })

  it('fails if ability already used this combat', () => {
    const player = makePlayer()
    const state = makeCombatState({ abilityUsed: true })
    const result = handleAbility(player, state)
    expect(result.success).toBe(false)
    expect(result.messages[0]!.type).toBe('error')
    expect(result.messages[0]!.text).toContain('already used')
  })

  it('enforcer: Overwhelm sets overwhelmActive and costs HP', () => {
    const player = makePlayer({ characterClass: 'enforcer' })
    const state = makeCombatState()
    const result = handleAbility(player, state)
    expect(result.success).toBe(true)
    expect(result.newState.overwhelmActive).toBe(true)
    expect(result.newState.abilityUsed).toBe(true)
    expect(result.playerHpDelta).toBe(-3)
  })

  it('scout: Mark Target grants +3 accuracy for 2 attacks', () => {
    const player = makePlayer({ characterClass: 'scout' })
    const state = makeCombatState()
    const result = handleAbility(player, state)
    expect(result.success).toBe(true)
    expect(result.newState.markTargetBonus).toBe(3)
    expect(result.newState.markTargetAttacks).toBe(2)
    expect(result.newState.abilityUsed).toBe(true)
  })

  it('wraith: Shadowstrike enables guaranteed crit and prevents fleeing', () => {
    const player = makePlayer({ characterClass: 'wraith' })
    const state = makeCombatState()
    const result = handleAbility(player, state)
    expect(result.success).toBe(true)
    expect(result.newState.shadowstrikeActive).toBe(true)
    expect(result.newState.cantFlee).toBe(true)
    expect(result.newState.abilityUsed).toBe(true)
  })

  it('shepherd: Mend heals on successful check', () => {
    const player = makePlayer({ characterClass: 'shepherd', presence: 12 })
    // Mock rollCheck to succeed, rollDamage to return 4
    vi.mocked(rollCheck).mockReturnValueOnce({
      roll: 10, modifier: 0, total: 10, dc: 8, success: true, critical: false, fumble: false,
    })
    vi.mocked(rollDamage).mockReturnValueOnce(4)

    const state = makeCombatState()
    const result = handleAbility(player, state)
    expect(result.success).toBe(true)
    // 4 (roll) + 1 (presence modifier: (12-10)/2 = 1) = 5
    expect(result.playerHpDelta).toBe(5)
    expect(result.newState.abilityUsed).toBe(true)
  })

  it('shepherd: Mend fails on failed check', () => {
    const player = makePlayer({ characterClass: 'shepherd' })
    vi.mocked(rollCheck).mockReturnValueOnce({
      roll: 2, modifier: 0, total: 2, dc: 8, success: false, critical: false, fumble: false,
    })

    const state = makeCombatState()
    const result = handleAbility(player, state)
    expect(result.success).toBe(true) // ability was used, just didn't heal
    expect(result.playerHpDelta).toBe(0)
    expect(result.messages).toEqual(
      expect.arrayContaining([expect.objectContaining({ text: expect.stringContaining('fails') })])
    )
  })

  it('reclaimer: Analyze reveals enemy stats', () => {
    const player = makePlayer({ characterClass: 'reclaimer' })
    const enemy = makeEnemy({
      resistanceProfile: {
        weaknesses: { heavy: { bonusDamage: 2, description: 'Weak to heavy.' } },
        resistances: {},
        conditionImmunities: ['burning'],
      },
    })
    const state = makeCombatState({ enemy, enemyHp: 15 })
    const result = handleAbility(player, state)
    expect(result.success).toBe(true)
    expect(result.messages.some(m => m.text.includes('HP 15/20'))).toBe(true)
    expect(result.messages.some(m => m.text.includes('heavy'))).toBe(true)
    expect(result.messages.some(m => m.text.includes('burning'))).toBe(true)
  })

  it('warden: Brace sets braceActive and defendingThisTurn', () => {
    const player = makePlayer({ characterClass: 'warden' })
    const state = makeCombatState()
    const result = handleAbility(player, state)
    expect(result.success).toBe(true)
    expect(result.newState.braceActive).toBe(true)
    expect(result.newState.defendingThisTurn).toBe(true)
    expect(result.newState.abilityUsed).toBe(true)
  })

  it('broker: Intimidate sets enemyIntimidated on success', () => {
    const player = makePlayer({ characterClass: 'broker', presence: 12, wits: 10 })
    vi.mocked(rollCheck).mockReturnValueOnce({
      roll: 10, modifier: 0, total: 17, dc: 10, success: true, critical: false, fumble: false,
    })

    const state = makeCombatState()
    const result = handleAbility(player, state)
    expect(result.success).toBe(true)
    expect(result.newState.enemyIntimidated).toBe(true)
  })

  it('broker: Intimidate sets enemyEnraged on failure', () => {
    const player = makePlayer({ characterClass: 'broker', presence: 4, wits: 4 })
    vi.mocked(rollCheck).mockReturnValueOnce({
      roll: 2, modifier: 0, total: 6, dc: 10, success: false, critical: false, fumble: false,
    })

    const state = makeCombatState()
    const result = handleAbility(player, state)
    expect(result.success).toBe(true)
    expect(result.newState.enemyEnraged).toBe(true)
    expect(result.messages).toEqual(
      expect.arrayContaining([expect.objectContaining({ text: expect.stringContaining('enraged') })])
    )
  })
})
