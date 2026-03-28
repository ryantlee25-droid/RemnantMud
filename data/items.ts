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
  },

  ammo_9mm: {
    id: 'ammo_9mm',
    name: '9mm Rounds',
    description: 'Nines. Worth more than pennies, less than a meal. A box of fifty is a serious transaction. A single round found on a body means someone ran out.',
    type: 'currency',
    weight: 0,
    value: 3,
  },

  ammo_shotgun_shell: {
    id: 'ammo_shotgun_shell',
    name: 'Shotgun Shell',
    description: 'Standard 12-gauge, #00 buckshot. The weight of it in your hand is the weight of a decision made in advance.',
    type: 'currency',
    weight: 0,
    value: 4,
  },

  // ----------------------------------------------------------
  // Weapons — Melee
  // ----------------------------------------------------------

  pipe_wrench: {
    id: 'pipe_wrench',
    name: 'Pipe Wrench',
    description: 'Fourteen inches of steel. The jaws are bent from something they were never meant to grip. Heavy enough to end an argument permanently.',
    type: 'weapon',
    weight: 3,
    damage: 3,
    value: 5,
  },

  hatchet: {
    id: 'hatchet',
    name: 'Hatchet',
    description: 'Camp hatchet. Handle replaced once with a hickory dowel. Holds an edge if you bother to keep it. Most people don\'t bother.',
    type: 'weapon',
    weight: 2,
    damage: 4,
    value: 8,
  },

  combat_knife: {
    id: 'combat_knife',
    name: 'Combat Knife',
    description: 'Good balance, seven-inch fixed blade. Fast in close quarters. The people who relied on this are mostly dead, but not from the knife.',
    type: 'weapon',
    weight: 1,
    damage: 4,
    value: 12,
  },

  machete: {
    id: 'machete',
    name: 'Machete',
    description: 'Ontario Knife Co., pre-Collapse. Reach, clearance, and authority. Still has the factory bevel. Whoever owned this took care of it. Now you do.',
    type: 'weapon',
    weight: 2,
    damage: 5,
    value: 15,
  },

  silver_knife: {
    id: 'silver_knife',
    name: 'Silver Knife',
    description: 'Eight-inch blade. The alloy is real — somebody went to serious effort. Against ordinary threats it\'s a good knife. Against Sanguine, nobody argues about why it works. It just does.',
    type: 'weapon',
    weight: 1,
    damage: 6,
    value: 80,
    usable: false,
  },

  // ----------------------------------------------------------
  // Weapons — Ranged
  // ----------------------------------------------------------

  hunting_rifle_damaged: {
    id: 'hunting_rifle_damaged',
    name: 'Hunting Rifle (Damaged)',
    description: 'Bolt-action, cracked stock wrapped tight with electrical tape. The barrel is true but the stock flex makes follow-up shots slow. Functional. Not reliable.',
    type: 'weapon',
    weight: 5,
    damage: 8,
    value: 20,
  },

  '22_rifle': {
    id: '22_rifle',
    name: '.22 Rifle',
    description: 'Ruger 10/22. Reliable in the way that only common, simple things can be. Accepts the most common ammunition in the region. Not glamorous. Still alive.',
    type: 'weapon',
    weight: 4,
    damage: 6,
    value: 35,
  },

  '9mm_pistol': {
    id: '9mm_pistol',
    name: '9mm Pistol',
    description: 'Standard sidearm. Glock 17, finish worn silver at the rails. Forty-round drum in the mag well is someone\'s field modification. It works until it doesn\'t.',
    type: 'weapon',
    weight: 2,
    damage: 7,
    value: 45,
  },

  shotgun: {
    id: 'shotgun',
    name: 'Shotgun',
    description: 'Mossberg 500, barrel cut to eighteen inches. Inside thirty feet it doesn\'t need to be accurate. Outside thirty feet, you\'re holding a very heavy club.',
    type: 'weapon',
    weight: 5,
    damage: 12,
    value: 60,
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
  },

  elk_jerky: {
    id: 'elk_jerky',
    name: 'Elk Jerky',
    description: 'Dried and salted in the old way. Someone knew what they were doing. It tastes like something that was once alive and cared for. That\'s rare.',
    type: 'consumable',
    weight: 1,
    healing: 3,
    value: 6,
    usable: true,
    useText: 'You eat. It is good. You allow yourself to register that it is good.',
  },

  water_bottle_sealed: {
    id: 'water_bottle_sealed',
    name: 'Sealed Water Bottle',
    description: 'A clear. Sealed, verified source. Water you don\'t have to think about before drinking. You forgot how good that felt until the first time you had to think about it.',
    type: 'consumable',
    weight: 2,
    healing: 2,
    value: 4,
    usable: true,
    useText: 'You drink. Clean. Cold. The thirst recedes.',
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
  },

  textiles: {
    id: 'textiles',
    name: 'Textiles',
    description: 'Bolt cloth — denim, canvas, synthetic fleece, whatever survived. Bandages, insulation, trade. The most useful thing is usually the softest.',
    type: 'junk',
    weight: 2,
    value: 3,
  },

  electronics_salvage: {
    id: 'electronics_salvage',
    name: 'Electronics Salvage',
    description: 'Circuit boards, capacitors, stripped cable, component lots. The Reclaimers want all of it. The price fluctuates with whatever they\'re currently building.',
    type: 'junk',
    weight: 1,
    value: 8,
  },

  chemicals_basic: {
    id: 'chemicals_basic',
    name: 'Basic Chemicals',
    description: 'Bleach, acetone, isopropyl, lye. Industrial quantities, partial containers. Useful to people who know what they\'re doing. Dangerous to people who think they do.',
    type: 'junk',
    weight: 2,
    value: 5,
  },

  wire_coil: {
    id: 'wire_coil',
    name: 'Wire Coil',
    description: 'Twenty meters of solid 14-gauge stripped from a junction box. Tight coil, no kinks. Insulation intact. Reclaimers and tinkerers will compete for this.',
    type: 'junk',
    weight: 1,
    value: 4,
  },

  juniper_firewood: {
    id: 'juniper_firewood',
    name: 'Juniper Firewood',
    description: 'A bundle of juniper, dried and split. Burns clean and long, smells like something the world used to be. Worth almost nothing. Worth everything on a cold night.',
    type: 'junk',
    weight: 3,
    value: 1,
  },

  river_stone_flat: {
    id: 'river_stone_flat',
    name: 'Flat River Stone',
    description: 'Palm-sized, smooth from the Animas. Makes a decent honing surface in a pinch. Otherwise trades as a joke among Drifters. Sometimes jokes are worth something.',
    type: 'junk',
    weight: 1,
    value: 1,
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
  },

  bunker_access_badge: {
    id: 'bunker_access_badge',
    name: 'Bunker Access Badge',
    description: 'Laminated badge, Salter-issue, the inner-vault authorization code printed in the corner in font too small to read without effort. Someone in the stronghold lost this.',
    type: 'key',
    weight: 0,
    value: 0,
  },

  deep_mine_rope: {
    id: 'deep_mine_rope',
    name: 'Deep Mine Rope',
    description: 'Sixty-foot static kern-mantle, rated to eight hundred pounds. The vertical shaft in The Deep doesn\'t offer another way down. This is the way down.',
    type: 'key',
    weight: 4,
    value: 5,
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
  },

  // ----------------------------------------------------------
  // Scavenged Goods — Junk
  // ----------------------------------------------------------

  empty_water_bottle: {
    id: 'empty_water_bottle',
    name: 'Empty Water Bottle',
    description: 'A plastic bottle. Empty. Worth something to someone who\'s thirsty.',
    type: 'junk',
    weight: 0.3,
    value: 1,
  },

  lighter_disposable: {
    id: 'lighter_disposable',
    name: 'Disposable Lighter',
    description: 'A plastic lighter. Still has fluid.',
    type: 'junk',
    weight: 0.1,
    value: 2,
  },

  old_binoculars: {
    id: 'old_binoculars',
    name: 'Old Binoculars',
    description: 'Old binoculars. One lens cracked, the other still works.',
    type: 'junk',
    weight: 0.8,
    value: 3,
  },

  binoculars_intact: {
    id: 'binoculars_intact',
    name: 'Intact Binoculars',
    description: 'Military-grade binoculars. Both lenses clear.',
    type: 'junk',
    weight: 0.9,
    value: 8,
  },

  can_opener_quality: {
    id: 'can_opener_quality',
    name: 'Quality Can Opener',
    description: 'A good can opener. The kind that doesn\'t slip.',
    type: 'junk',
    weight: 0.3,
    value: 2,
  },

  cast_iron_skillet: {
    id: 'cast_iron_skillet',
    name: 'Cast-Iron Skillet',
    description: 'A cast-iron skillet. Heavy. Could cook with it. Could fight with it.',
    type: 'junk',
    weight: 2.0,
    value: 4,
  },

  hand_tools_basic: {
    id: 'hand_tools_basic',
    name: 'Basic Hand Tools',
    description: 'Hammer, screwdriver, pliers. Basic tools. Useful.',
    type: 'junk',
    weight: 1.5,
    value: 5,
  },

  gun_oil: {
    id: 'gun_oil',
    name: 'Gun Oil',
    description: 'Gun oil. Keeps metal from rusting.',
    type: 'junk',
    weight: 0.2,
    value: 3,
  },

  crafting_components: {
    id: 'crafting_components',
    name: 'Crafting Components',
    description: 'Various small parts. Gears, wires, clips. Something useful in here.',
    type: 'junk',
    weight: 0.8,
    value: 4,
  },

  salvaged_engine_part: {
    id: 'salvaged_engine_part',
    name: 'Salvaged Engine Part',
    description: 'An engine component. Heavy and oily. Someone might want this.',
    type: 'junk',
    weight: 3.0,
    value: 6,
  },

  mineral_sample: {
    id: 'mineral_sample',
    name: 'Mineral Sample',
    description: 'A rock sample. Labeled in faded pencil. Worth something to the right buyer.',
    type: 'junk',
    weight: 0.5,
    value: 2,
  },

  smooth_river_stone: {
    id: 'smooth_river_stone',
    name: 'Smooth River Stone',
    description: 'A smooth river stone. Fits perfectly in the palm.',
    type: 'junk',
    weight: 0.4,
    value: 1,
  },

  tinder_bundle: {
    id: 'tinder_bundle',
    name: 'Tinder Bundle',
    description: 'Dry bark and grass, bound with twine. Lights fast.',
    type: 'junk',
    weight: 0.3,
    value: 1,
  },

  fire_starter_kit: {
    id: 'fire_starter_kit',
    name: 'Fire Starter Kit',
    description: 'Flint, steel, and tinder. The old way.',
    type: 'junk',
    weight: 0.4,
    value: 3,
  },

  wild_herbs: {
    id: 'wild_herbs',
    name: 'Wild Herbs',
    description: 'A bundle of wild herbs. Medicinal or culinary — you\'re not sure which.',
    type: 'junk',
    weight: 0.2,
    value: 2,
  },

  ghost_sage_sprig: {
    id: 'ghost_sage_sprig',
    name: 'Ghost Sage Sprig',
    description: 'Ghost sage. Pale and aromatic. Used in Covenant purification rites.',
    type: 'junk',
    weight: 0.1,
    value: 3,
  },

  fishing_line_improvised: {
    id: 'fishing_line_improvised',
    name: 'Improvised Fishing Line',
    description: 'A length of monofilament with a bent-hook lure.',
    type: 'junk',
    weight: 0.2,
    value: 2,
  },

  scavenging_useful_bones: {
    id: 'scavenging_useful_bones',
    name: 'Useful Bones',
    description: 'Hollow bones. Useful for making tools, needles, or charms.',
    type: 'junk',
    weight: 0.3,
    value: 2,
  },

  hollow_nest_salvage: {
    id: 'hollow_nest_salvage',
    name: 'Hollow Nest Salvage',
    description: 'Material pulled from a Hollow nest. Organic fiber and shed chitinous shell.',
    type: 'junk',
    weight: 0.6,
    value: 4,
  },

  soap_bar: {
    id: 'soap_bar',
    name: 'Bar of Soap',
    description: 'A bar of soap. Mostly used. Still works.',
    type: 'junk',
    weight: 0.2,
    value: 1,
  },

  room_key_motel: {
    id: 'room_key_motel',
    name: 'Motel Room Key',
    description: 'A motel room key. Old brass. Room 7 is stamped on the fob.',
    type: 'junk',
    weight: 0.05,
    value: 1,
  },

  motel_bible: {
    id: 'motel_bible',
    name: 'Motel Bible',
    description: 'A Gideons Bible. Someone crossed out the 23rd Psalm and wrote something else.',
    type: 'junk',
    weight: 0.4,
    value: 1,
  },

  empty_cola_can: {
    id: 'empty_cola_can',
    name: 'Empty Cola Can',
    description: 'An empty cola can. Pre-collapse brand. You could still read the logo if you squinted.',
    type: 'junk',
    weight: 0.05,
    value: 0,
  },

  backpack_child: {
    id: 'backpack_child',
    name: 'Child\'s Backpack',
    description: 'A child\'s backpack. Small. Covered in faded cartoon characters.',
    type: 'junk',
    weight: 0.3,
    value: 1,
  },

  lost_cargo_crate: {
    id: 'lost_cargo_crate',
    name: 'Lost Cargo Crate',
    description: 'A sealed cargo crate. Something inside shifts when you move it.',
    type: 'junk',
    weight: 5.0,
    value: 10,
  },

  // ----------------------------------------------------------
  // Scavenged Goods — Weapons
  // ----------------------------------------------------------

  rebar_club: {
    id: 'rebar_club',
    name: 'Rebar Club',
    description: 'A length of rebar. Heavy. Blunt. Effective.',
    type: 'weapon',
    weight: 2.5,
    damage: 6,
    value: 4,
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
  },

  canned_food_random: {
    id: 'canned_food_random',
    name: 'Canned Food',
    description: 'A dented can. Label gone. You peel it open and eat without looking.',
    type: 'consumable',
    weight: 1.0,
    healing: 15,
    value: 5,
    usable: true,
    useText: 'You eat. It\'s fine. You don\'t ask what it was.',
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
  },

  dried_meat_strip: {
    id: 'dried_meat_strip',
    name: 'Dried Meat Strip',
    description: 'Salted and dried. Chewy. Better than nothing.',
    type: 'consumable',
    weight: 0.3,
    healing: 10,
    value: 3,
    usable: true,
    useText: 'You chew. It takes a while. It keeps you going.',
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
  },

  // ----------------------------------------------------------
  // Scavenged Goods — Medical
  // ----------------------------------------------------------

  bandages_clean: {
    id: 'bandages_clean',
    name: 'Clean Bandages',
    description: 'Sterile bandages. Still in the wrapper.',
    type: 'consumable',
    weight: 0.2,
    healing: 12,
    value: 10,
    usable: true,
    useText: 'You wrap the wound with clean gauze. It holds.',
  },

  first_aid_kit_basic: {
    id: 'first_aid_kit_basic',
    name: 'Basic First Aid Kit',
    description: 'A red cross kit. Half the supplies are still inside.',
    type: 'consumable',
    weight: 1.5,
    healing: 30,
    value: 25,
    usable: true,
    useText: 'You open the kit and work through it methodically. Gauze, tape, antiseptic. Better.',
  },

  field_dressing: {
    id: 'field_dressing',
    name: 'Field Dressing',
    description: 'Field dressing. The kind you press into a wound with your palm.',
    type: 'consumable',
    weight: 0.4,
    healing: 15,
    value: 12,
    usable: true,
    useText: 'You press the dressing into the wound. The bleeding slows.',
  },

  fresh_water_container: {
    id: 'fresh_water_container',
    name: 'Fresh Water Container',
    description: 'A container of clean water. Rare enough to be valuable.',
    type: 'consumable',
    weight: 1.2,
    healing: 10,
    value: 8,
    usable: true,
    useText: 'You drink. Clean water. You forgot how good that feels.',
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
  },

  radio_signal_fragment: {
    id: 'radio_signal_fragment',
    name: 'Radio Signal Fragment',
    description: 'A decoded partial transmission on a strip of thermal printer paper.',
    type: 'lore',
    weight: 0,
    value: 0,
    usable: true,
    loreText: '...if you can hear this, the signal is still running. CHARON-7 is still running. We didn\'t stop it. We just moved the dial. Find the source. Find the choice. What you do with it... [signal degrades]',
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
  },

  leather_jacket: {
    id: 'leather_jacket',
    name: 'Leather Jacket',
    description: 'Pre-Collapse motorcycle jacket, heavy cowhide with armored elbows and a cracked back panel. Whoever wore this last rode something fast into something hard. The road rash on the left shoulder is from asphalt, not teeth. The jacket survived. Whether the rider did is a question the jacket does not answer.',
    type: 'armor',
    weight: 3,
    defense: 2,
    value: 18,
  },

  reinforced_coat: {
    id: 'reinforced_coat',
    name: 'Reinforced Coat',
    description: 'A long leather duster with steel plates sewn into the lining — shoulder, chest, and kidney panels. Someone with tailoring skills and access to a rivet gun spent serious hours on this. It moves well for something with metal in it. The weight settles across the shoulders like a hand that is not entirely reassuring.',
    type: 'armor',
    weight: 5,
    defense: 3,
    value: 45,
  },

  kevlar_vest: {
    id: 'kevlar_vest',
    name: 'Kevlar Vest',
    description: 'Military-grade body armor, pre-Collapse manufacture. The ballistic panels are intact, the carrier is faded to a gray that was once tan. The Velcro still works. The ceramic trauma plate is cracked but present. This kept someone alive through the first year. The bloodstain on the collar suggests it did not keep them alive through the second.',
    type: 'armor',
    weight: 4,
    defense: 4,
    value: 80,
  },

  hazmat_suit: {
    id: 'hazmat_suit',
    name: 'Hazmat Suit',
    description: 'Level B hazmat suit, bright yellow turned brown by seven years of atmosphere. The seals are intact. The respirator filters are third-generation replacements — someone has been maintaining this. It won\'t stop a blade, but it seals against CHARON-7 spore exposure, and in the zones where the air itself is the weapon, that matters more than steel.',
    type: 'armor',
    weight: 4,
    defense: 2,
    value: 35,
  },
}

export function getItem(id: string): Item | undefined {
  return ITEMS[id]
}

export function getAllItems(): Item[] {
  return Object.values(ITEMS)
}
