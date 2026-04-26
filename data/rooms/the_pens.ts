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
    exits: { east: 'pens_02_intake_hall', west: 'sc_15_creek_ford' },
    richExits: {
      east: { destination: 'pens_02_intake_hall', descriptionVerbose: 'through the checkpoint gate into the intake hall' },
      west: { destination: 'sc_15_creek_ford', descriptionVerbose: 'west, back along the creek road toward Salt Creek' },
    },
    items: [],
    enemies: ['red_court_enforcer'],
    npcs: ['pens_gate_sentry'],
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
      baseChance: 0.50,
      timeModifier: { day: 0.75, night: 0.8, dawn: 0.6, dusk: 0.7 },
      threatPool: [
        { type: 'shuffler', weight: 70, quantity: { min: 1, max: 2, distribution: 'weighted_low' } },
        { type: 'remnant', weight: 30, quantity: { min: 1, max: 1, distribution: 'single' } },
        { type: 'lucid_thrall', weight: 5, quantity: { min: 1, max: 1, distribution: 'flat' } },
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
    npcs: ['pens_intake_officer', 'pens_intake_orderly'],
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
    personalLossEchoes: {
      child: 'The family of four in the waiting chairs. Two children. The youngest has a wristband already. You watch the mother watching the clerk and you recognize the expression: someone who has decided, and is not revisiting it. You made decisions like that. For them. You hope the ones you made were better than this.',
      partner: 'Soft music plays from the PA system. Light jazz. The kind that played in waiting rooms. You sat in a waiting room with them once — a different kind of waiting, a different kind of outcome — and the music was the same kind of nothing, designed to say that nothing alarming is happening. The music lied then too.',
      community: 'Three intake clerks processing fifty intakes a day. The system is efficient and the efficiency is the horror — the machinery of belonging, of being processed into a place, reduced to a wristband color. Your community didn\'t have intake forms. It had doors that were always open. The difference is everything.',
      identity: 'The intake form asks for: name, age, blood type, medical history, voluntary status. The form assumes you know these things about yourself. You look at the fields and you\'re not sure what you would write. The name field is a question you can\'t answer with confidence. The form has a YES checkbox for voluntary status and no NO. You understand the design.',
      promise: 'VOLUNTARY INTAKE — LEFT. REFERRAL CASES — RIGHT. The signage is clear and the process is efficient and you stand in the lobby and think about the things you promised. The people in these chairs made a calculation. You made a promise. The difference between a calculation and a promise is that a promise has a person on the other end of it.',
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
    npcSpawns: [
      {
        npcId: 'lyris_red_court',
        spawnChance: 0.60,
        spawnType: 'patrol',
        activityPool: [
          { desc: 'Lyris moves through the corridor on a security pass — measured, deliberate, still practicing the form of someone who does this without thinking about it.', weight: 3 },
          { desc: 'Lyris has stopped at the bulletin board and is reading the donor calendar with an expression that is hard to place. She notices you and straightens.', weight: 2, timeRestrict: ['day'] },
        ],
        dispositionRoll: { friendly: 0.20, neutral: 0.55, wary: 0.20, hostile: 0.05 },
        dialogueTree: 'pens_lyris_conflict',
      },
    ],
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
    personalLossEchoes: {
      child: 'A photograph tacked to a curtain rail. A carved wooden figure on a bedside table. The personal items of people who have personalized a cage. You look for children\'s things — a drawing, a toy, evidence. You find reading glasses, a library book, a pair of clean socks laid out for morning. No children\'s things. That\'s either relief or a different kind of horror.',
      partner: 'The woman near the window has watched the light change from this window for six months. Six months. You think about the things you would watch for six months if you couldn\'t move — the same view, the same light, the same pattern of dawn. You watched them sleep once, the same way, tracking the light on a face you loved. The watching is the same. The loss is different.',
      community: 'Thirty people in various states of rest. Some sleeping, some reading, some staring at the ceiling. A ward. A community of the reduced — people who made the same calculation and arrived at the same cots. You had a community of the chosen once. The difference is consent, and consent here is complicated, and you don\'t want to think about it.',
      identity: 'The personal items pinned to curtain rails — photographs, carved figures, books. The identities people carry when everything else is stripped away. A family portrait. A dog. A building you almost recognize. You carry identity the same way: in fragments, in objects, in the things you don\'t let go of even when you can\'t remember why you\'re holding them.',
      promise: 'The woman says: "Six months." Not angry. Not proud. Just the fact of it. She made a deal and she\'s keeping it. You made a promise and you\'re keeping it. The forms are different — hers is a wristband, yours is a word spoken aloud — but the weight is the same. You are both people who do what they said they would do.',
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
    description: 'The blue-wristband corridor is maintained — lights working, floor swept, the clinical smell of disinfectant applied on schedule. But the temperature is different from Ward A: cooler by two degrees, the ventilation more aggressive, the lighting colder. A-positive donors are less in demand than O-negative; the benefits package reflects this. The donors here move with the economy of motion of people who have calculated their situation precisely and found that the calculation comes out the same every time. A bulletin board carries the same laminated schedules as Ward A. No handwritten additions. The birthdays board is empty. Someone put it up optimistically and no one has written anything on it.',
    descriptionNight: 'The Ward B corridor at night is quieter than the day would suggest it should be. The donors who are awake are awake the way people are awake who can\'t sleep rather than the way people are awake who chose to stay up. The cold fluorescent light runs all night. No one has asked for it to be dimmed. No one expects accommodation.',
    shortDescription: 'Ward B corridor. Blue wristbands. Colder. Quieter. The birthday board is empty.',
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
      {
        keywords: ['schedule', 'draw', 'frequency', 'extraction', 'calendar'],
        description: 'The draw schedule in Ward B is posted on the back of the clinic door: A-positive donors, bi-weekly draws, ten-day minimum recovery interval. Same schedule as Ward A on paper. But the recovery room in Ward B runs at higher utilization — the bed count and the rotation log suggest the actual recovery window here is shorter. The paperwork says ten days. The log says seven.',
        skillCheck: { skill: 'field_medicine', dc: 12, successAppend: 'Seven-day recovery instead of ten for a regular bi-weekly draw is within acceptable medical parameters — technically. But it narrows the margin. Over six months, the cumulative difference in iron levels and platelet recovery between a seven-day and ten-day rotation becomes significant. Someone knows this. The question is whether the someone who knows it is the same someone who set the schedule.' },
      },
    ],
    personalLossEchoes: {
      child: 'The empty birthday board. Someone put it up expecting names and dates, the small celebrations that make a place feel like somewhere people live. No one wrote anything. You think about birthdays you kept track of — the date, the cake, the small face — and the calendar that stopped mattering when they were gone.',
      partner: 'Two degrees colder than the other corridor, which is already cold. The ventilation hums a slightly higher pitch. You notice these things the way you notice the absence of a person in a room — not a dramatic absence, just the wrong temperature, the wrong frequency, the space where warmth used to be.',
      community: 'Ward B donors don\'t talk to each other the way Ward A donors do. They sit alone or in pairs. The community here is thinner — lower incentives, lower demand, less reason to invest in the place. Your community had every reason to invest and still lost the thread. You\'re not sure which is worse.',
      identity: 'Blue wristband: A-positive. You look at the wristbands. You don\'t know your blood type with certainty, which means you don\'t know which corridor you\'d be in, which schedule you\'d be on, which version of this calculus would be yours. The form at intake asks for blood type self-reported. You would have to guess.',
      promise: 'Voluntary status, technically. The schedule is shorter than it should be and the recovery window has been trimmed and the birthday board is empty and the people here made a calculation that worked out to: this, for as long as this is what works out. You made a promise that was supposed to prevent this from being anyone\'s best option. It didn\'t work. You kept the promise anyway. It didn\'t matter.',
    },
    hollowEncounter: {
      baseChance: 0.02,
      timeModifier: { day: 0.4, night: 0.6, dawn: 0.4, dusk: 0.5 },
      threatPool: [
        { type: 'shuffler', weight: 100, quantity: { min: 1, max: 1, distribution: 'single' } },
      ],
    },
    environmentalRolls: {
      flavorLines: [
        { line: 'The fluorescent light hums at a frequency you feel in your teeth. The people under it have stopped hearing it. You have not stopped hearing it yet.', chance: 0.25, time: null },
        { line: 'A door opens somewhere in the ward and closes again. The person sitting against the wall looks up. It is not the person they are waiting for.', chance: 0.20, time: null },
        { line: 'The disinfectant smell is stronger near the extraction room door. Clean is a word that works harder in this corridor than anywhere else you have been.', chance: 0.15, time: null },
      ],
    },
    narrativeNotes: 'pens_06. Ward B is the same system, colder and more controlled. The missing birthday calendar, the shortened recovery window in the draw schedule, and the Wednesday office hours note do the work. The ethical horror here is procedural optimization, not cruelty.',
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
    descriptionNight: 'Night meal is quieter, fewer people. The kitchen runs reduced service but the food quality holds. Some donors eat alone. Most eat together. The noise level is the noise level of a shared meal — spoons, conversation, the sounds of people who have adapted to this. You watch for what\'s missing. Nothing is.',
    shortDescription: 'Donor cafeteria. Better food than most settlements. The cost is on their arms.',
    exits: { south: 'pens_06_ward_b_corridor', west: 'pens_03_ward_a_corridor' },
    richExits: {
      south: { destination: 'pens_06_ward_b_corridor', descriptionVerbose: 'back south to the Ward B corridor' },
      west: { destination: 'pens_03_ward_a_corridor', descriptionVerbose: 'west to the Ward A corridor' },
    },
    items: ['preserved_rations', 'water_bottle_sealed'],
    enemies: [],
    npcs: ['pens_cafeteria_cook', 'pens_donor_long_term', 'pens_donor_ward_b'],
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
    personalLossEchoes: {
      child: 'The laughter at the far table. Real laughter, from a person who has been here eight months and has made their peace with it. You think about the meals you made for them — not this quality, not this variety, but made with a different kind of investment. The Red Court feeds people to keep them productive. You fed them because the act of feeding was the act of love, and the two things used the same gestures and produced the same sounds and were not the same thing at all.',
      partner: 'Someone laughing at the far end of a table. The sound of it reaches you across the cafeteria the way certain sounds used to reach you across rooms where they were — specific, locatable, drawing your attention before your mind caught up. The cafeteria is full of shared meals and you remember shared meals and the fork in your hand feels different when you remember who used to sit across from you.',
      community: 'Sixty people at long tables, the noise level of any communal dining space. Conversation, clatter, someone laughing. The infrastructure of community, performed in a place that harvests the people performing it. Your community ate together too. The tables were different. The warmth was different. The laughter was not optimized for yield.',
      promise: 'The food is better here than anywhere in the Breaks. The bed is softer than ground. The calculation makes sense if you don\'t look at the cost, and the cost is visible on every forearm. Your promise was supposed to be a calculation too — an exchange, a debt, a thing given for a thing owed. You watch the donors eat and you wonder if your promise has a yield classification somewhere in a ledger you haven\'t seen.',
    },
    environmentalRolls: {
      flavorLines: [
        { line: 'The smell of hot food is a physical event after days of trail rations. Your body responds before your ethics do.', chance: 0.25, time: null },
        { line: 'A donor holds out a piece of bread to the person beside them. The person takes it. The gesture is ordinary and therefore extraordinary.', chance: 0.15, time: null },
        { line: 'The server behind the counter has not made eye contact with anyone in the time you have been watching. The ladle moves. The portions are exact. The eyes are elsewhere.', chance: 0.20, time: null },
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
    npcs: ['pens_admin_clerk', 'pens_scheduling_officer'],
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
      baseChance: 0.50,
      timeModifier: { day: 0.80, night: 1.0, dawn: 0.7, dusk: 0.8 },
      threatPool: [
        { type: 'shuffler', weight: 60, quantity: { min: 1, max: 2, distribution: 'weighted_low' } },
        { type: 'remnant', weight: 40, quantity: { min: 1, max: 1, distribution: 'single' } },
      ],
    },
    npcSpawns: [
      {
        npcId: 'kade_red_court',
        spawnChance: 0.70,
        spawnType: 'anchored',
        activityPool: [
          { desc: 'Kade is working at one of the administration desks, writing in a journal. He doesn\'t look up when you enter, but his pen slows.', weight: 3 },
          { desc: 'Kade stands at the scheduling board, studying the grid with the patient attention of someone reading a text they\'ve read before.', weight: 2 },
        ],
        dispositionRoll: { friendly: 0.15, neutral: 0.55, wary: 0.25, hostile: 0.05 },
        dialogueTree: 'pens_kade_philosophy',
      },
      {
        npcId: 'the_wren',
        spawnChance: 0.15,
        spawnType: 'wanderer',
        quantity: { min: 1, max: 1, distribution: 'single' },
        activityPool: [
          { desc: 'A lean man in clothes chosen for silence stands at the filing cabinets, pulling a folder with the methodical attention of someone who has done this search before and expects to do it again. He reads standing up. He reads fast. He does not sit down because sitting down implies staying, and staying implies this is where he wants to be.', weight: 3 },
          { desc: 'The Wren checks intake records at the nearest desk, cross-referencing something against a list he carries folded in his jacket pocket. The list is handwritten. The handwriting is precise in the way that precision becomes a form of self-control. He finds what he is looking for. His expression does not change. He folds the list and puts it back.', weight: 2 },
          { desc: 'The Wren stands at the scheduling board, not reading it — memorizing it. The grid of names and dates reflected in his pale eyes. He is building a map of this facility in his head, the way he once built maps of missing persons cases, and the efficiency of the skill applied to this purpose is something he has stopped thinking about because thinking about it is a luxury the job does not allow.', weight: 2 },
        ],
        dispositionRoll: { friendly: 0.00, neutral: 0.35, wary: 0.50, hostile: 0.15 },
        narrativeNotes: 'The Wren in administration is The Wren at work — the hunter checking files, the detective running cases, the professional whose competence is the thing he hates most about himself. Low spawn chance reflects that he does not linger here. He gets what he needs and leaves.',
      },
    ],
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
    exits: { west: 'pens_08_administration', east: 'pens_10_extraction_room_b', south: 'pens_17_quarantine_wing' },
    richExits: {
      west: { destination: 'pens_08_administration', descriptionVerbose: 'back west to administration' },
      east: { destination: 'pens_10_extraction_room_b', descriptionVerbose: 'east to the involuntary extraction room' },
      south: { destination: 'pens_17_quarantine_wing', descriptionVerbose: 'south through a heavy plastic curtain into the quarantine wing', hidden: true, discoverSkill: 'perception', discoverDc: 11, discoverMessage: 'Past the last holding cell, a corridor continues south behind a series of heavy plastic curtain barriers. The plastic is opaque. Something hums beyond it — ventilation running at a different pressure than the rest of the wing.' },
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
        description: 'The enforcers at the corridor entrance are very still — the stillness of people who have decided not to think about what they are guarding. One of them meets your eyes briefly and looks away. There is something in the look — not shame, not apology, not agreement. Just acknowledgment that you saw each other, and that both of you know what this place is.',
      },
    ],
    hollowEncounter: {
      baseChance: 0.50,
      timeModifier: { day: 0.80, night: 1.0, dawn: 0.7, dusk: 0.8 },
      threatPool: [
        { type: 'shuffler', weight: 60, quantity: { min: 1, max: 2, distribution: 'weighted_low' } },
        { type: 'remnant', weight: 40, quantity: { min: 1, max: 1, distribution: 'single' } },
        { type: 'lucid_thrall', weight: 5, quantity: { min: 1, max: 1, distribution: 'flat' } },
      ],
    },
    personalLossEchoes: {
      child: 'Someone pacing in a cell. Someone sleeping badly. You listen through the bars and you hear the sounds of people who didn\'t choose this, and you think about the children who didn\'t choose anything — didn\'t choose to be born into this world, didn\'t choose to lose what they lost. The bars don\'t know the difference between a grown person and a small one. The bars don\'t know anything.',
      partner: 'Two people having a conversation through the wall in the specific low register of people who have learned to talk without the guards hearing. The intimacy of whispered speech through concrete. You had whispered conversations in the dark once. Not through a wall. Not out of fear. The register was the same.',
      community: 'Five occupied cells. Red wristbands on every wrist. These people were classified. Someone decided they belong here. Your community classified people too — neighbors, friends, family — but the classification was chosen, mutual, warm. The difference between belonging and being sorted is the difference between a home and a cell.',
      identity: 'The windows are painted over. Thick paint, blocking all outside light orientation. Disorientation as a management tool. You know what it\'s like to not know where you are, to lose the reference points that tell you who you are. The painted windows are a forced version of what you carry naturally — the disorientation of a self that can\'t orient to its own history.',
      promise: 'The enforcer at the corridor entrance meets your eyes briefly and looks away. Not shame. Not apology. Just acknowledgment. You think about the promises that were broken to put these people here — the promises of safety, of civilization, of the social contract that says you don\'t put people in cages. Your promise is about one person. These broken promises are about everyone.',
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
        description: 'The technician moves through the room with the same efficiency as the technician in Room A. The procedure is identical. They check lines, note readings, adjust the collection bag position. They do not speak to the people in the occupied chairs. The people in the occupied chairs do not speak either. The silence is absolute — no conversation, no sound between the chair occupants and the staff, just the equipment noise and the ambient hum.',
        skillCheck: { skill: 'perception', dc: 10, successAppend: 'The technician\'s hands are steady. Their expression is neutral. Their eyes, when they pass near you, are the eyes of someone who has found a place to put this that works for them during working hours. What happens after working hours is their own problem.' },
      },
      {
        keywords: ['chart', 'blood', 'type', 'laminated', 'poster'],
        description: 'The same blood type efficiency chart as Room A. Same lamination, same handwritten updates in pen. The chart applies equally here — the extraction process optimizes by blood type regardless of donor category. The optimization does not stop at the door.',
      },
    ],
    hollowEncounter: {
      baseChance: 0.50,
      timeModifier: { day: 0.80, night: 1.0, dawn: 0.7, dusk: 0.8 },
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
    exits: { east: 'pens_08_administration', south: 'pens_15_surgical_theater' },
    richExits: {
      east: { destination: 'pens_08_administration', descriptionVerbose: 'back east to the administration wing' },
      south: { destination: 'pens_15_surgical_theater', descriptionVerbose: 'south through a heavy fire door into the surgical theater', locked: true, lockedBy: 'red_court_key' },
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
      baseChance: 0.50,
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
    exits: { down: 'pens_08_administration', north: 'pens_16_waste_processing' },
    richExits: {
      down: { destination: 'pens_08_administration', descriptionVerbose: 'stairs back down to administration' },
      north: { destination: 'pens_16_waste_processing', descriptionVerbose: 'north through a sealed utility door into waste processing', hidden: true, discoverSkill: 'perception', discoverDc: 12, discoverMessage: 'A utility door at the north end of the cold storage floor is marked with a biohazard trefoil and nothing else. The seal is intact but the handle has been used recently — the dust pattern is broken.' },
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
      baseChance: 0.50,
      timeModifier: { day: 0.75, night: 0.8, dawn: 0.5, dusk: 0.7 },
      threatPool: [
        { type: 'shuffler', weight: 60, quantity: { min: 1, max: 2, distribution: 'weighted_low' } },
        { type: 'remnant', weight: 40, quantity: { min: 1, max: 1, distribution: 'single' } },
      ],
    },
    npcSpawns: [
      {
        npcId: 'vex_red_court',
        spawnChance: 0.75,
        spawnType: 'anchored',
        activityPool: [
          { desc: 'Vex is working through the shipping manifest at the central table, cross-checking bag counts against a clipboard. The pen moves without pausing.', weight: 4 },
          { desc: 'Vex is staging collection bags near the loading door, arranging them by blood type with the automatic precision of someone who has done this hundreds of times.', weight: 3 },
        ],
        dispositionRoll: { friendly: 0.05, neutral: 0.65, wary: 0.25, hostile: 0.05 },
        dialogueTree: 'pens_vex_manifest',
      },
    ],
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
    npcSpawns: [
      {
        npcId: 'the_wren',
        spawnChance: 0.20,
        spawnType: 'wanderer',
        quantity: { min: 1, max: 1, distribution: 'single' },
        activityPool: [
          { desc: 'The Wren sits in a chair near the window with a stillness that is not rest. He is off duty in the way that a weapon is off duty when it is cleaned and set aside — technically inactive, functionally the same object. His eyes move to the window and stay there. Whatever he sees in the dark outside is not the same thing other people see in the dark outside.', weight: 3, timeRestrict: ['night', 'dusk'] },
          { desc: 'The Wren stands at the common-room table where the card game happens, not playing, not watching, just present in the space where people do normal things. He picks up a card from the discard pile, turns it over, sets it back. The gesture has the quality of someone remembering a language they used to speak.', weight: 2 },
          { desc: 'The Wren is cleaning his knife at the table with a cloth and a can of oil, each stroke the same length, the same pressure, the same direction. The efficiency of someone who wants to be done. Not done with the knife. Done with the day. Done with the series of decisions that led to this chair in this room in this facility, cleaning this knife that has been used for things the coffee schedule on the corkboard does not account for.', weight: 2, timeRestrict: ['night'] },
        ],
        dispositionRoll: { friendly: 0.05, neutral: 0.40, wary: 0.45, hostile: 0.10 },
        narrativeNotes: 'The Wren off duty. His internal struggle is visible here in a way it is not in the administration wing. The card he picks up and puts down. The window he watches. The knife cleaned with the mechanical attention of someone who has automated the parts of his life he cannot bear to think about. He is a former detective who tracks people for a blood extraction operation, and in this room, at this hour, that fact sits on him like weather.',
      },
    ],
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
      baseChance: 0.50,
      timeModifier: { day: 0.70, night: 0.7, dawn: 0.5, dusk: 0.6 },
      threatPool: [
        { type: 'shuffler', weight: 70, quantity: { min: 1, max: 2, distribution: 'weighted_low' } },
        { type: 'remnant', weight: 30, quantity: { min: 1, max: 1, distribution: 'single' } },
      ],
    },
    personalLossEchoes: {
      child: 'The corkboard with the coffee schedule. Someone\'s laundry hung over a chair. A worn deck of cards. The banality of the lives lived here — the people who go home after their shift at the blood facility and play rummy and hang laundry. You wonder if any of them have children. You wonder if the children know what their parents do during the day.',
      partner: 'An enforcer off duty reads a salvage paperback near the window. The domesticity of the scene — a person reading in a chair by a window — is so ordinary that it aches. You had this. The quiet evening. The other person in the room doing their own thing. The profound normalcy of two people existing in the same space without needing to speak.',
      community: 'The scoring sheet goes back three months. The same six names throughout. They have been playing the same game together for three months. A community of six people who process tragedy all day and then play cards together at night. You understand the need. Your community played games too. The games were the point. The games were the proof that normal still existed.',
      identity: 'One name on the coffee schedule is crossed out in pencil and another written in. The crossed-out person is no longer here. The schedule was updated without ceremony. You think about your own name — whether it\'s written somewhere that has been updated since you disappeared, whether someone crossed you out and wrote someone else in, whether the schedule went on without you.',
      promise: 'The staff are not monsters. They have bad days and card games and coffee schedules. They do their job. The ordinariness of it is the horror — that a person can process the paperwork of captivity and then go home and fold their laundry. You made a promise to do something difficult. At least you know it\'s difficult. At least the difficulty is not lost on you.',
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
    exits: { up: 'pens_08_administration', south: 'pens_18_transit_tunnel' },
    richExits: {
      up: { destination: 'pens_08_administration', descriptionVerbose: 'back up the stairs to the administration wing' },
      south: { destination: 'pens_18_transit_tunnel', descriptionVerbose: 'south through a concealed passage behind the filing cabinets', hidden: true, discoverSkill: 'perception', discoverDc: 13, discoverMessage: 'The filing cabinet nearest the south wall moves. Not freely — it resists, but it moves, on rails recessed into the floor. Behind it: a passage, narrow and unlit, sloping downward. The air that comes from it is cold and carries the faint chemical tang of preserved biological material in transport.' },
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
        questFlagOnSuccess: { flag: 'transit_point_4_schedule_noted', value: true },
      },
      {
        keywords: ['ledger', 'numbers', 'yield', 'rook'],
        description: 'The open ledger on the desk is different from the administration records upstairs. This one has Rook\'s personal annotations alongside the official figures: small marks, private shorthand, numbers that don\'t appear in the official record. The totals in Rook\'s private column don\'t match the totals in the official column. The difference is not large. It is systematic.',
        skillCheck: { skill: 'perception', dc: 12, successAppend: 'The discrepancy between Rook\'s private column and the official yield figures represents a consistent 3–4% diversion. The diverted yield does not appear in the Accord manifest. It does not appear in any distribution record you have seen. Rook has been skimming yield from the Red Court\'s own extraction operation. The question is why, and where it goes.' },
        questFlagOnSuccess: { flag: 'pens_yield_discrepancy_found', value: true },
      },
      {
        keywords: ['rook', 'castellan', 'them', 'expression'],
        description: 'Rook watches you examine the room without moving from the chair. Their expression is not the controlled neutral of the facility\'s public face. It is the expression of someone who has made a specific decision and is not sure, in this moment, whether it was the right one. "You\'ve seen it," they say. Not a question. "All of it." A pause. "So have I."',
        questFlagOnSuccess: [
          { flag: 'pens_rook_dialogue_unlocked', value: true },
          { flag: 'pens_rook_met_in_office', value: true },
        ],
      },
      {
        keywords: ['vesper', 'duskhollow', 'covenant', 'arrangement', 'tithe'],
        description: 'You mention Duskhollow. Rook\'s pen stops moving. The silence that follows is not hesitation — it is the silence of someone selecting words from a very short list. "Vesper\'s arrangement," Rook says. The word \'arrangement\' does precise, unsentimental work. "A philosophy professor who built a blood tithe and called it coexistence. The residents give blood on a schedule. The Sanguine provide protection. Vesper writes papers about the moral standing of symbiotic relationships." Rook uncaps the pen and recaps it. A mechanical gesture, repeated. "It is a more elaborate way of arriving at the same conclusion. The blood moves from the people who have it to the people who need it, and the people who have it are told it was their choice. Vesper believes this. That is the difference between us. I do not require myself to believe it." Rook sets the pen down with the finality of a period. "The Covenant is The Pens with better lighting and a reading list. Vesper would disagree. Vesper is wrong in ways that require a university education to achieve."',
      },
    ],
    hollowEncounter: {
      baseChance: 0.50,
      timeModifier: { day: 0.70, night: 0.5, dawn: 0.4, dusk: 0.4 },
      threatPool: [
        { type: 'shuffler', weight: 60, quantity: { min: 1, max: 1, distribution: 'single' } },
        { type: 'remnant', weight: 40, quantity: { min: 1, max: 1, distribution: 'single' } },
      ],
    },
    narrativeNotes: 'pens_14. The zone\'s emotional and narrative apex. Rook\'s private version, the unsent letter, the yield discrepancy, the Transit Point 4 mystery — all converge here. The player arrives having seen everything the zone has to show, and Rook already knows it.',
  },

  {
    id: 'pens_15_surgical_theater',
    name: 'The Pens — Surgical Theater',
    zone: 'the_pens',
    act: 2,
    difficulty: 5, // Endgame content
    visited: false,
    flags: { hiddenRoom: true, dark: true },
    description: 'The surgical theater is a pre-Collapse operating room that has been expanded rather than repurposed — the original surgical table remains at the center, flanked by two additional tables that were never designed for this space, brought in from somewhere else, bolted to the floor at angles that accommodate the overhead surgical lighting array. The lights are adjustable and someone has adjusted them with precision: three cones of white illumination on three tables, the rest of the room in functional dark. Instrument trays line the east wall — not the extraction room\'s phlebotomy kit but a full surgical complement: retractors, bone saws, rib spreaders, oscillating drills, and things you do not have names for that are clean and oiled and arranged in the sequence of a procedure you hope never to understand. A drain channel runs the length of the floor beneath the tables, terminating at a grate in the north wall. The drain is stained in a way that mopping has not fully addressed. The room smells like iodine and iron and the particular absence of smell that comes from aggressive chemical sanitization of a space that keeps needing to be sanitized.',
    descriptionNight: 'The theater operates on its own schedule. At night the surgical lights are off but the instrument trays are still set — pre-staged, the technician\'s term, meaning the next procedure has already been planned and the instruments selected for it. The room waits with the patience of a set table.',
    shortDescription: 'Surgical theater. Three tables. Full instrument set. The drain is stained.',
    exits: { north: 'pens_11_research_wing' },
    richExits: {
      north: { destination: 'pens_11_research_wing', descriptionVerbose: 'north through the fire door back to the research wing' },
    },
    items: ['chemicals_basic'],
    enemies: ['red_court_enforcer'],
    npcs: ['reclaimer_technician'],
    itemSpawns: [
      { entityId: 'field_surgery_kit', spawnChance: 0.25, quantity: { min: 1, max: 1, distribution: 'single' }, conditionRoll: { min: 0.6, max: 0.9 }, groundDescription: 'A field surgery kit sits on the counter near the door, separate from the main instrument trays — portable, meant to leave this room.' },
      { entityId: 'antibiotics_01', spawnChance: 0.35, quantity: { min: 1, max: 2, distribution: 'weighted_low' } },
    ],
    extras: [
      {
        keywords: ['table', 'tables', 'surgical', 'operating'],
        description: 'The original surgical table is pre-Collapse hospital standard — hydraulic adjustment, articulating headrest, side rails for restraint attachment. The two additional tables are cruder: welded steel frames with padded surfaces, the padding replaced more than once judging by the layering visible at the edges. The bolt holes in the floor around them show false starts — they were repositioned until the overhead lights covered them correctly. Someone spent time getting this right. The precision is professional. The scale is not.',
        skillCheck: { skill: 'field_medicine', dc: 12, successAppend: 'The instrument staging on the nearest tray corresponds to a thoracotomy preparation — chest cavity access. The retractor set is sized for an adult. The bone saw has been recently sharpened. Whatever procedure this room performs regularly, it involves opening people up, and the recovery expectation is implied by the absence of any post-operative monitoring equipment. These subjects are not expected to recover in the traditional sense.' },
      },
      {
        keywords: ['instruments', 'tray', 'tools', 'bone', 'saw', 'drill'],
        description: 'The instrument trays hold equipment sourced from at least three different surgical departments — the stampings on the handles are inconsistent, the steel grades vary, but every instrument is maintained to operational standard. Someone cleans them after every use. Someone sharpens the bladed instruments on a schedule. The oscillating drill has a medical-grade bit set racked beside it in descending diameter. You count the bits. There are more sizes than orthopedic surgery typically requires.',
        skillCheck: { skill: 'mechanics', dc: 10, successAppend: 'Two of the drill bits are custom-fabricated — hand-ground from tool steel, not factory medical. Someone needed a specific bore diameter that doesn\'t correspond to any standard surgical procedure. The custom bits show more wear than the factory set. Whatever they\'re for, it happens often.' },
      },
      {
        keywords: ['drain', 'floor', 'grate', 'stain', 'channel'],
        description: 'The drain channel is a shallow trough cut into the original floor — not part of the hospital\'s design, added later, the concrete work competent but visible. The staining follows a gradient: heaviest at the center table, lighter toward the grate. The grate leads to the building\'s original waste system. The volume implied by the stain pattern exceeds what phlebotomy would produce. This room generates biological waste at a rate that required dedicated drainage.',
      },
      {
        keywords: ['light', 'lights', 'overhead', 'illumination'],
        description: 'The surgical lighting array is the best-maintained equipment in the room — adjustable multi-head units on articulating arms, each head independently positionable. The light they produce is the flat, shadowless white of a proper operating theater. In this light every surface detail is visible, every stain legible, every instrument edge defined. The room was designed around this light. Everything else serves it.',
        skillCheck: { skill: 'electronics', dc: 10, successAppend: 'The power draw for this lighting array is significant — dedicated circuit, separate from the facility\'s general grid. The research wing has its own power allocation, independent of the administration\'s priority system. Rook\'s scheduling board doesn\'t control what happens in here. Someone else\'s does.' },
      },
      {
        keywords: ['smell', 'iodine', 'chemical', 'sanitize', 'clean'],
        description: 'The chemical sanitization is thorough and recent — within the last twelve hours, based on the residual iodine concentration in the air. The cleaning protocol here is more aggressive than Extraction Room A or B. The reason is practical: whatever happens on these tables produces contamination that standard mopping does not address. The cleaning staff use a hospital-grade biohazard protocol. They wear protection. They do not discuss what they are cleaning.',
      },
    ],
    hollowEncounter: {
      baseChance: 0.50,
      timeModifier: { day: 0.7, night: 1.5, dawn: 0.9, dusk: 1.2 },
      threatPool: [
        { type: 'remnant', weight: 50, quantity: { min: 1, max: 2, distribution: 'weighted_low' } },
        { type: 'brute', weight: 30, quantity: { min: 1, max: 1, distribution: 'single' } },
        { type: 'whisperer', weight: 20, quantity: { min: 1, max: 1, distribution: 'single' } },
        { type: 'lucid_thrall', weight: 5, quantity: { min: 1, max: 1, distribution: 'flat' } },
      ],
      awarenessRoll: { unaware: 0.15, awarePassive: 0.35, awareAggressive: 0.50 },
    },
    narrativeNotes: 'pens_15. The surgical theater escalates the research wing\'s implications into physical horror. The three tables, the drain, the custom drill bits, the absent post-op monitoring — all point to experimental procedures on human subjects that are not expected to survive intact. The separate power circuit confirms this wing operates outside Rook\'s administrative control.',
  },

  {
    id: 'pens_16_waste_processing',
    name: 'The Pens — Waste Processing',
    zone: 'the_pens',
    act: 2,
    difficulty: 3,
    visited: false,
    flags: { hiddenRoom: true },
    description: 'The room was the hospital\'s biomedical waste processing center and it still is, in the way that a river is still a river after the watershed changes — same channel, different volume. Industrial autoclaves line the south wall, their indicator lights cycling green, processing loads on a timer. Biohazard bins in graduated sizes fill the staging area near the door, each sealed, each labeled with a date and a waste classification code. The classification codes are printed on a laminated reference card taped to the wall: Class I through Class IV, ascending by biological risk. Most of the bins are Class II. Three bins near the autoclaves are Class IV, and they are sealed with a secondary containment wrap that the Class II bins do not receive. The room hums with the autoclaves\' thermal cycling and smells like an abattoir that has been cleaned by someone who understands microbiology. A logbook on a metal clipboard hangs from a hook beside the door, its pages dense with entries in a careful, mechanical hand.',
    descriptionNight: 'The autoclaves run through the night. The thermal cycling does not observe a schedule — it runs when the bins are full. The bins are full often enough that the night cycle is standard.',
    shortDescription: 'Biomedical waste processing. Autoclaves cycling. The bins tell a volume story.',
    exits: { south: 'pens_12_cold_storage' },
    richExits: {
      south: { destination: 'pens_12_cold_storage', descriptionVerbose: 'south through the utility door back to cold storage' },
    },
    items: [],
    enemies: [],
    npcs: [],
    itemSpawns: [
      { entityId: 'chemicals_basic', spawnChance: 0.45, quantity: { min: 1, max: 2, distribution: 'flat' } },
      { entityId: 'bandages', spawnChance: 0.30, quantity: { min: 1, max: 1, distribution: 'single' }, groundDescription: 'A sealed package of medical bandages sits on the supply shelf, separated from the waste stream.' },
    ],
    extras: [
      {
        keywords: ['bin', 'bins', 'waste', 'container', 'biohazard'],
        description: 'The Class II bins contain standard medical waste — used needles, tubing, gauze, collection bags past their use window. The volume is consistent with a high-throughput extraction operation. The Class IV bins are different: the secondary containment wrap is chemical-resistant, the seals are heat-bonded, and the labels include an additional field that the Class II labels do not — ORIGIN: RESEARCH PROTOCOL. The research wing\'s waste does not mix with the general extraction waste. It cannot. The classification difference is biological, not administrative.',
        skillCheck: { skill: 'field_medicine', dc: 11, successAppend: 'Class IV biomedical waste is reserved for materials contaminated with pathogens of pandemic potential or prion-class agents. Pre-Collapse, a facility generating this classification at this volume would trigger a CDC notification. The notification system no longer exists. The waste classification still does. Someone maintained the standard because the standard exists for a reason that has not changed.' },
      },
      {
        keywords: ['autoclave', 'autoclaves', 'sterilize', 'machine', 'heat'],
        description: 'The autoclaves are industrial hospital-grade units — pre-Collapse, rated for high-volume processing. The thermal cycling runs at 134 degrees Celsius for eighteen minutes per load, the prion-safe protocol. Standard medical waste requires 121 degrees for fifteen minutes. The autoclaves are set to the higher specification. Someone chose the prion protocol. That choice is a data point.',
        skillCheck: { skill: 'mechanics', dc: 10, successAppend: 'The power consumption for running these autoclaves at prion-safe temperatures is roughly double the standard protocol. The facility is spending significant energy on waste destruction. Whatever is in the Class IV bins, the facility wants it thermally eliminated beyond any possibility of viability. They are not just destroying waste. They are destroying evidence of what the waste used to be.' },
      },
      {
        keywords: ['logbook', 'log', 'clipboard', 'entries', 'record'],
        description: 'The logbook entries follow a rigid format: date, time, bin count by class, autoclave load number, processing confirmation, technician initials. The entries go back fourteen months. The Class II volume has been steady. The Class IV volume has increased — gradually at first, then sharply over the last three months. The increase corresponds to the period when the research wing\'s AB-negative protocol was noted in Rook\'s private annotations. Something in the research wing is generating more biological waste. The logbook does not say what. The logbook says how much.',
        skillCheck: { skill: 'lore', dc: 12, successAppend: 'Cross-referencing the logbook\'s Class IV volume spike with the cold storage manifest\'s AB-negative RESERVED entries produces a correlation that is not coincidental. The research wing is consuming AB-negative material at an increasing rate and generating Class IV waste at a proportional rate. The input goes in as blood. The waste comes out as something that requires prion-safe destruction. Whatever the protocol does to AB-negative blood, the result is biologically dangerous enough to warrant the highest waste classification that exists.' },
      },
      {
        keywords: ['smell', 'air', 'abattoir', 'odor'],
        description: 'The smell is the processed residue of organic material subjected to sustained high heat — not rot, not decay, but the specific acrid sweetness of biological matter that has been thermally broken down. The ventilation system pulls air from this room at a higher rate than any other room on this floor, and the exhaust is filtered through carbon scrubbers mounted above the autoclaves. The smell that gets through the scrubbers is what you are smelling. The smell that doesn\'t get through is worse.',
      },
    ],
    hollowEncounter: {
      baseChance: 0.50,
      timeModifier: { day: 0.80, night: 1.2, dawn: 0.7, dusk: 0.9 },
      threatPool: [
        { type: 'shuffler', weight: 55, quantity: { min: 1, max: 3, distribution: 'weighted_low' } },
        { type: 'remnant', weight: 35, quantity: { min: 1, max: 1, distribution: 'single' } },
        { type: 'screamer', weight: 10, quantity: { min: 1, max: 1, distribution: 'single' } },
      ],
    },
    narrativeNotes: 'pens_16. The waste processing room is where the facility\'s scale becomes undeniable. The Class IV volume spike correlated with the AB-negative research confirms something is being done that generates prion-class waste — a detail that connects to the surgical theater and the research wing. The logbook is the statistical ghost of the surgical theater\'s physical horror.',
  },

  {
    id: 'pens_17_quarantine_wing',
    name: 'The Pens — Quarantine Wing',
    zone: 'the_pens',
    act: 2,
    difficulty: 5, // Endgame content
    visited: false,
    flags: { hiddenRoom: true },
    description: 'The quarantine wing is a sealed negative-pressure corridor lined with six isolation rooms, each visible through double-paned observation windows reinforced with wire mesh. The air pressure differential is tangible — you feel it in your ears when you pass through the plastic barrier, a faint pull toward the ventilation intake at the far end. Five of the six rooms are occupied. The occupants wear white wristbands that have been supplemented with a red stripe drawn in marker — a designation that does not appear on any intake form or scheduling board. They sit or stand or move in patterns that you recognize from the research wing subjects, but further along: tracking things that are not there, responding to stimuli that do not exist in any spectrum you can perceive, their attention fixed on something interior and absolute. One subject in the nearest room is writing on the wall with their fingertip, tracing letters in a script you almost recognize. The writing is not visible on the wall. Their finger moves with the confidence of someone who can see what they are writing.',
    descriptionNight: 'Night in the quarantine wing is worse. The subjects do not sleep. They stand at the observation windows and look out into the corridor with expressions that are not distress and not calm and not anything that maps to a state you have a word for. One of them mouths words at the glass. The words are not for you.',
    shortDescription: 'Quarantine isolation. White-and-red wristbands. Subjects past the research threshold.',
    exits: { north: 'pens_09_holding_cells' },
    richExits: {
      north: { destination: 'pens_09_holding_cells', descriptionVerbose: 'north through the plastic curtain barriers back to the holding cells' },
    },
    items: [],
    enemies: [],
    npcs: ['medic_marsh'],
    itemSpawns: [
      { entityId: 'quiet_drops', spawnChance: 0.30, quantity: { min: 1, max: 1, distribution: 'single' }, groundDescription: 'A vial of Quiet Drops sits on the corridor\'s medication cart, labeled for Room 3.' },
      { entityId: 'sanguine_blood_vial', spawnChance: 0.10, quantity: { min: 1, max: 1, distribution: 'single' }, groundDescription: 'A Sanguine blood vial, half-empty, sits in a specimen tray beside the observation station — used as a reagent, not a treatment.' },
    ],
    extras: [
      {
        keywords: ['subject', 'subjects', 'occupant', 'patient', 'wristband', 'white', 'red'],
        description: 'The white-and-red wristband designation does not exist in the intake system. These subjects were white-wristband research participants who developed symptoms that required isolation — or subjects who were moved here when the research protocol produced results that could not be contained within the research wing\'s observation rooms. Their intake paperwork, if it exists, has been removed from the general filing system. They are in the building\'s records the way a redaction is in a document: present as an absence.',
        skillCheck: { skill: 'lore', dc: 12, successAppend: 'Five subjects in quarantine, all showing Sanguine-spectrum sensory response in non-Sanguine biology. The research wing\'s AB-negative protocol has produced something that was not supposed to be producible: human subjects exhibiting CHARON-7 carrier traits without full viral conversion. They are not Hollow. They are not Sanguine. They are something the pre-Collapse researchers theorized and the Red Court has accidentally manufactured.' },
      },
      {
        keywords: ['window', 'glass', 'observation', 'panel'],
        description: 'The observation windows are double-paned with a wire mesh interlayer — rated for impact from inside. Three of the five occupied rooms show stress marks on the interior pane: small, circular impact points, repeated in the same location, the kind of pattern produced by someone pressing their forehead against the glass in the same spot for a long time. The glass holds. The glass was chosen because it holds.',
        skillCheck: { skill: 'perception', dc: 10, successAppend: 'The subject in Room 2 is watching you through the glass with an attention that is qualitatively different from the others. They are tracking you — not the absent phenomena the others follow, but you, specifically, your movement, your position. They are aware of you in a way the other subjects are not. When you make eye contact they do not look away. They tilt their head, slowly, the way a predator assesses distance.' },
      },
      {
        keywords: ['writing', 'wall', 'script', 'finger', 'letters'],
        description: 'The subject writing on the wall traces characters with a fluency that implies a system — not random motion, not compulsive repetition, but structured notation in a script that has syntax and direction. The characters are not visible on the wall surface. You watch the finger move for a full minute. The patterns repeat with variation, the way language repeats. Whatever they are writing, they believe it is being read.',
        skillCheck: { skill: 'lore', dc: 13, successAppend: 'The character structure the subject traces corresponds to nothing in any human writing system. But the gestural pattern — the stroke order, the directionality, the spacing — has the same deep structure as written CHARON-7 protein folding notation from the MERIDIAN documentation. The subject is writing in a language that was developed in a laboratory they have never been inside, using a notation system they could not have learned. They are receiving it from somewhere. The question is from what.' },
      },
      {
        keywords: ['pressure', 'air', 'ventilation', 'negative', 'seal'],
        description: 'The negative pressure system pulls air inward through the corridor and out through HEPA filtration at the far end — standard BSL-3 containment protocol, maintained from the hospital\'s original infectious disease wing. The pressure differential means that anything airborne inside the isolation rooms stays inside the isolation rooms. The system was designed for tuberculosis containment. It is being used for something that the facility considers at least as communicable.',
        skillCheck: { skill: 'field_medicine', dc: 11, successAppend: 'The HEPA filters at the exhaust end are being changed on a weekly rotation — the replacement schedule is posted on the maintenance panel. Standard protocol changes them monthly. Weekly replacement means the particulate load is four times the expected baseline. Whatever the quarantine subjects are producing biologically, it is airborne and it is concentrated.' },
      },
    ],
    hollowEncounter: {
      baseChance: 0.50,
      timeModifier: { day: 0.7, night: 1.8, dawn: 0.9, dusk: 1.3 },
      threatPool: [
        { type: 'whisperer', weight: 45, quantity: { min: 1, max: 1, distribution: 'single' } },
        { type: 'remnant', weight: 35, quantity: { min: 1, max: 2, distribution: 'weighted_low' } },
        { type: 'screamer', weight: 20, quantity: { min: 1, max: 1, distribution: 'single' } },
      ],
      awarenessRoll: { unaware: 0.10, awarePassive: 0.30, awareAggressive: 0.60 },
    },
    narrativeNotes: 'pens_17. The quarantine wing is the zone\'s body horror apex — subjects exhibiting impossible Sanguine traits in human biology, writing in a language from MERIDIAN\'s internal documentation. The Room 2 subject who tracks the player specifically is a direct threat tease. The CHARON-7 protein folding notation detail connects this room to the Scar\'s MERIDIAN revelations in Act III.',
  },

  {
    id: 'pens_18_transit_tunnel',
    name: 'The Pens — Transit Tunnel',
    zone: 'the_pens',
    act: 2,
    difficulty: 4,
    visited: false,
    flags: { hiddenRoom: true, dark: true },
    description: 'The passage behind the filing cabinets descends for thirty meters before leveling into a concrete utility tunnel — eight feet wide, seven feet high, lit at intervals by caged emergency bulbs that cast more shadow than light. The tunnel runs straight south, the direction that corresponds to the Transit Point 4 notation on Rook\'s facility map. The floor is scored with parallel tracks — not rails, but the wear pattern of a wheeled cart run along the same path hundreds of times. The cart itself sits at the near end of the tunnel, a stainless steel medical transport unit with a locking lid and a refrigeration housing powered by a battery pack. The cart is empty but the refrigeration unit is running, its compressor cycling in the tunnel\'s silence. The interior of the cart is clean in the specific way that things are clean when they carry biological material under chain-of-custody protocols. At the far end of the tunnel, visible as a point of different-colored light, is a door. The door is the kind of thing you find when someone has been telling you a story and you arrive at the part they left out.',
    descriptionNight: 'The tunnel does not change at night. The emergency bulbs run on the same circuit as the facility\'s backup power. The cart\'s refrigeration unit hums. The door at the far end shows the same sliver of light it showed during the day — the light beyond it does not observe a solar schedule.',
    shortDescription: 'Utility tunnel south from Rook\'s office. Cart tracks. A door. Transit Point 4.',
    exits: { north: 'pens_14_rooks_office' },
    richExits: {
      north: { destination: 'pens_14_rooks_office', descriptionVerbose: 'north back up the passage to Rook\'s office' },
    },
    items: [],
    enemies: [],
    npcs: [],
    itemSpawns: [
      { entityId: 'electronics_salvage', spawnChance: 0.30, quantity: { min: 1, max: 1, distribution: 'single' }, groundDescription: 'A piece of electronics salvage sits on a utility shelf near the tunnel entrance — a junction box cover with its wiring still intact.' },
      { entityId: 'bandages', spawnChance: 0.20, quantity: { min: 1, max: 1, distribution: 'single' }, groundDescription: 'A sealed bandage package sits in the transport cart\'s side compartment, part of a chain-of-custody medical kit.' },
    ],
    extras: [
      {
        keywords: ['cart', 'transport', 'refrigeration', 'stainless', 'steel'],
        description: 'The transport cart is medical-grade stainless steel with a locking lid, refrigeration housing, and a chain-of-custody tag clipped to the handle. The tag is the most recent of many — the clip holds a stack of them, each dated, each signed by two people using initials rather than names. The most recent date is four days ago. The refrigeration temperature reads 4 degrees Celsius — standard for blood product transport. The cart moves biological material from this facility to whatever is at the other end of this tunnel, on a schedule that has been running for months.',
        skillCheck: { skill: 'perception', dc: 11, successAppend: 'The chain-of-custody tags use two sets of initials: one consistent across all tags — the sender, someone inside the facility — and a second that changes every few shipments — the receiver, someone from outside. The sender\'s initials do not match Rook\'s. The sender is someone else on staff, operating the transit independently. Rook knows about the tunnel. Rook may not know about every shipment.' },
      },
      {
        keywords: ['tracks', 'floor', 'wear', 'path', 'wheels'],
        description: 'The wheel tracks are worn into the concrete to a depth of roughly two millimeters — the cumulative evidence of a heavy, loaded cart making the same trip hundreds of times over a period of months or years. The tracks run ruler-straight from the passage entrance to the door at the far end. There are no detours. There are no side passages. This tunnel was built for one purpose: to move something from inside the facility to outside the facility without using the main entrance, the cold storage shipping dock, or any exit that appears in the administration\'s records.',
      },
      {
        keywords: ['door', 'end', 'far', 'light', 'exit'],
        description: 'The door at the tunnel\'s south end is steel-reinforced with a crash bar on this side — designed for exit, not entry. Through the narrow gap at the threshold, the light beyond is artificial: blue-white LED, the kind used in temporary field installations. The door is not locked from this side. It opens outward. Beyond it is whatever Transit Point 4 is — the destination that receives the research wing\'s AB-negative material, the endpoint of a supply chain that Rook\'s private ledger tracks but the official manifests do not. You are standing at the edge of the story The Pens tells about itself, looking at where the other story begins.',
        skillCheck: { skill: 'tracking', dc: 12, successAppend: 'Boot prints in the fine concrete dust near the threshold: two sets, neither matching Red Court standard-issue. The people who receive shipments at Transit Point 4 are not Red Court personnel. They are someone else — someone with access to LED field lighting, someone who maintains a receiving schedule, someone who wants AB-negative biological material badly enough to build a tunnel for it. The boot prints suggest military-grade footwear. Not Salter. Not Accord. Something else.' },
      },
      {
        keywords: ['tunnel', 'concrete', 'walls', 'construction', 'passage'],
        description: 'The tunnel construction is competent but not professional — poured concrete walls with visible form marks, rebar exposed at two stress points, the ceiling reinforcement adequate rather than generous. This was built after the facility was repurposed, not before. Someone invested significant labor and material in a tunnel that runs beneath the facility\'s perimeter without appearing on any facility blueprint. The construction timeline, based on the concrete curing and the wear patterns, suggests it was completed roughly eighteen months ago. Eighteen months ago is when the research wing\'s AB-negative protocol began generating Class IV waste.',
        skillCheck: { skill: 'mechanics', dc: 11, successAppend: 'The construction quality tells a labor story: this was built by a small crew working over weeks, not a construction team working in days. The rebar sourcing is mixed — some from the facility\'s own structural stock, some brought in from outside. Someone requisitioned facility materials for unauthorized construction. The materials requisition would be in the administration records, disguised as something else. Rook\'s private ledger discrepancy — the 3-4% yield diversion — may partly fund this infrastructure.' },
      },
    ],
    hollowEncounter: {
      baseChance: 0.50,
      timeModifier: { day: 0.8, night: 1.6, dawn: 0.9, dusk: 1.2 },
      threatPool: [
        { type: 'remnant', weight: 40, quantity: { min: 1, max: 2, distribution: 'weighted_low' } },
        { type: 'brute', weight: 30, quantity: { min: 1, max: 1, distribution: 'single' } },
        { type: 'shuffler', weight: 30, quantity: { min: 2, max: 4, distribution: 'bell' } },
      ],
      awarenessRoll: { unaware: 0.15, awarePassive: 0.35, awareAggressive: 0.50 },
    },
    narrativeNotes: 'pens_18. The transit tunnel resolves the Transit Point 4 mystery established in pens_14 and the AB-negative diversion seeded in pens_11 and pens_12. The non-Red-Court boot prints and military-grade footwear open a new question: who is receiving this material? The tunnel\'s construction timeline aligning with the research protocol\'s start date confirms these are the same initiative. This room is the zone\'s final narrative beat — the point where The Pens stops being a self-contained horror and becomes a node in something larger.',
  },
]
