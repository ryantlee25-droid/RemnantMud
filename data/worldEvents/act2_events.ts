// ============================================================
// act2_events.ts — Act II World Events (10-15 events)
// Convoy: remnant-narrative-0329 | Rider A
//
// Act II tone: faction tension, world decay, escalating dread.
// Hollow closer to settlements, urgent NPC messages, zone
// decay, faction-gated events.
// Triggers staggered; questGate: 'act1_complete'.
//
// NO imports from lib — pure constant exports (invariant 4.3).
// ============================================================

import type { WorldEvent } from '@/types/convoy-contracts'

export const ACT2_EVENTS: WorldEvent[] = [
  // ── WE-A2-01: Salter compound breach ──────────────────────
  {
    id: 'we_a2_01_salter_breach',
    act: 2,
    escalationLevel: 0,
    triggerActionCount: 18,
    questGate: 'act1_complete',
    messagePool: [
      'The outer wall at <keyword>Salt Creek Station</keyword>' +
        ' has a section down. Not collapsed — pulled apart.' +
        ' From inside.',
      'A <npc>Salter</npc> runner arrived at <keyword>' +
        'Crossroads</keyword> with news: they lost the' +
        ' eastern storage block. Won\'t say how.',
      'Three <npc>Salters</npc> were found half a mile' +
        ' from their compound at dawn, alive, with no' +
        ' memory of the night. Their water rations were' +
        ' gone.',
    ],
  },

  // ── WE-A2-02: Accord crackdown ────────────────────────────
  {
    id: 'we_a2_02_accord_crackdown',
    act: 2,
    escalationLevel: 0,
    triggerActionCount: 19,
    questGate: 'act1_complete',
    factionCheck: {
      faction: 'accord',
      maxRep: 0,
    },
    messagePool: [
      'The <npc>Accord</npc> posted new checkpoints on both' +
        ' highway approaches. Toll: one round per person.' +
        ' Non-negotiable. No exceptions.',
      'An <npc>Accord</npc> patrol arrested a <npc>Drifter' +
        '</npc> at the north gate. Reason given: "resource' +
        ' hoarding." Her pack had three cans and a jacket.',
      'The <npc>Accord</npc> issued a decree: all scavenged' +
        ' electronics must be surrendered for "assessment."' +
        ' Nobody believes they\'ll be returned.',
    ],
  },

  // ── WE-A2-03: Hollow at the gates ─────────────────────────
  {
    id: 'we_a2_03_hollow_gates',
    act: 2,
    escalationLevel: 1,
    triggerActionCount: 20,
    questGate: 'act1_complete',
    messagePool: [
      'A <keyword>shuffler</keyword> made it to the' +
        ' <keyword>Crossroads</keyword> perimeter wire before' +
        ' the sentry caught it. Broad daylight. No warning.',
      'The <keyword>stalkers</keyword> have been seen' +
        ' near <keyword>Ember Gate</keyword> three nights' +
        ' running. They\'re not hunting. They\'re watching.',
      'A <keyword>screamer</keyword> hit the <keyword>' +
        'River Road</keyword> at the bridge checkpoint.' +
        ' Five people heard it. Two of them haven\'t' +
        ' spoken since.',
    ],
  },

  // ── WE-A2-04: Kindling schism ─────────────────────────────
  {
    id: 'we_a2_04_kindling_schism',
    act: 2,
    escalationLevel: 1,
    triggerActionCount: 21,
    questGate: 'act1_complete',
    messagePool: [
      'The <npc>Kindling</npc> split publicly at the' +
        ' <keyword>Ember</keyword> mission: half want to' +
        ' fortify and hold, half want to move the flock' +
        ' east to higher ground.',
      'A <npc>Kindling</npc> elder was found at the' +
        ' gates of <keyword>Crossroads</keyword> at' +
        ' dawn, alone, with no gear. She says she was' +
        ' "asked to leave."',
      'The <npc>Kindling</npc> mission bell rang at' +
        ' midnight and didn\'t stop until dawn. Nobody' +
        ' was pulling the rope when they checked.',
    ],
  },

  // ── WE-A2-05: Reclaimer discovery (faction-gated, allied)
  {
    id: 'we_a2_05_reclaimer_find',
    act: 2,
    escalationLevel: 1,
    triggerActionCount: 22,
    questGate: 'act1_complete',
    factionCheck: {
      faction: 'reclaimers',
      minRep: 1,
    },
    messagePool: [
      'A <npc>Reclaimer</npc> cell sent word: they found' +
        ' a pre-Collapse lab under <keyword>the Stacks' +
        '</keyword>. Sealed unit, still pressurized.' +
        ' They\'re being careful about who they tell.',
      'The <npc>Reclaimers</npc> are running night shifts' +
        ' at something in <keyword>the Deep</keyword>.' +
        ' The sound of tools echoes up through the' +
        ' water at low tide.',
      'A <npc>Reclaimer</npc> engineer passed you a' +
        ' paper: coordinates, a symbol, no words.' +
        ' She didn\'t stop walking.',
    ],
  },

  // ── WE-A2-06: Red Court expansion ─────────────────────────
  {
    id: 'we_a2_06_red_court_expand',
    act: 2,
    escalationLevel: 1,
    triggerActionCount: 23,
    questGate: 'act1_complete',
    factionCheck: {
      faction: 'red_court',
      maxRep: 0,
    },
    messagePool: [
      'The <npc>Red Court</npc> opened a second house in' +
        ' <keyword>the Pens</keyword>. The old residents' +
        ' moved out the same week. Nobody asked them to.',
      'A <npc>Red Court</npc> emissary arrived at' +
        ' <keyword>Crossroads</keyword> with gifts and' +
        ' good manners. She left with three signed' +
        ' agreements and two people who\'d been' +
        ' asking too many questions.',
      'The red circle marks are on four buildings in' +
        ' <keyword>the Pens</keyword> now. The families' +
        ' inside them are very polite and very afraid.',
    ],
  },

  // ── WE-A2-07: Zone decay — the Dust ───────────────────────
  {
    id: 'we_a2_07_dust_decay',
    act: 2,
    escalationLevel: 1,
    triggerActionCount: 19,
    questGate: 'act1_complete',
    messagePool: [
      'The dead zone in <keyword>the Dust</keyword> is' +
        ' expanding. The surveyors\' markers from last' +
        ' month are now well inside it.',
      'A <npc>Drifter</npc> who ran supply routes through' +
        ' <keyword>the Dust</keyword> came back with her' +
        ' eyes bloodshot and her compass spinning.' +
        ' She\'s resting. Won\'t travel that way again.',
      'Scouts report the wells in <keyword>the Dust' +
        '</keyword> are going dry. Not drying up — dry.' +
        ' Like something is drawing the water down.',
    ],
  },

  // ── WE-A2-08: Covenant of Dusk warning ────────────────────
  {
    id: 'we_a2_08_covenant_warning',
    act: 2,
    escalationLevel: 2,
    triggerActionCount: 24,
    questGate: 'act1_complete',
    messagePool: [
      'A <npc>Covenant of Dusk</npc> pilgrim posted a' +
        ' message at every waypoint between here and' +
        ' the valley: "Do not approach MERIDIAN before' +
        ' the third moon." Nobody knows what that means.',
      'The <npc>Covenant</npc> sealed their inner' +
        ' sanctum. No outsiders. Their outer emissary' +
        ' said only: "The preparation is entering its' +
        ' final stage."',
      'A <npc>Covenant</npc> elder sat with you at the' +
        ' fire and said nothing for twenty minutes.' +
        ' Then: "Whatever you find there, do not' +
        ' take it for yourself." Then she walked away.',
    ],
  },

  // ── WE-A2-09: NPC urgent message ──────────────────────────
  {
    id: 'we_a2_09_npc_urgent',
    act: 2,
    escalationLevel: 1,
    triggerActionCount: 21,
    questGate: 'act1_complete',
    messagePool: [
      'Someone left a message at the <keyword>Crossroads' +
        '</keyword> board addressed to you. It says:' +
        ' "They know you\'re asking. Stop asking."' +
        ' No signature.',
      'The <keyword>Crossroads</keyword> runner brought' +
        ' a sealed note. Inside: coordinates and one' +
        ' word. <keyword>TONIGHT</keyword>.',
      'A <npc>Drifter</npc> kid found you specifically' +
        ' to deliver a message: "The person who sent' +
        ' me said to tell you: it\'s not a building.' +
        ' It\'s a door."',
    ],
  },

  // ── WE-A2-10: Hollow pack intelligence ────────────────────
  {
    id: 'we_a2_10_hollow_pack',
    act: 2,
    escalationLevel: 2,
    triggerActionCount: 25,
    questGate: 'act1_complete',
    messagePool: [
      'The <npc>Salter</npc> hunters are reporting' +
        ' coordinated behavior. Two packs of <keyword>' +
        'stalkers</keyword> driving prey toward a third' +
        ' group waiting downwind. That\'s not instinct.',
      'A <npc>Reclaimer</npc> biologist is using the' +
        ' word "organized." The hollow she observed' +
        ' responded to a signal — something in a range' +
        ' humans can\'t hear.',
      'The <keyword>brute</keyword> carcasses they\'ve' +
        ' been finding: not territorial kills.' +
        ' One precise wound, in the same location each time.' +
        ' Nothing feeds on them afterward.',
    ],
  },

  // ── WE-A2-11: Lucid emergence ─────────────────────────────
  {
    id: 'we_a2_11_lucid_emerge',
    act: 2,
    escalationLevel: 1,
    triggerActionCount: 22,
    questGate: 'act1_complete',
    factionCheck: {
      faction: 'lucid',
      minRep: 0,
    },
    messagePool: [
      'The <npc>Lucid</npc> have surfaced again after' +
        ' three weeks of silence. They\'re asking' +
        ' questions about MERIDIAN. Not offering' +
        ' anything in exchange.',
      'A <npc>Lucid</npc> contact left a package at' +
        ' your usual drop. Inside: a schematic for' +
        ' something you don\'t recognize. And a note:' +
        ' "You\'ll need this."',
      'Two <npc>Lucid</npc> operatives were spotted' +
        ' near <keyword>the Scar</keyword>. They saw' +
        ' you seeing them and kept walking. No' +
        ' acknowledgment.',
    ],
  },

  // ── WE-A2-12: Ferals approach settlements ─────────────────
  {
    id: 'we_a2_12_ferals_approach',
    act: 2,
    escalationLevel: 2,
    triggerActionCount: 25,
    questGate: 'act1_complete',
    messagePool: [
      'The <npc>Ferals</npc> have been seen within two' +
        ' miles of <keyword>Crossroads</keyword>. Not' +
        ' raiding — watching. That\'s worse.',
      'A <npc>Feral</npc> came to the gate alone and' +
        ' asked to speak with whoever is "in charge' +
        ' of the light." Nobody knew what that meant.' +
        ' She left before anyone could ask.',
      'Feral camps marked on the ridge above <keyword>' +
        'River Road</keyword>: cold fires, scavenged' +
        ' observation posts. They\'re not attacking.' +
        ' They\'re counting you.',
    ],
  },

  // ── WE-A2-13: Deep rumble ─────────────────────────────────
  {
    id: 'we_a2_13_deep_rumble',
    act: 2,
    escalationLevel: 2,
    triggerActionCount: 24,
    questGate: 'act1_complete',
    messagePool: [
      'The ground shook at midday. Not an earthquake —' +
        ' too localized, too brief. It started at a' +
        ' specific point southeast of the highway.' +
        ' Then stopped.',
      'Three separate groups reported a rumble underfoot' +
        ' at the same hour. The <npc>Accord</npc> official' +
        ' called it seismic. A <npc>Reclaimer</npc>' +
        ' engineer said nothing and started packing' +
        ' for the field.',
      'The children near <keyword>the Ember</keyword>' +
        ' say the ground hums at night. They\'ve been' +
        ' saying it for a week. Their parents assumed' +
        ' it was a bad dream. It isn\'t.',
    ],
  },

  // ── WE-A2-14: Drifter road sign changed ───────────────────
  {
    id: 'we_a2_14_drifter_sign',
    act: 2,
    escalationLevel: 1,
    triggerActionCount: 20,
    questGate: 'act1_complete',
    factionCheck: {
      faction: 'drifters',
      minRep: 1,
    },
    messagePool: [
      'The <npc>Drifter</npc> road sign at <keyword>' +
        'mile 47</keyword> was changed overnight.' +
        ' The safe route symbol is scratched out.' +
        ' New symbol: danger, but not hollow. Something' +
        ' else.',
      'A <npc>Drifter</npc> courier came through faster' +
        ' than usual, barely stopping. Before she left:' +
        ' "Don\'t take the north pass. Don\'t ask why."',
      'The <npc>Drifter</npc> circuit has gone dark on' +
        ' the eastern leg. Three runners should have' +
        ' come through in the last week. None.',
    ],
  },

  // ── WE-A2-15: Covenant prophecy public ────────────────────
  {
    id: 'we_a2_15_covenant_prophecy',
    act: 2,
    escalationLevel: 2,
    triggerActionCount: 25,
    questGate: 'act1_complete',
    messagePool: [
      'The <npc>Covenant of Dusk</npc> elder spoke' +
        ' publicly for the first time in months:' +
        ' "The Collapse was not the end. It was a' +
        ' door. MERIDIAN is the key. And someone is' +
        ' about to use it."',
      'A printed sheet — crudely typed, widely' +
        ' distributed — quotes a <npc>Covenant' +
        '</npc> prophecy: "Before the reckoning,' +
        ' the world will hold its breath for three' +
        ' days." Today is day one.',
      'The <npc>Covenant</npc> elder\'s prophecy is' +
        ' being debated at every fire in <keyword>' +
        'Crossroads</keyword>. Nobody is laughing.' +
        ' That\'s the part that\'s unsettling.',
    ],
  },
]
