// ============================================================
// Integration tests for lib/worldGen.ts
// ============================================================

import { describe, it, expect } from 'vitest'
import { generateSeed, generateWorld } from '@/lib/worldGen'
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

const ZONE_ORDER: ZoneType[] = ['shelter', 'ruins', 'wastes', 'outpost', 'underground']

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
// 1. generateSeed
// ------------------------------------------------------------

describe('generateSeed', () => {
  it('returns a number', () => {
    const seed = generateSeed()
    expect(typeof seed).toBe('number')
  })

  it('returns an integer', () => {
    const seed = generateSeed()
    expect(Number.isInteger(seed)).toBe(true)
  })

  it('returns a value in the 31-bit unsigned range [0, 2_147_483_646]', () => {
    for (let i = 0; i < 100; i++) {
      const seed = generateSeed()
      expect(seed).toBeGreaterThanOrEqual(0)
      expect(seed).toBeLessThan(2_147_483_647)
    }
  })

  it('different calls return different values (probabilistic)', () => {
    const seeds = new Set<number>()
    for (let i = 0; i < 50; i++) {
      seeds.add(generateSeed())
    }
    // With 50 draws from ~2 billion range, collisions are astronomically unlikely
    expect(seeds.size).toBeGreaterThan(1)
  })
})

// ------------------------------------------------------------
// 2. generateWorld determinism
// ------------------------------------------------------------

describe('generateWorld determinism', () => {
  it('produces identical output when called with the same seed 3 times', () => {
    const seed = 123456

    const run1 = generateWorld(seed)
    const run2 = generateWorld(seed)
    const run3 = generateWorld(seed)

    // Same number of rooms
    expect(run1.length).toBe(run2.length)
    expect(run2.length).toBe(run3.length)

    // Same room IDs in the same order
    const ids1 = run1.map((r) => r.id)
    const ids2 = run2.map((r) => r.id)
    const ids3 = run3.map((r) => r.id)
    expect(ids1).toEqual(ids2)
    expect(ids2).toEqual(ids3)

    // Same exits for every room
    for (let i = 0; i < run1.length; i++) {
      expect(run1[i]!.exits).toEqual(run2[i]!.exits)
      expect(run2[i]!.exits).toEqual(run3[i]!.exits)
    }

    // Same names
    const names1 = run1.map((r) => r.name)
    const names2 = run2.map((r) => r.name)
    const names3 = run3.map((r) => r.name)
    expect(names1).toEqual(names2)
    expect(names2).toEqual(names3)

    // Same descriptions
    const descs1 = run1.map((r) => r.description)
    const descs2 = run2.map((r) => r.description)
    const descs3 = run3.map((r) => r.description)
    expect(descs1).toEqual(descs2)
    expect(descs2).toEqual(descs3)

    // Same zones
    const zones1 = run1.map((r) => r.zone)
    const zones2 = run2.map((r) => r.zone)
    const zones3 = run3.map((r) => r.zone)
    expect(zones1).toEqual(zones2)
    expect(zones2).toEqual(zones3)

    // Same difficulty values
    const diffs1 = run1.map((r) => r.difficulty)
    const diffs2 = run2.map((r) => r.difficulty)
    const diffs3 = run3.map((r) => r.difficulty)
    expect(diffs1).toEqual(diffs2)
    expect(diffs2).toEqual(diffs3)
  })
})

// ------------------------------------------------------------
// 3. Room count
// ------------------------------------------------------------

describe('room count', () => {
  it('generates at least 150 rooms (5 zones x [30,32])', () => {
    const rooms = generateWorld(42)
    // 5 zones * 30 = 150 minimum
    expect(rooms.length).toBeGreaterThanOrEqual(150)
  })

  it('generates at most 160 rooms (5 zones x [30,32])', () => {
    const rooms = generateWorld(42)
    // 5 zones * 32 = 160 maximum
    expect(rooms.length).toBeLessThanOrEqual(160)
  })
})

// ------------------------------------------------------------
// 4. Zone coverage
// ------------------------------------------------------------

describe('zone coverage', () => {
  it('every zone type appears in the generated rooms', () => {
    const rooms = generateWorld(999)
    const zonesPresent = new Set(rooms.map((r) => r.zone))

    for (const zone of ZONE_ORDER) {
      expect(zonesPresent.has(zone)).toBe(true)
    }
  })

  it('each zone has between 30 and 32 rooms', () => {
    const rooms = generateWorld(999)
    for (const zone of ZONE_ORDER) {
      const count = rooms.filter((r) => r.zone === zone).length
      expect(count).toBeGreaterThanOrEqual(30)
      expect(count).toBeLessThanOrEqual(32)
    }
  })
})

// ------------------------------------------------------------
// 5. Exit bidirectionality
// ------------------------------------------------------------

describe('exit bidirectionality', () => {
  it('every exit has a matching return exit in the target room', () => {
    const rooms = generateWorld(7777)
    const roomMap = toMap(rooms)

    for (const room of rooms) {
      for (const dir of DIRECTIONS) {
        const targetId = room.exits[dir]
        if (targetId === undefined) continue

        const targetRoom = roomMap.get(targetId)
        expect(targetRoom).toBeDefined()

        const returnDir = OPPOSITES[dir]
        expect(targetRoom!.exits[returnDir]).toBe(room.id)
      }
    }
  })
})

// ------------------------------------------------------------
// 6. Starting room
// ------------------------------------------------------------

describe('starting room', () => {
  it('the first room in the array is the start room (shelter)', () => {
    const rooms = generateWorld(12345)
    const startRoom = rooms[0]!

    expect(startRoom).toBeDefined()
    expect(startRoom.name).toBe('The Shelter')
    expect(startRoom.zone).toBe('shelter')
  })

  it('start room id follows the shelter-000 pattern', () => {
    const rooms = generateWorld(12345)
    expect(rooms[0]!.id).toBe('shelter-000')
  })

  it('start room has expected NPC', () => {
    const rooms = generateWorld(12345)
    expect(rooms[0]!.npcs).toContain('old_mae')
  })
})

// ------------------------------------------------------------
// 7. Room structure
// ------------------------------------------------------------

describe('room structure', () => {
  it('every room has all required properties with correct types', () => {
    const rooms = generateWorld(54321)

    for (const room of rooms) {
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

      // zone: ZoneType
      expect(ZONE_ORDER).toContain(room.zone)

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

  it('exit values are valid room IDs', () => {
    const rooms = generateWorld(54321)
    const roomMap = toMap(rooms)

    for (const room of rooms) {
      for (const dir of DIRECTIONS) {
        const targetId = room.exits[dir]
        if (targetId !== undefined) {
          expect(roomMap.has(targetId)).toBe(true)
        }
      }
    }
  })
})

// ------------------------------------------------------------
// 8. Graph connectivity (BFS)
// ------------------------------------------------------------

describe('graph connectivity', () => {
  it('from the start room, BFS can reach at least 50% of all rooms', () => {
    const rooms = generateWorld(88888)
    const roomMap = toMap(rooms)
    const startId = rooms[0]!.id

    const reachable = bfs(startId, roomMap)

    expect(reachable.size).toBeGreaterThanOrEqual(Math.floor(rooms.length * 0.5))
  })

  it('from the start room, BFS can reach ALL rooms (worldGen verifies full reachability)', () => {
    // worldGen internally calls verifyReachable which throws if not fully connected
    // so if generateWorld succeeds, all rooms must be reachable from rooms[0]
    const rooms = generateWorld(88888)
    const roomMap = toMap(rooms)
    const startId = rooms[0]!.id

    const reachable = bfs(startId, roomMap)

    expect(reachable.size).toBe(rooms.length)
  })
})

// ------------------------------------------------------------
// 9. Different seeds produce different worlds
// ------------------------------------------------------------

describe('seeded reproducibility — different seeds produce different worlds', () => {
  it('two different seeds produce worlds with different room names', () => {
    const worldA = generateWorld(1)
    const worldB = generateWorld(2)

    const namesA = worldA.map((r) => r.name)
    const namesB = worldB.map((r) => r.name)

    // The start room name is the same (The Shelter), but overall the name lists should differ
    expect(namesA).not.toEqual(namesB)
  })

  it('two different seeds may produce different room counts', () => {
    // This is a softer check -- room counts CAN be the same for different seeds
    // but with enough spread, at least some pairs should differ.
    const counts = new Set<number>()
    for (let seed = 1; seed <= 20; seed++) {
      counts.add(generateWorld(seed).length)
    }
    // With [30,32] per zone across 5 zones, possible totals are 150-160.
    // Over 20 seeds, we should see more than 1 distinct count.
    expect(counts.size).toBeGreaterThan(1)
  })
})

// ------------------------------------------------------------
// 10. No duplicate room IDs
// ------------------------------------------------------------

describe('no duplicate room IDs', () => {
  it('every room ID in the world is unique', () => {
    const rooms = generateWorld(77777)
    const ids = rooms.map((r) => r.id)
    const uniqueIds = new Set(ids)

    expect(uniqueIds.size).toBe(ids.length)
  })

  it('room IDs follow the expected pattern: {zone}-{paddedIndex}', () => {
    const rooms = generateWorld(77777)
    const pattern = /^(shelter|ruins|wastes|outpost|underground)-\d{3}$/

    for (const room of rooms) {
      expect(room.id).toMatch(pattern)
    }
  })
})
