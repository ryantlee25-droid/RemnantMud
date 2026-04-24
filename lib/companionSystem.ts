// ============================================================
// lib/companionSystem.ts
// Companion system — join, leave, commentary, personal moments.
//
// CONTRACT INVARIANTS:
// - Only 1 companion at a time (enforced by addCompanion)
// - removeCompanion always dispatches a farewell message
// - Commentary is append-only (never replaces room description)
// - Commentary spawn chance is exactly 0.20 (20%) per room entry
// - Personal moment chance is exactly 0.05 (5%), after 10+ rooms
// - Companion loss is permanent per cycle
// - No imports from lib/gameEngine.ts
// ============================================================

import type { Companion, CompanionCommentary } from '@/types/convoy-contracts'
import type { GameMessage, Player, ZoneType } from '@/types/game'
import { msg } from '@/lib/messages'
import { rt } from '@/lib/richText'
import {
  COMPANION_NARRATION_POOLS,
  COMPANION_COMBAT_REACTIONS,
  COMPANION_DISCOVERY_REACTIONS,
  PERSONAL_MOMENTS,
  CTX_RUINS,
  CTX_SETTLEMENT,
  CTX_NIGHT,
  CTX_DANGER,
  CTX_REST,
  CTX_TECH,
  CTX_OPEN,
  CTX_DEEP,
  CTX_GENERIC,
  HOWARD_JOIN_NARRATION,
  HOWARD_LEAVE_NARRATION,
  LEV_JOIN_NARRATION,
  LEV_LEAVE_NARRATION,
  AVERY_JOIN_NARRATION,
  AVERY_LEAVE_NARRATION,
  PATCH_JOIN_NARRATION,
  PATCH_LEAVE_NARRATION,
  VESPER_JOIN_NARRATION,
  VESPER_LEAVE_NARRATION,
  CROSS_JOIN_NARRATION,
  CROSS_LEAVE_NARRATION,
  SPARKS_JOIN_NARRATION,
  SPARKS_LEAVE_NARRATION,
  COMPANION_INTRODUCTIONS,
} from '@/data/companionNarration'
import type { CombatOutcome } from '@/data/companionNarration'

// ------------------------------------------------------------
// Context passed from GameEngine on room entry
// ------------------------------------------------------------

export interface CompanionContext {
  zone: ZoneType
  difficulty: number              // room.difficulty 1–5
  timeOfDay: 'dawn' | 'day' | 'dusk' | 'night'
  playerHpPercent: number         // 0.0–1.0
  isPostCombat: boolean
  isPostDiscovery: boolean
  isSafeRest: boolean
  roomsTogether: number           // how many rooms the companion has been in
}

// ------------------------------------------------------------
// Per-NPC join / leave narration registry
// ------------------------------------------------------------

const JOIN_NARRATION: Record<string, string[]> = {
  howard_bridge_keeper: HOWARD_JOIN_NARRATION,
  lev: LEV_JOIN_NARRATION,
  avery_kindling: AVERY_JOIN_NARRATION,
  patch: PATCH_JOIN_NARRATION,
  vesper: VESPER_JOIN_NARRATION,
  marshal_cross: CROSS_JOIN_NARRATION,
  sparks_radio: SPARKS_JOIN_NARRATION,
}

const LEAVE_NARRATION: Record<string, Record<string, string[]>> = {
  howard_bridge_keeper: HOWARD_LEAVE_NARRATION,
  lev: LEV_LEAVE_NARRATION,
  avery_kindling: AVERY_LEAVE_NARRATION,
  patch: PATCH_LEAVE_NARRATION,
  vesper: VESPER_LEAVE_NARRATION,
  marshal_cross: CROSS_LEAVE_NARRATION,
  sparks_radio: SPARKS_LEAVE_NARRATION,
}

// ------------------------------------------------------------
// Internal helpers
// ------------------------------------------------------------

/** Pick a uniformly random element from an array. */
function pick<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)]
}

/** Weighted random selection from CompanionCommentary entries. */
function weightedPick(entries: CompanionCommentary[]): CompanionCommentary {
  const total = entries.reduce((sum, e) => sum + e.weight, 0)
  let roll = Math.random() * total
  for (const entry of entries) {
    roll -= entry.weight
    if (roll <= 0) return entry
  }
  return entries[entries.length - 1]
}

/**
 * Resolve which commentary context key to use for the current room.
 * Priority: specific contextual matches over generic fallback.
 */
function resolveContextKey(ctx: CompanionContext): string {
  if (ctx.isSafeRest) return CTX_REST
  if (ctx.difficulty >= 4) return CTX_DANGER
  if (ctx.timeOfDay === 'night') return CTX_NIGHT
  // Zone-to-context mapping
  const zoneMap: Partial<Record<ZoneType, string>> = {
    the_stacks: CTX_TECH,
    the_deep: CTX_DEEP,
    river_road: CTX_OPEN,
    the_pine_sea: CTX_OPEN,
    the_dust: CTX_OPEN,
    the_scar: CTX_RUINS,
    the_breaks: CTX_RUINS,
    the_pens: CTX_RUINS,
    crossroads: CTX_SETTLEMENT,
    covenant: CTX_SETTLEMENT,
    salt_creek: CTX_SETTLEMENT,
    the_ember: CTX_SETTLEMENT,
    duskhollow: CTX_SETTLEMENT,
  }
  return zoneMap[ctx.zone] ?? CTX_GENERIC
}

// ------------------------------------------------------------
// Public API
// ------------------------------------------------------------

/**
 * Get the introduction scene for a companion BEFORE they join.
 * Returns an array of narrative messages establishing who they are,
 * why they'd travel with you, and what they bring.
 * Returns null if no introduction exists for this NPC.
 *
 * Call this BEFORE addCompanion — the introduction fires before the
 * join message. The caller is responsible for dispatching these
 * messages to the player.
 */
export function getCompanionIntroduction(npcId: string): GameMessage[] | null {
  const pool = COMPANION_INTRODUCTIONS[npcId]
  if (!pool || pool.length === 0) return null

  // Return the full introduction scene — all lines in sequence
  return pool.map((line) => msg(line))
}

/**
 * Add a companion to the player.
 * Returns null if a companion is already active (single companion rule).
 */
export function addCompanion(
  npcId: string,
  questContext: string,
  actionCount: number,
  canDie: boolean = true,
): Companion | null {
  // Single companion invariant: caller must check player.currentCompanion
  // before calling this. We return null to signal refusal.
  if (!JOIN_NARRATION[npcId]) {
    // Unknown NPC — no narration pool, refuse silently
    return null
  }
  return {
    npcId,
    joinedAt: actionCount,
    questContext,
    canDie,
  }
}

/**
 * Generate the join message for displaying when a companion joins.
 * Called immediately after addCompanion returns a non-null Companion.
 */
export function getCompanionJoinMessage(companion: Companion): GameMessage {
  const pool = JOIN_NARRATION[companion.npcId]
  if (!pool || pool.length === 0) {
    const npcTag = rt.npc(companion.npcId)
    return msg(`${npcTag} joins you.`)
  }
  return msg(pick(pool))
}

/**
 * Remove a companion and return farewell messages.
 * CONTRACT: always dispatches at least one farewell message.
 */
export function removeCompanion(
  companion: Companion,
  reason: 'quest_complete' | 'player_choice' | 'death' | 'separation',
): GameMessage[] {
  const npcLeave = LEAVE_NARRATION[companion.npcId]
  if (!npcLeave) {
    const npcTag = rt.npc(companion.npcId)
    return [msg(`${npcTag} is gone.`)]
  }

  const pool = npcLeave[reason] ?? npcLeave['player_choice'] ?? []
  if (pool.length === 0) {
    const npcTag = rt.npc(companion.npcId)
    return [msg(`${npcTag} is gone.`)]
  }

  const farewell = pick(pool)
  return [msg(farewell)]
}

/**
 * Get a commentary message for a companion on room entry.
 * 20% chance to fire. Returns null on the other 80%.
 * Called once per room entry (Rider H responsibility).
 */
export function getCompanionCommentary(
  companion: Companion,
  ctx: CompanionContext,
): GameMessage | null {
  // Exactly 20% spawn chance — non-configurable
  if (Math.random() > 0.20) return null

  const pool = COMPANION_NARRATION_POOLS[companion.npcId]
  if (!pool || pool.length === 0) return null

  const contextKey = resolveContextKey(ctx)

  // Prefer exact context match, fall back to generic
  const matchingEntries = pool.filter(e => e.contextKey === contextKey)
  const fallbackEntries = pool.filter(e => e.contextKey === CTX_GENERIC)

  const candidates = matchingEntries.length > 0 ? matchingEntries : fallbackEntries
  if (candidates.length === 0) return null

  const entry = weightedPick(candidates)
  return msg(entry.narrative)
}

/**
 * Get a companion's reaction to a combat outcome.
 * Always returns a message — no chance gate (combat reactions are guaranteed).
 */
export function getCompanionCombatReaction(
  companion: Companion,
  outcome: CombatOutcome,
): GameMessage {
  const npcReactions = COMPANION_COMBAT_REACTIONS[companion.npcId]
  if (!npcReactions) {
    return msg(`${rt.npc(companion.npcId)} catches their breath.`)
  }

  const pool = npcReactions[outcome]
  if (!pool || pool.length === 0) {
    return msg(`${rt.npc(companion.npcId)} says nothing.`)
  }

  return msg(pick(pool))
}

/**
 * Get a companion's reaction to a discovery.
 * Always returns a message — no chance gate.
 */
export function getCompanionDiscoveryReaction(
  companion: Companion,
  discoveryType: string,
): GameMessage {
  const npcReactions = COMPANION_DISCOVERY_REACTIONS[companion.npcId]
  if (!npcReactions) {
    return msg(`${rt.npc(companion.npcId)} leans in to look.`)
  }

  const reaction = npcReactions[discoveryType] ?? npcReactions['default']
  if (!reaction) {
    return msg(`${rt.npc(companion.npcId)} examines the discovery.`)
  }

  return msg(reaction)
}

/**
 * Get a rare personal moment with a companion.
 * 5% chance to fire, only after 10+ rooms together.
 * Returns null most of the time — caller should NOT gate on rooms; this
 * function enforces the minRoomsTogether check internally.
 */
export function getPersonalMoment(
  companion: Companion,
  roomsTogetherCount: number,
): GameMessage | null {
  // Must have been together 10+ rooms
  if (roomsTogetherCount < 10) return null

  // Exactly 5% spawn chance — non-configurable
  if (Math.random() > 0.05) return null

  // Find eligible moments for this companion
  const eligible = PERSONAL_MOMENTS.filter(
    m => m.npcId === companion.npcId && roomsTogetherCount >= m.minRoomsTogether,
  )

  if (eligible.length === 0) return null

  const moment = pick(eligible)
  return msg(moment.description)
}

// ------------------------------------------------------------
// Utility: check if an NPC is companion-eligible
// ------------------------------------------------------------

export function isCompanionEligible(npcId: string): boolean {
  return npcId in COMPANION_NARRATION_POOLS
}
