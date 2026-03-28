import type { Action, GameState } from '@/types/game'

// ------------------------------------------------------------
// Verb maps — normalized verb → accepted surface forms
// ------------------------------------------------------------

const MOVEMENT_VERBS = new Set(['go', 'move', 'walk', 'head'])

const SWIM_VERBS = new Set(['swim', 'wade', 'ford'])

const CLIMB_VERBS: Record<string, string> = {
  climb: 'climb',
  scale: 'climb',
  ascend: 'climb',
  clamber: 'climb',
}

const SNEAK_VERBS: Record<string, string> = {
  sneak: 'sneak',
  stealth: 'sneak',
  hide: 'sneak',
  creep: 'sneak',
  skulk: 'sneak',
  tiptoe: 'sneak',
}

const CRAFT_VERBS: Record<string, string> = {
  craft: 'craft',
  build: 'craft',
  make: 'craft',
  construct: 'craft',
  assemble: 'craft',
  forge: 'craft',
  create: 'craft',
}

const UNLOCK_VERBS: Record<string, string> = {
  unlock: 'unlock',
  unbolt: 'unlock',
}

const GIVE_VERBS: Record<string, string> = {
  give: 'give',
  hand: 'give',
  offer: 'give',
  present: 'give',
  deliver: 'give',
}

const DIRECTIONS: Record<string, string> = {
  north: 'north',
  n: 'north',
  south: 'south',
  s: 'south',
  east: 'east',
  e: 'east',
  west: 'west',
  w: 'west',
  up: 'up',
  down: 'down',
}

const LOOK_VERBS: Record<string, string> = {
  look: 'look',
  l: 'look',
  examine: 'look',
  x: 'look',
  inspect: 'look',
  check: 'look',
  describe: 'look',
}

const INVENTORY_VERBS: Record<string, string> = {
  inventory: 'inventory',
  i: 'inventory',
  inv: 'inventory',
  take: 'take',
  get: 'take',
  pickup: 'take',
  grab: 'take',
  drop: 'drop',
  use: 'use',
  eat: 'use',
  equip: 'equip',
  wear: 'equip',
  wield: 'equip',
  unequip: 'unequip',
  remove: 'unequip',
  stash: 'stash',
  unstash: 'unstash',
  retrieve: 'unstash',
}

const COMBAT_VERBS: Record<string, string> = {
  attack: 'attack',
  kill: 'attack',
  hit: 'attack',
  fight: 'attack',
  strike: 'attack',
  flee: 'flee',
  run: 'flee',
  escape: 'flee',
  retreat: 'flee',
  ability: 'ability',
  special: 'ability',
  power: 'ability',
  defend: 'defend',
  block: 'defend',
  guard: 'defend',
  wait: 'wait',
  patience: 'wait',
  analyze: 'analyze',
  scan: 'analyze',
  study: 'analyze',
}

const SURVIVAL_VERBS: Record<string, string> = {
  rest: 'rest',
  sleep: 'rest',
  camp: 'camp',
  drink: 'drink',
  fill: 'drink',
}

const TRADE_VERBS: Record<string, string> = {
  buy: 'buy',
  purchase: 'buy',
  sell: 'sell',
  trade: 'trade',
  barter: 'trade',
}

const INTERACTION_VERBS: Record<string, string> = {
  talk: 'talk',
  speak: 'talk',
  ask: 'talk',
  greet: 'talk',
  open: 'open',
  search: 'search',
}

const SYSTEM_VERBS: Record<string, string> = {
  stats: 'stats',
  status: 'stats',
  character: 'stats',
  char: 'stats',
  help: 'help',
  '?': 'help',
  save: 'save',
  quit: 'quit',
  exit: 'quit',
  rep: 'rep',
  reputation: 'rep',
  standing: 'rep',
  quest: 'quests',
  quests: 'quests',
}

// ------------------------------------------------------------
// Sensory verbs
// ------------------------------------------------------------

const SMELL_VERBS = new Set(['smell', 'sniff', 'scent'])

const LISTEN_VERBS = new Set(['listen', 'hear'])

const TOUCH_VERBS = new Set(['touch', 'feel'])

// ------------------------------------------------------------
// Hint verb
// ------------------------------------------------------------

const HINT_VERBS = new Set(['hint', 'stuck', 'clue', 'what', 'where'])

// ------------------------------------------------------------
// Called-shot body parts
// ------------------------------------------------------------

const BODY_PARTS = new Set(['head', 'legs', 'arms', 'torso', 'eyes'])

// Multi-word surface forms, checked before single-word splitting.
// Each entry: [normalized_verb, normalized_noun | null]
const MULTI_WORD: Array<[string, string, string | undefined]> = [
  ['pick up', 'take', undefined],
  ['pick lock', 'unlock', undefined],
  ['put down', 'drop', undefined],
  ['take off', 'unequip', undefined],
  ['search room', 'search', undefined],
  ['look around', 'search', undefined],
  ['look at', 'examine_extra', undefined],
  ['fast travel', 'travel', undefined],
  ['look under', 'examine_spatial', 'under'],
  ['look behind', 'examine_spatial', 'behind'],
  ['look inside', 'examine_spatial', 'inside'],
  ['look in', 'examine_spatial', 'inside'],
]

// ------------------------------------------------------------
// Parser
// ------------------------------------------------------------

// ------------------------------------------------------------
// Dialogue-aware parser — intercepts input when in a conversation
// ------------------------------------------------------------

const DIALOGUE_LEAVE_WORDS = new Set(['leave', 'bye', 'back', 'end', 'end conversation', 'exit conversation'])

/**
 * Parse input while the player is in an active dialogue.
 * Numbers 1-9 become dialogue_choice; leave words become dialogue_leave;
 * everything else is blocked with a hint message.
 */
export function parseDialogueInput(input: string): Action {
  const raw = input
  const trimmed = input.trim()
  const normalized = trimmed.toLowerCase()

  // Numbered choice (1+)
  if (/^\d+$/.test(normalized) && parseInt(normalized, 10) >= 1) {
    return { verb: 'dialogue_choice', noun: normalized, raw }
  }

  // Leave words
  if (DIALOGUE_LEAVE_WORDS.has(normalized)) {
    return { verb: 'dialogue_leave', noun: undefined, raw }
  }

  // Anything else — blocked
  return { verb: 'dialogue_blocked', noun: trimmed, raw }
}

/**
 * Parse raw text input into a structured Action.
 * Verb is always normalized. Noun is the remainder of the input
 * after the verb token is consumed, trimmed.
 * Unknown commands return: { verb: "unknown", noun: input, raw: input }
 */
export function parseCommand(input: string): Action {
  const raw = input
  const trimmed = input.trim()
  const normalized = trimmed.toLowerCase()

  if (normalized === '') {
    return { verb: 'unknown', noun: '', raw }
  }

  // --- Multi-word surface forms ---
  for (const [surface, verb, noun] of MULTI_WORD) {
    if (normalized === surface || normalized.startsWith(surface + ' ')) {
      const remainder = normalized.slice(surface.length).trim()
      // For examine_spatial, prepend the preposition so noun = "under table"
      if (verb === 'examine_spatial' && noun) {
        return { verb, noun: remainder ? `${noun} ${remainder}` : noun, raw }
      }
      return { verb, noun: noun ?? (remainder || undefined), raw }
    }
  }

  // --- Split into tokens ---
  const tokens = normalized.split(/\s+/)
  const first = tokens[0]!
  const rest = tokens.slice(1).join(' ').trim()

  // --- Bare direction (e.g. "n", "north") ---
  if (first in DIRECTIONS && rest === '') {
    return { verb: 'go', noun: DIRECTIONS[first], raw }
  }

  // --- Movement verb + direction ---
  if (MOVEMENT_VERBS.has(first)) {
    const target = rest !== '' ? rest : undefined
    if (target !== undefined && target in DIRECTIONS) {
      return { verb: 'go', noun: DIRECTIONS[target], raw }
    }
    return { verb: 'go', noun: target, raw }
  }

  // --- Swim ---
  if (SWIM_VERBS.has(first)) {
    const target = rest !== '' ? rest : undefined
    if (target !== undefined && target in DIRECTIONS) {
      return { verb: 'swim', noun: DIRECTIONS[target], raw }
    }
    return { verb: 'swim', noun: target, raw }
  }

  // --- Look ---
  if (first in LOOK_VERBS) {
    // "look <keyword>" triggers extra examination of room details
    if (rest) {
      return { verb: 'examine_extra', noun: rest, raw }
    }
    return { verb: LOOK_VERBS[first]!, noun: undefined, raw }
  }

  // --- Sensory ---
  if (SMELL_VERBS.has(first)) {
    return { verb: 'smell', noun: rest || undefined, raw }
  }
  if (LISTEN_VERBS.has(first)) {
    return { verb: 'listen', noun: rest || undefined, raw }
  }
  if (TOUCH_VERBS.has(first)) {
    return { verb: 'touch', noun: rest || undefined, raw }
  }

  // --- Hint ---
  if (HINT_VERBS.has(first)) {
    return { verb: 'hint', noun: rest || undefined, raw }
  }

  // --- Read (dedicated lore verb) ---
  if (first === 'read') {
    return { verb: 'read', noun: rest || undefined, raw }
  }

  // --- Journal / Codex / Notes ---
  if (first === 'journal' || first === 'codex' || first === 'notes') {
    return { verb: 'journal', noun: undefined, raw }
  }

  // --- Inventory ---
  if (first in INVENTORY_VERBS) {
    return { verb: INVENTORY_VERBS[first]!, noun: rest || undefined, raw }
  }

  // --- Combat ---
  if (first in COMBAT_VERBS) {
    const normalizedCombat = COMBAT_VERBS[first]!
    const noun = rest || undefined
    // Called shot: "attack <target> <body_part>" → attack_called
    if (normalizedCombat === 'attack' && noun) {
      const nounTokens = noun.split(/\s+/)
      const lastWord = nounTokens[nounTokens.length - 1]!
      if (nounTokens.length > 1 && BODY_PARTS.has(lastWord)) {
        return { verb: 'attack_called', noun, raw }
      }
    }
    return { verb: normalizedCombat, noun, raw }
  }

  // --- Survival ---
  if (first in SURVIVAL_VERBS) {
    return { verb: SURVIVAL_VERBS[first]!, noun: rest || undefined, raw }
  }

  // --- Interaction ---
  if (first in INTERACTION_VERBS) {
    let noun = rest || undefined
    const normalizedVerb = INTERACTION_VERBS[first]!
    if (normalizedVerb === 'talk' && noun?.startsWith('to ')) {
      noun = noun.slice(3)
    }
    return { verb: normalizedVerb, noun, raw }
  }

  // --- Climb ---
  if (first in CLIMB_VERBS) {
    const target = rest !== '' ? rest : undefined
    if (target !== undefined && target in DIRECTIONS) {
      return { verb: 'climb', noun: DIRECTIONS[target], raw }
    }
    return { verb: CLIMB_VERBS[first]!, noun: target, raw }
  }

  // --- Sneak ---
  if (first in SNEAK_VERBS) {
    const target = rest !== '' ? rest : undefined
    if (target !== undefined && target in DIRECTIONS) {
      return { verb: 'sneak', noun: DIRECTIONS[target], raw }
    }
    return { verb: SNEAK_VERBS[first]!, noun: target, raw }
  }

  // --- Craft ---
  if (first in CRAFT_VERBS) {
    return { verb: CRAFT_VERBS[first]!, noun: rest || undefined, raw }
  }

  // --- Unlock ---
  if (first in UNLOCK_VERBS) {
    return { verb: UNLOCK_VERBS[first]!, noun: rest || undefined, raw }
  }

  // --- Give ---
  if (first in GIVE_VERBS) {
    let noun = rest || undefined
    // Strip "to" between item and NPC: "give medkit to doctor" → "medkit doctor"
    if (noun) {
      noun = noun.replace(/\s+to\s+/, ' ').trim()
    }
    return { verb: GIVE_VERBS[first]!, noun, raw }
  }

  // --- Trade ---
  if (first in TRADE_VERBS) {
    return { verb: TRADE_VERBS[first]!, noun: rest || undefined, raw }
  }

  // --- Fast travel / map ---
  if (first === 'travel' || first === 'warp') {
    return { verb: 'travel', noun: rest || undefined, raw }
  }
  if (first === 'map') {
    return { verb: 'map', noun: undefined, raw }
  }

  // --- Boost (stat increase on level-up) ---
  if (first === 'boost') {
    return { verb: 'boost', noun: rest || undefined, raw }
  }

  // --- System ---
  if (first in SYSTEM_VERBS) {
    return { verb: SYSTEM_VERBS[first]!, noun: rest || undefined, raw }
  }

  // --- Unknown ---
  return { verb: 'unknown', noun: trimmed, raw }
}

// ------------------------------------------------------------
// Levenshtein distance
// ------------------------------------------------------------

export function levenshtein(a: string, b: string): number {
  const m = a.length, n = b.length
  const dp: number[][] = Array.from({ length: m + 1 }, (_, i) =>
    Array.from({ length: n + 1 }, (_, j) => i === 0 ? j : j === 0 ? i : 0)
  )
  for (let i = 1; i <= m; i++) {
    for (let j = 1; j <= n; j++) {
      dp[i][j] = a[i-1] === b[j-1]
        ? dp[i-1][j-1]
        : 1 + Math.min(dp[i-1][j], dp[i][j-1], dp[i-1][j-1])
    }
  }
  return dp[m][n]
}

// ------------------------------------------------------------
// Verb suggestion (typo correction)
// ------------------------------------------------------------

/**
 * Given an unknown input token, suggest the closest known verb.
 * First tries prefix matching; if nothing matches, falls back to
 * Levenshtein distance (max 3). Returns undefined if no good match.
 */
export function suggestVerb(input: string): string | undefined {
  const lower = input.toLowerCase()

  // Collect all known surface-form verbs into one array
  const allVerbs: string[] = [
    ...Array.from(MOVEMENT_VERBS),
    ...Array.from(SWIM_VERBS),
    ...Array.from(SMELL_VERBS),
    ...Array.from(LISTEN_VERBS),
    ...Array.from(TOUCH_VERBS),
    ...Array.from(HINT_VERBS),
    ...Object.keys(CLIMB_VERBS),
    ...Object.keys(SNEAK_VERBS),
    ...Object.keys(CRAFT_VERBS),
    ...Object.keys(UNLOCK_VERBS),
    ...Object.keys(GIVE_VERBS),
    ...Object.keys(LOOK_VERBS),
    ...Object.keys(INVENTORY_VERBS),
    ...Object.keys(COMBAT_VERBS),
    ...Object.keys(SURVIVAL_VERBS),
    ...Object.keys(INTERACTION_VERBS),
    ...Object.keys(TRADE_VERBS),
    ...Object.keys(SYSTEM_VERBS),
    ...Object.keys(DIRECTIONS),
    'read', 'journal', 'codex', 'notes', 'travel', 'warp', 'map', 'boost',
  ]

  // 1. Exact prefix match
  const prefixMatch = allVerbs.find(v => v.startsWith(lower))
  if (prefixMatch !== undefined) return prefixMatch

  // 2. Closest Levenshtein match (max distance 3)
  let bestVerb: string | undefined
  let bestDist = Infinity
  for (const v of allVerbs) {
    const d = levenshtein(lower, v)
    if (d < bestDist) {
      bestDist = d
      bestVerb = v
    }
  }
  return bestDist <= 3 ? bestVerb : undefined
}
