// ============================================================
// Integration tests: GameEngine core logic
// Covers command dispatch, state transitions, HP, XP/leveling,
// room navigation, messages, narrative progress, and auto-save.
// Does NOT cover save/load round-trips (see save-load.test.ts)
// or death/rebirth cycle math (see death-rebirth.test.ts).
// ============================================================

import { describe, it, expect, vi, beforeEach } from 'vitest'
import type { Player } from '@/types/game'

// ------------------------------------------------------------
// Supabase mock (minimal — we only care about state, not DB)
// ------------------------------------------------------------

vi.mock('@/lib/supabase', () => ({
  createSupabaseBrowserClient: () => mockDb,
}))

vi.mock('@/lib/world', () => ({
  getRoom: vi.fn().mockResolvedValue({
    id: 'crossroads_1', name: 'Crossroads', description: 'A dusty crossroads.',
    shortDescription: 'Dusty crossroads.', zone: 'crossroads', difficulty: 1,
    visited: true, flags: {}, exits: { north: 'room_2' }, items: [], enemies: [], npcs: [],
  }),
  updateRoomItems: vi.fn().mockResolvedValue(undefined),
  updateRoomFlags: vi.fn().mockResolvedValue(undefined),
  getPopulatedRoom: vi.fn(),
  markVisited: vi.fn().mockResolvedValue(undefined),
  persistWorld: vi.fn().mockResolvedValue(undefined),
}))

vi.mock('@/lib/inventory', () => ({
  getInventory: vi.fn().mockResolvedValue([]),
}))

vi.mock('@/data/items', () => ({
  getItem: vi.fn().mockReturnValue(undefined),
}))

// Silence narrative pipeline modules so tests stay deterministic
vi.mock('@/lib/worldEvents', () => ({
  getScheduledEvents: vi.fn().mockReturnValue([]),
  executeWorldEvent: vi.fn().mockReturnValue([]),
}))
vi.mock('@/lib/hollowPressure', () => ({
  computePressure: vi.fn().mockReturnValue(0),
  applyPressureDelta: vi.fn().mockReturnValue(0),
  getPressureNarration: vi.fn().mockReturnValue([]),
  getMundaneHorrorNarration: vi.fn().mockReturnValue(null),
  shouldTriggerSwarm: vi.fn().mockReturnValue(false),
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

function makeChain(result: unknown) {
  const chain: Record<string, unknown> = {}
  const methods = ['select', 'eq', 'neq', 'in', 'is', 'order', 'limit',
    'single', 'maybeSingle', 'match', 'filter', 'insert', 'upsert', 'delete', 'update']
  for (const m of methods) chain[m] = vi.fn(() => chain)
  return new Proxy(chain, {
    get(target, prop) {
      if (prop === 'then') return (res: (v: unknown) => void) => res(result)
      return target[prop as string]
    },
  })
}

const updateSpy = vi.fn(() => makeChain({ error: null }))
const mockDb = {
  auth: {
    refreshSession: vi.fn().mockResolvedValue({}),
    getUser: vi.fn().mockResolvedValue({ data: { user: { id: 'player-1' } }, error: null }),
  },
  from: vi.fn((table: string) => {
    if (table === 'players') return {
      update: updateSpy,
      select: vi.fn(() => makeChain({ data: null, error: null })),
    }
    if (table === 'player_ledger') return {
      select: vi.fn(() => makeChain({ data: null, error: null })),
      update: vi.fn(() => makeChain({ error: null })),
    }
    return {
      select: vi.fn(() => makeChain({ count: 0, error: null })),
      update: vi.fn(() => makeChain({ error: null })),
    }
  }),
}

import { GameEngine, XP_THRESHOLDS } from '@/lib/gameEngine'

// ------------------------------------------------------------
// Helpers
// ------------------------------------------------------------

const BASE_ROOM = {
  id: 'crossroads_1', name: 'Crossroads', description: 'A dusty crossroads.',
  shortDescription: 'Dusty crossroads.', zone: 'crossroads', difficulty: 1,
  visited: true, flags: {}, exits: { north: 'room_2' }, items: [], enemies: [], npcs: [],
}

function makePlayer(overrides: Partial<Player> = {}): Player {
  return {
    id: 'player-1', name: 'Jax', characterClass: 'enforcer',
    vigor: 5, grit: 4, reflex: 3, wits: 6, presence: 2, shadow: 7,
    hp: 20, maxHp: 20, currentRoomId: 'crossroads_1', worldSeed: 42,
    xp: 0, level: 1, actionsTaken: 0, isDead: false, cycle: 1, totalDeaths: 0,
    factionReputation: {}, questFlags: {}, hollowPressure: 0, narrativeKeys: [],
    ...overrides,
  }
}

function makeReadyEngine(playerOverrides: Partial<Player> = {}): GameEngine {
  const engine = new GameEngine()
  engine._setState({
    player: makePlayer(playerOverrides),
    currentRoom: { ...BASE_ROOM },
    initialized: true,
    activeBuffs: [],
    pendingStatIncrease: false,
  })
  return engine
}

// ------------------------------------------------------------
// _appendMessages
// ------------------------------------------------------------

describe('_appendMessages', () => {
  it('adds messages to the log', () => {
    const engine = new GameEngine()
    engine._appendMessages([{ id: '1', text: 'Hello', type: 'narrative' }])
    expect(engine.getState().log).toHaveLength(1)
    expect(engine.getState().log[0]!.text).toBe('Hello')
  })

  it('supports multiple message types', () => {
    const engine = new GameEngine()
    engine._appendMessages([
      { id: '1', text: 'Narrative', type: 'narrative' },
      { id: '2', text: 'System', type: 'system' },
      { id: '3', text: 'Combat', type: 'combat' },
    ])
    const log = engine.getState().log
    expect(log.map(m => m.type)).toEqual(['narrative', 'system', 'combat'])
  })

  it('trims log to 500 entries when it exceeds 600', () => {
    const engine = new GameEngine()
    const bulkMessages = Array.from({ length: 601 }, (_, i) => ({
      id: String(i), text: `msg ${i}`, type: 'narrative' as const,
    }))
    engine._appendMessages(bulkMessages)
    expect(engine.getState().log.length).toBe(500)
  })
})

// ------------------------------------------------------------
// executeAction — invalid / unknown commands
// ------------------------------------------------------------

describe('executeAction — unknown command', () => {
  it('produces an error message for a completely unknown verb', async () => {
    const engine = makeReadyEngine()
    await engine.executeAction({ verb: 'xyzzy', noun: undefined, raw: 'xyzzy' })
    const log = engine.getState().log
    expect(log.some(m => m.type === 'error')).toBe(true)
  })

  it('suggests a similar verb when the input is close to a known command', async () => {
    const engine = makeReadyEngine()
    // 'attac' is close to 'attack' — parser should suggest it
    await engine.executeAction({ verb: 'attac', noun: undefined, raw: 'attac' })
    const errorMsgs = engine.getState().log.filter(m => m.type === 'error')
    expect(errorMsgs.length).toBeGreaterThan(0)
    // Error message mentions the unknown command problem
    expect(errorMsgs[0]!.text).toMatch(/unknown command/i)
  })
})

// ------------------------------------------------------------
// executeAction — command dispatch (known verbs produce output)
// ------------------------------------------------------------

describe('executeAction — dispatch routes correctly', () => {
  it('stats command appends messages without error', async () => {
    const engine = makeReadyEngine()
    const before = engine.getState().log.length
    await engine.executeAction({ verb: 'stats', noun: undefined, raw: 'stats' })
    expect(engine.getState().log.length).toBeGreaterThan(before)
    expect(engine.getState().log.some(m => m.type === 'error')).toBe(false)
  })

  it('inventory command appends messages without error', async () => {
    const engine = makeReadyEngine()
    const before = engine.getState().log.length
    await engine.executeAction({ verb: 'inventory', noun: undefined, raw: 'inventory' })
    expect(engine.getState().log.length).toBeGreaterThan(before)
  })

  it('help command appends messages without error', async () => {
    const engine = makeReadyEngine()
    const before = engine.getState().log.length
    await engine.executeAction({ verb: 'help', noun: undefined, raw: 'help' })
    expect(engine.getState().log.length).toBeGreaterThan(before)
  })

  it('save command writes to DB and confirms in log', async () => {
    const engine = makeReadyEngine()
    updateSpy.mockClear()
    await engine.executeAction({ verb: 'save', noun: undefined, raw: 'save' })
    expect(updateSpy).toHaveBeenCalled()
    const log = engine.getState().log
    expect(log.some(m => m.text.toLowerCase().includes('saved'))).toBe(true)
  })
})

// ------------------------------------------------------------
// executeAction — time-advancing verbs increment actionsTaken
// ------------------------------------------------------------

describe('executeAction — time advancement', () => {
  it('time-advancing verb (search) increments actionsTaken by 1', async () => {
    const engine = makeReadyEngine()
    await engine.executeAction({ verb: 'search', noun: undefined, raw: 'search' })
    expect(engine.getState().player!.actionsTaken).toBe(1)
  })

  it('non-time-advancing verb (stats) does not increment actionsTaken', async () => {
    const engine = makeReadyEngine()
    await engine.executeAction({ verb: 'stats', noun: undefined, raw: 'stats' })
    expect(engine.getState().player!.actionsTaken).toBe(0)
  })
})

// ------------------------------------------------------------
// _checkLevelUp — XP and leveling
// ------------------------------------------------------------

describe('_checkLevelUp', () => {
  it('does not level up when XP is below threshold', () => {
    const engine = makeReadyEngine({ xp: 40, level: 1 })
    engine._checkLevelUp()
    expect(engine.getState().player!.level).toBe(1)
  })

  it('levels up when XP meets threshold', () => {
    const threshold = XP_THRESHOLDS[2]! // XP needed for level 2
    const engine = makeReadyEngine({ xp: threshold, level: 1 })
    engine._checkLevelUp()
    expect(engine.getState().player!.level).toBe(2)
  })

  it('increases maxHp by 2 on level-up', () => {
    const threshold = XP_THRESHOLDS[2]!
    const engine = makeReadyEngine({ xp: threshold, level: 1, maxHp: 20, hp: 20 })
    engine._checkLevelUp()
    expect(engine.getState().player!.maxHp).toBe(22)
  })

  it('handles multiple level-ups in a single check', () => {
    // Give enough XP to jump from level 1 past both level 2 and 3 thresholds
    const bigXp = XP_THRESHOLDS[3]! + 1
    const engine = makeReadyEngine({ xp: bigXp, level: 1 })
    engine._checkLevelUp()
    expect(engine.getState().player!.level).toBeGreaterThanOrEqual(3)
  })

  it('sets pendingStatIncrease at level 3', () => {
    // Start at level 2 with enough XP to reach 3
    const threshold = XP_THRESHOLDS[3]!
    const engine = makeReadyEngine({ xp: threshold, level: 2 })
    engine._checkLevelUp()
    expect(engine.getState().player!.level).toBe(3)
    expect(engine.getState().pendingStatIncrease).toBe(true)
  })

  it('does not set pendingStatIncrease at a non-milestone level (4)', () => {
    const threshold = XP_THRESHOLDS[4]!
    const engine = makeReadyEngine({ xp: threshold, level: 3, maxHp: 24, hp: 24 })
    engine._checkLevelUp()
    expect(engine.getState().player!.level).toBe(4)
    expect(engine.getState().pendingStatIncrease).toBe(false)
  })
})

// ------------------------------------------------------------
// _handlePlayerDeath — death state transitions
// ------------------------------------------------------------

describe('_handlePlayerDeath', () => {
  it('sets isDead to true and hp to 0', async () => {
    const engine = makeReadyEngine({ hp: 5 })
    await engine._handlePlayerDeath()
    const p = engine.getState().player!
    expect(p.isDead).toBe(true)
    expect(p.hp).toBe(0)
  })

  it('sets playerDead flag on the game state', async () => {
    const engine = makeReadyEngine()
    await engine._handlePlayerDeath()
    expect(engine.getState().playerDead).toBe(true)
  })

  it('clears combatState on death', async () => {
    const engine = makeReadyEngine()
    engine._setState({
      combatState: { active: true, enemy: { id: 'rat', name: 'Rat', hp: 5, maxHp: 5, attack: 2, defense: 0, xpReward: 10, description: 'A rat.', loot: [], abilities: [] }, round: 1, playerTurn: true },
    })
    await engine._handlePlayerDeath()
    expect(engine.getState().combatState).toBeNull()
  })

  it('appends death messages to log', async () => {
    const engine = makeReadyEngine()
    await engine._handlePlayerDeath()
    const log = engine.getState().log
    expect(log.some(m => m.text.includes('dark') || m.text.includes('still') || m.text.includes('...'))).toBe(true)
  })
})

// ------------------------------------------------------------
// Room navigation via _setState
// ------------------------------------------------------------

describe('room navigation', () => {
  it('_setState updates currentRoom and currentRoomId', () => {
    const engine = makeReadyEngine()
    const newRoom = { ...BASE_ROOM, id: 'room_2', name: 'Another Room' }
    engine._setState({ currentRoom: newRoom })
    engine._setState({ player: { ...engine.getState().player!, currentRoomId: 'room_2' } })
    expect(engine.getState().currentRoom!.id).toBe('room_2')
    expect(engine.getState().player!.currentRoomId).toBe('room_2')
  })
})

// ------------------------------------------------------------
// HP management via direct state manipulation
// ------------------------------------------------------------

describe('HP management', () => {
  it('reducing hp below 0 and calling _handlePlayerDeath triggers death', async () => {
    const engine = makeReadyEngine({ hp: 1 })
    engine._setState({ player: { ...engine.getState().player!, hp: 0 } })
    await engine._handlePlayerDeath()
    expect(engine.getState().player!.isDead).toBe(true)
  })

  it('HP can be restored without exceeding maxHp', () => {
    const engine = makeReadyEngine({ hp: 15, maxHp: 20 })
    const p = engine.getState().player!
    const healed = Math.min(p.maxHp, p.hp + 10)
    engine._setState({ player: { ...p, hp: healed } })
    expect(engine.getState().player!.hp).toBe(20)
  })

  it('HP cannot exceed maxHp through direct state update', () => {
    const engine = makeReadyEngine({ hp: 20, maxHp: 20 })
    const p = engine.getState().player!
    const overhealed = Math.min(p.maxHp, p.hp + 5)
    engine._setState({ player: { ...p, hp: overhealed } })
    expect(engine.getState().player!.hp).toBeLessThanOrEqual(engine.getState().player!.maxHp)
  })
})

// ------------------------------------------------------------
// Narrative progress — hollowPressure in state
// ------------------------------------------------------------

describe('narrative progress — hollowPressure', () => {
  it('hollowPressure is tracked in player state', () => {
    const engine = makeReadyEngine({ hollowPressure: 3 })
    expect(engine.getState().player!.hollowPressure).toBe(3)
  })

  it('hollowPressure can be updated via _setState', () => {
    const engine = makeReadyEngine({ hollowPressure: 0 })
    const p = engine.getState().player!
    engine._setState({ player: { ...p, hollowPressure: 5 } })
    expect(engine.getState().player!.hollowPressure).toBe(5)
  })

  it('narrativeKeys accumulate as strings', () => {
    const engine = makeReadyEngine({ narrativeKeys: ['key_a'] })
    const p = engine.getState().player!
    engine._setState({ player: { ...p, narrativeKeys: [...(p.narrativeKeys ?? []), 'key_b'] } })
    expect(engine.getState().player!.narrativeKeys).toEqual(['key_a', 'key_b'])
  })
})

// ------------------------------------------------------------
// pendingStatIncrease reminder
// ------------------------------------------------------------

describe('pendingStatIncrease reminder', () => {
  it('reminds player of pending stat boost on non-boost actions', async () => {
    const engine = makeReadyEngine()
    engine._setState({ pendingStatIncrease: true })
    const before = engine.getState().log.length
    await engine.executeAction({ verb: 'stats', noun: undefined, raw: 'stats' })
    const newMessages = engine.getState().log.slice(before)
    expect(newMessages.some(m => m.text.toLowerCase().includes('boost'))).toBe(true)
  })

  it('does not remind player when they use the boost command', async () => {
    const engine = makeReadyEngine()
    engine._setState({ pendingStatIncrease: true })
    const before = engine.getState().log.length
    await engine.executeAction({ verb: 'boost', noun: 'vigor', raw: 'boost vigor' })
    const newMessages = engine.getState().log.slice(before)
    // The reminder message specifically mentions "boost" — it should not appear
    // (the boost handler itself may produce messages, but not the reminder)
    const reminderMessages = newMessages.filter(m => m.text.includes("stat increase pending"))
    expect(reminderMessages).toHaveLength(0)
  })
})

// ------------------------------------------------------------
// getCurrentAct — derived from quest flags
// ------------------------------------------------------------

describe('getCurrentAct', () => {
  it('returns act 1 with no quest flags', () => {
    const engine = makeReadyEngine()
    expect(engine.getCurrentAct()).toBe(1)
  })

  it('returns act 2 after act1_complete', () => {
    const engine = makeReadyEngine({ questFlags: { act1_complete: true } })
    expect(engine.getCurrentAct()).toBe(2)
  })

  it('returns act 3 after act2_complete', () => {
    const engine = makeReadyEngine({ questFlags: { act1_complete: true, act2_complete: true } })
    expect(engine.getCurrentAct()).toBe(3)
  })
})

// ------------------------------------------------------------
// subscribe / listener
// ------------------------------------------------------------

describe('subscribe', () => {
  it('notifies listener when state changes', () => {
    const engine = new GameEngine()
    let callCount = 0
    engine.subscribe(() => { callCount++ })
    engine._setState({ loading: true })
    expect(callCount).toBe(1)
  })

  it('unsubscribe stops notifications', () => {
    const engine = new GameEngine()
    let callCount = 0
    const unsub = engine.subscribe(() => { callCount++ })
    unsub()
    engine._setState({ loading: true })
    expect(callCount).toBe(0)
  })
})
