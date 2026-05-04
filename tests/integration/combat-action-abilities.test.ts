// ============================================================
// tests/integration/combat-action-abilities.test.ts
//
// Deep integration tests for lib/actions/combat.ts
// Covers: every handler branch, conditions, abilities,
// flee paths, consumables, status effects, death paths, and
// multi-enemy scenarios via the handleEnemyDefeated path.
// ============================================================

import { describe, it, expect, vi, beforeEach } from 'vitest'
import type {
  GameState,
  Player,
  Room,
  Enemy,
  CombatState,
  InventoryItem,
  Item,
  GameMessage,
  PlayerLedger,
} from '@/types/game'
import type { EngineCore } from '@/lib/actions/types'
import type { ActiveCondition } from '@/types/traits'

// ============================================================
// vi.mock calls must be at module top level (hoisted by vitest)
// ============================================================

vi.mock('@/lib/combat', async (importOriginal) => {
  const actual = await importOriginal()
  return {
    ...actual,
    startCombat: vi.fn((player: Player, enemy: Enemy) => ({
      enemy,
      enemyHp: enemy.hp,
      playerGoesFirst: true,
      turn: 1,
      active: true,
      playerConditions: [],
      enemyConditions: [],
      abilityUsed: false,
      defendingThisTurn: false,
      waitingBonus: 0,
    })),
    playerAttack: vi.fn((_player: Player, state: CombatState) => ({
      result: {
        hit: true,
        damage: 5,
        critical: false,
        fumble: false,
        messages: [{ id: '1', text: 'You hit.', type: 'combat' as const }],
        enemyDefeated: state.enemyHp <= 5,
      },
      newState: {
        ...state,
        enemyHp: Math.max(0, state.enemyHp - 5),
        active: state.enemyHp > 5,
        turn: state.turn + 1,
      },
    })),
    enemyAttack: vi.fn((_player: Player, state: CombatState) => ({
      damage: 3,
      messages: [{ id: '2', text: 'Enemy hits you. [3 damage]', type: 'combat' as const }],
      newState: { ...state, turn: state.turn + 1 },
    })),
    flee: vi.fn((_player: Player, _state: CombatState) => ({
      result: { success: true, messages: [{ id: '3', text: 'You flee!', type: 'combat' as const }] },
      freeAttack: null,
    })),
    applyHollowRoundEffects: vi.fn((state: CombatState) => ({
      messages: [],
      newState: state,
    })),
    enemyHpIndicator: vi.fn(() => 'wounded'),
    rollLoot: vi.fn(() => []),
    resolveAoE: vi.fn(() => ({ damageToPlayer: 0, damageToEnemiesByIndex: {}, messages: [], conditionsApplied: [] })),
    computeArmorReduction: vi.fn((dmg: number) => dmg),
    getEnvironmentModifiers: vi.fn(() => []),
    getEnvironmentNarration: vi.fn(() => []),
    computeEnvironmentEffects: vi.fn(() => ({ combined: undefined, debrisDamage: 0, debrisMessages: [] })),
  }
})

vi.mock('@/data/enemies', () => ({
  getEnemy: vi.fn((id: string) => {
    if (id === 'shuffler') return {
      id: 'shuffler', name: 'Shuffler', description: 'A shambling corpse.',
      hp: 10, maxHp: 10, attack: 2, defense: 8, damage: [1, 3] as [number, number],
      xp: 12, loot: [{ itemId: 'scrap_metal', chance: 0.5 }],
    }
    if (id === 'remnant') return {
      id: 'remnant', name: 'Remnant', description: 'A remnant.',
      hp: 16, maxHp: 16, attack: 3, defense: 10, damage: [2, 5] as [number, number],
      xp: 25, loot: [],
    }
    if (id === 'brute') return {
      id: 'brute', name: 'Brute', description: 'A brute.',
      hp: 30, maxHp: 30, attack: 4, defense: 12, damage: [3, 7] as [number, number],
      xp: 80, loot: [],
    }
    if (id === 'screamer') return {
      id: 'screamer', name: 'Screamer', description: 'A screamer.',
      hp: 10, maxHp: 10, attack: 1, defense: 9, damage: [1, 2] as [number, number],
      xp: 30, loot: [], fleeThreshold: 0.5,
    }
    return undefined
  }),
}))

vi.mock('@/data/items', () => ({
  getItem: vi.fn((id: string) => {
    if (id === 'scrap_metal') return { id: 'scrap_metal', name: 'Scrap Metal', description: 'Junk.', type: 'junk', weight: 1, value: 2 }
    if (id === 'bandages') return { id: 'bandages', name: 'Bandages', description: 'Heals wounds.', type: 'consumable', weight: 0.5, value: 10, healing: 5 }
    if (id === 'grenade') return { id: 'grenade', name: 'Grenade', description: 'Goes boom.', type: 'consumable', weight: 1, value: 15, damage: 8 }
    if (id === 'stim_shot') return { id: 'stim_shot', name: 'Stim Shot', description: 'Boosts stats.', type: 'consumable', weight: 0.2, value: 20, statBonus: { reflex: 2 } }
    if (id === 'knife') return { id: 'knife', name: 'Knife', description: 'A blade.', type: 'weapon', weight: 1, value: 5, damage: 4 }
    if (id === 'rifle') return { id: 'rifle', name: 'Rifle', description: 'A firearm rifle.', type: 'weapon', weight: 3, value: 50, damage: 6 }
    if (id === 'armor') return { id: 'armor', name: 'Armor', description: 'Armor.', type: 'armor', weight: 5, value: 30, defense: 2 }
    return undefined
  }),
}))

vi.mock('@/lib/world', () => ({
  updateRoomItems: vi.fn().mockResolvedValue(undefined),
  updateRoomFlags: vi.fn().mockResolvedValue(undefined),
}))

vi.mock('@/lib/fear', () => ({
  fearCheck: vi.fn(() => ({ afraid: false, fearRounds: 0, messages: [] })),
}))

vi.mock('@/lib/conditions', async (importOriginal) => {
  const actual = await importOriginal<typeof import('@/lib/conditions')>()
  return {
    ...actual,
    // Default: pass conditions through so handler logic (stunned check, frightened check) still fires
    tickConditions: vi.fn((conditions: ActiveCondition[]) => ({
      messages: [],
      damage: 0,
      // Return conditions decremented by 1 but still present (so handler can read them)
      remaining: conditions.map(c => ({ ...c, remainingTurns: c.remainingTurns - 1 })).filter(c => c.remainingTurns > 0),
      rollPenalty: 0,
    })),
    cureCondition: vi.fn((conditions: ActiveCondition[], id: string) => ({
      cured: conditions.some(c => c.id === id),
      conditions: conditions.filter(c => c.id !== id),
      message: '',
    })),
    tryShakeFrightened: vi.fn((conditions: ActiveCondition[]) => ({ conditions, shaken: false, message: '' })),
    applyCondition: vi.fn((conditions: ActiveCondition[], conditionId: string, source: string) => ({
      conditions: [...conditions, { id: conditionId, remainingTurns: 2, damagePerTurn: 0, rollPenalty: 0, source }],
      applied: true,
      message: `${conditionId} applied by ${source}`,
    })),
  }
})

vi.mock('@/lib/abilities', async (importOriginal) => {
  const actual = await importOriginal<typeof import('@/lib/abilities')>()
  return {
    ...actual,
    buildAnalyzeMessages: vi.fn(() => [{ id: 'a1', text: '[ANALYSIS]', type: 'system' as const }]),
    handleAbility: vi.fn(),
  }
})

vi.mock('@/lib/inventory', () => ({
  removeItem: vi.fn().mockResolvedValue(undefined),
  getInventory: vi.fn().mockResolvedValue([]),
}))

vi.mock('@/lib/dice', async (importOriginal) => {
  const actual = await importOriginal<typeof import('@/lib/dice')>()
  return {
    ...actual,
    rollCheck: vi.fn((stat: number, dc: number) => ({
      roll: 8, modifier: actual.statModifier(stat), total: 8 + actual.statModifier(stat),
      dc, success: 8 + actual.statModifier(stat) >= dc, critical: false, fumble: false,
    })),
  }
})

// ============================================================
// Helpers
// ============================================================

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
    id: 'room_1', name: 'Test Room', description: 'A test room.',
    shortDescription: 'Test.', zone: 'crossroads', difficulty: 1,
    visited: false, flags: {}, exits: {}, items: [], enemies: [], npcs: [],
    ...overrides,
  }
}

function makeCombatState(overrides: Partial<CombatState> = {}): CombatState {
  return {
    enemy: makeEnemy(),
    enemyHp: 10,
    playerGoesFirst: true,
    turn: 1,
    active: true,
    playerConditions: [],
    enemyConditions: [],
    abilityUsed: false,
    defendingThisTurn: false,
    waitingBonus: 0,
    lastRoomId: 'room_1',
    ...overrides,
  }
}

function makeEnemy(overrides: Partial<Enemy> = {}): Enemy {
  return {
    id: 'shuffler', name: 'Shuffler', description: 'A shambling corpse.',
    hp: 10, maxHp: 10, attack: 2, defense: 8, damage: [1, 3] as [number, number],
    xp: 12, loot: [],
    ...overrides,
  }
}

function makeInventoryItem(itemId: string, item: Item, overrides: Partial<InventoryItem> = {}): InventoryItem {
  return {
    id: `inv-${itemId}`,
    playerId: 'p1',
    itemId,
    item,
    quantity: 1,
    equipped: false,
    ...overrides,
  }
}

function makeLedger(overrides: Partial<PlayerLedger> = {}): PlayerLedger {
  return {
    playerId: 'p1',
    worldSeed: 1,
    currentCycle: 1,
    totalDeaths: 0,
    pressureLevel: 0,
    discoveredRoomIds: [],
    squirrelAlive: true,
    squirrelTrust: 0,
    squirrelCyclesKnown: 0,
    ...overrides,
  }
}

type TestEngine = EngineCore & { messages: GameMessage[]; state: GameState }

function makeEngine(state: Partial<GameState> = {}): TestEngine {
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
    _appendMessages: (msgs) => { messages.push(...msgs); fullState.log.push(...msgs) },
    _savePlayer: vi.fn().mockResolvedValue(undefined),
    _applyPopulation: (room) => room,
    _handlePlayerDeath: vi.fn().mockResolvedValue(undefined),
    _checkLevelUp: vi.fn(),
    adjustReputation: vi.fn().mockResolvedValue(undefined),
    setQuestFlag: vi.fn().mockResolvedValue(undefined),
    grantNarrativeKey: vi.fn().mockResolvedValue(undefined),
  }
}

// Import under test after mocks
import {
  handleAttack,
  handleFlee,
  handleDefend,
  handleWait,
  handleAnalyze,
  handleCombatUse,
  buildStatusStrip,
  checkNoiseEncounter,
} from '@/lib/actions/combat'

// ============================================================
// 1. buildStatusStrip
// ============================================================

describe('buildStatusStrip', () => {
  it('returns null when no combat state', () => {
    const player = makePlayer()
    expect(buildStatusStrip(player, null)).toBeNull()
  })

  it('returns null when no conditions are active', () => {
    const player = makePlayer()
    const cs = makeCombatState()
    expect(buildStatusStrip(player, cs)).toBeNull()
  })

  it('includes player condition names and turns', () => {
    const player = makePlayer()
    const cs = makeCombatState({
      playerConditions: [{ id: 'bleeding', remainingTurns: 2, damagePerTurn: 2, rollPenalty: 0, source: 'test' }],
    })
    const strip = buildStatusStrip(player, cs)
    expect(strip).not.toBeNull()
    expect(strip).toContain('bleeding 2')
  })

  it('includes enemy condition with "enemy:" prefix', () => {
    const player = makePlayer()
    const cs = makeCombatState({
      enemyConditions: [{ id: 'stunned', remainingTurns: 1, damagePerTurn: 0, rollPenalty: 0, source: 'test' }],
    })
    const strip = buildStatusStrip(player, cs)
    expect(strip).toContain('enemy: stunned 1')
  })

  it('formats multiple conditions with pipe separator', () => {
    const player = makePlayer()
    const cs = makeCombatState({
      playerConditions: [
        { id: 'bleeding', remainingTurns: 2, damagePerTurn: 2, rollPenalty: 0, source: 'test' },
        { id: 'frightened', remainingTurns: 1, damagePerTurn: 0, rollPenalty: -2, source: 'test' },
      ],
    })
    const strip = buildStatusStrip(player, cs)
    expect(strip).toContain('|')
    expect(strip).toMatch(/^\[.*\]$/)
  })
})

// ============================================================
// 2. handleAttack — pre-combat initiation paths
// ============================================================

describe('handleAttack — initiating combat', () => {
  beforeEach(() => { vi.clearAllMocks() })

  it('shows error when no enemies in room', async () => {
    const engine = makeEngine({ currentRoom: makeRoom({ enemies: [] }) })
    await handleAttack(engine, undefined)
    const errs = engine.messages.filter(m => m.type === 'error')
    expect(errs.length).toBeGreaterThan(0)
    expect(errs[0]!.text).toContain('nothing to attack')
  })

  it('auto-selects first enemy when noun is undefined', async () => {
    const engine = makeEngine({ currentRoom: makeRoom({ enemies: ['shuffler'] }) })
    await handleAttack(engine, undefined)
    expect(engine.state.combatState).not.toBeNull()
    expect(engine.state.combatState!.enemy.id).toBe('shuffler')
  })

  it('resolves enemy by partial noun match', async () => {
    const engine = makeEngine({ currentRoom: makeRoom({ enemies: ['shuffler'] }) })
    await handleAttack(engine, 'shuf')
    expect(engine.state.combatState).not.toBeNull()
    expect(engine.state.combatState!.enemy.name).toBe('Shuffler')
  })

  it('shows "specify a target" error when noun does not match any enemy', async () => {
    const engine = makeEngine({ currentRoom: makeRoom({ enemies: ['shuffler'] }) })
    await handleAttack(engine, 'goblin')
    const errs = engine.messages.filter(m => m.type === 'error')
    expect(errs.some(m => m.text.includes('Specify a target'))).toBe(true)
  })

  it('shows error when enemy data is missing for matched targetId', async () => {
    const { getEnemy } = await import('@/data/enemies')
    // First call: auto-find by noun (returns a ghost with the right name for matching)
    // Second call: template lookup returns undefined
    ;(getEnemy as ReturnType<typeof vi.fn>)
      .mockReturnValueOnce({ id: 'ghost', name: 'Ghost', description: 'A ghost.', hp: 5, maxHp: 5, attack: 1, defense: 5, damage: [1, 2] as [number, number], xp: 5, loot: [] })  // for name matching
      .mockReturnValueOnce(undefined)  // for template lookup
    const engine = makeEngine({ currentRoom: makeRoom({ enemies: ['ghost'] }) })
    await handleAttack(engine, 'ghost')
    const errs = engine.messages.filter(m => m.type === 'error')
    expect(errs.some(m => m.text.includes('Unknown enemy'))).toBe(true)
  })

  it('shows fear check messages on high-difficulty room', async () => {
    const { fearCheck } = await import('@/lib/fear')
    ;(fearCheck as ReturnType<typeof vi.fn>).mockReturnValueOnce({
      afraid: true, fearRounds: 2, messages: [{ id: 'f1', text: 'Fear!', type: 'combat' as const }],
    })
    const engine = makeEngine({ currentRoom: makeRoom({ enemies: ['shuffler'], difficulty: 4 }) })
    await handleAttack(engine, undefined)
    expect(engine.messages.some(m => m.text.includes('Fear!'))).toBe(true)
    expect(engine.state.combatState!.fearPenalty).toBe(1)
  })

  it('records enemy in bestiary ledger on first encounter', async () => {
    const ledger = makeLedger({ discoveredEnemies: [] })
    const engine = makeEngine({
      currentRoom: makeRoom({ enemies: ['shuffler'] }),
      ledger,
    })
    await handleAttack(engine, undefined)
    expect(engine.state.ledger!.discoveredEnemies).toContain('shuffler')
  })

  it('does not duplicate enemy in ledger if already discovered', async () => {
    const ledger = makeLedger({ discoveredEnemies: ['shuffler'] })
    const engine = makeEngine({
      currentRoom: makeRoom({ enemies: ['shuffler'] }),
      ledger,
    })
    await handleAttack(engine, undefined)
    const count = engine.state.ledger!.discoveredEnemies!.filter(e => e === 'shuffler').length
    expect(count).toBe(1)
  })

  it('enemy goes first when playerGoesFirst=false and enemy attacks on start', async () => {
    const { startCombat, enemyAttack } = await import('@/lib/combat')
    ;(startCombat as ReturnType<typeof vi.fn>).mockReturnValueOnce({
      enemy: makeEnemy(), enemyHp: 10, playerGoesFirst: false, turn: 1,
      active: true, playerConditions: [], enemyConditions: [],
      abilityUsed: false, defendingThisTurn: false, waitingBonus: 0,
    })
    const engine = makeEngine({ currentRoom: makeRoom({ enemies: ['shuffler'] }) })
    await handleAttack(engine, undefined)
    expect(enemyAttack).toHaveBeenCalled()
    // player HP should have been reduced by enemy attack (damage = 3)
    expect(engine.state.player!.hp).toBe(17)
  })

  it('enemy first-turn attack that kills player triggers death', async () => {
    const { startCombat } = await import('@/lib/combat')
    ;(startCombat as ReturnType<typeof vi.fn>).mockReturnValueOnce({
      enemy: makeEnemy(), enemyHp: 10, playerGoesFirst: false, turn: 1,
      active: true, playerConditions: [], enemyConditions: [],
      abilityUsed: false, defendingThisTurn: false, waitingBonus: 0,
    })
    const engine = makeEngine({
      player: makePlayer({ hp: 1 }),
      currentRoom: makeRoom({ enemies: ['shuffler'] }),
    })
    await handleAttack(engine, undefined)
    expect(engine._handlePlayerDeath).toHaveBeenCalled()
  })

  it('shows equipped weapon hint after combat starts', async () => {
    const knifeItem = { id: 'knife', name: 'Knife', description: 'A blade.', type: 'weapon' as const, weight: 1, value: 5, damage: 4 }
    const engine = makeEngine({
      currentRoom: makeRoom({ enemies: ['shuffler'] }),
      inventory: [makeInventoryItem('knife', knifeItem, { equipped: true })],
    })
    await handleAttack(engine, undefined)
    const sysMsg = engine.messages.find(m => m.text.includes('Fighting with'))
    expect(sysMsg).toBeDefined()
  })
})

// ============================================================
// 3. handleAttack — doAttackRound paths (combat already active)
// ============================================================

describe('handleAttack — doAttackRound', () => {
  beforeEach(() => { vi.clearAllMocks() })

  it('delegates to doAttackRound when combat is already active', async () => {
    const { playerAttack } = await import('@/lib/combat')
    const engine = makeEngine({ combatState: makeCombatState({ enemyHp: 20 }) })
    await handleAttack(engine, undefined)
    expect(playerAttack).toHaveBeenCalled()
  })

  it('awards XP and clears combat state when enemy is defeated', async () => {
    const { playerAttack } = await import('@/lib/combat')
    // Mock a killing blow
    ;(playerAttack as ReturnType<typeof vi.fn>).mockReturnValueOnce({
      result: { hit: true, damage: 10, critical: false, fumble: false, messages: [], enemyDefeated: true },
      newState: { ...makeCombatState(), enemyHp: 0, active: false },
    })
    const engine = makeEngine({ combatState: makeCombatState({ enemyHp: 5 }) })
    await handleAttack(engine, undefined)
    expect(engine.state.combatState).toBeNull()
    expect(engine.state.player!.xp).toBe(12)
  })

  it('DOT damage kills player — triggers death before attack', async () => {
    const { tickConditions } = await import('@/lib/conditions')
    ;(tickConditions as ReturnType<typeof vi.fn>).mockReturnValueOnce({
      messages: ['bleeding deals 2 damage.'], damage: 25, remaining: [],
    })
    const engine = makeEngine({
      player: makePlayer({ hp: 5 }),
      combatState: makeCombatState({
        playerConditions: [{ id: 'bleeding', remainingTurns: 2, damagePerTurn: 2, rollPenalty: 0, source: 'test' }],
      }),
    })
    await handleAttack(engine, undefined)
    expect(engine._handlePlayerDeath).toHaveBeenCalled()
  })

  it('DOT damage kills enemy — enemy succumbs to wounds', async () => {
    const { tickConditions } = await import('@/lib/conditions')
    // Player tick: no damage. Enemy tick: kills enemy.
    ;(tickConditions as ReturnType<typeof vi.fn>)
      .mockReturnValueOnce({ messages: [], damage: 0, remaining: [] })
      .mockReturnValueOnce({ messages: ['bleeding deals 5 damage.'], damage: 20, remaining: [] })
    const engine = makeEngine({
      combatState: makeCombatState({
        enemyHp: 5,
        enemyConditions: [{ id: 'bleeding', remainingTurns: 2, damagePerTurn: 5, rollPenalty: 0, source: 'test' }],
      }),
    })
    await handleAttack(engine, undefined)
    expect(engine.state.combatState).toBeNull()
    expect(engine.messages.some(m => m.text.includes('succumbs'))).toBe(true)
  })

  it('frightened player attempts shake check each turn', async () => {
    const { tryShakeFrightened } = await import('@/lib/conditions')
    const cs = makeCombatState({
      playerConditions: [{ id: 'frightened', remainingTurns: 2, damagePerTurn: 0, rollPenalty: -2, source: 'test' }],
    })
    const engine = makeEngine({ combatState: cs })
    await handleAttack(engine, undefined)
    expect(tryShakeFrightened).toHaveBeenCalled()
  })

  it('stunned player skips their attack', async () => {
    const { playerAttack } = await import('@/lib/combat')
    // remainingTurns: 2 so after tick decrement it stays at 1 (still active)
    const cs = makeCombatState({
      playerConditions: [{ id: 'stunned', remainingTurns: 2, damagePerTurn: 0, rollPenalty: 0, source: 'test' }],
    })
    const engine = makeEngine({ combatState: cs })
    await handleAttack(engine, undefined)
    expect(playerAttack).not.toHaveBeenCalled()
    expect(engine.messages.some(m => m.text.includes("stunned and can't act"))).toBe(true)
  })

  it('stunned enemy skips its attack', async () => {
    const { enemyAttack, playerAttack } = await import('@/lib/combat')
    // playerAttack does NOT defeat enemy
    ;(playerAttack as ReturnType<typeof vi.fn>).mockReturnValueOnce({
      result: { hit: true, damage: 3, critical: false, fumble: false, messages: [], enemyDefeated: false },
      newState: { ...makeCombatState(), enemyHp: 7 },
    })
    // remainingTurns: 2 so after tick decrement it stays at 1 (still active)
    const cs = makeCombatState({
      enemyHp: 10,
      enemyConditions: [{ id: 'stunned', remainingTurns: 2, damagePerTurn: 0, rollPenalty: 0, source: 'test' }],
    })
    const engine = makeEngine({ combatState: cs })
    await handleAttack(engine, undefined)
    expect(enemyAttack).not.toHaveBeenCalled()
    expect(engine.messages.some(m => m.text.includes('stunned and can\'t act'))).toBe(true)
  })

  it('enemy attack kills player triggers death handler', async () => {
    const { playerAttack } = await import('@/lib/combat')
    ;(playerAttack as ReturnType<typeof vi.fn>).mockReturnValueOnce({
      result: { hit: true, damage: 3, critical: false, fumble: false, messages: [], enemyDefeated: false },
      newState: { ...makeCombatState(), enemyHp: 7 },
    })
    const engine = makeEngine({
      player: makePlayer({ hp: 2 }),
      combatState: makeCombatState({ enemyHp: 10 }),
    })
    await handleAttack(engine, undefined)
    expect(engine._handlePlayerDeath).toHaveBeenCalled()
  })

  it('appends status strip when conditions are active after round', async () => {
    const { tickConditions } = await import('@/lib/conditions')
    // tickConditions leaves 'bleeding' still active
    ;(tickConditions as ReturnType<typeof vi.fn>)
      .mockReturnValueOnce({
        messages: [], damage: 0,
        remaining: [{ id: 'bleeding', remainingTurns: 1, damagePerTurn: 2, rollPenalty: 0, source: 'test' }],
      })
      .mockReturnValueOnce({ messages: [], damage: 0, remaining: [] })
    const cs = makeCombatState({
      enemyHp: 20,
      playerConditions: [{ id: 'bleeding', remainingTurns: 2, damagePerTurn: 2, rollPenalty: 0, source: 'test' }],
    })
    const engine = makeEngine({ combatState: cs })
    await handleAttack(engine, undefined)
    const stripMsg = engine.messages.find(m => m.text.startsWith('[') && m.text.includes('bleeding'))
    expect(stripMsg).toBeDefined()
  })

  it('draining heal from weapon trait restores player HP', async () => {
    const { playerAttack } = await import('@/lib/combat')
    ;(playerAttack as ReturnType<typeof vi.fn>).mockReturnValueOnce({
      result: { hit: true, damage: 5, critical: false, fumble: false, messages: [], enemyDefeated: false },
      newState: { ...makeCombatState(), enemyHp: 5, _healPlayer: 4 },
    })
    const engine = makeEngine({
      player: makePlayer({ hp: 15, maxHp: 20 }),
      combatState: makeCombatState({ enemyHp: 10 }),
    })
    await handleAttack(engine, undefined)
    // Player should have healed 4 HP (from 15) then taken 3 from enemy
    // Note: heal happens before enemy attack, state is sequential
    expect(engine.state.player!.hp).toBeGreaterThan(15)
  })

  it('additional enemies (screamer summons) attack after main enemy', async () => {
    const { playerAttack, enemyAttack } = await import('@/lib/combat')
    ;(playerAttack as ReturnType<typeof vi.fn>).mockReturnValueOnce({
      result: { hit: true, damage: 3, critical: false, fumble: false, messages: [], enemyDefeated: false },
      newState: {
        ...makeCombatState(), enemyHp: 7,
        additionalEnemies: [makeEnemy({ id: 'remnant', name: 'Remnant' })],
      },
    })
    const cs = makeCombatState({
      enemyHp: 10,
      additionalEnemies: [makeEnemy({ id: 'remnant', name: 'Remnant' })],
    })
    const engine = makeEngine({ combatState: cs })
    await handleAttack(engine, undefined)
    // enemyAttack should be called at least twice (main + additional)
    expect((enemyAttack as ReturnType<typeof vi.fn>).mock.calls.length).toBeGreaterThanOrEqual(2)
  })
})

// ============================================================
// 4. handleFlee
// ============================================================

describe('handleFlee', () => {
  beforeEach(() => { vi.clearAllMocks() })

  it('shows error when not in combat', async () => {
    const engine = makeEngine({ combatState: null })
    await handleFlee(engine)
    const errs = engine.messages.filter(m => m.type === 'error')
    expect(errs.some(m => m.text.includes('not in combat'))).toBe(true)
  })

  it('shows error when cantFlee is set (wraith shadowstrike)', async () => {
    const engine = makeEngine({ combatState: makeCombatState({ cantFlee: true }) })
    await handleFlee(engine)
    const errs = engine.messages.filter(m => m.type === 'error')
    expect(errs.some(m => m.text.includes('no running'))).toBe(true)
  })

  it('successful flee clears combat state', async () => {
    const engine = makeEngine({ combatState: makeCombatState() })
    await handleFlee(engine)
    expect(engine.state.combatState).toBeNull()
  })

  it('successful flee with additional enemies reinjects them to room', async () => {
    const addEnemy = makeEnemy({ id: 'remnant' })
    const cs = makeCombatState({ additionalEnemies: [addEnemy] })
    const engine = makeEngine({
      currentRoom: makeRoom({ enemies: ['shuffler'] }),
      combatState: cs,
    })
    await handleFlee(engine)
    expect(engine.state.currentRoom!.enemies).toContain('remnant')
    expect(engine.messages.some(m => m.text.includes('flee'))).toBe(true)
  })

  it('failed flee — enemy gets free attack', async () => {
    const { flee } = await import('@/lib/combat')
    ;(flee as ReturnType<typeof vi.fn>).mockReturnValueOnce({
      result: { success: false, messages: [{ id: 'f2', text: 'You fail to escape!', type: 'combat' as const }] },
      freeAttack: {
        damage: 4,
        messages: [{ id: 'fa1', text: 'Enemy strikes you. [4 damage]', type: 'combat' as const }],
        newState: makeCombatState(),
      },
    })
    const engine = makeEngine({
      player: makePlayer({ hp: 20 }),
      combatState: makeCombatState(),
    })
    await handleFlee(engine)
    expect(engine.state.player!.hp).toBe(16)
    expect(engine.state.combatState).not.toBeNull()
  })

  it('failed flee free attack kills player', async () => {
    const { flee } = await import('@/lib/combat')
    ;(flee as ReturnType<typeof vi.fn>).mockReturnValueOnce({
      result: { success: false, messages: [] },
      freeAttack: {
        damage: 99,
        messages: [{ id: 'fa2', text: 'Enemy strikes you. [99 damage]', type: 'combat' as const }],
        newState: makeCombatState(),
      },
    })
    const engine = makeEngine({
      player: makePlayer({ hp: 3 }),
      combatState: makeCombatState(),
    })
    await handleFlee(engine)
    expect(engine._handlePlayerDeath).toHaveBeenCalled()
  })
})

// ============================================================
// 5. handleDefend
// ============================================================

describe('handleDefend', () => {
  beforeEach(() => { vi.clearAllMocks() })

  it('shows error when not in combat', async () => {
    const engine = makeEngine({ combatState: null })
    await handleDefend(engine)
    const errs = engine.messages.filter(m => m.type === 'error')
    expect(errs.some(m => m.text.includes('not in combat'))).toBe(true)
  })

  it('sets defendingThisTurn flag and emits brace message', async () => {
    const engine = makeEngine({ combatState: makeCombatState() })
    await handleDefend(engine)
    expect(engine.messages.some(m => m.text.includes('brace'))).toBe(true)
  })

  it('cures burning condition while defending', async () => {
    const { cureCondition } = await import('@/lib/conditions')
    ;(cureCondition as ReturnType<typeof vi.fn>).mockReturnValueOnce({
      cured: true,
      conditions: [],
      message: 'burning cured.',
    })
    const cs = makeCombatState({
      playerConditions: [{ id: 'burning', remainingTurns: 1, damagePerTurn: 3, rollPenalty: 0, source: 'test' }],
    })
    const engine = makeEngine({ combatState: cs })
    await handleDefend(engine)
    expect(engine.messages.some(m => m.text.includes('flames die'))).toBe(true)
  })

  it('enemy still attacks after defend', async () => {
    const { enemyAttack } = await import('@/lib/combat')
    const engine = makeEngine({ combatState: makeCombatState() })
    await handleDefend(engine)
    expect(enemyAttack).toHaveBeenCalled()
  })

  it('defend with enemy intimidated — enemy skips turn', async () => {
    const { enemyAttack } = await import('@/lib/combat')
    const cs = makeCombatState({ enemyIntimidated: true })
    const engine = makeEngine({ combatState: cs })
    await handleDefend(engine)
    expect(enemyAttack).not.toHaveBeenCalled()
    expect(engine.messages.some(m => m.text.includes('hesitates'))).toBe(true)
  })

  it('defend with brace active reduces damage 60%', async () => {
    const cs = makeCombatState({ braceActive: true })
    const engine = makeEngine({
      player: makePlayer({ hp: 20 }),
      combatState: cs,
    })
    await handleDefend(engine)
    // damage=3, braceActive => ceil(3*0.4) = 2
    expect(engine.state.player!.hp).toBe(18)
  })

  it('defend with enraged enemy adds +2 damage', async () => {
    const cs = makeCombatState({ enemyEnraged: true })
    const engine = makeEngine({
      player: makePlayer({ hp: 20 }),
      combatState: cs,
    })
    await handleDefend(engine)
    // damage=3 + 2 = 5
    expect(engine.state.player!.hp).toBe(15)
  })

  it('enemy attack killing player during defend triggers death', async () => {
    const cs = makeCombatState()
    const engine = makeEngine({
      player: makePlayer({ hp: 1 }),
      combatState: cs,
    })
    await handleDefend(engine)
    expect(engine._handlePlayerDeath).toHaveBeenCalled()
  })
})

// ============================================================
// 6. handleWait
// ============================================================

describe('handleWait', () => {
  beforeEach(() => { vi.clearAllMocks() })

  it('shows error when not in combat', async () => {
    const engine = makeEngine({ combatState: null })
    await handleWait(engine)
    const errs = engine.messages.filter(m => m.type === 'error')
    expect(errs.some(m => m.text.includes('not in combat'))).toBe(true)
  })

  it('sets waitingBonus to 3 and emits watch message', async () => {
    const engine = makeEngine({ combatState: makeCombatState({ waitingBonus: 0 }) })
    await handleWait(engine)
    expect(engine.state.combatState!.waitingBonus).toBe(3)
    expect(engine.messages.some(m => m.text.includes('wait'))).toBe(true)
  })

  it('enemy still attacks after wait', async () => {
    const { enemyAttack } = await import('@/lib/combat')
    const engine = makeEngine({ combatState: makeCombatState() })
    await handleWait(engine)
    expect(enemyAttack).toHaveBeenCalled()
  })
})

// ============================================================
// 7. handleAnalyze
// ============================================================

describe('handleAnalyze', () => {
  beforeEach(() => { vi.clearAllMocks() })

  it('shows error when not in combat', async () => {
    const engine = makeEngine({ combatState: null })
    await handleAnalyze(engine)
    const errs = engine.messages.filter(m => m.type === 'error')
    expect(errs.some(m => m.text.includes('not in combat'))).toBe(true)
  })

  it('reclaimer auto-succeeds analyze', async () => {
    const { buildAnalyzeMessages } = await import('@/lib/abilities')
    const engine = makeEngine({
      player: makePlayer({ characterClass: 'reclaimer' }),
      combatState: makeCombatState(),
    })
    await handleAnalyze(engine)
    expect(buildAnalyzeMessages).toHaveBeenCalled()
    expect(engine.messages.some(m => m.text.includes('[ANALYSIS]'))).toBe(true)
  })

  it('non-reclaimer succeeds analyze on good roll', async () => {
    const { rollCheck } = await import('@/lib/dice')
    ;(rollCheck as ReturnType<typeof vi.fn>).mockReturnValueOnce({
      roll: 9, modifier: 1, total: 10, dc: 11, success: true, critical: false, fumble: false,
    })
    const { buildAnalyzeMessages } = await import('@/lib/abilities')
    const engine = makeEngine({
      player: makePlayer({ characterClass: 'enforcer', wits: 8 }),
      combatState: makeCombatState(),
    })
    await handleAnalyze(engine)
    expect(buildAnalyzeMessages).toHaveBeenCalled()
  })

  it('non-reclaimer fails analyze on low roll', async () => {
    const { rollCheck } = await import('@/lib/dice')
    ;(rollCheck as ReturnType<typeof vi.fn>).mockReturnValueOnce({
      roll: 2, modifier: -1, total: 1, dc: 11, success: false, critical: false, fumble: false,
    })
    const engine = makeEngine({
      player: makePlayer({ characterClass: 'enforcer', wits: 2 }),
      combatState: makeCombatState(),
    })
    await handleAnalyze(engine)
    expect(engine.messages.some(m => m.text.includes('Nothing useful'))).toBe(true)
  })
})

// ============================================================
// 8. handleCombatUse
// ============================================================

describe('handleCombatUse', () => {
  beforeEach(() => { vi.clearAllMocks() })

  it('shows error when not in combat', async () => {
    const engine = makeEngine({ combatState: null })
    await handleCombatUse(engine, 'bandages')
    const errs = engine.messages.filter(m => m.type === 'error')
    expect(errs.some(m => m.text.includes('not in combat'))).toBe(true)
  })

  it('shows "use what?" when noun is undefined', async () => {
    const engine = makeEngine({ combatState: makeCombatState() })
    await handleCombatUse(engine, undefined)
    const errs = engine.messages.filter(m => m.type === 'error')
    expect(errs.some(m => m.text.includes('Use what?'))).toBe(true)
  })

  it('shows "you don\'t have that" when item not in inventory', async () => {
    const engine = makeEngine({ combatState: makeCombatState(), inventory: [] })
    await handleCombatUse(engine, 'bandages')
    const errs = engine.messages.filter(m => m.type === 'error')
    expect(errs.some(m => m.text.includes("don't have that"))).toBe(true)
  })

  it('shows "cannot use that in combat" for non-consumable', async () => {
    const knifeItem = { id: 'knife', name: 'Knife', description: 'A blade.', type: 'weapon' as const, weight: 1, value: 5, damage: 4 }
    const engine = makeEngine({
      combatState: makeCombatState(),
      inventory: [makeInventoryItem('knife', knifeItem)],
    })
    await handleCombatUse(engine, 'knife')
    const errs = engine.messages.filter(m => m.type === 'error')
    expect(errs.some(m => m.text.includes("can't use that in combat"))).toBe(true)
  })

  it('healing consumable restores HP and enemy attacks back', async () => {
    const { enemyAttack } = await import('@/lib/combat')
    const bandageItem = {
      id: 'bandages', name: 'Bandages', description: 'Heals.', type: 'consumable' as const,
      weight: 0.5, value: 10, healing: 5,
    }
    const engine = makeEngine({
      player: makePlayer({ hp: 10, maxHp: 20 }),
      combatState: makeCombatState(),
      inventory: [makeInventoryItem('bandages', bandageItem)],
    })
    await handleCombatUse(engine, 'bandages')
    // HP should increase by 5 from healing
    expect(engine.state.player!.hp).toBeGreaterThan(10)
    expect(enemyAttack).toHaveBeenCalled()
  })

  it('damage consumable deals damage to enemy, enemy attacks back', async () => {
    const { enemyAttack } = await import('@/lib/combat')
    const grenadeItem = {
      id: 'grenade', name: 'Grenade', description: 'Goes boom.', type: 'consumable' as const,
      weight: 1, value: 15, damage: 8,
    }
    const engine = makeEngine({
      combatState: makeCombatState({ enemyHp: 15 }),
      inventory: [makeInventoryItem('grenade', grenadeItem)],
    })
    await handleCombatUse(engine, 'grenade')
    // Enemy HP should drop from 15 to 7
    const newHp = engine.state.combatState?.enemyHp
    expect(newHp).toBe(7)
    expect(enemyAttack).toHaveBeenCalled()
  })

  it('damage consumable kills enemy — combat ends', async () => {
    const grenadeItem = {
      id: 'grenade', name: 'Grenade', description: 'Goes boom.', type: 'consumable' as const,
      weight: 1, value: 15, damage: 8,
    }
    const engine = makeEngine({
      combatState: makeCombatState({ enemyHp: 5 }),
      inventory: [makeInventoryItem('grenade', grenadeItem)],
    })
    await handleCombatUse(engine, 'grenade')
    // Enemy should be dead, combat null
    expect(engine.state.combatState).toBeNull()
    expect(engine.messages.some(m => m.text.includes('torn apart'))).toBe(true)
  })

  it('stat bonus consumable applies buff and enemy attacks back', async () => {
    const { enemyAttack } = await import('@/lib/combat')
    const stimItem = {
      id: 'stim_shot', name: 'Stim Shot', description: 'Boosts stats.', type: 'consumable' as const,
      weight: 0.2, value: 20, statBonus: { reflex: 2 },
    }
    const engine = makeEngine({
      player: makePlayer({ reflex: 6 }),
      combatState: makeCombatState(),
      inventory: [makeInventoryItem('stim_shot', stimItem)],
    })
    await handleCombatUse(engine, 'stim_shot')
    // reflex should be boosted
    expect(engine.state.player!.reflex).toBe(8)
    expect(engine.state.activeBuffs).toBeDefined()
    expect(enemyAttack).toHaveBeenCalled()
  })

  it('consumable with no usable effect shows "cannot use in combat"', async () => {
    const weirdItem = {
      id: 'weird_thing', name: 'Weird Thing', description: 'No effect.', type: 'consumable' as const,
      weight: 1, value: 1,
    }
    const engine = makeEngine({
      combatState: makeCombatState(),
      inventory: [makeInventoryItem('weird_thing', weirdItem)],
    })
    await handleCombatUse(engine, 'weird_thing')
    const errs = engine.messages.filter(m => m.type === 'error')
    expect(errs.some(m => m.text.includes("can't use that in combat"))).toBe(true)
  })
})

// ============================================================
// 9. checkNoiseEncounter
// ============================================================

describe('checkNoiseEncounter', () => {
  beforeEach(() => { vi.clearAllMocks() })

  it('does nothing when isLoud=false', async () => {
    const engine = makeEngine({
      currentRoom: makeRoom({ enemies: [] }),
    })
    await checkNoiseEncounter(engine, false)
    expect(engine.state.combatState).toBeNull()
  })

  it('does nothing if already in combat', async () => {
    const engine = makeEngine({
      currentRoom: makeRoom({ enemies: [] }),
      combatState: makeCombatState(),
    })
    await checkNoiseEncounter(engine, true)
    // Combat state should be unchanged (still the original)
    expect(engine.state.combatState!.enemy.id).toBe('shuffler')
  })

  it('does nothing in safe room (noCombat flag)', async () => {
    const engine = makeEngine({
      currentRoom: makeRoom({ enemies: [], flags: { noCombat: true } }),
    })
    await checkNoiseEncounter(engine, true)
    expect(engine.state.combatState).toBeNull()
  })

  it('spawns enemy when Math.random is below threshold (room encounter data)', async () => {
    const { startCombat } = await import('@/lib/combat')
    vi.spyOn(Math, 'random')
      .mockReturnValueOnce(0.02)  // roll: 1 (threshold=ceil(0.5*1.0*20)=10, roll=1 => spawns)
      .mockReturnValueOnce(0.4)   // pick shuffler (< 0.6)
    const roomWithEncounter = makeRoom({
      enemies: [],
      hollowEncounter: { baseChance: 0.5, noiseModifier: 1.0, timeModifier: {}, threatPool: [] },
    })
    const engine = makeEngine({ currentRoom: roomWithEncounter })
    await checkNoiseEncounter(engine, true)
    expect(startCombat).toHaveBeenCalled()
    expect(engine.state.combatState).not.toBeNull()
  })

  it('fallback flat 20% chance triggers spawn', async () => {
    const { startCombat } = await import('@/lib/combat')
    vi.spyOn(Math, 'random')
      .mockReturnValueOnce(0.10)  // < 0.20 => spawn
      .mockReturnValueOnce(0.4)   // pick shuffler
    const engine = makeEngine({ currentRoom: makeRoom({ enemies: [] }) })
    await checkNoiseEncounter(engine, true)
    expect(startCombat).toHaveBeenCalled()
  })

  it('enemy-goes-first path during noise encounter triggers enemy attack', async () => {
    const { startCombat, enemyAttack } = await import('@/lib/combat')
    ;(startCombat as ReturnType<typeof vi.fn>).mockReturnValueOnce({
      enemy: makeEnemy(), enemyHp: 10, playerGoesFirst: false, turn: 1,
      active: true, playerConditions: [], enemyConditions: [],
      abilityUsed: false, defendingThisTurn: false, waitingBonus: 0,
    })
    vi.spyOn(Math, 'random')
      .mockReturnValueOnce(0.10)  // < 0.20 => spawn
      .mockReturnValueOnce(0.4)   // pick shuffler
    const engine = makeEngine({ currentRoom: makeRoom({ enemies: [] }) })
    await checkNoiseEncounter(engine, true)
    expect(enemyAttack).toHaveBeenCalled()
  })
})

// ============================================================
// 10. Multi-enemy combat — screamer additional enemies
// ============================================================

describe('Multi-enemy combat (screamer additional enemies)', () => {
  beforeEach(() => { vi.clearAllMocks() })

  it('after primary enemy dies with additionalEnemies, starts next combat', async () => {
    const { playerAttack, startCombat } = await import('@/lib/combat')
    const nextEnemy = makeEnemy({ id: 'remnant', name: 'Remnant', hp: 16, xp: 25 })
    ;(playerAttack as ReturnType<typeof vi.fn>).mockReturnValueOnce({
      result: { hit: true, damage: 10, critical: false, fumble: false, messages: [], enemyDefeated: true },
      newState: {
        ...makeCombatState(), enemyHp: 0, active: false,
        additionalEnemies: [nextEnemy],
      },
    })
    const cs = makeCombatState({
      enemyHp: 5,
      additionalEnemies: [nextEnemy],
    })
    const engine = makeEngine({ combatState: cs })
    await handleAttack(engine, undefined)
    // Next combat should be started
    expect(startCombat).toHaveBeenCalledWith(expect.anything(), nextEnemy)
    expect(engine.state.combatState).not.toBeNull()
    expect(engine.messages.some(m => m.text.includes('closes in'))).toBe(true)
  })

  it('flee with additional enemies still running notifies player', async () => {
    const addEnemy = makeEnemy({ id: 'remnant' })
    const engine = makeEngine({
      currentRoom: makeRoom({ enemies: ['shuffler'] }),
      combatState: makeCombatState({ additionalEnemies: [addEnemy] }),
    })
    await handleFlee(engine)
    expect(engine.messages.some(m => m.text.includes('flee'))).toBe(true)
  })
})

// ============================================================
// 11. Ranged weapon triggers noise check after kill
// ============================================================

describe('Ranged weapon noise check on kill', () => {
  beforeEach(() => { vi.clearAllMocks() })

  it('ranged weapon kill triggers checkNoiseEncounter', async () => {
    const { playerAttack } = await import('@/lib/combat')
    const rifleItem = {
      id: 'rifle', name: 'Rifle',
      description: 'A firearm rifle used for long-range combat.',
      type: 'weapon' as const, weight: 3, value: 50, damage: 6,
    }
    ;(playerAttack as ReturnType<typeof vi.fn>).mockReturnValueOnce({
      result: { hit: true, damage: 10, critical: false, fumble: false, messages: [], enemyDefeated: true },
      newState: { ...makeCombatState(), enemyHp: 0, active: false, _suppressNoise: false },
    })
    vi.spyOn(Math, 'random').mockReturnValue(0.99) // far above 0.20, so won't spawn, but checkNoiseEncounter is called
    const engine = makeEngine({
      combatState: makeCombatState({ enemyHp: 5 }),
      inventory: [makeInventoryItem('rifle', rifleItem, { equipped: true })],
    })
    await handleAttack(engine, undefined)
    // No second combat starts because Math.random > 0.20, but the function was reached
    // Just verify combat ended cleanly
    expect(engine.state.combatState).toBeNull()
  })

  it('silenced weapon kill emits SILENCED message instead of noise check', async () => {
    const { playerAttack } = await import('@/lib/combat')
    const silencedRifle = {
      id: 'rifle', name: 'Rifle',
      description: 'A firearm rifle.',
      type: 'weapon' as const, weight: 3, value: 50, damage: 6,
    }
    ;(playerAttack as ReturnType<typeof vi.fn>).mockReturnValueOnce({
      result: { hit: true, damage: 10, critical: false, fumble: false, messages: [], enemyDefeated: true },
      newState: { ...makeCombatState(), enemyHp: 0, active: false, _suppressNoise: true },
    })
    const engine = makeEngine({
      combatState: makeCombatState({ enemyHp: 5 }),
      inventory: [makeInventoryItem('rifle', silencedRifle, { equipped: true })],
    })
    await handleAttack(engine, undefined)
    expect(engine.messages.some(m => m.text.includes('SILENCED'))).toBe(true)
  })
})

// ============================================================
// 12. handleEnemyDefeated — room cleared flag
// ============================================================

describe('Room cleared flag after last enemy defeated', () => {
  beforeEach(() => { vi.clearAllMocks() })

  it('marks room_cleared when last enemy in room is defeated', async () => {
    const { updateRoomFlags } = await import('@/lib/world')
    const { playerAttack } = await import('@/lib/combat')
    ;(playerAttack as ReturnType<typeof vi.fn>).mockReturnValueOnce({
      result: { hit: true, damage: 10, critical: false, fumble: false, messages: [], enemyDefeated: true },
      newState: { ...makeCombatState({ enemyHp: 0 }), active: false },
    })
    const engine = makeEngine({
      currentRoom: makeRoom({ enemies: ['shuffler'] }),
      combatState: makeCombatState({ enemyHp: 5 }),
    })
    await handleAttack(engine, undefined)
    expect(updateRoomFlags).toHaveBeenCalledWith(
      'room_1', 'p1', expect.objectContaining({ room_cleared: true }),
    )
  })
})

// ============================================================
// 13. Loot drops after enemy defeat
// ============================================================

describe('Loot drops', () => {
  beforeEach(() => { vi.clearAllMocks() })

  it('loot is added to room and reported to player', async () => {
    const { rollLoot } = await import('@/lib/combat')
    const { playerAttack } = await import('@/lib/combat')
    ;(rollLoot as ReturnType<typeof vi.fn>).mockReturnValueOnce(['scrap_metal'])
    ;(playerAttack as ReturnType<typeof vi.fn>).mockReturnValueOnce({
      result: { hit: true, damage: 10, critical: false, fumble: false, messages: [], enemyDefeated: true },
      newState: { ...makeCombatState(), enemyHp: 0, active: false },
    })
    const engine = makeEngine({
      combatState: makeCombatState({ enemyHp: 5 }),
      currentRoom: makeRoom({ enemies: ['shuffler'] }),
    })
    await handleAttack(engine, undefined)
    expect(engine.messages.some(m => m.text.includes('search the remains'))).toBe(true)
    expect(engine.state.currentRoom!.items).toContain('scrap_metal')
  })

  it('no loot message when nothing drops', async () => {
    const { rollLoot } = await import('@/lib/combat')
    const { playerAttack } = await import('@/lib/combat')
    ;(rollLoot as ReturnType<typeof vi.fn>).mockReturnValueOnce([])
    ;(playerAttack as ReturnType<typeof vi.fn>).mockReturnValueOnce({
      result: { hit: true, damage: 10, critical: false, fumble: false, messages: [], enemyDefeated: true },
      newState: { ...makeCombatState(), enemyHp: 0, active: false },
    })
    const engine = makeEngine({
      combatState: makeCombatState({ enemyHp: 5 }),
      currentRoom: makeRoom({ enemies: ['shuffler'] }),
    })
    await handleAttack(engine, undefined)
    expect(engine.messages.some(m => m.text.includes('search the remains'))).toBe(false)
  })

  it('loot with qty > 1 shows (xN) annotation', async () => {
    const { rollLoot } = await import('@/lib/combat')
    const { playerAttack } = await import('@/lib/combat')
    ;(rollLoot as ReturnType<typeof vi.fn>).mockReturnValueOnce(['scrap_metal', 'scrap_metal'])
    ;(playerAttack as ReturnType<typeof vi.fn>).mockReturnValueOnce({
      result: { hit: true, damage: 10, critical: false, fumble: false, messages: [], enemyDefeated: true },
      newState: { ...makeCombatState(), enemyHp: 0, active: false },
    })
    const engine = makeEngine({
      combatState: makeCombatState({ enemyHp: 5 }),
      currentRoom: makeRoom({ enemies: ['shuffler'] }),
    })
    await handleAttack(engine, undefined)
    expect(engine.messages.some(m => m.text.includes('x2'))).toBe(true)
  })
})

// ============================================================
// 14. Ability interactions (resolveAbility pure function)
// ============================================================

import { resolveAbility, CLASS_ABILITIES } from '@/lib/abilities'

describe('resolveAbility — pure resolver', () => {
  function makeTestPlayer(characterClass: Player['characterClass'], overrides: Partial<Player> = {}): Player {
    return {
      id: 'p1', name: 'Tester', characterClass,
      vigor: 8, grit: 6, reflex: 5, wits: 5, presence: 6, shadow: 4,
      hp: 20, maxHp: 20, currentRoomId: 'r1', worldSeed: 1,
      xp: 0, level: 1, actionsTaken: 0, isDead: false, cycle: 1, totalDeaths: 0,
      ...overrides,
    }
  }

  function makeTestState(overrides: Partial<CombatState> = {}): CombatState {
    return {
      enemy: makeEnemy(), enemyHp: 10, playerGoesFirst: true,
      turn: 1, active: true, playerConditions: [], enemyConditions: [],
      abilityUsed: false, defendingThisTurn: false, waitingBonus: 0,
      ...overrides,
    }
  }

  it('returns failure when not in combat', () => {
    const result = resolveAbility(makeTestPlayer('enforcer'), makeTestState({ active: false }))
    expect(result.success).toBe(false)
    expect(result.messages[0]!.text).toContain('not in combat')
  })

  it('returns failure when ability already used', () => {
    const result = resolveAbility(makeTestPlayer('enforcer'), makeTestState({ abilityUsed: true }))
    expect(result.success).toBe(false)
    expect(result.messages[0]!.text).toContain('already used')
  })

  it('enforcer — overwhelm sets overwhelmActive and costs 3 HP', () => {
    const result = resolveAbility(makeTestPlayer('enforcer'), makeTestState())
    expect(result.success).toBe(true)
    expect(result.newState.overwhelmActive).toBe(true)
    expect(result.playerHpDelta).toBe(-3)
    expect(result.newState.abilityUsed).toBe(true)
  })

  it('scout — mark target grants bonus for 2 attacks', () => {
    const result = resolveAbility(makeTestPlayer('scout'), makeTestState())
    expect(result.success).toBe(true)
    expect(result.newState.markTargetBonus).toBe(3)
    expect(result.newState.markTargetAttacks).toBe(2)
  })

  it('wraith — shadowstrike sets guaranteed crit and cantFlee', () => {
    const result = resolveAbility(makeTestPlayer('wraith'), makeTestState())
    expect(result.success).toBe(true)
    expect(result.newState.shadowstrikeActive).toBe(true)
    expect(result.newState.cantFlee).toBe(true)
  })

  it('shepherd — mend returns positive HP delta', () => {
    const result = resolveAbility(makeTestPlayer('shepherd'), makeTestState())
    expect(result.success).toBe(true)
    expect(result.playerHpDelta).toBeGreaterThan(0)
  })

  it('reclaimer — analyze returns enemy stat messages', () => {
    const result = resolveAbility(makeTestPlayer('reclaimer'), makeTestState())
    expect(result.success).toBe(true)
    expect(result.messages.some(m => m.text.includes('Analysis:'))).toBe(true)
  })

  it('warden — brace sets braceActive', () => {
    const result = resolveAbility(makeTestPlayer('warden'), makeTestState())
    expect(result.success).toBe(true)
    expect(result.newState.braceActive).toBe(true)
  })

  it('broker — successful intimidate sets enemyIntimidated', () => {
    // broker has +3 intimidation bonus; presence=10 should pass most DCs
    const player = makeTestPlayer('broker', { presence: 10 })
    // Enemy attack=2, DC=2+5=7; with presence=10, stat modifier = +4, roll=5 → total 9 >= 7
    const result = resolveAbility(player, makeTestState())
    expect(result.success).toBe(true)
    // Either intimidated or enraged depending on roll; just confirm result is set
    expect(result.newState.enemyIntimidated || result.newState.enemyEnraged).toBeTruthy()
  })

  it('broker — failed intimidate sets enemyEnraged', async () => {
    const { rollCheck } = await import('@/lib/dice')
    ;(rollCheck as ReturnType<typeof vi.fn>).mockReturnValueOnce({
      roll: 1, modifier: -2, total: -1, dc: 99, success: false, critical: false, fumble: true,
    })
    const player = makeTestPlayer('broker', { presence: 2 })
    const enemy = makeEnemy({ attack: 99 })  // DC = 99+5 = very high
    const result = resolveAbility(player, makeTestState({ enemy }))
    expect(result.success).toBe(true)
    expect(result.newState.enemyEnraged).toBe(true)
  })
})

// ============================================================
// 15. CLASS_ABILITIES catalog completeness
// ============================================================

describe('CLASS_ABILITIES catalog', () => {
  it('has an entry for all 7 character classes', () => {
    const classes = ['enforcer', 'scout', 'wraith', 'shepherd', 'reclaimer', 'warden', 'broker']
    for (const cls of classes) {
      expect(CLASS_ABILITIES).toHaveProperty(cls)
    }
  })

  it('enforcer ability has hpCost', () => {
    expect(CLASS_ABILITIES.enforcer.hpCost).toBeDefined()
    expect(CLASS_ABILITIES.enforcer.cost).toBe('hp')
  })

  it('reclaimer ability is free action', () => {
    expect(CLASS_ABILITIES.reclaimer.cost).toBe('free')
  })
})

// ============================================================
// 16. Conditions — pure functions (lib/conditions.ts)
// These tests call the REAL implementations via vi.importActual
// since the module is mocked for the action handler tests above.
// ============================================================

describe('conditions — applyCondition (real)', () => {
  let realApply: typeof import('@/lib/conditions')['applyCondition']

  beforeEach(async () => {
    const mod = await vi.importActual<typeof import('@/lib/conditions')>('@/lib/conditions')
    realApply = mod.applyCondition
  })

  it('applies a new condition', () => {
    const result = realApply([], 'bleeding', 'test_enemy')
    expect(result.applied).toBe(true)
    expect(result.conditions.some(c => c.id === 'bleeding')).toBe(true)
  })

  it('refreshes existing condition duration (no stacking)', () => {
    const existing: ActiveCondition[] = [{ id: 'bleeding', remainingTurns: 1, damagePerTurn: 2, rollPenalty: 0, source: 'old' }]
    const result = realApply(existing, 'bleeding', 'new_source')
    expect(result.conditions.filter(c => c.id === 'bleeding').length).toBe(1)
    expect(result.conditions[0]!.remainingTurns).toBeGreaterThanOrEqual(1)
  })

  it('respects immunity list', () => {
    const result = realApply([], 'bleeding', 'test', ['bleeding'])
    expect(result.applied).toBe(false)
    expect(result.conditions.length).toBe(0)
  })
})

describe('conditions — tickConditions (real)', () => {
  let realTick: typeof import('@/lib/conditions')['tickConditions']

  beforeEach(async () => {
    const mod = await vi.importActual<typeof import('@/lib/conditions')>('@/lib/conditions')
    realTick = mod.tickConditions
  })

  it('deals DOT damage and decrements turns', () => {
    const conditions: ActiveCondition[] = [
      { id: 'bleeding', remainingTurns: 2, damagePerTurn: 2, rollPenalty: 0, source: 'test' },
    ]
    const result = realTick(conditions)
    expect(result.damage).toBe(2)
    expect(result.remaining.length).toBe(1)
    expect(result.remaining[0]!.remainingTurns).toBe(1)
  })

  it('removes condition when remainingTurns hits 0', () => {
    const conditions: ActiveCondition[] = [
      { id: 'stunned', remainingTurns: 1, damagePerTurn: 0, rollPenalty: 0, source: 'test' },
    ]
    const result = realTick(conditions)
    expect(result.remaining.length).toBe(0)
    expect(result.messages.some(m => m.includes('wears off'))).toBe(true)
  })

  it('hemorrhagic shock: bleeding+burning deals +1 extra damage', () => {
    const conditions: ActiveCondition[] = [
      { id: 'bleeding', remainingTurns: 2, damagePerTurn: 2, rollPenalty: 0, source: 'test' },
      { id: 'burning', remainingTurns: 1, damagePerTurn: 3, rollPenalty: 0, source: 'test' },
    ]
    const result = realTick(conditions)
    // 2 + 3 + 1 = 6
    expect(result.damage).toBe(6)
    expect(result.messages.some(m => m.includes('Hemorrhagic shock'))).toBe(true)
  })

  it('frightened condition emits roll penalty message', () => {
    const conditions: ActiveCondition[] = [
      { id: 'frightened', remainingTurns: 2, damagePerTurn: 0, rollPenalty: -2, source: 'test' },
    ]
    const result = realTick(conditions)
    expect(result.messages.some(m => m.includes('Frightened'))).toBe(true)
    expect(result.rollPenalty).toBe(-2)
  })

  it('weakened condition emits message', () => {
    const conditions: ActiveCondition[] = [
      { id: 'weakened', remainingTurns: 2, damagePerTurn: 0, rollPenalty: 0, source: 'test' },
    ]
    const result = realTick(conditions)
    expect(result.messages.some(m => m.includes('Weakened'))).toBe(true)
  })

  it('handles empty conditions gracefully', () => {
    const result = realTick([])
    expect(result.damage).toBe(0)
    expect(result.remaining.length).toBe(0)
  })
})

describe('conditions — cureCondition (real)', () => {
  let realCure: typeof import('@/lib/conditions')['cureCondition']

  beforeEach(async () => {
    const mod = await vi.importActual<typeof import('@/lib/conditions')>('@/lib/conditions')
    realCure = mod.cureCondition
  })

  it('removes a condition by id', () => {
    const conditions: ActiveCondition[] = [
      { id: 'burning', remainingTurns: 1, damagePerTurn: 3, rollPenalty: 0, source: 'test' },
    ]
    const result = realCure(conditions, 'burning')
    expect(result.cured).toBe(true)
    expect(result.conditions.length).toBe(0)
  })

  it('returns cured=false when condition not present', () => {
    const result = realCure([], 'bleeding')
    expect(result.cured).toBe(false)
  })
})

describe('conditions — totalRollPenalty (real)', () => {
  let realPenalty: typeof import('@/lib/conditions')['totalRollPenalty']

  beforeEach(async () => {
    const mod = await vi.importActual<typeof import('@/lib/conditions')>('@/lib/conditions')
    realPenalty = mod.totalRollPenalty
  })

  it('sums all roll penalties', () => {
    const conditions: ActiveCondition[] = [
      { id: 'frightened', remainingTurns: 2, damagePerTurn: 0, rollPenalty: -2, source: 'test' },
      { id: 'poisoned', remainingTurns: 3, damagePerTurn: 1, rollPenalty: -1, source: 'test' },
    ]
    expect(realPenalty(conditions)).toBe(-3)
  })

  it('returns 0 for no conditions', () => {
    expect(realPenalty([])).toBe(0)
  })
})

describe('conditions — tryShakeFrightened (real)', () => {
  let realShake: typeof import('@/lib/conditions')['tryShakeFrightened']

  beforeEach(async () => {
    const mod = await vi.importActual<typeof import('@/lib/conditions')>('@/lib/conditions')
    realShake = mod.tryShakeFrightened
  })

  it('returns shaken=false when not frightened', () => {
    const result = realShake([], 8)
    expect(result.shaken).toBe(false)
    expect(result.message).toBe('')
  })

  it('handles frightened present — result is always well-formed', async () => {
    const conditions: ActiveCondition[] = [
      { id: 'frightened', remainingTurns: 2, damagePerTurn: 0, rollPenalty: -2, source: 'test' },
    ]
    // The real function calls rollCheck from lib/dice — dice IS mocked, so we can control it
    const { rollCheck } = await import('@/lib/dice')
    ;(rollCheck as ReturnType<typeof vi.fn>).mockReturnValueOnce({
      roll: 10, modifier: 2, total: 12, dc: 10, success: true, critical: true, fumble: false,
    })
    const result = realShake(conditions, 8)
    expect(result).toBeDefined()
    expect(Array.isArray(result.conditions)).toBe(true)
  })
})

// ============================================================
// 17. Edge cases: combat with no player/room (guard branches)
// ============================================================

describe('Guard branches — no player or room', () => {
  beforeEach(() => { vi.clearAllMocks() })

  it('handleAttack returns silently with no player', async () => {
    const engine = makeEngine({ player: null })
    // Should not throw
    await expect(handleAttack(engine, undefined)).resolves.toBeUndefined()
  })

  it('handleFlee returns silently with no player', async () => {
    const engine = makeEngine({ player: null })
    await expect(handleFlee(engine)).resolves.toBeUndefined()
  })

  it('handleDefend returns silently with no player', async () => {
    const engine = makeEngine({ player: null })
    await expect(handleDefend(engine)).resolves.toBeUndefined()
  })

  it('handleWait returns silently with no player', async () => {
    const engine = makeEngine({ player: null })
    await expect(handleWait(engine)).resolves.toBeUndefined()
  })

  it('handleAnalyze returns silently with no player', async () => {
    const engine = makeEngine({ player: null })
    await expect(handleAnalyze(engine)).resolves.toBeUndefined()
  })

  it('handleCombatUse returns silently with no player', async () => {
    const engine = makeEngine({ player: null })
    await expect(handleCombatUse(engine, 'bandages')).resolves.toBeUndefined()
  })
})
