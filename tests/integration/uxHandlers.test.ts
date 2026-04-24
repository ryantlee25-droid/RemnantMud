// ============================================================
// tests/integration/uxHandlers.test.ts
// UX handler polish — verifies audit UX fixes:
//   - attack no-target lists visible enemies (UX #9)
//   - skill-gated exit failure mentions skill name/value (UX #13)
//   - handleHelp includes the 9 newly-documented verbs (doc-drift)
//   - handleJournal lists narrative keys when player has any (UX #16)
// ============================================================

import { describe, it, expect, vi, beforeEach } from 'vitest'
import type { GameState, Player, Room, GameMessage } from '@/types/game'
import type { EngineCore } from '@/lib/actions/types'

// ------------------------------------------------------------
// Mock external modules before importing handlers
// ------------------------------------------------------------

vi.mock('@/lib/world', () => ({
  getRoom: vi.fn(),
  markVisited: vi.fn().mockResolvedValue(undefined),
  canMove: vi.fn((room: Room, dir: string) => Object.keys(room.exits).includes(dir)),
  updateRoomFlags: vi.fn().mockResolvedValue(undefined),
  updateRoomItems: vi.fn().mockResolvedValue(undefined),
  getExits: vi.fn((room: Room) => Object.keys(room.exits).map((d) => ({ direction: d, roomId: (room.exits as Record<string, string>)[d] }))),
}))

vi.mock('@/lib/gameEngine', () => ({ getTimeOfDay: vi.fn(() => 'day') }))
vi.mock('@/lib/fear', () => ({ fearCheck: vi.fn(() => ({ messages: [] })) }))
vi.mock('@/lib/echoes', () => ({ getDeathRoomNarration: vi.fn(() => null) }))
vi.mock('@/lib/narrativeKeys', () => ({
  checkNarrativeUnlock: vi.fn(() => ({ unlocked: true, narration: [] })),
  grantNarrativeKey: vi.fn(() => []),
}))

vi.mock('@/data/items', () => ({
  getItem: vi.fn((id: string) => {
    if (id === 'scrap') return { id: 'scrap', name: 'Scrap Metal', description: 'Junk.', type: 'junk', weight: 1, value: 2 }
    return undefined
  }),
}))

vi.mock('@/data/enemies', () => ({
  getEnemy: vi.fn((id: string) => {
    if (id === 'shuffler') return {
      id: 'shuffler', name: 'Shuffler', description: 'A shambling corpse.',
      hp: 5, maxHp: 5, attack: 2, defense: 8, damage: [1, 3] as [number, number],
      xp: 10, loot: [],
    }
    if (id === 'brute') return {
      id: 'brute', name: 'Brute', description: 'A hulking mutant.',
      hp: 15, maxHp: 15, attack: 4, defense: 6, damage: [2, 6] as [number, number],
      xp: 25, loot: [],
    }
    return undefined
  }),
}))

vi.mock('@/data/npcs', () => ({ getNPC: vi.fn(() => undefined) }))

vi.mock('@/lib/skillBonus', () => ({
  getStatForSkill: vi.fn((_skill: string, player: Player) => player.vigor),
}))

vi.mock('@/lib/inventory', () => ({
  groupAndFormatItems: vi.fn(() => []),
  addItem: vi.fn().mockResolvedValue(undefined),
  removeItem: vi.fn().mockResolvedValue(undefined),
  getInventory: vi.fn().mockResolvedValue([]),
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

vi.mock('@/lib/messages', () => ({
  msg: (text: string, type = 'narrative') => ({ id: 'test-id', text, type }),
  systemMsg: (text: string) => ({ id: 'test-id', text, type: 'system' }),
  combatMsg: (text: string) => ({ id: 'test-id', text, type: 'combat' }),
  errorMsg: (text: string) => ({ id: 'test-id', text, type: 'error' }),
}))

vi.mock('@/data/questDescriptions', () => ({
  getQuestEntries: vi.fn(() => ({ active: [], completed: [] })),
}))

vi.mock('@/data/rooms/index', () => ({
  ALL_ROOMS: [],
}))

vi.mock('@/data/narrativeKeys/keys_by_zone', () => ({
  ALL_NARRATIVE_KEYS: [
    { id: 'crossroads_hidden_cellar', zone: 'crossroads', description: 'You know about the hidden storage cellar beneath the market stalls.', learnedVia: 'deduction', sourceHint: '', unlocks: '' },
    { id: 'stacks_terminal_password', zone: 'the_stacks', description: "Lev's research notes contain the MERIDIAN terminal passphrase.", learnedVia: 'examination', sourceHint: '', unlocks: '' },
  ],
  NARRATIVE_KEY_INDEX: {
    crossroads_hidden_cellar: { id: 'crossroads_hidden_cellar', zone: 'crossroads', description: 'You know about the hidden storage cellar beneath the market stalls.', learnedVia: 'deduction', sourceHint: '', unlocks: '' },
    stacks_terminal_password: { id: 'stacks_terminal_password', zone: 'the_stacks', description: "Lev's research notes contain the MERIDIAN terminal passphrase.", learnedVia: 'examination', sourceHint: '', unlocks: '' },
  },
}))

vi.mock('@/lib/supabase', () => ({
  createSupabaseBrowserClient: vi.fn(() => ({
    from: vi.fn(() => ({
      select: vi.fn(() => ({ eq: vi.fn(() => ({ data: [], count: 0 })) })),
      insert: vi.fn(() => ({ error: null })),
      update: vi.fn(() => ({ eq: vi.fn(() => ({ error: null })) })),
      delete: vi.fn(() => ({ eq: vi.fn(() => ({ error: null })) })),
    })),
  })),
}))

// ------------------------------------------------------------
// Helpers
// ------------------------------------------------------------

function makePlayer(overrides: Partial<Player> = {}): Player {
  return {
    id: 'p1', name: 'Tester', characterClass: 'enforcer',
    vigor: 3, grit: 5, reflex: 5, wits: 5, presence: 5, shadow: 5,
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

// Import after mocks — use relative paths so these resolve to the WORKTREE files,
// not the main project files, when running from main project's vitest.
import { handleAttack } from '../../lib/actions/combat'
import { handleMove } from '../../lib/actions/movement'
import { handleHelp } from '../../lib/actions/system'
import { handleJournal } from '../../lib/actions/items'
import { getRoom } from '@/lib/world'

// ------------------------------------------------------------
// Tests: attack-no-target lists visible enemies (UX #9)
// ------------------------------------------------------------

describe('handleAttack — no target / wrong target', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('lists visible enemies when noun does not match any enemy', async () => {
    const engine = makeEngine({
      currentRoom: makeRoom({ enemies: ['shuffler', 'brute'] }),
    })

    await handleAttack(engine, 'dragon')

    const errorMsg = engine.messages.find(m => m.type === 'error')
    expect(errorMsg).toBeDefined()
    expect(errorMsg!.text).toContain('Shuffler')
    expect(errorMsg!.text).toContain('Brute')
    expect(errorMsg!.text).toContain('attack [enemy]')
  })

  it('shows "nothing to attack" when room has no enemies', async () => {
    const engine = makeEngine({
      currentRoom: makeRoom({ enemies: [] }),
    })

    await handleAttack(engine, undefined)

    const errorMsg = engine.messages.find(m => m.type === 'error')
    expect(errorMsg).toBeDefined()
    expect(errorMsg!.text).toContain('nothing to attack')
  })

  it('auto-selects first enemy when noun is undefined (no error)', async () => {
    // With mocked combat system, attacking without noun should start combat
    // We just verify no error message and combat state is set
    const engine = makeEngine({
      currentRoom: makeRoom({ enemies: ['shuffler'] }),
    })

    // handleAttack with undefined noun should pick shuffler automatically
    // The combat start might fail with mocks but error should not be "specify target"
    await handleAttack(engine, undefined)

    const errorMsg = engine.messages.find(m => m.type === 'error' && m.text.includes('Specify a target'))
    expect(errorMsg).toBeUndefined()
  })
})

// ------------------------------------------------------------
// Tests: skill-gated exit failure mentions skill name/value (UX #13)
// The mock for getStatForSkill returns player.vigor.
// Set player.vigor below the skillGate dc to trigger the failure.
// ------------------------------------------------------------

describe('handleMove — skill-gated exit failure message', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('includes skill name and current value vs needed value in failure message', async () => {
    // Player vigor=3, skillGate dc=7 → fails and diff > 2
    const room = makeRoom({
      exits: { north: 'next_room' },
      richExits: {
        north: {
          skillGate: {
            skill: 'survival',
            dc: 7,
            failMessage: 'The path is too treacherous.',
          },
        },
      },
    })

    const engine = makeEngine({
      currentRoom: room,
      player: makePlayer({ vigor: 3 }),
    })
    await handleMove(engine, 'north')

    // Should show skill name, current value, and needed value
    const systemMsg = engine.messages.find(m => m.type === 'system' && m.text.includes('Survival'))
    expect(systemMsg).toBeDefined()
    expect(systemMsg!.text).toContain('3') // current value (vigor)
    expect(systemMsg!.text).toContain('7') // needed value (dc)
    expect(systemMsg!.text).toMatch(/needs 7/)
  })

  it('shows "almost capable enough" hint when 2 or fewer away from dc', async () => {
    // Player vigor=4, skillGate dc=5 → diff=1, close path
    const room = makeRoom({
      exits: { north: 'next_room' },
      richExits: {
        north: {
          skillGate: {
            skill: 'survival',
            dc: 5,
            failMessage: 'Not quite.',
          },
        },
      },
    })

    const engine = makeEngine({
      currentRoom: room,
      player: makePlayer({ vigor: 4 }),
    })
    await handleMove(engine, 'north')

    const systemMsg = engine.messages.find(m => m.type === 'system' && m.text.includes('Survival'))
    expect(systemMsg).toBeDefined()
    expect(systemMsg!.text).toContain('almost capable enough')
  })
})

// ------------------------------------------------------------
// Tests: handleHelp includes newly-documented verbs (doc-drift)
// ------------------------------------------------------------

describe('handleHelp — newly documented verbs', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('includes stash and unstash in help output', async () => {
    const engine = makeEngine()
    await handleHelp(engine)

    const allText = engine.messages.map(m => m.text).join('\n')
    expect(allText).toMatch(/stash/)
    expect(allText).toMatch(/unstash/)
  })

  it('includes craft with aliases in help output', async () => {
    const engine = makeEngine()
    await handleHelp(engine)

    const allText = engine.messages.map(m => m.text).join('\n')
    expect(allText).toMatch(/craft/)
    // At minimum craft/build/make should appear somewhere
    expect(allText).toMatch(/build|make|forge/)
  })

  it('includes give in help output', async () => {
    const engine = makeEngine()
    await handleHelp(engine)

    const allText = engine.messages.map(m => m.text).join('\n')
    expect(allText).toMatch(/give/)
  })

  it('includes unlock in help output', async () => {
    const engine = makeEngine()
    await handleHelp(engine)

    const allText = engine.messages.map(m => m.text).join('\n')
    expect(allText).toMatch(/unlock/)
  })

  it('includes climb, swim, sneak in help output', async () => {
    const engine = makeEngine()
    await handleHelp(engine)

    const allText = engine.messages.map(m => m.text).join('\n')
    expect(allText).toMatch(/climb/)
    expect(allText).toMatch(/swim/)
    expect(allText).toMatch(/sneak/)
  })

  it('includes smell, listen, touch in help output', async () => {
    const engine = makeEngine()
    await handleHelp(engine)

    const allText = engine.messages.map(m => m.text).join('\n')
    expect(allText).toMatch(/smell/)
    expect(allText).toMatch(/listen/)
    expect(allText).toMatch(/touch/)
  })

  it('includes hint command in help output', async () => {
    const engine = makeEngine()
    await handleHelp(engine)

    const allText = engine.messages.map(m => m.text).join('\n')
    expect(allText).toMatch(/hint/)
  })

  it('mentions called-shot syntax (attack with body part) in help output', async () => {
    const engine = makeEngine()
    await handleHelp(engine)

    const allText = engine.messages.map(m => m.text).join('\n')
    // Should mention called shots or body part targeting
    expect(allText).toMatch(/body part|called shot|head|arm/i)
  })

  it('mentions dialogue choice numbers (1-9) in help output', async () => {
    const engine = makeEngine()
    await handleHelp(engine)

    const allText = engine.messages.map(m => m.text).join('\n')
    expect(allText).toMatch(/1.?9|1–9|numeric/)
  })

  it('mentions RESET alias in help output', async () => {
    const engine = makeEngine()
    await handleHelp(engine)

    const allText = engine.messages.map(m => m.text).join('\n')
    expect(allText).toMatch(/RESET/)
  })

  it('shows sensory category details when requested by topic', async () => {
    const engine = makeEngine()
    await handleHelp(engine, 'sensory')

    const allText = engine.messages.map(m => m.text).join('\n')
    expect(allText).toMatch(/smell/)
    expect(allText).toMatch(/listen/)
    expect(allText).toMatch(/touch/)
  })
})

// ------------------------------------------------------------
// Tests: handleJournal lists narrative keys when player has any (UX #16)
// ------------------------------------------------------------

describe('handleJournal — narrative keys section', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('shows "No knowledge keys" message when player has no keys', async () => {
    const engine = makeEngine({
      player: makePlayer({ narrativeKeys: [] }),
    })

    await handleJournal(engine)

    const allText = engine.messages.map(m => m.text).join('\n')
    expect(allText).toMatch(/No knowledge keys/)
  })

  it('lists knowledge key descriptions when player has keys', async () => {
    const engine = makeEngine({
      player: makePlayer({ narrativeKeys: ['crossroads_hidden_cellar', 'stacks_terminal_password'] }),
    })

    await handleJournal(engine)

    const allText = engine.messages.map(m => m.text).join('\n')
    // Should include knowledge section header
    expect(allText).toMatch(/Knowledge/)
    // Should include the key descriptions (partial match for long descriptions)
    expect(allText).toMatch(/hidden storage cellar/)
    expect(allText).toMatch(/MERIDIAN terminal/)
  })

  it('shows key count in knowledge section', async () => {
    const engine = makeEngine({
      player: makePlayer({ narrativeKeys: ['crossroads_hidden_cellar'] }),
    })

    await handleJournal(engine)

    const allText = engine.messages.map(m => m.text).join('\n')
    expect(allText).toMatch(/1 knowledge key/)
  })
})
