'use client'

// ============================================================
// Sidebar.tsx — Compact stats + minimap panel for split-pane
// Renders in the right 30% slot of GameLayout.
// ============================================================

import { memo } from 'react'
import { useGame } from '@/lib/gameContext'
import { hpColor } from '@/lib/ansiColors'
import { xpForNextLevel, getTimeOfDay } from '@/lib/gameEngine'
import MiniMap from '@/components/MiniMap'
import type { TimeOfDay, Direction } from '@/types/game'

// ------------------------------------------------------------
// Helpers
// ------------------------------------------------------------

const TIME_LABELS: Record<TimeOfDay, string> = {
  dawn:  'DAWN',
  day:   'DAY',
  dusk:  'DUSK',
  night: 'NIGHT',
}

const TIME_COLORS: Record<TimeOfDay, string> = {
  dawn:  'text-orange-400',
  day:   'text-yellow-300',
  dusk:  'text-orange-500',
  night: 'text-blue-400',
}

function formatZone(zone: string): string {
  return zone
    .split('_')
    .map(w => w.charAt(0).toUpperCase() + w.slice(1))
    .join(' ')
}

function buildHpBar(current: number, max: number): string {
  const barLength = 8
  const filled = max > 0 ? Math.round((current / max) * barLength) : 0
  const empty = barLength - filled
  return '[' + '#'.repeat(filled) + '.'.repeat(empty) + ']'
}

// ------------------------------------------------------------
// Sidebar
// ------------------------------------------------------------

export default memo(function Sidebar() {
  const { state } = useGame()
  const { player, currentRoom, combatState } = state

  if (!player) return null

  const actionsTaken = player.actionsTaken ?? 0
  const timeOfDay = getTimeOfDay(actionsTaken)
  const cycle = player.cycle ?? 1
  const hollowPressure = player.hollowPressure ?? 0
  const xpNext = xpForNextLevel(player.level)
  const exits = currentRoom?.exits ?? {}
  const exitDirs = Object.keys(exits) as Direction[]

  const hpBarColor = hpColor(player.hp, player.maxHp)

  return (
    <div className="bg-gray-950 h-full font-mono text-xs p-3 flex flex-col gap-2 select-none">
      {/* Title */}
      <div className="text-center text-gray-400 font-bold tracking-wider border-b border-gray-800 pb-1">
        THE REMNANT
      </div>

      {/* Stats */}
      <div className="border-b border-gray-800 pb-2 space-y-0.5">
        <div className="flex items-center gap-1">
          <span className="text-gray-500">HP:</span>
          <span className={hpBarColor}>{buildHpBar(player.hp, player.maxHp)}</span>
          <span className={hpBarColor}>{player.hp}/{player.maxHp}</span>
        </div>
        <div className="flex gap-3">
          <span>
            <span className="text-gray-500">LV:</span>{' '}
            <span className="text-gray-300">{player.level}</span>
          </span>
          <span>
            <span className="text-gray-500">XP:</span>{' '}
            <span className="text-gray-300">
              {player.xp}/{xpNext ?? 'MAX'}
            </span>
          </span>
        </div>
        <div>
          <span className="text-gray-500">Cycle:</span>{' '}
          <span className="text-gray-300">{cycle}</span>
        </div>
      </div>

      {/* Location */}
      <div className="border-b border-gray-800 pb-2 space-y-0.5">
        {currentRoom?.zone && (
          <div className="text-gray-500 text-[10px] uppercase tracking-wide">
            {formatZone(currentRoom.zone)}
          </div>
        )}
        <div className="text-green-400">
          {currentRoom?.name ?? '...'}
        </div>
      </div>

      {/* Minimap */}
      <div className="border-b border-gray-800 pb-2">
        <MiniMap exits={exits} />
      </div>

      {/* Exits */}
      <div className="border-b border-gray-800 pb-2">
        <span className="text-gray-500">Exits:</span>{' '}
        {exitDirs.length > 0 ? (
          <span className="text-green-400">
            {exitDirs.map(d => d.charAt(0)).join(' ')}
          </span>
        ) : (
          <span className="text-gray-700">none</span>
        )}
      </div>

      {/* Time + Pressure */}
      <div className="space-y-0.5">
        <div>
          <span className={TIME_COLORS[timeOfDay]}>[{TIME_LABELS[timeOfDay]}]</span>
        </div>
        <div>
          <span className="text-gray-500">Pressure:</span>{' '}
          <span className={hollowPressure >= 7 ? 'text-red-500' : hollowPressure >= 4 ? 'text-yellow-400' : 'text-gray-300'}>
            {hollowPressure}
          </span>
        </div>
      </div>

      {/* Combat indicator */}
      {combatState?.active && (
        <div className="border-t border-gray-800 pt-2 text-red-400">
          COMBAT: {combatState.enemy.name}
          <div className="text-red-500">
            [{combatState.enemyHp}/{combatState.enemy.maxHp}]
          </div>
        </div>
      )}
    </div>
  )
})
