// ============================================================
// Integration tests for level-up system
// Tests XP thresholds, multi-level gains, maxHp increases
// ============================================================

import { describe, it, expect, vi, beforeEach } from 'vitest'
import type { GameState, Player, Room, GameMessage } from '@/types/game'
import type { EngineCore } from '@/lib/actions/types'
import { XP_THRESHOLDS, xpForNextLevel } from '@/lib/gameEngine'

// ------------------------------------------------------------
// Helpers (matches existing test patterns)
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

// ------------------------------------------------------------
// XP threshold helpers
// ------------------------------------------------------------

describe('xpForNextLevel', () => {
  it('returns 50 for level 1 (next level is 2)', () => {
    expect(xpForNextLevel(1)).toBe(50)
  })

  it('returns 150 for level 2 (next level is 3)', () => {
    expect(xpForNextLevel(2)).toBe(150)
  })

  it('returns null at max level (10)', () => {
    expect(xpForNextLevel(10)).toBeNull()
  })

  it('returns correct threshold for every defined level', () => {
    expect(xpForNextLevel(1)).toBe(50)
    expect(xpForNextLevel(2)).toBe(150)
    expect(xpForNextLevel(3)).toBe(350)
    expect(xpForNextLevel(4)).toBe(600)
    expect(xpForNextLevel(5)).toBe(1000)
    expect(xpForNextLevel(6)).toBe(1500)
    expect(xpForNextLevel(7)).toBe(2200)
    expect(xpForNextLevel(8)).toBe(3100)
    expect(xpForNextLevel(9)).toBe(4200)
  })
})

// ------------------------------------------------------------
// _checkLevelUp on the real GameEngine
// We test the actual GameEngine._checkLevelUp method by
// constructing a minimal GameEngine and manipulating its state.
// ------------------------------------------------------------

// We need the real GameEngine class to test _checkLevelUp properly
import { GameEngine } from '@/lib/gameEngine'

// Mock Supabase so GameEngine can be instantiated
vi.mock('@/lib/supabase', () => ({
  createSupabaseBrowserClient: () => ({
    from: vi.fn(() => ({
      update: vi.fn().mockReturnThis(),
      insert: vi.fn().mockReturnThis(),
      select: vi.fn().mockReturnThis(),
      eq: vi.fn().mockReturnThis(),
      maybeSingle: vi.fn().mockResolvedValue({ data: null, error: null }),
    })),
    auth: { getUser: vi.fn().mockResolvedValue({ data: { user: null }, error: null }) },
  }),
}))

vi.mock('@/lib/world', () => ({
  getRoom: vi.fn(),
  markVisited: vi.fn(),
  persistWorld: vi.fn(),
  updateRoomItems: vi.fn(),
  updateRoomFlags: vi.fn(),
}))

vi.mock('@/lib/inventory', () => ({
  getInventory: vi.fn().mockResolvedValue([]),
}))

vi.mock('@/data/rooms/index', () => ({
  ALL_ROOMS: [{ id: 'room_1', name: 'Test', description: 'Test', shortDescription: 'T', zone: 'crossroads', difficulty: 1, visited: false, flags: {}, exits: {}, items: [], enemies: [], npcs: [] }],
}))

describe('GameEngine._checkLevelUp', () => {
  let engine: GameEngine

  beforeEach(() => {
    vi.clearAllMocks()
    engine = new GameEngine()
  })

  it('levels up from 1 to 2 when XP reaches threshold (100)', () => {
    const player = makePlayer({ xp: 100, level: 1, hp: 20, maxHp: 20 })
    engine._setState({ player })

    engine._checkLevelUp()

    const updated = engine.getState().player!
    expect(updated.level).toBe(2)
    expect(updated.maxHp).toBe(22) // +2 maxHp per level
    expect(updated.hp).toBe(22)    // healed by +2
  })

  it('player at 95 XP gains 10 XP then levels up when threshold is 100', () => {
    // Simulate gaining XP first, then checking
    const player = makePlayer({ xp: 105, level: 1, hp: 18, maxHp: 20 })
    engine._setState({ player })

    engine._checkLevelUp()

    const updated = engine.getState().player!
    expect(updated.level).toBe(2)
    expect(updated.maxHp).toBe(22)
    // HP healed by 2, capped at new maxHp
    expect(updated.hp).toBe(20)
  })

  it('gains enough XP to skip a level — both levels awarded', () => {
    // XP at 500 should reach level 2 (100), level 3 (250), and level 4 (500)
    const player = makePlayer({ xp: 500, level: 1, hp: 20, maxHp: 20 })
    engine._setState({ player })

    engine._checkLevelUp()

    const updated = engine.getState().player!
    expect(updated.level).toBe(4)        // jumped from 1 to 4
    expect(updated.maxHp).toBe(26)       // 20 + 2*3 = 26
    expect(updated.hp).toBe(26)          // healed +2 each level
  })

  it('level up increases maxHp by 2', () => {
    const player = makePlayer({ xp: 100, level: 1, hp: 20, maxHp: 20 })
    engine._setState({ player })

    engine._checkLevelUp()

    const updated = engine.getState().player!
    expect(updated.maxHp - 20).toBe(2) // exactly +2
  })

  it('player at max level (10) gains XP without crash or level up', () => {
    const player = makePlayer({ xp: 99999, level: 10, hp: 40, maxHp: 40 })
    engine._setState({ player })

    // Should not throw
    engine._checkLevelUp()

    const updated = engine.getState().player!
    expect(updated.level).toBe(10)
    expect(updated.maxHp).toBe(40)
  })

  it('does nothing when XP is below threshold', () => {
    const player = makePlayer({ xp: 30, level: 1, hp: 20, maxHp: 20 })
    engine._setState({ player })

    engine._checkLevelUp()

    const updated = engine.getState().player!
    expect(updated.level).toBe(1)
    expect(updated.maxHp).toBe(20)
  })

  it('does nothing when player is null', () => {
    engine._setState({ player: null })

    // Should not throw
    expect(() => engine._checkLevelUp()).not.toThrow()
  })
})

// ------------------------------------------------------------
// XP display format
// ------------------------------------------------------------

describe('XP display format', () => {
  it('shows correct format for current/threshold', () => {
    const currentXp = 75
    const level = 1
    const threshold = xpForNextLevel(level)
    expect(threshold).not.toBeNull()
    const display = `${currentXp}/${threshold}`
    expect(display).toBe('75/50')
  })

  it('shows XP without threshold at max level', () => {
    const currentXp = 5500
    const level = 10
    const threshold = xpForNextLevel(level)
    expect(threshold).toBeNull()
    const display = threshold ? `${currentXp}/${threshold}` : `${currentXp} (max)`
    expect(display).toBe('5500 (max)')
  })
})
