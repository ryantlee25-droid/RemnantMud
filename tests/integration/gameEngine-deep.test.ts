// ============================================================
// Integration tests: GameEngine deep branch coverage
// Targets: save retry, auto-save triggers, hollow pressure,
// world events, companion commentary, NPC initiative,
// quest flags, act progression, ending triggers, fast travel,
// error recovery, and state serialization.
// ============================================================

import { describe, it, expect, vi, beforeEach } from 'vitest'
import type { Player } from '@/types/game'

// ---- Supabase mock -----------------------------------------

const updateSpy = vi.fn()
const updateChain = { eq: vi.fn(() => ({ error: null })) }
updateSpy.mockReturnValue(updateChain)

const retryUpdateSpy = vi.fn()
const retryChain = { eq: vi.fn(() => ({ error: null })) }
retryUpdateSpy.mockReturnValue(retryChain)

const mockDb = {
  auth: {
    refreshSession: vi.fn().mockResolvedValue({}),
    getUser: vi.fn().mockResolvedValue({ data: { user: { id: 'player-1' } }, error: null }),
  },
  from: vi.fn((table: string) => {
    if (table === 'players') return { update: updateSpy, select: vi.fn(() => ({ eq: vi.fn(() => ({ maybeSingle: vi.fn().mockResolvedValue({ data: null, error: null }) })) })) }
    if (table === 'player_ledger') return { update: vi.fn(() => ({ eq: vi.fn(() => ({ error: null })) })), select: vi.fn(() => ({ eq: vi.fn(() => ({ maybeSingle: vi.fn().mockResolvedValue({ data: null, error: null }) })) })) }
    return { select: vi.fn(() => ({ count: 0, error: null })), update: vi.fn(() => ({ eq: vi.fn(() => ({ error: null })) })) }
  }),
}

vi.mock('@/lib/supabase', () => ({ createSupabaseBrowserClient: () => mockDb }))

// ---- World / inventory mocks --------------------------------

vi.mock('@/lib/world', () => ({
  getRoom: vi.fn().mockResolvedValue({
    id: 'room_2', name: 'Another Room', description: 'Dark corridor.',
    shortDescription: 'Dark corridor.', zone: 'crossroads', difficulty: 1,
    visited: true, flags: {}, exits: {}, items: [], enemies: [], npcs: [],
  }),
  canMove: vi.fn().mockReturnValue(true),
  getExits: vi.fn().mockReturnValue([]),
  updateRoomItems: vi.fn().mockResolvedValue(undefined),
  updateRoomFlags: vi.fn().mockResolvedValue(undefined),
  getPopulatedRoom: vi.fn(),
  markVisited: vi.fn().mockResolvedValue(undefined),
  persistWorld: vi.fn().mockResolvedValue(undefined),
}))

vi.mock('@/lib/inventory', () => ({ getInventory: vi.fn().mockResolvedValue([]) }))
vi.mock('@/data/items', () => ({ getItem: vi.fn().mockReturnValue(undefined) }))

// ---- Narrative sub-system mocks ----------------------------

const getScheduledEventsMock = vi.fn().mockReturnValue([])
const executeWorldEventMock = vi.fn().mockReturnValue([])
vi.mock('@/lib/worldEvents', () => ({
  getScheduledEvents: (...args: unknown[]) => getScheduledEventsMock(...args),
  executeWorldEvent: (...args: unknown[]) => executeWorldEventMock(...args),
}))

const computeHollowPressureMock = vi.fn().mockReturnValue(0)
const getPressureNarrationMock = vi.fn().mockReturnValue([])
const getMundaneHorrorMock = vi.fn().mockReturnValue(null)
const shouldTriggerSwarmMock = vi.fn().mockReturnValue(false)
vi.mock('@/lib/hollowPressure', () => ({
  computePressure: (...args: unknown[]) => computeHollowPressureMock(...args),
  applyPressureDelta: vi.fn().mockReturnValue(0),
  getPressureNarration: (...args: unknown[]) => getPressureNarrationMock(...args),
  getMundaneHorrorNarration: (...args: unknown[]) => getMundaneHorrorMock(...args),
  shouldTriggerSwarm: (...args: unknown[]) => shouldTriggerSwarmMock(...args),
}))

const checkInitiativeMock = vi.fn().mockReturnValue({ trigger: null, updatedLastAction: 0 })
const getInitiativeNarrationMock = vi.fn().mockReturnValue([])
vi.mock('@/lib/npcInitiative', () => ({
  checkInitiativeTriggers: (...args: unknown[]) => checkInitiativeMock(...args),
  getInitiativeNarration: (...args: unknown[]) => getInitiativeNarrationMock(...args),
}))

const getCompanionCommentaryMock = vi.fn().mockReturnValue(null)
const getPersonalMomentMock = vi.fn().mockReturnValue(null)
vi.mock('@/lib/companionSystem', () => ({
  getCompanionCommentary: (...args: unknown[]) => getCompanionCommentaryMock(...args),
  getPersonalMoment: (...args: unknown[]) => getPersonalMomentMock(...args),
}))

vi.mock('@/lib/factionWeb', () => ({
  getFactionRipple: vi.fn().mockReturnValue({ effects: [], narration: [] }),
  getDelayedRippleNarration: vi.fn().mockReturnValue(null),
}))

const shouldTriggerMonologueMock = vi.fn().mockReturnValue(false)
const generateMonologueMock = vi.fn().mockResolvedValue(null)
vi.mock('@/lib/playerMonologue', () => ({
  shouldTriggerMonologue: () => shouldTriggerMonologueMock(),
  generateMonologue: (...args: unknown[]) => generateMonologueMock(...args),
  getPhysicalStateNarration: vi.fn().mockReturnValue(null),
  getReputationVoice: vi.fn().mockReturnValue(null),
  resetMonologueSession: vi.fn(),
}))

const shouldNarratorSpeakMock = vi.fn().mockReturnValue(false)
const generateNarratorVoiceMock = vi.fn().mockReturnValue(null)
const getNarratorActTransitionMock = vi.fn().mockReturnValue([])
vi.mock('@/lib/narratorVoice', () => ({
  shouldNarratorSpeak: (...args: unknown[]) => shouldNarratorSpeakMock(...args),
  generateNarratorVoice: (...args: unknown[]) => generateNarratorVoiceMock(...args),
  getNarratorActTransition: (...args: unknown[]) => getNarratorActTransitionMock(...args),
  clearNarratorSession: vi.fn(),
}))

import { GameEngine } from '@/lib/gameEngine'

// ---- Helpers -----------------------------------------------

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

// ============================================================
// Save retry logic
// ============================================================

describe('_savePlayer — retry on auth failure', () => {
  beforeEach(() => {
    updateSpy.mockReset()
    mockDb.auth.refreshSession.mockResolvedValue({})
  })

  it('calls update once when save succeeds on first attempt', async () => {
    updateSpy.mockReturnValue({ eq: vi.fn().mockResolvedValue({ error: null }) })
    const engine = makeReadyEngine()
    await engine._savePlayer()
    expect(updateSpy).toHaveBeenCalledTimes(1)
  })

  it('refreshes session and retries when first save returns an error', async () => {
    let callCount = 0
    updateSpy.mockImplementation(() => ({
      eq: vi.fn().mockResolvedValue({
        error: callCount++ === 0 ? { message: 'auth/expired', code: '401', details: '', hint: '' } : null,
      }),
    }))
    const engine = makeReadyEngine()
    await engine._savePlayer()
    expect(mockDb.auth.refreshSession).toHaveBeenCalled()
    expect(updateSpy).toHaveBeenCalledTimes(2)
  })

  it('appends a system error message when both attempts fail', async () => {
    updateSpy.mockImplementation(() => ({
      eq: vi.fn().mockResolvedValue({ error: { message: 'fail', code: '500', details: '', hint: '' } }),
    }))
    const engine = makeReadyEngine()
    await engine._savePlayer()
    const log = engine.getState().log
    expect(log.some(m => m.type === 'system' && m.text.includes('Save failed'))).toBe(true)
  })

  it('does nothing when player is null', async () => {
    updateSpy.mockReturnValue({ eq: vi.fn().mockResolvedValue({ error: null }) })
    const engine = new GameEngine()
    await expect(engine._savePlayer()).resolves.toBeUndefined()
    expect(updateSpy).not.toHaveBeenCalled()
  })
})

// ============================================================
// Auto-save triggers
// ============================================================

describe('auto-save — which verbs trigger _savePlayer', () => {
  it('save verb triggers _savePlayer and logs confirmation', async () => {
    updateSpy.mockReturnValue({ eq: vi.fn().mockResolvedValue({ error: null }) })
    const engine = makeReadyEngine()
    await engine.executeAction({ verb: 'save', noun: undefined, raw: 'save' })
    expect(updateSpy).toHaveBeenCalled()
    expect(engine.getState().log.some(m => m.text.toLowerCase().includes('saved'))).toBe(true)
  })

  it('quit verb triggers _savePlayer and logs confirmation', async () => {
    updateSpy.mockReturnValue({ eq: vi.fn().mockResolvedValue({ error: null }) })
    const engine = makeReadyEngine()
    await engine.executeAction({ verb: 'quit', noun: undefined, raw: 'quit' })
    expect(updateSpy).toHaveBeenCalled()
    expect(engine.getState().log.some(m => m.text.toLowerCase().includes('saved'))).toBe(true)
  })
})

// ============================================================
// Hollow pressure updates
// ============================================================

describe('hollow pressure — pipeline updates per action', () => {
  it('pressure increment updates player state', async () => {
    computeHollowPressureMock.mockReturnValueOnce(1)
    const engine = makeReadyEngine({ hollowPressure: 0 })
    await engine.executeAction({ verb: 'search', noun: undefined, raw: 'search' })
    expect(engine.getState().player!.hollowPressure).toBe(1)
  })

  it('pressure stays the same when computePressure returns the same value', async () => {
    computeHollowPressureMock.mockReturnValue(0)
    const engine = makeReadyEngine({ hollowPressure: 0 })
    await engine.executeAction({ verb: 'search', noun: undefined, raw: 'search' })
    expect(engine.getState().player!.hollowPressure).toBe(0)
  })

  it('sets pressure_high_warning_eligible flag when pressure >= 6', async () => {
    computeHollowPressureMock.mockReturnValueOnce(6)
    const engine = makeReadyEngine({ hollowPressure: 5 })
    await engine.executeAction({ verb: 'search', noun: undefined, raw: 'search' })
    expect(engine.getState().player!.questFlags?.pressure_high_warning_eligible).toBe(true)
  })
})

// ============================================================
// World events
// ============================================================

describe('world events — triggered through pipeline', () => {
  it('scheduled events are executed and messages appended', async () => {
    const fakeEvent = { id: 'collapse', type: 'environmental' }
    getScheduledEventsMock.mockReturnValueOnce([fakeEvent])
    executeWorldEventMock.mockReturnValueOnce([
      { id: 'e1', text: 'A rumble shakes the earth.', type: 'narrative' as const },
    ])
    const engine = makeReadyEngine({ actionsTaken: 1 })
    const before = engine.getState().log.length
    await engine.executeAction({ verb: 'search', noun: undefined, raw: 'search' })
    const added = engine.getState().log.slice(before)
    expect(added.some(m => m.text.includes('rumble'))).toBe(true)
  })

  it('no world event messages when no events are scheduled', async () => {
    getScheduledEventsMock.mockReturnValue([])
    const engine = makeReadyEngine()
    const before = engine.getState().log.length
    await engine.executeAction({ verb: 'search', noun: undefined, raw: 'search' })
    const added = engine.getState().log.slice(before)
    expect(added.every(m => !m.text.includes('rumble'))).toBe(true)
  })
})

// ============================================================
// Companion commentary
// ============================================================

describe('companion commentary — fires on room entry', () => {
  it('companion message appended when getCompanionCommentary returns one', async () => {
    const companion = { id: 'mora', name: 'Mora', joinedAt: 0, personality: 'stoic' as const }
    getCompanionCommentaryMock.mockReturnValue(
      { id: 'c1', text: 'Mora nods at the door.', type: 'narrative' as const }
    )
    // Player is in crossroads_1; getRoom mock returns room_2, so go north causes a real room change
    const engine = makeReadyEngine({ currentCompanion: companion } as Partial<Player>)
    const before = engine.getState().log.length
    await engine.executeAction({ verb: 'go', noun: 'north', raw: 'go north' })
    const added = engine.getState().log.slice(before)
    expect(added.some(m => m.text.includes('Mora'))).toBe(true)
  })

  it('no companion message when no companion is present', async () => {
    getCompanionCommentaryMock.mockReturnValue(null)
    const engine = makeReadyEngine()
    const before = engine.getState().log.length
    await engine.executeAction({ verb: 'search', noun: undefined, raw: 'search' })
    const added = engine.getState().log.slice(before)
    expect(added.every(m => !getCompanionCommentaryMock.mock.results.some(r => r.value && m.text === r.value.text))).toBe(true)
  })
})

// ============================================================
// NPC initiative
// ============================================================

describe('NPC initiative triggers', () => {
  it('initiative narration appended and flag set when trigger fires on room entry', async () => {
    checkInitiativeMock.mockReturnValue({
      trigger: { npcId: 'vera', initiativeMessage: 'vera_spoke', line: 'Vera steps forward.' },
      updatedLastAction: 5,
    })
    getInitiativeNarrationMock.mockReturnValue([
      { id: 'i1', text: 'Vera steps forward.', type: 'narrative' as const },
    ])
    // go north causes room change (crossroads_1 → room_2), triggering the room-entry pipeline branch
    const engine = makeReadyEngine()
    await engine.executeAction({ verb: 'go', noun: 'north', raw: 'go north' })
    const log = engine.getState().log
    expect(log.some(m => m.text.includes('Vera'))).toBe(true)
    expect(engine.getState().player!.questFlags?.vera_spoke).toBe(true)
  })

  it('no initiative messages when check returns null trigger', async () => {
    checkInitiativeMock.mockReturnValue({ trigger: null, updatedLastAction: 0 })
    getInitiativeNarrationMock.mockClear()
    const engine = makeReadyEngine()
    await engine.executeAction({ verb: 'go', noun: 'north', raw: 'go north' })
    expect(getInitiativeNarrationMock).not.toHaveBeenCalled()
  })
})

// ============================================================
// Quest flags — setQuestFlag
// ============================================================

describe('setQuestFlag', () => {
  beforeEach(() => {
    updateSpy.mockReturnValue({ eq: vi.fn().mockResolvedValue({ error: null }) })
  })

  it('persists a boolean flag and updates player state', async () => {
    const engine = makeReadyEngine()
    await engine.setQuestFlag('found_cache', true)
    expect(engine.getState().player!.questFlags?.found_cache).toBe(true)
  })

  it('persists a numeric flag value', async () => {
    const engine = makeReadyEngine()
    await engine.setQuestFlag('kill_count', 3)
    expect(engine.getState().player!.questFlags?.kill_count).toBe(3)
  })

  it('fires act 1→2 narrator transition when act1_complete is set', async () => {
    getNarratorActTransitionMock.mockReturnValueOnce([
      { id: 'n1', text: 'Act 2 begins.', type: 'narrative' as const },
    ])
    const engine = makeReadyEngine()
    await engine.setQuestFlag('act1_complete', true)
    expect(getNarratorActTransitionMock).toHaveBeenCalledWith(1, 2)
    expect(engine.getState().log.some(m => m.text.includes('Act 2'))).toBe(true)
  })

  it('fires act 2→3 narrator transition when act2_complete is set', async () => {
    getNarratorActTransitionMock.mockReturnValueOnce([
      { id: 'n2', text: 'Act 3 begins.', type: 'narrative' as const },
    ])
    const engine = makeReadyEngine({ questFlags: { act1_complete: true } })
    await engine.setQuestFlag('act2_complete', true)
    expect(getNarratorActTransitionMock).toHaveBeenCalledWith(2, 3)
  })

  it('does not fire narrator transition for arbitrary flags', async () => {
    const engine = makeReadyEngine()
    await engine.setQuestFlag('found_key', true)
    expect(getNarratorActTransitionMock).not.toHaveBeenCalled()
  })
})

// ============================================================
// Act progression
// ============================================================

describe('getCurrentAct — derived from quest flags', () => {
  it('returns 1 with no flags', () => {
    expect(makeReadyEngine().getCurrentAct()).toBe(1)
  })

  it('returns 2 after act1_complete', () => {
    expect(makeReadyEngine({ questFlags: { act1_complete: true } }).getCurrentAct()).toBe(2)
  })

  it('returns 3 after act2_complete (act1 implied)', () => {
    expect(makeReadyEngine({ questFlags: { act1_complete: true, act2_complete: true } }).getCurrentAct()).toBe(3)
  })
})

// ============================================================
// Ending triggers — charon_choice
// ============================================================

describe('setQuestFlag — ending triggers', () => {
  beforeEach(() => {
    vi.useFakeTimers()
    updateSpy.mockReturnValue({ eq: vi.fn().mockResolvedValue({ error: null }) })
    mockDb.from.mockImplementation((table: string) => {
      if (table === 'player_ledger') return { update: vi.fn(() => ({ eq: vi.fn().mockResolvedValue({ error: null }) })) }
      return { update: updateSpy }
    })
  })

  afterEach(() => { vi.useRealTimers() })

  it('cure ending: sets endingTriggered after setTimeout fires', async () => {
    const engine = makeReadyEngine()
    await engine.setQuestFlag('charon_choice', 'cure')
    expect(engine.getState().endingTriggered).toBe(false)
    await vi.runAllTimersAsync()
    expect(engine.getState().endingTriggered).toBe(true)
    expect(engine.getState().endingChoice).toBe('cure')
  })

  it('weapon ending: sets endingTriggered after timeout', async () => {
    const engine = makeReadyEngine()
    await engine.setQuestFlag('charon_choice', 'weapon')
    await vi.runAllTimersAsync()
    expect(engine.getState().endingTriggered).toBe(true)
    expect(engine.getState().endingChoice).toBe('weapon')
  })

  it('throne ending: sets endingTriggered after timeout', async () => {
    const engine = makeReadyEngine()
    await engine.setQuestFlag('charon_choice', 'throne')
    await vi.runAllTimersAsync()
    expect(engine.getState().endingTriggered).toBe(true)
    expect(engine.getState().endingChoice).toBe('throne')
  })

  it('invalid ending choice does not trigger ending', async () => {
    const engine = makeReadyEngine()
    await engine.setQuestFlag('charon_choice', 'notanending')
    await vi.runAllTimersAsync()
    expect(engine.getState().endingTriggered).toBe(false)
  })
})

// ============================================================
// Error recovery in executeAction
// ============================================================

describe('executeAction — error recovery', () => {
  it('catches thrown errors from handlers and appends system message', async () => {
    // Force the world module to throw by overriding the room mock temporarily
    const { getRoom } = await import('@/lib/world')
    vi.mocked(getRoom).mockRejectedValueOnce(new Error('network timeout'))
    const engine = makeReadyEngine()
    await engine.executeAction({ verb: 'go', noun: 'north', raw: 'go north' })
    expect(engine.getState().log.some(m => m.type === 'system' && m.text.includes('went wrong'))).toBe(true)
  })
})

// ============================================================
// State serialization shape
// ============================================================

describe('GameState initial shape', () => {
  it('has all required top-level fields', () => {
    const engine = new GameEngine()
    const state = engine.getState()
    expect(state).toMatchObject({
      player: null,
      currentRoom: null,
      inventory: [],
      combatState: null,
      log: [],
      loading: false,
      initialized: false,
      playerDead: false,
      ledger: null,
      stash: [],
      roomsExplored: 0,
      endingTriggered: false,
      endingChoice: null,
      activeBuffs: [],
      pendingStatIncrease: false,
      weather: 'clear',
    })
  })

  it('_setState merges partial state without clobbering other fields', () => {
    const engine = makeReadyEngine()
    engine._setState({ loading: true })
    expect(engine.getState().loading).toBe(true)
    expect(engine.getState().player).not.toBeNull()
  })
})

// ============================================================
// _resetNarrativeSession
// ============================================================

describe('_resetNarrativeSession', () => {
  it('clears narrator and monologue state without throwing', () => {
    const engine = makeReadyEngine()
    expect(() => engine._resetNarrativeSession()).not.toThrow()
  })
})
