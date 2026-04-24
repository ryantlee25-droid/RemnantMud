import type { Room } from '@/types/game'

export const CROSSROADS_ROOMS: Room[] = [
  // ─── CR-01: Highway Junction — The Approach ───────────────────────────────
  {
    id: 'cr_01_approach',
    name: 'Highway Junction — The Approach',
    zone: 'crossroads',
    act: 1,
    difficulty: 1,
    visited: false,
    flags: { safeRest: false, tutorialZone: true, fastTravelWaypoint: true },
    description:
      'Two highways meet here in a cracked X of faded asphalt, the painted lines long surrendered to sun and weeds. To the north, a cluster of buildings rises behind a wall of stacked tires and corrugated steel — that\'s Crossroads, the only neutral ground in the Four Corners. A hand-painted sign nailed to a leaning telephone pole reads: NO FACTION WARS INSIDE. VIOLATORS SHOT. Below it, someone has added in smaller letters: not kidding.',
    descriptionNight:
      'The junction is a pool of darkness where two dead highways cross. Firelight flickers behind the tire wall to the north — Crossroads, still open, still lit. The sign on the telephone pole is unreadable in the dark, but you\'ve heard what it says. Everyone has.',
    descriptionDawn:
      'Mist sits low on the asphalt, turning the junction into a gray lake. The Crossroads wall is a dark shape to the north, its gate lanterns burning amber through the fog. A figure moves on the wall — a sentry, or a shadow.',
    descriptionDusk:
      'The sun drops behind the western mesas and the junction turns copper and long shadow. The Crossroads wall catches the last light. The sign on the pole is backlit, the words burning black against orange sky.',
    shortDescription:
      'Two highways meet here in a cracked X of faded asphalt, the painted lines long surrendered to sun and weeds.',
    exits: {
      north: 'cr_02_gate',
      east: 'rr_01_west_approach',
      south: 'br_01_canyon_mouth',
      west: 'du_01_dust_edge',
    },
    richExits: {
      east: {
        destination: 'rr_01_west_approach',
        descriptionVerbose: 'Highway 160, east toward the River Road',
      },
      south: {
        destination: 'br_01_canyon_mouth',
        descriptionVerbose: 'Highway 550 south — the pavement ends at canyon country. Rough wilderness, no settlements.',
        skillGate: { skill: 'survival', dc: 5, failMessage: 'The road south looks rough. You\'re not sure you\'re ready for open wilderness.' },
      },
      west: {
        destination: 'du_01_dust_edge',
        descriptionVerbose: 'Highway 160 west — heat shimmer on cracked asphalt, nothing on the horizon for miles.',
        skillGate: { skill: 'survival', dc: 8, failMessage: 'The heat shimmer to the west is brutal. You\'d need more experience to survive out there.' },
      },
    },
    items: [],
    enemies: [],
    npcs: [],
    extras: [
      {
        keywords: ['sign', 'pole', 'telephone pole'],
        description:
          'The sign is a slab of plywood with house paint lettering. NO FACTION WARS INSIDE. VIOLATORS SHOT. The smaller text underneath reads: seriously, we will shoot you. ask the last guy. oh wait, you can\'t. The paint is weathered but the message is maintained — someone re-paints it regularly.',
      },
      {
        keywords: ['wall', 'tires', 'steel', 'barricade'],
        description:
          'The wall is improvised but effective — tires filled with packed earth, topped with corrugated roofing steel bent into crude merlons. It wouldn\'t stop a vehicle but it channels foot traffic to the gate. You can see razor wire glinting along the top in places.',
      },
      {
        keywords: ['highway', 'road', 'asphalt', 'junction'],
        description:
          'US-160 runs east-west. US-550 runs north-south. Before the Collapse, this intersection saw maybe a hundred cars a day. Now it sees people on foot, the occasional horse, and once in a while, a vehicle that someone has kept running through sheer stubbornness and scavenged parts.',
      },
      {
        keywords: ['weeds', 'cracks', 'ground'],
        description:
          'Seven years of neglect and the earth is taking back the asphalt one crack at a time. Dandelions, thistles, and a tough grass you can\'t name have colonized every seam. A single sunflower has grown through a pothole and stands three feet tall, absurdly cheerful among the ruin.',
      },
    ],
    npcSpawns: [
      {
        npcId: 'crossroads_gate_guard',
        spawnChance: 0.90,
        spawnType: 'anchored',
        quantity: { min: 1, max: 2, distribution: 'weighted_low' },
        activityPool: [
          { desc: 'A Drifter arbiter leans against the gate post, shotgun across her chest, watching you approach with professional disinterest.', weight: 4 },
          { desc: 'A broad-shouldered arbiter stands at the gate, arms crossed, sizing you up as you approach.', weight: 3 },
          { desc: 'Two arbiters are sharing a canteen by the gate. One nods at you. The other doesn\'t.', weight: 2 },
          { desc: 'The gate arbiter eyes you. "Another one asking about the signal? North market. Ask for Sparks." She waves you through before you can respond.', weight: 2 },
        ],
        dispositionRoll: { neutral: 0.8, wary: 0.2 },
      },
    ],
    itemSpawns: [
      {
        entityId: 'discarded_flyer',
        spawnChance: 0.40,
        quantity: { min: 1, max: 1, distribution: 'single' },
        conditionRoll: { min: 0.3, max: 0.8 },
        groundDescription: 'A crumpled flyer is caught against the base of the telephone pole.',
        depletion: { cooldownMinutes: { min: 60, max: 180 }, respawnChance: 0.40 },
      },
      {
        entityId: 'empty_water_bottle',
        spawnChance: 0.30,
        quantity: { min: 1, max: 2, distribution: 'weighted_low' },
        conditionRoll: { min: 0.1, max: 0.5 },
        groundDescription: 'An empty plastic bottle lies in the weeds beside the road.',
        depletion: { cooldownMinutes: { min: 30, max: 90 }, respawnChance: 0.30 },
      },
    ],
    hollowEncounter: {
      baseChance: 0.05,
      timeModifier: { day: 0.3, night: 2.5, dawn: 0.5, dusk: 1.5 },
      threatPool: [
        { type: 'shuffler', weight: 95, quantity: { min: 1, max: 1, distribution: 'single' } },
        { type: 'remnant', weight: 5, quantity: { min: 1, max: 1, distribution: 'single' } },
      ],
      awarenessRoll: { unaware: 0.7, awarePassive: 0.2, awareAggressive: 0.1 },
      activityPool: {
        shuffler: [
          { desc: 'shambles along the highway shoulder, feet dragging, head down, moving with the mechanical persistence of something that has forgotten how to stop', weight: 3 },
          { desc: 'stands motionless in the center of the junction, face turned skyward, mouth open, as if waiting for rain that isn\'t coming', weight: 2 },
        ],
        remnant: [
          { desc: 'walks the shoulder with its arms at its sides, head turning at intersections as if checking traffic that hasn\'t existed in seven years', weight: 2 },
        ],
      },
    },
    environmentalRolls: {
      ambientSoundPool: {
        day: [
          { sound: 'The wind carries dust and the faint smell of cooking from inside Crossroads.', weight: 3 },
          { sound: 'A hawk circles high above the junction, riding a thermal.', weight: 2 },
          { sound: null, weight: 3 },
        ],
        night: [
          { sound: 'Coyotes yip somewhere to the west. Normal coyotes, probably.', weight: 3 },
          { sound: 'The wind has died. The market beyond the wall has gone down to embers — one voice, the scrape of a pot. The junction is the quietest place within a day\'s walk in any direction.', weight: 2 },
          { sound: null, weight: 2 },
        ],
      },
      ambientCount: { min: 0, max: 1, distribution: 'flat' },
      flavorLines: [
        { line: 'A dust devil spirals across the intersection and dissipates.', chance: 0.15, time: ['day'] },
        { line: 'Your shadow stretches long across the cracked asphalt.', chance: 0.20, time: ['dawn', 'dusk'] },
        { line: 'Boot prints in the dust. Dozens of them. All heading north toward the gate.', chance: 0.25, time: null },
      ],
    },
    narrativeNotes:
      'This is the first room every player sees. It needs to orient them geographically (four exits to four zones), establish tone (the sign), and create forward momentum (the wall, the smoke, the voices). The low Hollow encounter chance ensures new players aren\'t killed immediately but still feel the threat.',
  },

  // ─── CR-02: Crossroads Gate ────────────────────────────────────────────────
  {
    id: 'cr_02_gate',
    name: 'Crossroads — The Gate',
    zone: 'crossroads',
    act: 1,
    difficulty: 1,
    visited: false,
    flags: { safeRest: false, noCombat: true },
    description:
      'The gate is a repurposed livestock chute — steel rails bent into an S-curve that forces everyone to pass single file past an arbiter checkpoint. The arbiters wear no faction colors, just gray armbands and the calm expression of people who have ended arguments permanently. Beyond the chute, you can see market stalls, cook smoke, and movement. The sound of voices — actual human conversation, not whispers or warnings — drifts through.',
    descriptionNight:
      'Lanterns hang from hooks along the chute, throwing orange light across the steel rails. The checkpoint arbiter has her shotgun in her hands now, not slung. Night changes the rules. You can still enter, but she watches harder.',
    descriptionDawn:
      'The gate is quiet at dawn. One arbiter, half-asleep, straightens when you approach. The market beyond is just waking — the first cook fires sending thin columns of smoke into the gray air.',
    descriptionDusk:
      'A line has formed at the gate — travelers pushing to get inside before full dark. The arbiter works them through with practiced speed. \'Weapons holstered. Blades sheathed. Move.\'',
    shortDescription:
      'The gate is a repurposed livestock chute — steel rails bent into an S-curve that forces everyone to pass single file past an arbiter checkpoint.',
    exits: {
      south: 'cr_01_approach',
      north: 'cr_03_market_south',
    },
    items: [],
    enemies: [],
    npcs: [],
    extras: [
      {
        keywords: ['arbiter', 'arbiters', 'guard', 'checkpoint'],
        description:
          'The Drifter arbiters are the closest thing Crossroads has to law enforcement. They don\'t arrest you. They don\'t fine you. They shoot you, or they don\'t. The simplicity is the point. Everyone understands the terms.',
      },
      {
        keywords: ['chute', 'rails', 'gate', 's-curve'],
        description:
          'The S-curve forces you to slow down, turn twice, and present yourself to the checkpoint. You can\'t rush through. You can\'t hide what you\'re carrying. It\'s a simple piece of tactical architecture that works exactly as well as it needs to.',
      },
      {
        keywords: ['armbands', 'gray', 'colors'],
        description:
          'Gray for neutral. No faction. The arbiters are Drifters by affiliation but independent by practice. Their loyalty is to the market, not to any banner. Crossroads makes money for everyone. That\'s why everyone lets it exist.',
      },
      {
        keywords: ['voices', 'sound', 'conversation'],
        description:
          'You can hear haggling, laughter, the clatter of a dropped pan, someone calling a name. Ordinary sounds. The sounds of people living in proximity without trying to kill each other. It\'s remarkable how remarkable that\'s become.',
      },
      {
        keywords: ['schedule', 'rotation', 'shift', 'arbiter_schedule', 'pattern'],
        description:
          'You watch the checkpoint long enough to see the rotation: three arbiters, six-hour shifts, changeovers at the ninth hour after dawn, the fifteenth, and the twenty-first. The handover is clean — except for the second-to-third. The outgoing arbiter reports inside the chute-hut before the incoming one takes her post. About fifteen minutes. The north approach is single-watched the whole time, and in the last five minutes nobody is really looking north at all.',
        skillCheck: { skill: 'survival', dc: 9, successAppend: 'You note the exact timing. If you ever need to cross the gate without being seen, the third shift change is the window.' },
        narrativeKeyOnExamine: 'crossroads_guard_rotation',
      },
    ],
    npcSpawns: [
      {
        npcId: 'checkpoint_arbiter',
        spawnChance: 0.95,
        spawnType: 'anchored',
        quantity: { min: 1, max: 1, distribution: 'single' },
        activityPool: [
          { desc: 'The checkpoint arbiter glances at you, notes your gear, and waves you through with a calloused hand.', weight: 5 },
          { desc: 'The arbiter holds up a hand. \'Weapons stay holstered inside. Blades stay sheathed. We clear?\' She doesn\'t wait for an answer.', weight: 3 },
          { desc: 'The arbiter is writing something in a battered ledger. She looks up, looks you over, makes a mark, and nods you through.', weight: 2 },
          { desc: 'The arbiter glances at your gear, then north. "If you\'re here about the broadcast, the radio woman is at the north stalls. Everyone asks eventually."', weight: 1 },
        ],
        dialogueTree: 'cr_arbiter_intro',
        dispositionRoll: { neutral: 0.9, wary: 0.1 },
      },
    ],
    itemSpawns: [],
    narrativeNotes:
      'The no-combat flag is enforced by the arbiters. If the player attacks here, arbiters respond with lethal force. This teaches the player that safe zones exist and are maintained by threat, not magic.',
  },

  // ─── CR-03: Market — South End ────────────────────────────────────────────
  {
    id: 'cr_03_market_south',
    name: 'Crossroads Market — South End',
    zone: 'crossroads',
    act: 1,
    difficulty: 1,
    visited: false,
    flags: { safeRest: false, noCombat: true },
    description:
      'The market is a sprawl of tarps, salvaged tent poles, and repurposed vehicle hoods serving as countertops. The south end is where the food vendors cluster — cook smoke from three different fires mingles overhead, carrying the smell of roasted meat, boiled grain, and something spiced that makes your stomach twist with want. People move between the stalls with the focused efficiency of survivors who know exactly what they need and how many rounds it costs.',
    descriptionNight:
      'The market thins at night but doesn\'t close. The food stalls have banked their fires to embers, but a few vendors remain — the ones who deal in things people need after dark. Medicine. Ammunition. Information. The lantern light makes everything look warmer than it is.',
    descriptionDawn:
      'The south market is quiet at dawn, the tarps sagging with overnight dew. Marta\'s fire is barely a thread of smoke. A vendor sets out her wares in the gray light — jars of dried herbs, lined up with a precision that suggests ritual. The air smells of wet canvas and cold ash. Two early risers stand at the food stalls, waiting. Nobody speaks. The day hasn\'t earned conversation yet.',
    descriptionDusk:
      'The south market accelerates at dusk. Vendors call prices with new urgency, hands moving fast over their inventories. A man wraps unsold jerky in cloth. Marta banks her fire hard, shoveling ash over embers with the efficiency of someone who has lost food to the dark before. The crowd thickens — travelers pushing through to buy what they need before the stalls close. The tarps snap in the evening wind.',
    shortDescription:
      'The market is a sprawl of tarps, salvaged tent poles, and repurposed vehicle hoods serving as countertops.',
    exits: {
      south: 'cr_02_gate',
      north: 'cr_04_market_center',
      east: 'cr_06_info_broker',
      west: 'cr_13_water_station',
    },
    items: [],
    enemies: [],
    npcs: [],
    extras: [
      {
        keywords: ['stalls', 'vendors', 'market', 'tarps'],
        description:
          'Each stall is a small kingdom. The vendors know their inventory to the last bullet, the last pill, the last clean bandage. Prices aren\'t posted — they\'re negotiated, and they change based on who you are and who\'s watching.',
      },
      {
        keywords: ['food', 'meat', 'smoke', 'fire', 'cooking'],
        description:
          'Elk jerky. Boiled amaranth porridge. Roasted squash with salt. A suspicious stew that the vendor swears is rabbit. Everything costs more than you\'d like and less than you\'d pay if you were starving. Which, to be fair, you might be.',
      },
      {
        keywords: ['people', 'crowd', 'survivors'],
        description:
          'Drifters, mostly. A few Accord citizens with their clean armbands. A Salter or two, conspicuously armed, conspicuously watchful. A couple of people in nondescript clothing who could be anyone, which probably means they\'re someone specific.',
      },
    ],
    npcSpawns: [
      {
        npcId: 'food_vendor_marta',
        spawnChance: 0.85,
        spawnType: 'anchored',
        quantity: { min: 1, max: 1, distribution: 'single' },
        activityPool: [
          { desc: 'Marta tends her cook fire, stirring a blackened pot without looking up. A hand-lettered sign reads: ELK JERKY — 3 PENNIES. STEW — 2 PENNIES. NO CREDIT.', weight: 4 },
          { desc: 'Marta is haggling with a Drifter over a strip of jerky. Her voice is patient. Her knife hand is not.', weight: 2 },
          { desc: 'Marta is feeding a scrap of meat to a scrawny cat that lives under her stall. She sees you watching and shrugs. \'Earns its keep. Mice.\'', weight: 1 },
        ],
        tradeInventory: ['boiled_rations', 'elk_jerky', 'purification_tabs', 'salt_1kg'],
        dialogueTree: 'cr_marta_intro',
        dispositionRoll: { friendly: 0.5, neutral: 0.4, wary: 0.1 },
      },
      {
        npcId: 'drifter_newcomer',
        spawnChance: 0.35,
        spawnType: 'wanderer',
        quantity: { min: 1, max: 1, distribution: 'single' },
        activityPool: [
          { desc: 'A young man sits against a tent pole, pack between his knees, looking at the market with the wide eyes of someone who hasn\'t seen this many people in a long time.', weight: 3 },
          { desc: 'A woman with a fresh scar across her temple eats stew with one hand and keeps the other on the knife at her belt.', weight: 2 },
          { desc: 'A child — maybe ten, maybe younger, it\'s hard to tell when kids grow up hungry — darts between the stalls, quick and flat-eyed, already calculating whether you\'re worth remembering.', weight: 1 },
        ],
      },
    ],
    environmentalRolls: {
      ambientSoundPool: {
        day: [
          { sound: 'Two vendors argue about the repeating broadcast. "It\'s a dead tower." "Dead towers don\'t change frequency." The argument has the worn edges of something that happens daily.', weight: 2 },
          { sound: null, weight: 3 },
        ],
        night: [
          { sound: 'In the thin-out between stalls, someone is holding a portable radio to their ear, listening to static with an expression that is not casual.', weight: 2 },
          { sound: null, weight: 3 },
        ],
      },
      ambientCount: { min: 0, max: 1, distribution: 'flat' },
      flavorLines: [
        { line: 'A Drifter leans toward his companion: "Sparks says the signal changed again. North stalls. She\'s been up all night."', chance: 0.20, time: ['day'] },
        { line: 'Overheard between food stalls: "...that repeating broadcast, every night, same words. My kid asked what it means and I didn\'t have an answer."', chance: 0.15, time: null },
      ],
    },
    itemSpawns: [
      {
        entityId: 'ammo_22lr',
        spawnChance: 0.15,
        quantity: { min: 1, max: 2, distribution: 'weighted_low' },
        conditionRoll: { min: 0.8, max: 1.0 },
        groundDescription: 'A .22 round has rolled under the edge of a tarp. Easy to miss.',
        depletion: { cooldownMinutes: { min: 60, max: 240 }, respawnChance: 0.15 },
      },
    ],
    narrativeNotes:
      'Marta is the first friendly NPC most players meet. Her dialogue tree should explain barter basics, mention the factions casually, and hint that Patch (east) is the person to see if you want real information. The child NPC is a worldbuilding touch — children exist in this world. People are building futures.',
  },

  // ─── CR-04: Market — Center ───────────────────────────────────────────────
  {
    id: 'cr_04_market_center',
    name: 'Crossroads Market — Center',
    zone: 'crossroads',
    act: 1,
    difficulty: 1,
    visited: false,
    flags: { safeRest: false, noCombat: true },
    description:
      'The heart of the market. A massive tarp stretched between four telephone poles creates a canopy over the main trading floor. This is where the real commerce happens — weapons, armor, tools, components. The vendors here are professionals, not cooks. Their counters are reinforced. Their wares are displayed with precision. A Drifter arbiter stands on an overturned crate in the center, high enough to see everything, hand resting on the butt of a holstered revolver.',
    descriptionNight:
      'The center market is quieter but not empty. The weapons vendors have locked their serious inventory behind steel shutters, but the component traders are still open. Scrap metal, textiles, electronics — the building blocks. The arbiter on the crate has been replaced by one with a rifle.',
    shortDescription:
      'The heart of the market.',
    exits: {
      south: 'cr_03_market_south',
      north: 'cr_05_market_north',
      east: 'cr_07_patch_clinic',
      west: 'cr_08_job_board',
    },
    items: [],
    enemies: [],
    npcs: [],
    extras: [
      {
        keywords: ['weapons', 'arms', 'guns', 'blades'],
        description:
          'Melee weapons are displayed openly — machetes, hatchets, reinforced bats, a few combat knives of varying quality. Firearms are behind the counter. You point, the vendor retrieves. Ammunition is sold separately, always. Nobody gives you a loaded weapon across a counter.',
      },
      {
        keywords: ['arbiter', 'guard', 'crate', 'revolver'],
        description:
          'The center arbiter is the market\'s keystone. From that crate, she can see every transaction, every argument, every hand moving toward a weapon. She hasn\'t had to draw in weeks. The last person who started trouble in here is buried outside the south wall.',
      },
      {
        keywords: ['canopy', 'tarp', 'poles'],
        description:
          'The canopy was a parachute in a previous life — military surplus, olive drab, faded to the color of dried sage. It filters the sunlight into something almost pleasant. When it rains, the canopy sags in the middle and someone has to poke it with a pole to dump the water.',
      },
    ],
    npcSpawns: [
      {
        npcId: 'weapons_vendor_cole',
        spawnChance: 0.90,
        activityPool: [
          { desc: 'Marcus Cole stands behind his counter, a slab of reinforced plywood on sawhorses, arranging blades by size with the care of a jeweler.', weight: 3 },
          { desc: 'Cole is field-stripping a pistol, his hands moving with the unconscious speed of deep practice. He glances up. \'Buying or browsing?\'', weight: 3 },
          { desc: 'Cole is arguing with a Salter about the price of 9mm. The Salter wants bulk pricing. Cole doesn\'t do bulk pricing. The conversation has the energy of two people who\'ve had it before.', weight: 1 },
        ],
        tradeInventory: ['pipe_wrench', 'hatchet', 'combat_knife', 'machete', '22_rifle', '9mm_pistol', 'ammo_22lr', 'ammo_9mm', 'ammo_shotgun_shell'],
        dialogueTree: 'cr_cole_intro',
      },
      {
        npcId: 'components_vendor',
        spawnChance: 0.80,
        activityPool: [
          { desc: 'A thin woman with wire-rim glasses sorts through bins of salvaged electronics, occasionally holding a component up to the light and squinting.', weight: 3 },
          { desc: 'The components vendor is weighing scrap metal on a hand-balanced scale, lips moving as she counts.', weight: 2 },
        ],
        tradeInventory: ['scrap_metal', 'textiles', 'electronics_salvage', 'chemicals_basic', 'rare_parts_random'],
      },
    ],
    itemSpawns: [],
  },

  // ─── CR-05: Market — North End ────────────────────────────────────────────
  {
    id: 'cr_05_market_north',
    name: 'Crossroads Market — North End',
    zone: 'crossroads',
    act: 1,
    difficulty: 1,
    visited: false,
    flags: { safeRest: false, noCombat: true },
    description:
      'The north end of the market is where things get quieter and more interesting. The bulk trading gives way to specialty vendors — a leatherworker, a woman who repairs radios, a man who claims to sell maps of safe routes through The Breaks. A bulletin board leans against the back wall, thick with pinned notes, wanted posters, and hand-drawn advertisements. Beyond the last stall, a trail leads north into the hills.',
    descriptionNight:
      'Most of the specialty vendors have closed up. The radio repair woman is still here, bent over a gutted shortwave set by lantern light, soldering iron in hand. The trail north is a suggestion of pale dirt against the scrub.',
    shortDescription:
      'The north end of the market is where things get quieter and more interesting.',
    exits: {
      south: 'cr_04_market_center',
      north: 'rr_07_north_fork',
      west: 'cr_09_campground',
      east: 'cr_14_leather_shop',
      down: 'cr_18_the_pit',
    },
    richExits: {
      north: {
        destination: 'rr_07_north_fork',
        descriptionVerbose: 'a trail leads north out of the market, cutting through scrubland directly to the North Fork — a shortcut that skips the lower river road',
        cycleGate: 2,
      },
    },
    items: [],
    enemies: [],
    npcs: [],
    extras: [
      {
        keywords: ['bulletin', 'board', 'notes', 'posters'],
        descriptionPool: [
          { desc: 'The board is chaos. LOOKING FOR: brother, last seen Farmington, answers to David. WANTED: anyone with medical training, Covenant will pay double rations. FOR TRADE: solar panel, cracked but functional, seeking antibiotics. WARNING: Hollow herd spotted moving east along 160, avoid after dark.', weight: 3 },
          { desc: 'A new note is pinned over older ones, dead center, fresh ink: HAS ANYONE ELSE HEARD THE RADIO SIGNAL? I\'m not crazy. Shortwave, repeating loop, something about the Scar. Find me at the north stalls. — E. Someone has written below it: you\'re crazy. And below that, in three different hands: heard it too. heard it too. heard it too.', weight: 4 },
          { desc: 'REVENANTS — if you\'ve died and come back, the Reclaimers want to talk to you. Discreet. No experiments. Just questions. Ask for Lev at The Stacks.', weight: 1, cycleGate: 2 },
        ],
      },
      {
        keywords: ['radio', 'woman', 'shortwave', 'sparks'],
        description:
          'Her name, according to the hand-lettered sign, is Sparks. The workbench is a graveyard of gutted electronics — radios, walkie-talkies, a car stereo, something that might have been a laptop. She works with the intensity of someone who believes she\'s doing important work.',
      },
      {
        keywords: ['maps', 'map', 'man', 'routes'],
        description:
          'The map seller is either a genius or a con artist. His \'maps\' are hand-drawn on whatever flat surface was available — notebook paper, cardboard, the back of a fast food tray. He swears they\'re accurate.',
      },
    ],
    npcSpawns: [
      {
        npcId: 'sparks_radio_repair',
        spawnChance: 0.75,
        activityPool: [
          { desc: 'Sparks is hunched over a shortwave radio, muttering frequencies to herself like a prayer.', weight: 3 },
          { desc: 'Sparks has a radio playing — static mostly, but every few seconds, a fragment of voice cuts through. She\'s writing down every word.', weight: 2, questTrigger: 'radio_signal_intro' },
        ],
        dialogueTree: 'cr_sparks_intro',
        questGiver: ['quest_radio_signal_fragment_1'],
      },
      {
        npcId: 'map_seller_reno',
        spawnChance: 0.55,
        activityPool: [
          { desc: 'A sunburned man in a wide hat is sketching something on cardboard with a stubby pencil, occasionally looking north and squinting as if measuring distance by eye.', weight: 3 },
        ],
        tradeInventory: ['map_breaks_basic', 'map_river_road', 'map_dust_partial'],
      },
    ],
    itemSpawns: [
      {
        entityId: 'torn_note_fragment',
        spawnChance: 0.25,
        quantity: { min: 1, max: 1, distribution: 'single' },
        conditionRoll: { min: 0.5, max: 0.9 },
        groundDescription: 'A torn scrap of paper lies on the ground near the bulletin board, blown loose by the wind.',
      },
    ],
  },

  // ─── CR-06: The Curtain (Info Broker) ─────────────────────────────────────
  {
    id: 'cr_06_info_broker',
    name: 'The Curtain',
    zone: 'crossroads',
    act: 1,
    difficulty: 1,
    visited: false,
    flags: { safeRest: false, noCombat: true, questHub: true },
    description:
      'Behind a heavy canvas curtain, a quieter kind of commerce happens. The space is small — a salvaged desk, two chairs, a lantern, and the overwhelming smell of antiseptic and tobacco. This is where Patch holds court. Information broker, medic, and the most connected person in the Four Corners who claims to owe nobody anything. The curtain muffles the market noise into a distant hum.',
    descriptionNight:
      'The curtain is drawn tight. A thin line of lantern light leaks from underneath. Patch keeps late hours. The question is whether you want to know what that costs.',
    shortDescription:
      'Behind a heavy canvas curtain, a quieter kind of commerce happens.',
    personalLossEchoes: {
      child: 'The antiseptic smell hits you and your body remembers a room like this — smaller, brighter, with machines that beeped and a bed that was too big for them. Patch\'s medical kit is military grade. The one that mattered to you was pediatric. The smell is the same. The helplessness is the same.',
      partner: 'Patch stitches a wound with steady hands and you remember hands like that on your skin — not medical, not clinical, but careful. The same care. The same attention to what hurts. The curtain muffles the world outside and you remember a door that did the same thing, and the quiet inside it, and the person who made the quiet bearable.',
      community: 'An information broker in a curtained room. Every community had one — the person who knew things, who connected people, who sat at the center of the web and pulled threads. Your community had someone like Patch. You don\'t know what happened to them.',
      identity: 'The shorthand on Patch\'s papers. You can almost read it. Your eyes track the symbols and something in your brain tries to fire — a decryption routine, a pattern recognition, a skill you had in a life you can\'t remember. The moment passes. The symbols stay unreadable.',
      promise: 'Patch trades in information. You had information once — the kind that matters, the kind someone was waiting for. You promised to bring it back. The curtain falls closed behind you and the promise sits in the room like a third person.',
    },
    exits: {
      west: 'cr_03_market_south',
    },
    items: [],
    enemies: [],
    npcs: [],
    extras: [
      {
        keywords: ['desk', 'papers', 'notes'],
        description:
          'The desk is covered in papers — hand-drawn maps, lists of names, supply inventories, and notes in a shorthand you can\'t read. Patch notices you looking and shifts a ledger to cover the most interesting page. Not aggressively. Just automatically.',
      },
      {
        keywords: ['curtain', 'canvas'],
        description:
          'Heavy, waxed canvas. Possibly a military tent section. It blocks sound well enough that conversations inside don\'t carry to the market.',
      },
      {
        keywords: ['antiseptic', 'medical', 'supplies'],
        description:
          'A locked metal box sits behind the desk — a military field surgery kit, from the look of it. Patch\'s medical supplies are not for general sale.',
      },
    ],
    npcSpawns: [
      {
        npcId: 'patch',
        spawnChance: 0.80,
        activityPool: [
          { desc: 'Patch sits behind the desk, rolling a cigarette with practiced fingers, watching you with eyes that are cataloging everything about you — gear, posture, how long it\'s been since you ate.', weight: 4 },
          { desc: 'Patch is stitching a wound on a Drifter\'s forearm. Without looking up: \'Sit down. I\'ll be a minute.\'', weight: 2 },
          { desc: 'Patch is alone, reading a water-stained paperback with their feet on the desk. They dog-ear the page when you enter. \'What do you need?\'', weight: 3 },
        ],
        dialogueTree: 'cr_patch_main',
        questGiver: ['quest_radio_signal', 'quest_faction_intro_accord', 'quest_faction_intro_salters', 'quest_faction_intro_kindling', 'quest_faction_intro_reclaimers'],
        tradeInventory: ['antibiotics_01', 'bandages', 'quiet_drops', 'stim_shot'],
      },
    ],
    itemSpawns: [],
    narrativeNotes:
      'CRITICAL QUEST HUB. Patch is the tutorial NPC who explains factions, offers the radio signal quest, and gives the player their first real choice. Patch\'s dialogue changes significantly in Cycle 2+ — they recognize Revenants and have specific lines. In Cycle 3+, Patch reveals they know about MERIDIAN.',
  },

  // ─── CR-07: The Red Door Clinic ───────────────────────────────────────────
  {
    id: 'cr_07_patch_clinic',
    name: 'The Red Door Clinic',
    zone: 'crossroads',
    act: 1,
    difficulty: 1,
    visited: false,
    flags: { safeRest: true, healingBonus: 1.5, noCombat: true },
    description:
      'A converted storage container with a red cross painted on the door — sloppy, but visible from anywhere in the market. Inside, it\'s clean. Aggressively clean. Two cots with actual sheets. Medical instruments line a shelf in order of size. This is where Crossroads sends its wounded, and the reason Patch is the most protected person in the Four Corners.',
    descriptionNight:
      'The clinic\'s lantern burns all night. Someone is always hurt. Someone is always sick.',
    shortDescription:
      'A converted storage container with a red cross painted on the door.',
    exits: {
      west: 'cr_04_market_center',
    },
    items: [],
    enemies: [],
    npcs: [],
    extras: [
      {
        keywords: ['cots', 'beds', 'sheets'],
        description:
          'Two cots, both empty at the moment. The sheets are threadbare but clean — boiled, probably. A luxury most people haven\'t experienced since the Collapse. The pillow on the left cot has a bloodstain that didn\'t fully wash out.',
      },
      {
        keywords: ['instruments', 'tools', 'medical', 'shelf'],
        description:
          'Scalpels, forceps, suture needles, a hand-cranked aspirator, clamps. Pre-Collapse surgical quality. Patch didn\'t find these at a pharmacy — this is military field surgery equipment.',
      },
    ],
    npcSpawns: [
      {
        npcId: 'wounded_drifter',
        spawnChance: 0.40,
        activityPool: [
          { desc: 'A Drifter lies on the far cot, bandaged arm across their chest, staring at the ceiling with vacant patience.', weight: 3 },
          { desc: 'A young woman sits on the edge of the cot, unwrapping a dirty bandage from her ankle while muttering at the wound underneath.', weight: 2 },
        ],
      },
    ],
    itemSpawns: [
      {
        entityId: 'bandages_clean',
        spawnChance: 0.20,
        quantity: { min: 1, max: 2, distribution: 'weighted_low' },
        conditionRoll: { min: 0.8, max: 1.0 },
        groundDescription: 'A roll of clean bandage material sits on the shelf edge, partially unrolled.',
      },
    ],
  },

  // ─── CR-08: The Job Board ─────────────────────────────────────────────────
  {
    id: 'cr_08_job_board',
    name: 'The Job Board',
    zone: 'crossroads',
    act: 1,
    difficulty: 1,
    visited: false,
    flags: { safeRest: false, noCombat: true, questHub: true },
    description:
      'A section of chain-link fence has been repurposed as the market\'s job board — a ten-foot wall of pinned notes, offers, requests, and warnings. This is how work gets done in the Four Corners. Need a caravan guard? Post it. Need a building cleared of Hollow? Post it. A wooden bench sits in front of it, worn smooth by the backsides of people reading slowly.',
    descriptionNight:
      'The job board is unreadable in the dark. But the bench is occupied — two shapes at opposite ends, still and quiet, waiting for morning. Not your business.',
    shortDescription:
      'A section of chain-link fence has been repurposed as the market\'s job board.',
    exits: {
      east: 'cr_04_market_center',
    },
    items: [],
    enemies: [],
    npcs: [],
    extras: [
      {
        keywords: ['board', 'notes', 'jobs', 'postings'],
        descriptionPool: [
          { desc: 'Pinned at the top of the board, fresh paper, underlined twice: SIGNAL INVESTIGATION — Electronics salvage and wire coil needed. Bring components to Sparks at the north market. This is not a drill. THIS IS NOT A DRILL. Below it, the usual postings: CARAVAN GUARD NEEDED: Crossroads to Salt Creek, 3-day round trip. Pay: 50 Pennies + meals. CLEARING JOB: Hollow nest in gas station off 160 east. Bounty: 30 Pennies per confirmed kill.', weight: 5 },
          { desc: 'URGENT: Medical supplies needed at The Ember. Will pay triple rate. TRACKER NEEDED: Missing person, last seen heading into The Breaks. WARNING: Do NOT take the \'easy route\' through Bone Hollow.', weight: 2 },
          { desc: 'WORK FOR REVENANTS: The Stacks offers premium rates for non-invasive study. Ask for Lev. Also: If you\'ve heard the radio signal, meet at the north campfire at dusk. Come alone. — unsigned', weight: 1, cycleGate: 2 },
        ],
      },
      {
        keywords: ['bench', 'wooden', 'pew'],
        description:
          'The bench is a church pew. Someone carried it from a chapel and didn\'t sand off the hymnal rack. People sit and read the board and rest their hands where prayer books used to go.',
      },
      {
        keywords: ['echo', 'hollow', 'why', 'allowed', 'arbiter', 'safe'],
        description:
          'Patch asked the arbiters to leave it alone. Says the patterns matter. The board manager doesn\'t like it — he\'s said so, loudly, to anyone who\'ll listen. But Patch\'s word carries weight here, and the arbiters enforce Patch\'s word. So Echo stays. The no-combat zone holds. The Hollow crouches and traces its letters and nobody touches it.',
      },
      // --- [RIDER A] Echo examination extras ---
      {
        keywords: ['figure', 'echo', 'person', 'crouching', 'shadow'],
        description: 'The eyes track you. There\'s something behind them — not intelligence exactly, but recognition. Like a dream trying to remember the dreamer. The mouth moves occasionally, shaping sounds that don\'t quite become words. You get the sense that whatever is looking at you from behind those eyes is very tired, and has been trying to say something for a very long time.',
      },
      {
        keywords: ['scratches', 'patterns', 'writing', 'letters', 'fingers', 'wall', 'concrete'],
        description: 'The marks on the wall are deliberate. Not random. There\'s a pattern — E-C-H... The letters trail off into trembling lines, then start again. E-C-H-O. Over and over. Someone is trying to remember their name. The concrete is scored deep enough that this has been happening for months. Maybe years.',
        questFlagOnSuccess: { flag: 'echo_encountered', value: true },
      },
      {
        keywords: ['military', 'signals', 'training', 'hands', 'movement'],
        description: 'The finger movements aren\'t just letters. There\'s a rhythm — a cadence you\'ve seen before in military field signals. Tap-pause-tap-tap. Whoever this was, they were trained. The signal repeats: ALL CLEAR. ALL CLEAR. ALL CLEAR. Endlessly. As if the last order they received is the only one they can still follow.',
        skillCheck: { skill: 'lore', dc: 8, successAppend: 'The signal pattern matches MERIDIAN security protocols — you\'ve seen the same cadence on documents in the Stacks. Echo was military. Echo was MERIDIAN.' },
        questFlagOnSuccess: { flag: 'echo_meridian_connection', value: true },
      },
      // --- [/RIDER A] ---
    ],
    npcSpawns: [
      {
        npcId: 'board_manager',
        spawnChance: 0.65,
        activityPool: [
          { desc: 'An older man with a clipboard manages the board, pulling down expired postings and pinning new ones with bureaucratic precision.', weight: 3 },
          { desc: 'The board manager is arguing with someone about posting placement. \'Urgent goes center. Non-urgent on the sides. I\'ve explained this.\'', weight: 2 },
        ],
        questGiver: ['quest_caravan_guard', 'quest_clearing_job', 'quest_missing_person'],
      },
      // --- [RIDER A: remnant-story-0329] Echo — Named Hollow NPC ---
      {
        npcId: 'echo_hollow',
        spawnChance: 0.30,
        activityPool: [
          { desc: 'A figure crouches at the far end of the fence, partially hidden by the shadow of the overhang. The fingers move against the concrete — slow, deliberate, repeating. Not random. Not quite language. The space between the two.', weight: 3 },
          { desc: 'Something sits in the dark beneath the job board. It doesn\'t move when you look at it. Then the head turns — slowly, tracking you with the attention of something that remembers what attention was for.', weight: 2, timeRestrict: ['night', 'dusk'] },
          { desc: 'In the early light, the figure near the fence is almost human. Almost. The posture is wrong — knees at an angle that suggests the joints have been reset by something other than medicine. The fingers haven\'t stopped.', weight: 2, timeRestrict: ['dawn'] },
        ],
        dispositionRoll: { neutral: 0.7, wary: 0.3 },
        narrativeNotes: 'Echo — the emotional linchpin of the game. A Hollow who retains fragments of identity. Sets echo_encountered on examination. Connects to MERIDIAN holding cells later.',
      },
      // --- [/RIDER A] ---
    ],
    itemSpawns: [],
  },

  // ─── CR-09: The Campground ────────────────────────────────────────────────
  {
    id: 'cr_09_campground',
    name: 'Crossroads — The Campground',
    zone: 'crossroads',
    act: 1,
    difficulty: 1,
    visited: false,
    flags: { safeRest: true, campfireAllowed: true },
    personalLossEchoes: {
      promise: 'The firelight catches a face across the camp and for a half-second you see someone you made a promise to. Then they turn and they are nobody you know.',
      community: 'People sitting around a fire, sharing food, telling stories. You had this once. The shape of it is so familiar it makes your chest tight.',
      child: 'A woman teaching a teenager to clean a rifle by the south fire ring. The patience in her hands. You remember teaching someone small how to do something difficult, and the memory arrives without warning and stays longer than you want it to.',
      partner: 'Three crosses stand beyond the gap in the tire wall. No names. You wonder if there is a cross like this somewhere with their name on it, or no cross at all, which is worse.',
    },
    description:
      'West of the market, a flat clearing of packed red earth serves as camp for travelers who can\'t afford indoor stays or don\'t trust walls. Fire rings made from stacked sandstone dot the ground in clusters — most cold, a few still smoldering, one putting out a thin column of juniper smoke that smells like the old world\'s idea of a candle. Bedrolls and lean-tos scatter without pattern, personal kingdoms of three square feet defended by proximity and custom. To the south, the long-timers have set up more permanent shelters — scavenged plywood walls, layered tarp roofs, the architecture of people who stopped pretending they were leaving. The view west is open desert and sky, the mesa line going purple in the distance, and above it the kind of sunset that makes you understand why people painted cave walls.',
    descriptionNight:
      'Three fires burn in the campground. Around the largest, a group shares a bottle and stories in low voices. Around the second, a solitary figure sharpens a blade. The third fire is untended but recent — whoever lit it is nearby, in the dark, watching. In the south camp, the long-timers sleep light behind plywood walls. A dog barks once and is hushed.',
    descriptionDawn:
      'The campground at dawn is cold embers and slow risers. Gray ash in the fire rings. A man sits cross-legged by the nearest one, blowing on a coal, coaxing it back. His breath makes small clouds in the cold air. The packed earth is dark with overnight dew. In the south camp, someone coughs behind plywood walls. A tarp flap opens. A face checks the sky, checks the ground, retreats.',
    descriptionDusk:
      'Dusk brings the campground alive. Fires are lit in quick succession — three, five, seven points of orange across the packed earth. People circle in from the market, from the trails, from wherever the day took them. Bedrolls are claimed. Lean-tos are checked. A woman in the south camp whistles two notes and a teenager jogs back from the market with an armload of firewood. The desert sky goes copper and lavender and the fires answer it with their own color.',
    shortDescription:
      'West of the market, a flat clearing serves as camp for travelers who can\'t afford indoor stays.',
    exits: {
      east: 'cr_05_market_north',
      north: 'cr_10_overlook',
      west: 'cr_11_old_gas_station',
      south: 'br_01_canyon_mouth',
    },
    richExits: {
      south: {
        destination: 'br_01_canyon_mouth',
        descriptionVerbose: 'A gap in the tire wall — the Back Door. Highway 550 south drops into canyon country. Three unmarked crosses stand in the hardpan outside.',
        skillGate: { skill: 'survival', dc: 5, failMessage: 'The canyon country to the south isn\'t for beginners.' },
      },
    },
    items: [],
    enemies: [],
    npcs: [],
    extras: [
      {
        keywords: ['fire', 'fires', 'campfire', 'stones'],
        description:
          'The fire rings are communal. First come, first served. Fuel is juniper wood, two Pennies an armload from a kid who gathers it.',
      },
      {
        keywords: ['desert', 'west', 'sky', 'view'],
        description:
          'The sky to the west is enormous — mountain silhouettes against sunset, or star-field against black. The Milky Way is so vivid it looks painted. Beautiful. Also a reminder that there\'s nothing between here and the horizon but dust and things that want to eat you.',
      },
      {
        keywords: ['lean-tos', 'shelters', 'plywood', 'south camp', 'long-timers'],
        description:
          'Semi-permanent structures built by people who\'ve stopped pretending they\'re leaving soon. One has a door. Another has a window cut into the plywood, covered with plastic sheeting. A woman is teaching a teenager to clean a rifle. Two old men play a card game with a deck held together by tape. It\'s almost a neighborhood.',
      },
      {
        keywords: ['crosses', 'graves', 'back door', 'gap'],
        description:
          'Three crosses, rough-cut juniper, driven into the baked earth outside the gap in the wall. No names. No dates. Somebody knows who\'s buried here. Nobody talks about it.',
      },
    ],
    npcSpawns: [
      {
        npcId: 'campfire_storyteller',
        spawnChance: 0.45,
        activityPool: [
          { desc: 'An older Drifter with a voice like gravel is telling a story about a Hollow herd he outran last winter. His audience is rapt.', weight: 3 },
          { desc: 'A woman with Salter tattoos sits by the fire alone, drinking from a flask. She doesn\'t look like she wants company.', weight: 2 },
          { desc: 'Three travelers huddle around the fire, voices low. "...heard the broadcast again last night. Clearer this time. Like whoever\'s sending it knows we\'re close." One of them looks north toward the market. "Sparks says she needs a signal booster to triangulate. Says she\'s close to finding the source."', weight: 3 },
        ],
        dialogueTree: 'drifters_storyteller_tree',
      },
      {
        npcId: 'mysterious_stranger_sanguine',
        spawnChance: 0.25,
        activityPool: [
          { desc: 'A figure in a hooded coat sits outside the firelight, face in shadow. They haven\'t moved in the time you\'ve been watching. But they are awake.', weight: 1 },
        ],
        dialogueTree: 'cr_stranger_sanguine_hint',
        narrativeNotes: 'First optional Sanguine encounter. Lucid Sanguine passing through. Doesn\'t reveal nature unless Perception 14+ or direct question.',
      },
      {
        npcId: 'camp_elder_rosa',
        spawnChance: 0.50,
        activityPool: [
          { desc: 'An older woman named Rosa sits mending a jacket by a low fire in the south camp, humming something that might have been a pop song in another life.', weight: 3 },
          { desc: 'Rosa is arguing with a younger man about water rationing near the long-timer lean-tos. She\'s winning.', weight: 2 },
        ],
        dialogueTree: 'cr_rosa_camp_lore',
      },
    ],
    itemSpawns: [
      {
        entityId: 'juniper_firewood',
        spawnChance: 0.50,
        quantity: { min: 1, max: 3, distribution: 'weighted_low' },
        conditionRoll: { min: 0.5, max: 1.0 },
        groundDescription: 'A few sticks of juniper firewood are stacked near an unoccupied fire ring.',
      },
      {
        entityId: 'textiles',
        spawnChance: 0.35,
        quantity: { min: 1, max: 2, distribution: 'weighted_low' },
        conditionRoll: { min: 0.3, max: 0.7 },
        groundDescription: 'A scrap of durable fabric, neatly folded, sits on a rock near the south camp as if someone set it down and forgot it.',
      },
    ],
  },

  // ─── CR-10: The Overlook ──────────────────────────────────────────────────
  {
    id: 'cr_10_overlook',
    name: 'The Overlook',
    zone: 'crossroads',
    act: 1,
    difficulty: 1,
    visited: false,
    flags: { safeRest: true, campfireAllowed: true },
    personalLossEchoes: {
      child: 'The view is the kind of thing you would have pointed out to them. Look how far you can see. They would have loved this. You stand here alone with that thought and let it pass.',
      partner: 'You reach for a hand that isn\'t there. The gesture is automatic — you always reached for them at high places. The wind fills the space where they would have been standing.',
    },
    description:
      'A rocky rise twenty feet above the campground, flat on top, with a view that justifies the climb. From here you can see the full layout of Crossroads — the tire wall, the market canopy, the campfire dots — and beyond it, the skeleton of the old world stretching in every direction. To the north, the blue-gray wall of the San Juan Mountains where Covenant and harder places wait. The wind is stronger up here. It smells like sage and distance.',
    descriptionNight:
      'The overlook at night is a planetarium. The Milky Way arcs overhead in cold light. Below, the campfires are orange dots. In the distance, a faint glow on the northern horizon — Covenant, probably. And further, darker, the mountains. Somewhere up there is the Scar.',
    descriptionDawn:
      'Dawn from the Overlook comes from the east in a long, slow pour. The San Juans catch it first — the snow on the highest peaks turning pink, then gold, then white. The light moves down the slopes and across the valley floor like water filling a basin. Crossroads is still in shadow below you, the campfires cold, the market canopy a dark shape. The sage smells stronger in the cold morning air. You can see for fifty miles and all of it is waking up.',
    descriptionDusk:
      'Dusk from the Overlook is the Scar\'s hour. The sun drops behind the western mesas and the mountains go to silhouette, and in the gap between the peaks — there. A faint glow that isn\'t sunset. A light that persists after the sky has gone from orange to violet to dark blue. The Scar. You can see it from here, or see its reflection, or see the idea of it. The campfires below begin to flicker on, small and orange and human, and the glow on the mountains is none of those things.',
    shortDescription:
      'A rocky rise twenty feet above the campground, flat on top, with a view that justifies the climb.',
    exits: {
      south: 'cr_09_campground',
      north: 'st_01_approach',
    },
    richExits: {
      north: {
        destination: 'st_01_approach',
        descriptionVerbose: 'a rocky trail descends the rise and continues north toward the ruined building complex known as The Stacks — harder country',
        cycleGate: 2,
        reputationGate: { faction: 'reclaimers', minLevel: 1 },
      },
    },
    items: [],
    enemies: [],
    npcs: [],
    extras: [
      {
        keywords: ['mountains', 'san juan', 'north'],
        description:
          'The San Juan range rises like a wall of teeth. Snow on the peaks year-round. Covenant sits in the foothills. The Scar is higher, deeper, further. People point and say \'up there\' and what they mean is: where the answers are, and also the things that will kill you.',
      },
      {
        keywords: ['crossroads', 'below', 'layout'],
        description:
          'From up here, Crossroads looks fragile. A few tarps, a tire wall, a handful of fires. This is what passes for civilization now.',
      },
      {
        keywords: ['scar', 'glow', 'light'],
        description:
          'You can\'t see the Scar from here. But sometimes, on clear nights, people swear they see a faint light on the mountains that isn\'t a star and isn\'t a fire.',
        skillCheck: { skill: 'perception', dc: 14, successAppend: 'There. For just a second, on the dark slope of the highest visible peak — a light. Steady, not flickering. Not a fire. Something powered. Then gone.' },
      },
      {
        keywords: ['signal', 'radio', 'broadcast', 'listen'],
        description:
          'Up here, away from the market noise, you can almost feel it — the faint electromagnetic itch at the edge of hearing. The shortwave signal that Sparks has been tracking. From this height, on a clear night, with the right equipment, the broadcast would be louder. Closer. Someone underground in those mountains, sending twelve words into the dark. Waiting.',
      },
    ],
    itemSpawns: [
      {
        entityId: 'old_binoculars',
        spawnChance: 0.05,
        quantity: { min: 1, max: 1, distribution: 'single' },
        conditionRoll: { min: 0.3, max: 0.7 },
        groundDescription: 'A pair of binoculars with a cracked left lens sits on the rock.',
      },
    ],
  },

  // ─── CR-11: Old Gas Station ───────────────────────────────────────────────
  {
    id: 'cr_11_old_gas_station',
    name: 'Ruins — Old Gas Station',
    zone: 'crossroads',
    act: 1,
    difficulty: 1,
    visited: false,
    flags: { safeRest: false, scavengingZone: true },
    description:
      'The gas station is a husk. Roof half-collapsed, pumps rusted to abstract sculpture, the convenience store windows shattered and dark. Weeds have colonized the concrete pad. A faded sign that once advertised unleaded at $4.89 a gallon now advertises nothing to no one. But the building isn\'t empty — things keep turning up in the rubble. The old world hid things in layers.',
    descriptionNight:
      'The gas station is a dark shape against the stars. The collapsed roof creates shadows that move wrong. The concrete pad is pale enough to see by moonlight. The building interior is not.',
    shortDescription:
      'The gas station is a husk.',
    exits: {
      east: 'cr_09_campground',
      down: 'cr_12_gas_station_basement',
    },
    richExits: {
      down: {
        destination: 'cr_12_gas_station_basement',
        descriptionVerbose: 'a pried-up floor panel drops into a concrete utility space below, cool and dark',
        hidden: true,
        discoverSkill: 'scavenging',
        discoverDc: 10,
        discoverMessage: 'You find a way down beneath the floor tiles.',
      },
    },
    items: [],
    enemies: [],
    npcs: [],
    extras: [
      {
        keywords: ['pumps', 'gas', 'fuel'],
        description:
          'The pumps are empty and have been since week two. Someone tried to siphon the underground tanks years ago and found them dry. The pump handles are still attached. Occasionally a traveler grips one and squeezes, out of habit or hope.',
      },
      {
        keywords: ['sign', 'price'],
        description:
          '$4.89. People complained about that. They wrote angry letters about gas prices. The absurdity of it hits you suddenly, from a direction you weren\'t expecting.',
      },
      {
        keywords: ['floor', 'tiles', 'hatch'],
        description:
          'The tiles near the back wall are loose. Beneath them, a plywood panel. Beneath that — darkness and the smell of stale air.',
        skillCheck: { skill: 'scavenging', dc: 10, successAppend: 'You pry the panel aside. Below is a concrete utility space, maybe six feet deep. A metal shelving unit is bolted to the wall. You can see shapes on the shelves — cans, maybe.' },
      },
    ],
    npcSpawns: [
      {
        npcId: 'scavenger_rival',
        spawnChance: 0.25,
        activityPool: [
          { desc: 'Another scavenger is here, prying at the shelving with a crowbar. They freeze when they see you.', weight: 3 },
          { desc: 'A teenager in oversized clothes is stuffing something into a pack near the back wall. They see you and bolt.', weight: 2 },
        ],
        dispositionRoll: { neutral: 0.4, wary: 0.4, hostile: 0.2 },
      },
    ],
    itemSpawns: [
      {
        entityId: 'canned_food_random',
        spawnChance: 0.30,
        quantity: { min: 1, max: 2, distribution: 'weighted_low' },
        conditionRoll: { min: 0.5, max: 0.9 },
        groundDescription: 'A dented can with no label sits behind a fallen shelf bracket.',
      },
      {
        entityId: 'rebar_club',
        spawnChance: 0.20,
        quantity: { min: 1, max: 1, distribution: 'single' },
        conditionRoll: { min: 0.4, max: 0.8 },
        groundDescription: 'A length of rebar, one end wrapped in duct tape for a grip, leans against the counter.',
      },
      {
        entityId: 'lighter_disposable',
        spawnChance: 0.35,
        quantity: { min: 1, max: 1, distribution: 'single' },
        conditionRoll: { min: 0.2, max: 0.9 },
        groundDescription: 'A disposable lighter is wedged in a crack between the counter and the wall.',
      },
    ],
    hollowEncounter: {
      baseChance: 0.15,
      timeModifier: { day: 0.5, night: 2.0, dawn: 0.8, dusk: 1.3 },
      threatPool: [
        { type: 'shuffler', weight: 95, quantity: { min: 1, max: 2, distribution: 'weighted_low' } },
        { type: 'remnant', weight: 5, quantity: { min: 1, max: 1, distribution: 'single' } },
      ],
      activityPool: {
        shuffler: [
          { desc: 'stands behind the counter, hands flat on the surface, as if waiting to ring up a customer who will never come', weight: 3 },
        ],
        remnant: [
          { desc: 'turns a pump handle with slow, deliberate pressure. Squeeze. Release. Squeeze. Release. The pump is dry. It doesn\'t know that.', weight: 2 },
        ],
      },
    },
  },

  // ─── CR-12: Gas Station Basement ──────────────────────────────────────────
  {
    id: 'cr_12_gas_station_basement',
    name: 'Beneath the Gas Station',
    zone: 'crossroads',
    act: 1,
    difficulty: 1,
    visited: false,
    flags: { safeRest: true, hiddenRoom: true, dark: true },
    description:
      'A concrete box six feet deep, eight feet square. The air is stale and cool. A metal shelf is bolted to the north wall — whatever was stored here was stored with purpose. The ceiling is the underside of the gas station floor, with a square of daylight where you climbed down. Cobwebs. The smell of old rust and dust. This was someone\'s emergency stash. They never came back for it.',
    descriptionNight:
      'Darkness. Total, subterranean darkness. Without a light source, you can feel the shelf, the walls, the floor — but see nothing.',
    shortDescription:
      'A concrete box six feet deep, eight feet square.',
    exits: {
      up: 'cr_11_old_gas_station',
    },
    richExits: {
      up: {
        destination: 'cr_11_old_gas_station',
        descriptionVerbose: 'the open floor panel leads back up into the ruined gas station above',
      },
    },
    items: [],
    enemies: [],
    npcs: [],
    extras: [
      {
        keywords: ['shelf', 'shelves'],
        description:
          'Bolted with concrete anchors. Three shelves, heavy-gauge steel. Most of what was here is gone, but the outline of absent objects is visible in the dust: cans, boxes, the rectangular footprint of an ammo can.',
      },
      {
        keywords: ['walls', 'concrete'],
        description:
          'Poured concrete, smooth. Purpose-built. A prepper\'s stash. They were right about everything and it didn\'t save them.',
      },
    ],
    itemSpawns: [
      {
        entityId: 'ammo_9mm',
        spawnChance: 0.40,
        quantity: { min: 3, max: 8, distribution: 'bell' },
        conditionRoll: { min: 0.8, max: 1.0 },
        groundDescription: 'A dented ammo can sits on the bottom shelf. Inside, loose 9mm rounds.',
      },
      {
        entityId: 'first_aid_kit_basic',
        spawnChance: 0.30,
        quantity: { min: 1, max: 1, distribution: 'single' },
        conditionRoll: { min: 0.5, max: 0.9 },
        groundDescription: 'A red plastic first aid kit is pushed to the back of the middle shelf, dusty but sealed.',
      },
      {
        entityId: 'canned_food_premium',
        spawnChance: 0.45,
        quantity: { min: 1, max: 3, distribution: 'weighted_low' },
        conditionRoll: { min: 0.7, max: 1.0 },
        groundDescription: 'Cans of food — real food, labeled. Chili. Peaches. Condensed soup.',
      },
      {
        entityId: 'torn_note_fragment',
        spawnChance: 0.60,
        quantity: { min: 1, max: 1, distribution: 'single' },
        conditionRoll: { min: 1.0, max: 1.0 },
        groundDescription: 'A sealed envelope is taped to the underside of the top shelf. Handwritten: FOR WHOEVER FINDS THIS.',
      },
    ],
    narrativeNotes:
      'Tutorial hidden reward room. Teaches: scavenging unlocks hidden areas, hidden areas have better loot, Letters Home collectible exists. The prepper\'s letter is Letter #1.',
  },

  // ─── CR-13: Water Station ─────────────────────────────────────────────────
  {
    id: 'cr_13_water_station',
    name: 'The Water Station',
    zone: 'crossroads',
    act: 1,
    difficulty: 1,
    visited: false,
    flags: { safeRest: false, noCombat: true, waterSource: true },
    description:
      'A hand-pump well sunk into the hardpan, the cast iron handle worn to a dull shine by ten thousand hands. Flat sandstones ring the pump in a rough circle, smoothed by the feet of people who wait here with jugs and bottles and repurposed bleach containers. The water comes up cold and clear and tastes like iron and limestone — the taste of the aquifer a hundred feet below, where the Collapse never reached. A Drifter attendant manages the line and collects the fee: one Penny per liter. No exceptions, no credit, no argument. A wooden sign reads: CLEAN WATER IS LIFE. THEFT IS DEATH. The tally marks beneath it are not reassuring.',
    descriptionNight:
      'The pump stands silent. No one draws water at night. The attendant\'s stool is empty. The sign is a pale rectangle in the dark.',
    shortDescription:
      'A hand-pump well sunk into the hardpan, surrounded by a ring of flat stones where people queue with containers.',
    exits: {
      east: 'cr_03_market_south',
    },
    items: [],
    enemies: [],
    npcs: [],
    extras: [
      {
        keywords: ['pump', 'well', 'water'],
        description:
          'A deep-well hand pump, cast iron, pre-Collapse. The handle is worn smooth by thousands of hands. Each pump delivers about a pint. Fill a liter bottle, that\'s seven pumps. The rhythm becomes meditative if you let it.',
      },
      {
        keywords: ['sign', 'wooden'],
        description:
          'CLEAN WATER IS LIFE. THEFT IS DEATH. Below it, a tally of hash marks. Thirty-seven. You hope that\'s days since the last incident and not something else.',
      },
    ],
    npcSpawns: [
      {
        npcId: 'water_attendant',
        spawnChance: 0.80,
        activityPool: [
          { desc: 'The water attendant sits on a stool by the pump, counting Pennies into a leather pouch with the methodical focus of someone who takes their job very seriously.', weight: 3 },
          { desc: 'The attendant is filling a large container for a woman with two children. He\'s not charging her. He sees you notice and says nothing.', weight: 1 },
        ],
        tradeInventory: ['clean_water_1L', 'purification_tabs'],
      },
    ],
    itemSpawns: [],
  },

  // ─── CR-14: The Leatherworks ──────────────────────────────────────────────
  {
    id: 'cr_14_leather_shop',
    name: 'The Leatherworks',
    zone: 'crossroads',
    act: 1,
    difficulty: 1,
    visited: false,
    flags: { safeRest: false, noCombat: true },
    description:
      'A stall that\'s grown into a workshop — three walls of salvaged wood with a tarp roof, the fourth side open to the market. The smell of tanning solution and worked leather is overwhelming. Hides hang from a rack. Finished goods — belts, holsters, sheaths, a few vests — line a shelf. The leatherworker is a large man with scarred hands who moves the awl with surprising delicacy.',
    descriptionNight:
      'The workshop is closed and shuttered. A padlock the size of your fist secures the front.',
    shortDescription:
      'A stall that\'s grown into a workshop.',
    exits: {
      west: 'cr_05_market_north',
    },
    items: [],
    enemies: [],
    npcs: [],
    extras: [
      {
        keywords: ['hides', 'leather', 'rack'],
        description:
          'Elk, deer, and something larger — maybe cow, maybe horse. The tanning process takes weeks. The leatherworker does everything by hand, the old way. He learned from YouTube videos before the internet died, he says. The irony is not lost on him.',
      },
      {
        keywords: ['goods', 'holsters', 'belts', 'vests'],
        description:
          'Quality work. The stitching is tight and even. The holsters are sized for specific weapons — he\'ll custom-fit if you bring your gun. The vests have steel plates sewn between leather layers. Not fashionable. Functional.',
      },
    ],
    npcSpawns: [
      {
        npcId: 'leatherworker_vin',
        spawnChance: 0.70,
        activityPool: [
          { desc: 'Vin drives an awl through a belt blank, his massive hands steady as a surgeon\'s. He doesn\'t look up.', weight: 3 },
          { desc: 'Vin is fitting a holster to a customer\'s hip, adjusting the angle, testing the draw. \'Pull. Again. Faster. Good.\'', weight: 2 },
        ],
        tradeInventory: ['leather_belt', 'knife_sheath', 'pistol_holster', 'scrap_vest', 'runners_kit'],
        dialogueTree: 'cr_vin_intro',
      },
    ],
    itemSpawns: [],
  },

  // CR-15 (South Camp) merged into CR-09 (Campground)
  // CR-16 (South Perimeter) removed — exits consolidated into CR-09
  // CR-17 (Storage Shed) removed — no external references

  // ─── CR-18: The Pit ───────────────────────────────────────────────────────
  {
    id: 'cr_18_the_pit',
    name: 'The Pit',
    zone: 'crossroads',
    act: 1,
    difficulty: 1,
    visited: false,
    flags: { safeRest: false },
    description:
      'Behind the north market, a natural depression in the ground has been repurposed as a sparring ring. The walls are packed earth, the floor is sand, and the spectator seating is whatever you\'re standing on. Crossroads doesn\'t officially sanction fighting, but The Pit exists in the gray area between entertainment and training. No weapons. No killing. Everything else is negotiable. The sand is stained darker in patches.',
    descriptionNight:
      'The Pit is empty and dark. But the sand holds the memory of the day\'s fights — bootprints, drag marks, the occasional bloodstain.',
    shortDescription:
      'Behind the north market, a natural depression in the ground has been repurposed as a sparring ring.',
    exits: {
      south: 'cr_05_market_north',
    },
    items: [],
    enemies: [],
    npcs: [],
    extras: [
      {
        keywords: ['pit', 'ring', 'sand', 'fighting'],
        description:
          'The rules are simple: both fighters agree to enter. No weapons. No biting. Fight until one person yields or can\'t stand. Side bets are handled by a Drifter bookie who takes a 10% cut. The Salters love it. The Accord pretends it doesn\'t exist. The Kindling think it\'s a waste of energy that could be directed at the Lord\'s work.',
      },
      {
        keywords: ['stains', 'blood', 'dark'],
        description:
          'The sand absorbs most of it. What it doesn\'t absorb, it covers. Nobody talks about the fight three weeks ago where a Salter recruit hit a Drifter wrong and the Drifter didn\'t get up for a long time.',
      },
    ],
    npcSpawns: [
      {
        npcId: 'pit_bookie',
        spawnChance: 0.55,
        activityPool: [
          { desc: 'A wiry Drifter with quick eyes and a leather satchel of Pennies leans against the pit wall, watching for customers.', weight: 3 },
          { desc: 'The bookie is taking bets on two fighters circling each other in the pit. Money changes hands fast.', weight: 2, timeRestrict: ['day', 'dusk'] },
        ],
        dialogueTree: 'cr_pit_bookie',
      },
      {
        npcId: 'pit_fighter',
        spawnChance: 0.40,
        activityPool: [
          { desc: 'A heavyset man wraps his knuckles with strips of cloth, slow and methodical, staring into the pit with the calm focus of someone preparing for violence.', weight: 3 },
        ],
      },
    ],
    itemSpawns: [],
    hollowEncounter: {
      baseChance: 0.06,
      timeModifier: { day: 0.5, dawn: 1.0, dusk: 1.0, night: 1.5 },
      threatPool: [
        { type: 'shuffler', weight: 3, quantity: { min: 1, max: 1, distribution: 'single' } },
        { type: 'remnant', weight: 1, quantity: { min: 1, max: 1, distribution: 'single' } },
      ],
      awarenessRoll: { unaware: 0.5, awarePassive: 0.3, awareAggressive: 0.2 },
      activityPool: {
        shuffler: [
          { desc: 'stands at the edge of the pit, swaying slightly, as if it wants to climb down into the sand but can\'t remember why', weight: 3 },
        ],
        remnant: [
          { desc: 'circles the pit rim with slow mechanical steps, head tilted, as if watching a fight that ended years ago', weight: 2 },
        ],
      },
    },
    narrativeNotes:
      'The Pit is an optional combat training area. Players can spar here for XP and reputation. Winning fights raises Salter reputation slightly. The bookie offers side quests — rigged fights, debts to collect.',
  },
]
