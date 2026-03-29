// ============================================================
// playerMonologue.ts — STUB
// Convoy: remnant-narrative-0329
// Real implementation lives on branch:
//   convoy/remnant-narrative-0329/rider-player-voice
// This stub satisfies the import in gameEngine.ts until that
// branch is merged into staging.
// ============================================================

import type { GameMessage, CharacterClass, PersonalLossType, ZoneType, FactionType } from '@/types/game'
import type { MonologueContext } from '@/types/convoy-contracts'

export interface PhysicalStateInput {
  hp: number
  maxHp: number
  cycle: number
  actionsTaken: number
  lastRestAt: number
  inCombat: boolean
  conditions: string[]
}

/**
 * Returns true ~15% of the time (non-combat only, enforced by caller).
 * Internally gated; caller should also check !inCombat before calling.
 */
export function shouldTriggerMonologue(): boolean {
  return Math.random() < 0.15
}

/**
 * Generates an inner monologue line for the player character.
 * Returns null if no matching pool is found.
 * Async because pools are dynamically loaded per class.
 */
export async function generateMonologue(
  _context: MonologueContext,
  _characterClass: CharacterClass,
  _personalLoss: PersonalLossType,
  _lossName?: string,
): Promise<GameMessage | null> {
  return null
}

/**
 * Returns a physical state narration based on HP/fatigue, or null.
 */
export function getPhysicalStateNarration(
  _input: PhysicalStateInput,
): GameMessage | null {
  return null
}

/**
 * Returns a reputation-flavored voice message on zone entry, or null.
 * Fires ~30% of the time (internally gated).
 */
export function getReputationVoice(
  _factionReputation: Partial<Record<FactionType, number>>,
  _zone: ZoneType,
  _cycle: number,
): GameMessage | null {
  return null
}

/**
 * Returns a personal loss echo message, or null.
 */
export function getPersonalLossEcho(
  _personalLoss: PersonalLossType,
  _zone: ZoneType,
): GameMessage | null {
  return null
}

/** Reset session deduplication (call on new game / new cycle). */
export function resetMonologueSession(): void {
  // no-op in stub
}
