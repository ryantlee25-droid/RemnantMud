// ============================================================
// Integration tests: _savePlayer() retry path (H5-W8)
// Covers:
//   - on first save failure, refreshSession is called
//   - the retry attempt fires (second update call)
//   - if retry also fails, a systemMsg-type warning appears in log
//     (SKIP — see note below)
//
// NOTE: The third test (retry-warning assertion) depends on R1's
// retry-with-warning logic landing first. It is skipped via
// it.skip() so the suite stays green until R1 merges.
// ============================================================

import { describe, it, expect, vi, beforeEach } from 'vitest'
import type { Player } from '@/types/game'

// ------------------------------------------------------------
// Mocks — registered before module imports
// ------------------------------------------------------------

vi.mock('@/lib/world', async (importOriginal) => {
  const actual = await importOriginal<typeof import('@/lib/world')>()
  return {
    ...actual,
    getRoom: vi.fn().mockResolvedValue({
      id: 'cr_01_approach', name: 'Test Room', description: 'Test.',
      shortDescription: 'Test.', zone: 'crossroads', difficulty: 1,
      visited: true, flags: {}, exits: {}, items: [], enemies: [], npcs: [],
    }),
    updateRoomItems: vi.fn().mockResolvedValue(undefined),
    updateRoomFlags: vi.fn().mockResolvedValue(undefined),
    markVisited: vi.fn().mockResolvedValue(undefined),
  }
})

vi.mock('@/lib/inventory', () => ({
  getInventory: vi.fn().mockResolvedValue([]),
}))

vi.mock('@/data/items', () => ({
  getItem: vi.fn().mockReturnValue(undefined),
}))

// ------------------------------------------------------------
// Per-test Supabase mock — controlled update spy
// ------------------------------------------------------------

const mockRefreshSession = vi.fn()
const mockPlayersUpdate = vi.fn()

// Build a thenable eq chain that resolves to `result`
function makeEqChain(result: unknown) {
  const eqChain = {
    then: (resolve: (v: unknown) => void) => resolve(result),
  }
  return { eq: vi.fn(() => eqChain) }
}

const mockDb = {
  auth: {
    refreshSession: mockRefreshSession,
    getUser: vi.fn().mockResolvedValue({ data: { user: { id: 'p1' } }, error: null }),
  },
  from: vi.fn((table: string) => {
    if (table === 'players') {
      return {
        update: mockPlayersUpdate,
        select: vi.fn(() => ({
          eq: vi.fn(() => ({
            maybeSingle: vi.fn().mockResolvedValue({ data: null, error: null }),
          })),
        })),
      }
    }
    // Other tables — stable no-op
    return {
      select: vi.fn(() => ({
        eq: vi.fn(() => ({
          maybeSingle: vi.fn().mockResolvedValue({ data: null, error: null }),
        })),
        then: (r: (v: unknown) => void) => r({ count: 0, error: null }),
      })),
      update: vi.fn(() => ({
        eq: vi.fn(() => ({ then: (r: (v: unknown) => void) => r({ error: null }) })),
        then: (r: (v: unknown) => void) => r({ error: null }),
      })),
    }
  }),
}

vi.mock('@/lib/supabase', () => ({
  createSupabaseBrowserClient: () => mockDb,
}))

// Import after mocks
import { GameEngine } from '@/lib/gameEngine'

// ------------------------------------------------------------
// Helpers
// ------------------------------------------------------------

function makePlayer(overrides: Partial<Player> = {}): Player {
  return {
    id: 'p1',
    name: 'Tester',
    characterClass: 'enforcer',
    vigor: 5, grit: 5, reflex: 5, wits: 5, presence: 5, shadow: 5,
    hp: 10, maxHp: 10,
    currentRoomId: 'cr_01_approach',
    worldSeed: 1,
    xp: 0, level: 1,
    actionsTaken: 0,
    isDead: false, cycle: 1, totalDeaths: 0,
    factionReputation: {},
    questFlags: {},
    hollowPressure: 0,
    narrativeKeys: [],
    ...overrides,
  }
}

// ------------------------------------------------------------
// Tests
// ------------------------------------------------------------

describe('_savePlayer — retry path', () => {
  let engine: GameEngine

  beforeEach(() => {
    vi.clearAllMocks()
    mockRefreshSession.mockResolvedValue({})
    engine = new GameEngine()
  })

  // ----------------------------------------------------------
  // Test 1: first call fails → refreshSession is called
  // ----------------------------------------------------------
  it('calls refreshSession when the first save attempt fails', async () => {
    // First update fails; second (retry) succeeds
    mockPlayersUpdate
      .mockReturnValueOnce(makeEqChain({ error: { message: 'JWT expired', code: 'PGRST301' } }))
      .mockReturnValueOnce(makeEqChain({ error: null }))

    engine._setState({
      player: makePlayer(),
      initialized: true,
      activeBuffs: [],
      pendingStatIncrease: false,
    })

    await engine._savePlayer()

    expect(mockRefreshSession).toHaveBeenCalledTimes(1)
  })

  // ----------------------------------------------------------
  // Test 2: first call fails → retry fires (second update call)
  // ----------------------------------------------------------
  it('fires a retry update after the first save fails', async () => {
    mockPlayersUpdate
      .mockReturnValueOnce(makeEqChain({ error: { message: 'JWT expired', code: 'PGRST301' } }))
      .mockReturnValueOnce(makeEqChain({ error: null }))

    engine._setState({
      player: makePlayer(),
      initialized: true,
      activeBuffs: [],
      pendingStatIncrease: false,
    })

    await engine._savePlayer()

    // update() called twice: original attempt + one retry
    expect(mockPlayersUpdate).toHaveBeenCalledTimes(2)
  })

  // ----------------------------------------------------------
  // Test 3: both attempts fail → systemMsg warning in log
  // ----------------------------------------------------------
  it('appends a systemMsg warning when both save attempts fail', async () => {
    mockPlayersUpdate
      .mockReturnValueOnce(makeEqChain({ error: { message: 'JWT expired', code: 'PGRST301' } }))
      .mockReturnValueOnce(makeEqChain({ error: { message: 'Still failing', code: '500' } }))

    const appendedMessages: unknown[] = []
    engine._setState({
      player: makePlayer(),
      initialized: true,
      activeBuffs: [],
      pendingStatIncrease: false,
    })

    // Spy on _appendMessages to capture what gets appended
    const original = engine._appendMessages.bind(engine)
    vi.spyOn(engine, '_appendMessages').mockImplementation((msgs) => {
      appendedMessages.push(...msgs)
      original(msgs)
    })

    await engine._savePlayer()

    // Must have produced a system-type warning mentioning the save failure
    const warnMsg = appendedMessages.find(
      (m): m is { type: string; text: string } =>
        typeof m === 'object' && m !== null &&
        (m as { type: string }).type === 'system' &&
        (m as { text: string }).text.toLowerCase().includes('save failed')
    )
    expect(warnMsg).toBeDefined()
  })

  // ----------------------------------------------------------
  // Test 4: first call succeeds → no refresh, single update
  // ----------------------------------------------------------
  it('does not call refreshSession when first save succeeds', async () => {
    mockPlayersUpdate.mockReturnValueOnce(makeEqChain({ error: null }))

    engine._setState({
      player: makePlayer(),
      initialized: true,
      activeBuffs: [],
      pendingStatIncrease: false,
    })

    await engine._savePlayer()

    expect(mockRefreshSession).not.toHaveBeenCalled()
    expect(mockPlayersUpdate).toHaveBeenCalledTimes(1)
  })
})
