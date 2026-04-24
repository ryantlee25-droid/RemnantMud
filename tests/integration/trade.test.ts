// ============================================================
// Integration tests for lib/actions/trade.ts
// handleTrade, handleBuy, handleSell
// ============================================================

import { describe, it, expect, vi, beforeEach } from 'vitest'
import type { GameState, Player, Room, InventoryItem, GameMessage, NpcSpawnEntry } from '@/types/game'
import type { EngineCore } from '@/lib/actions/types'

// ------------------------------------------------------------
// Mock external modules before importing handlers
// ------------------------------------------------------------

vi.mock('@/data/npcs', () => ({
  getNPC: vi.fn((id: string) => {
    if (id === 'merchant_sal') return {
      id: 'merchant_sal', name: 'Sal the Trader',
      description: 'A weathered merchant.', dialogue: 'What do you need?',
      faction: 'drifters',
    }
    return undefined
  }),
}))

vi.mock('@/data/items', () => ({
  getItem: vi.fn((id: string) => {
    if (id === 'bandage') return { id: 'bandage', name: 'Bandage', description: 'Stops bleeding.', type: 'consumable', weight: 1, value: 10 }
    if (id === 'knife') return { id: 'knife', name: 'Knife', description: 'A knife.', type: 'weapon', weight: 1, value: 20, damage: 4 }
    if (id === 'ammo_22lr') return { id: 'ammo_22lr', name: '.22 LR Rounds', description: 'Currency.', type: 'currency', weight: 0, value: 1 }
    if (id === 'scrap_metal') return { id: 'scrap_metal', name: 'Scrap Metal', description: 'Junk.', type: 'junk', weight: 1, value: 4 }
    return undefined
  }),
}))

vi.mock('@/lib/inventory', async (importOriginal) => {
  const actual = await importOriginal()
  return {
    ...actual,
    getInventory: vi.fn().mockResolvedValue([]),
    addItem: vi.fn().mockResolvedValue(undefined),
    removeItem: vi.fn().mockResolvedValue(undefined),
  }
})

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
    _checkLevelUp: vi.fn(),
    adjustReputation: vi.fn().mockResolvedValue(undefined),
    setQuestFlag: vi.fn().mockResolvedValue(undefined),
  }
}

/** Create a room with a trading NPC present */
function makeTradeRoom(): Room {
  const npcSpawns: NpcSpawnEntry[] = [{
    npcId: 'merchant_sal',
    spawnChance: 1.0,
    tradeInventory: ['bandage', 'knife'],
  }]
  return makeRoom({
    npcs: ['merchant_sal'],
    npcSpawns,
  })
}

/** Create a currency inventory item */
function makeCurrencyItem(quantity: number): InventoryItem {
  return {
    id: 'inv_ammo', playerId: 'p1', itemId: 'ammo_22lr',
    item: { id: 'ammo_22lr', name: '.22 LR Rounds', description: 'Currency.', type: 'currency', weight: 0, value: 1 },
    quantity, equipped: false,
  }
}

// Import handlers after mocks are registered
import { handleTrade, handleBuy, handleSell } from '@/lib/actions/trade'
import { getInventory, addItem, removeItem } from '@/lib/inventory'

// ------------------------------------------------------------
// Tests
// ------------------------------------------------------------

describe('handleTrade', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('shows available items when merchant NPC is present', async () => {
    const engine = makeEngine({
      currentRoom: makeTradeRoom(),
      inventory: [makeCurrencyItem(50)],
    })

    await handleTrade(engine, undefined)

    // Should list items
    const tradeMsg = engine.messages.find(m => m.text.includes("Sal the Trader"))
    expect(tradeMsg).toBeDefined()
    expect(tradeMsg!.text).toContain('Bandage')
    expect(tradeMsg!.text).toContain('Knife')
    expect(tradeMsg!.text).toContain('50')
  })

  it('shows error when no NPC is present', async () => {
    const engine = makeEngine({
      currentRoom: makeRoom({ npcs: [], npcSpawns: [] }),
    })

    await handleTrade(engine, undefined)

    const errorMsgs = engine.messages.filter(m => m.type === 'error')
    expect(errorMsgs.length).toBe(1)
    expect(errorMsgs[0]!.text).toContain('no one here to trade')
  })
})

describe('handleBuy', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    // After buy, getInventory returns updated inventory
    vi.mocked(getInventory).mockResolvedValue([])
  })

  it('deducts currency and adds item on successful purchase', async () => {
    const engine = makeEngine({
      currentRoom: makeTradeRoom(),
      inventory: [makeCurrencyItem(50)],
    })

    await handleBuy(engine, 'bandage')

    // Currency removed: bandage costs 10 rounds
    expect(removeItem).toHaveBeenCalledWith('p1', 'ammo_22lr', 10)
    // Item added
    expect(addItem).toHaveBeenCalledWith('p1', 'bandage')
    // Success message
    const buyMsg = engine.messages.find(m => m.text.includes('buy'))
    expect(buyMsg).toBeDefined()
    expect(buyMsg!.text).toContain('Bandage')
  })

  it('shows error with insufficient funds', async () => {
    const engine = makeEngine({
      currentRoom: makeTradeRoom(),
      inventory: [makeCurrencyItem(5)], // only 5 rounds, bandage costs 10
    })

    await handleBuy(engine, 'bandage')

    const errorMsgs = engine.messages.filter(m => m.type === 'error')
    expect(errorMsgs.length).toBe(1)
    expect(errorMsgs[0]!.text).toContain("can't afford")
    // Should NOT have called addItem
    expect(addItem).not.toHaveBeenCalled()
  })

  it('shows error when no merchant present', async () => {
    const engine = makeEngine({
      currentRoom: makeRoom({ npcs: [], npcSpawns: [] }),
      inventory: [makeCurrencyItem(50)],
    })

    await handleBuy(engine, 'bandage')

    const errorMsgs = engine.messages.filter(m => m.type === 'error')
    expect(errorMsgs.length).toBe(1)
    expect(errorMsgs[0]!.text).toContain('no one here to trade')
  })

  it('shows error when item not in merchant inventory', async () => {
    const engine = makeEngine({
      currentRoom: makeTradeRoom(),
      inventory: [makeCurrencyItem(50)],
    })

    await handleBuy(engine, 'plasma_rifle')

    const errorMsgs = engine.messages.filter(m => m.type === 'error')
    expect(errorMsgs.length).toBe(1)
    expect(errorMsgs[0]!.text).toContain("doesn't sell")
  })
})

describe('handleSell', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    vi.mocked(getInventory).mockResolvedValue([])
  })

  it('removes item and adds currency on successful sale', async () => {
    const scrapItem: InventoryItem = {
      id: 'inv_scrap', playerId: 'p1', itemId: 'scrap_metal',
      item: { id: 'scrap_metal', name: 'Scrap Metal', description: 'Junk.', type: 'junk', weight: 1, value: 4 },
      quantity: 1, equipped: false,
    }
    const engine = makeEngine({
      currentRoom: makeTradeRoom(),
      inventory: [scrapItem, makeCurrencyItem(10)],
    })

    await handleSell(engine, 'scrap')

    // Item removed
    expect(removeItem).toHaveBeenCalledWith('p1', 'scrap_metal')
    // Currency added at half value: floor(4 / 2) = 2
    expect(addItem).toHaveBeenCalledWith('p1', 'ammo_22lr', 2)
    // Success message
    const sellMsg = engine.messages.find(m => m.text.includes('sell'))
    expect(sellMsg).toBeDefined()
    expect(sellMsg!.text).toContain('Scrap Metal')
  })

  it('shows error when player does not have the item', async () => {
    const engine = makeEngine({
      currentRoom: makeTradeRoom(),
      inventory: [makeCurrencyItem(10)],
    })

    await handleSell(engine, 'bandage')

    const errorMsgs = engine.messages.filter(m => m.type === 'error')
    expect(errorMsgs.length).toBe(1)
    expect(errorMsgs[0]!.text).toContain("don't have")
  })

  it('refuses to sell currency itself', async () => {
    const engine = makeEngine({
      currentRoom: makeTradeRoom(),
      inventory: [makeCurrencyItem(10)],
    })

    await handleSell(engine, '.22 LR')

    const errorMsgs = engine.messages.filter(m => m.type === 'error')
    expect(errorMsgs.length).toBe(1)
    expect(errorMsgs[0]!.text).toContain("can't sell rounds")
  })
})
