// ============================================================
// narratorVoice.ts — STUB
// Convoy: remnant-narrative-0329
// Real implementation lives on branch:
//   convoy/remnant-narrative-0329/rider-narrator
// This stub satisfies the import in gameEngine.ts until that
// branch is merged into staging.
// ============================================================

import type { GameMessage, ZoneType, PersonalLossType } from '@/types/game'

export interface NarratorContext {
  act: 1 | 2 | 3
  zone: ZoneType
  cycle: number
  pressure: number
  questFlags: string[]
  playerHP: number
  playerMaxHP: number
  personalLoss?: PersonalLossType
  recentDeath: boolean
}

/**
 * Returns true if the narrator should speak this action.
 * Base chance: 5%; doubles to 10% at pressure >= 8.
 * Never fires more than once per 50 actions.
 * Never fires in combat (caller must check).
 */
export function shouldNarratorSpeak(
  actionCount: number,
  lastNarratorAction: number,
  pressure: number,
  inCombat: boolean,
): boolean {
  if (inCombat) return false
  if (actionCount - lastNarratorAction < 50) return false
  const chance = pressure >= 8 ? 0.10 : 0.05
  return Math.random() < chance
}

/**
 * Returns a narrator whisper GameMessage, or null if no matching
 * whisper is available (deduplication exhausted).
 */
export function generateNarratorVoice(
  _context: NarratorContext,
): GameMessage | null {
  return null
}

/**
 * Returns act transition narration messages (always fires, not probabilistic).
 */
export function getNarratorActTransition(
  _fromAct: 1 | 2,
  _toAct: 2 | 3,
): GameMessage[] {
  return []
}

/** Reset session deduplication (call on new game / new cycle). */
export function clearNarratorSession(): void {
  // no-op in stub
}
