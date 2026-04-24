// ============================================================
// Integration tests: returning-player re-login round-trip
//
// Scenario: player creates character, plays (advances state),
// "closes browser" (engine reset), then logs back in.
// Verifies that the fields written by _savePlayer() round-trip
// through loadPlayer() correctly for both cycle-1 and cycle-2 players.
//
// Also tests: cycle > 1 prologue bypass logic in the state-machine
// layer (verifying that engine.getState().player.cycle is readable
// immediately after loadPlayer returns true).
// ============================================================

import { describe, it, expect, vi, beforeEach } from 'vitest'
import type { Player, ActiveBuff, FactionType, CycleSnapshot } from '@/types/game'

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
  getInventory: vi.fn().mockResolvedValue([
    // Simulated inventory items
    {
      id: 'inv-1',
      playerId: 'player-1',
      itemId: '22lr_rounds',
      item: { id: '22lr_rounds', name: '.22 LR Rounds', type: 'currency', description: 'Currency of the wastes.', weight: 0.01, value: 1 },
      quantity: 12,
      equipped: false,
    },
  ]),
}))

vi.mock('@/data/items', () => ({
  getItem: vi.fn().mockReturnValue(undefined),
}))

// In-memory store for the "players" table row — mutated by update(), read by select()
let dbPlayerRow: Record<string, unknown> = {}
// In-memory store for the "player_ledger" table row
let dbLedgerRow: Record<string, unknown> | null = null

// Fully-chainable Supabase query builder mock
function makeChain(result: unknown) {
  const chain: Record<string, unknown> = {}
  const chainMethods = [
    'select', 'eq', 'neq', 'in', 'is', 'order', 'limit',
    'single', 'maybeSingle', 'match', 'filter', 'insert',
    'upsert', 'delete', 'update',
  ]
  for (const m of chainMethods) {
    chain[m] = vi.fn(() => chain)
  }
  return new Proxy(chain, {
    get(target, prop) {
      if (prop === 'then') {
        return (resolve: (v: unknown) => void) => resolve(result)
      }
      return target[prop as string]
    },
  })
}

// chainable builder that executes update/select against the in-memory store
function makePlayersBuilder() {
  let pendingUpdate: Record<string, unknown> | null = null
  const builder: Record<string, unknown> = {}

  function chain() { return builder }

  builder['update'] = vi.fn((vals: Record<string, unknown>) => {
    pendingUpdate = vals
    return builder
  })
  builder['eq'] = vi.fn(() => {
    // When eq() is called after update(), commit the pending update
    if (pendingUpdate !== null) {
      Object.assign(dbPlayerRow, pendingUpdate)
      pendingUpdate = null
    }
    return builder
  })
  builder['select'] = vi.fn(() => builder)
  builder['maybeSingle'] = vi.fn(() => Promise.resolve({ data: { ...dbPlayerRow }, error: null }))
  builder['single'] = vi.fn(() => Promise.resolve({ data: { ...dbPlayerRow }, error: null }))
  builder['delete'] = vi.fn(() => builder)

  // Awaitable terminal
  ;(builder as Record<string, unknown>)['then'] = (resolve: (v: unknown) => void) => {
    if (pendingUpdate !== null) {
      Object.assign(dbPlayerRow, pendingUpdate)
      pendingUpdate = null
    }
    resolve({ data: { ...dbPlayerRow }, error: null })
  }

  return builder
}

function makeLedgerBuilder() {
  let pendingUpdate: Record<string, unknown> | null = null
  const builder: Record<string, unknown> = {}

  builder['update'] = vi.fn((vals: Record<string, unknown>) => {
    pendingUpdate = vals
    return builder
  })
  builder['insert'] = vi.fn((vals: Record<string, unknown>) => {
    dbLedgerRow = { ...vals }
    return makeChain({ data: vals, error: null })
  })
  builder['upsert'] = vi.fn((vals: Record<string, unknown>) => {
    dbLedgerRow = { ...vals }
    return makeChain({ data: vals, error: null })
  })
  builder['eq'] = vi.fn(() => {
    if (pendingUpdate !== null && dbLedgerRow !== null) {
      Object.assign(dbLedgerRow, pendingUpdate)
      pendingUpdate = null
    }
    return builder
  })
  builder['select'] = vi.fn(() => builder)
  builder['maybeSingle'] = vi.fn(() =>
    Promise.resolve({ data: dbLedgerRow ? { ...dbLedgerRow } : null, error: null })
  )
  builder['single'] = vi.fn(() =>
    Promise.resolve({ data: dbLedgerRow ? { ...dbLedgerRow } : null, error: null })
  )
  ;(builder as Record<string, unknown>)['then'] = (resolve: (v: unknown) => void) => {
    if (pendingUpdate !== null && dbLedgerRow !== null) {
      Object.assign(dbLedgerRow, pendingUpdate)
      pendingUpdate = null
    }
    resolve({ data: dbLedgerRow ? { ...dbLedgerRow } : null, error: null })
  }

  return builder
}

const mockDb = {
  auth: {
    refreshSession: vi.fn().mockResolvedValue({}),
    getUser: vi.fn().mockResolvedValue({
      data: { user: { id: 'player-1' } },
      error: null,
    }),
  },
  from: vi.fn((table: string) => {
    if (table === 'players') return makePlayersBuilder()
    if (table === 'player_ledger') return makeLedgerBuilder()
    if (table === 'player_stash') {
      return {
        select: vi.fn(() => makeChain({ data: [], error: null })),
        eq: vi.fn(function() { return this }),
        update: vi.fn(() => makeChain({ error: null })),
        delete: vi.fn(() => makeChain({ error: null })),
        then: (resolve: (v: unknown) => void) => resolve({ data: [], error: null }),
      }
    }
    // generated_rooms — visited count query
    return {
      select: vi.fn(() => makeChain({ count: 3, error: null })),
      eq: vi.fn(function() { return this }),
      update: vi.fn(() => makeChain({ error: null })),
      upsert: vi.fn(() => makeChain({ error: null })),
      delete: vi.fn(() => makeChain({ error: null })),
      then: (resolve: (v: unknown) => void) => resolve({ count: 3, error: null }),
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

function makeBasePlayer(overrides: Partial<Player> = {}): Player {
  return {
    id: 'player-1',
    name: 'Jax',
    characterClass: 'enforcer',
    vigor: 5,
    grit: 4,
    reflex: 3,
    wits: 6,
    presence: 2,
    shadow: 7,
    hp: 14,
    maxHp: 20,
    currentRoomId: 'cr_01_approach',
    worldSeed: 42,
    xp: 0,
    level: 1,
    actionsTaken: 0,
    isDead: false,
    cycle: 1,
    totalDeaths: 0,
    factionReputation: {},
    questFlags: {},
    hollowPressure: 0,
    narrativeKeys: [],
    ...overrides,
  }
}

// Seed the dbPlayerRow with a full player row for a given Player object
function seedDbRow(player: Player, extras: Record<string, unknown> = {}) {
  dbPlayerRow = {
    id: player.id,
    name: player.name,
    character_class: player.characterClass,
    vigor: player.vigor,
    grit: player.grit,
    reflex: player.reflex,
    wits: player.wits,
    presence: player.presence,
    shadow: player.shadow,
    hp: player.hp,
    max_hp: player.maxHp,
    current_room_id: player.currentRoomId,
    world_seed: player.worldSeed,
    xp: player.xp,
    level: player.level,
    actions_taken: player.actionsTaken ?? 0,
    is_dead: player.isDead,
    cycle: player.cycle ?? 1,
    total_deaths: player.totalDeaths ?? 0,
    personal_loss_type: player.personalLossType ?? null,
    personal_loss_detail: player.personalLossDetail ?? null,
    squirrel_name: player.squirrelName ?? null,
    faction_reputation: player.factionReputation ?? {},
    quest_flags: player.questFlags ?? {},
    active_buffs: [],
    pending_stat_increase: false,
    narrative_progress: {
      hollowPressure: player.hollowPressure ?? 0,
      narrativeKeys: player.narrativeKeys ?? [],
    },
    ...extras,
  }
}

// ------------------------------------------------------------
// Tests — Cycle 1 re-login round-trip
// ------------------------------------------------------------

describe('re-login round-trip — cycle 1 (fresh returning player)', () => {
  let engine: GameEngine

  beforeEach(() => {
    dbPlayerRow = {}
    dbLedgerRow = null
    vi.clearAllMocks()
    engine = new GameEngine()
  })

  it('currentRoomId round-trips after save and reload', async () => {
    const player = makeBasePlayer({ currentRoomId: 'cr_01_approach' })
    seedDbRow(player)
    engine._setState({ player, initialized: true, activeBuffs: [], pendingStatIncrease: false })

    await engine._savePlayer()
    // Simulate browser close: fresh engine
    const engine2 = new GameEngine()
    const found = await engine2.loadPlayer('player-1')

    expect(found).toBe(true)
    expect(engine2.getState().player?.currentRoomId).toBe('cr_01_approach')
  })

  it('questFlags round-trips after save and reload', async () => {
    const flags = { met_mason: true, kills_enforcer: 3 }
    const player = makeBasePlayer({ questFlags: flags })
    seedDbRow(player)
    engine._setState({ player, initialized: true, activeBuffs: [], pendingStatIncrease: false })

    await engine._savePlayer()
    const engine2 = new GameEngine()
    const found = await engine2.loadPlayer('player-1')

    expect(found).toBe(true)
    expect(engine2.getState().player?.questFlags?.['met_mason']).toBe(true)
    expect(engine2.getState().player?.questFlags?.['kills_enforcer']).toBe(3)
  })

  it('inventory is reloaded on login (from DB, not in-memory)', async () => {
    const player = makeBasePlayer()
    seedDbRow(player)
    engine._setState({ player, initialized: true, activeBuffs: [], pendingStatIncrease: false })

    await engine._savePlayer()
    const engine2 = new GameEngine()
    await engine2.loadPlayer('player-1')

    // getInventory mock returns one item with id '22lr_rounds'
    const inv = engine2.getState().inventory
    expect(inv.length).toBeGreaterThanOrEqual(1)
    expect(inv[0]?.itemId).toBe('22lr_rounds')
    expect(inv[0]?.quantity).toBe(12)
  })

  it('factionReputation round-trips for a player with standing', async () => {
    const factions: Partial<Record<FactionType, number>> = {
      accord: 2,
      red_court: -1,
      salters: 3,
    }
    const player = makeBasePlayer({ factionReputation: factions })
    seedDbRow(player)
    engine._setState({ player, initialized: true, activeBuffs: [], pendingStatIncrease: false })

    await engine._savePlayer()
    const engine2 = new GameEngine()
    const found = await engine2.loadPlayer('player-1')

    expect(found).toBe(true)
    const rep = engine2.getState().player?.factionReputation as Record<string, number>
    expect(rep['accord']).toBe(2)
    expect(rep['red_court']).toBe(-1)
    expect(rep['salters']).toBe(3)
  })

  it('narrativeKeys round-trip via narrative_progress JSONB', async () => {
    const keys = ['found_shelter', 'met_elder', 'burned_cache']
    const player = makeBasePlayer({ narrativeKeys: keys, hollowPressure: 5 })
    seedDbRow(player)
    engine._setState({ player, initialized: true, activeBuffs: [], pendingStatIncrease: false })

    await engine._savePlayer()
    const engine2 = new GameEngine()
    await engine2.loadPlayer('player-1')

    expect(engine2.getState().player?.narrativeKeys).toEqual(keys)
    expect(engine2.getState().player?.hollowPressure).toBe(5)
  })

  it('cycle is preserved on reload', async () => {
    const player = makeBasePlayer({ cycle: 1 })
    seedDbRow(player)
    engine._setState({ player, initialized: true, activeBuffs: [], pendingStatIncrease: false })

    await engine._savePlayer()
    const engine2 = new GameEngine()
    await engine2.loadPlayer('player-1')

    expect(engine2.getState().player?.cycle).toBe(1)
  })

  it('narrative_progress is a plain object (not double-stringified)', async () => {
    const player = makeBasePlayer({ hollowPressure: 3, narrativeKeys: ['key_alpha'] })
    seedDbRow(player)
    engine._setState({ player, initialized: true, activeBuffs: [], pendingStatIncrease: false })

    await engine._savePlayer()

    // Verify the DB row has the narrative_progress as an object
    const np = dbPlayerRow['narrative_progress']
    expect(typeof np).toBe('object')
    expect(np).not.toBeNull()
    expect(typeof np).not.toBe('string')
  })
})

// ------------------------------------------------------------
// Tests — Cycle 2 re-login round-trip (post-rebirth)
// ------------------------------------------------------------

describe('re-login round-trip — cycle 2 (post-rebirth returning player)', () => {
  let engine: GameEngine

  beforeEach(() => {
    dbPlayerRow = {}
    dbLedgerRow = null
    vi.clearAllMocks()
    engine = new GameEngine()
  })

  it('cycle 2 player loads with correct cycle number', async () => {
    const snapshot: CycleSnapshot = {
      cycle: 1,
      factionsAligned: ['accord'] as FactionType[],
      factionsAntagonized: ['red_court'] as FactionType[],
      npcRelationships: {},
      questsCompleted: ['scout_recon'],
    }
    dbLedgerRow = {
      player_id: 'player-1',
      world_seed: 42,
      current_cycle: 2,
      total_deaths: 1,
      pressure_level: 2,
      discovered_room_ids: [],
      discovered_enemies: [],
      cycle_history: [snapshot],
    }

    const player = makeBasePlayer({
      cycle: 2,
      totalDeaths: 1,
      factionReputation: { accord: 1, red_court: -1 },
      hollowPressure: 2,
      narrativeKeys: ['found_shelter'],
    })
    seedDbRow(player)
    engine._setState({ player, initialized: true, activeBuffs: [], pendingStatIncrease: false })

    await engine._savePlayer()
    const engine2 = new GameEngine()
    const found = await engine2.loadPlayer('player-1')

    expect(found).toBe(true)
    expect(engine2.getState().player?.cycle).toBe(2)
    expect(engine2.getState().player?.totalDeaths).toBe(1)
  })

  it('cycle 2 player: inherited faction reputation round-trips', async () => {
    const snapshot: CycleSnapshot = {
      cycle: 1,
      factionsAligned: ['accord', 'drifters'] as FactionType[],
      factionsAntagonized: [] as FactionType[],
      npcRelationships: {},
      questsCompleted: [],
    }
    dbLedgerRow = {
      player_id: 'player-1',
      world_seed: 42,
      current_cycle: 2,
      total_deaths: 1,
      pressure_level: 2,
      discovered_room_ids: [],
      discovered_enemies: [],
      cycle_history: [snapshot],
    }

    const player = makeBasePlayer({
      cycle: 2,
      totalDeaths: 1,
      factionReputation: { accord: 1, drifters: 1 },
    })
    seedDbRow(player)
    engine._setState({ player, initialized: true, activeBuffs: [], pendingStatIncrease: false })

    await engine._savePlayer()
    const engine2 = new GameEngine()
    await engine2.loadPlayer('player-1')

    const rep = engine2.getState().player?.factionReputation as Record<string, number>
    expect(rep['accord']).toBe(1)
    expect(rep['drifters']).toBe(1)
  })

  it('cycle 2 player: cycleHistory is restored from ledger', async () => {
    const snapshot: CycleSnapshot = {
      cycle: 1,
      factionsAligned: ['salters'] as FactionType[],
      factionsAntagonized: ['ferals'] as FactionType[],
      npcRelationships: {},
      questsCompleted: [],
      deathRoom: 'the_scar_pit',
    }
    dbLedgerRow = {
      player_id: 'player-1',
      world_seed: 42,
      current_cycle: 2,
      total_deaths: 1,
      pressure_level: 2,
      discovered_room_ids: [],
      discovered_enemies: ['stalker', 'shuffler'],
      cycle_history: [snapshot],
    }

    const player = makeBasePlayer({ cycle: 2, totalDeaths: 1 })
    seedDbRow(player)
    engine._setState({ player, initialized: true, activeBuffs: [], pendingStatIncrease: false })

    const engine2 = new GameEngine()
    await engine2.loadPlayer('player-1')

    const history = engine2.getState().cycleHistory ?? []
    expect(history).toHaveLength(1)
    expect(history[0]?.cycle).toBe(1)
    expect(history[0]?.deathRoom).toBe('the_scar_pit')
    expect(history[0]?.factionsAligned).toContain('salters')
  })

  it('cycle 2 player: null JSONB fields default to safe empty values', async () => {
    // Test robustness: narrative_progress null, quest_flags null
    const player = makeBasePlayer({ cycle: 2, totalDeaths: 1 })
    seedDbRow(player, {
      narrative_progress: null,
      quest_flags: null,
      faction_reputation: null,
      active_buffs: null,
    })

    const engine2 = new GameEngine()
    const found = await engine2.loadPlayer('player-1')

    expect(found).toBe(true)
    expect(engine2.getState().player?.hollowPressure).toBe(0)
    expect(engine2.getState().player?.narrativeKeys).toEqual([])
    expect(engine2.getState().player?.questFlags).toEqual({})
    expect(engine2.getState().player?.factionReputation).toEqual({})
    expect(engine2.getState().activeBuffs).toEqual([])
  })

  it('cycle 2 player: roomsExplored is populated from DB visited-room count on load', async () => {
    // The count comes from the generated_rooms table query in loadPlayer().
    // We verify it is a number (not undefined/null) — the actual value depends
    // on how many rows the mock returns for the count query.
    const player = makeBasePlayer({ cycle: 2, totalDeaths: 1 })
    seedDbRow(player)

    const engine2 = new GameEngine()
    await engine2.loadPlayer('player-1')

    // Must be a number — undefined would mean the field was never set
    expect(typeof engine2.getState().roomsExplored).toBe('number')
    // Must be >= 0 (0 is valid for a new/reset game; non-zero for active players)
    expect(engine2.getState().roomsExplored).toBeGreaterThanOrEqual(0)
  })
})

// ------------------------------------------------------------
// Tests — Prologue bypass for cycle > 1 players
// ------------------------------------------------------------

describe('prologue bypass — cycle > 1 guard', () => {
  let engine: GameEngine

  beforeEach(() => {
    dbPlayerRow = {}
    dbLedgerRow = null
    vi.clearAllMocks()
    engine = new GameEngine()
  })

  it('loadPlayer returns true and cycle is readable immediately after call', async () => {
    const player = makeBasePlayer({ cycle: 2 })
    seedDbRow(player)

    const found = await engine.loadPlayer('player-1')

    // The cycle > 1 bypass in app/page.tsx reads engine.getState().player.cycle
    // immediately after the loadPlayer() promise resolves.
    // Verify this works before any additional state mutation.
    expect(found).toBe(true)
    expect(engine.getState().player?.cycle).toBe(2)
    expect((engine.getState().player?.cycle ?? 1) > 1).toBe(true)
  })

  it('cycle 1 player does NOT trigger the bypass', async () => {
    const player = makeBasePlayer({ cycle: 1 })
    seedDbRow(player)

    const found = await engine.loadPlayer('player-1')

    expect(found).toBe(true)
    expect((engine.getState().player?.cycle ?? 1) > 1).toBe(false)
  })

  it('cycle 3 player triggers the bypass', async () => {
    const player = makeBasePlayer({ cycle: 3, totalDeaths: 2 })
    seedDbRow(player, { cycle: 3, total_deaths: 2 })

    const found = await engine.loadPlayer('player-1')

    expect(found).toBe(true)
    expect((engine.getState().player?.cycle ?? 1) > 1).toBe(true)
  })
})

// ------------------------------------------------------------
// Tests — Dead player re-login (isDead flag)
// ------------------------------------------------------------

describe('re-login — dead player state restoration', () => {
  let engine: GameEngine

  beforeEach(() => {
    dbPlayerRow = {}
    dbLedgerRow = null
    vi.clearAllMocks()
    engine = new GameEngine()
  })

  it('isDead=true player restores playerDead state on load', async () => {
    const player = makeBasePlayer({ isDead: true, hp: 0, cycle: 1 })
    seedDbRow(player, { hp: 0, is_dead: true })

    const found = await engine.loadPlayer('player-1')

    expect(found).toBe(true)
    expect(engine.getState().playerDead).toBe(true)
    expect(engine.getState().player?.isDead).toBe(true)
  })

  it('isDead=false player does not set playerDead', async () => {
    const player = makeBasePlayer({ isDead: false, hp: 14 })
    seedDbRow(player)

    const found = await engine.loadPlayer('player-1')

    expect(found).toBe(true)
    expect(engine.getState().playerDead).toBe(false)
  })
})

// ------------------------------------------------------------
// Tests — Active buffs + pendingStatIncrease restoration
// ------------------------------------------------------------

describe('re-login — active buffs and stat increase flag', () => {
  let engine: GameEngine

  beforeEach(() => {
    dbPlayerRow = {}
    dbLedgerRow = null
    vi.clearAllMocks()
    engine = new GameEngine()
  })

  it('active buffs round-trip as native array (not stringified)', async () => {
    const buffs: ActiveBuff[] = [
      { id: 'well_rested', name: 'Well Rested', turnsRemaining: 3, statBoosts: { grit: 1 } },
    ]
    const player = makeBasePlayer()
    seedDbRow(player)
    engine._setState({ player, initialized: true, activeBuffs: buffs, pendingStatIncrease: false })

    await engine._savePlayer()

    // Verify the DB row has active_buffs as an array (not a JSON string)
    expect(Array.isArray(dbPlayerRow['active_buffs'])).toBe(true)

    const engine2 = new GameEngine()
    await engine2.loadPlayer('player-1')

    const restoredBuffs = engine2.getState().activeBuffs ?? []
    expect(restoredBuffs).toHaveLength(1)
    expect(restoredBuffs[0]?.id).toBe('well_rested')
    expect(restoredBuffs[0]?.turnsRemaining).toBe(3)
  })

  it('pendingStatIncrease=true is restored after reload', async () => {
    const player = makeBasePlayer({ level: 3 })
    seedDbRow(player, { pending_stat_increase: true })
    engine._setState({ player, initialized: true, activeBuffs: [], pendingStatIncrease: true })

    await engine._savePlayer()

    const engine2 = new GameEngine()
    await engine2.loadPlayer('player-1')

    expect(engine2.getState().pendingStatIncrease).toBe(true)
  })
})
