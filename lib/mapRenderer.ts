import type { Room } from '@/types/game'

// Box-drawing constants — each inner line is exactly 34 chars wide between the ║ borders.
const BOX_WIDTH = 34
const INNER_WIDTH = BOX_WIDTH - 2  // 32 chars between ║ and ║

function padLine(content: string): string {
  // Pad or truncate to INNER_WIDTH, then wrap with border characters.
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
  const lines: string[] = []

  lines.push('╔' + '═'.repeat(INNER_WIDTH) + '╗')
  lines.push(padLine('         ZONE MAP                 '))
  lines.push('╠' + '═'.repeat(INNER_WIDTH) + '╣')

  for (const room of rooms) {
    const isCurrent = room.id === currentRoomId
    const isVisited = visitedRoomIds.has(room.id)

    const marker = isCurrent ? '[*]' : isVisited ? '[·]' : '[?]'
    const name = isVisited || isCurrent ? room.name : '???'
    const exits = Object.keys(room.exits ?? {}).join(',')

    // Layout: ' [*] <name padded to 20> <exits padded to 6> '
    // That gives: 1 + 3 + 1 + 20 + 1 + 6 + 1 = 33 — one char short; pad trailing space
    const truncatedName = name.length > 20 ? name.slice(0, 20) : name.padEnd(20)
    const truncatedExits = exits.length > 6 ? exits.slice(0, 6) : exits.padEnd(6)
    const content = ` ${marker} ${truncatedName} ${truncatedExits} `

    lines.push(padLine(content))
  }

  lines.push('╠' + '═'.repeat(INNER_WIDTH) + '╣')
  lines.push(padLine(' [*] You are here  [·] Visited   '))
  lines.push(padLine(' [?] Unexplored                  '))
  lines.push('╚' + '═'.repeat(INNER_WIDTH) + '╝')

  return lines
}
