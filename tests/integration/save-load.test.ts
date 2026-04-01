// ============================================================
// Integration tests: save/load round-trip
// Verifies every field written by _savePlayer() is recoverable
// by loadPlayer(). These tests would have caught the production
// bugs caused by active_buffs and narrative_progress mismatches.
// ============================================================

import { describe, it, expect, vi, beforeEach } from 'vitest'
import type { Player, ActiveBuff } from '@/types/game'

// ------------------------------------------------------------
// Mock external modules before importing GameEngine
// ------------------------------------------------------------

// Capture what _savePlayer writes so we can feed it back to loadPlayer
let savedPayload: Record<string, unknown> = {}

vi.mock('@/lib/supabase', () => ({
  createSupabaseBrowserClient: () => mockDb,
}))

vi.mock('@/lib/world', () => ({
  getRoom: vi.fn().mockResolvedValue({
    id: 'crossroads_1', name: 'Crossroads', description: 'A dusty crossroads.',
    shortDescription: 'Dusty crossroads.', zone: 'crossroads', difficulty: 1,
    visited: true, flags: {}, exits: {}, items: [], enemies: [], npcs: [],
  }),
  updateRoomItems: vi.fn().mockResolvedValue(undefined),
  updateRoomFlags: vi.fn().mockResolvedValue(undefined),
  getPopulatedRoom: vi.fn(),
}))

vi.mock('@/lib/inventory', () => ({
  getInventory: vi.fn().mockResolvedValue([]),
}))

vi.mock('@/data/items', () => ({
  getItem: vi.fn().mockReturnValue(undefined),
}))

// Build a fully-chainable query builder that resolves to `result` when awaited
function makeChain(result: unknown) {
  const chain: Record<string, unknown> = {}
  const chainMethods = ['select', 'eq', 'neq', 'in', 'is', 'order', 'limit',
    'single', 'maybeSingle', 'match', 'filter', 'insert', 'upsert', 'delete', 'update']
  for (const m of chainMethods) {
    chain[m] = vi.fn(() => chain)
  }
  // Make it awaitable
  return new Proxy(chain, {
    get(target, prop) {
      if (prop === 'then') {
        return (resolve: (v: unknown) => void) => resolve(result)
      }
      return target[prop as string]
    },
  })
}

// A mock DB that stores the update payload and returns it on select
const mockDb = {
  auth: {
    refreshSession: vi.fn().mockResolvedValue({}),
    getUser: vi.fn().mockResolvedValue({ data: { user: { id: 'player-1' } }, error: null }),
  },
  from: vi.fn((table: string) => {
    if (table === 'players') {
      return {
        update: vi.fn((payload: Record<string, unknown>) => {
          savedPayload = { ...savedPayload, ...payload }
          return makeChain({ error: null })
        }),
        select: vi.fn(() =>
          makeChain({ data: buildDbRow(), error: null })
        ),
      }
    }
    if (table === 'player_ledger' || table === 'player_stash') {
      return {
        select: vi.fn(() => makeChain({ data: null, error: null })),
        update: vi.fn(() => makeChain({ error: null })),
      }
    }
    // generated_rooms: count query — resolve with { count: 0 }
    return {
      select: vi.fn(() => makeChain({ count: 0, error: null })),
      update: vi.fn(() => makeChain({ error: null })),
    }
  }),
}

// Build the DB row that loadPlayer reads from whatever _savePlayer last wrote
function buildDbRow() {
  return {
    id: 'player-1',
    name: 'Jax',
    character_class: 'enforcer',
    world_seed: 42,
    is_dead: false,
    total_deaths: 0,
    cycle: 2,
    personal_loss_type: null,
    personal_loss_detail: null,
    squirrel_name: null,
    // Fields from savedPayload (overwrite defaults)
    ...savedPayload,
  }
}

// Import GameEngine after mocks are registered
import { GameEngine } from '@/lib/gameEngine'

// ------------------------------------------------------------
// Helpers
// ------------------------------------------------------------

function makePlayer(overrides: Partial<Player> = {}): Player {
  return {
    id: 'player-1',
    name: 'Jax',
    characterClass: 'enforcer',
    vigor: 5, grit: 4, reflex: 3, wits: 6, presence: 2, shadow: 7,
    hp: 14, maxHp: 20,
    currentRoomId: 'crossroads_1',
    worldSeed: 42,
    xp: 350, level: 3,
    actionsTaken: 77,
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

describe('save/load round-trip', () => {
  let engine: GameEngine

  beforeEach(() => {
    savedPayload = {}
    vi.clearAllMocks()
    engine = new GameEngine()
  })

  it('every field in _savePlayer payload has a matching column read by loadPlayer', async () => {
    const player = makePlayer()
    engine._setState({
      player,
      initialized: true,
      activeBuffs: [],
      pendingStatIncrease: false,
    })

    await engine._savePlayer()
    await engine.loadPlayer('player-1')

    const loaded = engine.getState().player!

    // Core stats
    expect(loaded.hp).toBe(player.hp)
    expect(loaded.maxHp).toBe(player.maxHp)
    expect(loaded.xp).toBe(player.xp)
    expect(loaded.level).toBe(player.level)
    expect(loaded.vigor).toBe(player.vigor)
    expect(loaded.grit).toBe(player.grit)
    expect(loaded.reflex).toBe(player.reflex)
    expect(loaded.wits).toBe(player.wits)
    expect(loaded.presence).toBe(player.presence)
    expect(loaded.shadow).toBe(player.shadow)
    expect(loaded.currentRoomId).toBe(player.currentRoomId)
    expect(loaded.actionsTaken).toBe(player.actionsTaken)
  })

  it('narrative_progress JSONB serializes and deserializes correctly', async () => {
    const player = makePlayer({
      hollowPressure: 7,
      narrativeKeys: ['found_shelter', 'met_elder', 'burned_cache'],
    })
    engine._setState({ player, initialized: true, activeBuffs: [], pendingStatIncrease: false })

    await engine._savePlayer()

    // Verify the payload is a plain object, not a double-stringified string
    expect(typeof savedPayload.narrative_progress).toBe('object')
    expect(savedPayload.narrative_progress).not.toBeNull()

    await engine.loadPlayer('player-1')
    const loaded = engine.getState().player!

    expect(loaded.hollowPressure).toBe(7)
    expect(loaded.narrativeKeys).toEqual(['found_shelter', 'met_elder', 'burned_cache'])
  })

  it('active_buffs stored as native JSONB (no double-stringify)', async () => {
    const buffs: ActiveBuff[] = [
      { id: 'well_rested', name: 'Well Rested', turnsRemaining: 3, statBoosts: { grit: 1 } },
    ]
    const player = makePlayer()
    engine._setState({ player, initialized: true, activeBuffs: buffs, pendingStatIncrease: false })

    await engine._savePlayer()

    // Must be an array, not a JSON string of an array
    expect(Array.isArray(savedPayload.active_buffs)).toBe(true)
    expect(typeof savedPayload.active_buffs).not.toBe('string')

    await engine.loadPlayer('player-1')

    const restoredBuffs = engine.getState().activeBuffs ?? []
    expect(restoredBuffs).toHaveLength(1)
    expect(restoredBuffs[0]).toMatchObject({ id: 'well_rested', turnsRemaining: 3 })
  })

  it('faction_reputation JSONB round-trips with all 9 factions', async () => {
    const factions = {
      covenant:  2,
      dust_rats: -1,
      iron_vale:  1,
      wayfarers:  3,
      ash_guild: -3,
      remnants:   0,
      ember_cult: 1,
      free_soil: -2,
      the_deep:   2,
    }
    const player = makePlayer({ factionReputation: factions as Player['factionReputation'] })
    engine._setState({ player, initialized: true, activeBuffs: [], pendingStatIncrease: false })

    await engine._savePlayer()

    expect(typeof savedPayload.faction_reputation).toBe('object')

    await engine.loadPlayer('player-1')
    const loaded = engine.getState().player!

    for (const [faction, rep] of Object.entries(factions)) {
      expect((loaded.factionReputation as Record<string, number>)[faction]).toBe(rep)
    }
  })

  it('quest_flags JSONB round-trips with nested values', async () => {
    const flags: Record<string, boolean | number> = {
      met_mason:      true,
      burned_cache:   false,
      kills_enforcer: 3,
      found_key:      1,
    }
    const player = makePlayer({ questFlags: flags })
    engine._setState({ player, initialized: true, activeBuffs: [], pendingStatIncrease: false })

    await engine._savePlayer()

    expect(typeof savedPayload.quest_flags).toBe('object')

    await engine.loadPlayer('player-1')
    const loaded = engine.getState().player!

    expect(loaded.questFlags).toEqual(flags)
  })

  it('numeric fields (hp, xp, level, cycle) round-trip without type coercion', async () => {
    const player = makePlayer({ hp: 8, xp: 999, level: 5, cycle: 4 })
    engine._setState({ player, initialized: true, activeBuffs: [], pendingStatIncrease: false })

    await engine._savePlayer()
    await engine.loadPlayer('player-1')

    const loaded = engine.getState().player!
    expect(loaded.hp).toBe(8)
    expect(loaded.xp).toBe(999)
    expect(loaded.level).toBe(5)
    expect(loaded.cycle).toBe(4)
    // Verify types are numeric, not strings
    expect(typeof loaded.hp).toBe('number')
    expect(typeof loaded.xp).toBe('number')
    expect(typeof loaded.level).toBe('number')
    expect(typeof loaded.cycle).toBe('number')
  })
})
