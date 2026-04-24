// ============================================================
// data/zoneMetadata.ts — STUB for H3 test compatibility
// This file is a minimal stub created by Howler H3 to allow
// tests to run before Howler H2 provides the real implementation.
// H2 will replace this file with the full implementation on merge.
// ============================================================

import type { ZoneType } from '@/types/game'

export interface ZoneMeta {
  label: string
  color: string       // Tailwind class (text-*)
  dangerTier: number  // 1-5
}

export const ZONE_META: Record<ZoneType, ZoneMeta> = {
  crossroads:    { label: 'The Crossroads',   color: 'text-amber-400',   dangerTier: 1 },
  river_road:    { label: 'River Road',        color: 'text-blue-400',    dangerTier: 2 },
  covenant:      { label: 'The Covenant',      color: 'text-purple-400',  dangerTier: 2 },
  salt_creek:    { label: 'Salt Creek',         color: 'text-yellow-400',  dangerTier: 2 },
  the_ember:     { label: 'The Ember',          color: 'text-red-400',     dangerTier: 5 },
  the_breaks:    { label: 'The Breaks',         color: 'text-orange-400',  dangerTier: 3 },
  the_dust:      { label: 'The Dust',           color: 'text-gray-400',    dangerTier: 3 },
  the_stacks:    { label: 'The Stacks',         color: 'text-green-400',   dangerTier: 4 },
  duskhollow:    { label: 'Duskhollow',         color: 'text-indigo-400',  dangerTier: 4 },
  the_deep:      { label: 'The Deep',           color: 'text-cyan-400',    dangerTier: 5 },
  the_pine_sea:  { label: 'The Pine Sea',       color: 'text-emerald-400', dangerTier: 3 },
  the_scar:      { label: 'The Scar',           color: 'text-rose-400',    dangerTier: 5 },
  the_pens:      { label: 'The Pens',           color: 'text-stone-400',   dangerTier: 4 },
}

export const ZONE_HEX: Record<ZoneType, string> = {
  crossroads:    '#d97706',
  river_road:    '#3b82f6',
  covenant:      '#a855f7',
  salt_creek:    '#eab308',
  the_ember:     '#ef4444',
  the_breaks:    '#f97316',
  the_dust:      '#6b7280',
  the_stacks:    '#22c55e',
  duskhollow:    '#6366f1',
  the_deep:      '#06b6d4',
  the_pine_sea:  '#10b981',
  the_scar:      '#f43f5e',
  the_pens:      '#78716c',
}
