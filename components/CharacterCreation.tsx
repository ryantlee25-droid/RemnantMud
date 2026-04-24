'use client'

// ============================================================
// CharacterCreation.tsx — Visual point-buy stat allocation
// Two-column desktop layout (name/class | stats), single column
// on mobile. Loss ritual remains a centered full-screen phase.
// ============================================================

import { useState, useEffect, useRef, useCallback } from 'react'
import { useGame } from '@/lib/gameContext'
import { isDevMode } from '@/lib/supabaseMock'
import type { StatBlock, CharacterClass, PersonalLossType } from '@/types/game'
import { CLASS_DEFINITIONS } from '@/types/game'

// ── Loss Ritual Vignettes ──────────────────────────────────────

const LOSS_VIGNETTES: Record<PersonalLossType, string> = {
  child:
    "You see their face. Not as they were at the end -- as they were at breakfast, three weeks before. Cereal on the table. Morning light. They looked up and said something you can't remember. You would give everything you have left to remember what they said.",
  partner:
    "The last time you touched their hand, you didn't know it was the last time. Nobody ever knows. You have replayed that moment so many times that the memory has worn thin, like paper folded and unfolded until the creases tear. Their name is the first thing you think when you wake. It will be the last thing you think.",
  community:
    "The town sign is still standing. The town isn't. You drove past it once, after. The buildings were there but the windows were dark and the doors were open in the way that doors are open when nobody is coming back to close them. You knew every street. You knew every name. Now you know what absence sounds like when it's the size of a town.",
  identity:
    "There is a photograph in your pocket. The person in it has your face. You do not recognize them. Somewhere between then and now, the thread that connected you to who you were snapped, and you have been assembling a replacement from whatever was available. The replacement works. It isn't you.",
  promise:
    "You said you would. You said it out loud, to someone who believed you. The words are still in the air -- you can almost hear them when the wind drops and the world goes quiet. You don't know if they're still alive to remember what you promised. You know that you remember. That's the weight you carry.",
}

const LOSS_RITUAL_OPENING = 'One more thing. The thing that matters most.'
const LOSS_RITUAL_CLOSING = 'You will carry this. The world will remind you.'

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
    hint: "You can't remember who you were. Fragments return. Some converge with MERIDIAN.",
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
  vigor: 'HP and physical damage',
  grit: 'Echo retention and resilience',
  reflex: 'Initiative and dodge',
  wits: 'Skill checks and awareness',
  presence: 'Social influence and faction rep',
  shadow: 'Stealth and sneak',
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

function statFloor(stat: StatKey, cls: CharacterClass): number {
  return BASE + (CLASS_DEFINITIONS[cls].classBonus[stat] ?? 0)
}

function computeFreeSpent(stats: StatBlock, cls: CharacterClass): number {
  return STATS.reduce((sum, stat) => sum + (stats[stat] - statFloor(stat, cls)), 0)
}

function useTypewriter(text: string, active: boolean, speed: number = 35) {
  const [displayed, setDisplayed] = useState('')
  const [done, setDone] = useState(false)
  const indexRef = useRef(0)
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null)

  useEffect(() => {
    if (!active) {
      setDisplayed('')
      setDone(false)
      indexRef.current = 0
      return
    }

    indexRef.current = 0
    setDisplayed('')
    setDone(false)

    intervalRef.current = setInterval(() => {
      indexRef.current += 1
      if (indexRef.current >= text.length) {
        setDisplayed(text)
        setDone(true)
        if (intervalRef.current) clearInterval(intervalRef.current)
      } else {
        setDisplayed(text.slice(0, indexRef.current))
      }
    }, speed)

    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current)
    }
  }, [text, active, speed])

  const skip = useCallback(() => {
    if (intervalRef.current) clearInterval(intervalRef.current)
    setDisplayed(text)
    setDone(true)
  }, [text])

  return { displayed, done, skip }
}

type CreationPhase = 'creation' | 'loss_ritual'

type RitualStep = 'opening' | 'choosing' | 'vignette' | 'detail' | 'closing'

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

  const [phase, setPhase] = useState<CreationPhase>('creation')
  const [ritualStep, setRitualStep] = useState<RitualStep>('opening')
  const [ritualLossType, setRitualLossType] = useState<PersonalLossType | null>(null)
  const [closingVisible, setClosingVisible] = useState(false)

  const classDef = CLASS_DEFINITIONS[characterClass]
  const freeSpent = computeFreeSpent(stats, characterClass)
  const remaining = classDef.freePoints - freeSpent
  const maxHpPreview = 8 + (stats.vigor - 2) * 2

  const opening = useTypewriter(
    LOSS_RITUAL_OPENING,
    phase === 'loss_ritual' && ritualStep === 'opening',
    55
  )

  const vignette = useTypewriter(
    ritualLossType ? LOSS_VIGNETTES[ritualLossType] : '',
    phase === 'loss_ritual' && ritualStep === 'vignette' && ritualLossType !== null,
    30
  )

  const closing = useTypewriter(
    LOSS_RITUAL_CLOSING,
    phase === 'loss_ritual' && ritualStep === 'closing',
    45
  )

  useEffect(() => {
    if (phase === 'loss_ritual' && ritualStep === 'opening' && opening.done) {
      const timeout = setTimeout(() => setRitualStep('choosing'), 800)
      return () => clearTimeout(timeout)
    }
  }, [phase, ritualStep, opening.done])

  useEffect(() => {
    if (phase === 'loss_ritual' && ritualStep === 'closing' && closing.done) {
      const timeout = setTimeout(() => {
        setClosingVisible(true)
      }, 1500)
      return () => clearTimeout(timeout)
    }
  }, [phase, ritualStep, closing.done])

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

  function enterLossRitual() {
    if (remaining !== 0) return
    if (!name.trim()) {
      setError('Enter a name.')
      return
    }
    setError('')
    setPhase('loss_ritual')
    setRitualStep('opening')
    setRitualLossType(null)
    setClosingVisible(false)
  }

  function selectRitualLoss(lossType: PersonalLossType) {
    setRitualLossType(lossType)
    setPersonalLossType(lossType)
    setPersonalLossDetail('')
    setRitualStep('vignette')
  }

  function confirmVignette() {
    setRitualStep('detail')
  }

  function confirmDetail() {
    setRitualStep('closing')
    setClosingVisible(false)
  }

  function goBackToChoosing() {
    setRitualLossType(null)
    setPersonalLossDetail('')
    setRitualStep('choosing')
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
    } finally {
      setSubmitting(false)
    }
  }

  // ── Loss Ritual Renderer ──────────────────────────────────────

  if (phase === 'loss_ritual') {
    return (
      <div className="flex flex-col items-center justify-center flex-1 font-mono p-4 sm:p-6 md:p-12 bg-black h-full overflow-y-auto">
        <div className="w-full max-w-xl">

          {ritualStep === 'opening' && (
            <div className="text-center">
              <div className="text-amber-400 text-sm leading-relaxed min-h-[2rem]">
                {opening.displayed}
                {!opening.done && (
                  <span className="inline-block w-1.5 h-4 bg-amber-400 animate-pulse ml-0.5 align-middle" />
                )}
              </div>
              {!opening.done && (
                <button
                  onClick={opening.skip}
                  className="mt-8 text-amber-900 text-xs uppercase tracking-widest"
                >
                  Skip
                </button>
              )}
            </div>
          )}

          {ritualStep === 'choosing' && (
            <div>
              <div className="text-amber-400 text-xs uppercase tracking-widest mb-6 text-center">
                What did you lose?
              </div>
              <div className="space-y-3">
                {PERSONAL_LOSS_OPTIONS.map((opt, i) => (
                  <button
                    key={opt.type}
                    onClick={() => selectRitualLoss(opt.type)}
                    className="w-full text-left px-4 py-3 border border-amber-900 hover:border-amber-700"
                  >
                    <div className="text-amber-400 text-sm">
                      {i + 1}. {opt.label}
                    </div>
                  </button>
                ))}
              </div>
            </div>
          )}

          {ritualStep === 'vignette' && ritualLossType && (
            <div>
              <div className="text-amber-400 text-xs uppercase tracking-widest mb-6 text-center">
                {PERSONAL_LOSS_OPTIONS.find((o) => o.type === ritualLossType)?.label}
              </div>
              <div className="text-amber-400 text-sm leading-loose min-h-[6rem]">
                {vignette.displayed}
                {!vignette.done && (
                  <span className="inline-block w-1.5 h-4 bg-amber-400 animate-pulse ml-0.5 align-middle" />
                )}
              </div>
              <div className="mt-8 flex gap-4 justify-center">
                {!vignette.done && (
                  <button
                    onClick={vignette.skip}
                    className="text-amber-900 text-xs uppercase tracking-widest"
                  >
                    Skip
                  </button>
                )}
                {vignette.done && (
                  <>
                    <button
                      onClick={goBackToChoosing}
                      className="text-amber-900 text-xs uppercase tracking-widest"
                    >
                      Choose differently
                    </button>
                    <button
                      onClick={confirmVignette}
                      className="border border-amber-800 text-amber-400 px-5 py-1.5 text-sm hover:border-amber-600"
                    >
                      This is mine
                    </button>
                  </>
                )}
              </div>
            </div>
          )}

          {ritualStep === 'detail' && ritualLossType && (
            <div>
              <div className="text-amber-400 text-xs uppercase tracking-widest mb-2 text-center">
                {PERSONAL_LOSS_OPTIONS.find((o) => o.type === ritualLossType)?.label}
              </div>
              <div className="text-amber-600 text-xs mb-6 text-center">
                {PERSONAL_LOSS_OPTIONS.find((o) => o.type === ritualLossType)?.hint}
              </div>
              <div className="max-w-sm mx-auto">
                <input
                  type="text"
                  value={personalLossDetail}
                  onChange={(e) => setPersonalLossDetail(e.target.value)}
                  maxLength={64}
                  placeholder={PERSONAL_LOSS_OPTIONS.find((o) => o.type === ritualLossType)?.placeholder}
                  className="w-full bg-transparent border-b border-amber-900 text-amber-300 px-1 py-2 outline-none focus:border-amber-700 text-sm placeholder-amber-900 text-center"
                  autoFocus
                  autoComplete="off"
                  spellCheck={false}
                />
                <div className="mt-6 flex justify-center">
                  <button
                    onClick={confirmDetail}
                    className="border border-amber-800 text-amber-400 px-5 py-1.5 text-sm hover:border-amber-600"
                  >
                    {personalLossDetail.trim() ? 'RESUME' : 'Leave it unnamed'}
                  </button>
                </div>
              </div>
            </div>
          )}

          {ritualStep === 'closing' && (
            <div className="text-center">
              <div className="text-amber-400 text-sm leading-relaxed min-h-[2rem]">
                {closing.displayed}
                {!closing.done && (
                  <span className="inline-block w-1.5 h-4 bg-amber-400 animate-pulse ml-0.5 align-middle" />
                )}
              </div>
              {closingVisible && (
                <div className="mt-8">
                  <button
                    onClick={handleSubmit}
                    disabled={submitting}
                    className="border border-amber-700 text-amber-400 px-8 py-2 text-sm disabled:opacity-40 hover:border-amber-500"
                  >
                    {submitting
                      ? (isRebirth ? 'INITIALIZING...' : 'GENERATING WORLD...')
                      : (isRebirth ? 'RESUME' : '[ INITIALIZE NEW SESSION ]')}
                  </button>
                </div>
              )}
              {error && (
                <div className="mt-4 text-red-400 text-sm">{error}</div>
              )}
            </div>
          )}

        </div>
      </div>
    )
  }

  // ── Standard Creation Phase — two-column on desktop ──────────

  return (
    <div className="flex flex-col flex-1 font-mono bg-black h-full overflow-y-auto">
      <div className="w-full max-w-5xl mx-auto px-4 sm:px-6 md:px-10 py-6 text-amber-400">

        {/* Header spans both columns */}
        <div className="mb-6">
          <div className="text-amber-600 text-xs uppercase tracking-widest mb-1">
            {isRebirth
              ? `CYCLE ${(state.player?.cycle ?? 1) + 1} — REBIRTH`
              : 'THE REMNANT — Character Creation'}
          </div>
          <div className="text-amber-300 text-base">
            {isRebirth ? 'WHO WILL YOU BE?' : 'WHO ARE YOU?'}
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">

          {/* ── Left column: name + class ───────────────────── */}
          <div>
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

            <div className="mb-6">
              <label className="block text-xs text-amber-600 uppercase tracking-widest mb-1">
                Class
              </label>
              <div className="border border-amber-800 p-2">
                {(Object.keys(CLASS_DEFINITIONS) as CharacterClass[]).map((cls, i) => (
                  <button
                    key={cls}
                    type="button"
                    onClick={() => handleClassChange(cls)}
                    className={`block w-full text-left text-xs py-1 px-1 ${
                      characterClass === cls
                        ? 'text-amber-300 bg-amber-900'
                        : 'text-amber-600 hover:text-amber-400'
                    }`}
                  >
                    {i + 1}. {CLASS_DEFINITIONS[cls].name} -- {CLASS_DEFINITIONS[cls].archetype}
                  </button>
                ))}
              </div>
              <div className="text-amber-600 text-xs mt-2 leading-relaxed">
                {CLASS_DEFINITIONS[characterClass].description}
              </div>
            </div>

            <div className="text-amber-700 text-xs leading-relaxed">
              Class bonuses are permanent floors. Distribute {classDef.freePoints} free points
              to any stat. Max {MAX_STAT} per stat.
              {isRebirth && (
                <> Echo floors from your past life are shown in <span className="text-blue-600">blue</span>.</>
              )}
            </div>
          </div>

          {/* ── Right column: stat rows + submit ─────────────── */}
          <div>
            <div className="mb-4 flex items-center gap-4">
              <span className="text-xs text-amber-600 uppercase tracking-widest">Free points remaining</span>
              <span className={`text-xl font-bold ${remaining === 0 ? 'text-amber-400' : 'text-amber-200'}`}>
                {remaining}
              </span>
            </div>

            <div className="mb-6 space-y-2">
              {STATS.map((stat) => {
                const bonus = classDef.classBonus[stat] ?? 0
                const floor = BASE + bonus
                const atFloor = stats[stat] <= floor
                const hasEchoBoost = isRebirth && (echoStats?.[stat] ?? 0) > floor
                return (
                  <div key={stat} className="flex items-center gap-3">
                    <div className="flex-1 min-w-0">
                      <div className="text-amber-300 text-sm flex items-center gap-1 flex-wrap">
                        {STAT_LABELS[stat]}
                        {bonus > 0 && (
                          <span className="text-amber-700 text-xs">[+{bonus} class]</span>
                        )}
                        {hasEchoBoost && (
                          <span className="text-blue-600 text-xs">[~echo]</span>
                        )}
                      </div>
                      <div className="text-amber-700 text-xs leading-snug">{STAT_DESCRIPTIONS[stat]}</div>
                    </div>

                    <button
                      onClick={() => decrement(stat)}
                      disabled={atFloor}
                      className="w-7 h-7 border border-amber-800 text-amber-400 disabled:opacity-30 disabled:cursor-not-allowed text-center leading-none hover:border-amber-600"
                      aria-label={`Decrease ${STAT_LABELS[stat]}`}
                    >
                      [-]
                    </button>

                    <span className="w-6 text-center text-amber-200 text-lg">{stats[stat]}</span>

                    <button
                      onClick={() => increment(stat)}
                      disabled={remaining <= 0 || stats[stat] >= MAX_STAT}
                      className="w-7 h-7 border border-amber-800 text-amber-400 disabled:opacity-30 disabled:cursor-not-allowed text-center leading-none hover:border-amber-600"
                      aria-label={`Increase ${STAT_LABELS[stat]}`}
                    >
                      [+]
                    </button>

                    <span className="text-xs text-amber-600 ml-1 w-8">({modStr(stats[stat])})</span>
                  </div>
                )
              })}
            </div>

            <div className="mb-6 text-sm text-amber-600">
              Starting HP: <span className="text-amber-300">{maxHpPreview}</span>
            </div>

            {error && (
              <div className="mb-4 text-red-400 text-sm">{error}</div>
            )}

            <button
              onClick={enterLossRitual}
              disabled={submitting || !name.trim() || remaining !== 0}
              className="w-full border border-amber-600 text-amber-400 py-2 text-sm disabled:opacity-40 disabled:cursor-not-allowed hover:border-amber-400"
            >
              RESUME
            </button>

            {isDevMode() && !isRebirth && !submitting && (
              <button
                onClick={async () => {
                  setSubmitting(true)
                  try {
                    const devStats: StatBlock = {
                      vigor: 6, grit: 4, reflex: 4, wits: 4, presence: 3, shadow: 3,
                    }
                    await engine.createCharacter('Dev', devStats, 'enforcer')
                  } catch (err) {
                    setError(err instanceof Error ? err.message : 'Quick start failed.')
                    setSubmitting(false)
                  }
                }}
                className="w-full mt-2 border border-amber-900 text-amber-700 py-1 text-xs hover:border-amber-700"
              >
                Quick Start (Dev)
              </button>
            )}
          </div>

        </div>
      </div>
    </div>
  )
}
