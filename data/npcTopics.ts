// ============================================================
// data/npcTopics.ts — Topic-based dialogue for named NPCs
// Players can "talk <npc> <topic>" or "ask <npc> about <topic>"
// to hear 2-3 sentences of character-specific dialogue.
// ============================================================

import type { FactionType } from '@/types/game'

// ------------------------------------------------------------
// Types
// ------------------------------------------------------------

export interface NpcTopic {
  keywords: string[]           // any of these triggers the topic
  response: string             // 2-3 sentences of dialogue
  requiresFlag?: string        // quest flag the player must have
  requiresRep?: { faction: FactionType; min: number }
  setsFlag?: string            // quest flag set after hearing this
}

// ------------------------------------------------------------
// Registry — keyed by NPC id
// ------------------------------------------------------------

export const NPC_TOPICS: Record<string, NpcTopic[]> = {

  // ----------------------------------------------------------
  // PATCH — Crossroads info broker / medic
  // ----------------------------------------------------------
  patch: [
    {
      keywords: ['scar', 'the scar'],
      response:
        "\"The Scar.\" Patch looks at you sideways. \"What do you know about it first?\" They don't wait for an answer. \"Ground zero. Still active. Soil, water, air — all of it.\" They hold up three fingers. \"Three weeks ago a trader came through rewritten from the inside out. Half-finished job. You want more than that, it'll cost you.\"",
      setsFlag: 'patch_mentioned_scar',
    },
    {
      keywords: ['hollow', 'hollows'],
      response:
        "\"Not dead.\" Patch says it like they're correcting a child. \"Replaced. The shufflers are early. The screamers are later. What comes after screamers?\" They smile without warmth. \"Ask me again when you can afford the answer.\"",
    },
    {
      keywords: ['factions', 'faction', 'groups'],
      response:
        "\"Five groups. Accord builds walls. Salters kill things. Reclaimers read books. Kindling prays. Drifters survive.\" They shrug. \"That's the free version. Which one you want the real story on?\"",
    },
    {
      keywords: ['trade', 'trading', 'market'],
      response:
        "\"Barter town. .22 LR is currency — light, countable, useful if talks go south.\" Patch taps a crate of medical supplies. \"These? Premium. Because I'm the only one who knows what they do. Information moves even faster, which is why you're talking to me and not someone cheaper.\"",
    },
    {
      keywords: ['meridian', 'charon', 'charon-7'],
      response:
        "\"Meridian.\" Patch's hands stop moving. \"Big pharma. Black budget. Supposed to fix people.\" A pause. \"Fixed them into something else instead. But you didn't hear that from me.\" They nod toward the Reclaimer camp. \"Lev knows more. Whether Lev shares more is a different problem.\"",
      setsFlag: 'patch_mentioned_meridian',
    },
  ],

  // ----------------------------------------------------------
  // LEV — Reclaimers researcher
  // ----------------------------------------------------------
  lev: [
    {
      keywords: ['charon', 'charon-7'],
      response:
        "\"CHARON-7 is a synthetic retrovirus — protein shell mimicking endogenous cellular machinery. It integrates rather than attacks, rewriting the host genome in situ. Hollow are the failure state, Sanguine the success state. Revenants are —\" They stop, look at you with clinical interest. \"Unpredicted. I have the designers' notes. They did not account for your expression pathway. That's a data point I find... significant.\" The word lands like they chose it over a more human one.",
    },
    {
      keywords: ['meridian'],
      response:
        "\"Meridian BioSystems. Founded 2024, DOD acquisition 2028, officially dissolved 2031.\" Lev pulls out an annotated diagram. \"'Dissolved' is inaccurate. Relocated. The R-1 sequencing lab in the Scar was theirs, as was the sub-reservoir facility. My documentation has intentional gaps — redactions at precise intervals suggesting structured information denial rather than data loss.\"",
    },
    {
      keywords: ['research', 'study', 'work'],
      response:
        "\"I study CHARON-7's effect on Revenant neurology — specifically, memory retention across resurrection cycles.\" They tap a stack of notebooks. \"Degradation follows a measurable gradient. Core identity: persistent. Procedural skills: persistent. Episodic memory: systematic erosion.\" They hesitate. \"It looks designed. As if someone wanted subjects who remember how to fight but not who they —\" They clear their throat. \"The pattern is statistically significant. That's the relevant point.\"",
    },
    {
      keywords: ['keycard', 'key card', 'lab', 'r-1', 'r1'],
      requiresFlag: 'found_r1_sequencing_data',
      response:
        "Lev's hands go flat on the table. \"R-1 sequencing data. Show me.\" They clear a workspace with sudden, unscientific urgency, then visibly collect themselves. \"The Scar facility has a locked lower wing — Meridian biometric, degraded to physical keycard override. Administrator's office, if it's intact. I need that cross-referenced with the protein folding models. This is —\" A breath. \"This is actionable data. That's all.\"",
      setsFlag: 'lev_mentioned_keycard',
    },
    {
      keywords: ['sanguine', 'vampire', 'vampires', 'turned'],
      response:
        "\"Same retrovirus, two expression pathways. Hollow: total cognitive loss. Sanguine: cognitive enhancement, heightened sensory processing, photosensitivity, hemoglobin dependency.\" They tap their pen once, twice. \"The divergence mechanism is what I can't isolate. Identical pathogen, opposite outcomes. That's not random mutation — the variance is too clean. Something is selecting.\" They look at you. \"I don't use the word 'selecting' lightly.\"",
    },
  ],

  // ----------------------------------------------------------
  // MARSHAL CROSS — Accord leader
  // ----------------------------------------------------------
  marshal_cross: [
    {
      keywords: ['law', 'rules', 'accord', 'justice'],
      response:
        "\"Follow the rules. Contribute labor. Get protection.\" She adjusts a pin on her collar. \"Steal, you answer for it. Kill without cause, you're outside the walls. Eight hundred people breathing. That's the metric. Everything else is commentary.\"",
    },
    {
      keywords: ['covenant', 'walls', 'settlement'],
      response:
        "\"Former community college. Good walls. Own water supply. Two hundred meters of perimeter, four towers, one gate.\" She meets your eyes. \"It's a lifeboat. Lifeboats have weight limits.\"",
    },
    {
      keywords: ['scar', 'the scar'],
      response:
        "\"2031. National Guard, forward element. Fourteen in, three out.\" Her voice goes flat. \"My sergeant started changing on the drive back. I made a decision.\" Silence. She does not elaborate.",
      setsFlag: 'cross_mentioned_scar',
    },
    {
      keywords: ['kindling', 'deacon', 'harrow'],
      response:
        "\"Sixty, seventy followers. The committed kind.\" Her jaw tightens. \"Last month, two of his people tried to contaminate our water supply. With intent.\" She lets that sit. \"That's not faith. That's an act of war. I just haven't signed the paperwork yet.\"",
    },
    {
      keywords: ['threat', 'danger', 'worried'],
      response:
        "\"The Scar is expanding. The Kindling are getting bolder. Vesper's people are one bad month from a blood shortage.\" Cross looks out the window. Long pause. \"I can fight Hollow. I can manage people. Biology doesn't negotiate.\"",
    },
  ],

  // ----------------------------------------------------------
  // VESPER — Elder Sanguine, Covenant of Dusk leader
  // ----------------------------------------------------------
  vesper: [
    {
      keywords: ['blood', 'tithe', 'feeding'],
      response:
        "\"Four hundred milliliters per willing donor, once per month. Less than the old world asked of its blood banks.\" Her expression is perfectly still. \"And yet the word 'tithe' carries connotations I cannot entirely dispel. We provide night security, Hollow early warning, institutional memory. Nevertheless — I am aware that an arrangement can be equitable and still feel like something else entirely.\"",
    },
    {
      keywords: ['sanguine', 'turned', 'vampire'],
      response:
        "\"I turned in my office grading papers on Kant's categorical imperative.\" A practiced pause. \"The irony is not subtle. And yet I find I must live inside it rather than resolve it. We are people with a condition that happens to be monstrous — the distinction matters.\" Something flickers behind her eyes. \"Most days it matters.\"",
    },
    {
      keywords: ['meridian', 'cure'],
      response:
        "\"Dr. Osei's research is promising. A reversal at the cellular level.\" Vesper is quiet for a long moment. \"And yet — I am more capable now. More perceptive. More durable.\" Her voice drops. \"I am not certain I want to be cured. That is something I have not said aloud before.\" The practiced detachment returns instantly. \"Nevertheless. The option should exist. Choice is the point.\"",
      setsFlag: 'vesper_mentioned_cure',
    },
    {
      keywords: ['humans', 'human', 'living'],
      response:
        "\"Fear of predators is adaptive. Correct, even. I do not resent it.\" She folds her hands. \"And yet every interaction must be structured, transparent, predictable — because the distance between fear and violence is shorter than anyone admits. Duskhollow, 2033.\" A pause that carries weight. \"I will not allow that here. That is not a preference.\"",
    },
    {
      keywords: ['red court', 'court', 'rook'],
      response:
        "\"The Red Court decided that predation is identity rather than condition. Rook is their visible edge. What is behind Rook is worse.\" Her eyes narrow — the first unguarded thing you've seen from her. \"I left in 2033. Their direction was: stop negotiating with food. I found that untenable. They found my departure inconvenient. And yet —\" She stops. \"We coexist. At a distance. For now.\"",
    },
  ],

  // ----------------------------------------------------------
  // DEACON HARROW — Kindling leader
  // ----------------------------------------------------------
  deacon_harrow: [
    {
      keywords: ['faith', 'belief', 'kindling', 'religion'],
      response:
        "\"CHARON-7 is not a disease. It is an invitation.\" He says this calmly, the way someone states the weather. \"They assumed humanity was the final form. We know better. We do not worship the pathogen — we prepare for what it offers. When the fire comes, we will be ready. They will not.\"",
    },
    {
      keywords: ['purification', 'purify', 'transform', 'turning'],
      response:
        "\"Cross will tell you we force conversion. We do not.\" He leans forward. \"We offer preparation. When CHARON-7 reaches you — and it will reach everyone — the prepared mind integrates. The unprepared mind shatters. That is what the Hollow are. That is what we prevent.\" His certainty is the quietest thing in the room. \"No one has accepted full preparation yet. They will.\"",
      setsFlag: 'harrow_explained_purification',
    },
    {
      keywords: ['tunnel', 'tunnels', 'underground'],
      response:
        "\"Cross knows about the tunnels.\" He smiles. \"She does not know how far they go. Faith requires privacy. Some preparations require darkness.\" He lets the silence do the work. \"We are not hiding. We are building something she cannot surveil because she would not understand it.\"",
      setsFlag: 'harrow_mentioned_tunnels',
    },
    {
      keywords: ['scar', 'the scar'],
      response:
        "\"The Scar is not a wound. It is a mouth.\" His voice drops, but his conviction does not. \"I have been to the edge. I have listened. I did not understand everything — but I understood enough to know that they sealed it because it has not finished speaking. And we do not silence what we do not understand. They do.\"",
    },
    {
      keywords: ['hollow', 'hollows'],
      response:
        "\"The Hollow are grief. The message arrived and they were not ready.\" For a moment, the certainty cracks and something raw shows through. \"My sister was among the first. She screamed for three days.\" The composure returns, seamless. \"I could not help her then. I understand now. That is what we are for.\"",
    },
  ],
}

// ------------------------------------------------------------
// Lookup helpers
// ------------------------------------------------------------

/**
 * Find a topic for an NPC by keyword match.
 * Returns the topic if found, or undefined.
 */
export function findNpcTopic(npcId: string, keyword: string): NpcTopic | undefined {
  const topics = NPC_TOPICS[npcId]
  if (!topics) return undefined
  const lower = keyword.toLowerCase()
  return topics.find(t => t.keywords.some(k => k === lower))
}

/**
 * Get the list of visible topic keywords for an NPC,
 * filtered by the player's current quest flags and reputation.
 */
export function getVisibleTopics(
  npcId: string,
  questFlags: Record<string, string | boolean | number>,
  factionRep: Partial<Record<FactionType, number>>,
): string[] {
  const topics = NPC_TOPICS[npcId]
  if (!topics) return []
  return topics
    .filter(t => {
      if (t.requiresFlag && !questFlags[t.requiresFlag]) return false
      if (t.requiresRep) {
        const rep = factionRep[t.requiresRep.faction] ?? 0
        if (rep < t.requiresRep.min) return false
      }
      return true
    })
    .map(t => t.keywords[0]!)
}
