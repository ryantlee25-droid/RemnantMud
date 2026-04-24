// ============================================================
// data/dialogueTrees.ts — Branching dialogue trees for NPCs
// NPCs with an entry here use the tree system instead of flat topics.
// ============================================================

import type { DialogueTree } from '@/types/game'
import { rt } from '@/lib/richText'

// ------------------------------------------------------------
// LEV — Reclaimers Researcher (The Stacks)
// dialogueTree IDs: 'lev_entry_hall', 'lev_office_quest'
// Both reference the same tree; the room spawn picks the ID.
// ------------------------------------------------------------

const levTree: DialogueTree = {
  npcId: 'lev',
  startNode: 'lev_start',
  nodes: {
    // ---- Root ----
    lev_start: {
      id: 'lev_start',
      speaker: 'Lev',
      text: `${rt.npc('Lev')} looks up from a tablet, eyes already cataloguing you. "You're back. Cycle count consistent with projections — memory degradation within expected parameters." A pause. "That was clinical. I'm aware. Sit down if you have questions."`,
      branches: [
        // ---- Echo branches (cycle 2+) ----
        {
          label: '"You gave me the keycard last time. I brought back your data."',
          targetNode: 'lev_echo_trusted',
          requiresCycleMin: 2,
          requiresPreviousRelationship: { npcId: 'lev', relationship: 'trusted' },
        },
        {
          label: '"We\'ve done this before, Lev."',
          targetNode: 'lev_echo_distrusted',
          requiresCycleMin: 2,
          requiresPreviousRelationship: { npcId: 'lev', relationship: 'distrusted' },
        },
        // ---- Standard branches ----
        {
          label: `Ask about ${rt.keyword('CHARON-7')} research`,
          targetNode: 'lev_charon',
        },
        {
          label: `Ask about ${rt.keyword('MERIDIAN')}`,
          targetNode: 'lev_meridian',
        },
        {
          label: `Ask about the ${rt.item('MERIDIAN Keycard')}`,
          targetNode: 'lev_keycard_gate',
          requiresFlag: 'found_r1_sequencing_data',
        },
        {
          label: `Ask about the ${rt.item('MERIDIAN Keycard')}`,
          targetNode: 'lev_keycard_gate',
          requiresFlag: 'discovered_field_station_echo',
        },
        {
          label: '"I should go."',
          targetNode: 'lev_leave',
        },
      ],
    },

    // ---- Echo: Trusted (cycle 2+) ----
    lev_echo_trusted: {
      id: 'lev_echo_trusted',
      speaker: 'Lev',
      text: `${rt.npc('Lev')}'s hands go still on the tablet. For a fraction of a second something crosses their face — not surprise, recognition. The clinical mask slips and underneath it is a person who remembers. "You're back. I remember the data. The viable samples, the sequencing work — you brought it all." They open the desk drawer without hesitation. The ${rt.item('MERIDIAN Keycard')} is already in their hand. "Skip the formalities. You've earned this twice over. I don't need to test someone who already passed." A pause. "That sounded like sentiment. It was data-driven sentiment. There's a difference."`,
      onEnter: {
        setFlag: { reclaimers_meridian_keycard: true, lev_trusts_player: true, lev_echo_acknowledged: true },
        grantItem: ['meridian_keycard'],
        grantRep: { faction: 'reclaimers', delta: 1 },
      },
      branches: [
        {
          label: '"Thank you, Lev. I\'ll bring back more this time."',
          targetNode: 'lev_keycard_end',
        },
      ],
    },

    // ---- Echo: Distrusted (cycle 2+) ----
    lev_echo_distrusted: {
      id: 'lev_echo_distrusted',
      speaker: 'Lev',
      text: `${rt.npc('Lev')}'s expression hardens — the clinical detachment sharpening into something with edges. "You again." They don't open the drawer. "Last time you took the keycard and I received nothing. No data. No samples. No professional courtesy." They adjust the tablet, not looking at you. "The keycard costs trust you haven't earned. Twice." A deliberate silence. "The field station east of the Stacks — two kilometers past the reading room exit, follow the old access road through the industrial district. There were sequencing records there — R-8 integration data. If any survived, bring me what you find. Not a promise. Physical evidence. Then we discuss access."`,
      onEnter: {
        setFlag: 'lev_echo_acknowledged',
      },
      branches: [
        {
          label: `[Lore DC 16] "I know what happened in the lower wing. Let me explain."`,
          targetNode: 'lev_keycard_lore_success',
          skillCheck: { skill: 'lore', dc: 16 },
          failNode: 'lev_keycard_fail',
        },
        {
          label: '"I understand. I\'ll find the sample."',
          targetNode: 'lev_leave',
        },
      ],
    },

    // ---- Branch 1: CHARON-7 Research ----
    lev_charon: {
      id: 'lev_charon',
      speaker: 'Lev',
      text: `"${rt.keyword('CHARON-7')} is a synthetic retrovirus — protein shell mimicking endogenous cellular machinery. It integrates, rewrites the host genome in situ. ${rt.keyword('Hollow')} are the failure state. ${rt.keyword('Sanguine')} are the success state." ${rt.npc('Lev')} taps the tablet once. "Revenants are the unpredicted third outcome. That's you."`,
      branches: [
        {
          label: `"What's the difference between R-1 and R-8 strains?"`,
          targetNode: 'lev_charon_strains',
        },
        {
          label: 'Back to other topics.',
          targetNode: 'lev_start',
        },
      ],
    },

    lev_charon_strains: {
      id: 'lev_charon_strains',
      speaker: 'Lev',
      text: `${rt.npc('Lev')}'s hands go still. "R-1 was the intended product — controlled augmentation. The ${rt.keyword('Sanguine')} expression. R-8 was the accident. It emerged during unauthorized trials. The integration looks cleaner under a microscope, but cleaner degradation is still degradation. The ${rt.keyword('Hollow')} were never supposed to exist." A breath. "The data is what it is. I don't editorialize."`,
      branches: [
        {
          label: 'Back to other topics.',
          targetNode: 'lev_start',
        },
      ],
    },

    // ---- Branch 2: MERIDIAN ----
    lev_meridian: {
      id: 'lev_meridian',
      speaker: 'Lev',
      text: `"${rt.keyword('MERIDIAN')} BioSystems. DOD acquisition 2028, officially dissolved 2031. 'Dissolved' is inaccurate — relocated underground." ${rt.npc('Lev')} pulls out an annotated diagram. "The sub-reservoir facility is still thermally active. Seven years after the bombing. My documentation has structured gaps — redactions at precise intervals suggesting intentional information denial."`,
      branches: [
        {
          label: `"What about the broadcaster?"`,
          targetNode: 'lev_meridian_broadcaster',
          requiresFlag: 'patch_mentioned_scar',
        },
        {
          label: 'Back to other topics.',
          targetNode: 'lev_start',
        },
      ],
    },

    lev_meridian_broadcaster: {
      id: 'lev_meridian_broadcaster',
      speaker: 'Lev',
      text: `${rt.npc('Lev')} sets the diagram down carefully. "The signal. Twelve-word repeating loop, shortwave. Pattern variation is inconsistent with automation — someone is modulating it." They meet your eyes. "Forty meters below the crater floor. The Reclaimers have triangulated the source. Whether someone is alive down there or something is mimicking alive — that distinction matters." They clear their throat. "Operationally, I mean."`,
      onEnter: {
        setFlag: 'lev_discussed_meridian',
      },
      branches: [
        {
          label: 'Back to other topics.',
          targetNode: 'lev_start',
        },
      ],
    },

    // ---- Branch 3: Keycard (story-critical) ----
    lev_keycard_gate: {
      id: 'lev_keycard_gate',
      speaker: 'Lev',
      text: `${rt.npc('Lev')}'s hands go flat on the table. "You found sequencing data. Show me." They clear a workspace with sudden, unscientific urgency, then visibly collect themselves. "The ${rt.item('MERIDIAN Keycard')} — administrator-level access. We recovered it. It works. The question is who carries it in."`,
      branches: [
        {
          label: `[Lore DC 11] Explain the R-8 protein folding implications.`,
          targetNode: 'lev_keycard_lore_success',
          skillCheck: { skill: 'lore', dc: 11 },
          failNode: 'lev_keycard_fail',
        },
        {
          label: `[Negotiation DC 12] "People are dying. Every cycle I lose more. I need that card now."`,
          targetNode: 'lev_keycard_negotiate_success',
          skillCheck: { skill: 'negotiation', dc: 12 },
          failNode: 'lev_keycard_fail',
        },
        {
          label: `[Intimidation DC 14] "Give me the keycard or I find another way in — and you lose your data source."`,
          targetNode: 'lev_keycard_intimidate_success',
          skillCheck: { skill: 'intimidation', dc: 14 },
          failNode: 'lev_keycard_fail',
        },
        {
          label: '"Not yet. I have more questions."',
          targetNode: 'lev_start',
        },
      ],
    },

    lev_keycard_lore_success: {
      id: 'lev_keycard_lore_success',
      speaker: 'Lev',
      text: `${rt.npc('Lev')} stares at you. For the first time, something other than clinical interest crosses their face — respect. "You understand the mechanism. Most people see a virus. You see architecture." They unlock the desk drawer and place the ${rt.item('MERIDIAN Keycard')} in front of you. "Dr. Vane's own card. He drove out, left it, went back in. He wanted someone capable to follow." A pause. "The lower wing has cold storage. If the samples survived, bring me viable material. That's not a condition — it's a request from a colleague."`,
      onEnter: {
        setFlag: { reclaimers_meridian_keycard: true, lev_trusts_player: true },
        grantItem: ['meridian_keycard'],
        grantRep: { faction: 'reclaimers', delta: 1 },
      },
      branches: [
        {
          label: '"I\'ll bring back what I find."',
          targetNode: 'lev_keycard_end',
        },
      ],
    },

    lev_keycard_negotiate_success: {
      id: 'lev_keycard_negotiate_success',
      speaker: 'Lev',
      text: `${rt.npc('Lev')} is quiet for a long moment. "Urgency is not a methodology I endorse." They open the drawer anyway. The ${rt.item('MERIDIAN Keycard')} slides across the table. "Administrator access. Dr. Elias Vane, Project Director. It was in his car, two miles from the crater." They don't look at you. "Bring back data. That's the only thing I ask."`,
      onEnter: {
        setFlag: 'reclaimers_meridian_keycard',
        grantItem: ['meridian_keycard'],
      },
      branches: [
        {
          label: '"Understood."',
          targetNode: 'lev_keycard_end',
        },
      ],
    },

    lev_keycard_intimidate_success: {
      id: 'lev_keycard_intimidate_success',
      speaker: 'Lev',
      text: `${rt.npc('Lev')}'s expression doesn't change, but something behind it closes. "Noted." They place the ${rt.item('MERIDIAN Keycard')} on the edge of the desk — not handed, placed. "Administrator access. Don't come back here expecting collaboration." The professional warmth is gone. What remains is data collection. You are now a data point, not a colleague.`,
      onEnter: {
        setFlag: { reclaimers_meridian_keycard: true, lev_distrusts_player: true },
        grantItem: ['meridian_keycard'],
        grantRep: { faction: 'reclaimers', delta: -1 },
      },
      branches: [
        {
          label: 'Take the keycard and leave.',
          targetNode: 'lev_leave',
        },
      ],
    },

    lev_keycard_fail: {
      id: 'lev_keycard_fail',
      speaker: 'Lev',
      text: `${rt.npc('Lev')} shakes their head once — precise, final. "I can't give that to someone who doesn't understand what they're walking into. The facility is not a ruin. It's an active biohazard with seven years of unmonitored pathogen culture." They close the drawer. "Come back when you can demonstrate that you'll survive what's down there."`,
      branches: [
        {
          label: 'Back to other topics.',
          targetNode: 'lev_start',
        },
        {
          label: '"Fine. I\'ll go."',
          targetNode: 'lev_leave',
        },
      ],
    },

    lev_keycard_end: {
      id: 'lev_keycard_end',
      speaker: 'Lev',
      text: `${rt.npc('Lev')} has already turned back to the tablet, but their hand pauses on the screen. "Be careful down there. That's —" They stop. "That's not a scientific recommendation. Ignore it if you prefer." They don't look up again.`,
    },

    // ---- Branch 4: Leave ----
    lev_leave: {
      id: 'lev_leave',
      speaker: 'Lev',
      text: `"I have work to do." ${rt.npc('Lev')} is already reading before you've turned away. The dismissal is efficient, like everything else about them.`,
    },
  },
}

// ------------------------------------------------------------
// SPARKS — Radio Technician (Crossroads)
// dialogueTree ID: 'cr_sparks_intro'
// ------------------------------------------------------------

const sparksTree: DialogueTree = {
  npcId: 'sparks_radio',
  startNode: 'sparks_start',
  nodes: {
    // ---- Root ----
    sparks_start: {
      id: 'sparks_start',
      speaker: 'Sparks',
      text: `${rt.npc('Sparks')} is hunched over a gutted shortwave radio, soldering iron in one hand, frequency chart in the other. She barely looks up. "Signal's still there. Every day. Same twelve words. I'm not crazy — I know what 'not crazy' sounds like and this is it."`,
      branches: [
        // ---- Echo branches (cycle 2+) ----
        {
          label: '"The signal changed after I went north. I can tell you what happened."',
          targetNode: 'sparks_echo_broadcaster',
          requiresCycleMin: 2,
          requiresPreviousQuest: 'sparks_mentioned_broadcaster',
        },
        // ---- Standard branches ----
        {
          label: `"Tell me about the ${rt.keyword('signal')}."`,
          targetNode: 'sparks_signal',
        },
        {
          label: `Ask about the ${rt.keyword('broadcaster')}.`,
          targetNode: 'sparks_broadcaster',
          requiresFlag: 'sparks_shared_decode',
        },
        {
          label: `"I need a ${rt.item('signal receiver')} for the field."`,
          targetNode: 'sparks_equipment',
        },
        {
          label: '"I\'ll let you work."',
          targetNode: 'sparks_leave',
        },
      ],
    },

    // ---- Echo: Broadcaster knowledge (cycle 2+) ----
    sparks_echo_broadcaster: {
      id: 'sparks_echo_broadcaster',
      speaker: 'Sparks',
      text: `${rt.npc('Sparks')} drops the soldering iron. It clatters on the bench and she doesn't notice. "You — wait. Wait." She grabs the frequency chart, flipping to a page dense with annotations. "The signal changed after you went north last time. The modulation shifted — same twelve words but the cadence is different. Faster. Like whoever's down there knows someone actually came." She looks at you with an intensity that borders on desperate. "What happened in there? What did you find?"`,
      onEnter: {
        setFlag: 'sparks_echo_acknowledged',
      },
      branches: [
        {
          label: '"There\'s a man down there. Dr. Vane. He\'s been broadcasting for seven years."',
          targetNode: 'sparks_echo_vane_reveal',
        },
        {
          label: '"The facility is intact. That\'s all I can say."',
          targetNode: 'sparks_echo_partial',
        },
      ],
    },

    sparks_echo_vane_reveal: {
      id: 'sparks_echo_vane_reveal',
      speaker: 'Sparks',
      text: `${rt.npc('Sparks')} sits down. Hard. Like her legs decided before she did. "Seven years." She says it twice, the second time quieter. "Seven years. Alone. Adjusting the modulation by hand every time the atmosphere shifts." Her voice cracks — not with sadness, with vindication and the specific grief that comes with being right about something terrible. "I told ${rt.npc('Lev')}. I told everyone. 'Interesting.' They said 'interesting.'" She wipes her eyes with the back of her soldering hand. "Thank you. For — I wasn't crazy. I knew I wasn't crazy."`,
      onEnter: {
        setFlag: { sparks_knows_vane: true, sparks_shared_decode: true, sparks_mentioned_broadcaster: true },
      },
      branches: [
        {
          label: `"I need a ${rt.item('signal receiver')} for the field."`,
          targetNode: 'sparks_equipment',
        },
        {
          label: '"You were never crazy, Sparks."',
          targetNode: 'sparks_leave',
        },
      ],
    },

    sparks_echo_partial: {
      id: 'sparks_echo_partial',
      speaker: 'Sparks',
      text: `${rt.npc('Sparks')} stares at you. The hope doesn't leave her face but it rearranges into something harder, more patient. "Intact. Okay. Okay." She's scribbling notes already, cross-referencing the frequency shift against her charts. "That's — that's enough. For now. The signal changed because something happened when you were there, and you're telling me the something is real." She taps the chart. "I can work with that. I can definitely work with that."`,
      onEnter: {
        setFlag: { sparks_echo_acknowledged: true, sparks_shared_decode: true },
      },
      branches: [
        {
          label: `"I need a ${rt.item('signal receiver')} for the field."`,
          targetNode: 'sparks_equipment',
        },
        {
          label: '"Keep listening, Sparks."',
          targetNode: 'sparks_leave',
        },
      ],
    },

    // ---- Branch 1: The Signal ----
    sparks_signal: {
      id: 'sparks_signal',
      speaker: 'Sparks',
      text: `"Shortwave, repeating loop, been running for — I don't know, years? Everyone thinks it's automated." ${rt.npc('Sparks')} pulls a notebook from under a pile of capacitors. "I've decoded maybe forty percent. The modulation shifts. Automated systems don't shift." She taps the notebook hard enough to dent the page. "Someone is down there. In the ${rt.keyword('Scar')}. Broadcasting." She slides the notebook toward you. "Frequency's 4.127 megahertz. Interval variance keyed to a scaled twelve-tone. If you find a terminal that wants authentication, try that."`,
      onEnter: {
        setFlag: 'sparks_shared_decode',
        grantNarrativeKey: 'crossroads_signal_source',
      },
      branches: [
        {
          label: '"What do the twelve words say?"',
          targetNode: 'sparks_twelve_words',
        },
        {
          label: 'Back to other topics.',
          targetNode: 'sparks_start',
        },
      ],
    },

    sparks_twelve_words: {
      id: 'sparks_twelve_words',
      speaker: 'Sparks',
      text: `${rt.npc('Sparks')} reads from the notebook, finger tracing each word. "What I've got so far: '${rt.keyword('MERIDIAN')} ... still ... viable ... containment ... breach ... cycle ... seven ...' — then five words I can't resolve. Static eats them." She closes the notebook. "Cycle seven. That's not random. Someone is counting the same thing you are."`,
      branches: [
        {
          label: 'Back to other topics.',
          targetNode: 'sparks_start',
        },
      ],
    },

    // ---- Branch 2: The Broadcaster ----
    sparks_broadcaster: {
      id: 'sparks_broadcaster',
      speaker: 'Sparks',
      text: `${rt.npc('Sparks')} lowers her voice, glancing at the other stalls. "I think someone is alive in ${rt.keyword('MERIDIAN')}. Forty meters underground, seven years after the bombing, still broadcasting." She's winding a wire around her finger without noticing. "The signal has — I don't know how to say this without sounding — it has intent. It changes when atmospheric conditions change, like someone is compensating in real time." She meets your eyes. "No one believes me. ${rt.npc('Lev')} took the triangulation data and said 'interesting' in the way that means 'I'll get back to you never.'"`,
      onEnter: {
        setFlag: 'sparks_mentioned_broadcaster',
      },
      branches: [
        {
          label: 'Back to other topics.',
          targetNode: 'sparks_start',
        },
      ],
    },

    // ---- Branch 3: Equipment ----
    sparks_equipment: {
      id: 'sparks_equipment',
      speaker: 'Sparks',
      text: `${rt.npc('Sparks')} looks at you — actually looks, for the first time. "A field receiver. Yeah, I can build one. Tuned to the ${rt.keyword('MERIDIAN')} frequency, portable, battery life maybe forty hours." She chews her lip. "But I need parts. I'm already cannibalizing my backup rig. Bring me ${rt.item('Electronics Salvage')} or convince me you're worth the parts I can't replace."`,
      branches: [
        {
          label: `[Give ${rt.item('Electronics Salvage')}]`,
          targetNode: 'sparks_equipment_trade_success',
          requiresItem: 'electronics_salvage',
        },
        {
          label: `[Negotiation DC 10] "If I can track the signal in the field, I bring you back real data — not guesses."`,
          targetNode: 'sparks_equipment_negotiate_success',
          skillCheck: { skill: 'negotiation', dc: 10 },
          failNode: 'sparks_equipment_fail',
        },
        {
          label: 'Back to other topics.',
          targetNode: 'sparks_start',
        },
      ],
    },

    sparks_equipment_trade_success: {
      id: 'sparks_equipment_trade_success',
      speaker: 'Sparks',
      text: `${rt.npc('Sparks')} grabs the ${rt.item('Electronics Salvage')} and has it half-disassembled before you finish handing it over. "Good components. Give me — " She's already working. Two minutes later she presses a hand-built receiver into your palm, still warm from the soldering iron. "Tuned to 14.7 MHz. When it clicks, you're close. When it screams, you're on top of it. Don't break it."`,
      onEnter: {
        setFlag: 'has_signal_receiver',
        removeItem: ['electronics_salvage'],
      },
      branches: [
        {
          label: 'Back to other topics.',
          targetNode: 'sparks_start',
        },
        {
          label: '"Thanks. I\'ll be back."',
          targetNode: 'sparks_leave',
        },
      ],
    },

    sparks_equipment_negotiate_success: {
      id: 'sparks_equipment_negotiate_success',
      speaker: 'Sparks',
      text: `${rt.npc('Sparks')} stares at you, then at her backup rig, then back at you. "Data. Real data." She starts pulling components from the backup with the resigned tenderness of someone dismantling something they love. "If you come back with nothing I will be — I'll be fine. I'll be fine." She hands you the receiver. "14.7 MHz. Click means close. Scream means there."`,
      onEnter: {
        setFlag: 'has_signal_receiver',
      },
      branches: [
        {
          label: 'Back to other topics.',
          targetNode: 'sparks_start',
        },
        {
          label: '"I\'ll bring you something worth it."',
          targetNode: 'sparks_leave',
        },
      ],
    },

    sparks_equipment_fail: {
      id: 'sparks_equipment_fail',
      speaker: 'Sparks',
      text: `${rt.npc('Sparks')} shakes her head, hands already back on the soldering iron. "I can't spare the parts. Not on a maybe." She nods toward the market stalls. "Bring me ${rt.item('Electronics Salvage')} and we'll talk. Capacitors, circuit boards, anything with copper trace. The components vendor sometimes has stock."`,
      branches: [
        {
          label: 'Back to other topics.',
          targetNode: 'sparks_start',
        },
        {
          label: '"I\'ll find some."',
          targetNode: 'sparks_leave',
        },
      ],
    },

    // ---- Branch 4: Leave ----
    sparks_leave: {
      id: 'sparks_leave',
      speaker: 'Sparks',
      text: `${rt.npc('Sparks')} is already back to her equipment before you finish speaking. The soldering iron hums. A burst of static cuts through the radio and she lunges for the dial, adjusting, listening, writing. You are no longer in the room as far as she's concerned.`,
    },
  },
}

// ------------------------------------------------------------
// SPARKS — Signal Quest (Crossroads)
// dialogueTree ID: 'cr_sparks_signal_quest'
// NOTE: section owned by Rider A (quest-spine)
// Activated after player has sparks_shared_decode flag
// ------------------------------------------------------------

const sparksSignalQuestTree: DialogueTree = {
  npcId: 'sparks_radio',
  startNode: 'sparks_quest_start',
  nodes: {
    sparks_quest_start: {
      id: 'sparks_quest_start',
      speaker: 'Sparks',
      text: `${rt.npc('Sparks')} grabs your arm the moment you're close enough. "Listen. The signal changed again last night. The cadence — it's faster. Whoever's broadcasting knows someone is listening now." She pulls you to the workbench, where a frequency chart is covered in fresh annotations, red ink still wet. "I can triangulate the source. I know I can. But my equipment can't reach past the interference field around the ${rt.keyword('Scar')}." She meets your eyes. The desperation is controlled but visible. "I need a ${rt.item('Signal Booster')}. ${rt.item('Electronics Salvage')} and a ${rt.item('Wire Coil')} — build one and bring it to me. With a booster in the chain I can cut through the interference and pin the broadcast to a hundred-meter radius." Her voice drops. "Someone has been calling for help for seven years. Seven years, alone, underground. I am not going to let that signal die because I couldn't get the right parts."`,
      branches: [
        {
          label: `"I'll build the ${rt.item('Signal Booster')}. What exactly do I need?"`,
          targetNode: 'sparks_quest_details',
        },
        {
          label: '"Why does this matter so much to you?"',
          targetNode: 'sparks_quest_why',
        },
        {
          label: '"Seven years? How is that possible?"',
          targetNode: 'sparks_quest_seven_years',
        },
      ],
    },

    sparks_quest_details: {
      id: 'sparks_quest_details',
      speaker: 'Sparks',
      text: `${rt.npc('Sparks')} is already sketching a diagram on the back of a frequency chart. "${rt.item('Electronics Salvage')} — capacitors, resistors, anything with clean copper trace. And a ${rt.item('Wire Coil')} for the antenna amplification loop." She taps the diagram. "Any workbench with basic tools can assemble it. The ${rt.keyword('crafting')} isn't hard — it's finding clean components that's the challenge." She tears the diagram free and presses it into your hand. "Bring me the finished ${rt.item('Signal Booster')} and I'll have the triangulation running within the hour. We'll know exactly where in the Scar the signal originates. Exactly where they are."`,
      onEnter: {
        setFlag: { sparks_quest_accepted: true, quest_signal_booster_active: true },
      },
      branches: [
        {
          label: '"I\'ll get it done."',
          targetNode: 'sparks_quest_closure',
        },
        {
          label: '"Why does this matter so much to you?"',
          targetNode: 'sparks_quest_why',
        },
      ],
    },

    sparks_quest_why: {
      id: 'sparks_quest_why',
      speaker: 'Sparks',
      text: `${rt.npc('Sparks')} is quiet for three seconds. For her, that's an eternity. "Because I heard it on the worst night of my life. Three weeks after the Collapse. I'd lost — everyone. I was sitting in the dark with a radio I'd pulled from a wrecked car, scanning frequencies for anything human. Anything." She adjusts a dial that doesn't need adjusting. "And there it was. Twelve words. Repeating. Someone else was alive and trying to reach someone. Anyone." She looks at the radio. "I never stopped listening. And they never stopped broadcasting. That means something. That has to mean something."`,
      branches: [
        {
          label: `"Tell me what I need to build the ${rt.item('Signal Booster')}."`,
          targetNode: 'sparks_quest_details',
        },
        {
          label: '"It means something. I\'ll find out what."',
          targetNode: 'sparks_quest_closure',
        },
      ],
    },

    sparks_quest_seven_years: {
      id: 'sparks_quest_seven_years',
      speaker: 'Sparks',
      text: `"That's the question that keeps me up." ${rt.npc('Sparks')} pulls the frequency chart closer, finger tracing a line of decoded text. "The ${rt.keyword('MERIDIAN')} facility was sealed during the bombing. Underground. Self-contained. If the backup generators held — and the signal proves they did — someone could survive down there. Alone. For years." She swallows. "The modulation shifts prove it's manual adjustment. Not automated. A person is doing this. A person who has been trapped underground since the world ended, broadcasting the same twelve words, waiting for someone to answer." Her jaw tightens. "We're going to answer."`,
      branches: [
        {
          label: `"What do I need to build the ${rt.item('Signal Booster')}?"`,
          targetNode: 'sparks_quest_details',
        },
        {
          label: '"We will. I promise."',
          targetNode: 'sparks_quest_closure',
        },
      ],
    },

    // ---- Return with booster ----
    sparks_quest_booster_return: {
      id: 'sparks_quest_booster_return',
      speaker: 'Sparks',
      text: `${rt.npc('Sparks')} sees the ${rt.item('Signal Booster')} in your hands and her whole body changes — shoulders drop, hands stop moving, the constant nervous energy goes still for the first time since you've known her. "You built it." She takes it with both hands, reverent. "Give me — don't talk. Don't talk." She's already wiring it into the antenna array, fingers fast and precise. The radio hums louder. Static shifts. And then — for a half-second — a voice. Clear. Human. Desperate. Gone. ${rt.npc('Sparks')} looks at you with tears running down her face and the most terrified smile you've ever seen. "South-southeast. Point four kilometers from the crater rim. That's where they are. That's where we go."`,
      onEnter: {
        setFlag: { sparks_booster_delivered: true, quest_signal_booster_complete: true, signal_triangulated: true },
        removeItem: ['crafted_signal_booster'],
      },
      branches: [
        {
          label: '"We\'ll get them out."',
          targetNode: 'sparks_quest_final',
        },
      ],
    },

    sparks_quest_final: {
      id: 'sparks_quest_final',
      speaker: 'Sparks',
      text: `${rt.npc('Sparks')} wipes her face with the back of her hand, already scribbling coordinates. "The ${rt.keyword('Scar')}. Southern approach. There should be a maintenance access — the old facility maps show service tunnels." She hands you the coordinates, hand steady now. "Find them. Find whoever has been down there for seven years, alone, broadcasting into the dark, hoping someone would hear." She grips your shoulder once, hard. "You heard."`,
      onEnter: {
        setFlag: 'sparks_gave_coordinates',
      },
    },

    sparks_quest_closure: {
      id: 'sparks_quest_closure',
      speaker: 'Sparks',
      text: `${rt.npc('Sparks')} nods once — sharp, decisive. "Good. The signal won't wait forever. Whoever's down there, they've held on this long, but —" She doesn't finish. She doesn't need to. The soldering iron is already in her hand, the radio humming, the frequency chart open. She'll be here when you get back. She's always here.`,
    },
  },
}

// ------------------------------------------------------------
// MARSHAL CROSS — Accord Leader (Covenant)
// Military cadence. States facts, not feelings.
// dialogueTree ID: 'cv_marshal_cross_intro'
// ------------------------------------------------------------

const crossTree: DialogueTree = {
  npcId: 'marshal_cross',
  startNode: 'cross_start',
  nodes: {
    // ---- Root ----
    cross_start: {
      id: 'cross_start',
      speaker: 'Marshal Cross',
      text: `${rt.npc('Marshal Cross')} looks up from a report. One glance — hands, belt, posture — and she has you categorized. "You have sixty seconds. Use them."`,
      branches: [
        // ---- Echo branches (cycle 2+) ----
        {
          label: '"You\'ve done this march before. So have I."',
          targetNode: 'cross_echo_sanctioned',
          requiresCycleMin: 2,
          requiresPreviousQuest: 'cross_expedition_sanctioned',
        },
        {
          label: '"We\'ve met before, Marshal. I know how this conversation goes."',
          targetNode: 'cross_echo_distrust',
          requiresCycleMin: 2,
          requiresPreviousRelationship: { npcId: 'marshal_cross', relationship: 'distrusted' },
        },
        // ---- Standard branches ----
        {
          label: `Ask about ${rt.keyword('Accord')} law.`,
          targetNode: 'cross_law',
        },
        {
          label: `Ask about the ${rt.keyword('Scar')}.`,
          targetNode: 'cross_scar',
        },
        {
          label: `"I need authorization to go north."`,
          targetNode: 'cross_expedition_gate',
          requiresFlag: 'cross_admitted_bombing_theater',
        },
        {
          label: `"I need authorization to go north."`,
          targetNode: 'cross_expedition_gate',
          requiresFlag: 'patch_mentioned_scar',
        },
        {
          label: '"I should go."',
          targetNode: 'cross_leave',
        },
      ],
    },

    // ---- Echo: Previous expedition sanctioned (cycle 2+) ----
    cross_echo_sanctioned: {
      id: 'cross_echo_sanctioned',
      speaker: 'Marshal Cross',
      text: `${rt.npc('Marshal Cross')} stops reading. She looks at you — not the sixty-second assessment, something longer, something that searches for a thing she can't name. "You've done this march before. I can see it in how you walk." The military cadence softens for exactly one sentence. "Permit's pre-approved." She pulls the document from the drawer — already stamped, already signed. She was expecting you. "Route maps, supply draw, full backing. Same terms as last time." She slides the papers across. "Don't make me regret trusting someone twice."`,
      onEnter: {
        setFlag: { cross_expedition_sanctioned: true, cross_echo_acknowledged: true },
        grantRep: { faction: 'accord', delta: 1 },
      },
      branches: [
        {
          label: '"Yes, Marshal."',
          targetNode: 'cross_leave',
        },
      ],
    },

    // ---- Echo: Cross didn't trust player (cycle 2+) ----
    cross_echo_distrust: {
      id: 'cross_echo_distrust',
      speaker: 'Marshal Cross',
      text: `${rt.npc('Marshal Cross')} sets the report down. Slowly. "I've heard stories about the last you." She doesn't explain how she knows — the Accord keeps records, or the world remembers in ways that don't require paper. "Convince me this version is different."`,
      onEnter: {
        setFlag: 'cross_echo_acknowledged',
      },
      branches: [
        {
          label: `[Negotiation DC 14] "Last time I didn't understand the stakes. Now I do. Eight hundred people — I remember the weight."`,
          targetNode: 'cross_exp_presence_success',
          skillCheck: { skill: 'negotiation', dc: 14 },
          failNode: 'cross_echo_distrust_fail',
        },
        {
          label: `"I know about the ${rt.keyword('Kindling')} tunnels."`,
          targetNode: 'cross_exp_barter',
          requiresFlag: 'harrow_mentioned_tunnels',
        },
        {
          label: '"Fair. I\'ll earn it the hard way."',
          targetNode: 'cross_leave',
        },
      ],
    },

    cross_echo_distrust_fail: {
      id: 'cross_echo_distrust_fail',
      speaker: 'Marshal Cross',
      text: `"Words." One word, military-flat. "Same words, different day. I don't authorize expeditions on vocabulary." She picks the report back up. "Bring me something concrete. Intel, proof, someone who'll vouch for you. Then we talk."`,
      branches: [
        {
          label: `Ask about ${rt.keyword('Accord')} law.`,
          targetNode: 'cross_law',
        },
        {
          label: '"Understood."',
          targetNode: 'cross_leave',
        },
      ],
    },

    // ---- Root (cycle 2+) ----
    cross_start_return: {
      id: 'cross_start_return',
      speaker: 'Marshal Cross',
      text: `${rt.npc('Marshal Cross')} nods once when she sees you. No surprise. "Back again. Good — means you survived something. What do you need?"`,
      branches: [
        {
          label: `Ask about ${rt.keyword('Accord')} law.`,
          targetNode: 'cross_law',
        },
        {
          label: `Ask about the ${rt.keyword('Scar')}.`,
          targetNode: 'cross_scar',
        },
        {
          label: `"I need authorization to go north."`,
          targetNode: 'cross_expedition_gate',
          requiresFlag: 'cross_admitted_bombing_theater',
        },
        {
          label: `"I need authorization to go north."`,
          targetNode: 'cross_expedition_gate',
          requiresFlag: 'patch_mentioned_scar',
        },
        {
          label: '"I should go."',
          targetNode: 'cross_leave',
        },
      ],
    },

    // ---- Branch 1: Law & Order (terminal) ----
    cross_law: {
      id: 'cross_law',
      speaker: 'Marshal Cross',
      text: `"Three rules. Contribute labor. Follow arbitration. No unsanctioned violence." She counts them on her fingers without looking at them. "Break one, you answer to me. Break three, you're outside the walls before sundown. Eight hundred people. That's the weight. Everything else is negotiable."`,
      branches: [
        {
          label: '"Understood."',
          targetNode: 'cross_start',
        },
      ],
    },

    // ---- Branch 2: The Scar ----
    cross_scar: {
      id: 'cross_scar',
      speaker: 'Marshal Cross',
      text: `"2031. National Guard forward element. Fourteen went in." A pause that carries weight. "Three came out. My sergeant started changing on the drive back. I made a decision." She does not elaborate. The silence is the rest of the sentence.`,
      branches: [
        {
          label: `"What do you know about the ${rt.keyword('bombing')}?"`,
          targetNode: 'cross_bombing',
          requiresRep: { faction: 'accord', min: 1 },
        },
        {
          label: `"I won't push. Thank you."`,
          targetNode: 'cross_start',
        },
      ],
    },

    cross_bombing: {
      id: 'cross_bombing',
      speaker: 'Marshal Cross',
      text: `${rt.npc('Cross')} is quiet for a long time. Then: "The airstrike was real. The destruction was not." She meets your eyes. "The facility is intact. The bombing was theater — a perimeter action to keep civilians out while they sealed the lower levels. I have documentation. Incomplete, but enough." Her jaw tightens. "I made a decision not to share that. I stand by it. But you're here, and the ${rt.keyword('Scar')} is expanding, and standing by things gets harder when the ground moves."`,
      onEnter: {
        setFlag: 'cross_admitted_bombing_theater',
      },
      branches: [
        {
          label: '"That changes everything."',
          targetNode: 'cross_start',
        },
        {
          label: `"${rt.npc('Briggs')} told me the same thing. Salt Creek knew. So did you."`,
          targetNode: 'cross_bombing_crossref',
          requiresFlag: 'briggs_confessed_bombing',
        },
        {
          label: '"I need to get in there."',
          targetNode: 'cross_expedition_gate',
        },
      ],
    },

    cross_bombing_crossref: {
      id: 'cross_bombing_crossref',
      speaker: 'Marshal Cross',
      text: `${rt.npc('Cross')} sets her pen down. Carefully. The small act carries the weight of a larger one elsewhere. "Briggs." The name as a fact, not a question. "He was perimeter. Of course he knew. Of course." She looks at the wall. At nothing on the wall. "Seven years. Both of us. Neither of us said a word. He had reasons. I had reasons." Her voice drops. "His reasons are honest. A soldier's compartmentalization. He was trained not to share." She looks back at you. "Mine are not that honest. I chose. I chose to let the Accord believe something so I could govern the belief. I told myself it would destabilize the faction if the people knew their Marshal had been lied to. I told myself a lot of things that sounded responsible." A pause. "I would like to know what you plan to do with this."`,
      onEnter: {
        setFlag: { bombing_cover_confirmed: true },
      },
      branches: [
        {
          label: `"You chose silence. That's yours to carry."`,
          targetNode: 'cross_bombing_crossref_chose',
        },
        {
          label: '"You were following orders. Cold War habits."',
          targetNode: 'cross_bombing_crossref_orders',
        },
        {
          label: `"I don't know yet. That's the honest answer."`,
          targetNode: 'cross_bombing_crossref_undecided',
        },
      ],
    },

    cross_bombing_crossref_chose: {
      id: 'cross_bombing_crossref_chose',
      speaker: 'Marshal Cross',
      text: `${rt.npc('Cross')} nods once. She does not look relieved. "Yes. I chose. Calling it orders would be easier. It would be the comfortable lie." Her hands flatten on the desk. "Whatever you do with this, do it as someone who knows I was the one who kept it quiet. Not the pre-Collapse command. Not the Accord. Me."`,
      onEnter: {
        setFlag: { cross_concealed_truth: true },
      },
      branches: [
        {
          label: `"I hear you, ${rt.npc('Cross')}."`,
          targetNode: 'cross_start',
        },
      ],
    },

    cross_bombing_crossref_orders: {
      id: 'cross_bombing_crossref_orders',
      speaker: 'Marshal Cross',
      text: `${rt.npc('Cross')} tilts her head slightly — considering it, letting the frame settle. "There were orders. I received them. I could have disobeyed. I did not. The order gave me cover; the decision was mine." She does not smile. "Call it what you want. It reads the same in either language. It reads as silence."`,
      onEnter: {
        setFlag: { cross_followed_orders: true },
      },
      branches: [
        {
          label: `"Understood."`,
          targetNode: 'cross_start',
        },
      ],
    },

    cross_bombing_crossref_undecided: {
      id: 'cross_bombing_crossref_undecided',
      speaker: 'Marshal Cross',
      text: `"Honest is better than clever, right now." ${rt.npc('Cross')} leans back. "Decide before you act. Then act. The Accord is fragile. The Salters are proud. Whatever you choose to do with what you know, do it deliberately. Sloppy is worse than either option."`,
      branches: [
        {
          label: `"I will."`,
          targetNode: 'cross_start',
        },
      ],
    },

    // ---- Branch 3: Expedition Sanction (story-critical) ----
    cross_expedition_gate: {
      id: 'cross_expedition_gate',
      speaker: 'Marshal Cross',
      text: `"The ${rt.keyword('Scar')} is active ground. I don't send people north without reason, and I don't authorize expeditions on curiosity." She folds her arms. "Convince me."`,
      branches: [
        {
          label: '[Negotiation DC 11] "I\'ll gather intel and report back to you directly."',
          targetNode: 'cross_exp_presence_success',
          skillCheck: { skill: 'negotiation', dc: 11 },
          failNode: 'cross_exp_presence_fail',
        },
        {
          label: `"I know about the ${rt.keyword('Kindling')} tunnels."`,
          targetNode: 'cross_exp_barter',
          requiresFlag: 'harrow_mentioned_tunnels',
        },
        {
          label: '[Negotiation DC 13] "Eight hundred people deserve the truth about what\'s north of them."',
          targetNode: 'cross_exp_challenge_success',
          skillCheck: { skill: 'negotiation', dc: 13 },
          failNode: 'cross_exp_challenge_fail',
        },
        {
          label: '"Not yet. I\'ll come back."',
          targetNode: 'cross_start',
        },
      ],
    },

    // Sub-branch A: Presence check success
    cross_exp_presence_success: {
      id: 'cross_exp_presence_success',
      speaker: 'Marshal Cross',
      text: `${rt.npc('Cross')} studies you. Whatever she sees is enough. "Expedition permit. Authorized for reconnaissance only — no contact, no engagement unless threatened." She pulls a folded document from her desk and stamps it. "Supplies from the quartermaster. Don't waste them."`,
      onEnter: {
        setFlag: 'cross_expedition_sanctioned',
        grantRep: { faction: 'accord', delta: 1 },
      },
      branches: [
        {
          label: '"Yes, Marshal."',
          targetNode: 'cross_leave',
        },
      ],
    },

    // Sub-branch A: Presence check fail
    cross_exp_presence_fail: {
      id: 'cross_exp_presence_fail',
      speaker: 'Marshal Cross',
      text: `"Intel and report back." She repeats your words without inflection. "Everyone says that. Half of them mean it." She is not convinced. "Try again with something I can use."`,
      branches: [
        {
          label: `"I know about the ${rt.keyword('Kindling')} tunnels."`,
          targetNode: 'cross_exp_barter',
          requiresFlag: 'harrow_mentioned_tunnels',
        },
        {
          label: '[Negotiation DC 13] "Eight hundred people deserve the truth."',
          targetNode: 'cross_exp_challenge_success',
          skillCheck: { skill: 'negotiation', dc: 13 },
          failNode: 'cross_exp_challenge_fail',
        },
        {
          label: '"I\'ll come back when I have more."',
          targetNode: 'cross_leave',
        },
      ],
    },

    // Sub-branch B: Information barter
    cross_exp_barter: {
      id: 'cross_exp_barter',
      speaker: 'Marshal Cross',
      text: `${rt.npc('Cross')} goes very still. "Tunnels." The word lands differently than the others. "How far?" She doesn't wait for an answer. "Expedition permit — authorized. But I want those tunnels verified. Mapped. Sealed if necessary." She stamps the document and slides it across. "You've given me something I didn't have. I'll remember that."`,
      onEnter: {
        setFlag: { cross_expedition_sanctioned: true, cross_wants_tunnel_intel: true },
        grantRep: { faction: 'accord', delta: 1 },
      },
      branches: [
        {
          label: '"Consider it done."',
          targetNode: 'cross_leave',
        },
      ],
    },

    // Sub-branch C: Challenge success
    cross_exp_challenge_success: {
      id: 'cross_exp_challenge_success',
      speaker: 'Marshal Cross',
      text: `${rt.npc('Cross')} is quiet for a long time. When she speaks, the military cadence is gone. Just a tired woman making a decision. "You're right. And I've known you were right for longer than I'll admit." She opens a drawer — a folder, a map, a requisition slip. "Full backing. Permit, route maps, supply draw. If what you find changes things — I want to know first. Not because I'll bury it. Because I need to prepare eight hundred people for the truth."`,
      onEnter: {
        setFlag: 'cross_committed_truth_mission',
        grantRep: { faction: 'accord', delta: 2 },
      },
      branches: [
        {
          label: '"They\'ll be ready. I\'ll make sure of it."',
          targetNode: 'cross_leave',
        },
      ],
    },

    // Sub-branch C: Challenge fail
    cross_exp_challenge_fail: {
      id: 'cross_exp_challenge_fail',
      speaker: 'Marshal Cross',
      text: `"Truth doesn't keep people alive. Discipline does." The words come fast — rehearsed, or repeated so often they don't need rehearsal. "You want to lead with truth, bring me something that makes the truth useful."`,
      branches: [
        {
          label: '[Negotiation DC 11] "I\'ll gather intel and report back."',
          targetNode: 'cross_exp_presence_success',
          skillCheck: { skill: 'negotiation', dc: 11 },
          failNode: 'cross_exp_presence_fail',
        },
        {
          label: `"I know about the ${rt.keyword('Kindling')} tunnels."`,
          targetNode: 'cross_exp_barter',
          requiresFlag: 'harrow_mentioned_tunnels',
        },
        {
          label: '"I\'ll come back with something concrete."',
          targetNode: 'cross_leave',
        },
      ],
    },

    // ---- Branch 4: Leave ----
    cross_leave: {
      id: 'cross_leave',
      speaker: 'Marshal Cross',
      text: `${rt.npc('Cross')} nods once. She is already reading the next report before you reach the door.`,
    },
  },
}

// ------------------------------------------------------------
// WARLORD BRIGGS — Salter Commander (Salt Creek)
// Ex-military. Gruff, suspicious, respects directness.
// dialogueTree ID: 'sc_briggs_command'
// ------------------------------------------------------------

const briggsTree: DialogueTree = {
  npcId: 'warlord_briggs',
  startNode: 'briggs_start',
  nodes: {
    // ---- Root ----
    briggs_start: {
      id: 'briggs_start',
      speaker: 'Warlord Briggs',
      text: `${rt.npc('Briggs')} doesn't look up from the sidearm he's cleaning. The cloth moves in slow, precise circles. "State your business."`,
      branches: [
        // ---- Echo branches (cycle 2+) ----
        {
          label: '"You already told me the truth, Briggs. About the bombing."',
          targetNode: 'briggs_echo_confessed',
          requiresCycleMin: 2,
          requiresPreviousQuest: 'briggs_confessed_bombing',
        },
        // ---- Standard branches ----
        {
          label: `"What's ${rt.keyword('Salt Creek')} about?"`,
          targetNode: 'briggs_salt_creek',
        },
        {
          label: `"You were at ${rt.keyword('MERIDIAN')}. I want to know what happened."`,
          targetNode: 'briggs_meridian',
          requiresRep: { faction: 'salters', min: 1 },
        },
        {
          label: `[Intimidation DC 12] "You were at ${rt.keyword('MERIDIAN')}. Talk."`,
          targetNode: 'briggs_meridian_intimidate',
          skillCheck: { skill: 'intimidation', dc: 12 },
          failNode: 'briggs_meridian_fail',
        },
        {
          label: `"I need soldiers for the ${rt.keyword('Scar')}."`,
          targetNode: 'briggs_military_support',
          requiresFlag: 'cross_expedition_sanctioned',
        },
        {
          label: `"I need soldiers for the ${rt.keyword('Scar')}."`,
          targetNode: 'briggs_military_support',
          requiresRep: { faction: 'salters', min: 2 },
        },
        // === CONVOY remnant-story-0329 Rider D ===
        {
          label: '"Cross is demanding you answer for the bombing. There\'s a runner."',
          targetNode: 'briggs_bombing_crisis',
          requiresFlag: 'bombing_revealed',
        },
        // === END CONVOY remnant-story-0329 Rider D ===
        {
          label: '"Nothing. Leaving."',
          targetNode: 'briggs_leave',
        },
      ],
    },

    // ---- Echo: Confession already happened (cycle 2+) ----
    briggs_echo_confessed: {
      id: 'briggs_echo_confessed',
      speaker: 'Warlord Briggs',
      text: `${rt.npc('Briggs')}'s hands stop. The cloth goes flat on the table. He looks at you — not the assessment of a soldier sizing up a stranger, but the recognition of a man who gave away something heavy and is seeing the person he gave it to walk back through the door. "You know the truth already." His voice is quieter than before. Gruff but stripped of the defensive edge. "The facility. The bombing. The deployment orders." He pushes the sidearm aside. Full attention. "What do you want this time?"`,
      onEnter: {
        setFlag: { briggs_confessed_bombing: true, briggs_echo_acknowledged: true },
      },
      branches: [
        {
          label: `"I need soldiers for the ${rt.keyword('Scar')}. Same as before."`,
          targetNode: 'briggs_military_support',
        },
        {
          label: '"Just your support. Whatever you can give."',
          targetNode: 'briggs_echo_support',
        },
      ],
    },

    briggs_echo_support: {
      id: 'briggs_echo_support',
      speaker: 'Warlord Briggs',
      text: `"Support." He says the word like he's testing the weight of it. "Last time you took those papers and you did something with them. I don't know what — the cycle took you before I found out." He reaches into his vest. The same papers. The same fold marks. "Take them again. Sergeant Kade's team is ready — they're always ready. I told them someone might come." He sets the ${rt.item("Commander's Notes")} on the table. "This time, come back and tell me what happened. That's not an order. It's a request from someone who's been carrying this for too long."`,
      onEnter: {
        setFlag: { salter_expedition_backing: true },
        grantItem: ['commanders_notes'],
        grantRep: { faction: 'salters', delta: 1 },
      },
      branches: [
        {
          label: '"I\'ll come back. You have my word."',
          targetNode: 'briggs_leave',
        },
      ],
    },

    // ---- Branch 1: Salt Creek ----
    briggs_salt_creek: {
      id: 'briggs_salt_creek',
      speaker: 'Warlord Briggs',
      text: `"Kill ${rt.keyword('Hollow')}. Protect the living. Don't negotiate with things that eat people." He sets the barrel down and picks up the slide. "Cross builds walls. We go where the walls can't. Somebody has to be the violence so the rest of them can pretend it doesn't exist."`,
      branches: [
        {
          label: '"Direct. I appreciate that."',
          targetNode: 'briggs_start',
        },
      ],
    },

    // ---- Branch 2: MERIDIAN (via reputation) ----
    briggs_meridian: {
      id: 'briggs_meridian',
      speaker: 'Warlord Briggs',
      text: `${rt.npc('Briggs')} stops cleaning. His hands go flat on the table. "I was perimeter security. 3rd Battalion, forward element. They told us containment. They told us the airstrike would end it." He looks at you for the first time. "It didn't end anything."`,
      branches: [
        {
          label: '"What really happened?"',
          targetNode: 'briggs_confession_gate',
        },
        {
          label: '"That\'s enough. Thank you."',
          targetNode: 'briggs_start',
        },
      ],
    },

    // ---- Branch 2: MERIDIAN (via intimidation) ----
    briggs_meridian_intimidate: {
      id: 'briggs_meridian_intimidate',
      speaker: 'Warlord Briggs',
      text: `${rt.npc('Briggs')}'s hands stop. He looks at you — not angry, not threatened. Assessing. Whatever he sees makes him set the weapon down. "You've got nerve. Fine." His voice drops. "I was stationed at the perimeter when the bombs fell. Except they didn't fall where they were supposed to."`,
      branches: [
        {
          label: '"What really happened?"',
          targetNode: 'briggs_confession_gate',
        },
        {
          label: '"That\'s all I needed."',
          targetNode: 'briggs_start',
        },
      ],
    },

    // ---- Branch 2: MERIDIAN (intimidation fail) ----
    briggs_meridian_fail: {
      id: 'briggs_meridian_fail',
      speaker: 'Warlord Briggs',
      text: `${rt.npc('Briggs')} looks up slowly. The cleaning cloth doesn't stop moving. "You want to intimidate me, you'll need to have killed more things than I have." He goes back to work. "Come back when you've earned the conversation."`,
      branches: [
        {
          label: `"What's ${rt.keyword('Salt Creek')} about?"`,
          targetNode: 'briggs_salt_creek',
        },
        {
          label: '"Understood."',
          targetNode: 'briggs_leave',
        },
      ],
    },

    // ---- Branch 2 (sub): Confession gate ----
    briggs_confession_gate: {
      id: 'briggs_confession_gate',
      speaker: 'Warlord Briggs',
      text: `"What really happened." He says it back to you like he's tasting something bitter. "That depends on how much you can prove and how much you're willing to carry."`,
      branches: [
        {
          label: `[Give ${rt.item('Bombing Site Notes')}] "I have notes from the site."`,
          targetNode: 'briggs_confession',
          requiresItem: 'bombing_site_notes',
        },
        {
          label: '[Intimidation DC 13] "Tell me. Now."',
          targetNode: 'briggs_confession',
          skillCheck: { skill: 'intimidation', dc: 13 },
          failNode: 'briggs_confession_denied',
        },
        {
          label: '"I\'ll find proof and come back."',
          targetNode: 'briggs_start',
        },
      ],
    },

    briggs_confession: {
      id: 'briggs_confession',
      speaker: 'Warlord Briggs',
      text: `${rt.npc('Briggs')} exhales through his nose. Long. Controlled. "The facility is intact. The bombing was theater — air support hit the surface structures, nothing else. We were ordered to seal the entrances and maintain the story." He pulls a folded set of papers from inside his vest. His hands don't shake, but they want to. "${rt.item("Commander's Notes")}. Deployment orders, real coordinates, the works. I've been carrying them for five years because I didn't know who to give them to." He sets them on the table between you. "Now I do."`,
      onEnter: {
        setFlag: 'briggs_confessed_bombing',
        grantItem: ['commanders_notes'],
      },
      branches: [
        {
          label: '"This changes things, Briggs."',
          targetNode: 'briggs_leave',
        },
        {
          label: `"${rt.npc('Cross')} knew. The Accord knew. Seven years, and nobody told anyone."`,
          targetNode: 'briggs_bombing_crossref',
          requiresFlag: 'cross_admitted_bombing_theater',
        },
      ],
    },

    briggs_bombing_crossref: {
      id: 'briggs_bombing_crossref',
      speaker: 'Warlord Briggs',
      text: `${rt.npc('Briggs')}'s jaw works. The words take longer to arrive than they should. "Cross." He says her name the way soldiers say the names of people they outrank but respect and people they rank equal to and resent — both registers at once. "She had it from command too. Different channel. Same order. Keep the people settled. Keep the story clean." He picks up the sidearm from the table, not to threaten, just to have something to hold. "I figured she didn't know. I was wrong. We were both carrying the same secret on opposite sides of the river and neither of us ever thought to ask." A long breath. "That's what the pre-Collapse was good at. Compartmentalization. We kept the habit because nobody told us to stop." He looks at you. "What do you do with this?"`,
      onEnter: {
        setFlag: { bombing_cover_confirmed: true },
      },
      branches: [
        {
          label: `"I tell ${rt.npc('Cross')} you said that. You deserve to be in the same room with her when this stops being a secret."`,
          targetNode: 'briggs_bombing_crossref_meet',
        },
        {
          label: `"I hold it. For now. Until I see the facility for myself."`,
          targetNode: 'briggs_bombing_crossref_hold',
        },
      ],
    },

    briggs_bombing_crossref_meet: {
      id: 'briggs_bombing_crossref_meet',
      speaker: 'Warlord Briggs',
      text: `${rt.npc('Briggs')} sets the sidearm down with the care of a man putting down a weight. "Good. Tell her. Tell her exactly what I said." A flicker of something — grief, or its older cousin. "I've been carrying this alone. If she's been carrying it alone on her side of the river, then the carrying ends now. We go to the same place with the same cargo and we decide together what comes next."`,
      onEnter: {
        setFlag: { briggs_wants_joint_reckoning: true },
      },
      branches: [
        {
          label: `"I'll go straight to her."`,
          targetNode: 'briggs_leave',
        },
      ],
    },

    briggs_bombing_crossref_hold: {
      id: 'briggs_bombing_crossref_hold',
      speaker: 'Warlord Briggs',
      text: `${rt.npc('Briggs')} grunts. "Smart. See the ground before you move on it. I've been wrong before about what I thought I knew, and I spent five years not correcting. Don't do what I did." He nods you toward the door. "When you've seen the facility — if you come back — we'll talk about what to do with what we both know."`,
      branches: [
        {
          label: `"Understood, Warlord."`,
          targetNode: 'briggs_leave',
        },
      ],
    },

    briggs_confession_denied: {
      id: 'briggs_confession_denied',
      speaker: 'Warlord Briggs',
      text: `"Not enough." He picks the sidearm back up. The conversation is over until it isn't. "Bring me proof you've been to the site. Then we talk like people who've earned what they know."`,
      branches: [
        {
          label: '"I\'ll find it."',
          targetNode: 'briggs_start',
        },
      ],
    },

    // ---- Branch 3: Military Support ----
    briggs_military_support: {
      id: 'briggs_military_support',
      speaker: 'Warlord Briggs',
      text: `"The ${rt.keyword('Scar')}." He sets the weapon down. Full attention now. "Cross sent you, or you went around her?"`,
      branches: [
        {
          label: `"${rt.npc('Cross')} authorized the expedition. I need ground support."`,
          targetNode: 'briggs_support_negotiate',
        },
        {
          label: `"Does it matter? The ${rt.keyword('Scar')} is expanding."`,
          targetNode: 'briggs_support_negotiate',
        },
      ],
    },

    briggs_support_negotiate: {
      id: 'briggs_support_negotiate',
      speaker: 'Warlord Briggs',
      text: `"I can spare a fireteam. Maybe. My people are stretched across three patrol routes and the southern line." He leans back. "Convince me this isn't a waste of bodies."`,
      branches: [
        {
          label: '[Negotiation DC 11] "Your soldiers are the best chance we have of getting answers."',
          targetNode: 'briggs_support_success',
          skillCheck: { skill: 'negotiation', dc: 11 },
          failNode: 'briggs_support_fail',
        },
      ],
    },

    briggs_support_success: {
      id: 'briggs_support_success',
      speaker: 'Warlord Briggs',
      text: `"Four soldiers. Recon-rated. They report to you in the field and to me when they get back." He writes something on a scrap of paper and slides it across. "Sergeant Kade runs the team. Don't waste them. I will notice."`,
      onEnter: {
        setFlag: 'salter_expedition_backing',
        grantRep: { faction: 'salters', delta: 1 },
      },
      branches: [
        {
          label: '"They\'ll come back. You have my word."',
          targetNode: 'briggs_leave',
        },
      ],
    },

    briggs_support_fail: {
      id: 'briggs_support_fail',
      speaker: 'Warlord Briggs',
      text: `"Not good enough." He picks the sidearm up again. "My people aren't expendable. Come back when you can tell me what they're walking into."`,
      branches: [
        {
          label: '"Fair. I\'ll get more intel first."',
          targetNode: 'briggs_leave',
        },
      ],
    },

    // ---- Branch 4: Leave ----
    briggs_leave: {
      id: 'briggs_leave',
      speaker: 'Warlord Briggs',
      text: `"Dismissed." He doesn't watch you go. The cloth resumes its slow circuit of the barrel.`,
    },

    // === CONVOY remnant-story-0329 Rider D: Bombing Diplomatic Crisis ===
    briggs_bombing_crisis: {
      id: 'briggs_bombing_crisis',
      speaker: 'Warlord Briggs',
      text: `${rt.npc('Briggs')} sets the cloth down slowly. "A runner." He says it flat, the way soldiers say things when they are managing what the saying costs. "Cross moves fast." He looks at the map wall, not at you. "I offered a tribunal. After the eastern perimeter is secure. That\'s the correct order of operations." A pause. "She disagrees about the order."`,
      onEnter: {
        setFlag: 'bombing_diplomatic_crisis',
      },
      branches: [
        {
          label: '"Help delay the tribunal. The perimeter comes first."',
          targetNode: 'briggs_delay_tribunal',
        },
        {
          label: '"Support Cross\'s demand. The tribunal happens now."',
          targetNode: 'briggs_support_tribunal',
        },
      ],
    },

    briggs_delay_tribunal: {
      id: 'briggs_delay_tribunal',
      speaker: 'Warlord Briggs',
      text: `"Salters don't abandon post to answer questions from people who weren't there." He straightens — not gratitude, but something that recognizes an ally. "Tell Cross the timeline is the eastern perimeter. I'll come to the tribunal when my people are safe, not before. She wants answers? She can wait for the siege to end." He picks up the cleaning cloth again. The conversation is over, and you are on a side now.`,
      onEnter: {
        grantRep: { faction: 'salters', delta: 2 },
      },
      branches: [
        {
          label: '"Understood. I\'ll tell her."',
          targetNode: 'briggs_leave',
        },
      ],
    },

    briggs_support_tribunal: {
      id: 'briggs_support_tribunal',
      speaker: 'Warlord Briggs',
      text: `Something crosses his face — not anger. Something quieter. "You're right." He says it like it costs. "Cross is right. The siege is a reason, not an excuse." He folds the cloth once, precisely. "Tell her I'll come when she sends the formal summons. I won't make her chase me." He looks at you for a moment. "I still think the order is wrong. But I'm aware that what I think about the order is not the most important thing."`,
      onEnter: {
        grantRep: { faction: 'accord', delta: 2 },
      },
      branches: [
        {
          label: '"I\'ll tell Cross."',
          targetNode: 'briggs_leave',
        },
      ],
    },
    // === END CONVOY remnant-story-0329 Rider D ===
  },
}

// ------------------------------------------------------------
// PATCH — Info Broker (Crossroads)
// Voice: staccato, questions turned back, transactional
// ------------------------------------------------------------

const patchTree: DialogueTree = {
  npcId: 'patch',
  startNode: 'patch_start',
  nodes: {
    patch_start: {
      id: 'patch_start',
      speaker: 'Patch',
      text: `${rt.npc('Patch')} doesn't look up from the suture kit. "Before anything else — have you heard the ${rt.keyword('signal')}? Everyone hears it eventually. Shortwave, repeating. ${rt.npc('Sparks')} at the north market is the only one who's made sense of it." The needle pushes through. "If you want to understand this world, start there."`,
      branches: [
        // ---- Echo branches (cycle 2+) ----
        {
          label: '"Back from the dead, Patch. Literally."',
          targetNode: 'patch_echo_return',
          requiresCycleMin: 2,
          requiresPreviousQuest: 'patch_mentioned_scar',
        },
        // ---- Signal hook (first-visit priority) ----
        {
          label: `"What ${rt.keyword('signal')}? Tell me more."`,
          targetNode: 'patch_signal_hook',
        },
        // ---- Standard branches ----
        {
          label: 'I have something to trade for information.',
          targetNode: 'patch_trade_intel',
        },
        {
          label: 'What do you know about the factions out here?',
          targetNode: 'patch_faction_talk',
        },
      ],
    },

    // ---- Signal Hook: directs player to Sparks ----
    patch_signal_hook: {
      id: 'patch_signal_hook',
      speaker: 'Patch',
      text: `${rt.npc('Patch')} sets the suture kit down. "Shortwave broadcast. Repeating loop — been running for years. Most people think it's automated. Dead tower, broken equipment, ghost in the wires." One finger taps the desk. "Sparks doesn't think that. Sparks thinks someone is alive in the ${rt.keyword('Scar')}, forty meters underground, adjusting the signal by hand. And Sparks is the smartest person in this market." The finger stops. "North end. Look for the radio bench. You'll hear her before you see her."`,
      onEnter: {
        setFlag: 'patch_mentioned_signal',
      },
      branches: [
        {
          label: 'I have something to trade for information.',
          targetNode: 'patch_trade_intel',
        },
        {
          label: 'What do you know about the factions out here?',
          targetNode: 'patch_faction_talk',
        },
        {
          label: '"I\'ll find Sparks."',
          targetNode: 'patch_closure',
        },
      ],
    },

    // ---- Echo: Return after Scar (cycle 2+) ----
    patch_echo_return: {
      id: 'patch_echo_return',
      speaker: 'Patch',
      text: `${rt.npc('Patch')} looks up. Actually looks up — the suture kit forgotten, the transactional mask slipping for half a second into something like genuine surprise. "Back from the dead. Literally." One shoulder shrug, but slower than usual. "What did you find up north? The Scar — you went in. I heard things. Movement reports, supply chain disruptions, radio chatter. Something changed after you were there."`,
      onEnter: {
        setFlag: { patch_echo_acknowledged: true, patch_mentioned_scar: true },
      },
      branches: [
        {
          label: '"The facility is intact. There\'s someone alive inside."',
          targetNode: 'patch_echo_intel_exchange',
        },
        {
          label: '"Information costs, Patch. You know that."',
          targetNode: 'patch_echo_trade',
        },
      ],
    },

    patch_echo_intel_exchange: {
      id: 'patch_echo_intel_exchange',
      speaker: 'Patch',
      text: `${rt.npc('Patch')} sets the suture kit down. Fully. Both hands flat on the table — the posture of someone recalibrating their entire information network. "Intact. Someone alive." The staccato delivery breaks for one word: "Who?" Then, without waiting: "Never mind. That's worth more than I can pay right now." A vial appears from somewhere — ${rt.item('Purified Stims')}, military grade. "Take these. And take this —" A folded paper with coordinates, patrol schedules, supply route timings. "Everything I've got on the northern approach. Current as of yesterday. You gave me something worth the whole kit."`,
      onEnter: {
        setFlag: 'patch_shared_northern_intel',
        grantItem: ['purified_stims'],
      },
      branches: [
        {
          label: '"Fair trade. Keep listening, Patch."',
          targetNode: 'patch_closure',
        },
      ],
    },

    patch_echo_trade: {
      id: 'patch_echo_trade',
      speaker: 'Patch',
      text: `${rt.npc('Patch')} almost smiles. Almost. "Now you're talking my language." The suture kit slides aside, replaced by a barter-ready expression. "I've got new intel — ${rt.keyword('Kindling')} movement patterns, ${rt.keyword('Red Court')} supply lines, Accord patrol gaps. Fresh. Actionable." One finger taps the table. "Your turn. What's worth what."`,
      branches: [
        {
          label: 'I have something to trade for information.',
          targetNode: 'patch_trade_intel',
        },
        {
          label: '"Later. I know where to find you."',
          targetNode: 'patch_closure',
        },
      ],
    },

    patch_trade_intel: {
      id: 'patch_trade_intel',
      speaker: 'Patch',
      text: `"Now we're talking." ${rt.npc('Patch')} holds out a hand, palm up. "I heard something about the Scar — movement, organized, not Hollow. The kind of thing that changes where you walk. Worth ${rt.currency('10 rounds')} or a ${rt.item('Medkit')} if you've got one."`,
      onEnter: {
        setFlag: { patch_mentioned_scar: true },
      },
      branches: [
        {
          label: 'Here — take the rounds.',
          targetNode: 'patch_closure',
          requiresItem: 'ammo_22lr',
        },
        {
          label: "I don't have anything right now.",
          targetNode: 'patch_closure_empty',
        },
      ],
    },

    patch_faction_talk: {
      id: 'patch_faction_talk',
      speaker: 'Patch',
      text: `"Factions." ${rt.npc('Patch')} snaps a vial into a tray. "Accord holds the Covenant. Salters hold the Salt Creek. Kindling's moving — I don't know where yet, but three patients in two days all came from the same direction. Red Court keeps to the dark. Everyone else just tries not to get stepped on."`,
      branches: [
        {
          label: 'Tell me about the Scar.',
          targetNode: 'patch_trade_intel',
        },
        {
          label: "That's enough for now.",
          targetNode: 'patch_closure',
        },
      ],
    },

    patch_closure: {
      id: 'patch_closure',
      speaker: 'Patch',
      text: `${rt.npc('Patch')} goes back to sorting. "That's what I've got. Come back with something worth trading."`,
    },

    patch_closure_empty: {
      id: 'patch_closure_empty',
      speaker: 'Patch',
      text: `${rt.npc('Patch')} shrugs — one shoulder, economical. "That's what I've got. Come back with something worth trading."`,
    },
  },
}

// ------------------------------------------------------------
// HOWARD — Bridge Keeper (River Road)
// Voice: weathered, practical, watches the road
// ------------------------------------------------------------

const howardTree: DialogueTree = {
  npcId: 'howard_bridge_keeper',
  startNode: 'howard_start',
  nodes: {
    howard_start: {
      id: 'howard_start',
      speaker: 'Howard',
      text: `${rt.npc('Howard')} leans against the bridge rail, arms crossed. "Crossing's five rounds. That's non-negotiable — except when it is. What do you need?"`,
      branches: [
        {
          label: 'What should I know about the road ahead?',
          targetNode: 'howard_road_ahead',
        },
        {
          label: '[Negotiation DC 10] Can we work out a discount on the crossing fee?',
          targetNode: 'howard_negotiate_success',
          skillCheck: { skill: 'negotiation', dc: 10 },
          failNode: 'howard_negotiate_fail',
        },
      ],
    },

    howard_road_ahead: {
      id: 'howard_road_ahead',
      speaker: 'Howard',
      text: `"South is Accord territory — patrolled, safe enough. East takes you toward Salt Creek. Salters don't bother travelers unless you bother their operation." He pauses. "North is different. Kindling's been moving through at night. Organized. Quiet. That's new."`,
      branches: [
        {
          label: 'Kindling? What are they doing out here?',
          targetNode: 'howard_kindling',
        },
        {
          label: 'Thanks, Howard.',
          targetNode: 'howard_closure',
        },
      ],
    },

    howard_kindling: {
      id: 'howard_kindling',
      speaker: 'Howard',
      text: `"Don't know. Don't want to." ${rt.npc('Howard')} looks north. "I've been on this bridge since '32. I know what normal movement looks like. This isn't that. Small groups, no torches, moving fast. Something's pulling them toward the pine country."`,
      branches: [
        {
          label: "You've been watching this river a long time. It must drop things.",
          targetNode: 'howard_cache_hint',
          requiresFlag: 'howard_waived_fee',
        },
        {
          label: 'I appreciate the warning.',
          targetNode: 'howard_closure',
        },
      ],
    },

    howard_cache_hint: {
      id: 'howard_cache_hint',
      speaker: 'Howard',
      text: `${rt.npc('Howard')} watches the water for a while before he answers. "Current eats everything eventually. Drops what it eats at the bends. There's a bend three hundred yards south of the narrows, where a big basalt shelf kinks the flow. Drifter caravans used to stash supplies upstream of it, seal them in waxed tins, let the current take them down to the shelf. The tins wedge under the rock. They're still there. Ammunition, mostly. Sealed well enough to last another twenty years." He looks at you. "You pulled me out of a hard month last time we talked. I wouldn't tell most people. Don't make me regret it."`,
      onEnter: {
        grantNarrativeKey: 'river_road_submerged_cache',
      },
      branches: [
        {
          label: "I won't. Thank you.",
          targetNode: 'howard_closure',
        },
      ],
    },

    howard_negotiate_success: {
      id: 'howard_negotiate_success',
      speaker: 'Howard',
      text: `${rt.npc('Howard')} studies you for a moment, then nods slowly. "Fine. You've got an honest face — or a good one. Cross for free this time. Don't make me regret it."`,
      onEnter: {
        setFlag: 'howard_waived_fee',
      },
      branches: [
        {
          label: 'What can you tell me about the road?',
          targetNode: 'howard_road_ahead',
        },
        {
          label: "I won't. Thanks.",
          targetNode: 'howard_closure',
        },
      ],
    },

    howard_negotiate_fail: {
      id: 'howard_negotiate_fail',
      speaker: 'Howard',
      text: `"No." ${rt.npc('Howard')} doesn't blink. "Five rounds. The bridge costs what the bridge costs. I built it. I maintain it. That's the price."`,
      branches: [
        {
          label: 'Fair enough. What about the road ahead?',
          targetNode: 'howard_road_ahead',
        },
        {
          label: "I'll pay.",
          targetNode: 'howard_closure',
        },
      ],
    },

    howard_closure: {
      id: 'howard_closure',
      speaker: 'Howard',
      text: `${rt.npc('Howard')} nods once. "Be careful north of the fork. Something's changed."`,
    },
  },
}

// ------------------------------------------------------------
// MARTA — Food Vendor (Crossroads)
// Voice: warm but tired, feeds everyone, sees everything
// ------------------------------------------------------------

const martaTree: DialogueTree = {
  npcId: 'marta_food_vendor',
  startNode: 'marta_start',
  nodes: {
    marta_start: {
      id: 'marta_start',
      speaker: 'Marta',
      text: `${rt.npc('Marta')} wipes her hands on her apron and looks you over. "Hungry? You look hungry. Everyone who comes through here looks hungry. Sit down — we'll talk while the stew heats."`,
      branches: [
        {
          label: `Buy a meal. (${rt.currency('5 rounds')})`,
          targetNode: 'marta_buy_meal',
          requiresItem: 'ammo_22lr',
        },
        {
          label: 'What have you been hearing around the Crossroads?',
          targetNode: 'marta_gossip',
        },
        {
          label: 'Just passing through.',
          targetNode: 'marta_closure',
        },
      ],
    },

    marta_buy_meal: {
      id: 'marta_buy_meal',
      speaker: 'Marta',
      text: `She sets down a bowl of something thick and warm. It smells like the old world — real ingredients, real care. "Eat slow. That's half a day's work in that bowl."`,
      onEnter: {
        removeItem: ['ammo_22lr'],
        setFlag: { marta_fed_player: true },
      },
      branches: [
        {
          label: 'This is incredible. What do you hear around here?',
          targetNode: 'marta_gossip',
        },
        {
          label: 'Thank you, Marta.',
          targetNode: 'marta_closure',
        },
      ],
    },

    marta_gossip: {
      id: 'marta_gossip',
      speaker: 'Marta',
      text: `"Everyone eats. Which means I hear everything." ${rt.npc('Marta')} lowers her voice. "Accord's tightening patrols — Marshal Cross has people nervous. Salters are quieter than usual, which is worse than when they're loud. And the Kindling? Someone saw torches in the Pine Sea. Nobody goes to the Pine Sea."`,
      branches: [
        {
          label: 'Tell me more about the Kindling.',
          targetNode: 'marta_faction_detail',
        },
        {
          label: "That's useful. Thanks.",
          targetNode: 'marta_closure',
        },
      ],
    },

    marta_faction_detail: {
      id: 'marta_faction_detail',
      speaker: 'Marta',
      text: `"The Kindling believe in purification. Transformation. They think CHARON-7 is a gift and the rest of us just aren't ready for it." She shakes her head. "They're not wrong about everything. They're just wrong about the fire part."`,
      branches: [
        {
          label: "You've been here a long time, haven't you?",
          targetNode: 'marta_cellar_memory',
          requiresFlag: 'marta_fed_player',
        },
        {
          label: 'I appreciate you telling me.',
          targetNode: 'marta_closure',
        },
      ],
    },

    marta_cellar_memory: {
      id: 'marta_cellar_memory',
      speaker: 'Marta',
      text: `${rt.npc('Marta')} looks at you for a long moment. Weighing. Then she leans close enough that her voice doesn't carry past the cookstove. "Longer than the Crossroads has been Crossroads. My mother ran caravans through here when it was just a waystation — before the stalls, before the wall. The Drifters buried things in the ground here, for seasons when the going was bad." She glances down at the packed dirt between the stalls. "Second stall from the end, near the leather shop. The floor sounds different if you step on it right. My mother showed me where to press. I haven't opened it since she died. I'm telling you because you've eaten my stew and you haven't lied to me yet. That's rare."`,
      onEnter: {
        grantNarrativeKey: 'crossroads_hidden_cellar',
      },
      branches: [
        {
          label: "Thank you for trusting me.",
          targetNode: 'marta_closure',
        },
      ],
    },

    marta_closure: {
      id: 'marta_closure',
      speaker: 'Marta',
      text: `${rt.npc('Marta')} turns back to her stove. "Eat. You look like you need it more than most."`,
    },
  },
}

// ------------------------------------------------------------
// DELL — Prisoner (Covenant)
// Voice: desperate, bargaining, has intel
// ------------------------------------------------------------

const dellTree: DialogueTree = {
  npcId: 'prisoner_dell',
  startNode: 'dell_start',
  nodes: {
    dell_start: {
      id: 'dell_start',
      speaker: 'Dell',
      text: `${rt.npc('Dell')} presses against the bars. His voice is low, urgent. "You're not Accord. I can tell. That means you've got about three minutes before the patrol comes back. I have information — real information — about what's happening in the Scar. What's it worth to you?"`,
      branches: [
        {
          label: 'What kind of information?',
          targetNode: 'dell_offer_intel',
        },
        {
          label: '[Presence DC 11] Talk. Now. Before I decide this isn\'t worth my time.',
          targetNode: 'dell_intimidate_success',
          skillCheck: { skill: 'presence', dc: 11 },
          failNode: 'dell_intimidate_fail',
        },
      ],
    },

    dell_offer_intel: {
      id: 'dell_offer_intel',
      speaker: 'Dell',
      text: `"The Scar isn't empty. There's something down there — organized, not Hollow, not feral. Something that was there before the Collapse. Cross knows. That's why I'm in here — I saw it, and I told the wrong person." His knuckles whiten on the bars. "Get me out, and I'll tell you everything. Or tell Cross what I know, and maybe he lets me rot instead of worse."`,
      branches: [
        {
          label: "I'll help you escape.",
          targetNode: 'dell_escape_offer',
        },
        {
          label: "I'll bring this to Cross.",
          targetNode: 'dell_report_cross',
        },
      ],
    },

    dell_intimidate_success: {
      id: 'dell_intimidate_success',
      speaker: 'Dell',
      text: `${rt.npc('Dell')} flinches, then talks fast. "The Scar. There's a structure — pre-Collapse, military. Something's active down there. Cross has been sending scouts and they don't come back. That's all I know. That's everything." He sinks back against the wall.`,
      onEnter: {
        setFlag: { dell_shared_scar_intel: true },
      },
      branches: [
        {
          label: 'That changes things. I need to see it for myself.',
          targetNode: 'dell_closure',
        },
      ],
    },

    dell_intimidate_fail: {
      id: 'dell_intimidate_fail',
      speaker: 'Dell',
      text: `${rt.npc('Dell')} doesn't move. "You'll have to do better than that. I've been threatened by professionals. What I know is the only thing keeping me alive. So — help me, or help Cross. Pick one."`,
      branches: [
        {
          label: "Fine. What's the deal?",
          targetNode: 'dell_offer_intel',
        },
      ],
    },

    dell_escape_offer: {
      id: 'dell_escape_offer',
      speaker: 'Dell',
      text: `"There's a drainage grate behind the east wall of the stockade. Rusted through. Bring me something to pry it with and I'll be gone by dawn." His eyes are steady. "And you'll have a friend who knows what's in the Scar."`,
      onEnter: {
        setFlag: { dell_escape_partner: true },
      },
      branches: [
        {
          label: "I'll see what I can do.",
          targetNode: 'dell_closure',
        },
      ],
    },

    dell_report_cross: {
      id: 'dell_report_cross',
      speaker: 'Dell',
      text: `${rt.npc('Dell')} goes very still. "Then you're Accord at heart. Fine. Tell Cross that Dell says the Scar is active. He'll know what it means. Maybe he'll even thank you." The bitterness is quiet, practiced.`,
      onEnter: {
        setFlag: { player_accord_loyalist: true },
      },
      branches: [
        {
          label: 'I hope you make it, Dell.',
          targetNode: 'dell_closure',
        },
      ],
    },

    dell_closure: {
      id: 'dell_closure',
      speaker: 'Dell',
      text: `${rt.npc('Dell')} slides back against the wall. "Remember me. When you're out there. Remember someone told you the truth."`,
    },
  },
}

// ------------------------------------------------------------
// DR. OSEI — Virologist (Pine Sea / Breaks)
// Voice: precise, hopeful, exhausted from research
// ------------------------------------------------------------

const oseiTree: DialogueTree = {
  npcId: 'dr_ama_osei',
  startNode: 'osei_start',
  nodes: {
    osei_start: {
      id: 'osei_start',
      speaker: 'Dr. Ama Osei',
      text: `${rt.npc('Dr. Ama Osei')} looks up from a rack of glass vials, each labeled in precise handwriting. "You're not infected. Good — I need an uncontaminated perspective. Also, possibly, your help. Sit. Don't touch anything."`,
      branches: [
        {
          label: 'How is the cure research going?',
          targetNode: 'osei_research',
        },
        {
          label: `I have a ${rt.item('Sanguine Blood Vial')} — would that help?`,
          targetNode: 'osei_provide_vial',
          requiresItem: 'sanguine_blood_vial',
        },
      ],
    },

    osei_research: {
      id: 'osei_research',
      speaker: 'Dr. Ama Osei',
      text: `"Slowly. Correctly." She adjusts a slide under the microscope. "I've isolated the binding mechanism — the virus rewrites cellular identity at the mitochondrial level. Elegant, if you're not the one being rewritten. I need more blood samples. Sanguine, specifically — ${rt.item('Sanguine Blood Vials')}. Feral or Lucid, doesn't matter. The viral load is what I need."`,
      branches: [
        {
          label: `I have a ${rt.item('Sanguine Blood Vial')}.`,
          targetNode: 'osei_provide_vial',
          requiresItem: 'sanguine_blood_vial',
        },
        {
          label: "I'll keep an eye out.",
          targetNode: 'osei_closure',
        },
      ],
    },

    osei_provide_vial: {
      id: 'osei_provide_vial',
      speaker: 'Dr. Ama Osei',
      text: `Her hands are steady as she takes the vial, holds it to the light. "This is viable. This is — yes. This completes the comparison set." For a moment the exhaustion lifts and something like hope crosses her face. "You may have just accelerated the timeline by weeks."`,
      onEnter: {
        setFlag: { osei_has_samples: true },
        removeItem: ['sanguine_blood_vial'],
        grantRep: { faction: 'lucid', delta: 1 },
      },
      branches: [
        {
          label: 'Good luck, Doctor.',
          targetNode: 'osei_closure',
        },
      ],
    },

    osei_closure: {
      id: 'osei_closure',
      speaker: 'Dr. Ama Osei',
      text: `${rt.npc('Dr. Ama Osei')} turns back to her work. "Science doesn't care about timelines. But the patients do."`,
    },
  },
}

// ------------------------------------------------------------
// ELDER KAI NEZ — Community Leader (The Breaks)
// Voice: measured, territorial, respects those who respect the land
// ------------------------------------------------------------

const kaiNezTree: DialogueTree = {
  npcId: 'elder_kai_nez',
  startNode: 'kai_nez_start',
  nodes: {
    kai_nez_start: {
      id: 'kai_nez_start',
      speaker: 'Elder Kai Nez',
      text: `${rt.npc('Elder Kai Nez')} studies you from across the fire. His expression gives nothing away. "You've come a long way to stand in someone else's territory. Tell me why."`,
      branches: [
        {
          label: "I'm passing through. I mean no disrespect.",
          targetNode: 'kai_nez_explain',
        },
        {
          label: 'I need safe passage through the Breaks.',
          targetNode: 'kai_nez_ask_passage',
        },
      ],
    },

    kai_nez_explain: {
      id: 'kai_nez_explain',
      speaker: 'Elder Kai Nez',
      text: `"Passing through." He turns the words over. "That's what most say. Some mean it. The land can tell the difference, even if I can't — not yet." He gestures toward the trail. "Speak plainly. What are you after?"`,
      branches: [
        {
          label: 'I need passage. I can offer trade goods.',
          targetNode: 'kai_nez_ask_passage',
        },
      ],
    },

    kai_nez_ask_passage: {
      id: 'kai_nez_ask_passage',
      speaker: 'Elder Kai Nez',
      text: `"Passage is earned or given. Not taken." He sets down his carving and looks at you directly. "Convince me you understand that."`,
      branches: [
        {
          label: '[Presence DC 10] I understand. This is your land — I ask permission, nothing more.',
          targetNode: 'kai_nez_passage_granted',
          skillCheck: { skill: 'presence', dc: 10 },
          failNode: 'kai_nez_passage_denied',
        },
        {
          label: 'I have trade goods that might be useful to your community.',
          targetNode: 'kai_nez_passage_trade',
        },
      ],
    },

    kai_nez_passage_granted: {
      id: 'kai_nez_passage_granted',
      speaker: 'Elder Kai Nez',
      text: `Something shifts in his expression — not warmth, but recognition. "You may pass. Follow the markers — the ones carved into stone, not wood. Wood rots. Stone remembers." He nods once. "You are welcome to water and rest before you go."`,
      onEnter: {
        setFlag: { kai_nez_granted_passage: true },
      },
      branches: [
        {
          label: 'Thank you, Elder.',
          targetNode: 'kai_nez_closure',
        },
      ],
    },

    kai_nez_passage_denied: {
      id: 'kai_nez_passage_denied',
      speaker: 'Elder Kai Nez',
      text: `"Words." He picks up his carving again. "Come back when you have something more than words. Trade goods, or better — patience."`,
      branches: [
        {
          label: 'I have trade goods.',
          targetNode: 'kai_nez_passage_trade',
        },
        {
          label: 'I understand. I will return.',
          targetNode: 'kai_nez_closure',
        },
      ],
    },

    kai_nez_passage_trade: {
      id: 'kai_nez_passage_trade',
      speaker: 'Elder Kai Nez',
      text: `He considers. "We could use supplies — medicine, tools, ammunition. Leave what you can spare with the woman at the edge of camp. If the offering is fair, you'll find the trail markers lit when you return."`,
      onEnter: {
        setFlag: { kai_nez_granted_passage: true },
      },
      branches: [
        {
          label: "I'll make it fair. Thank you.",
          targetNode: 'kai_nez_closure',
        },
      ],
    },

    kai_nez_closure: {
      id: 'kai_nez_closure',
      speaker: 'Elder Kai Nez',
      text: `${rt.npc('Elder Kai Nez')} returns to his carving. "Walk carefully. This land remembers who treats it well."`,
    },
  },
}

// ------------------------------------------------------------
// THE WREN — Red Court Hunter (field encounters)
// Voice: professional, amused, dangerous
// ------------------------------------------------------------

const wrenTree: DialogueTree = {
  npcId: 'the_wren',
  startNode: 'wren_start',
  nodes: {
    wren_start: {
      id: 'wren_start',
      speaker: 'The Wren',
      text: `${rt.npc('The Wren')} steps out of the shadow you weren't watching. His hand rests on something at his hip. "Most people don't get a conversation. Consider this professional courtesy. You have about thirty seconds to make it interesting."`,
      branches: [
        {
          label: '[Intimidation DC 12] You want to rethink this. I promise you do.',
          targetNode: 'wren_intimidate_success',
          skillCheck: { skill: 'intimidation', dc: 12 },
          failNode: 'wren_intimidate_fail',
        },
        {
          label: "I have information you'd find valuable. Trade?",
          targetNode: 'wren_info_barter',
        },
      ],
    },

    wren_intimidate_success: {
      id: 'wren_intimidate_success',
      speaker: 'The Wren',
      text: `${rt.npc('The Wren')} goes still. Then — slowly — a smile. Not friendly. Respectful. "Well. That's rare." His hand moves away from his hip. "I don't meet many people who mean it. You mean it." He takes a step back. "I'll remember this."`,
      onEnter: {
        setFlag: { wren_respects_player: true },
      },
      branches: [
        {
          label: 'Walk away, Wren.',
          targetNode: 'wren_closure',
        },
      ],
    },

    wren_intimidate_fail: {
      id: 'wren_intimidate_fail',
      speaker: 'The Wren',
      text: `"No." ${rt.npc('The Wren')} tilts his head. "I don't think I do. But I appreciate the effort — it's more than most manage. Try again. Different angle."`,
      branches: [
        {
          label: 'Fine — information. I know things about the Scar.',
          targetNode: 'wren_info_barter',
        },
      ],
    },

    wren_info_barter: {
      id: 'wren_info_barter',
      speaker: 'The Wren',
      text: `"Information." His eyes sharpen. "The Red Court is always buying. Tell me something I don't know about Hollow movement in the Pine Sea, and I'll pretend I never saw you. That's a generous exchange rate."`,
      onEnter: {
        setFlag: { wren_indebted: true },
      },
      branches: [
        {
          label: "Deal. Here's what I've seen.",
          targetNode: 'wren_closure',
        },
      ],
    },

    wren_closure: {
      id: 'wren_closure',
      speaker: 'The Wren',
      text: `${rt.npc('The Wren')} is already moving, melting back into cover. "Next time, I might not be in a talking mood."`,
    },
  },
}

// ------------------------------------------------------------
// SHEPHERD HERMIT — Wilderness Guide (Pine Sea)
// Voice: quiet, laconic, speaks to the forest more than people
// ------------------------------------------------------------

const shepherdHermitTree: DialogueTree = {
  npcId: 'shepherd_hermit',
  startNode: 'shepherd_start',
  nodes: {
    shepherd_start: {
      id: 'shepherd_start',
      speaker: 'The Shepherd',
      text: `${rt.npc('The Shepherd')} is crouched beside a game trail, reading signs you can't see. He acknowledges your presence the way a tree acknowledges wind — barely.`,
      branches: [
        {
          label: 'Do you know the routes through here?',
          targetNode: 'shepherd_ask_routes',
        },
        {
          label: "What's deeper in the forest?",
          targetNode: 'shepherd_deep_forest',
        },
      ],
    },

    shepherd_ask_routes: {
      id: 'shepherd_ask_routes',
      speaker: 'The Shepherd',
      text: `A long silence. Then: "Every route through the Pine Sea has changed in the last month. The ones that haven't changed are the ones you shouldn't trust."`,
      branches: [
        {
          label: '[Survival DC 9] I noticed — the game trails have shifted. Something pushed the herds south.',
          targetNode: 'shepherd_earn_respect',
          skillCheck: { skill: 'survival', dc: 9 },
          failNode: 'shepherd_no_respect',
        },
        {
          label: 'Can you show me the safe paths?',
          targetNode: 'shepherd_no_respect',
        },
      ],
    },

    shepherd_deep_forest: {
      id: 'shepherd_deep_forest',
      speaker: 'The Shepherd',
      text: `He looks into the trees for a long time. "Hollow. Not the shufflers you see at the edges. Something older. The forest is adapting to them, and they are adapting to the forest. That is not a process you want to be standing in the middle of."`,
      branches: [
        {
          label: 'You seem to manage.',
          targetNode: 'shepherd_ask_routes',
        },
        {
          label: 'Understood. I will be careful.',
          targetNode: 'shepherd_closure',
        },
      ],
    },

    shepherd_earn_respect: {
      id: 'shepherd_earn_respect',
      speaker: 'The Shepherd',
      text: `He looks at you — really looks, for the first time. "Yes. Something did." He stands. "The western ridge trail is still clean. Stay above the fog line before noon. After noon, drop to the creek bed — the Hollow avoid running water when the sun is up. That will get you through."`,
      onEnter: {
        setFlag: { shepherd_shared_routes: true },
      },
      branches: [
        {
          label: 'Thank you.',
          targetNode: 'shepherd_closure',
        },
      ],
    },

    shepherd_no_respect: {
      id: 'shepherd_no_respect',
      speaker: 'The Shepherd',
      text: `He shakes his head — once, slow. "The forest doesn't give up its paths to people who haven't earned them. Neither do I."`,
      branches: [
        {
          label: "Fair enough. What's deeper in?",
          targetNode: 'shepherd_deep_forest',
        },
        {
          label: "I'll find my own way.",
          targetNode: 'shepherd_closure',
        },
      ],
    },

    shepherd_closure: {
      id: 'shepherd_closure',
      speaker: 'The Shepherd',
      text: `${rt.npc('The Shepherd')} says nothing. He turns back to the trees.`,
    },
  },
}

// ------------------------------------------------------------
// DEACON HARROW — Kindling Leader (The Ember)
// dialogueTree IDs: 'em_harrow_nave_intro', 'em_harrow_chamber_quest'
// Charismatic through conviction. Uses "we" for faithful,
// "they" for outsiders. Calm certainty. The scariest thing
// about Harrow is he might be right.
// ------------------------------------------------------------

const harrowTree: DialogueTree = {
  npcId: 'deacon_harrow',
  startNode: 'harrow_start',
  nodes: {
    // ---- Root ----
    harrow_start: {
      id: 'harrow_start',
      speaker: 'Deacon Harrow',
      text: `${rt.npc('Deacon Harrow')} turns to you the way a flame turns toward oxygen — not aggressive, just drawn. "You've come to the flame." The greeting is warm. Too warm. The warmth of a man who has been expecting you specifically, even though he has never seen your face. "We don't get many visitors who stay long enough to hear what we're offering. Sit. Talk. The fire's patience is longer than mine, but I'll try."`,
      branches: [
        // ---- Echo branches (cycle 2+) ----
        {
          label: '"Your sister\'s name was Elena. I know what the first lesson cost."',
          targetNode: 'harrow_echo_truth',
          requiresCycleMin: 2,
          requiresPreviousQuest: 'harrow_recognized_truth',
        },
        {
          label: '"The flame remembers its own, Deacon."',
          targetNode: 'harrow_echo_faithful',
          requiresCycleMin: 2,
          requiresPreviousQuest: 'player_alignment_kindling',
        },
        {
          label: '"We\'ve met before, Harrow."',
          targetNode: 'harrow_echo_deceived',
          requiresCycleMin: 2,
          requiresPreviousQuest: 'player_deceived_harrow',
        },
        // ---- Standard branches ----
        {
          label: `Ask about the ${rt.keyword('Kindling')} faith.`,
          targetNode: 'harrow_faith',
        },
        {
          label: `"What is this ${rt.keyword('purification')} I keep hearing about?"`,
          targetNode: 'harrow_purification',
        },
        {
          label: 'Ask about the tunnel beneath The Ember.',
          targetNode: 'harrow_tunnel_gate',
          requiresFlag: 'em_incinerator_radiation_investigated',
        },
        {
          label: 'Ask about the tunnel beneath The Ember.',
          targetNode: 'harrow_tunnel_gate',
          requiresRep: { faction: 'kindling', min: 1 },
        },
        {
          label: '"I should go."',
          targetNode: 'harrow_leave',
        },
      ],
    },

    // ---- Echo: Recognized truth (cycle 2+) ----
    harrow_echo_truth: {
      id: 'harrow_echo_truth',
      speaker: 'Deacon Harrow',
      text: `${rt.npc('Deacon Harrow')} goes still. Not the stillness of composure — the stillness of a wound being touched by someone who knows exactly where it is. "Your eyes are different this time. You've already seen through the doctrine." He does not reach for the mask. For the first time, the man stands where the leader usually is. "Elena." He says the name like setting something down after carrying it too long. "You already know the way. The crypt entrance — behind the altar. The faithful won't stop you." He produces the brass key and holds it out. "Go see what we built on top of her grave. And when you come back, tell me if the lesson was wasted. You're the only person who's earned that answer twice."`,
      onEnter: {
        setFlag: { kindling_tunnel_access: true, harrow_recognized_truth: true, harrow_echo_acknowledged: true },
      },
      branches: [
        {
          label: '"I\'ll tell you. I promise."',
          targetNode: 'harrow_leave',
        },
      ],
    },

    // ---- Echo: Faithful (cycle 2+) ----
    harrow_echo_faithful: {
      id: 'harrow_echo_faithful',
      speaker: 'Deacon Harrow',
      text: `Something moves across ${rt.npc('Deacon Harrow')}'s face that is not surprise — it is the recognition of a prayer being answered. "Welcome back, faithful. The flame remembers its own." He places a hand on your shoulder. The grip is firm, warm, and this time it carries the weight of genuine reunion rather than recruitment. "The tunnel is open to you. It was always open to you. We kept your place by the fire." His eyes are bright with something that might be tears if Harrow were a man who permitted himself tears. "The ${rt.keyword('Kindling')} endures because people come back. You came back."`,
      onEnter: {
        setFlag: { kindling_tunnel_access: true, player_alignment_kindling: true, harrow_echo_acknowledged: true },
        grantRep: { faction: 'kindling', delta: 1 },
      },
      branches: [
        {
          label: '"The fire brought me home."',
          targetNode: 'harrow_leave',
        },
      ],
    },

    // ---- Echo: Deceived (cycle 2+) ----
    harrow_echo_deceived: {
      id: 'harrow_echo_deceived',
      speaker: 'Deacon Harrow',
      text: `${rt.npc('Deacon Harrow')}'s warmth doesn't leave his face. That's the part that's wrong. The warmth is still there but something beneath it has changed temperature — not cold, watchful. "Something about you is wrong. The flame sees deceit." He doesn't explain how he knows. The man who reads rooms for a living has read you, and this time the margin notes are in red. "You lied to me once. The fire remembers that too." His hands fold. The calm conviction is still there but it has edges now. "You may stay. You may speak. But every word you say will cost more than it did before. That is the weight of broken trust in the house of the flame."`,
      onEnter: {
        setFlag: 'harrow_echo_acknowledged',
      },
      branches: [
        {
          label: `[Presence DC 13] "I lied. I know that. But the fire showed me something real since then."`,
          targetNode: 'harrow_tunnel_join',
          skillCheck: { skill: 'presence', dc: 13 },
          failNode: 'harrow_tunnel_join_fail',
        },
        {
          label: `[Lore DC 14] "I know about Elena. I know what the first lesson cost. That's not a lie."`,
          targetNode: 'harrow_tunnel_truth',
          skillCheck: { skill: 'lore', dc: 14 },
          failNode: 'harrow_tunnel_truth_fail',
        },
        {
          label: '"I should go."',
          targetNode: 'harrow_leave',
        },
      ],
    },

    // ---- Branch 1: Faith ----
    harrow_faith: {
      id: 'harrow_faith',
      speaker: 'Deacon Harrow',
      text: `"${rt.keyword('CHARON-7')} is not a disease." He says this the way other people say the sky is blue. "It is a selection event. The old world assumed humanity was the final form — the end of the sentence. We know better. We are the draft. The virus is the editor." He gestures at the coal pit, the faithful kneeling around it. "They understood. Not because I told them. Because the fire showed them. We prepare the body and the spirit so that when ${rt.keyword('CHARON-7')} arrives — and it will arrive for everyone — the transformation completes. The ${rt.keyword('Hollow')} are the unprepared. The ${rt.keyword('Sanguine')} are the ones who were ready. We will all be ready." He watches you. "You'll understand eventually. Everyone does."`,
      branches: [
        {
          label: `Ask about the ${rt.keyword('purification')}.`,
          targetNode: 'harrow_purification',
        },
        {
          label: 'Back to other topics.',
          targetNode: 'harrow_start',
        },
        {
          label: '"I need to think about this."',
          targetNode: 'harrow_leave',
        },
      ],
    },

    // ---- Branch 2: Purification ----
    harrow_purification: {
      id: 'harrow_purification',
      speaker: 'Deacon Harrow',
      text: `"Preparation." He corrects the word gently, the way a teacher corrects a student. "We expose the faithful to controlled viral agents — graduated doses, community support, spiritual readiness. The body learns. The spirit learns. When the full transformation comes, they integrate rather than shatter." His hands are steady. "${rt.npc('Cross')} calls it reckless. ${rt.npc('Cross')} also has no plan for what happens when the infection rate reaches everyone. We do."`,
      branches: [
        {
          label: '"That sounds like murder."',
          targetNode: 'harrow_murder_accusation',
        },
        {
          label: '"How do you choose who\'s worthy?"',
          targetNode: 'harrow_criteria',
        },
        {
          label: 'Back to other topics.',
          targetNode: 'harrow_start',
        },
        {
          label: '"I should go."',
          targetNode: 'harrow_leave',
        },
      ],
    },

    harrow_murder_accusation: {
      id: 'harrow_murder_accusation',
      speaker: 'Deacon Harrow',
      text: `Something moves behind his eyes. Not anger — recognition. The mask flickers, and for a quarter-second you see the face of a man who has heard this before, possibly from himself. Then it closes. "Murder is what happens without preparation. A screamer tearing through a settlement — that is murder. A ${rt.keyword('Hollow')} wandering into ${rt.keyword('Salt Creek')} and being shot — that is murder." His voice drops. "What we do is triage. The virus does not negotiate. We negotiate with the virus. Some negotiations have costs." He does not look away from you. "I have buried every cost personally. Have you?"`,
      branches: [
        {
          label: '"How do you choose who undergoes it?"',
          targetNode: 'harrow_criteria',
        },
        {
          label: 'Back to other topics.',
          targetNode: 'harrow_start',
        },
        {
          label: '"I should go."',
          targetNode: 'harrow_leave',
        },
      ],
    },

    harrow_criteria: {
      id: 'harrow_criteria',
      speaker: 'Deacon Harrow',
      text: `"The body responds to the fire, or it does not. That is the only criterion." He speaks as if reciting something foundational. "We begin with low-grade exposure — controlled heat, controlled compounds. The faithful who integrate show signs within hours: stable temperature, clear eyes, the skin knitting instead of blistering. Those are the ones the fire has chosen." A pause that is not dramatic, just real. "The ones it hasn't chosen — they receive comfort, community, and the knowledge that they served the understanding. Their data teaches us who comes next." He means their deaths teach him. He means this sincerely.`,
      branches: [
        {
          label: `Ask about the ${rt.keyword('Kindling')} faith.`,
          targetNode: 'harrow_faith',
        },
        {
          label: 'Back to other topics.',
          targetNode: 'harrow_start',
        },
        {
          label: '"I should go."',
          targetNode: 'harrow_leave',
        },
      ],
    },

    // ---- Branch 3: The Tunnel (story-critical) ----
    harrow_tunnel_gate: {
      id: 'harrow_tunnel_gate',
      speaker: 'Deacon Harrow',
      text: `His expression sharpens — not hostile, evaluative. "The tunnels. You know more than most outsiders." He folds his hands. "What we've found beneath ${rt.keyword('The Ember')} connects to something older than the ${rt.keyword('Kindling')}. Older than the Collapse. ${rt.keyword('MERIDIAN')} built passages down there, and they didn't build them for storage." He studies you. "Access to that passage is not given lightly. The faithful walk that road because they've earned it. You are not faithful." A beat. "But perhaps you could be. Or perhaps you have something else to offer."`,
      branches: [
        {
          label: '[Presence DC 10] "I believe in the purification. I want to walk the path."',
          targetNode: 'harrow_tunnel_join',
          skillCheck: { skill: 'presence', dc: 10 },
          failNode: 'harrow_tunnel_join_fail',
        },
        {
          label: '[Lore DC 11] "I\'ve seen what CHARON-7 does. Your sister wasn\'t chosen."',
          targetNode: 'harrow_tunnel_truth',
          skillCheck: { skill: 'lore', dc: 11 },
          failNode: 'harrow_tunnel_truth_fail',
        },
        {
          label: '[Shadow DC 12] "The flame showed me the way here. I had a vision."',
          targetNode: 'harrow_tunnel_deception',
          skillCheck: { skill: 'stealth', dc: 12 },
          failNode: 'harrow_tunnel_deception_fail',
        },
        {
          label: '"I need to think about this."',
          targetNode: 'harrow_leave',
        },
      ],
    },

    // Sub-branch A: Join the faithful (Presence DC 10 — success)
    harrow_tunnel_join: {
      id: 'harrow_tunnel_join',
      speaker: 'Deacon Harrow',
      text: `He searches your face for a long time. Whatever he finds there satisfies him — or satisfies the part of him that needs to believe. "Yes," he says, quietly. "I see it. The fire has already been working in you." He places a hand on your shoulder. The grip is firm and warm. "Welcome to the path. The tunnel entrance is behind the altar in the lower crypt — the faithful will let you pass. What you find down there will confirm what you already feel." His eyes are bright. "We are building something, you and I. Something that outlasts the old world's mistakes."`,
      onEnter: {
        setFlag: { kindling_tunnel_access: true, player_alignment_kindling: true },
        grantRep: { faction: 'kindling', delta: 1 },
      },
      branches: [
        {
          label: '"Thank you, Deacon."',
          targetNode: 'harrow_leave',
        },
      ],
    },

    // Sub-branch A: Join fail
    harrow_tunnel_join_fail: {
      id: 'harrow_tunnel_join_fail',
      speaker: 'Deacon Harrow',
      text: `He tilts his head. The warmth doesn't leave his face, but something behind it recalibrates. "The words are right. The conviction isn't. Not yet." He withdraws his hand. "I don't blame you — faith is not performed, it is arrived at. Come back when you've stopped trying to believe and started believing. You'll know the difference. I'll know the difference."`,
      branches: [
        {
          label: 'Back to other topics.',
          targetNode: 'harrow_start',
        },
        {
          label: '"I should go."',
          targetNode: 'harrow_leave',
        },
      ],
    },

    // Sub-branch B: Honest skeptic (Lore DC 11 — success)
    harrow_tunnel_truth: {
      id: 'harrow_tunnel_truth',
      speaker: 'Deacon Harrow',
      text: `He goes still. Not the stillness of composure — the stillness of something struck. For three seconds, ${rt.npc('Deacon Harrow')} is not a leader, not a theologian, not a man with answers. He is a brother who watched his sister scream for three days and built a religion around the wound. Then the mask returns, seamless, except that you saw what was under it. "You know more than you should." His voice is level but the temperature has changed. "My sister's transformation was not a failure. It was the first lesson. The lesson cost everything." He exhales. "You are not faithful. But you are honest, and honesty is rarer than faith in my experience." He reaches into his coat and produces a worn brass key. "The crypt entrance, behind the altar. Go. See what ${rt.keyword('MERIDIAN')} left. And then tell me whether my sister's lesson was wasted."`,
      onEnter: {
        setFlag: { kindling_tunnel_access: true, harrow_recognized_truth: true },
      },
      branches: [
        {
          label: '"I will."',
          targetNode: 'harrow_leave',
        },
      ],
    },

    // Sub-branch B: Truth fail
    harrow_tunnel_truth_fail: {
      id: 'harrow_tunnel_truth_fail',
      speaker: 'Deacon Harrow',
      text: `"My sister." The two words arrive with a weight that stops the conversation. "You heard a rumor. You are using it as leverage." The warmth is gone. In its place: the quiet of a man who has killed rumor-spreaders before or has considered it seriously. "Do not speak about things you have not earned the right to speak about. Come back with understanding, not gossip."`,
      branches: [
        {
          label: 'Back to other topics.',
          targetNode: 'harrow_start',
        },
        {
          label: '"I should go."',
          targetNode: 'harrow_leave',
        },
      ],
    },

    // Sub-branch C: Deception (Shadow DC 12 — success)
    harrow_tunnel_deception: {
      id: 'harrow_tunnel_deception',
      speaker: 'Deacon Harrow',
      text: `His pupils dilate. For a man who reads people for a living, he wants this to be true badly enough to stop reading. "A vision." He breathes the word. "Tell me — was there light at the center, or heat?" He doesn't wait for your answer. "Heat. Yes. The flame doesn't show itself as light to the chosen. It shows itself as temperature. As change at the cellular level." He grips your arm. "The tunnel is beneath the altar in the lower crypt. The faithful will let you pass. Go quickly — the vision fades if you wait." He is so certain that your lie is his truth. The ease of it sits badly.`,
      onEnter: {
        setFlag: { kindling_tunnel_access: true, player_deceived_harrow: true },
      },
      branches: [
        {
          label: 'Thank the Deacon and leave.',
          targetNode: 'harrow_leave',
        },
      ],
    },

    // Sub-branch C: Deception fail
    harrow_tunnel_deception_fail: {
      id: 'harrow_tunnel_deception_fail',
      speaker: 'Deacon Harrow',
      text: `He stares at you. The warmth holds for two seconds, then cools to something clinical. "No. You didn't." He doesn't explain how he knows. "I have spent twenty years reading rooms. I know what a vision looks like in someone's eyes, and I know what invention looks like. You have the second." He steps back. "The door is closed to you today. It does not have to be closed permanently. But lying to me was a choice, and choices have weight."`,
      branches: [
        {
          label: 'Back to other topics.',
          targetNode: 'harrow_start',
        },
        {
          label: '"I should go."',
          targetNode: 'harrow_leave',
        },
      ],
    },

    // ---- Branch 4: Leave ----
    harrow_leave: {
      id: 'harrow_leave',
      speaker: 'Deacon Harrow',
      text: `He nods once — not dismissal, release. "The flame will be here when you're ready. It doesn't keep hours." He turns back to the coal pit, or the ledger, or the group of faithful waiting for his attention. You have been assessed, filed, and set aside for later consideration. The warmth doesn't leave his voice. That's the part that follows you out.`,
    },
  },
}

// ------------------------------------------------------------
// AVERY — Kindling Doubter (The Ember, Bell Tower)
// dialogueTree ID: 'em_avery_doubt'
// Young, uncertain, afraid of Harrow but more afraid of what
// happens if Harrow's right. Speaks quietly, checks over
// shoulder.
// ------------------------------------------------------------

const averyTree: DialogueTree = {
  npcId: 'kindling_doubter_avery',
  startNode: 'avery_start',
  nodes: {
    // ---- Root ----
    avery_start: {
      id: 'avery_start',
      speaker: 'Avery',
      text: `${rt.npc('Avery')} glances toward the stairs, then back. The check is automatic — the habit of someone who has been overheard before and learned from it. "You're not one of us. Good." The word 'good' comes out quieter than the rest, as if it surprised him too. "I mean — I can talk to you. Without it getting reported to ${rt.npc('Harrow')} as a spiritual development opportunity." A ghost of a smile that doesn't survive contact with his eyes.`,
      branches: [
        // ---- Echo branches (cycle 2+) ----
        {
          label: '"Avery. You made it out last time. I helped you leave."',
          targetNode: 'avery_echo_left',
          requiresCycleMin: 2,
          requiresPreviousQuest: 'avery_will_leave',
        },
        {
          label: '"Avery... I\'m sorry about last time."',
          targetNode: 'avery_echo_betrayed',
          requiresCycleMin: 2,
          requiresPreviousQuest: 'avery_betrayed',
        },
        // ---- Standard branches ----
        {
          label: '"You have doubts about the Kindling."',
          targetNode: 'avery_doubt',
        },
        {
          label: `"What can you tell me about ${rt.npc('Deacon Harrow')}?"`,
          targetNode: 'avery_doubt',
        },
        {
          label: '"I should go."',
          targetNode: 'avery_leave',
        },
      ],
    },

    // ---- Echo: Avery left (cycle 2+) ----
    avery_echo_left: {
      id: 'avery_echo_left',
      speaker: 'Avery',
      text: `${rt.npc('Avery')} stares at you. The glance toward the stairs doesn't happen — the habit is gone, replaced by the posture of someone who no longer needs to check. Because ${rt.npc('Avery')} is not in the bell tower. ${rt.npc('Avery')} is here, in ${rt.keyword('Crossroads')}, wearing different clothes and standing straighter and looking at you with eyes that are still afraid but afraid of different things now. "You helped me leave. I made it to ${rt.keyword('Crossroads')}." The ghost smile from before — except this time it reaches his eyes. "${rt.npc('Patch')} gave me work. Medical supply runs. Turns out I'm good at logistics when I'm not spending all my energy on being terrified." He grips your arm — the same grip, brief and hard. "Thank you. For making it real instead of just a thought I had at three in the morning."`,
      onEnter: {
        setFlag: 'avery_echo_acknowledged',
      },
      branches: [
        {
          label: '"I\'m glad you made it, Avery."',
          targetNode: 'avery_echo_left_closure',
        },
        {
          label: '"What have you heard since you left the Kindling?"',
          targetNode: 'avery_echo_left_intel',
        },
      ],
    },

    avery_echo_left_closure: {
      id: 'avery_echo_left_closure',
      speaker: 'Avery',
      text: `He nods. The nod is different — less furtive, more grounded. "I'm glad too. Most days." A pause. "Some days I still check the stairs. Force of habit." The smile again. "But the stairs don't go anywhere dangerous anymore."`,
    },

    avery_echo_left_intel: {
      id: 'avery_echo_left_intel',
      speaker: 'Avery',
      text: `"The ${rt.keyword('Kindling')} is growing. ${rt.npc('Harrow')}'s been recruiting harder since I left — or since someone left, he probably doesn't know it was me specifically." ${rt.npc('Avery')} lowers his voice — old habit, new context. "The purification rate has increased. Three this month. ${rt.npc('Patch')} has been tracking the casualties through medical supply requests. The numbers don't look good." He meets your eyes. "I can't go back in there. But if you're going — be careful. ${rt.npc('Harrow')} remembers faces better than he lets on."`,
      onEnter: {
        setFlag: 'avery_shared_kindling_intel',
      },
      branches: [
        {
          label: '"Thank you, Avery. Stay safe."',
          targetNode: 'avery_echo_left_closure',
        },
      ],
    },

    // ---- Echo: Avery betrayed (cycle 2+) ----
    avery_echo_betrayed: {
      id: 'avery_echo_betrayed',
      speaker: 'Avery',
      text: `${rt.npc('Avery')} is not in the bell tower. A young ${rt.keyword('Kindling')} member stands where he used to sit — different face, same nervous posture, same automatic glance toward the stairs. They look at you without recognition. "${rt.npc('Avery')}?" A pause. "Haven't heard that name in a while. He was reassigned after his — spiritual reassessment." The words are ${rt.npc('Harrow')}'s words in someone else's mouth. "I think he's in the lower chambers now. Or he left. People leave sometimes." They don't sound convinced of either option. The bell tower is the same. The stone is the same. The absence is specific and heavy.`,
      onEnter: {
        setFlag: 'avery_echo_acknowledged',
      },
      branches: [
        {
          label: '"What happened to him?"',
          targetNode: 'avery_echo_betrayed_detail',
        },
        {
          label: '"I should go."',
          targetNode: 'avery_leave',
        },
      ],
    },

    avery_echo_betrayed_detail: {
      id: 'avery_echo_betrayed_detail',
      speaker: 'Kindling Acolyte',
      text: `The acolyte shifts their weight. "I don't — ${rt.npc('Harrow')} said it was a matter of faith. That ${rt.npc('Avery')} needed guidance. Intensive guidance." They glance at the stairs again. "I was given this post two weeks ago. They told me to watch and pray." The silence that follows is the specific silence of a question the acolyte has learned not to ask.`,
      branches: [
        {
          label: '"I understand. Thank you."',
          targetNode: 'avery_leave',
        },
      ],
    },

    // ---- Branch 1: Doubt ----
    avery_doubt: {
      id: 'avery_doubt',
      speaker: 'Avery',
      text: `He sits down against the bell housing. The stone is cold and he doesn't seem to notice. "I've been here two years. I've seen eleven ${rt.keyword('purifications')}." He holds up his hands — all ten fingers, then one more. "Seven survived. Four didn't." He stares at his hands like the math is written on them. "${rt.npc('Harrow')} says the ones who didn't make it weren't ready. That the fire selects. But I watched Miriam go through it. Miriam was readier than anyone. Miriam believed harder than ${rt.npc('Harrow')}." His voice drops to almost nothing. "Miriam screamed for six hours and then stopped screaming and then stopped. The fire didn't select Miriam. The fire just burned her."`,
      onEnter: {
        setFlag: 'avery_shared_doubts',
      },
      branches: [
        {
          label: `"What do you know about ${rt.npc('Harrow')}'s past?"`,
          targetNode: 'avery_harrow_secret',
          requiresFlag: 'avery_shared_doubts',
        },
        {
          label: '"Have you thought about leaving?"',
          targetNode: 'avery_help_leave',
          requiresFlag: 'avery_shared_doubts',
        },
        {
          label: '"I should go."',
          targetNode: 'avery_leave',
        },
      ],
    },

    // ---- Branch 2: Harrow's Secret ----
    avery_harrow_secret: {
      id: 'avery_harrow_secret',
      speaker: 'Avery',
      text: `Another glance at the stairs. This one is slower, more deliberate — checking for real, not from habit. "${rt.npc('Harrow')} had a sister. Elena. She was one of the first infected in the region — before the ${rt.keyword('Kindling')} existed, before any of this." He pulls his knees up. "She turned ${rt.keyword('Hollow')}. ${rt.npc('Harrow')} tried to bring her back. Heat exposure, compounds, prayer — everything that became the ${rt.keyword('Purification')}, he tried on Elena first." A long silence. "She died. He buried her in the ash garden. The first stone is hers, but it doesn't say Elena on it. It says 'THE FIRST LESSON.'" He looks at you with the expression of someone who has carried this for too long. "The entire ${rt.keyword('Kindling')} theology is built on a man trying to save his sister and failing and deciding the failure was divine instead of just failure. That's what I can't stop thinking about."`,
      onEnter: {
        setFlag: 'avery_revealed_harrow_secret',
      },
      branches: [
        {
          label: `[Presence DC 9] "Come with me. ${rt.keyword('Crossroads')} is neutral ground."`,
          targetNode: 'avery_encourage_leave',
          skillCheck: { skill: 'presence', dc: 9 },
          failNode: 'avery_encourage_fail',
        },
        {
          label: `"${rt.npc('Harrow')} should know about your doubts."`,
          targetNode: 'avery_betrayed',
        },
        {
          label: '"Thank you for telling me."',
          targetNode: 'avery_leave',
        },
      ],
    },

    // ---- Branch 3: Help Avery Leave ----
    avery_help_leave: {
      id: 'avery_help_leave',
      speaker: 'Avery',
      text: `"Every day." He says it immediately — no pause, no consideration. The answer was waiting. "But where? ${rt.keyword('The Breaks')} will kill me. ${rt.keyword('Salt Creek')} doesn't take ${rt.keyword('Kindling')} defectors — they assume we're all contaminated. The ${rt.keyword('Accord')} would want information I'm not sure I should give." He looks south, toward the canyon country. "Leaving isn't just walking out. Leaving is having somewhere to walk to."`,
      branches: [
        {
          label: `[Presence DC 9] "Come with me. ${rt.keyword('Crossroads')} is neutral ground."`,
          targetNode: 'avery_encourage_leave',
          skillCheck: { skill: 'presence', dc: 9 },
          failNode: 'avery_encourage_fail',
        },
        {
          label: `"${rt.npc('Harrow')} should know about your doubts."`,
          targetNode: 'avery_betrayed',
        },
        {
          label: '"I need to think about this."',
          targetNode: 'avery_leave',
        },
      ],
    },

    // Encourage leave (Presence DC 9 — success)
    avery_encourage_leave: {
      id: 'avery_encourage_leave',
      speaker: 'Avery',
      text: `He stands up. The motion is sudden — not panicked, decisive, the kind of decision that was already made and just needed someone else to witness it. "${rt.keyword('Crossroads')}. ${rt.npc('Patch')} is there — ${rt.npc('Patch')} doesn't judge, ${rt.npc('Patch')} just trades." He's talking faster now, planning in real time. "I can't take anything. ${rt.npc('Harrow')} tracks supplies. I leave with what I'm wearing and I don't look back." He faces you directly for the first time in the conversation. His eyes are clear. Afraid, but clear. "Give me two days. I need to be off the tower watch rotation first or they'll notice before I'm past the gate." He grips your arm — briefly, hard. "Thank you. For making it a real option instead of just a thought I had at three in the morning."`,
      onEnter: {
        setFlag: 'avery_will_leave',
        grantRep: { faction: 'drifters', delta: 1 },
      },
    },

    // Encourage leave — fail
    avery_encourage_fail: {
      id: 'avery_encourage_fail',
      speaker: 'Avery',
      text: `He considers it. You can see the want — it moves across his face like weather. Then it passes. "I can't. Not yet. Maybe not ever." He sits back down. "It's easy to say 'just leave' when you're not the one who has to walk past the gatekeepers and explain why you're carrying your bedroll at two in the morning." He pulls his knees back up. "I appreciate it. I do. But appreciation isn't enough to walk through that gate."`,
      branches: [
        {
          label: '"The offer stands."',
          targetNode: 'avery_leave',
        },
      ],
    },

    // Betray to Harrow
    avery_betrayed: {
      id: 'avery_betrayed',
      speaker: 'Avery',
      text: `The color leaves his face. It happens fast — the blood just goes, like a door closing. "You —" He steps back. His shoulders hit the bell housing and he flinches. "I told you because I thought you were — I thought —" He stops. The fear arrives fully formed, not building but complete, the fear of someone who has imagined this exact moment many times and is now living inside it. "Get out. Get out of the tower." His voice shakes but his eyes are hard. Whatever was soft in ${rt.npc('Avery')} just calcified. You did that. "If ${rt.npc('Harrow')} comes for me, I'll tell him everything I know about you too. Remember that."`,
      onEnter: {
        setFlag: { avery_betrayed: true },
        grantRep: { faction: 'kindling', delta: 1 },
      },
    },

    // ---- Branch 4: Leave ----
    avery_leave: {
      id: 'avery_leave',
      speaker: 'Avery',
      text: `He turns away. Quickly, practiced — the motion of someone who has learned to end conversations before they become noticeable. By the time you reach the stairs he is kneeling at the tower's south face, hands folded, eyes closed. To anyone watching from below, he is praying. You are not sure he isn't.`,
    },
  },
}

// ------------------------------------------------------------
// ELIAS VANE — The Broadcaster (The Scar)
// Seven years alone in MERIDIAN. The signal source.
// dialogueTree ID: 'scar_vane_broadcast'
// ------------------------------------------------------------

const vaneTree: DialogueTree = {
  npcId: 'vane_broadcaster',
  startNode: 'vane_start',
  nodes: {
    // ---- Root ----
    vane_start: {
      id: 'vane_start',
      speaker: 'The Broadcaster',
      text: `A thin man in a chair. The thinness is not starvation — it is seven years of eating exactly enough and no more. ${rt.npc('The Broadcaster')} looks at you for a long time. When he speaks, the words are careful. Considered. Chosen over two thousand five hundred and fifty-five days. "Seven years. You're the first." A pause. "I left it unlocked."`,
      onEnter: {
        setFlag: 'vane_introduced',
      },
      branches: [
        // ---- Echo branches (cycle 2+) ----
        {
          label: '"I\'ve been here before, Vane."',
          targetNode: 'vane_echo_return',
          requiresCycleMin: 2,
          requiresPreviousEnding: 'cure',
        },
        {
          label: '"I\'ve been here before, Vane."',
          targetNode: 'vane_echo_return',
          requiresCycleMin: 2,
          requiresPreviousEnding: 'weapon',
        },
        {
          label: '"I\'ve been here before, Vane."',
          targetNode: 'vane_echo_return',
          requiresCycleMin: 2,
          requiresPreviousEnding: 'seal',
        },
        {
          label: '"I\'ve been here before, Vane."',
          targetNode: 'vane_echo_return',
          requiresCycleMin: 2,
          requiresPreviousEnding: 'throne',
        },
        // ---- Standard branches ----
        {
          label: '"Who are you?"',
          targetNode: 'vane_who',
        },
        {
          label: `Ask about ${rt.keyword('CHARON-7')}.`,
          targetNode: 'vane_charon',
          requiresFlag: 'vane_introduced',
        },
        {
          label: `"Why the ${rt.keyword('signal')}? Why seven years?"`,
          targetNode: 'vane_signal',
        },
        {
          label: '"I should go."',
          targetNode: 'vane_leave',
        },
      ],
    },

    // ---- Echo: Return after any ending (cycle 2+) ----
    vane_echo_return: {
      id: 'vane_echo_return',
      speaker: 'The Broadcaster',
      text: `${rt.npc('The Broadcaster')} looks at you. The recognition is slow — not because he doesn't remember, but because he is allowing himself to believe it. Seven years alone, and now someone who has been here before. "You've been here before." It is not a question. "You chose. The terminals. The Core. I watched the readouts change and then — nothing. The cycle took you back." He is quiet for a long time. The broadcast console hums through its loop. "Was it the right choice?"`,
      onEnter: {
        setFlag: { vane_echo_acknowledged: true, vane_introduced: true },
      },
      branches: [
        {
          label: '"No. I need to try again."',
          targetNode: 'vane_echo_try_again',
        },
        {
          label: '"Yes. But I need to see the alternatives."',
          targetNode: 'vane_echo_alternatives',
        },
        {
          label: '"I don\'t remember."',
          targetNode: 'vane_echo_forgotten',
        },
      ],
    },

    vane_echo_try_again: {
      id: 'vane_echo_try_again',
      speaker: 'The Broadcaster',
      text: `${rt.npc('The Broadcaster')} nods. The motion is small, precise, and carries the weight of a man who has run every model and understands why none of them satisfied. "That's why you came back. The terminals are waiting. They always are." He stands — slowly, the way he does everything — and adjusts the broadcast console one final time. "I ran every utilitarian calculus. Every moral framework. Seven years." A pause that stretches like the silence between signal loops. "Maybe the answer isn't in the math. Maybe it's in the second try." He looks at you with something that might be hope, if Vane still had access to the unguarded version of it. "Go. The Core is still there. I'll keep the signal running — in case there's a third."`,
      onEnter: {
        setFlag: 'vane_described_core',
      },
      branches: [
        {
          label: '"Thank you, Vane."',
          targetNode: 'vane_farewell',
        },
        {
          label: `Ask about ${rt.keyword('CHARON-7')}.`,
          targetNode: 'vane_charon',
        },
      ],
    },

    vane_echo_alternatives: {
      id: 'vane_echo_alternatives',
      speaker: 'The Broadcaster',
      text: `"Curiosity or guilt." ${rt.npc('The Broadcaster')} says it without judgment — an observation from someone who has catalogued every human motivation that could possibly bring a person to this room. "Either works." He settles back into the chair. "The four terminals are still active. Cure, weapon, containment, dominion. Each one is still irreversible. Each one is still — depending on your perspective — the right answer." His hands rest on the console. "The difference is you've seen one outcome. That's more data than I ever had." He meets your eyes. "More data than anyone has ever had. Use it."`,
      onEnter: {
        setFlag: 'vane_described_core',
      },
      branches: [
        {
          label: '"I will."',
          targetNode: 'vane_farewell',
        },
        {
          label: `Ask about ${rt.keyword('CHARON-7')}.`,
          targetNode: 'vane_charon',
        },
      ],
    },

    vane_echo_forgotten: {
      id: 'vane_echo_forgotten',
      speaker: 'The Broadcaster',
      text: `${rt.npc('The Broadcaster')} is quiet for a very long time. When he speaks, the exhausted precision gives way to something gentler — the voice of a scientist confronting data that hurts. "${rt.keyword('CHARON-7')} takes more each time. The protein refolding degrades neural pathways. Memory is the first casualty." He looks at the broadcast console, then at his hands, then at you. "But the choice — the choice you remember. Everyone does." A pause. "You chose. I saw the readouts change. The specifics may have dissolved but something in you carried the weight of it back here. That's why you're standing in my room again instead of somewhere else." He stands. "The terminals are waiting. The Core is patient. And this time — maybe this time the math comes out different."`,
      onEnter: {
        setFlag: 'vane_described_core',
      },
      branches: [
        {
          label: '"Then I\'ll choose again."',
          targetNode: 'vane_farewell',
        },
        {
          label: '"Who are you?"',
          targetNode: 'vane_who',
        },
      ],
    },

    // ---- Branch 1: Who Are You ----
    vane_who: {
      id: 'vane_who',
      speaker: 'The Broadcaster',
      text: `"Elias Vane. Project Director, ${rt.keyword('MERIDIAN')} BioSystems, sub-reservoir facility." He says it like reading a headstone. "I ran the teams. I signed the authorizations. When it went wrong I stayed because — " He stops. Starts again. "Someone had to know. Not guess, not theorize. Know. I am the explanation. That's why I'm still here."`,
      branches: [
        {
          label: '"Why didn\'t you leave?"',
          targetNode: 'vane_why_stayed',
        },
        {
          label: 'Back to other topics.',
          targetNode: 'vane_start',
        },
      ],
    },

    vane_why_stayed: {
      id: 'vane_why_stayed',
      speaker: 'The Broadcaster',
      text: `${rt.npc('The Broadcaster')} looks at his hands. "Because leaving meant the data died with the facility. Because someone was going to come here eventually and they were going to need to understand what happened. Not the version the government filed. Not the version the Accord tells. The actual sequence." He meets your eyes. "I won't ask forgiveness. I didn't stay for that. I stayed because the truth needed a witness and I was the only one left."`,
      branches: [
        {
          label: `Ask about ${rt.keyword('CHARON-7')}.`,
          targetNode: 'vane_charon',
        },
        {
          label: 'Back to other topics.',
          targetNode: 'vane_start',
        },
      ],
    },

    // ---- Branch 2: CHARON-7 Truth ----
    vane_charon: {
      id: 'vane_charon',
      speaker: 'The Broadcaster',
      text: `${rt.npc('The Broadcaster')} stands. Slowly — the motion of someone who has not stood for another person in seven years. He walks to a filing cabinet and pulls out a folder so worn the edges are cloth-soft. "${rt.keyword('CHARON-7')}. R-1 was the field strain. Uncontrolled release, 2031. Fourteen percent survival rate — the rest went ${rt.keyword('Hollow')}." He sets the folder down. "R-8 was different. Refined. The ${rt.keyword('Sanguine')} expression pathway was engineered. Deliberately. That was us. That was this facility."`,
      branches: [
        {
          label: '"Why didn\'t you stop it?"',
          targetNode: 'vane_charon_memos',
        },
        {
          label: '"Who authorized R-8?"',
          targetNode: 'vane_charon_authorized',
        },
        {
          label: 'Back to other topics.',
          targetNode: 'vane_start',
        },
      ],
    },

    vane_charon_memos: {
      id: 'vane_charon_memos',
      speaker: 'The Broadcaster',
      text: `Something crosses his face that is not quite anger and not quite grief. "I wrote seventeen memos. Formal objections, risk assessments, projected casualty models. Every one was received, read, and filed. I kept copies." He opens a drawer. Inside, seventeen envelopes, each dated, each sealed with wax that has not been broken. "The authorization came from above the facility. Above the DOD acquisition chain. Someone wanted this outcome — not the ${rt.keyword('Hollow')}, not the death. The ${rt.keyword('Sanguine')}. The transformation."`,
      onEnter: {
        setFlag: 'vane_explained_charon',
      },
      branches: [
        {
          label: `"Tell me about the ${rt.keyword('Core')}."`,
          targetNode: 'vane_signal',
        },
        {
          label: 'Back to other topics.',
          targetNode: 'vane_start',
        },
      ],
    },

    vane_charon_authorized: {
      id: 'vane_charon_authorized',
      speaker: 'The Broadcaster',
      text: `${rt.npc('The Broadcaster')} shakes his head — once, precise. "The name is in the file. ${rt.keyword('File 47-B')}. Deepest archive, sub-level four. I sealed it because it should be found, not given." He looks at the filing cabinet. "I've had seven years to decide how much to tell and how much to leave for discovery. This one has to be discovered."`,
      onEnter: {
        setFlag: 'vane_explained_charon',
      },
      branches: [
        {
          label: `"Tell me about the ${rt.keyword('signal')}."`,
          targetNode: 'vane_signal',
        },
        {
          label: 'Back to other topics.',
          targetNode: 'vane_start',
        },
      ],
    },

    // ---- Branch 3: The Signal ----
    vane_signal: {
      id: 'vane_signal',
      speaker: 'The Broadcaster',
      text: `"Why broadcast for seven years?" He almost smiles. Almost. "Because someone needed to come here and make the choice I couldn't make." He gestures at the broadcast console — the equipment worn smooth by seven years of the same hands making the same adjustments. "Twelve words. Repeating. I changed the modulation every time atmospheric conditions shifted so anyone listening would know it wasn't automated. So they'd know a person was here."`,
      branches: [
        {
          label: '"What choice?"',
          targetNode: 'vane_the_choice',
        },
        {
          label: 'Back to other topics.',
          targetNode: 'vane_start',
        },
      ],
    },

    vane_the_choice: {
      id: 'vane_the_choice',
      speaker: 'The Broadcaster',
      text: `${rt.npc('The Broadcaster')} sits back down. The chair receives him like an old agreement. "The ${rt.keyword('Core')}. Sub-level four. Four terminals, four outcomes. Cure, weapon, containment, dominion." He counts them on fingers that have counted them many times before. "Each one changes what ${rt.keyword('CHARON-7')} becomes. Each one is irreversible. Each one is — depending on your perspective — the right answer."`,
      onEnter: {
        setFlag: 'vane_described_core',
      },
      branches: [
        {
          label: '"Which would you choose?"',
          targetNode: 'vane_his_choice',
        },
        {
          label: '"This is too much power for one person."',
          targetNode: 'vane_too_much',
        },
        {
          label: '"I\'m going now."',
          targetNode: 'vane_farewell',
        },
      ],
    },

    // ---- Branch 4: The Core Choice ----
    vane_his_choice: {
      id: 'vane_his_choice',
      speaker: 'The Broadcaster',
      text: `He is quiet for a long time. Long enough that the broadcast console hums through one full cycle. "Seven years. I still don't know. That's why it has to be you." He looks at the console, then at his hands, then at you. "I've run every model. Every moral framework. Every utilitarian calculus. They all give different answers. Which means the answer isn't in the math. It's in the person."`,
      branches: [
        {
          label: '"I\'m going now."',
          targetNode: 'vane_farewell',
        },
        {
          label: 'Back to other topics.',
          targetNode: 'vane_start',
        },
      ],
    },

    vane_too_much: {
      id: 'vane_too_much',
      speaker: 'The Broadcaster',
      text: `"Yes." No hesitation. No qualification. "And yet here we are." ${rt.npc('The Broadcaster')} spreads his hands — the gesture of someone presenting a problem that has no clean solution. "The Core exists. The four terminals exist. Someone will reach them. The only question is whether it's someone who understands the weight or someone who doesn't."`,
      branches: [
        {
          label: '"I\'m going now."',
          targetNode: 'vane_farewell',
        },
        {
          label: 'Back to other topics.',
          targetNode: 'vane_start',
        },
      ],
    },

    vane_farewell: {
      id: 'vane_farewell',
      speaker: 'The Broadcaster',
      text: `${rt.npc('The Broadcaster')} nods. Not surprised. "I know. I'll stay here. I've done my part." He turns back to the console and makes a small adjustment — the motion entirely automatic, seven years of muscle memory. "The signal will keep running. In case someone else comes. In case you need to find your way back." He does not look at you again. He has said what he needed to say.`,
      onEnter: {
        setFlag: 'vane_gave_blessing',
      },
    },

    // ---- Leave ----
    vane_leave: {
      id: 'vane_leave',
      speaker: 'The Broadcaster',
      text: `"I'll be here." ${rt.npc('The Broadcaster')} settles into the chair — the specific stillness of someone who has been in the same room for seven years and can wait in it for seven more. "I've been here for seven years. I can wait."`,
    },
  },
}

// ------------------------------------------------------------
// ELDER SANGUINE — Lucid Elder (The Deep)
// Ancient. 15+ years changed. Measures before speaking.
// dialogueTree ID: 'dp_elder_sanguine_sanctum'
// ------------------------------------------------------------

const elderSanguineTree: DialogueTree = {
  npcId: 'elder_sanguine_npc',
  startNode: 'elder_start',
  nodes: {
    // ---- Root ----
    elder_start: {
      id: 'elder_start',
      speaker: 'The Elder',
      text: `${rt.npc('The Elder')} regards you for a long time. The stillness is not hostility — it is measurement. When they speak, the voice is low and unhurried, as though language itself has become a considered resource. "You smell like the surface. Like sun and dust and the specific fear of open spaces." A pause that carries fifteen years of patience. "Sit."`,
      branches: [
        {
          label: `Ask about the ${rt.keyword('Lucid')}.`,
          targetNode: 'elder_lucid',
        },
        {
          label: `Ask about ${rt.keyword('CHARON-7')} origins.`,
          targetNode: 'elder_lore_tier_1',
        },
        {
          label: `"I need access to the ${rt.keyword('utility passage')}."`,
          targetNode: 'elder_utility_gate',
        },
        {
          label: `"I need safe passage through ${rt.keyword('Sanguine')} territory."`,
          targetNode: 'elder_passage',
        },
        {
          label: '"I should go."',
          targetNode: 'elder_leave',
        },
      ],
    },

    // ---- Branch 1: The Lucid ----
    elder_lucid: {
      id: 'elder_lucid',
      speaker: 'The Elder',
      text: `"We are what happens when the change does not destroy comprehension." ${rt.npc('The Elder')} folds their hands — the motion ancient and precise. "The ${rt.keyword('Lucid')} chose understanding. We study what we became. ${rt.npc('Vesper')} chose ethics — rules for the new hunger. ${rt.npc('Rook')} chose power — the ${rt.keyword('Red Court')} treats the changed as an army." A long breath. "Three responses to the same question. None of them wrong. All of them incomplete."`,
      onEnter: {
        setFlag: 'elder_discussed_lucid',
      },
      branches: [
        {
          label: `Ask about ${rt.keyword('CHARON-7')} origins.`,
          targetNode: 'elder_lore_tier_1',
        },
        {
          label: 'Back to other topics.',
          targetNode: 'elder_start',
        },
      ],
    },

    // ---- Branch 2: CHARON-7 Origins (3-tier lore) ----
    elder_lore_tier_1: {
      id: 'elder_lore_tier_1',
      speaker: 'The Elder',
      text: `${rt.npc('The Elder')}'s eyes narrow — not with suspicion but with the careful focus of someone deciding how much truth a visitor can carry. "The old world was ending before ${rt.keyword('CHARON-7')}. The soil was failing. The water tables were collapsing. The population models were converging on a number that governments did not want to publish." They let the silence do the work. "The virus was not the catastrophe. It was a response to a catastrophe that was already underway."`,
      onEnter: {
        setFlag: 'elder_lore_tier_1',
      },
      branches: [
        {
          label: `[Lore DC 11] "Someone made it a choice. Between extinction and transformation."`,
          targetNode: 'elder_lore_tier_2',
          requiresFlag: 'elder_lore_tier_1',
          skillCheck: { skill: 'lore', dc: 11 },
          failNode: 'elder_lore_fail',
        },
        {
          label: 'Back to other topics.',
          targetNode: 'elder_start',
        },
      ],
    },

    elder_lore_tier_2: {
      id: 'elder_lore_tier_2',
      speaker: 'The Elder',
      text: `Something shifts in ${rt.npc('The Elder')}'s expression. Recognition. "Yes. Someone made it a choice between extinction and transformation. And they chose not to ask permission." They lean forward — the first voluntary movement since you arrived. "The R-8 strain was not an accident. The ${rt.keyword('Sanguine')} expression pathway was designed. Someone looked at the population models and decided that humanity needed to become something else to survive. The ${rt.keyword('Hollow')} were the failure rate they deemed acceptable."`,
      onEnter: {
        setFlag: 'elder_lore_tier_2',
      },
      branches: [
        {
          label: `[Lore DC 13] "You know who designed it."`,
          targetNode: 'elder_lore_tier_3',
          requiresFlag: 'elder_lore_tier_2',
          skillCheck: { skill: 'lore', dc: 13 },
          failNode: 'elder_lore_deep_fail',
        },
        {
          label: 'Back to other topics.',
          targetNode: 'elder_start',
        },
      ],
    },

    elder_lore_tier_3: {
      id: 'elder_lore_tier_3',
      speaker: 'The Elder',
      text: `${rt.npc('The Elder')} is still for a very long time. "I know who designed it." The words are quiet. Heavy with duration. "I was one of the first subjects. Volunteer batch, before the field release. I read the documentation while the fever was burning through me." They close their eyes. "${rt.keyword('File 47-B')}. The deepest archive in the ${rt.keyword('MERIDIAN')} sub-facility. The designer's name, the authorization chain, the original population models. Everything the world needs to understand what was done to it." They open their eyes. "If you can reach it."`,
      onEnter: {
        setFlag: 'elder_lore_tier_3',
      },
      branches: [
        {
          label: 'Back to other topics.',
          targetNode: 'elder_start',
        },
      ],
    },

    elder_lore_fail: {
      id: 'elder_lore_fail',
      speaker: 'The Elder',
      text: `${rt.npc('The Elder')} watches you with something that might be disappointment. "You are repeating what you have been told. Come back when you have thought about what it means." The stillness returns — the conversation narrowing to what the Elder is willing to give, which is less than before.`,
      branches: [
        {
          label: 'Back to other topics.',
          targetNode: 'elder_start',
        },
      ],
    },

    elder_lore_deep_fail: {
      id: 'elder_lore_deep_fail',
      speaker: 'The Elder',
      text: `${rt.npc('The Elder')} tilts their head. "You are guessing. I do not reward guesses." The eyes are not unkind, but they are closed — information sealed behind a gate you have not yet earned the key to. "Learn more. Then return."`,
      branches: [
        {
          label: 'Back to other topics.',
          targetNode: 'elder_start',
        },
      ],
    },

    // ---- Branch 3: Utility Access (story-critical) ----
    elder_utility_gate: {
      id: 'elder_utility_gate',
      speaker: 'The Elder',
      text: `${rt.npc('The Elder')}'s gaze sharpens. "The utility passage. You know what lies beyond it, then." They study you — the assessment of someone who has been deciding who deserves what for fifteen years. "The override sequence is not given freely. Prove you understand what you are walking toward."`,
      branches: [
        {
          label: `[Negotiation DC 12] "The archive and ${rt.keyword('MERIDIAN')} are connected. I've seen the evidence. Let me through and the Lucid benefit from what I find."`,
          targetNode: 'elder_utility_success',
          requiresFlag: 'discovered_archive_meridian_connection',
          skillCheck: { skill: 'negotiation', dc: 12 },
          failNode: 'elder_utility_fail',
        },
        {
          label: `[Negotiation DC 12] "The Lucid trusted me enough to let me reach you. Trust me with this."`,
          targetNode: 'elder_utility_success',
          requiresRep: { faction: 'lucid', min: 1 },
          skillCheck: { skill: 'negotiation', dc: 12 },
          failNode: 'elder_utility_fail',
        },
        {
          label: 'Back to other topics.',
          targetNode: 'elder_start',
        },
      ],
    },

    elder_utility_success: {
      id: 'elder_utility_success',
      speaker: 'The Elder',
      text: `${rt.npc('The Elder')} is silent for a long moment. Then they speak a sequence — six syllables, precise, in a cadence that is clearly meant to be memorized. "The override sequence. It will open the utility entrance once. After that, the mechanism resets." They lean back. "Bring back understanding. Not trophies. Not weapons. Understanding."`,
      onEnter: {
        setFlag: { deep_utility_access: true },
        grantRep: { faction: 'lucid', delta: 1 },
      },
      branches: [
        {
          label: '"I will."',
          targetNode: 'elder_start',
        },
      ],
    },

    elder_utility_fail: {
      id: 'elder_utility_fail',
      speaker: 'The Elder',
      text: `"Come back with understanding, not ambition." ${rt.npc('The Elder')} settles deeper into the chair. The conversation is not over, but this branch of it is. The override sequence remains unspoken.`,
      branches: [
        {
          label: 'Back to other topics.',
          targetNode: 'elder_start',
        },
      ],
    },

    // ---- Branch 4: Diplomatic Passage ----
    elder_passage: {
      id: 'elder_passage',
      speaker: 'The Elder',
      text: `"Safe passage." ${rt.npc('The Elder')} considers the phrase as though tasting it. "The tunnels are ours. The younger ones are territorial — it is a function of the hunger, not malice. But I can make an exception. If you carry yourself with the right weight."`,
      branches: [
        {
          label: `[Presence DC 11] Stand straight. Meet the Elder's gaze. Let them see someone worth the exception.`,
          targetNode: 'elder_passage_success',
          skillCheck: { skill: 'presence', dc: 11 },
          failNode: 'elder_passage_fail',
        },
        {
          label: 'Back to other topics.',
          targetNode: 'elder_start',
        },
      ],
    },

    elder_passage_success: {
      id: 'elder_passage_success',
      speaker: 'The Elder',
      text: `${rt.npc('The Elder')} studies you. Whatever they find satisfies something. "You will carry a mark — not visible, but the changed will sense it. You will pass through ${rt.keyword('Sanguine')} territory without being hunted." The faintest suggestion of approval. "Do not test its limits. Respect is not immunity."`,
      onEnter: {
        setFlag: 'elder_granted_passage',
      },
      branches: [
        {
          label: 'Back to other topics.',
          targetNode: 'elder_start',
        },
      ],
    },

    elder_passage_fail: {
      id: 'elder_passage_fail',
      speaker: 'The Elder',
      text: `${rt.npc('The Elder')}'s gaze does not waver. "No." The word is not cruel. It is simply final — the verdict of someone who has been measuring people for longer than most people have been alive. "You do not carry the weight yet. When you do, I will see it."`,
      branches: [
        {
          label: 'Back to other topics.',
          targetNode: 'elder_start',
        },
      ],
    },

    // ---- Leave ----
    elder_leave: {
      id: 'elder_leave',
      speaker: 'The Elder',
      text: `"The surface will seem louder after this." ${rt.npc('The Elder')} does not watch you go. They have already returned to the stillness that was here before you arrived and will be here long after you leave.`,
    },
  },
}

// ------------------------------------------------------------
// VESPER — Elder Sanguine (Duskhollow, Council Chamber)
// dialogueTree ID: 'vesper_philosophy_main'
// Philosophical conjunctions. "And yet." Practiced detachment
// that cracks under the weight of real questions.
// ------------------------------------------------------------

const vesperTree: DialogueTree = {
  npcId: 'vesper',
  startNode: 'vesper_start',
  nodes: {
    // ---- Root ----
    vesper_start: {
      id: 'vesper_start',
      speaker: 'Vesper',
      text: `${rt.npc('Vesper')} is seated in the deepest shadow of the chamber, equidistant from every light source — a habit that has become architecture. She regards you without surprise. "Sit. You've walked a long way to stand in a doorway." The chair opposite is already pulled out. She anticipated company, or she always anticipates company. Both are unsettling in exactly the same way.`,
      branches: [
        // ---- Echo branches (cycle 2+) ----
        {
          label: '"You told me about the graduate students. About the first choice."',
          targetNode: 'vesper_echo_shared_origin',
          requiresCycleMin: 2,
          requiresPreviousQuest: 'vesper_shared_origin',
        },
        {
          label: '"We need to talk, Vesper. About what happened last time."',
          targetNode: 'vesper_echo_betrayed',
          requiresCycleMin: 2,
          requiresPreviousRelationship: { npcId: 'vesper', relationship: 'betrayed' },
        },
        // ---- Standard branches ----
        {
          label: `Ask about the ${rt.keyword('Sanguine')} and the Covenant.`,
          targetNode: 'vesper_sanguine',
        },
        {
          label: `Ask about a ${rt.keyword('cure')}.`,
          targetNode: 'vesper_cure',
        },
        {
          label: `Ask about the ${rt.keyword('biometric')} access.`,
          targetNode: 'vesper_biometric_gate',
          requiresFlag: 'duskhollow_cistern_contamination_identified',
        },
        {
          label: `Ask about the ${rt.keyword('biometric')} access.`,
          targetNode: 'vesper_biometric_gate',
          requiresRep: { faction: 'covenant_of_dusk', min: 1 },
        },
        {
          label: `Ask about ${rt.npc('Castellan Rook')} and the Red Court.`,
          targetNode: 'vesper_rook',
        },
        {
          label: '"I should go."',
          targetNode: 'vesper_leave',
        },
      ],
    },

    // ---- Echo: Shared origin story (cycle 2+) ----
    vesper_echo_shared_origin: {
      id: 'vesper_echo_shared_origin',
      speaker: 'Vesper',
      text: `${rt.npc('Vesper')}'s composure does not break. But something behind it shifts — a recognition that bypasses the practiced detachment entirely. "You know what I am. The office. The papers on Kant. The heartbeats through two floors of concrete." She is quiet for a long moment. "We can dispense with the philosophy." She opens the drawer without preamble. The ${rt.item('Sanguine Biometric Slide')} is already in her hand. "You earned this once. The Covenant remembers, even if I pretend not to. And yet —" The familiar pause. This time she finishes it. "And yet I am glad you came back."`,
      onEnter: {
        setFlag: { sanguine_biometric_obtained: true, vesper_shared_origin: true, vesper_echo_acknowledged: true },
        grantRep: { faction: 'covenant_of_dusk', delta: 2 },
      },
      branches: [
        {
          label: '"Thank you, Vesper. I won\'t waste it."',
          targetNode: 'vesper_biometric_end',
        },
      ],
    },

    // ---- Echo: Betrayed (cycle 2+) ----
    vesper_echo_betrayed: {
      id: 'vesper_echo_betrayed',
      speaker: 'Vesper',
      text: `The practiced stillness holds. But underneath it, something cold and heavy moves. "I remember you." ${rt.npc('Vesper')}'s voice drops below its register — not anger, something older and more tired than anger. "The memory is unpleasant. You took what I offered in trust and carried it to ${rt.npc('Castellan Rook')} like currency." She does not look away. "You have one explanation. Make it comprehensive."`,
      onEnter: {
        setFlag: 'vesper_echo_acknowledged',
      },
      branches: [
        {
          label: `[Negotiation DC 15] "I was wrong. I understand that now. The Covenant deserves better than what I did."`,
          targetNode: 'vesper_echo_forgiveness',
          skillCheck: { skill: 'negotiation', dc: 15 },
          failNode: 'vesper_echo_refused',
        },
        {
          label: '"I have no excuse."',
          targetNode: 'vesper_echo_refused',
        },
      ],
    },

    vesper_echo_forgiveness: {
      id: 'vesper_echo_forgiveness',
      speaker: 'Vesper',
      text: `The silence stretches. ${rt.npc('Vesper')} studies you with the attention of someone deciding whether to rebuild a bridge or let the river take it. "Remorse is not trust. And yet — remorse is the prerequisite." She folds her hands. "The biometric access is not available to you. Not today. But the door to this chamber remains open. That is what forgiveness looks like in the Covenant — not restoration, but the possibility of restoration." A page turns in the book she was not reading. "Come back. Prove it wasn't just words. I have time."`,
      onEnter: {
        setFlag: 'vesper_considering_forgiveness',
      },
      branches: [
        {
          label: '"I will."',
          targetNode: 'vesper_leave',
        },
      ],
    },

    vesper_echo_refused: {
      id: 'vesper_echo_refused',
      speaker: 'Vesper',
      text: `"No." The word is quiet and final and carries the weight of a philosophical tradition that ${rt.npc('Vesper')} has spent a lifetime constructing. "You do not get to stand in the place where you broke trust and ask for it back with nothing but presence." She returns to her book. "The Covenant's door is open. That is policy, not forgiveness. The difference matters."`,
      branches: [
        {
          label: `Ask about the ${rt.keyword('Sanguine')} and the Covenant.`,
          targetNode: 'vesper_sanguine',
        },
        {
          label: '"I understand."',
          targetNode: 'vesper_leave',
        },
      ],
    },

    // ---- Branch 1: The Sanguine ----
    vesper_sanguine: {
      id: 'vesper_sanguine',
      speaker: 'Vesper',
      text: `"The hemoglobin dependency is biological. The photosensitivity is biological. The enhanced cognition, the sensory acuity — biological." She folds her hands with the precision of someone who has rehearsed stillness until it became genuine. "The ethical framework around feeding is not biological. That is a choice we constructed, deliberately, because the alternative is the ${rt.keyword('Red Court')}." A pause that she uses the way other people use emphasis. "Four hundred milliliters per willing donor, once per month. We provide night security, ${rt.keyword('Hollow')} early warning, institutional memory. These are not contradictions I've resolved. They are contradictions I've decided to live inside. And yet —" She stops. The 'and yet' hangs in the air like something she's said too many times to finish.`,
      branches: [
        {
          label: `Ask about a ${rt.keyword('cure')}.`,
          targetNode: 'vesper_cure',
        },
        {
          label: `Ask about ${rt.npc('Castellan Rook')} and the Red Court.`,
          targetNode: 'vesper_rook',
        },
        {
          label: 'Back to other topics.',
          targetNode: 'vesper_start',
        },
      ],
    },

    // ---- Branch 2: The Cure ----
    vesper_cure: {
      id: 'vesper_cure',
      speaker: 'Vesper',
      text: `For the first time, the composure develops a visible fracture — not breaking, but flexing under load. "Dr. ${rt.npc('Osei')}'s research is promising. A reversal at the cellular level. The option should exist. Choice is the point." She is quiet for long enough that you think the topic is closed. It isn't. "I am more capable now. More perceptive. More durable. I process information faster than I did as a tenured professor, and I processed it quite fast then." Her voice drops below its practiced register. "I am not certain I want to be cured. And yet —" The crack again. She hears it, acknowledges it, does not repair it. "That ambivalence is the most honest thing I will say to you today. And yet I have said it. Make of that what you will."`,
      onEnter: {
        setFlag: 'vesper_discussed_cure',
      },
      branches: [
        {
          label: `Ask about the ${rt.keyword('biometric')} access.`,
          targetNode: 'vesper_biometric_gate',
          requiresFlag: 'duskhollow_cistern_contamination_identified',
        },
        {
          label: `Ask about the ${rt.keyword('biometric')} access.`,
          targetNode: 'vesper_biometric_gate',
          requiresRep: { faction: 'covenant_of_dusk', min: 1 },
        },
        {
          label: 'Back to other topics.',
          targetNode: 'vesper_start',
        },
      ],
    },

    // ---- Branch 3: Biometric (story-critical) ----
    vesper_biometric_gate: {
      id: 'vesper_biometric_gate',
      speaker: 'Vesper',
      text: `${rt.npc('Vesper')}'s expression does not change, but something behind it recalibrates. "You want the ${rt.keyword('Sanguine')} biometric slide. That is not a small request. It opens doors that were closed for reasons, and those reasons are still valid." She studies you with the attention of someone who has made consequential decisions about people before and is aware of the cost of being wrong. "Convince me."`,
      branches: [
        {
          label: `[Negotiation DC 11] "The cistern contamination threatens your people too. We need access to trace the source."`,
          targetNode: 'vesper_biometric_negotiate_success',
          skillCheck: { skill: 'negotiation', dc: 11 },
          failNode: 'vesper_biometric_fail',
        },
        {
          label: `[Presence DC 12] "You built the Covenant on the principle that coexistence requires trust. This is what trust looks like."`,
          targetNode: 'vesper_biometric_presence_success',
          skillCheck: { skill: 'presence', dc: 12 },
          failNode: 'vesper_biometric_fail',
        },
        {
          label: `"I have intelligence about the ${rt.keyword('Red Court')}'s operations."`,
          targetNode: 'vesper_biometric_leverage',
          requiresFlag: 'pens_rooks_letter_found',
        },
        {
          label: `"I have intelligence about the ${rt.keyword('Red Court')}'s operations."`,
          targetNode: 'vesper_biometric_leverage',
          requiresFlag: 'pens_rook_met_in_office',
        },
        {
          label: '"Not yet. I have more questions."',
          targetNode: 'vesper_start',
        },
      ],
    },

    // Biometric — Negotiation success
    vesper_biometric_negotiate_success: {
      id: 'vesper_biometric_negotiate_success',
      speaker: 'Vesper',
      text: `She considers. The consideration is not performance — she is genuinely weighing outcomes against principles and finding the balance point. "The contamination is a shared threat. You are correct." She opens a drawer lined in dark velvet and removes a slim, translucent slide — the ${rt.item('Sanguine Biometric Slide')}. "This grants passage through Covenant-controlled access points. It is keyed to my authority. Do not make me regret extending it." She places it on the table between you. "The Covenant's trust is not given. It is lent. Return it in the condition you received it."`,
      onEnter: {
        setFlag: 'sanguine_biometric_obtained',
        grantRep: { faction: 'covenant_of_dusk', delta: 1 },
      },
      branches: [
        {
          label: '"I will."',
          targetNode: 'vesper_biometric_end',
        },
      ],
    },

    // Biometric — Presence success (philosophical debate + origin story)
    vesper_biometric_presence_success: {
      id: 'vesper_biometric_presence_success',
      speaker: 'Vesper',
      text: `Something shifts in her expression — not the practiced stillness breaking, but something underneath it surfacing by choice. "You understand what the Covenant actually is. Not many do." She is quiet for a moment that stretches. "I turned in my office. Grading papers on Kant's categorical imperative. The irony is not subtle." The composure is still there, but she is speaking from behind it now rather than through it. "I woke up hungry in a way that had no precedent. Three of my graduate students were in the building. I could hear their heartbeats through two floors of concrete." She meets your eyes. "I walked out. That was the first ethical choice I made as a ${rt.keyword('Sanguine')}. Every choice since has been a footnote to that one." She places the ${rt.item('Sanguine Biometric Slide')} in front of you. "You asked what trust looks like. This is what it looks like. Try to deserve it."`,
      onEnter: {
        setFlag: { sanguine_biometric_obtained: true, vesper_shared_origin: true },
        grantRep: { faction: 'covenant_of_dusk', delta: 2 },
      },
      branches: [
        {
          label: '"Thank you for telling me that."',
          targetNode: 'vesper_biometric_end',
        },
      ],
    },

    // Biometric — Red Court leverage
    vesper_biometric_leverage: {
      id: 'vesper_biometric_leverage',
      speaker: 'Vesper',
      text: `${rt.npc('Vesper')}'s composure does not break. It sharpens. "Tell me." You share what you learned about the ${rt.keyword('Red Court')}'s operations — the yield discrepancies, the transit points, the things ${rt.npc('Castellan Rook')} keeps behind closed doors. She listens with the attention of someone cataloguing ammunition. When you finish, the silence is precise. "This changes the diplomatic calculus." She places the ${rt.item('Sanguine Biometric Slide')} on the table. "You have the biometric access. You also have something more useful — you have made the Covenant indispensable to you, and yourself indispensable to us. That is the foundation of every durable alliance." She writes something on a slip of paper and slides it across. "A diplomatic pass. Covenant authority, recognized at all Duskhollow checkpoints. You are not a visitor anymore. You are an envoy."`,
      onEnter: {
        setFlag: { sanguine_biometric_obtained: true, vesper_peace_envoy: true },
        grantRep: { faction: 'covenant_of_dusk', delta: 1 },
      },
      branches: [
        {
          label: '"I intend to use it well."',
          targetNode: 'vesper_biometric_end',
        },
      ],
    },

    // Biometric — fail
    vesper_biometric_fail: {
      id: 'vesper_biometric_fail',
      speaker: 'Vesper',
      text: `${rt.npc('Vesper')} shakes her head — once, precisely, without unkindness. "I believe your intentions are adequate. Adequate is not sufficient for what you're asking." She closes the drawer. "The Covenant's security is not abstract. It is the difference between coexistence and the alternative. Come back when you can articulate why you should hold that difference in your hand."`,
      branches: [
        {
          label: 'Back to other topics.',
          targetNode: 'vesper_start',
        },
        {
          label: '"I understand."',
          targetNode: 'vesper_leave',
        },
      ],
    },

    // Biometric — end
    vesper_biometric_end: {
      id: 'vesper_biometric_end',
      speaker: 'Vesper',
      text: `${rt.npc('Vesper')} has already returned to her reading — or the appearance of reading. The lamp casts her shadow long across the wall. "The door is always open," she says without looking up. "That is not a metaphor. It is a policy. Closed doors breed the kind of assumptions that end in fire." A page turns. The dismissal is gracious, complete, and leaves you with the distinct impression that you have been precisely weighed.`,
    },

    // ---- Branch 4: Rook / Red Court ----
    vesper_rook: {
      id: 'vesper_rook',
      speaker: 'Vesper',
      text: `The practiced detachment holds, but something underneath it tightens. "${rt.npc('Castellan Rook')}." She says the name the way someone handles a photograph they haven't looked at in a long time. "We were turned within a year of each other. We had a shared understanding, once, about what the ${rt.keyword('Sanguine')} condition required of us." A pause weighted with history. "He chose power. I chose conscience. Neither is comfortable." She folds her hands tighter than before — the only visible sign. "The ${rt.keyword('Red Court')} decided that predation is identity rather than condition. Rook is their visible edge. What is behind Rook is worse." Her eyes narrow — the first unguarded thing you've seen from her. "And yet. I cannot hate what I understand that completely. That is the problem with shared origins."`,
      branches: [
        {
          label: `Ask about the ${rt.keyword('Sanguine')} and the Covenant.`,
          targetNode: 'vesper_sanguine',
        },
        {
          label: 'Back to other topics.',
          targetNode: 'vesper_start',
        },
      ],
    },

    // ---- Leave ----
    vesper_leave: {
      id: 'vesper_leave',
      speaker: 'Vesper',
      text: `"The door is always open. That is not a metaphor." ${rt.npc('Vesper')} returns to her reading with the seamless attention of someone who was never entirely away from it. The chamber settles around her absence of motion. You leave with the sense that the conversation will continue without you, inside her, at a depth you were not invited to.`,
    },
  },
}

// ------------------------------------------------------------
// ROOK — Red Court Arbiter (The Pens, Office)
// dialogueTree ID: 'rook_office_dialogue'
// Professional predator. Polite like a blade — precise,
// functional, without excess.
// ------------------------------------------------------------

const rookTree: DialogueTree = {
  npcId: 'rook',
  startNode: 'rook_start',
  nodes: {
    // ---- Root ----
    rook_start: {
      id: 'rook_start',
      speaker: 'Castellan Rook',
      text: `${rt.npc('Castellan Rook')} regards you from behind the desk with an attention that is not hostile and is not friendly and is not anything that wastes energy on being a category. "You're either very brave or very lost. Both conditions have a limited shelf life here." The lamp is the only light. The shadows are deliberate — Rook has arranged the room so that the visitor is always more visible than the host. "Sit, if you intend to be useful. Stand, if you intend to be brief."`,
      branches: [
        // ---- Echo branches (cycle 2+) ----
        {
          label: '"Our arrangement still stands, Castellan."',
          targetNode: 'rook_echo_deal',
          requiresCycleMin: 2,
          requiresPreviousQuest: 'rook_offered_deal',
        },
        {
          label: '"You said I proved useful once. I\'m back."',
          targetNode: 'rook_echo_indebted',
          requiresCycleMin: 2,
          requiresPreviousQuest: 'rook_indebted',
        },
        // ---- Standard branches ----
        {
          label: `Ask about the ${rt.keyword('Red Court')}.`,
          targetNode: 'rook_red_court',
        },
        {
          label: `Ask about ${rt.npc('Vesper')}.`,
          targetNode: 'rook_vesper',
        },
        {
          label: '"I want to discuss an arrangement."',
          targetNode: 'rook_alliance_gate',
        },
        {
          label: '"I should go."',
          targetNode: 'rook_leave',
        },
      ],
    },

    // ---- Echo: Deal accepted (cycle 2+) ----
    rook_echo_deal: {
      id: 'rook_echo_deal',
      speaker: 'Castellan Rook',
      text: `${rt.npc('Castellan Rook')} does not look surprised. The lamp flickers and the shadows rearrange and Rook remains perfectly, professionally still. "Our arrangement stands. The ${rt.keyword('Red Court')} remembers its investments." A thin smile — not warm, appreciative in the way a ledger appreciates a balanced column. "Safe passage through all controlled corridors. Unescorted. Unquestioned. The terms are unchanged." A sealed pass appears on the desk — already prepared, already bearing your description. "I anticipated your return. Predictability is not a criticism — in the Court's economy, reliability is the most valuable asset." The smile sharpens. "Welcome back."`,
      onEnter: {
        setFlag: { rook_offered_deal: true, rook_echo_acknowledged: true },
      },
      branches: [
        {
          label: '"I\'ll make it worth your investment."',
          targetNode: 'rook_leave',
        },
        {
          label: `Ask about ${rt.npc('Vesper')}.`,
          targetNode: 'rook_vesper',
        },
      ],
    },

    // ---- Echo: Previously indebted (cycle 2+) ----
    rook_echo_indebted: {
      id: 'rook_echo_indebted',
      speaker: 'Castellan Rook',
      text: `${rt.npc('Castellan Rook')} tilts their head — a micro-movement that carries the weight of recollection. "You proved useful once. The intelligence you provided had — operational value." The flat pragmatism holds but something underneath it has adjusted. The visitor's chair is slightly closer to the desk than before. "Prove it again." A document slides across — not the full alliance protocol, something smaller. A specific request. "One task. The yield reports from ${rt.keyword('Duskhollow')} — the Covenant's actual numbers, not the ones they publish. Bring me that, and the Court's resources become available to you. Properly, this time."`,
      onEnter: {
        setFlag: 'rook_echo_acknowledged',
      },
      branches: [
        {
          label: `[Negotiation DC 10] "I have value beyond errands, Castellan. Full terms or nothing."`,
          targetNode: 'rook_alliance_useful',
          skillCheck: { skill: 'negotiation', dc: 10 },
          failNode: 'rook_alliance_fail',
        },
        {
          label: '"I\'ll get your numbers."',
          targetNode: 'rook_alliance_end',
        },
      ],
    },

    // ---- Branch 1: Red Court ----
    rook_red_court: {
      id: 'rook_red_court',
      speaker: 'Castellan Rook',
      text: `"The ${rt.keyword('Red Court')} is a resource management structure. We are predators. That is not ideology — it is metabolism." ${rt.npc('Castellan Rook')} says this without relish, without apology, with the flat pragmatism of someone reading a balance sheet. "Hierarchy exists because distributed predation is inefficient and draws attention. Controlled extraction, quota systems, sustainable yield — standard predator economics." A finger taps the ledger on the desk. "The ${rt.keyword('Accord')} calls it monstrous. The ${rt.keyword('Covenant')} calls it regrettable. We call it operational. The cattle survive. The Court endures. The math works. Everything else is aesthetics."`,
      branches: [
        {
          label: `Ask about ${rt.npc('Vesper')}.`,
          targetNode: 'rook_vesper',
        },
        {
          label: 'Back to other topics.',
          targetNode: 'rook_start',
        },
      ],
    },

    // ---- Branch 2: Vesper ----
    rook_vesper: {
      id: 'rook_vesper',
      speaker: 'Castellan Rook',
      text: `"${rt.npc('Vesper')}." The name lands without inflection — too carefully without inflection. "She chose conscience. Admirable. Impractical." ${rt.npc('Castellan Rook')} adjusts something on the desk that does not need adjusting. "The Covenant is a philosophical position masquerading as a governance model. It works because ${rt.npc('Vesper')} is exceptional, and it will fail the moment she isn't there to hold it together with sheer moral force." A silence. "That is not a threat. It is a structural observation."`,
      branches: [
        {
          label: '"And you chose power?"',
          targetNode: 'rook_vesper_power',
        },
        {
          label: 'Back to other topics.',
          targetNode: 'rook_start',
        },
      ],
    },

    rook_vesper_power: {
      id: 'rook_vesper_power',
      speaker: 'Castellan Rook',
      text: `The pause is the first unscripted thing you've seen from ${rt.npc('Castellan Rook')}. "I chose survival." The word is precise and carries more weight than it should if it were only about staying alive. "Conscience requires a margin of safety that most ${rt.keyword('Sanguine')} do not have. ${rt.npc('Vesper')} had tenure, institutional support, a community that chose to trust her before she had to earn it. I had a parking garage and three days of hunger and the understanding that no one was coming to help." The flat professionalism returns like a door closing. "Power is what survival looks like when you stop pretending the situation is temporary."`,
      branches: [
        {
          label: '"I want to discuss an arrangement."',
          targetNode: 'rook_alliance_gate',
        },
        {
          label: 'Back to other topics.',
          targetNode: 'rook_start',
        },
      ],
    },

    // ---- Branch 3: Alliance (dangerous) ----
    rook_alliance_gate: {
      id: 'rook_alliance_gate',
      speaker: 'Castellan Rook',
      text: `${rt.npc('Castellan Rook')} leans back. The motion is economical — not relaxation, reassessment. "An arrangement. With the ${rt.keyword('Red Court')}." The lamp flickers and the shadows rearrange and Rook does not blink. "Most people who sit in that chair want something from me and have nothing to offer. The ones who do have something to offer usually don't survive the negotiation. Not because I kill them —" A thin smile. "— because they make promises they can't keep and the Court collects on defaults." The smile vanishes. "So. Demonstrate that you're worth the risk of this conversation continuing."`,
      branches: [
        {
          label: `[Intimidation DC 12] "I've walked through places that would kill your best operatives. You need what I can do."`,
          targetNode: 'rook_alliance_useful',
          skillCheck: { skill: 'intimidation', dc: 12 },
          failNode: 'rook_alliance_fail',
        },
        {
          label: `[Stealth DC 11] "I got into this office without your perimeter noticing. That should tell you enough."`,
          targetNode: 'rook_alliance_useful',
          skillCheck: { skill: 'stealth', dc: 11 },
          failNode: 'rook_alliance_fail',
        },
        {
          label: `"I know things about ${rt.npc('Vesper')} that would interest the Court."`,
          targetNode: 'rook_betray_vesper',
          requiresFlag: 'vesper_shared_origin',
        },
        {
          label: '"On second thought, never mind."',
          targetNode: 'rook_start',
        },
      ],
    },

    // Alliance — player proves useful
    rook_alliance_useful: {
      id: 'rook_alliance_useful',
      speaker: 'Castellan Rook',
      text: `${rt.npc('Castellan Rook')} studies you for a long moment. The assessment is thorough, clinical, the evaluation of a tool by someone who maintains tools well. "Adequate." High praise, by Rook's metric. "I have a proposition. The Court requires intelligence from zones we cannot access during daylight hours. You provide information — troop movements, supply caches, faction dispositions — and I provide access to Red Court territory, safe passage through controlled corridors, and the understanding that the Court's resources are available to you when our interests align." A hand extends across the desk — not for a handshake, for a document. An intelligence exchange protocol, handwritten, precise. "This is not friendship. This is mutual utility with a contractual framework. Sign or don't."`,
      onEnter: {
        setFlag: 'rook_offered_deal',
      },
      branches: [
        {
          label: '"I\'ll think about it."',
          targetNode: 'rook_alliance_end',
        },
      ],
    },

    // Alliance — fail
    rook_alliance_fail: {
      id: 'rook_alliance_fail',
      speaker: 'Castellan Rook',
      text: `${rt.npc('Castellan Rook')} shakes their head — a micro-movement, efficient even in dismissal. "No. You're not what you think you are. Not yet." They return their attention to the ledger. "Come back when the gap between your confidence and your capability has narrowed. I'll be here. The Court is patient. We have the luxury of time — biologically speaking."`,
      branches: [
        {
          label: 'Back to other topics.',
          targetNode: 'rook_start',
        },
        {
          label: '"Fine."',
          targetNode: 'rook_leave',
        },
      ],
    },

    // Alliance end
    rook_alliance_end: {
      id: 'rook_alliance_end',
      speaker: 'Castellan Rook',
      text: `"Think quickly. Opportunities in the ${rt.keyword('Red Court')} have expiration dates." ${rt.npc('Castellan Rook')} returns to the ledger. The conversation is over — not because Rook ended it, but because Rook's attention has moved on to something more immediately profitable. The document remains on the desk. Unsigned. Available.`,
    },

    // Betray Vesper
    rook_betray_vesper: {
      id: 'rook_betray_vesper',
      speaker: 'Castellan Rook',
      text: `Something moves behind ${rt.npc('Castellan Rook')}'s eyes — not surprise, not pleasure, something colder and more complicated. "Go on." You tell them what ${rt.npc('Vesper')} shared — the turning, the graduate students, the first ethical choice, the origin of the Covenant's moral architecture. Rook listens without moving. When you finish, the silence is surgical. "I knew some of that. Not all." They open a drawer and remove a sealed pass — Red Court insignia, your description, safe conduct. "You have passage through every Red Court corridor in the region. Unescorted. Unquestioned." The pass slides across the desk. "You've also demonstrated exactly what kind of asset you are. We value that." The thin smile returns. "So does ${rt.npc('Vesper')}, in her way. She'll learn what you've done. The Covenant always learns. And when she does —" Rook shrugs, the first casual gesture you've seen. "That's your problem. Not mine."`,
      onEnter: {
        setFlag: { rook_indebted: true, player_betrayed_vesper: true },
        grantRep: { faction: 'covenant_of_dusk', delta: -2 },
      },
      branches: [
        {
          label: 'Take the pass and leave.',
          targetNode: 'rook_leave',
        },
      ],
    },

    // ---- Leave ----
    rook_leave: {
      id: 'rook_leave',
      speaker: 'Castellan Rook',
      text: `"Do come again. I so rarely get conversations that aren't —" ${rt.npc('Castellan Rook')} pauses, selecting the word with the care of someone choosing a blade from a display. "— nutritional." The thin smile. The lamp. The shadows returning to their assigned positions as you leave. The door closes behind you with a click that sounds, somehow, like a ledger entry being finalized.`,
    },
  },
}

// ------------------------------------------------------------
// Registry — keyed by dialogue tree ID (referenced in npcSpawns)
// ------------------------------------------------------------

// ============================================================
// === CONVOY remnant-story-0329 Rider A: Echo ===
// ============================================================

// --- PART 1: echoTree ---
// Insert this const before the DIALOGUE_TREES export object

const echoTree: DialogueTree = {
  npcId: 'echo_hollow',
  startNode: 'echo_start',
  nodes: {
    echo_start: {
      id: 'echo_start',
      speaker: 'Echo',
      text: `The figure\'s head turns toward you. The mouth opens. "H...home. Was... home. Before the..." The words trail off into something that is almost a sound and almost not. The finger movements stop. The eyes are looking at you with a quality that is not quite recognition and not quite its absence.`,
      branches: [
        {
          label: '"Do you remember your name?"',
          targetNode: 'echo_name',
        },
        {
          label: '"What happened to you?"',
          targetNode: 'echo_happened',
        },
        {
          label: '"I\'ve seen you here before."',
          targetNode: 'echo_recognition',
          requiresCycleMin: 2,
        },
        {
          label: 'Back away slowly.',
          targetNode: 'echo_leave',
        },
      ],
    },

    echo_name: {
      id: 'echo_name',
      speaker: 'Echo',
      text: `The finger movements resume against the concrete. E. C. H. O. E. C. H. O. "E...cho. Echo." The word comes out with the quality of a person testing whether a thing they\'ve been told is true. "That\'s what... they called. They called. What they called." The eyes refocus on you. "You know. You know what I... called."`,
      onEnter: {
        setFlag: { echo_encountered: true },
      },
      branches: [
        {
          label: '"Your name is Echo."',
          targetNode: 'echo_name_confirmed',
        },
        {
          label: '"I don\'t know. Can you remember?"',
          targetNode: 'echo_name_unknown',
        },
        {
          label: '[Presence 3+ or Wits 3+] "You wrote it on the wall. You\'ve been writing it for days."',
          targetNode: 'echo_wall_recognition',
          skillCheck: { skill: 'presence', dc: 3 },
          failNode: 'echo_name_unknown',
        },
      ],
    },

    echo_name_confirmed: {
      id: 'echo_name_confirmed',
      speaker: 'Echo',
      text: `Something moves in the figure\'s expression — not relief exactly, but a reorientation. Like a compass finding north. "Echo." Said more firmly. "Echo. Echo." Then, quieter: "The fire. Before the fire, what... I was. I was..." The sentence doesn\'t finish. The word \'fire\' hangs there, specific and significant.`,
      onEnter: {
        setFlag: { player_showed_hollow_mercy: true },
        grantRep: { faction: 'covenant_of_dusk', delta: 1 },
      },
      branches: [
        {
          label: '"What fire? What do you remember?"',
          targetNode: 'echo_fire',
        },
        {
          label: 'Stay present with Echo. Don\'t push.',
          targetNode: 'echo_presence',
          requiresCycleMin: 3,
        },
      ],
    },

    echo_name_unknown: {
      id: 'echo_name_unknown',
      speaker: 'Echo',
      text: `The head tilts. The fingers resume. E. C. H. O. "Remember. Remember the..." A pause that goes on long enough that you think the sentence is done. Then: "Water. Remember the water. The river. Before." The eyes are somewhere else now, somewhere that might be a specific place, might be a category of place, might be both.`,
      branches: [
        {
          label: '"The river? Where?"',
          targetNode: 'echo_river',
        },
        {
          label: 'Leave Echo to it.',
          targetNode: 'echo_leave',
        },
      ],
    },

    echo_wall_recognition: {
      id: 'echo_wall_recognition',
      speaker: 'Echo',
      text: `The figure looks at the wall. At the scratches. At you. At the wall again. Something resolves. "Days. Days and... days. Writing because. Because it goes. Everything goes." A breath that is almost a sigh. "But not. Not this. I can make it. Not go. If I keep. Keep writing." The eyes come back to yours. "You... came back. You... different. Come back. Come... back before."`,
      onEnter: {
        setFlag: { echo_encountered: true },
      },
      branches: [
        {
          label: '"Yes. I\'ve come back before."',
          targetNode: 'echo_recognition_affirm',
          requiresCycleMin: 2,
        },
        {
          label: '"This is the first time."',
          targetNode: 'echo_recognition_deny',
        },
      ],
    },

    echo_recognition: {
      id: 'echo_recognition',
      speaker: 'Echo',
      text: `The figure stops. Completely. The fingers freeze mid-letter. The eyes find yours and there is a moment where something crosses the distance between you — not quite memory, but the shape memory leaves when it has been asked to leave. "Before. Before you. You... were here. Here before." The voice rises, almost urgent. "The. The way you stand. I... I know. I know the. The way you stand." A tremor runs through the body. The fingers resume, but the letters are different now — not E C H O. Something older. "You. You come. Come back. Again."`,
      onEnter: {
        setFlag: { echo_encountered: true },
      },
      branches: [
        {
          label: '"Yes. I\'ve come back before."',
          targetNode: 'echo_recognition_affirm',
        },
        {
          label: '"I\'m not sure. Maybe."',
          targetNode: 'echo_recognition_deny',
        },
      ],
    },

    echo_recognition_affirm: {
      id: 'echo_recognition_affirm',
      speaker: 'Echo',
      text: `"Again. You... again. I... remember." The word has weight, coming from something that seems to be losing the capacity for it. "Remember the... fire. The fire." The finger movements change — not the name anymore. Something else. Something that might be a date, or a location, or a word in a language that used to mean something. "You. You are. Different kind. Not like. The others."`,
      onEnter: {
        setFlag: { echo_recognized_player: true },
      },
      branches: [
        {
          label: '"What others?"',
          targetNode: 'echo_others',
        },
        {
          label: '"The fire — what happened?"',
          targetNode: 'echo_fire',
        },
      ],
    },

    echo_recognition_deny: {
      id: 'echo_recognition_deny',
      speaker: 'Echo',
      text: `The figure considers this. The consideration takes longer than it should. "First. But. You feel. Feel like. Not first." The eyes track you with an attention that is doing its best to mean something. "My head. Makes things. Wrong order. Before after. After before." A pause. "Sorry. Sorry." The word is careful, deliberate. Someone taught Echo how to apologize and Echo still uses it.`,
      onEnter: {
        setFlag: { player_showed_hollow_mercy: true },
      },
      branches: [
        {
          label: '"You don\'t need to apologize."',
          targetNode: 'echo_name_confirmed',
        },
        {
          label: 'Give Echo space.',
          targetNode: 'echo_leave',
        },
      ],
    },

    echo_happened: {
      id: 'echo_happened',
      speaker: 'Echo',
      text: `The figure\'s mouth works. "Happened. Happened when. When the. When the..." The fingers press hard against the concrete, hard enough to leave a mark. "I was. There was a building. There was. People I knew. And then the. The thing that comes. When something comes. From the outside and the inside at. The same. At the same time." The eyes find yours. "You know. You look like you know."`,
      branches: [
        {
          label: '"CHARON-7. The virus."',
          targetNode: 'echo_charon',
        },
        {
          label: '"I don\'t know. Tell me."',
          targetNode: 'echo_happened_more',
        },
        {
          label: '[Deny] "You\'re a Hollow. You don\'t have a history anymore."',
          targetNode: 'echo_deny_agency',
        },
      ],
    },

    echo_deny_agency: {
      id: 'echo_deny_agency',
      speaker: 'Echo',
      text: `The head turns away. The finger movements stop. A long silence, longer than the previous silences. When Echo speaks again, the voice is quieter and has lost some of its searching quality. "Had. Had history. Had. Before." The word \'before\' lands like something being set down and not picked up again. "Still. Still have. The scratches." The fingers resume, but slower.`,
      onEnter: {
        setFlag: { player_denied_hollow_agency: true },
        grantRep: { faction: 'covenant_of_dusk', delta: -1 },
      },
      branches: [
        {
          label: 'Leave Echo alone.',
          targetNode: 'echo_leave',
        },
        {
          label: '"I was wrong. You do have a history."',
          targetNode: 'echo_recant',
        },
      ],
    },

    echo_recant: {
      id: 'echo_recant',
      speaker: 'Echo',
      text: `The head turns back. The eyes find yours again with an effort that is visible. "Said wrong." Echo says it for you, carefully. "Said wrong. Is okay. People. Say wrong." A pause. "I. Sometimes. Say wrong too. When the. When the words. Get scrambled." Something like acceptance in the voice, which is different from forgiveness and also not the same as indifference.`,
      onEnter: {
        setFlag: { player_showed_hollow_mercy: true },
      },
      branches: [
        {
          label: '"Tell me about the fire."',
          targetNode: 'echo_fire',
        },
      ],
    },

    echo_charon: {
      id: 'echo_charon',
      speaker: 'Echo',
      text: `"Cha... ron." The word sounds like Echo has heard it and is repeating it from hearing, not from understanding. "Seven. Seven. CHARON-7." A long pause. "I knew. I knew what. Before I. Before it. Became." The finger movements stop. "I worked. With the. The things that make you sick. Make you better. Before." Something surfaces briefly. "Before I couldn\'t."`,
      branches: [
        {
          label: '"You worked with CHARON-7? You were there?"',
          targetNode: 'echo_witness',
        },
        {
          label: '"Where did you work?"',
          targetNode: 'echo_location',
        },
      ],
    },

    echo_witness: {
      id: 'echo_witness',
      speaker: 'Echo',
      text: `"There. Was there. We... we built it. We thought. We thought we were." A stillness. "We thought." Echo looks down at its hands. "The building with the lights. The deep place. We thought the lights meant. Meant it was. Working." The head comes back up. "The lights were. The lights were something else. We didn\'t know. I didn\'t." A breath. "I didn\'t know."`,
      onEnter: {
        setFlag: { echo_meridian_witness: true },
      },
      branches: [
        {
          label: '"The Scar? The MERIDIAN facility?"',
          targetNode: 'echo_scar',
        },
        {
          label: 'Stay quiet. Let Echo find the words.',
          targetNode: 'echo_presence',
          requiresCycleMin: 3,
        },
      ],
    },

    echo_scar: {
      id: 'echo_scar',
      speaker: 'Echo',
      text: `"Scar." The word is immediate. "Yes. Scar. We called it. Something else. Before. But Scar is right. Is accurate." A sound that might be a laugh with all the warmth removed. "I had. A badge. A badge with. My name. Not Echo. Different name. The badge is gone. The name... the name got. Scrambled." The finger movements start again. E. C. H. O. "This one. Stayed."`,
      branches: [
        {
          label: 'Leave Echo with this.',
          targetNode: 'echo_leave_gentle',
        },
      ],
    },

    echo_fire: {
      id: 'echo_fire',
      speaker: 'Echo',
      text: `"The fire. The fire in the. In the place. The building where we." Echo stops. Starts again. "Not. Not fire-fire. The kind that. The kind that comes from inside. From the blood." A pause. "Everyone. Everyone started. Changing. Some fast. Some slow. I was. I was slow." The eyes are very clear suddenly, very present. "I watched. I remember watching. Before I couldn\'t. Watch anymore."`,
      branches: [
        {
          label: '"You remember becoming a Hollow."',
          targetNode: 'echo_becoming',
        },
        {
          label: 'Say nothing. Just be here.',
          targetNode: 'echo_presence',
          requiresCycleMin: 3,
        },
      ],
    },

    echo_becoming: {
      id: 'echo_becoming',
      speaker: 'Echo',
      text: `"Remember. Some of it." A pause between each sentence now, the sentences arriving one at a time. "The last thing I. I knew I was losing. I wrote my name. Somewhere. Kept writing." The head tilts. "Found this place. Kept writing. Thought if I. Kept writing maybe. Maybe it would. Stay." The eyes are completely present. This is Echo at its most lucid. "You. You came back. You keep. You are. Different kind."`,
      branches: [
        {
          label: '"What kind do you think I am?"',
          targetNode: 'echo_revenant_recognition',
          requiresCycleMin: 2,
        },
        {
          label: '"I\'ll come back again."',
          targetNode: 'echo_promise',
        },
      ],
    },

    echo_revenant_recognition: {
      id: 'echo_revenant_recognition',
      speaker: 'Echo',
      text: `"You. Come back. Come back after. Dying?" It isn\'t entirely a question. "I saw. People die. In the building. They stayed dead. You. You don\'t." The finger movements stop entirely. "What does it. What does it feel like. To come back?" The question is asked with the quality of someone asking about a place they can no longer visit.`,
      branches: [
        {
          label: '"Like remembering something that happened to someone else."',
          targetNode: 'echo_revenant_response_loss',
        },
        {
          label: '"Like being remade. But not quite right."',
          targetNode: 'echo_revenant_response_change',
        },
      ],
    },

    echo_revenant_response_loss: {
      id: 'echo_revenant_response_loss',
      speaker: 'Echo',
      text: `"Yes." Said with sudden conviction. "Yes. Remembered. Like that. Now. For me." The head tilts. "Maybe. Maybe we are. Not. So different." Echo looks back at the scratched name on the wall. "I keep. Writing. Because it feels like. Remembering. Even when it. Doesn\'t."`,
      onEnter: {
        setFlag: { player_showed_hollow_mercy: true, echo_connection_made: true },
        grantRep: { faction: 'covenant_of_dusk', delta: 1 },
      },
      branches: [
        {
          label: '"I\'ll come back. I want to hear more."',
          targetNode: 'echo_promise',
        },
      ],
    },

    echo_revenant_response_change: {
      id: 'echo_revenant_response_change',
      speaker: 'Echo',
      text: `"Not quite right." The voice is very quiet. "I understand. Not quite. Right." The fingers move again. "I was. Right once. Before. I think." A pause. "Maybe. Rightness. Takes. Practice."`,
      onEnter: {
        setFlag: { player_showed_hollow_mercy: true, echo_connection_made: true },
        grantRep: { faction: 'covenant_of_dusk', delta: 1 },
      },
      branches: [
        {
          label: '"I\'ll come back."',
          targetNode: 'echo_promise',
        },
      ],
    },

    echo_others: {
      id: 'echo_others',
      speaker: 'Echo',
      text: `"The ones who. Don\'t stop. Don\'t write. Don\'t try." Echo\'s voice is matter-of-fact. "They go. The ones who stop. Trying to. Remember. They go somewhere else. Inside." A pause. "I don\'t want. To go. There." The finger movements are slower now, more deliberate. E. C. H. O. "You help. Talking helps. The talking. Makes the words stay longer."`,
      branches: [
        {
          label: '"Then I\'ll keep talking to you."',
          targetNode: 'echo_promise',
        },
      ],
    },

    echo_river: {
      id: 'echo_river',
      speaker: 'Echo',
      text: `"The river. South of. South of the. Building. We used to. Lunch. We used to eat lunch." The word \'lunch\' is so specific, so ordinary, that it lands with disproportionate weight. "There was a. A place by the water. Rocks. Flat rocks. Good for. Sitting." The eyes are elsewhere. "I wonder if. The rocks. Are still there."`,
      branches: [
        {
          label: '"I\'ll look for them."',
          targetNode: 'echo_leave_gentle',
        },
        {
          label: '"Tell me more about the building."',
          targetNode: 'echo_charon',
        },
      ],
    },

    echo_happened_more: {
      id: 'echo_happened_more',
      speaker: 'Echo',
      text: `"It came from. From the water. Or the air. We never. Knew which." The hands press flat against the concrete. "One day it was. One day it wasn\'t. In between there was. Something you could feel in your. Your blood. Your blood getting. Different." The eyes refocus. "You wouldn\'t know. Unless you. Were there. Unless it happened to. You."`,
      branches: [
        {
          label: '"It happened to me too, in a way."',
          targetNode: 'echo_revenant_recognition',
          requiresCycleMin: 2,
        },
        {
          label: '"What happened after?"',
          targetNode: 'echo_fire',
        },
      ],
    },

    echo_location: {
      id: 'echo_location',
      speaker: 'Echo',
      text: `"The place with. The big sign. The sign that said. Meridian something. Something Systems." The word \'systems\' comes out careful and complete, a word Echo has retained fully. "There were. Many rooms. Many levels. Down and down and. The deepest level had. Had the lights. The blue lights." The head tilts. "The lights didn\'t. Help."`,
      onEnter: {
        setFlag: { echo_meridian_witness: true },
      },
      branches: [
        {
          label: '"I\'ve been there. I\'ve seen the facility."',
          targetNode: 'echo_scar',
        },
        {
          label: '"The Scar. That\'s what people call it now."',
          targetNode: 'echo_scar',
        },
      ],
    },

    echo_presence: {
      id: 'echo_presence',
      speaker: 'Echo',
      text: `You stay. Echo notices. The finger movements slow, then still. The silence between you has a different quality from the usual silences in this place — not empty but occupied by two beings who are both, in their different ways, keeping company with what they\'ve lost. After a while, Echo says: "Good. Good that you. Stay." A pause. "Come back. Come back again."`,
      onEnter: {
        setFlag: { player_showed_hollow_mercy: true, echo_trust_built: true },
        grantRep: { faction: 'covenant_of_dusk', delta: 1 },
      },
      branches: [
        {
          label: '"I will."',
          targetNode: 'echo_promise',
        },
      ],
    },

    echo_promise: {
      id: 'echo_promise',
      speaker: 'Echo',
      text: `Echo looks at you for a moment with an expression that is doing its best to mean something. "Come. Back." The phrase has the quality of a request that has been made before and is being made again because the previous times it worked, or at least seemed to. The finger movements resume as you leave. E. C. H. O. E. C. H. O.`,
    },

    echo_leave: {
      id: 'echo_leave',
      speaker: 'Echo',
      text: `The head turns as you leave, tracking your movement until you\'re out of sight. The finger movements continue. The name. E. C. H. O. There is a quality to the repetition that might be stubbornness or might be something that used to be hope and has become habit.`,
    },

    echo_leave_gentle: {
      id: 'echo_leave_gentle',
      speaker: 'Echo',
      text: `As you leave, Echo watches. Not with alarm or need — just the attention of something that has learned that people come and go, and that the coming matters more than the going. The finger movements have stopped. The wall bears the record of all the times Echo has remembered to try.`,
      onEnter: {
        setFlag: { echo_gentle_parting: true },
      },
    },
  },
}

// ============================================================
// Act 1 Climax Tree
// CONTRACT §7: triggers when echo_encountered set + 3+ faction contacts
// Sets act1_complete; player commits to one faction
// ============================================================

const act1ClimaxTree: DialogueTree = {
  npcId: 'faction_representatives',
  startNode: 'climax_start',
  nodes: {
    climax_start: {
      id: 'climax_start',
      speaker: 'Narrator',
      text: `You arrive at the Crossroads to find it changed. Two figures are waiting with the specific quality of people who have agreed in advance not to leave until this conversation happens. ${rt.npc('Marshal Cross')} stands with her arms at her sides and the weight of eight hundred people behind her posture. Across from her, someone you\'ve come to know from one of the factions watches with an expression that contains both urgency and the careful control of urgency. The market has gone quiet. This is the moment you\'ve been moving toward since you first woke up in this world. All the conversations, all the choices — they\'ve been pointing here. The time for being neutral is over.`,
      branches: [
        {
          label: 'Listen to what they have to say.',
          targetNode: 'climax_demands',
        },
      ],
    },

    climax_demands: {
      id: 'climax_demands',
      speaker: 'Marshal Cross',
      text: `${rt.npc('Marshal Cross')} speaks first. "The Four Corners is fracturing. Every week the lines get clearer. Every week it becomes harder to remain unaligned without being perceived as opposed to everyone." She doesn\'t raise her voice. She doesn\'t need to. "The Accord needs to know where you stand. Not tomorrow. Now." The second figure steps forward. "She\'s right about the timing, if nothing else. The world is asking the question. We need your answer."`,
      branches: [
        {
          label: 'Commit to the Accord.',
          targetNode: 'climax_accord',
        },
        {
          label: 'Commit to the Salters.',
          targetNode: 'climax_salters',
          requiresFlag: 'salters_contact',
        },
        {
          label: 'Commit to the Kindling.',
          targetNode: 'climax_kindling',
          requiresFlag: 'kindling_contact',
        },
        {
          label: 'Commit to the Drifters.',
          targetNode: 'climax_drifters',
          requiresFlag: 'drifters_contact',
        },
        {
          label: 'Commit to the Red Court.',
          targetNode: 'climax_red_court',
          requiresFlag: 'red_court_contact',
        },
        {
          label: '"I don\'t commit to anyone."',
          targetNode: 'climax_refuse',
        },
      ],
    },

    climax_accord: {
      id: 'climax_accord',
      speaker: 'Marshal Cross',
      text: `Something shifts in ${rt.npc('Marshal Cross')}\'s expression — not surprise, but recognition. She extends her hand. "Then we build together." The handshake is brief and formal and somehow, in this moment, carries the full weight of everything that comes after. "Welcome to the Accord. Not the wall, not the rules — the people who decided the wall and the rules were worth maintaining. That\'s the thing you\'re joining." She holds your gaze. "Don\'t make me regret this." It\'s not a threat. It\'s a promise that she believes in the decision she\'s just made.`,
      onEnter: {
        setFlag: { act1_complete: true, faction_committed_accord: true, player_alignment_accord: true },
        grantRep: { faction: 'accord', delta: 2 },
      },
      branches: [
        {
          label: '"I won\'t."',
          targetNode: 'climax_end',
        },
      ],
    },

    climax_salters: {
      id: 'climax_salters',
      speaker: 'Narrator',
      text: `You tell them where you stand. The Accord representative absorbs it with the professional composure of someone who has heard disappointing information before and knows how to continue being professional afterward. Somewhere, a Salter receives word that you\'ve committed — and the response is practical: a nod, a place on a roster, a welcome that is really a deployment. ${rt.npc('Warlord Briggs')} deals in utility. You\'ve just declared yourself useful. The transaction is complete.`,
      onEnter: {
        setFlag: { act1_complete: true, faction_committed_salters: true, player_alignment_salters: true },
        grantRep: { faction: 'salters', delta: 2 },
      },
      branches: [
        {
          label: 'Accept the deployment.',
          targetNode: 'climax_end',
        },
      ],
    },

    climax_kindling: {
      id: 'climax_kindling',
      speaker: 'Narrator',
      text: `You say the word and something in the air changes. Not drama — something quieter. The Kindling representative closes their eyes for a moment with the quality of someone receiving confirmation of a prayer they had kept private. "The fire found you," they say. They mean it literally. Whether you believe them or not, the welcome is genuine and the community is real and there is warmth on the other side of the commitment. ${rt.npc('Deacon Harrow')} will hear about this. The Kindling will know you by name.`,
      onEnter: {
        setFlag: { act1_complete: true, faction_committed_kindling: true, player_alignment_kindling: true },
        grantRep: { faction: 'kindling', delta: 2 },
      },
      branches: [
        {
          label: 'Accept the welcome.',
          targetNode: 'climax_end',
        },
      ],
    },

    climax_drifters: {
      id: 'climax_drifters',
      speaker: 'Narrator',
      text: `The Drifter response is characteristically minimal: a nod, a slight relaxation, a willingness to be slightly more candid than before. "Nobody owns the road," they say. "That\'s still the point. But the road needs tending. You\'re one of the people who tenders it now." It\'s not ceremony. Drifters don\'t do ceremony. It\'s an acknowledgment that you\'re part of the network — the informal, persistent, stubborn network of people who keep moving because staying still is how things die.`,
      onEnter: {
        setFlag: { act1_complete: true, faction_committed_drifters: true, player_alignment_drifters: true },
        grantRep: { faction: 'drifters', delta: 2 },
      },
      branches: [
        {
          label: 'Accept the nod.',
          targetNode: 'climax_end',
        },
      ],
    },

    climax_red_court: {
      id: 'climax_red_court',
      speaker: 'Narrator',
      text: `You say it clearly. The Accord representative goes still in the way that people go still when they\'re deciding whether to pursue something or let it go. They let it go — for now. The Red Court response comes through channels you\'re already starting to understand: a message, a meeting time, an address. ${rt.npc('Castellan Rook')} will want to formalize the arrangement personally. A deal isn\'t trust. A deal is math. You\'ve just entered the equation.`,
      onEnter: {
        setFlag: { act1_complete: true, faction_committed_red_court: true, player_alignment_red_court: true },
        grantRep: { faction: 'red_court', delta: 2 },
      },
      branches: [
        {
          label: 'Prepare for the meeting.',
          targetNode: 'climax_end',
        },
      ],
    },

    climax_refuse: {
      id: 'climax_refuse',
      speaker: 'Marshal Cross',
      text: `${rt.npc('Marshal Cross')} looks at you for a long moment. "Then you\'ve chosen neutrality." A pause. "Neutrality is a position. I want you to understand that. In a fracturing world, being neutral is being opposed to everyone who has committed. It protects you from nothing and obligates you to no one. The road you\'re choosing is lonelier than you think." She turns to leave. The second representative lingers. "The offer stands. When you\'re ready." They follow the marshal. The Crossroads exhales.`,
      onEnter: {
        setFlag: { act1_complete: true, faction_committed_none: true },
      },
      branches: [
        {
          label: 'Watch them leave.',
          targetNode: 'climax_end',
        },
      ],
    },

    climax_end: {
      id: 'climax_end',
      speaker: 'Narrator',
      text: `The Crossroads resumes its noise. The market restarts. People move. The moment that just happened will shape everything that comes after it — the doors that open, the ones that close, the people who now regard you as one of theirs and the people who register you as something other. Act One is complete. The map of the Four Corners has clarified. You know where you stand. What remains is to stand there.`,
    },
  },
}

// ============================================================
// === Red Court Arc: Kade / Vex / Lyris (Phase 3) ===
// ============================================================

const kadeTree: DialogueTree = {
  npcId: 'kade_red_court',
  startNode: 'kade_start',
  nodes: {
    kade_start: {
      id: 'kade_start',
      speaker: 'Kade',
      text: `${rt.npc('Kade')} closes the journal over his thumb. He looks at you for a long moment before he speaks — not assessment, just genuine interest. "The first year was the loudest. Everyone was deciding what they were — Covenant, Red Court, Hollow, or something that hadn't been named yet. I made my decision early. I've been thinking about it ever since. Not regretting. Thinking. There's a difference."`,
      branches: [
        {
          label: `"Why the Red Court, specifically?"`,
          targetNode: 'kade_why_court',
        },
        {
          label: `"How do you live with what happens in this building?"`,
          targetNode: 'kade_the_arrangement',
        },
        {
          label: `"I need to ask you about ${rt.npc('Lyris')}."`,
          targetNode: 'kade_on_lyris',
          requiresFlag: 'lyris_doubter_revealed',
        },
        {
          label: `"I'll leave you to your work."`,
          targetNode: 'kade_leave',
        },
      ],
    },

    kade_why_court: {
      id: 'kade_why_court',
      speaker: 'Kade',
      text: `"The Covenant calls what it does regrettable. They are right. Regret is a sign of moral clarity. But regret is not the same as stopping." ${rt.npc('Kade')} opens the journal to a marked page and taps it twice. "I listened to Vesper's arguments and found them honest. She had not answered them. She had arranged them beautifully, and then she had gone on feeding. Red Court is what you get when you stop arranging. It is not kinder. It is simply less polite about what it is."`,
      onEnter: {
        setFlag: { red_court_philosophy_encountered: true },
      },
      branches: [
        {
          label: `"That's a rationalization."`,
          targetNode: 'kade_the_arrangement',
        },
        {
          label: `"Thank you for being direct about it."`,
          targetNode: 'kade_leave',
        },
      ],
    },

    kade_the_arrangement: {
      id: 'kade_the_arrangement',
      speaker: 'Kade',
      text: `"Rationalization. The word is not inaccurate." ${rt.npc('Kade')} nods, as if you have said something he agrees with entirely. "Everything we do after we name what we are is rationalization. The question isn't whether we are rationalizing. The question is what we are rationalizing for. I have chosen sustainability over pretense. Vesper has chosen pretense over dissolution. Neither of us is innocent. One of us has stopped trying to sound innocent." He sets the pen down. "You have walked through ${rt.npc('Ward A')}. You have seen the wristbands. What bothered you — the practice, or the fact that the practice has a schedule?"`,
      branches: [
        {
          label: `"The schedule. The bureaucracy of it."`,
          targetNode: 'kade_bureaucracy',
        },
        {
          label: `"The practice. The fact that it exists at all."`,
          targetNode: 'kade_leave',
        },
      ],
    },

    kade_bureaucracy: {
      id: 'kade_bureaucracy',
      speaker: 'Kade',
      text: `"Yes. That's the honest answer." A small sound — not a laugh, but the shape a laugh would take if it were permitted here. "Horror that is organized is harder to unsee than horror that is chaotic. Chaos you can grieve. Organization you have to argue with. Which is what I wanted, when I chose this. An argument I could keep having. I was tired of grieving." He closes the journal. "If you come back, we can continue. If you go to ${rt.npc('Cross')} tomorrow with what you've learned here, I will understand that too."`,
      branches: [
        {
          label: `"I accept the argument. I understand the Red Court."`,
          targetNode: 'kade_accept',
        },
        {
          label: `"I'll think about it."`,
          targetNode: 'kade_leave',
        },
      ],
    },

    kade_accept: {
      id: 'kade_accept',
      speaker: 'Kade',
      text: `${rt.npc('Kade')} regards you with something close to recognition — not warmth, but the specific attention of one rationalizer acknowledging another. "Then you understand that conflict within the system is how the system proves it is reasonable. Whatever you choose to do, choose deliberately. The Red Court will remember the choice either way."`,
      onEnter: {
        setFlag: { join_kade_philosophy: true, red_court_arc_complete: true },
        grantRep: { faction: 'red_court', delta: 1 },
      },
      branches: [
        {
          label: `"I'll remember it too."`,
          targetNode: 'kade_leave',
        },
      ],
    },

    kade_on_lyris: {
      id: 'kade_on_lyris',
      speaker: 'Kade',
      text: `A pause. He does not pretend not to know what you mean. "She was conflicted when we turned her. She is still conflicted. I was conflicted once." ${rt.npc('Kade')} glances toward the door as if she might walk through it. "The question is whether conflict is the beginning of change or just a luxury we allow ourselves when we are comfortable enough to afford it. I do not know her answer yet. I am not sure she does either. What you do with her is yours. What I do is to keep being someone she can ask, if she ever decides to ask."`,
      onEnter: {
        setFlag: { kade_awareness_of_lyris: true },
      },
      branches: [
        {
          label: `"That's all you have to say about it?"`,
          targetNode: 'kade_leave',
        },
      ],
    },

    kade_leave: {
      id: 'kade_leave',
      speaker: 'Kade',
      text: `${rt.npc('Kade')} opens the journal again. "Come back. Or don't. Either is a form of honesty."`,
      branches: [],
    },
  },
}

const vexTree: DialogueTree = {
  npcId: 'vex_red_court',
  startNode: 'vex_start',
  nodes: {
    vex_start: {
      id: 'vex_start',
      speaker: 'Vex',
      text: `${rt.npc('Vex')} does not stop writing when you enter. The pen moves at a steady rate; the eyes flick up and return to the ledger without losing place. "Supply chain. Territory management. Resource allocation. What I do isn't complicated — it just sounds worse once you know what the supply is. What do you need?"`,
      branches: [
        {
          label: `"Walk me through the manifest."`,
          targetNode: 'vex_manifest',
        },
        {
          label: `"Your numbers don't match ${rt.npc('Rook')}'s private ledger."`,
          targetNode: 'vex_discrepancy',
          requiresFlag: 'pens_yield_discrepancy_found',
        },
        {
          label: `"Some of your supplies are going missing."`,
          targetNode: 'vex_theft',
        },
        {
          label: `"Nothing. Leaving."`,
          targetNode: 'vex_leave',
        },
      ],
    },

    vex_manifest: {
      id: 'vex_manifest',
      speaker: 'Vex',
      text: `The pen continues. Vex speaks to the ledger, not to you. "Intake is thirty-four percent voluntary, twenty-eight percent involuntary, thirty-eight percent contract-unclear. Distribution: sixty percent goes to the ${rt.keyword('Accord')} on their monthly purchase order. Twelve percent to the ${rt.keyword('Covenant of Dusk')} — that transfer is arranged through Vesper's people, not ours. Eighteen percent internal use. Ten percent research protocol, cold-stored for Transit Point 4." Vex finally looks up. "You want me to pretend I don't know what contract-unclear means. I will not. It means not-voluntary and not-involuntary. It means someone signed a form under pressure that the form did not acknowledge. The ratios have been shifting. The shift is not a problem. It is something we have optimized."`,
      onEnter: {
        setFlag: { pens_covenant_arrangement: true, vex_manifest_shared: true },
      },
      branches: [
        {
          label: `"The Accord is BUYING from the Red Court?"`,
          targetNode: 'vex_accord_buying',
        },
        {
          label: `"What is Transit Point 4?"`,
          targetNode: 'vex_transit_point',
        },
        {
          label: `"That's enough. Leaving."`,
          targetNode: 'vex_leave',
        },
      ],
    },

    vex_accord_buying: {
      id: 'vex_accord_buying',
      speaker: 'Vex',
      text: `"Yes." No hedge. No softening. "The Accord has been purchasing Red Court yield for four years. Their own citizens believe the supply is voluntary Covenant tithe only. It is not. The tithe accounts for roughly a third. The rest is ours. ${rt.npc('Cross')} knows. Vesper knows. The citizens of ${rt.keyword('Covenant')} who receive transfusions do not. This is the arrangement. The arrangement is stable because nobody wants to say what the arrangement is."`,
      branches: [
        {
          label: `"That's Vesper's philosophy with extra steps."`,
          targetNode: 'vex_leave',
        },
        {
          label: `"Does ${rt.npc('Vesper')} know exactly how much?"`,
          targetNode: 'vex_leave',
        },
      ],
    },

    vex_transit_point: {
      id: 'vex_transit_point',
      speaker: 'Vex',
      text: `Vex's pen pauses for the first time. Resumes. "Above my clearance. Research protocol material goes northwest on a schedule. The destination is not on the manifest. ${rt.npc('Rook')} authorizes the shipment; I arrange the cold chain. Who receives it is not my question." A very small look. "It has become your question, perhaps. That's Rook's problem."`,
      branches: [
        {
          label: `"Back to other topics."`,
          targetNode: 'vex_start',
        },
      ],
    },

    vex_discrepancy: {
      id: 'vex_discrepancy',
      speaker: 'Vex',
      text: `"Rook runs a private variance. Three point two percent, consistent, over eighteen months." The pen moves again without pause. "I see the discrepancy every time I reconcile. I have not reported it. The total remains within sustainable capacity; the allocation simply differs from the ledger. Rook is entitled to a variance budget. The Council does not need to know every allocation. That is management."`,
      branches: [
        {
          label: `"You're covering for Rook."`,
          targetNode: 'vex_leave',
        },
        {
          label: `"Where is the three percent going?"`,
          targetNode: 'vex_leave',
        },
      ],
    },

    vex_theft: {
      id: 'vex_theft',
      speaker: 'Vex',
      text: `"Theft is a variance." Flat. Unbothered. "The system can absorb variance within zero point three percent. At zero point eight, the variance becomes reportable. At one point two, it becomes a security matter. We are currently at zero point two percent." Vex looks at you directly for the first time. "The system is still within tolerance. I know who takes the supplies. I have not stopped her. The math says the loss is negligible. That is all the system requires of me."`,
      onEnter: {
        setFlag: { vex_silent_tolerance_revealed: true },
      },
      branches: [
        {
          label: `"You're letting ${rt.npc('Lyris')} do this."`,
          targetNode: 'vex_leave',
        },
        {
          label: `"Mathematics as mercy. That's cold."`,
          targetNode: 'vex_leave',
        },
      ],
    },

    vex_leave: {
      id: 'vex_leave',
      speaker: 'Vex',
      text: `The pen resumes. The eyes return to the ledger. "Close the door on the way out."`,
      branches: [],
    },
  },
}

const lyrisTree: DialogueTree = {
  npcId: 'lyris_red_court',
  startNode: 'lyris_start',
  nodes: {
    lyris_start: {
      id: 'lyris_start',
      speaker: 'Lyris',
      text: `${rt.npc('Lyris')} straightens the way someone does when they've been caught thinking about something. "Six months. I know it doesn't show on the outside but it does on the inside — there's a version of me that's still figuring out the rules. Not the Red Court rules. The other rules. The ones for being what I am now."`,
      branches: [
        {
          label: `"Are you sure this is what you want?"`,
          targetNode: 'lyris_conflict',
        },
        {
          label: `"I saw you in the quarantine wing with a white-banded donor."`,
          targetNode: 'lyris_caught',
          requiresFlag: 'pens_covenant_arrangement',
        },
        {
          label: `"Keep the rounds. Good luck with the rules."`,
          targetNode: 'lyris_leave',
        },
      ],
    },

    lyris_conflict: {
      id: 'lyris_conflict',
      speaker: 'Lyris',
      text: `A pause. She looks at her hands — a thing she's been doing for months now, the inventory of a body that is no longer the body she grew up in. "Six months ago I didn't know enough to question this. Three months ago I knew enough to question it. Now —" She stops. Starts again. "Now I know enough to do something, and I'm doing the minimum thing I can do that still means something. I don't know what that makes me. I don't think Kade's argument fits me. I don't think I fit the argument."`,
      onEnter: {
        setFlag: { lyris_doubter_revealed: true },
      },
      branches: [
        {
          label: `"What's the minimum thing?"`,
          targetNode: 'lyris_caught',
        },
        {
          label: `"Talk to ${rt.npc('Kade')}. Don't let him answer for you."`,
          targetNode: 'lyris_leave',
        },
      ],
    },

    lyris_caught: {
      id: 'lyris_caught',
      speaker: 'Lyris',
      text: `${rt.npc('Lyris')} goes very still. When she speaks, the control in her voice is the control of someone who has rehearsed the admission for weeks. "The AB-negative donor. She was white-banded for research protocol — Transit Point 4 is not research. I've been stealing a field surgery kit together. I'm going to move her through the transit tunnel tonight. Not free — delayed. There is no version of this where I get everyone out. I am buying one person a different ending than the one Rook authorized." A breath. "${rt.npc('Rook')} knows. ${rt.npc('Vex')} knows. They're letting me. The math says the loss is small. It's not mercy. It's tolerance. I'll take it. But I need someone on my side of the door who isn't one of them."`,
      onEnter: {
        setFlag: { lyris_extraction_planned: true },
      },
      branches: [
        {
          label: `"I'll help you move her out."`,
          targetNode: 'lyris_aid',
        },
        {
          label: `"I'm going to the ${rt.keyword('Accord')} with all of this."`,
          targetNode: 'lyris_expose',
        },
        {
          label: `"This is your problem. I'm not making it mine."`,
          targetNode: 'lyris_refuse',
        },
      ],
    },

    lyris_aid: {
      id: 'lyris_aid',
      speaker: 'Lyris',
      text: `The relief on her face is brief — she does not let it settle — but it was there. "Good. Thank you. Be at the transit tunnel at shift change." She pulls something from an inner pocket: a thin translucent slide, cold to the touch, threaded on a simple cord. "My biometric. If you end up at the ${rt.keyword('Scar')} and you need Sanguine authentication and you don't want to owe ${rt.npc('Vesper')} for it — use mine. I gave it. I gave it knowing what you might do with it. That's not a small thing where I come from." She closes your hand around it. "Don't tell ${rt.npc('Kade')} I said thank you. He'd write it down."`,
      onEnter: {
        setFlag: { aid_lyris_extraction: true, sanguine_biometric_obtained: true, red_court_arc_complete: true },
        grantRep: { faction: 'red_court', delta: -1 },
      },
      branches: [
        {
          label: `"Tonight. Transit tunnel."`,
          targetNode: 'lyris_leave',
        },
      ],
    },

    lyris_expose: {
      id: 'lyris_expose',
      speaker: 'Lyris',
      text: `${rt.npc('Lyris')} takes a step back. Her face does not change — the face has been trained by six months of Sanguine discipline — but the distance is the statement. "Then we don't have anything else to say. The donor goes to Transit Point 4 tonight. The kit stays here. You will have done the bigger right thing and the smaller wrong one. I hope it's worth it to you. It won't be to her."`,
      onEnter: {
        setFlag: { disrupt_vex_system: true, red_court_arc_complete: true },
      },
      branches: [
        {
          label: `[ leave ]`,
          targetNode: 'lyris_leave',
        },
      ],
    },

    lyris_refuse: {
      id: 'lyris_refuse',
      speaker: 'Lyris',
      text: `"Fair." She does not sound disappointed. She sounds like someone updating a mental ledger. "You saw. You decided the seeing was enough. That's a position. It's not mine, but it's a position." She turns back toward her patrol route. "If you change your mind, I'm at the tunnel at shift change. Otherwise — walk good, traveler."`,
      onEnter: {
        setFlag: { passive_observer: true, red_court_arc_complete: true },
      },
      branches: [
        {
          label: `[ leave ]`,
          targetNode: 'lyris_leave',
        },
      ],
    },

    lyris_leave: {
      id: 'lyris_leave',
      speaker: 'Lyris',
      text: `${rt.npc('Lyris')} resumes her patrol. The measured gait of someone still thinking about the steps.`,
      branches: [],
    },
  },
}

// ============================================================

export const DIALOGUE_TREES: Record<string, DialogueTree> = {
  // Lev has two spawn points referencing different tree IDs,
  // but both use the same tree content.
  lev_entry_hall: levTree,
  lev_office_quest: levTree,

  // Sparks at Crossroads
  cr_sparks_intro: sparksTree,
  cr_sparks_signal_quest: sparksSignalQuestTree,

  // Marshal Cross at Covenant courthouse
  cv_marshal_cross_intro: crossTree,

  // Warlord Briggs at Salt Creek command
  sc_briggs_command: briggsTree,

  // Patch at Crossroads
  cr_patch_intro: patchTree,
  cr_patch_main: patchTree, // alias — crossroads.ts references this ID

  // Howard at River Road bridge
  rr_howard_bridge: howardTree,

  // Marta at Crossroads
  cr_marta_food: martaTree,

  // Dell in Covenant jail
  cv_dell_prisoner: dellTree,

  // Dr. Osei in the Breaks / Pine Sea lab
  br_osei_lab: oseiTree,

  // Elder Kai Nez in the Breaks
  br_kai_nez_camp: kaiNezTree,

  // The Wren — field encounters
  fe_wren_encounter: wrenTree,

  // Shepherd Hermit in Pine Sea
  ps_shepherd_hermit: shepherdHermitTree,

  // Deacon Harrow at The Ember (Nave + Deacon's Chamber)
  em_harrow_nave_intro: harrowTree,
  em_harrow_chamber_quest: harrowTree,

  // Avery at The Ember (Bell Tower)
  em_avery_doubt: averyTree,

  // Vesper at Duskhollow (Council Chamber)
  vesper_philosophy_main: vesperTree,

  // Castellan Rook at The Pens (Office)
  rook_office_dialogue: rookTree,

  // Elias Vane (The Broadcaster) at The Scar broadcast room
  scar_vane_broadcast: vaneTree,

  // Elder Sanguine (Lucid Elder) at The Deep sanctum
  dp_elder_sanguine_sanctum: elderSanguineTree,

  // --- [RIDER A: remnant-story-0329] Echo + Act 1 Climax ---
  echo_tree: echoTree,
  act1_climax_encounter: act1ClimaxTree,
  // --- [/RIDER A] ---

  // --- Red Court Arc (Phase 3) ---
  pens_kade_philosophy: kadeTree,
  pens_vex_manifest: vexTree,
  pens_lyris_conflict: lyrisTree,
}
