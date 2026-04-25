// ============================================================
// tests/playtest/enforcer-kael-forced.test.ts — Kael Enforcer
// with forceSpawn harness option
//
// Context (H8):
//   H2's Kael playtest walked 53 rooms with mockRandom:0.5 and saw
//   only 2 combats — both from static room.enemies[], not from the
//   probabilistic hollowEncounter pipeline. baseChance values of
//   0.06–0.32 mean Math.random() < finalChance almost never fires
//   with a pinned 0.5 RNG.
//
// This file validates that forceSpawn:true makes the hollowEncounter
// pipeline reachable in tests:
//
//   T1: Direct comparison — 5 hollowEncounter rooms, mockRandom:0.5
//       no forceSpawn → 0 hollow combats
//       forceSpawn:true → >=4 hollow combats (one per room, minus any
//       cleared-room respawn blocks which won't trigger here)
//
//   T2: Kael 30+ room path through The Breaks (combat-dense zone)
//       with forceSpawn:true → asserts >=15 combats occurred.
//       Conservative floor: most Breaks rooms have hollowEncounter;
//       30 rooms visited with 15+ hollow encounters is achievable.
//
// Character: Kael the Enforcer
//   vigor=6, grit=4, reflex=4, wits=4, presence=2, shadow=4
//   HP = 8 + (6-2)*2 = 16
//   Survival stat = vigor(6) + class_bonus(0) = 6 — passes br_01→south gate (DC 5)
//   Flee stat = reflex(4) + shadow(4) = 8 — always passes flee vs shuffler/remnant (DC 8)
//
// With mockRandom:0.5, roll1d10()=6:
//   - Flee check against shuffler: rollCheck(8, 8) → 6+3=9 ≥ 8 → FLEE SUCCEEDS
//   - Flee check against remnant:  rollCheck(8, 8) → 6+3=9 ≥ 8 → FLEE SUCCEEDS
//   So Kael takes 0 damage from flee attempts (no failed-flee free attacks).
//
// mockRandom: 0.5 — deterministic RNG for dice rolls.
// ============================================================

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { buildMockDb } from './harness'
import type { InventoryItem, Item } from '@/types/game'

// ------------------------------------------------------------
// Supabase mock — must precede all module imports
// ------------------------------------------------------------

const mockDb = buildMockDb()

vi.mock('@/lib/supabase', () => ({
  createSupabaseBrowserClient: () => mockDb,
}))

// ------------------------------------------------------------
// Stateful inventory mock
// ------------------------------------------------------------

const mockInventoryStore: Map<string, InventoryItem> = new Map()

vi.mock('@/lib/inventory', () => ({
  getInventory: vi.fn(async () => Array.from(mockInventoryStore.values())),
  addItem: vi.fn(async (_playerId: string, itemId: string) => {
    const { getItem } = await import('@/data/items')
    const item = getItem(itemId)
    if (!item) return
    const existing = mockInventoryStore.get(itemId)
    if (existing) {
      existing.quantity += 1
    } else {
      mockInventoryStore.set(itemId, {
        id: `inv_${itemId}`,
        playerId: 'playtest-user-001',
        itemId,
        item: item as Item,
        quantity: 1,
        equipped: false,
      })
    }
  }),
  removeItem: vi.fn(async (_playerId: string, itemId: string, qty = 1) => {
    const existing = mockInventoryStore.get(itemId)
    if (!existing) return
    const remove = typeof qty === 'number' ? qty : 1
    if (existing.quantity > remove) {
      existing.quantity -= remove
    } else {
      mockInventoryStore.delete(itemId)
    }
  }),
  groupAndFormatItems: vi.fn(() => []),
}))

// ------------------------------------------------------------
// World mock — pass through to real static data; no-op writes
// ------------------------------------------------------------

vi.mock('@/lib/world', async (importOriginal) => {
  const actual = await importOriginal<typeof import('@/lib/world')>()
  return {
    ...actual,
    getRoom: vi.fn(async (roomId: string) => actual.getRoomDefinition(roomId)),
    markVisited: vi.fn().mockResolvedValue(undefined),
    updateRoomFlags: vi.fn().mockResolvedValue(undefined),
    updateRoomItems: vi.fn().mockResolvedValue(undefined),
    persistWorld: vi.fn().mockResolvedValue(undefined),
  }
})

// ------------------------------------------------------------
// Narrative / pipeline mocks (silence side effects)
// ------------------------------------------------------------

vi.mock('@/data/items', async (importOriginal) => {
  const actual = await importOriginal<typeof import('@/data/items')>()
  return actual
})

vi.mock('@/lib/fear', () => ({
  fearCheck: vi.fn(() => ({ messages: [], afraid: false, fearRounds: 0 })),
  echoRetentionFactor: vi.fn(() => 0.7),
}))

vi.mock('@/lib/richText', async (importOriginal) => {
  const actual = await importOriginal<typeof import('@/lib/richText')>()
  return actual
})

vi.mock('@/lib/messages', async (importOriginal) => {
  const actual = await importOriginal<typeof import('@/lib/messages')>()
  return {
    ...actual,
    msg: (text: string, type = 'narrative') => ({
      id: 'kael-' + Math.random().toString(36).slice(2),
      text,
      type,
    }),
    systemMsg: (text: string) => ({
      id: 'kael-' + Math.random().toString(36).slice(2),
      text,
      type: 'system',
    }),
    combatMsg: (text: string) => ({
      id: 'kael-' + Math.random().toString(36).slice(2),
      text,
      type: 'combat',
    }),
    errorMsg: (text: string) => ({
      id: 'kael-' + Math.random().toString(36).slice(2),
      text,
      type: 'error',
    }),
  }
})

vi.mock('@/lib/echoes', async (importOriginal) => {
  const actual = await importOriginal<typeof import('@/lib/echoes')>()
  return {
    ...actual,
    getDeathRoomNarration: vi.fn(() => null),
    getCrossCycleConsequences: vi.fn(() => []),
    getGraffitiChange: vi.fn(() => null),
    getCycleAwareDialogue: vi.fn(() => null),
  }
})

vi.mock('@/lib/skillBonus', async (importOriginal) => {
  const actual = await importOriginal<typeof import('@/lib/skillBonus')>()
  return actual
})

vi.mock('@/lib/hollowPressure', () => ({
  computePressure: vi.fn().mockReturnValue(1),
  applyPressureDelta: vi.fn().mockReturnValue(0),
  getPressureNarration: vi.fn().mockReturnValue([]),
  getMundaneHorrorNarration: vi.fn().mockReturnValue(null),
  shouldTriggerSwarm: vi.fn().mockReturnValue(false),
}))

vi.mock('@/lib/worldEvents', () => ({
  getScheduledEvents: vi.fn().mockReturnValue([]),
  executeWorldEvent: vi.fn().mockReturnValue([]),
}))

vi.mock('@/lib/npcInitiative', () => ({
  checkInitiativeTriggers: vi.fn().mockReturnValue({
    trigger: null,
    updatedLastAction: 0,
  }),
  getInitiativeNarration: vi.fn().mockReturnValue([]),
}))

vi.mock('@/lib/companionSystem', () => ({
  getCompanionCommentary: vi.fn().mockReturnValue(null),
  getPersonalMoment: vi.fn().mockReturnValue(null),
}))

vi.mock('@/lib/factionWeb', () => ({
  getFactionRipple: vi.fn().mockReturnValue({ effects: [], narration: [] }),
  getDelayedRippleNarration: vi.fn().mockReturnValue(null),
}))

vi.mock('@/lib/playerMonologue', () => ({
  shouldTriggerMonologue: vi.fn().mockReturnValue(false),
  generateMonologue: vi.fn().mockResolvedValue(null),
  getPhysicalStateNarration: vi.fn().mockReturnValue(null),
  getReputationVoice: vi.fn().mockReturnValue(null),
  resetMonologueSession: vi.fn(),
}))

vi.mock('@/lib/narratorVoice', () => ({
  shouldNarratorSpeak: vi.fn().mockReturnValue(false),
  generateNarratorVoice: vi.fn().mockReturnValue(null),
  getNarratorActTransition: vi.fn().mockReturnValue([]),
  clearNarratorSession: vi.fn(),
}))

// ------------------------------------------------------------
// Import after mocks
// ------------------------------------------------------------

import { PlayerSession } from './harness'
import type { CharacterSpec } from './harness'

// ------------------------------------------------------------
// Character spec — Kael the Enforcer
//
// Enforcer class bonus: vigor +4, grit +2, reflex +2, freePoints: 4
// Distribution: vigor=6(+4), grit=4(+2), reflex=4(+2), wits=4(+2),
//               presence=2(+0), shadow=4(+2) = 12 ✓
// HP = 8 + (6-2)*2 = 16
// Survival stat = vigor(6) → passes br_01→south gate (survival DC 5)
// Flee stat = reflex(4) + shadow(4) = 8 → always flees basic enemies
// ------------------------------------------------------------

const KAEL: CharacterSpec = {
  name: 'Kael',
  characterClass: 'enforcer',
  stats: {
    vigor: 6,
    grit: 4,
    reflex: 4,
    wits: 4,
    presence: 2,
    shadow: 4,
  },
  personalLoss: { type: 'community', detail: 'the Holt Township militia' },
}

// ------------------------------------------------------------
// Helpers
// ------------------------------------------------------------

/**
 * Teleport to a room by patching snapshot state — bypass physical gates.
 * Calls applyPopulation() after setting currentRoom so that the forceSpawn
 * shim (or any other population logic) runs on the new room.
 */
async function teleport(session: PlayerSession, roomId: string): Promise<void> {
  const snap = JSON.parse(JSON.stringify(session.snapshot())) as Record<string, unknown>
  const player = snap['player'] as Record<string, unknown>
  player['currentRoomId'] = roomId

  const { getRoomDefinition } = await import('@/lib/world')
  const room = getRoomDefinition(roomId)
  snap['currentRoom'] = room

  await session.restore(snap as Parameters<typeof session.restore>[0])
  // Apply population so forceSpawn shim fires on the teleported room
  session.applyPopulation()
}

/**
 * Enter a room, attack if enemies are present (starting combat),
 * then flee if combat is active. Returns whether combat was triggered.
 */
async function engageAndFlee(session: PlayerSession): Promise<boolean> {
  if (session.currentRoom.enemies.length > 0) {
    await session.cmd('attack')
    const inCombat = session.isInCombat()
    if (inCombat) {
      await session.cmd('flee')
    }
    return inCombat
  }
  return false
}

/**
 * Walk a direction and engage enemies if forceSpawn brought them.
 * Returns true if combat occurred in the destination room.
 */
async function moveAndEngage(
  session: PlayerSession,
  dir: string,
  combatCounter: { count: number },
): Promise<boolean> {
  await session.cmd(`go ${dir}`)
  const engaged = await engageAndFlee(session)
  if (engaged) combatCounter.count++
  return engaged
}

// ------------------------------------------------------------
// Tests
// ------------------------------------------------------------

describe('Kael — Enforcer forceSpawn validation', () => {
  let session: PlayerSession

  beforeEach(() => {
    vi.clearAllMocks()
    mockInventoryStore.clear()
  })

  afterEach(async () => {
    if (session) await session.destroy()
  })

  // ----------------------------------------------------------
  // T1a: Without forceSpawn — 5 hollowEncounter rooms → 0 hollow combats
  //
  // These 5 rooms all have hollowEncounter with baseChance 0.08–0.30.
  // With mockRandom=0.5 pinned: Math.random() < finalChance is
  //   0.5 < (0.10 * 1.0 * 1.0) = 0.10 → FALSE (day timeModifier)
  // So zero hollow enemies spawn. Combats = 0.
  //
  // Note: We teleport directly to each room so there is no static
  // room.enemies to fight — these rooms all have enemies: [].
  // ----------------------------------------------------------

  it('T1a: 5 hollowEncounter rooms without forceSpawn produce 0 hollow combats', async () => {
    session = new PlayerSession({ mockRandom: 0.5 })
    await session.create(KAEL)

    const hollowEncounterRooms = [
      'br_01_canyon_mouth',
      'br_02_the_wash',
      'br_03_narrow_slot_canyon',
      'br_07_canyon_crossroads',
      'br_09_petroglyph_wall',
    ]

    let combatCount = 0

    for (const roomId of hollowEncounterRooms) {
      await teleport(session, roomId)
      // Check if room has hollow enemies (forceSpawn is OFF, so they shouldn't)
      if (session.currentRoom.enemies.length > 0) {
        await session.cmd('attack')
        if (session.isInCombat()) {
          combatCount++
          await session.cmd('flee')
        }
      }
    }

    // With mockRandom=0.5, finalChance ≈ 0.10 and Math.random()=0.5 > 0.10
    // so hollow enemies never spawn. No combats from hollow pipeline.
    expect(combatCount).toBe(0)
  }, 15_000)

  // ----------------------------------------------------------
  // T1b: With forceSpawn:true — same 5 rooms → >=4 hollow combats
  //
  // The forceSpawn shim forces the highest-weight enemy to spawn
  // deterministically. br_07 has questHub:false and noCombat:false,
  // so all 5 rooms should spawn enemies. Expect all 5 to produce combat.
  // ----------------------------------------------------------

  it('T1b: 5 hollowEncounter rooms with forceSpawn:true produce >=4 combats', async () => {
    session = new PlayerSession({ mockRandom: 0.5, forceSpawn: true })
    await session.create(KAEL)

    const hollowEncounterRooms = [
      'br_01_canyon_mouth',   // baseChance 0.10, top threat: shuffler(75) — min 1
      'br_02_the_wash',       // baseChance 0.15, top threat: shuffler(60) — min 1
      'br_03_narrow_slot_canyon', // baseChance 0.20, top threat: remnant(50) — min 1
      'br_07_canyon_crossroads',  // baseChance 0.15, top threat: shuffler(55) — min 1
      'br_09_petroglyph_wall',    // baseChance 0.10, top threat: shuffler(65) — min 1
    ]

    let combatCount = 0

    for (const roomId of hollowEncounterRooms) {
      await teleport(session, roomId)
      // forceSpawn should have injected enemies
      if (session.currentRoom.enemies.length > 0) {
        await session.cmd('attack')
        if (session.isInCombat()) {
          combatCount++
          await session.cmd('flee')
        }
      }
    }

    // All 5 hollowEncounter rooms should have spawned enemies → 5 combats
    expect(combatCount).toBeGreaterThanOrEqual(4)
  }, 15_000)

  // ----------------------------------------------------------
  // T2: Kael 30+ room path with forceSpawn:true — >=15 combats
  //
  // Route through The Breaks, which has 16 hollowEncounter rooms
  // (out of 20 total; 4 are safe: br_06 safeRest, br_08 questHub,
  // br_14 safeRest, br_20 safeRest).
  //
  // Strategy:
  //   - Start at cr_01
  //   - Teleport to br_01 (bypass approach)
  //   - Walk south through the canyon: br_01 → br_02 → br_03 → br_05
  //   - Navigate the crossroads system: br_07 → br_09 → br_10 → br_11
  //   - Rim route: br_07 up → br_15 → br_18 → br_19 →  br_16
  //   - Rim east: br_12 → br_13 → back
  //   - Teleport to additional rooms: br_04, br_17
  //   Total: 15+ hollowEncounter rooms visited
  //
  // After each room: attack if enemies present (forceSpawn ensures they
  // are), flee. HP stays at 16 throughout since flee always succeeds
  // with reflex=4 + shadow=4 = 8 vs DC 8.
  // ----------------------------------------------------------

  it('T2: Kael forceSpawn path through The Breaks — >=15 combats', async () => {
    session = new PlayerSession({ mockRandom: 0.5, forceSpawn: true })
    await session.create(KAEL)

    const cc = { count: 0 }

    // Start at cr_01_approach (no hollowEncounter)
    expect(session.currentRoom.id).toBe('cr_01_approach')

    // Teleport to br_01 to bypass the survival gate on cr_01→south
    // (br_01 has baseChance 0.10, no skill gate on its exits)
    await teleport(session, 'br_01_canyon_mouth')
    // Engage in br_01
    const br01Combat = await engageAndFlee(session)
    if (br01Combat) cc.count++

    // br_01 → south → br_02 (survival DC5; vigor=6 passes)
    await moveAndEngage(session, 'south', cc)
    expect(session.currentRoom.id).toBe('br_02_the_wash')

    // br_02 → south → br_03 (narrow slot canyon)
    await moveAndEngage(session, 'south', cc)
    expect(session.currentRoom.id).toBe('br_03_narrow_slot_canyon')

    // br_03 → south → br_05 (bone hollow — high baseChance 0.30)
    await moveAndEngage(session, 'south', cc)
    expect(session.currentRoom.id).toBe('br_05_bone_hollow')

    // br_05 → south → br_07 (canyon crossroads)
    await moveAndEngage(session, 'south', cc)
    expect(session.currentRoom.id).toBe('br_07_canyon_crossroads')

    // br_07 → east → br_09 (petroglyph wall)
    await moveAndEngage(session, 'east', cc)
    expect(session.currentRoom.id).toBe('br_09_petroglyph_wall')

    // br_09 → south → br_10 (dry spring)
    await moveAndEngage(session, 'south', cc)
    expect(session.currentRoom.id).toBe('br_10_dry_spring')

    // br_10 → south → br_11 (feral kill site)
    await moveAndEngage(session, 'south', cc)
    expect(session.currentRoom.id).toBe('br_11_feral_kill_site')

    // br_11 → west → br_07 (back to crossroads; different visit, fresh _applyPopulation)
    await moveAndEngage(session, 'west', cc)
    expect(session.currentRoom.id).toBe('br_07_canyon_crossroads')

    // br_07 → up → br_12 (canyon rim west)
    await moveAndEngage(session, 'up', cc)
    expect(session.currentRoom.id).toBe('br_12_canyon_rim_west')

    // br_12 → east → br_13 (canyon rim east)
    await moveAndEngage(session, 'east', cc)
    expect(session.currentRoom.id).toBe('br_13_canyon_rim_east')

    // br_13 → east → br_16 (south exit)
    await moveAndEngage(session, 'east', cc)
    expect(session.currentRoom.id).toBe('br_16_south_exit')

    // Teleport to br_15 (mesa top — requires up from br_07 context)
    await teleport(session, 'br_15_mesa_top')
    const br15Combat = await engageAndFlee(session)
    if (br15Combat) cc.count++

    // br_15 → east → br_18 (the chimney)
    await moveAndEngage(session, 'east', cc)
    expect(session.currentRoom.id).toBe('br_18_the_chimney')

    // Teleport to br_04 (ledge trail — requires climbing DC10; vigor=6 passes)
    await teleport(session, 'br_04_ledge_trail')
    const br04Combat = await engageAndFlee(session)
    if (br04Combat) cc.count++

    // Teleport to br_17 (wind carved passage)
    await teleport(session, 'br_17_wind_carved_passage')
    const br17Combat = await engageAndFlee(session)
    if (br17Combat) cc.count++

    // Teleport to br_19 (bleached mesa edge)
    await teleport(session, 'br_19_bleached_mesa_edge')
    const br19Combat = await engageAndFlee(session)
    if (br19Combat) cc.count++

    // Log the actual count for debugging
    console.info(`[enforcer-kael-forced] T2 combat count: ${cc.count}`)

    // Conservative floor: 15 combats from 16 hollowEncounter rooms visited
    // (br_07 is revisited once, giving 17 potential encounters minus up to 2 edge cases)
    expect(cc.count).toBeGreaterThanOrEqual(15)

    // Player should still be alive (flee always succeeds at mockRandom=0.5)
    expect(session.state.playerDead).toBe(false)
    expect(session.player.hp).toBeGreaterThan(0)

    // No active combat at end of session (all properly fled)
    expect(session.isInCombat()).toBe(false)
  }, 60_000)
})
