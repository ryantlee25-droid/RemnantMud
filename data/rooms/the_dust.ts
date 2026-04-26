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
    descriptionDawn: 'Dawn on the Dust edge is a slow burn — the eastern sky goes from black to steel to a thin arterial red that spreads along the horizon like a wound opening. The temperature hasn\'t risen yet and the air is the closest to comfortable it will be for twelve hours. The highway pavement is cold underfoot, the cracks edged with frost that will be gone in twenty minutes. The crow is back, or a different crow, already circling its station to the west. The GOOD LUCK sign catches the first direct light and the red paint glows briefly, almost warm, before the sun clears the horizon and the Dust begins its daily project of trying to kill everything in it.',
    descriptionDusk: 'Dusk softens the Dust edge into something that could be mistaken for merciful. The sun drops behind the western flatlands and the sky goes through its full palette — copper, then rose, then a bruised violet that makes the alkali flats glow faintly with reflected light. Your shadow stretches east along the cracked highway, impossibly long, pointing back toward the crossroads like advice. The chalk-dust smell intensifies as the ground begins releasing the day\'s stored heat. The crow has landed somewhere. The temperature is dropping and will keep dropping. For a few minutes the Dust is beautiful, and then the dark comes and it is something else.',
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
      baseChance: 0.40,
      timeModifier: { day: 0.75, night: 2.0, dawn: 0.8, dusk: 1.5 },
      threatPool: [
        { type: 'shuffler', weight: 65, quantity: { min: 1, max: 2, distribution: 'weighted_low' } },
        { type: 'remnant', weight: 30, quantity: { min: 1, max: 1, distribution: 'single' } },
        { type: 'brute', weight: 5, quantity: { min: 1, max: 1, distribution: 'single' } },
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
      baseChance: 0.40,
      timeModifier: { day: 0.80, night: 2.5, dawn: 1.0, dusk: 1.8 },
      threatPool: [
        { type: 'shuffler', weight: 65, quantity: { min: 1, max: 3, distribution: 'weighted_low' } },
        { type: 'remnant', weight: 30, quantity: { min: 1, max: 2, distribution: 'weighted_low' } },
        { type: 'brute', weight: 5, quantity: { min: 1, max: 1, distribution: 'single' } },
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
    descriptionDawn: 'Dawn on the alkali flat is a horizontal event — the first light comes across the ground at zero angle and the white crust catches it and throws it back at you. For ten minutes the flat is blinding, every crystal of salt a tiny mirror, the world reduced to white light and the dark lines of the Hollow migration trails cutting through it like cracks in a shell. The trails look fresh in this light, the edges sharp, the powder at the bottom undisturbed. The air is still cold and the silence is total. Nothing moves on the flat. That will change when the sun clears the horizon and the heat begins its work.',
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
      baseChance: 0.40,
      timeModifier: { day: 0.80, night: 3.0, dawn: 1.5, dusk: 2.0 },
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
      flavorLines: [
        { line: 'The alkali crust cracks under your boot with a sound like breaking bone. The white powder rises and settles on your pants leg and does not brush off.', chance: 0.25, time: null },
        { line: 'A dust devil spins up from the flat, three feet wide, white with alkali, spiraling for ten seconds before collapsing. The flat is full of small violences.', chance: 0.20, time: ['day'] },
        { line: 'Your shadow is the only dark thing on the flat. It moves when you move. Nothing else does.', chance: 0.15, time: ['day', 'dawn'] },
      ],
    },
    personalLossEchoes: {
      child: 'Nothing, nothing, nothing in every direction. The flat is the physical form of the word gone — white and hard and extending to every horizon without a single feature that your eyes can hold. You have been looking for them in every landscape since you lost them. This is the first landscape that offers nothing to look at. The absence is complete and it is not a relief.',
      partner: 'The Hollow trails cross the flat in parallel grooves, a dozen of them, heading the same direction with the same mindless consistency. You walked in parallel once — two people moving through the world at the same pace, in the same direction, close enough to touch. The trails here go on without each other. They don\'t know they\'re together.',
      community: 'Two miles of visibility in every direction and there is nothing, nothing, nothing. The flat is what the world looks like when the community is gone — the infrastructure of belonging stripped away, the landmarks that told you where you were and who you were with reduced to white ground and pale sky and the shimmering gap between them where meaning used to be.',
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
    descriptionDusk: 'Dusk gives the ghost town back its ghosts. The low western light pours down Main Street at a horizontal angle that fills the storefronts with amber — through the broken windows, the interiors of Randy\'s Hardware and First Mesa Diner and Valley Savings & Loan are lit like display cases, every dust mote a floating spark. The signs are legible in this light. The flag strip turns orange. For five minutes the town looks like it did before, on a Tuesday evening, when someone was about to turn the OPEN signs to CLOSED and go home to dinner. Then the sun drops below the roofline and the shadows rush in from both sides and the town remembers what it is.',
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
      baseChance: 0.40,
      timeModifier: { day: 1.0, night: 2.5, dawn: 1.5, dusk: 2.0 },
      threatPool: [
        { type: 'shuffler', weight: 50, quantity: { min: 1, max: 4, distribution: 'weighted_low' } },
        { type: 'remnant', weight: 25, quantity: { min: 1, max: 2, distribution: 'weighted_low' } },
        { type: 'whisperer', weight: 15, quantity: { min: 1, max: 1, distribution: 'single' } },
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
    descriptionDawn: 'Early light through the plate glass window hits the specials board first. TUESDAY SPECIALS in chalk, lit amber, the letters casting small shadows on the wall behind them. The chrome stools catch the light one by one as the sun climbs. The coffee machine gleams. For three minutes the diner looks open — the light does what the light always did, filling the room from east to west, warming the linoleum, making the chrome bright. The smell of old grease is warmer in the morning. The ghosts of breakfast are the strongest ghosts.',
    descriptionDusk: 'For five minutes the diner looks like it did before. The western light comes through the plate glass window at the angle that fills the whole room gold, the chrome catches it, the specials board glows, and the counter stools throw shadows that point toward the kitchen the way customers would have faced, waiting. The condiment bottles on the back table are silhouetted like a small congregation. Then the light drops below the window frame and the gold drains from the room in seconds and the diner is dark and it is seven years after Tuesday.',
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
      baseChance: 0.40,
      timeModifier: { day: 0.80, night: 2.0, dawn: 1.0, dusk: 1.5 },
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
    personalLossEchoes: {
      child: 'The high chair is still at the corner table, pulled up close, the way you do when they\'re small enough that you want them near you but old enough to sit on their own. You shared meals like this. Not here — somewhere else, somewhere with the same vinyl and the same specials board and the same particular ordinariness that was never ordinary. The high chair is empty the way all the chairs here are empty, but this one is the one you can\'t stop looking at.',
      partner: 'You shared meals like this. Not this meal, not this diner, but the architecture of it — sitting across from someone, reading the specials, the specific intimate mundanity of choosing food together. Tuesday special. Chicken fried steak. The two of you would have had opinions about the chicken fried steak. You would have argued about the pie. The argument would have been the best part of the meal.',
      community: 'A diner is a community\'s living room. The specials board, the condiment bottles, the counter stools — everything here was organized around the assumption that people would keep coming in and sitting down and ordering and talking. Your community had places like this. Gathering points. The places where you ran into everyone. Those places are empty now too, and the specials boards are still showing the last Tuesday.',
      identity: 'You sit at the counter and try to remember if you liked chicken fried steak. The answer should be in there somewhere — a preference, a habit, the kind of small fact that makes a person specific rather than general. The Remnant at the counter has its hands around an empty mug, remembering something or performing the memory of remembering. You understand the gesture.',
      promise: 'WHEN THE LIGHTS COME BACK ON, someone wrote on the espresso machine. A promise in the form of a conditional. You made a promise too, and the conditional has been running for seven years, and the lights haven\'t come back on, and you\'re sitting in a diner where Tuesday lasted forever. The promise doesn\'t expire. That\'s the problem with promises.',
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
      baseChance: 0.40,
      timeModifier: { day: 0.80, night: 2.0, dawn: 0.9, dusk: 1.5 },
      threatPool: [
        { type: 'shuffler', weight: 65, quantity: { min: 1, max: 2, distribution: 'weighted_low' } },
        { type: 'remnant', weight: 30, quantity: { min: 1, max: 1, distribution: 'single' } },
        { type: 'brute', weight: 5, quantity: { min: 1, max: 1, distribution: 'single' } },
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
    description: 'The tower stands sixty feet on four rust-streaked legs, painted white once, the paint now peeling in curls that catch the wind. The tank is still half-full and the water smells clean — mineral-chalky, cold even in summer heat, better than anything the Dust otherwise offers. Someone has spray-painted the base legs in three different hands over three different years: WE WERE HERE (black, old), KEEP GOING NORTH (red, faded), and most recently, in yellow: WHAT NORTH? The chain lock at the base is cut and re-hung to look closed. From the top, the ghost town is a circuit board below, the alkali flat a bleached mirror to the east, the ranch compound a dark cluster to the west. A lookout position and a water source in a zone where both are scarce.',
    descriptionNight: 'The water tower at night is a tower of stars. Climb it and the world falls away below — the ghost town becomes a geometry of dark shapes, the alkali flat becomes a mirror for the sky. The water in the tank moves slightly, almost imperceptibly, rocking with the wind that finds the tower\'s altitude.',
    descriptionDawn: 'The tower is a black silhouette against the brightening east, the four legs and the tank a geometry that looks deliberate against the horizontal light. From the ground: a lookout position, the ladder rungs catching the first warmth. From the top, if you climb: the ghost town below is a diagram of shadows, every building throwing its dark twin westward, the streets laid out in the specific grid logic of towns that expected to grow. The alkali flat beyond is pink in the dawn light. Something metal glints on the northern horizon — the same glint visible from ground level, but from sixty feet up, it resolves into a shape. A structure. Something built, out there, where the maps say nothing is.',
    descriptionDusk: 'At dusk the tower catches the last light higher than anything else in the ghost town — the tank glows rust-orange for ten minutes after the ground has gone to shadow. From the top you can see the Scar on the northeastern horizon, the faint amber glow that most people mistake for wildfire or sunset bleed. It isn\'t either. At this hour, from this height, the glow pulses with a regularity that fire doesn\'t have. The wind drops with the light and the tower\'s steel legs stop humming and the silence at sixty feet is the silence of being the last tall thing in a flat world.',
    shortDescription: 'A water tower. Half-full. Sixty-foot view. Someone was here before you.',
    exits: { east: 'du_04_ghost_main', west: 'du_10_ranch', up: 'du_07_water_tower' },
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
        description: 'The ladder\'s missing eighth rung forces a dynamic move — skip it with momentum or use the vertical uprights as handholds. Someone has tied a rope to the ninth rung. The rope\'s still there. Whether it\'ll hold is a different question.',
        skillCheck: { skill: 'climbing', dc: 8, successAppend: 'From the top: the ghost town is a circuit board below you, roads and buildings laid out with a small-town logic that made sense once. You can see the alkali flat, the boneyard south, the ranch to the west. And north, past the dust, something glints. Metal or glass. You make a note.' },
      },
      {
        keywords: ['water', 'tank', 'reservoir'],
        description: 'The water smells mineral-clean, which in the Dust means nobody\'s been upstream of it lately. A quick taste test: slightly chalky, slightly alkaline, better than anything you\'ve had today. The tank access hatch has been left open — the rain that gets in is probably an improvement.',
      },
      {
        keywords: ['graffiti', 'writing', 'paint', 'legs', 'tower'],
        description: 'Three messages in three different hands, painted on the steel legs at eye level. The oldest: WE WERE HERE, in black house paint, cracked with age. Below it, in red spray: KEEP GOING NORTH. Below that, recent enough that the yellow paint still has some sheen: WHAT NORTH? The three-year conversation between strangers who never met, each answering the last person who came here alone.',
      },
      {
        keywords: ['view', 'top', 'horizon', 'distance', 'lookout'],
        description: 'From the top, the Four Corners spreads out like a map — distant mesas, the long silver thread of the highway east, the ghost town below. On a clear day you can see the Rocky Mountain foothills to the north. On a very clear night you can see the Scar valley, though most people think that orange flicker is just a wildfire.',
        cycleGate: 2,
      },
      {
        keywords: ['lock', 'chain', 'gate'],
        description: 'The chain lock is cut — whoever cut it rehung it through the hasp to look closed from a distance. Practical deception. The water here has been quietly available to anyone who bothered to look closely.',
      },
    ],
    environmentalRolls: {
      flavorLines: [
        { line: 'Wind finds the tower at this height. The steel legs hum a low note that you feel more than hear.', chance: 0.25, time: null },
        { line: 'From here you can see why people came to the Dust: the open country has a terrible clarity. Nothing hidden. Nothing soft. Everything at its actual scale.', chance: 0.20, time: ['day'] },
      ],
    },
    hollowEncounter: {
      baseChance: 0.40,
      timeModifier: { day: 0.75, night: 1.5, dawn: 0.8, dusk: 1.2 },
      threatPool: [
        { type: 'shuffler', weight: 65, quantity: { min: 1, max: 2, distribution: 'weighted_low' } },
        { type: 'remnant', weight: 30, quantity: { min: 1, max: 1, distribution: 'single' } },
        { type: 'brute', weight: 5, quantity: { min: 1, max: 1, distribution: 'single' } },
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
    descriptionDawn: 'Dawn in the Boneyard catches the chrome and glass that remains on the vehicles — a hundred small fires of reflected light scattered across the hardpack, winking on and off as the sun angle shifts. The school bus on its side throws a long shadow that reaches the eastern edge of the graveyard. The corridors between the vehicle rows are still dark at ground level, the metal bodies blocking the low sun, and you can hear things settling in those corridors — the ping of metal expanding in the first heat, or the sound of something that spent the night in there beginning to move.',
    shortDescription: 'A vehicle graveyard. Good salvage. Bad sightlines.',
    exits: { north: 'du_03_alkali_flat', east: 'du_04_ghost_main', south: 'du_13_deep_dunes' },
    richExits: {
      north: { destination: 'du_03_alkali_flat', descriptionVerbose: 'north across the alkali flat' },
      east: { destination: 'du_04_ghost_main', descriptionVerbose: 'east to the ghost town' },
      south: { destination: 'du_13_deep_dunes', descriptionVerbose: 'south into the deep dunes' },
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
        skillCheck: { skill: 'tracking', dc: 9, successAppend: 'Wait — you trace the arrow logic from the outside in rather than from inside out. There\'s a center to this maze and someone built it intentionally. The arrows guide you to a 1987 Chevy Blazer with its roof cut off and a campsite installed inside — fire ring, bedroll, supply cache. Someone lived here.' },
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
        { type: 'shuffler', weight: 40, quantity: { min: 2, max: 5, distribution: 'bell' } },
        { type: 'remnant', weight: 30, quantity: { min: 1, max: 3, distribution: 'weighted_low' } },
        { type: 'whisperer', weight: 20, quantity: { min: 1, max: 1, distribution: 'single' } },
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
    description: 'The shimmer is specific here, not generic: the heat bends the air into a small town that doesn\'t exist — storefronts, a water tower, a gas station with intact pumps, the way the ghost town looked before the Collapse. It holds for four or five seconds before your brain catches up with your eyes. The ground is fractured ceramic clay, each piece curled at the edges like a dried leaf. The smell is mineral and hot and something underneath that you associate with old electronics, old ozone, old purpose. Your shadow is slightly wrong. Your water tastes like you already drank it.',
    descriptionNight: 'At night the Mirage produces something different — cold air inversions that make distant lights seem close. The stars reflect off patches of mica in the clay. A shape on the horizon may be a building, a Hollow, or nothing at all. And occasionally: a light that moves at walking pace, stops, moves again, then is gone. Perception becomes a liability here. Trust your feet over your eyes.',
    shortDescription: 'Open desert. The heat shows you a town that isn\'t there. Perception unreliable.',
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
        keywords: ['shimmer', 'mirage', 'town', 'illusion', 'water'],
        description: 'You walk toward the shimmer. It holds longer than it should — storefronts, a water tower, a gas station with intact pumps, the ghost town as it looked before whatever happened to it happened. Then it shreds. The physics are simple: bent light, differential air densities, your brain\'s desperate assembly of familiar shapes from noise. Understanding the mechanism doesn\'t make the loss less specific when it dissolves.',
        skillCheck: { skill: 'perception', dc: 12, successAppend: 'Wait — that shape isn\'t moving. You walk toward it and it stays put. Not a mirage. A figure, sitting motionless in the open heat. Human-shaped. It doesn\'t react when you approach. It\'s been here a while.' },
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
    environmentalRolls: {
      flavorLines: [
        { line: 'The shimmer shows you something for a moment — a complete building, a street, the ghost town intact. Then heat-distortion shreds it. You know what you saw.', chance: 0.30, time: ['day'] },
        { line: 'Your mouth is dry. The mirage offers water and you know it isn\'t water and your body doesn\'t fully accept the reasoning.', chance: 0.25, time: ['day'] },
        { line: 'A sound carries from the right direction to be the ghost town, but the ghost town is silent. The clay plays tricks with sound the same way it plays tricks with light.', chance: 0.20, time: null },
      ],
    },
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
    narrativeNotes: 'Disorienting zone. Whisperer spawn is thematically appropriate — the Mirage produces hallucinations, the Whisperer is a walking hallucination. Perception check reveals a hidden encounter. The mirage now shows a specific vision: the ghost town intact, pre-Collapse.',
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
    descriptionDawn: 'The antenna catches the first light before anything else — a hundred and twenty feet of lattice steel lit from the east, the crossbraces throwing small shadows down the tower face. The concrete pad is cold under your feet. The equipment shed hum is there if you listen, steady beneath the dawn wind, unchanged by the hour. The signal doesn\'t sleep. Whatever is broadcasting doesn\'t care what time it is.',
    descriptionDusk: 'At dusk the tower becomes a line drawn against the darkening west, the lattice structure simplified by the failing light into something that looks like a single black stroke from antenna to pad. The hum from the equipment shed is louder at night — or the desert is quieter, which amounts to the same thing. The signal is stronger after dark. You\'ve heard others say this. The signal is stronger after dark and nobody knows why and nobody has asked the right question, which is: stronger for whom.',
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
      baseChance: 0.40,
      timeModifier: { day: 0.80, night: 1.8, dawn: 0.9, dusk: 1.4 },
      threatPool: [
        { type: 'shuffler', weight: 65, quantity: { min: 1, max: 2, distribution: 'weighted_low' } },
        { type: 'remnant', weight: 30, quantity: { min: 1, max: 1, distribution: 'single' } },
        { type: 'brute', weight: 5, quantity: { min: 1, max: 1, distribution: 'single' } },
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
    descriptionDusk: 'Dusk at the western edge is the longest sunset you have ever watched. There is nothing between you and the horizon to interrupt it — the light goes from gold to orange to a deep red that stains the hardpan and the distant mesas and your own hands the same color. The footprints heading west are visible in the raking light, the shadows they throw deeper than the prints themselves, a trail of small dark pits leading toward the nothing. The wind from the west carries the last warmth of the day and then, abruptly, stops. The temperature falls. The color drains from everything simultaneously. The desert doesn\'t transition to night. It switches.',
    shortDescription: 'The western limit of explored territory. Vastness beyond.',
    exits: { east: 'du_10_ranch', north: 'du_11_radio_tower', south: 'du_16_trader_camp' },
    richExits: {
      east: { destination: 'du_10_ranch', descriptionVerbose: 'east toward the ranch compound' },
      north: { destination: 'du_11_radio_tower', descriptionVerbose: 'north toward the radio tower' },
      south: { destination: 'du_16_trader_camp', descriptionVerbose: 'south into the deep Dust — a faint track suggests others have gone this way' },
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
      baseChance: 0.40,
      timeModifier: { day: 0.70, night: 1.5, dawn: 0.6, dusk: 1.0 },
      threatPool: [
        { type: 'shuffler', weight: 65, quantity: { min: 1, max: 1, distribution: 'single' } },
        { type: 'remnant', weight: 30, quantity: { min: 1, max: 1, distribution: 'single' } },
        { type: 'brute', weight: 5, quantity: { min: 1, max: 1, distribution: 'single' } },
      ],
      awarenessRoll: { unaware: 0.7, awarePassive: 0.2, awareAggressive: 0.1 },
    },
    personalLossEchoes: {
      child: 'The footprints go west and do not come back. One set, going. You have been following absence since you lost them — reading the signs of someone who was here and isn\'t, tracking the direction they went, standing at the edge of the territory where the trail runs out. The western edge is where the trail always runs out. You stand here and you do not walk west. Not today.',
      partner: 'The wind from the west has traveled a hundred miles without touching anything human. You breathe it and it is the cleanest air since the Collapse and it is the loneliest air since the Collapse and you cannot tell the difference anymore between clean and lonely because they lived in the same place, with you, and now both of them are gone.',
      identity: 'This is just as far as anyone goes. The edge of the mapped world. Beyond this, the desert continues without feature or name, and names are the thing you\'ve been losing since you woke up without yours. The western nothing is honest in a way the mapped world isn\'t — it doesn\'t pretend to know you. It doesn\'t pretend anything.',
    },
    environmentalRolls: {
      flavorLines: [
        { line: 'The wind stops. For three seconds the Dust is perfectly still, the silence so total you hear your own blood. Then the wind resumes, as if it paused to listen to the same silence you did.', chance: 0.20, time: null },
        { line: 'A distant mesa catches the light at an angle that makes it look inhabited — a window flash, a roofline. Then the angle changes and it is just rock, and has always been just rock.', chance: 0.15, time: ['day', 'dusk'] },
        { line: 'The footprints going west are slightly more filled than they were the last time you looked. The desert is patient. It will erase this person completely, given time.', chance: 0.20, time: null },
      ],
    },
    narrativeNotes: 'Map boundary room. Philosophical and quiet. The footprints going west are a mystery with no resolution — someone chose to walk into the nothing. This is the mood.',
  },

  {
    id: 'du_13_deep_dunes',
    name: 'The Deep Dunes',
    zone: 'the_dust',
    act: 2,
    difficulty: 4,
    visited: false,
    flags: { scavengingZone: false },
    description: 'Sand deep enough to swallow you to the knee with every step. The dunes here have consumed whatever used to be here — road, fence, signage, all of it buried under wave after wave of windblown soil that looks deceptively solid until you step on it and feel your leg drop. Navigation is gone. The landmarks you came in by have already been erased. Your tracks behind you are half-filled before you turn around to check them. The wind doesn\'t stop here. It just changes direction.',
    descriptionNight: 'At night the deep dunes are a moonscape — silver crests and absolute shadow valleys. Distance becomes a theory. A dune that looks twenty yards away is sixty, or it\'s ten and the scale is wrong. You can navigate by stars but that requires knowing which star to follow, and the Dust gives you the whole sky with no guidance at all.',
    descriptionDawn: 'Dawn light slants across the dune faces and reveals the wind\'s work — ridgelines sharp as blades, each grain of sand placed by air into the most aerodynamic position possible. It would be beautiful if you weren\'t knee-deep in it.',
    shortDescription: 'Deep dunes. Knee-high sand. Tracks erase instantly.',
    exits: { north: 'du_08_boneyard', west: 'du_14_farmhouse', east: 'du_17_bleached_road', south: 'du_18_sand_hollow' },
    richExits: {
      north: { destination: 'du_08_boneyard', descriptionVerbose: 'north — the hardpack of the boneyard area, if you can find it again' },
      west: { destination: 'du_14_farmhouse', descriptionVerbose: 'a structure visible above the sand to the west — upper floor only' },
      east: { destination: 'du_17_bleached_road', descriptionVerbose: 'east, where the dunes thin and something pale and flat shows through' },
      south: { destination: 'du_18_sand_hollow', descriptionVerbose: 'south into a bowl depression — the dunes funnel you down', skillGate: { skill: 'survival', dc: 12, failMessage: 'You start down into the hollow and something about the air — the stillness, the smell, the way sound changes — stops you. Not yet.' } },
    },
    items: [],
    enemies: [],
    npcs: [],
    extras: [
      {
        keywords: ['sand', 'dunes', 'deep', 'sink'],
        description: 'You test the surface ahead before committing weight. Half the time the crust holds and you walk on top. Half the time it doesn\'t and your leg drops, thigh-deep into loose sand that grabs and doesn\'t want to release. Pulling out takes both hands and a minute of careful work. The dunes have a logic but it\'s not one you can learn fast enough for it to help.',
      },
      {
        keywords: ['tracks', 'footprints', 'wind', 'erased'],
        description: 'You stop and watch your own tracks fill in. The wind is consistent from the northwest and it moves sand in sheets at ankle height — you can watch the grains travel, each one a tiny translation of force into distance. Your prints go from defined to ghost to gone in about four minutes. No one could track you here. No one could track anything here.',
        skillCheck: { skill: 'tracking', dc: 14, successAppend: 'Under the loose top layer, the sand has been compressed by repeated heavy passage — a wide track, wider than human, moving in a consistent arc toward the south hollow. Fresh within the last few hours. Whatever made it was big and it came through here more than once.' },
      },
      {
        keywords: ['landmarks', 'navigate', 'direction', 'orientation'],
        description: 'The sun is your only reliable reference, and in the Dust the sun is not your friend. You picked three landmarks coming in. They\'re gone now — buried, drifted, or were never as fixed as you thought. The wind erased them or you moved and couldn\'t tell. The dunes look identical from every angle. You are, technically, not lost — you know which direction is north. You just can\'t see forty feet in any direction.',
        skillCheck: { skill: 'survival', dc: 11, successAppend: 'You pull a different technique: pace counting and sun angle. You\'ve traveled this far in this direction. You know roughly where that puts you. It\'s not precise but it\'s not guessing. You mark a mental map and commit to it, knowing the margin of error is measured in hundreds of yards.' },
      },
      {
        keywords: ['horizon', 'crest', 'ridge'],
        description: 'From the top of the highest dune you can reach — a process that takes three attempts because the crests collapse under your weight — you can see the surrounding country for about half a mile before the shimmer and the next dune wall cuts off the view. The farmhouse to the west is just a roofline. The bleached road to the east is a white smear. Nothing else.',
      },
    ],
    hollowEncounter: {
      baseChance: 0.45,
      timeModifier: { day: 1.0, night: 2.5, dawn: 1.3, dusk: 2.0 },
      noiseModifier: 0.5,
      threatPool: [
        { type: 'shuffler', weight: 40, quantity: { min: 1, max: 3, distribution: 'weighted_low' } },
        { type: 'remnant', weight: 40, quantity: { min: 1, max: 2, distribution: 'weighted_low' } },
        { type: 'brute', weight: 20, quantity: { min: 1, max: 1, distribution: 'single' } },
      ],
      awarenessRoll: { unaware: 0.2, awarePassive: 0.4, awareAggressive: 0.4 },
      activityPool: {
        remnant: [
          { desc: 'moves through the dunes with a confidence that makes no sense — it doesn\'t sink, its gait is adapted, feet finding the stable substrate under the loose layer like it has been doing this for years', weight: 3 },
          { desc: 'stands motionless on a dune crest, oriented toward the hollow to the south, as if listening for something below', weight: 2 },
        ],
        brute: [
          { desc: 'wades through the deep sand without effort, massive weight distributed somehow across its altered gait — the dunes don\'t slow it the way they slow you', weight: 3 },
        ],
      },
    },
    environmentalRolls: {
      flavorLines: [
        { line: 'The sand shifts under you with a low, percussive groan — the dune settling.', chance: 0.30, time: null },
        { line: 'Wind changes direction and for a moment you\'re walking into it blind, sand against your face.', chance: 0.20, time: ['day', 'dusk'] },
        { line: 'You hear something under the sand. A creak, like wood under weight. The dunes have buried something structural.', chance: 0.15, time: null },
      ],
    },
    narrativeNotes: 'Navigation dead zone. The key mechanical feature is the erasing of tracks — stealth in the Dust is impossible here, but tracking is also impossible. Hollows adapted to the dunes are a visual shift. Gate to Sand Hollow.',
  },

  {
    id: 'du_14_farmhouse',
    name: 'Buried Farmhouse',
    zone: 'the_dust',
    act: 2,
    difficulty: 3,
    visited: false,
    flags: { scavengingZone: true, campfireAllowed: false },
    description: 'A two-story farmhouse subsiding into the dunes — the ground floor has been swallowed to the window sills, and a drift of fine sand has banked against the south wall to the second-floor eave. The upper floor is exposed: two bedrooms, a bathroom, a hallway. Everything at a slight tilt from the foundation shift. The lower floor is accessible through a broken window that a previous visitor forced — you drop six feet into sand-filled darkness, then more sand, then the buried kitchen floor. Someone else has been here recently. The sand inside the window is compressed by foot traffic.',
    descriptionNight: 'The farmhouse at night is full of wind sounds — sand sifting through cracks in the walls, a loose shutter on the upper floor working in the breeze, the structural groans of a building that is slowly losing its argument with gravity and geology. Inside, below the sand, something catches the faint light from the broken window. Glass. Or eyes.',
    shortDescription: 'A farmhouse half-buried in dunes. Upper floor accessible, lower floor through a window.',
    exits: { east: 'du_13_deep_dunes', south: 'du_15_dry_well', down: 'du_14_farmhouse' },
    richExits: {
      east: { destination: 'du_13_deep_dunes', descriptionVerbose: 'east back into the deep dunes' },
      south: { destination: 'du_15_dry_well', descriptionVerbose: 'south, a few hundred yards — a stone ring visible above the sand line' },
      down: {
        destination: 'du_14_farmhouse',
        descriptionVerbose: 'through the broken window, into the buried ground floor',
        skillGate: { skill: 'climbing', dc: 7, failMessage: 'The drop is six feet into sand and darkness. You can\'t find a foothold and don\'t trust the landing.' },
      },
    },
    items: ['ghost_town_diary'],
    enemies: [],
    npcs: [],
    extras: [
      {
        keywords: ['upper floor', 'bedrooms', 'bedroom', 'hallway'],
        description: 'Two bedrooms. One is a child\'s room — bunk beds, both bunks still made, a mobile of painted wood animals hanging motionless in the still air. A chore chart on the wall lists names: EMMA, CASEY. The other bedroom is the parents\' room, larger, with a quilt on the bed and two books on the nightstand. One is a Bible. One is a paperback thriller with a bookmark at page 214.',
        skillCheck: { skill: 'lore', dc: 8, successAppend: 'The book on the nightstand is a seed catalog, not a thriller — same dimensions, someone used the cover to protect the catalog\'s soft cover. The catalog is from 2030, heavily annotated: drought-resistant varieties circled, rainfall charts filled in by hand. They were trying to adapt. They were doing the work.' },
      },
      {
        keywords: ['child', 'chore chart', 'mobile', 'bunk', 'bunks'],
        description: 'EMMA: Monday — feed chickens, Tuesday — weed garden, Wednesday — sweep porch. CASEY: Monday — collect eggs, Tuesday — water beds, Wednesday — stack wood. The chores stop at Wednesday. The chart is for a week in August. The week the Collapse spread this far.',
      },
      {
        keywords: ['lower floor', 'kitchen', 'ground floor', 'window', 'sand'],
        description: 'The drop through the broken window lands you in compacted sand. The kitchen is buried to counter height — only the upper cabinets are accessible. The sand has preserved everything it covered: a calendar still on the wall (August 2031), dishes still on the counter, a cup of pens next to the phone charger. Everything preserved in the amber of desiccation and burial. The refrigerator is above the sand line by six inches. It has been opened. Something — someone — opened it after the sand came in.',
        skillCheck: { skill: 'scavenging', dc: 10, successAppend: 'The upper cabinets, mostly inaccessible from normal height, hold the long-term stores: sealed mason jars, dried goods in vacuum-packed bags, a canned food cache that someone else missed because they didn\'t think to look up. Seven jars of canned vegetables, still good. A bag of flour, sealed, but compromised by humidity — baking is out, but it\'s bulk calories. Two sealed bottles of aspirin.' },
      },
      {
        keywords: ['calendar', 'august', 'date', 'wall'],
        description: 'AUGUST 2031. The month is open — no future pages because it\'s the current month. Several dates have appointments noted: Cass dentist (7th), County fair (14th-16th), Casey band concert (22nd). The 22nd has a star drawn next to it. The 23rd has nothing. The 24th has nothing. The Collapse reached the Four Corners in late August 2031. The calendar didn\'t know that yet.',
      },
      {
        keywords: ['quilt', 'bed', 'books', 'nightstand'],
        description: 'The quilt is handmade — interlocking hexagons in earth tones, skilled work. Whoever made it put hundreds of hours into it. It\'s still on the bed. The Bible has a name written inside the front cover in careful cursive: Margaret Ann Delacroix. Below it, in different ink: and family. A later addition.',
      },
    ],
    itemSpawns: [
      {
        entityId: 'canned_food',
        spawnChance: 0.55,
        quantity: { min: 2, max: 5, distribution: 'bell' },
        conditionRoll: { min: 0.70, max: 0.95 },
        groundDescription: 'Mason jars and canned goods in the upper kitchen cabinets, sand-preserved.',
        depletion: { cooldownMinutes: { min: 360, max: 1440 }, respawnChance: 0.10 },
      },
      {
        entityId: 'purification_tabs',
        spawnChance: 0.35,
        quantity: { min: 1, max: 2, distribution: 'weighted_low' },
        conditionRoll: { min: 0.75, max: 0.95 },
        groundDescription: 'A sealed bottle of water purification tablets on the kitchen windowsill.',
        depletion: { cooldownMinutes: { min: 480, max: 1440 }, respawnChance: 0.15 },
      },
      {
        entityId: 'torn_note_fragment',
        spawnChance: 0.70,
        quantity: { min: 1, max: 1, distribution: 'single' },
        conditionRoll: { min: 0.60, max: 0.85 },
        groundDescription: 'A handwritten note tucked under the Bible on the nightstand.',
      },
    ],
    hollowEncounter: {
      baseChance: 0.40,
      timeModifier: { day: 0.80, night: 2.0, dawn: 1.0, dusk: 1.6 },
      threatPool: [
        { type: 'remnant', weight: 60, quantity: { min: 1, max: 2, distribution: 'weighted_low' } },
        { type: 'shuffler', weight: 40, quantity: { min: 1, max: 2, distribution: 'weighted_low' } },
      ],
      awarenessRoll: { unaware: 0.5, awarePassive: 0.35, awareAggressive: 0.15 },
      activityPool: {
        remnant: [
          { desc: 'sits in a chair in the upper hallway, hands folded in its lap, head tilted toward the child\'s room — not moving, not looking, but oriented toward it with the specific attention of something remembering', weight: 3 },
          { desc: 'stands in the buried kitchen, visible through the broken window from above, waist-deep in sand, hands moving through the motion of washing dishes in a sink that isn\'t there', weight: 2 },
        ],
      },
    },
    personalLossEchoes: {
      child: 'Emma. Casey. The chore chart. You don\'t read the names again after the first time.',
      partner: 'Margaret Ann Delacroix and family. Two different hands wrote that. Someone added themselves to a name that didn\'t include them yet, and then was included.',
    },
    narrativeNotes: 'Emotional core of the new rooms. Pre-collapse family home preserved in sand. The descent through the window is both mechanical (climbing check) and thematic. Personal loss echoes are important here. The ghost_town_diary item gives a voice to the Delacroix family.',
  },

  {
    id: 'du_15_dry_well',
    name: 'The Dry Well',
    zone: 'the_dust',
    act: 2,
    difficulty: 3,
    visited: false,
    flags: { scavengingZone: false },
    description: 'A hand-dug stone well, old enough that the stone ring at the top has been worn smooth by a hundred years of bucket rope and farmer hands. Bone dry — has been for decades, probably, before the Collapse made the distinction academic. The silt inside goes down at least forty feet judging by the feel of the air rising from it, which is cool and mineral and carries the smell of deep earth. Someone lowered a rope down recently: the rope is knotted at the rim, dropped through the ring, and disappears into the dark. The knots are competent. The rope has weight on it — something is attached at the bottom.',
    descriptionNight: 'The well at night is a hole in the dark, perfectly circular, the stars reflected in nothing because there\'s nothing to reflect them. The rope moves slightly in the upwelling air from the shaft. The cool breath from the deep earth is the most comfortable thing in the Dust. You could stand here for hours. The rope has been here through at least one set of nights. Whoever left it isn\'t coming back in a hurry.',
    shortDescription: 'A bone-dry stone well. Someone\'s rope hangs in it. Something is attached at the bottom.',
    exits: { north: 'du_14_farmhouse' },
    richExits: {
      north: { destination: 'du_14_farmhouse', descriptionVerbose: 'north back to the buried farmhouse' },
    },
    items: [],
    enemies: [],
    npcs: [],
    extras: [
      {
        keywords: ['rope', 'knot', 'knotted', 'knots'],
        description: 'The rope is good — braided nylon, not the frayed hemp that you usually find. Someone brought this from somewhere that still has hardware supply. The knots at the rim are a double-figure-eight loop around the stone, bomber, the kind of rigging you\'d learn from a serious outdoor program or someone who had to trust their knots. Below that, the rope drops straight. Clean. No one lowered themselves carelessly.',
        skillCheck: { skill: 'survival', dc: 9, successAppend: 'The rope diameter and the amount of it — maybe sixty feet total — suggest someone planned this descent. You can see scuff marks on the inside of the stone ring where the rope has been hauled across it repeatedly. This isn\'t a one-time drop. Whoever left the rope has been using it.' },
      },
      {
        keywords: ['well', 'shaft', 'bottom', 'dark', 'depth'],
        description: 'You drop a stone and count. The sound of impact comes back at around three seconds — thirty feet of drop, plus silt. Whatever is attached to the bottom of the rope is resting on compacted silt at the base of a stone shaft that has been dry for a generation. You can\'t see it. The air from below is cool, like basement air, and it carries the smell of old rock and something else, faint — rubber, or plastic, or both.',
        skillCheck: { skill: 'climbing', dc: 10, successAppend: 'You descend the rope hand over hand, back against the stone shaft, legs braced. At the bottom: a waterproof dry bag, lashed to the rope end with the same competent knots as the top. Inside the bag: two water purification kits still factory-sealed, a first aid kit, a short-barreled pistol with two loaded magazines, and a handwritten list of coordinates. Someone pre-positioned a cache. They expected to need it.' },
      },
      {
        keywords: ['stone', 'ring', 'rim', 'carved', 'wear'],
        description: 'The stone ring has been worn by ropes and chains and bucket handles over a century of use. You can feel the groove where the bucket rope ran. Someone scratched their initials into the stone — ELD, 1947 — and three other sets of initials at different heights as the stone wore down over time. Four generations of people who used this well. Then the water left and so did they.',
      },
      {
        keywords: ['air', 'breath', 'cool', 'smell', 'earth'],
        description: 'The upwelling from the shaft is the coolest air you\'ve encountered in the Dust. The temperature differential is measurable — you hold your hand over the opening and feel it distinctly. Deep earth holds cold differently than surface ground. The shaft goes down through forty feet of silt and then into the original stone-lined portion, which continues to some unknown depth. The aquifer that once filled it is still there, probably. Just lower. Much lower.',
      },
    ],
    itemSpawns: [
      {
        entityId: 'water_bottle_sealed',
        spawnChance: 0.40,
        quantity: { min: 1, max: 2, distribution: 'weighted_low' },
        conditionRoll: { min: 0.80, max: 0.95 },
        groundDescription: 'Sealed water containers in the pre-positioned cache at the bottom of the well shaft.',
        depletion: { cooldownMinutes: { min: 720, max: 2880 }, respawnChance: 0.10 },
      },
      {
        entityId: 'purification_tabs',
        spawnChance: 0.50,
        quantity: { min: 1, max: 2, distribution: 'flat' },
        conditionRoll: { min: 0.85, max: 0.99 },
        groundDescription: 'Factory-sealed water purification kits in the dry bag cache.',
        depletion: { cooldownMinutes: { min: 720, max: 2880 }, respawnChance: 0.10 },
      },
      {
        entityId: '9mm_pistol',
        spawnChance: 0.25,
        quantity: { min: 1, max: 1, distribution: 'single' },
        conditionRoll: { min: 0.75, max: 0.90 },
        groundDescription: 'A short-barreled pistol with two loaded magazines, wrapped in oilcloth inside the cache.',
        depletion: { cooldownMinutes: { min: 2880, max: 10080 }, respawnChance: 0.05 },
      },
    ],
    hollowEncounter: {
      baseChance: 0.40,
      timeModifier: { day: 0.75, night: 1.5, dawn: 0.8, dusk: 1.2 },
      threatPool: [
        { type: 'shuffler', weight: 65, quantity: { min: 1, max: 2, distribution: 'weighted_low' } },
        { type: 'remnant', weight: 30, quantity: { min: 1, max: 1, distribution: 'single' } },
        { type: 'brute', weight: 5, quantity: { min: 1, max: 1, distribution: 'single' } },
      ],
      awarenessRoll: { unaware: 0.6, awarePassive: 0.3, awareAggressive: 0.1 },
      activityPool: {
        remnant: [
          { desc: 'stands at the well rim, looking down, both hands on the stone as if it\'s about to lower something — or retrieve something. It doesn\'t move.', weight: 3 },
        ],
      },
    },
    narrativeNotes: 'The rope and cache are the reward for players who explore this dead-end. The cache is a significant find — suggests another active player in the Dust, someone who planned for return trips. The coordinate list is a hook for later.',
  },

  {
    id: 'du_16_trader_camp',
    name: 'Dust Trader Camp',
    zone: 'the_dust',
    act: 2,
    difficulty: 3,
    visited: false,
    flags: { campfireAllowed: true, scavengingZone: true, fastTravelWaypoint: false },
    description: 'A camp that is still warm. The fire pit has coals that glow when the wind stirs them — whoever was here left within the last few hours. Three bedrolls, two pack frames stacked against a salvaged vehicle door propped as a windbreak, a cook pot with the remnants of something still in it. Trade goods are cached under an oilcloth tarp: bolts of rough cloth, sealed containers, something heavy that clinks. The Dust trade routes run through here because this is one of the few navigable paths across the dunes. The traders will be back. Probably.',
    descriptionNight: 'At night the camp\'s coal is the only warm light for miles — a faint orange pulse that breathes with the wind. The bedrolls are still here, meaning whoever left intended to return. The pack frames lean against the windbreak in a way that suggests they\'ll be needed. The cook pot has been covered. Someone covered it before they left.',
    shortDescription: 'A trader camp, recently vacated. Fire still warm. Supplies cached.',
    exits: { north: 'du_12_west_edge', east: 'du_13_deep_dunes', west: 'du_17_bleached_road' },
    richExits: {
      north: { destination: 'du_12_west_edge', descriptionVerbose: 'north back toward the Dust western edge' },
      east: { destination: 'du_13_deep_dunes', descriptionVerbose: 'east into the deep dunes — the trade route continues' },
      west: { destination: 'du_17_bleached_road', descriptionVerbose: 'west, where the old highway is visible' },
    },
    items: [],
    enemies: [],
    npcs: [],
    npcSpawns: [
      {
        npcId: 'drifter_cart_team',
        spawnChance: 0.45,
        spawnType: 'wanderer',
        activityPool: [
          { desc: 'sorts through trade goods under the oilcloth tarp, assessing what to carry forward and what to leave cached', weight: 3 },
          { desc: 'tends the fire, adding small fuel, watching the coals with the patience of someone who has done this particular camp routine hundreds of times', weight: 2 },
          { desc: 'consults a hand-drawn map spread on the ground, held flat by rocks at the corners, tracing a route with a finger', weight: 2 },
        ],
        dispositionRoll: { friendly: 0.3, neutral: 0.5, wary: 0.2 },
        tradeInventory: ['purification_tabs', 'dried_meat_strip', 'bandages', 'scrap_metal', 'ammo_22lr', 'crafting_components'],
        narrativeNotes: 'Dust route traders. Neutral by default. Willing to trade. May have information about route conditions.',
      },
      {
        npcId: 'map_seller_reno',
        spawnChance: 0.20,
        spawnType: 'wanderer',
        activityPool: [
          { desc: 'sits cross-legged by the fire, copying something from a worn notebook into a fresh one with careful, small handwriting', weight: 3 },
          { desc: 'looks up when you approach with the particular alertness of someone who has been watching the dunes and was hoping it wasn\'t a Hollow coming over them', weight: 2 },
        ],
        dispositionRoll: { friendly: 0.4, neutral: 0.5, wary: 0.1 },
        tradeInventory: ['radio_fragment', 'torn_note_fragment'],
        narrativeNotes: 'Map seller. Has route information and possibly a partial map of the deep Dust dune paths.',
      },
    ],
    extras: [
      {
        keywords: ['fire', 'coals', 'embers', 'pit'],
        description: 'You hold a hand over the pit. Still hot enough to cook on. The fire was banked — ash raked over the coals to hold them — the way you do it when you\'re coming back. Three stones arranged to support a pot. The pot itself has been cleaned and inverted over the pit to protect the coals from wind. These are not the habits of people who abandon their camps.',
      },
      {
        keywords: ['tarp', 'goods', 'trade', 'cache', 'oilcloth'],
        description: 'The oilcloth is weighted with stones at the corners. Under it: bolts of rough-woven cloth in utility colors, sealed glass jars of unidentifiable dry goods, a flat case of something that might be medicine or might be something else, and a canvas bag that clinks with metal — .22lr casings, sorted by headstamp into small cloth bags. Someone is moving ammunition through the Dust in sorted lots. That\'s a specific kind of trade.',
        skillCheck: { skill: 'negotiation', dc: 9, successAppend: 'The sorting pattern is consistent with a Drifter supply run — they move ammo from the Salt Creek reloaders to contacts in the ranch country south of the Dust. The cloth bolts are going east, probably. You can read a trade route from the goods if you know what to look for.' },
      },
      {
        keywords: ['bedroll', 'bedrolls', 'pack', 'frames'],
        description: 'Three bedrolls, each one a different construction — one is factory camping gear, maintained but aging; one is a homemade quilt rolled tight; one is a military surplus sleeping bag, modified with a wool liner. Three different people, three different origins, traveling the same route. The pack frames against the windbreak are loaded with empty carrying capacity — they\'ve delivered their outbound cargo and are staged for loading the return goods.',
      },
      {
        keywords: ['map', 'route', 'path', 'directions'],
        description: 'Under one of the pack frames, a small notebook has been left open. The visible page shows a hand-drawn route map of the deep Dust — the dune paths rendered in careful dotted lines, landmarks noted by description rather than name: "rock shaped like fist," "three dead trees," "hollow where the sand bowls." The route through the dunes is not the route you came in by. It\'s better.',
        skillCheck: { skill: 'perception', dc: 8, successAppend: 'There\'s a second map folded inside the back cover — older, more detailed, covering a wider area. The Sand Hollow is marked with a symbol you recognize: the same one scratched into the rest stop graffiti to indicate danger. Below the symbol, in the same hand: don\'t camp, don\'t linger, move through fast if you move through at all.' },
      },
    ],
    itemSpawns: [
      {
        entityId: 'dried_meat_strip',
        spawnChance: 0.50,
        quantity: { min: 1, max: 3, distribution: 'weighted_low' },
        conditionRoll: { min: 0.70, max: 0.90 },
        groundDescription: 'Dried meat portions in the cook pot or stored with the camp supplies.',
        depletion: { cooldownMinutes: { min: 180, max: 600 }, respawnChance: 0.30 },
      },
      {
        entityId: 'purification_tabs',
        spawnChance: 0.35,
        quantity: { min: 1, max: 2, distribution: 'weighted_low' },
        conditionRoll: { min: 0.75, max: 0.95 },
        groundDescription: 'Water treatment supplies cached with the trade goods.',
        depletion: { cooldownMinutes: { min: 240, max: 720 }, respawnChance: 0.20 },
      },
      {
        entityId: 'ammo_22lr',
        spawnChance: 0.40,
        quantity: { min: 5, max: 20, distribution: 'bell' },
        conditionRoll: { min: 0.80, max: 0.99 },
        groundDescription: 'Sorted .22lr casings in small cloth bags under the tarp.',
        depletion: { cooldownMinutes: { min: 480, max: 1440 }, respawnChance: 0.20 },
      },
    ],
    hollowEncounter: {
      baseChance: 0.40,
      timeModifier: { day: 0.80, night: 2.0, dawn: 1.0, dusk: 1.5 },
      threatPool: [
        { type: 'shuffler', weight: 65, quantity: { min: 1, max: 3, distribution: 'weighted_low' } },
        { type: 'remnant', weight: 30, quantity: { min: 1, max: 2, distribution: 'weighted_low' } },
        { type: 'brute', weight: 5, quantity: { min: 1, max: 1, distribution: 'single' } },
      ],
      awarenessRoll: { unaware: 0.4, awarePassive: 0.4, awareAggressive: 0.2 },
    },
    narrativeNotes: 'Social node in the deep Dust. The traders will be back or they won\'t — the NPC spawn determines which version the player gets. Warm coals imply recent life without requiring NPCs to be present. The trade goods and sorted ammo suggest organized Drifter supply networks.',
  },

  {
    id: 'du_17_bleached_road',
    name: 'The Bleached Road',
    zone: 'the_dust',
    act: 2,
    difficulty: 3,
    visited: false,
    flags: { scavengingZone: false },
    description: 'A stretch of old two-lane highway scoured clean by seven years of wind. The concrete is white — no lane markings, no center line, no shoulder paint. The wind took all of it. The surface is smooth except where frost heaves cracked it and the sand worked into the gaps. Dust blows across the road surface in continuous sheets at ankle height, like a river moving sideways. Crossing it feels exposed in a way the open dunes don\'t — you\'re a vertical object on a flat horizontal plane, and the sightlines run for half a mile in both directions. Anything watching has an unobstructed view.',
    descriptionNight: 'At night the bleached road is ghost-white under the moon — the white concrete seems to emit light, to be brighter than the surrounding desert. It\'s a landmark visible for miles. Standing on it at night is like standing on a stage with the lights up. The dust sheets that blow across it are silver and continuous and they erase your footprints as fast as you make them.',
    descriptionDawn: 'At dawn the road glows pink, then orange, then white. The first light finds it before anything else in the Dust because there\'s nothing to cast shadow on it. The day starts here earlier than it starts anywhere else. The sand sheets have settled in the cool night air and for a few minutes the road surface is clean, empty, pristine — and then the wind finds it again.',
    shortDescription: 'Old highway, wind-scoured white. Exposed. Long sightlines.',
    exits: { east: 'du_16_trader_camp', west: 'du_13_deep_dunes' },
    richExits: {
      east: { destination: 'du_16_trader_camp', descriptionVerbose: 'east toward the trader camp area' },
      west: { destination: 'du_13_deep_dunes', descriptionVerbose: 'west into the deep dunes — the road disappears into sand within a quarter mile' },
    },
    items: [],
    enemies: [],
    npcs: [],
    extras: [
      {
        keywords: ['road', 'highway', 'concrete', 'surface'],
        description: 'You look for any vestige of the original markings. Nothing. The wind abraded the paint down to the concrete surface and then continued abrading the concrete. The aggregate shows through in places — small stones of varying color embedded in the cement matrix. This road was built in the 1960s, probably. It was built to carry cars and trucks and it is now carrying wind and you and occasional Hollows and nothing else.',
        skillCheck: { skill: 'perception', dc: 9, successAppend: 'In the concrete, pressed into a soft section during original pour: a date stamp from the contractor. 1962. Below it, scratched in recent times with something metal: MERIDIAN RECLAIMERS PATROL ROUTE 7. A date below that, two years ago. This road is on someone\'s route map.' },
      },
      {
        keywords: ['dust', 'sand', 'sheets', 'wind'],
        description: 'The sand travels in organized layers — heaviest grains at ground level, finer above, a graded distribution that the wind sorts automatically. You can watch the physics of it in real time: grain size determining travel height, wind speed determining velocity, the road surface acting as a low-friction channel that accelerates the flow. The dust sheets are beautiful if you\'re not the thing they\'re erasing.',
      },
      {
        keywords: ['sightlines', 'exposed', 'visible', 'sight'],
        description: 'You stop in the middle of the road and look both directions. Half a mile of visibility in each direction, clear and flat. If anything is watching from those distances, it sees you perfectly. If you\'re watching from this position, you see everything that uses this road. The calculus of exposure cuts both ways. You stay low when you cross and you cross fast.',
        skillCheck: { skill: 'stealth', dc: 10, successAppend: 'There\'s a drainage culvert under the road, intact — the concrete cap is gone but the steel pipe is accessible from the roadside. Tight, but you can fit. From inside, you can watch the road surface through both ends. A hide with clear sightlines and complete concealment. Someone else has used it: there\'s a cloth bundle inside with a rope tied through it, wedged against the culvert wall.' },
      },
      {
        keywords: ['footprints', 'tracks', 'prints'],
        description: 'The road surface doesn\'t hold tracks — the sand sheets erase them continuously. But the shoulder, where the hardpack meets the road edge, holds prints for a short time. You can read the last few hours of traffic: a wheeled cart, narrow-gauge, pulled by something or someone. Two sets of boot prints, same direction. And one set — wider, different gait, heavier pressure — coming the opposite way. Three different travelers in the last day.',
        skillCheck: { skill: 'tracking', dc: 11, successAppend: 'The opposite-direction track has the flat-footed, weight-forward pressure pattern of a Hollow moving with purpose. Not wandering. Moving along the road intentionally, in the same direction each time. A Remnant using the road as a route — and it knows where it\'s going.' },
      },
    ],
    hollowEncounter: {
      baseChance: 0.40,
      timeModifier: { day: 0.80, night: 2.0, dawn: 1.0, dusk: 1.5 },
      noiseModifier: 1.5,
      threatPool: [
        { type: 'shuffler', weight: 55, quantity: { min: 1, max: 4, distribution: 'weighted_low' } },
        { type: 'remnant', weight: 35, quantity: { min: 1, max: 2, distribution: 'weighted_low' } },
        { type: 'brute', weight: 10, quantity: { min: 1, max: 1, distribution: 'single' } },
      ],
      awarenessRoll: { unaware: 0.3, awarePassive: 0.4, awareAggressive: 0.3 },
      activityPool: {
        remnant: [
          { desc: 'walks the road in a straight line, consistent pace, the particular purposeful gait of something following a route it has internalized', weight: 3 },
        ],
      },
    },
    environmentalRolls: {
      ambientSoundPool: {
        day: [
          { sound: 'The sand sheets hiss across the concrete — a continuous, dry, whitenoise sound that never stops.', weight: 3 },
          { sound: 'Wind gusts hard from the west and for a moment the dust column rises to head height. You close your eyes and wait.', weight: 2 },
          { sound: null, weight: 1 },
        ],
        night: [
          { sound: 'The bleached road glows faint in the moonlight. Something at the edge of your vision resolves into a post. Just a post.', weight: 2 },
          { sound: null, weight: 2 },
        ],
      },
      ambientCount: { min: 0, max: 1, distribution: 'flat' },
    },
    narrativeNotes: 'Exposure mechanic room. The road is a route used by traders, Reclaimers, and Hollows alike — a contested corridor. The culvert hide is a tactical reward for stealth players. Remnant using the road as a route is an escalating threat signal.',
  },

  {
    id: 'du_18_sand_hollow',
    name: 'Sand Hollow',
    zone: 'the_dust',
    act: 2,
    difficulty: 5,
    visited: false,
    flags: { dark: false, scavengingZone: false },
    description: 'The dunes funnel you down into a bowl — a natural depression where sand has filled and compressed into a firm floor, lower than the surrounding terrain by fifteen feet. The walls are steep dune faces, wind-sculpted smooth. The bowl is roughly circular, fifty yards across. It is full of Hollows. A dozen at minimum, scattered across the floor in loose proximity — shufflers mostly, but the ones standing still at the rim of the bowl are not shufflers. They face inward. The bowl\'s enclosed space, the dark of the walls, the trapped heat — something about this configuration has drawn them. Something keeps them here.',
    descriptionNight: 'At night the sand hollow is a circle of darkness against the star-lit sky. The bowl walls block all peripheral light. The Hollows inside are shapes against shadows. The ones at the rim are backlit by starlight — you can see their outlines, their stillness. The ones below are not visible until they move. You can hear them. The bowl amplifies sound — the shuffling, the occasional contact between bodies, the specific silence of things that don\'t breathe.',
    descriptionDusk: 'At dusk the last light rakes across the bowl walls at an angle that turns the sand crimson. The Hollows inside are silhouetted against it. The remnants at the rim turn their faces east toward the dying light and hold that position until dark.',
    shortDescription: 'A sand bowl, fifteen feet below grade. Filled with Hollows. High danger.',
    exits: { north: 'du_13_deep_dunes' },
    richExits: {
      north: {
        destination: 'du_13_deep_dunes',
        descriptionVerbose: 'north, up the dune wall and out of the hollow',
        skillGate: { skill: 'survival', dc: 10, failMessage: 'The dune wall is steep and loose. You scramble and slide back down. You\'ll need a cleaner approach.' },
      },
    },
    items: [],
    enemies: ['remnant', 'brute'],
    npcs: [],
    extras: [
      {
        keywords: ['bowl', 'depression', 'hollow', 'walls'],
        description: 'The bowl walls are sheer dune faces — fine sand, packed by wind but not stable underfoot. They slope at about sixty degrees, which is near the angle of repose for sand: the steepest it can hold before it avalanches. A careful person can climb them. A person being chased cannot. The bowl is a trap for the unwary and a fortress for whatever has decided to hold it.',
        skillCheck: { skill: 'survival', dc: 12, successAppend: 'The bowl is a collecting point for heat — the walls absorb solar energy through the day and radiate it back through the night. The temperature down here is ten degrees warmer than the surrounding terrain. That\'s relevant to Hollow behavior: they congregate in warm enclosed spaces when the open desert cools. The bowl is a radiator. They\'re using it.' },
      },
      {
        keywords: ['hollows', 'remnants', 'rim', 'cluster'],
        description: 'The ones at the rim are different. You\'ve seen Hollows occupy territory, follow routes, sit in chairs — echoes of behavior. These ones are maintaining a perimeter. They stand at regular intervals along the rim, facing inward, unmoving. Below them, the shufflers move in slow orbits. Whatever is organizing this is not visible. Or it\'s one of the still ones at the rim and its organization is the stillness itself.',
        skillCheck: { skill: 'stealth', dc: 14, successAppend: 'From a concealed position at the rim edge, you watch long enough to see the pattern. The remnants rotate — slowly, not responding to anything visible, but they move clockwise at about one position per hour. The shufflers below track the rotation. There\'s a center point to the orbits. Something at the center of the bowl floor is stationary and the whole system orbits it. You can\'t see what it is from here.' },
      },
      {
        keywords: ['center', 'middle', 'floor'],
        description: 'The floor of the bowl is visible from the rim. Near the center: a protrusion from the sand — something buried, partially exposed. Could be structural debris. Could be something that was alive and became part of the landscape. The Hollow orbits suggest it\'s significant to them. The fact that nothing has disturbed it suggests either reverence or caution.',
      },
      {
        keywords: ['heat', 'warmth', 'temperature', 'air'],
        description: 'The air in the bowl is noticeably warmer. It smells different — the specific smell of Hollow density, which is biological and not pleasant, but underneath that, something else: old wood, old fabric, old paper. Something buried down here is made of materials that predate the Collapse. The bowl has preserved it.',
        skillCheck: { skill: 'tracking', dc: 13, successAppend: 'The smell of old paper resolves into something specific when the wind shifts: ink, and the particular mustiness of bound pages stored for years in dry heat. Somewhere under the sand in this bowl is a cache of documents. Someone buried something here and the dunes covered it. The Hollows circling it don\'t know what it is. Maybe.' },
      },
    ],
    hollowEncounter: {
      baseChance: 0.90,
      timeModifier: { day: 1.0, night: 1.5, dawn: 1.2, dusk: 1.3 },
      noiseModifier: 2.0,
      threatPool: [
        { type: 'shuffler', weight: 40, quantity: { min: 3, max: 8, distribution: 'bell' } },
        { type: 'remnant', weight: 35, quantity: { min: 2, max: 4, distribution: 'weighted_low' } },
        { type: 'brute', weight: 20, quantity: { min: 1, max: 2, distribution: 'weighted_low' } },
        { type: 'whisperer', weight: 5, quantity: { min: 1, max: 1, distribution: 'single' } },
      ],
      awarenessRoll: { unaware: 0.05, awarePassive: 0.15, awareAggressive: 0.80 },
      activityPool: {
        remnant: [
          { desc: 'stands at the bowl rim at regular spacing, facing inward — one of the perimeter holders. It hasn\'t moved in hours judging by the sand drift at its feet.', weight: 3 },
          { desc: 'walks a slow clockwise orbit around the bowl floor, pace consistent, radius fixed, like a second hand on a clock that has forgotten what time it\'s measuring', weight: 2 },
        ],
        brute: [
          { desc: 'sits at the center of the bowl, massive and still, the orbit of the shufflers curving around it — the center of the system, the fixed point everything else rotates around', weight: 3 },
        ],
        whisperer: [
          { desc: 'moves along the inner wall of the bowl, touching the sand face with both hands, making a sound below the threshold of language but above the threshold of silence', weight: 3 },
        ],
      },
    },
    environmentalRolls: {
      flavorLines: [
        { line: 'The bowl amplifies sound. A shuffler\'s footstep comes back off the walls as an echo. For a moment it sounds like two.', chance: 0.30, time: null },
        { line: 'The Hollow at the rim nearest you turns its head. Not toward you — toward something else. Then it turns back.', chance: 0.25, time: null },
        { line: 'The temperature in the bowl is wrong. Too warm for the time of day. The sand walls hold heat like a kiln.', chance: 0.20, time: ['night', 'dawn'] },
      ],
    },
    narrativeNotes: 'Highest danger room in the Dust — difficulty 5, 90% Hollow encounter, near-guaranteed combat. The organized Hollow behavior (perimeter, orbit, center-mass brute) suggests Remnant coordination at a level not seen elsewhere. The buried cache is a lore hook and a significant reward for a player willing to fight through the hollow. The exit skill gate reflects the difficulty of escaping the steep bowl walls under pressure.',
  },
]
