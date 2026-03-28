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
        "\"The Scar is where CHARON-7 hit ground zero. Everything inside the perimeter is still active — the soil, the water, the air itself. People go in. Some come back. The ones who come back are not improved by the experience.\" Patch pauses their work. \"Three weeks ago a trader came through with burns that weren't thermal. Cellular. Like something had tried to rewrite him from the inside out and given up halfway.\"",
      setsFlag: 'patch_mentioned_scar',
    },
    {
      keywords: ['hollow', 'hollows'],
      response:
        "\"The Hollow aren't dead. That's the part people get wrong. CHARON-7 doesn't kill — it replaces. Everything that made a person a person gets overwritten, and what's left is still using the original hardware. The shufflers are the early stage. The screamers are further along. I've seen what comes after screamers, and I don't talk about it at dinner.\"",
    },
    {
      keywords: ['factions', 'faction', 'groups'],
      response:
        "\"Five groups that matter. The Accord runs the Covenant — that's Marshal Cross, law and walls. Salters kill Hollow for bounties. Reclaimers dig through the old world looking for answers. Kindling thinks CHARON-7 is divine and wants to burn everything clean. And the Drifters — that's us — we go where the work is and try not to get eaten.\" They shrug. \"Pick your poison. Everyone does eventually.\"",
    },
    {
      keywords: ['trade', 'trading', 'market'],
      response:
        "\"Crossroads runs on barter. .22 LR is the base currency — light, countable, and you can use it if negotiations break down. Medical supplies trade at a premium because I'm the only one who knows what half of them do. Weapons move fast. Food moves faster. Information moves fastest of all, which is why I'm still here.\"",
    },
    {
      keywords: ['meridian', 'charon', 'charon-7'],
      response:
        "\"Meridian was the pharmaceutical company that developed CHARON-7. Government contract, black-budget tier. They were supposed to be engineering targeted cellular regeneration — fix anything, regrow anything. Instead they made something that fixes you into something else entirely.\" Patch's hands stop moving. \"Lev at the Reclaimers has more on this than I do. If you can get them to trust you.\"",
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
        "\"CHARON-7 is a synthetic retrovirus with a protein shell that mimics endogenous cellular machinery. It doesn't attack — it integrates. Rewrites the host genome in situ. The Hollow are the failure state. The Sanguine are the success state. And the Revenants —\" They look at you. \"The Revenants are something the original designers did not predict. I'm certain of that because I've read their notes. They didn't plan for you.\"",
    },
    {
      keywords: ['meridian'],
      response:
        "\"Meridian BioSystems. Founded 2024, acquired by the DOD in 2028, dissolved — officially — in 2031. Except it wasn't dissolved. It was moved. The R-1 sequencing lab in the Scar was theirs. So was the facility under the reservoir, if my readings are correct.\" Lev pulls out a diagram covered in their own annotations. \"Everything I know about CHARON-7's architecture comes from recovered Meridian documentation. And there are gaps in it that I believe are intentional.\"",
    },
    {
      keywords: ['research', 'study', 'work'],
      response:
        "\"I study what CHARON-7 does to human neurology. Specifically, the memory retention patterns in Revenant subjects — what you keep across cycles, what you lose, and why.\" They tap a stack of hand-written notebooks. \"The degradation isn't random. It follows a gradient. Core identity persists. Procedural skills persist. But episodic memory — the specific events of each life — degrades in a pattern that looks designed. Like someone wanted you to remember how to fight but not why you're fighting.\"",
    },
    {
      keywords: ['keycard', 'key card', 'lab', 'r-1', 'r1'],
      requiresFlag: 'found_r1_sequencing_data',
      response:
        "Lev's eyes widen. \"You found sequencing data from R-1? Give me — no. Let me see it properly.\" They clear a space on the table with sudden urgency. \"There's a locked wing in the lower levels of the Scar facility. Meridian-grade biometric lock, but the system is degraded enough that a physical keycard override should work. The keycard would be in the administrator's office — if anything is left of it. This data changes everything, if I can cross-reference it with the protein folding models.\"",
      setsFlag: 'lev_mentioned_keycard',
    },
    {
      keywords: ['sanguine', 'vampire', 'vampires', 'turned'],
      response:
        "\"The Sanguine are CHARON-7's other expression pathway. Where the Hollow lose cognitive function entirely, the Sanguine retain it — enhanced, actually. Faster processing, heightened senses, the photosensitivity, the hemoglobin dependency. It's not magic. It's a different version of the same rewrite.\" They pause. \"The question that keeps me up at night is why the same virus produces two completely different outcomes. I don't think it's random. I think it's selecting for something.\"",
    },
  ],

  // ----------------------------------------------------------
  // MARSHAL CROSS — Accord leader
  // ----------------------------------------------------------
  marshal_cross: [
    {
      keywords: ['law', 'rules', 'accord', 'justice'],
      response:
        "\"The Accord is simple. You live inside the walls, you follow the rules. You contribute labor, you get protection. You steal, you answer for it. You kill without cause, you're out — and out means the Hollow get you before the week's done.\" She adjusts a pin on her collar. \"People call it harsh. I call it eight hundred people still breathing. I'll take harsh over dead every single time.\"",
    },
    {
      keywords: ['covenant', 'walls', 'settlement'],
      response:
        "\"The Covenant was a community college before the Collapse. Good walls, defensible approaches, its own water supply from the well system on the east side. We've reinforced it with everything we could salvage. Two hundred meters of perimeter, four watch towers, one gate.\" She meets your eyes. \"It's not a city. It's a lifeboat. And lifeboats have weight limits.\"",
    },
    {
      keywords: ['scar', 'the scar'],
      response:
        "\"I was there when it opened. 2031. I was National Guard, forward element.\" Her voice doesn't change — it just stops having warmth in it. \"Fourteen of us went in. Three came out. The Hollow hadn't formed yet — it was just the raw pathogen in the air, in the water. We didn't know what we were breathing. My sergeant started changing on the drive back. I had to make a decision about that. I made it.\" She doesn't elaborate.",
      setsFlag: 'cross_mentioned_scar',
    },
    {
      keywords: ['kindling', 'deacon', 'harrow'],
      response:
        "\"Harrow is a problem I haven't solved yet. He's got sixty, maybe seventy followers, and they're the kind of committed that doesn't respond to negotiation. He thinks CHARON-7 is purification — that the Hollow are the next stage of human evolution and the rest of us are just too afraid to see it.\" Her jaw tightens. \"Last month two of his people tried to contaminate our water supply. With intent. That's not faith. That's war. I just haven't declared it yet.\"",
    },
    {
      keywords: ['threat', 'danger', 'worried'],
      response:
        "\"Three things keep me up. The Scar is expanding — slowly, but measurably. The Kindling are getting bolder. And the Sanguine in the Covenant — Vesper's people — are one bad month away from a blood shortage that turns the tithe voluntary into the tithe mandatory.\" Cross looks out the window. \"I can fight Hollow. I can manage people. I cannot fight biology. That's the threat I don't have an answer for.\"",
    },
  ],

  // ----------------------------------------------------------
  // VESPER — Elder Sanguine, Covenant of Dusk leader
  // ----------------------------------------------------------
  vesper: [
    {
      keywords: ['blood', 'tithe', 'feeding'],
      response:
        "\"The tithe is four hundred milliliters per willing donor, once per month. That is less than a standard blood donation in the old world. It sustains twelve Sanguine — myself and my household. In exchange, we provide night security that no human patrol can match, early warning against Hollow incursion, and the institutional memory of someone who has been alive, in one form or another, for longer than most of your settlements.\" Her expression doesn't change. \"It is the most efficient arrangement available. I invite you to propose a better one.\"",
    },
    {
      keywords: ['sanguine', 'turned', 'vampire'],
      response:
        "\"I was a professor of moral philosophy at the university when CHARON-7 reached the campus. I turned in my office, between office hours, while grading papers on Kant's categorical imperative.\" A pause. \"The irony is not subtle. I am now something that must consume others to survive and I spend every conscious hour trying to do so ethically. The Sanguine are not monsters. We are people with a medical condition that happens to be monstrous. The distinction matters.\"",
    },
    {
      keywords: ['meridian', 'cure'],
      response:
        "\"Dr. Osei believes a cure is possible. A reversal of the CHARON-7 integration at the cellular level. I have read her research. It is promising.\" Vesper is quiet for a long moment. \"I am not certain I want to be cured. That is a confession I have not made to anyone else. What I am now is more capable, more perceptive, more durable than what I was. The cost is the blood. The cost is the sunlight. The cost is watching everyone I knew grow old while I do not. Whether that sum is negative depends on the arithmetic you use.\"",
      setsFlag: 'vesper_mentioned_cure',
    },
    {
      keywords: ['humans', 'human', 'living'],
      response:
        "\"Humans fear us because fear of predators is adaptive and correct. I do not resent it. I manage it. Every interaction between Sanguine and Unturned must be structured, predictable, and transparent, because the moment it is not, the fear becomes action and the action becomes violence.\" She folds her hands. \"I have seen what happens when a settlement turns on its Sanguine population. Duskhollow. 2033. I will not allow it to happen here. That is not a preference. It is a commitment.\"",
    },
    {
      keywords: ['red court', 'court', 'rook'],
      response:
        "\"The Red Court is what happens when Sanguine stop pretending the hierarchy is metaphorical. They have decided that predation is identity rather than condition, and they organize accordingly. Rook is their visible edge. What is behind Rook is worse.\" Her eyes narrow. \"I left the Red Court in 2033 because I disagreed with the direction. The direction was: stop negotiating with food. I found that position untenable. They found my departure inconvenient. We have been disagreeing at a distance ever since.\"",
    },
  ],

  // ----------------------------------------------------------
  // DEACON HARROW — Kindling leader
  // ----------------------------------------------------------
  deacon_harrow: [
    {
      keywords: ['faith', 'belief', 'kindling', 'religion'],
      response:
        "\"CHARON-7 is not a disease. CHARON-7 is an invitation. The old world built itself on the assumption that humanity was the final form — that evolution had finished its work and we were the result. CHARON-7 says otherwise.\" His eyes burn with something that is either conviction or fever. \"The Kindling does not worship the pathogen. We recognize it. We prepare for what it offers. When the fire comes, we will be ready to burn and become what burns.\"",
    },
    {
      keywords: ['purification', 'purify', 'transform', 'turning'],
      response:
        "\"Purification is voluntary. I want to be clear about that, because Cross will tell you otherwise.\" He leans forward. \"We do not force conversion. We offer preparation — mental, spiritual, physical. When CHARON-7 reaches you — and it will reach everyone, eventually — the prepared mind integrates. The unprepared mind shatters. The Hollow are the unprepared. The Sanguine are the partially prepared. What we offer is full preparation. No one has accepted yet. But they will.\"",
      setsFlag: 'harrow_explained_purification',
    },
    {
      keywords: ['tunnel', 'tunnels', 'underground'],
      response:
        "\"The tunnels beneath the Ember were pre-Collapse infrastructure — storm drains, maintenance access, a section of unfinished subway. We have expanded them.\" He smiles. \"Cross knows about the tunnels. She does not know how far they go. That is by design. The Kindling needs space that the Accord cannot surveil. Not because we are hiding. Because faith requires privacy. And because some preparations require darkness.\"",
      setsFlag: 'harrow_mentioned_tunnels',
    },
    {
      keywords: ['scar', 'the scar'],
      response:
        "\"The Scar is not a wound. The Scar is a mouth. It is where CHARON-7 first spoke, and it is still speaking, and most of what it says is too complex for human neurology to process without assistance.\" His voice drops. \"I have been to the edge. I have listened. I did not understand everything I heard, but I understood enough to know that the people who sealed it are trying to silence something that has not finished talking.\"",
    },
    {
      keywords: ['hollow', 'hollows'],
      response:
        "\"The Hollow are grief. They are what happens when the message arrives and the recipient is not ready. I mourn every one of them.\" For a moment, the performance drops and something genuine shows through. \"My sister was among the first. She did not shuffle. She screamed for three days and then she stopped screaming and started hunting. I could not help her because I did not yet understand what was happening.\" The mask returns. \"I understand now. That is what the Kindling is for.\"",
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
