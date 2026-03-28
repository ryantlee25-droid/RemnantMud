'use client'

// ============================================================
// CharacterCreation.tsx — Point-buy stat allocation screen
// ============================================================

import { useState } from 'react'
import { useGame } from '@/lib/gameContext'
import { isDevMode } from '@/lib/supabaseMock'
import type { StatBlock, CharacterClass, PersonalLossType } from '@/types/game'
import { CLASS_DEFINITIONS } from '@/types/game'

const PERSONAL_LOSS_OPTIONS: { type: PersonalLossType; label: string; placeholder: string; hint: string }[] = [
  {
    type: 'child',
    label: 'A child',
    placeholder: 'Their name',
    hint: 'You find traces of their path. A name on a refugee list. A drawing on a wall.',
  },
  {
    type: 'partner',
    label: 'A partner',
    placeholder: 'Their name',
    hint: 'Letters. Sightings. Rumors. A trail that leads somewhere.',
  },
  {
    type: 'community',
    label: 'A community',
    placeholder: 'The name of your town',
    hint: 'You can eventually travel there. What you find depends on luck.',
  },
  {
    type: 'identity',
    label: 'Your own identity',
    placeholder: 'A name you vaguely remember',
    hint: 'You can\'t remember who you were. Fragments return. Some converge with MERIDIAN.',
  },
  {
    type: 'promise',
    label: 'A promise',
    placeholder: 'What did you promise to do?',
    hint: 'The game will weave it into the world. NPCs will know. Documents will reference it.',
  },
]

const STATS = ['vigor', 'grit', 'reflex', 'wits', 'presence', 'shadow'] as const
type StatKey = (typeof STATS)[number]

const STAT_LABELS: Record<StatKey, string> = {
  vigor: 'Vigor',
  grit: 'Grit',
  reflex: 'Reflex',
  wits: 'Wits',
  presence: 'Presence',
  shadow: 'Shadow',
}

const STAT_DESCRIPTIONS: Record<StatKey, string> = {
  vigor: 'Melee attack & HP',
  grit: 'Fear & stress resistance',
  reflex: 'Speed, ranged & initiative',
  wits: 'Perception & crafting',
  presence: 'Charisma & faction',
  shadow: 'Stealth & deception',
}

const BASE = 2
const MAX_STAT = 8

function buildInitialStatsWithEcho(cls: CharacterClass, echo: StatBlock | undefined): StatBlock {
  const bonus = CLASS_DEFINITIONS[cls].classBonus
  return {
    vigor:    Math.max(BASE + (bonus.vigor    ?? 0), echo?.vigor    ?? 0),
    grit:     Math.max(BASE + (bonus.grit     ?? 0), echo?.grit     ?? 0),
    reflex:   Math.max(BASE + (bonus.reflex   ?? 0), echo?.reflex   ?? 0),
    wits:     Math.max(BASE + (bonus.wits     ?? 0), echo?.wits     ?? 0),
    presence: Math.max(BASE + (bonus.presence ?? 0), echo?.presence ?? 0),
    shadow:   Math.max(BASE + (bonus.shadow   ?? 0), echo?.shadow   ?? 0),
  }
}

function modStr(n: number): string {
  const mod = n - 5
  if (mod > 0) return `+${mod}`
  return String(mod)
}

// Stats start at BASE + class bonus points
function buildInitialStats(cls: CharacterClass): StatBlock {
  const bonus = CLASS_DEFINITIONS[cls].classBonus
  return {
    vigor:    BASE + (bonus.vigor    ?? 0),
    grit:     BASE + (bonus.grit     ?? 0),
    reflex:   BASE + (bonus.reflex   ?? 0),
    wits:     BASE + (bonus.wits     ?? 0),
    presence: BASE + (bonus.presence ?? 0),
    shadow:   BASE + (bonus.shadow   ?? 0),
  }
}

// Floor for a stat = BASE + class bonus. Can't go below this.
function statFloor(stat: StatKey, cls: CharacterClass): number {
  return BASE + (CLASS_DEFINITIONS[cls].classBonus[stat] ?? 0)
}

// Free points spent = how many points above class floor across all stats
function computeFreeSpent(stats: StatBlock, cls: CharacterClass): number {
  return STATS.reduce((sum, stat) => sum + (stats[stat] - statFloor(stat, cls)), 0)
}

interface CharacterCreationProps {
  isRebirth?: boolean
  echoStats?: StatBlock
  onRebirthComplete?: () => void
}

export default function CharacterCreation({ isRebirth, echoStats, onRebirthComplete }: CharacterCreationProps = {}) {
  const { engine, state } = useGame()

  const [name, setName] = useState('')
  const [characterClass, setCharacterClass] = useState<CharacterClass>('enforcer')
  const [stats, setStats] = useState<StatBlock>(() =>
    isRebirth ? buildInitialStatsWithEcho('enforcer', echoStats) : buildInitialStats('enforcer')
  )
  const [personalLossType, setPersonalLossType] = useState<PersonalLossType>('child')
  const [personalLossDetail, setPersonalLossDetail] = useState('')
  const [error, setError] = useState('')
  const [submitting, setSubmitting] = useState(false)

  const classDef = CLASS_DEFINITIONS[characterClass]
  const freeSpent = computeFreeSpent(stats, characterClass)
  const remaining = classDef.freePoints - freeSpent
  const maxHpPreview = 8 + (stats.vigor - 2) * 2

  function handleClassChange(cls: CharacterClass) {
    setCharacterClass(cls)
    setStats(isRebirth ? buildInitialStatsWithEcho(cls, echoStats) : buildInitialStats(cls))
  }

  function increment(stat: StatKey) {
    if (remaining <= 0) return
    if (stats[stat] >= MAX_STAT) return
    setStats((prev) => ({ ...prev, [stat]: prev[stat] + 1 }))
  }

  function decrement(stat: StatKey) {
    if (stats[stat] <= statFloor(stat, characterClass)) return
    setStats((prev) => ({ ...prev, [stat]: prev[stat] - 1 }))
  }

  async function handleSubmit() {
    const trimmedName = name.trim()
    if (!trimmedName) {
      setError('Enter a name.')
      return
    }
    if (remaining !== 0) {
      setError(`Spend all ${classDef.freePoints} free points before continuing.`)
      return
    }

    setError('')
    setSubmitting(true)
    try {
      if (isRebirth) {
        await engine.rebirthWithStats(trimmedName, stats, characterClass, {
          type: personalLossType,
          detail: personalLossDetail.trim() || undefined,
        })
        onRebirthComplete?.()
      } else {
        await engine.createCharacter(trimmedName, stats, characterClass, {
          type: personalLossType,
          detail: personalLossDetail.trim() || undefined,
        })
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create character.')
      setSubmitting(false)
    }
  }

  return (
    <div className="flex items-center justify-center min-h-screen bg-black font-mono p-4">
      <div className="w-full max-w-lg text-amber-400">
        <div className="mb-6">
          <div className="text-amber-600 text-xs uppercase tracking-widest mb-1">
            {isRebirth
              ? `CYCLE ${(state.player?.cycle ?? 1) + 1} — REBIRTH`
              : 'THE REMNANT — Character Creation'}
          </div>
          <div className="text-2xl text-amber-300">
            {isRebirth ? 'Who will you be?' : 'Who are you?'}
          </div>
        </div>

        {/* Name */}
        <div className="mb-6">
          <label className="block text-xs text-amber-600 uppercase tracking-widest mb-1">
            Name
          </label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            maxLength={32}
            className="w-full bg-transparent border border-amber-800 text-amber-300 px-3 py-2 outline-none focus:border-amber-500 text-sm placeholder-amber-900"
            placeholder="your survivor's name"
            autoFocus
            autoComplete="off"
            autoCorrect="off"
            spellCheck={false}
          />
        </div>

        {/* Class */}
        <div className="mb-6">
          <label className="block text-xs text-amber-600 uppercase tracking-widest mb-1">
            Class
          </label>
          <select
            value={characterClass}
            onChange={(e) => handleClassChange(e.target.value as CharacterClass)}
            className="w-full bg-black border border-amber-800 text-amber-300 px-3 py-2 outline-none focus:border-amber-500 text-sm"
          >
            {(Object.keys(CLASS_DEFINITIONS) as CharacterClass[]).map((cls) => (
              <option key={cls} value={cls}>
                {CLASS_DEFINITIONS[cls].name} — {CLASS_DEFINITIONS[cls].archetype}
              </option>
            ))}
          </select>
          <div className="text-amber-600 text-xs mt-1">
            {CLASS_DEFINITIONS[characterClass].description}
          </div>
        </div>

        {/* Points counter */}
        <div className="mb-4 flex items-center gap-4">
          <span className="text-xs text-amber-600 uppercase tracking-widest">Free points remaining</span>
          <span className={`text-xl font-bold ${remaining === 0 ? 'text-amber-400' : 'text-amber-200'}`}>
            {remaining}
          </span>
        </div>

        {/* Stat rows */}
        <div className="mb-6 space-y-3">
          {STATS.map((stat) => {
            const bonus = classDef.classBonus[stat] ?? 0
            const floor = BASE + bonus
            const atFloor = stats[stat] <= floor
            const hasEchoBoost = isRebirth && (echoStats?.[stat] ?? 0) > floor
            return (
              <div key={stat} className="flex items-center gap-3">
                <div className="w-28">
                  <div className="text-amber-300 text-sm flex items-center gap-1">
                    {STAT_LABELS[stat]}
                    {bonus > 0 && (
                      <span className="text-amber-700 text-xs">[+{bonus} class]</span>
                    )}
                    {hasEchoBoost && (
                      <span className="text-blue-600 text-xs">[~echo]</span>
                    )}
                  </div>
                  <div className="text-amber-600 text-xs">{STAT_DESCRIPTIONS[stat]}</div>
                </div>

                <button
                  onClick={() => decrement(stat)}
                  disabled={atFloor}
                  className="w-7 h-7 border border-amber-800 text-amber-400 hover:bg-amber-900 disabled:opacity-30 disabled:cursor-not-allowed text-center leading-none"
                >
                  −
                </button>

                <span className="w-6 text-center text-amber-200 text-lg">{stats[stat]}</span>

                <button
                  onClick={() => increment(stat)}
                  disabled={remaining <= 0 || stats[stat] >= MAX_STAT}
                  className="w-7 h-7 border border-amber-800 text-amber-400 hover:bg-amber-900 disabled:opacity-30 disabled:cursor-not-allowed text-center leading-none"
                >
                  +
                </button>

                <span className="text-xs text-amber-600 ml-1">({modStr(stats[stat])})</span>
              </div>
            )
          })}
        </div>

        {/* HP preview */}
        <div className="mb-6 text-sm text-amber-600">
          Starting HP: <span className="text-amber-300">{maxHpPreview}</span>
        </div>

        {/* Personal loss */}
        <div className="mb-6 border-t border-amber-900 pt-6">
          <div className="text-xs text-amber-600 uppercase tracking-widest mb-1">What did you lose?</div>
          <div className="text-amber-700 text-xs mb-3">
            This shapes what surfaces in the world. Not a quest. A haunting.
          </div>
          <div className="space-y-2 mb-3">
            {PERSONAL_LOSS_OPTIONS.map((opt) => (
              <label key={opt.type} className="flex items-start gap-2 cursor-pointer group">
                <input
                  type="radio"
                  name="personal_loss"
                  value={opt.type}
                  checked={personalLossType === opt.type}
                  onChange={() => { setPersonalLossType(opt.type); setPersonalLossDetail('') }}
                  className="mt-0.5 accent-amber-500"
                />
                <div>
                  <div className="text-amber-300 text-sm">{opt.label}</div>
                  <div className="text-amber-600 text-xs">{opt.hint}</div>
                </div>
              </label>
            ))}
          </div>
          {(() => {
            const opt = PERSONAL_LOSS_OPTIONS.find((o) => o.type === personalLossType)
            return opt ? (
              <input
                type="text"
                value={personalLossDetail}
                onChange={(e) => setPersonalLossDetail(e.target.value)}
                maxLength={64}
                placeholder={opt.placeholder}
                className="w-full bg-transparent border border-amber-900 text-amber-300 px-3 py-2 outline-none focus:border-amber-700 text-sm placeholder-amber-900"
                autoComplete="off"
                spellCheck={false}
              />
            ) : null
          })()}
        </div>

        {/* Error */}
        {error && (
          <div className="mb-4 text-red-400 text-sm">{error}</div>
        )}

        {/* Submit */}
        <button
          onClick={handleSubmit}
          disabled={submitting || !name.trim() || remaining !== 0}
          className="w-full border border-amber-600 text-amber-400 py-2 text-sm hover:bg-amber-900 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
        >
          {submitting
            ? (isRebirth ? 'Awakening...' : 'Generating world...')
            : (isRebirth ? 'Return' : 'Begin')}
        </button>

        {isDevMode() && !isRebirth && !submitting && (
          <button
            onClick={async () => {
              setSubmitting(true)
              try {
                // Enforcer base (2) + classBonus: vigor=6, grit=4, reflex=4, wits=2, presence=2, shadow=2
                // Distribute 4 free points: wits+2, presence+1, shadow+1
                const devStats: StatBlock = {
                  vigor: 6, grit: 4, reflex: 4, wits: 4, presence: 3, shadow: 3,
                }
                await engine.createCharacter('Dev', devStats, 'enforcer')
              } catch (err) {
                setError(err instanceof Error ? err.message : 'Quick start failed.')
                setSubmitting(false)
              }
            }}
            className="w-full mt-2 border border-amber-900 text-amber-700 py-1 text-xs hover:bg-amber-950 transition-colors"
          >
            Quick Start (Dev)
          </button>
        )}

        <div className="mt-4 text-amber-700 text-xs">
          Class bonuses are permanent floors. Distribute {classDef.freePoints} free points to any stat. Max {MAX_STAT} per stat.
        </div>
      </div>
    </div>
  )
}
