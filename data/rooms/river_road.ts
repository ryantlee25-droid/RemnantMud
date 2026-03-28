import type { Room } from '@/types/game'

export const RIVER_ROAD_ROOMS: Room[] = [
  // ─── RR-01: Highway 160 — East of Crossroads ──────────────────────────────
  {
    id: 'rr_01_west_approach',
    name: 'Highway 160 — East of Crossroads',
    zone: 'river_road',
    act: 1,
    difficulty: 1,
    visited: false,
    flags: { safeRest: false },
    description:
      'The highway stretches east through high scrubland, arrow-straight for a quarter mile before it curves north to follow the river. The pavement is cracked but walkable. On both sides, juniper and piñon pine press close, their shade welcome and their cover a concern. Ruts from cart wheels and the pockmarks of a thousand boots have worn a path down the center.',
    descriptionNight:
      'The highway is a gray line between black walls of juniper. Starlight catches the pale concrete but not much else. Every shadow could be a bush. Every bush could be something crouched behind it. The river is audible to the northeast — a compass sound.',
    descriptionDawn:
      'Mist pools in the low ground on either side of the highway. The juniper tops catch the first gold light while the road itself is still in shadow. Bird calls — real ones, not the mimicry of Whisperers.',
    descriptionDusk:
      'The sun drops behind you and your shadow stretches ahead on the asphalt, impossibly long. The juniper darkens. The road ahead curves into shadow. You can hear the river. You can\'t see what\'s between you and it.',
    shortDescription:
      'The highway stretches east through high scrubland, arrow-straight for a quarter mile before it curves north to follow the river.',
    exits: {
      west: 'cr_01_approach',
      east: 'rr_02_bridge_ruins',
    },
    items: ['scrap_vest'],
    enemies: [],
    npcs: [],
    extras: [
      {
        keywords: ['juniper', 'pinon', 'trees'],
        description:
          'The juniper smells sweet and sharp. The trees are short but dense — anything could be standing thirty feet off the road and you wouldn\'t see it. Experienced travelers stay on the pavement.',
      },
      {
        keywords: ['ruts', 'tracks', 'boots', 'path'],
        description:
          'Heavy foot traffic on this stretch. Cart wheels have cut parallel ruts. An experienced tracker could read the last week here.',
        skillCheck: { skill: 'tracking', dc: 8, successAppend: 'At least three separate groups have passed in the last two days heading east, and one — a heavy cart, possibly loaded with trade goods — heading west. Fresh bootprints, size large, heading east alone. Moving fast. Running?' },
      },
      {
        keywords: ['highway', 'road', 'pavement'],
        description:
          'US-160 once connected Durango to Cortez. Sixty miles of mountain highway that saw semis and tourists and commuters. Now it sees survivors.',
      },
    ],
    npcSpawns: [
      {
        npcId: 'traveling_merchant',
        spawnChance: 0.20,
        spawnType: 'wanderer',
        activityPool: [
          { desc: 'A Drifter with a loaded handcart is heading west toward Crossroads, moving at the brisk pace of someone who wants to arrive before dark.', weight: 3 },
          { desc: 'Two travelers walk east, armed, quiet, keeping five feet between them — close enough to fight together, far enough that one ambush doesn\'t get both.', weight: 2 },
        ],
      },
    ],
    itemSpawns: [
      {
        entityId: 'empty_water_bottle',
        spawnChance: 0.30,
        quantity: { min: 1, max: 1, distribution: 'single' },
        conditionRoll: { min: 0.1, max: 0.5 },
        groundDescription: 'An empty plastic water bottle lies in the ditch, sun-bleached.',
      },
    ],
    hollowEncounter: {
      baseChance: 0.10,
      timeModifier: { day: 0.5, night: 2.0, dawn: 0.8, dusk: 1.5 },
      threatPool: [
        { type: 'shuffler', weight: 85, quantity: { min: 1, max: 2, distribution: 'weighted_low' } },
        { type: 'remnant', weight: 15, quantity: { min: 1, max: 1, distribution: 'single' } },
      ],
      awarenessRoll: { unaware: 0.6, awarePassive: 0.3, awareAggressive: 0.1 },
      activityPool: {
        shuffler: [
          { desc: 'shambles along the highway shoulder, feet dragging, heading nowhere with terrible patience', weight: 3 },
          { desc: 'stands in the juniper just off the road, swaying slightly, face turned toward a sound only it can hear', weight: 2 },
        ],
        remnant: [
          { desc: 'crouches by the ditch, picking at something on the ground with fingers that still remember dexterity', weight: 2 },
          { desc: 'walks the center line with purpose, hands at its sides, moving like someone late for an appointment that ended seven years ago', weight: 2 },
        ],
      },
    },
    environmentalRolls: {
      ambientSoundPool: {
        day: [
          { sound: 'The river is audible to the northeast, a low murmur over stone.', weight: 3 },
          { sound: 'A magpie scolds from a juniper branch, indignant at your presence.', weight: 2 },
          { sound: null, weight: 2 },
        ],
        night: [
          { sound: 'The river sounds louder at night. Everything else has gone quiet.', weight: 3 },
          { sound: 'Something moves in the juniper to the south. Heavy. Slow. Probably an elk. Probably.', weight: 2 },
          { sound: 'Distant gunfire. Two shots, east. Then nothing.', weight: 1 },
          { sound: null, weight: 2 },
        ],
      },
      ambientCount: { min: 0, max: 1, distribution: 'flat' },
      flavorLines: [
        { line: 'A rusted speed limit sign reads 55. It feels like a message from another civilization.', chance: 0.20, time: ['day'] },
        { line: 'Your boots crunch on broken glass. Tail light fragments, scattered across the lane.', chance: 0.25, time: null },
        { line: 'A deer trail crosses the highway. Fresh tracks, delicate hooves in the dust.', chance: 0.15, time: ['dawn', 'day'] },
      ],
    },
    narrativeNotes:
      'First room outside Crossroads\' protection. The Hollow encounter chance is low but real — this is where players learn that the wild is dangerous. The tracking skill check on the ruts rewards early investment in Wits-based skills.',
  },

  // ─── RR-02: The Broken Bridge ─────────────────────────────────────────────
  {
    id: 'rr_02_bridge_ruins',
    name: 'The Broken Bridge',
    zone: 'river_road',
    act: 1,
    difficulty: 1,
    visited: false,
    flags: { safeRest: false },
    description:
      'The highway bridge over the Animas is gone — dropped into the river the first winter after the Collapse. What\'s left are two concrete stumps and a forty-foot gap of churning water. Someone built a crossing: steel cables anchored to the stumps, with planks lashed across them. A rope bridge. It sways in the wind and looks like it wants to kill you. A hand-lettered sign: ONE AT A TIME. MAX WEIGHT 200 LBS.',
    descriptionNight:
      'The bridge is a dark line over black water. You can hear the river but can\'t see it. The cable bridge has no lights. You\'d be crossing by feel.',
    descriptionDawn:
      'Morning mist rises from the river in thick columns, wreathing the bridge cables in white. The crossing appears and disappears as the mist shifts. The water below is invisible. You\'d be walking on clouds.',
    descriptionDusk:
      'The river catches the sunset and turns copper. The bridge cables throw long shadows downstream. The bridge keeper is packing up for the night, tucking tools into a canvas roll with the care of a ritual.',
    shortDescription:
      'The highway bridge over the Animas is gone — dropped into the river the first winter after the Collapse.',
    exits: {
      west: 'rr_01_west_approach',
      south: 'rr_05_the_ford',
    },
    richExits: {
      east: {
        destination: 'rr_03_east_bank',
        descriptionVerbose: 'across the bridge to the east bank',
        skillGate: { skill: 'vigor', dc: 4, failMessage: 'The bridge sways under your weight and you grab the cable. Maybe build some stamina first.' },
      },
    },
    items: [],
    enemies: [],
    npcs: [],
    extras: [
      {
        keywords: ['bridge', 'cable', 'rope', 'planks'],
        description:
          'Two steel cables for handrails, wooden planks lashed with wire for the deck. It flexes underfoot. You can feel the river through it. The planks are mismatched: door panels, shelf boards, a piece of kitchen table. Someone maintains it. Someone is proud of it.',
      },
      {
        keywords: ['river', 'animas', 'water'],
        description:
          'The Animas runs fast and cold, snowmelt from the San Juans. Knee-deep at shallows, chest-deep at center. The water is clear enough to see trout flashing over the gravel bed.',
      },
      {
        keywords: ['stumps', 'concrete', 'bridge ruins'],
        description:
          'The original bridge was concrete and steel, built for semi-trucks. Now it\'s rubble colonized by moss. The rebar sticks up from the stumps like broken bones.',
      },
      {
        keywords: ['sign', 'weight'],
        description:
          '200 lbs. That\'s person plus gear. A heavy pack could put you over. The bridge keeper weighs people by eye and tells them if they need to make two trips. He\'s usually right.',
      },
    ],
    npcSpawns: [
      {
        npcId: 'bridge_keeper_howard',
        spawnChance: 0.70,
        spawnType: 'anchored',
        activityPool: [
          { desc: 'A wiry old man sits on the west stump with a toolbox and a coil of wire, inspecting a cable anchor with the possessive attention of a creator.', weight: 3 },
          { desc: 'Howard is on the bridge itself, replacing a cracked plank. He works without a safety line over twenty feet of cold water. He doesn\'t seem concerned.', weight: 2 },
          { desc: 'Howard is sitting on the stump, eating an apple, watching the river. He nods at you. \'She\'s running high today. Watch the third plank from center — it\'s new and I haven\'t worn it in yet.\'', weight: 2 },
        ],
        dialogueTree: 'rr_howard_bridge_keeper',
        narrativeNotes: 'Howard is a former civil engineer. He built this bridge. Knows the river road better than anyone. Gives directions, warnings, and — in Cycle 2+ — reveals he was part of a road crew that did contract work near the Scar before the Collapse. He saw trucks going in and out of a facility that wasn\'t supposed to exist.',
      },
    ],
    itemSpawns: [
      {
        entityId: 'wire_coil',
        spawnChance: 0.10,
        quantity: { min: 1, max: 1, distribution: 'single' },
        conditionRoll: { min: 0.6, max: 1.0 },
        groundDescription: 'A short coil of steel wire sits near Howard\'s toolbox, possibly forgotten or possibly a spare.',
      },
    ],
  },

  // ─── RR-03: East Bank Landing ─────────────────────────────────────────────
  {
    id: 'rr_03_east_bank',
    name: 'East Bank Landing',
    zone: 'river_road',
    act: 1,
    difficulty: 1,
    visited: false,
    flags: { safeRest: true, campfireAllowed: true, waterSource: true },
    description:
      'The east bank of the Animas is a wide gravel bar where the river bends. Cottonwood trees lean over the water, their leaves turning the light green and dappled. The bridge cables anchor into a concrete block here, bolted to bedrock. A flat area of packed earth shows signs of regular camping — fire rings, boot tracks, a rope tied to a cottonwood for hanging packs away from animals. This is a waypoint, not a destination.',
    descriptionNight:
      'The cottonwoods are black shapes against stars. The river is silver where moonlight hits it, invisible everywhere else. The gravel bar crunches underfoot. Every sound carries.',
    descriptionDawn:
      'Dawn on the east bank comes through the cottonwoods in broken shafts — the leaves filter the early light into a green-gold pattern that moves on the gravel and the water. The river steams where the cold air meets the warmer current. A trout rises in the shallows, the ring spreading and catching the light. The fire rings from last night\'s camps hold faint warmth. The bridge cables upstream catch the first direct sun and throw a thin line of light across the water. The gravel bar is quiet, the boot tracks from yesterday already half-filled by the river\'s overnight work at the edges.',
    descriptionDusk:
      'Dusk turns the east bank into a study in cooling gold. The cottonwood leaves catch the last light and hold it, the canopy glowing while the ground below goes dark. The river loses its daytime sparkle and turns to a slow, dark mirror that reflects the colored sky. The gravel bar crunches differently in the cold — dryer, sharper. The bridge cables to the west are silhouettes. Someone\'s fire ring is already smoking, a thread of white rising through the cottonwood branches, the first fire of the evening lit by someone who knows what night means out here.',
    shortDescription:
      'The east bank of the Animas is a wide gravel bar where the river bends.',
    exits: {
      west: 'rr_02_bridge_ruins',
      north: 'rr_04_south_bend',
    },
    richExits: {
      east: {
        destination: 'rr_13_fishing_hole',
        descriptionVerbose: 'a faint trail along the bank',
        hidden: true,
        discoverSkill: 'tracking',
        discoverDc: 8,
        discoverMessage: 'Boot prints and drag marks — someone has been hauling fish this way repeatedly. A trail.',
      },
    },
    items: [],
    enemies: [],
    npcs: [],
    extras: [
      {
        keywords: ['cottonwood', 'trees', 'leaves'],
        description:
          'Old-growth cottonwoods, their trunks three feet wide, bark furrowed like canyon walls. In a breeze, the leaves make a sound like distant applause. In fall, the leaves turn gold and the river carries them downstream in flotillas.',
      },
      {
        keywords: ['fire rings', 'camp', 'tracks'],
        description:
          'Multiple fire rings, some cold, some with recent ash. This is a popular overnight spot — close to the bridge, close to water, defensible with the river at your back. You\'re not the first person to think it\'s a good idea.',
      },
      {
        keywords: ['river', 'water', 'gravel'],
        description:
          'The gravel bar extends twenty feet into the river before the water deepens. Clean water — you can drink it if you boil it or use purification tablets. The Animas has been clean since the humans stopped polluting it. Silver lining.',
      },
      {
        keywords: ['rope', 'cottonwood', 'hanging'],
        description:
          'A rope with a carabiner clip, tied to a high branch. Bear hang technique — keep your food off the ground or the bears and coyotes will take it. In this case, the rope also keeps it away from Hollow. They can\'t climb. Mostly.',
      },
    ],
    npcSpawns: [
      {
        npcId: 'fisher_npc',
        spawnChance: 0.30,
        spawnType: 'wanderer',
        activityPool: [
          { desc: 'A man stands knee-deep in the shallows, a makeshift fishing rod bent with the weight of something alive. He hasn\'t noticed you.', weight: 3 },
          { desc: 'A woman sits on the gravel bar, cleaning a trout with a short knife. Three more fish lie on a flat rock beside her. She looks up and nods.', weight: 2 },
        ],
      },
    ],
    itemSpawns: [
      {
        entityId: 'juniper_firewood',
        spawnChance: 0.55,
        quantity: { min: 1, max: 4, distribution: 'bell' },
        conditionRoll: { min: 0.5, max: 1.0 },
        groundDescription: 'Fallen cottonwood branches, dry and ready to burn, are scattered along the bank.',
      },
      {
        entityId: 'smooth_river_stone',
        spawnChance: 0.40,
        quantity: { min: 1, max: 2, distribution: 'weighted_low' },
        conditionRoll: { min: 0.8, max: 1.0 },
        groundDescription: 'A flat river stone, smooth and palm-sized, sits on the gravel. Good for sharpening.',
      },
    ],
  },

  // ─── RR-04: The River Road, South Bend ────────────────────────────────────
  {
    id: 'rr_04_south_bend',
    name: 'The River Road, South Bend',
    zone: 'river_road',
    act: 1,
    difficulty: 1,
    visited: false,
    flags: { safeRest: false },
    description:
      'The road is cracked asphalt with weeds pushing through every seam, the center line long since faded to nothing. To the east, the Animas River runs shallow over smooth stones, catching midday light. A rusted pickup truck sits nose-down in the ditch on the west side, its windshield a spiderweb of fractures. Something has been living in the cab — the passenger door hangs open, and the seat is torn to stuffing.',
    descriptionNight:
      'The road is a black ribbon under starlight. The river is a sound, not a sight. The wrecked pickup is a dark shape. Its open door creaks in a wind you can barely feel. Something rustles in the cab. You\'re not sure if it\'s fabric or breathing.',
    descriptionDawn:
      'Mist clings to the river and spills across the road in low sheets. The truck is a ghost shape in the fog. The world is pearl-gray and hushed.',
    descriptionDusk:
      'The truck casts a long shadow across the road. The river has gone from silver to copper. The light is golden and brief and makes everything beautiful, including the things that shouldn\'t be.',
    shortDescription:
      'The road is cracked asphalt with weeds pushing through every seam, the center line long since faded to nothing.',
    exits: {
      south: 'rr_03_east_bank',
      north: 'rr_06_the_narrows',
      east: 'rr_14_riverbank_camp',
    },
    items: [],
    enemies: [],
    npcs: [],
    extras: [
      {
        keywords: ['truck', 'pickup', 'f-150', 'windshield'],
        descriptionPool: [
          { desc: 'A 2028 Ford F-150, once white. The bed is empty except for a moldy sleeping bag and three empty cans of beans. No keys in the ignition. The gas gauge reads empty, but gauges lie.', weight: 3 },
          { desc: 'A 2028 Ford F-150. Someone has scratched STILL ALIVE into the dust on the tailgate. The handwriting is shaky. The bed holds a wadded-up tarp and a rusted toolbox — locked.', weight: 2 },
          { desc: 'A 2028 Ford F-150. The hood is up. Someone has stripped the battery and wiring harness, recently — the cuts are clean and the exposed metal hasn\'t rusted yet.', weight: 1 },
        ],
      },
      {
        keywords: ['river', 'animas', 'water', 'stones'],
        description:
          'The Animas is twenty feet wide here, running fast and clear over gravel. You could wade across, but the current would be thigh-deep. Good fishing water, if you had the time.',
      },
      {
        keywords: ['cab', 'seat', 'door'],
        description:
          'The cab smells like wet fur and something dead. The seat is shredded to the springs. Claw marks on the dash.',
        skillCheck: { skill: 'tracking', dc: 12, successAppend: 'The claw pattern is canine, but the spacing is wrong. Too wide. Whatever made these was bigger than any dog you\'ve seen since the Collapse.' },
      },
    ],
    npcSpawns: [
      {
        npcId: 'accord_sentry_river',
        spawnChance: 0.45,
        spawnType: 'patrol',
        activityPool: [
          { desc: 'An Accord sentry watches the road from the pickup bed, rifle across her knees.', weight: 3, timeRestrict: ['day', 'dawn', 'dusk'] },
          { desc: 'An Accord sentry crouches in the pickup bed, a dim lantern at her feet. She has her rifle up.', weight: 2, timeRestrict: ['night'] },
          { desc: 'An Accord sentry is talking with a traveler, pointing north. Giving directions.', weight: 1 },
        ],
      },
      {
        npcId: 'stray_dog',
        spawnChance: 0.25,
        spawnType: 'wanderer',
        activityPool: [
          { desc: 'A mangy dog sleeps in the shade under the truck.', weight: 3, timeRestrict: ['day'] },
          { desc: 'A dog with a notched ear watches you from the ditch, body low, tail still. Not aggressive. Not friendly. Deciding.', weight: 2 },
          { desc: 'A shepherd mix trots along the road shoulder, nose working. It pauses when it sees you, one ear up.', weight: 2 },
        ],
        narrativeNotes: 'THE DOG. This is the dog from the narrative bible. If the player feeds it, it follows. If treated kindly, it becomes a companion. Kindness counter starts here.',
      },
    ],
    itemSpawns: [
      {
        entityId: 'hunting_rifle_damaged',
        spawnChance: 0.08,
        quantity: { min: 1, max: 1, distribution: 'single' },
        conditionRoll: { min: 0.15, max: 0.55 },
        groundDescription: 'A hunting rifle leans against the truck\'s fender, stock cracked.',
      },
      {
        entityId: 'ammo_22lr',
        spawnChance: 0.20,
        quantity: { min: 1, max: 5, distribution: 'weighted_low' },
        conditionRoll: { min: 0.8, max: 1.0 },
        groundDescription: 'A few .22 rounds are scattered in the gravel.',
      },
      {
        entityId: 'water_bottle_sealed',
        spawnChance: 0.12,
        quantity: { min: 1, max: 1, distribution: 'single' },
        conditionRoll: { min: 0.9, max: 1.0 },
        groundDescription: 'A sealed plastic bottle of water sits on the dashboard.',
      },
    ],
    hollowEncounter: {
      baseChance: 0.12,
      timeModifier: { day: 0.6, night: 1.8, dawn: 0.9, dusk: 1.3 },
      threatPool: [
        { type: 'shuffler', weight: 70, quantity: { min: 1, max: 3, distribution: 'weighted_low' } },
        { type: 'remnant', weight: 25, quantity: { min: 1, max: 1, distribution: 'single' } },
        { type: 'screamer', weight: 5, quantity: { min: 1, max: 1, distribution: 'single' } },
      ],
      awarenessRoll: { unaware: 0.55, awarePassive: 0.30, awareAggressive: 0.15 },
      activityPool: {
        shuffler: [
          { desc: 'stands motionless in the road, head cocked at an angle that suggests a broken neck. It hasn\'t noticed you.', weight: 3 },
          { desc: 'is on its knees in the ditch, pawing at something in the dirt', weight: 2 },
          { desc: 'shuffles in a slow circle near the truck, bumping against the fender on each pass', weight: 2 },
        ],
        remnant: [
          { desc: 'stands near the truck with its hand on the door handle, opening and closing it. Open. Close. Open. Close.', weight: 3 },
          { desc: 'walks the center line with purpose, as if it remembers having somewhere to be', weight: 2 },
        ],
        screamer: [
          { desc: 'crouches on the truck roof, head swiveling, throat working. It hasn\'t screamed yet. When it does, everything within a mile will hear.', weight: 2 },
        ],
      },
    },
    narrativeNotes:
      'This is the showcase room from the Room Display Spec. First real Hollow encounter zone. The dog spawn is critical — this is where the player\'s relationship with the game\'s most emotionally significant NPC potentially begins.',
  },

  // ─── RR-05: The Ford ──────────────────────────────────────────────────────
  {
    id: 'rr_05_the_ford',
    name: 'The Ford',
    zone: 'river_road',
    act: 1,
    difficulty: 1,
    visited: false,
    flags: { safeRest: false, waterSource: true },
    description:
      'A mile south of the broken bridge, the Animas widens and shallows over a broad gravel bar. Ankle-deep at the edges, knee-deep at the center. Cart tracks mark the crossing on both banks — this is where heavy loads go. The water is cold and fast but manageable. Flat stones break the current into channels. Someone has placed stepping stones across the deepest section, not quite evenly spaced.',
    descriptionNight:
      'The ford is audible as a broad hiss of water over stone. In moonlight, the shallows are silver sheets. The stepping stones are dark humps in the current. Missing one would mean wet boots at best, a dunking at worst.',
    shortDescription:
      'A mile south of the broken bridge, the Animas widens and shallows over a broad gravel bar.',
    exits: {
      north: 'rr_02_bridge_ruins',
      east: 'rr_03_east_bank',
      south: 'rr_15_south_river',
    },
    items: [],
    enemies: [],
    npcs: [],
    extras: [
      {
        keywords: ['stepping stones', 'stones', 'crossing'],
        description:
          'Flat stones, placed deliberately but not recently — they\'ve settled into the riverbed. The gaps between them are a long stride for a tall person, a jump for a short one. Whoever placed them wasn\'t thinking about children.',
      },
      {
        keywords: ['cart tracks', 'tracks', 'banks'],
        description:
          'Deep ruts on both banks where carts have been hauled through the shallows. The Drifters use this crossing for their trade caravans. It adds two hours versus the bridge, but a loaded cart can\'t cross on cable and plank.',
      },
      {
        keywords: ['water', 'river', 'current'],
        description:
          'Cold. Mountain snowmelt cold. Your legs will ache after thirty seconds. But the water is clean and the footing is solid gravel. Worse crossings exist.',
      },
    ],
    npcSpawns: [
      {
        npcId: 'drifter_cart_team',
        spawnChance: 0.20,
        spawnType: 'wanderer',
        activityPool: [
          { desc: 'A two-person cart team is hauling a loaded wagon through the shallows, water to their calves, cursing creatively at the cold.', weight: 3 },
        ],
      },
    ],
    itemSpawns: [
      {
        entityId: 'lost_cargo_crate',
        spawnChance: 0.10,
        quantity: { min: 1, max: 1, distribution: 'single' },
        conditionRoll: { min: 0.3, max: 0.7 },
        groundDescription: 'A small wooden crate has washed up against the stepping stones, snagged by the current. Water-damaged but sealed.',
      },
    ],
  },

  // ─── RR-06: The Narrows ───────────────────────────────────────────────────
  {
    id: 'rr_06_the_narrows',
    name: 'The River Road, The Narrows',
    zone: 'river_road',
    act: 1,
    difficulty: 2,
    visited: false,
    flags: { safeRest: false },
    description:
      'The road squeezes between a sheer rock face to the west and the river to the east. No shoulder. No ditch. Just asphalt, cliff, and water. The passage is maybe fifty yards long and barely wide enough for two people to walk abreast. Above, the cliff leans out over the road, creating a permanent shadow. This is ambush country. Everyone knows it. Everyone walks through it anyway because there\'s no other route north.',
    descriptionNight:
      'The Narrows at night is a throat of darkness. The cliff blocks the stars on one side. The river is a black rush on the other. Your footsteps echo off the rock face and come back to you doubled.',
    descriptionDawn:
      'Dawn in the Narrows is delayed — the cliff face blocks the eastern sun and the passage stays in shadow while the sky above brightens to blue. The rock is cold, still holding the night\'s temperature, and the river runs silver-gray beside you, catching light the road can\'t reach. The fifty-yard passage feels longer in this half-light. The hash marks on the cliff wall are visible only as textures, not marks. Everything in the Narrows is suggestion until the sun clears the cliff in another hour.',
    descriptionDusk:
      'Dusk hits the Narrows early. The cliff face blocks the western sun and the shadow falls across the passage a full hour before sunset. The river beside you still catches light from the open sky above, a strip of copper between the dark road and the dark cliff, and the contrast makes the road darker than it is. The seventeen hash marks on the stone are in shadow. The passage ahead narrows to its tightest point and beyond it, the road opens to light that won\'t last. You walk faster. Everyone walks faster through the Narrows at dusk.',
    shortDescription:
      'The road squeezes between a sheer rock face to the west and the river to the east.',
    exits: {
      south: 'rr_04_south_bend',
      north: 'rr_07_north_fork',
    },
    items: [],
    enemies: [],
    npcs: [],
    extras: [
      {
        keywords: ['cliff', 'rock', 'wall'],
        description:
          'Sandstone, layered red and tan, carved by millennia of water and wind. It\'s beautiful in an academic sense. In a practical sense, it\'s a wall that funnels you into a kill zone. Someone has scratched hash marks into the rock at waist height. You count seventeen.',
      },
      {
        keywords: ['hash marks', 'scratches', 'marks'],
        description:
          'Seventeen hash marks scratched into the sandstone. Each one the same depth, the same spacing. Deliberate. A count. Of what — days? Kills? People lost? The last mark looks fresher than the others.',
        skillCheck: { skill: 'lore', dc: 10, successAppend: 'These are Salter patrol marks. One mark per sweep through The Narrows. Seventeen sweeps since the last time someone cleaned the slate.' },
      },
      {
        keywords: ['river', 'water', 'east'],
        description:
          'The river is close enough to touch if you leaned right. Running fast, hip-deep minimum. If something came at you from the north, your only escape route would be into the current. Not great.',
      },
    ],
    npcSpawns: [
      {
        npcId: 'narrows_ambusher',
        spawnChance: 0.15,
        spawnType: 'event',
        activityPool: [
          { desc: 'A figure steps out from a crack in the cliff face ahead of you. Armed. Blocking the road. \'Toll road. Five Pennies or your best weapon. Your choice.\'', weight: 2 },
        ],
        dispositionRoll: { hostile: 0.6, wary: 0.4 },
        narrativeNotes: 'Road bandit encounter. Player can fight, pay, negotiate (Presence DC 12), or intimidate (Presence DC 14). If Salter reputation is Recognized+, the bandit recognizes the affiliation and backs down.',
      },
    ],
    itemSpawns: [
      {
        entityId: 'ammo_22lr',
        spawnChance: 0.15,
        quantity: { min: 1, max: 3, distribution: 'weighted_low' },
        conditionRoll: { min: 0.8, max: 1.0 },
        groundDescription: 'A few .22 rounds lie scattered against the cliff base, as if dropped in a hurry.',
      },
    ],
    hollowEncounter: {
      baseChance: 0.18,
      timeModifier: { day: 0.7, night: 2.2, dawn: 1.0, dusk: 1.5 },
      threatPool: [
        { type: 'shuffler', weight: 60, quantity: { min: 1, max: 3, distribution: 'weighted_low' } },
        { type: 'remnant', weight: 25, quantity: { min: 1, max: 2, distribution: 'weighted_low' } },
        { type: 'screamer', weight: 15, quantity: { min: 1, max: 1, distribution: 'single' } },
      ],
      awarenessRoll: { unaware: 0.4, awarePassive: 0.35, awareAggressive: 0.25 },
    },
    narrativeNotes:
      'Highest threat room in early River Road. The confined space makes combat dangerous — no flanking, no retreat without turning your back. The Screamer entry in the threat pool means that even a small encounter can escalate fast if a Screamer calls reinforcements. This room teaches players that terrain matters.',
  },

  // ─── RR-07: The North Fork ────────────────────────────────────────────────
  {
    id: 'rr_07_north_fork',
    name: 'The North Fork',
    zone: 'river_road',
    act: 1,
    difficulty: 1,
    visited: false,
    flags: { safeRest: false, fastTravelWaypoint: true },
    description:
      'The road widens as it exits The Narrows and reaches a junction where three trails diverge. North: a well-worn path climbing into foothills, the direction of Covenant, marked by an Accord signpost. East: a narrower trail following the river upstream toward rougher country. West: a barely-visible path switchbacking up a steep hillside into dense pine forest. The junction has a stone cairn at its center, shoulder-high, with colored ribbons tied to sticks at the top — trail markers in the Drifter tradition.',
    descriptionNight:
      'The junction is an open space under stars. The cairn is a dark pillar. The three trails are suggestions of lesser darkness leading into greater. The Accord signpost is unreadable.',
    shortDescription:
      'The road widens as it exits The Narrows and reaches a junction where three trails diverge.',
    exits: {
      south: 'rr_06_the_narrows',
      north: 'rr_08_burned_farmhouse',
      east: 'rr_09_cottonwood_stretch',
    },
    richExits: {
      west: {
        destination: 'ps_01_tree_line',
        descriptionVerbose: 'a faint trail climbing west into dense forest',
        hidden: true,
        discoverSkill: 'survival',
        discoverDc: 12,
        discoverMessage: 'You spot an overgrown trail climbing into the mountains. The Pine Sea.',
        cycleGate: 2,
      },
    },
    items: [],
    enemies: [],
    npcs: [],
    extras: [
      {
        keywords: ['signpost', 'accord', 'sign'],
        description:
          'A wooden post with a painted arrow: COVENANT — 8 MILES NORTH. Below it, smaller: ALL TRAVELERS WELCOME. WEAPONS CHECKED AT THE GATE. The paint is maintained. The Accord takes its signage seriously.',
      },
      {
        keywords: ['cairn', 'ribbons', 'markers'],
        description:
          'The cairn is river stones stacked carefully. The ribbons are colored strips of fabric: red for danger, green for safe passage, blue for water. The current configuration has red on the east trail and green on the north. No ribbon on the west trail. That\'s either an oversight or a message.',
      },
      {
        keywords: ['west', 'trail', 'pine', 'hill', 'forest'],
        description:
          'The west trail is overgrown. Whoever made it hasn\'t maintained it. The switchbacks are steep and the pine forest above is dense enough to block the sky. From here, you can\'t see where it goes.',
        skillCheck: { skill: 'survival', dc: 12, successAppend: 'Game trail, overlaid on something older — a human path, abandoned. It leads west and up, toward the high ridges. If you had to guess, it connects to the mountain forest the locals call The Pine Sea.' },
        cycleGate: 2,
      },
    ],
    npcSpawns: [
      {
        npcId: 'accord_trail_marker',
        spawnChance: 0.35,
        spawnType: 'patrol',
        activityPool: [
          { desc: 'An Accord scout is refreshing the paint on the signpost, a small can of white paint and a brush balanced on the post top.', weight: 2 },
          { desc: 'Two Accord scouts rest at the cairn, sharing water and scanning the trails. One waves.', weight: 2 },
        ],
      },
    ],
    itemSpawns: [],
  },

  // ─── RR-08: The Burned Farmhouse ──────────────────────────────────────────
  {
    id: 'rr_08_burned_farmhouse',
    name: 'The Burned Farmhouse',
    zone: 'river_road',
    act: 1,
    difficulty: 1,
    visited: false,
    flags: { safeRest: false, scavengingZone: true },
    description:
      'A homestead that didn\'t make it. The farmhouse is a blackened skeleton — stone foundation, charred timbers, a chimney standing alone like a tombstone. The fire was years ago, but the smell lingers in the stone. A barn behind the house still stands, roof sagging but walls intact. The yard is overgrown with wild grass that reaches your waist. A swing set rusts in what was once a side yard, one swing still hanging, turning slowly in the wind.',
    descriptionNight:
      'The chimney is a black finger against the stars. The barn is a dark shape. The swing turns. You hear the chain creak. That\'s the only sound.',
    descriptionDawn:
      'Dawn at the burned farmhouse is kind in a way the place doesn\'t deserve. The first light catches the top of the chimney and moves down the stone, warming it to a color that could be mistaken for intact. The wild grass in the yard is heavy with dew, silver-tipped, bending under the weight of water that will be gone in an hour. The swing hangs still — no wind yet. The barn\'s sagging roof catches the light on its eastern slope. A meadowlark calls from the fence line, two notes, the second one higher, and for a moment the homestead sounds like what it was before it became what it is.',
    descriptionDusk:
      'Dusk at the burned farmhouse stretches the chimney\'s shadow across the yard until it reaches the swing set. The wild grass turns amber in the low light, waist-high, moving in the evening breeze like a slow tide. The barn\'s open door is a dark rectangle. The swing turns, chain catching the last light, one bright line in a composition of shadow. The smell of char is fainter in the cool air, replaced by the green smell of the grass and the mineral smell of cooling stone. A child lived here. The bike is somewhere in the grass. The light is leaving.',
    shortDescription:
      'A homestead that didn\'t make it.',
    exits: {
      south: 'rr_07_north_fork',
      north: 'rr_10_overturned_bus',
    },
    items: [],
    enemies: [],
    npcs: [],
    extras: [
      {
        keywords: ['farmhouse', 'house', 'ruins', 'chimney'],
        description:
          'The fire took everything above the foundation. Stone walls remain to knee height. You can see the layout: living room, kitchen, two bedrooms. Small. A family home. In the kitchen area, a cast-iron skillet sits on what\'s left of the stove, fused there by heat. Someone was cooking when the world ended.',
      },
      {
        keywords: ['barn', 'building'],
        description:
          'The barn is weathered but standing. The doors are open — one hangs from a single hinge. Inside: the rusted shell of a tractor, hay bales that have composted to black earth, and a workbench with tools still on it. Wrenches. A vise. A hacksaw. The owner was organized. The tools are arranged by size.',
        skillCheck: { skill: 'scavenging', dc: 8, successAppend: 'Behind the workbench, a loose board in the wall. Behind that — a metal box. Locked, but the lock is cheap.' },
      },
      {
        keywords: ['swing', 'swing set', 'yard'],
        description:
          'A metal frame, rusted orange. Two swings — one broken, chain trailing in the grass. One still hanging, seat twisted, turning in any breeze. It\'s a small thing. It breaks your heart anyway.',
      },
      {
        keywords: ['grass', 'yard', 'overgrown'],
        description:
          'Wild grass, waist-high. Could be hiding anything. You push through carefully. Your hand brushes something hard in the grass — a bicycle wheel, spokes bent, tire rotted. A child\'s bike.',
      },
    ],
    npcSpawns: [],
    itemSpawns: [
      {
        entityId: 'hand_tools_basic',
        spawnChance: 0.35,
        quantity: { min: 1, max: 3, distribution: 'weighted_low' },
        conditionRoll: { min: 0.3, max: 0.7 },
        groundDescription: 'Rusted hand tools lie on the barn workbench — still usable, if you clean them.',
      },
      {
        entityId: 'scrap_metal',
        spawnChance: 0.50,
        quantity: { min: 2, max: 5, distribution: 'bell' },
        conditionRoll: { min: 0.2, max: 0.6 },
        groundDescription: 'Scrap metal from the tractor and farm equipment is scattered through the barn.',
      },
      {
        entityId: 'torn_note_fragment',
        spawnChance: 0.30,
        quantity: { min: 1, max: 1, distribution: 'single' },
        conditionRoll: { min: 0.8, max: 1.0 },
        groundDescription: 'In the barn\'s metal box, a letter. The paper is dry. The handwriting is a child\'s.',
      },
      {
        entityId: 'cast_iron_skillet',
        spawnChance: 0.25,
        quantity: { min: 1, max: 1, distribution: 'single' },
        conditionRoll: { min: 0.4, max: 0.6 },
        groundDescription: 'A cast-iron skillet sits on the ruined stove, fused to the surface but pryable with effort.',
      },
    ],
    hollowEncounter: {
      baseChance: 0.12,
      timeModifier: { day: 0.6, night: 1.8, dawn: 0.8, dusk: 1.4 },
      threatPool: [
        { type: 'shuffler', weight: 75, quantity: { min: 1, max: 2, distribution: 'weighted_low' } },
        { type: 'remnant', weight: 25, quantity: { min: 1, max: 1, distribution: 'single' } },
      ],
      activityPool: {
        shuffler: [
          { desc: 'wanders through the tall grass in the yard, hands trailing through the seed heads, like someone remembering a summer lawn', weight: 3 },
        ],
        remnant: [
          { desc: 'sits on the barn workbench, turning a wrench in its hands. Over and over. The motion is smooth. Practiced. It was a mechanic.', weight: 2 },
        ],
      },
    },
    narrativeNotes:
      'Emotional weight room. The swing, the child\'s bike, the child\'s letter. This room exists to make the player feel the Collapse on a human scale. The Remnant in the barn — still turning a wrench — is the most disturbing Hollow encounter in Act I because it\'s the most human.',
  },

  // ─── RR-09: The Cottonwood Stretch ────────────────────────────────────────
  {
    id: 'rr_09_cottonwood_stretch',
    name: 'The Cottonwood Stretch',
    zone: 'river_road',
    act: 1,
    difficulty: 1,
    visited: false,
    flags: { safeRest: true, campfireAllowed: true, waterSource: true },
    description:
      'The trail follows the river through a corridor of towering cottonwood trees, their canopy so dense the light filters down in green-gold shafts. The river runs beside you, wide and slow in this section, with deep pools where the current eddies against fallen logs. The air is cooler here, ten degrees below the open road. Birdsong. Actual birdsong. A woodpecker hammers somewhere upstream. For fifty yards, you could forget what the world has become.',
    descriptionNight:
      'The cottonwoods are cathedral columns in the dark. The river reflects starlight in broken silver. The birdsong is gone, replaced by the chirp of crickets and the occasional splash of a fish. It\'s peaceful. The kind of peaceful that makes you nervous.',
    descriptionDawn:
      'Dawn in the cottonwood stretch is filtered through a thousand leaves into a light that is more gold than white. The river runs slow and the steam rising from it catches the shafts and holds them, the corridor filling with a luminous haze that smells of water and bark and the green chemistry of living wood. The woodpecker starts up. Then the jays. Then a cascade of smaller voices you don\'t have names for. The world sounds like it\'s waking up on purpose, one species at a time, and you are standing in the middle of something that is not about you and is better for it.',
    descriptionDusk:
      'Dusk in the cottonwood stretch is a slow dimming — the canopy holds the last light above while the trail below goes to shadow, the river turning from green-gold to a dark mirror that reflects the lit branches overhead. The birdsong thins, the woodpecker going silent first, then the jays, until only the water sound remains and the occasional splash of a fish feeding in the shallows. The temperature drops and the air carries the smell of the river more strongly, mineral and clean. The deep pools go black. You could rest here. You could forget, here, for a few minutes, the weight of what is behind you and ahead of you.',
    shortDescription:
      'The trail follows the river through a corridor of towering cottonwood trees, their canopy so dense the light filters down in green-gold shafts.',
    exits: {
      west: 'rr_07_north_fork',
      east: 'rr_16_deep_pools',
    },
    items: [],
    enemies: [],
    npcs: [],
    extras: [
      {
        keywords: ['cottonwood', 'trees', 'canopy'],
        description:
          'These cottonwoods are ancient — a hundred years old, maybe more. They survived the Collapse because they don\'t need people. They just need water. Their roots drink from the river and their branches hold the sky and they will be here long after the last human argument is settled.',
      },
      {
        keywords: ['pools', 'river', 'water', 'logs'],
        description:
          'Deep, dark pools where the current slows. Trout hold in the shadow of submerged logs, visible as flashes of silver when they turn. This is food, if you have the patience and a way to catch it.',
      },
      {
        keywords: ['birdsong', 'birds', 'woodpecker'],
        description:
          'Downy woodpecker, from the rhythm of the drumming. Blue jays in the upper canopy. A pair of dippers — small, round, gray — bob on a midstream rock, hunting aquatic insects. The birds came back fast after the Collapse. Fewer humans, fewer cats, fewer cars. For the birds, the apocalypse was a promotion.',
      },
    ],
    npcSpawns: [],
    itemSpawns: [
      {
        entityId: 'wild_herbs',
        spawnChance: 0.40,
        quantity: { min: 1, max: 3, distribution: 'bell' },
        conditionRoll: { min: 0.7, max: 1.0 },
        groundDescription: 'Wild mint grows along the riverbank, fragrant and green.',
      },
    ],
    narrativeNotes:
      'Respite room. After The Narrows and the Burned Farmhouse, the player needs beauty. This room is the game keeping its promise that the world is beautiful when nothing is trying to kill you. Low threat by design.',
  },

  // ─── RR-10: The Overturned Bus ────────────────────────────────────────────
  {
    id: 'rr_10_overturned_bus',
    name: 'The Overturned Bus',
    zone: 'river_road',
    act: 1,
    difficulty: 2,
    visited: false,
    flags: { safeRest: false },
    description:
      'A school bus lies on its side across the road, blocking the entire lane. It went over during the first weeks — you can tell because the weeds have grown up through the shattered windows and the paint has weathered to dull yellow-gray. The interior is dark. Something moves inside. Something always moves inside. The locals call this one the Hive and give it a wide berth. A footpath detours around the wreckage through the scrub on the east side.',
    descriptionNight:
      'The bus is a beached whale of shadow. The sounds from inside are louder at night — shuffling, scraping, the occasional moan that rises and falls like breathing. The detour path is visible as a pale line through the dark scrub.',
    shortDescription:
      'A school bus lies on its side across the road, blocking the entire lane.',
    exits: {
      south: 'rr_08_burned_farmhouse',
      north: 'rr_11_the_bend',
    },
    richExits: {
      down: {
        destination: 'rr_10b_bus_interior',
        descriptionVerbose: 'climb into the bus through the emergency exit',
        skillGate: { skill: 'vigor', dc: 8, failMessage: 'The sounds from inside the bus root you to the spot. You\'re not ready for this.' },
      },
    },
    items: [],
    enemies: [],
    npcs: [],
    extras: [
      {
        keywords: ['bus', 'school bus', 'interior', 'inside'],
        description:
          'Through the broken windshield, you can see the interior: seats torn from their mounts, papers and backpacks rotted to mulch, and movement. Shufflers. At least three, possibly more. They mill in the confined space, bumping against walls and each other. A permanent nest. They don\'t leave and they don\'t die. They just... exist in there. It\'s worse than dangerous. It\'s sad.',
      },
      {
        keywords: ['path', 'detour', 'footpath', 'scrub'],
        description:
          'The footpath is well-worn — everyone detours. It adds five minutes to the walk but keeps you fifteen feet from the bus. Close enough to hear. Far enough to run.',
      },
      {
        keywords: ['hive', 'locals'],
        description:
          'The locals have names for the permanent Hollow nests: the Hive, the Pit, the School (that one is in Covenant\'s zone and nobody talks about it without flinching). The Hive is the bus. It\'s been here since Year One. Nobody has cleared it because nobody wants to climb into a bus full of Hollow. The Salters offered. The Accord said no — it serves as a warning to travelers about staying alert.',
      },
    ],
    npcSpawns: [],
    itemSpawns: [
      {
        entityId: 'backpack_child',
        spawnChance: 0.15,
        quantity: { min: 1, max: 1, distribution: 'single' },
        conditionRoll: { min: 0.2, max: 0.5 },
        groundDescription: 'A child\'s backpack, faded purple, lies in the weeds near the bus. It\'s been rained on a thousand times.',
      },
    ],
    narrativeNotes:
      'Optional clearing quest location. The bus interior (RR-10b) is a single-room Hollow nest encounter — 3-5 Shufflers in close quarters. Clearing it earns Accord reputation and opens the road for safe travel. It\'s also deeply unpleasant: the Hollow inside were children.',
  },

  // ─── RR-10b: Inside the Overturned Bus ────────────────────────────────────
  {
    id: 'rr_10b_bus_interior',
    name: 'Inside the Overturned Bus',
    zone: 'river_road',
    act: 1,
    difficulty: 3,
    visited: false,
    flags: { safeRest: false, dark: true },
    description:
      'The bus is on its side, so the floor is the windows and the ceiling is the opposite row of seats. You crawl in through the emergency exit. The air is thick — decay, mold, and something sour. The seats are torn. Papers, backpacks, and lunch boxes form a layer of mulch on the \'floor.\' Shufflers turn toward you. They\'re small. They were children when this happened. They\'re not children now. They\'re not anything now. But they\'re the size of children, and your brain won\'t stop telling you that.',
    descriptionNight:
      'Total darkness. The smell is worse. The sounds are closer. You can feel them moving before you see them.',
    shortDescription:
      'The bus is on its side, so the floor is the windows and the ceiling is the opposite row of seats.',
    exits: {
      up: 'rr_10_overturned_bus',
    },
    items: [],
    enemies: [],
    npcs: [],
    extras: [
      {
        keywords: ['seats', 'papers', 'backpacks', 'lunch boxes'],
        description:
          'A Finding Nemo lunchbox. A notebook with MATH written on the cover in purple marker. A sneaker, tiny, untied. The details are worse than the danger. Every detail is a person who was eight years old and sitting in this seat when the world changed.',
      },
      {
        keywords: ['shufflers', 'hollow', 'children'],
        description:
          'Four of them. Small. Their clothes are in tatters. One wears a backpack — hasn\'t taken it off in seven years. They move in the close space with the aimlessness of things that have nowhere to go. When they see you, they orient. They approach. They are hungry. They are always hungry.',
      },
    ],
    npcSpawns: [],
    itemSpawns: [
      {
        entityId: 'torn_note_fragment',
        spawnChance: 0.50,
        quantity: { min: 1, max: 1, distribution: 'single' },
        conditionRoll: { min: 0.4, max: 0.8 },
        groundDescription: 'A folded note in the driver\'s seat area. The handwriting is adult. It reads: I\'m sorry. I tried to get them out. I couldn\'t get them all out.',
      },
    ],
    hollowEncounter: {
      baseChance: 0.95,
      timeModifier: {},
      threatPool: [
        { type: 'shuffler', weight: 100, quantity: { min: 3, max: 5, distribution: 'bell' } },
      ],
      awarenessRoll: { unaware: 0.1, awarePassive: 0.3, awareAggressive: 0.6 },
    },
    narrativeNotes:
      'The hardest room in Act I emotionally. The Hollow are child-sized. The letter is from the bus driver. This room is not fun. It is necessary. It is the game saying: this is what the Collapse took. Every time you fight a Hollow, this is what you\'re fighting. The question of whether there\'s a cure isn\'t academic. It\'s personal.',
  },

  // ─── RR-11: The River Road, The Bend ──────────────────────────────────────
  {
    id: 'rr_11_the_bend',
    name: 'The River Road, The Bend',
    zone: 'river_road',
    act: 1,
    difficulty: 2,
    visited: false,
    flags: { safeRest: false },
    description:
      'The road curves sharply around a rock outcrop, reducing visibility to about thirty feet in either direction. The river runs close on the east side, loud enough to mask footsteps. Bushes crowd the west shoulder. This is the kind of place where you walk with your hand on your weapon and your eyes moving. Someone has painted WATCH YOUR SIX on the rock face in faded red.',
    descriptionNight:
      'The bend is a blind corner in the dark. The river masks all sound. You can\'t see what\'s ahead and you can\'t hear what\'s behind you. Move fast or don\'t move at all.',
    shortDescription:
      'The road curves sharply around a rock outcrop, reducing visibility to about thirty feet in either direction.',
    exits: {
      south: 'rr_10_overturned_bus',
      north: 'rr_12_covenant_outskirts',
    },
    items: [],
    enemies: [],
    npcs: [],
    extras: [
      {
        keywords: ['rock', 'outcrop', 'bend'],
        description:
          'Natural rock formation — the road was cut through here when the highway was built. The exposed stone is layered sandstone, the same red-and-tan as The Breaks. It creates a natural blind corner that no amount of caution fully solves.',
      },
      {
        keywords: ['paint', 'graffiti', 'watch your six'],
        description:
          'WATCH YOUR SIX in faded red spray paint. Below it, in different handwriting: RIP JACKSON. Below that: 4/17/35. Someone died here three years ago. The warning came after.',
      },
    ],
    npcSpawns: [],
    itemSpawns: [],
    hollowEncounter: {
      baseChance: 0.20,
      timeModifier: { day: 0.7, night: 2.0, dawn: 1.0, dusk: 1.5 },
      threatPool: [
        { type: 'shuffler', weight: 50, quantity: { min: 2, max: 4, distribution: 'weighted_low' } },
        { type: 'screamer', weight: 30, quantity: { min: 1, max: 1, distribution: 'single' } },
        { type: 'remnant', weight: 20, quantity: { min: 1, max: 2, distribution: 'weighted_low' } },
      ],
      awarenessRoll: { unaware: 0.3, awarePassive: 0.3, awareAggressive: 0.4 },
    },
  },

  // ─── RR-12: Covenant Outskirts ────────────────────────────────────────────
  {
    id: 'rr_12_covenant_outskirts',
    name: 'Covenant Outskirts',
    zone: 'river_road',
    act: 1,
    difficulty: 1,
    visited: false,
    flags: { safeRest: false },
    description:
      'The road widens as it approaches the first signs of Covenant. A cleared buffer zone — trees felled, brush burned, sightlines opened — surrounds the settlement for a hundred yards in every direction. Stakes with sharpened points angle outward from the ground like a medieval defense. Beyond them, the walls of Covenant rise: school buses, shipping containers, earthworks, and razor wire. The gate is visible to the north, flanked by watchtowers. An Accord banner — blue field, white hand — hangs from the tallest tower.',
    descriptionNight:
      'The buffer zone is pale dirt under moonlight. Lanterns burn in the watchtowers. The walls are dark shapes. You can see sentries moving on the wall — silhouettes against lamp glow. They can see you too.',
    shortDescription:
      'The road widens as it approaches the first signs of Covenant.',
    exits: {
      south: 'rr_11_the_bend',
      north: 'cv_01_main_gate',
    },
    items: [],
    enemies: [],
    npcs: [],
    extras: [
      {
        keywords: ['buffer zone', 'cleared', 'stakes'],
        description:
          'The buffer zone is maintained weekly by Accord work crews. Every bush, every sapling, every piece of cover that could hide an approaching threat is removed. The stakes are pressure-treated fence posts, sharpened to points, angled at 45 degrees. They won\'t stop a Brute. They\'ll slow a herd.',
      },
      {
        keywords: ['walls', 'containers', 'buses', 'banner'],
        description:
          'Covenant\'s walls are improvised but serious. The foundation is shipping containers filled with earth and gravel. School buses fill the gaps. On top, a walkway of pallets and planks where sentries patrol. The Accord banner is visible from a mile in good light. It says: we\'re here. We\'re organized. Think twice.',
      },
      {
        keywords: ['watchtowers', 'sentries', 'gate'],
        description:
          'Two watchtowers flank the main gate — scaffolding platforms with corrugated steel windbreaks. Each has a sentry with a scoped rifle and a megaphone. They watch the road and they watch you and they see everything that happens in the buffer zone.',
      },
    ],
    npcSpawns: [
      {
        npcId: 'covenant_gate_sentry',
        spawnChance: 0.90,
        spawnType: 'anchored',
        activityPool: [
          { desc: 'A sentry on the wall raises a megaphone. \'Halt there. State your business and approach slowly.\'', weight: 3 },
          { desc: 'Two sentries watch from the towers. One tracks you with a scope. The other speaks into a radio.', weight: 2 },
        ],
      },
    ],
    narrativeNotes:
      'Transition room from River Road to Covenant zone. The sentry megaphone is the first direct NPC interaction that establishes Covenant\'s character — organized, cautious, procedural.',
  },

  // ─── RR-13: The Fishing Hole ──────────────────────────────────────────────
  {
    id: 'rr_13_fishing_hole',
    name: 'The Fishing Hole',
    zone: 'river_road',
    act: 1,
    difficulty: 1,
    visited: false,
    flags: { safeRest: true, hiddenRoom: true, waterSource: true, campfireAllowed: true },
    description:
      'A secluded bend in the river, screened from the road by a stand of willows. The water is deep here — a pool carved by centuries of current against a rock shelf. The surface is dark and still except where insects dimple it. Someone has built a rough bench from a split log. A forked stick for holding a fishing line is driven into the bank. This is someone\'s secret spot. Or it was.',
    descriptionNight:
      'The willows form a curtain. The pool is black glass. An owl calls from across the river. This might be the most peaceful place in the Four Corners.',
    descriptionDawn:
      'Dawn at the fishing hole comes through the willow curtain in thin bright lines — the branches filter the early light into a pattern that moves on the pool surface like something written in a language you almost read. The water is dark and still except where an insect touches it, each dimple spreading a ring of gold. The split-log bench is wet with dew. The forked stick casts a shadow across the bank that reaches the water\'s edge. A heron stands in the shallows downstream, motionless, one leg lifted, waiting with a patience that predates everything.',
    shortDescription:
      'A secluded bend in the river, screened from the road by a stand of willows.',
    exits: {
      west: 'rr_03_east_bank',
    },
    items: [],
    enemies: [],
    npcs: [],
    extras: [
      {
        keywords: ['pool', 'water', 'deep'],
        description:
          'The pool is eight feet deep at its center — you can see the bottom in clear conditions. Trout hold in the shadow of the rock shelf. Big ones. This is food that doesn\'t shoot back.',
      },
      {
        keywords: ['bench', 'log', 'stick', 'fishing'],
        description:
          'Someone comes here regularly. The bench is worn smooth. The forked stick is fresh — replaced recently. A pile of fish bones near the water\'s edge confirms it. Whoever fishes here is good at it and doesn\'t share the location.',
      },
      {
        keywords: ['willows', 'trees', 'screen'],
        description:
          'Weeping willows, their trailing branches forming a green curtain between you and the road. From the road, this spot is invisible. From here, you can see through the branches to the road. A watcher\'s advantage.',
      },
    ],
    npcSpawns: [
      {
        npcId: 'lone_fisher',
        spawnChance: 0.25,
        spawnType: 'wanderer',
        activityPool: [
          { desc: 'A woman sits on the bench, line in the water, expression of total concentration. She doesn\'t acknowledge you. The concentration is real — or a convincing way to avoid conversation.', weight: 3 },
        ],
        dialogueTree: 'rr_fisher_lore',
      },
    ],
    itemSpawns: [
      {
        entityId: 'fresh_fish',
        spawnChance: 0.35,
        quantity: { min: 1, max: 2, distribution: 'weighted_low' },
        conditionRoll: { min: 0.8, max: 1.0 },
        groundDescription: 'A fresh trout lies on the rock shelf, gutted and ready to cook. Left behind or left as an offering.',
      },
      {
        entityId: 'fishing_line_improvised',
        spawnChance: 0.20,
        quantity: { min: 1, max: 1, distribution: 'single' },
        conditionRoll: { min: 0.5, max: 0.9 },
        groundDescription: 'A coil of fishing line with a bent pin hook is tucked under the bench.',
      },
    ],
  },

  // ─── RR-14: Riverbank Camp ────────────────────────────────────────────────
  {
    id: 'rr_14_riverbank_camp',
    name: 'Riverbank Camp',
    zone: 'river_road',
    act: 1,
    difficulty: 1,
    visited: false,
    flags: { safeRest: true, campfireAllowed: true, waterSource: true },
    description:
      'A flat area of packed sand on the riverbank, sheltered by a natural rock overhang that keeps the rain off. Someone has established a semi-permanent camp: a fire ring with a grill grate, a rope strung between trees for drying clothes or meat, and a lean-to made of pine branches. The river is six feet away. The road is thirty feet above.',
    descriptionNight:
      'The overhang blocks the sky. The fire ring is cold. The river is close and loud. This is the kind of place where you sleep with one eye open because the sound of the water would mask anything approaching.',
    shortDescription:
      'A flat area of packed sand on the riverbank, sheltered by a natural rock overhang that keeps the rain off.',
    exits: {
      west: 'rr_04_south_bend',
    },
    items: [],
    enemies: [],
    npcs: [],
    extras: [
      {
        keywords: ['overhang', 'rock', 'shelter'],
        description:
          'Natural sandstone overhang, deep enough to keep rain off a sleeping area. The rock is blackened from years of campfire smoke. Someone carved their initials: M.C. + J.L., inside a heart. Pre-Collapse, probably. People used to come here for fun.',
      },
      {
        keywords: ['camp', 'fire ring', 'lean-to', 'grill'],
        description:
          'A well-established river camp. The grill grate is a repurposed oven rack. The lean-to would sleep two, tightly. This is someone\'s regular spot, but the ashes in the fire ring are cold and the lean-to has a cobweb across the entrance. They haven\'t been back recently.',
      },
    ],
    npcSpawns: [],
    itemSpawns: [
      {
        entityId: 'dried_meat_strip',
        spawnChance: 0.20,
        quantity: { min: 1, max: 2, distribution: 'weighted_low' },
        conditionRoll: { min: 0.4, max: 0.8 },
        groundDescription: 'A strip of dried meat hangs from the rope line, forgotten or deliberately left.',
      },
      {
        entityId: 'fire_starter_kit',
        spawnChance: 0.15,
        quantity: { min: 1, max: 1, distribution: 'single' },
        conditionRoll: { min: 0.5, max: 0.9 },
        groundDescription: 'A small tin of fire-starting supplies — char cloth, a ferro rod, and dry tinder — sits on a rock shelf.',
      },
    ],
  },

  // ─── RR-15: South River Trail ─────────────────────────────────────────────
  {
    id: 'rr_15_south_river',
    name: 'South River Trail',
    zone: 'river_road',
    act: 1,
    difficulty: 1,
    visited: false,
    flags: { safeRest: false },
    description:
      'The trail follows the river south, narrowing as the terrain steepens. The water quickens here, tumbling over boulders in white rapids. The scrubland gives way to exposed rock and sparse piñon. The trail is less traveled — boot prints are fewer, fainter. A cairn of stacked stones marks a junction where a side trail climbs west toward higher ground.',
    descriptionNight:
      'The rapids are white noise. The trail is barely visible between the rocks. The cairn is a dark stack. West, the terrain climbs into blackness.',
    shortDescription:
      'The trail follows the river south, narrowing as the terrain steepens.',
    exits: {
      north: 'rr_05_the_ford',
      west: 'br_01_canyon_mouth',
      south: 'rr_17_river_bend_south',
    },
    items: [],
    enemies: [],
    npcs: [],
    extras: [
      {
        keywords: ['rapids', 'boulders', 'water'],
        description:
          'Too fast and too rocky to cross here. The current would tumble you. But the rapids aerate the water — this is where the fish are thickest, fighting upstream.',
      },
      {
        keywords: ['cairn', 'stones', 'junction'],
        description:
          'A trail cairn, Drifter-style. The side trail west is steep and unmarked beyond the cairn. It leads toward the breaks — the canyon country.',
      },
    ],
    npcSpawns: [],
    itemSpawns: [
      { entityId: 'smooth_river_stone', spawnChance: 0.6, quantity: { min: 1, max: 2, distribution: 'flat' } },
      { entityId: 'juniper_firewood', spawnChance: 0.4, quantity: { min: 1, max: 1, distribution: 'flat' } },
    ],
    hollowEncounter: {
      baseChance: 0.25,
      timeModifier: { night: 1.4, dawn: 0.7, dusk: 1.1, day: 0.6 },
      threatPool: [
        { type: 'shuffler', weight: 3, quantity: { min: 1, max: 2, distribution: 'flat' } },
        { type: 'remnant', weight: 1, quantity: { min: 1, max: 1, distribution: 'flat' } },
      ],
    },
  },

  // ─── RR-16: The Deep Pools ────────────────────────────────────────────────
  {
    id: 'rr_16_deep_pools',
    name: 'The Deep Pools',
    zone: 'river_road',
    act: 1,
    difficulty: 1,
    visited: false,
    flags: { safeRest: true, waterSource: true, campfireAllowed: true },
    description:
      'The river widens into a series of deep pools connected by shallow riffles. The water is crystalline, ten feet deep in places, the bottom visible as a mosaic of colored stone. Cliff walls rise on both sides, striped red and cream. This is a box canyon carved by water — beautiful, enclosed, and with limited exits. An old rope swing hangs from a cottonwood branch over the largest pool, frayed but still attached.',
    descriptionNight:
      'The pools are mirrors reflecting the canyon walls and a strip of stars overhead. The water is black and bottomless-looking. The rope swing turns slowly.',
    shortDescription:
      'The river widens into a series of deep pools connected by shallow riffles.',
    exits: {
      west: 'rr_09_cottonwood_stretch',
    },
    items: [],
    enemies: [],
    npcs: [],
    extras: [
      {
        keywords: ['pools', 'water', 'deep'],
        description:
          'Deep enough to swim. Cold enough to gasp. The pools were a swimming hole before the Collapse — you can see faded spray paint on the cliff walls from years of teenagers marking their territory. SENIORS 2029. JAKE LOVES EMMA. The human equivalent of the cottonwoods\' growth rings.',
      },
      {
        keywords: ['rope swing', 'swing', 'rope'],
        description:
          'The rope is frayed at the top where it wraps the branch. Good for maybe a dozen more swings before it snaps. You could test it. The water below is deep enough. Probably.',
      },
      {
        keywords: ['cliffs', 'walls', 'canyon'],
        description:
          'Thirty-foot sandstone walls on three sides. One way in, one way out — the trail to the west. Defensible in a siege. Inescapable in a trap. Depends on which side of the math you\'re on.',
      },
    ],
    npcSpawns: [],
    itemSpawns: [
      {
        entityId: 'smooth_river_stone',
        spawnChance: 0.60,
        quantity: { min: 2, max: 5, distribution: 'bell' },
        conditionRoll: { min: 0.8, max: 1.0 },
        groundDescription: 'Smooth, palm-sized river stones in a range of colors line the bank.',
      },
    ],
  },

  // ─── RR-17: South River Bend ──────────────────────────────────────────────
  {
    id: 'rr_17_river_bend_south',
    name: 'South River Bend',
    zone: 'river_road',
    act: 1,
    difficulty: 2,
    visited: false,
    flags: { safeRest: false },
    description:
      'The river bends east and the trail peters out against a wall of tumbled boulders. The terrain here is transitional — scrubland giving way to red-rock canyon formations. You can see the first slot canyons of The Breaks to the south, narrow dark lines cut into the mesa. The river drops through a series of cascades, the sound filling the air. This is the edge of the settled world.',
    descriptionNight:
      'The cascades are a roar in the dark. The Breaks are a wall of shadow to the south. Stars are visible between the canyon rims like diamonds set in bone.',
    shortDescription:
      'The river bends east and the trail peters out against a wall of tumbled boulders.',
    exits: {
      north: 'rr_15_south_river',
    },
    richExits: {
      south: {
        destination: 'br_01_canyon_mouth',
        descriptionVerbose: 'into the canyon country',
        skillGate: { skill: 'survival', dc: 5, failMessage: 'The canyon country ahead is not forgiving of mistakes.' },
      },
    },
    items: [],
    enemies: [],
    npcs: [],
    extras: [
      {
        keywords: ['boulders', 'rocks', 'tumbled'],
        description:
          'A rockfall, maybe decades old, blocks the old trail. Climbable, but you\'d need Climbing skill and both hands free.',
      },
      {
        keywords: ['breaks', 'canyons', 'south'],
        description:
          'The Breaks begin here — a maze of slot canyons, mesas, and hidden valleys that extends south for thirty miles. Few people go in. Fewer come out with all their supplies. The ones who do come back with stories they don\'t tell sober.',
      },
      {
        keywords: ['cascades', 'waterfalls', 'drops'],
        description:
          'The river drops ten feet over three cascades, each one a curtain of white water over dark rock. The mist from the falls keeps the surrounding rock perpetually wet and the moss perpetually green.',
      },
    ],
    npcSpawns: [],
    itemSpawns: [
      { entityId: 'smooth_river_stone', spawnChance: 0.6, quantity: { min: 1, max: 2, distribution: 'flat' } },
      { entityId: 'juniper_firewood', spawnChance: 0.4, quantity: { min: 1, max: 1, distribution: 'flat' } },
    ],
    hollowEncounter: {
      baseChance: 0.25,
      timeModifier: { night: 1.4, dawn: 0.7, dusk: 1.1, day: 0.6 },
      threatPool: [
        { type: 'shuffler', weight: 3, quantity: { min: 1, max: 2, distribution: 'flat' } },
        { type: 'remnant', weight: 1, quantity: { min: 1, max: 1, distribution: 'flat' } },
      ],
    },
  },

  // ─── RR-18: The Hanging Tree ──────────────────────────────────────────────
  {
    id: 'rr_18_hanging_tree',
    name: 'The Hanging Tree',
    zone: 'river_road',
    act: 1,
    difficulty: 1,
    visited: false,
    flags: { safeRest: false },
    description:
      'A massive ponderosa pine stands alone on a rise overlooking the road, its lowest branch twenty feet up and thick as a man\'s torso. Three ropes hang from that branch. Two are empty. One is not. The body wears the tattered remains of clothing but no identification. A wooden sign nailed to the trunk reads: RAIDER. CONVICTED BY ACCORD TRIBUNAL. SENTENCE CARRIED OUT 3/12/37. THIS IS JUSTICE. The road below is quieter than it should be. People don\'t linger here.',
    descriptionNight:
      'The tree is a black shape against the sky. The ropes are dark lines. The body turns slowly in whatever wind finds this hill. You don\'t look up.',
    shortDescription:
      'A massive ponderosa pine stands alone on a rise overlooking the road, its lowest branch twenty feet up and thick as a man\'s torso.',
    exits: {
      south: 'rr_11_the_bend',
      north: 'rr_12_covenant_outskirts',
    },
    items: [],
    enemies: [],
    npcs: [],
    extras: [
      {
        keywords: ['body', 'hanging', 'ropes'],
        description:
          'The body has been here at least a year — desiccated by the dry mountain air rather than decomposed. The face is leather and bone. The clothes are sun-faded. One boot is missing. Birds have been at the eyes. The other two ropes are empty, their nooses still tied. Ready.',
      },
      {
        keywords: ['sign', 'tribunal', 'justice', 'raider'],
        description:
          'The Accord doesn\'t execute often. When they do, they make it public. The sign is official — formatted, dated, signed by Marshal Cross. RAIDER. The word is simple. The act it condemns — attacking caravans, stealing supplies, killing travelers — is not.',
      },
      {
        keywords: ['tree', 'ponderosa', 'branch'],
        description:
          'The tree predates the Collapse by centuries. It has been used for this purpose before — you can see the rope scars on the branch. Not all of them are seven years old. This has been an execution site for longer than CHARON-7 has existed. Some things about human beings don\'t change.',
      },
    ],
    npcSpawns: [],
    itemSpawns: [
      {
        entityId: 'torn_note_fragment',
        spawnChance: 0.20,
        quantity: { min: 1, max: 1, distribution: 'single' },
        conditionRoll: { min: 0.5, max: 0.8 },
        groundDescription: 'A folded note is wedged into a crack in the tree bark, low, where someone kneeling could reach.',
      },
    ],
    narrativeNotes:
      'Moral weight room. The Accord isn\'t just nice people with good intentions — they execute raiders. Is this justice or brutality? The player\'s reaction to this room starts shaping their relationship with the Accord before they even enter Covenant. The letter at the tree base is from the executed raider to someone they loved. It doesn\'t justify what they did. It humanizes it.',
  },

  // ─── RR-19: Highway Rest Stop Ruins ──────────────────────────────────────
  {
    id: 'rr_19_old_highway_rest',
    name: 'Highway Rest Stop Ruins',
    zone: 'river_road',
    act: 1,
    difficulty: 1,
    visited: false,
    flags: { safeRest: false, scavengingZone: true },
    description:
      'The concrete skeleton of a highway rest stop — bathrooms, a covered picnic area, and a parking lot that nature is slowly reclaiming. The restroom building is still standing, its cinder-block walls impervious to everything except time. The picnic tables have collapsed. A vending machine lies face-down in the parking lot, its glass shattered, its contents long since raided. But the covered area still provides shade, and the bathrooms have intact walls that block the wind.',
    descriptionNight:
      'The rest stop is a series of angular shadows. The bathroom building is a dark block. The vending machine is a beached metal corpse. The covered area would keep the dew off. It would also screen you from seeing anything approaching.',
    shortDescription:
      'The concrete skeleton of a highway rest stop.',
    exits: {
      east: 'rr_04_south_bend',
      west: 'rr_20_abandoned_motel',
    },
    items: [],
    enemies: [],
    npcs: [],
    extras: [
      {
        keywords: ['bathrooms', 'restroom', 'building'],
        description:
          'Cinder block, built to last. The fixtures are useless — no water pressure, no electricity. But the walls are solid, the roof is intact, and someone has swept one of the stalls and laid a bedroll inside. A shelter of last resort.',
      },
      {
        keywords: ['vending machine', 'machine'],
        description:
          'A Coca-Cola machine, face-down. The glass is broken. The coin slot is jammed with a fork — someone tried to get free drinks and failed at the worst possible time. The inside is empty. Picked clean years ago. But the machine itself is heavy-gauge steel. Good scrap.',
      },
      {
        keywords: ['parking lot', 'concrete', 'lot'],
        description:
          'Fifteen parking spaces, two of them handicapped. Three rusted vehicle husks: a sedan, an SUV, and a motorcycle tipped on its side. The motorcycle is stripped to the frame. Someone knew what they were doing.',
      },
    ],
    npcSpawns: [
      {
        npcId: 'rest_stop_squatter',
        spawnChance: 0.20,
        spawnType: 'wanderer',
        activityPool: [
          { desc: 'A gaunt figure emerges from the bathroom building, blinking. They look like they\'ve been sleeping in there. They look like they\'ve been sleeping in there for a while.', weight: 3 },
        ],
        dispositionRoll: { friendly: 0.1, neutral: 0.3, wary: 0.5, hostile: 0.1 },
      },
    ],
    itemSpawns: [
      {
        entityId: 'scrap_metal',
        spawnChance: 0.40,
        quantity: { min: 1, max: 3, distribution: 'weighted_low' },
        conditionRoll: { min: 0.3, max: 0.7 },
        groundDescription: 'Scrap metal from the vehicle husks is piled loosely near the motorcycle frame.',
      },
      {
        entityId: 'empty_cola_can',
        spawnChance: 0.50,
        quantity: { min: 1, max: 2, distribution: 'weighted_low' },
        conditionRoll: { min: 0.1, max: 0.3 },
        groundDescription: 'A crushed cola can lies under the picnic shelter, faded red.',
      },
    ],
    hollowEncounter: {
      baseChance: 0.14,
      timeModifier: { day: 0.6, night: 2.0, dawn: 0.8, dusk: 1.4 },
      threatPool: [
        { type: 'shuffler', weight: 70, quantity: { min: 1, max: 3, distribution: 'weighted_low' } },
        { type: 'remnant', weight: 30, quantity: { min: 1, max: 1, distribution: 'single' } },
      ],
    },
  },

  // ─── RR-20: Abandoned Motel — Parking Lot ────────────────────────────────
  {
    id: 'rr_20_abandoned_motel',
    name: 'Abandoned Motel — Parking Lot',
    zone: 'river_road',
    act: 1,
    difficulty: 2,
    visited: false,
    flags: { safeRest: false, scavengingZone: true },
    description:
      'The Mountain View Motor Lodge — a two-story L-shaped motel from the 1970s, its neon sign dark, its pool drained and cracked, its parking lot a garden of determined weeds. The building is intact but weathered. Most of the ground-floor doors are open, their rooms visible as dark rectangles. The second floor has a walkway with a rusted railing. A faded billboard out front advertises HBO, A/C, AND REASONABLE RATES. The rates seem very reasonable now.',
    descriptionNight:
      'The motel is a series of dark doorways. The empty pool is a black pit. The second-floor walkway catches moonlight on its railing. Every room is a potential encounter.',
    shortDescription:
      'The Mountain View Motor Lodge — a two-story L-shaped motel from the 1970s, its neon sign dark.',
    exits: {
      east: 'rr_19_old_highway_rest',
      up: 'rr_22_motel_second_floor',
    },
    richExits: {
      east: {
        destination: 'rr_21_motel_room7',
        descriptionVerbose: 'Room 7 (locked — key required)',
        locked: true,
        lockedBy: 'room_key_motel',
      },
    },
    items: [],
    enemies: [],
    npcs: [],
    extras: [
      {
        keywords: ['sign', 'neon', 'billboard', 'mountain view'],
        description:
          'MOUNTAIN VIEW MOTOR LODGE. The neon tubes are intact but dark. The mountain view is still accurate — you can see the San Juans from the parking lot. The lodge isn\'t wrong. It\'s just not relevant.',
      },
      {
        keywords: ['pool', 'empty', 'drained'],
        description:
          'An in-ground pool, kidney-shaped, now a concrete pit full of dead leaves, a shopping cart, and what appears to be a mattress. Something has nested in the shallow end — the leaves are arranged in a circular depression.',
      },
      {
        keywords: ['rooms', 'doors', 'motel'],
        description:
          'Twelve rooms on the ground floor, twelve above. Most doors are open. The rooms are stripped — mattresses gone or destroyed, fixtures ripped out. But the walls are solid, the roofs don\'t leak, and the doors still close. For a traveler, that\'s luxury.',
      },
    ],
    npcSpawns: [
      {
        npcId: 'motel_survivor',
        spawnChance: 0.15,
        spawnType: 'wanderer',
        activityPool: [
          { desc: 'A man sits on the second-floor walkway, legs dangling over the edge, eating something from a can. He watches you without much interest.', weight: 2 },
          { desc: 'Sounds of someone rummaging come from one of the ground-floor rooms. A crash. A muttered curse.', weight: 2 },
        ],
      },
    ],
    itemSpawns: [
      {
        entityId: 'motel_bible',
        spawnChance: 0.30,
        quantity: { min: 1, max: 1, distribution: 'single' },
        conditionRoll: { min: 0.5, max: 0.9 },
        groundDescription: 'A Gideon Bible lies face-down in the parking lot, pages riffling in the wind.',
      },
      {
        entityId: 'soap_bar',
        spawnChance: 0.40,
        quantity: { min: 1, max: 3, distribution: 'weighted_low' },
        conditionRoll: { min: 0.6, max: 1.0 },
        groundDescription: 'Individually wrapped soap bars are scattered near a broken supply cart.',
      },
      {
        entityId: 'room_key_motel',
        spawnChance: 0.10,
        quantity: { min: 1, max: 1, distribution: 'single' },
        conditionRoll: { min: 0.5, max: 1.0 },
        groundDescription: 'A room key with a plastic fob — Room 7 — lies on the sidewalk.',
      },
    ],
    hollowEncounter: {
      baseChance: 0.18,
      timeModifier: { day: 0.5, night: 2.5, dawn: 0.7, dusk: 1.5 },
      threatPool: [
        { type: 'shuffler', weight: 65, quantity: { min: 1, max: 3, distribution: 'bell' } },
        { type: 'remnant', weight: 30, quantity: { min: 1, max: 2, distribution: 'weighted_low' } },
        { type: 'whisperer', weight: 5, quantity: { min: 1, max: 1, distribution: 'single' } },
      ],
      activityPool: {
        whisperer: [
          { desc: 'sits in one of the open doorways, watching the parking lot. As you approach, it speaks. \'Room for the night?\' The voice is almost normal. Almost.', weight: 2 },
        ],
      },
    },
    narrativeNotes:
      'First possible Whisperer encounter. The Whisperer saying \'Room for the night?\' in a motel is the game at its most unsettling. It\'s not a jump scare — it\'s a moment of wrongness that the player will remember.',
  },

  // ─── RR-21: Motel Room 7 ─────────────────────────────────────────────────
  {
    id: 'rr_21_motel_room7',
    name: 'Mountain View Motor Lodge — Room 7',
    zone: 'river_road',
    act: 1,
    difficulty: 1,
    visited: false,
    flags: { safeRest: true, hiddenRoom: true },
    description:
      'Room 7 was locked for a reason. Someone lived here after the Collapse — really lived, not just sheltered. The bed is made. A water jug sits on the nightstand, empty. Canned food is stacked on the dresser, all opened, all empty, arranged in a line by brand. A journal lies open on the pillow. The last entry is dated 4/3/32 — one year after the Collapse. After that, nothing. The room is clean. Whoever lived here was organized, methodical, and alone.',
    descriptionNight:
      'The room is dark. The made bed is a pale rectangle. The journal on the pillow is a shadow.',
    shortDescription:
      'Room 7 was locked for a reason.',
    exits: {
      west: 'rr_20_abandoned_motel',
    },
    items: [],
    enemies: [],
    npcs: [],
    extras: [
      {
        keywords: ['journal', 'diary', 'book', 'pillow'],
        description:
          'The journal is a composition notebook, half-filled. The handwriting is small and precise. The entries begin on Day 1 of the Collapse and document one person\'s methodical survival: water purification, food rationing, fortification of the room. The tone is calm. Almost clinical. The last entry reads: \'Day 367. Water gone. Will try the river. If this is the last entry, it was a good run.\' It was the last entry.',
      },
      {
        keywords: ['cans', 'food', 'dresser', 'line'],
        description:
          'Twenty-three cans, arranged in a line. Beans, corn, peaches, soup. All opened cleanly with a can opener, all washed, all placed right-side up. Someone ate these over the course of a year and kept the empties as a record. Twenty-three cans. Three hundred sixty-seven days. The math doesn\'t work. They were hungry for a long time.',
      },
      {
        keywords: ['bed', 'made', 'clean'],
        description:
          'Hospital corners. The sheet is tucked tight enough to bounce a coin. In a world that had stopped requiring order, this person maintained it. The discipline of someone who knew that keeping the bed made was keeping themselves sane.',
      },
    ],
    npcSpawns: [],
    itemSpawns: [
      {
        entityId: 'torn_note_fragment',
        spawnChance: 0.80,
        quantity: { min: 1, max: 1, distribution: 'single' },
        conditionRoll: { min: 0.9, max: 1.0 },
        groundDescription: 'The journal is here. It is the room\'s only treasure.',
      },
      {
        entityId: 'can_opener_quality',
        spawnChance: 0.60,
        quantity: { min: 1, max: 1, distribution: 'single' },
        conditionRoll: { min: 0.7, max: 0.9 },
        groundDescription: 'A metal can opener sits on the nightstand, clean and sharp.',
      },
    ],
    narrativeNotes:
      'One of the game\'s most emotionally powerful rooms. No combat. No threat. Just the evidence of one person\'s year-long survival, told through objects. The journal is a Letters Home collectible but also a significant lore piece — it documents early Collapse observations.',
  },

  // ─── RR-22: Motel Second Floor ────────────────────────────────────────────
  {
    id: 'rr_22_motel_second_floor',
    name: 'Mountain View Motor Lodge — Second Floor',
    zone: 'river_road',
    act: 1,
    difficulty: 1,
    visited: false,
    flags: { safeRest: true },
    description:
      'The second-floor walkway runs the length of the building, an exterior corridor with a rusted iron railing overlooking the parking lot. The view is the motel\'s only honest amenity — the San Juan Mountains fill the northern horizon, snow-capped and indifferent. Most of the second-floor doors are closed. One is ajar, its interior dark. A concrete stairwell at the far end leads back down. The railing creaks when you touch it but holds.',
    descriptionNight:
      'The walkway is a narrow ledge in the dark. The railing is cold under your hand. The view north shows the faint glow of Covenant\'s fires against the mountain\'s base. Closer, the parking lot is a gray square. The open door is a rectangle of absolute black.',
    shortDescription:
      'The second-floor walkway runs the length of the building, an exterior corridor with a rusted iron railing overlooking the parking lot.',
    exits: {
      down: 'rr_20_abandoned_motel',
    },
    items: [],
    enemies: [],
    npcs: [],
    extras: [
      {
        keywords: ['view', 'mountains', 'san juan', 'north'],
        description:
          'The mountains are massive from here — closer than they seemed from Crossroads. You can see the foothills, the timber line, and above it, bare rock and snow. Somewhere up there is the Scar. From this distance, it\'s just another valley.',
      },
      {
        keywords: ['railing', 'walkway', 'corridor'],
        description:
          'The railing is original — 1970s iron, now rusted to a warm brown. It flexes slightly under weight but the bolts hold. The walkway concrete is cracked but stable. A defensible position, if you needed one — one stairwell, one ladder, limited approach.',
      },
      {
        keywords: ['door', 'open', 'ajar', 'dark'],
        description:
          'Room 11. The door is ajar. You can see the edge of a bed frame, a curtain moving in the draft. The room smells like dust and something animal. Claw marks on the door frame, at hip height. Small.',
        skillCheck: { skill: 'tracking', dc: 10, successAppend: 'Raccoon. The claw marks are raccoon. The room has been claimed by wildlife. Probably safe, if you don\'t mind the roommate.' },
      },
    ],
    npcSpawns: [],
    itemSpawns: [
      {
        entityId: 'binoculars_intact',
        spawnChance: 0.08,
        quantity: { min: 1, max: 1, distribution: 'single' },
        conditionRoll: { min: 0.6, max: 0.9 },
        groundDescription: 'A pair of binoculars hangs from the railing by a strap, left behind by someone who was watching the road.',
      },
    ],
  },
]
