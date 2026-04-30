// ============================================================
// Integration tests: _handlePlayerDeath DB persistence (H5-W10)
// Covers:
//   - players table updated with is_dead: true and total_deaths incremented
//   - player_ledger updated with the current cycle_history snapshot
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
      id: 'cr_01_approach', name: 'Test Room', description: 'A test room.',
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
// Supabase mock — captures what each table receives
// ------------------------------------------------------------

// Captured update payloads, keyed by table name
const capturedUpdates: Record<string, Record<string, unknown>> = {}

// Mock from() builder that records the update payload
function makeUpdateChain(tableName: string) {
  const eqChain = {
    then: (resolve: (v: unknown) => void) => resolve({ error: null }),
  }
  const updateFn = vi.fn((payload: Record<string, unknown>) => {
    capturedUpdates[tableName] = { ...(capturedUpdates[tableName] ?? {}), ...payload }
    return {
      eq: vi.fn(() => eqChain),
    }
  })
  return updateFn
}

const mockPlayersUpdate = makeUpdateChain('players')
const mockLedgerUpdate = makeUpdateChain('player_ledger')

const mockDb = {
  auth: {
    refreshSession: vi.fn().mockResolvedValue({}),
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
    if (table === 'player_ledger') {
      return {
        update: mockLedgerUpdate,
        select: vi.fn(() => ({
          eq: vi.fn(() => ({
            maybeSingle: vi.fn().mockResolvedValue({ data: null, error: null }),
          })),
        })),
      }
    }
    // generated_rooms and other tables
    return {
      select: vi.fn(() => ({
        eq: vi.fn(() => ({
          eq: vi.fn(() => ({ then: (r: (v: unknown) => void) => r({ count: 0, error: null }) })),
          maybeSingle: vi.fn().mockResolvedValue({ data: null, error: null }),
        })),
        then: (r: (v: unknown) => void) => r({ count: 0, error: null }),
      })),
      update: vi.fn(() => ({
        eq: vi.fn(() => ({
          eq: vi.fn(() => ({ then: (r: (v: unknown) => void) => r({ error: null }) })),
          then: (r: (v: unknown) => void) => r({ error: null }),
        })),
        then: (r: (v: unknown) => void) => r({ error: null }),
      })),
    }
  }),
}

vi.mock('@/lib/supabase', () => ({
  createSupabaseBrowserClient: () => mockDb,
}))

// Suppress tutorial-hint supabase calls in attemptTutorialHint
// (it does additional DB queries we don't need to track)

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
    hp: 0,        // already at 0 — death imminent
    maxHp: 10,
    currentRoomId: 'cr_01_approach',
    worldSeed: 1,
    xp: 100, level: 2,
    actionsTaken: 50,
    isDead: false,
    cycle: 2,
    totalDeaths: 1,
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

describe('_handlePlayerDeath — DB persistence', () => {
  let engine: GameEngine

  beforeEach(() => {
    vi.clearAllMocks()
    // Reset captured updates
    for (const k of Object.keys(capturedUpdates)) {
      delete capturedUpdates[k]
    }
    engine = new GameEngine()
  })

  it('updates players table with is_dead: true', async () => {
    const player = makePlayer({ totalDeaths: 1 })
    engine._setState({
      player,
      initialized: true,
      activeBuffs: [],
      combatState: null,
    })

    await engine._handlePlayerDeath()

    expect(mockPlayersUpdate).toHaveBeenCalled()
    const playersPayload = capturedUpdates['players']
    expect(playersPayload).toBeDefined()
    expect(playersPayload!['is_dead']).toBe(true)
  })

  it('increments total_deaths by 1 in players update', async () => {
    const player = makePlayer({ totalDeaths: 3 })
    engine._setState({
      player,
      initialized: true,
      activeBuffs: [],
      combatState: null,
    })

    await engine._handlePlayerDeath()

    const playersPayload = capturedUpdates['players']
    expect(playersPayload).toBeDefined()
    expect(playersPayload!['total_deaths']).toBe(4)
  })

  it('updates player_ledger with current cycle_history snapshot', async () => {
    const player = makePlayer({ cycle: 2, totalDeaths: 1 })
    engine._setState({
      player,
      initialized: true,
      activeBuffs: [],
      combatState: null,
      cycleHistory: [],  // start with empty history so this death creates one entry
    })

    await engine._handlePlayerDeath()

    expect(mockLedgerUpdate).toHaveBeenCalled()
    const ledgerPayload = capturedUpdates['player_ledger']
    expect(ledgerPayload).toBeDefined()

    // cycle_history should be an array (the snapshot created by createCycleSnapshot)
    const cycleHistory = ledgerPayload!['cycle_history']
    expect(Array.isArray(cycleHistory)).toBe(true)
    const history = cycleHistory as unknown[]
    expect(history.length).toBeGreaterThan(0)
  })

  it('clears combat_state and active_dialogue in players update', async () => {
    const player = makePlayer()
    engine._setState({
      player,
      initialized: true,
      activeBuffs: [],
      combatState: {
        active: true,
        enemy: { id: 'hollow', name: 'Hollow', description: 'A hollow.', hp: 5, maxHp: 5, damage: 2, xpReward: 10 },
        enemyHp: 5,
        round: 1,
        playerActed: false,
      },
    })

    await engine._handlePlayerDeath('combat')

    const playersPayload = capturedUpdates['players']
    expect(playersPayload).toBeDefined()
    expect(playersPayload!['combat_state']).toBeNull()
    expect(playersPayload!['active_dialogue']).toBeNull()
  })
})
