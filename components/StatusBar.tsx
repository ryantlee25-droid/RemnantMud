'use client'

// ============================================================
// StatusBar.tsx — One-line status: location | time | HP | XP
// ============================================================

import { useGame } from '@/lib/gameContext'
import { isDevMode } from '@/lib/supabaseMock'
import type { TimeOfDay } from '@/types/game'

function computeTimeOfDay(actionsTaken: number): TimeOfDay {
  const TIMES: TimeOfDay[] = ['dawn', 'day', 'dusk', 'night']
  return TIMES[Math.floor(actionsTaken / 20) % 4]!
}

const TIME_LABELS: Record<TimeOfDay, string> = {
  dawn:  'DAWN',
  day:   'DAY',
  dusk:  'DUSK',
  night: 'NIGHT',
}

function formatZone(zone: string): string {
  return zone
    .split('_')
    .map(w => w.charAt(0).toUpperCase() + w.slice(1))
    .join(' ')
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
  const zoneName = currentRoom?.zone ? formatZone(currentRoom.zone) : null
  const timeOfDay = computeTimeOfDay(player.actionsTaken ?? 0)
  const cycle = player.cycle ?? 1
  const combatIndicator = combatState?.active
    ? ` | COMBAT: ${combatState.enemy.name} [${combatState.enemyHp}/${combatState.enemy.maxHp}]`
    : ''

  return (
    <div className="bg-black border-b border-amber-900 px-4 py-1 font-mono text-xs text-amber-400 select-none">
      {isDevMode() && (
        <>
          <span className="text-amber-700">[DEV]</span>
          <span className="mx-2 opacity-40">|</span>
        </>
      )}
      <span className="opacity-70">[</span>
      {locationName}
      {zoneName && (
        <>
          <span className="mx-1 opacity-40">·</span>
          <span className="opacity-60">{zoneName}</span>
        </>
      )}
      <span className="opacity-70">]</span>
      <span className="mx-2 opacity-40">|</span>
      <span className={TIME_COLORS[timeOfDay]}>{TIME_LABELS[timeOfDay]}</span>
      <span className="mx-2 opacity-40">|</span>
      HP: {player.hp}/{player.maxHp}
      <span className="mx-2 opacity-40">|</span>
      XP: {player.xp}
      <span className="mx-2 opacity-40">|</span>
      <span className="opacity-60">Cycle {cycle}</span>
      {combatIndicator && (
        <span className="text-red-400">{combatIndicator}</span>
      )}
    </div>
  )
}
