import type { Enemy } from '@/types/game'
import type { EnemyResistance } from '@/types/traits'

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
    hp: 12,
    maxHp: 12,
    attack: 1,
    defense: 7,
    damage: [2, 4],
    xp: 12,
    critChance: 0.05,
    fleeThreshold: 0.0,
    loot: [
      { itemId: 'scrap_metal', chance: 0.20 },
      { itemId: 'ammo_22lr', chance: 0.40 },
      { itemId: 'scrap_vest', chance: 0.12 },
    ],
    flavorText: [
      'It shambles toward you, arms dragging, feet scraping the floor.',
      'It drags one leg behind it and still does not slow down.',
      'It sways in the doorway for a moment before lurching forward.',
      'It shambles through the debris without registering it.',
      'Something in it is still moving toward something it can no longer name.',
    ],
    resistanceProfile: {
      weaknesses: {
        scorching: { bonusDamage: 3, description: 'Dead tissue ignites easily. +3 fire damage.' },
      },
      resistances: {},
      conditionImmunities: ['bleeding'],
    },
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
    critChance: 0.05,
    fleeThreshold: 0.0,
    loot: [
      { itemId: 'combat_knife', chance: 0.12 },
      { itemId: '9mm_pistol', chance: 0.12 },
      { itemId: 'ammo_9mm', chance: 0.15 },
      { itemId: 'bandages', chance: 0.20 },
      { itemId: 'leather_jacket', chance: 0.12 },
      { itemId: 'ammo_22lr', chance: 0.40 },
    ],
    flavorText: [
      'It reaches for something at its hip that isn\'t there, then reaches for you.',
      'It crouches low before it moves — old muscle memory in something that has forgotten why.',
      'It turns with purpose, tracking you like it once tracked things it understood.',
      'It moves in the stuttering half-patterns of someone who used to know exactly what they were doing.',
      'A remnant of competence, wearing the skin of the person who had it.',
    ],
    resistanceProfile: {
      weaknesses: {
        disrupting: { bonusDamage: 3, description: 'Residual neural patterns disrupted. +3 damage.' },
      },
      resistances: {},
      conditionImmunities: [],
    },
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
    critChance: 0.0,
    fleeThreshold: 0.5,
    loot: [
      { itemId: 'scrap_metal', chance: 0.20 },
      { itemId: 'ammo_22lr', chance: 0.50 },
      { itemId: 'bandages', chance: 0.10 },
    ],
    flavorText: [
      'It opens its mouth and the sound that comes out is not a human sound.',
      'The shriek tears through the air — somewhere out in the dark, something answers.',
      'It screams and screams and the echo carries it farther than you want to think about.',
      'The vocalization is less a cry than a broadcast. Something out there is receiving it.',
    ],
    resistanceProfile: {
      weaknesses: {
        heavy: { bonusDamage: 2, description: 'Blunt trauma silences the modified throat. +2 damage.' },
      },
      resistances: {},
      conditionImmunities: ['poisoned'],
    },
  },

  stalker: {
    id: 'stalker',
    name: 'Stalker',
    description: 'Something in the viral rewrite gave this one patience. It does not shamble. It follows. It waits behind corners and in doorways with the stillness of something that has learned that stillness works. Faster than a remnant, quieter than a brute, and it has been watching you for longer than you have been watching it.',
    hollowType: 'stalker',
    hp: 22,
    maxHp: 22,
    attack: 3,
    defense: 11,
    damage: [3, 6],
    xp: 50,
    critChance: 0.15,
    fleeThreshold: 0.3,
    loot: [
      { itemId: 'combat_knife', chance: 0.12 },
      { itemId: 'bandages', chance: 0.20 },
      { itemId: 'ammo_9mm', chance: 0.15 },
      { itemId: 'leather_jacket', chance: 0.12 },
      { itemId: 'reinforced_coat', chance: 0.08 },
      { itemId: 'ammo_22lr', chance: 0.50 },
    ],
    flavorText: [
      'It was behind the door. It was always behind the door.',
      'It moves low and fast, closing distance before you register it as a threat.',
      'It tracks you with its head tilted, processing your movement patterns with something that is not intelligence but functions identically.',
      'The patience is the worst part. It followed you for three rooms before it decided you were close enough.',
      'It emerges from the shadows with the economy of something that has learned to spend its energy precisely.',
    ],
    resistanceProfile: {
      weaknesses: {
        scorching: { bonusDamage: 0, description: 'Quick reflexes mean nothing when the fire catches. Burn damage doubled.' },
      },
      resistances: {
        keen: { reduction: 0.5, description: 'Quick reflexes deflect precise strikes. Keen damage halved.' },
        blessed: { reduction: 0.5, description: 'Adaptability dulls holy resonance. Blessed damage halved.' },
        disrupting: { reduction: 0.5, description: 'No fixed neural pattern to disrupt. Electric damage halved.' },
      },
      conditionImmunities: [],
    },
  },

  brute: {
    id: 'brute',
    name: 'Brute',
    description: 'The virus did something to the musculature. It is large in a way humans aren\'t supposed to be. Shoulders too wide, arms too long, the gait wrong in a way your hind-brain registers before your forebrain catches up. It hits like a vehicle. It doesn\'t get tired.',
    hollowType: 'brute',
    hp: 30,
    maxHp: 30,
    attack: 4,
    defense: 12,
    damage: [3, 7],
    xp: 80,
    critChance: 0.10,
    fleeThreshold: 0.0,
    loot: [
      { itemId: 'scrap_metal', chance: 0.20 },
      { itemId: 'pipe_wrench', chance: 0.25 },
      { itemId: 'bandages', chance: 0.20 },
      { itemId: 'reinforced_coat', chance: 0.10 },
      { itemId: 'kevlar_vest', chance: 0.06 },
      { itemId: 'ammo_22lr', chance: 0.50 },
    ],
    flavorText: [
      'It charges — not fast, but with the inevitability of falling stone.',
      'It throws a section of shelving like it weighs nothing, because to it, it doesn\'t.',
      'It breaks through the interior wall without slowing, trailing drywall dust.',
      'The impact carries you three feet. The wall was there first, which was unfortunate.',
      'It moves with the patient violence of something that has never had to hurry.',
    ],
    resistanceProfile: {
      weaknesses: {
        keen: { bonusDamage: 0, description: 'Keen edges find the gaps in thick hide. Critical hits bypass armor.' },
        scorching: { bonusDamage: 3, description: 'Thick viral muscle burns hot. +3 fire damage.' },
      },
      resistances: {
        heavy: { reduction: 0.5, description: 'Thick hide absorbs blunt force. Heavy bonus damage halved.' },
        disrupting: { reduction: 0.5, description: 'Brute musculature has no neural precision to disrupt. Electric damage halved.' },
      },
      conditionImmunities: [],
    },
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
    critChance: 0.0,
    fleeThreshold: 0.4,
    loot: [
      { itemId: 'ammo_22lr', chance: 0.40 },
      { itemId: 'quiet_drops', chance: 0.10 },
      { itemId: 'scrap_metal', chance: 0.20 },
    ],
    flavorText: [
      'It speaks your name. Not quite your name. Close enough.',
      'It asks for help in a voice that belongs to someone you used to know.',
      'It begs. The words are real. The thing speaking them is not.',
      '"Don\'t go," it says. You go. You go fast.',
      'It holds a conversation with itself in voices that don\'t belong to it, and two of them sound like people you have lost.',
    ],
    resistanceProfile: {
      weaknesses: {
        blessed: { bonusDamage: 3, description: 'Consecrated steel disrupts the vocal mimicry. +3 holy damage.' },
      },
      resistances: {},
      conditionImmunities: ['frightened'],
    },
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
    critChance: 0.05,
    fleeThreshold: 0.0,
    loot: [
      { itemId: 'electronics_salvage', chance: 0.40 },
      { itemId: 'chemicals_basic', chance: 0.35 },
      { itemId: 'sanguine_blood_vial', chance: 0.05 },
      { itemId: 'hazmat_suit', chance: 0.08 },
      { itemId: 'scrap_metal', chance: 0.20 },
      { itemId: 'ammo_22lr', chance: 0.80 },
    ],
    flavorText: [
      'The Hollow around it move in patterns — coordinated, geometric, wrong.',
      'It does not attack. It points at you and seventeen things that were human begin to move.',
      'Something shifts in the air, a signal below the threshold of your hearing, and the herd realigns.',
      'It watches you with eyes that are not processing you as prey. It is processing you as a problem to be solved.',
    ],
    resistanceProfile: {
      weaknesses: {
        disrupting: { bonusDamage: 4, description: 'Severing strike disrupts the pheromonal colony link. +4 electric damage.' },
        scorching: { bonusDamage: 3, description: 'Pheromonal tissue is volatile. +3 fire damage.' },
      },
      resistances: {},
      conditionImmunities: [],
    },
  },

  // ----------------------------------------------------------
  // The Sanguine — enhanced apex predators
  // ----------------------------------------------------------

  sanguine_feral: {
    id: 'sanguine_feral',
    name: 'Sanguine (Feral)',
    description: 'One in ten thousand didn\'t turn Hollow. They turned into this. Fast in the way that registers after the fact — you see where it was, not where it is. No coordination, no faction, pure predatory instinct. Not supernatural. Just faster than you. Significantly faster than you.',
    hollowType: 'sanguine_feral',
    hp: 25,
    maxHp: 25,
    attack: 5,
    defense: 14,
    damage: [5, 10],
    xp: 150,
    critChance: 0.15,
    fleeThreshold: 0.0,
    loot: [
      { itemId: 'sanguine_blood_vial', chance: 0.40 },
      { itemId: 'scrap_metal', chance: 0.20 },
      { itemId: 'ammo_22lr', chance: 0.80 },
    ],
    flavorText: [
      'It moves like something that does not need to explain itself to physics.',
      'It was behind you before it was in front of you. The sequence is still unclear.',
      'There is no threat display. No warning. Just the sudden, complete fact of it.',
      'It closes the distance between you in a way that your eyes report incorrectly.',
    ],
    resistanceProfile: {
      weaknesses: {
        blessed: { bonusDamage: 4, description: 'Consecrated steel burns Sanguine biology. +4 damage.' },
      },
      resistances: {
        draining: { reduction: 1.0, description: 'Sanguine blood cannot be drained. Immune to draining effects.' },
      },
      conditionImmunities: [],
    },
  },

  red_court_enforcer: {
    id: 'red_court_enforcer',
    name: 'Red Court Enforcer',
    description: 'Red Court. They organize, they plan, they hold territory. This one is wearing tactical gear that fits. That means supply lines, that means logistics, that means someone is in charge. It is patient in the way that things are patient when they know they will win. It is also watching your exits.',
    hollowType: 'sanguine_feral',
    hp: 35,
    maxHp: 35,
    attack: 6,
    defense: 15,
    damage: [5, 12],
    xp: 200,
    critChance: 0.10,
    fleeThreshold: 0.0,
    loot: [
      { itemId: 'sanguine_blood_vial', chance: 0.50 },
      { itemId: 'combat_knife', chance: 0.20 },
      { itemId: 'ammo_9mm', chance: 0.25 },
      { itemId: 'kevlar_vest', chance: 0.08 },
      { itemId: 'ammo_22lr', chance: 0.70 },
    ],
    flavorText: [
      'It circles left, cutting off the eastern approach without appearing to notice you.',
      'It moves in the practiced, unhurried way of something that has done this many times and expects to do it many more.',
      'It doesn\'t rush. Rushing is for things that are not certain of the outcome.',
      'It coordinates with something outside the room. There was a signal you didn\'t see.',
    ],
    resistanceProfile: {
      weaknesses: {
        precise: { bonusDamage: 2, description: 'Tactical gear has gaps a precise strike can find. +2 damage.' },
        blessed: { bonusDamage: 3, description: 'Consecrated steel burns Sanguine biology. +3 holy damage.' },
      },
      resistances: {
        scorching: { reduction: 0.5, description: 'Tactical heat-resistant gear. Fire damage halved.' },
      },
      conditionImmunities: ['frightened'],
    },
  },

  elder_sanguine: {
    id: 'elder_sanguine',
    name: 'Elder Sanguine',
    description: 'Seven years of CHARON-7 refinement in a single body. It does not look old. It looks complete. Whatever it was before the Collapse is entirely gone, replaced by something the virus has had seven years to optimize. You are not a threat. You are a complication. These are different things.',
    hollowType: 'elder_sanguine',
    hp: 60,
    maxHp: 60,
    attack: 8,
    defense: 17,
    damage: [8, 15],
    xp: 400,
    critChance: 0.20,
    fleeThreshold: 0.0,
    loot: [
      { itemId: 'sanguine_blood_vial', chance: 0.80 },
      { itemId: 'silver_knife', chance: 0.06 },
      { itemId: 'meridian_keycard', chance: 0.06 },
      { itemId: 'kevlar_vest', chance: 0.08 },
      { itemId: 'ammo_22lr', chance: 0.95 },
    ],
    flavorText: [
      'It has been watching you since you entered the zone. You are only now realizing this.',
      'The speed is different from the feral — controlled, allocated, spent only where necessary.',
      'It speaks before it moves. Whatever it says, you do not have time to process it before you are already defending.',
      'It does not bleed the way things should bleed. Something in the biology has changed.',
      'The patience is the most frightening part. It will wait. It has always waited.',
    ],
    resistanceProfile: {
      weaknesses: {
        blessed: { bonusDamage: 5, description: 'Seven years of CHARON-7 refinement unravels against consecrated steel. +5 holy damage.' },
      },
      resistances: {
        disrupting: { reduction: 1.0, description: 'Individual predator, no colony link to sever. Immune to electric disruption.' },
        scorching: { reduction: 0.5, description: 'Seven years of viral adaptation dulls fire damage. Fire damage halved.' },
      },
      conditionImmunities: [],
    },
  },

  // ----------------------------------------------------------
  // MERIDIAN-specific enemies
  // ----------------------------------------------------------

  meridian_automated_turret: {
    id: 'meridian_automated_turret',
    name: 'Automated Turret',
    description: 'MERIDIAN security hardware, pre-Collapse, still functional. No biological component. No hesitation. No negotiation. It identified you as unauthorized the moment you entered its field of view. The red indicator light on its housing is not a warning. It was already past warning before you noticed it.',
    hp: 20,
    maxHp: 20,
    attack: 6,
    defense: 16,
    damage: [6, 12],
    xp: 120,
    critChance: 0.10,
    fleeThreshold: 0.0,
    loot: [
      { itemId: 'electronics_salvage', chance: 0.50 },
      { itemId: 'ammo_9mm', chance: 0.30 },
      { itemId: 'scrap_metal', chance: 0.20 },
      { itemId: 'ammo_22lr', chance: 0.90 },
    ],
    flavorText: [
      'The barrel traverses at a speed that does not correspond to any mechanism you can see.',
      'It does not rush. It is already at the correct rate of fire.',
      'The report is flat and businesslike. It has fired ten thousand times before this.',
      'You move left. The turret was already tracking left when you decided to move.',
      'No hesitation, no warning shot. Authorization expired seven years ago and it has been patient.',
    ],
    resistanceProfile: {
      weaknesses: {
        disrupting: { bonusDamage: 3, description: 'Electromagnetic disruption shorts the targeting circuits. +3 electric damage.' },
      },
      resistances: {
        blessed: { reduction: 1.0, description: 'Mechanical construct. Immune to holy damage.' },
        scorching: { reduction: 0.5, description: 'Heat-hardened housing. Fire damage halved.' },
      },
      conditionImmunities: ['bleeding', 'burning', 'stunned', 'frightened', 'poisoned', 'weakened'],
    },
  },

  meridian_ancient_hollow: {
    id: 'meridian_ancient_hollow',
    name: 'Ancient Hollow',
    description: 'Seven years inside MERIDIAN. The virus has had seven years to work on this one and the result is not what the shufflers outside look like. Something has calcified in the biology — the joints are wrong, the movement is wrong, the eyes are fully silver and tracking with a precision no other Hollow exhibits. It was a researcher. The badge is still on its coat. The name has worn away.',
    hollowType: 'remnant',
    hp: 45,
    maxHp: 45,
    attack: 6,
    defense: 14,
    damage: [6, 12],
    xp: 180,
    critChance: 0.15,
    fleeThreshold: 0.0,
    loot: [
      { itemId: 'chemicals_basic', chance: 0.35 },
      { itemId: 'bandages', chance: 0.20 },
      { itemId: 'scrap_metal', chance: 0.20 },
      { itemId: 'ammo_22lr', chance: 0.60 },
    ],
    flavorText: [
      'It turns toward you with a precision that no other Hollow has demonstrated. Seven years of refinement.',
      'The movement is wrong in a way that is hard to quantify — too deliberate, too economical.',
      'It does not shamble. It advances. There is a difference, and you feel it.',
      'The silver eyes track you the way a camera tracks movement. Cold. Accurate. Tireless.',
      'Whatever it was remembering when it became this, it has spent seven years practicing it.',
    ],
    resistanceProfile: {
      weaknesses: {
        blessed: { bonusDamage: 3, description: 'Seven years of CHARON-7 calcification reacts violently to consecrated steel. +3 holy damage.' },
        scorching: { bonusDamage: 3, description: 'Seven years of calcified tissue burns readily. +3 fire damage.' },
      },
      resistances: {},
      conditionImmunities: ['frightened'],
    },
  },

  // ----------------------------------------------------------
  // The Deep — specialized variants
  // ----------------------------------------------------------

  elder_sanguine_deep: {
    id: 'elder_sanguine_deep',
    name: 'Elder Sanguine (Apex)',
    description: 'The Deep is not a territory you stumbled into. You were assessed, tracked, and allowed to reach this point. What stands before you is the reason. The oldest Sanguine in the region — pre-Collapse converted, not post. It has had seven years. Its biology and the CHARON-7 variant that altered it are no longer distinguishable. It is watching you with something that is not exactly curiosity and is not exactly hunger and may be a word you do not have yet.',
    hollowType: 'elder_sanguine',
    hp: 75,
    maxHp: 75,
    attack: 10,
    defense: 18,
    damage: [10, 18],
    xp: 600,
    critChance: 0.20,
    fleeThreshold: 0.0,
    loot: [
      { itemId: 'sanguine_blood_vial', chance: 0.90 },
      { itemId: 'silver_knife', chance: 0.15 },
      { itemId: 'meridian_keycard', chance: 0.08 },
      { itemId: 'ammo_22lr', chance: 0.95 },
    ],
    flavorText: [
      'It does not move first. It has never needed to move first.',
      'The speed is not a surprise anymore. The precision still is.',
      'It says something in a voice that is entirely calm. You do not have time to parse it.',
      'It moves through the dark like it was made for it, because it was.',
      'Whatever it was before CHARON-7, what it is now has fully replaced the question.',
    ],
    resistanceProfile: {
      weaknesses: {
        blessed: { bonusDamage: 5, description: 'Seven years of CHARON-7 integration shatters against consecrated steel. +5 holy damage.' },
      },
      resistances: {
        disrupting: { reduction: 1.0, description: 'Apex predator, no colony link. Immune to electric disruption.' },
        scorching: { reduction: 0.5, description: 'Pre-Collapse CHARON-7 adaptation dampens fire damage. Fire damage halved.' },
      },
      conditionImmunities: [],
    },
  },

  hive_mother_the_deep: {
    id: 'hive_mother_the_deep',
    name: 'Hive Mother (Deep)',
    description: 'The Deep Hive Mother is not the same as those found in open territory. Underground isolation has concentrated the pheromonal broadcast — narrower range, more total density. Every Hollow in these tunnels is an extension of this signal. You are not fighting a creature. You are fighting a node in a network, and the network knows you are here.',
    hollowType: 'hive_mother',
    hp: 65,
    maxHp: 65,
    attack: 6,
    defense: 15,
    damage: [6, 12],
    xp: 350,
    critChance: 0.10,
    fleeThreshold: 0.0,
    loot: [
      { itemId: 'chemicals_basic', chance: 0.45 },
      { itemId: 'sanguine_blood_vial', chance: 0.10 },
      { itemId: 'scrap_metal', chance: 0.20 },
      { itemId: 'ammo_22lr', chance: 0.80 },
    ],
    flavorText: [
      'The tunnels change when it moves. The other Hollow reorient.',
      'It does not look at you. It is looking at the space around you, calculating occupancy.',
      'Something below the threshold of hearing shifts, and the distant shuffling in the tunnels gets louder.',
      'It points. Not at you. At where you will be.',
    ],
    resistanceProfile: {
      weaknesses: {
        disrupting: { bonusDamage: 4, description: 'Severing strike disrupts the concentrated pheromonal link. +4 electric damage.' },
        scorching: { bonusDamage: 3, description: 'Concentrated pheromonal tissue burns. +3 fire damage.' },
      },
      resistances: {},
      conditionImmunities: [],
    },
  },

  hollow_brute_deep: {
    id: 'hollow_brute_deep',
    name: 'Deep Brute',
    description: 'The Deep Brute is what happens when a brute spends years in low-light underground space. Broader, lower, adapted to confined passages. The shoulders have changed. The jaw has changed. It moves through the tunnels with the ease of something that grew up here, because it has, in a biological sense, since the virus rewrote it.',
    hollowType: 'brute',
    hp: 45,
    maxHp: 45,
    attack: 5,
    defense: 13,
    damage: [5, 10],
    xp: 110,
    critChance: 0.10,
    fleeThreshold: 0.0,
    loot: [
      { itemId: 'scrap_metal', chance: 0.50 },
      { itemId: 'pipe_wrench', chance: 0.20 },
      { itemId: 'bandages', chance: 0.20 },
      { itemId: 'ammo_22lr', chance: 0.50 },
    ],
    flavorText: [
      'It fills the tunnel in a way that suggests the tunnel was not built for something this wide.',
      'It charges low, using the ceiling as a brace — a technique no surface brute would know.',
      'It moves in the dark without sound until it is very close and then it is too late for the sound to matter.',
      'The weight of it shakes the floor when it lands.',
    ],
    resistanceProfile: {
      weaknesses: {
        keen: { bonusDamage: 0, description: 'Keen edges find the gaps in thick hide. Critical hits bypass armor.' },
        scorching: { bonusDamage: 3, description: 'Underground adaptation doesn\'t protect against fire. +3 fire damage.' },
      },
      resistances: {
        heavy: { reduction: 0.5, description: 'Adapted underground hide absorbs blunt force. Heavy bonus damage halved.' },
        disrupting: { reduction: 0.5, description: 'Dense brute musculature dampens electric disruption. Electric damage halved.' },
      },
      conditionImmunities: [],
    },
  },

  hollow_remnant_deep: {
    id: 'hollow_remnant_deep',
    name: 'Deep Remnant',
    description: 'A mine worker once. The lamp it carries is a mine-spec headlamp, still functional, still attached. It navigates the tunnels by routes it no longer understands it knows. The viral memory is precise in the Deep — whatever it was doing in these tunnels before, it is still doing it, in the remnant language of the Hollow.',
    hollowType: 'remnant',
    hp: 20,
    maxHp: 20,
    attack: 3,
    defense: 10,
    damage: [2, 6],
    xp: 35,
    critChance: 0.05,
    fleeThreshold: 0.0,
    loot: [
      { itemId: 'bandages', chance: 0.20 },
      { itemId: 'scrap_metal', chance: 0.20 },
      { itemId: 'ammo_22lr', chance: 0.40 },
    ],
    flavorText: [
      'The headlamp casts moving shadows as it turns. For a moment you cannot tell which shadow is real.',
      'It follows its route until you intersect it, then adjusts.',
      'It moves with the muscle memory of someone who spent years in these tunnels.',
      'The lamp has been on for seven years. That\'s what it runs on — whatever CHARON-7 made of the body.',
    ],
    resistanceProfile: {
      weaknesses: {
        disrupting: { bonusDamage: 3, description: 'Residual neural patterns disrupted. +3 damage.' },
      },
      resistances: {},
      conditionImmunities: [],
    },
  },
}

export function getEnemy(id: string): Enemy | undefined {
  return ENEMIES[id]
}
