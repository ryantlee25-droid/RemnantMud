'use client'

// ============================================================
// DataTab.tsx — Data / progress panel for the tabbed sidebar
// Shows faction reputation, quest flags, cycle history, and
// enemies encountered count.
// ============================================================

import { useGame } from '@/lib/gameContext'
import type { FactionType } from '@/types/game'

// ------------------------------------------------------------
// Faction data
// ------------------------------------------------------------

const ALL_FACTIONS: FactionType[] = [
  'accord',
  'salters',
  'drifters',
  'kindling',
  'reclaimers',
  'covenant_of_dusk',
  'red_court',
  'ferals',
  'lucid',
]

const FACTION_DISPLAY_NAMES: Record<FactionType, string> = {
  accord: 'Accord',
  salters: 'Salters',
  drifters: 'Drifters',
  kindling: 'Kindling',
  reclaimers: 'Reclaimers',
  covenant_of_dusk: 'Covenant of Dusk',
  red_court: 'Red Court',
  ferals: 'Ferals',
  lucid: 'Lucid',
}

// ------------------------------------------------------------
// Reputation label + colour helpers
// ------------------------------------------------------------

const REPUTATION_LABELS: Record<number, string> = {
  [-3]: 'Hunted',
  [-2]: 'Hostile',
  [-1]: 'Wary',
  [0]: 'Unknown',
  [1]: 'Recognized',
  [2]: 'Trusted',
  [3]: 'Blooded',
}

function reputationColor(rep: number): string {
  if (rep <= -2) return 'text-red-400'
  if (rep === -1) return 'text-orange-400'
  if (rep === 0) return 'text-gray-500'
  if (rep <= 2) return 'text-amber-400'
  return 'text-amber-300'
}

// 7-pip bar: positions map to rep values -3 … +3
// Active pip is marked with *, inactive with ·
// Positive pips: amber-400, negative pips: red-400, zero: gray-500
function ReputationPips({ rep }: { rep: number }) {
  // Clamp rep to valid range
  const clamped = Math.max(-3, Math.min(3, rep))
  const pips: React.ReactElement[] = []

  for (let i = -3; i <= 3; i++) {
    const isActive = i === clamped
    let colorClass: string
    if (isActive) {
      colorClass = reputationColor(clamped)
    } else if (i < 0) {
      colorClass = 'text-gray-600'
    } else if (i === 0) {
      colorClass = 'text-gray-600'
    } else {
      colorClass = 'text-gray-600'
    }
    pips.push(
      <span key={i} className={colorClass}>
        {isActive ? '*' : '·'}
      </span>,
    )
  }

  return (
    <span className="font-mono tracking-widest text-xs select-none" aria-hidden="true">
      [{pips}]
    </span>
  )
}

// ------------------------------------------------------------
// Quest flag helpers
// ------------------------------------------------------------

function formatFlagName(key: string): string {
  return key
    .replace(/_/g, ' ')
    .replace(/\b\w/g, (c) => c.toUpperCase())
}

// A flag is "notable" if its value is not false, null, or undefined.
// Do NOT drop 0 — it's falsy but valid.
function isNotableFlag(value: string | boolean | number): boolean {
  return value !== false && value !== null && value !== undefined
}

// ------------------------------------------------------------
// Main component
// ------------------------------------------------------------

export default function DataTab() {
  const { state } = useGame()

  if (!state.player) return null

  const { player, ledger } = state

  // --------------------------------------------------------
  // 1. Faction Reputation
  // --------------------------------------------------------
  const factionSection = (
    <section>
      <h2 className="text-amber-600 text-xs uppercase tracking-widest mb-1">
        Factions
      </h2>
      <div className="space-y-0.5">
        {ALL_FACTIONS.map((factionId) => {
          const raw = player.factionReputation?.[factionId] ?? 0
          // Clamp to valid ReputationLevel range
          const rep = Math.max(-3, Math.min(3, raw))
          const label = REPUTATION_LABELS[rep] ?? 'Unknown'
          const color = reputationColor(rep)
          const name = FACTION_DISPLAY_NAMES[factionId]

          return (
            <div key={factionId}>
              <div className="text-xs flex justify-between gap-2">
                <span className="text-amber-400">{name}</span>
                <span className={color}>{label}</span>
              </div>
              <div className="pl-1 mb-0.5">
                <ReputationPips rep={rep} />
              </div>
            </div>
          )
        })}
      </div>
    </section>
  )

  // --------------------------------------------------------
  // 2. Quest Progress
  // --------------------------------------------------------
  const questEntries = Object.entries(player.questFlags ?? {}).filter(
    ([, value]) => isNotableFlag(value),
  )

  const questSection = (
    <section>
      <h2 className="text-amber-600 text-xs uppercase tracking-widest mb-1">
        Progress
      </h2>
      {questEntries.length === 0 ? (
        <div className="text-amber-700 text-xs">No flags set.</div>
      ) : (
        <ul className="space-y-0.5">
          {questEntries.map(([key, value]) => {
            const displayName = formatFlagName(key)
            const displayValue = value === true ? null : String(value)
            return (
              <li key={key} className="text-xs text-amber-400 flex gap-1">
                <span className="text-amber-600">·</span>
                <span>
                  {displayName}
                  {displayValue !== null && (
                    <span className="text-amber-600"> — {displayValue}</span>
                  )}
                </span>
              </li>
            )
          })}
        </ul>
      )}
    </section>
  )

  // --------------------------------------------------------
  // 3. Cycle History (skip if no ledger)
  // --------------------------------------------------------
  const cycleSection = ledger ? (
    <section>
      <h2 className="text-amber-600 text-xs uppercase tracking-widest mb-1">
        Cycles
      </h2>
      <div className="space-y-0.5 text-xs">
        <div className="flex justify-between gap-2">
          <span className="text-amber-400">Current cycle</span>
          <span className="text-amber-300">{player.cycle}</span>
        </div>
        <div className="flex justify-between gap-2">
          <span className="text-amber-400">Total deaths</span>
          <span className="text-amber-300">{player.totalDeaths ?? 0}</span>
        </div>
        <div className="flex justify-between gap-2">
          <span className="text-amber-400">Cycles completed</span>
          <span className="text-amber-300">
            {ledger.cycleHistory?.length ?? 0}
          </span>
        </div>
        {(ledger.cycleHistory?.length ?? 0) > 0 ? (() => {
          const last = ledger.cycleHistory![ledger.cycleHistory!.length - 1]
          return (
            <div className="mt-1 pt-1 border-t border-amber-900">
              <div className="text-amber-600 text-xs uppercase tracking-widest mb-0.5">
                Last cycle
              </div>
              {last.deathRoom && (
                <div className="flex justify-between gap-2">
                  <span className="text-amber-400">Died at</span>
                  <span className="text-amber-300 text-right max-w-[60%] truncate">
                    {last.deathRoom}
                  </span>
                </div>
              )}
              {last.endingChoice && (
                <div className="flex justify-between gap-2">
                  <span className="text-amber-400">Ending</span>
                  <span className="text-amber-300 capitalize">{last.endingChoice}</span>
                </div>
              )}
              <div className="flex justify-between gap-2">
                <span className="text-amber-400">Quests done</span>
                <span className="text-amber-300">{last.questsCompleted.length}</span>
              </div>
            </div>
          )
        })() : (
          player.cycle === 1 && (
            <div className="text-amber-700 text-xs mt-1">First cycle.</div>
          )
        )}
      </div>
    </section>
  ) : null

  // --------------------------------------------------------
  // 4. Bestiary / Enemies Encountered (skip if no ledger)
  // --------------------------------------------------------
  const bestiarySection = ledger ? (
    <section>
      <h2 className="text-amber-600 text-xs uppercase tracking-widest mb-1">
        Bestiary
      </h2>
      <div className="text-xs text-amber-400">
        {ledger.discoveredEnemies?.length ?? 0} species encountered.
      </div>
    </section>
  ) : null

  return (
    <div
      role="tabpanel"
      id="tabpanel-data"
      className="p-3 space-y-3 text-amber-400"
    >
      {factionSection}
      {questSection}
      {cycleSection}
      {bestiarySection}
    </div>
  )
}
