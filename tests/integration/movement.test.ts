// ============================================================
// Integration tests for lib/actions/movement.ts
// ============================================================

import { describe, it, expect, vi, beforeEach } from 'vitest'
import type { GameState, Player, Room, GameMessage } from '@/types/game'
import type { EngineCore } from '@/lib/actions/types'

// ------------------------------------------------------------
// Mock external modules before importing handlers
// ------------------------------------------------------------

vi.mock('@/lib/world', async (importOriginal) => {
  const actual = await importOriginal<typeof import('@/lib/world')>()
  return {
    ...actual,
    getRoom: vi.fn(),
    markVisited: vi.fn().mockResolvedValue(undefined),
    updateRoomFlags: vi.fn().mockResolvedValue(undefined),
    updateRoomItems: vi.fn().mockResolvedValue(undefined),
  }
})

vi.mock('@/lib/gameEngine', () => ({ getTimeOfDay: vi.fn(() => 'day') }))
vi.mock('@/lib/fear', () => ({ fearCheck: vi.fn(() => ({ messages: [] })) }))
vi.mock('@/lib/echoes', () => ({ getDeathRoomNarration: vi.fn(() => null) }))
vi.mock('@/data/items', () => ({ getItem: vi.fn(() => undefined) }))
vi.mock('@/data/enemies', () => ({ getEnemy: vi.fn(() => undefined) }))
vi.mock('@/data/npcs', () => ({ getNPC: vi.fn(() => undefined) }))
vi.mock('@/lib/skillBonus', () => ({ getStatForSkill: vi.fn(() => null) }))
vi.mock('@/lib/inventory', () => ({ groupAndFormatItems: vi.fn(() => []) }))
vi.mock('@/lib/richText', () => ({
  rt: {
    exit: (d: string) => d,
    item: (n: string) => n,
    enemy: (n: string) => n,
    npc: (n: string) => n,
    keyword: (k: string) => k,
  },
}))
vi.mock('@/lib/messages', () => ({
  msg: (text: string, type = 'narrative') => ({ id: 'test', text, type }),
  combatMsg: (text: string) => ({ id: 'test', text, type: 'combat' }),
  errorMsg: (text: string) => ({ id: 'test', text, type: 'error' }),
}))

// ------------------------------------------------------------
// Helpers
// ------------------------------------------------------------

function makePlayer(overrides: Partial<Player> = {}): Player {
  return {
    id: 'p1', name: 'Tester', characterClass: 'enforcer',
    vigor: 5, grit: 5, reflex: 5, wits: 5, presence: 5, shadow: 5,
    hp: 10, maxHp: 10, currentRoomId: 'cr_01_approach', worldSeed: 1,
    xp: 0, level: 1, actionsTaken: 0, isDead: false, cycle: 1, totalDeaths: 0,
    ...overrides,
  }
}

function makeRoom(overrides: Partial<Room> = {}): Room {
  return {
    id: 'cr_01_approach', name: 'Test Room', description: 'A test room.',
    shortDescription: 'Short.', zone: 'crossroads', difficulty: 1,
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
    roomsExplored: 0,
    endingTriggered: false,
    endingChoice: null,
    activeBuffs: [],
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

import { handleMove, handleLook, exitsLine } from '@/lib/actions/movement'
import { getRoom } from '@/lib/world'
import { CROSSROADS_ROOMS } from '@/data/rooms/crossroads'
import { getRoomDefinition } from '@/lib/world'

// ------------------------------------------------------------
// Tests
// ------------------------------------------------------------

describe('movement', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('moving to a valid exit changes current room', async () => {
    const startRoom = makeRoom({ exits: { north: 'cr_02_gate' } })
    const destRoom = makeRoom({ id: 'cr_02_gate', name: 'The Gate', description: 'Gate desc.', shortDescription: 'Gate.' })
    vi.mocked(getRoom).mockResolvedValue(destRoom)

    const engine = makeEngine({ currentRoom: startRoom })
    await handleMove(engine, 'north')

    expect(engine.state.player?.currentRoomId).toBe('cr_02_gate')
    expect(engine.state.currentRoom?.id).toBe('cr_02_gate')
  })

  it('moving to an invalid direction shows error message', async () => {
    const engine = makeEngine({ currentRoom: makeRoom({ exits: {} }) })
    await handleMove(engine, 'north')

    const errorMsg = engine.messages.find(m => m.type === 'error')
    expect(errorMsg).toBeDefined()
    expect(errorMsg?.text).toContain('north')
  })

  it('room description is shown on entering a new (unvisited) room', async () => {
    const startRoom = makeRoom({ exits: { north: 'cr_02_gate' } })
    const destRoom = makeRoom({ id: 'cr_02_gate', name: 'The Gate', description: 'You see a massive gate.', shortDescription: 'The gate.', visited: false })
    vi.mocked(getRoom).mockResolvedValue(destRoom)

    const engine = makeEngine({ currentRoom: startRoom })
    await handleMove(engine, 'north')

    const descMsg = engine.messages.find(m => m.text.includes('You see a massive gate.'))
    expect(descMsg).toBeDefined()
  })

  it('exits are listed in look/room description', () => {
    const room = makeRoom({ exits: { north: 'cr_02_gate', east: 'rr_01_west_approach' } })
    const line = exitsLine(room)

    expect(line).toContain('north')
    expect(line).toContain('east')
  })

  it('locked exits prevent movement without the key', async () => {
    const startRoom = makeRoom({
      exits: { north: 'cr_02_gate' },
      richExits: { north: { destination: 'cr_02_gate', locked: true, lockedBy: 'gate_key' } },
    })
    const engine = makeEngine({ currentRoom: startRoom, inventory: [] })
    await handleMove(engine, 'north')

    // Should not have moved
    expect(engine.state.player?.currentRoomId).toBe('cr_01_approach')
    const lockMsg = engine.messages.find(m => m.text.toLowerCase().includes('locked'))
    expect(lockMsg).toBeDefined()
  })

  it('crossroads zone has correct bidirectional connections', () => {
    // cr_01_approach exits north to cr_02_gate; cr_02_gate exits south back
    const approach = getRoomDefinition('cr_01_approach')
    const gate = getRoomDefinition('cr_02_gate')

    expect(approach).not.toBeNull()
    expect(gate).not.toBeNull()
    expect(approach!.exits.north).toBe('cr_02_gate')
    expect(gate!.exits.south).toBe('cr_01_approach')

    // Crossroads approach also connects to real adjacent zone rooms
    expect(approach!.exits.east).toBe('rr_01_west_approach')
    expect(approach!.exits.south).toBe('br_01_canyon_mouth')
    expect(approach!.exits.west).toBe('du_01_dust_edge')

    // Each neighbor should exist in its own zone
    expect(CROSSROADS_ROOMS.find(r => r.id === 'cr_02_gate')).toBeDefined()
  })
})
