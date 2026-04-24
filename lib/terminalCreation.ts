// ============================================================
// terminalCreation.ts — Text-based character creation for terminal
// Replaces components/CharacterCreation.tsx with a pure state machine.
// No React. No GUI. Just typed choices and text responses.
// ============================================================

import type { CharacterClass, PersonalLossType, StatBlock, GameMessage, Stat } from '@/types/game'
import { CLASS_DEFINITIONS } from '@/types/game'
import { CLASS_ABILITIES } from '@/lib/abilities'

// ── Constants ─────────────────────────────────────────────────

const BASE_STAT = 2
const MAX_STAT = 8

const STATS: readonly Stat[] = ['vigor', 'grit', 'reflex', 'wits', 'presence', 'shadow'] as const

// Stat tooltips — shown during the stats allocation step only.
// Skill names cross-referenced against lib/skillBonus.ts SKILL_TO_STAT.
const STAT_TOOLTIPS: readonly string[] = [
  'Vigor:    HP, melee damage       (Brawling, Survival, Climbing)',
  'Grit:     HP, endurance          (Resilience, Field Medicine, Composure)',
  'Reflex:   dodge, ranged accuracy  (Marksmanship, Bladework, Mechanics)',
  'Wits:     lore, deduction         (Lore, Tracking, Electronics)',
  'Presence: faction influence       (Negotiation, Intimidation, Mesmerize)',
  'Shadow:   stealth, subtlety       (Stealth, Daystalking, Lockpicking)',
] as const

const STAT_ABBREV: Record<Stat, string[]> = {
  vigor:    ['vig', 'vigor'],
  grit:     ['grt', 'grit'],
  reflex:   ['ref', 'reflex'],
  wits:     ['wit', 'wits'],
  presence: ['pre', 'presence'],
  shadow:   ['shd', 'shadow'],
}

const CLASS_ORDER: CharacterClass[] = [
  'enforcer', 'scout', 'wraith', 'shepherd', 'reclaimer', 'warden', 'broker',
]

const CLASS_TAGLINES: Record<CharacterClass, string> = {
  enforcer:  'Overwhelm. Pure force.',
  scout:     'Mark Target. Precision.',
  wraith:    'Shadowstrike. From nothing.',
  shepherd:  'Mend. Your hands remember.',
  reclaimer: 'Analyze. Know your enemy.',
  warden:    'Brace. Nothing moves you.',
  broker:    'Intimidate. Words cut deeper.',
}

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

const PERSONAL_LOSS_OPTIONS: { type: PersonalLossType; label: string; detailPrompt: string }[] = [
  { type: 'child',     label: 'A child',       detailPrompt: 'What was their name?' },
  { type: 'partner',   label: 'A partner',     detailPrompt: 'What was their name?' },
  { type: 'community', label: 'A community',   detailPrompt: 'What was it called?' },
  { type: 'identity',  label: 'Your identity',  detailPrompt: 'What name do you vaguely remember?' },
  { type: 'promise',   label: 'A promise',     detailPrompt: 'What did you promise?' },
]

// ── Types ─────────────────────────────────────────────────────

export interface CreationState {
  step: 'name' | 'class' | 'stats' | 'loss_type' | 'loss_detail' | 'loss_confirm' | 'done'
  name?: string
  characterClass?: CharacterClass
  stats?: StatBlock
  freePoints?: number
  personalLoss?: { type: PersonalLossType; detail: string }
}

// ── State factory ─────────────────────────────────────────────

export function initialCreationState(): CreationState {
  return { step: 'name' }
}

// ── Helpers ───────────────────────────────────────────────────

let _msgCounter = 0

function msg(text: string): GameMessage {
  return {
    id: `creation-${Date.now()}-${_msgCounter++}`,
    type: 'creation',
    text,
  }
}

function buildInitialStats(cls: CharacterClass): StatBlock {
  const bonus = CLASS_DEFINITIONS[cls].classBonus
  return {
    vigor:    BASE_STAT + (bonus.vigor ?? 0),
    grit:     BASE_STAT + (bonus.grit ?? 0),
    reflex:   BASE_STAT + (bonus.reflex ?? 0),
    wits:     BASE_STAT + (bonus.wits ?? 0),
    presence: BASE_STAT + (bonus.presence ?? 0),
    shadow:   BASE_STAT + (bonus.shadow ?? 0),
  }
}

function statFloor(stat: Stat, cls: CharacterClass): number {
  return BASE_STAT + (CLASS_DEFINITIONS[cls].classBonus[stat] ?? 0)
}

function freePointsFor(cls: CharacterClass): number {
  return CLASS_DEFINITIONS[cls].freePoints
}

function computeSpent(stats: StatBlock, cls: CharacterClass): number {
  return STATS.reduce((sum, s) => sum + (stats[s] - statFloor(s, cls)), 0)
}

function formatStats(stats: StatBlock): string {
  return `VIG:${stats.vigor} GRT:${stats.grit} REF:${stats.reflex} WIT:${stats.wits} PRE:${stats.presence} SHD:${stats.shadow}`
}

function parseStat(token: string): Stat | null {
  const lower = token.toLowerCase()
  for (const stat of STATS) {
    if (STAT_ABBREV[stat].includes(lower)) return stat
  }
  return null
}

const DIVIDER = '\u2550'.repeat(39) // ═ x 39

// ── Prompt generator ──────────────────────────────────────────

export function creationPrompt(state: CreationState): GameMessage[] {
  switch (state.step) {
    case 'name':
      return [
        msg(DIVIDER),
        msg('  THE REMNANT -- CHARACTER INITIALIZATION'),
        msg(DIVIDER),
        msg(''),
        msg('Enter your name:'),
      ]

    case 'class':
      return [
        msg(''),
        msg('Select your class:'),
        ...CLASS_ORDER.map((cls, i) => {
          const def = CLASS_DEFINITIONS[cls]
          return msg(`  [${i + 1}] ${def.name.padEnd(10)} -- ${CLASS_TAGLINES[cls]}`)
        }),
        msg(''),
        msg('Enter number (1-7):'),
      ]

    case 'stats': {
      const cls = state.characterClass!
      const stats = state.stats!
      const spent = computeSpent(stats, cls)
      const remaining = freePointsFor(cls) - spent
      return [
        msg(''),
        msg(`Allocate ${freePointsFor(cls)} points across your stats.`),
        msg(`Current: ${formatStats(stats)}`),
        msg(`Points remaining: ${remaining}`),
        msg(''),
        msg('Stat reference:'),
        ...STAT_TOOLTIPS.map(tip => msg(`  ${tip}`)),
        msg(''),
        msg('Type: ADD VIG (or ADD VIGOR) to increase.'),
        msg('Type: REM VIG (or REMOVE VIGOR) to decrease.'),
        msg('Type: DONE when finished.'),
      ]
    }

    case 'loss_type':
      return [
        msg(''),
        msg('One more thing. The thing that matters most.'),
        msg(''),
        msg('What did CHARON-7 take from you?'),
        ...PERSONAL_LOSS_OPTIONS.map((opt, i) =>
          msg(`  [${i + 1}] ${opt.label}`)
        ),
        msg(''),
        msg('Enter number (1-5):'),
      ]

    case 'loss_detail': {
      const opt = PERSONAL_LOSS_OPTIONS.find(o => o.type === state.personalLoss!.type)!
      return [
        msg(''),
        msg(opt.detailPrompt),
      ]
    }

    case 'loss_confirm': {
      const stats = state.stats!
      const lossLabel = PERSONAL_LOSS_OPTIONS.find(o => o.type === state.personalLoss!.type)!.label
      const detail = state.personalLoss!.detail
      return [
        msg(''),
        msg(DIVIDER),
        msg(`  Name: ${state.name}`),
        msg(`  Class: ${CLASS_DEFINITIONS[state.characterClass!].name}`),
        msg(`  Stats: ${formatStats(stats)}`),
        msg(`  Loss: ${lossLabel}${detail ? ` -- ${detail}` : ''}`),
        msg(DIVIDER),
        msg(''),
        msg('Type CONFIRM to begin, or RESTART to start over.'),
      ]
    }

    case 'done':
      return []

    default:
      return []
  }
}

// ── Input handler ─────────────────────────────────────────────

export function handleCreationInput(
  state: CreationState,
  input: string
): {
  nextState: CreationState
  messages: GameMessage[]
  done?: boolean
  result?: {
    name: string
    stats: StatBlock
    characterClass: CharacterClass
    personalLoss: { type: PersonalLossType; detail: string }
  }
} {
  const trimmed = input.trim()

  switch (state.step) {
    // ── NAME ──────────────────────────────────────────────────
    case 'name': {
      if (!trimmed || trimmed.length > 32) {
        return {
          nextState: state,
          messages: [msg(trimmed ? 'Name must be 32 characters or fewer.' : 'Enter a name.')],
        }
      }
      const nextState: CreationState = { ...state, step: 'class', name: trimmed }
      return {
        nextState,
        messages: [msg(`Name: ${trimmed}`), ...creationPrompt(nextState)],
      }
    }

    // ── CLASS ─────────────────────────────────────────────────
    case 'class': {
      const num = parseInt(trimmed, 10)
      if (isNaN(num) || num < 1 || num > 7) {
        return {
          nextState: state,
          messages: [msg('Enter a number from 1 to 7.')],
        }
      }
      const cls = CLASS_ORDER[num - 1]
      const def = CLASS_DEFINITIONS[cls]
      const stats = buildInitialStats(cls)
      const nextState: CreationState = {
        ...state,
        step: 'stats',
        characterClass: cls,
        stats,
        freePoints: def.freePoints,
      }
      const ability = CLASS_ABILITIES[cls]
      const abilityPreview = `Class Ability: ${ability.name} — ${ability.description}`
      return {
        nextState,
        messages: [
          msg(`Class: ${def.name} -- ${def.description}`),
          msg(abilityPreview),
          ...creationPrompt(nextState),
        ],
      }
    }

    // ── STATS ─────────────────────────────────────────────────
    case 'stats': {
      const upper = trimmed.toUpperCase()
      const cls = state.characterClass!
      const stats = { ...state.stats! }
      const spent = computeSpent(stats, cls)
      const remaining = freePointsFor(cls) - spent

      if (upper === 'DONE') {
        if (remaining !== 0) {
          return {
            nextState: state,
            messages: [msg(`You have ${remaining} point${remaining === 1 ? '' : 's'} remaining. Spend them all before continuing.`)],
          }
        }
        const nextState: CreationState = { ...state, step: 'loss_type', stats }
        return {
          nextState,
          messages: creationPrompt(nextState),
        }
      }

      // Parse ADD/REM <stat>
      const parts = upper.split(/\s+/)
      if (parts.length !== 2 || (parts[0] !== 'ADD' && parts[0] !== 'REM' && parts[0] !== 'REMOVE')) {
        return {
          nextState: state,
          messages: [msg('Type ADD <stat> or REM <stat> (e.g. ADD VIG, REM SHADOW). Type DONE when finished.')],
        }
      }

      const action = parts[0] === 'ADD' ? 'add' : 'rem'
      const stat = parseStat(parts[1])
      if (!stat) {
        return {
          nextState: state,
          messages: [msg('Unknown stat. Use: VIG, GRT, REF, WIT, PRE, SHD (or full names).')],
        }
      }

      if (action === 'add') {
        if (remaining <= 0) {
          return { nextState: state, messages: [msg('No points remaining.')] }
        }
        if (stats[stat] >= MAX_STAT) {
          return { nextState: state, messages: [msg(`${stat} is already at maximum (${MAX_STAT}).`)] }
        }
        stats[stat] += 1
      } else {
        const floor = statFloor(stat, cls)
        if (stats[stat] <= floor) {
          return { nextState: state, messages: [msg(`${stat} is already at its class minimum (${floor}).`)] }
        }
        stats[stat] -= 1
      }

      const newSpent = computeSpent(stats, cls)
      const newRemaining = freePointsFor(cls) - newSpent

      const nextState: CreationState = { ...state, stats }
      return {
        nextState,
        messages: [
          msg(`Current: ${formatStats(stats)}`),
          msg(`Points remaining: ${newRemaining}`),
        ],
      }
    }

    // ── LOSS TYPE ─────────────────────────────────────────────
    case 'loss_type': {
      const num = parseInt(trimmed, 10)
      if (isNaN(num) || num < 1 || num > 5) {
        return {
          nextState: state,
          messages: [msg('Enter a number from 1 to 5.')],
        }
      }
      const opt = PERSONAL_LOSS_OPTIONS[num - 1]
      const vignette = LOSS_VIGNETTES[opt.type]

      const nextState: CreationState = {
        ...state,
        step: 'loss_detail',
        personalLoss: { type: opt.type, detail: '' },
      }
      return {
        nextState,
        messages: [
          msg(''),
          msg(vignette),
          msg(''),
          ...creationPrompt(nextState),
        ],
      }
    }

    // ── LOSS DETAIL ───────────────────────────────────────────
    case 'loss_detail': {
      // Accept anything, including empty (leave it unnamed)
      const detail = trimmed.slice(0, 64)
      const nextState: CreationState = {
        ...state,
        step: 'loss_confirm',
        personalLoss: { ...state.personalLoss!, detail },
      }
      return {
        nextState,
        messages: [
          msg(''),
          msg('You will carry this. The world will remind you.'),
          ...creationPrompt(nextState),
        ],
      }
    }

    // ── CONFIRM ───────────────────────────────────────────────
    case 'loss_confirm': {
      const upper = trimmed.toUpperCase()
      if (upper === 'RESTART') {
        const nextState = initialCreationState()
        return {
          nextState,
          messages: [msg('Starting over.'), msg(''), ...creationPrompt(nextState)],
        }
      }
      if (upper !== 'CONFIRM') {
        return {
          nextState: state,
          messages: [msg('Type CONFIRM to begin, or RESTART to start over.')],
        }
      }
      const nextState: CreationState = { ...state, step: 'done' }
      return {
        nextState,
        messages: [msg(''), msg('Initializing...')],
        done: true,
        result: {
          name: state.name!,
          stats: state.stats!,
          characterClass: state.characterClass!,
          personalLoss: state.personalLoss!,
        },
      }
    }

    case 'done':
      return { nextState: state, messages: [] }

    default:
      return { nextState: state, messages: [] }
  }
}
