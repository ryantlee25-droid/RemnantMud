// ============================================================
// npcInitiative.ts — STUB
// Convoy: remnant-narrative-0329
// Real implementation lives on branch:
//   convoy/remnant-narrative-0329/rider-dread
// This stub satisfies the import in gameEngine.ts until that
// branch is merged into staging.
// ============================================================

import type { GameMessage, Player } from '@/types/game'
import type { InitiativeTrigger } from '@/types/convoy-contracts'

export const INITIATIVE_TRIGGERS: InitiativeTrigger[] = []

export function checkInitiativeTriggers(
  _player: Player,
  _roomId: string,
  _actionCount: number,
): InitiativeTrigger | null {
  return null
}

export function getInitiativeNarration(
  _trigger: InitiativeTrigger,
): GameMessage[] {
  return []
}
