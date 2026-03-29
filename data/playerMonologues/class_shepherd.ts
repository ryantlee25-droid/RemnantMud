// ============================================================
// class_shepherd.ts — Shepherd monologue pool
// Convoy: remnant-narrative-0329 | Rider F
//
// Voice: healer's guilt, hands that know too much.
// They keep people alive — and live with the ones they couldn't.
// Always asking: can I help? Always knowing the answer costs something.
// ============================================================

import type { MonologuePool } from '@/types/convoy-contracts'

export const SHEPHERD_POOLS: MonologuePool[] = [

  // -------------------------------------------------------
  // low_hp — the healer who can't heal themselves
  // -------------------------------------------------------
  {
    class: 'shepherd',
    personalLoss: 'child',
    trigger: 'low_hp',
    lines: [
      `*"You could treat this. If it were anyone else, you'd know exactly what to do."*`,
      `*"You've kept people alive with less. Apply that knowledge to yourself. Now."*`,
      `*"Physician, heal thyself. That's the part they left out of the training."*`,
    ],
  },
  {
    class: 'shepherd',
    personalLoss: 'partner',
    trigger: 'low_hp',
    lines: [
      `*"You could treat this. If it were anyone else, you'd have handled it by now."*`,
      `*"You've done more with less on patients who had less reason to live. This is not the end."*`,
      `*"Your hands know what to do. Let them."*`,
    ],
  },
  {
    class: 'shepherd',
    personalLoss: 'community',
    trigger: 'low_hp',
    lines: [
      `*"You could treat this. If it were anyone else. They would have said the same."*`,
      `*"You've kept whole rooms of people alive. You can keep one."*`,
      `*"The training kicks in when your mind won't. Trust the training."*`,
    ],
  },
  {
    class: 'shepherd',
    personalLoss: 'identity',
    trigger: 'low_hp',
    lines: [
      `*"You could treat this. Your hands remember how even if you don't."*`,
      `*"You don't know who you are, but your hands know what to do with a wound. Let them lead."*`,
      `*"Your body has this. Follow it."*`,
    ],
  },
  {
    class: 'shepherd',
    personalLoss: 'promise',
    trigger: 'low_hp',
    lines: [
      `*"You could treat this. You need to treat this. The promise still needs keeping."*`,
      `*"You've kept people alive under worse conditions. Stay clinical. Work the problem."*`,
      `*"Not yet. The work isn't done."*`,
    ],
  },

  // -------------------------------------------------------
  // post_combat — hands that check for a pulse before the brain
  // -------------------------------------------------------
  {
    class: 'shepherd',
    personalLoss: 'child',
    trigger: 'post_combat',
    lines: [
      `*"Your hands check for a pulse before your brain tells them not to bother."*`,
      `*"You treat the wounds you can reach. You've gotten good at not thinking about the ones you can't."*`,
      `*"You survive. You catalog the damage. You move on. It's not complicated. It's just all you have."*`,
    ],
  },
  {
    class: 'shepherd',
    personalLoss: 'partner',
    trigger: 'post_combat',
    lines: [
      `*"Your hands check for a pulse before your brain stops them."*`,
      `*"You dress the wound with the same hands that — you're very good at this. It shouldn't feel wrong."*`,
      `*"You survived. The relief feels different than it used to."*`,
    ],
  },
  {
    class: 'shepherd',
    personalLoss: 'community',
    trigger: 'post_combat',
    lines: [
      `*"Your hands check for a pulse. They were trained to check. They don't forget the training."*`,
      `*"You treat yourself the way you treated them. Efficiently. Clinically. Without comment."*`,
      `*"You survived. You know you'll survive the next one too. That used to feel like comfort."*`,
    ],
  },
  {
    class: 'shepherd',
    personalLoss: 'identity',
    trigger: 'post_combat',
    lines: [
      `*"Your hands check for a pulse — reflex so deep it predates your memory."*`,
      `*"You treat the wound. Your hands are very confident. Whatever you were, you were a healer."*`,
      `*"You survived. You're good at surviving. You just don't know who it is that survives."*`,
    ],
  },
  {
    class: 'shepherd',
    personalLoss: 'promise',
    trigger: 'post_combat',
    lines: [
      `*"Your hands check for a pulse. Old instinct. You're alive. That matters."*`,
      `*"You treat the wound. Efficiently. You have somewhere to be."*`,
      `*"You survived. The promise is still intact. Keep moving."*`,
    ],
  },

  // -------------------------------------------------------
  // in_danger — seeing the wound before it happens
  // -------------------------------------------------------
  {
    class: 'shepherd',
    personalLoss: 'child',
    trigger: 'in_danger',
    lines: [
      `*"You read bodies for a living. This one is about to cause harm. You read it correctly."*`,
      `*"The treatment for this is distance. Create distance."*`,
      `*"You've triaged worse. This is a threat assessment, not a diagnosis. Treat it accordingly."*`,
    ],
  },
  {
    class: 'shepherd',
    personalLoss: 'partner',
    trigger: 'in_danger',
    lines: [
      `*"You read bodies. This body is dangerous. Noted."*`,
      `*"The treatment is: leave, or eliminate the variable. You've learned both prescriptions."*`,
      `*"Danger. You assess the severity. You respond proportionally. You've done this before."*`,
    ],
  },
  {
    class: 'shepherd',
    personalLoss: 'community',
    trigger: 'in_danger',
    lines: [
      `*"You've triaged under fire. This is just another kind of fire. Triage."*`,
      `*"Threat assessment. You're the only patient that matters right now. Protect the patient."*`,
      `*"Something's wrong here. You've spent a career knowing when something's wrong."*`,
    ],
  },
  {
    class: 'shepherd',
    personalLoss: 'identity',
    trigger: 'in_danger',
    lines: [
      `*"Danger. You read it the way you read symptoms. Your body knows the diagnosis."*`,
      `*"You don't know who you are, but you know what danger smells like. Trust that."*`,
      `*"Something is very wrong. Your hands are already moving."*`,
    ],
  },
  {
    class: 'shepherd',
    personalLoss: 'promise',
    trigger: 'in_danger',
    lines: [
      `*"Threat. You need to be alive to keep the promise. Protect the asset."*`,
      `*"Something is wrong. Your hands are steady. They're always steady when it matters."*`,
      `*"Danger noted. Treatment: survive. Proceed."*`,
    ],
  },

  // -------------------------------------------------------
  // examining_loss_item — the healer's guilt, undisguised
  // -------------------------------------------------------
  {
    class: 'shepherd',
    personalLoss: 'child',
    trigger: 'examining_loss_item',
    lines: [
      `*"You could have done more. You've run through what more would have looked like. It still wasn't enough."*`,
      `*"The diagnosis wasn't what you expected. It rarely is."*`,
      `*"Your hands knew. They knew and it wasn't enough. That's the part you can't treat."*`,
    ],
  },
  {
    class: 'shepherd',
    personalLoss: 'partner',
    trigger: 'examining_loss_item',
    lines: [
      `*"The diagnosis isn't what you expected. It rarely is."*`,
      `*"You hold it and the clinical distance evaporates. You let it. Just this once."*`,
      `*"You could have done more. That's what healers always say. Sometimes it's true."*`,
    ],
  },
  {
    class: 'shepherd',
    personalLoss: 'community',
    trigger: 'examining_loss_item',
    lines: [
      `*"The diagnosis: too late, not enough resources, not enough hands. You've given that diagnosis before."*`,
      `*"The grief is familiar. You've helped other people through it. You're not good at navigating it yourself."*`,
      `*"The diagnosis isn't what you expected. It never is when it's yours."*`,
    ],
  },
  {
    class: 'shepherd',
    personalLoss: 'identity',
    trigger: 'examining_loss_item',
    lines: [
      `*"The diagnosis isn't what you expected. You're not sure what you expected."*`,
      `*"You hold it and try to feel what it means. Your hands are more certain than your memory."*`,
      `*"Something in your healer's training reads this object. The reading is incomplete."*`,
    ],
  },
  {
    class: 'shepherd',
    personalLoss: 'promise',
    trigger: 'examining_loss_item',
    lines: [
      `*"The diagnosis: a promise that has a cost. You knew that when you made it."*`,
      `*"You hold it. You remember the weight of what you said you'd do. The weight hasn't changed."*`,
      `*"Healers make promises they can't always keep. You promised anyway. That's the job."*`,
    ],
  },

  // -------------------------------------------------------
  // safe_rest — hands stop shaking, eventually
  // -------------------------------------------------------
  {
    class: 'shepherd',
    personalLoss: 'child',
    trigger: 'safe_rest',
    lines: [
      `*"Your hands stop shaking. They always stop eventually."*`,
      `*"You rest. You catalog the patients you couldn't save. You don't sleep during that part."*`,
      `*"Safe. You still check the exits. You still check for pulses. Some habits."*`,
    ],
  },
  {
    class: 'shepherd',
    personalLoss: 'partner',
    trigger: 'safe_rest',
    lines: [
      `*"Your hands stop shaking. They always stop. Sometimes it takes longer than you'd like."*`,
      `*"You used to have someone to tell about the day. You process it differently now."*`,
      `*"Safe. The word still means something. You hold onto that."*`,
    ],
  },
  {
    class: 'shepherd',
    personalLoss: 'community',
    trigger: 'safe_rest',
    lines: [
      `*"Your hands stop shaking. They always stop eventually. That's what you tell patients."*`,
      `*"You rest and you count. The people you've helped against the ones you couldn't."*`,
      `*"Safe. For now. You rest. The work resumes."*`,
    ],
  },
  {
    class: 'shepherd',
    personalLoss: 'identity',
    trigger: 'safe_rest',
    lines: [
      `*"Your hands stop shaking. They always stop. Some things about you haven't changed."*`,
      `*"Safe. Your body knows this. It responds before you decide to trust it."*`,
      `*"You rest. You don't know who you are, but your hands remember their purpose. That's enough."*`,
    ],
  },
  {
    class: 'shepherd',
    personalLoss: 'promise',
    trigger: 'safe_rest',
    lines: [
      `*"Your hands stop shaking. The promise can wait three hours. You need this."*`,
      `*"Safe. You allow yourself to feel it briefly. Then you get ready to move."*`,
      `*"Rest. The promise needs you functional. This is functional maintenance."*`,
    ],
  },

  // -------------------------------------------------------
  // act_transition — the scale of need expanding
  // -------------------------------------------------------
  {
    class: 'shepherd',
    personalLoss: 'child',
    trigger: 'act_transition',
    lines: [
      `*"The scope of the wound got bigger. You treat what you can reach."*`,
      `*"More people need help now. You can't help everyone. You start with whoever is closest."*`,
    ],
  },
  {
    class: 'shepherd',
    personalLoss: 'partner',
    trigger: 'act_transition',
    lines: [
      `*"The triage changed. The priorities shifted. You adapt the protocol."*`,
      `*"More people are going to die. You focus on the ones who don't have to."*`,
    ],
  },
  {
    class: 'shepherd',
    personalLoss: 'community',
    trigger: 'act_transition',
    lines: [
      `*"The scale changed. The work doesn't. Help what you can. Grieve the rest later."*`,
      `*"The wound got bigger. You've treated big wounds. Get to work."*`,
    ],
  },
  {
    class: 'shepherd',
    personalLoss: 'identity',
    trigger: 'act_transition',
    lines: [
      `*"Everything changed. Your hands are still ready. Whoever you are, that's what they do."*`,
      `*"The world got worse. You respond to worse. It's what you're for."*`,
    ],
  },
  {
    class: 'shepherd',
    personalLoss: 'promise',
    trigger: 'act_transition',
    lines: [
      `*"The path to the promise got harder. You've walked hard paths."*`,
      `*"Everything escalated. The promise is still there. Keep moving."*`,
    ],
  },

  // -------------------------------------------------------
  // pressure_spike — reading the room's pain
  // -------------------------------------------------------
  {
    class: 'shepherd',
    personalLoss: 'child',
    trigger: 'pressure_spike',
    lines: [
      `*"Something is wrong here. The same way a room full of sick people is wrong — in the air."*`,
      `*"You read suffering. This place is saturated with it."*`,
    ],
  },
  {
    class: 'shepherd',
    personalLoss: 'partner',
    trigger: 'pressure_spike',
    lines: [
      `*"Something here is in pain. The whole place. You feel it the way you feel a patient deteriorating."*`,
      `*"The air is wrong. Medically wrong. You don't have a chart for this. Treat it anyway."*`,
    ],
  },
  {
    class: 'shepherd',
    personalLoss: 'community',
    trigger: 'pressure_spike',
    lines: [
      `*"The atmosphere changed. Rooms change before people do. You learned to read rooms early."*`,
      `*"Something here needs help. You are not sure what kind of help it needs."*`,
    ],
  },
  {
    class: 'shepherd',
    personalLoss: 'identity',
    trigger: 'pressure_spike',
    lines: [
      `*"Wrong. Everything here is wrong. Your body signals it clearly."*`,
      `*"The air here is sick. You've treated sick air before. Stay careful."*`,
    ],
  },
  {
    class: 'shepherd',
    personalLoss: 'promise',
    trigger: 'pressure_spike',
    lines: [
      `*"Something worsened. You log the symptoms. You keep moving. The promise doesn't pause."*`,
      `*"The tension here is clinical. You treat it as a variable. You proceed."*`,
    ],
  },
]
