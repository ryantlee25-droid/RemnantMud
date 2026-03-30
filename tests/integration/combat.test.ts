// ============================================================
// Integration tests for lib/actions/combat.ts
// ============================================================

import { describe, it, expect, vi, beforeEach } from 'vitest'
import type { GameState, Player, Room, Enemy, CombatState, InventoryItem, GameMessage } from '@/types/game'
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

// Import handlers after mocks are registered
import { handleAttack, handleFlee } from '@/lib/actions/combat'

// ------------------------------------------------------------
// Tests
// ------------------------------------------------------------

describe('handleAttack', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('starts combat and resolves a full attack round when enemy is in room', async () => {
    const engine = makeEngine({
      currentRoom: makeRoom({ enemies: ['shuffler'] }),
    })

    await handleAttack(engine, 'shuffler')

    // Combat should have been initiated
    expect(engine.messages.length).toBeGreaterThan(0)
    // Should contain a combat-related message
    const hasCombatMsg = engine.messages.some(m => m.type === 'combat')
    expect(hasCombatMsg).toBe(true)
  })

  it('enemy takes damage and drops loot on kill', async () => {
    // Enemy has 5 HP, playerAttack does 5 damage => defeated
    // Use chance: 1.0 to guarantee loot drop (handleEnemyDefeated re-rolls loot)
    const enemy: Enemy = {
      id: 'shuffler', name: 'Shuffler', description: 'A shambling corpse.',
      hp: 5, maxHp: 5, attack: 2, defense: 8, damage: [1, 3],
      xp: 10, loot: [{ itemId: 'scrap_metal', chance: 1.0 }],
    }
    const combatState: CombatState = {
      enemy, enemyHp: 5, playerGoesFirst: true, turn: 1, active: true,
      playerConditions: [], enemyConditions: [], abilityUsed: false,
      defendingThisTurn: false, waitingBonus: 0,
    }
    const engine = makeEngine({
      currentRoom: makeRoom({ enemies: ['shuffler'] }),
      combatState,
    })

    await handleAttack(engine, undefined)

    // Enemy should be defeated: combatState set to null
    expect(engine.state.combatState).toBeNull()
    // XP should be awarded
    expect(engine.state.player!.xp).toBe(10)
    // Loot message should be present (scrap_metal)
    const lootMsg = engine.messages.find(m => m.text.includes('Scrap Metal'))
    expect(lootMsg).toBeDefined()
  })

  it('shows error when no enemies are present', async () => {
    const engine = makeEngine({
      currentRoom: makeRoom({ enemies: [] }),
    })

    await handleAttack(engine, 'shuffler')

    const errorMsgs = engine.messages.filter(m => m.type === 'error')
    expect(errorMsgs.length).toBe(1)
    expect(errorMsgs[0]!.text).toContain('nothing to attack')
  })
})

describe('handleFlee', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('flees combat successfully', async () => {
    const enemy: Enemy = {
      id: 'shuffler', name: 'Shuffler', description: 'test',
      hp: 5, maxHp: 5, attack: 2, defense: 8, damage: [1, 3],
      xp: 10, loot: [],
    }
    const engine = makeEngine({
      combatState: { enemy, enemyHp: 5, playerGoesFirst: true, turn: 1, active: true, playerConditions: [], enemyConditions: [], abilityUsed: false, defendingThisTurn: false, waitingBonus: 0 },
    })

    await handleFlee(engine)

    expect(engine.state.combatState).toBeNull()
    expect(engine.messages.some(m => m.text.includes('flee'))).toBe(true)
  })

  it('shows error when not in combat', async () => {
    const engine = makeEngine({ combatState: null })

    await handleFlee(engine)

    const errorMsgs = engine.messages.filter(m => m.type === 'error')
    expect(errorMsgs.length).toBe(1)
    expect(errorMsgs[0]!.text).toContain('not in combat')
  })
})
