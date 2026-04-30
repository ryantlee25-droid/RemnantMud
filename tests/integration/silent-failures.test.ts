// ============================================================
// Integration tests: silent persist failure hardening (R1)
//
// Verifies that every function hardened in the R1 sprint:
//   - adjustReputation    → systemMsg on DB error
//   - setQuestFlag        → systemMsg on DB error
//   - charon_choice path  → retry + warning / proceed on retry success
//   - _handlePlayerDeath  → retry + warning on both retries failing
//   - rebirthCharacter    → error msg + no loadPlayer on players update fail
//   - rebirthWithStats    → error msg + no loadPlayer on ledger fail
// ============================================================

import { describe, it, expect, vi, beforeEach } from 'vitest'
import type { Player } from '@/types/game'

// ────────────────────────────────────────────────────────────
// World / inventory mocks
// ────────────────────────────────────────────────────────────

vi.mock('@/lib/world', async (importOriginal) => {
  const actual = await importOriginal<typeof import('@/lib/world')>()
  return {
    ...actual,
    getRoom: vi.fn().mockResolvedValue({
      id: 'cr_01_approach',
      name: 'The Approach',
      description: 'Dust and broken asphalt.',
      shortDescription: 'Dusty approach.',
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
  }
})

vi.mock('@/lib/inventory', () => ({
  getInventory: vi.fn().mockResolvedValue([]),
}))

vi.mock('@/data/items', () => ({
  getItem: vi.fn().mockReturnValue(undefined),
}))

// ────────────────────────────────────────────────────────────
// Configurable per-test supabase mock
//
// Pattern: tableResponses holds arrays of results per table key
// (e.g. 'players-update', 'player_ledger-update').
// Each call to that operation pops the first entry.
// ────────────────────────────────────────────────────────────

// Shared mutable state per test
const tableResponses: Record<string, Array<{ data: unknown; error: unknown }>> = {}
const mockRefreshSession = vi.fn()

function popResponse(key: string): { data: unknown; error: unknown } {
  const queue = tableResponses[key]
  if (queue && queue.length > 0) return queue.shift()!
  return { data: null, error: null }
}

function pushResponse(key: string, result: { data: unknown; error: unknown }) {
  if (!tableResponses[key]) tableResponses[key] = []
  tableResponses[key].push(result)
}

/** Create a chainable builder that resolves to `result` when awaited.
 *  All chain methods return the proxy itself so awaiting any point in
 *  the chain resolves to `result`.
 */
function makeChain(result: unknown) {
  const chain: Record<string, unknown> = {}
  // proxy must be defined before methods so methods can close over it
  const proxy: typeof chain = new Proxy(chain, {
    get(target, prop) {
      if (prop === 'then') return (resolve: (v: unknown) => void) => resolve(result)
      if (prop in target) return target[prop as string]
      // Any unknown method — return a function that returns the proxy
      return () => proxy
    },
  })
  return proxy
}

const mockDb = {
  auth: {
    refreshSession: mockRefreshSession,
    getUser: vi.fn().mockResolvedValue({ data: { user: { id: 'p1' } }, error: null }),
  },
  from: vi.fn((table: string) => {
    return {
      update: vi.fn(() => makeChain(popResponse(`${table}-update`))),
      insert: vi.fn(() => makeChain(popResponse(`${table}-insert`))),
      delete: vi.fn(() => makeChain(popResponse(`${table}-delete`))),
      select: vi.fn(() => {
        const result = popResponse(`${table}-select`)
        return makeChain(result)
      }),
      upsert: vi.fn(() => makeChain(popResponse(`${table}-upsert`))),
    }
  }),
}

vi.mock('@/lib/supabase', () => ({
  createSupabaseBrowserClient: () => mockDb,
}))

// Import after mocks
import { GameEngine } from '@/lib/gameEngine'

// ────────────────────────────────────────────────────────────
// Helpers
// ────────────────────────────────────────────────────────────

const DB_ERROR = { message: 'DB unavailable', code: 'PGRST500', details: null, hint: null }
const OK = { data: null, error: null }
const FAIL = { data: null, error: DB_ERROR }

function makePlayer(overrides: Partial<Player> = {}): Player {
  return {
    id: 'p1',
    name: 'Tester',
    characterClass: 'enforcer',
    vigor: 5, grit: 4, reflex: 3, wits: 6, presence: 2, shadow: 7,
    hp: 14, maxHp: 20,
    currentRoomId: 'cr_01_approach',
    worldSeed: 42,
    xp: 0, level: 1, actionsTaken: 0,
    isDead: false, cycle: 1, totalDeaths: 0,
    factionReputation: {},
    questFlags: {},
    hollowPressure: 0,
    narrativeKeys: [],
    ...overrides,
  }
}

function seedEngine(engine: GameEngine, player: Player, extras: Record<string, unknown> = {}) {
  engine._setState({
    player,
    initialized: true,
    activeBuffs: [],
    pendingStatIncrease: false,
    ...extras,
  })
}

function getSystemMessages(engine: GameEngine): string[] {
  return engine.getState().log
    .filter(m => m.type === 'system')
    .map(m => m.text)
}

function resetMocks() {
  vi.clearAllMocks()
  mockRefreshSession.mockResolvedValue({})
  for (const key of Object.keys(tableResponses)) delete tableResponses[key]
}

// ────────────────────────────────────────────────────────────
// adjustReputation — systemMsg on DB error
// ────────────────────────────────────────────────────────────

describe('adjustReputation — DB failure warning', () => {
  beforeEach(resetMocks)

  it('shows systemMsg warning when DB update fails', async () => {
    pushResponse('players-update', FAIL)

    const engine = new GameEngine()
    const player = makePlayer()
    seedEngine(engine, player)

    await engine.adjustReputation('accord', 1)

    const msgs = getSystemMessages(engine)
    expect(msgs.some(w => w.includes('Reputation change could not be saved'))).toBe(true)
  })

  it('does NOT show warning when DB update succeeds', async () => {
    pushResponse('players-update', OK)

    const engine = new GameEngine()
    const player = makePlayer()
    seedEngine(engine, player)

    await engine.adjustReputation('accord', 1)

    const msgs = getSystemMessages(engine)
    expect(msgs.some(w => w.includes('Reputation change'))).toBe(false)
  })
})

// ────────────────────────────────────────────────────────────
// setQuestFlag — systemMsg on DB error
// ────────────────────────────────────────────────────────────

describe('setQuestFlag — DB failure warning', () => {
  beforeEach(resetMocks)

  it('shows systemMsg warning when quest_flags update fails', async () => {
    pushResponse('players-update', FAIL)

    const engine = new GameEngine()
    const player = makePlayer()
    seedEngine(engine, player)

    await engine.setQuestFlag('met_mason', true)

    const msgs = getSystemMessages(engine)
    expect(msgs.some(w => w.includes('Quest progress could not be saved'))).toBe(true)
  })

  it('does NOT show warning when quest_flags update succeeds', async () => {
    pushResponse('players-update', OK)

    const engine = new GameEngine()
    const player = makePlayer()
    seedEngine(engine, player)

    await engine.setQuestFlag('met_mason', true)

    const msgs = getSystemMessages(engine)
    expect(msgs.some(w => w.includes('Quest progress'))).toBe(false)
  })
})

// ────────────────────────────────────────────────────────────
// charon_choice snapshot — retry logic
// ────────────────────────────────────────────────────────────

describe('charon_choice — snapshot retry', () => {
  beforeEach(resetMocks)

  it('proceeds (no warning) when first ledger call fails but retry succeeds', async () => {
    // players update (quest_flags) — succeeds
    pushResponse('players-update', OK)
    // player_ledger update — first call fails, retry succeeds
    pushResponse('player_ledger-update', FAIL)
    pushResponse('player_ledger-update', OK)

    const engine = new GameEngine()
    const player = makePlayer({ questFlags: {} })
    seedEngine(engine, player, { cycleHistory: [] })

    await engine.setQuestFlag('charon_choice', 'cure')

    const msgs = getSystemMessages(engine)
    expect(msgs.some(w => w.includes('Failed to save your journey'))).toBe(false)
    // refreshSession called for the retry
    expect(mockRefreshSession).toHaveBeenCalledTimes(1)
  })

  it('shows warning and blocks ending when both ledger calls fail', async () => {
    // players update (quest_flags) — succeeds
    pushResponse('players-update', OK)
    // player_ledger — both calls fail
    pushResponse('player_ledger-update', FAIL)
    pushResponse('player_ledger-update', FAIL)

    const engine = new GameEngine()
    const player = makePlayer({ questFlags: {} })
    seedEngine(engine, player, { cycleHistory: [] })

    await engine.setQuestFlag('charon_choice', 'cure')

    const msgs = getSystemMessages(engine)
    expect(msgs.some(w => w.includes('Failed to save your journey'))).toBe(true)
    // endingTriggered must NOT be set (ending was blocked by early return)
    expect(engine.getState().endingTriggered).toBeFalsy()
  })
})

// ────────────────────────────────────────────────────────────
// _handlePlayerDeath — retry + warning
// ────────────────────────────────────────────────────────────

describe('_handlePlayerDeath — retry and warning', () => {
  beforeEach(resetMocks)

  it('shows warning when players update fails both times', async () => {
    // players update — first call fails, retry also fails
    pushResponse('players-update', FAIL)
    pushResponse('players-update', FAIL)
    // player_ledger — succeeds
    pushResponse('player_ledger-update', OK)

    const engine = new GameEngine()
    const player = makePlayer({ hp: 1 })
    seedEngine(engine, player, { ledger: { discoveredEnemies: [], discoveredRoomIds: [] } })

    await engine._handlePlayerDeath()

    const msgs = getSystemMessages(engine)
    expect(msgs.some(w => w.includes('Death could not be saved'))).toBe(true)
    // Player should still be in dead state
    expect(engine.getState().playerDead).toBe(true)
    expect(engine.getState().player?.isDead).toBe(true)
  })

  it('calls refreshSession once before retrying after players update failure', async () => {
    pushResponse('players-update', FAIL)
    pushResponse('players-update', FAIL)
    pushResponse('player_ledger-update', OK)

    const engine = new GameEngine()
    const player = makePlayer({ hp: 1 })
    seedEngine(engine, player, { ledger: { discoveredEnemies: [], discoveredRoomIds: [] } })

    await engine._handlePlayerDeath()

    expect(mockRefreshSession).toHaveBeenCalledTimes(1)
  })

  it('shows ledger warning when ledger fails both retries (players succeeded)', async () => {
    // players update — succeeds
    pushResponse('players-update', OK)
    // player_ledger — first call fails, retry also fails
    pushResponse('player_ledger-update', FAIL)
    pushResponse('player_ledger-update', FAIL)

    const engine = new GameEngine()
    const player = makePlayer({ hp: 1 })
    seedEngine(engine, player, { ledger: { discoveredEnemies: [], discoveredRoomIds: [] } })

    await engine._handlePlayerDeath()

    const msgs = getSystemMessages(engine)
    expect(msgs.some(w => w.includes('Cycle history could not be saved'))).toBe(true)
  })
})

// ────────────────────────────────────────────────────────────
// rebirthCharacter — error + no loadPlayer on players update fail
// ────────────────────────────────────────────────────────────

describe('rebirthCharacter — players update failure', () => {
  beforeEach(resetMocks)

  it('shows error message and does not call loadPlayer when players update fails', async () => {
    // players update — fails
    pushResponse('players-update', FAIL)

    const loadPlayerSpy = vi.spyOn(GameEngine.prototype, 'loadPlayer')

    const engine = new GameEngine()
    const player = makePlayer()
    seedEngine(engine, player, { cycleHistory: [] })

    await engine.rebirthCharacter()

    const msgs = getSystemMessages(engine)
    expect(msgs.some(w => w.includes('Rebirth failed'))).toBe(true)
    expect(loadPlayerSpy).not.toHaveBeenCalled()

    loadPlayerSpy.mockRestore()
  })
})

// ────────────────────────────────────────────────────────────
// rebirthWithStats — error + no loadPlayer on ledger fail
// ────────────────────────────────────────────────────────────

describe('rebirthWithStats — ledger fail', () => {
  beforeEach(resetMocks)

  it('shows error message and does not call loadPlayer when players update fails', async () => {
    // players update — fails
    pushResponse('players-update', FAIL)

    const loadPlayerSpy = vi.spyOn(GameEngine.prototype, 'loadPlayer')

    const engine = new GameEngine()
    const player = makePlayer()
    seedEngine(engine, player, { cycleHistory: [] })

    await engine.rebirthWithStats('Tester', {
      vigor: 5, grit: 4, reflex: 3, wits: 6, presence: 2, shadow: 7,
    }, 'enforcer')

    const msgs = getSystemMessages(engine)
    expect(msgs.some(w => w.includes('Rebirth failed'))).toBe(true)
    expect(loadPlayerSpy).not.toHaveBeenCalled()

    loadPlayerSpy.mockRestore()
  })
})
