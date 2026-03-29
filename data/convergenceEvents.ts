// ============================================================
// convergenceEvents.ts — Act 3 simultaneous quest collisions
// Pillar 4: Consequence Cascades
// Owner: Rider D (remnant-narrative-0329)
// ============================================================
//
// The Sanderson avalanche: every separate thread was always
// heading toward this collision. Act 3 doesn't introduce
// new threats — it reveals that the threats were always one.
//
// Design rules (from CONTRACT.md §4.3):
//   - Pure data exports. No side effects. No imports from lib.
//   - ConvergenceEvent interface from types/convoy-contracts.d.ts
//   - questFlag gates use canonical names from CONTRACT §6
// ============================================================

import type { ConvergenceEvent } from '@/types/convoy-contracts'

// ============================================================
// CONVERGENCE_EVENTS — 10 simultaneous collision points
//
// These fire when the player is in Act 3 and the relevant
// quest flag is set. Multiple may fire simultaneously — that
// is the point. The player cannot resolve all of them.
// ============================================================

export const CONVERGENCE_EVENTS: ConvergenceEvent[] = [

  // ----------------------------------------------------------
  // 1. The Ritual and the Offensive
  //
  // The Kindling begin their purification ritual on the same
  // night the Salters launch their eastern push. Neither side
  // planned this. The roads between them pass through the same
  // crossroads the player uses.
  // ----------------------------------------------------------
  {
    id: 'convergence_ritual_offensive',
    factionA: 'kindling',
    factionB: 'salters',
    questFlag: 'act3_meridian_approach',
    simultaneousRequests: [
      {
        faction: 'kindling',
        request:
          'Deacon Harrow needs you at the Ember before midnight. ' +
          'The ritual cannot begin without a witness who has seen what you have seen. ' +
          'He says it will not take long. He has been wrong before.',
      },
      {
        faction: 'salters',
        request:
          'Briggs is moving the eastern column tonight and needs the crossroads clear ' +
          'of Kindling patrols. He thinks you can manage this quietly. ' +
          'He is not asking.',
      },
    ],
    narration:
      'The Kindling torches are visible from the crossroads — they began burning at dusk. ' +
      'The Salter column is moving from the south. You can hear them both from where you stand. ' +
      'They cannot hear each other yet. ' +
      'They will.',
  },

  // ----------------------------------------------------------
  // 2. Cross and Harrow
  //
  // Marshal Cross and Deacon Harrow have been circling this
  // confrontation for two acts. Now they are both in the same
  // room, and they want the player to choose a side.
  // ----------------------------------------------------------
  {
    id: 'convergence_cross_harrow',
    factionA: 'accord',
    factionB: 'kindling',
    questFlag: 'act3_cross_harrow_confrontation',
    simultaneousRequests: [
      {
        faction: 'accord',
        request:
          'Cross wants your testimony. She is building a case for relocating ' +
          'the Kindling compound outside the settlement perimeter. ' +
          'She needs someone the council will believe.',
      },
      {
        faction: 'kindling',
        request:
          'Harrow asks you to speak at the fire gathering tonight — ' +
          'to tell what you saw in the deep. The Accord will not be invited. ' +
          'He knows you cannot do both.',
      },
    ],
    narration:
      'Cross is standing at the far end of the hall. Harrow is at the door. ' +
      'They are not speaking to each other. They are both looking at you. ' +
      'You have been useful to both of them, separately, for a long time. ' +
      'That was never going to last.',
  },

  // ----------------------------------------------------------
  // 3. Lev's Data vs Vesper's History
  //
  // Lev's research says one thing happened at MERIDIAN.
  // Vesper's memory says another. Both are present.
  // Both claim to be telling the truth.
  // One of them is lying, or both are, or neither is.
  // ----------------------------------------------------------
  {
    id: 'convergence_lev_vesper',
    factionA: 'reclaimers',
    factionB: 'lucid',
    questFlag: 'act3_meridian_data_conflict',
    simultaneousRequests: [
      {
        faction: 'reclaimers',
        request:
          'Lev\u2019s analysis of the MERIDIAN signal logs shows a shutdown event ' +
          'on the day Vesper says the facility was abandoned. ' +
          'He needs you to confront her with it. He says he cannot do it himself.',
      },
      {
        faction: 'lucid',
        request:
          'Vesper has brought documentation. Pre-Collapse records. ' +
          'She wants to present them to you privately, before Lev sees them, ' +
          'because what they say about the Reclaimers\u2019 founding cannot be unsaid.',
      },
    ],
    narration:
      'Lev is across the table from Vesper. There is a tablet between them with data on it. ' +
      'Neither of them has touched it since you walked in. ' +
      'The silence has been going for a while.',
  },

  // ----------------------------------------------------------
  // 4. Red Court Takes the Chaos
  //
  // While the player is managing faction conflicts, the Red
  // Court uses the distraction to move on a Covenant of Dusk
  // operation in the pens. They do not need permission.
  // ----------------------------------------------------------
  {
    id: 'convergence_red_court_expansion',
    factionA: 'red_court',
    factionB: 'covenant_of_dusk',
    questFlag: 'act3_red_court_expansion',
    simultaneousRequests: [
      {
        faction: 'red_court',
        request:
          'A Red Court footguard leaves a message at your last known location: ' +
          'the pens are theirs now. They are not asking for help. ' +
          'They are informing you of a fact.',
      },
      {
        faction: 'covenant_of_dusk',
        request:
          'The Covenant socialite who has been informally passing you information ' +
          'is asking for extraction from the pens. Tonight. ' +
          'She says the Red Court does not know about her contact with you — ' +
          'she says it quickly, twice, as if saying it faster makes it more true.',
      },
    ],
    narration:
      'You hear the sounds from the pens before you see anything. ' +
      'Not fighting — occupation is quieter than fighting. ' +
      'It\u2019s the absence of the usual noise that tells you something has changed.',
  },

  // ----------------------------------------------------------
  // 5. The Hollow Swarm Arrives
  //
  // Nobody was planning for this. The Hollow swarm arrives
  // during the faction fighting, and suddenly all the things
  // the factions were doing to each other matter less.
  // ----------------------------------------------------------
  {
    id: 'convergence_hollow_swarm',
    factionA: 'ferals',
    factionB: 'accord',
    questFlag: 'act3_hollow_pressure_peak',
    simultaneousRequests: [
      {
        faction: 'ferals',
        request:
          'There is no request. The Ferals do not negotiate. ' +
          'They are moving through the northeast sector in numbers you have not seen before. ' +
          'They are moving toward the light and sound of the faction conflict.',
      },
      {
        faction: 'accord',
        request:
          'Cross is organizing a defense line. She needs bodies. ' +
          'The Kindling and the Salters are still fighting each other ' +
          'on the road behind the line. ' +
          'She needs someone to stop that, too.',
      },
    ],
    narration:
      'The swarm arrives from the east during the second hour of the faction conflict. ' +
      'Accord sentries see it first and for a moment they stop shooting ' +
      'at the people they were shooting at. ' +
      'Then the shooting starts again, because training is training ' +
      'and people do not change mid-crisis. ' +
      'But they are slower now. They are looking over their shoulders.',
  },

  // ----------------------------------------------------------
  // 6. Allies on Opposite Sides
  //
  // Two NPCs the player has built relationships with are on
  // opposite sides of the same action. There is no path that
  // helps both of them.
  // ----------------------------------------------------------
  {
    id: 'convergence_allies_split',
    factionA: 'reclaimers',
    factionB: 'kindling',
    questFlag: 'act3_ally_conflict',
    simultaneousRequests: [
      {
        faction: 'reclaimers',
        request:
          'Lev has learned that Harrow plans to destroy the old transmission tower ' +
          'at the Ember to prevent MERIDIAN from broadcasting the new frequency. ' +
          'He needs you to stop this. He has been relying on you for weeks.',
      },
      {
        faction: 'kindling',
        request:
          'Avery, if she is still alive, has asked you here in secret. ' +
          'Or, if she is gone, Harrow himself makes this ask directly: ' +
          'the tower must come down. The signal it carries has already changed ' +
          'three people who listened too long. He shows you what they look like now.',
      },
    ],
    narration:
      'Lev\u2019s message and Harrow\u2019s message arrived within the same hour. ' +
      'You have spent weeks building both of these relationships. ' +
      'They both know that. They are both asking anyway.',
  },

  // ----------------------------------------------------------
  // 7. The Approach to MERIDIAN — Not Empty
  //
  // The road to MERIDIAN passes through active combat.
  // There are no empty rooms. Every path has something in it.
  // ----------------------------------------------------------
  {
    id: 'convergence_meridian_approach',
    factionA: 'accord',
    factionB: 'red_court',
    questFlag: 'act3_meridian_approach',
    simultaneousRequests: [
      {
        faction: 'accord',
        request:
          'Cross has a squad moving on MERIDIAN from the north. ' +
          'She wants you ahead of them — scout and hold the first junction. ' +
          'She says there is no other way in.',
      },
      {
        faction: 'red_court',
        request:
          'The Red Court has a team moving on MERIDIAN from the east. ' +
          'Their contact reaches you before Cross does. ' +
          'They offer safe passage through the pens if you go with them. ' +
          'There is a word for what they are implying and it is not \u201cpartnership.\u201d',
      },
    ],
    narration:
      'The roads to MERIDIAN converge at the junction you are standing in now. ' +
      'You can hear the Accord column from the north. ' +
      'You can hear something else from the east that you have been trying not to name. ' +
      'There is only one facility at the end of both roads.',
  },

  // ----------------------------------------------------------
  // 8. The Broadcaster's Signal Changes
  //
  // Vane has been broadcasting on MERIDIAN's frequency.
  // The signal changes. Something new is transmitting.
  // Vane is no longer the only voice on the air.
  // ----------------------------------------------------------
  {
    id: 'convergence_signal_change',
    factionA: 'lucid',
    factionB: 'reclaimers',
    questFlag: 'act3_meridian_signal_change',
    simultaneousRequests: [
      {
        faction: 'lucid',
        request:
          'Vesper needs you at the listening post. She will not say why over the radio. ' +
          'She says only: something else is transmitting, and it is using Vane\u2019s voice.',
      },
      {
        faction: 'reclaimers',
        request:
          'Lev has been triangulating the new signal. It is not coming from MERIDIAN. ' +
          'It is coming from somewhere east of the facility, and it has been transmitting ' +
          'since before the Collapse. He sounds like a person who has not slept.',
      },
    ],
    narration:
      'The radio crackles at the frequency you have been monitoring. ' +
      'Vane\u2019s voice says something you have not heard Vane say before. ' +
      'It says it again. It is using Vane\u2019s cadence, Vane\u2019s patterns, ' +
      'every verbal habit you have catalogued over weeks of listening. ' +
      'But Vane is sitting three feet away from you and their mouth is not moving.',
  },

  // ----------------------------------------------------------
  // 9. The Salter Bounty Lands
  //
  // All outstanding Salter bounties come due simultaneously.
  // If the player has angered Briggs at any point, all of those
  // debts collect at once during the convergence chaos.
  // ----------------------------------------------------------
  {
    id: 'convergence_bounty_collected',
    factionA: 'salters',
    factionB: 'drifters',
    questFlag: 'act3_salter_bounty_active',
    simultaneousRequests: [
      {
        faction: 'salters',
        request:
          'Briggs has not forgotten the debt. ' +
          'He sends collection during the convergence chaos because he knows ' +
          'you will be busy and the Accord will be distracted. ' +
          'The collectors are not interested in negotiation.',
      },
      {
        faction: 'drifters',
        request:
          'A Drifter cart team warns you the collectors are coming. ' +
          'They know a route that avoids the Salter checkpoints. ' +
          'They want something in return, and they tell you what after you ask. ' +
          'It is not nothing.',
      },
    ],
    narration:
      'The people who arrived this morning are not here to trade. ' +
      'You recognized the Salter insignia on their gear before they said anything, ' +
      'and they recognized you at the same time. ' +
      'You have been in the same situation before, with different people. ' +
      'It never ends well for one side.',
  },

  // ----------------------------------------------------------
  // 10. MERIDIAN Speaks
  //
  // The final convergence. MERIDIAN responds directly to the
  // player's presence. All faction threads have led here.
  // The player made this happen — every choice, every alliance,
  // every betrayal was a step toward this room.
  // ----------------------------------------------------------
  {
    id: 'convergence_meridian_speaks',
    factionA: 'reclaimers',
    factionB: 'lucid',
    questFlag: 'act3_complete',
    simultaneousRequests: [
      {
        faction: 'reclaimers',
        request:
          'Lev\u2019s voice in your earpiece, asking you to pull the hardline. ' +
          'Just the hardline. Just disconnect it from the node and all of this ends. ' +
          'He says he promises, and he has never broken a promise to you.',
      },
      {
        faction: 'lucid',
        request:
          'Vesper is on the other side of the room. She is shaking her head. ' +
          'She says if you pull that line you will lose everything that was recorded here, ' +
          'and she says it quietly, the way she says things she knows you will not want to hear.',
      },
    ],
    narration:
      'The room hums. It has been humming since before you arrived — ' +
      'you realize this only now, the way you realize a sound you have been ' +
      'tuning out for hours. ' +
      'The screens are all lit. Every screen in the room. ' +
      'They are showing you something, and it is not the same thing on every screen, ' +
      'and after a moment you understand that each screen is showing you a different ' +
      'version of what has happened. ' +
      'In each version, you made different choices. ' +
      'In each version, you are standing in this room.',
  },
]
