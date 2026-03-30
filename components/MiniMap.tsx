'use client'

// ============================================================
// MiniMap.tsx — 5x5 ASCII grid showing current room + exits
// Pure render from props — no side effects, no async loading.
// ============================================================

import { memo } from 'react'
import type { Direction } from '@/types/game'

interface MiniMapProps {
  exits: Partial<Record<Direction, string>>
}

// Grid is 5x5 characters with connectors between cells.
// Rendered as a 9x9 character grid (5 cells + 4 gaps).
// Center cell (2,2) = @ (current room).
// Cardinal exits shown as # with connector lines.
//
// Layout (row, col) in cell space:
//   (0,2)=north-2  (1,2)=north-1  (2,0)=west-2...(2,2)=@...(2,4)=east-2
//   etc.
// We only render 1-step radius per contract (exit-only, no async).

const GRID_ROWS = 5
const GRID_COLS = 9 // 5 cells * 2 - 1 for connectors

function buildGrid(exits: Partial<Record<Direction, string>>): string[][] {
  // 5 rows x 9 cols — each cell is a single character
  // Row indices: 0=far north, 2=center, 4=far south
  // Col indices: 0=far west, 4=center, 8=far east
  // Odd indices are connectors

  const grid: string[][] = Array.from({ length: GRID_ROWS }, () =>
    Array.from({ length: GRID_COLS }, () => ' ')
  )

  // Place dots in cell positions (even row, every-other col: 0,2,4,6,8)
  for (let r = 0; r < GRID_ROWS; r++) {
    for (let c = 0; c <= 8; c += 2) {
      grid[r][c] = '.'
    }
  }

  // Center = current room
  grid[2][4] = '@'

  // Cardinal direction offsets (row, col) from center (2, 4)
  const dirOffset: Record<string, [number, number]> = {
    north: [-1, 0],
    south: [1, 0],
    east:  [0, 1],
    west:  [0, -1],
  }

  // Connector characters
  const connectorChar: Record<string, string> = {
    north: '|',
    south: '|',
    east:  '-',
    west:  '-',
  }

  for (const dir of ['north', 'south', 'east', 'west'] as Direction[]) {
    if (exits[dir] !== undefined) {
      const [dr, dc] = dirOffset[dir]
      // Room cell position (in the 5x9 grid)
      const roomRow = 2 + dr * 2
      const roomCol = 4 + dc * 2
      // Connector position (between center and room)
      const connRow = 2 + dr
      const connCol = 4 + dc

      if (roomRow >= 0 && roomRow < GRID_ROWS && roomCol >= 0 && roomCol < GRID_COLS) {
        grid[roomRow][roomCol] = '#'
      }
      if (connRow >= 0 && connRow < GRID_ROWS && connCol >= 0 && connCol < GRID_COLS) {
        grid[connRow][connCol] = connectorChar[dir]
      }
    }
  }

  return grid
}

function charColor(ch: string): string {
  switch (ch) {
    case '@': return 'text-white font-bold'
    case '#': return 'text-green-400'
    case '|':
    case '-': return 'text-gray-500'
    default:  return 'text-gray-700'
  }
}

export default memo(function MiniMap({ exits }: MiniMapProps) {
  const grid = buildGrid(exits)

  const hasUp = exits.up !== undefined
  const hasDown = exits.down !== undefined

  return (
    <div>
      <pre className="font-mono text-xs leading-tight select-none">
        {grid.map((row, ri) => (
          <div key={ri}>
            {row.map((ch, ci) => (
              <span key={ci} className={charColor(ch)}>{ch}</span>
            ))}
          </div>
        ))}
      </pre>
      {(hasUp || hasDown) && (
        <div className="font-mono text-xs text-gray-500 mt-0.5">
          {hasUp && <span>[UP] </span>}
          {hasDown && <span>[DOWN]</span>}
        </div>
      )}
    </div>
  )
})
