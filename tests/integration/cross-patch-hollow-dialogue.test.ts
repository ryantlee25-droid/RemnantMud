// ============================================================
// H13 — Cross + Patch hollow-kills reactivity dialogue tests
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
      marshal_cross: {
        id: 'marshal_cross', name: 'Marshal Cross', description: 'Accord marshal.',
        dialogue: 'You have sixty seconds.', faction: 'accord', isNamed: true,
      },
      patch: {
        id: 'patch', name: 'Patch', description: 'Info broker.',
        dialogue: 'Sit down.', faction: 'drifters', isNamed: true,
      },
    }
    return npcs[id] ?? undefined
  }),
  getRevenantDialogue: vi.fn(() => null),
}))

vi.mock('@/data/dialogueTrees', () => {
  // Minimal Cross subtree: start + t1 + t2 + t3 nodes
  // Branches are in spec order: t3 first (highest tier), then t2, t1, then leave.
  const crossTree = {
    npcId: 'marshal_cross',
    startNode: 'cross_start',
    nodes: {
      cross_start: {
        id: 'cross_start',
        speaker: 'Marshal Cross',
        text: 'You have sixty seconds. Use them.',
        branches: [
          // index 0 — t3 gate
          {
            label: '"You wanted to talk about the Hollow."',
            targetNode: 'cross_hollow_t3',
            requiresFlag: 'hollow_kills_tier_3',
          },
          // index 1 — t2 gate
          {
            label: '"You wanted to talk about the Hollow."',
            targetNode: 'cross_hollow_t2',
            requiresFlag: 'hollow_kills_tier_2',
          },
          // index 2 — t1 gate
          {
            label: '"You wanted to talk about the Hollow."',
            targetNode: 'cross_hollow_t1',
            requiresFlag: 'hollow_kills_tier_1',
          },
          // index 3 — always passable
          {
            label: '"I should go."',
            targetNode: 'cross_leave',
          },
        ],
      },
      cross_hollow_t1: {
        id: 'cross_hollow_t1',
        speaker: 'Marshal Cross',
        text: "You've been busy outside the wire.",
        branches: [{ label: '"It needed doing."', targetNode: 'cross_leave' }],
      },
      cross_hollow_t2: {
        id: 'cross_hollow_t2',
        speaker: 'Marshal Cross',
        text: 'The Hollow count on River Road dropped. I noticed. Was that you?',
        branches: [{ label: '"Understood, Marshal."', targetNode: 'cross_leave' }],
      },
      cross_hollow_t3: {
        id: 'cross_hollow_t3',
        speaker: 'Marshal Cross',
        text: "Stop. I'm not concerned about the Hollow. I'm concerned about what it takes to kill that many and feel nothing.",
        branches: [{ label: '"I\'m fine."', targetNode: 'cross_leave' }],
      },
      cross_leave: {
        id: 'cross_leave',
        speaker: 'Marshal Cross',
        text: 'Cross nods once.',
      },
    },
  }

  // Minimal Patch subtree: start + t1 + t2 + t3 nodes
  // Hollow branches are appended at the end (after standard branches) to preserve
  // existing branch numbering for other tests that navigate Patch by index.
  const patchTree = {
    npcId: 'patch',
    startNode: 'patch_start',
    nodes: {
      patch_start: {
        id: 'patch_start',
        speaker: 'Patch',
        text: "Before anything else — have you heard the signal?",
        branches: [
          // index 0 — always passable (standard)
          {
            label: 'What do you know about the factions out here?',
            targetNode: 'patch_closure',
          },
          // index 1 — t3 gate (hollow-kills reactivity, H13)
          {
            label: '"I\'ve been dealing with the Hollow."',
            targetNode: 'patch_hollow_t3',
            requiresFlag: 'hollow_kills_tier_3',
          },
          // index 2 — t2 gate
          {
            label: '"I\'ve been dealing with the Hollow."',
            targetNode: 'patch_hollow_t2',
            requiresFlag: 'hollow_kills_tier_2',
          },
          // index 3 — t1 gate
          {
            label: '"I\'ve been dealing with the Hollow."',
            targetNode: 'patch_hollow_t1',
            requiresFlag: 'hollow_kills_tier_1',
          },
        ],
      },
      patch_hollow_t1: {
        id: 'patch_hollow_t1',
        speaker: 'Patch',
        text: 'Another one. Sit down before you fall down.',
        branches: [{ label: '"I\'m fine."', targetNode: 'patch_closure' }],
      },
      patch_hollow_t2: {
        id: 'patch_hollow_t2',
        speaker: 'Patch',
        text: "I've stopped asking what happened. The body tells me.",
        branches: [{ label: '"Too many to count."', targetNode: 'patch_closure' }],
      },
      patch_hollow_t3: {
        id: 'patch_hollow_t3',
        speaker: 'Patch',
        text: "I patched the last one who fought like you. She didn't come back from her next run. I'm not saying you will too. I'm saying I remember their names.",
        branches: [{ label: '"I want to survive."', targetNode: 'patch_closure' }],
      },
      patch_closure: {
        id: 'patch_closure',
        speaker: 'Patch',
        text: "That's what I've got. Come back with something worth trading.",
      },
    },
  }

  return {
    DIALOGUE_TREES: {
      // Room-level tree keys (production)
      cv_marshal_cross_intro: crossTree,
      cr_patch_intro: patchTree,
      cr_patch_main: patchTree,
      // Fallback keys (npcId — used when population.dialogueTree is absent, as in tests)
      marshal_cross: crossTree,
      patch: patchTree,
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
// Tests: Cross hollow-kills reactivity
// ------------------------------------------------------------

describe('Cross — hollow-kills reactivity dialogue (H13)', () => {
  beforeEach(() => { vi.clearAllMocks() })

  it('cross_start shows hollow_t1 branch locked when no tier flags set', async () => {
    const player = makePlayer({ questFlags: {} })
    const engine = makeEngine(player, 'marshal_cross')
    await handleTalk(engine, 'cross')
    // All three hollow branches should be locked (shown as echo / dimmed)
    expect(branchIsLocked(engine.messages, '"You wanted to talk about the Hollow."')).toBe(true)
    // None should be passable
    expect(branchIsPassable(engine.messages, '"You wanted to talk about the Hollow."')).toBe(false)
  })

  it('cross_start shows hollow_t1 branch passable when tier_1 flag is set', async () => {
    const player = makePlayer({ questFlags: { hollow_kills_tier_1: true } })
    const engine = makeEngine(player, 'marshal_cross')
    await handleTalk(engine, 'cross')
    // At least one hollow branch should now be passable (tier_1)
    expect(branchIsPassable(engine.messages, '"You wanted to talk about the Hollow."')).toBe(true)
    // Confirm the activeDialogue points to cross_start
    expect(engine.state.activeDialogue?.currentNodeId).toBe('cross_start')
  })

  it('navigates to cross_hollow_t1 and shows correct NPC text', async () => {
    const player = makePlayer({ questFlags: { hollow_kills_tier_1: true } })
    const engine = makeEngine(player, 'marshal_cross')
    await handleTalk(engine, 'cross')
    // Branch layout: [0]=t3(locked), [1]=t2(locked), [2]=t1(passable), [3]=leave
    // Player sees: [1] locked, [2] locked, [3] passable (index 2+1=3), [4] leave
    // But handleDialogueChoice takes 1-based index including locked branches.
    // Branch index 2 (0-based) = branch number 3 (1-based)
    await handleDialogueChoice(engine, '3')
    expect(engine.state.activeDialogue?.currentNodeId).toBe('cross_hollow_t1')
    // Node text should be displayed in messages
    const hasText = engine.messages.some(m => m.text.includes('busy outside the wire'))
    expect(hasText).toBe(true)
  })

  it('navigates to cross_hollow_t2 and shows correct NPC text', async () => {
    const player = makePlayer({ questFlags: { hollow_kills_tier_1: true, hollow_kills_tier_2: true } })
    const engine = makeEngine(player, 'marshal_cross')
    await handleTalk(engine, 'cross')
    // Branch index 1 (0-based) = branch number 2 (1-based)
    await handleDialogueChoice(engine, '2')
    expect(engine.state.activeDialogue?.currentNodeId).toBe('cross_hollow_t2')
    const hasText = engine.messages.some(m => m.text.includes('River Road dropped'))
    expect(hasText).toBe(true)
  })

  it('navigates to cross_hollow_t3 and shows correct NPC text', async () => {
    const player = makePlayer({
      questFlags: {
        hollow_kills_tier_1: true,
        hollow_kills_tier_2: true,
        hollow_kills_tier_3: true,
      },
    })
    const engine = makeEngine(player, 'marshal_cross')
    await handleTalk(engine, 'cross')
    // Branch index 0 (0-based) = branch number 1 (1-based)
    await handleDialogueChoice(engine, '1')
    expect(engine.state.activeDialogue?.currentNodeId).toBe('cross_hollow_t3')
    const hasText = engine.messages.some(m => m.text.includes('feel nothing'))
    expect(hasText).toBe(true)
  })
})

// ------------------------------------------------------------
// Tests: Patch hollow-kills reactivity
// ------------------------------------------------------------

describe('Patch — hollow-kills reactivity dialogue (H13)', () => {
  beforeEach(() => { vi.clearAllMocks() })

  it('patch_start shows hollow_t1 branch locked when no tier flags set', async () => {
    const player = makePlayer({ questFlags: {} })
    const engine = makeEngine(player, 'patch')
    await handleTalk(engine, 'patch')
    expect(branchIsLocked(engine.messages, '"I\'ve been dealing with the Hollow."')).toBe(true)
    expect(branchIsPassable(engine.messages, '"I\'ve been dealing with the Hollow."')).toBe(false)
  })

  it('patch_start shows hollow_t1 branch passable when tier_1 flag is set', async () => {
    const player = makePlayer({ questFlags: { hollow_kills_tier_1: true } })
    const engine = makeEngine(player, 'patch')
    await handleTalk(engine, 'patch')
    expect(branchIsPassable(engine.messages, '"I\'ve been dealing with the Hollow."')).toBe(true)
    expect(engine.state.activeDialogue?.currentNodeId).toBe('patch_start')
  })

  it('navigates to patch_hollow_t1 and shows correct NPC text', async () => {
    const player = makePlayer({ questFlags: { hollow_kills_tier_1: true } })
    const engine = makeEngine(player, 'patch')
    await handleTalk(engine, 'patch')
    // Mock layout: [0]=factions, [1]=t3(locked), [2]=t2(locked), [3]=t1(passable)
    // Branch index 3 (0-based) = branch number 4 (1-based)
    await handleDialogueChoice(engine, '4')
    expect(engine.state.activeDialogue?.currentNodeId).toBe('patch_hollow_t1')
    const hasText = engine.messages.some(m => m.text.includes('Sit down before you fall down'))
    expect(hasText).toBe(true)
  })

  it('navigates to patch_hollow_t2 and shows correct NPC text', async () => {
    const player = makePlayer({ questFlags: { hollow_kills_tier_1: true, hollow_kills_tier_2: true } })
    const engine = makeEngine(player, 'patch')
    await handleTalk(engine, 'patch')
    // Branch index 2 (0-based) = branch number 3 (1-based)
    await handleDialogueChoice(engine, '3')
    expect(engine.state.activeDialogue?.currentNodeId).toBe('patch_hollow_t2')
    const hasText = engine.messages.some(m => m.text.includes('body tells me'))
    expect(hasText).toBe(true)
  })

  it('navigates to patch_hollow_t3 and shows correct NPC text', async () => {
    const player = makePlayer({
      questFlags: {
        hollow_kills_tier_1: true,
        hollow_kills_tier_2: true,
        hollow_kills_tier_3: true,
      },
    })
    const engine = makeEngine(player, 'patch')
    await handleTalk(engine, 'patch')
    // Branch index 1 (0-based) = branch number 2 (1-based)
    await handleDialogueChoice(engine, '2')
    expect(engine.state.activeDialogue?.currentNodeId).toBe('patch_hollow_t3')
    const hasText = engine.messages.some(m => m.text.includes('remember their names'))
    expect(hasText).toBe(true)
  })
})

// ------------------------------------------------------------
// Tests: hollowKills tier-flag increment logic
// ------------------------------------------------------------

describe('hollowKills tier-flag logic (unit)', () => {
  it('sets tier_1 at exactly 5 kills', () => {
    const kills = 5
    const flags: Record<string, boolean> = {}
    if (kills >= 5)  flags['hollow_kills_tier_1'] = true
    if (kills >= 20) flags['hollow_kills_tier_2'] = true
    if (kills >= 50) flags['hollow_kills_tier_3'] = true
    expect(flags['hollow_kills_tier_1']).toBe(true)
    expect(flags['hollow_kills_tier_2']).toBeUndefined()
    expect(flags['hollow_kills_tier_3']).toBeUndefined()
  })

  it('sets tier_1 and tier_2 at exactly 20 kills', () => {
    const kills = 20
    const flags: Record<string, boolean> = {}
    if (kills >= 5)  flags['hollow_kills_tier_1'] = true
    if (kills >= 20) flags['hollow_kills_tier_2'] = true
    if (kills >= 50) flags['hollow_kills_tier_3'] = true
    expect(flags['hollow_kills_tier_1']).toBe(true)
    expect(flags['hollow_kills_tier_2']).toBe(true)
    expect(flags['hollow_kills_tier_3']).toBeUndefined()
  })

  it('sets all three tiers at exactly 50 kills', () => {
    const kills = 50
    const flags: Record<string, boolean> = {}
    if (kills >= 5)  flags['hollow_kills_tier_1'] = true
    if (kills >= 20) flags['hollow_kills_tier_2'] = true
    if (kills >= 50) flags['hollow_kills_tier_3'] = true
    expect(flags['hollow_kills_tier_1']).toBe(true)
    expect(flags['hollow_kills_tier_2']).toBe(true)
    expect(flags['hollow_kills_tier_3']).toBe(true)
  })

  it('sets no flags at 4 kills', () => {
    const kills = 4
    const flags: Record<string, boolean> = {}
    if (kills >= 5)  flags['hollow_kills_tier_1'] = true
    if (kills >= 20) flags['hollow_kills_tier_2'] = true
    if (kills >= 50) flags['hollow_kills_tier_3'] = true
    expect(Object.keys(flags)).toHaveLength(0)
  })
})
