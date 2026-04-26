import { describe, it, expect } from 'vitest'
import { getSetBonusDelta, getActiveSetSummaries, countActiveSetPieces, SETS } from '@/lib/setBonuses'
import type { Player, InventoryItem, Item } from '@/types/game'

// ------------------------------------------------------------
// Fixtures
// ------------------------------------------------------------

function makePlayer(overrides: Partial<Player> = {}): Player {
  return {
    id: 'test-player',
    name: 'Tester',
    characterClass: 'enforcer',
    vigor: 3,
    grit: 3,
    reflex: 3,
    wits: 3,
    presence: 3,
    shadow: 3,
    hp: 10,
    maxHp: 10,
    currentRoomId: 'crossroads_01',
    worldSeed: 1,
    xp: 0,
    level: 1,
    actionsTaken: 0,
    isDead: false,
    cycle: 1,
    totalDeaths: 0,
    ...overrides,
  }
}

/** Build a synthetic InventoryItem for an armor piece in the salter_executioner set */
function makeSetArmor(
  itemId: string,
  setId: string,
  armorSlot: Item['armorSlot'],
  equipped: boolean,
): InventoryItem {
  return {
    id: `inv-${itemId}`,
    playerId: 'test-player',
    itemId,
    item: {
      id: itemId,
      name: itemId,
      description: 'test armor piece',
      type: 'armor',
      weight: 2,
      defense: 3,
      value: 10,
      armorSlot,
      setId,
    },
    quantity: 1,
    equipped,
  }
}

/** Build a 4-piece inventory for salter_executioner set (all equipped) */
function makeFullExecutionerSet(equippedCount: number): InventoryItem[] {
  const slots: Array<Item['armorSlot']> = ['head', 'chest', 'legs', 'feet']
  return slots.map((slot, i) =>
    makeSetArmor(
      `executioner_${slot}`,
      'salter_executioner',
      slot,
      i < equippedCount,
    ),
  )
}

// ------------------------------------------------------------
// Tests
// ------------------------------------------------------------

describe('getSetBonusDelta', () => {
  it('1. player with 0 set pieces returns empty object', () => {
    const player = makePlayer()
    const inventory: InventoryItem[] = []
    const delta = getSetBonusDelta(player, inventory)
    expect(delta).toEqual({})
  })

  it('2. player with 2 pieces of salter_executioner returns { vigor: 1 }', () => {
    const player = makePlayer()
    const inventory = makeFullExecutionerSet(2)
    const delta = getSetBonusDelta(player, inventory)
    expect(delta).toEqual({ vigor: 1 })
  })

  it('3. player with 4 pieces returns cumulative { vigor: 2, grit: 1 } (NOT 2-piece stacked on top of 4-piece)', () => {
    const player = makePlayer()
    const inventory = makeFullExecutionerSet(4)
    const delta = getSetBonusDelta(player, inventory)
    // The 4-piece threshold supersedes the 2-piece; total is NOT { vigor: 3, grit: 1 }
    expect(delta).toEqual({ vigor: 2, grit: 1 })
    // Explicitly assert it does NOT stack both thresholds
    expect(delta.vigor).toBe(2)
    expect(delta.grit).toBe(1)
  })

  it('4. delta when equipping 4th piece (3 pieces before, 4 pieces after) equals { vigor: 1, grit: 1 }', () => {
    // 3-piece state: no threshold crossed (thresholds are 2 and 4)
    // Wait — 3 >= 2, so 2-piece threshold is active with 3 pieces equipped
    const player = makePlayer()
    const inventoryBefore = makeFullExecutionerSet(3) // 3 equipped: 2-piece active → { vigor: 1 }
    const inventoryAfter = makeFullExecutionerSet(4)  // 4 equipped: 4-piece active → { vigor: 2, grit: 1 }

    const deltaBefore = getSetBonusDelta(player, inventoryBefore)
    const deltaAfter = getSetBonusDelta(player, inventoryAfter)

    expect(deltaBefore).toEqual({ vigor: 1 })
    expect(deltaAfter).toEqual({ vigor: 2, grit: 1 })

    // The incremental change (what inventory.ts would apply) is deltaAfter - deltaBefore
    const incrementalVigor = (deltaAfter.vigor ?? 0) - (deltaBefore.vigor ?? 0)
    const incrementalGrit = (deltaAfter.grit ?? 0) - (deltaBefore.grit ?? 0)
    expect(incrementalVigor).toBe(1)
    expect(incrementalGrit).toBe(1)
  })

  it('5. unequipping a piece reverses the bonus correctly (4 -> 3 -> loses the 4-piece increment)', () => {
    const player = makePlayer()
    const inventoryWith4 = makeFullExecutionerSet(4)  // { vigor: 2, grit: 1 }
    const inventoryWith3 = makeFullExecutionerSet(3)  // { vigor: 1 } (only 2-piece active)

    const deltaWith4 = getSetBonusDelta(player, inventoryWith4)
    const deltaWith3 = getSetBonusDelta(player, inventoryWith3)

    // 4-piece bonus is { vigor: 2, grit: 1 }
    expect(deltaWith4).toEqual({ vigor: 2, grit: 1 })
    // After dropping to 3 pieces, only the 2-piece threshold remains active
    expect(deltaWith3).toEqual({ vigor: 1 })
    // The reversal removes grit entirely and reduces vigor back to 1
    expect(deltaWith3.grit).toBeUndefined()
    expect(deltaWith3.vigor).toBe(1)
  })

  it('1 equipped piece returns empty (below all thresholds)', () => {
    const player = makePlayer()
    const inventory = makeFullExecutionerSet(1)
    const delta = getSetBonusDelta(player, inventory)
    expect(delta).toEqual({})
  })

  it('non-armor set items are not counted', () => {
    const player = makePlayer()
    // Weapon with a setId should NOT contribute to set bonus counts
    const weaponWithSetId: InventoryItem = {
      id: 'inv-weapon',
      playerId: 'test-player',
      itemId: 'executioner_sword',
      item: {
        id: 'executioner_sword',
        name: 'Executioner Sword',
        description: 'A sword',
        type: 'weapon',
        weight: 3,
        damage: 5,
        value: 20,
        setId: 'salter_executioner',
      },
      quantity: 1,
      equipped: true,
    }
    const delta = getSetBonusDelta(player, [weaponWithSetId])
    expect(delta).toEqual({})
  })
})

describe('countActiveSetPieces', () => {
  it('counts only equipped armor pieces with a setId', () => {
    const inventory = makeFullExecutionerSet(2)
    const counts = countActiveSetPieces(inventory)
    expect(counts['salter_executioner']).toBe(2)
  })

  it('unequipped pieces are not counted', () => {
    const inventory = makeFullExecutionerSet(0)
    const counts = countActiveSetPieces(inventory)
    expect(counts['salter_executioner']).toBeUndefined()
  })

  it('multiple sets are counted independently', () => {
    const executionerPieces = makeFullExecutionerSet(2)
    const inquisitorPieces = [
      makeSetArmor('inquisitor_head', 'accord_inquisitor', 'head', true),
      makeSetArmor('inquisitor_chest', 'accord_inquisitor', 'chest', true),
      makeSetArmor('inquisitor_legs', 'accord_inquisitor', 'legs', false),
    ]
    const counts = countActiveSetPieces([...executionerPieces, ...inquisitorPieces])
    expect(counts['salter_executioner']).toBe(2)
    expect(counts['accord_inquisitor']).toBe(2)
  })
})

describe('getActiveSetSummaries', () => {
  it('returns empty array with no equipped set pieces', () => {
    const player = makePlayer()
    expect(getActiveSetSummaries(player, [])).toEqual([])
  })

  it('returns correct summary for 2-piece set active', () => {
    const player = makePlayer()
    const inventory = makeFullExecutionerSet(2)
    const summaries = getActiveSetSummaries(player, inventory)
    expect(summaries).toHaveLength(1)
    expect(summaries[0]).toContain("Executioner's Garb")
    expect(summaries[0]).toContain('2/4')
    expect(summaries[0]).toContain('Two-piece')
  })

  it('returns 4-piece summary when 4 pieces equipped', () => {
    const player = makePlayer()
    const inventory = makeFullExecutionerSet(4)
    const summaries = getActiveSetSummaries(player, inventory)
    expect(summaries).toHaveLength(1)
    expect(summaries[0]).toContain('4/4')
    expect(summaries[0]).toContain('Four-piece')
  })
})

describe('SETS table integrity', () => {
  it('has exactly 3 sets defined', () => {
    expect(SETS).toHaveLength(3)
  })

  it('all setIds are unique', () => {
    const ids = SETS.map(s => s.setId)
    expect(new Set(ids).size).toBe(ids.length)
  })

  it('all sets have 4 pieces defined', () => {
    for (const set of SETS) {
      expect(set.pieces).toBe(4)
    }
  })

  it('all sets have both 2-piece and 4-piece thresholds', () => {
    for (const set of SETS) {
      expect(set.thresholds[2]).toBeDefined()
      expect(set.thresholds[4]).toBeDefined()
    }
  })
})
