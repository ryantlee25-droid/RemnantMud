// ============================================================
// class_scout.ts — Scout monologue pool
// Convoy: remnant-narrative-0329 | Rider F
//
// Voice: observational, analytical, always processing.
// Catalogues everything. Slow is dangerous. Data is life.
// The world is a pattern — they're still figuring out this one.
// ============================================================

import type { MonologuePool } from '@/types/convoy-contracts'

export const SCOUT_POOLS: MonologuePool[] = [

  // -------------------------------------------------------
  // low_hp — adrenaline analysis, focus discipline
  // -------------------------------------------------------
  {
    class: 'scout',
    personalLoss: 'child',
    trigger: 'low_hp',
    lines: [
      `*"Your vision narrows. That's the adrenaline leaving. Stay focused."*`,
      `*"Running out of margin. Calculate what's necessary. Cut everything else."*`,
      `*"The data says: not good. The data also says: still viable. Trust the data."*`,
    ],
  },
  {
    class: 'scout',
    personalLoss: 'partner',
    trigger: 'low_hp',
    lines: [
      `*"Your vision narrows. That's the adrenaline leaving. Stay focused."*`,
      `*"Running low. Prioritize. Move."*`,
      `*"You've assessed worse situations. This one is manageable. Manage it."*`,
    ],
  },
  {
    class: 'scout',
    personalLoss: 'community',
    trigger: 'low_hp',
    lines: [
      `*"Your vision narrows. Tunnel vision. Compensate — check your flanks."*`,
      `*"Running out of margin. You've seen others miscalculate this. Don't."*`,
      `*"The data says you need to find cover. The data is usually right."*`,
    ],
  },
  {
    class: 'scout',
    personalLoss: 'identity',
    trigger: 'low_hp',
    lines: [
      `*"Your vision narrows. The body's response is crisp. You've been here before."*`,
      `*"Running out of margin. Whoever you are — don't stop yet."*`,
      `*"You don't know your history. The body does. Listen to it."*`,
    ],
  },
  {
    class: 'scout',
    personalLoss: 'promise',
    trigger: 'low_hp',
    lines: [
      `*"Your vision narrows. The adrenaline leaving. You have a promise to keep."*`,
      `*"Running out of margin. Factor in the deadline. Move."*`,
      `*"Data says: critical. Priority says: irrelevant. Keep going."*`,
    ],
  },

  // -------------------------------------------------------
  // post_combat — replay analysis, timing critique
  // -------------------------------------------------------
  {
    class: 'scout',
    personalLoss: 'child',
    trigger: 'post_combat',
    lines: [
      `*"You replay it in your head. The opening was at second three. You took it at second five. Slow."*`,
      `*"Threat catalogued, processed, neutralized. The efficiency rating is acceptable."*`,
      `*"You note what you could have done better. You always note it. You're always right."*`,
    ],
  },
  {
    class: 'scout',
    personalLoss: 'partner',
    trigger: 'post_combat',
    lines: [
      `*"You replay it in your head. The opening was at second three. You took it at five. You know why."*`,
      `*"Threat eliminated. Post-action review: hesitation on initial contact. Address that."*`,
      `*"You note what you could have done better. It's a longer list than it used to be."*`,
    ],
  },
  {
    class: 'scout',
    personalLoss: 'community',
    trigger: 'post_combat',
    lines: [
      `*"You replay it. The opening was there earlier. You were watching for something else."*`,
      `*"Threat eliminated. You catalog the encounter for the mental map. Everything is data."*`,
      `*"You could have ended it faster. Next one."*`,
    ],
  },
  {
    class: 'scout',
    personalLoss: 'identity',
    trigger: 'post_combat',
    lines: [
      `*"You replay it. The instincts are clean. Whatever you lost, you didn't lose this."*`,
      `*"Threat eliminated. You catalog it automatically. The reflex is older than your memory."*`,
      `*"You could have ended it faster. Something in you knows exactly how."*`,
    ],
  },
  {
    class: 'scout',
    personalLoss: 'promise',
    trigger: 'post_combat',
    lines: [
      `*"You replay it. The opening was at second three. Delay cost you. Don't let it cost you again."*`,
      `*"Threat eliminated. You're still on schedule. Keep moving."*`,
      `*"You note what you could have done better. You'll be better. There's time."*`,
    ],
  },

  // -------------------------------------------------------
  // in_danger — pattern recognition, exit mapping
  // -------------------------------------------------------
  {
    class: 'scout',
    personalLoss: 'child',
    trigger: 'in_danger',
    lines: [
      `*"You map exits in your head before you move. Three ways out. Pick the best one."*`,
      `*"The pattern is wrong. You feel it before you see it. That's worth something."*`,
      `*"You've read this terrain. Something's changed. Find the change first."*`,
    ],
  },
  {
    class: 'scout',
    personalLoss: 'partner',
    trigger: 'in_danger',
    lines: [
      `*"You map exits. Two clear, one contingency. This is the contingency kind of situation."*`,
      `*"The pattern is wrong. Something in the data set doesn't fit."*`,
      `*"You've seen this before. You know what comes next. Get ahead of it."*`,
    ],
  },
  {
    class: 'scout',
    personalLoss: 'community',
    trigger: 'in_danger',
    lines: [
      `*"You map exits. You always map exits. Today that habit might save your life."*`,
      `*"The pattern is wrong. You read terrain better than most. Read this one."*`,
      `*"You've tracked enough threats to know when you're being tracked back."*`,
    ],
  },
  {
    class: 'scout',
    personalLoss: 'identity',
    trigger: 'in_danger',
    lines: [
      `*"You map exits. The instinct is sharp. Trust it."*`,
      `*"The pattern is wrong. You don't know how you know, but you know."*`,
      `*"Something in your training surfaces. Use it. Figure out the rest later."*`,
    ],
  },
  {
    class: 'scout',
    personalLoss: 'promise',
    trigger: 'in_danger',
    lines: [
      `*"You map exits. The path forward still exists. Find it."*`,
      `*"The pattern is wrong. Adjust. The promise doesn't care about complications."*`,
      `*"You've navigated worse to get here. Navigate this."*`,
    ],
  },

  // -------------------------------------------------------
  // examining_loss_item — analysis as distance
  // -------------------------------------------------------
  {
    class: 'scout',
    personalLoss: 'child',
    trigger: 'examining_loss_item',
    lines: [
      `*"The pattern is there. You just need more data points."*`,
      `*"You catalogue it. Date it. Place it on a mental timeline. The clinical approach is the only one that doesn't break you."*`,
      `*"You've been collecting evidence of what happened. You don't know why. You keep collecting."*`,
    ],
  },
  {
    class: 'scout',
    personalLoss: 'partner',
    trigger: 'examining_loss_item',
    lines: [
      `*"You catalogue it. Record it. The analysis keeps your hands busy."*`,
      `*"Data point. Another data point. The pattern it makes is one you'd rather not see."*`,
      `*"The pattern is there. You have enough data points. You don't want to draw the conclusion."*`,
    ],
  },
  {
    class: 'scout',
    personalLoss: 'community',
    trigger: 'examining_loss_item',
    lines: [
      `*"Another piece of the map. You keep filling it in even when you don't want to."*`,
      `*"The pattern is clear enough. You just keep looking for variables that change the outcome."*`,
      `*"You read the evidence. The evidence is not kind."*`,
    ],
  },
  {
    class: 'scout',
    personalLoss: 'identity',
    trigger: 'examining_loss_item',
    lines: [
      `*"You study it for clues. That's all you do now — look for clues."*`,
      `*"Another data point for the reconstruction. You're building yourself backward from evidence."*`,
      `*"The pattern is there somewhere. You just can't see the whole map yet."*`,
    ],
  },
  {
    class: 'scout',
    personalLoss: 'promise',
    trigger: 'examining_loss_item',
    lines: [
      `*"Evidence of why you're here. You don't need more evidence. You keep it anyway."*`,
      `*"You catalogue it. File it under: reasons. The list is sufficient."*`,
      `*"The data confirms what you already knew. The mission continues."*`,
    ],
  },

  // -------------------------------------------------------
  // safe_rest — exits mapped, sleep scheduled
  // -------------------------------------------------------
  {
    class: 'scout',
    personalLoss: 'child',
    trigger: 'safe_rest',
    lines: [
      `*"You map exits in your head before you close your eyes. Three ways out. Always three."*`,
      `*"You'll sleep for four hours. Your internal clock is calibrated. You'll wake up."*`,
      `*"The silence is informative. You listen to it for a while before you trust it."*`,
    ],
  },
  {
    class: 'scout',
    personalLoss: 'partner',
    trigger: 'safe_rest',
    lines: [
      `*"You map exits before you close your eyes. Three ways out. The same three you always count."*`,
      `*"You listen to the silence. You used to listen to something else. You listen to the silence now."*`,
      `*"Four hours. Your body is efficient enough for four."*`,
    ],
  },
  {
    class: 'scout',
    personalLoss: 'community',
    trigger: 'safe_rest',
    lines: [
      `*"You map exits before you sleep. Old habit from places with more people to protect."*`,
      `*"The silence tells you: safe. You verify that against three other data points."*`,
      `*"You rest. You don't stop watching. Both can be true at once."*`,
    ],
  },
  {
    class: 'scout',
    personalLoss: 'identity',
    trigger: 'safe_rest',
    lines: [
      `*"You map exits in your head. The behavior predates whatever you've lost."*`,
      `*"Your internal clock wakes you on schedule. You don't know how. You trust it."*`,
      `*"The silence. You listen to it. Somewhere in the listening, you sleep."*`,
    ],
  },
  {
    class: 'scout',
    personalLoss: 'promise',
    trigger: 'safe_rest',
    lines: [
      `*"You map exits. You log the timeline. You sleep for exactly as long as you can afford."*`,
      `*"Rest is tactical. You take it efficiently and without regret."*`,
      `*"The deadline is noted. The rest is scheduled. The data doesn't change while you sleep."*`,
    ],
  },

  // -------------------------------------------------------
  // act_transition — pattern shift detected
  // -------------------------------------------------------
  {
    class: 'scout',
    personalLoss: 'child',
    trigger: 'act_transition',
    lines: [
      `*"The pattern shifted. You log the new variables. The map needs updating."*`,
      `*"Everything you knew about this territory just changed. Start building new models."*`,
    ],
  },
  {
    class: 'scout',
    personalLoss: 'partner',
    trigger: 'act_transition',
    lines: [
      `*"The terrain changed. You adapt the map. Everything else catches up later."*`,
      `*"New parameters. New pattern to read. You've always been good at this part."*`,
    ],
  },
  {
    class: 'scout',
    personalLoss: 'community',
    trigger: 'act_transition',
    lines: [
      `*"The game changed. You note the new rules and play anyway."*`,
      `*"Pattern disruption detected. Start reading the new one."*`,
    ],
  },
  {
    class: 'scout',
    personalLoss: 'identity',
    trigger: 'act_transition',
    lines: [
      `*"Everything changed. You add it to the reconstruction. Whoever you are, they adapt."*`,
      `*"New map. New data. You've been building this from scratch anyway."*`,
    ],
  },
  {
    class: 'scout',
    personalLoss: 'promise',
    trigger: 'act_transition',
    lines: [
      `*"The path changed. The destination didn't. Navigate accordingly."*`,
      `*"New terrain. Same waypoint. Get moving."*`,
    ],
  },

  // -------------------------------------------------------
  // pressure_spike — environmental signal processing
  // -------------------------------------------------------
  {
    class: 'scout',
    personalLoss: 'child',
    trigger: 'pressure_spike',
    lines: [
      `*"The data is inconsistent. Something in the environment is signaling."*`,
      `*"You've tracked enough threats to read the air. The air is reading badly."*`,
    ],
  },
  {
    class: 'scout',
    personalLoss: 'partner',
    trigger: 'pressure_spike',
    lines: [
      `*"Something in the noise floor shifted. You caught it. Trust that."*`,
      `*"Ambient threat level increased. The numbers are soft. The feeling isn't."*`,
    ],
  },
  {
    class: 'scout',
    personalLoss: 'community',
    trigger: 'pressure_spike',
    lines: [
      `*"The pattern broke. Something is different. Find what changed."*`,
      `*"You've tracked enough things to know when you're not alone in the data."*`,
    ],
  },
  {
    class: 'scout',
    personalLoss: 'identity',
    trigger: 'pressure_spike',
    lines: [
      `*"Something shifted. Your body caught it before you did. Listen to it."*`,
      `*"The environment is communicating. You know how to listen."*`,
    ],
  },
  {
    class: 'scout',
    personalLoss: 'promise',
    trigger: 'pressure_spike',
    lines: [
      `*"Elevated threat density. You note it. You factor it in. You keep moving."*`,
      `*"Something's wrong with the pattern. File it, adjust, advance."*`,
    ],
  },
]
