// ============================================================
// coverage-sprint.test.ts — targeted branch coverage sprint
// Goal: push 53% → 65%+ by hitting uncovered branches fast
// ============================================================

import { describe, it, expect, vi, beforeEach } from 'vitest'

// ============================================================
// Section 1: skillBonus.ts — all stat mappings + class bonuses
// ============================================================

import {
  getClassSkillBonus,
  getStatNameForSkill,
  getStatForSkill,
} from '@/lib/skillBonus'
import type { Player } from '@/types/game'

function makePlayer(overrides: Partial<Player> = {}): Player {
  return {
    id: 'p1', name: 'T', characterClass: 'enforcer',
    vigor: 5, grit: 4, reflex: 3, wits: 2, presence: 6, shadow: 1,
    hp: 10, maxHp: 10, currentRoomId: 'r1', worldSeed: 1,
    xp: 0, level: 1, actionsTaken: 0, isDead: false, cycle: 1, totalDeaths: 0,
    ...overrides,
  }
}

describe('skillBonus — getClassSkillBonus', () => {
  it('enforcer gets +2 brawling', () => expect(getClassSkillBonus('enforcer', 'brawling')).toBe(2))
  it('wraith gets +3 stealth', () => expect(getClassSkillBonus('wraith', 'stealth')).toBe(3))
  it('broker gets +3 negotiation', () => expect(getClassSkillBonus('broker', 'negotiation')).toBe(3))
  it('shepherd gets +1 composure', () => expect(getClassSkillBonus('shepherd', 'composure')).toBe(1))
  it('warden gets +2 resilience', () => expect(getClassSkillBonus('warden', 'resilience')).toBe(2))
  it('reclaimer gets +2 electronics', () => expect(getClassSkillBonus('reclaimer', 'electronics')).toBe(2))
  it('scout gets +2 tracking', () => expect(getClassSkillBonus('scout', 'tracking')).toBe(2))
  it('returns 0 for unknown skill', () => expect(getClassSkillBonus('enforcer', 'lockpicking')).toBe(0))
})

describe('skillBonus — getStatNameForSkill', () => {
  it('maps survival → vigor', () => expect(getStatNameForSkill('survival')).toBe('vigor'))
  it('maps endurance → grit', () => expect(getStatNameForSkill('endurance')).toBe('grit'))
  it('maps bladework → reflex', () => expect(getStatNameForSkill('bladework')).toBe('reflex'))
  it('maps lore → wits', () => expect(getStatNameForSkill('lore')).toBe('wits'))
  it('maps intimidation → presence', () => expect(getStatNameForSkill('intimidation')).toBe('presence'))
  it('maps stealth → shadow', () => expect(getStatNameForSkill('stealth')).toBe('shadow'))
  it('maps lockpicking → shadow', () => expect(getStatNameForSkill('lockpicking')).toBe('shadow'))
  it('maps unknown skill → null', () => expect(getStatNameForSkill('nonexistent')).toBeNull())
})

describe('skillBonus — getStatForSkill', () => {
  it('returns null for null player', () => expect(getStatForSkill('stealth', null)).toBeNull())
  it('returns null for unknown skill', () => expect(getStatForSkill('nonexistent', makePlayer())).toBeNull())
  it('returns base + class bonus for known skill', () => {
    // wraith: shadow=1, stealth bonus=3 → 1+3=4
    const p = makePlayer({ shadow: 1, characterClass: 'wraith' })
    expect(getStatForSkill('stealth', p)).toBe(4)
  })
  it('returns presence + 0 bonus for enforcer negotiation', () => {
    const p = makePlayer({ presence: 6, characterClass: 'enforcer' })
    expect(getStatForSkill('negotiation', p)).toBe(6)
  })
})

// ============================================================
// Section 2: factionWeb.ts — pure functions
// ============================================================

import {
  getFactionRipple,
  getDelayedRippleNarration,
  checkNPCDeathTrigger,
  getNPCAbsenceNarration,
  getNPCForeshadowing,
  checkConvergenceReady,
  getConvergenceNarration,
  FACTION_EFFECTS,
} from '@/lib/factionWeb'

describe('factionWeb — getFactionRipple', () => {
  it('accord gain returns 3 secondary effects', () => {
    const { effects } = getFactionRipple('accord', 1, {})
    expect(effects.length).toBe(3)
  })
  it('accord loss returns 2 secondary effects', () => {
    const { effects } = getFactionRipple('accord', -1, {})
    expect(effects.length).toBe(2)
  })
  it('unknown faction returns empty effects', () => {
    const { effects } = getFactionRipple('ferals', -1, {})
    expect(effects).toHaveLength(0)
  })
  it('immediate-delay effects produce narration', () => {
    // Manufacture an effect with delayActionCount=0 to test narration path
    const effect = { targetFaction: 'accord' as const, delta: -1, delayActionCount: 0, narrationPhrase: 'test narration' }
    // Patch FACTION_EFFECTS temporarily
    const orig = FACTION_EFFECTS['test_gain']
    FACTION_EFFECTS['test_gain'] = [effect]
    // @ts-ignore — test-only faction
    const { narration } = getFactionRipple('test', 1, {})
    expect(narration[0]?.text).toBe('test narration')
    delete FACTION_EFFECTS['test_gain']
  })
  it('red_court gain produces 2 effects', () => {
    const { effects } = getFactionRipple('red_court', 1, {})
    expect(effects.length).toBe(2)
  })
})

describe('factionWeb — getDelayedRippleNarration', () => {
  const effect = { targetFaction: 'accord' as const, delta: -1, delayActionCount: 10, narrationPhrase: 'ripple text' }

  it('returns null if delay not elapsed', () => {
    expect(getDelayedRippleNarration(effect, 5)).toBeNull()
  })
  it('returns message exactly at delay threshold', () => {
    const msg = getDelayedRippleNarration(effect, 10)
    expect(msg?.text).toBe('ripple text')
  })
  it('returns message after delay elapsed', () => {
    expect(getDelayedRippleNarration(effect, 20)).not.toBeNull()
  })
})

describe('factionWeb — checkNPCDeathTrigger', () => {
  it('returns null for unknown npcId', () => {
    expect(checkNPCDeathTrigger('nobody', {})).toBeNull()
  })
  it('avery: not triggered without flag', () => {
    const result = checkNPCDeathTrigger('kindling_doubter_avery', { questFlags: {} })
    expect(result?.shouldDie).toBe(false)
  })
  it('avery: triggered with avery_betrayed flag', () => {
    const result = checkNPCDeathTrigger('kindling_doubter_avery', { questFlags: { avery_betrayed: true } })
    expect(result?.shouldDie).toBe(true)
    expect(result?.narration.length).toBeGreaterThan(0)
  })
  it('patch: not triggered without red_court alignment', () => {
    const result = checkNPCDeathTrigger('patch', {
      questFlags: { salter_bounty_issued: true, salter_bounty_issued_at: 0 },
      actionsTaken: 200,
    })
    expect(result?.shouldDie).toBe(false)
  })
  it('patch: triggered with all conditions met', () => {
    const result = checkNPCDeathTrigger('patch', {
      questFlags: {
        player_alignment_red_court: true,
        salter_bounty_issued: true,
        salter_bounty_issued_at: 0,
      },
      actionsTaken: 101,
    })
    expect(result?.shouldDie).toBe(true)
  })
  it('bridge_keeper_howard: triggered with flag', () => {
    const result = checkNPCDeathTrigger('bridge_keeper_howard', {
      questFlags: { bridge_destroyed_act2: true },
    })
    expect(result?.shouldDie).toBe(true)
  })
  it('sparks_radio: triggered with frequency betrayal', () => {
    const result = checkNPCDeathTrigger('sparks_radio', {
      questFlags: { meridian_frequency_betrayal: true },
    })
    expect(result?.shouldDie).toBe(true)
  })
  it('sparks_radio_repair: not in NPC_DEATH_CONDITIONS directly → returns null', () => {
    // sparks_radio_repair is not a key in NPC_DEATH_CONDITIONS; returns null before switch
    const result = checkNPCDeathTrigger('sparks_radio_repair', {
      questFlags: { meridian_frequency_betrayal: true },
    })
    expect(result).toBeNull()
  })
})

describe('factionWeb — getNPCAbsenceNarration', () => {
  it('returns empty array for unknown npc', () => {
    expect(getNPCAbsenceNarration('nobody', [])).toHaveLength(0)
  })
  it('returns narration for known npc', () => {
    const msgs = getNPCAbsenceNarration('kindling_doubter_avery', [])
    expect(msgs.length).toBeGreaterThan(0)
    expect(msgs[0]?.text).toContain('Avery')
  })
})

describe('factionWeb — getNPCForeshadowing', () => {
  it('returns null for unknown npc', () => {
    expect(getNPCForeshadowing('nobody')).toBeNull()
  })
  it('returns message for patch', () => {
    const msg = getNPCForeshadowing('patch')
    expect(msg?.text).toContain('Red Court')
  })
  it('returns message for sparks_radio', () => {
    const msg = getNPCForeshadowing('sparks_radio')
    expect(msg).not.toBeNull()
  })
})

describe('factionWeb — checkConvergenceReady', () => {
  it('returns false without act2_complete', () => {
    expect(checkConvergenceReady({ questFlags: {}, factionReputation: { accord: 1, kindling: -1, reclaimers: 1 } })).toBe(false)
  })
  it('returns false with act2_complete but < 3 factions engaged', () => {
    expect(checkConvergenceReady({ questFlags: { act2_complete: true }, factionReputation: { accord: 1 } })).toBe(false)
  })
  it('returns true with act2_complete and 3+ factions engaged', () => {
    expect(checkConvergenceReady({
      questFlags: { act2_complete: true },
      factionReputation: { accord: 1, kindling: -1, reclaimers: 2 },
    })).toBe(true)
  })
})

describe('factionWeb — getConvergenceNarration', () => {
  it('returns 4 narrative messages', () => {
    const msgs = getConvergenceNarration({ questFlags: {}, factionReputation: {} })
    expect(msgs).toHaveLength(4)
    expect(msgs[0]?.text).toContain('converging')
  })
})

// ============================================================
// Section 3: examine.ts — branches via mocked engine
// ============================================================

vi.mock('@/lib/spawn', () => ({
  weightedRoll: vi.fn((pool: { desc?: string; sound?: string }[]) => pool[0]),
}))
vi.mock('@/lib/skillBonus', async (importOriginal) => {
  const actual = await importOriginal<typeof import('@/lib/skillBonus')>()
  return {
    ...actual,
    getStatForSkill: vi.fn(actual.getStatForSkill),
  }
})
vi.mock('@/lib/gameEngine', () => ({
  getTimeOfDay: vi.fn(() => 'day' as const),
  xpForNextLevel: vi.fn(() => 100),
}))
vi.mock('@/lib/world', async (importOriginal) => {
  const actual = await importOriginal<typeof import('@/lib/world')>()
  return {
    ...actual,
    getRoom: vi.fn(),
    canMove: vi.fn(() => false),
    markVisited: vi.fn().mockResolvedValue(undefined),
    getExits: vi.fn(() => []),
    updateRoomItems: vi.fn().mockResolvedValue(undefined),
    updateRoomFlags: vi.fn().mockResolvedValue(undefined),
  }
})
vi.mock('@/lib/fear', () => ({ fearCheck: vi.fn(() => ({ messages: [] })) }))
vi.mock('@/lib/echoes', () => ({ getDeathRoomNarration: vi.fn(() => null) }))
vi.mock('@/data/items', () => ({
  getItem: vi.fn((id: string) => {
    const ITEMS: Record<string, { id: string; name: string; description: string; type: string; weight: number; value: number; loreText?: string; healing?: number; statBonus?: Record<string, number>; useText?: string }> = {
      medkit: { id: 'medkit', name: 'Medkit', description: 'Heals.', type: 'consumable', weight: 1, value: 10, healing: 15 },
      note: { id: 'note', name: 'Note', description: 'A scrawled note.', type: 'lore', weight: 0, value: 0, loreText: 'The cure is real.' },
      blank_note: { id: 'blank_note', name: 'Blank Note', description: 'Empty.', type: 'lore', weight: 0, value: 0 },
      ration: { id: 'ration', name: 'Ration', description: 'Food.', type: 'consumable', weight: 1, value: 2, healing: 0, useText: 'You eat the ration.', statBonus: { vigor: 1 } },
      key_card: { id: 'key_card', name: 'Key Card', description: 'Opens doors.', type: 'key', weight: 0, value: 0 },
      junk: { id: 'junk', name: 'Junk Metal', description: 'Scrap.', type: 'junk', weight: 2, value: 1 },
    }
    return ITEMS[id]
  }),
}))
vi.mock('@/data/enemies', () => ({ getEnemy: vi.fn(() => undefined) }))
vi.mock('@/data/npcs', () => ({ getNPC: vi.fn(() => undefined) }))
vi.mock('@/lib/inventory', () => ({
  getInventory: vi.fn(async () => []),
  addItem: vi.fn().mockResolvedValue(undefined),
  removeItem: vi.fn().mockResolvedValue(undefined),
  equipItem: vi.fn().mockResolvedValue(undefined),
  unequipItem: vi.fn().mockResolvedValue(undefined),
  groupAndFormatItems: vi.fn(() => []),
}))
vi.mock('@/lib/messages', () => ({
  msg: (text: string, type = 'narrative') => ({ id: 'test', text, type }),
  systemMsg: (text: string) => ({ id: 'test', text, type: 'system' }),
  errorMsg: (text: string) => ({ id: 'test', text, type: 'error' }),
  combatMsg: (text: string) => ({ id: 'test', text, type: 'combat' }),
}))
vi.mock('@/lib/richText', () => ({
  rt: {
    exit: (d: string) => d, item: (n: string) => n,
    enemy: (n: string) => n, npc: (n: string) => n, keyword: (k: string) => k,
  },
}))
vi.mock('@/lib/supabase', () => ({ createSupabaseBrowserClient: vi.fn() }))
vi.mock('@/data/rooms/index', () => ({ ALL_ROOMS: [] }))
vi.mock('@/data/narrativeKeys/keys_by_zone', () => ({ ALL_NARRATIVE_KEYS: [] }))

import type { GameState, Room, InventoryItem, GameMessage } from '@/types/game'
import type { EngineCore } from '@/lib/actions/types'

function makeRoom(overrides: Partial<Room> = {}): Room {
  return {
    id: 'room_1', name: 'Test Room', description: 'A test room.',
    shortDescription: 'Test.', zone: 'crossroads', difficulty: 1,
    visited: false, flags: {}, exits: {}, items: [], enemies: [], npcs: [],
    ...overrides,
  }
}

const MOCK_ITEMS: Record<string, { id: string; name: string; description: string; type: string; weight: number; value: number; loreText?: string; healing?: number; statBonus?: Record<string, number>; useText?: string; damage?: number; defense?: number }> = {
  medkit: { id: 'medkit', name: 'Medkit', description: 'Heals.', type: 'consumable', weight: 1, value: 10, healing: 15 },
  note: { id: 'note', name: 'Note', description: 'A scrawled note.', type: 'lore', weight: 0, value: 0, loreText: 'The cure is real.' },
  blank_note: { id: 'blank_note', name: 'Blank Note', description: 'Empty.', type: 'lore', weight: 0, value: 0 },
  ration: { id: 'ration', name: 'Ration', description: 'Food.', type: 'consumable', weight: 1, value: 2, healing: 0, useText: 'You eat the ration.', statBonus: { vigor: 1 } },
  key_card: { id: 'key_card', name: 'Key Card', description: 'Opens doors.', type: 'key', weight: 0, value: 0 },
  junk: { id: 'junk', name: 'Junk Metal', description: 'Scrap.', type: 'junk', weight: 2, value: 1 },
}

function makeInvItem(itemId: string, equipped = false): InventoryItem {
  return { id: `inv_${itemId}`, playerId: 'p1', itemId, item: MOCK_ITEMS[itemId]! as any, quantity: 1, equipped }
}

function makeEngine(state: Partial<GameState> = {}): EngineCore & { messages: GameMessage[]; state: GameState } {
  const fullState: GameState = {
    player: makePlayer(),
    currentRoom: makeRoom(),
    inventory: [],
    combatState: null,
    log: [],
    loading: false,
    initialized: true,
    playerDead: false,
    ledger: null,
    stash: [],
    roomsExplored: 0,
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
    adjustReputation: vi.fn().mockResolvedValue(undefined),
    setQuestFlag: vi.fn().mockResolvedValue(undefined),
  }
}

import {
  handleExamineExtra,
  handleSmell,
  handleListen,
  handleTouch,
  handleExamineSpatial,
} from '@/lib/actions/examine'

// (handleListen also used in Section 6 — imported above)

describe('examine — handleExamineExtra', () => {
  beforeEach(() => vi.clearAllMocks())

  it('no keyword → shows room description', async () => {
    const engine = makeEngine({ currentRoom: makeRoom() })
    await handleExamineExtra(engine)
    expect(engine.messages[0]?.text).toBe('A test room.')
  })

  it('keyword not matched → delegates to handleLook (no crash)', async () => {
    const engine = makeEngine({ currentRoom: makeRoom() })
    await handleExamineExtra(engine, 'nonexistent')
    // handleLook fallback produces error message
    expect(engine.messages.some(m => m.type === 'error')).toBe(true)
  })

  it('charon_choice already set → returns early with message', async () => {
    const room = makeRoom({
      extras: [{
        keywords: ['altar'],
        description: 'A dark altar.',
        questFlagOnSuccess: [{ flag: 'charon_choice', value: true }],
      }],
    })
    const engine = makeEngine({
      currentRoom: room,
      player: makePlayer({ questFlags: { charon_choice: true } }),
    })
    await handleExamineExtra(engine, 'altar')
    expect(engine.messages[0]?.text).toContain('decision has been made')
  })

  it('cycleGate not met → shows cannot understand message', async () => {
    const room = makeRoom({
      extras: [{
        keywords: ['rune'],
        description: 'An ancient rune.',
        cycleGate: 3,
      }],
    })
    const engine = makeEngine({ currentRoom: room, player: makePlayer({ cycle: 1 }) })
    await handleExamineExtra(engine, 'rune')
    expect(engine.messages[0]?.text).toContain("can't make sense")
  })

  it('questGate not met → shows context message', async () => {
    const room = makeRoom({
      extras: [{
        keywords: ['terminal'],
        description: 'A data terminal.',
        questGate: 'knows_password',
      }],
    })
    const engine = makeEngine({ currentRoom: room, player: makePlayer({ questFlags: {} }) })
    await handleExamineExtra(engine, 'terminal')
    expect(engine.messages[0]?.text).toContain("don't have enough context")
  })

  it('descriptionPool with no eligible entries → falls back to description', async () => {
    const room = makeRoom({
      extras: [{
        keywords: ['mural'],
        description: 'A painted mural.',
        descriptionPool: [{ desc: 'Cycle 5 text', weight: 1, cycleGate: 5 }],
      }],
    })
    const engine = makeEngine({ currentRoom: room, player: makePlayer({ cycle: 1 }) })
    await handleExamineExtra(engine, 'mural')
    expect(engine.messages[0]?.text).toBe('A painted mural.')
  })

  it('skillCheck success → appends system message and sets quest flag', async () => {
    const { getStatForSkill } = await import('@/lib/skillBonus')
    vi.mocked(getStatForSkill).mockReturnValue(20) // guarantee success
    const room = makeRoom({
      extras: [{
        keywords: ['sigil'],
        description: 'A glowing sigil.',
        skillCheck: { skill: 'perception', dc: 5, successAppend: 'You understand the pattern.' },
        questFlagOnSuccess: [{ flag: 'sigil_understood', value: true }],
      }],
    })
    const engine = makeEngine({ currentRoom: room })
    await handleExamineExtra(engine, 'sigil')
    expect(engine.messages.some(m => m.text.includes('check succeeded'))).toBe(true)
    expect(engine.setQuestFlag).toHaveBeenCalledWith('sigil_understood', true)
  })

  it('no skillCheck + questFlagOnSuccess → sets flag directly', async () => {
    const room = makeRoom({
      extras: [{
        keywords: ['shrine'],
        description: 'A small shrine.',
        questFlagOnSuccess: [{ flag: 'shrine_seen', value: true }],
      }],
    })
    const engine = makeEngine({ currentRoom: room })
    await handleExamineExtra(engine, 'shrine')
    expect(engine.setQuestFlag).toHaveBeenCalledWith('shrine_seen', true)
  })

  it('reputationGrant on skillCheck success → calls adjustReputation', async () => {
    const { getStatForSkill } = await import('@/lib/skillBonus')
    vi.mocked(getStatForSkill).mockReturnValue(20)
    const room = makeRoom({
      extras: [{
        keywords: ['crest'],
        description: 'A faction crest.',
        skillCheck: { skill: 'lore', dc: 5, successAppend: 'You recognize the crest.' },
        reputationGrant: { faction: 'accord', delta: 1 },
      }],
    })
    const engine = makeEngine({ currentRoom: room })
    await handleExamineExtra(engine, 'crest')
    expect(engine.adjustReputation).toHaveBeenCalledWith('accord', 1)
  })
})

describe('examine — handleSmell', () => {
  beforeEach(() => vi.clearAllMocks())

  it('with matching extra → uses extra description', async () => {
    const room = makeRoom({ extras: [{ keywords: ['fire'], description: 'Smells of ash.' }], zone: 'the_ember' })
    const engine = makeEngine({ currentRoom: room })
    await handleSmell(engine, 'fire')
    expect(engine.messages[0]?.text).toContain('ash')
  })

  it('with no match → generic response', async () => {
    const engine = makeEngine({ currentRoom: makeRoom() })
    await handleSmell(engine, 'door')
    expect(engine.messages[0]?.text).toContain("don't notice")
  })

  it('no target, ember zone → ash scent', async () => {
    const engine = makeEngine({ currentRoom: makeRoom({ zone: 'the_ember' }) })
    await handleSmell(engine, '')
    expect(engine.messages[0]?.text).toContain('Ash')
  })

  it('no target, the_deep zone → wet rock scent', async () => {
    const engine = makeEngine({ currentRoom: makeRoom({ zone: 'the_deep' }) })
    await handleSmell(engine, '')
    expect(engine.messages[0]?.text).toContain('Wet rock')
  })

  it('no target, covenant zone → bread scent', async () => {
    const engine = makeEngine({ currentRoom: makeRoom({ zone: 'covenant' }) })
    await handleSmell(engine, '')
    expect(engine.messages[0]?.text).toContain('Bread')
  })

  it('no target, unknown zone → generic wasteland smell', async () => {
    const engine = makeEngine({ currentRoom: makeRoom({ zone: 'the_stacks' }) })
    await handleSmell(engine, '')
    expect(engine.messages[0]?.text).toContain('wasteland')
  })
})

describe('examine — handleTouch', () => {
  beforeEach(() => vi.clearAllMocks())

  it('matching extra → returns extra description', async () => {
    const room = makeRoom({ extras: [{ keywords: ['wall'], description: 'Smooth concrete.' }] })
    const engine = makeEngine({ currentRoom: room })
    await handleTouch(engine, 'wall')
    expect(engine.messages[0]?.text).toContain('Smooth concrete')
  })

  it('no target, the_scar zone → warm walls', async () => {
    const engine = makeEngine({ currentRoom: makeRoom({ zone: 'the_scar' }) })
    await handleTouch(engine, '')
    expect(engine.messages[0]?.text).toContain('warm')
  })

  it('no target, the_ember zone → gritty ash', async () => {
    const engine = makeEngine({ currentRoom: makeRoom({ zone: 'the_ember' }) })
    await handleTouch(engine, '')
    expect(engine.messages[0]?.text).toContain('gritty')
  })

  it('no target, salt_creek zone → concrete and metal', async () => {
    const engine = makeEngine({ currentRoom: makeRoom({ zone: 'salt_creek' }) })
    await handleTouch(engine, '')
    expect(engine.messages[0]?.text).toContain('concrete')
  })
})

describe('examine — handleExamineSpatial', () => {
  beforeEach(() => vi.clearAllMocks())

  it('no target word → asks "under what?"', async () => {
    const engine = makeEngine({ currentRoom: makeRoom() })
    await handleExamineSpatial(engine, 'under')
    expect(engine.messages[0]?.text).toContain('under what?')
  })

  it('rich target match → uses room extra description', async () => {
    const room = makeRoom({ extras: [{ keywords: ['desk'], description: 'A locked drawer.' }] })
    const engine = makeEngine({ currentRoom: room })
    await handleExamineSpatial(engine, 'inside desk')
    expect(engine.messages[0]?.text).toContain('locked drawer')
  })

  it('known atmospheric target under table → specific response', async () => {
    const engine = makeEngine({ currentRoom: makeRoom() })
    await handleExamineSpatial(engine, 'under table')
    expect(engine.messages[0]?.text).toContain('Boot scuffs')
  })

  it('known atmospheric target behind door → specific response', async () => {
    const engine = makeEngine({ currentRoom: makeRoom() })
    await handleExamineSpatial(engine, 'behind door')
    expect(engine.messages[0]?.text).toContain('hook')
  })

  it('known atmospheric target inside locker → specific response', async () => {
    const engine = makeEngine({ currentRoom: makeRoom() })
    await handleExamineSpatial(engine, 'inside locker')
    expect(engine.messages[0]?.text).toContain('wire hanger')
  })

  it('unknown target behind → generic behind response', async () => {
    const engine = makeEngine({ currentRoom: makeRoom() })
    await handleExamineSpatial(engine, 'behind boulder')
    expect(engine.messages[0]?.text).toContain('Nothing hidden')
  })

  it('unknown target inside → generic inside response', async () => {
    const engine = makeEngine({ currentRoom: makeRoom() })
    await handleExamineSpatial(engine, 'inside container')
    expect(engine.messages[0]?.text).toBe('You look inside the container. Empty.')
  })

  it('unknown preposition → generic response', async () => {
    const engine = makeEngine({ currentRoom: makeRoom() })
    await handleExamineSpatial(engine, 'through grate')
    expect(engine.messages[0]?.text).toContain('Nothing of note')
  })
})

// ============================================================
// Section 4: items.ts — handleUse, handleDrop with key item, handleEquip
// ============================================================

import { handleUse, handleDrop, handleEquip, handleUnequip } from '@/lib/actions/items'

describe('handleUse — branches', () => {
  beforeEach(() => vi.clearAllMocks())

  it('lore item with loreText → reads aloud', async () => {
    const engine = makeEngine({ inventory: [makeInvItem('note')] })
    await handleUse(engine, 'note')
    expect(engine.messages.some(m => m.text.includes('The cure is real.'))).toBe(true)
  })

  it('lore item without loreText → blank message', async () => {
    const engine = makeEngine({ inventory: [makeInvItem('blank_note')] })
    await handleUse(engine, 'blank note')
    expect(engine.messages.some(m => m.text.includes('blank or illegible'))).toBe(true)
  })

  it('non-consumable, non-lore → cannot use error', async () => {
    const engine = makeEngine({ inventory: [makeInvItem('junk')] })
    await handleUse(engine, 'junk')
    expect(engine.messages.some(m => m.type === 'error')).toBe(true)
  })

  it('consumable with statBonus → applies buff and shows bonus', async () => {
    const engine = makeEngine({
      player: makePlayer({ vigor: 5, actionsTaken: 10 }),
      inventory: [makeInvItem('ration')],
    })
    await handleUse(engine, 'ration')
    // Should have a buff message with "+1 vigor"
    expect(engine.messages.some(m => m.text.includes('+1 vigor'))).toBe(true)
    // activeBuffs should contain the buff
    expect(engine.state.activeBuffs?.length).toBeGreaterThan(0)
  })

  it('consumable with healing → restores HP', async () => {
    const engine = makeEngine({
      player: makePlayer({ hp: 5, maxHp: 20 }),
      inventory: [makeInvItem('medkit')],
    })
    await handleUse(engine, 'medkit')
    expect(engine.state.player?.hp).toBe(20)
  })

  it('use with no noun → error message', async () => {
    const engine = makeEngine()
    await handleUse(engine, undefined)
    expect(engine.messages[0]?.type).toBe('error')
    expect(engine.messages[0]?.text).toContain('Use what?')
  })

  it('item not in inventory → error', async () => {
    const engine = makeEngine({ inventory: [] })
    await handleUse(engine, 'medkit')
    expect(engine.messages[0]?.type).toBe('error')
  })
})

describe('handleDrop — key item protection', () => {
  beforeEach(() => vi.clearAllMocks())

  it('dropping a key item → refused', async () => {
    const engine = makeEngine({ inventory: [makeInvItem('key_card')] })
    await handleDrop(engine, 'key card')
    expect(engine.messages[0]?.type).toBe('error')
    expect(engine.messages[0]?.text).toContain('seems important')
  })

  it('drop with no noun → error', async () => {
    const engine = makeEngine()
    await handleDrop(engine, undefined)
    expect(engine.messages[0]?.text).toBe("Drop what?")
  })

  it("drop item not in inventory → error", async () => {
    const engine = makeEngine({ inventory: [] })
    await handleDrop(engine, 'medkit')
    expect(engine.messages[0]?.type).toBe('error')
  })
})

describe('handleEquip — branches', () => {
  beforeEach(() => vi.clearAllMocks())

  it('equip non-equippable item → error', async () => {
    const engine = makeEngine({ inventory: [makeInvItem('junk')] })
    await handleEquip(engine, 'junk')
    expect(engine.messages[0]?.type).toBe('error')
    expect(engine.messages[0]?.text).toContain("can't equip")
  })

  it('equip with no noun → error', async () => {
    const engine = makeEngine()
    await handleEquip(engine, undefined)
    expect(engine.messages[0]?.text).toBe('Equip what?')
  })

  it('equip item not in inventory → error', async () => {
    const engine = makeEngine({ inventory: [] })
    await handleEquip(engine, 'medkit')
    expect(engine.messages[0]?.type).toBe('error')
  })
})

describe('handleUnequip — branches', () => {
  beforeEach(() => vi.clearAllMocks())

  it('unequip with no noun → error', async () => {
    const engine = makeEngine()
    await handleUnequip(engine, undefined)
    expect(engine.messages[0]?.text).toContain('Unequip what?')
  })

  it('unequip item that is not equipped → error', async () => {
    const engine = makeEngine({ inventory: [makeInvItem('medkit', false)] })
    await handleUnequip(engine, 'medkit')
    expect(engine.messages[0]?.type).toBe('error')
  })
})

// ============================================================
// Section 5: movement.ts — handleLook branches, pressure overlays
// ============================================================

import { handleLook } from '@/lib/actions/movement'
import { getEnemy } from '@/data/enemies'
import { getNPC } from '@/data/npcs'
import { getItem } from '@/data/items'

describe('handleLook — targeted object lookup', () => {
  beforeEach(() => vi.clearAllMocks())

  it('no target → no crash (room overview)', async () => {
    const engine = makeEngine({ currentRoom: makeRoom() })
    await handleLook(engine, undefined)
    // Should show room exits
    expect(engine.messages.length).toBeGreaterThan(0)
  })

  it('target matches enemy → shows enemy description with HP in combat', async () => {
    vi.mocked(getEnemy).mockReturnValue({ id: 'raider', name: 'Raider', description: 'Hostile.', maxHp: 20, hp: 15, damage: 5, xpReward: 10, loot: [], zone: 'crossroads', difficulty: 1 } as any)
    const engine = makeEngine({
      currentRoom: makeRoom({ enemies: ['raider'] }),
      combatState: { active: true, enemy: { id: 'raider', name: 'Raider', description: 'Hostile.', maxHp: 20, hp: 15, damage: 5, xpReward: 10, loot: [], zone: 'crossroads', difficulty: 1 }, enemyHp: 12, round: 1, fled: false },
    })
    await handleLook(engine, 'raider')
    expect(engine.messages[0]?.text).toContain('12/20 HP')
  })

  it('target matches room item → shows item description', async () => {
    vi.mocked(getEnemy).mockReturnValue(undefined)
    vi.mocked(getItem).mockReturnValue({ id: 'medkit', name: 'Medkit', description: 'Heals wounds.', type: 'consumable', weight: 1, value: 10 } as any)
    const engine = makeEngine({ currentRoom: makeRoom({ items: ['medkit'] }) })
    await handleLook(engine, 'medkit')
    expect(engine.messages[0]?.text).toContain('Heals wounds')
  })

  it('target matches inventory item → shows item description', async () => {
    vi.mocked(getEnemy).mockReturnValue(undefined)
    vi.mocked(getItem).mockReturnValue(undefined)
    const engine = makeEngine({
      currentRoom: makeRoom(),
      inventory: [makeInvItem('note')],
    })
    await handleLook(engine, 'note')
    expect(engine.messages[0]?.text).toContain('A scrawled note')
  })

  it('target matches npc → shows NPC description', async () => {
    vi.mocked(getEnemy).mockReturnValue(undefined)
    vi.mocked(getItem).mockReturnValue(undefined)
    vi.mocked(getNPC).mockReturnValue({ id: 'trader', name: 'Trader', description: 'A wandering trader.', faction: 'drifters' } as any)
    const engine = makeEngine({ currentRoom: makeRoom({ npcs: ['trader'] }) })
    await handleLook(engine, 'trader')
    expect(engine.messages[0]?.text).toContain('wandering trader')
  })

  it('no match found → error message', async () => {
    vi.mocked(getEnemy).mockReturnValue(undefined)
    vi.mocked(getItem).mockReturnValue(undefined)
    vi.mocked(getNPC).mockReturnValue(undefined)
    const engine = makeEngine({ currentRoom: makeRoom() })
    await handleLook(engine, 'unicorn')
    expect(engine.messages[0]?.type).toBe('error')
  })
})

// ============================================================
// Section 6: handleListen — zone fallbacks
// ============================================================

describe('handleListen — zone fallbacks', () => {
  beforeEach(() => vi.clearAllMocks())

  it('the_deep zone → dripping water sound', async () => {
    const engine = makeEngine({ currentRoom: makeRoom({ zone: 'the_deep' }) })
    await handleListen(engine, '')
    expect(engine.messages[0]?.text).toContain('Dripping water')
  })

  it('the_scar zone → machinery hum', async () => {
    const engine = makeEngine({ currentRoom: makeRoom({ zone: 'the_scar' }) })
    await handleListen(engine, '')
    expect(engine.messages[0]?.text).toContain('machinery')
  })

  it('unknown zone → wind and distance', async () => {
    const engine = makeEngine({ currentRoom: makeRoom({ zone: 'crossroads' }) })
    await handleListen(engine, '')
    expect(engine.messages[0]?.text).toContain('Wind')
  })

  it('matching extra for listen target', async () => {
    const room = makeRoom({ extras: [{ keywords: ['vent'], description: 'A steady hum.' }] })
    const engine = makeEngine({ currentRoom: room })
    await handleListen(engine, 'vent')
    expect(engine.messages[0]?.text).toContain('hum')
  })

  it('no match for listen target', async () => {
    const engine = makeEngine({ currentRoom: makeRoom() })
    await handleListen(engine, 'door')
    expect(engine.messages[0]?.text).toContain("don't notice")
  })
})
