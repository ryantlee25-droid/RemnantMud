import type { Enemy } from '@/types/game'

// CHARON-7 infection spectrum and Sanguine predators.
// The Hollow are not zombies. The Sanguine are not vampires.
// Neither distinction matters much when they're trying to kill you.
export const ENEMIES: Record<string, Enemy> = {

  // ----------------------------------------------------------
  // The Hollow — CHARON-7 infected humans
  // ----------------------------------------------------------

  shuffler: {
    id: 'shuffler',
    name: 'Shuffler',
    description: 'It was someone\'s father. The wrench in its hand is held wrong — grip memory without purpose. It shambles through fragments of a life it no longer has. Slow. It will eventually reach you. Plan accordingly.',
    hollowType: 'shuffler',
    hp: 10,
    maxHp: 10,
    attack: 1,
    defense: 8,
    damage: [1, 3],
    xp: 10,
    loot: [
      { itemId: 'scrap_metal', chance: 0.10 },
      { itemId: 'ammo_22lr', chance: 0.08 },
    ],
    flavorText: [
      'It shambles toward you, arms dragging, feet scraping the floor.',
      'It drags one leg behind it and still does not slow down.',
      'It sways in the doorway for a moment before lurching forward.',
      'It shambles through the debris without registering it.',
      'Something in it is still moving toward something it can no longer name.',
    ],
  },

  remnant: {
    id: 'remnant',
    name: 'Remnant',
    description: 'The uniform still has a name tag. It reaches for a sidearm it no longer has. Then it reaches for you. Whatever it was good at before the Collapse, fragments of that competence are still in there. That\'s what makes it dangerous.',
    hollowType: 'remnant',
    hp: 16,
    maxHp: 16,
    attack: 2,
    defense: 10,
    damage: [2, 5],
    xp: 25,
    loot: [
      { itemId: 'combat_knife', chance: 0.08 },
      { itemId: '9mm_pistol', chance: 0.06 },
      { itemId: 'ammo_9mm', chance: 0.15 },
      { itemId: 'bandages', chance: 0.12 },
    ],
    flavorText: [
      'It reaches for something at its hip that isn\'t there, then reaches for you.',
      'It crouches low before it moves — old muscle memory in something that has forgotten why.',
      'It turns with purpose, tracking you like it once tracked things it understood.',
      'It moves in the stuttering half-patterns of someone who used to know exactly what they were doing.',
      'A remnant of competence, wearing the skin of the person who had it.',
    ],
  },

  screamer: {
    id: 'screamer',
    name: 'Screamer',
    description: 'Throat tissue modified by the virus into something that shouldn\'t exist. The vocalization it produces carries eight hundred meters in open terrain. It is not a weapon — it is a signal flare. Every Hollow within earshot is already moving toward you. Kill it fast or don\'t bother killing it at all.',
    hollowType: 'screamer',
    hp: 10,
    maxHp: 10,
    attack: 1,
    defense: 9,
    damage: [1, 2],
    xp: 30,
    loot: [],
    flavorText: [
      'It opens its mouth and the sound that comes out is not a human sound.',
      'The shriek tears through the air — somewhere out in the dark, something answers.',
      'It screams and screams and the echo carries it farther than you want to think about.',
      'The vocalization is less a cry than a broadcast. Something out there is receiving it.',
    ],
  },

  brute: {
    id: 'brute',
    name: 'Brute',
    description: 'The virus did something to the musculature. It is large in a way humans aren\'t supposed to be. Shoulders too wide, arms too long, the gait wrong in a way your hind-brain registers before your forebrain catches up. It hits like a vehicle. It doesn\'t get tired.',
    hollowType: 'brute',
    hp: 35,
    maxHp: 35,
    attack: 4,
    defense: 12,
    damage: [4, 8],
    xp: 80,
    loot: [
      { itemId: 'scrap_metal', chance: 0.60 },
      { itemId: 'pipe_wrench', chance: 0.25 },
      { itemId: 'bandages', chance: 0.15 },
    ],
    flavorText: [
      'It charges — not fast, but with the inevitability of falling stone.',
      'It throws a section of shelving like it weighs nothing, because to it, it doesn\'t.',
      'It breaks through the interior wall without slowing, trailing drywall dust.',
      'The impact carries you three feet. The wall was there first, which was unfortunate.',
      'It moves with the patient violence of something that has never had to hurry.',
    ],
  },

  whisperer: {
    id: 'whisperer',
    name: 'Whisperer',
    description: 'Rare. Retains partial speech. It calls out names — not yours specifically, but close enough that your body reacts before your mind does. Uses recorded vocal patterns to replicate voices of people you may have known. The psychological threat is extreme. What it says is not real. The claws are.',
    hollowType: 'whisperer',
    hp: 20,
    maxHp: 20,
    attack: 3,
    defense: 11,
    damage: [3, 6],
    xp: 100,
    loot: [
      { itemId: 'ammo_22lr', chance: 0.30 },
      { itemId: 'quiet_drops', chance: 0.10 },
    ],
    flavorText: [
      'It speaks your name. Not quite your name. Close enough.',
      'It asks for help in a voice that belongs to someone you used to know.',
      'It begs. The words are real. The thing speaking them is not.',
      '"Don\'t go," it says. You go. You go fast.',
      'It holds a conversation with itself in voices that don\'t belong to it, and two of them sound like people you have lost.',
    ],
  },

  hive_mother: {
    id: 'hive_mother',
    name: 'Hive Mother',
    description: 'Extremely rare. The pheromonal signal it broadcasts reaches further than sound, faster than thought. Every Hollow in range is an extension of its will. It does not fight — it directs. Killing it is an act of surgery, not combat. The swarm is the wound that surrounds the patient.',
    hollowType: 'hive_mother',
    hp: 50,
    maxHp: 50,
    attack: 5,
    defense: 14,
    damage: [5, 10],
    xp: 250,
    loot: [
      { itemId: 'electronics_salvage', chance: 0.40 },
      { itemId: 'chemicals_basic', chance: 0.35 },
      { itemId: 'sanguine_blood_vial', chance: 0.05 },
    ],
    flavorText: [
      'The Hollow around it move in patterns — coordinated, geometric, wrong.',
      'It does not attack. It points at you and seventeen things that were human begin to move.',
      'Something shifts in the air, a signal below the threshold of your hearing, and the herd realigns.',
      'It watches you with eyes that are not processing you as prey. It is processing you as a problem to be solved.',
    ],
  },

  // ----------------------------------------------------------
  // The Sanguine — enhanced apex predators
  // ----------------------------------------------------------

  sanguine_feral: {
    id: 'sanguine_feral',
    name: 'Sanguine (Feral)',
    description: 'One in ten thousand didn\'t turn Hollow. They turned into this. Fast in the way that registers after the fact — you see where it was, not where it is. No coordination, no faction, pure predatory instinct. Not supernatural. Just faster than you. Significantly faster than you.',
    hp: 25,
    maxHp: 25,
    attack: 5,
    defense: 14,
    damage: [5, 10],
    xp: 150,
    loot: [
      { itemId: 'sanguine_blood_vial', chance: 0.40 },
    ],
    flavorText: [
      'It moves like something that does not need to explain itself to physics.',
      'It was behind you before it was in front of you. The sequence is still unclear.',
      'There is no threat display. No warning. Just the sudden, complete fact of it.',
      'It closes the distance between you in a way that your eyes report incorrectly.',
    ],
  },

  red_court_enforcer: {
    id: 'red_court_enforcer',
    name: 'Red Court Enforcer',
    description: 'Red Court. They organize, they plan, they hold territory. This one is wearing tactical gear that fits. That means supply lines, that means logistics, that means someone is in charge. It is patient in the way that things are patient when they know they will win. It is also watching your exits.',
    hp: 35,
    maxHp: 35,
    attack: 6,
    defense: 15,
    damage: [5, 12],
    xp: 200,
    loot: [
      { itemId: 'sanguine_blood_vial', chance: 0.50 },
      { itemId: 'combat_knife', chance: 0.20 },
      { itemId: 'ammo_9mm', chance: 0.25 },
    ],
    flavorText: [
      'It circles left, cutting off the eastern approach without appearing to notice you.',
      'It moves in the practiced, unhurried way of something that has done this many times and expects to do it many more.',
      'It doesn\'t rush. Rushing is for things that are not certain of the outcome.',
      'It coordinates with something outside the room. There was a signal you didn\'t see.',
    ],
  },

  elder_sanguine: {
    id: 'elder_sanguine',
    name: 'Elder Sanguine',
    description: 'Seven years of CHARON-7 refinement in a single body. It does not look old. It looks complete. Whatever it was before the Collapse is entirely gone, replaced by something the virus has had seven years to optimize. You are not a threat. You are a complication. These are different things.',
    hp: 60,
    maxHp: 60,
    attack: 8,
    defense: 17,
    damage: [8, 15],
    xp: 400,
    loot: [
      { itemId: 'sanguine_blood_vial', chance: 0.80 },
      { itemId: 'silver_knife', chance: 0.05 },
      { itemId: 'meridian_keycard', chance: 0.03 },
    ],
    flavorText: [
      'It has been watching you since you entered the zone. You are only now realizing this.',
      'The speed is different from the feral — controlled, allocated, spent only where necessary.',
      'It speaks before it moves. Whatever it says, you do not have time to process it before you are already defending.',
      'It does not bleed the way things should bleed. Something in the biology has changed.',
      'The patience is the most frightening part. It will wait. It has always waited.',
    ],
  },
}

export function getEnemy(id: string): Enemy | undefined {
  return ENEMIES[id]
}
