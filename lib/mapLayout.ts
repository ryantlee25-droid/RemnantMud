// ============================================================
// lib/mapLayout.ts — STUB for H3 test compatibility
// This file is a minimal stub created by Howler H3 to allow
// tests to run before Howler H2 provides the real implementation.
// H2 will replace this file with the full implementation on merge.
// ============================================================

import type { Room } from '@/types/game'

export interface LayoutResult {
  positions: Map<string, { x: number; y: number }>
  bounds: { minX: number; maxX: number; minY: number; maxY: number }
}

export function computeLayout(
  _rooms: Room[],
  _anchorRoomId: string,
  _visitedIds: Set<string>,
  _radius?: number,
): LayoutResult {
  return {
    positions: new Map(),
    bounds: { minX: 0, maxX: 0, minY: 0, maxY: 0 },
  }
}
