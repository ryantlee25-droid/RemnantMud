import type { Action } from '@/types/game'

// ------------------------------------------------------------
// Verb maps — normalized verb → accepted surface forms
// ------------------------------------------------------------

const MOVEMENT_VERBS = new Set(['go', 'move', 'walk', 'head', 'travel'])

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
  drop: 'drop',
  use: 'use',
  eat: 'use',
  equip: 'equip',
  wear: 'equip',
  wield: 'equip',
  unequip: 'unequip',
  remove: 'unequip',
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

// Multi-word surface forms, checked before single-word splitting.
// Each entry: [normalized_verb, normalized_noun | null]
const MULTI_WORD: Array<[string, string, string | undefined]> = [
  ['pick up', 'take', undefined],
  ['put down', 'drop', undefined],
  ['take off', 'unequip', undefined],
  ['search room', 'search', undefined],
  ['look around', 'search', undefined],
]

// ------------------------------------------------------------
// Parser
// ------------------------------------------------------------

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

  // --- Look ---
  if (first in LOOK_VERBS) {
    // "look <keyword>" triggers extra examination of room details
    if (rest) {
      return { verb: 'examine_extra', noun: rest, raw }
    }
    return { verb: LOOK_VERBS[first]!, noun: undefined, raw }
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
    return { verb: COMBAT_VERBS[first]!, noun: rest || undefined, raw }
  }

  // --- Survival ---
  if (first in SURVIVAL_VERBS) {
    return { verb: SURVIVAL_VERBS[first]!, noun: rest || undefined, raw }
  }

  // --- Interaction ---
  if (first in INTERACTION_VERBS) {
    return { verb: INTERACTION_VERBS[first]!, noun: rest || undefined, raw }
  }

  // --- Trade ---
  if (first in TRADE_VERBS) {
    return { verb: TRADE_VERBS[first]!, noun: rest || undefined, raw }
  }

  // --- System ---
  if (first in SYSTEM_VERBS) {
    return { verb: SYSTEM_VERBS[first]!, noun: rest || undefined, raw }
  }

  // --- Unknown ---
  return { verb: 'unknown', noun: trimmed, raw }
}
