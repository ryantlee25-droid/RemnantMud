// ============================================================
// H14 — Lev + Howard + Sparks hollow-kills reactivity dialogue tests
// Verifies that the 3 tier nodes per NPC are gated correctly
// on hollow_kills_tier_1/2/3 quest flags.
//
// Engine behavior:
//   - Passable branches → systemMsg (type 'system')
//   - Locked/gated branches → msg(..., 'echo')
// ============================================================

import { describe, it, expect, vi, beforeEach } from 'vitest'
import type { GameState, Player, Room, GameMessage } from '@/types/game'
import type { EngineCore } from '@/lib/actions/types'

// ------------------------------------------------------------
// Mock external modules before importing handlers
// ------------------------------------------------------------

vi.mock('@/data/npcs', () => ({
  getNPC: vi.fn((id: string) => {
    const npcs: Record<string, object> = {
      lev: {
        id: 'lev', name: 'Lev', description: 'Reclaimers researcher.',
        dialogue: 'You\'re back.', faction: 'reclaimers', isNamed: true,
      },
      howard_bridge_keeper: {
        id: 'howard_bridge_keeper', name: 'Howard', description: 'Bridge keeper.',
        dialogue: 'Five rounds.', faction: 'drifters', isNamed: true,
      },
      sparks_radio: {
        id: 'sparks_radio', name: 'Sparks', description: 'Radio technician.',
        dialogue: 'Signal\'s still there.', faction: 'drifters', isNamed: true,
      },
    }
    return npcs[id] ?? undefined
  }),
  getRevenantDialogue: vi.fn(() => null),
}))

vi.mock('@/data/dialogueTrees', () => {
  // ---- Lev minimal subtree ----
  // Branches: t3(locked), t2(locked), t1(locked/passable), leave
  const levTree = {
    npcId: 'lev',
    startNode: 'lev_start',
    nodes: {
      lev_start: {
        id: 'lev_start',
        speaker: 'Lev',
        text: 'You\'re back. Cycle count consistent with projections.',
        branches: [
          // index 0 — t3 gate
          {
            label: '"Tell me about your survival projections."',
            targetNode: 'lev_hollow_t3',
            requiresFlag: 'hollow_kills_tier_3',
          },
          // index 1 — t2 gate
          {
            label: '"Tell me about your survival projections."',
            targetNode: 'lev_hollow_t2',
            requiresFlag: 'hollow_kills_tier_2',
          },
          // index 2 — t1 gate
          {
            label: '"Tell me about your survival projections."',
            targetNode: 'lev_hollow_t1',
            requiresFlag: 'hollow_kills_tier_1',
          },
          // index 3 — always passable
          {
            label: '"I should go."',
            targetNode: 'lev_leave',
          },
        ],
      },
      lev_hollow_t1: {
        id: 'lev_hollow_t1',
        speaker: 'Lev',
        text: "Cycle N, [K] Hollow eliminated. You're trending above the mortality curve.",
        branches: [{ label: '"Just doing what needs doing."', targetNode: 'lev_leave' }],
      },
      lev_hollow_t2: {
        id: 'lev_hollow_t2',
        speaker: 'Lev',
        text: "You're becoming a data point. I mean that as a compliment.",
        branches: [{ label: '"Glad to be a useful data point."', targetNode: 'lev_leave' }],
      },
      lev_hollow_t3: {
        id: 'lev_hollow_t3',
        speaker: 'Lev',
        text: "The data is clear. You're going to die in the field. I'd rather it happened later. So would you, presumably.",
        branches: [{ label: '"I\'ll try."', targetNode: 'lev_leave' }],
      },
      lev_leave: {
        id: 'lev_leave',
        speaker: 'Lev',
        text: 'I have work to do.',
      },
    },
  }

  // ---- Howard minimal subtree ----
  // Branches: road_ahead, negotiate, t3(locked), t2(locked), t1(locked/passable)
  const howardTree = {
    npcId: 'howard_bridge_keeper',
    startNode: 'howard_start',
    nodes: {
      howard_start: {
        id: 'howard_start',
        speaker: 'Howard',
        text: 'Crossing\'s five rounds. What do you need?',
        branches: [
          // index 0 — always passable
          {
            label: 'What should I know about the road ahead?',
            targetNode: 'howard_closure',
          },
          // index 1 — skill check (treated as passable in tests)
          {
            label: '[Negotiation DC 10] Can we work out a discount on the crossing fee?',
            targetNode: 'howard_closure',
          },
          // index 2 — t3 gate
          {
            label: '"The Hollow out there. I\'ve been dealing with them."',
            targetNode: 'howard_hollow_t3',
            requiresFlag: 'hollow_kills_tier_3',
          },
          // index 3 — t2 gate
          {
            label: '"The Hollow out there. I\'ve been dealing with them."',
            targetNode: 'howard_hollow_t2',
            requiresFlag: 'hollow_kills_tier_2',
          },
          // index 4 — t1 gate
          {
            label: '"The Hollow out there. I\'ve been dealing with them."',
            targetNode: 'howard_hollow_t1',
            requiresFlag: 'hollow_kills_tier_1',
          },
        ],
      },
      howard_hollow_t1: {
        id: 'howard_hollow_t1',
        speaker: 'Howard',
        text: "Good. Every one you put down is one less I need a plan for.",
        branches: [{ label: '"I\'ll keep at it."', targetNode: 'howard_closure' }],
      },
      howard_hollow_t2: {
        id: 'howard_hollow_t2',
        speaker: 'Howard',
        text: "You keep this up, the Hollow pressure on Duskhollow drops. That matters.",
        branches: [{ label: '"Happy to hear it\'s helping."', targetNode: 'howard_closure' }],
      },
      howard_hollow_t3: {
        id: 'howard_hollow_t3',
        speaker: 'Howard',
        text: "Don't come to me expecting gratitude. This is what the job looks like.",
        branches: [{ label: '"I know."', targetNode: 'howard_closure' }],
      },
      howard_closure: {
        id: 'howard_closure',
        speaker: 'Howard',
        text: 'Be careful north of the fork.',
      },
    },
  }

  // ---- Sparks minimal subtree ----
  // Branches: signal, broadcaster(flagged), equipment, t3(locked), t2(locked), t1(locked/passable), leave
  const sparksTree = {
    npcId: 'sparks_radio',
    startNode: 'sparks_start',
    nodes: {
      sparks_start: {
        id: 'sparks_start',
        speaker: 'Sparks',
        text: 'Signal\'s still there. Every day. Same twelve words.',
        branches: [
          // index 0 — always passable
          {
            label: '"Tell me about the signal."',
            targetNode: 'sparks_leave',
          },
          // index 1 — t3 gate
          {
            label: '"You wanted to ask about something."',
            targetNode: 'sparks_hollow_t3',
            requiresFlag: 'hollow_kills_tier_3',
          },
          // index 2 — t2 gate
          {
            label: '"You wanted to ask about something."',
            targetNode: 'sparks_hollow_t2',
            requiresFlag: 'hollow_kills_tier_2',
          },
          // index 3 — t1 gate
          {
            label: '"You wanted to ask about something."',
            targetNode: 'sparks_hollow_t1',
            requiresFlag: 'hollow_kills_tier_1',
          },
          // index 4 — always passable
          {
            label: '"I\'ll let you work."',
            targetNode: 'sparks_leave',
          },
        ],
      },
      sparks_hollow_t1: {
        id: 'sparks_hollow_t1',
        speaker: 'Sparks',
        text: "You smell like you've been busy. How many?",
        branches: [{ label: '"A few. Hollow, outside the wire."', targetNode: 'sparks_leave' }],
      },
      sparks_hollow_t2: {
        id: 'sparks_hollow_t2',
        speaker: 'Sparks',
        text: "Do you enjoy it? You can tell me. I won't judge. I am genuinely asking.",
        branches: [{ label: '"Sometimes. Is that wrong?"', targetNode: 'sparks_leave' }],
      },
      sparks_hollow_t3: {
        id: 'sparks_hollow_t3',
        speaker: 'Sparks',
        text: "Most people who kill at your rate either stop entirely or can't stop at all. Which one are you?",
        branches: [{ label: '"I can stop. I choose not to."', targetNode: 'sparks_leave' }],
      },
      sparks_leave: {
        id: 'sparks_leave',
        speaker: 'Sparks',
        text: 'She is already back to her equipment.',
      },
    },
  }

  return {
    DIALOGUE_TREES: {
      // Room-level tree keys (production)
      lev_entry_hall: levTree,
      lev_office_quest: levTree,
      cv_howard_bridge_keeper: howardTree,
      cr_sparks_intro: sparksTree,
      // Fallback keys (npcId — used when population.dialogueTree is absent, as in tests)
      lev: levTree,
      howard_bridge_keeper: howardTree,
      sparks_radio: sparksTree,
    } as Record<string, unknown>,
  }
})

vi.mock('@/data/npcTopics', () => ({
  findNpcTopic: vi.fn(() => null),
  getVisibleTopics: vi.fn(() => []),
  NPC_TOPICS: {} as Record<string, unknown[]>,
}))

vi.mock('@/data/items', () => ({
  getItem: vi.fn(() => undefined),
}))

vi.mock('@/lib/world', () => ({
  updateRoomFlags: vi.fn().mockResolvedValue(undefined),
}))

vi.mock('@/lib/skillBonus', () => ({
  getClassSkillBonus: vi.fn(() => 0),
  getStatForSkill: vi.fn((_skill: string, player: Player | null) => {
    if (!player) return null
    return player.wits ?? 5
  }),
  getStatNameForSkill: vi.fn(() => 'wits'),
}))

vi.mock('@/lib/dice', () => ({
  rollCheck: vi.fn(() => ({
    roll: 10, modifier: 0, total: 10, dc: 8, success: true, critical: false, fumble: false,
  })),
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

function makeRoom(npcId: string): Room {
  return {
    id: 'room_1', name: 'Test Room', description: 'A test room.',
    shortDescription: 'Test.', zone: 'crossroads', difficulty: 1,
    visited: false, flags: {}, exits: {}, items: [], enemies: [], npcs: [npcId],
  }
}

function makeEngine(player: Player, npcId: string): EngineCore & { messages: GameMessage[]; state: GameState } {
  const fullState: GameState = {
    player,
    currentRoom: makeRoom(npcId),
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
  }

  const messages: GameMessage[] = []

  return {
    messages,
    state: fullState,
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

import { handleTalk, handleDialogueChoice } from '@/lib/actions/social'

// Helper: check if a branch label appears as passable (system msg) or locked (echo msg)
function branchIsPassable(messages: GameMessage[], branchLabel: string): boolean {
  return messages.some(m => m.type === 'system' && m.text.includes(branchLabel))
}

function branchIsLocked(messages: GameMessage[], branchLabel: string): boolean {
  return messages.some(m => m.type === 'echo' && m.text.includes(branchLabel))
}

// ------------------------------------------------------------
// Tests: Lev hollow-kills reactivity
// ------------------------------------------------------------

describe('Lev — hollow-kills reactivity dialogue (H14)', () => {
  beforeEach(() => { vi.clearAllMocks() })

  it('lev_start shows hollow_t1 branch locked when no tier flags set', async () => {
    const player = makePlayer({ questFlags: {} })
    const engine = makeEngine(player, 'lev')
    await handleTalk(engine, 'lev')
    expect(branchIsLocked(engine.messages, '"Tell me about your survival projections."')).toBe(true)
    expect(branchIsPassable(engine.messages, '"Tell me about your survival projections."')).toBe(false)
  })

  it('lev_start shows hollow_t1 branch passable when tier_1 flag is set', async () => {
    const player = makePlayer({ questFlags: { hollow_kills_tier_1: true } })
    const engine = makeEngine(player, 'lev')
    await handleTalk(engine, 'lev')
    expect(branchIsPassable(engine.messages, '"Tell me about your survival projections."')).toBe(true)
    expect(engine.state.activeDialogue?.currentNodeId).toBe('lev_start')
  })

  it('navigates to lev_hollow_t1 and shows verbatim opener text', async () => {
    const player = makePlayer({ questFlags: { hollow_kills_tier_1: true } })
    const engine = makeEngine(player, 'lev')
    await handleTalk(engine, 'lev')
    // Branch layout: [0]=t3(locked), [1]=t2(locked), [2]=t1(passable), [3]=leave
    // handleDialogueChoice uses 1-based index
    await handleDialogueChoice(engine, '3')
    expect(engine.state.activeDialogue?.currentNodeId).toBe('lev_hollow_t1')
    const hasText = engine.messages.some(m => m.text.includes('trending above the mortality curve'))
    expect(hasText).toBe(true)
  })

  it('navigates to lev_hollow_t2 and shows verbatim opener text', async () => {
    const player = makePlayer({ questFlags: { hollow_kills_tier_1: true, hollow_kills_tier_2: true } })
    const engine = makeEngine(player, 'lev')
    await handleTalk(engine, 'lev')
    // Branch index 1 (0-based) = choice 2
    await handleDialogueChoice(engine, '2')
    expect(engine.state.activeDialogue?.currentNodeId).toBe('lev_hollow_t2')
    const hasText = engine.messages.some(m => m.text.includes('becoming a data point'))
    expect(hasText).toBe(true)
  })

  it('navigates to lev_hollow_t3 and shows verbatim opener text', async () => {
    const player = makePlayer({
      questFlags: {
        hollow_kills_tier_1: true,
        hollow_kills_tier_2: true,
        hollow_kills_tier_3: true,
      },
    })
    const engine = makeEngine(player, 'lev')
    await handleTalk(engine, 'lev')
    // Branch index 0 (0-based) = choice 1
    await handleDialogueChoice(engine, '1')
    expect(engine.state.activeDialogue?.currentNodeId).toBe('lev_hollow_t3')
    const hasText = engine.messages.some(m => m.text.includes("going to die in the field"))
    expect(hasText).toBe(true)
  })
})

// ------------------------------------------------------------
// Tests: Howard hollow-kills reactivity
// ------------------------------------------------------------

describe('Howard — hollow-kills reactivity dialogue (H14)', () => {
  beforeEach(() => { vi.clearAllMocks() })

  it('howard_start shows hollow_t1 branch locked when no tier flags set', async () => {
    const player = makePlayer({ questFlags: {} })
    const engine = makeEngine(player, 'howard_bridge_keeper')
    await handleTalk(engine, 'howard')
    expect(branchIsLocked(engine.messages, '"The Hollow out there. I\'ve been dealing with them."')).toBe(true)
    expect(branchIsPassable(engine.messages, '"The Hollow out there. I\'ve been dealing with them."')).toBe(false)
  })

  it('howard_start shows hollow_t1 branch passable when tier_1 flag is set', async () => {
    const player = makePlayer({ questFlags: { hollow_kills_tier_1: true } })
    const engine = makeEngine(player, 'howard_bridge_keeper')
    await handleTalk(engine, 'howard')
    expect(branchIsPassable(engine.messages, '"The Hollow out there. I\'ve been dealing with them."')).toBe(true)
    expect(engine.state.activeDialogue?.currentNodeId).toBe('howard_start')
  })

  it('navigates to howard_hollow_t1 and shows verbatim opener text', async () => {
    const player = makePlayer({ questFlags: { hollow_kills_tier_1: true } })
    const engine = makeEngine(player, 'howard_bridge_keeper')
    await handleTalk(engine, 'howard')
    // Branch layout: [0]=road_ahead, [1]=negotiate, [2]=t3(locked), [3]=t2(locked), [4]=t1(passable)
    // handleDialogueChoice 1-based: choice 5
    await handleDialogueChoice(engine, '5')
    expect(engine.state.activeDialogue?.currentNodeId).toBe('howard_hollow_t1')
    const hasText = engine.messages.some(m => m.text.includes('one less I need a plan for'))
    expect(hasText).toBe(true)
  })

  it('navigates to howard_hollow_t2 and shows verbatim opener text', async () => {
    const player = makePlayer({ questFlags: { hollow_kills_tier_1: true, hollow_kills_tier_2: true } })
    const engine = makeEngine(player, 'howard_bridge_keeper')
    await handleTalk(engine, 'howard')
    // Branch index 3 (0-based) = choice 4
    await handleDialogueChoice(engine, '4')
    expect(engine.state.activeDialogue?.currentNodeId).toBe('howard_hollow_t2')
    const hasText = engine.messages.some(m => m.text.includes('Hollow pressure on Duskhollow drops'))
    expect(hasText).toBe(true)
  })

  it('navigates to howard_hollow_t3 and shows verbatim opener text', async () => {
    const player = makePlayer({
      questFlags: {
        hollow_kills_tier_1: true,
        hollow_kills_tier_2: true,
        hollow_kills_tier_3: true,
      },
    })
    const engine = makeEngine(player, 'howard_bridge_keeper')
    await handleTalk(engine, 'howard')
    // Branch index 2 (0-based) = choice 3
    await handleDialogueChoice(engine, '3')
    expect(engine.state.activeDialogue?.currentNodeId).toBe('howard_hollow_t3')
    const hasText = engine.messages.some(m => m.text.includes("expecting gratitude"))
    expect(hasText).toBe(true)
  })
})

// ------------------------------------------------------------
// Tests: Sparks hollow-kills reactivity
// ------------------------------------------------------------

describe('Sparks — hollow-kills reactivity dialogue (H14)', () => {
  beforeEach(() => { vi.clearAllMocks() })

  it('sparks_start shows hollow_t1 branch locked when no tier flags set', async () => {
    const player = makePlayer({ questFlags: {} })
    const engine = makeEngine(player, 'sparks_radio')
    await handleTalk(engine, 'sparks')
    expect(branchIsLocked(engine.messages, '"You wanted to ask about something."')).toBe(true)
    expect(branchIsPassable(engine.messages, '"You wanted to ask about something."')).toBe(false)
  })

  it('sparks_start shows hollow_t1 branch passable when tier_1 flag is set', async () => {
    const player = makePlayer({ questFlags: { hollow_kills_tier_1: true } })
    const engine = makeEngine(player, 'sparks_radio')
    await handleTalk(engine, 'sparks')
    expect(branchIsPassable(engine.messages, '"You wanted to ask about something."')).toBe(true)
    expect(engine.state.activeDialogue?.currentNodeId).toBe('sparks_start')
  })

  it('navigates to sparks_hollow_t1 and shows verbatim opener text', async () => {
    const player = makePlayer({ questFlags: { hollow_kills_tier_1: true } })
    const engine = makeEngine(player, 'sparks_radio')
    await handleTalk(engine, 'sparks')
    // Branch layout: [0]=signal, [1]=t3(locked), [2]=t2(locked), [3]=t1(passable), [4]=leave
    // Choice 4 (1-based)
    await handleDialogueChoice(engine, '4')
    expect(engine.state.activeDialogue?.currentNodeId).toBe('sparks_hollow_t1')
    const hasText = engine.messages.some(m => m.text.includes("smell like you've been busy"))
    expect(hasText).toBe(true)
  })

  it('navigates to sparks_hollow_t2 and shows verbatim opener text', async () => {
    const player = makePlayer({ questFlags: { hollow_kills_tier_1: true, hollow_kills_tier_2: true } })
    const engine = makeEngine(player, 'sparks_radio')
    await handleTalk(engine, 'sparks')
    // Branch index 2 (0-based) = choice 3
    await handleDialogueChoice(engine, '3')
    expect(engine.state.activeDialogue?.currentNodeId).toBe('sparks_hollow_t2')
    const hasText = engine.messages.some(m => m.text.includes('Do you enjoy it'))
    expect(hasText).toBe(true)
  })

  it('navigates to sparks_hollow_t3 and shows verbatim opener text', async () => {
    const player = makePlayer({
      questFlags: {
        hollow_kills_tier_1: true,
        hollow_kills_tier_2: true,
        hollow_kills_tier_3: true,
      },
    })
    const engine = makeEngine(player, 'sparks_radio')
    await handleTalk(engine, 'sparks')
    // Branch index 1 (0-based) = choice 2
    await handleDialogueChoice(engine, '2')
    expect(engine.state.activeDialogue?.currentNodeId).toBe('sparks_hollow_t3')
    const hasText = engine.messages.some(m => m.text.includes("stop entirely or can't stop at all"))
    expect(hasText).toBe(true)
  })
})
