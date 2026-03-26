'use client'

// ============================================================
// StatusBar.tsx — One-line status: location | time | HP | XP
// ============================================================

import { useGame } from '@/lib/gameContext'
import type { TimeOfDay } from '@/types/game'

function computeTimeOfDay(actionsTaken: number): TimeOfDay {
  const TIMES: TimeOfDay[] = ['dawn', 'day', 'dusk', 'night']
  return TIMES[Math.floor(actionsTaken / 20) % 4]!
}

const TIME_LABELS: Record<TimeOfDay, string> = {
  dawn:  'dawn',
  day:   'day',
  dusk:  'dusk',
  night: 'night',
}

const TIME_COLORS: Record<TimeOfDay, string> = {
  dawn:  'text-orange-300',
  day:   'text-amber-300',
  dusk:  'text-orange-500',
  night: 'text-blue-400',
}

export default function StatusBar() {
  const { state } = useGame()
  const { player, currentRoom, combatState } = state

  if (!player) return null

  const locationName = currentRoom?.name ?? '...'
  const timeOfDay = computeTimeOfDay(player.actionsTaken ?? 0)
  const combatIndicator = combatState?.active
    ? ` | COMBAT: ${combatState.enemy.name} [${combatState.enemyHp}/${combatState.enemy.maxHp}]`
    : ''

  return (
    <div className="bg-black border-b border-amber-900 px-4 py-1 font-mono text-xs text-amber-400 select-none">
      <span className="opacity-70">[</span>
      {locationName}
      <span className="opacity-70">]</span>
      <span className="mx-2 opacity-40">|</span>
      <span className={TIME_COLORS[timeOfDay]}>{TIME_LABELS[timeOfDay]}</span>
      <span className="mx-2 opacity-40">|</span>
      HP: {player.hp}/{player.maxHp}
      <span className="mx-2 opacity-40">|</span>
      XP: {player.xp}
      {combatIndicator && (
        <span className="text-red-400">{combatIndicator}</span>
      )}
    </div>
  )
}
