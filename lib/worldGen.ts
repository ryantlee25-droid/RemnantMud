// ============================================================
// worldGen.ts — Static world loader for The Remnant
// The world is hand-crafted, not procedural.
// Seed is kept for interface compatibility but not used for generation.
// ============================================================

import type { Room } from '@/types/game'
import { ALL_ROOMS } from '@/data/rooms/index'

let _roomCache: Room[] | null = null

export function generateWorld(_seed: number): Room[] {
  if (_roomCache) return _roomCache
  _roomCache = ALL_ROOMS
  return _roomCache
}

export function generateSeed(): number {
  // Seed no longer drives generation but is still stored on the player row
  return Math.floor(Math.random() * 2_147_483_647)
}
