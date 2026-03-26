// ============================================================
// MUD Game — Core TypeScript Types
// All game interfaces live here. No `any` allowed.
// ============================================================

// ------------------------------------------------------------
// Primitives
// ------------------------------------------------------------

export type Direction = 'north' | 'south' | 'east' | 'west' | 'up' | 'down'

export type Stat = 'vigor' | 'grit' | 'reflex' | 'wits' | 'presence' | 'shadow'

export type ZoneType = 'shelter' | 'ruins' | 'wastes' | 'outpost' | 'underground'

export type ItemType = 'weapon' | 'armor' | 'consumable' | 'key' | 'junk'

export type MessageType = 'narrative' | 'combat' | 'system' | 'error'

export type ContractTerm = '1' | '3' | '5' | 'perpetual'

export type CharacterClass = 'enforcer' | 'scout' | 'wraith' | 'shepherd' | 'reclaimer' | 'warden' | 'broker'

export type PersonalLossType = 'child' | 'partner' | 'community' | 'identity' | 'promise'

// ------------------------------------------------------------
// Spawn / Randomization System (Phase 1)
// ------------------------------------------------------------

export type DistributionType = 'flat' | 'weighted_low' | 'weighted_high' | 'bell' | 'single'
export type TimeOfDay = 'dawn' | 'day' | 'dusk' | 'night'

export interface QuantityConfig {
  min: number
  max: number
  distribution: DistributionType
}

export interface SpawnPoolEntry {
  id: string
  spawnChance: number           // 0.0–0.95 hard cap enforced at runtime
  quantity: QuantityConfig
  timeModifiers?: Partial<Record<TimeOfDay, number>>
}

export interface SpawnTable {
  items: SpawnPoolEntry[]
  enemies: SpawnPoolEntry[]
  npcs: SpawnPoolEntry[]
}

export interface SpawnedItem {
  itemId: string
  condition: number             // 0.0–1.0
}

export interface SpawnedNPC {
  npcId: string
  activity: string              // rolled from activity pool
  disposition: 'friendly' | 'neutral' | 'wary' | 'hostile'
}

export interface PopulatedRoom {
  items: SpawnedItem[]
  enemyIds: string[]
  npcs: SpawnedNPC[]
  ambientLines: string[]
}

// ------------------------------------------------------------
// Class Definitions
// ------------------------------------------------------------

export const CLASS_DEFINITIONS: Record<CharacterClass, {
  name: string
  archetype: string  // D&D archetype
  description: string
  // Bonus points the class assigns on top of BASE (2). Creates a floor — can't be removed.
  // User may still add free points to these stats.
  classBonus: Partial<Record<Stat, number>>
  freePoints: number  // additional points user distributes freely to any stat
  specialties: string[]
}> = {
  enforcer: {
    name: 'Enforcer',
    archetype: 'Fighter',
    description: 'Built for violence. Former Salter muscle or pre-Collapse military. Hits hard, takes hits, keeps moving.',
    classBonus: { vigor: 4, grit: 2, reflex: 2 },
    freePoints: 4,
    specialties: ['Melee damage', 'Hollow crowd control', 'Damage resistance'],
  },
  scout: {
    name: 'Scout',
    archetype: 'Ranger',
    description: 'Reads terrain like text. Former wilderness guide, hunter, or military recon. First to know what\'s coming.',
    classBonus: { reflex: 4, wits: 2, shadow: 2 },
    freePoints: 4,
    specialties: ['Tracking', 'Ranged combat', 'Wilderness survival', 'Scavenging'],
  },
  wraith: {
    name: 'Wraith',
    archetype: 'Rogue',
    description: 'Not there until they are. Former thief, intelligence operative, or someone who learned the hard way that invisibility keeps you alive.',
    classBonus: { shadow: 4, reflex: 2, wits: 2 },
    freePoints: 4,
    specialties: ['Stealth', 'Lockpicking', 'Ambush bonus', 'Deception'],
  },
  shepherd: {
    name: 'Shepherd',
    archetype: 'Cleric',
    description: 'Keeps people alive — physically and mentally. Former paramedic, therapist, or community leader. The one everyone leans on.',
    classBonus: { presence: 4, grit: 2, wits: 2 },
    freePoints: 4,
    specialties: ['Field medicine', 'Morale buffs', 'Faction reputation bonus', 'Infection resistance'],
  },
  reclaimer: {
    name: 'Reclaimer',
    archetype: 'Artificer',
    description: 'Sees the old world in every ruin. Former engineer, programmer, or scientist. Fixes what others abandon.',
    classBonus: { wits: 4, grit: 2, presence: 2 },
    freePoints: 4,
    specialties: ['Crafting', 'Electronics', 'Trap-setting', 'Item identification'],
  },
  warden: {
    name: 'Warden',
    archetype: 'Paladin',
    description: 'Conviction made physical. Accord lawkeeper or Kindling true believer. Protects the living because someone has to.',
    classBonus: { vigor: 3, grit: 3, presence: 2 },
    freePoints: 4,
    specialties: ['Infection resistance', 'Protection aura', 'Conviction checks', 'Settlement defense'],
  },
  broker: {
    name: 'Broker',
    archetype: 'Bard',
    description: 'Information is the only real currency. Former journalist, politician, or Drifter who learned that everyone talks if you know how to listen.',
    classBonus: { presence: 4, shadow: 3, wits: 1 },
    freePoints: 4,
    specialties: ['Trade bonuses', 'Persuasion', 'Intel gathering', 'Faction access'],
  },
}

// ------------------------------------------------------------
// Parser
// ------------------------------------------------------------

export interface Action {
  verb: string
  noun?: string
  raw: string
}

// ------------------------------------------------------------
// Items
// ------------------------------------------------------------

export interface Item {
  id: string
  name: string
  description: string
  type: ItemType
  weight: number
  damage?: number        // weapons only
  defense?: number       // armor only
  healing?: number       // consumables only
  statBonus?: Partial<Record<Stat, number>>
  value: number          // trade/junk value
}

export interface InventoryItem {
  id: string             // inventory row id (uuid)
  playerId: string
  itemId: string
  item: Item             // resolved from data/items.ts
  quantity: number
  equipped: boolean
}

// ------------------------------------------------------------
// Enemies
// ------------------------------------------------------------

export interface LootEntry {
  itemId: string
  chance: number         // 0.0 – 1.0
}

export interface Enemy {
  id: string
  name: string
  description: string
  hp: number
  maxHp: number
  attack: number         // attack modifier added to d10 roll
  defense: number        // DC the player must beat to hit
  damage: [number, number] // [min, max] damage per hit
  xp: number
  loot: LootEntry[]
}

// ------------------------------------------------------------
// NPCs
// ------------------------------------------------------------

export interface NPC {
  id: string
  name: string
  description: string
  dialogue: string       // single-line response for MVP
}

// ------------------------------------------------------------
// Rooms & World
// ------------------------------------------------------------

export interface Room {
  id: string
  name: string
  description: string            // full description (first visit)
  shortDescription: string       // brief reminder (revisits)
  exits: Partial<Record<Direction, string>>  // direction -> room_id (null = blocked)
  items: string[]                // item IDs present
  enemies: string[]              // enemy IDs that can spawn
  npcs: string[]                 // NPC IDs present
  zone: ZoneType
  difficulty: number             // 1–5
  visited: boolean
  flags: Record<string, boolean> // door_unlocked, searched, etc.
  population?: PopulatedRoom     // in-memory only, not persisted
}

export interface Exit {
  direction: Direction
  roomId: string
}

// ------------------------------------------------------------
// Zone Templates (used by world generator)
// ------------------------------------------------------------

export interface ZoneTemplate {
  type: ZoneType
  roomCount: [number, number]           // [min, max]
  difficulty: [number, number]          // [min, max]
  nameFragments: string[]
  locationFragments: string[]
  descriptionFragments: string[][]      // arrays of sentences to combine
  featurePool: string[]
  enemyPool: string[]
  itemPool: string[]
  npcPool: string[]
  spawnTable?: SpawnTable
}

// ------------------------------------------------------------
// Player
// ------------------------------------------------------------

export interface Player {
  id: string
  name: string
  characterClass: CharacterClass
  vigor: number
  grit: number
  reflex: number
  wits: number
  presence: number
  shadow: number
  hp: number
  maxHp: number
  currentRoomId: string
  worldSeed: number
  xp: number
  level: number
  actionsTaken?: number         // for Phase 2 — tracks total player actions (optional until Phase 2 wires it in)
  personalLossType?: PersonalLossType
  personalLossDetail?: string   // player-written or selected detail
  squirrelName?: 'Chippy' | 'Stumpy'
  isDead?: boolean
  cycle?: number
  totalDeaths?: number
}

// ------------------------------------------------------------
// Ledger — cross-cycle meta-progression
// ------------------------------------------------------------

export interface PlayerLedger {
  playerId: string
  worldSeed: number
  currentCycle: number
  totalDeaths: number
  pressureLevel: number           // 1–5, computed from cycle count
  discoveredRoomIds: string[]
  squirrelAlive: boolean
  squirrelTrust: number
  squirrelCyclesKnown: number
  squirrelName?: 'Chippy' | 'Stumpy'
}

export interface StashItem {
  id: string                      // inventory row id
  playerId: string
  itemId: string
  item: Item                      // resolved from data/items.ts
  quantity: number
}

export interface StatBlock {
  vigor: number
  grit: number
  reflex: number
  wits: number
  presence: number
  shadow: number
}

// ------------------------------------------------------------
// Combat
// ------------------------------------------------------------

export interface CombatState {
  enemy: Enemy
  enemyHp: number
  playerGoesFirst: boolean
  turn: number
  active: boolean
}

export interface CombatResult {
  hit: boolean
  damage: number
  critical: boolean        // natural 10
  fumble: boolean          // natural 1
  messages: GameMessage[]
  enemyDefeated?: boolean
  playerDefeated?: boolean
  loot?: string[]          // item IDs dropped
}

export interface FleeResult {
  success: boolean
  messages: GameMessage[]
}

// ------------------------------------------------------------
// Dice
// ------------------------------------------------------------

export interface CheckResult {
  roll: number             // raw d10 result
  modifier: number
  total: number
  dc: number
  success: boolean
  critical: boolean        // natural 10
  fumble: boolean          // natural 1
}

// ------------------------------------------------------------
// Game Messages (displayed in Terminal)
// ------------------------------------------------------------

export interface GameMessage {
  text: string
  type: MessageType
}

// ------------------------------------------------------------
// Game State (held in React context during a session)
// ------------------------------------------------------------

export interface GameState {
  player: Player | null
  currentRoom: Room | null
  inventory: InventoryItem[]
  combatState: CombatState | null
  log: GameMessage[]
  loading: boolean
  initialized: boolean
  playerDead: boolean
  ledger: PlayerLedger | null
  stash: StashItem[]
}
