// ============================================================
// Integration tests: ending DB persist path (H5-W11)
//
// Tests that setQuestFlag('charon_choice', 'cure') causes the
// mock DB to receive a player_ledger update containing a
// cycle_history entry with endingChoice === 'cure'.
//
// Also covers:
//   - Persistent DB failure → endingTriggered stays false
//   - Retry path (skipped until R1 merges — see it.skip below)
// ============================================================

import { describe, it, expect, vi, beforeEach } from 'vitest'
import type { Player } from '@/types/game'

// ------------------------------------------------------------
// World / inventory / items mocks — must be registered before
// importing GameEngine so the module resolver sees them.
// ------------------------------------------------------------

vi.mock('@/lib/world', () => ({
  getRoom: vi.fn().mockResolvedValue({
    id: 'crossroads_1',
    name: 'Crossroads',
    description: 'A dusty crossroads.',
    shortDescription: 'Dusty crossroads.',
    zone: 'crossroads',
    difficulty: 1,
    visited: true,
    flags: {},
    exits: {},
    items: [],
    enemies: [],
    npcs: [],
  }),
  updateRoomItems: vi.fn().mockResolvedValue(undefined),
  updateRoomFlags: vi.fn().mockResolvedValue(undefined),
  markVisited: vi.fn().mockResolvedValue(undefined),
  persistWorld: vi.fn().mockResolvedValue(undefined),
}))

vi.mock('@/lib/inventory', () => ({
  getInventory: vi.fn().mockResolvedValue([]),
}))

vi.mock('@/data/items', () => ({
  getItem: vi.fn().mockReturnValue(undefined),
}))

// ------------------------------------------------------------
// Per-test DB mock state — module-level so vi.mock factory
// can close over them and each test can reconfigure independently.
// ------------------------------------------------------------

/** Payloads passed to player_ledger.update() — captured per call */
const ledgerUpdateCalls: Array<Record<string, unknown>> = []

/** Spy for auth.refreshSession */
const mockRefreshSession = vi.fn().mockResolvedValue({})

/** Controls what the FIRST player_ledger.update call resolves to */
let firstLedgerUpdateError: { message: string } | null = null

/** Controls what the SECOND player_ledger.update call resolves to (retry) */
let secondLedgerUpdateError: { message: string } | null = null

/** Call counter for player_ledger updates */
let ledgerUpdateCallCount = 0

// Build a chainable query builder that resolves to the given result when awaited.
// Every chain method returns the PROXY (not the raw chain) so that .then() is
// reachable even after calling .eq(), .update(), etc.
function makeChain(result: unknown) {
  const chain: Record<string, unknown> = {}
  const chainMethods = [
    'select', 'eq', 'neq', 'in', 'is', 'order', 'limit',
    'single', 'maybeSingle', 'match', 'filter', 'insert', 'upsert', 'delete', 'update',
  ]
  const proxy: unknown = new Proxy(chain, {
    get(target, prop) {
      if (prop === 'then') {
        return (resolve: (v: unknown) => void) => resolve(result)
      }
      return target[prop as string]
    },
  })
  // Return the proxy from every chain method so .then() is always reachable
  for (const m of chainMethods) {
    chain[m] = vi.fn(() => proxy)
  }
  return proxy as Record<string, unknown>
}

const mockDb = {
  auth: {
    refreshSession: mockRefreshSession,
    getUser: vi.fn().mockResolvedValue({ data: { user: { id: 'player-1' } }, error: null }),
  },
  from: vi.fn((table: string) => {
    if (table === 'player_ledger') {
      return {
        update: vi.fn((payload: Record<string, unknown>) => {
          ledgerUpdateCalls.push(payload)
          ledgerUpdateCallCount++
          const err = ledgerUpdateCallCount === 1
            ? firstLedgerUpdateError
            : secondLedgerUpdateError
          return makeChain({ error: err })
        }),
        select: vi.fn(() => makeChain({ data: null, error: null })),
        upsert: vi.fn(() => makeChain({ error: null })),
        insert: vi.fn(() => makeChain({ error: null })),
      }
    }
    if (table === 'players') {
      return {
        update: vi.fn(() => makeChain({ error: null })),
        select: vi.fn(() => makeChain({ data: null, error: null })),
        upsert: vi.fn(() => makeChain({ error: null })),
      }
    }
    // generated_rooms, player_stash, etc.
    return {
      select: vi.fn(() => makeChain({ count: 0, data: null, error: null })),
      update: vi.fn(() => makeChain({ error: null })),
      insert: vi.fn(() => makeChain({ error: null })),
      upsert: vi.fn(() => makeChain({ error: null })),
      delete: vi.fn(() => makeChain({ error: null })),
    }
  }),
}

vi.mock('@/lib/supabase', () => ({
  createSupabaseBrowserClient: () => mockDb,
}))

// Import GameEngine AFTER all vi.mock calls
import { GameEngine } from '@/lib/gameEngine'

// ------------------------------------------------------------
// Helpers
// ------------------------------------------------------------

function makePlayer(overrides: Partial<Player> = {}): Player {
  return {
    id: 'player-1',
    name: 'Tester',
    characterClass: 'enforcer',
    vigor: 5,
    grit: 4,
    reflex: 3,
    wits: 6,
    presence: 2,
    shadow: 7,
    hp: 14,
    maxHp: 20,
    currentRoomId: 'crossroads_1',
    worldSeed: 1,
    xp: 500,
    level: 3,
    actionsTaken: 120,
    isDead: false,
    cycle: 1,
    totalDeaths: 0,
    factionReputation: {},
    questFlags: {},
    ...overrides,
  }
}

// ------------------------------------------------------------
// Tests
// ------------------------------------------------------------

describe('ending DB persist — charon_choice cure', () => {
  let engine: GameEngine

  beforeEach(() => {
    // Reset per-test state
    ledgerUpdateCalls.length = 0
    ledgerUpdateCallCount = 0
    firstLedgerUpdateError = null
    secondLedgerUpdateError = null
    mockRefreshSession.mockClear()
    vi.clearAllMocks()
    // Restore the mock implementations that vi.clearAllMocks resets
    mockRefreshSession.mockResolvedValue({})

    engine = new GameEngine()
    const player = makePlayer()
    engine._setState({
      player,
      initialized: true,
      activeBuffs: [],
      pendingStatIncrease: false,
    })
  })

  it('player_ledger.update is called with a cycle_history entry when charon_choice=cure', async () => {
    await engine.setQuestFlag('charon_choice', 'cure')

    // At least one update to player_ledger must have occurred
    expect(ledgerUpdateCalls.length).toBeGreaterThanOrEqual(1)

    const firstCall = ledgerUpdateCalls[0]
    expect(firstCall).toBeDefined()

    // The update payload must contain a cycle_history array
    expect(Array.isArray(firstCall.cycle_history)).toBe(true)
    const cycleHistory = firstCall.cycle_history as Array<Record<string, unknown>>
    expect(cycleHistory.length).toBeGreaterThan(0)

    // The most recent snapshot (last entry) must record endingChoice === 'cure'
    const lastSnapshot = cycleHistory[cycleHistory.length - 1]
    expect(lastSnapshot.endingChoice).toBe('cure')
  })

  it('cycle_history snapshot contains the cycle number of the current player', async () => {
    const player = makePlayer({ cycle: 3 })
    engine._setState({ player, initialized: true, activeBuffs: [], pendingStatIncrease: false })

    await engine.setQuestFlag('charon_choice', 'cure')

    const firstCall = ledgerUpdateCalls[0]
    const cycleHistory = firstCall.cycle_history as Array<Record<string, unknown>>
    const lastSnapshot = cycleHistory[cycleHistory.length - 1]

    expect(lastSnapshot.cycle).toBe(3)
  })

  it('player_ledger.update payload also includes discovered_enemies field', async () => {
    await engine.setQuestFlag('charon_choice', 'cure')

    const firstCall = ledgerUpdateCalls[0]
    // discovered_enemies must be present (even if empty array)
    expect('discovered_enemies' in firstCall).toBe(true)
    expect(Array.isArray(firstCall.discovered_enemies)).toBe(true)
  })

  it('endingTriggered is NOT set immediately after setQuestFlag resolves (uses setTimeout)', async () => {
    // The ending is triggered inside a setTimeout — it does not fire synchronously.
    // After await setQuestFlag() resolves, endingTriggered should still be false.
    await engine.setQuestFlag('charon_choice', 'cure')
    expect(engine.getState().endingTriggered).toBe(false)
  })
})

describe('ending DB persist — persistent DB failure blocks ending', () => {
  let engine: GameEngine

  beforeEach(() => {
    ledgerUpdateCalls.length = 0
    ledgerUpdateCallCount = 0
    firstLedgerUpdateError = null
    secondLedgerUpdateError = null
    mockRefreshSession.mockClear()
    vi.clearAllMocks()
    mockRefreshSession.mockResolvedValue({})

    engine = new GameEngine()
    const player = makePlayer()
    engine._setState({
      player,
      initialized: true,
      activeBuffs: [],
      pendingStatIncrease: false,
    })
  })

  it('on DB failure, setQuestFlag returns early and endingTriggered stays false', async () => {
    // Make the first player_ledger update fail
    firstLedgerUpdateError = { message: 'connection error' }

    await engine.setQuestFlag('charon_choice', 'cure')

    // endingTriggered must remain false — ending was blocked
    expect(engine.getState().endingTriggered).toBe(false)
  })

  it('on persistent DB failure, an error message is appended to the engine log', async () => {
    // Both first call and retry must fail to trigger the systemMsg warning
    firstLedgerUpdateError = { message: 'connection error' }
    secondLedgerUpdateError = { message: 'connection error' }

    await engine.setQuestFlag('charon_choice', 'cure')

    const log = engine.getState().log
    const hasErrorMsg = log.some(
      (m) => m.type === 'error' || (typeof m.text === 'string' && m.text.includes('journey'))
    )
    expect(hasErrorMsg).toBe(true)
  })

  it('on DB failure, endingChoice is not set on engine state', async () => {
    firstLedgerUpdateError = { message: 'network timeout' }

    await engine.setQuestFlag('charon_choice', 'cure')

    // endingChoice should remain null — ending never progressed past snapshot failure
    expect(engine.getState().endingChoice).toBeNull()
  })
})

describe('ending DB persist — retry path (R1 dependency)', () => {
  let engine: GameEngine

  beforeEach(() => {
    ledgerUpdateCalls.length = 0
    ledgerUpdateCallCount = 0
    firstLedgerUpdateError = null
    secondLedgerUpdateError = null
    mockRefreshSession.mockClear()
    vi.clearAllMocks()
    mockRefreshSession.mockResolvedValue({})

    engine = new GameEngine()
    const player = makePlayer()
    engine._setState({
      player,
      initialized: true,
      activeBuffs: [],
      pendingStatIncrease: false,
    })
  })

  // REQUIRES R1 — re-enable after R1 merges the retry logic into setQuestFlag.
  // R1 adds: on snapshotError, call supabase.auth.refreshSession() then retry
  // the player_ledger update once. On retry success, ending proceeds normally.
  it.skip('on first call fail + retry success, refreshSession is called', async () => {
    // First call fails, second call (retry) succeeds
    firstLedgerUpdateError = { message: 'expired token' }
    secondLedgerUpdateError = null

    await engine.setQuestFlag('charon_choice', 'cure')

    // refreshSession must have been called before the retry
    expect(mockRefreshSession).toHaveBeenCalledTimes(1)
    // Two ledger update calls: original + retry
    expect(ledgerUpdateCallCount).toBe(2)
  })

  // REQUIRES R1 — re-enable after R1 merges the retry logic into setQuestFlag.
  // After retry success, endingTriggered must remain false immediately (setTimeout
  // still controls the final transition) — but the error message must NOT appear.
  it.skip('on first call fail + retry success, no error message is appended', async () => {
    firstLedgerUpdateError = { message: 'expired token' }
    secondLedgerUpdateError = null

    await engine.setQuestFlag('charon_choice', 'cure')

    const log = engine.getState().log
    const hasErrorMsg = log.some(
      (m) => m.type === 'error' || (typeof m.text === 'string' && m.text.includes('journey'))
    )
    expect(hasErrorMsg).toBe(false)
  })

  // REQUIRES R1 — re-enable after R1 merges the retry logic into setQuestFlag.
  // When both calls fail (persistent failure), endingTriggered must stay false
  // and a warning message must appear.
  it.skip('on both calls failing (persistent failure), endingTriggered stays false', async () => {
    firstLedgerUpdateError = { message: 'connection refused' }
    secondLedgerUpdateError = { message: 'connection refused' }

    await engine.setQuestFlag('charon_choice', 'cure')

    expect(engine.getState().endingTriggered).toBe(false)
    expect(mockRefreshSession).toHaveBeenCalledTimes(1)
    const log = engine.getState().log
    const hasWarning = log.some(
      (m) => m.type === 'error' || (typeof m.text === 'string' && m.text.includes('journey'))
    )
    expect(hasWarning).toBe(true)
  })
})
