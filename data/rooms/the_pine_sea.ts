import type { Room } from '@/types/game'

export const THE_PINE_SEA_ROOMS: Room[] = [
  {
    id: 'ps_01_tree_line',
    name: 'The Tree Line',
    zone: 'the_pine_sea',
    act: 2,
    difficulty: 2,
    visited: false,
    flags: { fastTravelWaypoint: true },
    cycleGate: 2,
    description: 'The forest begins at a line so distinct it reads as a decision: open ground ends, and ten thousand pines begin, packed close enough that their canopy closes twenty yards in. The air changes immediately — cooler, resinous, the specific quality of a high-altitude forest that has been doing this without interruption since before people had fire. The highway drops away behind you. The noise of the known world drops away behind you. Inside the tree line: quiet. Not the quiet of the Dust, which is absence. This is the quiet of something paying attention.',
    descriptionNight: 'At night the forest is absolute dark between absolute stars. The tree line is a wall of black against a sky that is completely alive with light. Entering here at night means trusting your feet, your ears, your hands on bark. The pines don\'t stop being beautiful at night. They stop being visible.',
    shortDescription: 'The forest begins here. Dense, alpine, alive.',
    exits: { south: 'br_01_canyon_mouth', north: 'ps_02_elk_meadow', east: 'ps_03_loggers_cabin' },
    richExits: {
      south: {
        destination: 'br_01_canyon_mouth',
        descriptionVerbose: 'south, back toward the Breaks and the lowlands',
      },
      north: { destination: 'ps_02_elk_meadow', descriptionVerbose: 'north, deeper into the pines' },
      east: { destination: 'ps_03_loggers_cabin', descriptionVerbose: 'east along the treeline toward the cabin' },
    },
    items: [],
    enemies: [],
    npcs: [],
    extras: [
      {
        keywords: ['trees', 'pines', 'forest', 'canopy'],
        description: 'Engelmann spruce and lodgepole pine, mostly — the high-altitude mix of the San Juan Mountains. Some of these trees were here before the Collapse, before the state roads, before the first European survey. The canopy closes above your head and you understand, with the understanding that lives in the body rather than the mind, that you have entered something much older than yourself.',
      },
      {
        keywords: ['air', 'smell', 'resin', 'pine'],
        description: 'The air is the cleanest you\'ve breathed since the Collapse. Elevation, distance from population centers, seven years of no combustion engines. You breathe it consciously for a moment, the way you might drink clean water: specifically, gratefully, noting that this is what it should taste like.',
      },
      {
        keywords: ['quiet', 'silence', 'sound'],
        description: 'Not silent — a pine forest is never silent. Wind in high branches. A bird you can\'t name, calling from somewhere in the canopy. The crack of a branch settling in the temperature drop as you gain altitude. What\'s absent is human noise: engines, voices, the background static of infrastructure. The world sounds like it did before, in the parts of the world that felt like this.',
      },
    ],
    hollowEncounter: {
      baseChance: 0.08,
      timeModifier: { day: 0.5, night: 1.5, dawn: 0.8, dusk: 1.2 },
      threatPool: [
        { type: 'shuffler', weight: 70, quantity: { min: 1, max: 2, distribution: 'weighted_low' } },
        { type: 'remnant', weight: 30, quantity: { min: 1, max: 1, distribution: 'single' } },
      ],
      awarenessRoll: { unaware: 0.6, awarePassive: 0.3, awareAggressive: 0.1 },
    },
    environmentalRolls: {
      ambientSoundPool: {
        day: [
          { sound: 'A Clark\'s nutcracker works a pine cone somewhere above you.', weight: 3 },
          { sound: 'Wind moves through the high branches with a sound like the ocean.', weight: 3 },
          { sound: null, weight: 2 },
        ],
        night: [
          { sound: 'An owl locates something in the dark and moves. You don\'t hear it land.', weight: 2 },
          { sound: null, weight: 3 },
        ],
      },
      ambientCount: { min: 1, max: 2, distribution: 'flat' },
    },
    narrativeNotes: 'Knowledge-gated entry (Cycle 2+). The Pine Sea is a tonal break from the danger zones — the transition from noise to quality silence is the first impression. Low Hollow encounter because Sanguine patrol this approach.',
  },

  {
    id: 'ps_02_elk_meadow',
    name: 'The Elk Meadow',
    zone: 'the_pine_sea',
    act: 2,
    difficulty: 2,
    visited: false,
    flags: { campfireAllowed: true, scavengingZone: false },
    description: 'The forest opens into a high alpine meadow — grass that grows in the short window between snowmelt and first freeze, wildflowers in the patches where water collects. The elk herd is here: twenty, maybe thirty animals, moving through the meadow with the unhurried weight of creatures that have not had to fear humans for seven years. The bulls carry antlers in velvet. A calf stays close to its mother. There is nothing wrong with this scene. Nothing at all. You had forgotten that was possible.',
    descriptionNight: 'At night the elk are dark shapes in the pale meadow, breathing steam in the cold. They watch you but don\'t flee. You\'re not a threat right now. That\'s trust you haven\'t earned — it\'s the trust of animals who\'ve had seven years without guns. It feels like something fragile.',
    shortDescription: 'Open alpine meadow. Elk herd. Everything is fine here.',
    exits: { south: 'ps_01_tree_line', north: 'ps_05_ridge_trail', west: 'ps_04_waterfall' },
    richExits: {
      south: { destination: 'ps_01_tree_line', descriptionVerbose: 'south back into the forest' },
      north: { destination: 'ps_05_ridge_trail', descriptionVerbose: 'north toward the ridge trail' },
      west: { destination: 'ps_04_waterfall', descriptionVerbose: 'west, the sound of falling water' },
    },
    items: [],
    enemies: [],
    npcs: [],
    extras: [
      {
        keywords: ['elk', 'herd', 'animals', 'deer'],
        description: 'The herd bull stands at the meadow edge, watching you with the specific unblinking attention of a very large animal that has decided not to run. He\'s been watching you since you entered the tree line. Seven years without hunting pressure has rebuilt something in the elk population that the Collapse destroyed in most other wildlife. They\'ve learned, in real time, to not be afraid.',
        skillCheck: { skill: 'survival', dc: 8, successAppend: 'The herd is healthy and growing — you can tell from the calf-to-adult ratio and the body condition of the adults. The meadow can support significantly more animals than it\'s currently carrying. This location has been a reliable hunting ground for two years at least, for anyone who knew it was here and had the patience to wait.' },
      },
      {
        keywords: ['calf', 'young', 'mother'],
        description: 'The calf is new — spring-born, maybe three months old, still carrying its spotted camouflage. It sticks close to its mother\'s flank. When the wind shifts and carries your scent toward the herd, the calf presses harder against her. The mother stands her ground, watching you. She has decided you\'re manageable.',
      },
      {
        keywords: ['flowers', 'wildflowers', 'grass', 'meadow'],
        description: 'The alpine meadow has columbine — Colorado\'s state flower, still present in the range that selected it as a symbol before the state existed as a concept. Blue and violet, grown in clusters around the spring seeps. Around them: yarrow, paintbrush, gentian. The species composition is what it was before the Collapse. Some things don\'t notice.',
      },
    ],
    hollowEncounter: {
      baseChance: 0.05,
      timeModifier: { day: 0.3, night: 1.2, dawn: 0.5, dusk: 0.8 },
      threatPool: [
        { type: 'shuffler', weight: 80, quantity: { min: 1, max: 1, distribution: 'single' } },
        { type: 'remnant', weight: 20, quantity: { min: 1, max: 1, distribution: 'single' } },
      ],
      awarenessRoll: { unaware: 0.7, awarePassive: 0.2, awareAggressive: 0.1 },
    },
    environmentalRolls: {
      ambientSoundPool: {
        day: [
          { sound: 'The elk herd grazes, the sound of torn grass and steady movement.', weight: 4 },
          { sound: 'A single elk moves through the meadow edge, unseen, the grass parting.', weight: 2 },
          { sound: null, weight: 1 },
        ],
      },
      ambientCount: { min: 1, max: 2, distribution: 'flat' },
      flavorLines: [
        { line: 'The bull elk raises his head and looks directly at you for three seconds, then returns to grazing.', chance: 0.30, time: null },
        { line: 'Steam rises from the ground where a spring seep meets cold air.', chance: 0.20, time: ['dawn'] },
      ],
    },
    narrativeNotes: 'Beauty room and emotional respite. The elk herd is a signal that the world still contains things worth protecting. The hunting mechanic is available here for food.',
  },

  {
    id: 'ps_03_loggers_cabin',
    name: 'The Logger\'s Cabin',
    zone: 'the_pine_sea',
    act: 2,
    difficulty: 2,
    visited: false,
    flags: { safeRest: true, healingBonus: 1.3, campfireAllowed: true },
    description: 'A timber cabin set back from a logging road that last saw a truck in 2030. The cabin is built to last — squared logs, tight chinking, metal roof that has weathered well. The door is unlocked, the interior dry and functional: a potbelly stove, a cot frame with a folded canvas mattress, supply shelves stocked by previous occupants with the informal reciprocity of the backcountry tradition. You take what you need. You leave what you can. The log book on the shelf has thirty-eight entries from thirty-eight different visitors over seven years. You are thirty-nine.',
    descriptionNight: 'At night the cabin holds heat and the dark outside is complete. The stove crackles if you\'ve lit it. Outside: wind in pines, the faraway sound of the meadow. Inside: warmth, quiet, the log book waiting on the shelf with its thirty-eight signatures.',
    shortDescription: 'Backcountry cabin. Safe rest. Stash location.',
    exits: { west: 'ps_01_tree_line' },
    richExits: {
      west: { destination: 'ps_01_tree_line', descriptionVerbose: 'west back to the tree line' },
    },
    items: ['lore_cabin_logbook'],
    enemies: [],
    npcs: [],
    extras: [
      {
        keywords: ['log book', 'logbook', 'entries', 'visitors'],
        description: 'Thirty-eight entries. Names, dates, where they came from, where they\'re going. One recurring visitor: someone who calls themselves SHEPHERD who has been through this cabin eleven times over four years, always heading north, always heading to or from "the overlook." SHEPHERD\'s last entry: "Third time to the facility this cycle. The signal has changed. The broadcaster knows I\'m listening. Be careful who you tell."',
        skillCheck: { skill: 'lore', dc: 9, successAppend: 'SHEPHERD\'s handwriting matches Lev\'s handwriting. The word "cycle" is used in the Reclaimer sense — Revenant death cycles. Lev has been making regular trips to MERIDIAN. Eleven times. And something has changed.' },
      },
      {
        keywords: ['supply', 'shelf', 'stocked', 'stores'],
        description: 'The shelves hold what previous visitors left: half a box of emergency candles, a first aid kit with some contents used and some replenished by different hands, ammunition of various calibers, a coil of paracord, two empty water bottles that have been cleaned. The system works because everyone who uses it adds something. You note what\'s missing and start thinking about what you can leave.',
      },
      {
        keywords: ['stove', 'potbelly', 'fire', 'heat'],
        description: 'The potbelly stove is cast iron, early twentieth century, designed when cast iron was built to outlast everyone who would ever own it. The chimney draws clean. A small woodpile is stacked against the exterior wall. There\'s kindling ready in the firebox, laid by the last occupant for the next one. Small deliberate kindness at altitude.',
      },
      {
        keywords: ['cot', 'mattress', 'bed', 'sleep'],
        description: 'The canvas mattress is filled with something — dried grass or pine needles, lumpy in the good way. The cot frame is solid. This is a real bed, in a real room, with four walls and a door that latches. At this elevation, with this view, in this world, that is extraordinary.',
      },
    ],
    itemSpawns: [
      {
        entityId: 'emergency_rations',
        spawnChance: 0.55,
        quantity: { min: 1, max: 3, distribution: 'bell' },
        conditionRoll: { min: 0.5, max: 0.90 },
        groundDescription: 'Previous visitors have left supplies on the cabin shelves.',
        depletion: { cooldownMinutes: { min: 60, max: 120 }, respawnChance: 0.40 },
      },
    ],
    hollowEncounter: {
      baseChance: 0.05,
      timeModifier: { day: 0.3, night: 0.8, dawn: 0.5, dusk: 0.6 },
      threatPool: [
        { type: 'shuffler', weight: 90, quantity: { min: 1, max: 1, distribution: 'single' } },
        { type: 'remnant', weight: 10, quantity: { min: 1, max: 1, distribution: 'single' } },
      ],
      awarenessRoll: { unaware: 0.7, awarePassive: 0.2, awareAggressive: 0.1 },
    },
    narrativeNotes: 'Safe rest and stash location. The logbook with SHEPHERD\'s entries (Lev\'s trips to MERIDIAN) is a significant lore reveal. The informal supply sharing system is world-building for how communities survive.',
  },

  {
    id: 'ps_04_waterfall',
    name: 'The Waterfall',
    zone: 'the_pine_sea',
    act: 2,
    difficulty: 2,
    visited: false,
    flags: { waterSource: true, campfireAllowed: true },
    description: 'Mountain snowmelt falls thirty feet into a small pool that feeds the meadow stream. The sound is constant and clean — real water sound, not the tepid trickle of lowland seeps. The pool is cold enough to make your teeth ache. The basin is mossy granite, the water tea-colored from pine tannins but clear and safe — filtration optional, drinking mandatory if you\'re here. Behind the fall, a gap in the rock: a cave, five feet wide, eight feet deep, dry except for the spray at the entrance. Someone has used it as a cache.',
    descriptionNight: 'The waterfall at night is sound more than sight. The pool reflects the stars. The cave behind the fall is invisible from the front in this light — a gap that isn\'t there until you know to look.',
    shortDescription: 'Waterfall. Clean water. Hidden cave behind it.',
    exits: { east: 'ps_02_elk_meadow', north: 'ps_06_shepherds_camp' },
    richExits: {
      east: { destination: 'ps_02_elk_meadow', descriptionVerbose: 'east to the elk meadow' },
      north: { destination: 'ps_06_shepherds_camp', descriptionVerbose: 'north along the creek toward the shepherd\'s camp' },
    },
    items: [],
    enemies: [],
    npcs: [],
    extras: [
      {
        keywords: ['cave', 'behind', 'fall', 'hidden', 'gap'],
        description: 'The cave behind the waterfall is exactly as useful as it looks: dry, defensible from one direction, the spray covering the entrance noise. Someone used it: a supply cache wrapped in oilcloth is wedged into the back. Inside the wrap: two full water bottles, a map of the ridge trail in fair condition, a small notebook of plant identifications for the region, and a note: "If you found this, you needed it. Leave what you can."',
        skillCheck: { skill: 'perception', dc: 10, successAppend: 'The cache was restocked recently — one of the water bottles has a fill date penciled on the label from three weeks ago. Someone makes regular maintenance stops here. The notebook plant identifications are in the same handwriting as the SHEPHERD entries in the cabin logbook.' },
      },
      {
        keywords: ['water', 'pool', 'cold', 'drink'],
        description: 'The water is cold enough to hurt, which in the post-Collapse world is the primary quality indicator for mountain surface water. You drink directly from the fall and the shock of it is almost violent. This is what good water tastes like. You drink more than you need to.',
      },
      {
        keywords: ['moss', 'granite', 'rock', 'basin'],
        description: 'The granite basin is old — polished by ten thousand years of the same water running the same path. The mosses are precise and various, each species holding its position in the spray gradient. Six inches from the fall: saturated species. Twelve inches: transitional. Two feet: dry-edge species. The categories are clear and orderly and nobody declared them; they happened.',
      },
    ],
    hollowEncounter: {
      baseChance: 0.06,
      timeModifier: { day: 0.4, night: 1.3, dawn: 0.6, dusk: 0.9 },
      threatPool: [
        { type: 'shuffler', weight: 80, quantity: { min: 1, max: 1, distribution: 'single' } },
        { type: 'remnant', weight: 20, quantity: { min: 1, max: 1, distribution: 'single' } },
      ],
      awarenessRoll: { unaware: 0.65, awarePassive: 0.25, awareAggressive: 0.1 },
    },
    environmentalRolls: {
      flavorLines: [
        { line: 'The spray from the fall is cold on your face. You had forgotten what that feels like.', chance: 0.35, time: null },
        { line: 'Something small moves in the pool — a cutthroat trout, fat and unhurried.', chance: 0.25, time: ['day'] },
      ],
    },
    narrativeNotes: 'Water source. Hidden cache with map and the SHEPHERD connection. The plant identification notebook (same handwriting as logbook) is a connecting detail for observant players.',
  },

  {
    id: 'ps_05_ridge_trail',
    name: 'The Ridge Trail',
    zone: 'the_pine_sea',
    act: 2,
    difficulty: 3,
    visited: false,
    flags: { scavengingZone: false },
    description: 'The trail gains altitude quickly, switchbacking through the tree line to reach a ridge exposed to the full sky and the full wind. It\'s cold here, and the wind means cold in a way that wind at lower elevations doesn\'t. The view from the ridge is the best you\'ve had since the water tower — and what it shows you is the Scar valley. Not a shimmer on a horizon. The actual valley. A crater edge visible from here, the chemical haze above it faintly greenish in certain lights. And below the crater rim, a dark structure. Large. Intact. Waiting.',
    descriptionNight: 'At night the ridge shows you the Scar in its true form: an orange glow, diffuse and steady, rising from the crater below. Heat, or something generating heat. Seven years of it. The wind tries to push you off the ridge. It doesn\'t succeed.',
    shortDescription: 'Ridge trail. Wind. View of the Scar valley below.',
    exits: { south: 'ps_02_elk_meadow', north: 'ps_07_snow_line' },
    richExits: {
      south: { destination: 'ps_02_elk_meadow', descriptionVerbose: 'south back to the meadow' },
      north: { destination: 'ps_07_snow_line', descriptionVerbose: 'north, higher, toward the snow line' },
    },
    items: [],
    enemies: [],
    npcs: [],
    extras: [
      {
        keywords: ['valley', 'scar', 'crater', 'below'],
        description: 'The Scar valley from above: a bowl-shaped depression in the mountain terrain, the crater edge visible as a broken ring, the chemical haze a permanent weather system trapped in the topography. Within the crater: dark shapes. Structures. The largest one has a flat profile and angular geometry that isn\'t geological. Someone built that.',
        skillCheck: { skill: 'perception', dc: 11, successAppend: 'The chemical haze has gaps on the windward side where the ridge trail catches a constant mountain airflow. Through a gap, for a few seconds: a rooftop, an antenna array, a vehicle bay door standing open. MERIDIAN isn\'t rubble. MERIDIAN is a facility. The bombing narrative was a cover story.' },
      },
      {
        keywords: ['wind', 'cold', 'ridge', 'exposed'],
        description: 'The wind at this elevation is unfiltered — no trees, no topography, just the pure physics of air moving across a mountain ridge. Your skin registers it in Fahrenheit equivalents: cold enough to cause real problems if you stay long without the right gear. In winter, this ridge is impassable. Now, in season, it\'s passable and punishing and worth it for the view.',
      },
    ],
    hollowEncounter: {
      baseChance: 0.12,
      timeModifier: { day: 0.6, night: 1.5, dawn: 0.9, dusk: 1.2 },
      threatPool: [
        { type: 'shuffler', weight: 70, quantity: { min: 1, max: 2, distribution: 'weighted_low' } },
        { type: 'remnant', weight: 30, quantity: { min: 1, max: 1, distribution: 'single' } },
      ],
      awarenessRoll: { unaware: 0.5, awarePassive: 0.3, awareAggressive: 0.2 },
    },
    environmentalRolls: {
      flavorLines: [
        { line: 'The wind shifts and for a moment you catch the faint chemical smell of the Scar valley below.', chance: 0.20, time: null },
        { line: 'A hawk rides the ridge updraft, level with your face, close enough to see its eye.', chance: 0.15, time: ['day'] },
      ],
    },
    narrativeNotes: 'The ridge is the first clear visual on MERIDIAN as an intact structure. The perception check revealing the rooftop and antenna is a major confirmation that the bombing narrative was false.',
  },

  {
    id: 'ps_06_shepherds_camp',
    name: 'The Shepherd\'s Camp',
    zone: 'the_pine_sea',
    act: 2,
    difficulty: 2,
    visited: false,
    flags: { safeRest: true, questHub: true },
    description: 'A clearing in the upper forest holds a camp that has been here for years: a fire ring with a grill grate, a canvas lean-to shelter angled to catch the south sun, a water collection system from the nearest seep, a stacked firewood supply that speaks to someone who understands winter. The hermit is here. They\'ve been here for at least three seasons. They know the mountains with the intimacy that only comes from living in them continuously, and they know the Scar valley — have been watching it from the ridge, have been to it twice, have a story that is yours if you ask the right way.',
    descriptionNight: 'At night the camp fire burns low and orange. The hermit keeps it small — old habit, or knowledge. The darkness above the camp has more stars per square inch than any place you\'ve been. The hermit tells you what they saw in the valley. They\'ve been waiting to tell someone.',
    shortDescription: 'Hermit\'s camp. Lore dump. Directions to the Scar.',
    exits: { south: 'ps_04_waterfall', east: 'ps_08_scar_overlook' },
    richExits: {
      south: { destination: 'ps_04_waterfall', descriptionVerbose: 'south toward the waterfall' },
      east: { destination: 'ps_08_scar_overlook', descriptionVerbose: 'east toward the Scar overlook' },
    },
    items: [],
    enemies: [],
    npcs: ['shepherd_hermit'],
    npcSpawns: [
      {
        npcId: 'shepherd_hermit',
        spawnChance: 0.85,
        spawnType: 'anchored',
        quantity: { min: 1, max: 1, distribution: 'single' },
        activityPool: [
          { desc: 'A weathered person tends the camp fire with the economy of someone who has maintained fires alone for a long time. They look up when you arrive but don\'t startle. They\'ve heard you for ten minutes.', weight: 3 },
          { desc: 'The hermit is repairing something — a pack strap, a boot sole — with the focused patience of someone who has learned that things break and break again and the breaking doesn\'t end.', weight: 2 },
          { desc: 'The hermit stands at the camp\'s edge, looking east toward the ridge. They turn when you\'re close enough to matter. "I thought you might come through. The timing usually means something."', weight: 2 },
        ],
        dispositionRoll: { friendly: 0.4, neutral: 0.5, wary: 0.1 },
        dialogueTree: 'shepherd_hermit_lore',
        questGiver: ['pine_sea_scar_directions', 'shepherd_personal_quest'],
        narrativeNotes: 'SHEPHERD from the logbook. Has been to MERIDIAN twice. Knows the terrain, the hazards, and the route. Shares what they know freely but carefully — they\'ve learned that information given without context causes harm.',
      },
    ],
    extras: [
      {
        keywords: ['camp', 'fire ring', 'lean-to', 'shelter'],
        description: 'The camp is three years of accumulated wisdom about how to stay alive at this altitude, in this climate, indefinitely. Every element is positioned for function: fire ring on a wind-sheltered berm, shelter angled for warmth, water collection where gravity brings it. This person knows what they\'re doing. They\'ve had time to find out.',
      },
      {
        keywords: ['firewood', 'wood', 'stacked', 'winter'],
        description: 'The firewood stack is several cords — more than one person needs for a season. Either the hermit is preparing for deep winter or they\'re preparing for company. The wood is split and stacked properly: bark side up, cross-stacked at the ends for stability, set on pallets to keep off the ground. This took weeks.',
      },
      {
        keywords: ['directions', 'route', 'scar', 'valley', 'MERIDIAN'],
        description: 'The hermit has been to the Scar twice. They\'ll tell you what they know: the route from the overlook, the chemical hazard zones, the facility\'s four known access points, and one thing nobody else has told you. They stopped at the main entrance the second time. They didn\'t go in. They heard something inside that made them leave. They don\'t say what it was.',
        questGate: 'shepherd_trust_earned',
      },
    ],
    hollowEncounter: {
      baseChance: 0.04,
      timeModifier: { day: 0.3, night: 0.8, dawn: 0.4, dusk: 0.6 },
      threatPool: [
        { type: 'shuffler', weight: 90, quantity: { min: 1, max: 1, distribution: 'single' } },
        { type: 'remnant', weight: 10, quantity: { min: 1, max: 1, distribution: 'single' } },
      ],
      awarenessRoll: { unaware: 0.6, awarePassive: 0.3, awareAggressive: 0.1 },
    },
    narrativeNotes: 'Major NPC and lore hub. The hermit is SHEPHERD. The "what they heard" that made them leave MERIDIAN is a deliberate open mystery — each player imagines something appropriately terrifying. The withheld detail is more effective than any description.',
  },

  {
    id: 'ps_07_snow_line',
    name: 'The Snow Line',
    zone: 'the_pine_sea',
    act: 2,
    difficulty: 3,
    visited: false,
    flags: { scavengingZone: false },
    description: 'The treeline ends here and the permanent snowfield begins. Altitude transition — above this line, snow persists through summer in the shaded north-facing slopes. The air is thin enough to notice, the cold immediate and specific. Sanguine don\'t come here: something about the combination of UV exposure, thin air, and cold creates conditions they find intolerable. You are in the only zone in the Four Corners where Sanguine threat is zero. That information has a strange weight to it, like removing armor and realizing how heavy it was.',
    descriptionNight: 'At night the snow glows. Not metaphorically — the moon and starlight hitting a large white surface produces a diffuse illumination that makes the snow line brighter than the dark forest below. This is the one place you can see at night without a light. The trade-off is that you can also be seen.',
    shortDescription: 'Snow line. Cold damage without gear. Sanguine avoid.',
    exits: { south: 'ps_05_ridge_trail', north: 'ps_08_scar_overlook' },
    richExits: {
      south: { destination: 'ps_05_ridge_trail', descriptionVerbose: 'south back to the ridge trail' },
      north: { destination: 'ps_08_scar_overlook', descriptionVerbose: 'north, across the snow toward the overlook' },
    },
    items: [],
    enemies: [],
    npcs: [],
    extras: [
      {
        keywords: ['snow', 'snowfield', 'cold', 'permanent'],
        description: 'The snowfield has survived seven years of climate drift — high altitude, north-facing, the geology creating shade. You step onto it and your boot punches through the surface crust into eight inches of compressed snow. Cold immediately. Your mind begins its inventory: current insulation, moisture management, time at altitude before core temperature becomes a concern.',
        skillCheck: { skill: 'survival', dc: 11, successAppend: 'With the right gear you can cross safely. Without it: hypothermia onset in ninety minutes at current conditions, faster if the wind picks up. The snowfield is perhaps two hundred yards across. The overlook is just beyond. You can make it. You should be aware of what you\'re agreeing to.' },
      },
      {
        keywords: ['sanguine', 'avoid', 'vampire', 'no threat'],
        description: 'The hermit mentioned this. The Sanguine don\'t come above the snow line. Something about the UV index and altitude, probably — their photosensitivity is already a liability in lowland daylight; at this elevation it\'s a genuine physical danger. The no-Sanguine zone isn\'t documented anywhere. You just know it from the hermit and now from your own observation: no tracks, no territorial markings, nothing. This air belongs only to ordinary things.',
      },
      {
        keywords: ['thin', 'air', 'altitude', 'breath'],
        description: 'You feel the altitude in your chest — each breath less satisfying than the last, your body recalibrating. Eleven thousand feet, roughly. The San Juan Mountains are generous with this kind of clarity: everything becomes sharper at altitude, colors, sounds, the edges of things. You and the snow and the cold and the distant valley below.',
      },
    ],
    hollowEncounter: {
      baseChance: 0.06,
      timeModifier: { day: 0.5, night: 0.8, dawn: 0.6, dusk: 0.7 },
      threatPool: [
        { type: 'shuffler', weight: 80, quantity: { min: 1, max: 1, distribution: 'single' } },
        { type: 'remnant', weight: 20, quantity: { min: 1, max: 1, distribution: 'single' } },
      ],
      awarenessRoll: { unaware: 0.6, awarePassive: 0.3, awareAggressive: 0.1 },
    },
    narrativeNotes: 'Cold damage mechanic without gear. The Sanguine-free zone is unusual and therefore meaningful. The visible breath and altitude sensation ground the room in the body.',
  },

  {
    id: 'ps_08_scar_overlook',
    name: 'The Scar Overlook',
    zone: 'the_pine_sea',
    act: 2,
    difficulty: 3,
    visited: false,
    flags: { fastTravelWaypoint: true },
    description: 'The final vista before descent. You\'re standing at the edge of everything you\'ve been building toward, and the view is exactly as large as the buildup deserved. The Scar valley opens below — the crater and its contents, the chemical haze, the facility that was supposed to be rubble and isn\'t, the orange warmth rising from the deep. The descent path is visible from here: switchbacks down the steep north face, through the chemical margin, into the crater. There\'s no going back once you\'re in the haze. You can go back from here. This is the last place you can go back from.',
    descriptionNight: 'At night the Scar below glows orange and the facility shows lights — real lights, electric lights, seven years of power nobody turned off or someone turned back on. The sky above is vast and cold and full of light of a different kind. You stand between the two light sources and make a decision.',
    shortDescription: 'Final overlook before the Scar. Point of no return.',
    exits: { south: 'ps_07_snow_line', north: 'scar_01_crater_rim' },
    richExits: {
      south: { destination: 'ps_07_snow_line', descriptionVerbose: 'south, back the way you came' },
      north: {
        destination: 'scar_01_crater_rim',
        descriptionVerbose: 'north, down into the Scar valley — there is no coming back from this as the same person who left',
        cycleGate: 3,
      },
    },
    items: [],
    enemies: [],
    npcs: [],
    extras: [
      {
        keywords: ['facility', 'MERIDIAN', 'structure', 'below'],
        description: 'From this angle, MERIDIAN is unambiguous — the facility\'s roofline, antenna masts, vehicle bay, ventilation stacks. Built into the crater floor, which means it was designed for the crater, which means the bombing didn\'t create it, which means the bombing was covering it. Three simple facts that change everything that was presented to you as history.',
      },
      {
        keywords: ['descent', 'path', 'switchback', 'trail'],
        description: 'The descent path is maintained — not well, not recently, but maintained: the worst erosion spots have been shored with improvised steps, the trail markers are still present. Multiple people have come this way. Some of them have come back. The hermit came back twice. You note the difference between that and "came back from inside."',
      },
      {
        keywords: ['chemical', 'haze', 'air', 'margin'],
        description: 'The chemical haze begins partway down the slope — you can see the line where the air quality changes, a thin brown margin at a specific elevation. On a calm day it\'s contained. On a windy day it creeps up the slope. Today is calm. The margin looks manageable. You\'re aware that "manageable" is doing a lot of work in that assessment.',
        skillCheck: { skill: 'survival', dc: 10, successAppend: 'The chemical haze is primarily SO2 and volatile organic compounds from whatever reaction is maintaining MERIDIAN\'s heat source. Manageable in short exposures. Cumulative in long exposures. You\'ll want to move through it quickly and not linger in the crater until you\'re inside the facility.' },
      },
      {
        keywords: ['back', 'return', 'leave', 'choice'],
        description: 'You could go back. You\'ve done enough. You know enough. You could take what you know to any of the factions and let them decide what to do with it. The Scar is down there and it\'s been down there for seven years and it\'ll be down there longer. You don\'t have to be the one. You stand with that thought for a moment and learn something about yourself from how long you hold it before putting it down.',
      },
    ],
    hollowEncounter: {
      baseChance: 0.08,
      timeModifier: { day: 0.5, night: 1.2, dawn: 0.7, dusk: 1.0 },
      threatPool: [
        { type: 'shuffler', weight: 75, quantity: { min: 1, max: 2, distribution: 'weighted_low' } },
        { type: 'remnant', weight: 25, quantity: { min: 1, max: 1, distribution: 'single' } },
      ],
      awarenessRoll: { unaware: 0.55, awarePassive: 0.3, awareAggressive: 0.15 },
    },
    environmentalRolls: {
      flavorLines: [
        { line: 'The wind brings the chemical smell from the valley below — thin, but present.', chance: 0.25, time: null },
        { line: 'The orange glow from the Scar reflects off the snowfield behind you, catching you between two lights.', chance: 0.20, time: ['night'] },
      ],
    },
    narrativeNotes: 'Climactic room. Point of no return is stated explicitly but gently. The "learning something about yourself from how long you hold it" line is the room\'s thesis. Cycle 3 gate to proceed. The four extras build toward the descent.',
  },
]
