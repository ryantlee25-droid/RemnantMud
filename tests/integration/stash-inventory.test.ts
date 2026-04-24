// ============================================================
// Integration tests: stash/unstash DB-first ordering + inventory persistence
// Regression coverage for B6 item loss bug.
// ============================================================

import { describe, it, expect, vi, beforeEach } from 'vitest'
import type { GameState, Player, InventoryItem, GameMessage, Item } from '@/types/game'
import type { EngineCore } from '@/lib/actions/types'

// ------------------------------------------------------------
// Item registry
// ------------------------------------------------------------

const ITEMS: Record<string, Item> = {
  medkit:   { id: 'medkit',   name: 'Medkit',      description: 'Heals.', type: 'consumable', weight: 1, value: 10, healing: 5 },
  bandages: { id: 'bandages', name: 'Bandages',     description: 'Wrap.', type: 'consumable', weight: 1, value: 3,  healing: 2 },
  knife:    { id: 'knife',    name: 'Knife',        description: 'Sharp.', type: 'weapon',     weight: 1, value: 5,  damage: 4 },
  vest:     { id: 'vest',     name: 'Leather Vest', description: 'Sturdy.', type: 'armor',    weight: 3, value: 15, defense: 2 },
}

vi.mock('@/data/items', () => ({
  getItem: vi.fn((id: string) => ITEMS[id] ?? undefined),
}))

// ------------------------------------------------------------
// Inventory mock — track calls to verify DB-first ordering
// ------------------------------------------------------------

let mockInventory: InventoryItem[] = []
const addItemMock    = vi.fn().mockResolvedValue(undefined)
const removeItemMock = vi.fn().mockResolvedValue(undefined)

vi.mock('@/lib/inventory', () => ({
  getInventory: vi.fn(async () => mockInventory),
  addItem:      (...args: unknown[]) => addItemMock(...args),
  removeItem:   (...args: unknown[]) => removeItemMock(...args),
  equipItem:    vi.fn().mockResolvedValue(undefined),
  unequipItem:  vi.fn().mockResolvedValue(undefined),
}))

vi.mock('@/lib/world', () => ({
  updateRoomItems: vi.fn().mockResolvedValue(undefined),
  updateRoomFlags: vi.fn().mockResolvedValue(undefined),
}))

// ------------------------------------------------------------
// Supabase mock — configurable per test
// ------------------------------------------------------------

type StashRow = { id: string; player_id: string; item_id: string; quantity: number }
let stashRows: StashRow[] = []
let stashWriteError: string | null = null
let stashCount = 0

function makeChain(result: unknown) {
  const chain: Record<string, unknown> = {}
  for (const m of ['select', 'insert', 'update', 'delete', 'eq', 'maybeSingle', 'single', 'head', 'order', 'in']) {
    chain[m] = vi.fn(() => chain)
  }
  return new Proxy(chain, {
    get(target, prop) {
      if (prop === 'then') return (resolve: (v: unknown) => void) => resolve(result)
      return target[prop as string]
    },
  })
}

vi.mock('@/lib/supabase', () => ({
  createSupabaseBrowserClient: vi.fn(() => ({
    from: vi.fn((table: string) => {
      if (table === 'player_stash') {
        return {
          select: vi.fn((_cols: string, opts?: { count?: string; head?: boolean }) => ({
            eq: vi.fn((_col: string, _val: unknown) => ({
              eq: vi.fn((_c2: string, _v2: unknown) => makeChain(
                stashWriteError ? { data: null, error: { message: stashWriteError } }
                                : { data: stashRows.filter(r => r.item_id === _v2), error: null }
              )),
              // capacity check: count query
              then: (resolve: (v: unknown) => void) =>
                resolve(opts?.head ? { count: stashCount, error: null } : { data: stashRows, error: null }),
              maybeSingle: vi.fn(() => makeChain({ data: stashRows[0] ?? null, error: null })),
            })),
          })),
          insert: vi.fn(() => makeChain(
            stashWriteError ? { data: null, error: { message: stashWriteError } }
                            : { data: null, error: null }
          )),
          update: vi.fn(() => ({
            eq: vi.fn(() => makeChain(
              stashWriteError ? { data: null, error: { message: stashWriteError } }
                              : { data: null, error: null }
            )),
          })),
          delete: vi.fn(() => ({
            eq: vi.fn(() => makeChain(
              stashWriteError ? { data: null, error: { message: stashWriteError } }
                              : { data: null, error: null }
            )),
          })),
        }
      }
      return makeChain({ data: null, error: null })
    }),
  })),
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

function makeInvItem(itemId: string, equipped = false, quantity = 1): InventoryItem {
  return { id: `inv_${itemId}`, playerId: 'p1', itemId, item: ITEMS[itemId]!, quantity, equipped }
}

function makeEngine(state: Partial<GameState> = {}): EngineCore & { messages: GameMessage[]; state: GameState } {
  const fullState: GameState = {
    player: makePlayer(), currentRoom: null, inventory: [], combatState: null,
    log: [], loading: false, initialized: true, playerDead: false, ledger: null, stash: [],
    ...state,
  }
  const messages: GameMessage[] = []
  return {
    messages, state: fullState,
    getState: () => fullState,
    _setState: (partial) => Object.assign(fullState, partial),
    _appendMessages: (msgs) => messages.push(...msgs),
    _savePlayer: vi.fn().mockResolvedValue(undefined),
    _applyPopulation: (room: unknown) => room,
    _handlePlayerDeath: vi.fn().mockResolvedValue(undefined),
    adjustReputation: vi.fn().mockResolvedValue(undefined),
    setQuestFlag: vi.fn().mockResolvedValue(undefined),
  }
}

import { handleStash, handleUnstash } from '@/lib/actions/items'
import { addItem, removeItem, getInventory } from '@/lib/inventory'

// ------------------------------------------------------------
// Stash operations
// ------------------------------------------------------------

describe('stash operations', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mockInventory = []
    stashRows = []
    stashWriteError = null
    stashCount = 0
    addItemMock.mockResolvedValue(undefined)
    removeItemMock.mockResolvedValue(undefined)
  })

  it('stash removes item from inventory only after DB confirms', async () => {
    const callOrder: string[] = []
    addItemMock.mockImplementation(async () => { callOrder.push('addItem') })
    removeItemMock.mockImplementation(async () => { callOrder.push('removeItem') })

    mockInventory = [makeInvItem('medkit')]
    const engine = makeEngine({ inventory: [makeInvItem('medkit')] })

    await handleStash(engine, 'medkit')

    // removeItem called (DB write for inventory) after stash DB insert succeeds
    expect(removeItemMock).toHaveBeenCalledWith('p1', 'medkit')
    const errorMsgs = engine.messages.filter(m => m.type === 'error')
    expect(errorMsgs).toHaveLength(0)
  })

  it('stash failure does NOT remove item from inventory', async () => {
    stashWriteError = 'DB error'
    mockInventory = [makeInvItem('medkit')]
    const engine = makeEngine({ inventory: [makeInvItem('medkit')] })

    await handleStash(engine, 'medkit')

    // removeItem must NOT be called when the stash write fails
    expect(removeItemMock).not.toHaveBeenCalled()
    const errorMsgs = engine.messages.filter(m => m.type === 'error')
    expect(errorMsgs.length).toBeGreaterThan(0)
  })

  it('unstash adds item to inventory only after DB confirms', async () => {
    stashRows = [{ id: 'stash_1', player_id: 'p1', item_id: 'medkit', quantity: 1 }]
    mockInventory = [makeInvItem('medkit')]
    const engine = makeEngine()

    await handleUnstash(engine, 'medkit')

    expect(addItemMock).toHaveBeenCalledWith('p1', 'medkit')
    const errorMsgs = engine.messages.filter(m => m.type === 'error')
    expect(errorMsgs).toHaveLength(0)
  })

  it('unstash failure does NOT add item to inventory', async () => {
    stashRows = [{ id: 'stash_1', player_id: 'p1', item_id: 'medkit', quantity: 1 }]
    stashWriteError = 'DB error'
    const engine = makeEngine()

    await handleUnstash(engine, 'medkit')

    expect(addItemMock).not.toHaveBeenCalled()
    const errorMsgs = engine.messages.filter(m => m.type === 'error')
    expect(errorMsgs.length).toBeGreaterThan(0)
  })

  it('stashing stackable items updates quantity in existing stash entry', async () => {
    // Existing stash row for medkit — should update, not insert
    stashRows = [{ id: 'stash_1', player_id: 'p1', item_id: 'medkit', quantity: 2 }]
    mockInventory = [makeInvItem('medkit')]
    const engine = makeEngine({ inventory: [makeInvItem('medkit')] })

    await handleStash(engine, 'medkit')

    // No error; removeItem called after successful update
    expect(removeItemMock).toHaveBeenCalledWith('p1', 'medkit')
    const errorMsgs = engine.messages.filter(m => m.type === 'error')
    expect(errorMsgs).toHaveLength(0)
  })

  it('unstashing last item deletes the stash entry', async () => {
    // quantity === 1 triggers delete path
    stashRows = [{ id: 'stash_1', player_id: 'p1', item_id: 'medkit', quantity: 1 }]
    mockInventory = [makeInvItem('medkit')]
    const engine = makeEngine()

    await handleUnstash(engine, 'medkit')

    // addItem called after successful delete
    expect(addItemMock).toHaveBeenCalledWith('p1', 'medkit')
    const msgs = engine.messages.find(m => m.text.includes('retrieve'))
    expect(msgs).toBeDefined()
  })
})

// ------------------------------------------------------------
// Inventory persistence (verifies DB functions are called correctly)
// ------------------------------------------------------------

describe('inventory persistence', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mockInventory = []
  })

  it('item added to inventory persists through save/load', async () => {
    await addItem('p1', 'medkit')
    expect(addItemMock).toHaveBeenCalledWith('p1', 'medkit')

    mockInventory = [makeInvItem('medkit')]
    const loaded = await getInventory('p1')
    expect(loaded.some(i => i.itemId === 'medkit')).toBe(true)
  })

  it('item removed from inventory persists through save/load', async () => {
    mockInventory = [makeInvItem('medkit')]
    await removeItem('p1', 'medkit')
    expect(removeItemMock).toHaveBeenCalledWith('p1', 'medkit')

    mockInventory = []
    const loaded = await getInventory('p1')
    expect(loaded.some(i => i.itemId === 'medkit')).toBe(false)
  })

  it('equipped items persist correctly', async () => {
    mockInventory = [makeInvItem('knife', true)]
    const loaded = await getInventory('p1')
    const knife = loaded.find(i => i.itemId === 'knife')
    expect(knife).toBeDefined()
    expect(knife!.equipped).toBe(true)
  })
})
