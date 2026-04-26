import type { Item } from '@/types/game'

// Keyed by item ID. Game logic always references IDs — never objects directly.
// Value is denominated in .22 LR rounds ("pennies"). Everything costs blood.
export const ITEMS: Record<string, Item> = {

  // ----------------------------------------------------------
  // Currency / Ammunition
  // ----------------------------------------------------------

  ammo_22lr: {
    id: 'ammo_22lr',
    name: '.22 LR Rounds',
    description: 'The penny of the post-Collapse. Small, light, everywhere. Nobody respects them until they\'re the last thing you have.',
    type: 'currency',
    weight: 0,
    value: 1,
    rarity: 'common',
  },

  ammo_9mm: {
    id: 'ammo_9mm',
    name: '9mm Rounds',
    description: 'Nines. Worth more than pennies, less than a meal. A box of fifty is a serious transaction. A single round found on a body means someone ran out.',
    type: 'currency',
    weight: 0,
    value: 3,
    rarity: 'common',
  },

  ammo_shotgun_shell: {
    id: 'ammo_shotgun_shell',
    name: 'Shotgun Shell',
    description: 'Standard 12-gauge, #00 buckshot. The weight of it in your hand is the weight of a decision made in advance.',
    type: 'currency',
    weight: 0,
    value: 4,
    rarity: 'common',
  },

  // ----------------------------------------------------------
  // Weapons — Melee
  // ----------------------------------------------------------

  pipe_wrench: {
    id: 'pipe_wrench',
    name: 'Pipe Wrench',
    description: 'Fourteen inches of steel. The jaws are bent from something they were never meant to grip. Heavy enough to end an argument permanently. [Heavy]',
    type: 'weapon',
    weight: 3,
    damage: 3,
    value: 5,
    weaponTraits: ['heavy'],
    tier: 1,
    rarity: 'common',
  },

  hatchet: {
    id: 'hatchet',
    name: 'Hatchet',
    description: 'Camp hatchet. Handle replaced once with a hickory dowel. Holds an edge if you bother to keep it. Most people don\'t bother. [Vicious]',
    type: 'weapon',
    weight: 2,
    damage: 4,
    value: 8,
    weaponTraits: ['vicious'],
    tier: 1,
    rarity: 'uncommon',
  },

  combat_knife: {
    id: 'combat_knife',
    name: 'Combat Knife',
    description: 'Good balance, seven-inch fixed blade. Fast in close quarters. The people who relied on this are mostly dead, but not from the knife. [Keen, Quick]',
    type: 'weapon',
    weight: 1,
    damage: 4,
    value: 12,
    weaponTraits: ['keen', 'quick'],
    tier: 2,
    rarity: 'uncommon',
  },

  machete: {
    id: 'machete',
    name: 'Machete',
    description: 'Ontario Knife Co., pre-Collapse. Reach, clearance, and authority. Still has the factory bevel. Whoever owned this took care of it. Now you do. [Keen, Vicious]',
    type: 'weapon',
    weight: 2,
    damage: 5,
    value: 15,
    weaponTraits: ['keen', 'vicious'],
    tier: 2,
    rarity: 'uncommon',
  },

  silver_knife: {
    id: 'silver_knife',
    name: 'Silver Knife',
    description: 'Eight-inch blade. The alloy is real — somebody went to serious effort. Against ordinary threats it\'s a good knife. Against Sanguine, nobody argues about why it works. It just does. [Blessed, Keen]',
    type: 'weapon',
    weight: 1,
    damage: 6,
    value: 80,
    usable: false,
    weaponTraits: ['blessed', 'keen'],
    tier: 5,
    rarity: 'epic',
  },

  // ----------------------------------------------------------
  // Weapons — Ranged
  // ----------------------------------------------------------

  hunting_rifle_damaged: {
    id: 'hunting_rifle_damaged',
    name: 'Hunting Rifle (Damaged)',
    description: 'Bolt-action, cracked stock wrapped tight with electrical tape. The barrel is true but the stock flex makes follow-up shots slow. Functional. Not reliable. [Precise]',
    type: 'weapon',
    weight: 5,
    damage: 8,
    value: 20,
    weaponTraits: ['precise'],
    tier: 2,
    rarity: 'epic',
  },

  '22_rifle': {
    id: '22_rifle',
    name: '.22 Rifle',
    description: 'Ruger 10/22. Reliable in the way that only common, simple things can be. Accepts the most common ammunition in the region. Not glamorous. Still alive. [Quick, Silenced]',
    type: 'weapon',
    weight: 4,
    damage: 6,
    value: 35,
    weaponTraits: ['quick', 'silenced'],
    tier: 3,
    rarity: 'rare',
  },

  '9mm_pistol': {
    id: '9mm_pistol',
    name: '9mm Pistol',
    description: 'Standard sidearm. Glock 17, finish worn silver at the rails. Forty-round drum in the mag well is someone\'s field modification. It works until it doesn\'t. [Precise, Quick]',
    type: 'weapon',
    weight: 2,
    damage: 7,
    value: 45,
    weaponTraits: ['precise', 'quick'],
    tier: 3,
    rarity: 'rare',
  },

  shotgun: {
    id: 'shotgun',
    name: 'Shotgun',
    description: 'Mossberg 500, barrel cut to eighteen inches. Inside thirty feet it doesn\'t need to be accurate. Outside thirty feet, you\'re holding a very heavy club. [Heavy, Vicious]',
    type: 'weapon',
    weight: 5,
    damage: 12,
    value: 60,
    weaponTraits: ['heavy', 'vicious'],
    tier: 4,
    rarity: 'legendary',
  },

  // ----------------------------------------------------------
  // Medical
  // ----------------------------------------------------------

  bandages: {
    id: 'bandages',
    name: 'Bandages',
    description: 'Medical gauze and cohesive wrap, pre-packaged. Slows the bleeding. Not a cure. Better than nothing, which is the highest praise anything earns out here.',
    type: 'consumable',
    weight: 1,
    healing: 4,
    value: 8,
    usable: true,
    useText: 'You wrap the wound tight. The bleeding slows.',
    rarity: 'common',
  },

  antibiotics_01: {
    id: 'antibiotics_01',
    name: 'Antibiotics',
    description: 'Broad-spectrum. Doxycycline, best guess. Extremely scarce. The infections that kill you in this world aren\'t always the ones with teeth.',
    type: 'consumable',
    weight: 1,
    value: 50,
    usable: true,
    useText: 'You take the dose. The fever breaks over the next few hours.',
    rarity: 'common',
  },

  quiet_drops: {
    id: 'quiet_drops',
    name: 'Quiet Drops',
    description: 'A sedative compound — valerian, something synthetic, something else. Concentrated enough to damp a Hollow\'s predatory response if introduced correctly. The Shepherds make them. The Drifters trade them.',
    type: 'consumable',
    weight: 1,
    value: 30,
    usable: true,
    useText: 'The tension in the air shifts. Something that was paying attention to you stops.',
    rarity: 'common',
  },

  stim_shot: {
    id: 'stim_shot',
    name: 'Stim Shot',
    description: 'Synthetic adrenaline in a press-inject cartridge. Your hands will shake for an hour after. You won\'t care because you\'ll be alive.',
    type: 'consumable',
    weight: 1,
    value: 40,
    usable: true,
    statBonus: { grit: 3 },
    useText: 'The world sharpens at the edges. Everything is very clear and very fast.',
    rarity: 'uncommon',
  },

  field_surgery_kit: {
    id: 'field_surgery_kit',
    name: 'Field Surgery Kit',
    description: 'Sealed canvas roll: hemostatic gauze, retractors, needle driver, suture thread, forceps, irrigation syringe. Heavy. If you need what\'s in here, you\'ll be glad it\'s heavy.',
    type: 'consumable',
    weight: 3,
    healing: 15,
    value: 100,
    usable: true,
    useText: 'The work is slow and hurts. When it\'s done, the wound is closed and clean.',
    rarity: 'uncommon',
  },

  // ----------------------------------------------------------
  // Food and Water
  // ----------------------------------------------------------

  boiled_rations: {
    id: 'boiled_rations',
    name: 'Boiled Rations',
    description: 'Boiled grain and whatever else was available, compressed into a dense block and wrapped in wax paper. Tastes like endurance. Not sadness. There\'s a difference.',
    type: 'consumable',
    weight: 1,
    healing: 2,
    value: 4,
    usable: true,
    useText: 'You eat. The cold settles out of your bones a fraction.',
    rarity: 'common',
  },

  elk_jerky: {
    id: 'elk_jerky',
    name: 'Elk Jerky',
    description: 'Dried and salted in the old way. Someone knew what they were doing. It tastes like something that was once alive and cared for. That\'s rare.',
    type: 'consumable',
    weight: 1,
    healing: 3,
    rarity: 'common',
    value: 6,
    usable: true,
    useText: 'You eat. It is good. You allow yourself to register that it is good.',
  },

  water_bottle_sealed: {
    id: 'water_bottle_sealed',
    name: 'Sealed Water Bottle',
    description: 'A clear bottle. Sealed, verified source. Water you don\'t have to think about before drinking. You forgot how good that felt until the first time you had to think about it.',
    type: 'consumable',
    weight: 2,
    healing: 2,
    value: 4,
    usable: true,
    useText: 'You drink. Clean. Cold. The thirst recedes.',
    rarity: 'common',
  },

  purification_tabs: {
    id: 'purification_tabs',
    name: 'Purification Tablets',
    description: 'Sodium hypochlorite tabs, foil-sealed. Drop one in a liter, wait thirty minutes, drink. The aftertaste is chlorine. Better than cholera by every meaningful measure.',
    type: 'consumable',
    weight: 0,
    value: 10,
    usable: true,
    useText: 'You treat the water. Thirty minutes to safety. You wait.',
    rarity: 'common',
  },

  sanguine_blood_vial: {
    id: 'sanguine_blood_vial',
    name: 'Sanguine Blood Vial',
    description: 'Red gold. One sealed vial of Sanguine blood in a glass ampule with a rubber stopper. Accelerated healing, heightened senses, reduced fear response — for a few hours. The dependency risk is real and nobody talks about that part.',
    type: 'consumable',
    weight: 0,
    healing: 10,
    value: 100,
    usable: true,
    useText: 'The warmth spreads from the injection site outward. Everything is brighter. You feel the edge before you were supposed to feel it.',
    rarity: 'uncommon',
  },

  // ----------------------------------------------------------
  // Junk / Scavenging
  // ----------------------------------------------------------

  scrap_metal: {
    id: 'scrap_metal',
    name: 'Scrap Metal',
    description: 'Rebar offcuts and sheet steel, bundled with wire. Heavy. Every settlement wants it. Nobody wants to carry it.',
    type: 'junk',
    weight: 3,
    value: 2,
    rarity: 'common',
  },

  textiles: {
    id: 'textiles',
    name: 'Textiles',
    description: 'Bolt cloth — denim, canvas, synthetic fleece, whatever survived. Bandages, insulation, trade. The most useful thing is usually the softest.',
    type: 'junk',
    weight: 2,
    value: 3,
    rarity: 'common',
  },

  electronics_salvage: {
    id: 'electronics_salvage',
    name: 'Electronics Salvage',
    description: 'Circuit boards, capacitors, stripped cable, component lots. The Reclaimers want all of it. The price fluctuates with whatever they\'re currently building.',
    type: 'junk',
    weight: 1,
    value: 8,
    rarity: 'common',
  },

  chemicals_basic: {
    id: 'chemicals_basic',
    name: 'Basic Chemicals',
    description: 'Bleach, acetone, isopropyl, lye. Industrial quantities, partial containers. Useful to people who know what they\'re doing. Dangerous to people who think they do.',
    type: 'junk',
    weight: 2,
    value: 5,
    rarity: 'common',
  },

  wire_coil: {
    id: 'wire_coil',
    name: 'Wire Coil',
    description: 'Twenty meters of solid 14-gauge stripped from a junction box. Tight coil, no kinks. Insulation intact. Reclaimers and tinkerers will compete for this.',
    type: 'junk',
    weight: 1,
    value: 4,
    rarity: 'common',
  },

  juniper_firewood: {
    id: 'juniper_firewood',
    name: 'Juniper Firewood',
    description: 'A bundle of juniper, dried and split. Burns clean and long, smells like something the world used to be. Worth almost nothing. Worth everything on a cold night.',
    type: 'junk',
    weight: 3,
    value: 1,
    rarity: 'common',
  },

  river_stone_flat: {
    id: 'river_stone_flat',
    name: 'Flat River Stone',
    description: 'Palm-sized, smooth from the Animas. Makes a decent honing surface in a pinch. Otherwise trades as a joke among Drifters. Sometimes jokes are worth something.',
    type: 'junk',
    weight: 1,
    value: 1,
    rarity: 'common',
  },

  // ----------------------------------------------------------
  // Key Items
  // ----------------------------------------------------------

  meridian_keycard: {
    id: 'meridian_keycard',
    name: 'MERIDIAN Keycard',
    description: 'Black RFID card, no photo, no name, no agency markings. The stripe is military-grade. The facility it opens has been officially demolished for seven years.',
    type: 'key',
    weight: 0,
    value: 0,
    rarity: 'epic',
  },

  courthouse_archive_key: {
    id: 'courthouse_archive_key',
    name: 'Courthouse Archive Key',
    description: 'A brass key worn smooth by decades of use. The tag reads ARCHIVE, hand-lettered in a careful pre-Collapse hand. Covenant\'s record-keepers handed down this key through three Marshals.',
    type: 'key',
    weight: 0,
    value: 0,
    rarity: 'rare',
  },

  cold_storage_key: {
    id: 'cold_storage_key',
    name: 'Cold Storage Key',
    description: 'An industrial cylinder key on a loop of wire, the word COLD scratched into the bow. The Stacks ran a walk-in freezer in their research wing; this is what opens it.',
    type: 'key',
    weight: 0,
    value: 0,
    rarity: 'rare',
  },

  red_court_key: {
    id: 'red_court_key',
    name: 'Red Court Key',
    description: 'A key stamped with the Red Court seal — a blood drop over a crown. Authorizes access to the Pens\' inner administration and research wings. Possession implies trust, or theft, or both.',
    type: 'key',
    weight: 0,
    value: 0,
    rarity: 'rare',
  },

  bunker_access_badge: {
    id: 'bunker_access_badge',
    name: 'Bunker Access Badge',
    description: 'Laminated badge, Salter-issue, the inner-vault authorization code printed in the corner in font too small to read without effort. Someone in the stronghold lost this.',
    type: 'key',
    weight: 0,
    value: 0,
    rarity: 'rare',
  },

  deep_mine_rope: {
    id: 'deep_mine_rope',
    name: 'Deep Mine Rope',
    description: 'Sixty-foot static kern-mantle, rated to eight hundred pounds. The vertical shaft in The Deep doesn\'t offer another way down. This is the way down.',
    type: 'key',
    weight: 4,
    value: 0,
    rarity: 'rare',
  },

  sanguine_biometric_slide: {
    id: 'sanguine_biometric_slide',
    name: 'Sanguine Biometric Slide',
    description: 'A slim translucent slide keyed to Vesper\'s genetic authority. The Covenant of Dusk\'s biometric clearance in physical form. Cold to the touch in a way that isn\'t temperature.',
    type: 'key',
    weight: 0,
    value: 0,
    rarity: 'rare',
  },

  purified_stims: {
    id: 'purified_stims',
    name: 'Purified Stims',
    description: 'Military-grade stimulant compound, Patch\'s formulation. Cleaner than the standard waste-circuit product. The vial is labeled in a cramped shorthand that only Patch can read.',
    type: 'consumable',
    weight: 0,
    value: 15,
    usable: true,
    useText: 'The stim hits fast and clean — no edge shake, no crash taste. You feel more alert than circumstances warrant. You can work with that.',
    rarity: 'common',
  },

  // ----------------------------------------------------------
  // Lore Items — Crossroads
  // ----------------------------------------------------------

  discarded_flyer: {
    id: 'discarded_flyer',
    name: 'Discarded Flyer',
    description: 'A hand-printed broadsheet, smeared ink on salvaged paper.',
    type: 'lore',
    weight: 0,
    value: 0,
    usable: true,
    loreText: 'CROSSROADS ACCORD — THIRD AMENDMENT. No firearms in the trading circle. No unchecked wounds in the medical tent. No one gets run out without a hearing. Signed, the Drifter Council, Spring 2037. Someone has crossed out "Council" and written "nobody" above it.',
    rarity: 'uncommon',
  },

  torn_note_fragment: {
    id: 'torn_note_fragment',
    name: 'Torn Note Fragment',
    description: 'Half a page, torn at an angle that removes the most important part.',
    type: 'lore',
    weight: 0,
    value: 0,
    usable: true,
    loreText: '...if you find this before the Salters do, the cache is under the third merchant stall from the east gate, under the floorboards. Take the medicals and leave the — [TORN]. Whatever was under that flap of paper, it\'s gone.',
    rarity: 'uncommon',
  },

  // ----------------------------------------------------------
  // Lore Items — River Road
  // ----------------------------------------------------------

  letter_to_sister: {
    id: 'letter_to_sister',
    name: 'Letter to Sister',
    description: 'A personal letter, unsealed, found at a roadside camp.',
    type: 'lore',
    weight: 0,
    value: 0,
    usable: true,
    loreText: 'Sarah — I made it past the crossing. Howard\'s bridge is real. The man who built it is real too, which I didn\'t expect. He asked me if I came from the east and when I said yes he got quiet and offered me extra food without explaining why. I think he\'s waiting for someone. I didn\'t ask. I\'m writing this so if I don\'t make it to the Covenant, somebody finds this and knows I got this far. Love, Mae.',
    rarity: 'uncommon',
  },

  truck_dashboard_note: {
    id: 'truck_dashboard_note',
    name: 'Truck Dashboard Note',
    description: 'A note tucked behind a sun-cracked sun visor in an abandoned pickup.',
    type: 'lore',
    weight: 0,
    value: 0,
    usable: true,
    loreText: 'Gas gauge broke in \'33. The actual empty is two ticks below the E. I am writing this so you stop running out on the flats. Also the radio only gets AM now. There is one broadcast worth hearing. You\'ll know it when you find it.',
    rarity: 'uncommon',
  },

  border_patrol_log: {
    id: 'border_patrol_log',
    name: 'Border Patrol Log',
    description: 'A water-damaged patrol log from the early weeks of the Collapse.',
    type: 'lore',
    weight: 0,
    value: 0,
    usable: true,
    loreText: 'Day 11. Three more CDC vehicles on the northern road, military escort, heading toward the Scar site. We were told not to stop them. Sergeant Ramos asked why. No one answered. Day 14. The CDC vehicles have not come back south. We have been told to stop logging movement at this checkpoint effective immediately. This is the last entry. — Officer T. Whitfield, NMSP.',
    rarity: 'uncommon',
  },

  // ----------------------------------------------------------
  // Lore Items — Covenant
  // ----------------------------------------------------------

  accord_charter_copy: {
    id: 'accord_charter_copy',
    name: 'Accord Charter Copy',
    description: 'A photocopied settlement charter, heavily annotated in the margins.',
    type: 'lore',
    weight: 0,
    value: 0,
    usable: true,
    loreText: 'Article IV: No citizen of the Accord shall be expelled without a hearing before the full council. Article V: The medical stores are communal property. No individual faction may withhold medicine from any resident in need. The margin annotation reads: Cross pushed this through over Salter objection in \'36. Cost her two votes and she didn\'t flinch.',
    rarity: 'uncommon',
  },

  cross_personal_journal_page: {
    id: 'cross_personal_journal_page',
    name: 'Cross\'s Journal Page',
    description: 'A single torn page from a personal journal, the handwriting compact and precise.',
    type: 'lore',
    weight: 0,
    value: 0,
    usable: true,
    loreText: 'I think about the radio signal more than I should. Sparks says it\'s MERIDIAN. The Reclaimers say MERIDIAN was destroyed. The Salters say the same thing Briggs does. The problem is Briggs was there. He was perimeter security. He says it was destroyed and I believe he believes that. I don\'t think he knows what he helped cover up.',
    rarity: 'uncommon',
  },

  chapel_memorial_book: {
    id: 'chapel_memorial_book',
    name: 'Chapel Memorial Book',
    description: 'A handmade book of names, maintained by Covenant residents.',
    type: 'lore',
    weight: 1,
    value: 0,
    usable: true,
    loreText: 'The names fill twelve pages. Each entry has a date, a brief note, and a small pressed flower or leaf. The last entry reads: Tomás Rael, age 71. Died peacefully. He planted the east garden. He taught three people to make bread. He was kind. That is enough.',
    rarity: 'uncommon',
  },

  granary_theft_note: {
    id: 'granary_theft_note',
    name: 'Granary Theft Note',
    description: 'A note pinned inside the granary door, addressed to no one in particular.',
    type: 'lore',
    weight: 0,
    value: 0,
    usable: true,
    loreText: 'To whoever took the rye seed stock on the 12th — I know it was you. I know you have people who are hungry. I would have given it to you if you had asked. The fact that you didn\'t ask means something, and I am not sure it means what you think it means. The seed is not coming back. Neither is the trust. — Marta.',
    rarity: 'uncommon',
  },

  // ----------------------------------------------------------
  // Lore Items — Salt Creek
  // ----------------------------------------------------------

  briggs_military_orders: {
    id: 'briggs_military_orders',
    name: 'Briggs\' Military Orders',
    description: 'A laminated sheet of military orders, creased with years of folding and unfolding.',
    type: 'lore',
    weight: 0,
    value: 0,
    usable: true,
    loreText: 'CLASSIFIED — PERIMETER SECURITY ROTATION, MERIDIAN SITE. Sergeant Briggs assigned to outer perimeter, Section C. NO ENTRY into the facility structure without Level 4 clearance. In the event of detonation order: withdraw to safe distance, do not re-enter, do not engage survivors. The word "survivors" has been underlined by hand, years after the order was written.',
    rarity: 'uncommon',
  },

  meridian_perimeter_memo: {
    id: 'meridian_perimeter_memo',
    name: 'MERIDIAN Perimeter Memo',
    description: 'An internal military memo, partially redacted with black marker.',
    type: 'lore',
    weight: 0,
    value: 0,
    usable: true,
    loreText: 'RE: Perimeter Security Rotation, MERIDIAN. Effective [REDACTED], all civilian access to the facility is hereby terminated. The public cover story is [REDACTED]. Personnel with knowledge of the [REDACTED] program are advised that their NDAs are enforceable under the Emergency Powers Act. The facility did not have a [REDACTED] accident. The facility had a [REDACTED]. Those are different things.',
    rarity: 'uncommon',
  },

  salters_manifesto: {
    id: 'salters_manifesto',
    name: 'Salters\' Manifesto',
    description: 'A printed pamphlet, distributed to Salter soldiers, stapled and worn.',
    type: 'lore',
    weight: 0,
    value: 0,
    usable: true,
    loreText: 'What we are: the last professional military force in the Four Corners. What we do: protect the living from everything that wants them dead. What we don\'t do: negotiate with Sanguine. Treat. Coexist. The Accord calls this "hardline." We call it "looking at what those things actually are." — Warlord Briggs, Salt Creek Compact, 2036.',
    rarity: 'uncommon',
  },

  bombing_site_notes: {
    id: 'bombing_site_notes',
    name: 'Bombing Site Notes',
    description: 'A water-damaged field notebook, pages stiff with crater residue. The entries are tactical observations from someone at the perimeter during the bombing.',
    type: 'lore',
    weight: 0,
    value: 0,
    usable: true,
    loreText: 'DAY 1. 0340 hrs. Strike confirmed. Surface structures destroyed. Per protocol: no re-entry. DAY 1. 1200 hrs. Facility power still active — thermal signature unchanged. Structure intact below grade. DAY 2. Command told us to file it as destroyed and move out. The power readings contradict this. Nobody in my chain wants to hear it. DAY 3. Three names in the roll call are wrong — two soldiers on perimeter acknowledged they saw movement after the strike. They have been reassigned. I am writing this down because this did not happen the way the report says it happened. — Sgt. D. Briggs, USMC, MERIDIAN perimeter detail.',
    rarity: 'uncommon',
  },

  commanders_notes: {
    id: 'commanders_notes',
    name: "Commander's Notes",
    description: 'A folded set of deployment orders and field notes, kept in Briggs\'s vest for years. The paper is worn at the creases.',
    type: 'key',
    weight: 0,
    value: 0,
    usable: true,
    loreText: 'OPERATION MERIDIAN SEAL — CLASSIFIED. Unit: 3rd Battalion, B Company, Perimeter Security Command. Issued: 14 October 2031. Objective: Maintain outer perimeter, prevent civilian re-entry, confirm detonation coverage. Actual outcome: [Handwritten margin] The facility is intact. I watched it happen. The bombs hit the surface. The bunker survived. I was ordered not to report the power signature. I am keeping this in case someone needs to know it was real. — Major D. Briggs.',
    rarity: 'rare',
  },

  // ----------------------------------------------------------
  // Lore Items — The Ember
  // ----------------------------------------------------------

  kindling_founders_journal: {
    id: 'kindling_founders_journal',
    name: 'Kindling Founder\'s Journal',
    description: 'A hand-bound journal hidden beneath the chapel\'s altar stone.',
    type: 'lore',
    weight: 1,
    value: 0,
    usable: true,
    loreText: 'I did not intend to found anything. I intended to survive. The fire was warmth first and then meaning and then something I cannot stop. What Harrow is doing with it now — the experiments, the controlled burns, the survival rate climbing — I don\'t know if I made this or if CHARON-7 made this through me. I don\'t think there is a difference anymore. — First Kindler, name burned out.',
    rarity: 'uncommon',
  },

  harrow_sermon_notes: {
    id: 'harrow_sermon_notes',
    name: 'Harrow\'s Sermon Notes',
    description: 'Handwritten sermon notes, the margins dense with revisions.',
    type: 'lore',
    weight: 0,
    value: 0,
    usable: true,
    loreText: 'Key point: the survival rate is the revelation, not the fire itself. 67% survive the purification. 67% of those show resistance markers we cannot fully explain. The Reclaimers call this "epigenetic priming." I call it election. The language matters less than the fact: we are selecting for something. Whether it selected us first is the question I pray about.',
    rarity: 'uncommon',
  },

  purification_survivor_account: {
    id: 'purification_survivor_account',
    name: 'Purification Survivor Account',
    description: 'A first-person account written in an unsteady hand, the paper scorched at the edges.',
    type: 'lore',
    weight: 0,
    value: 0,
    usable: true,
    loreText: 'I went in because my brother went in. He came out different — not bad different, just more. I came out and I couldn\'t explain it either. The Hollow at the perimeter that night didn\'t react to us when we walked past them. Three people watched it happen. Harrow won\'t tell me what it means. I don\'t think he knows either and that scares me more than the fire.',
    rarity: 'uncommon',
  },

  crypt_inscription: {
    id: 'crypt_inscription',
    name: 'Crypt Inscription',
    description: 'Words carved into the stone wall of the chapel crypt, rough letters a foot high.',
    type: 'lore',
    weight: 0,
    value: 0,
    usable: true,
    loreText: 'WE WERE HERE. WE ENDURED. THE FIRE KNEW US. Anyone who reads this in a year or ten years or a hundred — we tried. We built something in the ruin. We fed people. We buried our dead with their names. That is not nothing. That is everything. — The Kindling, Year 4.',
    rarity: 'uncommon',
  },

  // ----------------------------------------------------------
  // Lore Items — The Breaks
  // ----------------------------------------------------------

  canyon_graffiti_log: {
    id: 'canyon_graffiti_log',
    name: 'Canyon Graffiti Log',
    description: 'A small notebook documenting graffiti found across the canyon walls.',
    type: 'lore',
    weight: 0,
    value: 0,
    usable: true,
    loreText: 'Page 1: ARIA WAS HERE 2032. Page 2: RED COURT — TURN BACK. Page 3 (new hand): Red Court hasn\'t been in this canyon in two years. Whoever put that up is either old intel or a liar. Page 7: something written in a language I don\'t recognize, maybe Diné, maybe something else. The letters are careful. Whoever wrote them wanted them to last.',
    rarity: 'uncommon',
  },

  feral_hunters_note: {
    id: 'feral_hunters_note',
    name: 'Feral Hunter\'s Note',
    description: 'A note left in the notch of a canyon wall, pinned with a copper spike.',
    type: 'lore',
    weight: 0,
    value: 0,
    usable: true,
    loreText: 'If you are reading this you survived the drop. Good. There are three Sanguine Ferals in the canyon below — not Red Court, Feral, which means no coordination but also no restraint. They move at night. They do not use the main trail. I lost two people finding this out. I am writing it down so you don\'t have to find it out the same way. — Drifter scout, unnamed.',
    rarity: 'uncommon',
  },

  lucid_safe_house_message: {
    id: 'lucid_safe_house_message',
    name: 'Lucid Safe House Message',
    description: 'A message scratched into a metal plate, hidden under a cairn.',
    type: 'lore',
    weight: 0,
    value: 0,
    usable: true,
    loreText: 'To any Lucid reading this: the safe house at the lower canyon is compromised. Red Court found it in autumn. Dr. Osei has moved. The new location is in the signal — you know which signal. Listen for the second tone. She is still working. She needs samples from the new Hollow variant — the ones that don\'t aggregate. If you can help, she will know what to do with it.',
    rarity: 'uncommon',
  },

  // ----------------------------------------------------------
  // Lore Items — The Dust
  // ----------------------------------------------------------

  ghost_town_diary: {
    id: 'ghost_town_diary',
    name: 'Ghost Town Diary',
    description: 'A hardcover diary, the binding cracked, found in the ruins of a gas station.',
    type: 'lore',
    weight: 1,
    value: 0,
    usable: true,
    loreText: 'Oct 3, 2031. Third day with no contact from the highway patrol. The radio has stopped giving anything useful. There are six of us left in town. We have enough food for two weeks if we ration. Sandra says we should go south. I think south is the problem. Something big moved through the Dust last night and it didn\'t move like anything I\'ve seen. I\'m staying indoors tomorrow. I\'m writing this in case tomorrow is the last tomorrow.',
    rarity: 'uncommon',
  },

  hardware_store_invoice_2031: {
    id: 'hardware_store_invoice_2031',
    name: 'Hardware Store Invoice, 2031',
    description: 'A printed invoice from a hardware store, dated early 2031.',
    type: 'lore',
    weight: 0,
    value: 0,
    usable: true,
    loreText: 'Customer: T. Harrow. Items: 40lb concrete mix x10, rebar #5 x30, sheet steel 4\'x8\' x6, hinges (heavy-duty) x12, padlocks (keyed alike) x8. Payment: cash. Note: customer asked whether the store had any more lye. We didn\'t. He said he\'d find some. This was March 2031, two weeks before the Collapse. Make of that what you will.',
    rarity: 'uncommon',
  },

  water_tower_log: {
    id: 'water_tower_log',
    name: 'Water Tower Log',
    description: 'A maintenance log from the town water tower, the final entries written in a shaking hand.',
    type: 'lore',
    weight: 0,
    value: 0,
    usable: true,
    loreText: 'Last service: August 2031. Chlorinator cartridge replaced. Pump functioning. Pressure nominal. Final entry, November 2031: contamination detected, source unknown, chemical signature not matching any known pollutant. Recommend boiling until further analysis. Further analysis never came. If you\'re drinking from the ground water here — boil it.',
    rarity: 'uncommon',
  },

  radio_tower_broadcast_notes: {
    id: 'radio_tower_broadcast_notes',
    name: 'Radio Tower Broadcast Notes',
    description: 'A technician\'s notepad, found at the base of the town radio tower.',
    type: 'lore',
    weight: 0,
    value: 0,
    usable: true,
    loreText: 'The signal is coming from somewhere in the mountains. Not random — structured. I\'ve been listening for three months. There is a repeating sequence of five tones. Each recurrence introduces a variation. It is a message. Someone is encoding information in the pattern. I don\'t have the key. I think the key is somewhere near the Scar site. I think the signal is a call for someone who already knows what it means.',
    rarity: 'uncommon',
  },

  // ----------------------------------------------------------
  // Lore Items — The Stacks
  // ----------------------------------------------------------

  charon7_analysis_summary: {
    id: 'charon7_analysis_summary',
    name: 'CHARON-7 Analysis Summary',
    description: 'A Reclaimer research document, dense with technical notation.',
    type: 'lore',
    weight: 0,
    value: 0,
    usable: true,
    loreText: 'CHARON-7 is not a weaponized pathogen in any conventional sense. It is an optimization protocol delivered by a viral vector. The Hollow represent failed optimization — the prefrontal cortex degradation was not the intended outcome. The Sanguine represent successful optimization. The Revenant phenomenon suggests a third expression we have not yet characterized. All three share a common root instruction set. Someone designed this with a goal. The goal was not the Hollow.',
    rarity: 'uncommon',
  },

  revenant_study_notes: {
    id: 'revenant_study_notes',
    name: 'Revenant Study Notes',
    description: 'Lev\'s personal research notes, annotated in two different inks.',
    type: 'lore',
    weight: 0,
    value: 0,
    usable: true,
    loreText: 'Subject R-7 (cycle 3): skill retention at 65% physical, 28% cognitive — within predicted range. Subject R-12 (cycle 8): retention at 78% across all categories. Anomalous. The standard degradation model does not account for this. Either the model is wrong or R-12 is different. The third ink, added later: R-12 is you. If you\'re reading this you found the archive. We should talk.',
    rarity: 'uncommon',
  },

  meridian_keycard_acquisition_log: {
    id: 'meridian_keycard_acquisition_log',
    name: 'Keycard Acquisition Log',
    description: 'A Reclaimer internal document tracking MERIDIAN access artifacts.',
    type: 'lore',
    weight: 0,
    value: 0,
    usable: true,
    loreText: 'Keycard batch 7-C, 3 recovered from Scar perimeter, 1 recovered from Red Court courier (circumstances redacted), 1 recovered from Salter armory via (circumstances redacted). Active keycards remaining at large: unknown. Facility access status: intact, unpowered sections open to entry, powered sections require Level 4 card. Note: two keycards have been distributed to trusted assets for Expedition planning. Disposition of remaining cards is operational and not logged here.',
    rarity: 'uncommon',
  },

  signal_decode_partial: {
    id: 'signal_decode_partial',
    name: 'Signal Decode (Partial)',
    description: 'A Reclaimer technician\'s partial decryption of the MERIDIAN broadcast.',
    type: 'lore',
    weight: 0,
    value: 0,
    usable: true,
    loreText: 'Decoded fragment, Broadcast 14: "...the trial data is intact. The Theta variant is stable. If you are receiving this, the facility is accessible via [ENCODING BREAK]. The answer to the Scar question is not the weapon. It was never the weapon. The goal was always the [ENCODING BREAK]." Remaining fragments require direct antenna access at the tower site. The answer is inside the Scar.',
    rarity: 'uncommon',
  },

  // ----------------------------------------------------------
  // Lore Items — Duskhollow
  // ----------------------------------------------------------

  blood_tithe_contract: {
    id: 'blood_tithe_contract',
    name: 'Blood Tithe Contract',
    description: 'A formal contract on heavy paper, signed in what appears to be blood.',
    type: 'lore',
    weight: 0,
    value: 0,
    usable: true,
    loreText: 'This agreement, between the household of Ezra Callan and the Covenant of Dusk, establishes voluntary tithe of 400ml blood per household adult per month, in exchange for protection of said household from Sanguine predation, Red Court enforcement, and Hollow incursion within a 5km radius of Duskhollow Manor. The arrangement has been in place since 2034. Vesper\'s signature is careful and even. The human signatory\'s hand was shaking.',
    rarity: 'uncommon',
  },

  vesper_philosophy_essay: {
    id: 'vesper_philosophy_essay',
    name: 'Vesper\'s Philosophy Essay',
    description: 'A handwritten essay on heavy cream paper, multiple drafts visible through strikeouts.',
    type: 'lore',
    weight: 0,
    value: 0,
    usable: true,
    loreText: 'The question is not whether coexistence is possible. The question is whether either species deserves it. We were monsters before CHARON-7 — all of us. The virus clarified what was already present. What the Covenant is building is not reconciliation. It is an experiment in whether intelligent apex predators can choose not to behave as such. I believe we can. I acknowledge that believing this makes me unusual among my kind. — V.',
    rarity: 'uncommon',
  },

  gallery_portrait_placard: {
    id: 'gallery_portrait_placard',
    name: 'Gallery Portrait Placard',
    description: 'A small placard from Duskhollow\'s portrait gallery, the gilding faded.',
    type: 'lore',
    weight: 0,
    value: 0,
    usable: true,
    loreText: 'This portrait was commissioned by the subject in 2033, two years after their conversion. The sitter requested the painting be done in natural light, at noon — a deliberate choice, given the discomfort it caused. The expression has been described as "defiant." The subject preferred "present." The subject is still alive. Whether the sitter in the portrait is the same person, they cannot say.',
    rarity: 'uncommon',
  },

  // ----------------------------------------------------------
  // Lore Items — The Deep
  // ----------------------------------------------------------

  mine_supervisor_log: {
    id: 'mine_supervisor_log',
    name: 'Mine Supervisor Log',
    description: 'A weathered operations log from before the Collapse.',
    type: 'lore',
    weight: 1,
    value: 0,
    usable: true,
    loreText: 'August 2030. Federal contractors arrived today, six of them, civilian cover but military bearing. They are not here for the gold. They have surveying equipment that costs more than this entire mine and they are mapping the lower levels for something they won\'t explain. I asked the foreman what they were looking for. He said: "Depth and stability." He didn\'t look at me when he said it.',
    rarity: 'uncommon',
  },

  meridian_construction_memo: {
    id: 'meridian_construction_memo',
    name: 'MERIDIAN Construction Memo',
    description: 'A water-damaged internal memo on official letterhead.',
    type: 'lore',
    weight: 0,
    value: 0,
    usable: true,
    loreText: 'RE: MERIDIAN Sub-Level 3 Expansion. The mining infrastructure at the target site provides natural cover for the lower laboratory complex. Ventilation through existing mine shafts is viable with modification. The facility should be invisible from surface survey. No satellite signature. The mine cover story is adequate. The project can proceed to Phase 2.',
    rarity: 'uncommon',
  },

  deep_pool_observation: {
    id: 'deep_pool_observation',
    name: 'Deep Pool Observation',
    description: 'Field notes scratched on a torn piece of foil with a nail.',
    type: 'lore',
    weight: 0,
    value: 0,
    usable: true,
    loreText: 'The water in the lower pool is not ordinary water. Something biological is growing in it — not algae, not fungal, something we do not have a name for. It responds to sound. Approached closely, it retracts from light sources. The Hollow in this section do not approach the pool. They avoid it. I don\'t know if that is warning or worship. I\'m not staying to find out.',
    rarity: 'uncommon',
  },

  sanguine_lair_note: {
    id: 'sanguine_lair_note',
    name: 'Sanguine Lair Note',
    description: 'A note left at the entrance to a deep cavern, scratched on a slate tile.',
    type: 'lore',
    weight: 0,
    value: 0,
    usable: true,
    loreText: 'To whoever finds this. Do not go deeper. There is an Elder Sanguine in the lowest level. We lost four people finding that out. It does not appear to be Red Court or Feral — it does not behave like either. It has been down here a very long time and it knows this place. It may know things about MERIDIAN. If you are brave enough or desperate enough to try to communicate with it rather than fight it, the word to use first is "Theta." We don\'t know why. It is what the Lucid told us. — Reclaimer advance team, what remains.',
    rarity: 'uncommon',
  },

  // ----------------------------------------------------------
  // Lore Items — The Pine Sea
  // ----------------------------------------------------------

  shepherd_camp_journal: {
    id: 'shepherd_camp_journal',
    name: 'Shepherd Camp Journal',
    description: 'A camp journal left at a high-country shepherd\'s hut.',
    type: 'lore',
    weight: 1,
    value: 0,
    usable: true,
    loreText: 'The elk are back. Five cows, two calves. I have not seen calves in three years. I sat with them for an hour before they moved on and I did not reach for the rifle once. I do not know what that means about me. The world ended and the elk are having calves and I sat in the grass and watched them. Maybe that\'s what surviving looks like when you\'re not paying attention to the dark parts.',
    rarity: 'uncommon',
  },

  scar_approach_warning: {
    id: 'scar_approach_warning',
    name: 'Scar Approach Warning',
    description: 'A warning carved into a trailhead sign, deep cuts in old wood.',
    type: 'lore',
    weight: 0,
    value: 0,
    usable: true,
    loreText: 'THE SCAR IS NOT A RUIN. IT IS A LID. DO NOT LIFT IT WITHOUT A REASON. WHAT IS INSIDE DOES NOT CARE THAT YOU SURVIVED TO GET HERE. IF YOU GO DOWN, KNOW WHAT YOU ARE GOING DOWN FOR. — Three lines below, a different hand: I went down. I came back. It is worth it. Go.',
    rarity: 'uncommon',
  },

  // ----------------------------------------------------------
  // Lore Items — The Scar / MERIDIAN
  // ----------------------------------------------------------

  meridian_personnel_file_partial: {
    id: 'meridian_personnel_file_partial',
    name: 'MERIDIAN Personnel File (Partial)',
    description: 'A partially shredded personnel file, the name field mostly intact.',
    type: 'lore',
    weight: 0,
    value: 0,
    usable: true,
    loreText: 'SUBJECT: Dr. Elias Vane. ROLE: Lead Virologist, CHARON-7 Program. CLEARANCE: Level 5 (MERIDIAN-only). STATUS as of October 2031: [REDACTED]. NOTES: Subject expressed ethical objections to live-trial protocol in September 2031 and was placed on administrative hold. Subject was inside the facility at time of detonation order. No body recovered. No signal attributed to subject in post-detonation survey. This file is listed as INACTIVE — PRESUMED DECEASED. Someone has written in the margin: PRESUMED.',
    rarity: 'uncommon',
  },

  lab_wing_data_terminal: {
    id: 'lab_wing_data_terminal',
    name: 'Lab Wing Data Terminal',
    description: 'A printout from a MERIDIAN data terminal, the text columns dense.',
    type: 'lore',
    weight: 0,
    value: 0,
    usable: true,
    loreText: 'CHARON-7 TRIAL RESULTS — SERIES 9, SUBJECTS 44-51. Sanguine expression achieved in 2 of 8 subjects (25%). Hollow expression in 4 of 8 (50%). Revenant expression in 1 of 8 (12.5%). No expression in 1 of 8 (12.5%). Note: Revenant expression was not predicted by model. Recommend further study. Project Director comment: "This is the finding. Everything else is a side effect."',
    rarity: 'uncommon',
  },

  director_personal_log: {
    id: 'director_personal_log',
    name: 'Director\'s Personal Log',
    description: 'An audio transcript printed from a personal recording device.',
    type: 'lore',
    weight: 0,
    value: 0,
    usable: true,
    loreText: '"Day four hundred inside. The upper levels are structurally sound. I have not heard any detonation activity above for two years. I believe the containment protocol was performed as ordered and that no one on the outside knows the facility is intact. I have power. I have food for another eighteen months. I have the entire CHARON-7 dataset. The broadcast has been running for two hundred and sixteen days. Someone will come. They will come because they are the kind of person the signal is designed to call. I am patient. The work has always been patient."',
    rarity: 'uncommon',
  },

  holding_cell_graffiti: {
    id: 'holding_cell_graffiti',
    name: 'Holding Cell Graffiti',
    description: 'Text scratched into a holding cell wall by many different hands.',
    type: 'lore',
    weight: 0,
    value: 0,
    usable: true,
    loreText: 'WE DID NOT CONSENT. scratched in first. THEY CALLED IT VOLUNTARY. added below. WE WERE TOLD THE ALTERNATIVE. added below that. Then, in careful letters from someone who had time: They were making gods. That\'s all it was. They wanted to make gods and we were the first draft. Below that, one final line: Gods are just people who survived the fire. Nothing special about that. Most of us just didn\'t get the chance.',
    rarity: 'uncommon',
  },

  broadcaster_final_message: {
    id: 'broadcaster_final_message',
    name: 'Broadcaster\'s Final Message',
    description: 'A printed transcript of the MERIDIAN broadcast\'s final decrypted layer.',
    type: 'lore',
    weight: 0,
    value: 0,
    usable: true,
    loreText: 'If you found this, you are the right person. I don\'t know your name. I don\'t need to. The signal found you. The data is complete — the Theta variant, the Revenant mechanism, the cure pathway, the weapon pathway, the Seal protocol. All of it is here. All of it is yours. I am not telling you what to do with it. I designed a system to improve human beings and ended the world instead. I do not get to make that choice a second time. The choice is yours. It was always going to be yours. I just had to wait for you to arrive. — E.V.',
    rarity: 'uncommon',
  },

  // ----------------------------------------------------------
  // Broadcaster Log Fragments (radio mystery)
  // ----------------------------------------------------------

  broadcaster_log_fragment_1: {
    id: 'broadcaster_log_fragment_1',
    name: 'Broadcaster Log Fragment #1',
    description: 'A partial radio log, decoded from the MERIDIAN broadcast frequency.',
    type: 'lore',
    weight: 0,
    value: 0,
    usable: true,
    loreText: 'Broadcast initiated Day 1 post-detonation. Signal is low-power, designed for sustained operation, not wide coverage. The signal is a question. The answer is the person who comes to find it. I have structured the broadcast in layers — each layer requires the listener to have understood the previous one. The outermost layer says: "something is here." The innermost layer says: "here is what to do with it."',
    rarity: 'uncommon',
  },

  broadcaster_log_fragment_2: {
    id: 'broadcaster_log_fragment_2',
    name: 'Broadcaster Log Fragment #2',
    description: 'A second decoded layer from the MERIDIAN broadcast.',
    type: 'lore',
    weight: 0,
    value: 0,
    usable: true,
    loreText: 'Year two. The signal is still transmitting. I have had no response. This is expected. The layers are designed to require geographic proximity for full decode. Whoever is listening from a distance hears only noise and suggestion. The invitation. The actual message requires presence. I am patient. The facility is holding. I have begun cataloguing the CHARON-7 dataset by intervention type. The work keeps me functional.',
    rarity: 'uncommon',
  },

  broadcaster_log_fragment_3: {
    id: 'broadcaster_log_fragment_3',
    name: 'Broadcaster Log Fragment #3',
    description: 'A third fragment, this one clearly emotional in tone.',
    type: 'lore',
    weight: 0,
    value: 0,
    usable: true,
    loreText: 'I don\'t know how many people have died because of what I built. I have tried to calculate it. The number does not converge. Every Hollow was a person first. Every person who was killed by a Hollow was killed by my work. I have stopped trying to hold that number. I hold the signal instead. The signal is what I can do. It\'s the only thing left.',
    rarity: 'uncommon',
  },

  broadcaster_log_fragment_4: {
    id: 'broadcaster_log_fragment_4',
    name: 'Broadcaster Log Fragment #4',
    description: 'A fourth fragment, nearly the deepest layer.',
    type: 'lore',
    weight: 0,
    value: 0,
    usable: true,
    loreText: 'Year five. Someone tried the outer perimeter. They did not make it inside. I watched the approach on the surviving cameras. They were well-equipped and skilled and the Sanguine in the deep level found them first. I have adjusted the broadcast. The new layer includes routing information that should allow the right person to avoid the lower reaches. I have done what I can from here. The rest is up to whoever receives it.',
    rarity: 'uncommon',
  },

  broadcaster_log_fragment_5: {
    id: 'broadcaster_log_fragment_5',
    name: 'Broadcaster Log Fragment #5',
    description: 'The innermost layer of the MERIDIAN broadcast, the final message before the core.',
    type: 'lore',
    weight: 0,
    value: 0,
    usable: true,
    loreText: 'You are close. The core is through the lab wing, past the holding cells, down one more level. The power is still on in the core. My office is the third door on the left. The dataset is in the terminal on the desk. The terminal will respond to voice. My name is the password. If you have read everything else, you know my name. Come and find me. I\'ll be here. I have always been here. — E.V.',
    rarity: 'uncommon',
  },

  // ----------------------------------------------------------
  // Scavenged Goods — Junk
  // ----------------------------------------------------------

  empty_water_bottle: {
    id: 'empty_water_bottle',
    name: 'Empty Water Bottle',
    description: 'A one-liter Nalgene, empty, lid still threaded on. Hard plastic that doesn\'t leach, doesn\'t crack. A clean vessel is hard to find — water you can carry is the basic unit of survival out here, and you can\'t carry it in your hands.',
    type: 'junk',
    weight: 0.3,
    value: 1,
    rarity: 'common',
  },

  lighter_disposable: {
    id: 'lighter_disposable',
    name: 'Disposable Lighter',
    description: 'A yellow Bic, the logo mostly worn off. The flint still catches. Fire on demand is a luxury so ordinary it stopped feeling like one — until the world ended and you found out what you\'d been taking for granted.',
    type: 'junk',
    weight: 0.1,
    value: 2,
    rarity: 'common',
  },

  old_binoculars: {
    id: 'old_binoculars',
    name: 'Old Binoculars',
    description: 'Porro-prism field glasses, one objective lens cracked in a starburst pattern that blurs the right half of everything you see. The left side still gives you eight-times magnification. Half a view is better than none, which is something you used to not have to say.',
    type: 'junk',
    weight: 0.8,
    value: 3,
    rarity: 'common',
  },

  binoculars_intact: {
    id: 'binoculars_intact',
    name: 'Intact Binoculars',
    description: 'Military-spec 10x50s, rubber-armored and nitrogen-purged. The reticle is mil-dot. Someone used these professionally and either left them or lost them in a way that suggests they no longer needed them. The optics are clean — whoever owned these cleaned them last.',
    type: 'junk',
    weight: 0.9,
    value: 8,
    rarity: 'common',
  },

  can_opener_quality: {
    id: 'can_opener_quality',
    name: 'Quality Can Opener',
    description: 'A heavy-frame rotary can opener, butterfly key, broad drive wheel — pre-Collapse OXO Good Grips, which means someone had an opinion about kitchen tools. In a world full of unlabeled cans, it\'s the most reliable instrument you own.',
    type: 'junk',
    weight: 0.3,
    value: 2,
    rarity: 'common',
  },

  cast_iron_skillet: {
    id: 'cast_iron_skillet',
    name: 'Cast-Iron Skillet',
    description: 'A cast-iron skillet. Heavy. Could cook with it. Could fight with it.',
    type: 'junk',
    weight: 2.0,
    value: 4,
    rarity: 'common',
  },

  hand_tools_basic: {
    id: 'hand_tools_basic',
    name: 'Basic Hand Tools',
    description: 'A 16-oz claw hammer with a fiberglass handle, a flathead and a Phillips, and a pair of slip-joint pliers with worn grips. Nothing specialized. Everything necessary. The kind of kit that survived the Collapse in a million garages and is now worth more than most weapons.',
    type: 'junk',
    weight: 1.5,
    value: 5,
    rarity: 'common',
  },

  gun_oil: {
    id: 'gun_oil',
    name: 'Gun Oil',
    description: 'A small squeeze bottle, about half full. Keeps the action cycling when dust and grit want to stop it. The difference between a gun that fires and one that doesn\'t is usually maintenance, and this is the first part of maintenance.',
    type: 'junk',
    weight: 0.2,
    value: 3,
    rarity: 'common',
  },

  crafting_components: {
    id: 'crafting_components',
    name: 'Crafting Components',
    description: 'A ziplock bag of salvaged hardware: brass gears from a clock movement, stripped wire segments, spring clips, a handful of machine screws in two sizes. The Reclaimers call this kind of bag a maybe kit. You don\'t know what you\'ll need it for until you need it.',
    type: 'junk',
    weight: 0.8,
    value: 4,
    rarity: 'common',
  },

  salvaged_engine_part: {
    id: 'salvaged_engine_part',
    name: 'Salvaged Engine Part',
    description: 'A camshaft from what was probably a V8 — steel lobes, journal surfaces still bright beneath the grime. Dead weight to anyone without a working engine. To someone trying to keep a generator or a vehicle running, this is the difference between mobility and staying put.',
    type: 'junk',
    weight: 3.0,
    value: 6,
    rarity: 'common',
  },

  mineral_sample: {
    id: 'mineral_sample',
    name: 'Mineral Sample',
    description: 'A fist-sized core sample in a labeled canvas bag — "SJ-7 DEPTH 340M" in faded pencil. Geological survey material, pre-Collapse. The Reclaimers catalog everything that came out of the ground before the facilities went dark. Whether what\'s in this sample matters, they\'ll want to decide for themselves.',
    type: 'junk',
    weight: 0.5,
    value: 2,
    rarity: 'common',
  },

  smooth_river_stone: {
    id: 'smooth_river_stone',
    name: 'Smooth River Stone',
    description: 'A basalt pebble, river-polished to an ellipse that fills the hand without effort. No practical use. You carry it because it is one of the few things in this world that the Collapse did not change, and sometimes that matters.',
    type: 'junk',
    rarity: 'common',
    weight: 0.4,
    value: 1,
  },

  tinder_bundle: {
    id: 'tinder_bundle',
    name: 'Tinder Bundle',
    description: 'Cedar bark and dried cheatgrass, bound tight with a length of twine. Someone prepared this deliberately — the bark is shredded fine, the grass is bone-dry. A fire kit is only as good as its first stage, and this stage is good.',
    type: 'junk',
    weight: 0.3,
    value: 1,
    rarity: 'common',
  },

  fire_starter_kit: {
    id: 'fire_starter_kit',
    name: 'Fire Starter Kit',
    description: 'Flint, steel, and tinder. The old way.',
    type: 'junk',
    weight: 0.4,
    value: 3,
    rarity: 'common',
  },

  wild_herbs: {
    id: 'wild_herbs',
    name: 'Wild Herbs',
    description: 'A bundled handful of dried plants — yarrow, maybe, and something with small pale flowers you can\'t name with certainty. Could be wound-packing material. Could be the base of a broth. Knowledge of what the land offers is the kind of thing that died with the people who had it.',
    type: 'junk',
    weight: 0.2,
    value: 2,
    rarity: 'common',
  },

  ghost_sage_sprig: {
    id: 'ghost_sage_sprig',
    name: 'Ghost Sage Sprig',
    description: 'The pale variety that grows at elevation, aromatic and slightly bitter. The Covenant of Dusk burns it in their purification ceremonies or carries it on the body. Whether the rite means anything is a theological question. The sage smells like a high-country morning before everything changed. That alone has value.',
    type: 'junk',
    weight: 0.1,
    value: 3,
    rarity: 'common',
  },

  fishing_line_improvised: {
    id: 'fishing_line_improvised',
    name: 'Improvised Fishing Line',
    description: 'Twenty feet of mono wrapped around a stick, with a bent nail hammered into a hook and a shred of red cloth lashed to it with thread. Ugly. Probably works. Whoever made this knew that fish don\'t care about the lure as much as the person fishing does.',
    type: 'junk',
    weight: 0.2,
    value: 2,
    rarity: 'common',
  },

  scavenging_useful_bones: {
    id: 'scavenging_useful_bones',
    name: 'Useful Bones',
    description: 'Hollow bones. Useful for making tools, needles, or charms.',
    type: 'junk',
    weight: 0.3,
    value: 2,
    rarity: 'common',
  },

  hollow_nest_salvage: {
    id: 'hollow_nest_salvage',
    name: 'Hollow Nest Salvage',
    description: 'Material pulled from a Hollow nest. Organic fiber and shed chitinous shell.',
    type: 'junk',
    weight: 0.6,
    value: 4,
    rarity: 'common',
  },

  soap_bar: {
    id: 'soap_bar',
    name: 'Bar of Soap',
    description: 'A bar of Ivory soap, worked down to a thin oval but still usable. Smells like something from before — a specific chemical sweetness that means clean, that means the world had hot running water. You use it carefully. You will use every sliver.',
    type: 'junk',
    weight: 0.2,
    value: 1,
    rarity: 'common',
  },

  room_key_motel: {
    id: 'room_key_motel',
    name: 'Motel Room Key',
    description: 'A motel room key. Old brass. Room 7 is stamped on the fob.',
    type: 'junk',
    weight: 0.05,
    value: 1,
    rarity: 'common',
  },

  motel_bible: {
    id: 'motel_bible',
    name: 'Motel Bible',
    description: 'A Gideons Bible, cover soft from years of hands. Someone has been writing in the margins for a long time — the ink changes color, the handwriting changes size. You don\'t have time to read it, but someone did. Someone kept coming back.',
    type: 'junk',
    weight: 0.4,
    value: 1,
    rarity: 'common',
  },

  empty_cola_can: {
    id: 'empty_cola_can',
    name: 'Empty Cola Can',
    description: 'An empty cola can. Pre-collapse brand. You could still read the logo if you squinted.',
    type: 'junk',
    weight: 0.05,
    value: 0,
    rarity: 'common',
  },

  backpack_child: {
    id: 'backpack_child',
    name: 'Child\'s Backpack',
    description: 'A child\'s backpack. Small. Covered in faded cartoon characters.',
    type: 'junk',
    weight: 0.3,
    value: 1,
    rarity: 'common',
  },

  lost_cargo_crate: {
    id: 'lost_cargo_crate',
    name: 'Lost Cargo Crate',
    description: 'A sealed cargo crate. Something inside shifts when you move it.',
    type: 'junk',
    weight: 5.0,
    value: 10,
    rarity: 'common',
  },

  // ----------------------------------------------------------
  // Scavenged Goods — Weapons
  // ----------------------------------------------------------

  rebar_club: {
    id: 'rebar_club',
    name: 'Rebar Club',
    description: 'Three feet of #4 rebar, one end wrapped in electrical tape to keep your palm from shredding. The weight does the work. Before the Collapse it built buildings. Now it keeps them from being rebuilt.',
    type: 'weapon',
    weight: 2.5,
    damage: 6,
    value: 4,
    rarity: 'rare',
  },

  // ----------------------------------------------------------
  // Scavenged Goods — Food
  // ----------------------------------------------------------

  canned_food: {
    id: 'canned_food',
    name: 'Canned Food',
    description: 'A dented can. Label gone. You peel it open and eat without looking.',
    type: 'consumable',
    weight: 1.0,
    healing: 15,
    value: 5,
    usable: true,
    useText: 'You eat. It\'s fine. You don\'t ask what it was.',
    rarity: 'uncommon',
  },

  canned_food_random: {
    id: 'canned_food_random',
    name: 'Unlabeled Can',
    description: 'No label, no clue — rust rings on the lid, seams intact, no bulge. The absence of information is information: still sealed means probably still safe. You\'ve eaten worse with more confidence.',
    type: 'consumable',
    weight: 1.0,
    healing: 15,
    value: 5,
    usable: true,
    useText: 'You open it. Corn, you think. Maybe hominy. You eat it cold and don\'t complain.',
    rarity: 'uncommon',
  },

  canned_food_premium: {
    id: 'canned_food_premium',
    name: 'Premium Canned Food',
    description: 'Vacuum-sealed. Pre-collapse. Whatever\'s inside hasn\'t gone bad yet.',
    type: 'consumable',
    weight: 1.2,
    healing: 25,
    value: 10,
    usable: true,
    useText: 'You eat. It tastes like it was made in a world that still had quality control.',
    rarity: 'uncommon',
  },

  dried_meat_strip: {
    id: 'dried_meat_strip',
    name: 'Dried Meat Strip',
    description: 'Hard salt-cured strips, the kind you chew for a while before they give. Protein, salt, calories — everything your body needs and nothing your mouth wants. You eat it anyway. You\'ve learned to eat what you have.',
    type: 'consumable',
    weight: 0.3,
    healing: 10,
    value: 3,
    usable: true,
    useText: 'You chew. It takes a while. It keeps you going.',
    rarity: 'uncommon',
  },

  scavenged_rations: {
    id: 'scavenged_rations',
    name: 'Scavenged Rations',
    description: 'Mixed scavenged food. You\'ve stopped asking what it was.',
    type: 'consumable',
    weight: 0.8,
    healing: 12,
    value: 4,
    usable: true,
    useText: 'You eat what\'s there. It\'s enough.',
    rarity: 'uncommon',
  },

  preserved_rations: {
    id: 'preserved_rations',
    name: 'Preserved Rations',
    description: 'Preserved in salt or oil. Will last another season.',
    type: 'consumable',
    weight: 1.0,
    healing: 20,
    value: 8,
    usable: true,
    useText: 'You eat. The preservation held. That alone is worth something.',
    rarity: 'uncommon',
  },

  salted_rations: {
    id: 'salted_rations',
    name: 'Salted Rations',
    description: 'Salt-cured strips. The Salters know how to make food last.',
    type: 'consumable',
    weight: 0.9,
    healing: 18,
    value: 7,
    usable: true,
    useText: 'You eat. The salt burns your lips. You don\'t mind.',
    rarity: 'uncommon',
  },

  emergency_rations: {
    id: 'emergency_rations',
    name: 'Emergency Rations',
    description: 'Emergency pack. The label says 3-day supply. It\'s one meal.',
    type: 'consumable',
    weight: 0.8,
    healing: 22,
    value: 9,
    usable: true,
    useText: 'You eat the whole pack. You\'re still hungry, but less so.',
    rarity: 'uncommon',
  },

  fresh_fish: {
    id: 'fresh_fish',
    name: 'Fresh Fish',
    description: 'River-caught. Still smells like the water.',
    type: 'consumable',
    weight: 0.6,
    healing: 20,
    value: 6,
    usable: true,
    useText: 'You cook it over the fire. It\'s good. Simple and good.',
    rarity: 'uncommon',
  },

  culinary_herbs_fresh: {
    id: 'culinary_herbs_fresh',
    name: 'Fresh Culinary Herbs',
    description: 'Fresh-cut herbs from the rooftop garden. Mint, sage, something else.',
    type: 'consumable',
    weight: 0.2,
    healing: 5,
    value: 2,
    usable: true,
    useText: 'You chew a leaf. The taste is sharp and clean.',
    rarity: 'uncommon',
  },

  // ----------------------------------------------------------
  // Scavenged Goods — Medical
  // ----------------------------------------------------------

  bandages_clean: {
    id: 'bandages_clean',
    name: 'Clean Bandages',
    description: 'Factory-sealed gauze rolls, unbroken packaging, sterile. Finding these still wrapped means they survived in a bag or a cabinet that stayed dry. The seal is the whole point — used gauze is just cloth, but this is still medicine.',
    type: 'consumable',
    weight: 0.2,
    healing: 12,
    value: 10,
    usable: true,
    useText: 'You wrap the wound with clean gauze. It holds.',
    rarity: 'uncommon',
  },

  first_aid_kit_basic: {
    id: 'first_aid_kit_basic',
    name: 'Basic First Aid Kit',
    description: 'A red-cross hard case, latched shut. Half the blister packs are still sealed — gauze, antiseptic wipes, medical tape, two ammonia inhalants. Whoever used this before you was careful, or lucky, or both. What\'s left is more than most people find.',
    type: 'consumable',
    weight: 1.5,
    healing: 30,
    value: 25,
    usable: true,
    useText: 'You open the kit and work through it methodically. Gauze, tape, antiseptic. Better.',
    rarity: 'uncommon',
  },

  field_dressing: {
    id: 'field_dressing',
    name: 'Field Dressing',
    description: 'An H-bandage, olive drab, still in the vacuum seal. The kind you press into a wound with your palm and hold until the pressure tells you it\'s working. Military surplus. Whoever carried this before expected to get shot.',
    type: 'consumable',
    weight: 0.4,
    healing: 15,
    value: 12,
    usable: true,
    useText: 'You press the dressing into the wound. The bleeding slows.',
    rarity: 'uncommon',
  },

  fresh_water_container: {
    id: 'fresh_water_container',
    name: 'Fresh Water Container',
    description: 'A sealed two-liter container, clear and settled. No particulate, no smell. Someone filtered and stored this, which means they had the equipment and the patience. Clean water is not a given. It is a project. Someone finished that project for you.',
    type: 'consumable',
    weight: 1.2,
    healing: 10,
    value: 8,
    usable: true,
    useText: 'You drink. Clean water. You forgot how good that feels.',
    rarity: 'uncommon',
  },

  // ----------------------------------------------------------
  // Lore Items — MERIDIAN Expansion
  // ----------------------------------------------------------

  harlow_journal_meridian: {
    id: 'harlow_journal_meridian',
    name: 'Harlow\'s Journal (MERIDIAN ref.)',
    description: 'A water-stained journal page in precise handwriting.',
    type: 'lore',
    weight: 0,
    value: 0,
    usable: true,
    loreText: 'Dr. Harlow — entry 44. The trial subjects in Block C are responding. Not to the serum. To each other. They\'re communicating through the walls. Tapping. In sequence. I reported this to Director Vane. She said: document it. I said: shouldn\'t we stop it? She said: document it.',
    rarity: 'uncommon',
  },

  osei_research_notebook: {
    id: 'osei_research_notebook',
    name: 'Dr. Osei\'s Research Notebook',
    description: 'A field notebook with careful handwriting and sketches of bone samples.',
    type: 'lore',
    weight: 0,
    value: 0,
    usable: true,
    loreText: 'Field note — canyon site. The organism in the bones isn\'t CHARON-7. It predates the facility by at least sixty years. Someone was studying it long before MERIDIAN. Someone who didn\'t leave their name. Just initials: E.V.',
    rarity: 'uncommon',
  },

  meridian_file_fragment: {
    id: 'meridian_file_fragment',
    name: 'MERIDIAN Personnel File (fragment)',
    description: 'A torn fragment of an official personnel file, stamped RED-TIER.',
    type: 'lore',
    weight: 0,
    value: 0,
    usable: true,
    loreText: 'CLEARANCE: RED-TIER / EYES ONLY. Subject: CHARON-7 Exposure Protocol, Cohort 3. All cohort-3 subjects have been reclassified from \'patient\' to \'asset.\' Transfer to Holding Wing C upon successful phase-2 transition. Note: Do not inform subjects of reclassification.',
    rarity: 'uncommon',
  },

  meridian_security_log: {
    id: 'meridian_security_log',
    name: 'MERIDIAN Security Log — Briggs',
    description: 'A security log on yellowed paper, the final entry circled in red ink.',
    type: 'lore',
    weight: 0,
    value: 0,
    usable: true,
    loreText: 'Security Director Briggs — final entry. They\'re calling it a containment breach. It\'s not. They opened the doors. I was there. I saw Vane give the order. Whatever comes next — whatever the Hollow are now — that was a choice. Made by people in suits. I want that on the record.',
    rarity: 'uncommon',
  },

  meridian_tunnel_map: {
    id: 'meridian_tunnel_map',
    name: 'MERIDIAN Tunnel Access Map',
    description: 'A hand-drawn map on graph paper, creased from repeated folding.',
    type: 'lore',
    weight: 0,
    value: 0,
    usable: true,
    loreText: 'Hand-drawn on graph paper. The maintenance tunnels run under the entire facility — including sections not on any official blueprint. Someone marked three locations in red ink: WATER INTAKE / SIGNAL ARRAY / THE BELOW. Below what is not labeled.',
    rarity: 'uncommon',
  },

  radio_fragment: {
    id: 'radio_fragment',
    name: 'Radio Signal Fragment',
    description: 'A decoded partial transmission on a strip of thermal printer paper.',
    type: 'lore',
    weight: 0,
    value: 0,
    usable: true,
    loreText: '...if you can hear this, the signal is still running. CHARON-7 is still running. We didn\'t stop it. We just moved the dial. Find the source. Find the choice. What you do with it... [signal degrades]',
    rarity: 'uncommon',
  },


  lore_cabin_logbook: {
    id: 'lore_cabin_logbook',
    name: 'Cabin Logbook',
    description: 'A logbook left in a mountain cabin, the entries spanning years.',
    type: 'lore',
    weight: 1,
    value: 0,
    usable: true,
    loreText: 'Eleven visits marked in the same handwriting. Each visit: a date, a bearing, and a distance. The last entry: \'Confirmed. Still broadcasting. Still changing things. The shepherd I met on visit 9 — he doesn\'t remember being human. But he misses it. I could see it.\'',
    rarity: 'uncommon',
  },

  lore_director_vane_journal: {
    id: 'lore_director_vane_journal',
    name: 'Director Vane\'s Personal Journal',
    description: 'A leather-bound journal, the clasp broken, the pages dense with small handwriting.',
    type: 'lore',
    weight: 1,
    value: 0,
    usable: true,
    loreText: 'I have stopped trying to justify CHARON-7 in terms the ethics board will accept. The ethics board is a legacy institution from a world that no longer exists. What I know: the Hollow are not dying. They are becoming. I know because I took a half-dose six months ago. I know because I can hear the ones in the basement. Not words. Intent.',
    rarity: 'uncommon',
  },

  lore_meridian_funding_data: {
    id: 'lore_meridian_funding_data',
    name: 'MERIDIAN Funding Data — Server Archive',
    description: 'Recovered financial records printed from a damaged server.',
    type: 'lore',
    weight: 0,
    value: 0,
    usable: true,
    loreText: 'Recovered financial records. MERIDIAN was not a government project. It was privately funded — twelve investors, names redacted — with a government contract as cover. The money came from somewhere. The directive to \'develop a population-scale behavioral modification agent\' came from somewhere. That somewhere is not in this file.',
    rarity: 'uncommon',
  },

  lore_meridian_r1_research: {
    id: 'lore_meridian_r1_research',
    name: 'MERIDIAN R1 Research Report',
    description: 'A research report marked PHASE 1, the pages brittle and stained.',
    type: 'lore',
    weight: 0,
    value: 0,
    usable: true,
    loreText: 'Phase 1 results: CHARON-7 achieves 98.7% tissue integration within 72 hours. Subjects display increased aggression, sensory acuity, and pack-behavior formation. Subjects display decreased verbal cognition. This was unexpected. Dr. Harlow believes verbal cognition can be restored with a stabilizing compound. Director Vane has not approved further testing on stabilization.',
    rarity: 'uncommon',
  },

  lore_reclaimer_field_notes: {
    id: 'lore_reclaimer_field_notes',
    name: 'Reclaimer Field Notes',
    description: 'Field notes on repurposed graph paper, the handwriting precise and technical.',
    type: 'lore',
    weight: 0,
    value: 0,
    usable: true,
    loreText: 'The Stacks were supposed to be a comms hub. We found it that way — equipment still running on solar backup, signal still cycling. Someone set this up to last. The question is: last until what? Until someone with the right key arrived? The broadcast array upstairs is still locked. We haven\'t found the key.',
    rarity: 'uncommon',
  },

  kindling_treatment_compound: {
    id: 'kindling_treatment_compound',
    name: 'Kindling Treatment Compound',
    description: 'An opaque flask with a handwritten label.',
    type: 'lore',
    weight: 0,
    value: 0,
    usable: true,
    loreText: 'An opaque flask with a handwritten label: PURIFICATION FORMULA R-7. The Kindling have been distributing this through their clinics. It smells chemical and sweet. What it actually does to the Hollow exposure in the body — you\'d need a lab to know.',
    rarity: 'uncommon',
  },

  pre_collapse_prayer_book: {
    id: 'pre_collapse_prayer_book',
    name: 'Pre-Collapse Prayer Book',
    description: 'A small devotional book, the spine cracked, margin notes in a second hand.',
    type: 'lore',
    weight: 0,
    value: 0,
    usable: true,
    loreText: 'A small devotional book. The prayers are standard. But someone has added margin notes in a different hand: \'God didn\'t leave. We did. The signal isn\'t His. But maybe answering it is.\' Dated three years post-collapse.',
    rarity: 'uncommon',
  },

  letter_meridian_cell_11: {
    id: 'letter_meridian_cell_11',
    name: 'Letter — Cell 11',
    description: 'Words written on a cell wall in what might be charcoal.',
    type: 'lore',
    weight: 0,
    value: 0,
    usable: true,
    loreText: 'Written on the wall in what might be charcoal. \'To whoever is next: they feed you. They test you. They say you\'re helping. They don\'t say what you\'re helping with. I lasted 40 days. I think that\'s a record. My name was Kepler. I was from Albuquerque. I had a son.\'',
    rarity: 'uncommon',
  },

  letter_meridian_cell_7: {
    id: 'letter_meridian_cell_7',
    name: 'Letter — Cell 7',
    description: 'Words scratched into the floor beside a bunk.',
    type: 'lore',
    weight: 0,
    value: 0,
    usable: true,
    loreText: 'Scratched into the floor beside the bunk. \'Day 1 they took blood. Day 7 I could hear the others. Not through the walls. Just — hear them. Day 14 I stopped needing to sleep. Day 21 I stopped being afraid. I don\'t know if that\'s better or worse.\'',
    rarity: 'uncommon',
  },

  // ----------------------------------------------------------
  // Lore Items — MERIDIAN Interior (scar_16–scar_28)
  // ----------------------------------------------------------

  lore_charon7_failure_notebook: {
    id: 'lore_charon7_failure_notebook',
    name: 'CHARON-7 Failure Research Notebook — Wing A',
    description: 'A clinical notebook, the cover stamped CHARON-7 VECTOR — CONTAINMENT FAILURE. The handwriting changes partway through.',
    type: 'lore',
    weight: 0,
    value: 0,
    usable: true,
    loreText: 'The first entries are controlled and optimistic. R-8 divergence identified Day 14. Corrective measures proposed. By Day 30: \'corrective measures insufficient.\' By Day 60: \'subjects displaying terminal behavioral degradation.\' By Day 90: \'containment protocol initiated.\' The last entry, different handwriting: \'Dr. Harlow was the one who noticed first. She\'s gone now. I don\'t know if gone means dead or gone means left. I can\'t ask anyone.\'',
    rarity: 'uncommon',
  },

  lore_augmentation_protocol_alpha: {
    id: 'lore_augmentation_protocol_alpha',
    name: 'MERIDIAN Augmentation Protocol — Alpha Series Results',
    description: 'A bound report, marked ALPHA SERIES — CONTROLLED TRIAL OUTCOMES. The tone is entirely different from the Wing A materials.',
    type: 'lore',
    weight: 0,
    value: 0,
    usable: true,
    loreText: 'Eleven Alpha Series subjects. R-1 integration successful in nine of eleven. Metrics: sensory acuity increased 340%. Physical regeneration rate 12x baseline. Thermal output reduced — subjects run cold. Cognitive function: preserved, with modifications to social instinct architecture that subjects describe as \'clarity.\' Two of eleven: R-1 integrated but verbal cognition partially suppressed. Classified as near-miss. The nine who succeeded are listed by first name only. You have met at least one of them.',
    rarity: 'uncommon',
  },

  broadcasters_recording: {
    id: 'broadcasters_recording',
    name: 'Broadcaster\'s Recording — The Antechamber',
    description: 'A small audio device, the kind used for field notes. A handwritten label on the side: PLAY ME. IF YOU MADE IT HERE, THIS IS FOR YOU.',
    type: 'lore',
    weight: 0,
    value: 0,
    usable: true,
    loreText: 'The recording is not what you expected. No justifications. No explanations. No blame assigned. What it says, in a voice that is tired in the way that people get tired after years of carrying something alone: \'I don\'t know who you are. I don\'t know what you found, or what you believe about what happened here. I know you made it this far, which means you wanted to know the truth badly enough to come looking for it. The truth is in the rooms you already walked through. What\'s in that room ahead is a choice. It\'s not mine to make. It was never mine to make — I just built the place where someone else could make it. I am sorry for what happened here. I am not sorry that you found it. Those are different things. They are both true. I\'m sorry for that too.\'',
    rarity: 'uncommon',
  },

  // ----------------------------------------------------------
  // Lore Items — The Pens
  // ----------------------------------------------------------

  patient_intake_form: {
    id: 'patient_intake_form',
    name: 'Patient Intake Form',
    description: 'A clipboard with a printed form, filled out in careful block letters.',
    type: 'lore',
    weight: 0,
    value: 0,
    usable: true,
    loreText: 'INTAKE FORM — FACILITY 7 (MERCY GENERAL REPURPOSING). Name: [REDACTED]. Blood Type: O-negative. Age estimate: 30–35. Condition on arrival: ambulatory, mild dehydration. Yield classification: Premium. Ward assignment: A (voluntary). Extraction schedule: bi-weekly. Notes: Cooperative. No restraint necessary. Wristband: YELLOW. Signature of processing officer: [illegible]. The paper is clean. The boxes are all filled in. The horror is that nothing about it is sloppy.',
    rarity: 'uncommon',
  },

  rooks_letter: {
    id: 'rooks_letter',
    name: 'Rook\'s Letter (Unsent)',
    description: 'A letter written on Red Court letterhead, folded but never sealed.',
    type: 'lore',
    weight: 0,
    value: 0,
    usable: true,
    loreText: 'To the Council — I am writing this knowing I will not send it. You don\'t want philosophy from your castellans. You want yield numbers. Yield is up 12% since I implemented the color-coded scheduling system. The voluntary intake rate has held at 34%. I tell myself these are good numbers. I tell myself the ones in Ward A made a choice. I tell myself that a world that needs us to do this is the world that made us necessary. I am writing this because I need to say, somewhere, that I know what we are. I have known since the first week. I choose it anyway. I choose it because the alternative is chaos and chaos kills more. This is what I tell myself in the dark. It works less than it used to. — R.',
    rarity: 'uncommon',
  },

  burn_shelter_journal: {
    id: 'burn_shelter_journal',
    name: 'Burn Shelter Journal',
    description: 'A water-stained notebook recovered from a basement shelter in the industrial district. The handwriting changes partway through.',
    type: 'lore',
    weight: 0,
    value: 0,
    usable: true,
    loreText: 'Day 1 in the shelter. The fire is still moving north. I can hear it through the floor — not crackling, more like breathing. The basement held. I have food for maybe two weeks if I ration. Day 9. The smell has changed. Not smoke anymore. Something chemical from the tank farm. Day 21. I went upstairs today for the first time. The street is glass in places. The factory is open sky. I came back down. Day 34. Someone has been in the tank farm — I can see footprints in the ash from the upper window. They didn\'t come here. Day 41. Leaving tomorrow. The footprints are gone. I don\'t know who made them or if they made it out. I am writing this so whoever finds this place knows: I was here, I survived, and I don\'t know why the fire started either. — [name torn away]',
    rarity: 'uncommon',
  },

  // ----------------------------------------------------------
  // Lore Items — The Pine Sea
  // ----------------------------------------------------------

  lore_hermit_bark_maps: {
    id: 'lore_hermit_bark_maps',
    name: 'Hermit\'s Bark Maps',
    description: 'Strips of pine bark with routes scratched into the surface using a nail or sharp stone. The lines are precise despite the medium.',
    type: 'lore',
    weight: 1,
    value: 15,
    usable: true,
    loreText: 'Seven panels of bark, fitted together. The complete route from the tree line to the Scar, with hazard notes in tiny handwriting: "DO NOT camp here — morning fog conceals drop"; "water here, safe, cold"; "Hollow sign — move through fast after dark"; "the big tree — bearing 312, three hundred paces, do not lose this bearing." At the bottom of the last panel: "The forest knows you\'re here. Walk like you belong and it won\'t tell anyone else."',
    rarity: 'uncommon',
  },

  lore_precollapse_survey: {
    id: 'lore_precollapse_survey',
    name: 'Pre-Collapse Forest Survey — San Juan National Forest Sector 7',
    description: 'A printed survey document in a waterproof map case, the paper still readable despite years in the field.',
    type: 'lore',
    weight: 1,
    value: 20,
    usable: true,
    loreText: 'USDA Forest Service, 2027. Sector 7 old-growth inventory. Tree ages confirmed by core sample: seventeen specimens over 400 years, three specimens over 600 years, one specimen — grid reference 7-NW-14 — estimated 890 years old. Pre-Collapse notes in the margin: "Protect at all costs — last stand old-growth in region." Below that, in different handwriting, post-Collapse: "It protected itself. We just stayed out of the way." And below that, a third hand: "The coast is accessible from the northwest approach if you follow the survey grid. Nobody has mapped it since the Collapse. Nobody knows what\'s out there."',
    rarity: 'uncommon',
  },

  blood_type_chart: {
    id: 'blood_type_chart',
    name: 'Blood Type Efficiency Chart',
    description: 'A laminated reference chart mounted on the wall near a workstation.',
    type: 'lore',
    weight: 0,
    value: 0,
    usable: true,
    loreText: 'EXTRACTION EFFICIENCY BY BLOOD TYPE — Internal Reference Only. O-neg: highest demand, lowest yield per draw, 10-day recovery minimum. A-pos: moderate demand, good yield, 7-day recovery. B-pos: specialized applications only, flag for research queue. AB-neg: PRIORITY — contact facility coordinator immediately upon intake. Wristband color codes: YELLOW=voluntary/O-neg, BLUE=voluntary/A-pos, RED=involuntary (any), WHITE=research queue. Recovery nutrition targets by type listed on reverse. The chart has been laminated. Someone updated it in pen at least twice. It is a living document.',
    rarity: 'uncommon',
  },

  // ----------------------------------------------------------
  // Armor
  // ----------------------------------------------------------

  scrap_vest: {
    id: 'scrap_vest',
    name: 'Scrap Vest',
    description: 'Sheet metal and leather scraps riveted to a canvas backing. It weighs more than it should and covers less than you\'d like. Stops a knife once. Stops a claw once. After that, it\'s a suggestion.',
    type: 'armor',
    weight: 3,
    defense: 1,
    value: 6,
    tier: 1,
    armorSlot: 'chest',
    rarity: 'common',
  },

  leather_jacket: {
    id: 'leather_jacket',
    name: 'Leather Jacket',
    description: 'Pre-Collapse motorcycle jacket, heavy cowhide with armored elbows and a cracked back panel. Whoever wore this last rode something fast into something hard. The road rash on the left shoulder is from asphalt, not teeth. The jacket survived. Whether the rider did is a question the jacket does not answer.',
    type: 'armor',
    weight: 3,
    defense: 2,
    value: 18,
    tier: 2,
    armorSlot: 'chest',
    rarity: 'uncommon',
  },

  reinforced_coat: {
    id: 'reinforced_coat',
    name: 'Reinforced Coat',
    description: 'A long leather duster with steel plates sewn into the lining — shoulder, chest, and kidney panels. Someone with tailoring skills and access to a rivet gun spent serious hours on this. It moves well for something with metal in it. The weight settles across the shoulders like a hand that is not entirely reassuring. [Fortified]',
    type: 'armor',
    weight: 5,
    defense: 3,
    value: 45,
    armorTraits: ['fortified'],
    tier: 3,
    armorSlot: 'chest',
    rarity: 'rare',
  },

  kevlar_vest: {
    id: 'kevlar_vest',
    name: 'Kevlar Vest',
    description: 'Military-grade body armor, pre-Collapse manufacture. The ballistic panels are intact, the carrier is faded to a gray that was once tan. The Velcro still works. The ceramic trauma plate is cracked but present. This kept someone alive through the first year. The bloodstain on the collar suggests it did not keep them alive through the second. [Fortified, Reactive]',
    type: 'armor',
    weight: 4,
    defense: 4,
    value: 80,
    armorTraits: ['fortified', 'reactive'],
    tier: 4,
    armorSlot: 'chest',
    rarity: 'epic',
  },

  hazmat_suit: {
    id: 'hazmat_suit',
    name: 'Hazmat Suit',
    description: 'Level B hazmat suit, bright yellow turned brown by seven years of atmosphere. The seals are intact. The respirator filters are third-generation replacements — someone has been maintaining this. It won\'t stop a blade, but it seals against CHARON-7 spore exposure, and in the zones where the air itself is the weapon, that matters more than steel. [Insulated, Reactive]',
    type: 'armor',
    weight: 4,
    defense: 2,
    value: 35,
    armorTraits: ['insulated', 'reactive'],
    tier: 3,
    armorSlot: 'chest',
    rarity: 'rare',
  },

  // ----------------------------------------------------------
  // Armor — Tier 2
  // ----------------------------------------------------------

  leather_armor: {
    id: 'leather_armor',
    name: 'Leather Armor',
    description: 'Hard-boiled leather panels stitched over a canvas backing. Covers the chest and upper arms. Pre-Collapse craftsmanship — somebody trained for this. It breathes better than anything with metal in it and stops most blades at an angle. Not glamorous. Still alive.',
    type: 'armor',
    weight: 3,
    defense: 2,
    value: 20,
    tier: 2,
    armorSlot: 'chest',
    rarity: 'uncommon',
  },

  militia_vest: {
    id: 'militia_vest',
    name: 'Militia Vest',
    description: 'A tactical vest stitched together from salvaged plate carrier webbing and reinforced canvas inserts. Accord militia issue — or close enough that the difference doesn\'t matter in the field. The magazine pouches are empty. The extra steel plate in the chest pocket is not. [Fortified]',
    type: 'armor',
    weight: 4,
    defense: 2,
    value: 28,
    armorTraits: ['fortified'],
    tier: 2,
    armorSlot: 'chest',
    rarity: 'uncommon',
  },

  // ----------------------------------------------------------
  // Armor — Tier 4
  // ----------------------------------------------------------

  body_armor_military: {
    id: 'body_armor_military',
    name: 'Military Body Armor',
    description: 'Full plate carrier with front, back, and side panels. Pre-Collapse military surplus, Salter-maintained. The plates are generation-3 ceramic composite — they\'ll stop rifle rounds until they won\'t, and then they\'re dead weight. The carrier is in good shape. Whatever unit this belonged to kept their kit clean. [Fortified]',
    type: 'armor',
    weight: 6,
    defense: 4,
    value: 100,
    armorTraits: ['fortified'],
    tier: 4,
    armorSlot: 'chest',
    rarity: 'epic',
  },

  // ----------------------------------------------------------
  // Weapons — Ranged (new additions)
  // ----------------------------------------------------------

  ar_platform_rifle: {
    id: 'ar_platform_rifle',
    name: 'AR Platform Rifle',
    description: 'An AR-pattern semi-automatic rifle in 5.56. The receiver is mil-spec, the furniture civilian aftermarket. Some armorer spent time on the trigger — it breaks clean at four pounds. The optic is a fixed 4x. In good hands this is a precise instrument. In bad ones it\'s still a rifle. [Precise]',
    type: 'weapon',
    weight: 6,
    damage: 10,
    value: 130,
    weaponTraits: ['precise'],
    tier: 4,
    rarity: 'legendary',
  },

  sniper_rifle: {
    id: 'sniper_rifle',
    name: 'Sniper Rifle',
    description: 'A bolt-action .308 in a precision stock, free-floated barrel, with a 10x first-focal-plane scope. Whoever built this knew what they were doing and why. At distance, it erases the question. The trigger pull is two and a half pounds. You will not notice the weight of the round until it arrives. [Precise, Keen]',
    type: 'weapon',
    weight: 7,
    damage: 12,
    value: 200,
    weaponTraits: ['precise', 'keen'],
    tier: 4,
    rarity: 'legendary',
  },

  military_sidearm: {
    id: 'military_sidearm',
    name: 'Military Sidearm',
    description: 'A compact .45 on a polymer frame, military specification. Short rail, night sights, beaver-tail grip safety. The finish is worn but the bore is clean. Standard Salter officer issue — someone traded this for something or lost it in a way they didn\'t get a chance to explain. [Precise, Quick]',
    type: 'weapon',
    weight: 2,
    damage: 8,
    value: 75,
    weaponTraits: ['precise', 'quick'],
    tier: 3,
    rarity: 'epic',
  },

  accord_issue_rifle: {
    id: 'accord_issue_rifle',
    name: 'Accord Issue Rifle',
    description: 'A semi-automatic rifle chambered in 7.62, Accord Militia standard. The stock has been replaced once, the trigger spring twice. It has seen use and survived it. Not fancy. Functional. The kind of firearm that is easy to maintain in the field, which is the only kind that matters.',
    type: 'weapon',
    weight: 5,
    damage: 7,
    value: 55,
    weaponTraits: ['precise'],
    tier: 3,
    rarity: 'rare',
  },

  accord_issue_pistol: {
    id: 'accord_issue_pistol',
    name: 'Accord Issue Pistol',
    description: 'A 9mm service pistol, Accord-issue. The lanyard loop is bent. The finish is service-worn but the internals are clean. Accord armorers stamp the frame — this one reads AMA-44. The forty-fourth pistol through that armory. You wonder about the other forty-three.',
    type: 'weapon',
    weight: 2,
    damage: 5,
    value: 30,
    tier: 2,
    rarity: 'uncommon',
  },

  // ----------------------------------------------------------
  // Consumables — Explosives
  // ----------------------------------------------------------

  fragmentation_grenade: {
    id: 'fragmentation_grenade',
    name: 'Fragmentation Grenade',
    description: 'An M67 frag, pre-Collapse military surplus. The spoon is wired in place and someone has marked the safety clip with orange paint — field modification for recognition by feel. Heavy for its size. The four-second fuse is either a feature or a deadline, depending on what you do next.',
    type: 'consumable',
    weight: 1,
    value: 60,
    usable: true,
    useText: 'You pull the pin and throw. Four seconds later, the question is answered.',
    rarity: 'common',
  },

  // ----------------------------------------------------------
  // Consumables — Medical (new additions)
  // ----------------------------------------------------------

  gauze: {
    id: 'gauze',
    name: 'Gauze',
    description: 'Sterile rolled gauze, vacuum-sealed in its original packaging. Basic wound care. Slows a bleed, covers a cut, keeps the dirt out while the body does its work. The simplest things keep you alive the longest.',
    type: 'consumable',
    weight: 0.2,
    healing: 2,
    value: 5,
    usable: true,
    useText: 'You wrap the wound with gauze. Not elegant. It works.',
    rarity: 'common',
  },

  antiseptic: {
    id: 'antiseptic',
    name: 'Antiseptic',
    description: 'Povidone-iodine solution in a brown glass bottle with a dropper. The burn when it hits a wound is not comfortable and is not meant to be. It kills what needs killing. In a world where every cut is an infection risk and every infection is a death risk, this bottle is worth more than it looks.',
    type: 'consumable',
    weight: 0.3,
    value: 15,
    usable: true,
    useText: 'You apply the antiseptic. It burns. The infection risk drops.',
    rarity: 'common',
  },

  pain_tabs: {
    id: 'pain_tabs',
    name: 'Pain Tablets',
    description: 'A foil blister pack of over-the-counter pain tablets, pre-Collapse manufacture. Ibuprofen, best guess. Takes the edge off. You can function through more than you think when the pain has somewhere else to be.',
    type: 'consumable',
    weight: 0.1,
    value: 10,
    usable: true,
    statBonus: { vigor: 1 },
    useText: 'You swallow two. Within twenty minutes the hurt is still there, just quieter.',
    rarity: 'uncommon',
  },

  antibiotics_single_dose: {
    id: 'antibiotics_single_dose',
    name: 'Antibiotics (Single Dose)',
    description: 'A single-dose blister pack of broad-spectrum antibiotics, individually sealed. The full course is seven days. This is one day. Better than nothing — which, out here, is the highest grade anything earns.',
    type: 'consumable',
    weight: 0.1,
    value: 20,
    usable: true,
    useText: 'You take the dose. It\'s not enough on its own, but it\'s a start.',
    rarity: 'common',
  },

  // ----------------------------------------------------------
  // Consumables — Water / Food (new additions)
  // ----------------------------------------------------------

  water_container_clean: {
    id: 'water_container_clean',
    name: 'Clean Water Container',
    description: 'A sealed canteen of purified water. The verification tag on the cap says it came from a tested source. Out here that tag is worth almost as much as the water itself.',
    type: 'consumable',
    weight: 1,
    healing: 3,
    value: 6,
    usable: true,
    useText: 'You drink. Clean, verified water. The thirst and a little of the ache both recede.',
    rarity: 'common',
  },

  clean_water_1L: {
    id: 'clean_water_1L',
    name: 'Clean Water (1L)',
    description: 'One liter of clean water in a sealed container. Tested, treated, safe to drink without a second thought. In a world where water will kill you as easily as it saves you, the ability to drink without thinking about it is a small luxury that costs a great deal.',
    type: 'consumable',
    weight: 1,
    healing: 2,
    value: 4,
    usable: true,
    useText: 'You drink. Clean. No aftertaste, no hesitation. You allow yourself to enjoy it.',
    rarity: 'common',
  },

  runners_kit: {
    id: 'runners_kit',
    name: 'Runner\'s Kit',
    description: 'A compact travel kit: high-calorie bars, electrolyte powder, blister pads, and a folded route card. The kind of thing a Drifter courier packs before a long push. Everything in it is designed to keep you moving when stopping isn\'t an option.',
    type: 'consumable',
    weight: 1,
    value: 18,
    usable: true,
    statBonus: { grit: 1 },
    useText: 'You work through the kit methodically. Eat the bar, mix the powder, patch the foot. You feel the road length differently after.',
    rarity: 'uncommon',
  },

  // ----------------------------------------------------------
  // Junk / Trade / Tools (new additions)
  // ----------------------------------------------------------

  salvaged_firearm_part: {
    id: 'salvaged_firearm_part',
    name: 'Salvaged Firearm Part',
    description: 'A machined component — bolt carrier, trigger group, or barrel — pulled from a weapon that can\'t be saved as a whole. The part itself is fine. Armorers will want it. The Salters pay well for mil-spec components.',
    type: 'junk',
    weight: 0.5,
    value: 12,
    rarity: 'common',
  },

  salt_1kg: {
    id: 'salt_1kg',
    name: 'Salt (1 kg)',
    description: 'A kilo of coarse salt in a sealed bag, Salt Creek Compact stamp on the label. Preservation, flavoring, trade. Salt Creek runs its economy on this. Out at Crossroads and the Covenant it\'s a recognized medium of exchange — not currency exactly, but close enough to spend.',
    type: 'junk',
    weight: 1,
    value: 8,
    rarity: 'common',
  },

  basic_repair_kit: {
    id: 'basic_repair_kit',
    name: 'Basic Repair Kit',
    description: 'A canvas roll of repair supplies: thread, needles, rivets, leather punches, small metal clips, and a tube of contact cement. Everything you need to keep worn gear from becoming dead gear. Mechanics and armorers sell these and also buy the salvage that makes them possible.',
    type: 'junk',
    weight: 1,
    value: 15,
    rarity: 'common',
  },

  leather_patch_kit: {
    id: 'leather_patch_kit',
    name: 'Leather Patch Kit',
    description: 'A small kit for field-repairing leather armor and gear: pre-cut leather patches in three thicknesses, contact cement, and a bone awl. Takes twenty minutes to use properly. Saves the armor you couldn\'t afford to replace.',
    type: 'junk',
    weight: 0.5,
    value: 12,
    rarity: 'common',
  },

  salvaged_components: {
    id: 'salvaged_components',
    name: 'Salvaged Components',
    description: 'A bundle of mixed salvage — springs, pins, small gears, washers, wire segments. The kind of parts that don\'t fit anything specific but fit everything eventually. Reclaimers call this category "inevitable inventory." Something in here will be exactly what you need in about three weeks.',
    type: 'junk',
    weight: 0.8,
    value: 7,
    rarity: 'common',
  },

  rare_parts_random: {
    id: 'rare_parts_random',
    name: 'Rare Salvage Parts',
    description: 'High-quality pre-Collapse components — machined to tolerances you can\'t match with hand tools. Optical glass, sealed bearings, precision gearing. Crossroads traders call these "rares" and price them accordingly. Every settlement wants them. Nobody has enough of them.',
    type: 'junk',
    weight: 0.5,
    value: 35,
    rarity: 'common',
  },

  electronics_kit: {
    id: 'electronics_kit',
    name: 'Electronics Kit',
    description: 'A canvas roll of electronics tools: soldering iron with tips, flux paste, solder, multimeter with spare batteries, wire strippers, and component trays with labeled resistors and capacitors. The Reclaimers at The Stacks would recognize this as a serious kit. It belongs to someone who knows what they\'re doing with it.',
    type: 'junk',
    weight: 1.5,
    value: 45,
    rarity: 'common',
  },

  welding_rod: {
    id: 'welding_rod',
    name: 'Welding Rod',
    description: 'A bundle of E6011 welding rods in a sealed tube, pre-Collapse stock. Still viable if kept dry — and these have been. Armorers, builders, and Reclaimers all want these. You can fix nearly anything if you can weld it.',
    type: 'junk',
    weight: 1,
    value: 14,
    rarity: 'common',
  },

  leather_belt: {
    id: 'leather_belt',
    name: 'Leather Belt',
    description: 'A heavy leather belt, brass buckle. It holds your gear, holds your pants, and with the right preparation can hold a sheath or holster. Simple. The kind of thing you don\'t think about until it breaks.',
    type: 'junk',
    weight: 0.4,
    value: 6,
    rarity: 'common',
  },

  knife_sheath: {
    id: 'knife_sheath',
    name: 'Knife Sheath',
    description: 'A molded leather sheath for a fixed-blade knife, with a retention snap and belt loop. Worn smooth at the draw. Whoever carried this drew it often enough to polish the leather.',
    type: 'junk',
    weight: 0.2,
    value: 8,
    rarity: 'common',
  },

  pistol_holster: {
    id: 'pistol_holster',
    name: 'Pistol Holster',
    description: 'A mid-ride leather holster, adjustable retention. Fits most compact and full-size pistols with some fitting. The thumb break works. The stitching is solid. You can draw cleanly without looking.',
    type: 'junk',
    weight: 0.3,
    value: 12,
    rarity: 'common',
  },

  // ----------------------------------------------------------
  // Ammunition (new additions)
  // ----------------------------------------------------------

  ammo_762: {
    id: 'ammo_762',
    name: '7.62mm Rounds',
    description: 'NATO 7.62x51. Heavier and slower than 5.56, harder to run in volume, but it goes through cover that stops smaller rounds. The Accord issues these. So does anyone who\'s been in a fight where light rifle rounds weren\'t enough.',
    type: 'currency',
    weight: 0,
    value: 5,
    rarity: 'common',
  },

  ammo_556: {
    id: 'ammo_556',
    name: '5.56mm Rounds',
    description: '5.56x45 NATO. The round that feeds the AR platform. Fast, accurate at distance, and common enough in Salter armories that supply lines exist. Worth less per round than .308, worth more than 9mm. The math on a firefight always comes back to this caliber.',
    type: 'currency',
    weight: 0,
    value: 4,
    rarity: 'common',
  },

  // ----------------------------------------------------------
  // Lore Items — Maps
  // ----------------------------------------------------------

  map_breaks_basic: {
    id: 'map_breaks_basic',
    name: 'Map — The Breaks',
    description: 'A hand-drawn map on waterproofed canvas, the canyon system rendered in careful pen lines with hazard notes.',
    type: 'lore',
    weight: 0,
    value: 25,
    usable: true,
    loreText: 'The Breaks: canyon country east of the River Road. The main trail drops three hundred feet over a quarter mile — marked in red. Red Court presence noted at the lower fork as of last season, though the notation below reads "cleared, unverified." Two water sources marked with blue circles. One has a check beside it and "confirmed, cold." The other just has a question mark. The cartographer signed it: "Best I could do without getting shot."',
    rarity: 'uncommon',
  },

  map_river_road: {
    id: 'map_river_road',
    name: 'Map — River Road',
    description: 'A folded road map with hand-drawn corrections, the original printed highway lines crossed out and redrawn to match the road as it exists now.',
    type: 'lore',
    weight: 0,
    value: 20,
    usable: true,
    loreText: 'River Road runs southwest to northeast along the Animas. Three crossings marked: Howard\'s Bridge (reliable), the log ford near mile marker 12 (seasonal — impassable spring runoff), and the ruins of the Route 550 overpass (structurally compromised, single-file only). Hollow activity noted at the overpass ruins. Drifter camp at mile marker 8 — listed as seasonal but a later note reads "permanent now, ask for Sal." A route to the Covenant is penciled along the western bank.',
    rarity: 'uncommon',
  },

  map_dust_partial: {
    id: 'map_dust_partial',
    name: 'Map — The Dust (Partial)',
    description: 'A partial map of the flatlands known as The Dust, roughly half of the territory sketched before the paper runs out.',
    type: 'lore',
    weight: 0,
    value: 15,
    usable: true,
    loreText: 'The Dust: open hardpan country, former agricultural land. The map covers the northern half only — whoever drew this either ran out of time or paper or both. What\'s here: the ghost town at the center marked with a skull icon and "HOLLOW — DO NOT CAMP"; two abandoned farmsteads marked with star symbols, the notation "scavenged, empty" beside one and "NOT scavenged yet" beside the other. The water tower is marked with a question mark and the note: "contamination warning, do NOT drink without treatment." The southern half of the map is blank.',
    rarity: 'uncommon',
  },

  // ----------------------------------------------------------
  // Crafted Items (produced by recipes — crafted_ prefix)
  // ----------------------------------------------------------

  crafted_purified_antiseptic: {
    id: 'crafted_purified_antiseptic',
    name: 'Purified Antiseptic',
    description: 'A glass bottle of concentrated antiseptic, distilled twice through salvaged lab filters until the liquid runs clear with a faint chemical bite. The smell is sharp and clean -- isopropyl cut with something botanical that the Shepherds add to reduce skin irritation. Each dose is measured by the capful. Two capfuls per wound, three if the wound has been open more than six hours. The difference between this and raw antiseptic is the difference between a scar and a grave.',
    type: 'consumable',
    weight: 0.5,
    healing: 6,
    value: 25,
    tier: 2,
    usable: true,
    useText: 'The antiseptic hisses against raw tissue. Clean heat, then nothing. The wound edges go pale. Stable. The infection risk drops to almost zero -- almost being the operative word in a world without sterile environments.',
    rarity: 'uncommon',
  },

  crafted_combat_medkit: {
    id: 'crafted_combat_medkit',
    name: 'Combat Medkit',
    description: 'A flat canvas pouch held shut with a strip of duct tape, packed tight: compression bandages pre-rolled and secured with wire ties, two pain tablets in a sealed foil blister, and a length of rubber tubing for tourniquet work. The whole thing fits against a hip or inside a vest. Designed by Salter enforcers for the ten seconds between getting hit and getting hit again -- when you cannot stop moving, cannot afford to black out, and cannot waste a single motion on something that does not keep you upright. Crude. Effective. The blood on the outside is from the last person who needed it.',
    type: 'consumable',
    weight: 1,
    healing: 10,
    value: 30,
    tier: 2,
    usable: true,
    useText: 'You tear the tape seal. Your hands know the order: tourniquet first, compression wrap second, pain tab dry-swallowed between steps. The bleeding slows. The pain dulls to a manageable roar. You keep moving because the alternative is not moving ever again.',
    rarity: 'uncommon',
  },

  crafted_trauma_kit: {
    id: 'crafted_trauma_kit',
    name: 'Trauma Kit',
    description: 'A proper field trauma package in a rigid plastic case that latches shut with two clasps. Inside: sterile gauze pads still in their original packaging, antiseptic solution in a squeeze bottle, compression bandages in three widths, a single dose of broad-spectrum antibiotics, and a laminated instruction card written in block letters by someone who assumed the reader would be shaking. This is what a field medic carries when they expect casualties that a bandage cannot handle -- the deep lacerations, the compound fractures, the wounds that kill in minutes if you do not know exactly what you are doing. Heavier than a combat medkit. Bulkier. Saves the lives that a combat medkit watches end.',
    type: 'consumable',
    weight: 2,
    healing: 20,
    value: 80,
    tier: 3,
    usable: true,
    useText: 'The work takes time. Gauze first to clear the field. Antiseptic -- the patient gasps. Compression wrap, tight enough to blanch the skin. Antibiotics administered. When it is done the wound is cleaned, closed, and treated. The laminated card says "reassess in four hours." You will not be here in four hours. But you will be alive.',
    rarity: 'uncommon',
  },

  crafted_improvised_trap: {
    id: 'crafted_improvised_trap',
    name: 'Improvised Trap',
    description: 'A spring-loaded contraption built from flattened scrap metal teeth and wire-coil tension bars, folded into a package roughly the size of a dinner plate. The trigger mechanism is a bent nail soldered to a pressure plate. Step on it and the teeth snap upward through whatever is above them -- boot leather, shin bone, the soft underside of a Hollow that does not watch where it drags itself. Drifters leave these in doorways. The Ferals have learned to check. Travelers have not. The device smells like rust and old solder.',
    type: 'consumable',
    weight: 1,
    damage: 8,
    value: 15,
    tier: 1,
    usable: true,
    useText: 'You set the trap low, pressure plate flush with the ground. The spring tension holds -- ugly but functional. Wire coil creaks once as it settles. Anything that steps here is going to have a very bad moment.',
    rarity: 'common',
  },

  crafted_reinforced_plate: {
    id: 'crafted_reinforced_plate',
    name: 'Reinforced Plate',
    description: 'Two sheets of salvaged scrap metal -- one from a car door panel, one from a section of industrial shelving -- hammered flat, stacked, and riveted together with eight hand-punched holes and eight bolts tightened until the metal warped slightly at the edges. The result is a rigid breastplate panel roughly fourteen inches square, heavy enough to shift your center of gravity when you wear it, thick enough to turn a knife blade and absorb the first round from a pipe weapon without passing the energy through to your ribs. The surface is scarred, dented, and still shows the ghost of an automotive paint job in faded blue. It works. That is all it needs to do.',
    type: 'armor',
    weight: 4,
    defense: 3,
    value: 20,
    tier: 2,
    armorTraits: ['fortified'],
    armorSlot: 'chest',
    rarity: 'rare',
  },

  crafted_pipe_weapon_improved: {
    id: 'crafted_pipe_weapon_improved',
    name: 'Improved Pipe Weapon',
    description: 'A salvaged firearm receiver -- the part that matters -- grafted onto a reinforced scrap-metal stock and barrel housing with machine screws and epoxy that has cured to a dull amber. The barrel is longer than a standard pipe weapon by four inches, threaded at the muzzle to reduce drift. The grip is wrapped in electrical tape over a shaped aluminum frame that actually fits a human hand. The trigger pull is still heavy and the action jams if you do not rack it cleanly between shots, but the grouping at fifteen meters has tightened from "somewhere over there" to "approximately where you aimed." Not military hardware. Not garbage either. Better than nothing, which out here is a category that keeps people alive.',
    type: 'weapon',
    weight: 3,
    damage: 6,
    value: 35,
    tier: 2,
    weaponTraits: ['keen'],
    rarity: 'rare',
  },

  crafted_incendiary_charge: {
    id: 'crafted_incendiary_charge',
    name: 'Incendiary Charge',
    description: 'A fist-sized scrap-metal canister packed with a chemical accelerant -- basic industrial solvents oxidized with a catalyst that the Kindling developed and do not discuss. A strip of cloth serves as the fuse, soaked in the same accelerant so it catches instantly from a spark or match head. The casing fragments on impact and spreads burning chemical across a two-meter radius. The fire is oily and orange and sticks to surfaces. It burns for roughly thirty seconds, long enough to clear a doorway, deny a corridor, or convince something that was chasing you to reconsider. The Salters stockpile these. The Ferals love them. Everyone else respects the smell of the fuse being lit.',
    type: 'consumable',
    weight: 1,
    damage: 10,
    value: 40,
    tier: 2,
    usable: true,
    useText: 'You strike the fuse. It catches with a hiss and a curl of acrid smoke. You throw. The canister hits, splits, and blooms -- oily orange fire spreading across the impact zone, sticking to everything it touches. The heat pushes against your face even from here.',
    rarity: 'common',
  },

  crafted_signal_booster: {
    id: 'crafted_signal_booster',
    name: 'Signal Booster',
    description: 'A directional antenna array assembled from electronics salvage -- capacitors, stripped circuit boards, a coil of copper wire wound tight around a plastic core and mounted on a swivel bracket made from a bent curtain rod. The whole assembly is held together with solder, zip ties, and a degree of optimism that borders on engineering. When powered by a battery pack wired to the base, the array pulls in signals that a standard receiver cannot detect: faint broadcast fragments, encrypted bursts, the low hum of MERIDIAN infrastructure that most people do not know is still transmitting. The Reclaimers build better versions of this. This version finds the signal. What you do with what you hear is your problem.',
    type: 'key',
    weight: 1,
    value: 60,
    tier: 2,
    usable: true,
    useText: 'You extend the antenna and rotate the array slowly. Static. More static. Then -- a carrier tone, faint but steady, buried under the noise floor. The signal booster locks on and the direction indicator settles. Southeast. Somewhere past the tree line. Something is broadcasting, and now you know where.',
    loreText: 'The signal booster picks up a repeating transmission on a frequency that pre-Collapse emergency services reserved for automated distress beacons. But this is not automated. The cadence is irregular. Someone is keying a transmitter by hand, sending the same message over and over. The signal is weak but it is real.',
    rarity: 'rare',
  },

  crafted_armor_patch: {
    id: 'crafted_armor_patch',
    name: 'Armor Patch',
    description: 'A field repair kit: a rectangle of scrap metal cut to size with tin snips, backed with a leather patch from a repair kit, bonded together with contact adhesive that smells like burning tires. You press it over the damaged section of your armor, hold it for sixty seconds while the adhesive cures, and the compromised area is reinforced again. Not a full restoration -- the original structure is still weakened underneath -- but it stops the damage from spreading and buys time until you can reach someone who knows metallurgy. Every scavenger carries a few of these. The ones who do not carry them do not come back.',
    type: 'consumable',
    weight: 0.5,
    defense: 1,
    value: 18,
    tier: 1,
    usable: true,
    useText: 'You press the patch over the damaged section and hold. The adhesive grips, bites, cures. Sixty seconds of pressure and the metal is bonded to the leather is bonded to the armor plate beneath. Not perfect. Better. The crack is sealed. It will hold until the next hit, and maybe the one after that.',
    rarity: 'common',
  },

  crafted_chemical_light: {
    id: 'crafted_chemical_light',
    name: 'Chemical Light',
    description: 'A clean water container repurposed as a diffusion vessel for a chemical luminescence reaction -- bleach oxidation with a scavenged indicator compound that the Reclaimers identified in the first cycle. The liquid inside glows a steady blue-green, bright enough to read by, dim enough to avoid drawing attention from more than twenty meters. Completely silent. No heat signature. Does not attract Hollows the way fire does, because Hollows track warmth and sound, not light. Each vessel glows for approximately four hours before the reaction exhausts itself and the liquid fades to a cloudy gray-green. Crack the seal to activate. Do not drink the contents.',
    type: 'consumable',
    weight: 0.2,
    value: 8,
    tier: 1,
    usable: true,
    useText: 'You crack the seal and shake once. The chemical reaction starts immediately -- blue-green light bleeding outward from the center of the liquid, steady and cold. The darkness pulls back. You can see the walls, the floor, the things that were standing in the dark watching you before you could see them. Silent light. Four hours. Use them well.',
    rarity: 'common',
  },

  crafted_lockpick_set: {
    id: 'crafted_lockpick_set',
    name: 'Improvised Lockpick Set',
    description: 'A roll of oiled canvas containing six wire picks and two tension wrenches, each piece hand-drawn from salvaged wire coil and heat-bent using electronics salvage schematics as a reference guide for standard pre-Collapse lock pin dimensions. The picks are not elegant -- slightly uneven gauges, file marks visible on the shaping -- but they work on anything up to a Grade 3 deadbolt if you have patience and steady hands. Drifters carry these as standard equipment. Wraiths carry better ones but started with versions exactly like this. The canvas roll smells faintly of machine oil and the metallic tang of worked copper.',
    type: 'key',
    weight: 0.2,
    value: 25,
    tier: 2,
    usable: true,
    useText: 'You unroll the canvas and select the pick by touch -- the right gauge for the keyway, the tension wrench seated at the bottom of the cylinder. Rake, set, feel for the pins. One. Two. The third pin resists, then gives with a soft click. The lock turns. Patience is the only skill this requires, and patience is the one thing the wastes teach everyone eventually.',
    rarity: 'rare',
  },

  crafted_antiviral_compound: {
    id: 'crafted_antiviral_compound',
    name: 'Antiviral Compound',
    description: 'A small glass vial containing a pale amber liquid -- a synthesized antiretroviral formulation built on a broad-spectrum antibiotics base, modified with molecular data from the R1 sequencing archive found in the Stacks. It does not cure CHARON-7 infection. Nothing cures CHARON-7. But it extends the viable window before neurological conversion by an estimated forty-eight to seventy-two hours and suppresses the early tremors, the light sensitivity, the creeping sense that your thoughts are not entirely your own. Long enough to reach a settlement. Long enough to say what needs to be said. Long enough, maybe, to do one more thing that matters. The Reclaimers have been trying to synthesize this for three cycles. You are holding what they could not build.',
    type: 'consumable',
    weight: 0.5,
    healing: 25,
    value: 200,
    tier: 4,
    usable: true,
    useText: 'You break the vial seal and drink. The taste is chemical and bitter, coating the back of your throat like cold metal. For ten seconds nothing happens. Then the tremors in your hands slow, stop, and the pressure behind your eyes -- the one you had stopped noticing because it had been there so long -- releases. The world sharpens. Your thoughts are your own again. You have time. Not much. Enough.',
    rarity: 'uncommon',
  },

  crafted_emp_device: {
    id: 'crafted_emp_device',
    name: 'EMP Device',
    description: 'A heavy cylindrical device the size of a canteen, built from a capacitor bank stripped from electronics salvage, a salvaged firearm discharge mechanism repurposed as the trigger, and a scrap-metal housing wrapped in copper wire that serves as the broadcast antenna. Single use. When triggered, the capacitor bank dumps its stored charge through the antenna in a single electromagnetic pulse that kills every electronic system within a fifteen-meter radius instantly -- MERIDIAN security panels, Salter communications equipment, automated defense turrets, the kind of infrastructure that does not need to see you to end you. The Reclaimers designed this. They are careful about who receives the schematics. You received them.',
    type: 'consumable',
    weight: 2,
    damage: 15,
    value: 150,
    tier: 4,
    usable: true,
    useText: 'You flip the safety cover and press the trigger. There is no sound. There is no flash. There is a sensation like the air being squeezed, a pressure wave that you feel in your fillings and behind your sternum, and then every light in the room dies at once. Screens go black. Servos wind down. The automated turret in the corner twitches once and stops. Silence, the kind that only exists when machines stop talking to each other.',
    rarity: 'uncommon',
  },

  crafted_fortified_armor: {
    id: 'crafted_fortified_armor',
    name: 'Fortified Armor',
    description: 'A pre-Collapse kevlar vest -- ballistic panels intact, ceramic trauma plate present -- with a hand-crafted reinforced plate bolted to the back and chest, doubling the protection at the cost of doubling the weight. The rivets are visible. The plate edges have been filed but not polished, and they catch on fabric when you move. The shoulder straps have been replaced with wider nylon webbing to distribute the load, and someone has sewn padding from a sleeping bag into the collar to prevent the metal edge from cutting into your neck during long wear. This is the best armor that can be built from what the wastes provide: military-grade ballistic protection married to improvised steel plating, held together with engineering knowledge and the understanding that comfort is not the priority. Stopping power is the priority. Everything else is a luxury the dead cannot appreciate.',
    type: 'armor',
    weight: 6,
    defense: 6,
    value: 180,
    tier: 5,
    armorTraits: ['fortified', 'reactive'],
    armorSlot: 'chest',
    rarity: 'legendary',
  },

  // ----------------------------------------------------------
  // Hazard Mitigation Gear
  // ----------------------------------------------------------

  filter_mask: {
    id: 'filter_mask',
    name: 'Filter Mask',
    description: 'A tight-fitting respirator with replaceable cartridge filters. Protects against airborne toxins, chemical agents, and gas hazards. The Reclaimers manufacture these for work in the contaminated zones.',
    type: 'armor',
    weight: 0.5,
    defense: 0,
    value: 35,
    usable: false,
    armorSlot: 'head',
    rarity: 'common',
  },

  cold_gear: {
    id: 'cold_gear',
    name: 'Cold Weather Gear',
    description: 'Layered thermal clothing: synthetic base layer, insulated mid-layer, wind shell. Rated for sub-zero exposure. Without this in the deep cold zones, your body does the arithmetic for you.',
    type: 'armor',
    weight: 2,
    defense: 1,
    value: 40,
    usable: false,
    armorTraits: ['insulated'],
    armorSlot: 'chest',
    rarity: 'common',
  },
}

export function getItem(id: string): Item | undefined {
  return ITEMS[id]
}

export function getAllItems(): Item[] {
  return Object.values(ITEMS)
}
