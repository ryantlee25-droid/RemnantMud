// ============================================================
// MUD Game — Core TypeScript Types
// The Remnant — Post-Apocalyptic MUD
// All game interfaces live here. No `any` allowed.
// ============================================================

// ------------------------------------------------------------
// Primitives
// ------------------------------------------------------------

export type Direction = 'north' | 'south' | 'east' | 'west' | 'up' | 'down'

export type Stat = 'vigor' | 'grit' | 'reflex' | 'wits' | 'presence' | 'shadow'

// 12 hand-crafted zones replacing the procedural zone system
export type ZoneType =
  | 'crossroads'
  | 'river_road'
  | 'covenant'
  | 'salt_creek'
  | 'the_ember'
  | 'the_breaks'
  | 'the_dust'
  | 'the_stacks'
  | 'duskhollow'
  | 'the_deep'
  | 'the_pine_sea'
  | 'the_scar'

// Legacy zones kept for any residual code references — will be removed post-migration
export type LegacyZoneType =
  | 'shelter'
  | 'ruins'
  | 'wastes'
  | 'highway'
  | 'flooded_district'
  | 'outpost'
  | 'factory'
  | 'bunker'
  | 'deadlands'
  | 'underground'

export type ItemType = 'weapon' | 'armor' | 'consumable' | 'key' | 'junk' | 'lore' | 'currency'

export type MessageType = 'narrative' | 'combat' | 'system' | 'error'

export type ContractTerm = '1' | '3' | '5' | 'perpetual'

export type CharacterClass = 'enforcer' | 'scout' | 'wraith' | 'shepherd' | 'reclaimer' | 'warden' | 'broker'

export type PersonalLossType = 'child' | 'partner' | 'community' | 'identity' | 'promise'

// Hollow enemy sub-types (used in hollow_encounter threat pools)
export type HollowType = 'shuffler' | 'remnant' | 'screamer' | 'brute' | 'whisperer' | 'hive_mother'

// Factions
export type FactionType =
  | 'accord'
  | 'salters'
  | 'drifters'
  | 'kindling'
  | 'reclaimers'
  | 'covenant_of_dusk'
  | 'red_court'
  | 'ferals'
  | 'lucid'

// Reputation levels: -3 (Hunted) to +3 (Blooded)
export type ReputationLevel = -3 | -2 | -1 | 0 | 1 | 2 | 3

// Skill types (used for skill gates, quest checks)
export type SkillType =
  | 'survival'
  | 'marksmanship'
  | 'brawling'
  | 'bladework'
  | 'scavenging'
  | 'field_medicine'
  | 'mechanics'
  | 'tracking'
  | 'negotiation'
  | 'intimidation'
  | 'stealth'
  | 'lockpicking'
  | 'electronics'
  | 'lore'
  | 'climbing'
  | 'blood_sense'
  | 'daystalking'
  | 'mesmerize'
  | 'perception'
  | 'vigor'  // stats used as skill checks in some gates

// ------------------------------------------------------------
// Spawn / Randomization System
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
// Room Extras — examined details triggered by "look <keyword>"
// ------------------------------------------------------------

export interface RoomExtra {
  keywords: string[]
  description?: string
  descriptionPool?: Array<{ desc: string; weight: number; cycleGate?: number }>
  skillCheck?: { skill: SkillType; dc: number; successAppend: string }
  cycleGate?: number
  questGate?: string
}

// ------------------------------------------------------------
// Hollow Encounter — room-specific Hollow spawning data
// ------------------------------------------------------------

export interface HollowActivityEntry {
  desc: string
  weight: number
}

export interface HollowThreatEntry {
  type: HollowType
  weight: number
  quantity: QuantityConfig
}

export interface HollowEncounter {
  baseChance: number
  timeModifier: Partial<Record<TimeOfDay, number>>
  threatPool: HollowThreatEntry[]
  awarenessRoll?: { unaware: number; awarePassive: number; awareAggressive: number }
  activityPool?: Partial<Record<HollowType, HollowActivityEntry[]>>
  noiseModifier?: number
}

// ------------------------------------------------------------
// Exit gates
// ------------------------------------------------------------

export interface SkillGate {
  skill: SkillType
  dc: number
  failMessage: string
}

export interface ReputationGate {
  faction: FactionType
  minLevel: ReputationLevel
}

// ------------------------------------------------------------
// Room Exit (rich version with gates)
// ------------------------------------------------------------

export interface RoomExit {
  destination: string
  descriptionVerbose?: string
  hidden?: boolean
  locked?: boolean
  lockedBy?: string               // item_id of key
  skillGate?: SkillGate
  reputationGate?: ReputationGate
  questGate?: string
  cycleGate?: number
  discoverSkill?: SkillType
  discoverDc?: number
  discoverMessage?: string
}

// ------------------------------------------------------------
// Environmental Rolls
// ------------------------------------------------------------

export interface AmbientSoundEntry {
  sound: string | null
  weight: number
}

export interface FlavorLine {
  line: string
  chance: number
  time?: TimeOfDay[] | null
  skillGate?: { skill: SkillType; dc: number }
}

export interface EnvironmentalRolls {
  ambientSoundPool?: { day?: AmbientSoundEntry[]; night?: AmbientSoundEntry[]; dawn?: AmbientSoundEntry[]; dusk?: AmbientSoundEntry[] }
  ambientCount?: QuantityConfig
  flavorLines?: FlavorLine[]
}

// ------------------------------------------------------------
// NPC Activity / Disposition (for room NPCs)
// ------------------------------------------------------------

export interface NpcActivityEntry {
  desc: string
  weight: number
  timeRestrict?: TimeOfDay[]
  questTrigger?: string
}

export interface NpcSpawnEntry {
  npcId: string
  spawnChance: number
  spawnType?: 'anchored' | 'patrol' | 'wanderer' | 'event' | 'unique'
  quantity?: QuantityConfig
  activityPool?: NpcActivityEntry[]
  dispositionRoll?: { friendly?: number; neutral?: number; wary?: number; hostile?: number }
  dialogueTree?: string
  questGiver?: string[]
  tradeInventory?: string[]
  narrativeNotes?: string
}

// ------------------------------------------------------------
// Item Spawn (rich version)
// ------------------------------------------------------------

export interface ItemSpawnEntry {
  entityId: string
  spawnChance: number
  quantity: QuantityConfig
  conditionRoll?: { min: number; max: number }
  groundDescription?: string
  timeModifier?: Partial<Record<TimeOfDay, number>>
  depletion?: { cooldownMinutes: { min: number; max: number }; respawnChance: number }
}

// ------------------------------------------------------------
// Room Flags
// ------------------------------------------------------------

export interface RoomFlags {
  safeRest?: boolean
  noCombat?: boolean
  campfireAllowed?: boolean
  fastTravelWaypoint?: boolean
  tutorialZone?: boolean
  dark?: boolean
  healingBonus?: number
  hiddenRoom?: boolean
  scavengingZone?: boolean
  questHub?: boolean
  waterSource?: boolean
  [key: string]: boolean | number | undefined
}

// ------------------------------------------------------------
// Class Definitions
// ------------------------------------------------------------

export const CLASS_DEFINITIONS: Record<CharacterClass, {
  name: string
  archetype: string
  description: string
  classBonus: Partial<Record<Stat, number>>
  freePoints: number
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
  damage?: number
  defense?: number
  healing?: number
  statBonus?: Partial<Record<Stat, number>>
  value: number          // in .22 LR pennies (base currency unit)
  usable?: boolean       // can "use" command be run on it
  useText?: string       // text displayed when using it
  loreText?: string      // for lore items, the vignette text
}

export interface InventoryItem {
  id: string             // inventory row id (uuid)
  playerId: string
  itemId: string
  item: Item
  quantity: number
  equipped: boolean
}

// ------------------------------------------------------------
// Enemies
// ------------------------------------------------------------

export interface LootEntry {
  itemId: string
  chance: number
}

export interface Enemy {
  id: string
  name: string
  description: string
  hollowType?: HollowType
  hp: number
  maxHp: number
  attack: number
  defense: number
  damage: [number, number]
  xp: number
  loot: LootEntry[]
  flavorText?: string[]  // varied combat descriptions
}

// ------------------------------------------------------------
// NPCs
// ------------------------------------------------------------

export interface NPC {
  id: string
  name: string
  description: string
  dialogue: string
  faction?: FactionType
  isNamed?: boolean      // key story NPC
}

// ------------------------------------------------------------
// Rooms & World — Hand-crafted room format
// ------------------------------------------------------------

export interface Room {
  id: string
  name: string
  description: string              // full description (first visit / default)
  descriptionNight?: string        // night variant
  descriptionDawn?: string         // dawn variant
  descriptionDusk?: string         // dusk variant
  shortDescription: string         // brief reminder (revisits)
  exits: Partial<Record<Direction, string>>  // simple direction -> room_id map
  richExits?: Partial<Record<Direction, RoomExit>>  // full exit data with gates
  items: string[]                  // item IDs (static seeding)
  enemies: string[]                // enemy IDs that can spawn
  npcs: string[]                   // NPC IDs present
  npcSpawns?: NpcSpawnEntry[]      // rich NPC spawn data
  itemSpawns?: ItemSpawnEntry[]    // rich item spawn data
  zone: ZoneType
  difficulty: number               // 1–5
  visited: boolean
  flags: Record<string, boolean | number>
  extras?: RoomExtra[]             // examinable details via "look <keyword>"
  hollowEncounter?: HollowEncounter
  environmentalRolls?: EnvironmentalRolls
  cycleGate?: number               // minimum cycle to access
  questGate?: string               // quest flag required
  act?: 1 | 2 | 3
  narrativeNotes?: string          // implementation notes, not player-facing
  population?: PopulatedRoom       // in-memory only, not persisted
}

export interface Exit {
  direction: Direction
  roomId: string
}

// ------------------------------------------------------------
// Zone Templates (legacy — used only if procedural zones still exist)
// ------------------------------------------------------------

export interface ZoneTemplate {
  type: ZoneType | LegacyZoneType
  roomCount: [number, number]
  difficulty: [number, number]
  nameFragments: string[]
  locationFragments: string[]
  descriptionFragments: string[][]
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
  actionsTaken: number
  personalLossType?: PersonalLossType
  personalLossDetail?: string
  squirrelName?: 'Chippy' | 'Stumpy'
  isDead: boolean
  cycle: number
  totalDeaths: number
  // Faction reputations: stored as JSON in DB
  factionReputation?: Partial<Record<FactionType, number>>
  // Quest flags: stored as JSON in DB
  questFlags?: Record<string, boolean | number>
}

// ------------------------------------------------------------
// Ledger — cross-cycle meta-progression
// ------------------------------------------------------------

export interface PlayerLedger {
  playerId: string
  worldSeed: number
  currentCycle: number
  totalDeaths: number
  pressureLevel: number
  discoveredRoomIds: string[]
  squirrelAlive: boolean
  squirrelTrust: number
  squirrelCyclesKnown: number
  squirrelName?: 'Chippy' | 'Stumpy'
}

export interface StashItem {
  id: string
  playerId: string
  itemId: string
  item: Item
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
  critical: boolean
  fumble: boolean
  messages: GameMessage[]
  enemyDefeated?: boolean
  playerDefeated?: boolean
  loot?: string[]
}

export interface FleeResult {
  success: boolean
  messages: GameMessage[]
}

// ------------------------------------------------------------
// Dice
// ------------------------------------------------------------

export interface CheckResult {
  roll: number
  modifier: number
  total: number
  dc: number
  success: boolean
  critical: boolean
  fumble: boolean
}

// ------------------------------------------------------------
// Game Messages (displayed in Terminal)
// ------------------------------------------------------------

export interface GameMessage {
  id: string
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
