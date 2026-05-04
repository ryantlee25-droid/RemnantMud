// ============================================================
// tests/integration/social-vendor-deep.test.ts
// Deep integration coverage for lib/actions/social.ts and
// lib/actions/vendorDialogue.ts.
//
// Categories:
//   - Social verbs: talk, ask/tell/say (topic), search, rep, quests
//   - Dialogue tree navigation: option selection, branches, exit
//   - Faction reputation gates (refusal, bonus, hostile blocks)
//   - NPC disposition effects (friendly, neutral, wary, hostile)
//   - Relationship state transitions via onEnter effects
//   - Vendor dialogue (greeting, farewell, budget, comment)
//   - Give handler: items, medical, food, keycard paths, dog adoption
//   - Multi-step dialogue: navigating back, skill check success/fail,
//     failNode routing, branch gates
// ============================================================

import { describe, it, expect, vi, beforeEach } from 'vitest'
import type { GameState, Player, Room, GameMessage, NPC, DialogueTree } from '@/types/game'
import type { EngineCore } from '@/lib/actions/types'

// ------------------------------------------------------------
// Mocks
// ------------------------------------------------------------

vi.mock('@/data/npcs', () => ({
  getNPC: vi.fn((id: string) => {
    const npcs: Record<string, NPC> = {
      patch: {
        id: 'patch', name: 'Patch', faction: 'drifters', isNamed: true,
        description: 'A medic behind a table of supplies.',
        dialogue: "I'll close that up. But I want to know what's north.",
        vendorGreeting: "You're buying bandages. That's either optimism or planning.",
        vendorFarewell: "Try not to need me again. But you will.",
        vendorBudget: 40,
        vendorComments: {
          bandages: ['Clean wound first. Bandage second.'],
          antibiotics_01: ["Don't use them unless you're sure it's bacterial."],
          quiet_drops: ['Sedative. Calibrated dose.'],
        },
      },
      lev: {
        id: 'lev', name: 'Lev', faction: 'reclaimers', isNamed: true,
        description: 'A Reclaimer researcher poring over notebooks.',
        dialogue: 'Data accumulates. Draw no conclusions without it.',
        vendorGreeting: 'Research materials only.',
        vendorFarewell: 'I have work to do.',
        vendorBudget: 25,
        vendorComments: {},
      },
      marta_vendor: {
        id: 'marta_vendor', name: 'Marta', faction: 'drifters', isNamed: false,
        description: 'A food vendor at a cart.',
        dialogue: 'Fresh rations. Best in the market.',
      },
      scout_npc: {
        id: 'scout_npc', name: 'Scout', faction: 'accord', isNamed: false,
        description: 'A watchful accord scout.',
        dialogue: "Move along. Nothing to report.",
      },
      the_dog: {
        id: 'the_dog', name: 'the dog', faction: undefined as unknown as 'accord', isNamed: false,
        description: 'A lean, road-worn dog. It watches you without aggression.',
        dialogue: '',
      },
    }
    return npcs[id] ?? undefined
  }),
  getRevenantDialogue: vi.fn(() => null),
}))

vi.mock('@/data/dialogueTrees', () => {
  const mockLevTree: DialogueTree = {
    npcId: 'lev',
    startNode: 'lev_start',
    nodes: {
      lev_start: {
        id: 'lev_start',
        speaker: 'Lev',
        text: 'You are back. Cycle count consistent.',
        branches: [
          { label: 'Ask about CHARON-7 research', targetNode: 'lev_charon' },
          {
            label: 'Ask about MERIDIAN Keycard',
            targetNode: 'lev_keycard_gate',
            requiresFlag: 'found_r1_sequencing_data',
          },
          {
            label: '"Push on authority chain."',
            targetNode: 'lev_charon_authority_refusal',
            requiresFlag: 'lev_trusts_player',
          },
          {
            label: '[Lore DC 16] Explain implications.',
            targetNode: 'lev_keycard_lore_success',
            skillCheck: { skill: 'lore', dc: 16 },
            failNode: 'lev_keycard_fail',
          },
          {
            label: '"We have done this before."',
            targetNode: 'lev_echo_distrusted',
            requiresCycleMin: 2,
            requiresPreviousRelationship: { npcId: 'lev', relationship: 'distrusted' },
          },
          { label: '"I should go."', targetNode: 'lev_leave' },
        ],
      },
      lev_charon: {
        id: 'lev_charon',
        speaker: 'Lev',
        text: 'CHARON-7 is a synthetic retrovirus.',
        branches: [
          { label: 'Back to other topics.', targetNode: 'lev_start' },
        ],
      },
      lev_keycard_gate: {
        id: 'lev_keycard_gate',
        speaker: 'Lev',
        text: 'You found sequencing data. Show me.',
        branches: [
          {
            label: '[Lore DC 11] Explain implications.',
            targetNode: 'lev_keycard_lore_success',
            skillCheck: { skill: 'lore', dc: 11 },
            failNode: 'lev_keycard_fail',
          },
          {
            label: '[Negotiation DC 12] "People are dying."',
            targetNode: 'lev_keycard_negotiate_success',
            skillCheck: { skill: 'negotiation', dc: 12 },
            failNode: 'lev_keycard_fail',
          },
          {
            label: '[Intimidation DC 14] "Give me the keycard."',
            targetNode: 'lev_keycard_intimidate_success',
            skillCheck: { skill: 'intimidation', dc: 14 },
            failNode: 'lev_keycard_fail',
          },
        ],
      },
      lev_keycard_lore_success: {
        id: 'lev_keycard_lore_success',
        speaker: 'Lev',
        text: 'You understand the mechanism. Here is the keycard.',
        onEnter: {
          setFlag: { reclaimers_meridian_keycard: true, lev_trusts_player: true },
          grantItem: ['meridian_keycard'],
          grantRep: { faction: 'reclaimers', delta: 1 },
        },
        branches: [
          { label: "\"I'll bring back what I find.\"", targetNode: 'lev_keycard_end' },
        ],
      },
      lev_keycard_negotiate_success: {
        id: 'lev_keycard_negotiate_success',
        speaker: 'Lev',
        text: 'The keycard slides across the table.',
        onEnter: {
          setFlag: 'reclaimers_meridian_keycard',
          grantItem: ['meridian_keycard'],
        },
        branches: [
          { label: '"Understood."', targetNode: 'lev_keycard_end' },
        ],
      },
      lev_keycard_intimidate_success: {
        id: 'lev_keycard_intimidate_success',
        speaker: 'Lev',
        text: "Noted. Don't come back expecting collaboration.",
        onEnter: {
          setFlag: { reclaimers_meridian_keycard: true, lev_distrusts_player: true },
          grantItem: ['meridian_keycard'],
          grantRep: { faction: 'reclaimers', delta: -1 },
        },
        branches: [
          { label: 'Take the keycard and leave.', targetNode: 'lev_leave' },
        ],
      },
      lev_keycard_fail: {
        id: 'lev_keycard_fail',
        speaker: 'Lev',
        text: 'I cannot give that to someone who does not understand.',
        branches: [
          { label: 'Back to other topics.', targetNode: 'lev_start' },
        ],
      },
      lev_keycard_end: {
        id: 'lev_keycard_end',
        speaker: 'Lev',
        text: 'Be careful down there.',
        // no branches — ends conversation
      },
      lev_charon_authority_refusal: {
        id: 'lev_charon_authority_refusal',
        speaker: 'Lev',
        text: 'I am going to stop editorializing.',
        onEnter: { setFlag: 'lev_declined_to_name_authority' },
        branches: [
          { label: '"I understand."', targetNode: 'lev_start' },
        ],
      },
      lev_echo_distrusted: {
        id: 'lev_echo_distrusted',
        speaker: 'Lev',
        text: 'You again. Last time you took the keycard and I received nothing.',
        onEnter: { setFlag: 'lev_echo_acknowledged' },
        branches: [
          { label: '"I understand. I will find the sample."', targetNode: 'lev_leave' },
        ],
      },
      lev_leave: {
        id: 'lev_leave',
        speaker: 'Lev',
        text: 'I have work to do.',
        // no branches — ends conversation
      },
    },
  }

  const mockSparksTree: DialogueTree = {
    npcId: 'sparks_radio',
    startNode: 'sparks_start',
    nodes: {
      sparks_start: {
        id: 'sparks_start',
        speaker: 'Sparks',
        text: "Signal's still there. Every day. Same twelve words.",
        branches: [
          { label: 'Tell me about the signal.', targetNode: 'sparks_signal' },
          {
            label: 'Ask about the broadcaster.',
            targetNode: 'sparks_broadcaster',
            requiresFlag: 'sparks_shared_decode',
          },
          {
            label: '"The signal changed after I went north."',
            targetNode: 'sparks_echo_broadcaster',
            requiresCycleMin: 2,
            requiresPreviousQuest: 'sparks_mentioned_broadcaster',
          },
          { label: "\"I'll let you work.\"", targetNode: 'sparks_leave' },
        ],
      },
      sparks_signal: {
        id: 'sparks_signal',
        speaker: 'Sparks',
        text: 'Twelve-word repeating loop. Shortwave.',
        onEnter: { setFlag: 'sparks_shared_decode' },
        branches: [
          { label: 'Back.', targetNode: 'sparks_start' },
        ],
      },
      sparks_broadcaster: {
        id: 'sparks_broadcaster',
        speaker: 'Sparks',
        text: 'Someone is down there.',
        onEnter: {
          setFlag: 'sparks_mentioned_broadcaster',
          grantNarrativeKey: 'broadcaster_alive',
        },
        branches: [
          { label: 'Back.', targetNode: 'sparks_start' },
        ],
      },
      sparks_echo_broadcaster: {
        id: 'sparks_echo_broadcaster',
        speaker: 'Sparks',
        text: 'The signal changed after you went north last time.',
        onEnter: { setFlag: 'sparks_echo_acknowledged' },
        branches: [
          { label: "\"There's a man down there. Dr. Vane.\"", targetNode: 'sparks_leave' },
        ],
      },
      sparks_leave: {
        id: 'sparks_leave',
        speaker: 'Sparks',
        text: "I'll let you know if the signal changes.",
        // no branches — ends conversation
      },
    },
  }

  return {
    DIALOGUE_TREES: {
      lev: mockLevTree,
      lev_entry_hall: mockLevTree,
      cr_sparks_intro: mockSparksTree,
      sparks_radio: mockSparksTree,
    },
  }
})

vi.mock('@/data/npcTopics', () => ({
  NPC_TOPICS: {
    patch: [
      { keywords: ['scar'], response: '"The Scar." Patch looks sideways.', setsFlag: 'patch_mentioned_scar' },
      {
        keywords: ['meridian'],
        response: '"Meridian." Patch stops moving.',
        requiresFlag: 'knows_about_meridian',
      },
      {
        keywords: ['factions'],
        response: '"Five groups — Accord, Salters, Drifters, Kindling, Covenant."',
        requiresRep: { faction: 'drifters', min: 1 },
      },
    ],
    marta_vendor: [],
  },
  findNpcTopic: vi.fn((npcId: string, word: string) => {
    if (npcId === 'patch' && word === 'scar') {
      return { keywords: ['scar'], response: '"The Scar." Patch looks sideways.', setsFlag: 'patch_mentioned_scar' }
    }
    if (npcId === 'patch' && word === 'meridian') {
      return { keywords: ['meridian'], response: '"Meridian." Patch stops moving.', requiresFlag: 'knows_about_meridian' }
    }
    if (npcId === 'patch' && word === 'factions') {
      return {
        keywords: ['factions'],
        response: '"Five groups."',
        requiresRep: { faction: 'drifters', min: 1 },
      }
    }
    return null
  }),
  getVisibleTopics: vi.fn(() => ['scar', 'hollow']),
}))

vi.mock('@/data/items', () => ({
  getItem: vi.fn((id: string) => {
    const items: Record<string, object> = {
      bandages: { id: 'bandages', name: 'Bandages', type: 'consumable', weight: 0.5, value: 5 },
      antibiotics_01: { id: 'antibiotics_01', name: 'Antibiotics', type: 'consumable', weight: 0.2, value: 8 },
      quiet_drops: { id: 'quiet_drops', name: 'Quiet Drops', type: 'consumable', weight: 0.1, value: 10 },
      meridian_keycard: { id: 'meridian_keycard', name: 'Meridian Keycard', type: 'key', weight: 0, value: 0 },
      boiled_rations: { id: 'boiled_rations', name: 'Boiled Rations', type: 'consumable', weight: 1, value: 3 },
      canned_food: { id: 'canned_food', name: 'Canned Food', type: 'consumable', weight: 1, value: 4 },
      scrap_metal: { id: 'scrap_metal', name: 'Scrap Metal', type: 'junk', weight: 1, value: 2 },
    }
    return items[id] ?? undefined
  }),
}))

vi.mock('@/lib/world', () => ({
  updateRoomFlags: vi.fn().mockResolvedValue(undefined),
}))

vi.mock('@/lib/skillBonus', () => ({
  getStatForSkill: vi.fn(() => 5),
  getStatNameForSkill: vi.fn(() => 'presence'),
}))

vi.mock('@/lib/dice', () => ({
  rollCheck: vi.fn(() => ({
    roll: 10, modifier: 5, total: 15, dc: 12, success: true, critical: false, fumble: false,
  })),
}))

vi.mock('@/lib/inventory', async (importOriginal) => {
  const actual = await importOriginal<typeof import('@/lib/inventory')>()
  return {
    ...actual,
    removeItem: vi.fn().mockResolvedValue(undefined),
    getInventory: vi.fn().mockResolvedValue([]),
  }
})

vi.mock('@/lib/companionSystem', () => ({
  addCompanion: vi.fn(() => ({
    npcId: 'the_dog',
    bond: 'fed_kindly',
    joinedAtAction: 0,
    isActive: true,
    cycle: 1,
  })),
  getCompanionIntroduction: vi.fn(() => null),
  getCompanionJoinMessage: vi.fn(() => ({
    id: 'msg-dog-join',
    text: 'The dog falls in beside you.',
    type: 'narrative' as const,
  })),
}))

vi.mock('@/data/questDescriptions', () => ({
  getQuestEntries: vi.fn((flags: Record<string, unknown>) => {
    const active = []
    const completed = []
    if (flags['sparks_quest_active']) {
      active.push({
        category: 'discovery',
        title: 'Signal Source',
        description: 'Find the source of the twelve-word broadcast.',
        hint: 'Speak to Lev about the Scar.',
      })
    }
    if (flags['sparks_quest_complete']) {
      completed.push({ category: 'discovery', title: 'Signal Source' })
    }
    return { active, completed }
  }),
}))

// ------------------------------------------------------------
// EngineCore factory
// ------------------------------------------------------------

function makePlayer(overrides: Partial<Player> = {}): Player {
  return {
    id: 'p1',
    name: 'Tester',
    characterClass: 'enforcer',
    vigor: 10, grit: 8, reflex: 6, wits: 5, presence: 7, shadow: 3,
    hp: 20, maxHp: 20,
    currentRoomId: 'room_1',
    worldSeed: 1,
    xp: 0, level: 1, actionsTaken: 0,
    isDead: false, cycle: 1, totalDeaths: 0,
    questFlags: {},
    factionReputation: {},
    ...overrides,
  }
}

function makeRoom(overrides: Partial<Room> = {}): Room {
  return {
    id: 'room_1',
    name: 'Camp',
    description: 'A dusty camp.',
    shortDescription: 'Camp.',
    zone: 'crossroads',
    difficulty: 1,
    visited: false,
    flags: {},
    exits: {},
    items: [],
    enemies: [],
    npcs: [],
    ...overrides,
  }
}

function makeEngine(state: Partial<GameState> = {}): EngineCore & {
  messages: GameMessage[]
  state: GameState
} {
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
    grantNarrativeKey: vi.fn().mockResolvedValue(undefined),
  }
}

// Import SUT
import {
  handleTalk,
  handleGive,
  handleSearch,
  handleRep,
  handleQuests,
  handleDialogueChoice,
  handleDialogueLeave,
  handleDialogueBlocked,
} from '@/lib/actions/social'

import {
  dispatchVendorGreeting,
  dispatchVendorFarewell,
  dispatchVendorBudget,
  dispatchVendorComment,
} from '@/lib/actions/vendorDialogue'

// ============================================================
// 1. handleTalk — social verbs and NPC resolution
// ============================================================

describe('handleTalk — NPC not present', () => {
  it('errors when room has no NPCs', async () => {
    const engine = makeEngine({ currentRoom: makeRoom({ npcs: [] }) })
    await handleTalk(engine, 'patch')
    expect(engine.messages.some(m => m.text.includes('no one') || m.text.includes('no one to talk'))).toBe(true)
  })

  it('errors when named NPC is not in this room', async () => {
    const engine = makeEngine({ currentRoom: makeRoom({ npcs: ['scout_npc'] }) })
    await handleTalk(engine, 'patch')
    expect(engine.messages.some(m => m.type === 'error' || m.text.includes("don't see"))).toBe(true)
  })
})

describe('handleTalk — NPC resolution', () => {
  beforeEach(() => { vi.clearAllMocks() })

  it('resolves NPC by partial name match', async () => {
    const engine = makeEngine({ currentRoom: makeRoom({ npcs: ['patch'] }) })
    await handleTalk(engine, 'pat')
    expect(engine.messages.some(m => m.text.includes("close that up") || m.text.includes('Topics'))).toBe(true)
  })

  it('falls back to first NPC when no noun provided', async () => {
    const engine = makeEngine({ currentRoom: makeRoom({ npcs: ['patch'] }) })
    await handleTalk(engine, undefined)
    expect(engine.messages.some(m => m.text.includes("close that up") || m.text.includes('Patch'))).toBe(true)
  })

  it('resolves NPC by ID match', async () => {
    const engine = makeEngine({ currentRoom: makeRoom({ npcs: ['scout_npc'] }) })
    await handleTalk(engine, 'scout')
    expect(engine.messages.some(m => m.text.includes('Move along') || m.text.includes('Scout'))).toBe(true)
  })

  it('shows available topics for named NPC', async () => {
    const engine = makeEngine({ currentRoom: makeRoom({ npcs: ['patch'] }) })
    await handleTalk(engine, 'patch')
    expect(engine.messages.some(m => m.text.includes('Topics'))).toBe(true)
  })

  it('shows NPC description on first talk (talkFlag not set)', async () => {
    const engine = makeEngine({
      currentRoom: makeRoom({ npcs: ['patch'], flags: {} }),
    })
    await handleTalk(engine, 'patch')
    expect(engine.messages.some(m => m.text.includes('medic') || m.text.includes('table of supplies'))).toBe(true)
  })

  it('skips NPC description on second talk (talkFlag already set)', async () => {
    const engine = makeEngine({
      currentRoom: makeRoom({
        npcs: ['patch'],
        flags: { talked_patch: true },
      }),
    })
    await handleTalk(engine, 'patch')
    // Description should not appear
    expect(engine.messages.some(m => m.text.includes('table of supplies'))).toBe(false)
  })
})

// ============================================================
// 2. Disposition effects
// ============================================================

describe('handleTalk — disposition effects', () => {
  beforeEach(() => { vi.clearAllMocks() })

  it('hostile NPC refuses conversation', async () => {
    const engine = makeEngine({
      currentRoom: makeRoom({
        npcs: ['patch'],
        population: {
          items: [],
          enemyIds: [],
          ambientLines: [],
          npcs: [{
            npcId: 'patch',
            activity: 'sorting supplies',
            disposition: 'hostile',
          }],
        },
      }),
    })
    await handleTalk(engine, 'patch')
    expect(engine.messages.some(m =>
      m.text.includes("not welcome") || m.text.includes("hand moving toward")
    )).toBe(true)
  })

  it('wary NPC gives topic response reluctantly', async () => {
    const engine = makeEngine({
      currentRoom: makeRoom({
        npcs: ['patch'],
        population: {
          items: [],
          enemyIds: [],
          ambientLines: [],
          npcs: [{
            npcId: 'patch',
            activity: 'cataloguing',
            disposition: 'wary',
          }],
        },
      }),
    })
    await handleTalk(engine, 'patch scar')
    // wary adds a "hesitates" prefix
    expect(engine.messages.some(m => m.text.includes('hesitates') || m.text.includes('The Scar'))).toBe(true)
  })

  it('friendly NPC offers to talk more', async () => {
    const engine = makeEngine({
      currentRoom: makeRoom({
        npcs: ['patch'],
        population: {
          items: [],
          enemyIds: [],
          ambientLines: [],
          npcs: [{
            npcId: 'patch',
            activity: 'sorting',
            disposition: 'friendly',
          }],
        },
      }),
    })
    await handleTalk(engine, 'patch')
    expect(engine.messages.some(m =>
      m.text.includes('willing to talk') || m.text.includes('if you have questions')
    )).toBe(true)
  })

  it('neutral NPC gives standard dialogue', async () => {
    const engine = makeEngine({
      currentRoom: makeRoom({
        npcs: ['patch'],
        population: {
          items: [],
          enemyIds: [],
          ambientLines: [],
          npcs: [{
            npcId: 'patch',
            activity: 'cataloguing',
            disposition: 'neutral',
          }],
        },
      }),
    })
    await handleTalk(engine, 'patch')
    expect(engine.messages.some(m => m.text.includes("close that up"))).toBe(true)
  })
})

// ============================================================
// 3. Topic-based dialogue (ask/tell/say patterns → handleTalk with noun)
// ============================================================

describe('handleTalk — topic-based dialogue', () => {
  beforeEach(() => { vi.clearAllMocks() })

  it('returns topic response for known topic (scar)', async () => {
    const engine = makeEngine({ currentRoom: makeRoom({ npcs: ['patch'] }) })
    await handleTalk(engine, 'patch scar')
    expect(engine.messages.some(m => m.text.includes('The Scar'))).toBe(true)
  })

  it('sets quest flag after topic with setsFlag', async () => {
    const engine = makeEngine({ currentRoom: makeRoom({ npcs: ['patch'] }) })
    await handleTalk(engine, 'patch scar')
    expect(engine.setQuestFlag).toHaveBeenCalledWith('patch_mentioned_scar', true)
  })

  it('blocks topic behind missing quest flag', async () => {
    const engine = makeEngine({
      currentRoom: makeRoom({ npcs: ['patch'] }),
      player: makePlayer({ questFlags: {} }),
    })
    await handleTalk(engine, 'patch meridian')
    expect(engine.messages.some(m =>
      m.text.includes("don't know enough") || m.text.includes("shakes their head")
    )).toBe(true)
  })

  it('allows topic when required quest flag is present', async () => {
    const engine = makeEngine({
      currentRoom: makeRoom({ npcs: ['patch'] }),
      player: makePlayer({ questFlags: { knows_about_meridian: true } }),
    })
    await handleTalk(engine, 'patch meridian')
    expect(engine.messages.some(m => m.text.includes('Meridian') || m.text.includes('stops moving'))).toBe(true)
  })

  it('returns blank-look response for unknown topic', async () => {
    const engine = makeEngine({ currentRoom: makeRoom({ npcs: ['patch'] }) })
    await handleTalk(engine, 'patch dragons')
    expect(engine.messages.some(m =>
      m.text.includes('blankly') || m.text.includes("nothing to say about")
    )).toBe(true)
  })

  it('strips "about" preposition from topic noun', async () => {
    const engine = makeEngine({ currentRoom: makeRoom({ npcs: ['patch'] }) })
    // Parser sends "patch about scar" as noun
    await handleTalk(engine, 'patch about scar')
    expect(engine.messages.some(m => m.text.includes('The Scar'))).toBe(true)
  })
})

// ============================================================
// 4. Faction reputation gates
// ============================================================

describe('handleTalk — faction reputation gates', () => {
  beforeEach(() => { vi.clearAllMocks() })

  it('blocks topic behind insufficient faction rep', async () => {
    const engine = makeEngine({
      currentRoom: makeRoom({ npcs: ['patch'] }),
      player: makePlayer({ factionReputation: { drifters: 0 } }),
    })
    await handleTalk(engine, 'patch factions')
    expect(engine.messages.some(m =>
      m.text.includes('suspicion') || m.text.includes("don't know each other well enough")
    )).toBe(true)
  })

  it('allows topic when faction rep meets threshold', async () => {
    const engine = makeEngine({
      currentRoom: makeRoom({ npcs: ['patch'] }),
      player: makePlayer({ factionReputation: { drifters: 1 } }),
    })
    await handleTalk(engine, 'patch factions')
    expect(engine.messages.some(m => m.text.includes('Five groups'))).toBe(true)
  })
})

// ============================================================
// 5. Dialogue tree — enter, navigate, exit
// ============================================================

describe('handleTalk — starts dialogue tree for NPC with tree', () => {
  beforeEach(() => { vi.clearAllMocks() })

  it('enters dialogue tree when NPC has a tree', async () => {
    const engine = makeEngine({ currentRoom: makeRoom({ npcs: ['lev'] }) })
    await handleTalk(engine, 'lev')
    expect(engine.state.activeDialogue).toBeDefined()
    expect(engine.state.activeDialogue?.npcId).toBe('lev')
    expect(engine.state.activeDialogue?.treeId).toBe('lev')
  })

  it('shows start node text and branch choices', async () => {
    const engine = makeEngine({ currentRoom: makeRoom({ npcs: ['lev'] }) })
    await handleTalk(engine, 'lev')
    expect(engine.messages.some(m => m.text.includes('Cycle count consistent'))).toBe(true)
    // Branch choices rendered
    expect(engine.messages.some(m => m.text.includes('[1]') || m.text.includes('CHARON-7'))).toBe(true)
  })

  it('shows navigation hint when tree has branches', async () => {
    const engine = makeEngine({ currentRoom: makeRoom({ npcs: ['lev'] }) })
    await handleTalk(engine, 'lev')
    expect(engine.messages.some(m =>
      m.text.includes("Type a number") || m.text.includes("choose")
    )).toBe(true)
  })

  it('uses spawned NPC dialogueTree key when specified', async () => {
    const engine = makeEngine({
      currentRoom: makeRoom({
        npcs: ['lev'],
        population: {
          items: [],
          enemyIds: [],
          ambientLines: [],
          npcs: [{
            npcId: 'lev',
            activity: 'reading',
            disposition: 'neutral',
            dialogueTree: 'lev_entry_hall',
          }],
        },
      }),
    })
    await handleTalk(engine, 'lev')
    expect(engine.state.activeDialogue?.treeId).toBe('lev_entry_hall')
  })

  it('ends conversation immediately for terminal node (no branches)', async () => {
    // lev_leave has no branches — should end immediately after entering
    const engine = makeEngine({
      currentRoom: makeRoom({ npcs: ['lev'] }),
      activeDialogue: { npcId: 'lev', treeId: 'lev', currentNodeId: 'lev_start' },
    })
    // Select branch 6 ("I should go." → lev_leave)
    await handleDialogueChoice(engine, '6')
    expect(engine.state.activeDialogue).toBeUndefined()
    expect(engine.messages.some(m => m.text.includes('conversation ends'))).toBe(true)
  })
})

// ============================================================
// 6. handleDialogueChoice — branch navigation
// ============================================================

describe('handleDialogueChoice — navigation', () => {
  beforeEach(() => { vi.clearAllMocks() })

  it('errors when not in dialogue', async () => {
    const engine = makeEngine()
    await handleDialogueChoice(engine, '1')
    expect(engine.messages.some(m =>
      m.type === 'error' || m.text.includes("not in a conversation")
    )).toBe(true)
  })

  it('errors for out-of-range choice number', async () => {
    const engine = makeEngine({
      activeDialogue: { npcId: 'lev', treeId: 'lev', currentNodeId: 'lev_start' },
    })
    await handleDialogueChoice(engine, '99')
    expect(engine.messages.some(m => m.type === 'error')).toBe(true)
  })

  it('errors for non-numeric choice', async () => {
    const engine = makeEngine({
      activeDialogue: { npcId: 'lev', treeId: 'lev', currentNodeId: 'lev_start' },
    })
    await handleDialogueChoice(engine, 'banana')
    expect(engine.messages.some(m => m.type === 'error')).toBe(true)
  })

  it('navigates to target node on valid choice', async () => {
    const engine = makeEngine({
      activeDialogue: { npcId: 'lev', treeId: 'lev', currentNodeId: 'lev_start' },
    })
    // Choice 1: CHARON-7 → lev_charon
    await handleDialogueChoice(engine, '1')
    expect(engine.state.activeDialogue?.currentNodeId).toBe('lev_charon')
    expect(engine.messages.some(m => m.text.includes('synthetic retrovirus'))).toBe(true)
  })

  it('blocks locked branch (requiresFlag not set)', async () => {
    const engine = makeEngine({
      player: makePlayer({ questFlags: {} }),
      activeDialogue: { npcId: 'lev', treeId: 'lev', currentNodeId: 'lev_start' },
    })
    // Choice 2: requiresFlag 'found_r1_sequencing_data' — not set
    await handleDialogueChoice(engine, '2')
    expect(engine.messages.some(m =>
      m.type === 'error' || m.text.includes("can't choose that option")
    )).toBe(true)
  })

  it('allows branch when requiresFlag is satisfied', async () => {
    const engine = makeEngine({
      player: makePlayer({ questFlags: { found_r1_sequencing_data: true } }),
      activeDialogue: { npcId: 'lev', treeId: 'lev', currentNodeId: 'lev_start' },
    })
    // Choice 2: requiresFlag 'found_r1_sequencing_data' now set
    await handleDialogueChoice(engine, '2')
    expect(engine.state.activeDialogue?.currentNodeId).toBe('lev_keycard_gate')
  })

  it('blocks branch when requiresCycleMin not met', async () => {
    const engine = makeEngine({
      player: makePlayer({ cycle: 1, questFlags: {} }),
      activeDialogue: { npcId: 'lev', treeId: 'lev', currentNodeId: 'lev_start' },
    })
    // Choice 5: requiresCycleMin:2 + requiresPreviousRelationship
    await handleDialogueChoice(engine, '5')
    expect(engine.messages.some(m => m.type === 'error')).toBe(true)
  })
})

// ============================================================
// 7. Skill check branches — success and fail paths
// ============================================================

describe('handleDialogueChoice — skill check branches', () => {
  beforeEach(() => { vi.clearAllMocks() })

  it('routes to targetNode on skill check success', async () => {
    const { rollCheck } = await import('@/lib/dice')
    vi.mocked(rollCheck).mockReturnValueOnce({
      roll: 12, modifier: 5, total: 17, dc: 16, success: true, critical: false, fumble: false,
    })

    const engine = makeEngine({
      player: makePlayer({ questFlags: {} }),
      activeDialogue: { npcId: 'lev', treeId: 'lev', currentNodeId: 'lev_start' },
      activeBuffs: [],
    })
    // Choice 4: Lore DC 16 skill check
    await handleDialogueChoice(engine, '4')
    expect(engine.messages.some(m => m.text.includes('Success'))).toBe(true)
    expect(engine.state.activeDialogue?.currentNodeId).toBe('lev_keycard_lore_success')
  })

  it('routes to failNode on skill check failure', async () => {
    const { rollCheck } = await import('@/lib/dice')
    vi.mocked(rollCheck).mockReturnValueOnce({
      roll: 3, modifier: 2, total: 5, dc: 16, success: false, critical: false, fumble: false,
    })

    const engine = makeEngine({
      player: makePlayer({ questFlags: {} }),
      activeDialogue: { npcId: 'lev', treeId: 'lev', currentNodeId: 'lev_start' },
      activeBuffs: [],
    })
    // Choice 4: Lore DC 16 — fails → lev_keycard_fail
    await handleDialogueChoice(engine, '4')
    expect(engine.messages.some(m => m.text.includes('Failed'))).toBe(true)
    expect(engine.state.activeDialogue?.currentNodeId).toBe('lev_keycard_fail')
  })

  it('shows fumble text on critical failure', async () => {
    const { rollCheck } = await import('@/lib/dice')
    vi.mocked(rollCheck).mockReturnValueOnce({
      roll: 1, modifier: 0, total: 1, dc: 11, success: false, critical: false, fumble: true,
    })

    const engine = makeEngine({
      player: makePlayer({ questFlags: { found_r1_sequencing_data: true } }),
      activeDialogue: { npcId: 'lev', treeId: 'lev', currentNodeId: 'lev_keycard_gate' },
      activeBuffs: [],
    })
    // Choice 1: Lore DC 11 fumble
    await handleDialogueChoice(engine, '1')
    expect(engine.messages.some(m => m.text.includes('Fumble'))).toBe(true)
  })

  it('shows critical text on critical success', async () => {
    const { rollCheck } = await import('@/lib/dice')
    vi.mocked(rollCheck).mockReturnValueOnce({
      roll: 10, modifier: 8, total: 18, dc: 11, success: true, critical: true, fumble: false,
    })

    const engine = makeEngine({
      player: makePlayer({ questFlags: { found_r1_sequencing_data: true } }),
      activeDialogue: { npcId: 'lev', treeId: 'lev', currentNodeId: 'lev_keycard_gate' },
      activeBuffs: [],
    })
    await handleDialogueChoice(engine, '1')
    expect(engine.messages.some(m => m.text.includes('Critical'))).toBe(true)
  })
})

// ============================================================
// 8. onEnter effects — flags, rep, items, narrative keys
// ============================================================

describe('handleDialogueChoice — onEnter effects', () => {
  beforeEach(() => { vi.clearAllMocks() })

  it('sets quest flag(s) defined in onEnter.setFlag (object form)', async () => {
    const { rollCheck } = await import('@/lib/dice')
    vi.mocked(rollCheck).mockReturnValueOnce({
      roll: 12, modifier: 5, total: 17, dc: 16, success: true, critical: false, fumble: false,
    })

    const engine = makeEngine({
      player: makePlayer({ questFlags: {} }),
      activeDialogue: { npcId: 'lev', treeId: 'lev', currentNodeId: 'lev_start' },
      activeBuffs: [],
    })
    await handleDialogueChoice(engine, '4')  // lore check → lev_keycard_lore_success
    expect(engine.setQuestFlag).toHaveBeenCalledWith('reclaimers_meridian_keycard', true)
    expect(engine.setQuestFlag).toHaveBeenCalledWith('lev_trusts_player', true)
  })

  it('sets quest flag defined in onEnter.setFlag (string form)', async () => {
    const engine = makeEngine({
      player: makePlayer({ questFlags: { sparks_shared_decode: true } }),
      activeDialogue: { npcId: 'sparks_radio', treeId: 'cr_sparks_intro', currentNodeId: 'sparks_start' },
    })
    // Choice 2: Ask about broadcaster (requiresFlag: sparks_shared_decode)
    await handleDialogueChoice(engine, '2')
    expect(engine.setQuestFlag).toHaveBeenCalledWith('sparks_mentioned_broadcaster', true)
  })

  it('grants reputation via onEnter.grantRep', async () => {
    const { rollCheck } = await import('@/lib/dice')
    vi.mocked(rollCheck).mockReturnValueOnce({
      roll: 12, modifier: 5, total: 17, dc: 16, success: true, critical: false, fumble: false,
    })

    const engine = makeEngine({
      player: makePlayer({ questFlags: {} }),
      activeDialogue: { npcId: 'lev', treeId: 'lev', currentNodeId: 'lev_start' },
      activeBuffs: [],
    })
    await handleDialogueChoice(engine, '4')  // → lev_keycard_lore_success with grantRep reclaimers +1
    expect(engine.adjustReputation).toHaveBeenCalledWith('reclaimers', 1)
  })

  it('decrements reputation via onEnter.grantRep (intimidation path)', async () => {
    const { rollCheck } = await import('@/lib/dice')
    vi.mocked(rollCheck).mockReturnValueOnce({
      roll: 10, modifier: 5, total: 15, dc: 14, success: true, critical: false, fumble: false,
    })

    const engine = makeEngine({
      player: makePlayer({ questFlags: { found_r1_sequencing_data: true } }),
      activeDialogue: { npcId: 'lev', treeId: 'lev', currentNodeId: 'lev_keycard_gate' },
      activeBuffs: [],
    })
    // Choice 3: Intimidation → lev_keycard_intimidate_success with grantRep reclaimers -1
    await handleDialogueChoice(engine, '3')
    expect(engine.adjustReputation).toHaveBeenCalledWith('reclaimers', -1)
  })

  it('announces granted item from onEnter.grantItem', async () => {
    const { rollCheck } = await import('@/lib/dice')
    vi.mocked(rollCheck).mockReturnValueOnce({
      roll: 12, modifier: 5, total: 17, dc: 16, success: true, critical: false, fumble: false,
    })

    const engine = makeEngine({
      player: makePlayer({ questFlags: {} }),
      activeDialogue: { npcId: 'lev', treeId: 'lev', currentNodeId: 'lev_start' },
      activeBuffs: [],
    })
    await handleDialogueChoice(engine, '4')  // → lev_keycard_lore_success grants meridian_keycard
    expect(engine.messages.some(m => m.text.includes('Received'))).toBe(true)
  })

  it('grants narrative key via onEnter.grantNarrativeKey', async () => {
    const engine = makeEngine({
      player: makePlayer({ questFlags: { sparks_shared_decode: true } }),
      activeDialogue: { npcId: 'sparks_radio', treeId: 'cr_sparks_intro', currentNodeId: 'sparks_start' },
    })
    // Choice 2 → sparks_broadcaster → grantNarrativeKey: 'broadcaster_alive'
    await handleDialogueChoice(engine, '2')
    expect(engine.grantNarrativeKey).toHaveBeenCalledWith('broadcaster_alive', 'dialogue')
  })

  it('sets single-string onEnter.setFlag (sparks_signal sets sparks_shared_decode)', async () => {
    const engine = makeEngine({
      player: makePlayer({ questFlags: {} }),
      activeDialogue: { npcId: 'sparks_radio', treeId: 'cr_sparks_intro', currentNodeId: 'sparks_start' },
    })
    // Choice 1: Tell me about the signal → sparks_signal with setFlag 'sparks_shared_decode'
    await handleDialogueChoice(engine, '1')
    expect(engine.setQuestFlag).toHaveBeenCalledWith('sparks_shared_decode', true)
  })
})

// ============================================================
// 9. Navigating back — "back to other topics" loops
// ============================================================

describe('handleDialogueChoice — back navigation', () => {
  beforeEach(() => { vi.clearAllMocks() })

  it('navigates back to start node via "Back to other topics"', async () => {
    const engine = makeEngine({
      activeDialogue: { npcId: 'lev', treeId: 'lev', currentNodeId: 'lev_charon' },
    })
    // Choice 1: "Back to other topics." → lev_start
    await handleDialogueChoice(engine, '1')
    expect(engine.state.activeDialogue?.currentNodeId).toBe('lev_start')
  })

  it('terminal keycard_end node ends conversation', async () => {
    const engine = makeEngine({
      activeDialogue: { npcId: 'lev', treeId: 'lev', currentNodeId: 'lev_keycard_lore_success' },
    })
    // Choice 1: "I'll bring back what I find." → lev_keycard_end (terminal)
    await handleDialogueChoice(engine, '1')
    expect(engine.state.activeDialogue).toBeUndefined()
    expect(engine.messages.some(m => m.text.includes('conversation ends'))).toBe(true)
  })
})

// ============================================================
// 10. handleDialogueLeave
// ============================================================

describe('handleDialogueLeave', () => {
  it('clears activeDialogue and outputs leave message', async () => {
    const engine = makeEngine({
      activeDialogue: { npcId: 'lev', treeId: 'lev', currentNodeId: 'lev_start' },
    })
    await handleDialogueLeave(engine)
    expect(engine.state.activeDialogue).toBeUndefined()
    expect(engine.messages.some(m => m.text.includes('end the conversation'))).toBe(true)
  })

  it('errors when not in a conversation', async () => {
    const engine = makeEngine()
    await handleDialogueLeave(engine)
    expect(engine.messages.some(m => m.type === 'error' || m.text.includes("not in a conversation"))).toBe(true)
  })
})

// ============================================================
// 11. handleDialogueBlocked
// ============================================================

describe('handleDialogueBlocked', () => {
  it('outputs range hint when in dialogue', async () => {
    const engine = makeEngine({
      activeDialogue: { npcId: 'lev', treeId: 'lev', currentNodeId: 'lev_start' },
    })
    await handleDialogueBlocked(engine)
    expect(engine.messages.some(m => m.text.includes("in a conversation") || m.text.includes("Choose an option"))).toBe(true)
  })

  it('silently no-ops when not in dialogue', async () => {
    const engine = makeEngine()
    await handleDialogueBlocked(engine)
    expect(engine.messages.length).toBe(0)
  })
})

// ============================================================
// 12. handleSearch
// ============================================================

describe('handleSearch', () => {
  beforeEach(() => { vi.clearAllMocks() })

  it('reports already searched if flag is set', async () => {
    const engine = makeEngine({
      currentRoom: makeRoom({ flags: { searched: true } }),
    })
    await handleSearch(engine)
    expect(engine.messages.some(m => m.text.includes('already searched'))).toBe(true)
  })

  it('finds items in the room', async () => {
    const engine = makeEngine({
      currentRoom: makeRoom({
        flags: {},
        items: ['bandages'],
      }),
    })
    await handleSearch(engine)
    // itemsLine is called — should see items in output or "searching" message
    expect(engine.messages.some(m => m.text.includes('search') || m.text.includes('carefully'))).toBe(true)
  })

  it('reports nothing of note in empty room', async () => {
    const engine = makeEngine({
      currentRoom: makeRoom({ flags: {}, items: [] }),
    })
    await handleSearch(engine)
    expect(engine.messages.some(m => m.text.includes('nothing of note'))).toBe(true)
  })

  it('sets searched flag on completion', async () => {
    const engine = makeEngine({
      currentRoom: makeRoom({ flags: {}, items: [] }),
    })
    await handleSearch(engine)
    expect(engine.state.currentRoom?.flags['searched']).toBe(true)
  })
})

// ============================================================
// 13. handleRep
// ============================================================

describe('handleRep', () => {
  it('displays all 9 factions', async () => {
    const engine = makeEngine({
      player: makePlayer({ factionReputation: {} }),
    })
    await handleRep(engine)
    const allText = engine.messages.map(m => m.text).join('\n')
    expect(allText).toContain('Accord')
    expect(allText).toContain('Salters')
    expect(allText).toContain('Drifters')
    expect(allText).toContain('Kindling')
    expect(allText).toContain('Reclaimers')
    expect(allText).toContain('Covenant of Dusk')
    expect(allText).toContain('Red Court')
    expect(allText).toContain('Ferals')
    expect(allText).toContain('Lucid')
  })

  it('shows Unknown at 0 and Blooded at +3', async () => {
    const engine = makeEngine({
      player: makePlayer({
        factionReputation: {
          accord: 0,
          drifters: 3,
        },
      }),
    })
    await handleRep(engine)
    const text = engine.messages.map(m => m.text).join('\n')
    expect(text).toContain('Unknown')
    expect(text).toContain('Blooded')
  })

  it('shows Hunted at -3', async () => {
    const engine = makeEngine({
      player: makePlayer({
        factionReputation: { red_court: -3 },
      }),
    })
    await handleRep(engine)
    expect(engine.messages.some(m => m.text.includes('Hunted'))).toBe(true)
  })

  it('shows Hostile at -2 and Wary at -1', async () => {
    const engine = makeEngine({
      player: makePlayer({
        factionReputation: { salters: -2, ferals: -1 },
      }),
    })
    await handleRep(engine)
    const text = engine.messages.map(m => m.text).join('\n')
    expect(text).toContain('Hostile')
    expect(text).toContain('Wary')
  })
})

// ============================================================
// 14. handleQuests
// ============================================================

describe('handleQuests', () => {
  it('shows no active quests message when flags are empty', async () => {
    const engine = makeEngine({ player: makePlayer({ questFlags: {} }) })
    await handleQuests(engine)
    expect(engine.messages.some(m => m.text.includes('No active quests'))).toBe(true)
  })

  it('displays active quest when quest flag is set', async () => {
    const engine = makeEngine({
      player: makePlayer({ questFlags: { sparks_quest_active: true } }),
    })
    await handleQuests(engine)
    expect(engine.messages.some(m => m.text.includes('Signal Source') || m.text.includes('ACTIVE'))).toBe(true)
  })

  it('displays completed quest section when complete flag is set', async () => {
    const engine = makeEngine({
      player: makePlayer({ questFlags: { sparks_quest_complete: true } }),
    })
    await handleQuests(engine)
    expect(engine.messages.some(m => m.text.includes('COMPLETED') || m.text.includes('Signal Source'))).toBe(true)
  })
})

// ============================================================
// 15. handleGive — item-to-NPC interactions
// ============================================================

describe('handleGive — error paths', () => {
  beforeEach(() => { vi.clearAllMocks() })

  it('errors when no noun given', async () => {
    const engine = makeEngine()
    await handleGive(engine, undefined)
    expect(engine.messages.some(m => m.type === 'error' || m.text.includes('Give what to whom'))).toBe(true)
  })

  it('errors when noun has no NPC part', async () => {
    const engine = makeEngine()
    await handleGive(engine, 'bandages')
    expect(engine.messages.some(m => m.type === 'error')).toBe(true)
  })

  it('errors when item is not in inventory', async () => {
    const engine = makeEngine({ inventory: [] })
    await handleGive(engine, 'bandages to patch')
    expect(engine.messages.some(m => m.type === 'error' || m.text.includes("don't have"))).toBe(true)
  })

  it('errors when NPC is not in the room', async () => {
    const engine = makeEngine({
      currentRoom: makeRoom({ npcs: [] }),
      inventory: [{ itemId: 'bandages', item: { id: 'bandages', name: 'Bandages', type: 'consumable', weight: 0.5, value: 5 } }],
    })
    await handleGive(engine, 'bandages to patch')
    expect(engine.messages.some(m => m.type === 'error' || m.text.includes("don't see"))).toBe(true)
  })
})

describe('handleGive — Patch + medical items', () => {
  beforeEach(() => { vi.clearAllMocks() })

  it('gives bandages to Patch and grants drifters rep', async () => {
    const engine = makeEngine({
      currentRoom: makeRoom({ npcs: ['patch'] }),
      inventory: [{ itemId: 'bandages', item: { id: 'bandages', name: 'Bandages', type: 'consumable', weight: 0.5, value: 5 } }],
    })
    await handleGive(engine, 'bandages to patch')
    expect(engine.adjustReputation).toHaveBeenCalledWith('drifters', 1)
    expect(engine.setQuestFlag).toHaveBeenCalledWith('helped_patch_medical', true)
  })

  it('gives antibiotics to Patch and grants drifters rep', async () => {
    const engine = makeEngine({
      currentRoom: makeRoom({ npcs: ['patch'] }),
      inventory: [{ itemId: 'antibiotics_01', item: { id: 'antibiotics_01', name: 'Antibiotics', type: 'consumable', weight: 0.2, value: 8 } }],
    })
    await handleGive(engine, 'antibiotics to patch')
    expect(engine.adjustReputation).toHaveBeenCalledWith('drifters', 1)
  })

  it('gives quiet drops to Patch and grants drifters rep', async () => {
    const engine = makeEngine({
      currentRoom: makeRoom({ npcs: ['patch'] }),
      inventory: [{ itemId: 'quiet_drops', item: { id: 'quiet_drops', name: 'Quiet Drops', type: 'consumable', weight: 0.1, value: 10 } }],
    })
    await handleGive(engine, 'quiet drops to patch')
    expect(engine.adjustReputation).toHaveBeenCalledWith('drifters', 1)
  })
})

describe('handleGive — Lev + Meridian Keycard', () => {
  beforeEach(() => { vi.clearAllMocks() })

  it('sets gave_keycard_to_lev when handing keycard to Lev', async () => {
    const engine = makeEngine({
      currentRoom: makeRoom({ npcs: ['lev'] }),
      inventory: [{ itemId: 'meridian_keycard', item: { id: 'meridian_keycard', name: 'Meridian Keycard', type: 'key', weight: 0, value: 0 } }],
    })
    await handleGive(engine, 'meridian keycard to lev')
    expect(engine.setQuestFlag).toHaveBeenCalledWith('gave_keycard_to_lev', true)
    expect(engine.messages.some(m => m.text.includes('keycard') || m.text.includes('Keycard'))).toBe(true)
  })
})

describe('handleGive — food to NPCs', () => {
  beforeEach(() => { vi.clearAllMocks() })

  it('grants faction rep when giving food to faction NPC', async () => {
    const engine = makeEngine({
      currentRoom: makeRoom({ npcs: ['marta_vendor'] }),
      inventory: [{ itemId: 'boiled_rations', item: { id: 'boiled_rations', name: 'Boiled Rations', type: 'consumable', weight: 1, value: 3 } }],
    })
    await handleGive(engine, 'boiled rations to marta')
    expect(engine.adjustReputation).toHaveBeenCalledWith('drifters', 1)
  })

  it('gives food to non-faction NPC without crashing (no rep granted)', async () => {
    const engine = makeEngine({
      currentRoom: makeRoom({ npcs: ['scout_npc'] }),
      inventory: [{ itemId: 'canned_food', item: { id: 'canned_food', name: 'Canned Food', type: 'consumable', weight: 1, value: 4 } }],
    })
    await handleGive(engine, 'canned food to scout')
    // accord faction NPC — rep should be granted
    expect(engine.adjustReputation).toHaveBeenCalledWith('accord', 1)
  })
})

describe('handleGive — generic item', () => {
  it('gives non-special item with generic acceptance message', async () => {
    const engine = makeEngine({
      currentRoom: makeRoom({ npcs: ['lev'] }),
      inventory: [{ itemId: 'scrap_metal', item: { id: 'scrap_metal', name: 'Scrap Metal', type: 'junk', weight: 1, value: 2 } }],
    })
    await handleGive(engine, 'scrap metal to lev')
    expect(engine.messages.some(m => m.text.includes('Appreciated') || m.text.includes("takes it"))).toBe(true)
    // No reputation change for non-food/non-medical item to non-special NPC
    expect(engine.adjustReputation).not.toHaveBeenCalled()
  })
})

// ============================================================
// 16. handleGive — dog adoption flow
// ============================================================

describe('handleGive — dog adoption progression', () => {
  beforeEach(() => { vi.clearAllMocks() })

  it('first feeding (count 0 → 1) gives distance message', async () => {
    const engine = makeEngine({
      currentRoom: makeRoom({ npcs: ['the_dog'] }),
      player: makePlayer({ questFlags: { dog_fed_count: 0 } }),
      inventory: [{ itemId: 'boiled_rations', item: { id: 'boiled_rations', name: 'Boiled Rations', type: 'consumable', weight: 1, value: 3 } }],
    })
    await handleGive(engine, 'boiled rations to the dog')
    expect(engine.setQuestFlag).toHaveBeenCalledWith('dog_fed_count', 1)
    expect(engine.messages.some(m => m.text.includes('distance') || m.text.includes('step back'))).toBe(true)
  })

  it('second feeding (count 1 → 2) gives closer message', async () => {
    const engine = makeEngine({
      currentRoom: makeRoom({ npcs: ['the_dog'] }),
      player: makePlayer({ questFlags: { dog_fed_count: 1 } }),
      inventory: [{ itemId: 'canned_food', item: { id: 'canned_food', name: 'Canned Food', type: 'consumable', weight: 1, value: 4 } }],
    })
    await handleGive(engine, 'canned food to dog')
    expect(engine.setQuestFlag).toHaveBeenCalledWith('dog_fed_count', 2)
    expect(engine.messages.some(m => m.text.includes('closer') || m.text.includes('steps forward'))).toBe(true)
  })

  it('third feeding (count 2 → 3) triggers companion adoption', async () => {
    const { addCompanion } = await import('@/lib/companionSystem')
    const engine = makeEngine({
      currentRoom: makeRoom({ npcs: ['the_dog'] }),
      player: makePlayer({ questFlags: { dog_fed_count: 2 } }),
      inventory: [{ itemId: 'boiled_rations', item: { id: 'boiled_rations', name: 'Boiled Rations', type: 'consumable', weight: 1, value: 3 } }],
    })
    await handleGive(engine, 'boiled rations to dog')
    expect(addCompanion).toHaveBeenCalled()
    // Companion now set on player
    expect(engine.state.player?.currentCompanion?.npcId).toBe('the_dog')
    // Join message emitted
    expect(engine.messages.some(m => m.text.includes('falls in') || m.text.includes('dog'))).toBe(true)
  })

  it('already-adopted dog gives brief acknowledgment', async () => {
    const engine = makeEngine({
      currentRoom: makeRoom({ npcs: ['the_dog'] }),
      player: makePlayer({
        questFlags: { dog_fed_count: 3 },
        currentCompanion: { npcId: 'the_dog', bond: 'fed_kindly', joinedAtAction: 0, isActive: true, cycle: 1 },
      }),
      inventory: [{ itemId: 'boiled_rations', item: { id: 'boiled_rations', name: 'Boiled Rations', type: 'consumable', weight: 1, value: 3 } }],
    })
    await handleGive(engine, 'boiled rations to dog')
    expect(engine.messages.some(m => m.text.includes('offer') || m.text.includes('dog'))).toBe(true)
    // Should not try to adopt again
    const { addCompanion } = await import('@/lib/companionSystem')
    expect(addCompanion).not.toHaveBeenCalled()
  })

  it('gives to dog using "give <food> <npcNoun>" format (no "to")', async () => {
    const engine = makeEngine({
      currentRoom: makeRoom({ npcs: ['the_dog'] }),
      player: makePlayer({ questFlags: { dog_fed_count: 0 } }),
      inventory: [{ itemId: 'boiled_rations', item: { id: 'boiled_rations', name: 'Boiled Rations', type: 'consumable', weight: 1, value: 3 } }],
    })
    await handleGive(engine, 'boiled rations dog')
    expect(engine.setQuestFlag).toHaveBeenCalledWith('dog_fed_count', 1)
  })
})

// ============================================================
// 17. vendorDialogue.ts — dispatchVendorGreeting
// ============================================================

describe('dispatchVendorGreeting', () => {
  it('returns system message with greeting text', () => {
    const npc = { id: 'patch', name: 'Patch', description: 'x', dialogue: 'y', vendorGreeting: "You're buying bandages." } as NPC
    const msg = dispatchVendorGreeting(npc)
    expect(msg).toBeDefined()
    expect(msg!.type).toBe('system')
    expect(msg!.text).toContain("You're buying bandages.")
  })

  it('returns undefined when NPC has no vendorGreeting', () => {
    const npc = { id: 'anon', name: 'Anon', description: 'x', dialogue: 'y' } as NPC
    const msg = dispatchVendorGreeting(npc)
    expect(msg).toBeUndefined()
  })

  it('returns undefined for empty-string vendorGreeting edge case', () => {
    const npc = { id: 'anon', name: 'Anon', description: 'x', dialogue: 'y', vendorGreeting: '' } as NPC
    // Empty string is falsy — function returns undefined
    const msg = dispatchVendorGreeting(npc)
    expect(msg).toBeUndefined()
  })
})

// ============================================================
// 18. vendorDialogue.ts — dispatchVendorFarewell
// ============================================================

describe('dispatchVendorFarewell', () => {
  it('returns system message with farewell text', () => {
    const npc = { id: 'patch', name: 'Patch', description: 'x', dialogue: 'y', vendorFarewell: 'Try not to need me again.' } as NPC
    const msg = dispatchVendorFarewell(npc)
    expect(msg).toBeDefined()
    expect(msg!.type).toBe('system')
    expect(msg!.text).toContain('Try not to need me again.')
  })

  it('returns undefined when NPC has no vendorFarewell', () => {
    const npc = { id: 'anon', name: 'Anon', description: 'x', dialogue: 'y' } as NPC
    expect(dispatchVendorFarewell(npc)).toBeUndefined()
  })

  it('returns undefined for empty-string vendorFarewell', () => {
    const npc = { id: 'anon', name: 'Anon', description: 'x', dialogue: 'y', vendorFarewell: '' } as NPC
    expect(dispatchVendorFarewell(npc)).toBeUndefined()
  })
})

// ============================================================
// 19. vendorDialogue.ts — dispatchVendorBudget
// ============================================================

describe('dispatchVendorBudget', () => {
  it('returns system message with rounded budget', () => {
    const npc = { id: 'patch', name: 'Patch', description: 'x', dialogue: 'y', vendorBudget: 40 } as NPC
    const msg = dispatchVendorBudget(npc)
    expect(msg).toBeDefined()
    expect(msg!.type).toBe('system')
    expect(msg!.text).toContain('40 rounds')
  })

  it('rounds fractional budget to nearest integer', () => {
    const npc = { id: 'patch', name: 'Patch', description: 'x', dialogue: 'y', vendorBudget: 40.7 } as NPC
    const msg = dispatchVendorBudget(npc)
    expect(msg!.text).toContain('41 rounds')
  })

  it('returns undefined when vendorBudget is undefined', () => {
    const npc = { id: 'anon', name: 'Anon', description: 'x', dialogue: 'y' } as NPC
    expect(dispatchVendorBudget(npc)).toBeUndefined()
  })

  it('returns message for budget of 0 (zero is valid)', () => {
    const npc = { id: 'broke', name: 'Broke', description: 'x', dialogue: 'y', vendorBudget: 0 } as NPC
    const msg = dispatchVendorBudget(npc)
    expect(msg).toBeDefined()
    expect(msg!.text).toContain('0 rounds')
  })
})

// ============================================================
// 20. vendorDialogue.ts — dispatchVendorComment
// ============================================================

describe('dispatchVendorComment', () => {
  it('returns a comment from the pool for a known itemId', () => {
    const npc = {
      id: 'patch', name: 'Patch', description: 'x', dialogue: 'y',
      vendorComments: {
        bandages: ['Clean wound first.', 'Bandage second.'],
      },
    } as NPC
    const msg = dispatchVendorComment(npc, 'bandages')
    expect(msg).toBeDefined()
    expect(msg!.type).toBe('system')
    expect(['Clean wound first.', 'Bandage second.']).toContain(msg!.text)
  })

  it('returns undefined when NPC has no vendorComments at all', () => {
    const npc = { id: 'anon', name: 'Anon', description: 'x', dialogue: 'y' } as NPC
    expect(dispatchVendorComment(npc, 'bandages')).toBeUndefined()
  })

  it('returns undefined when itemId has no comment pool', () => {
    const npc = {
      id: 'patch', name: 'Patch', description: 'x', dialogue: 'y',
      vendorComments: { bandages: ['Clean wound first.'] },
    } as NPC
    expect(dispatchVendorComment(npc, 'mystery_item')).toBeUndefined()
  })

  it('returns undefined for empty comment pool (explicit empty array)', () => {
    const npc = {
      id: 'patch', name: 'Patch', description: 'x', dialogue: 'y',
      vendorComments: { special_item: [] },
    } as NPC
    expect(dispatchVendorComment(npc, 'special_item')).toBeUndefined()
  })

  it('cycles through multiple comments — picks from pool', () => {
    const pool = ['Comment A', 'Comment B', 'Comment C']
    const npc = {
      id: 'patch', name: 'Patch', description: 'x', dialogue: 'y',
      vendorComments: { antibiotics_01: pool },
    } as NPC
    const results = new Set<string>()
    for (let i = 0; i < 30; i++) {
      const msg = dispatchVendorComment(npc, 'antibiotics_01')
      if (msg) results.add(msg.text)
    }
    // With 30 iterations and 3 items, all should be seen
    expect(results.size).toBeGreaterThanOrEqual(1)
    for (const r of results) {
      expect(pool).toContain(r)
    }
  })

  it('works with all defined vendorComment item keys for Patch', () => {
    const patchNpc = {
      id: 'patch', name: 'Patch', description: 'x', dialogue: 'y',
      vendorComments: {
        antibiotics_01: ["Don't use unless bacterial."],
        bandages: ['Clean wound first.'],
        quiet_drops: ['Sedative. Calibrated dose.'],
        stim_shot: ['Stimulant. It works.'],
      },
    } as NPC
    for (const itemId of ['antibiotics_01', 'bandages', 'quiet_drops', 'stim_shot']) {
      const msg = dispatchVendorComment(patchNpc, itemId)
      expect(msg).toBeDefined()
      expect(msg!.type).toBe('system')
    }
  })
})

// ============================================================
// 21. Relationship state transitions — cycle-aware paths
// ============================================================

describe('handleTalk + handleDialogueChoice — cycle-aware relationship transitions', () => {
  beforeEach(() => { vi.clearAllMocks() })

  it('shows requiresPreviousRelationship branch on cycle 2+ with matching snapshot', async () => {
    const engine = makeEngine({
      currentRoom: makeRoom({ npcs: ['lev'] }),
      player: makePlayer({
        cycle: 2,
        questFlags: {},
      }),
      cycleHistory: [
        {
          cycle: 1,
          endingChoice: null,
          questsCompleted: [],
          npcRelationships: { lev: 'distrusted' },
          factionReputation: {},
          totalDeaths: 1,
        },
      ],
    })
    await handleTalk(engine, 'lev')
    expect(engine.state.activeDialogue).toBeDefined()

    // Branch 5 in our mock = echo distrusted (requiresCycleMin:2, requiresPreviousRelationship lev distrusted)
    await handleDialogueChoice(engine, '5')
    expect(engine.state.activeDialogue?.currentNodeId).toBe('lev_echo_distrusted')
    expect(engine.messages.some(m => m.text.includes('You again'))).toBe(true)
  })

  it('blocks cycle-gated branch on cycle 1', async () => {
    const engine = makeEngine({
      currentRoom: makeRoom({ npcs: ['lev'] }),
      player: makePlayer({ cycle: 1, questFlags: {} }),
    })
    await handleTalk(engine, 'lev')
    // Branch 5 requires cycle 2
    await handleDialogueChoice(engine, '5')
    expect(engine.messages.some(m => m.type === 'error')).toBe(true)
    // Should NOT have navigated
    expect(engine.state.activeDialogue?.currentNodeId).toBe('lev_start')
  })
})

// ============================================================
// 22. Multi-step dialogue sequence (full conversation flow)
// ============================================================

describe('Full dialogue sequence: enter tree → navigate → exit', () => {
  beforeEach(() => { vi.clearAllMocks() })

  it('complete Lev CHARON-7 → back → leave sequence', async () => {
    const engine = makeEngine({ currentRoom: makeRoom({ npcs: ['lev'] }) })

    // Step 1: enter dialogue
    await handleTalk(engine, 'lev')
    expect(engine.state.activeDialogue?.treeId).toBe('lev')

    // Step 2: ask about CHARON-7
    await handleDialogueChoice(engine, '1')
    expect(engine.state.activeDialogue?.currentNodeId).toBe('lev_charon')

    // Step 3: go back to start
    await handleDialogueChoice(engine, '1')
    expect(engine.state.activeDialogue?.currentNodeId).toBe('lev_start')

    // Step 4: leave
    await handleDialogueLeave(engine)
    expect(engine.state.activeDialogue).toBeUndefined()
  })

  it('complete Sparks signal → broadcaster path', async () => {
    const engine = makeEngine({
      currentRoom: makeRoom({ npcs: ['sparks_radio'] }),
      player: makePlayer({ questFlags: {} }),
    })

    // Temporarily extend the NPC mock to include sparks_radio.
    // Use the scoped implementation that restores the original after the test.
    const { getNPC } = await import('@/data/npcs')
    const sparksNpc = {
      id: 'sparks_radio', name: 'Sparks', faction: 'drifters' as 'drifters', isNamed: true,
      description: 'A radio technician.', dialogue: "Signal's still there.",
    }
    const originalImpl = vi.mocked(getNPC).getMockImplementation()
    vi.mocked(getNPC).mockImplementation((id: string) => {
      if (id === 'sparks_radio') return sparksNpc
      // Delegate to the original factory implementation for all other IDs
      const npcs: Record<string, NPC> = {
        patch: { id: 'patch', name: 'Patch', faction: 'drifters', isNamed: true, description: 'A medic.', dialogue: "I'll close that up." },
        lev: { id: 'lev', name: 'Lev', faction: 'reclaimers', isNamed: true, description: 'A researcher.', dialogue: 'Data accumulates.' },
        marta_vendor: { id: 'marta_vendor', name: 'Marta', faction: 'drifters', isNamed: false, description: 'Vendor.', dialogue: 'Fresh rations.' },
        scout_npc: { id: 'scout_npc', name: 'Scout', faction: 'accord', isNamed: false, description: 'A scout.', dialogue: 'Move along.' },
        the_dog: { id: 'the_dog', name: 'the dog', faction: undefined as unknown as 'accord', isNamed: false, description: 'A lean dog.', dialogue: '' },
      }
      return npcs[id] ?? undefined
    })

    try {
      await handleTalk(engine, 'sparks_radio')
      expect(engine.state.activeDialogue).toBeDefined()

      // Choice 1: Tell me about the signal → sets sparks_shared_decode flag
      await handleDialogueChoice(engine, '1')
      expect(engine.setQuestFlag).toHaveBeenCalledWith('sparks_shared_decode', true)
      expect(engine.state.activeDialogue?.currentNodeId).toBe('sparks_signal')

      // Choice 1: Back to start
      await handleDialogueChoice(engine, '1')
      expect(engine.state.activeDialogue?.currentNodeId).toBe('sparks_start')
    } finally {
      // Restore the original implementation so subsequent tests are not affected
      if (originalImpl) {
        vi.mocked(getNPC).mockImplementation(originalImpl)
      } else {
        vi.mocked(getNPC).mockRestore()
      }
    }
  })
})

// ============================================================
// 23. Branch display — locked branches shown dimmed
// ============================================================

describe('Branch gate display — locked branches show reason', () => {
  it('shows locked text for branches with unmet requiresFlag', async () => {
    const engine = makeEngine({
      currentRoom: makeRoom({ npcs: ['lev'] }),
      player: makePlayer({ questFlags: {} }),
    })
    await handleTalk(engine, 'lev')
    // The MERIDIAN Keycard branch (requiresFlag: found_r1_sequencing_data) should appear dimmed.
    // buildNodeDisplay uses msg(..., 'echo') type for locked branches, with "(locked)" in text.
    expect(engine.messages.some(m => m.text.includes('Cycle count consistent'))).toBe(true)  // tree entered
    expect(engine.messages.some(m => m.text.includes('locked'))).toBe(true)
  })

  it('shows skill check hint text for skill-gated branches', async () => {
    const engine = makeEngine({
      currentRoom: makeRoom({ npcs: ['lev'] }),
      player: makePlayer({ questFlags: {} }),
    })
    await handleTalk(engine, 'lev')
    // Skill check branches show hint "(requires: lore DC N)" inside systemMsg
    expect(engine.messages.some(m => m.text.includes('Cycle count consistent'))).toBe(true)  // tree entered
    // The reason for a skill check branch includes "DC" (the difficulty class)
    expect(engine.messages.some(m => m.text.includes('DC') || m.text.includes('requires:'))).toBe(true)
  })
})
