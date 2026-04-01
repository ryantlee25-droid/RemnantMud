import type { Room } from '@/types/game'

export const THE_STACKS_ROOMS: Room[] = [
  {
    id: 'st_01_approach',
    name: 'The Stacks — Approach',
    zone: 'the_stacks',
    act: 2,
    difficulty: 2,
    visited: false,
    flags: { fastTravelWaypoint: true },
    description: 'The Stacks announces itself with solar panels — a hundred of them, angled south on the hillside like a congregation facing the sun, each one labeled with an installation date and wattage in neat stenciled paint. Behind the panels, an electric fence hums with real current, and behind the fence, the converted warehouse complex rises in clean right angles — the only structure in the Four Corners that looks engineered rather than improvised. The air smells like ozone and warm silicon. A camera tracks your approach. A speaker crackles: "State your affiliation and purpose." These people have power, and the precision of everything you can see says they intend to keep it.',
    descriptionNight: 'At night the Stacks is the brightest thing in the Four Corners. Electric light — not firelight — spills from the facility windows. The solar array\'s charge runs their batteries through the dark hours. Standing out here at night feels like standing outside civilization and watching it work. The gate camera light is a red eye in the darkness.',
    shortDescription: 'The Stacks perimeter. Solar panels. Electric fence. Camera watching.',
    exits: { west: 'st_02_entry_hall', south: 'cr_10_overlook' },
    richExits: {
      west: {
        destination: 'st_02_entry_hall',
        descriptionVerbose: 'through the electric fence gate into the Stacks',
        reputationGate: { faction: 'reclaimers', minLevel: 1 },
      },
    },
    items: [],
    enemies: [],
    npcs: [],
    extras: [
      {
        keywords: ['solar', 'panels', 'array', 'electricity'],
        description: 'A hundred panels, maybe more. Forty-watt each, roughly. Someone ran the math and built to meet it. The array was expanded twice — you can see the different panel generations by the casing color. They didn\'t just find these. They sourced, transported, and installed them over years of work. This is what the Reclaimers do.',
      },
      {
        keywords: ['fence', 'electric', 'current', 'wire'],
        description: 'The fence hums at roughly 5000 volts — enough to stop a Hollow, definitely enough to stop you. Signs at regular intervals: ELECTRIFIED — RECLAIMER PERIMETER. The signs are printed, not hand-written. These people have a printer. A rabbit lies stiff near the south post where it brushed the lower wire. The fur is singed in a line.',
      },
      {
        keywords: ['camera', 'speaker', 'gate', 'voice'],
        description: 'The camera is a repurposed commercial security unit, wired into the facility\'s own power. The speaker is quality — voice comes through clean. Whoever monitors the gate is watching through a good lens. You are being evaluated right now with more technical precision than you\'re evaluating them.',
      },
    ],
    hollowEncounter: {
      baseChance: 0.05,
      timeModifier: { day: 0.3, night: 1.0, dawn: 0.5, dusk: 0.8 },
      threatPool: [
        { type: 'shuffler', weight: 90, quantity: { min: 1, max: 1, distribution: 'single' } },
        { type: 'remnant', weight: 10, quantity: { min: 1, max: 1, distribution: 'single' } },
      ],
      awarenessRoll: { unaware: 0.6, awarePassive: 0.3, awareAggressive: 0.1 },
    },
    narrativeNotes: 'Gate room. Reputation gate enforced here. The Stacks is the most technologically advanced location in Act II — the approach should communicate competence and real infrastructure.',
  },

  {
    id: 'st_02_entry_hall',
    name: 'The Stacks — Entry Hall',
    zone: 'the_stacks',
    act: 2,
    difficulty: 2,
    visited: false,
    flags: { noCombat: true, safeRest: false },
    description: 'Concrete floor, strip lighting overhead — working, humming at sixty hertz — and the faint bite of ozone from the UV decontamination station that processes every body and piece of gear that comes through the gate. Everything is labeled: the brushes in their rack, the sealed chamber for biologicals, the laminated protocol on the wall in clear, non-condescending language. The silence here is the silence of concentration, not fear. Lev stands at the inner door, clipboard in hand, scientific curiosity barely contained behind professional courtesy. You\'ve been seen before. You just haven\'t been catalogued yet.',
    descriptionNight: 'The entry hall is the same at night — the Stacks doesn\'t have a night cycle the way most places do. The strip lighting is on. The decon station is staffed. Lev is here or someone like Lev is here, because the Reclaimers run on curiosity and curiosity doesn\'t sleep.',
    shortDescription: 'Entry hall. Decontamination station. Lev greets you.',
    exits: { east: 'st_01_approach', west: 'st_03_server_room', north: 'st_04_research_lab', south: 'st_05_workshop' },
    richExits: {
      east: { destination: 'st_01_approach', descriptionVerbose: 'back out through the gate' },
      west: { destination: 'st_03_server_room', descriptionVerbose: 'deeper into the facility' },
      north: { destination: 'st_04_research_lab', descriptionVerbose: 'the research wing' },
      south: { destination: 'st_05_workshop', descriptionVerbose: 'the workshop annex' },
    },
    items: [],
    enemies: [],
    npcs: ['lev'],
    npcSpawns: [
      {
        npcId: 'lev',
        spawnChance: 0.85,
        spawnType: 'anchored',
        quantity: { min: 1, max: 1, distribution: 'single' },
        activityPool: [
          { desc: 'Lev stands at the inner door with a clipboard, writing something as you come in, then looking up with the focused attention of someone for whom no input is wasted.', weight: 3 },
          { desc: 'Lev is at the decon station, running the UV wand over a new piece of recovered equipment, mouth moving in a quiet running commentary.', weight: 2 },
          { desc: 'Lev has a tablet propped against the counter and is scrolling through data with one hand while holding a stylus with the other, visibly thinking about two things at once.', weight: 2 },
        ],
        dispositionRoll: { friendly: 0.4, neutral: 0.5, wary: 0.1 },
        dialogueTree: 'lev_entry_hall',
        questGiver: ['reclaimers_meridian_keycard'],
        narrativeNotes: 'Lev is the Reclaimers\' primary questgiver. They have files on Revenants — including the player. The curiosity is genuine; the professionalism is protective.',
      },
    ],
    extras: [
      {
        keywords: ['decon', 'decontamination', 'UV', 'station'],
        description: 'The decontamination station is thorough without being paranoid — brush scrub, UV wand pass, sealed chamber for anything that came from a known Hollow zone. The protocol was designed by someone who understood that CHARON-7 spreads through contact and that the Stacks\' value is in keeping its researchers alive.',
      },
      {
        keywords: ['sign', 'protocol', 'laminated', 'instructions'],
        description: 'ENTRY PROTOCOL — STACKS FACILITY. 1. Remove outer clothing and gear for UV treatment. 2. Brush exposed skin with provided solution. 3. Report any bites, scratches, or mucous membrane contact. 4. Welcome. We\'re glad you\'re here. The fourth point is in a different typeface than the first three. More personal.',
      },
      {
        keywords: ['clipboard', 'files', 'records'],
        description: 'The clipboard Lev carries has your name on one of the sheets — along with a physical description, entry dates, and what appears to be a measurement grid. You\'ve been here before, apparently. Or someone matching your description has. Lev notices you looking and doesn\'t move the clipboard.',
        cycleGate: 2,
      },
    ],
    narrativeNotes: 'Introduction to the Stacks. Lev is the key NPC. The clipboard with player data is a Cycle 2+ moment — by the second cycle, Lev has a file on you.',
  },

  {
    id: 'st_03_server_room',
    name: 'The Stacks — Server Room',
    zone: 'the_stacks',
    act: 2,
    difficulty: 2,
    visited: false,
    flags: { noCombat: true, questHub: true },
    description: 'The server room is cold and loud — sixty-two degrees, because the equipment demands it, and the fans run constant with the white-noise devotion of machines that do not sleep. The air tastes like dust and warm circuitry. Rack after rack of salvaged servers, consumer routers, and custom-built nodes form a maze of blinking amber and green, every cable zip-tied, every rack labeled with contents and maintenance dates in the same neat stencil as the solar panels outside. This is the closest thing to the internet that exists in the Four Corners — a local mesh network, a searchable archive, a connection to three other Reclaimer nodes. The click of keyboards carries from unseen terminals. Information moves here. It is the only place where that is true.',
    descriptionNight: 'The server room at night is unchanged — cold, loud, blinking. The machines don\'t know what time it is. A technician sits at one terminal, running overnight archiving jobs, half-asleep, monitoring numbers that mostly don\'t need monitoring. The data hum is the sound of the old world still processing.',
    shortDescription: 'The Stacks server room. A local mesh network.',
    exits: { east: 'st_02_entry_hall', west: 'st_07_comm_center', north: 'st_09_cold_storage' },
    richExits: {
      east: { destination: 'st_02_entry_hall', descriptionVerbose: 'back to the entry hall' },
      west: { destination: 'st_07_comm_center', descriptionVerbose: 'the comm center' },
      north: { destination: 'st_09_cold_storage', descriptionVerbose: 'cold storage (restricted)', locked: true, lockedBy: 'cold_storage_key' },
    },
    items: [],
    enemies: [],
    npcs: [],
    npcSpawns: [
      {
        npcId: 'reclaimer_technician',
        spawnChance: 0.75,
        spawnType: 'anchored',
        quantity: { min: 1, max: 2, distribution: 'weighted_low' },
        activityPool: [
          { desc: 'A technician works two terminals simultaneously, cross-referencing something between screens.', weight: 3 },
          { desc: 'A Reclaimer researcher types quickly, pauses, reads, types again — the rhythm of someone chasing a thought through data.', weight: 3 },
        ],
        dispositionRoll: { neutral: 0.7, friendly: 0.2, wary: 0.1 },
      },
    ],
    extras: [
      {
        keywords: ['servers', 'computers', 'hardware', 'racks'],
        description: 'The equipment is a generational archaeology of computing hardware — some commercial server racks that were salvaged intact, some consumer desktops bolted together, some entirely custom builds with hand-soldered components. It shouldn\'t work. It works.',
        skillCheck: { skill: 'electronics', dc: 9, successAppend: 'The custom nodes are impressive engineering. Someone built distributed storage from off-the-shelf parts, wrote the clustering software from scratch, and kept the whole thing running for years. Lev has a team of extraordinary people.' },
      },
      {
        keywords: ['terminal', 'search', 'archive', 'database'],
        description: 'The terminals access the archive. You can search by keyword, date, or source. The archive holds: pre-Collapse news and data (fragmentary), post-Collapse survivor reports (extensive), technical documents recovered from various sites, and a section labeled MERIDIAN that requires a clearance you don\'t have yet.',
        skillCheck: { skill: 'electronics', dc: 12, successAppend: 'The MERIDIAN section\'s access log shows it\'s been queried dozens of times. Most queries by Lev. The last query is recent — three days ago, searching for "CHARON-7 strain comparison" and "viable samples." Lev\'s been working on something urgent.' },
      },
    ],
    narrativeNotes: 'The mesh network is a major Reclaimer resource. The MERIDIAN archive section, with clearance gating and Lev\'s query log, is a significant lore thread.',
  },

  {
    id: 'st_04_research_lab',
    name: 'The Stacks — Research Lab',
    zone: 'the_stacks',
    act: 2,
    difficulty: 2,
    visited: false,
    flags: { noCombat: true, questHub: true },
    description: 'Lev\'s workspace is a controlled chaos of scientific process — whiteboards covered in notation, sample containers in labeled rows, a centrifuge running quietly in the corner, three microscopes sharing a bench with their eyepieces at different heights because Lev has cycled through multiple researchers. The walls are covered in the Revenant study: photographs, timeline charts, physiological data, and a large central board that reads CHARON-7 MUTATION PATHWAYS. You are standing inside the closest thing to hope that exists in the Four Corners.',
    descriptionNight: 'The lab runs day and night. The centrifuge doesn\'t stop. The notes accumulate. At night Lev is usually here, working past the hour that makes sense, cross-referencing data with the focused urgency of someone who has realized that time is not infinite and neither is the opportunity.',
    shortDescription: 'Lev\'s research lab. CHARON-7 analysis. Revenant study.',
    exits: { south: 'st_02_entry_hall', east: 'st_08_levs_office' },
    richExits: {
      south: { destination: 'st_02_entry_hall', descriptionVerbose: 'back to the entry hall' },
      east: { destination: 'st_08_levs_office', descriptionVerbose: 'Lev\'s office' },
    },
    items: [],
    enemies: [],
    npcs: ['lev'],
    extras: [
      {
        keywords: ['whiteboard', 'notation', 'notes', 'writing'],
        description: 'The whiteboard math is dense — protein folding models, genomic markers, infection pathway diagrams. You don\'t follow most of it, but the arrows all converge on a single point: a structure labeled CS-R8, circled three times in red. Something about it is different from the surrounding notation. Circled in red means it\'s the answer to something.',
        skillCheck: { skill: 'lore', dc: 11, successAppend: 'CS-R8. CHARON-7 Strain R-8. You\'ve seen that designation before — on the shipping manifest in the Boneyard. The strain in the MERIDIAN biological distribution containers. Lev is reverse-engineering the source material.' },
      },
      {
        keywords: ['revenant', 'study', 'charts', 'photographs', 'board'],
        description: 'The Revenant board is the most personal thing in the lab. Photographs of people with faded scars, timelines of death and rebirth, skill retention percentages. One photograph has your cycle count next to it and a question mark. Lev has been waiting for you. Or someone like you. Or possibly specifically you.',
        cycleGate: 2,
      },
      {
        keywords: ['centrifuge', 'microscope', 'samples', 'equipment'],
        description: 'The centrifuge is a good one — medical grade, pre-Collapse. The microscopes are an assortment of quality levels. The samples in the refrigerated rack are labeled with codes, not names, but the color of the sample caps corresponds to a key taped to the rack: RED = active CHARON-7. BLUE = inert. GREEN = unknown. The green caps outnumber the others.',
      },
    ],
    narrativeNotes: 'Central lore room for the Reclaimers. The whiteboard connects to the Boneyard lore discovery. The Revenant study board is personal and unsettling for the player.',
  },

  {
    id: 'st_05_workshop',
    name: 'The Stacks — Workshop',
    zone: 'the_stacks',
    act: 2,
    difficulty: 2,
    visited: false,
    flags: { noCombat: true, scavengingZone: false },
    description: 'The best crafting station in the Four Corners, full stop. The Reclaimers converted the warehouse\'s loading dock into a working shop with real tools — a lathe, a drill press, a MIG welder, soldering stations, an electronics bench with a working oscilloscope. The smell is solder flux and machine oil and competence. Things get fixed here. Things get made. There is a waiting list on a corkboard for workshop time, and the list is long.',
    descriptionNight: 'The workshop runs late — the welding mask hanging empty on the hook, the lathe powered down but still smelling of metal. A night-shift technician does electronics work at the bench, working by lamplight because the oscilloscope needs clean power and they\'ve learned to be patient with the generator.',
    shortDescription: 'The best crafting station in the Four Corners. Electronics specialty.',
    exits: { north: 'st_02_entry_hall' },
    richExits: {
      north: { destination: 'st_02_entry_hall', descriptionVerbose: 'back to the entry hall' },
    },
    items: [],
    enemies: [],
    npcs: [],
    npcSpawns: [
      {
        npcId: 'reclaimer_craftsperson',
        spawnChance: 0.80,
        spawnType: 'anchored',
        quantity: { min: 1, max: 2, distribution: 'weighted_low' },
        activityPool: [
          { desc: 'A craftsperson works at the lathe, making slow precise cuts, one eye on the calliper.', weight: 3 },
          { desc: 'A technician solders something small with a steady hand and a magnifying headset, breathing slow.', weight: 3 },
        ],
        dispositionRoll: { neutral: 0.6, friendly: 0.3, wary: 0.1 },
        tradeInventory: ['crafting_components', 'electronics_kit', 'welding_rod'],
      },
    ],
    extras: [
      {
        keywords: ['lathe', 'drill', 'welder', 'tools'],
        description: 'Real machine tools, maintained properly. The lathe is a twelve-inch swing Jet model, still under the original oil. The MIG welder has fresh wire and the gas cylinder is topped up. Whoever manages this shop has access to supply chains you don\'t. The Reclaimers trade in parts and knowledge.',
        skillCheck: { skill: 'mechanics', dc: 8, successAppend: 'You have the skills to use this equipment. With time at this bench, you could repair the rifle barrel from Randy\'s Hardware, fabricate a suppressor, or — if you have the schematic — build something from the plans in the diner kitchen.' },
      },
      {
        keywords: ['waiting list', 'corkboard', 'list', 'names'],
        description: 'The waiting list has twelve names and estimated time requests. Most are Reclaimer residents. Four are outsiders — you recognize one name from Crossroads. The list suggests the Reclaimers trade workshop access as a service. The note at the top: MAX 4 HOURS PER SESSION. LEAVE THE BENCH BETTER THAN YOU FOUND IT.',
      },
    ],
    narrativeNotes: 'Crafting hub. Best repair and fabrication in Act II. Mechanic skill checks connect to Randy\'s Hardware and the diner schematic.',
  },

  {
    id: 'st_06_library',
    name: 'The Stacks — Library',
    zone: 'the_stacks',
    act: 2,
    difficulty: 2,
    visited: false,
    flags: { noCombat: true, safeRest: false },
    description: 'A room that earns its name. The Reclaimers have been collecting books, hard drives, printed documents, and academic papers for years — floor-to-ceiling shelves, a card catalog rebuilt from scratch, and three reading tables with good light. The organization is a small miracle: Dewey Decimal for the physical books, folder taxonomy for the digital archive, handwritten index cards for the documents that don\'t fit either system. This is the most human room in the Stacks.',
    descriptionNight: 'The library at night is quiet in a way that feels chosen rather than accidental. The reading lamps are on over two of the tables. A researcher reads slowly, making notes in a small book. Another sleeps with their head on folded arms, a technical manual still open beneath them.',
    shortDescription: 'The Stacks library. Salvaged books and drives. Lore.',
    exits: { east: 'st_07_comm_center', south: 'st_10_roof_observatory', down: 'st_15_preservation_vault', west: 'st_16_reading_room' },
    richExits: {
      east: { destination: 'st_07_comm_center', descriptionVerbose: 'east to the comm center' },
      south: { destination: 'st_10_roof_observatory', descriptionVerbose: 'stairs up to the roof observatory' },
      down: {
        destination: 'st_15_preservation_vault',
        descriptionVerbose: 'down a reinforced stairwell into the preservation vault',
        skillGate: { skill: 'lockpicking', dc: 10, failMessage: 'The vault door has a mechanical combination lock. You can\'t crack it yet.' },
      },
      west: { destination: 'st_16_reading_room', descriptionVerbose: 'west into the old reading room' },
    },
    items: ['lore_reclaimer_field_notes'],
    enemies: [],
    npcs: [],
    extras: [
      {
        keywords: ['shelves', 'books', 'collection', 'catalog'],
        description: 'The collection is eclectic: textbooks (engineering, medicine, agriculture, history), fiction (someone had a paperback problem), manuals (too many to count), and a section of personal diaries the Reclaimers have collected as historical record. The card catalog is a work in progress but functional.',
        skillCheck: { skill: 'lore', dc: 9, successAppend: 'The card catalog has a MERIDIAN section. You pull it: cross-referenced to four documents. Three are in the restricted archive. One is here — a pre-Collapse academic paper on "Controlled Viral Modification and the Ethics of Human Enhancement Trials." Published 2028. Two of the authors share a last name with someone in the MERIDIAN personnel files you\'ve seen elsewhere.' },
      },
      {
        keywords: ['hard drives', 'digital', 'archive', 'drives'],
        description: 'A dedicated shelf holds labeled hard drives in anti-static bags, each with a hand-written catalog card. The drives came from offices, homes, universities. The Reclaimers don\'t read everything — they archive first, read later. The backlog of unread material is approximately human history.',
      },
      {
        keywords: ['diaries', 'journals', 'personal'],
        description: 'The personal diaries section occupies two shelves and is the most-read section in the library. Dates range from the Collapse through the present. Reading someone\'s diary in a library feels strange. Reading someone\'s diary in a library that exists because civilization ended and this is how they rebuilt it feels different.',
      },
    ],
    personalLossEchoes: {
      child: 'The personal diaries section. Dates from the Collapse through the present. You pull one at random and it opens to a page about a child\'s first birthday after the fall — a candle in a biscuit, a song sung badly on purpose. You close it. You put it back. Your hands are steady. Your hands are not steady.',
      partner: 'The card catalog rebuilt from scratch. Someone\'s handwriting on every card — careful, precise, the labor of someone who loves organization or loves what organization makes possible. You recognize the handwriting of devotion. Your partner had handwriting you could recognize across a room. This catalog is someone\'s love letter to the future.',
      community: 'The library is a room full of other people\'s thoughts, preserved, organized, made accessible. It is the most concentrated form of community you\'ve seen since you lost yours — a thousand voices held together by shelves and a decimal system and the stubborn belief that what people wrote down matters.',
      identity: 'The hard drives on the dedicated shelf, each with a catalog card. The collected knowledge of offices, homes, universities. Somewhere in these drives is a version of the world that included you — your records, your data, your name on a list. The archive is vast enough that you might be in it. You don\'t look.',
      promise: 'A pre-Collapse academic paper on viral modification and human enhancement trials. Published 2028. The promise of science, the promise of improvement, the promise that broke. You made a simpler promise. You wonder if simple promises break less easily, or if all promises break the same way, at the point where the world stops cooperating.',
    },
    narrativeNotes: 'Lore treasure trove. The MERIDIAN cross-reference in the card catalog is a significant clue. The personal diaries are for Letters/personal quest threads.',
  },

  {
    id: 'st_07_comm_center',
    name: 'The Stacks — Comm Center',
    zone: 'the_stacks',
    act: 2,
    difficulty: 2,
    visited: false,
    flags: { noCombat: true, questHub: true },
    description: 'The comm center is where the Stacks listens to the world — racks of radio equipment, a spectrum analyzer running continuous sweeps, a large-format printout of the frequency map taped to the wall with dozens of hand-annotated signals. Sparks would love it here. There\'s a dedicated terminal for signal analysis, and a separate rig for transmission. On the frequency map, one signal is circled in red and labeled with three letters: MRD. Someone has been triangulating it for months. The pins and strings cover the northwest corner of the map.',
    descriptionNight: 'Comm center at night is peak activity. The static is different at night — atmospheric conditions favor long-range reception. A technician works the spectrum with headphones on, writing down what they hear, face concentrated in the blue glow of equipment displays.',
    shortDescription: 'The Stacks comm center. Signal analysis. The broadcast.',
    exits: { east: 'st_03_server_room', west: 'st_06_library', north: 'st_08_levs_office' },
    richExits: {
      east: { destination: 'st_03_server_room', descriptionVerbose: 'east to the server room' },
      west: { destination: 'st_06_library', descriptionVerbose: 'west to the library' },
      north: { destination: 'st_08_levs_office', descriptionVerbose: 'north to Lev\'s office' },
    },
    items: [],
    enemies: [],
    npcs: [],
    npcSpawns: [
      {
        npcId: 'reclaimer_signal_tech',
        spawnChance: 0.80,
        spawnType: 'anchored',
        quantity: { min: 1, max: 1, distribution: 'single' },
        activityPool: [
          { desc: 'A technician sweeps the spectrum with headphones, writing coordinates on a notepad without looking up.', weight: 3 },
          { desc: 'A signal analyst adjusts equipment with small careful movements, listening to something you can\'t hear.', weight: 2 },
        ],
        dispositionRoll: { neutral: 0.6, friendly: 0.3, wary: 0.1 },
      },
    ],
    extras: [
      {
        keywords: ['map', 'frequency', 'pins', 'MRD', 'triangulation'],
        description: 'The frequency map has been annotated over many months. The MRD signal origin point is narrowed to a circle in the northwest — the Scar valley, within a few miles. The triangulation used relay points including at least one in the Dust. Someone placed those relays. This is the broadcast you\'ve been following.',
        skillCheck: { skill: 'electronics', dc: 10, successAppend: 'The triangulation data is precise enough to give you coordinates — written in the margin in Lev\'s handwriting: "Confirmed: MERIDIAN facility structure still standing. Signal source depth approx. 40m below crater floor. Automated? No — pattern variation consistent with human operation. Someone is down there."' },
      },
      {
        keywords: ['decode', 'broadcast', 'signal', 'radio'],
        description: 'You sit at the signal analysis terminal. The broadcast is fragmented, repeating — but the Reclaimers have been accumulating fragments and the terminal has a partial decode. One coherent phrase has been isolated: "...the data survives intact. The choice was always going to be yours. We are still here. If you are reading this, if you are still you..."',
        skillCheck: { skill: 'electronics', dc: 12, successAppend: 'You extend the decode window and pull another fragment from the archive: "...two strains. R-8 is the failure. R-1 is the prototype. The Sanguine carry R-1. The Hollow carry R-8. Everything you need to understand what happened is in the core lab. Come down."' },
      },
    ],
    narrativeNotes: 'Signal analysis hub. Key lore delivery room. The electronics skill check decode is one of the most significant information payoffs in Act II.',
  },

  {
    id: 'st_08_levs_office',
    name: 'The Stacks — Lev\'s Office',
    zone: 'the_stacks',
    act: 2,
    difficulty: 2,
    visited: false,
    flags: { noCombat: true, questHub: true },
    description: 'Lev\'s office tells you who Lev is before Lev speaks. The wall behind the desk is all references: maps with annotation layers, printouts with dense handwritten margins, a MERIDIAN site diagram covered in question marks. A coffee mug with a ring-stained bottom sits on a research journal that was clearly being used as a coaster while Lev was reading something else. Three other mugs at various distances suggest a working radius. On the bookshelf: a photograph in a small frame, face-down, always face-down. On the desk: a folder labeled REVENANT COHORT — CYCLE OBSERVATIONS, open. Inside it: you, or someone who cycles the way you cycle, documented across multiple iterations. Lev has been watching. Lev has been waiting. Lev is about to ask you something.',
    descriptionNight: 'Lev is usually in this office at night. The coffee is always fresh, which means either Lev doesn\'t sleep or keeps very odd hours — the mug near the lamp is still warm. The photograph stays face-down. The REVENANT COHORT folder is always out. At night Lev is quieter — the questions more direct, as if the dark takes away the professional courtesy and leaves only the actual curiosity.',
    shortDescription: 'Lev\'s office. Three coffee mugs. A face-down photograph. A folder with your name in it.',
    exits: { south: 'st_07_comm_center', west: 'st_04_research_lab' },
    richExits: {
      south: { destination: 'st_07_comm_center', descriptionVerbose: 'south to the comm center' },
      west: { destination: 'st_04_research_lab', descriptionVerbose: 'west to the research lab' },
    },
    items: [],
    enemies: [],
    npcs: ['lev'],
    npcSpawns: [
      {
        npcId: 'lev',
        spawnChance: 0.70,
        spawnType: 'anchored',
        quantity: { min: 1, max: 1, distribution: 'single' },
        activityPool: [
          { desc: 'Lev reads from the REVENANT COHORT folder without looking up, then says your name without having to check.', weight: 3 },
          { desc: 'Lev stands at the wall of references, tracing a pathway with one finger, working through something complex.', weight: 2 },
          { desc: 'Lev sits with the folder closed and hands folded on it, waiting. They\'ve been waiting for you specifically.', weight: 2 },
        ],
        dispositionRoll: { friendly: 0.5, neutral: 0.4, wary: 0.1 },
        dialogueTree: 'lev_office_quest',
        questGiver: ['reclaimers_meridian_keycard', 'reclaimers_cold_storage_access'],
      },
    ],
    extras: [
      {
        keywords: ['photograph', 'photo', 'frame', 'face-down'],
        description: 'You pick up the photograph carefully. A family: Lev (younger, clearly), two children, and a partner. All four are laughing at something outside the frame. The date on the back: 2030. One year before the Collapse. You set it back down face-down because that is how Lev keeps it.',
      },
      {
        keywords: ['coffee', 'mug', 'cup', 'ring', 'stain'],
        description: 'You count four mugs in various positions around the office. The one on the lamp table is warm. The one on the research journal has been there long enough that the ring stain has dried and been added to several times, a Venn diagram of caffeine and urgency. The one on the windowsill is a trophy — it has WORLD\'S OKAYEST SCIENTIST printed on it in faded letters, a pre-Collapse joke gift that Lev has kept for seven years and still uses.',
      },
      {
        keywords: ['wall', 'reference', 'maps', 'annotations', 'research', 'printouts'],
        description: 'The reference wall is a biography of an obsession. Maps of the Scar valley with topographic markings. Photographs of the MERIDIAN crater rim from multiple approach vectors. Printouts from the server archive with dense marginalia in two different pen colors — Lev\'s analytical system, you learn if you ask: blue for established fact, red for inference or hypothesis. There is significantly more red than blue on the MERIDIAN pages. The question marks outnumber the answers.',
        skillCheck: { skill: 'lore', dc: 10, successAppend: 'One section of the wall is dedicated to a single diagram: the CHARON-7 divergence timeline. R-1 is marked as the prototype, with a date of 2028 and an arrow labeled SANGUINE EXPRESSION. R-8 is marked as a derivation, 2030, HOLLOW EXPRESSION. Between them: a date in red with a question mark — 2029. Something happened in 2029 that Lev has circled seven times and still can\'t account for.' },
      },
      {
        keywords: ['folder', 'revenant', 'cohort', 'files'],
        description: 'The file on you is thorough. Physical descriptions from multiple observations. Skill retention percentages across cycles. Notes on personality shifts between deaths. The final entry reads: "Subject demonstrates unusual coherence. Memory fragmentation within expected range but integration significantly above. Query: is subject aware they are being studied? Should we ask?"',
        cycleGate: 2,
      },
      {
        keywords: ['keycard', 'MERIDIAN', 'access', 'key'],
        description: 'On Lev\'s desk, locked in a lockbox: you can see the edge of a keycard through the gap. Black plastic, white text too small to read from here. This is what the Reclaimers are offering — the means to enter MERIDIAN. They found it, cleaned it, tested its validity. They need you to use it.',
        questGate: 'reclaimers_trusted',
      },
      {
        keywords: ['keycard', 'lev', 'meridian', 'access', 'lockbox', 'give', 'offer'],
        description: 'You present Lev with what you found — the evidence of Field Station Echo, the second MERIDIAN site the Reclaimers have been looking for. Lev goes still. Not surprised — confirmed. They set the clipboard down, open the lockbox on the desk with a key from their pocket, and hold out the keycard. Black plastic, white text: MERIDIAN PROJECT — LEVEL 1 ACCESS — ALL AREAS. "I was going to make you earn this longer," Lev says. "But you already did the work. The keycard gets you through the front door. What you do inside is yours." They pause. "Come back. I want to know what\'s in there. I have wanted to know for seven years."',
        questGate: 'discovered_field_station_echo',
        skillCheck: { skill: 'lore', dc: 10, successAppend: 'You turn the keycard over. On the back, in small printed text: ISSUED TO: DR. ELIAS VANE, PROJECT DIRECTOR. Lev watches you read it and nods once. "Yes. The director\'s own card. We found it in his car, two miles from the crater rim. He drove out, left the card, and went back in. He wanted someone to follow him. That someone is you."' },
        questFlagOnSuccess: { flag: 'reclaimers_meridian_keycard', value: true },
        reputationGrant: { faction: 'reclaimers', delta: 1 },
      },
    ],
    environmentalRolls: {
      flavorLines: [
        { line: 'The reference wall has a quality you recognize: something built over years, each addition placed with the precision of someone who knows it won\'t be the last addition.', chance: 0.25, time: null },
        { line: 'The coffee mug on the lamp table is warm. Lev was here recently, or is coming back.', chance: 0.20, time: null },
      ],
    },
    narrativeNotes: 'Primary questgiver room. The MERIDIAN keycard quest originates here. The photograph humanizes Lev. The revenant cohort file is a significant player-mirror moment. New extras: coffee mugs (personality), reference wall (CHARON-7 timeline lore hook). The keycard quest requires discovered_field_station_echo from the comm center map room.',
  },

  {
    id: 'st_09_cold_storage',
    name: 'The Stacks — Cold Storage',
    zone: 'the_stacks',
    act: 2,
    difficulty: 2,
    visited: false,
    flags: { noCombat: true },
    description: 'The cold storage room runs at thirty-eight degrees — you feel it before you enter, a wall of chill pushing through the gap under the door. Inside: sample racks in refrigerated cases, biohazard seals on every container, and a laminated protocol sheet that begins AUTHORIZED PERSONNEL ONLY and ends with a series of emergency procedures that suggest the facility takes seriously what would happen if these samples got out. On the center shelf, a case labeled CHARON-7 CS-R8 — VIABLE. Three samples. The end of the world, kept cold.',
    descriptionNight: 'The cold storage doesn\'t know what time it is. The refrigeration runs. The samples wait. At night the hum of the compressor is the loudest sound in this wing.',
    shortDescription: 'CHARON-7 samples. Cold. Locked. Significant.',
    exits: { south: 'st_03_server_room' },
    richExits: {
      south: {
        destination: 'st_03_server_room',
        descriptionVerbose: 'back out to the server room',
        questGate: 'cold_storage_access_granted',
      },
    },
    items: [],
    enemies: [],
    npcs: [],
    itemSpawns: [
      { entityId: 'boiled_rations', spawnChance: 0.8, quantity: { min: 1, max: 3, distribution: 'flat' } },
      { entityId: 'purification_tabs', spawnChance: 0.6, quantity: { min: 1, max: 2, distribution: 'flat' } },
      { entityId: 'chemicals_basic', spawnChance: 0.4, quantity: { min: 1, max: 1, distribution: 'flat' } },
    ],
    extras: [
      {
        keywords: ['samples', 'CHARON-7', 'vials', 'case'],
        description: 'Three sealed vials, each labeled CHARON-7 CS-R8 — VIABLE — MERIDIAN ORIGIN. The case they\'re stored in has a GPS tracker and a tamper seal — if the case is moved without authorization, something happens. You don\'t know what. The sample material inside the vials is clear with a faint blue-green fluorescence under the cold light. It\'s beautiful, in the way that dangerous things often are.',
        questGate: 'cold_storage_access_granted',
      },
      {
        keywords: ['protocol', 'emergency', 'procedures', 'instructions'],
        description: 'The emergency protocol covers: containment breach, sample theft, accidental exposure, and a fourth scenario that\'s been added in handwriting: "SUBJECT SELF-EXPOSURE (voluntary)." That last one has Lev\'s initials next to it and a date from six months ago. Someone tried or considered trying. That\'s new information.',
        questGate: 'cold_storage_access_granted',
      },
    ],
    narrativeNotes: 'Quest-gated room. The CHARON-7 samples are a key Act II revelation. The voluntary self-exposure note on the protocol is a Lev character moment with significant implications.',
  },

  {
    id: 'st_10_roof_observatory',
    name: 'The Stacks — Roof Observatory',
    zone: 'the_stacks',
    act: 2,
    difficulty: 2,
    visited: false,
    flags: { fastTravelWaypoint: false, combat_high_ground: true },
    description: 'The warehouse roof has been converted into an observation platform — a railing at the perimeter, a weatherproofed telescope on a fixed mount, and a folding chair beside it for the long nights. The view is the best in the Four Corners: the whole desert basin north, the distant smudge of Crossroads east, the Dust west. On a clear night, due north-northwest, a faint orange light sits in the horizon like a star that got lost. That\'s the Scar valley. Lev calls it "the light that shouldn\'t be there."',
    descriptionNight: 'At night the roof is where everything becomes clear — the stars, the distances, the orange light due north-northwest that the telescope resolves into a crater edge and below it, seven hundred feet down, something that still generates heat. MERIDIAN. Still warm. Seven years after the bombing. Heat doesn\'t come from nothing.',
    shortDescription: 'Roof observatory. Telescope. You can see MERIDIAN on a clear night.',
    exits: { down: 'st_06_library' },
    richExits: {
      down: { destination: 'st_06_library', descriptionVerbose: 'down the stairs to the library' },
    },
    items: [],
    enemies: [],
    npcs: [],
    itemSpawns: [
      { entityId: 'radio_tower_broadcast_notes', spawnChance: 0.9, quantity: { min: 1, max: 1, distribution: 'flat' } },
      { entityId: 'electronics_salvage', spawnChance: 0.5, quantity: { min: 1, max: 1, distribution: 'flat' } },
    ],
    extras: [
      {
        keywords: ['telescope', 'lens', 'scope', 'look'],
        description: 'The telescope is a good one — research grade, tracked mount, eight-inch aperture. Someone aligned it carefully and marked the tripod base with the cardinal directions. You put your eye to the eyepiece and sweep north-northwest. The orange light resolves into a landscape: a crater rim, chemical haze, and below — a structure. Not destroyed. Not rubble. A structure with heat coming off it.',
        skillCheck: { skill: 'perception', dc: 9, successAppend: 'You adjust the focus. The structure has features you can identify even at this distance: access hatches, antenna stubs, and a dim regular light pattern that repeats every three seconds. The same interval as the radio signal. The source is down there. Forty meters below that crater floor, broadcasting.' },
      },
      {
        keywords: ['light', 'orange', 'MERIDIAN', 'horizon', 'glow'],
        description: '"The light that shouldn\'t be there." Lev\'s phrase. You can see it without the telescope — a faint orange smear on the northwest horizon. Most people think it\'s a wildfire. It never changes. Wildfires move. This has been in the same place for seven years.',
        descriptionPool: [
          { desc: '"The light that shouldn\'t be there." Orange smear on the northwest horizon. Still. Permanent. Not a fire.', weight: 3, cycleGate: 1 },
          { desc: 'You know what that light is now. MERIDIAN. Alive. Waiting.', weight: 3, cycleGate: 2 },
        ],
      },
      {
        keywords: ['view', 'basin', 'crossroads', 'distance'],
        description: 'The view north takes in the full desert basin — the highway threads, the distant settlement smoke from Crossroads, the Dust expanse to the west. On a clear day you can count the zones by their features. The Four Corners, from up here, looks like a map someone drew of a place that used to be and might be again, if enough people keep at it.',
      },
    ],
    environmentalRolls: {
      flavorLines: [
        { line: 'The wind up here is cold and constant. It comes from the northwest.', chance: 0.30, time: null },
        { line: 'A shooting star traces a line across the north sky and ends above the Scar valley.', chance: 0.10, time: ['night'] },
      ],
    },
    narrativeNotes: 'Climactic observatory scene. The MERIDIAN light is a key visual payoff. The telescope check is one of the most significant single skill checks in Act II — confirming MERIDIAN is inhabited.',
  },

  {
    id: 'st_11_upper_stacks',
    name: 'The Upper Stacks',
    zone: 'the_stacks',
    act: 2,
    difficulty: 3,
    visited: false,
    flags: { scavengingZone: true, combat_high_ground: true },
    description: 'The collapse folded two skyscrapers into each other and left the upper floors at ground level — a connected elevated platform of concrete slab and steel beam, accessible by a rubble ramp that takes some nerve to climb. Up here the city opens. You can see the full sweep of The Stacks\' geography: the twisted grid of streets buried under debris, the punctuation of standing walls, and at the northern edge, the smudge of the Dust horizon. The wind is stronger. The footing is uncertain. And you are visible to anything for half a mile.',
    descriptionNight: 'At night the Upper Stacks is a different kind of exposed — the open sky above, every source of light below highlighted by the darkness. The Stacks facility glows to the south. Crossroads emits a faint orange smear to the east. You are a silhouette up here. Anything that looks this way will see you before you see it.',
    descriptionDawn: 'Dawn from the Upper Stacks turns the rubble gold. The light comes from the east and catches every broken edge and shattered pane, the wreckage briefly beautiful before the day makes it just wreckage again.',
    shortDescription: 'The Upper Stacks platform. Elevated. Exposed. Wide views.',
    exits: { down: 'st_01_approach', east: 'st_14_collapsed_lobby' },
    richExits: {
      down: {
        destination: 'st_01_approach',
        descriptionVerbose: 'down the rubble ramp to the approach',
        skillGate: { skill: 'climbing', dc: 8, failMessage: 'The ramp shifts under your weight. You catch yourself but don\'t make it. Try again when you\'re steadier.' },
      },
      east: {
        destination: 'st_14_collapsed_lobby',
        descriptionVerbose: 'east along the elevated platform toward the collapsed lobby',
      },
    },
    items: [],
    enemies: [],
    npcs: [],
    itemSpawns: [
      { entityId: 'electronics_salvage', spawnChance: 0.55, quantity: { min: 1, max: 2, distribution: 'weighted_low' }, conditionRoll: { min: 0.3, max: 0.7 } },
      { entityId: 'scrap_metal', spawnChance: 0.70, quantity: { min: 1, max: 3, distribution: 'flat' } },
      { entityId: 'old_binoculars', spawnChance: 0.20, quantity: { min: 1, max: 1, distribution: 'single' }, conditionRoll: { min: 0.2, max: 0.6 } },
    ],
    extras: [
      {
        keywords: ['view', 'city', 'ruins', 'horizon', 'skyline'],
        description: 'The view is the most comprehensive picture of the collapse you\'ve seen — the city\'s structure still readable in the rubble, the grid of streets identifiable by the valleys between debris fields, the former towers now measuring their height in horizontal distance. This was a dense urban center. A hundred thousand people, maybe. The silence is proportional.',
        skillCheck: { skill: 'perception', dc: 10, successAppend: 'You track movement below — two figures, moving fast, carrying something between them. Not Hollow. Scavengers. They\'re heading for the underpass on the north side of the collapsed lobby. They know something about this zone that you don\'t yet.' },
      },
      {
        keywords: ['ramp', 'rubble', 'approach', 'climb'],
        description: 'The rubble ramp is a natural formation — a fortunate angle of collapse that left a gradable incline. Someone has driven rebar stakes into it at intervals, not quite enough for a fixed handline but enough to suggest this isn\'t the first time someone has made this climb. The stakes are old. The Reclaimers, probably. They catalog everything.',
      },
      {
        keywords: ['wind', 'exposed', 'sight', 'lines'],
        description: 'You are visible from a long way. That is the tradeoff of high ground: you see more, and more sees you. The wind reads from the northwest, cold, with a chemical undertone that the Reclaimers attribute to outgassing from whatever happened in the Scar valley. Up here you catch it more clearly. It smells like something that was once a laboratory.',
      },
    ],
    hollowEncounter: {
      baseChance: 0.10,
      timeModifier: { day: 0.5, night: 1.2, dawn: 0.7, dusk: 1.0 },
      threatPool: [
        { type: 'shuffler', weight: 70, quantity: { min: 1, max: 2, distribution: 'weighted_low' } },
        { type: 'remnant', weight: 30, quantity: { min: 1, max: 1, distribution: 'single' } },
      ],
      awarenessRoll: { unaware: 0.3, awarePassive: 0.4, awareAggressive: 0.3 },
      noiseModifier: 1.3,
    },
    environmentalRolls: {
      flavorLines: [
        { line: 'A gust hits the platform. Loose debris rattles and skips off the edge into the rubble below.', chance: 0.35, time: null },
        { line: 'Something moves far below — too slow for a person, too deliberate for debris settling.', chance: 0.20, time: ['night', 'dusk'] },
        { line: 'The city grid is visible from here if you know how to read it. The streets ran east-west and north-south. Some of them still do, underground.', chance: 0.25, time: ['day', 'dawn'] },
      ],
    },
    narrativeNotes: 'Elevated observation point outside the Stacks facility. Accessible via climbing check. Connects to the collapsed lobby zone. The wind detail (chemical smell from the Scar) links to the MERIDIAN atmospheric lore seeded in the observatory room.',
  },

  {
    id: 'st_12_server_room_remnant',
    name: 'Server Room Remnant',
    zone: 'the_stacks',
    act: 2,
    difficulty: 3,
    visited: false,
    flags: { dark: true, scavengingZone: true, combat_darkness: true, combat_narrow_passage: true },
    description: 'Forty feet underground, reached by a stairwell the collapse partially spared, the data center survived because it was built to survive — reinforced concrete, dual power feeds, fire suppression still intact. The suppression foam has long since dried to a crust over everything. Rack after rack of dead servers stands in rows, screens black, indicator lights dark — except for three units in the northeast corner, where a backup UPS still draws power from somewhere and something hums. Not the equipment. Something in the equipment. A system that was never meant to be shut down running on the last of its reserves, processing something no one has asked it to process in seven years.',
    descriptionNight: 'The server room doesn\'t know it\'s night. The three humming units in the northeast corner put out a faint amber light that is the only illumination. In that amber glow, in the silence, the processing sounds almost like breathing.',
    shortDescription: 'Pre-collapse data center. Mostly dead. Three units still hum.',
    exits: { up: 'st_14_collapsed_lobby' },
    richExits: {
      up: {
        destination: 'st_14_collapsed_lobby',
        descriptionVerbose: 'up the stairwell to the collapsed lobby',
      },
    },
    items: [],
    enemies: ['shuffler'],
    npcs: [],
    npcSpawns: [
      {
        npcId: 'reclaimer_signal_tech',
        spawnChance: 0.25,
        spawnType: 'wanderer',
        quantity: { min: 1, max: 1, distribution: 'single' },
        activityPool: [
          { desc: 'A Reclaimer technician works by headlamp, tracing cable runs through the foam crust with a thin probe, taking notes.', weight: 3 },
          { desc: 'A signal tech sits cross-legged before the three live units, headphones on, recording something from the audio out.', weight: 2 },
        ],
        dispositionRoll: { neutral: 0.5, friendly: 0.3, wary: 0.2 },
        narrativeNotes: 'Reclaimers know about this room. They visit but haven\'t extracted everything yet — the data is partially corrupted and reconstruction takes time.',
      },
    ],
    itemSpawns: [
      { entityId: 'electronics_salvage', spawnChance: 0.80, quantity: { min: 2, max: 4, distribution: 'flat' }, conditionRoll: { min: 0.2, max: 0.6 } },
      { entityId: 'crafting_components', spawnChance: 0.60, quantity: { min: 1, max: 3, distribution: 'weighted_low' } },
      { entityId: 'signal_decode_partial', spawnChance: 0.45, quantity: { min: 1, max: 1, distribution: 'single' } },
      { entityId: 'wire_coil', spawnChance: 0.50, quantity: { min: 1, max: 2, distribution: 'flat' } },
    ],
    extras: [
      {
        keywords: ['servers', 'racks', 'hardware', 'equipment'],
        description: 'Pre-Collapse enterprise hardware — the same generation as the Reclaimers\' salvaged equipment, but this was here from the start. The suppression foam preserved it from fire and slowed oxidation. Most of it is non-functional. Some of it is recoverable with the right tools. All of it is interesting to anyone who knows what they\'re looking at.',
        skillCheck: { skill: 'electronics', dc: 11, successAppend: 'Two of the dead racks are recoverable — the components are intact, just unpowered. If you had a way to transport and power them, the Reclaimers would pay significantly for the hardware. More interesting: the rack labels. This isn\'t a corporate data center. The labels read: MERIDIAN EDGE NODE — METRO DISTRIBUTION — DO NOT DECOMMISSION WITHOUT AUTHORIZATION. This was part of the MERIDIAN network.' },
      },
      {
        keywords: ['hum', 'active', 'units', 'power', 'running'],
        description: 'The three active units draw from a UPS bank that should have died years ago — someone replaced the batteries. Recently, from the casing condition. The active units are running a process you can\'t identify from the indicator lights alone. Whatever it\'s doing, it hasn\'t stopped doing it. The UPS has maybe six months left before those batteries fail too.',
        skillCheck: { skill: 'electronics', dc: 13, successAppend: 'You jack a terminal into the maintenance port. The system is running a single job: data integrity verification across a distributed archive. It\'s been running since 2031. The progress bar reads 94.7%. It has been at 94.7% for three years. Something in the remaining 5.3% is corrupted beyond local repair — the system is looping on it, unable to complete, unable to stop. The archive it\'s verifying is labeled: MERIDIAN CORE — PERSONNEL AND RESEARCH.' },
        questFlagOnSuccess: { flag: 'found_meridian_edge_node', value: true },
        reputationGrant: { faction: 'reclaimers', delta: 1 },
      },
      {
        keywords: ['suppression', 'foam', 'crust', 'fire'],
        description: 'The fire suppression system discharged fully at some point — the foam is everywhere, dried to an off-white crust that crunches underfoot. It preserved the hardware from a fire that must have started above and never reached this level. The foam also preserved something else: footprints, dried into the crust, from multiple people. Old. Some of the prints are bare feet. That detail is hard to contextualize in a way that doesn\'t unsettle you.',
      },
    ],
    hollowEncounter: {
      baseChance: 0.20,
      timeModifier: { day: 1.0, night: 1.0, dawn: 1.0, dusk: 1.0 },
      threatPool: [
        { type: 'shuffler', weight: 60, quantity: { min: 1, max: 2, distribution: 'weighted_low' } },
        { type: 'remnant', weight: 30, quantity: { min: 1, max: 1, distribution: 'single' } },
        { type: 'screamer', weight: 10, quantity: { min: 1, max: 1, distribution: 'single' } },
      ],
      awarenessRoll: { unaware: 0.2, awarePassive: 0.3, awareAggressive: 0.5 },
      activityPool: {
        shuffler: [
          { desc: 'A shuffler stands motionless in the server aisle, facing the humming units, as if listening.', weight: 3 },
          { desc: 'A shuffler moves between the racks in the dark, following the aisle, then turning, then following again.', weight: 2 },
        ],
      },
    },
    environmentalRolls: {
      ambientSoundPool: {
        day: [
          { sound: 'The three active units hum. The sound is regular. Almost rhythmic.', weight: 5 },
          { sound: 'Somewhere in the dead server racks, a relay ticks. Once. Silence.', weight: 2 },
          { sound: null, weight: 3 },
        ],
        night: [
          { sound: 'The hum from the northeast corner fills the silence. Down here, you can\'t tell what time it is.', weight: 5 },
          { sound: 'A ticking from somewhere in the foam crust — thermal expansion, maybe, or something moving under it.', weight: 3 },
        ],
      },
      ambientCount: { min: 1, max: 1, distribution: 'single' },
    },
    narrativeNotes: 'MERIDIAN edge node discovery. The corrupted archive detail connects to the Reclaimers\' server room and the MERIDIAN questline. The bare footprints in the foam are a creepy environmental detail — Hollow were here and stood looking at the humming servers. The quest flag connects to Lev\'s research.',
  },

  {
    id: 'st_13_underpass',
    name: 'The Underpass',
    zone: 'the_stacks',
    act: 2,
    difficulty: 3,
    visited: false,
    flags: { dark: true, combat_darkness: true, combat_narrow_passage: true },
    description: 'A parking structure collapsed cleanly across a city block and left a tunnel. Not engineered — fortunate. The ceiling is the underside of a concrete deck with rebar hanging through it in places, close enough to touch. The floor is the original street surface, now permanently damp from groundwater that found a new path when the building came down. The smell is standing water and mildew and something else: the particular sour-mineral smell of Hollow. They use this route. The passage is narrow enough that you move single file, and the darkness at the far end doesn\'t resolve until you\'re already committed.',
    descriptionNight: 'The Underpass at night is the same as the Underpass at any other time — no light penetrates from either end after dark. The sounds change: outside ambience drops to zero and you hear only the drip of water, the compression of the damp floor underfoot, and whatever is sharing the tunnel with you.',
    shortDescription: 'A tunnel through collapsed parking structure. Hollow territory. Shortcut.',
    exits: { north: 'st_01_approach', south: 'st_14_collapsed_lobby' },
    richExits: {
      north: {
        destination: 'st_01_approach',
        descriptionVerbose: 'north through the tunnel toward the Stacks approach',
        hidden: true,
        discoverSkill: 'perception',
        discoverDc: 10,
        discoverMessage: 'You notice disturbed debris at the base of the rubble wall — a gap, more than a gap, an entrance. Someone has widened it. The edges are worn smooth from use.',
      },
      south: {
        destination: 'st_14_collapsed_lobby',
        descriptionVerbose: 'south through the tunnel toward the collapsed lobby',
      },
    },
    items: [],
    enemies: ['shuffler', 'remnant'],
    npcs: [],
    itemSpawns: [
      { entityId: 'scrap_metal', spawnChance: 0.40, quantity: { min: 1, max: 2, distribution: 'flat' } },
      { entityId: 'ammo_22lr', spawnChance: 0.25, quantity: { min: 2, max: 6, distribution: 'bell' } },
      { entityId: 'torn_note_fragment', spawnChance: 0.35, quantity: { min: 1, max: 1, distribution: 'single' } },
    ],
    extras: [
      {
        keywords: ['water', 'drip', 'damp', 'groundwater', 'puddle'],
        description: 'The water is ankle-deep in one section and the source is a slow weep through a crack in the concrete above — groundwater displaced when the structure fell. It\'s cold and clear, not potable without treatment. The bottom is original asphalt, faded lane markings still visible under the water. You are walking on a road that is now the floor of a tunnel that shouldn\'t exist.',
      },
      {
        keywords: ['rebar', 'ceiling', 'concrete', 'hanging'],
        description: 'The rebar hanging from the deck above is a navigation hazard. Some of the longer pieces have been bent upward at their tips — by hand, carefully. Someone maintains this passage. Not the Hollow — the Hollow don\'t do careful. A scavenger with regular business in this tunnel has been trimming the hazards down to survivable.',
        skillCheck: { skill: 'perception', dc: 9, successAppend: 'One of the bent rebar pieces has a strip of cloth tied to it — orange, faded, fraying. A trail marker. There are more of them, at irregular intervals, all the way to the south end. Someone is marking a path through this tunnel for people who need to move fast in the dark.' },
      },
      {
        keywords: ['smell', 'hollow', 'scent', 'tracks', 'signs'],
        description: 'The Hollow smell here is unmistakable — the sour biological signature that means they pass through regularly. The tracks in the damp floor are consistent with shuffler movement patterns: the drag-step, the occasional full stop where one stood for a while. They use this shortcut. They may use it right now.',
        skillCheck: { skill: 'tracking', dc: 10, successAppend: 'The track patterns are instructive. Most Hollow movement goes south-to-north — into the zone, not through it. One set of tracks goes north-to-south and is different: longer stride, no drag. A remnant. Moving with purpose, not shuffling. Remnants retain more direction. This one was going somewhere specific to the south.' },
      },
    ],
    hollowEncounter: {
      baseChance: 0.45,
      timeModifier: { day: 0.8, night: 1.4, dawn: 1.0, dusk: 1.2 },
      threatPool: [
        { type: 'shuffler', weight: 55, quantity: { min: 1, max: 3, distribution: 'bell' } },
        { type: 'remnant', weight: 35, quantity: { min: 1, max: 2, distribution: 'weighted_low' } },
        { type: 'brute', weight: 10, quantity: { min: 1, max: 1, distribution: 'single' } },
      ],
      awarenessRoll: { unaware: 0.15, awarePassive: 0.25, awareAggressive: 0.60 },
      noiseModifier: 1.5,
      activityPool: {
        shuffler: [
          { desc: 'A shuffler stands in the middle of the tunnel, facing away from you, unmoving. The dripping water is the only sound.', weight: 3 },
          { desc: 'Two shufflers move in single file through the passage, headed north, not yet aware of you.', weight: 2 },
        ],
        remnant: [
          { desc: 'A remnant crouches beside the waterlogged section of floor, touching the surface with one hand, head tilted.', weight: 2 },
        ],
      },
    },
    environmentalRolls: {
      ambientSoundPool: {
        day: [
          { sound: 'Water drips from the ceiling. The interval is irregular. Somewhere ahead, something moves.', weight: 4 },
          { sound: 'The tunnel carries sound from both ends — you can hear the Stacks approach faintly to the north, the lobby space to the south. You can also hear something closer.', weight: 3 },
          { sound: null, weight: 3 },
        ],
        night: [
          { sound: 'Total dark. The water sounds are louder. Something at the far end stops moving.', weight: 5 },
          { sound: 'A low moan, distant, carries through the tunnel with the acoustics of a cathedral. It bounces once and dies.', weight: 3 },
        ],
      },
      ambientCount: { min: 1, max: 1, distribution: 'single' },
      flavorLines: [
        { line: 'The concrete overhead settles — a deep pop, then silence. The structure is still moving, slowly, the way large things do.', chance: 0.25, time: null },
        { line: 'The orange cloth markers are barely visible in the dark. You follow them anyway.', chance: 0.20, time: ['night'] },
      ],
    },
    narrativeNotes: 'The underpass is the high-danger shortcut of the zone. North exit is hidden — requires perception to find. Hollow encounter chance is high. The trail markers (perception check) imply a regular scavenger user — potentially a quest hook or recurring NPC. The remnant tracking detail hints at directed Hollow behavior.',
  },

  {
    id: 'st_14_collapsed_lobby',
    name: 'Collapsed Lobby',
    zone: 'the_stacks',
    act: 2,
    difficulty: 3,
    visited: false,
    flags: { scavengingZone: true, combat_collapsing: true },
    description: 'The atrium of a former office tower, thirty feet high at its peak and now half that, the upper floors driven down through the interior by the collapse. The scale is still legible — a grand entrance hall designed to impress people arriving for meetings that no longer exist. Marble flooring, most of it intact under a layer of rubble, catches light from the gaps in the collapsed roof. The reception desk is half-buried, the laminate surface split but the structure standing. Behind the desk, a building directory board hangs at an angle. Most of the tenant plaques are still in their slots. You can read some of them.',
    descriptionNight: 'At night the collapsed roof gaps become windows to the stars. Enough light comes through to navigate by. The marble reflects it faintly, the floor glowing a pale blue in the dark. The desk is a black shape. The directory is unreadable without a light. Something about the scale — the ceilings that were meant to make you feel the building\'s importance — makes the dark feel more absolute.',
    descriptionDawn: 'Dawn sends light through the eastern collapse gaps at a low angle that crosses the marble floor in orange bars. The building directory catches it and one name on the tenant list is briefly illuminated before the angle shifts: MERIDIAN SYSTEMS INC — FLOORS 14-22.',
    shortDescription: 'Former office tower atrium. Marble under rubble. Directory still readable.',
    exits: { west: 'st_11_upper_stacks', up: 'st_11_upper_stacks', down: 'st_12_server_room_remnant', north: 'st_13_underpass', east: 'st_01_approach', south: 'st_18_shelving_canyon' },
    richExits: {
      west: {
        destination: 'st_11_upper_stacks',
        descriptionVerbose: 'west along the elevated debris platform toward the upper stacks',
      },
      up: {
        destination: 'st_11_upper_stacks',
        descriptionVerbose: 'up onto the elevated platform',
        skillGate: { skill: 'climbing', dc: 8, failMessage: 'The rubble face shifts as you try to climb. You don\'t make it. The ramp is more stable.' },
      },
      down: {
        destination: 'st_12_server_room_remnant',
        descriptionVerbose: 'down the stairwell into the basement server room',
        hidden: true,
        discoverSkill: 'perception',
        discoverDc: 11,
        discoverMessage: 'Behind the reception desk, mostly buried by debris, a stairwell door. The door is open — not forced, just open, the way a door left open in an emergency stays open. Below: the dark, and a faint hum.',
      },
      north: {
        destination: 'st_13_underpass',
        descriptionVerbose: 'north into the underpass tunnel',
      },
      east: {
        destination: 'st_01_approach',
        descriptionVerbose: 'east through the rubble field toward the Stacks approach',
      },
      south: {
        destination: 'st_18_shelving_canyon',
        descriptionVerbose: 'south through a gap in the rubble into a corridor of collapsed shelving',
      },
    },
    items: ['lore_meridian_funding_data'],
    enemies: [],
    npcs: [],
    npcSpawns: [
      {
        npcId: 'reclaimer_craftsperson',
        spawnChance: 0.20,
        spawnType: 'wanderer',
        quantity: { min: 1, max: 1, distribution: 'single' },
        activityPool: [
          { desc: 'A Reclaimer craftsperson picks through the rubble near the desk, bagging salvage with methodical efficiency.', weight: 3 },
          { desc: 'A craftsperson photographs the building directory with a small camera, noting something in a field journal.', weight: 2 },
        ],
        dispositionRoll: { neutral: 0.5, friendly: 0.4, wary: 0.1 },
      },
      {
        npcId: 'scavenger_rival',
        spawnChance: 0.30,
        spawnType: 'wanderer',
        quantity: { min: 1, max: 2, distribution: 'weighted_low' },
        activityPool: [
          { desc: 'A scavenger works the rubble near the back wall, prying up marble tiles that aren\'t going anywhere useful but trying anyway.', weight: 2 },
          { desc: 'Two scavengers argue in low voices over something pulled from the debris — a bag between them, contents not visible.', weight: 2 },
        ],
        dispositionRoll: { neutral: 0.3, wary: 0.5, hostile: 0.2 },
      },
    ],
    itemSpawns: [
      { entityId: 'lore_meridian_funding_data', spawnChance: 0.60, quantity: { min: 1, max: 1, distribution: 'single' } },
      { entityId: 'scrap_metal', spawnChance: 0.65, quantity: { min: 1, max: 3, distribution: 'flat' } },
      { entityId: 'electronics_salvage', spawnChance: 0.35, quantity: { min: 1, max: 2, distribution: 'weighted_low' }, conditionRoll: { min: 0.1, max: 0.5 } },
      { entityId: 'discarded_flyer', spawnChance: 0.50, quantity: { min: 1, max: 2, distribution: 'flat' } },
      { entityId: 'border_patrol_log', spawnChance: 0.20, quantity: { min: 1, max: 1, distribution: 'single' } },
    ],
    extras: [
      {
        keywords: ['directory', 'board', 'tenants', 'plaques', 'names'],
        description: 'The building directory is a grid of brass plaques, most intact, listing company names and floor ranges. Law firms. Consulting companies. An accounting firm that occupied four floors. Financial services. The pre-Collapse economy, reduced to a list of who had nice offices. And near the top: MERIDIAN SYSTEMS INC — FLOORS 14-22. Nine floors. That\'s not a small office. That\'s a headquarters.',
        skillCheck: { skill: 'lore', dc: 9, successAppend: 'Meridian Systems. You\'ve heard the name in fragmented contexts — the broadcast, Lev\'s files, the comm center map. Seeing it on an office directory is different. They were here. In this city. In this building. Floors fourteen through twenty-two are now distributed horizontally across approximately four city blocks.' },
        questFlagOnSuccess: { flag: 'found_meridian_office_directory', value: true },
      },
      {
        keywords: ['desk', 'reception', 'counter', 'surface'],
        description: 'The reception desk is a long curve of engineered wood and laminate, the surface cracked down the middle by a falling beam that didn\'t quite reach the floor. Behind it, a cubbyhole system for key cards and messages, most empty, a few with envelopes still in them — never delivered. The envelopes are sealed. The names on them are pre-Collapse names of people who aren\'t coming back.',
        skillCheck: { skill: 'scavenging', dc: 10, successAppend: 'One of the envelopes has a keycard taped to the outside — security access, corporate-style, demagnetized by now. But the envelope beneath it contains a printed memo: FROM: MERIDIAN SYSTEMS SECURITY. TO: BUILDING MANAGEMENT. RE: ADDITIONAL SECURITY PROTOCOLS FLOOR 14+. The memo is dated two months before the Collapse. They were worried about something.' },
      },
      {
        keywords: ['marble', 'floor', 'tiles', 'stone'],
        description: 'Real marble — not composite, not imitation. The floor of this lobby was an expense that communicated something specific about the company behind the desk. Most of it survived the collapse intact, protected by the weight of the rubble above it. The patterns are still visible: geometric, precise. This cost money. Meridian Systems had money.',
      },
      {
        keywords: ['gaps', 'roof', 'light', 'collapse'],
        description: 'The collapsed upper floors created a broken ceiling that lets in light in bars and patches. Some of the steel beams are still attached at one end and angle down at forty-five degrees, creating an accidental architecture. The space is dangerous — the structure is not stable — but the light makes it navigable. For now.',
      },
    ],
    hollowEncounter: {
      baseChance: 0.15,
      timeModifier: { day: 0.6, night: 1.3, dawn: 0.8, dusk: 1.0 },
      threatPool: [
        { type: 'shuffler', weight: 70, quantity: { min: 1, max: 2, distribution: 'weighted_low' } },
        { type: 'remnant', weight: 30, quantity: { min: 1, max: 1, distribution: 'single' } },
      ],
      awarenessRoll: { unaware: 0.4, awarePassive: 0.35, awareAggressive: 0.25 },
    },
    environmentalRolls: {
      flavorLines: [
        { line: 'The marble floor amplifies every footstep. In this space, you sound larger than you are.', chance: 0.30, time: null },
        { line: 'A beam shifts somewhere overhead — a low groan, a trickle of dust, then stillness.', chance: 0.20, time: null },
        { line: 'Dawn light catches the building directory at an angle and briefly illuminates the Meridian Systems plaque.', chance: 0.40, time: ['dawn'] },
        { line: 'At night, the lobby gaps show stars. The atrium was designed to inspire. It still does, just differently.', chance: 0.35, time: ['night'] },
      ],
    },
    narrativeNotes: 'Hub room for the outer Stacks geography. The building directory is a key MERIDIAN discovery — confirms corporate presence in this city pre-Collapse. The reception desk skill check (the security memo) implies Meridian was preparing for something two months before the Collapse. The stairwell down to the server room remnant is hidden — requires perception to find. Dawn description text illuminating the Meridian plaque is a passive lore delivery that rewards early-morning play.',
  },

  {
    id: 'st_15_preservation_vault',
    name: 'The Stacks — Preservation Vault',
    zone: 'the_stacks',
    act: 2,
    difficulty: 3,
    visited: false,
    flags: { dark: true, noCombat: true },
    description: 'Below the library, sealed behind a combination lock that the Reclaimers never changed from its factory setting, the preservation vault maintains a steady fifty-five degrees and eighteen percent humidity through a desiccant system that someone understood well enough to rebuild from industrial parts. The room is narrow and deep — twenty feet by sixty — with climate-controlled cases lining both walls and a central aisle barely wide enough for two people to pass. Inside the cases: pre-Collapse manuscripts, university press runs, government documents in acid-free folders, and a sealed glass cabinet at the far end containing three items that Lev considers more valuable than anything else in the Stacks. The silence here has a specific quality — the silence of a room designed to preserve things that outlast the people who made them.',
    descriptionNight: 'The vault at night is identical to the vault at any other hour — no external light reaches it, no ambient sound penetrates. The desiccant system clicks through its cycle. The climate cases hold steady. The three items in the sealed cabinet at the far end catch the beam of your light and hold it the way old paper holds ink: completely.',
    shortDescription: 'Preservation vault. Climate-controlled. Rare documents. Sealed cabinet.',
    exits: { up: 'st_06_library' },
    richExits: {
      up: { destination: 'st_06_library', descriptionVerbose: 'up the stairs to the library' },
    },
    items: [],
    enemies: [],
    npcs: [],
    itemSpawns: [
      { entityId: 'lore_meridian_r1_research', spawnChance: 0.40, quantity: { min: 1, max: 1, distribution: 'single' } },
      { entityId: 'chemicals_basic', spawnChance: 0.30, quantity: { min: 1, max: 1, distribution: 'single' } },
    ],
    extras: [
      {
        keywords: ['cases', 'documents', 'manuscripts', 'collection'],
        description: 'The cases are repurposed commercial display units, retrofitted with gasket seals and silica gel packs that someone replaces on a rotating schedule — you can see the replacement log taped inside each case, dates going back four years. The documents inside span three centuries of printed material. Most of it is academic: biology, virology, genetic modification, public health policy. The collection isn\'t random. Someone built a research library for the end of the world and knew exactly which subjects would matter.',
        skillCheck: { skill: 'lore', dc: 10, successAppend: 'The collection has a bias. Eighty percent of the material is directly relevant to CHARON-7 research — virology, gain-of-function debate, military biodefense programs, and a complete run of the Journal of Emerging Infectious Diseases from 2025 to 2031. Lev didn\'t build a general archive. Lev built the bibliography for a specific question.' },
      },
      {
        keywords: ['cabinet', 'sealed', 'glass', 'three', 'items', 'valuable'],
        description: 'The sealed glass cabinet at the far end is newer than everything else in the vault — built specifically for these three items. Inside: a leather-bound journal with no title, a USB drive in a static-proof case labeled CS-R1 SEQUENCING DATA — COMPLETE, and a sealed envelope addressed to no one, with the MERIDIAN PROJECT seal on the flap. The journal\'s pages are visible through the glass. Dense handwriting. Diagrams. The handwriting matches Lev\'s.',
        skillCheck: { skill: 'electronics', dc: 12, successAppend: 'The USB drive label is specific: CS-R1, not CS-R8. R-1 is the Sanguine strain — the prototype, the success. Complete sequencing data for the virus that made the Sanguine what they are. This is the single most valuable scientific artifact in the Four Corners and it is sitting in a glass case in a basement because Lev does not trust it to be anywhere else.' },
        questFlagOnSuccess: { flag: 'found_r1_sequencing_data', value: true },
        reputationGrant: { faction: 'reclaimers', delta: 1 },
      },
      {
        keywords: ['humidity', 'climate', 'desiccant', 'temperature', 'system'],
        description: 'The climate system is elegant in its simplicity — passive desiccant canisters on a rotation cycle, insulation rated for underground installation, and a single low-draw electric fan that circulates air through the desiccant bed. The system consumes almost no power. It could run for decades. That\'s the point. Whoever designed this was building for the possibility that no one would maintain it.',
        skillCheck: { skill: 'mechanics', dc: 9, successAppend: 'The desiccant canisters are military surplus — the same type used in long-term weapons storage. The insulation is spray-foam rated for nuclear bunker specification. Someone with very specific procurement access built this vault before the Stacks was the Stacks. The vault was here first. The Reclaimers found it and built around it.' },
      },
      {
        keywords: ['envelope', 'sealed', 'letter', 'MERIDIAN'],
        description: 'The envelope is heavy stock, cream-colored, sealed with the MERIDIAN PROJECT embossed wax seal — the caduceus-and-helix design you\'ve seen elsewhere. No addressee. No return address. The paper has yellowed slightly at the edges but the seal is intact. Whatever is inside has not been read since it was sealed. Lev has not opened it. That restraint tells you something about Lev.',
      },
    ],
    personalLossEchoes: {
      child: 'The silence of the vault is the silence of things designed to outlast the people who made them. You think about the things you made for them — not documents, not data, but the small constructions of a childhood: safety, routine, the daily architecture of being kept alive. None of it was preserved. None of it was climate-controlled. It was just you, doing it, until you couldn\'t.',
      partner: 'The sealed envelope addressed to no one. The MERIDIAN seal on the flap. You think about the letters you never sent — the things you meant to say, the words you were saving for a moment that didn\'t come. Lev didn\'t open the envelope. You understand the restraint. Some things stay sealed because opening them is the end of a possibility.',
      community: 'Someone built a research library for the end of the world and knew exactly which subjects would matter. The foresight of it — the community that would need this knowledge, planned for before the community existed. Your community didn\'t have a vault. Your community had people, and they were enough, until they weren\'t.',
      identity: 'The leather-bound journal in the sealed cabinet. Dense handwriting. Diagrams. The handwriting matches Lev\'s. A person\'s handwriting is their identity on paper — the pressure, the slant, the character of the marks. You don\'t know what your handwriting looks like. You don\'t know if you would recognize it.',
      promise: 'Three items Lev considers more valuable than anything else in the Stacks. Kept under glass. The vault is a promise — to the future, to whoever comes next, to the idea that knowledge survives. Your promise is smaller and more personal and you carry it without glass or climate control, just the weight of it in your chest, still there, still intact.',
    },
    narrativeNotes: 'The vault is a significant lore cache. The R-1 sequencing data USB is one of the most important items in the game — it connects to the Sanguine questline and the MERIDIAN endgame. The sealed envelope is a deliberate mystery object. The vault-was-here-first detail (mechanics check) implies MERIDIAN pre-positioned this archive before the Collapse.',
  },

  {
    id: 'st_16_reading_room',
    name: 'The Stacks — Reading Room',
    zone: 'the_stacks',
    act: 2,
    difficulty: 2,
    visited: false,
    flags: { safeRest: true, campfireAllowed: true },
    description: 'A former conference room converted into something gentler — six mismatched reading desks arranged around a central lamp, each desk occupied by the evidence of ongoing study. Open books weighted with river stones, annotated printouts in neat stacks, pencils in jars, a thermos that still smells like chicory substitute. The carpet is industrial gray but someone laid a woven rug over the worst of it, and the effect is a room that feels inhabited in a way the rest of the Stacks does not. People don\'t just work here. They stay. There are blankets folded on two of the chairs. Someone sleeps here rather than go to assigned quarters, and nobody has told them not to.',
    descriptionNight: 'At night the reading room is the quietest place in the Stacks — the central lamp runs low, casting a warm circle that doesn\'t reach the walls. A researcher sleeps in the corner chair with a blanket pulled to their chin and a book open on their chest. The room holds the specific domestic warmth of a place where people have decided to be comfortable despite everything.',
    shortDescription: 'Reading room. Warm. Occupied. Safe rest.',
    exits: { east: 'st_06_library', south: 'st_17_data_archive' },
    richExits: {
      east: { destination: 'st_06_library', descriptionVerbose: 'east back to the main library' },
      south: { destination: 'st_17_data_archive', descriptionVerbose: 'south into the data archive annex' },
    },
    items: [],
    enemies: [],
    npcs: [],
    npcSpawns: [
      {
        npcId: 'reclaimer_technician',
        spawnChance: 0.60,
        spawnType: 'anchored',
        quantity: { min: 1, max: 2, distribution: 'weighted_low' },
        activityPool: [
          { desc: 'A researcher reads with the focused intensity of someone who believes the answer is in the next paragraph.', weight: 3 },
          { desc: 'A Reclaimer sits at the desk making careful pencil notes in the margin of a photocopied technical paper, their handwriting small and precise.', weight: 3 },
          { desc: 'A technician sleeps in the corner chair, their breathing slow and even, a dog-eared virology textbook still open in their lap.', weight: 2, timeRestrict: ['night', 'dusk'] },
        ],
        dispositionRoll: { friendly: 0.35, neutral: 0.55, wary: 0.10 },
      },
    ],
    itemSpawns: [
      { entityId: 'boiled_rations', spawnChance: 0.50, quantity: { min: 1, max: 2, distribution: 'flat' } },
      { entityId: 'water_bottle_sealed', spawnChance: 0.40, quantity: { min: 1, max: 1, distribution: 'single' } },
    ],
    extras: [
      {
        keywords: ['desks', 'books', 'study', 'work', 'reading'],
        description: 'Six desks, six ongoing research projects. One is cross-referencing pre-Collapse CDC outbreak reports with the CHARON-7 timeline. Another is reconstructing a water treatment protocol from fragments of three different engineering manuals. A third has nothing but personal diaries stacked in chronological order with small colored tabs marking specific entries. The work here is slow and careful and human. It is the opposite of the Collapse.',
        skillCheck: { skill: 'lore', dc: 8, successAppend: 'The diary project catches your eye. The tabs are color-coded: red for Collapse-day entries, blue for first sightings of the Hollow, green for first contact with the Sanguine. Someone is building a civilian timeline of the end of the world, one personal account at a time. The project has been running for two years.' },
      },
      {
        keywords: ['rug', 'blankets', 'comfort', 'home', 'warmth'],
        description: 'The woven rug is handmade — someone in the Stacks knows how to weave. The blankets are clean, folded carefully, the kind of care people take with soft things when soft things are rare. The thermos on the center desk has a chip in the rim and someone has written LEV\'S — DO NOT WASH on the bottom in permanent marker. The reading room is what happens when people build a library and then decide it isn\'t enough — they needed a home inside the home.',
      },
      {
        keywords: ['thermos', 'chicory', 'drink', 'coffee'],
        description: 'Chicory root, roasted and ground, brewed strong. The smell is close enough to coffee that your body responds before your brain corrects it. The Reclaimers grow chicory in their small greenhouse — one of the few luxuries they maintain. Lev\'s thermos is refilled daily. It is, by some measures, the most human artifact in the entire Stacks.',
      },
      {
        keywords: ['child', 'kid', 'young', 'reading', 'corner'],
        description: 'In the far corner, curled into the chair nearest the lamp, a child reads with the complete absorption that only children and researchers achieve. The book is too advanced for their age — a field guide to regional botany, illustrated, the kind of text that assumes adult literacy. They are reading it anyway, one finger tracing the illustrations, mouthing the Latin names with the careful concentration of someone learning a language they have decided to learn. A blanket has been folded under them to raise the seat height. Someone adjusted this chair for them. Someone in the Stacks decided that a child reading botany in the warm light of a repurposed lamp is worth accommodating.',
      },
      {
        keywords: ['lamp', 'light', 'central', 'glow'],
        description: 'The lamp is a repurposed industrial work light with a dimmer switch wired in by someone who understood that not all light needs to be bright. At its lowest setting it produces the warm amber glow of something that existed before LEDs, before fluorescents, before the particular harshness of light designed for productivity. This light was designed for reading. Someone thought about that.',
        skillCheck: { skill: 'electronics', dc: 7, successAppend: 'The dimmer is hand-soldered — clean work, the kind that suggests the person who did it could have built something more impressive but chose to build something kind instead. The lamp draws twelve watts. In a facility that generates kilowatts, that\'s nothing. But someone still took the time.' },
      },
    ],
    environmentalRolls: {
      flavorLines: [
        { line: 'The reading room is warm. The lamp hums at its lowest setting. For a moment, nothing is wrong.', chance: 0.30, time: ['night'] },
        { line: 'A page rustles somewhere — paper settling in the warmth, or the draft from the door you just opened. The sound dissolves into the room\'s quiet.', chance: 0.25, time: null },
      ],
    },
    personalLossEchoes: {
      child: 'The blankets folded on two of the chairs. Someone sleeps here rather than go to assigned quarters. The domestic stubbornness of it — the refusal to sleep in the place designed for sleeping, the preference for this warmer, kinder room. You made a room like this once. Small, warm, full of the evidence of being lived in. They slept in it. You checked on them at night.',
      partner: 'The thermos that still smells like chicory substitute. LEV\'S — DO NOT WASH. The possessiveness of a favorite object. You had things like this with them — claimed items, shared jokes written on the bottom of cups, the small territorial markings of two people occupying the same life. The thermos is chipped at the rim. You didn\'t throw those things away either.',
      community: 'Six desks, six ongoing research projects. People don\'t just work here — they stay. The woven rug, the blankets, the warm lamp. Someone built a home inside a home. Your community did this too — turned a place into something more than shelter, made it a location where people wanted to be, not just where they had to be.',
      identity: 'The diary project: red tabs for Collapse-day entries, blue for first Hollow sightings, green for first Sanguine contact. Someone is building a civilian timeline of the end of the world, one personal account at a time. Your account is missing. Your entry in the record is a blank space in the shape of a person who can\'t remember what color tab their story would get.',
      promise: 'The lamp draws twelve watts. Someone took the time to make it kind instead of bright. The reading room is a promise kept — the promise that knowledge matters, that comfort matters, that a warm room with a good light is worth building even now. Your promise is different. But you sit in this light and it feels like the same kind of thing.',
    },
    narrativeNotes: 'Safe rest room in the Stacks zone. The warmth and domesticity are deliberate contrast to the facility\'s clinical tone. The diary research project is a lore thread. Lev\'s thermos is a character detail. This room exists to make the player feel something specific about the Reclaimers: they are people first.',
  },

  {
    id: 'st_17_data_archive',
    name: 'The Stacks — Data Archive Annex',
    zone: 'the_stacks',
    act: 2,
    difficulty: 3,
    visited: false,
    flags: { scavengingZone: true, dark: true, combat_darkness: true, combat_narrow_passage: true },
    description: 'The annex was a storage room before the Reclaimers converted it, and the conversion shows — bare cinderblock walls, no windows, a single overhead strip light that flickers at a frequency designed to produce migraines. The shelves here hold hard drives, tape backups, optical media, and a section of hand-labeled floppy disks that somebody recovered from a government office and hasn\'t been able to read yet because the drives don\'t exist anymore. The Reclaimers estimate they have recovered twelve terabytes of pre-Collapse data and have processed roughly nine percent of it. The other ninety-one percent waits on these shelves, each drive a sealed room full of things that might matter enormously or might be someone\'s vacation photographs.',
    descriptionNight: 'The archive at night is darker than the rest of the Stacks — the strip light dies at eleven and nobody has fixed the timer. In the dark the drives are just shapes on shelves. The data they contain is the same whether the light works or not, which is either a comfort or a philosophical problem depending on how long you\'ve been down here.',
    shortDescription: 'Data archive. Twelve terabytes of unprocessed history.',
    exits: { north: 'st_16_reading_room', east: 'st_20_map_room' },
    richExits: {
      north: { destination: 'st_16_reading_room', descriptionVerbose: 'north back to the reading room' },
      east: {
        destination: 'st_20_map_room',
        descriptionVerbose: 'east through a connecting passage to the map room',
        hidden: true,
        discoverSkill: 'perception',
        discoverDc: 10,
        discoverMessage: 'Behind the last shelf unit, the cinderblock wall has a section that doesn\'t match — newer mortar, different color. Someone bricked over a doorway. The mortar is crumbling. The doorway is accessible.',
      },
    },
    items: [],
    enemies: [],
    npcs: [],
    npcSpawns: [
      {
        npcId: 'reclaimer_technician',
        spawnChance: 0.35,
        spawnType: 'anchored',
        quantity: { min: 1, max: 1, distribution: 'single' },
        activityPool: [
          { desc: 'A technician works at a portable terminal connected to a drive cradle, scrolling through file directories with the patient intensity of an archaeologist.', weight: 3 },
          { desc: 'A Reclaimer catalogues drives by hand, writing index cards with a pencil stub, checking each label twice before shelving.', weight: 2 },
        ],
        dispositionRoll: { neutral: 0.6, friendly: 0.3, wary: 0.1 },
      },
    ],
    itemSpawns: [
      { entityId: 'electronics_salvage', spawnChance: 0.65, quantity: { min: 1, max: 3, distribution: 'weighted_low' }, conditionRoll: { min: 0.3, max: 0.8 } },
      { entityId: 'signal_decode_partial', spawnChance: 0.30, quantity: { min: 1, max: 1, distribution: 'single' } },
      { entityId: 'wire_coil', spawnChance: 0.40, quantity: { min: 1, max: 1, distribution: 'flat' } },
      { entityId: 'crafting_components', spawnChance: 0.35, quantity: { min: 1, max: 2, distribution: 'weighted_low' } },
    ],
    extras: [
      {
        keywords: ['drives', 'hard drives', 'storage', 'data', 'shelves'],
        description: 'The drives are organized by source location: CROSSROADS MUNICIPAL, HOSPITAL EAST, UNIVERSITY CS DEPT, MERIDIAN METRO OFFICE (3 drives, flagged with red tape), NM STATE POLICE, CDC FIELD OFFICE (2 drives, also flagged). The flagged drives are on a separate shelf with a sign: DO NOT PROCESS WITHOUT LEV PRESENT. The distinction implies some data is dangerous to know without context.',
        skillCheck: { skill: 'electronics', dc: 11, successAppend: 'You check the directory listing on the CDC field office drive. The files are partially corrupted but the folder structure is intact: /outbreak_tracking/, /personnel_deployment/, /meridian_liaison/, and a folder called /contingency_orders/ that is encrypted with a key length that suggests whoever locked it expected it to stay locked. The Reclaimers haven\'t cracked it. Nobody has.' },
        questFlagOnSuccess: { flag: 'found_cdc_encrypted_files', value: true },
      },
      {
        keywords: ['floppy', 'disks', 'government', 'old', 'media'],
        description: 'Thirty-seven floppy disks in a sealed bag, each labeled in government shorthand: DOE-MRDN-01 through DOE-MRDN-37. Department of Energy, MERIDIAN series. The drives that read these haven\'t been manufactured since 2015. The Reclaimers have been looking for a working unit for two years. Whatever is on these disks is old enough to predate CHARON-7 by a decade. That makes it either irrelevant or foundational, and in Lev\'s estimation, the latter.',
      },
      {
        keywords: ['tape', 'backups', 'optical', 'media types'],
        description: 'The tape backups are LTO-8 format — enterprise grade, high-density. Each tape holds twelve terabytes compressed. The Reclaimers have four functional tape drives and a queue of eighty-three tapes waiting to be read. At current processing speed, the queue will take six years. The data will outlast the people reading it. That\'s the fundamental problem of preservation: you can save everything and still not have enough time.',
      },
      {
        keywords: ['light', 'flicker', 'strip', 'overhead'],
        description: 'The strip light flickers because the ballast is dying — a known issue, replacement parts sourced but not yet installed. The Reclaimers have priorities and a flickering light in a storage room is not one of them. The frequency of the flicker is roughly eight hertz, which is close enough to the photosensitive seizure threshold that a warning sign has been taped to the door. Someone thought about that. Someone thinks about everything here.',
        skillCheck: { skill: 'mechanics', dc: 8, successAppend: 'You could fix this in ten minutes with the parts on the shelf by the door. The ballast is standard T8 fluorescent, common enough that three spares are sitting in a bin labeled LIGHTING. Nobody has fixed it because nobody has had ten free minutes. That tells you everything about the Reclaimers\' workload.' },
      },
    ],
    narrativeNotes: 'Scavenging hub for electronics and data. The CDC encrypted files are a significant lore gate — the contingency orders folder connects to the military questline. The DOE floppy disks predate CHARON-7 and imply Department of Energy involvement in MERIDIAN\'s origins. The hidden passage to the map room rewards exploration.',
  },

  {
    id: 'st_18_shelving_canyon',
    name: 'Collapsed Shelving Canyon',
    zone: 'the_stacks',
    act: 2,
    difficulty: 3,
    visited: false,
    flags: { scavengingZone: true, dark: true, combat_narrow_passage: true, combat_collapsing: true },
    description: 'The public library wing of the complex collapsed unevenly — the ceiling buckled but held, the walls bowed inward, and the industrial metal shelving units that once held the municipal collection fell in a domino pattern that created a narrow canyon of steel and paper. The passage through them is single-file, bent at angles where the shelves met obstacles and folded rather than toppled. Books are everywhere — compressed into strata, pulped by water damage, fused into bricks of paper by years of humidity and pressure. The smell is mildew and rust and the particular sweetness of decomposing cellulose. Somewhere in the compressed mass, spines are still legible. Titles surface like fossils in sediment.',
    descriptionNight: 'At night the shelving canyon is absolute dark. Your light catches the metal edges of shelf frames and the pallid surfaces of compressed paper. The shadows move when you move. The canyon makes sounds at night — the slow complaint of metal under sustained load, the papery whisper of compressed books settling deeper into their own weight.',
    shortDescription: 'Collapsed shelving. Narrow passage. Books compressed into strata.',
    exits: { north: 'st_14_collapsed_lobby', south: 'st_19_basement_records', east: 'st_20_map_room' },
    richExits: {
      north: { destination: 'st_14_collapsed_lobby', descriptionVerbose: 'north through the canyon back to the collapsed lobby' },
      south: {
        destination: 'st_19_basement_records',
        descriptionVerbose: 'south, down through a buckled floor section into the basement records',
        skillGate: { skill: 'climbing', dc: 9, failMessage: 'The floor section is unstable. You can see the basement below but can\'t find safe footing to descend.' },
      },
      east: { destination: 'st_20_map_room', descriptionVerbose: 'east through a cleared passage toward the map room' },
    },
    items: [],
    enemies: ['shuffler'],
    npcs: [],
    itemSpawns: [
      { entityId: 'scrap_metal', spawnChance: 0.70, quantity: { min: 1, max: 3, distribution: 'flat' } },
      { entityId: 'textiles', spawnChance: 0.45, quantity: { min: 1, max: 2, distribution: 'weighted_low' } },
      { entityId: 'lore_precollapse_survey', spawnChance: 0.25, quantity: { min: 1, max: 1, distribution: 'single' } },
    ],
    extras: [
      {
        keywords: ['books', 'titles', 'spines', 'collection', 'paper'],
        description: 'You read the spines you can reach: Introduction to Molecular Biology. Desert Ecology of the American Southwest. The Complete Works of someone whose name is water-damaged beyond recovery. A children\'s picture book, the cover illustration still bright — a rabbit in a garden, impossibly cheerful. The municipal collection was for everyone. The everyone it was for is mostly gone.',
        skillCheck: { skill: 'scavenging', dc: 9, successAppend: 'You work a book free from the compressed mass without tearing it — a hardcover, intact, titled CHARON PROJECT: ETHICAL REVIEW BOARD PROCEEDINGS, 2029. Not CHARON-7. Just CHARON. The project had a name before it had a number. This book predates the public record by two years. Lev would want this.' },
        questFlagOnSuccess: { flag: 'found_charon_ethics_proceedings', value: true },
      },
      {
        keywords: ['shelves', 'metal', 'steel', 'frames', 'canyon'],
        description: 'The shelving units are heavy-gauge steel, bolted to the floor and ceiling — or they were. The bolts held in some places and sheared in others, creating the angular topple pattern that formed the canyon. The metal is sound. The Reclaimers haven\'t salvaged it because extraction would collapse the passage. The shelves are structural now. Remove them and the ceiling follows.',
        skillCheck: { skill: 'mechanics', dc: 10, successAppend: 'The load distribution is precarious but calculable. Three specific shelf units are bearing the ceiling\'s weight. The rest are deadfall. With the right tools you could extract the non-load-bearing units for steel salvage — roughly four hundred pounds of clean angle iron. Someone has already marked two of them with chalk. A Reclaimer engineer came to the same conclusion.' },
      },
      {
        keywords: ['smell', 'mildew', 'water', 'damage', 'decay'],
        description: 'The decomposition smell is strongest in the center section where a roof leak has been feeding the paper mass for years. The water damage created a microecology — mold colonies in visible patches of blue-green and black, the paper turning to mulch where the moisture is worst. The biology is active. This section of the canyon is, in a real sense, composting. The municipal library is becoming soil.',
        skillCheck: { skill: 'field_medicine', dc: 9, successAppend: 'The black mold is Stachybotrys — toxic spore load, respiratory hazard with prolonged exposure. The blue-green is Penicillium, which is less dangerous and more interesting. A Shepherd or a medic with the right equipment could culture the Penicillium into something useful. The apocalypse grows its own medicine if you know where to look.' },
      },
      {
        keywords: ['passage', 'narrow', 'path', 'squeeze'],
        description: 'The passage through the canyon is eighteen inches wide at its narrowest — sideways only, gear catching on shelf edges, the compressed paper walls close enough to feel their damp exhalation on your face. Claustrophobia is a luxury you cannot afford. The passage opens and closes as the shelf angles shift. Two hundred feet of it. The Reclaimers marked the route with reflective tape at ankle height, visible only if you\'re looking down, which in a passage this narrow you are.',
      },
    ],
    hollowEncounter: {
      baseChance: 0.25,
      timeModifier: { day: 0.7, night: 1.5, dawn: 0.9, dusk: 1.2 },
      threatPool: [
        { type: 'shuffler', weight: 65, quantity: { min: 1, max: 2, distribution: 'weighted_low' } },
        { type: 'remnant', weight: 25, quantity: { min: 1, max: 1, distribution: 'single' } },
        { type: 'screamer', weight: 10, quantity: { min: 1, max: 1, distribution: 'single' } },
      ],
      awarenessRoll: { unaware: 0.3, awarePassive: 0.3, awareAggressive: 0.4 },
      noiseModifier: 1.4,
      activityPool: {
        shuffler: [
          { desc: 'A shuffler stands wedged between two shelf frames, motionless, paper debris clinging to its clothes.', weight: 3 },
          { desc: 'A shuffler pushes through the narrow passage ahead of you, dislodging books that fall with soft wet sounds.', weight: 2 },
        ],
      },
    },
    environmentalRolls: {
      ambientSoundPool: {
        day: [
          { sound: 'Metal groans somewhere in the shelf structure — the slow adjustment of weight, ongoing, never quite finished.', weight: 4 },
          { sound: 'A book falls from somewhere above, landing with a flat thud. Then silence.', weight: 3 },
          { sound: null, weight: 3 },
        ],
        night: [
          { sound: 'The canyon speaks at night — steel contracting in the cold, paper settling, the architecture of the collapse still finding its final shape.', weight: 5 },
          { sound: 'Something moves deeper in the shelves. The sound carries oddly — close, then not close.', weight: 3 },
        ],
      },
      ambientCount: { min: 1, max: 1, distribution: 'single' },
    },
    narrativeNotes: 'The shelving canyon is the exploration-oriented room of the new set. The CHARON ethics proceedings book (predating CHARON-7 by two years) is a significant lore find. The Penicillium detail connects to the Shepherd/medic questlines. The narrow passage creates atmospheric tension.',
  },

  {
    id: 'st_19_basement_records',
    name: 'Basement Records',
    zone: 'the_stacks',
    act: 2,
    difficulty: 3,
    visited: false,
    flags: { dark: true, scavengingZone: true, combat_darkness: true },
    description: 'The basement of the municipal complex stored what basements always store — the things that matter but not enough to see daylight. Filing cabinets in rows that extend beyond your light, standing in four inches of black water that came in through a crack in the foundation and never left. The water is cold and still and the smell is the mineral smell of standing groundwater and the iron smell of rusting steel. The filing cabinets are labeled by department and year, the labels printed on card stock that has curled and yellowed but remains legible. Public Works. Health Department. City Planning. Police. And at the far end of the third row, a cabinet that has been pried open recently — the water around it disturbed, the lock drilled out with a precision that suggests battery-powered tools and a specific purpose.',
    descriptionNight: 'The basement records don\'t change at night. The water is the same temperature. The dark is the same dark. Your light finds the same filing cabinets in their same patient rows, waiting to be read by a civilization that has other priorities now. The drilled cabinet at the far end is the only evidence that someone has been here since the water came in.',
    shortDescription: 'Flooded basement. Filing cabinets. Someone drilled one open recently.',
    exits: { up: 'st_18_shelving_canyon' },
    richExits: {
      up: {
        destination: 'st_18_shelving_canyon',
        descriptionVerbose: 'up through the buckled floor into the shelving canyon',
      },
    },
    items: [],
    enemies: ['shuffler'],
    npcs: [],
    itemSpawns: [
      { entityId: 'scrap_metal', spawnChance: 0.50, quantity: { min: 1, max: 2, distribution: 'flat' } },
      { entityId: 'meridian_personnel_file_partial', spawnChance: 0.30, quantity: { min: 1, max: 1, distribution: 'single' } },
      { entityId: 'bandages', spawnChance: 0.25, quantity: { min: 1, max: 1, distribution: 'single' } },
    ],
    extras: [
      {
        keywords: ['cabinets', 'files', 'records', 'departments', 'labels'],
        description: 'The filing cabinets are government-issue steel, four-drawer, built to outlast the bureaucracy that filled them. Most drawers still open, though the water has fused some of the contents into solid blocks. The Health Department files are the most damaged — bottom drawers submerged entirely. The City Planning files on the upper drawers are mostly dry. The mundane records of a city that functioned: zoning permits, building inspections, water main repair schedules. The normalcy of it is the hardest part.',
        skillCheck: { skill: 'scavenging', dc: 10, successAppend: 'The City Planning upper drawers contain building permits. You find one dated 2027, stamped APPROVED — EXPEDITED REVIEW: MERIDIAN SYSTEMS INC — SUBTERRANEAN FACILITY, SCAR VALLEY, NM. The permit is signed by a city official and counter-signed by someone from the Department of Defense. A weapons lab approved through a municipal building permit process. The mundane bureaucracy of atrocity.' },
        questFlagOnSuccess: { flag: 'found_meridian_building_permit', value: true },
      },
      {
        keywords: ['drilled', 'cabinet', 'pried', 'opened', 'lock'],
        description: 'The drilled cabinet is in the Police Department section, third row, second from the end. The lock was removed with a hole saw — clean, circular cut, professional work. Inside: the cabinet is empty. Every folder removed, the hanging file rails bare. Someone came down here with tools and a plan and took everything. The water disturbance around the cabinet suggests it happened within the last few weeks. The drill dust hasn\'t been washed away yet.',
        skillCheck: { skill: 'tracking', dc: 11, successAppend: 'Boot prints in the silt around the cabinet. Two people — one heavy, one lighter. The heavier one stood watch while the lighter one worked. The boot treads are distinctive: military surplus, the same brand the Salters issue. Warlord Briggs\'s people were here. They took the police files. The question is what was in the police files that Briggs needed to disappear.' },
      },
      {
        keywords: ['water', 'flooding', 'standing', 'cold', 'crack'],
        description: 'The water entered through a foundation crack on the east wall — you can see the mineral staining where the flow was heaviest. The crack is old. The water level has stabilized at four inches, a permanent feature now. Your feet go numb after ten minutes. The filing cabinets were not designed for submersion but the steel is holding. Another decade and they won\'t be. The rust is patient.',
        skillCheck: { skill: 'survival', dc: 8, successAppend: 'The water is groundwater, not surface runoff — it\'s clean enough to filter and drink in an emergency. The mineral content is high but not dangerous. The temperature is a steady forty-eight degrees. In a crisis, this basement is a water source. Cold, inconvenient, but real.' },
      },
      {
        keywords: ['police', 'department', 'law', 'enforcement'],
        description: 'The Police Department section occupies the entire third row — decades of case files, incident reports, personnel records. The pre-Collapse law enforcement archive of a small city that had normal problems before it had extraordinary ones. Most of the files are water-damaged beyond recovery. The ones that survived are on the upper drawers, and someone went through them recently — not the Salters, a different disturbance pattern. The Reclaimers, probably. Looking for the same things the Salters took.',
      },
    ],
    hollowEncounter: {
      baseChance: 0.20,
      timeModifier: { day: 1.0, night: 1.0, dawn: 1.0, dusk: 1.0 },
      threatPool: [
        { type: 'shuffler', weight: 80, quantity: { min: 1, max: 2, distribution: 'weighted_low' } },
        { type: 'remnant', weight: 20, quantity: { min: 1, max: 1, distribution: 'single' } },
      ],
      awarenessRoll: { unaware: 0.25, awarePassive: 0.35, awareAggressive: 0.40 },
      activityPool: {
        shuffler: [
          { desc: 'A shuffler stands in the water between rows, facing a cabinet, one hand resting on the handle. It hasn\'t opened it. It can\'t. It tries anyway.', weight: 3 },
          { desc: 'A shuffler wades slowly through the black water, the splashing sound preceding it by several seconds in the echo.', weight: 2 },
        ],
      },
    },
    environmentalRolls: {
      ambientSoundPool: {
        day: [
          { sound: 'Water laps against the filing cabinets when you move. The echo makes the room feel larger than it is.', weight: 4 },
          { sound: 'A drawer somewhere in the dark slides open on its own — thermal expansion, or the building settling, or something you don\'t want to name.', weight: 3 },
          { sound: null, weight: 3 },
        ],
        night: [
          { sound: 'The water is perfectly still. Your reflection in it is a stranger looking up from a dark floor.', weight: 4 },
          { sound: 'Dripping. Slow. Regular. The foundation crack is still feeding the room.', weight: 4 },
        ],
      },
      ambientCount: { min: 1, max: 1, distribution: 'single' },
    },
    narrativeNotes: 'The basement records room delivers two key revelations: the MERIDIAN building permit (municipal approval with DOD co-signature) and the Salters\' theft of police files (Briggs covering tracks). The standing water creates atmosphere and a minor survival resource. The Hollow activity detail (trying to open a cabinet) is a specific human-remnant behavior that reinforces the tragedy.',
  },

  {
    id: 'st_20_map_room',
    name: 'The Stacks — Map Room',
    zone: 'the_stacks',
    act: 2,
    difficulty: 2,
    visited: false,
    flags: { noCombat: true, questHub: true },
    description: 'Someone turned a storage closet into a cartography station and then the cartography station consumed two adjacent rooms. The walls are covered in maps — USGS topographic surveys, county road maps, hand-drawn route charts, satellite imagery printed on the Reclaimers\' plotter, and a massive central map of the Four Corners region with every known settlement, route, danger zone, and resource cache marked in a color-coded system that represents years of accumulated field intelligence. Pins with colored heads cluster at key locations. String connects related sites. The map is a living document, updated as new information arrives, and it is the single best picture of the post-Collapse world that exists anywhere.',
    descriptionNight: 'The map room at night is where the planners work — the people who think in distances and supply lines and travel times. A reading lamp illuminates the central map. Someone has added three new pins since this morning. The world keeps changing. The map tries to keep up.',
    shortDescription: 'Cartography station. The best map of the Four Corners.',
    exits: { west: 'st_18_shelving_canyon', north: 'st_17_data_archive' },
    richExits: {
      west: { destination: 'st_18_shelving_canyon', descriptionVerbose: 'west back through the shelving canyon' },
      north: {
        destination: 'st_17_data_archive',
        descriptionVerbose: 'north through the connecting passage to the data archive',
        hidden: true,
        discoverSkill: 'perception',
        discoverDc: 10,
        discoverMessage: 'The north wall has a section of newer drywall — behind it, a passage to the data archive. The Reclaimers know about it but haven\'t formalized the connection.',
      },
    },
    items: [],
    enemies: [],
    npcs: [],
    npcSpawns: [
      {
        npcId: 'reclaimer_craftsperson',
        spawnChance: 0.50,
        spawnType: 'anchored',
        quantity: { min: 1, max: 1, distribution: 'single' },
        activityPool: [
          { desc: 'A Reclaimer cartographer updates the central map with new data, moving pins with the deliberate precision of someone who knows that a pin in the wrong place could get someone killed.', weight: 3 },
          { desc: 'A craftsperson traces a route on the central map with their finger, calculating distances by counting grid squares under their breath.', weight: 2 },
        ],
        dispositionRoll: { neutral: 0.5, friendly: 0.4, wary: 0.1 },
        narrativeNotes: 'The cartographer is a potential source of route information and zone discovery hints. Friendly disposition can provide free map data.',
      },
    ],
    itemSpawns: [
      { entityId: 'lore_precollapse_survey', spawnChance: 0.55, quantity: { min: 1, max: 1, distribution: 'single' } },
      { entityId: 'meridian_tunnel_map', spawnChance: 0.15, quantity: { min: 1, max: 1, distribution: 'single' } },
    ],
    extras: [
      {
        keywords: ['central', 'map', 'four corners', 'pins', 'routes'],
        description: 'The central map is hand-drawn on plotter paper at approximately 1:50,000 scale — large enough to fill a wall, detailed enough to show individual buildings in settlements. The color code is posted beside it: GREEN = safe route, verified. RED = danger, confirmed Hollow presence. BLUE = water source. YELLOW = cache/supply. BLACK = do not enter. The black pins cluster in three locations: the Scar valley, the Deep mine entrance, and a third location in the Dust that you haven\'t visited yet.',
        skillCheck: { skill: 'lore', dc: 9, successAppend: 'The third black-pin cluster in the Dust is labeled in small handwriting: MERIDIAN SECONDARY SITE — FIELD STATION ECHO. Not on any other map you\'ve seen. Not mentioned in any document you\'ve read. The Reclaimers know about a second MERIDIAN facility and haven\'t told anyone. The pin was placed by Lev.' },
        questFlagOnSuccess: { flag: 'discovered_field_station_echo', value: true },
        reputationGrant: { faction: 'reclaimers', delta: 1 },
      },
      {
        keywords: ['USGS', 'topographic', 'surveys', 'geological'],
        description: 'The USGS surveys are pre-Collapse, printed on heavy stock, covering the full Four Corners region in overlapping quadrangles. The geological data is still valid — the Collapse didn\'t change the topography, only what lives on it. Someone has annotated the survey overlaying the Scar valley with new contour lines showing the crater depression. The before and after, in cartographic language, is a circle that wasn\'t there before.',
      },
      {
        keywords: ['satellite', 'imagery', 'printed', 'plotter', 'aerial'],
        description: 'The satellite imagery is the most recent data available — captured before the Collapse by commercial imaging satellites, printed at high resolution on the Reclaimers\' plotter. The imagery shows the Four Corners as it was: a functional landscape, roads intact, settlements lit. Comparing it to the hand-drawn current map is an exercise in loss quantification. Everything that\'s dark now was lit then. Everything that\'s red-pinned now was green.',
        skillCheck: { skill: 'perception', dc: 10, successAppend: 'The pre-Collapse satellite imagery of the Scar valley shows something the current map can\'t: construction activity at the MERIDIAN site, captured mid-build. Heavy equipment, cleared forest, a road that doesn\'t exist on any public map. The construction was significant — military scale. And in the corner of the image, barely visible at this resolution, a second cleared area three miles northwest. Field Station Echo.' },
      },
      {
        keywords: ['hand-drawn', 'route', 'charts', 'field', 'intelligence'],
        description: 'The hand-drawn route charts are the practical heart of the map room — sketched by field teams who walked the routes and noted every landmark, hazard, water source, and shelter point. Each chart is signed and dated. The oldest is from five years ago. The most recent is from last week. The accumulated knowledge of hundreds of trips through dangerous territory, distilled into pencil lines on graph paper. This is how the Reclaimers stay alive.',
      },
      {
        keywords: ['string', 'connections', 'related', 'sites', 'network'],
        description: 'The strings on the central map connect related locations — supply routes, communication lines, faction territories, Hollow migration patterns. One set of strings, in red, connects five locations in a pattern that converges on the Scar valley: the Stacks, the Dust radio tower, Duskhollow, the Deep mine, and Crossroads. Five origins, one destination. The convergence pattern is labeled in Lev\'s handwriting: ALL ROADS.',
      },
    ],
    environmentalRolls: {
      flavorLines: [
        { line: 'A new pin has been added to the central map since your last visit. You don\'t recognize the location. Someone does.', chance: 0.25, time: ['day'] },
        { line: 'The plotter runs in the corner, printing a new route chart. The sound is the sound of preparation.', chance: 0.20, time: null },
      ],
    },
    narrativeNotes: 'The map room is the strategic intelligence hub of the Stacks zone. Field Station Echo is a major new lore reveal — a second MERIDIAN facility that opens future quest content. The "ALL ROADS" convergence detail on the central map is a meta-narrative moment, showing the player that all zones point to the same destination. The satellite imagery pre/post comparison is an emotional beat.',
  },
]
