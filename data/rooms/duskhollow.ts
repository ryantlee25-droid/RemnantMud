import type { Room } from '@/types/game'

export const DUSKHOLLOW_ROOMS: Room[] = [
  {
    id: 'dh_01_long_drive',
    name: 'Duskhollow — The Long Drive',
    zone: 'duskhollow',
    act: 2,
    difficulty: 2,
    visited: false,
    flags: { fastTravelWaypoint: true },
    description: 'An avenue of old-growth oaks lines the gravel drive, branches meeting overhead in a cathedral vault. The trees are healthy — someone tends them, or something about this land keeps them alive while everything else dries. Candlelight shows in the manor windows half a mile ahead. The drive is clean of debris, the gravel raked, the verge trimmed. The Covenant of Dusk maintains this approach the way a dignified person maintains their appearance: because presentation is the first argument.',
    descriptionNight: 'At night the drive is a tunnel of darkness between oak walls, with the manor candlelight as the only forward reference. The leaves barely move. Somewhere in the trees, something watches your approach with patience that exceeds any human calibration of waiting. You are expected. This is not the same as being welcome.',
    shortDescription: 'Tree-lined drive to Duskhollow Manor.',
    exits: { east: 'br_01_canyon_mouth', west: 'dh_02_entrance_hall' },
    richExits: {
      east: {
        destination: 'br_01_canyon_mouth',
        descriptionVerbose: 'east, back toward the Breaks and the wider world',
      },
      west: {
        destination: 'dh_02_entrance_hall',
        descriptionVerbose: 'the manor entrance ahead',
        questGate: 'covenant_of_dusk_invited',
      },
    },
    items: [],
    enemies: [],
    npcs: [],
    extras: [
      {
        keywords: ['trees', 'oak', 'avenue', 'canopy'],
        description: 'These oaks are over a hundred years old. Their roots go deep enough to find water that the surface drought hasn\'t touched. Someone planted them in deliberate rows — an act of landscaping that took generations to pay out. The Covenant has been here long enough to appreciate what they inherited.',
      },
      {
        keywords: ['gravel', 'raked', 'clean', 'drive'],
        description: 'The gravel is raked into a uniform surface with no leaf debris, no branches, no animal tracks. Maintenance for its own sake — the drive serves no functional purpose that would require this level of upkeep. Someone rakes it because it should be raked.',
        skillCheck: { skill: 'tracking', dc: 10, successAppend: 'You find tracks at the drive\'s edge, in the softer soil under the oaks. Small, bare, human. Walking the perimeter at regular intervals, a patrol that makes a point of leaving the drive pristine. Someone walks this approach at night. Regularly.' },
      },
      {
        keywords: ['candles', 'windows', 'light', 'manor'],
        description: 'Candlelight, not electric. The Covenant of Dusk has access to power — you\'ve heard they do — but they prefer candlelight in common areas. Whether it\'s aesthetic preference or statement of identity is a philosophical question the candles don\'t answer.',
      },
    ],
    hollowEncounter: {
      baseChance: 0.03,
      timeModifier: { day: 1.0, night: 0.2, dawn: 0.5, dusk: 0.3 },
      threatPool: [
        { type: 'shuffler', weight: 100, quantity: { min: 1, max: 1, distribution: 'single' } },
      ],
      awarenessRoll: { unaware: 0.5, awarePassive: 0.4, awareAggressive: 0.1 },
    },
    narrativeNotes: 'Faction gate room. Quest required for access. The low Hollow encounter rate reflects Sanguine perimeter control — they keep the drive clean of threats as well as debris.',
  },

  {
    id: 'dh_02_entrance_hall',
    name: 'Duskhollow — Entrance Hall',
    zone: 'duskhollow',
    act: 2,
    difficulty: 2,
    visited: false,
    flags: { noCombat: true, safeRest: false },
    description: 'Grand, faded, and candlelit with intention. The entrance hall is double-height, plaster medallions on the ceiling, parquet floor laid in a herringbone pattern someone\'s been maintaining. The candelabras are old silver, polished. A Sanguine in fitted clothes stands to one side — still in the way still things are still, not the stillness of waiting but the stillness of someone who has had centuries to understand that movement is optional. They smile. Their teeth are normal. That is somehow more unsettling than the alternative.',
    descriptionNight: 'Night in Duskhollow is peak operation. The entrance hall fills with candle warmth and the specific social energy of beings who are most themselves in darkness. More Sanguine present, moving with the fluid confidence of creatures in their element. You are a guest. You are also — let\'s be precise — food, if the social contract holds.',
    shortDescription: 'Grand entrance hall. Candlelight. First Sanguine welcome.',
    exits: { east: 'dh_01_long_drive', west: 'dh_03_great_hall', north: 'dh_04_vespers_study', south: 'dh_06_kitchen' },
    richExits: {
      east: { destination: 'dh_01_long_drive', descriptionVerbose: 'back out the entrance' },
      west: { destination: 'dh_03_great_hall', descriptionVerbose: 'the great hall' },
      north: { destination: 'dh_04_vespers_study', descriptionVerbose: 'upstairs to Vesper\'s study' },
      south: { destination: 'dh_06_kitchen', descriptionVerbose: 'toward the kitchen' },
    },
    items: [],
    enemies: [],
    npcs: ['covenant_greeter'],
    npcSpawns: [
      {
        npcId: 'covenant_greeter',
        spawnChance: 0.90,
        spawnType: 'anchored',
        quantity: { min: 1, max: 2, distribution: 'weighted_low' },
        activityPool: [
          { desc: 'A Sanguine in fitted charcoal clothes stands at the hall\'s center, perfectly still, expression calibrated to welcome. "We expected you," they say. That\'s ambiguous.', weight: 3 },
          { desc: 'A Sanguine polishes the candelabra with methodical care, each pass leaving a streak-free shine that catches every flame. They don\'t look up. "Vesper is expecting you."', weight: 2 },
        ],
        dispositionRoll: { neutral: 0.5, friendly: 0.4, wary: 0.1 },
        dialogueTree: 'covenant_entrance_welcome',
      },
    ],
    extras: [
      {
        keywords: ['candelabra', 'silver', 'candles'],
        description: 'The silver is old enough to have history before this household. The candles are beeswax — real beeswax, the expensive kind that burns clean and slow. Someone maintains hives for this purpose. The Covenant of Dusk measures value differently than the rest of the Four Corners.',
      },
      {
        keywords: ['parquet', 'floor', 'herringbone'],
        description: 'The herringbone floor has been repaired in at least a dozen places — you can see the patches where different wood tones don\'t quite match. But it\'s all been maintained: swept, periodically oiled, the worst seams filled. This floor has been someone\'s responsibility for a long time.',
      },
      {
        keywords: ['plaster', 'ceiling', 'medallion'],
        description: 'The ceiling medallions are botanical — oak leaves and acorns, appropriate given the drive. Pre-Collapse renovation, probably. The plaster is intact except in the northeast corner where a hairline crack runs from medallion to wall. It has been there a while. Someone noted it in pencil on the wall — a measurement mark and a date from three years ago. It hasn\'t changed.',
      },
    ],
    narrativeNotes: 'First impression of the Covenant. The NPC stillness and ambiguous welcome establish the Duskhollow tone: beautiful, precise, and slightly wrong. The "we expected you" is intentionally ambiguous.',
  },

  {
    id: 'dh_03_great_hall',
    name: 'Duskhollow — The Great Hall',
    zone: 'duskhollow',
    act: 2,
    difficulty: 2,
    visited: false,
    flags: { noCombat: true, safeRest: false },
    description: 'The great hall is the Covenant of Dusk\'s argument for itself. Crystal chandeliers catch candlelight and scatter it into a hundred small suns. A long table set for a dinner that hasn\'t started yet, or hasn\'t finished, or both simultaneously. Blood wine in crystal decanters — deep red, faintly luminescent, and you know what it is even before the smell reaches you: iron and something else, something sweeter than it should be. Music plays from somewhere. A string quartet, but you don\'t see musicians. A recording. That\'s also unsettling.',
    descriptionNight: 'The great hall at night is in full operation. The Covenant socializes — they have had centuries to develop the forms of it: conversation, gesture, the specific grammar of people who have indefinite lifespans and must therefore be interesting enough to keep. They are interested in you. That attention is flattering and precise and should not be mistaken for safety.',
    shortDescription: 'The Covenant\'s showcase hall. Crystal, blood wine, beauty.',
    exits: { east: 'dh_02_entrance_hall', west: 'dh_07_wine_cellar', south: 'dh_08_gallery', north: 'dh_09_garden' },
    richExits: {
      east: { destination: 'dh_02_entrance_hall', descriptionVerbose: 'back to the entrance hall' },
      west: { destination: 'dh_07_wine_cellar', descriptionVerbose: 'stairs down to the wine cellar' },
      south: { destination: 'dh_08_gallery', descriptionVerbose: 'the portrait gallery' },
      north: { destination: 'dh_09_garden', descriptionVerbose: 'through the glass doors to the garden' },
    },
    items: [],
    enemies: [],
    npcs: [],
    npcSpawns: [
      {
        npcId: 'covenant_sanguine_socialite',
        spawnChance: 0.80,
        spawnType: 'wanderer',
        quantity: { min: 2, max: 5, distribution: 'bell' },
        activityPool: [
          { desc: 'A Sanguine in Victorian-cut black stands at the table\'s end, holding a crystal glass that contains something that isn\'t wine.', weight: 3 },
          { desc: 'Three Sanguine converse quietly near the fireplace, words too low to hear, eyes tracking you with polite intensity.', weight: 2 },
          { desc: 'A Sanguine is alone at the table\'s far end, reading. Their book is open to a page they\'ve been on for a while. They aren\'t reading it.', weight: 2 },
        ],
        dispositionRoll: { neutral: 0.5, friendly: 0.3, wary: 0.2 },
        dialogueTree: 'covenant_great_hall_social',
      },
    ],
    extras: [
      {
        keywords: ['blood wine', 'wine', 'decanter', 'drink'],
        description: 'You could ask for a glass. They would offer one. The bloodwine is a Covenant specialty — human blood, processed, diluted, blended with other components that soften the edge of what it is. It\'s offered to guests. Some human guests try it. Most don\'t try it twice. A few find it changes them in ways they can\'t fully explain afterward.',
        skillCheck: { skill: 'lore', dc: 11, successAppend: 'The faint fluorescence in the wine — you\'ve seen that before, in the Deep Pool bioluminescent algae. CHARON-7 metabolic byproduct. The Sanguine blood in this wine carries trace amounts of active virus, filtered but not fully eliminated. You\'re not sure if the Covenant knows this, or if they do and it\'s intentional.' },
      },
      {
        keywords: ['crystal', 'chandeliers', 'light'],
        description: 'The chandeliers are pre-Collapse, genuine crystal. The Covenant didn\'t bring them in — this was a wealthy household before. The chandeliers are lit with candles, not electricity. You count: forty-two candles in this room alone, burning continuously. Someone spends a significant portion of their day maintaining nothing but the light in this room.',
      },
      {
        keywords: ['music', 'quartet', 'recording', 'string'],
        description: 'The music comes from a discrete speaker in the corner, running off a tablet. A string quartet recording, classical, high quality. The tablet\'s playlist is curated — someone chose these specific pieces in this specific order. They play on shuffle but always within the curated set. This is someone\'s aesthetic environment, carefully maintained.',
      },
      {
        keywords: ['table', 'dinner', 'setting', 'place'],
        description: 'Fourteen place settings, all complete: crystal, silver cutlery, folded cloth napkins with crisp edges. Seven are set with wine glasses containing bloodwine. Seven are set with water glasses containing water. They know how many human guests they\'re expecting. They count differently than you do.',
      },
    ],
    narrativeNotes: 'Showcase room. The bloodwine lore check connecting to the Deep Pool bioluminescence is a significant cross-zone discovery. The dinner table count (7 and 7) establishes the tithe dynamic without stating it.',
  },

  {
    id: 'dh_04_vespers_study',
    name: 'Duskhollow — Vesper\'s Study',
    zone: 'duskhollow',
    act: 2,
    difficulty: 2,
    visited: false,
    flags: { noCombat: true, questHub: true },
    description: 'Vesper\'s study is a former professor\'s mind made room — Kant and Nietzsche and pre-Collapse bioethics texts shelved by argument rather than author, a writing desk with three active papers simultaneously in progress, a chalkboard that has been written and erased so many times the palimpsest is permanent. Vesper is here, and Vesper is the most dangerous thing in Duskhollow: not because of the teeth, but because of the arguments. A former philosophy professor. Genuinely believes coexistence is possible. Has structured an entire social system around that belief and is watching it either work or fail in real time.',
    descriptionNight: 'Vesper is consistently here at night — awake at night is not a choice for the Sanguine, it\'s the condition. The study is most alive after midnight, the candles burning low, the philosophical conversation having moved past the comfortable middle positions into the uncomfortable conclusions. Vesper asks questions and waits for answers with a patience that has been sharpened over a very long time.',
    shortDescription: 'Vesper\'s study. Quest hub. Philosophy and survival.',
    exits: { south: 'dh_02_entrance_hall', east: 'dh_05_tithe_room', west: 'dh_10_guest_quarters', down: 'dh_11_sub_basement' },
    richExits: {
      south: { destination: 'dh_02_entrance_hall', descriptionVerbose: 'downstairs to the entrance hall' },
      east: { destination: 'dh_05_tithe_room', descriptionVerbose: 'the tithe room' },
      west: { destination: 'dh_10_guest_quarters', descriptionVerbose: 'the guest quarters' },
      down: {
        destination: 'dh_11_sub_basement',
        descriptionVerbose: 'down to the sub-basement',
        hidden: true,
        discoverSkill: 'perception',
        discoverDc: 16,
        discoverMessage: 'You notice a section of the bookshelf that doesn\'t align with the wall behind it.',
        questGate: 'vesper_trust_level_3',
      },
    },
    items: [],
    enemies: [],
    npcs: ['vesper'],
    npcSpawns: [
      {
        npcId: 'vesper',
        spawnChance: 0.80,
        spawnType: 'unique',
        quantity: { min: 1, max: 1, distribution: 'single' },
        activityPool: [
          { desc: 'Vesper stands at the chalkboard, writing something in the lower margin of a notation that covers the board from edge to edge. They turn when you enter. "Sit down. I\'ve been thinking about you."', weight: 3 },
          { desc: 'Vesper reads from a bioethics text with a pencil in hand, the margins being covered in careful commentary. They look up over the book. Something behind their eyes measures the distance.', weight: 2 },
          { desc: 'Vesper is at the window, looking south toward the drive. Not watching anything specific. Thinking. "The blood tithe works," they say, not turning around. "The question I can\'t resolve is whether it should."', weight: 2 },
        ],
        dispositionRoll: { friendly: 0.4, neutral: 0.5, wary: 0.1 },
        dialogueTree: 'vesper_philosophy_main',
        questGiver: ['covenant_blood_tithe_treaty', 'covenant_sanguine_biometrics'],
      },
    ],
    extras: [
      {
        keywords: ['books', 'shelf', 'philosophy', 'kant'],
        description: 'The shelving by argument is genuine — Vesper has organized not by subject but by philosophical position. The cluster on the left is "beings with moral standing"; the cluster on the right is "obligations to the other." The CHARON-7 bioethics section is recent addition, squeezed in at the end of the right cluster, dog-eared pages.',
      },
      {
        keywords: ['chalkboard', 'notation', 'writing'],
        description: 'The chalkboard has been palimpsest for decades. The current surface notation is dense — something about consent, something about survival necessity, something about the difference between coercion and interdependence. The older marks underneath are archaeology: lectures from before the Collapse, still partially legible through the new writing.',
      },
      {
        keywords: ['papers', 'desk', 'writing', 'documents'],
        description: 'The three active papers on the desk: one titled "On the Moral Standing of Symbiotic Arrangements." One untitled, hand-written, with heavy crossings-out. One addressed to someone whose name you can\'t make out, reading like a letter — "...the Accord proposal is worth considering. I am not willing to be the reason it fails..." — then crossed out and started again.',
        questGate: 'vesper_trust_level_2',
      },
    ],
    narrativeNotes: 'Vesper is the most intellectually complex NPC in the game. The blood tithe ethics debate is the heart of the Covenant quest chain. The hidden sub-basement access is either Perception 16 or Vesper\'s trust.',
  },

  {
    id: 'dh_05_tithe_room',
    name: 'Duskhollow — The Tithe Room',
    zone: 'duskhollow',
    act: 2,
    difficulty: 2,
    visited: false,
    flags: { noCombat: true },
    description: 'Clinical. Precise. Unsettling in exactly the way a medical procedure room is unsettling when the procedure is not medical. Examination chairs — four of them, padded, adjustable — face a long counter of stainless steel equipment. Labels on the storage units: ANTICOAGULANT. COMPRESSION BANDAGING. VOLUME RECORD. The lighting is good — better than the rest of the manor, specifically better for work. The smell is iron and antiseptic. A chart on the wall tracks four human names, their collection schedule, volume, and a health indicator. The indicator for one name is yellow.',
    descriptionNight: 'Night is the active collection period. The tithe room is staffed after dark: a Sanguine collector, precise and professional, and the tithing humans, who arrive on schedule and leave on schedule. The transaction is structured. That structure is doing a lot of work.',
    shortDescription: 'The blood tithe collection room. Medical. Clinical. Unsettling.',
    exits: { west: 'dh_04_vespers_study' },
    richExits: {
      west: { destination: 'dh_04_vespers_study', descriptionVerbose: 'back to Vesper\'s study' },
    },
    items: [],
    enemies: [],
    npcs: [],
    npcSpawns: [
      {
        npcId: 'covenant_collector',
        spawnChance: 0.50,
        spawnType: 'anchored',
        quantity: { min: 1, max: 1, distribution: 'single' },
        activityPool: [
          { desc: 'A Sanguine collector prepares the counter with methodical care — needle, line, collection vessel, volume measure. The preparation is thorough and dispassionate.', weight: 3 },
          { desc: 'A collector enters volume data from the last collection into a ledger. The handwriting is careful. This is someone\'s work record.', weight: 2 },
        ],
        dispositionRoll: { neutral: 0.7, wary: 0.3 },
      },
      {
        npcId: 'tithe_human_resident',
        spawnChance: 0.40,
        spawnType: 'event',
        quantity: { min: 1, max: 2, distribution: 'weighted_low' },
        activityPool: [
          { desc: 'A human resident sits in a collection chair, sleeve rolled, looking at the middle distance with practiced distance. They came voluntarily. That doesn\'t resolve anything.', weight: 3 },
        ],
        dispositionRoll: { neutral: 0.6, wary: 0.4 },
        dialogueTree: 'tithe_human_perspective',
        narrativeNotes: 'Appears during night and dusk hours',
      },
    ],
    extras: [
      {
        keywords: ['chart', 'names', 'schedule', 'record'],
        description: 'The chart tracks four people: MAYA (weekly, 400ml, GREEN). TORRES (biweekly, 350ml, GREEN). CHEN (weekly, 425ml, YELLOW). DALE (triweekly, 300ml, GREEN). The yellow indicator for Chen has a handwritten note: "Recommend reduction to biweekly pending iron recovery." Someone monitors health here. The concern is about supply continuity, but it\'s still concern.',
        skillCheck: { skill: 'field_medicine', dc: 9, successAppend: 'The volumes are clinically safe for regular donation — a trained phlebotomist would recognize the protocols as sound. The schedule is designed around human recovery time, not Sanguine appetite. That\'s either compassion or quality control.' },
      },
      {
        keywords: ['chair', 'equipment', 'needle', 'medical'],
        description: 'The equipment is pre-Collapse medical grade — actual phlebotomy supplies, not improvised. The chairs are recovery chairs from a blood bank. This wasn\'t assembled after the Collapse; the Covenant had these before. Either they anticipated the need or they were doing this before the Collapse too.',
      },
      {
        keywords: ['anticoagulant', 'chemicals', 'supplies', 'storage'],
        description: 'The supplies are well-stocked and organized. A second inventory list is maintained separately: expiration dates, reorder points, current quantities. Someone keeps this room supplied. The supply chain for anticoagulants in a post-Collapse world is not trivial. The Covenant has relationships you don\'t fully see.',
      },
    ],
    narrativeNotes: 'Central to the blood tithe questline. The chart with real names and health monitoring is the room\'s moral fulcrum — consent, care, exploitation, all present simultaneously. The human resident NPC perspective is critical.',
  },

  {
    id: 'dh_06_kitchen',
    name: 'Duskhollow — The Kitchen',
    zone: 'duskhollow',
    act: 2,
    difficulty: 2,
    visited: false,
    flags: { noCombat: true, safeRest: false },
    description: 'The kitchen is the most human room in the manor — functional, warm, smelling of actual food. The human staff of Duskhollow work here: cooks, maintenance, the people whose labor keeps the Covenant\'s domestic machinery running. They are compensated (shelter, food, protection, the bloodwine if they want it) and they are not prisoners. They are also aware, with a clarity you can see in their movements, that the social contract they\'ve signed has specific terms they didn\'t fully read before signing.',
    descriptionNight: 'The kitchen at night is the staff\'s domain — the Sanguine have their preferred rooms and the kitchen isn\'t one. The staff here talk freely in a way they don\'t elsewhere in the manor. The conversations are complicated: practical, political, sometimes frightened, sometimes genuinely content. People contain contradictions.',
    shortDescription: 'The kitchen. Human staff. Their perspective on the arrangement.',
    exits: { north: 'dh_02_entrance_hall' },
    richExits: {
      north: { destination: 'dh_02_entrance_hall', descriptionVerbose: 'back to the entrance hall' },
    },
    items: [],
    enemies: [],
    npcs: [],
    npcSpawns: [
      {
        npcId: 'duskhollow_cook',
        spawnChance: 0.85,
        spawnType: 'anchored',
        quantity: { min: 1, max: 3, distribution: 'bell' },
        activityPool: [
          { desc: 'A cook chops vegetables on a wooden board with the efficient rhythm of someone who does this for many people, every day. They glance at you sideways. "You\'re the one Vesper invited. Sit down. I\'ll find something."', weight: 3 },
          { desc: 'A young kitchen worker washes dishes and doesn\'t look up when you enter. They\'ve learned not to look up quickly at sudden presences.', weight: 2 },
          { desc: 'Two staff eat at the kitchen table, speaking quietly. They don\'t stop when you enter. That\'s trust or exhaustion.', weight: 2 },
        ],
        dispositionRoll: { neutral: 0.5, wary: 0.3, friendly: 0.2 },
        dialogueTree: 'kitchen_staff_perspective',
      },
    ],
    extras: [
      {
        keywords: ['food', 'cooking', 'supplies', 'kitchen'],
        description: 'The kitchen is well-stocked — the Covenant trades and maintains supply chains. Root vegetables, preserved meat, dried goods, some fresh produce from the garden. The human staff eats better here than most people in the Four Corners. That\'s not nothing.',
        skillCheck: { skill: 'field_medicine', dc: 8, successAppend: 'The kitchen worker\'s left arm has the marks of multiple phlebotomy sessions — small round scars, old and new both. They aren\'t on the tithe chart upstairs. The kitchen staff aren\'t on the official tithe schedule. That means informal arrangements. Voluntary, maybe. Maybe.' },
      },
      {
        keywords: ['staff', 'workers', 'people', 'human'],
        description: 'The staff make eye contact but don\'t volunteer information until you ask. When asked directly about their arrangement with the Covenant, the cook considers the question carefully: "Safer here than anywhere else I know. Vesper keeps his word. The ones who want to leave can leave." Then, after a pause: "Nobody\'s left."',
      },
      {
        keywords: ['table', 'kitchen table', 'meals', 'eating'],
        description: 'The kitchen table is where the staff actually live — meals, cards, quiet conversation. Someone has left a book open face-down on it, a thriller from before the Collapse, worn to softness. A child\'s drawing is pinned to the wall above the table. Children live here. That\'s new information.',
      },
    ],
    narrativeNotes: 'The human staff perspective is the moral grounding for the Covenant questline. The informal phlebotomy marks are an unsettling discovery. The children living here deepens the ethical complexity.',
  },

  {
    id: 'dh_07_wine_cellar',
    name: 'Duskhollow — The Wine Cellar',
    zone: 'duskhollow',
    act: 2,
    difficulty: 2,
    visited: false,
    flags: { dark: true, scavengingZone: false },
    description: 'The cellar is stone-walled and cool, the kind of cool that comes from depth and mass rather than any mechanical intervention. Racks of bottles line every wall — actual wine in the near section, and in the back section, labeled differently: smaller bottles, darker glass, stoppered with wax. The bloodwine production process is visible: separation vessels, filtration equipment, blending trays. A handwritten recipe book on the counter, bound in leather, describes the process with the precision of a winemaker who takes the craft seriously regardless of the ingredient.',
    descriptionNight: 'The cellar at night has a staff member working the production stage — slow careful work, no rush. The Covenant doesn\'t rush. They have time.',
    shortDescription: 'The wine cellar. Bloodwine production. Alchemy.',
    exits: { up: 'dh_03_great_hall' },
    richExits: {
      up: { destination: 'dh_03_great_hall', descriptionVerbose: 'stairs up to the great hall' },
    },
    items: [],
    enemies: [],
    npcs: [],
    itemSpawns: [
      { entityId: 'boiled_rations', spawnChance: 0.6, quantity: { min: 1, max: 2, distribution: 'flat' } },
      { entityId: 'water_bottle_sealed', spawnChance: 0.7, quantity: { min: 1, max: 2, distribution: 'flat' } },
      { entityId: 'scrap_metal', spawnChance: 0.5, quantity: { min: 1, max: 2, distribution: 'flat' } },
    ],
    hollowEncounter: {
      baseChance: 0.35,
      timeModifier: { night: 1.5, dawn: 0.8, dusk: 1.2, day: 0.5 },
      threatPool: [
        { type: 'remnant', weight: 2, quantity: { min: 1, max: 1, distribution: 'flat' } },
        { type: 'shuffler', weight: 3, quantity: { min: 1, max: 2, distribution: 'flat' } },
      ],
    },
    extras: [
      {
        keywords: ['recipe', 'book', 'production', 'process'],
        description: 'The recipe book is meticulous — the bloodwine process involves filtration, dilution, blending with actual grape wine, aging in specific vessels. The ratio of blood to wine varies by batch purpose: social batches are heavily diluted, the MERIDIAN SAMPLE batches are not. That last designation catches your eye.',
        skillCheck: { skill: 'lore', dc: 12, successAppend: 'The MERIDIAN SAMPLE batches use blood from specific donors whose genetic markers indicate Revenant status or CHARON-7 atypical response. The recipe notes: "CS-R1 metabolic byproduct highest in these donors. Preserve unfiltered." They\'re extracting something from specific blood. Something connected to the virus.' },
      },
      {
        keywords: ['bottles', 'glass', 'rack', 'storage'],
        description: 'The back section bottles have a faint luminescence — the same blue-green you\'ve seen elsewhere. The bottles in the near section are conventional wine, aging normally. The Covenant serves both. They serve the bloodwine to people who ask for it and the conventional wine to people who don\'t, and they don\'t always ask which you\'d prefer.',
      },
    ],
    narrativeNotes: 'The MERIDIAN SAMPLE batch discovery is a significant lore moment connecting the Covenant to the central mystery. The Revenant blood being special creates player implications.',
  },

  {
    id: 'dh_08_gallery',
    name: 'Duskhollow — The Gallery',
    zone: 'duskhollow',
    act: 2,
    difficulty: 2,
    visited: false,
    flags: {},
    description: 'Portraits in oil, floor to ceiling, covering every wall. The subjects are Sanguine — you can tell from the uncanny quality of stillness the painters captured. Each portrait has a small brass plate with a name and a date range. The date ranges are long. Some start in the 1800s. All are open-ended, the closing date never filled in. The portraits show the same faces across different painted decades — the same bone structure, the same eyes, aging not at all, wearing the fashions of different centuries like costumes. They\'re still here. Some of them are in the great hall right now.',
    descriptionNight: 'By candlelight, the portraits seem to watch more directly. This is a trick of light and your expectations. Probably.',
    shortDescription: 'Portraits of the Sanguine through the centuries. They haven\'t aged.',
    exits: { north: 'dh_03_great_hall' },
    richExits: {
      north: { destination: 'dh_03_great_hall', descriptionVerbose: 'back to the great hall' },
    },
    items: [],
    enemies: [],
    npcs: [],
    itemSpawns: [
      { entityId: 'gallery_portrait_placard', spawnChance: 1.0, quantity: { min: 1, max: 1, distribution: 'flat' } },
      { entityId: 'scrap_metal', spawnChance: 0.3, quantity: { min: 1, max: 1, distribution: 'flat' } },
    ],
    hollowEncounter: {
      baseChance: 0.20,
      timeModifier: { night: 1.6, dawn: 0.7, dusk: 1.3, day: 0.4 },
      threatPool: [
        { type: 'remnant', weight: 1, quantity: { min: 1, max: 1, distribution: 'flat' } },
      ],
    },
    extras: [
      {
        keywords: ['portrait', 'painting', 'faces', 'identity'],
        description: 'You find Vesper in the gallery — four portraits, spanning two hundred years, the same face. In the earliest painting: a suit, 1840s cut. In the latest: the same clothes they wore an hour ago. The name plate on the earliest reads: VESPER CASSEL. The latest reads the same. Between them: no change. Not a single year of visible age.',
      },
      {
        keywords: ['dates', 'plates', 'brass', 'years'],
        description: 'The open-ended date ranges. You stand and count: fourteen subjects portrayed across the gallery\'s walls, and none of the end dates are filled in. They\'re all still alive. They\'ve been here for anywhere from sixty to two hundred years. This was an estate before the Collapse. This was an estate before industrialization.',
        skillCheck: { skill: 'lore', dc: 10, successAppend: 'If CHARON-7 only occurred in 2031, how are some of these portraits dated from the 1800s? The answer is either that the virus existed before MERIDIAN — or that MERIDIAN wasn\'t where it started.' },
      },
    ],
    narrativeNotes: 'The gallery\'s date discrepancy (pre-MERIDIAN portraits) is a significant lore mystery suggesting CHARON-7\'s origins are older than the official narrative. This should create player questions.',
  },

  {
    id: 'dh_09_garden',
    name: 'Duskhollow — The Garden',
    zone: 'duskhollow',
    act: 2,
    difficulty: 2,
    visited: false,
    flags: { noCombat: true, campfireAllowed: false },
    description: 'The night garden is the most beautiful room in the Dust — moonlit roses in midnight colors, a stone path through formal beds that have been tended for generations, a fountain whose pump still works. The Sanguine socialize here: small groups, quiet conversation, the specific intimacy of beings who have had centuries to learn what they actually want to talk about. The air smells of jasmine and night-blooming flowers, and under that, so faint you almost miss it, something metallic and alive.',
    descriptionNight: 'At night the garden is fully inhabited and fully itself. The moonlight through the rose arches makes blue shadows. A Sanguine sits alone on the fountain lip, trailing fingers in the water, watching you with the studied casualness of someone who isn\'t being casual at all.',
    shortDescription: 'Moonlit garden. Sanguine socializing. The most beautiful room.',
    exits: { south: 'dh_03_great_hall', west: 'dh_12_roof_walk' },
    richExits: {
      south: { destination: 'dh_03_great_hall', descriptionVerbose: 'back inside through the glass doors' },
      west: { destination: 'dh_12_roof_walk', descriptionVerbose: 'stairs up to the roof walk' },
    },
    items: [],
    enemies: [],
    npcs: [],
    npcSpawns: [
      {
        npcId: 'covenant_sanguine_socialite',
        spawnChance: 0.85,
        spawnType: 'wanderer',
        quantity: { min: 1, max: 4, distribution: 'bell' },
        activityPool: [
          { desc: 'A Sanguine tends the roses with gardening gloves, cutting spent blooms with precision. They haven\'t needed gloves for anything in a very long time, but old habits have weight.', weight: 3 },
          { desc: 'Two Sanguine converse near the fountain, their words quiet enough that the fountain sound covers them entirely. One laughs — a genuine laugh, unexpected, from a face that usually gives away nothing.', weight: 2 },
        ],
        dispositionRoll: { neutral: 0.5, friendly: 0.4, wary: 0.1 },
        dialogueTree: 'covenant_garden_social',
      },
    ],
    extras: [
      {
        keywords: ['roses', 'flowers', 'garden', 'beds'],
        description: 'The roses are cultivars that haven\'t been commercially available for decades — someone has been maintaining these specific plants, propagating them, keeping the stock alive. The moonlight colors are extraordinary. Whatever the Covenant is, someone here loves roses enough to tend them every day for two centuries.',
      },
      {
        keywords: ['fountain', 'water', 'pump'],
        description: 'The fountain runs on a small electric pump, solar-charged. The sound of moving water in the desert night is almost disorienting — clean and rhythmic and entirely unnecessary, kept running purely because it sounds good. This is the Covenant\'s thesis: that some things are worth maintaining for their own beauty.',
      },
      {
        keywords: ['metallic', 'smell', 'iron', 'blood'],
        description: 'The smell you catch between the jasmine: iron, yes, but also that sweetness — the same note you recognize from the bloodwine, from the collection room. The garden smells faintly of the Covenant\'s fundamental transaction. They\'ve lived with it long enough that it\'s ambient.',
      },
    ],
    narrativeNotes: 'The garden is a beauty moment and a tone-setter. The NPCs socializing naturally humanizes the Sanguine. The ambient blood smell is an unsettling undercurrent.',
  },

  {
    id: 'dh_10_guest_quarters',
    name: 'Duskhollow — Guest Quarters',
    zone: 'duskhollow',
    act: 2,
    difficulty: 2,
    visited: false,
    flags: { safeRest: true, healingBonus: 1.5 },
    description: 'A well-appointed room: bed with actual sheets, a writing desk, a lamp that works. The window looks onto the garden. The door has a lock that works from the inside. You can sleep here, and you will sleep well — the Covenant maintains guest quarters as an argument that coexistence is viable. You are safe here. The healing is real. The lock is real. The fact that the Sanguine outside don\'t need to open your door to watch your sleep is something you don\'t think about until you\'re already thinking about it.',
    descriptionNight: 'The room is quiet and dark except for the garden light through the window. You can hear the fountain. You can hear the Sanguine in the garden, barely. You cannot hear anyone in the hallway. This is a room that is safe in the way that safety is sometimes a social agreement.',
    shortDescription: 'Safe rest. Good bed. But are you really safe?',
    exits: { east: 'dh_04_vespers_study' },
    richExits: {
      east: { destination: 'dh_04_vespers_study', descriptionVerbose: 'back to Vesper\'s study' },
    },
    items: [],
    enemies: [],
    npcs: [],
    itemSpawns: [
      { entityId: 'textiles', spawnChance: 0.6, quantity: { min: 1, max: 2, distribution: 'flat' } },
      { entityId: 'bandages', spawnChance: 0.4, quantity: { min: 1, max: 1, distribution: 'flat' } },
      { entityId: 'torn_note_fragment', spawnChance: 0.5, quantity: { min: 1, max: 1, distribution: 'flat' } },
    ],
    extras: [
      {
        keywords: ['bed', 'sheets', 'sleep', 'rest'],
        description: 'The sheets are clean. The mattress is in reasonable condition. The pillow smells of lavender, which someone put there on purpose. You could sleep here and wake up rested. You probably would. The probability that you sleep unmolested is very high. Almost certainly. The Covenant has every incentive to maintain guest goodwill.',
      },
      {
        keywords: ['lock', 'door', 'lock inside'],
        description: 'The lock works. Turn it and you hear the bolt engage. A solid bolt, well-maintained. You test it. It holds against pressure. You sit with the locked door for a moment and think about what the lock is for. It\'s for your comfort. The door\'s continued existence on its hinges is for the Covenant\'s purposes. These are different things.',
      },
      {
        keywords: ['window', 'garden', 'view'],
        description: 'The window overlooks the garden. You can see the fountain from here, and the roses, and the Sanguine moving between the beds with their unhurried not-quite-human gait. The window latches from inside. The drop to the garden below is fifteen feet. You notice you\'ve noted that.',
      },
    ],
    narrativeNotes: 'Safe rest with healing bonus, but the room\'s writing should constantly remind the player that safe is a social construction. The window drop distance note at the end is important — the player character notices their own survival calculus.',
  },

  {
    id: 'dh_11_sub_basement',
    name: 'Duskhollow — The Sub-Basement',
    zone: 'duskhollow',
    act: 2,
    difficulty: 3,
    visited: false,
    flags: { hiddenRoom: true, dark: true, questHub: true },
    description: 'Below the study, accessed through a bookshelf that swings on a counterweighted hinge, a room that wasn\'t in the original house plans. Stone walls, a single light, and a server rack that shouldn\'t exist — running, blinking, humming with the data of decades. The Covenant of Dusk maintains biometric records here: retinal scans, genetic sequences, physiological data on every Sanguine who has ever passed through Duskhollow. This data is what opens MERIDIAN\'s biometric locks. Vesper knows you\'re looking for it. The question Vesper is asking is: what will you do with it?',
    descriptionNight: 'The sub-basement runs the same at night. The server\'s fans don\'t know what time it is. The data accumulates.',
    shortDescription: 'Hidden sub-basement. Sanguine biometric data. MERIDIAN access.',
    exits: { up: 'dh_04_vespers_study' },
    richExits: {
      up: { destination: 'dh_04_vespers_study', descriptionVerbose: 'back up through the bookshelf passage' },
    },
    items: [],
    enemies: [],
    npcs: [],
    extras: [
      {
        keywords: ['server', 'data', 'biometric', 'records'],
        description: 'The data is organized by date of recording and by individual. The records go back further than MERIDIAN — the Covenant began keeping biometric data before the Collapse. The MERIDIAN-relevant section is flagged: records of the specific genetic sequences that MERIDIAN\'s biometric security was calibrated against. The facility was calibrated to Sanguine genetics on purpose. MERIDIAN anticipated them.',
        skillCheck: { skill: 'electronics', dc: 12, successAppend: 'You pull the specific MERIDIAN biometric key file. It\'s a package: retinal template, genetic sequence hash, secondary authentication handshake. Standard government biometric security architecture, but the expected user type is tagged: SUBJECT TYPE: SANGUINE (R-1 CARRIER). MERIDIAN\'s biometric locks were built for Sanguine entry. Not to keep them out. To let them in.' },
      },
      {
        keywords: ['history', 'records', 'old', 'years'],
        description: 'The oldest records date from the late 1990s. The Covenant of Dusk was here before MERIDIAN. They were watching. Providing samples. One entry from 2025 is a research agreement: MERIDIAN FACILITY — DUSKHOLLOW COVENANT MEMORANDUM OF UNDERSTANDING. The Covenant participated in MERIDIAN\'s development willingly. They were partners.',
        cycleGate: 2,
      },
    ],
    hollowEncounter: {
      baseChance: 0.90,
      timeModifier: { night: 1.5, dawn: 1.0, dusk: 1.2, day: 0.8 },
      threatPool: [
        { type: 'whisperer', weight: 1, quantity: { min: 1, max: 1, distribution: 'flat' } },
        { type: 'remnant', weight: 2, quantity: { min: 1, max: 2, distribution: 'flat' } },
      ],
    },
    narrativeNotes: 'Critical Act III setup room. The discovery that MERIDIAN was built with Sanguine entry in mind — and that the Covenant were willing partners — reshapes the central mystery. The "letting them in, not keeping them out" revelation is the room\'s anchor. Whisperer boss guards the data.',
  },

  {
    id: 'dh_12_roof_walk',
    name: 'Duskhollow — The Roof Walk',
    zone: 'duskhollow',
    act: 2,
    difficulty: 2,
    visited: false,
    flags: { noCombat: true },
    description: 'The manor roof has a railed walk along its ridgeline — a widow\'s walk, originally, in the old architectural tradition. A Sanguine stands here most nights, watching the basin, watching the distance. Not any specific Sanguine — different ones come here, separately, in ones and twos. They all look the same direction: northwest, where the Scar valley shows as a faint heat signature on the horizon. This is where the Covenant comes to think about what they came from and what was done in their name.',
    descriptionNight: 'At night the roof walk is a meditation. The Sanguine here doesn\'t speak immediately. Eventually: "MERIDIAN didn\'t create us. It named us. Everything that happened before — all of that happened in the dark, without a name. At least now there\'s a name." Whether that\'s comfort or grief is for you to determine.',
    shortDescription: 'Roof walk. Night view. A Sanguine who remembers everything.',
    exits: { down: 'dh_09_garden' },
    richExits: {
      down: { destination: 'dh_09_garden', descriptionVerbose: 'down to the garden' },
    },
    items: [],
    enemies: [],
    npcs: [],
    npcSpawns: [
      {
        npcId: 'covenant_elder_unnamed',
        spawnChance: 0.75,
        spawnType: 'anchored',
        quantity: { min: 1, max: 1, distribution: 'single' },
        activityPool: [
          { desc: 'A Sanguine leans on the railing facing northwest, still in the way that\'s different from the stillness of the dead. They know you\'re there.', weight: 3 },
          { desc: 'A Sanguine sits with their back to the railing, looking up. "The stars are different than they were. Not the stars. My ability to pretend they\'re fixed."', weight: 2 },
        ],
        dispositionRoll: { friendly: 0.4, neutral: 0.5, wary: 0.1 },
        dialogueTree: 'covenant_roof_elder_lore',
        narrativeNotes: 'This NPC is a rotating elder — not always the same individual, but always someone with deep memory. The lore dump here should be earned: they talk to those who\'ve demonstrated real engagement with the Covenant.',
      },
    ],
    extras: [
      {
        keywords: ['northwest', 'scar', 'horizon', 'light'],
        description: 'The Scar valley, from here at night: a faint orange warmth on the northwestern horizon, distinguishable from stars by its constancy. The Sanguine beside you watches it with an expression you\'ve learned to read as grief, which on a face that doesn\'t age looks like patience.',
      },
      {
        keywords: ['widow', 'walk', 'railing', 'roof'],
        description: 'Widow\'s walks were built for sailors\' wives to watch the sea for returning ships. The thing being watched from this one never left and never returns. The Scar valley is always there. The Covenant watches it anyway. Some things require a designated watching place.',
      },
    ],
    environmentalRolls: {
      flavorLines: [
        { line: 'The night wind from the northwest carries no scent you can identify. That absence is its own kind of information.', chance: 0.25, time: ['night'] },
        { line: 'The stars above the Scar are the same as the stars everywhere else. That\'s either comforting or meaningless.', chance: 0.20, time: ['night'] },
      ],
    },
    narrativeNotes: 'The roof walk is a lore and emotional payoff room. The Sanguine here remembers the pre-MERIDIAN world. "MERIDIAN didn\'t create us. It named us." is a key thematic line.',
  },
]
