// ============================================================
// data/narrativeKeys/keys_by_zone.ts
// Convoy: remnant-narrative-0329 — Rider E (Discovery & Mystery)
//
// 30 narrative key definitions across all 13 zones.
// Pure data — no imports from lib, no side effects.
//
// Each key:
//   id:          unique identifier
//   zone:        relevant zone
//   description: player-facing journal entry
//   learnedVia:  'dialogue' | 'examination' | 'deduction'
//   sourceHint:  narrative hint for players who haven't learned it
//   unlocks:     what room/exit/dialogue this enables
//
// Note: 'unlocks' is a string description for journal display.
// The actual gate enforcement lives in lib/narrativeKeys.ts
// ROOM_EXIT_GATES registry.
// ============================================================

import type { NarrativeKey } from '@/types/convoy-contracts'
import type { ZoneType } from '@/types/game'

// ============================================================
// Extended key type with zone and unlock metadata
// ============================================================

export interface NarrativeKeyEntry extends NarrativeKey {
  zone: ZoneType
  sourceHint: string
  unlocks: string
}

// ============================================================
// CROSSROADS KEYS
// ============================================================

const CROSSROADS_KEYS: NarrativeKeyEntry[] = [
  {
    id: 'crossroads_hidden_cellar',
    zone: 'crossroads',
    learnedVia: 'deduction',
    description:
      'You know about the hidden storage cellar beneath the market' +
      ' stalls — the old Drifter cache that predates the Crossroads' +
      ' settlement itself. Marta told you where to press.',
    sourceHint:
      'Marta has been at this market since before the Crossroads was' +
      ' the Crossroads. She remembers what was here before the stalls,' +
      ' and why certain parts of the floor sound different.',
    unlocks:
      'The hidden cellar entrance beneath the market stall foundation.',
    sourceNpcId: 'marta_food_vendor',
  },
  {
    id: 'crossroads_guard_rotation',
    zone: 'crossroads',
    learnedVia: 'examination',
    description:
      'You have mapped the gate guard rotation — the exact schedule,' +
      ' the gap between the second and third shift change, and the' +
      ' fifteen minutes when the north approach is unwatched.',
    sourceHint:
      'The gate guards rotate on a schedule. Anyone who has spent' +
      ' enough time watching the gate would notice the pattern.' +
      ' Talk to the guards at different times of day.',
    unlocks:
      'Dialogue branch with gate guards revealing the Accord\'s' +
      ' internal security assessment.',
  },
  {
    id: 'crossroads_signal_source',
    zone: 'crossroads',
    learnedVia: 'dialogue',
    description:
      "Sparks's radio frequency — the exact bandwidth of the MERIDIAN" +
      " signal. Not just that a signal exists, but the specific" +
      " frequency encoded in the interval variations.",
    sourceHint:
      'Sparks has been tracking a signal for three hundred hours.' +
      ' They have decoded forty percent of it. The source is the Scar.' +
      ' They need someone to go verify it.',
    unlocks:
      "The MERIDIAN decontamination chamber access — the frequency" +
      " acts as an authentication tone for the facility's systems.",
    sourceNpcId: 'sparks_radio',
  },
]

// ============================================================
// RIVER ROAD KEYS
// ============================================================

const RIVER_ROAD_KEYS: NarrativeKeyEntry[] = [
  {
    id: 'river_road_submerged_cache',
    zone: 'river_road',
    learnedVia: 'dialogue',
    description:
      "Howard knows where the river's current deposits things." +
      ' He has been watching this river since 2032. He told you' +
      ' the exact location of the submerged Drifter supply cache.',
    sourceHint:
      "The bridge keeper has watched everything that moves through" +
      " this river for years. He knows the current's behavior" +
      " and what it carries downstream.",
    unlocks:
      'The submerged supply cache on the west bank.',
    sourceNpcId: 'howard_bridge_keeper',
  },
  {
    id: 'river_road_northern_movement',
    zone: 'river_road',
    learnedVia: 'dialogue',
    description:
      'The Accord sentry reported Hollow movement north of the old' +
      ' campsite. Not random movement — a pattern. Something is' +
      ' drawing them toward the Pine Sea treeline.',
    sourceHint:
      'The Accord patrols the River Road as far as the bridge.' +
      ' Their sentries see what moves through the valley. The ones' +
      ' who come in from the north route have noticed something.',
    unlocks:
      'Dialogue branch with the Pine Sea contacts about what' +
      ' is drawing Hollow toward the forest edge.',
  },
]

// ============================================================
// THE STACKS KEYS
// ============================================================

const STACKS_KEYS: NarrativeKeyEntry[] = [
  {
    id: 'stacks_terminal_password',
    zone: 'the_stacks',
    learnedVia: 'examination',
    description:
      "Lev's research notes contain the MERIDIAN terminal passphrase." +
      " It wasn't a password — it was a name. The name of the" +
      " project lead. The one who stayed behind.",
    sourceHint:
      "Lev has been tracking the Revenant phenomenon since Cycle 2." +
      " Their research notes are organized in a system only they" +
      " understand, but the terminal authentication data is in there.",
    unlocks:
      "The Stacks server room terminal — unlocks the full CHARON-7" +
      " research archive and MERIDIAN personnel records.",
    sourceNpcId: 'lev',
  },
  {
    id: 'stacks_server_room_bypass',
    zone: 'the_stacks',
    learnedVia: 'deduction',
    description:
      'The maintenance panel bypass sequence — you worked out the' +
      ' connector logic from the labeled ports and the facility\'s' +
      ' engineering documentation. Five-step sequence.',
    sourceHint:
      'The maintenance panel has labeled connector ports. The' +
      ' engineering spec is somewhere in the facility — the Reclaimers' +
      ' document everything. A mechanic who reads the docs would' +
      ' find the override sequence.',
    unlocks:
      'The server room cold storage area — contains the original' +
      ' MERIDIAN project documentation.',
  },
  {
    id: 'stacks_revenant_data',
    zone: 'the_stacks',
    learnedVia: 'dialogue',
    description:
      "Lev's dataset on Revenant cycle patterns. The skill retention" +
      " curves, the death-specific memory degradation, the scar" +
      " accumulation rate. You are not alone. You are not the first.",
    sourceHint:
      "Lev has been watching Revenants across multiple cycles." +
      " They have a dataset. They have been waiting for someone" +
      " specific enough to share it with.",
    unlocks:
      "Act II dialogue branch with Lev — the full CHARON-7 theory" +
      " and what MERIDIAN was actually designed to do.",
    sourceNpcId: 'lev',
  },
]

// ============================================================
// THE SCAR / MERIDIAN KEYS
// ============================================================

const SCAR_KEYS: NarrativeKeyEntry[] = [
  {
    id: 'meridian_decon_code',
    zone: 'the_scar',
    learnedVia: 'deduction',
    description:
      "Sparks's radio frequency combined with Lev's MERIDIAN interval" +
      " data gives you the decontamination chamber access code." +
      " The facility used audio authentication. It still does.",
    sourceHint:
      'The MERIDIAN decontamination system uses audio-frequency' +
      ' authentication. Two data sources combine: the radio signal' +
      ' frequency and the interval encoding from the Stacks research.',
    unlocks:
      "The MERIDIAN facility's decontamination chamber — required" +
      " to access the lower levels without contamination exposure.",
  },
  {
    id: 'meridian_sub_level_access',
    zone: 'the_scar',
    learnedVia: 'examination',
    description:
      "The Shepherd's logbook in the Pine Sea logger's cabin contained" +
      " a maintenance entry for the MERIDIAN sub-level access reader." +
      " They serviced it in 2033. The log entry number is the key.",
    sourceHint:
      "Someone maintained the MERIDIAN facility from outside during" +
      " the years after the bombing. The Pine Sea routes were used." +
      " The Shepherd's logbook covers that period.",
    unlocks:
      "The MERIDIAN sub-level — the facility's original research" +
      " floors and the CHARON-7 source containment chambers.",
    sourceNpcId: 'shepherd_hermit',
  },
  {
    id: 'scar_command_level',
    zone: 'the_scar',
    learnedVia: 'examination',
    description:
      "The MERIDIAN personnel file lists the command level" +
      " authorization by project lead name. The authorization" +
      " system still recognizes it. The name was never revoked.",
    sourceHint:
      "The MERIDIAN command level uses personnel authorization." +
      " The system was never reset after the bombing." +
      " The personnel file would list the authorized names.",
    unlocks:
      "The MERIDIAN command level — contains the original project" +
      " orders and the military authorization for the bombing.",
  },
  {
    id: 'scar_bombing_truth',
    zone: 'the_scar',
    learnedVia: 'deduction',
    description:
      'The military strike order was calibrated for surface destruction' +
      ' only — the hardened facility was always going to survive.' +
      ' Whoever ordered the bombing knew what they were preserving.',
    sourceHint:
      "You are standing in the crater. The facility is intact." +
      " The standard narrative doesn't survive contact with the evidence.",
    unlocks:
      "Act III dialogue branch with Warlord Briggs — the direct" +
      " confrontation about who gave the bombing order and why.",
  },
]

// ============================================================
// THE EMBER / KINDLING KEYS
// ============================================================

const EMBER_KEYS: NarrativeKeyEntry[] = [
  {
    id: 'ember_tunnel_entrance',
    zone: 'the_ember',
    learnedVia: 'dialogue',
    description:
      "Avery told you where the Kindling's tunnel system begins." +
      " Third panel from the eastern corner of the chapel." +
      " They told you why the Kindling built it. That part matters too.",
    sourceHint:
      'A Kindling member with private doubts has been watching the' +
      ' settlement from its edges. They know where things lead.' +
      ' They have been waiting for someone they could trust with it.',
    unlocks:
      'The Kindling tunnel system — connects the Ember to the' +
      ' incinerator room through a route that predates the settlement.',
    sourceNpcId: 'kindling_doubter_avery',
  },
  {
    id: 'ember_incinerator_truth',
    zone: 'the_ember',
    learnedVia: 'deduction',
    description:
      'The incinerator room examination plus Avery\'s account' +
      ' contradicts Harrow\'s statement that the incinerators were' +
      ' never used on people. The physical evidence does not support' +
      ' Harrow\'s version.',
    sourceHint:
      'The incinerator room contains physical evidence.' +
      ' Harrow says it was never used on people.' +
      ' Avery says something different. The room will resolve the question.',
    unlocks:
      "Act II contradiction resolution — confronting Harrow with" +
      " the evidence unlocks his true account of the Kindling's history.",
  },
]

// ============================================================
// THE PENS KEYS
// ============================================================

const PENS_KEYS: NarrativeKeyEntry[] = [
  {
    id: 'pens_ward_c',
    zone: 'the_pens',
    learnedVia: 'examination',
    description:
      'You know what the red wristband means. The classification' +
      ' system at the Pens has a tier the intake clerks do not' +
      ' mention. Ward C is not on the public map.',
    sourceHint:
      'The wristband color system has a tier that the intake' +
      ' process does not explain. Someone who survived Ward B' +
      ' and came back out would know about Ward C.',
    unlocks:
      "Ward C — the Pens' restricted wing, where the Covenant's" +
      " arrangement with the Red Court is most visible.",
  },
  {
    id: 'pens_covenant_arrangement',
    zone: 'the_pens',
    learnedVia: 'dialogue',
    description:
      "The Red Court's arrangement with the Covenant of Dusk is not" +
      " a partnership. The Pens supply the Covenant with non-voluntary" +
      " donors classified as Ward C. Vesper either knows or chooses not to.",
    sourceHint:
      'The relationship between the Red Court and the Covenant has' +
      ' terms that neither side announces publicly. The Pens records' +
      ' room contains the transfer documentation.',
    unlocks:
      'Contradiction evidence: the Covenant arrangement contradicts' +
      " Vesper's claim that the blood tithe is always voluntary.",
  },
]

// ============================================================
// THE DEEP KEYS
// ============================================================

const DEEP_KEYS: NarrativeKeyEntry[] = [
  {
    id: 'deep_pool_passage',
    zone: 'the_deep',
    learnedVia: 'dialogue',
    description:
      "Dr. Osei's chemical marker notation gives you the safe path" +
      " through the bioluminescent pool chamber. The markers are" +
      " contamination indicators, not decoration. She wrote the guide.",
    sourceHint:
      "A virologist who works with CHARON-7 samples would understand" +
      " what the chemical markers at the cave mouth mean and how to" +
      " read them safely.",
    unlocks:
      'The Deep Pool passage — the bioluminescent chamber leads to' +
      ' the underground river system and the CHARON-7 groundwater source.',
    sourceNpcId: 'dr_ama_osei',
  },
  {
    id: 'deep_algae_connection',
    zone: 'the_deep',
    learnedVia: 'deduction',
    description:
      'The Deep Pool bioluminescence is the same CHARON-7 expression' +
      ' as the crater floor glow at the Scar. The virus is in the' +
      ' groundwater. The contamination radius was never what they said.',
    sourceHint:
      'The bioluminescent algae in the Deep Pool has a specific' +
      ' quality. You have seen that exact quality somewhere else,' +
      ' or you will.',
    unlocks:
      "The sequential discovery chain connecting the Deep Pool" +
      " to the Scar crater — the full contamination map.",
  },
]

// ============================================================
// COVENANT KEYS
// ============================================================

const COVENANT_KEYS: NarrativeKeyEntry[] = [
  {
    id: 'covenant_archive_room',
    zone: 'covenant',
    learnedVia: 'deduction',
    description:
      "Marshal Cross's archive cipher is her dead daughter's" +
      " birthdate. You learned this through the Accord's personal" +
      " records. You did not want to need to know it.",
    sourceHint:
      "Marshal Cross keeps records. The archive cipher is personal" +
      " rather than procedural. Cross has been carrying something" +
      " for years. Someone she trusted would know what it was.",
    unlocks:
      "The Accord archive room — contains Cross's intelligence on" +
      " the MERIDIAN bombing chain of command.",
    sourceNpcId: 'marshal_cross',
  },
  {
    id: 'covenant_accord_intelligence',
    zone: 'covenant',
    learnedVia: 'examination',
    description:
      'The Accord has been tracking the MERIDIAN signal independently.' +
      ' Cross knows more about the Scar than she has said. The' +
      ' archive contains her assessment and why she has kept it quiet.',
    sourceHint:
      'Cross did not become Marshal by missing things. She knows' +
      ' about the Scar. The question is what she is waiting for' +
      ' before she acts on it.',
    unlocks:
      "Act II dialogue branch with Marshal Cross — the true" +
      " scope of Accord intelligence on MERIDIAN.",
    sourceNpcId: 'marshal_cross',
  },
]

// ============================================================
// SALT CREEK KEYS
// ============================================================

const SALT_CREEK_KEYS: NarrativeKeyEntry[] = [
  {
    id: 'salt_creek_command_bunker',
    zone: 'salt_creek',
    learnedVia: 'dialogue',
    description:
      "Briggs's bunker override is the date MERIDIAN went dark." +
      " He has been carrying it for seven years. He did not" +
      " give it to you voluntarily.",
    sourceHint:
      "Briggs knows more about MERIDIAN than he says. He was there." +
      " The bunker access is secured with something personal." +
      " Personal to a person who was present.",
    unlocks:
      "The Salt Creek command bunker — Salter operational planning" +
      " for the Scar approach and what Briggs actually ordered.",
    sourceNpcId: 'warlord_briggs',
  },
  {
    id: 'meridian_bombing_orders',
    zone: 'salt_creek',
    learnedVia: 'examination',
    description:
      'The actual military order authorizing the MERIDIAN strike.' +
      ' Found in the Scar facility command level. The order is signed.' +
      ' The reasoning given is not the reasoning that was used.',
    sourceHint:
      'The bombing was ordered by someone. Orders exist on paper.' +
      ' The command level of the MERIDIAN facility would have' +
      ' received and retained the original authorization.',
    unlocks:
      "Contradiction resolution: Briggs says the bombing was" +
      " necessary. Cross says it was Briggs's idea alone." +
      " The order resolves who is telling which version.",
  },
]

// ============================================================
// DUSKHOLLOW KEYS
// ============================================================

const DUSKHOLLOW_KEYS: NarrativeKeyEntry[] = [
  {
    id: 'duskhollow_tithe_records',
    zone: 'duskhollow',
    learnedVia: 'examination',
    description:
      "Vesper's tithe ledger records every intake and outflow." +
      " The voluntary intake numbers and the Ward C transfer numbers" +
      " have never matched. The discrepancy is consistent and documented.",
    sourceHint:
      "Vesper keeps a tithe ledger. She is thorough. The Covenant" +
      " of Dusk is documented. What the documentation shows is" +
      " a different question from what it is supposed to show.",
    unlocks:
      "The Duskhollow records room — Covenant financial and" +
      " intake records for the past four cycles.",
    sourceNpcId: 'vesper',
  },
  {
    id: 'covenant_coercion_evidence',
    zone: 'duskhollow',
    learnedVia: 'deduction',
    description:
      'A letter found in the Pens: a Ward C intake from the Covenant' +
      " referral program, written by the intake subject themselves." +
      " The word voluntary does not appear in it.",
    sourceHint:
      "Vesper says the Covenant feeds voluntarily. Avery's account" +
      " at the Pens says otherwise. The Pens contains documentation." +
      " Documentation from inside is harder to dismiss.",
    unlocks:
      "Contradiction resolution: Vesper's claim of voluntary" +
      " arrangement versus the Pens letter evidence.",
    sourceNpcId: 'vesper',
  },
]

// ============================================================
// THE BREAKS KEYS
// ============================================================

const BREAKS_KEYS: NarrativeKeyEntry[] = [
  {
    id: 'breaks_elder_passage',
    zone: 'the_breaks',
    learnedVia: 'dialogue',
    description:
      "Elder Kai Nez's survey notation — pre-Collapse topographic" +
      " knowledge of the canyon passage that no modern map shows." +
      " The Elder reads the land better than the land reads itself.",
    sourceHint:
      "The Elder has been in the Breaks long enough to know it as" +
      " it was before the Collapse. Some routes were deliberately" +
      " removed from public maps. He knows where they are.",
    unlocks:
      'The canyon upper passage — a route through the Breaks that' +
      ' bypasses the Red Court patrol zone entirely.',
    sourceNpcId: 'elder_kai_nez',
  },
  {
    id: 'breaks_red_court_operation',
    zone: 'the_breaks',
    learnedVia: 'examination',
    description:
      "The Wren's covered map shows the Red Court's current sweep" +
      " pattern in the Breaks. Not a static patrol — a systematic" +
      " search for something specific.",
    sourceHint:
      "The Wren is not just hunting strays in the Breaks. He is" +
      " looking for something. The map he covered when you approached" +
      " is the evidence of what.",
    unlocks:
      "Dialogue branch with The Wren — what the Red Court is" +
      " actually searching for in the lower canyon.",
    sourceNpcId: 'the_wren',
  },
]

// ============================================================
// THE PINE SEA KEYS
// ============================================================

const PINE_SEA_KEYS: NarrativeKeyEntry[] = [
  {
    id: 'pine_sea_shepherd_trail',
    zone: 'the_pine_sea',
    learnedVia: 'dialogue',
    description:
      "The Shepherd's trail markers — hidden in bark notches and" +
      " stone arrangements throughout the Pine Sea. Once you know" +
      " what you are looking for, the path becomes visible.",
    sourceHint:
      "The Shepherd has walked this forest for years. The trail" +
      " markings are theirs. No one else reads the bark notches" +
      " and stone arrangements the same way.",
    unlocks:
      'The deep wood trail — a route through the Pine Sea that' +
      ' reaches the Scar overlook without crossing Red Court territory.',
    sourceNpcId: 'shepherd_hermit',
  },
  {
    id: 'meridian_maintenance_history',
    zone: 'the_pine_sea',
    learnedVia: 'examination',
    description:
      "The logger's cabin logbook shows maintenance entries for" +
      " MERIDIAN sub-systems over seven years. Someone has been" +
      " keeping the facility running from the outside. That someone" +
      " used the Pine Sea routes.",
    sourceHint:
      "The logger's cabin in the Pine Sea has been used as a" +
      " waystation. The logbook covers a long period." +
      " The MERIDIAN sub-level entries are not what you expect.",
    unlocks:
      "The MERIDIAN sub-level access — combines with the Shepherd's" +
      " logbook entry to authenticate at the sub-level reader.",
    sourceNpcId: 'shepherd_hermit',
  },
]

// ============================================================
// THE DUST KEYS
// ============================================================

const DUST_KEYS: NarrativeKeyEntry[] = [
  {
    id: 'dust_caravan_cache',
    zone: 'the_dust',
    learnedVia: 'dialogue',
    description:
      "Drifter caravan notation — the campfire storyteller taught" +
      " you to read the old trail markers. The cache buried under" +
      " the dead camp sign has been there since before the Collapse.",
    sourceHint:
      "The campfire storyteller at Crossroads grew up with Drifter" +
      " trail notation. It is not widely read anymore. The markers" +
      " are still out there. Someone who knows them can find things" +
      " others walk past.",
    unlocks:
      "The Dust caravan cache — pre-Collapse supply depot with" +
      " gear and a Drifter intelligence brief on the western approach.",
  },
  {
    id: 'dust_western_approach',
    zone: 'the_dust',
    learnedVia: 'deduction',
    description:
      'The heat shimmer in the western Dust is directional — not' +
      ' atmospheric distortion but something burning below ground.' +
      ' A CHARON-7 seep point. The contamination is not from the Scar.',
    sourceHint:
      'The Dust has its own anomalies. A thorough scavenger with' +
      ' the right knowledge would notice that the heat pattern' +
      ' in the western flats does not behave like weather.',
    unlocks:
      "Discovery chain connecting the Dust seep to the groundwater" +
      " contamination map — the virus spread further west than anyone reported.",
  },
]

// ============================================================
// Full export: all keys indexed by id and grouped by zone
// ============================================================

export const NARRATIVE_KEYS_BY_ZONE: Record<string, NarrativeKeyEntry[]> = {
  crossroads: CROSSROADS_KEYS,
  river_road: RIVER_ROAD_KEYS,
  the_stacks: STACKS_KEYS,
  the_scar: SCAR_KEYS,
  the_ember: EMBER_KEYS,
  the_pens: PENS_KEYS,
  the_deep: DEEP_KEYS,
  covenant: COVENANT_KEYS,
  salt_creek: SALT_CREEK_KEYS,
  duskhollow: DUSKHOLLOW_KEYS,
  the_breaks: BREAKS_KEYS,
  the_pine_sea: PINE_SEA_KEYS,
  the_dust: DUST_KEYS,
}

/**
 * Flat lookup map: keyId -> NarrativeKeyEntry.
 * Exported for runtime lookups from lib/narrativeKeys.ts.
 */
export const NARRATIVE_KEY_INDEX: Record<string, NarrativeKeyEntry> =
  Object.values(NARRATIVE_KEYS_BY_ZONE)
    .flat()
    .reduce<Record<string, NarrativeKeyEntry>>((acc, key) => {
      acc[key.id] = key
      return acc
    }, {})

/**
 * Flat array of all keys — for iteration and validation.
 */
export const ALL_NARRATIVE_KEYS: NarrativeKeyEntry[] =
  Object.values(NARRATIVE_KEYS_BY_ZONE).flat()
