// ============================================================
// The Remnant MUD — Quest Journal Descriptions
// data/questDescriptions.ts
// ============================================================
// Rider B: New file — do NOT modify existing files.
// Maps quest flags (set by dialogue trees, room extras, and
// social actions) to human-readable journal entries.
// ============================================================

export interface QuestEntry {
  flag: string
  title: string
  description: string
  category: 'main' | 'faction' | 'discovery' | 'personal'
  hint?: string
  completionFlag?: string // quest is "complete" when this other flag is true
}

export const QUEST_DESCRIPTIONS: QuestEntry[] = [

  // ----------------------------------------------------------
  // Main — MERIDIAN / CHARON-7 investigation arc
  // ----------------------------------------------------------

  {
    flag: 'found_r1_sequencing_data',
    title: 'The R1 Data',
    description: 'You found the CHARON-7 R1 sequencing data in The Stacks — partial but readable. The file predates the Collapse by three years. MERIDIAN wasn\'t reacting to the infection. They were cultivating it. Whatever the design called for, the subject population was always part of the plan.',
    category: 'main',
    hint: 'The R1 data references a lead researcher. Lev at The Stacks may know more about who authorized the project.',
    completionFlag: 'discovered_archive_meridian_connection',
  },

  {
    flag: 'discovered_archive_meridian_connection',
    title: 'The MERIDIAN Connection',
    description: 'The archive sub-facility and the MERIDIAN installation are the same project — different floors of the same buried structure. The research that produced CHARON-7 was funded and directed from within MERIDIAN itself, insulated from any oversight that might have asked the obvious question: what is the acceptable casualty count for a successful trial.',
    category: 'main',
    hint: 'The Elder in The Deep claims to have been an early CHARON-7 subject. They may know the name behind File 47-B.',
    completionFlag: 'elder_lore_tier_3',
  },

  {
    flag: 'discovered_charon7_deliberate_release',
    title: 'Deliberate Release',
    description: 'The archive confirms it: CHARON-7 was not an accident. The Collapse was not a containment failure. The release was scheduled, authorized, and carried out by MERIDIAN personnel operating under orders that ran above any civilian authority. Millions dead. The paperwork is intact. The authorization signatures are legible.',
    category: 'main',
    hint: 'If there are authorization signatures, there may be names. The MERIDIAN sub-facility may hold the full chain of command.',
    completionFlag: 'game_ending',
  },

  {
    flag: 'discovered_fault_entity',
    title: 'Something Below the Archive',
    description: 'The lowest level of the Deep archive isn\'t empty. Something remains in the flooded lower chambers — something that the MERIDIAN files referred to, obliquely, as "the Fault-Adjacent Specimen." The research notes don\'t describe it clearly. The later entries are written by someone who had stopped trying to be precise.',
    category: 'main',
    hint: 'The Elder may understand what the Fault-Adjacent Specimen refers to. The files mention a connection to the Scar.',
  },

  {
    flag: 'discovered_fault_scar_connection',
    title: 'The Scar and the Fault',
    description: 'The geological anomaly known as the Scar isn\'t natural. MERIDIAN induced it — a subsidence event designed to expose and access a pre-existing subterranean structure they referred to as "the Fault." Whatever they found in the Fault informed the CHARON-7 project in ways the surviving documentation won\'t commit to clearly. The researchers were frightened and trying not to write down why.',
    category: 'main',
    hint: 'The Scar itself may hold answers the archive only hints at.',
  },

  {
    flag: 'reclaimers_meridian_keycard',
    title: 'The MERIDIAN Keycard',
    description: 'You carry — or know how to obtain — a MERIDIAN access keycard. The Reclaimers traced its origin to a facility that has been officially nonexistent for seven years. The Stacks believes it opens something in the Scar. They\'re right. The question is what you find when it does.',
    category: 'main',
    hint: 'The keycard opens a restricted entry point in the Scar. Prepare before you use it.',
    completionFlag: 'charon_choice',
  },

  {
    flag: 'sanguine_biometric_obtained',
    title: 'Sanguine Biometric',
    description: 'Vesper provided biometric authorization data — the genetic key to the Sanguine entry protocols built into the MERIDIAN facility. The Red Court doesn\'t know you have this. Vesper gave it with conditions you may or may not be able to honor.',
    category: 'main',
    hint: 'The biometric unlocks a second access route into the Scar facility. Vesper\'s trust may depend on what you do with it.',
    completionFlag: 'charon_choice',
  },

  {
    flag: 'kindling_tunnel_access',
    title: 'The Tunnel Route',
    description: 'The Kindling showed you the tunnel system that bypasses the main Scar approaches — a route the Ember\'s faithful have been mapping for years, quietly, without telling the Accord or the Salters. It comes up inside the MERIDIAN perimeter. Harrow gave you this with the expectation that you understand what it means to owe the Kindling a debt.',
    category: 'main',
    hint: 'Three routes into the Scar facility are now known. Each carries the weight of who helped you find it.',
    completionFlag: 'charon_choice',
  },

  {
    flag: 'deep_utility_access',
    title: 'Utility Override',
    description: 'The Elder granted you the override sequence for the Deep\'s utility passage — the maintenance route that connects the Lucid\'s home territory to the sub-facility infrastructure. They measured you carefully before they gave it. Whatever they saw, they decided you were worth the risk.',
    category: 'main',
    hint: 'The utility passage leads directly toward the archive lower levels. The Elder will want to know what you find.',
    completionFlag: 'charon_choice',
  },

  {
    flag: 'meridian_antechamber_heard',
    title: 'Something Waiting',
    description: 'You heard something in the MERIDIAN antechamber — a sound that didn\'t match the hum of old machinery or the drip of infiltrating water. Something in the facility is aware of your presence. It has been waiting. How long is unclear. The MERIDIAN files have a word for what waits in certain zones of the facility. They never fully define it.',
    category: 'main',
    hint: 'The end of this road is very close. Be certain before you go further.',
  },

  {
    flag: 'charon_choice',
    title: 'The Final Choice',
    description: 'You reached the terminus of the MERIDIAN project and stood at the place where four endings branch. What you chose there — cure, weapon, seal, or throne — is written into the record. Some choices cannot be taken back. Most choices cannot.',
    category: 'main',
    completionFlag: 'game_ending',
  },

  {
    flag: 'found_broadcaster_identity',
    title: 'The Broadcaster',
    description: 'The signal was a person. Somewhere in the Scar, someone has been transmitting to the waste for cycles — not directions, not news, not anything useful. Just language. Just the sound of a human voice insisting the world is still worth talking to. You know their name now. Whether they are still alive is something you\'ll only know by finding out.',
    category: 'main',
    hint: 'The transmissions came from inside the Scar perimeter. They may still be active.',
  },

  {
    flag: 'found_sanguine_origin',
    title: 'Origin of the Sanguine',
    description: 'The Sanguine weren\'t always what they are. The MERIDIAN records describe the original transformation protocol — the subjects who survived CHARON-7 and metabolized it into something else. Something that feeds differently, thinks differently, endures. Vesper is not the aberration. Vesper is the intended result, and someone considered that result acceptable.',
    category: 'main',
    hint: 'Vesper may be ready to hear what the records say. Or may already know.',
  },

  {
    flag: 'found_hollow_origin',
    title: 'Origin of the Hollows',
    description: 'The Hollows are what CHARON-7 does to people who aren\'t strong enough to become Sanguine and aren\'t lucky enough to die. The research documentation is precise and clinical about this. The researchers who wrote it down knew exactly what they were producing. They wrote it in the passive voice, as people do when they cannot bear to use subject pronouns.',
    category: 'main',
  },

  // ----------------------------------------------------------
  // Faction — The Accord
  // ----------------------------------------------------------

  {
    flag: 'cross_expedition_sanctioned',
    title: 'Accord Sanction',
    description: 'Cross gave formal Accord authorization for your expedition into restricted territory. It\'s a rare thing — the Accord doesn\'t usually sanction what it can\'t control. She gave it because she calculated that letting you go is less dangerous than not knowing what you find.',
    category: 'faction',
    hint: 'The Accord will want to know what you discover. How much you tell Cross is your own calculation.',
  },

  {
    flag: 'cross_wants_tunnel_intel',
    title: 'Cross\'s Request',
    description: 'Cross wants intelligence on the tunnel system — specifically, who built it, who uses it, and whether it poses a security threat to the Accord\'s territorial integrity. She asked with the particular careful tone of someone who already suspects the answer and doesn\'t want to be the one to confirm it.',
    category: 'faction',
    hint: 'The Kindling built the tunnels. Whether you tell Cross that is a decision with permanent consequences.',
  },

  {
    flag: 'cross_committed_truth_mission',
    title: 'The Truth Mission',
    description: 'You committed to Cross: bring back the truth about MERIDIAN, whatever it is, regardless of who it implicates. She accepted that framing. Whether the Accord can survive what the truth contains is a problem she is choosing not to think about yet.',
    category: 'faction',
  },

  {
    flag: 'player_accord_loyalist',
    title: 'Accord Loyalty',
    description: 'Dell\'s observation, or maybe something you said: the Accord reads you as a loyalist. That alignment opens certain doors and closes others. The Salters distrust loyalists. The Kindling assume they\'re agents. The Drifters price services differently when they know who\'s asking.',
    category: 'faction',
  },

  {
    flag: 'salter_expedition_backing',
    title: 'Salter Backing',
    description: 'Briggs extended Salter resources — equipment access, safe corridors through Salter-controlled territory, and plausible deniability for whatever you do inside MERIDIAN. They want something in return. They always do. The terms are not written down, which is the most binding kind of Salter contract.',
    category: 'faction',
    hint: 'The Salters will present their terms when the time comes. It will not be convenient.',
  },

  {
    flag: 'briggs_confessed_bombing',
    title: 'The Theater Bombing',
    description: 'Briggs admitted to ordering the bombing of the Crossroads theater during the early consolidation period — a strategic decision that killed forty-seven civilians and ended a faction negotiation that might have prevented three years of subsequent violence. He said it was necessary. He said it in the way people do when they know it wasn\'t.',
    category: 'faction',
    hint: 'Cross doesn\'t know Briggs admitted this. The Kindling have suspected it for years. What you do with this knowledge is a choice about what kind of world you\'re building.',
  },

  {
    flag: 'cross_admitted_bombing_theater',
    title: 'Cross Knows',
    description: 'You told Cross what Briggs admitted. She received it the way she receives all information that cannot be immediately acted on — quietly, precisely, without visible reaction. Somewhere behind that composure something shifted. The Accord\'s internal politics are not the same after this conversation.',
    category: 'faction',
  },

  // ----------------------------------------------------------
  // Faction — The Kindling
  // ----------------------------------------------------------

  {
    flag: 'em_kindling_intro',
    title: 'The Kindling',
    description: 'You made contact with the Kindling — the Ember\'s true believers. They speak about purification the way engineers speak about load-bearing structures: precisely, with full understanding of what fails when the math is wrong. Harrow is their voice. What Harrow believes runs deeper than rhetoric.',
    category: 'faction',
    hint: 'The Kindling know things about the tunnel network and the Scar approaches that the Accord doesn\'t. Harrow doesn\'t give information freely.',
  },

  {
    flag: 'harrow_mentioned_tunnels',
    title: 'The Tunnel System',
    description: 'Harrow referenced the tunnels — a network of maintained passages beneath the Ember and extending toward the Scar, built during the first cycle and kept from every faction except the Kindling\'s inner circle. He mentioned them. He did not offer them. There is a distance between those two things.',
    category: 'faction',
    hint: 'The tunnels are the key the Kindling hold. Harrow\'s trust is the door.',
  },

  {
    flag: 'harrow_recognized_truth',
    title: 'Harrow\'s Acknowledgment',
    description: 'Harrow recognized that you understand the difference between what the Kindling teach publicly and what their doctrine actually requires. He spoke to you as someone who can hear the harder version. That recognition carries weight inside the Ember. It also carries obligation.',
    category: 'faction',
    completionFlag: 'kindling_tunnel_access',
  },

  {
    flag: 'player_alignment_kindling',
    title: 'Aligned with the Kindling',
    description: 'You aligned explicitly with Kindling doctrine — not as a tactical maneuver, but as a declared position. The Ember\'s faithful will treat you as one of their own. The Accord will note the alignment. The Reclaimers will ask difficult questions.',
    category: 'faction',
  },

  {
    flag: 'player_deceived_harrow',
    title: 'The Deception',
    description: 'You deceived Harrow to gain tunnel access — told him what he needed to hear, not what you believe. He gave you the route. He may not know you lied. The Kindling have survived seven years by being very good at reading people. The uncertainty is its own kind of weight.',
    category: 'faction',
    hint: 'The Kindling\'s memory is long. If they discover the deception, the consequences will not be immediate.',
  },

  {
    flag: 'harrow_explained_purification',
    title: 'The Purification Doctrine',
    description: 'Harrow explained the Kindling\'s theology in full — not the version they give to travelers, but the underlying eschatology: the Collapse as cleansing, CHARON-7 as a selecting agent, the survivors as the intended remainder. He believes it completely. The conviction is not comforting. Neither is how logically it holds together.',
    category: 'faction',
  },

  {
    flag: 'avery_shared_kindling_intel',
    title: 'Avery\'s Doubts',
    description: 'Avery, one of the Kindling faithful, shared intelligence about the Ember\'s internal structure — quietly, carefully, with the particular discretion of someone who hasn\'t yet decided whether their doubts are heresy or wisdom. They\'re watching to see what you do with the information.',
    category: 'faction',
    hint: 'Avery is a point of leverage inside the Kindling. Handle them carefully.',
  },

  {
    flag: 'avery_revealed_harrow_secret',
    title: 'What Harrow Hides',
    description: 'Avery told you something about Harrow that the inner circle doesn\'t discuss — a fact about his past or his methods that contradicts the public doctrine in a way that matters. The Kindling\'s faith is built on Harrow\'s authority. What you know now is a load-bearing wall.',
    category: 'faction',
  },

  {
    flag: 'avery_will_leave',
    title: 'Avery\'s Decision',
    description: 'Avery decided to leave the Kindling. You were part of that decision — whether by evidence you provided, arguments you made, or simply by being someone who received their doubts without judging them. They won\'t leave immediately. They\'re afraid. They will leave.',
    category: 'faction',
    completionFlag: 'avery_betrayed',
  },

  {
    flag: 'em_incinerator_radiation_investigated',
    title: 'The Incinerator Anomaly',
    description: 'The incinerator complex at the Ember is hotter than a biomass furnace has any reason to be. The radiation signature doesn\'t match organic combustion. Someone is burning something that isn\'t bodies — or the bodies contain something that isn\'t biological. The Kindling do not want questions about the incinerator.',
    category: 'faction',
    hint: 'The Kindling\'s tunnel access is gated on this investigation. Harrow knows you\'ve seen the incinerator. The question is what he thinks you concluded.',
    completionFlag: 'kindling_tunnel_access',
  },

  // ----------------------------------------------------------
  // Faction — The Reclaimers
  // ----------------------------------------------------------

  {
    flag: 'reclaimers_trusted',
    title: 'Reclaimer Trust',
    description: 'Lev and the Stacks research team consider you trustworthy — a rare classification that opens access to the deeper archive materials and the cold storage sub-levels. Reclaimers extend trust slowly, carefully, and in measurable increments. You have earned their first level.',
    category: 'faction',
    hint: 'Trust with the Reclaimers scales with what you bring them. Information is the primary currency.',
  },

  {
    flag: 'discovered_field_station_echo',
    title: 'The Field Station Echo',
    description: 'The Stacks archive contains a cycle-echo signal from a MERIDIAN field monitoring station — a ghost broadcast, automated, repeating telemetry from equipment that has been running unsupervised for seven years. The data it transmits is partial and corrupted. What remains is enough to triangulate the station\'s location.',
    category: 'faction',
    hint: 'Lev wants this data. The station itself may still be functional.',
    completionFlag: 'reclaimers_meridian_keycard',
  },

  {
    flag: 'found_meridian_edge_node',
    title: 'The Edge Node',
    description: 'You located a MERIDIAN network edge node — a data relay point connected to the primary facility infrastructure. The Reclaimers have been trying to find one for two cycles. What it contains depends on whether the encryption has degraded.',
    category: 'faction',
    hint: 'The Reclaimers have decryption tools. The node data may include access credentials.',
  },

  {
    flag: 'found_r1_sequencing_data',
    title: 'R1 Sequencing Data',
    description: 'The R1 sequencing data is in your possession — CHARON-7\'s genetic architecture, partial but readable, predating the public Collapse timeline by years. The Reclaimers need this to continue their antiviral research. What it proves about MERIDIAN\'s culpability is secondary to them. The science is the point.',
    category: 'discovery',
    hint: 'The R1 data unlocks a new crafting recipe: the antiviral compound. It also changes Lev\'s posture significantly.',
    completionFlag: 'discovered_archive_meridian_connection',
  },

  {
    flag: 'stacks_blueprint_found',
    title: 'Reclaimer Blueprint',
    description: 'The Reclaimers\' restricted archive contained a blueprint for an EMP device — a design capable of defeating MERIDIAN\'s automated security systems. It was locked behind access tiers for reasons the Stacks doesn\'t fully explain. Now you have it.',
    category: 'discovery',
    hint: 'The EMP blueprint can be used to craft a device from salvaged components. The electronics and mechanics requirements are significant.',
  },

  {
    flag: 'cold_storage_access_granted',
    title: 'Cold Storage Access',
    description: 'The Stacks cold storage sub-levels are open to you — the preserved pre-Collapse specimens, the sealed biological samples, and whatever else the Reclaimers have been keeping at controlled temperature for reasons they haven\'t fully explained to anyone outside the inner research team.',
    category: 'faction',
  },

  // ----------------------------------------------------------
  // Faction — The Covenant of Dusk / Lucid
  // ----------------------------------------------------------

  {
    flag: 'covenant_of_dusk_invited',
    title: 'Duskhollow Invitation',
    description: 'You received an invitation to Duskhollow — the Covenant of Dusk\'s settlement, unreachable without one. The Sanguine don\'t permit casual visitors. Someone weighed you against their usual criteria and found you worth the risk of letting inside.',
    category: 'faction',
    hint: 'Duskhollow is the only settlement where the Sanguine coexist openly with humans. Treat the invitation with the seriousness it was given.',
  },

  {
    flag: 'duskhollow_cistern_contamination_identified',
    title: 'The Cistern Device',
    description: 'Something was introduced into Duskhollow\'s water supply — a deliberate contamination, not a natural infection vector. The device was small, precise, and placed by someone who understood the settlement\'s infrastructure. The Covenant elders don\'t know who. The list of factions capable of doing this is short.',
    category: 'faction',
    hint: 'The Covenant will ask for your help identifying who placed the device. Your answer will affect your standing with them.',
    completionFlag: 'duskhollow_cistern_device_found',
  },

  {
    flag: 'elder_discussed_lucid',
    title: 'The Lucid',
    description: 'The Elder explained what the Lucid are: CHARON-7 survivors who transformed differently — neither Hollow nor Sanguine, but something third, something the MERIDIAN project files don\'t have a classification for. They live in the Deep. They are very old. The Elder has never specified how old.',
    category: 'faction',
  },

  {
    flag: 'elder_lore_tier_1',
    title: 'The Elder\'s Account',
    description: 'The Elder shared their first-level account of CHARON-7\'s origins — the parts they will tell any serious inquirer. The Collapse was not random. The first transmission vectors were deliberate. The survivor distribution in the early months followed a pattern that didn\'t match natural epidemic spread.',
    category: 'faction',
    hint: 'There is more. The Elder measures trust in increments.',
    completionFlag: 'elder_lore_tier_2',
  },

  {
    flag: 'elder_lore_tier_2',
    title: 'MERIDIAN Funding',
    description: 'The Elder confirmed what the archive implies: MERIDIAN held the funding chain for the CHARON-7 research program, insulated through three institutional layers from any government oversight. The project ran for eleven years before the release. The funding never stopped.',
    category: 'discovery',
    completionFlag: 'elder_lore_tier_3',
  },

  {
    flag: 'elder_lore_tier_3',
    title: 'File 47-B',
    description: 'The Elder knows the designer\'s name. They were an early CHARON-7 subject — volunteer batch — and read File 47-B while the fever was burning through them. The designer\'s name, the authorization chain, the original population models. The file exists in the MERIDIAN sub-facility. The Elder chose not to write this down. They have been waiting for someone to come looking.',
    category: 'main',
    hint: 'File 47-B is in the MERIDIAN sub-facility\'s deepest archive. The Elder\'s other intelligence about the facility\'s layout may tell you how to reach it.',
  },

  {
    flag: 'elder_granted_passage',
    title: 'Elder\'s Passage',
    description: 'The Elder authorized passage through Lucid-controlled territory in the Deep — an uncommon concession that the Lucid\'s outer members note and do not question. The trust this represents is real. So is what it costs if you break it.',
    category: 'faction',
  },

  {
    flag: 'vesper_shared_origin',
    title: 'Vesper\'s Origin',
    description: 'Vesper told you the truth of the Sanguine transformation — not Rook\'s political framing, not the Covenant\'s theological version, but the biological reality: what CHARON-7 does to certain genotypes, what it costs to become what Vesper is, what was lost in the process. The account was not offered lightly.',
    category: 'faction',
    hint: 'Vesper\'s trust is a resource the Red Court does not know you have. Consider carefully how you use it.',
  },

  {
    flag: 'vesper_discussed_cure',
    title: 'The Cure Question',
    description: 'Vesper engaged with the possibility of a cure — a way to arrest or reverse the Sanguine transformation. The discussion was careful, not hopeful. They didn\'t say they wanted to be cured. They said they wanted to understand if it was possible, and what it would cost, and who would bear that cost.',
    category: 'faction',
  },

  {
    flag: 'vesper_considering_forgiveness',
    title: 'Something Vesper Considers',
    description: 'There is a word Vesper used once, carefully, in the context of the humans the Covenant of Dusk feeds from. The word was forgiveness. They did not elaborate. The word is doing significant work in a conversation that ended before it could be examined.',
    category: 'personal',
  },

  {
    flag: 'vesper_peace_envoy',
    title: 'An Envoy\'s Role',
    description: 'Vesper accepted a framing that neither the Red Court nor the Covenant of Dusk would formally endorse: the possibility of contact between the Sanguine and human settlements that is not structured around the tithe system. They agreed to serve as an envoy for that possibility. Rook does not know.',
    category: 'faction',
  },

  // ----------------------------------------------------------
  // Faction — Red Court
  // ----------------------------------------------------------

  {
    flag: 'rook_offered_deal',
    title: 'Rook\'s Deal',
    description: 'Castellan Rook offered the terms of a Red Court arrangement: information for access, access for information, and safe passage through Court-controlled corridors in exchange for intelligence that benefits the Court\'s operational interests. The deal is generous in the way that only very dangerous people can afford to be generous.',
    category: 'faction',
    hint: 'The Red Court\'s safe passage is genuinely useful in the Scar approaches. The cost will become clear when Rook decides to collect.',
  },

  {
    flag: 'pens_rooks_letter_found',
    title: 'A Letter from Rook',
    description: 'A letter from Castellan Rook was found in The Pens — correspondence that was not meant to be found, addressed to someone whose name has been removed from every document in Rook\'s operation. What remains is a record of communication between the Red Court and an unknown party inside a settlement that does not know it has an inside party.',
    category: 'discovery',
    hint: 'Rook will know you found this. Whether they know before or after you present it is up to you.',
  },

  {
    flag: 'pens_rook_met_in_office',
    title: 'The Office Meeting',
    description: 'You met with Rook inside The Pens — in the private office, not the public receiving area. That distinction matters in Red Court protocol. Rook only uses that office for meetings they do not want recorded in the standard ledger.',
    category: 'faction',
  },

  {
    flag: 'player_betrayed_vesper',
    title: 'Vesper Betrayed',
    description: 'You gave Rook information about Vesper — something the Castellan can use. Vesper trusted you with it. The Red Court\'s operational capacity increases. Whatever Vesper was considering, they will not be in a position to act on it now.',
    category: 'faction',
  },

  {
    flag: 'rook_indebted',
    title: 'Rook\'s Debt',
    description: 'Castellan Rook is indebted to you — a rare position for someone who structures every interaction as a ledger entry in their favor. The debt is noted, precise, and Rook will honor it in exactly the way that costs them least. That is still more than you get from most people.',
    category: 'faction',
  },

  // ----------------------------------------------------------
  // NPC relationships & personal flags
  // ----------------------------------------------------------

  {
    flag: 'lev_trusts_player',
    title: 'Lev\'s Trust',
    description: 'Lev, the Reclaimers\' lead archivist at The Stacks, considers you trustworthy. She does not extend that classification easily or quickly. The access it grants is proportional to what she has decided you can be trusted with, which is more than she has decided about most.',
    category: 'personal',
  },

  {
    flag: 'sparks_shared_decode',
    title: 'Sparks\'s Decode',
    description: 'Sparks shared a partial decode of the MERIDIAN broadcast fragments — the sequences that don\'t match known transmission protocols. The decode is incomplete. What is legible suggests the broadcasts are not random. Someone designed them to be found by people looking for specific things.',
    category: 'discovery',
    hint: 'Sparks mentioned the Broadcaster. The transmission source and the human voice behind it may be the same person.',
  },

  {
    flag: 'sparks_knows_vane',
    title: 'Vane\'s Name',
    description: 'Sparks mentioned Director Vane — not in the public record, which has Vane as a disappeared mid-level administrator, but in the context of the MERIDIAN project\'s actual decision-making structure. Sparks is being careful about how much they say. They\'re afraid of what they know.',
    category: 'discovery',
  },

  {
    flag: 'sparks_mentioned_broadcaster',
    title: 'The Signal Source',
    description: 'Sparks connected the anomalous broadcasts to a specific transmission source in the Scar perimeter — not a relay, not automated equipment, but a person. They\'ve been tracking the signal for cycles. They wouldn\'t go toward it themselves. They told you about it anyway.',
    category: 'discovery',
    hint: 'The Broadcaster is alive and transmitting from inside the Scar perimeter. Finding them may require entering contested territory.',
  },

  {
    flag: 'has_signal_receiver',
    title: 'Signal Receiver',
    description: 'You carry a signal receiver capable of tracking the anomalous MERIDIAN-range broadcasts. Sparks built it or pointed you toward where one could be found. With it, the broadcast source can be triangulated on approach.',
    category: 'discovery',
  },

  {
    flag: 'vane_introduced',
    title: 'Director Vane',
    description: 'You met Director Vane — or whoever is presenting themselves as Director Vane inside the MERIDIAN facility. The MERIDIAN project\'s public records list Vane as dead, which is the most useful kind of status for someone who needs to keep working without interference.',
    category: 'main',
    hint: 'Vane\'s account of CHARON-7\'s design will not match the archive\'s account. Which version you believe is a decision that leads to different endings.',
  },

  {
    flag: 'vane_described_core',
    title: 'The Core Design',
    description: 'Vane described the CHARON-7 core design — the selection mechanism, the projected survivor yield, the intended outcome. The clinical precision of the description was not reassuring. They spoke about the project\'s intended future in the present tense.',
    category: 'main',
  },

  {
    flag: 'vane_explained_charon',
    title: 'Vane\'s Justification',
    description: 'Vane offered a justification for the CHARON-7 project — a rationale that the designer found sufficient, that the authorization chain accepted, that the documentation supports at its own internal logic. The argument holds together. You will need to decide whether that makes it right, wrong, or simply real.',
    category: 'main',
  },

  {
    flag: 'vane_gave_blessing',
    title: 'Vane\'s Blessing',
    description: 'Vane gave their blessing for whatever you choose to do at the terminus — a permission that you did not ask for, from an authority you do not recognize, for an action with consequences neither of you can fully predict. Vane offered it as though it meant something. You decide whether it does.',
    category: 'main',
  },

  {
    flag: 'patch_mentioned_scar',
    title: 'Patch\'s Warning',
    description: 'Patch gave you information about the Scar approaches — not a map, not a route, but a characterization of the territory and what moves through it. Patch doesn\'t give advice to people they don\'t expect to act on it. The warning means they think you\'re going.',
    category: 'personal',
    hint: 'Patch\'s route intelligence may reduce the hazard of the outer Scar approaches.',
  },

  {
    flag: 'patch_shared_northern_intel',
    title: 'Northern Intel',
    description: 'Patch shared information about the northern transit routes — where the Drifter paths run, which corridors the Accord patrols avoid, and where the terrain gives natural cover for someone moving without wanting to be seen. Specific, recent, and freely given to someone Patch has decided deserves to know.',
    category: 'personal',
  },

  {
    flag: 'howard_waived_fee',
    title: 'Howard\'s Debt',
    description: 'Howard waived the access fee — an unusual gesture from someone who tracks every transaction with absolute precision. Whatever you did to earn that exception exists outside the normal ledger. Howard will not forget it. He doesn\'t forget anything.',
    category: 'personal',
  },

  {
    flag: 'marta_fed_player',
    title: 'Marta\'s Table',
    description: 'Marta fed you without asking what you were carrying or where you were going or what you\'d done. Hospitality without conditions is rarer than almost anything you can find in the waste. You ate at her table. That\'s a thing that happened and doesn\'t need justification.',
    category: 'personal',
  },

  {
    flag: 'dell_shared_scar_intel',
    title: 'Dell\'s Information',
    description: 'Dell shared their intel on the Scar — specific, recent, operationally useful. They gathered it at some cost they didn\'t describe. The information came without stated strings. Whether that means no strings exist is a question the waste hasn\'t answered yet.',
    category: 'personal',
  },

  {
    flag: 'dell_escape_partner',
    title: 'An Understanding with Dell',
    description: 'You and Dell have an arrangement: if either of you needs to move fast and disappear, the other provides cover. It\'s the kind of agreement that only exists between people who\'ve decided the other one is worth the risk. Dell doesn\'t make that decision often.',
    category: 'personal',
  },

  {
    flag: 'osei_has_samples',
    title: 'Osei\'s Samples',
    description: 'Osei gave you biological samples — or is holding samples for you, or has agreed to process samples you\'ve collected. The nature of the samples determines what they can confirm. Osei\'s analysis methods are reliable. What the results mean is always yours to interpret.',
    category: 'discovery',
  },

  {
    flag: 'kai_nez_granted_passage',
    title: 'Kai Nez\'s Passage',
    description: 'Kai Nez granted you passage through a controlled point — a concession that cost them something in terms of their arrangement with whoever controls that approach. They gave it because they calculated it was worth it. That calculation included you.',
    category: 'personal',
  },

  {
    flag: 'wren_respects_player',
    title: 'Wren\'s Respect',
    description: 'Wren said — without elaboration, which is how Wren says everything important — that they respect you. In the world the waste has built, this is not a small thing from Wren specifically. The word carries weight in proportion to how rarely they use it.',
    category: 'personal',
  },

  {
    flag: 'wren_indebted',
    title: 'Wren\'s Debt',
    description: 'Wren owes you something. They know it. You know it. The nature of the debt means it will be paid in kind — not money, not equipment, but the particular currency Wren has access to, which is judgment about where danger is and how to move through it anyway.',
    category: 'personal',
  },

  {
    flag: 'shepherd_shared_routes',
    title: 'Shepherd Routes',
    description: 'The Shepherd shared the Pine Sea safe routes — the trails and waypoints their people use to move between the trees without being tracked. These are paths that have kept communities alive for cycles by being unknown to everyone except those who need to use them.',
    category: 'faction',
    hint: 'The Pine Sea routes provide safe passage through territory that would otherwise require significant resource expenditure.',
  },

  {
    flag: 'shepherd_hermit_met',
    title: 'The Hermit',
    description: 'You found and spoke with the hermit in the Pine Sea — the person the Shepherd communities know about but don\'t visit. They have been alone in those trees for a very long time. What they told you is information that could only come from someone who has watched the world from a distance long enough to understand what they\'re seeing.',
    category: 'discovery',
  },

  {
    flag: 'shepherd_trust_earned',
    title: 'Shepherd Trust',
    description: 'The Shepherd communities consider you trustworthy — a category distinct from allied or aligned. Trustworthy means they will help you with things that cost them something, which is different from simply not opposing you.',
    category: 'faction',
  },

  // ----------------------------------------------------------
  // Discovery — environmental / investigative
  // ----------------------------------------------------------

  {
    flag: 'found_meridian_office_directory',
    title: 'MERIDIAN Directory',
    description: 'The Stacks archive contained a partial MERIDIAN office directory — names, access levels, departmental assignments. Most of the names are dead. Some aren\'t. The access levels still reflect the original authorization hierarchy, which means some of those names still have operational permissions inside the facility.',
    category: 'discovery',
  },

  {
    flag: 'found_cdc_encrypted_files',
    title: 'Encrypted Files',
    description: 'You found encrypted CDC files in the Stacks archive — pre-Collapse public health records that someone took significant effort to classify and restrict after the fact. The encryption is not MERIDIAN-standard. Someone outside MERIDIAN wanted these unavailable.',
    category: 'discovery',
    hint: 'Sparks or Lev may be able to assist with decryption. What the files contain may require context from other sources to interpret.',
  },

  {
    flag: 'found_charon_ethics_proceedings',
    title: 'The Ethics Proceedings',
    description: 'The Stacks archive held partial records of an internal ethics review of the CHARON-7 research program — a review that was conducted, completed, and then administratively buried. The findings have been redacted. The vote count at the bottom has not. The margin against proceeding was seven to one.',
    category: 'discovery',
  },

  {
    flag: 'found_meridian_building_permit',
    title: 'The Scar Construction Record',
    description: 'The MERIDIAN construction permit for the Scar sub-facility predates the recorded founding of MERIDIAN as an institution by four years. The facility was being built before the organization that built it officially existed.',
    category: 'discovery',
  },

  {
    flag: 'meridian_archive_accessed',
    title: 'Archive Access',
    description: 'You accessed the Covenant\'s preserved archive — materials the Covenant of Dusk has been quietly holding since the first cycle, cross-referencing against their own records of the Collapse timeline. What they\'ve assembled doesn\'t match the public record in several important ways.',
    category: 'discovery',
  },

  {
    flag: 'sc_briggs_meridian_revelation',
    title: 'Briggs and MERIDIAN',
    description: 'Something was revealed about Briggs\'s connection to MERIDIAN — a relationship that predates the Salters\' current posture toward the facility. The Salters have not been passive survivors of the Collapse. They have been participants in its aftermath in a way that implicates decisions made before the release.',
    category: 'discovery',
    hint: 'The Accord doesn\'t know this. Cross might change her calculation about the Salter backing if she did.',
  },

  {
    flag: 'sc_prisoner_intel',
    title: 'Prisoner Intelligence',
    description: 'A prisoner at Salt Creek provided intelligence about MERIDIAN operations — information gathered under conditions that suggest the prisoner was close enough to the project to know what they\'re describing. Whether they were a subject, an operative, or something else is unclear. The information itself is specific and consistent with other sources.',
    category: 'discovery',
  },

  {
    flag: 'duskhollow_tithe_arrears_seen',
    title: 'The Tithe Ledger',
    description: 'You saw the tithe arrears documentation in Duskhollow — the record of settlements that are behind on their Red Court obligations. The list is longer than the Court\'s official statements suggest. Several settlements on it are also on the Accord\'s list of allied communities. The Accord doesn\'t know they\'re paying the tithe.',
    category: 'discovery',
  },

  {
    flag: 'duskhollow_rim_hollow_pattern_seen',
    title: 'Hollow Distribution Pattern',
    description: 'The Hollow activity pattern along Duskhollow\'s rim doesn\'t follow the usual drift behavior — the movement is directional, consistent, and timed. Something is directing them. Whether it\'s the Sanguine, MERIDIAN infrastructure, or something else is a question the pattern doesn\'t answer.',
    category: 'discovery',
    hint: 'The Reclaimers would want this data. So would Cross, for different reasons.',
  },

  {
    flag: 'duskhollow_kindling_cell_maps_read',
    title: 'Kindling Cell Maps',
    description: 'Documents in Duskhollow described a Kindling cell operating inside the Covenant\'s territory — not hostile, but present and mapping. The Covenant knows about the cell. They\'ve decided to tolerate it for reasons they haven\'t made explicit. The maps the cell produced are detailed.',
    category: 'discovery',
  },

  {
    flag: 'duskhollow_kindling_market_drops_seen',
    title: 'Market Intelligence',
    description: 'The Kindling are using Duskhollow\'s night market as an information exchange — drops, pickups, and coded items that look like trade goods. It\'s been running for at least one cycle. The Covenant\'s tolerance of the Kindling cell suddenly makes more sense as a mutual arrangement.',
    category: 'discovery',
  },

  {
    flag: 'cv_overflow_refugees_noted',
    title: 'The Overflow Camp',
    description: 'Outside the Covenant\'s walls, a population that doesn\'t make it into the settlement proper has assembled in the overflow camp — people the Covenant has assessed and found insufficient for admission. The criteria aren\'t published. The camp keeps growing. It is not comfortable to look at.',
    category: 'discovery',
  },

]

export function getQuestEntries(
  questFlags: Record<string, unknown>
): { active: QuestEntry[]; completed: QuestEntry[] } {
  const active: QuestEntry[] = []
  const completed: QuestEntry[] = []

  for (const entry of QUEST_DESCRIPTIONS) {
    if (!questFlags[entry.flag]) continue

    if (entry.completionFlag && questFlags[entry.completionFlag]) {
      completed.push(entry)
    } else {
      active.push(entry)
    }
  }

  return { active, completed }
}
