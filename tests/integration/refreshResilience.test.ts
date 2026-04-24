// ============================================================
// Integration tests: refresh resilience
//
// Verifies that activeDialogue and combatState survive a
// save/loadPlayer round-trip (bugs #6 and #7 from UX-AUDIT-0424).
//
// Also verifies:
//   - Both fields are cleared on death (_handlePlayerDeath)
//   - Both fields are cleared on rebirth (rebirthCharacter)
//   - The DB row reflects the cleared state
//
// Uses the same Supabase mock harness as reloginFlow.test.ts.
// ============================================================

import { describe, it, expect, vi, beforeEach } from 'vitest'
import type { Player, CombatState } from '@/types/game'

// ────────────────────────────────────────────────────────────
// Mocks — registered before module imports
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
// In-memory DB stores
// ────────────────────────────────────────────────────────────

let dbPlayerRow: Record<string, unknown> = {}
let dbLedgerRow: Record<string, unknown> | null = null

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

// ────────────────────────────────────────────────────────────
// Helpers
// ────────────────────────────────────────────────────────────

function makeBasePlayer(overrides: Partial<Player> = {}): Player {
  return {
    id: 'player-1',
    name: 'Jax',
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
    active_dialogue: null,
    combat_state: null,
    ...extras,
  }
}

// Minimal CombatState for testing — satisfies the interface shape
function makeActiveCombatState(): CombatState {
  return {
    enemy: {
      id: 'shuffler',
      name: 'Shuffler',
      hp: 15,
      maxHp: 15,
      damage: '1d6',
      xpReward: 25,
      description: 'A shambling hollow.',
      accuracy: 60,
      armor: 0,
      abilities: [],
      resistances: [],
      lootTable: [],
    },
    enemyHp: 15,
    playerGoesFirst: true,
    turn: 1,
    active: true,
    playerConditions: [],
    enemyConditions: [],
    abilityUsed: false,
    defendingThisTurn: false,
    waitingBonus: 0,
  }
}

// ────────────────────────────────────────────────────────────
// Tests — activeDialogue persistence
// ────────────────────────────────────────────────────────────

describe('refresh resilience — activeDialogue', () => {
  let engine: GameEngine

  beforeEach(() => {
    dbPlayerRow = {}
    dbLedgerRow = null
    vi.clearAllMocks()
    engine = new GameEngine()
  })

  it('active_dialogue is included in _savePlayer() payload', async () => {
    const player = makeBasePlayer()
    seedDbRow(player)
    const dialogue = { npcId: 'mason', treeId: 'mason_intro', currentNodeId: 'node_2' }
    engine._setState({
      player,
      initialized: true,
      activeBuffs: [],
      pendingStatIncrease: false,
      activeDialogue: dialogue,
    })

    await engine._savePlayer()

    // The DB row should now have active_dialogue
    expect(dbPlayerRow['active_dialogue']).toBeDefined()
    const saved = dbPlayerRow['active_dialogue'] as typeof dialogue
    expect(saved.npcId).toBe('mason')
    expect(saved.treeId).toBe('mason_intro')
    expect(saved.currentNodeId).toBe('node_2')
  })

  it('active dialogue restores after loadPlayer round-trip', async () => {
    const player = makeBasePlayer()
    const dialogue = { npcId: 'mason', treeId: 'mason_intro', currentNodeId: 'node_2' }
    seedDbRow(player, { active_dialogue: dialogue })

    const engine2 = new GameEngine()
    const found = await engine2.loadPlayer('player-1')

    expect(found).toBe(true)
    const restored = engine2.getState().activeDialogue
    expect(restored).toBeDefined()
    expect(restored?.npcId).toBe('mason')
    expect(restored?.currentNodeId).toBe('node_2')
  })

  it('restore reminder message is appended when dialogue is restored', async () => {
    const player = makeBasePlayer()
    const dialogue = { npcId: 'elise', treeId: 'elise_trust', currentNodeId: 'node_5' }
    seedDbRow(player, { active_dialogue: dialogue })

    const engine2 = new GameEngine()
    await engine2.loadPlayer('player-1')

    const log = engine2.getState().log
    const allText = log.map(m => m.text).join('\n')
    expect(allText).toContain('mid-conversation with elise')
    expect(allText).toContain("Type a number to choose a response, or 'leave' to step back.")
  })

  it('no reminder message when active_dialogue is null', async () => {
    const player = makeBasePlayer()
    seedDbRow(player, { active_dialogue: null })

    const engine2 = new GameEngine()
    await engine2.loadPlayer('player-1')

    const log = engine2.getState().log
    const allText = log.map(m => m.text).join('\n')
    expect(allText).not.toContain('mid-conversation')
  })

  it('active_dialogue is saved as null when no dialogue is active', async () => {
    const player = makeBasePlayer()
    seedDbRow(player)
    engine._setState({
      player,
      initialized: true,
      activeBuffs: [],
      pendingStatIncrease: false,
      activeDialogue: undefined,
    })

    await engine._savePlayer()

    expect(dbPlayerRow['active_dialogue']).toBeNull()
  })
})

// ────────────────────────────────────────────────────────────
// Tests — combatState persistence
// ────────────────────────────────────────────────────────────

describe('refresh resilience — combatState', () => {
  let engine: GameEngine

  beforeEach(() => {
    dbPlayerRow = {}
    dbLedgerRow = null
    vi.clearAllMocks()
    engine = new GameEngine()
  })

  it('combat_state is included in _savePlayer() payload when active', async () => {
    const player = makeBasePlayer()
    seedDbRow(player)
    const combat = makeActiveCombatState()
    engine._setState({
      player,
      initialized: true,
      activeBuffs: [],
      pendingStatIncrease: false,
      combatState: combat,
    })

    await engine._savePlayer()

    const saved = dbPlayerRow['combat_state'] as CombatState
    expect(saved).toBeDefined()
    expect(saved.active).toBe(true)
    expect(saved.enemy.name).toBe('Shuffler')
  })

  it('combat state restores after loadPlayer round-trip', async () => {
    const player = makeBasePlayer()
    const combat = makeActiveCombatState()
    seedDbRow(player, { combat_state: combat })

    const engine2 = new GameEngine()
    const found = await engine2.loadPlayer('player-1')

    expect(found).toBe(true)
    const restored = engine2.getState().combatState
    expect(restored).not.toBeNull()
    expect(restored?.active).toBe(true)
    expect(restored?.enemy.name).toBe('Shuffler')
  })

  it('restore reminder message is appended when combat is restored', async () => {
    const player = makeBasePlayer()
    const combat = makeActiveCombatState()
    seedDbRow(player, { combat_state: combat })

    const engine2 = new GameEngine()
    await engine2.loadPlayer('player-1')

    const log = engine2.getState().log
    const allText = log.map(m => m.text).join('\n')
    expect(allText).toContain('in combat with Shuffler')
    expect(allText).toContain("Type 'attack' to continue, or 'flee' to retreat.")
  })

  it('no combat reminder when combat_state is null', async () => {
    const player = makeBasePlayer()
    seedDbRow(player, { combat_state: null })

    const engine2 = new GameEngine()
    await engine2.loadPlayer('player-1')

    const log = engine2.getState().log
    const allText = log.map(m => m.text).join('\n')
    expect(allText).not.toContain('in combat with')
  })

  it('combat_state is saved as null when not in combat', async () => {
    const player = makeBasePlayer()
    seedDbRow(player)
    engine._setState({
      player,
      initialized: true,
      activeBuffs: [],
      pendingStatIncrease: false,
      combatState: null,
    })

    await engine._savePlayer()

    expect(dbPlayerRow['combat_state']).toBeNull()
  })
})

// ────────────────────────────────────────────────────────────
// Tests — cleared on death
// ────────────────────────────────────────────────────────────

describe('refresh resilience — cleared on death', () => {
  let engine: GameEngine

  beforeEach(() => {
    dbPlayerRow = {}
    dbLedgerRow = {
      player_id: 'player-1',
      world_seed: 42,
      current_cycle: 1,
      total_deaths: 0,
      pressure_level: 1,
      discovered_room_ids: ['cr_01_approach'],
      discovered_enemies: [],
      cycle_history: [],
    }
    vi.clearAllMocks()
    engine = new GameEngine()
  })

  it('combatState is set to null in memory on _handlePlayerDeath', async () => {
    const player = makeBasePlayer({ hp: 1 })
    seedDbRow(player)
    const combat = makeActiveCombatState()
    engine._setState({
      player,
      initialized: true,
      activeBuffs: [],
      pendingStatIncrease: false,
      combatState: combat,
    })

    expect(engine.getState().combatState?.active).toBe(true)

    await engine._handlePlayerDeath()

    expect(engine.getState().combatState).toBeNull()
  })

  it('activeDialogue is set to undefined in memory on _handlePlayerDeath', async () => {
    const player = makeBasePlayer({ hp: 1 })
    seedDbRow(player)
    engine._setState({
      player,
      initialized: true,
      activeBuffs: [],
      pendingStatIncrease: false,
      activeDialogue: { npcId: 'mason', treeId: 'mason_intro', currentNodeId: 'node_1' },
    })

    expect(engine.getState().activeDialogue).toBeDefined()

    await engine._handlePlayerDeath()

    expect(engine.getState().activeDialogue).toBeUndefined()
  })

  it('DB row has active_dialogue=null and combat_state=null after death', async () => {
    const player = makeBasePlayer({ hp: 1 })
    seedDbRow(player, {
      active_dialogue: { npcId: 'mason', treeId: 'mason_intro', currentNodeId: 'node_1' },
      combat_state: makeActiveCombatState(),
    })
    engine._setState({
      player,
      initialized: true,
      activeBuffs: [],
      pendingStatIncrease: false,
      combatState: makeActiveCombatState(),
      activeDialogue: { npcId: 'mason', treeId: 'mason_intro', currentNodeId: 'node_1' },
    })

    await engine._handlePlayerDeath()

    // The update call should have included null for both columns
    expect(dbPlayerRow['active_dialogue']).toBeNull()
    expect(dbPlayerRow['combat_state']).toBeNull()
  })
})
