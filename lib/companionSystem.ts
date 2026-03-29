// ============================================================
// companionSystem.ts — STUB
// Convoy: remnant-narrative-0329
// Real implementation lives on branch:
//   convoy/remnant-narrative-0329/rider-companions
// This stub satisfies the import in gameEngine.ts until that
// branch is merged into staging.
// ============================================================

import type { GameMessage } from '@/types/game'
import type { Companion } from '@/types/convoy-contracts'

export interface CompanionContext {
  zone: string
  difficulty: number
  timeOfDay: string
  playerHpPercent: number
  isPostCombat: boolean
  isPostDiscovery: boolean
  isSafeRest: boolean
  roomsTogether: number
}

export function addCompanion(
  _npcId: string,
  _questContext: string,
  _actionCount: number,
  _canDie: boolean,
): Companion | null {
  return null
}

export function removeCompanion(
  _companion: Companion,
): GameMessage[] {
  return []
}

export function getCompanionCommentary(
  _companion: Companion,
  _context: CompanionContext,
): GameMessage | null {
  return null
}

export function getCompanionCombatReaction(
  _companion: Companion,
  _outcome: 'victory' | 'close_call' | 'retreat',
): GameMessage {
  return {
    id: crypto.randomUUID(),
    text: '',
    type: 'narrative',
  }
}

export function getPersonalMoment(
  _companion: Companion,
  _roomsTogetherCount: number,
): GameMessage | null {
  return null
}
