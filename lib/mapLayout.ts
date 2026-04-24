import type { Room } from '@/types/game'

export interface LayoutResult {
  positions: Map<string, { x: number; y: number }>  // roomId -> absolute grid coords
  bounds: { minX: number; maxX: number; minY: number; maxY: number }
}

// Direction deltas: [dx, dy] where +x = east, +y = south
const DIR_DELTAS: Record<string, [number, number]> = {
  north: [0, -1],
  south: [0,  1],
  east:  [1,  0],
  west:  [-1, 0],
  up:    [0, -1],
  down:  [0,  1],
}

interface PlacedRoom {
  id: string
  x: number
  y: number
}

export function computeLayout(
  rooms: Room[],
  anchorRoomId: string,
  visitedIds: Set<string>,
  radius = 10,
): LayoutResult {
  // Build room lookup
  const roomById = new Map<string, Room>()
  for (const room of rooms) {
    roomById.set(room.id, room)
  }

  // BFS from anchor, placing rooms on a coordinate grid
  const positions = new Map<string, { x: number; y: number }>()
  const roomIdAtCoord = new Map<string, string>()  // key: "x,y"

  const startRoom = roomById.get(anchorRoomId)
  if (!startRoom) {
    return {
      positions,
      bounds: { minX: 0, maxX: 0, minY: 0, maxY: 0 },
    }
  }

  const queue: PlacedRoom[] = [{ id: anchorRoomId, x: 0, y: 0 }]
  positions.set(anchorRoomId, { x: 0, y: 0 })
  roomIdAtCoord.set('0,0', anchorRoomId)

  while (queue.length > 0) {
    const current = queue.shift()!
    const room = roomById.get(current.id)
    if (!room?.exits) continue

    // Only expand from rooms the player has visited (or the anchor room)
    const isAccessible = current.id === anchorRoomId || visitedIds.has(current.id)
    if (!isAccessible) continue

    for (const [dir, delta] of Object.entries(DIR_DELTAS)) {
      const neighborId = (room.exits as Record<string, string>)[dir]
      if (!neighborId) continue
      if (positions.has(neighborId)) continue  // already placed

      const nx = current.x + delta[0]
      const ny = current.y + delta[1]

      // Cap to grid radius
      if (Math.abs(nx) > radius || Math.abs(ny) > radius) continue

      const key = `${nx},${ny}`
      // Don't overwrite a cell already claimed by a different room
      if (roomIdAtCoord.has(key)) continue

      positions.set(neighborId, { x: nx, y: ny })
      roomIdAtCoord.set(key, neighborId)
      queue.push({ id: neighborId, x: nx, y: ny })
    }
  }

  // Compute grid bounds
  let minX = 0, maxX = 0, minY = 0, maxY = 0
  for (const { x, y } of positions.values()) {
    if (x < minX) minX = x
    if (x > maxX) maxX = x
    if (y < minY) minY = y
    if (y > maxY) maxY = y
  }

  return {
    positions,
    bounds: { minX, maxX, minY, maxY },
  }
}
