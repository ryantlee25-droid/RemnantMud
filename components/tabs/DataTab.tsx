'use client'

// ============================================================
// DataTab.tsx — Quest progress, lore, faction reputation
// ============================================================

import { useGame } from '@/lib/gameContext'
import type { FactionType, ZoneType, ExplorationProgress } from '@/types/game'
import { getEnemy, ENEMIES } from '@/data/enemies'

// ------------------------------------------------------------
// Faction data (mirrors lib/actions/social.ts)
// ------------------------------------------------------------

const ALL_FACTIONS: FactionType[] = [
  'accord', 'salters', 'drifters', 'kindling', 'reclaimers',
  'covenant_of_dusk', 'red_court', 'ferals', 'lucid',
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

const REPUTATION_LABELS: Record<number, string> = {
  [-3]: 'Hunted',
  [-2]: 'Hostile',
  [-1]: 'Wary',
  [0]: 'Unknown',
  [1]: 'Recognized',
  [2]: 'Trusted',
  [3]: 'Blooded',
}

const ZONE_DISPLAY_NAMES: Record<ZoneType, string> = {
  crossroads: 'Crossroads',
  river_road: 'River Road',
  covenant: 'Covenant',
  salt_creek: 'Salt Creek',
  the_ember: 'The Ember',
  the_breaks: 'The Breaks',
  the_dust: 'The Dust',
  the_stacks: 'The Stacks',
  duskhollow: 'Duskhollow',
  the_deep: 'The Deep',
  the_pine_sea: 'The Pine Sea',
  the_scar: 'The Scar',
  the_pens: 'The Pens',
}

// ------------------------------------------------------------
// Helpers
// ------------------------------------------------------------

function formatFlagName(key: string): string {
  return key
    .replace(/_/g, ' ')
    .replace(/\b\w/g, (c) => c.toUpperCase())
}

// ------------------------------------------------------------
// Exploration Section
// ------------------------------------------------------------

function ExplorationSection({ progress }: { progress?: ExplorationProgress }) {
  if (!progress) {
    return (
      <section>
        <h2 className="text-amber-600 text-xs uppercase tracking-widest mb-1">
          Exploration
        </h2>
        <div className="text-amber-600 text-xs italic">
          Type &apos;journal&apos; to map your progress.
        </div>
      </section>
    )
  }

  const pct = progress.totalRooms > 0
    ? Math.floor((progress.roomsVisited / progress.totalRooms) * 100)
    : 0

  const zoneEntries = Object.entries(progress.zoneProgress) as Array<
    [ZoneType, { visited: number; total: number }]
  >
  // Sort: most-explored zones first
  zoneEntries.sort((a, b) => b[1].visited - a[1].visited)

  const keyPct = progress.totalNarrativeKeys > 0
    ? Math.floor((progress.narrativeKeysFound / progress.totalNarrativeKeys) * 100)
    : 0

  return (
    <section>
      <h2 className="text-amber-600 text-xs uppercase tracking-widest mb-1">
        Exploration
      </h2>

      {/* Total progress — ASCII bar */}
      <div className="mb-1 text-xs">
        <span className="text-amber-400">Known world </span>
        <span className="text-amber-300">
          [{(() => { const w = 8; const f = Math.round((pct / 100) * w); return '#'.repeat(f) + '.'.repeat(w - f) })()}] {progress.roomsVisited}/{progress.totalRooms} ({pct}%)
        </span>
      </div>

      {/* Zone breakdown — ASCII bars */}
      <div className="space-y-0.5 mb-2">
        {zoneEntries.map(([zone, { visited, total }]) => {
          const zonePct = total > 0 ? Math.floor((visited / total) * 100) : 0
          const displayName = ZONE_DISPLAY_NAMES[zone] ?? zone
          const w = 8
          const f = Math.round((zonePct / 100) * w)
          const bar = '[' + '#'.repeat(f) + '.'.repeat(w - f) + ']'
          return (
            <div key={zone} className="flex justify-between text-xs">
              <span className={visited > 0 ? 'text-amber-400' : 'text-amber-700'}>
                {displayName}
              </span>
              <span className={visited > 0 ? 'text-amber-500' : 'text-amber-700'}>
                {bar} {zonePct}%
              </span>
            </div>
          )
        })}
      </div>

      {/* Narrative keys */}
      <div className="flex justify-between text-xs border-t border-amber-900 pt-1">
        <span className="text-amber-400">Knowledge keys</span>
        <span className="text-amber-500">
          {progress.narrativeKeysFound}/{progress.totalNarrativeKeys} ({keyPct}%)
        </span>
      </div>
    </section>
  )
}

// ------------------------------------------------------------
// Component
// ------------------------------------------------------------

export default function DataTab() {
  const { state } = useGame()
  const { player, inventory } = state

  if (!player) return null

  const rep = player.factionReputation ?? {}
  const flags = player.questFlags ?? {}
  const activeFlags = Object.entries(flags).filter(([, v]) => !!v)

  // Lore items: inventory items with type 'lore'
  const loreItems = inventory.filter(
    (ii) => ii.item.type === 'lore'
  )

  return (
    <div className="overflow-y-auto flex-1 font-mono text-sm text-amber-400 p-2 space-y-2">
      {/* EXPLORATION */}
      <ExplorationSection progress={state.explorationProgress} />

      {/* FACTION STANDING */}
      <section>
        <h2 className="text-amber-600 text-xs uppercase tracking-widest mb-1">
          Faction Standing
        </h2>
        <div className="space-y-1">
          {ALL_FACTIONS.map((faction) => {
            const level = rep[faction] ?? 0
            const label = REPUTATION_LABELS[level] ?? 'Unknown'
            const sign = level > 0 ? '+' : ''
            return (
              <div key={faction} className="flex justify-between">
                <span className="text-amber-400">
                  {FACTION_DISPLAY_NAMES[faction]}
                </span>
                <span
                  className={
                    level > 0
                      ? 'text-amber-300'
                      : level < 0
                        ? 'text-amber-600'
                        : 'text-amber-500'
                  }
                >
                  {label} ({sign}{level})
                </span>
              </div>
            )
          })}
        </div>
      </section>

      {/* QUEST FLAGS */}
      <section className="border-t border-amber-900 pt-1">
        <h2 className="text-amber-600 text-xs uppercase tracking-widest mb-1">
          Quest Flags
        </h2>
        {activeFlags.length === 0 ? (
          <div className="text-amber-600 text-xs italic">No quest progress yet.</div>
        ) : (
          <div className="space-y-1">
            {activeFlags.map(([key, value]) => (
              <div key={key} className="flex items-start gap-2">
                <span className="text-amber-300 shrink-0">{'\u2713'}</span>
                <span className="text-amber-400">
                  {formatFlagName(key)}
                  {typeof value === 'number' && (
                    <span className="text-amber-600"> ({value})</span>
                  )}
                </span>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* BESTIARY */}
      <section className="border-t border-amber-900 pt-1">
        <h2 className="text-amber-600 text-xs uppercase tracking-widest mb-1">
          Bestiary
        </h2>
        {(() => {
          const { ledger } = state
          const discovered = ledger?.discoveredEnemies ?? []
          const totalEnemies = Object.keys(ENEMIES).length
          return (
            <>
              <div className="text-amber-500 text-xs mb-1">
                {discovered.length} / {totalEnemies} enemies discovered
              </div>
              {discovered.length === 0 ? (
                <div className="text-amber-600 text-xs italic">No enemies encountered yet.</div>
              ) : (
                <div className="space-y-1">
                  {discovered.map((enemyId) => {
                    const enemy = getEnemy(enemyId)
                    if (!enemy) return null
                    const truncated = enemy.description.length > 80
                      ? enemy.description.slice(0, 80) + '...'
                      : enemy.description
                    return (
                      <div key={enemyId} className="flex items-start gap-2">
                        <span className="text-amber-600 shrink-0">{'\u2022'}</span>
                        <div>
                          <span className="text-amber-300">{enemy.name}</span>
                          <span className="text-amber-600 text-xs ml-2">{truncated}</span>
                        </div>
                      </div>
                    )
                  })}
                </div>
              )}
            </>
          )
        })()}
      </section>

      {/* LORE ITEMS READ */}
      <section className="border-t border-amber-900 pt-1">
        <h2 className="text-amber-600 text-xs uppercase tracking-widest mb-1">
          Lore Items
        </h2>
        {loreItems.length === 0 ? (
          <div className="text-amber-600 text-xs italic">No lore collected yet.</div>
        ) : (
          <div className="space-y-1">
            {loreItems.map((ii) => (
              <div key={ii.id} className="flex items-start gap-2">
                <span className="text-amber-600 shrink-0">{'\u2022'}</span>
                <span className="text-amber-400">{ii.item.name}</span>
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  )
}
