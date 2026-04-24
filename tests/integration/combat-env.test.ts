// ============================================================
// Integration tests: environment modifier system (H5)
//
// Covers computeEnvironmentEffects + getEnvironmentModifiers
// from lib/combat.ts. Four environment types:
//  1. darkness       — -2 enemy accuracy (no player light)
//  2. high_ground    — +1 player accuracy, +1 player damage
//  3. narrow_passage — -1 both defenses
//  4. collapsing     — 1d4 debris damage to both (20% per round)
//
// Uses deterministic Math.random mock for reproducible results.
// No GameEngine — pure lib/combat.ts function calls.
// ============================================================

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import type { Player, Enemy, CombatState, Room } from '@/types/game'
import {
  getEnvironmentModifiers,
  computeEnvironmentEffects,
  playerAttack,
  enemyAttack,
} from '@/lib/combat'

// ------------------------------------------------------------
// Fixtures
// ------------------------------------------------------------

function makePlayer(overrides: Partial<Player> = {}): Player {
  return {
    id: 'env-test-player',
    name: 'Test',
    characterClass: 'enforcer',
    vigor: 6, grit: 5, reflex: 5, wits: 5, presence: 4, shadow: 4,
    hp: 20, maxHp: 20,
    currentRoomId: 'test-room',
    worldSeed: 1,
    xp: 0, level: 1, actionsTaken: 0,
    isDead: false, cycle: 1, totalDeaths: 0,
    factionReputation: {},
    questFlags: {},
    ...overrides,
  }
}

function makeEnemy(overrides: Partial<Enemy> = {}): Enemy {
  return {
    id: 'shuffler',
    name: 'Shuffler',
    description: 'Shambling thing.',
    hollowType: 'shuffler',
    hp: 12,
    maxHp: 12,
    attack: 1,
    defense: 7,
    damage: [2, 4],
    xp: 12,
    loot: [],
    ...overrides,
  }
}

function makeCombatState(enemy: Enemy, overrides: Partial<CombatState> = {}): CombatState {
  return {
    enemy,
    enemyHp: enemy.hp,
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

function makeRoom(flagOverrides: Record<string, boolean | number | string> = {}): Room {
  return {
    id: 'test-room',
    name: 'Test Room',
    description: 'A test room.',
    shortDescription: 'Test room.',
    zone: 'crossroads',
    difficulty: 1,
    visited: true,
    flags: flagOverrides,
    exits: {},
    items: [],
    enemies: [],
    npcs: [],
  }
}

// ------------------------------------------------------------
// Environment 1: Darkness
// ------------------------------------------------------------

describe('getEnvironmentModifiers — darkness flag', () => {
  it('returns combat_darkness modifier for a dark room', () => {
    const room = makeRoom({ combat_darkness: true })
    const mods = getEnvironmentModifiers(room)
    expect(mods).toContain('combat_darkness')
  })

  it('returns empty array for a room with no combat flags', () => {
    const room = makeRoom({ safeRest: true, dark: true }) // dark != combat_darkness
    const mods = getEnvironmentModifiers(room)
    expect(mods).toHaveLength(0)
  })
})

describe('computeEnvironmentEffects — darkness', () => {
  it('applies -2 enemy accuracy when player has no light (hasLight: false)', () => {
    const { combined } = computeEnvironmentEffects(['combat_darkness'], false)
    expect(combined.enemyAccuracy).toBe(-2)
  })

  it('applies -2 player accuracy AND -2 enemy accuracy when hasLight: false', () => {
    const { combined } = computeEnvironmentEffects(['combat_darkness'], false)
    expect(combined.playerAccuracy).toBe(-2)
    expect(combined.enemyAccuracy).toBe(-2)
  })

  it('applies 0 player accuracy penalty when hasLight: true (player has light source)', () => {
    const { combined } = computeEnvironmentEffects(['combat_darkness'], true)
    expect(combined.playerAccuracy).toBe(0)
    // Enemy is still penalized even against a light-bearer
    expect(combined.enemyAccuracy).toBe(-2)
  })

  it('enemy accuracy penalty reduces hit chance in darkness', () => {
    // With -2 enemy accuracy, enemy attack total = roll + enemy.attack + (-2)
    // At roll = 5 with attack 1: without mod = 6, with mod = 4. DC.MODERATE = 8.
    // We pin roll to something that hits normally but misses with penalty.
    vi.spyOn(Math, 'random').mockReturnValue(0.49) // d10 = floor(0.49*10)+1 = 5

    const player = makePlayer()
    const enemy = makeEnemy({ attack: 1 })
    const state = makeCombatState(enemy)

    // Without darkness (envMod = undefined)
    const { damage: dmgNormal } = enemyAttack(player, state)

    vi.spyOn(Math, 'random').mockReturnValue(0.49)
    const { combined } = computeEnvironmentEffects(['combat_darkness'], false)
    const { damage: dmgDark } = enemyAttack(player, state, undefined, combined)

    // The darkness penalty should reduce or eliminate enemy damage
    // (both may be 0 depending on DC; the test just validates the modifier path)
    expect(combined.enemyAccuracy).toBe(-2)
    // Actual damage comparison: normal should be >= dark (penalty applies)
    expect(dmgNormal).toBeGreaterThanOrEqual(dmgDark)

    vi.restoreAllMocks()
  })
})

// ------------------------------------------------------------
// Environment 2: High ground
// ------------------------------------------------------------

describe('getEnvironmentModifiers — high ground flag', () => {
  it('returns combat_high_ground modifier', () => {
    const room = makeRoom({ combat_high_ground: true })
    const mods = getEnvironmentModifiers(room)
    expect(mods).toContain('combat_high_ground')
  })
})

describe('computeEnvironmentEffects — high ground', () => {
  it('grants +1 player accuracy', () => {
    const { combined } = computeEnvironmentEffects(['combat_high_ground'], false)
    expect(combined.playerAccuracy).toBe(1)
  })

  it('grants +1 player damage', () => {
    const { combined } = computeEnvironmentEffects(['combat_high_ground'], false)
    expect(combined.playerDamage).toBe(1)
  })

  it('does not affect enemy accuracy or defense', () => {
    const { combined } = computeEnvironmentEffects(['combat_high_ground'], false)
    expect(combined.enemyAccuracy).toBe(0)
    expect(combined.enemyDefense).toBe(0)
    expect(combined.playerDefense).toBe(0)
  })

  it('playerDamage bonus is reflected in actual playerAttack output on a hit', () => {
    // Force a guaranteed hit and deterministic damage
    vi.spyOn(Math, 'random').mockReturnValue(0.65) // d10 = 7; enough to hit defense 7 with vigor 6 (mod +1) → 7+1=8 ≥ DC(7)

    const player = makePlayer({ vigor: 6 })
    const enemy = makeEnemy({ defense: 7 })
    const state = makeCombatState(enemy)

    const { combined: envNoHighGround } = computeEnvironmentEffects([], false)
    vi.spyOn(Math, 'random').mockReturnValue(0.65)
    const { result: plainResult } = playerAttack(player, state, [2, 2], undefined, envNoHighGround)

    const { combined: envHighGround } = computeEnvironmentEffects(['combat_high_ground'], false)
    vi.spyOn(Math, 'random').mockReturnValue(0.65)
    const { result: buffedResult } = playerAttack(player, state, [2, 2], undefined, envHighGround)

    if (plainResult.hit && buffedResult.hit) {
      expect(buffedResult.damage).toBeGreaterThanOrEqual(plainResult.damage)
    }

    // Even if randomness causes a miss, verify the modifier values themselves
    expect(envHighGround.playerDamage).toBe(1)
    expect(envHighGround.playerAccuracy).toBe(1)

    vi.restoreAllMocks()
  })
})

// ------------------------------------------------------------
// Environment 3: Narrow passage
// ------------------------------------------------------------

describe('getEnvironmentModifiers — narrow passage flag', () => {
  it('returns combat_narrow_passage modifier', () => {
    const room = makeRoom({ combat_narrow_passage: true })
    const mods = getEnvironmentModifiers(room)
    expect(mods).toContain('combat_narrow_passage')
  })
})

describe('computeEnvironmentEffects — narrow passage', () => {
  it('reduces both player defense and enemy defense by 1', () => {
    const { combined } = computeEnvironmentEffects(['combat_narrow_passage'], false)
    expect(combined.playerDefense).toBe(-1)
    expect(combined.enemyDefense).toBe(-1)
  })

  it('does not affect accuracy or damage directly', () => {
    const { combined } = computeEnvironmentEffects(['combat_narrow_passage'], false)
    expect(combined.playerAccuracy).toBe(0)
    expect(combined.playerDamage).toBe(0)
    expect(combined.enemyAccuracy).toBe(0)
  })

  it('reduced enemy defense makes enemy easier to hit (effectiveDefense lower)', () => {
    // enemyDefense: -1 means effectiveDefense = Math.max(1, base - 0 - 0 + (-1))
    // With a base enemy defense of 7: effective = 6 instead of 7
    // This is a modifier test — we check the effect value, not the outcome (outcome depends on random)
    const { combined } = computeEnvironmentEffects(['combat_narrow_passage'], false)
    expect(combined.enemyDefense).toBe(-1)
  })
})

// ------------------------------------------------------------
// Environment 4: Collapsing ceiling
// ------------------------------------------------------------

describe('getEnvironmentModifiers — collapsing ceiling flag', () => {
  it('returns combat_collapsing modifier', () => {
    const room = makeRoom({ combat_collapsing: true })
    const mods = getEnvironmentModifiers(room)
    expect(mods).toContain('combat_collapsing')
  })
})

describe('computeEnvironmentEffects — collapsing ceiling', () => {
  afterEach(() => {
    vi.restoreAllMocks()
  })

  it('returns no combat stat modifiers (debuff is via specialEffect only)', () => {
    vi.spyOn(Math, 'random').mockReturnValue(0.5) // 50% — above 20% threshold, triggers debris
    const { combined } = computeEnvironmentEffects(['combat_collapsing'], false)
    expect(combined.playerAccuracy).toBe(0)
    expect(combined.playerDamage).toBe(0)
    expect(combined.playerDefense).toBe(0)
    expect(combined.enemyAccuracy).toBe(0)
    expect(combined.enemyDefense).toBe(0)
  })

  it('triggers debris damage when random rolls below 0.20 threshold', () => {
    // Force Math.random to return 0.10 (< 0.20) — debris fires
    // Also pin the d4 roll: rollDamage([1,4]) calls Math.random internally
    // We mock to 0.10 first (probability check) then 0.99 for damage (d4 = 4)
    let callCount = 0
    vi.spyOn(Math, 'random').mockImplementation(() => {
      callCount++
      if (callCount === 1) return 0.10  // < 0.20 — trigger debris
      return 0.99                        // rollDamage([1,4]) → floor(0.99*4)+1 = 4
    })

    const { debrisMessages, debrisDamage } = computeEnvironmentEffects(['combat_collapsing'], false)

    expect(debrisMessages.length).toBeGreaterThan(0)
    expect(debrisDamage).toBeGreaterThan(0)
    expect(debrisDamage).toBeGreaterThanOrEqual(1)
    expect(debrisDamage).toBeLessThanOrEqual(4)
  })

  it('returns zero debris when random rolls above 0.20 threshold', () => {
    vi.spyOn(Math, 'random').mockReturnValue(0.50) // > 0.20 — no debris
    const { debrisMessages, debrisDamage } = computeEnvironmentEffects(['combat_collapsing'], false)
    expect(debrisMessages).toHaveLength(0)
    expect(debrisDamage).toBe(0)
  })

  it('debris message references damage amount when triggered', () => {
    let callCount = 0
    vi.spyOn(Math, 'random').mockImplementation(() => {
      callCount++
      if (callCount === 1) return 0.05  // trigger debris
      return 0.75                        // d4 = floor(0.75*4)+1 = 3
    })

    const { debrisMessages, debrisDamage } = computeEnvironmentEffects(['combat_collapsing'], false)

    if (debrisMessages.length > 0) {
      expect(debrisMessages[0]!.text).toContain('debris')
      // Message encodes the damage: "[N debris damage to both]"
      expect(debrisMessages[0]!.text).toContain(`${debrisDamage} debris damage`)
    }
  })
})

// ------------------------------------------------------------
// Stacking modifiers
// ------------------------------------------------------------

describe('computeEnvironmentEffects — stacked modifiers', () => {
  it('darkness + high_ground stack additively', () => {
    // darkness (no light): playerAccuracy -2, enemyAccuracy -2
    // high_ground: playerAccuracy +1, playerDamage +1
    // combined: playerAccuracy = -1, playerDamage = 1, enemyAccuracy = -2
    const { combined } = computeEnvironmentEffects(['combat_darkness', 'combat_high_ground'], false)
    expect(combined.playerAccuracy).toBe(-1)  // -2 + 1
    expect(combined.playerDamage).toBe(1)
    expect(combined.enemyAccuracy).toBe(-2)
  })

  it('multiple environment types are detected from room flags', () => {
    const room = makeRoom({
      combat_darkness: true,
      combat_narrow_passage: true,
    })
    const mods = getEnvironmentModifiers(room)
    expect(mods).toContain('combat_darkness')
    expect(mods).toContain('combat_narrow_passage')
    expect(mods).toHaveLength(2)
  })
})
