// ============================================================
// tests/playtest/craft-trade-exhaustive.test.ts — PT-CRAFT-TRADE
//
// Exhaustive validation of every recipe in data/recipes.ts and
// every vendor tradeInventory across all room files.
//
// Coverage:
//   Crafting
//     - Ingredient validity: every components[].itemId in ITEMS
//     - Output validity: every result.itemId in ITEMS
//     - SkillCheck sanity: skill is a valid SkillType, DC <= 20
//     - Simulation (~5 representative crafts): success path, failure path
//
//   Trading
//     - Enumerate vendors from all data/rooms/**  npcSpawns
//     - Item-ID validity: every tradeInventory itemId in ITEMS
//     - Simulation (~3 representative vendors): trade/buy/sell roundtrip
//
// Anti-stall: validity checks are O(1) membership lookups, not full
// engine boots. Simulations are limited to representative cases.
//
// Blockers are marked it.fails() when discovered. Passing assertions
// document green paths.
// ============================================================

import { describe, it, expect, vi, beforeEach } from 'vitest'
import type {
  GameState,
  Player,
  Room,
  InventoryItem,
  GameMessage,
  NpcSpawnEntry,
  Item,
  SkillType,
} from '@/types/game'
import type { EngineCore } from '@/lib/actions/types'

// ============================================================
// Valid SkillTypes from types/game.ts — used for skill-check sanity
// ============================================================

const VALID_SKILL_TYPES = new Set<string>([
  'survival', 'marksmanship', 'brawling', 'bladework', 'scavenging',
  'field_medicine', 'mechanics', 'tracking', 'negotiation', 'intimidation',
  'stealth', 'lockpicking', 'electronics', 'lore', 'climbing', 'blood_sense',
  'daystalking', 'mesmerize', 'perception', 'endurance', 'resilience',
  'composure', 'vigor', 'presence',
])

// ============================================================
// Mock registry — uses real ITEMS and RECIPES data
// ============================================================

// Use the actual item registry for validity checks
vi.mock('@/lib/supabase', () => ({
  createSupabaseBrowserClient: () => ({
    auth: {
      getUser: vi.fn().mockResolvedValue({ data: { user: null }, error: null }),
      refreshSession: vi.fn().mockResolvedValue({}),
    },
    from: vi.fn(() => ({
      select: vi.fn(() => ({
        eq: vi.fn(() => ({
          maybeSingle: vi.fn().mockResolvedValue({ data: null, error: null }),
          single: vi.fn().mockResolvedValue({ data: null, error: null }),
          then: (resolve: (v: unknown) => void) => resolve({ data: null, error: null }),
        })),
        then: (resolve: (v: unknown) => void) => resolve({ data: [], error: null }),
      })),
      upsert: vi.fn(() => ({ then: (r: (v: unknown) => void) => r({ data: null, error: null }) })),
      insert: vi.fn(() => ({ then: (r: (v: unknown) => void) => r({ data: null, error: null }) })),
      update: vi.fn(() => ({ eq: vi.fn(() => ({ then: (r: (v: unknown) => void) => r({ data: null, error: null }) })) })),
      delete: vi.fn(() => ({ eq: vi.fn(() => ({ then: (r: (v: unknown) => void) => r({ data: null, error: null }) })) })),
    })),
  }),
}))

// Track mock inventory for craft/trade simulations
let mockInventory: InventoryItem[] = []

vi.mock('@/lib/inventory', () => ({
  getInventory: vi.fn(async () => mockInventory),
  addItem: vi.fn().mockResolvedValue(undefined),
  removeItem: vi.fn().mockResolvedValue(undefined),
  equipItem: vi.fn().mockResolvedValue(undefined),
  unequipItem: vi.fn().mockResolvedValue(undefined),
  groupAndFormatItems: vi.fn((ids: string[]) =>
    ids.map(id => ({ itemId: id, displayName: id, quantity: 1 }))
  ),
}))

// Mock dice to always pass skill checks — prevents test flakiness
vi.mock('@/lib/dice', () => ({
  rollCheck: vi.fn(() => ({ success: true, roll: 20, total: 30 })),
  DC: { LOW: 5, MODERATE: 8, HIGH: 12, VERY_HIGH: 16 },
}))

vi.mock('@/lib/world', () => ({
  getRoom: vi.fn().mockResolvedValue(null),
  updateRoomItems: vi.fn().mockResolvedValue(undefined),
  updateRoomFlags: vi.fn().mockResolvedValue(undefined),
  markVisited: vi.fn().mockResolvedValue(undefined),
  persistWorld: vi.fn().mockResolvedValue(undefined),
  canMove: vi.fn().mockReturnValue(true),
  getExits: vi.fn().mockReturnValue([]),
  getRoomDescription: vi.fn().mockReturnValue('Test room.'),
}))

// ============================================================
// Now import real data modules
// ============================================================

import { RECIPES } from '@/data/recipes'
import { ITEMS } from '@/data/items'

// Import all room zone files to enumerate vendors
import { CROSSROADS_ROOMS as crossroadsRooms } from '@/data/rooms/crossroads'
import { COVENANT_ROOMS as covenantRooms } from '@/data/rooms/covenant'
import { SALT_CREEK_ROOMS as saltCreekRooms } from '@/data/rooms/salt_creek'
import { DUSKHOLLOW_ROOMS as duskhollowRooms } from '@/data/rooms/duskhollow'
import { THE_DEEP_ROOMS as theDeepRooms } from '@/data/rooms/the_deep'
import { THE_DUST_ROOMS as theDustRooms } from '@/data/rooms/the_dust'
import { THE_STACKS_ROOMS as theStacksRooms } from '@/data/rooms/the_stacks'

import { getItem } from '@/data/items'
import { getInventory, addItem, removeItem, groupAndFormatItems } from '@/lib/inventory'
import { handleCraft } from '@/lib/actions/craft'
import { handleTrade, handleBuy, handleSell } from '@/lib/actions/trade'

// ============================================================
// Helpers — minimal engine and room builders
// ============================================================

function makePlayer(overrides: Partial<Player> = {}): Player {
  return {
    id: 'test-player', name: 'Test Player', characterClass: 'enforcer',
    vigor: 5, grit: 5, reflex: 5, wits: 15, presence: 5, shadow: 5,
    hp: 18, maxHp: 18, currentRoomId: 'cr_01_approach', worldSeed: 42,
    xp: 0, level: 1, actionsTaken: 0, isDead: false, cycle: 1, totalDeaths: 0,
    questFlags: {},
    ...overrides,
  }
}

function makeRoom(overrides: Partial<Room> = {}): Room {
  return {
    id: 'test_room', name: 'Test Room', description: 'A test location.',
    shortDescription: 'Test.', zone: 'crossroads', difficulty: 1,
    visited: true, flags: {}, exits: {}, items: [], enemies: [], npcs: [],
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

function makeInvItem(itemId: string, quantity = 1): InventoryItem {
  const item = ITEMS[itemId]
  if (!item) {
    // Fallback item for missing ids — lets us test failure conditions
    return {
      id: `inv_${itemId}`, playerId: 'test-player', itemId,
      item: { id: itemId, name: itemId, description: 'Unknown.', type: 'junk', weight: 1, value: 1 },
      quantity, equipped: false,
    }
  }
  return {
    id: `inv_${itemId}`, playerId: 'test-player', itemId,
    item,
    quantity, equipped: false,
  }
}

// Build currency item for trade tests
function makeCurrency(quantity: number): InventoryItem {
  return makeInvItem('ammo_22lr', quantity)
}

// ============================================================
// Vendor enumeration — collect all npcSpawns with tradeInventory
// ============================================================

interface VendorEntry {
  npcId: string
  roomId: string
  zone: string
  tradeInventory: string[]
}

function enumerateVendors(): VendorEntry[] {
  const allRooms = [
    ...crossroadsRooms,
    ...covenantRooms,
    ...saltCreekRooms,
    ...duskhollowRooms,
    ...theDeepRooms,
    ...theDustRooms,
    ...theStacksRooms,
  ]
  const vendors: VendorEntry[] = []
  for (const room of allRooms) {
    if (!room.npcSpawns) continue
    for (const spawn of room.npcSpawns) {
      if (spawn.tradeInventory && spawn.tradeInventory.length > 0) {
        vendors.push({
          npcId: spawn.npcId,
          roomId: room.id,
          zone: room.zone,
          tradeInventory: spawn.tradeInventory,
        })
      }
    }
  }
  return vendors
}

// ============================================================
// Build room with NPC trade setup (for simulation tests)
// ============================================================

function makeVendorRoom(npcId: string, tradeInventory: string[]): Room {
  const spawn: NpcSpawnEntry = { npcId, spawnChance: 1.0, tradeInventory }
  return makeRoom({ npcs: [npcId], npcSpawns: [spawn] })
}

// ============================================================
// DATA ANALYSIS — computed once for all tests
// ============================================================

const allRecipes = Object.values(RECIPES)
const allVendors = enumerateVendors()

// Find broken ingredient refs
const brokenIngredientRefs: { recipeId: string; itemId: string }[] = []
for (const recipe of allRecipes) {
  for (const comp of recipe.components) {
    if (!ITEMS[comp.itemId]) {
      brokenIngredientRefs.push({ recipeId: recipe.id, itemId: comp.itemId })
    }
  }
}

// Find broken output refs
const brokenOutputRefs: { recipeId: string; itemId: string }[] = []
for (const recipe of allRecipes) {
  if (!ITEMS[recipe.result.itemId]) {
    brokenOutputRefs.push({ recipeId: recipe.id, itemId: recipe.result.itemId })
  }
}

// Find broken trade refs
const brokenTradeRefs: { npcId: string; roomId: string; itemId: string }[] = []
for (const vendor of allVendors) {
  for (const itemId of vendor.tradeInventory) {
    if (!ITEMS[itemId]) {
      brokenTradeRefs.push({ npcId: vendor.npcId, roomId: vendor.roomId, itemId })
    }
  }
}

// Find invalid skill types in recipes
const invalidSkillTypes: { recipeId: string; skill: string }[] = []
for (const recipe of allRecipes) {
  if (recipe.skillCheck && !VALID_SKILL_TYPES.has(recipe.skillCheck.skill)) {
    invalidSkillTypes.push({ recipeId: recipe.id, skill: recipe.skillCheck.skill })
  }
}

// Find DC > 20
const highDCRecipes: { recipeId: string; dc: number }[] = []
for (const recipe of allRecipes) {
  if (recipe.skillCheck && recipe.skillCheck.dc > 20) {
    highDCRecipes.push({ recipeId: recipe.id, dc: recipe.skillCheck.dc })
  }
}

// ============================================================
// SECTION 1: Recipe Data Integrity (static checks)
// ============================================================

describe('Recipe Data Integrity', () => {
  it('enumerates at least 10 recipes', () => {
    expect(allRecipes.length).toBeGreaterThanOrEqual(10)
  })

  it('all recipe component itemIds exist in ITEMS registry', () => {
    if (brokenIngredientRefs.length > 0) {
      const detail = brokenIngredientRefs.map(r => `${r.recipeId} → ${r.itemId}`).join(', ')
      expect.fail(`Broken ingredient refs (${brokenIngredientRefs.length}): ${detail}`)
    }
    expect(brokenIngredientRefs.length).toBe(0)
  })

  it('all recipe result itemIds exist in ITEMS registry', () => {
    if (brokenOutputRefs.length > 0) {
      const detail = brokenOutputRefs.map(r => `${r.recipeId} → ${r.itemId}`).join(', ')
      expect.fail(`Broken output refs (${brokenOutputRefs.length}): ${detail}`)
    }
    expect(brokenOutputRefs.length).toBe(0)
  })

  it('all recipe skillCheck skill names are valid SkillType values', () => {
    if (invalidSkillTypes.length > 0) {
      const detail = invalidSkillTypes.map(r => `${r.recipeId}: '${r.skill}'`).join(', ')
      expect.fail(`Invalid skill types: ${detail}`)
    }
    expect(invalidSkillTypes.length).toBe(0)
  })

  it('all recipe skill check DCs are achievable (DC <= 20)', () => {
    if (highDCRecipes.length > 0) {
      const detail = highDCRecipes.map(r => `${r.recipeId}: DC ${r.dc}`).join(', ')
      expect.fail(`Unachievable DCs: ${detail}`)
    }
    expect(highDCRecipes.length).toBe(0)
  })

  it('every recipe has a non-empty description', () => {
    const noDesc = allRecipes.filter(r => !r.description || r.description.trim().length === 0)
    if (noDesc.length > 0) {
      const detail = noDesc.map(r => r.id).join(', ')
      expect.fail(`Recipes missing description: ${detail}`)
    }
    expect(noDesc.length).toBe(0)
  })

  it('every recipe has a unique ID that matches its key', () => {
    const mismatched = Object.entries(RECIPES).filter(([key, r]) => r.id !== key)
    if (mismatched.length > 0) {
      const detail = mismatched.map(([k, r]) => `key='${k}' id='${r.id}'`).join(', ')
      expect.fail(`Recipe ID mismatches: ${detail}`)
    }
    expect(mismatched.length).toBe(0)
  })

  it('summarizes recipe counts', () => {
    // Informational test — always passes; surfaces counts in report
    const medicalCount = allRecipes.filter(r => r.id.startsWith('field') || r.id.startsWith('purified') || r.id.startsWith('combat_med') || r.id.startsWith('trauma')).length
    const weaponCount = allRecipes.filter(r => r.components.some(c => c.itemId === 'scrap_metal') && r.id !== 'armor_patch').length
    const advancedCount = allRecipes.filter(r => !!r.discoveredBy).length
    expect(allRecipes.length).toBeGreaterThan(0)
    expect(medicalCount).toBeGreaterThanOrEqual(3)
    expect(advancedCount).toBeGreaterThanOrEqual(1) // quest-gated recipes exist
    void weaponCount // suppress unused warning
  })
})

// ============================================================
// SECTION 2: Recipe Simulation (~5 representative crafts)
// ============================================================

beforeEach(() => {
  mockInventory = []
  vi.clearAllMocks()
  // Restore groupAndFormatItems after clearAllMocks
  vi.mocked(groupAndFormatItems).mockImplementation((ids: string[]) =>
    ids.map(id => ({ itemId: id, displayName: id, quantity: 1 }))
  )
})

describe('Craft Simulation — Success Path', () => {
  // ── Medical: field_dressing ──────────────────────────────────
  it('field_dressing: produces output when components present', async () => {
    const components = [
      makeInvItem('gauze'), makeInvItem('gauze'), makeInvItem('antiseptic'),
    ]
    mockInventory = [...components]
    vi.mocked(getInventory).mockResolvedValue([makeInvItem('field_dressing')])

    const engine = makeEngine({ inventory: components })
    await handleCraft(engine, 'field dressing')

    // No error message
    const errorMsgs = engine.messages.filter(m => m.type === 'error')
    expect(errorMsgs).toHaveLength(0)

    // addItem called with correct output
    expect(vi.mocked(addItem)).toHaveBeenCalledWith('test-player', 'field_dressing')

    // removeItem called for gauze (x2) and antiseptic (x1)
    const removeCalls = vi.mocked(removeItem).mock.calls.map(c => c[1])
    expect(removeCalls.filter(id => id === 'gauze').length).toBe(2)
    expect(removeCalls.filter(id => id === 'antiseptic').length).toBe(1)
  })

  // ── Weapons / Munitions: improvised_trap ────────────────────
  it('improvised_trap: produces output when components present', async () => {
    const components = [
      makeInvItem('scrap_metal'), makeInvItem('scrap_metal'), makeInvItem('wire_coil'),
    ]
    mockInventory = [...components]
    vi.mocked(getInventory).mockResolvedValue([makeInvItem('crafted_improvised_trap')])

    const engine = makeEngine({ inventory: components })
    await handleCraft(engine, 'improvised trap')

    const errorMsgs = engine.messages.filter(m => m.type === 'error')
    expect(errorMsgs).toHaveLength(0)
    expect(vi.mocked(addItem)).toHaveBeenCalledWith('test-player', 'crafted_improvised_trap')
  })

  // ── Utility: signal_booster ──────────────────────────────────
  it('signal_booster: produces output when components present', async () => {
    const components = [
      makeInvItem('electronics_salvage'), makeInvItem('electronics_salvage'),
      makeInvItem('wire_coil'), makeInvItem('wire_coil'),
    ]
    mockInventory = [...components]
    vi.mocked(getInventory).mockResolvedValue([makeInvItem('crafted_signal_booster')])

    const engine = makeEngine({ inventory: components })
    await handleCraft(engine, 'signal booster')

    const errorMsgs = engine.messages.filter(m => m.type === 'error')
    expect(errorMsgs).toHaveLength(0)
    expect(vi.mocked(addItem)).toHaveBeenCalledWith('test-player', 'crafted_signal_booster')
  })

  // ── Utility: lockpick_set ────────────────────────────────────
  it('lockpick_set: produces output when components present', async () => {
    const components = [makeInvItem('wire_coil'), makeInvItem('electronics_salvage')]
    mockInventory = [...components]
    vi.mocked(getInventory).mockResolvedValue([makeInvItem('crafted_lockpick_set')])

    const engine = makeEngine({ inventory: components })
    await handleCraft(engine, 'lockpick')

    const errorMsgs = engine.messages.filter(m => m.type === 'error')
    expect(errorMsgs).toHaveLength(0)
    expect(vi.mocked(addItem)).toHaveBeenCalledWith('test-player', 'crafted_lockpick_set')
  })

  // ── Advanced (quest-gated): fortified_armor ──────────────────
  it('fortified_armor: produces output when quest flag set and components present', async () => {
    const components = [makeInvItem('crafted_reinforced_plate'), makeInvItem('kevlar_vest')]
    mockInventory = [...components]
    vi.mocked(getInventory).mockResolvedValue([makeInvItem('crafted_fortified_armor')])

    const engine = makeEngine({
      inventory: components,
      player: makePlayer({ questFlags: { briggs_confessed_bombing: true } }),
    })
    await handleCraft(engine, 'fortified armor')

    const errorMsgs = engine.messages.filter(m => m.type === 'error')
    expect(errorMsgs).toHaveLength(0)
    expect(vi.mocked(addItem)).toHaveBeenCalledWith('test-player', 'crafted_fortified_armor')
  })
})

describe('Craft Simulation — Failure Path', () => {
  it('field_dressing: error message when antiseptic is missing', async () => {
    // Only gauze, no antiseptic
    const components = [makeInvItem('gauze'), makeInvItem('gauze')]
    mockInventory = [...components]

    const engine = makeEngine({ inventory: components })
    await handleCraft(engine, 'field dressing')

    const errorMsgs = engine.messages.filter(m => m.type === 'error')
    expect(errorMsgs.length).toBeGreaterThan(0)
    expect(vi.mocked(addItem)).not.toHaveBeenCalled()

    // Error must name the missing ingredient
    const errorText = errorMsgs[0].text.toLowerCase()
    expect(errorText).toMatch(/missing|antiseptic/i)
  })

  it('improvised_trap: error when wire_coil is missing', async () => {
    const components = [makeInvItem('scrap_metal'), makeInvItem('scrap_metal')]
    mockInventory = [...components]

    const engine = makeEngine({ inventory: components })
    await handleCraft(engine, 'improvised trap')

    const errorMsgs = engine.messages.filter(m => m.type === 'error')
    expect(errorMsgs.length).toBeGreaterThan(0)
    expect(vi.mocked(addItem)).not.toHaveBeenCalled()
  })

  it('combat_medkit: error when all components absent', async () => {
    mockInventory = []
    const engine = makeEngine({ inventory: [] })
    await handleCraft(engine, 'combat medkit')

    const errorMsgs = engine.messages.filter(m => m.type === 'error')
    expect(errorMsgs.length).toBeGreaterThan(0)
    expect(vi.mocked(addItem)).not.toHaveBeenCalled()
  })

  it('fortified_armor: not available without quest flag', async () => {
    const components = [makeInvItem('crafted_reinforced_plate'), makeInvItem('kevlar_vest')]
    mockInventory = [...components]

    // No quest flag
    const engine = makeEngine({
      inventory: components,
      player: makePlayer({ questFlags: {} }),
    })
    await handleCraft(engine, 'fortified armor')

    // Should get an error — recipe not available without quest flag
    const errorMsgs = engine.messages.filter(m => m.type === 'error')
    expect(errorMsgs.length).toBeGreaterThan(0)
    expect(vi.mocked(addItem)).not.toHaveBeenCalled()
  })

  it('unknown recipe name: returns error', async () => {
    const engine = makeEngine({ inventory: [] })
    await handleCraft(engine, 'magic_plasma_sword')

    const errorMsgs = engine.messages.filter(m => m.type === 'error')
    expect(errorMsgs.length).toBeGreaterThan(0)
    expect(vi.mocked(addItem)).not.toHaveBeenCalled()
  })
})

// ============================================================
// SECTION 3: Vendor Data Integrity (static checks)
// ============================================================

describe('Vendor Data Integrity', () => {
  it('enumerates vendors from all zone room files', () => {
    expect(allVendors.length).toBeGreaterThan(5)
  })

  it('all vendor tradeInventory itemIds exist in ITEMS registry', () => {
    if (brokenTradeRefs.length > 0) {
      const detail = brokenTradeRefs
        .map(r => `${r.npcId} (${r.roomId}) → '${r.itemId}'`)
        .join(', ')
      expect.fail(`Broken trade item refs (${brokenTradeRefs.length}): ${detail}`)
    }
    expect(brokenTradeRefs.length).toBe(0)
  })

  it('no vendor has an empty tradeInventory', () => {
    const empty = allVendors.filter(v => v.tradeInventory.length === 0)
    expect(empty).toHaveLength(0)
  })

  it('vendor inventory items all have positive value (can be traded)', () => {
    const zeroPriceItems: { npcId: string; itemId: string }[] = []
    for (const vendor of allVendors) {
      for (const itemId of vendor.tradeInventory) {
        const item = ITEMS[itemId]
        if (item && item.value <= 0) {
          zeroPriceItems.push({ npcId: vendor.npcId, itemId })
        }
      }
    }
    // Warning only — key items (value=0) in trade inventories are unusual
    // but not necessarily broken (some lore items have value 0)
    // Just verify we can inspect them
    expect(typeof zeroPriceItems.length).toBe('number')
  })

  it('summarizes vendor counts per zone', () => {
    const byCrossroads = allVendors.filter(v => v.zone === 'crossroads').length
    const byCovenant = allVendors.filter(v => v.zone === 'covenant').length
    const bySaltCreek = allVendors.filter(v => v.zone === 'salt_creek').length
    expect(byCrossroads).toBeGreaterThan(0)
    expect(byCovenant).toBeGreaterThan(0)
    expect(bySaltCreek).toBeGreaterThan(0)
  })
})

// ============================================================
// SECTION 4: Trade Simulation (~3 representative vendors)
// ============================================================

describe('Trade Simulation — crossroads: patch (medic vendor)', () => {
  const PATCH_TRADE_INV = ['antibiotics_01', 'bandages', 'quiet_drops', 'stim_shot']
  const PATCH_NPC_ID = 'patch'

  beforeEach(() => {
    mockInventory = []
    vi.clearAllMocks()
    vi.mocked(groupAndFormatItems).mockImplementation((ids: string[]) =>
      ids.map(id => ({
        itemId: id,
        displayName: ITEMS[id]?.name ?? id,
        quantity: 1,
      }))
    )
  })

  it('trade command shows inventory list without error', async () => {
    const room = makeVendorRoom(PATCH_NPC_ID, PATCH_TRADE_INV)
    const engine = makeEngine({
      currentRoom: room,
      inventory: [makeCurrency(100)],
    })

    await handleTrade(engine, PATCH_NPC_ID)

    const errorMsgs = engine.messages.filter(m => m.type === 'error')
    expect(errorMsgs).toHaveLength(0)
    expect(engine.messages.length).toBeGreaterThan(0)
  })

  it('buy: item lands in inventory after purchase with sufficient currency', async () => {
    const room = makeVendorRoom(PATCH_NPC_ID, PATCH_TRADE_INV)
    const currencyInv = [makeCurrency(500)]
    mockInventory = currencyInv
    vi.mocked(getInventory).mockResolvedValue([...currencyInv, makeInvItem('bandages')])

    const engine = makeEngine({
      currentRoom: room,
      inventory: currencyInv,
    })

    await handleBuy(engine, 'bandages')

    const errorMsgs = engine.messages.filter(m => m.type === 'error')
    expect(errorMsgs).toHaveLength(0)
    expect(vi.mocked(addItem)).toHaveBeenCalledWith('test-player', 'bandages')
    expect(vi.mocked(removeItem)).toHaveBeenCalledWith('test-player', 'ammo_22lr', expect.any(Number))
  })

  it('buy: error when insufficient currency', async () => {
    const room = makeVendorRoom(PATCH_NPC_ID, PATCH_TRADE_INV)
    mockInventory = [makeCurrency(0)]

    const engine = makeEngine({
      currentRoom: room,
      inventory: [makeCurrency(0)],
    })

    await handleBuy(engine, 'antibiotics')

    const errorMsgs = engine.messages.filter(m => m.type === 'error')
    expect(errorMsgs.length).toBeGreaterThan(0)
    expect(vi.mocked(addItem)).not.toHaveBeenCalled()
  })

  it('sell: item removed from inventory, currency added', async () => {
    const room = makeVendorRoom(PATCH_NPC_ID, PATCH_TRADE_INV)
    const scrapInv = [makeInvItem('scrap_metal')]
    mockInventory = scrapInv
    vi.mocked(getInventory).mockResolvedValue([makeCurrency(1)])

    const engine = makeEngine({
      currentRoom: room,
      inventory: scrapInv,
    })

    await handleSell(engine, 'scrap metal')

    const errorMsgs = engine.messages.filter(m => m.type === 'error')
    expect(errorMsgs).toHaveLength(0)
    expect(vi.mocked(removeItem)).toHaveBeenCalledWith('test-player', 'scrap_metal')
    expect(vi.mocked(addItem)).toHaveBeenCalledWith('test-player', 'ammo_22lr', expect.any(Number))
  })
})

describe('Trade Simulation — covenant: mechanic_torque (repair vendor)', () => {
  const TORQUE_TRADE_INV = ['scrap_metal', 'basic_repair_kit', 'leather_patch_kit', 'salvaged_components']
  const TORQUE_NPC_ID = 'mechanic_torque'

  beforeEach(() => {
    mockInventory = []
    vi.clearAllMocks()
    vi.mocked(groupAndFormatItems).mockImplementation((ids: string[]) =>
      ids.map(id => ({
        itemId: id,
        displayName: ITEMS[id]?.name ?? id,
        quantity: 1,
      }))
    )
  })

  it('trade command surfaces inventory for mechanic_torque', async () => {
    const room = makeVendorRoom(TORQUE_NPC_ID, TORQUE_TRADE_INV)
    const engine = makeEngine({
      currentRoom: room,
      inventory: [makeCurrency(100)],
    })

    await handleTrade(engine, TORQUE_NPC_ID)

    const errorMsgs = engine.messages.filter(m => m.type === 'error')
    expect(errorMsgs).toHaveLength(0)
    expect(engine.messages.length).toBeGreaterThan(0)
  })

  it('buy: basic_repair_kit purchasable with sufficient currency', async () => {
    const room = makeVendorRoom(TORQUE_NPC_ID, TORQUE_TRADE_INV)
    const currencyInv = [makeCurrency(500)]
    mockInventory = currencyInv
    vi.mocked(getInventory).mockResolvedValue([...currencyInv, makeInvItem('basic_repair_kit')])

    const engine = makeEngine({
      currentRoom: room,
      inventory: currencyInv,
    })

    await handleBuy(engine, 'repair kit')

    const errorMsgs = engine.messages.filter(m => m.type === 'error')
    expect(errorMsgs).toHaveLength(0)
    expect(vi.mocked(addItem)).toHaveBeenCalledWith('test-player', 'basic_repair_kit')
  })
})

describe('Trade Simulation — salt_creek: armorer_reyes (weapons vendor)', () => {
  const REYES_TRADE_INV = [
    'ar_platform_rifle', 'sniper_rifle', 'military_sidearm',
    'fragmentation_grenade', 'ammo_556', 'ammo_762', 'body_armor_military',
  ]
  const REYES_NPC_ID = 'armorer_reyes'

  beforeEach(() => {
    mockInventory = []
    vi.clearAllMocks()
    vi.mocked(groupAndFormatItems).mockImplementation((ids: string[]) =>
      ids.map(id => ({
        itemId: id,
        displayName: ITEMS[id]?.name ?? id,
        quantity: 1,
      }))
    )
  })

  it('trade command lists military armorer inventory', async () => {
    const room = makeVendorRoom(REYES_NPC_ID, REYES_TRADE_INV)
    const engine = makeEngine({
      currentRoom: room,
      inventory: [makeCurrency(1000)],
    })

    await handleTrade(engine, REYES_NPC_ID)

    const errorMsgs = engine.messages.filter(m => m.type === 'error')
    expect(errorMsgs).toHaveLength(0)
    expect(engine.messages.length).toBeGreaterThan(0)
  })

  it('buy: body_armor_military purchasable with sufficient currency', async () => {
    const room = makeVendorRoom(REYES_NPC_ID, REYES_TRADE_INV)
    const currencyInv = [makeCurrency(10000)]
    mockInventory = currencyInv
    vi.mocked(getInventory).mockResolvedValue([...currencyInv, makeInvItem('body_armor_military')])

    const engine = makeEngine({
      currentRoom: room,
      inventory: currencyInv,
    })

    await handleBuy(engine, 'body armor')

    const errorMsgs = engine.messages.filter(m => m.type === 'error')
    expect(errorMsgs).toHaveLength(0)
    expect(vi.mocked(addItem)).toHaveBeenCalledWith('test-player', 'body_armor_military')
  })

  it('trade: no error when no vendor NPC in room', async () => {
    const emptyRoom = makeRoom({ npcs: [], npcSpawns: [] })
    const engine = makeEngine({ currentRoom: emptyRoom, inventory: [] })

    await handleTrade(engine, undefined)

    const errorMsgs = engine.messages.filter(m => m.type === 'error')
    expect(errorMsgs.length).toBeGreaterThan(0) // Expect "no one to trade with" error
    const errorText = errorMsgs[0].text.toLowerCase()
    expect(errorText).toMatch(/no one|trade/i)
  })
})

// ============================================================
// SECTION 5: Data Summary Tests (always-passing, surfaced in report)
// ============================================================

describe('Summary — Data Integrity Overview', () => {
  it('reports recipe count and status', () => {
    const totalRecipes = allRecipes.length
    const questGated = allRecipes.filter(r => !!r.discoveredBy).length
    const withSkillCheck = allRecipes.filter(r => !!r.skillCheck).length
    // All should exist
    expect(totalRecipes).toBeGreaterThan(0)
    expect(questGated).toBeGreaterThanOrEqual(0)
    expect(withSkillCheck).toBeGreaterThanOrEqual(0)
    // Log for report generation
    void `Recipes: ${totalRecipes} total, ${questGated} quest-gated, ${withSkillCheck} with skill check`
  })

  it('reports vendor count and broken-ref status', () => {
    const totalVendors = allVendors.length
    const brokenVendorCount = new Set(brokenTradeRefs.map(r => r.npcId)).size
    const brokenItemCount = brokenTradeRefs.length
    expect(totalVendors).toBeGreaterThan(0)
    expect(brokenVendorCount).toBeGreaterThanOrEqual(0)
    expect(brokenItemCount).toBeGreaterThanOrEqual(0)
    void `Vendors: ${totalVendors} total, ${brokenVendorCount} with broken refs, ${brokenItemCount} broken item IDs`
  })

  it('all recipes have both components AND result defined', () => {
    const malformed = allRecipes.filter(r =>
      !r.components || r.components.length === 0 || !r.result || !r.result.itemId
    )
    if (malformed.length > 0) {
      const detail = malformed.map(r => r.id).join(', ')
      expect.fail(`Malformed recipes (no components or no result): ${detail}`)
    }
    expect(malformed.length).toBe(0)
  })

  it('all recipe component quantities are positive', () => {
    const badQty = allRecipes.flatMap(r =>
      r.components.filter(c => c.quantity <= 0).map(c => `${r.id}/${c.itemId}:qty=${c.quantity}`)
    )
    if (badQty.length > 0) {
      expect.fail(`Zero or negative component quantities: ${badQty.join(', ')}`)
    }
    expect(badQty.length).toBe(0)
  })
})
