import type { ZoneType } from '@/types/game'
import { ALL_ROOMS } from '@/data/rooms/index'

export interface ZoneMeta {
  label: string
  color: string       // Tailwind class (text-*) — PipBoy-safe only
  dangerTier: number  // 1-5
}

// PipBoy-safe palette only: amber, red, green, blue, cyan, orange
// Compute dangerTier at module load = max(room.difficulty) for each zone
function buildZoneMeta(): Record<ZoneType, ZoneMeta> {
  // Static label + color assignments
  const STATIC: Record<ZoneType, { label: string; color: string }> = {
    crossroads:   { label: 'Crossroads',   color: 'text-amber-400' },
    river_road:   { label: 'River Road',   color: 'text-green-500' },
    covenant:     { label: 'Covenant',     color: 'text-blue-400'  },
    salt_creek:   { label: 'Salt Creek',   color: 'text-cyan-500'  },
    the_ember:    { label: 'The Ember',    color: 'text-orange-500' },
    the_breaks:   { label: 'The Breaks',   color: 'text-amber-600' },
    the_dust:     { label: 'The Dust',     color: 'text-amber-500' },
    the_stacks:   { label: 'The Stacks',   color: 'text-cyan-400'  },
    duskhollow:   { label: 'Duskhollow',   color: 'text-blue-500'  },
    the_deep:     { label: 'The Deep',     color: 'text-blue-600'  },
    the_pine_sea: { label: 'The Pine Sea', color: 'text-green-400' },
    the_scar:     { label: 'The Scar',     color: 'text-red-500'   },
    the_pens:     { label: 'The Pens',     color: 'text-red-400'   },
  }

  // Compute max difficulty per zone from ALL_ROOMS
  const maxDifficulty = new Map<ZoneType, number>()
  for (const room of ALL_ROOMS) {
    const zone = room.zone as ZoneType
    const current = maxDifficulty.get(zone) ?? 0
    if (room.difficulty > current) {
      maxDifficulty.set(zone, room.difficulty)
    }
  }

  const result = {} as Record<ZoneType, ZoneMeta>
  for (const zone of Object.keys(STATIC) as ZoneType[]) {
    result[zone] = {
      label: STATIC[zone].label,
      color: STATIC[zone].color,
      dangerTier: maxDifficulty.get(zone) ?? 1,
    }
  }
  return result
}

export const ZONE_META: Record<ZoneType, ZoneMeta> = buildZoneMeta()

// Hex equivalents of each chosen Tailwind color class for SVG use (Tailwind v4 palette)
export const ZONE_HEX: Record<ZoneType, string> = {
  crossroads:   '#fbbf24',  // amber-400
  river_road:   '#22c55e',  // green-500
  covenant:     '#60a5fa',  // blue-400
  salt_creek:   '#06b6d4',  // cyan-500
  the_ember:    '#f97316',  // orange-500
  the_breaks:   '#d97706',  // amber-600
  the_dust:     '#f59e0b',  // amber-500
  the_stacks:   '#22d3ee',  // cyan-400
  duskhollow:   '#3b82f6',  // blue-500
  the_deep:     '#2563eb',  // blue-600
  the_pine_sea: '#4ade80',  // green-400
  the_scar:     '#ef4444',  // red-500
  the_pens:     '#f87171',  // red-400
}
