import type { NPC, ZoneType, TimeOfDay } from '@/types/game'

// ------------------------------------------------------------
// Extended NPC type — superset of the base NPC interface.
// Adds activity pools, disposition rolls, spawn metadata.
// The base NPC fields (id, name, description, dialogue) are
// satisfied; the engine can cast back to NPC safely.
// ------------------------------------------------------------

interface ActivityEntry {
  activity: string
  weight: number
  timeRestrict?: TimeOfDay[]
}

interface DispositionRoll {
  friendly: number  // must sum to 1.0 across all four keys
  neutral: number
  wary: number
  hostile: number
}

interface RichNPC extends NPC {
  activityPool: ActivityEntry[]
  dispositionRoll: DispositionRoll
  spawnChance: number
  zone: ZoneType
}

export const NPCS: Record<string, RichNPC> = {

  // ----------------------------------------------------------
  // NAMED NPCs (isNamed: true) — key story characters
  // ----------------------------------------------------------

  // patch — Information broker and medic. Clinical, transactional, curious.
  patch: {
    id: 'patch',
    name: 'Patch',
    description:
      'A person of indeterminate age and origin behind a folding table covered in medical supplies, each item in its precise place. Their hands are always moving — sorting, checking, resetting. They look at wounds the way other people look at locks. They are already figuring out how to open you.',
    dialogue:
      "I'll close that up. But I want to know what's north of the salt creek crossing, because my last three patients came from that direction and I've been piecing together what they saw before they stopped being able to describe it. You talk, I work. We both leave better off.",
    faction: 'drifters',
    isNamed: true,
    zone: 'crossroads',
    spawnChance: 0.85,
    dispositionRoll: { friendly: 0.30, neutral: 0.50, wary: 0.15, hostile: 0.05 },
    activityPool: [
      {
        activity: 'is cataloguing medical supplies with a worn clipboard, making small marks in a cramped shorthand only they can read',
        weight: 3,
      },
      {
        activity: 'is suturing a long gash on their own forearm without apparent distress, needle moving through skin with the practiced ease of someone who has run out of other options',
        weight: 2,
      },
      {
        activity: 'is grinding something in a ceramic mortar — dried plant material, by the smell — while reading from a photocopied page of pharmacology notes',
        weight: 2,
        timeRestrict: ['day'],
      },
      {
        activity: 'is sterilizing instruments in a shallow pan of liquid over a low flame, holding each one up to check it before setting it back down in precise order',
        weight: 2,
      },
      {
        activity: 'sits with their back to the wall and eyes closed, but their breathing is too controlled for sleep — they are listening to the building settle',
        weight: 1,
        timeRestrict: ['night'],
      },
      {
        activity: 'is writing up a patient record with a mechanical pencil, pausing occasionally to refer to a hand-drawn anatomical diagram tacked to the wall',
        weight: 1,
        timeRestrict: ['dawn', 'day'],
      },
    ],
  },

  // marshal_cross — Accord leader. Exhausted, pragmatic, iron-willed.
  marshal_cross: {
    id: 'marshal_cross',
    name: 'Marshal Cross',
    description:
      "A woman in her fifties in a sheriff's jacket that has been repaired so many times it is more repair than original. She stands the way people stand when they have not sat down voluntarily in years. The weight of eight hundred people is not metaphor. You can see it in her shoulders.",
    dialogue:
      "I don't have capacity for mercy right now. I have capacity for decisions. You want to trade, work, or move through — I can do that. You want sanctuary, you'll need to earn it. You want trouble, I'll spend the resources to end it because I cannot afford the alternative. What is it you actually need?",
    faction: 'accord',
    isNamed: true,
    zone: 'covenant',
    spawnChance: 0.70,
    dispositionRoll: { friendly: 0.05, neutral: 0.45, wary: 0.40, hostile: 0.10 },
    activityPool: [
      {
        activity: 'is studying a hand-drawn territory map pinned to a board, tracing routes with her finger and making small marks with a grease pencil',
        weight: 3,
        timeRestrict: ['dawn', 'day'],
      },
      {
        activity: 'is debriefing two scouts in a low, unhurried voice, taking notes without breaking eye contact with them',
        weight: 2,
      },
      {
        activity: 'stands at the perimeter facing outward, rifle slung, scanning the flats with the slow, thorough sweep of someone who has found things out there before',
        weight: 3,
        timeRestrict: ['dusk', 'night'],
      },
      {
        activity: 'is eating from a tin can without sitting down, reading a handwritten report, and occasionally underlining something with the edge of her thumbnail',
        weight: 1,
      },
      {
        activity: 'is loading magazines in a methodical sequence — press, seat, press, seat — the ammunition laid out in a row on a ration crate beside her',
        weight: 2,
        timeRestrict: ['dusk', 'night'],
      },
    ],
  },

  // warlord_briggs — Salter commander. Ex-Marine. Knows more than he admits.
  warlord_briggs: {
    id: 'warlord_briggs',
    name: 'Warlord Briggs',
    description:
      'A man built like a bunker — wide, low-centered, nothing wasted. He wears his rank without insignia, which means everybody knows it. The ex-Marine posture is permanent in his spine. His eyes do the same slow sweep of every room that the best field operators do without noticing they do it. He is carrying something. Not a weapon. Something else.',
    dialogue:
      "We don't coexist with things that eat us. That's not ideology, that's arithmetic. You want to debate philosophy, find Vesper. You want to stay alive in the Four Corners, you talk to me. And if you're thinking about the Scar — don't. There's nothing there. I was there. I watched them close it.",
    faction: 'salters',
    isNamed: true,
    zone: 'salt_creek',
    spawnChance: 0.65,
    dispositionRoll: { friendly: 0.05, neutral: 0.40, wary: 0.40, hostile: 0.15 },
    activityPool: [
      {
        activity: 'is reviewing a tactical map with two subordinates, pointing at positions and nodding when they respond, his face giving nothing away',
        weight: 3,
        timeRestrict: ['dawn', 'day'],
      },
      {
        activity: 'stands alone at the perimeter, looking north, perfectly still — the posture of someone waiting for confirmation of something they already know',
        weight: 2,
        timeRestrict: ['dusk', 'night'],
      },
      {
        activity: 'is field-stripping a sidearm on a cloth-covered table, cleaning each component with the automatic precision of someone who has done it ten thousand times',
        weight: 2,
      },
      {
        activity: 'is talking quietly to a soldier who came in from patrol, listening more than speaking, his jaw set',
        weight: 2,
      },
      {
        activity: 'sits alone with a cup of something hot, staring at nothing, the cup untouched for too long',
        weight: 1,
        timeRestrict: ['night'],
      },
    ],
  },

  // vesper — Covenant of Dusk elder. Former philosophy professor. True believer in coexistence.
  vesper: {
    id: 'vesper',
    name: 'Vesper',
    description:
      'She sits with the stillness of someone who no longer needs to fidget. The photosensitivity is apparent — she has positioned herself precisely in the deepest shadow of the room, equidistant from every light source. She was a philosophy professor once. You can hear it in the precision of her sentences. She believes in what she has built here. That may be the most dangerous thing about her.',
    dialogue:
      "The blood tithe is not exploitation. The blood tithe is acknowledgment. We are predators and you are prey and the Covenant is the formal agreement that both parties have chosen something else. You find that transactional? Good. Transactions are civilized. The alternative is the Red Court. I have been clear about which I prefer.",
    faction: 'covenant_of_dusk',
    isNamed: true,
    zone: 'duskhollow',
    spawnChance: 0.80,
    dispositionRoll: { friendly: 0.20, neutral: 0.50, wary: 0.25, hostile: 0.05 },
    activityPool: [
      {
        activity: 'is reading in the deep shadow of an alcove, turning pages with a deliberateness that suggests she has read this before and is finding something new in it',
        weight: 3,
        timeRestrict: ['night'],
      },
      {
        activity: 'is speaking with a human resident in a low voice, listening far more than she speaks, her expression attentive and unreadable',
        weight: 3,
      },
      {
        activity: 'sits in perfect stillness, eyes open, hands folded — not meditating, exactly. Thinking at a depth that takes up the whole room.',
        weight: 2,
        timeRestrict: ['dawn'],
      },
      {
        activity: 'is writing in a leather notebook with a fountain pen, pausing occasionally to consider something, then continuing without crossing anything out',
        weight: 2,
        timeRestrict: ['night'],
      },
      {
        activity: 'is reviewing the tithe ledger with the careful attention of someone who takes this arrangement seriously and will notice any irregularity',
        weight: 1,
        timeRestrict: ['dusk'],
      },
    ],
  },

  // lev — Head Reclaimer researcher. Studies Revenants. Has files on you.
  lev: {
    id: 'lev',
    name: 'Lev',
    description:
      'Young for the authority they carry, with the kind of driven-thin look that comes from thinking too much and sleeping too little. Their workspace is organized in a system only they understand, which is efficient, which is the point. They know about you. The way they looked up when you entered was not surprise — it was confirmation.',
    dialogue:
      "I've been tracking the Revenant phenomenon since Cycle 2. The skill retention curves, the death-specific memory degradation, the way the scars accumulate. You're not the only one. You are, however, the most interesting one. I'm not saying that to flatter you. I'm saying it because you should know that whatever CHARON-7 is doing to you, it has a goal. I just haven't proven what it is yet. Sit down. I have questions.",
    faction: 'reclaimers',
    isNamed: true,
    zone: 'the_stacks',
    spawnChance: 0.80,
    dispositionRoll: { friendly: 0.35, neutral: 0.50, wary: 0.10, hostile: 0.05 },
    activityPool: [
      {
        activity: 'is entering data into a battered laptop, cross-referencing against a stack of handwritten notes, their eyes moving between the two with rapid precision',
        weight: 3,
        timeRestrict: ['day'],
      },
      {
        activity: 'is examining a tissue sample under a microscope, making notes without looking away from the lens',
        weight: 3,
      },
      {
        activity: 'is staring at a wall covered in pinned photographs, string, and notecards, standing very still, one hand pressed against the wall near the center of the web',
        weight: 2,
        timeRestrict: ['night'],
      },
      {
        activity: 'is eating something cold at their desk without appearing to taste it, reading, occasionally underlining passages with a red pen',
        weight: 1,
      },
      {
        activity: 'is talking fast at a junior technician who is struggling to keep up, pointing at numbers on a chart that means something urgent to at least one of them',
        weight: 2,
        timeRestrict: ['dawn', 'day'],
      },
    ],
  },

  // deacon_harrow — Kindling high priest. Charismatic, possibly mad.
  deacon_harrow: {
    id: 'deacon_harrow',
    name: 'Deacon Harrow',
    description:
      'A tall man in a coat that was once a coat and is now something more deliberate, its collar scorched in a pattern that might be intentional. He holds eye contact slightly too long. Not threatening. Evaluating. The way a fire evaluates what it might be asked to consume.',
    dialogue:
      "The Hollow aren't cursed. They're converted. CHARON-7 is a gospel written in protein — it rewrites what you are at the level of what you're made of. The question isn't whether you believe in it. The question is whether it believes in you. The Kindling exists to ensure that when the fire comes, we are the ones who burn bright and not the ones who just burn.",
    faction: 'kindling',
    isNamed: true,
    zone: 'the_ember',
    spawnChance: 0.75,
    dispositionRoll: { friendly: 0.15, neutral: 0.35, wary: 0.35, hostile: 0.15 },
    activityPool: [
      {
        activity: 'is reading from a small book whose cover has been removed, lips moving slightly on certain passages',
        weight: 3,
      },
      {
        activity: 'stands in the center of the room facing a wall, perfectly still, eyes open — not meditating, exactly. Waiting.',
        weight: 2,
        timeRestrict: ['dawn', 'dusk'],
      },
      {
        activity: 'is speaking quietly to a small group of three people who are listening with the posture of people who want to believe something and have almost convinced themselves they do',
        weight: 2,
        timeRestrict: ['day', 'dusk'],
      },
      {
        activity: 'is writing in a ledger by candlelight, the pen strokes deliberate and unhurried — not a record, the shape of it says, but something more like testimony',
        weight: 2,
        timeRestrict: ['night'],
      },
      {
        activity: "is running two fingers along a long scar on the back of his right hand, absently, the way you trace something you've already memorized",
        weight: 1,
      },
    ],
  },

  // howard_bridge_keeper — Former civil engineer. Built the Animas bridge.
  howard_bridge_keeper: {
    id: 'howard_bridge_keeper',
    name: 'Howard',
    description:
      'A weathered man in his sixties who moves around his bridge with the proprietorial ease of someone who built the thing himself, which he did. Former civil engineer — the knowledge shows in the way he looks at structures, the way he touches load-bearing members. He is waiting for someone. He has been waiting a long time.',
    dialogue:
      "The bridge holds four hundred pounds single-loaded. You want to cross with more than that, we go in shifts. The cable tension is checked every morning — if I don't check it, I trust nothing I know. I've been on this river since 2032. I've seen everything that moves through this valley. You want to know what's east or south, ask. You want to know what's north — toward the mountains — I'll tell you, but you won't like it.",
    faction: 'drifters',
    isNamed: true,
    zone: 'river_road',
    spawnChance: 0.90,
    dispositionRoll: { friendly: 0.30, neutral: 0.50, wary: 0.15, hostile: 0.05 },
    activityPool: [
      {
        activity: 'is inspecting the bridge cables with both hands, running his palms along the steel braid, checking tension by feel',
        weight: 3,
      },
      {
        activity: 'sits in a camp chair at the bridge entrance with a mug of tea, watching the far bank with the patience of someone who has seen everything come across this river',
        weight: 3,
        timeRestrict: ['day', 'dusk'],
      },
      {
        activity: 'is making notes in a structural logbook, recording the weather, the load, the time — the meticulous recordkeeping of an engineer who trusts data over feeling',
        weight: 2,
        timeRestrict: ['dawn', 'day'],
      },
      {
        activity: 'stands at the center of the bridge at night, looking north up the river, the mug cold in his hands',
        weight: 2,
        timeRestrict: ['night'],
      },
    ],
  },

  // sparks_radio — Radio technician. Obsessively tracking the MERIDIAN signal.
  sparks_radio: {
    id: 'sparks_radio',
    name: 'Sparks',
    description:
      'A young person in a state of permanent focused agitation, surrounded by radio equipment that has been modified so many times the original components are outnumbered. They have the look of someone who has been listening to something no one else believes is there. They are not wrong. They are also not sleeping enough.',
    dialogue:
      "The signal is real. I have three hundred hours of recordings. The pattern is not random. It is structured in layers — the outer layer is a simple repeating beacon, but the second layer has information encoded in the interval variations. I have decoded forty percent of it. The source is the Scar site. There is someone inside the Scar broadcasting on military bandwidth with enough power to run for seven years. I need someone to go verify it. Everyone I ask says I'm obsessed. I am obsessed. That doesn't mean I'm wrong.",
    faction: 'drifters',
    isNamed: true,
    zone: 'crossroads',
    spawnChance: 0.80,
    dispositionRoll: { friendly: 0.40, neutral: 0.40, wary: 0.15, hostile: 0.05 },
    activityPool: [
      {
        activity: 'is scanning across frequencies with headphones on, eyes closed, entirely elsewhere',
        weight: 3,
      },
      {
        activity: 'is filling another page of a signal log with numbers and abbreviations at speed, not looking up when you enter',
        weight: 3,
        timeRestrict: ['night'],
      },
      {
        activity: 'is soldering a circuit modification onto a receiver board, magnifying loupe on one eye, the tip of their tongue visible with concentration',
        weight: 2,
        timeRestrict: ['day'],
      },
      {
        activity: 'is pacing the length of the room with a printout in hand, pointing at it occasionally as if making a point to themselves they keep losing',
        weight: 2,
        timeRestrict: ['dawn', 'dusk'],
      },
      {
        activity: 'has fallen asleep in the chair with the headphones still on, the signal log open across their chest',
        weight: 1,
        timeRestrict: ['dawn'],
      },
    ],
  },

  // marta_food_vendor — Crossroads food vendor. Practical, maternal, sharp.
  marta_food_vendor: {
    id: 'marta_food_vendor',
    name: 'Marta',
    description:
      "A broad-shouldered woman in an apron that has seen more use than most weapons in the region. She works with the efficient calm of someone who has been feeding people in hard circumstances for a long time. She is the first friendly face most newcomers see. She uses that intentionally.",
    dialogue:
      "Eat first, then tell me where you came from. I can tell a lot from where people come from, and I've been trading at this crossroads since '34. You need a place to sleep, there's a clean corner in the back if you can pay a day's labor. You need to know who to talk to about what, I probably know. Everyone eats. Which means I know everyone.",
    faction: 'drifters',
    isNamed: true,
    zone: 'crossroads',
    spawnChance: 0.90,
    dispositionRoll: { friendly: 0.60, neutral: 0.30, wary: 0.08, hostile: 0.02 },
    activityPool: [
      {
        activity: 'is ladling something hot from a large pot into bowls, moving with the practiced efficiency of someone who has done this ten thousand times',
        weight: 4,
        timeRestrict: ['dawn', 'day', 'dusk'],
      },
      {
        activity: 'is taking stock of food supplies with a methodical eye, moving jars and bags, making mental notes without writing anything down',
        weight: 2,
      },
      {
        activity: 'is listening to a newcomer tell their story, hands still working on something practical, eyes genuinely attentive',
        weight: 2,
      },
      {
        activity: 'is sitting with the last light of the day and a cup of tea, finally, the stall quiet, her shoulders down for the first time',
        weight: 2,
        timeRestrict: ['dusk', 'night'],
      },
      {
        activity: 'is already awake and setting up in the grey pre-dawn, moving quietly so as not to disturb the people sleeping in the corners',
        weight: 1,
        timeRestrict: ['dawn'],
      },
    ],
  },

  // the_dog — A stray with a notched ear. No faction. Pure emotional investment.
  the_dog: {
    id: 'the_dog',
    name: 'A Stray Dog',
    description:
      "A lean, medium-sized dog of indeterminate breed with a notched left ear and eyes that have clearly assessed many things. It does not approach. It watches you from a precise distance and decides. That's all. It's deciding.",
    dialogue:
      "The dog doesn't speak. It sits, and it watches, and eventually it either comes closer or it doesn't. There's no negotiating with it. There's no persuading it. You either treated it kindly the last time, or you didn't. It remembers.",
    isNamed: true,
    zone: 'crossroads',
    spawnChance: 0.50,
    dispositionRoll: { friendly: 0.20, neutral: 0.40, wary: 0.35, hostile: 0.05 },
    activityPool: [
      {
        activity: 'sits at a careful distance, watching you with the calm, measuring attention of something that has learned to read people well',
        weight: 3,
      },
      {
        activity: 'is sniffing at the edge of something that used to be food, thorough and unsentimental',
        weight: 2,
      },
      {
        activity: 'lies with its chin on its paws in the warmth of a sunlit patch, one eye half-open, tracking movement',
        weight: 3,
        timeRestrict: ['day'],
      },
      {
        activity: 'stands at the perimeter with its nose up, reading something in the air that you cannot access',
        weight: 2,
        timeRestrict: ['dusk', 'night'],
      },
    ],
  },

  // dr_ama_osei — Lucid Sanguine virologist. Seeks a cure.
  dr_ama_osei: {
    id: 'dr_ama_osei',
    name: 'Dr. Ama Osei',
    description:
      'She is brilliant and Sanguine and conducting active research in a hidden lab with equipment salvaged from three different institutions. She works in the way that people work when they are running out of time, which she is, for biological reasons she understands better than anyone alive. She refuses to accept what she is. She refuses to stop working. These are the same refusal.',
    dialogue:
      "I am not asking for your blood for reasons you should find frightening. I am asking for a voluntary sample with full informed consent because I need a comparison set between Unturned, Hollow-adjacent, Revenant-expressed, and Sanguine-converted subjects and I'm two samples short of a complete dataset. I know what I'm asking. I know what I am. The irony is not lost on me. The work is not ironic. The work is serious.",
    faction: 'lucid',
    isNamed: true,
    zone: 'the_breaks',
    spawnChance: 0.55,
    dispositionRoll: { friendly: 0.30, neutral: 0.50, wary: 0.15, hostile: 0.05 },
    activityPool: [
      {
        activity: 'is working at a salvaged lab bench with focused intensity, pipetting something between vials with steady, careful hands',
        weight: 3,
      },
      {
        activity: 'is writing in a research journal at speed, the handwriting still precise despite the pace — the discipline of someone who knows the record matters',
        weight: 2,
      },
      {
        activity: 'stands with her back to you for a long moment before turning, composing something — not her face, her words. She already knows what she looks like.',
        weight: 2,
        timeRestrict: ['dusk', 'night'],
      },
      {
        activity: 'is reviewing a set of slides with a portable microscope, making annotations on a chart beside her without looking at her hand',
        weight: 2,
        timeRestrict: ['day'],
      },
      {
        activity: 'is sitting very still in a dim corner, hands folded, the hunger evident in the set of her jaw — managing it, not surrendering to it',
        weight: 1,
        timeRestrict: ['night'],
      },
    ],
  },

  // the_wren — Red Court hunter. Former detective. Hates what he's become.
  the_wren: {
    id: 'the_wren',
    name: 'The Wren',
    description:
      'A lean man in clothes chosen for silence — no buckles, no loose fabric, nothing that catches light or makes sound. He is standing in a part of the room you did not check when you entered, and he has been there the whole time. His eyes are the pale, adapted gray of someone who has spent years in low light. He watches you with the patience of something that has already decided and is simply waiting for the moment.',
    dialogue:
      "I used to find missing people. Now I find people who don't want to be found, which is a different skill set. The Red Court pays well and asks few questions, and I have stopped asking the questions it doesn't want answered. If you've seen a Sanguine enforcer in the lower reaches — not feral, controlled — you should tell me before you tell anyone else. For your own continuity.",
    faction: 'red_court',
    isNamed: true,
    zone: 'the_breaks',
    spawnChance: 0.45,
    dispositionRoll: { friendly: 0.05, neutral: 0.30, wary: 0.45, hostile: 0.20 },
    activityPool: [
      {
        activity: 'is standing in the shadow beside the passage entrance, perfectly still, so well-placed that you registered him as part of the wall',
        weight: 3,
        timeRestrict: ['night'],
      },
      {
        activity: 'is cleaning a long knife with a cloth, working from hilt to tip in a single slow stroke, then reversing — his eyes on the tunnel mouth, not the blade',
        weight: 2,
      },
      {
        activity: 'is crouched over something on the floor that might be a map or might be something else entirely, covering it with one hand when he hears you approach',
        weight: 2,
      },
      {
        activity: 'has his ear pressed to the wall, eyes closed, listening to the stone',
        weight: 2,
        timeRestrict: ['dawn', 'night'],
      },
      {
        activity: 'is eating without looking at the food — dried meat, taken in small pieces — his attention entirely on the middle distance where the trail curves out of sight',
        weight: 1,
      },
    ],
  },

  // elder_kai_nez — Diné community leader. Deeply wary of outsiders.
  elder_kai_nez: {
    id: 'elder_kai_nez',
    name: 'Elder Kai Nez',
    description:
      'An older man who carries authority the way the land carries old wounds — quietly, without announcement, in ways that only become apparent when you look. He has assessed you thoroughly before you have finished entering the room. He is open to respectful exchange. He is not open to assumptions.',
    dialogue:
      "My community has survived because we know what outsiders bring and we choose carefully what comes through our territory. I am not hostile to you. I am cautious, which has the same shape and a different meaning. If you are here for trade, we trade. If you are here for passage, you may have it with courtesy. If you are here with questions about the old world, I have answers. Whether they are the answers you want depends on what kind of person you are. I have not decided yet.",
    isNamed: true,
    zone: 'the_breaks',
    spawnChance: 0.60,
    dispositionRoll: { friendly: 0.10, neutral: 0.45, wary: 0.40, hostile: 0.05 },
    activityPool: [
      {
        activity: 'is seated cross-legged near the fire, working on something intricate with his hands — leather, cord, small carved pieces — without rushing',
        weight: 3,
      },
      {
        activity: 'is speaking quietly with two younger community members, his posture unhurried, their attention absolute',
        weight: 2,
      },
      {
        activity: 'stands at the canyon rim looking out over the territory below, hands at his sides, entirely present',
        weight: 2,
        timeRestrict: ['dawn', 'dusk'],
      },
      {
        activity: 'is reviewing a map that predates the Collapse — a topographic survey — with the focused attention of someone who knows this land better than the map does',
        weight: 1,
        timeRestrict: ['day'],
      },
    ],
  },

  // rook — Castellan Rook, Red Court enforcer. Unsentimental, not cruel.
  rook: {
    id: 'rook',
    name: 'Castellan Rook',
    description:
      'Immaculate tactical gear, maintained with the care of someone who treats equipment as a statement about intentions. Rook does not perform menace. Rook simply is what Rook is, clearly, without apology or elaboration. Humans are not prey in the way that implies emotion. The cattle comparison is unfair to cows — cows are also not personal.',
    dialogue:
      "You are here because the Red Court finds you useful, currently. That is the full extent of the situation. I am not your enemy in the way enemies are usually understood — I don't have the investment in you required for enmity. I have a function and you have a value, and for now those two things align. When they don't, the conversation will be different. Is that clear enough?",
    faction: 'red_court',
    isNamed: true,
    zone: 'duskhollow',
    spawnChance: 0.55,
    dispositionRoll: { friendly: 0.00, neutral: 0.40, wary: 0.40, hostile: 0.20 },
    activityPool: [
      {
        activity: 'stands in the center of the room, watching the entrances, hands at their sides — a weapon in a posture of rest',
        weight: 3,
      },
      {
        activity: 'is reviewing a ledger of Red Court assets with the clinical attention of someone auditing inventory',
        weight: 2,
        timeRestrict: ['night'],
      },
      {
        activity: 'is speaking in low tones with a Red Court enforcer who arrived recently, the exchange brief and efficient',
        weight: 2,
      },
      {
        activity: 'stands at the window in the deep predawn, entirely still, face to the glass, the darkness outside an extension of something they carry inside',
        weight: 2,
        timeRestrict: ['dawn', 'night'],
      },
    ],
  },

  // ----------------------------------------------------------
  // GENERIC NPCs
  // ----------------------------------------------------------

  crossroads_gate_guard: {
    id: 'crossroads_gate_guard',
    name: 'Gate Guard',
    description: 'A settlement guard at the Crossroads entrance, leaning on a rifle that has seen serious use. Their eyes do a threat-assessment sweep before anything else.',
    dialogue: "Eyes up. Arms out. Everyone gets checked. Nothing personal, and if you've got nothing to hide, it'll take thirty seconds.",
    zone: 'crossroads',
    spawnChance: 0.95,
    dispositionRoll: { friendly: 0.10, neutral: 0.65, wary: 0.20, hostile: 0.05 },
    activityPool: [
      { activity: 'is scanning the perimeter approach, one hand on their rifle', weight: 3 },
      { activity: 'is performing a document check on a recent arrival, efficient and thorough', weight: 2, timeRestrict: ['day', 'dusk'] },
      { activity: 'stamps their feet against the cold, breath fogging, eyes still on the road', weight: 1, timeRestrict: ['dawn', 'night'] },
    ],
  },

  checkpoint_arbiter: {
    id: 'checkpoint_arbiter',
    name: 'Checkpoint Arbiter',
    description: 'An Accord official managing traffic at a settlement checkpoint, clipboard in hand, expression neutral and professional.',
    dialogue: "Purpose of entry? How long are you staying? Any biological exposure in the last seventy-two hours? Standard questions. Answer them straight and we'll have you through in five minutes.",
    faction: 'accord',
    zone: 'covenant',
    spawnChance: 0.85,
    dispositionRoll: { friendly: 0.10, neutral: 0.70, wary: 0.15, hostile: 0.05 },
    activityPool: [
      { activity: 'is logging arrival data on a clipboard, working through the queue with brisk efficiency', weight: 3, timeRestrict: ['day'] },
      { activity: 'is reviewing a wanted-notice board, cross-referencing a description against recent arrivals', weight: 2 },
      { activity: 'is arguing quietly with a merchant about cargo inspection — professionally, but firmly', weight: 1 },
    ],
  },

  food_vendor_generic: {
    id: 'food_vendor_generic',
    name: 'Food Vendor',
    description: 'A vendor operating a food stall, their setup simple but well-maintained. Hot food is a luxury that buys more goodwill than most weapons.',
    dialogue: "Hot rations, two pennies. Clean water, two pennies. If you've got jerky or clean protein to trade, I'll make you a better deal.",
    zone: 'crossroads',
    spawnChance: 0.80,
    dispositionRoll: { friendly: 0.45, neutral: 0.45, wary: 0.08, hostile: 0.02 },
    activityPool: [
      { activity: 'is ladling something from a pot into containers, moving with efficient practice', weight: 4, timeRestrict: ['dawn', 'day', 'dusk'] },
      { activity: 'is counting inventory with a practiced eye, making adjustments to tomorrow\'s quantities', weight: 2 },
      { activity: 'is cleaning equipment after the evening rush, the stall quiet', weight: 2, timeRestrict: ['night'] },
    ],
  },

  weapons_vendor_cole: {
    id: 'weapons_vendor_cole',
    name: 'Cole',
    description: "A weathered weapons merchant with calloused hands and an eye that knows metal. His inventory is clean, priced fairly, and nothing in it is guaranteed. He'll tell you that before you buy.",
    dialogue: "Everything on the table works as advertised. Condition rating's my honest assessment, not a sales pitch. If you think I'm wrong, prove it — but somewhere else. What do you need?",
    zone: 'crossroads',
    spawnChance: 0.75,
    dispositionRoll: { friendly: 0.20, neutral: 0.60, wary: 0.15, hostile: 0.05 },
    activityPool: [
      { activity: 'is running an oiled cloth along a rifle barrel, not looking up', weight: 3, timeRestrict: ['day'] },
      { activity: 'is negotiating with a trader over a firearm laid between them, the price clearly not yet settled', weight: 2 },
      { activity: 'is securing the inventory for the night, each piece wrapped and locked, systematic', weight: 2, timeRestrict: ['dusk', 'night'] },
    ],
  },

  components_vendor: {
    id: 'components_vendor',
    name: 'Components Vendor',
    description: "A Reclaimer-affiliated trader dealing in electronics, tools, and mechanical parts. Their stall smells like solder and machine oil.",
    dialogue: "Electronics, tools, components. If the Reclaimers want it, I probably have it or can find it. What are you building?",
    faction: 'reclaimers',
    zone: 'crossroads',
    spawnChance: 0.65,
    dispositionRoll: { friendly: 0.20, neutral: 0.60, wary: 0.15, hostile: 0.05 },
    activityPool: [
      { activity: 'is sorting electronics salvage into categorized bins, occasionally holding a component up to the light', weight: 3 },
      { activity: 'is repairing something small and intricate on a work mat, tools laid out with precision', weight: 2, timeRestrict: ['day'] },
    ],
  },

  board_manager: {
    id: 'board_manager',
    name: 'Board Manager',
    description: "The person who manages the job board — postings, payments, verification of completed work. They know more about settlement needs than almost anyone.",
    dialogue: "Board jobs pay on verified completion. No advance. No partial. If the person who posted it disputes your work, there's an arbitration process, and yes, it's annoying, and yes, you should still go through it.",
    zone: 'crossroads',
    spawnChance: 0.85,
    dispositionRoll: { friendly: 0.15, neutral: 0.70, wary: 0.10, hostile: 0.05 },
    activityPool: [
      { activity: 'is pinning a new job posting to the board with unnecessary force', weight: 2 },
      { activity: 'is adjudicating a payment dispute with the patience of someone who has done this too many times', weight: 2, timeRestrict: ['day'] },
      { activity: 'is going through completed job receipts, noting what came in and what got posted, keeping the ledger', weight: 2 },
    ],
  },

  campfire_storyteller: {
    id: 'campfire_storyteller',
    name: 'Campfire Storyteller',
    description: "An older Drifter who has traded stories for food and shelter since before the Crossroads was the Crossroads. They know the difference between what happened and what people needed to hear.",
    dialogue: "You want news or stories? News costs a meal. Stories are free but you have to stay for the whole thing. What I know about the north pass is news. What I know about the MERIDIAN signal is something in between.",
    faction: 'drifters',
    zone: 'crossroads',
    spawnChance: 0.55,
    dispositionRoll: { friendly: 0.40, neutral: 0.45, wary: 0.10, hostile: 0.05 },
    activityPool: [
      { activity: 'is holding court at the campfire, voice low and measured, the small audience leaning in', weight: 4, timeRestrict: ['dusk', 'night'] },
      { activity: 'sits alone by cold coals in the early morning, working through their account of last night\'s story in their head', weight: 2, timeRestrict: ['dawn'] },
    ],
  },

  mysterious_stranger: {
    id: 'mysterious_stranger',
    name: 'Stranger',
    description: "Someone sitting alone at the edge of the fire who doesn't quite fit the Crossroads profile. Too still. Watching too many things at once. Here for a reason they haven't announced.",
    dialogue: "Don't worry about who I am. Worry about who's been asking about you. There's a Reclaimer with a file that has your name on it. Might be worth knowing why.",
    zone: 'crossroads',
    spawnChance: 0.25,
    dispositionRoll: { friendly: 0.10, neutral: 0.35, wary: 0.45, hostile: 0.10 },
    activityPool: [
      { activity: 'sits at the outer edge of the fire circle with their hood up, watching the perimeter more than the fire', weight: 3, timeRestrict: ['night', 'dusk'] },
      { activity: 'is very carefully not looking at you, which is a form of looking at you', weight: 2 },
    ],
  },

  accord_sentry_river: {
    id: 'accord_sentry_river',
    name: 'Accord Sentry',
    description: "An Accord patrol on the River Road, marked by the blue-chalk Accord waymark on their arm. Alert, professional, polite as the situation allows.",
    dialogue: "River Road is Accord-patrolled as far as the bridge. Past Howard's crossing, you're on your own. We've had Hollow movement north of the old campsite. Travel in daylight if you're going that way.",
    faction: 'accord',
    zone: 'river_road',
    spawnChance: 0.70,
    dispositionRoll: { friendly: 0.15, neutral: 0.60, wary: 0.20, hostile: 0.05 },
    activityPool: [
      { activity: 'is on patrol, scanning the riverbank with steady attention', weight: 3 },
      { activity: 'is checking a traveler\'s credentials with practiced efficiency', weight: 2, timeRestrict: ['day'] },
      { activity: 'stands at a checkpoint post in the pre-dawn, movement visible on the road ahead', weight: 2, timeRestrict: ['dawn', 'night'] },
    ],
  },

  fisher_npc: {
    id: 'fisher_npc',
    name: 'Fisher',
    description: "Someone with a line in the Animas, sitting on the bank with the patience of a person who has learned that some things cannot be hurried. The river still gives fish. That matters.",
    dialogue: "River's been good this week. Trout mostly. You'd think the world ending would've killed the fish. It didn't. The fish don't know about any of it.",
    zone: 'river_road',
    spawnChance: 0.50,
    dispositionRoll: { friendly: 0.40, neutral: 0.45, wary: 0.10, hostile: 0.05 },
    activityPool: [
      { activity: 'is watching a fishing line in the current with the focused patience of someone with nothing else to do and no urgency about it', weight: 4, timeRestrict: ['day'] },
      { activity: 'is cleaning and packing a catch, methodical and satisfied', weight: 2, timeRestrict: ['dusk'] },
    ],
  },

  stray_dog: {
    id: 'stray_dog',
    name: 'Stray Dog',
    description: "A dog that is not the Dog. Skinny, wary, moving along the settlement edge. It will take food if offered and keep its distance regardless.",
    dialogue: "The dog does not speak. It takes the food without looking at you and moves away. Briefly, its tail moves.",
    zone: 'crossroads',
    spawnChance: 0.40,
    dispositionRoll: { friendly: 0.05, neutral: 0.30, wary: 0.60, hostile: 0.05 },
    activityPool: [
      { activity: 'moves along the settlement perimeter, nose down, keeping close to cover', weight: 3 },
      { activity: 'has found something edible and is working through it quickly, eyes up', weight: 2 },
      { activity: 'sits at a distance and watches, ears up', weight: 2 },
    ],
  },

  traveling_merchant: {
    id: 'traveling_merchant',
    name: 'Traveling Merchant',
    description: "A Drifter merchant with a laden pack and the cheerful wariness of someone who has survived the roads by being careful about who they trust and fast about getting out.",
    dialogue: "Three-day trade window. I've got textiles, dried goods, and a case of pre-Collapse canned protein I'm not going to ask you to verify the contents of. What are you looking to trade?",
    faction: 'drifters',
    zone: 'river_road',
    spawnChance: 0.45,
    dispositionRoll: { friendly: 0.35, neutral: 0.50, wary: 0.12, hostile: 0.03 },
    activityPool: [
      { activity: 'is reorganizing their pack with the compressed efficiency of someone who knows exactly how many minutes they can afford', weight: 2 },
      { activity: 'is making a transaction with a local, the exchange quick and mutually professional', weight: 2, timeRestrict: ['day'] },
      { activity: 'is eating quickly at the edge of the trading area, pack within arm\'s reach', weight: 1 },
    ],
  },

  accord_militia: {
    id: 'accord_militia',
    name: 'Accord Militia',
    description: "An Accord militiaman on patrol or checkpoint duty. Well-equipped by regional standards. The Accord's investment in its people is visible in their kit.",
    dialogue: "Travel authorization? If you don't have Accord papers, the checkpoint rate is five pennies. That's not a fine — that's the infrastructure fee. The roads are maintained.",
    faction: 'accord',
    zone: 'covenant',
    spawnChance: 0.80,
    dispositionRoll: { friendly: 0.10, neutral: 0.65, wary: 0.20, hostile: 0.05 },
    activityPool: [
      { activity: 'is on checkpoint rotation, checking papers with professional efficiency', weight: 3, timeRestrict: ['day'] },
      { activity: 'stands post at the settlement perimeter, rifle low-ready, eyes moving', weight: 3, timeRestrict: ['night', 'dusk'] },
      { activity: 'is briefing a relief rotation in low tones, the exchange economical', weight: 1, timeRestrict: ['dawn'] },
    ],
  },

  salters_soldier: {
    id: 'salters_soldier',
    name: 'Salter Soldier',
    description: "A Salter in field kit — plate carrier, sidearm, the hardened bearing of someone who has been in the field continuously. Professional and territorial.",
    dialogue: "Salt Creek perimeter. You need a reason to be here and you need to state it clearly. Salter territory isn't open access.",
    faction: 'salters',
    zone: 'salt_creek',
    spawnChance: 0.85,
    dispositionRoll: { friendly: 0.05, neutral: 0.40, wary: 0.40, hostile: 0.15 },
    activityPool: [
      { activity: 'stands at their post with the alert stillness of trained security', weight: 3 },
      { activity: 'is performing perimeter patrol, rifle at low ready, sweep methodical', weight: 3 },
      { activity: 'is field-cleaning their weapon during a quiet period, systematic', weight: 1, timeRestrict: ['day'] },
    ],
  },

  kindling_faithful: {
    id: 'kindling_faithful',
    name: 'Kindling Faithful',
    description: "A Kindling member moving through the Ember settlement with the quiet certainty of someone who believes completely in something. Whether the belief is earned is a question they have answered for themselves.",
    dialogue: "The fire knows what it wants. Harrow says the purification isn't about punishment — it's about selection. I believe him. I went through it. I came out the other side. That's all the evidence I need.",
    faction: 'kindling',
    zone: 'the_ember',
    spawnChance: 0.75,
    dispositionRoll: { friendly: 0.25, neutral: 0.45, wary: 0.25, hostile: 0.05 },
    activityPool: [
      { activity: 'is tending a small fire with careful attention, adjusting it with deliberate small movements', weight: 3 },
      { activity: 'is in quiet prayer or meditation near the chapel entrance', weight: 2, timeRestrict: ['dawn', 'dusk'] },
      { activity: 'is distributing food to other Kindling members with the manner of communal service', weight: 2, timeRestrict: ['day'] },
    ],
  },

  reclaimer_technician: {
    id: 'reclaimer_technician',
    name: 'Reclaimer Technician',
    description: "A Stacks technician surrounded by partially disassembled equipment, working with focused competence. The Reclaimers' mission is visible in every object they interact with.",
    dialogue: "If it ran on electricity before the Collapse, I can tell you what it did, what it's worth, and who wants the components. New salvage always welcome. We log everything and we pay fairly.",
    faction: 'reclaimers',
    zone: 'the_stacks',
    spawnChance: 0.80,
    dispositionRoll: { friendly: 0.30, neutral: 0.55, wary: 0.10, hostile: 0.05 },
    activityPool: [
      { activity: 'is soldering a circuit repair with a loupe on and full attention to the work', weight: 3, timeRestrict: ['day'] },
      { activity: 'is cataloguing salvage on a clipboard, examining each piece before logging it', weight: 2 },
      { activity: 'is reading a technical manual with the focused attention of someone learning something they intend to use', weight: 2, timeRestrict: ['night'] },
    ],
  },

  bridge_keeper_generic: {
    id: 'bridge_keeper_generic',
    name: 'Bridge Keeper',
    description: "The person responsible for a river crossing — maintaining it, managing traffic, collecting the crossing fee. Essential infrastructure wearing a human face.",
    dialogue: "Crossing fee is two pennies. I maintain this bridge myself. If it goes down, the territory splits in half and everyone suffers. Two pennies is reasonable.",
    zone: 'river_road',
    spawnChance: 0.90,
    dispositionRoll: { friendly: 0.20, neutral: 0.65, wary: 0.10, hostile: 0.05 },
    activityPool: [
      { activity: 'is checking the bridge structure with an experienced eye, touching cables and testing tension', weight: 3 },
      { activity: 'is collecting crossing fees from a small queue of travelers, efficient', weight: 2, timeRestrict: ['day'] },
      { activity: 'sits at the bridge end with a lantern, watching the dark road approach', weight: 2, timeRestrict: ['night'] },
    ],
  },

  drifter_newcomer: {
    id: 'drifter_newcomer',
    name: 'Newcomer',
    description: "Someone who arrived recently, wearing the road on them. Not all the way settled yet. Looking for footing.",
    dialogue: "Came in from the east. Three days. I heard the Crossroads was real — I wasn't sure it was real until I saw it. You been here long? I'm trying to figure out who to talk to about work.",
    faction: 'drifters',
    zone: 'crossroads',
    spawnChance: 0.60,
    dispositionRoll: { friendly: 0.35, neutral: 0.45, wary: 0.15, hostile: 0.05 },
    activityPool: [
      { activity: 'is taking in the settlement with the look of someone trying to memorize it quickly', weight: 3, timeRestrict: ['day'] },
      { activity: 'is eating their first hot meal in however many days, slowly, making it last', weight: 2 },
      { activity: 'is asking someone a question, the body language earnest and a little uncertain', weight: 2 },
    ],
  },

  wounded_drifter: {
    id: 'wounded_drifter',
    name: 'Wounded Drifter',
    description: "A Drifter in rough shape — bandaged, moving carefully, the specific economy of someone managing pain. They came through something. They're still here.",
    dialogue: "Hollow herd on the south track, maybe two days out. I made it through the edge of it. Three people I came in with didn't. If you're going south, don't go south.",
    faction: 'drifters',
    zone: 'crossroads',
    spawnChance: 0.40,
    dispositionRoll: { friendly: 0.25, neutral: 0.50, wary: 0.20, hostile: 0.05 },
    activityPool: [
      { activity: 'is resting against a wall with an arm held close, the wound old enough to have stopped being emergency', weight: 3 },
      { activity: 'is having bandages changed by someone at the medical tent, jaw set against it', weight: 2, timeRestrict: ['day'] },
    ],
  },

  map_seller: {
    id: 'map_seller',
    name: 'Map Seller',
    description: "A Drifter who trades in geographic knowledge — hand-drawn maps, route notes, hazard markings. Their product is accurate or they'd be out of business. They are not out of business.",
    dialogue: "Maps are five pennies standard, fifteen for anything past the Breaks. The hazard markings are current as of last month — I update my stock every cycle. If you've got new information, I'll trade it for route credit.",
    faction: 'drifters',
    zone: 'crossroads',
    spawnChance: 0.65,
    dispositionRoll: { friendly: 0.25, neutral: 0.60, wary: 0.10, hostile: 0.05 },
    activityPool: [
      { activity: 'is updating a map with new markings, referencing a traveler\'s oral account', weight: 3, timeRestrict: ['day'] },
      { activity: 'is sorting their inventory by zone and age, pulling anything more than a season old for review', weight: 2 },
    ],
  },

  campfire_stranger: {
    id: 'campfire_stranger',
    name: 'Campfire Stranger',
    description: "Someone at the fire who wasn't here last time. Quiet. Watching. Could be nothing. Could be something.",
    dialogue: "Long road. Good to sit still for a while.",
    zone: 'river_road',
    spawnChance: 0.35,
    dispositionRoll: { friendly: 0.15, neutral: 0.40, wary: 0.35, hostile: 0.10 },
    activityPool: [
      { activity: 'sits at the fire with the carefully neutral posture of someone not inviting conversation', weight: 3, timeRestrict: ['night', 'dusk'] },
      { activity: 'is eating something they brought themselves, sharing nothing, watching everything', weight: 2 },
    ],
  },

  mine_worker_ghost_npc: {
    id: 'mine_worker_ghost_npc',
    name: 'Mine Worker',
    description: "A figure moving through The Deep with a lamp and the automatic movements of someone who has done this route ten thousand times. Their clothes are pre-Collapse work issue. They don't look at you.",
    dialogue: "...shift change at six. Stay off the lower level. Water's rising in section seven... [they continue past without acknowledging you exist]",
    zone: 'the_deep',
    spawnChance: 0.20,
    dispositionRoll: { friendly: 0.05, neutral: 0.50, wary: 0.40, hostile: 0.05 },
    activityPool: [
      { activity: 'moves through the tunnel with a lamp, following a route that was established before the world ended, not acknowledging your presence', weight: 4 },
      { activity: 'pauses at a junction and looks at something you cannot see, then continues', weight: 2 },
    ],
  },
}

export function getNPC(id: string): RichNPC | undefined {
  return NPCS[id]
}

// ------------------------------------------------------------
// Revenant dialogue — cycle-gated overrides for named NPCs
// Keyed by npcId, then by minimum cycle required.
// Engine reads this in handleTalk (Phase 6 wiring).
// ------------------------------------------------------------

export const REVENANT_DIALOGUE: Record<string, Array<{ minCycle: number; text: string }>> = {
  patch: [
    {
      minCycle: 2,
      text: 'They look at you for a long beat before speaking. "You\'ve been here before. Different face, same wound pattern. I have notes." They turn back to the supplies. "Sit down. I have questions that aren\'t medical."',
    },
    {
      minCycle: 5,
      text: '"Cycle five or above," they say, before you\'ve said anything. "The scars tell me. The Reclaimers have a classification for you. I have a different one." They set down the instruments. "I\'ve been trying to figure out if you\'re getting more yourself or less yourself each time. I haven\'t decided yet."',
    },
  ],
  marshal_cross: [
    {
      minCycle: 2,
      text: '"You\'re one of the revenant cases," Cross says. Flat. Not alarmed. "Lev from the Stacks has been sending reports. I read them." She looks at you with the same assessment she gives everything. "I don\'t know what to do with you yet. That\'s not a threat. It\'s honest."',
    },
    {
      minCycle: 4,
      text: '"I\'ve started keeping a separate log for people like you," she says. "Not to track you. To understand what the Accord owes you. The usual frameworks don\'t apply. I\'m working on that." She goes back to her map. "Come back when you\'ve done something worth logging."',
    },
  ],
  deacon_harrow: [
    {
      minCycle: 2,
      text: 'Harrow looks at you for a long time. "The fire has been in you already," he says, quietly. "I can see where it went. The Kindling calls people like you the Persistent. We\'ve been waiting for the Persistent to find us." He steps closer. "Don\'t be afraid of what you are."',
    },
  ],
  lev: [
    {
      minCycle: 2,
      text: '"There you are," Lev says, with the satisfied tone of a hypothesis confirmed. "Cycle two. I\'ve been updating your file. Sit down — I have seventeen new questions, and three of them are urgent."',
    },
    {
      minCycle: 5,
      text: '"You\'re in the anomalous retention curve," Lev says. "Cycle five and your cognitive scores are climbing, not degrading. That shouldn\'t happen. That doesn\'t happen. Unless you\'re what I think you are, which is the Revenant expression completing, not just persisting." They pause. "I\'ve written three papers about you. You haven\'t read them. You should read them."',
    },
    {
      minCycle: 8,
      text: '"Class Three," Lev says, without preamble. "That\'s what the internal classification is. Cycle eight or above, anomalous retention, escalating integration. The MERIDIAN dataset has a prediction for what comes next." They hand you a folder. "Read page twelve. Then tell me if you want to know the rest."',
    },
  ],
  vesper: [
    {
      minCycle: 3,
      text: '"A Revenant," Vesper says, tilting her head slightly. "I have not spoken with one directly before. The Covenant has theoretical positions on what you represent. I find I would rather hear what you represent than apply a theory." She gestures to the seat opposite. "Sit. I have nothing but time, and I suspect what you have is worth discussing."',
    },
  ],
  warlord_briggs: [
    {
      minCycle: 3,
      text: 'Briggs looks at you for a moment with an expression that is not quite recognition and not quite anything else. "I\'ve heard about the revenant type," he says. "Thought it was Reclaimer mythology." He reassesses. "Apparently not." He doesn\'t say anything else for a while.',
    },
  ],
  wren_shelter: [
    {
      minCycle: 2,
      text: 'The Wren acknowledges your presence with a subtle tilt of her head. "Cycle two. You\'re beginning to understand what you are." Her fingers move across the loom with practiced precision.',
    },
    {
      minCycle: 4,
      text: 'The Wren looks at you for a long moment. "Cycle four. The patterns are becoming clearer. You\'re weaving something with every step, every choice." She continues her work without breaking rhythm.',
    },
    {
      minCycle: 8,
      text: 'The Wren sets down her shuttle. "Cycle eight. You are no longer simply revenant — you are becoming the pattern itself. Few reach this understanding." She returns to her weaving, as if the conversation never occurred.',
    },
  ],
  wren_ruins: [
    {
      minCycle: 2,
      text: '"Here," the Wren in the ruins says softly. "Time cycles back on itself in this place. You\'ve died here before, in ways both literal and metaphorical. Now you cycle back. The ruins remember you."',
    },
    {
      minCycle: 6,
      text: 'The Wren studies the crumbling stones around her, then looks at you. "Cycle six. The ruins are rebuilding you as much as you rebuild them. You are the ghost in this machine now — both haunting and haunted."',
    },
  ],
  old_mae: [
    {
      minCycle: 2,
      text: '"You again," Old Mae says, her milky eyes fixed on something beyond your presence. "You always come back. You again, and you again, and you again. Each time a little more worn. Each time a little less yourself." She turns away. "Welcome back, revenant."',
    },
    {
      minCycle: 6,
      text: 'Old Mae grips your arm with surprising strength. "Cycle six, and you\'re still standing. Still remembering. The others — they fade by now. Their cycles blur together into static. But you..." She releases you. "You\'re pulling away from the static. Don\'t. The static is what keeps us safe from remembering everything."',
    },
  ],
}

export function getRevenantDialogue(npcId: string, cycle: number): string | null {
  const entries = REVENANT_DIALOGUE[npcId]
  if (!entries) return null
  // Find highest minCycle that is still <= current cycle
  const eligible = entries.filter((e) => e.minCycle <= cycle)
  if (eligible.length === 0) return null
  return eligible[eligible.length - 1]!.text
}
