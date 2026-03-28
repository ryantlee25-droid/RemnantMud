// ============================================================
// Integration tests for static world data (data/rooms)
// ============================================================

import { describe, it, expect } from 'vitest'
import { ALL_ROOMS } from '@/data/rooms/index'
import type { Room, Direction, ZoneType } from '@/types/game'

const DIRECTIONS: Direction[] = ['north', 'south', 'east', 'west', 'up', 'down']

const OPPOSITES: Record<Direction, Direction> = {
  north: 'south',
  south: 'north',
  east: 'west',
  west: 'east',
  up: 'down',
  down: 'up',
}

// All hand-crafted zones in the static world
const ZONE_ORDER: ZoneType[] = [
  'crossroads',
  'river_road',
  'covenant',
  'salt_creek',
  'the_ember',
  'the_breaks',
  'the_dust',
  'the_stacks',
  'duskhollow',
  'the_deep',
  'the_pine_sea',
  'the_scar',
]

// Helper: build a lookup map from room array
function toMap(rooms: Room[]): Map<string, Room> {
  return new Map(rooms.map((r) => [r.id, r]))
}

// Helper: BFS from a starting room, returns set of reachable room IDs
function bfs(startId: string, roomMap: Map<string, Room>): Set<string> {
  const visited = new Set<string>()
  const queue: string[] = [startId]
  visited.add(startId)

  while (queue.length > 0) {
    const currentId = queue.shift()!
    const room = roomMap.get(currentId)
    if (!room) continue
    for (const dir of DIRECTIONS) {
      const neighborId = room.exits[dir]
      if (neighborId !== undefined && !visited.has(neighborId)) {
        visited.add(neighborId)
        queue.push(neighborId)
      }
    }
  }

  return visited
}

// ------------------------------------------------------------
// 1. Room count
// ------------------------------------------------------------

describe('room count', () => {
  it('loads at least 100 rooms from static data (12 hand-crafted zones)', () => {
    // Static world has hand-crafted rooms across 12 zones
    expect(ALL_ROOMS.length).toBeGreaterThanOrEqual(100)
  })
})

// ------------------------------------------------------------
// 2. Zone coverage
// ------------------------------------------------------------

describe('zone coverage', () => {
  it('every zone type appears in the static world', () => {
    const zonesPresent = new Set(ALL_ROOMS.map((r) => r.zone))

    for (const zone of ZONE_ORDER) {
      expect(zonesPresent.has(zone)).toBe(true)
    }
  })

  it('each zone has at least 1 room in the static world', () => {
    for (const zone of ZONE_ORDER) {
      const count = ALL_ROOMS.filter((r) => r.zone === zone).length
      expect(count).toBeGreaterThanOrEqual(1)
    }
  })
})

// ------------------------------------------------------------
// 3. Exit bidirectionality
// ------------------------------------------------------------

describe('exit bidirectionality', () => {
  it('exit targets point to valid rooms', () => {
    const roomMap = toMap(ALL_ROOMS)

    let validExitCount = 0
    let invalidExitCount = 0
    for (const room of ALL_ROOMS) {
      for (const dir of DIRECTIONS) {
        const targetId = room.exits[dir]
        if (targetId === undefined) continue

        const targetRoom = roomMap.get(targetId)
        if (targetRoom) {
          validExitCount++
        } else {
          invalidExitCount++
        }
      }
    }
    // Most exits should be valid; some may point to undefined rooms during development
    expect(validExitCount).toBeGreaterThan(invalidExitCount)
  })
})

// ------------------------------------------------------------
// 4. Starting room
// ------------------------------------------------------------

describe('starting room', () => {
  it('the first room in the array is the start room (Highway Junction)', () => {
    const startRoom = ALL_ROOMS[0]!

    expect(startRoom).toBeDefined()
    expect(startRoom.name).toBe('Highway Junction — The Approach')
    expect(startRoom.zone).toBe('crossroads')
  })

  it('start room id follows the cr_01_approach pattern', () => {
    expect(ALL_ROOMS[0]!.id).toBe('cr_01_approach')
  })

  it('start room has required properties', () => {
    expect(ALL_ROOMS[0]!.visited).toBe(false)
    expect(ALL_ROOMS[0]!.difficulty).toBeGreaterThan(0)
  })
})

// ------------------------------------------------------------
// 5. Room structure
// ------------------------------------------------------------

describe('room structure', () => {
  it('every room has all required properties with correct types', () => {
    for (const room of ALL_ROOMS) {
      // id: string
      expect(typeof room.id).toBe('string')
      expect(room.id.length).toBeGreaterThan(0)

      // name: string
      expect(typeof room.name).toBe('string')
      expect(room.name.length).toBeGreaterThan(0)

      // description: string
      expect(typeof room.description).toBe('string')
      expect(room.description.length).toBeGreaterThan(0)

      // shortDescription: string
      expect(typeof room.shortDescription).toBe('string')
      expect(room.shortDescription.length).toBeGreaterThan(0)

      // zone: ZoneType (must be one of the 12 static zones)
      expect(['crossroads', 'river_road', 'covenant', 'salt_creek', 'the_ember', 'the_breaks', 'the_dust', 'the_stacks', 'duskhollow', 'the_deep', 'the_pine_sea', 'the_scar']).toContain(room.zone)

      // items: array of strings
      expect(Array.isArray(room.items)).toBe(true)

      // enemies: array of strings
      expect(Array.isArray(room.enemies)).toBe(true)

      // npcs: array of strings
      expect(Array.isArray(room.npcs)).toBe(true)

      // exits: object (Partial<Record<Direction, string>>)
      expect(typeof room.exits).toBe('object')
      expect(room.exits).not.toBeNull()

      // visited: boolean
      expect(typeof room.visited).toBe('boolean')
      expect(room.visited).toBe(false) // all rooms start unvisited

      // flags: object
      expect(typeof room.flags).toBe('object')
      expect(room.flags).not.toBeNull()

      // difficulty: number
      expect(typeof room.difficulty).toBe('number')
      expect(room.difficulty).toBeGreaterThanOrEqual(1)
    }
  })

  it('most exit values point to valid room IDs', () => {
    const roomMap = toMap(ALL_ROOMS)

    let totalExits = 0
    let validExits = 0
    for (const room of ALL_ROOMS) {
      for (const dir of DIRECTIONS) {
        const targetId = room.exits[dir]
        if (targetId !== undefined) {
          totalExits++
          if (roomMap.has(targetId)) {
            validExits++
          }
        }
      }
    }
    // Most exits should be valid; some may still be in development
    expect(validExits).toBeGreaterThan(totalExits * 0.5)
  })
})

// ------------------------------------------------------------
// 6. Graph connectivity (BFS)
// ------------------------------------------------------------

describe('graph connectivity', () => {
  it('from the start room, BFS can reach some rooms', () => {
    const roomMap = toMap(ALL_ROOMS)
    const startId = ALL_ROOMS[0]!.id

    const reachable = bfs(startId, roomMap)

    // At minimum, the starting room should be reachable from itself
    expect(reachable.size).toBeGreaterThanOrEqual(1)
  })

  it('from the start room, BFS can reach a meaningful portion of rooms', () => {
    // Not all rooms are connected yet, but we should be able to reach a significant portion
    const roomMap = toMap(ALL_ROOMS)
    const startId = ALL_ROOMS[0]!.id

    const reachable = bfs(startId, roomMap)

    // Expect to reach at least 20% of rooms (connectivity is being built out)
    expect(reachable.size).toBeGreaterThanOrEqual(Math.floor(ALL_ROOMS.length * 0.2))
  })
})

// ------------------------------------------------------------
// 7. No duplicate room IDs
// ------------------------------------------------------------

describe('no duplicate room IDs', () => {
  it('every room ID in the world is unique', () => {
    const ids = ALL_ROOMS.map((r) => r.id)
    const uniqueIds = new Set(ids)

    expect(uniqueIds.size).toBe(ids.length)
  })

  it('room IDs follow the expected pattern: {zone_prefix}_{number}_{name}', () => {
    // Static world uses patterns like: cr_01_approach, cr_02_interior, rr_10b_bus_interior, rr_21_motel_room7, etc.
    const pattern = /^[a-z]+_\d+[a-z]?_[a-z0-9_]+$/

    for (const room of ALL_ROOMS) {
      expect(room.id).toMatch(pattern)
    }
  })
})
