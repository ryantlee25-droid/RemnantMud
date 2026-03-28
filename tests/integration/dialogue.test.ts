// ============================================================
// Integration tests for dialogue tree system (lib/actions/social.ts)
// ============================================================

import { describe, it, expect, vi, beforeEach } from 'vitest'
import type { GameState, Player, Room, InventoryItem, GameMessage, DialogueTree } from '@/types/game'
import type { EngineCore } from '@/lib/actions/types'

// ------------------------------------------------------------
// Mock external modules before importing handlers
// ------------------------------------------------------------

vi.mock('@/data/npcs', () => ({
  getNPC: vi.fn((id: string) => {
    if (id === 'test_npc') return {
      id: 'test_npc', name: 'Test NPC', description: 'A test NPC.',
      dialogue: 'Hello traveler.', faction: 'drifters', isNamed: true,
    }
    if (id === 'generic_npc') return {
      id: 'generic_npc', name: 'Generic NPC', description: 'A generic NPC.',
      dialogue: 'Nothing to say.', faction: undefined, isNamed: false,
    }
    return undefined
  }),
  getRevenantDialogue: vi.fn(() => null),
}))

vi.mock('@/data/dialogueTrees', () => ({
  DIALOGUE_TREES: {
    test_npc: {
      npcId: 'test_npc',
      startNode: 'start',
      nodes: {
        start: {
          id: 'start',
          text: 'Welcome, traveler. What brings you here?',
          branches: [
            { label: 'Ask about the area', targetNode: 'area_info' },
            { label: 'Attempt persuasion', targetNode: 'persuade_success', skillCheck: { skill: 'negotiation', dc: 8 }, failNode: 'persuade_fail' },
            { label: 'Ask the secret', targetNode: 'secret', requiresFlag: 'knows_secret' },
          ],
        },
        area_info: {
          id: 'area_info',
          text: 'This area was once a thriving settlement.',
          branches: [
            { label: 'Tell me more', targetNode: 'deeper_info' },
          ],
        },
        deeper_info: {
          id: 'deeper_info',
          text: 'There is nothing left to tell.',
          onEnter: {
            setFlag: 'heard_area_lore',
          },
        },
        persuade_success: {
          id: 'persuade_success',
          text: 'You make a compelling case. Very well.',
        },
        persuade_fail: {
          id: 'persuade_fail',
          text: 'Nice try, but no.',
          branches: [
            { label: 'Leave', targetNode: 'end' },
          ],
        },
        secret: {
          id: 'secret',
          text: 'Ah, so you know. Let me give you something.',
          onEnter: {
            grantItem: ['bandage'],
          },
        },
        end: {
          id: 'end',
          text: 'Goodbye.',
        },
      },
    },
  } as Record<string, unknown>,
}))

vi.mock('@/data/npcTopics', () => ({
  findNpcTopic: vi.fn(() => null),
  getVisibleTopics: vi.fn(() => []),
  NPC_TOPICS: {} as Record<string, unknown[]>,
}))

vi.mock('@/data/items', () => ({
  getItem: vi.fn((id: string) => {
    if (id === 'bandage') return { id: 'bandage', name: 'Bandage', description: 'A bandage.', type: 'consumable', weight: 0.5, value: 3 }
    return undefined
  }),
}))

vi.mock('@/lib/world', () => ({
  updateRoomFlags: vi.fn().mockResolvedValue(undefined),
}))

vi.mock('@/lib/skillBonus', () => ({
  getClassSkillBonus: vi.fn(() => 0),
  getStatForSkill: vi.fn((_skill: string, player: { vigor?: number; grit?: number; reflex?: number; wits?: number; presence?: number; shadow?: number } | null) => {
    if (!player) return null
    return player.wits ?? 5
  }),
  getStatNameForSkill: vi.fn((skill: string) => {
    const map: Record<string, string> = { negotiation: 'presence', intimidation: 'presence', perception: 'reflex', survival: 'grit', stealth: 'shadow' }
    return map[skill] ?? 'wits'
  }),
}))

// Mock dice module — will be overridden per-test
vi.mock('@/lib/dice', () => ({
  rollCheck: vi.fn(() => ({
    roll: 5, modifier: 2, total: 7, dc: 8, success: false, critical: false, fumble: false,
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

function makeRoom(overrides: Partial<Room> = {}): Room {
  return {
    id: 'room_1', name: 'Test Room', description: 'A test room.',
    shortDescription: 'Test.', zone: 'crossroads', difficulty: 1,
    visited: false, flags: {}, exits: {}, items: [], enemies: [], npcs: [],
    ...overrides,
  }
}

function makeEngine(state: Partial<GameState> = {}): EngineCore & { messages: GameMessage[]; state: GameState } {
  const fullState: GameState = {
    player: makePlayer(),
    currentRoom: makeRoom({ npcs: ['test_npc'] }),
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

// Import handlers after mocks are registered
import { handleTalk, handleDialogueChoice, handleDialogueLeave, handleDialogueBlocked } from '@/lib/actions/social'
import { rollCheck } from '@/lib/dice'

const mockedRollCheck = vi.mocked(rollCheck)

// ------------------------------------------------------------
// Tests
// ------------------------------------------------------------

describe('Dialogue Tree System', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  // 1. Starting a dialogue tree
  it('starts a dialogue tree and sets activeDialogue', async () => {
    const engine = makeEngine()

    await handleTalk(engine, 'test')

    // activeDialogue should be set
    expect(engine.state.activeDialogue).toBeDefined()
    expect(engine.state.activeDialogue!.npcId).toBe('test_npc')
    expect(engine.state.activeDialogue!.treeId).toBe('test_npc')
    expect(engine.state.activeDialogue!.currentNodeId).toBe('start')

    // Should display the start node text
    const hasStartText = engine.messages.some(m => m.text.includes('Welcome, traveler'))
    expect(hasStartText).toBe(true)

    // Should show branch choices
    const hasChoice = engine.messages.some(m => m.text.includes('Ask about the area'))
    expect(hasChoice).toBe(true)
  })

  // 2. Choosing a branch
  it('navigates to the next node when choosing a branch', async () => {
    const engine = makeEngine({
      activeDialogue: {
        npcId: 'test_npc',
        treeId: 'test_npc',
        currentNodeId: 'start',
      },
    })

    await handleDialogueChoice(engine, '1')

    // Should navigate to area_info
    expect(engine.state.activeDialogue).toBeDefined()
    expect(engine.state.activeDialogue!.currentNodeId).toBe('area_info')

    // Should display area_info text
    const hasAreaText = engine.messages.some(m => m.text.includes('thriving settlement'))
    expect(hasAreaText).toBe(true)
  })

  // 3. Skill check success
  it('navigates to success node on skill check pass', async () => {
    mockedRollCheck.mockReturnValueOnce({
      roll: 8, modifier: 2, total: 10, dc: 8, success: true, critical: false, fumble: false,
    })

    const engine = makeEngine({
      activeDialogue: {
        npcId: 'test_npc',
        treeId: 'test_npc',
        currentNodeId: 'start',
      },
    })

    await handleDialogueChoice(engine, '2') // "Attempt persuasion" branch

    // Should reach persuade_success (terminal), so activeDialogue gets cleared
    expect(engine.state.activeDialogue).toBeUndefined()

    // Should show success check message
    const hasSuccessMsg = engine.messages.some(m => m.text.includes('Success'))
    expect(hasSuccessMsg).toBe(true)

    // Should show the success node text
    const hasSuccessText = engine.messages.some(m => m.text.includes('compelling case'))
    expect(hasSuccessText).toBe(true)
  })

  // 4. Skill check failure
  it('navigates to fail node on skill check failure', async () => {
    mockedRollCheck.mockReturnValueOnce({
      roll: 3, modifier: 2, total: 5, dc: 8, success: false, critical: false, fumble: false,
    })

    const engine = makeEngine({
      activeDialogue: {
        npcId: 'test_npc',
        treeId: 'test_npc',
        currentNodeId: 'start',
      },
    })

    await handleDialogueChoice(engine, '2')

    // Should navigate to persuade_fail (has branches, so dialogue continues)
    expect(engine.state.activeDialogue).toBeDefined()
    expect(engine.state.activeDialogue!.currentNodeId).toBe('persuade_fail')

    // Should show failure check message
    const hasFailMsg = engine.messages.some(m => m.text.includes('Failed'))
    expect(hasFailMsg).toBe(true)

    // Should show fail node text
    const hasFailText = engine.messages.some(m => m.text.includes('Nice try'))
    expect(hasFailText).toBe(true)
  })

  // 5. Gate blocking
  it('blocks a branch that requires a flag the player lacks', async () => {
    const engine = makeEngine({
      activeDialogue: {
        npcId: 'test_npc',
        treeId: 'test_npc',
        currentNodeId: 'start',
      },
      player: makePlayer({ questFlags: {} }),
    })

    // Branch 3 requires 'knows_secret' flag
    await handleDialogueChoice(engine, '3')

    // Should be blocked
    const hasBlockedMsg = engine.messages.some(m => m.text.includes("can't choose"))
    expect(hasBlockedMsg).toBe(true)

    // Should remain on same node
    expect(engine.state.activeDialogue!.currentNodeId).toBe('start')
  })

  // 6. Conversation ending at terminal node
  it('clears activeDialogue when reaching a terminal node', async () => {
    const engine = makeEngine({
      activeDialogue: {
        npcId: 'test_npc',
        treeId: 'test_npc',
        currentNodeId: 'area_info',
      },
    })

    await handleDialogueChoice(engine, '1') // "Tell me more" -> deeper_info (terminal)

    // activeDialogue should be cleared
    expect(engine.state.activeDialogue).toBeUndefined()

    // Should show the ending message
    const hasEndMsg = engine.messages.some(m => m.text.includes('conversation ends'))
    expect(hasEndMsg).toBe(true)
  })

  // 7. Leave command
  it('clears activeDialogue on leave', async () => {
    const engine = makeEngine({
      activeDialogue: {
        npcId: 'test_npc',
        treeId: 'test_npc',
        currentNodeId: 'start',
      },
    })

    await handleDialogueLeave(engine)

    expect(engine.state.activeDialogue).toBeUndefined()

    const hasLeaveMsg = engine.messages.some(m => m.text.includes('end the conversation'))
    expect(hasLeaveMsg).toBe(true)
  })

  // 8. Blocked input during dialogue
  it('shows blocked message for non-dialogue input', async () => {
    const engine = makeEngine({
      activeDialogue: {
        npcId: 'test_npc',
        treeId: 'test_npc',
        currentNodeId: 'start',
      },
    })

    await handleDialogueBlocked(engine)

    const hasBlockedMsg = engine.messages.some(m =>
      m.text.includes("You're in a conversation") && m.text.includes('leave')
    )
    expect(hasBlockedMsg).toBe(true)
  })

  // 9. onEnter effects: setFlag
  it('sets a quest flag via onEnter when entering a node', async () => {
    const engine = makeEngine({
      activeDialogue: {
        npcId: 'test_npc',
        treeId: 'test_npc',
        currentNodeId: 'area_info',
      },
    })

    // Navigate to deeper_info which has onEnter.setFlag = 'heard_area_lore'
    await handleDialogueChoice(engine, '1')

    expect(engine.setQuestFlag).toHaveBeenCalledWith('heard_area_lore', true)
  })

  // 10. onEnter item grant
  it('grants an item via onEnter.grantItem', async () => {
    // Player has the required flag to unlock the secret branch
    const engine = makeEngine({
      player: makePlayer({ questFlags: { knows_secret: true } }),
      activeDialogue: {
        npcId: 'test_npc',
        treeId: 'test_npc',
        currentNodeId: 'start',
      },
    })

    await handleDialogueChoice(engine, '3') // "Ask the secret" -> secret node

    // Should announce the item grant
    const hasItemMsg = engine.messages.some(m => m.text.includes('Bandage'))
    expect(hasItemMsg).toBe(true)
  })
})
