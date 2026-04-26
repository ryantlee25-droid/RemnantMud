// ============================================================
// Integration tests for lib/actions/items.ts
// take, drop, equip, unequip
// ============================================================

import { describe, it, expect, vi, beforeEach, beforeAll } from 'vitest'
import type { GameState, Player, Room, InventoryItem, GameMessage, Item } from '@/types/game'
import type { EngineCore } from '@/lib/actions/types'
import { createSupabaseBrowserClient } from '@/lib/supabase'

// ------------------------------------------------------------
// Mock external modules
// ------------------------------------------------------------

const ITEMS: Record<string, Item> = {
  medkit: { id: 'medkit', name: 'Medkit', description: 'Heals you.', type: 'consumable', weight: 1, value: 10, healing: 5 },
  knife: { id: 'knife', name: 'Knife', description: 'A sharp knife.', type: 'weapon', weight: 1, value: 5, damage: 4 },
  vest: { id: 'vest', name: 'Leather Vest', description: 'A sturdy vest.', type: 'armor', weight: 3, value: 15, defense: 2, armorSlot: 'chest' },
  scrap: { id: 'scrap', name: 'Scrap Metal', description: 'Junk.', type: 'junk', weight: 1, value: 1 },
  // statBonus weapons/armor for equip-cycle tests
  sword: { id: 'sword', name: 'Iron Sword', description: 'A heavy sword.', type: 'weapon', weight: 3, value: 20, damage: 6, statBonus: { vigor: 2 } },
  hammer: { id: 'hammer', name: 'War Hammer', description: 'A crushing hammer.', type: 'weapon', weight: 5, value: 30, damage: 8, statBonus: { vigor: 3, grit: 1 } },
  vigplate: { id: 'vigplate', name: 'Vigor Plate', description: 'Heavy armor.', type: 'armor', weight: 8, value: 40, defense: 5, statBonus: { vigor: 4 }, armorSlot: 'chest' },
  // H6 armor slot test items
  iron_helmet: { id: 'iron_helmet', name: 'Iron Helmet', description: 'A metal helmet.', type: 'armor', weight: 2, value: 15, defense: 1, armorSlot: 'head' },
  leather_cap: { id: 'leather_cap', name: 'Leather Cap', description: 'A soft leather cap.', type: 'armor', weight: 1, value: 8, defense: 1, armorSlot: 'head' },
  chain_legs: { id: 'chain_legs', name: 'Chain Leggings', description: 'Metal leg protection.', type: 'armor', weight: 4, value: 20, defense: 2, armorSlot: 'legs' },
  hide_boots: { id: 'hide_boots', name: 'Hide Boots', description: 'Tough leather boots.', type: 'armor', weight: 2, value: 12, defense: 1, armorSlot: 'feet' },
  // Armor without armorSlot (backward compat — defaults to chest)
  bare_plate: { id: 'bare_plate', name: 'Bare Plate', description: 'A plain plate with no slot tag.', type: 'armor', weight: 3, value: 10, defense: 2 },
  // Armor with statBonus for multi-slot stat compose test (H4 + H6 integration)
  grit_helm: { id: 'grit_helm', name: 'Grit Helm', description: 'A grit-boosting helmet.', type: 'armor', weight: 2, value: 20, defense: 1, armorSlot: 'head', statBonus: { grit: 2 } },
  reflex_boots: { id: 'reflex_boots', name: 'Reflex Boots', description: 'Agile boots.', type: 'armor', weight: 1, value: 15, defense: 1, armorSlot: 'feet', statBonus: { reflex: 3 } },
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

// ============================================================
// equipItem / unequipItem — statBonus application (H4 Convoy 2)
// Tests the REAL lib/inventory functions directly via importActual.
// Supabase is mocked per-call so DB operations succeed without a DB.
// ============================================================

describe('equipItem / unequipItem statBonus', () => {
  // Load the real (unmocked) lib/inventory functions
  let realEquipItem: (pid: string, iid: string, p?: Player) => Promise<Player | undefined>
  let realUnequipItem: (pid: string, iid: string, p?: Player) => Promise<Player | undefined>

  // Local chain builder for Supabase mock control.
  // All chained methods return the proxy so that any awaited link in the
  // chain resolves to `result` (not the raw plain object).
  function makeChainWith(result: unknown) {
    const chain: Record<string, unknown> = {}
    const proxy: Record<string, unknown> = new Proxy(chain, {
      get(target, prop) {
        if (prop === 'then') return (resolve: (v: unknown) => void) => resolve(result)
        return target[prop as string]
      },
    })
    for (const m of ['select', 'insert', 'update', 'delete', 'eq', 'neq', 'in', 'is', 'order', 'limit', 'single', 'maybeSingle', 'match', 'filter']) {
      chain[m] = vi.fn(() => proxy)
    }
    return proxy
  }

  // The Supabase mock injected by vi.mock('@/lib/supabase') at file top.
  // We configure it to return a mock client with a controllable `from` fn.
  let mockFrom: ReturnType<typeof vi.fn>

  beforeAll(async () => {
    const mod = await vi.importActual<typeof import('@/lib/inventory')>('@/lib/inventory')
    realEquipItem = mod.equipItem as typeof realEquipItem
    realUnequipItem = mod.unequipItem as typeof realUnequipItem
  })

  beforeEach(() => {
    vi.clearAllMocks()
    mockFrom = vi.fn()
    vi.mocked(createSupabaseBrowserClient).mockReturnValue({ from: mockFrom } as ReturnType<typeof createSupabaseBrowserClient>)
  })

  // Helper: stub a single-item inventory response (no existing equipped item)
  function stubEquip(itemId: string) {
    mockFrom
      .mockReturnValueOnce(makeChainWith({ data: [{ id: `inv_${itemId}`, item_id: itemId, equipped: false }], error: null }))
      .mockReturnValue(makeChainWith({ data: null, error: null }))
  }

  // Helper: stub inventory response with an already-equipped item of same type
  function stubEquipReplacing(equippedItemId: string, newItemId: string) {
    mockFrom
      .mockReturnValueOnce(makeChainWith({
        data: [
          { id: `inv_${equippedItemId}`, item_id: equippedItemId, equipped: true },
          { id: `inv_${newItemId}`, item_id: newItemId, equipped: false },
        ],
        error: null,
      }))
      .mockReturnValue(makeChainWith({ data: null, error: null }))
  }

  // Helper: stub unequip (just needs update to succeed)
  function stubUnequip() {
    mockFrom.mockReturnValue(makeChainWith({ data: null, error: null }))
  }

  function makeTestPlayer(overrides: Partial<Player> = {}): Player {
    const vigor = overrides.vigor ?? 5
    return {
      id: 'p1', name: 'Tester', characterClass: 'enforcer',
      vigor, grit: 8, reflex: 6, wits: 5, presence: 4, shadow: 3,
      hp: 8 + (vigor - 2) * 2,
      maxHp: 8 + (vigor - 2) * 2,
      currentRoomId: 'room_1', worldSeed: 1,
      xp: 0, level: 1, actionsTaken: 0, isDead: false, cycle: 1, totalDeaths: 0,
      ...overrides,
    }
  }

  // HP formula at a given vigor
  function expectedMaxHp(vigor: number): number {
    return 8 + (vigor - 2) * 2
  }

  // ----------------------------------------------------------
  // Test 1: equip applies the statBonus
  // ----------------------------------------------------------
  it('equip applies statBonus to player stats', async () => {
    const player = makeTestPlayer({ vigor: 5 })
    const initialMaxHp = player.maxHp

    stubEquip('sword') // sword has statBonus: { vigor: 2 }
    await realEquipItem('p1', 'sword', player)

    expect(player.vigor).toBe(7)
    expect(player.maxHp).toBe(expectedMaxHp(7))
    expect(player.maxHp).toBeGreaterThan(initialMaxHp)
  })

  // ----------------------------------------------------------
  // Test 2: unequip reverses the statBonus
  // ----------------------------------------------------------
  it('unequip reverses statBonus from player stats', async () => {
    const player = makeTestPlayer({ vigor: 7, maxHp: expectedMaxHp(7), hp: expectedMaxHp(7) })

    stubUnequip() // sword has statBonus: { vigor: 2 }
    await realUnequipItem('p1', 'sword', player)

    expect(player.vigor).toBe(5)
    expect(player.maxHp).toBe(expectedMaxHp(5))
  })

  // ----------------------------------------------------------
  // Test 3: auto-unequip on slot replacement reverses old, applies new
  // sword: { vigor: 2 }; hammer: { vigor: 3, grit: 1 }
  // ----------------------------------------------------------
  it('auto-unequip reverses old item bonus before applying new item bonus', async () => {
    // Player has sword equipped (+vigor:2), so effective vigor is 7
    const player = makeTestPlayer({ vigor: 7, grit: 8, maxHp: expectedMaxHp(7), hp: expectedMaxHp(7) })

    stubEquipReplacing('sword', 'hammer')
    await realEquipItem('p1', 'hammer', player)

    // sword bonus reversed: vigor 7 → 5; hammer applied: vigor 5+3=8, grit 8+1=9
    expect(player.vigor).toBe(8)
    expect(player.grit).toBe(9)
    expect(player.maxHp).toBe(expectedMaxHp(8))
  })

  // ----------------------------------------------------------
  // Test 4: HP clamps to new maxHp when unequip drops vigor
  // ----------------------------------------------------------
  it('hp clamps to maxHp when vigor drops on unequip', async () => {
    // vigplate has statBonus: { vigor: 4 }
    // Player currently has vigplate equipped: vigor 9, hp=maxHp=expectedMaxHp(9)
    const vigor = 9
    const hp = expectedMaxHp(vigor) // at max
    const player = makeTestPlayer({ vigor, maxHp: hp, hp })

    stubUnequip()
    await realUnequipItem('p1', 'vigplate', player)

    // vigor drops by 4 → 5; maxHp recomputed; hp was > new maxHp → clamped
    expect(player.vigor).toBe(5)
    expect(player.maxHp).toBe(expectedMaxHp(5))
    expect(player.hp).toBe(player.maxHp)
    expect(player.hp).toBeLessThanOrEqual(player.maxHp)
  })

  // ----------------------------------------------------------
  // Test 5: Mandatory 100-cycle equip/unequip stress test
  // Asserts zero stat drift and zero maxHp drift.
  // ----------------------------------------------------------
  it('100-cycle equip/unequip: no stat drift, no maxHp drift (mandatory H4 stress test)', async () => {
    // sword has statBonus: { vigor: 2 }
    const INITIAL_VIGOR = 5
    const player = makeTestPlayer({ vigor: INITIAL_VIGOR })
    const initialMaxHp = player.maxHp

    for (let i = 0; i < 100; i++) {
      // equip
      stubEquip('sword')
      await realEquipItem('p1', 'sword', player)

      expect(player.vigor).toBe(INITIAL_VIGOR + 2)
      expect(player.maxHp).toBe(expectedMaxHp(INITIAL_VIGOR + 2))

      // unequip
      stubUnequip()
      await realUnequipItem('p1', 'sword', player)

      expect(player.vigor).toBe(INITIAL_VIGOR)
      expect(player.maxHp).toBe(expectedMaxHp(INITIAL_VIGOR))
    }

    // Final assertion: exact values, no drift after 100 cycles
    expect(player.vigor).toBe(INITIAL_VIGOR)
    expect(player.maxHp).toBe(initialMaxHp)
  })
})

// ============================================================
// Armor slot system (H6 Convoy 2)
// Tests slot independence, same-slot replacement, defense sums,
// default-to-chest fallback, and multi-slot stat compose.
// Uses the real lib/inventory functions via importActual.
// ============================================================

describe('armor slot system (H6)', () => {
  let realEquipItem: (pid: string, iid: string, p?: Player) => Promise<Player | undefined>

  // Same pattern as H4 block: chain methods must return the proxy (not the raw
  // chain object) so that awaiting any chained link resolves to `result`.
  function makeChainWith(result: unknown) {
    const chain: Record<string, unknown> = {}
    const proxy: Record<string, unknown> = new Proxy(chain, {
      get(target, prop) {
        if (prop === 'then') return (resolve: (v: unknown) => void) => resolve(result)
        return target[prop as string]
      },
    })
    for (const m of ['select', 'insert', 'update', 'delete', 'eq', 'neq', 'in', 'is', 'order', 'limit', 'single', 'maybeSingle', 'match', 'filter']) {
      chain[m] = vi.fn(() => proxy)
    }
    return proxy
  }

  let mockFrom: ReturnType<typeof vi.fn>

  beforeAll(async () => {
    const mod = await vi.importActual<typeof import('@/lib/inventory')>('@/lib/inventory')
    realEquipItem = mod.equipItem as typeof realEquipItem
  })

  beforeEach(() => {
    vi.clearAllMocks()
    mockFrom = vi.fn()
    vi.mocked(createSupabaseBrowserClient).mockReturnValue({ from: mockFrom } as ReturnType<typeof createSupabaseBrowserClient>)
  })

  // Stub: player has chest armor equipped, now equipping a head item
  function stubEquipNoConflict(headItemId: string, chestInvId: string, chestItemId: string) {
    // Return inventory with chest armor already equipped (different slot — no conflict)
    mockFrom
      .mockReturnValueOnce(makeChainWith({
        data: [
          { id: chestInvId, item_id: chestItemId, equipped: true },
          { id: `inv_${headItemId}`, item_id: headItemId, equipped: false },
        ],
        error: null,
      }))
      .mockReturnValue(makeChainWith({ data: null, error: null }))
  }

  // Stub: player has one helmet equipped, now equipping a second (same slot)
  function stubEquipSameSlot(oldHelmetId: string, newHelmetId: string) {
    mockFrom
      .mockReturnValueOnce(makeChainWith({
        data: [
          { id: `inv_${oldHelmetId}`, item_id: oldHelmetId, equipped: true },
          { id: `inv_${newHelmetId}`, item_id: newHelmetId, equipped: false },
        ],
        error: null,
      }))
      .mockReturnValue(makeChainWith({ data: null, error: null }))
  }

  // Stub: no existing equipped items of this type
  function stubEquipFresh(itemId: string) {
    mockFrom
      .mockReturnValueOnce(makeChainWith({
        data: [{ id: `inv_${itemId}`, item_id: itemId, equipped: false }],
        error: null,
      }))
      .mockReturnValue(makeChainWith({ data: null, error: null }))
  }

  function makeSlotPlayer(overrides: Partial<Player> = {}): Player {
    return {
      id: 'p1', name: 'Tester', characterClass: 'enforcer',
      vigor: 5, grit: 8, reflex: 6, wits: 5, presence: 4, shadow: 3,
      hp: 14, maxHp: 14, currentRoomId: 'room_1', worldSeed: 1,
      xp: 0, level: 1, actionsTaken: 0, isDead: false, cycle: 1, totalDeaths: 0,
      ...overrides,
    }
  }

  // ----------------------------------------------------------
  // Test H6-1: Equipping a helmet does NOT unequip a chestpiece (independent slots)
  // ----------------------------------------------------------
  it('H6-1: equipping a head armor does not unequip a chest armor', async () => {
    // Start: vest (chest) is equipped. iron_helmet (head) is in inventory, not equipped.
    const player = makeSlotPlayer({ equippedArmorChest: 'inv_vest' })

    stubEquipNoConflict('iron_helmet', 'inv_vest', 'vest')
    await realEquipItem('p1', 'iron_helmet', player)

    // Chest slot should still be set (vest not displaced)
    expect(player.equippedArmorChest).toBe('inv_vest')
    // Head slot should now be set
    expect(player.equippedArmorHead).toBe('inv_iron_helmet')
  })

  // ----------------------------------------------------------
  // Test H6-2: Equipping a second helmet auto-unequips the first (same-slot conflict)
  // ----------------------------------------------------------
  it('H6-2: equipping a second head armor unequips the first (same-slot conflict)', async () => {
    // Start: iron_helmet (head) is equipped. leather_cap (head) is in inventory.
    const player = makeSlotPlayer({ equippedArmorHead: 'inv_iron_helmet' })

    stubEquipSameSlot('iron_helmet', 'leather_cap')
    await realEquipItem('p1', 'leather_cap', player)

    // Old helmet should be cleared from head slot
    expect(player.equippedArmorHead).toBe('inv_leather_cap')
  })

  // ----------------------------------------------------------
  // Test H6-3: Defense sums correctly across all 4 slots
  // head=1 + chest=2 + legs=2 + feet=1 = 6 total
  // ----------------------------------------------------------
  it('H6-3: defense sums correctly across all 4 equipped slots', () => {
    // Build a player with all 4 slots filled
    const player = makeSlotPlayer({
      equippedArmorHead: 'inv_iron_helmet',   // defense: 1
      equippedArmorChest: 'inv_vest',          // defense: 2
      equippedArmorLegs: 'inv_chain_legs',     // defense: 2
      equippedArmorFeet: 'inv_hide_boots',     // defense: 1
    })

    // Build a mock inventory with all 4 pieces
    const inventory: InventoryItem[] = [
      { id: 'inv_iron_helmet', playerId: 'p1', itemId: 'iron_helmet', item: ITEMS['iron_helmet']!, quantity: 1, equipped: true },
      { id: 'inv_vest', playerId: 'p1', itemId: 'vest', item: ITEMS['vest']!, quantity: 1, equipped: true },
      { id: 'inv_chain_legs', playerId: 'p1', itemId: 'chain_legs', item: ITEMS['chain_legs']!, quantity: 1, equipped: true },
      { id: 'inv_hide_boots', playerId: 'p1', itemId: 'hide_boots', item: ITEMS['hide_boots']!, quantity: 1, equipped: true },
    ]

    // Replicate the defense slot sum logic (H6) as used in combat.ts
    let totalDefense = 0
    for (const slot of ['Head', 'Chest', 'Legs', 'Feet'] as const) {
      const equippedId = player[`equippedArmor${slot}` as keyof typeof player] as string | undefined
      if (equippedId) {
        const inv = inventory.find((i) => i.id === equippedId)
        if (inv) totalDefense += inv.item.defense ?? 0
      }
    }

    expect(totalDefense).toBe(6)  // 1 + 2 + 2 + 1
  })

  // ----------------------------------------------------------
  // Test H6-4: Item without armorSlot defaults to chest (backward compat)
  // ----------------------------------------------------------
  it('H6-4: armor without armorSlot defaults to chest slot on equip', async () => {
    // bare_plate has no armorSlot field — should route to chest
    const player = makeSlotPlayer()

    stubEquipFresh('bare_plate')
    await realEquipItem('p1', 'bare_plate', player)

    // Should be placed in chest slot
    expect(player.equippedArmorChest).toBe('inv_bare_plate')
    // Other slots should remain unset
    expect(player.equippedArmorHead).toBeUndefined()
    expect(player.equippedArmorLegs).toBeUndefined()
    expect(player.equippedArmorFeet).toBeUndefined()
  })

  // ----------------------------------------------------------
  // Test H6-5: Stat bonuses from all 4 slots compose correctly (H4+H6 integration)
  // grit_helm (+grit:2, head) + reflex_boots (+reflex:3, feet) both equipped
  // ----------------------------------------------------------
  it('H6-5: stat bonuses from multiple armor slots compose correctly (H4 integration)', async () => {
    const player = makeSlotPlayer({ grit: 5, reflex: 4 })

    // Equip grit_helm (head slot, +grit:2) — no existing head armor
    stubEquipFresh('grit_helm')
    await realEquipItem('p1', 'grit_helm', player)

    expect(player.equippedArmorHead).toBe('inv_grit_helm')
    expect(player.grit).toBe(7)    // 5 + 2
    expect(player.reflex).toBe(4)  // unchanged

    // Equip reflex_boots (feet slot, +reflex:3) — no existing feet armor
    stubEquipFresh('reflex_boots')
    await realEquipItem('p1', 'reflex_boots', player)

    expect(player.equippedArmorFeet).toBe('inv_reflex_boots')
    expect(player.grit).toBe(7)    // still 7 (head slot unchanged)
    expect(player.reflex).toBe(7)  // 4 + 3
  })
})
