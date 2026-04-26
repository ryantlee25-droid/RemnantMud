// ============================================================
// worldEvents.ts — World Event System
// Convoy: remnant-narrative-0329 | Rider A
//
// Timed narrative events that fire on action count intervals.
// Pure functions — no Supabase, no state mutations.
// ============================================================

import { msg } from '@/lib/messages'
import type { GameMessage, Player, FactionType, GameState } from '@/types/game'
import type { WorldEvent } from '@/types/convoy-contracts'
import { ACT1_EVENTS, ALL_COMBAT_ACT1_EVENTS } from '@/data/worldEvents/act1_events'
import { ACT2_EVENTS, ALL_COMBAT_ACT2_EVENTS } from '@/data/worldEvents/act2_events'
import { ACT3_EVENTS } from '@/data/worldEvents/act3_events'

// ============================================================
// Combat Event Extension (Convoy 1 — H8)
//
// convoy-contracts.d.ts is FROZEN. Per Blue's plan (§ Open
// Questions, R6), we extend WorldEvent here rather than in
// the frozen file. CombatWorldEvent is a structural supertype —
// all existing WorldEvent fields are preserved; combatParticipation
// is purely additive and optional.
// ============================================================

/** Enemies injected into the player's room when a combat event fires. */
export interface CombatParticipation {
  /** Enemy IDs from data/enemies.ts to spawn into the player's room. */
  enemyIds: string[]
  /** Number of additional copies of each enemy to spawn (default 1). */
  swarmSize?: number
  /** Faction fighting alongside the player, if any (narrative label only). */
  factionId?: FactionType
}

/**
 * WorldEvent + optional combat injection block.
 * Fully backward-compatible — events without combatParticipation behave
 * identically to plain WorldEvents.
 */
export interface CombatWorldEvent extends WorldEvent {
  combatParticipation?: CombatParticipation
  /**
   * Zone restriction — event only fires in this zone.
   * Checked by getScheduledCombatEvents against player's current room zone.
   */
  zoneGate?: string
  /**
   * Minimum hollow pressure required to fire this event.
   * Checked against player.hollowPressure (defaults to 0 if absent).
   */
  minPressure?: number
}

// ============================================================
// Core Scheduling
// ============================================================

/**
 * Returns all events that should fire at the given action count.
 *
 * An event fires when:
 *   actionCount % event.triggerActionCount === 0
 *   AND event.act matches currentAct
 *   AND faction gate passes (if present)
 *   AND quest gate passes (if present)
 *
 * Events from prior acts do NOT fire in later acts.
 */
export function getScheduledEvents(
  actionCount: number,
  currentAct: 1 | 2 | 3,
  playerState: Pick<Player, 'factionReputation' | 'questFlags'>
): WorldEvent[] {
  return ALL_WORLD_EVENTS.filter(event => {
    // Act gate — exact match only (no bleed between acts)
    if (event.act !== currentAct) return false

    // Trigger interval — fires on multiples of triggerActionCount
    if (actionCount === 0) return false
    if (actionCount % event.triggerActionCount !== 0) return false

    // Quest gate — event only fires if quest flag is set
    if (event.questGate) {
      const flags = playerState.questFlags ?? {}
      if (!flags[event.questGate]) return false
    }

    // Faction gate — event fires only within rep range
    if (event.factionCheck) {
      const { faction, minRep, maxRep } = event.factionCheck
      const rep = playerState.factionReputation?.[faction] ?? 0
      if (minRep !== undefined && rep < minRep) return false
      if (maxRep !== undefined && rep > maxRep) return false
    }

    return true
  })
}

/**
 * Returns combat world events that should fire, with additional guards:
 * - Does NOT fire when player is in active combat (state.combatState?.active)
 * - Does NOT fire when player is in dialogue (state.activeDialogue)
 * - Respects zoneGate (current room zone must match)
 * - Respects minPressure (player.hollowPressure must meet minimum)
 *
 * Intended to be called from the game engine post-move block,
 * after getScheduledEvents for narrative events.
 */
export function getScheduledCombatEvents(
  actionCount: number,
  currentAct: 1 | 2 | 3,
  playerState: Pick<Player, 'factionReputation' | 'questFlags' | 'hollowPressure'>,
  state: Pick<GameState, 'combatState' | 'activeDialogue' | 'currentRoom'>
): CombatWorldEvent[] {
  // Hard guard: never fire during active combat
  if (state.combatState?.active) return []

  // Hard guard: never fire during dialogue
  if (state.activeDialogue) return []

  const currentZone = state.currentRoom?.zone

  return ALL_COMBAT_EVENTS.filter(event => {
    // Act gate
    if (event.act !== currentAct) return false

    // Trigger interval
    if (actionCount === 0) return false
    if (actionCount % event.triggerActionCount !== 0) return false

    // Quest gate
    if (event.questGate) {
      const flags = playerState.questFlags ?? {}
      if (!flags[event.questGate]) return false
    }

    // Faction gate
    if (event.factionCheck) {
      const { faction, minRep, maxRep } = event.factionCheck
      const rep = playerState.factionReputation?.[faction] ?? 0
      if (minRep !== undefined && rep < minRep) return false
      if (maxRep !== undefined && rep > maxRep) return false
    }

    // Zone gate — combat events are often zone-specific
    if (event.zoneGate && event.zoneGate !== currentZone) return false

    // Pressure gate
    if (event.minPressure !== undefined) {
      const pressure = playerState.hollowPressure ?? 0
      if (pressure < event.minPressure) return false
    }

    return true
  })
}

/**
 * Executes a world event, selecting one message from its pool at random.
 * Returns narrative GameMessages. Never mutates playerState.
 */
export function executeWorldEvent(
  event: WorldEvent,
  // playerState unused currently but present for future gating
  _playerState: Pick<Player, 'factionReputation' | 'questFlags'>
): GameMessage[] {
  const pool = event.messagePool
  if (pool.length === 0) return []

  const selected = pool[Math.floor(Math.random() * pool.length)]
  return [msg(selected, 'narrative')]
}

/**
 * Executes a combat world event. Returns narrative messages; the caller
 * is responsible for acting on event.combatParticipation to inject
 * enemies into the current room.
 */
export function executeCombatWorldEvent(
  event: CombatWorldEvent,
  _playerState: Pick<Player, 'factionReputation' | 'questFlags'>
): GameMessage[] {
  return executeWorldEvent(event, _playerState)
}

// ============================================================
// Master event registry — populated by data files above.
// Data files import nothing from lib (per architectural invariant 4.3).
// This file is the sole aggregation point.
// ============================================================

export const ALL_WORLD_EVENTS: WorldEvent[] = [
  ...ACT1_EVENTS,
  ...ACT2_EVENTS,
  ...ACT3_EVENTS,
]

// Combat events authored as CombatWorldEvent. Kept separate from
// ALL_WORLD_EVENTS to avoid double-firing; callers invoke
// getScheduledCombatEvents independently of getScheduledEvents.
export const ALL_COMBAT_EVENTS: CombatWorldEvent[] = [
  ...ALL_COMBAT_ACT1_EVENTS,
  ...ALL_COMBAT_ACT2_EVENTS,
]
