// ============================================================
// Integration tests for lib/actions/survival.ts
// rest, drink, camp
// ============================================================

import { describe, it, expect, vi, beforeEach } from 'vitest'
import type { GameState, Player, Room, Enemy, CombatState, InventoryItem, GameMessage } from '@/types/game'
import type { EngineCore } from '@/lib/actions/types'

// ------------------------------------------------------------
// Helpers
// ------------------------------------------------------------

function makePlayer(overrides: Partial<Player> = {}): Player {
  return {
    id: 'p1', name: 'Tester', characterClass: 'enforcer',
    vigor: 10, grit: 8, reflex: 6, wits: 5, presence: 4, shadow: 3,
    hp: 10, maxHp: 20, currentRoomId: 'room_1', worldSeed: 1,
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
    adjustReputation: vi.fn().mockResolvedValue(undefined),
    setQuestFlag: vi.fn().mockResolvedValue(undefined),
  }
}

// Import handlers
import { handleRest, handleCamp, handleDrink } from '@/lib/actions/survival'

// ------------------------------------------------------------
// handleRest
// ------------------------------------------------------------

describe('handleRest', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('heals the player in a safeRest room', async () => {
    const engine = makeEngine({
      player: makePlayer({ hp: 10, maxHp: 20 }),
      currentRoom: makeRoom({ flags: { safeRest: true } }),
    })

    await handleRest(engine)

    // Player should have gained HP
    expect(engine.state.player!.hp).toBeGreaterThan(10)
    expect(engine.state.player!.hp).toBeLessThanOrEqual(20)
    // Should have a recovery message
    const recoveryMsg = engine.messages.find(m => m.text.includes('recover'))
    expect(recoveryMsg).toBeDefined()
    // Should save
    expect(engine._savePlayer).toHaveBeenCalled()
  })

  it('refuses to rest in an unsafe room', async () => {
    const engine = makeEngine({
      currentRoom: makeRoom({ flags: {} }),
    })

    await handleRest(engine)

    // HP unchanged
    expect(engine.state.player!.hp).toBe(10)
    // Should get a narrative message about being exposed
    const msg = engine.messages.find(m => m.text.includes('exposed'))
    expect(msg).toBeDefined()
  })

  it('refuses to rest while in combat', async () => {
    const enemy: Enemy = {
      id: 'shuffler', name: 'Shuffler', description: 'test',
      hp: 5, maxHp: 5, attack: 2, defense: 8, damage: [1, 3], xp: 10, loot: [],
    }
    const engine = makeEngine({
      currentRoom: makeRoom({ flags: { safeRest: true } }),
      combatState: { enemy, enemyHp: 5, playerGoesFirst: true, turn: 1, active: true },
    })

    await handleRest(engine)

    expect(engine.state.player!.hp).toBe(10)
    const errorMsgs = engine.messages.filter(m => m.type === 'error')
    expect(errorMsgs.length).toBe(1)
    expect(errorMsgs[0]!.text).toContain('combat')
  })
})

// ------------------------------------------------------------
// handleDrink
// ------------------------------------------------------------

describe('handleDrink', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('heals the player at a water source', async () => {
    const engine = makeEngine({
      player: makePlayer({ hp: 10, maxHp: 20 }),
      currentRoom: makeRoom({ flags: { waterSource: true } }),
    })

    await handleDrink(engine)

    expect(engine.state.player!.hp).toBeGreaterThan(10)
    expect(engine.state.player!.hp).toBeLessThanOrEqual(20)
    const recoveryMsg = engine.messages.find(m => m.text.includes('recover'))
    expect(recoveryMsg).toBeDefined()
  })

  it('refuses when there is no water source', async () => {
    const engine = makeEngine({
      currentRoom: makeRoom({ flags: {} }),
    })

    await handleDrink(engine)

    expect(engine.state.player!.hp).toBe(10)
    const msg = engine.messages.find(m => m.text.includes('no water'))
    expect(msg).toBeDefined()
  })

  it('refuses to drink while in combat', async () => {
    const enemy: Enemy = {
      id: 'shuffler', name: 'Shuffler', description: 'test',
      hp: 5, maxHp: 5, attack: 2, defense: 8, damage: [1, 3], xp: 10, loot: [],
    }
    const engine = makeEngine({
      currentRoom: makeRoom({ flags: { waterSource: true } }),
      combatState: { enemy, enemyHp: 5, playerGoesFirst: true, turn: 1, active: true },
    })

    await handleDrink(engine)

    expect(engine.state.player!.hp).toBe(10)
    const errorMsgs = engine.messages.filter(m => m.type === 'error')
    expect(errorMsgs.length).toBe(1)
  })
})

// ------------------------------------------------------------
// handleCamp
// ------------------------------------------------------------

describe('handleCamp', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('heals the player when campfire is allowed and fire supplies are available', async () => {
    const fireKit: InventoryItem = {
      id: 'inv_fire', playerId: 'p1', itemId: 'fire_kit',
      item: { id: 'fire_kit', name: 'Fire Kit', description: 'Starts fires.', type: 'junk', weight: 1, value: 3 },
      quantity: 1, equipped: false,
    }
    const engine = makeEngine({
      player: makePlayer({ hp: 10, maxHp: 20 }),
      currentRoom: makeRoom({ flags: { campfireAllowed: true } }),
      inventory: [fireKit],
    })

    await handleCamp(engine)

    expect(engine.state.player!.hp).toBeGreaterThan(10)
    const recoveryMsg = engine.messages.find(m => m.text.includes('recover'))
    expect(recoveryMsg).toBeDefined()
    expect(engine._savePlayer).toHaveBeenCalled()
  })

  it('refuses when no fire supplies', async () => {
    const engine = makeEngine({
      currentRoom: makeRoom({ flags: { campfireAllowed: true } }),
      inventory: [],
    })

    await handleCamp(engine)

    expect(engine.state.player!.hp).toBe(10)
    const msg = engine.messages.find(m => m.text.includes('nothing to start one'))
    expect(msg).toBeDefined()
  })

  it('refuses when campfire not allowed', async () => {
    const engine = makeEngine({
      currentRoom: makeRoom({ flags: {} }),
    })

    await handleCamp(engine)

    expect(engine.state.player!.hp).toBe(10)
    const msg = engine.messages.find(m => m.text.includes('no good place'))
    expect(msg).toBeDefined()
  })
})
