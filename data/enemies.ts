import type { Enemy } from '@/types/game'

// CHARON-7 infection spectrum and Sanguine predators.
// The Hollow are not zombies. The Sanguine are not vampires.
// Neither distinction matters much when they're trying to kill you.
export const ENEMIES: Record<string, Enemy> = {

  // ----------------------------------------------------------
  // The Hollow — CHARON-7 infected
  // ----------------------------------------------------------

  shuffler: {
    id: 'shuffler',
    name: 'Shuffler',
    description: 'It was someone\'s father. The wrench in its hand is held wrong — grip memory without purpose. It moves like a signal degraded past recognition. Slow. It will eventually reach you. Plan accordingly.',
    hp: 8,
    maxHp: 8,
    attack: 0,
    defense: 3,
    damage: [1, 3],
    xp: 10,
    loot: [
      { itemId: 'canned_food', chance: 0.15 },
    ],
  },

  remnant: {
    id: 'remnant',
    name: 'Remnant',
    description: 'The uniform still has a name tag. It reaches for a sidearm it no longer has. Then it reaches for you. Whatever it was good at before the Collapse, fragments of that competence are still in there. That\'s what makes it dangerous.',
    hp: 14,
    maxHp: 14,
    attack: 2,
    defense: 5,
    damage: [2, 5],
    xp: 25,
    loot: [
      { itemId: 'pistol_9mm', chance: 0.10 },
      { itemId: 'bandages', chance: 0.20 },
    ],
  },

  screamer: {
    id: 'screamer',
    name: 'Screamer',
    description: 'Throat tissue modified by the virus into something that shouldn\'t exist. The vocalization it produces carries eight hundred meters in open terrain. It is not a weapon — it is a signal flare. Every Hollow within earshot is already moving toward you. Kill it fast or don\'t bother killing it at all.',
    hp: 10,
    maxHp: 10,
    attack: 1,
    defense: 4,
    damage: [1, 4],
    xp: 20,
    loot: [],
  },

  brute: {
    id: 'brute',
    name: 'Brute',
    description: 'The virus did something to the musculature. It is large in a way humans aren\'t supposed to be. Shoulders too wide, arms too long, the gait wrong in a way your hind-brain registers before your forebrain catches up. It hits like a vehicle. It doesn\'t get tired.',
    hp: 35,
    maxHp: 35,
    attack: 4,
    defense: 8,
    damage: [5, 10],
    xp: 60,
    loot: [
      { itemId: 'scrap_metal', chance: 0.40 },
    ],
  },

  whisperer: {
    id: 'whisperer',
    name: 'Whisperer',
    description: 'Partial speech retention. It calls out names — not yours specifically, but close enough that your body reacts before your mind does. Uses recorded vocal patterns to replicate voices of people you may have known. The psychological threat is extreme. What it says is not real. The claws are. Do not listen. Do not engage at range. Do not hesitate.',
    hp: 18,
    maxHp: 18,
    attack: 3,
    defense: 7,
    damage: [3, 7],
    xp: 50,
    loot: [
      { itemId: 'ammo_22lr', chance: 0.30 },
    ],
  },

  // ----------------------------------------------------------
  // The Sanguine — apex predators
  // ----------------------------------------------------------

  sanguine_feral: {
    id: 'sanguine_feral',
    name: 'Sanguine (Feral)',
    description: 'One in ten thousand didn\'t turn Hollow. They turned into this. Nomadic, blood-dependent, photosensitive above a certain lux threshold. Fast in the way that registers after the fact — you see where it was, not where it is. Not supernatural. Just faster than you. Significantly faster than you.',
    hp: 30,
    maxHp: 30,
    attack: 5,
    defense: 9,
    damage: [4, 8],
    xp: 80,
    loot: [
      { itemId: 'covenant_sigil', chance: 0.05 },
    ],
  },

  sanguine_enforcer: {
    id: 'sanguine_enforcer',
    name: 'Sanguine Enforcer',
    description: 'Red Court. They organize, they plan, they hold territory. This one is wearing tactical gear that fits. That means supply lines, that means logistics, that means someone is in charge. It is patient in the way that things are patient when they know they will win. It is also watching your exits.',
    hp: 40,
    maxHp: 40,
    attack: 6,
    defense: 10,
    damage: [5, 10],
    xp: 120,
    loot: [
      { itemId: 'combat_knife', chance: 0.20 },
      { itemId: 'ammo_9mm', chance: 0.30 },
    ],
  },
}

export function getEnemy(id: string): Enemy | undefined {
  return ENEMIES[id]
}
