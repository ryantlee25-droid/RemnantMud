// ============================================================
// lib/narrativeKeys.ts
// Convoy: remnant-narrative-0329 — Rider E (Discovery & Mystery)
//
// Knowledge-based room unlocking and contradiction tracking.
// Two systems:
//   1. Narrative Key System — exits/rooms unlocked by KNOWLEDGE
//   2. Contradiction Tracking — NPCs lie, the game notices
//
// No imports from lib/gameEngine.ts.
// learnKey() is idempotent.
// Keys are stored in player.narrativeKeys: string[]
// ============================================================

import type { NarrativeKey, NarrativeGate } from '@/types/convoy-contracts'
import type { GameMessage } from '@/types/game'
import { msg } from '@/lib/messages'

// ============================================================
// Re-export the contract interfaces for consumers
// ============================================================

export type { NarrativeKey, NarrativeGate }

// ============================================================
// Contradiction interface
// ============================================================

export interface Contradiction {
  id: string
  claim1: { npcId: string; text: string; topic: string }
  claim2: { npcId: string; text: string; topic: string }
  resolved: boolean
  resolution?: 'npc1_truth' | 'npc2_truth' | 'both_lying'
}

// ============================================================
// SYSTEM 1: Narrative Key Logic
// ============================================================

/**
 * Returns true if the player has learned the required key.
 * Contract alias: hasKey()
 */
export function hasNarrativeKey(
  playerKeys: string[],
  requiredKey: string
): boolean {
  return playerKeys.includes(requiredKey)
}

/** Contract postcondition alias */
export const hasKey = hasNarrativeKey

/**
 * Marks a key as learned and returns narrative messages.
 * Idempotent: if already known, returns empty array (no-op).
 * Contract alias: learnKey()
 *
 * Returns messages to dispatch — caller is responsible for
 * adding keyId to player.narrativeKeys.
 */
export function grantNarrativeKey(
  keyId: string,
  source: 'dialogue' | 'examination' | 'deduction',
  playerKeys: string[]
): GameMessage[] {
  // Idempotent — already known
  if (playerKeys.includes(keyId)) return []

  const sourceNarration: Record<typeof source, string> = {
    dialogue:
      'Something they said settles into place. You understand now.',
    examination:
      'You look at it long enough that it stops being a detail.',
    deduction:
      'The pieces were always there. You just stopped ignoring them.',
  }

  return [msg(sourceNarration[source])]
}

/**
 * Contract postcondition export: learnKey().
 * Wrapper that matches the contract signature — returns messages
 * and the updated key array (caller merges into player state).
 */
export function learnKey(
  keyId: string,
  playerKeys: string[],
  source: 'dialogue' | 'examination' | 'deduction' = 'dialogue'
): { messages: GameMessage[]; updatedKeys: string[] } {
  if (playerKeys.includes(keyId)) {
    return { messages: [], updatedKeys: playerKeys }
  }
  const messages = grantNarrativeKey(keyId, source, playerKeys)
  return { messages, updatedKeys: [...playerKeys, keyId] }
}

/**
 * Returns a narrative hint when the player attempts a locked exit.
 * Never says "you need key X" — always narrative.
 * Returns null if no hint is needed (key already known).
 */
export function getNarrativeKeyHint(
  requiredKey: string,
  playerKeys: string[]
): GameMessage | null {
  if (playerKeys.includes(requiredKey)) return null
  return NARRATIVE_KEY_HINTS[requiredKey] ?? null
}

/**
 * Checks whether a narrative gate is satisfied.
 * Handles both single-key and allOf multi-key gates.
 * Contract postcondition: checkNarrativeGate()
 */
export function checkNarrativeGate(
  gate: NarrativeGate,
  playerKeys: string[]
): boolean {
  if (gate.allOf && gate.allOf.length > 0) {
    return gate.allOf.every((k) => playerKeys.includes(k))
  }
  return playerKeys.includes(gate.keyId)
}

/**
 * Full gate check for a room exit. Returns both unlock status
 * and any narration to dispatch.
 */
export function checkNarrativeUnlock(
  roomId: string,
  exitDirection: string,
  playerKeys: string[]
): { unlocked: boolean; narration: GameMessage[] } {
  const gateKey = `${roomId}:${exitDirection}`
  const gate = ROOM_EXIT_GATES[gateKey]

  if (!gate) {
    // No narrative gate on this exit
    return { unlocked: true, narration: [] }
  }

  const unlocked = checkNarrativeGate(gate, playerKeys)

  if (unlocked) {
    const unlockMsg = UNLOCK_NARRATIONS[gate.keyId]
    return {
      unlocked: true,
      narration: unlockMsg ? [msg(unlockMsg)] : [],
    }
  }

  const hint = getNarrativeKeyHint(gate.keyId, playerKeys)
  return {
    unlocked: false,
    narration: hint ? [hint] : [],
  }
}

// ============================================================
// SYSTEM 2: Contradiction Tracking
// ============================================================

/**
 * Checks whether a new claim contradicts any existing claim
 * on the same topic. Returns a Contradiction if found, null
 * if no conflict.
 */
export function detectContradiction(
  newClaim: { npcId: string; topic: string; text: string },
  existingClaims: Array<{ npcId: string; topic: string; text: string }>
): Contradiction | null {
  const conflict = existingClaims.find(
    (c) => c.topic === newClaim.topic && c.npcId !== newClaim.npcId
  )

  if (!conflict) return null

  return {
    id: `contradiction_${newClaim.topic}_${conflict.npcId}_${newClaim.npcId}`,
    claim1: { npcId: conflict.npcId, text: conflict.text, topic: conflict.topic },
    claim2: { npcId: newClaim.npcId, text: newClaim.text, topic: newClaim.topic },
    resolved: false,
  }
}

/**
 * Returns subtle narrative flagging when a contradiction is
 * detected. Never shouts "LIAR!" — the wrongness is implied.
 */
export function getContradictionNarration(
  contradiction: Contradiction
): GameMessage {
  const topic = contradiction.claim1.topic
  const subtleFlag =
    CONTRADICTION_NARRATIONS[topic] ??
    '*"Something about that doesn\'t match what you heard before."*'

  return msg(subtleFlag)
}

/**
 * Resolves a contradiction with a verdict. Returns narrative
 * and a small reputation delta hint (caller applies the delta).
 * +1 presence or wits rep — returned as metadata, not applied
 * directly (Rider E must not write player state).
 */
export function resolveContradiction(
  contradictionId: string,
  resolution: 'npc1_truth' | 'npc2_truth' | 'both_lying',
  contradiction: Contradiction
): { messages: GameMessage[]; repDelta: { stat: 'presence' | 'wits'; delta: 1 } } {
  const messages: GameMessage[] = []

  const resolutionNarrations: Record<typeof resolution, string> = {
    npc1_truth:
      '*"You weigh it. The first account holds.' +
      ' The other has the shape of a lie told long enough' +
      ' to become habit."*',
    npc2_truth:
      '*"The second telling fits the evidence.' +
      " You don't know why they lied." +
      ' But you know that they did."*',
    both_lying:
      '*"Both accounts are wrong. Not accidentally.' +
      ' Deliberately. Someone decided this story' +
      ' needed a particular shape."*',
  }

  messages.push(msg(resolutionNarrations[resolution]))

  // Wits if you deduced the truth from evidence; presence if you
  // read the person. Caller decides which fits the context.
  return {
    messages,
    repDelta: { stat: 'wits', delta: 1 },
  }
}

// ============================================================
// SYSTEM 3: Sequential Discovery Hints
// ============================================================

/**
 * When the player visits rooms in a meaningful sequence, connect
 * the dots. Returns a "Sanderson aha" moment message or null.
 */
export function getSequentialDiscoveryHint(
  visitedRooms: string[],
  currentRoom: string
): GameMessage | null {
  const allRooms = [...visitedRooms, currentRoom]

  for (const [, entry] of Object.entries(SEQUENTIAL_DISCOVERY_CHAINS)) {
    const { sequence, hint } = entry
    const allVisited = sequence.every((r) => allRooms.includes(r))
    const currentIsLast = sequence[sequence.length - 1] === currentRoom
    if (allVisited && currentIsLast) {
      return msg(hint)
    }
  }

  return null
}

// ============================================================
// Static data: hint strings for locked exits
// ============================================================

const NARRATIVE_KEY_HINTS: Record<string, GameMessage> = {
  stacks_terminal_password: msg(
    'The terminal cursor blinks. It waits for something specific.' +
    ' Not a password. A name. Someone who worked here knew it.'
  ),
  stacks_server_room_bypass: msg(
    'The panel is sealed. There is a maintenance sequence — you can' +
    ' see the connector ports. The logic of it is almost legible.'
  ),
  meridian_decon_code: msg(
    'The decon chamber keypad glows amber. The frequency plays' +
    ' somewhere in the back of your skull. Not quite connected yet.'
  ),
  meridian_sub_level_access: msg(
    'The sub-level door has a log entry reader. Whatever it wants,' +
    ' it is written down somewhere in this facility. Someone kept records.'
  ),
  ember_tunnel_entrance: msg(
    'The wall here sounds different. Hollow. Someone who knew this' +
    ' place well knew where the tunnel started. And why to hide it.'
  ),
  crossroads_hidden_cellar: msg(
    'The market stall floor is uneven. Not from settling — from use.' +
    ' Something is below, and someone remembers putting it there.'
  ),
  scar_command_level: msg(
    'The door reads COMMAND ACCESS — AUTHORIZED PERSONNEL. The' +
    ' authorization system still runs. It still recognizes a name.'
  ),
  deep_pool_passage: msg(
    'The cave mouth is sealed with chemical markers. Someone who' +
    ' understood the algae knew how to read them. A researcher. A doctor.'
  ),
  pens_ward_c: msg(
    'The ward door is steel-reinforced. The wristband reader is active.' +
    ' Red wristbands only. Someone who came out of here would know what that means.'
  ),
  covenant_archive_room: msg(
    'The archive is locked with an Accord administrative cipher.' +
    ' Marshal Cross keeps records. Someone she trusted might know the key.'
  ),
  dust_caravan_cache: msg(
    'The cache markers are old Drifter notation. Not everyone reads' +
    ' it. The campfire storyteller at Crossroads grew up with those signs.'
  ),
  breaks_elder_passage: msg(
    'The passage is sealed with an older marker — land-use notation,' +
    ' pre-Collapse survey material. The Elder reads it fluently.'
  ),
  pine_sea_shepherd_trail: msg(
    'The trailhead has been deliberately obscured. Someone who has' +
    ' walked this forest for years left markers only they would recognize.'
  ),
  duskhollow_tithe_records: msg(
    'The records room is locked. Vesper maintains what enters and' +
    ' leaves the Covenant of Dusk. Her ledger is somewhere in this building.'
  ),
  salt_creek_command_bunker: msg(
    'The bunker hatch is secured with military-grade locks.' +
    ' Briggs would know the override. Or someone who served under him.'
  ),
  river_road_submerged_cache: msg(
    'The bank marker points to something underwater. The bridge keeper' +
    ' has watched this river for years. What goes in, he knows.'
  ),
}

// ============================================================
// Static data: narration played when a locked exit opens
// ============================================================

const UNLOCK_NARRATIONS: Record<string, string> = {
  stacks_terminal_password:
    'The terminal responds to the name. A panel slides open.' +
    ' The server room is accessible.',
  stacks_server_room_bypass:
    'Your hands find the sequence without hesitation.' +
    ' The maintenance panel releases. Cold air from below.',
  meridian_decon_code:
    'You tune to the frequency Sparks gave you. Something clicks.' +
    ' The decon chamber cycles green.',
  meridian_sub_level_access:
    "The Shepherd's logbook entry matches exactly." +
    ' The sub-level door unlocks with a sound like exhaled breath.',
  ember_tunnel_entrance:
    "Avery's directions are precise. Third panel from the" +
    ' eastern corner. It swings inward without resistance.',
  crossroads_hidden_cellar:
    'You press the stall foundation the way Marta described.' +
    ' The floor section rises on a counterweight. Old work. Good work.',
  scar_command_level:
    'The authorization reader recognizes the name from the' +
    ' MERIDIAN personnel file. The door opens. The past opens with it.',
  deep_pool_passage:
    'Dr. Osei's notation gives you the safe path. The chemical' +
    ' markers re-read correctly. The cave mouth is passable.',
  pens_ward_c:
    'You know what the red wristband means now. The reader confirms it.' +
    ' The ward door opens onto something you cannot un-see.',
  covenant_archive_room:
    'The cipher Cross uses is her dead daughter\'s birthdate.' +
    ' You learned that somewhere. You wish you had not needed to use it.',
  dust_caravan_cache:
    "The storyteller's notation reads correctly. The cache is here." +
    ' Buried under the sign, exactly as described.',
  breaks_elder_passage:
    'The Elder\'s survey notation is accurate to the meter.' +
    ' The passage opens. Old knowledge, still good.',
  pine_sea_shepherd_trail:
    "You follow the Shepherd's trail markers. Hidden in bark notches," +
    ' in stone arrangements. The path becomes visible.',
  duskhollow_tithe_records:
    "Vesper's ledger notation gives you the room key sequence." +
    ' The records room is unlocked. The numbers inside are not what you expected.',
  salt_creek_command_bunker:
    "Briggs's override is a date. The day MERIDIAN went dark." +
    ' He has been carrying it. The bunker hatch opens.',
  river_road_submerged_cache:
    "Howard's river knowledge is exact. You find the cache on the" +
    ' third try, exactly where the current would deposit it.',
}

// ============================================================
// Static data: room-exit gate registry
// Format: 'roomId:direction' -> NarrativeGate
// ============================================================

export const ROOM_EXIT_GATES: Record<string, NarrativeGate> = {
  // The Stacks
  'st_02_entry_hall:north': {
    type: 'narrative_key',
    keyId: 'stacks_terminal_password',
  },
  'st_04_research_lab:east': {
    type: 'narrative_key',
    keyId: 'stacks_server_room_bypass',
  },
  // MERIDIAN / The Scar
  'scar_02_main_entrance:north': {
    type: 'narrative_key',
    keyId: 'meridian_decon_code',
  },
  'scar_03_decon_chamber:down': {
    type: 'narrative_key',
    keyId: 'meridian_sub_level_access',
  },
  'scar_01_crater_rim:east': {
    type: 'narrative_key',
    keyId: 'scar_command_level',
  },
  // The Ember
  'em_03_chapel_interior:south': {
    type: 'narrative_key',
    keyId: 'ember_tunnel_entrance',
  },
  // Crossroads
  'cr_05_market_stalls:down': {
    type: 'narrative_key',
    keyId: 'crossroads_hidden_cellar',
  },
  // The Deep
  'dp_07_pool_chamber:west': {
    type: 'narrative_key',
    keyId: 'deep_pool_passage',
  },
  // The Pens
  'pens_04_ward_b_rooms:north': {
    type: 'narrative_key',
    keyId: 'pens_ward_c',
  },
  // Covenant
  'cov_08_administration:east': {
    type: 'narrative_key',
    keyId: 'covenant_archive_room',
  },
  // The Dust
  'du_06_dead_camp:down': {
    type: 'narrative_key',
    keyId: 'dust_caravan_cache',
  },
  // The Breaks
  'br_07_canyon_upper:west': {
    type: 'narrative_key',
    keyId: 'breaks_elder_passage',
  },
  // Pine Sea
  'ps_04_deep_wood:north': {
    type: 'narrative_key',
    keyId: 'pine_sea_shepherd_trail',
  },
  // Duskhollow
  'dh_05_covenant_inner:east': {
    type: 'narrative_key',
    keyId: 'duskhollow_tithe_records',
  },
  // Salt Creek
  'sc_08_stronghold_exterior:down': {
    type: 'narrative_key',
    keyId: 'salt_creek_command_bunker',
  },
  // River Road
  'rr_06_riverside_camp:west': {
    type: 'narrative_key',
    keyId: 'river_road_submerged_cache',
  },
  // Multi-key gate example: MERIDIAN guard post requires
  // both Sparks frequency AND Lev's data
  'scar_04_guard_post:north': {
    type: 'narrative_key',
    keyId: 'meridian_decon_code',
    allOf: ['meridian_decon_code', 'stacks_terminal_password'],
  },
}

// ============================================================
// Static data: contradiction topic narrations (subtle)
// ============================================================

const CONTRADICTION_NARRATIONS: Record<string, string> = {
  meridian_bombing:
    '*"Something about that doesn\'t sit right.' +
    ' The version you heard before had a different shape."*',
  kindling_incinerators:
    '*"The two accounts can\'t both be true.' +
    ' The question is which one needed to be believed."*',
  covenant_blood_tithe:
    '*"Voluntary. That\'s the word they both used.' +
    ' They didn\'t mean the same thing by it."*',
  patch_revenant_tracking:
    '*"She said she watches all of them equally.' +
    ' But her notes suggest she watches you specifically."*',
  scar_personnel:
    '*"The names don\'t match. Someone is missing from one account.' +
    ' Or added to the other."*',
  charon7_origin:
    '*"Two sources, two origins. One of them was in the room.' +
    ' The other was told a story."*',
  accord_treaty:
    '*"The dates differ by six months. That gap matters' +
    ' to someone, or they wouldn\'t have moved it."*',
}

// ============================================================
// Static data: sequential discovery chains
// ============================================================

interface DiscoveryChain {
  sequence: string[]
  hint: string
}

const SEQUENTIAL_DISCOVERY_CHAINS: Record<string, DiscoveryChain> = {
  wall_map: {
    sequence: ['cr_03_inner_market', 'rr_04_junction_post', 'sc_05_creek_overlook'],
    hint:
      'The marks on this wall match the ones in two places you have' +
      ' already been. Together they form a map. Someone carved this' +
      ' route before the roads closed.',
  },
  project_shepherd: {
    sequence: ['ps_03_logger_cabin', 'st_06_data_archive'],
    hint:
      'This terminal references Project SHEPHERD.' +
      ' You have seen that name before — in the Pine Sea logger\'s cabin.' +
      ' It is not a coincidence.',
  },
  charon7_spread: {
    sequence: ['dp_05_bioluminescent_pool', 'scar_01_crater_rim'],
    hint:
      'The blue-green light seeping through these cracks is the same' +
      ' bioluminescence as the Deep Pool algae. The virus did not' +
      ' stay where they said it stayed.',
  },
  meridian_personnel: {
    sequence: ['sc_10_stronghold_briefing_room', 'scar_05_command_level'],
    hint:
      'The personnel file in the command level lists a name you read' +
      ' on the stronghold briefing room wall. The same person.' +
      ' Different roles. The gap between them is the question.',
  },
  kindling_history: {
    sequence: ['em_01_ember_approach', 'em_07_incinerator_room', 'em_03_chapel_interior'],
    hint:
      'The chapel iconography uses the same flame glyph as the' +
      ' incinerator room markings. The Kindling did not repurpose' +
      ' those symbols. They built around them.',
  },
  pens_intake_truth: {
    sequence: ['pens_02_intake_hall', 'pens_06_ward_b_corridor', 'pens_09_records_room'],
    hint:
      'The intake form says voluntary. The ward assignment chart says' +
      ' capacity-managed. The records room says the two numbers' +
      ' have never matched. Not once.',
  },
}
