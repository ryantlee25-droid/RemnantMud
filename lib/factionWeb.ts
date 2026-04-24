// ============================================================
// factionWeb.ts — Faction ripple effects & consequence cascades
// Pillar 4: Consequence Cascades
// Owner: Rider D (remnant-narrative-0329)
// ============================================================
//
// Every faction action has secondary effects on other factions.
// When the player gains or loses rep with one faction, ripples
// propagate — delayed, narrated, organic. Not instant mechanics.
//
// Design rules:
//   - Deltas are ±1 only (no cascading snowball)
//   - Max 3 secondary effects per primary faction action
//   - No self-loops (faction cannot affect itself)
//   - Delayed effects arrive with narration after N actions
// ============================================================

import type { FactionType, GameMessage } from '@/types/game'
import type { SecondaryEffect } from '@/types/convoy-contracts'
import { msg } from '@/lib/messages'

// ============================================================
// FACTION_EFFECTS — static lookup table
//
// Key format: `${factionId}_gain` or `${factionId}_loss`
// Each entry lists the secondary effects that propagate when the
// player gains (+) or loses (-) rep with that faction.
// ============================================================

export const FACTION_EFFECTS: Record<string, SecondaryEffect[]> = {

  // ----------------------------------------------------------
  // ACCORD — Law, order, settlement defense.
  // Rivals: Kindling (faith vs law), Red Court (violence)
  // Uneasy: Salters (useful but hard to trust)
  // ----------------------------------------------------------

  accord_gain: [
    {
      targetFaction: 'kindling',
      delta: -1,
      delayActionCount: 8,
      narrationPhrase:
        'Word reaches the Kindling that you have been seen with Accord soldiers. ' +
        'Their doors open more slowly for you now.',
    },
    {
      targetFaction: 'red_court',
      delta: -1,
      delayActionCount: 15,
      narrationPhrase:
        'The Red Court does not like people who keep law-keepers\u2019 company. ' +
        'A courier from the Narrows does not meet your eyes.',
    },
    {
      targetFaction: 'drifters',
      delta: -1,
      delayActionCount: 20,
      narrationPhrase:
        'Drifters trust movement and distrust those who settle with the Accord. ' +
        'A camp you knew is packed up and gone.',
    },
  ],

  accord_loss: [
    {
      targetFaction: 'kindling',
      delta: 1,
      delayActionCount: 5,
      narrationPhrase:
        'Deacon Harrow\u2019s people have heard you are no longer in good standing ' +
        'with the Accord. The gates open a little wider.',
    },
    {
      targetFaction: 'salters',
      delta: 1,
      delayActionCount: 10,
      narrationPhrase:
        'Briggs\u2019s traders move more freely when Accord attention is elsewhere. ' +
        'A Salter at the checkpoint nods you through.',
    },
  ],

  // ----------------------------------------------------------
  // KINDLING — Fire faith, ritual, survival through belief.
  // Rivals: Accord (law), Reclaimers (science vs faith)
  // ----------------------------------------------------------

  kindling_gain: [
    {
      targetFaction: 'accord',
      delta: -1,
      delayActionCount: 10,
      narrationPhrase:
        'Marshal Cross has heard that you have been spending time among the Kindling faithful. ' +
        'She does not say anything, but her deputy asks more questions at the checkpoint.',
    },
    {
      targetFaction: 'reclaimers',
      delta: -1,
      delayActionCount: 12,
      narrationPhrase:
        'The Kindling gates are closed to outsiders now. Word travels fast ' +
        'when you choose the fire. The Reclaimers\u2019 lab door is bolted.',
    },
  ],

  kindling_loss: [
    {
      targetFaction: 'reclaimers',
      delta: 1,
      delayActionCount: 6,
      narrationPhrase:
        'Lev mentions that the Reclaimers have been more forthcoming since your ' +
        'falling out with the Kindling. Science and faith do not share enemies well.',
    },
    {
      targetFaction: 'accord',
      delta: 1,
      delayActionCount: 8,
      narrationPhrase:
        'Cross nods once when you arrive at the checkpoint. ' +
        'Apparently news travels fast in the settlements.',
    },
  ],

  // ----------------------------------------------------------
  // RECLAIMERS — Technology recovery, pre-Collapse knowledge.
  // Rivals: Kindling (science vs faith)
  // Allies: Accord (pragmatic alliance)
  // ----------------------------------------------------------

  reclaimers_gain: [
    {
      targetFaction: 'kindling',
      delta: -1,
      delayActionCount: 12,
      narrationPhrase:
        'The Kindling do not trust those who speak the language of the old world. ' +
        'Deacon Harrow has asked the faithful to pray for you.',
    },
    {
      targetFaction: 'ferals',
      delta: -1,
      delayActionCount: 20,
      narrationPhrase:
        'The Ferals do not understand Reclaimer work. They understand threat. ' +
        'Something moves through the ruins faster than it did before.',
    },
  ],

  reclaimers_loss: [
    {
      targetFaction: 'kindling',
      delta: 1,
      delayActionCount: 5,
      narrationPhrase:
        'The Kindling notice when the Reclaimers lose an ally. ' +
        'A faithful at the eastern gate brings you bread without being asked.',
    },
  ],

  // ----------------------------------------------------------
  // COVENANT_OF_DUSK — Sanguine faction, civil integration.
  // Rivals: Red Court (same resource base, opposing methods)
  // ----------------------------------------------------------

  covenant_of_dusk_gain: [
    {
      targetFaction: 'red_court',
      delta: -1,
      delayActionCount: 10,
      narrationPhrase:
        'The Red Court does not forgive those who side with the Covenant of Dusk. ' +
        'A runner from the Narrows leaves a mark on the wall near where you sleep.',
    },
    {
      targetFaction: 'accord',
      delta: -1,
      delayActionCount: 15,
      narrationPhrase:
        'The Accord watches anyone who moves among the Sanguine with discomfort. ' +
        'Cross\u2019s deputy files a report you were never meant to see.',
    },
  ],

  covenant_of_dusk_loss: [
    {
      targetFaction: 'red_court',
      delta: 1,
      delayActionCount: 8,
      narrationPhrase:
        'Word that you have fallen out with the Covenant of Dusk reaches the Narrows. ' +
        'The Red Court footguard who used to shadow you is gone.',
    },
  ],

  // ----------------------------------------------------------
  // RED_COURT — Sanguine faction, violent, territorial.
  // Rivals: Covenant of Dusk, Lucid, Accord
  // ----------------------------------------------------------

  red_court_gain: [
    {
      targetFaction: 'lucid',
      delta: -1,
      delayActionCount: 8,
      narrationPhrase:
        'Three days after you helped the Red Court, Lucid pulls their observer ' +
        'from the eastern highway. You notice when the watcher stops watching.',
    },
    {
      targetFaction: 'accord',
      delta: -1,
      delayActionCount: 12,
      narrationPhrase:
        'The Accord has been asking about you. Asking carefully. ' +
        'A Drifter merchant relays this without explanation.',
    },
  ],

  red_court_loss: [
    {
      targetFaction: 'lucid',
      delta: 1,
      delayActionCount: 6,
      narrationPhrase:
        'Lucid sends no official word, but a contact at the pine sea ' +
        'brings you something useful and says nothing about why.',
    },
    {
      targetFaction: 'covenant_of_dusk',
      delta: 1,
      delayActionCount: 10,
      narrationPhrase:
        'The Covenant of Dusk prefers the Red Court weak. ' +
        'A socialite from Duskhollow invites you to supper.',
    },
  ],

  // ----------------------------------------------------------
  // LUCID — Sanguine faction, intelligence and information.
  // Rivals: Red Court
  // Observes: everyone
  // ----------------------------------------------------------

  lucid_gain: [
    {
      targetFaction: 'red_court',
      delta: -1,
      delayActionCount: 10,
      narrationPhrase:
        'The Red Court does not like the Lucid\u2019s observers. ' +
        'They like their allies even less. Something is moved from where you left it.',
    },
    {
      targetFaction: 'drifters',
      delta: -1,
      delayActionCount: 15,
      narrationPhrase:
        'Drifters trade in secrets and distrust those who give them away. ' +
        'A camp you relied on has taken a different route.',
    },
  ],

  lucid_loss: [
    {
      targetFaction: 'red_court',
      delta: 1,
      delayActionCount: 5,
      narrationPhrase:
        'The Red Court hears that Lucid\u2019s asset is no longer reliable. ' +
        'A footguard you had trouble with stands down.',
    },
  ],

  // ----------------------------------------------------------
  // SALTERS — Mercantile, ruthless, practical.
  // Wary of: everyone, trusted by none
  // ----------------------------------------------------------

  salters_gain: [
    {
      targetFaction: 'accord',
      delta: -1,
      delayActionCount: 15,
      narrationPhrase:
        'Three days after you helped Lev, you hear that Briggs has recalled ' +
        'all Salter patrols from the eastern highway. ' +
        'The Accord notices this and connects it to you.',
    },
    {
      targetFaction: 'drifters',
      delta: -1,
      delayActionCount: 10,
      narrationPhrase:
        'Drifters trade where the Salters don\u2019t. ' +
        'A regular route has gone quiet.',
    },
    {
      targetFaction: 'reclaimers',
      delta: -1,
      delayActionCount: 18,
      narrationPhrase:
        'The Reclaimers prefer the Salters kept at arm\u2019s length. ' +
        'Lev says nothing, but takes longer to answer your messages.',
    },
  ],

  salters_loss: [
    {
      targetFaction: 'drifters',
      delta: 1,
      delayActionCount: 5,
      narrationPhrase:
        'Drifters fill the routes the Salters leave empty. ' +
        'A cart team waves you down with useful cargo.',
    },
  ],

  // ----------------------------------------------------------
  // DRIFTERS — Neutral, mobile, survivalist.
  // Minimal ripples — they stay neutral on purpose.
  // ----------------------------------------------------------

  drifters_gain: [
    {
      targetFaction: 'accord',
      delta: -1,
      delayActionCount: 20,
      narrationPhrase:
        'The Accord would prefer the Drifters registered and settled. ' +
        'Being known as a friend to wanderers puts you in a category ' +
        'Cross\u2019s deputy keeps notes on.',
    },
  ],

  drifters_loss: [
    {
      targetFaction: 'salters',
      delta: 1,
      delayActionCount: 8,
      narrationPhrase:
        'Without Drifter routes to compete with, the Salters move more cargo ' +
        'through the crossroads. Briggs\u2019s people are in a better mood.',
    },
  ],

  // ----------------------------------------------------------
  // FERALS — Not organized, not allied, pure threat.
  // Narrative-only ripples — no faction negotiates with Ferals.
  // ----------------------------------------------------------

  ferals_gain: [
    {
      targetFaction: 'accord',
      delta: -1,
      delayActionCount: 10,
      narrationPhrase:
        'The Accord does not trust anyone who has moved among the Ferals ' +
        'and come back. The deputy\u2019s eyes are careful.',
    },
    {
      targetFaction: 'reclaimers',
      delta: -1,
      delayActionCount: 15,
      narrationPhrase:
        'Reclaimer field teams have gone quiet in sectors where you have been. ' +
        'Lev sends a single-line message asking for your location.',
    },
  ],

  ferals_loss: [],
}

// ============================================================
// getFactionRipple
//
// Call this when the player gains or loses rep with a faction.
// Returns secondary effects and their narration messages.
// Effects with delayActionCount > 0 should be stored and
// announced later via getDelayedRippleNarration().
// ============================================================

export function getFactionRipple(
  sourceFaction: FactionType,
  repDelta: number,
  playerState: { factionReputation?: Partial<Record<FactionType, number>>; actionsTaken?: number }
): { effects: SecondaryEffect[]; narration: GameMessage[] } {
  const direction = repDelta >= 0 ? 'gain' : 'loss'
  const key = `${sourceFaction}_${direction}`
  const effects: SecondaryEffect[] = FACTION_EFFECTS[key] ?? []

  // Immediate narration (delayActionCount === 0 only)
  const narration: GameMessage[] = effects
    .filter((e) => e.delayActionCount === 0)
    .map((e) => msg(e.narrationPhrase, 'narrative'))

  return { effects, narration }
}

// ============================================================
// getDelayedRippleNarration
//
// Call this on each action to check whether a delayed ripple
// should now announce itself. Returns a GameMessage if the
// effect's delay has elapsed, or null if not yet.
//
// Caller is responsible for tracking when effects were enqueued.
// ============================================================

export function getDelayedRippleNarration(
  effect: SecondaryEffect,
  actionsSinceTriggered: number
): GameMessage | null {
  if (actionsSinceTriggered < effect.delayActionCount) return null
  return msg(effect.narrationPhrase, 'narrative')
}

// ============================================================
// NPC_DEATH_CONDITIONS
//
// Static lookup: which player choices can cause NPC deaths.
// Each entry tracks trigger conditions, foreshadowing text,
// and narration for the moment of death and ongoing absence.
//
// NPC deaths are NEVER random — always foreshadowed, always
// the direct result of a player choice.
// ============================================================

export const NPC_DEATH_CONDITIONS: Record<string, {
  trigger: string
  foreshadowing: string
  deathNarration: string
  absenceNarration: string
}> = {

  // Avery (kindling_doubter_avery)
  // Trigger: Player reveals her private doubt to Deacon Harrow
  kindling_doubter_avery: {
    trigger: 'avery_betrayed',
    foreshadowing:
      'Avery has not been at her post for three days. The Kindling say only that ' +
      'she has been called to a deeper observance. Nobody meets your eyes when you ask.',
    deathNarration:
      'In the incinerator room off the Kindling compound you find her things: ' +
      'a folded scarf, two books with her handwriting in the margins, ' +
      'a photograph of someone she never talked about. ' +
      'They have already been tidied into a corner, not discarded — ' +
      'tidied, as if someone thought there might be a use for them later. ' +
      'There won\u2019t be.',
    absenceNarration:
      'The Kindling faithful who knew Avery do not mention her. ' +
      'The ones who didn\u2019t are careful about what they say. ' +
      'The room where she used to stand at dawn is empty.',
  },

  // Patch (patch)
  // Trigger: Player sides with Red Court AND ignores Salter bounty for 100+ actions
  patch: {
    trigger: 'player_alignment_red_court',
    foreshadowing:
      'Patch has been asking about the Red Court. Not their services — their reach. ' +
      'How far does it extend. Who they watch. Whether they forget.',
    deathNarration:
      'Three people saw it. None of them are talking. Patch\u2019s table is still ' +
      'at the crossroads market — the instruments laid out in their precise order, ' +
      'the clipboard at the angle they always kept it. ' +
      'Whoever set it up got every detail right. ' +
      'Which means it was meant to be found.',
    absenceNarration:
      'The field medic who replaced Patch is competent and does not ask questions. ' +
      'People stop by the table and pause before they speak, as if still expecting ' +
      'someone else to be there.',
  },

  // Howard (bridge_keeper_howard)
  // Trigger: Bridge is destroyed during Act 2 faction conflict
  bridge_keeper_howard: {
    trigger: 'bridge_destroyed_act2',
    foreshadowing:
      'Howard has been moving supplies off the bridge tower. Not because he plans to leave — ' +
      'because he plans to stay, and he knows what staying there during a faction fight means.',
    deathNarration:
      'The bridge is down. Howard was on it when it went. ' +
      'There is not much to bury. The people who knew him build something at the western bank — ' +
      'not a monument, exactly. More like an acknowledgment. ' +
      'A stone and a name and the date, because that is what you do.',
    absenceNarration:
      'The crossing is managed by Accord militia now. They are efficient and do not know ' +
      'the names of everyone who uses the route. Howard knew all of them.',
  },

  // Sparks (sparks_radio / sparks_radio_repair)
  // Trigger: Player gives MERIDIAN frequency to wrong faction
  sparks_radio: {
    trigger: 'meridian_frequency_betrayal',
    foreshadowing:
      'Sparks has gone off-frequency. Not off-air — the signal is still there, ' +
      'but it is on a new channel, and they have not broadcast the new number to anyone. ' +
      'Something scared them.',
    deathNarration:
      'The radio room is clean. Too clean. Sparks was meticulous about equipment ' +
      'but not about surroundings — there were always papers, notes, coffee cups. ' +
      'Someone else cleaned this room. ' +
      'The transmitter is still warm.',
    absenceNarration:
      'MERIDIAN\u2019s frequency is broadcasting. The voice reading coordinates is not Sparks. ' +
      'Nobody has mentioned the change. The people who would notice are the people ' +
      'who do not ask questions about where Sparks went.',
  },
}

// ============================================================
// checkNPCDeathTrigger
//
// Call this when player makes significant choices that could
// affect named NPC survival. Returns death narration and
// shouldDie flag, or null if no trigger condition is met.
// ============================================================

export function checkNPCDeathTrigger(
  npcId: string,
  playerState: {
    questFlags?: Record<string, string | boolean | number>
    actionsTaken?: number
    factionReputation?: Partial<Record<FactionType, number>>
  }
): { shouldDie: boolean; narration: GameMessage[] } | null {
  const condition = NPC_DEATH_CONDITIONS[npcId]
  if (!condition) return null

  const flags = playerState.questFlags ?? {}
  const actions = playerState.actionsTaken ?? 0
  const rep = playerState.factionReputation ?? {}

  let triggered = false

  switch (npcId) {
    case 'kindling_doubter_avery':
      triggered = !!flags['avery_betrayed']
      break

    case 'patch':
      // Red Court aligned + Salter bounty ignored for 100+ actions
      triggered =
        !!flags['player_alignment_red_court'] &&
        !!flags['salter_bounty_issued'] &&
        typeof flags['salter_bounty_issued_at'] === 'number' &&
        actions - (flags['salter_bounty_issued_at'] as number) >= 100
      break

    case 'bridge_keeper_howard':
      triggered = !!flags['bridge_destroyed_act2']
      break

    case 'sparks_radio':
    case 'sparks_radio_repair':
      triggered = !!flags['meridian_frequency_betrayal']
      break

    default:
      return null
  }

  if (!triggered) {
    return { shouldDie: false, narration: [] }
  }

  return {
    shouldDie: true,
    narration: [msg(condition.deathNarration, 'narrative')],
  }
}

// ============================================================
// getNPCAbsenceNarration
//
// What other NPCs say when a named NPC is gone.
// Called when player enters a zone where the NPC used to be.
// ============================================================

export function getNPCAbsenceNarration(
  npcId: string,
  questFlags: string[]
): GameMessage[] {
  const condition = NPC_DEATH_CONDITIONS[npcId]
  if (!condition) return []

  return [msg(condition.absenceNarration, 'narrative')]
}

// ============================================================
// getNPCForeshadowing
//
// Returns foreshadowing narration for an NPC whose death
// conditions are approaching. Call before the trigger fires
// to give the player a chance to prevent the outcome.
// ============================================================

export function getNPCForeshadowing(npcId: string): GameMessage | null {
  const condition = NPC_DEATH_CONDITIONS[npcId]
  if (!condition) return null
  return msg(condition.foreshadowing, 'narrative')
}

// ============================================================
// checkConvergenceReady
//
// Returns true when all major faction threads are active —
// the player has engaged meaningfully with at least 3 factions
// and the act2_complete flag is set.
// ============================================================

export function checkConvergenceReady(
  playerState: {
    questFlags?: Record<string, string | boolean | number>
    factionReputation?: Partial<Record<FactionType, number>>
  }
): boolean {
  const flags = playerState.questFlags ?? {}
  const rep = playerState.factionReputation ?? {}

  // Require Act 2 complete
  if (!flags['act2_complete']) return false

  // Count factions the player has meaningfully engaged with (rep !== 0)
  const engaged = Object.values(rep).filter((r) => r !== 0).length

  // At least 3 faction threads active for convergence to be meaningful
  return engaged >= 3
}

// ============================================================
// getConvergenceNarration
//
// The moment all faction threads collide. Called once when
// convergence becomes ready. Rich, tense, literary.
// ============================================================

export function getConvergenceNarration(
  playerState: {
    questFlags?: Record<string, string | boolean | number>
    factionReputation?: Partial<Record<FactionType, number>>
  }
): GameMessage[] {
  return [
    msg(
      'Everything you have done since the beginning has been converging on this.',
      'narrative'
    ),
    msg(
      'The Accord\u2019s patrols are pulling back from the northern roads. ' +
      'The Kindling fires have been burning three days without stopping. ' +
      'The Salters have closed the creek crossing. ' +
      'The Red Court is moving.',
      'narrative'
    ),
    msg(
      'All of it at once. All the threads you have been holding, pulling taut ' +
      'at the same moment, in the same direction.',
      'narrative'
    ),
    msg(
      'The approach to MERIDIAN is no longer empty.',
      'narrative'
    ),
  ]
}
