// ============================================================
// MUD Game — Core TypeScript Types
// The Remnant — Post-Apocalyptic MUD
// All game interfaces live here. No `any` allowed.
// ============================================================

import type { ActiveCondition, WeaponTraitId, ArmorTraitId, EnemyResistance } from '@/types/traits'

// ------------------------------------------------------------
// Primitives
// ------------------------------------------------------------

export type Direction = 'north' | 'south' | 'east' | 'west' | 'up' | 'down'

export type Stat = 'vigor' | 'grit' | 'reflex' | 'wits' | 'presence' | 'shadow'

// 13 hand-crafted zones replacing the procedural zone system
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
  | 'the_pens'

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

export type MessageType = 'narrative' | 'combat' | 'system' | 'error' | 'echo' | 'death' | 'ending' | 'creation'

export type ContractTerm = '1' | '3' | '5' | 'perpetual'

export type CharacterClass = 'enforcer' | 'scout' | 'wraith' | 'shepherd' | 'reclaimer' | 'warden' | 'broker'

export type PersonalLossType = 'child' | 'partner' | 'community' | 'identity' | 'promise'

// Hollow enemy sub-types (used in hollow_encounter threat pools)
export type HollowType = 'shuffler' | 'remnant' | 'stalker' | 'screamer' | 'brute' | 'whisperer' | 'hive_mother' | 'elder_sanguine' | 'sanguine_feral'

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
  | 'endurance'    // grit — long-distance travel, resisting exhaustion
  | 'resilience'   // grit — resisting poison, infection, environmental hazards
  | 'composure'    // grit — maintaining calm under pressure, fear resistance
  | 'vigor'  // stats used as skill checks in some gates
  | 'presence'  // stat used as skill check (social authority, command)

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
  dialogueTree?: string
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
  questFlagOnSuccess?: { flag: string; value: string | boolean | number } | Array<{ flag: string; value: string | boolean | number }>
  cycleGate?: number
  questGate?: string
  reputationGrant?: { faction: FactionType; delta: number }
  conditionalDescription?: { flag: string; description: string }
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
  questGate?: string
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
  spawnType?: 'anchored' | 'patrol' | 'wanderer' | 'event' | 'unique' | 'ambient'
  quantity?: QuantityConfig
  activityPool?: NpcActivityEntry[]
  dispositionRoll?: { friendly?: number; neutral?: number; wary?: number; hostile?: number }
  dialogueTree?: string
  questGiver?: string[]
  tradeInventory?: string[]
  narrativeNotes?: string
  cycleGate?: number
  questGate?: string
  questFlagOnSpawn?: { flag: string; value: string | boolean | number }
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
  [key: string]: boolean | number | string | undefined
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
  weaponTraits?: WeaponTraitId[]
  armorTraits?: ArmorTraitId[]
  tier?: 1 | 2 | 3 | 4 | 5  // Scrap/Salvage/Military/PreCollapse/MERIDIAN
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
  resistanceProfile?: EnemyResistance
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
  // Vendor fields — optional; only set on NPCs with tradeInventory
  vendorGreeting?: string                          // shown when player opens trade
  vendorFarewell?: string                          // shown when player closes trade
  vendorBudget?: number                            // NPC's .22LR available for purchases; if absent, don't display
  vendorComments?: Record<string, string[]>        // itemId -> random comment pool for that item
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
  flags: Record<string, boolean | number | string>
  extras?: RoomExtra[]             // examinable details via "look <keyword>"
  hollowEncounter?: HollowEncounter
  environmentalRolls?: EnvironmentalRolls
  cycleGate?: number               // minimum cycle to access
  questGate?: string               // quest flag required
  act?: 1 | 2 | 3
  personalLossEchoes?: Partial<Record<PersonalLossType, string>>
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
  questFlags?: Record<string, string | boolean | number>
  // --------------------------------------------------------
  // Narrative Overhaul fields (convoy remnant-narrative-0329)
  // Optional with defaults to preserve backwards-compatibility
  // with existing saves and test helpers that predate this convoy.
  // Rider H initializes these on new characters and loads them
  // from narrative_progress JSON column on loadPlayer.
  // --------------------------------------------------------
  /** Dread / tension meter. 0 = quiet, 10 = swarm trigger. Defaults to 0. */
  hollowPressure?: number
  /** Narrative keys learned by the player (discovery system). Defaults to []. */
  narrativeKeys?: string[]
  /** Active companion NPC, if any. */
  currentCompanion?: import('@/types/convoy-contracts').Companion
}

// ------------------------------------------------------------
// Cycle Snapshot — captured at death / ending for echo system
// ------------------------------------------------------------

export interface CycleSnapshot {
  cycle: number
  endingChoice?: EndingChoice
  factionsAligned: FactionType[]      // rep >= 2 at cycle end
  factionsAntagonized: FactionType[]  // rep <= -2
  npcRelationships: Record<string, 'trusted' | 'distrusted' | 'betrayed' | 'allied'>
  questsCompleted: string[]           // key milestone flags
  deathRoom?: string                  // room ID where player died
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
  cycleHistory?: CycleSnapshot[]
  discoveredEnemies?: string[]  // enemy IDs the player has encountered/defeated
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
  // Hollow type special state
  bruteCharged?: boolean        // brute has used its charge attack
  bruteCooldownTurn?: number    // turn when brute last charged (skips next attack)
  whispererDebuff?: number      // combat roll penalty from whisperer this round
  fearPenalty?: number           // -1 combat penalty from failed grit check on room entry
  fearRoundsRemaining?: number   // rounds of fear penalty left (decrements each round)
  additionalEnemies?: Enemy[]   // extra enemies summoned (e.g. by screamer)
  lastRoomId?: string           // room before combat started (for flee escape)
  playerConditions: ActiveCondition[]
  enemyConditions: ActiveCondition[]
  abilityUsed: boolean
  defendingThisTurn: boolean
  waitingBonus: number           // +3 accuracy from wait command
  // Class ability state
  overwhelmActive?: boolean       // Enforcer: next attack auto-hits, ignores armor
  markTargetBonus?: number        // Scout: accuracy bonus for next N attacks
  markTargetAttacks?: number      // Scout: remaining attacks with mark bonus
  shadowstrikeActive?: boolean    // Wraith: guaranteed crit next attack
  braceActive?: boolean           // Warden: reduce incoming damage 60% this turn
  enemyIntimidated?: boolean      // Broker: enemy skips next turn
  enemyEnraged?: boolean          // Broker: enemy gets +2 damage (failed intimidate)
  cantFlee?: boolean              // Wraith: can't flee after using shadowstrike
  // Transient flags set by playerAttack for the action handler to consume
  _suppressNoise?: boolean        // silenced trait: suppress noise encounter on kill
  _healPlayer?: number            // draining trait: HP to restore after attack
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

// ------------------------------------------------------------
// Exploration Progress — journal / cartography tracking
// ------------------------------------------------------------

export interface ExplorationProgress {
  roomsVisited: number
  totalRooms: number
  zoneProgress: Partial<Record<ZoneType, { visited: number; total: number }>>
  narrativeKeysFound: number
  totalNarrativeKeys: number
}

// ------------------------------------------------------------
// Ending / Buffs / Game State
// ------------------------------------------------------------

export type EndingChoice = 'cure' | 'weapon' | 'seal' | 'throne'

export interface ActiveBuff {
  stat: string
  bonus: number
  expiresAt: number  // actionsTaken when buff expires
}

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
  roomsExplored: number
  endingTriggered: boolean
  endingChoice: EndingChoice | null
  activeBuffs: ActiveBuff[]
  cycleHistory?: CycleSnapshot[]
  pendingStatIncrease?: boolean  // true when player needs to choose a stat to boost
  weather?: 'clear' | 'overcast' | 'rain' | 'dust_storm' | 'fog'
  lastInitiativeAction?: number  // action count when NPC initiative last fired
  activeDialogue?: {
    npcId: string
    treeId: string
    currentNodeId: string
  }
  explorationProgress?: ExplorationProgress
}

// ------------------------------------------------------------
// Branching Dialogue Tree Types
// ------------------------------------------------------------

export interface DialogueNode {
  id: string
  speaker?: string              // NPC name (for attribution)
  text: string                  // What the NPC says
  branches?: DialogueBranch[]   // Player response options (if empty, conversation ends)
  onEnter?: {                   // Effects when this node is reached
    setFlag?: string | Record<string, boolean | number>
    grantItem?: string[]
    grantRep?: { faction: FactionType; delta: number }
    removeItem?: string[]
  }
}

export interface DialogueBranch {
  label: string                 // What the player sees as their choice
  targetNode: string            // ID of next DialogueNode
  // Gates — branch only shown if ALL conditions met:
  requiresFlag?: string
  requiresRep?: { faction: FactionType; min: number }
  requiresItem?: string
  skillCheck?: { skill: SkillType; dc: number }
  // What happens if skill check fails:
  failNode?: string
  // Echo gates — branch only shown if cycle history conditions met:
  requiresCycleMin?: number
  requiresPreviousRelationship?: {
    npcId: string
    relationship: 'trusted' | 'distrusted' | 'betrayed' | 'allied'
  }
  requiresPreviousEnding?: EndingChoice
  requiresPreviousQuest?: string
}

export interface DialogueTree {
  npcId: string
  startNode: string
  nodes: Record<string, DialogueNode>
}
