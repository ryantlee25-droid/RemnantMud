// ============================================================
// worldGen.ts — Deterministic procedural world generator
// Pure functions only. No React, no Supabase.
// ============================================================

import type { Room, ZoneType, Direction } from '@/types/game'
import { ZONE_TEMPLATES } from '@/data/roomTemplates'

// ------------------------------------------------------------
// Seeded PRNG (mulberry32)
// ------------------------------------------------------------

function createRng(seed: number): () => number {
  let s = seed >>> 0
  return function (): number {
    s += 0x6d2b79f5
    let t = s
    t = Math.imul(t ^ (t >>> 15), t | 1)
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61)
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}

// ------------------------------------------------------------
// Helpers
// ------------------------------------------------------------

function randInt(rng: () => number, min: number, max: number): number {
  return Math.floor(rng() * (max - min + 1)) + min
}

function randPick<T>(rng: () => number, arr: T[]): T {
  return arr[Math.floor(rng() * arr.length)]!
}

function randSample<T>(rng: () => number, arr: T[], count: number): T[] {
  const copy = arr.slice()
  const result: T[] = []
  for (let i = 0; i < count && copy.length > 0; i++) {
    const idx = Math.floor(rng() * copy.length)
    result.push(copy[idx]!)
    copy.splice(idx, 1)
  }
  return result
}

const DIRECTIONS: Direction[] = ['north', 'south', 'east', 'west', 'up', 'down']

const OPPOSITES: Record<Direction, Direction> = {
  north: 'south',
  south: 'north',
  east: 'west',
  west: 'east',
  up: 'down',
  down: 'up',
}

function addExit(rooms: Map<string, Room>, fromId: string, dir: Direction, toId: string): void {
  const from = rooms.get(fromId)
  const to = rooms.get(toId)
  if (!from || !to) return
  from.exits[dir] = toId
  to.exits[OPPOSITES[dir]] = fromId
}

function freeDirections(room: Room): Direction[] {
  return DIRECTIONS.filter((d) => room.exits[d] === undefined)
}

// ------------------------------------------------------------
// Room generation
// ------------------------------------------------------------

function buildRoom(
  rng: () => number,
  id: string,
  zone: ZoneType,
  isStart: boolean,
): Room {
  const template = ZONE_TEMPLATES[zone]
  if (!template) throw new Error(`No template for zone: ${zone}`)

  // Fixed start room
  if (isStart) {
    return {
      id,
      name: 'The Shelter',
      description:
        'A cramped underground shelter, its walls streaked with rust and old condensation. ' +
        'Flickering fluorescent tubes cast a sickly pallor over rows of empty cots. ' +
        'The air smells of mildew and canned food. A heavy blast door stands ajar to the east.',
      shortDescription: 'A cramped underground shelter lit by flickering fluorescent tubes.',
      exits: {},
      items: [],
      enemies: [],
      npcs: ['old_mae'],
      zone,
      difficulty: 1,
      visited: false,
      flags: {},
    }
  }

  // Name: 2-3 nameFragments + 1 locationFragment
  const nameCount = randInt(rng, 2, 3)
  const nameFrags = randSample(rng, template.nameFragments, nameCount)
  const locFrag = randPick(rng, template.locationFragments)
  const name = [...nameFrags, locFrag].join(' ')

  // Description: pick 3-4 sentence arrays, pull one sentence from each
  const sentenceGroups = randSample(rng, template.descriptionFragments, randInt(rng, 3, 4))
  const sentences = sentenceGroups.map((group) => randPick(rng, group))
  const description = sentences.join(' ')
  const firstSentenceEnd = description.indexOf('.')
  const shortDescription =
    firstSentenceEnd !== -1
      ? description.slice(0, firstSentenceEnd + 1)
      : description

  const difficulty = randInt(rng, template.difficulty[0], template.difficulty[1])

  return {
    id,
    name,
    description,
    shortDescription,
    exits: {},
    items: [],
    enemies: [],
    npcs: [],
    zone,
    difficulty,
    visited: false,
    flags: {},
  }
}

// ------------------------------------------------------------
// Zone generation
// ------------------------------------------------------------

const ZONE_ORDER: ZoneType[] = ['shelter', 'ruins', 'wastes', 'outpost', 'underground']

// Target room counts per zone — overrides template roomCount values to reach 75-80 total.
// 5 zones × [15, 16] = 75–80 rooms.
const ZONE_ROOM_COUNT: [number, number] = [30, 32]

function generateZone(
  rng: () => number,
  zone: ZoneType,
  startIndex: number,
  isFirstZone: boolean,
): Room[] {
  const template = ZONE_TEMPLATES[zone]
  if (!template) throw new Error(`No template for zone: ${zone}`)
  const count = randInt(rng, ZONE_ROOM_COUNT[0], ZONE_ROOM_COUNT[1])

  const rooms: Room[] = []
  for (let i = 0; i < count; i++) {
    const globalIndex = startIndex + i
    const id = `${zone}-${String(globalIndex).padStart(3, '0')}`
    const isStart = isFirstZone && i === 0
    rooms.push(buildRoom(rng, id, zone, isStart))
  }
  return rooms
}

// ------------------------------------------------------------
// BFS reachability check
// ------------------------------------------------------------

function verifyReachable(rooms: Room[]): void {
  if (rooms.length === 0) return
  const startId = rooms[0]!.id
  const roomMap = new Map(rooms.map((r) => [r.id, r]))
  const visited = new Set<string>()
  const queue: string[] = [startId]
  visited.add(startId)

  while (queue.length > 0) {
    const current = queue.shift()!
    const room = roomMap.get(current)
    if (!room) continue
    for (const dir of DIRECTIONS) {
      const neighbor = room.exits[dir]
      if (neighbor !== undefined && !visited.has(neighbor)) {
        visited.add(neighbor)
        queue.push(neighbor)
      }
    }
  }

  if (visited.size !== rooms.length) {
    const unreachable = rooms
      .filter((r) => !visited.has(r.id))
      .map((r) => r.id)
    throw new Error(
      `World generation produced unreachable rooms: ${unreachable.join(', ')}`,
    )
  }
}

// ------------------------------------------------------------
// Main generator
// ------------------------------------------------------------

export function generateWorld(seed: number): Room[] {
  const rng = createRng(seed)
  const allRooms: Room[] = []
  const roomMap = new Map<string, Room>()

  let globalIndex = 0

  // Generate all zones
  const zoneGroups: Room[][] = []
  for (const zone of ZONE_ORDER) {
    const isFirst = zone === 'shelter'
    const rooms = generateZone(rng, zone, globalIndex, isFirst)
    globalIndex += rooms.length
    zoneGroups.push(rooms)
    for (const r of rooms) {
      allRooms.push(r)
      roomMap.set(r.id, r)
    }
  }

  // Connect rooms within each zone: chain + random extra connections
  for (const zone of zoneGroups) {
    // Chain: room[0] -> room[1] -> ... -> room[n-1]
    for (let i = 0; i < zone.length - 1; i++) {
      const from = zone[i]!
      const to = zone[i + 1]!
      // Pick first available free direction pair
      const fromFree = freeDirections(from)
      const toFree = freeDirections(to)

      let placed = false
      // Prefer cardinal directions in order
      const preferred: Direction[] = ['east', 'north', 'south', 'west', 'up', 'down']
      for (const dir of preferred) {
        const opp = OPPOSITES[dir]
        if (fromFree.includes(dir) && toFree.includes(opp)) {
          addExit(roomMap, from.id, dir, to.id)
          placed = true
          break
        }
      }
      if (!placed) {
        // fallback: use any pair that works
        for (const dir of fromFree) {
          const opp = OPPOSITES[dir]
          if (toFree.includes(opp)) {
            addExit(roomMap, from.id, dir, to.id)
            break
          }
        }
      }
    }

    // Extra random connections (20% chance per room, to non-adjacent rooms in same zone)
    for (let i = 0; i < zone.length; i++) {
      if (rng() < 0.2 && zone.length > 2) {
        // Pick a non-adjacent room (not i-1, i, i+1)
        const candidates = zone
          .map((_, idx) => idx)
          .filter((idx) => Math.abs(idx - i) > 1)
        if (candidates.length === 0) continue
        const targetIdx = randPick(rng, candidates)
        const from = zone[i]!
        const to = zone[targetIdx]!
        const fromFree = freeDirections(from)
        const toFree = freeDirections(to)
        for (const dir of fromFree) {
          const opp = OPPOSITES[dir]
          if (toFree.includes(opp)) {
            addExit(roomMap, from.id, dir, to.id)
            break
          }
        }
      }
    }
  }

  // Connect zones: last room of zone N -> first room of zone N+1
  for (let z = 0; z < zoneGroups.length - 1; z++) {
    const currentZone = zoneGroups[z]!
    const nextZone = zoneGroups[z + 1]!
    const from = currentZone[currentZone.length - 1]!
    const to = nextZone[0]!

    const fromFree = freeDirections(from)
    const toFree = freeDirections(to)

    // Zone transitions prefer 'east' or 'down'
    const preferred: Direction[] = ['east', 'down', 'north', 'south', 'west', 'up']
    let placed = false
    for (const dir of preferred) {
      const opp = OPPOSITES[dir]
      if (fromFree.includes(dir) && toFree.includes(opp)) {
        addExit(roomMap, from.id, dir, to.id)
        placed = true
        break
      }
    }
    if (!placed) {
      for (const dir of fromFree) {
        const opp = OPPOSITES[dir]
        if (toFree.includes(opp)) {
          addExit(roomMap, from.id, dir, to.id)
          break
        }
      }
    }
  }

  // BFS reachability check
  verifyReachable(allRooms)

  return allRooms
}

// ------------------------------------------------------------
// Seed generator
// ------------------------------------------------------------

export function generateSeed(): number {
  return Math.floor(Math.random() * 2_147_483_647)
}
