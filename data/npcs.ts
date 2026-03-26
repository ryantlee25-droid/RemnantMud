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
  // old_mae — shelter elder. Cautious, experienced, not kind.
  // ----------------------------------------------------------

  old_mae: {
    id: 'old_mae',
    name: 'Old Mae',
    description:
      'An elderly woman crouched near a small fire, feeding it broken furniture one piece at a time. She does not look up when you enter. She already heard you on the stairs. She has been listening for footsteps since 2031.',
    dialogue:
      "The herds move north through the flats in July. Hundreds of them. You don't want to be out there when they come through. They don't hunt — they just move — but you get in the way of something that size moving in numbers, it doesn't matter that it isn't hunting you.",
    zone: 'shelter',
    spawnChance: 0.75,
    dispositionRoll: { friendly: 0.10, neutral: 0.40, wary: 0.40, hostile: 0.10 },
    activityPool: [
      {
        activity: 'is sorting dried beans into small cloth pouches, lips moving as she counts',
        weight: 3,
      },
      {
        activity: 'sits in the doorway with a hunting rifle across her knees, watching the road through the gap in the barricade',
        weight: 2,
        timeRestrict: ['dusk', 'night'],
      },
      {
        activity: 'is asleep in her chair, chin resting on her chest, a water-stained field guide open and face-down in her lap',
        weight: 1,
        timeRestrict: ['dawn'],
      },
      {
        activity: 'is slowly sharpening a kitchen knife with a whetstone, the rhythm unhurried and deliberate — the rhythm of someone who has done this ten thousand times',
        weight: 2,
      },
      {
        activity: 'is writing something in a composition notebook with a stub of pencil, shielding the page with her forearm so you cannot read it',
        weight: 2,
        timeRestrict: ['day', 'dusk'],
      },
      {
        activity: 'is boiling rags in a tin pot over the fire, wringing them out one at a time and hanging them on a cord she has strung across the corner',
        weight: 1,
      },
    ],
  },

  // ----------------------------------------------------------
  // patch — ruins medic. Clinical, transactional, curious.
  // ----------------------------------------------------------

  patch: {
    id: 'patch',
    name: 'Patch',
    description:
      'A person of indeterminate age and origin behind a folding table covered in medical supplies, each item in its precise place. Their hands are always moving — sorting, checking, resetting. They look at wounds the way other people look at locks. They are already figuring out how to open you.',
    dialogue:
      "I'll close that up. But I want to know what's north of the salt creek crossing, because my last three patients came from that direction and I've been piecing together what they saw before they stopped being able to describe it. You talk, I work. We both leave better off.",
    zone: 'ruins',
    spawnChance: 0.70,
    dispositionRoll: { friendly: 0.20, neutral: 0.55, wary: 0.20, hostile: 0.05 },
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

  // ----------------------------------------------------------
  // marshal_cross — wastes authority. Exhausted, pragmatic.
  // ----------------------------------------------------------

  marshal_cross: {
    id: 'marshal_cross',
    name: 'Marshal Cross',
    description:
      "A woman in her fifties in a sheriff's jacket that has been repaired so many times it is more repair than original. She stands the way people stand when they have not sat down voluntarily in years. The weight of 800 people is not metaphor. You can see it in her shoulders.",
    dialogue:
      "I don't have capacity for mercy right now. I have capacity for decisions. You want to trade, work, or move through — I can do that. You want sanctuary, you'll need to earn it. You want trouble, I'll spend the resources to end it because I cannot afford the alternative. What is it you actually need?",
    zone: 'wastes',
    spawnChance: 0.65,
    dispositionRoll: { friendly: 0.05, neutral: 0.45, wary: 0.40, hostile: 0.10 },
    activityPool: [
      {
        activity: "is studying a hand-drawn territory map pinned to a board, tracing routes with her finger and making small marks with a grease pencil",
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

  // ----------------------------------------------------------
  // deacon_harrow — outpost ideologue. Unsettling, certain.
  // ----------------------------------------------------------

  deacon_harrow: {
    id: 'deacon_harrow',
    name: 'Deacon Harrow',
    description:
      'A tall man in a coat that was once a coat and is now something more deliberate, its collar scorched in a pattern that might be intentional. He holds eye contact slightly too long. Not threatening. Evaluating. The way a fire evaluates what it might be asked to consume.',
    dialogue:
      "The Hollow aren't cursed. They're converted. CHARON-7 is a gospel written in protein — it rewrites what you are at the level of what you're made of. The question isn't whether you believe in it. The question is whether it believes in you. The Kindling exists to ensure that when the fire comes, we are the ones who burn bright and not the ones who just burn.",
    zone: 'outpost',
    spawnChance: 0.60,
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

  // ----------------------------------------------------------
  // the_wren — underground operative. Patient, dangerous.
  // ----------------------------------------------------------

  the_wren: {
    id: 'the_wren',
    name: 'The Wren',
    description:
      'A lean man in clothes chosen for silence — no buckles, no loose fabric, nothing that catches light or makes sound. He is standing in a part of the room you did not check when you entered, and he has been there the whole time. His eyes are the pale, adapted gray of someone who has spent years in low light. He watches you with the patience of something that has already decided and is simply waiting for the moment.',
    dialogue:
      "I used to find missing people. Now I find people who don't want to be found, which is a different skill set. The Red Court pays well and asks few questions, and I have stopped asking the questions it doesn't want answered. If you've seen a Sanguine enforcer in the lower drifts — not feral, controlled — you should tell me before you tell anyone else. For your own continuity.",
    zone: 'underground',
    spawnChance: 0.55,
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
        activity: 'is eating without looking at the food — dried meat, taken in small pieces — his attention entirely on the middle distance where the tunnel curves out of sight',
        weight: 1,
      },
    ],
  },

  // ----------------------------------------------------------
  // ARC CHARACTER — Wren Calloway
  // Former Accord medic, deserter. Encountered across 4 zones.
  // Each version is a distinct NPC entry reflecting her
  // deteriorating circumstances and eventual resolution.
  //
  // Note on recognition: the `description` fields for
  // wren_ruins onward contain a parenthetical flag comment
  // (// [RECOGNITION: wren_shelter]) marking where the engine
  // should substitute a "she recognizes you" line if the
  // player's visited-NPC log contains the earlier encounter id.
  // ----------------------------------------------------------

  // ----------------------------------------------------------
  // wren_shelter — first encounter. Guarded, freshly wounded.
  // ----------------------------------------------------------

  wren_shelter: {
    id: 'wren_shelter',
    name: 'Wren Calloway',
    description:
      'A woman in her mid-thirties sitting on an overturned supply crate with her back against the wall and both exits in her sightline. She is wearing an Accord medic patch that has been cut off a jacket and then sewn back on a different jacket — the thread is new, the patch is old. Her left forearm is wrapped in bandaging that is not quite professional enough to be self-applied by someone who does not know what they are doing. She does not stand when you enter. She watches you the way people watch things they have not yet decided about.',
    dialogue:
      "Did you come from the road? Not through the flats — the road. I need to know if there was traffic behind you. I'm not going to explain why. You can decide whether that's enough to answer the question.",
    zone: 'shelter',
    spawnChance: 0.85,
    dispositionRoll: { friendly: 0.00, neutral: 0.15, wary: 0.70, hostile: 0.15 },
    activityPool: [
      {
        activity: 'is re-wrapping the bandaging on her left forearm, jaw set, not looking at what her hands are doing',
        weight: 3,
      },
      {
        activity: 'sits with her arms folded across her chest and her eyes on the entrance, not moving, not sleeping — just watching',
        weight: 3,
        timeRestrict: ['dusk', 'night'],
      },
      {
        activity: 'is going through a medical kit with quick, practiced movements, taking inventory of what is left and replacing each item with a precision that looks like habit',
        weight: 2,
        timeRestrict: ['day'],
      },
      {
        activity: 'is eating something from a ration packet without tasting it, staring at the far wall',
        weight: 1,
      },
      {
        activity: "is pressing two fingers against the bandage on her arm, checking something — pressure, temperature, sensation — then letting her hand drop with the flat expression of someone receiving news they already expected",
        weight: 2,
      },
    ],
  },

  // ----------------------------------------------------------
  // wren_ruins — second encounter. Sleepless, overloaded.
  // ----------------------------------------------------------

  wren_ruins: {
    id: 'wren_ruins',
    name: 'Wren Calloway',
    // [RECOGNITION: wren_shelter] — if player has met wren_shelter,
    // prepend: "You've seen this woman before."
    description:
      "A woman moving through the rubble with a pack that is too heavy for the pace she's trying to keep. She is carrying a field medic bag, a canvas roll of instruments, and something wrapped in a vehicle tarp strapped across the top of the pack — the shape of it is not quite right, not quite anything you can name. Her eyes have the flat, scraped look of someone who has not slept in a day and a half. When something shifts in the debris to your left, she spins and has a scalpel in her hand before the sound finishes. Then she sees you. The scalpel does not immediately go away.",
    dialogue:
      "I'm not stopping here. I just needed to get out of the open for ten minutes and this is what ten minutes looks like right now. If you're heading south, don't. If you know a way through that isn't the main corridor, I'll pay for it in medical work — clean stitches, whatever you need, I'm fast. But I'm not stopping.",
    zone: 'ruins',
    spawnChance: 0.85,
    dispositionRoll: { friendly: 0.00, neutral: 0.25, wary: 0.60, hostile: 0.15 },
    activityPool: [
      {
        activity: 'is digging through her pack with mounting urgency, pulling items out and setting them aside, looking for something she cannot find — then stopping, hands flat on the floor, breathing through her nose until the urgency passes',
        weight: 3,
      },
      {
        activity: 'is sitting against the wall with her knees drawn up, eyes open but not focused, doing the arithmetic of distance and time against something you cannot see',
        weight: 2,
        timeRestrict: ['night'],
      },
      {
        activity: 'knocks over a piece of debris when she turns too fast, and the clatter makes her press against the wall with her hand over her mouth — a full three seconds before she breathes out and starts moving again',
        weight: 2,
      },
      {
        activity: 'is retaping a series of small vials to the inside of her forearm with surgical tape, covering each one with her sleeve when done',
        weight: 2,
        timeRestrict: ['dawn', 'day'],
      },
      {
        activity: 'stands at a gap in the wall watching the street below with the blank, sustained attention of someone who has been watching it for a long time and seen nothing and is not reassured by that',
        weight: 2,
        timeRestrict: ['dusk', 'night'],
      },
    ],
  },

  // ----------------------------------------------------------
  // wren_wastes — third encounter. Injured. Cornered by distance.
  // ----------------------------------------------------------

  wren_wastes: {
    id: 'wren_wastes',
    name: 'Wren Calloway',
    // [RECOGNITION: wren_shelter, wren_ruins] — if player has met
    // either prior version, prepend: "You know this woman."
    description:
      "A woman sitting against a drainage culvert in the thin strip of shade it casts, one leg extended, the other drawn up. The pack is gone — or most of it. She has the medic bag and one other thing, the tarp-wrapped shape now held across her lap with both hands. Her right leg, below the knee, has been splinted with two lengths of highway signage and torn cloth. The splinting is good. Whoever did it knew what they were doing. She did it herself. She watches you approach with eyes that are clear and tired and not afraid of you. Whatever she is afraid of is not here. Not yet.",
    dialogue:
      "I can't outrun it anymore. I already knew that before the leg. I need three days — two, maybe, if I can get the swelling down. There's a place underground I know about, old mining infrastructure, the Accord surveyed it in '29 and decided it wasn't worth the trouble. It is worth the trouble. I just need to get there. I'm telling you this because I need someone to know where I'm going. Not to follow. Just to know.",
    zone: 'wastes',
    spawnChance: 0.85,
    dispositionRoll: { friendly: 0.10, neutral: 0.50, wary: 0.35, hostile: 0.05 },
    activityPool: [
      {
        activity: 'is adjusting the splint on her lower leg with careful, unhurried hands — the face of someone doing pain management through procedure',
        weight: 3,
      },
      {
        activity: "is scanning the horizon to the north with the kind of focused, repetitive look that means she's not sightseeing",
        weight: 3,
        timeRestrict: ['day', 'dusk'],
      },
      {
        activity: 'is injecting something into her thigh from one of the vials taped to her arm, pressing a thumb over the puncture and counting silently to ten before she removes it',
        weight: 2,
      },
      {
        activity: 'has the tarp-wrapped object in her lap and both hands over it, the way you hold something you are not ready to put down',
        weight: 2,
        timeRestrict: ['dusk', 'night'],
      },
      {
        activity: 'is eating and drinking mechanically, looking at nothing, fueling the body on schedule because the alternative is dying of something preventable',
        weight: 1,
        timeRestrict: ['dawn', 'day'],
      },
    ],
  },

  // ----------------------------------------------------------
  // wren_underground — final encounter. The choice is made.
  // ----------------------------------------------------------

  wren_underground: {
    id: 'wren_underground',
    name: 'Wren Calloway',
    // [RECOGNITION: wren_shelter, wren_ruins, wren_wastes] —
    // if player has met any prior version, the description
    // already implies recognition; no prepend needed.
    description:
      "She is in the refuge station at the deep level, the emergency lights painting everything red. The splint is off. She is standing without difficulty, which means the leg is not why she stopped. The tarp-wrapped object is on the workbench and the tarp is open and you can see what it is: a portable CHARON-7 containment cylinder, Accord-issue, the kind used for sample preservation during the early outbreak surveys. The kind that requires an Accord medical clearance to carry. The kind that requires an Accord reason to still have. She looks at you the way a person looks at someone they have been partly expecting. There is a decision in her face that was made before you arrived. She has had time down here. She used it.",
    dialogue:
      "I found a live sample. Controlled variant — the Accord called it CHARON-7 Theta before they buried the designation. It doesn't convert. It competes. Introduced into a Hollow, it arrests the conversion process and then it just — stops. Not a cure. A ceasefire. They knew. They had this in 2031 and they made a decision about it that I was not supposed to find out about. I deserted because of what I saw. I came here because this is the only place I know of with the cold storage still running. I'm going to leave it here. Not give it to anyone — leave it here. For whoever comes after us and has the wits to use it right. You can tell people about this place. Or you can not. I've made my peace with both.",
    zone: 'underground',
    spawnChance: 0.85,
    dispositionRoll: { friendly: 0.40, neutral: 0.45, wary: 0.15, hostile: 0.00 },
    activityPool: [
      {
        activity: 'is carefully calibrating the temperature controls on the cold storage unit, making minute adjustments with a flathead screwdriver and checking a handwritten chart after each one',
        weight: 3,
      },
      {
        activity: 'is writing in a small notebook, fast and without stopping — not notes, the pace says. Something closer to testimony.',
        weight: 3,
        timeRestrict: ['night'],
      },
      {
        activity: 'is seated on the refuge station bench with the containment cylinder on the table in front of her, not touching it, just looking at it the way you look at something you carried a long way',
        weight: 2,
      },
      {
        activity: "is eating a full meal — actual food, heated over a camp stove — methodically and without guilt. She has stopped rationing herself. She is done running.",
        weight: 2,
        timeRestrict: ['dawn', 'day'],
      },
      {
        activity: 'is cleaning and refolding the tarp that wrapped the cylinder, smoothing it flat with slow, careful strokes, the last task of something finished',
        weight: 1,
      },
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
  wren_shelter: [
    {
      minCycle: 2,
      text: 'She looks at you for a long time before speaking. "You\'ve got the look. The ones who come back. I\'ve seen it twice before." She doesn\'t elaborate. She doesn\'t need to.',
    },
    {
      minCycle: 4,
      text: '"How many times?" she asks. No preamble. She\'s been watching you since you walked in. "The scars tell a story but I\'d rather hear it from you."',
    },
    {
      minCycle: 8,
      text: 'Wren stands when you enter. That\'s new. "The Reclaimers are looking for you. Specifically you — they have your name from previous cycles. I don\'t know how." She pauses. "Neither do they, I think."',
    },
  ],
  wren_ruins: [
    {
      minCycle: 2,
      text: '"Saw someone like you pass through two cycles back," she says without looking up. "Different face. Same eyes." She taps her temple. "The virus changes the eyes."',
    },
    {
      minCycle: 4,
      text: 'She doesn\'t seem surprised to see you. "I figured you\'d come back. You always do, don\'t you." It\'s not a question.',
    },
  ],
  wren_wastes: [
    {
      minCycle: 4,
      text: '"You\'re different this time," she says. "Quieter. The ones who have died more than three times get quieter. Like they\'re listening for something." She looks at the horizon. "Are you?"',
    },
  ],
  wren_underground: [
    {
      minCycle: 2,
      text: '"CHARON-7 does something to Revenants," she says. "I\'ve been taking notes. The revival mechanism isn\'t random — it\'s selective. Whatever it\'s selecting for, you have it." She sets down the cylinder. "So do I, I think. I just haven\'t died yet to prove it."',
    },
    {
      minCycle: 8,
      text: 'She looks at you like a hypothesis confirmed. "Cycle eight or above — the Reclaimers call you Class Three. I call you the answer." She holds up the CHARON-7 cylinder. "This is the question. You are what it was building toward. I just don\'t know toward what."',
    },
  ],
  old_mae: [
    {
      minCycle: 2,
      text: '"You again," she says. Flat. Not unkind. "I remember faces. Yours has been here before, wearing different skin." She pushes a tin cup toward you. "Sit down. Tell me what you remember."',
    },
    {
      minCycle: 6,
      text: 'Old Mae doesn\'t speak when you enter. She watches you pour your own cup — you know where she keeps it — and she says, very quietly: "The Kindling would make you a saint. The Accord would make you a weapon. Don\'t let either of them." She sips her tea. "That\'s all I have."',
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
