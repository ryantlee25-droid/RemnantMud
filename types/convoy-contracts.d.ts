// ============================================================
// convoy-contracts.d.ts
// Convoy: remnant-narrative-0329 — The Remnant Narrative Overhaul
// Generated: 2026-03-29
//
// FROZEN AT DISPATCH. Do not modify after Riders are forked.
// If a change is needed: write AMENDMENT.md in your worktree,
// set Status: blocked in HOOK.md, and notify Mayor.
// ============================================================

import type { FactionType, CharacterClass, PersonalLossType, GameMessage, GameState } from '@/types/game'

// ============================================================
// PILLAR 1: World Events
// Owner: Rider A (lib/worldEvents.ts)
// ============================================================

export interface WorldEvent {
  id: string
  act: 1 | 2 | 3
  escalationLevel: number         // 0–3 within act
  triggerActionCount: number      // Fire every N actions
  messagePool: string[]           // Randomly selected on trigger
  factionCheck?: {
    faction: FactionType
    minRep?: number               // Inclusive lower bound
    maxRep?: number               // Inclusive upper bound
  }
  questGate?: string              // e.g. 'act1_complete' — must be set for event to fire
}

// ============================================================
// PILLAR 2: Dread & Tension
// Owner: Rider B (lib/hollowPressure.ts, lib/npcInitiative.ts)
// ============================================================

export interface PressureConfig {
  maxLevel: 10
  incrementPerActions: 10         // +1 pressure per 10 player actions
  decrementOnSafeRest: 1          // -1 per normal safe rest
  decrementOnClearThreat: 3       // -3 on clearing hollow threat
  decrementOnStrongholdRest: 10   // -10 (floors at 0) in faction stronghold
  swarmTriggerLevel: 10           // Triggers swarm event at this level
}

export interface PressureEvent {
  type: 'ambient' | 'encounter' | 'discovery' | 'safe_rest' | 'stronghold_rest' | 'clear_threat'
  delta: number                   // Positive = increase, negative = decrease
  narration: string               // Narrative text accompanying the change
}

/**
 * Pressure level narration map (used by getPressureNarration).
 * Keys are 0–10. Rider B must implement all 11 levels.
 *
 *  0–1: "The world is quiet. Too quiet."
 *  2–3: "Distant sounds carry on the wind."
 *  4–5: "Something moves at the edge of your hearing."
 *  6–7: "Your heartbeat fills the silence."
 *  8–9: "Breathing becomes difficult. Your own fear is loud."
 *  10:  "The world holds its breath. Then screams."
 */
export type PressureLevel = 0 | 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10

export interface InitiativeTrigger {
  npcId: string
  triggerType: 'quest_flag' | 'faction_rep' | 'act_progression' | 'time_since_last_meeting'
  condition: (player: import('@/types/game').Player) => boolean
  initiativeMessage: string       // Message dispatched when trigger fires
}

// ============================================================
// PILLAR 3: Character Bonds
// Owner: Rider C (lib/companionSystem.ts, data/companionNarration.ts)
// ============================================================

export interface Companion {
  npcId: string
  joinedAt: number                // player.actionsTaken at join time
  questContext: string            // Why they joined (for farewell messages)
  canDie: boolean                 // Whether this companion can be permanently lost
}

export interface CompanionCommentary {
  contextKey: string              // Room tag or activity type (e.g. 'room_danger', 'activity_rest')
  narrative: string               // The companion's spoken aside
  weight: number                  // Relative selection weight (1 = normal, higher = more likely)
}

// ============================================================
// PILLAR 4: Consequence Cascades
// Owner: Rider D (lib/factionWeb.ts, lib/echoes.ts, data/convergenceEvents.ts)
// ============================================================

export interface SecondaryEffect {
  targetFaction: FactionType
  delta: number                   // Always ±1 per the contract (no large swings)
  delayActionCount: number        // 0 = immediate; >0 = announced via narration later
  narrationPhrase: string         // How this effect is explained to the player
}

export interface ConvergenceEvent {
  id: string
  factionA: FactionType
  factionB: FactionType
  questFlag: string               // e.g. 'act3_meridian_approach'
  simultaneousRequests: Array<{
    faction: FactionType
    request: string               // What this faction is asking
  }>
  narration: string               // Scene-setting narration when event fires
}

// ============================================================
// PILLAR 5: Discovery & Mystery
// Owner: Rider E (lib/narrativeKeys.ts, data/narrativeKeys/keys_by_zone.ts)
// ============================================================

export interface NarrativeKey {
  id: string                      // Unique key ID, e.g. 'sanguine_feed_hollow'
  sourceNpcId?: string            // NPC who teaches this key (if via dialogue)
  learnedVia: 'dialogue' | 'examination' | 'deduction'
  description: string             // Player-facing description (shown in journal)
}

export interface NarrativeGate {
  type: 'narrative_key'
  keyId: string                   // Single key requirement
  allOf?: string[]                // Multiple keys required (all must be learned)
}

// ============================================================
// PILLAR 6: Player Identity & Voice
// Owner: Rider F (lib/playerMonologue.ts, data/playerMonologues/class_*.ts)
// ============================================================

export type MonologueTrigger =
  | 'low_hp'
  | 'post_combat'
  | 'in_danger'
  | 'examining_loss_item'
  | 'safe_rest'
  | 'act_transition'
  | 'pressure_spike'

export interface MonologuePool {
  class: CharacterClass
  personalLoss: PersonalLossType
  trigger: MonologueTrigger
  lines: string[]                 // Always italicized: *"..."*
}

export interface MonologueContext {
  trigger: MonologueTrigger
  combatData?: {
    enemiesDefeated: number
    playerHpAfter: number
  }
  roomData?: {
    roomId: string
    hasEnemies: boolean
    zoneType: import('@/types/game').ZoneType
  }
  itemData?: {
    itemId: string
    isPersonalLossItem: boolean
  }
}

// ============================================================
// PILLAR 7: Narrator Voice
// Owner: Rider G (lib/narratorVoice.ts, data/narratorVoices.ts)
// ============================================================

export interface NarratorVoice {
  id: string
  act?: 1 | 2 | 3               // Optional act restriction (undefined = any act)
  zoneType?: import('@/types/game').ZoneType  // Optional zone restriction
  isDeliberatelyFalse?: boolean  // Marks unreliable foreshadowing (internal label only)
  text: string                   // Always prefaced with *"A voice not your own: ..."*
}

export interface NarratorConfig {
  baseSpawnChance: 0.05           // 5% per eligible action
  highPressureSpawnChance: 0.10  // 10% when hollowPressure >= 8
  highPressureThreshold: 8
  minActionsBetweenSpawns: 50    // Never fires more than once per 50 actions
  neverInCombat: true
}

// ============================================================
// PLAYER STATE EXTENSIONS (added by Rider H to lib/gameEngine.ts)
// These fields extend the existing Player type at runtime.
// Rider H is responsible for initializing and persisting them.
// Other Riders READ these fields but do not write them directly.
// ============================================================

export interface NarrativePlayerFields {
  hollowPressure: number          // 0–10 integer (PressureLevel)
  currentCompanion?: Companion    // Single active companion (or undefined)
  narrativeKeys: string[]         // Array of learned NarrativeKey IDs
}

// ============================================================
// CONVENIENCE RE-EXPORTS (so Riders only need one import)
// ============================================================

export type { FactionType, CharacterClass, PersonalLossType }
