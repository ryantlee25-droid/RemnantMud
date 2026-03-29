// ============================================================
// class_reclaimer.ts — Reclaimer monologue pool
// Convoy: remnant-narrative-0329 | Rider F
//
// Voice: data-driven, sees the world as information.
// Systems failing: log it, diagnose it, fix it.
// Emotions are subroutines that keep interrupting the main process.
// ============================================================

import type { MonologuePool } from '@/types/convoy-contracts'

export const RECLAIMER_POOLS: MonologuePool[] = [

  // -------------------------------------------------------
  // low_hp — systems failing, core compromised
  // -------------------------------------------------------
  {
    class: 'reclaimer',
    personalLoss: 'child',
    trigger: 'low_hp',
    lines: [
      `*"Systems failing. Core functionality compromised. You need maintenance."*`,
      `*"You run the numbers on your current state. The numbers are bad. Do the maintenance anyway."*`,
      `*"Critical failure is not an option. Reconfigure. Continue."*`,
    ],
  },
  {
    class: 'reclaimer',
    personalLoss: 'partner',
    trigger: 'low_hp',
    lines: [
      `*"Systems failing. Core functionality compromised. You need maintenance."*`,
      `*"The data says you're running below threshold. Override. Keep running."*`,
      `*"You've salvaged things in worse condition than this. Salvage yourself."*`,
    ],
  },
  {
    class: 'reclaimer',
    personalLoss: 'community',
    trigger: 'low_hp',
    lines: [
      `*"Systems failing. Core functionality compromised. The mission requires maintenance. Proceed."*`,
      `*"You've kept broken machines running past their expected lifespan. You know how this works."*`,
      `*"Critical warning. Logged. Addressed. Moving."*`,
    ],
  },
  {
    class: 'reclaimer',
    personalLoss: 'identity',
    trigger: 'low_hp',
    lines: [
      `*"Systems failing. Core functionality compromised. Core identity: unknown. Keep going anyway."*`,
      `*"You don't know what you're rebuilding toward. You know how to rebuild. Start there."*`,
      `*"Critical failure is not an option. Reconfigure whatever is left."*`,
    ],
  },
  {
    class: 'reclaimer',
    personalLoss: 'promise',
    trigger: 'low_hp',
    lines: [
      `*"Systems failing. The promise requires operational status. Prioritize."*`,
      `*"You've run machines past their fail-safe limits. You're a machine. Run past yours."*`,
      `*"Critical warning: mission incomplete. Maintenance mandatory."*`,
    ],
  },

  // -------------------------------------------------------
  // post_combat — cataloguing, data processing
  // -------------------------------------------------------
  {
    class: 'reclaimer',
    personalLoss: 'child',
    trigger: 'post_combat',
    lines: [
      `*"You catalogue the injuries. Yours. Theirs. The data tells a story."*`,
      `*"Post-action analysis: efficiency was acceptable. Acceptable is not optimal. Improve."*`,
      `*"You survived. Log it. Move to the next problem."*`,
    ],
  },
  {
    class: 'reclaimer',
    personalLoss: 'partner',
    trigger: 'post_combat',
    lines: [
      `*"You catalogue the injuries. The data tells a story. You read it quickly and stop reading."*`,
      `*"Post-action analysis: survivable. The other analysis can wait."*`,
      `*"You survived. The data confirms it. That used to feel like less."*`,
    ],
  },
  {
    class: 'reclaimer',
    personalLoss: 'community',
    trigger: 'post_combat',
    lines: [
      `*"You catalogue the injuries. Log the resource expenditure. Run the efficiency numbers."*`,
      `*"The encounter data is useful. File it. Use it next time."*`,
      `*"Post-action: resources depleted at acceptable rate. Keep moving."*`,
    ],
  },
  {
    class: 'reclaimer',
    personalLoss: 'identity',
    trigger: 'post_combat',
    lines: [
      `*"You catalogue the injuries and the instincts. What you did just now — you've done it before."*`,
      `*"Post-action analysis: whoever you were, they trained for exactly this."*`,
      `*"The data from this encounter is consistent with the other encounters. A pattern is forming."*`,
    ],
  },
  {
    class: 'reclaimer',
    personalLoss: 'promise',
    trigger: 'post_combat',
    lines: [
      `*"You catalogue the encounter. It was a diversion from the mission. Log it, move on."*`,
      `*"Post-action: viable. The promise timeline is unchanged. Proceed."*`,
      `*"Resource cost: noted. Value delivered: mission continues. Net positive."*`,
    ],
  },

  // -------------------------------------------------------
  // in_danger — threat assessment as diagnostic
  // -------------------------------------------------------
  {
    class: 'reclaimer',
    personalLoss: 'child',
    trigger: 'in_danger',
    lines: [
      `*"You read the variables. Something in the system is degrading."*`,
      `*"Threat detected. You run a quick threat assessment. Respond accordingly."*`,
      `*"The data says: not good here. The data is usually right. Trust the data."*`,
    ],
  },
  {
    class: 'reclaimer',
    personalLoss: 'partner',
    trigger: 'in_danger',
    lines: [
      `*"Threat assessment in progress. Variables: elevated. Recommendation: caution."*`,
      `*"Something in the system is wrong. You read systems. This one is failing."*`,
      `*"The data says: danger. You've learned not to argue with clean data."*`,
    ],
  },
  {
    class: 'reclaimer',
    personalLoss: 'community',
    trigger: 'in_danger',
    lines: [
      `*"Threat detected. You run the numbers. The numbers are not good."*`,
      `*"Something in the pattern broke. You read broken patterns. This one is broken."*`,
      `*"Danger assessment: confirmed. Response protocol: activate."*`,
    ],
  },
  {
    class: 'reclaimer',
    personalLoss: 'identity',
    trigger: 'in_danger',
    lines: [
      `*"Threat detected. Your body had the data before you did. This isn't new behavior."*`,
      `*"Something is wrong here. You've been reading wrong rooms for longer than you remember."*`,
      `*"Danger. You respond. Whoever you are, you're very good at the response part."*`,
    ],
  },
  {
    class: 'reclaimer',
    personalLoss: 'promise',
    trigger: 'in_danger',
    lines: [
      `*"Threat detected. Calculate cost of engagement versus rerouting. Reroute if viable."*`,
      `*"Danger. The mission requires you alive. Protect the mission asset."*`,
      `*"The data says: proceed carefully. You proceed carefully."*`,
    ],
  },

  // -------------------------------------------------------
  // examining_loss_item — the data you can't process
  // -------------------------------------------------------
  {
    class: 'reclaimer',
    personalLoss: 'child',
    trigger: 'examining_loss_item',
    lines: [
      `*"The data was there all along. You just couldn't see the format."*`,
      `*"You turn it over. You run every analysis you know. The analysis is insufficient."*`,
      `*"Some data is not processable. You've been trying to process this for a long time."*`,
    ],
  },
  {
    class: 'reclaimer',
    personalLoss: 'partner',
    trigger: 'examining_loss_item',
    lines: [
      `*"The data was there. You saw it. The interpretation was wrong."*`,
      `*"You hold it and the data is loud and you don't want to process it."*`,
      `*"Some things don't resolve into data. This is one of them. That's new for you."*`,
    ],
  },
  {
    class: 'reclaimer',
    personalLoss: 'community',
    trigger: 'examining_loss_item',
    lines: [
      `*"The failure was documented. The failure was preventable. The documentation is very thorough."*`,
      `*"You hold it. You catalogue it. You can't fix this one and that's the problem."*`,
      `*"The data was there all along. You just kept finding reasons the conclusions were wrong."*`,
    ],
  },
  {
    class: 'reclaimer',
    personalLoss: 'identity',
    trigger: 'examining_loss_item',
    lines: [
      `*"The data was there all along. You just couldn't see the format yet."*`,
      `*"Another piece of the archive. You're reconstructing from fragments. It's slow work."*`,
      `*"Something in you recognizes this. The recognition doesn't come with a data label. Frustrating."*`,
    ],
  },
  {
    class: 'reclaimer',
    personalLoss: 'promise',
    trigger: 'examining_loss_item',
    lines: [
      `*"The data confirms: this is why. You didn't need confirmation. You have it now."*`,
      `*"You catalogue the object and what it represents. The catalogue is operational."*`,
      `*"Motivation: documented. Confirmed. Priority: unchanged."*`,
    ],
  },

  // -------------------------------------------------------
  // safe_rest — processing time, maintenance window
  // -------------------------------------------------------
  {
    class: 'reclaimer',
    personalLoss: 'child',
    trigger: 'safe_rest',
    lines: [
      `*"The quiet is good for processing. You have a lot to process."*`,
      `*"Maintenance window. You run diagnostics. You note the systems that need attention."*`,
      `*"Safe. You use the time efficiently. Rest is part of the system."*`,
    ],
  },
  {
    class: 'reclaimer',
    personalLoss: 'partner',
    trigger: 'safe_rest',
    lines: [
      `*"The quiet is good for processing. The loud parts are quieter when nothing else is loud."*`,
      `*"Maintenance window. You let the system run its own diagnostics for a while."*`,
      `*"You used to have someone to debug with. You debug alone now. It's slower."*`,
    ],
  },
  {
    class: 'reclaimer',
    personalLoss: 'community',
    trigger: 'safe_rest',
    lines: [
      `*"The quiet is good for processing. You have a backlog."*`,
      `*"Maintenance window. Systems recovery in progress. You let it happen."*`,
      `*"Safe. Use the downtime. There will be less downtime later."*`,
    ],
  },
  {
    class: 'reclaimer',
    personalLoss: 'identity',
    trigger: 'safe_rest',
    lines: [
      `*"The quiet is good for processing. Especially when what you're processing is yourself."*`,
      `*"Maintenance window. You don't know what you're maintaining. You maintain it anyway."*`,
      `*"Processing. Something is rebuilding. You don't interrupt it."*`,
    ],
  },
  {
    class: 'reclaimer',
    personalLoss: 'promise',
    trigger: 'safe_rest',
    lines: [
      `*"Maintenance window. The promise is in queue. Systems recovery first."*`,
      `*"The quiet is good for processing. You process the mission variables. You sleep."*`,
      `*"Rest is a resource. You allocate it correctly."*`,
    ],
  },

  // -------------------------------------------------------
  // act_transition — system parameters updated
  // -------------------------------------------------------
  {
    class: 'reclaimer',
    personalLoss: 'child',
    trigger: 'act_transition',
    lines: [
      `*"Parameters updated. You rebuild the model with the new data."*`,
      `*"The system changed. You read the new documentation. You adapt."*`,
    ],
  },
  {
    class: 'reclaimer',
    personalLoss: 'partner',
    trigger: 'act_transition',
    lines: [
      `*"System update. New constraints, new variables. You recalculate."*`,
      `*"The architecture changed. You reverse-engineer the new structure. You've done this before."*`,
    ],
  },
  {
    class: 'reclaimer',
    personalLoss: 'community',
    trigger: 'act_transition',
    lines: [
      `*"Parameters shifted. You rebuild the model. The new model is worse. You use it anyway."*`,
      `*"The world updated. You update your understanding. The mission continues."*`,
    ],
  },
  {
    class: 'reclaimer',
    personalLoss: 'identity',
    trigger: 'act_transition',
    lines: [
      `*"New data available. The model of yourself and the world both need updating."*`,
      `*"Parameters changed. You adapt. It's what you do. It's apparently always been what you do."*`,
    ],
  },
  {
    class: 'reclaimer',
    personalLoss: 'promise',
    trigger: 'act_transition',
    lines: [
      `*"System changed. The objective variable is constant. Recalculate the path."*`,
      `*"New constraints. Same endpoint. Solve for the new route."*`,
    ],
  },

  // -------------------------------------------------------
  // pressure_spike — anomaly detected
  // -------------------------------------------------------
  {
    class: 'reclaimer',
    personalLoss: 'child',
    trigger: 'pressure_spike',
    lines: [
      `*"Anomaly detected. The data pattern is degrading. Note it and proceed."*`,
      `*"Something in the ambient data is wrong. Read it carefully."*`,
    ],
  },
  {
    class: 'reclaimer',
    personalLoss: 'partner',
    trigger: 'pressure_spike',
    lines: [
      `*"System pressure increasing. You log the delta. The trend is not good."*`,
      `*"Something changed in the environment. The old model doesn't fit anymore."*`,
    ],
  },
  {
    class: 'reclaimer',
    personalLoss: 'community',
    trigger: 'pressure_spike',
    lines: [
      `*"Ambient threat index elevated. You've been tracking the pattern. Act on it."*`,
      `*"The data is signaling. You've learned not to ignore the data."*`,
    ],
  },
  {
    class: 'reclaimer',
    personalLoss: 'identity',
    trigger: 'pressure_spike',
    lines: [
      `*"Anomaly detected. Your instincts flagged it first. Trust the instincts."*`,
      `*"The pattern broke. Something changed. Find the change before it finds you."*`,
    ],
  },
  {
    class: 'reclaimer',
    personalLoss: 'promise',
    trigger: 'pressure_spike',
    lines: [
      `*"Elevated threat. The mission timeline may need compression. Adjust."*`,
      `*"The data is bad here. Log it. Navigate around it. Continue."*`,
    ],
  },
]
