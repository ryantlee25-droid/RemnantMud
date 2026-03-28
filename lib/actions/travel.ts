// ============================================================
// lib/actions/travel.ts — handleMap, handleTravel (fast travel)
// ============================================================

import type { GameMessage, Room, ZoneType } from '@/types/game'
import type { EngineCore } from './types'
import { getRoom, markVisited } from '@/lib/world'
import { ALL_ROOMS } from '@/data/rooms/index'
import { getTimeOfDay } from '@/lib/gameEngine'
import { exitsLine, npcsLine, enemiesLine, itemsLine } from './movement'
import { msg, systemMsg, errorMsg } from '@/lib/messages'
import { renderZoneMap } from '@/lib/mapRenderer'

// ------------------------------------------------------------
// Zone display names
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

/** Get all rooms that are fast travel waypoints. */
function getWaypoints(): Room[] {
  return ALL_ROOMS.filter(r => r.flags.fastTravelWaypoint)
}

/** Get waypoints the player has visited (discovered). */
function getDiscoveredWaypoints(playerRoomVisitedMap: Map<string, boolean>): Room[] {
  return getWaypoints().filter(r => playerRoomVisitedMap.get(r.id))
}

// ------------------------------------------------------------
// handleMap — show discovered fast travel waypoints
// ------------------------------------------------------------

export async function handleMap(engine: EngineCore): Promise<void> {
  const { player } = engine.getState()
  if (!player) return

  // Build visited map from the static ALL_ROOMS data.
  // Note: rooms in ALL_ROOMS reflect the initial (unvisited) state.
  // We need to check the player's DB state. Since we can't bulk-query
  // here efficiently, we use getRoom for each waypoint. But waypoints
  // are few (~10-20), so this is acceptable.
  const waypoints = getWaypoints()

  // Load each waypoint room to check visited status
  const waypointRooms: Room[] = []
  for (const wp of waypoints) {
    const room = await getRoom(wp.id, player.id)
    if (room && room.visited) {
      waypointRooms.push(room)
    }
  }

  if (waypointRooms.length === 0) {
    engine._appendMessages([systemMsg('You have not discovered any waypoints yet. Explore the world to find them.')])
    return
  }

  // Group by zone
  const grouped = new Map<ZoneType, Room[]>()
  for (const room of waypointRooms) {
    const list = grouped.get(room.zone) ?? []
    list.push(room)
    grouped.set(room.zone, list)
  }

  const lines: string[] = ['=== DISCOVERED WAYPOINTS ===']
  for (const [zone, rooms] of grouped) {
    const zoneLabel = ZONE_LABELS[zone] ?? zone
    const names = rooms.map(r => r.name).join(', ')
    lines.push(`${zoneLabel}: ${names}`)
  }

  engine._appendMessages(lines.map(l => systemMsg(l)))

  // Zone map — show all rooms in the current zone with visited indicators
  const { currentRoom: mapCurrentRoom } = engine.getState()
  if (mapCurrentRoom) {
    const currentZone = mapCurrentRoom.zone
    const zoneRooms = ALL_ROOMS.filter(r => r.zone === currentZone)
    const visitedRoomIds = new Set(waypointRooms.map(r => r.id))
    // Also mark the current room as visited
    visitedRoomIds.add(mapCurrentRoom.id)
    const mapLines = renderZoneMap(zoneRooms, mapCurrentRoom.id, visitedRoomIds)
    engine._appendMessages(mapLines.map(line => systemMsg(line)))
  }
}

// ------------------------------------------------------------
// handleTravel — fast travel to a discovered waypoint
// ------------------------------------------------------------

/** Cost of fast travel in time-advancing actions. */
const TRAVEL_COST = 5

export async function handleTravel(engine: EngineCore, destination: string | undefined): Promise<void> {
  const { player, currentRoom, combatState } = engine.getState()
  if (!player || !currentRoom) return

  if (combatState?.active) {
    engine._appendMessages([errorMsg('You cannot travel while in combat.')])
    return
  }

  // Must be at a waypoint
  if (!currentRoom.flags.fastTravelWaypoint) {
    engine._appendMessages([errorMsg("You need to be at a waypoint to fast travel. Type 'map' to see waypoints.")])
    return
  }

  if (!destination) {
    engine._appendMessages([errorMsg("Travel where? Usage: travel [destination]. Type 'map' to see available waypoints.")])
    return
  }

  // Build list of discovered waypoints (excluding current room)
  const waypoints = getWaypoints()
  const discoveredWaypoints: Room[] = []
  for (const wp of waypoints) {
    if (wp.id === currentRoom.id) continue
    const room = await getRoom(wp.id, player.id)
    if (room && room.visited) {
      discoveredWaypoints.push(room)
    }
  }

  // Fuzzy substring match on destination
  const destLower = destination.toLowerCase()
  const match = discoveredWaypoints.find(r =>
    r.name.toLowerCase().includes(destLower)
  )

  if (!match) {
    engine._appendMessages([errorMsg("Unknown destination. Type 'map' to see available waypoints.")])
    return
  }

  // Load full room data for the destination
  const rawDestRoom = await getRoom(match.id, player.id)
  if (!rawDestRoom) {
    engine._appendMessages([errorMsg('That destination seems to have vanished.')])
    return
  }

  if (rawDestRoom.cycleGate && (player.cycle ?? 1) < rawDestRoom.cycleGate) {
    engine._appendMessages([errorMsg('That waypoint feels unreachable. You are not ready.')])
    return
  }

  const destRoom = engine._applyPopulation(rawDestRoom)

  // Advance time by TRAVEL_COST actions
  const newActionsTaken = (player.actionsTaken ?? 0) + TRAVEL_COST
  const updatedPlayer = { ...player, currentRoomId: match.id, actionsTaken: newActionsTaken }
  engine._setState({ player: updatedPlayer, currentRoom: destRoom })

  const messages: GameMessage[] = [
    msg(`You travel to ${match.name}. The journey takes time.`),
  ]

  // Show room description
  const tod = getTimeOfDay(newActionsTaken)
  if (!destRoom.visited) {
    messages.push(msg(destRoom.description))
    await markVisited(match.id, player.id)
  } else {
    messages.push(msg(destRoom.shortDescription))
  }

  messages.push(msg(exitsLine(destRoom)))
  if (npcsLine(destRoom)) messages.push(msg(npcsLine(destRoom)))
  if (enemiesLine(destRoom)) messages.push(msg(enemiesLine(destRoom), 'combat'))
  if (itemsLine(destRoom)) messages.push(msg(itemsLine(destRoom)))

  engine._appendMessages(messages)
  await engine._savePlayer()
}
