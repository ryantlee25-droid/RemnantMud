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
    description: 'The Stacks announces itself with solar panels — a hundred of them, angled south on the hillside like a congregation facing the sun. Behind the panels, an electric fence runs the perimeter, and behind the fence, the converted warehouse complex the Reclaimers call home. A camera watches the gate. A speaker crackles. A voice says: "State your affiliation and purpose." The fence hums with real current. These people have power and aren\'t pretending otherwise.',
    descriptionNight: 'At night the Stacks is the brightest thing in the Four Corners. Electric light — not firelight — spills from the facility windows. The solar array\'s charge runs their batteries through the dark hours. Standing out here at night feels like standing outside civilization and watching it work. The gate camera light is a red eye in the darkness.',
    shortDescription: 'The Stacks perimeter. Solar panels. Electric fence. Camera watching.',
    exits: { west: 'st_02_entry_hall' },
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
        description: 'The fence hums at roughly 5000 volts — enough to stop a Hollow, definitely enough to stop you. Signs at regular intervals: ELECTRIFIED — RECLAIMER PERIMETER. The signs are printed, not hand-written. These people have a printer. The rabbit that touched the fence near the south post is a testimonial to voltage.',
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
    description: 'The entry hall runs the full width of the converted warehouse\'s front section — concrete floor, strip lighting overhead (working), and a decontamination station that takes your gear seriously. Brushes, UV wand, a sealed chamber for anything biological. A laminated sign explains the protocol in clear, non-condescending language. Lev stands at the inner door, clipboard in hand, scientific curiosity barely contained behind professional courtesy. You\'ve been seen before. You just haven\'t been catalogued yet.',
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
    description: 'The server room is cold and loud — the Reclaimers keep it at sixty-two degrees because the equipment demands it, and the fans run constant. Rack after rack of salvaged servers, consumer routers, and custom-built nodes form a maze of blinking amber and green. This is the closest thing to the internet that exists in the Four Corners — a local mesh network with terminals in every room, a searchable archive of recovered data, and a connection to three other Reclaimer nodes in the region. It doesn\'t reach outside the region. But inside it, information moves.',
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
    shortDescription: 'The best crafting station in the game. Electronics specialty.',
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
    exits: { east: 'st_07_comm_center', south: 'st_10_roof_observatory' },
    richExits: {
      east: { destination: 'st_07_comm_center', descriptionVerbose: 'east to the comm center' },
      south: { destination: 'st_10_roof_observatory', descriptionVerbose: 'stairs up to the roof observatory' },
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
    description: 'Lev\'s office is organized in layers — the desk surface is working space, beneath it is filing space, the walls are reference space, the floor under the desk is archive space. A single personal object: a photograph in a small frame, face-down on the bookshelf. On the desk, a folder labeled REVENANT COHORT — CYCLE OBSERVATIONS sits open. Inside: you, or someone who cycles the way you cycle, documented across multiple iterations. Lev has been watching. Lev has been waiting. Lev is about to ask you something important.',
    descriptionNight: 'Lev is usually in this office at night. Reading, making notes, running through analysis. The photograph stays face-down. The REVENANT COHORT folder is always out. At night Lev is quieter — the questions more direct, as if the dark takes away the professional courtesy and leaves only the actual curiosity.',
    shortDescription: 'Lev\'s office. Quest hub. MERIDIAN keycard quest.',
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
        keywords: ['folder', 'revenant', 'cohort', 'files'],
        description: 'The file on you is thorough. Physical descriptions from multiple observations. Skill retention percentages across cycles. Notes on personality shifts between deaths. The final entry reads: "Subject demonstrates unusual coherence. Memory fragmentation within expected range but integration significantly above. Query: is subject aware they are being studied? Should we ask?"',
        cycleGate: 2,
      },
      {
        keywords: ['keycard', 'MERIDIAN', 'access', 'key'],
        description: 'On Lev\'s desk, locked in a lockbox: you can see the edge of a keycard through the gap. Black plastic, white text too small to read from here. This is what the Reclaimers are offering — the means to enter MERIDIAN. They found it, cleaned it, tested its validity. They need you to use it.',
        questGate: 'reclaimers_trusted',
      },
    ],
    narrativeNotes: 'Primary questgiver room. The MERIDIAN keycard quest originates here. The photograph humanizes Lev. The revenant cohort file is a significant player-mirror moment.',
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
    flags: { fastTravelWaypoint: false },
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
    flags: { scavengingZone: true },
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
    flags: { dark: true, scavengingZone: true },
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
    flags: { dark: true },
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
    flags: { scavengingZone: true },
    description: 'The atrium of a former office tower, thirty feet high at its peak and now half that, the upper floors driven down through the interior by the collapse. The scale is still legible — a grand entrance hall designed to impress people arriving for meetings that no longer exist. Marble flooring, most of it intact under a layer of rubble, catches light from the gaps in the collapsed roof. The reception desk is half-buried, the laminate surface split but the structure standing. Behind the desk, a building directory board hangs at an angle. Most of the tenant plaques are still in their slots. You can read some of them.',
    descriptionNight: 'At night the collapsed roof gaps become windows to the stars. Enough light comes through to navigate by. The marble reflects it faintly, the floor glowing a pale blue in the dark. The desk is a black shape. The directory is unreadable without a light. Something about the scale — the ceilings that were meant to make you feel the building\'s importance — makes the dark feel more absolute.',
    descriptionDawn: 'Dawn sends light through the eastern collapse gaps at a low angle that crosses the marble floor in orange bars. The building directory catches it and one name on the tenant list is briefly illuminated before the angle shifts: MERIDIAN SYSTEMS INC — FLOORS 14-22.',
    shortDescription: 'Former office tower atrium. Marble under rubble. Directory still readable.',
    exits: { west: 'st_11_upper_stacks', up: 'st_11_upper_stacks', down: 'st_12_server_room_remnant', north: 'st_13_underpass', east: 'st_01_approach' },
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
]
