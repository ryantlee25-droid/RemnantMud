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
        "\"Same retrovirus, two expression pathways. Hollow: total cognitive loss. Sanguine: cognitive enhancement, heightened sensory processing, photosensitivity, hemoglobin dependency.\" They tap their pen once, twice. \"The divergence mechanism — I have a theory. The data suggests it wasn't random. But I need proof.\" They look at you. \"I don't use the word 'theory' when I mean 'guess.' This is closer to theory. Closer.\"",
    },
  ],

  // ----------------------------------------------------------
  // MARSHAL CROSS — Accord leader
  // ----------------------------------------------------------
  marshal_cross: [
    // === CONVOY remnant-story-0329 Rider G ===
    {
      keywords: ['charon', 'charon-7', 'virus', 'pathogen'],
      response:
        '"It\'s a threat." Cross\'s voice carries no room for elaboration. "I don\'t need to understand the biology to build a wall. I need to know the vector, the range, and whether containment holds." She meets your eyes. "It hasn\'t stopped expanding. That\'s the relevant data point."',
    },
    // === END CONVOY remnant-story-0329 Rider G ===
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
    // === CONVOY remnant-story-0329 Rider G ===
    {
      keywords: ['charon', 'charon-7', 'virus', 'pathogen'],
      response:
        '"It changed us." Vesper is quiet for a moment. "I can tell you what it feels like — the cold clarity, the expansion of senses, the hunger arriving in place of hunger\'s absence. I cannot tell you what it is." She folds her hands. "Ask Lev for the mechanism. I will tell you what the mechanism does to a person. They are different questions."',
    },
    // === END CONVOY remnant-story-0329 Rider G ===
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
        "\"Fear of predators is adaptive. Correct, even. I do not resent it.\" She folds her hands. \"And yet every interaction must be structured, transparent, predictable — because the distance between fear and violence is shorter than anyone admits. Two years after the Collapse — Duskhollow, 2033.\" A pause that carries weight. \"I will not allow that here. That is not a preference.\"",
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
    // === CONVOY remnant-story-0329 Rider G ===
    {
      keywords: ['charon', 'charon-7', 'virus', 'pathogen'],
      response:
        '"The fire is not a disease. It is an invitation." He says it with the calm of a thing proven. "CHARON-7 selects — it does not infect. The ones who shattered were not ready. The ones who survived were. Lev calls it mechanism. I call it intention." His certainty is quieter than it should be.',
    },
    // === END CONVOY remnant-story-0329 Rider G ===
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

  // === CONVOY remnant-story-0329 Rider B: Faction Voices ===

  sparks_radio: [
    { keywords: ['radio', 'signal', 'transmission', 'broadcast'], response: '"Twelve words. Repeating. For seven years. I\'ve counted every transmission." Sparks stares at the receiver. "I know the waveform better than my own heartbeat. Someone set this up to outlast them. That\'s either hope or obsession — I\'ve stopped being able to tell the difference."' },
    { keywords: ['meridian', 'charon', 'facility'], response: '"MERIDIAN? That\'s what the signal\'s about. Has to be." They tap the frequency log. "The pattern changed six months post-Collapse. Like someone switched it from automatic to manual. There\'s a person in there. Was. Maybe still is." A long pause. "I answer back. I have for three years. Nobody answers me."' },
    { keywords: ['alone', 'isolation', 'company', 'people'], response: '"You get used to it. Then you get used to being used to it, which is different." Sparks adjusts the dial without changing the frequency. "The signal is company enough. At least it\'s consistent. Consistent is underrated."' },
  ],
  warlord_briggs: [
    { keywords: ['military', 'soldiers', 'discipline', 'army'], response: '"Discipline wins. Not morality." Briggs doesn\'t look up from the map. "Morality is what you tell yourself afterward. In the field you need people who move when you say move, stop when you say stop, and don\'t ask questions that cost lives."' },
    { keywords: ['expansion', 'territory', 'control', 'borders'], response: '"We push because standing still is dying slowly." He marks something on the map with a grease pencil. "The Hollow don\'t have a truce. The Red Court doesn\'t have a truce. Every settlement we don\'t control is a settlement that can be turned against us. That\'s not aggression. That\'s geometry."' },
    { keywords: ['bombing', 'theater', 'attack', 'civilian'], response: 'Briggs goes still for a full three seconds. "Regrettable. Necessary. Those two words don\'t cancel each other out — they coexist, which is harder." He sets down the pencil. "I don\'t apologize for decisions that kept eight hundred people alive. I also don\'t pretend they came without a cost. The cost has a name. I know it."', requiresFlag: 'bombing_revealed' },
    { keywords: ['strength', 'weakness', 'fear'], response: '"Fear is a tool. Strength is using it correctly — knowing when to be feared and when to be something else." He finally looks at you. "The problem with most commanders is they only have one setting. You need range."' },
    // === CONVOY remnant-story-0329 Rider G ===
    {
      keywords: ['charon', 'charon-7', 'virus', 'pathogen'],
      response:
        '"Weapon someone else made. Now it\'s our problem." Briggs doesn\'t look up. "I treat it like any other hostile — assess, contain, neutralize if possible. I don\'t need the biology. I need to know what it does in the field and what stops it." A pause. "So far: nothing stops it."',
    },
    // === END CONVOY remnant-story-0329 Rider G ===
    // === CONVOY remnant-story-0329 Rider D ===
    {
      keywords: ['philosophy', 'vision', 'future', 'why'],
      response:
        '"People think we expand because we\'re aggressive." He sets the pencil down. "We expand because resources move. The Hollow migrate, the water shifts, the soil gives out. Standing still means watching your supply lines shrink until there\'s nothing left to defend. We push forward because backward is a grave."',
    },
    {
      keywords: ['bombing', 'consequence', 'justice', 'trial'],
      requiresFlag: 'bombing_revealed',
      response:
        '"Cross wants accountability. I understand that. I\'ve offered to submit to a tribunal — once the eastern perimeter is secure. Not before." He is quiet for a moment. "You don\'t court-martial your general during a siege." Another pause, longer. "Whether I\'ll still be willing after the siege... that\'s a question I haven\'t answered for myself yet."',
    },
    // === END CONVOY remnant-story-0329 Rider D ===
  ],
  howard_bridge_keeper: [
    { keywords: ['bridge', 'cables', 'structure', 'span'], response: '"Thirty-seven cable stays. I check them every morning." Howard says it with the quiet pride of a person whose ritual is also their purpose. "Three are showing surface oxidation — cosmetic, not structural. The deck is sound. The footings are sound."' },
    { keywords: ['family', 'daughter', 'son', 'children', 'wife'], response: 'Howard goes quiet for long enough that you think he hasn\'t heard. Then: "She would have been twelve this year." He doesn\'t say who. He doesn\'t say what happened. He goes back to checking the cable fixture, and the subject closes like water over a stone.' },
    { keywords: ['engineering', 'building', 'construction', 'maintenance'], response: '"People think maintenance is about preventing failure. It isn\'t. It\'s about understanding the thing well enough to know where failure wants to happen, and working against it." He runs a hand along the suspension cable. "A bridge is a permanent argument with gravity. You have to keep making the argument."' },
  ],
  dr_ama_osei: [
    { keywords: ['virology', 'virus', 'pathogen', 'disease', 'research'], response: '"Virology is the study of things that aren\'t quite alive in the conventional sense." Dr. Osei doesn\'t look up from the specimen tray. "CHARON-7 isn\'t a disease. It\'s more like a very insistent remodeling contractor. The original structure is still there. It\'s just been rearranged according to someone else\'s plans."' },
    { keywords: ['cure', 'treatment', 'fix', 'solution'], response: '"I\'m close. Some days I think I\'m close." She sets down the pipette. "Other days I think \'close\' is a word people use when they can\'t say \'impossible.\' The difference between those two mental states is about four hours of sleep and one data point that doesn\'t fit."' },
    { keywords: ['sanguine', 'hollow', 'biology', 'physiology'], response: '"Same vector, two outcomes. The divergence happens at integration — something in the host environment tips the expression one way or the other." She pulls out a diagram covered in annotation. "I have twelve hypotheses about what that something is. Three of them are probably wrong. I just don\'t know which three."' },
  ],
  the_wren: [
    { keywords: ['hunting', 'tracking', 'prey', 'kill'], response: '"I don\'t enjoy it. I\'m good at it. Those aren\'t the same thing." The Wren checks the fletching on an arrow without looking at you. "People assume competence means enthusiasm. It doesn\'t."' },
    { keywords: ['detective', 'investigation', 'before', 'past', 'police'], response: '"Long time ago." She doesn\'t elaborate immediately. "Different kind of tracking. Same patience. Same process of elimination." A pause. "The difference is, before, I wanted to understand why. Now I just need to know where."' },
    { keywords: ['morality', 'right', 'wrong', 'ethics', 'choice'], response: '"I stopped applying abstract frameworks to field decisions. Not because they\'re wrong — because they\'re slow." The Wren finally looks at you. "You want to know if I can live with what I\'ve done. Yes."' },
  ],
  elder_kai_nez: [
    { keywords: ['territory', 'land', 'borders', 'map'], response: '"Territory isn\'t on a map. It\'s in the maintenance." The elder gestures at the canyon. "You keep the water sources clear, you patrol the access points, you show up when something threatens the people who live here."' },
    { keywords: ['boundaries', 'rules', 'limits'], response: '"We have boundaries. They\'re not written down." Elder Kai Nez looks at you steadily. "They\'re in the behavior of everyone here. You learn them by watching or you learn them the hard way. The hard way is faster but more expensive."' },
    { keywords: ['outsider', 'stranger', 'visitor', 'trust'], response: '"You\'re welcome until you\'re not. That moment comes faster than people think." They let that sit. "The welcome is real. So is the moment."' },
  ],
  rook: [
    { keywords: ['red court', 'court', 'faction', 'organization'], response: '"The Red Court is what happens when pragmatism gets organized." Rook examines their nails. "Everyone else is managing a moral framework alongside their survival strategy. We removed the framework. It turns out the survival strategy runs considerably cleaner without it."' },
    { keywords: ['deal', 'agreement', 'arrangement', 'trade', 'contract'], response: '"A deal isn\'t trust. A deal is math." Rook\'s eyes don\'t move from yours. "I keep agreements because breaking them is expensive — reputation, predictability, the kind of goodwill that opens doors. Not because I value your wellbeing. Be clear about that distinction."' },
    { keywords: ['vesper', 'covenant', 'duskhollow', 'sanguine'], response: '"Vesper chose civility. I respect that as a strategy — it has real benefits, real costs." A pause. "The Covenant builds loyalty through mutual benefit. The Red Court builds it through necessity. Different tools, different social contracts." Something like amusement crosses Rook\'s face. "We are, however, both still here."' },
  ],
  avery_kindling: [
    { keywords: ['faith', 'belief', 'god', 'prayer', 'kindling'], response: '"I pray because I\'m supposed to. I believe because I\'m afraid not to. Those aren\'t the same thing." Avery watches the fire for a moment. "Harrow says genuine faith is what\'s left after you strip away the fear. I\'m still stripping."' },
    { keywords: ['doubt', 'question', 'uncertain', 'unsure'], response: '"The doubt is the most honest thing about me right now." They say it quietly, like a confession. "Everyone here seems certain. Harrow is certain. The congregation is certain. I keep waiting for the certainty to arrive and it keeps not arriving."', setsFlag: 'avery_shared_doubts' },
    { keywords: ['leave', 'escape', 'go', 'away', 'outside'], response: '"I think about it." Avery\'s voice is very low. "I think about what\'s out there and whether it\'s worse than the uncertainty in here, and I can\'t decide. At least here I\'m fed. At least here there\'s structure." A pause. "Structure isn\'t the same as truth."', requiresFlag: 'avery_shared_doubts' },
  ],
  marta_food_vendor: [
    { keywords: ['food', 'cooking', 'meal', 'eat', 'kitchen'], response: '"People talk when they eat. I listen when I cook." Marta doesn\'t look up from the cutting board. "It\'s not surveillance — I\'m not that organized. It\'s just that feeding someone is the fastest way to make them forget you\'re in the room."' },
    { keywords: ['information', 'news', 'gossip', 'word', 'heard'], response: '"What have I heard." She sets down the knife and considers. "Caravan\'s two days late from Salt Creek. Someone in the Accord is moving resources they haven\'t logged. The Kindling bought a lot of rope last week." She picks the knife back up. "That\'s the free sample. The useful information costs a meal."' },
    { keywords: ['survival', 'how', 'manage', 'alive'], response: '"I feed people. That\'s the whole strategy." She says it simply, without performance. "A person who feeds people is hard to kill — too many people would notice. Too many people would be hungry."' },
  ],
  prisoner_dell: [
    { keywords: ['intelligence', 'information', 'secrets', 'know'], response: '"Everyone has a price. Not everyone knows theirs yet." Dell studies you with the unhurried attention of someone who has nothing but time. "Mine is freedom, obviously. Yours — I\'m still working that out."' },
    { keywords: ['secrets', 'leverage', 'blackmail', 'power'], response: '"I prefer to call it context." Dell\'s voice is dry. "Secrets aren\'t power — knowledge of what someone wants to keep secret is power. There\'s a distinction. The first is a locked box. The second is a key." They smile. "I collect keys."' },
    { keywords: ['freedom', 'escape', 'release', 'deal'], response: '"I have seventeen pieces of information that various parties would pay significant prices for. I\'ve been very careful not to give any of them to anyone who can\'t get me out of here." Dell\'s tone is conversational. "You appear to be someone who goes places and does things."' },
  ],
  shepherd_hermit: [
    { keywords: ['hollow', 'hollows', 'creatures', 'monsters'], response: '"They follow the water. Same as the elk." The hermit doesn\'t look up from the fire. "If they\'re following water, they\'re not dead — they\'re navigating. Something in there still knows what the body needs."' },
    { keywords: ['forest', 'pine sea', 'trees', 'wilderness', 'land'], response: '"The pines came back faster than anything else. First year, just groundcover. Second year, seedlings. Third year — this." They gesture at the tree line. "The forest doesn\'t know there was a Collapse. It just grows."' },
    { keywords: ['alone', 'isolation', 'why', 'hermit', 'solitude'], response: '"The Hollow are quieter than people." Said simply, without self-pity. "People bring their complications with them. Hollows bring their basic needs. Easier to predict. Easier to avoid."' },
  ],
  accord_soldier: [
    { keywords: ['accord', 'rules', 'law', 'order', 'settlement'], response: '"The rules don\'t change. We enforce them." The soldier adjusts their armband. "People complain about that until they need us. Then they stop complaining and start complaining about something else. That\'s fine."' },
    { keywords: ['hollow', 'threat', 'patrol', 'danger'], response: '"Threat classification: persistent, manageable, context-dependent." They recite it like a report. "We have protocols. The protocols work most of the time. The times they don\'t work is what we train for."' },
  ],
  salter_guard: [
    { keywords: ['salters', 'briggs', 'mission', 'orders'], response: '"Orders are orders. Briggs says move, we move." The guard\'s tone doesn\'t invite follow-up questions. "I don\'t have opinions about the strategy. I have a rifle and a post and a time I\'m supposed to be somewhere."' },
    { keywords: ['hollow', 'fight', 'combat', 'clearance'], response: '"Shufflers go down if you hit them right. Screamers you don\'t want to engage at all — not without backup." They check their weapon\'s safety. "Remnants are the problem. They learn."' },
  ],
  kindling_faithful: [
    { keywords: ['kindling', 'fire', 'harrow', 'faith', 'prayer'], response: '"The fire will find its own. We prepare." They press their palms together briefly. "Harrow says the Collapse wasn\'t punishment — it was selection. I\'m not sure I believe that. I believe in the community."' },
    { keywords: ['hollow', 'collapse', 'charon', 'disease'], response: '"The fire is not disease, it\'s transformation. That\'s what Harrow says." Their voice carries conviction that\'s slightly louder than doubt. "Some transformations are incomplete. The Hollow are incomplete. We pray for them."' },
  ],
  reclaimer_technician: [
    { keywords: ['reclaimers', 'data', 'research', 'technology', 'stacks'], response: '"The data suggests the Collapse was survivable at the system level — we just lost the information infrastructure that made the system function." They pull out a notebook covered in diagrams. "We\'re rebuilding the index."' },
    { keywords: ['meridian', 'facility', 'lab', 'science'], response: '"Meridian\'s documentation is partially recovered. There are intentional gaps — redactions at regular intervals suggesting someone wanted certain things unrecoverable." They tap the notebook. "Unrecoverable is different from gone."' },
  ],

  // === END CONVOY remnant-story-0329 Rider B ===

  // === CONVOY remnant-story-0329 Rider C: Red Court ===

  kade_red_court: [
    {
      keywords: ['red court', 'philosophy', 'belief'],
      response:
        '"Self-determination. That\'s the word people avoid." Kade sets down his pen. "The Covenant asks permission. We don\'t. Not because we\'re cruel — because asking permission for what you are is the definition of subjugation."',
    },
    {
      keywords: ['vesper', 'covenant', 'split'],
      response:
        '"Vesper chose diplomacy. I chose honesty." He says it without contempt. "She feeds with consent. I feed with clarity. The human on Vesper\'s table knows they\'re being used. The human on mine knows too. The difference is who gets to pretend otherwise."',
    },
    {
      keywords: ['hollow', 'sanguine', 'nature'],
      response:
        '"The Hollow lost themselves. We didn\'t. That\'s the distinction that matters." Kade turns a page without looking at it. "Consciousness survived in us. Whatever CHARON-7 intended, it made something that thinks, chooses, and remembers. You don\'t ask a thinking being to apologize for existing."',
    },
  ],

  vex_red_court: [
    {
      keywords: ['supply', 'logistics', 'territory'],
      response:
        '"Territory is calories. I manage the math." Vex doesn\'t look up from the ledger. "How many humans per square mile, what\'s sustainable, what\'s extraction versus cultivation. The Covenant calls it tithe. We call it supply chain. Same thing, different branding."',
    },
    {
      keywords: ['practical', 'operations', 'how'],
      response:
        '"People think the Red Court is about violence. It\'s about logistics." The pen keeps moving. "Violence is expensive — it damages the supply, it attracts attention, it creates refugees who warn others. We prefer efficiency. Efficiency is quiet."',
    },
  ],

  lyris_red_court: [
    {
      keywords: ['turned', 'new', 'changed', 'becoming'],
      response:
        '"Six months." Lyris holds up a hand, examines it. "Six months since I stopped being what I was. People ask if it hurts. It doesn\'t. People ask if I miss being human. I miss the certainty. Everything else is... better. And I hate that it\'s better."',
    },
    {
      keywords: ['doubt', 'regret', 'choice'],
      response:
        '"Rook says doubt is a luxury we can\'t afford. Kade says doubt is evidence of consciousness." She looks at you steadily. "I\'m not sure which one I believe yet." A pause. "That\'s the doubt, I guess."',
    },
  ],

  // === END CONVOY remnant-story-0329 Rider C ===
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
