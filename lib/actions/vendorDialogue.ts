// ============================================================
// lib/actions/vendorDialogue.ts — Vendor personality system
// Dispatch greeting, farewell, budget, and item comments for
// vendor NPCs. Called from lib/actions/trade.ts.
// ============================================================

import type { NPC, GameMessage } from '@/types/game'
import { systemMsg } from '@/lib/messages'

// ------------------------------------------------------------
// Internal helpers
// ------------------------------------------------------------

/** Pick a random element from an array. Returns undefined if array is empty. */
function pickRandom<T>(arr: T[]): T | undefined {
  if (arr.length === 0) return undefined
  return arr[Math.floor(Math.random() * arr.length)]
}

// ------------------------------------------------------------
// Public API (matches CONTRACT.md C3 spec)
// ------------------------------------------------------------

/**
 * Dispatch vendor greeting message. Call at start of handleTrade().
 * Returns undefined if NPC has no vendorGreeting.
 */
export function dispatchVendorGreeting(npc: NPC): GameMessage | undefined {
  if (!npc.vendorGreeting) return undefined
  return systemMsg(npc.vendorGreeting)
}

/**
 * Dispatch vendor farewell message. Call when trade session ends.
 * Returns undefined if NPC has no vendorFarewell.
 */
export function dispatchVendorFarewell(npc: NPC): GameMessage | undefined {
  if (!npc.vendorFarewell) return undefined
  return systemMsg(npc.vendorFarewell)
}

/**
 * Dispatch budget display line. Call after wares listing in handleTrade().
 * Returns undefined if NPC has no vendorBudget.
 */
export function dispatchVendorBudget(npc: NPC): GameMessage | undefined {
  if (npc.vendorBudget === undefined) return undefined
  const rounds = Math.round(npc.vendorBudget)
  return systemMsg(`Vendor's budget: ${rounds} rounds`)
}

/**
 * Roll and dispatch a vendor comment for a given item. Call after successful sell.
 * Returns undefined if NPC has no vendorComments for this itemId.
 */
export function dispatchVendorComment(npc: NPC, itemId: string): GameMessage | undefined {
  if (!npc.vendorComments) return undefined
  const pool = npc.vendorComments[itemId]
  if (!pool || pool.length === 0) return undefined
  const comment = pickRandom(pool)
  if (!comment) return undefined
  return systemMsg(comment)
}
