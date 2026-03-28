import type { Room } from '@/types/game'

// Box-drawing constants — each inner line is exactly 40 chars wide between the ║ borders.
const BOX_WIDTH = 42
const INNER_WIDTH = BOX_WIDTH - 2  // 40 chars between ║ and ║

// Maximum grid radius from the current room (caps display at ~15x15 logical cells)
const MAX_GRID_RADIUS = 7

// Direction deltas: [dx, dy] where +x = east, +y = south
const DIR_DELTAS: Record<string, [number, number]> = {
  north: [0, -1],
  south: [0,  1],
  east:  [1,  0],
  west:  [-1, 0],
  up:    [0, -1],
  down:  [0,  1],
}

function padLine(content: string): string {
  const padded = content.length >= INNER_WIDTH
    ? content.slice(0, INNER_WIDTH)
    : content.padEnd(INNER_WIDTH)
  return `║${padded}║`
}

interface PlacedRoom {
  id: string
  x: number
  y: number
}

export function renderZoneMap(
  rooms: Room[],
  currentRoomId: string,
  visitedRoomIds: Set<string>
): string[] {
  // ── 1. Build room lookup ───────────────────────────────────────────────────
  const roomById = new Map<string, Room>()
  for (const room of rooms) {
    roomById.set(room.id, room)
  }

  // ── 2. BFS from current room, placing rooms on a coordinate grid ──────────
  const coordByRoomId = new Map<string, [number, number]>()
  const roomIdAtCoord = new Map<string, string>()  // key: "x,y"

  const startRoom = roomById.get(currentRoomId)
  if (!startRoom) {
    // Fallback: return a simple "no map" box
    const lines: string[] = []
    lines.push('╔' + '═'.repeat(INNER_WIDTH) + '╗')
    lines.push(padLine('  MAP UNAVAILABLE                       '))
    lines.push('╚' + '═'.repeat(INNER_WIDTH) + '╝')
    return lines
  }

  const queue: PlacedRoom[] = [{ id: currentRoomId, x: 0, y: 0 }]
  coordByRoomId.set(currentRoomId, [0, 0])
  roomIdAtCoord.set('0,0', currentRoomId)

  while (queue.length > 0) {
    const current = queue.shift()!
    const room = roomById.get(current.id)
    if (!room?.exits) continue

    // Only expand from rooms the player has visited (or the current room)
    const isAccessible = current.id === currentRoomId || visitedRoomIds.has(current.id)
    if (!isAccessible) continue

    for (const [dir, delta] of Object.entries(DIR_DELTAS)) {
      const neighborId = (room.exits as Record<string, string>)[dir]
      if (!neighborId) continue
      if (coordByRoomId.has(neighborId)) continue  // already placed

      const nx = current.x + delta[0]
      const ny = current.y + delta[1]

      // Cap to grid radius
      if (Math.abs(nx) > MAX_GRID_RADIUS || Math.abs(ny) > MAX_GRID_RADIUS) continue

      const key = `${nx},${ny}`
      // Don't overwrite a cell already claimed by a different room
      if (roomIdAtCoord.has(key)) continue

      coordByRoomId.set(neighborId, [nx, ny])
      roomIdAtCoord.set(key, neighborId)
      queue.push({ id: neighborId, x: nx, y: ny })
    }
  }

  // ── 3. Compute grid bounds ─────────────────────────────────────────────────
  let minX = 0, maxX = 0, minY = 0, maxY = 0
  for (const [, [x, y]] of coordByRoomId) {
    if (x < minX) minX = x
    if (x > maxX) maxX = x
    if (y < minY) minY = y
    if (y > maxY) maxY = y
  }

  const gridW = maxX - minX + 1  // number of room columns
  const gridH = maxY - minY + 1  // number of room rows

  // Normalize: offset so that (minX, minY) maps to (0, 0)
  const placed = new Map<string, string>()  // "col,row" → roomId (0-based)
  for (const [id, [x, y]] of coordByRoomId) {
    placed.set(`${x - minX},${y - minY}`, id)
  }

  // ── 4. Determine marker for each placed room ───────────────────────────────
  function markerFor(roomId: string): string {
    if (roomId === currentRoomId) return '[*]'
    if (visitedRoomIds.has(roomId)) return '[·]'
    return '[?]'
  }

  // ── 5. Build the zone title (use current room's zone, trimmed) ────────────
  const zoneName = (startRoom.zone ?? 'ZONE MAP').toUpperCase()
  const titleContent = ` ${zoneName}`

  // ── 6. Render the grid to string lines ────────────────────────────────────
  // Each room cell occupies 3 chars: [X]
  // Horizontal connectors between adjacent rooms: --  (2 chars)
  // So each column occupies: 3 + 2 = 5 chars, except the last which is just 3.
  // Each room row occupies 1 text line.
  // Vertical connectors between adjacent rows: 1 text line with '|' or ' ' under each room cell.

  // Total render width per row: gridW * 3 + (gridW - 1) * 2 = gridW * 5 - 2
  // We center this inside INNER_WIDTH.

  const renderW = gridW * 5 - 2
  // Left padding to center the grid (leave at least 1 space for border)
  const leftPad = Math.max(1, Math.floor((INNER_WIDTH - renderW) / 2))

  const gridLines: string[] = []

  for (let row = 0; row < gridH; row++) {
    // ── Room row ─────────────────────────────────────────────────────────────
    let roomRow = ' '.repeat(leftPad)
    for (let col = 0; col < gridW; col++) {
      const roomId = placed.get(`${col},${row}`)
      const marker = roomId ? markerFor(roomId) : '   '
      roomRow += marker

      // Horizontal connector to the right neighbour (if within grid)
      if (col < gridW - 1) {
        const rightId = placed.get(`${col + 1},${row}`)
        // Show '--' only when both cells are occupied AND there's an actual exit
        let showH = false
        if (roomId && rightId) {
          const leftRoom = roomById.get(roomId)
          const rightRoom = roomById.get(rightId)
          const exits = leftRoom?.exits as Record<string, string> | undefined
          const exitsRight = rightRoom?.exits as Record<string, string> | undefined
          if (
            (exits?.east === rightId || exits?.west === rightId) ||
            (exitsRight?.east === roomId || exitsRight?.west === roomId)
          ) {
            showH = true
          }
        }
        roomRow += showH ? '--' : '  '
      }
    }
    gridLines.push(padLine(roomRow))

    // ── Vertical-connector row (omit after last room row) ─────────────────
    if (row < gridH - 1) {
      let connRow = ' '.repeat(leftPad)
      for (let col = 0; col < gridW; col++) {
        const topId = placed.get(`${col},${row}`)
        const botId = placed.get(`${col},${row + 1}`)
        let showV = false
        if (topId && botId) {
          const topRoom = roomById.get(topId)
          const botRoom = roomById.get(botId)
          const exits = topRoom?.exits as Record<string, string> | undefined
          const exitsBot = botRoom?.exits as Record<string, string> | undefined
          if (
            (exits?.south === botId || exits?.north === botId) ||
            (exits?.down === botId || exits?.up === botId) ||
            (exitsBot?.south === topId || exitsBot?.north === topId) ||
            (exitsBot?.down === topId || exitsBot?.up === topId)
          ) {
            showV = true
          }
        }
        // Center the '|' under the middle char of the 3-char cell
        connRow += showV ? ' | ' : '   '
        // Add spacing for the horizontal connector slot (2 chars), except last col
        if (col < gridW - 1) {
          connRow += '  '
        }
      }
      gridLines.push(padLine(connRow))
    }
  }

  // ── 7. Assemble final output ───────────────────────────────────────────────
  const lines: string[] = []
  lines.push('╔' + '═'.repeat(INNER_WIDTH) + '╗')
  lines.push(padLine(titleContent))
  lines.push('╠' + '═'.repeat(INNER_WIDTH) + '╣')
  lines.push(padLine(''))
  for (const gl of gridLines) {
    lines.push(gl)
  }
  lines.push(padLine(''))
  lines.push('╠' + '═'.repeat(INNER_WIDTH) + '╣')
  lines.push(padLine(' [*] You  [·] Visited  [?] Unknown      '))
  lines.push('╚' + '═'.repeat(INNER_WIDTH) + '╝')

  return lines
}
