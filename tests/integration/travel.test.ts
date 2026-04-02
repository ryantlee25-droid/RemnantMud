// ============================================================
// Integration tests for lib/actions/travel.ts
// ============================================================

import { describe, it, expect, vi, beforeEach } from 'vitest'
import type { GameState, Player, Room, GameMessage } from '@/types/game'
import type { EngineCore } from '@/lib/actions/types'

vi.mock('@/lib/world', async (importOriginal) => {
  const actual = await importOriginal<typeof import('@/lib/world')>()
  return {
    ...actual,
    getRoom: vi.fn(),
    markVisited: vi.fn().mockResolvedValue(undefined),
  }
})

vi.mock('@/lib/gameEngine', () => ({ getTimeOfDay: vi.fn(() => 'day') }))
vi.mock('@/lib/mapRenderer', () => ({ renderZoneMap: vi.fn(() => []) }))
vi.mock('@/lib/messages', () => ({
  msg: (text: string, type = 'narrative') => ({ id: 'test', text, type }),
  systemMsg: (text: string) => ({ id: 'test', text, type: 'system' }),
  errorMsg: (text: string) => ({ id: 'test', text, type: 'error' }),
}))
vi.mock('@/lib/richText', () => ({
  rt: {
    exit: (d: string) => d,
    item: (n: string) => n,
    enemy: (n: string) => n,
    npc: (n: string) => n,
    keyword: (k: string) => k,
  },
}))
vi.mock('@/data/items', () => ({ getItem: vi.fn(() => undefined) }))
vi.mock('@/data/enemies', () => ({ getEnemy: vi.fn(() => undefined) }))
vi.mock('@/data/npcs', () => ({ getNPC: vi.fn(() => undefined) }))

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
    id: 'cr_01_approach', name: 'Highway Junction — The Approach',
    description: 'Two highways meet here.', shortDescription: 'A junction.',
    zone: 'crossroads', difficulty: 1, visited: true,
    flags: { fastTravelWaypoint: true }, exits: {}, items: [], enemies: [], npcs: [],
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

const COVENANT_GATE: Room = {
  id: 'cv_01_main_gate', name: 'Covenant — Main Gate',
  description: 'Two school buses form the gate of Covenant.',
  shortDescription: 'The school bus gate of Covenant.',
  zone: 'covenant', difficulty: 1, visited: true,
  flags: { fastTravelWaypoint: true }, exits: { south: 'rr_12_covenant_outskirts' },
  items: [], enemies: [], npcs: [],
}

import { handleTravel, handleMap } from '@/lib/actions/travel'
import { getRoom } from '@/lib/world'

// ------------------------------------------------------------
// Tests
// ------------------------------------------------------------

describe('travel', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('travels to a valid discovered waypoint', async () => {
    vi.mocked(getRoom).mockResolvedValue(COVENANT_GATE)
    const engine = makeEngine()

    await handleTravel(engine, 'covenant')

    expect(engine.state.player?.currentRoomId).toBe('cv_01_main_gate')
    expect(engine.state.currentRoom?.id).toBe('cv_01_main_gate')
    const travelMsg = engine.messages.find(m => m.text.includes('You travel to'))
    expect(travelMsg).toBeDefined()
  })

  it('blocks travel to an undiscovered (unvisited) waypoint', async () => {
    vi.mocked(getRoom).mockResolvedValue({ ...COVENANT_GATE, visited: false })
    const engine = makeEngine()

    await handleTravel(engine, 'covenant')

    // Destination is filtered out because visited is false → no match
    const err = engine.messages.find(m => m.type === 'error')
    expect(err).toBeDefined()
    expect(err?.text).toContain('Unknown destination')
    expect(engine.state.player?.currentRoomId).toBe('cr_01_approach')
  })

  it('blocks travel while in combat', async () => {
    const engine = makeEngine({ combatState: { active: true } as GameState['combatState'] })

    await handleTravel(engine, 'covenant')

    const err = engine.messages.find(m => m.type === 'error')
    expect(err?.text).toContain('cannot travel while in combat')
    expect(engine.state.player?.currentRoomId).toBe('cr_01_approach')
  })

  it('blocks travel when not at a waypoint', async () => {
    const nonWaypoint = makeRoom({ flags: {} })
    const engine = makeEngine({ currentRoom: nonWaypoint })

    await handleTravel(engine, 'covenant')

    const err = engine.messages.find(m => m.type === 'error')
    expect(err?.text).toContain('waypoint')
    expect(engine.state.player?.currentRoomId).toBe('cr_01_approach')
  })

  it('shows error when no destination is given', async () => {
    const engine = makeEngine()

    await handleTravel(engine, undefined)

    const err = engine.messages.find(m => m.type === 'error')
    expect(err?.text).toContain('Travel where?')
  })

  it('advances actionsTaken by TRAVEL_COST (5) on successful travel', async () => {
    vi.mocked(getRoom).mockResolvedValue(COVENANT_GATE)
    const engine = makeEngine({ player: makePlayer({ actionsTaken: 10 }) })

    await handleTravel(engine, 'covenant')

    expect(engine.state.player?.actionsTaken).toBe(15)
  })

  it('shows full description when destination is unvisited on arrival', async () => {
    // First load (waypoint visited check): visited:true → added to discovered list
    // Second load (full room load for travel): visited:false → show full description
    let callCount = 0
    vi.mocked(getRoom).mockImplementation(async (id) => {
      if (id === 'cv_01_main_gate') {
        callCount++
        return callCount === 1
          ? COVENANT_GATE                        // waypoint filter: visited
          : { ...COVENANT_GATE, visited: false } // full load: unvisited
      }
      return null
    })
    const engine = makeEngine()

    await handleTravel(engine, 'covenant')

    const descMsg = engine.messages.find(m => m.text.includes('Two school buses'))
    expect(descMsg).toBeDefined()
  })

  it('shows short description when destination was already visited', async () => {
    vi.mocked(getRoom).mockResolvedValue(COVENANT_GATE) // visited: true
    const engine = makeEngine()

    await handleTravel(engine, 'covenant')

    const shortMsg = engine.messages.find(m => m.text.includes('The school bus gate'))
    expect(shortMsg).toBeDefined()
  })

  it('blocks travel if player cycle is below cycleGate', async () => {
    const gatedRoom = { ...COVENANT_GATE, cycleGate: 3 }
    vi.mocked(getRoom).mockResolvedValue(gatedRoom)
    const engine = makeEngine({ player: makePlayer({ cycle: 1 }) })

    await handleTravel(engine, 'covenant')

    const err = engine.messages.find(m => m.type === 'error')
    expect(err?.text).toContain('not ready')
    expect(engine.state.player?.currentRoomId).toBe('cr_01_approach')
  })

  it('handleMap shows no waypoints message when none are discovered', async () => {
    vi.mocked(getRoom).mockResolvedValue(null)
    const engine = makeEngine()

    await handleMap(engine)

    const sysMsg = engine.messages.find(m => m.text.includes('not discovered'))
    expect(sysMsg).toBeDefined()
  })

  it('handleMap lists discovered waypoints grouped by zone', async () => {
    vi.mocked(getRoom).mockImplementation(async (id) => {
      if (id === 'cr_01_approach') return makeRoom({ visited: true })
      return null
    })
    const engine = makeEngine()

    await handleMap(engine)

    const waypointLine = engine.messages.find(m => m.text.includes('Crossroads'))
    expect(waypointLine).toBeDefined()
  })
})
