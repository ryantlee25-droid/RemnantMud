// ============================================================
// Integration tests — dog adoption flow + cycle-aware canDie
// lib/actions/social.ts (handleGive) + lib/companionSystem.ts
// ============================================================

import { describe, it, expect, vi, beforeEach } from 'vitest'
import type { GameState, Player, Room, InventoryItem, GameMessage } from '@/types/game'
import type { EngineCore } from '@/lib/actions/types'

// ------------------------------------------------------------
// Mocks — must be registered before any handler import
// ------------------------------------------------------------

vi.mock('@/data/npcs', () => ({
  getNPC: vi.fn((id: string) => {
    if (id === 'the_dog') {
      return {
        id: 'the_dog',
        name: 'A Stray Dog',
        faction: undefined,
        isNamed: true,
        description: 'A lean dog with a notched ear.',
        dialogue: "The dog doesn't speak.",
      }
    }
    if (id === 'howard_bridge_keeper') {
      return {
        id: 'howard_bridge_keeper',
        name: 'Howard',
        faction: 'accord',
        isNamed: true,
        description: 'A bridge keeper.',
        dialogue: 'Passage costs a toll.',
      }
    }
    return undefined
  }),
  getRevenantDialogue: vi.fn(() => null),
}))

vi.mock('@/data/dialogueTrees', () => ({ DIALOGUE_TREES: {} }))

vi.mock('@/data/npcTopics', () => ({
  NPC_TOPICS: {},
  findNpcTopic: vi.fn(() => null),
  getVisibleTopics: vi.fn(() => []),
}))

vi.mock('@/data/items', () => ({
  getItem: vi.fn((id: string) => {
    if (id === 'boiled_rations') {
      return { id: 'boiled_rations', name: 'Boiled Rations', type: 'consumable', weight: 1, value: 4 }
    }
    if (id === 'elk_jerky') {
      return { id: 'elk_jerky', name: 'Elk Jerky', type: 'consumable', weight: 1, value: 6 }
    }
    if (id === 'combat_knife') {
      return { id: 'combat_knife', name: 'Combat Knife', type: 'weapon', weight: 1, value: 12, damage: 4 }
    }
    return undefined
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
  rollCheck: vi.fn(() => ({ roll: 5, modifier: 2, total: 7, dc: 8, success: false })),
}))

vi.mock('@/lib/inventory', () => ({
  removeItem: vi.fn().mockResolvedValue(undefined),
  getInventory: vi.fn().mockResolvedValue([]),
}))

// ------------------------------------------------------------
// Helpers
// ------------------------------------------------------------

function makePlayer(overrides: Partial<Player> = {}): Player {
  return {
    id: 'p1',
    name: 'Tester',
    characterClass: 'enforcer',
    vigor: 10,
    grit: 8,
    reflex: 6,
    wits: 5,
    presence: 7,
    shadow: 3,
    hp: 20,
    maxHp: 20,
    currentRoomId: 'rr_05_the_ford',
    worldSeed: 1,
    xp: 0,
    level: 1,
    actionsTaken: 42,
    isDead: false,
    cycle: 1,
    totalDeaths: 0,
    ...overrides,
  }
}

function makeRoom(overrides: Partial<Room> = {}): Room {
  return {
    id: 'rr_05_the_ford',
    name: 'The Ford',
    description: 'A shallow crossing.',
    shortDescription: 'The ford.',
    zone: 'river_road',
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

function makeInvItem(itemId: string, name: string, type: string): InventoryItem {
  return {
    id: `inv_${itemId}`,
    playerId: 'p1',
    itemId,
    item: { id: itemId, name, type: type as InventoryItem['item']['type'], weight: 1, value: 4 },
    quantity: 1,
    equipped: false,
  }
}

/**
 * Build a test engine. setQuestFlag also updates the in-memory player
 * questFlags so successive calls within a single test see the updated state.
 */
function makeEngine(state: Partial<GameState> = {}): EngineCore & {
  messages: GameMessage[]
  state: GameState
} {
  const fullState: GameState = {
    player: makePlayer(),
    currentRoom: makeRoom({ npcs: ['the_dog'] }),
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

  const engine = {
    messages,
    state: fullState,
    getState: () => fullState,
    _setState: (partial: Partial<GameState>) => Object.assign(fullState, partial),
    _appendMessages: (msgs: GameMessage[]) => messages.push(...msgs),
    _savePlayer: vi.fn().mockResolvedValue(undefined),
    _applyPopulation: (room: Room) => room,
    _handlePlayerDeath: vi.fn().mockResolvedValue(undefined),
    _checkLevelUp: vi.fn(),
    adjustReputation: vi.fn().mockResolvedValue(undefined),
    // setQuestFlag updates in-memory state so successive feeds read the right count
    setQuestFlag: vi.fn().mockImplementation(async (flag: string, value: string | boolean | number) => {
      if (fullState.player) {
        const newFlags = { ...(fullState.player.questFlags ?? {}), [flag]: value }
        Object.assign(fullState, { player: { ...fullState.player, questFlags: newFlags } })
      }
    }),
    grantNarrativeKey: vi.fn().mockResolvedValue(undefined),
  }

  return engine
}

// Import handlers after mocks
import { handleGive } from '@/lib/actions/social'
import { addCompanion } from '@/lib/companionSystem'

// ------------------------------------------------------------
// Tests
// ------------------------------------------------------------

describe('dog adoption — 3-feed flow', () => {
  beforeEach(() => { vi.clearAllMocks() })

  it('first feed increments dog_fed_count to 1 and shows distant-eating message', async () => {
    const engine = makeEngine({
      inventory: [makeInvItem('boiled_rations', 'Boiled Rations', 'consumable')],
    })

    await handleGive(engine, 'boiled rations to dog')

    expect(engine.setQuestFlag).toHaveBeenCalledWith('dog_fed_count', 1)
    const hasEatMsg = engine.messages.some(m =>
      m.text.includes('distance') || m.text.includes('while it chews')
    )
    expect(hasEatMsg).toBe(true)
    // No companion added yet
    expect(engine.getState().player?.currentCompanion).toBeUndefined()
  })

  it('second feed increments dog_fed_count to 2 and shows "comes closer" message', async () => {
    const engine = makeEngine({
      player: makePlayer({ questFlags: { dog_fed_count: 1 } }),
      inventory: [makeInvItem('elk_jerky', 'Elk Jerky', 'consumable')],
    })

    await handleGive(engine, 'elk jerky to dog')

    expect(engine.setQuestFlag).toHaveBeenCalledWith('dog_fed_count', 2)
    const hasCloserMsg = engine.messages.some(m =>
      m.text.includes('closer') || m.text.includes('does not stay')
    )
    expect(hasCloserMsg).toBe(true)
    expect(engine.getState().player?.currentCompanion).toBeUndefined()
  })

  it('third feed adopts the_dog: companion set, count capped at 3, join message in output', async () => {
    const engine = makeEngine({
      player: makePlayer({ questFlags: { dog_fed_count: 2 } }),
      inventory: [makeInvItem('boiled_rations', 'Boiled Rations', 'consumable')],
    })

    await handleGive(engine, 'boiled rations to dog')

    // dog_fed_count capped at 3
    expect(engine.setQuestFlag).toHaveBeenCalledWith('dog_fed_count', 3)

    // Companion set on player
    const companion = engine.getState().player?.currentCompanion
    expect(companion).toBeDefined()
    expect(companion?.npcId).toBe('the_dog')

    // Join message (introduction or join narration) present in output
    const hasJoinText = engine.messages.some(m =>
      m.text.includes('stray') ||
      m.text.includes('fell in') ||
      m.text.includes('decided') ||
      m.text.includes('notched ear') ||
      m.text.includes('dog sits beside')
    )
    expect(hasJoinText).toBe(true)
  })

  it('3-feed flow in sequence using state-updating setQuestFlag mock', async () => {
    const engine = makeEngine({
      inventory: [
        makeInvItem('boiled_rations', 'Boiled Rations', 'consumable'),
      ],
    })

    // Feed 1
    await handleGive(engine, 'boiled rations to dog')
    expect(engine.getState().player?.currentCompanion).toBeUndefined()

    // Re-add item for feed 2
    engine.state.inventory = [makeInvItem('boiled_rations', 'Boiled Rations', 'consumable')]
    await handleGive(engine, 'boiled rations to dog')
    expect(engine.getState().player?.currentCompanion).toBeUndefined()

    // Re-add item for feed 3
    engine.state.inventory = [makeInvItem('boiled_rations', 'Boiled Rations', 'consumable')]
    await handleGive(engine, 'boiled rations to dog')

    const companion = engine.getState().player?.currentCompanion
    expect(companion).toBeDefined()
    expect(companion?.npcId).toBe('the_dog')
    expect(engine.getState().player?.questFlags?.['dog_fed_count']).toBe(3)
  })
})

describe('dog adoption — cycle-4 canDie', () => {
  beforeEach(() => { vi.clearAllMocks() })

  it('adopted at cycle 4 results in canDie = false', async () => {
    const engine = makeEngine({
      player: makePlayer({ cycle: 4, questFlags: { dog_fed_count: 2 } }),
      inventory: [makeInvItem('boiled_rations', 'Boiled Rations', 'consumable')],
    })

    await handleGive(engine, 'boiled rations to dog')

    const companion = engine.getState().player?.currentCompanion
    expect(companion).toBeDefined()
    expect(companion?.npcId).toBe('the_dog')
    expect(companion?.canDie).toBe(false)
  })

  it('adopted at cycle 3 results in canDie = true', async () => {
    const engine = makeEngine({
      player: makePlayer({ cycle: 3, questFlags: { dog_fed_count: 2 } }),
      inventory: [makeInvItem('boiled_rations', 'Boiled Rations', 'consumable')],
    })

    await handleGive(engine, 'boiled rations to dog')

    const companion = engine.getState().player?.currentCompanion
    expect(companion).toBeDefined()
    expect(companion?.canDie).toBe(true)
  })

  it('addCompanion directly: cycle >= 4 sets canDie = false for the_dog', () => {
    const companion = addCompanion('the_dog', 'fed_kindly', 100, true, 4)
    expect(companion).not.toBeNull()
    expect(companion?.canDie).toBe(false)
  })

  it('addCompanion directly: cycle < 4 keeps canDie = true for the_dog', () => {
    const companion = addCompanion('the_dog', 'fed_kindly', 100, true, 3)
    expect(companion).not.toBeNull()
    expect(companion?.canDie).toBe(true)
  })

  it('addCompanion directly: no cycle passed keeps canDie = true', () => {
    const companion = addCompanion('the_dog', 'fed_kindly', 100)
    expect(companion).not.toBeNull()
    expect(companion?.canDie).toBe(true)
  })

  it('cycle-4 rule does not affect other companions', () => {
    const companion = addCompanion('howard_bridge_keeper', 'bridge_quest', 42, true, 5)
    expect(companion).not.toBeNull()
    expect(companion?.canDie).toBe(true)
  })
})

describe('dog adoption — no the_dog in room', () => {
  beforeEach(() => { vi.clearAllMocks() })

  it('giving food in a room without the_dog does not add companion or increment feed count', async () => {
    const engine = makeEngine({
      currentRoom: makeRoom({ npcs: ['howard_bridge_keeper'] }),
      inventory: [makeInvItem('boiled_rations', 'Boiled Rations', 'consumable')],
    })

    await handleGive(engine, 'boiled rations to howard')

    // No companion added
    expect(engine.getState().player?.currentCompanion).toBeUndefined()

    // dog_fed_count not set
    const flags = engine.getState().player?.questFlags ?? {}
    expect(flags['dog_fed_count']).toBeUndefined()
  })

  it('giving a non-food item to the_dog falls through to generic give', async () => {
    const engine = makeEngine({
      currentRoom: makeRoom({ npcs: ['the_dog'] }),
      inventory: [makeInvItem('combat_knife', 'Combat Knife', 'weapon')],
    })

    await handleGive(engine, 'combat knife to dog')

    // No companion added (non-food item, not in FOOD_ITEM_IDS)
    expect(engine.getState().player?.currentCompanion).toBeUndefined()

    // feed count not changed
    const flags = engine.getState().player?.questFlags ?? {}
    expect(flags['dog_fed_count']).toBeUndefined()
  })
})

describe('dog adoption — already has different companion', () => {
  beforeEach(() => { vi.clearAllMocks() })

  it('feeding the_dog when player has a different companion does not replace the companion', async () => {
    const existingCompanion = {
      npcId: 'howard_bridge_keeper',
      joinedAt: 10,
      questContext: 'bridge_quest',
      canDie: true,
    }
    const engine = makeEngine({
      player: makePlayer({ currentCompanion: existingCompanion }),
      currentRoom: makeRoom({ npcs: ['the_dog'] }),
      inventory: [makeInvItem('boiled_rations', 'Boiled Rations', 'consumable')],
    })

    // Feed 3 times — the different-companion branch should fall through
    for (let i = 0; i < 3; i++) {
      engine.state.inventory = [makeInvItem('boiled_rations', 'Boiled Rations', 'consumable')]
      await handleGive(engine, 'boiled rations to dog')
    }

    // Companion should still be Howard, not the_dog
    const companion = engine.getState().player?.currentCompanion
    expect(companion?.npcId).toBe('howard_bridge_keeper')
  })
})

describe('dog adoption — already has the_dog as companion', () => {
  beforeEach(() => { vi.clearAllMocks() })

  it('feeding the_dog when already companion shows tail-wag acknowledgment', async () => {
    const dogCompanion = {
      npcId: 'the_dog',
      joinedAt: 5,
      questContext: 'fed_kindly',
      canDie: true,
    }
    const engine = makeEngine({
      player: makePlayer({ currentCompanion: dogCompanion }),
      currentRoom: makeRoom({ npcs: ['the_dog'] }),
      inventory: [makeInvItem('boiled_rations', 'Boiled Rations', 'consumable')],
    })

    await handleGive(engine, 'boiled rations to dog')

    const hasAckMsg = engine.messages.some(m =>
      m.text.includes('Tail moves once') || m.text.includes('accepts the food')
    )
    expect(hasAckMsg).toBe(true)

    // Companion unchanged
    expect(engine.getState().player?.currentCompanion?.npcId).toBe('the_dog')
  })
})
