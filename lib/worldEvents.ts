// ============================================================
// worldEvents.ts — World Event System
// Convoy: remnant-narrative-0329 | Rider A
//
// Timed narrative events that fire on action count intervals.
// Pure functions — no Supabase, no state mutations.
// ============================================================

import { msg } from '@/lib/messages'
import type { GameMessage, Player } from '@/types/game'
import type { WorldEvent } from '@/types/convoy-contracts'

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
  // Lazy import at call site to avoid circular deps when test data
  // is loaded. The actual event arrays are passed in via ALL_WORLD_EVENTS.
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

// ============================================================
// Master event registry — populated by data files below.
// Data files import nothing from lib (per architectural invariant 4.3).
// This file is the sole aggregation point.
// ============================================================

import { ACT1_EVENTS } from '@/data/worldEvents/act1_events'
import { ACT2_EVENTS } from '@/data/worldEvents/act2_events'
import { ACT3_EVENTS } from '@/data/worldEvents/act3_events'

export const ALL_WORLD_EVENTS: WorldEvent[] = [
  ...ACT1_EVENTS,
  ...ACT2_EVENTS,
  ...ACT3_EVENTS,
]
