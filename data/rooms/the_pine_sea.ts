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
    descriptionDawn: 'Dawn at the tree line is a negotiation between the open sky and the canopy. The first light hits the upper branches and turns them gold while the forest floor stays dark for another hour. Mist rises from the duff in thin columns where the ground warmth meets the cold air, and the resin smell is strongest now — the pines releasing their chemistry into the temperature differential. A bird you still can\'t name calls from somewhere in the canopy, its voice the first sound of the day, authoritative and unconcerned with you.',
    descriptionDusk: 'Dusk at the tree line reverses the forest\'s relationship with light. The open ground behind you holds the last glow while the canopy ahead goes dark from the ground up, the trunks disappearing first, then the mid-branches, until only the very tops of the tallest pines still catch the color — a line of gold crowns floating above a wall of shadow. The quiet changes quality. The daytime quiet was attention. The evening quiet is anticipation. The forest is the same forest. What\'s in it is about to shift.',
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
    descriptionDawn: 'Dawn in the elk meadow is a scene from the world before. The grass is wet with dew that catches the first light in a thousand tiny fires. The elk herd is grazing, steam rising from their backs in the cold air, the calves pressed close to their mothers. A bull stands at the meadow edge with his antlers in velvet, silhouetted against the brightening east, perfectly still. The wildflowers are closed, waiting for the warmth. The meadow smells of wet grass and cold earth and the specific absence of anything wrong. You stand at the edge and watch and do not enter because entering would change something that does not need changing.',
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
    exits: { west: 'ps_01_tree_line', north: 'ps_13_fungal_hollow' },
    richExits: {
      west: { destination: 'ps_01_tree_line', descriptionVerbose: 'west back to the tree line' },
      north: { destination: 'ps_13_fungal_hollow', descriptionVerbose: 'north, where the logging road bends into shadow and the canopy thickens' },
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
    descriptionDawn: 'Dawn on the ridge trail is the first light hitting you at full exposure — no canopy, no canyon walls, just the sun clearing the eastern range and the wind carrying the cold of the night that hasn\'t finished leaving. The Scar valley is still in shadow below, the crater rim a dark ring against the lighter terrain, the chemical haze a gray smudge that the morning light hasn\'t yet resolved into its faint green. The dark structure within the crater is a geometric shadow against geological ones. The wind is strongest at dawn, the thermal differential between the warming ridge and the cold valley creating a steady upslope current that carries the faint chemical smell with it.',
    descriptionDusk: 'Dusk on the ridge trail colors the Scar valley in stages. The chemical haze catches the last light and turns amber, then orange, then a color that is uncomfortably close to the glow it produces at night. The crater rim throws a shadow that moves across the valley floor as the sun drops, and for a few minutes the dark structure within is lit on one face and shadowed on the other — the angle revealing features that flat daylight obscures. Scale becomes apparent. The structure is larger than you thought. The wind shifts from upslope to downslope as the ridge cools faster than the valley, and the chemical smell reverses direction, pulling away from you, down into the crater, as if the valley is breathing in.',
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
    exits: { south: 'ps_04_waterfall', east: 'ps_08_scar_overlook', north: 'ps_09_old_growth_heart', west: 'ps_15_collapsed_fire_tower' },
    richExits: {
      south: { destination: 'ps_04_waterfall', descriptionVerbose: 'south toward the waterfall' },
      east: { destination: 'ps_08_scar_overlook', descriptionVerbose: 'east toward the Scar overlook' },
      north: { destination: 'ps_09_old_growth_heart', descriptionVerbose: 'north, deeper into the forest — the trees get bigger' },
      west: { destination: 'ps_15_collapsed_fire_tower', descriptionVerbose: 'west, uphill through thinning pines toward something metal catching the light' },
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
    descriptionDawn: 'Dawn at the snow line is a color event — the permanent snowfield catches the first light and goes from blue-gray to pink to a white so bright you squint against it. The surface crust has frozen harder overnight and your boots crunch through it with a sound like breaking porcelain. Your breath is visible, dense, hanging in the still air for seconds before the wind takes it. The tree line below is still dark. Up here, at this altitude, the day starts first and the cold is the sharpest version of itself, the air thin enough that each breath is a conscious decision to continue.',
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

  {
    id: 'ps_09_old_growth_heart',
    name: 'The Old Growth Heart',
    zone: 'the_pine_sea',
    act: 3,
    difficulty: 3,
    visited: false,
    flags: { dark: true, scavengingZone: false },
    cycleGate: 3,
    description: 'The forest changes here so completely that you stop walking. The trees are enormous — not tall-tree enormous but ancient-world enormous, the trunks wider than rooms, the bark deeply furrowed and dark with centuries of moisture. Five people couldn\'t link hands around the nearest one. Light does not reach the forest floor. The canopy above is a closed system, the understory a permanent twilight regardless of the hour. Sound is different here. Time feels different here, in the way that high-altitude snowfields feel removed from time — this place has been doing what it does since before the Collapse, before the state, before the first road. It will continue long after. You are a very brief event in a very long history.',
    descriptionNight: 'At night the Old Growth Heart is total darkness — the canopy filters even starlight to nothing. You navigate by touch: bark against your palms, the soft resistance of deep duff under your feet. Something moves, ahead and to your left, in the dark. Something that has been in this dark a long time and has learned to prefer it.',
    descriptionDawn: 'At dawn a single shaft of light enters through a gap in the canopy — the oldest tree has lost a major limb and the opening admits the first horizontal light of the day. The shaft is dense with particulate: pollen, spore, something older. It illuminates nothing useful. It illuminates everything important.',
    shortDescription: 'Ancient old growth. Total canopy cover. Time moves differently.',
    exits: { south: 'ps_06_shepherds_camp', east: 'ps_11_bone_grove', west: 'ps_12_coastal_approach' },
    richExits: {
      south: { destination: 'ps_06_shepherds_camp', descriptionVerbose: 'south, back toward the hermit\'s camp and familiar forest' },
      east: { destination: 'ps_11_bone_grove', descriptionVerbose: 'east, where the trees thin slightly around what looks like a clearing' },
      west: { destination: 'ps_12_coastal_approach', descriptionVerbose: 'west, where the canopy begins to lighten and something on the air smells different — salt, or distance' },
      north: {
        destination: 'ps_10_hermit_deep_camp',
        descriptionVerbose: 'north, but there is no trail — only a bearing and a gap between two root buttresses that might be deliberate',
        hidden: true,
        skillGate: {
          skill: 'tracking',
          dc: 13,
          failMessage: 'You lose the thread in the dark. The root systems all look the same. You circle back.',
        },
        discoverSkill: 'tracking',
        discoverDc: 11,
        discoverMessage: 'A strip of bark has been peeled from a root — deliberately, at knee height. A trail marker, barely legible, for someone who knows to look.',
      },
    },
    items: [],
    enemies: ['remnant'],
    npcs: [],
    extras: [
      {
        keywords: ['trees', 'trunks', 'old growth', 'bark', 'ancient'],
        description: 'The bark of the oldest tree has been growing since before European contact with this continent. You put your hand on it and feel the deep furrowing — each groove a decade, the patterns a record of centuries of drought and wet and fire and regrowth. The tree survived the Collapse the same way it survived everything else: by being a tree, which means being extraordinarily patient and extraordinarily good at one thing.',
        skillCheck: { skill: 'survival', dc: 10, successAppend: 'The tree ring record visible at a blown-down neighbor suggests this stand has survived at least three major regional fire events, each one that should have cleared this slope. The old growth survived because the trees are far enough apart, and the undergrowth is moist enough, and something about this hollow draws cold air that suppresses the worst burns. The forest engineered its own survival. You\'re inside the mechanism.' },
      },
      {
        keywords: ['light', 'dark', 'canopy', 'shadow', 'twilight'],
        description: 'The canopy closure is complete — the interlocked crowns of twelve adjacent trees create a continuous ceiling of needles and branch that reduces the light below to perhaps five percent of what falls above. Plants that survive here are specialists: deep-shade ferns, fungi, lichens that grow on the north faces of the buttress roots. The ecosystem is calibrated to the specific dark. You are a large diurnal mammal in a world that was built around your absence.',
      },
      {
        keywords: ['time', 'silence', 'quiet', 'feeling', 'presence'],
        description: 'The silence in the Old Growth Heart is qualitatively different from any silence you have experienced since the Collapse. It is not absence — absence has a flat quality, a lack. This is a full silence, the silence of something that does not need to make noise because it is not waiting for anything. You stand in it and understand why the hermit chose to live near here. Some places are good for certain kinds of thinking.',
      },
      {
        keywords: ['hollow', 'shape', 'movement', 'dark'],
        description: 'Something moves at the edge of where you can see — peripheral, slow, with the wrong quality of movement. Not shuffler-wrong: this is a different kind of wrong, the wrongness of something that has been in this specific dark for a very long time and absorbed something of its patience. It isn\'t moving toward you. It is moving around you. There is a difference.',
        skillCheck: { skill: 'perception', dc: 12, successAppend: 'There are two of them. They\'ve been here long enough that the duff has adapted — the forest floor around their usual paths is compressed and darkened. Years of movement. They\'re part of this place the way the fungi are part of this place. They could be aggressive. They are choosing not to be. The choosing is the strange part.' },
      },
    ],
    hollowEncounter: {
      baseChance: 0.18,
      timeModifier: { day: 0.8, night: 1.8, dawn: 1.0, dusk: 1.4 },
      threatPool: [
        { type: 'remnant', weight: 60, quantity: { min: 1, max: 1, distribution: 'single' } },
        { type: 'whisperer', weight: 30, quantity: { min: 1, max: 1, distribution: 'single' } },
        { type: 'shuffler', weight: 10, quantity: { min: 1, max: 1, distribution: 'single' } },
      ],
      awarenessRoll: { unaware: 0.3, awarePassive: 0.5, awareAggressive: 0.2 },
      noiseModifier: -0.3,
    },
    environmentalRolls: {
      flavorLines: [
        { line: 'The forest breathes. You are aware of this suddenly and cannot stop being aware of it.', chance: 0.30, time: null },
        { line: 'Something large moves far above in the canopy. A branch shift. Then stillness.', chance: 0.20, time: null },
        { line: 'The temperature is several degrees cooler here than in the surrounding forest. Cold air pools in the oldest hollows.', chance: 0.15, time: ['dawn', 'night'] },
      ],
      ambientSoundPool: {
        day: [
          { sound: 'Somewhere far above: wind. Down here: nothing.', weight: 3 },
          { sound: 'A branch settles with a sound like a question.', weight: 2 },
          { sound: null, weight: 2 },
        ],
        night: [
          { sound: 'Total dark. Total quiet. Something breathing that is not you.', weight: 2 },
          { sound: null, weight: 3 },
        ],
      },
      ambientCount: { min: 1, max: 2, distribution: 'flat' },
    },
    narrativeNotes: 'Act 3 beauty-and-dread room. The Hollow here are old and strange — not aggressive by default. The dark flag means players without light sources are at a disadvantage. The hidden north exit to the hermit\'s deep camp rewards tracking skill. Tone: awe edging toward unease.',
  },

  {
    id: 'ps_10_hermit_deep_camp',
    name: 'The Hermit\'s Deep Camp',
    zone: 'the_pine_sea',
    act: 3,
    difficulty: 2,
    visited: false,
    flags: { safeRest: true, questHub: true, hiddenRoom: true, campfireAllowed: true },
    cycleGate: 3,
    description: 'The camp at the end of the hidden trail is different from the one by the waterfall — older, quieter, more embedded in the forest itself. The shelter is not canvas but a structure built into the root buttresses of the largest tree: a frame of found timber, bark-shingled, the gaps moss-caulked. A fire that has been burning in some form for at least a decade; the hearth ring is blackened eight inches deep. Maps cover the inner walls — not paper maps, bark maps, dozens of them, fitted together to form a complete picture of the Pine Sea from the tree line to the coast. The hermit is here more often than they\'re at the other camp. This is where they come when they need to think.',
    descriptionNight: 'At night the deep camp fire is the only light in the Old Growth Heart — a warm pinpoint at the base of the largest tree, visible through the dark for perhaps thirty yards. The hermit tends it with care. The fire has been burning long enough that it knows what it\'s doing.',
    shortDescription: 'Hermit\'s true home. Bark maps. A decade of fire. Hidden.',
    exits: { south: 'ps_09_old_growth_heart' },
    richExits: {
      south: { destination: 'ps_09_old_growth_heart', descriptionVerbose: 'south, back through the root gap into the old growth' },
    },
    items: ['lore_hermit_bark_maps'],
    enemies: [],
    npcs: ['shepherd_hermit'],
    npcSpawns: [
      {
        npcId: 'shepherd_hermit',
        spawnChance: 0.70,
        spawnType: 'anchored',
        quantity: { min: 1, max: 1, distribution: 'single' },
        activityPool: [
          { desc: 'The hermit sits cross-legged before the fire, scratching something onto a new strip of bark with a nail. They don\'t look up when you arrive. "You found it. Not many do." They keep scratching.', weight: 3 },
          { desc: 'The hermit is adding to the bark map wall, fitting a new panel into the larger picture with precise care. They step back, squint, adjust it slightly. "The coast shifts. The maps have to shift with it."', weight: 2 },
          { desc: 'The hermit is asleep against the root buttress. The fire doesn\'t go out. You have the impression the fire would not dare.', weight: 1, timeRestrict: ['night'] },
        ],
        dispositionRoll: { friendly: 0.6, neutral: 0.35, wary: 0.05 },
        dialogueTree: 'shepherd_hermit_deep',
        questGiver: ['pine_sea_coast_route', 'hermit_fire_keeper_story'],
        narrativeNotes: 'The hermit here is more open than at the accessible camp — finding this place is a proof of capability they respect. Deeper lore available: the coast, what\'s beyond the forest, and why the hermit stays.',
      },
    ],
    extras: [
      {
        keywords: ['maps', 'bark maps', 'wall', 'routes'],
        description: 'The bark map panels cover the north-facing wall of the shelter completely. Fitted together, they describe every route through the Pine Sea from the tree line to the coast — dozens of trails, hazard notations, seasonal variations. Some panels are old and dark, the scratch-lines faded. Some are fresh. The complete map is a life\'s work, or close to it. No copies. This is the only one.',
        skillCheck: { skill: 'lore', dc: 10, successAppend: 'The oldest panels are dated. The hermit began mapping in Year 1 of the Collapse, within the first months. They\'ve been at this for seven years. The coastal sections are the most recent and the most detailed — the hermit has been spending more time there. One panel is blank except for a hand-drawn question mark at its center and a compass bearing: 285 degrees. Due west, roughly. Into the sea.' },
      },
      {
        keywords: ['fire', 'hearth', 'decade', 'embers'],
        description: 'The hearth ring is blackened eight inches deep into the soil. A fire has been burning here continuously — or nearly continuously — for a very long time. The hermit feeds it with specific wood from a specific stack: seasoned pine, split small, added with the timing of someone who has learned the fire\'s metabolism. The fire is the oldest thing at this camp that isn\'t a tree.',
      },
      {
        keywords: ['shelter', 'structure', 'root', 'tree', 'home'],
        description: 'The shelter is built into the root buttress the way a bird builds into a cliff face: using the structure that was already there, not imposing on it. The frame timber is pegged, not nailed — no metal except the nail for scratching maps. The bark shingles overlap correctly. Rain doesn\'t get in. Nothing about this place is improvised. All of it is earned.',
      },
    ],
    hollowEncounter: {
      baseChance: 0.03,
      timeModifier: { day: 0.2, night: 0.5, dawn: 0.3, dusk: 0.4 },
      threatPool: [
        { type: 'remnant', weight: 70, quantity: { min: 1, max: 1, distribution: 'single' } },
        { type: 'shuffler', weight: 30, quantity: { min: 1, max: 1, distribution: 'single' } },
      ],
      awarenessRoll: { unaware: 0.6, awarePassive: 0.3, awareAggressive: 0.1 },
    },
    environmentalRolls: {
      flavorLines: [
        { line: 'The fire pops. A knot in the wood. The sound is the loudest thing in the old growth.', chance: 0.35, time: null },
        { line: 'Wind moves somewhere far above in the canopy. Down here: nothing. The fire does not flicker.', chance: 0.20, time: null },
      ],
    },
    narrativeNotes: 'Skill-gated hidden room rewarding tracking investment. The hermit here is more forthcoming — this is the lore unlock for the coastal approach and whatever is beyond the forest. The bark maps and decade-old fire are the room\'s visual anchors. The blank panel with a question mark is a planted mystery.',
  },

  {
    id: 'ps_11_bone_grove',
    name: 'The Bone Grove',
    zone: 'the_pine_sea',
    act: 3,
    difficulty: 3,
    visited: false,
    flags: { scavengingZone: false, noCombat: false },
    cycleGate: 3,
    description: 'The forest opens into a clearing that isn\'t meadow — there\'s no grass, only compressed earth and dry pine duff, and in the center of it: bones. Something enormous died here long ago. The skeleton is too large for any animal you can name: a ribcage that could shelter four people standing, vertebrae the size of wheel hubs, a skull with teeth that are wrong in ways that take a moment to categorize. Pre-Collapse megafauna, maybe, or something the Collapse made. The bones are bleached and old and undisturbed. The Hollow don\'t come here. You can tell from the absence of their sign — no compressed trails, no territorial markings, nothing. This place is avoided. The hermit leaves it alone for different reasons. Both reactions are probably correct.',
    descriptionNight: 'At night the bones are pale against the dark clearing. They catch moonlight in a way the surrounding forest doesn\'t. The ribcage creates a skeletal architecture that is somehow more disturbing at night than in daylight — the gaps between the ribs frame pieces of sky. The clearing has a specific quality of emptiness that feels less like absence and more like something cleared deliberately.',
    descriptionDusk: 'Dusk in the bone grove arrives from the canopy down. The trees surrounding the clearing go dark first, the trunks becoming columns of shadow, and the clearing itself holds the last ambient light in a way that makes the bones more prominent — pale shapes on dark earth, catching what remains. The enormous ribcage throws long shadows that reach the tree line and merge with the forest dark. The skull faces west, and for a few minutes the orbital sockets hold the last light, two dim points that could be mistaken for something looking back at you. The wrongness of the teeth is less visible in this light. The wrongness of the clearing is more.',
    shortDescription: 'Pre-collapse bones. Something enormous died here. Hollow avoid it.',
    exits: { west: 'ps_09_old_growth_heart', east: 'ps_16_spore_field' },
    richExits: {
      west: { destination: 'ps_09_old_growth_heart', descriptionVerbose: 'west, back into the old growth' },
      east: { destination: 'ps_16_spore_field', descriptionVerbose: 'east, past the bone field where the undergrowth resumes in strange patterns' },
    },
    items: [],
    enemies: [],
    npcs: [],
    extras: [
      {
        keywords: ['bones', 'skeleton', 'skull', 'ribcage', 'creature'],
        description: 'The skeleton doesn\'t match any species in the pre-Collapse record that you know. The proportions are wrong — the limb ratios are off, the skull has orbital sockets facing forward like a predator but a jaw adapted for something else entirely. Large enough that it couldn\'t have been hiding — this animal existed in the open, which means either it existed before records were thorough, or it came after. You look at the teeth again. You stop looking at the teeth.',
        skillCheck: { skill: 'survival', dc: 12, successAppend: 'The bone density is consistent with something that grew slowly over a very long time — these are old bones from an old animal, not something recent. Pre-Collapse, then. Which means it was here before the Collapse and undocumented. The San Juan range is large and the pre-Collapse survey records were incomplete. Something this size could exist in the roadless areas for decades without systematic documentation. The absence of evidence is not evidence of absence. Was not.' },
      },
      {
        keywords: ['hollow', 'avoid', 'empty', 'sign', 'tracks'],
        description: 'The forest floor around the clearing has Hollow sign everywhere — compressed trails through the duff, the faint territorial marks they leave on bark. The clearing itself has none. The avoidance is precise: the sign stops at the tree line around the clearing as if there\'s a wall. You walk the perimeter and confirm it. Every entry point: Hollow sign. Inside the tree line: nothing. They go around. They have been going around for a while.',
        skillCheck: { skill: 'tracking', dc: 11, successAppend: 'The avoidance pattern has a gradient: the Hollow who approach closest are the oldest-established ones — long-duration remnants with years of territory. The newer, more aggressive shufflers avoid from farther away. Whatever the clearing is putting into the air, the older Hollow have learned to recognize it as a signal to stop. Not fear, exactly — a deep biological instruction, like the instruction that keeps them from crossing fast water. Something in the bones.' },
      },
      {
        keywords: ['hermit', 'leave', 'avoid', 'alone', 'reasons'],
        description: 'If you\'ve spoken to the hermit, they mentioned this place. They said they leave it alone. When asked why, they were quiet for longer than was comfortable, then said: "I came here when I first arrived in the forest. I sat here for an hour. I don\'t remember what I thought about. When I left I walked differently for two days. I don\'t come back because I can\'t tell if that\'s a good thing or a bad thing and I don\'t want to find out." You stand in the clearing and try to notice if anything is different about your thinking. You\'re not sure.',
        questGate: 'shepherd_hermit_met',
      },
      {
        keywords: ['teeth', 'jaw', 'mouth', 'skull'],
        description: 'You look at the teeth. They are the wrong shape — not worn-wrong or damaged-wrong but structurally, taxonomically wrong for anything you can place in a category. You\'ve seen enough animal skulls in the backcountry to know what wrong looks like. This is it. You stop examining them because continuing to examine them requires you to develop a framework for what you\'re seeing, and you\'re not sure you want that framework.',
      },
    ],
    hollowEncounter: {
      baseChance: 0.02,
      timeModifier: { day: 0.2, night: 0.3, dawn: 0.2, dusk: 0.3 },
      threatPool: [
        { type: 'remnant', weight: 100, quantity: { min: 1, max: 1, distribution: 'single' } },
      ],
      awarenessRoll: { unaware: 0.8, awarePassive: 0.15, awareAggressive: 0.05 },
    },
    environmentalRolls: {
      flavorLines: [
        { line: 'Wind crosses the clearing without moving anything. The bones are too heavy to move.', chance: 0.25, time: null },
        { line: 'A bird flies over the clearing without landing. It changes course at the tree line.', chance: 0.20, time: ['day', 'dawn'] },
        { line: 'You become aware that you have been here longer than you intended.', chance: 0.30, time: null },
      ],
    },
    narrativeNotes: 'Mystery room — the bones are deliberately uncategorizable. The Hollow avoidance is unusual and suggestive of something in the environment or the bones themselves. The hermit\'s account (quest-gated) adds a subjective dimension: the clearing affects people in ways they can\'t explain. Lowest Hollow encounter in the zone by design — the avoidance applies to players too, atmospherically.',
  },

  {
    id: 'ps_12_coastal_approach',
    name: 'The Coastal Approach',
    zone: 'the_pine_sea',
    act: 3,
    difficulty: 3,
    visited: false,
    flags: { fastTravelWaypoint: false, scavengingZone: true },
    cycleGate: 3,
    description: 'The forest thins here. Not meadow-thins — the trees don\'t stop, they just get smaller and farther apart, the understory opening, light returning in quantities you\'d forgotten about. And on the air: salt. Real salt, ocean salt, the specific compound of spray and distance that means sea is close. The Pacific is somewhere west of here — you\'re not sure how far — but the smell says closer than any map suggests. The last survey document here is pinned to a tree with a rusted nail: a USDA Forest Service coastal boundary marker from 2019, its printed text mostly legible. The world was mapped once. The maps were correct once. This is the edge of where they stopped.',
    descriptionNight: 'At night the coastal approach shows the sky in a way the rest of the Pine Sea doesn\'t — more open, stars visible in larger patches. The sound of the sea is clearer at night, when the wind from the west brings it unobstructed. You haven\'t heard ocean since before the Collapse. You had forgotten what you were forgetting.',
    descriptionDawn: 'At dawn the coastal approach catches the first light from the east and sends it back — the thin trees are illuminated, the trunks pale in the horizontal light. The sea smell is strongest at dawn, when the temperature differential drives an onshore breeze. If you stand still and let the light and the smell arrive together, it is briefly the most alive you\'ve felt since the Collapse.',
    shortDescription: 'Forest thins. Salt air. Edge of the mapped world.',
    exits: { east: 'ps_09_old_growth_heart', south: 'ps_19_windbreak_ruin' },
    richExits: {
      east: { destination: 'ps_09_old_growth_heart', descriptionVerbose: 'east, back into the deep old growth' },
      south: { destination: 'ps_19_windbreak_ruin', descriptionVerbose: 'south, along the thinning edge where something angular shows through the trees' },
      west: {
        destination: 'coast_01_sea_cliff',
        descriptionVerbose: 'west — the forest ends in perhaps a quarter mile. What\'s beyond it is the coast. Whether the coast is navigable, populated, or something else entirely is not in any map you\'ve seen.',
        cycleGate: 4,
        skillGate: {
          skill: 'survival',
          dc: 14,
          failMessage: 'The coastal terrain beyond the forest edge is broken and difficult. Without the right knowledge of the terrain, pushing forward risks getting pinned against the sea cliff. You pull back.',
        },
      },
    },
    items: ['lore_precollapse_survey'],
    enemies: [],
    npcs: [],
    extras: [
      {
        keywords: ['salt', 'smell', 'sea', 'ocean', 'air'],
        description: 'The salt in the air is real — not the mineral salt of dry lowland dust but marine salt, the compound of ocean spray carried on prevailing westerlies across however many miles of forest and terrain. You breathe it deliberately, the way you\'ve learned to breathe good things deliberately, because good things end. The smell says the sea is closer than any surviving map indicates. The maps were made before and the coast has its own timeline.',
      },
      {
        keywords: ['survey', 'document', 'usda', 'boundary', 'marker'],
        description: 'The USDA Forest Service document pinned to the tree is a coastal boundary marker — the administrative edge of the San Juan National Forest, circa 2019. The printed text details what\'s outside the boundary: "unincorporated coastal parcels, private land, coastal highway right-of-way." Private land. Coastal highway. Those categories no longer have legal content. What they describe still exists, presumably, in some physical form. What form is the question.',
        skillCheck: { skill: 'lore', dc: 9, successAppend: 'The boundary coordinates on the marker locate you precisely — you\'re approximately two miles from the coast road, which by now is either impassable, reclaimed by vegetation, or both. If any pre-Collapse coastal infrastructure survived — roads, structures, habitation — it would be off every post-Collapse map because no one has come this far to check. No faction has territory this far west. The coast is genuinely unknown.' },
      },
      {
        keywords: ['trees', 'thin', 'open', 'light', 'edge'],
        description: 'The transition from old growth to coastal scrub happens over about three hundred yards — a gradient, not a line. The trees get younger as you move west: the old growth runs out of whatever condition it needs and gives way to smaller, more recent growth. Second-growth, maybe, or post-fire regrowth from before the Collapse. The undergrowth is denser here, low shrubs you don\'t recognize from the alpine zone. New plants for a new elevation. The ecosystem is doing what it does.',
      },
      {
        keywords: ['beyond', 'coast', 'west', 'unknown', 'question'],
        description: 'The question that brings lore-seekers to the Pine Sea: what\'s past the forest? The hermit has been to the forest edge and back. They didn\'t say what they saw there. The survey document ends at the administrative boundary. Your own knowledge ends here, at the tree line, with the salt in the air and the light in the west. Every faction has a story about the coast — the Drifters say there are boats, the Kindling say there\'s a signal station, the Reclaimers say there\'s infrastructure worth salvaging. The stories contradict each other. None of them come from someone who\'s actually been.',
        skillCheck: { skill: 'lore', dc: 11, successAppend: 'There is one consistent thread in all the coastal stories: the people who went looking didn\'t come back in a way that ended the question. They came back changed, or they sent word back, or they simply dropped out of the Drifter networks — not dead, just gone west. Seven years of the Collapse rearranges where people want to be. The coast may simply be where some people went when they decided that everything east of it was something they were done with.' },
      },
    ],
    hollowEncounter: {
      baseChance: 0.10,
      timeModifier: { day: 0.6, night: 1.4, dawn: 0.8, dusk: 1.1 },
      threatPool: [
        { type: 'shuffler', weight: 60, quantity: { min: 1, max: 2, distribution: 'weighted_low' } },
        { type: 'remnant', weight: 30, quantity: { min: 1, max: 1, distribution: 'single' } },
        { type: 'screamer', weight: 10, quantity: { min: 1, max: 1, distribution: 'single' } },
      ],
      awarenessRoll: { unaware: 0.5, awarePassive: 0.35, awareAggressive: 0.15 },
    },
    itemSpawns: [
      {
        entityId: 'lore_precollapse_survey',
        spawnChance: 0.80,
        quantity: { min: 1, max: 1, distribution: 'single' },
        conditionRoll: { min: 0.6, max: 0.95 },
        groundDescription: 'A document in a waterproof map case is pinned to a large pine with a rusted nail.',
        depletion: { cooldownMinutes: { min: 720, max: 1440 }, respawnChance: 0.0 },
      },
    ],
    environmentalRolls: {
      ambientSoundPool: {
        day: [
          { sound: 'The wind from the west carries the salt smell in pulses — present, then absent, then present again.', weight: 3 },
          { sound: 'A gull, somewhere west, calling once. Then nothing.', weight: 2 },
          { sound: null, weight: 2 },
        ],
        night: [
          { sound: 'The sea sound is clearer at night. You can hear it if you listen. You listen.', weight: 3 },
          { sound: null, weight: 2 },
        ],
        dawn: [
          { sound: 'The onshore breeze at dawn is the strongest wind you\'ve felt since the mountains. It smells like the world is larger than you\'ve been living in.', weight: 4 },
          { sound: null, weight: 1 },
        ],
      },
      ambientCount: { min: 1, max: 2, distribution: 'flat' },
      flavorLines: [
        { line: 'The salt smell is stronger now. The coast is close enough to pull at you.', chance: 0.30, time: null },
        { line: 'You think about the Drifter stories. You think about the people who went west and didn\'t come back east.', chance: 0.20, time: null },
      ],
    },
    narrativeNotes: 'The liminal edge room — the literal boundary of the known world. The west exit to coast_01_sea_cliff is Cycle 4 and skill-gated to control pacing into the next zone. The lore items and extras plant seeds for coastal zone content. The tone is wonder tinged with vertigo: this is as far as anyone has been, and what\'s past it is genuinely open.',
  },

  // ============================================================
  // ps_13 through ps_20 — Pine Sea expansion
  // ============================================================

  {
    id: 'ps_13_fungal_hollow',
    name: 'The Fungal Hollow',
    zone: 'the_pine_sea',
    act: 2,
    difficulty: 2,
    visited: false,
    flags: { scavengingZone: true },
    cycleGate: 2,
    description: 'The logging road descends into a depression where the canopy closes like a lid and the air changes from pine to something older and wetter. The hollow is a bowl of rotting timber and deep duff, the accumulated deadfall of decades composting in a microclimate that holds moisture the surrounding forest doesn\'t. Every horizontal surface carries fungus: shelf brackets in overlapping tiers on standing deadwood, morels pushing through the duff in dark clusters, and something luminescent — faintly, greenly — growing in the crevices of a nurse log the size of a truck. The smell is not unpleasant. It is the specific smell of a world disassembling itself into components that will become something else.',
    descriptionNight: 'At night the bioluminescent fungi glow with enough conviction to cast shadows. Green-white, cold, the light of organisms that have never needed the sun and don\'t miss it. You navigate by it. It is enough. It is also deeply, specifically wrong — the color is too close to the CHARON-7 luminescence you\'ve seen in the lowlands. Whether that connection is real or your pattern recognition is overworking itself is a question you carry out of the hollow.',
    shortDescription: 'Rotting timber hollow. Bioluminescent fungi. Wet and strange.',
    exits: { south: 'ps_03_loggers_cabin', north: 'ps_14_still_creek' },
    richExits: {
      south: { destination: 'ps_03_loggers_cabin', descriptionVerbose: 'south, back up to the cabin and the logging road' },
      north: { destination: 'ps_14_still_creek', descriptionVerbose: 'north, where the depression flattens and water collects' },
    },
    items: [],
    enemies: [],
    npcs: [],
    itemSpawns: [
      {
        entityId: 'chemicals_basic',
        spawnChance: 0.35,
        quantity: { min: 1, max: 1, distribution: 'single' },
        conditionRoll: { min: 0.4, max: 0.7 },
        groundDescription: 'A glass jar of something chemical is half-buried in the duff near the nurse log, left by a previous visitor.',
        depletion: { cooldownMinutes: { min: 180, max: 360 }, respawnChance: 0.25 },
      },
    ],
    extras: [
      {
        keywords: ['fungi', 'mushrooms', 'luminescent', 'glow', 'bioluminescent'],
        description: 'The luminescent growth on the nurse log is not a species you can place. It has the structural form of a bracket fungus but the bioluminescence is unusual for the elevation and latitude — green-spectrum light emission at this intensity typically means a chemical substrate in the wood. The nurse log is old enough that whatever chemical reached it did so through the soil, years ago, from a source uphill or upstream. You file this away. The pattern is not conclusive. The pattern is not nothing.',
        skillCheck: { skill: 'survival', dc: 10, successAppend: 'The luminescence follows the root paths of the nurse log\'s original tree — the mycelium has colonized the dead root network and the glow traces it underground like a map of something buried. The chemical substrate is consistent with trace concentrations of compounds you\'ve seen in CHARON-7 documentation. Not the virus itself. The industrial byproducts of whatever process created it, leached into the watershed from the Scar site over seven years.' },
      },
      {
        keywords: ['nurse log', 'deadfall', 'timber', 'rot'],
        description: 'The nurse log is a Douglas fir that fell perhaps thirty years ago — the size and decomposition state suggest a pre-Collapse windthrow event. It has been feeding the hollow\'s ecosystem since before the world ended: seedlings rooted in its bark, moss blanketing its upper surface, the fungal colony inside converting cellulose to soil at the patient speed of chemistry. Something fell. Everything else grew from it. You recognize the metaphor. You\'re standing in it.',
      },
      {
        keywords: ['morels', 'edible', 'food', 'forage'],
        description: 'The morels are legitimate — Morchella elata, black morels, the prize of any forager who knows what they\'re looking for. A dozen clusters within easy reach. Dried, they\'re a trade commodity at any settlement. Fresh, they\'re the best meal you\'ll have in the Pine Sea. The ecosystem here produces them reliably, which means the hollow\'s chemistry is stable and the moisture consistent. Someone has been harvesting here: a few stems show clean cuts from a knife rather than the ragged pull of animal foraging.',
        skillCheck: { skill: 'survival', dc: 8, successAppend: 'The harvest cuts are recent — within the week. Someone who knows this place comes regularly. The cutting pattern leaves the mycelium intact, which is correct practice and suggests a forager who plans to return. The hermit, probably, or someone the hermit taught.' },
      },
      {
        keywords: ['air', 'smell', 'wet', 'moisture'],
        description: 'The air in the hollow is ten degrees cooler than the surrounding forest and saturated with moisture — a microclimate created by the depression\'s geometry and the canopy closure overhead. Your lungs register the difference immediately. The humidity carries spore, pollen, the volatile compounds of active decomposition. Not decay. Transformation. The distinction matters to the organisms doing it.',
      },
    ],
    hollowEncounter: {
      baseChance: 0.07,
      timeModifier: { day: 0.4, night: 1.4, dawn: 0.6, dusk: 1.0 },
      threatPool: [
        { type: 'shuffler', weight: 75, quantity: { min: 1, max: 2, distribution: 'weighted_low' } },
        { type: 'remnant', weight: 25, quantity: { min: 1, max: 1, distribution: 'single' } },
      ],
      awarenessRoll: { unaware: 0.6, awarePassive: 0.3, awareAggressive: 0.1 },
    },
    environmentalRolls: {
      ambientSoundPool: {
        day: [
          { sound: 'Water drips from somewhere in the canopy into the duff with irregular rhythm.', weight: 3 },
          { sound: 'A woodpecker works a standing snag — three quick strikes, then silence.', weight: 2 },
          { sound: null, weight: 2 },
        ],
        night: [
          { sound: 'The fungi glow. You watch it pulse, faintly, on a cycle you can almost count.', weight: 3 },
          { sound: null, weight: 2 },
        ],
      },
      ambientCount: { min: 1, max: 2, distribution: 'flat' },
    },
    narrativeNotes: 'Transitional room between the cabin and the creek. The bioluminescent fungi connect thematically to CHARON-7 contamination in the watershed without confirming it — the ambiguity is deliberate. Scavenging zone for chemicals and foraged food. The morel detail rewards survival investment.',
  },

  {
    id: 'ps_14_still_creek',
    name: 'The Still Creek',
    zone: 'the_pine_sea',
    act: 2,
    difficulty: 2,
    visited: false,
    flags: { waterSource: true, campfireAllowed: true },
    cycleGate: 2,
    description: 'The depression bottoms out at a creek that has stopped moving. Not dammed — there\'s no structure — but the gradient is so flat here that the water has spread into a wide, shallow pool no deeper than your shin, the surface unbroken by current, reflecting the canopy above with a fidelity that makes you look down and see the sky. The creek bed is gravel and sand, the water tea-dark from tannins, cold from altitude. Something has been drinking here: elk tracks in the soft margin, and something else — a handprint in the mud at the water\'s edge, five-fingered, pressed deep, the fingers too long. It is three days old. You drink upstream of it.',
    descriptionNight: 'At night the still creek is a mirror laid flat in the forest — stars reflected in water that does not move, the boundary between air and surface invisible until your boot breaks it. The handprint at the margin is not visible in this light. The thing that left it could be anywhere in the dark around you, or nowhere. Both possibilities occupy the same space.',
    shortDescription: 'Shallow creek pool. Elk tracks. A handprint that is wrong.',
    exits: { south: 'ps_13_fungal_hollow', west: 'ps_15_collapsed_fire_tower' },
    richExits: {
      south: { destination: 'ps_13_fungal_hollow', descriptionVerbose: 'south, back up through the fungal hollow' },
      west: { destination: 'ps_15_collapsed_fire_tower', descriptionVerbose: 'west, where the ground rises and something metal shows above the tree line' },
    },
    items: [],
    enemies: [],
    npcs: [],
    extras: [
      {
        keywords: ['handprint', 'print', 'hand', 'mud', 'fingers'],
        description: 'The handprint is five-fingered, human in structure, wrong in proportion. The fingers are approximately twenty percent longer than they should be for the palm width. The press depth is consistent with significant weight — more than a human hand would exert when drinking. The mud has preserved it well: three days old, based on the drying pattern and the insect activity at the edge. Whatever made it was here recently enough to make recently a word with consequences.',
        skillCheck: { skill: 'tracking', dc: 11, successAppend: 'The print belongs to a Hollow — a long-duration variant whose skeletal structure has been modified by years of CHARON-7 activity. The elongated fingers are consistent with the deep-forest remnants the hermit has mentioned: Hollow that have been in the Pine Sea since the first year of the Collapse, changing slowly, adapting to the terrain the way the fungi adapted to the nurse log. Not aggressive by default. Not safe by any definition you trust.' },
      },
      {
        keywords: ['water', 'creek', 'drink', 'pool', 'surface'],
        description: 'The water is cold and tannin-dark and, upstream of the handprint, safe by every field test you can run. You cup it and drink. The taste is clean with the specific mineral signature of snowmelt that has traveled through granite — iron, calcium, the faintest sweet finish. You drink more than you need to because it is good and because good things should be consumed completely when they present themselves.',
      },
      {
        keywords: ['elk', 'tracks', 'animals', 'margin'],
        description: 'The elk tracks are fresh — this morning\'s water visit, based on the sharpness of the hoof edges in the mud. A cow and calf, the calf\'s smaller prints overlapping the mother\'s in places. They came from the north, drank, left heading east. The herd uses this water regularly. The handprint doesn\'t seem to have deterred them, which is either reassuring or means the elk have made a decision about the thing that left it that you haven\'t reached yet.',
        skillCheck: { skill: 'tracking', dc: 9, successAppend: 'The elk tracks show no fear response — no skidding, no sudden direction changes. Whatever left the handprint, the elk don\'t register it as a predator. That is unusual. Hollow typically trigger a flight response in ungulates. Either this Hollow has been here long enough to stop being perceived as a threat, or it has changed enough to stop being one. Neither explanation is comfortable.' },
      },
      {
        keywords: ['reflection', 'mirror', 'sky', 'surface'],
        description: 'The still water holds the canopy reflection with photographic precision — every branch, every needle cluster, the gaps where sky shows through. You look down and see the forest from below, inverted, complete. The effect is disorienting in a way that has nothing to do with danger: it is the disorientation of beauty in a world that has mostly stopped producing it on purpose. The beauty here is accidental, which makes it more reliable.',
      },
    ],
    hollowEncounter: {
      baseChance: 0.10,
      timeModifier: { day: 0.5, night: 1.6, dawn: 0.7, dusk: 1.2 },
      threatPool: [
        { type: 'remnant', weight: 50, quantity: { min: 1, max: 1, distribution: 'single' } },
        { type: 'shuffler', weight: 40, quantity: { min: 1, max: 2, distribution: 'weighted_low' } },
        { type: 'whisperer', weight: 10, quantity: { min: 1, max: 1, distribution: 'single' } },
      ],
      awarenessRoll: { unaware: 0.5, awarePassive: 0.35, awareAggressive: 0.15 },
    },
    environmentalRolls: {
      ambientSoundPool: {
        day: [
          { sound: 'A dipper bird walks the creek bottom, fully submerged, hunting.', weight: 2 },
          { sound: 'The water does not move. Nothing moves.', weight: 3 },
          { sound: null, weight: 2 },
        ],
        night: [
          { sound: 'Something drinks at the far end of the pool. You hear it but cannot see it.', weight: 2 },
          { sound: null, weight: 3 },
        ],
      },
      ambientCount: { min: 1, max: 2, distribution: 'flat' },
      flavorLines: [
        { line: 'The reflection in the water is so precise that for a moment you mistake down for up.', chance: 0.25, time: ['day', 'dawn'] },
        { line: 'You notice the handprint again. You notice it differently this time.', chance: 0.20, time: null },
      ],
    },
    narrativeNotes: 'Water source with atmospheric dread. The handprint is the room\'s thesis: something is in this forest that doesn\'t match any category the player has. The elk not fearing it complicates the expected reaction. The whisperer in the spawn pool aligns with the forest\'s deep-Hollow population.',
  },

  {
    id: 'ps_15_collapsed_fire_tower',
    name: 'The Collapsed Fire Tower',
    zone: 'the_pine_sea',
    act: 2,
    difficulty: 3,
    visited: false,
    flags: { scavengingZone: true },
    cycleGate: 2,
    description: 'The forest service fire tower fell sometime in the first winter after the Collapse — wind load on an unmaintained structure, the bolts corroding in the mountain weather without anyone to check them. The cab landed forty feet from the base, intact enough to recognize: windows shattered, the instrument panel face-down in the duff, the radio still mounted in its bracket. The steel lattice tower itself is a tangle of bent struts and guy wire, half-buried in seven years of needle fall. From the rubble you can see the stump of the platform where someone once sat and watched for smoke across ten thousand acres of forest. The forest grew past the tower. The tower fell. That is how those stories end.',
    descriptionNight: 'At night the collapsed tower is geometry in the dark — angles that don\'t belong in a forest, the straight lines of steel against the organic curves of everything else. The cab is a shadow within shadows. If you brought a light you\'d see what the instrument panel says. You\'re not sure you want to read it.',
    shortDescription: 'Collapsed forest service fire tower. Scavengeable.',
    exits: { east: 'ps_06_shepherds_camp', south: 'ps_14_still_creek' },
    richExits: {
      east: { destination: 'ps_06_shepherds_camp', descriptionVerbose: 'east, downhill toward the hermit\'s camp' },
      south: { destination: 'ps_14_still_creek', descriptionVerbose: 'south, descending toward the still creek' },
    },
    items: [],
    enemies: ['shuffler'],
    npcs: [],
    itemSpawns: [
      {
        entityId: 'electronics_salvage',
        spawnChance: 0.50,
        quantity: { min: 1, max: 2, distribution: 'weighted_low' },
        conditionRoll: { min: 0.2, max: 0.6 },
        groundDescription: 'Circuit boards and wiring are exposed in the wreckage of the cab\'s instrument panel.',
        depletion: { cooldownMinutes: { min: 360, max: 720 }, respawnChance: 0.15 },
      },
      {
        entityId: 'wire_coil',
        spawnChance: 0.40,
        quantity: { min: 1, max: 1, distribution: 'single' },
        conditionRoll: { min: 0.3, max: 0.7 },
        groundDescription: 'A length of guy wire can be cut free from the collapsed lattice.',
      },
      {
        entityId: 'scrap_metal',
        spawnChance: 0.60,
        quantity: { min: 1, max: 3, distribution: 'bell' },
        groundDescription: 'Usable steel from the tower\'s lattice structure.',
      },
    ],
    extras: [
      {
        keywords: ['cab', 'cabin', 'instrument', 'panel', 'radio'],
        description: 'The fire lookout cab is crumpled but recognizable — a ten-by-ten wooden room with windows on all four sides, the Osborne Fire Finder still bolted to the central pedestal though the pedestal is now horizontal. The radio is a USFS-standard VHF unit, the handset still in its cradle. The last log entry, written in grease pencil on a slate board that survived the fall: "Sept 14 2031. Smoke visible all quadrants. No response from dispatch. No response from anyone. Closing the tower. God help us all." The entry is signed with initials you can\'t read.',
        skillCheck: { skill: 'electronics', dc: 10, successAppend: 'The VHF radio is damaged but the components are salvageable — the crystal oscillator is intact, which is the expensive part. A Reclaimer or anyone with radio knowledge could use it to build a field-operable VHF set. The frequency it\'s tuned to is not the standard forest service channel. Someone changed it before they left. The new frequency is in the range the MERIDIAN signal broadcasts on.' },
      },
      {
        keywords: ['tower', 'lattice', 'steel', 'structure', 'collapsed'],
        description: 'The tower was a standard forty-foot steel lattice lookout — the kind the CCC built in the 1930s and the Forest Service maintained until funding ran out, which happened before the Collapse and was therefore not the tower\'s fault. The collapse pattern is consistent with wind shear on corroded bolts: the northeast legs gave first, the tower folded southwest, the cab separated on impact. Structural forensics at the end of the world. You\'re reading the corpse of a building.',
      },
      {
        keywords: ['log', 'entry', 'slate', 'last', 'message'],
        description: 'The slate board with the final log entry is cracked but legible. "Sept 14 2031. Smoke visible all quadrants." The fires in the first weeks of the Collapse were everywhere — infrastructure burning without response, wildfire burning without suppression, the whole system of fire management collapsing along with everything else. The lookout saw it from the best vantage point in the Pine Sea: every direction, smoke. No one answering the radio. The decision to leave was correct. The decision to write it down first was something else — a refusal to let the last human act at this station be silent.',
        skillCheck: { skill: 'lore', dc: 9, successAppend: 'The date is significant: September 14, 2031 — three weeks after Patient Zero in the Four Corners region. The Collapse was already in full cascade by then: FEMA overwhelmed, National Guard redeployed, civilian infrastructure failing. The lookout would have seen the fires and known, from the silence on the radio, that no one was coming. The initials on the entry might match Forest Service personnel records if anyone still had those records. Lev might.' },
      },
      {
        keywords: ['view', 'vista', 'overlook', 'clearing'],
        description: 'The tower\'s elevated position, even at ground level, provides a partial vista through the gap the collapse tore in the canopy. To the east: the upper forest, the shepherd\'s camp smoke visible on clear days. To the west: the ridge where the trees thin toward the coast. To the north: the dark mass of the old growth. The lookout chose this site because it sees everything. The tower fell but the sight lines remain. The forest is already closing the gap — young trees are growing in the light the collapse admitted. In another decade the vista will be gone.',
      },
    ],
    hollowEncounter: {
      baseChance: 0.12,
      timeModifier: { day: 0.6, night: 1.5, dawn: 0.8, dusk: 1.2 },
      threatPool: [
        { type: 'shuffler', weight: 65, quantity: { min: 1, max: 2, distribution: 'weighted_low' } },
        { type: 'remnant', weight: 35, quantity: { min: 1, max: 1, distribution: 'single' } },
      ],
      awarenessRoll: { unaware: 0.5, awarePassive: 0.35, awareAggressive: 0.15 },
    },
    environmentalRolls: {
      flavorLines: [
        { line: 'Wind catches a loose panel on the cab and it creaks — a sound like a door opening that never opens.', chance: 0.30, time: null },
        { line: 'The grease pencil entry catches the light through the broken window. You read it again without meaning to.', chance: 0.20, time: ['day'] },
      ],
    },
    narrativeNotes: 'Scavenging location with strong emotional weight. The final log entry is the room\'s core — a person recording the end of the world from the best seat in the house. The radio tuned to the MERIDIAN frequency is a lore breadcrumb. Electronics skill check rewards Reclaimer-aligned players.',
  },

  {
    id: 'ps_16_spore_field',
    name: 'The Spore Field',
    zone: 'the_pine_sea',
    act: 3,
    difficulty: 3,
    visited: false,
    flags: { scavengingZone: false },
    cycleGate: 3,
    description: 'East of the bone grove the forest floor is carpeted in something that is not moss and not lichen and not any groundcover you have a category for. It grows in radiating patterns from the base of every tree, pale grey-green, soft to the touch with a texture like wet paper. When you step on it the surface gives slightly and releases a puff of white particulate that hangs in the still air for ten seconds before settling. Spores, presumably. The trees here are alive but changed — the bark has a mottled quality, lighter in patches, as if something is growing under the surface. The air tastes like cold metal. Nothing is moving. The absence of movement is the most notable thing about this place: no birds, no insects, no wind in the branches. A silence that is different from the old growth\'s silence. This is the silence of something that has already happened.',
    descriptionNight: 'At night the spore field is faintly luminescent — the same green-spectrum glow as the fungal hollow, but broader, more diffuse, covering the forest floor like a second sky beneath the canopy. You walk through it and your footprints glow behind you, the crushed organisms emitting light as they die. The trail you leave is visible for minutes. Anything following you would not need to track.',
    shortDescription: 'Strange groundcover. Spores. No wildlife. Contamination zone.',
    exits: { west: 'ps_11_bone_grove', north: 'ps_17_quarantine_camp' },
    richExits: {
      west: { destination: 'ps_11_bone_grove', descriptionVerbose: 'west, back toward the bone grove and the old growth' },
      north: { destination: 'ps_17_quarantine_camp', descriptionVerbose: 'north, where something has been built among the affected trees' },
    },
    items: [],
    enemies: [],
    npcs: [],
    extras: [
      {
        keywords: ['spores', 'particulate', 'puff', 'white', 'air'],
        description: 'The particulate released by the groundcover when compressed hangs in the air with unnatural persistence — ten seconds, sometimes longer, the white particles catching whatever light filters through the canopy. Your breathing instinct tells you to cover your mouth. Your rational mind tells you that if the spores were immediately dangerous you\'d have known by now. Both responses have merit. Neither feels adequate.',
        skillCheck: { skill: 'field_medicine', dc: 12, successAppend: 'The particulate is biological — spore bodies, consistent with a fungal organism, but the cellular structure under close inspection is not standard. The spore walls are reinforced with a protein matrix you\'ve seen described in Reclaimer documentation on CHARON-7 secondary effects: the virus doesn\'t just affect animals. It affects the fungal networks they share ecosystems with. This groundcover is a fungal colony that has been modified by the same agent that created the Hollow. You are breathing it. The concentration is low. You should not stay long.' },
      },
      {
        keywords: ['trees', 'bark', 'mottled', 'changed', 'patches'],
        description: 'The lighter patches on the bark are growing from within — not surface growth but something that has colonized the cambium layer, the living tissue under the bark. The trees are alive by every external indicator: green needles, structural integrity, seasonal growth rings visible at a broken branch. But something inside them has changed. The patches follow the tree\'s vascular system, rising in vertical lines like veins made visible.',
        skillCheck: { skill: 'survival', dc: 11, successAppend: 'The modified trees are still photosynthesizing, still growing, still functioning as trees. But the fungal symbiont in their root systems — the mycorrhizal network every pine depends on — has been replaced by whatever this organism is. The trees haven\'t died because the replacement organism is performing the same function. Better, possibly. The trees here are growing faster than their neighbors outside the spore field. Something is feeding them.' },
      },
      {
        keywords: ['silence', 'quiet', 'no birds', 'no insects', 'empty'],
        description: 'The absence of animal life is total and precise. You stand still and listen: no birdsong, no insect hum, no rustle in the undergrowth. The forest here supports trees and the groundcover and nothing between. The food web has been simplified to two tiers: the fungal colony and the trees it colonizes. Everything else has left or been replaced. You are the most complex organism in this clearing and you feel it the way you feel altitude — in the body, before the mind catches up.',
      },
      {
        keywords: ['groundcover', 'carpet', 'growth', 'texture', 'floor'],
        description: 'You kneel and examine the groundcover closely. It is a single organism — or a colony behaving as one, the boundaries between individual growths invisible, the surface continuous across the forest floor. It thins at the tree bases and thickens between them. The radiating pattern suggests it grows outward from the trees, following the root networks underground, surfacing where conditions allow. The texture is uniform and vaguely organic in a way that resists further description. It is the texture of something that is not finished becoming what it will be.',
      },
    ],
    hollowEncounter: {
      baseChance: 0.15,
      timeModifier: { day: 0.7, night: 1.6, dawn: 0.9, dusk: 1.3 },
      threatPool: [
        { type: 'remnant', weight: 50, quantity: { min: 1, max: 2, distribution: 'weighted_low' } },
        { type: 'whisperer', weight: 30, quantity: { min: 1, max: 1, distribution: 'single' } },
        { type: 'shuffler', weight: 20, quantity: { min: 1, max: 2, distribution: 'weighted_low' } },
      ],
      awarenessRoll: { unaware: 0.3, awarePassive: 0.4, awareAggressive: 0.3 },
      noiseModifier: -0.2,
    },
    environmentalRolls: {
      flavorLines: [
        { line: 'You step and the spores rise. You breathe and they enter. The transaction is simple.', chance: 0.30, time: null },
        { line: 'Your footprints glow behind you. The trail is very clear. You walk faster.', chance: 0.25, time: ['night', 'dusk'] },
        { line: 'The silence here is not the absence of sound. It is the presence of listening.', chance: 0.20, time: null },
      ],
    },
    narrativeNotes: 'The spore field is the Pine Sea\'s contamination reveal — CHARON-7 isn\'t just affecting humans and animals. It\'s in the fungal networks, which means it\'s in the trees, which means it\'s in the entire forest ecosystem. The field_medicine check is the key revelation. Higher difficulty and encounter rates signal danger. The luminescent footprints at night are a specific tactical concern for stealth-focused players.',
  },

  {
    id: 'ps_17_quarantine_camp',
    name: 'The Quarantine Camp',
    zone: 'the_pine_sea',
    act: 3,
    difficulty: 3,
    visited: false,
    flags: { scavengingZone: true },
    cycleGate: 3,
    description: 'Someone tried to study this. The camp is pre-Collapse scientific — you can tell from the equipment grade and the systematic layout: four tents in a line, a sample collection station with labeled containers, a weather station on a tripod, all of it wrapped in orange BIOHAZARD tape that has faded to the color of old skin. The team left in a hurry. Tent three is collapsed, its stakes pulled, the fabric torn on one side. Tent four is still standing, sealed, the zipper closed from outside. Inside tent four: nothing living. A cot, a sleeping bag, a personal effects bag, and a notebook. The notebook is the reason you came in. The notebook is the reason the team left.',
    descriptionNight: 'At night the quarantine camp is a geometry of failed containment — the orange tape catches your light source and throws it back in warning colors that no longer warn anyone. Tent four\'s sealed zipper reflects a small point of light. You think about what\'s inside the tent. You think about who sealed it from outside.',
    shortDescription: 'Abandoned research camp. Biohazard tape. A sealed tent.',
    exits: { south: 'ps_16_spore_field', east: 'ps_18_root_cathedral' },
    richExits: {
      south: { destination: 'ps_16_spore_field', descriptionVerbose: 'south, back through the spore field' },
      east: { destination: 'ps_18_root_cathedral', descriptionVerbose: 'east, where the affected trees grow larger and the canopy closes again' },
    },
    items: [],
    enemies: ['remnant'],
    npcs: [],
    itemSpawns: [
      {
        entityId: 'bandages',
        spawnChance: 0.55,
        quantity: { min: 1, max: 2, distribution: 'flat' },
        conditionRoll: { min: 0.6, max: 0.9 },
        groundDescription: 'Medical supplies are scattered in the sample collection station.',
        depletion: { cooldownMinutes: { min: 240, max: 480 }, respawnChance: 0.20 },
      },
      {
        entityId: 'chemicals_basic',
        spawnChance: 0.45,
        quantity: { min: 1, max: 1, distribution: 'single' },
        conditionRoll: { min: 0.5, max: 0.8 },
        groundDescription: 'Sealed sample containers with preserved reagents sit in a rack at the collection station.',
      },
    ],
    extras: [
      {
        keywords: ['notebook', 'research', 'notes', 'tent four', 'sealed'],
        description: 'The notebook is a field research journal, USDA Forest Service/CDC joint header. The entries span six days in October 2031 — three weeks after the Collapse. The team was studying the fungal anomaly: growth rates, spore analysis, soil chemistry. Day four\'s entry changes tone: "Sample 14 shows protein structures consistent with Dr. Osei\'s CHARON-7 secondary vector model. The fungal network is carrying the virus. Not the virus itself — a modified instruction set, delivered by spore. The forest is the vector." Day six, the final entry, is one sentence: "Torres is symptomatic. Sealing tent four. Evacuating."',
        skillCheck: { skill: 'lore', dc: 11, successAppend: 'Dr. Osei — the name appears in Lucid faction communications. She\'s alive, or was recently. The CDC/USDA joint team was studying CHARON-7 environmental spread before the institutional collapse made that impossible. Their data confirms what the Reclaimers suspect: the virus has entered the fungal ecology. The Pine Sea isn\'t just a forest. It\'s a delivery system. The spores you\'ve been breathing are carrying modified instructions into every organism they contact. Including you.' },
      },
      {
        keywords: ['tents', 'camp', 'equipment', 'station', 'biohazard'],
        description: 'The camp was professional — four-season expedition tents, hardened sample cases, a portable spectrometer in a pelican case that still powers on. The biohazard tape was applied after the team arrived, which means they didn\'t know what they were walking into until they were in it. The sample collection station has twenty-four numbered slots. Eighteen are filled. Six are empty — either unused or taken when the team evacuated. They took the most important samples with them. What they left behind was important enough to catalog but not important enough to carry.',
        skillCheck: { skill: 'scavenging', dc: 10, successAppend: 'The spectrometer still has cached readings. The last analysis: a spore sample showing a protein shell that matches CHARON-7\'s outer envelope structure but with a modified receptor binding domain. The virus has been adapted — by evolution or by design — to use fungal spores as a secondary transmission vector. Airborne. Persistent. Already in the watershed. The data is worth significant trade value to the Reclaimers or anyone studying the infection.' },
      },
      {
        keywords: ['Torres', 'symptomatic', 'person', 'cot', 'sleeping bag'],
        description: 'Torres. The cot in tent four is undisturbed — the sleeping bag is zipped, the personal effects bag is beside it, a pair of boots sits at the foot of the cot with the laces tucked inside the way a careful person stores them. Torres was careful. Torres went to sleep and woke up wrong and the team sealed the tent and left. The zipper is closed from outside. Seven years of sealed air. You stand outside the tent and think about opening it and decide that knowing what happened to Torres will not help you and knowing that you chose not to look will not stop mattering.',
      },
      {
        keywords: ['weather station', 'tripod', 'instruments', 'data'],
        description: 'The weather station is a standard automated unit — temperature, humidity, wind speed, barometric pressure — running on a solar panel that has kept it operational for seven years. The data logger is full. Seven years of continuous weather data from the Pine Sea interior, recorded by a machine that doesn\'t know its operators never came back for it. The data has value: climate patterns, seasonal shifts, the empirical record of a post-Collapse forest. The machine doesn\'t know the value of what it\'s holding. It just kept measuring.',
      },
      {
        keywords: ['tape', 'orange', 'biohazard', 'warning'],
        description: 'The biohazard tape is standard CDC-issue, the BIOHAZARD trefoil printed in repeating sequence. It has faded from seven years of UV exposure but the color is still recognizable — the specific orange that means don\'t touch this, don\'t breathe this, don\'t be here. The tape was applied around the entire camp perimeter, which means the team considered the whole site contaminated. You are inside the perimeter. You have been inside the perimeter since you entered the spore field.',
      },
    ],
    hollowEncounter: {
      baseChance: 0.14,
      timeModifier: { day: 0.7, night: 1.5, dawn: 0.8, dusk: 1.2 },
      threatPool: [
        { type: 'remnant', weight: 55, quantity: { min: 1, max: 2, distribution: 'weighted_low' } },
        { type: 'shuffler', weight: 30, quantity: { min: 1, max: 2, distribution: 'weighted_low' } },
        { type: 'whisperer', weight: 15, quantity: { min: 1, max: 1, distribution: 'single' } },
      ],
      awarenessRoll: { unaware: 0.35, awarePassive: 0.4, awareAggressive: 0.25 },
    },
    narrativeNotes: 'The quarantine camp is the Pine Sea\'s lore payoff room — the CDC/USDA notebook confirms that CHARON-7 has entered the forest ecology. Dr. Osei\'s name connects to the Lucid faction. Torres in the sealed tent is a moral/emotional beat: do you look? The five extras are justified by the room\'s narrative density. The spectrometer data is a trade-value item for Reclaimer-aligned players.',
  },

  {
    id: 'ps_18_root_cathedral',
    name: 'The Root Cathedral',
    zone: 'the_pine_sea',
    act: 3,
    difficulty: 3,
    visited: false,
    flags: { dark: true, noCombat: false },
    cycleGate: 3,
    description: 'The trees here have done something that trees should not do. Their root systems, massive and surface-exposed on the thin mountain soil, have grown upward — arching from the ground in buttresses that meet overhead, creating a vaulted space beneath them that reads, unmistakably, as architecture. The ceiling is living wood. The pillars are roots. The floor is the compressed earth between them, worn smooth by water and time and something that has been walking here regularly enough to polish the stone beneath the soil. The space is perhaps forty feet across and twenty feet high at the center, the light filtering through gaps in the root canopy in shafts that move as the wind moves the trees above. It looks like a cathedral. It feels like a cathedral. You are aware that this is a projection — your pattern recognition finding human meaning in biological structure — and you are equally aware that the awareness does not diminish the effect.',
    descriptionNight: 'At night the root cathedral is the darkest space in the Pine Sea — the interlocking roots above admit no light at all, the darkness total, the acoustics changed by the enclosed space so that your own breathing returns to you with a half-second delay. You hear your heartbeat. You hear the roots above you creaking with the wind in the canopy. You hear something else — a low, sustained vibration, felt more than heard, coming from the ground beneath your feet. The roots are conducting sound from somewhere underground.',
    shortDescription: 'Root structures forming a vaulted space. Cathedral geometry. Something underneath.',
    exits: { west: 'ps_17_quarantine_camp', south: 'ps_20_hollow_nest' },
    richExits: {
      west: { destination: 'ps_17_quarantine_camp', descriptionVerbose: 'west, back through the affected zone toward the quarantine camp' },
      south: {
        destination: 'ps_20_hollow_nest',
        descriptionVerbose: 'south, down through a gap in the root floor where something has been descending regularly',
        skillGate: {
          skill: 'stealth',
          dc: 12,
          failMessage: 'The gap narrows and the darkness below it is complete. Something moves in the dark — something aware of you. You pull back before it becomes aware that you\'re aware of it.',
        },
      },
    },
    items: [],
    enemies: [],
    npcs: [],
    extras: [
      {
        keywords: ['roots', 'arch', 'vault', 'ceiling', 'structure'],
        description: 'The root architecture is not random. You trace the growth patterns: each major root follows a load-bearing trajectory, the arch geometry distributing the weight of the trees above across the vault space below. This is structural engineering performed by organisms that don\'t know engineering, and the result is more efficient than most human buildings you\'ve been in. The wood is alive and growing — the arches will continue to develop, the space will change shape over decades, the cathedral will never be finished because the builders don\'t have a blueprint. They have chemistry. That appears to be enough.',
        skillCheck: { skill: 'survival', dc: 12, successAppend: 'The root growth pattern is not typical of any documented mycorrhizal network behavior. The arching is too regular, too structurally sound, too obviously functional. Something is directing the root growth — the same modified fungal network you\'ve been walking through since the spore field. The CHARON-7 derivative in the soil isn\'t just colonizing the trees. It\'s reorganizing them. Building with them. The cathedral isn\'t an accident of biology. It\'s an act of construction by an organism that uses trees the way humans use lumber.' },
      },
      {
        keywords: ['floor', 'polished', 'worn', 'smooth', 'walking'],
        description: 'The floor of the cathedral space is stone — granite, exposed by the thin soil, polished to a dull shine by years of contact. The polish follows a path: a worn track that enters from the east, circles the center of the space, and descends through a gap in the root floor to the south. Something has been walking this circuit for years. The wear pattern is consistent with a single entity making the same journey repeatedly, the way the Hollow walk their territory routes. But the route here is circular, purposeful, almost ritualistic. You stand in the center and the wear track circles you.',
      },
      {
        keywords: ['light', 'shafts', 'gaps', 'canopy'],
        description: 'The light enters through five gaps in the root canopy — not randomly distributed but spaced with an evenness that would be intentional in a human building and is therefore either coincidental or something else entirely in an organism. The shafts of light move through the space as the sun moves, and at certain times — you can tell from the bleaching patterns on the stone — all five converge on the center of the floor. Whatever significance that has is not a significance you can assign. You note it. You note that noting it changes nothing about the fact.',
      },
      {
        keywords: ['vibration', 'sound', 'hum', 'ground', 'below'],
        description: 'You place your palm flat on the stone floor and feel it: a sustained low-frequency vibration, not rhythmic but continuous, the kind of sound that large root systems produce when they transport water at volume. Except the frequency is wrong — too low for hydraulic transport, too regular for wind stress. Something beneath the root cathedral is generating this vibration. The roots are conducting it upward the way a speaker cone conducts the signal from its coil. You are inside an instrument. You don\'t know who is playing it.',
        skillCheck: { skill: 'perception', dc: 13, successAppend: 'The vibration has a pattern you can almost resolve: a slow oscillation, perhaps a ninety-second cycle, the frequency rising and falling in a wave that your inner ear registers as something between discomfort and recognition. It is not random. It is not mechanical. It has the quality of a biological process — respiration, circulation, something metabolic — operating at a scale that doesn\'t correspond to any single organism. The root network is breathing. The entire fungal colony, connected through the forest, is breathing as one organism. You are standing on its lung.' },
      },
    ],
    hollowEncounter: {
      baseChance: 0.18,
      timeModifier: { day: 0.8, night: 1.8, dawn: 1.0, dusk: 1.4 },
      threatPool: [
        { type: 'whisperer', weight: 40, quantity: { min: 1, max: 1, distribution: 'single' } },
        { type: 'remnant', weight: 40, quantity: { min: 1, max: 2, distribution: 'weighted_low' } },
        { type: 'brute', weight: 20, quantity: { min: 1, max: 1, distribution: 'single' } },
      ],
      awarenessRoll: { unaware: 0.25, awarePassive: 0.4, awareAggressive: 0.35 },
      noiseModifier: -0.4,
    },
    environmentalRolls: {
      ambientSoundPool: {
        day: [
          { sound: 'The roots creak overhead. Settling, or growing. The distinction is academic.', weight: 3 },
          { sound: 'A shaft of light moves across the floor like a hand reaching for something.', weight: 2 },
          { sound: null, weight: 2 },
        ],
        night: [
          { sound: 'The vibration beneath you shifts frequency. Your body notices before your mind does.', weight: 3 },
          { sound: 'Absolute dark. The cathedral breathes.', weight: 2 },
          { sound: null, weight: 1 },
        ],
      },
      ambientCount: { min: 1, max: 2, distribution: 'flat' },
      flavorLines: [
        { line: 'You stand in the center of the space and the light converges on you. Coincidence, or geometry you cannot refuse.', chance: 0.20, time: ['day'] },
        { line: 'The wear track in the stone is beneath your feet. You are walking it without having decided to.', chance: 0.25, time: null },
      ],
    },
    narrativeNotes: 'The root cathedral is the Pine Sea\'s climax room for the contamination thread. The survival check reveals that CHARON-7 is not just infecting but building — using the fungal network to reorganize living trees into structures. The perception check on the vibration is the zone\'s biggest revelation: the entire forest is becoming a single organism. The south exit to the hollow nest is skill-gated to control difficulty progression.',
  },

  {
    id: 'ps_19_windbreak_ruin',
    name: 'The Windbreak Ruin',
    zone: 'the_pine_sea',
    act: 3,
    difficulty: 2,
    visited: false,
    flags: { safeRest: true, scavengingZone: true, campfireAllowed: true },
    cycleGate: 3,
    description: 'A pre-Collapse structure, partially standing — stone foundation, timber frame, the west wall intact and the east wall a memory. The building was a ranger station or a rural homestead, the distinction eroded by seven years of weather and the specific violence that mountain winters do to unheated structures. What remains is useful: the standing wall blocks the prevailing westerly wind, the stone foundation holds heat from a fire, the partial roof covers enough ground to sleep dry. Someone has been maintaining it — the debris has been cleared from the interior, a fire ring sits against the west wall where the thermal mass makes it effective, a small cache of split firewood is stacked under the surviving eave. The care is evident and anonymous. You don\'t know who. You benefit anyway.',
    descriptionNight: 'At night the windbreak ruin is warmth and shelter in the specific way that matters at altitude — the west wall stops the wind, the fire ring holds coals, the partial roof frames a rectangle of stars directly above your head. You lie down and the stars are the ceiling. The cold is outside and you are inside and the distinction between those two states is the entire definition of civilization at this elevation.',
    shortDescription: 'Ruined ranger station. Windbreak. Safe rest.',
    exits: { north: 'ps_12_coastal_approach', east: 'ps_20_hollow_nest' },
    richExits: {
      north: { destination: 'ps_12_coastal_approach', descriptionVerbose: 'north, toward the thinning forest and the salt air' },
      east: {
        destination: 'ps_20_hollow_nest',
        descriptionVerbose: 'east, into the deep forest where the trees grow wrong and the ground hums',
        skillGate: {
          skill: 'survival',
          dc: 11,
          failMessage: 'The forest east of here is dense and the undergrowth resists passage. You\'d need better knowledge of the terrain to push through safely.',
        },
      },
    },
    items: [],
    enemies: [],
    npcs: [],
    itemSpawns: [
      {
        entityId: 'emergency_rations',
        spawnChance: 0.45,
        quantity: { min: 1, max: 2, distribution: 'weighted_low' },
        conditionRoll: { min: 0.5, max: 0.85 },
        groundDescription: 'Supplies have been left in a small cache under the surviving eave.',
        depletion: { cooldownMinutes: { min: 120, max: 240 }, respawnChance: 0.30 },
      },
      {
        entityId: 'juniper_firewood',
        spawnChance: 0.70,
        quantity: { min: 1, max: 2, distribution: 'flat' },
        groundDescription: 'Split firewood is stacked against the west wall.',
      },
    ],
    extras: [
      {
        keywords: ['wall', 'stone', 'foundation', 'structure', 'building'],
        description: 'The west wall is fieldstone, dry-stacked in the old mountain style — no mortar, the stones fitted by someone who understood how gravity and friction cooperate. It has survived seven winters of freeze-thaw cycling without significant movement, which is a testament to the builder\'s craft. The timber frame above it is less fortunate: the east side has collapsed entirely, the roof joists broken at the wall plate. What remains is a half-building. In the post-Collapse, a half-building is a miracle of infrastructure.',
      },
      {
        keywords: ['fire ring', 'fire', 'coals', 'heat', 'warmth'],
        description: 'The fire ring is placed against the west wall with deliberate intelligence — the stone absorbs heat during the burn and radiates it for hours after. Whoever built this ring understood thermal mass. The ash in the ring is layered: many fires, many visitors, the same good idea repeated by different people. The most recent fire was perhaps a week ago. The coals at the bottom of the ash bed are still faintly warm when you dig into them. At this altitude, in this wind, that means someone burned a serious amount of wood.',
        skillCheck: { skill: 'tracking', dc: 9, successAppend: 'The most recent visitor left light sign — a boot print in the ash at the ring\'s edge, size ten, the tread pattern consistent with military-issue hiking boots. Not Drifter footwear. Not hermit footwear. Someone from one of the organized factions has been using this shelter. The print is heading east, into the deep forest. Toward the contamination zone. Someone is investigating the same thing you are.' },
      },
      {
        keywords: ['cache', 'supplies', 'firewood', 'maintained', 'anonymous'],
        description: 'The maintenance follows the same backcountry protocol as the logger\'s cabin — take what you need, leave what you can, the system works because everyone who uses it contributes. The firewood is split to a consistent size, the kindling bundled separately, the supply cache protected from weather and animals. The care is anonymous but not impersonal. Someone is investing regular effort into keeping this place functional. The hermit, possibly, or the person whose boot prints you found, or someone else entirely. The Pine Sea has more inhabitants than it admits.',
      },
      {
        keywords: ['roof', 'sky', 'stars', 'sleep', 'shelter'],
        description: 'The partial roof covers perhaps sixty percent of the foundation — enough for a sleeping area and a fire ring, the open section admitting weather and sky. The surviving rafters are hand-hewn, the ax marks visible, the wood species a dense heartwood that has resisted rot. Lying beneath them and looking up through the open section, you see the sky framed by the broken edge of the roof. The frame makes the sky into a composition. It is beautiful in the way that unintended things are sometimes beautiful.',
      },
    ],
    hollowEncounter: {
      baseChance: 0.08,
      timeModifier: { day: 0.4, night: 1.2, dawn: 0.6, dusk: 0.9 },
      threatPool: [
        { type: 'shuffler', weight: 70, quantity: { min: 1, max: 2, distribution: 'weighted_low' } },
        { type: 'remnant', weight: 30, quantity: { min: 1, max: 1, distribution: 'single' } },
      ],
      awarenessRoll: { unaware: 0.55, awarePassive: 0.3, awareAggressive: 0.15 },
    },
    environmentalRolls: {
      ambientSoundPool: {
        day: [
          { sound: 'Wind against the west wall. The wall holds. That is its entire purpose and it is fulfilling it.', weight: 3 },
          { sound: 'A hawk circles above the open roof section, visible for three passes, then gone.', weight: 2 },
          { sound: null, weight: 2 },
        ],
        night: [
          { sound: 'The fire pops. The stone wall radiates warmth. The wind is someone else\'s problem.', weight: 3 },
          { sound: null, weight: 2 },
        ],
      },
      ambientCount: { min: 1, max: 2, distribution: 'flat' },
      flavorLines: [
        { line: 'The coals glow against the stone wall and the warmth reaches you in waves.', chance: 0.30, time: ['night', 'dusk'] },
        { line: 'The salt wind from the coast carries through the open section. The sea is close.', chance: 0.20, time: null },
      ],
    },
    narrativeNotes: 'Safe rest location on the western Pine Sea circuit. The military boot print connects to the quarantine camp narrative — someone from an organized faction is investigating the contamination zone. The windbreak shares the logger\'s cabin\'s backcountry reciprocity ethic. Lower difficulty than surrounding rooms as a deliberate respite.',
  },

  {
    id: 'ps_20_hollow_nest',
    name: 'The Hollow Nest',
    zone: 'the_pine_sea',
    act: 3,
    difficulty: 4,
    visited: false,
    flags: { dark: true, noCombat: false },
    cycleGate: 3,
    description: 'You find them in the place where the roots go deepest. A depression beneath the root cathedral, accessed through a gap in the living wood, the space below larger than the gap suggests — a chamber carved from earth and stone by something that digs with purpose and patience. They are here: eight, maybe ten, Hollow that have stopped being Hollow in any way that matches the word. They are still. They are arranged in a circle, seated, their modified hands resting on their knees, their elongated fingers interlaced with the fine root tendrils that penetrate the chamber from above. Their eyes are open and silver and they are looking at nothing. Their chests rise and fall in unison, synchronized, the same ninety-second cycle as the vibration in the cathedral above. They are breathing with the forest. They are part of it now. You understand, standing here, that the Hollow are not the end of CHARON-7\'s process. They are a stage.',
    descriptionNight: 'At night the chamber is lit by the Hollow themselves — a faint bioluminescence in the modified skin of their hands and faces, the same green spectrum as the spore field, the fungi, the nurse log. They glow. The roots glow. The chamber glows. The boundary between the organisms in this room is not clear. The Hollow and the forest and the fungal network are continuous here. One system. Breathing. You are the only discrete thing in the room.',
    shortDescription: 'Underground chamber. Modified Hollow integrated with the root network. A stage, not an end.',
    exits: { north: 'ps_18_root_cathedral', west: 'ps_19_windbreak_ruin' },
    richExits: {
      north: { destination: 'ps_18_root_cathedral', descriptionVerbose: 'up, through the root gap, back to the cathedral' },
      west: { destination: 'ps_19_windbreak_ruin', descriptionVerbose: 'west, a narrow passage through the root system emerging near the windbreak ruin' },
    },
    items: [],
    enemies: ['remnant', 'whisperer'],
    npcs: [],
    extras: [
      {
        keywords: ['hollow', 'circle', 'seated', 'still', 'arranged'],
        description: 'The Hollow are arranged in a circle of ten. Their posture is identical: seated cross-legged, hands on knees, spines straight. The arrangement is deliberate — the spacing is even, the orientation consistent, each one facing the center of the circle where the thickest root tendril descends from the ceiling and penetrates the earth. They have been here for a long time. The earth around them is compressed and darkened. Their clothing has partially decomposed. Their bodies have not. Whatever CHARON-7 is doing to them, it is preserving them in this state: alive, modified, integrated, still.',
        skillCheck: { skill: 'lore', dc: 13, successAppend: 'This is the third expression. The Reclaimers theorized it: Hollow as failed optimization, Sanguine as successful predatory optimization, and a third path — integration. Not individual. Not predatory. Symbiotic. These Hollow have been absorbed into the fungal network as nodes in a distributed system. Their brains are still active — the silver eyes are tracking something internal, some signal in the root network. They are thinking. Not as humans. As components of something larger. The forest is using their neural tissue the way it uses the trees. CHARON-7 didn\'t just create monsters. It created an organism that builds itself from whatever biological material is available. Including people.' },
      },
      {
        keywords: ['roots', 'tendrils', 'fingers', 'interlaced', 'connected'],
        description: 'The root tendrils are fine — hair-thin, pale, entering the chamber through a thousand small channels in the ceiling and walls. They connect to the Hollow at the hands, primarily: the elongated fingers you\'ve seen in the handprints and the deep-forest variants are an adaptation for this — more surface area for root contact, more connection points. The interface between root and skin is seamless. The tendrils don\'t penetrate. They merge. The boundary between plant tissue and human tissue has dissolved at the contact points. You are looking at a join between two kingdoms of life.',
        skillCheck: { skill: 'field_medicine', dc: 13, successAppend: 'The tissue merger at the contact points is a true chimera — plant and animal cells coexisting, the cellular membranes bridged by something that is neither plant nor animal. The CHARON-7 derivative in the fungal network has created a molecular bridge between kingdoms. This is not infection. This is synthesis. The virus is building a new category of organism from existing parts: human neural tissue for processing, fungal networks for communication, tree vascular systems for energy. The engineering is elegant. The implications are the largest thing you have ever stood next to.' },
      },
      {
        keywords: ['breathing', 'synchronized', 'cycle', 'unison'],
        description: 'You watch the breathing and you count. Ninety seconds: inhale, hold, exhale. All ten, simultaneously, the rhythm matched to the vibration in the root cathedral above. The breathing is not autonomous — it is conducted, timed by a signal in the root network that synchronizes every connected node. The Hollow are not choosing to breathe in unison. They are being breathed. The forest is respiring through them. You stand and watch and the rhythm begins to pull at your own breathing, your body wanting to sync with the room\'s cycle. You resist. You resist specifically.',
      },
      {
        keywords: ['eyes', 'silver', 'looking', 'nothing', 'tracking'],
        description: 'The silver eyes of the ten Hollow are open and unfocused — not blind, not vacant, but attending to something that is not in this room. The eye movement is synchronized like the breathing: all ten pairs tracking the same invisible point, moving together, pausing together. Whatever they\'re seeing is carried by the root network, not the light in the chamber. They are seeing what the forest sees. Ten perspectives replaced by one distributed perspective. The eyes are still human eyes. They are no longer being used for human seeing.',
        skillCheck: { skill: 'perception', dc: 14, successAppend: 'One of the Hollow is aware of you. Not in the predatory sense — in the observational sense. Its eyes haven\'t moved to track you. Its breathing hasn\'t changed. But something in the root network near your feet has shifted: a tendril, hair-thin, has oriented toward your boot. The forest knows you\'re here because one of its nodes is still human enough to notice a stranger. The Hollow didn\'t react. The forest reacted through it. The distinction is the most important thing you\'ve learned in the Pine Sea.' },
      },
    ],
    hollowEncounter: {
      baseChance: 0.25,
      timeModifier: { day: 1.0, night: 1.5, dawn: 1.0, dusk: 1.2 },
      threatPool: [
        { type: 'whisperer', weight: 40, quantity: { min: 1, max: 2, distribution: 'weighted_low' } },
        { type: 'remnant', weight: 35, quantity: { min: 1, max: 2, distribution: 'weighted_low' } },
        { type: 'brute', weight: 25, quantity: { min: 1, max: 1, distribution: 'single' } },
      ],
      awarenessRoll: { unaware: 0.15, awarePassive: 0.35, awareAggressive: 0.50 },
      noiseModifier: -0.5,
    },
    environmentalRolls: {
      ambientSoundPool: {
        day: [
          { sound: 'The breathing. Ten chests. One rhythm. You count to ninety and it starts again.', weight: 3 },
          { sound: 'A root tendril near your foot shifts. You didn\'t touch it.', weight: 2 },
          { sound: null, weight: 1 },
        ],
        night: [
          { sound: 'The glow pulses with the breathing cycle. The chamber is a heart.', weight: 3 },
          { sound: 'Something moves in the root network overhead. Not a Hollow. Something carried by the roots themselves.', weight: 2 },
          { sound: null, weight: 1 },
        ],
      },
      ambientCount: { min: 1, max: 2, distribution: 'flat' },
      flavorLines: [
        { line: 'You realize you have been breathing in the ninety-second cycle for several minutes. You stop. You start your own rhythm.', chance: 0.35, time: null },
        { line: 'The tendril near your foot has not moved again. It is pointing at you. It has been pointing at you.', chance: 0.25, time: null },
        { line: 'One of the Hollow opens its mouth and a sound comes out that is not a word and is not not a word.', chance: 0.15, time: ['night'] },
      ],
    },
    personalLossEchoes: {
      child: 'One of the Hollow is young. Was young. The face is smooth in a way the others aren\'t. You look away fast. Not fast enough.',
      partner: 'The Hollow nearest you has a ring on the elongated finger — a wedding band, the metal cutting into the changed flesh, the finger grown around it. Someone made a promise to this person once.',
      community: 'Ten people in a circle, together, connected, belonging to each other in a way that has nothing to do with choice. You recognize the shape of community. You recognize what it cost.',
    },
    narrativeNotes: 'The Pine Sea\'s ultimate revelation room. The Hollow nest reveals the "third expression" of CHARON-7: not failure (Hollow), not predatory success (Sanguine), but symbiotic integration with the forest ecosystem. The lore check is the zone\'s climax: the forest is building a new kind of organism from available biological material. Difficulty 4, highest Hollow encounter in the zone, aggressive awareness — this room is dangerous. The personal loss echoes add emotional weight to the discovery. The room\'s thesis: CHARON-7 is not a disease. It is a process. And the process is not finished.',
  },
]
