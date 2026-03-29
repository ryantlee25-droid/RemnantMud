// ============================================================
// worldEvents.ts — STUB
// Convoy: remnant-narrative-0329
// Real implementation lives on branch:
//   convoy/remnant-narrative-0329/rider-world-events
// This stub satisfies the import in gameEngine.ts until that
// branch is merged into staging.
// ============================================================

import type { GameMessage, Player } from '@/types/game'
import type { WorldEvent } from '@/types/convoy-contracts'

export function getScheduledEvents(
  _actionCount: number,
  _currentAct: 1 | 2 | 3,
  _player: Player,
): WorldEvent[] {
  return []
}

export function executeWorldEvent(
  _event: WorldEvent,
  _player: Player,
): GameMessage[] {
  return []
}
