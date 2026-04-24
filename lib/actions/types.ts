// ============================================================
// lib/actions/types.ts — Shared interface for action handlers
// ============================================================

import type { GameState, GameMessage, Room, Player, FactionType } from '@/types/game'

/**
 * Minimal surface of GameEngine that action handlers need.
 * Keeps action modules decoupled from the full class.
 */
export interface EngineCore {
  getState(): GameState
  _setState(partial: Partial<GameState>): void
  _appendMessages(messages: GameMessage[]): void
  _savePlayer(): Promise<void>
  _applyPopulation(room: Room): Room
  _handlePlayerDeath(): Promise<void>
  _checkLevelUp(): void
  adjustReputation(faction: FactionType, delta: number): Promise<void>
  setQuestFlag(flag: string, value: string | boolean | number): Promise<void>
  grantNarrativeKey(keyId: string, source: 'dialogue' | 'examination' | 'deduction'): Promise<void>
}
