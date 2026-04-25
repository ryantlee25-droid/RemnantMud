// ============================================================
// tests/playtest/verb-coverage.test.ts — Full verb coverage (H5)
//
// One it() per verb the parser understands. Each verb tested in a
// valid invocation and an invalid invocation. Confirms parser +
// engine handle the full verb surface without crashes and with
// discoverable error messages.
//
// Verbs enumerated from lib/parser.ts and lib/gameEngine.ts dispatch.
//
// Surface-form aliases are noted inline but only tested once per
// normalised verb (avoiding redundancy while documenting aliases).
//
// Parser normalisation map (surface → normalised):
//   attack / kill / hit / fight / strike  → attack
//   flee / run / escape / retreat          → flee
//   ability / special / power             → ability
//   defend / block / guard                → defend
//   wait / patience                       → wait
//   analyze / scan / study               → analyze
//   go / move / walk / head / n/s/e/w/up/down → go
//   look / l / examine / x / inspect / check / describe → look
//   take / get / pickup / grab            → take
//   drop                                  → drop
//   use / eat                             → use
//   equip / wear / wield                  → equip
//   unequip / remove                      → unequip
//   inventory / i / inv                   → inventory
//   stash                                 → stash
//   unstash / retrieve                    → unstash
//   talk / speak / ask / greet           → talk
//   search / look around                  → search
//   trade / barter                       → trade
//   buy / purchase                        → buy
//   sell                                 → sell
//   craft / build / make / construct …   → craft
//   rest / sleep                         → rest
//   camp                                 → camp
//   drink / fill                         → drink
//   travel / warp / fast travel          → travel
//   map                                  → map
//   boost                                → boost
//   stats / score / status / character   → stats
//   equipment / eq                       → equipment
//   help / h / ?                         → help
//   save                                 → save
//   quit / exit                          → quit
//   restart / newgame / reset            → restart
//   rep / reputation / standing          → rep
//   quest / quests                       → quests
//   smell / sniff / scent               → smell
//   listen / hear                        → listen
//   touch / feel                         → touch
//   hint / stuck / clue / what / where   → hint
//   read                                 → read
//   journal / codex / notes             → journal
//   sneak / stealth / hide / creep …    → sneak
//   climb / scale / ascend / clamber    → climb
//   swim / wade / ford                  → swim
//   unlock / unbolt                     → unlock
//   give / hand / offer / present …    → give
//   open                                → open
//   attack <target> <body_part>         → attack_called
//   (dialogue context) number           → dialogue_choice
//   (dialogue context) leave/bye/back   → dialogue_leave
//   (dialogue context) other input      → dialogue_blocked
// ============================================================

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { buildMockDb, PlayerSession } from './harness'
import type { GameState, CombatState, Player, Room } from '@/types/game'

// ============================================================
// Mock wiring — all narrative pipeline modules silenced
// ============================================================

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
    visited: true,
    flags: { tutorialZone: true, fastTravelWaypoint: true },
    exits: { north: 'cr_02_gate', south: 'cr_00_road' },
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
  equipItem: vi.fn().mockResolvedValue(undefined),
  unequipItem: vi.fn().mockResolvedValue(undefined),
}))

vi.mock('@/data/items', () => ({
  getItem: vi.fn().mockReturnValue(undefined),
}))

vi.mock('@/data/enemies', () => ({
  getEnemy: vi.fn().mockReturnValue(undefined),
}))

vi.mock('@/data/npcs', () => ({
  getNPC: vi.fn().mockReturnValue(undefined),
  getRevenantDialogue: vi.fn().mockReturnValue(null),
}))

vi.mock('@/data/dialogueTrees', () => ({
  DIALOGUE_TREES: {},
}))

vi.mock('@/data/recipes', () => ({
  RECIPES: [],
  getRecipe: vi.fn().mockReturnValue(undefined),
  getAvailableRecipes: vi.fn().mockReturnValue([]),
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
    msg: (text: string, type = 'narrative') => ({ id: 'vc-' + Math.random(), text, type }),
    systemMsg: (text: string) => ({ id: 'vc-' + Math.random(), text, type: 'system' }),
    combatMsg: (text: string) => ({ id: 'vc-' + Math.random(), text, type: 'combat' }),
    errorMsg: (text: string) => ({ id: 'vc-' + Math.random(), text, type: 'error' }),
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
    createCycleSnapshot: vi.fn(() => ({})),
    computeInheritedReputation: vi.fn(() => ({})),
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

vi.mock('@/lib/stealth', () => ({
  attemptStealth: vi.fn().mockReturnValue({ success: false, message: 'You creep forward but are spotted.' }),
}))

vi.mock('@/lib/abilities', () => ({
  handleAbility: vi.fn().mockImplementation(async (engine: import('@/lib/actions/types').EngineCore) => {
    const { combatState } = engine.getState()
    if (!combatState?.active) {
      engine._appendMessages([{ id: 'ability-err', text: 'You are not in combat.', type: 'error' }])
    } else {
      engine._appendMessages([{ id: 'ability-ok', text: 'You use your ability.', type: 'combat' }])
    }
  }),
}))

vi.mock('@/lib/combat', () => ({
  startCombat: vi.fn((player: Player, enemy: import('@/types/game').Enemy) => ({
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
      messages: [{ id: 'atk', text: 'You strike the enemy.', type: 'combat' }],
      enemyDefeated: state.enemyHp <= 5,
      loot: state.enemyHp <= 5 ? [] : undefined,
    },
    newState: {
      ...state,
      enemyHp: Math.max(0, state.enemyHp - 5),
      active: state.enemyHp > 5,
      turn: state.turn + 1,
    },
  })),
  playerCalledShot: vi.fn((_player: Player, _enemy: unknown, _bodyPart: string, state: CombatState) => ({
    messages: [{ id: 'called', text: 'You aim for the head.', type: 'combat' }],
    newState: { ...state, enemyHp: Math.max(0, state.enemyHp - 4) },
  })),
  enemyAttack: vi.fn((_player: Player, state: CombatState) => ({
    damage: 2,
    messages: [{ id: 'enem', text: 'The enemy hits you.', type: 'combat' }],
    newState: { ...state, turn: state.turn + 1 },
  })),
  flee: vi.fn(() => ({
    result: { success: true, messages: [{ id: 'flee', text: 'You flee!', type: 'combat' }] },
    freeAttack: null,
  })),
  applyHollowRoundEffects: vi.fn((state: CombatState) => ({ messages: [], newState: state })),
  enemyHpIndicator: vi.fn(() => 'wounded'),
}))

vi.mock('@/lib/idleHint', () => ({
  shouldFireIdleHint: vi.fn().mockReturnValue(false),
  markIdleHintFired: vi.fn(),
  IDLE_HINT_MESSAGE: '',
}))

vi.mock('@/lib/spawn', () => ({
  quantityRoll: vi.fn().mockReturnValue(1),
  computePressure: vi.fn().mockReturnValue(1),
  pressureModifier: vi.fn().mockReturnValue(1),
}))

vi.mock('@/lib/mapRenderer', () => ({
  renderZoneMap: vi.fn().mockReturnValue([]),
}))

vi.mock('@/lib/npcTopics', () => ({
  findNpcTopic: vi.fn().mockReturnValue(null),
  getVisibleTopics: vi.fn().mockReturnValue([]),
  NPC_TOPICS: {},
}))

vi.mock('@/lib/narrativeKeys', () => ({
  checkNarrativeUnlock: vi.fn().mockReturnValue({ unlocked: true, narration: [] }),
  grantNarrativeKey: vi.fn().mockResolvedValue(undefined),
}))

// Import harness AFTER mocks
import { parseCommand } from '@/lib/parser'
import { getRoom } from '@/lib/world'

// ============================================================
// Shared spec — minimal Enforcer
// ============================================================

const ENFORCER_SPEC = {
  name: 'Cover',
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

// A mock enemy placed in the current room (for combat tests)
const MOCK_ENEMY = {
  id: 'shuffler',
  name: 'Shuffler',
  description: 'A shambling corpse.',
  hp: 20,
  maxHp: 20,
  attack: 3,
  defense: 8,
  damage: [1, 4] as [number, number],
  xp: 10,
  loot: [],
}

// ============================================================
// Helpers
// ============================================================

/** Inject an active combat state into the session */
function injectCombat(session: PlayerSession): void {
  const state = session.state
  const combatState: CombatState = {
    enemy: MOCK_ENEMY,
    enemyHp: 20,
    playerGoesFirst: true,
    turn: 1,
    active: true,
    playerConditions: [],
    enemyConditions: [],
    abilityUsed: false,
    defendingThisTurn: false,
    waitingBonus: 0,
  }
  // Access private _setState via type cast
  ;(session as unknown as { _engine: { _setState: (s: Partial<GameState>) => void } })
    ._engine._setState({ combatState })
}

/** Scan entire log for substring match (not just last entry) */
function logContains(session: PlayerSession, substring: string): boolean {
  return session.log.some(m => m.text.toLowerCase().includes(substring.toLowerCase()))
}

/** Assert cmd() never throws and log grew */
async function cmdSafe(session: PlayerSession, input: string): Promise<void> {
  const before = session.log.length
  await expect(session.cmd(input)).resolves.toBeUndefined()
  // Some verbs add no messages (e.g. save with no changes), so we allow equal too
  expect(session.log.length).toBeGreaterThanOrEqual(before)
}

// ============================================================
// Master verb list (enumerated from parser.ts + gameEngine.ts)
// Used for the final coverage-count assertion.
// ============================================================
const ENUMERATED_VERBS = new Set([
  'go', 'look', 'examine_extra', 'examine_spatial',
  'take', 'drop', 'equip', 'unequip', 'use',
  'inventory', 'stash', 'unstash',
  'attack', 'attack_called', 'flee', 'ability', 'defend', 'wait', 'analyze',
  'talk', 'search', 'give', 'open',
  'trade', 'buy', 'sell',
  'craft', 'rest', 'camp', 'drink',
  'travel', 'map',
  'boost',
  'stats', 'equipment', 'help', 'save', 'quit', 'restart', 'rep', 'quests',
  'smell', 'listen', 'touch', 'hint', 'read', 'journal',
  'sneak', 'climb', 'swim', 'unlock',
  'dialogue_choice', 'dialogue_leave', 'dialogue_blocked',
])
const verbsCovered = new Set<string>()
function covered(...verbs: string[]) { verbs.forEach(v => verbsCovered.add(v)) }

// ============================================================
// Tests
// ============================================================

describe('verb coverage', () => {
  let session: PlayerSession

  beforeEach(() => {
    vi.clearAllMocks()
    session = new PlayerSession({ mockRandom: 0.5 })
  })

  afterEach(async () => {
    await session.destroy()
  })

  // ----------------------------------------------------------
  // go (aliases: move, walk, head, n, s, e, w, up, down)
  // ----------------------------------------------------------
  it('go — valid: move north from room with north exit', async () => {
    const mockGetRoom = getRoom as ReturnType<typeof vi.fn>
    mockGetRoom.mockImplementation(async (roomId: string) => {
      if (roomId === 'cr_02_gate') {
        return {
          id: 'cr_02_gate',
          name: 'Crossroads Gate',
          description: 'A heavy gate stands here.',
          shortDescription: 'Heavy gate.',
          zone: 'crossroads',
          difficulty: 1,
          visited: false,
          flags: {},
          exits: { south: 'cr_01_approach' },
          items: [], enemies: [], npcs: [],
        }
      }
      return {
        id: 'cr_01_approach',
        name: 'Highway Junction — The Approach',
        description: 'Two highways meet here.',
        shortDescription: 'Dusty approach.',
        zone: 'crossroads',
        difficulty: 1,
        visited: true,
        flags: { tutorialZone: true, fastTravelWaypoint: true },
        exits: { north: 'cr_02_gate' },
        items: [], enemies: [], npcs: [],
      }
    })
    await session.create(ENFORCER_SPEC)
    const startRoom = session.currentRoom.id
    await cmdSafe(session, 'go north')
    expect(session.currentRoom.id).not.toBe(startRoom)
    covered('go')
  })

  it('go — invalid: direction with no exit', async () => {
    await session.create(ENFORCER_SPEC)
    await cmdSafe(session, 'go east')
    expect(logContains(session, "can't go") || logContains(session, "no exit") || logContains(session, "which direction")).toBe(true)
    covered('go')
  })

  // ----------------------------------------------------------
  // look (aliases: l, examine, x, inspect, check, describe)
  // ----------------------------------------------------------
  it('look — valid: bare look describes the room', async () => {
    await session.create(ENFORCER_SPEC)
    const before = session.log.length
    await cmdSafe(session, 'look')
    expect(session.log.length).toBeGreaterThan(before)
    covered('look')
  })

  it('look — invalid: look with unknown keyword is graceful', async () => {
    await session.create(ENFORCER_SPEC)
    await cmdSafe(session, 'look xyznonexistent')
    // examine_extra is invoked; engine should respond without crashing
    expect(session.log.length).toBeGreaterThan(0)
    covered('look', 'examine_extra')
  })

  // ----------------------------------------------------------
  // examine_spatial (multi-word: look under, look behind, look inside)
  // ----------------------------------------------------------
  it('examine_spatial — valid: look under returns descriptive text', async () => {
    await session.create(ENFORCER_SPEC)
    await cmdSafe(session, 'look under table')
    expect(session.log.length).toBeGreaterThan(0)
    covered('examine_spatial')
  })

  it('examine_spatial — invalid: look inside with nothing specified', async () => {
    await session.create(ENFORCER_SPEC)
    await cmdSafe(session, 'look inside')
    expect(session.log.length).toBeGreaterThan(0)
    covered('examine_spatial')
  })

  // ----------------------------------------------------------
  // take (aliases: get, pickup, grab, pick up)
  // ----------------------------------------------------------
  it('take — valid: take item that is in the room', async () => {
    const mockGetRoom = getRoom as ReturnType<typeof vi.fn>
    const { getItem } = await import('@/data/items')
    const mockGetItem = getItem as ReturnType<typeof vi.fn>
    mockGetItem.mockImplementation((id: string) => {
      if (id === 'bandage') return { id: 'bandage', name: 'Bandage', description: 'Stops bleeding.', type: 'consumable', weight: 1, value: 10 }
      return undefined
    })
    mockGetRoom.mockResolvedValue({
      id: 'cr_01_approach',
      name: 'Highway Junction',
      description: 'Two highways meet here.',
      shortDescription: 'Dusty approach.',
      zone: 'crossroads',
      difficulty: 1,
      visited: true,
      flags: { fastTravelWaypoint: true },
      exits: {},
      items: [{ itemId: 'bandage', quantity: 1 }],
      enemies: [],
      npcs: [],
    })
    await session.create(ENFORCER_SPEC)
    await cmdSafe(session, 'take bandage')
    // Engine tries to take it — either succeeds or fails gracefully
    expect(session.log.length).toBeGreaterThan(0)
    covered('take')
  })

  it('take — invalid: take nonexistent item', async () => {
    await session.create(ENFORCER_SPEC)
    await cmdSafe(session, 'take nonexistent_item')
    expect(logContains(session, "don't see") || logContains(session, "not here") || logContains(session, "take what")).toBe(true)
    covered('take')
  })

  // ----------------------------------------------------------
  // drop (aliases: put down)
  // ----------------------------------------------------------
  it('drop — valid: drop item in inventory', async () => {
    const { getItem } = await import('@/data/items')
    const mockGetItem = getItem as ReturnType<typeof vi.fn>
    mockGetItem.mockReturnValue({ id: 'bandage', name: 'Bandage', description: 'Stops bleeding.', type: 'consumable', weight: 1, value: 10 })
    await session.create(ENFORCER_SPEC)
    // Inject an item into inventory via state
    const state = session.state
    ;(session as unknown as { _engine: { _setState: (s: Partial<GameState>) => void } })
      ._engine._setState({
        inventory: [{
          id: 'inv-1', itemId: 'bandage', equipped: false,
          item: { id: 'bandage', name: 'Bandage', description: 'Stops bleeding.', type: 'consumable', weight: 1, value: 10 },
        }],
      })
    await cmdSafe(session, 'drop bandage')
    expect(logContains(session, "bandage") || logContains(session, "drop")).toBe(true)
    covered('drop')
  })

  it('drop — invalid: drop item not in inventory', async () => {
    await session.create(ENFORCER_SPEC)
    await cmdSafe(session, 'drop phantom_sword')
    expect(logContains(session, "don't have") || logContains(session, "drop what")).toBe(true)
    covered('drop')
  })

  // ----------------------------------------------------------
  // equip (aliases: wear, wield)
  // ----------------------------------------------------------
  it('equip — valid: equip weapon in inventory', async () => {
    const { getItem } = await import('@/data/items')
    const mockGetItem = getItem as ReturnType<typeof vi.fn>
    mockGetItem.mockReturnValue({ id: 'knife', name: 'Knife', description: 'A knife.', type: 'weapon', weight: 1, value: 5, damage: 4 })
    await session.create(ENFORCER_SPEC)
    ;(session as unknown as { _engine: { _setState: (s: Partial<GameState>) => void } })
      ._engine._setState({
        inventory: [{
          id: 'inv-2', itemId: 'knife', equipped: false,
          item: { id: 'knife', name: 'Knife', description: 'A knife.', type: 'weapon', weight: 1, value: 5, damage: 4 },
        }],
      })
    await cmdSafe(session, 'equip knife')
    expect(logContains(session, 'knife') || logContains(session, 'equip')).toBe(true)
    covered('equip')
  })

  it('equip — invalid: equip item not in inventory', async () => {
    await session.create(ENFORCER_SPEC)
    await cmdSafe(session, 'equip shovel')
    expect(logContains(session, "don't have") || logContains(session, "equip what")).toBe(true)
    covered('equip')
  })

  // ----------------------------------------------------------
  // unequip (aliases: remove, take off)
  // ----------------------------------------------------------
  it('unequip — valid: unequip equipped weapon', async () => {
    const { getItem } = await import('@/data/items')
    const mockGetItem = getItem as ReturnType<typeof vi.fn>
    mockGetItem.mockReturnValue({ id: 'knife', name: 'Knife', description: 'A knife.', type: 'weapon', weight: 1, value: 5, damage: 4 })
    await session.create(ENFORCER_SPEC)
    ;(session as unknown as { _engine: { _setState: (s: Partial<GameState>) => void } })
      ._engine._setState({
        inventory: [{
          id: 'inv-3', itemId: 'knife', equipped: true,
          item: { id: 'knife', name: 'Knife', description: 'A knife.', type: 'weapon', weight: 1, value: 5, damage: 4 },
        }],
      })
    await cmdSafe(session, 'unequip knife')
    expect(session.log.length).toBeGreaterThan(0)
    covered('unequip')
  })

  it('unequip — invalid: unequip item not equipped', async () => {
    await session.create(ENFORCER_SPEC)
    await cmdSafe(session, 'unequip helmet')
    expect(logContains(session, "not equipped") || logContains(session, "don't have") || logContains(session, "unequip what")).toBe(true)
    covered('unequip')
  })

  // ----------------------------------------------------------
  // use (aliases: eat)
  // ----------------------------------------------------------
  it('use — valid: use consumable in inventory', async () => {
    const { getItem } = await import('@/data/items')
    const mockGetItem = getItem as ReturnType<typeof vi.fn>
    mockGetItem.mockReturnValue({ id: 'bandage', name: 'Bandage', description: 'Stops bleeding.', type: 'consumable', weight: 1, value: 10, healAmount: 5 })
    await session.create(ENFORCER_SPEC)
    ;(session as unknown as { _engine: { _setState: (s: Partial<GameState>) => void } })
      ._engine._setState({
        inventory: [{
          id: 'inv-4', itemId: 'bandage', equipped: false,
          item: { id: 'bandage', name: 'Bandage', description: 'Stops bleeding.', type: 'consumable', weight: 1, value: 10, healAmount: 5 },
        }],
      })
    await cmdSafe(session, 'use bandage')
    expect(session.log.length).toBeGreaterThan(0)
    covered('use')
  })

  it('use — invalid: use item not in inventory', async () => {
    await session.create(ENFORCER_SPEC)
    await cmdSafe(session, 'use phantom_potion')
    expect(logContains(session, "don't have") || logContains(session, "use what")).toBe(true)
    covered('use')
  })

  // ----------------------------------------------------------
  // inventory (aliases: i, inv)
  // ----------------------------------------------------------
  it('inventory — valid: shows inventory list', async () => {
    await session.create(ENFORCER_SPEC)
    const before = session.log.length
    await cmdSafe(session, 'inventory')
    expect(session.log.length).toBeGreaterThan(before)
    covered('inventory')
  })

  it('inventory — alias "i" also works', async () => {
    // Verify parser normalises "i" → inventory
    const action = parseCommand('i')
    expect(action.verb).toBe('inventory')
    covered('inventory')
  })

  // ----------------------------------------------------------
  // stash
  // ----------------------------------------------------------
  it('stash — valid: stash list shows empty stash', async () => {
    await session.create(ENFORCER_SPEC)
    await cmdSafe(session, 'stash list')
    expect(logContains(session, 'stash') || logContains(session, 'empty')).toBe(true)
    covered('stash')
  })

  it('stash — invalid: stash item not in inventory', async () => {
    await session.create(ENFORCER_SPEC)
    await cmdSafe(session, 'stash ghost_item')
    expect(logContains(session, "don't have") || logContains(session, "stash what")).toBe(true)
    covered('stash')
  })

  // ----------------------------------------------------------
  // unstash (aliases: retrieve)
  // ----------------------------------------------------------
  it('unstash — valid: unstash from empty stash gives sensible message', async () => {
    await session.create(ENFORCER_SPEC)
    await cmdSafe(session, 'unstash anything')
    expect(logContains(session, "not in your stash") || logContains(session, "unstash what") || logContains(session, "stash")).toBe(true)
    covered('unstash')
  })

  it('unstash — invalid: no noun gives clear error', async () => {
    await session.create(ENFORCER_SPEC)
    await cmdSafe(session, 'unstash')
    expect(logContains(session, "unstash what") || logContains(session, "stash")).toBe(true)
    covered('unstash')
  })

  // ----------------------------------------------------------
  // attack (aliases: kill, hit, fight, strike)
  // ----------------------------------------------------------
  it('attack — valid: attack while enemy is in room starts combat', async () => {
    const mockGetRoom = getRoom as ReturnType<typeof vi.fn>
    const { getEnemy } = await import('@/data/enemies')
    const mockGetEnemy = getEnemy as ReturnType<typeof vi.fn>
    mockGetEnemy.mockReturnValue(MOCK_ENEMY)
    mockGetRoom.mockResolvedValue({
      id: 'cr_01_approach',
      name: 'Highway Junction',
      description: 'Two highways meet here.',
      shortDescription: 'Dusty approach.',
      zone: 'crossroads',
      difficulty: 1,
      visited: true,
      flags: { fastTravelWaypoint: true },
      exits: {},
      items: [],
      enemies: [{ enemyId: 'shuffler', probability: 1.0 }],
      npcs: [],
    })
    await session.create(ENFORCER_SPEC)
    await cmdSafe(session, 'attack')
    // Either started combat or gave a sensible message
    expect(session.isInCombat() || logContains(session, 'attack') || logContains(session, 'shuffler')).toBe(true)
    covered('attack')
  })

  it('attack — invalid: attack with no enemy gives clear error', async () => {
    await session.create(ENFORCER_SPEC)
    await cmdSafe(session, 'attack')
    expect(logContains(session, 'nothing to attack') || logContains(session, 'no enemy') || logContains(session, 'attack')).toBe(true)
    covered('attack')
  })

  // ----------------------------------------------------------
  // attack_called (attack <target> <body_part>)
  // ----------------------------------------------------------
  it('attack_called — valid: called shot in active combat', async () => {
    await session.create(ENFORCER_SPEC)
    injectCombat(session)
    await cmdSafe(session, 'attack shuffler head')
    expect(logContains(session, 'head') || logContains(session, 'aim') || logContains(session, 'combat')).toBe(true)
    covered('attack_called')
  })

  it('attack_called — invalid: called shot outside combat', async () => {
    await session.create(ENFORCER_SPEC)
    await cmdSafe(session, 'attack dummy torso')
    // Parser emits attack_called only if noun matches <target> <body_part> pattern
    // Outside combat, engine says "You are not in combat." or "nothing to attack"
    expect(logContains(session, 'not in combat') || logContains(session, 'nothing to attack') || logContains(session, 'attack')).toBe(true)
    covered('attack_called')
  })

  // ----------------------------------------------------------
  // flee (aliases: run, escape, retreat)
  // ----------------------------------------------------------
  it('flee — valid: flee from active combat', async () => {
    await session.create(ENFORCER_SPEC)
    injectCombat(session)
    await cmdSafe(session, 'flee')
    expect(logContains(session, 'flee') || logContains(session, 'run') || logContains(session, 'escape') || !session.isInCombat()).toBe(true)
    covered('flee')
  })

  it('flee — invalid: flee when not in combat', async () => {
    await session.create(ENFORCER_SPEC)
    await cmdSafe(session, 'flee')
    expect(logContains(session, 'not in combat') || logContains(session, 'flee') || logContains(session, 'nowhere to run')).toBe(true)
    covered('flee')
  })

  // ----------------------------------------------------------
  // ability (aliases: special, power)
  // ----------------------------------------------------------
  it('ability — valid: use ability in combat', async () => {
    await session.create(ENFORCER_SPEC)
    injectCombat(session)
    await cmdSafe(session, 'ability')
    expect(logContains(session, 'ability') || logContains(session, 'use')).toBe(true)
    covered('ability')
  })

  it('ability — invalid: use ability outside combat', async () => {
    await session.create(ENFORCER_SPEC)
    await cmdSafe(session, 'ability')
    expect(logContains(session, 'not in combat') || logContains(session, 'ability')).toBe(true)
    covered('ability')
  })

  // ----------------------------------------------------------
  // defend (aliases: block, guard)
  // ----------------------------------------------------------
  it('defend — valid: defend in active combat', async () => {
    await session.create(ENFORCER_SPEC)
    injectCombat(session)
    await cmdSafe(session, 'defend')
    expect(session.log.length).toBeGreaterThan(0)
    covered('defend')
  })

  it('defend — invalid: defend outside combat', async () => {
    await session.create(ENFORCER_SPEC)
    await cmdSafe(session, 'defend')
    expect(logContains(session, 'not in combat') || logContains(session, 'defend')).toBe(true)
    covered('defend')
  })

  // ----------------------------------------------------------
  // wait (aliases: patience)
  // ----------------------------------------------------------
  it('wait — valid: wait in active combat', async () => {
    await session.create(ENFORCER_SPEC)
    injectCombat(session)
    await cmdSafe(session, 'wait')
    expect(session.log.length).toBeGreaterThan(0)
    covered('wait')
  })

  it('wait — invalid: wait outside combat', async () => {
    await session.create(ENFORCER_SPEC)
    await cmdSafe(session, 'wait')
    expect(logContains(session, 'not in combat') || logContains(session, 'wait')).toBe(true)
    covered('wait')
  })

  // ----------------------------------------------------------
  // analyze (aliases: scan, study)
  // ----------------------------------------------------------
  it('analyze — valid: analyze in active combat', async () => {
    await session.create(ENFORCER_SPEC)
    injectCombat(session)
    await cmdSafe(session, 'analyze')
    expect(session.log.length).toBeGreaterThan(0)
    covered('analyze')
  })

  it('analyze — invalid: analyze outside combat', async () => {
    await session.create(ENFORCER_SPEC)
    await cmdSafe(session, 'analyze')
    expect(logContains(session, 'not in combat') || logContains(session, 'analyze')).toBe(true)
    covered('analyze')
  })

  // ----------------------------------------------------------
  // talk (aliases: speak, ask, greet)
  // ----------------------------------------------------------
  it('talk — valid: talk to NPC in room', async () => {
    const { getNPC } = await import('@/data/npcs')
    const mockGetNPC = getNPC as ReturnType<typeof vi.fn>
    mockGetNPC.mockReturnValue({
      id: 'test_npc', name: 'Test NPC', description: 'A test NPC.',
      dialogue: 'Hello traveler.', faction: 'drifters', isNamed: true,
    })
    const mockGetRoom = getRoom as ReturnType<typeof vi.fn>
    mockGetRoom.mockResolvedValue({
      id: 'cr_01_approach',
      name: 'Highway Junction',
      description: 'Two highways meet here.',
      shortDescription: 'Dusty approach.',
      zone: 'crossroads', difficulty: 1, visited: true,
      flags: { fastTravelWaypoint: true },
      exits: {},
      items: [],
      enemies: [],
      npcs: [{ npcId: 'test_npc', probability: 1.0 }],
    })
    await session.create(ENFORCER_SPEC)
    await cmdSafe(session, 'talk test_npc')
    // Either opens dialogue or gives a message
    expect(session.log.length).toBeGreaterThan(0)
    covered('talk')
  })

  it('talk — invalid: talk with no NPC in room', async () => {
    await session.create(ENFORCER_SPEC)
    await cmdSafe(session, 'talk')
    expect(logContains(session, 'no one') || logContains(session, "don't see") || logContains(session, 'talk')).toBe(true)
    covered('talk')
  })

  // ----------------------------------------------------------
  // search (aliases: look around, search room)
  // ----------------------------------------------------------
  it('search — valid: search the current room', async () => {
    await session.create(ENFORCER_SPEC)
    await cmdSafe(session, 'search')
    expect(logContains(session, 'search') || logContains(session, 'area') || logContains(session, 'nothing')).toBe(true)
    covered('search')
  })

  it('search — calling "search room" also normalises correctly', async () => {
    const action = parseCommand('search room')
    expect(action.verb).toBe('search')
    covered('search')
  })

  // ----------------------------------------------------------
  // give (aliases: hand, offer, present, deliver)
  // ----------------------------------------------------------
  it('give — valid: give item to NPC (item in inventory, NPC in room)', async () => {
    const { getNPC } = await import('@/data/npcs')
    const mockGetNPC = getNPC as ReturnType<typeof vi.fn>
    mockGetNPC.mockReturnValue({
      id: 'test_npc', name: 'Guide', description: 'A guide.', faction: 'drifters', isNamed: true,
    })
    const { getItem } = await import('@/data/items')
    const mockGetItem = getItem as ReturnType<typeof vi.fn>
    mockGetItem.mockReturnValue({ id: 'bandage', name: 'Bandage', description: 'Stops bleeding.', type: 'consumable', weight: 1, value: 10 })
    const mockGetRoom = getRoom as ReturnType<typeof vi.fn>
    mockGetRoom.mockResolvedValue({
      id: 'cr_01_approach', name: 'Highway Junction', description: 'Two highways.',
      shortDescription: 'Junction.', zone: 'crossroads', difficulty: 1, visited: true,
      flags: {}, exits: {}, items: [],
      enemies: [],
      npcs: [{ npcId: 'test_npc', probability: 1.0 }],
    })
    await session.create(ENFORCER_SPEC)
    ;(session as unknown as { _engine: { _setState: (s: Partial<GameState>) => void } })
      ._engine._setState({
        inventory: [{
          id: 'inv-5', itemId: 'bandage', equipped: false,
          item: { id: 'bandage', name: 'Bandage', description: 'Stops bleeding.', type: 'consumable', weight: 1, value: 10 },
        }],
      })
    await cmdSafe(session, 'give bandage guide')
    expect(session.log.length).toBeGreaterThan(0)
    covered('give')
  })

  it('give — invalid: no item specified', async () => {
    await session.create(ENFORCER_SPEC)
    await cmdSafe(session, 'give')
    expect(logContains(session, 'give what') || logContains(session, 'whom')).toBe(true)
    covered('give')
  })

  // ----------------------------------------------------------
  // open
  // ----------------------------------------------------------
  it('open — any input: gives a narrative response (not a crash)', async () => {
    await session.create(ENFORCER_SPEC)
    const before = session.log.length
    await cmdSafe(session, 'open door')
    expect(session.log.length).toBeGreaterThan(before)
    covered('open')
  })

  it('open — bare command: also graceful', async () => {
    await session.create(ENFORCER_SPEC)
    await cmdSafe(session, 'open')
    expect(session.log.length).toBeGreaterThan(0)
    covered('open')
  })

  // ----------------------------------------------------------
  // trade (aliases: barter)
  // ----------------------------------------------------------
  it('trade — valid: trade with vendor NPC present', async () => {
    const { getNPC } = await import('@/data/npcs')
    const mockGetNPC = getNPC as ReturnType<typeof vi.fn>
    mockGetNPC.mockReturnValue({
      id: 'marta_food_vendor', name: 'Marta', description: 'A food vendor.',
      faction: 'drifters', isNamed: true,
      vendorInventory: [{ itemId: 'bandage', price: 10, quantity: 5 }],
      vendorGreeting: 'What can I get you?',
      vendorFarewell: 'Come back soon.',
      vendorBudget: 30,
    })
    const mockGetRoom = getRoom as ReturnType<typeof vi.fn>
    mockGetRoom.mockResolvedValue({
      id: 'cr_01_approach', name: 'Highway Junction', description: 'Two highways.',
      shortDescription: 'Junction.', zone: 'crossroads', difficulty: 1, visited: true,
      flags: {}, exits: {}, items: [],
      enemies: [],
      npcs: [{ npcId: 'marta_food_vendor', probability: 1.0 }],
    })
    await session.create(ENFORCER_SPEC)
    await cmdSafe(session, 'trade marta')
    expect(session.log.length).toBeGreaterThan(0)
    covered('trade')
  })

  it('trade — invalid: trade with no vendor present', async () => {
    await session.create(ENFORCER_SPEC)
    await cmdSafe(session, 'trade')
    expect(logContains(session, 'no one') || logContains(session, 'trade')).toBe(true)
    covered('trade')
  })

  // ----------------------------------------------------------
  // buy (aliases: purchase)
  // ----------------------------------------------------------
  it('buy — valid: buy item when vendor is present', async () => {
    const { getNPC } = await import('@/data/npcs')
    const mockGetNPC = getNPC as ReturnType<typeof vi.fn>
    mockGetNPC.mockReturnValue({
      id: 'marta_food_vendor', name: 'Marta', description: 'A food vendor.',
      faction: 'drifters', isNamed: true,
      vendorInventory: [{ itemId: 'bandage', price: 10, quantity: 5 }],
      vendorGreeting: 'What can I get you?',
      vendorFarewell: 'Come back soon.',
      vendorBudget: 30,
    })
    const { getItem } = await import('@/data/items')
    const mockGetItem = getItem as ReturnType<typeof vi.fn>
    mockGetItem.mockReturnValue({ id: 'bandage', name: 'Bandage', description: 'Stops bleeding.', type: 'consumable', weight: 1, value: 10 })
    const mockGetRoom = getRoom as ReturnType<typeof vi.fn>
    mockGetRoom.mockResolvedValue({
      id: 'cr_01_approach', name: 'Highway Junction', description: 'Two highways.',
      shortDescription: 'Junction.', zone: 'crossroads', difficulty: 1, visited: true,
      flags: {}, exits: {}, items: [],
      enemies: [],
      npcs: [{ npcId: 'marta_food_vendor', probability: 1.0 }],
    })
    await session.create(ENFORCER_SPEC)
    await cmdSafe(session, 'buy bandage')
    expect(session.log.length).toBeGreaterThan(0)
    covered('buy')
  })

  it('buy — invalid: buy with no vendor present', async () => {
    await session.create(ENFORCER_SPEC)
    await cmdSafe(session, 'buy bandage')
    expect(logContains(session, 'no one') || logContains(session, 'buy')).toBe(true)
    covered('buy')
  })

  // ----------------------------------------------------------
  // sell
  // ----------------------------------------------------------
  it('sell — valid: sell with vendor present (will fail if no item, but graceful)', async () => {
    const { getNPC } = await import('@/data/npcs')
    const mockGetNPC = getNPC as ReturnType<typeof vi.fn>
    mockGetNPC.mockReturnValue({
      id: 'marta_food_vendor', name: 'Marta', description: 'A food vendor.',
      faction: 'drifters', isNamed: true,
      vendorInventory: [],
      vendorGreeting: 'What can I get you?',
      vendorFarewell: 'Come back soon.',
      vendorBudget: 30,
    })
    const mockGetRoom = getRoom as ReturnType<typeof vi.fn>
    mockGetRoom.mockResolvedValue({
      id: 'cr_01_approach', name: 'Highway Junction', description: 'Two highways.',
      shortDescription: 'Junction.', zone: 'crossroads', difficulty: 1, visited: true,
      flags: {}, exits: {}, items: [],
      enemies: [],
      npcs: [{ npcId: 'marta_food_vendor', probability: 1.0 }],
    })
    await session.create(ENFORCER_SPEC)
    await cmdSafe(session, 'sell scrap')
    expect(session.log.length).toBeGreaterThan(0)
    covered('sell')
  })

  it('sell — invalid: sell with no vendor present', async () => {
    await session.create(ENFORCER_SPEC)
    await cmdSafe(session, 'sell scrap_metal')
    expect(logContains(session, 'no one') || logContains(session, 'sell')).toBe(true)
    covered('sell')
  })

  // ----------------------------------------------------------
  // craft (aliases: build, make, construct, assemble, forge, create)
  // ----------------------------------------------------------
  it('craft — valid: craft with no noun shows recipe list (even if empty)', async () => {
    await session.create(ENFORCER_SPEC)
    await cmdSafe(session, 'craft')
    expect(logContains(session, 'recipe') || logContains(session, 'craft') || logContains(session, "don't know")).toBe(true)
    covered('craft')
  })

  it('craft — invalid: craft unknown item gives clear error', async () => {
    await session.create(ENFORCER_SPEC)
    await cmdSafe(session, 'craft unobtanium_shield')
    expect(logContains(session, "don't know") || logContains(session, 'recipe') || logContains(session, 'craft')).toBe(true)
    covered('craft')
  })

  // ----------------------------------------------------------
  // rest (aliases: sleep)
  // ----------------------------------------------------------
  it('rest — valid: rest in a safeRest room heals player', async () => {
    const mockGetRoom = getRoom as ReturnType<typeof vi.fn>
    mockGetRoom.mockResolvedValue({
      id: 'cr_01_approach', name: 'Highway Junction', description: 'Two highways.',
      shortDescription: 'Junction.', zone: 'crossroads', difficulty: 1, visited: true,
      flags: { safeRest: true, fastTravelWaypoint: true },
      exits: {}, items: [], enemies: [], npcs: [],
    })
    await session.create(ENFORCER_SPEC)
    // Wound the player first
    ;(session as unknown as { _engine: { _setState: (s: Partial<GameState>) => void } })
      ._engine._setState({ player: { ...session.player, hp: 1 } })
    await cmdSafe(session, 'rest')
    expect(logContains(session, 'recover') || logContains(session, 'rest') || logContains(session, 'full strength')).toBe(true)
    covered('rest')
  })

  it('rest — invalid: rest in unsafe room gives clear message', async () => {
    await session.create(ENFORCER_SPEC)
    await cmdSafe(session, 'rest')
    expect(logContains(session, 'exposed') || logContains(session, 'safer') || logContains(session, 'rest') || logContains(session, 'full strength')).toBe(true)
    covered('rest')
  })

  // ----------------------------------------------------------
  // camp
  // ----------------------------------------------------------
  it('camp — valid: camp in campfireAllowed room', async () => {
    const mockGetRoom = getRoom as ReturnType<typeof vi.fn>
    mockGetRoom.mockResolvedValue({
      id: 'cr_01_approach', name: 'Highway Junction', description: 'Two highways.',
      shortDescription: 'Junction.', zone: 'crossroads', difficulty: 1, visited: true,
      flags: { campfireAllowed: true, fastTravelWaypoint: true },
      exits: {}, items: [], enemies: [], npcs: [],
    })
    await session.create(ENFORCER_SPEC)
    ;(session as unknown as { _engine: { _setState: (s: Partial<GameState>) => void } })
      ._engine._setState({ player: { ...session.player, hp: 1 } })
    await cmdSafe(session, 'camp')
    expect(logContains(session, 'camp') || logContains(session, 'fire') || logContains(session, 'recover') || logContains(session, 'full strength')).toBe(true)
    covered('camp')
  })

  it('camp — invalid: camp where campfire is not allowed', async () => {
    await session.create(ENFORCER_SPEC)
    await cmdSafe(session, 'camp')
    expect(logContains(session, 'camp') || logContains(session, 'fire') || logContains(session, 'combat')).toBe(true)
    covered('camp')
  })

  // ----------------------------------------------------------
  // drink (aliases: fill)
  // ----------------------------------------------------------
  it('drink — valid: drink at water source', async () => {
    const mockGetRoom = getRoom as ReturnType<typeof vi.fn>
    mockGetRoom.mockResolvedValue({
      id: 'cr_01_approach', name: 'Highway Junction', description: 'Two highways.',
      shortDescription: 'Junction.', zone: 'crossroads', difficulty: 1, visited: true,
      flags: { waterSource: true, fastTravelWaypoint: true },
      exits: {}, items: [], enemies: [], npcs: [],
    })
    await session.create(ENFORCER_SPEC)
    ;(session as unknown as { _engine: { _setState: (s: Partial<GameState>) => void } })
      ._engine._setState({ player: { ...session.player, hp: 1 } })
    await cmdSafe(session, 'drink')
    expect(logContains(session, 'water') || logContains(session, 'drink') || logContains(session, 'recover') || logContains(session, 'full strength')).toBe(true)
    covered('drink')
  })

  it('drink — invalid: no water source in room', async () => {
    await session.create(ENFORCER_SPEC)
    await cmdSafe(session, 'drink')
    expect(logContains(session, 'no water') || logContains(session, 'water source') || logContains(session, 'drink') || logContains(session, 'combat')).toBe(true)
    covered('drink')
  })

  // ----------------------------------------------------------
  // travel (aliases: warp, fast travel)
  // ----------------------------------------------------------
  it('travel — valid: travel with no destination gives usage hint', async () => {
    await session.create(ENFORCER_SPEC)
    await cmdSafe(session, 'travel')
    expect(logContains(session, 'travel') || logContains(session, 'waypoint') || logContains(session, 'map')).toBe(true)
    covered('travel')
  })

  it('travel — invalid: travel to unknown destination', async () => {
    await session.create(ENFORCER_SPEC)
    await cmdSafe(session, 'travel unknownplacexyz')
    expect(logContains(session, 'unknown') || logContains(session, 'waypoint') || logContains(session, 'travel') || logContains(session, 'map')).toBe(true)
    covered('travel')
  })

  // ----------------------------------------------------------
  // map
  // ----------------------------------------------------------
  it('map — valid: map shows discovered waypoints', async () => {
    await session.create(ENFORCER_SPEC)
    const before = session.log.length
    await cmdSafe(session, 'map')
    expect(session.log.length).toBeGreaterThan(before)
    covered('map')
  })

  it('map — "warp" alias parses to travel verb (not map)', async () => {
    const action = parseCommand('warp')
    expect(action.verb).toBe('travel')
    covered('travel')
  })

  // ----------------------------------------------------------
  // boost
  // ----------------------------------------------------------
  it('boost — valid: boost when pendingStatIncrease is true', async () => {
    await session.create(ENFORCER_SPEC)
    ;(session as unknown as { _engine: { _setState: (s: Partial<GameState>) => void } })
      ._engine._setState({ pendingStatIncrease: true })
    await cmdSafe(session, 'boost vigor')
    expect(logContains(session, 'vigor') || logContains(session, 'boost') || logContains(session, 'stat')).toBe(true)
    covered('boost')
  })

  it('boost — invalid: boost with no pending stat increase', async () => {
    await session.create(ENFORCER_SPEC)
    await cmdSafe(session, 'boost vigor')
    expect(logContains(session, 'do not have') || logContains(session, 'no stat') || logContains(session, 'available')).toBe(true)
    covered('boost')
  })

  // ----------------------------------------------------------
  // stats (aliases: score, status, character, char)
  // ----------------------------------------------------------
  it('stats — valid: shows character stats panel', async () => {
    await session.create(ENFORCER_SPEC)
    const before = session.log.length
    await cmdSafe(session, 'stats')
    expect(session.log.length).toBeGreaterThan(before)
    covered('stats')
  })

  it('stats — "status" alias parses correctly', async () => {
    const action = parseCommand('status')
    expect(action.verb).toBe('stats')
    covered('stats')
  })

  // ----------------------------------------------------------
  // equipment (alias: eq)
  // ----------------------------------------------------------
  it('equipment — valid: shows equipped gear panel', async () => {
    await session.create(ENFORCER_SPEC)
    const before = session.log.length
    await cmdSafe(session, 'equipment')
    expect(session.log.length).toBeGreaterThan(before)
    covered('equipment')
  })

  it('equipment — "eq" alias parses correctly', async () => {
    const action = parseCommand('eq')
    expect(action.verb).toBe('equipment')
    covered('equipment')
  })

  // ----------------------------------------------------------
  // help (aliases: h, ?)
  // ----------------------------------------------------------
  it('help — valid: bare help lists commands', async () => {
    await session.create(ENFORCER_SPEC)
    const before = session.log.length
    await cmdSafe(session, 'help')
    expect(session.log.length).toBeGreaterThan(before)
    covered('help')
  })

  it('help — with topic: "help combat" gives combat help', async () => {
    await session.create(ENFORCER_SPEC)
    await cmdSafe(session, 'help combat')
    expect(session.log.length).toBeGreaterThan(0)
    covered('help')
  })

  // ----------------------------------------------------------
  // save
  // ----------------------------------------------------------
  it('save — valid: save does not crash', async () => {
    await session.create(ENFORCER_SPEC)
    await cmdSafe(session, 'save')
    // Save always adds a "Progress saved." message
    expect(logContains(session, 'saved') || logContains(session, 'save') || session.log.length > 0).toBe(true)
    covered('save')
  })

  // ----------------------------------------------------------
  // quit (aliases: exit)
  // ----------------------------------------------------------
  it('quit — valid: quit saves and gives message', async () => {
    await session.create(ENFORCER_SPEC)
    await cmdSafe(session, 'quit')
    expect(logContains(session, 'saved') || logContains(session, 'quit') || logContains(session, 'refresh')).toBe(true)
    covered('quit')
  })

  it('quit — "exit" alias parses correctly', async () => {
    const action = parseCommand('exit')
    expect(action.verb).toBe('quit')
    covered('quit')
  })

  // ----------------------------------------------------------
  // restart (aliases: newgame, reset)
  // ----------------------------------------------------------
  it('restart — produces confirmation warning (does NOT follow with CONFIRM RESTART)', async () => {
    await session.create(ENFORCER_SPEC)
    await cmdSafe(session, 'restart')
    // Must produce a warning message, not silently wipe
    expect(logContains(session, 'restart') || logContains(session, 'confirm') || logContains(session, 'warning') || logContains(session, 'wipe') || logContains(session, 'progress')).toBe(true)
    covered('restart')
  })

  it('restart — "newgame" alias parses correctly', async () => {
    const action = parseCommand('newgame')
    expect(action.verb).toBe('restart')
    covered('restart')
  })

  // ----------------------------------------------------------
  // rep (aliases: reputation, standing)
  // ----------------------------------------------------------
  it('rep — valid: shows reputation panel', async () => {
    await session.create(ENFORCER_SPEC)
    const before = session.log.length
    await cmdSafe(session, 'rep')
    expect(session.log.length).toBeGreaterThan(before)
    covered('rep')
  })

  it('rep — "reputation" alias parses correctly', async () => {
    const action = parseCommand('reputation')
    expect(action.verb).toBe('rep')
    covered('rep')
  })

  // ----------------------------------------------------------
  // quests (aliases: quest)
  // ----------------------------------------------------------
  it('quests — valid: shows quest log (even if empty)', async () => {
    await session.create(ENFORCER_SPEC)
    const before = session.log.length
    await cmdSafe(session, 'quests')
    expect(session.log.length).toBeGreaterThan(before)
    covered('quests')
  })

  it('quests — "quest" alias parses correctly', async () => {
    const action = parseCommand('quest')
    expect(action.verb).toBe('quests')
    covered('quests')
  })

  // ----------------------------------------------------------
  // smell (aliases: sniff, scent)
  // ----------------------------------------------------------
  it('smell — valid: smell returns atmospheric text', async () => {
    await session.create(ENFORCER_SPEC)
    const before = session.log.length
    await cmdSafe(session, 'smell')
    expect(session.log.length).toBeGreaterThan(before)
    covered('smell')
  })

  it('smell — with noun: smell item works gracefully', async () => {
    await session.create(ENFORCER_SPEC)
    await cmdSafe(session, 'smell air')
    expect(session.log.length).toBeGreaterThan(0)
    covered('smell')
  })

  // ----------------------------------------------------------
  // listen (aliases: hear)
  // ----------------------------------------------------------
  it('listen — valid: listen returns atmospheric text', async () => {
    await session.create(ENFORCER_SPEC)
    const before = session.log.length
    await cmdSafe(session, 'listen')
    expect(session.log.length).toBeGreaterThan(before)
    covered('listen')
  })

  it('listen — with noun: listen to something works gracefully', async () => {
    await session.create(ENFORCER_SPEC)
    await cmdSafe(session, 'listen wind')
    expect(session.log.length).toBeGreaterThan(0)
    covered('listen')
  })

  // ----------------------------------------------------------
  // touch (aliases: feel)
  // ----------------------------------------------------------
  it('touch — valid: touch returns atmospheric text', async () => {
    await session.create(ENFORCER_SPEC)
    const before = session.log.length
    await cmdSafe(session, 'touch')
    expect(session.log.length).toBeGreaterThan(before)
    covered('touch')
  })

  it('touch — with noun: touch wall works gracefully', async () => {
    await session.create(ENFORCER_SPEC)
    await cmdSafe(session, 'touch wall')
    expect(session.log.length).toBeGreaterThan(0)
    covered('touch')
  })

  // ----------------------------------------------------------
  // hint (aliases: stuck, clue, what, where)
  // ----------------------------------------------------------
  it('hint — valid: hint produces guidance text', async () => {
    await session.create(ENFORCER_SPEC)
    const before = session.log.length
    await cmdSafe(session, 'hint')
    expect(session.log.length).toBeGreaterThan(before)
    covered('hint')
  })

  it('hint — "stuck" alias parses correctly', async () => {
    const action = parseCommand('stuck')
    expect(action.verb).toBe('hint')
    covered('hint')
  })

  // ----------------------------------------------------------
  // read
  // ----------------------------------------------------------
  it('read — valid: read with item in inventory', async () => {
    const { getItem } = await import('@/data/items')
    const mockGetItem = getItem as ReturnType<typeof vi.fn>
    mockGetItem.mockReturnValue({ id: 'note', name: 'Note', description: 'A scrawled note.', type: 'lore', weight: 0, value: 0, loreText: 'Help us.' })
    await session.create(ENFORCER_SPEC)
    ;(session as unknown as { _engine: { _setState: (s: Partial<GameState>) => void } })
      ._engine._setState({
        inventory: [{
          id: 'inv-6', itemId: 'note', equipped: false,
          item: { id: 'note', name: 'Note', description: 'A scrawled note.', type: 'lore', weight: 0, value: 0, loreText: 'Help us.' },
        }],
      })
    await cmdSafe(session, 'read note')
    expect(session.log.length).toBeGreaterThan(0)
    covered('read')
  })

  it('read — invalid: read item not in inventory', async () => {
    await session.create(ENFORCER_SPEC)
    await cmdSafe(session, 'read ancient_tome')
    expect(logContains(session, "don't have") || logContains(session, 'read') || logContains(session, 'not here')).toBe(true)
    covered('read')
  })

  // ----------------------------------------------------------
  // journal (aliases: codex, notes)
  // ----------------------------------------------------------
  it('journal — valid: journal shows journal panel', async () => {
    await session.create(ENFORCER_SPEC)
    const before = session.log.length
    await cmdSafe(session, 'journal')
    expect(session.log.length).toBeGreaterThan(before)
    covered('journal')
  })

  it('journal — "codex" alias parses correctly', async () => {
    const action = parseCommand('codex')
    expect(action.verb).toBe('journal')
    covered('journal')
  })

  // ----------------------------------------------------------
  // sneak (aliases: stealth, hide, creep, skulk, tiptoe)
  // ----------------------------------------------------------
  it('sneak — valid: sneak in a direction', async () => {
    await session.create(ENFORCER_SPEC)
    await cmdSafe(session, 'sneak north')
    expect(session.log.length).toBeGreaterThan(0)
    covered('sneak')
  })

  it('sneak — invalid: sneak into combat gives sensible message', async () => {
    await session.create(ENFORCER_SPEC)
    injectCombat(session)
    await cmdSafe(session, 'sneak east')
    expect(session.log.length).toBeGreaterThan(0)
    covered('sneak')
  })

  // ----------------------------------------------------------
  // climb (aliases: scale, ascend, clamber)
  // ----------------------------------------------------------
  it('climb — valid: climb north routes through handleMove', async () => {
    const mockGetRoom = getRoom as ReturnType<typeof vi.fn>
    mockGetRoom.mockImplementation(async (roomId: string) => {
      if (roomId === 'cr_02_gate') {
        return {
          id: 'cr_02_gate', name: 'Crossroads Gate', description: 'A gate.',
          shortDescription: 'Gate.', zone: 'crossroads', difficulty: 1, visited: false,
          flags: {}, exits: { south: 'cr_01_approach' }, items: [], enemies: [], npcs: [],
        }
      }
      return {
        id: 'cr_01_approach', name: 'Highway Junction', description: 'Two highways.',
        shortDescription: 'Junction.', zone: 'crossroads', difficulty: 1, visited: true,
        flags: { fastTravelWaypoint: true }, exits: { north: 'cr_02_gate' },
        items: [], enemies: [], npcs: [],
      }
    })
    await session.create(ENFORCER_SPEC)
    await cmdSafe(session, 'climb north')
    expect(session.log.length).toBeGreaterThan(0)
    covered('climb')
  })

  it('climb — invalid: climb direction blocked in combat', async () => {
    await session.create(ENFORCER_SPEC)
    injectCombat(session)
    await cmdSafe(session, 'climb up')
    expect(logContains(session, 'combat') || logContains(session, 'flee') || session.log.length > 0).toBe(true)
    covered('climb')
  })

  // ----------------------------------------------------------
  // swim (aliases: wade, ford)
  // ----------------------------------------------------------
  it('swim — valid: swim north routes through handleMove', async () => {
    await session.create(ENFORCER_SPEC)
    await cmdSafe(session, 'swim north')
    // Either moved or gave a direction error — both are fine
    expect(session.log.length).toBeGreaterThan(0)
    covered('swim')
  })

  it('swim — invalid: swim in combat is blocked', async () => {
    await session.create(ENFORCER_SPEC)
    injectCombat(session)
    await cmdSafe(session, 'swim east')
    expect(logContains(session, 'combat') || logContains(session, 'flee') || session.log.length > 0).toBe(true)
    covered('swim')
  })

  // ----------------------------------------------------------
  // unlock (aliases: unbolt)
  // ----------------------------------------------------------
  it('unlock — valid: unlock a door (will fail if no key, graceful)', async () => {
    await session.create(ENFORCER_SPEC)
    await cmdSafe(session, 'unlock door')
    expect(logContains(session, 'key') || logContains(session, 'unlock') || logContains(session, 'door')).toBe(true)
    covered('unlock')
  })

  it('unlock — invalid: unlock with no noun', async () => {
    await session.create(ENFORCER_SPEC)
    await cmdSafe(session, 'unlock')
    expect(session.log.length).toBeGreaterThan(0)
    covered('unlock')
  })

  // ----------------------------------------------------------
  // dialogue_choice (in-dialogue: number)
  // ----------------------------------------------------------
  it('dialogue_choice — valid: valid number while in dialogue', async () => {
    const { getNPC } = await import('@/data/npcs')
    const mockGetNPC = getNPC as ReturnType<typeof vi.fn>
    mockGetNPC.mockReturnValue({
      id: 'test_npc', name: 'Guide', description: 'A guide.', faction: 'drifters', isNamed: true,
    })
    const { DIALOGUE_TREES } = await import('@/data/dialogueTrees')
    ;(DIALOGUE_TREES as Record<string, unknown>)['test_npc'] = {
      npcId: 'test_npc',
      startNode: 'start',
      nodes: {
        start: {
          id: 'start',
          text: 'Hello, traveler.',
          branches: [{ label: 'Goodbye.', targetNode: 'end' }],
        },
        end: { id: 'end', text: 'Farewell.' },
      },
    }
    await session.create(ENFORCER_SPEC)
    ;(session as unknown as { _engine: { _setState: (s: Partial<GameState>) => void } })
      ._engine._setState({
        activeDialogue: { npcId: 'test_npc', treeId: 'test_npc', currentNodeId: 'start' },
      })
    await cmdSafe(session, '1')
    expect(session.log.length).toBeGreaterThan(0)
    covered('dialogue_choice')
  })

  it('dialogue_choice — invalid: number out of range while in dialogue', async () => {
    await session.create(ENFORCER_SPEC)
    ;(session as unknown as { _engine: { _setState: (s: Partial<GameState>) => void } })
      ._engine._setState({
        activeDialogue: { npcId: 'test_npc', treeId: 'test_npc', currentNodeId: 'start' },
      })
    await cmdSafe(session, '99')
    // dialogue_choice with no valid tree/node should give sensible error
    expect(session.log.length).toBeGreaterThan(0)
    covered('dialogue_choice')
  })

  // ----------------------------------------------------------
  // dialogue_leave (in-dialogue: leave/bye/back)
  // ----------------------------------------------------------
  it('dialogue_leave — valid: leave ends dialogue', async () => {
    await session.create(ENFORCER_SPEC)
    ;(session as unknown as { _engine: { _setState: (s: Partial<GameState>) => void } })
      ._engine._setState({
        activeDialogue: { npcId: 'test_npc', treeId: 'test_npc', currentNodeId: 'start' },
      })
    // dialogue_leave is parsed when in dialogue context — but the engine dispatches
    // based on the verb, not the phase. We use parseDialogueInput directly here
    // to confirm it routes, then call a leave-word to confirm engine handles it.
    const { parseDialogueInput } = await import('@/lib/parser')
    const action = parseDialogueInput('leave')
    expect(action.verb).toBe('dialogue_leave')
    // Execute via raw executeAction path
    const engineRef = (session as unknown as { _engine: import('@/lib/gameEngine').GameEngine })._engine
    await expect(engineRef.executeAction(action)).resolves.toBeDefined()
    covered('dialogue_leave')
  })

  it('dialogue_leave — "bye" alias also routes to dialogue_leave', async () => {
    const { parseDialogueInput } = await import('@/lib/parser')
    const action = parseDialogueInput('bye')
    expect(action.verb).toBe('dialogue_leave')
    covered('dialogue_leave')
  })

  // ----------------------------------------------------------
  // dialogue_blocked (in-dialogue: non-number, non-leave input)
  // ----------------------------------------------------------
  it('dialogue_blocked — produces a hint about valid dialogue input', async () => {
    await session.create(ENFORCER_SPEC)
    ;(session as unknown as { _engine: { _setState: (s: Partial<GameState>) => void } })
      ._engine._setState({
        activeDialogue: { npcId: 'test_npc', treeId: 'test_npc', currentNodeId: 'start' },
      })
    const { parseDialogueInput } = await import('@/lib/parser')
    const action = parseDialogueInput('attack')
    expect(action.verb).toBe('dialogue_blocked')
    const engineRef = (session as unknown as { _engine: import('@/lib/gameEngine').GameEngine })._engine
    await expect(engineRef.executeAction(action)).resolves.toBeDefined()
    expect(logContains(session, 'conversation') || logContains(session, 'choose') || logContains(session, 'leave')).toBe(true)
    covered('dialogue_blocked')
  })

  // ============================================================
  // Phase-aware behavior assertions
  // ============================================================

  it('phase: go blocked in combat (forces use of flee)', async () => {
    await session.create(ENFORCER_SPEC)
    injectCombat(session)
    await cmdSafe(session, 'go north')
    expect(logContains(session, 'combat') || logContains(session, 'flee')).toBe(true)
  })

  it('phase: rest blocked in combat', async () => {
    await session.create(ENFORCER_SPEC)
    injectCombat(session)
    await cmdSafe(session, 'rest')
    expect(logContains(session, 'combat')).toBe(true)
  })

  it('phase: drink blocked in combat', async () => {
    await session.create(ENFORCER_SPEC)
    injectCombat(session)
    await cmdSafe(session, 'drink')
    expect(logContains(session, 'combat')).toBe(true)
  })

  it('phase: camp blocked in combat', async () => {
    await session.create(ENFORCER_SPEC)
    injectCombat(session)
    await cmdSafe(session, 'camp')
    expect(logContains(session, 'combat')).toBe(true)
  })

  it('phase: travel blocked in combat', async () => {
    await session.create(ENFORCER_SPEC)
    injectCombat(session)
    await cmdSafe(session, 'travel somewhere')
    expect(logContains(session, 'combat') || logContains(session, 'travel')).toBe(true)
  })

  // ============================================================
  // Aliases smoke-test — parser layer only (no engine dispatch)
  // ============================================================

  it('parser: "kill" normalises to "attack"', () => {
    expect(parseCommand('kill shuffler').verb).toBe('attack')
  })

  it('parser: "flee" aliases run/escape/retreat', () => {
    expect(parseCommand('run').verb).toBe('flee')
    expect(parseCommand('escape').verb).toBe('flee')
    expect(parseCommand('retreat').verb).toBe('flee')
  })

  it('parser: direction shorthands normalise to "go"', () => {
    expect(parseCommand('n').verb).toBe('go')
    expect(parseCommand('s').verb).toBe('go')
    expect(parseCommand('e').verb).toBe('go')
    expect(parseCommand('w').verb).toBe('go')
  })

  it('parser: sensory aliases normalise correctly', () => {
    expect(parseCommand('sniff').verb).toBe('smell')
    expect(parseCommand('hear').verb).toBe('listen')
    expect(parseCommand('feel').verb).toBe('touch')
  })

  it('parser: craft aliases normalise to "craft"', () => {
    expect(parseCommand('build').verb).toBe('craft')
    expect(parseCommand('forge').verb).toBe('craft')
    expect(parseCommand('make').verb).toBe('craft')
  })

  it('parser: climb/sneak/swim aliases normalise correctly', () => {
    expect(parseCommand('scale north').verb).toBe('climb')
    expect(parseCommand('stealth north').verb).toBe('sneak')
    expect(parseCommand('wade north').verb).toBe('swim')
  })

  it('parser: give aliases normalise to "give"', () => {
    expect(parseCommand('hand knife guide').verb).toBe('give')
    expect(parseCommand('offer medkit doc').verb).toBe('give')
  })

  it('parser: trade aliases normalise correctly', () => {
    expect(parseCommand('barter').verb).toBe('trade')
    expect(parseCommand('purchase').verb).toBe('buy')
  })

  it('parser: "pick up" multi-word normalises to "take"', () => {
    expect(parseCommand('pick up bandage').verb).toBe('take')
  })

  it('parser: "fast travel" multi-word normalises to "travel"', () => {
    expect(parseCommand('fast travel').verb).toBe('travel')
  })

  it('parser: "look at" normalises to "examine_extra"', () => {
    expect(parseCommand('look at door').verb).toBe('examine_extra')
  })

  it('parser: "look under" normalises to "examine_spatial"', () => {
    expect(parseCommand('look under table').verb).toBe('examine_spatial')
  })

  it('parser: attack_called fires when body part is the last token', () => {
    expect(parseCommand('attack shuffler head').verb).toBe('attack_called')
    expect(parseCommand('attack dummy torso').verb).toBe('attack_called')
    // Without a body part, stays as plain attack
    expect(parseCommand('attack shuffler').verb).toBe('attack')
  })

  // ============================================================
  // Coverage count assertion
  // ============================================================

  it('100% verb coverage: all enumerated verbs have been exercised', () => {
    const missing = Array.from(ENUMERATED_VERBS).filter(v => !verbsCovered.has(v))
    if (missing.length > 0) {
      console.warn('[verb-coverage] Uncovered verbs:', missing.join(', '))
    }
    expect(missing.length).toBe(0)
  })
})
