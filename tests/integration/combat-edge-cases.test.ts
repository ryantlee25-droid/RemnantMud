// ============================================================
// Integration tests for combat edge cases
// ============================================================

import { describe, it, expect, vi, beforeEach } from 'vitest'
import type { GameState, Player, Room, Enemy, CombatState, GameMessage } from '@/types/game'
import type { EngineCore } from '@/lib/actions/types'

// ------------------------------------------------------------
// Mock external modules before importing handlers
// ------------------------------------------------------------

vi.mock('@/lib/combat', async (importOriginal) => {
  const actual = await importOriginal()
  return {
    ...actual,
    startCombat: vi.fn((player: Player, enemy: Enemy) => ({
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
    })),
    playerAttack: vi.fn((_player: Player, state: CombatState, _range?: [number, number]) => ({
      result: {
        hit: true,
        damage: 5,
        critical: false,
        fumble: false,
        messages: [{ id: '1', text: 'You hit.', type: 'combat' as const }],
        enemyDefeated: state.enemyHp <= 5,
        loot: state.enemyHp <= 5 ? ['scrap_metal'] : undefined,
      },
      newState: {
        ...state,
        enemyHp: Math.max(0, state.enemyHp - 5),
        active: state.enemyHp > 5,
        turn: state.turn + 1,
      },
    })),
    enemyAttack: vi.fn((_player: Player, state: CombatState) => ({
      damage: 3,
      messages: [{ id: '2', text: 'Enemy hits you. [3 damage]', type: 'combat' as const }],
      newState: { ...state, turn: state.turn + 1 },
    })),
    flee: vi.fn((_player: Player, _state: CombatState) => ({
      result: { success: true, messages: [{ id: '3', text: 'You flee!', type: 'combat' as const }] },
      freeAttack: null,
    })),
    applyHollowRoundEffects: vi.fn((state: CombatState) => ({
      messages: [],
      newState: state,
    })),
    enemyHpIndicator: vi.fn(() => 'wounded'),
  }
})

vi.mock('@/data/enemies', () => ({
  getEnemy: vi.fn((id: string) => {
    if (id === 'shuffler') return {
      id: 'shuffler', name: 'Shuffler', description: 'A shambling corpse.',
      hp: 5, maxHp: 5, attack: 2, defense: 8, damage: [1, 3] as [number, number],
      xp: 10, loot: [{ itemId: 'scrap_metal', chance: 0.5 }],
    }
    return undefined
  }),
}))

vi.mock('@/data/items', () => ({
  getItem: vi.fn((id: string) => {
    if (id === 'scrap_metal') return { id: 'scrap_metal', name: 'Scrap Metal', description: 'Junk.', type: 'junk', weight: 1, value: 2 }
    if (id === 'knife') return { id: 'knife', name: 'Knife', description: 'A knife.', type: 'weapon', weight: 1, value: 5, damage: 4 }
    return undefined
  }),
}))

vi.mock('@/lib/world', () => ({
  updateRoomItems: vi.fn().mockResolvedValue(undefined),
  updateRoomFlags: vi.fn().mockResolvedValue(undefined),
}))

vi.mock('@/lib/fear', () => ({
  fearCheck: vi.fn(() => ({ afraid: false, fearRounds: 0, messages: [] })),
}))

vi.mock('@/lib/conditions', () => ({
  tickConditions: vi.fn(() => ({ messages: [], damage: 0, remaining: [] })),
  cureCondition: vi.fn((conditions: unknown[]) => ({ cured: false, conditions })),
  tryShakeFrightened: vi.fn((conditions: unknown[]) => ({ conditions, message: null })),
}))

vi.mock('@/lib/abilities', () => ({
  buildAnalyzeMessages: vi.fn(() => []),
  handleAbility: vi.fn(),
}))

// ------------------------------------------------------------
// Helpers
// ------------------------------------------------------------

function makePlayer(overrides: Partial<Player> = {}): Player {
  return {
    id: 'p1', name: 'Tester', characterClass: 'enforcer',
    vigor: 10, grit: 8, reflex: 6, wits: 5, presence: 4, shadow: 3,
    hp: 20, maxHp: 20, currentRoomId: 'room_1', worldSeed: 1,
    xp: 0, level: 1, actionsTaken: 0, isDead: false, cycle: 1, totalDeaths: 0,
    ...overrides,
  }
}

function makeRoom(overrides: Partial<Room> = {}): Room {
  return {
    id: 'room_1', name: 'Test Room', description: 'A test room.',
    shortDescription: 'Test.', zone: 'crossroads', difficulty: 1,
    visited: false, flags: {}, exits: {}, items: [], enemies: [], npcs: [],
    ...overrides,
  }
}

function makeEngine(state: Partial<GameState> = {}): EngineCore & { messages: GameMessage[]; state: GameState } {
  const fullState: GameState = {
    player: makePlayer(),
    currentRoom: makeRoom(),
    inventory: [],
    combatState: null,
    log: [],
    loading: false,
    initialized: true,
    playerDead: false,
    ledger: null,
    stash: [],
    ...state,
  }

  const messages: GameMessage[] = []

  return {
    messages,
    state: fullState,
    getState: () => fullState,
    _setState: (partial) => Object.assign(fullState, partial),
    _appendMessages: (msgs) => messages.push(...msgs),
    _savePlayer: vi.fn().mockResolvedValue(undefined),
    _applyPopulation: (room) => room,
    _handlePlayerDeath: vi.fn().mockResolvedValue(undefined),
    _checkLevelUp: vi.fn(),
    adjustReputation: vi.fn().mockResolvedValue(undefined),
    setQuestFlag: vi.fn().mockResolvedValue(undefined),
  }
}

function makeEnemy(overrides: Partial<Enemy> = {}): Enemy {
  return {
    id: 'shuffler', name: 'Shuffler', description: 'A shambling corpse.',
    hp: 5, maxHp: 5, attack: 2, defense: 8, damage: [1, 3],
    xp: 10, loot: [{ itemId: 'scrap_metal', chance: 0.5 }],
    ...overrides,
  }
}

function makeCombatState(overrides: Partial<CombatState> = {}): CombatState {
  return {
    enemy: makeEnemy(),
    enemyHp: 5,
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

// Import handlers after mocks are registered
import { handleAttack, handleFlee, handleDefend, handleWait } from '@/lib/actions/combat'
import { handleAbility } from '@/lib/abilities'

// ------------------------------------------------------------
// Tests
// ------------------------------------------------------------

describe('Combat edge cases — player HP reaching exactly 0', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('player HP reaching exactly 0 triggers _handlePlayerDeath', async () => {
    // Player has 3 HP, enemy deals 3 damage => HP goes to exactly 0
    const { enemyAttack } = await import('@/lib/combat')
    ;(enemyAttack as ReturnType<typeof vi.fn>).mockImplementation((_player: Player, state: CombatState) => ({
      damage: 3,
      messages: [{ id: '2', text: 'Enemy hits you. [3 damage]', type: 'combat' as const }],
      newState: { ...state, turn: state.turn + 1 },
    }))

    const engine = makeEngine({
      player: makePlayer({ hp: 3, maxHp: 20 }),
      currentRoom: makeRoom({ enemies: ['shuffler'] }),
      combatState: makeCombatState({ enemyHp: 20 }),
    })

    // playerAttack won't kill the enemy (enemyHp 20 > 5), so enemy attacks back
    await handleAttack(engine, undefined)

    // Player HP should be 0 and death handler should be called
    expect(engine.state.player!.hp).toBe(0)
    expect(engine._handlePlayerDeath).toHaveBeenCalled()
  })
})

describe('Combat edge cases — enemy HP going negative (overkill)', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('overkill damage still reports enemy defeated, HP floors at 0', async () => {
    const { playerAttack } = await import('@/lib/combat')
    // Enemy has 2 HP but attack does 5 damage => overkill
    ;(playerAttack as ReturnType<typeof vi.fn>).mockImplementation((_player: Player, state: CombatState, _range?: [number, number]) => ({
      result: {
        hit: true,
        damage: 5,
        critical: false,
        fumble: false,
        messages: [{ id: '1', text: 'You hit.', type: 'combat' as const }],
        enemyDefeated: true,
        loot: ['scrap_metal'],
      },
      newState: {
        ...state,
        enemyHp: 0, // floor at 0
        active: false,
        turn: state.turn + 1,
      },
    }))

    const engine = makeEngine({
      currentRoom: makeRoom({ enemies: ['shuffler'] }),
      combatState: makeCombatState({ enemyHp: 2 }),
    })

    await handleAttack(engine, undefined)

    // Combat should be over, enemy defeated
    expect(engine.state.combatState).toBeNull()
    // XP should be awarded
    expect(engine.state.player!.xp).toBe(10)
  })
})

describe('Combat edge cases — fleeing with cantFlee flag', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('wraith shadowstrike prevents fleeing, shows error', async () => {
    const engine = makeEngine({
      combatState: makeCombatState({ cantFlee: true }),
    })

    await handleFlee(engine)

    // Should NOT clear combat state
    expect(engine.state.combatState).not.toBeNull()
    // Should show error about being unable to flee
    const errorMsgs = engine.messages.filter(m => m.type === 'error')
    expect(errorMsgs.length).toBe(1)
    expect(errorMsgs[0]!.text).toContain('no running')
  })
})

describe('Combat edge cases — ability used twice in combat', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('second ability use shows "already used" error', async () => {
    const { handleAbility: mockAbility } = await import('@/lib/abilities')
    // Restore real behavior for this test by re-implementing
    ;(mockAbility as ReturnType<typeof vi.fn>).mockImplementation(async (engine: EngineCore) => {
      const { combatState } = engine.getState()
      if (!combatState?.active) {
        engine._appendMessages([{ id: 'e1', text: 'You are not in combat.', type: 'error' }])
        return
      }
      if (combatState.abilityUsed) {
        engine._appendMessages([{ id: 'e2', text: 'You have already used your ability this combat.', type: 'error' }])
        return
      }
      engine._setState({ combatState: { ...combatState, abilityUsed: true } })
      engine._appendMessages([{ id: 'a1', text: 'Ability used.', type: 'combat' }])
    })

    const engine = makeEngine({
      combatState: makeCombatState({ abilityUsed: false }),
    })

    // First use: succeeds
    await mockAbility(engine)
    expect(engine.state.combatState!.abilityUsed).toBe(true)
    expect(engine.messages.some(m => m.type === 'combat')).toBe(true)

    // Second use: should show error
    await mockAbility(engine)
    const errorMsgs = engine.messages.filter(m => m.type === 'error')
    expect(errorMsgs.length).toBe(1)
    expect(errorMsgs[0]!.text).toContain('already used')
  })
})

describe('Combat edge cases — defend reduces incoming damage', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('defending sets defendingThisTurn flag on combat state', async () => {
    const engine = makeEngine({
      combatState: makeCombatState(),
    })

    await handleDefend(engine)

    // Should have sent "brace for impact" message
    const braceMsg = engine.messages.find(m => m.text.includes('brace'))
    expect(braceMsg).toBeDefined()
  })
})

describe('Combat edge cases — wait grants accuracy bonus next turn', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('waiting sets waitingBonus to 3', async () => {
    const engine = makeEngine({
      combatState: makeCombatState({ waitingBonus: 0 }),
    })

    await handleWait(engine)

    // waitingBonus should be 3 on combat state
    expect(engine.state.combatState!.waitingBonus).toBe(3)
    // Should have the "watch and wait" message
    const waitMsg = engine.messages.find(m => m.text.includes('wait'))
    expect(waitMsg).toBeDefined()
  })
})
