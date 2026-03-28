// ============================================================
// Integration tests for personal loss echo system
// Rooms with personalLossEchoes display echoes matching
// the player's personalLossType.
// ============================================================

import { describe, it, expect, vi, beforeEach } from 'vitest'
import type { GameState, Player, Room, GameMessage, PersonalLossType } from '@/types/game'
import type { EngineCore } from '@/lib/actions/types'

// ------------------------------------------------------------
// Mock external modules before importing handlers
// ------------------------------------------------------------

vi.mock('@/lib/world', () => ({
  getRoom: vi.fn(),
  canMove: vi.fn().mockReturnValue(true),
  getExits: vi.fn().mockReturnValue([]),
  markVisited: vi.fn().mockResolvedValue(undefined),
  updateRoomItems: vi.fn().mockResolvedValue(undefined),
  updateRoomFlags: vi.fn().mockResolvedValue(undefined),
}))

vi.mock('@/data/enemies', () => ({
  getEnemy: vi.fn(() => undefined),
}))

vi.mock('@/data/items', () => ({
  getItem: vi.fn(() => undefined),
}))

vi.mock('@/data/npcs', () => ({
  getNPC: vi.fn(() => undefined),
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

// Import handleMove after mocks
import { handleMove } from '@/lib/actions/movement'
import { getRoom } from '@/lib/world'

// ------------------------------------------------------------
// Personal loss echo room data
// ------------------------------------------------------------

const ECHO_ROOM: Room = makeRoom({
  id: 'room_2',
  name: 'Echo Room',
  description: 'A quiet place that stirs memories.',
  shortDescription: 'A quiet place.',
  exits: {},
  personalLossEchoes: {
    child: 'You see a small shoe half-buried in the dust. Your throat tightens.',
    partner: 'A faded photograph curls in the wind. Two faces. One is yours.',
    community: 'The empty houses stare like skull sockets. Everyone you knew lived here once.',
    identity: 'A mirror fragment catches your face. You don\'t recognize it anymore.',
    promise: 'The words you swore echo back from the walls, hollow and accusing.',
  },
})

// ------------------------------------------------------------
// Tests
// ------------------------------------------------------------

describe('Personal loss echo system', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('room with personalLossEchoes displays echo for matching loss type "child"', async () => {
    vi.mocked(getRoom).mockResolvedValue(ECHO_ROOM)

    const engine = makeEngine({
      player: makePlayer({
        personalLossType: 'child',
        currentRoomId: 'room_1',
      }),
      currentRoom: makeRoom({
        id: 'room_1',
        exits: { north: 'room_2' },
      }),
    })

    await handleMove(engine, 'north')

    const echoMsg = engine.messages.find(m => m.text.includes('small shoe'))
    expect(echoMsg).toBeDefined()
  })

  it('room with personalLossEchoes displays echo for matching loss type "partner"', async () => {
    vi.mocked(getRoom).mockResolvedValue(ECHO_ROOM)

    const engine = makeEngine({
      player: makePlayer({
        personalLossType: 'partner',
        currentRoomId: 'room_1',
      }),
      currentRoom: makeRoom({
        id: 'room_1',
        exits: { north: 'room_2' },
      }),
    })

    await handleMove(engine, 'north')

    const echoMsg = engine.messages.find(m => m.text.includes('faded photograph'))
    expect(echoMsg).toBeDefined()
  })

  it('room with personalLossEchoes displays echo for matching loss type "community"', async () => {
    vi.mocked(getRoom).mockResolvedValue(ECHO_ROOM)

    const engine = makeEngine({
      player: makePlayer({
        personalLossType: 'community',
        currentRoomId: 'room_1',
      }),
      currentRoom: makeRoom({
        id: 'room_1',
        exits: { north: 'room_2' },
      }),
    })

    await handleMove(engine, 'north')

    const echoMsg = engine.messages.find(m => m.text.includes('empty houses'))
    expect(echoMsg).toBeDefined()
  })

  it('room with personalLossEchoes displays echo for matching loss type "identity"', async () => {
    vi.mocked(getRoom).mockResolvedValue(ECHO_ROOM)

    const engine = makeEngine({
      player: makePlayer({
        personalLossType: 'identity',
        currentRoomId: 'room_1',
      }),
      currentRoom: makeRoom({
        id: 'room_1',
        exits: { north: 'room_2' },
      }),
    })

    await handleMove(engine, 'north')

    const echoMsg = engine.messages.find(m => m.text.includes('mirror fragment'))
    expect(echoMsg).toBeDefined()
  })

  it('room with personalLossEchoes displays echo for matching loss type "promise"', async () => {
    vi.mocked(getRoom).mockResolvedValue(ECHO_ROOM)

    const engine = makeEngine({
      player: makePlayer({
        personalLossType: 'promise',
        currentRoomId: 'room_1',
      }),
      currentRoom: makeRoom({
        id: 'room_1',
        exits: { north: 'room_2' },
      }),
    })

    await handleMove(engine, 'north')

    const echoMsg = engine.messages.find(m => m.text.includes('words you swore'))
    expect(echoMsg).toBeDefined()
  })

  it('all 5 loss types have distinct echoes', () => {
    const echoes = ECHO_ROOM.personalLossEchoes!
    const types: PersonalLossType[] = ['child', 'partner', 'community', 'identity', 'promise']

    // All 5 types are present
    for (const t of types) {
      expect(echoes[t]).toBeDefined()
      expect(echoes[t]!.length).toBeGreaterThan(0)
    }

    // All echoes are distinct
    const echoTexts = types.map(t => echoes[t])
    const unique = new Set(echoTexts)
    expect(unique.size).toBe(5)
  })

  it('room without personalLossEchoes does not crash', async () => {
    const plainRoom = makeRoom({
      id: 'room_2',
      name: 'Plain Room',
      description: 'Nothing special here.',
      shortDescription: 'Plain.',
      // No personalLossEchoes
    })
    vi.mocked(getRoom).mockResolvedValue(plainRoom)

    const engine = makeEngine({
      player: makePlayer({
        personalLossType: 'child',
        currentRoomId: 'room_1',
      }),
      currentRoom: makeRoom({
        id: 'room_1',
        exits: { north: 'room_2' },
      }),
    })

    // Should not throw
    await handleMove(engine, 'north')

    // No echo message should be present (look for the child echo text)
    const echoMsg = engine.messages.find(m => m.text.includes('small shoe'))
    expect(echoMsg).toBeUndefined()
  })

  it('player without a personalLossType sees no echo even if room has echoes', async () => {
    vi.mocked(getRoom).mockResolvedValue(ECHO_ROOM)

    const engine = makeEngine({
      player: makePlayer({
        personalLossType: undefined,
        currentRoomId: 'room_1',
      }),
      currentRoom: makeRoom({
        id: 'room_1',
        exits: { north: 'room_2' },
      }),
    })

    await handleMove(engine, 'north')

    // None of the echo texts should appear
    const echoTexts = ['small shoe', 'faded photograph', 'empty houses', 'mirror fragment', 'words you swore']
    for (const txt of echoTexts) {
      const found = engine.messages.find(m => m.text.includes(txt))
      expect(found).toBeUndefined()
    }
  })
})
