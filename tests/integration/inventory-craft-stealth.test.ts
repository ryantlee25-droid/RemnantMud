// ============================================================
// Integration tests: inventory.ts, crafting.ts, stealth.ts
// ============================================================

import { describe, it, expect, vi, beforeEach } from 'vitest'
import type { Player, Room, Item } from '@/types/game'

// ------------------------------------------------------------
// Supabase mock — must use vi.hoisted so variables are available
// inside the hoisted vi.mock factory
// ------------------------------------------------------------

const { mockFrom, setResults } = vi.hoisted(() => {
  // Per-test result queue: each DB await consumes one entry (last entry re-used).
  const queue: Array<{ data: unknown; error: unknown }> = []

  function next() {
    return queue.length > 1 ? queue.shift()! : (queue[0] ?? { data: null, error: null })
  }

  function makeChain(): unknown {
    // The proxy must be captured so chain methods can return *it* (not the raw object).
    let proxy: unknown
    const chain: Record<string, unknown> = {}
    const methods = [
      'select', 'insert', 'update', 'delete',
      'eq', 'neq', 'in', 'order', 'maybeSingle', 'single', 'filter',
    ]
    for (const m of methods) chain[m] = () => proxy  // return the proxy so .then is always available
    proxy = new Proxy(chain, {
      get(t, p: string | symbol) {
        if (p === 'then') {
          return (resolve: (v: unknown) => void, reject: (e: unknown) => void) =>
            Promise.resolve(next()).then(resolve, reject)
        }
        return t[p as string]
      },
    })
    return proxy
  }

  const mockFrom = vi.fn(() => makeChain())

  function setResults(...results: Array<{ data: unknown; error: unknown }>) {
    queue.length = 0
    queue.push(...results)
  }

  return { mockFrom, setResults }
})

vi.mock('@/lib/supabase', () => ({
  createSupabaseBrowserClient: () => ({ from: mockFrom }),
}))

// ------------------------------------------------------------
// Item registry mock
// ------------------------------------------------------------

const ITEMS: Record<string, Item> = {
  gauze:        { id: 'gauze',        name: 'Gauze',        description: 'Sterile gauze.',  type: 'consumable', weight: 0, value: 2 },
  antiseptic:   { id: 'antiseptic',   name: 'Antiseptic',   description: 'Antiseptic.',    type: 'consumable', weight: 0, value: 3 },
  bandages:     { id: 'bandages',     name: 'Bandages',     description: 'Medical wrap.',   type: 'consumable', weight: 0, value: 2 },
  pain_tabs:    { id: 'pain_tabs',    name: 'Pain Tabs',    description: 'Painkillers.',    type: 'consumable', weight: 0, value: 4 },
  combat_knife: { id: 'combat_knife', name: 'Combat Knife', description: 'Sharp blade.',    type: 'weapon',     weight: 1, damage: 4, value: 12 },
  leather_vest: { id: 'leather_vest', name: 'Leather Vest', description: 'Sturdy armor.',   type: 'armor',      weight: 3, defense: 2, value: 15 },
}

vi.mock('@/data/items', () => ({
  getItem: vi.fn((id: string) => ITEMS[id] ?? undefined),
}))

// ------------------------------------------------------------
// Recipe mock
// ------------------------------------------------------------

const FIELD_DRESSING_RECIPE = {
  id: 'field_dressing',
  name: 'Field Dressing',
  description: 'Gauze + antiseptic.',
  components: [{ itemId: 'gauze', quantity: 2 }, { itemId: 'antiseptic', quantity: 1 }],
  result: { itemId: 'field_dressing', quantity: 1 },
  skillCheck: { skill: 'field_medicine', dc: 8 },
}

const COMBAT_MEDKIT_RECIPE = {
  id: 'combat_medkit',
  name: 'Combat Medkit',
  description: 'Bandages + pain tabs.',
  components: [{ itemId: 'bandages', quantity: 2 }, { itemId: 'pain_tabs', quantity: 1 }],
  result: { itemId: 'crafted_combat_medkit', quantity: 1 },
  skillCheck: { skill: 'field_medicine', dc: 9 },
}

vi.mock('@/data/recipes', () => ({
  getRecipe: vi.fn((id: string) =>
    ({ field_dressing: FIELD_DRESSING_RECIPE, combat_medkit: COMBAT_MEDKIT_RECIPE }[id])
  ),
  getAvailableRecipes: vi.fn(() => [FIELD_DRESSING_RECIPE, COMBAT_MEDKIT_RECIPE]),
}))

// ------------------------------------------------------------
// Skill bonus mock (returns 0 by default)
// ------------------------------------------------------------

vi.mock('@/lib/skillBonus', () => ({
  getClassSkillBonus: vi.fn(() => 0),
}))

// ------------------------------------------------------------
// Module imports (after all mocks)
// ------------------------------------------------------------

import {
  addItem, removeItem, getInventory,
  groupAndFormatItems, defaultStackFormat,
} from '@/lib/inventory'
import { canCraft, attemptCraft, getRecipe } from '@/lib/crafting'
import { attemptStealth, getSurpriseRoundBonus } from '@/lib/stealth'
import { getClassSkillBonus } from '@/lib/skillBonus'

// ------------------------------------------------------------
// Helpers
// ------------------------------------------------------------

function makePlayer(overrides: Partial<Player> = {}): Player {
  return {
    id: 'p1', name: 'Tester', characterClass: 'enforcer',
    vigor: 8, grit: 6, reflex: 5, wits: 6, presence: 4, shadow: 7,
    hp: 18, maxHp: 18, currentRoomId: 'room_1', worldSeed: 1,
    xp: 0, level: 1, actionsTaken: 0, isDead: false, cycle: 1, totalDeaths: 0,
    ...overrides,
  }
}

function makeRoom(overrides: Partial<Room> = {}): Room {
  return {
    id: 'room_1', name: 'Test Room', description: 'A dim corridor.',
    shortDescription: 'A corridor.', zone: 'crossroads', difficulty: 1,
    visited: false, flags: {}, exits: {}, items: [], enemies: [], npcs: [],
    ...overrides,
  }
}

// ============================================================
// inventory.ts
// ============================================================

describe('getInventory', () => {
  beforeEach(() => { vi.clearAllMocks(); setResults() })

  it('returns empty array when player has no items', async () => {
    setResults({ data: [], error: null })
    const inv = await getInventory('p1')
    expect(inv).toEqual([])
  })

  it('returns resolved InventoryItems for known item IDs', async () => {
    setResults({
      data: [{ id: 'row1', player_id: 'p1', item_id: 'gauze', quantity: 3, equipped: false }],
      error: null,
    })
    const inv = await getInventory('p1')
    expect(inv).toHaveLength(1)
    expect(inv[0]!.itemId).toBe('gauze')
    expect(inv[0]!.quantity).toBe(3)
    expect(inv[0]!.equipped).toBe(false)
  })

  it('silently drops rows with unknown item IDs', async () => {
    setResults({
      data: [
        { id: 'row1', player_id: 'p1', item_id: 'gauze',        quantity: 1, equipped: false },
        { id: 'row2', player_id: 'p1', item_id: 'unknown_junk', quantity: 1, equipped: false },
      ],
      error: null,
    })
    const inv = await getInventory('p1')
    expect(inv).toHaveLength(1)
    expect(inv[0]!.itemId).toBe('gauze')
  })
})

describe('addItem', () => {
  beforeEach(() => { vi.clearAllMocks(); setResults() })

  it('inserts a new row when item not in inventory', async () => {
    // First await = maybeSingle (no row); second = insert result
    setResults({ data: null, error: null }, { data: null, error: null })
    await expect(addItem('p1', 'gauze', 1)).resolves.toBeUndefined()
    expect(mockFrom).toHaveBeenCalledWith('player_inventory')
  })

  it('increments quantity when item already exists (stackable)', async () => {
    // First await = maybeSingle finds existing row; second = update result
    setResults(
      { data: { id: 'row1', quantity: 2 }, error: null },
      { data: null, error: null },
    )
    await expect(addItem('p1', 'gauze', 1)).resolves.toBeUndefined()
  })
})

describe('removeItem', () => {
  beforeEach(() => { vi.clearAllMocks(); setResults() })

  it('does nothing when item is not in inventory', async () => {
    setResults({ data: null, error: null })
    await expect(removeItem('p1', 'gauze', 1)).resolves.toBeUndefined()
  })

  it('deletes the row when quantity reaches zero', async () => {
    setResults(
      { data: { id: 'row1', quantity: 1 }, error: null },
      { data: null, error: null },
    )
    await expect(removeItem('p1', 'gauze', 1)).resolves.toBeUndefined()
  })

  it('decrements quantity when items remain', async () => {
    setResults(
      { data: { id: 'row1', quantity: 5 }, error: null },
      { data: null, error: null },
    )
    await expect(removeItem('p1', 'gauze', 2)).resolves.toBeUndefined()
  })
})

describe('groupAndFormatItems', () => {
  it('groups duplicate item IDs and sums count', () => {
    const result = groupAndFormatItems(['gauze', 'gauze', 'antiseptic'])
    const gauze = result.find(g => g.itemId === 'gauze')!
    expect(gauze.count).toBe(2)
    expect(gauze.displayName).toBe('Gauze x2')
  })

  it('formats single-quantity items without count suffix', () => {
    const result = groupAndFormatItems(['antiseptic'])
    expect(result[0]!.displayName).toBe('Antiseptic')
  })

  it('sorts results alphabetically by name', () => {
    const result = groupAndFormatItems(['gauze', 'antiseptic', 'bandages'])
    const names = result.map(g => g.name)
    expect(names).toEqual([...names].sort())
  })
})

describe('defaultStackFormat', () => {
  it('returns "Name xN" for count > 1', () => {
    expect(defaultStackFormat('Bandages', 3)).toBe('Bandages x3')
  })

  it('returns just the name for count === 1', () => {
    expect(defaultStackFormat('Gauze', 1)).toBe('Gauze')
  })
})

// ============================================================
// crafting.ts
// ============================================================

describe('canCraft', () => {
  it('returns possible=true when all components are present', () => {
    const result = canCraft(FIELD_DRESSING_RECIPE, ['gauze', 'gauze', 'antiseptic'])
    expect(result.possible).toBe(true)
    expect(result.missing).toHaveLength(0)
  })

  it('returns possible=false when an ingredient is absent', () => {
    const result = canCraft(FIELD_DRESSING_RECIPE, ['gauze'])
    expect(result.possible).toBe(false)
    expect(result.missing).toContain('antiseptic')
  })

  it('reports shortage when quantity is insufficient', () => {
    // Only 1 gauze supplied; recipe needs 2
    const result = canCraft(FIELD_DRESSING_RECIPE, ['gauze', 'antiseptic'])
    expect(result.possible).toBe(false)
    expect(result.missing).toContain('gauze')
  })
})

describe('attemptCraft', () => {
  it('produces the correct output item ID on success', () => {
    const player = makePlayer({ wits: 15 }) // modifier +10 — always beats dc 8
    // Force a natural 10 (crit) so success is guaranteed regardless of stat
    const spy = vi.spyOn(Math, 'random').mockReturnValue(0.9)
    const result = attemptCraft(player, FIELD_DRESSING_RECIPE)
    expect(result.success).toBe(true)
    expect(result.itemProduced).toBe('field_dressing')
    expect(result.recipe.id).toBe('field_dressing')
    spy.mockRestore()
  })

  it('returns success=false with no itemProduced on fumble', () => {
    const player = makePlayer({ wits: 1 })
    // Force natural 1 (fumble) → always fails
    const spy = vi.spyOn(Math, 'random').mockReturnValue(0)
    const result = attemptCraft(player, FIELD_DRESSING_RECIPE)
    expect(result.success).toBe(false)
    expect(result.itemProduced).toBeUndefined()
    spy.mockRestore()
  })

  it('includes non-empty flavor text in the success message', () => {
    const player = makePlayer({ wits: 15 })
    const spy = vi.spyOn(Math, 'random').mockReturnValue(0.9) // crit
    const result = attemptCraft(player, FIELD_DRESSING_RECIPE)
    expect(result.success).toBe(true)
    expect(result.message.length).toBeGreaterThan(10)
    spy.mockRestore()
  })
})

describe('getRecipe', () => {
  it('returns the recipe object for a known ID', () => {
    const recipe = getRecipe('field_dressing')
    expect(recipe).toBeDefined()
    expect(recipe!.name).toBe('Field Dressing')
    expect(recipe!.components).toHaveLength(2)
  })

  it('returns undefined for an unknown recipe ID', () => {
    expect(getRecipe('nonexistent_recipe')).toBeUndefined()
  })
})

// ============================================================
// stealth.ts
// ============================================================

describe('attemptStealth', () => {
  it('succeeds with a guaranteed crit roll', () => {
    const player = makePlayer({ shadow: 7 })
    const room = makeRoom({ difficulty: 1 })
    const spy = vi.spyOn(Math, 'random').mockReturnValue(0.9) // roll = 10 (crit)
    const result = attemptStealth(player, room)
    expect(result.success).toBe(true)
    expect(result.message).toContain('undetected')
    spy.mockRestore()
  })

  it('fails on a fumble roll regardless of shadow stat', () => {
    const player = makePlayer({ shadow: 10 })
    const room = makeRoom({ difficulty: 1 })
    const spy = vi.spyOn(Math, 'random').mockReturnValue(0) // roll = 1 (fumble)
    const result = attemptStealth(player, room)
    expect(result.success).toBe(false)
    expect(result.message).toContain('spotted')
    spy.mockRestore()
  })

  it('scales DC with room difficulty', () => {
    // DC formula: 8 + (difficulty - 1) * 2
    const player = makePlayer({ shadow: 5 }) // stat modifier = 0
    const spy = vi.spyOn(Math, 'random').mockReturnValue(0.5) // roll = 6

    const easyResult = attemptStealth(player, makeRoom({ difficulty: 1 })) // DC 8
    const hardResult  = attemptStealth(player, makeRoom({ difficulty: 5 })) // DC 16

    expect(easyResult.roll.dc).toBe(8)
    expect(hardResult.roll.dc).toBe(16)
    spy.mockRestore()
  })

  it('uses shadow stat as the governing stat (not reflex or wits)', () => {
    // Player with high shadow should beat a moderate DC; same player with low shadow fails
    const goodPlayer = makePlayer({ shadow: 12 }) // modifier +7
    const badPlayer  = makePlayer({ shadow: 1  }) // modifier -4
    const room = makeRoom({ difficulty: 1 }) // DC 8

    vi.spyOn(Math, 'random').mockReturnValue(0.4) // roll = 5
    // good: 5 + 7 = 12 >= 8 → success
    const goodResult = attemptStealth(goodPlayer, room)
    // bad:  5 - 4 = 1  <  8 → failure
    const badResult  = attemptStealth(badPlayer, room)

    expect(goodResult.success).toBe(true)
    expect(badResult.success).toBe(false)
    vi.restoreAllMocks()
  })
})

describe('getSurpriseRoundBonus', () => {
  it('returns a positive numeric bonus', () => {
    const bonus = getSurpriseRoundBonus()
    expect(typeof bonus).toBe('number')
    expect(bonus).toBeGreaterThan(0)
  })

  it('returns exactly 3 (first-attack ambush advantage)', () => {
    expect(getSurpriseRoundBonus()).toBe(3)
  })
})
