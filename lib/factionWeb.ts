// ============================================================
// factionWeb.ts — STUB
// Convoy: remnant-narrative-0329
// Real implementation lives on branch:
//   convoy/remnant-narrative-0329/rider-consequences
// This stub satisfies the import in gameEngine.ts until that
// branch is merged into staging.
// ============================================================

import type { GameMessage, Player, FactionType } from '@/types/game'
import type { SecondaryEffect } from '@/types/convoy-contracts'

export const FACTION_EFFECTS: Record<string, SecondaryEffect[]> = {}

export function getFactionRipple(
  _sourceFaction: FactionType,
  _repDelta: number,
  _player: Player,
): { effects: SecondaryEffect[]; narration: GameMessage[] } {
  return { effects: [], narration: [] }
}

export function getDelayedRippleNarration(
  _effect: SecondaryEffect,
  _actionsSince: number,
): GameMessage | null {
  return null
}

export function checkNPCDeathTrigger(
  _npcId: string,
  _player: Player,
): { shouldDie: boolean; narration: GameMessage[] } | null {
  return null
}

export function getNPCForeshadowing(
  _npcId: string,
): GameMessage | null {
  return null
}

export function getNPCAbsenceNarration(
  _npcId: string,
  _activeFlags: string[],
): GameMessage[] {
  return []
}

export function checkConvergenceReady(_player: Player): boolean {
  return false
}

export function getConvergenceNarration(_player: Player): GameMessage[] {
  return []
}
