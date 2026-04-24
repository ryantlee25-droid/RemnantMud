// ============================================================
// class_enforcer.ts — Enforcer monologue pool
// Convoy: remnant-narrative-0329 | Rider F
//
// Voice: tactical, compressed, sees everything as a problem
// to solve. Counts rounds, measures distances, plans exits.
// Emotion is information. Pain is information. Use it.
// ============================================================

import type { MonologuePool } from '@/types/convoy-contracts'

export const ENFORCER_POOLS: MonologuePool[] = [

  // -------------------------------------------------------
  // low_hp — pain as data, tactical recalibration
  // -------------------------------------------------------
  {
    class: 'enforcer',
    personalLoss: 'child',
    trigger: 'low_hp',
    lines: [
      `*"Pain is information. It says: you're still alive. Act accordingly."*`,
      `*"You've taken worse. Think about when you took worse. Get up."*`,
      `*"Not here. You don't get to stop here."*`,
    ],
  },
  {
    class: 'enforcer',
    personalLoss: 'partner',
    trigger: 'low_hp',
    lines: [
      `*"Pain is information. It says: you're still alive. Act accordingly."*`,
      `*"You've taken worse. Think about when. Get up."*`,
      `*"Not here. You don't stop here."*`,
    ],
  },
  {
    class: 'enforcer',
    personalLoss: 'community',
    trigger: 'low_hp',
    lines: [
      `*"Pain is information. It says: you're still alive. Act accordingly."*`,
      `*"They survived worse than this. So can you. Move."*`,
      `*"Not here. This isn't where it ends."*`,
    ],
  },
  {
    class: 'enforcer',
    personalLoss: 'identity',
    trigger: 'low_hp',
    lines: [
      `*"Pain is information. It says: you're still alive. Whatever that means."*`,
      `*"You don't know who you are. But you know how to survive. Do that."*`,
      `*"Not here. You figure out the rest after."*`,
    ],
  },
  {
    class: 'enforcer',
    personalLoss: 'promise',
    trigger: 'low_hp',
    lines: [
      `*"Pain is information. It says: you're still alive. The promise isn't kept yet."*`,
      `*"Not here. The debt isn't paid."*`,
      `*"Get up. You don't owe the ground anything."*`,
    ],
  },

  // -------------------------------------------------------
  // post_combat — counting rounds, tactical AAR
  // -------------------------------------------------------
  {
    class: 'enforcer',
    personalLoss: 'child',
    trigger: 'post_combat',
    lines: [
      `*"You count the rounds you used. Too many. You're getting sloppy."*`,
      `*"Threat neutralized. You replay it anyway. Third strike was inefficient."*`,
      `*"Clean enough. Next one will be cleaner."*`,
    ],
  },
  {
    class: 'enforcer',
    personalLoss: 'partner',
    trigger: 'post_combat',
    lines: [
      `*"You count the rounds you used. Too many. You're getting sloppy."*`,
      `*"You replay it in your head. You hesitated at second four. You know why."*`,
      `*"Threat neutralized. The shaking is adrenaline. Give it a minute."*`,
    ],
  },
  {
    class: 'enforcer',
    personalLoss: 'community',
    trigger: 'post_combat',
    lines: [
      `*"You count the rounds you used. Too many."*`,
      `*"Threat neutralized. A waste of ammo. A waste of everything."*`,
      `*"You replay the opening. Two seconds faster and it's clean. Work on that."*`,
    ],
  },
  {
    class: 'enforcer',
    personalLoss: 'identity',
    trigger: 'post_combat',
    lines: [
      `*"You count the rounds you used. The counting is automatic. Some things survive."*`,
      `*"Threat neutralized. Whatever you are, you're still good at this."*`,
      `*"You replay the fight. Whoever trained you knew what they were doing."*`,
    ],
  },
  {
    class: 'enforcer',
    personalLoss: 'promise',
    trigger: 'post_combat',
    lines: [
      `*"You count the rounds you used. The debt isn't paid yet. This wasn't the payment. Keep moving."*`,
      `*"Threat neutralized. One more obstacle, one less obstacle."*`,
      `*"You replay it. You survived. That's the only metric that matters right now."*`,
    ],
  },

  // -------------------------------------------------------
  // in_danger — threat assessment, exits, angles
  // -------------------------------------------------------
  {
    class: 'enforcer',
    personalLoss: 'child',
    trigger: 'in_danger',
    lines: [
      `*"You count exits before you count threats. Always exits first."*`,
      `*"Something's wrong. You catalog the angles before you figure out what."*`,
      `*"Your hand finds the weapon before your brain sends the order. Good."*`,
    ],
  },
  {
    class: 'enforcer',
    personalLoss: 'partner',
    trigger: 'in_danger',
    lines: [
      `*"You count exits. Two. You note them both. You'll need one of them."*`,
      `*"Threat in sector. You've already mapped three approaches. Pick one."*`,
      `*"Your hand finds the weapon before your brain sends the order."*`,
    ],
  },
  {
    class: 'enforcer',
    personalLoss: 'community',
    trigger: 'in_danger',
    lines: [
      `*"You count exits before you count threats. The math never changes."*`,
      `*"Something's wrong. Everything else waits."*`,
      `*"Your body knows this. Let it lead."*`,
    ],
  },
  {
    class: 'enforcer',
    personalLoss: 'identity',
    trigger: 'in_danger',
    lines: [
      `*"You count exits. The instinct is old. Older than you can remember."*`,
      `*"Threat in sector. You respond before you decide to. Good."*`,
      `*"Your hand finds the weapon. You don't remember learning this. It's still there."*`,
    ],
  },
  {
    class: 'enforcer',
    personalLoss: 'promise',
    trigger: 'in_danger',
    lines: [
      `*"You count exits. You count threats. You calculate whether you can afford this."*`,
      `*"Not yet. Not here. Not until the promise is kept."*`,
      `*"Your hand finds the weapon. Let's be efficient about this."*`,
    ],
  },

  // -------------------------------------------------------
  // examining_loss_item — tactical mask cracking
  // -------------------------------------------------------
  {
    class: 'enforcer',
    personalLoss: 'child',
    trigger: 'examining_loss_item',
    lines: [
      `*"You put it down. You pick it back up. Tactical assessment: you can't afford this right now."*`,
      `*"You were supposed to protect them. You know exactly where the failure point was."*`,
      `*"Intel. File it. Keep moving."*`,
    ],
  },
  {
    class: 'enforcer',
    personalLoss: 'partner',
    trigger: 'examining_loss_item',
    lines: [
      `*"You put it down. You pick it back up. The second time, your hands are steadier."*`,
      `*"You protected everything except the thing that mattered. You've run the numbers on that."*`,
      `*"File it. Keep moving. That's the only protocol that works now."*`,
    ],
  },
  {
    class: 'enforcer',
    personalLoss: 'community',
    trigger: 'examining_loss_item',
    lines: [
      `*"You catalog it. Categorize it. The tactical approach to grief is the only one you know."*`,
      `*"You didn't stop it. You've analyzed every decision. You still come up short."*`,
      `*"Intel. File it. Move."*`,
    ],
  },
  {
    class: 'enforcer',
    personalLoss: 'identity',
    trigger: 'examining_loss_item',
    lines: [
      `*"You turn it over. It means something. You're not sure what. That's the problem."*`,
      `*"Something in your hands knows this object. Your brain doesn't catch up."*`,
      `*"Intel. Or maybe not. Keep it. Figure it out later."*`,
    ],
  },
  {
    class: 'enforcer',
    personalLoss: 'promise',
    trigger: 'examining_loss_item',
    lines: [
      `*"You hold it and remember what it cost. You remember why you're here."*`,
      `*"The mission hasn't changed. This is just a reminder of the mission."*`,
      `*"File it. You know exactly what this means and what it requires of you."*`,
    ],
  },

  // -------------------------------------------------------
  // safe_rest — vigilance even in stillness
  // -------------------------------------------------------
  {
    class: 'enforcer',
    personalLoss: 'child',
    trigger: 'safe_rest',
    lines: [
      `*"You check the perimeter. Then you check it again. Then you sleep with one eye open."*`,
      `*"Safe is a word other people use. You sit with your back to the wall."*`,
      `*"You can sleep when this is over. This isn't over."*`,
    ],
  },
  {
    class: 'enforcer',
    personalLoss: 'partner',
    trigger: 'safe_rest',
    lines: [
      `*"You check the perimeter. Then you check it again. Old habit. Keep the old habits."*`,
      `*"You face the door. You always face the door now."*`,
      `*"You stay on your side of the floor. You don't think about why."*`,
    ],
  },
  {
    class: 'enforcer',
    personalLoss: 'community',
    trigger: 'safe_rest',
    lines: [
      `*"You check the perimeter. No one standing watch. You stand watch anyway."*`,
      `*"There's no one to protect in here. You maintain the posture regardless."*`,
      `*"Safe enough. You set two-hour shifts for yourself and wake up on schedule."*`,
    ],
  },
  {
    class: 'enforcer',
    personalLoss: 'identity',
    trigger: 'safe_rest',
    lines: [
      `*"You check the perimeter. The routine predates whatever you've forgotten."*`,
      `*"You don't know your name. You know how to sleep without getting killed. One thing at a time."*`,
      `*"Safe enough. You take what the moment offers."*`,
    ],
  },
  {
    class: 'enforcer',
    personalLoss: 'promise',
    trigger: 'safe_rest',
    lines: [
      `*"You check the perimeter. The promise doesn't rest. But you need to."*`,
      `*"Brief halt. Tactical pause. The mission resumes in three hours."*`,
      `*"You sleep with one eye open. It's not heroics. It's habit. It's the only way now."*`,
    ],
  },

  // -------------------------------------------------------
  // act_transition — recalibration at new phase
  // -------------------------------------------------------
  {
    class: 'enforcer',
    personalLoss: 'child',
    trigger: 'act_transition',
    lines: [
      `*"The situation has escalated. You adjust. That's all adjustment is."*`,
      `*"New threat parameters. Same operator. You've worked with worse odds."*`,
      `*"New parameters. You count the exits again. The number changed. Recalculate."*`,
    ],
  },
  {
    class: 'enforcer',
    personalLoss: 'partner',
    trigger: 'act_transition',
    lines: [
      `*"The situation has changed. You adapt. That's what you do."*`,
      `*"New parameters. You run the math. It's not good math. You've had worse."*`,
      `*"The situation escalated. You would have told them to stay low. You're telling yourself now. Stay low."*`,
    ],
  },
  {
    class: 'enforcer',
    personalLoss: 'community',
    trigger: 'act_transition',
    lines: [
      `*"The ground shifted. You adjust your footing. That's all you can do."*`,
      `*"New threat level. Same approach: assess, adapt, advance."*`,
      `*"New parameters. No one's standing watch behind you. You widen your perimeter. You cover the gap."*`,
    ],
  },
  {
    class: 'enforcer',
    personalLoss: 'identity',
    trigger: 'act_transition',
    lines: [
      `*"Everything changed. You adapt. Whoever you are, that's what you do."*`,
      `*"New parameters. The mission continues regardless of who's running it."*`,
      `*"The situation escalated. The counting is automatic. The exits are automatic. Some things don't need a name."*`,
    ],
  },
  {
    class: 'enforcer',
    personalLoss: 'promise',
    trigger: 'act_transition',
    lines: [
      `*"The situation escalated. The promise doesn't care. Neither do you."*`,
      `*"New threat environment. The objective remains unchanged."*`,
      `*"New parameters. The debt isn't paid yet. Factor that in. Keep the math current."*`,
    ],
  },

  // -------------------------------------------------------
  // pressure_spike — tactical awareness of mounting dread
  // -------------------------------------------------------
  {
    class: 'enforcer',
    personalLoss: 'child',
    trigger: 'pressure_spike',
    lines: [
      `*"Something in the air. Your body logged it before you did."*`,
      `*"Threat density increasing. You can feel it in the pattern."*`,
      `*"Your count is off. Someone changed the room while you weren't watching. Recount. Move."*`,
    ],
  },
  {
    class: 'enforcer',
    personalLoss: 'partner',
    trigger: 'pressure_spike',
    lines: [
      `*"The hair on your arms. The quality of sound. Something's coming."*`,
      `*"Intel. Something shifted. Trust the body. Assess."*`,
      `*"You hesitated. There it is. Don't hesitate again — the room is telling you something."*`,
    ],
  },
  {
    class: 'enforcer',
    personalLoss: 'community',
    trigger: 'pressure_spike',
    lines: [
      `*"You've been in enough situations to know when one is developing."*`,
      `*"Threat density. The air has weight. Move efficiently."*`,
      `*"No one standing watch. You are the watch. Sector check. Now."*`,
    ],
  },
  {
    class: 'enforcer',
    personalLoss: 'identity',
    trigger: 'pressure_spike',
    lines: [
      `*"Your body knows danger. Whatever you've forgotten, it remembers this."*`,
      `*"Something's building. You can feel it. Act on it."*`,
      `*"The counting stopped. That means something changed. Find what changed."*`,
    ],
  },
  {
    class: 'enforcer',
    personalLoss: 'promise',
    trigger: 'pressure_spike',
    lines: [
      `*"It's getting worse. You factor that in and keep going."*`,
      `*"The situation is deteriorating. The mission timeline may need to accelerate."*`,
      `*"Threat density spiked. The debt doesn't get paid if you ignore this. Deal with it."*`,
    ],
  },
]
