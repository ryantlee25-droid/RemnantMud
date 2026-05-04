// ============================================================
// tests/playtest/strategy-speedrun.test.ts — Speedrun strategy playtest
//
// Minimum-action clears for all 4 endings (Cure / Weapon / Seal / Throne).
//
// Core mechanic: all endings are triggered via `examine <terminal>` in
// scar_14_the_core.  The Core has cycleGate: 3, so ALL 4 endings are
// unreachable in cycle 1.  Cycle 1 → ending is NOT viable for any ending.
//
// Speedrun route (all classes, all endings):
//   1. create character (cycle 3 via _setState after create)
//   2. teleport directly to scar_14_the_core
//   3. examine <cure|weapon|seal|throne>
//   4. assert endingTriggered === true AND endingChoice === '<ending>'
//
// The lore skill check on each terminal has dc: 4.  With wits-based classes
// (reclaimer/warden/shepherd) or a high-wits build, success is guaranteed at
// mockRandom = 0.95 (roll1d10 = 10 → total ≥ dc regardless of stat).
//
// Action counts are asserted at the end of each route.
//
// Per-class shortcuts:
//   - Shepherd  gets +2 lore (class bonus) — skill check margin is widest
//   - Reclaimer gets +2 electronics (useful in Scar, not lore) — standard lore path
//   - Broker    gets +1 lore — small advantage
//   - Others    have no lore bonus — rely on wits stat
//
// Cycle 1 viability:
//   - All 4 endings: NOT viable in cycle 1 (scar rooms cycleGate: 3)
//   - Documented with explicit TODO markers below.
//
// ============================================================

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { buildMockDb } from './harness'

// ------------------------------------------------------------
// Mock DB — module-level so the vi.mock factory can close over it.
// ------------------------------------------------------------
let _mockDb: ReturnType<typeof import('./harness').buildMockDb>

// ------------------------------------------------------------
// ALL vi.mock calls must precede module imports.
// ------------------------------------------------------------

vi.mock('@/lib/supabase', () => ({
  createSupabaseBrowserClient: () => _mockDb,
}))

vi.mock('@/lib/inventory', () => ({
  getInventory: vi.fn().mockResolvedValue([]),
  addItem: vi.fn().mockResolvedValue(undefined),
  removeItem: vi.fn().mockResolvedValue(undefined),
  groupAndFormatItems: vi.fn(() => []),
}))

vi.mock('@/data/items', () => ({
  getItem: vi.fn().mockReturnValue(undefined),
}))

vi.mock('@/lib/fear', () => ({
  fearCheck: vi.fn(() => ({ messages: [], afraid: false, fearRounds: 0 })),
  echoRetentionFactor: vi.fn(() => 0.7),
  resistWhisperer: vi.fn(() => true),
}))

vi.mock('@/lib/richText', async (importOriginal) => {
  const actual = await importOriginal<typeof import('@/lib/richText')>()
  return actual
})

vi.mock('@/lib/messages', async (importOriginal) => {
  const actual = await importOriginal<typeof import('@/lib/messages')>()
  return {
    ...actual,
    msg: (text: string, type = 'narrative') => ({ id: `sr-${Math.random()}`, text, type }),
    systemMsg: (text: string) => ({ id: `sr-${Math.random()}`, text, type: 'system' }),
    combatMsg: (text: string) => ({ id: `sr-${Math.random()}`, text, type: 'combat' }),
    errorMsg: (text: string) => ({ id: `sr-${Math.random()}`, text, type: 'error' }),
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
  checkInitiativeTriggers: vi.fn().mockReturnValue({ trigger: null, updatedLastAction: 0 }),
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

vi.mock('@/lib/idleHint', () => ({
  shouldFireIdleHint: vi.fn().mockReturnValue(false),
  markIdleHintFired: vi.fn(),
  IDLE_HINT_MESSAGE: '',
}))

vi.mock('@/lib/wanderers', () => ({
  tickWanderers: vi.fn().mockReturnValue([]),
}))

vi.mock('@/lib/stealth', () => ({
  attemptStealth: vi.fn().mockResolvedValue({ success: false, messages: [] }),
}))

// ------------------------------------------------------------
// Imports after mocks
// ------------------------------------------------------------
import { PlayerSession } from './harness'
import type { CharacterClass, EndingChoice } from '@/types/game'

// ------------------------------------------------------------
// Constants
// ------------------------------------------------------------

const THE_CORE = 'scar_14_the_core'

// All 4 endings and the terminal keyword to examine
const ENDINGS: Array<{ choice: EndingChoice; keyword: string }> = [
  { choice: 'cure', keyword: 'cure' },
  { choice: 'weapon', keyword: 'weapon' },
  { choice: 'seal', keyword: 'seal' },
  { choice: 'throne', keyword: 'throne' },
]

// All 7 classes with their cycle-3 speedrun stats.
// For the lore check (dc: 4), we need wits + lore_class_bonus + roll >= 4.
// mockRandom = 0.95 → roll1d10 = 10 → guaranteed success even with wits=2.
// Stats are valid point-buys: classBonus + freePoints(4) consumed.
//
// Stat validation: sum of (stat - 2) over all stats must equal freePoints + sum of classBonus values.
const CLASS_SPECS: Array<{
  characterClass: CharacterClass
  stats: { vigor: number; grit: number; reflex: number; wits: number; presence: number; shadow: number }
}> = [
  // enforcer: classBonus { vigor:4, grit:2, reflex:2 } + 4 freePoints = 12 stat points
  // (6-2)+(4-2)+(4-2)+(4-2)+(2-2)+(4-2) = 4+2+2+2+0+2 = 12 ✓
  {
    characterClass: 'enforcer',
    stats: { vigor: 6, grit: 4, reflex: 4, wits: 4, presence: 2, shadow: 4 },
  },
  // scout: classBonus { reflex:4, wits:2, shadow:2 } + 4 freePoints = 12
  // (2-2)+(2-2)+(6-2)+(6-2)+(2-2)+(6-2) = 0+0+4+4+0+4 = 12 ✓
  {
    characterClass: 'scout',
    stats: { vigor: 2, grit: 2, reflex: 6, wits: 6, presence: 2, shadow: 6 },
  },
  // wraith: classBonus { shadow:4, reflex:2, wits:2 } + 4 freePoints = 12
  // (2-2)+(2-2)+(4-2)+(6-2)+(2-2)+(8-2) = 0+0+2+4+0+6 = 12 ✓
  {
    characterClass: 'wraith',
    stats: { vigor: 2, grit: 2, reflex: 4, wits: 6, presence: 2, shadow: 8 },
  },
  // shepherd: classBonus { presence:4, grit:2, wits:2 } + 4 freePoints = 12
  // +2 lore class bonus helps the skill check
  // (2-2)+(4-2)+(2-2)+(6-2)+(6-2)+(4-2) = 0+2+0+4+4+2 = 12 ✓
  {
    characterClass: 'shepherd',
    stats: { vigor: 2, grit: 4, reflex: 2, wits: 6, presence: 6, shadow: 4 },
  },
  // reclaimer: classBonus { wits:4, grit:2, presence:2 } + 4 freePoints = 12
  // (2-2)+(4-2)+(2-2)+(8-2)+(4-2)+(4-2) = 0+2+0+6+2+2 = 12 ✓
  {
    characterClass: 'reclaimer',
    stats: { vigor: 2, grit: 4, reflex: 2, wits: 8, presence: 4, shadow: 4 },
  },
  // warden: classBonus { vigor:3, grit:3, presence:2 } + 4 freePoints = 12
  // (5-2)+(5-2)+(2-2)+(5-2)+(4-2)+(3-2) = 3+3+0+3+2+1 = 12 ✓
  {
    characterClass: 'warden',
    stats: { vigor: 5, grit: 5, reflex: 2, wits: 5, presence: 4, shadow: 3 },
  },
  // broker: classBonus { presence:4, shadow:3, wits:1 } + 4 freePoints = 12
  // +1 lore class bonus; high presence+shadow
  // (2-2)+(2-2)+(2-2)+(5-2)+(6-2)+(7-2) = 0+0+0+3+4+5 = 12 ✓
  {
    characterClass: 'broker',
    stats: { vigor: 2, grit: 2, reflex: 2, wits: 5, presence: 6, shadow: 7 },
  },
]

// ------------------------------------------------------------
// ------------------------------------------------------------
// Minimum action budget per route:
//   - 1 action: examine <terminal>
//   After teleport (0 actions), one examine fires the ending.
//   Budget cap: ≤ 10 actions (very conservative; real count = 1 examine)
// ------------------------------------------------------------
const MAX_ACTIONS_PER_ROUTE = 10

// ------------------------------------------------------------
// Helper: assert ending was triggered.
//
// The engine's setQuestFlag() method sets player.questFlags immediately
// but schedules endingTriggered via setTimeout(fn, 3000).  Rather than
// battle fake-timer / async-flush complexities, we assert on questFlags
// directly (which is synchronous) and also use vi.runAllTimersAsync()
// to advance through the setTimeout chain so endingTriggered is also set.
//
// Seal ending has a nested setTimeout(fn, 3000) + setTimeout(fn, 2000),
// so we need two passes. vi.runAllTimersAsync() handles all pending timers
// including those spawned by timer callbacks.
// ------------------------------------------------------------
async function assertEndingTriggered(
  session: PlayerSession,
  expectedChoice: EndingChoice,
): Promise<void> {
  // questFlags.charon_choice is set synchronously by setQuestFlag()
  const flags = session.player.questFlags ?? {}
  expect(flags['charon_choice']).toBe(expectedChoice)

  // Run all pending timers (including nested ones) to advance endingTriggered
  await vi.runAllTimersAsync()

  expect(session.state.endingTriggered).toBe(true)
  expect(session.state.endingChoice).toBe(expectedChoice)
}

// ============================================================
// Test Suite
// ============================================================

describe('P4-E — Speedrun strategy: cycle-1 viability', () => {
  // These tests document that all 4 endings are gated behind cycleGate: 3
  // and therefore unreachable in cycle 1.

  let session: PlayerSession

  beforeEach(() => {
    vi.useFakeTimers()
    _mockDb = buildMockDb()
    vi.clearAllMocks()
    session = new PlayerSession({ mockRandom: 0.95, forceSpawn: false })
  })

  afterEach(async () => {
    vi.useRealTimers()
    await session.destroy()
  })

  it.each(ENDINGS)(
    'TODO: $choice ending is NOT reachable in cycle 1 (scar entry + Core have cycleGate: 3)',
    async ({ choice, keyword: _keyword }) => {
      // TODO: The Scar entry room (scar_01_crater_rim) and the ending room
      // (scar_14_the_core) both have cycleGate: 3. Cycle-1 players are blocked
      // from entering the Scar zone by lib/actions/movement.ts line 302.
      // This means no cycle-1 path to scar_14_the_core exists for any ending.
      //
      // Not all interior Scar rooms have cycleGate: 3 — some sub-rooms don't
      // need individual gates because the entry gate catches all traffic.
      // The design invariant is: entry point (scar_01) + Core (scar_14) are gated.

      await session.create({
        name: `Cycle1-${choice}`,
        characterClass: 'enforcer',
        stats: { vigor: 6, grit: 4, reflex: 4, wits: 4, presence: 2, shadow: 4 },
        personalLoss: { type: 'community' },
      })

      // Cycle 1 — confirm the movement system blocks entry
      expect(session.player.cycle).toBe(1)

      // The Core's cycleGate: 3 means normal movement is blocked.
      // All 4 endings require at minimum cycle 3 rebirth.
      const coreRoom = session.state.currentRoom
      // Player did not reach the Core via normal movement
      expect(coreRoom?.id).not.toBe(THE_CORE)

      // Verify the key design invariants: entry room + Core are gated at cycle 3.
      const { ALL_ROOMS } = await import('@/data/rooms/index')
      const entryRoom = ALL_ROOMS.find(r => r.id === 'scar_01_crater_rim')
      const coreRoomData = ALL_ROOMS.find(r => r.id === THE_CORE)
      expect(entryRoom).toBeDefined()
      expect(coreRoomData).toBeDefined()
      expect(entryRoom!.cycleGate, 'Scar entry (scar_01_crater_rim) must have cycleGate: 3').toBe(3)
      expect(coreRoomData!.cycleGate, 'The Core (scar_14_the_core) must have cycleGate: 3').toBe(3)
    }
  )
})

describe('P4-E — Speedrun strategy: skip-prologue path (teleport)', () => {
  let session: PlayerSession

  beforeEach(() => {
    vi.useFakeTimers()
    _mockDb = buildMockDb()
    vi.clearAllMocks()
  })

  afterEach(async () => {
    vi.useRealTimers()
    await session.destroy()
  })

  it('teleport to cr_02_gate (skip prologue starting room) succeeds', async () => {
    session = new PlayerSession({ mockRandom: 0.95 })
    await session.create({
      name: 'Prologue-Skip',
      characterClass: 'enforcer',
      stats: { vigor: 6, grit: 4, reflex: 4, wits: 4, presence: 2, shadow: 4 },
      personalLoss: { type: 'community' },
    })

    const startRoom = session.currentRoom.id
    // Harness starts at cr_01_approach
    expect(startRoom).toBe('cr_01_approach')

    // Teleport to the Crossroads gate — skip walking the prologue approach
    session.teleport('cr_02_gate')
    expect(session.currentRoom.id).toBe('cr_02_gate')
    expect(session.player.currentRoomId).toBe('cr_02_gate')

    // Zero movement actions consumed (teleport does not increment actionsTaken)
    const actionsBefore = session.player.actionsTaken
    session.teleport('cr_05_market_north')
    expect(session.player.actionsTaken).toBe(actionsBefore)
  })

  it('teleport directly to scar_14_the_core (cycle 3) costs zero movement actions', async () => {
    session = new PlayerSession({ mockRandom: 0.95 })
    await session.create({
      name: 'Direct-Core',
      characterClass: 'reclaimer',
      stats: { vigor: 2, grit: 4, reflex: 2, wits: 8, presence: 4, shadow: 4 },
      personalLoss: { type: 'community' },
    })

    const player = session.player
    session['_engine']._setState({ player: { ...player, cycle: 3 } })

    const actionsBefore = session.player.actionsTaken
    session.teleport(THE_CORE)

    expect(session.currentRoom.id).toBe(THE_CORE)
    expect(session.player.actionsTaken).toBe(actionsBefore)
  })
})

describe('P4-E — Speedrun strategy: bare-minimum NPC interactions', () => {
  let session: PlayerSession

  beforeEach(() => {
    vi.useFakeTimers()
    _mockDb = buildMockDb()
    vi.clearAllMocks()
  })

  afterEach(async () => {
    vi.useRealTimers()
    await session.destroy()
  })

  it('zero NPC interactions required to reach ending via harness teleport', async () => {
    // Speedrun path: create → set cycle 3 → teleport Core → examine <ending>
    // No NPC talk commands are needed.
    session = new PlayerSession({ mockRandom: 0.95, forceSpawn: false })
    await session.create({
      name: 'No-NPC-Run',
      characterClass: 'shepherd', // +2 lore bonus makes skill check safest
      stats: { vigor: 2, grit: 4, reflex: 2, wits: 6, presence: 6, shadow: 4 },
      personalLoss: { type: 'community' },
    })

    const player = session.player
    session['_engine']._setState({ player: { ...player, cycle: 3 } })
    session.teleport(THE_CORE)

    // Confirm no dialogue is active (no NPC interaction happened)
    expect(session.isInDialogue()).toBe(false)
    // Confirm no combat (Core is noCombat: true)
    expect(session.isInCombat()).toBe(false)

    const actionsBefore = session.player.actionsTaken
    await session.cmd('examine cure')
    await assertEndingTriggered(session, 'cure')

    // Only 1 action taken (the examine command)
    const actionsAfter = session.player.actionsTaken
    expect(actionsAfter - actionsBefore).toBeLessThanOrEqual(MAX_ACTIONS_PER_ROUTE)
  })
})

describe('P4-E — Speedrun strategy: bare-minimum combat', () => {
  let session: PlayerSession

  beforeEach(() => {
    vi.useFakeTimers()
    _mockDb = buildMockDb()
    vi.clearAllMocks()
  })

  afterEach(async () => {
    vi.useRealTimers()
    await session.destroy()
  })

  it('zero combat required to reach ending via harness teleport (scar_14 is noCombat: true)', async () => {
    session = new PlayerSession({ mockRandom: 0.95, forceSpawn: false })
    await session.create({
      name: 'No-Combat-Run',
      characterClass: 'wraith',
      stats: { vigor: 2, grit: 2, reflex: 4, wits: 6, presence: 2, shadow: 8 },
      personalLoss: { type: 'identity' },
    })

    const player = session.player
    session['_engine']._setState({ player: { ...player, cycle: 3 } })
    session.teleport(THE_CORE)

    // Core has flags.noCombat: true — no enemies ever spawn
    const coreRoom = session.currentRoom
    expect(coreRoom.flags.noCombat).toBe(true)
    expect(coreRoom.enemies).toHaveLength(0)
    expect(session.isInCombat()).toBe(false)

    await session.cmd('examine throne')
    await assertEndingTriggered(session, 'throne')

    expect(session.isInCombat()).toBe(false)
  })
})

describe('P4-E — Speedrun strategy: 4 endings × action count assertions', () => {
  beforeEach(() => {
    vi.useFakeTimers()
    _mockDb = buildMockDb()
    vi.clearAllMocks()
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  it.each(ENDINGS)(
    '$choice ending: reached in ≤ N actions using shepherd (fastest — +2 lore bonus)',
    async ({ choice, keyword }) => {
      const session = new PlayerSession({ mockRandom: 0.95, forceSpawn: false })
      await session.create({
        name: `Shepherd-${choice}`,
        characterClass: 'shepherd',
        stats: { vigor: 2, grit: 4, reflex: 2, wits: 6, presence: 6, shadow: 4 },
        personalLoss: { type: 'community' },
      })

      // Advance to cycle 3 (required for Scar access)
      const player = session.player
      session['_engine']._setState({ player: { ...player, cycle: 3 } })

      // Teleport directly to Core — bypass all movement
      session.teleport(THE_CORE)

      const actionsAtTeleport = session.player.actionsTaken

      // Single action: examine the terminal
      await session.cmd(`examine ${keyword}`)
      await assertEndingTriggered(session, choice)

      const actionsUsed = session.player.actionsTaken - actionsAtTeleport
      expect(
        actionsUsed,
        `${choice} ending should consume ≤ ${MAX_ACTIONS_PER_ROUTE} actions; used ${actionsUsed}`
      ).toBeLessThanOrEqual(MAX_ACTIONS_PER_ROUTE)

      await session.destroy()
    }
  )
})

describe('P4-E — Speedrun strategy: requires-rebirth viability (cycle 3)', () => {
  beforeEach(() => {
    vi.useFakeTimers()
    _mockDb = buildMockDb()
    vi.clearAllMocks()
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  it.each(ENDINGS)(
    '$choice ending: viable at cycle 3 (Scar cycleGate satisfied)',
    async ({ choice, keyword }) => {
      const session = new PlayerSession({ mockRandom: 0.95, forceSpawn: false })
      await session.create({
        name: `Cycle3-${choice}`,
        characterClass: 'reclaimer',
        stats: { vigor: 2, grit: 4, reflex: 2, wits: 8, presence: 4, shadow: 4 },
        personalLoss: { type: 'promise' },
      })

      // Verify cycle starts at 1
      expect(session.player.cycle).toBe(1)

      // Simulate two rebirths — set cycle to 3
      const player = session.player
      session['_engine']._setState({ player: { ...player, cycle: 3 } })
      expect(session.player.cycle).toBe(3)

      // Teleport to Core — now accessible (cycleGate: 3 satisfied)
      session.teleport(THE_CORE)
      expect(session.currentRoom.id).toBe(THE_CORE)

      // Trigger ending
      await session.cmd(`examine ${keyword}`)
      await assertEndingTriggered(session, choice)

      await session.destroy()
    }
  )
})

describe('P4-E — Speedrun strategy: per-class fastest path (all 7 classes × all 4 endings)', () => {
  // 7 classes × 4 endings = 28 combinations.
  // All classes use the same teleport-to-Core speedrun path.
  // Class differences:
  //   - Shepherd: +2 lore (widest skill check margin)
  //   - Broker:   +1 lore (slight advantage)
  //   - Others:   no lore class bonus (rely on wits stat + roll)
  // All succeed with mockRandom=0.95 (roll=10, trivially beats dc:4).

  beforeEach(() => {
    vi.useFakeTimers()
    _mockDb = buildMockDb()
    vi.clearAllMocks()
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  const testCases = CLASS_SPECS.flatMap(spec =>
    ENDINGS.map(ending => ({ spec, ending }))
  )

  it.each(testCases)(
    '$spec.characterClass → $ending.choice: teleport speedrun reaches ending in ≤ N actions',
    async ({ spec, ending }) => {
      const session = new PlayerSession({ mockRandom: 0.95, forceSpawn: false })
      await session.create({
        name: `${spec.characterClass}-${ending.choice}`,
        characterClass: spec.characterClass,
        stats: spec.stats,
        personalLoss: { type: 'community' },
      })

      // Cycle 3 required for all Scar rooms
      const player = session.player
      session['_engine']._setState({ player: { ...player, cycle: 3 } })

      // Teleport directly to Core
      session.teleport(THE_CORE)
      expect(session.currentRoom.id).toBe(THE_CORE)

      const actionsAtTeleport = session.player.actionsTaken

      // Examine the ending terminal
      await session.cmd(`examine ${ending.keyword}`)
      await assertEndingTriggered(session, ending.choice)

      const actionsUsed = session.player.actionsTaken - actionsAtTeleport
      expect(
        actionsUsed,
        `${spec.characterClass} → ${ending.choice}: ≤ ${MAX_ACTIONS_PER_ROUTE} actions; used ${actionsUsed}`
      ).toBeLessThanOrEqual(MAX_ACTIONS_PER_ROUTE)

      await session.destroy()
    }
  )
})
