// ============================================================
// Integration tests for lib/actions/social.ts and lib/narratorVoice.ts
// Covers: talk, topics, give, reputation, narrator voice selection
// ============================================================

import { describe, it, expect, vi, beforeEach } from 'vitest'
import type { GameState, Player, Room, GameMessage } from '@/types/game'
import type { EngineCore } from '@/lib/actions/types'

// ------------------------------------------------------------
// Mocks
// ------------------------------------------------------------

vi.mock('@/data/npcs', () => ({
  getNPC: vi.fn((id: string) => {
    if (id === 'patch') return {
      id: 'patch', name: 'Patch', faction: 'drifters', isNamed: true,
      description: 'An info broker behind a table of medical supplies.',
      dialogue: "I'll close that up. But I want to know what's north.",
    }
    if (id === 'lev') return {
      id: 'lev', name: 'Lev', faction: 'reclaimers', isNamed: true,
      description: 'A Reclaimer researcher poring over notebooks.',
      dialogue: 'Data accumulates. Draw no conclusions without it.',
    }
    return undefined
  }),
  getRevenantDialogue: vi.fn(() => null),
}))

vi.mock('@/data/dialogueTrees', () => ({ DIALOGUE_TREES: {} }))

vi.mock('@/data/npcTopics', () => ({
  NPC_TOPICS: {
    patch: [
      { keywords: ['scar'], response: '"The Scar." Patch looks at you sideways.', setsFlag: 'patch_mentioned_scar' },
      { keywords: ['meridian'], response: '"Meridian." Patch\'s hands stop moving.', requiresFlag: 'knows_about_meridian' },
      { keywords: ['factions'], response: '"Five groups."', requiresRep: { faction: 'drifters', min: 1 } },
    ],
  },
  findNpcTopic: vi.fn((npcId: string, word: string) => {
    if (npcId === 'patch' && word === 'scar') return { keywords: ['scar'], response: '"The Scar." Patch looks at you sideways.', setsFlag: 'patch_mentioned_scar' }
    if (npcId === 'patch' && word === 'meridian') return { keywords: ['meridian'], response: '"Meridian." Patch\'s hands stop moving.', requiresFlag: 'knows_about_meridian' }
    if (npcId === 'patch' && word === 'factions') return { keywords: ['factions'], response: '"Five groups."', requiresRep: { faction: 'drifters', min: 1 } }
    return null
  }),
  getVisibleTopics: vi.fn(() => ['scar', 'hollow']),
}))

vi.mock('@/data/items', () => ({
  getItem: vi.fn((id: string) => {
    if (id === 'bandages') return { id: 'bandages', name: 'Bandages', type: 'consumable', weight: 0.5, value: 5 }
    if (id === 'meridian_keycard') return { id: 'meridian_keycard', name: 'Meridian Keycard', type: 'key', weight: 0, value: 0 }
    if (id === 'boiled_rations') return { id: 'boiled_rations', name: 'Boiled Rations', type: 'consumable', weight: 1, value: 3 }
    return undefined
  }),
}))

vi.mock('@/lib/world', () => ({ updateRoomFlags: vi.fn().mockResolvedValue(undefined) }))
vi.mock('@/lib/skillBonus', () => ({
  getStatForSkill: vi.fn(() => 5),
  getStatNameForSkill: vi.fn(() => 'presence'),
}))
vi.mock('@/lib/dice', () => ({ rollCheck: vi.fn(() => ({ roll: 5, modifier: 2, total: 7, dc: 8, success: false, critical: false, fumble: false })) }))
vi.mock('@/lib/inventory', () => ({
  removeItem: vi.fn().mockResolvedValue(undefined),
  getInventory: vi.fn().mockResolvedValue([]),
}))

// ------------------------------------------------------------
// Helpers
// ------------------------------------------------------------

function makePlayer(overrides: Partial<Player> = {}): Player {
  return {
    id: 'p1', name: 'Tester', characterClass: 'enforcer',
    vigor: 10, grit: 8, reflex: 6, wits: 5, presence: 7, shadow: 3,
    hp: 20, maxHp: 20, currentRoomId: 'room_1', worldSeed: 1,
    xp: 0, level: 1, actionsTaken: 0, isDead: false, cycle: 1, totalDeaths: 0,
    ...overrides,
  }
}

function makeRoom(overrides: Partial<Room> = {}): Room {
  return {
    id: 'room_1', name: 'Crossroads Camp', description: 'A dusty camp.',
    shortDescription: 'Camp.', zone: 'crossroads', difficulty: 1,
    visited: false, flags: {}, exits: {}, items: [], enemies: [], npcs: [],
    ...overrides,
  }
}

function makeEngine(state: Partial<GameState> = {}): EngineCore & { messages: GameMessage[]; state: GameState } {
  const fullState: GameState = {
    player: makePlayer(),
    currentRoom: makeRoom({ npcs: ['patch'] }),
    inventory: [],
    combatState: null,
    log: [],
    loading: false,
    initialized: true,
    playerDead: false,
    ledger: null,
    stash: [],
    endingTriggered: false,
    endingChoice: null,
    activeBuffs: [],
    ...state,
  }
  const messages: GameMessage[] = []
  return {
    messages, state: fullState,
    getState: () => fullState,
    _setState: (partial) => Object.assign(fullState, partial),
    _appendMessages: (msgs) => messages.push(...msgs),
    _savePlayer: vi.fn().mockResolvedValue(undefined),
    _applyPopulation: (room) => room,
    _handlePlayerDeath: vi.fn().mockResolvedValue(undefined),
    _checkLevelUp: vi.fn(),
    adjustReputation: vi.fn().mockResolvedValue(undefined),
    setQuestFlag: vi.fn().mockResolvedValue(undefined),
  }
}

import { handleTalk, handleGive } from '@/lib/actions/social'
import {
  shouldNarratorSpeak,
  generateNarratorVoice,
  getNarratorActTransition,
  clearNarratorSession,
  type NarratorContext,
} from '@/lib/narratorVoice'

// ------------------------------------------------------------
// social.ts tests
// ------------------------------------------------------------

describe('handleTalk', () => {
  beforeEach(() => { vi.clearAllMocks() })

  it('greets an NPC in the room and shows available topics', async () => {
    const engine = makeEngine()
    await handleTalk(engine, 'patch')
    expect(engine.messages.some(m => m.text.includes("close that up"))).toBe(true)
    expect(engine.messages.some(m => m.text.includes('Topics'))).toBe(true)
  })

  it('errors when NPC is not in the room', async () => {
    const engine = makeEngine({ currentRoom: makeRoom({ npcs: [] }) })
    await handleTalk(engine, 'patch')
    const hasError = engine.messages.some(m =>
      m.type === 'error' || m.text.toLowerCase().includes('no one') || m.text.includes("don't see")
    )
    expect(hasError).toBe(true)
  })

  it('returns topic response when asking about a known topic', async () => {
    const engine = makeEngine()
    await handleTalk(engine, 'patch scar')
    expect(engine.messages.some(m => m.text.includes('The Scar'))).toBe(true)
  })

  it('sets a quest flag after hearing a topic with setsFlag', async () => {
    const engine = makeEngine()
    await handleTalk(engine, 'patch scar')
    expect(engine.setQuestFlag).toHaveBeenCalledWith('patch_mentioned_scar', true)
  })

  it('blocks a topic behind a missing quest flag', async () => {
    const engine = makeEngine({ player: makePlayer({ questFlags: {} }) })
    await handleTalk(engine, 'patch meridian')
    expect(engine.messages.some(m => m.text.includes("don't know enough"))).toBe(true)
  })

  it('allows a topic when the required quest flag is present', async () => {
    const engine = makeEngine({ player: makePlayer({ questFlags: { knows_about_meridian: true } }) })
    await handleTalk(engine, 'patch meridian')
    expect(engine.messages.some(m => m.text.includes("Meridian"))).toBe(true)
  })

  it('blocks a topic behind insufficient faction reputation', async () => {
    const engine = makeEngine({ player: makePlayer({ factionReputation: { drifters: 0 } }) })
    await handleTalk(engine, 'patch factions')
    expect(engine.messages.some(m => m.text.includes('suspicion') || m.text.includes('well enough'))).toBe(true)
  })

  it('responds to an unknown topic with a blank look', async () => {
    const engine = makeEngine()
    await handleTalk(engine, 'patch dragons')
    expect(engine.messages.some(m => m.text.includes('blankly') || m.text.includes("nothing to say about"))).toBe(true)
  })
})

describe('handleGive', () => {
  beforeEach(() => { vi.clearAllMocks() })

  it('gives medical item to Patch and grants drifters reputation', async () => {
    const engine = makeEngine({
      inventory: [{ itemId: 'bandages', item: { id: 'bandages', name: 'Bandages', type: 'consumable', weight: 0.5, value: 5 } }],
    })
    await handleGive(engine, 'bandages to patch')
    expect(engine.adjustReputation).toHaveBeenCalledWith('drifters', 1)
    expect(engine.messages.some(m => m.text.includes('clinical efficiency') || m.text.includes('most'))).toBe(true)
  })

  it('gives the Meridian keycard to Lev and sets quest flag', async () => {
    const engine = makeEngine({
      currentRoom: makeRoom({ npcs: ['lev'] }),
      inventory: [{ itemId: 'meridian_keycard', item: { id: 'meridian_keycard', name: 'Meridian Keycard', type: 'key', weight: 0, value: 0 } }],
    })
    await handleGive(engine, 'meridian keycard to lev')
    expect(engine.setQuestFlag).toHaveBeenCalledWith('gave_keycard_to_lev', true)
    expect(engine.messages.some(m => m.text.includes('keycard') || m.text.includes('Keycard'))).toBe(true)
  })

  it('errors when item is not in inventory', async () => {
    const engine = makeEngine({ inventory: [] })
    await handleGive(engine, 'bandages to patch')
    expect(engine.messages.some(m => m.type === 'error' || m.text.includes("don't have"))).toBe(true)
  })

  it('grants faction rep for food given to a faction NPC', async () => {
    const engine = makeEngine({
      inventory: [{ itemId: 'boiled_rations', item: { id: 'boiled_rations', name: 'Boiled Rations', type: 'consumable', weight: 1, value: 3 } }],
    })
    await handleGive(engine, 'boiled rations to patch')
    expect(engine.adjustReputation).toHaveBeenCalledWith('drifters', 1)
  })
})

// ------------------------------------------------------------
// narratorVoice.ts tests
// ------------------------------------------------------------

function baseContext(overrides: Partial<NarratorContext> = {}): NarratorContext {
  return {
    act: 1, zone: 'crossroads', cycle: 1, pressure: 0,
    questFlags: [], playerHP: 20, playerMaxHP: 20,
    ...overrides,
  }
}

describe('shouldNarratorSpeak', () => {
  it('returns false during combat', () => {
    expect(shouldNarratorSpeak(100, 0, 0, true)).toBe(false)
  })

  it('returns false within 50 actions of last speak', () => {
    expect(shouldNarratorSpeak(30, 0, 0, false)).toBe(false)
  })

  it('returns a value when conditions are met (probabilistic — check type)', () => {
    const result = shouldNarratorSpeak(100, 0, 0, false)
    expect(typeof result).toBe('boolean')
  })
})

describe('generateNarratorVoice', () => {
  beforeEach(() => { clearNarratorSession() })

  it('returns a GameMessage with type echo', () => {
    const msg = generateNarratorVoice(baseContext())
    expect(msg).not.toBeNull()
    expect(msg!.type).toBe('echo')
    expect(typeof msg!.text).toBe('string')
  })

  it('draws from the pressure pool when pressure >= 7', () => {
    const msg = generateNarratorVoice(baseContext({ pressure: 8 }))
    expect(msg).not.toBeNull()
    // Pressure whispers contain distinctive text
    expect(msg!.text).toMatch(/body|heartbeat|Run|closer|following|shaking|silence|danger|Fear|carefully/i)
  })

  it('draws from cycle pool for cycle >= 2 (40% — force with retry)', () => {
    // Run enough times to guarantee at least one cycle whisper
    clearNarratorSession()
    const results: string[] = []
    for (let i = 0; i < 20; i++) {
      clearNarratorSession()
      const msg = generateNarratorVoice(baseContext({ cycle: 2 }))
      if (msg) results.push(msg.text)
    }
    const hasCycleText = results.some(t => t.includes('done this before') || t.includes('previous') || t.includes('last time') || t.includes('failed') || t.includes('coming back'))
    expect(hasCycleText).toBe(true)
  })

  it('returns act-transition messages for act boundaries', () => {
    const msgs: GameMessage[] = getNarratorActTransition(1, 2)
    expect(msgs.length).toBeGreaterThan(0)
    expect(msgs[0]!.text).toMatch(/world shifts|certainty|factions/i)
  })

  it('deduplicates narrator whispers within a session', () => {
    clearNarratorSession()
    const seen = new Set<string>()
    let duplicate = false
    for (let i = 0; i < 30; i++) {
      const msg = generateNarratorVoice(baseContext({ pressure: 8 }))
      if (msg) {
        if (seen.has(msg.text)) { duplicate = true; break }
        seen.add(msg.text)
      }
    }
    expect(duplicate).toBe(false)
  })
})
