// ============================================================
// class_wraith.ts — Wraith monologue pool
// Convoy: remnant-narrative-0329 | Rider F
//
// Voice: detached, cold, occasionally terrifying to themselves.
// The quiet is comfortable. The violence was always easy.
// That's the part they try not to think about.
// ============================================================

import type { MonologuePool } from '@/types/convoy-contracts'

export const WRAITH_POOLS: MonologuePool[] = [

  // -------------------------------------------------------
  // low_hp — the edge of dissolving
  // -------------------------------------------------------
  {
    class: 'wraith',
    personalLoss: 'child',
    trigger: 'low_hp',
    lines: [
      `*"Shadows don't bleed. But you're not a shadow. Not yet."*`,
      `*"You're losing too much. The parts of you that remain don't include this option."*`,
      `*"Don't. Not yet. There's still something unfinished."*`,
    ],
  },
  {
    class: 'wraith',
    personalLoss: 'partner',
    trigger: 'low_hp',
    lines: [
      `*"Shadows don't bleed. You're bleeding. That distinction matters today."*`,
      `*"Not yet. The cold voice says not yet. Listen to the cold voice."*`,
      `*"You've been less than this and survived. Become less. Survive."*`,
    ],
  },
  {
    class: 'wraith',
    personalLoss: 'community',
    trigger: 'low_hp',
    lines: [
      `*"Shadows don't bleed. Find the shadow in yourself. Go there."*`,
      `*"Not here. Not like this. You pick the when and the how."*`,
      `*"You've survived worse by becoming smaller. Do that."*`,
    ],
  },
  {
    class: 'wraith',
    personalLoss: 'identity',
    trigger: 'low_hp',
    lines: [
      `*"Shadows don't bleed. But you do. That means something. You're still not sure what."*`,
      `*"You don't know who you are. But whatever it is bleeds. Keep it bleeding forward."*`,
      `*"Not yet. You have questions. The questions don't get answered if you stop."*`,
    ],
  },
  {
    class: 'wraith',
    personalLoss: 'promise',
    trigger: 'low_hp',
    lines: [
      `*"Shadows don't bleed. You bleed. The promise doesn't care about the difference."*`,
      `*"Not yet. The cold voice knows what it said and to whom. Not yet."*`,
      `*"You've made it this far on less. Keep going on less."*`,
    ],
  },

  // -------------------------------------------------------
  // post_combat — the aftermath of invisible violence
  // -------------------------------------------------------
  {
    class: 'wraith',
    personalLoss: 'child',
    trigger: 'post_combat',
    lines: [
      `*"It was over before they knew you were there. You don't feel anything about that. You used to."*`,
      `*"You check yourself for evidence. There's never much evidence. That's the craft of it."*`,
      `*"The absence of feeling is information too. You note it. You move on."*`,
    ],
  },
  {
    class: 'wraith',
    personalLoss: 'partner',
    trigger: 'post_combat',
    lines: [
      `*"It was over before they knew you were there. You used to feel something about that."*`,
      `*"You check for evidence. Clean hands. It was always clean hands."*`,
      `*"You don't feel guilty. You stopped feeling guilty before you stopped feeling everything else."*`,
    ],
  },
  {
    class: 'wraith',
    personalLoss: 'community',
    trigger: 'post_combat',
    lines: [
      `*"It was over before they knew you were there. Clean. Efficient. Gone."*`,
      `*"You don't feel anything. You used to, around other people. Less and less."*`,
      `*"The absence isn't emptiness. It's how you move through the world now."*`,
    ],
  },
  {
    class: 'wraith',
    personalLoss: 'identity',
    trigger: 'post_combat',
    lines: [
      `*"It was over before they knew you were there. You've always been good at this. Why?"*`,
      `*"The skill is native. Whatever you forgot about yourself, you kept this."*`,
      `*"You don't feel anything. You're not sure if that's the loss talking or the training."*`,
    ],
  },
  {
    class: 'wraith',
    personalLoss: 'promise',
    trigger: 'post_combat',
    lines: [
      `*"It was over before they knew you were there. The promise required efficiency. You delivered."*`,
      `*"Clean. You are very good at clean. That's one thing."*`,
      `*"You don't feel anything. You stopped checking if that was a problem."*`,
    ],
  },

  // -------------------------------------------------------
  // in_danger — threat dissolved before it registers
  // -------------------------------------------------------
  {
    class: 'wraith',
    personalLoss: 'child',
    trigger: 'in_danger',
    lines: [
      `*"You don't think about the approach. You're already approaching."*`,
      `*"Something is wrong. You become still. Stillness is your language."*`,
      `*"The dark parts of you surface. You let them. This is what they're for."*`,
    ],
  },
  {
    class: 'wraith',
    personalLoss: 'partner',
    trigger: 'in_danger',
    lines: [
      `*"You don't think about the approach. You're already gone."*`,
      `*"Something is wrong. You become nothing. Nothing is safe."*`,
      `*"The cold settles in. You've learned to be grateful for the cold."*`,
    ],
  },
  {
    class: 'wraith',
    personalLoss: 'community',
    trigger: 'in_danger',
    lines: [
      `*"Threat registered. You're already repositioning."*`,
      `*"Something is wrong. You dissolve into the environment. That's the move."*`,
      `*"The cold parts of you are the useful parts. Let them lead."*`,
    ],
  },
  {
    class: 'wraith',
    personalLoss: 'identity',
    trigger: 'in_danger',
    lines: [
      `*"Threat. You move before you think. Whatever you are, you're very good at not being seen."*`,
      `*"Something is wrong. You become still. The instinct is older than your memory."*`,
      `*"You don't know your name. You know exactly where to stand to not be found. Interesting."*`,
    ],
  },
  {
    class: 'wraith',
    personalLoss: 'promise',
    trigger: 'in_danger',
    lines: [
      `*"Threat. You process it through the filter of: does this stop the promise? No. Proceed."*`,
      `*"Something is wrong. You dissolve. You deal with it from the shadow."*`,
      `*"The cold settles in. Good. The cold keeps you efficient."*`,
    ],
  },

  // -------------------------------------------------------
  // examining_loss_item — the crack in the ice
  // -------------------------------------------------------
  {
    class: 'wraith',
    personalLoss: 'child',
    trigger: 'examining_loss_item',
    lines: [
      `*"You hold it and something in you cracks open. Not much. Enough to see light."*`,
      `*"You hold it for a long time. The feeling that comes is unfamiliar. You are cautious with it."*`,
      `*"Something in you is not cold. You wish you could guarantee it stays hidden."*`,
    ],
  },
  {
    class: 'wraith',
    personalLoss: 'partner',
    trigger: 'examining_loss_item',
    lines: [
      `*"Secrets recognize their own."*`,
      `*"You hold it. You feel something. You've been trying not to feel anything for a long time."*`,
      `*"The ice has one thin place. You found it. You put the thing down carefully."*`,
    ],
  },
  {
    class: 'wraith',
    personalLoss: 'community',
    trigger: 'examining_loss_item',
    lines: [
      `*"You hold it and something surfaces. You don't have a name for it. You're afraid to look directly at it."*`,
      `*"The warmth you learned in them left a shape. This thing fits that shape. You wish it didn't."*`,
      `*"The cold is not infinite. You've known that for a while. You try not to think about it."*`,
    ],
  },
  {
    class: 'wraith',
    personalLoss: 'identity',
    trigger: 'examining_loss_item',
    lines: [
      `*"Secrets recognize their own. This tells you something. You're not ready for it."*`,
      `*"You hold it. Your hands know something your mind doesn't. That terrifies you a little."*`,
      `*"Another piece of something. You're building a picture you might not want to see."*`,
    ],
  },
  {
    class: 'wraith',
    personalLoss: 'promise',
    trigger: 'examining_loss_item',
    lines: [
      `*"You made the promise in the dark. You hold this in the dark. The symmetry is not comforting."*`,
      `*"You hold it and remember exactly what you promised and to whom. The memory is sharp."*`,
      `*"The promise made you something. Standing here, holding this, you're not sure that's better."*`,
    ],
  },

  // -------------------------------------------------------
  // safe_rest — you don't sleep, you just stop moving
  // -------------------------------------------------------
  {
    class: 'wraith',
    personalLoss: 'child',
    trigger: 'safe_rest',
    lines: [
      `*"You don't sleep. You just stop moving for a while."*`,
      `*"Safe. You file the concept. You don't entirely believe in it."*`,
      `*"The quiet is comfortable. That's one good thing."*`,
    ],
  },
  {
    class: 'wraith',
    personalLoss: 'partner',
    trigger: 'safe_rest',
    lines: [
      `*"You don't sleep. You just stop moving for a while. It used to be different."*`,
      `*"The quiet is comfortable. The comfort is almost suspicious."*`,
      `*"You face the wall. You used to face someone else. The wall is easier."*`,
    ],
  },
  {
    class: 'wraith',
    personalLoss: 'community',
    trigger: 'safe_rest',
    lines: [
      `*"You don't sleep. You just stop moving for a while."*`,
      `*"The absence of other people's noise. You tell yourself you prefer it. Mostly true."*`,
      `*"Safe. The word means less than it used to. But it means enough."*`,
    ],
  },
  {
    class: 'wraith',
    personalLoss: 'identity',
    trigger: 'safe_rest',
    lines: [
      `*"You don't sleep. You just stop moving for a while. That's been true for longer than you know."*`,
      `*"The quiet gives you space to look at yourself. You're careful not to look too directly."*`,
      `*"Safe. You don't know who you are, but you know what safe feels like. That's something."*`,
    ],
  },
  {
    class: 'wraith',
    personalLoss: 'promise',
    trigger: 'safe_rest',
    lines: [
      `*"You don't sleep. You just stop moving for a while. The promise doesn't need you awake."*`,
      `*"Rest. You allow it strategically."*`,
      `*"The quiet. You and the quiet have an understanding."*`,
    ],
  },

  // -------------------------------------------------------
  // act_transition — the world shifted; you didn't
  // -------------------------------------------------------
  {
    class: 'wraith',
    personalLoss: 'child',
    trigger: 'act_transition',
    lines: [
      `*"The world changed. You were already in the shadow when it did."*`,
      `*"Everything escalated. You operate the same in any temperature."*`,
      `*"The stakes grew. You are already operating beneath the stakes. That doesn't change."*`,
    ],
  },
  {
    class: 'wraith',
    personalLoss: 'partner',
    trigger: 'act_transition',
    lines: [
      `*"The world shifted. You were already still when it happened."*`,
      `*"Escalation. You adjust your definition of necessary."*`,
      `*"Everything changed. The cold in you didn't. Work from the cold."*`,
    ],
  },
  {
    class: 'wraith',
    personalLoss: 'community',
    trigger: 'act_transition',
    lines: [
      `*"Everything changed. You were in the dark. The dark doesn't change."*`,
      `*"New rules. You never followed the old ones anyway."*`,
      `*"The world escalated. You dissolve deeper. Escalation is just more dark to work in."*`,
    ],
  },
  {
    class: 'wraith',
    personalLoss: 'identity',
    trigger: 'act_transition',
    lines: [
      `*"The ground moved. You were barely on it to begin with."*`,
      `*"Everything's different now. You've always operated in everything's-different."*`,
      `*"New landscape. You've never needed to know where you were to know how to disappear into it."*`,
    ],
  },
  {
    class: 'wraith',
    personalLoss: 'promise',
    trigger: 'act_transition',
    lines: [
      `*"The world changed. The promise didn't. That narrows things."*`,
      `*"Escalation. You were already operating at the edge. Move the edge."*`,
      `*"Everything complicated. The promise remains simple. That's the one thread you follow."*`,
    ],
  },

  // -------------------------------------------------------
  // pressure_spike — the texture of wrongness
  // -------------------------------------------------------
  {
    class: 'wraith',
    personalLoss: 'child',
    trigger: 'pressure_spike',
    lines: [
      `*"Something in the dark recognizes you. You're not sure you want to know what."*`,
      `*"The wrongness has weight. You've felt this weight before."*`,
      `*"Something in the dark has patience. You have more."*`,
    ],
  },
  {
    class: 'wraith',
    personalLoss: 'partner',
    trigger: 'pressure_spike',
    lines: [
      `*"Something shifted in the dark. You shifted with it."*`,
      `*"The air has texture now. You read it. Bad texture."*`,
      `*"There's something watching. You know the feeling of being watched. You've been the thing watching."*`,
    ],
  },
  {
    class: 'wraith',
    personalLoss: 'community',
    trigger: 'pressure_spike',
    lines: [
      `*"Something is here that wasn't. You feel it the way you feel a room that's wrong."*`,
      `*"The dark knows you're in it. You're used to that. This feels different."*`,
      `*"The wrongness isn't outside. It's woven in. You've operated in woven-in wrongness before."*`,
    ],
  },
  {
    class: 'wraith',
    personalLoss: 'identity',
    trigger: 'pressure_spike',
    lines: [
      `*"Something in the wrongness is familiar. You are not comforted by that."*`,
      `*"The dark is different here. Something in it is looking back at you. That's yours to work with."*`,
      `*"The threat has weight. You become weightless. That's the move."*`,
    ],
  },
  {
    class: 'wraith',
    personalLoss: 'promise',
    trigger: 'pressure_spike',
    lines: [
      `*"Something is coming. You've always been good at staying ahead of something coming."*`,
      `*"The air changed. You move. The promise waits in the dark with you."*`,
      `*"Something hunting in here. You were here first. That matters."*`,
    ],
  },
]
