import type { Room } from '@/types/game'

export const THE_PENS_ROOMS: Room[] = [
  {
    id: 'pens_01_east_gate',
    name: 'The Pens — East Gate',
    zone: 'the_pens',
    act: 2,
    difficulty: 3,
    visited: false,
    flags: { fastTravelWaypoint: true },
    description: 'A chain-link gate in a chain-link fence, topped with razor wire that catches the light like something decorative. Two Red Court enforcers flank the checkpoint, their tactical gear immaculate, their expressions professional. A painted sign above the gate reads: MERCY GENERAL EXTENDED CARE PROGRAM — ALL VISITORS WELCOME. The paint is clean. Someone repaints it. The fence behind them runs both directions as far as visibility allows, and the facility beyond it is a repurposed hospital, its original signage still visible under the Red Court additions. The process at the checkpoint is efficient: papers, wristband assignment, processing. A donor waiting their turn stands to one side, yellow wristband already in hand, looking at nothing in particular.',
    descriptionNight: 'The gate checkpoint operates around the clock. Night shift has the same enforcers, the same clipboard, the same sign. The facility beyond glows from within — power intact, lights on in every wing. This place does not sleep. It has reasons not to.',
    shortDescription: 'The East Gate checkpoint. Red Court guards. The sign says MERCY GENERAL.',
    exits: { east: 'pens_02_intake_hall' },
    richExits: {
      east: { destination: 'pens_02_intake_hall', descriptionVerbose: 'through the checkpoint gate into the intake hall' },
    },
    items: [],
    enemies: ['red_court_enforcer'],
    npcs: ['crossroads_gate_guard'],
    extras: [
      {
        keywords: ['sign', 'mercy', 'general', 'extended', 'care'],
        description: 'MERCY GENERAL EXTENDED CARE PROGRAM — ALL VISITORS WELCOME. Below that, in smaller official script: Facility 7, Red Court Sanitation Authority. Below that, a laminated sheet in a weather-resistant sleeve: VOLUNTARY INTAKE OPEN — ASK ABOUT WARD A BENEFITS. The benefits are listed. Shelter. Two meals daily. Clean water. Medical attention. The cost is not listed.',
      },
      {
        keywords: ['fence', 'wire', 'perimeter', 'barrier'],
        description: 'The fence is serious construction — posts sunk deep, gauge heavy enough that a person would need tools and time to breach it. The razor wire on top is maintained; no gaps, no rust, no sag. Someone patrols this perimeter on a schedule. The facility is not keeping things out. It is keeping things organized.',
      },
      {
        keywords: ['wristband', 'wristbands', 'color', 'band'],
        description: 'The donor waiting at the checkpoint wears a yellow wristband — O-negative, voluntary. The processing officer has a tray of them on the checkpoint table: yellow, blue, red, white. The colors mean something. The officer distributes them with the efficient cheer of someone handing out badges at a convention.',
        skillCheck: { skill: 'perception', dc: 10, successAppend: 'You count: mostly yellow and blue in the tray. Very few white. No red visible here — those come from inside, not from the gate.' },
      },
    ],
    hollowEncounter: {
      baseChance: 0.05,
      timeModifier: { day: 0.5, night: 0.8, dawn: 0.6, dusk: 0.7 },
      threatPool: [
        { type: 'shuffler', weight: 70, quantity: { min: 1, max: 2, distribution: 'weighted_low' } },
        { type: 'remnant', weight: 30, quantity: { min: 1, max: 1, distribution: 'single' } },
      ],
    },
    narrativeNotes: 'Entry point. The horror starts here — not in the dark, but in the sign, the clean fence, the professional manner. Establish the bureaucratic-horror tone immediately.',
  },

  {
    id: 'pens_02_intake_hall',
    name: 'The Pens — Intake Hall',
    zone: 'the_pens',
    act: 2,
    difficulty: 2,
    visited: false,
    flags: { noCombat: true },
    description: 'The former hospital lobby has been repurposed without being rebuilt — the original architecture is intact, the desk arrangement rearranged into registration stations. Three intake clerks work behind the desks, each with a clipboard, a color-coded wristband tray, and the practiced neutral expression of people who process fifty intakes a day. The chairs along the wall are occupied: a family of four sitting very close together, a lone man with a healing wound on his forearm, a woman watching the clerks with the careful attention of someone performing a calculation she doesn\'t know how to finish. Overhead signage, printed on office-grade paper and laminated, directs: VOLUNTARY INTAKE — LEFT. REFERRAL CASES — RIGHT. MEDICAL HOLD — SPEAK TO OFFICER. The hospital\'s original public-address speakers are still mounted in the ceiling. Soft music plays. It sounds like a waiting room.',
    descriptionNight: 'Night intake is quieter. One clerk on duty instead of three, processing slower, the waiting chairs mostly empty. The music still plays.',
    shortDescription: 'Former hospital lobby. Registration desks. Intake clerks with clipboards.',
    exits: { west: 'pens_01_east_gate', north: 'pens_03_ward_a_corridor', east: 'pens_06_ward_b_corridor', south: 'pens_08_administration' },
    richExits: {
      west: { destination: 'pens_01_east_gate', descriptionVerbose: 'back out through the checkpoint' },
      north: { destination: 'pens_03_ward_a_corridor', descriptionVerbose: 'north into Ward A corridor — yellow wristbands' },
      east: { destination: 'pens_06_ward_b_corridor', descriptionVerbose: 'east into Ward B corridor — blue wristbands' },
      south: { destination: 'pens_08_administration', descriptionVerbose: 'south to the administration wing', hidden: true, discoverSkill: 'perception', discoverDc: 11, discoverMessage: 'A door marked STAFF ONLY stands ajar at the south end of the lobby. Through the gap: filing cabinets, the sound of a printer.' },
    },
    items: ['patient_intake_form'],
    enemies: [],
    npcs: ['courthouse_clerk', 'drifter_newcomer'],
    extras: [
      {
        keywords: ['clipboard', 'form', 'paperwork', 'intake'],
        description: 'The intake form on the nearest desk is printed on quality paper — not salvage, not hand-scrawled, but actually printed, on a working printer, from a working file. The form asks for: name, age, blood type (self-reported), medical history, and "voluntary status." The voluntary status field has a checkbox and the word YES pre-printed. There is no NO checkbox.',
        skillCheck: { skill: 'lore', dc: 9, successAppend: 'The absence of a NO checkbox on the voluntary status form is not an oversight. The form was designed this way. The design is a policy.' },
      },
      {
        keywords: ['family', 'people', 'waiting', 'chairs', 'residents'],
        description: 'The family of four — two adults, two children — sit with their bags between their feet. The children have wristbands already: yellow. The adults don\'t yet. The mother is watching the clerk with an expression you recognize: the look of someone who has decided, and is not revisiting it, and is aware that not revisiting it is the only way to keep moving.',
      },
      {
        keywords: ['music', 'speakers', 'sound', 'pa'],
        description: 'The music is pre-Collapse — light jazz, the kind that played in dentist offices and hotel lobbies, meant to communicate that nothing alarming is happening. It plays from the original PA system. Someone found a way to keep it running. Someone chose to keep it running. The choice says something about what kind of place this is trying to appear to be.',
      },
      {
        keywords: ['sign', 'signage', 'directions', 'posted'],
        description: 'The directional signs are laminated and recent. Voluntary intake left, referral right, medical hold to an officer. The signs also include a typed information sheet: WARD A BENEFITS (Yellow Wristband): Private sleeping area, two meals daily, clean water, wound care, 10-day minimum recovery between draws. The word "draws" is used without explanation. Whoever wrote this assumed the reader already knew.',
      },
    ],
    hollowEncounter: {
      baseChance: 0.02,
      timeModifier: { day: 0.5, night: 0.8, dawn: 0.6, dusk: 0.6 },
      threatPool: [
        { type: 'shuffler', weight: 100, quantity: { min: 1, max: 1, distribution: 'single' } },
      ],
    },
    narrativeNotes: 'pens_02. The intake hub. patient_intake_form placed here. The noCombat flag — the horror here is administrative, not violent. The missing NO checkbox is the key detail.',
  },

  {
    id: 'pens_03_ward_a_corridor',
    name: 'The Pens — Ward A Corridor',
    zone: 'the_pens',
    act: 2,
    difficulty: 2,
    visited: false,
    flags: { noCombat: true, safeRest: false },
    description: 'The yellow-wristband ward corridor is the cleanest hallway you have seen since the Collapse. The linoleum is mopped. The overhead lights are functioning — all of them, the full length of the hall, no darkness pooling in the corners. Donors move through it freely, yellow wristbands catching the light, a few nodding to each other with the casual ease of people who have established a routine. A bulletin board near the ward entrance has signup sheets for meal service rotations and optional clinic visits. Someone has pinned a hand-drawn calendar. Someone has noted birthdays. The institutional horror is this: it has the texture of a community. The people here made a decision and they are living inside it.',
    descriptionNight: 'Night in the Ward A corridor is quiet, the lights dimmed to a warm low. A few donors move to the shared bathrooms and back. A Red Court staff member does a wellness check at the far end — knocking, waiting, moving on.',
    shortDescription: 'Ward A corridor. Yellow wristbands. Lit. Calm. The donors move freely.',
    exits: { south: 'pens_02_intake_hall', north: 'pens_04_ward_a_beds', east: 'pens_05_extraction_room_a' },
    richExits: {
      south: { destination: 'pens_02_intake_hall', descriptionVerbose: 'back south to the intake hall' },
      north: { destination: 'pens_04_ward_a_beds', descriptionVerbose: 'north into the ward sleeping area' },
      east: { destination: 'pens_05_extraction_room_a', descriptionVerbose: 'east to the extraction room' },
    },
    items: ['bandages'],
    enemies: [],
    npcs: ['drifter_newcomer', 'wounded_drifter'],
    extras: [
      {
        keywords: ['bulletin', 'board', 'calendar', 'signup'],
        description: 'The bulletin board has: a meal rotation signup (twelve names, organized by hand), a clinic appointment schedule, a hand-drawn calendar with three birthdays marked in red, and a note that reads WARD A POKER TUESDAY — BRING YOUR OWN PENNIES. The pennies are Red Court tokens, not .22 LR. The game happens every week. The people who play it are here indefinitely.',
      },
      {
        keywords: ['wristband', 'yellow', 'donors', 'people'],
        description: 'Eight or nine yellow-wristband donors visible in the corridor at any given time, most moving between the ward and the shared facilities. They make eye contact normally. They answer if you ask directions. One man passes you and says, without apparent irony or distress, "Good day." He has been here four months. You can tell because his forearm has the systematic pattern of a person who has been bled on a schedule for four months.',
        skillCheck: { skill: 'field_medicine', dc: 10, successAppend: 'The puncture pattern on visible forearms follows a clinical rotation — same vein cluster, slightly varied entry point each draw to prevent scarring. Someone trained these technicians properly. The procedure is being done right. That makes it worse, not better.' },
      },
      {
        keywords: ['clean', 'light', 'linoleum', 'hall', 'corridor'],
        description: 'The cleanliness is an argument. The Red Court is making a case, in every mopped floor and functioning lightbulb, that this arrangement is sustainable and humane. The case is not wrong on its own terms. The terms are the problem.',
      },
    ],
    hollowEncounter: {
      baseChance: 0.02,
      timeModifier: { day: 0.5, night: 0.6, dawn: 0.5, dusk: 0.5 },
      threatPool: [
        { type: 'shuffler', weight: 100, quantity: { min: 1, max: 1, distribution: 'single' } },
      ],
    },
    narrativeNotes: 'pens_03. Ward A is the best-case version of The Pens. Show it honestly — clean, lit, functional. The horror is in the normalcy. The donors are not suffering in ways they would articulate as suffering.',
  },

  {
    id: 'pens_04_ward_a_beds',
    name: 'The Pens — Ward A Sleeping Area',
    zone: 'the_pens',
    act: 2,
    difficulty: 2,
    visited: false,
    flags: { noCombat: true },
    description: 'Former hospital rooms repurposed into a communal sleeping ward — two rows of cots separated by curtains, each curtained space personalized in small ways. A photograph tacked to the curtain rail. A carved wooden figure on the bedside table. A pair of reading glasses folded on a library book that may or may not have come from an actual library. The ward holds perhaps thirty donors in various states of rest. Some are sleeping. Some are reading. Some are just lying on their backs staring at the ceiling with the particular stillness of people who have learned to wait. The food is better here than anywhere in the Breaks. The bed is softer than ground. The people here made the calculation and arrived at this, and some of them have been here long enough that "here" has become a kind of life.',
    descriptionDawn: 'Dawn in the sleeping ward: the stir of people waking, the small sounds of thirty people who know each other\'s patterns. A woman near the window watches the light change. She has watched it change from this window for six months.',
    shortDescription: 'Ward A sleeping area. Donors at rest. Some have been here months.',
    exits: { south: 'pens_03_ward_a_corridor' },
    richExits: {
      south: { destination: 'pens_03_ward_a_corridor', descriptionVerbose: 'back south into the corridor' },
    },
    items: ['water_bottle_sealed', 'scavenged_rations'],
    enemies: [],
    npcs: ['riverside_resident', 'breaks_wanderer_at_rest'],
    extras: [
      {
        keywords: ['photograph', 'picture', 'personal', 'belongings'],
        description: 'The photographs pinned to curtain rails and bedside tables are what they are: evidence of lives that existed before this. A family portrait. A dog. A building you almost recognize as somewhere in the Covenant. The person in the nearest curtained space has arranged their belongings with the care of someone who has decided this is a place they live now.',
      },
      {
        keywords: ['cot', 'bed', 'sleep', 'mattress'],
        description: 'The cots have actual mattresses — thin, but foam, not straw, not ground, not rubble. Clean sheets, changed weekly according to the laundry rotation posted on the ward door. You have not slept on a mattress in a long time. This fact lands differently than you expected.',
      },
      {
        keywords: ['person', 'donor', 'woman', 'man', 'resident', 'window'],
        description: 'The woman watching the dawn has a yellow wristband that has been replaced twice — you can see the ghost of the old ones on her wrist, the slight discoloration where they sat. She notices you looking. "Six months," she says. Not angry. Not proud. Just the fact of it. She doesn\'t explain what made six months worth it and you don\'t ask.',
      },
    ],
    hollowEncounter: {
      baseChance: 0.01,
      timeModifier: { day: 0.3, night: 0.5, dawn: 0.4, dusk: 0.4 },
      threatPool: [
        { type: 'shuffler', weight: 100, quantity: { min: 1, max: 1, distribution: 'single' } },
      ],
    },
    narrativeNotes: 'pens_04. The most humanizing room in the zone. These donors are not victims in a simple sense — they have made calculations. Show their personhood. The horror of The Pens is partly that some people prefer it.',
  },

  {
    id: 'pens_05_extraction_room_a',
    name: 'The Pens — Extraction Room A',
    zone: 'the_pens',
    act: 2,
    difficulty: 2,
    visited: false,
    flags: { noCombat: true },
    description: 'The room has the layout and smell of a blood clinic — because it was a blood clinic, and it still is, just under different management and different incentive structures. Six reclining chairs, each with an articulating arm, an IV stand, a rolling needle tray. The procedure room is clean: the kind of clean that requires intent and resources, alcohol-smell clean, the clean of a place where infection is an operational problem rather than a moral one. A Red Court technician in scrubs moves between stations, checking lines, noting readings. Two donors are in chairs at the far end, arms extended, eyes elsewhere — one reading a book, one asleep. The blood moves through clear tubing into collection bags mounted on the IV stands. The collection bags have the yield classification printed on them. This is a medical procedure performed by trained personnel in a sterile environment. The framing does not change what is in the bags.',
    descriptionNight: 'Night draws are lighter volume — recovery consideration, the technician explains to no one in particular, by rote. The room runs quieter after dark. Two chairs instead of six.',
    shortDescription: 'Extraction Room A. Medical chairs. IV stands. Voluntary draws. Professional.',
    exits: { west: 'pens_03_ward_a_corridor' },
    richExits: {
      west: { destination: 'pens_03_ward_a_corridor', descriptionVerbose: 'back west into the ward corridor' },
    },
    items: ['blood_type_chart', 'bandages_clean'],
    enemies: [],
    npcs: ['medic_marsh'],
    extras: [
      {
        keywords: ['chair', 'chairs', 'reclining', 'seat'],
        description: 'The chairs are medical-grade reclining chairs — pre-Collapse, maintained. The upholstery has been patched in two places with a fabric that almost matches. The arm extensions are adjusted to donor height with the automatic efficiency of someone who has done this ten thousand times.',
      },
      {
        keywords: ['needle', 'tray', 'tubing', 'line', 'equipment'],
        description: 'The needle trays are stainless, autoclaved after each use. The tubing is single-use — you can see the opened packaging in the disposal bin. The collection bags are calibrated: fill line marked, volume noted, yield classification stenciled. The process has been optimized. Someone thought carefully about how to do this at scale. The thought is visible in every component.',
        skillCheck: { skill: 'field_medicine', dc: 11, successAppend: 'The procedure is medically sound. Standard phlebotomy protocol, appropriate gauges, correct draw volumes for a bi-weekly schedule. The Red Court employs people who know what they\'re doing. That is the detail that makes the knowledge useful and unpleasant simultaneously.' },
      },
      {
        keywords: ['bag', 'bags', 'blood', 'collection', 'yield'],
        description: 'The collection bags have printed labels: VOLUNTARY YIELD — TYPE O-NEG — FACILITY 7 — DATE/TIME/TECHNICIAN. At the bottom: ACCORD DISTRIBUTION — PRIORITY SHIPMENT. The blood goes to the Accord territories. The Accord buys yield from the Red Court. The transaction has a price per liter, somewhere, in a ledger in the administration wing.',
      },
    ],
    hollowEncounter: {
      baseChance: 0.02,
      timeModifier: { day: 0.4, night: 0.6, dawn: 0.4, dusk: 0.5 },
      threatPool: [
        { type: 'shuffler', weight: 100, quantity: { min: 1, max: 1, distribution: 'single' } },
      ],
    },
    narrativeNotes: 'pens_05. blood_type_chart placed here. The voluntary extraction room. The horror is procedural competence. The Accord distribution detail seeds a faction-level moral question.',
  },

  {
    id: 'pens_06_ward_b_corridor',
    name: 'The Pens — Ward B Corridor',
    zone: 'the_pens',
    act: 2,
    difficulty: 2,
    visited: false,
    flags: { noCombat: true },
    description: 'The blue-wristband corridor is maintained — lights working, floor swept — but the texture is different from Ward A. The donors here move less freely. Not restricted: the doors are open, the corridor access unrestricted. But they move like people who have been somewhere long enough to develop the economy of motion of someone who has accepted their range. A few sit in the corridor itself, backs against the wall, doing nothing in particular. Blue wristbands on every wrist — A-positive, voluntary, but the "voluntary" has a quality here that feels more calculated and less chosen. A bulletin board has the same laminated sheets as Ward A, but fewer handwritten additions. The birthdays board is empty.',
    descriptionNight: 'The Ward B corridor at night is quieter than the day would suggest it should be. The donors who are awake are awake the way people are awake who can\'t sleep rather than the way people are awake who chose to stay up.',
    shortDescription: 'Ward B corridor. Blue wristbands. Still maintained. Quieter.',
    exits: { west: 'pens_02_intake_hall', north: 'pens_07_cafeteria' },
    richExits: {
      west: { destination: 'pens_02_intake_hall', descriptionVerbose: 'back west to the intake hall' },
      north: { destination: 'pens_07_cafeteria', descriptionVerbose: 'north to the cafeteria' },
    },
    items: ['bandages'],
    enemies: [],
    npcs: ['drifter_newcomer', 'wounded_drifter'],
    extras: [
      {
        keywords: ['wristband', 'blue', 'donors', 'residents'],
        description: 'Blue wristbands: A-positive blood type, voluntary intake. The voluntary rate for A-positive donors is lower than O-negative — the demand is lower, the incentive package slightly less generous. Some of these people chose this. Some of these people chose this because the alternative was specific and immediate, and what you do when every option is bad is still technically a choice.',
      },
      {
        keywords: ['bulletin', 'board', 'empty', 'signs'],
        description: 'The bulletin board has the same official laminated sheets as Ward A — meal rotations, clinic schedules, policy notices. But the handwritten additions are sparse. No poker game notice. No birthday calendar. One handwritten sheet, in blocky careful letters: IF YOU NEED TO TALK, THE MEDIC DOES OFFICE HOURS WEDNESDAYS. The sheet has been up long enough to curl at the corners.',
      },
      {
        keywords: ['wall', 'sitting', 'people', 'floor'],
        description: 'The person sitting against the wall nearest you has been watching the corridor entrance since you arrived. Not watching you specifically. Watching it. When you meet their eyes they look away first, without expression, and go back to watching the corridor entrance.',
        skillCheck: { skill: 'perception', dc: 10, successAppend: 'They are watching for something specific — someone specific, by the pattern of their attention. They look when a door opens. They look when someone new comes in. They are waiting for someone who has not arrived in a long time.' },
      },
    ],
    hollowEncounter: {
      baseChance: 0.02,
      timeModifier: { day: 0.4, night: 0.6, dawn: 0.4, dusk: 0.5 },
      threatPool: [
        { type: 'shuffler', weight: 100, quantity: { min: 1, max: 1, distribution: 'single' } },
      ],
    },
    narrativeNotes: 'pens_06. Ward B is the same system, different texture. The missing birthday calendar and the Wednesday office hours note do the work. Same facility, slightly different flavor of resignation.',
  },

  {
    id: 'pens_07_cafeteria',
    name: 'The Pens — Donor Cafeteria',
    zone: 'the_pens',
    act: 2,
    difficulty: 2,
    visited: false,
    flags: { noCombat: true, campfireAllowed: false },
    description: 'The cafeteria is the argument The Pens makes most convincingly. Real food — hot, varied, portioned to actual nutritional standards, not the caloric minimum of desperation. Canned goods, preserved protein, occasionally fresh vegetables from somewhere. The room holds sixty people at long tables, and the noise level is what it would be in any communal dining space: conversation, the clatter of trays, someone laughing at the far end of a table. Most wristbands are yellow and blue, visible at table level. The cost of the meal is visible too: forearms, some more marked than others, the accumulation of a schedule that repeats until the person decides to leave or the person stops being able to. A Red Court food server ladles out portions with the impartial efficiency of a person who has made their separate peace with this work.',
    descriptionNight: 'Night meal is quieter, fewer people. The kitchen runs reduced service but the food quality holds. Some donors eat alone. Most eat together. The cafeteria at night has the specific warmth of a place that is, in a narrow and complicated sense, working.',
    shortDescription: 'Donor cafeteria. Better food than most settlements. The cost is on their arms.',
    exits: { south: 'pens_06_ward_b_corridor', west: 'pens_03_ward_a_corridor' },
    richExits: {
      south: { destination: 'pens_06_ward_b_corridor', descriptionVerbose: 'back south to the Ward B corridor' },
      west: { destination: 'pens_03_ward_a_corridor', descriptionVerbose: 'west to the Ward A corridor' },
    },
    items: ['preserved_rations', 'water_bottle_sealed'],
    enemies: [],
    npcs: ['food_vendor_generic', 'breaks_wanderer_at_rest', 'riverside_resident'],
    extras: [
      {
        keywords: ['food', 'meal', 'tray', 'eating'],
        description: 'The tray in front of the nearest person: a portion of protein stew, bread — actual bread, leavened, soft — a cup of clean water, and a small serving of preserved fruit. This is better food than you have eaten in some time. The person eating it has been here eight months. Their schedule is biweekly draws, the minimum recovery interval. They look healthy. They look like someone who made a decision and is living with it.',
        skillCheck: { skill: 'survival', dc: 8, successAppend: 'The nutritional standard here is deliberately maintained above baseline — protein and iron, specifically. The Red Court is not keeping donors comfortable out of charity. Recovery nutrition directly affects yield quality and draw frequency. This meal is an investment.' },
      },
      {
        keywords: ['laugh', 'conversation', 'noise', 'talking'],
        description: 'The laughter at the far table is real laughter. You cannot tell whether that makes this better or worse and you have been thinking about it since you walked in.',
      },
      {
        keywords: ['server', 'staff', 'kitchen', 'worker'],
        description: 'The server behind the counter has no wristband. Red Court staff — not a donor, not a prisoner, a paid employee in a system that has employees. They ladle stew with practiced efficiency and make no eye contact with anyone. They have found a way to do this job without engaging with what it is. Most people find a way.',
      },
    ],
    hollowEncounter: {
      baseChance: 0.02,
      timeModifier: { day: 0.3, night: 0.5, dawn: 0.4, dusk: 0.4 },
      threatPool: [
        { type: 'shuffler', weight: 100, quantity: { min: 1, max: 1, distribution: 'single' } },
      ],
    },
    narrativeNotes: 'pens_07. The cafeteria is the most ambiguous room in the zone — genuine comfort, genuine community, at a genuine cost. The key insight: the food quality is optimized for yield, not charity.',
  },

  {
    id: 'pens_08_administration',
    name: 'The Pens — Administration Wing',
    zone: 'the_pens',
    act: 2,
    difficulty: 3,
    visited: false,
    flags: {},
    description: 'The administration wing occupies the former hospital\'s administrative suite — offices, filing rooms, a central records hall. The records hall is the floor\'s core: rows of filing cabinets, a working printer, three desks with active workstations. The yield ledgers are here, stacked in ordered rows: intake dates, blood types, draw volumes, recovery intervals, compliance notes, incident reports. The language is clean and professional — "yield event," "extraction session," "recovery noncompliance" — the bureaucratic grammar of a system that has processed enough volume to develop its own vocabulary. Two Red Court administrators work at the central desks, unhurried. A scheduling board covers one wall: a grid of names, dates, and color codes. The grid is full. The grid has always been full.',
    descriptionNight: 'Night administration: one clerk on duty, the printer idle, the filing cabinets locked. The scheduling board glows from the emergency lighting strip above it.',
    shortDescription: 'Rook\'s administration complex. Yield ledgers. Scheduling boards. Intake records.',
    exits: { north: 'pens_02_intake_hall', east: 'pens_09_holding_cells', west: 'pens_11_research_wing', up: 'pens_12_cold_storage', south: 'pens_13_staff_quarters', down: 'pens_14_rooks_office' },
    richExits: {
      north: { destination: 'pens_02_intake_hall', descriptionVerbose: 'north back to the intake hall' },
      east: {
        destination: 'pens_09_holding_cells',
        descriptionVerbose: 'east to the holding cells',
        locked: true,
        lockedBy: 'red_court_key',
        reputationGate: { faction: 'red_court', minLevel: -1 },
      },
      west: {
        destination: 'pens_11_research_wing',
        descriptionVerbose: 'west to the research wing',
        hidden: true,
        discoverSkill: 'perception',
        discoverDc: 12,
        discoverMessage: 'A door marked PROTOCOL RESEARCH — RESTRICTED stands at the west end of the records hall. The lock is keyed. The door is newer than everything else in the room.',
      },
      up: { destination: 'pens_12_cold_storage', descriptionVerbose: 'stairs up to cold storage' },
      south: { destination: 'pens_13_staff_quarters', descriptionVerbose: 'south to staff quarters' },
      down: {
        destination: 'pens_14_rooks_office',
        descriptionVerbose: 'stairs down to Rook\'s private office',
        hidden: true,
        discoverSkill: 'perception',
        discoverDc: 11,
        discoverMessage: 'A door behind the filing cabinets, partially hidden, leads down a short staircase. No sign. No label. The lock is different from the others — higher quality, recently oiled.',
      },
    },
    items: [],
    enemies: ['red_court_enforcer'],
    npcs: ['courthouse_clerk', 'checkpoint_arbiter'],
    extras: [
      {
        keywords: ['ledger', 'ledgers', 'records', 'files'],
        description: 'The yield ledgers are organized by quarter and blood type. You pull one at random: forty-two names, each with a draw log running two to eight months, the columns noting yield per session, recovery compliance, overall health status (abbreviated: G/F/P — good, fair, poor). Three names have a column entry reading "DEPARTED." The departure reason is not recorded.',
        skillCheck: { skill: 'perception', dc: 10, successAppend: 'The "DEPARTED" category is the data gap. The ledger tracks departures but not causes — it would be easy to conflate voluntary departure with the other kind. Easy, or intentional.' },
      },
      {
        keywords: ['schedule', 'board', 'grid', 'names'],
        description: 'The scheduling board is a physical grid: names down the left, dates across the top, color-coded blocks filling the cells. Yellow cells for Ward A draws, blue for Ward B, red for holding, white for research. The board extends three months forward. All the cells three months forward already have names in them. The intake rate is calibrated to fill the schedule. The schedule is calibrated to maximize sustainable yield. The system is optimized.',
      },
      {
        keywords: ['printer', 'workstation', 'equipment', 'power'],
        description: 'The printer is running. The workstations have power. The administration wing has priority on the facility\'s power allocation — records, scheduling, and communication infrastructure before donor comfort. Donor comfort is second priority. Extraction operations are third. The order reveals what matters most to the people who set it.',
      },
    ],
    hollowEncounter: {
      baseChance: 0.05,
      timeModifier: { day: 0.6, night: 1.0, dawn: 0.7, dusk: 0.8 },
      threatPool: [
        { type: 'shuffler', weight: 60, quantity: { min: 1, max: 2, distribution: 'weighted_low' } },
        { type: 'remnant', weight: 40, quantity: { min: 1, max: 1, distribution: 'single' } },
      ],
    },
    narrativeNotes: 'pens_08. The administrative hub. Six exits from here — this is the routing node for the back half of the zone. The yield ledger DEPARTED column is the key detail.',
  },

  {
    id: 'pens_09_holding_cells',
    name: 'The Pens — Holding Cells',
    zone: 'the_pens',
    act: 2,
    difficulty: 3,
    visited: false,
    flags: {},
    description: 'The holding cells are former patient rooms, their doors replaced with barred lockups. The corridor is less clean than Ward A — not filthy, not deliberately cruel, but the maintenance attention drops here in ways that are noticed and not corrected. Six cells visible, five occupied. Red wristbands on every wrist through the bars. The sounds are different here: someone pacing, someone sleeping badly, someone having a conversation through the wall in the specific low register of people who have learned to talk without the guards hearing. Two Red Court enforcers are posted at the corridor entrance, weapons present and unconcealed. The difference between this wing and the wards is the difference between a transaction and a seizure, and the people in these cells know which one they are in.',
    descriptionNight: 'Night in the holding corridor: the pacing has stopped but the insomnia hasn\'t. A guard makes a pass with a light. The cells are quiet in the way that is not the same as calm.',
    shortDescription: 'RED wristband holding. Barred cells. Guards posted. These people did not choose this.',
    exits: { west: 'pens_08_administration', east: 'pens_10_extraction_room_b' },
    richExits: {
      west: { destination: 'pens_08_administration', descriptionVerbose: 'back west to administration' },
      east: { destination: 'pens_10_extraction_room_b', descriptionVerbose: 'east to the involuntary extraction room' },
    },
    items: [],
    enemies: ['red_court_enforcer'],
    npcs: ['brig_prisoner_accord', 'brig_guard'],
    extras: [
      {
        keywords: ['cell', 'cells', 'bars', 'locked', 'prisoners'],
        description: 'The bars are standard-gauge steel, welded into the original door frames. The lock mechanisms are keyed from outside only. The rooms retain the original hospital fixtures: bed, small table, window painted over. The window paint is careful — thick, blocking all outside light orientation. Disorientation is a management tool.',
        skillCheck: { skill: 'lockpicking', dc: 13, successAppend: 'The locks are solid — pre-Collapse industrial quality, well-maintained. Not impossible. You would need a pick set and ten uninterrupted minutes per cell, with both guards looking the other way. The guards\' patrol rotation suggests a four-minute window between passes at the far end. It\'s possible. It is the kind of possible that requires a very specific series of events.' },
      },
      {
        keywords: ['red', 'wristband', 'prisoner', 'involuntary'],
        description: 'The red wristband on the nearest occupied cell\'s occupant is the same construction as the yellow and blue ones — same material, same clip, same printing. The color is the only difference. The color means: this person was classified as involuntary by the administration. The classification can mean they were found somewhere they weren\'t supposed to be, or they were captured, or they were flagged during a sweep, or someone turned them in. The intake form has a field for that. The field is labeled REFERRAL SOURCE.',
      },
      {
        keywords: ['guard', 'guards', 'enforcer', 'patrol'],
        description: 'The enforcers at the corridor entrance have the specific stillness of people who have decided not to think about what they are guarding. One of them meets your eyes briefly and looks away. There is something in the look — not shame, not apology, not agreement. Just acknowledgment that you saw each other, and that both of you know what this place is.',
      },
    ],
    hollowEncounter: {
      baseChance: 0.05,
      timeModifier: { day: 0.6, night: 1.0, dawn: 0.7, dusk: 0.8 },
      threatPool: [
        { type: 'shuffler', weight: 60, quantity: { min: 1, max: 2, distribution: 'weighted_low' } },
        { type: 'remnant', weight: 40, quantity: { min: 1, max: 1, distribution: 'single' } },
      ],
    },
    narrativeNotes: 'pens_09. The moral line is crossed here. The REFERRAL SOURCE detail on the intake form is the horror detail — the system has a pipeline for acquiring involuntary donors.',
  },

  {
    id: 'pens_10_extraction_room_b',
    name: 'The Pens — Extraction Room B',
    zone: 'the_pens',
    act: 2,
    difficulty: 3,
    visited: false,
    flags: {},
    description: 'The room is the same layout as Extraction Room A. The equipment is the same: six reclining chairs with articulating arms, IV stands, needle trays, collection bags with yield classification labels. The procedure is the same: a Red Court technician in scrubs, moving between stations, checking lines, noting readings. The difference is the chairs. The chairs in this room have restraint straps — wrist and forearm, chest, ankle. Most of the straps are unused at the moment; two are not. The blood type chart on the wall is the same laminated chart. The chart does not change based on whether the person in the chair agreed to be in the chair. The process is the same. That is the point. The facility has one procedure. The procedure has two participation categories.',
    descriptionNight: 'Night draws in Room B run regardless. Recovery schedules are applied, but the recovery consideration is operational — draws taken to frequently reduce yield quality. The math is the same here as in Room A.',
    shortDescription: 'Involuntary extraction. Same chairs. Same chart. The restraints are the difference.',
    exits: { west: 'pens_09_holding_cells' },
    richExits: {
      west: { destination: 'pens_09_holding_cells', descriptionVerbose: 'back west to the holding cells' },
    },
    items: ['blood_type_chart'],
    enemies: ['red_court_enforcer'],
    npcs: ['brig_guard'],
    extras: [
      {
        keywords: ['restraint', 'strap', 'straps', 'chair'],
        description: 'The restraint straps are the same medical-grade webbing used in pre-Collapse surgical contexts. They have been added to the chairs — not original equipment, modifications. Someone sourced them, installed them, decided they were necessary. The decision was procedural. The procedure is documented. The documentation is in the administration files under COMPLIANCE MEASURES.',
      },
      {
        keywords: ['technician', 'staff', 'scrubs', 'procedure'],
        description: 'The technician moves through the room with the same efficiency as the technician in Room A. The procedure is identical. They check lines, note readings, adjust the collection bag position. They do not speak to the people in the occupied chairs. The people in the occupied chairs do not speak either. The silence has a specific texture.',
        skillCheck: { skill: 'perception', dc: 10, successAppend: 'The technician\'s hands are steady. Their expression is neutral. Their eyes, when they pass near you, are the eyes of someone who has found a place to put this that works for them during working hours. What happens after working hours is their own problem.' },
      },
      {
        keywords: ['chart', 'blood', 'type', 'laminated', 'poster'],
        description: 'The same blood type efficiency chart as Room A. Same lamination, same handwritten updates in pen. The chart applies equally here — the extraction process optimizes by blood type regardless of donor category. The optimization does not stop at the door.',
      },
    ],
    hollowEncounter: {
      baseChance: 0.05,
      timeModifier: { day: 0.6, night: 1.0, dawn: 0.7, dusk: 0.8 },
      threatPool: [
        { type: 'shuffler', weight: 50, quantity: { min: 1, max: 2, distribution: 'weighted_low' } },
        { type: 'remnant', weight: 50, quantity: { min: 1, max: 2, distribution: 'weighted_low' } },
      ],
    },
    narrativeNotes: 'pens_10. The blood_type_chart placed here as a second instance — same chart, different context. The contrast with Room A is the entire point of Room B existing.',
  },

  {
    id: 'pens_11_research_wing',
    name: 'The Pens — Research Wing',
    zone: 'the_pens',
    act: 2,
    difficulty: 4,
    visited: false,
    flags: { hiddenRoom: true },
    description: 'The research wing is where the facility becomes something more than a blood extraction operation. White-wristband subjects occupy four isolation rooms — visible through wire-glass observation panels — each undergoing protocols that are not documented on the general scheduling board. The subjects are alive and apparently functional, but something has been done to them or is being done to them that has changed the quality of their attention. They look at things that aren\'t there. They respond to sounds that haven\'t happened yet. Two Red Court researchers work at a central bench covered in sample vials, testing equipment, and handwritten notes that cover every surface. A containment cage in the far corner holds what was once a Sanguine subject and is now something that cannot be called controlled: a feral, pacing, head lowered, watching you through the bars with eyes that have a specific quality of hunger that the Red Court regulars at the front gate do not have.',
    descriptionNight: 'Night in the research wing: the subjects still responsive to nothing you can detect. The feral paces. The researchers work through the night. This wing does not observe the facility\'s general schedule.',
    shortDescription: 'WHITE wristband subjects. Experimental protocols. A feral in a containment cage.',
    exits: { east: 'pens_08_administration' },
    richExits: {
      east: { destination: 'pens_08_administration', descriptionVerbose: 'back east to the administration wing' },
    },
    items: [],
    enemies: ['sanguine_feral'],
    npcs: ['reclaimer_technician'],
    extras: [
      {
        keywords: ['subject', 'subjects', 'white', 'wristband', 'observation'],
        description: 'Through the observation panel: a white-wristband subject sits on a bed, tracking something with their eyes. The tracking is smooth and certain — they are watching something. The room is empty. You watch them watch it for forty seconds. Whatever they are observing does not move randomly; it has a path, and they follow it. This is not a symptom you recognize.',
        skillCheck: { skill: 'blood_sense', dc: 12, successAppend: 'What they are responding to has a Sanguine quality — the same attunement that CHARON-7 carriers develop, but in a human subject, in a research context. The Red Court is attempting to induce Sanguine sensitivity in non-Sanguine subjects. The implications reach further than this room.' },
      },
      {
        keywords: ['cage', 'feral', 'sanguine', 'containment'],
        description: 'The containment cage is reinforced well beyond standard animal control: triple-gauge steel, floor anchoring bolts, a double-lock mechanism on the door. The feral inside has been here long enough to have worn grooves in the concrete floor with its pacing. It is not the uncontrolled chaos of a newly turned feral — it has the focused patience of something that has been waiting and knows how to wait. It has also been watching you since you entered.',
        skillCheck: { skill: 'perception', dc: 11, successAppend: 'The cage lock mechanism is double-keyed — one key held by the research lead, one by the facility security lead. The cage door shows signs of stress at the lower hinge: repeated impact, sustained force applied over time. The feral has been testing it. The feral knows which hinge to test.' },
      },
      {
        keywords: ['notes', 'research', 'bench', 'vials', 'samples'],
        description: 'The handwritten notes on the central bench cover both surfaces and every loose sheet of paper within reach. The shorthand is specialist — you recognize the structure of scientific notation without understanding the content. One legible line, at the top of a fresh page: AB-NEG RESPONSE RATE 340% ABOVE BASELINE. PRIORITY ACQUISITION RECOMMENDED. Below that, in different handwriting: DO NOT LOG IN GENERAL INTAKE. This is not being reported to administration. This is being reported to someone else.',
        skillCheck: { skill: 'lore', dc: 11, successAppend: 'AB-negative blood is the rarest type and, in pre-Collapse research, was already flagged for unusual CHARON-7 interaction properties. The research wing has made a discovery about AB-negative that is significant enough to warrant separate reporting outside the normal chain. Someone above Rook is interested in this. Possibly someone above the Red Court.' },
      },
    ],
    hollowEncounter: {
      baseChance: 0.15,
      timeModifier: { day: 0.8, night: 1.5, dawn: 1.0, dusk: 1.2 },
      threatPool: [
        { type: 'sanguine_feral', weight: 70, quantity: { min: 1, max: 1, distribution: 'single' } },
        { type: 'elder_sanguine', weight: 30, quantity: { min: 1, max: 1, distribution: 'single' } },
      ],
      awarenessRoll: { unaware: 0.1, awarePassive: 0.3, awareAggressive: 0.6 },
    },
    narrativeNotes: 'pens_11. The zone\'s lore escalation room. The AB-neg discovery and the outside reporting chain are the seeds of a larger questline. The feral\'s cage testing behavior is a ticking clock.',
  },

  {
    id: 'pens_12_cold_storage',
    name: 'The Pens — Cold Storage',
    zone: 'the_pens',
    act: 2,
    difficulty: 3,
    visited: false,
    flags: { scavengingZone: false },
    description: 'The cold storage level occupies the former hospital pharmacy and supply floor, converted into a blood bank scaled for distribution rather than treatment. The temperature is maintained — you feel it when you come up the stairs, the air a controlled cold that preserves the contents of the refrigerated vault units lining both walls. Clear-fronted units, each labeled by blood type and collection date, each holding collection bags stacked in careful rows. The math is visible: hundreds of bags, each bag labeled for destination, most labeled ACCORD TERRITORY DISTRIBUTION with a specific settlement name. You recognize some of the names. People in those settlements received this. People in those settlements receive this. The transaction runs in both directions: the Red Court extracts yield, the Accord receives it, both parties maintain a record of the arrangement. The record is in a shipping manifest binder on the central table, updated daily.',
    descriptionNight: 'The cold storage runs the same temperature around the clock. The vault units hum. The manifests sit open on the table. The Accord shipment scheduled for tomorrow is staged and labeled near the loading door.',
    shortDescription: 'Blood storage. Temperature-controlled vaults. Shipment manifests for Accord territories.',
    exits: { down: 'pens_08_administration' },
    richExits: {
      down: { destination: 'pens_08_administration', descriptionVerbose: 'stairs back down to administration' },
    },
    items: [],
    enemies: [],
    npcs: [],
    extras: [
      {
        keywords: ['vault', 'unit', 'refrigerator', 'bags', 'blood'],
        description: 'The collection bags in the vault units are organized with supply-chain precision: blood type on the outer label, collection date, facility code, technician ID, and destination settlement. The oldest bags are closest to the loading door. The rotation is first-in, first-out. The system has been running long enough that someone designed an inventory rotation protocol for it.',
      },
      {
        keywords: ['manifest', 'binder', 'shipping', 'accord', 'distribution'],
        description: 'The shipping manifest binder contains twelve months of records. The Accord settlements named include Covenant, River Road Outpost 3, two Salt Creek waypoints, and a location listed only as DEEP WAYPOINT 7. The prices are in the manifest: liter equivalents, converted to resource credits. The Red Court charges by blood type. O-negative commands the highest price per unit. AB-negative has no price listed — a separate column reads RESERVED / RESEARCH PROTOCOL. AB-negative does not go to the Accord.',
        skillCheck: { skill: 'perception', dc: 11, successAppend: 'The volume numbers in the manifest tell a sustainability story: the facility\'s current yield output is approximately 34% voluntary, 28% involuntary, and 38% from donor contracts that don\'t clearly distinguish. The voluntary rate has been declining for six months. The involuntary rate has been rising. The total output is holding steady. The composition is shifting.' },
      },
      {
        keywords: ['temperature', 'cold', 'air', 'cool'],
        description: 'The maintained temperature is a significant power expenditure — cold storage at this scale requires continuous refrigeration. The facility prioritizes this above most other systems. The yield is only valuable fresh. The infrastructure exists to keep it that way. The infrastructure was built for a hospital. It has been repurposed without modification, because the purpose is the same: preserve blood.',
      },
    ],
    hollowEncounter: {
      baseChance: 0.05,
      timeModifier: { day: 0.5, night: 0.8, dawn: 0.5, dusk: 0.7 },
      threatPool: [
        { type: 'shuffler', weight: 60, quantity: { min: 1, max: 2, distribution: 'weighted_low' } },
        { type: 'remnant', weight: 40, quantity: { min: 1, max: 1, distribution: 'single' } },
      ],
    },
    narrativeNotes: 'pens_12. The Accord complicity detail lands here. Deep Waypoint 7 as a destination seeds the The Deep zone connection. The voluntary/involuntary ratio shift is the statistical version of what players have already seen qualitatively.',
  },

  {
    id: 'pens_13_staff_quarters',
    name: 'The Pens — Staff Quarters',
    zone: 'the_pens',
    act: 2,
    difficulty: 2,
    visited: false,
    flags: {},
    description: 'The staff quarters occupy the south wing — former administrative offices converted into private sleeping rooms, one per staff member. The doors are not barred. The rooms have locks on the inside. This is the side of The Pens where people who work here live, and the mundane reality of that is its own disclosure: a corkboard with a coffee schedule, someone\'s laundry hung over a chair, a worn deck of cards left face-down on a common-room table. A Red Court enforcer off duty reads a salvage paperback in a chair near the window. Another two talk in low voices in the corner, their body language the universal language of people complaining about their shift. The staff are not monsters in the way monsters are usually imagined. They have bad days and card games and coffee schedules. They do their job and then they come here and they are, in the diminished specific sense that the Collapse allows, people with lives.',
    descriptionNight: 'Night in the staff quarters: lights out in most rooms, the low sounds of sleep, one or two windows lit where someone works late or can\'t stop thinking. The enforcer who reads is still reading.',
    shortDescription: 'Red Court staff housing. Mundane. Coffee schedule. Card games. Their lives.',
    exits: { north: 'pens_08_administration' },
    richExits: {
      north: { destination: 'pens_08_administration', descriptionVerbose: 'back north to the administration wing' },
    },
    items: ['scavenged_rations', 'water_bottle_sealed'],
    enemies: [],
    npcs: ['salter_off_duty', 'brig_guard'],
    extras: [
      {
        keywords: ['corkboard', 'coffee', 'schedule', 'sign'],
        description: 'The coffee schedule is a hand-drawn grid with six names. Someone has made a small cartoon of a coffee cup next to their name. The schedule rotates weekly. Someone crossed out one name in pencil and wrote another. The crossed-out person is no longer on staff, or is no longer alive, or transferred. The schedule was updated without ceremony.',
      },
      {
        keywords: ['book', 'reading', 'enforcer', 'off duty', 'paperback'],
        description: 'The enforcer reading near the window has a salvage paperback — the cover is gone, the spine is cracked, you can\'t tell the title. They look up when you pass, assess you in the practiced two-second way of their profession, determine you are not a problem, and go back to reading. They are not hostile. They are off the clock. The off-clock version of this person has a favorite book.',
        skillCheck: { skill: 'negotiation', dc: 9, successAppend: 'They\'ll talk if you approach right. Off-duty and not looking for a confrontation, the enforcer will answer a few questions about the facility — not about policy, not about the cells, but about logistics and layout. They know this place. They live here. That knowledge is the kind that comes from habit, not briefing.' },
      },
      {
        keywords: ['cards', 'deck', 'game', 'table'],
        description: 'The worn deck of cards on the common-room table has been used enough that the face cards are distinguishable by the wear patterns on the backs — you could read them from across the table if you\'d played enough hands. The game played here, based on the scoring sheet left beside it, is a variant of rummy with a Red Court token economy. The scoring sheet goes back three months. The same six names appear throughout. They have been playing the same game together for three months.',
      },
    ],
    hollowEncounter: {
      baseChance: 0.03,
      timeModifier: { day: 0.4, night: 0.7, dawn: 0.5, dusk: 0.6 },
      threatPool: [
        { type: 'shuffler', weight: 70, quantity: { min: 1, max: 2, distribution: 'weighted_low' } },
        { type: 'remnant', weight: 30, quantity: { min: 1, max: 1, distribution: 'single' } },
      ],
    },
    narrativeNotes: 'pens_13. The humanizing counterweight to pens_09. The staff are not abstracted evil — they are people with card games and coffee schedules who do this for a living. The zone\'s tone requires this room.',
  },

  {
    id: 'pens_14_rooks_office',
    name: 'The Pens — Rook\'s Office',
    zone: 'the_pens',
    act: 2,
    difficulty: 3,
    visited: false,
    flags: { hiddenRoom: true, questHub: true },
    description: 'Rook\'s private office is below the administration wing, reached by the unmarked stair. It is a smaller room than the administrative authority it houses would suggest — a desk, a chair, two filing cabinets, a map of the facility on the wall with annotations in red ink. The desk has a working lamp. On the desk: an open ledger with Rook\'s handwriting, an uncapped pen, and a folded letter that has not been sealed. The letter is addressed to the Red Court Council. The letter has not been sent. Rook is here, at the desk, in the chair, in the posture of someone who stopped working mid-thought and is now somewhere inside the thought. They look at you when you enter. They do not reach for a weapon. They do not call for a guard. They look at you with the specific expression of someone who has been waiting for a conversation they did not know how to start.',
    descriptionNight: 'Rook works late. The lamp is always on. The letter is always on the desk. Some nights the pen is uncapped and some nights it is not.',
    shortDescription: 'Rook\'s private office. The unsent letter. Evidence of what The Pens really is.',
    exits: { up: 'pens_08_administration' },
    richExits: {
      up: { destination: 'pens_08_administration', descriptionVerbose: 'back up the stairs to the administration wing' },
    },
    items: ['rooks_letter'],
    enemies: [],
    npcs: ['rook'],
    npcSpawns: [
      {
        npcId: 'rook',
        spawnChance: 0.95,
        spawnType: 'anchored',
        activityPool: [
          { desc: 'is seated at the desk, pen in hand, the letter on the surface before them — not reading it, not writing, simply present with it', weight: 3 },
          { desc: 'is standing at the facility map, one hand touching a notation in red ink, the expression of someone recalculating something they have already calculated many times', weight: 2 },
          { desc: 'is reviewing the yield ledger with a mechanical attention that is not the same as interest', weight: 2, timeRestrict: ['day'] },
          { desc: 'sits in the chair with the lamp off, in the dark, in the specific posture of someone who is not sleeping and is not ready to stop sitting yet', weight: 2, timeRestrict: ['night'] },
        ],
        dispositionRoll: { friendly: 0.00, neutral: 0.45, wary: 0.40, hostile: 0.15 },
        dialogueTree: 'rook_office_dialogue',
        questGiver: ['pens_rook_confrontation', 'pens_rook_ledger_reveal'],
        narrativeNotes: 'Rook in their office is a different version than Rook at the facility entrance. Here they are private, without the institutional authority of the role. The unsent letter is the reason. The player is the first person Rook has allowed to see this version.',
      },
    ],
    extras: [
      {
        keywords: ['letter', 'note', 'paper', 'folded', 'unsent'],
        description: 'The letter on the desk is addressed TO THE COUNCIL and is not sealed. It begins: "I am writing this knowing I will not send it." You have found the letter that explains what Rook knows and has chosen and what that choosing costs, written for no audience and kept for no purpose except that some things require being written down.',
        questFlagOnSuccess: { flag: 'pens_rooks_letter_found', value: true },
      },
      {
        keywords: ['map', 'facility', 'annotations', 'red', 'ink'],
        description: 'The facility map has Rook\'s annotations in red ink: extraction room capacity notes, ward population maximums, holding cell rotation schedules, a route marked between research wing and a location outside the facility labeled TRANSIT POINT 4. The map is a complete operational picture. The red ink notations are the decisions behind the clipboard, the numbers behind the euphemisms.',
        skillCheck: { skill: 'perception', dc: 10, successAppend: 'TRANSIT POINT 4 is marked outside the facility perimeter, in a direction that corresponds to a road that runs northwest. The notation has a time code — a regular schedule. The research wing\'s AB-negative material goes to Transit Point 4 on a schedule that bypasses the cold storage manifest. It does not go to the Accord. It goes somewhere else.' },
      },
      {
        keywords: ['ledger', 'numbers', 'yield', 'rook'],
        description: 'The open ledger on the desk is different from the administration records upstairs. This one has Rook\'s personal annotations alongside the official figures: small marks, private shorthand, numbers that don\'t appear in the official record. The totals in Rook\'s private column don\'t match the totals in the official column. The difference is not large. It is systematic.',
        skillCheck: { skill: 'perception', dc: 12, successAppend: 'The discrepancy between Rook\'s private column and the official yield figures represents a consistent 3–4% diversion. The diverted yield does not appear in the Accord manifest. It does not appear in any distribution record you have seen. Rook has been skimming yield from the Red Court\'s own extraction operation. The question is why, and where it goes.' },
      },
      {
        keywords: ['rook', 'castellan', 'them', 'expression'],
        description: 'Rook watches you examine the room without moving from the chair. Their expression is not the controlled neutral of the facility\'s public face. It is the expression of someone who has made a specific decision and is not sure, in this moment, whether it was the right one. "You\'ve seen it," they say. Not a question. "All of it." A pause. "So have I."',
        questFlagOnSuccess: [
          { flag: 'pens_rook_dialogue_unlocked', value: true },
          { flag: 'pens_rook_met_in_office', value: true },
        ],
      },
    ],
    hollowEncounter: {
      baseChance: 0.03,
      timeModifier: { day: 0.3, night: 0.5, dawn: 0.4, dusk: 0.4 },
      threatPool: [
        { type: 'shuffler', weight: 60, quantity: { min: 1, max: 1, distribution: 'single' } },
        { type: 'remnant', weight: 40, quantity: { min: 1, max: 1, distribution: 'single' } },
      ],
    },
    narrativeNotes: 'pens_14. The zone\'s emotional and narrative apex. Rook\'s private version, the unsent letter, the yield discrepancy, the Transit Point 4 mystery — all converge here. The player arrives having seen everything the zone has to show, and Rook already knows it.',
  },
]
