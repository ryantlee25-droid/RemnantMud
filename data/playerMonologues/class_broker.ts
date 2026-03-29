// ============================================================
// class_broker.ts — Broker monologue pool
// Convoy: remnant-narrative-0329 | Rider F
//
// Voice: reader of people, manipulator with a conscience.
// The ledger is never balanced. The leverage is always there.
// They're not sure anymore if they're using it for good
// or just using it.
// ============================================================

import type { MonologuePool } from '@/types/convoy-contracts'

export const BROKER_POOLS: MonologuePool[] = [

  // -------------------------------------------------------
  // low_hp — negotiating with your own body
  // -------------------------------------------------------
  {
    class: 'broker',
    personalLoss: 'child',
    trigger: 'low_hp',
    lines: [
      `*"Every negotiation has a bottom line. You're approaching yours."*`,
      `*"You've talked your way out of worse. This one isn't talking."*`,
      `*"The leverage here is: you're still breathing. Use it."*`,
    ],
  },
  {
    class: 'broker',
    personalLoss: 'partner',
    trigger: 'low_hp',
    lines: [
      `*"Every negotiation has a bottom line. You've been past yours before."*`,
      `*"You've bought time with less currency than this. Buy some more."*`,
      `*"The leverage is: survival. You've always been good at extracting value from minimal resources."*`,
    ],
  },
  {
    class: 'broker',
    personalLoss: 'community',
    trigger: 'low_hp',
    lines: [
      `*"Every negotiation has a bottom line. You're negotiating with your own body now. Familiar territory."*`,
      `*"You've stretched resources further than this. Stretch."*`,
      `*"The offer on the table: keep going or don't. You've always been good at knowing which side to take."*`,
    ],
  },
  {
    class: 'broker',
    personalLoss: 'identity',
    trigger: 'low_hp',
    lines: [
      `*"Every negotiation has a bottom line. Yours: figure out who you are first. Keep going for that."*`,
      `*"You don't know what you're worth. You're not finding out today."*`,
      `*"The leverage is: questions still unanswered. That's enough."*`,
    ],
  },
  {
    class: 'broker',
    personalLoss: 'promise',
    trigger: 'low_hp',
    lines: [
      `*"Every negotiation has a bottom line. The promise is the floor. Don't go below it."*`,
      `*"You've negotiated from worse positions. Name your price and pay it."*`,
      `*"The deal isn't closed. You don't die before the deal closes."*`,
    ],
  },

  // -------------------------------------------------------
  // post_combat — reading the room, filing the intelligence
  // -------------------------------------------------------
  {
    class: 'broker',
    personalLoss: 'child',
    trigger: 'post_combat',
    lines: [
      `*"You read the fear in their eyes before the end. You'll use that information. You always do."*`,
      `*"Post-encounter analysis: leverage extracted, threat neutralized. The ledger updated."*`,
      `*"You note what worked. You note what didn't. The next negotiation will be better."*`,
    ],
  },
  {
    class: 'broker',
    personalLoss: 'partner',
    trigger: 'post_combat',
    lines: [
      `*"You read the fear in their eyes before the end. The reading used to feel like something."*`,
      `*"Post-encounter: you survived. You catalogue it. The ledger updates automatically."*`,
      `*"You note what worked. There are things you don't note. You give yourself that."*`,
    ],
  },
  {
    class: 'broker',
    personalLoss: 'community',
    trigger: 'post_combat',
    lines: [
      `*"You read the fear in their eyes before the end. You used that reading. That's the trade."*`,
      `*"Post-encounter analysis: survived, intelligence gathered, position maintained."*`,
      `*"The ledger updated. You've stopped checking whether the balance is good."*`,
    ],
  },
  {
    class: 'broker',
    personalLoss: 'identity',
    trigger: 'post_combat',
    lines: [
      `*"You read the fear in their eyes before the end. The reading is instinctive. So is the use of it."*`,
      `*"Post-encounter: survived. Whatever you were, you were good at surviving. The record is consistent."*`,
      `*"You catalogue the encounter. The leverage extracted. Whoever you are, they were a broker."*`,
    ],
  },
  {
    class: 'broker',
    personalLoss: 'promise',
    trigger: 'post_combat',
    lines: [
      `*"You read the fear in their eyes before the end. Intel filed. Promise still intact."*`,
      `*"Post-encounter: survived, information gathered, position improved. The deal advances."*`,
      `*"You note the leverage. You note the cost. The cost is worth the deal. It has to be."*`,
    ],
  },

  // -------------------------------------------------------
  // in_danger — reading the room before the room reads you
  // -------------------------------------------------------
  {
    class: 'broker',
    personalLoss: 'child',
    trigger: 'in_danger',
    lines: [
      `*"You read the room. The room is hostile. You've worked with hostile rooms before."*`,
      `*"Something's wrong here. You start calculating the cost of being wrong."*`,
      `*"You've walked into bad deals. You can walk out. Find the exit clause."*`,
    ],
  },
  {
    class: 'broker',
    personalLoss: 'partner',
    trigger: 'in_danger',
    lines: [
      `*"You read the room. The tells are there. They always are."*`,
      `*"Something shifted in the dynamic. You feel it the way you feel a negotiation turning."*`,
      `*"This deal just got dangerous. You've closed dangerous deals. Find the leverage."*`,
    ],
  },
  {
    class: 'broker',
    personalLoss: 'community',
    trigger: 'in_danger',
    lines: [
      `*"You read the room. The variables changed. You've navigated worse variables."*`,
      `*"Danger. You assess the power balance. You find where you have the edge. You use it."*`,
      `*"This negotiation just went hostile. You know how to handle hostile negotiations."*`,
    ],
  },
  {
    class: 'broker',
    personalLoss: 'identity',
    trigger: 'in_danger',
    lines: [
      `*"You read the room. The instinct is native. You were born reading rooms."*`,
      `*"Something's wrong. Your body catalogued it. Your mind is catching up."*`,
      `*"The situation shifted. You find the leverage. Whoever you are, that's your language."*`,
    ],
  },
  {
    class: 'broker',
    personalLoss: 'promise',
    trigger: 'in_danger',
    lines: [
      `*"You read the room. Factor in the promise. Negotiate a path through this."*`,
      `*"Danger. You calculate the cost of engaging versus the cost of rerouting."*`,
      `*"This is a bad deal. You've rejected bad deals. Find the alternative."*`,
    ],
  },

  // -------------------------------------------------------
  // examining_loss_item — the ledger's most painful entry
  // -------------------------------------------------------
  {
    class: 'broker',
    personalLoss: 'child',
    trigger: 'examining_loss_item',
    lines: [
      `*"Leverage. Everything is leverage if you know how to hold it."*`,
      `*"You hold it and remember exactly what it cost. The ledger has this entry, but not a balance."*`,
      `*"You've traded in everything. You didn't know you were trading until you'd already traded."*`,
    ],
  },
  {
    class: 'broker',
    personalLoss: 'partner',
    trigger: 'examining_loss_item',
    lines: [
      `*"Leverage. Everything is leverage if you know how to hold it. Except this. Not this."*`,
      `*"You hold it and the ledger is very loud and you stop calculating for a moment."*`,
      `*"The deal you didn't make. The price you didn't pay. You've thought about that trade for a long time."*`,
    ],
  },
  {
    class: 'broker',
    personalLoss: 'community',
    trigger: 'examining_loss_item',
    lines: [
      `*"You know the cost of everything. You've spent years knowing the cost of everything."*`,
      `*"Leverage. Everything is leverage. You've spent a long time trying to believe that applies here too."*`,
      `*"You hold it and you do the math. The math never comes out even. Not on this one."*`,
    ],
  },
  {
    class: 'broker',
    personalLoss: 'identity',
    trigger: 'examining_loss_item',
    lines: [
      `*"Leverage. Everything is leverage if you know how to hold it. This one holds something back."*`,
      `*"You read it the way you read contracts. Looking for the clause that explains everything."*`,
      `*"Something in here has your signature. You recognize the signature even if you don't know the name."*`,
    ],
  },
  {
    class: 'broker',
    personalLoss: 'promise',
    trigger: 'examining_loss_item',
    lines: [
      `*"Leverage. This is leverage. You've known that from the beginning."*`,
      `*"You hold it and you remember exactly what you said and to whom. The terms are clear."*`,
      `*"The contract. The terms. The deadline. You've brokered worse deals under worse pressure."*`,
    ],
  },

  // -------------------------------------------------------
  // safe_rest — balancing the ledger before sleep
  // -------------------------------------------------------
  {
    class: 'broker',
    personalLoss: 'child',
    trigger: 'safe_rest',
    lines: [
      `*"You think about who you owe and who owes you. The ledger is never balanced."*`,
      `*"You rest. You keep one part of your mind on the current accounts. Force of habit."*`,
      `*"Safe. You inventory the debts. You inventory the assets. You sleep anyway."*`,
    ],
  },
  {
    class: 'broker',
    personalLoss: 'partner',
    trigger: 'safe_rest',
    lines: [
      `*"You think about who you owe and who owes you. There's one entry you can't settle."*`,
      `*"The ledger is never balanced. You used to be okay with that."*`,
      `*"You rest. The accounts can wait. Not all of them. But enough of them."*`,
    ],
  },
  {
    class: 'broker',
    personalLoss: 'community',
    trigger: 'safe_rest',
    lines: [
      `*"You think about who you owe and who owes you. The community entries are the longest column."*`,
      `*"Safe. You let yourself believe it. You run the accounts while you do."*`,
      `*"The ledger is never balanced. You've made peace with that. Mostly."*`,
    ],
  },
  {
    class: 'broker',
    personalLoss: 'identity',
    trigger: 'safe_rest',
    lines: [
      `*"You think about who you owe and who owes you. Some of the accounts have no names yet."*`,
      `*"The ledger is never balanced. That's been true longer than you know."*`,
      `*"You rest. The accounts can wait. You still don't know all of them."*`,
    ],
  },
  {
    class: 'broker',
    personalLoss: 'promise',
    trigger: 'safe_rest',
    lines: [
      `*"You think about who you owe and who owes you. The promise is the clearest entry."*`,
      `*"The ledger is never balanced. The promise keeps the balance from tipping completely wrong."*`,
      `*"You rest. You keep the accounts. The largest one is still outstanding."*`,
    ],
  },

  // -------------------------------------------------------
  // act_transition — the deal changed, the broker didn't
  // -------------------------------------------------------
  {
    class: 'broker',
    personalLoss: 'child',
    trigger: 'act_transition',
    lines: [
      `*"The deal changed. You renegotiate. That's what you do."*`,
      `*"New terms. You read the new terms. You find the leverage in the new terms."*`,
    ],
  },
  {
    class: 'broker',
    personalLoss: 'partner',
    trigger: 'act_transition',
    lines: [
      `*"The terms changed. You adapt. The ledger updates."*`,
      `*"New negotiating environment. Same broker. You've adapted before."*`,
    ],
  },
  {
    class: 'broker',
    personalLoss: 'community',
    trigger: 'act_transition',
    lines: [
      `*"The market changed. You adjust the portfolio. The deal continues."*`,
      `*"New parameters. New leverage points. You find them. You use them."*`,
    ],
  },
  {
    class: 'broker',
    personalLoss: 'identity',
    trigger: 'act_transition',
    lines: [
      `*"Everything changed. You read the new room. Whoever you are, this is what you do."*`,
      `*"New deal on the table. The terms are harder. You're harder too. Negotiate."*`,
    ],
  },
  {
    class: 'broker',
    personalLoss: 'promise',
    trigger: 'act_transition',
    lines: [
      `*"The terms changed. The promise didn't. The promise is the floor of every negotiation now."*`,
      `*"New environment, new leverage, same deal. Get it done."*`,
    ],
  },

  // -------------------------------------------------------
  // pressure_spike — reading threat as leverage dynamics
  // -------------------------------------------------------
  {
    class: 'broker',
    personalLoss: 'child',
    trigger: 'pressure_spike',
    lines: [
      `*"The power balance shifted. You read it before it announced itself."*`,
      `*"Something changed in the dynamic. Find the new leverage point."*`,
    ],
  },
  {
    class: 'broker',
    personalLoss: 'partner',
    trigger: 'pressure_spike',
    lines: [
      `*"Something's moving in the background. You've always been good at background movements."*`,
      `*"The deal is becoming dangerous. You've closed dangerous deals. Read it carefully."*`,
    ],
  },
  {
    class: 'broker',
    personalLoss: 'community',
    trigger: 'pressure_spike',
    lines: [
      `*"The room changed. You read the room. Something here is about to make a move."*`,
      `*"The intelligence is bad here. You read bad intelligence. Adjust accordingly."*`,
    ],
  },
  {
    class: 'broker',
    personalLoss: 'identity',
    trigger: 'pressure_spike',
    lines: [
      `*"Something shifted. You read the tell before you understood what it was."*`,
      `*"The room got dangerous. You've been in dangerous rooms. Read it. Navigate."*`,
    ],
  },
  {
    class: 'broker',
    personalLoss: 'promise',
    trigger: 'pressure_spike',
    lines: [
      `*"Elevated threat. New variables in the deal. The promise is still the floor."*`,
      `*"The environment got hostile. You read hostile environments. Move carefully."*`,
    ],
  },
]
