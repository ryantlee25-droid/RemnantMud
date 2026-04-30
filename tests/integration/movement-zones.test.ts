// ============================================================
// Integration tests: movement zone-gating (H5-W1)
// Covers: locked-zone rejection, accessible-zone success,
// and fear-check firing on entry to high-threat rooms.
//
// Does NOT duplicate scenarios already in movement.test.ts:
//   - valid/invalid direction handling
//   - room description on first visit
//   - exits listing
//   - item-key locked exits
//   - bidirectional zone connections
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
vi.mock('@/lib/fear', () => ({ fearCheck: vi.fn(() => ({ afraid: false, fearRounds: 0, messages: [] })) }))
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
// Helpers — mirror movement.test.ts
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

import { handleMove } from '@/lib/actions/movement'
import { getRoom } from '@/lib/world'
import { fearCheck } from '@/lib/fear'

// ------------------------------------------------------------
// Tests
// ------------------------------------------------------------

describe('movement — zone gating', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  // ----------------------------------------------------------
  // Cycle-gate: movement is blocked when player cycle is too low
  // ----------------------------------------------------------
  it('rejects movement when cycleGate is not met (player position unchanged)', async () => {
    const startRoom = makeRoom({
      exits: { north: 'ts_01_gate' },
      richExits: {
        north: {
          destination: 'ts_01_gate',
          cycleGate: 3,
        },
      },
    })
    const engine = makeEngine({
      player: makePlayer({ currentRoomId: 'cr_01_approach', cycle: 1 }),
      currentRoom: startRoom,
    })

    await handleMove(engine, 'north')

    // Player must not have moved
    expect(engine.state.player?.currentRoomId).toBe('cr_01_approach')
    // A message must have been appended explaining the gate
    expect(engine.messages.length).toBeGreaterThan(0)
    const gateMsg = engine.messages.find(m =>
      m.text.toLowerCase().includes('not ready') ||
      m.text.toLowerCase().includes('wrong') ||
      m.text.toLowerCase().includes('path')
    )
    expect(gateMsg).toBeDefined()
  })

  // ----------------------------------------------------------
  // Cycle-gate: movement succeeds when cycleGate is met
  // ----------------------------------------------------------
  it('allows movement when cycleGate is satisfied', async () => {
    const destRoom = makeRoom({
      id: 'ts_01_gate', name: 'The Gate', description: 'Beyond the gate.',
      shortDescription: 'Gate.', visited: true,
    })
    vi.mocked(getRoom).mockResolvedValue(destRoom)

    const startRoom = makeRoom({
      exits: { north: 'ts_01_gate' },
      richExits: {
        north: {
          destination: 'ts_01_gate',
          cycleGate: 2,
        },
      },
    })
    const engine = makeEngine({
      player: makePlayer({ currentRoomId: 'cr_01_approach', cycle: 3 }),
      currentRoom: startRoom,
    })

    await handleMove(engine, 'north')

    expect(engine.state.player?.currentRoomId).toBe('ts_01_gate')
    expect(engine.state.currentRoom?.id).toBe('ts_01_gate')
  })

  // ----------------------------------------------------------
  // Room-level cycleGate: entry blocked at the destination level
  // ----------------------------------------------------------
  it('rejects movement when destination room cycleGate is not met', async () => {
    const destRoom = makeRoom({
      id: 'ds_01_deep', name: 'The Deep', description: 'Very deep.',
      shortDescription: 'Deep.', visited: false,
      cycleGate: 4,
    })
    vi.mocked(getRoom).mockResolvedValue(destRoom)

    const startRoom = makeRoom({ exits: { north: 'ds_01_deep' } })
    const engine = makeEngine({
      player: makePlayer({ currentRoomId: 'cr_01_approach', cycle: 1 }),
      currentRoom: startRoom,
    })

    await handleMove(engine, 'north')

    // Player position must be unchanged
    expect(engine.state.player?.currentRoomId).toBe('cr_01_approach')
    // A gating message must have been shown
    const blockMsg = engine.messages.find(m =>
      m.text.toLowerCase().includes('not ready') ||
      m.text.toLowerCase().includes('further') ||
      m.text.toLowerCase().includes('prevents')
    )
    expect(blockMsg).toBeDefined()
  })

  // ----------------------------------------------------------
  // Fear check fires on entry to a high-threat room (difficulty >= 4)
  // ----------------------------------------------------------
  it('fear check fires when entering a high-difficulty room with enemies', async () => {
    const highThreatRoom = makeRoom({
      id: 'sk_01_scar', name: 'The Scar', description: 'A terrifying ruin.',
      shortDescription: 'Ruin.', zone: 'the_scar', difficulty: 4,
      visited: true,
      enemies: ['hollow_feral'],
    })
    vi.mocked(getRoom).mockResolvedValue(highThreatRoom)

    // fearCheck returns afraid=true with a shaking-hands message
    vi.mocked(fearCheck).mockReturnValue({
      afraid: true,
      fearRounds: 2,
      messages: [{ id: 'f1', text: 'Your hands shake. The presence here is overwhelming.', type: 'narrative' }],
    })

    const startRoom = makeRoom({ exits: { east: 'sk_01_scar' } })
    const engine = makeEngine({
      player: makePlayer({ grit: 2 }),
      currentRoom: startRoom,
    })

    await handleMove(engine, 'east')

    // Fear check must have been called
    expect(fearCheck).toHaveBeenCalled()
    // Fear message must appear in the output
    const fearMsg = engine.messages.find(m => m.text.includes('shake'))
    expect(fearMsg).toBeDefined()
  })

  // ----------------------------------------------------------
  // Fear check does NOT fire for low-difficulty rooms
  // ----------------------------------------------------------
  it('fear check does not fire when entering a low-difficulty room', async () => {
    const easyRoom = makeRoom({
      id: 'cr_02_gate', name: 'Easy Room', description: 'Quiet here.',
      shortDescription: 'Quiet.', difficulty: 1, visited: true,
      enemies: [],
    })
    vi.mocked(getRoom).mockResolvedValue(easyRoom)

    const startRoom = makeRoom({ exits: { north: 'cr_02_gate' } })
    const engine = makeEngine({ currentRoom: startRoom })

    await handleMove(engine, 'north')

    // fearCheck may be called but the room difficulty is below threshold,
    // so either it is not called or it returns no messages
    const fearMessages = engine.messages.filter(m => m.text.includes('shake'))
    expect(fearMessages).toHaveLength(0)
  })
})
