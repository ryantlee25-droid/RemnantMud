import type { Room } from '@/types/game'

// ============================================================
// SALT CREEK STRONGHOLD — 20 Rooms
// The Salters' fortress. Militaristic, disciplined, aggressive. Act I–II.
// ============================================================

export const SALT_CREEK_ROOMS: Room[] = [

  // ----------------------------------------------------------
  // SC-01: Outer Perimeter
  // ----------------------------------------------------------
  {
    id: 'sc_01_outer_perimeter',
    name: 'Salt Creek — Outer Perimeter',
    zone: 'salt_creek',
    act: 1,
    difficulty: 2,
    visited: false,
    flags: { noCombat: false, fastTravelWaypoint: true },
    description: 'The outer perimeter of Salt Creek Stronghold announces itself a hundred yards before you reach it: earthwork berms three meters high, topped with coils of razor wire that catch the sun like something alive and hostile. No artistry here, no attempt at welcome — the fortifications are functional, expensive in labor, and designed by someone who has thought carefully about what an attacking force would need to do and then made every one of those things worse. A guard post is visible at the crest of the berm, a silhouette with a long gun. They saw you before you saw them. The challenge when it comes is flat and procedural: "Halt. State your business. Hands where I can see them." There is no curiosity in the voice.',
    descriptionNight: 'The perimeter at night is perimeter at night. No lights — light is a target. The sentries work by night-adapted vision and sound discipline. You know they\'re there because the challenge comes before you expect it, from a direction you weren\'t watching.',
    shortDescription: 'Earth berms topped with razor wire and sentries who saw you long before you saw them.',
    exits: {
      east: 'rr_12_covenant_outskirts',
      west: 'sc_02_kill_zone',
      south: 'sc_15_creek_ford',
    },
    richExits: {},
    items: [],
    enemies: [],
    npcs: [],
    hollowEncounter: {
      baseChance: 0.10,
      timeModifier: { day: 0.3, dusk: 1.5, night: 2.5, dawn: 0.7 },
      threatPool: [
        { type: 'shuffler', weight: 70, quantity: { min: 1, max: 2, distribution: 'weighted_low' } },
        { type: 'remnant', weight: 20, quantity: { min: 1, max: 1, distribution: 'single' } },
        { type: 'brute', weight: 10, quantity: { min: 1, max: 1, distribution: 'single' } },
      ],
      awarenessRoll: { unaware: 0.5, awarePassive: 0.3, awareAggressive: 0.2 },
    },
    extras: [
      {
        keywords: ['berm', 'earthwork', 'dirt', 'fortification'],
        description: 'The earthwork berms are hand-dug — the labor of hundreds of person-hours. The earth is packed and shaped by someone who knows soil engineering: the angle of repose correct, the drainage channels cut on the back face to prevent saturation. This wasn\'t improvised. Briggs had a plan and made people execute it, which is the Salter way, which is why Salt Creek is still standing.',
      },
      {
        keywords: ['razor wire', 'wire', 'coils', 'glint'],
        description: 'Three overlapping coils of razor wire along the crest. The middle coil is elevated on stakes to create a mid-level barrier. Someone has wired tin can lids along the perimeter wire at irregular intervals — audible alarm system, low tech, effective. Anything big enough to matter will hit the cans.',
      },
      {
        keywords: ['guard', 'sentry', 'post', 'challenge'],
        description: 'The sentries rotate every two hours. Briggs instituted it after a sentry fell asleep on post in the first month and was never found — the implication left to do its work. Two-hour rotations, overlap at handover, no exceptions. The current sentry has the particular stillness of someone who has been trained not to fidget. You haven\'t heard them breathe.',
      },
    ],
    npcSpawns: [
      {
        npcId: 'salter_perimeter_guard',
        spawnChance: 0.95,
        spawnType: 'anchored',
        quantity: { min: 1, max: 2, distribution: 'weighted_low' },
        activityPool: [
          { desc: 'A Salter sentry levels a scoped rifle from the berm crest, tracking your approach. The barrel doesn\'t waver. "State your name and purpose. Slowly."', weight: 5 },
          { desc: 'Two sentries are at the transition — one coming off watch, one going on. The handover is professional: "Quiet approach from the east, twenty minutes ago. Nothing came of it." Both heads turn to you.', weight: 2 },
        ],
        dispositionRoll: { friendly: 0.0, neutral: 0.3, wary: 0.5, hostile: 0.2 },
        dialogueTree: 'sc_perimeter_challenge',
      },
    ],
    itemSpawns: [],
  },

  // ----------------------------------------------------------
  // SC-02: The Kill Zone
  // ----------------------------------------------------------
  {
    id: 'sc_02_kill_zone',
    name: 'Salt Creek — The Kill Zone',
    zone: 'salt_creek',
    act: 1,
    difficulty: 2,
    visited: false,
    flags: { noCombat: false },
    description: 'The cleared ground between the outer berm and the inner container wall is exactly what its name says it is. A hundred-meter swath of stripped earth, no cover, no shadow, no place to shelter. The vegetation has been pulled, burned, and treated so thoroughly that nothing grows back — salt in the soil, the Salters\' preferred solution, which is why they\'re called what they\'re called. From the inner wall, a defender has clean sightlines in every direction. From the cleared ground, you are simply visible. You move through it with the deliberate pace of someone who has decided that looking comfortable with their vulnerability is the best available option. It is not, actually, an option.',
    descriptionNight: 'At night the kill zone is darkness and the assumption of eyes. The inner wall has firing ports lit from behind, barely, just enough for the defenders inside to orient. You are a shape in the dark. They know you\'re there.',
    shortDescription: 'A hundred meters of stripped bare earth between walls, with no cover and firing positions on both sides.',
    exits: {
      east: 'sc_01_outer_perimeter',
      west: 'sc_03_inner_gate',
    },
    richExits: {},
    items: [],
    enemies: [],
    npcs: [],
    hollowEncounter: {
      baseChance: 0.05,
      timeModifier: { day: 0.5, dusk: 1.0, night: 1.5, dawn: 0.7 },
      threatPool: [
        { type: 'shuffler', weight: 80, quantity: { min: 1, max: 2, distribution: 'weighted_low' } },
        { type: 'screamer', weight: 20, quantity: { min: 1, max: 1, distribution: 'single' } },
      ],
      awarenessRoll: { unaware: 0.3, awarePassive: 0.3, awareAggressive: 0.4 },
      noiseModifier: 3,
    },
    extras: [
      {
        keywords: ['ground', 'soil', 'salt', 'bare', 'stripped'],
        description: 'The name \'Salters\' comes from this practice — salting cleared ground to prevent regrowth. Briggs adopted it from historical siege warfare, which he read extensively during the first winter. The soil here won\'t support plant life for years. That is the point.',
      },
      {
        keywords: ['sightlines', 'sight', 'cover', 'exposed'],
        description: 'You count the firing positions while you cross: six on the inner wall, three elevated on the container tops, two at the outer berm behind you. If you were a threat, you would already be addressed. You are not comfortable with that construction.',
      },
      {
        keywords: ['stakes', 'warning', 'signs', 'markers'],
        description: 'At regular intervals, wooden stakes with red-painted tops mark distances from the inner wall — 80 meters, 60 meters, 40 meters, 20 meters. Range markers for the defenders. The numbers are large and legible. This is also intentional.',
      },
      {
        keywords: ['dead', 'bones', 'history', 'who', 'used', 'tested'],
        description: 'The kill zone has been used. Not recently — Briggs established discipline early and the perimeter challenges have been mostly non-lethal since year two. But in year one, before the doctrine solidified, six people crossed this ground in ways that the sentries interpreted as hostile. Three of those interpretations were correct. Briggs addressed the other three instances in a closed meeting with the watch commanders. The policy changed. The distance markers date from afterward.',
        skillCheck: { skill: 'lore', dc: 11, successAppend: 'The kill zone doctrine has a second function that Salters don\'t discuss with outsiders: it tests the will of people who want entry. Anyone who is sufficiently motivated to walk a hundred meters of completely exposed ground under rifle sights, at a pace, without running — that person wants in enough to be useful. Cowards and threats both fail the crossing for different reasons. Everyone who passed it with dignity got a second look from Briggs.' },
      },
    ],
    environmentalRolls: {
      flavorLines: [
        { line: 'Your boots leave marks in the treated soil. No other marks are fresh. You are the only person who has crossed this ground today, which means you are the most interesting thing on this side of the wall.', chance: 0.30, time: ['day'] },
        { line: 'Somewhere on the inner wall, a scope catches light. Not a threat. An assessment.', chance: 0.25, time: ['day', 'dawn', 'dusk'] },
      ],
    },
    personalLossEchoes: {
      child: 'A hundred meters of bare earth and the assumption of eyes. You cross it at a measured pace, the way Briggs designed it to be crossed, and you think about the spaces you walked to keep them safe — the distance between the door and their bed, the hallway you checked in the dark, the perimeter of a small life that you patrolled without calling it that. The kill zone is honest about what it is. Your patrols were too.',
      partner: 'The range markers count down: eighty meters, sixty, forty, twenty. The distance decreasing. You crossed distances like this to reach them — the last stretch of a long day, the final block before the door, the closing gap between two people who wanted to be closer. Those distances got shorter. This one does too, but the feeling is inverted.',
      identity: 'You walk the kill zone with deliberate pace, projecting composure you may or may not feel. The sentries assess you, file the assessment. You are performing the act of being someone who is not afraid, and you are aware that you are performing it, and you cannot remember if there was ever a time when you were the performance rather than the person watching yourself perform it.',
    },
    npcSpawns: [
      {
        npcId: 'salter_perimeter_worker',
        spawnChance: 0.35,
        spawnType: 'patrol',
        quantity: { min: 1, max: 1, distribution: 'single' },
        activityPool: [
          { desc: 'A Salter walks the kill zone\'s edge with a salt spreader — a repurposed seed spreader loaded with coarse mineral salt. They work methodically, treating the sections where new growth has begun to show. They don\'t acknowledge you. The work continues whether you\'re here or not.', weight: 3 },
          { desc: 'A Salter is at the range marker stakes, checking each one with a plumb line, adjusting the ones that have shifted. They measure the distance from the wall, mark it in a ledger, move on. Precision work. Briggs requires it.', weight: 2 },
        ],
        dispositionRoll: { friendly: 0.0, neutral: 0.6, wary: 0.3, hostile: 0.1 },
        dialogueTree: 'sc_perimeter_worker',
      },
    ],
    itemSpawns: [],
  },

  // ----------------------------------------------------------
  // SC-03: Inner Gate
  // ----------------------------------------------------------
  {
    id: 'sc_03_inner_gate',
    name: 'Salt Creek — Inner Gate',
    zone: 'salt_creek',
    act: 1,
    difficulty: 2,
    visited: false,
    flags: { noCombat: true },
    description: 'The inner gate is built from stacked shipping containers, two on each side, welded at the seams to form a gatehouse that would take a vehicle at speed to breach — and even then, you\'d need the follow-up vehicle to deal with what was waiting inside. The gate itself is a repurposed steel loading door, counterbalanced and fitted with a lock that requires two keys from two different sentries. A sign above the gate reads: SALT CREEK STRONGHOLD — SALTER TERRITORY — ACCORD LACKEYS AND DRIFTER PARASITES TURN BACK. Someone has drawn a fist below the text. The sentries are watching you with professional contempt that softens marginally if you\'re Recognized.',
    descriptionNight: 'Night entry procedure is different: password challenge, which changes nightly, plus reputation verification. The sentries are less patient at night. The sign says the same things in the dark.',
    shortDescription: 'A container-steel gatehouse with two-key locks and a sign that leaves no ambiguity about Salter hospitality.',
    exits: {
      east: 'sc_02_kill_zone',
      west: 'sc_04_the_yard',
    },
    richExits: {
      west: {
        destination: 'sc_04_the_yard',
        reputationGate: { faction: 'salters', minLevel: 1 },
        descriptionVerbose: 'the inner gate — Recognized standing with the Salters required',
      },
    },
    items: [],
    enemies: [],
    npcs: [],
    extras: [
      {
        keywords: ['sign', 'text', 'accord', 'drifters', 'fist'],
        description: 'The sign has been there since the beginning — Briggs wrote it himself on a piece of container wall with industrial paint. He was offered a chance to revise it when Covenant relations required diplomacy. He didn\'t revise it. The fist was added by a Salter private three years ago as an unofficial amendment, and Briggs said nothing, which the private took as approval.',
      },
      {
        keywords: ['container', 'gatehouse', 'steel', 'welded'],
        description: 'The containers were hauled here from a rail yard twenty miles east, a project that took three weeks and seventeen people and a vehicle they later had to cannibalize for parts but that Briggs still considers worth it. The welds on the corner seams are visible, lumpy with the confidence of self-taught metalwork. They hold.',
      },
      {
        keywords: ['lock', 'two keys', 'procedure'],
        description: 'Two-key procedure: one sentry holds the north lock key, one holds the south lock key. Both must turn simultaneously, which requires both sentries to be present and in agreement. This prevents a lone sentry from being coerced or killed to open the gate. Briggs designed the procedure after a near-breach in year one. You note that both sentries are present and in agreement about you.',
      },
    ],
    npcSpawns: [
      {
        npcId: 'salter_inner_gate_sentry',
        spawnChance: 0.95,
        spawnType: 'anchored',
        quantity: { min: 2, max: 2, distribution: 'single' },
        activityPool: [
          { desc: 'Two sentries flank the gate, each holding one key, watching you with the synchronized attention of people who practice this together regularly. One of them speaks: "State your name. Affiliation. Reason for entry."', weight: 5 },
          { desc: 'A sentry at the gate runs her eyes over your gear with a systematic assessment that communicates both experience and the complete indifference to your comfort that the assessment entails.', weight: 3 },
        ],
        dispositionRoll: { friendly: 0.0, neutral: 0.2, wary: 0.6, hostile: 0.2 },
        dialogueTree: 'sc_inner_gate_challenge',
      },
    ],
    itemSpawns: [],
  },

  // ----------------------------------------------------------
  // SC-04: The Yard
  // ----------------------------------------------------------
  {
    id: 'sc_04_the_yard',
    name: 'Salt Creek — The Yard',
    zone: 'salt_creek',
    act: 1,
    difficulty: 2,
    visited: false,
    flags: { noCombat: false },
    description: 'The yard is where Salters become Salters — a dirt-floored training ground inside the container wall, with the organized chaos of people pushing themselves past where they were yesterday. Four stations running simultaneously: a sparring ring where two people are working through a takedown sequence with focused intensity, a weapons drill line doing dry-fire presentations in unison, an obstacle course of stacked tires and crawl tunnels at the east end, and a fitness station where a trainee does push-ups while a trainer counts with the flat affect of someone who will count forever if that\'s what\'s required. The sound of exertion, impacts, and counted repetitions is constant. Nobody looks at you twice. You are not the most important thing happening here.',
    descriptionNight: 'Night PT. Salters run at night by preference — conditions prepare you for conditions. The yard is lanterns-only, which makes the sparring ring into something with shadows and consequence.',
    shortDescription: 'The training ground — constant drills, sparring, and the organized sound of people getting harder.',
    exits: {
      east: 'sc_03_inner_gate',
      north: 'sc_05_barracks',
      south: 'sc_09_the_pit',
      west: 'sc_06_mess_hall',
    },
    richExits: {},
    items: [],
    enemies: [],
    npcs: [],
    hollowEncounter: {
      baseChance: 0.03,
      timeModifier: { day: 0.5, dusk: 1.0, night: 1.5, dawn: 0.7 },
      threatPool: [
        { type: 'shuffler', weight: 90, quantity: { min: 1, max: 1, distribution: 'single' } },
        { type: 'remnant', weight: 10, quantity: { min: 1, max: 1, distribution: 'single' } },
      ],
      awarenessRoll: { unaware: 0.2, awarePassive: 0.3, awareAggressive: 0.5 },
    },
    extras: [
      {
        keywords: ['sparring ring', 'fighting', 'takedown', 'combat'],
        description: 'The ring is a cleared circle of dirt with a boundary marked in painted stone. No rules visible anywhere. Two people working a shoulder takedown in slow-motion practice, then full speed, then slow again. The trainer calls corrections without emotion: "Wrist, not sleeve. Over and again." If you watch long enough, you see the sequence improve. The learning is in the repetition.',
        skillCheck: { skill: 'brawling', dc: 10, successAppend: 'The trainer notices you watching with actual understanding and nods, once, which is the closest thing to an invitation you\'ll get here.' },
      },
      {
        keywords: ['drill line', 'weapons drill', 'dry fire', 'presentation'],
        description: 'Seven trainees in a line, presenting empty rifles to a target and squeezing triggers in unison. "Draw. Present. Acquire. Squeeze. Reset." The cadence is the trainer\'s voice and the clicking of dry mechanisms. They do it again. They\'ll do it until the motion lives in muscle, not mind.',
      },
      {
        keywords: ['obstacle course', 'tires', 'crawl tunnel', 'course'],
        description: 'The obstacle course has been modified and added to since the beginning — you can see the original design and at least four generations of additions, each requiring something the previous version didn\'t. Tires to run through. A log barrier to vault. A crawl tube made from drainage pipe. At the end, a rope climb to a platform. The rope shows the evidence of thousands of pairs of hands.',
      },
    ],
    npcSpawns: [
      {
        npcId: 'salter_trainer',
        spawnChance: 0.90,
        spawnType: 'anchored',
        activityPool: [
          { desc: 'The trainer calls corrections to the sparring ring in a voice that carries without rising — experience has taught her that volume is for emergencies, not feedback.', weight: 3 },
          { desc: 'A trainer demonstrates a disarm sequence to a group of trainees, performing it slowly three times, then asking the trainees to identify the pivot point.', weight: 2 },
        ],
        dispositionRoll: { friendly: 0.0, neutral: 0.4, wary: 0.5, hostile: 0.1 },
        dialogueTree: 'sc_trainer_yard',
      },
      {
        npcId: 'salter_trainee',
        spawnChance: 0.80,
        spawnType: 'wanderer',
        quantity: { min: 2, max: 4, distribution: 'bell' },
        activityPool: [
          { desc: 'A trainee moves through the obstacle course at controlled speed, not sprinting — economy of movement is the lesson, not time.', weight: 3 },
          { desc: 'A trainee in the sparring ring takes a throw to the ground, gets up immediately without dramatic pause, and returns to ready position. The trainer says nothing, which means correct.', weight: 2 },
        ],
        dispositionRoll: { friendly: 0.0, neutral: 0.3, wary: 0.5, hostile: 0.2 },
      },
    ],
    itemSpawns: [],
  },

  // ----------------------------------------------------------
  // SC-05: Barracks
  // ----------------------------------------------------------
  {
    id: 'sc_05_barracks',
    name: 'Salt Creek — Barracks',
    zone: 'salt_creek',
    act: 1,
    difficulty: 2,
    visited: false,
    flags: { noCombat: true },
    description: 'The barracks occupy what was a commercial warehouse — the square footage is enough for the eighty-person permanent garrison with room for a rotating cast of trainees and contract fighters. Bunks in rows, salvage-built from lumber and steel tube, each with a footlocker that is the only private space most Salters have. The discipline of the space is visible at a glance: bedding aligned, gear stowed, the floor clean enough. Not pretty — the light is bad, the air is crowded with the smell of bodies and weapon oil — but functional in the way that a weapon is functional: made for use, maintained for use, designed to do one thing well. People off-shift talk, sleep, check their gear. Conversations you half-catch are about equipment, about patrols, about specific tactical problems that have specific tactical solutions and not very much else.',
    descriptionNight: 'The barracks at night fills to capacity. The sounds: breathing, a few people talking quietly, the creak of bunks, the occasional single word from someone in a dream. The night sentry makes circuits without a lantern, by feel, because the garrison is a hundred people who know each other in the dark.',
    shortDescription: 'Eight rows of bunks, eighty Salters, and conversations exclusively about gear, patrols, and problems that have solutions.',
    exits: {
      south: 'sc_04_the_yard',
      east: 'sc_07_warlords_command',
      west: 'sc_20_mess_hall',
    },
    richExits: {},
    items: [],
    enemies: [],
    npcs: [],
    extras: [
      {
        keywords: ['bunks', 'beds', 'footlocker', 'gear'],
        description: 'Each footlocker is padlocked and personal — the only privacy in the barracks. What people keep there: spare ammunition, a weapon they\'re more attached to than their issue gear, something from before the Collapse that they didn\'t think would still matter and does. Nobody opens another person\'s footlocker. This rule has never been written down. It has never been violated.',
      },
      {
        keywords: ['wall', 'board', 'patrol', 'schedule', 'assignments'],
        description: 'The duty board covers one full wall — patrol assignments, training schedules, equipment maintenance rotations, post assignments. Updated daily in a standard format that every Salter learns in the first week. The current day\'s assignments are in red. Tomorrow\'s are in black. Everything is accounted for.',
      },
      {
        keywords: ['conversation', 'talk', 'soldiers', 'troops'],
        description: 'You catch fragments: "—the north gate seal is degrading, I put it in the maintenance log—" and "—new rotation starts the sixth—" and "—Briggs wants the motor pool finished by end of week—" and, quietly, from two people in a corner bunk: "—I know. I know. I just—" and then they see you and the conversation ends, which tells you something about what it was.',
      },
    ],
    npcSpawns: [
      {
        npcId: 'salter_off_duty',
        spawnChance: 0.75,
        spawnType: 'wanderer',
        quantity: { min: 1, max: 3, distribution: 'bell' },
        activityPool: [
          { desc: 'A Salter sits on his bunk cleaning a rifle with mechanical precision, the process carrying the particular calm of practiced routine.', weight: 3 },
          { desc: 'A Salter lies on her bunk reading from a field manual, one finger tracking her place on the page, her lips forming words occasionally.', weight: 2 },
          { desc: 'Two Salters at a small table play cards. The game is quiet. The stakes appear to be small scrap-metal tokens. Neither is winning decisively.', weight: 2 },
        ],
        dispositionRoll: { friendly: 0.0, neutral: 0.3, wary: 0.5, hostile: 0.2 },
        dialogueTree: 'sc_barracks_soldier',
      },
    ],
    personalLossEchoes: {
      child: 'Each footlocker is padlocked and personal. You wonder what\'s inside them — the things people kept from before. Photographs. Letters. A toy that means nothing to anyone alive except the person who locked it in a box in a barracks and checks it\'s still there every night.',
      partner: 'Two people in a corner bunk, talking quietly, and then they see you and stop. The intimacy of the unfinished sentence. You had conversations like that — private, low, the kind that lived in the space between two people and nowhere else.',
      community: 'Eighty people sleeping in rows, breathing, dreaming, maintaining each other\'s survival by proximity and discipline. It\'s not the community you lost but it\'s the shape of one — people choosing the same walls, the same risks, the same direction every morning.',
      identity: 'A Salter on her bunk reads a field manual, one finger tracking her place. She knows who she is. Her identity is: Salter, this bunk, this weapon, this duty. The certainty of it pulls at you. You had that once — the knowledge of your own name and what it meant to answer to it.',
      promise: 'The duty board covers one full wall. Assignments, schedules, obligations. Everyone here owes something to the structure that keeps them alive. You look at the board and think about your own obligation — the one that isn\'t posted, isn\'t scheduled, isn\'t assigned. The one you carry alone.',
    },
    itemSpawns: [
      {
        entityId: 'ammo_9mm',
        spawnChance: 0.20,
        quantity: { min: 2, max: 5, distribution: 'weighted_low' },
        conditionRoll: { min: 0.8, max: 1.0 },
        groundDescription: 'A few loose rounds on the floor near a footlocker — someone\'s pocket dropped them.',
        depletion: { cooldownMinutes: { min: 120, max: 360 }, respawnChance: 0.15 },
      },
    ],
  },

  // ----------------------------------------------------------
  // SC-06: Mess Hall
  // ----------------------------------------------------------
  {
    id: 'sc_06_mess_hall',
    name: 'Salt Creek — Mess Hall',
    zone: 'salt_creek',
    act: 1,
    difficulty: 1,
    visited: false,
    flags: { noCombat: true },
    description: 'The mess hall is the social center of Salt Creek and the most human room in the stronghold — not despite its austerity but partly because of it. Long tables, bench seating, a serving line at one end where the cooks work with an efficiency that makes Briggs\'s training philosophy legible in food-service form: no excess, no waste, no argument. The food is: adequate. Protein heavy. Salted. The important thing the mess hall does is put eighty people in the same room three times a day with enforced proximity, which generates the information exchange that makes a military unit function. You hear more operational intelligence here than you would in a briefing room, because the people doing the talking don\'t frame it as intelligence.',
    descriptionNight: 'Evening chow has a different quality — the shift off the day\'s work, the loosening that food and warmth and the absence of active threat allows. Conversations are longer. Someone is usually telling a story at the far table.',
    shortDescription: 'Adequate food served efficiently to eighty Salters, and the best intelligence briefing in the stronghold.',
    exits: {
      east: 'sc_04_the_yard',
    },
    richExits: {},
    items: [],
    enemies: [],
    npcs: [],
    extras: [
      {
        keywords: ['food', 'meal', 'rations', 'serving line', 'cook'],
        description: 'Today: salted pork and grain porridge, with a small amount of pickled vegetables on the side. The cook serves it without commentary. You take what\'s given. The recipe is consistent because consistency is a resource — people eat what they expect, no one argues about portions, the line moves. It is also, quietly, good. Not restaurant good. Survival good. The kind of good that means someone cared.',
      },
      {
        keywords: ['rumors', 'conversation', 'information', 'intel'],
        description: 'In fifteen minutes of sitting with a bowl: the motor pool truck has a cracked block that changes the Hollow-clearing radius by twelve miles. A Drifter scout came through yesterday with information about Accord patrol patterns that Briggs received without comment, which everyone present read as either approval or a decision already made. A patrol to the south came back with evidence of Sanguine activity closer than the last sighting. Everyone heard this. Nobody changed their expression.',
        skillCheck: { skill: 'perception', dc: 9, successAppend: 'You catch the thread that connects two of those rumors. The Sanguine activity to the south is in the same area as the Accord patrol pattern intelligence. Someone is maneuvering.' },
      },
      {
        keywords: ['tables', 'benches', 'seating', 'long tables'],
        description: 'Six long tables, permanent-fixed to the concrete floor. The bench seats are worn smooth at the high-contact points. Every table has visible initials, drawings, and notched tallies — the cumulative graffiti of people with knives and time. One bench end has been signed by thirty-seven different hands, with ranks and dates. The oldest signature is Briggs\'s: Day 1.',
      },
      {
        keywords: ['rumor', 'fire cult', 'covenant', 'talk', 'gossip'],
        description: 'At the far table, two Salters talk between bites with the low-voiced casualness of people discussing operational intelligence over lunch. "The fire cult\'s getting bigger. Three more families went east last month." "Covenant won\'t do anything about it. Covenant won\'t do anything about anything until it\'s on their doorstep." "Covenant has a six-month refugee backlog. They can\'t process the people they\'ve got." "That\'s what I\'m saying." The conversation moves on to patrol schedules. The intelligence has been exchanged. Neither of them wrote it down.',
      },
    ],
    npcSpawns: [
      {
        npcId: 'salter_mess_cook',
        spawnChance: 0.85,
        spawnType: 'anchored',
        activityPool: [
          { desc: 'The cook works the serving line with the efficiency of someone who has timed each portion to three seconds and sees no reason to elaborate.', weight: 4 },
          { desc: 'The cook is prepping the next meal in a large steel pot, working with the domestic focus of someone who finds large-scale feeding genuinely satisfying.', weight: 2 },
        ],
        dispositionRoll: { friendly: 0.2, neutral: 0.6, wary: 0.2, hostile: 0.0 },
        dialogueTree: 'sc_mess_cook',
      },
      {
        npcId: 'mess_hall_children',
        spawnChance: 0.20,
        spawnType: 'ambient',
        quantity: { min: 2, max: 3, distribution: 'weighted_low' },
        activityPool: [
          { desc: 'Two children eat at the end of the nearest table with the focused efficiency of adults. They don\'t play with their food. They don\'t talk while they eat. They finish, stack their bowls, and leave. Someone taught them this. They learned.', weight: 3 },
          { desc: 'A girl of maybe nine carries a tray of empty bowls to the wash station with the practiced balance of someone who has done this enough times to stop thinking about it. She is part of the operation, not a visitor to it.', weight: 2 },
          { desc: 'Three children sit together, eating in silence. The oldest — twelve, maybe — watches the door between bites with the same attentive scan the sentries use on the perimeter. Nobody told her to do this. She picked it up the way children pick things up: by being present while adults do them.', weight: 2 },
        ],
        dispositionRoll: { friendly: 0.2, neutral: 0.6, wary: 0.2, hostile: 0.0 },
      },
    ],
    itemSpawns: [
      {
        entityId: 'salted_rations',
        spawnChance: 0.50,
        quantity: { min: 1, max: 2, distribution: 'weighted_low' },
        conditionRoll: { min: 0.8, max: 1.0 },
        groundDescription: 'A serving of salt-cured rations sits at the end of the serving line, unclaimed.',
        depletion: { cooldownMinutes: { min: 60, max: 180 }, respawnChance: 0.60 },
      },
    ],
  },

  // ----------------------------------------------------------
  // SC-07: Warlord's Command
  // ----------------------------------------------------------
  {
    id: 'sc_07_warlords_command',
    name: 'Salt Creek — Warlord\'s Command',
    zone: 'salt_creek',
    act: 2,
    difficulty: 3,
    visited: false,
    flags: { noCombat: true, questHub: true },
    description: 'The command center is a converted container unit — one long steel room with maps, comms equipment in various states of function, a weapons rack with Briggs\'s personal gear, and a desk that has the look of something used by a person who thinks at the desk, not for it. Briggs is in the room. He always seems to be in the room — the garrison runs on the assumption of his presence the way a clock runs on the assumption of gravity. He\'s a large man who wears his size without using it, a Marine\'s economy of movement in a civilian post-Collapse body. He looks at you the way he looks at new intelligence: completely, quickly, filing the assessment before you\'ve finished being assessed. "You made it this far," he says, which is both true and contains the clear implication that it was not guaranteed.',
    descriptionNight: 'Briggs works at night. The command is lit. The radio runs all shifts. He reads patrol reports while they\'re still warm.',
    shortDescription: 'Briggs\'s command center — a converted container, maps, a desk used for actual thinking, and a man who has already assessed you.',
    exits: {
      west: 'sc_05_barracks',
      north: 'sc_10_watchtower',
      up: 'sc_13_briggs_quarters',
    },
    richExits: {
      west: {
        destination: 'sc_05_barracks',
        reputationGate: { faction: 'salters', minLevel: 2 },
        descriptionVerbose: 'the command door — Trusted Salter standing required',
      },
    },
    items: [],
    enemies: [],
    npcs: [],
    extras: [
      {
        keywords: ['maps', 'wall', 'territory', 'planning'],
        description: 'Briggs\'s maps are military-grade where they exist and hand-annotated everywhere else. The Four Corners region is covered in tactical notations: Hollow herd movement corridors, Sanguine territorial markers in black, Accord and Drifter positions noted with a particular quality of annotation that suggests Briggs considers them variables rather than allies. MERIDIAN has a marker, north, with a series of question marks and then a single word: PERSONAL.',
        cycleGate: 2,
      },
      {
        keywords: ['briggs', 'warlord', 'marine', 'commander'],
        description: 'Warlord Briggs. Ex-Marine, rank unknown — he doesn\'t use it. Assigned, before the Collapse, to a security detail at a facility in the northern mountains. He\'s never said which one. The facility burned. He walked out. He doesn\'t discuss the walking out, and you understand from the way he doesn\'t discuss it that the walking out was the most significant event in a life that has contained very significant events.',
        cycleGate: 2,
      },
      {
        keywords: ['radio', 'comms', 'communications', 'equipment'],
        description: 'Three radio units in varying states of function. One runs continuous scan on a standard emergency frequency. Another is dedicated to patrol communication. The third is on a channel that isn\'t labeled — Briggs controls it himself, and he was at the desk when you came in, and you notice that he moved slightly in the direction of the unlabeled unit before you spoke.',
        skillCheck: { skill: 'electronics', dc: 12, successAppend: 'The unlabeled unit\'s frequency display is just visible from this angle. The frequency is not standard. It\'s close to, but not identical to, the MERIDIAN signal frequency that\'s been scattered in radio fragments across the Four Corners.' },
        cycleGate: 2,
      },
      // === CONVOY remnant-story-0329 Rider D ===
      {
        keywords: ['east', 'expansion', 'projection', 'resource', 'plan'],
        description: 'A secondary map panel on the east wall tracks resource projections: water sources marked by reliability, soil quality grades, Hollow migration corridors. Red arrows indicate expansion vectors — not arbitrary aggression but calculated access to fresh water and arable land. Numbers beside each arrow: population fed, months of runway gained. Briggs has drawn out the math of his strategy in the margins. The math is correct. The conclusions it supports are not wrong, only the things they require.',
      },
      // === END CONVOY remnant-story-0329 Rider D ===
    ],
    npcSpawns: [
      {
        npcId: 'warlord_briggs',
        spawnChance: 0.90,
        spawnType: 'anchored',
        activityPool: [
          { desc: 'Briggs is at his desk reading a patrol report, making notations with a marker in a system that is clearly legible only to him. He doesn\'t look up when you enter. He acknowledges you when he\'s finished the page.', weight: 4 },
          { desc: 'Briggs stands at the map wall with his arms crossed, looking at a specific quadrant with the focused attention of someone running a scenario. He turns when he hears you come in.', weight: 3 },
          { desc: 'Briggs is on the radio, listening more than speaking. He holds up one finger — wait. His expression during the call doesn\'t change.', weight: 2 },
        ],
        dispositionRoll: { friendly: 0.0, neutral: 0.4, wary: 0.4, hostile: 0.2 },
        dialogueTree: 'sc_briggs_command',
        questGiver: ['sc_hollow_clearance', 'sc_brig_moral_choice', 'sc_motor_pool_fuel'],
        narrativeNotes: 'Warlord Briggs. Ex-Marine. Was MERIDIAN perimeter security. Knows more than he admits. The revelation is Cycle 2+ in his quarters.',
      },
    ],
    itemSpawns: [],
  },

  // ----------------------------------------------------------
  // SC-08: The Armory
  // ----------------------------------------------------------
  {
    id: 'sc_08_armory',
    name: 'Salt Creek — The Armory',
    zone: 'salt_creek',
    act: 2,
    difficulty: 3,
    visited: false,
    flags: { noCombat: true },
    description: 'The Salter armory is what Covenant\'s armory aspires to be, which the Salters know and consider appropriate. The selection is serious: military-grade weapons recovered from National Guard depots and federal caches in the first two years, maintained with the kind of discipline that suggests whoever runs this room considers proper maintenance a moral position. A wall of rifles sorted by caliber and condition. A secondary rack of sidearms. A dedicated shelf for explosive ordnance — the sign above it reads TRAINED PERSONNEL ONLY and it means it. The armorer looks at you the way all armorer characters look at new people: assessing what you know about what you\'re looking at.',
    descriptionNight: 'The armory operates on reduced-access protocol at night. The armorer or a designated alternate only. No browsing.',
    shortDescription: 'The best weapons in the Four Corners, maintained to military standard by someone who considers it a moral obligation.',
    exits: {
      south: 'sc_09_the_pit',
      east: 'sc_16_armory_annex',
    },
    richExits: {
      south: {
        destination: 'sc_09_the_pit',
        reputationGate: { faction: 'salters', minLevel: 3 },
        descriptionVerbose: 'the armory — Blooded Salter standing required',
      },
    },
    items: [],
    enemies: [],
    npcs: [],
    extras: [
      {
        keywords: ['rifles', 'weapons', 'rack', 'military', 'grade'],
        description: 'AR pattern rifles, at least six, in better condition than anything you\'ve seen outside a pre-Collapse armory. A bolt-action sniper platform with a scope that has the look of careful calibration. Two light machine guns that Briggs keeps for static defense, tagged DO NOT FIELD WITHOUT COMMAND AUTH. The tags are for people who might be tempted, not for people who have been around long enough to not need to be told.',
      },
      {
        keywords: ['ordnance', 'explosives', 'grenades', 'shelf'],
        description: 'The ordnance shelf: six fragmentation grenades in a padlocked case, three smoke grenades, what appears to be two blocks of C4 in a separate locked steel box, and a row of improvised explosive components in clearly labeled bins. The armorer manages the ordnance inventory personally and does not delegate it. The ledger for the ordnance shelf is thicker than the one for the firearms.',
      },
      {
        keywords: ['armorer', 'keeper', 'manager'],
        description: 'The armorer is a compact woman named Reyes who was an Army Ordnance Corps specialist before the Collapse. She speaks about weapons the way specialists speak about their field: with precision, without performance, and with the immediate recognition of whether you\'re doing the same.',
        skillCheck: { skill: 'marksmanship', dc: 11, successAppend: 'Reyes notes the way you\'re looking at the rack and nods. "You know what you\'re looking at. Good. That means we can skip the explanations."' },
      },
    ],
    npcSpawns: [
      {
        npcId: 'armorer_reyes',
        spawnChance: 0.90,
        spawnType: 'anchored',
        activityPool: [
          { desc: 'Reyes runs a function check on a rifle with the concentrated efficiency of someone doing a safety verification, not a performance.', weight: 4 },
          { desc: 'Reyes is updating the ordnance ledger, cross-referencing it with the physical count from earlier, her expression neutral throughout.', weight: 3 },
        ],
        tradeInventory: ['ar_platform_rifle', 'sniper_rifle', 'military_sidearm', 'fragmentation_grenade', 'ammo_556', 'ammo_762', 'body_armor_military'],
        dispositionRoll: { friendly: 0.0, neutral: 0.4, wary: 0.5, hostile: 0.1 },
        dialogueTree: 'sc_reyes_armory',
      },
    ],
    itemSpawns: [],
  },

  // ----------------------------------------------------------
  // SC-09: The Pit
  // ----------------------------------------------------------
  {
    id: 'sc_09_the_pit',
    name: 'Salt Creek — The Pit',
    zone: 'salt_creek',
    act: 1,
    difficulty: 3,
    visited: false,
    flags: { noCombat: false },
    description: 'The Pit is a depression in the earth at the south end of the compound — deliberately excavated so spectators on the rim look down at the fighters below, creating a natural amphitheater effect that Briggs, who designed it, does not mention is borrowed from Roman architecture. The fighting ring is marked with chalk lines that get re-drawn after rain. Straw on the floor, raked each morning. The rules, posted on a board at the top of the rim stairs: NO WEAPONS. NO KILLING. FIRST UNCONSCIOUS OR YIELD LOSES. WINNER WALKS. It is the most direct economy in Salt Creek: fight here, prove something, earn reputation. Spectators arrange themselves along the rim with the focused attention of people for whom this is both entertainment and professional development.',
    descriptionNight: 'Night matches are by lantern — four of them, one at each cardinal corner of the pit. The shadows make the fighting more interesting and the scoring more subjective. Night matches count for twice the reputation.',
    shortDescription: 'The fighting pit — a deliberate excavation, chalk lines, straw on the floor, and the most direct economy in Salt Creek.',
    exits: {
      north: 'sc_04_the_yard',
      up: 'sc_08_armory',
    },
    richExits: {},
    items: [],
    enemies: [],
    npcs: [],
    hollowEncounter: {
      baseChance: 0.04,
      timeModifier: { day: 0.5, dusk: 1.5, night: 2.0, dawn: 1.0 },
      threatPool: [
        { type: 'brute', weight: 60, quantity: { min: 1, max: 1, distribution: 'single' } },
        { type: 'remnant', weight: 30, quantity: { min: 1, max: 2, distribution: 'weighted_low' } },
        { type: 'shuffler', weight: 10, quantity: { min: 1, max: 2, distribution: 'weighted_low' } },
      ],
      awarenessRoll: { unaware: 0.2, awarePassive: 0.3, awareAggressive: 0.5 },
    },
    extras: [
      {
        keywords: ['rules', 'board', 'sign', 'posted'],
        description: 'The rules board has been there since the beginning. FIRST UNCONSCIOUS OR YIELD LOSES. The wood is weathered enough that the paint has faded into the grain. Someone has added, in a different hand: ALSO THE OBVIOUS STUFF. Briggs left this amendment in place. He said it was clearer.',
      },
      {
        keywords: ['spectators', 'crowd', 'watching', 'rim'],
        description: 'Seven spectators currently on the rim. A few are clearly off-duty Salters, watching with the attentive stillness of people doing operational assessment rather than recreation. One is taking notes in a small book. You realize the notes are probably not personal. Everything in Salt Creek is training.',
      },
      {
        keywords: ['straw', 'floor', 'chalk', 'lines'],
        description: 'The straw smells of iron from old bloodstains and the particular sweetness of vegetation doing its thankless work of absorbing impact. The chalk boundary lines have been redrawn so many times that the underlying earth is lighter in those strips from repeated chalk saturation. The pit\'s history is in the floor.',
      },
    ],
    npcSpawns: [
      {
        npcId: 'pit_fighter_active',
        spawnChance: 0.55,
        spawnType: 'anchored',
        activityPool: [
          { desc: 'A pit fighter warms up in the ring — shadow footwork, loose and economical, face neutral. They glance at the rim to see who\'s watching. They see you.', weight: 3 },
          { desc: 'Two fighters circle each other in the chalk ring, neither committing, both reading. The spectators on the rim are very quiet.', weight: 2 },
        ],
        dispositionRoll: { friendly: 0.0, neutral: 0.3, wary: 0.4, hostile: 0.3 },
        dialogueTree: 'sc_pit_challenge',
        questGiver: ['sc_pit_reputation_fight'],
      },
    ],
    personalLossEchoes: {
      child: 'The spectators on the rim watch with focused attention. You think about what you would have done to keep them from ever seeing a place like this — the violence made ordinary, the blood in the straw. You would have covered their eyes. You would have walked them away.',
      partner: 'NO KILLING. FIRST UNCONSCIOUS OR YIELD LOSES. Rules for violence. You and they had rules too — not written, not posted, but understood. The rules that kept a life together. The chalk lines in the pit are faded from rain and redrawn, the way agreements are renegotiated when the old ones wash away.',
      community: 'Seven spectators on the rim, watching together. Shared violence as social event. You recognize the architecture — the gathering, the common focus, the belonging that comes from watching the same thing at the same time. Your community gathered too. Not for this. But the shape was the same.',
      identity: 'The fighter in the ring warms up — shadow footwork, loose and economical. Your body responds before your mind does: weight shifts, hands adjust. You know how to fight. You don\'t remember learning. The pit knows you better than you know yourself.',
      promise: 'WINNER WALKS. The simplest economy. You deliver what you promised, you get what you earned. Your promise was more complicated than that — no clean rules, no chalk lines, no posted board. But the debt is the same: something owed, something unpaid, and the spectators waiting to see if you settle it.',
    },
    itemSpawns: [],
  },

  // ----------------------------------------------------------
  // SC-10: The Watchtower
  // ----------------------------------------------------------
  {
    id: 'sc_10_watchtower',
    name: 'Salt Creek — The Watchtower',
    zone: 'salt_creek',
    act: 1,
    difficulty: 2,
    visited: false,
    flags: { noCombat: false },
    description: 'The watchtower is the highest structure at Salt Creek — four shipping containers stacked two by two, with a reinforced platform welded to the top. From up here, the view south opens into The Dust and the broken country beyond. You can see the Animas River as a silver line to the east. You can see the road south running into the horizon, where the distance blurs geography into atmosphere. The sniper post here isn\'t staffed continuously — the Salters don\'t have the people — but when it is, the effective range covers the entire outer perimeter and well beyond. The logbook at the post records sightings in a format so spare it reads like poetry: time, bearing, description, disposition. The last entry is from two nights ago.',
    descriptionNight: 'The tower at night is cold and clear. The stars over the high desert fill the sky in a way that hasn\'t been visible since the power grid died. The Milky Way. You\'ve read about it. The sniper on night post works by starlight and scope optics and says, when you ask about the view: "I stopped looking at it. It makes the job harder."',
    shortDescription: 'Four containers stacked to a platform with a view south to The Dust and the faint shine of the Animas.',
    exits: {
      down: 'sc_07_warlords_command',
      north: 'sc_18_lookout_bluff',
    },
    richExits: {},
    items: [],
    enemies: [],
    npcs: [],
    hollowEncounter: {
      baseChance: 0.06,
      timeModifier: { day: 0.3, dusk: 1.5, night: 2.5, dawn: 0.8 },
      threatPool: [
        { type: 'remnant', weight: 60, quantity: { min: 1, max: 1, distribution: 'single' } },
        { type: 'shuffler', weight: 40, quantity: { min: 1, max: 2, distribution: 'weighted_low' } },
      ],
      awarenessRoll: { unaware: 0.5, awarePassive: 0.3, awareAggressive: 0.2 },
    },
    extras: [
      {
        keywords: ['view', 'south', 'dust', 'horizon', 'distance'],
        description: 'The Dust is visible as a yellower haze at the southern horizon — the high desert extending into territory that the Salters patrol but do not hold. You can see maybe forty miles on a clear day. At thirty miles out, something dark moves against the lighter ground. It could be a herd. From this distance, it\'s just: movement.',
      },
      {
        keywords: ['logbook', 'sightings', 'records', 'entries'],
        description: 'The logbook entries go back six months. The format is consistent: Day 1,847 — 0315 — Bearing 195 — 2-4 shufflers — Passed south, no approach. The last entry, from two nights ago: Day 1,855 — 2240 — Bearing 210 — Unknown type — Bipedal, stationary, observed compound for 22 minutes, withdrew. FLAGGED. The FLAGGED notation is in Briggs\'s handwriting.',
        cycleGate: 2,
        skillCheck: { skill: 'tracking', dc: 11, successAppend: 'Stationary, observing, then withdrawing. That\'s not Hollow behavior. The Hollow don\'t surveil. The FLAGGED notation is more significant than it looks.' },
      },
      {
        keywords: ['animas', 'river', 'silver', 'east'],
        description: 'The Animas cuts a silver line through the landscape to the east. From up here you can follow its path north toward Covenant territory and south toward the breaks. You can see, at the river\'s closest point to Salt Creek, a shallow ford — navigable in dry season. Briggs has the ford marked on his command maps with a red circle.',
      },
    ],
    personalLossEchoes: {
      child: 'From the tower you can see the Animas as a silver line, the Dust as a yellow haze, the road running south into distance that blurs geography into atmosphere. You have been looking from high places since you lost them, scanning every horizon for a shape you would recognize, a movement that could be small enough. The sniper scans the same way. He is looking for threats. You are looking for something else.',
      partner: 'The sniper says, when you ask about the view: "I stopped looking at it. It makes the job harder." You understand this with the immediate comprehension of someone who has also stopped looking at something beautiful because the beauty made the other thing worse. The stars. A particular angle of light. The shape of a specific absence against a sky that doesn\'t care.',
      community: 'The logbook entries: Day 1,847. Day 1,855. Two thousand days of someone watching the approaches, recording what they see, protecting the people inside the walls below. Your community had watchers too — people who checked on each other, who noticed when someone was missing, who kept the perimeter of belonging patrolled. The logbook format is different. The duty is the same.',
      promise: 'Bearing 210. Unknown type. Observed compound for 22 minutes, withdrew. FLAGGED. The entry is Briggs\'s handwriting. Something watched Salt Creek for twenty-two minutes and then left. You have been watching your promise for longer than that. You have not withdrawn. You do not know if that makes you more like the sentry or more like the thing outside.',
    },
    environmentalRolls: {
      flavorLines: [
        { line: 'The wind at tower height carries the particular cold of altitude gained by structure rather than geography — an industrial cold, the cold of steel and open air.', chance: 0.20, time: null },
        { line: 'The Animas catches the light for a moment and flashes silver across its full visible length, a signal that means nothing to anyone but reaches you anyway.', chance: 0.15, time: ['day', 'dawn'] },
        { line: 'The sniper shifts position by inches, the scope tracking something on the southern approach that you cannot see. He relaxes. Whatever it was decided not to come closer.', chance: 0.20, time: ['day', 'dusk'] },
      ],
    },
    npcSpawns: [
      {
        npcId: 'watchtower_sniper',
        spawnChance: 0.65,
        spawnType: 'anchored',
        activityPool: [
          { desc: 'The sniper scans the southern approach through a scope, moving in the slow methodical pattern of a professional who has learned not to hurry the looking.', weight: 3 },
          { desc: 'The sniper is logging an entry in the watchtower book, writing without taking his eyes fully from the south horizon.', weight: 2 },
        ],
        dispositionRoll: { friendly: 0.0, neutral: 0.5, wary: 0.4, hostile: 0.1 },
        dialogueTree: 'sc_watchtower_sniper',
      },
    ],
    itemSpawns: [],
  },

  // ----------------------------------------------------------
  // SC-11: Motor Pool
  // ----------------------------------------------------------
  {
    id: 'sc_11_motor_pool',
    name: 'Salt Creek — Motor Pool',
    zone: 'salt_creek',
    act: 1,
    difficulty: 2,
    visited: false,
    flags: { noCombat: true, questHub: true },
    description: 'The motor pool is the noisiest room in Salt Creek — a partially covered bay where two vehicles occupy most of the floor space and the people working on them are in constant productive argument with physics. The two trucks: a pre-Collapse diesel pickup in good condition and an older military utility vehicle in the process of having its engine replaced. The mechanic running the motor pool is a young man named Cutter who speaks to vehicles in a different register than he speaks to people and appears to trust the vehicles more. The smell of diesel and metal and the particular mineral smell of very old engine oil recently disturbed.',
    descriptionNight: 'Cutter works nights when a deadline is on. The motor pool at night is one lantern and the sound of tools and occasionally Cutter\'s voice telling a crankshaft what it has to do.',
    shortDescription: 'Two trucks, one mechanic, a deadline from Briggs, and the smell of diesel that means someone is keeping something running.',
    exits: {
      east: 'sc_04_the_yard',
      west: 'sc_19_mechanics_workshop',
    },
    richExits: {},
    items: [],
    enemies: [],
    npcs: [],
    extras: [
      {
        keywords: ['trucks', 'vehicles', 'pickup', 'diesel'],
        description: 'The diesel pickup has been running since before the Collapse and is still running because Cutter treats it like a patient rather than equipment. The military utility vehicle — a former Forest Service truck that got repurposed early in year one — needs a rebuilt fuel system. Cutter has most of the parts. Most.',
      },
      {
        keywords: ['cutter', 'mechanic', 'engine'],
        description: 'Cutter got his name because he was a machinist before the Collapse who specialized in precision cutting. He is twenty-six years old. He has kept Salt Creek\'s vehicles running for three years through the combination of MacGyver-grade improvisation and the kind of deep mechanical intuition that amounts to a different language.',
        skillCheck: { skill: 'mechanics', dc: 9, successAppend: 'Cutter turns around when he hears you work through the problem correctly. "You know motors," he says, with the relief of someone who has been talking to himself for too long.' },
      },
      {
        keywords: ['fuel', 'diesel', 'supply', 'shortage'],
        description: 'The fuel situation is posted on a board: CURRENT RESERVE — 47 GALLONS. OPERATIONAL MINIMUM — 100 GALLONS. REQUIRED ACTION: FUEL RUN SOUTHWEST CACHE. Underneath, in Briggs\'s hand: CUTTER — GET THIS DONE. The date on the note is nine days ago. The fuel run requires personnel Briggs hasn\'t assigned yet, which is the situation Briggs resolves by making the need visible until someone takes it on.',
      },
    ],
    personalLossEchoes: {
      child: 'Cutter talks to the vehicles in a different register than he talks to people. You recognize the impulse — the specific tenderness reserved for things that need you, that depend on your attention to keep running. You talked to them that way once. Not to machines. To a person small enough to need everything you had.',
      partner: 'The diesel pickup has been running since before the Collapse because someone loved it enough to keep it alive. Cutter treats it like a patient. You think about the maintenance of love — the daily attention, the small repairs, the constant work of keeping something running that the world is trying to break. You did that work once. The thing you maintained ran anyway.',
      promise: 'CURRENT RESERVE — 47 GALLONS. OPERATIONAL MINIMUM — 100 GALLONS. The deficit posted on the board in plain numbers, the gap between what is and what needs to be. Your promise has a deficit too — the distance between where you are and where you swore you would get to, posted on no board, visible to no one but you, and the fuel run has not been assigned.',
    },
    environmentalRolls: {
      flavorLines: [
        { line: 'Cutter swears at something under the truck with the focused profanity of a person who has identified a specific problem and is addressing it in the only language the problem understands.', chance: 0.25, time: null },
        { line: 'The diesel smell is strong today. Something is leaking, or Cutter is bleeding a line, or both. The motor pool always smells like the continuation of something that should have stopped working years ago.', chance: 0.20, time: null },
        { line: 'A wrench hits concrete with the specific ring of dropped tools in enclosed spaces. A pause. Cutter\'s voice: "That was on purpose." It was not on purpose.', chance: 0.15, time: ['day'] },
      ],
    },
    npcSpawns: [
      {
        npcId: 'mechanic_cutter',
        spawnChance: 0.85,
        spawnType: 'anchored',
        activityPool: [
          { desc: 'Cutter is under the military truck, visible only as boots and the occasional swear word, working something loose with steady torque.', weight: 3 },
          { desc: 'Cutter stands back from the diesel pickup with his arms folded, looking at it in the diagnostician\'s mode — not doing, thinking.', weight: 2 },
          { desc: 'Cutter is sorting salvaged engine parts in a bin, holding each up to the light, setting aside the ones that meet his standard and dropping the rest.', weight: 2 },
        ],
        dispositionRoll: { friendly: 0.2, neutral: 0.5, wary: 0.3, hostile: 0.0 },
        dialogueTree: 'sc_cutter_motor_pool',
        questGiver: ['sc_motor_pool_fuel'],
      },
    ],
    itemSpawns: [
      {
        entityId: 'salvaged_engine_part',
        spawnChance: 0.40,
        quantity: { min: 1, max: 2, distribution: 'weighted_low' },
        conditionRoll: { min: 0.4, max: 0.8 },
        groundDescription: 'A salvaged engine component sits in a parts bin near the bay door.',
        depletion: { cooldownMinutes: { min: 180, max: 480 }, respawnChance: 0.30 },
      },
    ],
  },

  // ----------------------------------------------------------
  // SC-12: The Brig
  // ----------------------------------------------------------
  {
    id: 'sc_12_the_brig',
    name: 'Salt Creek — The Brig',
    zone: 'salt_creek',
    act: 1,
    difficulty: 2,
    visited: false,
    flags: { noCombat: true, questHub: true },
    description: 'The Salter brig is a converted container cell block — three cells in a row, each welded shut except for a food slot and a barred window slit. Two are occupied. The first holds a young man in Accord armbands who was picked up near the eastern perimeter — he says he was traveling through, the Salters say the route he was traveling didn\'t lead through anything you\'d go through by accident. The second holds a woman who gives no affiliation and no name and sits in the back corner of her cell facing the wall, which is either psychological tactics or something you don\'t want to know about. The brig guard is unhappy about this posting and shows it in the way unhappy people do: by explaining, to anyone who will listen, exactly why he shouldn\'t be the one doing this.',
    descriptionNight: 'The brig is quieter at night. The Accord man sleeps, or pretends to. The nameless woman doesn\'t move, which you note is different from sleeping.',
    shortDescription: 'Three cells, two prisoners, one unhappy guard, and a moral question Briggs has handed to someone else to resolve.',
    exits: {
      north: 'sc_09_the_pit',
      west: 'sc_17_the_brig',
    },
    richExits: {},
    items: [],
    enemies: [],
    npcs: [],
    extras: [
      {
        keywords: ['accord man', 'prisoner', 'young man', 'armbands'],
        description: '"I\'m not a spy," the Accord man says, and then, more quietly: "Okay, I am technically a scout, but that\'s different from a spy." He has an open, slightly desperate face that makes this admission involuntary-seeming, which might be tactic or might be genuine. He wants to be released. He has information about Covenant patrol patterns and will trade it. Briggs hasn\'t decided yet whether to let you be the one who decides.',
        questGate: 'sc_brig_moral_choice',
      },
      {
        keywords: ['nameless woman', 'woman', 'second cell', 'facing wall'],
        description: 'She hasn\'t spoken. The guard says she hasn\'t spoken since they brought her in four days ago. She eats when food is provided. She doesn\'t sleep in any position the guard has ever observed a sleeping person use. The guard logs this in his brig journal under the heading UNKNOWN and has been hoping someone else will make a decision about it.',
        skillCheck: { skill: 'perception', dc: 14, successAppend: 'The way she sits isn\'t normal stillness. She\'s controlled stillness — the position of someone with enhanced senses managing sensory load. She knows everything that\'s happened in this room since they brought her in.' },
      },
      {
        keywords: ['guard', 'brig guard', 'posting'],
        description: '"This isn\'t my job," the guard says. "I\'m a patrol specialist. I don\'t do containment. I don\'t do philosophical questions about what to do with people who might be Accord or might be worse. I do patrols." He says this with the particular energy of someone who has been saying it and will continue saying it.',
      },
      {
        keywords: ['confiscated', 'raid', 'evidence', 'vials', 'blood', 'sanguine', 'crate'],
        description: 'A wooden crate marked CONFISCATED — PATROL 7 — SOUTH SECTOR sits against the back wall of the brig. Inside: three glass vials of animal blood, stoppered with wax, each labeled in a hand that took care with the labeling. A leather satchel containing dried herbs and a field journal with entries about "feeding cycles" and "satiation thresholds" written in the clinical tone of someone conducting research, not hunting. A patrol report clipped to the crate lid reads: "Suspected Sanguine enclave, grid ref S-14. Four occupants. No hostile action observed. No human blood products found. Occupants detained per Standing Order 9." Below, in a different hand: "Occupants released to the Dust after 48h. Enclave cleared and burned per S.O. 9 paragraph 3." The vials are still here. Nobody has come back for them. Nobody is going to.',
        skillCheck: { skill: 'field_medicine', dc: 10, successAppend: 'The blood in the vials is animal — goat or sheep, preserved with a salt-and-herb mixture that would keep it viable for weeks. This is a Lucid Sanguine\'s supply kit: someone managing their condition with animal blood, methodically, without harming anyone. The patrol burned their home anyway.' },
      },
    ],
    npcSpawns: [
      {
        npcId: 'brig_prisoner_accord',
        spawnChance: 0.95,
        spawnType: 'anchored',
        activityPool: [
          { desc: 'The Accord scout sits against the cell wall with his knees up, watching the door with the transparent hope of someone who hasn\'t given up on being rescued.', weight: 4 },
          { desc: 'The scout is pacing — three steps, turn, three steps — the only exercise his cell allows. He stops when you approach.', weight: 2 },
        ],
        dispositionRoll: { friendly: 0.4, neutral: 0.4, wary: 0.2, hostile: 0.0 },
        dialogueTree: 'sc_brig_accord_prisoner',
        questGiver: ['sc_brig_moral_choice'],
      },
      {
        npcId: 'brig_guard',
        spawnChance: 0.95,
        spawnType: 'anchored',
        activityPool: [
          { desc: 'The brig guard is writing in his log with the exhausted diligence of someone maintaining professionalism through sheer stubbornness.', weight: 3 },
          { desc: 'The guard is looking at the second cell with an expression you recognize as the human response to something that makes you feel wrong without knowing exactly why.', weight: 2 },
        ],
        dispositionRoll: { friendly: 0.1, neutral: 0.6, wary: 0.3, hostile: 0.0 },
        dialogueTree: 'sc_brig_guard',
      },
    ],
    itemSpawns: [],
  },

  // ----------------------------------------------------------
  // SC-13: Briggs's Quarters
  // ----------------------------------------------------------
  {
    id: 'sc_13_briggs_quarters',
    name: 'Salt Creek — Briggs\'s Quarters',
    zone: 'salt_creek',
    act: 2,
    difficulty: 3,
    visited: false,
    flags: { noCombat: true },
    cycleGate: 2,
    description: 'Briggs\'s quarters are at the top of the container stack — private access, the only room in the stronghold with a lock that only he holds. The room is larger than the barracks bunks but not by much, and the extra space is occupied by the things a person accumulates when they\'ve been responsible for something important for a long time: more maps, a second radio unit, two locked strongboxes under the cot, and along the back wall, a shelf of personal items. Among them: a pre-Collapse ID badge, lanyard still attached, the photo worn smooth by handling. The name on it is MAJOR D. BRIGGS, USMC. The facility name above the logo is MERIDIAN SECURE RESEARCH FACILITY. The badge is faced down. It has been placed that way deliberately. You know this because everything in this room has been placed deliberately.',
    descriptionNight: 'Briggs sleeps here occasionally. When he does, he sleeps with the ID badge face-up. You learn this because the night sentry change happens to coincide with a moment when his door is briefly open. You note it. You do not comment on it.',
    shortDescription: 'Briggs\'s private quarters — a face-down ID badge from MERIDIAN, and two locked boxes under the cot.',
    exits: {
      down: 'sc_07_warlords_command',
    },
    richExits: {
      down: {
        destination: 'sc_07_warlords_command',
        reputationGate: { faction: 'salters', minLevel: 3 },
        cycleGate: 2,
        descriptionVerbose: 'access to Briggs\'s private quarters — Blooded Salter standing and Cycle 2+ required',
      },
    },
    items: [],
    enemies: [],
    npcs: [],
    extras: [
      {
        keywords: ['id badge', 'badge', 'meridian', 'major', 'marine'],
        description: 'You turn the badge over. The photo is Briggs, younger, in dress uniform, the expression the particular neutral of official photography. MAJOR D. BRIGGS, USMC. SECURITY CLEARANCE: TOP SECRET/SCI. FACILITY: MERIDIAN SECURE RESEARCH FACILITY — ASSIGNMENT: PERIMETER SECURITY COMMAND. The facility seal shows a double helix and a mountain silhouette you recognize: the Scar.',
        cycleGate: 2,
        skillCheck: { skill: 'lore', dc: 10, successAppend: 'PERIMETER SECURITY COMMAND. Not lab security. Not building security. Perimeter. The kind of posting that means keeping things in, not keeping things out. Briggs wasn\'t guarding the facility. He was keeping the facility contained.' },
      },
      {
        keywords: ['strongbox', 'locked box', 'cot', 'under'],
        description: 'Two military-grade strongboxes, padlocked, under the cot. You can read the labels on their tops: Box 1 is labeled PERSONAL — DNO. Box 2 has a label that has been removed, the adhesive residue still there, and in its place a piece of tape in Briggs\'s hand: MERIDIAN LOG — CYCLE 0.',
        cycleGate: 2,
        questGate: 'sc_briggs_meridian_revelation',
      },
      {
        keywords: ['radio', 'second unit', 'unlabeled'],
        description: 'The second radio in Briggs\'s quarters is on the same unlabeled frequency you noticed in the command room. It\'s broadcasting on receive only. A light blinks at irregular intervals — incoming signal, intermittent. The pattern is not random. It has the structure of a repeating automated broadcast: short, long, short, long-short-long. Someone who knows Morse would find this significant.',
        cycleGate: 2,
        skillCheck: { skill: 'electronics', dc: 12, successAppend: 'Morse. SOS is too simple — this is alphanumeric. You decode enough to read: ...M-E-R... and then the signal fades. It cycles back six seconds later. MERIDIAN is broadcasting, and Briggs has been listening.' },
      },
      {
        keywords: ['shelf', 'personal items', 'things'],
        description: 'The shelf: a unit citation from the Marine Corps, framed, the glass cracked. A photograph of a squad, twelve people in desert cammies squinting into the sun, the location unidentifiable. A folded piece of paper with a single equation on it — you\'d need a chemistry background to know what it represents. A small piece of dried plant material in a glass vial, labeled: CHARON-7 BLOOM — MERIDIAN PERIMETER — 2031. He kept it.',
        cycleGate: 2,
      },
      // === CONVOY remnant-story-0329 Rider D ===
      {
        keywords: ['cairn', 'stones', 'memorial', 'marker'],
        description: 'A stone cairn in the corner of the room: one upright stone, forty-seven smaller stones arranged around its base in a careful ring. The stones are clean. No dust. Briggs maintains this. Nobody else comes to this room, so nobody else has seen it, and nobody has asked him what it means. The smaller stones are all approximately the same size. Forty-seven of them.',
        cycleGate: 2,
        skillCheck: { skill: 'perception', dc: 11, successAppend: 'The theater bombing, as you know it, killed forty-seven people. The number was in the Accord\'s incident documentation. Briggs knows the number. He has never said it aloud to anyone. He has built it instead, in stone, where it cannot be avoided.' },
      },
      // === END CONVOY remnant-story-0329 Rider D ===
    ],
    personalLossEchoes: {
      child: 'The photograph of a squad on the shelf. Twelve people squinting into the sun. Some of them had children. Briggs has a locked box labeled PERSONAL — DNO. Do Not Open. You understand the instruction. Some things you keep locked because opening them means the grief gets air.',
      partner: 'The ID badge, face-down. Placed that way deliberately. Someone who puts a photograph face-down is someone who can\'t bear to see the face but can\'t bear to throw it away. You know this gesture. You\'ve made it yourself, with something that belonged to them, turned away but kept.',
      community: 'The unit citation, framed, glass cracked. A squad of twelve. Briggs built Salt Creek the way you build a thing to replace the thing you lost — same shape, same discipline, different people. You recognize the architecture of grief disguised as purpose.',
      identity: 'MAJOR D. BRIGGS, USMC. The badge is worn smooth from handling. He touches it. He knows who he was. The knowing hasn\'t helped him become someone new — it\'s kept him the same, in a room at the top of a fortress, holding a credential from a world that ended. You don\'t have a badge. You might be luckier.',
      promise: 'MERIDIAN LOG — CYCLE 0. Briggs kept the record. He has been carrying this since before the Collapse — the knowledge, the guilt, the obligation to do something about it. You look at his strongbox and you think about your own box, the one you carry without a padlock, the promise that doesn\'t fit in a container.',
    },
    npcSpawns: [],
    itemSpawns: [
      {
        entityId: 'meridian_security_log',
        spawnChance: 0.0,
        quantity: { min: 1, max: 1, distribution: 'single' },
        conditionRoll: { min: 0.8, max: 1.0 },
        groundDescription: 'The MERIDIAN security log, accessible only through the locked strongbox.',
        depletion: { cooldownMinutes: { min: 99999, max: 99999 }, respawnChance: 0.0 },
      },
    ],
    narrativeNotes: 'Blooded Salter + Cycle 2+ gate. This room reframes Briggs\'s entire character. He wasn\'t just military — he was MERIDIAN security. His aggression toward the Scar is personal.',
  },

  // ----------------------------------------------------------
  // SC-14: The South Wall
  // ----------------------------------------------------------
  {
    id: 'sc_14_south_wall',
    name: 'Salt Creek — The South Wall',
    zone: 'salt_creek',
    act: 1,
    difficulty: 3,
    visited: false,
    flags: { noCombat: false, questHub: true },
    description: 'The south wall faces The Dust and the broken country beyond, and it has the character of something defending against a direction that doesn\'t stop producing threats. The wall is adequate — shipping container panels bolted to a concrete footing — but its maintenance has fallen behind the north and east sections, and the gap in priority is visible in small ways: a panel with a loose lower bolt, a firing port that has been field-repaired with epoxy that\'s beginning to crack, a section of the firing step that flexes slightly under weight. The Hollow come from the south. They always come from the south. The current wall is adequate for what came last time and less adequate for what might come next time, and everyone on this wall knows the math.',
    descriptionNight: 'The south wall at night is the most active post in the stronghold. Three sentries minimum, armed with everything that doesn\'t need to be saved for something worse. In the six months of deployment here, this post has had four engagement incidents — more than any other section. The sentries don\'t discuss this. They\'re aware of it.',
    shortDescription: 'The south wall — facing The Dust, showing its maintenance gaps, and with more engagement incidents than anywhere else.',
    exits: {
      north: 'sc_04_the_yard',
      east: 'sc_15_creek_ford',
    },
    richExits: {},
    items: [],
    enemies: [],
    npcs: [],
    hollowEncounter: {
      baseChance: 0.25,
      timeModifier: { day: 0.5, dusk: 2.0, night: 3.5, dawn: 1.5 },
      threatPool: [
        { type: 'shuffler', weight: 50, quantity: { min: 2, max: 4, distribution: 'bell' } },
        { type: 'brute', weight: 25, quantity: { min: 1, max: 1, distribution: 'single' } },
        { type: 'remnant', weight: 15, quantity: { min: 1, max: 2, distribution: 'weighted_low' } },
        { type: 'screamer', weight: 10, quantity: { min: 1, max: 1, distribution: 'single' } },
      ],
      awarenessRoll: { unaware: 0.2, awarePassive: 0.2, awareAggressive: 0.6 },
      noiseModifier: -3,
    },
    extras: [
      {
        keywords: ['loose panel', 'bolt', 'maintenance', 'weakness'],
        description: 'The loose lower bolt on the third panel from the east has been logged four times in the maintenance system. A work order exists. The work order requires a specific bolt size that hasn\'t been sourced yet. The panel moves perhaps two centimeters at the base when significant force is applied. A Hollow brute generates significant force. The math is straightforward.',
        questGate: 'sc_hollow_clearance',
        skillCheck: { skill: 'mechanics', dc: 8, successAppend: 'You can improvise a fix. Not ideal, not permanent, but sufficient until the right bolt is sourced. It would take twenty minutes and what you have in your kit.' },
      },
      {
        keywords: ['south', 'view', 'dust', 'landscape'],
        description: 'The view south from the firing step: the strip of cleared kill zone, then the transition to open ground, then the broken country that grades into The Dust. The horizon is hazy. Things move in the middle distance in the way that things move in open country when you can\'t resolve individual shapes — could be wind, could be animals, could be the wrong kind of movement entirely.',
      },
      {
        keywords: ['incident', 'engagement', 'records', 'attacks'],
        description: 'The engagement log for the south wall is posted at the western end of the firing step: four incidents in six months, dated. The most recent was eleven days ago — three shufflers and a brute, breached the outer fence but were engaged at the wall. The brute dented the compromised panel. The note says: URGENT REPAIR REQUIRED. Below it, in a different hand: STILL URGENT.',
      },
    ],
    npcSpawns: [
      {
        npcId: 'south_wall_sentry',
        spawnChance: 0.95,
        spawnType: 'patrol',
        quantity: { min: 2, max: 3, distribution: 'weighted_low' },
        activityPool: [
          { desc: 'A sentry on the south wall scans the broken country beyond the kill zone with an intensity that has the quality of anticipation rather than vigilance.', weight: 3 },
          { desc: 'Two sentries confer quietly at the compromised panel, one pointing at the loose bolt, the other writing something in a small notebook. Both sets of eyes keep returning south.', weight: 2 },
        ],
        dispositionRoll: { friendly: 0.1, neutral: 0.4, wary: 0.4, hostile: 0.1 },
        dialogueTree: 'sc_south_wall_defense',
        questGiver: ['sc_hollow_clearance'],
      },
      {
        npcId: 'south_wall_children',
        spawnChance: 0.25,
        spawnType: 'ambient',
        quantity: { min: 2, max: 4, distribution: 'weighted_low' },
        activityPool: [
          { desc: 'Three boys crouch at the base of the wall, passing a notched stick between them. Each time a sentry calls a sighting from the firing step, the boy holding the stick cuts a new mark. "Fourteen today," one says. "Yesterday was nineteen." They are keeping score of the Hollow the way other children once kept score of baseball games.', weight: 3 },
          { desc: 'A pair of boys watch the patrol change from behind a supply crate, whispering counts to each other. One has a stick with so many notch marks the wood is more gap than grain. He holds it like a trophy.', weight: 2 },
          { desc: 'A boy sits alone at the base of the wall, carving tallies into a length of broomstick with a pocket knife. He doesn\'t look up. The counting is its own kind of duty.', weight: 2 },
        ],
        dispositionRoll: { friendly: 0.3, neutral: 0.5, wary: 0.2, hostile: 0.0 },
      },
    ],
    itemSpawns: [
      {
        entityId: 'ammo_shotgun_shell',
        spawnChance: 0.35,
        quantity: { min: 2, max: 4, distribution: 'weighted_low' },
        conditionRoll: { min: 0.7, max: 1.0 },
        groundDescription: 'A loose cluster of shotgun shells sits by the firing port — left by the last shift.',
        depletion: { cooldownMinutes: { min: 60, max: 180 }, respawnChance: 0.35 },
      },
    ],
  },

  // ----------------------------------------------------------
  // SC-15: Creek Ford
  // ----------------------------------------------------------
  {
    id: 'sc_15_creek_ford',
    name: 'Salt Creek — Creek Ford',
    zone: 'salt_creek',
    act: 1,
    difficulty: 2,
    visited: false,
    flags: { waterSource: true },
    description: 'The creek here is shallow enough to cross on foot — ankle-deep in dry season, thigh-deep and treacherous in rain, when the current comes off the mesa with an urgency that has claimed vehicles and unprepared people both. The ford is marked with painted stakes on each bank. The Salters charge a toll at this crossing: two pennies per person, five per cart, more if they think they can get it. A patrol walks the bank in a slow circuit, watching both the crossing and the high ground east, where the road from the river meets the creek. The stones on the ford floor are slick and unevenly spaced. Even a confident crossing requires attention. An inattentive crossing is a story someone tells about you afterward.',
    descriptionNight: 'The ford at night is sound first — the creek moving over stone in the dark, the particular quality of water-noise that carries. The patrol works the bank with a red-filtered lantern, dim enough not to ruin night vision, bright enough to see the toll ledger. The current sounds louder than it is. You notice this and then you are not sure it is true.',
    shortDescription: 'A shallow creek crossing with marked stakes, a Salter toll post, and a patrol walking the bank.',
    exits: {
      north: 'sc_01_outer_perimeter',
      west: 'sc_14_south_wall',
      east: 'pens_01_east_gate',
    },
    richExits: {
      east: {
        destination: 'pens_01_east_gate',
        descriptionVerbose: 'east, along the creek road toward the Red Court facility — what the prisoners here call Mercy General',
        questGate: 'sc_prisoner_intel',
      },
    },
    items: [],
    enemies: [],
    npcs: [],
    hollowEncounter: {
      baseChance: 0.12,
      timeModifier: { day: 0.4, dusk: 1.5, night: 2.5, dawn: 0.8 },
      threatPool: [
        { type: 'shuffler', weight: 60, quantity: { min: 1, max: 3, distribution: 'bell' } },
        { type: 'remnant', weight: 25, quantity: { min: 1, max: 1, distribution: 'single' } },
        { type: 'sanguine_feral', weight: 15, quantity: { min: 1, max: 1, distribution: 'single' } },
      ],
      awarenessRoll: { unaware: 0.4, awarePassive: 0.3, awareAggressive: 0.3 },
      noiseModifier: 1.5,
    },
    extras: [
      {
        keywords: ['ford', 'crossing', 'creek', 'stakes', 'water'],
        description: 'The ford stakes are painted alternating red and white, spaced roughly a meter apart in two lines — follow between them and you hit the shallowest path. Go outside the stakes in rain season and the ledge drops to three feet in two steps. Briggs had the stakes installed after a supply cart was lost in the second spring. The loss was the cart, two crates of ammunition, and the driver\'s confidence in this particular creek.',
      },
      {
        keywords: ['toll', 'pennies', 'payment', 'ledger'],
        description: 'The toll ledger is kept in an oilskin wrap at the patrol post — every crossing logged with date, direction, party size, what they paid, and a one-word description of disposition. The categories: COOPERATIVE, RELUCTANT, ARGUED, WAIVED. The WAIVED entries are rare and in a different color ink, which means someone above the patrol made the call. Most of the WAIVED entries have a small notation: B, which means Briggs.',
        skillCheck: { skill: 'perception', dc: 10, successAppend: 'Three WAIVED entries in the last two weeks, all for parties traveling south without cargo. B notation on all three. Briggs is moving people through without logging what they\'re doing.' },
      },
      {
        keywords: ['current', 'rain', 'flood', 'treacherous'],
        description: 'The high-water mark is visible on the east bank stake: two feet above the current level, stained dark by sediment. At that level, the current is strong enough to take a person off their feet. The mark has been painted over once, higher, and the original mark is still faintly visible beneath the new paint. The creek has risen beyond even the adjusted mark at least once.',
      },
    ],
    npcSpawns: [
      {
        npcId: 'salter_perimeter_guard',
        spawnChance: 0.95,
        spawnType: 'patrol',
        quantity: { min: 1, max: 2, distribution: 'weighted_low' },
        activityPool: [
          { desc: 'A Salter patrol works the bank in a circuit, eyes moving between the ford and the high ground east. They stop when they see you and wait for you to explain yourself.', weight: 4 },
          { desc: 'The patrol is at the toll post, logging an entry in the crossing ledger. One hand stays near a sidearm while the other writes. They look up without hurry.', weight: 3 },
        ],
        dispositionRoll: { friendly: 0.0, neutral: 0.3, wary: 0.5, hostile: 0.2 },
        dialogueTree: 'sc_ford_toll_patrol',
      },
    ],
    itemSpawns: [
      {
        entityId: 'water_container_clean',
        spawnChance: 0.30,
        quantity: { min: 1, max: 1, distribution: 'single' },
        conditionRoll: { min: 0.7, max: 1.0 },
        groundDescription: 'A discarded water container, left by a traveler who refilled and moved on.',
        depletion: { cooldownMinutes: { min: 120, max: 360 }, respawnChance: 0.20 },
      },
    ],
  },

  // ----------------------------------------------------------
  // SC-16: Armory Annex
  // ----------------------------------------------------------
  {
    id: 'sc_16_armory_annex',
    name: 'Salt Creek — Armory Annex',
    zone: 'salt_creek',
    act: 2,
    difficulty: 3,
    visited: false,
    flags: { noCombat: true },
    description: 'The armory annex is a secondary storage container attached to the main armory by a welded passage — smaller, older, and considerably less organized. This is where the weapons that didn\'t make the quality cut live, alongside the repair tools, the parts bins, and a locked cage in the back corner where the Salters keep confiscated weapons from travelers who tried to bring them through the toll without declaring or who couldn\'t pay the crossing and had their gear taken as settlement. The cage has a padlock that has seen better decades. A handwritten inventory on the door lists everything inside, with the date seized and a column labeled DISPOSITION that is mostly blank. Someone is supposed to decide what to do with these weapons. That someone has not decided.',
    descriptionNight: 'The annex at night is unlit. If you\'re in here after dark, you found your own way in, and you should know that Reyes does a nightly count on the cage padlock and can tell by the scratches if someone has had tools near it.',
    shortDescription: 'Secondary weapons storage — older gear, repair tools, and a padlocked cage of confiscated arms from travelers who didn\'t pay.',
    exits: {
      west: 'sc_08_armory',
    },
    richExits: {
      west: {
        destination: 'sc_08_armory',
        reputationGate: { faction: 'salters', minLevel: 2 },
        descriptionVerbose: 'the armory annex — Trusted Salter standing required',
      },
    },
    items: [],
    enemies: [],
    npcs: [],
    extras: [
      {
        keywords: ['cage', 'confiscated', 'locked', 'padlock', 'inventory'],
        description: 'The cage inventory: one hunting rifle, barrel cracked, seized from a Drifter party three weeks ago. Two sidearms, different calibers, seized from a traveler who crossed without declaring — the notation says TRIED TO BLUFF REYES, which is annotated with a single word: AMUSING. A machete, good condition. A pre-Collapse military knife in a belt sheath, no name on the blade but a serial number Reyes has partially decoded. She thinks it\'s Navy. The DISPOSITION column says: UNKNOWN — AWAIT COMMAND DECISION.',
        skillCheck: { skill: 'lockpicking', dc: 13, successAppend: 'The padlock is old but not hopeless. It would take time and quiet. Both of those things are in shorter supply than the skill.' },
      },
      {
        keywords: ['repair tools', 'tools', 'parts', 'bins'],
        description: 'The repair station is a folding table loaded with gunsmithing tools — punches, drifts, a barrel vice, several types of files. The parts bins are sorted by caliber and type, the labels hand-written in the same precise print as everything in the main armory. Someone has been working here recently: a disassembled bolt-action on the table, parts laid out in order, a cloth underneath to catch springs.',
        skillCheck: { skill: 'marksmanship', dc: 9, successAppend: 'The work on the disassembled rifle is good — careful, unhurried. The parts are in proper disassembly order. Whoever is working on this knows what they\'re doing.' },
      },
      {
        keywords: ['older', 'worn', 'second tier', 'reject'],
        description: 'The weapons rack in the annex tells a history of what the Salters started with before the main armory matured: bolt-actions of uncertain provenance, a lever-action with a repaired stock, a shotgun with a barrel that someone has shortened without sufficient attention to why barrels are the length they are. Not bad weapons. Not weapons you\'d pick if you had the armory next door to choose from instead.',
      },
    ],
    npcSpawns: [],
    itemSpawns: [
      {
        entityId: 'salvaged_firearm_part',
        spawnChance: 0.45,
        quantity: { min: 1, max: 3, distribution: 'weighted_low' },
        conditionRoll: { min: 0.3, max: 0.7 },
        groundDescription: 'A small parts bin near the repair table contains loose firearm components.',
        depletion: { cooldownMinutes: { min: 240, max: 720 }, respawnChance: 0.25 },
      },
    ],
  },

  // ----------------------------------------------------------
  // SC-17: The Brig (Holding Block)
  // ----------------------------------------------------------
  {
    id: 'sc_17_the_brig',
    name: 'Salt Creek — The Brig',
    zone: 'salt_creek',
    act: 1,
    difficulty: 2,
    visited: false,
    flags: { noCombat: true },
    description: 'The detention block is the part of the brig the Salters don\'t advertise — a second container run off the main cell block, used when the primary cells are occupied or when Briggs wants someone held without it going in the formal log. The container has been fitted with a single heavy bar across the exterior latch and ventilation cuts in the roof panels, the minimum specification for keeping someone alive in the high desert heat. The floor is bare metal. There\'s a bucket. The lighting is a strip of wire with a single bulb on a pull cord. This room does not answer to the Accord\'s detention standards. The Salters are aware of this. They consider it a feature, not a gap.',
    descriptionNight: 'At night, the holding block has a particular quality — the sounds of the compound reduced to distant and the occupant\'s own breathing very present. The guard checks the exterior bar every two hours. The interval is regular enough to count by.',
    shortDescription: 'An unofficial holding container with a bar latch, a bucket, and no connection to the Accord\'s justice system.',
    exits: {
      east: 'sc_12_the_brig',
    },
    richExits: {},
    items: [],
    enemies: ['sanguine_feral'],
    npcs: [],
    hollowEncounter: {
      baseChance: 0.04,
      timeModifier: { day: 0.5, dusk: 1.5, night: 2.0, dawn: 1.0 },
      threatPool: [
        { type: 'remnant', weight: 70, quantity: { min: 1, max: 1, distribution: 'single' } },
        { type: 'sanguine_feral', weight: 30, quantity: { min: 1, max: 1, distribution: 'single' } },
      ],
      awarenessRoll: { unaware: 0.3, awarePassive: 0.4, awareAggressive: 0.3 },
    },
    extras: [
      {
        keywords: ['bar', 'latch', 'door', 'exterior'],
        description: 'The exterior bar is a length of rebar set in two welded brackets — not sophisticated, not escapable without tools or someone on the other side. The brackets are welded with more care than anything else in the room. Briggs had someone do that specifically.',
        skillCheck: { skill: 'lockpicking', dc: 15, successAppend: 'From inside, there\'s no play in the bar. From outside, you could lift it in two seconds. The security design assumes the threat is inside wanting out, not outside wanting in.' },
      },
      {
        keywords: ['bucket', 'floor', 'metal', 'bare', 'conditions'],
        description: 'The floor of the container holds the heat of the day well into the night and loses it quickly before dawn — you\'d be cold in the early hours and baking by midday. The bucket has been used and emptied recently enough that the smell is present. On the wall, at approximately sitting height, someone has scratched marks: tallies, thirty-seven of them. You do not know how long thirty-seven means.',
      },
      {
        keywords: ['tallies', 'scratches', 'wall', 'marks'],
        description: 'Thirty-seven tally marks in four groups of nine and one of one. Below them, barely legible, two words scratched with what must have been a sharp edge worked at patiently: STILL HERE. You cannot tell if it was a declaration of survival or a lament.',
        questGate: 'sc_brig_moral_choice',
      },
    ],
    npcSpawns: [
      {
        npcId: 'shed_guard',
        spawnChance: 0.70,
        spawnType: 'anchored',
        activityPool: [
          { desc: 'The guard sits on an overturned crate outside the holding container, a rifle across his knees, expression suggesting this post was not what he trained for.', weight: 3 },
          { desc: 'The guard checks the exterior bar, grips it, tests it, logs the check in a small notebook, and returns to his crate. He has done this twenty times today. He will do it again.', weight: 3 },
        ],
        dispositionRoll: { friendly: 0.1, neutral: 0.5, wary: 0.3, hostile: 0.1 },
        dialogueTree: 'sc_brig_exterior_guard',
      },
    ],
    itemSpawns: [],
  },

  // ----------------------------------------------------------
  // SC-18: Lookout Bluff
  // ----------------------------------------------------------
  {
    id: 'sc_18_lookout_bluff',
    name: 'Salt Creek — Lookout Bluff',
    zone: 'salt_creek',
    act: 1,
    difficulty: 2,
    visited: false,
    flags: { noCombat: false },
    description: 'The bluff rises sharply north of the compound — a natural sandstone shelf that adds twelve meters of elevation in fifty of horizontal distance, and from the top opens a sight line north that covers the river road to the horizon and everything between. The Salters did not build this position, only claimed it: a low stone parapet along the leading edge, a sandbag emplacement at the northeast corner where the road angle is most acute, and a notched log seat that has been there long enough to go silver-gray in the desert sun. The cold here is not seasonal — the bluff catches the wind coming off the mesa year-round, and the wind at this elevation has an edge that the compound below doesn\'t feel. A Salter sniper works this post when Briggs has reason to want extended-range observation. The rest of the time it\'s a watch post with a good view and a very cold seat.',
    descriptionNight: 'At night, the bluff has the particular dark of being elevated above the light sources below — the compound\'s minimal lanterns a soft glow to the south, the river road a line in the moonlight. The wind makes it impossible to hear anything subtle. Subtle threats would know this.',
    shortDescription: 'A sandstone bluff north of the compound with long sight lines toward river road and a wind that cuts through everything.',
    exits: {
      south: 'sc_10_watchtower',
    },
    richExits: {},
    items: [],
    enemies: [],
    npcs: [],
    hollowEncounter: {
      baseChance: 0.08,
      timeModifier: { day: 0.3, dusk: 1.5, night: 2.8, dawn: 0.8 },
      threatPool: [
        { type: 'remnant', weight: 50, quantity: { min: 1, max: 1, distribution: 'single' } },
        { type: 'shuffler', weight: 35, quantity: { min: 1, max: 2, distribution: 'weighted_low' } },
        { type: 'sanguine_feral', weight: 15, quantity: { min: 1, max: 1, distribution: 'single' } },
      ],
      awarenessRoll: { unaware: 0.5, awarePassive: 0.3, awareAggressive: 0.2 },
      noiseModifier: 0.6,
    },
    extras: [
      {
        keywords: ['sight line', 'north', 'river road', 'view', 'horizon'],
        description: 'From the parapet\'s northeast corner, the river road is visible as a gray-brown line for perhaps eighteen miles before it bends behind the ridge. At ten miles out, a vehicle would be visible as a dust trail for several minutes before the vehicle itself resolved. At five miles, you\'d have a silhouette. At two, individual figures. This is the geometry of early warning, and someone thought carefully about it when they established this position.',
        skillCheck: { skill: 'perception', dc: 10, successAppend: 'There\'s movement at approximately seven miles north. Not dust — something intermittent and low, at the road\'s edge. Could be an animal working the verge. Could be a person who knows that the road surface leaves tracks and the grass doesn\'t.' },
      },
      {
        keywords: ['parapet', 'sandbags', 'emplacement', 'nest'],
        description: 'The sandbag emplacement is old enough that the bags have begun to degrade, leaking sand where the fabric has thinned. The shooting surface is worn smooth in an oval where elbows have rested in the sniper\'s prone position — the worn area tells you something about sight geometry and what this position was designed to cover. It was designed to cover the road junction.',
        skillCheck: { skill: 'marksmanship', dc: 11, successAppend: 'The emplacement angles put the optimal shooting position covering the junction where the river road meets the creek ford approach. Anyone coming from the north who turns south toward Salt Creek enters this arc at under a thousand meters. Whoever built this understood the route convergence.' },
      },
      {
        keywords: ['wind', 'cold', 'seat', 'log'],
        description: 'The log seat has been there long enough to have the worn-smooth quality of heavy regular use, but no one stays on it longer than they have to. The wind at this elevation changes direction unpredictably — it comes from the northwest for an hour, then north, then northeast, never settling. The sniper who works this position has noted this in the logbook: WIND UNPREDICTABLE. DO NOT TRUST FIRST READING. GET THREE.',
      },
    ],
    npcSpawns: [
      {
        npcId: 'watchtower_sniper',
        spawnChance: 0.40,
        spawnType: 'anchored',
        activityPool: [
          { desc: 'A Salter sniper lies prone at the emplacement, scope up, scanning the road north in slow deliberate passes. The wind pulls at a loose edge of their jacket. They don\'t adjust for it.', weight: 3 },
          { desc: 'The sniper sits on the log seat with a thermos and a spotter\'s scope, watching the northern approach with the patient attention of someone who has internalized that nothing happening is the normal condition.', weight: 2 },
        ],
        dispositionRoll: { friendly: 0.0, neutral: 0.5, wary: 0.4, hostile: 0.1 },
        dialogueTree: 'sc_lookout_bluff_sniper',
      },
    ],
    personalLossEchoes: {
      child: 'The view north covers eighteen miles. Somewhere in those eighteen miles, or beyond them, or nowhere at all anymore. The distance is the problem — you can see so far from up here, and none of it contains what you\'re looking for. The wind takes the thought. The wind takes everything up here.',
      partner: 'The notched log seat, silver-gray from years of weather. Worn smooth by use. You sit in it and the wind cuts through you and you think about the last time you sat somewhere high with someone and didn\'t have to explain why the view mattered. They just knew. You just sat.',
      community: 'The sight line covers the river road — the route people take to reach each other, to trade, to find safety. From up here you can see the geography of connection, the paths between the places where people have decided to belong to each other. You can see it. You\'re not on any of those paths.',
      identity: 'The sniper\'s logbook: WIND UNPREDICTABLE. DO NOT TRUST FIRST READING. GET THREE. You read the instruction and your body responds — you know this discipline. Patience, confirmation, precision. Were you someone who watched from high places? The wind offers no answer.',
      promise: 'From the bluff you can see the road north, toward the mountains, toward the Scar. Toward the direction you need to go. The promise sits in you like the wind sits in the canyon — constant, directional, cold. You came up here to see how far you have left to go. It\'s far.',
    },
    itemSpawns: [
      {
        entityId: 'ammo_762',
        spawnChance: 0.25,
        quantity: { min: 2, max: 4, distribution: 'weighted_low' },
        conditionRoll: { min: 0.8, max: 1.0 },
        groundDescription: 'A small stack of rounds left by the previous watch, tucked behind the sandbags out of the wind.',
        depletion: { cooldownMinutes: { min: 120, max: 360 }, respawnChance: 0.20 },
      },
    ],
  },

  // ----------------------------------------------------------
  // SC-19: Mechanic's Workshop
  // ----------------------------------------------------------
  {
    id: 'sc_19_mechanics_workshop',
    name: 'Salt Creek — Mechanic\'s Workshop',
    zone: 'salt_creek',
    act: 1,
    difficulty: 2,
    visited: false,
    flags: { noCombat: true, questHub: true },
    description: 'The workshop is the overflow space for work that can\'t happen in the motor pool bay — detailed fabrication, parts salvage, and the kind of extended mechanical problem that requires spreading components across a large surface and living with the mess for days. A long workbench runs the south wall, covered in projects at various stages of resolution. Against the north wall, a generator that predates the Collapse is being kept alive by what appears to be pure mechanical stubbornness: welded cracks in the housing, a replacement governor made from a different engine\'s parts, a fuel line that has been spliced twice and sealed three times. Cutter calls this generator Brenda. This is not a joke. He has opinions about Brenda\'s reliability, her temperament, and what she needs to keep running, and he will share them. Torque does the detail work that Cutter\'s hands are too decisive for — the precision threading, the tolerance fitting, the repairs that require patience over force.',
    descriptionNight: 'The workshop at night is Torque\'s domain — Cutter sleeps early when there isn\'t a deadline. Torque works by a headlamp clipped to their collar, making small adjustments to components in a pool of light while the generator makes its characteristic sound: a slight unevenness in the rhythm that Torque describes as a skip and Cutter describes as a personality.',
    shortDescription: 'Salvage fabrication space, a living work-in-progress generator named Brenda, and two mechanics with strong opinions about machinery.',
    exits: {
      east: 'sc_11_motor_pool',
    },
    richExits: {},
    items: [],
    enemies: [],
    npcs: [],
    extras: [
      {
        keywords: ['generator', 'brenda', 'power', 'running'],
        description: 'Brenda: a pre-Collapse commercial generator, 15kW rated capacity, currently running at about 9kW due to the governor replacement and the fuel supply constraints. The welded cracks in the housing are structural — whoever did them understood load distribution. The governor is the creative part: sourced from a tractor engine, modified to fit, recalibrated by feel because the original specs were on a manual that burned in the first year. She runs. Cutter says she\'ll keep running because she knows he needs her to.',
        skillCheck: { skill: 'mechanics', dc: 10, successAppend: 'The skip in the generator rhythm is a fuel flow issue — there\'s a partial blockage somewhere in the feed line. It\'s manageable now. In high-load conditions it could cause a stall. Torque knows this. They\'re managing it deliberately while sourcing the right fitting.' },
      },
      {
        keywords: ['workbench', 'projects', 'parts', 'salvage'],
        description: 'The workbench inventory, left to right: a disassembled pump mechanism, purpose unclear. Four fuel injectors from a diesel engine, three of which are being cleaned and one of which is apparently hopeless. A length of heavy chain with a custom-fabricated hook, designed for vehicle recovery. A box of electrical components that look like they came from several different decades and at least three different applications. Notes in two different handwriting styles — Cutter\'s is large and certain, Torque\'s is small and annotated.',
      },
      {
        keywords: ['torque', 'cutter', 'mechanics', 'team'],
        description: 'Cutter and Torque have the working dynamic of people who communicate primarily through what they don\'t need to say. Cutter takes apart and diagnoses. Torque reassembles and refines. When one is wrong, the other corrects without commentary. When both are wrong, which Torque says happens twice a year, they argue in a professional register until one of them finds the actual problem. They have been working together for three years. The generator has been running for two and a half of those years.',
        skillCheck: { skill: 'mechanics', dc: 8, successAppend: 'Torque notices you understood what they\'re working on. "Finally," they say. "Someone who doesn\'t need an explanation of why this matters."' },
      },
    ],
    npcSpawns: [
      {
        npcId: 'mechanic_cutter',
        spawnChance: 0.50,
        spawnType: 'wanderer',
        activityPool: [
          { desc: 'Cutter is at the generator with a wrench and a look of focused concentration, making an adjustment he\'s been planning for twenty minutes and executing in two seconds.', weight: 3 },
          { desc: 'Cutter is at the workbench sorting through salvaged components, holding each to the light, the keep-or-discard decision made instantly and without visible deliberation.', weight: 2 },
        ],
        dispositionRoll: { friendly: 0.2, neutral: 0.5, wary: 0.3, hostile: 0.0 },
        dialogueTree: 'sc_cutter_workshop',
        questGiver: ['sc_motor_pool_fuel'],
      },
      {
        npcId: 'mechanic_torque',
        spawnChance: 0.75,
        spawnType: 'anchored',
        activityPool: [
          { desc: 'Torque is at the workbench with a headlamp and calipers, measuring a component tolerance with the focused precision of someone for whom close enough is a moral failure.', weight: 4 },
          { desc: 'Torque adjusts a fitting on the generator\'s fuel line with a small wrench, listening to the change in rhythm, adjusting again.', weight: 3 },
        ],
        dispositionRoll: { friendly: 0.15, neutral: 0.60, wary: 0.20, hostile: 0.05 },
        dialogueTree: 'sc_torque_workshop',
      },
    ],
    itemSpawns: [
      {
        entityId: 'salvaged_engine_part',
        spawnChance: 0.50,
        quantity: { min: 1, max: 3, distribution: 'bell' },
        conditionRoll: { min: 0.4, max: 0.9 },
        groundDescription: 'A bin of salvaged mechanical components sits under the workbench, sorted by approximate usefulness.',
        depletion: { cooldownMinutes: { min: 180, max: 480 }, respawnChance: 0.35 },
      },
    ],
    narrativeNotes: 'Generator Brenda is a narrative asset — keeping her running is a mechanic-class quest hook. If Brenda dies, certain compound functions degrade.',
  },

  // ----------------------------------------------------------
  // SC-20: The Mess Hall (Enlisted Common)
  // ----------------------------------------------------------
  {
    id: 'sc_20_mess_hall',
    name: 'Salt Creek — Enlisted Common',
    zone: 'salt_creek',
    act: 1,
    difficulty: 1,
    visited: false,
    flags: { noCombat: true, safeRest: true },
    description: 'The enlisted common is the room the Salters built for themselves, as opposed to the formal mess hall that Briggs designed for function. Where the mess hall is efficiency and intel, this is the room where the mask comes off — a converted storage bay with mismatched seating pulled from everywhere, a card table that has been in use since month two, a shelf of salvaged entertainment (three novels, a board game with pieces from two different games filling the gaps, a guitar missing one string), and a cork board covered in personal items: photographs, a child\'s drawing, a page torn from a magazine. The conversations here are different from the mess hall. Louder. More personal. More likely to include opinions about Briggs that would be expressed differently if Briggs were listening. He is not currently listening, which is why they\'re being expressed.',
    descriptionNight: 'The common at night is the active social hour — two shifts worth of off-duty Salters compressed into one room. Card games at the table, at least one argument in progress, someone attempting guitar in the corner with the particular confidence of a person who doesn\'t know how bad they are. The best time to hear something you weren\'t supposed to.',
    shortDescription: 'The Salters\' unofficial gathering space — where the mask comes off and conversations happen that don\'t happen in the formal mess.',
    exits: {
      east: 'sc_05_barracks',
    },
    richExits: {},
    items: [],
    enemies: [],
    npcs: [],
    extras: [
      {
        keywords: ['card table', 'game', 'cards', 'gambling'],
        description: 'The card table is occupied at most hours with a rotating cast. The current game is a variant of poker using a nonstandard deck — someone added hand-drawn cards to replace what was lost, and the replacements have inside-joke values that require knowing the rules as they\'ve evolved in this room. Strangers are sometimes invited in. The invitation carries hidden information about your standing.',
        skillCheck: { skill: 'perception', dc: 9, successAppend: 'The table conversation: one of the players mentions a patrol that went south three days ago with four people and came back with three. They say it quietly, and the others shift in their seats. Nobody asks the obvious follow-up. You note the missing name.' },
      },
      {
        keywords: ['cork board', 'photographs', 'personal', 'drawing'],
        description: 'The cork board is the record of who these people were before they were Salters. A photograph of a family at a beach, the colors faded to almost-sepia. A child\'s drawing of a house and four stick figures, labeled MOM DAD ME JAKE in crayon. A page from a cooking magazine, a recipe for something complicated and impractical, pinned without explanation. One card, blank on the face, written on the back in small letters: I\'m sorry. Nobody has taken it down.',
      },
      {
        keywords: ['guitar', 'music', 'string', 'missing', 'entertainment'],
        description: 'The guitar is a six-string with five strings, the low E long gone and never replaced. The person playing it has adapted to this limitation with the pragmatism of someone who learned their instrument in a world that no longer has guitar shops. They play around the gap. The resulting sound is not standard and not bad. A few people are listening.',
      },
    ],
    npcSpawns: [
      {
        npcId: 'salter_off_duty',
        spawnChance: 0.90,
        spawnType: 'wanderer',
        quantity: { min: 2, max: 5, distribution: 'bell' },
        activityPool: [
          { desc: 'A Salter is at the card table, hand fanned close to their chest, watching the other players with a neutral expression that is doing a lot of work.', weight: 3 },
          { desc: 'Two Salters are in low conversation in the corner — not secretive, just private, the body language of people who work together and have things to discuss that aren\'t operational.', weight: 3 },
          { desc: 'A Salter is looking at the cork board with the still attention of someone revisiting something familiar. They don\'t acknowledge you.', weight: 2 },
        ],
        dispositionRoll: { friendly: 0.2, neutral: 0.5, wary: 0.2, hostile: 0.1 },
        dialogueTree: 'sc_enlisted_common_salter',
      },
      {
        npcId: 'salter_mess_cook',
        spawnChance: 0.30,
        spawnType: 'wanderer',
        activityPool: [
          { desc: 'The mess cook is off-shift, sitting with a bowl of something they made and eating it with the satisfied focus of someone finally getting to eat their own food rather than serve it.', weight: 3 },
        ],
        dispositionRoll: { friendly: 0.3, neutral: 0.5, wary: 0.2, hostile: 0.0 },
        dialogueTree: 'sc_mess_cook_offduty',
      },
    ],
    itemSpawns: [
      {
        entityId: 'salted_rations',
        spawnChance: 0.25,
        quantity: { min: 1, max: 1, distribution: 'single' },
        conditionRoll: { min: 0.7, max: 1.0 },
        groundDescription: 'A half-eaten meal left at the card table, abandoned when a hand got interesting.',
        depletion: { cooldownMinutes: { min: 90, max: 240 }, respawnChance: 0.30 },
      },
    ],
  },
]
