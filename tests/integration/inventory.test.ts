// ============================================================
// Integration tests for lib/actions/items.ts
// take, drop, equip, unequip
// ============================================================

import { describe, it, expect, vi, beforeEach } from 'vitest'
import type { GameState, Player, Room, InventoryItem, GameMessage, Item } from '@/types/game'
import type { EngineCore } from '@/lib/actions/types'

// ------------------------------------------------------------
// Mock external modules
// ------------------------------------------------------------

const ITEMS: Record<string, Item> = {
  medkit: { id: 'medkit', name: 'Medkit', description: 'Heals you.', type: 'consumable', weight: 1, value: 10, healing: 5 },
  knife: { id: 'knife', name: 'Knife', description: 'A sharp knife.', type: 'weapon', weight: 1, value: 5, damage: 4 },
  vest: { id: 'vest', name: 'Leather Vest', description: 'A sturdy vest.', type: 'armor', weight: 3, value: 15, defense: 2 },
  scrap: { id: 'scrap', name: 'Scrap Metal', description: 'Junk.', type: 'junk', weight: 1, value: 1 },
}

vi.mock('@/data/items', () => ({
  getItem: vi.fn((id: string) => ITEMS[id] ?? undefined),
}))

// Track inventory state for mock
let mockInventory: InventoryItem[] = []

vi.mock('@/lib/inventory', () => ({
  getInventory: vi.fn(async () => mockInventory),
  addItem: vi.fn().mockResolvedValue(undefined),
  removeItem: vi.fn().mockResolvedValue(undefined),
  equipItem: vi.fn(async (_pid: string, itemId: string) => {
    const ii = mockInventory.find(i => i.itemId === itemId)
    if (ii) ii.equipped = true
  }),
  unequipItem: vi.fn(async (_pid: string, itemId: string) => {
    const ii = mockInventory.find(i => i.itemId === itemId)
    if (ii) ii.equipped = false
  }),
}))

vi.mock('@/lib/world', () => ({
  updateRoomItems: vi.fn().mockResolvedValue(undefined),
  updateRoomFlags: vi.fn().mockResolvedValue(undefined),
}))

vi.mock('@/lib/supabase', () => ({
  createSupabaseBrowserClient: vi.fn(),
}))

// ------------------------------------------------------------
// Helpers
// ------------------------------------------------------------

function makePlayer(overrides: Partial<Player> = {}): Player {
  return {
    id: 'p1', name: 'Tester', characterClass: 'enforcer',
    vigor: 10, grit: 8, reflex: 6, wits: 5, presence: 4, shadow: 3,
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

function makeInvItem(itemId: string, equipped = false): InventoryItem {
  return {
    id: `inv_${itemId}`,
    playerId: 'p1',
    itemId,
    item: ITEMS[itemId]!,
    quantity: 1,
    equipped,
  }
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
    adjustReputation: vi.fn().mockResolvedValue(undefined),
    setQuestFlag: vi.fn().mockResolvedValue(undefined),
  }
}

// Import handlers after mocks
import { handleTake, handleDrop, handleEquip, handleUnequip } from '@/lib/actions/items'

// ------------------------------------------------------------
// Tests
// ------------------------------------------------------------

describe('handleTake', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mockInventory = []
  })

  it('picks up an item from the room', async () => {
    mockInventory = [makeInvItem('knife')]
    const engine = makeEngine({
      currentRoom: makeRoom({ items: ['knife'] }),
    })

    await handleTake(engine, 'knife')

    // Item removed from room
    expect(engine.state.currentRoom!.items).not.toContain('knife')
    // System message about picking up
    const pickupMsg = engine.messages.find(m => m.text.includes('pick up'))
    expect(pickupMsg).toBeDefined()
  })

  it('shows error when item is not in room', async () => {
    const engine = makeEngine({
      currentRoom: makeRoom({ items: [] }),
    })

    await handleTake(engine, 'knife')

    const errorMsgs = engine.messages.filter(m => m.type === 'error')
    expect(errorMsgs.length).toBe(1)
    expect(errorMsgs[0]!.text).toContain("don't see")
  })

  it('shows error when no noun is given', async () => {
    const engine = makeEngine()

    await handleTake(engine, undefined)

    const errorMsgs = engine.messages.filter(m => m.type === 'error')
    expect(errorMsgs.length).toBe(1)
    expect(errorMsgs[0]!.text).toContain('Take what')
  })
})

describe('handleDrop', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mockInventory = []
  })

  it('drops an item from inventory into the room', async () => {
    mockInventory = [makeInvItem('knife')]
    const engine = makeEngine({
      inventory: [makeInvItem('knife')],
    })

    await handleDrop(engine, 'knife')

    // Item added to room
    expect(engine.state.currentRoom!.items).toContain('knife')
    // System message
    const dropMsg = engine.messages.find(m => m.text.includes('drop'))
    expect(dropMsg).toBeDefined()
  })

  it('shows error when item not in inventory', async () => {
    const engine = makeEngine({ inventory: [] })

    await handleDrop(engine, 'knife')

    const errorMsgs = engine.messages.filter(m => m.type === 'error')
    expect(errorMsgs.length).toBe(1)
    expect(errorMsgs[0]!.text).toContain("don't have")
  })
})

describe('handleEquip', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mockInventory = []
  })

  it('equips a weapon from inventory', async () => {
    mockInventory = [makeInvItem('knife')]
    const engine = makeEngine({ inventory: [makeInvItem('knife')] })

    await handleEquip(engine, 'knife')

    const equipMsg = engine.messages.find(m => m.text.includes('equip'))
    expect(equipMsg).toBeDefined()
  })

  it('refuses to equip a non-equippable item', async () => {
    mockInventory = [makeInvItem('scrap')]
    const engine = makeEngine({ inventory: [makeInvItem('scrap')] })

    await handleEquip(engine, 'scrap')

    const errorMsgs = engine.messages.filter(m => m.type === 'error')
    expect(errorMsgs.length).toBe(1)
    expect(errorMsgs[0]!.text).toContain("can't equip")
  })
})

describe('handleUnequip', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mockInventory = []
  })

  it('unequips an equipped item', async () => {
    mockInventory = [makeInvItem('knife', true)]
    const engine = makeEngine({ inventory: [makeInvItem('knife', true)] })

    await handleUnequip(engine, 'knife')

    const msg = engine.messages.find(m => m.text.includes('remove'))
    expect(msg).toBeDefined()
  })

  it('shows error when item is not equipped', async () => {
    mockInventory = [makeInvItem('knife', false)]
    const engine = makeEngine({ inventory: [makeInvItem('knife', false)] })

    await handleUnequip(engine, 'knife')

    const errorMsgs = engine.messages.filter(m => m.type === 'error')
    expect(errorMsgs.length).toBe(1)
    expect(errorMsgs[0]!.text).toContain('not equipped')
  })
})
