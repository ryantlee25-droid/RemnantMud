import type { Room } from '@/types/game'

// ============================================================
// THE EMBER — 10 Rooms
// The Kindling's religious settlement. Converted cathedral. Fire motifs. Act I–II.
// ============================================================

export const EMBER_ROOMS: Room[] = [

  // ----------------------------------------------------------
  // EM-01: The Approach
  // ----------------------------------------------------------
  {
    id: 'em_01_the_approach',
    name: 'The Ember — The Approach',
    zone: 'the_ember',
    act: 1,
    difficulty: 2,
    visited: false,
    flags: { noCombat: false },
    description: 'The road to The Ember is lined with torches — not improvised camp fire sticks but proper iron-bracket torches, mounted on posts driven into the earth at regular intervals on both sides, burning even in the day, their smoke rising in parallel columns. The theatrical intention is unmistakable and entirely successful: you are walking toward something that wants to be walked toward. The cathedral spire is visible ahead, the original stone weathered but intact, a new iron symbol at its peak — not a cross but a stylized flame. The smell of smoke is not the smell of disaster. It is specific, controlled, deliberate. Someone here has decided that fire means something different than it used to mean, and they are persuading you of it with every step.',
    descriptionNight: 'At night the torches are the only light for a quarter mile. The effect intensifies. The columns of flame bracket a corridor of darkness made into a processional space, and you walk it feeling the particular pull of atmosphere made physical. The spire ahead is a dark shape until you\'re close enough to see the flame symbol catching the torch-light.',
    shortDescription: 'A road lined with torches leading to a cathedral spire, the smell of deliberate smoke, and the feeling of being summoned.',
    exits: {
      north: 'em_02_gate_of_flame',
      south: 'br_07_canyon_crossroads',
    },
    richExits: {},
    items: [],
    enemies: [],
    npcs: [],
    hollowEncounter: {
      baseChance: 0.08,
      timeModifier: { day: 0.4, dusk: 1.0, night: 1.5, dawn: 0.6 },
      threatPool: [
        { type: 'shuffler', weight: 70, quantity: { min: 1, max: 2, distribution: 'weighted_low' } },
        { type: 'remnant', weight: 30, quantity: { min: 1, max: 1, distribution: 'single' } },
      ],
      awarenessRoll: { unaware: 0.5, awarePassive: 0.3, awareAggressive: 0.2 },
    },
    extras: [
      {
        keywords: ['torches', 'fire', 'posts', 'smoke', 'columns'],
        description: 'Forty-two torches. You count them without meaning to. Spaced at roughly four meters, which means someone measured this, which means someone stood on this road thinking: what is the interval at which fire becomes architecture? The brackets are hand-forged, not salvaged — you can see the hammer marks. Each torch is a statement.',
      },
      {
        keywords: ['spire', 'cathedral', 'symbol', 'flame', 'cross'],
        description: 'The cathedral\'s original cross was removed in the second year of the Kindling\'s occupation. The replacement — a stylized flame in iron — was made by the same person who made the torch brackets. The transition from cross to flame was not unanimous, a resident outside the walls tells you, if you ask. The people who disagreed left. Or were encouraged to leave. The resident stops talking at this point.',
      },
      {
        keywords: ['smell', 'smoke', 'air', 'burning'],
        description: 'The smoke has layers you\'d miss on first breath: the outer torches burning seasoned wood, and underneath, something herbal — a resin, perhaps, or dried flowers mixed with the fuel. The Kindling uses specific wood mixtures for different ceremonies. The approach torch blend is called the Welcome. You didn\'t ask what the other blends are called.',
      },
    ],
    npcSpawns: [
      {
        npcId: 'kindling_torch_tender',
        spawnChance: 0.60,
        spawnType: 'patrol',
        activityPool: [
          { desc: 'A Kindling faithful moves along the torch line with a cloth-wrapped fuel container, trimming wicks and topping off the reservoirs with practiced efficiency. She doesn\'t look at you. She\'s busy with the work of the approach.', weight: 3 },
          { desc: 'A torch tender pauses in his work to observe your approach, head slightly tilted, the way religious people evaluate visitors: with attention directed past your surface.', weight: 2 },
        ],
        dispositionRoll: { friendly: 0.3, neutral: 0.5, wary: 0.2, hostile: 0.0 },
        dialogueTree: 'em_torch_tender_approach',
      },
    ],
    itemSpawns: [],
  },

  // ----------------------------------------------------------
  // EM-02: Gate of Flame
  // ----------------------------------------------------------
  {
    id: 'em_02_gate_of_flame',
    name: 'The Ember — Gate of Flame',
    zone: 'the_ember',
    act: 1,
    difficulty: 2,
    visited: false,
    flags: { noCombat: true },
    description: 'The gate is flanked by braziers the size of oil drums, burning with a controlled intensity that pushes heat you feel ten meters out. The gates themselves are salvaged iron doors, painted matte black, with the flame symbol from the spire reproduced in embossed metalwork at eye height. Two Kindling gatekeepers stand in long dark robes that have clearly been adapted from other garments with considerable craft — they look like what they are, which is people who have decided to inhabit a role with commitment. They greet you with formal warmth, which is its own kind of thing: you are expected, they imply. The Deacon welcomes inquiry. You will be shown in.',
    descriptionNight: 'The braziers burn brighter at night — or appear to. The gatekeepers at night stand closer to the flames, the fire making their faces mobile with shadow and light. The gate is still open after dark, which is itself a statement: the Kindling does not fear the night.',
    shortDescription: 'Iron gates flanked by barrel braziers with heat you feel from ten meters, and gatekeepers in dark robes who expected you.',
    exits: {
      south: 'em_01_the_approach',
      north: 'em_03_the_nave',
    },
    richExits: {
      north: {
        destination: 'em_03_the_nave',
        questGate: 'em_kindling_intro',
        descriptionVerbose: 'through the Gate of Flame — Kindling introduction quest required',
      },
    },
    items: [],
    enemies: [],
    npcs: [],
    extras: [
      {
        keywords: ['braziers', 'fire', 'heat', 'barrels'],
        description: 'The braziers are salvaged oil drums with the tops cut off and ventilation holes punched in a pattern around the circumference. The holes aren\'t random — they\'re a pattern. If you step back far enough, the holes form a repeating flame shape. Someone with engineering skill and devotion made these. They\'re beautiful in the way that things are beautiful when someone made them with both.',
      },
      {
        keywords: ['gatekeepers', 'robes', 'faithful'],
        description: 'The robes are adapted from a variety of base garments — you can see the original hems on one gatekeeper\'s, and the seam modifications on the other\'s. They\'re similar enough to read as uniform without being identical. The commitment to the aesthetic is complete. These people have chosen their appearance with the totality that religion asks of people who are serious about it.',
      },
      {
        keywords: ['welcome', 'greeting', 'formal', 'deacon', 'harrow'],
        description: '"The Deacon welcomes those who seek understanding," the gatekeeper says. "Harrow is in the Nave this morning. He will make time." The warmth is real, which is what makes it worth examining. These are not performance smiles. These are the faces of people who believe that you arriving is a good thing. You find this simultaneously reassuring and something else.',
      },
    ],
    npcSpawns: [
      {
        npcId: 'kindling_gatekeeper',
        spawnChance: 0.95,
        spawnType: 'anchored',
        quantity: { min: 1, max: 2, distribution: 'weighted_low' },
        activityPool: [
          { desc: 'A gatekeeper stands at the open gate, hands folded, watching you approach with the warm formal attention of someone who has practiced this greeting.', weight: 4 },
          { desc: 'A gatekeeper is adjusting the fuel in one of the braziers — a maintenance task performed with the same care as the greeting, because in the Kindling there is no separation.', weight: 2 },
        ],
        dispositionRoll: { friendly: 0.5, neutral: 0.4, wary: 0.1, hostile: 0.0 },
        dialogueTree: 'em_gate_keeper_intro',
        questGiver: ['em_kindling_intro'],
      },
    ],
    itemSpawns: [],
  },

  // ----------------------------------------------------------
  // EM-03: The Nave
  // ----------------------------------------------------------
  {
    id: 'em_03_the_nave',
    name: 'The Ember — The Nave',
    zone: 'the_ember',
    act: 1,
    difficulty: 2,
    visited: false,
    flags: { noCombat: true, questHub: true },
    description: 'The cathedral nave has been adapted with the same devoted thoroughness as everything else in The Ember. The original pews have been rearranged to face a central flame pit rather than an altar — a permanent low basin of burning coals in the crossing, ringed with stone, the smoke drawn up through a steel flue that exits at the tower. The stained glass is original and intact, throwing the interior into the same imperfect color as Covenant\'s chapel, except here the glass is older and the colors are deeper and the fire from the coal pit adds a layer of orange to everything. Kindling faithful are seated in the pews in attitudes of contemplation. At the front, where the priest\'s chair once stood, Deacon Harrow addresses a small group — you hear his voice before you see his face, and his voice is extraordinary: the particular warmth-over-authority combination of someone who has learned that persuasion works better than command and who has spent years perfecting both.',
    descriptionNight: 'The Nave at night is full. Evening devotionals — the Kindling refers to them as Assemblies — run ninety minutes. The coal pit is banked higher. The stained glass catches nothing, but the fire from the pit throws everything. Harrow\'s voice in this space at this hour carries a quality that you recognize and cannot fully account for.',
    shortDescription: 'The cathedral nave — pews facing a central coal pit, old glass throwing color, Harrow\'s voice arriving before his face.',
    exits: {
      south: 'em_02_gate_of_flame',
      east: 'em_04_deacons_chamber',
      west: 'em_06_dormitory',
      north: 'em_05_purification_room',
      down: 'em_08_the_crypt',
    },
    richExits: {},
    items: [],
    enemies: [],
    npcs: [],
    extras: [
      {
        keywords: ['coal pit', 'fire', 'flames', 'basin', 'burning'],
        description: 'The coal pit is the liturgical center of everything in The Ember. It never goes cold — there is a rota of faithful who tend it, and the tending is religious practice, not maintenance. The heat it generates warms the nave even in winter. The smoke goes up the flue in a single clean column that you can see from outside as a thin white line. It is always burning.',
      },
      {
        keywords: ['harrow', 'deacon', 'voice', 'sermon'],
        description: 'Deacon Harrow is fifty, lean, with the physical presence of someone who has been in front of rooms for twenty years. Before the Collapse he was — you\'ve heard different things. A pastor. A cult leader. A motivational speaker. None of these is incompatible with the others. He finishes speaking and the group around him doesn\'t disperse immediately; they stay, wanting to be near the aftermath of the words. He notices you. He smiles like someone who knew you\'d come.',
      },
      {
        keywords: ['stained glass', 'windows', 'light', 'color'],
        description: 'The original glass survived the Collapse because the cathedral walls are stone and the walls survived. The panels depict scenes you half-recognize — saints, martyrs, moments of revelation — but the fire from the coal pit has been mixing with the glass-filtered daylight for years and the images have taken on a quality of their own. One panel, depicting a figure surrounded by flame, has become what you might call ambiguous.',
      },
      {
        keywords: ['pews', 'faithful', 'congregation', 'sitting'],
        description: 'Fourteen people in contemplation across the pews. Ages: perhaps twelve to sixty-five. A teenager with a fresh burn scar on her forearm that has been dressed, recently, with the careful wrapping that suggests medical treatment followed by something else. An older man kneeling, lips moving. Two children who are not making noise, which in a building with a coal fire and stone acoustics takes a specific kind of learned self-control.',
      },
    ],
    npcSpawns: [
      {
        npcId: 'deacon_harrow',
        spawnChance: 0.80,
        spawnType: 'anchored',
        activityPool: [
          { desc: 'Deacon Harrow speaks to a small group at the front of the nave, his hands moving in the gestures of someone for whom language is not adequate on its own. He pauses when you enter — not interrupted, just aware.', weight: 4 },
          { desc: 'Harrow stands at the coal pit, looking into the flame with the absorbed focus of a person who finds the experience genuinely rich. He turns to you with the particular directness of someone who was thinking about something specific and has decided that speaking to you is continuous with it.', weight: 3 },
        ],
        dispositionRoll: { friendly: 0.4, neutral: 0.4, wary: 0.2, hostile: 0.0 },
        dialogueTree: 'em_harrow_nave_intro',
        questGiver: ['em_purification_investigation', 'em_crypt_quest'],
        narrativeNotes: 'Deacon Harrow. Charismatic, possibly mad. The purification rituals are getting extreme. Compelling and unsettling in exactly the ratio that makes him dangerous.',
      },
    ],
    itemSpawns: [],
  },

  // ----------------------------------------------------------
  // EM-04: Deacon's Chamber
  // ----------------------------------------------------------
  {
    id: 'em_04_deacons_chamber',
    name: 'The Ember — Deacon\'s Chamber',
    zone: 'the_ember',
    act: 1,
    difficulty: 2,
    visited: false,
    flags: { noCombat: true, questHub: true },
    description: 'Harrow\'s office is the administrative center of The Ember — the place where the faith\'s practical operations are run with the particular pragmatism of organizations that need to keep both a budget and a cosmology in working order. One wall is devotional: the flame symbol in multiple sizes, a calendar of Kindling observances, a hand-lettered scripture that runs the full length of the wall in small text you\'d need to stand close to read. The other walls are operational: supply records, correspondence, a board of current congregants with their roles and assignments, and a medical ledger that is the thickest document in the room. The medical ledger is for the Purification treatments. The record shows completion dates, outcomes, and a notation system that you don\'t fully understand. The notation system has two primary symbols.',
    descriptionNight: 'Harrow works late. The chamber lamp burns past midnight on most days. This is information he\'d offer freely if you asked.',
    shortDescription: 'Harrow\'s office — one wall devotional, one wall operational, and a medical ledger that is the thickest document in the room.',
    exits: {
      west: 'em_03_the_nave',
    },
    richExits: {},
    items: [],
    enemies: [],
    npcs: [],
    extras: [
      {
        keywords: ['scripture', 'text', 'wall', 'lettered'],
        description: 'The lettered text: We have walked through fire because there is no way around it. The fire did not ask our permission. But fire clarifies — it burns what is unnecessary and what remains is what was always essential. We are what the Collapse could not take. Each line is a different person\'s handwriting, contributed over years. The last line is in the handwriting of a child.',
      },
      {
        keywords: ['medical ledger', 'treatments', 'purification', 'records'],
        description: 'The notation system: a sun symbol and a flame symbol. You see both throughout the ledger, beside names and dates and what appear to be dosage notations. The sun symbol occurs in roughly seventy percent of entries. The flame symbol occurs in roughly thirty percent. The entries with the flame symbol do not have follow-up dates. You think about this for a moment and then you understand what it means and you stop looking at the ledger.',
        skillCheck: { skill: 'field_medicine', dc: 10, successAppend: 'The sun symbol is survival. The flame symbol is death. The Purification treatment has a thirty percent mortality rate. The ledger records this with the same neutral notations throughout. Harrow knows the number. He considers it acceptable.' },
      },
      {
        keywords: ['congregant board', 'assignments', 'roles', 'names'],
        description: 'The congregant board shows current residents of The Ember by name, role, and assignment. Some names have small notations: "SEEKING" (new arrivals in discernment), "FAITHFUL" (full members), "PURIFIED" (treatment completed), and two entries marked only with a dash. The dash entries have no dates, no roles, no assignments. You don\'t ask about the dashes.',
      },
    ],
    npcSpawns: [
      {
        npcId: 'deacon_harrow',
        spawnChance: 0.70,
        spawnType: 'anchored',
        activityPool: [
          { desc: 'Harrow is writing at his desk, the letter flowing easily from his pen — practiced, confident, the kind of writing that has been done ten thousand times. He sets the pen down and looks at you with the impression of someone who was not interrupted.', weight: 4 },
          { desc: 'Harrow reviews the medical ledger with a deliberate, neutral attention. He closes it when you enter. "The work of care," he says, by way of description.', weight: 2 },
        ],
        dispositionRoll: { friendly: 0.4, neutral: 0.4, wary: 0.2, hostile: 0.0 },
        dialogueTree: 'em_harrow_chamber_quest',
        questGiver: ['em_purification_investigation', 'em_supply_run', 'em_crypt_quest'],
      },
    ],
    itemSpawns: [],
  },

  // ----------------------------------------------------------
  // EM-05: The Purification Room
  // ----------------------------------------------------------
  {
    id: 'em_05_purification_room',
    name: 'The Ember — The Purification Room',
    zone: 'the_ember',
    act: 1,
    difficulty: 3,
    visited: false,
    flags: { noCombat: true },
    description: 'The Purification room is where the Kindling\'s core practice occurs, and the room has the quality of something that has been used for something serious for a long time. A stone table at the center, the surface polished smooth by use. Iron brackets on the walls that hold torches at specific heights. A preparation counter with labeled vials — the Kindling\'s fire treatment compounds, some herbal, some chemical, some you recognize from field medicine and some you do not. The smell is complex: antiseptic and smoke and the specific mineral trace of old fear. On the table: a white cloth, folded precisely. You understand that the cloth is placed after, not before. The purpose of this room is not comfortable. Neither is the sixty-seven percent survival rate.',
    descriptionNight: 'Treatments are not performed at night. The room is closed. The smell is the same.',
    shortDescription: 'The stone table at the center is polished smooth by use, the counter holds treatment compounds, and a white cloth is folded precisely for afterward.',
    exits: {
      south: 'em_03_the_nave',
    },
    richExits: {},
    items: [],
    enemies: [],
    npcs: [],
    extras: [
      {
        keywords: ['stone table', 'table', 'surface', 'smooth'],
        description: 'The table is a section of natural stone fitted into a base — a massive piece of worked sandstone that had to be brought in. Polished smooth at the center from years of contact, the edges still rough. Restraint points are set into the sides. The restraints are folded and stored in a box beneath the table. Harrow would tell you they\'re for the treatment\'s physical intensity. You note that they have been used frequently enough to show wear.',
      },
      {
        keywords: ['vials', 'compounds', 'treatment', 'chemicals'],
        description: 'The labeled vials: feverfew extract, silver compound suspension (diluted), adrenal stimulant, pain suppressor, and several without labels that have hand-coded identifiers. The unlabeled vials contain things that the Kindling makes here, that don\'t come from any pharmacy, that Harrow developed. The preparation process is religious, he\'d tell you. The chemistry is real.',
        skillCheck: { skill: 'field_medicine', dc: 13, successAppend: 'The silver compound suspension stops your breath for a moment. Silver doesn\'t have documented medical applications for humans. It does have documented effects on Sanguine biology. The treatment isn\'t targeting infection. It\'s targeting a specific genetic expression.' },
      },
      {
        keywords: ['cloth', 'white cloth', 'folded'],
        description: 'The white cloth, folded on the stone table edge. Clean. Pressed. Changed for each treatment. You pick it up and put it down. It is lighter than it seems like it should be. The weight of cloth is the weight of cloth. The other weight is yours to carry home.',
      },
      {
        keywords: ['brackets', 'torches', 'heights', 'specific'],
        description: 'The torches are mounted at specific heights because specific heights produce specific heat at the table surface. This is not atmospheric. The Purification treatment involves controlled heat exposure at calibrated intensity. Harrow determined the calibration over time. The first several determinations were wrong, and the ledger reflects this, and Harrow calls this the cost of understanding.',
      },
    ],
    npcSpawns: [
      {
        npcId: 'kindling_treatment_aide',
        spawnChance: 0.45,
        spawnType: 'anchored',
        activityPool: [
          { desc: 'A Kindling aide cleans the stone table with careful circular strokes, working with an attention that has the quality of ritual rather than housekeeping.', weight: 3 },
          { desc: 'An aide restocks the preparation counter, checking each vial against a written reference before placing it, moving with the diligent efficiency of someone who knows that errors here are consequential.', weight: 2 },
        ],
        dispositionRoll: { friendly: 0.1, neutral: 0.5, wary: 0.4, hostile: 0.0 },
        dialogueTree: 'em_treatment_aide',
      },
    ],
    itemSpawns: [
      {
        entityId: 'kindling_treatment_compound',
        spawnChance: 0.25,
        quantity: { min: 1, max: 1, distribution: 'single' },
        conditionRoll: { min: 0.7, max: 1.0 },
        groundDescription: 'A small labeled vial sits apart from the preparation counter — set aside for a purpose.',
        depletion: { cooldownMinutes: { min: 360, max: 720 }, respawnChance: 0.15 },
      },
    ],
  },

  // ----------------------------------------------------------
  // EM-06: The Dormitory
  // ----------------------------------------------------------
  {
    id: 'em_06_dormitory',
    name: 'The Ember — The Dormitory',
    zone: 'the_ember',
    act: 1,
    difficulty: 2,
    visited: false,
    flags: { noCombat: true },
    description: 'The dormitory occupies the cathedral\'s former side chapels — the individual devotional spaces now converted to communal sleeping quarters. Bunks built into the stone alcoves where small altars once stood. The stone retains the cold regardless of season. The Kindling faithful don\'t appear to mind the cold, or at least they don\'t say they do. What you notice in the dormitory: the personal items on the shelf beside each bunk are few. What you notice in the space between: the quality of the relationships — the small social texture of a community that eats together, prays together, and has decided, collectively and individually, to be here. The people who live in this dormitory chose it. You find yourself wanting to understand that choice before you judge it.',
    descriptionNight: 'After devotionals, the dormitory fills. Conversations are quiet — post-Assembly quiet, the sound of people still carrying the mood. Some bunks are empty. You don\'t ask tonight.',
    shortDescription: 'Bunks built into stone alcoves, few personal items, and the particular texture of people who chose to be here and chose to stay.',
    exits: {
      east: 'em_03_the_nave',
    },
    richExits: {},
    items: [],
    enemies: [],
    npcs: [],
    extras: [
      {
        keywords: ['bunks', 'alcoves', 'sleeping', 'stone'],
        description: 'Each alcove holds two bunks and two people. The sleeping space is genuinely cramped — the alcoves were designed for a single person kneeling, not two sleeping — but the Kindling has made it work through the kind of cooperative negotiation that close quarters produces. You notice that the sleeping arrangements appear to mix genders and ages without apparent system. "We are not our previous distinctions," a resident tells you.',
      },
      {
        keywords: ['personal items', 'shelf', 'possessions', 'belongings'],
        description: 'The shelves beside each bunk: a few. A small photograph. A book, sometimes. A carved object. An empty vial that was kept for the vessel rather than the content. The Kindling doesn\'t ask you to give up your belongings, a resident explains, just to examine your attachment to them. The examination, you understand, produces the same result eventually.',
        skillCheck: { skill: 'perception', dc: 11, successAppend: 'One shelf has a pre-Collapse keycard from a government facility, half-hidden under a cloth. The lanyard still has the name on it. The name is not the name of the current resident.' },
      },
      {
        keywords: ['community', 'people', 'residents', 'faithful'],
        description: 'The dormitory has nineteen residents currently. Four are new — you can identify them by the quality of their attention, still absorbing the framework rather than inhabiting it. Fifteen have been here long enough to have the ease of people at home. Among the fifteen, you notice the burn scars. Not uniformly. Not universally. But many. Small ones: on the forearm, the wrist, the back of the hand. The Purification, but more than that — the Kindling has a practice of voluntary small burns as devotional acts. Not required. Very common.',
      },
    ],
    npcSpawns: [
      {
        npcId: 'kindling_resident_faithful',
        spawnChance: 0.70,
        spawnType: 'wanderer',
        quantity: { min: 1, max: 3, distribution: 'bell' },
        activityPool: [
          { desc: 'A faithful resident sits on their bunk with a small book, reading with the absorbed concentration of someone for whom the text is genuinely important.', weight: 3 },
          { desc: 'Two residents share a quiet conversation across the aisle of alcoves — not secretive, simply private, the kind of conversation that takes place in a dormitory because it belongs there.', weight: 2 },
          { desc: 'A young resident carefully cleans a small burn scar on their arm — not grimacing, not performing stoicism. Simply cleaning a wound with the matter-of-fact competence of people accustomed to their own injuries.', weight: 1 },
        ],
        dispositionRoll: { friendly: 0.3, neutral: 0.5, wary: 0.2, hostile: 0.0 },
        dialogueTree: 'em_dormitory_resident',
      },
    ],
    itemSpawns: [],
  },

  // ----------------------------------------------------------
  // EM-07: The Bell Tower
  // ----------------------------------------------------------
  {
    id: 'em_07_bell_tower',
    name: 'The Ember — The Bell Tower',
    zone: 'the_ember',
    act: 1,
    difficulty: 2,
    visited: false,
    flags: { noCombat: true },
    description: 'The original bell is still here — cast iron, pre-Collapse, rung twice daily for the Assembly. The tower stairwell is stone, narrow and winding, the steps worn by the feet that have used them for longer than the Kindling has existed. At the top, a platform wide enough for two people and an unrestricted view of the surrounding country. Someone is already there. A young man in Kindling robes stands with his back to you, looking south, not toward The Ember below but away from it. When he hears you on the stairs he turns: late twenties, clear eyes, the expression of someone in the middle of something internal that the arrival of another person has interrupted. He is, you realize, not here for the view. He is here because it is the only place in The Ember where you are alone.',
    descriptionNight: 'The bell tower at night is darker than anywhere else at The Ember. No torches reach this high. The stars, if the sky is clear, are full and specific. The young man is sometimes still here at night. Sometimes he leaves before you arrive and you find only the view.',
    shortDescription: 'The stone tower, the iron bell, and a young man standing away from The Ember below, needing to be where no one can hear him think.',
    exits: {
      down: 'em_03_the_nave',
    },
    richExits: {},
    items: [],
    enemies: [],
    npcs: [],
    extras: [
      {
        keywords: ['bell', 'iron', 'cast iron', 'ringing'],
        description: 'The bell is original to the building. The rope that rings it hangs through a hole in the platform floor, wrapped around a cleat. It rings at dawn and before the evening Assembly. The sound carries far into the broken country — you heard it, probably, before you arrived.',
      },
      {
        keywords: ['view', 'south', 'country', 'landscape'],
        description: 'From the tower: the torch-lined approach road below, the kill zone of The Ember\'s outer structure (less formal than Salt Creek\'s, more like a cleared field), and beyond that, the canyon country that leads south and west. You can see The Breaks from here — the rim lines, the shadow of the canyon cuts. Beautiful and deeply unsafe. The young man looks at it the way people look at things they want to reach.',
      },
      {
        keywords: ['young man', 'doubt', 'questioning', 'robe'],
        description: '"I don\'t think I\'m asking the right questions," the young man says, if you stay long enough for him to say something. His name is Avery. He\'s been with the Kindling for two years. "Harrow says doubt is the fire burning away false certainty. But what if the certainty that\'s burning is the one I need?" He looks back south. "What\'s out there? Past the canyons. Just... what\'s out there?"',
        skillCheck: { skill: 'negotiation', dc: 10, successAppend: 'You have something to say that Avery needs to hear. Or you have questions that let him say it himself. Either way, after an hour he\'s still in the tower but he\'s standing differently — facing The Ember, not away from it, which might mean he\'s found something or might mean he\'s decided to stop looking for it.' },
      },
    ],
    npcSpawns: [
      {
        npcId: 'kindling_doubter_avery',
        spawnChance: 0.75,
        spawnType: 'anchored',
        activityPool: [
          { desc: 'Avery stands at the tower\'s south face, looking out over the canyon country, his back to the settlement below.', weight: 5 },
          { desc: 'Avery sits with his back against the bell housing, knees up, eyes closed, doing what could be meditation and what might just be avoiding a decision.', weight: 2 },
        ],
        dispositionRoll: { friendly: 0.4, neutral: 0.4, wary: 0.2, hostile: 0.0 },
        dialogueTree: 'em_avery_doubt',
        narrativeNotes: 'Faith crisis NPC. Can be talked toward leaving or toward recommitting. Consequences ripple into the purification investigation quest.',
      },
    ],
    itemSpawns: [],
  },

  // ----------------------------------------------------------
  // EM-08: The Crypt
  // ----------------------------------------------------------
  {
    id: 'em_08_the_crypt',
    name: 'The Ember — The Crypt',
    zone: 'the_ember',
    act: 1,
    difficulty: 3,
    visited: false,
    flags: { noCombat: false },
    description: 'Below the Nave, the cathedral\'s original crypt has been maintained and expanded. The pre-Collapse graves are along the outer walls: stone markers with names, dates, the occasional small carved symbol. Down the center aisle, newer interments — the Kindling\'s dead, marked with the flame symbol in iron and the dates of their arrival and departure, which the Kindling records because the departure matters as much as the arrival. The air is cold and still and smells of old stone and something specific to stone that has been used as a place of the dead for a long time — not decay, something prior to decay, the mineral memory of it. At the far end, a back wall with what appears to be solid stone. You notice, if you\'re looking for it, that the mortar along one section has a different age.',
    descriptionNight: 'The crypt at night. You bring your own light. The flame symbols on the Kindling graves catch it and the cast shadows multiply the graves.',
    shortDescription: 'Old graves along the walls, new Kindling dead marked with iron flames down the center, and a back wall with mortar of different ages.',
    exits: {
      up: 'em_03_the_nave',
    },
    richExits: {
      north: {
        destination: 'em_10_hidden_chapel',
        hidden: true,
        discoverSkill: 'perception',
        discoverDc: 16,
        descriptionVerbose: 'a false wall at the back of the crypt — hidden room',
      },
    },
    items: [],
    enemies: [],
    npcs: [],
    hollowEncounter: {
      baseChance: 0.12,
      timeModifier: { day: 0.5, dusk: 1.5, night: 2.5, dawn: 1.0 },
      threatPool: [
        { type: 'shuffler', weight: 50, quantity: { min: 1, max: 2, distribution: 'weighted_low' } },
        { type: 'whisperer', weight: 30, quantity: { min: 1, max: 1, distribution: 'single' } },
        { type: 'remnant', weight: 20, quantity: { min: 1, max: 1, distribution: 'single' } },
      ],
      awarenessRoll: { unaware: 0.3, awarePassive: 0.4, awareAggressive: 0.3 },
      activityPool: {
        whisperer: [
          { desc: 'speaks quietly from the darkness ahead, using a name it shouldn\'t know — someone you haven\'t mentioned, in a voice that sounds enough like the person for your next step to be slower than it should be', weight: 3 },
        ],
      },
    },
    extras: [
      {
        keywords: ['graves', 'markers', 'old', 'original'],
        description: 'The oldest graves predate the building — the cathedral was built over an existing cemetery, which was a common practice. The names on the oldest stones are illegible. A few dates are still visible: 1887, 1903, 1921. These people didn\'t know that a century-plus after their burial, their resting place would be surrounded by iron flame symbols and a faith that didn\'t exist when they died. History doesn\'t ask your permission.',
      },
      {
        keywords: ['kindling dead', 'new graves', 'flame symbol', 'interments'],
        description: 'The center-aisle graves: twenty-three of them, spanning the Kindling\'s occupation. Some have names. Some have only dates and the flame symbol. The dates of arrival and departure that the Kindling records allow you to calculate, if you want to, how long each person lived here before dying. The shortest interval is nine days. The notation beside it is a flame symbol. Purification.',
      },
      {
        keywords: ['back wall', 'mortar', 'stone', 'hidden', 'false'],
        description: 'The back wall appears solid. The stone is the same age and type as the rest of the crypt. But the mortar in a two-meter section is lighter in color, more recent, and slightly proud of the surrounding mortar line — visible only if you\'re running your hands along the wall in the way you run hands along walls you\'re suspicious of.',
        skillCheck: { skill: 'perception', dc: 16, successAppend: 'A false wall. The stones in this section are not anchored — they\'re fitted into a removable frame. Behind it: a space, the smell of old paper and stale air and something that has been stored for a long time.' },
      },
    ],
    npcSpawns: [],
    itemSpawns: [
      {
        entityId: 'pre_collapse_prayer_book',
        spawnChance: 0.40,
        quantity: { min: 1, max: 1, distribution: 'single' },
        conditionRoll: { min: 0.4, max: 0.8 },
        groundDescription: 'A pre-Collapse prayer book rests on the stone ledge at the base of the oldest graves.',
        depletion: { cooldownMinutes: { min: 360, max: 720 }, respawnChance: 0.25 },
      },
    ],
  },

  // ----------------------------------------------------------
  // EM-09: Garden of Ashes
  // ----------------------------------------------------------
  {
    id: 'em_09_garden_of_ashes',
    name: 'The Ember — Garden of Ashes',
    zone: 'the_ember',
    act: 1,
    difficulty: 1,
    visited: false,
    flags: { noCombat: true, safeRest: true },
    description: 'The cathedral\'s south garden has been converted to a memorial space that the Kindling calls the Garden of Ashes. The ground is covered in fine gray ash — replenished each month from the coal pit — and in the ash, things grow: low sedge grass, a few hardy wildflowers, a single small juniper. Stones set into the ash at intervals bear names. Dozens of names, some legible at a distance, some requiring you to kneel. These are the Purification dead — not hidden, not euphemized, not marked with the flame symbol that the ledger uses. Just names. In the same hand throughout, which means one person has written all of them, which means one person has made themselves the keeper of these names, and that person has not run out of stones yet.',
    descriptionNight: 'The garden at night. No torches in here — Harrow decided early that this space doesn\'t need fire. It has enough. The ash is pale in the dark. The stones with names are invisible at a certain distance. You know they\'re there.',
    shortDescription: 'Ash on the ground, hardy wildflowers growing through it, and dozens of stones bearing the names of the Purification dead in one person\'s handwriting.',
    exits: {
      north: 'em_03_the_nave',
    },
    richExits: {},
    items: [],
    enemies: [],
    npcs: [],
    extras: [
      {
        keywords: ['ash', 'ashes', 'ground', 'gray'],
        description: 'The ash is replenished monthly from the coal pit — a ritual act. One of the Kindling\'s founders made the practice, and it has continued. The ash is always fine, always fresh at the surface. Things grow through it without apparent difficulty. The garden has been here four years and the plants have adapted. Life adapts. The Kindling says this is the point. You find it hard to argue with and hard to fully accept.',
      },
      {
        keywords: ['stones', 'names', 'memorial', 'dead'],
        description: 'You kneel at the closest stone: MIRIAM, ARRIVED YEAR 3, PURIFIED YEAR 3. Then the next: JOSE, ARRIVED YEAR 2, PURIFIED YEAR 4. The formulation is consistent — arrived, purified. Harrow has told you the purification is a transition, not a death. The garden says something more ambiguous than that. The garden says: these people came, and were changed, and are here now, in ash.',
      },
      {
        keywords: ['handwriting', 'one person', 'keeper'],
        description: 'Every name in the same handwriting. You\'d need all of them in front of you to count, but sixty at least. Maybe more. The person who wrote them didn\'t sign their work. Somewhere in The Ember, someone sits with these stones before each name goes onto them, and writes. You want to know who. You suspect it might be Harrow, and you suspect that suspecting it is the point.',
      },
      {
        keywords: ['juniper', 'flowers', 'plants', 'growing'],
        description: 'The juniper is about four years old — it was planted, not seeded. Someone brought it and put it here. It is the only tree in the garden and it has grown to about waist height and smells the way junipers do, which is like something older and more patient than anything else in this conversation.',
      },
    ],
    npcSpawns: [
      {
        npcId: 'garden_visitor',
        spawnChance: 0.45,
        spawnType: 'wanderer',
        activityPool: [
          { desc: 'A Kindling resident kneels in the ash garden, reading names. Their lips move slightly. They don\'t look up when you enter. This is not rudeness.', weight: 3 },
          { desc: 'Someone stands at the far end of the garden with a small stone in their hand and a marker, adding a name. They don\'t turn around.', weight: 2 },
        ],
        dispositionRoll: { friendly: 0.3, neutral: 0.6, wary: 0.1, hostile: 0.0 },
        narrativeNotes: 'Emotional weight room. No combat, no loot. The names are here.',
      },
    ],
    itemSpawns: [],
  },

  // ----------------------------------------------------------
  // EM-10: The Hidden Chapel
  // ----------------------------------------------------------
  {
    id: 'em_10_hidden_chapel',
    name: 'The Ember — The Hidden Chapel',
    zone: 'the_ember',
    act: 2,
    difficulty: 3,
    visited: false,
    flags: { hiddenRoom: true },
    description: 'Behind the false wall, a second space — small, square, stone-walled, older than the cathedral by the look of the mortar. The air is cold and perfectly still, the kind of stillness that belongs to enclosed spaces that haven\'t been opened in a long time. A wooden shelf on the back wall holds: one glass jar of ash, one bundle of dried herbs, one pre-Collapse journal with a cracked leather cover, and a faded photograph of a janitorial crew standing in a corridor that you\'d recognize from your research as institutional — the overhead lighting, the painted concrete floors, the security badge lanyards. On the journal cover, in pencil: HARLOW, T. — PERSONAL. MERIDIAN 2029-2031. Below the photograph, scratched into the stone: THEY MADE IT AND COULDN\'T STOP IT AND NOW WE ARE THE FIRE THAT CLEANS. The journal contains maps.',
    descriptionNight: 'The hidden chapel is the same in the dark. The journal is the same. The scratched words are the same. The maps are the same.',
    shortDescription: 'A sealed room behind the false wall — a janitor\'s journal from MERIDIAN 2029-2031, a photograph of the crew, and a scratched text that connects the fire to the facility.',
    exits: {
      south: 'em_08_the_crypt',
    },
    richExits: {
      south: {
        destination: 'em_08_the_crypt',
        reputationGate: { faction: 'kindling', minLevel: 3 },
        descriptionVerbose: 'back through the false wall into the crypt — Perception DC 16 to find initially, Blooded Kindling standing for free access',
      },
    },
    items: [],
    enemies: [],
    npcs: [],
    extras: [
      {
        keywords: ['journal', 'harlow', 'meridian', 'leather'],
        description: 'HARLOW, T. — PERSONAL. MERIDIAN 2029-2031. The journal spans two years and three months of service as a maintenance technician at the MERIDIAN facility. The early entries are ordinary: work schedules, equipment maintenance notes, complaints about the cafeteria. By mid-2030 the entries shift: descriptions of things seen in the restricted sections, overheard conversations, the particular kind of carefully neutral notation of someone writing things down because they don\'t know what else to do with them. By 2031: the entries stop making complete sentences. The last entry is dated four months before the Collapse. It reads: I understand now what they built and I cannot tell anyone and the only honest thing is fire.',
        cycleGate: 2,
      },
      {
        keywords: ['photograph', 'crew', 'janitorial', 'corridor', 'meridian'],
        description: 'Seven people in janitorial coveralls, squinting into the camera in a corridor. Behind them: painted cinder block, drop ceiling, institutional lighting. One person — second from left, slight, with the expression of someone who doesn\'t entirely like photographs — has circled their own face in pen. Below the circle: T.H. On the back: MERIDIAN MAINTENANCE CREW 4 — JULY 2030. YOU KNOW WHERE. IF YOU FIND THIS YOU ALREADY KNOW.',
        cycleGate: 2,
      },
      {
        keywords: ['maps', 'tunnel', 'route', 'access', 'scar'],
        description: 'Folded into the back of the journal: two hand-drawn maps. The first is a surface approach map to a mountain facility in the northern range. The second shows an internal schematic — partial, the notes indicating memory rather than documentation — with one route highlighted and labeled: MAINTENANCE TUNNEL — WEST FACE — STILL OPEN AS OF 2031. The tunnel bypasses the main MERIDIAN entrance. This is one of the routes in. The one that hasn\'t been defended because nobody knew to defend it.',
        cycleGate: 2,
        questGate: 'em_meridian_tunnel_knowledge',
      },
      {
        keywords: ['scratched text', 'words', 'stone', 'inscription'],
        description: 'THEY MADE IT AND COULDN\'T STOP IT AND NOW WE ARE THE FIRE THAT CLEANS. The scratching is deep — done with something metal, deliberately, slowly, the letters carefully formed. Harlow did this. The room was Harlow\'s private space, the place they came to be alone with what they knew. The text was written after the journal ends. Harlow survived long enough to scratch words into stone and then became the founder of the Kindling and spent the rest of their life building a religion out of what they knew.',
        cycleGate: 2,
      },
    ],
    hollowEncounter: {
      baseChance: 0.80,
      timeModifier: { night: 1.3, dawn: 0.9, dusk: 1.1, day: 0.7 },
      threatPool: [
        { type: 'brute', weight: 1, quantity: { min: 1, max: 1, distribution: 'flat' } },
      ],
    },
    npcSpawns: [],
    itemSpawns: [
      {
        entityId: 'harlow_journal_meridian',
        spawnChance: 1.0,
        quantity: { min: 1, max: 1, distribution: 'single' },
        conditionRoll: { min: 0.7, max: 0.9 },
        groundDescription: 'A cracked leather journal on the stone shelf, labeled HARLOW T. — PERSONAL — MERIDIAN.',
        depletion: { cooldownMinutes: { min: 99999, max: 99999 }, respawnChance: 0.0 },
      },
      {
        entityId: 'meridian_tunnel_map',
        spawnChance: 1.0,
        quantity: { min: 1, max: 1, distribution: 'single' },
        conditionRoll: { min: 0.6, max: 0.8 },
        groundDescription: 'Two folded maps tucked into the back cover of the journal.',
        depletion: { cooldownMinutes: { min: 99999, max: 99999 }, respawnChance: 0.0 },
      },
    ],
    narrativeNotes: 'Hidden behind Perception DC 16 OR Kindling Blooded. The founder\'s journal is a MERIDIAN janitor\'s record. Contains maintenance tunnel map — one of four Act III routes into the Scar. Brute boss guards the chapel.',
  },
]
