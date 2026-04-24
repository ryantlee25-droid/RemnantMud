import type { Room } from '@/types/game'
import { computeLayout } from '@/lib/mapLayout'

// Box-drawing constants — each inner line is exactly 40 chars wide between the ║ borders.
const BOX_WIDTH = 42
const INNER_WIDTH = BOX_WIDTH - 2  // 40 chars between ║ and ║

// Maximum grid radius from the current room (caps display at ~15x15 logical cells)
const MAX_GRID_RADIUS = 7

function padLine(content: string): string {
  const padded = content.length >= INNER_WIDTH
    ? content.slice(0, INNER_WIDTH)
    : content.padEnd(INNER_WIDTH)
  return `║${padded}║`
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

  const startRoom = roomById.get(currentRoomId)
  if (!startRoom) {
    // Fallback: return a simple "no map" box
    const lines: string[] = []
    lines.push('╔' + '═'.repeat(INNER_WIDTH) + '╗')
    lines.push(padLine('  MAP UNAVAILABLE                       '))
    lines.push('╚' + '═'.repeat(INNER_WIDTH) + '╝')
    return lines
  }

  // ── 2. BFS from current room, placing rooms on a coordinate grid ──────────
  const { positions: rawPositions, bounds } = computeLayout(rooms, currentRoomId, visitedRoomIds, MAX_GRID_RADIUS)

  // Convert positions map format: LayoutResult uses {x, y} objects, renderer used [x, y] tuples
  const coordByRoomId = new Map<string, [number, number]>()
  for (const [id, { x, y }] of rawPositions) {
    coordByRoomId.set(id, [x, y])
  }

  // ── 3. Compute grid bounds ─────────────────────────────────────────────────
  const { minX, maxX, minY, maxY } = bounds

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
