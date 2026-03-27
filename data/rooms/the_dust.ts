import type { Room } from '@/types/game'

export const THE_DUST_ROOMS: Room[] = [
  {
    id: 'du_01_dust_edge',
    name: 'The Dust — East Edge',
    zone: 'the_dust',
    act: 2,
    difficulty: 3,
    visited: false,
    flags: { fastTravelWaypoint: true, scavengingZone: false },
    description: 'Highway 160 dies at an invisible line where the pavement cracks into powder and the wind stops being a comfort. West, the land flattens into hammered copper — alkali flats, heat shimmer, no shade for miles. A sun-bleached sign reads ENTERING MESA COUNTY. Someone has spray-painted GOOD LUCK over it. The air tastes like chalk and old bone. Somewhere out there a crow circles something that isn\'t moving.',
    descriptionNight: 'The desert at night is a different beast — cooler, less murderous, but the dark is total out here. Stars burn overhead with no light pollution to soften them. The chalk-dust smell is still there. West, a faint phosphorescent smear on the horizon could be the ghost town or the heat playing tricks. The crow is gone. Something else is circling.',
    shortDescription: 'The eastern edge of the Dust. Highway 160 ends here.',
    exits: { east: 'cr_01_approach', west: 'du_02_rest_stop' },
    richExits: {
      east: {
        destination: 'cr_01_approach',
        descriptionVerbose: 'Highway 160 east, back toward the crossroads',
      },
      west: {
        destination: 'du_02_rest_stop',
        descriptionVerbose: 'Into the Dust, Highway 160 west',
        skillGate: {
          skill: 'survival',
          dc: 8,
          failMessage: 'You study the heat shimmer and the cracked earth ahead. You\'ve seen enough wilderness to know you don\'t have enough to survive this. Come back stronger.',
        },
      },
    },
    items: [],
    enemies: [],
    npcs: [],
    extras: [
      {
        keywords: ['sign', 'county', 'mesa'],
        description: 'ENTERING MESA COUNTY. The state seal is still faintly visible under years of sun damage. GOOD LUCK is painted in red over the top in a thick, practiced hand — whoever wrote it has done it more than once. Below the main text, in pen: water 22 miles. That pen mark is old.',
      },
      {
        keywords: ['crow', 'bird', 'sky', 'circling'],
        description: 'The crow makes lazy slow circles about a half-mile west. Could be a dead animal. Could be something that was alive when the crow started circling and isn\'t anymore. The Dust has a way of converting one into the other.',
      },
      {
        keywords: ['horizon', 'west', 'shimmer', 'heat'],
        description: 'The shimmer starts about two hundred yards out and turns everything beyond it into mercury. Distance becomes untrustworthy out here. The first time you look, that smudge on the horizon is five miles away. The second time it\'s two. Neither estimate feels reliable.',
      },
    ],
    hollowEncounter: {
      baseChance: 0.15,
      timeModifier: { day: 0.5, night: 2.0, dawn: 0.8, dusk: 1.5 },
      threatPool: [
        { type: 'shuffler', weight: 80, quantity: { min: 1, max: 2, distribution: 'weighted_low' } },
        { type: 'remnant', weight: 20, quantity: { min: 1, max: 1, distribution: 'single' } },
      ],
      awarenessRoll: { unaware: 0.6, awarePassive: 0.3, awareAggressive: 0.1 },
    },
    environmentalRolls: {
      flavorLines: [
        { line: 'The wind shifts. For a moment you smell nothing. Then salt and rot.', chance: 0.20, time: null },
        { line: 'A dust devil rises and collapses fifty yards west. The heat does that.', chance: 0.25, time: ['day'] },
      ],
    },
    narrativeNotes: 'Entry gate to the Dust. Survival 8 check gates the zone. Eastern edge, faces back toward Crossroads. This is the last easy ground for a long time.',
  },

  {
    id: 'du_02_rest_stop',
    name: 'Abandoned Rest Stop',
    zone: 'the_dust',
    act: 2,
    difficulty: 3,
    visited: false,
    flags: { campfireAllowed: true, scavengingZone: true },
    description: 'A concrete block building stands beside a crumbling picnic area — the universal architecture of highway boredom, now a survival landmark. The restroom doors have been propped open with cinder blocks. Inside: the smell of old urine and newer habitation. Someone camped here recently. The picnic tables are graffiti-layered palimpsests — seven years of people passing through, leaving their names, their dates, their loved ones\' names. A few have drawn crude maps.',
    descriptionNight: 'The rest stop is a black cube against the star-salted sky. Someone has left a candle stub in the window of the women\'s room — it gutters in the night wind, not quite out. The picnic tables are shadow rectangles. The graffiti is illegible but you can trace it with your fingers, all those names.',
    shortDescription: 'A concrete rest stop. First shelter since the Dust edge.',
    exits: { east: 'du_01_dust_edge', west: 'du_03_alkali_flat', north: 'du_07_water_tower' },
    richExits: {
      east: { destination: 'du_01_dust_edge', descriptionVerbose: 'back east toward the highway junction' },
      west: { destination: 'du_03_alkali_flat', descriptionVerbose: 'the alkali flat stretches west' },
      north: { destination: 'du_07_water_tower', descriptionVerbose: 'a dirt track leads north toward a water tower' },
    },
    items: [],
    enemies: [],
    npcs: [],
    extras: [
      {
        keywords: ['graffiti', 'tables', 'names', 'writing'],
        description: 'Layers on layers. The oldest marks are carved into the concrete — initials and dates from before the Collapse. Post-Collapse marks are spray paint, marker, charcoal, blood. People writing themselves into a world that keeps erasing them. One message reads: FAMILY WENT WEST TO DURANGO. IF YOU\'RE READING THIS COME FIND US. It\'s three years old.',
        skillCheck: { skill: 'lore', dc: 10, successAppend: 'One entry in particular — a careful diary excerpt carved with a knife: "MERIDIAN perimeter 14 miles NW. Military says the site is gone. Military lies." Dated six years ago.' },
      },
      {
        keywords: ['candle', 'light', 'window'],
        description: 'A candle stub set in a jar lid on the window ledge. Someone left it burning. Either they\'re coming back or they wanted whoever came next to have a light. Neither option is comfortable.',
        cycleGate: 1,
      },
      {
        keywords: ['map', 'maps', 'drawing'],
        description: 'Three crude maps scratched into the tabletop. The first shows the ghost town ahead — rough but accurate. The second shows something labeled THE NEST with a big X through it and the words DON\'T EVEN. The third is just a circle with lines radiating outward and the word MERIDIAN in the center. No other labels.',
      },
      {
        keywords: ['restroom', 'bathroom', 'building'],
        description: 'The concrete block has survived better than almost everything else on the highway. Whoever designed interstate rest stops built them to last through a nuclear winter, and the apocalypse has confirmed their methodology. The toilets don\'t flush. Everything else is structurally sound.',
      },
    ],
    hollowEncounter: {
      baseChance: 0.20,
      timeModifier: { day: 0.6, night: 2.5, dawn: 1.0, dusk: 1.8 },
      threatPool: [
        { type: 'shuffler', weight: 70, quantity: { min: 1, max: 3, distribution: 'weighted_low' } },
        { type: 'remnant', weight: 30, quantity: { min: 1, max: 2, distribution: 'weighted_low' } },
      ],
      awarenessRoll: { unaware: 0.5, awarePassive: 0.3, awareAggressive: 0.2 },
    },
    itemSpawns: [
      {
        entityId: 'scavenged_rations',
        spawnChance: 0.30,
        quantity: { min: 1, max: 2, distribution: 'weighted_low' },
        conditionRoll: { min: 0.4, max: 0.8 },
        groundDescription: 'A paper bag shoved behind the hand dryer contains something that might still be edible.',
        depletion: { cooldownMinutes: { min: 120, max: 360 }, respawnChance: 0.25 },
      },
    ],
    narrativeNotes: 'First shelter in the Dust. Campfire allowed. The graffiti wall provides world lore and a MERIDIAN hint for observant players.',
  },

  {
    id: 'du_03_alkali_flat',
    name: 'The Alkali Flat',
    zone: 'the_dust',
    act: 2,
    difficulty: 3,
    visited: false,
    flags: { scavengingZone: false },
    description: 'The land here is white and hard and flat in every direction, like standing on a giant\'s dinner plate. The alkali crust crunches underfoot and leaves white powder on your boots. Long sightlines — you can see two miles in every direction and there is nothing, nothing, nothing but pale ground and pale sky and the shimmering gap between them. This is a Hollow migration path. The trails are worn into the crust, three inches deep, a dozen parallel grooves heading southwest. Fresh.',
    descriptionNight: 'Moonlight turns the alkali flat into an ice field — white, silver, merciless. The silence is so complete you can hear your pulse. The Hollow trails are shadow trenches across the pale ground. Distance has no meaning out here. That shape on the horizon could be two hundred yards or two miles away. It\'s moving.',
    shortDescription: 'White alkali flats. Hollow migration trails cross it.',
    exits: { east: 'du_02_rest_stop', west: 'du_04_ghost_main', south: 'du_08_boneyard', north: 'du_09_mirage' },
    richExits: {
      east: { destination: 'du_02_rest_stop', descriptionVerbose: 'east back toward the rest stop' },
      west: { destination: 'du_04_ghost_main', descriptionVerbose: 'the ghost town rises from the flat ahead' },
      south: { destination: 'du_08_boneyard', descriptionVerbose: 'vehicle shapes visible to the south' },
      north: { destination: 'du_09_mirage', descriptionVerbose: 'north into open desert' },
    },
    items: [],
    enemies: [],
    npcs: [],
    extras: [
      {
        keywords: ['trails', 'tracks', 'grooves', 'migration'],
        description: 'The trails are worn three inches into the alkali crust by repeated passage. Dozens of trails, all running the same direction. Some are old and crumbling at the edges. Some are fresh — the crust still sharp, white powder still loose in the bottom. They came through here within the last day. A lot of them.',
        skillCheck: { skill: 'tracking', dc: 10, successAppend: 'The gait patterns tell a story: shufflers mostly, but two or three different sets with a longer stride — remnants, probably, moving through the herd. The whole group was moving with unusual directional consistency. Something was guiding them.' },
      },
      {
        keywords: ['sky', 'horizon', 'sun', 'heat'],
        description: 'The sky out here is enormous. Not the sky you know from forests or canyons — this sky goes all the way down to the ground in every direction and there\'s nothing to break it. By midday, the heat radiating off the alkali crust is indistinguishable from the heat coming down from the sun. You\'re cooking from both directions.',
      },
      {
        keywords: ['crust', 'ground', 'white', 'alkali'],
        description: 'You scrape up a bit of the white crust. Salt and minerals, primarily. The Animas River basin used to filter this stuff. Seven years of no maintenance, no irrigation management, no flood control, and the old alkaline deposits have come back to the surface. The land remembering what it was before people told it to be something else.',
      },
    ],
    hollowEncounter: {
      baseChance: 0.35,
      timeModifier: { day: 0.8, night: 3.0, dawn: 1.5, dusk: 2.0 },
      noiseModifier: 1.5,
      threatPool: [
        { type: 'shuffler', weight: 60, quantity: { min: 2, max: 6, distribution: 'bell' } },
        { type: 'remnant', weight: 30, quantity: { min: 1, max: 3, distribution: 'weighted_low' } },
        { type: 'screamer', weight: 10, quantity: { min: 1, max: 1, distribution: 'single' } },
      ],
      awarenessRoll: { unaware: 0.3, awarePassive: 0.4, awareAggressive: 0.3 },
      activityPool: {
        shuffler: [
          { desc: 'moves along a worn trail with eerie mechanical consistency, feet finding the groove without looking down', weight: 3 },
          { desc: 'stands motionless on the flat, head tilted back, as if counting the stars or listening for something in the earth', weight: 2 },
        ],
      },
    },
    environmentalRolls: {
      ambientSoundPool: {
        day: [
          { sound: 'Wind scrapes across the alkali crust with a sound like distant radio static.', weight: 3 },
          { sound: null, weight: 2 },
        ],
        night: [
          { sound: 'Something moves on the flat. The sound carries for miles out here.', weight: 3 },
          { sound: null, weight: 2 },
        ],
      },
      ambientCount: { min: 0, max: 1, distribution: 'flat' },
    },
    narrativeNotes: 'Open dangerous crossing. High Hollow encounter due to migration trail. No cover = noise penalties for stealth. The sightlines cut both ways.',
  },

  {
    id: 'du_04_ghost_main',
    name: 'Ghost Town — Main Street',
    zone: 'the_dust',
    act: 2,
    difficulty: 3,
    visited: false,
    flags: { scavengingZone: true, campfireAllowed: false },
    description: 'A town that has forgotten it died. Main Street runs two blocks in either direction — brick storefronts, a gas station whose pumps stand like metal totems, a post office with a flag that shredded to a single red strip. The signs are still up: RANDY\'S HARDWARE. FIRST MESA DINER. VALLEY SAVINGS & LOAN. Dust has blown in through broken windows and settled like sediment on floors that people used to walk every day. The town\'s name is still on the water tower. Nobody knows it anymore.',
    descriptionNight: 'At night Main Street becomes a corridor of shadow blocks. The hollow windows are eyes. Wind moves through the buildings and makes them groan — not loudly, just enough to remind you that dead things still make sounds. The gas station\'s pump handles catch moonlight. The flag strip moves.',
    shortDescription: 'Main Street of a dead ghost town.',
    exits: { east: 'du_03_alkali_flat', north: 'du_05_diner', south: 'du_06_hardware', west: 'du_07_water_tower' },
    richExits: {
      east: { destination: 'du_03_alkali_flat', descriptionVerbose: 'east onto the alkali flat' },
      north: { destination: 'du_05_diner', descriptionVerbose: 'First Mesa Diner, north end of Main Street' },
      south: { destination: 'du_06_hardware', descriptionVerbose: 'Randy\'s Hardware, south end of Main Street' },
      west: { destination: 'du_07_water_tower', descriptionVerbose: 'the water tower stands west of the main drag' },
    },
    items: [],
    enemies: [],
    npcs: [],
    extras: [
      {
        keywords: ['flag', 'post office', 'strip'],
        description: 'The flag has been reduced to a single strip of red cloth, still attached to the lanyard, still at half-mast (or maybe it slid down). It moves in every breeze. Someone at some point lowered it and didn\'t raise it back. That tracks.',
      },
      {
        keywords: ['gas station', 'pumps', 'totems'],
        description: 'The pumps ran dry six months after the Collapse. Someone removed the nozzle handles and left the shafts — you can see where they tried to retrofit them for gravity feed. Didn\'t work. The underground tanks were cracked in the quake. The smell of old petroleum ghosts the concrete pad.',
        skillCheck: { skill: 'mechanics', dc: 9, successAppend: 'The underground tank access port is still present and partially unbolted. There\'s nothing in it, but the cavity is dry and big enough to shelter a person if they absolutely had to.' },
      },
      {
        keywords: ['signs', 'storefronts', 'buildings', 'brick'],
        description: 'The brick is old — 1950s construction, built to last. The storefronts held better than the wood-frame suburbs on the outskirts. Someone has hung hand-drawn fabric signs over some of the original painted ones, but they\'re weathered past reading. The original signs underneath are permanent.',
      },
      {
        keywords: ['savings', 'bank', 'vault'],
        description: 'Valley Savings & Loan still has its vault door standing open — you can see it from the doorway. The vault is empty. Has been since the second week after the Collapse, probably. Someone spray-painted ALREADY CHECKED on the back wall in case future visitors had any ideas.',
      },
    ],
    hollowEncounter: {
      baseChance: 0.30,
      timeModifier: { day: 1.0, night: 2.5, dawn: 1.5, dusk: 2.0 },
      threatPool: [
        { type: 'shuffler', weight: 60, quantity: { min: 1, max: 4, distribution: 'weighted_low' } },
        { type: 'remnant', weight: 30, quantity: { min: 1, max: 2, distribution: 'weighted_low' } },
        { type: 'brute', weight: 10, quantity: { min: 1, max: 1, distribution: 'single' } },
      ],
      awarenessRoll: { unaware: 0.4, awarePassive: 0.35, awareAggressive: 0.25 },
      activityPool: {
        remnant: [
          { desc: 'stands at the post office counter, fingers moving on the empty surface in a pattern that might once have been mail sorting', weight: 2 },
          { desc: 'paces the same short route outside the savings & loan, hands at its sides, turning at identical points', weight: 3 },
        ],
      },
    },
    narrativeNotes: 'Hub for the ghost town cluster. Branches to diner, hardware, and water tower. The Remnant activity pool is key — show them doing echoes of former occupations.',
  },

  {
    id: 'du_05_diner',
    name: 'Ghost Town — First Mesa Diner',
    zone: 'the_dust',
    act: 2,
    difficulty: 3,
    visited: false,
    flags: { safeRest: false, scavengingZone: true },
    description: 'The diner is the Platonic ideal of American abandonment. Counter stools on chrome pedestals, vinyl still cracked but still there. A specials board still showing Tuesday\'s lunch — chicken fried steak $7.99, the number slightly smudged where the chalk shifted. Condiment bottles still on every table. Menu laminated behind the counter. The coffee machine is an artifact of a civilization that cared very much about getting its mornings right. The smell of old grease is faint but permanent.',
    descriptionNight: 'The diner at night is full of chrome reflections and silence. Moonlight comes through the plate glass window and lays rectangles on the linoleum. The counter stools cast long shadows. This is the most haunted room in the Dust — not by ghosts, but by the specific ordinary weight of Tuesday lunch, still up on the board, waiting.',
    shortDescription: 'The First Mesa Diner. Tuesday special, seven years overdue.',
    exits: { south: 'du_04_ghost_main' },
    richExits: {
      south: { destination: 'du_04_ghost_main', descriptionVerbose: 'back out onto Main Street' },
    },
    items: ['torn_note_fragment'],
    enemies: [],
    npcs: [],
    extras: [
      {
        keywords: ['specials', 'board', 'menu', 'chalk'],
        description: 'TUESDAY SPECIALS. Chicken Fried Steak $7.99. Club Sandwich $6.50. Soup: Chili (no beans by request). Pie: Cherry & Peach. The board is a window into a Tuesday in 2031 that nobody will ever finish. The chalk smudged when the quake hit but the words held.',
      },
      {
        keywords: ['letter', 'letters', 'note', 'paper'],
        description: 'Beneath the counter, rubber-banded together and tucked behind the register: a collection of letters people left behind or slid under the door. Addresses on the envelopes. Some delivered, some never picked up. Someone has been adding to the collection — the newest ones are only a few months old.',
        questGate: 'letters_collectible',
      },
      {
        keywords: ['coffee', 'machine', 'espresso', 'maker'],
        description: 'A commercial espresso machine, still on the counter, still plugged in (nothing to plug into). Gleaming stainless steel. The group that came through here two seasons ago apparently spent time cleaning it. There\'s a handwritten note taped to it: WHEN THE LIGHTS COME BACK ON. No signature.',
      },
      {
        keywords: ['condiments', 'ketchup', 'mustard', 'bottles'],
        description: 'Every table has its condiment bottles. Most are empty, tipped, or crusted. One table in the back has a full ketchup bottle, a full mustard, and a full hot sauce, all standing upright. Like someone set them right and sat down and then stood up and never came back.',
      },
      {
        keywords: ['kitchen', 'back', 'grill'],
        description: 'The kitchen is visible through the pass-through window. The grill is cold, obviously, but someone has been using the flat surface as a workbench — there are tool marks, bolt patterns, and a careful diagram scratched into the steel with a knife. Mechanical drawing. Someone was building something.',
        skillCheck: { skill: 'mechanics', dc: 11, successAppend: 'The diagram is a crude schematic for a water distillation system. Functional, if improvised. Someone who knew what they were doing was working on this. They didn\'t finish it.' },
      },
    ],
    itemSpawns: [
      {
        entityId: 'canned_food',
        spawnChance: 0.45,
        quantity: { min: 1, max: 3, distribution: 'bell' },
        conditionRoll: { min: 0.6, max: 0.95 },
        groundDescription: 'Cans line a shelf above the pass-through — someone stored supplies here.',
        depletion: { cooldownMinutes: { min: 180, max: 480 }, respawnChance: 0.20 },
      },
      {
        entityId: 'torn_note_fragment',
        spawnChance: 0.80,
        quantity: { min: 1, max: 1, distribution: 'single' },
        conditionRoll: { min: 0.7, max: 0.9 },
        groundDescription: 'A bundle of letters held with a rubber band sits behind the register.',
      },
    ],
    hollowEncounter: {
      baseChance: 0.20,
      timeModifier: { day: 0.8, night: 2.0, dawn: 1.0, dusk: 1.5 },
      threatPool: [
        { type: 'shuffler', weight: 60, quantity: { min: 1, max: 2, distribution: 'weighted_low' } },
        { type: 'remnant', weight: 40, quantity: { min: 1, max: 1, distribution: 'single' } },
      ],
      awarenessRoll: { unaware: 0.5, awarePassive: 0.35, awareAggressive: 0.15 },
      activityPool: {
        remnant: [
          { desc: 'sits at the counter, both hands wrapped around an empty mug, staring at the specials board with something that isn\'t reading but isn\'t nothing', weight: 3 },
        ],
      },
    },
    narrativeNotes: 'Nostalgia room. Letters collectible. The Remnant at the counter is an intentional gut-punch. This is where the game\'s emotional register gets quiet and specific.',
  },

  {
    id: 'du_06_hardware',
    name: 'Ghost Town — Randy\'s Hardware',
    zone: 'the_dust',
    act: 2,
    difficulty: 3,
    visited: false,
    flags: { scavengingZone: true, questHub: false },
    description: 'The best hardware store you\'ve seen since the Collapse. Randy built for contractors — the shelves ran floor to ceiling with bins organized by type. Most bins are empty, picked clean in the first year. But Randy\'s was deep stocked. The shelves that look empty often aren\'t if you check the back. The workshop in the rear has a bench vise bolted to a workbench, undisturbed. Pegboard still holds the outlines of tools that aren\'t there anymore. This is a sacred place for anyone who builds things.',
    descriptionNight: 'The hardware store by lantern light is a catalog of shadows — every bin a black rectangle, every shelf edge a line. You know the good stuff is here somewhere. You can hear it. Or that\'s the wind through the broken skylight.',
    shortDescription: 'Randy\'s Hardware. Best crafting supplies in the Dust.',
    exits: { north: 'du_04_ghost_main' },
    richExits: {
      north: { destination: 'du_04_ghost_main', descriptionVerbose: 'back to Main Street' },
    },
    items: [],
    enemies: [],
    npcs: [],
    extras: [
      {
        keywords: ['bins', 'shelves', 'hardware'],
        description: 'You work through the bins methodically. Most are empty but some have been restocked by passing scavengers who left partial finds — a dozen mismatched bolts, some PVC fittings, electrical tape, three different grades of sandpaper, wire of indeterminate gauge. Whoever Randy was, he organized by part number. That organizational system has survived the Collapse intact.',
        skillCheck: { skill: 'scavenging', dc: 9, successAppend: 'Behind a false bottom in the bottom bin of the central aisle — the kind of thing a hardware store owner would do for the good stuff — you find sealed boxes of fasteners, a coil of copper wire, and two containers of gun oil. Undisturbed.' },
      },
      {
        keywords: ['workbench', 'bench', 'vise', 'tools'],
        description: 'The workbench is solid oak, built in place. The bench vise is a Wilton 5-inch, cast iron, still functions. This is the best non-faction crafting station in the Four Corners — no electricity required. Someone has left a half-finished repair project clamped in the vise: the barrel of a lever-action rifle, a crack along the bottom seam.',
        skillCheck: { skill: 'mechanics', dc: 10, successAppend: 'The rifle barrel crack is repairable with the right brazing material. You know what\'s needed. With the vise and a bit of time, this could become a functional weapon again.' },
      },
      {
        keywords: ['pegboard', 'outlines', 'shadows', 'tools'],
        description: 'The pegboard silhouettes are a ghost museum. Someone was very careful about where each tool lived — every hook has its outline painted on the board in white. Hammer. Needle-nose pliers. Level. Pipe wrench. The shapes are still there. The tools are not.',
      },
      {
        keywords: ['skylight', 'roof', 'ceiling'],
        description: 'The roof has a skylight that\'s cracked but mostly intact. A bird nest fills one corner — swallows, from the look of the mud cups. The birds are gone for the season but the nests are dense and old and layered, years of them, a sediment of swallow lives.',
      },
    ],
    itemSpawns: [
      {
        entityId: 'crafting_components',
        spawnChance: 0.60,
        quantity: { min: 1, max: 4, distribution: 'bell' },
        conditionRoll: { min: 0.5, max: 0.90 },
        groundDescription: 'Hardware bins contain salvageable components.',
        depletion: { cooldownMinutes: { min: 240, max: 720 }, respawnChance: 0.30 },
      },
      {
        entityId: 'gun_oil',
        spawnChance: 0.35,
        quantity: { min: 1, max: 2, distribution: 'weighted_low' },
        conditionRoll: { min: 0.7, max: 0.95 },
        groundDescription: 'Containers of gun oil sit on a shelf labeled LUBRICATION.',
        depletion: { cooldownMinutes: { min: 480, max: 1440 }, respawnChance: 0.15 },
      },
    ],
    hollowEncounter: {
      baseChance: 0.20,
      timeModifier: { day: 0.7, night: 2.0, dawn: 0.9, dusk: 1.5 },
      threatPool: [
        { type: 'shuffler', weight: 70, quantity: { min: 1, max: 2, distribution: 'weighted_low' } },
        { type: 'remnant', weight: 30, quantity: { min: 1, max: 1, distribution: 'single' } },
      ],
      awarenessRoll: { unaware: 0.55, awarePassive: 0.3, awareAggressive: 0.15 },
    },
    narrativeNotes: 'Best non-faction crafting location. Scavenging skill check reveals the hidden stash. The mechanics check on the rifle gives a quest hook.',
  },

  {
    id: 'du_07_water_tower',
    name: 'The Water Tower',
    zone: 'the_dust',
    act: 2,
    difficulty: 3,
    visited: false,
    flags: { waterSource: true, scavengingZone: false },
    description: 'The tower stands sixty feet tall on four steel legs, painted white once, now rust-streaked and sun-blistered. The tank is still half-full — the water reads safe by sight (green-blue, minimal film), but you\'d want to filter it. The ladder up is intact except for the eighth rung, which has rusted through. A chain lock at the base is decorative — it was cut long ago and re-hung to look closed. At the top, you can see the ghost town below, the alkali flat, the ranch to the west, and on a clear day, the smudge of smoke that is someone\'s chimney thirty miles out.',
    descriptionNight: 'The water tower at night is a tower of stars. Climb it and the world falls away below — the ghost town becomes a geometry of dark shapes, the alkali flat becomes a mirror for the sky. The water in the tank moves slightly, almost imperceptibly, rocking with the wind that finds the tower\'s altitude.',
    shortDescription: 'A water tower. Half-full. Sixty-foot view.',
    exits: { east: 'du_04_ghost_main', west: 'du_10_ranch' },
    richExits: {
      east: { destination: 'du_04_ghost_main', descriptionVerbose: 'east to Main Street' },
      west: { destination: 'du_10_ranch', descriptionVerbose: 'west toward the abandoned ranch' },
      up: {
        destination: 'du_07_water_tower',
        descriptionVerbose: 'climb the tower ladder',
        skillGate: { skill: 'climbing', dc: 8, failMessage: 'The eighth rung is gone and the gap is wide. You almost make it. The hard ground below changes your mind.' },
      },
    },
    items: [],
    enemies: [],
    npcs: [],
    extras: [
      {
        keywords: ['ladder', 'rung', 'climb'],
        description: 'The ladder\'s missing eighth rung forces a dynamic move — you have to skip it with momentum or use the vertical uprights as handholds. There\'s a rope tied to the ninth rung by a previous climber. The rope\'s still there. Whether it\'ll hold is a different question.',
        skillCheck: { skill: 'climbing', dc: 8, successAppend: 'From the top: the ghost town is a circuit board below you, roads and buildings laid out with a small-town logic that made sense once. You can see the alkali flat, the boneyard south, the ranch to the west. And north, past the dust, something glints. Metal or glass. You make a note.' },
      },
      {
        keywords: ['water', 'tank', 'reservoir'],
        description: 'The water smells mineral-clean, which in the Dust means nobody\'s been upstream of it lately. A quick taste test: slightly chalky, slightly alkaline, better than anything you\'ve had today. The tank access hatch has been left open — the rain that gets in is probably an improvement.',
      },
      {
        keywords: ['view', 'top', 'horizon', 'distance'],
        description: 'From the top, the Four Corners spreads out like a map — distant mesas, the long silver thread of the highway east, the smudge of the ghost town below. On a clear day you can see the Rocky Mountain foothills to the north. On a very clear night you can see the Scar valley, though most people think that orange flicker is just a wildfire.',
        cycleGate: 2,
      },
      {
        keywords: ['lock', 'chain', 'gate'],
        description: 'The chain lock is cut — whoever cut it rehung it through the hasp to look closed from a distance. Practical deception. The water here has been quietly available to anyone who bothered to look closely.',
      },
    ],
    hollowEncounter: {
      baseChance: 0.15,
      timeModifier: { day: 0.5, night: 1.5, dawn: 0.8, dusk: 1.2 },
      threatPool: [
        { type: 'shuffler', weight: 80, quantity: { min: 1, max: 2, distribution: 'weighted_low' } },
        { type: 'remnant', weight: 20, quantity: { min: 1, max: 1, distribution: 'single' } },
      ],
      awarenessRoll: { unaware: 0.6, awarePassive: 0.3, awareAggressive: 0.1 },
    },
    narrativeNotes: 'Water source (vital in the Dust). Climbing challenge to reach water. Top-of-tower view provides map intelligence. The scar glimpse at night is a Cycle 2+ Easter egg.',
  },

  {
    id: 'du_08_boneyard',
    name: 'The Boneyard',
    zone: 'the_dust',
    act: 2,
    difficulty: 3,
    visited: false,
    flags: { scavengingZone: true },
    description: 'A vehicle graveyard spreads across two acres of hardpack — cars, trucks, a school bus on its side, three semis with cargo containers still attached. Someone drove everything here. Or everything converged here on its own, which is more unsettling to consider. The vehicles have been stripped of obvious parts but the Boneyard rewards patience. You can lose a day in here. You can also lose yourself — the vehicle rows make corridors that change shape depending on the sun angle.',
    descriptionNight: 'The Boneyard at night is a city of dark hulks. Metal groans in the temperature drop. Wind through broken windows makes sounds that are almost voices. The corridors between vehicles are absolute black. Somewhere in there a Hollow is doing something with a car door. You can hear the creak.',
    shortDescription: 'A vehicle graveyard. Good salvage. Bad sightlines.',
    exits: { north: 'du_03_alkali_flat', east: 'du_04_ghost_main' },
    richExits: {
      north: { destination: 'du_03_alkali_flat', descriptionVerbose: 'north across the alkali flat' },
      east: { destination: 'du_04_ghost_main', descriptionVerbose: 'east to the ghost town' },
    },
    items: [],
    enemies: [],
    npcs: [],
    extras: [
      {
        keywords: ['school bus', 'bus', 'yellow'],
        description: 'The school bus lies on its left side, the roof facing you. The destination board still reads MESA VIEW ELEMENTARY. The emergency exit hatch on the roof is open and someone has rigged a rope ladder down into the interior, which is dry and defensible. Also: there are crayon drawings on several seats. Someone\'s kid was here.',
        skillCheck: { skill: 'scavenging', dc: 10, successAppend: 'Under the seats in the back third of the bus: a first aid kit still factory-sealed, a duffel bag with emergency flares, and a children\'s backpack with a change of clothes and a peanut butter sandwich, fossilized. The sandwich is inedible. Everything else is functional.' },
      },
      {
        keywords: ['semi', 'truck', 'cargo', 'container'],
        description: 'The semis\' containers are padlocked. One lock has been cut already and the container stands open — it carried industrial laundry equipment, which is useless. The other two containers are still locked. The logos on the sides are for a pharmaceutical logistics company. The name is MERIDIAN BIOLOGICAL DISTRIBUTION, LLC. Nobody\'s opened those yet.',
        skillCheck: { skill: 'lockpicking', dc: 12, successAppend: 'You get the lock off. The container holds temperature-controlled shipping crates, all empty — the cold chain failed years ago. But the manifest is still clipped to the inside of the door. CHARON-7 COMPOUND R-8. REFRIGERATED TRANSIT TO FORT GARLAND DEPOT. Dated 2031.' },
      },
      {
        keywords: ['corridors', 'maze', 'paths', 'rows'],
        description: 'The vehicle rows create a maze with no fixed center. Someone has scratched directional arrows into several door panels in chalk, but the arrows were drawn from different starting points and contradict each other. You get the sense that everyone who\'s navigated this place successfully did it by luck.',
        skillCheck: { skill: 'perception', dc: 9, successAppend: 'Wait — you trace the arrow logic from the outside in rather than from inside out. There\'s a center to this maze and someone built it intentionally. The arrows guide you to a 1987 Chevy Blazer with its roof cut off and a campsite installed inside — fire ring, bedroll, supply cache. Someone lived here.' },
      },
      {
        keywords: ['car', 'vehicles', 'stripped', 'salvage'],
        description: 'The stripping is thorough on the visible surfaces — no batteries, no wheels on most, glass long gone. But the strip teams didn\'t check inside every door panel, didn\'t pull every seat. There\'s a mechanical logic to what gets taken: fuel delivery components, starting systems, anything with copper in it. What\'s left is structural and interior.',
      },
    ],
    hollowEncounter: {
      baseChance: 0.40,
      timeModifier: { day: 1.2, night: 3.0, dawn: 1.5, dusk: 2.5 },
      threatPool: [
        { type: 'shuffler', weight: 50, quantity: { min: 2, max: 5, distribution: 'bell' } },
        { type: 'remnant', weight: 40, quantity: { min: 1, max: 3, distribution: 'weighted_low' } },
        { type: 'brute', weight: 10, quantity: { min: 1, max: 1, distribution: 'single' } },
      ],
      awarenessRoll: { unaware: 0.3, awarePassive: 0.4, awareAggressive: 0.3 },
      activityPool: {
        remnant: [
          { desc: 'sits in a driver\'s seat, hands on a steering wheel that doesn\'t go anywhere, staring through a windshield at a road it can\'t reach', weight: 3 },
          { desc: 'methodically opens and closes a car door, the hinge creaking with each cycle, a sound from before that it can\'t stop making', weight: 2 },
        ],
      },
    },
    narrativeNotes: 'Vehicle salvage zone. The MERIDIAN shipping container is a key lore discovery (lockpicking check). The Remnant activities are critical for tone.',
  },

  {
    id: 'du_09_mirage',
    name: 'The Mirage',
    zone: 'the_dust',
    act: 2,
    difficulty: 3,
    visited: false,
    flags: { dark: false, scavengingZone: false },
    description: 'This stretch of open desert produces mirages visible from a mile out — shimmering water-shapes that the heat manufactures from cruelty and atmospheric science. Up close, the shimmer is disorienting. Distance warps. Things that aren\'t there briefly are. The ground here is fractured ceramic clay, each piece curled up at the edges like a dried leaf. The smell is mineral and hot and slightly wrong. Your shadow bends. Your water tastes like you already drank it.',
    descriptionNight: 'At night the Mirage produces something different — cold air inversions that make distant lights seem close. The stars reflect off patches of mica in the clay. A dark shape on the horizon may be a building, a Hollow, or nothing at all. Perception becomes a liability here. Trust your feet over your eyes.',
    shortDescription: 'Open desert. Heat mirages. Perception unreliable.',
    exits: { south: 'du_03_alkali_flat', west: 'du_11_radio_tower', east: 'du_10_ranch' },
    richExits: {
      south: { destination: 'du_03_alkali_flat', descriptionVerbose: 'south across the alkali flat' },
      west: { destination: 'du_11_radio_tower', descriptionVerbose: 'west, toward the radio tower' },
      east: { destination: 'du_10_ranch', descriptionVerbose: 'east, toward the ranch compound' },
    },
    items: [],
    enemies: [],
    npcs: [],
    extras: [
      {
        keywords: ['shimmer', 'mirage', 'water', 'illusion'],
        description: 'You walk toward the shimmer. It retreats at exactly your pace. The physics of it are simple: bent light, differential air densities, brain trying to make sense of input that doesn\'t add up. Understanding the mechanism doesn\'t make the water-shape less convincing. You stop walking before you know you\'ve decided to.',
        skillCheck: { skill: 'perception', dc: 12, successAppend: 'Wait — that one isn\'t moving. You walk toward it and it stays put. Not a mirage. A figure, sitting, motionless in the open heat. Human-shaped. It doesn\'t react when you approach. It\'s been here a while.' },
      },
      {
        keywords: ['clay', 'ground', 'fractured', 'ceramic'],
        description: 'The clay curls are called dessication cracks — the ground dried too fast and split, each piece pulling away from its neighbor. You can trace whole rooms in the pattern if you look: a grid of ancient moisture that once was and will not be again. The clay pieces crunch under your feet.',
      },
      {
        keywords: ['shadow', 'light', 'heat', 'temperature'],
        description: 'Your shadow stretches wrong here — something about the angle or the reflective clay surface distorts it. It\'s a few degrees shorter than it should be, or longer. It moves a half-second behind you. The sun out here isn\'t the sun you know from before. It\'s harder and closer and it means you differently.',
      },
    ],
    hollowEncounter: {
      baseChance: 0.25,
      timeModifier: { day: 1.5, night: 1.5, dawn: 1.0, dusk: 1.2 },
      noiseModifier: 1.3,
      threatPool: [
        { type: 'shuffler', weight: 55, quantity: { min: 1, max: 3, distribution: 'weighted_low' } },
        { type: 'whisperer', weight: 25, quantity: { min: 1, max: 1, distribution: 'single' } },
        { type: 'remnant', weight: 20, quantity: { min: 1, max: 2, distribution: 'weighted_low' } },
      ],
      awarenessRoll: { unaware: 0.25, awarePassive: 0.45, awareAggressive: 0.3 },
      activityPool: {
        whisperer: [
          { desc: 'stands at the edge of your visual range, perfectly still except for its lips, which are moving. The wind brings you fragments of words in a voice that sounds like someone you know.', weight: 3 },
        ],
      },
    },
    narrativeNotes: 'Disorienting zone. Whisperer spawn is thematically appropriate — the Mirage produces hallucinations, the Whisperer is a walking hallucination. Perception check reveals a hidden encounter.',
  },

  {
    id: 'du_10_ranch',
    name: 'Abandoned Ranch',
    zone: 'the_dust',
    act: 2,
    difficulty: 4,
    visited: false,
    flags: { scavengingZone: true, dark: false },
    description: 'The ranch compound sprawls — main house, a long barn, two outbuildings, a corral that held horses once and now holds nothing but wind. The main house has been fortified: windows boarded, doors barricaded, the porch turned into a shooting position. This is a Hollow stronghold. They\'ve been here long enough that the smell has settled into the walls. Inside the barn you can hear movement — multiple sources, irregular interval, the specific acoustic signature of something that never stops.',
    descriptionNight: 'The ranch at night is noise. The Hollow in the barn have no sleep cycle. You can hear them through the walls — shuffling, knocking, the occasional short vocalization that resolves into nothing human. The main house has a light somewhere deep inside, which makes no sense and therefore makes all the sense.',
    shortDescription: 'An old ranch compound. Hollow stronghold.',
    exits: { east: 'du_07_water_tower', west: 'du_12_west_edge', north: 'du_09_mirage' },
    richExits: {
      east: { destination: 'du_07_water_tower', descriptionVerbose: 'east toward the water tower' },
      west: { destination: 'du_12_west_edge', descriptionVerbose: 'west into open desert' },
      north: { destination: 'du_09_mirage', descriptionVerbose: 'north through the mirage' },
    },
    items: [],
    enemies: [],
    npcs: [],
    extras: [
      {
        keywords: ['barn', 'inside', 'structure'],
        description: 'The barn doors are sealed from inside — a crossbar you can hear but not lift from outside. There\'s a gap in the siding wide enough to see through. What you see: twenty, maybe thirty Hollow in the barn\'s interior, moving without coordination but with constant motion. A few cluster near something on the ground that you can\'t identify from this angle.',
        skillCheck: { skill: 'stealth', dc: 12, successAppend: 'You watch long enough to map them. They have loose territories — each one has a zone it doesn\'t leave. Except two that move freely. Those two are coordinating without appearing to coordinate. Remnants in a Shuffler herd. They\'re keeping the group here.' },
      },
      {
        keywords: ['main house', 'house', 'porch', 'windows'],
        description: 'The boarding on the windows is from outside — someone barricaded themselves in, then the barricades got incorporated by the Hollow. The door has a sequence of different locks: original deadbolt, padlock through a hasp, two-by-four across brackets. The Hollow didn\'t do that. Someone was in here long after the Hollow arrived, barricading against them.',
        skillCheck: { skill: 'lockpicking', dc: 14, successAppend: 'The padlock is a combination model, not keyed. You work through options. 1234 doesn\'t work. The year the ranch was built doesn\'t work. The year the Collapse happened — 2031 — the shackle springs.' },
      },
      {
        keywords: ['corral', 'horses', 'fence'],
        description: 'The corral fence posts are horse-height and spaced for livestock. The hoofprints in the old hard mud inside are seven years gone. The horses either fled or fed something. The trough in the center still holds a few inches of brown water — it collects rain. A crow sits on the trough lip, watching you with one eye.',
      },
      {
        keywords: ['outbuildings', 'shed', 'storage'],
        description: 'Two outbuildings. One is a smokehouse — empty, but the hook rack is intact and the fire pit below is usable. One is a root cellar with a slanted door that opens in. The root cellar is dark and smells like old vegetables and old fear, and it goes back further than you expect.',
        skillCheck: { skill: 'scavenging', dc: 11, successAppend: 'The root cellar\'s back wall has a false panel — a cache left by the ranch\'s last human residents. Mason jars of preserved food (still sealed, still viable), a bolt-action .22 with seventeen rounds, and a handwritten note: "We are going to the water tower. We are going to signal. We are going to wait."' },
      },
    ],
    hollowEncounter: {
      baseChance: 0.75,
      timeModifier: { day: 1.0, night: 1.5, dawn: 1.2, dusk: 1.3 },
      noiseModifier: 2.0,
      threatPool: [
        { type: 'shuffler', weight: 50, quantity: { min: 3, max: 8, distribution: 'bell' } },
        { type: 'remnant', weight: 30, quantity: { min: 1, max: 3, distribution: 'weighted_low' } },
        { type: 'brute', weight: 15, quantity: { min: 1, max: 2, distribution: 'weighted_low' } },
        { type: 'screamer', weight: 5, quantity: { min: 1, max: 1, distribution: 'single' } },
      ],
      awarenessRoll: { unaware: 0.1, awarePassive: 0.3, awareAggressive: 0.6 },
    },
    narrativeNotes: 'Highest Hollow density outside the Deep. Lockpicking the main house and the root cellar scavenge check are significant rewards for skilled players. The "We are going to the water tower" note ties rooms together.',
  },

  {
    id: 'du_11_radio_tower',
    name: 'The Radio Tower',
    zone: 'the_dust',
    act: 2,
    difficulty: 3,
    visited: false,
    flags: { questHub: true, scavengingZone: true },
    description: 'A hundred-and-twenty-foot broadcast tower rises from a concrete pad, its red warning light dead for seven years. The equipment shed at its base is locked — actually locked, not the decorative lock at the water tower. Inside you can hear the hum of something electronic, which means someone has it on a power source that still works. The Reclaimers put this on their list. That they haven\'t retrieved it yet says something about what\'s between here and there.',
    descriptionNight: 'At night the tower\'s dead warning light is a presence through its absence — you know exactly where it should be blinking red. Nothing. But from the equipment shed, a thin line of light shows under the door. Something is running. And beneath the wind and the desert silence, a signal: repeating, three seconds on, three seconds off, a pattern that resolves into something when you listen long enough.',
    shortDescription: 'A broadcast radio tower. The shed hums. Someone is broadcasting.',
    exits: { east: 'du_09_mirage', south: 'du_12_west_edge' },
    richExits: {
      east: { destination: 'du_09_mirage', descriptionVerbose: 'east through the mirage' },
      south: { destination: 'du_12_west_edge', descriptionVerbose: 'south toward the desert edge' },
    },
    items: [],
    enemies: [],
    npcs: [],
    extras: [
      {
        keywords: ['shed', 'door', 'lock', 'equipment'],
        description: 'A commercial padlock on a reinforced steel door. Not improvised — this was installed by someone with hardware expertise. The door hinges are on the inside. You\'re not getting in the wrong way.',
        skillCheck: { skill: 'lockpicking', dc: 14, successAppend: 'The lock is a Medeco — serious equipment. It takes time. But the tumbler yields, eventually, to patience and the correct technique. Inside: a signal repeater unit, solar-powered via a panel on the shed roof, running on low power mode. It\'s bouncing a signal fragment. Not originating it. The source is somewhere northwest. The unit\'s log shows it\'s been running for eleven months.' },
      },
      {
        keywords: ['signal', 'broadcast', 'radio', 'hum'],
        description: 'The repeater\'s frequency is tuned to a specific narrow band. You\'ve heard this signal before — everyone in the Four Corners has, eventually. This isn\'t the source. It\'s a relay. The source is further. Whoever set this up wanted the signal to carry farther than its origin point could manage alone.',
        skillCheck: { skill: 'electronics', dc: 11, successAppend: 'The relay unit\'s configuration log shows it was set by someone with Reclaimer equipment signatures — the same calibration patterns as the Stacks\' comm center. Lev\'s handwriting in the hardware config notes. This is a Reclaimer relay point, but not a Reclaimer base. Someone sent Lev here.' },
      },
      {
        keywords: ['tower', 'antenna', 'structure', 'steel'],
        description: 'The tower is a self-supporting lattice structure — three legs, cross-braced, designed to outlast everything around it. It\'s done that. The climb to the top would require equipment you don\'t have, and the view from up here at ground level is already extensive. The tower carries markings from the FCC — Facility ID number, construction date, licensed operator. The licensed operator\'s address is in Denver, which doesn\'t exist anymore in any administratively meaningful sense.',
      },
      {
        keywords: ['solar', 'panel', 'power', 'battery'],
        description: 'The solar panel on the shed roof is a high-efficiency commercial unit, angled precisely for maximum southwestern exposure. Someone mounted it carefully. It\'s been running for years without maintenance and still produces enough power to run the repeater. Good equipment, well-placed. This wasn\'t improvised.',
      },
    ],
    itemSpawns: [
      {
        entityId: 'radio_fragment',
        spawnChance: 0.85,
        quantity: { min: 1, max: 1, distribution: 'single' },
        conditionRoll: { min: 0.8, max: 0.95 },
        groundDescription: 'A folded paper data sheet is taped to the repeater unit: frequency coordinates, timing intervals, signal fragment decode.',
      },
    ],
    hollowEncounter: {
      baseChance: 0.20,
      timeModifier: { day: 0.6, night: 1.8, dawn: 0.9, dusk: 1.4 },
      threatPool: [
        { type: 'shuffler', weight: 70, quantity: { min: 1, max: 2, distribution: 'weighted_low' } },
        { type: 'remnant', weight: 30, quantity: { min: 1, max: 1, distribution: 'single' } },
      ],
      awarenessRoll: { unaware: 0.5, awarePassive: 0.35, awareAggressive: 0.15 },
    },
    narrativeNotes: 'Critical quest location — Reclaimers quest chain. The signal fragment here is part of the main mystery. The electronics check revealing Lev\'s involvement is a significant lore moment.',
  },

  {
    id: 'du_12_west_edge',
    name: 'The Dust — West Edge',
    zone: 'the_dust',
    act: 2,
    difficulty: 3,
    visited: false,
    flags: { scavengingZone: false },
    description: 'The map ends here. To the west, the desert continues without end or feature — flat hardpan interrupted by distant mesas that have no trails, no water, no reason to visit. The wind comes from that direction without having touched anything for a hundred miles. You can feel it: the total absence of human presence, the land doing exactly what it was doing before people arrived and will be doing after the last of them are gone. This is not a zone boundary. This is just as far as anyone goes.',
    descriptionNight: 'At night the western edge is light-years from the nearest warmth. The stars out here are the original stars, undiminished. You understand, standing here, why people built myths about the desert — it\'s a place where nothing is metaphor. Everything is exactly what it is. The wind isn\'t loneliness. It\'s just wind. That\'s worse.',
    shortDescription: 'The western limit of explored territory. Vastness beyond.',
    exits: { east: 'du_10_ranch', north: 'du_11_radio_tower' },
    richExits: {
      east: { destination: 'du_10_ranch', descriptionVerbose: 'east toward the ranch compound' },
      north: { destination: 'du_11_radio_tower', descriptionVerbose: 'north toward the radio tower' },
    },
    items: [],
    enemies: [],
    npcs: [],
    extras: [
      {
        keywords: ['west', 'horizon', 'beyond', 'desert'],
        description: 'You stare west for a long time. Nothing moves. Nothing changes. The mesas are there and have been there since before the Permian. The last person who walked west from here left footprints in the hardpan that are still there, partially wind-filled. They didn\'t come back.',
      },
      {
        keywords: ['wind', 'air', 'smell'],
        description: 'The wind from the west has traveled a long way. It smells like hot rock and altitude change and nothing human. You\'ve smelled fear-sweat and campfire and Hollow and cooking food for seven years, and this wind has none of that. It\'s the cleanest thing you\'ve encountered since the Collapse.',
      },
      {
        keywords: ['tracks', 'footprints', 'hardpan'],
        description: 'Footprints in the hardpan — partially filled but still readable if you know how to read them. One set going west, stride length suggesting urgency. No return set. The prints are old, at least two years. Whoever it was kept walking into the nothing. Maybe that was the point.',
        skillCheck: { skill: 'tracking', dc: 10, successAppend: 'The stride pattern is irregular — one foot lands lighter than the other, a consistent right-side favor. Someone injured, or someone who\'s had an injury long enough that the compensation became habit. The depth suggests they were carrying a load. They left with supplies.' },
      },
    ],
    hollowEncounter: {
      baseChance: 0.10,
      timeModifier: { day: 0.4, night: 1.5, dawn: 0.6, dusk: 1.0 },
      threatPool: [
        { type: 'shuffler', weight: 90, quantity: { min: 1, max: 1, distribution: 'single' } },
        { type: 'remnant', weight: 10, quantity: { min: 1, max: 1, distribution: 'single' } },
      ],
      awarenessRoll: { unaware: 0.7, awarePassive: 0.2, awareAggressive: 0.1 },
    },
    narrativeNotes: 'Map boundary room. Philosophical and quiet. The footprints going west are a mystery with no resolution — someone chose to walk into the nothing. This is the mood.',
  },
]
