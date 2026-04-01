// ============================================================
// act3_events.ts — Act III World Events (8-12 events)
// Convoy: remnant-narrative-0329 | Rider A
//
// Act III tone: convergence, high stakes, final pressure.
// Factions mobilizing toward MERIDIAN, ground trembling,
// conflicting pleas, Hollow swarm building.
// questGate: 'act2_complete'.
//
// NO imports from lib — pure constant exports (invariant 4.3).
// ============================================================

import type { WorldEvent } from '@/types/convoy-contracts'

export const ACT3_EVENTS: WorldEvent[] = [
  // ── WE-A3-01: The factions mobilize ───────────────────────
  {
    id: 'we_a3_01_factions_mobilize',
    act: 3,
    escalationLevel: 0,
    triggerActionCount: 18,
    questGate: 'act2_complete',
    messagePool: [
      'Every faction with the resources to move is' +
        ' moving. The roads east are packed. All of' +
        ' them claiming different reasons. All of' +
        ' them heading the same direction.',
      'The <keyword>Crossroads</keyword> is nearly' +
        ' empty. People left without their things.' +
        ' The food stores are untouched. They weren\'t' +
        ' leaving for supplies.',
      'You counted six separate faction convoys' +
        ' passing east in twelve hours. <npc>Accord' +
        '</npc>, <npc>Salters</npc>, <npc>Kindling' +
        '</npc>, <npc>Covenant</npc>. Even <npc>Ferals' +
        '</npc>. The same destination draws them all.',
    ],
  },

  // ── WE-A3-02: Ground fracturing ───────────────────────────
  {
    id: 'we_a3_02_ground_fracture',
    act: 3,
    escalationLevel: 1,
    triggerActionCount: 19,
    questGate: 'act2_complete',
    messagePool: [
      'Fissures opened in the highway east of <keyword>' +
        'the Scar</keyword>. Not earthquake damage —' +
        ' too precise, too straight. As if something' +
        ' beneath is trying to get out.',
      'The rumbling is constant now. It hasn\'t stopped' +
        ' in two days. You feel it in your teeth when' +
        ' you try to sleep.',
      'A runner sent back from the eastern road: the' +
        ' fissures have light in them. Not fire.' +
        ' Something colder. She drew what she saw.' +
        ' You recognize the symbol.',
    ],
  },

  // ── WE-A3-03: Conflicting faction pleas ───────────────────
  {
    id: 'we_a3_03_faction_pleas',
    act: 3,
    escalationLevel: 1,
    triggerActionCount: 20,
    questGate: 'act2_complete',
    messagePool: [
      'An <npc>Accord</npc> captain and a <npc>Salter' +
        '</npc> elder arrived at the same hour, each' +
        ' with the same request: reach MERIDIAN first' +
        ' and use it for their people. Each believes' +
        ' the other will destroy the world with it.',
      'Three messages in one morning: a <npc>Kindling' +
        '</npc> prayer leader, a <npc>Covenant</npc>' +
        ' elder, and a <npc>Lucid</npc> operative.' +
        ' All asking you to choose. None of them' +
        ' agreeing on what the choice is.',
      'The messages have stopped. The factions that' +
        ' were sending runners have gone quiet. You' +
        ' understand why: they\'ve stopped asking.' +
        ' They\'re going themselves.',
    ],
  },

  // ── WE-A3-04: Red Court final move (gated, low rep) ───────
  {
    id: 'we_a3_04_red_court_final',
    act: 3,
    escalationLevel: 2,
    triggerActionCount: 21,
    questGate: 'act2_complete',
    factionCheck: {
      faction: 'red_court',
      maxRep: 0,
    },
    messagePool: [
      'The <npc>Red Court</npc> stopped pretending.' +
        ' They have a column on the eastern road:' +
        ' armed, marked, unhurried. They know they' +
        ' don\'t need to hide anymore.',
      'The <npc>Red Court</npc> sent you a single' +
        ' item wrapped in cloth: a key, obviously' +
        ' old, with no explanation. The message' +
        ' attached: "You\'ll understand when you' +
        ' see the door."',
      'A <npc>Red Court</npc> herald announced at' +
        ' <keyword>Crossroads</keyword> that all debts' +
        ' are forgiven. No payment required. Everyone' +
        ' understood what that meant: they no longer' +
        ' need leverage.',
    ],
  },

  // ── WE-A3-05: Hollow swarm building ───────────────────────
  {
    id: 'we_a3_05_swarm_building',
    act: 3,
    escalationLevel: 2,
    triggerActionCount: 22,
    questGate: 'act2_complete',
    messagePool: [
      'The hollow are moving in masses now. Not' +
        ' scattered packs — a continuous stream from' +
        ' the north and west, all converging east.' +
        ' The same direction as the factions.',
      'A <npc>Salter</npc> hunter counted over two' +
        ' hundred hollow in a single column. They' +
        ' weren\'t attacking anything. Just moving.' +
        ' Purposeful. Guided.',
      'The <keyword>hive mothers</keyword> are moving' +
        ' in the open for the first time anyone' +
        ' can remember. Three of them, side by side,' +
        ' unhurried. The scouts watching them won\'t' +
        ' get any closer.',
    ],
  },

  // ── WE-A3-06: MERIDIAN signal intensifies ─────────────────
  {
    id: 'we_a3_06_meridian_signal',
    act: 3,
    escalationLevel: 2,
    triggerActionCount: 23,
    questGate: 'act2_complete',
    messagePool: [
      'The signal is continuous now. Every radio,' +
        ' every receiver, every piece of pre-Collapse' +
        ' electronics within range: MERIDIAN. Looping.' +
        ' Clear.',
      'The signal has changed. It\'s not a tone' +
        ' anymore. It\'s a countdown. Nobody with' +
        ' the equipment to hear it is sleeping.',
      'The signal from <keyword>MERIDIAN</keyword>' +
        ' is now audible without equipment. A low' +
        ' harmonic that you feel before you hear.' +
        ' People are stopping mid-conversation to' +
        ' listen.',
    ],
  },

  // ── WE-A3-07: NPC deaths reported ─────────────────────────
  {
    id: 'we_a3_07_npc_deaths',
    act: 3,
    escalationLevel: 2,
    triggerActionCount: 19,
    questGate: 'act2_complete',
    messagePool: [
      'The runner who brought word of the <keyword>' +
        'Salt Creek</keyword> breach six weeks ago is' +
        ' dead. Found on the eastern road. No wounds.' +
        ' He was heading toward MERIDIAN like everyone' +
        ' else.',
      '<npc>Mira Voss</npc>, who ran the medic post' +
        ' at <keyword>Crossroads</keyword>, closed' +
        ' the doors three days ago. Nobody has' +
        ' seen her since.',
      'The <npc>Accord</npc> captain you spoke with' +
        ' early on — his name is in the missing' +
        ' persons log. He left with his unit. Nobody' +
        ' came back.',
    ],
  },

  // ── WE-A3-08: Lucid final warning (faction-gated) ─────────
  {
    id: 'we_a3_08_lucid_warning',
    act: 3,
    escalationLevel: 2,
    triggerActionCount: 20,
    questGate: 'act2_complete',
    factionCheck: {
      faction: 'lucid',
      minRep: 1,
    },
    messagePool: [
      'The <npc>Lucid</npc> contact left a final' +
        ' message: "MERIDIAN has four functions.' +
        ' Three of them end the world. You know' +
        ' which ones to avoid. If you don\'t know,' +
        ' do not touch anything."',
      'A <npc>Lucid</npc> operative stood with you' +
        ' in silence for two minutes then said:' +
        ' "We spent twenty years trying to find' +
        ' MERIDIAN. We found it. We walked away.' +
        ' Think about why." Then she was gone.',
      'The <npc>Lucid</npc> network has gone silent.' +
        ' No dead drops, no signals. Their last' +
        ' message was five words: "You\'re on your' +
        ' own now."',
    ],
  },

  // ── WE-A3-09: Sky changes ─────────────────────────────────
  {
    id: 'we_a3_09_sky_changes',
    act: 3,
    escalationLevel: 3,
    triggerActionCount: 24,
    questGate: 'act2_complete',
    messagePool: [
      'The sky east of the <keyword>Scar</keyword> is' +
        ' wrong. Not weather — the light. It bends.' +
        ' Everyone who sees it stops walking.',
      'At noon, the sun is in the wrong place by' +
        ' eleven degrees. The <npc>Reclaimers</npc>' +
        ' are insisting it\'s an atmospheric effect.' +
        ' No one else believes them.',
      'Stars visible in daylight now over the eastern' +
        ' horizon. Not faint — bright. The <npc>' +
        'Covenant</npc> elder said: "The door is' +
        ' open. It has been opening for some time."',
    ],
  },

  // ── WE-A3-10: Last settlement radio ───────────────────────
  {
    id: 'we_a3_10_last_radio',
    act: 3,
    escalationLevel: 3,
    triggerActionCount: 25,
    questGate: 'act2_complete',
    messagePool: [
      'The <keyword>Crossroads</keyword> radio operator' +
        ' broadcast on every channel: "Anyone still' +
        ' out there — we\'re evacuating east. Come' +
        ' if you can. Last broadcast." Then static.',
      'The emergency channel picked up one voice for' +
        ' thirty seconds: a child, calm, saying she' +
        ' doesn\'t know where her parents are but' +
        ' the light to the east is very pretty.' +
        ' The channel went dead.',
      'Final radio contact from <keyword>Salt Creek' +
        '</keyword>: one word, repeated fifteen times.' +
        ' <keyword>MERIDIAN</keyword>. Then nothing.',
    ],
  },

  // ── WE-A3-11: The Hollow stop ─────────────────────────────
  {
    id: 'we_a3_11_hollow_stop',
    act: 3,
    escalationLevel: 3,
    triggerActionCount: 25,
    questGate: 'act2_complete',
    messagePool: [
      'The hollow stopped moving. All of them.' +
        ' Everywhere. Just stopped, mid-step, facing' +
        ' east. Like a held breath.',
      'A <npc>Salter</npc> hunter radioed in from' +
        ' the field: the hollow around him froze' +
        ' twenty minutes ago. He\'s been standing' +
        ' among them. They don\'t see him anymore.' +
        ' He doesn\'t know how long it will last.',
      'The hollow swarm on the eastern road has' +
        ' stopped. Hundreds of them, unmoving,' +
        ' oriented east. Waiting. Something is' +
        ' about to happen and even the hollow' +
        ' can feel it.',
    ],
  },

  // ── WE-A3-12: Salter last stand (faction-gated, allied) ────
  {
    id: 'we_a3_12_salter_last_stand',
    act: 3,
    escalationLevel: 2,
    triggerActionCount: 22,
    questGate: 'act2_complete',
    factionCheck: {
      faction: 'salters',
      minRep: 1,
    },
    messagePool: [
      'A <npc>Salter</npc> patrol leader found you. She' +
        ' looks like she hasn\'t slept in three days.' +
        ' "We\'re holding the water stations for as long' +
        ' as we can. After that—" She stops. There is' +
        ' no after that.',
      'The <npc>Salters</npc> have pulled their perimeter' +
        ' back to the main compound. Everything else' +
        ' is abandoned. The flags are down. The wells' +
        ' are sealed.',
      'A <npc>Salter</npc> elder pressed a sealed' +
        ' canteen into your hands. "The last clean' +
        ' water from our deepest well. Whatever' +
        ' you\'re doing — finish it."',
    ],
  },

  // ── WE-A3-13: Accord martial law (faction-gated) ─────────
  {
    id: 'we_a3_13_accord_martial',
    act: 3,
    escalationLevel: 2,
    triggerActionCount: 20,
    questGate: 'act2_complete',
    factionCheck: {
      faction: 'accord',
      minRep: 0,
    },
    messagePool: [
      'The <npc>Accord</npc> declared martial law. Not at' +
        ' <keyword>Crossroads</keyword> — there\'s nobody' +
        ' left to govern. At themselves. Every soldier' +
        ' accountable to the last standing officer.',
      'An <npc>Accord</npc> captain stopped you on the road.' +
        ' "We\'re done pretending this is manageable.' +
        ' I\'m taking my unit east. You should come.' +
        ' Or don\'t. It doesn\'t matter who goes first."',
      'The <npc>Accord</npc> radio channel is broadcasting' +
        ' coordinates on repeat. No explanation. Just' +
        ' numbers. You recognize the bearing:' +
        ' <keyword>MERIDIAN</keyword>.',
    ],
  },

  // ── WE-A3-14: Kindling pilgrimage (faction-gated, allied)
  {
    id: 'we_a3_14_kindling_pilgrimage',
    act: 3,
    escalationLevel: 2,
    triggerActionCount: 23,
    questGate: 'act2_complete',
    factionCheck: {
      faction: 'kindling',
      minRep: 1,
    },
    messagePool: [
      'The <npc>Kindling</npc> are walking east in a' +
        ' single file, singing. Not the hymns you know.' +
        ' Something older. Something that sounds like' +
        ' it was written for this specific walk.',
      'A <npc>Kindling</npc> elder met your eyes across' +
        ' the road and smiled. Not a frightened smile.' +
        ' The smile of someone who has made peace with' +
        ' what they cannot change and found a reason' +
        ' to keep walking anyway.',
      'The sacred fire at <keyword>the Ember</keyword>' +
        ' was extinguished deliberately. The <npc>' +
        'Kindling</npc> carried the coals east in' +
        ' a covered box. "We bring the fire to where' +
        ' it needs to burn."',
    ],
  },

  // ── WE-A3-15: Covenant final prayer ───────────────────────
  {
    id: 'we_a3_15_covenant_prayer',
    act: 3,
    escalationLevel: 3,
    triggerActionCount: 21,
    questGate: 'act2_complete',
    messagePool: [
      'The <npc>Covenant of Dusk</npc> began their' +
        ' final prayer at sundown. You can hear it' +
        ' from a mile away — not loud, just' +
        ' impossibly clear. Carrying on still air.',
      'A <npc>Covenant</npc> elder left their column' +
        ' and walked toward you with purpose. She' +
        ' took your hand, said "Thank you for' +
        ' surviving this far," and walked back to' +
        ' her people.',
      'The <npc>Covenant</npc> prayer has stopped.' +
        ' The silence after forty voices ceasing' +
        ' at once is its own kind of sound.' +
        ' You count: three seconds. Five.' +
        ' The ground begins to hum.',
    ],
  },
]
