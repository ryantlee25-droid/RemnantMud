// ============================================================
// class_warden.ts — Warden monologue pool
// Convoy: remnant-narrative-0329 | Rider F
//
// Voice: protector who's lost what they protected.
// They held the line. They always hold the line.
// The thing behind them is gone. They hold the line anyway.
// Conviction is the only thing left. They are very, very good
// at having conviction.
// ============================================================

import type { MonologuePool } from '@/types/convoy-contracts'

export const WARDEN_POOLS: MonologuePool[] = [

  // -------------------------------------------------------
  // low_hp — still standing, still holding
  // -------------------------------------------------------
  {
    class: 'warden',
    personalLoss: 'child',
    trigger: 'low_hp',
    lines: [
      `*"You can't protect anyone if you're dead. That's not wisdom. That's math."*`,
      `*"You've taken hits for people who weren't worth it. You can take this."*`,
      `*"Stand. You've stood on worse ground."*`,
    ],
  },
  {
    class: 'warden',
    personalLoss: 'partner',
    trigger: 'low_hp',
    lines: [
      `*"You can't protect anyone if you're dead. That's not wisdom. That's math."*`,
      `*"You didn't protect them. You can protect yourself. Start there."*`,
      `*"Stand. You know how to stand. It's the one thing you've never forgotten."*`,
    ],
  },
  {
    class: 'warden',
    personalLoss: 'community',
    trigger: 'low_hp',
    lines: [
      `*"You can't protect anyone if you're dead. There are still people worth protecting. Math."*`,
      `*"You held the line for them. Hold it for yourself now."*`,
      `*"Stand. There's still a line to hold."*`,
    ],
  },
  {
    class: 'warden',
    personalLoss: 'identity',
    trigger: 'low_hp',
    lines: [
      `*"You can't protect anyone if you're dead. You don't know who you're protecting. Still math."*`,
      `*"You don't know who you are, but you know how to stand. Stand."*`,
      `*"Whatever you were, you were built to take hits. Take this one. Keep going."*`,
    ],
  },
  {
    class: 'warden',
    personalLoss: 'promise',
    trigger: 'low_hp',
    lines: [
      `*"You can't keep a promise if you're dead. That's not wisdom. That's math."*`,
      `*"Stand. The line isn't held by someone who's sitting down."*`,
      `*"You've taken worse for less important reasons. You can take this."*`,
    ],
  },

  // -------------------------------------------------------
  // post_combat — the line held; nothing behind it
  // -------------------------------------------------------
  {
    class: 'warden',
    personalLoss: 'child',
    trigger: 'post_combat',
    lines: [
      `*"You held the line. There's no one behind you to protect, but you held it anyway."*`,
      `*"It's done. You assess the field. You check for wounded. Old habit, no one to find."*`,
      `*"Another line held. The lines are getting longer. You are the only one walking them."*`,
    ],
  },
  {
    class: 'warden',
    personalLoss: 'partner',
    trigger: 'post_combat',
    lines: [
      `*"You held the line. There's no one behind you anymore. The line matters anyway."*`,
      `*"You check for wounded. You are the wounded. You note the irony without finding it funny."*`,
      `*"Another line held. The reason you hold it is still there. It's just different now."*`,
    ],
  },
  {
    class: 'warden',
    personalLoss: 'community',
    trigger: 'post_combat',
    lines: [
      `*"You held the line. That's what you do. That's what you've always done."*`,
      `*"The line protected no one this time. The holding was still right. You're certain of that."*`,
      `*"Another line held. Somewhere, it matters. You have to believe that."*`,
    ],
  },
  {
    class: 'warden',
    personalLoss: 'identity',
    trigger: 'post_combat',
    lines: [
      `*"You held the line. The instinct is deep. Whoever you are, you're a defender."*`,
      `*"You check for wounded. Nothing to find. The checking is what you are."*`,
      `*"The line held. Whatever you've lost, you haven't lost this."*`,
    ],
  },
  {
    class: 'warden',
    personalLoss: 'promise',
    trigger: 'post_combat',
    lines: [
      `*"You held the line. The promise is still on the other side of it. Keep going."*`,
      `*"Another threat neutralized. Another obstacle between you and what matters."*`,
      `*"The line held. You are the line now. That's enough."*`,
    ],
  },

  // -------------------------------------------------------
  // in_danger — the defender's posture never sleeps
  // -------------------------------------------------------
  {
    class: 'warden',
    personalLoss: 'child',
    trigger: 'in_danger',
    lines: [
      `*"Something's wrong. You step forward. That's what you do when something's wrong."*`,
      `*"Threat detected. You stand between it and — you stand between it."*`,
      `*"Your body has already taken the defensive posture. You let it."*`,
    ],
  },
  {
    class: 'warden',
    personalLoss: 'partner',
    trigger: 'in_danger',
    lines: [
      `*"Something's wrong. You step forward. The habit runs deeper than the reason."*`,
      `*"Threat. You put yourself between it and the space where someone used to be."*`,
      `*"Your body moves to shield. Some things don't change when you stop having reasons."*`,
    ],
  },
  {
    class: 'warden',
    personalLoss: 'community',
    trigger: 'in_danger',
    lines: [
      `*"Something's wrong. You step forward. The posture doesn't need people behind it to function."*`,
      `*"Threat. You assess the approach. You choose the angle that protects the most space."*`,
      `*"Old instinct: hold the breach. You hold the breach."*`,
    ],
  },
  {
    class: 'warden',
    personalLoss: 'identity',
    trigger: 'in_danger',
    lines: [
      `*"Threat. You step forward. You were built for this. Whatever else you are, you were built for this."*`,
      `*"Something's wrong. Your body already knows the response. You let it lead."*`,
      `*"Defender. That's what every instinct says. You follow the instincts."*`,
    ],
  },
  {
    class: 'warden',
    personalLoss: 'promise',
    trigger: 'in_danger',
    lines: [
      `*"Threat. Wardens don't retreat from threats. They don't retreat from promises either."*`,
      `*"Something's wrong. You step between it and forward. Forward is the only direction that matters."*`,
      `*"You don't need a reason to hold a line. You are the reason."*`,
    ],
  },

  // -------------------------------------------------------
  // examining_loss_item — the guardian's wound
  // -------------------------------------------------------
  {
    class: 'warden',
    personalLoss: 'child',
    trigger: 'examining_loss_item',
    lines: [
      `*"Someone tried to keep this safe. They failed. You understand that."*`,
      `*"You hold it. The weight is exact. You know the weight of what you couldn't protect."*`,
      `*"A guardian who loses what they guard. You've been running from that word for a while."*`,
    ],
  },
  {
    class: 'warden',
    personalLoss: 'partner',
    trigger: 'examining_loss_item',
    lines: [
      `*"Someone tried to keep this safe. You know what trying looks like. You know what failing looks like."*`,
      `*"You hold it. You were supposed to protect them. You have a very specific, terrible understanding of what happened."*`,
      `*"A guardian's failure isn't the threat. It's that the line was there. And you were on the wrong side."*`,
    ],
  },
  {
    class: 'warden',
    personalLoss: 'community',
    trigger: 'examining_loss_item',
    lines: [
      `*"Someone tried to keep this safe. The trying is familiar. So is the failing."*`,
      `*"You hold it. A community's guardian. You know exactly what that means and what it cost."*`,
      `*"Someone tried to protect this. Maybe they did, for a while. That counts for something."*`,
    ],
  },
  {
    class: 'warden',
    personalLoss: 'identity',
    trigger: 'examining_loss_item',
    lines: [
      `*"Someone tried to keep this safe. Your hands know this object. Your mind doesn't follow."*`,
      `*"You hold it. Whatever you've lost, this was part of it. The guardian in you recognizes it."*`,
      `*"Something worth protecting. Something you were protecting. That much is clear."*`,
    ],
  },
  {
    class: 'warden',
    personalLoss: 'promise',
    trigger: 'examining_loss_item',
    lines: [
      `*"Someone tried to keep this safe. You're still keeping yours. The comparison is not lost on you."*`,
      `*"You hold it. You remember taking the oath. Wardens don't take oaths lightly."*`,
      `*"A promise made to protect. The promise is still the compass. You still follow it."*`,
    ],
  },

  // -------------------------------------------------------
  // safe_rest — facing the door, guarding nothing
  // -------------------------------------------------------
  {
    class: 'warden',
    personalLoss: 'child',
    trigger: 'safe_rest',
    lines: [
      `*"You face the door while you rest. Old habit. The thing you're guarding is yourself now."*`,
      `*"You rest with your back to the wall. You've been doing this since before you had to."*`,
      `*"Safe. You don't fully believe it. You rest anyway, one eye on the entrance."*`,
    ],
  },
  {
    class: 'warden',
    personalLoss: 'partner',
    trigger: 'safe_rest',
    lines: [
      `*"You face the door while you rest. You used to face someone. You face the door now."*`,
      `*"You rest on the perimeter of the room. You've always slept near the edge."*`,
      `*"Safe. For now. You let yourself believe it for three hours."*`,
    ],
  },
  {
    class: 'warden',
    personalLoss: 'community',
    trigger: 'safe_rest',
    lines: [
      `*"You face the door while you rest. The community used to sleep behind you. You guard the absence."*`,
      `*"You rest the way you always rested: half-awake, half-ready. Some habits don't adapt."*`,
      `*"Safe. You mark it, note it, take the rest you need, and remember it might change."*`,
    ],
  },
  {
    class: 'warden',
    personalLoss: 'identity',
    trigger: 'safe_rest',
    lines: [
      `*"You face the door. The instinct predates whatever you've lost."*`,
      `*"You guard your own sleep. Whatever you are, that much is constant."*`,
      `*"Safe. You rest. You face the door. You don't know why. You trust the why."*`,
    ],
  },
  {
    class: 'warden',
    personalLoss: 'promise',
    trigger: 'safe_rest',
    lines: [
      `*"You face the door while you rest. The promise is behind you. You guard it in your sleep."*`,
      `*"Rest is necessary. You take it strategically. The door is covered."*`,
      `*"Safe. You let yourself believe that. You maintain the perimeter regardless."*`,
    ],
  },

  // -------------------------------------------------------
  // act_transition — a wider line to hold
  // -------------------------------------------------------
  {
    class: 'warden',
    personalLoss: 'child',
    trigger: 'act_transition',
    lines: [
      `*"The line got longer. You extend your reach. This is what you do."*`,
      `*"Everything escalated. You widen your stance. You hold more ground."*`,
      `*"The line you couldn't hold then — you hold every other line twice as hard because of it."*`,
    ],
  },
  {
    class: 'warden',
    personalLoss: 'partner',
    trigger: 'act_transition',
    lines: [
      `*"The line moved. You move with it. There's always a line to hold."*`,
      `*"Everything changed. You adapt the perimeter. The conviction doesn't adapt."*`,
      `*"The line got longer. You used to hold one side; they held the other. You hold both now."*`,
    ],
  },
  {
    class: 'warden',
    personalLoss: 'community',
    trigger: 'act_transition',
    lines: [
      `*"The threat level changed. You raise your shield. That's the entire response."*`,
      `*"The line expanded. You expand with it. That's what wardens do when the threat grows."*`,
      `*"More to hold. The community used to hold it with you. The line is yours now. You hold it."*`,
    ],
  },
  {
    class: 'warden',
    personalLoss: 'identity',
    trigger: 'act_transition',
    lines: [
      `*"The world shifted. You widen your stance. Whoever you are, that's the right move."*`,
      `*"Everything changed. You hold the line. That's the only constant you have."*`,
      `*"The perimeter expanded. You don't know what you're protecting. The body knows to step forward anyway."*`,
    ],
  },
  {
    class: 'warden',
    personalLoss: 'promise',
    trigger: 'act_transition',
    lines: [
      `*"The threat grew. So does your resolve. This is how wardens work."*`,
      `*"The line expanded. You expand with it. The oath is still behind you."*`,
      `*"Wardens don't retreat from threats. They don't retreat from oaths either. The line holds."*`,
    ],
  },

  // -------------------------------------------------------
  // pressure_spike — threat assessment, no retreat
  // -------------------------------------------------------
  {
    class: 'warden',
    personalLoss: 'child',
    trigger: 'pressure_spike',
    lines: [
      `*"Something is coming. You face it. That's the job."*`,
      `*"The danger increased. You don't take a step back. You don't do that."*`,
      `*"Threat increased. You set your feet. The line you failed to hold once — you don't fail it twice."*`,
    ],
  },
  {
    class: 'warden',
    personalLoss: 'partner',
    trigger: 'pressure_spike',
    lines: [
      `*"Something is building here. You recognize it. You hold your ground."*`,
      `*"Pressure increasing. You've stood in pressure before. This is just pressure."*`,
      `*"The threat increased. You set your feet. You used to hold this line for two. You hold it anyway."*`,
    ],
  },
  {
    class: 'warden',
    personalLoss: 'community',
    trigger: 'pressure_spike',
    lines: [
      `*"The threat is rising. You set your feet. You've set your feet in worse."*`,
      `*"Something is wrong here. You widen your stance and meet it."*`,
      `*"The threat increased. You set your feet. The math of protecting versus not-protecting has always been clear to you."*`,
    ],
  },
  {
    class: 'warden',
    personalLoss: 'identity',
    trigger: 'pressure_spike',
    lines: [
      `*"Danger. You step forward. That's what you do. Whatever else you've forgotten, you haven't forgotten that."*`,
      `*"Something coming. You face it. The posture is older than your memory."*`,
      `*"The threat increased. You widen your stance. You don't know the name of the thing behind you. You guard it anyway."*`,
    ],
  },
  {
    class: 'warden',
    personalLoss: 'promise',
    trigger: 'pressure_spike',
    lines: [
      `*"Elevated threat. You hold the line between it and the oath. That's the position."*`,
      `*"The threat increased. You set your feet. That's the whole preparation."*`,
      `*"Wardens don't retreat from threats. Wardens don't retreat from promises. Same stance."*`,
    ],
  },
]
