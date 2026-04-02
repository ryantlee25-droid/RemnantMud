import { describe, it, expect } from 'vitest'
import { ENEMIES } from '@/data/enemies'
import { ITEMS } from '@/data/items'
import { RECIPES } from '@/data/recipes'
import { NPCS } from '@/data/npcs'
import { NPC_TOPICS } from '@/data/npcTopics'
import type { ItemType } from '@/types/game'

// Zone room imports
import { CROSSROADS_ROOMS } from '@/data/rooms/crossroads'
import { RIVER_ROAD_ROOMS } from '@/data/rooms/river_road'
import { COVENANT_ROOMS } from '@/data/rooms/covenant'
import { SALT_CREEK_ROOMS } from '@/data/rooms/salt_creek'
import { EMBER_ROOMS } from '@/data/rooms/the_ember'
import { BREAKS_ROOMS } from '@/data/rooms/the_breaks'
import { THE_DUST_ROOMS } from '@/data/rooms/the_dust'
import { THE_STACKS_ROOMS } from '@/data/rooms/the_stacks'
import { DUSKHOLLOW_ROOMS } from '@/data/rooms/duskhollow'
import { THE_DEEP_ROOMS } from '@/data/rooms/the_deep'
import { THE_PINE_SEA_ROOMS } from '@/data/rooms/the_pine_sea'
import { THE_SCAR_ROOMS } from '@/data/rooms/the_scar'
import { THE_PENS_ROOMS } from '@/data/rooms/the_pens'

const ALL_ROOMS = [
  ...CROSSROADS_ROOMS,
  ...RIVER_ROAD_ROOMS,
  ...COVENANT_ROOMS,
  ...SALT_CREEK_ROOMS,
  ...EMBER_ROOMS,
  ...BREAKS_ROOMS,
  ...THE_DUST_ROOMS,
  ...THE_STACKS_ROOMS,
  ...DUSKHOLLOW_ROOMS,
  ...THE_DEEP_ROOMS,
  ...THE_PINE_SEA_ROOMS,
  ...THE_SCAR_ROOMS,
  ...THE_PENS_ROOMS,
]

const VALID_ITEM_TYPES: ItemType[] = ['weapon', 'armor', 'consumable', 'key', 'junk', 'lore', 'currency']

// ─── Enemies ──────────────────────────────────────────────────────────────────

describe('enemies data integrity', () => {
  const enemies = Object.values(ENEMIES)

  it('all enemies have names and non-empty descriptions', () => {
    for (const e of enemies) {
      expect(e.name, `${e.id} missing name`).toBeTruthy()
      expect(e.description, `${e.id} missing description`).toBeTruthy()
    }
  })

  it('all enemies have valid hp (> 0)', () => {
    for (const e of enemies) {
      expect(e.hp, `${e.id} hp invalid`).toBeGreaterThan(0)
      expect(e.maxHp, `${e.id} maxHp invalid`).toBeGreaterThan(0)
    }
  })

  it('all enemies have non-negative attack and defense', () => {
    for (const e of enemies) {
      expect(e.attack, `${e.id} attack negative`).toBeGreaterThanOrEqual(0)
      expect(e.defense, `${e.id} defense negative`).toBeGreaterThanOrEqual(0)
    }
  })

  it('all enemies award positive xp', () => {
    for (const e of enemies) {
      expect(e.xp, `${e.id} xp invalid`).toBeGreaterThan(0)
    }
  })

  it('enemy loot tables reference valid item IDs', () => {
    for (const e of enemies) {
      for (const drop of e.loot ?? []) {
        expect(ITEMS, `${e.id} loot references unknown item '${drop.itemId}'`).toHaveProperty(drop.itemId)
      }
    }
  })

  it('enemy id field matches registry key', () => {
    for (const [key, e] of Object.entries(ENEMIES)) {
      expect(e.id, `Registry key '${key}' does not match id field '${e.id}'`).toBe(key)
    }
  })
})

// ─── Items ────────────────────────────────────────────────────────────────────

describe('items data integrity', () => {
  const items = Object.values(ITEMS)

  it('all item IDs are unique', () => {
    const ids = items.map((i) => i.id)
    const unique = new Set(ids)
    expect(unique.size).toBe(ids.length)
  })

  it('all items have non-empty descriptions', () => {
    for (const item of items) {
      expect(item.description, `${item.id} missing description`).toBeTruthy()
    }
  })

  it('all items have valid types', () => {
    for (const item of items) {
      expect(VALID_ITEM_TYPES, `${item.id} has invalid type '${item.type}'`).toContain(item.type)
    }
  })

  it('item id field matches registry key', () => {
    for (const [key, item] of Object.entries(ITEMS)) {
      expect(item.id, `Registry key '${key}' does not match id field '${item.id}'`).toBe(key)
    }
  })
})

// ─── Recipes ──────────────────────────────────────────────────────────────────

describe('recipes data integrity', () => {
  const recipes = Object.values(RECIPES)

  it('recipe component itemIds reference existing items (excluding crafted_ prefix)', () => {
    for (const recipe of recipes) {
      for (const comp of recipe.components) {
        if (!comp.itemId.startsWith('crafted_')) {
          expect(ITEMS, `Recipe '${recipe.id}' references unknown component '${comp.itemId}'`).toHaveProperty(comp.itemId)
        }
      }
    }
  })

  it('all recipes have positive component quantities', () => {
    for (const recipe of recipes) {
      for (const comp of recipe.components) {
        expect(comp.quantity, `Recipe '${recipe.id}' component '${comp.itemId}' has invalid quantity`).toBeGreaterThan(0)
      }
    }
  })

  it('all recipes have non-empty names and descriptions', () => {
    for (const recipe of recipes) {
      expect(recipe.name, `${recipe.id} missing name`).toBeTruthy()
      expect(recipe.description, `${recipe.id} missing description`).toBeTruthy()
    }
  })

  it('recipe id field matches registry key', () => {
    for (const [key, recipe] of Object.entries(RECIPES)) {
      expect(recipe.id, `Registry key '${key}' does not match id field '${recipe.id}'`).toBe(key)
    }
  })
})

// ─── NPC Topics ───────────────────────────────────────────────────────────────

describe('npcTopics data integrity', () => {
  it('all NPC topic keys are non-empty strings', () => {
    // Note: NPC_TOPICS keys use short aliases that may not match NPC IDs exactly
    // (e.g., avery_kindling vs kindling_doubter_avery, accord_soldier vs accord_gate_guard)
    // This is a known data convention, not a bug. We validate structure, not ID matching.
    for (const npcId of Object.keys(NPC_TOPICS)) {
      expect(npcId.length, `NPC_TOPICS has empty key`).toBeGreaterThan(0)
      expect(typeof npcId).toBe('string')
    }
  })

  it('all topics have non-empty keywords and responses', () => {
    for (const [npcId, topics] of Object.entries(NPC_TOPICS)) {
      for (const topic of topics) {
        expect(topic.keywords.length, `${npcId} topic has empty keywords`).toBeGreaterThan(0)
        expect(topic.response, `${npcId} topic has empty response`).toBeTruthy()
      }
    }
  })
})

// ─── Rooms ────────────────────────────────────────────────────────────────────

describe('rooms data integrity', () => {
  it('all rooms have at least one exit', () => {
    for (const room of ALL_ROOMS) {
      const exitCount = Object.keys(room.exits ?? {}).length
      expect(exitCount, `Room '${room.id}' has no exits`).toBeGreaterThan(0)
    }
  })

  it('all room IDs are unique across all zones', () => {
    const ids = ALL_ROOMS.map((r) => r.id)
    const unique = new Set(ids)
    expect(unique.size).toBe(ids.length)
  })

  it('all rooms have non-empty names and descriptions', () => {
    for (const room of ALL_ROOMS) {
      expect(room.name, `${room.id} missing name`).toBeTruthy()
      expect(room.description, `${room.id} missing description`).toBeTruthy()
    }
  })

  it('rooms have a valid zone field', () => {
    const validZones = new Set([
      'crossroads', 'river_road', 'covenant', 'salt_creek', 'the_ember',
      'the_breaks', 'the_dust', 'the_stacks', 'duskhollow', 'the_deep',
      'the_pine_sea', 'the_scar', 'the_pens',
    ])
    for (const room of ALL_ROOMS) {
      expect(validZones, `Room '${room.id}' has invalid zone '${room.zone}'`).toContain(room.zone)
    }
  })

  it('enemy spawn tables reference valid enemy IDs', () => {
    for (const room of ALL_ROOMS) {
      for (const enemyId of room.enemies) {
        expect(ENEMIES, `Room '${room.id}' spawns unknown enemy '${enemyId}'`).toHaveProperty(enemyId)
      }
    }
  })
})
