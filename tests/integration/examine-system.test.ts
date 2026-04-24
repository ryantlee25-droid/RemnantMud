// ============================================================
// Integration tests for lib/actions/examine.ts and system.ts
// ============================================================

import { describe, it, expect, vi, beforeEach } from 'vitest'
import type { GameState, Player, Room, InventoryItem, GameMessage, Item } from '@/types/game'
import type { EngineCore } from '@/lib/actions/types'

// ------------------------------------------------------------
// Supabase mock (must come first)
// ------------------------------------------------------------

vi.mock('@/lib/supabase', () => ({
  createSupabaseBrowserClient: vi.fn(),
}))

// ------------------------------------------------------------
// Module mocks for examine.ts and movement.ts deps
// ------------------------------------------------------------

vi.mock('@/lib/spawn', () => ({
  weightedRoll: vi.fn((pool: { desc?: string; sound?: string }[]) => pool[0]),
}))

vi.mock('@/lib/skillBonus', () => ({
  getStatForSkill: vi.fn(() => null), // no skill check by default
}))

vi.mock('@/lib/gameEngine', () => ({
  getTimeOfDay: vi.fn(() => 'day' as const),
  xpForNextLevel: vi.fn(() => 100),
}))

vi.mock('@/lib/world', () => ({
  getRoom: vi.fn(),
  canMove: vi.fn(),
  markVisited: vi.fn(),
  getExits: vi.fn(() => [{ direction: 'north', roomId: 'room_2' }]),
}))

vi.mock('@/data/enemies', () => ({
  getEnemy: vi.fn((id: string) => id === 'raider' ? { id: 'raider', name: 'Raider', description: 'A hostile raider.', maxHp: 20 } : undefined),
}))

vi.mock('@/data/npcs', () => ({
  getNPC: vi.fn((id: string) => id === 'trader' ? { id: 'trader', name: 'Trader', description: 'A wandering trader.', faction: 'neutral' } : undefined),
}))

vi.mock('@/data/items', () => ({
  getItem: vi.fn((id: string) => {
    const items: Record<string, Item> = {
      medkit: { id: 'medkit', name: 'Medkit', description: 'Heals wounds.', type: 'consumable', weight: 1, value: 10 },
      knife: { id: 'knife', name: 'Knife', description: 'A sharp blade.', type: 'weapon', weight: 1, value: 5, damage: 4 },
    }
    return items[id]
  }),
}))

vi.mock('@/lib/inventory', () => ({
  groupAndFormatItems: vi.fn(() => ''),
}))

vi.mock('@/lib/richText', () => ({
  rt: {
    item: (s: string) => s,
    keyword: (s: string) => s,
    enemy: (s: string) => s,
    npc: (s: string) => s,
    trait: (s: string) => s,
    exit: (s: string) => s,
  },
}))

vi.mock('@/lib/messages', () => ({
  msg: vi.fn((text: string, type?: string) => ({ text, type: type ?? 'narrative' })),
  systemMsg: vi.fn((text: string) => ({ text, type: 'system' })),
  errorMsg: vi.fn((text: string) => ({ text, type: 'error' })),
  combatMsg: vi.fn((text: string) => ({ text, type: 'combat' })),
}))

vi.mock('@/lib/fear', () => ({ fearCheck: vi.fn(() => null) }))
vi.mock('@/lib/echoes', () => ({ getDeathRoomNarration: vi.fn(() => null) }))
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
    hp: 18, maxHp: 18, currentRoomId: 'room_1', worldSeed: 1,
    xp: 50, level: 2, actionsTaken: 10, isDead: false, cycle: 1, totalDeaths: 0,
    questFlags: {},
    ...overrides,
  }
}

function makeRoom(overrides: Partial<Room> = {}): Room {
  return {
    id: 'room_1', name: 'Test Room', description: 'A dusty room.',
    shortDescription: 'Dusty.', zone: 'crossroads', difficulty: 1,
    visited: false, flags: {}, exits: { north: 'room_2' }, items: [], enemies: [], npcs: [],
    ...overrides,
  }
}

function makeInvItem(item: Item, equipped = false, quantity = 1): InventoryItem {
  return { id: `inv_${item.id}`, playerId: 'p1', itemId: item.id, item, quantity, equipped }
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
    adjustReputation: vi.fn().mockResolvedValue(undefined),
    setQuestFlag: vi.fn().mockResolvedValue(undefined),
  }
}

// ------------------------------------------------------------
// Import handlers after mocks
// ------------------------------------------------------------

import { handleExamineExtra, handleSmell } from '@/lib/actions/examine'
import { handleLook } from '@/lib/actions/movement'
import { handleHelp, handleStats, handleInventory, handleEquipment, handleHint, handleRestart, handleBoost } from '@/lib/actions/system'

// ------------------------------------------------------------
// examine.ts tests
// ------------------------------------------------------------

describe('handleExamineExtra', () => {
  beforeEach(() => vi.clearAllMocks())

  it('shows room description when no keyword given', async () => {
    const engine = makeEngine({ currentRoom: makeRoom({ description: 'A dusty room.' }) })
    await handleExamineExtra(engine)
    expect(engine.messages[0]!.text).toBe('A dusty room.')
  })

  it('returns generic look when keyword matches no room extra', async () => {
    // With no extras and keyword "door", falls through to handleLook which calls getEnemy/getItem/getNPC
    const engine = makeEngine({ currentRoom: makeRoom() })
    await handleExamineExtra(engine, 'door')
    // handleLook is called and emits "You don't see that here."
    expect(engine.messages.some(m => m.text.includes("don't see"))).toBe(true)
  })

  it('shows extra description when keyword matches a room extra', async () => {
    const room = makeRoom({
      extras: [{
        keywords: ['console', 'terminal'],
        description: 'A cracked control console, dead for decades.',
      }] as Room['extras'],
    })
    const engine = makeEngine({ currentRoom: room })
    await handleExamineExtra(engine, 'console')
    expect(engine.messages[0]!.text).toContain('cracked control console')
  })

  it('blocks charon_choice examine if flag already set', async () => {
    const room = makeRoom({
      extras: [{
        keywords: ['ferry'],
        description: 'The ferry waits.',
        questFlagOnSuccess: [{ flag: 'charon_choice', value: true }],
      }] as Room['extras'],
    })
    const engine = makeEngine({
      currentRoom: room,
      player: makePlayer({ questFlags: { charon_choice: true } }),
    })
    await handleExamineExtra(engine, 'ferry')
    expect(engine.messages[0]!.text).toContain('no going back')
  })

  it('gates extra behind cycleGate when cycle is too low', async () => {
    const room = makeRoom({
      extras: [{
        keywords: ['inscription'],
        description: 'Ancient writing.',
        cycleGate: 3,
      }] as Room['extras'],
    })
    const engine = makeEngine({ currentRoom: room, player: makePlayer({ cycle: 1 }) })
    await handleExamineExtra(engine, 'inscription')
    expect(engine.messages[0]!.text).toContain("can't make sense")
  })

  it('gates extra behind questGate when flag is missing', async () => {
    const room = makeRoom({
      extras: [{
        keywords: ['map'],
        description: 'A detailed map.',
        questGate: 'found_archive',
      }] as Room['extras'],
    })
    const engine = makeEngine({ currentRoom: room, player: makePlayer({ questFlags: {} }) })
    await handleExamineExtra(engine, 'map')
    expect(engine.messages[0]!.text).toContain("don't have enough context")
  })

  it('sets quest flag on examine with no skill check', async () => {
    const room = makeRoom({
      extras: [{
        keywords: ['altar'],
        description: 'A stone altar.',
        questFlagOnSuccess: [{ flag: 'saw_altar', value: true }],
      }] as Room['extras'],
    })
    const engine = makeEngine({ currentRoom: room })
    await handleExamineExtra(engine, 'altar')
    expect(engine.setQuestFlag).toHaveBeenCalledWith('saw_altar', true)
  })
})

describe('handleLook', () => {
  beforeEach(() => vi.clearAllMocks())

  it('shows room description, exits, and NPC when looking with no target', async () => {
    const room = makeRoom({ npcs: ['trader'] })
    const engine = makeEngine({ currentRoom: room })
    await handleLook(engine, undefined)
    const text = engine.messages.map(m => m.text).join(' ')
    expect(text).toContain('dusty') // room description
    expect(text).toContain('north') // exit
    expect(text).toContain('Trader') // NPC
  })

  it('examines an item from player inventory by name', async () => {
    const knife: Item = { id: 'knife', name: 'Knife', description: 'A sharp blade.', type: 'weapon', weight: 1, value: 5, damage: 4 }
    const engine = makeEngine({ inventory: [makeInvItem(knife)] })
    await handleLook(engine, 'knife')
    expect(engine.messages[0]!.text).toContain('Knife')
    expect(engine.messages[0]!.text).toContain('sharp blade')
  })

  it('examines an NPC in the room by name', async () => {
    const engine = makeEngine({ currentRoom: makeRoom({ npcs: ['trader'] }) })
    await handleLook(engine, 'trader')
    expect(engine.messages[0]!.text).toContain('Trader')
    expect(engine.messages[0]!.text).toContain('wandering trader')
  })

  it('examines an enemy in the room by name', async () => {
    const engine = makeEngine({ currentRoom: makeRoom({ enemies: ['raider'] }) })
    await handleLook(engine, 'raider')
    expect(engine.messages[0]!.text).toContain('Raider')
    expect(engine.messages[0]!.text).toContain('hostile raider')
  })

  it('shows error for unknown target', async () => {
    const engine = makeEngine()
    await handleLook(engine, 'dragon')
    expect(engine.messages[0]!.type).toBe('error')
    expect(engine.messages[0]!.text).toContain("don't see")
  })
})

describe('handleSmell', () => {
  beforeEach(() => vi.clearAllMocks())

  it('returns zone atmosphere when no target given', async () => {
    const engine = makeEngine({ currentRoom: makeRoom({ zone: 'the_ember' }) })
    await handleSmell(engine, '')
    expect(engine.messages[0]!.text).toContain('Ash')
  })
})

// ------------------------------------------------------------
// system.ts tests
// ------------------------------------------------------------

describe('handleHelp', () => {
  beforeEach(() => vi.clearAllMocks())

  it('shows full command list with no argument', async () => {
    const engine = makeEngine()
    await handleHelp(engine)
    const text = engine.messages.map(m => m.text).join('\n')
    expect(text).toContain('COMMANDS')
    expect(text).toContain('north')
    expect(text).toContain('attack')
  })

  it('shows category-specific help for a valid topic', async () => {
    const engine = makeEngine()
    await handleHelp(engine, 'combat')
    const text = engine.messages.map(m => m.text).join('\n')
    expect(text).toContain('attack')
    expect(text).toContain('flee')
    // Should NOT include the full COMMANDS banner
    expect(text).not.toContain('COMMANDS')
  })

  it('falls back to full list for unknown topic with a note', async () => {
    const engine = makeEngine()
    await handleHelp(engine, 'dragons')
    const text = engine.messages.map(m => m.text).join('\n')
    expect(text).toContain("Unknown help topic 'dragons'")
    expect(text).toContain('COMMANDS')
  })
})

describe('handleStats', () => {
  beforeEach(() => vi.clearAllMocks())

  it('shows player name, class, level and stats', async () => {
    const engine = makeEngine()
    await handleStats(engine)
    const text = engine.messages.map(m => m.text).join('\n')
    expect(text).toContain('Tester')
    expect(text).toContain('Level')
    expect(text).toContain('VIG')
  })

  it('shows stat increase reminder when pendingStatIncrease is true', async () => {
    const engine = makeEngine({ pendingStatIncrease: true })
    await handleStats(engine)
    const text = engine.messages.map(m => m.text).join('\n')
    expect(text).toContain('STAT INCREASE AVAILABLE')
  })

  it('shows revenant marks when cycle >= 2', async () => {
    const engine = makeEngine({ player: makePlayer({ cycle: 2 }) })
    await handleStats(engine)
    const text = engine.messages.map(m => m.text).join('\n')
    expect(text).toContain('Revenant marks')
  })
})

describe('handleInventory', () => {
  beforeEach(() => vi.clearAllMocks())

  it('shows "carrying nothing" when inventory is empty', async () => {
    const engine = makeEngine()
    await handleInventory(engine)
    const text = engine.messages.map(m => m.text).join('\n')
    expect(text).toContain('carrying nothing')
  })

  it('lists items with quantities', async () => {
    const medkit: Item = { id: 'medkit', name: 'Medkit', description: 'Heals wounds.', type: 'consumable', weight: 1, value: 10 }
    const invItem = makeInvItem(medkit, false, 3)
    const engine = makeEngine({ inventory: [invItem] })
    await handleInventory(engine)
    const text = engine.messages.map(m => m.text).join('\n')
    expect(text).toContain('Medkit')
    expect(text).toContain('x3')
  })

  it('marks equipped items with [eq]', async () => {
    const knife: Item = { id: 'knife', name: 'Knife', description: 'A sharp blade.', type: 'weapon', weight: 1, value: 5, damage: 4 }
    const engine = makeEngine({ inventory: [makeInvItem(knife, true)] })
    await handleInventory(engine)
    const text = engine.messages.map(m => m.text).join('\n')
    expect(text).toContain('[eq]')
  })
})

describe('handleEquipment', () => {
  beforeEach(() => vi.clearAllMocks())

  it('shows "nothing equipped" when no items are equipped', async () => {
    const engine = makeEngine()
    await handleEquipment(engine)
    expect(engine.messages[0]!.text).toContain('nothing equipped')
  })

  it('shows equipped weapon details', async () => {
    const knife: Item = { id: 'knife', name: 'Knife', description: 'A sharp blade.', type: 'weapon', weight: 1, value: 5, damage: 4 }
    const engine = makeEngine({ inventory: [makeInvItem(knife, true)] })
    await handleEquipment(engine)
    const text = engine.messages.map(m => m.text).join('\n')
    expect(text).toContain('Knife')
    expect(text).toContain('DMG')
  })
})

describe('handleHint', () => {
  beforeEach(() => vi.clearAllMocks())

  it('suggests exploring when no active quests', async () => {
    const engine = makeEngine()
    await handleHint(engine)
    expect(engine.messages[0]!.text).toContain('exploring')
  })

  it('provides quest hint when active quest has a hint', async () => {
    const { getQuestEntries } = await import('@/data/questDescriptions')
    vi.mocked(getQuestEntries).mockReturnValueOnce({
      active: [{ flag: 'q1', title: 'Test Quest', description: 'Do the thing.', hint: 'Go north to find the courier.', category: 'main' }],
      completed: [],
    })
    const engine = makeEngine({ player: makePlayer({ questFlags: { q1: true } }) })
    await handleHint(engine)
    expect(engine.messages[0]!.text).toContain('Go north to find the courier')
  })
})

describe('handleRestart', () => {
  it('returns warning messages without requiring an engine', () => {
    const messages = handleRestart()
    const text = messages.map(m => m.text).join('\n')
    expect(text).toContain('PERMANENT ACTION')
    expect(text).toContain('CONFIRM RESTART')
    expect(text).toContain('delete your entire save')
  })
})

describe('handleBoost', () => {
  beforeEach(() => vi.clearAllMocks())

  it('shows error when no pending stat increase', async () => {
    const engine = makeEngine({ pendingStatIncrease: false })
    await handleBoost(engine, 'vigor')
    expect(engine.messages[0]!.text).toContain('do not have a stat increase')
  })

  it('shows available stat options when no noun provided', async () => {
    const engine = makeEngine({ pendingStatIncrease: true })
    await handleBoost(engine, undefined)
    const text = engine.messages.map(m => m.text).join('\n')
    expect(text).toContain('vigor')
    expect(text).toContain('presence')
  })

  it('increases the chosen stat and clears pending flag', async () => {
    const engine = makeEngine({ pendingStatIncrease: true, player: makePlayer({ grit: 5 }) })
    await handleBoost(engine, 'grit')
    expect(engine.state.player!.grit).toBe(6)
    expect(engine.state.pendingStatIncrease).toBe(false)
    const text = engine.messages.map(m => m.text).join('\n')
    expect(text).toContain('+1 grit')
  })

  it('also increases maxHp when boosting vigor', async () => {
    const engine = makeEngine({ pendingStatIncrease: true, player: makePlayer({ vigor: 5, maxHp: 18, hp: 18 }) })
    await handleBoost(engine, 'vigor')
    expect(engine.state.player!.maxHp).toBe(20)
    expect(engine.state.player!.vigor).toBe(6)
  })

  it('rejects an invalid stat name', async () => {
    const engine = makeEngine({ pendingStatIncrease: true })
    await handleBoost(engine, 'speed')
    const text = engine.messages.map(m => m.text).join('\n')
    expect(text).toContain("'speed' is not a valid stat")
  })
})
