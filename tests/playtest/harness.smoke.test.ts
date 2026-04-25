// ============================================================
// harness.smoke.test.ts — Smoke test for PlayerSession harness
//
// Verifies the harness itself can:
//  1. Create a session with a minimal Enforcer character
//  2. Assert player HP matches the formula 8 + (vigor-2)*2
//  3. Assert ledger is non-null
//  4. Walk one room (north from cr_01_approach -> cr_02_gate)
//  5. Issue 'look' and confirm log grows
//  6. Destroy the session cleanly
//
// This file intentionally stays narrow — it validates the harness,
// not game mechanics. H2–H6 cover the mechanics.
// ============================================================

import { describe, it, expect, vi, beforeEach } from 'vitest'
import { buildMockDb } from './harness'

// ------------------------------------------------------------
// Mock wiring — must precede module imports
// All standard narrative pipeline mocks are silenced so
// createCharacter / executeAction can run without side-effects.
// ------------------------------------------------------------

const mockDb = buildMockDb()

vi.mock('@/lib/supabase', () => ({
  createSupabaseBrowserClient: () => mockDb,
}))

vi.mock('@/lib/world', () => ({
  getRoom: vi.fn().mockResolvedValue({
    id: 'cr_01_approach',
    name: 'Highway Junction — The Approach',
    description: 'Two highways meet here.',
    shortDescription: 'Dusty approach.',
    zone: 'crossroads',
    difficulty: 1,
    visited: false,
    flags: { tutorialZone: true },
    exits: { north: 'cr_02_gate' },
    items: [],
    enemies: [],
    npcs: [],
  }),
  updateRoomItems: vi.fn().mockResolvedValue(undefined),
  updateRoomFlags: vi.fn().mockResolvedValue(undefined),
  markVisited: vi.fn().mockResolvedValue(undefined),
  persistWorld: vi.fn().mockResolvedValue(undefined),
  canMove: vi.fn().mockReturnValue(true),
  getExits: vi.fn().mockReturnValue([]),
  getRoomDescription: vi.fn().mockReturnValue('Two highways meet here.'),
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
  fearCheck: vi.fn(() => ({ messages: [] })),
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
    msg: (text: string, type = 'narrative') => ({ id: 'smoke-' + Math.random(), text, type }),
    systemMsg: (text: string) => ({ id: 'smoke-' + Math.random(), text, type: 'system' }),
    combatMsg: (text: string) => ({ id: 'smoke-' + Math.random(), text, type: 'combat' }),
    errorMsg: (text: string) => ({ id: 'smoke-' + Math.random(), text, type: 'error' }),
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

vi.mock('@/lib/skillBonus', () => ({
  getStatForSkill: vi.fn(() => null),
  getStatNameForSkill: vi.fn(() => null),
}))

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

// Import after mocks
import { PlayerSession } from './harness'
import { getRoom } from '@/lib/world'

// ------------------------------------------------------------
// Spec — minimal valid Enforcer
// Enforcer classBonus: { vigor: 4, grit: 2, reflex: 2 }, freePoints: 4
// vigour floor=6, grit floor=4, reflex floor=4; totalBonusNeeded=12
// Distribution: vigor=6(+4), grit=4(+2), reflex=4(+2), wits=4(+2), presence=2(+0), shadow=4(+2) = 12 ✓
// HP = 8 + (6-2)*2 = 16
// ------------------------------------------------------------

const ENFORCER_SPEC = {
  name: 'Smoke',
  characterClass: 'enforcer' as const,
  stats: {
    vigor: 6,
    grit: 4,
    reflex: 4,
    wits: 4,
    presence: 2,
    shadow: 4,
  },
  personalLoss: { type: 'community' as const },
}

// ------------------------------------------------------------
// Tests
// ------------------------------------------------------------

describe('PlayerSession — smoke test', () => {
  let session: PlayerSession

  beforeEach(() => {
    vi.clearAllMocks()
    session = new PlayerSession({ mockRandom: 0.5 })
  })

  it('creates a character and populates player with correct HP', async () => {
    await session.create(ENFORCER_SPEC)

    const player = session.player
    expect(player).toBeDefined()
    expect(player.name).toBe('Smoke')
    expect(player.characterClass).toBe('enforcer')

    // HP formula: 8 + (vigor - 2) * 2
    const expectedHp = 8 + (player.vigor - 2) * 2
    expect(player.hp).toBe(expectedHp)
    expect(player.maxHp).toBe(expectedHp)

    await session.destroy()
  })

  it('ledger is non-null after create()', async () => {
    await session.create(ENFORCER_SPEC)

    const ledger = session.state.ledger
    expect(ledger).not.toBeNull()
    expect(ledger!.currentCycle).toBe(1)
    expect(typeof ledger!.worldSeed).toBe('number')

    await session.destroy()
  })

  it('walk north changes currentRoom', async () => {
    // Make getRoom return a different room for the north destination
    const mockGetRoom = getRoom as ReturnType<typeof vi.fn>
    mockGetRoom.mockImplementation(async (roomId: string) => {
      if (roomId === 'cr_02_gate') {
        return {
          id: 'cr_02_gate',
          name: 'Crossroads Gate',
          description: 'A heavy gate.',
          shortDescription: 'Heavy gate.',
          zone: 'crossroads',
          difficulty: 1,
          visited: false,
          flags: {},
          exits: { south: 'cr_01_approach' },
          items: [],
          enemies: [],
          npcs: [],
        }
      }
      return {
        id: 'cr_01_approach',
        name: 'Highway Junction — The Approach',
        description: 'Two highways meet here.',
        shortDescription: 'Dusty approach.',
        zone: 'crossroads',
        difficulty: 1,
        visited: false,
        flags: { tutorialZone: true },
        exits: { north: 'cr_02_gate' },
        items: [],
        enemies: [],
        npcs: [],
      }
    })

    await session.create(ENFORCER_SPEC)
    const startRoomId = session.currentRoom.id

    await session.walk(['north'])

    expect(session.currentRoom.id).not.toBe(startRoomId)

    await session.destroy()
  })

  it('cmd("look") appends to the log', async () => {
    await session.create(ENFORCER_SPEC)
    const before = session.log.length

    await session.cmd('look')

    expect(session.log.length).toBeGreaterThan(before)

    await session.destroy()
  })

  it('destroy() resolves without throwing', async () => {
    await session.create(ENFORCER_SPEC)
    await expect(session.destroy()).resolves.toBeUndefined()
  })
})
