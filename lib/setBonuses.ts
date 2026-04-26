import type { Player, Stat, InventoryItem } from '@/types/game'

// ------------------------------------------------------------
// Set Definitions
// Convoy 2 H10 — set-bonus system
// Three sets: Salter Executioner, Accord Inquisitor, Kindling Purifier
// Each has 4 pieces, 2-piece and 4-piece thresholds.
// ------------------------------------------------------------

export interface SetDefinition {
  setId: string
  name: string                       // display name
  pieces: number                     // total pieces in the set
  thresholds: {
    [pieceCount: number]: {
      statBonus?: Partial<Record<Stat, number>>
      description: string
    }
  }
}

export const SETS: SetDefinition[] = [
  {
    setId: 'salter_executioner',
    name: "Executioner's Garb",
    pieces: 4,
    thresholds: {
      2: { statBonus: { vigor: 1 }, description: 'Two-piece: +1 vigor.' },
      4: { statBonus: { vigor: 2, grit: 1 }, description: 'Four-piece: +2 vigor, +1 grit.' },
    },
  },
  {
    setId: 'accord_inquisitor',
    name: "Inquisitor's Vestments",
    pieces: 4,
    thresholds: {
      2: { statBonus: { presence: 1 }, description: 'Two-piece: +1 presence.' },
      4: { statBonus: { presence: 2, wits: 1 }, description: 'Four-piece: +2 presence, +1 wits.' },
    },
  },
  {
    setId: 'kindling_purifier',
    name: "Purifier's Robes",
    pieces: 4,
    thresholds: {
      2: { statBonus: { wits: 1 }, description: 'Two-piece: +1 wits.' },
      4: {
        statBonus: { wits: 2, presence: 1 },
        description:
          'Four-piece: +2 wits, +1 presence (and burning condition immunity in fire zones — flavor only).',
      },
    },
  },
]

// ------------------------------------------------------------
// countActiveSetPieces
// Counts equipped armor pieces per setId from a resolved inventory list.
// Only armor-type items with a setId contribute to set bonuses.
// ------------------------------------------------------------

export function countActiveSetPieces(inventory: InventoryItem[]): Record<string, number> {
  const counts: Record<string, number> = {}

  for (const invItem of inventory) {
    if (!invItem.equipped) continue
    if (invItem.item.type !== 'armor') continue
    const setId = invItem.item.setId
    if (!setId) continue
    counts[setId] = (counts[setId] ?? 0) + 1
  }

  return counts
}

// ------------------------------------------------------------
// getSetBonusDelta
// Returns the cumulative stat bonus that should be active given the
// currently-equipped set pieces in `inventory`.
//
// Computes the TOTAL bonus for the highest active threshold only —
// NOT each threshold independently stacked.
//
// Example:
//   Set thresholds: 2-piece: { vigor: 1 }, 4-piece: { vigor: 2, grit: 1 }
//   With 4 pieces equipped → delta is { vigor: 2, grit: 1 }
//   NOT { vigor: 3, grit: 1 } (2-piece and 4-piece do NOT stack together).
//
// The `player` parameter is included for future extensibility (e.g. class-
// conditional set bonuses) but is not used in this v1 implementation.
// The caller (inventory.ts) manages applying the delta diff to the player.
// ------------------------------------------------------------

export function getSetBonusDelta(
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  _player: Player,
  inventory: InventoryItem[],
): Partial<Record<Stat, number>> {
  const activePieces = countActiveSetPieces(inventory)
  const delta: Partial<Record<Stat, number>> = {}

  for (const set of SETS) {
    const active = activePieces[set.setId] ?? 0
    if (active === 0) continue

    // Find the highest threshold the player currently qualifies for
    const qualifiedThresholds = Object.keys(set.thresholds)
      .map(Number)
      .filter((threshold) => active >= threshold)

    if (qualifiedThresholds.length === 0) continue

    const highestThreshold = Math.max(...qualifiedThresholds)
    const bonusEntry = set.thresholds[highestThreshold]
    if (!bonusEntry?.statBonus) continue

    // Accumulate stats from this set's active threshold
    for (const [stat, val] of Object.entries(bonusEntry.statBonus) as [Stat, number][]) {
      delta[stat] = (delta[stat] ?? 0) + val
    }
  }

  return delta
}

// ------------------------------------------------------------
// getActiveSetSummaries
// Returns human-readable descriptions of currently-active set bonuses.
// Used by UI to display which set thresholds are active.
// ------------------------------------------------------------

export function getActiveSetSummaries(player: Player, inventory: InventoryItem[]): string[] {
  const activePieces = countActiveSetPieces(inventory)
  const summaries: string[] = []

  for (const set of SETS) {
    const active = activePieces[set.setId] ?? 0
    if (active === 0) continue

    const qualifiedThresholds = Object.keys(set.thresholds)
      .map(Number)
      .filter((threshold) => active >= threshold)

    if (qualifiedThresholds.length === 0) continue

    const highestThreshold = Math.max(...qualifiedThresholds)
    const bonusEntry = set.thresholds[highestThreshold]
    summaries.push(`${set.name} (${active}/${set.pieces}): ${bonusEntry.description}`)
  }

  // Player param reserved for future class-conditional filtering
  void player

  return summaries
}
