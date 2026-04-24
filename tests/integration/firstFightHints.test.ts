// ============================================================
// tests/integration/firstFightHints.test.ts
// First-fight onboarding hints (H3)
//
// Verifies:
//   - Each hint fires exactly once when its condition is met
//   - low_hp_combat triggers at exactly ≤30% HP, not above
//   - second_encounter does not fire on the first combat-start
//   - Hints do not fire if their localStorage flag is already set
// ============================================================

import { describe, it, expect, vi, beforeEach } from 'vitest'
import type { GameState, Player, Room, GameMessage, CombatState, Enemy } from '@/types/game'
import type { EngineCore } from '@/lib/actions/types'
import { handleTutorialHint } from '../../lib/actions/system'

// ------------------------------------------------------------
// Minimal mocks needed by system.ts
// ------------------------------------------------------------

vi.mock('@/lib/gameEngine', () => ({
  xpForNextLevel: vi.fn(() => 100),
  getTimeOfDay: vi.fn(() => 'day'),
}))

vi.mock('@/lib/messages', () => ({
  msg: (text: string, type = 'narrative') => ({ id: 'test-id', text, type }),
  systemMsg: (text: string) => ({ id: 'test-id', text, type: 'system' }),
}))

vi.mock('@/lib/richText', () => ({
  rt: {
    exit: (d: string) => d,
    item: (n: string) => n,
    enemy: (n: string) => n,
    npc: (n: string) => n,
    keyword: (k: string) => k,
    trait: (t: string) => t,
  },
}))

vi.mock('@/data/questDescriptions', () => ({
  getQuestEntries: vi.fn(() => ({ active: [], completed: [] })),
}))

// ------------------------------------------------------------
// Helpers
// ------------------------------------------------------------

function makePlayer(overrides: Partial<Player> = {}): Player {
  return {
    id: 'p1', name: 'Tester', characterClass: 'enforcer',
    vigor: 5, grit: 5, reflex: 5, wits: 5, presence: 5, shadow: 5,
    hp: 10, maxHp: 10, currentRoomId: 'cr_01', worldSeed: 1,
    xp: 0, level: 1, actionsTaken: 0, isDead: false, cycle: 1, totalDeaths: 0,
    ...overrides,
  }
}

function makeRoom(overrides: Partial<Room> = {}): Room {
  return {
    id: 'cr_01', name: 'Test Room', description: 'A test room.',
    shortDescription: 'Short.', zone: 'crossroads', difficulty: 1,
    visited: false, flags: {}, exits: {}, items: [], enemies: [], npcs: [],
    ...overrides,
  }
}

function makeCombatState(overrides: Partial<CombatState> = {}): CombatState {
  const enemy: Enemy = {
    id: 'shuffler', name: 'Shuffler', description: 'A shambling corpse.',
    hp: 5, maxHp: 5, attack: 2, defense: 8, damage: [1, 3],
    xp: 10, loot: [],
  }
  return {
    enemy,
    enemyHp: 5,
    playerGoesFirst: true,
    turn: 1,
    active: true,
    playerConditions: [],
    enemyConditions: [],
    abilityUsed: false,
    defendingThisTurn: false,
    waitingBonus: 0,
    ...overrides,
  }
}

function makeEngine(state: Partial<GameState> = {}): EngineCore & { messages: GameMessage[]; state: GameState } {
  const fullState: GameState = {
    player: makePlayer(),
    currentRoom: makeRoom(),
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
    ...state,
  }
  const messages: GameMessage[] = []
  return {
    messages,
    state: fullState,
    getState: () => fullState,
    _setState: (partial) => Object.assign(fullState, partial),
    _appendMessages: (msgs) => messages.push(...msgs),
    _savePlayer: vi.fn().mockResolvedValue(undefined),
    _applyPopulation: (room) => room,
    _handlePlayerDeath: vi.fn().mockResolvedValue(undefined),
    _checkLevelUp: vi.fn(),
    adjustReputation: vi.fn().mockResolvedValue(undefined),
    setQuestFlag: vi.fn().mockResolvedValue(undefined),
    grantNarrativeKey: vi.fn().mockResolvedValue(undefined),
  }
}

// ------------------------------------------------------------
// Tests: handleTutorialHint — new hint text entries
// ------------------------------------------------------------

describe('handleTutorialHint — first_combat_start', () => {
  it('fires the hint when the key is not set', async () => {
    const engine = makeEngine()
    await handleTutorialHint(engine, 'first_combat_start')

    const msgs = engine.messages.filter(m => m.type === 'system')
    expect(msgs.length).toBe(1)
    expect(msgs[0].text).toContain("attack")
    expect(msgs[0].text).toContain("flee")
  })

  it('fires exactly once — does not repeat when localStorage key is set', async () => {
    localStorage.setItem('remnant_tutorial_first_combat_start', '1')
    const engine = makeEngine()
    await handleTutorialHint(engine, 'first_combat_start')

    const msgs = engine.messages.filter(m => m.type === 'system')
    expect(msgs.length).toBe(0)
  })

  it('sets the localStorage flag after firing', async () => {
    const engine = makeEngine()
    await handleTutorialHint(engine, 'first_combat_start')

    expect(localStorage.getItem('remnant_tutorial_first_combat_start')).toBe('1')
  })
})

describe('handleTutorialHint — first_kill', () => {
  it('fires the hint when the key is not set', async () => {
    const engine = makeEngine()
    await handleTutorialHint(engine, 'first_kill')

    const msgs = engine.messages.filter(m => m.type === 'system')
    expect(msgs.length).toBe(1)
    expect(msgs[0].text).toContain("look")
    expect(msgs[0].text).toContain("take")
  })

  it('does not fire if localStorage flag already set', async () => {
    localStorage.setItem('remnant_tutorial_first_kill', '1')
    const engine = makeEngine()
    await handleTutorialHint(engine, 'first_kill')

    expect(engine.messages.filter(m => m.type === 'system').length).toBe(0)
  })
})

describe('handleTutorialHint — low_hp_combat', () => {
  it('fires the hint when the key is not set', async () => {
    const engine = makeEngine()
    await handleTutorialHint(engine, 'low_hp_combat')

    const msgs = engine.messages.filter(m => m.type === 'system')
    expect(msgs.length).toBe(1)
    expect(msgs[0].text).toContain("flee")
  })

  it('does not fire if localStorage flag already set', async () => {
    localStorage.setItem('remnant_tutorial_low_hp_combat', '1')
    const engine = makeEngine()
    await handleTutorialHint(engine, 'low_hp_combat')

    expect(engine.messages.filter(m => m.type === 'system').length).toBe(0)
  })
})

describe('handleTutorialHint — second_encounter', () => {
  it('fires the hint when the key is not set', async () => {
    const engine = makeEngine()
    await handleTutorialHint(engine, 'second_encounter')

    const msgs = engine.messages.filter(m => m.type === 'system')
    expect(msgs.length).toBe(1)
    expect(msgs[0].text).toContain("examine")
  })

  it('does not fire if localStorage flag already set', async () => {
    localStorage.setItem('remnant_tutorial_second_encounter', '1')
    const engine = makeEngine()
    await handleTutorialHint(engine, 'second_encounter')

    expect(engine.messages.filter(m => m.type === 'system').length).toBe(0)
  })
})

// ------------------------------------------------------------
// Tests: trigger-condition logic (via attemptTutorialHint simulation)
//
// We exercise the EXACT conditions from gameEngine.ts by replicating
// the guard logic here, so we can verify boundary behaviour without
// needing to run the full engine dispatch.
// ------------------------------------------------------------

describe('low_hp_combat trigger condition — ≤30% HP boundary', () => {
  // Helper: simulate the low_hp_combat check from gameEngine.ts
  async function simulateLowHpCheck(engine: ReturnType<typeof makeEngine>): Promise<void> {
    const p = engine.state.player
    if (p && p.hp > 0 && engine.state.combatState?.active) {
      if (p.hp / p.maxHp <= 0.3) {
        await handleTutorialHint(engine, 'low_hp_combat')
      }
    }
  }

  it('fires at exactly 30% HP (boundary)', async () => {
    const engine = makeEngine({
      player: makePlayer({ hp: 3, maxHp: 10 }),  // 30%
      combatState: makeCombatState({ active: true }),
    })
    await simulateLowHpCheck(engine)
    expect(engine.messages.filter(m => m.type === 'system').length).toBe(1)
  })

  it('fires at below 30% HP (e.g. 1/10)', async () => {
    const engine = makeEngine({
      player: makePlayer({ hp: 1, maxHp: 10 }),  // 10%
      combatState: makeCombatState({ active: true }),
    })
    await simulateLowHpCheck(engine)
    expect(engine.messages.filter(m => m.type === 'system').length).toBe(1)
  })

  it('does NOT fire at 31% HP (above threshold)', async () => {
    const engine = makeEngine({
      player: makePlayer({ hp: 4, maxHp: 10 }),  // 40%
      combatState: makeCombatState({ active: true }),
    })
    await simulateLowHpCheck(engine)
    expect(engine.messages.filter(m => m.type === 'system').length).toBe(0)
  })

  it('does NOT fire at 50% HP', async () => {
    const engine = makeEngine({
      player: makePlayer({ hp: 5, maxHp: 10 }),  // 50%
      combatState: makeCombatState({ active: true }),
    })
    await simulateLowHpCheck(engine)
    expect(engine.messages.filter(m => m.type === 'system').length).toBe(0)
  })

  it('does NOT fire when not in combat (combatState null)', async () => {
    const engine = makeEngine({
      player: makePlayer({ hp: 2, maxHp: 10 }),  // 20% but no combat
      combatState: null,
    })
    await simulateLowHpCheck(engine)
    expect(engine.messages.filter(m => m.type === 'system').length).toBe(0)
  })

  it('does NOT fire when HP is 0 (player dead)', async () => {
    const engine = makeEngine({
      player: makePlayer({ hp: 0, maxHp: 10 }),
      combatState: makeCombatState({ active: true }),
    })
    await simulateLowHpCheck(engine)
    expect(engine.messages.filter(m => m.type === 'system').length).toBe(0)
  })
})

describe('second_encounter trigger condition — not on first combat-start', () => {
  // Helper: simulate the second_encounter check from gameEngine.ts
  async function simulateCombatStart(engine: ReturnType<typeof makeEngine>, wasInCombat: boolean): Promise<void> {
    if (!wasInCombat && engine.state.combatState?.active) {
      await handleTutorialHint(engine, 'first_combat_start')

      if (typeof localStorage !== 'undefined') {
        const countKey = 'remnant_tutorial_combat_count'
        const prev = parseInt(localStorage.getItem(countKey) ?? '0', 10)
        const next = prev + 1
        localStorage.setItem(countKey, String(next))
        if (next === 2) {
          await handleTutorialHint(engine, 'second_encounter')
        }
      }
    }
  }

  it('second_encounter does NOT fire on first combat-start', async () => {
    const engine = makeEngine({
      combatState: makeCombatState({ active: true }),
    })
    await simulateCombatStart(engine, false)

    const secondEncounterMsgs = engine.messages.filter(m =>
      m.type === 'system' && m.text.includes('examine')
    )
    expect(secondEncounterMsgs.length).toBe(0)
  })

  it('second_encounter fires on second combat-start', async () => {
    // Simulate first combat-start
    const engine1 = makeEngine({ combatState: makeCombatState({ active: true }) })
    await simulateCombatStart(engine1, false)

    // Simulate second combat-start with fresh engine (but localStorage carries over)
    const engine2 = makeEngine({ combatState: makeCombatState({ active: true }) })
    await simulateCombatStart(engine2, false)

    const secondEncounterMsgs = engine2.messages.filter(m =>
      m.type === 'system' && m.text.includes('examine')
    )
    expect(secondEncounterMsgs.length).toBe(1)
  })

  it('second_encounter does NOT fire on third combat-start (fires only once)', async () => {
    // Simulate first and second combat-starts
    const engine1 = makeEngine({ combatState: makeCombatState({ active: true }) })
    await simulateCombatStart(engine1, false)
    const engine2 = makeEngine({ combatState: makeCombatState({ active: true }) })
    await simulateCombatStart(engine2, false)

    // Now localStorage has second_encounter set; third start should not fire it again
    const engine3 = makeEngine({ combatState: makeCombatState({ active: true }) })
    await simulateCombatStart(engine3, false)

    const secondEncounterMsgs = engine3.messages.filter(m =>
      m.type === 'system' && m.text.includes('examine')
    )
    expect(secondEncounterMsgs.length).toBe(0)
  })
})

describe('first_kill trigger condition', () => {
  // Helper: simulate the first_kill check from gameEngine.ts
  async function simulateFirstKillCheck(engine: ReturnType<typeof makeEngine>, wasInCombat: boolean): Promise<void> {
    if (wasInCombat && !engine.state.combatState && engine.state.player && engine.state.player.hp > 0 && !engine.state.playerDead) {
      await handleTutorialHint(engine, 'first_kill')
    }
  }

  it('fires when combat ends with player alive', async () => {
    const engine = makeEngine({
      player: makePlayer({ hp: 8, maxHp: 10 }),
      combatState: null,       // combat just ended
      playerDead: false,
    })
    await simulateFirstKillCheck(engine, true)  // wasInCombat = true

    expect(engine.messages.filter(m => m.type === 'system').length).toBe(1)
  })

  it('does NOT fire when combat was not active before action', async () => {
    const engine = makeEngine({
      player: makePlayer({ hp: 8, maxHp: 10 }),
      combatState: null,
      playerDead: false,
    })
    await simulateFirstKillCheck(engine, false)  // wasInCombat = false

    expect(engine.messages.filter(m => m.type === 'system').length).toBe(0)
  })

  it('does NOT fire when combatState is still active (fight ongoing)', async () => {
    const engine = makeEngine({
      player: makePlayer({ hp: 8, maxHp: 10 }),
      combatState: makeCombatState({ active: true }),
      playerDead: false,
    })
    await simulateFirstKillCheck(engine, true)

    expect(engine.messages.filter(m => m.type === 'system').length).toBe(0)
  })

  it('does NOT fire when player is dead (player_death scenario)', async () => {
    const engine = makeEngine({
      player: makePlayer({ hp: 0, maxHp: 10 }),
      combatState: null,
      playerDead: true,
    })
    await simulateFirstKillCheck(engine, true)

    expect(engine.messages.filter(m => m.type === 'system').length).toBe(0)
  })

  it('does NOT fire if localStorage flag already set', async () => {
    localStorage.setItem('remnant_tutorial_first_kill', '1')
    const engine = makeEngine({
      player: makePlayer({ hp: 8, maxHp: 10 }),
      combatState: null,
      playerDead: false,
    })
    await simulateFirstKillCheck(engine, true)

    expect(engine.messages.filter(m => m.type === 'system').length).toBe(0)
  })
})
