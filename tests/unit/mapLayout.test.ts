import { describe, it, expect } from 'vitest'
import type { Room } from '@/types/game'
import { computeLayout } from '@/lib/mapLayout'
import { renderZoneMap } from '@/lib/mapRenderer'

// ── Shared fixture helpers ────────────────────────────────────────────────────

function makeRoom(id: string, exits: Partial<Record<string, string>> = {}): Room {
  return {
    id,
    name: id,
    description: `Room ${id}`,
    shortDescription: id,
    exits: exits as Room['exits'],
    items: [],
    enemies: [],
    npcs: [],
    zone: 'crossroads',
    difficulty: 1,
    visited: false,
    flags: {},
  }
}

// 3-room north-chain: A → north → B → north → C, with reciprocal south exits
const ROOM_A = makeRoom('A', { north: 'B', south: undefined })
const ROOM_B = makeRoom('B', { north: 'C', south: 'A' })
const ROOM_C = makeRoom('C', { south: 'B' })
const THREE_ROOMS = [ROOM_A, ROOM_B, ROOM_C]

// ── Test 1: north-chain coordinate placement ──────────────────────────────────

describe('computeLayout — 3-room north-chain', () => {
  it('places B one step north (y-1) and C two steps north (y-2) of A', () => {
    const visitedIds = new Set(['A', 'B', 'C'])
    const { positions } = computeLayout(THREE_ROOMS, 'A', visitedIds)

    expect(positions.has('A')).toBe(true)
    expect(positions.has('B')).toBe(true)
    expect(positions.has('C')).toBe(true)

    const posA = positions.get('A')!
    const posB = positions.get('B')!
    const posC = positions.get('C')!

    // All three share the same x
    expect(posB.x).toBe(posA.x)
    expect(posC.x).toBe(posA.x)

    // B is one step north of A (y decreases going north)
    expect(posB.y).toBe(posA.y - 1)

    // C is two steps north of A
    expect(posC.y).toBe(posA.y - 2)
  })
})

// ── Test 2: radius cap ────────────────────────────────────────────────────────

describe('computeLayout — radius cap', () => {
  it('excludes a room beyond the radius from the result', () => {
    // Build a chain long enough to exceed radius=2
    // D → north → E → north → F (F is 2 north of D, just at edge)
    // Add G north of F — should be excluded at radius=2
    const roomD = makeRoom('D', { north: 'E' })
    const roomE = makeRoom('E', { north: 'F', south: 'D' })
    const roomF = makeRoom('F', { north: 'G', south: 'E' })
    const roomG = makeRoom('G', { south: 'F' })

    const visited = new Set(['D', 'E', 'F', 'G'])
    const { positions } = computeLayout([roomD, roomE, roomF, roomG], 'D', visited, 2)

    expect(positions.has('D')).toBe(true)
    expect(positions.has('E')).toBe(true)
    expect(positions.has('F')).toBe(true)
    // G is at y=-3 from anchor D, which exceeds radius 2 → excluded
    expect(positions.has('G')).toBe(false)
  })
})

// ── Test 3: unvisited neighbor of anchor is still placed ──────────────────────

describe('computeLayout — anchor always expands', () => {
  it('places an unvisited neighbor of the anchor', () => {
    // Only anchor A is in visitedIds, B and C are NOT visited
    const visitedIds = new Set<string>(['A'])
    const { positions } = computeLayout(THREE_ROOMS, 'A', visitedIds)

    // A is anchor — its exits should be expanded regardless of visit status
    expect(positions.has('A')).toBe(true)
    expect(positions.has('B')).toBe(true)

    // C is a neighbor of B (not anchor), and B is not visited — C should NOT be placed
    expect(positions.has('C')).toBe(false)
  })
})

// ── Test 4: ASCII regression guard ────────────────────────────────────────────

describe('renderZoneMap — ASCII regression (3-room north-chain)', () => {
  it('produces byte-identical output after mapLayout refactor', () => {
    const visitedIds = new Set(['A', 'B', 'C'])
    const lines = renderZoneMap(THREE_ROOMS, 'A', visitedIds)

    // Constants matching mapRenderer internals
    const INNER_WIDTH = 40
    const border = (left: string, fill: string, right: string) =>
      left + fill.repeat(INNER_WIDTH) + right
    const padLine = (content: string) => {
      const padded = content.length >= INNER_WIDTH
        ? content.slice(0, INNER_WIDTH)
        : content.padEnd(INNER_WIDTH)
      return `║${padded}║`
    }

    // Layout: A=(0,0), B=(0,-1), C=(0,-2) → after normalize: C=row0, B=row1, A=row2
    // gridW=1, gridH=3, renderW=3, leftPad=max(1, floor((40-3)/2))=18
    const leftPad = 18
    const pad = ' '.repeat(leftPad)

    const expected = [
      border('╔', '═', '╗'),
      padLine(' CROSSROADS'),
      border('╠', '═', '╣'),
      padLine(''),
      padLine(pad + '[·]'),        // row 0: C (visited)
      padLine(pad + ' | '),        // connector C↔B
      padLine(pad + '[·]'),        // row 1: B (visited)
      padLine(pad + ' | '),        // connector B↔A
      padLine(pad + '[*]'),        // row 2: A (current / anchor)
      padLine(''),
      border('╠', '═', '╣'),
      padLine(' [*] You  [·] Visited  [?] Unknown      '),
      border('╚', '═', '╝'),
    ]

    expect(lines).toEqual(expected)
  })
})
