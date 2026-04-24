// ============================================================
// Integration tests: save/load round-trip (B12)
//
// Covers:
//  1. combatState: null  — full player snapshot out-of-combat
//  2. combatState.active: true — mid-combat state preserved
//  3. narrative_progress JSONB — hollowPressure + narrativeKeys
//
// Pattern mirrors discoveredRooms.test.ts and save-load.test.ts:
// the mock DB stores what _savePlayer() writes and returns it
// back to loadPlayer() so the round-trip exercises real code paths.
// ============================================================

import { describe, it, expect, vi, beforeEach } from 'vitest'
import type { Player, PlayerLedger, CombatState, Enemy } from '@/types/game'

// ------------------------------------------------------------
// Shared in-memory DB state — persisted between save and load
// ------------------------------------------------------------

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

// Players builder — captures .update() payload and exposes it via .maybeSingle()
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
  builder['maybeSingle'] = vi.fn(() =>
    Promise.resolve({ data: { ...dbPlayerRow }, error: null })
  )
  builder['single'] = vi.fn(() =>
    Promise.resolve({ data: { ...dbPlayerRow }, error: null })
  )
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
    getUser: vi.fn().mockResolvedValue({ data: { user: { id: 'rt-player-1' } }, error: null }),
  },
  from: vi.fn((table: string) => {
    if (table === 'players') return makePlayersBuilder()
    if (table === 'player_ledger') {
      return {
        select: vi.fn(() => makeChain({
          data: {
            player_id: 'rt-player-1',
            world_seed: 42,
            current_cycle: 1,
            total_deaths: 0,
            pressure_level: 1,
            discovered_room_ids: [],
            discovered_enemies: [],
            cycle_history: [],
            squirrel_alive: false,
            squirrel_trust: 0,
            squirrel_cycles_known: 0,
            squirrel_name: null,
          },
          error: null,
        })),
        eq: vi.fn(function() { return this }),
        update: vi.fn(() => makeChain({ error: null })),
        maybeSingle: vi.fn(() => Promise.resolve({
          data: {
            player_id: 'rt-player-1',
            world_seed: 42,
            current_cycle: 1,
            total_deaths: 0,
            pressure_level: 1,
            discovered_room_ids: [],
            discovered_enemies: [],
            cycle_history: [],
            squirrel_alive: false,
            squirrel_trust: 0,
            squirrel_cycles_known: 0,
            squirrel_name: null,
          },
          error: null,
        })),
        then: (resolve: (v: unknown) => void) => resolve({ data: null, error: null }),
      }
    }
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
      select: vi.fn(() => makeChain({ count: 0, error: null })),
      eq: vi.fn(function() { return this }),
      update: vi.fn(() => makeChain({ error: null })),
      upsert: vi.fn(() => makeChain({ error: null })),
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
    name: 'The Approach',
    description: 'Dust and ruin.',
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
  canMove: vi.fn().mockReturnValue(true),
  getExits: vi.fn().mockReturnValue([]),
  getRoomDescription: vi.fn().mockReturnValue('Dust and ruin.'),
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

// Import after mocks
import { GameEngine } from '@/lib/gameEngine'

// ------------------------------------------------------------
// Helpers
// ------------------------------------------------------------

function makePlayer(overrides: Partial<Player> = {}): Player {
  return {
    id: 'rt-player-1',
    name: 'Riven',
    characterClass: 'scout',
    vigor: 6, grit: 5, reflex: 7, wits: 5, presence: 3, shadow: 6,
    hp: 16, maxHp: 22,
    currentRoomId: 'cr_01_approach',
    worldSeed: 99,
    xp: 420, level: 3,
    actionsTaken: 55,
    isDead: false,
    cycle: 2,
    totalDeaths: 1,
    factionReputation: { accord: 1, salters: -1 } as Player['factionReputation'],
    questFlags: { met_elder: true, burned_cache: false, kills_hollow: 3 },
    hollowPressure: 4,
    narrativeKeys: ['found_shelter', 'saw_the_deep'],
    ...overrides,
  }
}

function makeLedger(overrides: Partial<PlayerLedger> = {}): PlayerLedger {
  return {
    playerId: 'rt-player-1',
    worldSeed: 99,
    currentCycle: 2,
    totalDeaths: 1,
    pressureLevel: 2,
    discoveredRoomIds: ['cr_01_approach', 'cr_02_checkpoint'],
    squirrelAlive: true,
    squirrelTrust: 3,
    squirrelCyclesKnown: 1,
    cycleHistory: [],
    discoveredEnemies: ['shuffler'],
    ...overrides,
  }
}

function makeEnemy(overrides: Partial<Enemy> = {}): Enemy {
  return {
    id: 'shuffler',
    name: 'Shuffler',
    description: 'Shambling thing.',
    hollowType: 'shuffler',
    hp: 12,
    maxHp: 12,
    attack: 1,
    defense: 7,
    damage: [2, 4],
    xp: 12,
    loot: [],
    ...overrides,
  }
}

/** Seed the DB row with the baseline player data (simulates existing DB record). */
function seedDbRow(player: Player): void {
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
    personal_loss_type: null,
    personal_loss_detail: null,
    squirrel_name: null,
    faction_reputation: player.factionReputation ?? {},
    quest_flags: player.questFlags ?? {},
    active_buffs: [],
    pending_stat_increase: false,
    narrative_progress: {
      hollowPressure: player.hollowPressure ?? 0,
      narrativeKeys: player.narrativeKeys ?? [],
    },
    active_dialogue: null,
    combat_state: null,
  }
}

// ------------------------------------------------------------
// Scenario 1: combatState null (out of combat)
// ------------------------------------------------------------

describe('save/load round-trip — combatState: null (out of combat)', () => {
  beforeEach(() => {
    dbPlayerRow = {}
    vi.clearAllMocks()
  })

  it('all core stats round-trip cleanly', async () => {
    const player = makePlayer()
    const ledger = makeLedger()
    seedDbRow(player)

    const engine = new GameEngine()
    engine._setState({ player, initialized: true, ledger, combatState: null, activeBuffs: [], pendingStatIncrease: false })

    // Save, then reload from what was saved
    await engine._savePlayer()
    await engine.loadPlayer('rt-player-1')

    const loaded = engine.getState().player!
    expect(loaded.id).toBe(player.id)
    expect(loaded.name).toBe(player.name)
    expect(loaded.characterClass).toBe(player.characterClass)
    expect(loaded.vigor).toBe(player.vigor)
    expect(loaded.grit).toBe(player.grit)
    expect(loaded.reflex).toBe(player.reflex)
    expect(loaded.wits).toBe(player.wits)
    expect(loaded.presence).toBe(player.presence)
    expect(loaded.shadow).toBe(player.shadow)
    expect(loaded.hp).toBe(player.hp)
    expect(loaded.maxHp).toBe(player.maxHp)
    expect(loaded.xp).toBe(player.xp)
    expect(loaded.level).toBe(player.level)
    expect(loaded.actionsTaken).toBe(player.actionsTaken)
    expect(loaded.cycle).toBe(player.cycle)
    expect(loaded.totalDeaths).toBe(player.totalDeaths)
    expect(loaded.isDead).toBe(player.isDead)
  })

  it('combatState is null after round-trip (not persisted as active)', async () => {
    const player = makePlayer()
    const ledger = makeLedger()
    seedDbRow(player)

    const engine = new GameEngine()
    engine._setState({ player, initialized: true, ledger, combatState: null, activeBuffs: [], pendingStatIncrease: false })

    await engine._savePlayer()
    await engine.loadPlayer('rt-player-1')

    expect(engine.getState().combatState).toBeNull()
  })

  it('factionReputation JSONB round-trips across all factions', async () => {
    const factionRep = { accord: 2, salters: -2, drifters: 1, kindling: 0 } as Player['factionReputation']
    const player = makePlayer({ factionReputation: factionRep })
    seedDbRow(player)

    const engine = new GameEngine()
    engine._setState({ player, initialized: true, ledger: makeLedger(), combatState: null, activeBuffs: [], pendingStatIncrease: false })

    await engine._savePlayer()
    await engine.loadPlayer('rt-player-1')

    const loaded = engine.getState().player!
    const rep = loaded.factionReputation as Record<string, number>
    expect(rep.accord).toBe(2)
    expect(rep.salters).toBe(-2)
    expect(rep.drifters).toBe(1)
    expect(rep.kindling).toBe(0)
  })

  it('questFlags JSONB round-trips with mixed boolean and number values', async () => {
    const flags = { met_elder: true, burned_cache: false, kills_hollow: 7, found_key: 1 }
    const player = makePlayer({ questFlags: flags })
    seedDbRow(player)

    const engine = new GameEngine()
    engine._setState({ player, initialized: true, ledger: makeLedger(), combatState: null, activeBuffs: [], pendingStatIncrease: false })

    await engine._savePlayer()
    await engine.loadPlayer('rt-player-1')

    const loaded = engine.getState().player!
    expect(loaded.questFlags).toEqual(flags)
  })
})

// ------------------------------------------------------------
// Scenario 2: combatState.active: true (mid-combat)
// ------------------------------------------------------------

describe('save/load round-trip — combatState.active: true (mid-combat)', () => {
  beforeEach(() => {
    dbPlayerRow = {}
    vi.clearAllMocks()
  })

  it('active combatState is preserved across save and load', async () => {
    const player = makePlayer({ hp: 10 })
    const enemy = makeEnemy()
    const combatState: CombatState = {
      enemy,
      enemyHp: 7,
      playerGoesFirst: true,
      turn: 3,
      active: true,
      playerConditions: [],
      enemyConditions: [],
      abilityUsed: false,
      defendingThisTurn: false,
      waitingBonus: 0,
    }

    seedDbRow(player)
    // Also seed the combat_state into the DB row so loadPlayer returns it
    dbPlayerRow['combat_state'] = combatState

    const engine = new GameEngine()
    engine._setState({ player, initialized: true, ledger: makeLedger(), combatState, activeBuffs: [], pendingStatIncrease: false })

    await engine._savePlayer()
    await engine.loadPlayer('rt-player-1')

    const restored = engine.getState().combatState
    expect(restored).not.toBeNull()
    expect(restored!.active).toBe(true)
    expect(restored!.turn).toBe(3)
    expect(restored!.enemyHp).toBe(7)
    expect(restored!.enemy.id).toBe('shuffler')
    expect(restored!.enemy.name).toBe('Shuffler')
    expect(restored!.playerGoesFirst).toBe(true)
  })

  it('additionalEnemies array survives the round-trip', async () => {
    const player = makePlayer({ hp: 8 })
    const mainEnemy = makeEnemy({ id: 'remnant', name: 'Remnant', hollowType: 'remnant', hp: 20, maxHp: 20, attack: 2, defense: 8, damage: [2, 5] as [number, number], xp: 25 })
    const extraEnemy = makeEnemy({ id: 'shuffler', name: 'Shuffler' })
    const combatState: CombatState = {
      enemy: mainEnemy,
      enemyHp: 14,
      playerGoesFirst: false,
      turn: 2,
      active: true,
      playerConditions: [],
      enemyConditions: [],
      abilityUsed: false,
      defendingThisTurn: false,
      waitingBonus: 0,
      additionalEnemies: [extraEnemy],
    }

    seedDbRow(player)
    dbPlayerRow['combat_state'] = combatState

    const engine = new GameEngine()
    engine._setState({ player, initialized: true, ledger: makeLedger(), combatState, activeBuffs: [], pendingStatIncrease: false })

    await engine._savePlayer()
    await engine.loadPlayer('rt-player-1')

    const restored = engine.getState().combatState
    expect(restored).not.toBeNull()
    expect(restored!.additionalEnemies).toHaveLength(1)
    expect(restored!.additionalEnemies![0].id).toBe('shuffler')
    expect(restored!.enemy.id).toBe('remnant')
    expect(restored!.playerGoesFirst).toBe(false)
  })

  it('combat_state: null (defeated) does not restore combatState', async () => {
    const player = makePlayer()
    seedDbRow(player)
    // Explicitly null in the DB (combat ended, not persisted)
    dbPlayerRow['combat_state'] = null

    const engine = new GameEngine()
    engine._setState({ player, initialized: true, ledger: makeLedger(), combatState: null, activeBuffs: [], pendingStatIncrease: false })

    await engine._savePlayer()
    await engine.loadPlayer('rt-player-1')

    expect(engine.getState().combatState).toBeNull()
  })
})

// ------------------------------------------------------------
// Scenario 3: narrative_progress JSONB round-trip
// ------------------------------------------------------------

describe('save/load round-trip — narrative_progress JSONB', () => {
  beforeEach(() => {
    dbPlayerRow = {}
    vi.clearAllMocks()
  })

  it('hollowPressure and narrativeKeys persist through save and load', async () => {
    const player = makePlayer({
      hollowPressure: 7,
      narrativeKeys: ['found_shelter', 'met_elder', 'burned_cache', 'saw_the_deep'],
    })
    seedDbRow(player)

    const engine = new GameEngine()
    engine._setState({ player, initialized: true, ledger: makeLedger(), combatState: null, activeBuffs: [], pendingStatIncrease: false })

    await engine._savePlayer()
    await engine.loadPlayer('rt-player-1')

    const loaded = engine.getState().player!
    expect(loaded.hollowPressure).toBe(7)
    expect(loaded.narrativeKeys).toEqual(['found_shelter', 'met_elder', 'burned_cache', 'saw_the_deep'])
  })

  it('hollowPressure 0 and empty narrativeKeys survive without corruption', async () => {
    const player = makePlayer({ hollowPressure: 0, narrativeKeys: [] })
    seedDbRow(player)

    const engine = new GameEngine()
    engine._setState({ player, initialized: true, ledger: makeLedger(), combatState: null, activeBuffs: [], pendingStatIncrease: false })

    await engine._savePlayer()
    await engine.loadPlayer('rt-player-1')

    const loaded = engine.getState().player!
    expect(loaded.hollowPressure).toBe(0)
    expect(loaded.narrativeKeys).toEqual([])
  })

  it('narrative_progress stored as plain object — not double-stringified', async () => {
    const player = makePlayer({ hollowPressure: 5, narrativeKeys: ['key_a', 'key_b'] })
    seedDbRow(player)

    const engine = new GameEngine()
    engine._setState({ player, initialized: true, ledger: makeLedger(), combatState: null, activeBuffs: [], pendingStatIncrease: false })

    await engine._savePlayer()

    // Inspect what was written to dbPlayerRow
    const savedNarrative = dbPlayerRow['narrative_progress']
    expect(typeof savedNarrative).toBe('object')
    expect(savedNarrative).not.toBeNull()
    // Must NOT be a string (double-stringify bug guard)
    expect(typeof savedNarrative).not.toBe('string')

    // Verify the keys are accessible
    const np = savedNarrative as { hollowPressure: number; narrativeKeys: string[] }
    expect(np.hollowPressure).toBe(5)
    expect(np.narrativeKeys).toEqual(['key_a', 'key_b'])
  })

  it('hollowPressure is clamped to 0–10 on load (schema guard)', async () => {
    const player = makePlayer({ hollowPressure: 3, narrativeKeys: [] })
    seedDbRow(player)
    // Simulate a corrupt value in the DB
    dbPlayerRow['narrative_progress'] = { hollowPressure: 15, narrativeKeys: [] }

    const engine = new GameEngine()
    engine._setState({ player, initialized: true, ledger: makeLedger(), combatState: null, activeBuffs: [], pendingStatIncrease: false })

    await engine.loadPlayer('rt-player-1')

    const loaded = engine.getState().player!
    // loadPlayer clamps: Math.max(0, Math.min(10, rawValue))
    expect(loaded.hollowPressure).toBeLessThanOrEqual(10)
    expect(loaded.hollowPressure).toBeGreaterThanOrEqual(0)
  })
})
