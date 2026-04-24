// ============================================================
// Integration tests: npcTopics, actions/craft.ts, mapRenderer, data/recipes
// ============================================================

import { describe, it, expect, vi, beforeEach } from 'vitest'
import type { Player, Room } from '@/types/game'

// ── Supabase mock ────────────────────────────────────────────
const { mockFrom, setResults } = vi.hoisted(() => {
  const queue: Array<{ data: unknown; error: unknown }> = []
  function next() {
    return queue.length > 1 ? queue.shift()! : (queue[0] ?? { data: null, error: null })
  }
  function makeChain(): unknown {
    let proxy: unknown
    const chain: Record<string, unknown> = {}
    for (const m of ['select','insert','update','delete','eq','neq','in','order','maybeSingle','single','filter']) {
      chain[m] = () => proxy
    }
    proxy = new Proxy(chain, {
      get(t, p: string | symbol) {
        if (p === 'then') return (res: (v: unknown) => void, rej: (e: unknown) => void) => Promise.resolve(next()).then(res, rej)
        return t[p as string]
      },
    })
    return proxy
  }
  const mockFrom = vi.fn(() => makeChain())
  function setResults(...results: Array<{ data: unknown; error: unknown }>) { queue.length = 0; queue.push(...results) }
  return { mockFrom, setResults }
})
vi.mock('@/lib/supabase', () => ({ createSupabaseBrowserClient: () => ({ from: mockFrom }) }))

// ── items mock — pass through real module so ITEMS is available for validation
vi.mock('@/data/items', async (importOriginal) => {
  const actual = await importOriginal<typeof import('@/data/items')>()
  return { ...actual }
})

// ── recipes mock for craft tests (pass through real data, stub helpers) ───
const DRESS_RECIPE = {
  id: 'field_dressing', name: 'Field Dressing', description: 'Gauze + antiseptic.',
  components: [{ itemId: 'gauze', quantity: 2 }, { itemId: 'antiseptic', quantity: 1 }],
  result: { itemId: 'field_dressing', quantity: 1 },
  skillCheck: { skill: 'field_medicine', dc: 8 },
}
vi.mock('@/data/recipes', async (importOriginal) => {
  const actual = await importOriginal<typeof import('@/data/recipes')>()
  return {
    ...actual,
    getAvailableRecipes: vi.fn(() => [DRESS_RECIPE]),
    getAllRecipes: vi.fn(() => [DRESS_RECIPE]),
    getRecipe: vi.fn((id: string) => id === 'field_dressing' ? DRESS_RECIPE : undefined),
  }
})

vi.mock('@/lib/skillBonus', () => ({ getClassSkillBonus: vi.fn(() => 0) }))
vi.mock('@/lib/dice', () => ({ rollCheck: vi.fn(() => ({ total: 15, success: true })) }))

// ── Module imports (after mocks) ─────────────────────────────
import { NPC_TOPICS, findNpcTopic, getVisibleTopics } from '@/data/npcTopics'
import { handleCraft } from '@/lib/actions/craft'
import { renderZoneMap } from '@/lib/mapRenderer'
import { RECIPES } from '@/data/recipes'
import { ITEMS as ALL_ITEMS } from '@/data/items'

// ── Helpers ───────────────────────────────────────────────────
const BASE_PLAYER: Player = { id: 'p1', name: 'T', characterClass: 'enforcer', vigor: 8, grit: 6, reflex: 5, wits: 6, presence: 4, shadow: 7, hp: 18, maxHp: 18, currentRoomId: 'r1', worldSeed: 1, xp: 0, level: 1, actionsTaken: 0, isDead: false, cycle: 1, totalDeaths: 0, questFlags: {} }
const makePlayer = (o: Partial<Player> = {}): Player => ({ ...BASE_PLAYER, ...o })
const makeRoom = (id: string, zone: string, exits: Record<string, string> = {}): Room =>
  ({ id, name: id, description: '', shortDescription: '', zone, difficulty: 1, visited: false, flags: {}, exits, items: [], enemies: [], npcs: [] })
const makeEngine = (player: Player, ids: string[] = [], msgs: unknown[] = []) => {
  const state = { player, inventory: ids.map(itemId => ({ itemId, quantity: 1, equipped: false })) }
  return { getState: () => state, _appendMessages: (m: unknown[]) => msgs.push(...m), _setState: (p: Partial<typeof state>) => Object.assign(state, p) }
}

// ============================================================
// npcTopics
// ============================================================

describe('NPC_TOPICS — data integrity', () => {
  it('every NPC has at least one topic', () => {
    for (const [npcId, topics] of Object.entries(NPC_TOPICS)) {
      expect(topics.length, `NPC ${npcId} has no topics`).toBeGreaterThan(0)
    }
  })

  it('every topic has a non-empty response string', () => {
    for (const [npcId, topics] of Object.entries(NPC_TOPICS)) {
      for (const topic of topics) {
        expect(topic.response.trim().length, `${npcId} topic has empty response`).toBeGreaterThan(0)
      }
    }
  })

  it('every topic has at least one keyword', () => {
    for (const [npcId, topics] of Object.entries(NPC_TOPICS)) {
      for (const topic of topics) {
        expect(topic.keywords.length, `${npcId} topic has no keywords`).toBeGreaterThan(0)
      }
    }
  })

  it('gated topics have non-empty requiresFlag strings', () => {
    for (const [npcId, topics] of Object.entries(NPC_TOPICS)) {
      for (const topic of topics) {
        if ('requiresFlag' in topic && topic.requiresFlag !== undefined) {
          expect(typeof topic.requiresFlag, `${npcId} requiresFlag is not a string`).toBe('string')
          expect(topic.requiresFlag.trim().length).toBeGreaterThan(0)
        }
      }
    }
  })
})

describe('findNpcTopic', () => {
  it('returns the matching topic for a known NPC and keyword', () => {
    const result = findNpcTopic('patch', 'scar')
    expect(result).toBeDefined()
    expect(result?.response).toContain('Scar')
  })

  it('returns undefined for an unknown NPC', () => {
    expect(findNpcTopic('ghost_npc', 'anything')).toBeUndefined()
  })

  it('returns undefined for a keyword the NPC does not have', () => {
    expect(findNpcTopic('patch', 'zzzznotakeyword')).toBeUndefined()
  })
})

describe('getVisibleTopics', () => {
  it('hides topics whose requiresFlag is not in questFlags', () => {
    // avery_kindling has a topic requiring 'avery_shared_doubts'
    const visible = getVisibleTopics('avery_kindling', {}, {})
    expect(visible).not.toContain('leave')
  })

  it('shows gated topic when flag is present', () => {
    const visible = getVisibleTopics('avery_kindling', { avery_shared_doubts: true }, {})
    expect(visible).toContain('leave')
  })
})

// ============================================================
// actions/craft.ts
// ============================================================

describe('handleCraft — list recipes', () => {
  beforeEach(() => { vi.clearAllMocks(); setResults() })

  it('lists available recipes when no noun given', async () => {
    const msgs: unknown[] = []
    const engine = makeEngine(makePlayer(), [], msgs)
    await handleCraft(engine as never, undefined)
    const text = JSON.stringify(msgs)
    expect(text).toContain('Field Dressing')
  })
})

describe('handleCraft — unknown recipe', () => {
  beforeEach(() => { vi.clearAllMocks(); setResults() })

  it('emits error when recipe name is not recognized', async () => {
    const msgs: unknown[] = []
    const engine = makeEngine(makePlayer(), [], msgs)
    await handleCraft(engine as never, 'dragons breath')
    const text = JSON.stringify(msgs)
    expect(text).toMatch(/don't know how to craft/i)
  })
})

describe('handleCraft — missing ingredients', () => {
  beforeEach(() => { vi.clearAllMocks(); setResults() })

  it('reports missing components when inventory is empty', async () => {
    const msgs: unknown[] = []
    const engine = makeEngine(makePlayer(), [], msgs)
    await handleCraft(engine as never, 'field dressing')
    const text = JSON.stringify(msgs)
    expect(text).toMatch(/missing components/i)
  })
})

describe('handleCraft — successful craft', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    // removeItem + addItem + getInventory DB calls
    setResults({ data: null, error: null }, { data: null, error: null }, { data: null, error: null }, { data: [], error: null })
  })

  it('adds the crafted item to inventory on success', async () => {
    const msgs: unknown[] = []
    const player = makePlayer()
    const inv = ['gauze', 'gauze', 'antiseptic']
    const engine = makeEngine(player, inv, msgs)
    await handleCraft(engine as never, 'field dressing')
    // mockFrom should have been called for addItem
    expect(mockFrom).toHaveBeenCalledWith('player_inventory')
  })
})

// ============================================================
// mapRenderer
// ============================================================

describe('renderZoneMap', () => {
  const roomA = makeRoom('a', 'crossroads', { east: 'b' })
  const roomB = makeRoom('b', 'crossroads', { west: 'a', east: 'c' })
  const roomC = makeRoom('c', 'crossroads', { west: 'b' })

  it('returns a string array with box-drawing borders', () => {
    const lines = renderZoneMap([roomA, roomB, roomC], 'a', new Set())
    expect(Array.isArray(lines)).toBe(true)
    expect(lines[0]).toContain('╔')
    expect(lines[lines.length - 1]).toContain('╚')
  })

  it('marks the current room with [*]', () => {
    const lines = renderZoneMap([roomA, roomB, roomC], 'a', new Set(['b']))
    const joined = lines.join('\n')
    expect(joined).toContain('[*]')
  })

  it('marks visited rooms with [·] and unvisited with [?]', () => {
    const lines = renderZoneMap([roomA, roomB, roomC], 'a', new Set(['b']))
    const joined = lines.join('\n')
    expect(joined).toContain('[·]')
    expect(joined).toContain('[?]')
  })

  it('returns a MAP UNAVAILABLE box for an unknown currentRoomId', () => {
    const lines = renderZoneMap([roomA], 'no_such_room', new Set())
    const joined = lines.join('\n')
    expect(joined).toContain('MAP UNAVAILABLE')
  })

  it('includes the zone name in the header', () => {
    const lines = renderZoneMap([roomA, roomB], 'a', new Set())
    expect(lines[1]).toContain('CROSSROADS')
  })
})

// ============================================================
// data/recipes — validation
// ============================================================

describe('recipes data integrity', () => {
  it('all recipe component itemIds exist in items.ts', () => {
    for (const recipe of Object.values(RECIPES)) {
      for (const comp of recipe.components) {
        const exists = comp.itemId in ALL_ITEMS
        expect(exists, `Recipe "${recipe.name}" references unknown item "${comp.itemId}"`).toBe(true)
      }
    }
  })

  it('no duplicate recipe names', () => {
    const names = Object.values(RECIPES).map(r => r.name)
    const unique = new Set(names)
    expect(names.length).toBe(unique.size)
  })

  it('all recipes have non-empty descriptions', () => {
    for (const recipe of Object.values(RECIPES)) {
      expect(recipe.description.trim().length, `Recipe "${recipe.name}" has empty description`).toBeGreaterThan(0)
    }
  })
})
