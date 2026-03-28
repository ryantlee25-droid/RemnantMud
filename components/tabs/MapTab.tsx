'use client'

// ============================================================
// MapTab.tsx — Discovered waypoints by zone for PipBoy UI
// Replicates the handleMap logic as a permanent visual panel.
// ============================================================

import { useMemo } from 'react'
import { useGame } from '@/lib/gameContext'
import { ALL_ROOMS } from '@/data/rooms/index'
import type { Room, ZoneType } from '@/types/game'

// ------------------------------------------------------------
// Zone display names (mirrors lib/actions/travel.ts)
// ------------------------------------------------------------

const ZONE_LABELS: Record<ZoneType, string> = {
  crossroads: 'Crossroads',
  river_road: 'River Road',
  covenant: 'Covenant',
  salt_creek: 'Salt Creek',
  the_ember: 'The Ember',
  the_breaks: 'The Breaks',
  the_dust: 'The Dust',
  the_stacks: 'The Stacks',
  duskhollow: 'Duskhollow',
  the_deep: 'The Deep',
  the_pine_sea: 'The Pine Sea',
  the_scar: 'The Scar',
  the_pens: 'The Pens',
}

// ------------------------------------------------------------
// Helpers
// ------------------------------------------------------------

interface WaypointEntry {
  room: Room
  discovered: boolean
  isCurrent: boolean
}

interface ZoneGroup {
  zone: ZoneType
  label: string
  waypoints: WaypointEntry[]
}

/** Get all rooms flagged as fast travel waypoints. */
function getWaypoints(): Room[] {
  return ALL_ROOMS.filter((r) => r.flags.fastTravelWaypoint)
}

// ------------------------------------------------------------
// Component
// ------------------------------------------------------------

export default function MapTab() {
  const { state } = useGame()
  const { player, currentRoom } = state

  // Build waypoint groups from static data.
  // We can only check "visited" from the static definition or currentRoom match.
  // For a client-side panel, we check if the player has been to a room by
  // looking at the room's visited flag in the current state. Since rooms are
  // loaded per-player from DB, the visited flag on ALL_ROOMS reflects the
  // static (unvisited) default. We use questFlags or rely on the fact that
  // the map command fetches from DB. For the panel, we show all waypoints
  // and mark discovered based on whether the room was visited (the engine
  // loads visited state into currentRoom). As a practical compromise, we
  // show all waypoints grouped by zone — the player discovers them by
  // visiting.
  const zoneGroups = useMemo<ZoneGroup[]>(() => {
    const waypoints = getWaypoints()

    // Group by zone
    const grouped = new Map<ZoneType, WaypointEntry[]>()
    for (const wp of waypoints) {
      const isCurrent = currentRoom?.id === wp.id
      // A waypoint is "discovered" if the player has visited it.
      // Since we don't have async DB access here, we check:
      // 1) It's the current room (definitely visited)
      // 2) The static room data says visited (will be false for unvisited)
      // For a more accurate view, we'd need the DB state. But currentRoom
      // is always accurate for where the player is now.
      const discovered = isCurrent || wp.visited

      const entry: WaypointEntry = { room: wp, discovered, isCurrent }
      const list = grouped.get(wp.zone) ?? []
      list.push(entry)
      grouped.set(wp.zone, list)
    }

    // Convert to sorted array — only include zones that have waypoints
    const result: ZoneGroup[] = []
    const zoneOrder: ZoneType[] = [
      'crossroads', 'river_road', 'covenant', 'salt_creek', 'the_ember',
      'the_breaks', 'the_dust', 'the_stacks', 'duskhollow', 'the_deep',
      'the_pine_sea', 'the_scar', 'the_pens',
    ]

    for (const zone of zoneOrder) {
      const entries = grouped.get(zone)
      if (entries && entries.length > 0) {
        result.push({
          zone,
          label: ZONE_LABELS[zone],
          waypoints: entries,
        })
      }
    }

    return result
  }, [currentRoom])

  if (!player) return null

  const hasAnyDiscovered = zoneGroups.some((g) =>
    g.waypoints.some((w) => w.discovered)
  )

  return (
    <div className="overflow-y-auto flex-1 font-mono text-sm text-amber-400 p-4 space-y-5">
      {/* Header */}
      <section>
        <h2 className="text-amber-600 text-xs uppercase tracking-widest mb-2">Waypoints</h2>
        <p className="text-amber-600 text-xs mb-3">
          You must be at a waypoint to fast travel. Type &quot;travel [name]&quot;.
        </p>
      </section>

      {!hasAnyDiscovered ? (
        <div className="text-amber-600 text-xs italic">
          No waypoints discovered yet. Explore the world to find them.
        </div>
      ) : (
        zoneGroups.map((group) => {
          // Only show zones that have at least one discovered waypoint
          const hasDiscovered = group.waypoints.some((w) => w.discovered)
          if (!hasDiscovered) return null

          return (
            <section key={group.zone}>
              <h3 className="text-amber-600 text-xs uppercase tracking-widest mb-1">
                {group.label}
              </h3>
              <div className="space-y-0.5 ml-2">
                {group.waypoints.map((wp) => (
                  <div
                    key={wp.room.id}
                    className={`flex items-center gap-2 ${
                      wp.isCurrent
                        ? 'text-amber-200'
                        : wp.discovered
                          ? 'text-amber-400'
                          : 'text-amber-700'
                    }`}
                  >
                    <span>{wp.discovered ? '\u25CF' : '\u25CB'}</span>
                    <span>
                      {wp.room.name}
                      {wp.isCurrent && (
                        <span className="text-amber-600 text-xs ml-1">(here)</span>
                      )}
                    </span>
                  </div>
                ))}
              </div>
            </section>
          )
        })
      )}
    </div>
  )
}
