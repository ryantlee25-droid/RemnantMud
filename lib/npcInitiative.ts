// ============================================================
// npcInitiative.ts — NPCs Seek the Player
// Convoy: remnant-narrative-0329 | Rider B
//
// NPCs don't just wait. They come find you.
// Max 1 initiative event per 30 actions (cooldown).
// ============================================================

import { msg } from '@/lib/messages'
import type { GameMessage, Player } from '@/types/game'
import type { InitiativeTrigger } from '@/types/convoy-contracts'

// ------------------------------------------------------------
// Initiative trigger definitions (15–25 required by contract)
// ------------------------------------------------------------

export const INITIATIVE_TRIGGERS: InitiativeTrigger[] = [
  // ----------------------------------------------------------
  // PATCH — finds you after your second death
  // ----------------------------------------------------------
  {
    npcId: 'patch',
    triggerType: 'quest_flag',
    condition: (player: Player) =>
      (player.totalDeaths ?? 0) >= 2 &&
      !(player.questFlags?.['patch_found_you_after_deaths']),
    initiativeMessage:
      'patch_found_you_after_deaths',
  },

  // ----------------------------------------------------------
  // MARSHAL CROSS — sends a runner when Salter tension escalates
  // ----------------------------------------------------------
  {
    npcId: 'marshal_cross',
    triggerType: 'faction_rep',
    condition: (player: Player) =>
      (player.factionReputation?.['salters'] ?? 0) <= -1 &&
      !(player.questFlags?.['cross_runner_sent']),
    initiativeMessage: 'cross_runner_sent',
  },

  // ----------------------------------------------------------
  // LEV — appears urgently after MERIDIAN data discovered
  // ----------------------------------------------------------
  {
    npcId: 'lev',
    triggerType: 'quest_flag',
    condition: (player: Player) =>
      !!(player.questFlags?.['meridian_data_found']) &&
      !(player.questFlags?.['lev_meridian_contact']),
    initiativeMessage: 'lev_meridian_contact',
  },

  // ----------------------------------------------------------
  // DRIFTER — passes through with news after 50 actions without
  // NPC contact
  // ----------------------------------------------------------
  {
    npcId: 'drifter_newcomer',
    triggerType: 'time_since_last_meeting',
    condition: (player: Player) => {
      const lastContact = (player.questFlags?.['last_npc_contact_action'] as number) ?? 0
      return (player.actionsTaken - lastContact) >= 50
    },
    initiativeMessage: 'drifter_news_pass',
  },

  // ----------------------------------------------------------
  // ROOK — seeks player when Accord rep is high enough to share
  // intel about Red Court movement
  // ----------------------------------------------------------
  {
    npcId: 'rook',
    triggerType: 'faction_rep',
    condition: (player: Player) =>
      (player.factionReputation?.['accord'] ?? 0) >= 2 &&
      !!(player.questFlags?.['act2_complete']) &&
      !(player.questFlags?.['rook_red_court_warning']),
    initiativeMessage: 'rook_red_court_warning',
  },

  // ----------------------------------------------------------
  // VESPER — seeks player after they antagonize Reclaimers
  // ----------------------------------------------------------
  {
    npcId: 'vesper',
    triggerType: 'faction_rep',
    condition: (player: Player) =>
      (player.factionReputation?.['reclaimers'] ?? 0) <= -2 &&
      !(player.questFlags?.['vesper_reclaimer_warning']),
    initiativeMessage: 'vesper_reclaimer_warning',
  },

  // ----------------------------------------------------------
  // WARLORD BRIGGS — sends word when player earns Salter trust
  // ----------------------------------------------------------
  {
    npcId: 'warlord_briggs',
    triggerType: 'faction_rep',
    condition: (player: Player) =>
      (player.factionReputation?.['salters'] ?? 0) >= 2 &&
      !(player.questFlags?.['briggs_contract_offer']),
    initiativeMessage: 'briggs_contract_offer',
  },

  // ----------------------------------------------------------
  // THE WREN — finds player after they discover the Scar
  // ----------------------------------------------------------
  {
    npcId: 'the_wren',
    triggerType: 'quest_flag',
    condition: (player: Player) =>
      !!(player.questFlags?.['the_scar_discovered']) &&
      !(player.questFlags?.['wren_scar_contact']),
    initiativeMessage: 'wren_scar_contact',
  },

  // ----------------------------------------------------------
  // DR. AMA OSEI — seeks player when infection risk is high
  // (player has taken > 60 total deaths or has survived 3 cycles)
  // ----------------------------------------------------------
  {
    npcId: 'dr_ama_osei',
    triggerType: 'act_progression',
    condition: (player: Player) =>
      (player.cycle ?? 1) >= 3 &&
      !(player.questFlags?.['osei_long_survivor_contact']),
    initiativeMessage: 'osei_long_survivor_contact',
  },

  // ----------------------------------------------------------
  // SPARKS — radio contact after act 1 when player reaches
  // the Stacks zone
  // ----------------------------------------------------------
  {
    npcId: 'sparks_radio',
    triggerType: 'quest_flag',
    condition: (player: Player) =>
      !!(player.questFlags?.['act1_complete']) &&
      !!(player.questFlags?.['the_stacks_reached']) &&
      !(player.questFlags?.['sparks_stacks_contact']),
    initiativeMessage: 'sparks_stacks_contact',
  },

  // ----------------------------------------------------------
  // ELDER KAI NEZ — seeks player after Covenant of Dusk rep
  // climbs (curious about an outsider earning trust)
  // ----------------------------------------------------------
  {
    npcId: 'elder_kai_nez',
    triggerType: 'faction_rep',
    condition: (player: Player) =>
      (player.factionReputation?.['covenant_of_dusk'] ?? 0) >= 1 &&
      !!(player.questFlags?.['act2_complete']) &&
      !(player.questFlags?.['elder_kai_invitation']),
    initiativeMessage: 'elder_kai_invitation',
  },

  // ----------------------------------------------------------
  // TRAVELING MERCHANT — arrives with rare goods after the
  // player has survived 30+ actions in Act 2
  // ----------------------------------------------------------
  {
    npcId: 'traveling_merchant',
    triggerType: 'act_progression',
    condition: (player: Player) => {
      const act2Start = (player.questFlags?.['act2_start_action'] as number) ?? 0
      return (
        !!(player.questFlags?.['act1_complete']) &&
        (player.actionsTaken - act2Start) >= 30 &&
        !(player.questFlags?.['merchant_act2_visit'])
      )
    },
    initiativeMessage: 'merchant_act2_visit',
  },

  // ----------------------------------------------------------
  // CAMPFIRE STRANGER — appears at pressure ≥ 6 to offer a
  // warning they claim is not their own
  // ----------------------------------------------------------
  {
    npcId: 'campfire_stranger',
    triggerType: 'quest_flag',
    condition: (player: Player) => {
      // Relies on Rider H passing pressure via questFlags or a
      // workaround. We check a flag Rider H sets when pressure >= 6.
      return (
        !!(player.questFlags?.['pressure_high_warning_eligible']) &&
        !(player.questFlags?.['stranger_pressure_warning'])
      )
    },
    initiativeMessage: 'stranger_pressure_warning',
  },

  // ----------------------------------------------------------
  // PATCH (SECOND CONTACT) — seeks player with new intel
  // after they have survived act 2 and patch trusts them
  // ----------------------------------------------------------
  {
    npcId: 'patch',
    triggerType: 'act_progression',
    condition: (player: Player) =>
      !!(player.questFlags?.['act2_complete']) &&
      !!(player.questFlags?.['patch_found_you_after_deaths']) &&
      !(player.questFlags?.['patch_act2_intel']),
    initiativeMessage: 'patch_act2_intel',
  },

  // ----------------------------------------------------------
  // LEV (SECOND CONTACT) — urgent: MERIDIAN protocol at risk
  // ----------------------------------------------------------
  {
    npcId: 'lev',
    triggerType: 'quest_flag',
    condition: (player: Player) =>
      !!(player.questFlags?.['act3_meridian_approach']) &&
      !(player.questFlags?.['lev_meridian_final_warning']),
    initiativeMessage: 'lev_meridian_final_warning',
  },

  // ----------------------------------------------------------
  // ROOK (SECOND CONTACT) — final Accord intelligence drop
  // before Act 3 resolution
  // ----------------------------------------------------------
  {
    npcId: 'rook',
    triggerType: 'act_progression',
    condition: (player: Player) =>
      !!(player.questFlags?.['act3_meridian_approach']) &&
      !!(player.questFlags?.['rook_red_court_warning']) &&
      !(player.questFlags?.['rook_act3_final_brief']),
    initiativeMessage: 'rook_act3_final_brief',
  },

  // ----------------------------------------------------------
  // MARSHAL CROSS (SECOND CONTACT) — sends personal message
  // when player has become a genuine asset to the Accord
  // ----------------------------------------------------------
  {
    npcId: 'marshal_cross',
    triggerType: 'faction_rep',
    condition: (player: Player) =>
      (player.factionReputation?.['accord'] ?? 0) >= 3 &&
      !(player.questFlags?.['cross_personal_thanks']),
    initiativeMessage: 'cross_personal_thanks',
  },

  // ----------------------------------------------------------
  // DRIFTER (SECOND CONTACT) — same wanderer, new trouble
  // carrying word of a duskhollow situation
  // ----------------------------------------------------------
  {
    npcId: 'drifter_newcomer',
    triggerType: 'quest_flag',
    condition: (player: Player) =>
      !!(player.questFlags?.['drifter_news_pass']) &&
      !!(player.questFlags?.['act2_complete']) &&
      !(player.questFlags?.['drifter_duskhollow_news']),
    initiativeMessage: 'drifter_duskhollow_news',
  },
]

// ------------------------------------------------------------
// Cooldown state (in-memory, per session)
// ------------------------------------------------------------

// Last action count when an initiative event fired
let lastInitiativeActionCount = 0

/** Reset for testing purposes only. */
export function _resetInitiativeCooldown(): void {
  lastInitiativeActionCount = 0
}

// ------------------------------------------------------------
// Main trigger check
// ------------------------------------------------------------

/**
 * Check if any NPC should appear seeking the player.
 * Called by Rider H on room entry only.
 *
 * Returns the first matching trigger, or null if none qualify
 * or if the cooldown (30 actions) has not elapsed.
 *
 * 5–10% spawn chance per room entry when conditions are met.
 */
export function checkInitiativeTriggers(
  playerState: Player,
  _currentRoom: string,
  actionCount: number,
): InitiativeTrigger | null {
  // Enforce 30-action cooldown
  if (actionCount - lastInitiativeActionCount < 30) return null

  // 5–10% chance per room entry
  const spawnRoll = Math.random()
  if (spawnRoll > 0.10) return null

  // Find first trigger whose condition passes
  for (const trigger of INITIATIVE_TRIGGERS) {
    if (trigger.condition(playerState)) {
      lastInitiativeActionCount = actionCount
      return trigger
    }
  }

  return null
}

// ------------------------------------------------------------
// Narrative for NPC arrival
// ------------------------------------------------------------

/**
 * Returns 2–3 narrative messages when an initiative NPC appears.
 * They deliver their message and leave — they do not stay for
 * full dialogue.
 */
export function getInitiativeNarration(trigger: InitiativeTrigger): GameMessage[] {
  const script = INITIATIVE_SCRIPTS[trigger.initiativeMessage]
  if (!script) {
    return [
      msg(`${trigger.npcId} finds you here. They have something to say.`),
      msg('They leave before you can ask questions.'),
    ]
  }
  return script.map(text => msg(text))
}

// ------------------------------------------------------------
// Initiative narration scripts (2–3 lines each)
// ------------------------------------------------------------

const INITIATIVE_SCRIPTS: Record<string, string[]> = {
  patch_found_you_after_deaths: [
    'Patch is waiting when you arrive. You don\'t know how long.',
    '"I tracked you. Don\'t ask how." They study you the way they study' +
      ' wounds. Like something to be solved.',
    '"You keep coming back. That\'s information. Come find me when you' +
      ' want to know what it means."',
  ],

  cross_runner_sent: [
    'A runner — Accord colors, young, winded — intercepts you.',
    '"Marshal Cross sends word. The Salters are moving and your name' +
      ' came up. She wants to talk before it becomes her problem."',
    'The runner is gone before you can respond.',
  ],

  lev_meridian_contact: [
    'Lev appears at your shoulder as if they were already standing there.',
    '"The MERIDIAN data you found. I need to know everything about' +
      ' where you got it. Not here. Not now. But soon."',
    'They are already leaving. "Soon means today."',
  ],

  drifter_news_pass: [
    'A drifter falls into step with you, heading the same direction.',
    '"Haven\'t seen another face in four days. Word from the south:' +
      ' the road through the Pens is closed. Not blocked. Closed."',
    'They peel off toward the east without waiting for a response.',
  ],

  rook_red_court_warning: [
    'Rook finds you between rooms, which is his specialty.',
    '"Red Court lost three of their own near the Stacks. They\'re' +
      ' not hunting Hollows. They\'re hunting something specific."',
    '"I thought you should know." He doesn\'t explain why.',
  ],

  vesper_reclaimer_warning: [
    'Vesper doesn\'t look happy to be here.',
    '"The Reclaimers know your name now. That\'s not a compliment.' +
      ' Some of them keep lists."',
    '"I\'m telling you this because it\'s more useful than not' +
      ' telling you. Don\'t read more into it."',
  ],

  briggs_contract_offer: [
    'A Salter soldier stops you — not hostile, but deliberate.',
    '"Warlord Briggs has a proposition. You\'ve earned that much.' +
      ' He doesn\'t offer to many. The meeting\'s yours if you want it."',
    'The soldier walks away without specifying where or when.',
  ],

  wren_scar_contact: [
    'The Wren is perched on a broken wall above you. You wonder how long.',
    '"You\'ve been to the Scar." Not a question. "Not many come back' +
      ' thinking the same thoughts they left with. What did you bring home?"',
    'She drops from the wall and walks. She expects you to follow.',
  ],

  osei_long_survivor_contact: [
    'Dr. Osei catches you in a corridor, her manner precise and direct.',
    '"Three cycles. Most people don\'t notice it happening to them.' +
      ' You have. That makes you useful and also possibly dangerous."',
    '"Come see me when you have an hour. I have questions about what' +
      ' you remember between cycles."',
  ],

  sparks_stacks_contact: [
    'Your radio crackles to life — a signal from the Stacks.',
    '"Finally. I\'ve been trying to reach someone on the move for two days.' +
      ' Sparks, broadcasting from — doesn\'t matter. You\'re in the Stacks?"',
    '"Don\'t touch the equipment on the fourth floor. I mean that.' +
      ' Find the north stairwell. I\'ll explain when you get there."',
  ],

  elder_kai_invitation: [
    'A Covenant messenger approaches, formal and unhurried.',
    '"Elder Kai Nez extends an invitation. Not a summons." The messenger' +
      ' is careful about the distinction. "He is curious about you."',
    '"He asks only that you come before the next dark moon." The messenger' +
      ' does not indicate what that means if you don\'t.',
  ],

  merchant_act2_visit: [
    'A traveling merchant sets up a folding table ten feet in front of you.',
    '"Timing is everything." They arrange their goods without looking up.' +
      ' "I have things that are hard to find. You look like someone who' +
      ' needs things that are hard to find."',
    '"I won\'t be here long."',
  ],

  stranger_pressure_warning: [
    'A stranger at the edge of the firelight speaks without looking at you.',
    '"Something is coming. It\'s not a feeling — feelings are guesses.' +
      ' This is a pattern. I\'ve seen it before. You need to move."',
    'When you look over, they\'re gone. The fire burns without explanation.',
  ],

  patch_act2_intel: [
    'Patch is waiting. They have a folded piece of paper and a look that' +
      ' means something costs more than it used to.',
    '"I kept information from you before. I told myself it was because' +
      ' you couldn\'t use it yet. That was convenient for me."',
    '"I\'m fixing that." They hand over the paper and walk without ceremony.',
  ],

  lev_meridian_final_warning: [
    'Lev materializes in a doorway — tense in a way you haven\'t seen.',
    '"The MERIDIAN protocol is not what we thought it was.' +
      ' Someone knew what it was the whole time. We need to talk now."',
    '"Meet me at the northwest anchor point. An hour. Don\'t be late.' +
      ' Don\'t be followed."',
  ],

  rook_act3_final_brief: [
    'Rook\'s voice, low, behind you. "Don\'t turn around."',
    '"Everything you\'re about to do at the MERIDIAN site — someone' +
      ' else has done it before. They didn\'t come back the same way."',
    '"I can\'t tell you more than that. I can tell you that I came' +
      ' to tell you that."',
  ],

  cross_personal_thanks: [
    'Marshal Cross stops you at the gate. She does not usually stop people.',
    '"What you did. I don\'t have the capacity to say it the way it' +
      ' deserves. But I wanted you to know I noticed."',
    'She nods once and returns to her post. That is the whole of it.',
  ],

  drifter_duskhollow_news: [
    'The same drifter. You recognize the jacket.',
    '"Duskhollow. Something\'s wrong there. Not Hollow-wrong —' +
      ' people-wrong. Three settlements stopped sending anyone through."',
    '"I\'m telling everyone I pass. Maybe someone knows what to do' +
      ' with that." They keep walking.',
  ],
}
