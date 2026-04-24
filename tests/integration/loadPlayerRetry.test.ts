// ============================================================
// Integration tests: loadPlayer session-refresh retry
//
// Verifies that loadPlayer() mirrors the _savePlayer() retry pattern:
// on an initial DB error, it calls refreshSession() once, retries the
// query, and either succeeds or propagates the retry error.
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

// ------------------------------------------------------------
// Per-test supabase mock — configured per test
//
// We use a single shared `mockPlayersSelect` spy so that
// mockResolvedValueOnce chains work across multiple from('players') calls.
// Each call to from('players').select().eq().maybeSingle() routes to the
// same spy regardless of which builder instance was returned.
// ------------------------------------------------------------

// These are module-level so vi.mock factory can close over them
const mockRefreshSession = vi.fn()
const mockPlayersSelect = vi.fn()

// Stable fallback builder for non-players tables
function makeStableChain(result: unknown) {
  const chain: Record<string, unknown> = {}
  const methods = ['select', 'eq', 'update', 'upsert', 'delete', 'insert', 'maybeSingle', 'single']
  for (const m of methods) {
    chain[m] = vi.fn(() => chain)
  }
  return new Proxy(chain, {
    get(target, prop) {
      if (prop === 'then') return (resolve: (v: unknown) => void) => resolve(result)
      return target[prop as string]
    },
  })
}

const mockDb = {
  auth: {
    refreshSession: mockRefreshSession,
    getUser: vi.fn().mockResolvedValue({ data: { user: { id: 'p1' } }, error: null }),
  },
  from: vi.fn((table: string) => {
    if (table === 'players') {
      // Each from('players') call returns a builder whose maybeSingle always
      // routes to the shared mockPlayersSelect spy so .mockResolvedValueOnce works.
      const eq2 = vi.fn(() => ({ maybeSingle: mockPlayersSelect }))
      const select = vi.fn(() => ({ eq: eq2 }))
      return {
        select,
        update: vi.fn(() => makeStableChain({ error: null })),
        eq: eq2,
      }
    }
    // Other tables — stable no-op responses
    return makeStableChain({ data: null, error: null, count: 0 })
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

function makeDbRow(): Record<string, unknown> {
  return {
    id: 'p1',
    name: 'Tester',
    character_class: 'enforcer',
    vigor: 5, grit: 4, reflex: 3, wits: 6, presence: 2, shadow: 7,
    hp: 14, max_hp: 20,
    current_room_id: 'cr_01_approach',
    world_seed: 42,
    xp: 0,
    level: 1,
    actions_taken: 0,
    is_dead: false,
    cycle: 1,
    total_deaths: 0,
    personal_loss_type: null,
    personal_loss_detail: null,
    squirrel_name: null,
    faction_reputation: {},
    quest_flags: {},
    active_buffs: [],
    pending_stat_increase: false,
    narrative_progress: { hollowPressure: 0, narrativeKeys: [] },
  }
}

// ------------------------------------------------------------
// Tests
// ------------------------------------------------------------

describe('loadPlayer — session-refresh retry', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mockRefreshSession.mockResolvedValue({})
    mockPlayersSelect.mockReset()
  })

  it('succeeds on first try — no refresh needed', async () => {
    const row = makeDbRow()
    mockPlayersSelect.mockResolvedValue({ data: row, error: null })

    const engine = new GameEngine()
    const found = await engine.loadPlayer('p1')

    expect(found).toBe(true)
    expect(mockRefreshSession).not.toHaveBeenCalled()
    expect(engine.getState().player?.id).toBe('p1')
  })

  it('retries once after session error — succeeds on retry', async () => {
    const row = makeDbRow()
    // First call fails (session expired), second call succeeds
    mockPlayersSelect
      .mockResolvedValueOnce({ data: null, error: { message: 'JWT expired', code: 'PGRST301', details: null, hint: null } })
      .mockResolvedValueOnce({ data: row, error: null })

    const engine = new GameEngine()
    const found = await engine.loadPlayer('p1')

    expect(found).toBe(true)
    expect(mockRefreshSession).toHaveBeenCalledTimes(1)
    expect(engine.getState().player?.id).toBe('p1')
  })

  it('propagates error if retry also fails', async () => {
    // Both calls fail
    mockPlayersSelect
      .mockResolvedValueOnce({ data: null, error: { message: 'JWT expired', code: 'PGRST301', details: null, hint: null } })
      .mockResolvedValueOnce({ data: null, error: { message: 'Still unauthorized', code: '401', details: null, hint: null } })

    const engine = new GameEngine()
    await expect(engine.loadPlayer('p1')).rejects.toThrow('Failed to load player: Still unauthorized')

    expect(mockRefreshSession).toHaveBeenCalledTimes(1)
  })

  it('does NOT retry on success even if error was transient', async () => {
    // Only one call to select, no error
    const row = makeDbRow()
    mockPlayersSelect.mockResolvedValue({ data: row, error: null })

    const engine = new GameEngine()
    await engine.loadPlayer('p1')

    // refresh should never have been called
    expect(mockRefreshSession).toHaveBeenCalledTimes(0)
    expect(mockPlayersSelect).toHaveBeenCalledTimes(1)
  })

  it('returns false (not throw) when player row missing after retry', async () => {
    // First call errors, refresh fires, retry returns null (player not found)
    mockPlayersSelect
      .mockResolvedValueOnce({ data: null, error: { message: 'auth error', code: 'PGRST301', details: null, hint: null } })
      .mockResolvedValueOnce({ data: null, error: null })

    const engine = new GameEngine()
    const found = await engine.loadPlayer('p1')

    expect(found).toBe(false)
    expect(mockRefreshSession).toHaveBeenCalledTimes(1)
  })

  it('player state is fully hydrated after retry success', async () => {
    const row = makeDbRow()
    row['cycle'] = 3
    row['total_deaths'] = 2
    row['quest_flags'] = { met_mason: true }

    mockPlayersSelect
      .mockResolvedValueOnce({ data: null, error: { message: 'JWT expired', code: 'PGRST301', details: null, hint: null } })
      .mockResolvedValueOnce({ data: row, error: null })

    const engine = new GameEngine()
    const found = await engine.loadPlayer('p1')

    expect(found).toBe(true)
    expect(engine.getState().player?.cycle).toBe(3)
    expect(engine.getState().player?.totalDeaths).toBe(2)
    expect(engine.getState().player?.questFlags?.['met_mason']).toBe(true)
    expect(mockRefreshSession).toHaveBeenCalledTimes(1)
  })
})
