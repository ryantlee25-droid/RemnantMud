// ============================================================
// hollowPressure.ts — STUB
// Convoy: remnant-narrative-0329
// Real implementation lives on branch:
//   convoy/remnant-narrative-0329/rider-dread
// This stub satisfies the import in gameEngine.ts until that
// branch is merged into staging.
// ============================================================

import type { GameMessage } from '@/types/game'
import type { PressureLevel } from '@/types/convoy-contracts'

/**
 * Recompute pressure based on actions since last tick.
 * Returns current pressure unchanged if fewer than 10 actions
 * have elapsed since the last tick.
 * Increments by 1 per 10 actions, capped at 10.
 */
export function computePressure(
  currentPressure: number,
  actionCount: number,
  lastPressureTick: number,
): number {
  const actionsSinceTick = actionCount - lastPressureTick
  const increments = Math.floor(actionsSinceTick / 10)
  if (increments <= 0) return currentPressure
  return Math.min(10, currentPressure + increments)
}

/**
 * Apply a delta to the current pressure, clamping to [0, 10].
 */
export function applyPressureDelta(
  currentPressure: number,
  delta: number,
): number {
  return Math.max(0, Math.min(10, currentPressure + delta))
}

/**
 * Returns ambient narration for the given pressure level.
 * Returns [] for quiet levels (0–1) — no narration needed.
 */
export function getPressureNarration(
  _level: PressureLevel,
): GameMessage[] {
  return []
}

/**
 * Returns a multiplier for hollow encounter base chance based on pressure.
 * Ranges 1.0 (quiet) to 2.0 (terror).
 */
export function getPressureEncounterModifier(level: number): number {
  if (level >= 8) return 2.0
  if (level >= 6) return 1.5
  if (level >= 4) return 1.25
  return 1.0
}

/**
 * Returns true when pressure reaches 10 (swarm trigger threshold).
 */
export function shouldTriggerSwarm(level: number): boolean {
  return level >= 10
}

/**
 * Returns a silence narration message — used when ambient sound stops
 * (a danger signal per the tone contract).
 */
export function getSilenceNarration(): GameMessage {
  return {
    id: crypto.randomUUID(),
    text: 'The sound stops. All of it, at once.',
    type: 'narrative',
  }
}

/**
 * Returns a mundane horror narration for a "safe" room, or null.
 * Fires at ~3% chance (internally gated).
 */
export function getMundaneHorrorNarration(
  _roomId: string,
): GameMessage | null {
  return null
}
