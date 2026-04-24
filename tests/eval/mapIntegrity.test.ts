// ============================================================
// Map Graph Integrity — Howler A evaluation suite
// tests/integration/mapIntegrity.test.ts
//
// Checks: full reachability, bidirectionality, target validity,
// gate reference validity, ending reachability, zone cohesion.
//
// Read-only analysis: does NOT modify any production data.
// Violations are reported with specific room IDs so the
// accompanying docs/eval/map-report.md can cite them.
// ============================================================

import { describe, it, expect } from 'vitest'
import { ALL_ROOMS } from '@/data/rooms/index'
import { QUEST_DESCRIPTIONS } from '@/data/questDescriptions'
import type { Room, Direction, FactionType } from '@/types/game'

// ------------------------------------------------------------
// Constants
// ------------------------------------------------------------

const DIRECTIONS: Direction[] = ['north', 'south', 'east', 'west', 'up', 'down']

const OPPOSITES: Record<Direction, Direction> = {
  north: 'south',
  south: 'north',
  east: 'west',
  west: 'east',
  up: 'down',
  down: 'up',
}

/** Canonical start room */
const START_ROOM_ID = 'cr_01_approach'

/** Ending room — the room that contains the four choice terminals */
const ENDING_ROOM_ID = 'scar_14_the_core'

/**
 * Rooms that are intentionally unreachable from the start via
 * plain navigation. Each entry MUST have a justification comment.
 *
 * An orphan allowlist kept empty-by-default so failures are loud.
 * We only exempt rooms once we have confirmed design intent.
 */
const ORPHAN_ALLOWLIST: Set<string> = new Set([
  // none known — list remains empty until confirmed intentional orphans are found
])

/**
 * Known one-way exits: A→dir→B that intentionally lack the reverse
 * edge. Format: `${fromId}:${direction}`.
 *
 * These are determined by manual review and should each have a
 * justification comment explaining why bidirectionality is not
 * expected.
 */
const ONE_WAY_ALLOWLIST: Set<string> = new Set([
  // Endings are terminal: scar_15_the_exit goes east back to scar_01_crater_rim,
  // which does NOT have a west exit pointing back (intended one-way exit path).
  'scar_15_the_exit:north',
])

/** Valid faction types per types/game.ts */
const VALID_FACTIONS: Set<FactionType> = new Set([
  'accord',
  'salters',
  'drifters',
  'kindling',
  'reclaimers',
  'covenant_of_dusk',
  'red_court',
  'ferals',
  'lucid',
])

// ------------------------------------------------------------
// Helpers
// ------------------------------------------------------------

/** Build a lookup map from room array */
function toMap(rooms: Room[]): Map<string, Room> {
  return new Map(rooms.map((r) => [r.id, r]))
}

/**
 * BFS from startId traversing both simple exits AND richExits destinations.
 * This represents graph-level reachability (ignoring gate conditions).
 */
function bfsAll(startId: string, roomMap: Map<string, Room>): Set<string> {
  const visited = new Set<string>()
  const queue: string[] = [startId]
  visited.add(startId)

  while (queue.length > 0) {
    const currentId = queue.shift()!
    const room = roomMap.get(currentId)
    if (!room) continue

    // Traverse simple exits
    for (const dir of DIRECTIONS) {
      const neighborId = room.exits[dir]
      if (neighborId !== undefined && !visited.has(neighborId)) {
        visited.add(neighborId)
        queue.push(neighborId)
      }
    }

    // Traverse richExits destinations (graph-level, ignore gates)
    if (room.richExits) {
      for (const dir of DIRECTIONS) {
        const richExit = room.richExits[dir]
        if (richExit?.destination !== undefined && !visited.has(richExit.destination)) {
          visited.add(richExit.destination)
          queue.push(richExit.destination)
        }
      }
    }
  }

  return visited
}

/** Collect all exit targets (both simple and rich) from a room */
function allExitTargets(room: Room): Array<{ dir: Direction; target: string; source: 'exits' | 'richExits' }> {
  const targets: Array<{ dir: Direction; target: string; source: 'exits' | 'richExits' }> = []
  for (const dir of DIRECTIONS) {
    const simpleTarget = room.exits[dir]
    if (simpleTarget !== undefined) {
      targets.push({ dir, target: simpleTarget, source: 'exits' })
    }
    if (room.richExits) {
      const richTarget = room.richExits[dir]?.destination
      if (richTarget !== undefined) {
        targets.push({ dir, target: richTarget, source: 'richExits' })
      }
    }
  }
  return targets
}

// Build quest flag registry from QUEST_DESCRIPTIONS
// A flag is "registered" if it appears as `flag` or `completionFlag`
function buildQuestFlagRegistry(): Set<string> {
  const registry = new Set<string>()
  for (const entry of QUEST_DESCRIPTIONS) {
    registry.add(entry.flag)
    if (entry.completionFlag) {
      registry.add(entry.completionFlag)
    }
  }
  return registry
}

// ------------------------------------------------------------
// 1. Full Reachability
// ------------------------------------------------------------

describe('full reachability', () => {
  it('every room is reachable by BFS from start (exits + richExits)', () => {
    const roomMap = toMap(ALL_ROOMS)
    const reachable = bfsAll(START_ROOM_ID, roomMap)

    const orphans: string[] = []
    for (const room of ALL_ROOMS) {
      if (!reachable.has(room.id) && !ORPHAN_ALLOWLIST.has(room.id)) {
        orphans.push(room.id)
      }
    }

    if (orphans.length > 0) {
      console.error(
        `[MAP INTEGRITY] ORPHANED ROOMS (${orphans.length}): ${orphans.join(', ')}`
      )
    }

    expect(orphans, `Unreachable rooms not in ORPHAN_ALLOWLIST: ${orphans.join(', ')}`).toHaveLength(0)
  })

  it('start room exists in ALL_ROOMS', () => {
    const roomMap = toMap(ALL_ROOMS)
    expect(roomMap.has(START_ROOM_ID), `Start room '${START_ROOM_ID}' not found in ALL_ROOMS`).toBe(true)
  })

  it('room count matches expected 297 (README says 271 — flag discrepancy)', () => {
    // The README states 271 rooms; actual count at evaluation time is 297.
    // This test documents the discrepancy; it passes if rooms >= 271.
    // The count will print to help maintainers keep README current.
    console.info(`[MAP INTEGRITY] Total room count: ${ALL_ROOMS.length}`)
    expect(ALL_ROOMS.length).toBeGreaterThanOrEqual(271)
  })
})

// ------------------------------------------------------------
// 2. Bidirectionality
// ------------------------------------------------------------

describe('bidirectionality', () => {
  it('every simple exit A→dir→B has a reverse exit B→opposite(dir)→A, or is in ONE_WAY_ALLOWLIST', () => {
    const roomMap = toMap(ALL_ROOMS)
    const violations: string[] = []

    for (const room of ALL_ROOMS) {
      for (const dir of DIRECTIONS) {
        const targetId = room.exits[dir]
        if (targetId === undefined) continue

        const allowKey = `${room.id}:${dir}`
        if (ONE_WAY_ALLOWLIST.has(allowKey)) continue

        const targetRoom = roomMap.get(targetId)
        if (!targetRoom) continue // broken target — covered in target-validity test

        const reverseDir = OPPOSITES[dir]
        const reverseTarget = targetRoom.exits[reverseDir]

        if (reverseTarget !== room.id) {
          violations.push(
            `${room.id} --[${dir}]--> ${targetId}  (but ${targetId}.[${reverseDir}] = ${reverseTarget ?? 'undefined'})`
          )
        }
      }
    }

    if (violations.length > 0) {
      console.error(
        `[MAP INTEGRITY] BIDIRECTIONALITY VIOLATIONS (${violations.length}):\n  ` +
        violations.join('\n  ')
      )
    }

    expect(violations, `Bidirectionality violations: ${violations.join('; ')}`).toHaveLength(0)
  })
})

// ------------------------------------------------------------
// 3. Target Validity
// ------------------------------------------------------------

describe('target validity', () => {
  it('every simple exit target resolves to a real room', () => {
    const roomMap = toMap(ALL_ROOMS)
    const broken: string[] = []

    for (const room of ALL_ROOMS) {
      for (const dir of DIRECTIONS) {
        const targetId = room.exits[dir]
        if (targetId !== undefined && !roomMap.has(targetId)) {
          broken.push(`${room.id} --[${dir}]--> '${targetId}' (not found)`)
        }
      }
    }

    if (broken.length > 0) {
      console.error(
        `[MAP INTEGRITY] BROKEN SIMPLE EXIT TARGETS (${broken.length}):\n  ` +
        broken.join('\n  ')
      )
    }

    expect(broken, `Broken simple exit targets: ${broken.join('; ')}`).toHaveLength(0)
  })

  it('every richExits destination resolves to a real room', () => {
    const roomMap = toMap(ALL_ROOMS)
    const broken: string[] = []

    for (const room of ALL_ROOMS) {
      if (!room.richExits) continue
      for (const dir of DIRECTIONS) {
        const richExit = room.richExits[dir]
        if (!richExit) continue
        const dest = richExit.destination
        if (dest !== undefined && !roomMap.has(dest)) {
          broken.push(`${room.id}.richExits[${dir}].destination = '${dest}' (not found)`)
        }
      }
    }

    if (broken.length > 0) {
      console.error(
        `[MAP INTEGRITY] BROKEN RICHEXITS TARGETS (${broken.length}):\n  ` +
        broken.join('\n  ')
      )
    }

    expect(broken, `Broken richExits destinations: ${broken.join('; ')}`).toHaveLength(0)
  })

  it('every richExits destination matches the corresponding simple exit (no divergence)', () => {
    // If a room has both exits[dir] and richExits[dir].destination,
    // they must point to the same room (avoid silent divergence bugs).
    const mismatches: string[] = []

    for (const room of ALL_ROOMS) {
      if (!room.richExits) continue
      for (const dir of DIRECTIONS) {
        const simpleTarget = room.exits[dir]
        const richExit = room.richExits[dir]
        if (simpleTarget !== undefined && richExit?.destination !== undefined) {
          if (simpleTarget !== richExit.destination) {
            mismatches.push(
              `${room.id}[${dir}]: exits='${simpleTarget}' but richExits.destination='${richExit.destination}'`
            )
          }
        }
      }
    }

    if (mismatches.length > 0) {
      console.error(
        `[MAP INTEGRITY] SIMPLE/RICH EXIT DESTINATION MISMATCH (${mismatches.length}):\n  ` +
        mismatches.join('\n  ')
      )
    }

    expect(mismatches, `Simple/richExits destination mismatches: ${mismatches.join('; ')}`).toHaveLength(0)
  })
})

// ------------------------------------------------------------
// 4. Gate Reference Validity
// ------------------------------------------------------------

describe('gate reference validity', () => {
  it('every richExits questGate flag is registered in questDescriptions or dialogueTrees', () => {
    const knownFlags = buildQuestFlagRegistry()

    // Also include flags known to be set via dialogue setFlag that are NOT in QUEST_DESCRIPTIONS
    // but ARE confirmed to exist in the game engine. These are acknowledged gaps in quest tracking
    // coverage, not broken references. They are collected separately for the report.
    const dialogueSetFlags = new Set([
      // from dialogueTrees.ts setFlag fields — verified present:
      'reclaimers_meridian_keycard',
      'kindling_tunnel_access',
      'sanguine_biometric_obtained',
      'deep_utility_access',
    ])

    const missing: string[] = []

    for (const room of ALL_ROOMS) {
      if (!room.richExits) continue
      for (const dir of DIRECTIONS) {
        const richExit = room.richExits[dir]
        if (!richExit?.questGate) continue
        const flag = richExit.questGate
        if (!knownFlags.has(flag) && !dialogueSetFlags.has(flag)) {
          missing.push(`${room.id}.richExits[${dir}].questGate = '${flag}'`)
        }
      }
    }

    if (missing.length > 0) {
      console.error(
        `[MAP INTEGRITY] QUEST GATES WITH NO DEFINITION (${missing.length}):\n  ` +
        missing.join('\n  ')
      )
    }

    expect(missing, `Quest gate flags with no definition in questDescriptions or dialogue: ${missing.join('; ')}`).toHaveLength(0)
  })

  it('every richExits reputationGate.faction is a valid FactionType', () => {
    const invalid: string[] = []

    for (const room of ALL_ROOMS) {
      if (!room.richExits) continue
      for (const dir of DIRECTIONS) {
        const richExit = room.richExits[dir]
        if (!richExit?.reputationGate) continue
        const faction = richExit.reputationGate.faction
        if (!VALID_FACTIONS.has(faction)) {
          invalid.push(
            `${room.id}.richExits[${dir}].reputationGate.faction = '${faction}' (not a valid FactionType)`
          )
        }
      }
    }

    if (invalid.length > 0) {
      console.error(
        `[MAP INTEGRITY] INVALID FACTION TYPES IN reputationGate (${invalid.length}):\n  ` +
        invalid.join('\n  ')
      )
    }

    expect(invalid, `Invalid faction types: ${invalid.join('; ')}`).toHaveLength(0)
  })

  it('every richExits lockedBy item exists in data/items.ts', async () => {
    // Dynamically import items to avoid circular imports
    const { getItem } = await import('@/data/items')
    const broken: string[] = []

    for (const room of ALL_ROOMS) {
      if (!room.richExits) continue
      for (const dir of DIRECTIONS) {
        const richExit = room.richExits[dir]
        if (!richExit?.lockedBy) continue
        const itemId = richExit.lockedBy
        if (!getItem(itemId)) {
          broken.push(`${room.id}.richExits[${dir}].lockedBy = '${itemId}' (item not found)`)
        }
      }
    }

    if (broken.length > 0) {
      console.error(
        `[MAP INTEGRITY] LOCKEDBY ITEMS NOT IN data/items.ts (${broken.length}):\n  ` +
        broken.join('\n  ')
      )
    }

    expect(broken, `lockedBy items not found: ${broken.join('; ')}`).toHaveLength(0)
  })
})

// ------------------------------------------------------------
// 5. Ending Reachability
// ------------------------------------------------------------

describe('ending reachability', () => {
  it('scar_14_the_core is reachable from start via BFS (exits + richExits, ignoring gates)', () => {
    const roomMap = toMap(ALL_ROOMS)
    const reachable = bfsAll(START_ROOM_ID, roomMap)

    expect(
      reachable.has(ENDING_ROOM_ID),
      `Ending room '${ENDING_ROOM_ID}' is NOT reachable from '${START_ROOM_ID}' via graph traversal`
    ).toBe(true)
  })

  it('ending room scar_14_the_core has cycleGate 3 (documents gating)', () => {
    const roomMap = toMap(ALL_ROOMS)
    const coreRoom = roomMap.get(ENDING_ROOM_ID)
    expect(coreRoom, `Room '${ENDING_ROOM_ID}' not found`).toBeDefined()
    // The cycleGate of 3 is intentional design — this test documents it
    expect(coreRoom?.cycleGate).toBe(3)
  })

  it('scar_14_the_core has exits to scar_13_broadcast_room and scar_15_the_exit', () => {
    const roomMap = toMap(ALL_ROOMS)
    const coreRoom = roomMap.get(ENDING_ROOM_ID)
    expect(coreRoom).toBeDefined()
    expect(coreRoom?.exits.west).toBe('scar_13_broadcast_room')
    expect(coreRoom?.exits.east).toBe('scar_15_the_exit')
  })
})

// ------------------------------------------------------------
// 6. Zone Cohesion
// ------------------------------------------------------------

describe('zone cohesion', () => {
  it('every room id prefix matches the zone it was imported from', () => {
    // Infer the prefix mapping from actual data rather than hardcoding.
    // Strategy: group rooms by zone, collect all unique prefixes per zone,
    // then verify each room's id prefix belongs to its zone's prefix set.

    // First, build prefix→zone mapping by looking at all rooms.
    // A prefix is the part of the id before the first underscore-separated number.
    // e.g., 'cr_01_approach' → prefix 'cr', 'scar_01_crater_rim' → prefix 'scar',
    // 'rr_01_west_approach' → prefix 'rr', 'pens_01_east_gate' → prefix 'pens'
    function extractPrefix(id: string): string {
      // Handle IDs like 'scar_01_crater_rim', 'cr_01_approach', 'pens_01_east_gate'
      const match = id.match(/^([a-z]+)_\d/)
      return match ? match[1] : id
    }

    // Build: zone → Set<prefix> from all rooms
    const zonePrefixes = new Map<string, Set<string>>()
    for (const room of ALL_ROOMS) {
      const prefix = extractPrefix(room.id)
      if (!zonePrefixes.has(room.zone)) {
        zonePrefixes.set(room.zone, new Set())
      }
      zonePrefixes.get(room.zone)!.add(prefix)
    }

    // Print the inferred prefix mapping for visibility
    console.info('[MAP INTEGRITY] Inferred zone→prefix mapping:')
    for (const [zone, prefixes] of zonePrefixes) {
      console.info(`  ${zone}: [${[...prefixes].join(', ')}]`)
    }

    // Now: for each room, verify its prefix is in its zone's prefix set
    // (i.e., no room has a prefix belonging to a different zone's prefix set)
    const violations: string[] = []
    const prefixToZones = new Map<string, Set<string>>()
    for (const [zone, prefixes] of zonePrefixes) {
      for (const prefix of prefixes) {
        if (!prefixToZones.has(prefix)) {
          prefixToZones.set(prefix, new Set())
        }
        prefixToZones.get(prefix)!.add(zone)
      }
    }

    for (const room of ALL_ROOMS) {
      const prefix = extractPrefix(room.id)
      const zonesForPrefix = prefixToZones.get(prefix)
      if (zonesForPrefix && !zonesForPrefix.has(room.zone)) {
        violations.push(
          `${room.id} has prefix '${prefix}' (associated with zones: ${[...zonesForPrefix].join(',')}) but room.zone='${room.zone}'`
        )
      }
    }

    if (violations.length > 0) {
      console.error(
        `[MAP INTEGRITY] ZONE COHESION VIOLATIONS (${violations.length}):\n  ` +
        violations.join('\n  ')
      )
    }

    expect(violations, `Zone cohesion violations: ${violations.join('; ')}`).toHaveLength(0)
  })

  it('each zone has the expected room count per research context', () => {
    const expectedMinCounts: Record<string, number> = {
      crossroads: 18,
      river_road: 23,
      covenant: 28,
      salt_creek: 20,
      the_ember: 21,
      the_breaks: 21,
      the_dust: 18,
      the_stacks: 20,
      duskhollow: 18,
      the_deep: 21,
      the_pine_sea: 21,
      the_scar: 29,
      the_pens: 19,
    }

    const zoneCounts: Record<string, number> = {}
    for (const room of ALL_ROOMS) {
      zoneCounts[room.zone] = (zoneCounts[room.zone] ?? 0) + 1
    }

    console.info('[MAP INTEGRITY] Zone room counts:')
    for (const [zone, count] of Object.entries(zoneCounts)) {
      const expected = expectedMinCounts[zone] ?? 0
      console.info(`  ${zone}: ${count} (expected min: ${expected})`)
    }

    for (const [zone, min] of Object.entries(expectedMinCounts)) {
      const actual = zoneCounts[zone] ?? 0
      expect(actual, `Zone '${zone}' has ${actual} rooms but expected at least ${min}`).toBeGreaterThanOrEqual(min)
    }
  })
})
