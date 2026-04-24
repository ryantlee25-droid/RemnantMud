// ============================================================
// data/companionNarration.ts
// Companion commentary pools for all companion-eligible NPCs.
//
// ARCHITECTURE INVARIANT: Pure data exports only.
// No side effects. No imports from lib/.
//
// Tone contract: Stephen King dread — wrongness before threat,
// silence as omen. Restraint over spectacle.
// ============================================================

import type { CompanionCommentary } from '@/types/convoy-contracts'

// ------------------------------------------------------------
// Context key constants — used by getCompanionCommentary()
// in lib/companionSystem.ts
// ------------------------------------------------------------

// Room-context keys
export const CTX_RUINS        = 'ruins'
export const CTX_SETTLEMENT   = 'settlement'
export const CTX_NIGHT        = 'night'
export const CTX_DANGER       = 'danger'       // high-difficulty room
export const CTX_REST         = 'rest'          // safeRest room
export const CTX_TECH         = 'tech'          // the_stacks / electronics
export const CTX_OPEN         = 'open'          // outdoors, wide-sky zone
export const CTX_DEEP         = 'deep'          // the_deep / underground

// Post-action keys (handled by getCompanionCombatReaction / getCompanionDiscoveryReaction)
export const CTX_COMBAT_VICTORY   = 'combat_victory'
export const CTX_COMBAT_CLOSE     = 'combat_close_call'
export const CTX_COMBAT_RETREAT   = 'combat_retreat'
export const CTX_DISCOVERY        = 'discovery'

// Generic fallback
export const CTX_GENERIC      = 'generic'

// ------------------------------------------------------------
// Helper type — pools indexed by NPC ID
// ------------------------------------------------------------

export type CompanionPool = Record<string, CompanionCommentary[]>

// ============================================================
// HOWARD — howard_bridge_keeper
// Voice: terse, practical, nostalgic, engineering-minded.
// Observes load-bearing things. Measures worth in usefulness.
// ============================================================

export const HOWARD_NARRATION: CompanionCommentary[] = [
  // Ruins
  {
    contextKey: CTX_RUINS,
    narrative:
      'Howard runs a hand along the wall, checking the joint. "Built to last," ' +
      'he says. "Lasted longer than the people who built it."',
    weight: 3,
  },
  {
    contextKey: CTX_RUINS,
    narrative:
      'Howard looks up at the ceiling the way someone looks at an old ' +
      'colleague. "This is rebar construction. Pre-\'85. Still holding."',
    weight: 2,
  },
  {
    contextKey: CTX_RUINS,
    narrative:
      'Howard taps a support column twice. He doesn\'t explain what he\'s ' +
      'checking. His expression says it passed.',
    weight: 2,
  },

  // Settlement
  {
    contextKey: CTX_SETTLEMENT,
    narrative:
      'Howard surveys the perimeter quietly. "Foundation\'s uneven. ' +
      'They built fast." A pause. "So did we, back then."',
    weight: 2,
  },
  {
    contextKey: CTX_SETTLEMENT,
    narrative:
      'Howard watches the people moving through the settlement. ' +
      '"Busy," he says. "Busy is good. Busy means they haven\'t given up."',
    weight: 2,
  },

  // Night
  {
    contextKey: CTX_NIGHT,
    narrative:
      'Howard walks a half-step closer than usual. "My daughter used to ' +
      'be afraid of the dark. I told her there was nothing in it." ' +
      'He doesn\'t finish the thought.',
    weight: 3,
  },
  {
    contextKey: CTX_NIGHT,
    narrative:
      'Howard stops and tilts his head. Listening. ' +
      '"River\'s quieter than usual," he says. You can\'t hear any river.',
    weight: 2,
  },

  // Danger
  {
    contextKey: CTX_DANGER,
    narrative:
      'Howard moves to your left without being asked. ' +
      '"I\'ll take this side. You watch ahead."',
    weight: 3,
  },
  {
    contextKey: CTX_DANGER,
    narrative:
      '"Cover and egress," Howard says under his breath, ' +
      'already mapping the room. "There. And there."',
    weight: 2,
  },

  // Rest
  {
    contextKey: CTX_REST,
    narrative:
      'Howard inspects the room\'s structure before sitting. ' +
      '"Solid," he says, and means it as a compliment to whoever built it.',
    weight: 2,
  },
  {
    contextKey: CTX_REST,
    narrative:
      'Howard takes out a worn notebook and writes one line ' +
      'in it before putting it away. He notices you watching. "Record keeping."',
    weight: 2,
  },

  // Tech
  {
    contextKey: CTX_TECH,
    narrative:
      'Howard studies the equipment with the eyes of someone reading a dialect ' +
      'they mostly speak. "Some of this I designed," he says quietly.',
    weight: 2,
  },

  // Deep / underground
  {
    contextKey: CTX_DEEP,
    narrative:
      '"Built to last a hundred years," Howard says, running a hand along ' +
      'the rock face. "The mountain doesn\'t care about your timeline."',
    weight: 3,
  },
  {
    contextKey: CTX_DEEP,
    narrative:
      '"Support beams every twelve feet." Howard checks the nearest one ' +
      'with a knuckle tap. "Whoever dug this knew what they were doing. ' +
      'That\'s not comforting."',
    weight: 2,
  },
  {
    contextKey: CTX_DEEP,
    narrative:
      'Howard stops walking and holds up a hand. "Listen to the timber," ' +
      'he says. "When it stops creaking, that\'s when you worry."',
    weight: 3,
  },

  // Generic fallbacks
  {
    contextKey: CTX_GENERIC,
    narrative:
      'Howard glances back the way you came. "Still clear," he says, ' +
      'though you didn\'t ask. He\'s been tracking it the whole time.',
    weight: 2,
  },
  {
    contextKey: CTX_GENERIC,
    narrative:
      'Howard walks a few steps ahead, checking the floor. ' +
      '"Old habit," he says without turning. "Check the weight distribution."',
    weight: 1,
  },
  {
    contextKey: CTX_GENERIC,
    narrative:
      'Howard says nothing. The silence between you is the comfortable kind — ' +
      'the kind that means you\'ve stopped performing presence for each other.',
    weight: 2,
  },
]

export const HOWARD_JOIN_NARRATION: string[] = [
  '<npc>Howard</npc> nods once, the way men do when a decision\'s been made ' +
    'and explaining it would be its own kind of waste. He falls in beside you.',
  '<npc>Howard</npc> picks up his tools — a few, specifically chosen — and ' +
    'follows without ceremony. "I know this route," is all he says.',
  '"I\'ve been watching the valley long enough," <npc>Howard</npc> says. ' +
    '"Might as well do something about what I\'ve seen." He starts walking.',
]

export const HOWARD_LEAVE_NARRATION: Record<string, string[]> = {
  quest_complete: [
    '<npc>Howard</npc> shakes your hand once, firmly. ' +
      '"Good work," he says, which from him is a speech.',
    '<npc>Howard</npc> looks back toward the bridge. ' +
      '"Got a cable to check," he says. "You know how to find me."',
  ],
  player_choice: [
    '<npc>Howard</npc> accepts this without visible hurt. ' +
      '"All right," he says. "River road, if you need me." He turns and walks.',
  ],
  death: [
    '<npc>Howard</npc> goes down without dramatics. The last thing he does ' +
      'is check that you\'re still standing. His expression says: good enough.',
    'The engineer in him would have approved of what held and what didn\'t. ' +
      '<npc>Howard</npc> is gone. Something practical and irreplaceable.',
  ],
  separation: [
    '<npc>Howard</npc> tells you to go. His voice is flat and final. ' +
      '"I\'ll find my own way. I always have." You believe him.',
  ],
}

// ============================================================
// LEV — lev
// Voice: analytical, scared but hiding it, fascinated by data.
// Treats danger as a field condition worth noting.
// ============================================================

export const LEV_NARRATION: CompanionCommentary[] = [
  // Tech
  {
    contextKey: CTX_TECH,
    narrative:
      'Lev\'s hand goes to a server rack before she catches herself. ' +
      '"The servers are still warm. Someone\'s been here. Recently."',
    weight: 3,
  },
  {
    contextKey: CTX_TECH,
    narrative:
      'Lev takes out a small notebook and sketches the terminal layout ' +
      'with fast, practiced strokes. "Control cluster. Pre-Collapse architecture."',
    weight: 2,
  },
  {
    contextKey: CTX_TECH,
    narrative:
      'Lev stops at a blinking indicator light on a rack and stares at it. ' +
      '"That\'s a heartbeat," she says. "Something\'s still running."',
    weight: 2,
  },

  // Danger
  {
    contextKey: CTX_DANGER,
    narrative:
      '"I\'m documenting this," Lev says, writing in her notebook ' +
      'even as she scans exits. "In case — in case someone needs to know."',
    weight: 3,
  },
  {
    contextKey: CTX_DANGER,
    narrative:
      'Lev\'s pen doesn\'t stop moving even when her eyes go sharp. ' +
      '"I\'m not scared," she says. "I\'m taking notes while scared. Different."',
    weight: 2,
  },

  // Ruins
  {
    contextKey: CTX_RUINS,
    narrative:
      'Lev photographs the architecture with a salvaged camera, ' +
      'methodical. "This was a civic building. The Collapse didn\'t do this — ' +
      'people did."',
    weight: 2,
  },
  {
    contextKey: CTX_RUINS,
    narrative:
      'Lev picks up a fragment of something, turns it over, puts it down. ' +
      '"Still no signs of Hollow nesting. But the absence is interesting too."',
    weight: 2,
  },

  // Night
  {
    contextKey: CTX_NIGHT,
    narrative:
      'Lev\'s voice drops without her seeming to notice. ' +
      '"I don\'t like how quiet it is. Fauna should be louder than this."',
    weight: 2,
  },
  {
    contextKey: CTX_NIGHT,
    narrative:
      'In the dark, Lev moves closer to you. She doesn\'t acknowledge it. ' +
      'You don\'t either.',
    weight: 2,
  },

  // Rest
  {
    contextKey: CTX_REST,
    narrative:
      'Lev sits and immediately opens her notebook, but after a minute ' +
      'she just holds it. "It\'s strange," she says. "To just... stop."',
    weight: 2,
  },

  // Deep
  {
    contextKey: CTX_DEEP,
    narrative:
      'Lev\'s light flicks over every surface systematically. ' +
      '"The Hollow density increases four levels down. We\'re at two. ' +
      'Manageable." Her voice is very calm.',
    weight: 2,
  },

  // Generic
  {
    contextKey: CTX_GENERIC,
    narrative:
      'Lev writes something in her notebook without looking up. ' +
      '"Noted," she says, though you didn\'t say anything.',
    weight: 2,
  },
  {
    contextKey: CTX_GENERIC,
    narrative:
      'Lev adjusts her pack straps and keeps moving. The pen is already out. ' +
      'It is always already out.',
    weight: 1,
  },
  {
    contextKey: CTX_GENERIC,
    narrative:
      '"You\'re holding up well," Lev says. She is, you realize, ' +
      'also talking about herself.',
    weight: 2,
  },
]

export const LEV_JOIN_NARRATION: string[] = [
  '"I need field data," <npc>Lev</npc> says, already packing. ' +
    '"You\'re going somewhere useful. The timing works." She doesn\'t ask.',
  '<npc>Lev</npc> closes her laptop, tucks it away, shoulders her pack. ' +
    '"I\'ve been reviewing the data from here for eight months." ' +
    '"I need to go see the data for myself."',
  '"Someone should record this properly," <npc>Lev</npc> says. ' +
    '"I\'ll come." The way she says it makes you think she\'s been waiting ' +
    'for someone to go with.',
]

export const LEV_LEAVE_NARRATION: Record<string, string[]> = {
  quest_complete: [
    '<npc>Lev</npc> marks something in her notebook, then shuts it. ' +
      '"Good data," she says. For her, that\'s everything.',
    '"I\'ll write this up," <npc>Lev</npc> says. ' +
      '"It\'ll matter. Somewhere. Eventually." She means it.',
  ],
  player_choice: [
    '<npc>Lev</npc> nods once. "I understand." ' +
      'She pulls out her notebook before you\'ve taken three steps.',
  ],
  death: [
    '<npc>Lev</npc> is pressed against the wall, breathing hard. ' +
      'Then not breathing at all. Her notebook is open to the last entry. ' +
      'The ink is still wet.',
    'The last thing <npc>Lev</npc> does is mark the coordinates. ' +
      'Even then, she was taking notes.',
  ],
  separation: [
    '<npc>Lev</npc> says she\'ll make her own way back. ' +
      '"I know this zone better than I let on," she adds. ' +
      'You believe that too.',
  ],
}

// ============================================================
// AVERY — avery_kindling
// Voice: whispered prayers, guilt, wonder, self-interruption.
// Note: NPC must be added to data/npcs.ts (see HOOK.md assumption #1)
// ============================================================

export const AVERY_NARRATION: CompanionCommentary[] = [
  // Open / outdoors
  {
    contextKey: CTX_OPEN,
    narrative:
      'Avery stops and looks up. Just up. ' +
      '"The sky looks different out here," she says. "Wider." ' +
      'She catches herself and keeps walking.',
    weight: 3,
  },
  {
    contextKey: CTX_OPEN,
    narrative:
      'Avery turns her face toward the wind, eyes closed, for just a moment. ' +
      'She opens them and she\'s Avery again, walking beside you.',
    weight: 2,
  },

  // Danger
  {
    contextKey: CTX_DANGER,
    narrative:
      'Avery\'s lips move. She\'s praying — quick, almost inaudible. ' +
      'She catches herself and stops. She doesn\'t look at you.',
    weight: 3,
  },
  {
    contextKey: CTX_DANGER,
    narrative:
      'Avery moves quietly when it matters. Whatever she was before she ' +
      'was Kindling, it left something useful.',
    weight: 2,
  },

  // Night
  {
    contextKey: CTX_NIGHT,
    narrative:
      'Avery walks very close to you in the dark. ' +
      '"The Kindling believe darkness is purifying," she says. ' +
      '"I\'m still working on believing that."',
    weight: 3,
  },

  // Ruins
  {
    contextKey: CTX_RUINS,
    narrative:
      'Avery touches a broken doorframe and says something under her breath. ' +
      'Not a prayer this time. Something older than that. More personal.',
    weight: 2,
  },
  {
    contextKey: CTX_RUINS,
    narrative:
      '"There were people here," Avery says. It\'s not an observation — ' +
      'it\'s an acknowledgment. She gives them a moment before moving on.',
    weight: 2,
  },

  // Settlement
  {
    contextKey: CTX_SETTLEMENT,
    narrative:
      'Avery watches the settlement children with an expression that moves ' +
      'across several things quickly and settles on careful hope.',
    weight: 2,
  },

  // Rest
  {
    contextKey: CTX_REST,
    narrative:
      'Avery sits apart and bows her head. You can\'t tell if she\'s praying ' +
      'or just tired. Maybe she can\'t either.',
    weight: 2,
  },
  {
    contextKey: CTX_REST,
    narrative:
      'Avery pulls a small pressed flower from her pocket, looks at it, ' +
      'puts it back. She doesn\'t explain it.',
    weight: 2,
  },

  // Generic
  {
    contextKey: CTX_GENERIC,
    narrative:
      'Avery says nothing for a while. Then: "Do you think it\'s enough? ' +
      'What we\'re doing?" She doesn\'t wait for an answer. ' +
      'She\'s not asking you.',
    weight: 2,
  },
  {
    contextKey: CTX_GENERIC,
    narrative:
      'Avery keeps pace, eyes down on the path. ' +
      'Every so often her lips move. She\'s counting something.',
    weight: 1,
  },
  {
    contextKey: CTX_GENERIC,
    narrative:
      'Avery glances at you with an expression you can\'t quite read. ' +
      'Something between gratitude and apology.',
    weight: 2,
  },
]

export const AVERY_JOIN_NARRATION: string[] = [
  '<npc>Avery</npc> hesitates at the door, then steps through. ' +
    '"I know I\'m not supposed to," she says. ' +
    '"I\'m coming anyway." She sounds like she\'s been arguing with herself.',
  '"The Kindling say trust is earned through fire," <npc>Avery</npc> says. ' +
    '"I think trust is earned through showing up." She shows up.',
  '<npc>Avery</npc> ties her hair back and adjusts her pack with the focused ' +
    'efficiency of someone who has been waiting for permission ' +
    'they\'ve decided they don\'t need.',
]

export const AVERY_LEAVE_NARRATION: Record<string, string[]> = {
  quest_complete: [
    '<npc>Avery</npc> says a quiet word before she goes. You don\'t catch ' +
      'all of it. You catch enough: "...worth it."',
    '"Thank you for letting me come," <npc>Avery</npc> says. ' +
      'Then, quieter: "Thank you for not explaining why I should."',
  ],
  player_choice: [
    '<npc>Avery</npc> nods. She expected this. ' +
      '"It\'s okay," she says. It might even be true.',
  ],
  death: [
    '<npc>Avery</npc> looks at the body. Then at her hands. ' +
      '"I didn\'t help," she says. "I\'m sorry." Then she\'s gone. ' +
      'She was trying to say it to someone specific.',
    '<npc>Avery</npc> doesn\'t make a sound. She just stops. ' +
      'The small pressed flower falls from her pocket. ' +
      'You\'re not going to leave it here.',
  ],
  separation: [
    '<npc>Avery</npc> looks back once. Then she\'s around the corner ' +
      'and the sound of her footsteps stops. Just stops.',
  ],
}

// ============================================================
// PATCH — patch
// Voice: clinical, observational, dark humor as armor.
// Treats silence as more honest than words. Unsentimental.
// ============================================================

export const PATCH_NARRATION: CompanionCommentary[] = [
  // Danger
  {
    contextKey: CTX_DANGER,
    narrative:
      'Patch checks exits before she checks you. ' +
      'That tells you something, you think. ' +
      'Then she checks you. Maybe it tells you the other thing.',
    weight: 3,
  },
  {
    contextKey: CTX_DANGER,
    narrative:
      'Patch assesses the room with medical efficiency: ' +
      'cover, egress, defensible position. ' +
      '"Over there," she says. You both go.',
    weight: 2,
  },

  // Rest
  {
    contextKey: CTX_REST,
    narrative:
      '"You\'re fine. By \'fine\' I mean you\'re alive, " Patch says, ' +
      'already inventorying her kit. "Which is the only metric I use anymore."',
    weight: 3,
  },
  {
    contextKey: CTX_REST,
    narrative:
      'Patch sits with her back to the wall and her kit open on her knees. ' +
      'She looks, for just a moment, like she might actually rest.',
    weight: 2,
  },

  // Ruins
  {
    contextKey: CTX_RUINS,
    narrative:
      'Patch scans the debris with a professional eye. ' +
      '"Crush injuries, mostly, from the collapse. Quick." She pauses. ' +
      '"That\'s the best thing I can say about it."',
    weight: 2,
  },

  // Settlement
  {
    contextKey: CTX_SETTLEMENT,
    narrative:
      'Patch watches the crowd and categorizes without meaning to: ' +
      'walking wounded, untreated, compensating. ' +
      '"Three people in this room need antibiotics," she says.',
    weight: 2,
  },
  {
    contextKey: CTX_SETTLEMENT,
    narrative:
      'Someone in the settlement calls out to Patch by name. ' +
      'She gives them a look that means later, and something in ' +
      'their posture says they know what that costs her.',
    weight: 2,
  },

  // Night
  {
    contextKey: CTX_NIGHT,
    narrative:
      'Patch\'s night vision is better than it should be. ' +
      'You\'ve noticed. She hasn\'t mentioned it. ' +
      'You\'ve both decided not to discuss it.',
    weight: 2,
  },

  // Deep
  {
    contextKey: CTX_DEEP,
    narrative:
      'Patch pulls a light from her kit and hands it to you. ' +
      '"Peripheral vision matters more in the dark than forward vision. ' +
      'Point it sideways." She already has hers sideways.',
    weight: 2,
  },

  // Generic
  {
    contextKey: CTX_GENERIC,
    narrative:
      'Patch says nothing. She is always not saying something specific. ' +
      'Today, you can almost read which thing.',
    weight: 2,
  },
  {
    contextKey: CTX_GENERIC,
    narrative:
      '"How\'s the breathing?" Patch asks. ' +
      '"Not yours," she adds. "The room\'s."',
    weight: 2,
  },
  {
    contextKey: CTX_GENERIC,
    narrative:
      'Patch walks in step with you. Her kit is packed for efficiency, ' +
      'not optimism — everything in it has already been used at least once.',
    weight: 1,
  },
]

export const PATCH_JOIN_NARRATION: string[] = [
  '<npc>Patch</npc> packs her kit with the speed of someone who has ' +
    'been doing this since before packing was a survival skill. ' +
    '"You\'ll need medical support. Don\'t argue."',
  '"You\'re going to get hurt," <npc>Patch</npc> says. ' +
    '"Probably. I find that easier to manage if I\'m there when it happens." ' +
    'She\'s already shouldered her kit.',
  '<npc>Patch</npc> doesn\'t explain. She stands, picks up her bag, ' +
    'and looks at you. That\'s the whole conversation.',
]

export const PATCH_LEAVE_NARRATION: Record<string, string[]> = {
  quest_complete: [
    '<npc>Patch</npc> checks you over one last time — clinical, efficient — ' +
      'then nods. "Structurally intact," she says. Her highest praise.',
    '"Come find me when something breaks," <npc>Patch</npc> says. ' +
      '"And it will." She walks without looking back.',
  ],
  player_choice: [
    '<npc>Patch</npc> repacks the one item she\'d taken out ' +
      'in anticipation. She says nothing. She doesn\'t need to.',
  ],
  death: [
    '<npc>Patch</npc> says nothing. She just starts working on the wound. ' +
      'Her silence is worse than words. ' +
      'She works until it doesn\'t matter anymore. Then she stands up.',
    'The last thing <npc>Patch</npc> does is press the locket flat ' +
      'against her chest, one hand over it. ' +
      'You will wonder about that for a long time.',
  ],
  separation: [
    '<npc>Patch</npc> leaves you with a clean dressing and three words: ' +
      '"Don\'t be stupid." She doesn\'t look back.',
  ],
}

// ============================================================
// VESPER — vesper
// Voice: ancient perspective, alien cadences, terrifying beauty.
// Has seen centuries. Experiences the present like reading a
// book she has already read. Unsettling. Not malicious.
// ============================================================

export const VESPER_NARRATION: CompanionCommentary[] = [
  // Night
  {
    contextKey: CTX_NIGHT,
    narrative:
      '<npc>Vesper</npc> moves differently in the dark. More naturally. ' +
      'You try not to think about why.',
    weight: 3,
  },
  {
    contextKey: CTX_NIGHT,
    narrative:
      '"I prefer this," <npc>Vesper</npc> says, lifting her face to ' +
      'a sky with no stars. "The light is — imprecise." ' +
      'You let that sentence be.',
    weight: 2,
  },

  // Ruins
  {
    contextKey: CTX_RUINS,
    narrative:
      '"I remember when this was new," <npc>Vesper</npc> says. ' +
      '"That sentence used to be an exaggeration." ' +
      'It is not an exaggeration.',
    weight: 3,
  },
  {
    contextKey: CTX_RUINS,
    narrative:
      '<npc>Vesper</npc> stops and places one hand on the wall ' +
      'and stands there for a moment you don\'t interrupt. ' +
      'Then: "Yes. I thought so." She moves on.',
    weight: 2,
  },

  // Danger
  {
    contextKey: CTX_DANGER,
    narrative:
      '<npc>Vesper</npc> doesn\'t tense. She becomes more still. ' +
      'There\'s a difference, and it is more frightening than tension.',
    weight: 3,
  },
  {
    contextKey: CTX_DANGER,
    narrative:
      'For a moment — just a moment — you see what she really is. ' +
      'Then the moment passes and it\'s just <npc>Vesper</npc> again, ' +
      'composed and watching.',
    weight: 2,
  },

  // Rest
  {
    contextKey: CTX_REST,
    narrative:
      '<npc>Vesper</npc> does not rest the way you rest. ' +
      'She sits and goes somewhere else for a while. ' +
      'Her eyes stay open.',
    weight: 2,
  },

  // Settlement
  {
    contextKey: CTX_SETTLEMENT,
    narrative:
      '<npc>Vesper</npc> causes a reaction she\'s long past noticing: ' +
      'a widening of paths, a quiet in conversation. ' +
      'She navigates it the way water navigates stone.',
    weight: 2,
  },
  {
    contextKey: CTX_SETTLEMENT,
    narrative:
      '"A good settlement," <npc>Vesper</npc> says appraisingly. ' +
      '"They\'ve gotten the drainage right. That\'s always the first thing " ' +
      '"that goes." You didn\'t ask.',
    weight: 2,
  },

  // Deep
  {
    contextKey: CTX_DEEP,
    narrative:
      '<npc>Vesper</npc> takes the lead without discussion, ' +
      'her steps certain in the dark. ' +
      '"I know this kind of place," she says. "Trust the floor."',
    weight: 2,
  },

  // Generic
  {
    contextKey: CTX_GENERIC,
    narrative:
      '<npc>Vesper</npc> says something in a language you don\'t know. ' +
      'Then she pretends she didn\'t.',
    weight: 2,
  },
  {
    contextKey: CTX_GENERIC,
    narrative:
      '"You are holding up well," <npc>Vesper</npc> says. ' +
      '"Better than the last one who came through here." ' +
      'You don\'t ask about the last one.',
    weight: 2,
  },
  {
    contextKey: CTX_GENERIC,
    narrative:
      '<npc>Vesper</npc> walks at a pace that accommodates yours ' +
      'with the patience of someone for whom time moves differently. ' +
      'It probably does.',
    weight: 1,
  },
]

export const VESPER_JOIN_NARRATION: string[] = [
  '<npc>Vesper</npc> sets down her book and rises without haste, ' +
    'the way someone rises who has been considering this for longer ' +
    'than the conversation has taken. "Yes," she says. "I\'ll come."',
  '"I have been to where you\'re going," <npc>Vesper</npc> says. ' +
    '"Once. Some decades ago. It has likely changed." She doesn\'t say ' +
    'how she knows where you\'re going.',
  '<npc>Vesper</npc> looks at you for a long moment before answering. ' +
    'The look is not unkind. It is just thorough. ' +
    '"Yes," she says finally. "I think so."',
]

export const VESPER_LEAVE_NARRATION: Record<string, string[]> = {
  quest_complete: [
    '<npc>Vesper</npc> regards you with something that, in a human face, ' +
      'you would call warmth. "You did well," she says. ' +
      '"I have seen many who didn\'t."',
    '"Until next cycle," <npc>Vesper</npc> says, ' +
      'and walks away through the dark as if it isn\'t there.',
  ],
  player_choice: [
    '<npc>Vesper</npc> inclines her head. "As you wish." ' +
      'She is already not there before you\'ve finished watching her go.',
  ],
  death: [
    'Something ancient passes out of the world. ' +
      '<npc>Vesper</npc> does not make a sound. ' +
      'The darkness around her is different after. Quieter.',
    'You did not think she could be killed. ' +
      'The evidence suggests she thought the same thing. ' +
      '<npc>Vesper</npc> is gone.',
  ],
  separation: [
    '<npc>Vesper</npc> fades into shadow with the ease of something ' +
      'that has been doing that for longer than you\'ve been alive. ' +
      '"I will be nearby," she says from the dark.',
  ],
}

// ============================================================
// CROSS — marshal_cross
// Voice: military brevity, protective instinct, burdened.
// Says less than he means. Does more than he says.
// ============================================================

export const CROSS_NARRATION: CompanionCommentary[] = [
  // Settlement
  {
    contextKey: CTX_SETTLEMENT,
    narrative:
      '<npc>Cross</npc> scans the rooftops. Old habit. He doesn\'t explain.',
    weight: 3,
  },
  {
    contextKey: CTX_SETTLEMENT,
    narrative:
      '<npc>Cross</npc> catalogs every face he passes. ' +
      'You\'ve stopped wondering if he\'s looking for someone.',
    weight: 2,
  },
  {
    contextKey: CTX_SETTLEMENT,
    narrative:
      '<npc>Cross</npc> acknowledges three people by name ' +
      'before you\'re halfway through. He does not stop for any of them.',
    weight: 2,
  },

  // Danger
  {
    contextKey: CTX_DANGER,
    narrative:
      '<npc>Cross</npc> puts himself between you and the door. ' +
      'He doesn\'t ask. He doesn\'t explain. He just does it.',
    weight: 3,
  },
  {
    contextKey: CTX_DANGER,
    narrative:
      '"Two exits," <npc>Cross</npc> says. ' +
      '"We use neither one unless we have to." ' +
      'He points to a third option you missed.',
    weight: 2,
  },

  // Rest
  {
    contextKey: CTX_REST,
    narrative:
      '<npc>Cross</npc> sleeps sitting up, one hand on his weapon. ' +
      'Even here. Even tonight.',
    weight: 3,
  },
  {
    contextKey: CTX_REST,
    narrative:
      '<npc>Cross</npc> takes the first watch without being asked. ' +
      '"I sleep light anyway," he says. This is probably true.',
    weight: 2,
  },

  // Night
  {
    contextKey: CTX_NIGHT,
    narrative:
      '<npc>Cross</npc> moves with the extra caution of someone ' +
      'who has lost people at night. He doesn\'t say that. ' +
      'His feet say it.',
    weight: 2,
  },

  // Ruins
  {
    contextKey: CTX_RUINS,
    narrative:
      '<npc>Cross</npc> checks the corners before the center. ' +
      '"Corners first," he says once, quietly, like a lesson ' +
      'he was taught the expensive way.',
    weight: 2,
  },

  // Open
  {
    contextKey: CTX_OPEN,
    narrative:
      '<npc>Cross</npc> slows when the ground opens up. ' +
      'His instincts are for enclosed spaces. Out here he\'s exposed ' +
      'in ways that have nothing to do with terrain.',
    weight: 2,
  },

  // Generic
  {
    contextKey: CTX_GENERIC,
    narrative:
      '<npc>Cross</npc> says nothing. His silence is specific — ' +
      'the silence of someone monitoring every frequency at once.',
    weight: 2,
  },
  {
    contextKey: CTX_GENERIC,
    narrative:
      '"Still good," <npc>Cross</npc> says, without you asking. ' +
      'He means the route behind you. He\'s been checking.',
    weight: 2,
  },
  {
    contextKey: CTX_GENERIC,
    narrative:
      '<npc>Cross</npc> slows slightly to let you set the pace. ' +
      'He\'s still scanning everything you pass.',
    weight: 1,
  },
]

export const CROSS_JOIN_NARRATION: string[] = [
  '<npc>Cross</npc> finishes his perimeter check first. ' +
    'Then: "I\'ll come." Just that. No elaboration. ' +
    'His rifle is already slung before you answer.',
  '"The Accord doesn\'t know I\'m doing this," <npc>Cross</npc> says. ' +
    '"That\'s fine. Some things don\'t require their permission." ' +
    'He\'s been deciding this for a while.',
  '<npc>Cross</npc> looks at you with the direct assessment of someone ' +
    'who has chosen partners in high-stakes situations before. ' +
    '"You\'ll do," he says. High praise.',
]

export const CROSS_LEAVE_NARRATION: Record<string, string[]> = {
  quest_complete: [
    '<npc>Cross</npc> extends a hand. Not the gesture of a superior — ' +
      'the gesture of an equal who has decided you\'ve earned it.',
    '"Good work," <npc>Cross</npc> says. ' +
      'He turns and walks back toward his responsibilities ' +
      'with the posture of a man who\'s added this to what he carries.',
  ],
  player_choice: [
    '<npc>Cross</npc> nods once. "All right." ' +
      'He doesn\'t ask why. He trusts decisions.',
  ],
  death: [
    '<npc>Cross</npc> goes down covering the exit. ' +
      'He does not go down first. He goes down last. ' +
      'That is the only thing he would have chosen.',
    'The Marshal falls like someone who knew ' +
      'the odds and made the calculation anyway. ' +
      '<npc>Cross</npc> knew the odds.',
  ],
  separation: [
    '<npc>Cross</npc> presses a folded piece of paper into your hand ' +
      'before he turns. A route. An alternate exit. ' +
      '"In case," he says.',
  ],
}

// ============================================================
// SPARKS — sparks_radio
// Voice: nervous, obsessive, verbal under stress.
// Fills silence with words. You notice when she doesn't.
// ============================================================

export const SPARKS_NARRATION: CompanionCommentary[] = [
  // Tech
  {
    contextKey: CTX_TECH,
    narrative:
      '<npc>Sparks</npc> touches every terminal like it might be the one ' +
      'that answers back. She keeps half her attention on the one ' +
      'that hasn\'t been touched in longest.',
    weight: 3,
  },
  {
    contextKey: CTX_TECH,
    narrative:
      '"Oh," <npc>Sparks</npc> breathes, already crouching in front of a ' +
      'rack of equipment. "Oh, this is — okay. Okay, I need five minutes." ' +
      '"Take three," you say. She takes four.',
    weight: 3,
  },
  {
    contextKey: CTX_TECH,
    narrative:
      '<npc>Sparks</npc> mutters under her breath: components, model numbers, ' +
      'conditions. She\'s cataloguing. She has been doing this her whole life.',
    weight: 2,
  },

  // Danger
  {
    contextKey: CTX_DANGER,
    narrative:
      '<npc>Sparks</npc> hides behind the nearest solid object ' +
      'and talks quietly and continuously: "Okay, okay, okay. ' +
      'There are — there are three angles. We have the pillar. ' +
      'Use the pillar."',
    weight: 3,
  },
  {
    contextKey: CTX_DANGER,
    narrative:
      '"I\'m a radio operator," <npc>Sparks</npc> says from cover. ' +
      '"Not a soldier. I want to register that formally. ' +
      'Formally registered. Okay. Tell me what to do."',
    weight: 2,
  },

  // Ruins
  {
    contextKey: CTX_RUINS,
    narrative:
      '<npc>Sparks</npc> scans for antenna mounts, cable runs, ' +
      'distribution boxes — the skeleton of the old network under the ruin. ' +
      '"It was all connected," she says. "All of it."',
    weight: 2,
  },

  // Night
  {
    contextKey: CTX_NIGHT,
    narrative:
      '<npc>Sparks</npc> fills silence with words. ' +
      'You\'ve started to notice when she doesn\'t.',
    weight: 3,
  },
  {
    contextKey: CTX_NIGHT,
    narrative:
      '<npc>Sparks</npc> is quiet. For her, that\'s loud. ' +
      'You move closer without discussing it.',
    weight: 2,
  },

  // Rest
  {
    contextKey: CTX_REST,
    narrative:
      '<npc>Sparks</npc> sets her equipment down carefully ' +
      'and stares at it for a moment like she\'s giving herself permission. ' +
      'Then she sits. Then she talks, until she falls asleep mid-sentence.',
    weight: 2,
  },
  {
    contextKey: CTX_REST,
    narrative:
      '"I\'m fine," <npc>Sparks</npc> says, unprompted. ' +
      '"I\'m just — it\'s quiet. I don\'t love quiet." ' +
      '"I know," you say.',
    weight: 2,
  },

  // Open
  {
    contextKey: CTX_OPEN,
    narrative:
      '<npc>Sparks</npc> pauses to scan the horizon for antenna towers, ' +
      'power lines, anything that was part of the old network. ' +
      '"Still there," she says about one rusted tower. "Good bones."',
    weight: 2,
  },

  // Generic
  {
    contextKey: CTX_GENERIC,
    narrative:
      '<npc>Sparks</npc> is talking. She\'s been talking for a while. ' +
      'You check in and realize you\'ve been listening. ' +
      'That\'s interesting.',
    weight: 2,
  },
  {
    contextKey: CTX_GENERIC,
    narrative:
      '"The signal\'s stronger here," <npc>Sparks</npc> says, ' +
      'checking her receiver. "Interesting." She writes that down. ' +
      'She writes everything down.',
    weight: 2,
  },
  {
    contextKey: CTX_GENERIC,
    narrative:
      '<npc>Sparks</npc> hums something — an old song, half-remembered. ' +
      'She stops when she notices you noticing, slightly embarrassed.',
    weight: 1,
  },
]

export const SPARKS_JOIN_NARRATION: string[] = [
  '"Oh, I\'m coming," <npc>Sparks</npc> says, already packing. ' +
    '"You\'re going toward the signal. I\'m not staying here ' +
    'while you go toward the signal." She is non-negotiable about this.',
  '<npc>Sparks</npc> shoves her receiver into a case and throws the ' +
    'strap over her shoulder. "I know, I know — I\'m not a field person. ' +
    'But I know the frequencies. You need the frequencies." She\'s right.',
  '"Okay, look," <npc>Sparks</npc> says. "I\'ve been following this signal ' +
    'for eight months from a desk. I am going to follow it " ' +
    '"in person now. Okay? Good. Decided." She\'s decided.',
]

export const SPARKS_LEAVE_NARRATION: Record<string, string[]> = {
  quest_complete: [
    '<npc>Sparks</npc> is already talking about what it means — ' +
      'implications, frequencies, next steps. She doesn\'t say goodbye. ' +
      'She says "I\'ll transmit when I\'m back at the set."',
    '"This — this was good," <npc>Sparks</npc> says, with the quiet force ' +
      'of someone for whom the word is doing a lot of work. ' +
      '"Really good." She means more than the signal.',
  ],
  player_choice: [
    '<npc>Sparks</npc> says okay too quickly. ' +
      'Then she says it again, slower, to convince herself.',
  ],
  death: [
    '<npc>Sparks</npc> doesn\'t finish the sentence she was in ' +
      'the middle of. The signal log is still in her hand. ' +
      'Three hundred hours of recordings. Someone should find them.',
    'The last thing <npc>Sparks</npc> does is tuck her receiver ' +
      'against her chest like she\'s protecting it. ' +
      'Or like it\'s protecting her. You\'re not sure.',
  ],
  separation: [
    '<npc>Sparks</npc> opens her mouth, closes it, tries again. ' +
      '"I\'ll be on channel seven," she says. ' +
      '"If you have a radio. Do you have a radio?"',
  ],
}

// ============================================================
// COMBAT REACTIONS — indexed by NPC ID
// ============================================================

export type CombatOutcome = 'victory' | 'close_call' | 'retreat'

export const COMPANION_COMBAT_REACTIONS: Record<string, Record<CombatOutcome, string[]>> = {
  howard_bridge_keeper: {
    victory: [
      '"You\'re still standing," <npc>Howard</npc> says. ' +
        '"That\'s the whole job."',
      '<npc>Howard</npc> checks you first, then the exit. ' +
        '"Anything broken?" He means bones.',
    ],
    close_call: [
      '<npc>Howard</npc> breathes out slowly. ' +
        '"Too close," he says. "We adjust."',
      '<npc>Howard</npc> waits until his hands are steady ' +
        'before saying anything. "Not ideal," he says finally.',
    ],
    retreat: [
      '"Live to walk back," <npc>Howard</npc> says, ' +
        'already moving. "That\'s the only metric."',
      '<npc>Howard</npc> doesn\'t argue about retreating. ' +
        'He just does it efficiently. "Same way we came in."',
    ],
  },
  lev: {
    victory: [
      '<npc>Lev</npc> makes a note. You realize she was making notes ' +
        'during the fight. "The response time is improving," she says.',
      '"Documented," <npc>Lev</npc> says, closing her notebook. ' +
        'She is slightly out of breath.',
    ],
    close_call: [
      '<npc>Lev</npc> is pressed against the wall, breathing hard. ' +
        'She doesn\'t look at you. She\'s processing.',
      '<npc>Lev</npc> checks her notebook first. Then her hands. ' +
        'Then she looks at you. "I\'m all right," she says. ' +
        '"I think I\'m all right."',
    ],
    retreat: [
      '"Tactical withdrawal," <npc>Lev</npc> says, ' +
        'falling back at your side. "That\'s the correct terminology."',
      '<npc>Lev</npc> runs without dropping her notebook. ' +
        'You notice this. It says something about priorities.',
    ],
  },
  the_dog: {
    victory: [
      'The dog circles the fallen shape once, making sure. Then it returns ' +
        'to your side. Whatever it saw satisfied it.',
      'The dog does not celebrate. It checks you. Then it checks the exits. ' +
        'Then it sits, tail still, waiting for the next thing.',
    ],
    close_call: [
      'The dog licks blood off its muzzle — yours, not its own. ' +
        'It does not apologize for the intimacy. It cleaned the wound ' +
        'because the wound needed cleaning.',
      'The dog stays pressed against your leg for a long time after it ends. ' +
        'Its breathing slows before yours does. It has done this before.',
    ],
    retreat: [
      'The dog is already moving by the time you decide to run. It knows ' +
        'the difference between fighting and leaving. It knows which is this.',
      'The dog stays between you and the threat while you retreat. ' +
        'When you are clear, it falls in. Wordless. The way a professional moves.',
    ],
  },
  avery_kindling: {
    victory: [
      '<npc>Avery</npc> looks at the body. Then at her hands. ' +
        '"I didn\'t help," she says. "I\'m sorry."',
      '<npc>Avery</npc> says a word under her breath. ' +
        'Acknowledgment. Apology. You can\'t tell which.',
    ],
    close_call: [
      '<npc>Avery</npc>\'s hands are shaking. ' +
        'She presses them flat against her legs until they stop.',
      '<npc>Avery</npc> closes her eyes for three seconds. ' +
        'Opens them. "Okay," she says. "Okay."',
    ],
    retreat: [
      '<npc>Avery</npc> is already moving. ' +
        'Whatever she was, it left useful instincts.',
      '"We go," <npc>Avery</npc> says — quiet, no hesitation.',
    ],
  },
  patch: {
    victory: [
      '<npc>Patch</npc> says nothing. She just starts working ' +
        'on the wound. Her silence is worse than words.',
      '"Still alive," <npc>Patch</npc> says. ' +
        '"Let me check that." She does. Then: "Still alive."',
    ],
    close_call: [
      '<npc>Patch</npc> takes a sharp breath and gets to work ' +
        'before you finish the fight. She was already getting to work.',
      '<npc>Patch</npc> looks at you with clinical assessment ' +
        'and something she won\'t name. "Sit down," she says.',
    ],
    retreat: [
      '<npc>Patch</npc> is covering the retreat before you call it. ' +
        '"Now," she says. One word. Good enough.',
      '"I\'m not dying here," <npc>Patch</npc> says, ' +
        'not to you but to the room. The room loses.',
    ],
  },
  vesper: {
    victory: [
      '<npc>Vesper</npc> surveys the aftermath with ancient eyes. ' +
        '"Yes," she says. "That was always how this ended."',
      'For a moment — just a moment — you see what she really is. ' +
        'Then it\'s gone. Then it\'s just <npc>Vesper</npc>.',
    ],
    close_call: [
      '<npc>Vesper</npc>\'s composure does not break. ' +
        'But it bends, slightly, toward something that might be concern.',
      '"That was closer than it should have been," ' +
        '<npc>Vesper</npc> says, very quietly. ' +
        'From her, that\'s alarm.',
    ],
    retreat: [
      '<npc>Vesper</npc> withdraws without urgency ' +
        'and with total conviction. She knows what she\'s doing.',
      '"Not every ground is worth holding," ' +
        '<npc>Vesper</npc> says. "We\'ve seen enough of this one."',
    ],
  },
  marshal_cross: {
    victory: [
      '<npc>Cross</npc> does a sweep of the room before holstering. ' +
        '"Clear," he says. Then he checks on you.',
      '"Good," <npc>Cross</npc> says. No elaboration needed.',
    ],
    close_call: [
      '<npc>Cross</npc>\'s hands are steady. The rest of him ' +
        'is doing the work of making them steady.',
      '"Too close," <npc>Cross</npc> says. ' +
        '"We debrief later. Move now."',
    ],
    retreat: [
      '<npc>Cross</npc> is covering your six without being asked. ' +
        'This is what he does.',
      '"Disengaging," <npc>Cross</npc> says. ' +
        'Military word. He uses it without embarrassment.',
    ],
  },
  sparks_radio: {
    victory: [
      '<npc>Sparks</npc> comes out from behind the pillar. ' +
        '"Okay," she says. "That was — okay." ' +
        '"You\'re welcome," you say.',
      '<npc>Sparks</npc> exhales at length. ' +
        '"I was really useful back there," she says. ' +
        '"With the, uh. The hiding. Very effective hiding."',
    ],
    close_call: [
      '<npc>Sparks</npc> is talking. She\'s been talking since before ' +
        'it was over. Words go somewhere when fear has nowhere else to go.',
      '<npc>Sparks</npc> sits against the wall and is quiet. ' +
        'That\'s when you know it was bad.',
    ],
    retreat: [
      '<npc>Sparks</npc> is already running when you call it. ' +
        '"I know! I know! I\'m going!"',
      '"Tactically redeploying!" <npc>Sparks</npc> announces, ' +
        'at speed. "This is a strategic relocation!"',
    ],
  },
}

// ============================================================
// DISCOVERY REACTIONS — indexed by NPC ID
// ============================================================

export const COMPANION_DISCOVERY_REACTIONS: Record<string, Record<string, string>> = {
  howard_bridge_keeper: {
    default:
      '<npc>Howard</npc> studies the find with the eyes of an engineer ' +
      'who sees load-bearing structures in everything. ' +
      '"Useful," he says. That\'s his highest praise.',
    lore_item:
      '<npc>Howard</npc> reads the document slowly. ' +
      '"I didn\'t know that," he says. ' +
      'He pauses. "I should have known that."',
    tech:
      '<npc>Howard</npc> moves closer. He doesn\'t touch it — ' +
      'not yet. "Beautiful construction," he says, quietly.',
    route:
      '"That changes our options," <npc>Howard</npc> says. ' +
      '"Let me think." He thinks.',
  },
  lev: {
    default:
      '<npc>Lev</npc>\'s notebook is open before you\'ve finished ' +
      'pointing at it. She catalogs first. Reacts later.',
    lore_item:
      '"This is — wait." <npc>Lev</npc> reads it again. ' +
      '"This changes the dataset. Significantly."',
    tech:
      '<npc>Lev</npc> makes a sound that might be a word and might be ' +
      'a number. She photographs it from three angles.',
    route:
      '<npc>Lev</npc> adds the route to her map. ' +
      '"Consistent with the signal propagation patterns," she says.',
  },
  the_dog: {
    default:
      'The dog investigates with its nose, not its eyes. It catalogs. ' +
      'Whatever conclusion it reaches is not one it shares.',
    lore_item:
      'The dog sniffs the paper once and loses interest. Paper does not ' +
      'carry the information dogs look for. You are on your own with this one.',
    tech:
      'The dog will not come near the device. It does not flinch from it; ' +
      'it simply declines to be in the same air. You note the decision.',
    route:
      'The dog tests the new path with one paw, then the rest. ' +
      'Whatever it learns, it learns quickly. It looks back at you once, ' +
      'permission either given or withheld. You decide which.',
  },
  avery_kindling: {
    default:
      '<npc>Avery</npc> looks at the discovery with the openness ' +
      'of someone still willing to be surprised by the world.',
    lore_item:
      '<npc>Avery</npc> reads it carefully. ' +
      '"People remembered things," she says, with something like awe.',
    tech:
      '<npc>Avery</npc> doesn\'t know what it does. ' +
      'She touches it anyway, gently. "It still works," she says.',
    route:
      '"Oh," <npc>Avery</npc> says. "I didn\'t know this was here." ' +
      'She sounds genuinely delighted.',
  },
  patch: {
    default:
      '<npc>Patch</npc> assesses the discovery the way she assesses ' +
      'everything: for immediate utility. "Useful?" she asks.',
    lore_item:
      '<npc>Patch</npc> reads it, expressionless. Then: ' +
      '"So that\'s what happened." She folds it carefully.',
    tech:
      '"Medical applications?" <npc>Patch</npc> asks ' +
      'before anything else. Then she looks at the rest of it.',
    route:
      '<npc>Patch</npc> studies the route and adds something to it ' +
      'in pencil. "Infirmary here," she says. "In case."',
  },
  vesper: {
    default:
      '<npc>Vesper</npc> regards the discovery with recognition. ' +
      '"I\'ve seen one of these before," she says, without saying when.',
    lore_item:
      '<npc>Vesper</npc> reads it without expression. ' +
      '"They had it partially right," she says.',
    tech:
      '"This is earlier than it looks," <npc>Vesper</npc> says. ' +
      '"The design philosophy is pre-Accord. Much pre-Accord."',
    route:
      '<npc>Vesper</npc> looks at the route. ' +
      '"The passage has shifted since this was drawn. ' +
      'Stay left at the third junction."',
  },
  marshal_cross: {
    default:
      '<npc>Cross</npc> checks the exits before the find. ' +
      'Then he looks at it. "Significant?" he asks.',
    lore_item:
      '<npc>Cross</npc> reads it standing, spine straight. ' +
      'When he\'s done he folds it and puts it in his front pocket.',
    tech:
      '"Defensible applications?" <npc>Cross</npc> says, ' +
      'assessing it tactically. Then: "Other applications too."',
    route:
      '<npc>Cross</npc> studies the route map with the thoroughness ' +
      'of someone who has been where bad route planning ends.',
  },
  sparks_radio: {
    default:
      '<npc>Sparks</npc> is immediately interested and immediately ' +
      'talking about it. "Is it — can I look? Can I look at it?"',
    lore_item:
      '"Oh, oh, okay," <npc>Sparks</npc> says, reading fast. ' +
      '"This explains the seventeen-second interval. ' +
      'It\'s a HEARTBEAT signal. Oh."',
    tech:
      '<npc>Sparks</npc> makes a sound that carries meaning ' +
      'only to other people who love electronics. ' +
      'She is vibrating slightly.',
    route:
      '"Signal amplification points," <npc>Sparks</npc> says immediately, ' +
      'mapping frequencies to geography. "If we go here first—"',
  },
}

// ============================================================
// PERSONAL MOMENTS — rare vulnerable moments (5% after 10+ rooms)
// Witnessed, not participated in. No dialogue options.
// ============================================================

export interface PersonalMoment {
  npcId: string
  description: string              // What you witness
  minRoomsTogether: number         // Must be >= this
}

export const PERSONAL_MOMENTS: PersonalMoment[] = [
  // Howard — the photo
  {
    npcId: 'howard_bridge_keeper',
    minRoomsTogether: 10,
    description:
      'You catch <npc>Howard</npc> looking at a photograph. ' +
      'He\'s standing still in a way he never stands still, ' +
      'and his face is doing something you\'ve never seen it do. ' +
      'He hears you and puts it away — not fast, not guiltily. ' +
      'Just the way you close a door that was open for the wrong person. ' +
      '"Old habit," he says. You don\'t ask.',
  },
  {
    npcId: 'howard_bridge_keeper',
    minRoomsTogether: 15,
    description:
      '<npc>Howard</npc> stops at a particular wall and puts one hand ' +
      'flat against it, his eyes somewhere else entirely. ' +
      'He stays like that for thirty seconds. Then he\'s walking again. ' +
      '"Load-bearing," he says, as if commenting on the wall. ' +
      'You both know he\'s commenting on something else.',
  },

  // Lev — the song
  {
    npcId: 'lev',
    minRoomsTogether: 10,
    description:
      '<npc>Lev</npc> is humming. A real song, from before — ' +
      'something with a melody that means something specific to someone. ' +
      'She stops the instant she realizes you can hear her, ' +
      'and the embarrassment on her face is not for the humming. ' +
      '"Sorry," she says. "Sorry, I was — it doesn\'t matter." ' +
      'It matters.',
  },
  {
    npcId: 'lev',
    minRoomsTogether: 12,
    description:
      'You find <npc>Lev</npc> standing outside the room, not moving, ' +
      'her notebook closed for once. She\'s looking at nothing. ' +
      'When she hears you she opens the notebook again immediately. ' +
      '"Ready," she says, too quickly. ' +
      'You saw something you weren\'t meant to see. ' +
      'You don\'t know what it was.',
  },

  // Avery — the flower
  {
    npcId: 'avery_kindling',
    minRoomsTogether: 10,
    description:
      '<npc>Avery</npc> finds a flower. Somehow, in this place, ' +
      'there is a small and determined flower. ' +
      'She crouches down and spends a long time looking at it. ' +
      'Then she opens the small book she carries ' +
      'and presses it between the pages. ' +
      'She does all of this without saying a word. ' +
      'You don\'t say anything either. Some things don\'t need a witness — ' +
      'they just need someone there.',
  },

  // Patch — the locket
  {
    npcId: 'patch',
    minRoomsTogether: 10,
    description:
      'You see <npc>Patch</npc>\'s hand go to her collar, ' +
      'where she keeps the locket. You\'ve noticed her do this ' +
      'a dozen times, but you\'ve never seen what\'s inside. ' +
      'Today she opens it, just for a moment, and the expression on ' +
      'her face is the one she only has when no one is looking. ' +
      'She feels you and closes it and that\'s that. ' +
      '"How\'s the pain?" she asks, which means: ' +
      'we are done with what you just saw.',
  },
  {
    npcId: 'patch',
    minRoomsTogether: 14,
    description:
      '<npc>Patch</npc> sits down beside you during the rest ' +
      'and doesn\'t open her kit. She doesn\'t take out her clipboard. ' +
      'She just sits. Hands in her lap. ' +
      'After a while she says: "I used to know a lot more people." ' +
      'Then she picks up her kit again. ' +
      'It cost her something to say that.',
  },

  // Vesper — the language
  {
    npcId: 'vesper',
    minRoomsTogether: 10,
    description:
      '<npc>Vesper</npc> says something in a language you don\'t know. ' +
      'Not to you. Not to the room. ' +
      'To something else that isn\'t there, or maybe to something ' +
      'that is there and you can\'t see. ' +
      'Then she catches herself. The mask goes back on, ' +
      'smooth and ancient and perfectly composed. ' +
      '"Forgive me," she says. "Old habit." ' +
      'You are thinking about what old means to her.',
  },
  {
    npcId: 'vesper',
    minRoomsTogether: 16,
    description:
      'You wake during the night watch to find <npc>Vesper</npc> ' +
      'standing in the door, very still, looking outward at nothing you can see. ' +
      'Her face, when you can see it in profile, is — lonely. ' +
      'That\'s the word. Lonely in a way that has had centuries to accumulate. ' +
      'She hears you and turns and she\'s composed again. ' +
      '"All clear," she says. ' +
      'You don\'t think that\'s what she means.',
  },

  // Cross — the hands
  {
    npcId: 'marshal_cross',
    minRoomsTogether: 10,
    description:
      'You see <npc>Cross</npc>\'s hands shaking. ' +
      'He doesn\'t know you can see them. He\'s standing with ' +
      'his back half-turned, and his hands are pressed flat ' +
      'against his thighs until they stop. ' +
      'The whole thing takes maybe ten seconds. ' +
      'Then he turns and he\'s the Marshal again, ' +
      'completely, as if that other person wasn\'t there. ' +
      'You will not mention this. Ever.',
  },
  {
    npcId: 'marshal_cross',
    minRoomsTogether: 13,
    description:
      'There is a name on the wall here. Among the others carved ' +
      'into the surface by people passing through. ' +
      '<npc>Cross</npc> stops at it. Puts his thumb against it. ' +
      'You can read the name over his shoulder. ' +
      'He moves on before you can ask who it was. ' +
      'His jaw says don\'t.',
  },

  // Sparks — the silence
  {
    npcId: 'sparks_radio',
    minRoomsTogether: 10,
    description:
      '<npc>Sparks</npc> finds a frequency she wasn\'t looking for. ' +
      'Just noise — static that resolves for a moment into something ' +
      'that might be a human voice. Or might not. ' +
      'She sits very still with the headphones on for a long time. ' +
      'When she takes them off her eyes are different. ' +
      '"Nothing there," she says. ' +
      'You don\'t think that\'s true.',
  },
  {
    npcId: 'sparks_radio',
    minRoomsTogether: 14,
    description:
      '<npc>Sparks</npc> stops talking mid-sentence and doesn\'t start again. ' +
      'You wait. She\'s looking at the receiver in her hands — ' +
      'not reading it, just holding it. ' +
      '"I just want it to mean something," she says. ' +
      'Very quiet. Not really to you. ' +
      '"I think it does," you say, even though you can\'t know. ' +
      'She nods once and picks up where she left off.',
  },
]

// ============================================================
// THE DOG — the_dog
// Voice: actions over words. Observation. Uncanny timing.
// A stray that has survived by reading intentions. Never waspish,
// never cute. A creature that chooses you despite knowing better.
// ============================================================

export const THE_DOG_NARRATION: CompanionCommentary[] = [
  // Danger — high-difficulty rooms. The dog knows before you do.
  {
    contextKey: CTX_DANGER,
    narrative:
      'The dog goes very still. Not cowering. Still like a drawn arrow. ' +
      'Its eyes track something you can\'t see yet. Something in the room ' +
      'has its full attention.',
    weight: 3,
  },
  {
    contextKey: CTX_DANGER,
    narrative:
      'The dog moves to your left without waiting for you to ask. ' +
      'It takes a position that makes your exit harder to reach. ' +
      'It is not protecting you. It is securing the ground.',
    weight: 2,
  },
  {
    contextKey: CTX_DANGER,
    narrative:
      'The dog stops growling. That is the tell. The wind through the room ' +
      'has not changed. The dog has stopped growling because something is ' +
      'close enough that growling would be a mistake.',
    weight: 2,
  },

  // Ruins — loss the dog doesn\'t find interesting
  {
    contextKey: CTX_RUINS,
    narrative:
      'The dog sniffs the rubble, methodical. Its hackles don\'t rise. ' +
      'It loses interest and moves on. Nothing here that needs killing. ' +
      'Nothing here that was worth killing, either.',
    weight: 2,
  },
  {
    contextKey: CTX_RUINS,
    narrative:
      'The dog approaches a collapsed wall and pauses. Its ears twitch. ' +
      'Something below. Something old. It moves on, unbothered. ' +
      'Scavengers don\'t interest it.',
    weight: 2,
  },
  {
    contextKey: CTX_RUINS,
    narrative:
      'The dog lifts a paw near the edge of a crack in the floor and holds it ' +
      'there. Not afraid. Listening. After a moment it chooses a different ' +
      'path around the crack. You follow.',
    weight: 2,
  },

  // Open / wilderness — the dog\'s domain
  {
    contextKey: CTX_OPEN,
    narrative:
      'The dog moves differently here. Gait changes. Head up. ' +
      'This is where the dog wants to be. You realize it has not been safe ' +
      'anywhere else. It has only ever been home in open country.',
    weight: 3,
  },
  {
    contextKey: CTX_OPEN,
    narrative:
      'The dog breaks away, hunting. It returns ten minutes later with nothing ' +
      'to show — just the look of something that remembered what it was. ' +
      'It settles by your side, content. The hunt mattered more than the catch.',
    weight: 2,
  },
  {
    contextKey: CTX_OPEN,
    narrative:
      'The dog stops and sniffs the wind for a long time. Prey animals, small ' +
      'ones, living things that still live. The dog\'s shoulders drop. ' +
      'Relief is something you do not usually see in this particular shape.',
    weight: 2,
  },

  // Tech / the_stacks — unease around the machinery
  {
    contextKey: CTX_TECH,
    narrative:
      'The dog\'s ears flatten at the hum. It presses close to your leg. ' +
      'This is wrong, its body says. This place smells like things ' +
      'that shouldn\'t still be moving.',
    weight: 3,
  },
  {
    contextKey: CTX_TECH,
    narrative:
      'The dog tolerates the tech the way it tolerates rain. Endured, not ' +
      'investigated. When a servo clicks somewhere above, the dog does not ' +
      'startle — but the look it gives you is the look of something that ' +
      'would very much like to leave.',
    weight: 2,
  },

  // Night — the world the dog watches for you
  {
    contextKey: CTX_NIGHT,
    narrative:
      'The dog\'s eyes catch what light there is. It is not looking at you. ' +
      'It is looking at the shapes beyond the edge of the room. It has been ' +
      'doing this since the sun went down. It will do it until the sun comes back.',
    weight: 3,
  },
  {
    contextKey: CTX_NIGHT,
    narrative:
      'The dog circles the room\'s perimeter once, checking exits. ' +
      'Then it settles with its back to a wall and its face toward the door. ' +
      'It does not sleep. That is not what this posture is for.',
    weight: 2,
  },

  // Rest / safeRest — relief that is not relief
  {
    contextKey: CTX_REST,
    narrative:
      'The dog settles differently in safe rooms. Not relaxed: relieved to be ' +
      'trapped. It picks a spot with clear sight lines and lies with its back ' +
      'to a wall. You realize sanctuary reads to it as last stand.',
    weight: 3,
  },

  // Deep / underground — the air is wrong
  {
    contextKey: CTX_DEEP,
    narrative:
      'The dog does not like the air down here. Its nose works overtime. ' +
      'Whatever it is smelling, the categories in its head do not cover it. ' +
      'It stays close. It does not explore.',
    weight: 2,
  },
  {
    contextKey: CTX_DEEP,
    narrative:
      'The dog tests the stone with a paw before committing weight to it. ' +
      'Not every step. Just the ones that sound hollow to ears that hear ' +
      'hollow better than yours do.',
    weight: 2,
  },

  // Generic fallback — the waiting
  {
    contextKey: CTX_GENERIC,
    narrative:
      'The dog lies and watches the exit. Ears up. Eyes on the path. ' +
      'It has been doing this long before it met you. It will do it after. ' +
      'Vigilance is what the dog is.',
    weight: 2,
  },
  {
    contextKey: CTX_GENERIC,
    narrative:
      'The dog sits at your feet. Not touching. Close enough that moving would ' +
      'require a decision. A decision the dog has not yet made.',
    weight: 1,
  },
]

export const THE_DOG_JOIN_NARRATION: string[] = [
  'The stray stops being a stray. It falls in at your side with no fanfare ' +
    'and no ceremony — the quiet commitment of something that chooses you ' +
    'despite everything it knows.',
  'The dog sits beside you. It does not ask. It has decided. ' +
  'The notched ear twitches once. It is listening to you now.',
  'The dog comes close enough to touch, though it does not ask for it. ' +
    'It has made a choice. Whatever was holding it back — hunger, habit, ' +
    'the long memory of being hunted — is not holding it back anymore.',
]

export const THE_DOG_LEAVE_NARRATION: Record<string, string[]> = {
  quest_complete: [
    'The dog lies down in the sunlight and does not get up when you do. ' +
      'It has decided staying is enough. You release it, or it releases you. ' +
      'The difference does not matter to the dog.',
    'The dog stops following. It finds a place with good sight lines and ' +
      'settles. "You kept me alive," the posture says. "That will do."',
  ],
  player_choice: [
    'You tell the dog to go. It listens. It walks back the way you came, ' +
      'toward the open country, and does not look back. It was always waiting ' +
      'for permission to be wild again.',
  ],
  death: [
    'The dog goes down without sound. A moment of motion. Then stillness. ' +
      'The notched ear is still. Whatever it was, it is over.',
    'The dog makes a choice in the last moment — putting itself between you ' +
      'and the blow. It dies the way it lived: watching. Deciding. ' +
      'The body goes cool on the stone.',
  ],
  separation: [
    'The dog turns back the way you came. "I cannot follow further," ' +
      'its steady gaze says. "But I was here. That was enough. ' +
      'You do not forget, and neither will I."',
  ],
}

export const THE_DOG_INTRODUCTION: string[] = [
  'A stray watches you from high ground — a shape against scrub, notched ear, ' +
    'ribs visible when it breathes. It does not approach. It does not leave. ' +
    'It measures you the way it measures everything: slowly, without apology.',
  'You offer food. The dog eats at distance. It does not thank you. ' +
    'The next time you cross its territory, it comes closer. The next time ' +
    'after that, it does not leave when you do.',
  'On the third meeting, the dog sits beside you during a rest and does not ' +
    'move when you stand. Somewhere along the way, it decided. You do not ' +
    'remember when. The dog does.',
  'It has no name. You can give it one or not. Dogs outlast the names they ' +
    'are given. What follows you now is the thing itself, under whatever word ' +
    'you choose.',
]

// ============================================================
// MASTER INDEX — maps NPC ID to commentary pool
// ============================================================

export const COMPANION_NARRATION_POOLS: Record<string, CompanionCommentary[]> = {
  howard_bridge_keeper: HOWARD_NARRATION,
  lev: LEV_NARRATION,
  avery_kindling: AVERY_NARRATION,
  patch: PATCH_NARRATION,
  vesper: VESPER_NARRATION,
  marshal_cross: CROSS_NARRATION,
  sparks_radio: SPARKS_NARRATION,
  the_dog: THE_DOG_NARRATION,
}

// ============================================================
// COMPANION INTRODUCTION SCENES
// Added by Rider H (remnant-final-0329).
// Pre-join narration: who they are, why they'd travel with you,
// what they bring. Fires BEFORE the join message.
// ============================================================

export const HOWARD_INTRODUCTION: string[] = [
  'The man at the bridge stands when he sees you. Not a greeting — ' +
    'an assessment. He looks at your pack, your boots, the way you carry ' +
    'your weight. Then he looks at the road ahead.',
  '"I\'ve watched this bridge for four years. Every cable, every bolt." ' +
    'He squints east toward the horizon. "But the signal — someone on the ' +
    'other end needs help. I can\'t get there alone."',
  '"My name is Howard. I built things before the Collapse, and I build things ' +
    'now. Mostly I keep them from falling down." He taps the railing beside him. ' +
    '"My engineering might be useful where you\'re going."',
  '"I\'m not a fighter. I\'m not fast. But I can tell you which walls are load-bearing ' +
    'and which ones will kill you if you lean on them." He picks up his tools. ' +
    '"That\'s kept people alive longer than guns have."',
]

export const LEV_INTRODUCTION: string[] = [
  'The woman behind the desk looks up from a stack of notebooks — dozens of them, ' +
    'cross-referenced, tabbed with colored tape. Her eyes are sharp and tired ' +
    'in equal measure.',
  '"My data is incomplete. Every trip to the field costs time I don\'t have. ' +
    'But you — you go places I can\'t." She closes the notebook she was writing in. ' +
    '"If I come with you, I observe. You protect. The data gets better for both of us."',
  '"I\'m Lev. I\'m a field researcher. Or I was, before the Collapse made the field ' +
    'into everything." She adjusts her glasses. "I document what\'s changing. ' +
    'Something is changing faster than I can write it down."',
  '"I don\'t carry a weapon. I carry information. The Hollow density maps, ' +
    'the contamination patterns, the migration data — that\'s worth more ' +
    'than ammunition if you know how to read it." She does.',
]

export const AVERY_INTRODUCTION: string[] = [
  'She is standing apart from the other Kindling, watching you with an expression ' +
    'that keeps changing its mind. When you get close enough to speak, she ' +
    'straightens her shoulders like she\'s been rehearsing this.',
  '"I\'m Avery. I came to the Kindling because I needed something to believe in." ' +
    'A pause. "I still do. But the answers aren\'t here anymore. They\'re out there. ' +
    'In the places nobody wants to go."',
  '"The elders say the flame will show the way. I\'ve been watching the flame ' +
    'for six months and all it shows me is that it\'s getting dimmer." ' +
    'She looks at the road. "Maybe the way is the road."',
  '"I can pray and I can walk and I can carry my share. I\'m stronger than I look. ' +
    'The Kindling taught me that." She meets your eyes. ' +
    '"Let me come with you. I need to see what\'s out there for myself."',
]

export const PATCH_INTRODUCTION: string[] = [
  'The medic doesn\'t look up when you approach. She\'s counting supplies — ' +
    'bandages, antiseptic, suture kits — with the calm precision of someone ' +
    'who knows exactly how many people each item can save and how many it can\'t.',
  '"I\'m Patch. I was a trauma surgeon before the Collapse. Now I\'m whatever ' +
    'people need me to be." She closes the kit. "Mostly that\'s the same thing, ' +
    'just with worse equipment."',
  '"I\'ve treated four hundred people in this settlement. Saved most of them. ' +
    'Lost enough to know the difference between a wound you can reach ' +
    'and one you can\'t." She stands. "You\'re heading somewhere dangerous. ' +
    'I can tell by how you\'re standing."',
  '"Everyone out there is one bad cut from dead. That\'s not pessimism — ' +
    'that\'s triage. I go where the injuries are going to be, ' +
    'not where they\'ve already happened."',
]

export const VESPER_INTRODUCTION: string[] = [
  'She is sitting in a room that smells like old paper and something older. ' +
    'When she looks at you, there is a quality to her attention that you cannot name. ' +
    'Patience that has outlived the things it was patient about.',
  '"I have been here a long time." The way she says it makes you understand ' +
    'she does not mean this room. "The world is moving toward something. ' +
    'I have seen it move before. This time is different."',
  '"My name is Vesper. I have had other names. They belonged to times ' +
    'that are over." She closes a book that has no title on its spine. ' +
    '"I can help you navigate what is coming. I have navigated worse."',
  '"You are going toward MERIDIAN. I can tell because everyone who is ' +
    'going there walks the same way — slightly faster than they need to, ' +
    'like they\'re afraid they\'ll change their mind." ' +
    'She stands. "I will not change mine."',
]

export const CROSS_INTRODUCTION: string[] = [
  'The marshal is reviewing a duty roster when you find him. His posture ' +
    'is the kind of straight that comes from years of being the person other ' +
    'people look to when things go wrong. He finishes the line he\'s reading ' +
    'before he looks up.',
  '"Marshal Cross. Accord Security Division — what\'s left of it." ' +
    'He folds the roster and tucks it inside his vest. ' +
    '"I\'ve held this settlement together through three crises. ' +
    'The next one is going to come from outside the walls."',
  '"I can\'t protect this place from in here anymore. Whatever is happening ' +
    'to the east is sending things our way that my perimeter wasn\'t built for." ' +
    'He checks his weapon without looking at it. Muscle memory. ' +
    '"I need to go to the source."',
  '"I keep people alive. That\'s the job. Always has been. ' +
    'Right now, keeping them alive means going where you\'re going ' +
    'and making sure what\'s there doesn\'t reach them." ' +
    'He looks at you directly. "Can you handle that?"',
]

export const SPARKS_INTRODUCTION: string[] = [
  'The radio operator is surrounded by equipment — receivers, signal analyzers, ' +
    'a wall of hand-drawn frequency maps. She startles when she sees you, ' +
    'then immediately starts talking.',
  '"Okay, okay — I\'m Sparks. I run the signals desk for the settlement. ' +
    'I\'ve been tracking a broadcast for eight months. MERIDIAN.' +
    ' It\'s not random. It\'s not automated. Someone is transmitting."',
  '"The signal has a pattern. I\'ve mapped it. I know the frequency, ' +
    'the interval, the modulation. What I don\'t know is who\'s sending it ' +
    'and what they\'re trying to say." She gestures at the frequency maps. ' +
    '"I can\'t figure that out from here."',
  '"I\'m not a field person. I know that. But I know the signal better ' +
    'than anyone alive. If you\'re going toward the source, you need someone ' +
    'who can read what it\'s saying when you get there." ' +
    'She\'s already reaching for her portable receiver. "That\'s me."',
  '"Nobody else hears what I hear in that signal. It\'s not just a tone. ' +
    'There\'s a voice underneath. I can almost make out words." ' +
    'Her hands are shaking slightly. "I need to get closer."',
]

// Introduction pool indexed by NPC ID
export const COMPANION_INTRODUCTIONS: Record<string, string[]> = {
  howard_bridge_keeper: HOWARD_INTRODUCTION,
  lev: LEV_INTRODUCTION,
  avery_kindling: AVERY_INTRODUCTION,
  patch: PATCH_INTRODUCTION,
  vesper: VESPER_INTRODUCTION,
  marshal_cross: CROSS_INTRODUCTION,
  sparks_radio: SPARKS_INTRODUCTION,
  the_dog: THE_DOG_INTRODUCTION,
}
