// ============================================================
// tests/unit/wanderers.test.ts
// Unit tests for the wandering enemies system (H2)
// ============================================================

import { describe, it, expect } from 'vitest'
import { tickWanderers, WANDERER_CONFIG } from '@/lib/wanderers'
import type { GameState, Room, Wanderer, ZoneType } from '@/types/game'

// ------------------------------------------------------------
// Test fixture helpers
// ------------------------------------------------------------

function makeRoom(id: string, zone: ZoneType, overrides?: Partial<Room>): Room {
  return {
    id,
    name: id,
    description: 'A test room.',
    shortDescription: 'Test room.',
    exits: {},
    items: [],
    enemies: [],
    npcs: [],
    zone,
    difficulty: 2,
    visited: false,
    flags: {},
    ...overrides,
  }
}

function makeState(overrides?: Partial<GameState>): GameState {
  return {
    player: {
      id: 'test-player',
      name: 'Test',
      characterClass: 'scout',
      vigor: 4, grit: 4, reflex: 4, wits: 4, presence: 4, shadow: 4,
      hp: 12, maxHp: 12,
      currentRoomId: 'room1',
      worldSeed: 1,
      xp: 0,
      level: 1,
      actionsTaken: 100,
      isDead: false,
      cycle: 5,  // cycle 5 = pressure 3 (via computePressure in spawn.ts)
      totalDeaths: 0,
      hollowPressure: 3,  // meets pressureThreshold
    },
    currentRoom: null,
    inventory: [],
    combatState: null,
    log: [],
    loading: false,
    initialized: true,
    playerDead: false,
    ledger: null,
    stash: [],
    roomsExplored: 0,
    endingTriggered: false,
    endingChoice: null,
    activeBuffs: [],
    wanderers: [],
    ...overrides,
  }
}

function makeWanderer(id: string, roomId: string, zone: ZoneType, ttl = 50): Wanderer {
  return {
    id,
    enemyId: 'shuffler',
    currentRoomId: roomId,
    zone,
    ttl,
    lastMovedAt: 0,
  }
}

// RNG helpers
const neverSpawn = () => 1.0       // always > spawnChance (0.05), never < moveChance
const alwaysSpawn = () => 0.0      // always < spawnChance (0.05) AND < moveChance (0.30)
const neverMove = () => 1.0        // always > moveChance (0.30)

// A deterministic sequence RNG — returns values from an array in order
function seqRng(values: number[]): () => number {
  let i = 0
  return () => values[i++ % values.length]!
}

// ------------------------------------------------------------
// Test 1: Returns empty list when no wanderers and pressure below threshold
// ------------------------------------------------------------

describe('tickWanderers — below pressure threshold', () => {
  it('returns empty wanderers list when pressure is below threshold', () => {
    const state = makeState({
      player: {
        ...makeState().player!,
        hollowPressure: 0,  // below threshold of 3
      },
      wanderers: [],
    })
    const rooms = new Map<string, Room>([
      ['room1', makeRoom('room1', 'the_breaks')],
    ])

    const result = tickWanderers(state, rooms, neverSpawn)

    expect(result.wanderers).toHaveLength(0)
    expect(result.spawnedNew).toBeNull()
    expect(result.movedExisting).toBeNull()
  })
})

// ------------------------------------------------------------
// Test 2: With pressure >= threshold and rng forcing spawn, one new wanderer spawns
// ------------------------------------------------------------

describe('tickWanderers — spawn when pressure meets threshold', () => {
  it('spawns a new wanderer when pressure >= threshold and rng triggers spawn', () => {
    const state = makeState({
      wanderers: [],
      player: { ...makeState().player!, hollowPressure: 3 },
    })

    // Build an eligible zone map with one room
    const room = makeRoom('br_test', 'the_breaks', {
      hollowEncounter: {
        baseChance: 0.3,
        timeModifier: {},
        threatPool: [
          { type: 'shuffler', weight: 1, quantity: { min: 1, max: 1, distribution: 'single' } },
        ],
      },
    })
    const rooms = new Map<string, Room>([['br_test', room]])

    // alwaysSpawn: 0.0 < spawnChancePerTick (0.05) → spawn fires
    const result = tickWanderers(state, rooms, alwaysSpawn)

    expect(result.spawnedNew).not.toBeNull()
    expect(result.wanderers).toHaveLength(1)
    expect(result.wanderers[0]!.zone).toBe('the_breaks')
    expect(result.wanderers[0]!.ttl).toBe(WANDERER_CONFIG.ttlActions)
  })
})

// ------------------------------------------------------------
// Test 3: maxConcurrent cap is respected
// ------------------------------------------------------------

describe('tickWanderers — maxConcurrent cap', () => {
  it('does not spawn a 4th wanderer when 3 already exist', () => {
    const existing: Wanderer[] = [
      makeWanderer('w1', 'room_a', 'the_breaks'),
      makeWanderer('w2', 'room_b', 'the_breaks'),
      makeWanderer('w3', 'room_c', 'the_breaks'),
    ]
    const state = makeState({
      wanderers: existing,
      player: { ...makeState().player!, hollowPressure: 5 },
    })

    const room = makeRoom('room_a', 'the_breaks')
    const rooms = new Map<string, Room>([
      ['room_a', room],
      ['room_b', makeRoom('room_b', 'the_breaks')],
      ['room_c', makeRoom('room_c', 'the_breaks')],
    ])

    // alwaysSpawn: spawn would fire if cap allowed it
    const result = tickWanderers(state, rooms, alwaysSpawn)

    // wanderers array may be smaller if TTL hit 0 (they had ttl=50, decremented to 49)
    // so cap check: never MORE than maxConcurrent
    expect(result.wanderers.length).toBeLessThanOrEqual(WANDERER_CONFIG.maxConcurrent)
    expect(result.spawnedNew).toBeNull()
  })
})

// ------------------------------------------------------------
// Test 4: Wanderer moves to a neighboring room when moveChance rolls true
// ------------------------------------------------------------

describe('tickWanderers — wanderer movement', () => {
  it('moves a wanderer to a neighboring room when rng triggers movement', () => {
    const wanderer = makeWanderer('mover', 'room_from', 'the_breaks')
    const state = makeState({
      wanderers: [wanderer],
      player: { ...makeState().player!, hollowPressure: 0 }, // below spawn threshold
    })

    // Two connected rooms in the same zone
    const roomFrom = makeRoom('room_from', 'the_breaks', {
      exits: { east: 'room_to' },
    })
    const roomTo = makeRoom('room_to', 'the_breaks')
    const rooms = new Map<string, Room>([
      ['room_from', roomFrom],
      ['room_to', roomTo],
    ])

    // seqRng: first call is for move-check (< 0.30 → moves), second is for neighbor pick (pick index 0)
    const rng = seqRng([0.1, 0.0])  // 0.1 < moveChancePerTick (0.30) → moves; 0.0 * 1 = 0 → picks index 0
    const result = tickWanderers(state, rooms, rng)

    expect(result.movedExisting).not.toBeNull()
    expect(result.movedExisting!.from).toBe('room_from')
    expect(result.movedExisting!.to).toBe('room_to')
    expect(result.wanderers[0]!.currentRoomId).toBe('room_to')
  })
})

// ------------------------------------------------------------
// Test 5: Wanderer with TTL = 1 is removed after one tick
// ------------------------------------------------------------

describe('tickWanderers — TTL expiry', () => {
  it('removes a wanderer whose TTL reaches 0 after decrement', () => {
    const dying = makeWanderer('dying', 'room1', 'the_breaks', 1)
    const state = makeState({
      wanderers: [dying],
      player: { ...makeState().player!, hollowPressure: 0 },
    })
    const rooms = new Map<string, Room>([
      ['room1', makeRoom('room1', 'the_breaks')],
    ])

    // neverMove: rng > moveChance so wanderer stays; rng > spawnChance so no spawn
    const result = tickWanderers(state, rooms, neverMove)

    expect(result.wanderers).toHaveLength(0)
    expect(result.spawnedNew).toBeNull()
  })
})

// ------------------------------------------------------------
// Test 6: Wanderer never spawns in noCombat / safeRest / questHub rooms
// ------------------------------------------------------------

describe('tickWanderers — safe-flag room exclusion', () => {
  it('does not spawn in noCombat room', () => {
    const state = makeState({
      wanderers: [],
      player: { ...makeState().player!, hollowPressure: 5 },
    })

    // Only room in the eligible zone is noCombat
    const safeRoom = makeRoom('safe_room', 'the_breaks', {
      flags: { noCombat: true },
      hollowEncounter: {
        baseChance: 0.3,
        timeModifier: {},
        threatPool: [
          { type: 'shuffler', weight: 1, quantity: { min: 1, max: 1, distribution: 'single' } },
        ],
      },
    })
    const rooms = new Map<string, Room>([['safe_room', safeRoom]])

    // alwaysSpawn: spawn would fire if eligible room exists
    const result = tickWanderers(state, rooms, alwaysSpawn)

    // No eligible rooms in zone → no spawn
    expect(result.spawnedNew).toBeNull()
    expect(result.wanderers).toHaveLength(0)
  })

  it('does not spawn in safeRest room', () => {
    const state = makeState({
      wanderers: [],
      player: { ...makeState().player!, hollowPressure: 5 },
    })

    const restRoom = makeRoom('rest_room', 'the_pens', {
      flags: { safeRest: true },
    })
    const rooms = new Map<string, Room>([['rest_room', restRoom]])

    const result = tickWanderers(state, rooms, alwaysSpawn)
    expect(result.spawnedNew).toBeNull()
  })

  it('does not spawn in questHub room', () => {
    const state = makeState({
      wanderers: [],
      player: { ...makeState().player!, hollowPressure: 5 },
    })

    const hubRoom = makeRoom('hub_room', 'the_scar', {
      flags: { questHub: true },
    })
    const rooms = new Map<string, Room>([['hub_room', hubRoom]])

    const result = tickWanderers(state, rooms, alwaysSpawn)
    expect(result.spawnedNew).toBeNull()
  })
})
