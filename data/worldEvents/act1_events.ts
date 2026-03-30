// ============================================================
// act1_events.ts — Act I World Events (8-12 events)
// Convoy: remnant-narrative-0329 | Rider A
//
// Act I tone: distant, atmospheric, world-building.
// Hollow migration, caravan news, environmental shifts,
// MERIDIAN rumors. Dread through specificity.
// Triggers staggered from 15–20 actions.
//
// NO imports from lib — pure constant exports (invariant 4.3).
// ============================================================

import type { WorldEvent } from '@/types/convoy-contracts'

export const ACT1_EVENTS: WorldEvent[] = [
  // ── WE-A1-01: The missing gate guard ──────────────────────
  {
    id: 'we_a1_01_missing_guard',
    act: 1,
    escalationLevel: 0,
    triggerActionCount: 15,
    messagePool: [
      'Word from the north gate: <npc>Harlan Voss</npc> hasn\'t' +
        ' reported in. Third one this week.',
      'A runner out of <keyword>Crossroads</keyword>: guard' +
        ' rotation is short again. Nobody\'s saying why.',
      'Two <npc>Accord</npc> soldiers: "Voss still hasn\'t' +
        ' turned up. Nobody\'s looking anymore."',
    ],
  },

  // ── WE-A1-02: Hollow migration pattern ────────────────────
  {
    id: 'we_a1_02_hollow_migration',
    act: 1,
    escalationLevel: 0,
    triggerActionCount: 16,
    messagePool: [
      'The shufflers are moving east. A <npc>Salter</npc> outrider' +
        ' counted forty of them crossing the highway at dawn.',
      'Tracks in the dust near <keyword>mile marker 7</keyword>:' +
        ' dragging gait, clusters of four and five. They\'re not' +
        ' wandering. They\'re moving toward something.',
      'A boy at the <keyword>Crossroads</keyword> gate says he' +
        ' saw lights in the hills last night. Moving in a line.' +
        ' Doesn\'t know what made them.',
    ],
  },

  // ── WE-A1-03: Caravan gone silent ─────────────────────────
  {
    id: 'we_a1_03_caravan_silent',
    act: 1,
    escalationLevel: 0,
    triggerActionCount: 17,
    messagePool: [
      'The <keyword>River Road</keyword> caravan is four days' +
        ' late. Eight people, two carts. No signal fire, no' +
        ' runner.',
      'A <npc>Drifter</npc> came through alone: the others' +
        ' stopped to investigate something in the road. She' +
        ' kept walking. She won\'t say what it was.',
      'The trade post at <keyword>Ember Gate</keyword> is short' +
        ' its supply run. The merchants are pretending they' +
        ' aren\'t worried.',
    ],
  },

  // ── WE-A1-04: Water source contamination ──────────────────
  {
    id: 'we_a1_04_water_source',
    act: 1,
    escalationLevel: 0,
    triggerActionCount: 18,
    messagePool: [
      'The well at <keyword>Salt Creek Station</keyword> is' +
        ' putting up water the color of old rust. The <npc>' +
        'Salters</npc> aren\'t letting anyone near it.',
      'A healer from the <npc>Covenant</npc> posted a warning' +
        ' at the crossroads: don\'t drink from the creek below' +
        ' <keyword>the Breaks</keyword>. She didn\'t explain.',
      'Three <npc>Drifters</npc> checked in sick at the' +
        ' <keyword>Crossroads</keyword> medic post. Same symptoms.' +
        ' All three drank from the same stream two days ago.',
    ],
  },

  // ── WE-A1-05: MERIDIAN structure sighting ─────────────────
  {
    id: 'we_a1_05_meridian_rumor',
    act: 1,
    escalationLevel: 1,
    triggerActionCount: 19,
    messagePool: [
      'A <npc>Reclaimer</npc> came down from the high desert' +
        ' raving about a structure she found. Clean lines.' +
        ' No rust. She says it was warm to the touch.',
      'Someone nailed a hand-drawn map to the <keyword>' +
        'Crossroads</keyword> board overnight. It shows a' +
        ' building no one recognizes, marked: <keyword>' +
        'MERIDIAN</keyword>. The map is gone by morning.',
      'An old <npc>Drifter</npc> in the corner of the' +
        ' fire-ring: "I\'ve seen that symbol before. Stamped' +
        ' on a bunker door in \'43. Sealed from the inside."',
    ],
  },

  // ── WE-A1-06: Settlement abandonment ──────────────────────
  {
    id: 'we_a1_06_settlement_abandoned',
    act: 1,
    escalationLevel: 1,
    triggerActionCount: 20,
    messagePool: [
      'The homestead at <keyword>Copper Flats</keyword> is' +
        ' empty. Fire still burning in the pit. Food on the' +
        ' table. Eight people. Gone.',
      'A <npc>Kindling</npc> patrol found a settlement' +
        ' southwest of the <keyword>Dust</keyword>: no bodies,' +
        ' no tracks, no signs of struggle. Just empty.',
      'The goat pen outside <keyword>Ember Vale</keyword> is' +
        ' untouched. The goats are gone too. A <npc>Salter' +
        '</npc> scout said the fences weren\'t broken from' +
        ' outside.',
    ],
  },

  // ── WE-A1-07: Night sounds report ─────────────────────────
  {
    id: 'we_a1_07_night_sounds',
    act: 1,
    escalationLevel: 0,
    triggerActionCount: 15,
    messagePool: [
      'A guard posted on the <keyword>Crossroads</keyword>' +
        ' south wall says the nights have gotten louder. Not' +
        ' wind. Not animals. Lower. Underneath.',
      'Two <npc>Accord</npc> sentries swear they heard' +
        ' something moving beneath the old highway at' +
        ' three in the morning. They dropped a stone down a' +
        ' crack and didn\'t hear it land.',
      'The medic keeps a log. Third night running: patients' +
        ' waking at the same hour, same complaint — a low' +
        ' vibration they felt before they heard.',
    ],
  },

  // ── WE-A1-08: Faction supply tension ──────────────────────
  {
    id: 'we_a1_08_supply_tension',
    act: 1,
    escalationLevel: 1,
    triggerActionCount: 19,
    messagePool: [
      'The <npc>Salters</npc> cut their trade quota with the' +
        ' <npc>Accord</npc> by half. No explanation offered.' +
        ' The <npc>Accord</npc> quartermaster is not happy.',
      'A <npc>Kindling</npc> elder closed the mission at' +
        ' <keyword>the Ember</keyword> to outsiders. Supplies' +
        ' only. No explanations.',
      'Someone broke into the <npc>Reclaimers</npc> parts' +
        ' cache near <keyword>the Stacks</keyword>. Nothing' +
        ' taken — just the inventory log. All of it.',
    ],
  },

  // ── WE-A1-09: Environmental decay ─────────────────────────
  {
    id: 'we_a1_09_env_decay',
    act: 1,
    escalationLevel: 0,
    triggerActionCount: 16,
    messagePool: [
      'The <keyword>pine sea</keyword> to the north is' +
        ' shedding needles in summer. A wide band of dead' +
        ' trees, half a mile across. No fire damage. Just' +
        ' dead.',
      'The creek is running backward through <keyword>' +
        'Salt Creek Canyon</keyword>. Barely — an inch' +
        ' of current reversing itself at low tide. A' +
        ' <npc>Salter</npc> hydrologist has gone very quiet.',
      'Ash keeps falling. No fire visible. No smoke on' +
        ' the horizon. The ash is fine and gray and it' +
        ' keeps coming.',
    ],
  },

  // ── WE-A1-10: Hollow behavior change ──────────────────────
  {
    id: 'we_a1_10_hollow_behavior',
    act: 1,
    escalationLevel: 1,
    triggerActionCount: 18,
    messagePool: [
      'A <npc>Salter</npc> hunter came back reporting' +
        ' something unusual: a <keyword>shuffler</keyword>' +
        ' turned away from easy prey. Walked right past a' +
        ' bound man and kept moving.',
      'The <keyword>stalkers</keyword> near <keyword>' +
        'Duskhollow</keyword> have stopped hunting in the' +
        ' afternoon. They\'re nocturnal now. Something' +
        ' changed their schedule.',
      'A <npc>Reclaimer</npc> biologist has a theory:' +
        ' the Hollow aren\'t eating less. They\'re' +
        ' conserving. Like they\'re waiting for something.',
    ],
  },

  // ── WE-A1-11: Red Court rumor (faction-gated, low rep only)
  {
    id: 'we_a1_11_red_court_rumor',
    act: 1,
    escalationLevel: 1,
    triggerActionCount: 17,
    factionCheck: {
      faction: 'red_court',
      maxRep: 1,
    },
    messagePool: [
      'Word travels quietly: the <npc>Red Court</npc> has' +
        ' started marking doors again. Red circle, black' +
        ' center. The people whose doors get marked' +
        ' disappear within three days.',
      'A <npc>Drifter</npc> whispers: the <npc>Red Court' +
        '</npc> sent a collector to <keyword>the Pens' +
        '</keyword>. No weapons, no threats. Just a list' +
        ' of names and a smile.',
      'Someone found a <npc>Red Court</npc> tithe record.' +
        ' It isn\'t goods they\'re collecting. It\'s blood' +
        ' type. Everyone on the list with Type O.',
    ],
  },

  // ── WE-A1-12: Accord patrol increase (faction-gated, allied)
  {
    id: 'we_a1_12_accord_patrol',
    act: 1,
    escalationLevel: 0,
    triggerActionCount: 17,
    factionCheck: {
      faction: 'accord',
      minRep: 1,
    },
    messagePool: [
      'An <npc>Accord</npc> lieutenant pulls you aside at the' +
        ' checkpoint. "We\'re doubling patrols on the eastern' +
        ' stretch. If you see anything, you tell us first."' +
        ' It sounds like a request. It isn\'t.',
      'The <npc>Accord</npc> have started marking safe houses' +
        ' along the highway. Small flags, barely visible.' +
        ' A soldier nods at you as he hammers one in.' +
        ' "Friends of the Accord know where to look."',
      'An <npc>Accord</npc> runner delivers a folded map' +
        ' with patrol schedules marked in pencil.' +
        ' "Compliments of the Marshal," she says.' +
        ' "Don\'t share it."',
    ],
  },

  // ── WE-A1-13: Salter water warning (faction-gated, allied)
  {
    id: 'we_a1_13_salter_water',
    act: 1,
    escalationLevel: 0,
    triggerActionCount: 18,
    factionCheck: {
      faction: 'salters',
      minRep: 1,
    },
    messagePool: [
      'A <npc>Salter</npc> elder takes your arm at the well.' +
        ' "Don\'t drink from anything south of the ridge.' +
        ' We\'re testing it. The results are—" She stops.' +
        ' "Don\'t drink from it."',
      'The <npc>Salters</npc> have started distributing' +
        ' purification tablets. Not to everyone.' +
        ' To the people they trust. You got three.',
      'A <npc>Salter</npc> hydrologist corners you near' +
        ' the cistern. "The aquifer readings are wrong.' +
        ' Not contaminated-wrong. Wrong-wrong. The water' +
        ' table dropped six feet in a week."',
    ],
  },

  // ── WE-A1-14: Kindling flame report (faction-gated, allied)
  {
    id: 'we_a1_14_kindling_flame',
    act: 1,
    escalationLevel: 1,
    triggerActionCount: 19,
    factionCheck: {
      faction: 'kindling',
      minRep: 1,
    },
    messagePool: [
      'A <npc>Kindling</npc> acolyte finds you after vespers.' +
        ' "The sacred fire changed color last night. Blue at' +
        ' the base. The elders are pretending it didn\'t."',
      'The <npc>Kindling</npc> prayer circle has added a new' +
        ' verse. The words are old — older than the Collapse.' +
        ' A deacon shares the translation with you: "The ground' +
        ' remembers what we buried."',
      '<npc>Avery</npc> slips you a note after the morning' +
        ' prayer. "The Kindling are scared. I can tell by' +
        ' which hymns they\'re choosing. The old ones.' +
        ' The ones for endings."',
    ],
  },

  // ── WE-A1-15: MERIDIAN signal (late Act I) ────────────────
  {
    id: 'we_a1_12_meridian_signal',
    act: 1,
    escalationLevel: 2,
    triggerActionCount: 20,
    messagePool: [
      'For seventeen seconds last night, every radio in' +
        ' <keyword>Crossroads</keyword> picked up the same' +
        ' signal. A single repeating tone. Nobody knows' +
        ' what broadcast it.',
      'A <npc>Reclaimer</npc> engineer triangulated' +
        ' the source of the signal: east-southeast, deep' +
        ' in the <keyword>Scar</keyword>. She\'s not' +
        ' telling anyone else yet.',
      'The signal again. This time with a fragment of' +
        ' voice beneath the tone. Too distorted to parse.' +
        ' Except one word: <keyword>MERIDIAN</keyword>.',
    ],
  },
]
