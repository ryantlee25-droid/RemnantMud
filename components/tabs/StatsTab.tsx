'use client'

// ============================================================
// StatsTab.tsx — Stats panel: HP, XP, location, exits, time,
// hollow pressure, combat indicator, cycle.
// Extracted from Sidebar.tsx (minus MiniMap).
// ============================================================

import { useGame } from '@/lib/gameContext'
import { hpColor } from '@/lib/ansiColors'
import { xpForNextLevel, getTimeOfDay } from '@/lib/gameEngine'
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
  day:   'text-amber-300',
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
// StatsTab
// ------------------------------------------------------------

export default function StatsTab() {
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
    <div role="tabpanel" id="tabpanel-stats" aria-labelledby="tab-stats" className="p-3 space-y-3">
      {/* HP bar block */}
      <div className="border-b border-gray-800 pb-2 space-y-0.5">
        <div className="flex items-center gap-1">
          <span className="text-gray-500">HP:</span>
          <span className={hpBarColor}>{buildHpBar(player.hp, player.maxHp)}</span>
          <span className={hpBarColor}>{player.hp}/{player.maxHp}</span>
        </div>

        {/* LV + XP line */}
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

        {/* Cycle line */}
        <div>
          <span className="text-gray-500">Cycle:</span>{' '}
          <span className="text-gray-300">{cycle}</span>
        </div>
      </div>

      {/* Location block */}
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

      {/* Exits line */}
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

      {/* Time of day block */}
      <div className="space-y-0.5">
        <div>
          <span className={TIME_COLORS[timeOfDay]}>[{TIME_LABELS[timeOfDay]}]</span>
        </div>

        {/* Hollow pressure block */}
        <div>
          <span className="text-gray-500">Pressure:</span>{' '}
          <span className={hollowPressure >= 7 ? 'text-red-500' : hollowPressure >= 4 ? 'text-amber-400' : 'text-gray-300'}>
            {hollowPressure}
          </span>
        </div>
      </div>

      {/* Combat indicator block */}
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
}
