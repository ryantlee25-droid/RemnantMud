// ============================================================
// Integration tests: discovered_room_ids persistence
//
// Covers:
//  1. _recordRoomDiscovery: appends to in-memory ledger + persists to DB
//  2. Idempotency: calling twice on same room does not duplicate
//  3. executeAction('go') hook: fires when room changes via movement
//  4. Cross-cycle persistence: discovered_room_ids survive loadPlayer
// ============================================================

import { describe, it, expect, vi, beforeEach } from 'vitest'
import type { Player, PlayerLedger } from '@/types/game'

// ------------------------------------------------------------
// Mocks — registered before module imports
// ------------------------------------------------------------

vi.mock('@/lib/world', () => ({
  getRoom: vi.fn().mockResolvedValue({
    id: 'cr_02_checkpoint',
    name: 'Checkpoint',
    description: 'A ruined checkpoint.',
    shortDescription: 'Ruined checkpoint.',
    zone: 'crossroads',
    difficulty: 1,
    visited: false,
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
  canMove: vi.fn().mockReturnValue(true),
  // getExits returns Exit[] — empty means "no exits to display" path
  getExits: vi.fn().mockReturnValue([]),
  getRoomDescription: vi.fn().mockReturnValue('A ruined checkpoint.'),
}))

vi.mock('@/lib/inventory', () => ({
  getInventory: vi.fn().mockResolvedValue([]),
  addItem: vi.fn().mockResolvedValue(undefined),
  removeItem: vi.fn().mockResolvedValue(undefined),
  groupAndFormatItems: vi.fn(() => []),
}))

vi.mock('@/data/items', () => ({
  getItem: vi.fn().mockReturnValue(undefined),
}))

vi.mock('@/lib/fear', () => ({
  fearCheck: vi.fn(() => ({ messages: [] })),
  echoRetentionFactor: vi.fn(() => 0.7),
}))

vi.mock('@/lib/richText', async (importOriginal) => {
  const actual = await importOriginal<typeof import('@/lib/richText')>()
  return actual
})

vi.mock('@/lib/messages', async (importOriginal) => {
  const actual = await importOriginal<typeof import('@/lib/messages')>()
  return {
    ...actual,
    msg: (text: string, type = 'narrative') => ({ id: 'test-' + Math.random(), text, type }),
    systemMsg: (text: string) => ({ id: 'test-' + Math.random(), text, type: 'system' }),
    combatMsg: (text: string) => ({ id: 'test-' + Math.random(), text, type: 'combat' }),
    errorMsg: (text: string) => ({ id: 'test-' + Math.random(), text, type: 'error' }),
  }
})

vi.mock('@/lib/echoes', async (importOriginal) => {
  const actual = await importOriginal<typeof import('@/lib/echoes')>()
  return {
    ...actual,
    getDeathRoomNarration: vi.fn(() => null),
    getCrossCycleConsequences: vi.fn(() => []),
    getGraffitiChange: vi.fn(() => null),
    getCycleAwareDialogue: vi.fn(() => null),
  }
})

vi.mock('@/lib/skillBonus', () => ({
  getStatForSkill: vi.fn(() => null),
  getStatNameForSkill: vi.fn(() => null),
}))

// ------------------------------------------------------------
// In-memory DB state
// ------------------------------------------------------------

// Track what gets written to player_ledger.discovered_room_ids
let dbLedgerDiscoveredRooms: string[] = []
let dbPlayerRow: Record<string, unknown> = {}
let ledgerUpdateFn: ReturnType<typeof vi.fn>
let ledgerUpdateArgs: Record<string, unknown>[] = []

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
      if (prop === 'then') return (resolve: (v: unknown) => void) => resolve(result)
      return target[prop as string]
    },
  })
}

function makeLedgerBuilder() {
  let pendingUpdate: Record<string, unknown> | null = null
  const builder: Record<string, unknown> = {}

  builder['update'] = vi.fn((vals: Record<string, unknown>) => {
    pendingUpdate = { ...vals }
    ledgerUpdateArgs.push(vals)
    return builder
  })
  builder['insert'] = vi.fn((vals: Record<string, unknown>) => {
    dbLedgerDiscoveredRooms = (vals['discovered_room_ids'] as string[]) ?? []
    return makeChain({ data: vals, error: null })
  })
  builder['upsert'] = vi.fn((vals: Record<string, unknown>) => {
    if ('discovered_room_ids' in vals) {
      dbLedgerDiscoveredRooms = vals['discovered_room_ids'] as string[]
    }
    return makeChain({ data: vals, error: null })
  })
  builder['eq'] = vi.fn(() => {
    if (pendingUpdate !== null) {
      if ('discovered_room_ids' in pendingUpdate) {
        dbLedgerDiscoveredRooms = pendingUpdate['discovered_room_ids'] as string[]
      }
      pendingUpdate = null
    }
    return builder
  })
  builder['select'] = vi.fn(() => builder)
  builder['maybeSingle'] = vi.fn(() =>
    Promise.resolve({
      data: {
        player_id: 'p1',
        world_seed: 42,
        current_cycle: 1,
        total_deaths: 0,
        pressure_level: 1,
        discovered_room_ids: [...dbLedgerDiscoveredRooms],
        discovered_enemies: [],
        cycle_history: [],
        squirrel_alive: null,
        squirrel_trust: null,
        squirrel_cycles_known: null,
        squirrel_name: null,
      },
      error: null,
    })
  )
  ;(builder as Record<string, unknown>)['then'] = (resolve: (v: unknown) => void) => {
    if (pendingUpdate !== null) {
      if ('discovered_room_ids' in pendingUpdate) {
        dbLedgerDiscoveredRooms = pendingUpdate['discovered_room_ids'] as string[]
      }
      pendingUpdate = null
    }
    resolve({ data: null, error: null })
  }
  return builder
}

function makePlayersBuilder() {
  let pendingUpdate: Record<string, unknown> | null = null
  const builder: Record<string, unknown> = {}
  builder['update'] = vi.fn((vals: Record<string, unknown>) => {
    pendingUpdate = vals
    return builder
  })
  builder['eq'] = vi.fn(() => {
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
  ;(builder as Record<string, unknown>)['then'] = (resolve: (v: unknown) => void) => {
    if (pendingUpdate !== null) {
      Object.assign(dbPlayerRow, pendingUpdate)
      pendingUpdate = null
    }
    resolve({ data: { ...dbPlayerRow }, error: null })
  }
  return builder
}

const mockDb = {
  auth: {
    refreshSession: vi.fn().mockResolvedValue({}),
    getUser: vi.fn().mockResolvedValue({ data: { user: { id: 'p1' } }, error: null }),
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

function makePlayer(overrides: Partial<Player> = {}): Player {
  return {
    id: 'p1',
    name: 'Tester',
    characterClass: 'enforcer',
    vigor: 5, grit: 4, reflex: 3, wits: 6, presence: 2, shadow: 7,
    hp: 14, maxHp: 20,
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

function makeLedger(overrides: Partial<PlayerLedger> = {}): PlayerLedger {
  return {
    playerId: 'p1',
    worldSeed: 42,
    currentCycle: 1,
    totalDeaths: 0,
    pressureLevel: 1,
    discoveredRoomIds: [],
    squirrelAlive: true,
    squirrelTrust: 0,
    squirrelCyclesKnown: 0,
    cycleHistory: [],
    discoveredEnemies: [],
    ...overrides,
  }
}

function makeRoom(overrides: Record<string, unknown> = {}) {
  return {
    id: 'cr_01_approach',
    name: 'The Approach',
    description: 'Dust.',
    shortDescription: 'Dusty.',
    zone: 'crossroads',
    difficulty: 1,
    visited: true,
    flags: {},
    exits: { south: 'cr_02_checkpoint' },
    items: [],
    enemies: [],
    npcs: [],
    ...overrides,
  }
}

function seedDbRow(player: Player) {
  dbPlayerRow = {
    id: player.id,
    name: player.name,
    character_class: player.characterClass,
    vigor: player.vigor, grit: player.grit, reflex: player.reflex,
    wits: player.wits, presence: player.presence, shadow: player.shadow,
    hp: player.hp, max_hp: player.maxHp,
    current_room_id: player.currentRoomId,
    world_seed: player.worldSeed,
    xp: player.xp, level: player.level, actions_taken: player.actionsTaken ?? 0,
    is_dead: player.isDead, cycle: player.cycle ?? 1,
    total_deaths: player.totalDeaths ?? 0,
    personal_loss_type: null, personal_loss_detail: null, squirrel_name: null,
    faction_reputation: player.factionReputation ?? {},
    quest_flags: player.questFlags ?? {},
    active_buffs: [],
    pending_stat_increase: false,
    narrative_progress: { hollowPressure: 0, narrativeKeys: [] },
  }
}

// ------------------------------------------------------------
// Tests — _recordRoomDiscovery direct calls
// ------------------------------------------------------------

describe('_recordRoomDiscovery — direct', () => {
  beforeEach(() => {
    dbLedgerDiscoveredRooms = []
    dbPlayerRow = {}
    ledgerUpdateArgs = []
    vi.clearAllMocks()
  })

  it('appends new room to in-memory ledger', async () => {
    const engine = new GameEngine()
    const player = makePlayer()
    const ledger = makeLedger({ discoveredRoomIds: [] })
    engine._setState({ player, initialized: true, ledger })

    await engine._recordRoomDiscovery('cr_02_checkpoint')

    expect(engine.getState().ledger?.discoveredRoomIds).toContain('cr_02_checkpoint')
  })

  it('persists to DB via player_ledger.discovered_room_ids update', async () => {
    const engine = new GameEngine()
    const player = makePlayer()
    const ledger = makeLedger({ discoveredRoomIds: [] })
    engine._setState({ player, initialized: true, ledger })

    await engine._recordRoomDiscovery('cr_02_checkpoint')

    // The DB write should have set discovered_room_ids to ['cr_02_checkpoint']
    expect(dbLedgerDiscoveredRooms).toContain('cr_02_checkpoint')
  })

  it('is idempotent — does NOT duplicate if called twice with same room', async () => {
    const engine = new GameEngine()
    const player = makePlayer()
    const ledger = makeLedger({ discoveredRoomIds: [] })
    engine._setState({ player, initialized: true, ledger })

    await engine._recordRoomDiscovery('cr_02_checkpoint')
    await engine._recordRoomDiscovery('cr_02_checkpoint')

    const ids = engine.getState().ledger?.discoveredRoomIds ?? []
    const count = ids.filter(id => id === 'cr_02_checkpoint').length
    expect(count).toBe(1)
  })

  it('accumulates multiple distinct rooms', async () => {
    const engine = new GameEngine()
    const player = makePlayer()
    const ledger = makeLedger({ discoveredRoomIds: [] })
    engine._setState({ player, initialized: true, ledger })

    await engine._recordRoomDiscovery('cr_02_checkpoint')
    await engine._recordRoomDiscovery('cr_03_outpost')
    await engine._recordRoomDiscovery('cr_04_bridge')

    const ids = engine.getState().ledger?.discoveredRoomIds ?? []
    expect(ids).toContain('cr_02_checkpoint')
    expect(ids).toContain('cr_03_outpost')
    expect(ids).toContain('cr_04_bridge')
    expect(ids).toHaveLength(3)
  })

  it('skips DB write if room was already in ledger (idempotent at ledger level)', async () => {
    const engine = new GameEngine()
    const player = makePlayer()
    // Room already discovered
    const ledger = makeLedger({ discoveredRoomIds: ['cr_02_checkpoint'] })
    engine._setState({ player, initialized: true, ledger })
    ledgerUpdateArgs = []

    await engine._recordRoomDiscovery('cr_02_checkpoint')

    // No DB write should have been made since room is already recorded
    expect(ledgerUpdateArgs).toHaveLength(0)
  })

  it('does nothing if no player in state', async () => {
    const engine = new GameEngine()
    // No player set

    // Should not throw
    await expect(engine._recordRoomDiscovery('cr_02_checkpoint')).resolves.toBeUndefined()
    expect(dbLedgerDiscoveredRooms).toHaveLength(0)
  })

  it('does not update in-memory ledger if ledger is null (no ledger yet)', async () => {
    const engine = new GameEngine()
    const player = makePlayer()
    engine._setState({ player, initialized: true, ledger: null })

    // Should not throw even with null ledger
    await expect(engine._recordRoomDiscovery('cr_02_checkpoint')).resolves.toBeUndefined()
    // In-memory ledger stays null (not created here; only updated if it exists)
    expect(engine.getState().ledger).toBeNull()
  })
})

// ------------------------------------------------------------
// Tests — cross-cycle persistence via loadPlayer
// ------------------------------------------------------------

describe('discovered_room_ids — cross-cycle persistence via loadPlayer', () => {
  beforeEach(() => {
    dbLedgerDiscoveredRooms = ['cr_01_approach', 'cr_02_checkpoint']
    dbPlayerRow = {}
    ledgerUpdateArgs = []
    vi.clearAllMocks()
  })

  it('discovered rooms are loaded from DB into ledger on login', async () => {
    const player = makePlayer({ cycle: 2, totalDeaths: 1 })
    seedDbRow(player)

    const engine = new GameEngine()
    const found = await engine.loadPlayer('p1')

    expect(found).toBe(true)
    const loaded = engine.getState().ledger?.discoveredRoomIds ?? []
    expect(loaded).toContain('cr_01_approach')
    expect(loaded).toContain('cr_02_checkpoint')
  })

  it('newly discovered rooms are appended to pre-existing discovered list', async () => {
    // Start with one room already discovered in DB
    dbLedgerDiscoveredRooms = ['cr_01_approach']

    const player = makePlayer()
    const ledger = makeLedger({ discoveredRoomIds: ['cr_01_approach'] })
    const engine = new GameEngine()
    engine._setState({ player, initialized: true, ledger })

    await engine._recordRoomDiscovery('cr_02_checkpoint')

    const ids = engine.getState().ledger?.discoveredRoomIds ?? []
    expect(ids).toContain('cr_01_approach')
    expect(ids).toContain('cr_02_checkpoint')
    expect(ids).toHaveLength(2)
    expect(dbLedgerDiscoveredRooms).toContain('cr_01_approach')
    expect(dbLedgerDiscoveredRooms).toContain('cr_02_checkpoint')
  })
})

// ------------------------------------------------------------
// Tests — executeAction('go') fires _recordRoomDiscovery
// ------------------------------------------------------------

describe('executeAction go — triggers room discovery when room changes', () => {
  beforeEach(() => {
    dbLedgerDiscoveredRooms = []
    dbPlayerRow = {}
    ledgerUpdateArgs = []
    vi.clearAllMocks()
  })

  it('moving into a new room records the discovery', async () => {
    const { getRoom } = await import('@/lib/world')
    const mockGetRoom = getRoom as ReturnType<typeof vi.fn>
    mockGetRoom.mockResolvedValue({
      id: 'cr_02_checkpoint',
      name: 'Checkpoint',
      description: 'A ruined checkpoint.',
      shortDescription: 'Ruined checkpoint.',
      zone: 'crossroads',
      difficulty: 1,
      visited: false,
      flags: {},
      exits: { north: 'cr_01_approach' },
      items: [],
      enemies: [],
      npcs: [],
    })

    const engine = new GameEngine()
    const player = makePlayer({ currentRoomId: 'cr_01_approach' })
    const ledger = makeLedger({ discoveredRoomIds: [] })
    const room = makeRoom({
      exits: { south: 'cr_02_checkpoint' },
    })
    engine._setState({ player, initialized: true, ledger, currentRoom: room as Parameters<typeof engine._setState>[0]['currentRoom'], log: [] })

    await engine.executeAction({ verb: 'go', noun: 'south', raw: 'go south' })

    const ids = engine.getState().ledger?.discoveredRoomIds ?? []
    expect(ids).toContain('cr_02_checkpoint')
  })

  it('revisiting an already-discovered room does not duplicate it', async () => {
    const { getRoom } = await import('@/lib/world')
    const mockGetRoom = getRoom as ReturnType<typeof vi.fn>
    mockGetRoom.mockResolvedValue({
      id: 'cr_02_checkpoint',
      name: 'Checkpoint',
      description: 'A ruined checkpoint.',
      shortDescription: 'Ruined checkpoint.',
      zone: 'crossroads',
      difficulty: 1,
      visited: true,  // already visited
      flags: {},
      exits: { north: 'cr_01_approach' },
      items: [],
      enemies: [],
      npcs: [],
    })

    const engine = new GameEngine()
    const player = makePlayer({ currentRoomId: 'cr_01_approach' })
    // Room already in discoveredRoomIds
    const ledger = makeLedger({ discoveredRoomIds: ['cr_02_checkpoint'] })
    const room = makeRoom({ exits: { south: 'cr_02_checkpoint' } })
    engine._setState({ player, initialized: true, ledger, currentRoom: room as Parameters<typeof engine._setState>[0]['currentRoom'], log: [] })

    await engine.executeAction({ verb: 'go', noun: 'south', raw: 'go south' })

    const ids = engine.getState().ledger?.discoveredRoomIds ?? []
    const count = ids.filter(id => id === 'cr_02_checkpoint').length
    expect(count).toBe(1)
  })
})
