import type { Room } from '@/types/game'

// ============================================================
// THE EMBER — 20 Rooms
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
      {
        keywords: ['tunnel', 'harrow', 'kindling', 'meridian', 'entrance', 'scar', 'map'],
        description: 'You mention the incinerator — what you found there, the radiation signage that shouldn\'t exist on an industrial unit, the implications of what was burned and for whom. Harrow listens without moving. When you finish, he opens a drawer in his desk and removes a hand-drawn map, folded once, the paper heavy with use. "The fire showed us the way," he says. "Before the Collapse, this district processed material for the facility in the Scar. The workers used a supply tunnel — a direct line from the industrial yard to the MERIDIAN maintenance level. The entrance is beneath the rail yard, behind the loading platform. We\'ve kept it clear." He traces the route with one finger: from the Ember, south through the canyon, to an entrance that opens below MERIDIAN\'s maintenance hatch. "My people mapped it eighteen months ago. The charges are set. The hasp will come clean. When you\'re ready, the tunnel is yours." He refolds the map and holds it out. "Bring light back from whatever you find in there. We have burned long enough in the dark."',
        questGate: 'em_incinerator_radiation_investigated',
        skillCheck: { skill: 'negotiation', dc: 10, successAppend: 'Harrow holds the map a moment longer before releasing it. "I will tell you something I have not told the congregation. The tunnel is not empty. We cleared it twice and both times the Hollow returned within a week. Something in the tunnel draws them — the heat, the vibration, the MERIDIAN systems still running beneath the rock. My people will clear it a third time when you are ready to go. But you should know what you are walking through to get there." His eyes hold yours with the specific intensity of a man who sends people into places and counts the ones who come back.' },
        questFlagOnSuccess: { flag: 'kindling_tunnel_access', value: true },
        reputationGrant: { faction: 'kindling', delta: 1 },
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
      east: 'em_17_ruined_annex',
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

  // ----------------------------------------------------------
  // EM-11: The Char Fields
  // ----------------------------------------------------------
  {
    id: 'em_11_char_fields',
    name: 'The Ember — The Char Fields',
    zone: 'the_ember',
    act: 2,
    difficulty: 3,
    visited: false,
    flags: { scavengingZone: true },
    description: 'A neighborhood burned so completely that the structures are gone — not collapsed, not skeletal, gone. What remains are the foundations: concrete slabs at regular intervals, their edges blackened, the rebar exposed and rusted orange. Between the slabs, ash. Fine gray ash that shifts with any movement, with any wind, with the weight of a boot. The ash is thick enough to swallow a footprint. You leave tracks and the tracks fill slowly, as if the ground is breathing. The air here tastes different from the rest of The Ember district — not just smoke, but the specific mineral char of things that burned at temperature: brick dust, vaporized paint, the trace residue of lives that were in these houses when they stopped being houses. At the edge of your vision, something moves. By the time you look directly at it, there is only the ash and the foundations and the flat burned sky.',
    descriptionNight: 'At night the char fields are without reference. The foundations are invisible. The ash is the same gray as the sky and the sky has no stars on smoky nights. You navigate by feel and by the particular wrongness of the air where the ash is deepest. Something moves at the edge of vision. It is always there. At night you hear it.',
    descriptionDawn: 'Dawn light makes the ash fields look almost like snow. Almost. The cold is real. The foundations emerge from shadow as the light improves and you count them — fifteen, twenty, more than that — and understand that you are standing in what was a street with houses and people and the ordinary noise of people living, and it is all ash now, and the ash is still here because ash does not go anywhere.',
    shortDescription: 'Ash and foundations where a neighborhood was. Something moves at the edge of vision. The ash records every step.',
    exits: {
      east: 'em_12_collapsed_factory_floor',
      north: 'em_01_the_approach',
    },
    richExits: {},
    items: [],
    enemies: ['remnant', 'screamer'],
    npcs: [],
    hollowEncounter: {
      baseChance: 0.35,
      timeModifier: { day: 0.7, dusk: 1.3, night: 2.0, dawn: 1.0 },
      threatPool: [
        { type: 'remnant', weight: 55, quantity: { min: 1, max: 2, distribution: 'weighted_low' } },
        { type: 'screamer', weight: 25, quantity: { min: 1, max: 1, distribution: 'single' } },
        { type: 'shuffler', weight: 20, quantity: { min: 1, max: 3, distribution: 'bell' } },
      ],
      awarenessRoll: { unaware: 0.2, awarePassive: 0.3, awareAggressive: 0.5 },
      activityPool: {
        remnant: [
          { desc: 'drifts across the ash field with the slow directionless motion of something that has forgotten what it was looking for but has not forgotten how to look', weight: 3 },
          { desc: 'stands at the center of a foundation slab, perfectly still, facing in a direction that has nothing in it', weight: 2 },
        ],
        screamer: [
          { desc: 'crouches in a foundation corner, face pressed to the concrete, making no sound — until it hears you', weight: 2 },
        ],
      },
      noiseModifier: 1.4,
    },
    extras: [
      {
        keywords: ['foundations', 'slabs', 'concrete', 'rebar'],
        description: 'The foundations are poured concrete, some cracked by the heat, the rebar exposed at the cracks and flowering with rust. The spacing between them is regular enough to tell you the neighborhood was planned — all the lots the same width, all the houses set back the same distance from the street. The street itself is visible as a slightly lighter stripe of ash, the asphalt burned away to aggregate. You can reconstruct the neighborhood from this if you want to. You find that you do not want to.',
      },
      {
        keywords: ['ash', 'ground', 'footprints', 'tracks'],
        description: 'The ash is fine enough that your tracks behind you are clearly visible for maybe ten meters before they blur. Ahead, other tracks — older, the edges softened by whatever air movement crosses this field. Multiple sets. Some of them are the wrong shape for boots. You don\'t follow the wrong-shaped tracks.',
        skillCheck: { skill: 'tracking', dc: 12, successAppend: 'The wrong-shaped tracks lead to a foundation in the northwest corner. The indentations in the ash at the center of that slab are too regular to be random and too numerous to be single visits. Something rests there. Frequently.' },
      },
      {
        keywords: ['movement', 'edge', 'vision', 'peripheral'],
        description: 'You see it again when you are not looking at it. Peripheral vision is the oldest sense — it evolved for exactly this, for detecting motion at the edge of the visual field, for the thing that moves when the center of your attention is elsewhere. The char fields use this against you. The ash and the uniform gray of the light and the openness of the terrain produce movement where there may be none. May be none. You decide to keep moving.',
      },
    ],
    npcSpawns: [
      {
        npcId: 'scavenger_rival',
        spawnChance: 0.25,
        spawnType: 'wanderer',
        activityPool: [
          { desc: 'A scavenger picks through a foundation corner with a metal rod, testing the ash depth, looking for basement access that the fire might have missed.', weight: 3 },
          { desc: 'A scavenger crouches over something in the ash, brushing carefully with a gloved hand, the focused stillness of someone who has found something worth not breaking.', weight: 2 },
        ],
        dispositionRoll: { friendly: 0.1, neutral: 0.3, wary: 0.5, hostile: 0.1 },
        dialogueTree: 'em_scavenger_rival_fields',
        narrativeNotes: 'Rival scavenger working the char fields. Competitive but not violent unless the player has taken something they wanted.',
      },
    ],
    itemSpawns: [
      {
        entityId: 'scrap_metal',
        spawnChance: 0.50,
        quantity: { min: 1, max: 2, distribution: 'weighted_low' },
        conditionRoll: { min: 0.2, max: 0.6 },
        groundDescription: 'A tangle of rebar offcuts partially buried in ash near a cracked foundation.',
        depletion: { cooldownMinutes: { min: 480, max: 960 }, respawnChance: 0.30 },
      },
      {
        entityId: 'chemicals_basic',
        spawnChance: 0.20,
        quantity: { min: 1, max: 1, distribution: 'single' },
        conditionRoll: { min: 0.1, max: 0.5 },
        groundDescription: 'A partially melted container, something chemical still sealed inside by the deformation of the plastic.',
        depletion: { cooldownMinutes: { min: 720, max: 1440 }, respawnChance: 0.10 },
      },
    ],
    environmentalRolls: {
      flavorLines: [
        { line: 'Ash drifts across the field in a slow wave, erasing the tracks you just made.', chance: 0.25 },
        { line: 'A sound — not wind, not settling — from one of the far foundations. Then nothing.', chance: 0.20, time: ['dusk', 'night'] },
        { line: 'The light here is flat and gray even when the sky is clear. The ash reflects nothing.', chance: 0.15 },
        { line: 'Something at the edge of your vision. You turn. Ash. Foundations. The gray sky.', chance: 0.30 },
        { line: 'The temperature drops two degrees between foundation slabs and rises again on the concrete. The ash holds cold.', chance: 0.10 },
      ],
    },
    narrativeNotes: 'Act II open ground. High hollow density. Scavengers compete here for basement access points. The peripheral movement is both hollow and psychological — the Ember district does this to people.',
  },

  // ----------------------------------------------------------
  // EM-12: Collapsed Factory Floor
  // ----------------------------------------------------------
  {
    id: 'em_12_collapsed_factory_floor',
    name: 'The Ember — Collapsed Factory Floor',
    zone: 'the_ember',
    act: 2,
    difficulty: 3,
    visited: false,
    flags: { scavengingZone: true },
    description: 'The factory floor is vast — the kind of industrial space designed to make you understand scale, to make you feel correctly sized against what production meant when production was happening here. The roof has partially caved: two sections in, one still holding, the steel trusses bent by the fire\'s heat into shapes that have their own logic, like sculpture made by a process that didn\'t care what it was making. Light comes through the holes in irregular shafts that move through the day and make the floor an unreliable thing to read. The machinery is still here, rusted into configurations that are no longer the configurations they were designed for. A conveyor belt sags from its rollers in a long curve. A stamping press stands open, frozen mid-stroke. A gantry crane is locked at an angle that suggests it was moving when the fire reached whatever held it together. The footing is poor throughout: the floor has heaved in places, buckled where supports failed, and the debris is variable — you find steel under ash under glass under concrete in patterns that reward care and punish confidence.',
    descriptionNight: 'At night the factory floor is dark except where the roof holes allow sky. Moonlight or cloudy dark. The rusted machinery is shapes only. The footing, already poor in the day, is navigable at night only if you know where you\'ve already been.',
    shortDescription: 'A vast burned factory — roof partially caved, machinery rusted into sculpture, good scavenging for those who can manage the footing.',
    exits: {
      west: 'em_11_char_fields',
      north: 'em_13_chemical_tank_farm',
      up: 'em_14_foremans_office',
      east: 'em_16_loading_dock',
    },
    richExits: {
      up: {
        destination: 'em_14_foremans_office',
        skillGate: { skill: 'climbing', dc: 11, failMessage: 'The access stairs are partially collapsed. You can\'t find a safe route up without better footing.' },
        descriptionVerbose: 'a metal staircase along the north wall, partially collapsed, leading to the elevated foreman\'s office',
      },
    },
    items: [],
    enemies: [],
    npcs: [],
    hollowEncounter: {
      baseChance: 0.20,
      timeModifier: { day: 0.6, dusk: 1.2, night: 1.8, dawn: 0.9 },
      threatPool: [
        { type: 'shuffler', weight: 50, quantity: { min: 1, max: 3, distribution: 'bell' } },
        { type: 'remnant', weight: 30, quantity: { min: 1, max: 2, distribution: 'weighted_low' } },
        { type: 'brute', weight: 20, quantity: { min: 1, max: 1, distribution: 'single' } },
      ],
      awarenessRoll: { unaware: 0.4, awarePassive: 0.35, awareAggressive: 0.25 },
      activityPool: {
        shuffler: [
          { desc: 'moves between machinery at the far end of the floor with the aimless persistence of something that learned to walk here and hasn\'t stopped', weight: 3 },
        ],
        brute: [
          { desc: 'stands beneath the caved section of the roof, upright, head tilted back toward the open sky, still in the way that large things are still when they\'re waiting', weight: 2 },
        ],
      },
    },
    extras: [
      {
        keywords: ['machinery', 'rusted', 'conveyor', 'press', 'crane'],
        description: 'The stamping press is frozen mid-stroke — the die lowered to within two centimeters of the bed, held there by whatever jammed in the mechanism when the power failed or the operator left or the fire arrived. The part that was being stamped is still in the die. A steel blank, fire-warped, the impression only half-formed. The work stopped here. The machine doesn\'t know that.',
        skillCheck: { skill: 'mechanics', dc: 12, successAppend: 'The press is salvageable in components — the hydraulic cylinder is intact, the die steel is good, the bed still level. A Reclaimer with the right equipment could get a working press from this in a day. The question is whether the floor will hold the weight of the removal.' },
      },
      {
        keywords: ['roof', 'cave', 'trusses', 'holes', 'light'],
        description: 'The two caved sections are connected by a surviving truss that bridges them — bent by the heat but still in place, the steel having deformed to a shape it will hold indefinitely. The light through the holes changes the floor by hour. At midmorning the western hole throws a shaft across the conveyor. At midday the shafts are nearly vertical. The factory floor was designed to be dark. The fire made it something else.',
      },
      {
        keywords: ['footing', 'floor', 'debris', 'unstable'],
        description: 'The floor heave is worst near the north wall — subsidence from whatever happened below. You test each step before committing. Under the ash: collapsed ductwork in one section that rings hollow underfoot, meaning there is a void beneath, meaning you do not step there. Near the conveyor: good concrete, solid, the fire having left it structurally intact even while taking everything else. You map the safe route through without thinking about it. This is just how you move in places like this.',
      },
    ],
    npcSpawns: [
      {
        npcId: 'scavenger_rival',
        spawnChance: 0.35,
        spawnType: 'wanderer',
        activityPool: [
          { desc: 'A scavenger works the conveyor belt section, pulling rollers free with a pry bar, the ringing metal sound carrying across the whole floor.', weight: 3 },
          { desc: 'A scavenger tests the floor carefully ahead of them, moving with the deliberate caution of experience in unstable spaces.', weight: 2 },
          { desc: 'A scavenger has set up a small field camp near the surviving roof section — bedroll, pack, a lamp. Working this section over multiple days.', weight: 1 },
        ],
        dispositionRoll: { friendly: 0.15, neutral: 0.35, wary: 0.40, hostile: 0.10 },
        dialogueTree: 'em_scavenger_rival_factory',
        narrativeNotes: 'Serious scavenger, experienced. Will trade information about the tank farm and the foreman\'s office if disposition improves.',
      },
      {
        npcId: 'reclaimer_craftsperson',
        spawnChance: 0.20,
        spawnType: 'wanderer',
        activityPool: [
          { desc: 'A Reclaimer craftsperson moves through the machinery with a notebook, making sketches and measurements, their attention absorbed by the technical detail of what\'s salvageable.', weight: 3 },
          { desc: 'A Reclaimer examines the stamping press closely, running gloved hands along the die assembly, lips moving as they calculate something.', weight: 2 },
        ],
        dispositionRoll: { friendly: 0.35, neutral: 0.45, wary: 0.20, hostile: 0.0 },
        dialogueTree: 'em_reclaimer_craftsperson_factory',
        narrativeNotes: 'Reclaimer doing a technical assessment. Can give quests related to recovering specific components.',
      },
    ],
    itemSpawns: [
      {
        entityId: 'scrap_metal',
        spawnChance: 0.65,
        quantity: { min: 1, max: 3, distribution: 'bell' },
        conditionRoll: { min: 0.2, max: 0.7 },
        groundDescription: 'Structural steel offcuts and collapsed shelving, partially buried in ash and debris.',
        depletion: { cooldownMinutes: { min: 360, max: 720 }, respawnChance: 0.40 },
      },
      {
        entityId: 'salvaged_engine_part',
        spawnChance: 0.30,
        quantity: { min: 1, max: 1, distribution: 'single' },
        conditionRoll: { min: 0.3, max: 0.8 },
        groundDescription: 'A machine component — motor housing or pump — sits under a collapsed section of conveyor, visible from the right angle.',
        depletion: { cooldownMinutes: { min: 480, max: 960 }, respawnChance: 0.20 },
      },
      {
        entityId: 'wire_coil',
        spawnChance: 0.40,
        quantity: { min: 1, max: 2, distribution: 'weighted_low' },
        conditionRoll: { min: 0.3, max: 0.9 },
        groundDescription: 'Copper wire coils on a fallen spool rack near the east wall — the insulation cracked but the copper intact.',
        depletion: { cooldownMinutes: { min: 480, max: 960 }, respawnChance: 0.35 },
      },
    ],
    environmentalRolls: {
      flavorLines: [
        { line: 'A section of ductwork settles somewhere in the debris with a low, resonant boom.', chance: 0.20 },
        { line: 'The light shaft from the western roof hole slides across the stamping press and for a moment the frozen die looks like it moved.', chance: 0.15, time: ['dawn', 'day'] },
        { line: 'Something drips from the surviving truss — water or condensation — the sound irregular enough to confuse your pattern-recognition.', chance: 0.20 },
        { line: 'The floor underfoot gives slightly — not failure, just the compression of debris beneath the ash. You stop. It holds.', chance: 0.25 },
      ],
    },
    narrativeNotes: 'Central factory space. Hub for east/west/north/up routes. High scavenging value, unstable footing, moderate hollow presence. The foreman\'s office above requires Climbing check.',
  },

  // ----------------------------------------------------------
  // EM-13: Chemical Tank Farm
  // ----------------------------------------------------------
  {
    id: 'em_13_chemical_tank_farm',
    name: 'The Ember — Chemical Tank Farm',
    zone: 'the_ember',
    act: 2,
    difficulty: 4,
    visited: false,
    flags: { scavengingZone: false },
    description: 'The tank farm occupies the north end of the factory complex — a grid of cylindrical storage tanks on concrete pads, linked by pipe manifolds and valve assemblies that are still nominally intact even after the fire. Some tanks are sealed, their pressure gauges frozen at readings you cannot interpret. Some are ruptured: the steel split along a seam, the interior visible as a cave of rust and residue, and from several of the split tanks something is still leaking — a slow seep of liquid that has created a discolored stain on the concrete spreading outward from each rupture in a rough circle. The liquid is not water. The smell tells you this before the visual does: a sharp organic chemical odor with a second note underneath it that you cannot name but that your body knows to dislike. The air here is wrong in a way that is different from the rest of the district\'s wrongness. This is where the fire started, according to one theory. Standing here, looking at the ruptured tanks and the spreading stain and the valve assemblies that should have been closed and may or may not have been, you find the theory credible.',
    descriptionNight: 'The tank farm at night: the seeping liquid catches whatever ambient light crosses the concrete and gives it back slightly luminescent, slightly wrong. The smell is the same at night. The smell is always the same.',
    descriptionDawn: 'Dawn light makes the stains on the concrete look like topographical maps — the shapes of whatever has been seeping from which tanks for how long, spreading and pooling and drying and spreading again. You can read the history of the leaks from the rings. The outermost rings are from before the fire.',
    shortDescription: 'Rows of storage tanks, some sealed, some ruptured and leaking something wrong. The smell. This is where the fire started.',
    exits: {
      south: 'em_12_collapsed_factory_floor',
      north: 'em_18_cooling_towers',
    },
    richExits: {
      south: {
        destination: 'em_12_collapsed_factory_floor',
        descriptionVerbose: 'back through the tank farm\'s south access gate into the factory floor',
      },
    },
    items: [],
    enemies: [],
    npcs: [],
    hollowEncounter: {
      baseChance: 0.15,
      timeModifier: { day: 0.8, dusk: 1.0, night: 1.5, dawn: 0.9 },
      threatPool: [
        { type: 'remnant', weight: 60, quantity: { min: 1, max: 2, distribution: 'weighted_low' } },
        { type: 'shuffler', weight: 40, quantity: { min: 1, max: 2, distribution: 'weighted_low' } },
      ],
      awarenessRoll: { unaware: 0.5, awarePassive: 0.3, awareAggressive: 0.2 },
      noiseModifier: 0.8,
    },
    extras: [
      {
        keywords: ['tanks', 'sealed', 'gauges', 'pressure', 'intact'],
        description: 'The sealed tanks are rated at something — the gauge faces are corroded but the needles are still at position. If the ratings are still accurate, some of these tanks are still pressurized. Fire rarely improves pressure vessel integrity. You give the sealed tanks more clearance than the ruptured ones. The ruptured ones have already done what they were going to do.',
        skillCheck: { skill: 'mechanics', dc: 13, successAppend: 'Tank seven — northeast corner, the smallest intact vessel — has a pressure gauge reading significantly below tank spec but still above ambient. The contents are still live. The valve assembly on this one is accessible and in better condition than the others. You could drain it. You decide to think about whether that\'s a good idea.' },
      },
      {
        keywords: ['leak', 'liquid', 'stain', 'seeping', 'chemical'],
        description: 'You crouch near the edge of the nearest stain — not in it, at the edge. The liquid is slightly viscous, slightly amber, and the concrete it has pooled on has been etched where the concentration is highest. Industrial solvent of some kind. Pre-Collapse manufacture. The tanks were not labeled on the outside — the labels would have been on manifold sheets or a schematic. No manifold sheets remain.',
        skillCheck: { skill: 'lore', dc: 12, successAppend: 'The etching on the concrete, the viscosity, the second smell underneath the primary chemical smell — this is a petroleum-derived solvent, highly flammable, the kind used as a degreaser or industrial cleaner. In sufficient concentration and with an ignition source, this would have been the start. Not an accident if someone opened the valves. Not impossible as an accident if the fire reached the valve assemblies first. You cannot determine which.' },
      },
      {
        keywords: ['fire', 'origin', 'started', 'source', 'ignition'],
        description: 'The char pattern on the concrete around the ruptured tanks radiates outward from the rupture points — the fire moved from here, not to here. Which means the tanks ruptured first and the contents ignited, or the contents were released and then ignited, or the fire reached the tanks from elsewhere and the rupture was the result rather than the cause. The char pattern is consistent with all three explanations. You stand here for a while, reading the concrete, and come to no conclusion that the concrete didn\'t already have.',
        skillCheck: { skill: 'survival', dc: 14, successAppend: 'The valve assembly on the largest ruptured tank shows manual operation — the wheel is in the open position and the wear pattern on the handle is inconsistent with the handle having been turned by the heat. Someone opened this valve. The fire that destroyed the district started here, and someone opened this valve, and you cannot tell from physical evidence whether that someone survived.' },
        questFlagOnSuccess: { flag: 'em_tank_farm_valve_investigated', value: true },
        reputationGrant: { faction: 'kindling', delta: 1 },
      },
      {
        keywords: ['pipe', 'manifold', 'valve', 'assembly'],
        description: 'The pipe manifolds connect the tanks in a grid — a system designed for control, for moving product between storage and processing, for the ordinary commerce of industrial chemistry. The grid is still connected. Some valves open, some closed, the current positions a mixture of whatever the operators set before the fire and whatever the fire itself moved. Reading the manifold is reading the last moment of the facility\'s operation, frozen in metal.',
      },
    ],
    npcSpawns: [],
    itemSpawns: [
      {
        entityId: 'chemicals_basic',
        spawnChance: 0.45,
        quantity: { min: 1, max: 2, distribution: 'weighted_low' },
        conditionRoll: { min: 0.1, max: 0.5 },
        groundDescription: 'A sealed chemical drum, smaller than the storage tanks, still intact — its label mostly destroyed but the seal uncompromised.',
        depletion: { cooldownMinutes: { min: 720, max: 1440 }, respawnChance: 0.20 },
      },
    ],
    environmentalRolls: {
      flavorLines: [
        { line: 'The chemical smell intensifies without warning, then fades. The air currents in the tank farm have their own logic.', chance: 0.30 },
        { line: 'A low hiss from somewhere in the pipe manifold — pressure equalization or something moving in the system. You cannot tell which.', chance: 0.15 },
        { line: 'The seeping liquid catches your boot edge. You move away from it carefully.', chance: 0.20 },
        { line: 'One of the sealed tanks produces a soft ticking sound — metal contracting in the temperature change. Rational. You wait to be sure.', chance: 0.15 },
      ],
    },
    narrativeNotes: 'Act II investigation room. High narrative weight — the origin of the Ember fire. Skill checks reveal evidence of deliberate valve operation. Quest flag feeds into the larger Ember mystery. Low hollow density because the chemical smell suppresses aggregation.',
  },

  // ----------------------------------------------------------
  // EM-14: Foreman's Office
  // ----------------------------------------------------------
  {
    id: 'em_14_foremans_office',
    name: 'The Ember — Foreman\'s Office',
    zone: 'the_ember',
    act: 2,
    difficulty: 3,
    visited: false,
    flags: { noCombat: false },
    description: 'The foreman\'s office is elevated above the factory floor on a steel-framed platform — a glass-and-metal booth designed for line-of-sight across the production space below. The glass is gone, melted or blown out, the frames empty and ragged. The floor is still solid: steel plate, the rubber anti-fatigue mat beneath the desk still present and still rubber, which tells you something about what burned and what didn\'t. The desk. A wheeled office chair, the fabric gone, the steel frame and wheels remaining. Filing cabinets along the back wall — the drawers warped but some still openable, the papers inside transformed by heat into brown brittle sheets that crumble if you handle them carelessly. A personal locker beside the filing cabinets, the padlock still closed. On the desk: a wire inbox, two pens fused to the surface, and a production schedule printed on green-bar paper, the ink faded but legible. The schedule runs through August 2031. The Collapse was September 2031. The last week of the schedule shows normal production targets. No one wrote in the margin that it would be the last week.',
    descriptionNight: 'From the office at night, the factory floor below is darkness and the shapes of machinery. You can see the char fields to the west through the empty window frames. The ash out there picks up any sky glow. The distance makes it quiet.',
    shortDescription: 'Elevated above the floor — a foreman\'s office, a production schedule through August 2031, and a locked personal locker with a padlock still on it.',
    exits: {
      down: 'em_12_collapsed_factory_floor',
    },
    richExits: {},
    items: [],
    enemies: [],
    npcs: [],
    hollowEncounter: {
      baseChance: 0.10,
      timeModifier: { day: 0.5, dusk: 1.2, night: 1.8, dawn: 0.8 },
      threatPool: [
        { type: 'remnant', weight: 70, quantity: { min: 1, max: 1, distribution: 'single' } },
        { type: 'shuffler', weight: 30, quantity: { min: 1, max: 1, distribution: 'single' } },
      ],
      awarenessRoll: { unaware: 0.45, awarePassive: 0.35, awareAggressive: 0.20 },
    },
    extras: [
      {
        keywords: ['schedule', 'production', 'green-bar', 'paper', 'desk'],
        description: 'The production schedule runs Monday to Friday, eight-hour shifts, with targets listed by line and product code. The product codes mean nothing to you. The shift supervisors are listed by initial: K., M., V., T. Line 3 was running below target in July. Someone circled the Line 3 numbers in red pen and wrote: discuss — efficiency or staffing? The question was written perhaps two months before the fire. It was never answered. Or it was answered in a way the writer didn\'t anticipate.',
        skillCheck: { skill: 'lore', dc: 11, successAppend: 'The product codes on the schedule — cross-referencing with the tank manifold schematic you may have seen — resolve to: industrial solvents, degreaser compounds, and one line labeled only with a government contract number. The government contract line ran through all of 2030 and into 2031. The other lines dropped off in early 2031. By August, only the government contract line was running at full capacity.' },
        questFlagOnSuccess: { flag: 'em_foreman_schedule_read', value: true },
      },
      {
        keywords: ['filing cabinet', 'files', 'papers', 'drawers'],
        description: 'The middle drawer opens with effort — the heat warped the frame but not beyond function. Inside: personnel files, the paper brown and fragile. You lift one carefully. A hire form — name, address, date of hire, emergency contact. The emergency contact field is filled in. The name in that field is the same name as the employee. They listed themselves as their own emergency contact. You put the file back and close the drawer.',
      },
      {
        keywords: ['locker', 'padlock', 'personal'],
        description: 'The padlock is a standard combination type, the steel discolored by heat but the mechanism apparently intact. The locker is narrow — a personal effects locker, not a gear locker. Whatever is inside is whatever the foreman considered worth locking up at work.',
        skillCheck: { skill: 'lockpicking', dc: 14, successAppend: 'The padlock releases. Inside the locker: a photograph of two children (no names written on it), a bottle of aspirin half full, a spare set of keys on a clip labeled HOME, and a handwritten note folded small. The note reads: "I know what\'s in Tank 7. I know what the contract is for. I signed the NDA. I don\'t know how to sign the other thing." The note is not dated. It was written here and left here and never sent to anyone.' },
        questFlagOnSuccess: { flag: 'em_foreman_locker_opened', value: true },
      },
      {
        keywords: ['view', 'window', 'floor', 'below', 'factory'],
        description: 'From the empty window frames, the factory floor below: the conveyor in its long sag, the stamping press frozen, the gantry crane at its angle. From up here the scale of the space is different — larger, the individual machines reducing to components of a system that made sense as a system. The roof holes let in the sky. The shafts of light move. From up here you can see the floor\'s whole pattern of collapse and survival and the route through it is visible in a way it isn\'t from the ground.',
      },
    ],
    npcSpawns: [
      {
        npcId: 'reclaimer_signal_tech',
        spawnChance: 0.20,
        spawnType: 'wanderer',
        activityPool: [
          { desc: 'A Reclaimer signal tech sits at the foreman\'s desk with portable equipment, using the elevation to take signal readings from a device you don\'t recognize. She\'s methodical, patient.', weight: 3 },
          { desc: 'A Reclaimer is at the empty window frame, looking across the factory complex, making notes in a field book with careful sketches of the facility layout.', weight: 2 },
        ],
        dispositionRoll: { friendly: 0.30, neutral: 0.50, wary: 0.20, hostile: 0.0 },
        dialogueTree: 'em_reclaimer_signal_tech_office',
        narrativeNotes: 'Reclaimer investigating the facility. Knows something about the government contract. Possible quest giver for tank farm investigation.',
      },
    ],
    itemSpawns: [
      {
        entityId: 'hand_tools_basic',
        spawnChance: 0.35,
        quantity: { min: 1, max: 1, distribution: 'single' },
        conditionRoll: { min: 0.4, max: 0.8 },
        groundDescription: 'A tool roll under the desk — screwdrivers and hex keys in a canvas wrap, mostly intact.',
        depletion: { cooldownMinutes: { min: 360, max: 720 }, respawnChance: 0.15 },
      },
      {
        entityId: 'crafting_components',
        spawnChance: 0.25,
        quantity: { min: 1, max: 1, distribution: 'single' },
        conditionRoll: { min: 0.5, max: 0.9 },
        groundDescription: 'A parts box in the desk drawer — small hardware, clips, and fittings still in their labeled bins.',
        depletion: { cooldownMinutes: { min: 480, max: 960 }, respawnChance: 0.15 },
      },
    ],
    personalLossEchoes: {
      child: 'The photograph of two children in the locker. No names. The foreman locked it in here. It was the thing worth locking up.',
      partner: 'HOME, the keys are labeled. Someone was home. The note in the locker was never sent. The keys never went back.',
    },
    narrativeNotes: 'Elevated room, investigative focus. Production schedule and locker note build the tank farm conspiracy. Personal loss echoes for child/partner. Connects to the broader Ember fire mystery.',
  },

  // ----------------------------------------------------------
  // EM-15: The Burn Shelter
  // ----------------------------------------------------------
  {
    id: 'em_15_burn_shelter',
    name: 'The Ember — The Burn Shelter',
    zone: 'the_ember',
    act: 2,
    difficulty: 2,
    visited: false,
    flags: { safeRest: true, noCombat: true },
    description: 'The shelter is a basement room — one of the char field foundations had a cellar, and the cellar survived because concrete and earth are patient in the way that fire is not. The access is through a steel hatch, the hinges rusted but functional, the hatch itself warped at one corner and requiring both hands and a specific angle. Below: a single room, low-ceilinged, the walls unpainted concrete, a small high window that is now at ground level and admits a stripe of light across the floor. Someone lived here after the fire. The evidence is layered: bedding in the corner — not rotted, but old enough that the fabric has lost its original color to a uniform dust. Supplies along the west wall — canned goods, some still sealed, some opened and cleaned out and stacked. A camp stove, fuel empty. A clothesline strung corner to corner, nothing on it now. And on the south wall, above the bedding, a journal in a waterproof bag hung from a driven nail. The journal is not recent. Whoever was here is gone. They left the journal on purpose. It is a record, not an accident.',
    descriptionNight: 'The shelter is the same at night as in the day — the basement has no day or night, just the stripe of light from the window going dark. When the window goes dark the room is fully dark. You bring your own light.',
    shortDescription: 'A basement shelter that survived the fire — bedding, canned goods, a camp stove, and a journal hung deliberately on the wall.',
    exits: {
      up: 'em_11_char_fields',
    },
    richExits: {
      up: {
        destination: 'em_11_char_fields',
        hidden: true,
        discoverSkill: 'perception',
        discoverDc: 13,
        discoverMessage: 'A steel hatch in the ash — its edges just visible, the handle flush to the surface. A cellar.',
        descriptionVerbose: 'the steel hatch up to the char fields',
      },
    },
    items: [],
    enemies: [],
    npcs: [],
    extras: [
      {
        keywords: ['bedding', 'supplies', 'cans', 'stove', 'clothesline'],
        description: 'The supply inventory, such as it is: six cans still sealed (no labels, the paper having gone at some point), four opened and stacked. A camp stove with its fuel canister run dry — but the stove itself is good, clean, maintained. A clothesline with wooden clips still on it — three clips. Three things were hung to dry and then taken. The bedding in the corner is a sleeping bag and a folded wool blanket. The sleeping bag zipper is open. Whoever slept here left it that way. As if they expected to return.',
      },
      {
        keywords: ['journal', 'bag', 'nail', 'waterproof', 'south wall'],
        description: 'The journal is in a zipper-seal bag, the kind used for waterproofing gear. Hung from a nail with a loop of cord. It was not left by accident — it was placed deliberately, at eye height, on the wall you face when you\'re in the bedding. Whoever wrote it wanted it found. You take it down.',
      },
      {
        keywords: ['window', 'light', 'stripe', 'ground level'],
        description: 'The window is a standard basement window, now at ground level — the ash outside has built up enough over years to bring the ground surface nearly flush with the window frame. Light comes through in a stripe that moves slowly through the day. At the right hour it falls directly on the nail where the journal hangs. This may be intentional. It may be the kind of thing you notice in spaces where the only light comes from one direction.',
      },
      {
        keywords: ['hatch', 'door', 'access', 'entrance'],
        description: 'The hatch is heavy, the warped corner requiring force to seat properly. You practice closing and opening it twice before you\'re satisfied with the angle. Old habit: knowing your exit. Whoever lived here did the same thing — the hatch mechanism shows wear in the specific places that specific-angle operation produces.',
      },
    ],
    npcSpawns: [],
    itemSpawns: [
      {
        entityId: 'burn_shelter_journal',
        spawnChance: 1.0,
        quantity: { min: 1, max: 1, distribution: 'single' },
        conditionRoll: { min: 0.75, max: 0.95 },
        groundDescription: 'A journal in a waterproof bag, hung from a nail on the south wall at eye height.',
        depletion: { cooldownMinutes: { min: 99999, max: 99999 }, respawnChance: 0.0 },
      },
      {
        entityId: 'boiled_rations',
        spawnChance: 0.40,
        quantity: { min: 1, max: 2, distribution: 'weighted_low' },
        conditionRoll: { min: 0.5, max: 0.9 },
        groundDescription: 'Sealed cans without labels — no way to know what\'s inside until you open them.',
        depletion: { cooldownMinutes: { min: 720, max: 1440 }, respawnChance: 0.10 },
      },
    ],
    environmentalRolls: {
      flavorLines: [
        { line: 'The silence down here is different from the silence above. Complete. The fire didn\'t reach this.', chance: 0.25 },
        { line: 'The stripe of light from the window shifts half an inch. The day is moving.', chance: 0.20, time: ['day'] },
        { line: 'Something settles in the ash above — weight on the hatch, then gone. You wait.', chance: 0.15 },
        { line: 'The camp stove. Clean. Maintained by someone who expected to need it again.', chance: 0.20 },
      ],
    },
    personalLossEchoes: {
      community: 'Someone lived here after everyone else was gone. Fed themselves from cans with no labels. Hung their clothes to dry. Left the sleeping bag open as if they\'d be back. Whatever community this was, it ended here, in a basement under ash.',
      identity: 'The name torn from the journal. A person who survived and recorded the survival and then took their name with them. Identity is portable. Sometimes it\'s all that is.',
    },
    narrativeNotes: 'Hidden room — Perception DC 13 to find the hatch from char fields. Safe rest, no combat. The journal is the key lore item. Whoever was here knew something about the fire and its origin. Mood room: aftermath of survival, not danger.',
  },

  // ----------------------------------------------------------
  // EM-16: Loading Dock
  // ----------------------------------------------------------
  {
    id: 'em_16_loading_dock',
    name: 'The Ember — Loading Dock',
    zone: 'the_ember',
    act: 2,
    difficulty: 4,
    visited: false,
    flags: { scavengingZone: true },
    description: 'The loading dock is at the rear of the factory complex — the functional back end, where the building turns from production to logistics. Three cargo bays face the rail spur: massive rolling doors, the steel tracks still in place, the doors themselves hanging at angles where the rollers failed or the frames warped in the heat. One door is fully closed. One is fully open. One is frozen at about waist height, which makes the bay it serves accessible only by crawling or climbing. The rail spur runs east from the dock along a concrete pad and then ends — the tracks simply stopping where the connection to the main line was severed, or where the main line itself was taken for salvage, or where whatever came for the last shipment didn\'t come back. The dock itself: loading equipment, mostly intact — hand trucks, pallet jacks, the steel frames rusted but the geometries correct. Tie-down anchor points along the dock walls at regular intervals. The space under the open dock door has been used recently — ash disturbed, surfaces touched, the particular arrangement of things that someone has been through and is likely to come back to. The Hollow here cluster in the enclosed bays. The space suits them in a way that open ground doesn\'t.',
    descriptionNight: 'The loading dock at night. The open bay is a hole in the building with no light inside. The closed bay and the half-open bay are shapes. The rail spur goes east into dark. You cannot see where it ends.',
    shortDescription: 'Rear of the complex — three cargo bays, a rail spur that goes nowhere, and a Hollow cluster in the enclosed space.',
    exits: {
      west: 'em_12_collapsed_factory_floor',
      east: 'em_19_rail_yard',
      south: 'em_20_the_incinerator',
    },
    richExits: {},
    items: [],
    enemies: ['remnant', 'brute'],
    npcs: [],
    hollowEncounter: {
      baseChance: 0.50,
      timeModifier: { day: 0.8, dusk: 1.2, night: 1.6, dawn: 1.0 },
      threatPool: [
        { type: 'remnant', weight: 40, quantity: { min: 1, max: 3, distribution: 'bell' } },
        { type: 'brute', weight: 30, quantity: { min: 1, max: 1, distribution: 'single' } },
        { type: 'shuffler', weight: 20, quantity: { min: 1, max: 3, distribution: 'bell' } },
        { type: 'screamer', weight: 10, quantity: { min: 1, max: 1, distribution: 'single' } },
      ],
      awarenessRoll: { unaware: 0.2, awarePassive: 0.25, awareAggressive: 0.55 },
      activityPool: {
        remnant: [
          { desc: 'clusters near the closed bay door in a group of three, standing with the compressed stillness of things that have found a space and decided it belongs to them', weight: 3 },
          { desc: 'moves along the dock wall in a slow circuit, its path worn into the ash — it has been doing this long enough to make a track', weight: 2 },
        ],
        brute: [
          { desc: 'occupies the half-open bay, its mass filling the crawl-space entrance. It doesn\'t move until you\'re close. Then it moves fast.', weight: 3 },
        ],
        screamer: [
          { desc: 'perches on the dock\'s upper loading framework, visible only from certain angles, its attention on you before you see it', weight: 2 },
        ],
      },
      noiseModifier: 1.6,
    },
    extras: [
      {
        keywords: ['cargo bays', 'doors', 'rolling', 'tracks'],
        description: 'The three bays were designed to handle full pallet loads — the floor level precisely matched to truck-bed height, the tracks wide enough for powered loading equipment. The bay that\'s open gives you the interior: empty, the far wall faintly visible, a few wooden pallet fragments. The bay that\'s closed may contain something or may be empty — the door is sealed in its distorted frame and would require significant force to open. The half-open bay is the interesting one. The ash in front of it has been disturbed from both directions.',
        skillCheck: { skill: 'mechanics', dc: 12, successAppend: 'The fully closed bay door has a manual release handle on the inside — visible through the gap at the bottom. The handle is in the released position, which means the door is held shut only by the warped frame, not the locking mechanism. With the right tool and leverage point, you could get it open.' },
      },
      {
        keywords: ['rail spur', 'tracks', 'east', 'train', 'end'],
        description: 'The rail spur ends about forty meters east of the dock at a point where the tracks were cut — not broken by the fire but cut, the metal sheared cleanly, the cut edges still showing the fresh-ish silver of a cleaner break than time and heat would produce. Someone took the rails. Salvage, probably, but recent-ish salvage — the broken ends haven\'t rusted to the color of the rest of the track yet. The last car that sat on this spur left whatever it was carrying before the fire and went somewhere, or left carrying what it was supposed to carry and that was that.',
        skillCheck: { skill: 'tracking', dc: 13, successAppend: 'The concrete pad beside the cut tracks shows vehicle marks — wide tires, heavy load. A truck or loader. The marks are old enough to have been partially filled by ash drift, but the depth of the original impression was substantial. This happened in the period immediately after the fire, when the facility was still accessible, when salvage teams were still moving through. Someone organized and resourced enough to bring cutting equipment. Not scavengers. Something more deliberate.' },
      },
      {
        keywords: ['pallet jack', 'hand trucks', 'equipment', 'loading'],
        description: 'The pallet jacks are still functional — the hydraulic systems survived the fire better than the structural elements, the seals dried but not failed. If you pump the handle, the forks rise. Slowly, with resistance, but they rise. Pre-Collapse logistics equipment built to outlast almost anything. These would be worth something to a settlement with freight to move. They are also very heavy to carry out.',
      },
      {
        keywords: ['ash', 'disturbed', 'tracks', 'recent', 'used'],
        description: 'The ash near the half-open bay has been disturbed by repeated passage — a path worn through it from the bay interior to the dock edge and back. The path is not from the Hollow, whose passage through ash leaves a different signature — heavier, more random. Something with a more deliberate gait used this path. Not recently enough to matter and recently enough to matter. You stand on the dock and feel the particular alertness of spaces that are being watched from an angle you haven\'t found yet.',
      },
    ],
    npcSpawns: [
      {
        npcId: 'scavenger_rival',
        spawnChance: 0.30,
        spawnType: 'wanderer',
        activityPool: [
          { desc: 'A scavenger works the pallet jacks with evident frustration — they\'re trying to move one out and the weight is defeating them.', weight: 2 },
          { desc: 'A scavenger emerges from the half-open bay on hands and knees, pack first, something heavy inside. They see you and go very still.', weight: 3 },
          { desc: 'A scavenger stands at the end of the rail spur, looking east along the tracks toward where they were cut, working through something.', weight: 1 },
        ],
        dispositionRoll: { friendly: 0.05, neutral: 0.25, wary: 0.50, hostile: 0.20 },
        dialogueTree: 'em_scavenger_rival_dock',
        narrativeNotes: 'High tension encounter. The scavenger has been working this dock and considers it their site. The Hollow presence means both parties have a shared threat but not necessarily a shared interest.',
      },
    ],
    itemSpawns: [
      {
        entityId: 'scrap_metal',
        spawnChance: 0.55,
        quantity: { min: 1, max: 3, distribution: 'bell' },
        conditionRoll: { min: 0.3, max: 0.7 },
        groundDescription: 'Steel loading frames and dock equipment — structural steel in salvageable lengths.',
        depletion: { cooldownMinutes: { min: 480, max: 960 }, respawnChance: 0.35 },
      },
      {
        entityId: 'wire_coil',
        spawnChance: 0.30,
        quantity: { min: 1, max: 1, distribution: 'single' },
        conditionRoll: { min: 0.4, max: 0.8 },
        groundDescription: 'A coil of heavy-gauge tie-down cable — the fiber core gone but the steel braid intact.',
        depletion: { cooldownMinutes: { min: 480, max: 960 }, respawnChance: 0.20 },
      },
      {
        entityId: 'crafting_components',
        spawnChance: 0.25,
        quantity: { min: 1, max: 2, distribution: 'weighted_low' },
        conditionRoll: { min: 0.3, max: 0.7 },
        groundDescription: 'Hydraulic fittings and fasteners spilled from a collapsed parts rack near the dock wall.',
        depletion: { cooldownMinutes: { min: 360, max: 720 }, respawnChance: 0.25 },
      },
    ],
    environmentalRolls: {
      flavorLines: [
        { line: 'Movement in the closed bay — something settling, or something that was still choosing to move. The sound doesn\'t repeat.', chance: 0.25 },
        { line: 'The rail tracks creak in the temperature change. Metal remembers its original tension.', chance: 0.15 },
        { line: 'Wind through the open bay door produces a low, resonant note — the dock as instrument, unintentional.', chance: 0.15 },
        { line: 'The half-open bay door registers on your peripheral vision as movement every time the light changes. It does not move.', chance: 0.20 },
        { line: 'The pallet jack hydraulics hold the load for three seconds after you stop pumping, then settle. Still functional. Still useful, if you can get it out.', chance: 0.10 },
      ],
    },
    narrativeNotes: 'Act II high-difficulty room. Highest hollow density in the zone. The rail spur cut is a mystery thread — who took the rails and why, in the period immediately after the fire. Scavenger encounter is tense, potentially hostile. Good loot for players who can clear the hollows.',
  },

  // ----------------------------------------------------------
  // EM-17: The Ruined Annex
  // ----------------------------------------------------------
  {
    id: 'em_17_ruined_annex',
    name: 'The Ember — The Ruined Annex',
    zone: 'the_ember',
    act: 2,
    difficulty: 3,
    visited: false,
    flags: { noCombat: false },
    description: 'The annex was the cathedral\'s community hall — a flat-roofed addition built sometime in the 1960s, the architectural afterthought of a parish that outgrew its sanctuary. The fire took the roof completely: the steel joists are bare overhead, twisted into a lattice of black angles against the sky, and the interior walls are exposed brick scorched to a uniform dark charcoal that absorbs light rather than reflecting it. Folding tables are still stacked along the south wall, their metal legs fused together by the heat into a single sculpture of collapsed purpose. A kitchen pass-through window connects to a serving area where industrial pots hang from a ceiling rack that no longer has a ceiling. The tile floor is buckled in waves — the substrate failed beneath it — and in the low places between the waves, rainwater has collected and gone stagnant, breeding a green film that is the only color in the room. On the east wall, someone has spray-painted in large unsteady letters: WE STAYED TOO LONG. The paint is newer than the fire.',
    descriptionNight: 'The annex at night is a roofless room under whatever sky exists. The twisted joists frame stars or clouds. The stagnant puddles between floor tiles catch any ambient light and hold it as a faint sick green. The spray-painted text on the east wall is invisible in the dark. You know it is there.',
    shortDescription: 'A roofless parish hall — twisted joists, fused tables, stagnant water in the buckled floor, and a spray-painted message newer than the fire.',
    exits: {
      west: 'em_09_garden_of_ashes',
      north: 'em_11_char_fields',
    },
    richExits: {},
    items: [],
    enemies: [],
    npcs: [],
    hollowEncounter: {
      baseChance: 0.25,
      timeModifier: { day: 0.6, dusk: 1.3, night: 2.0, dawn: 0.8 },
      threatPool: [
        { type: 'shuffler', weight: 45, quantity: { min: 1, max: 3, distribution: 'bell' } },
        { type: 'remnant', weight: 35, quantity: { min: 1, max: 2, distribution: 'weighted_low' } },
        { type: 'whisperer', weight: 20, quantity: { min: 1, max: 1, distribution: 'single' } },
      ],
      awarenessRoll: { unaware: 0.3, awarePassive: 0.35, awareAggressive: 0.35 },
      activityPool: {
        shuffler: [
          { desc: 'moves between the fused tables in a circuit that approximates the path a person serving food would take, the muscle memory of hospitality reduced to geometry', weight: 3 },
        ],
        whisperer: [
          { desc: 'stands at the kitchen pass-through, speaking into the empty serving area in a voice that sounds like someone calling an order, the words almost but not quite intelligible', weight: 2 },
        ],
      },
    },
    extras: [
      {
        keywords: ['tables', 'fused', 'metal', 'stacked', 'sculpture'],
        description: 'The folding tables were aluminum-framed, the kind used in every church basement and community center in the country. The fire melted the joints where the frames touched and the stack became a single mass — thirty or forty tables bonded into a structure that is no longer furniture and has become something architectural. You can see individual table surfaces inside the mass, some still showing the fake wood-grain laminate, the plastic having survived in pockets where the heat was blocked by the layers above.',
      },
      {
        keywords: ['graffiti', 'paint', 'spray', 'message', 'stayed'],
        description: 'WE STAYED TOO LONG. The letters are about eighteen inches high, the spray can\'s pressure having been inconsistent — the W is bold and the G trails off into a thin line. The paint is red, or was red, now faded to a rust-brown that is difficult to distinguish from the scorched brick underneath. Someone came here after the fire. Someone stood in this room and looked at what had happened and put the one thought that survived intact onto the wall.',
        skillCheck: { skill: 'tracking', dc: 11, successAppend: 'The paint drip pattern and the height of the letters — this was written by someone standing, not crouching, someone between five-eight and five-eleven, right-handed, writing quickly. The can was nearly empty when they started. They didn\'t come here to write. They came here for another reason and the writing happened because the room required it.' },
      },
      {
        keywords: ['kitchen', 'serving', 'pots', 'pass-through', 'window'],
        description: 'The kitchen behind the pass-through window is small and institutional — a three-basin sink, a commercial range with the burner grates still in place, and the hanging pot rack overhead with six pots remaining, the copper bottoms oxidized to a dark verdigris. The pots survived because copper doesn\'t burn the way steel does. They hang in the open air now, the ceiling gone, and when the wind crosses the roofless annex they move slightly and ring against each other with a sound like a clock that has lost its mechanism.',
        skillCheck: { skill: 'scavenging', dc: 10, successAppend: 'Behind the range, a cabinet door hangs open. Inside: institutional-size containers of salt and baking soda, both sealed, both viable. In this economy, sealed cooking supplies have a value that the people who used this kitchen would have found absurd.' },
      },
      {
        keywords: ['water', 'puddles', 'green', 'stagnant', 'tile', 'floor'],
        description: 'The standing water in the floor depressions is shallow — an inch at the deepest — and the green film on the surface is algae, the ordinary kind that grows anywhere water sits long enough in light. But the color is wrong for ordinary algae. It has a blue-green component that you\'ve seen before, in the river, in the Deep Pool, in places where CHARON-7 has entered the water table. The contamination is in the groundwater here. The annex is drawing it up through the cracked foundation.',
        skillCheck: { skill: 'field_medicine', dc: 13, successAppend: 'The blue-green bioluminescence is faint but present — visible if you shade the puddle from direct light. CHARON-7 trace contamination. Not at infectious concentration, not dangerous to touch, but present. The groundwater under the Ember district carries the virus in dilute form. The fire didn\'t sterilize the soil. Nothing sterilizes CHARON-7.' },
      },
      {
        keywords: ['joists', 'roof', 'sky', 'twisted', 'lattice'],
        description: 'The steel joists overhead twisted when the roof membrane burned — the fire removed the load and the heat deformed the steel simultaneously, and the result is a pattern that has the quality of calligraphy, of strokes made by a hand that was not human. From below, looking up through the joist lattice at the sky, the effect is a frame that changes what it frames. The clouds move through the lattice and are divided into segments. Birds cross and are briefly caged. The building is no longer a building. It is a lens.',
      },
    ],
    npcSpawns: [
      {
        npcId: 'kindling_faithful',
        spawnChance: 0.30,
        spawnType: 'wanderer',
        activityPool: [
          { desc: 'A Kindling faithful stands at the east wall, reading the spray-painted message with the absorbed attention of someone who has read it before and has not finished processing it.', weight: 3 },
          { desc: 'A Kindling faithful collects rainwater from the floor depressions into a sealed container, working carefully, not touching the green-filmed surface water directly.', weight: 2 },
        ],
        dispositionRoll: { friendly: 0.2, neutral: 0.5, wary: 0.3, hostile: 0.0 },
        dialogueTree: 'em_annex_faithful',
      },
    ],
    itemSpawns: [
      {
        entityId: 'scrap_metal',
        spawnChance: 0.40,
        quantity: { min: 1, max: 2, distribution: 'weighted_low' },
        conditionRoll: { min: 0.2, max: 0.5 },
        groundDescription: 'Aluminum table frames at the edge of the fused mass — a few pieces still separable.',
        depletion: { cooldownMinutes: { min: 480, max: 960 }, respawnChance: 0.25 },
      },
      {
        entityId: 'boiled_rations',
        spawnChance: 0.25,
        quantity: { min: 1, max: 1, distribution: 'single' },
        conditionRoll: { min: 0.4, max: 0.8 },
        groundDescription: 'A sealed institutional-size container behind the kitchen range, overlooked by previous scavengers.',
        depletion: { cooldownMinutes: { min: 720, max: 1440 }, respawnChance: 0.10 },
      },
    ],
    environmentalRolls: {
      flavorLines: [
        { line: 'The hanging pots ring against each other in a gust — a sound like a bell with no conviction.', chance: 0.25 },
        { line: 'The green water in the floor ripples without visible cause. Subsurface movement, probably. Probably.', chance: 0.15 },
        { line: 'A bird crosses the lattice of twisted joists and for a moment its shadow moves across the scorched brick like handwriting.', chance: 0.20, time: ['day', 'dawn'] },
        { line: 'The smell shifts — the base note of char giving way to something organic, vegetal, the algae in the standing water metabolizing whatever the groundwater carries.', chance: 0.20 },
      ],
    },
    narrativeNotes: 'Transitional room connecting the sacred (Garden of Ashes) to the industrial (Char Fields). The CHARON-7 contamination in the groundwater is a quiet revelation. The spray-painted message is a human moment. The kitchen scavenging check rewards practical players.',
  },

  // ----------------------------------------------------------
  // EM-18: The Cooling Towers
  // ----------------------------------------------------------
  {
    id: 'em_18_cooling_towers',
    name: 'The Ember — The Cooling Towers',
    zone: 'the_ember',
    act: 2,
    difficulty: 4,
    visited: false,
    flags: { noCombat: false },
    description: 'Two hyperboloid cooling towers stand at the north edge of the industrial complex, their concrete shells intact in a way that nothing else in the district is intact. The fire didn\'t touch them because the fire couldn\'t — the towers are poured concrete and rebar, built for thermal endurance, and the heat that destroyed the factory and the neighborhood and the annex passed over these structures the way weather passes over geology. They stand sixty feet high and forty feet across at the base, open at the top, the interiors dark and resonant. The southern tower has a steel access door hanging from one hinge. Inside: the fill media — corrugated plastic sheets stacked in layers from floor to about thirty feet up — has partially collapsed, creating a terrain of angular ridges and hollows that the Hollow have colonized with the instinct of things that seek enclosed dark spaces. The northern tower is sealed. Its access door is welded shut from the outside, the bead visible even under the grime, and the weld is not factory — it was done by hand, by someone with a MIG welder and a reason. Whatever is inside the northern tower, someone decided it should stay inside.',
    descriptionNight: 'The towers at night are columns of deeper dark against the sky. The southern tower\'s interior produces sounds — the plastic fill media settling, or the Hollow moving through it, or both. The northern tower is silent. It has been silent since whoever welded it shut.',
    shortDescription: 'Two concrete cooling towers — one colonized by Hollow in its collapsed fill media, one welded shut by someone with a reason.',
    exits: {
      south: 'em_13_chemical_tank_farm',
    },
    richExits: {
      north: {
        destination: 'em_18_cooling_towers',
        hidden: true,
        locked: true,
        lockedBy: 'hand_tools_basic',
        discoverSkill: 'mechanics',
        discoverDc: 14,
        discoverMessage: 'The weld on the northern tower\'s door is hand-done — a single pass, no grinding. With the right tools you could cut through the bead at the hinge side where the heat-affected zone is weakest.',
        descriptionVerbose: 'the welded-shut door of the northern cooling tower',
      },
    },
    items: [],
    enemies: ['brute', 'shuffler'],
    npcs: [],
    hollowEncounter: {
      baseChance: 0.45,
      timeModifier: { day: 0.7, dusk: 1.4, night: 2.2, dawn: 0.9 },
      threatPool: [
        { type: 'shuffler', weight: 40, quantity: { min: 2, max: 4, distribution: 'bell' } },
        { type: 'brute', weight: 25, quantity: { min: 1, max: 1, distribution: 'single' } },
        { type: 'remnant', weight: 25, quantity: { min: 1, max: 2, distribution: 'weighted_low' } },
        { type: 'screamer', weight: 10, quantity: { min: 1, max: 1, distribution: 'single' } },
      ],
      awarenessRoll: { unaware: 0.15, awarePassive: 0.30, awareAggressive: 0.55 },
      activityPool: {
        shuffler: [
          { desc: 'emerges from the collapsed fill media in the southern tower like something born from the wreckage, plastic sheeting draped over its shoulders in a parody of clothing', weight: 3 },
        ],
        brute: [
          { desc: 'stands at the base of the southern tower\'s interior, head tilted back, staring up through sixty feet of dark concrete at the circle of sky above — waiting for something or remembering something or both', weight: 2 },
        ],
      },
      noiseModifier: 1.8,
    },
    extras: [
      {
        keywords: ['southern tower', 'open', 'fill', 'media', 'plastic', 'collapsed'],
        description: 'The fill media was designed to maximize surface area for heat exchange — hundreds of corrugated plastic sheets stacked in a lattice pattern from floor to the thirty-foot mark. The collapse was partial and uneven: some sections still stacked correctly, some folded like cards, some creating hollow pockets large enough for a person — or a Hollow — to shelter inside. The plastic is fire-resistant by specification but has degraded in the UV exposure from the open top. It crumbles at the edges when you touch it. The Hollow don\'t touch the edges. They move through the center where the structure is still sound.',
        skillCheck: { skill: 'stealth', dc: 13, successAppend: 'You can navigate the collapsed fill media without disturbing it — the trick is weight distribution across the corrugated ridges rather than stepping into the hollows. The Hollow in here are distributed in the pockets, three or four of them, and they don\'t move unless sound reaches them. You map their positions by breathing patterns. You can get through without waking them. Whether you should is a separate question.' },
      },
      {
        keywords: ['northern tower', 'sealed', 'welded', 'door', 'weld'],
        description: 'The weld bead on the northern tower\'s door is continuous — one pass, no stop-starts, laid down by someone who knew what they were doing and was doing it with urgency rather than craftsmanship. The bead is slightly convex, slightly irregular, the work of a MIG welder running hot. The door itself is heavy-gauge steel, the frame cast into the concrete shell. Whatever is inside this tower, the person who sealed it made the decision quickly and executed it competently and did not leave a note explaining why.',
        skillCheck: { skill: 'mechanics', dc: 14, successAppend: 'The heat-affected zone along the hinge side of the weld is where the bead is thinnest — the welder was running out of wire or running out of time. A cutting tool applied at the right angle could open a gap in under ten minutes. You mark the spot. You do not open it yet.' },
      },
      {
        keywords: ['concrete', 'shell', 'towers', 'structure', 'hyperbolic'],
        description: 'The hyperboloid geometry is beautiful in the way that engineering is beautiful when it solves a problem so completely that the solution becomes a shape. The towers narrow at the waist and flare at the top and bottom, the concrete poured in a continuous curve that has no flat surface anywhere. The acoustics inside the southern tower are extraordinary — sound reflects off the curved walls and arrives at the center from every direction simultaneously. A whisper at the base reaches the open top. The Hollow know this. They are very quiet inside the tower. They have learned that sound here is dangerous.',
      },
      {
        keywords: ['sound', 'resonance', 'echo', 'acoustics', 'interior'],
        description: 'You drop a small piece of fill media from waist height. The sound of it hitting the floor travels up the tower\'s interior in a spiral that takes three full seconds to dissipate. Every Hollow in the southern tower heard that. You know this because the silence after the echo is a different quality of silence than the silence before — it is the silence of things that are now listening. You do not drop anything else.',
        skillCheck: { skill: 'survival', dc: 12, successAppend: 'The acoustics work both ways. You stand at the tower\'s base and listen: the fill media settling, the wind across the open top producing a low bass note, and underneath it, from the northern sealed tower, something else. A rhythmic sound. Mechanical. Regular. Something inside the sealed tower is running. Has been running. The weld was not to keep something out.' },
      },
    ],
    npcSpawns: [],
    itemSpawns: [
      {
        entityId: 'electronics_salvage',
        spawnChance: 0.30,
        quantity: { min: 1, max: 1, distribution: 'single' },
        conditionRoll: { min: 0.3, max: 0.7 },
        groundDescription: 'A control panel at the base of the southern tower, its housing cracked open, the circuit boards inside still mounted.',
        depletion: { cooldownMinutes: { min: 720, max: 1440 }, respawnChance: 0.15 },
      },
      {
        entityId: 'chemicals_basic',
        spawnChance: 0.25,
        quantity: { min: 1, max: 1, distribution: 'single' },
        conditionRoll: { min: 0.2, max: 0.6 },
        groundDescription: 'A water treatment chemical drum at the tower\'s base — the biocide system\'s last charge, never depleted.',
        depletion: { cooldownMinutes: { min: 720, max: 1440 }, respawnChance: 0.10 },
      },
    ],
    environmentalRolls: {
      flavorLines: [
        { line: 'The wind crosses the open top of the southern tower and produces a bass note that you feel in your chest before you hear it.', chance: 0.25 },
        { line: 'A piece of fill media falls somewhere inside the tower. The echo takes three seconds. Nothing else moves.', chance: 0.20 },
        { line: 'The sealed northern tower is silent. You listen for the mechanical sound. It is there, barely, if you hold your breath.', chance: 0.15 },
        { line: 'The shadow of the towers moves across the concrete pad in a slow arc. You are standing in it. The temperature drops.', chance: 0.15, time: ['day'] },
        { line: 'Something inside the southern tower shifts — fill media compressing under a weight that was not there a moment ago.', chance: 0.20, time: ['dusk', 'night'] },
      ],
    },
    narrativeNotes: 'Act II high-difficulty room. The sealed northern tower is a mystery — something mechanical is running inside, and someone welded the door shut. This connects to the broader Ember industrial conspiracy. The southern tower is a dangerous Hollow nest with acoustic hazards. The stealth check rewards careful players.',
  },

  // ----------------------------------------------------------
  // EM-19: The Rail Yard
  // ----------------------------------------------------------
  {
    id: 'em_19_rail_yard',
    name: 'The Ember — The Rail Yard',
    zone: 'the_ember',
    act: 2,
    difficulty: 3,
    visited: false,
    flags: { scavengingZone: true },
    description: 'The rail spur from the loading dock opens into a small marshaling yard — three parallel tracks fanning out from the single approach line, the switches still in place, the ballast stone between the rails gray with ash. Two rail cars sit on the middle track: a boxcar with its sliding door open and a tanker car with government markings stenciled on its flank in the particular shade of olive drab that means military logistics. The boxcar is empty in the way that emptied things are empty — the floor shows the scuff marks and compression dents of heavy freight, and the walls have shipping labels still glued to the interior, the text too faded to read. The tanker car is not empty. You know this because the car sits lower on its springs than an empty tanker should, and because the access hatch on top is padlocked, and because someone has painted on the tanker\'s side in the same red spray paint you saw in the annex: DON\'T OPEN. The yard is exposed on three sides — the tracks run east into open ground where the ash fields meet scrub, and the wind crosses without interruption.',
    descriptionNight: 'The rail yard at night. The cars are silhouettes on the tracks, the tanker\'s bulk lower and heavier than the boxcar beside it. The government markings are invisible. The DON\'T OPEN is invisible. The wind is the same at night. The weight on the tanker\'s springs is the same at night.',
    shortDescription: 'A small marshaling yard — a boxcar emptied of its freight and a government tanker car that is not empty and says DON\'T OPEN.',
    exits: {
      west: 'em_16_loading_dock',
    },
    richExits: {},
    items: [],
    enemies: [],
    npcs: [],
    hollowEncounter: {
      baseChance: 0.18,
      timeModifier: { day: 0.5, dusk: 1.2, night: 1.8, dawn: 0.7 },
      threatPool: [
        { type: 'shuffler', weight: 50, quantity: { min: 1, max: 2, distribution: 'weighted_low' } },
        { type: 'remnant', weight: 35, quantity: { min: 1, max: 1, distribution: 'single' } },
        { type: 'screamer', weight: 15, quantity: { min: 1, max: 1, distribution: 'single' } },
      ],
      awarenessRoll: { unaware: 0.35, awarePassive: 0.35, awareAggressive: 0.30 },
      activityPool: {
        shuffler: [
          { desc: 'walks the track ballast in a slow patrol, feet finding the rail ties with the regularity of someone who once walked this route as part of a job', weight: 3 },
        ],
        remnant: [
          { desc: 'stands in the open boxcar door, framed by the rectangle of the opening, staring out at the yard with an attention that has no object', weight: 2 },
        ],
      },
    },
    extras: [
      {
        keywords: ['tanker', 'government', 'military', 'olive', 'markings'],
        description: 'The stenciled markings on the tanker: a unit designation you don\'t recognize, a contract number that matches the format from the foreman\'s production schedule, and the words HAZMAT — CLASS 3 — FLAMMABLE LIQUID. The tanker was here before the fire. It was loaded before the fire. It did not leave before the fire, which means either it couldn\'t leave or it wasn\'t supposed to leave or someone made a decision about it that they executed with a padlock and a spray-painted warning rather than with the logistics chain that brought it here.',
        skillCheck: { skill: 'lore', dc: 13, successAppend: 'The contract number on the tanker matches the government contract line from the foreman\'s production schedule — the one that was still running at full capacity when every other line had shut down. This tanker was carrying the output of that contract. The output was a Class 3 flammable liquid produced under government contract in the months before the Collapse. The tanker is still full. The fire started in the tank farm. The tanker is still here.' },
        questFlagOnSuccess: { flag: 'em_rail_tanker_investigated', value: true },
      },
      {
        keywords: ['boxcar', 'empty', 'labels', 'freight', 'scuff'],
        description: 'The boxcar interior: shipping labels on the walls, the adhesive stronger than the paper, leaving fragments with partial words. You read what you can: MERIDIAN SUPPLY — LOT, and BIOHAZARD PACKING — SPEC, and a partial address that includes a state abbreviation you recognize as the state you\'re in. The boxcar was a supply run to MERIDIAN. The freight it carried went somewhere — into the factory, into the tank farm, into the production line that was still running when the world ended. The boxcar was emptied and left on the siding and never collected because the collection was never going to happen.',
        skillCheck: { skill: 'scavenging', dc: 11, successAppend: 'Under the boxcar floor, a maintenance compartment — standard on freight cars, usually empty. This one contains a canvas tool roll with railroad maintenance equipment: spike hammer, rail tongs, a track gauge, and a sealed tin of track lubricant. Specialized tools, worth something to the right buyer. The spike hammer alone is a formidable weapon.' },
      },
      {
        keywords: ['paint', 'spray', 'don\'t open', 'red', 'warning'],
        description: 'DON\'T OPEN. The same hand as the annex — the same can, perhaps, the same pressure inconsistency, the same rust-brown that was once red. The person who wrote WE STAYED TOO LONG also wrote DON\'T OPEN. They came to the annex and the rail yard and left messages in both places. They knew what was in the tanker. They knew what had been in the boxcar. They understood the connection between the factory and MERIDIAN and the fire, and their response was not to document it or report it but to write warnings on the things that could still hurt someone. Practical. Desperate. The handwriting of someone running out of paint and time.',
        skillCheck: { skill: 'tracking', dc: 12, successAppend: 'The paint drips on the tanker are directional — the writer moved from the annex to the rail yard, west to east. The footprints in the ash around the tanker are the same size and gait as the tracks near the annex wall. One person. One route. They wrote both messages in a single trip and then left in a direction the ash has since erased.' },
      },
      {
        keywords: ['tracks', 'switches', 'rails', 'ballast', 'yard'],
        description: 'The three-track fan is standard light-industrial marshaling — enough capacity for short consists, a few cars at a time, the kind of yard that services a single factory rather than a network. The switch mechanisms are manual — lever-operated, the levers still in position, the middle track selected. Whoever set the switches last set them for the track the tanker and boxcar sit on. The other two tracks are empty, the rails rusting uniformly, undisturbed since the fire. Only the middle track was in use at the end.',
      },
    ],
    npcSpawns: [
      {
        npcId: 'scavenger_rival',
        spawnChance: 0.20,
        spawnType: 'wanderer',
        activityPool: [
          { desc: 'A scavenger circles the tanker car at a careful distance, studying the markings, not touching anything, the body language of someone who has read the DON\'T OPEN and is deciding whether to believe it.', weight: 3 },
          { desc: 'A scavenger sits on the boxcar floor with their legs dangling from the open door, eating something from a tin, watching the yard with the proprietary alertness of someone who considers this their find.', weight: 2 },
        ],
        dispositionRoll: { friendly: 0.10, neutral: 0.35, wary: 0.45, hostile: 0.10 },
        dialogueTree: 'em_scavenger_rail_yard',
      },
    ],
    itemSpawns: [
      {
        entityId: 'scrap_metal',
        spawnChance: 0.50,
        quantity: { min: 1, max: 2, distribution: 'weighted_low' },
        conditionRoll: { min: 0.3, max: 0.7 },
        groundDescription: 'Rail hardware — tie plates and spikes scattered in the ballast where the track joints have failed.',
        depletion: { cooldownMinutes: { min: 480, max: 960 }, respawnChance: 0.30 },
      },
      {
        entityId: 'hand_tools_basic',
        spawnChance: 0.30,
        quantity: { min: 1, max: 1, distribution: 'single' },
        conditionRoll: { min: 0.4, max: 0.8 },
        groundDescription: 'A railroad maintenance tool roll in the boxcar\'s underfloor compartment.',
        depletion: { cooldownMinutes: { min: 720, max: 1440 }, respawnChance: 0.10 },
      },
    ],
    environmentalRolls: {
      flavorLines: [
        { line: 'The tanker car settles on its springs with a low metallic groan. The weight inside shifts. Liquid.', chance: 0.25 },
        { line: 'Wind crosses the open yard and the boxcar door rattles on its track — a hollow industrial sound that carries.', chance: 0.20 },
        { line: 'The ash between the rails drifts in the wind, exposing the ballast stone underneath. Gray on gray.', chance: 0.15 },
        { line: 'A rail tie creaks underfoot — the wood preserved by creosote, the creosote preserved by chemistry, both outlasting the world that made them.', chance: 0.15 },
        { line: 'The DON\'T OPEN catches your eye again. You weren\'t looking at it. You were looking at it.', chance: 0.20 },
      ],
    },
    narrativeNotes: 'Act II investigation room. The tanker connects to the foreman\'s government contract, the MERIDIAN supply chain, and the Ember fire conspiracy. The spray-paint writer links to the annex\'s WE STAYED TOO LONG. Quest flag feeds into the broader mystery. Exposed position makes it feel vulnerable.',
  },

  // ----------------------------------------------------------
  // EM-20: The Incinerator
  // ----------------------------------------------------------
  {
    id: 'em_20_the_incinerator',
    name: 'The Ember — The Incinerator',
    zone: 'the_ember',
    act: 2,
    difficulty: 4,
    visited: false,
    flags: { noCombat: false },
    description: 'The incinerator building is set apart from the main factory — a squat concrete structure with a single tall chimney stack, the stack rising forty feet and still blackened at the top from its last use, whenever that was. The building\'s purpose is legible in its architecture: the reinforced walls, the ventilation louvers along the roofline, the heavy-gauge steel door with its panic bar and its radiation trefoil warning sign — not the biohazard symbol, the radiation symbol, which is a different conversation. Inside: the burn chamber dominates the space, a refractory-lined steel cylinder large enough to stand in, its loading door open, the interior scaled with vitrified ash that has the glassy quality of material burned at temperatures that exceed what industrial waste requires. A control panel on the west wall has gauges for temperature, airflow, and a third parameter labeled only SPEC COMPLIANCE, the needle frozen in the red zone. The floor around the burn chamber is clean — not fire-clean but swept-clean, recently, the broom marks still visible in the thin dust. Someone has been here. Someone is maintaining this space.',
    descriptionNight: 'The incinerator at night. The chimney stack is a column of black against stars. Inside, the burn chamber\'s open loading door is a circle of deeper dark. The control panel gauges are unlit. The swept floor is the same at night. The broom marks don\'t care about the hour.',
    shortDescription: 'A concrete incinerator building with a radiation warning sign, a burn chamber lined with vitrified ash, and a floor that someone has been sweeping.',
    exits: {
      north: 'em_16_loading_dock',
    },
    richExits: {},
    items: [],
    enemies: [],
    npcs: [],
    hollowEncounter: {
      baseChance: 0.20,
      timeModifier: { day: 0.5, dusk: 1.0, night: 2.0, dawn: 0.7 },
      threatPool: [
        { type: 'remnant', weight: 50, quantity: { min: 1, max: 2, distribution: 'weighted_low' } },
        { type: 'whisperer', weight: 30, quantity: { min: 1, max: 1, distribution: 'single' } },
        { type: 'shuffler', weight: 20, quantity: { min: 1, max: 2, distribution: 'weighted_low' } },
      ],
      awarenessRoll: { unaware: 0.25, awarePassive: 0.40, awareAggressive: 0.35 },
      activityPool: {
        remnant: [
          { desc: 'stands at the control panel with one hand on the SPEC COMPLIANCE gauge, turning it back and forth in a gesture that has the quality of a remembered task performed by something that no longer understands tasks', weight: 3 },
        ],
        whisperer: [
          { desc: 'sits inside the burn chamber with its back against the refractory wall, speaking softly in a voice that echoes off the vitrified interior and comes back as something that sounds like a name you almost recognize', weight: 2 },
        ],
      },
    },
    extras: [
      {
        keywords: ['radiation', 'trefoil', 'sign', 'warning', 'symbol'],
        description: 'The radiation trefoil is standard signage — magenta on yellow, the international standard. It is not the biohazard symbol. Biohazard means biological agents. Radiation means ionizing energy or radioactive material. An industrial waste incinerator does not require radiation signage. A medical waste incinerator does not require radiation signage. The list of things that require radiation signage on an incinerator is short and none of the entries are comforting.',
        skillCheck: { skill: 'lore', dc: 14, successAppend: 'The signage is post-installation — affixed with mechanical fasteners over the original hazard placard, which was the standard industrial waste diamond. Someone changed the classification of what this incinerator was burning. The new classification required radiation protocols. CHARON-7 is not radioactive. But the treatment compounds developed to combat it — the experimental ones, the ones that didn\'t work, the ones that the government contract was producing — some of those involved isotope-tagged markers. The incinerator was burning failed treatments. It was burning the evidence of how many times they got it wrong.' },
        questFlagOnSuccess: { flag: 'em_incinerator_radiation_investigated', value: true },
        reputationGrant: { faction: 'kindling', delta: 1 },
      },
      {
        keywords: ['burn chamber', 'refractory', 'vitrified', 'ash', 'cylinder'],
        description: 'The vitrified ash inside the burn chamber has a glassy surface that catches light and throws it in unexpected directions. Vitrification requires temperatures above 1,200 degrees Celsius — far beyond standard industrial waste disposal. Whatever was burned here was burned at temperatures designed to destroy it completely, molecularly, to reduce it past ash to glass. The chamber interior is coated in this glass-ash from floor to the loading door rim. It is beautiful in the way that destruction at sufficient thoroughness becomes beautiful. You don\'t touch it.',
        skillCheck: { skill: 'field_medicine', dc: 15, successAppend: 'You hold a piece of vitrified ash to the light. Embedded in the glass matrix: fragments that are not mineral. Organic inclusions — bone fragments, specifically, calcined and vitrified but identifiable by structure. This incinerator burned biological material at temperatures that turned bone to glass. The radiation sign. The SPEC COMPLIANCE gauge. The vitrified bone. You are standing in the place where the failed treatments and their recipients were disposed of. The Purification dead whose names are in the Garden of Ashes — this is where the bodies went.' },
        questFlagOnSuccess: { flag: 'em_incinerator_bone_found', value: true },
      },
      {
        keywords: ['control panel', 'gauges', 'spec compliance', 'temperature'],
        description: 'The control panel is industrial — heavy-gauge steel housing, analog gauges, physical switches. Temperature gauge: frozen at 1,340 degrees Celsius, which is above vitrification threshold. Airflow: frozen at a reading you cannot interpret without the engineering spec. SPEC COMPLIANCE: the needle is in the red zone, past a line labeled THRESHOLD. The implication is that whatever specification the incinerator was supposed to comply with, it was not complying at the time of its last recorded operation. It was running too hot, or too long, or burning something it was not rated for.',
        skillCheck: { skill: 'electronics', dc: 12, successAppend: 'The control panel has a data logger — a simple mechanical recorder with a paper drum, the kind used in industrial applications before digital. The drum still has paper on it. The trace shows the last operational cycle: temperature ramping over ninety minutes to 1,340 degrees, holding for four hours, then a sudden drop to ambient. The four-hour hold is ten times longer than any standard waste cycle. Whatever was being burned required four hours at vitrification temperature to satisfy whoever was watching the gauges.' },
      },
      {
        keywords: ['swept', 'floor', 'clean', 'broom', 'maintained'],
        description: 'The broom marks are real. The floor has been swept — not perfectly, but deliberately, the marks of a push broom moving in long strokes from the burn chamber toward the door. The dust that was swept is gone, carried out or dispersed. The sweeping happened within the last week, based on the dust accumulation since. Someone comes here. Someone tends this space the way the Kindling tends the coal pit and the Garden of Ashes — with regularity and purpose. The incinerator has a caretaker who has not been introduced to you and who has decided that this building, of all buildings, deserves maintenance.',
        skillCheck: { skill: 'tracking', dc: 13, successAppend: 'The broom marks overlap in a pattern that reveals the sweeper\'s path: they start at the burn chamber, move outward in expanding arcs, and exit through the main door. The footprints beneath the broom marks — partially erased but readable — are a size and gait consistent with the spray-paint writer from the annex and the rail yard. The same person who wrote WE STAYED TOO LONG and DON\'T OPEN is the person who sweeps the incinerator floor. They are still here. They are still tending the evidence of what happened.' },
        questFlagOnSuccess: { flag: 'em_incinerator_sweeper_tracked', value: true },
        reputationGrant: { faction: 'kindling', delta: 1 },
      },
      {
        keywords: ['chimney', 'stack', 'tall', 'blackened'],
        description: 'The chimney stack is the tallest structure in the Ember district — visible from the char fields, from the factory floor, from the approach road. It was designed to disperse combustion products at altitude, diluting them into the upper air column where they would dissipate rather than settle. The blackening at the top extends down about six feet from the rim. The soot composition, if you could analyze it, would tell you exactly what was burned and when. Standing at the base, looking up the interior, you see the sky as a perfect circle sixty feet above, framed by soot-black concrete. The effect is like looking up through a well. A well that goes up instead of down.',
      },
    ],
    npcSpawns: [
      {
        npcId: 'kindling_torch_tender',
        spawnChance: 0.15,
        spawnType: 'patrol',
        activityPool: [
          { desc: 'A Kindling torch tender stands at the incinerator door, looking in but not entering, their expression unreadable — the face of someone at a threshold they have decided not to cross today.', weight: 3 },
        ],
        dispositionRoll: { friendly: 0.1, neutral: 0.4, wary: 0.4, hostile: 0.1 },
        dialogueTree: 'em_incinerator_faithful',
      },
    ],
    itemSpawns: [
      {
        entityId: 'chemicals_basic',
        spawnChance: 0.30,
        quantity: { min: 1, max: 1, distribution: 'single' },
        conditionRoll: { min: 0.3, max: 0.7 },
        groundDescription: 'A container of accelerant compound on a shelf near the control panel — the incinerator\'s fuel additive, still sealed.',
        depletion: { cooldownMinutes: { min: 720, max: 1440 }, respawnChance: 0.10 },
      },
      {
        entityId: 'electronics_salvage',
        spawnChance: 0.20,
        quantity: { min: 1, max: 1, distribution: 'single' },
        conditionRoll: { min: 0.2, max: 0.5 },
        groundDescription: 'The data logger\'s paper drum mechanism — the recorder itself is salvageable electronics.',
        depletion: { cooldownMinutes: { min: 720, max: 1440 }, respawnChance: 0.05 },
      },
    ],
    environmentalRolls: {
      flavorLines: [
        { line: 'The burn chamber ticks as metal contracts in the temperature differential between inside and outside. The sound is regular. Almost rhythmic.', chance: 0.20 },
        { line: 'A draft through the chimney stack pulls air across the loading door and the sound it makes is a low moan that lasts exactly as long as the gust.', chance: 0.25 },
        { line: 'The vitrified ash catches a shift in light and for a moment the interior of the burn chamber glitters like something precious.', chance: 0.15, time: ['dawn', 'day'] },
        { line: 'The swept floor. The broom marks. Someone was here. Someone will be here again.', chance: 0.20 },
        { line: 'The radiation trefoil on the door. You look at it every time you pass it. It does not change. Your understanding of it does.', chance: 0.15 },
      ],
    },
    personalLossEchoes: {
      child: 'The vitrified bone in the burn chamber. Someone\'s child was burned here. The Garden of Ashes has their name. The incinerator has what remains of what remained.',
      community: 'The SPEC COMPLIANCE gauge in the red. The four-hour burn cycle. This was systematic — not one body, not one failure, but a process. A community of the failed, reduced to glass.',
    },
    narrativeNotes: 'Act II climax investigation room. The incinerator connects the Purification dead, the government contract, and the MERIDIAN supply chain. The bone fragments in the vitrified ash are the darkest revelation in the zone. The mystery sweeper ties to the spray-paint writer from em_17 and em_19. Quest flags feed into the Ember fire conspiracy. High narrative weight, high difficulty.',
  },
]
