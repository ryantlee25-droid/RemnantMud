import type { Item } from '@/types/game'

// Keyed by item ID. Game logic always references IDs — never objects directly.
// Value is denominated in .22 LR rounds ("pennies"). Everything costs blood.
export const ITEMS: Record<string, Item> = {

  // ----------------------------------------------------------
  // Weapons
  // ----------------------------------------------------------

  pipe_wrench: {
    id: 'pipe_wrench',
    name: 'Pipe Wrench',
    description: 'Fourteen inches of steel. The jaws are bent from something they were never meant to grip. Heavy enough to end an argument permanently.',
    type: 'weapon',
    weight: 3,
    damage: 3,
    value: 8,
  },

  rebar_club: {
    id: 'rebar_club',
    name: 'Rebar Club',
    description: 'Section of #5 rebar, one end wrapped in electrical tape. Rusts faster than it breaks skulls. Not a fair trade.',
    type: 'weapon',
    weight: 4,
    damage: 4,
    value: 6,
  },

  hatchet: {
    id: 'hatchet',
    name: 'Hatchet',
    description: 'Camp hatchet. Handle replaced once with a hickory dowel. Holds an edge if you bother to keep it. Most people don\'t bother.',
    type: 'weapon',
    weight: 2,
    damage: 4,
    value: 15,
  },

  machete: {
    id: 'machete',
    name: 'Machete',
    description: 'Ontario Knife Co., pre-Collapse. Still has the factory bevel. Whoever owned this took care of it. Now you do.',
    type: 'weapon',
    weight: 2,
    damage: 5,
    value: 25,
  },

  combat_knife: {
    id: 'combat_knife',
    name: 'Combat Knife',
    description: 'Ka-Bar, or close enough. Fixed blade, leather-wrapped handle worn smooth. Fast in close quarters. The people who relied on it are mostly dead, but not from the knife.',
    type: 'weapon',
    weight: 1,
    damage: 3,
    statBonus: { reflex: 1 },
    value: 30,
  },

  hunting_rifle: {
    id: 'hunting_rifle',
    name: 'Hunting Rifle',
    description: 'Remington 700, .308. Scope is a Vortex Crossfire, zero still holds. You can reach out four hundred yards if you know what you\'re doing. Most people don\'t.',
    type: 'weapon',
    weight: 6,
    damage: 8,
    statBonus: { wits: 1 },
    value: 80,
  },

  shotgun_12ga: {
    id: 'shotgun_12ga',
    name: '12-Gauge Shotgun',
    description: 'Mossberg 500, barrel hacksaw-cut to eighteen inches. Pattern spreads fast. Inside thirty feet it doesn\'t need to be accurate.',
    type: 'weapon',
    weight: 5,
    damage: 7,
    value: 60,
  },

  pistol_9mm: {
    id: 'pistol_9mm',
    name: '9mm Pistol',
    description: 'Glock 17, third gen. Finish worn to silver at the rails. Forty-round drum in the mag well is someone\'s field modification. It works until it doesn\'t.',
    type: 'weapon',
    weight: 2,
    damage: 5,
    value: 45,
  },

  crossbow: {
    id: 'crossbow',
    name: 'Crossbow',
    description: 'Recurve limbs salvaged from a sporting-goods ruin, prod bolted to an aluminum stock. Draws at one-fifty pounds. Quiet enough that the thing next to your target won\'t know until after.',
    type: 'weapon',
    weight: 4,
    damage: 6,
    value: 50,
  },

  compound_bow: {
    id: 'compound_bow',
    name: 'Compound Bow',
    description: 'Mathews Traverse, pre-Collapse. Cams still turn clean. Sixty-pound draw. Arrows are recoverable. In a world where every round is currency, that matters.',
    type: 'weapon',
    weight: 3,
    damage: 7,
    value: 70,
  },

  sawn_off_shotgun: {
    id: 'sawn_off_shotgun',
    name: 'Sawn-Off Shotgun',
    description: 'Both barrels cut to eight inches, pistol-grip welded from salvaged pipe. Concealable under a coat. The blast radius is a suggestion you cannot ignore.',
    type: 'weapon',
    weight: 3,
    damage: 8,
    statBonus: { reflex: -1 },
    value: 40,
  },

  signal_flare_gun: {
    id: 'signal_flare_gun',
    name: 'Signal Flare Gun',
    description: 'Orion 12-gauge, bright orange plastic grip. Loaded with a red parachute flare. At range it blinds; direct contact at close quarters sets things on fire. Neither use was intended.',
    type: 'weapon',
    weight: 1,
    damage: 5,
    value: 18,
  },

  // ----------------------------------------------------------
  // Armor
  // ----------------------------------------------------------

  scrap_vest: {
    id: 'scrap_vest',
    name: 'Scrap Vest',
    description: 'Sheet metal panels riveted to a leather work vest. Stops a bite. Slows a blade. A bullet will still ruin your day, but at least you\'ll have a day.',
    type: 'armor',
    weight: 4,
    defense: 2,
    value: 20,
  },

  runners_kit: {
    id: 'runners_kit',
    name: 'Runner\'s Kit',
    description: 'Dark nylon, soft-soled trail shoes, compression sleeves. No hard armor. The protection is not getting seen. Someone who runs these roads professionally put this together.',
    type: 'armor',
    weight: 1,
    defense: 1,
    statBonus: { shadow: 1 },
    value: 35,
  },

  salter_plate: {
    id: 'salter_plate',
    name: 'Salter Plate',
    description: 'Heavy plate carrier with ESAPI inserts and welded steel shoulder guards. Issued kit, modified in the field. You will not be fast in this. You will be alive.',
    type: 'armor',
    weight: 8,
    defense: 4,
    statBonus: { reflex: -1 },
    value: 80,
  },

  drifters_pack: {
    id: 'drifters_pack',
    name: 'Drifter\'s Pack',
    description: 'Osprey 65L, external frame reinforced with PVC conduit. Load-lifter straps adjusted by someone who knew what they were doing. Carries more than it looks like it should.',
    type: 'armor',
    weight: 2,
    defense: 0,
    statBonus: { wits: 1 },
    value: 40,
  },

  reclaimer_goggles: {
    id: 'reclaimer_goggles',
    name: 'Reclaimer Goggles',
    description: 'PVS-14 housing grafted onto a ski goggle frame. Night-vision still functions on one tube. The other is fogged. Fragile in a way that makes you hold your breath walking through doorways.',
    type: 'armor',
    weight: 1,
    defense: 0,
    statBonus: { wits: 2 },
    value: 60,
  },

  scavenger_vest: {
    id: 'scavenger_vest',
    name: 'Scavenger Vest',
    description: 'Photographer\'s vest with every pocket reinforced and re-sewn. Ceramic tile inserts protect the chest. The person who built this spent serious time thinking about dying.',
    type: 'armor',
    weight: 3,
    defense: 2,
    statBonus: { wits: 1 },
    value: 45,
  },

  hazmat_hood: {
    id: 'hazmat_hood',
    name: 'Hazmat Hood',
    description: 'Tyvek hood with a neoprene face seal and replaceable filter cartridge. The filter is not new. It is better than nothing. In CHARON-7 country, that is not a small claim.',
    type: 'armor',
    weight: 1,
    defense: 1,
    statBonus: { grit: 1 },
    value: 55,
  },

  reinforced_boots: {
    id: 'reinforced_boots',
    name: 'Reinforced Boots',
    description: 'Steel-toed Redwings with sheet-metal shin guards bolted to a strap harness. Heavy. The ground out here is broken glass and tetanus. You walk on it or you don\'t walk.',
    type: 'armor',
    weight: 3,
    defense: 1,
    statBonus: { grit: 1 },
    value: 35,
  },

  gas_mask: {
    id: 'gas_mask',
    name: 'Gas Mask',
    description: 'Israeli M15 surplus, twin filter canisters. The rubber has cracked at the temples but the seal still holds under pressure. Wearing it, you breathe chemistry instead of disaster. An improvement.',
    type: 'armor',
    weight: 2,
    defense: 1,
    statBonus: { grit: 2 },
    value: 70,
  },

  // ----------------------------------------------------------
  // Consumables
  // ----------------------------------------------------------

  boiled_rations: {
    id: 'boiled_rations',
    name: 'Boiled Rations',
    description: 'Boiled grain and whatever else was available, compressed into a dense block and wrapped in wax paper. Tastes like sadness.',
    type: 'consumable',
    weight: 1,
    healing: 2,
    value: 3,
  },

  venison_jerky: {
    id: 'venison_jerky',
    name: 'Venison Jerky',
    description: 'Dried and salted in the old way. Whoever made it knew what they were doing. Doesn\'t taste like sadness. That\'s rare.',
    type: 'consumable',
    weight: 1,
    healing: 4,
    value: 8,
  },

  stim_shot: {
    id: 'stim_shot',
    name: 'Stim Shot',
    description: 'Synthetic adrenaline in a press-inject cartridge. Your hands will shake for an hour after. You won\'t care because you\'ll be alive.',
    type: 'consumable',
    weight: 1,
    healing: 0,
    statBonus: { reflex: 2 },
    value: 50,
  },

  antibiotics: {
    id: 'antibiotics',
    name: 'Antibiotics',
    description: 'Broad spectrum. Doxycycline, best guess. Extremely scarce. If you have these, someone somewhere needs them more than you do. That\'s not your problem.',
    type: 'consumable',
    weight: 1,
    healing: 6,
    statBonus: { grit: 1 },
    value: 120,
  },

  purification_tablets: {
    id: 'purification_tablets',
    name: 'Purification Tablets',
    description: 'Sodium hypochlorite tabs, foil-sealed. Drop one in a liter, wait thirty minutes, drink. The aftertaste is chlorine. Better than cholera.',
    type: 'consumable',
    weight: 0,
    value: 5,
  },

  fire_paste: {
    id: 'fire_paste',
    name: 'Fire Paste',
    description: 'Incendiary compound in a squeeze tube — magnesium powder in a petroleum carrier. Apply to a blade or bolt tip. Burns at two thousand degrees for four seconds. Don\'t get any on yourself.',
    type: 'consumable',
    weight: 1,
    value: 25,
  },

  quiet_drops: {
    id: 'quiet_drops',
    name: 'Quiet Drops',
    description: 'Herbal sedative — valerian, hops, something else you can\'t identify. Concentrated. Used for field surgery, or for mercy, depending on the dose. The Shepherds make them.',
    type: 'consumable',
    weight: 1,
    value: 30,
  },

  bandages: {
    id: 'bandages',
    name: 'Bandages',
    description: 'Medical gauze and cohesive wrap, pre-packaged. Slows the bleeding. Not a cure. Better than nothing, which is the highest praise anything earns out here.',
    type: 'consumable',
    weight: 1,
    healing: 3,
    value: 10,
  },

  canned_food: {
    id: 'canned_food',
    name: 'Canned Food',
    description: 'Label gone. Contents unknown. Smells fine. You eat it. The world ended and canned food outlasted almost everything. That\'s either reassuring or depressing.',
    type: 'consumable',
    weight: 1,
    healing: 3,
    value: 5,
  },

  clean_water: {
    id: 'clean_water',
    name: 'Clean Water',
    description: 'A clear. Sealed vessel, verified source. Water you don\'t have to think about before drinking. You forgot how good that felt until the first time you had to think about it.',
    type: 'consumable',
    weight: 2,
    healing: 2,
    value: 8,
  },

  iodine_tabs: {
    id: 'iodine_tabs',
    name: 'Iodine Tablets',
    description: 'Tetraglycine hydroperiodide, foil blister pack. Two tabs per liter, thirty minutes. They turn the water faintly amber and taste like a swimming pool. You drink it anyway.',
    type: 'consumable',
    weight: 0,
    healing: 1,
    value: 6,
  },

  stim_patch: {
    id: 'stim_patch',
    name: 'Stim Patch',
    description: 'Transdermal stimulant on a nitrile backing. Peel, press to the neck, feel the edges come back. Slower than a shot but it lasts longer. Your hands won\'t shake after.',
    type: 'consumable',
    weight: 0,
    healing: 0,
    statBonus: { reflex: 1, wits: 1 },
    value: 35,
  },

  trauma_dressing: {
    id: 'trauma_dressing',
    name: 'Trauma Dressing',
    description: 'Israeli bandage with built-in pressure applicator and hemostatic gauze. The wrapper says 2029. The expiry date has always been a suggestion out here.',
    type: 'consumable',
    weight: 1,
    healing: 6,
    value: 20,
  },

  water_purifier: {
    id: 'water_purifier',
    name: 'Water Purifier',
    description: 'Sawyer Squeeze with a pre-filter sock. Handles a hundred thousand liters before the membrane fails. This one has been used. How much life is left in it, you don\'t know.',
    type: 'consumable',
    weight: 1,
    healing: 0,
    statBonus: { grit: 1 },
    value: 40,
  },

  // ----------------------------------------------------------
  // Key items
  // ----------------------------------------------------------

  bunker_key: {
    id: 'bunker_key',
    name: 'Bunker Key',
    description: 'Heavy stamped steel, the number 7 scratch-etched into the head. Someone wanted to remember which one. Or make sure you wouldn\'t forget.',
    type: 'key',
    weight: 0,
    value: 0,
  },

  access_card: {
    id: 'access_card',
    name: 'Access Card',
    description: 'RFID card in a cracked plastic housing. The photo has faded to a smear. The stripe still reads. Whatever it opens hasn\'t been opened in seven years.',
    type: 'key',
    weight: 0,
    value: 0,
  },

  covenant_sigil: {
    id: 'covenant_sigil',
    name: 'Covenant Sigil',
    description: 'Red Court mark — a stamped disc of surgical steel on a chain. Wearing this in Sanguine territory means they see you before they decide what to do with you. That\'s the best you can hope for.',
    type: 'key',
    weight: 0,
    value: 200,
  },

  transit_pass: {
    id: 'transit_pass',
    name: 'Transit Pass',
    description: 'Laminated card printed with the Accord Waymark seal. Allows passage through checkpoints without inspection. The seal is current-year. Someone with authority issued this recently.',
    type: 'key',
    weight: 0,
    value: 80,
  },

  encrypted_journal: {
    id: 'encrypted_journal',
    name: 'Encrypted Journal',
    description: 'Moleskine with every entry written in a personal cipher. The handwriting is meticulous. Someone was recording something they did not want anyone else to read. They may not have had the chance to burn it.',
    type: 'key',
    weight: 1,
    value: 150,
  },

  signal_beacon: {
    id: 'signal_beacon',
    name: 'Signal Beacon',
    description: 'ACR ResQLink, pre-Collapse. The GPS transmits on 406 MHz to satellites that still respond. Activating it tells someone your position. Whether that someone is a rescue party or something else depends on who is listening.',
    type: 'key',
    weight: 1,
    value: 200,
  },

  charon_sample: {
    id: 'charon_sample',
    name: 'CHARON-7 Sample',
    description: 'Sealed bio-containment vial, hazard-striped, refrigerant pack long dead. Inside, a suspension that has altered everything it touched. Three factions want this. None of them for reasons you should trust.',
    type: 'key',
    weight: 1,
    value: 500,
  },

  // ----------------------------------------------------------
  // Junk / trade goods
  // ----------------------------------------------------------

  copper_wire: {
    id: 'copper_wire',
    name: 'Copper Wire',
    description: 'Coil of stripped 12-gauge from a gutted house. Reclaimers want it. Enough of it and you can barter for almost anything that runs on electricity, which is less than you\'d think.',
    type: 'junk',
    weight: 1,
    value: 8,
  },

  scrap_metal: {
    id: 'scrap_metal',
    name: 'Scrap Metal',
    description: 'Rebar offcuts and sheet steel, bundled with wire. Heavy. Every settlement wants it. Nobody wants to carry it.',
    type: 'junk',
    weight: 3,
    value: 5,
  },

  ammo_22lr: {
    id: 'ammo_22lr',
    name: '.22 LR Rounds',
    description: 'The penny of the post-Collapse. Small, light, everywhere. Nobody respects them until they\'re the last thing you have.',
    type: 'junk',
    weight: 0,
    value: 1,
  },

  ammo_9mm: {
    id: 'ammo_9mm',
    name: '9mm Rounds',
    description: 'Nines. Worth more than pennies, less than a meal. A box of fifty is a serious transaction. A single round found on a body means someone ran out.',
    type: 'junk',
    weight: 0,
    value: 4,
  },

  corroded_battery: {
    id: 'corroded_battery',
    name: 'Corroded Battery',
    description: 'D-cell, leaked white crust at both terminals. Might hold enough charge to run a radio for twenty minutes. Might not. Only one way to find out.',
    type: 'junk',
    weight: 0,
    value: 2,
  },

  cracked_scope: {
    id: 'cracked_scope',
    name: 'Cracked Scope',
    description: 'Leupold VX-3, the objective lens spider-webbed from an impact that also bent the turret. Cannot hold zero. The glass and the housing are still worth something to a Reclaimer.',
    type: 'junk',
    weight: 1,
    value: 10,
  },

  copper_wire_coil: {
    id: 'copper_wire_coil',
    name: 'Copper Wire Coil',
    description: 'Twenty meters of solid 14-gauge stripped from a junction box. Tight coil, no kinks. The insulation is intact. Reclaimers and tinkerers will fight over this.',
    type: 'junk',
    weight: 2,
    value: 15,
  },

  glass_vial: {
    id: 'glass_vial',
    name: 'Glass Vial',
    description: 'Borosilicate lab vial, threaded cap, empty and sterile. Worth almost nothing to most people. Worth a lot to the right people.',
    type: 'junk',
    weight: 0,
    value: 7,
  },
}

export function getItem(id: string): Item | undefined {
  return ITEMS[id]
}

export function getAllItems(): Item[] {
  return Object.values(ITEMS)
}
