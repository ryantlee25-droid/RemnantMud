// ============================================================
// Integration tests: handleCraft recipe validation (H5-W2)
// Covers:
//   - successful craft: item appears in inventory, ingredients consumed
//   - missing ingredient: user-visible error
//   - nonsense recipe name: "no such recipe" error
//
// Reuses inventory mock pattern from tests/integration/inventory.test.ts.
// ============================================================

import { describe, it, expect, vi, beforeEach } from 'vitest'
import type { GameState, Player, Room, GameMessage, InventoryItem, Item } from '@/types/game'
import type { EngineCore } from '@/lib/actions/types'

// ------------------------------------------------------------
// Minimal item registry for crafting tests
// ------------------------------------------------------------

const ITEMS: Record<string, Item> = {
  gauze:            { id: 'gauze',            name: 'Gauze',           description: 'Clean gauze.',      type: 'consumable', weight: 1, value: 2 },
  antiseptic:       { id: 'antiseptic',       name: 'Antiseptic',      description: 'Antiseptic fluid.', type: 'consumable', weight: 1, value: 3 },
  scrap_metal:      { id: 'scrap_metal',      name: 'Scrap Metal',     description: 'Metal scraps.',     type: 'junk',       weight: 2, value: 1 },
  wire_coil:        { id: 'wire_coil',        name: 'Wire Coil',       description: 'Coiled wire.',      type: 'junk',       weight: 1, value: 1 },
  crafted_field_dressing: { id: 'crafted_field_dressing', name: 'Field Dressing', description: 'Proper field dressing.', type: 'consumable', weight: 1, value: 8, healing: 4 },
  field_dressing:   { id: 'field_dressing',   name: 'Field Dressing',  description: 'A field dressing.', type: 'consumable', weight: 1, value: 8, healing: 4 },
  crafted_improvised_trap: { id: 'crafted_improvised_trap', name: 'Improvised Trap', description: 'A spike trap.', type: 'junk', weight: 3, value: 5 },
}

// ------------------------------------------------------------
// Mock external modules — mirror inventory.test.ts pattern
// ------------------------------------------------------------

vi.mock('@/data/items', () => ({
  getItem: vi.fn((id: string) => ITEMS[id] ?? undefined),
}))

// Track mock inventory state
let mockInventory: InventoryItem[] = []

vi.mock('@/lib/inventory', () => ({
  getInventory: vi.fn(async () => mockInventory),
  addItem: vi.fn().mockResolvedValue(undefined),
  removeItem: vi.fn().mockResolvedValue(undefined),
  equipItem: vi.fn().mockResolvedValue(undefined),
  unequipItem: vi.fn().mockResolvedValue(undefined),
  groupAndFormatItems: vi.fn(() => []),
}))

vi.mock('@/lib/world', () => ({
  updateRoomItems: vi.fn().mockResolvedValue(undefined),
  updateRoomFlags: vi.fn().mockResolvedValue(undefined),
}))

// Mock dice so skill checks always succeed — prevents flaky tests
// where the random roll fails a DC 8 check even with wits 10.
vi.mock('@/lib/dice', () => ({
  rollCheck: vi.fn(() => ({ success: true, roll: 20, total: 20 })),
  DC: { LOW: 5, MODERATE: 8, HIGH: 12, VERY_HIGH: 16 },
}))

// ------------------------------------------------------------
// Helpers — mirror inventory.test.ts
// ------------------------------------------------------------

function makePlayer(overrides: Partial<Player> = {}): Player {
  return {
    id: 'p1', name: 'Tester', characterClass: 'enforcer',
    vigor: 5, grit: 5, reflex: 5, wits: 10, presence: 5, shadow: 5,
    hp: 10, maxHp: 10, currentRoomId: 'room_1', worldSeed: 1,
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

function makeInvItem(itemId: string, quantity = 1): InventoryItem {
  return {
    id: `inv_${itemId}`,
    playerId: 'p1',
    itemId,
    item: ITEMS[itemId]!,
    quantity,
    equipped: false,
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

// Import handler after mocks
import { handleCraft } from '@/lib/actions/craft'
import { removeItem, addItem, getInventory } from '@/lib/inventory'

// ------------------------------------------------------------
// Tests
// ------------------------------------------------------------

describe('handleCraft', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mockInventory = []
  })

  // ----------------------------------------------------------
  // Success path: all ingredients present
  // Recipe: field_dressing — needs gauze x2, antiseptic x1
  // ----------------------------------------------------------
  it('succeeds when all ingredients are present — item produced, ingredients consumed', async () => {
    // Provide gauze x2 + antiseptic x1 in inventory
    const gauze1 = makeInvItem('gauze')
    const gauze2 = { ...makeInvItem('gauze'), id: 'inv_gauze_2' }
    const antisep = makeInvItem('antiseptic')
    mockInventory = [gauze1, gauze2, antisep]

    // After craft, getInventory returns the produced item
    const producedItem = makeInvItem('field_dressing')
    vi.mocked(getInventory).mockResolvedValue([producedItem])

    const engine = makeEngine({
      inventory: [gauze1, gauze2, antisep],
    })

    await handleCraft(engine, 'field dressing')

    // removeItem called for each consumed component
    expect(removeItem).toHaveBeenCalledWith('p1', 'gauze')
    expect(removeItem).toHaveBeenCalledWith('p1', 'antiseptic')

    // addItem called with the produced item ID
    expect(addItem).toHaveBeenCalledWith('p1', 'field_dressing')

    // Inventory refreshed after craft
    expect(getInventory).toHaveBeenCalledWith('p1')

    // A non-error message was shown
    const successMsg = engine.messages.find(m => m.type !== 'error')
    expect(successMsg).toBeDefined()
  })

  // ----------------------------------------------------------
  // Failure path: missing ingredient
  // Recipe: improvised_trap — needs scrap_metal x2, wire_coil x1
  // Inventory only has scrap_metal — wire_coil is missing
  // ----------------------------------------------------------
  it('returns user-visible error when a required ingredient is missing', async () => {
    const scrap1 = makeInvItem('scrap_metal')
    const scrap2 = { ...makeInvItem('scrap_metal'), id: 'inv_scrap_2' }
    mockInventory = [scrap1, scrap2]  // wire_coil absent

    const engine = makeEngine({
      inventory: [scrap1, scrap2],
    })

    await handleCraft(engine, 'improvised trap')

    // No item should have been produced
    expect(addItem).not.toHaveBeenCalled()

    // An error message must reference the missing component
    const errorMsg = engine.messages.find(m => m.type === 'error')
    expect(errorMsg).toBeDefined()
    expect(errorMsg!.text.toLowerCase()).toContain('missing')
  })

  // ----------------------------------------------------------
  // Unknown recipe: nonsense name → "no such recipe" error
  // ----------------------------------------------------------
  it('returns user-visible error for a nonsense recipe name', async () => {
    const engine = makeEngine({ inventory: [] })

    await handleCraft(engine, 'dragon_sword_supreme_edition')

    expect(addItem).not.toHaveBeenCalled()

    const errorMsg = engine.messages.find(m => m.type === 'error')
    expect(errorMsg).toBeDefined()
    // Must mention inability to craft / unknown recipe
    const lower = errorMsg!.text.toLowerCase()
    expect(
      lower.includes("don't know") || lower.includes('no such') || lower.includes('how to craft')
    ).toBe(true)
  })

  // ----------------------------------------------------------
  // No noun: lists available recipes (system message, no error)
  // ----------------------------------------------------------
  it('lists known recipes when no noun is given', async () => {
    const engine = makeEngine({ inventory: [] })

    await handleCraft(engine, undefined)

    // Should not produce an error
    const errorMsg = engine.messages.find(m => m.type === 'error')
    expect(errorMsg).toBeUndefined()

    // Should produce at least one message (recipe list or "no recipes" info)
    expect(engine.messages.length).toBeGreaterThan(0)
  })
})
