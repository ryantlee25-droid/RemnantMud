// ============================================================
// lib/wanderers.ts — Wandering Enemies System
// Convoy: battle-mud-pivot | H2
//
// Pressure-driven mob movement between rooms.
// Late-game zones (pressure ≥ 3) can have up to 3 concurrent
// wanderers that drift between rooms, creating non-static threats.
//
// Wanderers do NOT auto-engage the player. If the player enters
// a room containing a wanderer, its enemyId is injected into that
// room's enemies array transiently (not persisted to room data).
// ============================================================

import type { Wanderer, GameState, ZoneType, Room } from '@/types/game'
import { ENEMIES } from '@/data/enemies'

// ------------------------------------------------------------
// Configuration
// ------------------------------------------------------------

export const WANDERER_CONFIG = {
  /** Hard cap — never more than 3 active wanderers world-wide */
  maxConcurrent: 3,
  /** 5% per zone-tick to spawn a new one if under cap */
  spawnChancePerTick: 0.05,
  /** 30% per tick a wanderer moves to a neighboring room */
  moveChancePerTick: 0.30,
  /** Wanderer despawns after 80 actions */
  ttlActions: 80,
  /** Pressure level required to spawn wanderers (cycle-1 will never see them) */
  pressureThreshold: 3,
  /** Late zones only — early areas stay safe */
  zoneEligibility: [
    'the_breaks',
    'the_dust',
    'the_pine_sea',
    'the_deep',
    'the_scar',
    'the_pens',
  ] as ZoneType[],
}

// ------------------------------------------------------------
// Internal helpers
// ------------------------------------------------------------

/**
 * Returns true if a room is ineligible for wanderer spawning.
 * Rooms with safeRest, noCombat, or questHub flags are excluded.
 */
function isRoomExcluded(room: Room): boolean {
  return !!(room.flags.safeRest || room.flags.noCombat || room.flags.questHub)
}

/**
 * Collect all enemy IDs that appear in a zone's hollow encounter threat pools.
 * Falls back to a default set of hollow enemies if no pool is found.
 */
function getZoneEnemyPool(rooms: Map<string, Room>, zone: ZoneType): string[] {
  const pool = new Set<string>()

  for (const room of rooms.values()) {
    if (room.zone !== zone) continue
    if (isRoomExcluded(room)) continue
    if (room.hollowEncounter?.threatPool) {
      for (const entry of room.hollowEncounter.threatPool) {
        // entry.type is a HollowType key — map to enemy id
        if (entry.type && ENEMIES[entry.type]) {
          pool.add(entry.type)
        }
      }
    }
    // Also include static enemies in the room data
    for (const eid of room.enemies) {
      if (ENEMIES[eid]) pool.add(eid)
    }
  }

  // Fallback: any zone in the eligibility list should have at least shufflers
  if (pool.size === 0) {
    pool.add('shuffler')
  }

  return [...pool]
}

/**
 * Get all eligible spawn rooms for a zone (non-excluded).
 */
function getEligibleRooms(rooms: Map<string, Room>, zone: ZoneType): Room[] {
  const eligible: Room[] = []
  for (const room of rooms.values()) {
    if (room.zone !== zone) continue
    if (isRoomExcluded(room)) continue
    eligible.push(room)
  }
  return eligible
}

/**
 * Get neighboring room IDs that are in the same zone and not excluded.
 */
function getEligibleNeighbors(room: Room, rooms: Map<string, Room>): string[] {
  const neighbors: string[] = []
  for (const destId of Object.values(room.exits)) {
    if (!destId) continue
    const neighbor = rooms.get(destId)
    if (!neighbor) continue
    if (neighbor.zone !== room.zone) continue
    if (isRoomExcluded(neighbor)) continue
    neighbors.push(destId)
  }
  return neighbors
}

// ------------------------------------------------------------
// Main tick function
// ------------------------------------------------------------

export interface WandererTickResult {
  wanderers: Wanderer[]
  spawnedNew: Wanderer | null
  movedExisting: { id: string; from: string; to: string } | null
}

/**
 * Tick the wanderer system. Called after every player movement.
 *
 * 1. Decrement TTL on all existing wanderers; remove any with TTL ≤ 0.
 * 2. For each existing wanderer, with moveChancePerTick, pick a random
 *    neighboring room within the same zone. If no eligible neighbor, stay put.
 * 3. If under maxConcurrent AND zone pressure ≥ threshold AND spawnChance
 *    rolls true, spawn a new wanderer in a random eligible zone/room.
 * 4. Return updated wanderers array + telemetry.
 *
 * @param state   Current GameState (reads wanderers, player.hollowPressure)
 * @param rooms   Map of roomId → Room (static world data)
 * @param rng     Random number generator (injectable for tests)
 */
export function tickWanderers(
  state: GameState,
  rooms: Map<string, Room>,
  rng: () => number,
): WandererTickResult {
  const {
    maxConcurrent,
    spawnChancePerTick,
    moveChancePerTick,
    ttlActions,
    pressureThreshold,
    zoneEligibility,
  } = WANDERER_CONFIG

  // Current wanderer list (may be undefined on first call)
  let wanderers: Wanderer[] = [...(state.wanderers ?? [])]

  // -- Step 1: Decrement TTL, cull expired wanderers --
  wanderers = wanderers
    .map(w => ({ ...w, ttl: w.ttl - 1 }))
    .filter(w => w.ttl > 0)

  // -- Step 2: Move existing wanderers --
  let movedExisting: WandererTickResult['movedExisting'] = null

  wanderers = wanderers.map(w => {
    if (rng() > moveChancePerTick) return w   // chance test: rng > threshold means NO move

    const room = rooms.get(w.currentRoomId)
    if (!room) return w

    const neighbors = getEligibleNeighbors(room, rooms)
    if (neighbors.length === 0) return w

    const newRoomId = neighbors[Math.floor(rng() * neighbors.length)]!
    const playerActionsTaken = state.player?.actionsTaken ?? 0

    // Record telemetry for the first wanderer that moves this tick
    if (!movedExisting) {
      movedExisting = { id: w.id, from: w.currentRoomId, to: newRoomId }
    }

    return { ...w, currentRoomId: newRoomId, lastMovedAt: playerActionsTaken }
  })

  // -- Step 3: Maybe spawn a new wanderer --
  let spawnedNew: Wanderer | null = null

  const pressure = state.player?.hollowPressure ?? 0
  const pressureMet = pressure >= pressureThreshold
  const underCap = wanderers.length < maxConcurrent
  const spawnRolled = rng() < spawnChancePerTick

  if (pressureMet && underCap && spawnRolled) {
    // Pick a random eligible zone
    const eligibleZones = zoneEligibility.filter(zone => {
      const eligibleRooms = getEligibleRooms(rooms, zone)
      return eligibleRooms.length > 0
    })

    if (eligibleZones.length > 0) {
      const zone = eligibleZones[Math.floor(rng() * eligibleZones.length)]!
      const eligibleRooms = getEligibleRooms(rooms, zone)

      if (eligibleRooms.length > 0) {
        const room = eligibleRooms[Math.floor(rng() * eligibleRooms.length)]!
        const enemyPool = getZoneEnemyPool(rooms, zone)
        const enemyId = enemyPool[Math.floor(rng() * enemyPool.length)]!
        const playerActionsTaken = state.player?.actionsTaken ?? 0

        const newWanderer: Wanderer = {
          id: crypto.randomUUID(),
          enemyId,
          currentRoomId: room.id,
          zone,
          ttl: ttlActions,
          lastMovedAt: playerActionsTaken,
        }

        wanderers = [...wanderers, newWanderer]
        spawnedNew = newWanderer
      }
    }
  }

  return { wanderers, spawnedNew, movedExisting }
}
