// ============================================================
// Affix System — Convoy 2 H2
// Diablo-style prefix + suffix rolls at item drop time.
// Pure module — no mutations; rollAffixes returns a new Item.
// ============================================================

import type { Item, ItemRarity, AffixEntry } from '@/types/game'
import type { Stat } from '@/types/game'
import { PREFIX_AFFIXES, SUFFIX_AFFIXES } from '@/data/affixTables'

// ------------------------------------------------------------
// Public API
// ------------------------------------------------------------

export interface RollAffixOptions {
  /** Injectable RNG for deterministic tests. Must return [0, 1). Defaults to Math.random. */
  rng?: () => number
}

/**
 * Probability of receiving any affix at all, keyed by item rarity.
 * epic/legendary always get a full prefix + suffix pair.
 * rare gets 1 affix (prefix OR suffix, 50/50).
 * uncommon gets 1 affix at 20% chance.
 * common never gets affixes.
 */
export const AFFIX_CHANCE_BY_RARITY: Record<ItemRarity, number> = {
  common:    0,
  uncommon:  0.20,
  rare:      0.50,
  epic:      1.00,
  legendary: 1.00,
}

/**
 * Returns a copy of the item with affixes rolled onto it. Mutates nothing.
 *
 * Roll rules:
 * - epic/legendary: 1 prefix + 1 suffix (always)
 * - rare:           50% chance; if triggered → 1 prefix OR 1 suffix (50/50 between them)
 * - uncommon:       20% chance; if triggered → 1 random affix (prefix or suffix, 50/50)
 * - common:         no affixes
 *
 * Prefix/suffix candidates are filtered to entries whose appliesToType matches
 * the item's type ('weapon' | 'armor'). Items with type other than weapon/armor
 * receive no affixes regardless of rarity.
 */
export function rollAffixes(baseItem: Item, opts?: RollAffixOptions): Item {
  const rng = opts?.rng ?? Math.random
  const rarity = baseItem.rarity

  // Items with no rarity or non-equipable type get no affixes
  if (!rarity) return { ...baseItem }

  const itemApplies = baseItem.type === 'weapon' ? 'weapon'
    : baseItem.type === 'armor' ? 'armor'
    : null

  if (!itemApplies) return { ...baseItem }

  const eligiblePrefixes = PREFIX_AFFIXES.filter(
    a => a.appliesToType === itemApplies || a.appliesToType === 'any'
  )
  const eligibleSuffixes = SUFFIX_AFFIXES.filter(
    a => a.appliesToType === itemApplies || a.appliesToType === 'any'
  )

  const affixes: AffixEntry[] = []

  if (rarity === 'epic' || rarity === 'legendary') {
    // Always 1 prefix + 1 suffix
    if (eligiblePrefixes.length > 0) {
      affixes.push(pickRandom(eligiblePrefixes, rng))
    }
    if (eligibleSuffixes.length > 0) {
      affixes.push(pickRandom(eligibleSuffixes, rng))
    }
  } else if (rarity === 'rare') {
    // 50% chance of getting any affix at all
    if (rng() < AFFIX_CHANCE_BY_RARITY.rare) {
      // Then 50/50: prefix or suffix
      if (rng() < 0.5) {
        if (eligiblePrefixes.length > 0) affixes.push(pickRandom(eligiblePrefixes, rng))
      } else {
        if (eligibleSuffixes.length > 0) affixes.push(pickRandom(eligibleSuffixes, rng))
      }
    }
  } else if (rarity === 'uncommon') {
    // 20% chance of getting any affix at all
    if (rng() < AFFIX_CHANCE_BY_RARITY.uncommon) {
      // 50/50: prefix or suffix
      const pool = rng() < 0.5 ? eligiblePrefixes : eligibleSuffixes
      if (pool.length > 0) affixes.push(pickRandom(pool, rng))
    }
  }
  // common: no affixes

  return { ...baseItem, affixes: affixes.length > 0 ? affixes : undefined }
}

/**
 * Computes the aggregate stat delta contributed by all affixes on an item.
 * Pure function — returns a partial stat record to ADD to player stats during equip math.
 * Does not modify the player or item.
 */
export function affixStatDelta(item: Item): Partial<Record<Stat, number>> {
  const delta: Partial<Record<Stat, number>> = {}
  if (!item.affixes || item.affixes.length === 0) return delta

  for (const affix of item.affixes) {
    if (!affix.statEffect) continue
    for (const [key, value] of Object.entries(affix.statEffect) as [Stat, number][]) {
      delta[key] = (delta[key] ?? 0) + value
    }
  }

  return delta
}

/**
 * Returns the display name of an item with its affixes applied.
 * Format: "[Prefix] [BaseName] [Suffix]"
 * e.g. "Keen Knife of the Brawler"
 *
 * Items with no affixes return their base name unchanged.
 */
export function formatItemName(item: Item): string {
  const affixes = item.affixes ?? []
  const prefix = affixes.find(a => PREFIX_AFFIXES.some(p => p.id === a.id))
  const suffix = affixes.find(a => SUFFIX_AFFIXES.some(s => s.id === a.id))

  let name = item.name
  if (prefix) name = `${prefix.name} ${name}`
  if (suffix) name = `${name} ${suffix.name}`
  return name
}

// ------------------------------------------------------------
// Internal helpers
// ------------------------------------------------------------

function pickRandom<T>(arr: T[], rng: () => number): T {
  const idx = Math.floor(rng() * arr.length)
  return arr[idx]
}
