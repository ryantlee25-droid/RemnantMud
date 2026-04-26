// ============================================================
// spawn.ts — Probabilistic room population system
// Pure functions only. No React, no Supabase.
// ============================================================

import type {
  SpawnPoolEntry,
  SpawnTable,
  SpawnedItem,
  SpawnedNPC,
  PopulatedRoom,
  TimeOfDay,
  QuantityConfig,
} from '@/types/game'

// ------------------------------------------------------------
// weightedRoll
// Select one entry from a pool using weighted random selection.
// Each entry must have a `weight` number field.
// ------------------------------------------------------------

export function weightedRoll<T extends { weight: number }>(pool: T[]): T {
  if (pool.length === 0) throw new Error('weightedRoll: pool must not be empty')
  const total = pool.reduce((sum, entry) => sum + entry.weight, 0)
  let roll = Math.random() * total
  for (const entry of pool) {
    roll -= entry.weight
    if (roll <= 0) return entry
  }
  // Fallback: floating-point edge case — return last entry
  return pool[pool.length - 1]!
}

// ------------------------------------------------------------
// quantityRoll
// Roll a quantity based on DistributionType:
//   flat         — uniform random in [min, max]
//   weighted_low — min of two uniform rolls (biased toward min)
//   weighted_high— max of two uniform rolls (biased toward max)
//   bell         — average of two uniform rolls (bell-like curve)
//   single       — always returns 1
// ------------------------------------------------------------

export function quantityRoll(config: QuantityConfig): number {
  const { min, max, distribution } = config

  if (distribution === 'single') return 1

  const range = max - min

  if (distribution === 'flat') {
    return Math.floor(Math.random() * (range + 1)) + min
  }

  const rollA = Math.floor(Math.random() * (range + 1)) + min
  const rollB = Math.floor(Math.random() * (range + 1)) + min

  if (distribution === 'weighted_low') return Math.min(rollA, rollB)
  if (distribution === 'weighted_high') return Math.max(rollA, rollB)
  // bell: average of two rolls, rounded to nearest integer
  return Math.round((rollA + rollB) / 2)
}

// ------------------------------------------------------------
// spawnCheck
// Determines whether an entity spawns in this room at this time.
// Applies time-of-day modifier and a noise modifier, then clamps
// the final chance to 0.95 before rolling.
// ------------------------------------------------------------

export function spawnCheck(
  baseChance: number,
  timeOfDay: TimeOfDay,
  timeModifiers: Partial<Record<TimeOfDay, number>> = {},
  noiseModifier = 1.0,
): boolean {
  const timeMod = timeModifiers[timeOfDay] ?? 1.0
  const final = Math.min(baseChance * timeMod * noiseModifier, 0.95) // hard cap
  return Math.random() < final
}

// ------------------------------------------------------------
// rollCondition
// Returns a condition value (0.0–1.0) representing item wear.
// Rounded to 2 decimal places.
// ------------------------------------------------------------

export function rollCondition(min = 0.3, max = 1.0): number {
  return Math.round((min + Math.random() * (max - min)) * 100) / 100
}

// ------------------------------------------------------------
// Endgame gate
// Act III content (The Scar, MERIDIAN) requires this many cycles.
// This enforces the 3-run design: players must die at least twice
// to accumulate the echo stats, map knowledge, and narrative
// context needed to reach and survive the endgame.
// ------------------------------------------------------------

export const ENDGAME_MIN_CYCLE = 3

// ------------------------------------------------------------
// computePressure
// Returns the world Pressure level (1–5) based on cycle count.
// Explicit table — intentional pacing, not a formula.
//
//   Cycles 1-2 : Pressure 1 — learning phase, survivable with care
//   Cycles 3-4 : Pressure 2 — echoed stats help; endgame accessible
//   Cycles 5-6 : Pressure 3 — veteran territory, coordinated threats
//   Cycles 7-9 : Pressure 4 — near-constant danger
//   Cycle 10+  : Pressure 5 — maximum — world is actively hostile
//
// The 3-run structure is intentional:
//   Run 1 learns the map, dies to the world's brutality.
//   Run 2 learns the factions and combat, dies pushing deeper.
//   Run 3 (Cycle 3+) has echoed stats + map knowledge + pressure 2.
//   That combination is the designed endgame entry point.
// ------------------------------------------------------------

export function computePressure(cycle: number): number {
  if (cycle <= 2) return 1
  if (cycle <= 4) return 2
  if (cycle <= 6) return 3
  if (cycle <= 9) return 4
  return 5
}

// ------------------------------------------------------------
// pressureModifier
// Converts a pressure level to a spawn-chance multiplier for enemies.
// Items are not affected — only enemy and hostile encounter rates.
// ------------------------------------------------------------

export function pressureModifier(pressure: number): number {
  // Cycle-1 (pressure 1) baseline lifted to 1.10 for M1 density target.
  // +15% per pressure level above 1 (pressure 2+ unchanged in shape).
  if (pressure <= 1) return 1.10
  return 1.10 + (pressure - 1) * 0.15
}

// ------------------------------------------------------------
// populateRoom
// Given a SpawnTable and context, probabilistically determine
// what items, enemies, and NPCs are present in a room.
//
// depletedItemIds — item IDs already taken (from room_state,
//                   used in Phase 4). Depleted items are skipped.
// pressure        — world pressure level 1-5 (from computePressure).
//                   Scales enemy spawn chances (not items or NPCs).
// ------------------------------------------------------------

export function populateRoom(
  spawnTable: SpawnTable,
  timeOfDay: TimeOfDay,
  noiseModifier = 1.0,
  depletedItemIds: string[] = [],
  pressure = 1,
): PopulatedRoom {
  const depletedSet = new Set(depletedItemIds)
  const pressMod = pressureModifier(pressure)

  // --- Items ---
  const items: SpawnedItem[] = []
  for (const entry of spawnTable.items) {
    if (depletedSet.has(entry.id)) continue
    if (!spawnCheck(entry.spawnChance, timeOfDay, entry.timeModifiers, noiseModifier)) continue
    const count = quantityRoll(entry.quantity)
    for (let i = 0; i < count; i++) {
      items.push({
        itemId: entry.id,
        condition: rollCondition(),
      })
    }
  }

  // --- Enemies — apply pressure modifier ---
  const enemyIds: string[] = []
  for (const entry of spawnTable.enemies) {
    if (!spawnCheck(entry.spawnChance * pressMod, timeOfDay, entry.timeModifiers, noiseModifier)) continue
    // At higher pressure, enemy groups can be slightly larger
    const countConfig = pressure >= 3
      ? { ...entry.quantity, max: Math.min(entry.quantity.max + 1, 6) }
      : entry.quantity
    const count = quantityRoll(countConfig)
    for (let i = 0; i < count; i++) {
      enemyIds.push(entry.id)
    }
  }

  // --- NPCs ---
  const npcs: SpawnedNPC[] = []
  for (const entry of spawnTable.npcs) {
    if (!spawnCheck(entry.spawnChance, timeOfDay, entry.timeModifiers, noiseModifier)) continue
    npcs.push({
      npcId: entry.id,
      activity: 'idle',           // Phase 3 will roll from activity pool
      disposition: 'neutral',     // Phase 3 will vary this
    })
  }

  return {
    items,
    enemyIds,
    npcs,
    ambientLines: [],             // Phase 3 ambient system
  }
}
