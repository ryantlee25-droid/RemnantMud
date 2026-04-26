import { describe, it, expect } from 'vitest'
import { rollAffixes, affixStatDelta, formatItemName, AFFIX_CHANCE_BY_RARITY } from '@/lib/affixes'
import { PREFIX_AFFIXES, SUFFIX_AFFIXES } from '@/data/affixTables'
import type { Item, AffixEntry } from '@/types/game'

// ------------------------------------------------------------
// Fixtures
// ------------------------------------------------------------

function makeWeapon(overrides: Partial<Item> = {}): Item {
  return {
    id: 'test_knife',
    name: 'Knife',
    description: 'A simple knife.',
    type: 'weapon',
    weight: 1,
    damage: 3,
    value: 10,
    rarity: 'common',
    ...overrides,
  }
}

function makeArmor(overrides: Partial<Item> = {}): Item {
  return {
    id: 'test_vest',
    name: 'Vest',
    description: 'A battered vest.',
    type: 'armor',
    weight: 3,
    defense: 2,
    value: 15,
    rarity: 'common',
    ...overrides,
  }
}

// Deterministic RNG that always returns the same value
function constRng(val: number) {
  return () => val
}

// RNG that cycles through an array of values
function seqRng(values: number[]) {
  let i = 0
  return () => values[i++ % values.length]
}

// ------------------------------------------------------------
// AFFIX_CHANCE_BY_RARITY sanity
// ------------------------------------------------------------

describe('AFFIX_CHANCE_BY_RARITY', () => {
  it('has correct probability values', () => {
    expect(AFFIX_CHANCE_BY_RARITY.common).toBe(0)
    expect(AFFIX_CHANCE_BY_RARITY.uncommon).toBe(0.20)
    expect(AFFIX_CHANCE_BY_RARITY.rare).toBe(0.50)
    expect(AFFIX_CHANCE_BY_RARITY.epic).toBe(1.00)
    expect(AFFIX_CHANCE_BY_RARITY.legendary).toBe(1.00)
  })
})

// ------------------------------------------------------------
// rollAffixes
// ------------------------------------------------------------

describe('rollAffixes', () => {
  it('1. common item returns no affixes', () => {
    const item = makeWeapon({ rarity: 'common' })
    const result = rollAffixes(item)
    expect(result.affixes).toBeUndefined()
  })

  it('2. epic item returns exactly 2 affixes (1 prefix + 1 suffix)', () => {
    const item = makeWeapon({ rarity: 'epic' })
    // rng=0.1 picks index 0 from each pool
    const result = rollAffixes(item, { rng: constRng(0.1) })
    expect(result.affixes).toHaveLength(2)
    // First affix must be a prefix
    const prefixIds = PREFIX_AFFIXES.map(p => p.id)
    const suffixIds = SUFFIX_AFFIXES.map(s => s.id)
    expect(prefixIds).toContain(result.affixes![0].id)
    expect(suffixIds).toContain(result.affixes![1].id)
  })

  it('3. rare item with rng=0.3 returns 1 prefix only (first side of 50/50)', () => {
    // Roll sequence: 0.3 < 0.5 (passes rare chance check), 0.3 < 0.5 (picks prefix side)
    // then 0.3 selects entry from prefix pool
    const item = makeWeapon({ rarity: 'rare' })
    const result = rollAffixes(item, { rng: constRng(0.3) })
    expect(result.affixes).toHaveLength(1)
    const prefixIds = PREFIX_AFFIXES.map(p => p.id)
    expect(prefixIds).toContain(result.affixes![0].id)
  })

  it('4. rare item with rng=0.7 returns no affix (fails 50% chance gate)', () => {
    // 0.7 >= 0.5, so rare chance check fails → no affixes
    const item = makeWeapon({ rarity: 'rare' })
    const result = rollAffixes(item, { rng: constRng(0.7) })
    expect(result.affixes).toBeUndefined()
  })

  it('4b. rare item — when chance passes (0.4), rng=0.7 for 50/50 picks suffix', () => {
    // seq: 0.4 (passes 50% gate), 0.7 (>= 0.5, picks suffix side), 0.1 (picks from suffix pool)
    const item = makeWeapon({ rarity: 'rare' })
    const result = rollAffixes(item, { rng: seqRng([0.4, 0.7, 0.1]) })
    expect(result.affixes).toHaveLength(1)
    const suffixIds = SUFFIX_AFFIXES.map(s => s.id)
    expect(suffixIds).toContain(result.affixes![0].id)
  })

  it('5a. uncommon with rng=0.10 returns 1 affix (passes 20% gate)', () => {
    // 0.10 < 0.20 → passes; then 50/50 pick; then select from pool
    const item = makeWeapon({ rarity: 'uncommon' })
    const result = rollAffixes(item, { rng: constRng(0.10) })
    expect(result.affixes).toHaveLength(1)
  })

  it('5b. uncommon with rng=0.50 returns 0 affixes (fails 20% gate)', () => {
    // 0.50 >= 0.20 → fails
    const item = makeWeapon({ rarity: 'uncommon' })
    const result = rollAffixes(item, { rng: constRng(0.50) })
    expect(result.affixes).toBeUndefined()
  })

  it('6. weapon prefix not selected for armor item (appliesToType filtering)', () => {
    // All weapon-only prefixes should be excluded when rolling on armor
    const item = makeArmor({ rarity: 'epic' })
    const result = rollAffixes(item, { rng: constRng(0.1) })
    expect(result.affixes).toBeDefined()
    const weaponOnlyPrefixIds = PREFIX_AFFIXES
      .filter(p => p.appliesToType === 'weapon')
      .map(p => p.id)
    for (const affix of result.affixes ?? []) {
      expect(weaponOnlyPrefixIds).not.toContain(affix.id)
    }
  })

  it('does not mutate the original item', () => {
    const item = makeWeapon({ rarity: 'epic' })
    const original = { ...item }
    rollAffixes(item, { rng: constRng(0.1) })
    expect(item).toEqual(original)
  })

  it('non-equipable type (consumable) returns no affixes even at epic rarity', () => {
    const item: Item = {
      id: 'stim',
      name: 'Stim',
      description: 'A stim.',
      type: 'consumable',
      weight: 0.1,
      value: 5,
      rarity: 'epic',
    }
    const result = rollAffixes(item)
    expect(result.affixes).toBeUndefined()
  })

  it('legendary item always gets 2 affixes', () => {
    const item = makeArmor({ rarity: 'legendary' })
    const result = rollAffixes(item, { rng: constRng(0.2) })
    expect(result.affixes).toHaveLength(2)
  })
})

// ------------------------------------------------------------
// affixStatDelta
// ------------------------------------------------------------

describe('affixStatDelta', () => {
  it('7. sums multiple affix statEffect entries correctly', () => {
    const item: Item = {
      ...makeWeapon(),
      affixes: [
        {
          id: 'swift',
          name: 'Swift',
          appliesToType: 'weapon',
          statEffect: { reflex: 1 },
        },
        {
          id: 'of_the_brawler',
          name: 'of the Brawler',
          appliesToType: 'weapon',
          statEffect: { vigor: 1 },
        },
      ],
    }
    const delta = affixStatDelta(item)
    expect(delta.reflex).toBe(1)
    expect(delta.vigor).toBe(1)
    expect(delta.grit).toBeUndefined()
  })

  it('sums same stat across multiple affixes', () => {
    const item: Item = {
      ...makeWeapon(),
      affixes: [
        {
          id: 'swift',
          name: 'Swift',
          appliesToType: 'weapon',
          statEffect: { reflex: 1 },
        },
        {
          id: "stalker's",
          name: "Stalker's",
          appliesToType: 'weapon',
          statEffect: { reflex: 1 },
        },
      ],
    }
    const delta = affixStatDelta(item)
    expect(delta.reflex).toBe(2)
  })

  it('negative stat effects are included in delta', () => {
    const item: Item = {
      ...makeWeapon(),
      affixes: [
        {
          id: 'brutal',
          name: 'Brutal',
          appliesToType: 'weapon',
          statEffect: { reflex: -1 },
        },
      ],
    }
    const delta = affixStatDelta(item)
    expect(delta.reflex).toBe(-1)
  })

  it('returns empty object when item has no affixes', () => {
    const item = makeWeapon()
    expect(affixStatDelta(item)).toEqual({})
  })

  it('returns empty object when affixes have no statEffect', () => {
    const item: Item = {
      ...makeWeapon(),
      affixes: [
        {
          id: 'keen',
          name: 'Keen',
          appliesToType: 'weapon',
          // no statEffect
        },
      ],
    }
    expect(affixStatDelta(item)).toEqual({})
  })
})

// ------------------------------------------------------------
// formatItemName
// ------------------------------------------------------------

describe('formatItemName', () => {
  it('8. produces "Keen Knife of the Brawler" given correct affixes', () => {
    const item: Item = {
      ...makeWeapon({ name: 'Knife' }),
      affixes: [
        {
          id: 'keen',
          name: 'Keen',
          appliesToType: 'weapon',
        },
        {
          id: 'of_the_brawler',
          name: 'of the Brawler',
          appliesToType: 'weapon',
          statEffect: { vigor: 1 },
        },
      ],
    }
    expect(formatItemName(item)).toBe('Keen Knife of the Brawler')
  })

  it('returns base name when no affixes present', () => {
    const item = makeWeapon({ name: 'Knife' })
    expect(formatItemName(item)).toBe('Knife')
  })

  it('prefix only — no suffix appended', () => {
    const item: Item = {
      ...makeWeapon({ name: 'Knife' }),
      affixes: [
        {
          id: 'swift',
          name: 'Swift',
          appliesToType: 'weapon',
          statEffect: { reflex: 1 },
        },
      ],
    }
    expect(formatItemName(item)).toBe('Swift Knife')
  })

  it('suffix only — no prefix prepended', () => {
    const item: Item = {
      ...makeWeapon({ name: 'Knife' }),
      affixes: [
        {
          id: 'of_the_brawler',
          name: 'of the Brawler',
          appliesToType: 'weapon',
          statEffect: { vigor: 1 },
        },
      ],
    }
    expect(formatItemName(item)).toBe('Knife of the Brawler')
  })
})

// ------------------------------------------------------------
// Affix table integrity
// ------------------------------------------------------------

describe('affix table integrity', () => {
  it('PREFIX_AFFIXES has exactly 12 entries', () => {
    expect(PREFIX_AFFIXES).toHaveLength(12)
  })

  it('SUFFIX_AFFIXES has exactly 12 entries', () => {
    expect(SUFFIX_AFFIXES).toHaveLength(12)
  })

  it('all prefix ids are unique', () => {
    const ids = PREFIX_AFFIXES.map(a => a.id)
    expect(new Set(ids).size).toBe(ids.length)
  })

  it('all suffix ids are unique', () => {
    const ids = SUFFIX_AFFIXES.map(a => a.id)
    expect(new Set(ids).size).toBe(ids.length)
  })
})
