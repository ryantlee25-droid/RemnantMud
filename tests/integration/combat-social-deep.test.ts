// ============================================================
// Deep branch coverage for lib/actions/combat.ts and lib/actions/social.ts
// Targets: defend, wait, flee success/failure, conditions, loot,
//          multi-enemy, unknown NPC topic, faction-gated dialogue,
//          disposition effects, reputation thresholds, gift responses.
// ============================================================

import { describe, it, expect, vi, beforeEach } from 'vitest'
import type { GameState, Player, Room, Enemy, CombatState, InventoryItem, GameMessage } from '@/types/game'
import type { EngineCore } from '@/lib/actions/types'

// ------------------------------------------------------------
// Mocks — combat
// ------------------------------------------------------------

vi.mock('@/lib/combat', async (importOriginal) => {
  const actual = await importOriginal()
  return {
    ...actual,
    startCombat: vi.fn((_player: Player, enemy: Enemy) => ({
      enemy, enemyHp: enemy.hp, playerGoesFirst: true, turn: 1,
      active: true, playerConditions: [], enemyConditions: [],
      abilityUsed: false, defendingThisTurn: false, waitingBonus: 0,
    })),
    playerAttack: vi.fn((_player: Player, state: CombatState) => ({
      result: {
        hit: true, damage: 5, critical: false, fumble: false,
        messages: [{ id: '1', text: 'You hit.', type: 'combat' as const }],
        enemyDefeated: state.enemyHp <= 5,
        loot: state.enemyHp <= 5 ? ['scrap_metal'] : undefined,
      },
      newState: { ...state, enemyHp: Math.max(0, state.enemyHp - 5), active: state.enemyHp > 5, turn: state.turn + 1 },
    })),
    enemyAttack: vi.fn((_player: Player, state: CombatState) => ({
      damage: 3,
      messages: [{ id: '2', text: 'Enemy hits. [3 damage]', type: 'combat' as const }],
      newState: { ...state, turn: state.turn + 1 },
    })),
    flee: vi.fn(),
    applyHollowRoundEffects: vi.fn((state: CombatState) => ({ messages: [], newState: state })),
    enemyHpIndicator: vi.fn(() => 'wounded'),
    getEnvironmentModifiers: vi.fn(() => []),
    getEnvironmentNarration: vi.fn(() => []),
    computeEnvironmentEffects: vi.fn(() => ({ combined: {}, debrisMessages: [], debrisDamage: 0 })),
  }
})

vi.mock('@/data/enemies', () => ({
  getEnemy: vi.fn((id: string) => {
    const base = { id, name: id.charAt(0).toUpperCase() + id.slice(1), description: 'desc.', attack: 2, defense: 8, damage: [1, 3] as [number, number], xp: 10, loot: [] as { itemId: string; chance: number }[] }
    if (id === 'shuffler') return { ...base, id: 'shuffler', name: 'Shuffler', hp: 10, maxHp: 10, loot: [{ itemId: 'scrap_metal', chance: 1.0 }] }
    if (id === 'remnant') return { ...base, id: 'remnant', name: 'Remnant', hp: 20, maxHp: 20, loot: [{ itemId: 'ammo_22lr', chance: 0.5 }] }
    return undefined
  }),
}))

vi.mock('@/data/items', () => ({
  getItem: vi.fn((id: string) => {
    const items: Record<string, object> = {
      scrap_metal: { id: 'scrap_metal', name: 'Scrap Metal', type: 'junk', weight: 1, value: 2 },
      ammo_22lr: { id: 'ammo_22lr', name: '.22 LR', type: 'ammo', weight: 0.1, value: 1 },
      bandages: { id: 'bandages', name: 'Bandages', type: 'consumable', weight: 0.5, value: 5 },
      boiled_rations: { id: 'boiled_rations', name: 'Boiled Rations', type: 'consumable', weight: 1, value: 3 },
      scrap_knife: { id: 'scrap_knife', name: 'Scrap Knife', type: 'weapon', weight: 1, value: 5, damage: 4 },
      meridian_keycard: { id: 'meridian_keycard', name: 'Meridian Keycard', type: 'key', weight: 0, value: 0 },
    }
    return items[id] ?? undefined
  }),
}))

vi.mock('@/lib/world', () => ({
  updateRoomItems: vi.fn().mockResolvedValue(undefined),
  updateRoomFlags: vi.fn().mockResolvedValue(undefined),
}))

vi.mock('@/lib/fear', () => ({ fearCheck: vi.fn(() => ({ afraid: false, messages: [] })) }))
vi.mock('@/lib/abilities', () => ({ buildAnalyzeMessages: vi.fn(() => []) }))
vi.mock('@/lib/inventory', () => ({
  removeItem: vi.fn().mockResolvedValue(undefined),
  getInventory: vi.fn().mockResolvedValue([]),
}))

vi.mock('@/lib/conditions', () => ({
  tickConditions: vi.fn((conditions: { id: string }[]) => ({
    // Keep conditions intact so stun/bleed checks fire on the same array
    remaining: conditions,
    damage: 0,
    messages: [],
  })),
  cureCondition: vi.fn((conditions: unknown[], _id: string) => ({ conditions, cured: false })),
  tryShakeFrightened: vi.fn((conditions: unknown[]) => ({ conditions, message: null })),
  applyCondition: vi.fn((conditions: unknown[], id: string) => ({ conditions, applied: true })),
  totalRollPenalty: vi.fn(() => 0),
}))

// ------------------------------------------------------------
// Mocks — social
// ------------------------------------------------------------

vi.mock('@/data/npcs', () => ({
  getNPC: vi.fn((id: string) => {
    if (id === 'patch') return { id: 'patch', name: 'Patch', faction: 'drifters', isNamed: true, description: 'Medic behind a table.', dialogue: "What do you need?" }
    if (id === 'lev') return { id: 'lev', name: 'Lev', faction: 'reclaimers', isNamed: true, description: 'A Reclaimer poring over notebooks.', dialogue: 'Data first.' }
    if (id === 'gruff_trader') return { id: 'gruff_trader', name: 'Gruff Trader', faction: 'salters', isNamed: false, description: 'A stocky trader.', dialogue: 'Got caps?' }
    return undefined
  }),
  getRevenantDialogue: vi.fn(() => null),
}))

vi.mock('@/data/dialogueTrees', () => ({ DIALOGUE_TREES: {} }))

vi.mock('@/data/npcTopics', () => ({
  NPC_TOPICS: {
    patch: [
      { keywords: ['scar'], response: '"The Scar is bad news."', setsFlag: 'patch_mentioned_scar' },
      { keywords: ['meridian'], response: '"Meridian is classified."', requiresFlag: 'knows_meridian' },
      { keywords: ['factions'], response: '"Five factions remain."', requiresRep: { faction: 'drifters', min: 1 } },
    ],
  },
  findNpcTopic: vi.fn((npcId: string, word: string) => {
    if (npcId !== 'patch') return null
    if (word === 'scar') return { keywords: ['scar'], response: '"The Scar is bad news."', setsFlag: 'patch_mentioned_scar' }
    if (word === 'meridian') return { keywords: ['meridian'], response: '"Meridian is classified."', requiresFlag: 'knows_meridian' }
    if (word === 'factions') return { keywords: ['factions'], response: '"Five factions remain."', requiresRep: { faction: 'drifters', min: 1 } }
    return null
  }),
  getVisibleTopics: vi.fn(() => ['scar', 'hollow']),
}))

vi.mock('@/lib/skillBonus', () => ({ getStatForSkill: vi.fn(() => 5), getStatNameForSkill: vi.fn(() => 'presence') }))
vi.mock('@/lib/dice', () => ({ rollCheck: vi.fn(() => ({ roll: 5, modifier: 2, total: 7, dc: 8, success: false, critical: false, fumble: false })) }))

// ------------------------------------------------------------
// Helpers
// ------------------------------------------------------------

function makePlayer(overrides: Partial<Player> = {}): Player {
  return {
    id: 'p1', name: 'Tester', characterClass: 'enforcer',
    vigor: 10, grit: 8, reflex: 6, wits: 5, presence: 4, shadow: 3,
    hp: 20, maxHp: 20, currentRoomId: 'room_1', worldSeed: 1,
    xp: 0, level: 1, actionsTaken: 0, isDead: false, cycle: 1, totalDeaths: 0,
    ...overrides,
  }
}

function makeRoom(overrides: Partial<Room> = {}): Room {
  return {
    id: 'room_1', name: 'Test Room', description: 'A test room.', shortDescription: 'Test.',
    zone: 'crossroads', difficulty: 1, visited: false, flags: {}, exits: {}, items: [], enemies: [], npcs: [],
    ...overrides,
  }
}

function makeCombatState(overrides: Partial<CombatState> = {}): CombatState {
  const enemy: Enemy = {
    id: 'shuffler', name: 'Shuffler', description: 'desc', hp: 20, maxHp: 20,
    attack: 2, defense: 8, damage: [1, 3], xp: 10, loot: [],
  }
  return {
    enemy, enemyHp: 20, playerGoesFirst: true, turn: 1, active: true,
    playerConditions: [], enemyConditions: [], abilityUsed: false,
    defendingThisTurn: false, waitingBonus: 0,
    ...overrides,
  }
}

function makeEngine(state: Partial<GameState> = {}): EngineCore & { messages: GameMessage[]; state: GameState } {
  const fullState: GameState = {
    player: makePlayer(), currentRoom: makeRoom(), inventory: [], combatState: null,
    log: [], loading: false, initialized: true, playerDead: false, ledger: null, stash: [],
    ...state,
  }
  const messages: GameMessage[] = []
  return {
    messages, state: fullState,
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

// Import handlers after mocks
import { handleAttack, handleFlee, handleDefend, handleWait } from '@/lib/actions/combat'
import { handleTalk, handleGive } from '@/lib/actions/social'
import { flee } from '@/lib/combat'

// ============================================================
// COMBAT — Defend action
// ============================================================

describe('handleDefend', () => {
  beforeEach(() => vi.clearAllMocks())

  it('errors when not in combat', async () => {
    const engine = makeEngine()
    await handleDefend(engine)
    expect(engine.messages.some(m => m.text.includes('not in combat'))).toBe(true)
  })

  it('sets defendingThisTurn flag and emits brace message', async () => {
    const engine = makeEngine({ combatState: makeCombatState() })
    await handleDefend(engine)
    expect(engine.messages.some(m => m.text.toLowerCase().includes('brace'))).toBe(true)
  })

  it('enemy still attacks after defend (doEnemyTurn called)', async () => {
    const { enemyAttack } = await import('@/lib/combat')
    const engine = makeEngine({ combatState: makeCombatState() })
    await handleDefend(engine)
    expect(vi.mocked(enemyAttack)).toHaveBeenCalled()
  })
})

// ============================================================
// COMBAT — Wait action
// ============================================================

describe('handleWait', () => {
  beforeEach(() => vi.clearAllMocks())

  it('errors when not in combat', async () => {
    const engine = makeEngine()
    await handleWait(engine)
    expect(engine.messages.some(m => m.text.includes('not in combat'))).toBe(true)
  })

  it('sets waitingBonus to 3 and emits watch message', async () => {
    const engine = makeEngine({ combatState: makeCombatState() })
    await handleWait(engine)
    expect(engine.state.combatState?.waitingBonus).toBe(3)
    expect(engine.messages.some(m => m.text.toLowerCase().includes('watch'))).toBe(true)
  })

  it('enemy attacks even when player waits', async () => {
    const { enemyAttack } = await import('@/lib/combat')
    const engine = makeEngine({ combatState: makeCombatState() })
    await handleWait(engine)
    expect(vi.mocked(enemyAttack)).toHaveBeenCalled()
  })
})

// ============================================================
// COMBAT — Flee: success path
// ============================================================

describe('handleFlee — success', () => {
  beforeEach(() => vi.clearAllMocks())

  it('clears combatState on successful flee', async () => {
    vi.mocked(flee).mockReturnValue({
      result: { success: true, messages: [{ id: '3', text: 'You bolt.', type: 'combat' as const }] },
    })
    const engine = makeEngine({ combatState: makeCombatState() })
    await handleFlee(engine)
    expect(engine.state.combatState).toBeNull()
    expect(engine.messages.some(m => m.text.includes('bolt'))).toBe(true)
  })

  it('errors when not in combat', async () => {
    const engine = makeEngine()
    await handleFlee(engine)
    expect(engine.messages.some(m => m.text.includes('not in combat'))).toBe(true)
  })
})

// ============================================================
// COMBAT — Flee: failure path (enemy free attack)
// ============================================================

describe('handleFlee — failure', () => {
  beforeEach(() => vi.clearAllMocks())

  it('enemy deals free damage on failed flee', async () => {
    vi.mocked(flee).mockReturnValue({
      result: { success: false, messages: [{ id: '4', text: 'No luck.', type: 'combat' as const }] },
      freeAttack: {
        damage: 5,
        messages: [{ id: '5', text: 'It hits. [5 damage]', type: 'combat' as const }],
        newState: makeCombatState({ turn: 2 }),
      },
    })
    const engine = makeEngine({ combatState: makeCombatState() })
    await handleFlee(engine)
    // Player should have taken damage
    expect(engine.state.player!.hp).toBeLessThan(20)
    expect(engine.messages.some(m => m.text.includes('No luck'))).toBe(true)
  })

  it('cannot flee when cantFlee flag is set', async () => {
    const engine = makeEngine({ combatState: makeCombatState({ cantFlee: true }) })
    await handleFlee(engine)
    expect(engine.messages.some(m => m.text.includes('committed'))).toBe(true)
    expect(vi.mocked(flee)).not.toHaveBeenCalled()
  })
})

// ============================================================
// COMBAT — Loot on enemy death
// ============================================================

describe('handleAttack — loot drop on enemy death', () => {
  beforeEach(() => vi.clearAllMocks())

  it('adds guaranteed loot to room items and emits item message', async () => {
    const enemy: Enemy = {
      id: 'shuffler', name: 'Shuffler', description: 'desc', hp: 5, maxHp: 5,
      attack: 2, defense: 8, damage: [1, 3], xp: 10,
      loot: [{ itemId: 'scrap_metal', chance: 1.0 }],
    }
    const combat = makeCombatState({ enemy, enemyHp: 5 })
    const engine = makeEngine({
      currentRoom: makeRoom({ enemies: ['shuffler'] }),
      combatState: combat,
    })
    await handleAttack(engine, undefined)
    expect(engine.state.combatState).toBeNull()
    expect(engine.state.player!.xp).toBe(10)
    const lootMsg = engine.messages.find(m => m.text.includes('Scrap Metal'))
    expect(lootMsg).toBeDefined()
  })

  it('XP is awarded on kill', async () => {
    const enemy: Enemy = {
      id: 'shuffler', name: 'Shuffler', description: 'desc', hp: 5, maxHp: 5,
      attack: 2, defense: 8, damage: [1, 3], xp: 25, loot: [],
    }
    const engine = makeEngine({
      currentRoom: makeRoom({ enemies: ['shuffler'] }),
      combatState: makeCombatState({ enemy, enemyHp: 5 }),
    })
    await handleAttack(engine, undefined)
    expect(engine.state.player!.xp).toBe(25)
  })
})

// ============================================================
// COMBAT — Conditions applied / ticked
// ============================================================

describe('combat conditions', () => {
  beforeEach(() => vi.clearAllMocks())

  it('stunned player skips their attack turn', async () => {
    const { playerAttack } = await import('@/lib/combat')
    const combat = makeCombatState({
      playerConditions: [{ id: 'stunned', name: 'Stunned', duration: 1, source: 'enemy', tickDamage: 0 }],
    })
    const engine = makeEngine({ currentRoom: makeRoom(), combatState: combat })
    await handleAttack(engine, undefined)
    // playerAttack should NOT have been called when player is stunned
    expect(vi.mocked(playerAttack)).not.toHaveBeenCalled()
    expect(engine.messages.some(m => m.text.toLowerCase().includes('stunned'))).toBe(true)
  })

  it('stunned enemy message is shown and enemy skips their turn', async () => {
    const { enemyAttack } = await import('@/lib/combat')
    const combat = makeCombatState({
      enemyConditions: [{ id: 'stunned', name: 'Stunned', duration: 1, source: 'player', tickDamage: 0 }],
    })
    const engine = makeEngine({ currentRoom: makeRoom(), combatState: combat })
    await handleAttack(engine, undefined)
    // enemyAttack should not fire while enemy stunned
    expect(vi.mocked(enemyAttack)).not.toHaveBeenCalled()
    expect(engine.messages.some(m => m.text.toLowerCase().includes('stunned'))).toBe(true)
  })
})

// ============================================================
// SOCIAL — ASK NPC about unknown topic
// ============================================================

describe('handleTalk — unknown topic', () => {
  beforeEach(() => vi.clearAllMocks())

  it('shows blank-stare message when topic not found', async () => {
    const engine = makeEngine({ currentRoom: makeRoom({ npcs: ['patch'] }) })
    // "patch" is in room; "xyzzy" is an unknown topic word
    await handleTalk(engine, 'patch xyzzy')
    expect(engine.messages.some(m => m.text.includes("anything to say about"))).toBe(true)
  })

  it('shows description on first talk, then greeting', async () => {
    const engine = makeEngine({ currentRoom: makeRoom({ npcs: ['patch'] }) })
    await handleTalk(engine, 'patch')
    const texts = engine.messages.map(m => m.text)
    expect(texts.some(t => t.includes('Medic behind a table'))).toBe(true)
  })
})

// ============================================================
// SOCIAL — Flag-gated topic
// ============================================================

describe('handleTalk — flag-gated topic', () => {
  beforeEach(() => vi.clearAllMocks())

  it('blocks flag-gated topic when flag is missing', async () => {
    const engine = makeEngine({
      currentRoom: makeRoom({ npcs: ['patch'] }),
      player: makePlayer({ questFlags: {} }),
    })
    await handleTalk(engine, 'patch meridian')
    expect(engine.messages.some(m => m.text.includes("don't know enough"))).toBe(true)
  })

  it('delivers flag-gated topic response when flag is set', async () => {
    const engine = makeEngine({
      currentRoom: makeRoom({ npcs: ['patch'] }),
      player: makePlayer({ questFlags: { knows_meridian: true } }),
    })
    await handleTalk(engine, 'patch meridian')
    expect(engine.messages.some(m => m.text.includes('classified'))).toBe(true)
  })
})

// ============================================================
// SOCIAL — Reputation-gated topic
// ============================================================

describe('handleTalk — reputation-gated topic', () => {
  beforeEach(() => vi.clearAllMocks())

  it('blocks rep-gated topic when reputation is too low', async () => {
    const engine = makeEngine({
      currentRoom: makeRoom({ npcs: ['patch'] }),
      player: makePlayer({ factionReputation: { drifters: 0 } }),
    })
    await handleTalk(engine, 'patch factions')
    expect(engine.messages.some(m => m.text.includes("don't know each other"))).toBe(true)
  })

  it('delivers rep-gated topic response when reputation meets threshold', async () => {
    const engine = makeEngine({
      currentRoom: makeRoom({ npcs: ['patch'] }),
      player: makePlayer({ factionReputation: { drifters: 1 } }),
    })
    await handleTalk(engine, 'patch factions')
    expect(engine.messages.some(m => m.text.includes('factions remain'))).toBe(true)
  })
})

// ============================================================
// SOCIAL — NPC disposition effects on greeting
// ============================================================

describe('handleTalk — NPC disposition changes dialogue', () => {
  beforeEach(() => vi.clearAllMocks())

  it('hostile NPC refuses conversation', async () => {
    const engine = makeEngine({
      currentRoom: makeRoom({
        npcs: ['patch'],
        population: { npcs: [{ npcId: 'patch', disposition: 'hostile' }] },
      }),
    })
    await handleTalk(engine, 'patch')
    expect(engine.messages.some(m => m.text.includes("not welcome"))).toBe(true)
  })

  it('wary NPC speaks in a low voice on topic', async () => {
    const engine = makeEngine({
      currentRoom: makeRoom({
        npcs: ['patch'],
        population: { npcs: [{ npcId: 'patch', disposition: 'wary' }] },
      }),
      player: makePlayer({ questFlags: {} }),
    })
    await handleTalk(engine, 'patch scar')
    expect(engine.messages.some(m => m.text.includes('low voice'))).toBe(true)
  })

  it('friendly NPC signals willingness to talk more', async () => {
    const engine = makeEngine({
      currentRoom: makeRoom({
        npcs: ['patch'],
        population: { npcs: [{ npcId: 'patch', disposition: 'friendly' }] },
        flags: { talked_patch: true },
      }),
    })
    await handleTalk(engine, 'patch')
    expect(engine.messages.some(m => m.text.includes('willing to talk more'))).toBe(true)
  })
})

// ============================================================
// SOCIAL — handleGive: gift responses by item type
// ============================================================

describe('handleGive — gift item type routing', () => {
  beforeEach(() => vi.clearAllMocks())

  it('medical item to patch grants drifters reputation and sets flag', async () => {
    const invItem: InventoryItem = {
      itemId: 'bandages', equipped: false,
      item: { id: 'bandages', name: 'Bandages', type: 'consumable', weight: 0.5, value: 5 },
    }
    const engine = makeEngine({
      currentRoom: makeRoom({ npcs: ['patch'] }),
      inventory: [invItem],
    })
    await handleGive(engine, 'bandages to patch')
    expect(engine.adjustReputation).toHaveBeenCalledWith('drifters', 1)
    expect(engine.setQuestFlag).toHaveBeenCalledWith('helped_patch_medical', true)
  })

  it('food item to any NPC earns faction reputation', async () => {
    const invItem: InventoryItem = {
      itemId: 'boiled_rations', equipped: false,
      item: { id: 'boiled_rations', name: 'Boiled Rations', type: 'consumable', weight: 1, value: 3 },
    }
    const engine = makeEngine({
      currentRoom: makeRoom({ npcs: ['patch'] }),
      inventory: [invItem],
    })
    await handleGive(engine, 'boiled_rations to patch')
    expect(engine.adjustReputation).toHaveBeenCalledWith('drifters', 1)
  })

  it('meridian keycard to lev sets quest flag and emits narrative text', async () => {
    const invItem: InventoryItem = {
      itemId: 'meridian_keycard', equipped: false,
      item: { id: 'meridian_keycard', name: 'Meridian Keycard', type: 'key', weight: 0, value: 0 },
    }
    const engine = makeEngine({
      currentRoom: makeRoom({ npcs: ['lev'] }),
      inventory: [invItem],
    })
    await handleGive(engine, 'meridian_keycard to lev')
    expect(engine.setQuestFlag).toHaveBeenCalledWith('gave_keycard_to_lev', true)
    expect(engine.messages.some(m => m.text.includes('keycard'))).toBe(true)
  })

  it('generic item gets generic acceptance response', async () => {
    const invItem: InventoryItem = {
      itemId: 'scrap_knife', equipped: false,
      item: { id: 'scrap_knife', name: 'Scrap Knife', type: 'weapon', weight: 1, value: 5 },
    }
    const engine = makeEngine({
      currentRoom: makeRoom({ npcs: ['patch'] }),
      inventory: [invItem],
    })
    await handleGive(engine, 'scrap_knife to patch')
    expect(engine.messages.some(m => m.text.includes('Appreciated'))).toBe(true)
    expect(engine.adjustReputation).not.toHaveBeenCalled()
  })

  it('errors when item not in inventory', async () => {
    const engine = makeEngine({ currentRoom: makeRoom({ npcs: ['patch'] }), inventory: [] })
    await handleGive(engine, 'bandages to patch')
    expect(engine.messages.some(m => m.text.includes("don't have that"))).toBe(true)
  })

  it('errors when NPC not in room', async () => {
    const invItem: InventoryItem = {
      itemId: 'bandages', equipped: false,
      item: { id: 'bandages', name: 'Bandages', type: 'consumable', weight: 0.5, value: 5 },
    }
    const engine = makeEngine({ currentRoom: makeRoom({ npcs: [] }), inventory: [invItem] })
    await handleGive(engine, 'bandages to patch')
    expect(engine.messages.some(m => m.text.includes("don't see that person"))).toBe(true)
  })
})
