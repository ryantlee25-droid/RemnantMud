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

  // ----------------------------------------------------------
  // STORY NPCs — named, critical to Act II–III narrative
  // ----------------------------------------------------------

  // vane_broadcaster — Elias Vane. Seven years inside MERIDIAN. The signal source.
  vane_broadcaster: {
    id: 'vane_broadcaster',
    name: 'The Broadcaster',
    description: "A person who has been alone for seven years and has learned, with some precision, what that does to a person. They are thin in a way that reads as deliberate — the body's economy becoming expert. The eyes are alert and tired simultaneously, which is the look of someone who has been paying attention to something frightening for a very long time. They do not appear surprised to see you. They have been expecting someone for seven years.",
    dialogue: "I've been trying to figure out what to say. I've had seven years and I still haven't got it right. You're the first one who made it in. You're the first one who made it to me. I don't know if that means you're remarkable or if it means the signal finally reached someone who wasn't afraid of the answer. Both, probably. Sit down. I have — I have a lot to tell you. And I need to tell it in the right order.",
    zone: 'the_scar',
    spawnChance: 1.00,
    dispositionRoll: { friendly: 0.50, neutral: 0.45, wary: 0.05, hostile: 0.00 },
    activityPool: [
      { activity: 'is at the broadcast console, making small adjustments to the signal — a routine so familiar they are barely conscious of it', weight: 3 },
      { activity: 'stands at the window of the antechamber, looking at the section of MERIDIAN you just walked through, saying nothing', weight: 2 },
      { activity: 'is reading through a stack of handwritten notes, finding a specific page, stopping at it, setting it down', weight: 2 },
      { activity: 'is simply sitting, watching the door, waiting — the posture of someone who has practiced patience until it became natural', weight: 2, timeRestrict: ['dawn', 'dusk'] },
    ],
  },

  // elder_sanguine_npc — The Sanguine elder in the Deep. Faction contact, not combat.
  elder_sanguine_npc: {
    id: 'elder_sanguine_npc',
    name: 'The Elder',
    description: "The oldest Sanguine you have encountered. The difference is not in the eyes or the speed — it is in the stillness. The younger ones are predators learning patience. This one finished learning it long ago. They are sitting in a chair that was placed here deliberately, in a position from which they can observe all approaches. They have been expecting you in the way you expect weather — not specific, just eventual.",
    dialogue: "The Red Court calls us resources. The Accord calls us threats. The Kindling calls us revelation. We call ourselves what we are: a new expression of something very old. You are here because you are curious or because you are desperate, and I find I have less patience for the distinction than I used to. Ask your question. I may answer it. I will certainly answer a version of it.",
    faction: 'lucid',
    zone: 'the_deep',
    spawnChance: 0.90,
    dispositionRoll: { friendly: 0.20, neutral: 0.55, wary: 0.20, hostile: 0.05 },
    activityPool: [
      { activity: 'sits in the chair at the center of the chamber, hands folded, watching the entrance you came through', weight: 4 },
      { activity: 'is speaking in a low voice with a younger Sanguine nearby, the exchange one-directional — the Elder speaks, the other listens', weight: 2 },
      { activity: 'stands at the edge of the chamber with their back to the entrance, entirely aware of your presence', weight: 2, timeRestrict: ['night'] },
    ],
  },

  // vivarium_sanguine — A Sanguine subject in MERIDIAN's vivarium. Not hostile. Not free.
  vivarium_sanguine: {
    id: 'vivarium_sanguine',
    name: 'Vivarium Subject',
    description: "A person standing in one of the observation chambers, unhurried, watching you through the glass. The chamber is not locked from the outside — they have had seven years to notice this. They have not left. They are watching you the way something watches when it is trying to determine whether you are the same kind of thing it is.",
    dialogue: "The door has been unlocked for two years. I know because I checked. I stay because outside this glass is seven years of Hollow, and I am not certain what I am anymore, and I would rather be uncertain here than uncertain out there. What are you? You're not Hollow. You're not — you're something else. Tell me what you are and I'll tell you what I've figured out about this place.",
    zone: 'the_scar',
    spawnChance: 0.80,
    dispositionRoll: { friendly: 0.30, neutral: 0.50, wary: 0.20, hostile: 0.00 },
    activityPool: [
      { activity: 'stands at the glass of the observation chamber, watching you with careful attention', weight: 4 },
      { activity: 'is sitting on the floor of the chamber with their back against the wall, looking at their hands', weight: 2, timeRestrict: ['night'] },
      { activity: 'is writing something on the wall of the chamber in small, precise lettering you cannot read from this side', weight: 2 },
    ],
  },

  // prisoner_dell — Covenant jail prisoner. Knows something.
  prisoner_dell: {
    id: 'prisoner_dell',
    name: 'Dell',
    description: "A man in his forties sitting with his back against the cell wall and a stillness that suggests he has run out of the energy required for restlessness. He has been here long enough that the cell fits him. He looks up when you enter with the automatic assessment of someone who has learned to read new variables quickly. He is not afraid of you. That is either a good sign or a very bad one.",
    dialogue: "You're not Accord or you'd be on the other side of the bars. That means you're passing through, which means you've got a few minutes. I've got information about what's north of the creek crossing — information Marshal Cross does not have, which is why I'm still alive and in here instead of dead and somewhere else. I'm willing to trade. What can you offer a man with no possessions?",
    zone: 'covenant',
    spawnChance: 0.90,
    dispositionRoll: { friendly: 0.25, neutral: 0.55, wary: 0.15, hostile: 0.05 },
    activityPool: [
      { activity: 'sits against the cell wall with his legs extended, watching the corridor with measured patience', weight: 4 },
      { activity: 'is doing slow, methodical exercises in the small space — sit-ups, push-ups, the maintenance of a body that intends to walk out of here', weight: 2 },
      { activity: 'is asleep, or appears to be, but the quality of the stillness is too controlled for real sleep', weight: 2, timeRestrict: ['night'] },
    ],
  },

  // shepherd_hermit — Pine Sea hermit. Knows the old routes.
  shepherd_hermit: {
    id: 'shepherd_hermit',
    name: 'The Shepherd',
    description: "An older person who has been in the Pine Sea long enough that they and the forest have reached an arrangement. Their clothes are practical in the way that comes from years of refinement rather than choice. They move through the trees without sound. They looked at you for a long moment before deciding to come closer. The decision felt considered.",
    dialogue: "I know every track in a forty-kilometer radius that a person can walk without dying. I know which ones have changed in the last month and which ones have been wrong since before the Collapse. I don't share that information for free, because it isn't free — I earned it by walking it, and the Hollow that are out there now are different from the ones that were out there last season. Sit. Tell me where you're trying to go.",
    zone: 'the_pine_sea',
    spawnChance: 0.65,
    dispositionRoll: { friendly: 0.20, neutral: 0.55, wary: 0.20, hostile: 0.05 },
    activityPool: [
      { activity: 'is moving through the treeline at the edge of the clearing with the quiet efficiency of someone who belongs here', weight: 3 },
      { activity: 'sits near a small, nearly smokeless fire with something cooking, not looking up when you approach', weight: 3, timeRestrict: ['dusk', 'night'] },
      { activity: 'is checking the condition of a trail marker — a notched tree — running a hand along the notch, reading it', weight: 2, timeRestrict: ['dawn', 'day'] },
    ],
  },

  // kindling_doubter_avery — A Kindling member with private doubts.
  kindling_doubter_avery: {
    id: 'kindling_doubter_avery',
    name: 'Avery',
    description: "A young Kindling member who keeps finding reasons to be somewhere other than the group. Not sulking — doing. Useful things. The hands are always occupied. The eyes keep landing on the horizon and then correcting back to the task. They have the look of someone who has a question they have decided not to ask and is not entirely at peace with that decision.",
    dialogue: "Harrow says the fire selects. That the Hollow who stay Hollow are the ones who weren't ready and the ones who turn Sanguine are the ones who were. I've been watching the people the virus takes, and — I've been watching for two years. I haven't found the pattern. I haven't told Harrow that. You're the first person I've said it to. I don't know why I'm telling you.",
    faction: 'kindling',
    zone: 'the_ember',
    spawnChance: 0.55,
    dispositionRoll: { friendly: 0.35, neutral: 0.45, wary: 0.15, hostile: 0.05 },
    activityPool: [
      { activity: 'is repairing something at the edge of the settlement, working with focused attention in a way that keeps them facing away from the chapel', weight: 3 },
      { activity: 'is watching the treeline from the perimeter, the expression of someone thinking about distance', weight: 2, timeRestrict: ['dusk', 'night'] },
      { activity: 'is doing quiet, useful work — stacking wood, checking supplies — the industry of someone who needs their hands busy', weight: 2 },
    ],
  },

  // ----------------------------------------------------------
  // COVENANT zone NPCs
  // ----------------------------------------------------------

  accord_gate_militiaman: {
    id: 'accord_gate_militiaman',
    name: 'Gate Militiaman',
    description: 'An Accord militiaman at the Covenant gate, wearing the settlement\'s standard-issue kit with the ease of someone who has stood this post through every season. Alert. Professional. Not unfriendly.',
    dialogue: "Papers or payment. Eight pennies for a day pass. If you're staying longer, see the checkpoint arbiter. Any weapons need to be registered at the armory — unregistered carry inside the walls is a fine and a night in holding.",
    faction: 'accord',
    zone: 'covenant',
    spawnChance: 0.95,
    dispositionRoll: { friendly: 0.10, neutral: 0.70, wary: 0.15, hostile: 0.05 },
    activityPool: [
      { activity: 'stands post at the gate entrance, checking credentials as travelers pass', weight: 3 },
      { activity: 'is doing a sweep of the gate perimeter, methodical and unhurried', weight: 2, timeRestrict: ['dawn', 'dusk'] },
      { activity: 'exchanges a brief word with an incoming traveler, the body language professional', weight: 1 },
    ],
  },

  accord_square_patrol: {
    id: 'accord_square_patrol',
    name: 'Accord Patrol',
    description: 'An Accord soldier on square patrol — the regular circuit that covers the settlement center. The route is visible in their movement: deliberate, timed, consistent.',
    dialogue: "Anything to report? No? Good. Keep it that way. The square's been quiet this week and that's how we want it.",
    faction: 'accord',
    zone: 'covenant',
    spawnChance: 0.80,
    dispositionRoll: { friendly: 0.10, neutral: 0.65, wary: 0.20, hostile: 0.05 },
    activityPool: [
      { activity: 'is walking the patrol circuit around the square, eyes moving in the standard sweep pattern', weight: 4 },
      { activity: 'pauses at a corner to scan a side street before continuing the circuit', weight: 2 },
    ],
  },

  accord_trail_marker: {
    id: 'accord_trail_marker',
    name: 'Accord Scout',
    description: 'An Accord scout coming in off the road, carrying a report in a sealed pouch. The road dirt is recent. They are moving with the efficient fatigue of someone who has been walking since before dawn.',
    dialogue: "Inbound from the southern route. I need to see the duty officer. You're not the duty officer. Excuse me.",
    faction: 'accord',
    zone: 'covenant',
    spawnChance: 0.40,
    dispositionRoll: { friendly: 0.10, neutral: 0.60, wary: 0.25, hostile: 0.05 },
    activityPool: [
      { activity: 'is moving through the gate area with the purposeful stride of someone with a specific destination', weight: 4 },
      { activity: 'is waiting at the gate post for the duty officer, report pouch in hand', weight: 2 },
    ],
  },

  accord_war_room_officer: {
    id: 'accord_war_room_officer',
    name: 'Accord Officer',
    description: 'A senior Accord officer at the command post, wearing rank insignia on a jacket that has no room for sentiment. They carry the specific exhaustion of people who make decisions that affect hundreds of others.',
    dialogue: "Not my door. I'm in the middle of a briefing. Whatever it is, take it to the checkpoint arbiter or come back in an hour.",
    faction: 'accord',
    zone: 'covenant',
    spawnChance: 0.60,
    dispositionRoll: { friendly: 0.05, neutral: 0.45, wary: 0.40, hostile: 0.10 },
    activityPool: [
      { activity: 'is bent over the territory map with two subordinates, pointing and speaking in a low, terse voice', weight: 3, timeRestrict: ['day'] },
      { activity: 'is reviewing a stack of handwritten reports, moving through them with the speed of someone who knows what to look for', weight: 3 },
    ],
  },

  armorer_reyes: {
    id: 'armorer_reyes',
    name: 'Reyes',
    description: "The Covenant armorer. A compact person with forearms that know their business and eyes that assess every object they land on for structural integrity. Their workspace is immaculate. The weapons on their rack are not for sale — they are registered assets. Everything else might be negotiable.",
    dialogue: "Registration takes ten minutes and costs two pennies. After that, you're legal to carry inside the walls. If you've got equipment that needs work, I can assess it. If I can fix it, I will. I don't guarantee anything I haven't personally inspected.",
    faction: 'accord',
    zone: 'covenant',
    spawnChance: 0.75,
    dispositionRoll: { friendly: 0.15, neutral: 0.65, wary: 0.15, hostile: 0.05 },
    activityPool: [
      { activity: 'is field-stripping and inspecting a weapon at the workbench, the process systematic and thorough', weight: 3, timeRestrict: ['day'] },
      { activity: 'is reviewing the registration ledger, running a finger down the columns', weight: 2 },
      { activity: 'is talking with a soldier about a piece of equipment, handling it to demonstrate something', weight: 2 },
    ],
  },

  brig_guard: {
    id: 'brig_guard',
    name: 'Brig Guard',
    description: 'The guard assigned to the Covenant holding area. The expression is professionally neutral — they have heard everything that can be said through cell bars and have stopped reacting to most of it.',
    dialogue: "Visiting hours aren't a formal thing here, but if you're not here to see a prisoner and you don't have authorization, I'm going to have to ask you to move along.",
    faction: 'accord',
    zone: 'covenant',
    spawnChance: 0.90,
    dispositionRoll: { friendly: 0.10, neutral: 0.70, wary: 0.15, hostile: 0.05 },
    activityPool: [
      { activity: 'stands post outside the holding area, hands at ease, eyes on the door', weight: 4 },
      { activity: 'is doing a cell check — moving down the row, confirming occupancy, returning', weight: 2 },
    ],
  },

  brig_prisoner_accord: {
    id: 'brig_prisoner_accord',
    name: 'Prisoner',
    description: "Someone in Accord custody who is not talking about why. The set of their jaw and the careful management of their expression suggest this is not their first time in a cell.",
    dialogue: "If you're not a lawyer — and nobody here is a lawyer anymore — then I don't have anything to say to you. Move along.",
    zone: 'covenant',
    spawnChance: 0.60,
    dispositionRoll: { friendly: 0.05, neutral: 0.35, wary: 0.45, hostile: 0.15 },
    activityPool: [
      { activity: 'sits in the back of the cell with arms folded, not looking at the door', weight: 4 },
      { activity: 'is pacing the available space with the economy of someone who has calculated it exactly', weight: 2 },
    ],
  },

  courthouse_clerk: {
    id: 'courthouse_clerk',
    name: 'Courthouse Clerk',
    description: "The person who keeps the Accord's administrative records. They are surrounded by organized chaos — stacked ledgers, indexed files, the bureaucratic infrastructure of a functioning governance. They look up from a filing task with the expression of someone who has too much to do and has made peace with it.",
    dialogue: "Record requests take two days. Appeals go through the duty officer. If you need documentation processed today, there's an expedited fee. What are you here for?",
    faction: 'accord',
    zone: 'covenant',
    spawnChance: 0.80,
    dispositionRoll: { friendly: 0.15, neutral: 0.70, wary: 0.10, hostile: 0.05 },
    activityPool: [
      { activity: 'is cross-referencing two ledgers, making a small note with a pencil stub', weight: 3, timeRestrict: ['day'] },
      { activity: 'is filing a stack of documents into the appropriate drawers with practiced efficiency', weight: 2 },
    ],
  },

  covenant_collector: {
    id: 'covenant_collector',
    name: 'Tax Collector',
    description: "An Accord revenue official making rounds through the market district, clipboard and ledger under one arm. Their demeanor is that of someone who is very accustomed to being unpopular and has built defenses accordingly.",
    dialogue: "Market stall fee, storage fee, or transit tax — depends on what you're doing here. Everything runs on record. The Accord doesn't take things arbitrarily. We charge what the infrastructure costs.",
    faction: 'accord',
    zone: 'covenant',
    spawnChance: 0.55,
    dispositionRoll: { friendly: 0.05, neutral: 0.60, wary: 0.25, hostile: 0.10 },
    activityPool: [
      { activity: 'is moving through the market with a clipboard, recording transactions and checking fee compliance', weight: 3, timeRestrict: ['day'] },
      { activity: 'is arguing quietly with a vendor about a fee, the vendor losing', weight: 2 },
    ],
  },

  covenant_elder_unnamed: {
    id: 'covenant_elder_unnamed',
    name: 'Settlement Elder',
    description: "One of the older residents of Covenant — pre-Collapse memory in a post-Collapse body. They carry a lot of history and distribute it selectively. They are watching the settlement the way you watch something you remember being built.",
    dialogue: "I was here when Cross took the post. Before that it was Harmon, and before that it was open territory. Three administrations and I'm still here. What that says about me, I'm not sure, but it says something.",
    zone: 'covenant',
    spawnChance: 0.50,
    dispositionRoll: { friendly: 0.35, neutral: 0.45, wary: 0.15, hostile: 0.05 },
    activityPool: [
      { activity: 'sits in a doorway watching the square with the patience of long practice', weight: 3 },
      { activity: 'is talking with another elder, the exchange slow and considered', weight: 2 },
    ],
  },

  covenant_gate_sentry: {
    id: 'covenant_gate_sentry',
    name: 'Wall Sentry',
    description: 'An Accord sentry assigned to the covenant walls, watching the approach from a position that has been occupied continuously since the settlement was fortified. The eyes are trained for movement at the edge of effective range.',
    dialogue: "Eyes on the east approach. You need something, make it quick.",
    faction: 'accord',
    zone: 'covenant',
    spawnChance: 0.85,
    dispositionRoll: { friendly: 0.05, neutral: 0.65, wary: 0.25, hostile: 0.05 },
    activityPool: [
      { activity: 'is scanning the exterior with a slow, thorough sweep that covers the full field of view', weight: 4 },
      { activity: 'radios in a position check in a low voice, listening for acknowledgment', weight: 2 },
    ],
  },

  covenant_greeter: {
    id: 'covenant_greeter',
    name: 'Settlement Greeter',
    description: "An Accord civilian tasked with orienting newcomers — explaining the rules, the fees, the layout. They have explained this approximately five thousand times and have somehow kept it from becoming rote. The genuine welcome is policy, but it became real somewhere in the repetition.",
    dialogue: "Welcome to Covenant. Water is rationed — two liters per person per day, collected from the central station. Medical is the east building, marked. Weapons need to be registered before you sleep here. Any questions? Good. There's food at the central hall if you've got pennies, or work-exchange if you don't.",
    faction: 'accord',
    zone: 'covenant',
    spawnChance: 0.65,
    dispositionRoll: { friendly: 0.55, neutral: 0.35, wary: 0.08, hostile: 0.02 },
    activityPool: [
      { activity: 'is orienting a new arrival — pointing out landmarks, explaining procedure', weight: 3, timeRestrict: ['day'] },
      { activity: 'is answering questions from several newcomers simultaneously, managing the chaos with practiced calm', weight: 2, timeRestrict: ['day'] },
    ],
  },

  covenant_resident_wanderer: {
    id: 'covenant_resident_wanderer',
    name: 'Covenant Resident',
    description: "A settled resident of Covenant going about their day — neither merchant nor militia, just someone who has made a life here. Their movement through the settlement is proprietary in a quiet way. They know where things are.",
    dialogue: "Market's better in the morning. Afternoon you're getting what's left. If you're looking for the infirmary, it's east of the well — the building with the blue mark on the door.",
    zone: 'covenant',
    spawnChance: 0.75,
    dispositionRoll: { friendly: 0.30, neutral: 0.50, wary: 0.15, hostile: 0.05 },
    activityPool: [
      { activity: 'is moving through the settlement with the purposeful efficiency of someone with a list to complete', weight: 3, timeRestrict: ['day'] },
      { activity: 'is having a conversation with a neighbor, relaxed, voices low', weight: 2 },
      { activity: 'is sitting in the open air in the late day, not working, just present', weight: 2, timeRestrict: ['dusk'] },
    ],
  },

  covenant_sanguine_socialite: {
    id: 'covenant_sanguine_socialite',
    name: 'Sanguine Visitor',
    description: "A Sanguine in Covenant on what appears to be legitimate business — papers visible, demeanor polished, the careful performance of someone who has learned exactly how much presence to project to avoid being a problem. The photosensitivity is managed: they have positioned themselves in shade without appearing to. Their eyes don't quite land on things the way baseline human eyes do.",
    dialogue: "I'm here on a trade arrangement that Cross approved three weeks ago. The documentation is in order. I understand the discomfort. I also understand that this arrangement is mutually beneficial and that the Accord's pragmatism has always been one of its better qualities.",
    zone: 'covenant',
    spawnChance: 0.25,
    dispositionRoll: { friendly: 0.20, neutral: 0.55, wary: 0.20, hostile: 0.05 },
    activityPool: [
      { activity: 'is completing a transaction at a market stall with precise, courteous efficiency', weight: 2, timeRestrict: ['day'] },
      { activity: 'stands in the shade of the wall, watching the square — not conspicuously, but continuously', weight: 3 },
      { activity: 'is speaking with an Accord official, the exchange formal, documentation changing hands', weight: 2 },
    ],
  },

  east_wall_sentry: {
    id: 'east_wall_sentry',
    name: 'East Wall Sentry',
    description: "Accord wall post, east face. The eastern approach has the flattest sight lines — the best range and the least cover. The sentry knows this and uses it. They track movement from farther out than you'd expect.",
    dialogue: "East approach is clear. You need something?",
    faction: 'accord',
    zone: 'covenant',
    spawnChance: 0.90,
    dispositionRoll: { friendly: 0.05, neutral: 0.65, wary: 0.25, hostile: 0.05 },
    activityPool: [
      { activity: 'is scanning the eastern flat with a slow, thorough sweep', weight: 4 },
      { activity: 'is noting something in a position log, then returning attention to the approach', weight: 2 },
    ],
  },

  north_wall_sentry: {
    id: 'north_wall_sentry',
    name: 'North Wall Sentry',
    description: "The north wall faces the open territory — the direction most threats have come from historically. The sentry here is one of the experienced ones. They don't look bored.",
    dialogue: "North approach has been quiet this week. That's either good or the Hollow are moving differently. I'm watching for the second one.",
    faction: 'accord',
    zone: 'covenant',
    spawnChance: 0.90,
    dispositionRoll: { friendly: 0.05, neutral: 0.65, wary: 0.25, hostile: 0.05 },
    activityPool: [
      { activity: 'is watching the northern territory with binoculars, scanning slowly from left to right', weight: 4 },
      { activity: 'is talking quietly to the south wall sentry on radio, checking positions', weight: 2, timeRestrict: ['night'] },
    ],
  },

  south_wall_sentry: {
    id: 'south_wall_sentry',
    name: 'South Wall Sentry',
    description: "The south wall post overlooks the road from the river — the direction most legitimate traffic comes from. The sentry here does as much identification work as threat-watching.",
    dialogue: "South road's open. You coming in or going out?",
    faction: 'accord',
    zone: 'covenant',
    spawnChance: 0.90,
    dispositionRoll: { friendly: 0.10, neutral: 0.65, wary: 0.20, hostile: 0.05 },
    activityPool: [
      { activity: 'is watching the road approach, assessing the travel group approaching from a distance', weight: 3 },
      { activity: 'signals a traveler to halt for a distance identification before waving them forward', weight: 2, timeRestrict: ['day'] },
    ],
  },

  watchtower_sniper: {
    id: 'watchtower_sniper',
    name: 'Watchtower Marksman',
    description: "Accord's long-range overwatch, positioned in the watchtower with a clear field of fire on the approaches. Their communication style is economical. They are always looking at something past you.",
    dialogue: "I can see three kilometers on a clear day. On a clear day, I can see what's coming before anything else can. You want intel, I've got it. You want to stay in my field of fire, don't.",
    faction: 'accord',
    zone: 'covenant',
    spawnChance: 0.85,
    dispositionRoll: { friendly: 0.05, neutral: 0.60, wary: 0.30, hostile: 0.05 },
    activityPool: [
      { activity: 'is at the scope, doing a slow, methodical sector scan', weight: 4 },
      { activity: 'radios a contact report in clipped language, then returns to the scope', weight: 2 },
    ],
  },

  garden_keeper: {
    id: 'garden_keeper',
    name: 'Garden Keeper',
    description: "The person who manages Covenant's rooftop garden — a practical miracle of post-Collapse agriculture. Their hands are soil-stained and their attention is divided between the plants and the sky. They take neither for granted.",
    dialogue: "Tomatoes are up two weeks ahead of schedule. Beans are behind. The soil's been good this season — I've been composting kitchen waste for eighteen months and it shows. You want to know what's growing, ask. You want to take something, don't.",
    zone: 'covenant',
    spawnChance: 0.80,
    dispositionRoll: { friendly: 0.40, neutral: 0.45, wary: 0.10, hostile: 0.05 },
    activityPool: [
      { activity: 'is watering the beds with careful economy, checking soil moisture as they go', weight: 3, timeRestrict: ['dawn', 'day'] },
      { activity: 'is pruning with small clippers, working methodically through a row', weight: 2, timeRestrict: ['day'] },
      { activity: 'is checking the condition of the rooftop planting structure at the edges, making notes', weight: 2 },
    ],
  },

  garden_visitor: {
    id: 'garden_visitor',
    name: 'Garden Visitor',
    description: "A Covenant resident who has come up to the rooftop garden for the particular quality of being somewhere green and open. They are sitting near the garden beds not quite looking at the plants, getting something from the proximity.",
    dialogue: "I come up here when it gets too much inside. The walls make the settlement feel small. Up here you can see the sky all the way to the mountains. That used to be normal. Now it's — I don't know what it is now.",
    zone: 'covenant',
    spawnChance: 0.40,
    dispositionRoll: { friendly: 0.40, neutral: 0.45, wary: 0.10, hostile: 0.05 },
    activityPool: [
      { activity: 'sits near the garden beds in the late-day sun, face tipped up, not really looking at anything', weight: 3, timeRestrict: ['dusk'] },
      { activity: 'is walking slowly through the garden rows, touching leaves, reading the plants without taking anything', weight: 2 },
    ],
  },

  granary_storekeeper: {
    id: 'granary_storekeeper',
    name: 'Granary Keeper',
    description: "The person responsible for Covenant's food stores — the most important inventory in the settlement, and they know it. Their record-keeping is meticulous and their access control is absolute. They are polite about it.",
    dialogue: "Authorized access only. If your name's not on the distribution list, the distribution officer is downstairs. I log everything in and everything out. That's the job. That's the whole job.",
    faction: 'accord',
    zone: 'covenant',
    spawnChance: 0.80,
    dispositionRoll: { friendly: 0.15, neutral: 0.70, wary: 0.10, hostile: 0.05 },
    activityPool: [
      { activity: 'is doing a stock count, moving through the stores with a tally board', weight: 3 },
      { activity: 'is logging an incoming supply shipment, checking the manifest against the physical count', weight: 2, timeRestrict: ['day'] },
    ],
  },

  jail_guard: {
    id: 'jail_guard',
    name: 'Jail Guard',
    description: "The guard at the Covenant holding facility. Their shift is long and the prisoners are usually boring and occasionally very much not, and they have calibrated their attention accordingly.",
    dialogue: "Visiting hours aren't formalized, but I need to know who you are before I let you closer than this. Standard protocol.",
    faction: 'accord',
    zone: 'covenant',
    spawnChance: 0.90,
    dispositionRoll: { friendly: 0.10, neutral: 0.70, wary: 0.15, hostile: 0.05 },
    activityPool: [
      { activity: 'stands at the post outside the holding cells, systematically watching the corridor', weight: 4 },
      { activity: 'is doing a routine check — looking in each cell, noting status, moving on', weight: 2 },
    ],
  },

  market_vendor_covenant: {
    id: 'market_vendor_covenant',
    name: 'Market Vendor',
    description: "A Covenant resident running a stall in the settlement market — produce, preserved goods, secondhand equipment. The inventory is modest. The prices are fair in the way prices are fair when the customer base is also your neighbors.",
    dialogue: "Best I've got today is the dried goods — good shelf life, locally sourced. The equipment's from the last salvage exchange. Everything's priced at what I'd want to pay for it. That's the policy.",
    zone: 'covenant',
    spawnChance: 0.70,
    dispositionRoll: { friendly: 0.35, neutral: 0.50, wary: 0.10, hostile: 0.05 },
    activityPool: [
      { activity: 'is arranging their stall inventory with a merchant\'s eye for display', weight: 3, timeRestrict: ['dawn', 'day'] },
      { activity: 'is completing a transaction, counting out the payment with careful precision', weight: 2, timeRestrict: ['day'] },
      { activity: 'is packing up for the evening, covering the stall, securing the inventory', weight: 2, timeRestrict: ['dusk'] },
    ],
  },

  quartermaster_okafor: {
    id: 'quartermaster_okafor',
    name: 'Okafor',
    description: "The Covenant quartermaster — the person who knows exactly how much of everything the settlement has, when it will run out, and what needs to happen before it does. They carry this knowledge visibly. Their posture is a person managing a problem that never stops being a problem.",
    dialogue: "We're running below reserve on medical supplies and we're four weeks out from the next Drifter supply convoy. I've requisitioned from the Reclaimers twice. If you've got salvage to trade — particularly pharmaceutical or medical equipment — I will make it worth your while in settlement credit. That's not a figure of speech.",
    faction: 'accord',
    zone: 'covenant',
    spawnChance: 0.70,
    dispositionRoll: { friendly: 0.20, neutral: 0.60, wary: 0.15, hostile: 0.05 },
    activityPool: [
      { activity: 'is reviewing supply manifests at the depot table, making notations and calculations', weight: 3, timeRestrict: ['day'] },
      { activity: 'is supervising an incoming supply delivery, checking items against the manifest', weight: 2 },
      { activity: 'is at the storage area with a headlamp, doing a physical inventory verification', weight: 2, timeRestrict: ['night'] },
    ],
  },

  teacher_nwosu: {
    id: 'teacher_nwosu',
    name: 'Nwosu',
    description: "Covenant's teacher — the person who runs the settlement's informal school for the children who live here. They carry the particular kind of determination of someone who believes that what they are doing is one of the most important things happening in the settlement, and is not wrong.",
    dialogue: "Eight children in regular attendance. Three more who come when their parents don't need them for work. I teach reading, arithmetic, basic science, history — as much history as I can remember accurately. I've been trying to get writing materials allocated from the stores for six weeks. Cross said it's in the queue. The queue is long.",
    zone: 'covenant',
    spawnChance: 0.65,
    dispositionRoll: { friendly: 0.45, neutral: 0.40, wary: 0.10, hostile: 0.05 },
    activityPool: [
      { activity: 'is leading a small group of children through a reading exercise, patient and encouraging', weight: 3, timeRestrict: ['day'] },
      { activity: 'is preparing lesson materials at a table — writing out exercises by hand, carefully', weight: 2, timeRestrict: ['dawn'] },
      { activity: 'is talking with a child\'s parent after lessons, the exchange warm and practical', weight: 2, timeRestrict: ['dusk'] },
    ],
  },

  // ----------------------------------------------------------
  // SALT CREEK zone NPCs
  // ----------------------------------------------------------

  camp_elder_rosa: {
    id: 'camp_elder_rosa',
    name: 'Elder Rosa',
    description: "The community elder at the Salt Creek settlement — not a Salter, but long-established enough that Briggs works around her. She knows things about the camp's history that predate his command. She distributes this information carefully.",
    dialogue: "Briggs runs the military side. I run everything else, though he'd tell it differently. Before the Salters came through here, this camp had forty people. It has four hundred now. That happened because of decisions I made and decisions I prevented. Sit down if you want the real history.",
    zone: 'salt_creek',
    spawnChance: 0.65,
    dispositionRoll: { friendly: 0.30, neutral: 0.50, wary: 0.15, hostile: 0.05 },
    activityPool: [
      { activity: 'is meeting with a small group of camp residents, the exchange the specific quality of community dispute resolution', weight: 3, timeRestrict: ['day'] },
      { activity: 'sits outside her door in the late afternoon light, available without appearing to be available', weight: 2, timeRestrict: ['dusk'] },
      { activity: 'is reviewing a handwritten community log, making notes', weight: 2 },
    ],
  },

  mechanic_cutter: {
    id: 'mechanic_cutter',
    name: 'Cutter',
    description: "A Salter vehicle mechanic with a name that was clearly earned. Their hands are a record of every repair they've made. They work with the unhurried confidence of someone who can identify a problem by sound.",
    dialogue: "If it runs on fuel or hydraulics and you need it fixed, I'm the person. If it runs on electronics alone, take it to the Reclaimers. I have opinions about electronics. They are mostly unfavorable.",
    faction: 'salters',
    zone: 'salt_creek',
    spawnChance: 0.70,
    dispositionRoll: { friendly: 0.20, neutral: 0.60, wary: 0.15, hostile: 0.05 },
    activityPool: [
      { activity: 'is under a vehicle doing something to it with focused attention and occasional language', weight: 3 },
      { activity: 'is examining a mechanical component, turning it in their hands, diagnosing by look and feel', weight: 2, timeRestrict: ['day'] },
    ],
  },

  mechanic_torque: {
    id: 'mechanic_torque',
    name: 'Torque',
    description: "Cutter's partner in the motor pool. Quieter. Does the detail work that Cutter's hands are too certain for. They have the specific relationship with machinery that comes from having rebuilt things from salvage under pressure.",
    dialogue: "Ask Cutter. I'm busy.",
    faction: 'salters',
    zone: 'salt_creek',
    spawnChance: 0.65,
    dispositionRoll: { friendly: 0.10, neutral: 0.65, wary: 0.20, hostile: 0.05 },
    activityPool: [
      { activity: 'is doing precision repair work on a mechanical component, tools arranged in exact order', weight: 4 },
      { activity: 'is reading a technical schematic, holding it at arm\'s length, referencing something in the vehicle beside them', weight: 2 },
    ],
  },

  medic_marsh: {
    id: 'medic_marsh',
    name: 'Marsh',
    description: "The Salter medic. They operate with the pragmatic efficiency of someone whose supplies are always running low and whose patients always need more than what's available. The triage calculus is visible in their eyes when they look at you.",
    dialogue: "I've got field supplies, not a hospital. If it's life-threatening, I can probably help. If it's quality-of-life, I can offer you advice and limited supplies. What happened?",
    faction: 'salters',
    zone: 'salt_creek',
    spawnChance: 0.70,
    dispositionRoll: { friendly: 0.30, neutral: 0.55, wary: 0.10, hostile: 0.05 },
    activityPool: [
      { activity: 'is inventorying medical supplies with careful attention, noting shortfalls', weight: 3 },
      { activity: 'is treating a minor wound on a soldier who is trying not to show it hurts', weight: 2, timeRestrict: ['day'] },
      { activity: 'is writing up a patient record in a battered field notebook', weight: 2 },
    ],
  },

  salter_inner_gate_sentry: {
    id: 'salter_inner_gate_sentry',
    name: 'Inner Gate Sentry',
    description: "The Salter guard at the inner compound — the checkpoint between the outer camp and the command area. They check credentials more carefully than the outer gate.",
    dialogue: "Inner area is restricted. Authorization from command only. If Briggs wants you in there, he'll tell you himself.",
    faction: 'salters',
    zone: 'salt_creek',
    spawnChance: 0.90,
    dispositionRoll: { friendly: 0.05, neutral: 0.50, wary: 0.35, hostile: 0.10 },
    activityPool: [
      { activity: 'stands at the inner gate post, checking credentials for everyone who approaches', weight: 4 },
      { activity: 'is communicating on radio with the outer perimeter, position check', weight: 2 },
    ],
  },

  salter_mess_cook: {
    id: 'salter_mess_cook',
    name: 'Mess Cook',
    description: "The Salter responsible for feeding the camp — a logistics problem disguised as cooking. They have made something edible out of available materials for long enough that they can identify supply deficits before they happen.",
    dialogue: "Next meal is in two hours. If you're not on the roster, you pay two pennies or you do an hour of prep. Those are the options. Pick one.",
    faction: 'salters',
    zone: 'salt_creek',
    spawnChance: 0.80,
    dispositionRoll: { friendly: 0.25, neutral: 0.60, wary: 0.10, hostile: 0.05 },
    activityPool: [
      { activity: 'is working over the camp kitchen — a large pot, organized supplies, the smell of something hot', weight: 4, timeRestrict: ['dawn', 'day', 'dusk'] },
      { activity: 'is cleaning the kitchen equipment after service with methodical efficiency', weight: 2, timeRestrict: ['night'] },
    ],
  },

  salter_off_duty: {
    id: 'salter_off_duty',
    name: 'Off-Duty Salter',
    description: "A Salter between rotations — not on post, not in the field, occupying the brief interval of not-working. They have the specific quality of a soldier who is resting but has not entirely left the operational mindset.",
    dialogue: "Off rotation till eighteen-hundred. Anything you need, take it to the duty officer.",
    faction: 'salters',
    zone: 'salt_creek',
    spawnChance: 0.65,
    dispositionRoll: { friendly: 0.10, neutral: 0.60, wary: 0.25, hostile: 0.05 },
    activityPool: [
      { activity: 'is sitting with kit laid out around them, cleaning weapons or checking equipment during the rest period', weight: 3 },
      { activity: 'is eating from a tin without ceremony, eyes still doing the sweep', weight: 2 },
      { activity: 'is trying to sleep on a cot, with the specific look of someone who cannot quite fully disengage', weight: 2, timeRestrict: ['night'] },
    ],
  },

  salter_perimeter_guard: {
    id: 'salter_perimeter_guard',
    name: 'Perimeter Guard',
    description: "A Salter walking the outer perimeter of Salt Creek — the wide circuit that keeps the camp's margins clear. They move with the self-contained efficiency of someone who has done this route enough times to do it without thinking.",
    dialogue: "Perimeter's clear. Move along or state your business.",
    faction: 'salters',
    zone: 'salt_creek',
    spawnChance: 0.85,
    dispositionRoll: { friendly: 0.05, neutral: 0.55, wary: 0.30, hostile: 0.10 },
    activityPool: [
      { activity: 'is walking the perimeter circuit, rifle at low ready, sweep methodical', weight: 4 },
      { activity: 'pauses at an elevated point to scan the approach, then continues the circuit', weight: 2 },
    ],
  },

  salter_trainee: {
    id: 'salter_trainee',
    name: 'Salter Trainee',
    description: "A new recruit learning the Salter operation — carrying themselves with the carefully assembled competence of someone who knows they are being assessed. They are being assessed.",
    dialogue: "Still in training. I'm not authorized to make operational decisions. If you need something, talk to the duty sergeant.",
    faction: 'salters',
    zone: 'salt_creek',
    spawnChance: 0.50,
    dispositionRoll: { friendly: 0.15, neutral: 0.60, wary: 0.20, hostile: 0.05 },
    activityPool: [
      { activity: 'is running a training drill under observation — the movements studied and not yet automatic', weight: 3 },
      { activity: 'is listening to a correction from a senior Salter, the posture absorbing feedback without argument', weight: 2 },
    ],
  },

  salter_trainer: {
    id: 'salter_trainer',
    name: 'Salter Trainer',
    description: "A senior Salter running training exercises — correcting technique with a directness that leaves no room for uncertainty. They have seen enough bad field outcomes to have strong opinions about preparation.",
    dialogue: "The reason half these trainees survive their first real encounter is because I won't let them leave training with bad habits. The reason the other half don't is something else. Pay attention to which half you're going to be.",
    faction: 'salters',
    zone: 'salt_creek',
    spawnChance: 0.60,
    dispositionRoll: { friendly: 0.05, neutral: 0.50, wary: 0.35, hostile: 0.10 },
    activityPool: [
      { activity: 'is running trainees through a contact drill, calling corrections with crisp precision', weight: 3, timeRestrict: ['day'] },
      { activity: 'is demonstrating a technique with deliberate, exaggerated clarity for the trainees watching', weight: 2, timeRestrict: ['day'] },
    ],
  },

  shed_guard: {
    id: 'shed_guard',
    name: 'Supply Guard',
    description: "The Salter assigned to watch the supply shed — not the most exciting post, and they know it, and they are doing it with exactly the level of enthusiasm the post warrants.",
    dialogue: "Supply access is logged. Name and authorization, and what you're here for.",
    faction: 'salters',
    zone: 'salt_creek',
    spawnChance: 0.80,
    dispositionRoll: { friendly: 0.05, neutral: 0.65, wary: 0.25, hostile: 0.05 },
    activityPool: [
      { activity: 'stands at the supply shed entrance, watching the area without urgency', weight: 4 },
      { activity: 'is checking a supply log against the inventory inside, cross-referencing', weight: 2 },
    ],
  },

  // ----------------------------------------------------------
  // RIVER ROAD zone NPCs
  // ----------------------------------------------------------

  bridge_keeper_howard: {
    id: 'bridge_keeper_howard',
    name: 'Howard',
    description: "The builder and keeper of the Animas crossing — a weathered engineer who has maintained this bridge through every season since 2032. His knowledge of river crossings in this territory is unmatched. He is waiting for someone. He has been waiting a long time.",
    dialogue: "Built this in '32 with salvaged cable and concrete from the old dam station. It'll hold another ten years if I keep up the maintenance. You want to cross, you follow my protocol. You want to know what's moved through this valley in the last three years, you ask. The river tells me things the roads don't.",
    faction: 'drifters',
    zone: 'river_road',
    spawnChance: 0.90,
    dispositionRoll: { friendly: 0.30, neutral: 0.50, wary: 0.15, hostile: 0.05 },
    activityPool: [
      { activity: 'is checking the cable tension at the bridge anchors, hands running along the steel braid', weight: 3 },
      { activity: 'sits at the bridge entrance with a mug and the patient eye of someone who has seen everything cross this river', weight: 3, timeRestrict: ['day', 'dusk'] },
      { activity: 'stands at the bridge center at night, looking north up the river, the mug cold', weight: 2, timeRestrict: ['night'] },
    ],
  },

  breaks_wanderer_at_rest: {
    id: 'breaks_wanderer_at_rest',
    name: 'Trail Wanderer',
    description: "A Drifter who has been moving through the Breaks for a while, currently resting. They have the specific stillness of someone who has been walking longer than they intended.",
    dialogue: "The canyon route is faster but the walls cut your sight lines down to nothing. I came through the ridge instead. Took two extra hours and I didn't get surprised. Worth it.",
    faction: 'drifters',
    zone: 'the_breaks',
    spawnChance: 0.45,
    dispositionRoll: { friendly: 0.30, neutral: 0.50, wary: 0.15, hostile: 0.05 },
    activityPool: [
      { activity: 'is sitting against a rock with their pack off, taking the weight off their feet', weight: 4 },
      { activity: 'is eating something from their pack with the efficiency of someone who has learned not to waste rest time', weight: 2 },
    ],
  },

  breaks_waypoint_traveler: {
    id: 'breaks_waypoint_traveler',
    name: 'Waypoint Traveler',
    description: "A traveler moving through the Breaks between destinations, pausing at the waypoint for orientation and rest. They have been reading the rock markers and know roughly where they are.",
    dialogue: "These waypoints are Drifter work — they've been maintaining the marker system through the Breaks for three years. Saves lives. You're headed west, you want to stay on the marked route. East of the second canyon is Hollow territory, and there's no good reason to go there.",
    faction: 'drifters',
    zone: 'the_breaks',
    spawnChance: 0.40,
    dispositionRoll: { friendly: 0.35, neutral: 0.50, wary: 0.12, hostile: 0.03 },
    activityPool: [
      { activity: 'is checking a hand-drawn map against the rock markers, orienting', weight: 3, timeRestrict: ['day'] },
      { activity: 'is resting at the waypoint, drinking from a canteen', weight: 2 },
    ],
  },

  departing_scavenger: {
    id: 'departing_scavenger',
    name: 'Departing Scavenger',
    description: "A scavenger heading out from the River Road settlement with an empty pack, moving toward the open territory with the determined practicality of someone who has done this before.",
    dialogue: "Heading out to the old distribution center three klicks east. Been picked over but not clean. If you're going that direction, I'll mark what I've already cleared so you don't waste time on it. Mutual benefit.",
    zone: 'river_road',
    spawnChance: 0.35,
    dispositionRoll: { friendly: 0.30, neutral: 0.50, wary: 0.15, hostile: 0.05 },
    activityPool: [
      { activity: 'is checking their gear before heading out — pack, tools, the specific preparation of someone about to be somewhere difficult', weight: 3, timeRestrict: ['dawn', 'day'] },
      { activity: 'is reviewing a hand-marked map of likely salvage areas', weight: 2 },
    ],
  },

  lone_fisher: {
    id: 'lone_fisher',
    name: 'Fisher',
    description: "A person with a line in the river, sitting on the bank with the calm of someone who has decided that this is the most useful thing they can do right now. They may be right.",
    dialogue: "River's been giving good fish this week. I don't know why the end of the world didn't kill the fish. I'm glad it didn't.",
    zone: 'river_road',
    spawnChance: 0.45,
    dispositionRoll: { friendly: 0.40, neutral: 0.45, wary: 0.10, hostile: 0.05 },
    activityPool: [
      { activity: 'is watching the line in the current with the practiced patience of someone who knows how to wait', weight: 4, timeRestrict: ['day', 'dusk'] },
      { activity: 'is cleaning a catch on the bank, methodical and unhurried', weight: 2, timeRestrict: ['dusk'] },
    ],
  },

  motel_survivor: {
    id: 'motel_survivor',
    name: 'Motel Survivor',
    description: "A person who has been living in or near the old motel site on the river road — one of the fixed survivors who didn't join a faction and didn't leave. They know this stretch of road the way you know your own house.",
    dialogue: "Been here since '31. Watched four different groups come through with plans to establish something permanent. Three of them didn't last a season. The fourth is whatever this is now. I stay because I know the road and the road knows me. That's not nothing.",
    zone: 'river_road',
    spawnChance: 0.55,
    dispositionRoll: { friendly: 0.25, neutral: 0.50, wary: 0.20, hostile: 0.05 },
    activityPool: [
      { activity: 'is doing maintenance on the motel structure — sealing a window, checking a support', weight: 3 },
      { activity: 'sits outside watching the road with the easy vigilance of someone in their own territory', weight: 3, timeRestrict: ['day', 'dusk'] },
    ],
  },

  rest_stop_squatter: {
    id: 'rest_stop_squatter',
    name: 'Road Squatter',
    description: "A person who has set up in the shelter of the rest stop structure — not a settlement, not quite nomadic, the intermediate state of someone who hasn't decided yet. They have made the space practical with the resources they had.",
    dialogue: "I'm not looking for company, but I'm not chasing you off either. If you're moving through, there's water in the barrel and the structure's solid. Leave it how you found it.",
    zone: 'river_road',
    spawnChance: 0.40,
    dispositionRoll: { friendly: 0.20, neutral: 0.50, wary: 0.25, hostile: 0.05 },
    activityPool: [
      { activity: 'is tending their space at the rest stop — organized, minimal, careful', weight: 3 },
      { activity: 'sits watching the road approach with calm attention', weight: 2, timeRestrict: ['day'] },
    ],
  },

  riverside_resident: {
    id: 'riverside_resident',
    name: 'Riverside Resident',
    description: "A person living along the Animas with the specific competence of someone who has made the river their resource base — fishing, water management, flood awareness. They have a relationship with this stretch of river.",
    dialogue: "Water level's been low this month — lower than last year. I've been tracking it. Either the snowpack was light or something upstream changed. If it stays low, the fish move. If the fish move, about six downstream settlements start having problems.",
    zone: 'river_road',
    spawnChance: 0.50,
    dispositionRoll: { friendly: 0.30, neutral: 0.50, wary: 0.15, hostile: 0.05 },
    activityPool: [
      { activity: 'is working at the river\'s edge — water collection, equipment maintenance, the ongoing labor of river living', weight: 3, timeRestrict: ['dawn', 'day'] },
      { activity: 'is observing the water level with the systematic attention of someone tracking a variable', weight: 2 },
    ],
  },

  // ----------------------------------------------------------
  // DUSKHOLLOW zone NPCs
  // ----------------------------------------------------------

  dusk_covenant_patrol: {
    id: 'dusk_covenant_patrol',
    name: 'Dusk Patrol',
    description: "A Covenant of Dusk Sanguine on patrol — managing the settlement's security with the particular competence of something that can see in the dark. Their movement through Duskhollow is unhurried and complete.",
    dialogue: "The perimeter is clear. If you have a reason to be in restricted areas, state it. If you don't, the public areas are well-marked.",
    faction: 'covenant_of_dusk',
    zone: 'duskhollow',
    spawnChance: 0.75,
    dispositionRoll: { friendly: 0.10, neutral: 0.55, wary: 0.30, hostile: 0.05 },
    activityPool: [
      { activity: 'is moving through the settlement on a patrol route, covering ground smoothly and thoroughly', weight: 4, timeRestrict: ['night', 'dusk'] },
      { activity: 'stands at a patrol point, watching the settlement entrance with eyes that are doing more than watching', weight: 3 },
    ],
  },

  duskhollow_cook: {
    id: 'duskhollow_cook',
    name: 'Settlement Cook',
    description: "The person who manages food for the human residents of Duskhollow — a complicated task given that a significant portion of the settlement doesn't eat food in the conventional sense. They have adapted the communal kitchen accordingly.",
    dialogue: "The arrangement here is unusual by most standards, but the kitchen still runs the same way. People need to eat. I feed people. The other residents have their own arrangements and I don't ask about them.",
    zone: 'duskhollow',
    spawnChance: 0.75,
    dispositionRoll: { friendly: 0.35, neutral: 0.50, wary: 0.10, hostile: 0.05 },
    activityPool: [
      { activity: 'is preparing food for the human residents, working in the organized way of someone managing limited resources', weight: 3, timeRestrict: ['dawn', 'day', 'dusk'] },
      { activity: 'is cleaning the kitchen after service, the space returning to order', weight: 2, timeRestrict: ['night'] },
    ],
  },

  tithe_human_resident: {
    id: 'tithe_human_resident',
    name: 'Tithe Resident',
    description: "A human resident of Duskhollow living under the blood tithe arrangement — the formal agreement between the Covenant of Dusk's Sanguine and the settlement's human population. They have the specific quality of people who have made peace with something complicated. The peace is real. The complication is also real.",
    dialogue: "It's not what you think, and it's also exactly what you think. I give blood twice a month. In return: protection, stable food supply, medical care, security I couldn't get anywhere else. The Accord wouldn't take me. I had nowhere else to go. And — honestly? Vesper is fair. She's the fairest authority I've lived under. That shouldn't be the metric, but it's the one I have.",
    zone: 'duskhollow',
    spawnChance: 0.60,
    dispositionRoll: { friendly: 0.30, neutral: 0.50, wary: 0.15, hostile: 0.05 },
    activityPool: [
      { activity: 'is going about their daily work with the practiced normalcy of someone who has incorporated the unusual into the routine', weight: 3 },
      { activity: 'is talking quietly with another human resident — the exchange candid in the way conversations are when the speakers have shared a particular situation', weight: 2 },
      { activity: 'sits alone in the evening light with the contemplative quality of someone reviewing their choices', weight: 2, timeRestrict: ['dusk'] },
    ],
  },

  // ----------------------------------------------------------
  // THE EMBER / KINDLING zone NPCs
  // ----------------------------------------------------------

  chapel_visitor: {
    id: 'chapel_visitor',
    name: 'Chapel Visitor',
    description: "Someone at the Kindling chapel who has not yet joined the Kindling — visiting, considering, drawn to something in the community that they haven't fully named yet. They sit near the edge of the service, not quite in.",
    dialogue: "I'm not a member. I'm — listening. Harrow says things that are either exactly right or exactly wrong and I haven't decided which. The community's real, though. Whatever you think of the theology, they're taking care of each other. That's real.",
    zone: 'the_ember',
    spawnChance: 0.45,
    dispositionRoll: { friendly: 0.35, neutral: 0.45, wary: 0.15, hostile: 0.05 },
    activityPool: [
      { activity: 'sits near the back of the chapel, listening to whatever\'s happening, not quite participating', weight: 3 },
      { activity: 'is having a quiet conversation with a Kindling member, the body language genuinely curious', weight: 2 },
    ],
  },

  kindling_gatekeeper: {
    id: 'kindling_gatekeeper',
    name: 'Kindling Gatekeeper',
    description: "The Kindling member who manages access to the settlement's inner areas — not hostile, but careful. The Kindling's inner spaces are for members and invited guests. The gatekeeper enforces this with spiritual certainty.",
    dialogue: "The inner sanctum is for those who've completed the first rite of preparation. If you're interested in learning more about the Kindling, I can connect you with Harrow or one of the senior faithful. If you're just passing through, the common areas are open.",
    faction: 'kindling',
    zone: 'the_ember',
    spawnChance: 0.80,
    dispositionRoll: { friendly: 0.20, neutral: 0.50, wary: 0.25, hostile: 0.05 },
    activityPool: [
      { activity: 'stands at the inner gate with the calm certainty of someone who has a clear sense of who belongs', weight: 4 },
      { activity: 'is in quiet prayer at the gate, still present and aware of approach', weight: 2, timeRestrict: ['dawn', 'dusk'] },
    ],
  },

  kindling_resident_faithful: {
    id: 'kindling_resident_faithful',
    name: 'Kindling Faithful',
    description: "A full Kindling member going about the community's daily work with the settled quality of someone who has found their place and their purpose. The certainty is comfortable on them. They were looking for it a long time before they found it.",
    dialogue: "The fire doesn't discriminate. CHARON-7 takes everyone equally — it's what you carry into the transformation that determines the outcome. Harrow says we can choose what we become. I don't know if that's true. I know I'm still myself, and that matters.",
    faction: 'kindling',
    zone: 'the_ember',
    spawnChance: 0.75,
    dispositionRoll: { friendly: 0.30, neutral: 0.45, wary: 0.20, hostile: 0.05 },
    activityPool: [
      { activity: 'is doing community work — maintenance, food preparation, the shared labor of the settlement', weight: 3 },
      { activity: 'is in informal conversation with other community members, the exchange easy and familiar', weight: 2 },
      { activity: 'is at the chapel fire, tending it, the attention genuinely devotional', weight: 2, timeRestrict: ['dusk'] },
    ],
  },

  kindling_torch_tender: {
    id: 'kindling_torch_tender',
    name: 'Torch Tender',
    description: "The Kindling member responsible for the settlement's ceremonial fires — keeping them lit, managing fuel, understanding the fire's behavior. They approach the work as sacred and practical simultaneously, which it is.",
    dialogue: "This fire has burned continuously for nine months. That's intentional. Harrow says the continuity matters — that the fire is a witness to what we're building. I believe that. I also manage the fuel supply very carefully so it doesn't go out by accident.",
    faction: 'kindling',
    zone: 'the_ember',
    spawnChance: 0.65,
    dispositionRoll: { friendly: 0.25, neutral: 0.50, wary: 0.20, hostile: 0.05 },
    activityPool: [
      { activity: 'is tending the central fire with careful, specific attention — adjusting, feeding, reading the burn', weight: 4 },
      { activity: 'is inventorying fuel supplies, planning the next resupply', weight: 2, timeRestrict: ['day'] },
    ],
  },

  kindling_treatment_aide: {
    id: 'kindling_treatment_aide',
    name: 'Treatment Aide',
    description: "A Kindling member who assists with the community's 'purification' ceremonies — the ritual exposures that Harrow teaches as preparation for CHARON-7. The aide believes in this. They have seen it work. They have also seen it not work, and they have constructed a theology around the difference.",
    dialogue: "I assist with the preparation rites. Harrow leads them — I manage the practical aspects. The rite is real exposure to low-grade viral agents, voluntarily undertaken, with community support. Most people go through it and come out the other side. Some don't. Harrow calls those the ones who weren't ready. I call them my colleagues. I've stopped arguing about the terminology.",
    faction: 'kindling',
    zone: 'the_ember',
    spawnChance: 0.60,
    dispositionRoll: { friendly: 0.25, neutral: 0.50, wary: 0.20, hostile: 0.05 },
    activityPool: [
      { activity: 'is preparing materials for a ceremony — careful, systematic, the work of someone who takes the ritual seriously', weight: 3 },
      { activity: 'is sitting with a community member in a conversation that looks like support rather than instruction', weight: 2 },
    ],
  },

  // ----------------------------------------------------------
  // THE SCAR zone additional NPCs
  // ----------------------------------------------------------

  sparks_radio_repair: {
    id: 'sparks_radio_repair',
    name: 'Sparks',
    description: "Sparks, here at what passes for a signal repeater station, in their element and several hours past when they were supposed to be elsewhere. The equipment around them has been modified in ways that would alarm most engineers and delight the specific kind of engineer Sparks is.",
    dialogue: "I'm triangulating the signal. The second relay went down four days ago and I've been rebuilding it from components. If this works — when this works — I'll have the source location to within two hundred meters. I know it's the Scar. I knew it was the Scar two years ago. I need the grid coordinates to hand to anyone who'll go.",
    faction: 'drifters',
    zone: 'the_scar',
    spawnChance: 0.60,
    dispositionRoll: { friendly: 0.40, neutral: 0.45, wary: 0.12, hostile: 0.03 },
    activityPool: [
      { activity: 'is making precision adjustments to the relay equipment with a frequency scanner in hand', weight: 3, timeRestrict: ['day'] },
      { activity: 'is running signal diagnostics, watching a needle on a salvaged meter with complete attention', weight: 3 },
      { activity: 'is filling pages of a signal log with numbers, the handwriting fast and getting faster', weight: 2, timeRestrict: ['night'] },
    ],
  },

  // ----------------------------------------------------------
  // CROSS-ZONE / GENERIC NPCs
  // ----------------------------------------------------------

  food_vendor_marta: {
    id: 'food_vendor_marta',
    name: 'Marta',
    description: "A broad-shouldered woman in a working apron who has been feeding people at this crossroads since before most of her customers arrived. She uses the food stall as an information exchange. She uses the information to take care of more people. This is her entire plan.",
    dialogue: "Eat. Whatever else is happening, eat first. You think better. Everything else — the decisions, the routes, what you do next — wait until you've eaten. I've been watching people make bad decisions on empty stomachs since 2031 and I have opinions about it.",
    faction: 'drifters',
    zone: 'crossroads',
    spawnChance: 0.85,
    dispositionRoll: { friendly: 0.55, neutral: 0.35, wary: 0.08, hostile: 0.02 },
    activityPool: [
      { activity: 'is serving hot food from the stall with the practiced efficiency of someone who has done this ten thousand times', weight: 4, timeRestrict: ['dawn', 'day', 'dusk'] },
      { activity: 'is listening to someone tell their story while working, her attention genuine', weight: 2 },
    ],
  },

  lucid_sanguine_osei: {
    id: 'lucid_sanguine_osei',
    name: 'Dr. Osei',
    description: "Dr. Ama Osei in a research context — focused, working, surrounded by the tools of a virologist who is racing something they can feel in their own biology. The urgency is controlled. The science is meticulous. The awareness that they are both researcher and subject is present in everything they do.",
    dialogue: "The Lucid faction is not an organization in the formal sense. It's a choice, made individually, by Sanguine who have decided not to let the biology decide their ethics for them. I am here because I have the skills and because the alternative — the Red Court's approach — is not something I'm willing to become. Ask your questions. I will answer them accurately.",
    faction: 'lucid',
    zone: 'the_breaks',
    spawnChance: 0.50,
    dispositionRoll: { friendly: 0.30, neutral: 0.50, wary: 0.15, hostile: 0.05 },
    activityPool: [
      { activity: 'is conducting a research protocol at the lab bench, the steps methodical and documented', weight: 3 },
      { activity: 'is reviewing data against a reference set, making annotations', weight: 2 },
      { activity: 'sits still with her hands folded, managing something the stillness doesn\'t hide', weight: 2, timeRestrict: ['night'] },
    ],
  },

  map_seller_reno: {
    id: 'map_seller_reno',
    name: 'Reno',
    description: "A Drifter map trader who specializes in the zones most people want to avoid knowing the details of — The Scar, The Deep, the contested border territories. The specialty is either brave or specific to a personal history they haven't shared.",
    dialogue: "I've got current route data on the Scar approaches — as current as anyone has, which is three weeks. I've got the Deep access points mapped to level two. Anything past that, I don't sell because I don't have it and anyone who says they do is guessing. Reno doesn't guess. Reno maps.",
    faction: 'drifters',
    zone: 'crossroads',
    spawnChance: 0.55,
    dispositionRoll: { friendly: 0.20, neutral: 0.60, wary: 0.15, hostile: 0.05 },
    activityPool: [
      { activity: 'is updating their most recent map acquisition, comparing it against an older version for changes', weight: 3, timeRestrict: ['day'] },
      { activity: 'is negotiating a route information trade with a traveler, the exchange professional', weight: 2 },
    ],
  },

  mysterious_stranger_sanguine: {
    id: 'mysterious_stranger_sanguine',
    name: 'Stranger',
    description: "Someone at the settlement edge who reads wrong in a way you can't immediately identify. The eyes are the giveaway if you look for the right thing — the photosensitivity, the way they track movement. Sanguine, but controlled, on a timeline you can't read.",
    dialogue: "I'm passing through. I have papers. I'm not here to cause problems. Whether you believe that is your decision. I've found that the people who don't believe it make worse outcomes for themselves.",
    zone: 'crossroads',
    spawnChance: 0.20,
    dispositionRoll: { friendly: 0.05, neutral: 0.45, wary: 0.35, hostile: 0.15 },
    activityPool: [
      { activity: 'is sitting at the settlement edge with the carefully managed presence of something trying not to be noticed', weight: 3, timeRestrict: ['dusk', 'night'] },
      { activity: 'is watching the settlement from a position that covers the main exits', weight: 2 },
    ],
  },

  narrows_ambusher: {
    id: 'narrows_ambusher',
    name: 'Ambusher',
    description: "Someone in the narrows who was waiting. They didn't expect you specifically — they expected anyone. Their position was chosen with care. The weapon is ready. The calculation in their eyes is economic: is this worth the risk? They're still deciding.",
    dialogue: "Drop the pack and walk away. I don't want trouble. I want the pack.",
    zone: 'river_road',
    spawnChance: 0.20,
    dispositionRoll: { friendly: 0.00, neutral: 0.10, wary: 0.30, hostile: 0.60 },
    activityPool: [
      { activity: 'steps out of cover with a weapon visible and a posture that has done this before', weight: 4 },
      { activity: 'is positioned in the shadows, watching the approach, not yet committed', weight: 3, timeRestrict: ['night'] },
    ],
  },

  pit_bookie: {
    id: 'pit_bookie',
    name: 'Pit Bookie',
    description: "The person managing the betting at the Salt Creek fighting pit — a role that requires comfort with risk, mathematics, and the specific ethics of organized violence as entertainment. They are comfortable with all three.",
    dialogue: "Current odds on tonight's bout are two to one on the fighter with reach advantage. If you've got something to wager, now's the time — I stop taking bets when the fighters enter. What do you want to put on it?",
    zone: 'salt_creek',
    spawnChance: 0.65,
    dispositionRoll: { friendly: 0.25, neutral: 0.55, wary: 0.15, hostile: 0.05 },
    activityPool: [
      { activity: 'is managing the betting ledger, recording wagers with precise shorthand', weight: 3, timeRestrict: ['dusk', 'night'] },
      { activity: 'is talking to prospective bettors, presenting odds with practiced ease', weight: 2, timeRestrict: ['dusk'] },
    ],
  },

  pit_fighter: {
    id: 'pit_fighter',
    name: 'Pit Fighter',
    description: "A Salt Creek pit fighter between bouts — wrapping hands, managing bruises, the post-fight maintenance. The body language is the specific competence of someone who fights in a controlled environment and has calibrated exactly how much they can take.",
    dialogue: "I fight because it pays and because I'm good at it. The crowd comes for blood. I try not to give them too much. There's a difference between a fight and a spectacle and I know which one keeps people coming back.",
    zone: 'salt_creek',
    spawnChance: 0.50,
    dispositionRoll: { friendly: 0.15, neutral: 0.55, wary: 0.25, hostile: 0.05 },
    activityPool: [
      { activity: 'is doing post-fight care — wrapping, icing, the systematic recovery process', weight: 3, timeRestrict: ['night'] },
      { activity: 'is warming up near the pit with controlled, deliberate movement', weight: 2, timeRestrict: ['dusk'] },
    ],
  },

  pit_fighter_active: {
    id: 'pit_fighter_active',
    name: 'Active Fighter',
    description: "A pit fighter currently in the center of things — focused, moving, the particular presence of someone who is using their full attention on a physical problem. They don't register you as anything relevant to what they're doing.",
    dialogue: "Not now.",
    zone: 'salt_creek',
    spawnChance: 0.40,
    dispositionRoll: { friendly: 0.05, neutral: 0.50, wary: 0.35, hostile: 0.10 },
    activityPool: [
      { activity: 'is in the middle of a training bout, the exchange controlled and technical', weight: 4 },
      { activity: 'is focused entirely on their opponent, not registering the surrounding crowd', weight: 3 },
    ],
  },

  reclaimer_craftsperson: {
    id: 'reclaimer_craftsperson',
    name: 'Reclaimer Crafter',
    description: "A Reclaimer who works at the intersection of salvage and fabrication — taking things apart to understand them, putting them together in new configurations. The workspace has the specific aesthetic of controlled proliferation.",
    dialogue: "Everything in this workspace has a purpose and a place. The place isn't always where you'd expect it. What do you need — assessment, fabrication, or component trade?",
    faction: 'reclaimers',
    zone: 'the_stacks',
    spawnChance: 0.70,
    dispositionRoll: { friendly: 0.25, neutral: 0.60, wary: 0.10, hostile: 0.05 },
    activityPool: [
      { activity: 'is fabricating something from salvaged components, the work focused and skilled', weight: 3 },
      { activity: 'is consulting a technical schematic while working, the reference well-used', weight: 2, timeRestrict: ['day'] },
    ],
  },

  reclaimer_signal_tech: {
    id: 'reclaimer_signal_tech',
    name: 'Signal Technician',
    description: "A Reclaimer specialist in communications and signal analysis — one of the people who has been tracking the MERIDIAN broadcast and filing reports that senior Reclaimers officially ignore and privately read carefully.",
    dialogue: "The signal from the Scar has been consistent for seven years. Seven years of the same source, same power draw, same broadcast pattern. That's not a recording. That's a person with a continuous power source and a reason to keep broadcasting. We have seventeen meters of decoded content. Lev has the full file. I have the technical breakdown. What do you want to know?",
    faction: 'reclaimers',
    zone: 'the_stacks',
    spawnChance: 0.60,
    dispositionRoll: { friendly: 0.30, neutral: 0.55, wary: 0.10, hostile: 0.05 },
    activityPool: [
      { activity: 'is running signal analysis on a receiver, comparing traces against a reference set', weight: 3 },
      { activity: 'is updating the MERIDIAN signal log with fresh data, the annotations thorough', weight: 2, timeRestrict: ['day'] },
    ],
  },

  scavenger_rival: {
    id: 'scavenger_rival',
    name: 'Rival Scavenger',
    description: "A scavenger who was at this location before you and is not thrilled about the company. The territorial response is instinctive and then immediately managed into something more calculated. They're assessing whether to compete or cooperate.",
    dialogue: "I got here first, which means I have priority on the accessible salvage. I'm willing to trade information about what I've cleared if you'll move to the east section. Deal or no deal — I don't have time to negotiate for long.",
    zone: 'river_road',
    spawnChance: 0.30,
    dispositionRoll: { friendly: 0.10, neutral: 0.35, wary: 0.40, hostile: 0.15 },
    activityPool: [
      { activity: 'is working through a salvage site methodically, not looking up but aware of your position', weight: 3 },
      { activity: 'is assessing you and then returning to the salvage with a decision made', weight: 2 },
    ],
  },

  drifter_cart_team: {
    id: 'drifter_cart_team',
    name: 'Cart Team',
    description: "A Drifter trade caravan — two people with a loaded hand cart, moving through the road network on a route. They are focused on not losing cargo and making their next destination before dark.",
    dialogue: "Headed to the creek crossing — three hours if the road's clear. You're going that direction, we can travel together. Four sets of eyes is better than two.",
    faction: 'drifters',
    zone: 'river_road',
    spawnChance: 0.40,
    dispositionRoll: { friendly: 0.35, neutral: 0.50, wary: 0.12, hostile: 0.03 },
    activityPool: [
      { activity: 'is moving through the area with a loaded cart, making steady time', weight: 3, timeRestrict: ['dawn', 'day'] },
      { activity: 'has stopped to check the cart\'s load — adjusting, securing, verifying', weight: 2 },
    ],
  },

  water_attendant: {
    id: 'water_attendant',
    name: 'Water Attendant',
    description: "The person managing the settlement's water distribution — a role that carries more authority than it sounds because water is what settlements run on. The distribution protocol is strict and the attendant enforces it with the quiet authority of someone holding something essential.",
    dialogue: "Two liters per person per day, clean. You want to fill a container, I'll note it in the log. Anything above the personal ration requires authorization from the quartermaster or the duty officer. The protocol exists because the last time it didn't exist, we ran short in July and people made bad decisions. I don't let it get to that.",
    zone: 'covenant',
    spawnChance: 0.80,
    dispositionRoll: { friendly: 0.20, neutral: 0.65, wary: 0.10, hostile: 0.05 },
    activityPool: [
      { activity: 'is managing water distribution from the central station, working through a queue of residents', weight: 3, timeRestrict: ['dawn', 'day'] },
      { activity: 'is logging consumption against the daily allocation, checking the numbers', weight: 2 },
      { activity: 'is checking the filtration system, examining the output, maintaining the equipment', weight: 2, timeRestrict: ['dusk'] },
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
