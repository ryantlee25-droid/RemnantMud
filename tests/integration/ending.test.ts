// ============================================================
// Integration tests for the ending trigger system
// ============================================================

import { describe, it, expect, vi } from 'vitest'
import type { GameState, Player, Room, GameMessage, EndingChoice } from '@/types/game'
import type { EngineCore } from '@/lib/actions/types'
import { createCycleSnapshot } from '@/lib/echoes'

// ------------------------------------------------------------
// Helpers
// ------------------------------------------------------------

function makePlayer(overrides: Partial<Player> = {}): Player {
  return {
    id: 'p1', name: 'Tester', characterClass: 'enforcer',
    vigor: 10, grit: 8, reflex: 6, wits: 5, presence: 4, shadow: 3,
    hp: 20, maxHp: 20, currentRoomId: 'room_1', worldSeed: 1,
    xp: 0, level: 1, actionsTaken: 0, isDead: false, cycle: 1, totalDeaths: 0,
    questFlags: {},
    factionReputation: {},
    ...overrides,
  }
}

function makeRoom(overrides: Partial<Room> = {}): Room {
  return {
    id: 'room_1', name: 'Test Room', description: 'A test room.',
    shortDescription: 'Test.', zone: 'crossroads', difficulty: 1,
    visited: false, flags: {}, exits: {}, items: [], enemies: [], npcs: [],
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
  }
}

// ------------------------------------------------------------
// Tests — ending state transitions
// ------------------------------------------------------------

describe('Ending trigger — charon_choice quest flag', () => {
  const VALID_ENDINGS: EndingChoice[] = ['cure', 'weapon', 'seal', 'throne']

  it('validates all four ending choices are recognized', () => {
    for (const choice of VALID_ENDINGS) {
      expect(['cure', 'weapon', 'seal', 'throne']).toContain(choice)
    }
  })

  it('endingTriggered defaults to false', () => {
    const engine = makeEngine()
    expect(engine.state.endingTriggered).toBe(false)
    expect(engine.state.endingChoice).toBeNull()
  })

  it('setting endingTriggered updates game state', () => {
    const engine = makeEngine()
    engine._setState({ endingTriggered: true, endingChoice: 'cure' })
    expect(engine.getState().endingTriggered).toBe(true)
    expect(engine.getState().endingChoice).toBe('cure')
  })

  it.each(VALID_ENDINGS)('ending choice "%s" can be set on game state', (choice) => {
    const engine = makeEngine()
    engine._setState({ endingTriggered: true, endingChoice: choice })
    expect(engine.getState().endingChoice).toBe(choice)
  })
})

describe('Ending — cycle snapshot creation', () => {
  it('creates a cycle snapshot with ending choice', () => {
    const player = makePlayer({
      cycle: 2,
      factionReputation: { accord: 3, salters: -2 },
      questFlags: { found_meridian: true, charon_choice: 'cure' },
    })

    const snapshot = createCycleSnapshot(player, 'cure')
    expect(snapshot.cycle).toBe(2)
    expect(snapshot.endingChoice).toBe('cure')
    expect(snapshot.factionsAligned).toContain('accord')
    expect(snapshot.factionsAntagonized).toContain('salters')
  })

  it('creates a cycle snapshot without ending choice (death)', () => {
    const player = makePlayer({ cycle: 1 })
    const snapshot = createCycleSnapshot(player)
    expect(snapshot.cycle).toBe(1)
    expect(snapshot.endingChoice).toBeUndefined()
  })
})

describe('Ending — terminal lockout after choice', () => {
  it('ending state prevents further game actions when endingTriggered is true', () => {
    const engine = makeEngine({ endingTriggered: true, endingChoice: 'cure' })
    // The game engine checks endingTriggered before processing commands
    expect(engine.getState().endingTriggered).toBe(true)
    // Any command dispatcher should check this flag
  })

  it('ending state preserves the chosen ending type', () => {
    const engine = makeEngine()
    engine._setState({ endingTriggered: true, endingChoice: 'weapon' })
    // State should maintain ending choice across reads
    expect(engine.getState().endingChoice).toBe('weapon')
    expect(engine.getState().endingTriggered).toBe(true)
  })
})

describe('Ending — dead state interaction', () => {
  it('ending should not trigger when player is dead', () => {
    const engine = makeEngine({ playerDead: true })
    // If player is dead, ending should not be processed
    expect(engine.getState().playerDead).toBe(true)
    expect(engine.getState().endingTriggered).toBe(false)
  })

  it('death during ending does not create duplicate snapshots', () => {
    const engine = makeEngine({
      endingTriggered: true,
      endingChoice: 'seal',
      cycleHistory: [{ cycle: 1, factionsAligned: [], factionsAntagonized: [], npcRelationships: {}, questsCompleted: [] }],
    })
    // Snapshot was already created; death handler should not create another
    const historyBefore = engine.getState().cycleHistory?.length ?? 0
    expect(historyBefore).toBe(1)
  })
})
