// ============================================================
// Integration tests: createCharacter — ledger state
//
// Regression test for the "Loading world..." bug:
// createCharacter() upserted a player_ledger row to the DB then
// hardcoded ledger: null in _setState, causing WorldMapTab to
// render "Loading world..." for all first-time / dev-mode characters.
//
// Covers:
//  1. state.ledger is non-null after createCharacter
//  2. ledger fields match the upserted row shape
//  3. starting room appears in discoveredRoomIds after markVisited threads through
// ============================================================

import { describe, it, expect, vi, beforeEach } from 'vitest'

// ------------------------------------------------------------
// Mocks — must be registered before module imports
// ------------------------------------------------------------

// Track what was upserted to player_ledger
let dbLedgerRow: Record<string, unknown> | null = null
let dbPlayerRow: Record<string, unknown> = {}

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
  builder['upsert'] = vi.fn((vals: Record<string, unknown>) => {
    // Store the upserted row for inspection
    dbLedgerRow = { ...vals }
    return makeChain({ data: vals, error: null })
  })
  builder['insert'] = vi.fn((vals: Record<string, unknown>) => {
    dbLedgerRow = { ...vals }
    return makeChain({ data: vals, error: null })
  })
  builder['update'] = vi.fn((vals: Record<string, unknown>) => {
    pendingUpdate = vals
    return builder
  })
  builder['select'] = vi.fn(() => builder)
  builder['eq'] = vi.fn(() => {
    if (pendingUpdate !== null && dbLedgerRow !== null) {
      Object.assign(dbLedgerRow, pendingUpdate)
      pendingUpdate = null
    }
    return builder
  })
  builder['maybeSingle'] = vi.fn(() =>
    Promise.resolve({ data: dbLedgerRow ? { ...dbLedgerRow } : null, error: null })
  )
  builder['single'] = vi.fn(() =>
    Promise.resolve({ data: dbLedgerRow ? { ...dbLedgerRow } : null, error: null })
  );
  (builder as Record<string, unknown>)['then'] = (resolve: (v: unknown) => void) => {
    if (pendingUpdate !== null && dbLedgerRow !== null) {
      Object.assign(dbLedgerRow, pendingUpdate)
      pendingUpdate = null
    }
    resolve({ data: dbLedgerRow ? { ...dbLedgerRow } : null, error: null })
  }
  return builder
}

function makePlayersBuilder() {
  let pendingUpdate: Record<string, unknown> | null = null
  const builder: Record<string, unknown> = {}
  builder['upsert'] = vi.fn((vals: Record<string, unknown>) => {
    dbPlayerRow = { ...vals }
    return makeChain({ data: vals, error: null })
  })
  builder['update'] = vi.fn((vals: Record<string, unknown>) => {
    pendingUpdate = vals
    return builder
  })
  builder['eq'] = vi.fn(() => {
    if (pendingUpdate !== null) { Object.assign(dbPlayerRow, pendingUpdate); pendingUpdate = null }
    return builder
  })
  builder['select'] = vi.fn(() => builder)
  builder['maybeSingle'] = vi.fn(() => Promise.resolve({ data: { ...dbPlayerRow }, error: null }))
  builder['single'] = vi.fn(() => Promise.resolve({ data: { ...dbPlayerRow }, error: null }))
  builder['delete'] = vi.fn(() => builder);
  (builder as Record<string, unknown>)['then'] = (resolve: (v: unknown) => void) => {
    if (pendingUpdate !== null) { Object.assign(dbPlayerRow, pendingUpdate); pendingUpdate = null }
    resolve({ data: { ...dbPlayerRow }, error: null })
  }
  return builder
}

const mockDb = {
  auth: {
    refreshSession: vi.fn().mockResolvedValue({}),
    getUser: vi.fn().mockResolvedValue({
      data: { user: { id: 'test-user-id' } },
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
    // generated_rooms, room_state, etc.
    return {
      select: vi.fn(() => makeChain({ count: 0, error: null })),
      eq: vi.fn(function() { return this }),
      update: vi.fn(() => makeChain({ error: null })),
      upsert: vi.fn(() => makeChain({ error: null })),
      insert: vi.fn(() => makeChain({ error: null })),
      delete: vi.fn(() => makeChain({ error: null })),
      then: (resolve: (v: unknown) => void) => resolve({ count: 0, error: null }),
    }
  }),
}

vi.mock('@/lib/supabase', () => ({
  createSupabaseBrowserClient: () => mockDb,
}))

vi.mock('@/lib/world', () => ({
  getRoom: vi.fn().mockResolvedValue({
    id: 'cr_01_approach',
    name: 'Highway Junction — The Approach',
    description: 'Dust and broken asphalt.',
    shortDescription: 'Dusty approach.',
    zone: 'crossroads',
    difficulty: 1,
    visited: false,
    flags: {},
    exits: { north: 'cr_02_crossroads_hub' },
    items: [],
    enemies: [],
    npcs: [],
  }),
  updateRoomItems: vi.fn().mockResolvedValue(undefined),
  updateRoomFlags: vi.fn().mockResolvedValue(undefined),
  markVisited: vi.fn().mockResolvedValue(undefined),
  persistWorld: vi.fn().mockResolvedValue(undefined),
  canMove: vi.fn().mockReturnValue(true),
  getExits: vi.fn().mockReturnValue([]),
  getRoomDescription: vi.fn().mockReturnValue('Dust and broken asphalt.'),
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

vi.mock('@/lib/hollowPressure', () => ({
  computePressure: vi.fn().mockReturnValue(1),
  applyPressureDelta: vi.fn().mockReturnValue(0),
  getPressureNarration: vi.fn().mockReturnValue([]),
  getMundaneHorrorNarration: vi.fn().mockReturnValue(null),
  shouldTriggerSwarm: vi.fn().mockReturnValue(false),
}))

vi.mock('@/lib/worldEvents', () => ({
  getScheduledEvents: vi.fn().mockReturnValue([]),
  executeWorldEvent: vi.fn().mockReturnValue([]),
}))

vi.mock('@/lib/npcInitiative', () => ({
  checkInitiativeTriggers: vi.fn().mockReturnValue({ trigger: null, updatedLastAction: 0 }),
  getInitiativeNarration: vi.fn().mockReturnValue([]),
}))

vi.mock('@/lib/companionSystem', () => ({
  getCompanionCommentary: vi.fn().mockReturnValue(null),
  getPersonalMoment: vi.fn().mockReturnValue(null),
}))

vi.mock('@/lib/factionWeb', () => ({
  getFactionRipple: vi.fn().mockReturnValue({ effects: [], narration: [] }),
  getDelayedRippleNarration: vi.fn().mockReturnValue(null),
}))

vi.mock('@/lib/playerMonologue', () => ({
  shouldTriggerMonologue: vi.fn().mockReturnValue(false),
  generateMonologue: vi.fn().mockResolvedValue(null),
  getPhysicalStateNarration: vi.fn().mockReturnValue(null),
  getReputationVoice: vi.fn().mockReturnValue(null),
  resetMonologueSession: vi.fn(),
}))

vi.mock('@/lib/narratorVoice', () => ({
  shouldNarratorSpeak: vi.fn().mockReturnValue(false),
  generateNarratorVoice: vi.fn().mockReturnValue(null),
  getNarratorActTransition: vi.fn().mockReturnValue([]),
  clearNarratorSession: vi.fn(),
}))

// Import after mocks
import { GameEngine } from '@/lib/gameEngine'

// ------------------------------------------------------------
// Valid enforcer stat block
// enforcer classBonus: { vigor: 4, grit: 2, reflex: 2 }, freePoints: 4
// Floors: vigor=6, grit=4, reflex=4, others=2
// totalBonus = (6-2)+(4-2)+(4-2)+(4-2)+(2-2)+(4-2) = 4+2+2+2+0+2 = 12
// expectedTotal = 4+2+2+4 = 12 ✓
// ------------------------------------------------------------
const VALID_ENFORCER_STATS = {
  vigor: 6,
  grit: 4,
  reflex: 4,
  wits: 4,
  presence: 2,
  shadow: 4,
}

// ------------------------------------------------------------
// Tests
// ------------------------------------------------------------

describe('createCharacter — ledger state', () => {
  beforeEach(() => {
    dbLedgerRow = null
    dbPlayerRow = {}
    vi.clearAllMocks()
  })

  it('populates state.ledger with the upserted row shape', async () => {
    const engine = new GameEngine()

    await engine.createCharacter('Tester', VALID_ENFORCER_STATS, 'enforcer')

    const ledger = engine.getState().ledger

    expect(ledger).not.toBeNull()
    expect(ledger!.currentCycle).toBe(1)
    expect(ledger!.pressureLevel).toBe(1)
    expect(ledger!.totalDeaths).toBe(0)
    expect(Array.isArray(ledger!.discoveredRoomIds)).toBe(true)
    expect(typeof ledger!.worldSeed).toBe('number')
    expect(ledger!.squirrelAlive).toBe(true)
    expect(ledger!.squirrelTrust).toBe(0)
    expect(Array.isArray(ledger!.cycleHistory)).toBe(true)
    expect(ledger!.cycleHistory).toHaveLength(0)
  })

  it('includes the starting room in discoveredRoomIds after markVisited', async () => {
    const { markVisited } = await import('@/lib/world')
    const mockMarkVisited = markVisited as ReturnType<typeof vi.fn>

    // Override markVisited to call _recordRoomDiscovery side effect
    // The real markVisited is mocked, but _recordRoomDiscovery reads state.ledger
    // and calls supabase update — we verify via state
    mockMarkVisited.mockImplementation(async (roomId: string, playerId: string) => {
      // Trigger the engine's internal room discovery tracking
      await engine._recordRoomDiscovery(roomId)
      void playerId
    })

    const engine = new GameEngine()

    await engine.createCharacter('Tester', VALID_ENFORCER_STATS, 'enforcer')

    const ledger = engine.getState().ledger
    expect(ledger).not.toBeNull()
    // After markVisited fires, the start room should be in discoveredRoomIds
    expect(ledger!.discoveredRoomIds).toContain('cr_01_approach')
  })
})
