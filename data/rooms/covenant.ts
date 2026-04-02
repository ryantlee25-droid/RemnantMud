import type { Room } from '@/types/game'

// ============================================================
// COVENANT — 28 Rooms
// The Accord's capital. Population ~800. Act I–II.
// ============================================================

export const COVENANT_ROOMS: Room[] = [

  // ----------------------------------------------------------
  // CV-01: Main Gate
  // ----------------------------------------------------------
  {
    id: 'cv_01_main_gate',
    name: 'Covenant — Main Gate',
    zone: 'covenant',
    act: 1,
    difficulty: 1,
    visited: false,
    flags: { noCombat: true, fastTravelWaypoint: true },
    description: 'Two decommissioned school buses, nose to nose across the road, form the outer gate of Covenant — the most sophisticated thing you\'ve seen in months. The gap between them is blocked by a horizontal steel bar that a militiaman lifts with practiced boredom. A hand-lettered sign bolted to the yellow flank reads: COVENANT — ACCORD TERRITORY — ALL WEAPONS DECLARED AT THE GATE. Below it, in smaller letters: This means you. Sentries on the bus rooftops track you from behind scavenged rifle scopes. This is what civilization looks like now: functional, defended, and watching.',
    descriptionNight: 'The school buses loom in the dark, their yellow paint turned gray by moonlight. Lanterns hang from iron hooks at either corner of the gate, throwing a hard amber circle on the ground. The militiaman on duty has a military surplus rifle and the look of someone who has made this shift many times and will make it many more. The sign is still there. You can still read it.',
    shortDescription: 'The school bus gate of Covenant, manned by Accord militia.',
    exits: {
      south: 'rr_12_covenant_outskirts',
      north: 'cv_02_gate_square',
      east: 'cv_26_refugee_processing',
    },
    richExits: {},
    items: [],
    enemies: [],
    npcs: [],
    extras: [
      {
        keywords: ['sign', 'lettering', 'notice'],
        description: 'The paint is house-brand latex, sun-faded to rose pink from what was once a bold red. Someone repaints it every season — the layers are visible at the edges. COVENANT — ACCORD TERRITORY — ALL WEAPONS DECLARED AT THE GATE. Underneath: This means you. Someone has added in blue marker: seriously though.',
      },
      {
        keywords: ['bus', 'buses', 'school bus', 'yellow'],
        description: 'Two full-size school buses, stripped of glass and seats, reinforced with welded steel plate along the lower flanks. The wheel wells are filled with packed earth and concrete rubble to prevent rolling. Whatever kids these buses once carried, they carry something else now: the weight of everyone behind the gate.',
      },
      {
        keywords: ['sentry', 'sentries', 'rooftop', 'militiaman', 'militia'],
        description: 'Three that you can see. Probably more you can\'t. They wear mismatched armor — leather, canvas, a single piece of police-issue tactical vest — but their rifles are clean and their eyes are steady. Accord militia don\'t pick fights. They finish them.',
      },
      {
        keywords: ['gate', 'bar', 'crossing'],
        description: 'The horizontal bar is a salvaged highway guardrail section, painted orange and black in alternating stripes. A counterweight on one end means a single person can raise it. The militiaman doesn\'t ask your business. He just watches your hands.',
      },
    ],
    npcSpawns: [
      {
        npcId: 'accord_gate_militiaman',
        spawnChance: 0.95,
        spawnType: 'anchored',
        quantity: { min: 1, max: 2, distribution: 'weighted_low' },
        activityPool: [
          { desc: 'A militiaman in a stitched canvas vest stands at the gate bar, one hand resting on it, watching you approach with professional neutrality.', weight: 4 },
          { desc: 'A militiaman checks your silhouette against the sky, then lifts the bar with a practiced motion. "Declare anything you\'re carrying in. No exceptions."', weight: 3 },
          { desc: 'Two militia trade off at the gate — one going off-shift, one coming on. Neither takes their eyes off the approach road while they talk.', weight: 2 },
        ],
        dispositionRoll: { friendly: 0.1, neutral: 0.7, wary: 0.2, hostile: 0.0 },
        dialogueTree: 'cv_gate_militia_intro',
      },
    ],
    itemSpawns: [],
    narrativeNotes: 'Entry point to Covenant. Sets the tone — civilization exists here, but it is enforced, not assumed. The buses are from the game bible\'s description of Covenant\'s fortifications.',
  },

  // ----------------------------------------------------------
  // CV-02: Gate Square
  // ----------------------------------------------------------
  {
    id: 'cv_02_gate_square',
    name: 'Covenant — Gate Square',
    zone: 'covenant',
    act: 1,
    difficulty: 1,
    visited: false,
    flags: { noCombat: true, questHub: true },
    description: 'Inside the gate, the road opens into a broad square that smells of cook smoke, sawdust, and unwashed clothing in proportions that somehow add up to something human. Market stalls ring the perimeter — not the desperate improvised trading of roadside camps, but proper stalls with actual tables and price boards and vendors who don\'t keep a hand on a weapon while they conduct business. A central notice board is papered three layers deep with hand-written postings: jobs, missing persons, trades wanted, warnings, and one beautifully hopeful marriage announcement. An Accord patrol moves through the square in a loose two-person formation, heads on a swivel, but easy about it.',
    descriptionNight: 'The square quiets at night but doesn\'t sleep. The market vendors have locked their stalls behind plywood shutters, but the two tavern fires at the square\'s north end burn on. People move in small clusters, voices low. The notice board is unlit, but someone has left a lantern hanging from the post anyway — for late readers.',
    shortDescription: 'The main square inside Covenant\'s gate, alive with market trade and notice postings.',
    exits: {
      south: 'cv_01_main_gate',
      north: 'cv_03_main_street',
      east: 'cv_07_infirmary',
      west: 'cv_11_workshop',
    },
    richExits: {},
    items: [],
    enemies: [],
    npcs: [],
    extras: [
      {
        keywords: ['notice board', 'board', 'postings', 'flyers'],
        description: 'The board is a sheet of corkboard mounted on a salvaged door. The layers: bottom layer is old, barely readable — job postings from a year ago, a missing child notice that has gone unanswered long enough that you don\'t want to think about what that means. Middle layer is newer — supply requests, patrol schedules, a hand-drawn map of Hollow sightings to the east. Top layer is current — three job postings, a trade offer for fresh antibiotics, and that marriage announcement. Someone wrote CONGRATULATIONS on a separate piece of paper and pinned it next to the announcement.',
      },
      {
        keywords: ['market', 'stalls', 'vendors'],
        description: 'Six permanent stalls and a rotating cast of day traders with folding tables. The permanent vendors are Accord citizens with established spots and trading reputations. The day traders pay a small pitch fee to the gate duty officer. It\'s a small economy, organized with the kind of careful pragmatism that keeps eight hundred people alive in a dead world.',
      },
      {
        keywords: ['patrol', 'accord', 'militia', 'guard'],
        description: 'The Gate Square patrol runs a circuit every twenty minutes. Two people, always. They\'re not looking for trouble — they\'re presence, a reminder that order is maintained here by more than goodwill. They nod to vendors they know. They check faces they don\'t recognize, like yours, with polite, unmistakable attention.',
      },
      {
        keywords: ['marriage', 'announcement', 'congratulations'],
        description: 'The announcement reads: Dara Kellish and Tevan Morales are to be married at the Chapel on the 14th. All Covenant residents welcome. Bring nothing. Come anyway. Underneath, a dozen different hands have added their names.',
      },
      {
        keywords: ['denied', 'petition', 'intake', 'refugee', 'policy', 'limits'],
        description: 'Pinned to the lower right corner of the notice board, half-covered by the marriage announcement: a printed form titled ACCORD REFUGEE INTAKE — PETITION FOR PROVISIONAL RESIDENCY. The boxes are filled in with careful handwriting — a family of four, arrived from the south corridor, two children under ten. Across the bottom, in red stamp ink: DENIED — INTAKE CAP REACHED — REVIEWED BY CIVIL COMMITTEE 14/3. Below the stamp, in smaller handwriting: Directed to temporary shelter outside eastern wall. Review period: 90 days. The form is dated eleven weeks ago. There is no follow-up form. The marriage announcement covers most of it, which may or may not be deliberate.',
      },
    ],
    npcSpawns: [
      {
        npcId: 'market_vendor_covenant',
        spawnChance: 0.85,
        spawnType: 'anchored',
        activityPool: [
          { desc: 'A stout woman arranges canned goods on a table by category, then by date stamp, rotating the older cans to the front. She does this without looking at them.', weight: 3 },
          { desc: 'A vendor calls prices in a steady singsong: "Water tabs, two pennies. Gauze, one penny. Come on, who needs gauze?"', weight: 2 },
        ],
        tradeInventory: ['purification_tabs', 'gauze', 'canned_food', 'salt_1kg'],
        dispositionRoll: { friendly: 0.5, neutral: 0.4, wary: 0.1, hostile: 0.0 },
      },
      {
        npcId: 'accord_square_patrol',
        spawnChance: 0.90,
        spawnType: 'patrol',
        activityPool: [
          { desc: 'An Accord patrol pair moves through the square at a measured walk, eyes moving without urgency, professionals doing their job.', weight: 3 },
          { desc: 'One of the patrol officers stops to speak with a vendor — something in the exchange has the shape of a routine check, not a problem.', weight: 2 },
        ],
        dispositionRoll: { friendly: 0.2, neutral: 0.6, wary: 0.2, hostile: 0.0 },
      },
    ],
    personalLossEchoes: {
      child: 'The notice board. Bottom layer. A missing child notice that has gone unanswered long enough. You read the age and the description and your vision narrows and you stop reading because the specificity of a missing child is not something you can hold right now.',
      partner: 'The marriage announcement on the board. Someone found someone, here, in this. The congratulations note pinned beside it. You are happy for them in the way that a person holding an empty cup is happy for a person holding a full one.',
      community: 'Market stalls with price boards. An Accord patrol. A notice board with job postings. You stand in the square and the shape of it — the commerce, the governance, the shared space — is so familiar that your throat closes. You had this. Not this exactly. But this.',
      identity: 'A vendor calls out prices and you know them — not these prices, but the rhythm of it, the cadence of a market day. You knew a place like this. You were someone who came to places like this. The knowledge is certain and the details are gone.',
      promise: 'The job postings on the board. Someone needs something done. The format is familiar — the obligation, the expectation, the implicit contract between asking and answering. You had a contract like that once. Yours wasn\'t posted on a board. Yours was spoken aloud to someone who believed you.',
    },
    itemSpawns: [
      {
        entityId: 'discarded_flyer',
        spawnChance: 0.35,
        quantity: { min: 1, max: 1, distribution: 'single' },
        conditionRoll: { min: 0.4, max: 0.9 },
        groundDescription: 'A notice has fallen from the board and lies in the square dust.',
        depletion: { cooldownMinutes: { min: 90, max: 240 }, respawnChance: 0.3 },
      },
    ],
  },

  // ----------------------------------------------------------
  // CV-03: Main Street
  // ----------------------------------------------------------
  {
    id: 'cv_03_main_street',
    name: 'Covenant — Main Street',
    zone: 'covenant',
    act: 1,
    difficulty: 1,
    visited: false,
    flags: { noCombat: true },
    description: 'Main Street runs north–south through the heart of Covenant along what was once a county road, straight and wide enough for two vehicles to pass — though no vehicles use it now. On either side, the pre-Collapse buildings have been repaired, reinforced, and in several cases combined into larger structures by knocking through shared walls. Window boxes with actual growing things: herbs, a few scrubby tomato plants, one astonishing pot of marigolds, intensely orange in the gray-brown palette of the world. People are out. Walking with purpose, exchanging words, carrying things. The ordinary miracle of human density, compressed into one road in the ruins of everywhere else.',
    descriptionNight: 'After dark, Main Street belongs to the people who can\'t sleep — which is most of them, if you asked. A few lanterns burn in upper windows. Voices drift down from a building where someone is playing a guitar badly but earnestly. The smell of supper still in the air.',
    shortDescription: 'Covenant\'s central street, lined with repaired buildings and small signs of life.',
    exits: {
      south: 'cv_02_gate_square',
      north: 'cv_04_courthouse',
      east: 'cv_08_riverside_district',
      west: 'cv_09_the_school',
    },
    richExits: {},
    items: [],
    enemies: [],
    npcs: [],
    extras: [
      {
        keywords: ['window box', 'marigolds', 'flowers', 'herbs', 'tomatoes', 'garden'],
        description: 'The window boxes are new. Someone started them last spring, according to a resident you overhear. It caught on. Now half the buildings on the street have one. The marigolds are particularly stubborn survivors — orange and indifferent to the world\'s opinions about what should still be beautiful.',
      },
      {
        keywords: ['buildings', 'houses', 'structures'],
        description: 'Pre-Collapse: a hardware store, a realtor\'s office, a gas station converted to a workshop, three residential buildings. Post-Collapse: still those things, but denser. Families have moved into commercial spaces. Communal areas have been created by removing interior walls. The hardware store is now a combination residence and medical supply cache.',
      },
      {
        keywords: ['people', 'residents', 'citizens'],
        description: 'Not all survivors look the same. Covenant\'s eight hundred include young children, elderly people, people in various states of recovery from injuries that would have been straightforwardly treatable before the Collapse. They\'ve made it this far. The weight of that is in their faces, but so is something else — something that doesn\'t have a simple name.',
      },
    ],
    npcSpawns: [
      {
        npcId: 'covenant_resident_wanderer',
        spawnChance: 0.70,
        spawnType: 'wanderer',
        activityPool: [
          { desc: 'A man walks the street carrying a bundle of firewood under each arm, nodding to the people he passes without breaking stride.', weight: 3 },
          { desc: 'Two women stand outside a doorway in conversation, one of them gesturing with a hand tool toward the building\'s upper story — repairs being planned.', weight: 2 },
          { desc: 'A teenager is painting the lower half of a building wall with a dark brown sealant, working methodically from a bucket at her feet.', weight: 2 },
        ],
        dispositionRoll: { friendly: 0.4, neutral: 0.5, wary: 0.1, hostile: 0.0 },
      },
    ],
    itemSpawns: [],
  },

  // ----------------------------------------------------------
  // CV-04: The Courthouse
  // ----------------------------------------------------------
  {
    id: 'cv_04_courthouse',
    name: 'Covenant — The Courthouse',
    zone: 'covenant',
    act: 1,
    difficulty: 1,
    visited: false,
    flags: { noCombat: true, questHub: true },
    description: 'The old county courthouse has become Covenant\'s civic heart — the building that was already built for authority slides naturally back into the role. The main floor houses Marshal Cross\'s public office, a records room that doubles as a library, and a long bench where Accord citizens wait to petition. The wood floors are swept clean. The flag above the door is Accord blue — a torch on gray — not an old-world national flag, but something made new by people who are making everything new. A clerk writes at a standing desk, glancing up when you enter. The smell of paper and lamp oil and the faint trace of bureaucracy managing to survive the end of the world.',
    descriptionNight: 'The courthouse keeps evening hours. Marshal Cross often works late — a habit, a statement of principle, or both. The public floor is lit by three oil lamps that cast pools of warm light on a half-dozen people still waiting to be heard. The clerk is still at the standing desk. Some jobs don\'t stop when the sun goes down.',
    shortDescription: 'The county courthouse, now Accord HQ and Marshal Cross\'s office.',
    exits: {
      south: 'cv_03_main_street',
      north: 'cv_06_armory',
      east: 'cv_13_granary',
      west: 'cv_10_the_chapel',
      up: 'cv_05_courthouse_upper',
    },
    richExits: {
      up: {
        destination: 'cv_05_courthouse_upper',
        descriptionVerbose: 'the stairs to the upper floor war room',
        reputationGate: { faction: 'accord', minLevel: 2 },
      },
    },
    items: [],
    enemies: [],
    npcs: [],
    extras: [
      {
        keywords: ['flag', 'accord', 'torch', 'banner'],
        description: 'The Accord flag is homemade — sewn from canvas salvage, the design agreed on by vote in the first month of Covenant\'s founding. A torch burning upright on a gray field. The gray is for no illusions. The torch is for keeping them anyway. Marshal Cross had the final vote when the committee deadlocked. She chose the torch.',
      },
      {
        keywords: ['cross', 'marshal', 'office'],
        description: 'Marshal Cross\'s office door is open. This is policy, not habit — she made the decision early that an open door signals availability, which signals trustworthiness, which signals the kind of leadership she intends to model. She\'s at her desk now, reading a report with the focus of someone who has already read it twice and is looking for what she missed.',
      },
      {
        keywords: ['records', 'library', 'books', 'shelves'],
        description: 'The records room holds what survived: property records that no longer mean anything, civil court files from cases nobody remembers, and a library donated by residents — whatever they could carry in. Someone has organized it with care. Fiction is alphabetical. Non-fiction is sorted by topic, hand-labeled with pieces of masking tape.',
      },
      {
        keywords: ['clerk', 'standing desk', 'writing'],
        description: 'The clerk is a young man, maybe twenty, who writes fast and legibly — the handwriting of someone who took notes seriously and never stopped. He handles petitions, requests, and the enormous volume of paperwork that running eight hundred people apparently generates. He\'s been doing this for two years. He\'s getting better at knowing which questions the Marshal actually wants to hear.',
      },
      {
        keywords: ['bench', 'citizens', 'petition', 'waiting'],
        description: 'The bench holds four people right now. A family disputing a housing assignment. A woman with a supply request. A man who looks like he has a grievance and has been told, more than once, to put it in writing first. The orderliness of the queue is itself a kind of testament.',
      },
    ],
    npcSpawns: [
      {
        npcId: 'marshal_cross',
        spawnChance: 0.85,
        spawnType: 'anchored',
        activityPool: [
          { desc: 'Marshal Cross sits at her desk reading a report, red pen in hand. She marks a line, circles something, draws a hard underline under something else. She\'s been here before with bad news.', weight: 3 },
          { desc: 'Marshal Cross is standing at a wall map of the four-corners region, one hand tracing a route, lips moving slightly as she thinks out loud. She stops when she notices you.', weight: 2 },
          { desc: 'Cross is in conversation with one of her lieutenants. Her voice is quiet but every word lands clearly — no filler, no hedging, no room for misinterpretation.', weight: 2 },
        ],
        dispositionRoll: { friendly: 0.3, neutral: 0.5, wary: 0.2, hostile: 0.0 },
        dialogueTree: 'cv_marshal_cross_intro',
        questGiver: ['cv_supply_investigation', 'cv_wall_defense', 'cv_jail_spy'],
        narrativeNotes: 'Marshal Adeline Cross. Iron-willed, fair, exhausted. The character who most embodies what Covenant is trying to be.',
      },
      {
        npcId: 'courthouse_clerk',
        spawnChance: 0.90,
        spawnType: 'anchored',
        activityPool: [
          { desc: 'The clerk writes without looking up, then glances at you — one beat, a quick categorization — and returns to his ledger.', weight: 4 },
          { desc: 'The clerk is organizing a stack of papers into a filing system, murmuring to himself as he sorts. "Provisioning... provisioning... no, that\'s a grievance..."', weight: 2 },
        ],
        dispositionRoll: { friendly: 0.4, neutral: 0.5, wary: 0.1, hostile: 0.0 },
        dialogueTree: 'cv_clerk_intro',
      },
    ],
    itemSpawns: [],
  },

  // ----------------------------------------------------------
  // CV-05: Courthouse Upper Floor
  // ----------------------------------------------------------
  {
    id: 'cv_05_courthouse_upper',
    name: 'Covenant — Courthouse, Upper Floor',
    zone: 'covenant',
    act: 2,
    difficulty: 2,
    visited: false,
    flags: { noCombat: true },
    description: 'The upper floor is the war room — the title is unofficial but everyone uses it. Maps cover three of the four walls: topographic surveys of the Four Corners region, hand-annotated with Hollow migration patterns, known Sanguine territory, faction boundaries, and supply route conditions updated as recently as this week. A long table holds open binders organized by date and subject. The windows face north and east, giving a view across Covenant\'s rooftops to the mountains beyond. Someone has marked the distant peaks with a red pin and a single word: MERIDIAN. The air smells of the particular anxiety of people making decisions with incomplete information about problems that don\'t forgive mistakes.',
    descriptionNight: 'The war room works at all hours. At night the maps are lit from below by oil lamps set on the table, and the wall markings cast long shadows that make the annotations look more ominous than they need to. A night officer sits in the corner, logging shift reports. Cross is usually here. She sleeps less than she should.',
    shortDescription: 'The Accord war room, its walls covered in annotated maps of the Four Corners.',
    exits: {
      down: 'cv_04_courthouse',
      north: 'cv_22_council_chamber',
    },
    richExits: {
      down: {
        destination: 'cv_04_courthouse',
        descriptionVerbose: 'the stairs descend back to the courthouse main floor below',
      },
      north: {
        destination: 'cv_22_council_chamber',
        reputationGate: { faction: 'accord', minLevel: 2 },
        descriptionVerbose: 'the council chamber door — Trusted standing required',
      },
    },
    items: [],
    enemies: [],
    npcs: [],
    extras: [
      {
        keywords: ['maps', 'wall', 'annotations', 'territory'],
        description: 'The maps are a collaborative document. Dozens of hands have contributed over years — each new addition in a slightly different pen, slightly different handwriting, slightly different confidence about where things are. Hollow migration corridors in red. Sanguine territory in black with irregular borders. Faction zones in their colors. The blank areas are the ones nobody has returned from to report.',
      },
      {
        keywords: ['meridian', 'pin', 'peak', 'scar'],
        description: 'The red pin is stuck into a mountain range to the north, maybe forty miles from Covenant as the crow flies. The word MERIDIAN is written on a small paper flag. Someone has written a question mark underneath it in a different hand. The question mark has been crossed out and rewritten three times.',
        cycleGate: 2,
      },
      {
        keywords: ['binders', 'files', 'records', 'reports'],
        description: 'The binders are organized by: PATROL REPORTS, HOLLOW ACTIVITY, SANGUINE INTEL, SUPPLY CHAIN, FACTION RELATIONS, and one simply labeled CROSS — which nobody opens without invitation. The pages inside the open ones are dense with hand-written notes and cross-references. This is what governance looks like when the printing press doesn\'t run.',
      },
      {
        keywords: ['table', 'view', 'window', 'rooftops', 'mountain'],
        description: 'From the north window, Covenant\'s rooftops spread below — the patchwork of old buildings and new additions, chimneys sending up thin smoke, the tiny figures of people going about the enormous work of staying alive. Beyond the walls, the broken highway. Beyond that, the mountains. The view is the closest thing to perspective this building offers.',
      },
      {
        keywords: ['faction relations', 'salter', 'kindling', 'intelligence', 'report'],
        description: 'The FACTION RELATIONS binder is open to the most recent page. A patrol summary dated this week reads: "Salter expansion vectors confirmed — three new observation posts along the south ridge, each within line-of-sight of our eastern supply route. Recommend diplomatic contact before they interpret our traffic as provocation. Briggs does not respond to diplomatic contact. Recommend contingency planning." Below it, clipped with a paper clip: a handwritten council note in Cross\'s pencil. "The Kindling have begun what they call \'purification experiments\' on volunteers at the cathedral settlement. Dr. Marsh believes the treatment involves controlled exposure to biological agents recovered from industrial sites. Mortality rate unknown but the Kindling are not reporting deaths. Request: intelligence-gathering mission to The Ember, voluntary basis only. Council vote: 4-3, approved with conditions."',
      },
    ],
    npcSpawns: [
      {
        npcId: 'accord_war_room_officer',
        spawnChance: 0.80,
        spawnType: 'anchored',
        activityPool: [
          { desc: 'A lieutenant stands at the wall map with a marker, extending a patrol boundary line three centimeters east, then stepping back to look at it. She adds a second mark. Pauses. Leaves both.', weight: 3 },
          { desc: 'An officer sits at the long table, working through a binder page by page, occasionally making a note in the margin.', weight: 2 },
        ],
        dispositionRoll: { friendly: 0.1, neutral: 0.5, wary: 0.4, hostile: 0.0 },
        narrativeNotes: 'Trusted-gate room. Only Accord Trusted+ players reach here.',
      },
    ],
    itemSpawns: [],
  },

  // ----------------------------------------------------------
  // CV-06: The Armory
  // ----------------------------------------------------------
  {
    id: 'cv_06_armory',
    name: 'Covenant — The Armory',
    zone: 'covenant',
    act: 1,
    difficulty: 2,
    visited: false,
    flags: { noCombat: true, scavengingZone: false },
    description: 'The armory was a sporting goods store. The irony is not lost on anyone. The display cases still have the branded plaque mounts, now holding Accord-issue weapons — standardized, maintained, accounted for to the last round. The militia quartermaster runs this room with a focused intensity that suggests she considers every weapon on that rack a promise made to the person who will carry it. The back wall holds armor — scraps, mostly, but organized by coverage and condition with such care that the scraps become a system. Entry by authorization only. The quartermaster looks up from her ledger.',
    descriptionNight: 'The armory doesn\'t close. Night shifts need their kit too. The quartermaster\'s assistant handles evenings — a quiet young man who checks out weapons with the same methodical care, just with less conversation about it.',
    shortDescription: 'Covenant\'s armory, a repurposed sporting goods store managed with military precision.',
    exits: {
      south: 'cv_04_courthouse',
      north: 'cv_14_wall_north',
      east: 'cv_21_garrison_barracks',
    },
    richExits: {
      south: {
        destination: 'cv_04_courthouse',
        reputationGate: { faction: 'accord', minLevel: 1 },
        descriptionVerbose: 'the armory door — Recognized standing required',
      },
    },
    items: [],
    enemies: [],
    npcs: [],
    extras: [
      {
        keywords: ['weapons', 'rifles', 'guns', 'rack', 'arms'],
        description: 'The rack holds: twelve rifles in various conditions, all cleaned and oiled, sorted by caliber compatibility. Eight pistols. Four shotguns. Two compound bows. A crossbow that someone has clearly maintained with personal pride — the string is new. Every weapon is tagged with a condition rating and last-maintenance date. The quartermaster checks the rack daily.',
      },
      {
        keywords: ['armor', 'back wall', 'protection', 'gear'],
        description: 'The armor system is improvised but real: leather work gloves stitched to canvas sleeves for arm protection, salvaged knee and shin guards, a few actual police-issue tactical vests in varying states of condition, improvised chest plates made from car-door sheet metal with padding. Each piece is tagged. Each piece is issued to a specific person. No piece is spare.',
      },
      {
        keywords: ['quartermaster', 'ledger', 'woman'],
        description: 'Sergeant Deva Okafor has run the Covenant armory since the beginning. She served two years as a park ranger before the Collapse and brings that infrastructure-and-responsibility mindset to the job. She knows the maintenance history of every weapon in the room and can tell you who last borrowed the compound bow and whether they brought it back with the string dry or wet.',
      },
      {
        keywords: ['display case', 'plaque', 'sporting goods', 'signs'],
        description: 'A few pre-Collapse relics are still visible if you look: the Cabela\'s logo embossed on a display case edge, a promotional hunting poster in a back corner that someone turned around to face the wall, the ghost outline on the floor where a self-checkout stand once lived. The old world peeks through the new one constantly here.',
      },
    ],
    npcSpawns: [
      {
        npcId: 'quartermaster_okafor',
        spawnChance: 0.90,
        spawnType: 'anchored',
        activityPool: [
          { desc: 'Sergeant Okafor runs a cleaning rod through a rifle barrel, holds it to the light, and returns to work without acknowledging your entry — she heard you, she\'s just busy.', weight: 3 },
          { desc: 'Okafor is writing in her ledger, cross-referencing the rack inventory with her count. Her lips move slightly as she tallies.', weight: 3 },
          { desc: 'Okafor is instructing a militia recruit on proper holster draw technique. Her voice has the flat patience of someone who has explained this before and will explain it again.', weight: 2 },
        ],
        tradeInventory: ['accord_issue_rifle', 'accord_issue_pistol', 'ammo_22lr', 'ammo_9mm', 'leather_armor', 'militia_vest'],
        dispositionRoll: { friendly: 0.1, neutral: 0.6, wary: 0.3, hostile: 0.0 },
        dialogueTree: 'cv_okafor_armory',
        questGiver: ['cv_wall_defense'],
      },
    ],
    itemSpawns: [],
  },

  // ----------------------------------------------------------
  // CV-07: The Infirmary
  // ----------------------------------------------------------
  {
    id: 'cv_07_infirmary',
    name: 'Covenant — The Infirmary',
    zone: 'covenant',
    act: 1,
    difficulty: 1,
    visited: false,
    flags: { noCombat: true, healingBonus: 25, safeRest: true },
    description: 'The infirmary smells of clean linen and antiseptic — not hospital-clean, but the committed approximation of people doing their best with boiled water and salvaged isopropyl. Beds run down both sides of what was once a church fellowship hall, a dozen of them, three currently occupied by patients in varying stages of recovery. The lead medic moves between beds with the economy of motion that comes from doing this work in a space that is never quite large enough. Above the entrance, someone has lettered: ALL ARE TREATED FIRST. PAYMENT DISCUSSED AFTER. It is the most important policy sign in Covenant.',
    descriptionNight: 'The infirmary keeps a night watch — a junior medic sitting with a candle, checking breathing, updating the patient board. The ward is quiet in a way that\'s different from the quiet outside: the careful quiet of people who are healing, fragile and working at it.',
    shortDescription: 'The infirmary — clean, competent, and bearing a simple sign that explains why Covenant works.',
    exits: {
      west: 'cv_02_gate_square',
      north: 'cv_08_riverside_district',
      east: 'cv_23_accord_clinic_overflow',
    },
    richExits: {},
    items: [],
    enemies: [],
    npcs: [],
    extras: [
      {
        keywords: ['sign', 'payment', 'policy', 'lettering'],
        description: 'ALL ARE TREATED FIRST. PAYMENT DISCUSSED AFTER. The letters are large and careful. This was a deliberate statement — Cross wrote it herself in the first month. The policy has saved lives that couldn\'t afford to ask for help. It has cost Covenant real medicine with no guarantee of return. Cross considers it one of the best decisions she\'s made.',
      },
      {
        keywords: ['beds', 'patients', 'ward'],
        description: 'Three occupied beds. One is a militiaman with a leg injury from a patrol — wound clean, healing well, the medic says. One is a Drifter who came in from outside with a fever that broke two days ago — still weak, still here. One is a child, asleep, a woman sitting beside the bed holding the child\'s hand and staring at nothing in the careful way of people who have been sitting there for a long time.',
      },
      {
        keywords: ['medicine', 'antibiotics', 'supplies', 'medical'],
        description: 'The medicine cabinet is locked. Behind the glass: what remains of the pre-Collapse supply. Antibiotics counted by the dose. Painkillers counted by the pill. A single bottle of morphine. The lead medic knows the count without looking.',
      },
      {
        keywords: ['medic', 'doctor', 'healer'],
        description: 'Dr. Suni Marsh was an emergency room nurse. She\'ll correct you if you call her doctor — "I know what I don\'t know" — but the correction doesn\'t change the fact that she is the closest thing Covenant has to one. She\'s trained three people in field medicine since arriving. She\'s trying to train more.',
      },
    ],
    npcSpawns: [
      {
        npcId: 'medic_marsh',
        spawnChance: 0.85,
        spawnType: 'anchored',
        activityPool: [
          { desc: 'Dr. Marsh changes a bandage dressing with practiced, gentle hands, making small reassuring sounds to the patient that are clearly habit rather than performance.', weight: 3 },
          { desc: 'Marsh is standing at a small desk reviewing her patient board — a chalkboard with names, conditions, and notes. She erases one line and rewrites it with better information.', weight: 2 },
          { desc: 'Marsh is teaching a young aide how to clean a wound properly, guiding her hands through the steps. "Again. Slower. If you rush this, you undo everything."', weight: 2 },
        ],
        tradeInventory: ['field_dressing', 'antiseptic', 'pain_tabs', 'antibiotics_single_dose'],
        dispositionRoll: { friendly: 0.5, neutral: 0.4, wary: 0.1, hostile: 0.0 },
        dialogueTree: 'cv_marsh_healer',
        questGiver: ['cv_medical_supply_run'],
      },
    ],
    itemSpawns: [
      {
        entityId: 'field_dressing',
        spawnChance: 0.40,
        quantity: { min: 1, max: 2, distribution: 'weighted_low' },
        conditionRoll: { min: 0.6, max: 1.0 },
        groundDescription: 'A packaged field dressing has been left on the supply shelf.',
        depletion: { cooldownMinutes: { min: 180, max: 480 }, respawnChance: 0.40 },
      },
    ],
  },

  // ----------------------------------------------------------
  // CV-08: Riverside District
  // ----------------------------------------------------------
  {
    id: 'cv_08_riverside_district',
    name: 'Covenant — Riverside District',
    zone: 'covenant',
    act: 1,
    difficulty: 1,
    visited: false,
    flags: { noCombat: true, waterSource: true },
    description: 'The riverside district is where Covenant breathes. The Animas River runs along the eastern wall, low this time of year but clear and cold, and the people who live in the buildings along its bank have turned the narrow strip between the structures and the water into something almost pastoral — small vegetable gardens in raised beds, a communal laundry line, two children fishing from the bank with improvised poles. The sound of the river under everything. Three families share this district, and there is a quality to their ordinary activity that takes a moment to recognize: they are not afraid, right now, in this exact place.',
    descriptionNight: 'The river sounds louder at night. The gardens are dark shapes. The laundry is taken in before dark — habit, not necessity, but old habits die slowly even after the Collapse. The fishing boys are inside. Someone is awake in the corner building, a candle in the upper window, its light reflected in strips on the water.',
    shortDescription: 'The riverside district — gardens, laundry, the sound of the Animas, and families not currently afraid.',
    exits: {
      west: 'cv_03_main_street',
      south: 'cv_07_infirmary',
      north: 'cv_15_wall_east',
    },
    richExits: {},
    items: [],
    enemies: [],
    npcs: [],
    extras: [
      {
        keywords: ['river', 'animas', 'water', 'current'],
        description: 'The Animas runs clear here — Covenant has been careful about what goes into the water upstream, which took effort and rule-making and some arguments. The current is gentle in this stretch. The river has its own sound, a steady undercurrent to all the sounds of the settlement, and people who have lived here long enough stop noticing it consciously and start missing it when they\'re away.',
      },
      {
        keywords: ['garden', 'raised beds', 'vegetables', 'plants'],
        description: 'The raised beds are built from salvaged lumber and filled with a soil mixture that the residents have been improving over three seasons. They grow what they can: kale, squash, beans, a few struggling pepper plants. The yield supplements Covenant\'s rations meaningfully. A hand-painted sign on one bed reads: HANDS OFF — TRADE ONLY — ASK FIRST. Another bed, clearly belonging to someone else, has a more philosophical sign: please eat this before it bolts.',
      },
      {
        keywords: ['children', 'boys', 'fishing', 'kids'],
        description: 'Two boys, maybe eight and ten, with fishing lines made from salvaged monofilament tied to branches. They\'re talking quietly, watching the water with the absorbed patience that children bring to fishing, which is often more patience than they bring to anything else. One of them catches your eye and gives you the direct, assessing look of a child who has learned to evaluate strangers.',
      },
      {
        keywords: ['laundry', 'line', 'wash', 'clothes'],
        description: 'The communal laundry line runs between two buildings, a practical arrangement that lets everyone share the effort. Today it holds: work shirts, a child\'s dress, what looks like militia uniform components, and one inexplicably cheerful striped towel that someone has kept clean through seven years of the end of the world.',
      },
    ],
    npcSpawns: [
      {
        npcId: 'riverside_resident',
        spawnChance: 0.75,
        spawnType: 'wanderer',
        activityPool: [
          { desc: 'A woman tends her raised bed, pulling weeds one-handed and shaking the roots clean before dropping them in a pile. She doesn\'t rush. This is the good part of the day.', weight: 3 },
          { desc: 'An older man sits on a stump at the river\'s edge, mending a shirt. He works without looking at his hands, watching the water.', weight: 2 },
        ],
        dispositionRoll: { friendly: 0.5, neutral: 0.4, wary: 0.1, hostile: 0.0 },
      },
    ],
    itemSpawns: [
      {
        entityId: 'fresh_water_container',
        spawnChance: 0.65,
        quantity: { min: 1, max: 1, distribution: 'single' },
        conditionRoll: { min: 0.8, max: 1.0 },
        groundDescription: 'A clean water container sits at the river\'s edge near the draw-point.',
        depletion: { cooldownMinutes: { min: 30, max: 60 }, respawnChance: 0.75 },
      },
    ],
  },

  // ----------------------------------------------------------
  // CV-09: The School
  // ----------------------------------------------------------
  {
    id: 'cv_09_the_school',
    name: 'Covenant — The School',
    zone: 'covenant',
    act: 1,
    difficulty: 1,
    visited: false,
    flags: { noCombat: true },
    description: 'A former insurance office has become Covenant\'s school, and the transformation is complete enough that you have to look hard to find traces of what it was. The carpet has been replaced with plank flooring. The desks are salvage — mismatched chairs and tables of every size arranged for children of every size. There are twenty-three students here right now, ages roughly five to fourteen, in the loose age-mixing that happens when there aren\'t enough children in each year to sort them properly. A woman in her forties teaches at the front of the room, drawing letters on a section of painted plywood that serves as a chalkboard. On the side walls: drawings. Children\'s drawings, pinned in rows. Among the houses, dogs, and suns that children have always drawn, there are others — monsters with too many limbs, fire, figures running, a child\'s rendering of a hollow that is somehow the most frightening image in the room, because a child drew it from life.',
    descriptionNight: 'The school is closed at night. The drawings are still on the wall in the dark. They don\'t need light to be what they are.',
    shortDescription: 'The school — mismatched desks, twenty-three students, and children\'s drawings that include things children should never have seen.',
    exits: {
      east: 'cv_03_main_street',
    },
    richExits: {},
    items: [],
    enemies: [],
    npcs: [],
    extras: [
      {
        keywords: ['drawings', 'art', 'walls', 'pictures', 'children'],
        description: 'The drawings are organized by height — the youngest children\'s art at the bottom, the oldest at the top. Most are normal: a dog labeled DOG, a house with smoke from the chimney, the universal child\'s sun with radiating lines. But running through them, matter-of-factly, are the other drawings. A figure with gray skin and the wrong posture. A building on fire. A crowd of people running toward the right edge of the paper, where nothing is drawn. A child rendered the MERIDIAN symbol — the double helix — without knowing what it means, just that it was on something that scared the grown-ups.',
      },
      {
        keywords: ['teacher', 'woman', 'chalkboard'],
        description: 'Her name is Adaeze Nwosu. She was a CPA before the Collapse. She is not trained as a teacher. She is doing it anyway because someone had to and she was the one who said yes. She teaches reading, basic mathematics, and a social studies she makes up as she goes — what the world was, what it is, what the difference between them means. She is very careful about the last one.',
      },
      {
        keywords: ['children', 'students', 'kids', 'learning'],
        description: 'Twenty-three children. Some were born after the Collapse and have no memory of anything else. Some are old enough to remember — the ones around ten and older have a quality in their eyes that their drawings confirm. They know. They\'ve put it on paper and pinned it to the wall and then sat down to learn long division. The resilience required for that is staggering and ordinary and they don\'t think about it because they\'re children, and children just keep going.',
      },
      {
        keywords: ['desks', 'chairs', 'classroom', 'furniture'],
        description: 'Every chair is different. One is a proper desk-chair from a real school somewhere, traveled here by some path you can\'t imagine. One is an office chair with the wheels removed. One is a wooden stool with a board across the arms. One child is sitting on a turned-over crate, which they seem to prefer. They\'ve all learned to write at these mismatched surfaces and they do it just fine.',
      },
    ],
    npcSpawns: [
      {
        npcId: 'teacher_nwosu',
        spawnChance: 0.90,
        spawnType: 'anchored',
        activityPool: [
          { desc: 'Teacher Nwosu writes a row of letters on the plywood board with deliberate, clear strokes, calling them out as she goes. The younger children repeat them. The older ones watch her with the attention of students who know that what they\'re learning matters.', weight: 4 },
          { desc: 'Nwosu is reading aloud from a book — a real book, cloth-bound, well-worn — and the room has gone very quiet around her voice. Even the youngest children are still.', weight: 3 },
          { desc: 'Nwosu is reviewing a student\'s written work, her expression carefully neutral as she writes a note at the bottom. The student watches her face anxiously.', weight: 2 },
        ],
        dispositionRoll: { friendly: 0.6, neutral: 0.3, wary: 0.1, hostile: 0.0 },
        dialogueTree: 'cv_nwosu_teacher',
        narrativeNotes: 'No combat, no loot, no quests. This room exists to answer the question: why are we fighting?',
      },
    ],
    personalLossEchoes: {
      child: 'Twenty-three children. You count them without meaning to. You look for one who is the right age, the right height, the right anything. None of them are. All of them are. You leave before the teacher notices you staring.',
      partner: 'Nwosu reads aloud and the room goes quiet and you remember being read to — not as a child, but as an adult, in bed, a voice you loved making someone else\'s words into a gift. The memory is so precise it has a temperature.',
      community: 'The school is the argument for everything. Twenty-three children learning long division in a room that used to sell insurance. This is what a community builds when it decides to have a future. You had one of these. It built things for you. You didn\'t know what it cost until it was gone.',
      identity: 'The children\'s drawings on the wall. Houses, dogs, suns. You drew like this once. Everyone drew like this once. The hand that held the crayon is connected to a person you can\'t fully remember, and the drawings on this wall are proof that person existed.',
      promise: 'A child drew the MERIDIAN symbol without knowing what it means. You look at it and you know what it means and you promised someone you would do something about the world that symbol represents. The children are learning to spell February. You are supposed to be keeping them safe.',
    },
    itemSpawns: [],
    narrativeNotes: 'EMOTIONAL ANCHOR ROOM. No combat, no loot, no quest triggers. The player can examine but not take anything. The purpose is to make the cost of failure real.',
  },

  // ----------------------------------------------------------
  // CV-10: The Chapel
  // ----------------------------------------------------------
  {
    id: 'cv_10_the_chapel',
    name: 'Covenant — The Chapel',
    zone: 'covenant',
    act: 1,
    difficulty: 1,
    visited: false,
    flags: { noCombat: true, safeRest: true },
    description: 'Non-denominational by design, welcoming by practice. The chapel is a repurposed storefront — wide plate glass windows now covered with salvaged stained-glass fragments that have been fitted together with lead came by someone who didn\'t know how to do it before and figured it out. When the sun hits them, the floor is a mosaic of imperfect color. Mismatched pews face a simple altar with three candles burning in the particular quality of attention that flame carries. A wooden box on the back wall is labeled: LETTERS. LEAVE THEM HERE. Someone will read them eventually. The box is half-full.',
    descriptionNight: 'The chapel at night. Three candles burning. Outside sound absorbed by the stone and glass. The letters box glows amber in the candlelight. Someone is sitting in the third pew from the front, not moving, their silhouette both present and elsewhere.',
    shortDescription: 'The chapel — stained glass pieced together by amateurs, candles burning, a box of letters no one will mail.',
    exits: {
      east: 'cv_04_courthouse',
    },
    richExits: {},
    items: [],
    enemies: [],
    npcs: [],
    extras: [
      {
        keywords: ['stained glass', 'windows', 'glass', 'light', 'color'],
        description: 'The stained glass is amateur work — the joins are irregular, the fragments chosen by color and availability rather than design. But the effect, when the sun comes through, is something. It hits the floor in pools of blue, amber, and a deep red that has no clean name. Someone sits in this light sometimes. That is sufficient reason to have made it.',
      },
      {
        keywords: ['letters', 'box', 'mail', 'notes'],
        description: 'The letters box. Half-full. Some are sealed, addressed to names and places that no longer exist. Some are folded without address — written for no one, or for everyone. Some are worn from handling: someone has taken them out and put them back, more than once. You could read one. Nobody would stop you. Nobody who left them here knows anymore whether it would matter.',
        descriptionPool: [
          {
            desc: 'You open one. It reads: I keep thinking you\'d like it here. Covenant has a school now. They teach the kids math and history and the teacher makes up the history part which seems appropriate. There are window boxes with flowers. I planted one. Marigolds. — The letter ends there. No signature.',
            weight: 3,
          },
          {
            desc: 'The letter is in a child\'s handwriting: Dear Mom, I am okay. We are at a place called Covenant. They have a school. I learned to spell February. It is hard. I miss you. — Under it in adult handwriting: We are both safe. We will keep moving toward the signal. If you find this, leave a mark. We\'ll look.',
            weight: 2,
          },
          {
            desc: 'The letter is in two columns: a list on the left of names, fourteen of them, each with a small check or X beside it. On the right, a single line: I found all but two. The Xs are for the two.',
            weight: 2,
          },
        ],
      },
      {
        keywords: ['altar', 'candles', 'flame'],
        description: 'Three candles. They burn at different heights — started at different times, clearly. Someone tends them, not regularly but consistently, ensuring at least one is always lit. The altar beneath them is a section of oak countertop salvaged from somewhere. On it, one pine sprig, dried but still fragrant. Nothing else. The restraint is its own statement.',
      },
      {
        keywords: ['pews', 'benches', 'seats'],
        description: 'The pews are salvaged church furniture, different styles and finishes, brought here from wherever could be reached. Seven rows of them. Room for perhaps fifty people. On major days — the solstices, which Covenant observes with secular pragmatism — they\'re full.',
      },
    ],
    personalLossEchoes: {
      child: 'The letters box. You could write one. You could write their name on the outside and fold it and put it in the box and it would sit there with all the other letters to people who will never read them. You stand at the box for a long time. You don\'t write anything. You don\'t leave either.',
      partner: 'Three candles burning at different heights. You and they had rituals like this — small, repeated, meaningful only to the two of you. The candle flame doesn\'t know who lit it. The light is the same regardless. That thought is not as comforting as it should be.',
      community: 'The stained glass was pieced together by amateurs. The pews are salvage from different churches. The whole chapel is a thing built by a community from the fragments of other communities, and the imperfection of it — the irregular joins, the mismatched wood — is what makes it sacred.',
      identity: 'The imperfect color on the floor from the stained glass. Blue, amber, red. You sit in it and the color changes your hands and for a moment you are someone who sits in chapels, someone who seeks this kind of quiet, and you don\'t know if that\'s who you are or who you were or if it matters.',
      promise: 'LETTERS. LEAVE THEM HERE. Someone will read them eventually. You think about the promise you made and whether a letter in a box in a chapel counts as keeping it. It doesn\'t. But you stand here anyway, in the candlelight, and the promise is heavier than when you walked in.',
    },
    npcSpawns: [
      {
        npcId: 'chapel_visitor',
        spawnChance: 0.50,
        spawnType: 'wanderer',
        activityPool: [
          { desc: 'Someone sits in the third pew, hands folded, staring at the candles with the expression of a person conducting an internal negotiation.', weight: 3 },
          { desc: 'An older man is reading from a small book in the back pew, lips barely moving, pausing occasionally as if the text requires stopping.', weight: 2 },
          { desc: 'A woman is adding something to the letters box — she doesn\'t notice you, or pretends not to, and either way you give her the privacy.', weight: 2 },
        ],
        dispositionRoll: { friendly: 0.3, neutral: 0.5, wary: 0.2, hostile: 0.0 },
      },
    ],
    itemSpawns: [
      {
        entityId: 'torn_note_fragment',
        spawnChance: 0.60,
        quantity: { min: 1, max: 1, distribution: 'single' },
        conditionRoll: { min: 0.5, max: 0.9 },
        groundDescription: 'A folded letter rests on the edge of the letters box.',
        depletion: { cooldownMinutes: { min: 240, max: 720 }, respawnChance: 0.40 },
      },
    ],
  },

  // ----------------------------------------------------------
  // CV-11: The Workshop
  // ----------------------------------------------------------
  {
    id: 'cv_11_workshop',
    name: 'Covenant — The Workshop',
    zone: 'covenant',
    act: 1,
    difficulty: 1,
    visited: false,
    flags: { noCombat: true, scavengingZone: true },
    description: 'The workshop is the productive heart of Covenant, housed in a former auto repair bay whose concrete floor and high ceiling were built for exactly this kind of work. Four stations: a metalworking bench with a small forge, a woodworking section with hand tools organized on a pegboard shadow board, a textile and leather area where clothing and armor get repaired, and a general salvage bench where things come in broken and leave fixed or turned into something else. The smell of hot metal and machine oil and fresh-cut wood, three of the oldest human smells, doing their good work. A mechanic who goes by Torque runs the place and teaches anyone willing to learn.',
    descriptionNight: 'The forge goes cold at night — fuel conservation — but the other benches can work by lantern. Torque often does. There\'s always a repair backlog.',
    shortDescription: 'The workshop — forge, woodwork, textiles, salvage — smelling of everything productive.',
    exits: {
      east: 'cv_02_gate_square',
    },
    richExits: {},
    items: [],
    enemies: [],
    npcs: [],
    extras: [
      {
        keywords: ['forge', 'metal', 'metalworking', 'anvil'],
        description: 'The forge is salvaged and jury-rigged — a converted steel drum with a pipe bellows and a piece of railroad track serving as anvil. It reaches working temperature with difficulty and holds it with patience. Torque uses it for knife work, hardware repairs, and the occasional surprise. Last month he made a set of door hinges that are now on four different buildings. The month before that, a medical probe set for the infirmary.',
      },
      {
        keywords: ['pegboard', 'tools', 'woodworking', 'hand tools'],
        description: 'The pegboard shadow board is a work of art in miniature: every hook has its tool outlined beneath it in black paint so you can see at a glance what\'s missing. Nothing is missing. Torque checks it every morning and every evening. The tools are a collection accumulated over two years — some salvaged in excellent condition, some repaired and sharpened back to usefulness, all catalogued and maintained.',
      },
      {
        keywords: ['torque', 'mechanic', 'teacher'],
        description: 'Nobody knows Torque\'s real name — he got the nickname from his previous life as a diesel mechanic and it stuck so completely that even he uses it. He\'s been teaching mechanics skill to Covenant residents since the beginning. He teaches like a mechanic: show me, do it with me, now you do it. He has no patience for people who won\'t try, and unlimited patience for people who try and fail.',
        skillCheck: { skill: 'mechanics', dc: 8, successAppend: 'Torque looks at your hands and nods. "You\'ve used tools before. Good. That saves us three hours."' },
      },
      {
        keywords: ['salvage bench', 'repairs', 'broken', 'components'],
        description: 'The salvage bench holds whatever came in today: a broken crossbow limb, a leaking water container being patched with salvaged rubber, a radio that someone hopes can be made to work again, and something that might be a pressure cooker lid that Torque is going to figure out a use for before he goes home. Nothing leaves the workshop as waste.',
      },
    ],
    npcSpawns: [
      {
        npcId: 'mechanic_torque',
        spawnChance: 0.85,
        spawnType: 'anchored',
        activityPool: [
          { desc: 'Torque bends over the salvage bench, turning a broken mechanism in his hands with the concentrated squint of someone reading a language they know perfectly.', weight: 4 },
          { desc: 'Torque is working the forge bellows in a steady rhythm, watching the metal with the patient attention of someone who knows the exact moment before exactly right.', weight: 2 },
          { desc: 'Torque is teaching a young woman how to sharpen a blade — guiding her angle by pressure on her elbow, saying "feel it, don\'t watch it" without looking up from his own work.', weight: 2 },
        ],
        tradeInventory: ['scrap_metal', 'basic_repair_kit', 'leather_patch_kit', 'salvaged_components'],
        dispositionRoll: { friendly: 0.5, neutral: 0.4, wary: 0.1, hostile: 0.0 },
        dialogueTree: 'cv_torque_workshop',
        questGiver: ['cv_crafting_tutorial', 'cv_workshop_supply_run'],
      },
    ],
    itemSpawns: [
      {
        entityId: 'scrap_metal',
        spawnChance: 0.55,
        quantity: { min: 1, max: 3, distribution: 'weighted_low' },
        conditionRoll: { min: 0.3, max: 0.8 },
        groundDescription: 'A few pieces of usable scrap metal rest on the salvage bench edge.',
        depletion: { cooldownMinutes: { min: 60, max: 180 }, respawnChance: 0.50 },
      },
    ],
  },

  // ----------------------------------------------------------
  // CV-12: The Jail
  // ----------------------------------------------------------
  {
    id: 'cv_12_the_jail',
    name: 'Covenant — The Jail',
    zone: 'covenant',
    act: 1,
    difficulty: 2,
    visited: false,
    flags: { noCombat: true },
    description: 'Two cells behind a steel door in the courthouse basement, clean and cold. The first cell is empty. The second holds a man who gives his name as Dell — mid-thirties, unremarkable features, the kind of face that\'s easy to describe and hard to identify afterward. He\'s been here five days on suspicion of passing Covenant patrol routes to the Sanguine. He hasn\'t been tried yet. He hasn\'t confessed. He sits on his cot with his elbows on his knees and his eyes on the middle distance, which is either the look of an innocent man being patient or a guilty one who has decided that patience is his best tool. A guard sits outside on a folding chair, reading.',
    descriptionNight: 'The jail is colder at night. The guard has two blankets and offers one to Dell through the bars, which Dell takes without comment. The exchange says something. You\'re not sure what.',
    shortDescription: 'Two cells, one prisoner, one guard, and the unresolved question of whether Dell is what Cross thinks he is.',
    exits: {
      up: 'cv_04_courthouse',
      east: 'cv_24_holding_cells',
    },
    richExits: {
      up: {
        destination: 'cv_04_courthouse',
        descriptionVerbose: 'a stairwell climbs back up to the courthouse main floor',
      },
    },
    items: [],
    enemies: [],
    npcs: [],
    extras: [
      {
        keywords: ['dell', 'prisoner', 'man', 'suspect'],
        description: '"You\'re not militia," Dell says when you get close. It\'s not a question. He takes you in the way people do when they\'ve had a lot of time to study what comes through the door. "They let outsiders down here now? Must be getting desperate." His voice has the controlled quality of someone managing their own fear.',
        questGate: 'cv_jail_spy',
      },
      {
        keywords: ['cell', 'bars', 'cage'],
        description: 'The cells are reinforced welded steel — someone who knew what they were doing built them, before Covenant\'s time. The lock is a proper deadbolt, the key kept by the day officer upstairs. The cell is clean: a cot with a blanket, a covered bucket, a water jug refilled twice daily. Covenant\'s justice is rough but it has standards.',
      },
      {
        keywords: ['guard', 'warden', 'officer'],
        description: 'The guard is reading a paperback with a cracked spine that she holds together with her thumb. She doesn\'t look up when you enter, which means she already assessed you at the door and decided you were not a problem. "Five minutes," she says without looking. "He doesn\'t need more than that and neither do you."',
      },
      {
        keywords: ['spy', 'sanguine', 'suspicion', 'evidence'],
        description: 'What Cross has: Dell arrived eight days ago as a Drifter trader. Two days later, a patrol route known only to inner circle militia was compromised — a patrol walked into a prepared ambush. One militia member wounded, two Hollow killed that turned out to have been herded into position. Dell was the last person known to have been in the briefing anteroom.',
        cycleGate: 2,
      },
    ],
    npcSpawns: [
      {
        npcId: 'prisoner_dell',
        spawnChance: 0.95,
        spawnType: 'anchored',
        activityPool: [
          { desc: 'Dell sits on his cot, elbows on his knees, watching the door with the measured patience of someone who has decided that waiting is the correct strategy.', weight: 4 },
          { desc: 'Dell stands at the bars, not holding them — that would look too obvious — just standing near them, reading you the way you read him.', weight: 2 },
        ],
        dispositionRoll: { friendly: 0.0, neutral: 0.6, wary: 0.3, hostile: 0.1 },
        dialogueTree: 'cv_prisoner_dell',
        narrativeNotes: 'Moral complexity NPC. Player can interrogate, advocate for, or ignore Dell. His guilt is ambiguous and remains so across cycles unless specific evidence gathered.',
      },
      {
        npcId: 'jail_guard',
        spawnChance: 0.95,
        spawnType: 'anchored',
        activityPool: [
          { desc: 'The guard reads her paperback. Page turn. She marks her place with her thumbnail without looking up. She knows you\'re here.', weight: 3 },
          { desc: 'The guard sets down her book and gives you a polite, direct look — not hostile, not welcoming. Just noting that she\'s been here the whole time.', weight: 2 },
        ],
        dispositionRoll: { friendly: 0.1, neutral: 0.7, wary: 0.2, hostile: 0.0 },
      },
    ],
    itemSpawns: [],
  },

  // ----------------------------------------------------------
  // CV-13: The Granary
  // ----------------------------------------------------------
  {
    id: 'cv_13_granary',
    name: 'Covenant — The Granary',
    zone: 'covenant',
    act: 1,
    difficulty: 2,
    visited: false,
    flags: { noCombat: true, questHub: true },
    description: 'The granary is housed in the largest building in Covenant — a former farm supply warehouse whose steel walls and concrete floor make it the best long-term food storage available. The interior is organized with the same methodical precision that runs through everything Accord. Grain bins, sealed root vegetable caches, a preserved foods section organized by type and date. The inventory board at the entrance shows what\'s in and what\'s out with a detail that approaches anxiety: someone here understands, in their bones, what it means for eight hundred people to run out of food. The night inventory has turned up a discrepancy. Cross has asked for it to be investigated quietly.',
    descriptionNight: 'The granary stores watch runs at night with extra care. The discrepancy Cross is concerned about started showing up in the night count, which is why the night shift now has two people instead of one.',
    shortDescription: 'The granary — eight hundred people\'s food supply, precisely inventoried, currently coming up short.',
    exits: {
      west: 'cv_04_courthouse',
      south: 'cv_27_quartermaster_depot',
    },
    richExits: {},
    items: [],
    enemies: [],
    npcs: [],
    extras: [
      {
        keywords: ['inventory', 'board', 'count', 'stock', 'numbers'],
        description: 'The board shows: grain (four bins — one showing lower than the previous count), root vegetables (current), preserved foods (current), seed stock (sealed, inviolate by Accord law — the seeds are next year\'s survival). The discrepancy is in Bin 3. It\'s small enough to be measurement error. It\'s too regular to be measurement error.',
        questGate: 'cv_supply_investigation',
      },
      {
        keywords: ['bins', 'grain', 'food', 'supply'],
        description: 'The grain bins are former livestock feed storage units — metal, with modified airtight lids. The grain inside is a mix of pre-Collapse seed stock and locally harvested grain from the cooperative fields two miles north of the settlement. Feeding eight hundred people takes this much. Feeding them through a bad harvest takes more.',
      },
      {
        keywords: ['hole', 'gap', 'access', 'back wall'],
        description: 'Behind Bin 3, where the lower count has been appearing, there\'s a section of wall that doesn\'t quite meet the floor. A very small gap. Not big enough for a person. Maybe big enough for something coming in from outside, if the something were motivated and knew where to look.',
        skillCheck: { skill: 'perception', dc: 12, successAppend: 'You notice that the gap has been widened recently — the edges are scraped, the concrete dust disturbed. This didn\'t happen by accident.' },
        questGate: 'cv_supply_investigation',
      },
      {
        keywords: ['storekeeper', 'manager', 'granary keeper'],
        description: 'The storekeeper\'s desk holds a ledger that is a minor masterwork of anxious bookkeeping. Every transaction recorded. Dates, amounts, authorizing officer\'s initials. Seven pages of notes on the discrepancy — the same amount, the same bin, irregularly spaced dates. "Not random," the storekeeper has written at the bottom of page six, and underlined it.',
      },
    ],
    npcSpawns: [
      {
        npcId: 'granary_storekeeper',
        spawnChance: 0.90,
        spawnType: 'anchored',
        activityPool: [
          { desc: 'The storekeeper is reviewing his ledger at the entrance desk, turning pages back and forth with the focused unhappiness of someone comparing numbers that refuse to agree.', weight: 4 },
          { desc: 'The storekeeper conducts a physical count of one of the grain bins, moving a tally counter with deliberate clicks. His expression does not improve as he goes.', weight: 3 },
        ],
        dispositionRoll: { friendly: 0.3, neutral: 0.5, wary: 0.2, hostile: 0.0 },
        dialogueTree: 'cv_storekeeper_granary',
        questGiver: ['cv_supply_investigation'],
      },
    ],
    itemSpawns: [
      {
        entityId: 'preserved_rations',
        spawnChance: 0.30,
        quantity: { min: 1, max: 2, distribution: 'weighted_low' },
        conditionRoll: { min: 0.7, max: 1.0 },
        groundDescription: 'A package of preserved rations sits on the edge of the shelving, separated from inventory.',
        depletion: { cooldownMinutes: { min: 120, max: 360 }, respawnChance: 0.25 },
      },
    ],
  },

  // ----------------------------------------------------------
  // CV-14: The Wall, North Section
  // ----------------------------------------------------------
  {
    id: 'cv_14_wall_north',
    name: 'Covenant — The Wall, North Section',
    zone: 'covenant',
    act: 1,
    difficulty: 2,
    visited: false,
    flags: { noCombat: false, combat_high_ground: true },
    description: 'The north wall is Covenant\'s strongest — reinforced with salvaged steel panels and maintained with a care that approaches ritual. From the patrol walkway you can see the mountains, a clear day\'s worth of distance to the north, the San Juans in their gray bulk against the sky. MERIDIAN is up there somewhere, though nobody says so on the wall. What the patrol sees, daily: the approach roads, the tree line three hundred yards out where the forest begins, the shape of a former farmhouse that burned two seasons ago and never got cleared. And always, at some point in a night patrol, movement in the tree line that may be deer and may not be.',
    descriptionNight: 'The north wall at night is a different kind of vigilance. The mountains are black shapes against a sky that is surprisingly full of stars when you stop being afraid of the dark long enough to look. The patrol moves quietly, listening as much as watching. Movement in the tree line at night is not deer.',
    shortDescription: 'The north wall\'s patrol post — the mountains ahead, the tree line at distance, and the question of what moves in it.',
    exits: {
      south: 'cv_06_armory',
      west: 'cv_25_wall_south',
      north: 'cv_28_signal_post',
    },
    richExits: {},
    items: [],
    enemies: [],
    npcs: [],
    hollowEncounter: {
      baseChance: 0.08,
      timeModifier: { day: 0.3, dusk: 1.5, night: 2.5, dawn: 0.8 },
      threatPool: [
        { type: 'shuffler', weight: 70, quantity: { min: 1, max: 2, distribution: 'weighted_low' } },
        { type: 'remnant', weight: 25, quantity: { min: 1, max: 1, distribution: 'single' } },
        { type: 'screamer', weight: 5, quantity: { min: 1, max: 1, distribution: 'single' } },
      ],
      awarenessRoll: { unaware: 0.5, awarePassive: 0.3, awareAggressive: 0.2 },
      activityPool: {
        shuffler: [
          { desc: 'has come up to the base of the wall and stands there, head tilted back, mouth open, without apparent purpose or urgency', weight: 3 },
          { desc: 'moves along the base of the wall in a slow circuit, its feet finding the same path each time around', weight: 2 },
        ],
        remnant: [
          { desc: 'crouches at the base of the wall, examining the steel panels with the focused attention of something remembering, without understanding what it\'s remembering', weight: 2 },
        ],
      },
    },
    extras: [
      {
        keywords: ['mountains', 'san juans', 'north', 'view', 'distance'],
        description: 'The San Juan Mountains fill the northern horizon — not a distant smudge but a genuine presence, close enough that you can read the treeline at the lower elevations and the bare rock above it. Forty miles, give or take. Somewhere in those forty miles, buried in the rock, MERIDIAN waits. The mountain doesn\'t look different for that. The mountain doesn\'t know.',
      },
      {
        keywords: ['tree line', 'forest', 'movement', 'watching'],
        description: 'The tree line is three hundred yards from the wall. On a good day, you can see into it perhaps twenty yards before the light fails between the trunks. On a still morning, you can hear it — the natural sounds of birds and wind, and occasionally the sounds that aren\'t. The patrol log records "movement, uncertain" at the tree line four times in the past week. All four logged by different sentries. All four at different times.',
      },
      {
        keywords: ['patrol', 'sentry', 'walkway', 'post'],
        description: 'The walkway is a plank-and-steel structure that runs the length of the north wall. Wide enough for two abreast. The guardrail is chain-link threaded with paracord for grip. Sandbag positions every twenty yards with firing loops cut through the wall beneath them. The patrol changes every four hours.',
      },
      {
        keywords: ['farmhouse', 'ruins', 'burned'],
        description: 'The burned farmhouse is two hundred yards out, east of the approach road. A patrol cleared it two seasons ago and found nothing living. Nothing living was the appropriate phrase at the time. The shell is still there: stone chimney standing, walls collapsed, the dark stain on the ground where the roof fell. Nobody has been back to clear the debris. Nobody goes that far out alone.',
      },
    ],
    npcSpawns: [
      {
        npcId: 'north_wall_sentry',
        spawnChance: 0.90,
        spawnType: 'patrol',
        activityPool: [
          { desc: 'A sentry scans the tree line through a salvaged spotting scope, moving it in slow sweeps, pausing twice on things that turn out to be nothing.', weight: 3 },
          { desc: 'Two sentries share a brief conversation at the midpoint of the wall, voices low, eyes still on the outside. They stop when you approach — habit, not hostility.', weight: 2 },
        ],
        dispositionRoll: { friendly: 0.2, neutral: 0.6, wary: 0.2, hostile: 0.0 },
        dialogueTree: 'cv_north_wall_sentry',
      },
    ],
    itemSpawns: [],
  },

  // ----------------------------------------------------------
  // CV-15: The Wall, East Section
  // ----------------------------------------------------------
  {
    id: 'cv_15_wall_east',
    name: 'Covenant — The Wall, East Section',
    zone: 'covenant',
    act: 1,
    difficulty: 2,
    visited: false,
    flags: { noCombat: false, questHub: true, combat_high_ground: true },
    description: 'The east wall is the weakest section — where a flood two winters ago undercut a portion of the foundation and the repair was done fast rather than well. You can see it if you know what to look for: a slight lean to one panel, fresh-poured concrete that doesn\'t quite match the color of the old, a crack running along the base that someone has marked with a chalk line to track its growth. Marshal Cross knows about it. Her engineer has told her three times. The materials to fix it properly are on a list with forty other things Covenant needs and doesn\'t have. The river runs close here — you can see it, maybe thirty yards from the wall base, the sound of it constant.',
    descriptionNight: 'At night the east wall\'s weakness is louder in the mind than it is in the structure. The sentries here are briefed about the panel. They check it first on every circuit. The crack is the same. The lean is the same. It\'s been the same for four months. That should be reassuring. It isn\'t.',
    shortDescription: 'The east wall — beautiful view of the river, one compromised panel, and a chalk line someone draws fresh every week.',
    exits: {
      south: 'cv_08_riverside_district',
      north: 'cv_25_wall_south',
    },
    richExits: {},
    items: [],
    enemies: [],
    npcs: [],
    hollowEncounter: {
      baseChance: 0.12,
      timeModifier: { day: 0.4, dusk: 1.8, night: 3.0, dawn: 1.0 },
      threatPool: [
        { type: 'shuffler', weight: 60, quantity: { min: 1, max: 3, distribution: 'weighted_low' } },
        { type: 'brute', weight: 30, quantity: { min: 1, max: 1, distribution: 'single' } },
        { type: 'remnant', weight: 10, quantity: { min: 1, max: 2, distribution: 'weighted_low' } },
      ],
      awarenessRoll: { unaware: 0.4, awarePassive: 0.3, awareAggressive: 0.3 },
      noiseModifier: -2,
    },
    extras: [
      {
        keywords: ['crack', 'wall', 'panel', 'lean', 'weakness'],
        description: 'The chalk line on the crack is dated. The first mark is four months ago. The second is a month later. The third is two weeks ago. The crack has grown, but slowly — millimeters between marks. The engineer\'s calculus: it will hold for another eight months under normal conditions. "Normal conditions" is the phrase that contains the fear.',
        questGate: 'cv_wall_defense',
      },
      {
        keywords: ['river', 'animas', 'water', 'east'],
        description: 'From the east wall you can see the Animas in both directions — north where it bends around the far edge of the settlement, south where it eventually disappears into the breaks and canyon country. The water level is low this time of year. The flood that damaged the wall came in March, a melt-surge that nobody was ready for, and was gone in two days but left the foundation compromised. The engineer says the next March surge will be worse.',
      },
      {
        keywords: ['engineer', 'repairs', 'fix', 'materials'],
        description: 'The engineer is Covenant\'s third civil engineer — the first two died in the first year. This one is careful to a fault and communicates exclusively in written reports that Cross reads and files and occasionally swears at. His report on the east wall runs to seven pages and ends with: "Immediate reinforcement required. See attached materials list." The materials list is attached. It is not encouraging.',
        skillCheck: { skill: 'mechanics', dc: 10, successAppend: 'Your eye confirms the engineer\'s assessment — and finds one thing he missed: the secondary footing crack, hidden behind the main panel. That\'s worse than what\'s in the report.' },
      },
    ],
    npcSpawns: [
      {
        npcId: 'east_wall_sentry',
        spawnChance: 0.85,
        spawnType: 'patrol',
        activityPool: [
          { desc: 'The east wall sentry moves with a slightly shorter step than standard patrol — checking the base of the compromised panel every circuit, almost involuntarily.', weight: 3 },
          { desc: 'A sentry crouches at the base of the wall, running her finger along the chalk-marked crack. "Still the same," she says, to herself or to you. "Still the same."', weight: 2 },
        ],
        dispositionRoll: { friendly: 0.2, neutral: 0.6, wary: 0.2, hostile: 0.0 },
        dialogueTree: 'cv_wall_defense_quest',
        questGiver: ['cv_wall_defense'],
      },
    ],
    itemSpawns: [],
  },

  // ----------------------------------------------------------
  // CV-16: Marshal's Quarters
  // ----------------------------------------------------------
  {
    id: 'cv_16_marshals_quarters',
    name: 'Covenant — Marshal\'s Quarters',
    zone: 'covenant',
    act: 2,
    difficulty: 2,
    visited: false,
    flags: { noCombat: true },
    description: 'The Marshal\'s quarters are remarkable for their sparseness — the room of a person who has decided that personal comfort is a kind of statement she doesn\'t want to make. A cot with a military blanket folded with geometric precision. A desk with a single reading lamp. A shelf with nine books, seven of them on history and two of them fiction, the fiction\'s spines cracked from repeated reading. On the wall, one photograph — three people, two adults and a child, in front of a house. The people in it are young and unhurried in the particular way that people in photographs from before the Collapse always look, as if they have all the time there is. Cross is not in this room right now. She almost never is.',
    descriptionNight: 'The rare nights Cross sleeps here, the lamp burns until 2 AM. You can see it from the street — a single window with orange light, the shadow of a person working at a desk. The shadow sometimes stops moving. You wonder if she\'s fallen asleep at the desk again.',
    shortDescription: 'The Marshal\'s quarters — sparse, military, one photograph on the wall of people who had no idea.',
    exits: {
      south: 'cv_04_courthouse',
      north: 'cv_19_cross_office',
    },
    richExits: {
      south: {
        destination: 'cv_04_courthouse',
        reputationGate: { faction: 'accord', minLevel: 3 },
        descriptionVerbose: 'the door to the Marshal\'s private quarters — Blooded standing required',
      },
      north: {
        destination: 'cv_19_cross_office',
        descriptionVerbose: 'the inner office door — Cross\'s private workspace',
        reputationGate: { faction: 'accord', minLevel: 2 },
      },
    },
    items: [],
    enemies: [],
    npcs: [],
    extras: [
      {
        keywords: ['photograph', 'photo', 'picture', 'family'],
        description: 'The photograph is in a simple frame, the glass cracked in one corner but cleaned carefully anyway. Three people: a man with a warm expression, a woman who is clearly younger Cross — the cheekbones are the same, the directness in the eyes — and a child, maybe seven, caught in a laugh. Written on the back in Cross\'s handwriting, in pencil: Tucson. Before. It\'s the entirety of the caption.',
      },
      {
        keywords: ['books', 'shelf', 'reading', 'fiction', 'history'],
        description: 'The seven history books: a biography of Lincoln, a study of post-WWII reconstruction, two books on institutional design, one on Rome\'s fall, one on the Norse settlements of Greenland, one on epidemics. The two fiction books: a tattered paperback of a novel called Gilead and an even more tattered copy of the complete Sherlock Holmes. Both have the soft pages and bent spines of books that have been everywhere with their reader.',
      },
      {
        keywords: ['desk', 'lamp', 'papers', 'notes'],
        description: 'The desk holds: the current day\'s reports, her duty roster, a map of Covenant with annotations in her hand, and a notebook she keeps face-down when she leaves. If you turn it over — if you dare, in this room that is hers to a degree very few rooms belong to anyone now — the open page reads: Day 2,556. Both walls holding. Dell situation unresolved. The letter came back from Tucson last month. Nobody was there. I knew. I still had to know.',
        cycleGate: 2,
      },
      {
        keywords: ['cot', 'bed', 'blanket', 'military'],
        description: 'Military-surplus wool blanket, green, folded with the corners aligned to within a quarter inch. Cross learned to fold it this way at ROTC and has never found a reason to stop. The cot is narrow and firm and she sleeps in four-hour shifts when she sleeps at all.',
      },
    ],
    npcSpawns: [],
    itemSpawns: [
      { entityId: 'cross_personal_journal_page', spawnChance: 0.95, quantity: { min: 1, max: 1, distribution: 'flat' } },
      { entityId: 'ammo_22lr', spawnChance: 0.7, quantity: { min: 5, max: 15, distribution: 'flat' } },
      { entityId: 'field_surgery_kit', spawnChance: 0.5, quantity: { min: 1, max: 1, distribution: 'flat' } },
    ],
  },

  // ----------------------------------------------------------
  // CV-17: The Basement
  // ----------------------------------------------------------
  {
    id: 'cv_17_the_basement',
    name: 'Covenant — The Basement',
    zone: 'covenant',
    act: 2,
    difficulty: 2,
    visited: false,
    flags: { combat_darkness: true, combat_narrow_passage: true },
    cycleGate: 2,
    description: 'The courthouse basement is a records room that smells of damp concrete and very old paper. Filing cabinets run the length of the walls — county records from before the Collapse, the kind of administrative infrastructure that seems pointless until you need to know who owned the land you\'re defending, or whether the building you\'re using has documented structural issues. Cross had it organized in the first year by her most detail-oriented lieutenant. There is, in the back left corner, a cabinet that is locked with a secondary padlock that wasn\'t original to the building. The lock is recent. The cabinet has no file label. Behind it, barely visible if you\'re looking from the right angle, is the back edge of a manila folder with government classification markings.',
    descriptionNight: 'The basement at night is the darkest room in Covenant. The single overhead bulb failed three months ago and wasn\'t replaced. People come down with lamps. The cabinet in the corner looks the same in lamplight. The shadows around it don\'t help.',
    shortDescription: 'The courthouse basement — county records, damp concrete, and one locked cabinet with a classification marking visible through the gap.',
    exits: {
      up: 'cv_04_courthouse',
      south: 'cv_20_underground_archive',
    },
    richExits: {
      up: {
        destination: 'cv_04_courthouse',
        reputationGate: { faction: 'accord', minLevel: 2 },
        cycleGate: 2,
        descriptionVerbose: 'the stairs climb back up to the courthouse main floor — restricted access',
      },
      south: {
        destination: 'cv_20_underground_archive',
        locked: true,
        lockedBy: 'courthouse_archive_key',
        descriptionVerbose: 'a heavy steel door at the back of the basement, rusted hinges, sealed padlock',
        skillGate: { skill: 'lockpicking', dc: 8, failMessage: 'The padlock is a serious piece of hardware. You\'d need better lockpicking to crack it quietly, or the key.' },
      },
    },
    items: [],
    enemies: [],
    npcs: [],
    extras: [
      {
        keywords: ['cabinet', 'locked', 'padlock', 'corner'],
        description: 'The secondary padlock is a combination type — not a key lock, which means Cross carries the combination in her head rather than on a ring. The cabinet is otherwise identical to the others. The lock is the only difference, and it is a very loud difference if you know how to read rooms.',
        cycleGate: 2,
      },
      {
        keywords: ['file', 'folder', 'meridian', 'classified', 'markings', 'government'],
        description: 'The folder visible through the gap: manila, dog-eared, with a paper label that reads — you can make out most of it — MERIDIAN FACILITY PERSONNEL / CYCLE COHORT 4 / CLASSIFICATION: RESTRICTED DISTRIBUTION. Below it, a handwritten note in Cross\'s precise pencil: INCOMPLETE. CROSS-REF: BRIGGS?',
        cycleGate: 2,
        skillCheck: { skill: 'perception', dc: 14, successAppend: 'You can read more of the label. The words "CHARON-7 AUGMENTATION PROTOCOL" are visible on a second sheet behind the first.' },
      },
      {
        keywords: ['file drawer', 'open cabinet', 'records', 'county'],
        description: 'The open cabinets hold what you\'d expect from a pre-Collapse county courthouse: property deeds, court filings, tax records, building permits. The building permits are occasionally useful — Cross\'s engineer uses them to understand the structural history of buildings before he works on them. Everything else is the ghost-administration of a world that doesn\'t exist anymore.',
      },
      {
        keywords: ['damp', 'water', 'smell', 'concrete'],
        description: 'The basement collects moisture from the east wall\'s compromised foundation — the same problem the wall engineer is worried about, expressing itself here as a faint seep along the back wall and a persistent smell of wet earth. Someone has placed a bucket in the corner. The bucket is a quarter full.',
      },
    ],
    hollowEncounter: {
      // Quest-gated encounter: activate via quest flag
      baseChance: 0.0,
      timeModifier: { night: 1.0, dawn: 1.0, dusk: 1.0, day: 1.0 },
      questGate: 'cv_basement_hive_mother_active',
      threatPool: [
        { type: 'hive_mother', weight: 1, quantity: { min: 1, max: 1, distribution: 'flat' } },
        { type: 'shuffler', weight: 2, quantity: { min: 2, max: 4, distribution: 'flat' } },
      ],
    },
    npcSpawns: [],
    itemSpawns: [
      {
        entityId: 'meridian_file_fragment',
        spawnChance: 0.0,
        quantity: { min: 1, max: 1, distribution: 'single' },
        conditionRoll: { min: 0.8, max: 1.0 },
        groundDescription: 'A classified file folder, partially visible through the gap beside the locked cabinet.',
        depletion: { cooldownMinutes: { min: 99999, max: 99999 }, respawnChance: 0.0 },
      },
    ],
    narrativeNotes: 'Cycle 2+ AND Trusted Accord gate. The MERIDIAN file fragment here is Act II critical path. The item spawn is for the lore item specifically unlocked by quest progression, not random scavenging. Hive Mother boss — Act II climax encounter.',
  },

  // ----------------------------------------------------------
  // CV-18: The Rooftop Garden
  // ----------------------------------------------------------
  {
    id: 'cv_18_rooftop_garden',
    name: 'Covenant — The Rooftop Garden',
    zone: 'covenant',
    act: 1,
    difficulty: 1,
    visited: false,
    flags: { noCombat: true, safeRest: true, campfireAllowed: false },
    description: 'You come out through the access hatch and stop. The rooftop garden is the most beautiful room in Covenant — possibly the most beautiful room in the Four Corners — and the beauty is of the stubborn, deliberate kind: someone chose to make this. Raised beds in old crates, buckets, a decommissioned bathtub, a child\'s inflatable pool that has found its second life in soil. Growing: culinary herbs in careful rows, medicinal plants labeled with hand-painted stakes, three dwarf fruit trees in large containers that are somehow thriving, and along the south edge, deliberately and without apology, flowers. Not food. Not medicine. Flowers. Lavender, yarrow, a rosebush with three open blooms. The view from up here: all of Covenant spread below, and beyond the walls, the world.',
    descriptionNight: 'The rooftop at night. The settlement is a map of small lights below. The mountains are a darkness deeper than the sky. The garden smells strongest at night — the lavender especially, the herbs releasing the day\'s warmth. Someone is usually up here after dark, sitting between the containers, looking at the lights.',
    descriptionDawn: 'Dawn on the rooftop arrives before it arrives anywhere else. The eastern sky goes amber and the herbs catch the first light and the view of the mountains in that transitional color is something that people climb up here specifically to see. The rosebush is deepest red at dawn.',
    shortDescription: 'The rooftop garden — flowers because someone decided to plant them, and the whole world visible below.',
    exits: {
      down: 'cv_03_main_street',
    },
    richExits: {
      down: {
        destination: 'cv_03_main_street',
        descriptionVerbose: 'a metal access hatch with a ladder leads back down through the building to Main Street',
      },
    },
    items: [],
    enemies: [],
    npcs: [],
    extras: [
      {
        keywords: ['flowers', 'lavender', 'yarrow', 'rosebush', 'blooms'],
        description: 'The rosebush has three open blooms, red, deep enough to look almost brown in the wrong light. Someone cultivated this from a cutting, which means someone had a cutting, which means someone kept a rosebush alive from before the Collapse. That chain of care — the deliberate, stubborn persistence of it — says something that the grower has probably never put into words.',
      },
      {
        keywords: ['herbs', 'medicinal', 'plants', 'labels', 'stakes'],
        description: 'The medicinal plants are labeled with hand-painted wooden stakes: calendula, echinacea, yarrow, feverfew, valerian. Each stake includes a small notation of the plant\'s use — "wound care," "fever," "sleep." The labels are in two different handwritings — started by one person, continued by another. The project outlasted its founder.',
      },
      {
        keywords: ['fruit trees', 'dwarf', 'containers', 'thriving'],
        description: 'Three dwarf fruit trees in large containers: an apple, a pear, and something that might be a plum. All three are small — container-dwarfed further — but alive, leafed out, with the focused vitality of trees that have adapted. The apple had fruit last fall. The storekeeper cried. He will probably not tell you this, but the story is in the settlement like all the important stories: everyone knows.',
      },
      {
        keywords: ['view', 'settlement', 'walls', 'world', 'horizon'],
        description: 'From up here: the rooftops of Covenant, close enough to see the patches and repairs, the window boxes with their small green things, the people moving in the streets, the smoke from the workshop. Beyond the walls: the highway, the field system to the north, the dark line of the tree line further out. The mountains. Everything that is the world, all of it visible at once, all of it yours to see from up here if you came through the access hatch, which means you belong here.',
      },
      {
        keywords: ['rare herbs', 'athelas', 'uncommon', 'special'],
        description: 'In the corner behind the valerian, growing in a small unpainted container: something you don\'t recognize. The label reads only: A.N. — ask Marsh. The plant has silver-gray leaves with a faint downy texture and smells, when you lean close, like nothing you\'ve encountered before. Dr. Marsh will know what it is.',
        skillCheck: { skill: 'survival', dc: 11, successAppend: 'You identify it: ghost sage, an uncommon high-altitude variant with significant fever-reducing properties. This plant is worth more than most of what\'s in the armory.' },
      },
    ],
    personalLossEchoes: {
      child: 'Flowers. Not food, not medicine. Flowers. Someone planted them because beauty matters, because children should see roses, because the world should have lavender in it even now. You think about what you would have planted for them. You think about the garden you didn\'t get to make.',
      partner: 'The rosebush has three blooms. Someone kept a cutting alive from before the Collapse — years of care, of stubbornness, of refusing to let a beautiful thing die. You did that with a person once. You kept something alive through sheer refusal to let it go. The rose is still here. They are not.',
      community: 'From up here, all of Covenant is visible. The rooftops, the window boxes, the people in the streets. The view is the shape of a community seen from above, and the shape is so like the one you lost that you have to look at the mountains instead, and the mountains don\'t help.',
      identity: 'The herb labels in two different handwritings — started by one person, continued by another. The project outlasted its founder. You look at your own hands and wonder what you started that someone else is continuing, or whether the things you built just stopped when you forgot who built them.',
      promise: 'The dwarf apple tree had fruit last fall. Someone planted it years ago on the faith that years would pass and the tree would bear and someone would be alive to eat the apple. That\'s a promise — to the future, to the continuation of things. You made a promise like that. The tree kept its.',
    },
    npcSpawns: [
      {
        npcId: 'garden_keeper',
        spawnChance: 0.60,
        spawnType: 'anchored',
        activityPool: [
          { desc: 'A quiet person works between the containers with a small hand fork, loosening soil, not in a hurry. They nod when they notice you — they don\'t mind sharing the space.', weight: 3 },
          { desc: 'Someone is sitting between the raised beds with their back against the bathtub planter, face turned up, eyes closed. They\'re still awake. They heard you come through the hatch.', weight: 2 },
          { desc: 'The garden keeper carefully ties back the rosebush canes with strips of cloth, working with the precise attention of someone doing something that matters to them specifically.', weight: 2 },
        ],
        dispositionRoll: { friendly: 0.6, neutral: 0.4, wary: 0.0, hostile: 0.0 },
        dialogueTree: 'cv_garden_keeper',
      },
    ],
    itemSpawns: [
      {
        entityId: 'culinary_herbs_fresh',
        spawnChance: 0.55,
        quantity: { min: 1, max: 2, distribution: 'weighted_low' },
        conditionRoll: { min: 0.8, max: 1.0 },
        groundDescription: 'A small bundle of herbs has been cut and set aside on the edge of a planter — take if you need them.',
        depletion: { cooldownMinutes: { min: 120, max: 300 }, respawnChance: 0.50 },
      },
      {
        entityId: 'ghost_sage_sprig',
        spawnChance: 0.20,
        quantity: { min: 1, max: 1, distribution: 'single' },
        conditionRoll: { min: 0.9, max: 1.0 },
        groundDescription: 'A single sprig of the silver-gray herb has fallen from its container.',
        depletion: { cooldownMinutes: { min: 720, max: 1440 }, respawnChance: 0.10 },
      },
    ],
  },

  // ----------------------------------------------------------
  // CV-19: Marshal Cross's Inner Office
  // ----------------------------------------------------------
  {
    id: 'cv_19_cross_office',
    name: 'Covenant — Marshal\'s Inner Office',
    zone: 'covenant',
    act: 2,
    difficulty: 2,
    visited: false,
    flags: { noCombat: true },
    description: 'The inner office is where the Accord\'s authority resolves into something specific and personal. A work table dominates the room, its surface covered in the living document of a settlement under pressure: patrol route overlays, supply projections, a handwritten ledger of outstanding judgments, three open dispatch folders with URGENT stamped in red. The walls hold a tactical map of Covenant and its surrounds, annotated in a precise, small hand that is obviously Cross\'s — threat vectors, patrol timing windows, known Hollow aggregation points, a cluster of notations around the northern road labeled MERIDIAN / UNCONFIRMED. Everything in this room is functional. There is no chair that isn\'t at the work table. There are no decorations. Power here does not decorate itself.',
    descriptionNight: 'The lamp burns on the work table regardless of the hour. Cross works this room at any time the settlement requires it, which means any time. The dispatch folders have been reshuffled. One has been closed. The map has three new annotations since yesterday.',
    shortDescription: 'The Marshal\'s private inner office — operational intelligence, mission orders, and the full weight of what it costs to keep eight hundred people alive.',
    exits: {
      south: 'cv_16_marshals_quarters',
    },
    richExits: {},
    items: [],
    enemies: [],
    npcs: [],
    extras: [
      {
        keywords: ['map', 'tactical', 'annotations', 'meridian', 'threat'],
        description: 'The tactical map is a pre-Collapse county survey, laminated and mounted, with a palimpsest of overlays in different colored markers. Blue: patrol routes, current. Red: confirmed Hollow sightings, last thirty days. Black: infrastructure — wells, food caches, the wall sections. In the mountain country to the north, a cluster of notations circled in pencil: MERIDIAN / UNCONFIRMED / SOURCE: SIGNAL. Below that, a single question mark. That question mark has been redrawn several times — the pencil has worn a small groove in the laminate.',
        cycleGate: 2,
      },
      {
        keywords: ['dispatch', 'folders', 'orders', 'mission', 'urgent'],
        description: 'The open dispatch folders: the first contains movement orders for the next wall rotation — four sentries reassigned, routes adjusted after last week\'s incident at the east panel. The second is a mission authorization for a supply run south to the river road junction, signature pending. The third, the URGENT folder, holds a single handwritten note. You can read only the opening line before conscience or caution stops you: "If this gets back to the council before I\'ve handled it, we have a larger problem than the one in this folder."',
        cycleGate: 2,
        skillCheck: { skill: 'perception', dc: 13, successAppend: 'You catch the mission designation on the third folder before you look away: OPERATION LAMPBLACK. The name means nothing to you yet.' },
      },
      {
        keywords: ['work table', 'desk', 'ledger', 'judgments'],
        description: 'The judgment ledger is a record of every enforcement decision Cross has made since assuming the marshal role. Each entry: date, parties, charge, decision, follow-up. The handwriting in the early entries is tighter, more controlled. The later entries are looser — not careless, but the looseness of someone who has made enough hard decisions that the act of recording them has become automatic. The most recent entry is blank except for a name and a charge. The decision column is empty.',
      },
      {
        keywords: ['chair', 'personal effects', 'personal', 'decoration'],
        description: 'There is nothing in this room that isn\'t required by the work. The observation sits with you after you\'ve made it. What kind of person strips even private space down to the operational minimum? Someone who has decided that this is all she is right now. Someone who isn\'t sure there\'s anything left below the function.',
      },
    ],
    npcSpawns: [],
    itemSpawns: [
      {
        entityId: 'accord_charter_copy',
        spawnChance: 0.80,
        quantity: { min: 1, max: 1, distribution: 'single' },
        conditionRoll: { min: 0.7, max: 1.0 },
        groundDescription: 'A copy of the Accord charter sits on the corner of the work table, heavily annotated in the margins.',
        depletion: { cooldownMinutes: { min: 99999, max: 99999 }, respawnChance: 0.0 },
      },
    ],
    narrativeNotes: 'Act II access room behind Marshal\'s Quarters. Contains operational intelligence and the first reference to OPERATION LAMPBLACK. Cross NPC intentionally absent — she is everywhere but her own rooms.',
  },

  // ----------------------------------------------------------
  // CV-20: The Underground Archive
  // ----------------------------------------------------------
  {
    id: 'cv_20_underground_archive',
    name: 'Covenant — The Underground Archive',
    zone: 'covenant',
    act: 2,
    difficulty: 3,
    visited: false,
    flags: { hiddenRoom: true, scavengingZone: true, combat_darkness: true, combat_narrow_passage: true },
    cycleGate: 2,
    description: 'The air changes the moment you push the door open — drier than the basement, with the particular stillness of a sealed space. The archive is a former utility room, its original purpose long overwritten. Metal shelving units line three walls, each loaded with labeled binders and sealed archival boxes. The labels are in government-standard font: MERIDIAN FACILITY — COHORT RECORDS. CHARON-7 — PHASE II PROTOCOLS. ACCORD INTERNAL — GOVERNANCE HISTORY. The last category is the largest and the most disturbing — not because it is classified, but because the governance history of the Accord, as documented here, does not match the governance history the Accord tells about itself. Discrepancies accumulate as you read the spines. By the fourth shelf, you understand why this room is locked.',
    descriptionNight: 'The archive has no windows. Night does not exist here — only the lamplight and the documents and the gradual weight of what the Accord knows and has chosen not to share.',
    shortDescription: 'The Accord\'s sealed archive — MERIDIAN records, pre-collapse government files, and a history that doesn\'t match the official one.',
    exits: {
      north: 'cv_17_the_basement',
    },
    richExits: {
      north: {
        destination: 'cv_17_the_basement',
        locked: true,
        lockedBy: 'courthouse_archive_key',
        descriptionVerbose: 'the heavy steel door back to the basement — same lock, same key',
      },
    },
    items: [],
    enemies: [],
    npcs: [],
    extras: [
      {
        keywords: ['meridian', 'cohort records', 'charon', 'classified', 'files'],
        description: 'The MERIDIAN FACILITY — COHORT RECORDS boxes are sealed with tamper-evident tape that has been broken and resealed at least once — the color match is almost right but not quite. Inside one box you peel open: personnel files, medical evaluations, and a document titled OPTIMIZATION OUTCOME MATRIX — COHORT 4. The matrix lists subjects by number, not name. The outcome column has three possible values: FAILED, PARTIAL, SUCCESSFUL. The distribution is not what you would hope.',
        cycleGate: 2,
        skillCheck: { skill: 'lore', dc: 12, successAppend: 'You recognize the CHARON-7 notation from other fragments you\'ve encountered. The connection crystallizes: the Hollow, the Sanguine, the Revenant phenomenon — they\'re all in this matrix. Different columns. Same source document.' },
        questFlagOnSuccess: { flag: 'meridian_archive_accessed', value: true },
        reputationGrant: { faction: 'accord', delta: 1 },
      },
      {
        keywords: ['accord', 'governance', 'history', 'internal', 'discrepancy'],
        description: 'The ACCORD INTERNAL — GOVERNANCE HISTORY binders document decisions the council made that were never announced. A vote in year two on what to do with non-contributing residents — the vote was close and the decision recorded is "deferred," which is not what several drifters who arrived in year two remember happening. A second document authorizes an intelligence operation against the Salters dated six months before the Accord publicly claimed relations had broken down. The history in here is the same history. The emphasis is different.',
        cycleGate: 2,
      },
      {
        keywords: ['shelves', 'boxes', 'binders', 'archive', 'labels'],
        description: 'The sheer volume is part of the message — whoever built this archive wanted everything preserved and accessible. Not hidden in the sense of destroyed, just hidden in the sense of controlled. There is a difference. Whether that difference is meaningful depends on what you think the Accord is for.',
      },
    ],
    npcSpawns: [],
    itemSpawns: [
      {
        entityId: 'meridian_file_fragment',
        spawnChance: 0.90,
        quantity: { min: 1, max: 2, distribution: 'weighted_low' },
        conditionRoll: { min: 0.8, max: 1.0 },
        groundDescription: 'A classified file, partially unsealed, rests on the nearest shelf within reach.',
        depletion: { cooldownMinutes: { min: 99999, max: 99999 }, respawnChance: 0.0 },
      },
      {
        entityId: 'meridian_perimeter_memo',
        spawnChance: 0.60,
        quantity: { min: 1, max: 1, distribution: 'single' },
        conditionRoll: { min: 0.7, max: 1.0 },
        groundDescription: 'A perimeter security memo with military classification markings.',
        depletion: { cooldownMinutes: { min: 99999, max: 99999 }, respawnChance: 0.0 },
      },
    ],
    narrativeNotes: 'Act II critical-path lore room. Accessible only via lockpick or courthouse_archive_key. Contains MERIDIAN revelations and Accord history discrepancies that recontextualize the faction. Should feel like a reward for players who pursued the investigation threads.',
  },

  // ----------------------------------------------------------
  // CV-21: Garrison Barracks
  // ----------------------------------------------------------
  {
    id: 'cv_21_garrison_barracks',
    name: 'Covenant — Garrison Barracks',
    zone: 'covenant',
    act: 1,
    difficulty: 1,
    visited: false,
    flags: { noCombat: true, safeRest: false },
    description: 'The barracks smell of boot leather, gun oil, and the particular human closeness of people who live and sleep within arm\'s reach of one another and have made their peace with it. Bunks run the length of both walls — thirty-two of them, half currently empty, the occupied ones showing the small personal economies of people who own very little: a photograph tucked into a bunk frame, a book wedged between the mattress and the wall, a hand-sewn patch on a jacket hung from a post. Off-duty militia move through the space with the ease of people at home and the readiness of people who are never entirely off duty. The unit culture is visible in the details: a shared joke that plays out in a gesture between two soldiers, a coffee-stained mug rack with names written in marker, the duty roster on the back wall hand-lettered and already annotated with someone\'s dry commentary in the margins.',
    descriptionNight: 'At night, most of the bunks are occupied. The sounds of people sleeping — breathing, the occasional restless shift — fill the space. Two soldiers sit at the far end under a lamp, speaking low, not sleeping. They have the look of people working through something that doesn\'t go away in the dark.',
    shortDescription: 'The garrison barracks — bunks, gun oil, loyalty worn like a second uniform, and the quiet doubt underneath.',
    exits: {
      east: 'cv_07_infirmary',
    },
    richExits: {},
    items: [],
    enemies: [],
    npcs: [],
    extras: [
      {
        keywords: ['bunks', 'beds', 'personal effects', 'photographs'],
        description: 'The personal effects in the bunk frames tell the story the soldiers don\'t. One has a child\'s crayon drawing, laminated. One has a watch with a cracked face, hanging from a nail — not worn, kept. One has nothing at all, which is its own kind of statement. These are people who carried what mattered most and left everything else behind. What they brought is visible. What they left behind is not, but you can feel its shape.',
      },
      {
        keywords: ['duty roster', 'schedule', 'rotation', 'commentary'],
        description: 'The duty roster lists every militia member by last name and shift assignment. Someone has added commentary in a different hand: next to one name, "night owl, works harder after midnight"; next to another, "give her the south wall, she spots movement better than the scopes." The comments are accurate tactical assessments written in the style of someone who cares about the people being assessed.',
      },
      {
        keywords: ['culture', 'unit', 'loyalty', 'accord', 'doubt'],
        description: 'They believe in the Accord — not naively, you sense, but in the way that soldiers believe in the unit they\'ve bled with: because the alternative is believing in nothing while doing the same work. A few of them have been here since the beginning, before Cross took the marshal role. Those ones are harder to read. They know what the Accord was when it was being built and what it has become, and something in them is measuring the distance.',
        skillCheck: { skill: 'perception', dc: 11, successAppend: 'One soldier catches your eye — not hostile, not welcoming, but assessing. He\'s been here longer than the others. The way he watches Cross\'s name on the roster tells you something isn\'t sitting right with him.' },
      },
    ],
    npcSpawns: [
      {
        npcId: 'accord_militia',
        spawnChance: 0.90,
        spawnType: 'wanderer',
        quantity: { min: 2, max: 4, distribution: 'weighted_low' },
        activityPool: [
          { desc: 'An off-duty militiaman cleans her rifle at the bench, hands moving through the steps without pause — bolt, barrel, spring, reassemble.', weight: 4 },
          { desc: 'Two soldiers sit across from each other on their bunks, speaking in low voices about something specific and quiet. They stop when you enter, then resume when they\'ve assessed you.', weight: 3 },
          { desc: 'A young militia member oils and re-oils the same piece of her gear. It doesn\'t need it anymore. Her hands need something to do.', weight: 2 },
          { desc: 'An older soldier sleeps in his bunk — flat on his back, arms at his sides, out cold — the bunk noise and the ambient light irrelevant to him.', weight: 2 },
        ],
        dispositionRoll: { friendly: 0.2, neutral: 0.6, wary: 0.2, hostile: 0.0 },
        dialogueTree: 'cv_militia_barracks',
      },
    ],
    itemSpawns: [],
  },

  // ----------------------------------------------------------
  // CV-22: The Council Chamber
  // ----------------------------------------------------------
  {
    id: 'cv_22_council_chamber',
    name: 'Covenant — The Council Chamber',
    zone: 'covenant',
    act: 2,
    difficulty: 2,
    visited: false,
    flags: { noCombat: true, questHub: true },
    description: 'The council chamber is the most formal room in Covenant and carries that formality like a reminder of what\'s at stake. A long salvaged table runs the center — eight mismatched chairs arranged with deliberate care, each position marked by a small folded placard. The placard names are the names of the Accord\'s governing structure: MARSHAL, CHIEF MEDIC, GARRISON COMMANDER, STOREKEEPER, CIVIL ENGINEER, TRADER REPRESENTATIVE, RESIDENT REPRESENTATIVE, and at the far end, simply RECORDER. The walls hold the Accord\'s founding documents in framed copies, the original charter alongside the amendments, each signed and countersigned. There is a smell of stale coffee and the particular air of rooms where decisions are made and then lived with. The chair at the marshal\'s position is slightly further from the table than the others — Cross\'s habit, giving herself room to stand quickly.',
    descriptionNight: 'The council chamber at night is empty and almost loud with it — the residue of decisions made here during the day, the shape of arguments that ended without resolution. Someone left a coffee cup. The recorder\'s ledger is open on the table. The last entry is three lines, which means a decision was made with minimal debate, which means either consensus or something that couldn\'t be argued.',
    shortDescription: 'The council chamber — long table, faction placards, founding documents framed on the wall, and the weight of every decision made in this room.',
    exits: {
      north: 'cv_05_courthouse_upper',
    },
    richExits: {
      north: {
        destination: 'cv_05_courthouse_upper',
        reputationGate: { faction: 'accord', minLevel: 2 },
        descriptionVerbose: 'the council chamber door — Trusted Accord standing required',
      },
    },
    items: [],
    enemies: [],
    npcs: [],
    extras: [
      {
        keywords: ['placards', 'names', 'seats', 'positions', 'chairs'],
        description: 'The placard positions are fixed but the people in them shift. TRADER REPRESENTATIVE has had three incumbents in two years — the seat is contested, the faction behind it divided. RESIDENT REPRESENTATIVE has been the same person since year one, an older woman who says little during sessions and whose silences the other council members have learned to pay attention to. The marshal\'s chair is positioned slightly back. Either Cross built in that physical reminder of her authority, or she built in the ability to exit the room quickly. Possibly both.',
      },
      {
        keywords: ['charter', 'amendments', 'founding documents', 'accord', 'wall'],
        description: 'The founding charter is hand-lettered on two sheets of salvaged resume paper, framed behind salvaged glass. Five signatures at the bottom, three of which belong to people who are no longer living. The amendments follow in numbered succession. The fifth amendment has a note beside it in the recorder\'s hand: "Passed 5-3 over Salter bloc objection. Marshal Cross abstained." The note does not say whether the abstention was principled or strategic. The people in the room at the time know. Most of them are still here.',
        cycleGate: 2,
      },
      {
        keywords: ['recorder', 'ledger', 'minutes', 'log'],
        description: 'The recorder\'s ledger is the actual history of Covenant\'s governance — not the version on the wall, but the working version, with strikethroughs and margin notes and the record of motions that failed and motions that were withdrawn before they could be recorded as failing. It is not a flattering document. It is an honest one. The Accord is not wrong to keep it in this room and not in public circulation. It is worth reading if you can.',
        skillCheck: { skill: 'lore', dc: 10, successAppend: 'A recurring pattern emerges in the minutes: proposals for expanding Covenant\'s intake of outside refugees consistently fail 5-3. The same bloc votes no each time. The reason cited in the minutes is "resource constraints." The reason in the margin, in the recorder\'s small hand: "security concern per Marshal Cross."' },
      },
    ],
    npcSpawns: [],
    itemSpawns: [
      {
        entityId: 'accord_charter_copy',
        spawnChance: 0.70,
        quantity: { min: 1, max: 1, distribution: 'single' },
        conditionRoll: { min: 0.9, max: 1.0 },
        groundDescription: 'An official copy of the Accord charter rests in the center of the council table.',
        depletion: { cooldownMinutes: { min: 99999, max: 99999 }, respawnChance: 0.0 },
      },
    ],
    narrativeNotes: 'Reputation-gated political room. The council doesn\'t meet in the player\'s presence in Act I — this is exploration space. In Act II, a council session can be triggered here by quest progression.',
  },

  // ----------------------------------------------------------
  // CV-23: Accord Clinic Overflow Ward
  // ----------------------------------------------------------
  {
    id: 'cv_23_accord_clinic_overflow',
    name: 'Covenant — Clinic Overflow Ward',
    zone: 'covenant',
    act: 1,
    difficulty: 1,
    visited: false,
    flags: { noCombat: true, healingBonus: 10 },
    description: 'If the infirmary is where Covenant\'s medical care aspires to be, the overflow ward is where it lands when reality intervenes. Folding cots crowd the former storage room, close enough that the medic aides have to turn sideways to pass between them. The patients here are the lower priority cases — cracked ribs, infected minor wounds, persistent fever without clear cause, and in three of the cots, refugees with no Accord standing whose conditions were judged non-urgent by whoever was triaging that day. That judgment sits in the room like weather: some of the patients know they\'re being graded and the grade has already come back. The equipment is the infirmary\'s surplus: older dressings, the antiseptic that works less reliably, the blood pressure cuff that reads slightly high. People are being cared for. People are not being cared for equally.',
    descriptionNight: 'The overflow ward at night is quieter than the main infirmary but less peaceful — the closeness of the cots, the particular sounds of people in discomfort trying not to disturb the people next to them, the medic aide on night watch with a single candle, moving carefully in the cramped space.',
    shortDescription: 'The overflow ward — crowded, under-resourced, and a visible seam in the principle that all are treated first.',
    exits: {
      west: 'cv_07_infirmary',
    },
    richExits: {},
    items: [],
    enemies: [],
    npcs: [],
    extras: [
      {
        keywords: ['refugees', 'patients', 'cots', 'priority', 'graded'],
        description: 'Three of the cots hold people who arrived outside Covenant\'s intake quota — refugees who came in on the wrong day, or with the wrong person vouching for them, or with nothing to trade for the credential that would make them residents rather than tolerated guests. They have been treated. Their wounds are cleaned and dressed. They are also separate from the main ward, in a room with less equipment, seen by the aide rather than the doctor. The policy says: all are treated first. The policy doesn\'t say treated equally.',
        questFlagOnSuccess: { flag: 'cv_overflow_refugees_noted', value: true },
      },
      {
        keywords: ['equipment', 'supplies', 'dressings', 'shortage'],
        description: 'The supply shelf in the overflow ward holds what didn\'t make it to the main infirmary: bandages near their use-by date, a bottle of antiseptic that\'s been diluted once already, splints made from salvaged lumber rather than proper medical-grade material. These are not negligent choices — the main infirmary needs priority stock. This is the allocation of scarcity, which is a different category of injustice than cruelty but is still injustice.',
      },
      {
        keywords: ['aide', 'medic', 'care', 'worker'],
        description: 'The medic aide working the overflow is younger than Dr. Marsh\'s other trainees — maybe nineteen. She moves between the cots with a focus that looks like Marsh\'s, the same economy of motion, the same quiet voices for patients. She checks on the refugee cots last, not because she doesn\'t care but because that\'s how the priority was given to her and she\'s learning in a system she didn\'t design.',
      },
    ],
    npcSpawns: [],
    itemSpawns: [
      {
        entityId: 'bandages',
        spawnChance: 0.45,
        quantity: { min: 1, max: 2, distribution: 'weighted_low' },
        conditionRoll: { min: 0.4, max: 0.8 },
        groundDescription: 'A package of bandages — older stock — sits on the supply shelf.',
        depletion: { cooldownMinutes: { min: 120, max: 360 }, respawnChance: 0.35 },
      },
      {
        entityId: 'field_dressing',
        spawnChance: 0.25,
        quantity: { min: 1, max: 1, distribution: 'single' },
        conditionRoll: { min: 0.5, max: 0.9 },
        groundDescription: 'A field dressing, slightly worn packaging, rests near the edge of the shelf.',
        depletion: { cooldownMinutes: { min: 180, max: 480 }, respawnChance: 0.25 },
      },
    ],
    narrativeNotes: 'Sociopolitical contrast room to the main infirmary. Surfaces the gap between Accord principle and Accord practice without making the Accord simply villainous — the triage is a product of scarcity, not malice. Player can engage with refugee NPCs here for associated quests.',
  },

  // ----------------------------------------------------------
  // CV-24: Extended Holding Cells
  // ----------------------------------------------------------
  {
    id: 'cv_24_holding_cells',
    name: 'Covenant — Extended Holding Block',
    zone: 'covenant',
    act: 1,
    difficulty: 2,
    visited: false,
    flags: { noCombat: true },
    description: 'The holding block is what the jail became when the jail ran out of room. Three additional cells along a corridor that smells of lime wash and old damp, each cell a concrete box with a steel door rather than bars — less visible than the main jail, which is precisely the point. The cells are not secret. They are simply not announced. Covenant\'s official holding capacity is two. Its actual holding capacity is five, and the three additional cells exist in the governance record as "auxiliary security facilities" in a notation that required two amendment votes and produced no public debate. The people currently in these cells have been charged. Most of them have not been heard. The paperwork is in process. The process moves at the speed of a settlement managing eight hundred lives with limited administrative bandwidth, which is to say: slowly.',
    descriptionNight: 'The holding block at night has the specific quiet of people who are not sleeping because they cannot. The lime-washed concrete holds the cold. Someone in the far cell is awake and not moving, which is the sound of someone working very hard at patience.',
    shortDescription: 'The extended holding block — three unofficial cells, paperwork in process, people waiting for a hearing that moves at the speed of survival.',
    exits: {
      west: 'cv_12_the_jail',
    },
    richExits: {},
    items: [],
    enemies: [],
    npcs: [],
    extras: [
      {
        keywords: ['cells', 'doors', 'block', 'unofficial', 'auxiliary'],
        description: 'The steel doors are salvaged — hospital fire doors, heavy, the handles removed and replaced with padlock hasps. Someone did clean work converting them. The cells behind them are smaller than the main jail cells: a cot, a bucket, a water jug. No window. The lime wash on the walls is recent enough that it still smells faintly of the application. Someone maintains this space. It is maintained the way necessary things are maintained: adequately.',
        cycleGate: 2,
      },
      {
        keywords: ['prisoners', 'held', 'charges', 'hearing', 'process'],
        description: 'Three cells, three occupants when full. Current occupancy: two. The paperwork on the door slots gives names and charges — one for theft from the granary stores (the supply investigation Cross is running), one for striking a militia officer during a dispute. Both have hearing dates written in pencil on the paperwork: both dates have passed. Neither has been crossed out. Neither has been rescheduled yet.',
        questGate: 'cv_supply_investigation',
      },
      {
        keywords: ['governance', 'record', 'amendment', 'debate'],
        description: 'The fact that this block exists in the governance record as "auxiliary security facilities" is either scrupulous transparency or the kind of bureaucratic minimalism that makes things technically documented and practically invisible. The council members who voted for it knew what they were voting for. The residents who weren\'t in that meeting don\'t know this block exists. That gap is not an accident.',
        cycleGate: 2,
        skillCheck: { skill: 'lore', dc: 11, successAppend: 'The amendment that authorized this block also modified the definition of "resident in good standing" in a way that made it easier to hold non-residents without a standard hearing timeline. The modification was not flagged in the public summary of the vote.' },
      },
    ],
    npcSpawns: [
      {
        npcId: 'brig_guard',
        spawnChance: 0.85,
        spawnType: 'anchored',
        activityPool: [
          { desc: 'A guard sits at the corridor end with a ledger, logging the cell check times with the minimal but consistent attention of someone doing an unpleasant job correctly.', weight: 3 },
          { desc: 'The guard does a slow walk of the corridor, checking each door hasp, returning to her post without looking at the cells. She has done this enough times that she doesn\'t need to.', weight: 2 },
        ],
        dispositionRoll: { friendly: 0.0, neutral: 0.6, wary: 0.3, hostile: 0.1 },
        dialogueTree: 'cv_holding_guard',
      },
      {
        npcId: 'brig_prisoner_accord',
        spawnChance: 0.75,
        spawnType: 'anchored',
        activityPool: [
          { desc: 'The sound of someone shifting on a cot, trying to find a position that will let them sleep. They don\'t find it.', weight: 3 },
          { desc: 'A voice from behind one of the steel doors, measured: "Hey. You an officer? When\'s the hearing?" The guard doesn\'t answer. The voice goes quiet.', weight: 2 },
        ],
        dispositionRoll: { friendly: 0.1, neutral: 0.5, wary: 0.3, hostile: 0.1 },
        dialogueTree: 'cv_holding_prisoner',
      },
    ],
    itemSpawns: [],
    environmentalRolls: {
      flavorLines: [
        { line: 'The corridor smells of lime wash — recent application. The cells are maintained. The maintenance is not comfort; it is procedure.', chance: 0.25, time: null },
        { line: 'From behind one of the steel doors: nothing. The nothing is deliberate. Someone in there has learned not to make sounds that don\'t accomplish anything.', chance: 0.20, time: null },
      ],
    },
    narrativeNotes: 'Tonal counterpoint to the Accord\'s official justice rhetoric. Not a corruption reveal — the system is doing what bureaucratic systems do under pressure. The injustice is structural, not personal, which is harder to resolve.',
  },

  // ----------------------------------------------------------
  // CV-25: Wall, South Section
  // ----------------------------------------------------------
  {
    id: 'cv_25_wall_south',
    name: 'Covenant — The Wall, South Section',
    zone: 'covenant',
    act: 1,
    difficulty: 2,
    visited: false,
    flags: { noCombat: false, combat_high_ground: true },
    description: 'The south wall overlooks the road out — the highway south, the approach from river country, the direction that strangers come from. From the patrol walkway you can see the gate below and to the east, and beyond it the road stretching south until it bends around the low ridge and disappears. The exposure here is different from the north wall: the north watches for threat; the south watches for arrival. Every shape on that road resolves eventually into something — a person, a vehicle, a group. The sentries here have gotten good at reading silhouettes at distance. The question they are always answering: what kind of thing is coming, and how many of them, and are they bringing something we need or something we should close the gate against.',
    descriptionNight: 'The south wall at night is where you learn what the approaches look like in the dark. The sentries here use lamplight sparingly — light gives away position as much as it provides vision. They have learned to read the road by starlight and moonlight, which takes time but produces a patience that daytime watchers don\'t always have.',
    shortDescription: 'The south wall — overlooking the approach road, watching for what comes up from river country, asking the same question all border posts ask.',
    exits: {
      east: 'cv_14_wall_north',
      south: 'cv_15_wall_east',
    },
    richExits: {},
    items: [],
    enemies: [],
    npcs: [],
    hollowEncounter: {
      baseChance: 0.07,
      timeModifier: { day: 0.3, dusk: 1.4, night: 2.2, dawn: 0.7 },
      threatPool: [
        { type: 'shuffler', weight: 70, quantity: { min: 1, max: 2, distribution: 'weighted_low' } },
        { type: 'remnant', weight: 20, quantity: { min: 1, max: 1, distribution: 'single' } },
        { type: 'screamer', weight: 10, quantity: { min: 1, max: 1, distribution: 'single' } },
      ],
      awarenessRoll: { unaware: 0.55, awarePassive: 0.30, awareAggressive: 0.15 },
    },
    extras: [
      {
        keywords: ['road', 'highway', 'south', 'approach', 'view'],
        description: 'The highway south runs straight for about a mile before the ridge bends it out of sight. On a clear day the sentries can see the first half-mile with the naked eye and the second with the spotting scope. The road shows the same signs that all the roads show: old skid marks from the Collapse years, a rusted vehicle on its side in the ditch two hundred yards out that no one has moved because moving it would require leaving the wall. Beyond the vehicle, just a road. Just the world.',
      },
      {
        keywords: ['silhouettes', 'reading', 'arrivals', 'strangers', 'identification'],
        description: 'The south wall sentries have a vocabulary for what they see: "single walker," "family group," "trader with cart," "armed party." They report to the gate using hand signals developed over two years of iteration. The current system has fourteen distinct signals. The one used most often: two fingers extended, then a question mark gesture — unknown, armed, approaching. The gate militia respond by getting on the radio.',
        skillCheck: { skill: 'perception', dc: 10, successAppend: 'You pick out the signal protocol quickly — pattern recognition. Someone\'s been thinking carefully about ambiguity, and the system shows it. There are signals for hesitation and uncertainty, which tells you something about how the people who built it thought about honesty.' },
      },
      {
        keywords: ['gate', 'sentry', 'militia', 'post', 'patrol'],
        description: 'Two sentries on rotation, south wall, standard four-hour shift. They move in opposite directions along the walkway and meet in the middle every circuit, exchanging a few words, then continuing. The words are always brief: a bearing, an update, a nothing-to-report. Sometimes they pass without speaking. That silence is also a report.',
      },
    ],
    npcSpawns: [
      {
        npcId: 'accord_militia',
        spawnChance: 0.90,
        spawnType: 'patrol',
        quantity: { min: 1, max: 2, distribution: 'weighted_low' },
        activityPool: [
          { desc: 'A sentry scans the approach road through a spotting scope, sweeping slowly, pausing on the rusted vehicle in the ditch before moving on.', weight: 3 },
          { desc: 'Two sentries pass each other at the midpoint of the walkway. One says something short. The other nods and keeps moving. The exchange takes three seconds.', weight: 2 },
          { desc: 'The sentry at the south end of the walkway has stopped moving. She\'s watching something on the road. After a long moment she brings up the scope, looks, and lowers it. She reaches for the radio, thinks, then doesn\'t use it.', weight: 2 },
        ],
        dispositionRoll: { friendly: 0.2, neutral: 0.6, wary: 0.2, hostile: 0.0 },
        dialogueTree: 'cv_south_wall_sentry',
      },
    ],
    itemSpawns: [],
    environmentalRolls: {
      flavorLines: [
        { line: 'The wind comes up from the south, carrying road dust and the faint smell of whatever is burning two miles out. The sentry notes the direction without looking away from the scope.', chance: 0.25, time: ['day', 'dusk'] },
        { line: 'A shape on the road at distance. It resolves into a person, alone, moving at walking pace. The sentry picks up the radio. Then puts it back down. Continues watching.', chance: 0.20, time: ['day'] },
      ],
    },
  },

  // ----------------------------------------------------------
  // CV-26: Refugee Processing
  // ----------------------------------------------------------
  {
    id: 'cv_26_refugee_processing',
    name: 'Covenant — Refugee Processing Area',
    zone: 'covenant',
    act: 1,
    difficulty: 1,
    visited: false,
    flags: { noCombat: true },
    description: 'Outside the main gate, to the east, a cluster of canvas tents has hardened into something more permanent — salvaged poles and tarps that have been up long enough to develop mildew patterns and a proprietary lean. The Accord intake system operates here: a folding table, a ledger, two officers who have the patient, slightly hollowed look of people doing a job that is never finished. The queue when you arrive has eleven people in it. They stand with the specific posture of people who have been standing for a while and have stopped tracking how long: weight shifted, eyes forward, nothing displayed. The intake process takes twenty minutes per person for a straightforward case. The ledger on the table is thick. Most of the entries result in a stamp that says DEFERRED.',
    descriptionNight: 'The processing area doesn\'t close at night — the queue doesn\'t empty, so the table stays open. Lanterns on poles. The intake officer on night shift is younger and faster with the ledger, which means the DEFERRED stamps come quicker. The tents are occupied; you can hear the specific silence of people trying to sleep in close quarters with strangers, each sound politely muffled.',
    shortDescription: 'The refugee processing area — tents that have been up too long, a queue that\'s never empty, and the DEFERRED stamp doing most of the work.',
    exits: {
      west: 'cv_01_main_gate',
    },
    richExits: {},
    items: [],
    enemies: [],
    npcs: [],
    extras: [
      {
        keywords: ['queue', 'line', 'people', 'waiting', 'applicants'],
        description: 'Eleven people in the queue, as of now. The woman at the front has been through this process before — you can tell by the way she holds her documents, already organized in the order the intake officers request them. The family three spots back has a child who is asleep standing, weight supported between the two adults. The man at the back of the queue is watching the front of the queue with a calculation in his eyes that might be patience or might be something else.',
      },
      {
        keywords: ['intake', 'officers', 'table', 'ledger', 'processing'],
        description: 'The intake officers work with the exhausted efficiency of people who process the same categories of tragedy all day and have learned not to let each one land fully. Their questions are standardized: origin, skills, health status, any prior Accord contact, the name of any Covenant resident who can vouch for you. On the question of a vouching resident, most of the queue has no answer. Without a vouching resident, the stamp is DEFERRED — placed in a secondary queue for council review that moves at the speed of the council\'s other priorities.',
        skillCheck: { skill: 'negotiation', dc: 12, successAppend: 'The intake officer on the left looks up when you approach — not at you, but at the queue behind you. For a moment you see what she sees: the math of it, the ratio of DEFERRED to ACCEPTED, the faces attached to that math. She doesn\'t say anything. She goes back to the ledger.' },
      },
      {
        keywords: ['tents', 'camps', 'deferred', 'waiting area'],
        description: 'The DEFERRED applicants don\'t leave — where would they go? The tent cluster is their waiting area, which has become a waiting settlement within sight of the gate that represents their future. Some have been here three weeks. One family, locals say, has been here two months. The Accord provides: daily water allocation, one meal ration, and access to the overflow clinic for genuine medical emergencies. The Accord does not provide: resolution. The timeline for council review is posted on a board by the table. The current stated wait is fourteen to twenty-one business days, a figure that has not changed in six weeks.',
      },
    ],
    npcSpawns: [
      {
        npcId: 'accord_gate_militiaman',
        spawnChance: 0.80,
        spawnType: 'anchored',
        quantity: { min: 1, max: 2, distribution: 'weighted_low' },
        activityPool: [
          { desc: 'An intake officer moves through the DEFERRED stamps with mechanical efficiency, her expression the careful neutral of someone doing a systemic job without pretending it\'s personal.', weight: 3 },
          { desc: 'The intake officer looks up from the ledger and takes in the current queue length, then back down. Her expression doesn\'t change. She has done this calculation before and will do it again.', weight: 2 },
        ],
        dispositionRoll: { friendly: 0.1, neutral: 0.7, wary: 0.2, hostile: 0.0 },
        dialogueTree: 'cv_refugee_intake',
      },
    ],
    itemSpawns: [],
    environmentalRolls: {
      flavorLines: [
        { line: 'The DEFERRED stamp hits the ledger with a sound that is not loud but carries. The person at the front of the queue takes the ledger back and looks at it. They knew what it would say.', chance: 0.30, time: ['day'] },
        { line: 'A child in the queue is asleep, standing, weight distributed between the two adults on either side. The adults don\'t shift or adjust. They have done this before.', chance: 0.20, time: null },
      ],
    },
    narrativeNotes: 'The Accord\'s intake system shown from the outside. The moral tension here is structural — Covenant can\'t absorb unlimited refugees and the intake system is a real solution to a real problem, but that doesn\'t make the people in the queue less real. Quest hooks: vouching for specific refugees, investigating the long-deferred cases, learning the council\'s actual review process.',
  },

  // ----------------------------------------------------------
  // CV-27: Quartermaster Depot
  // ----------------------------------------------------------
  {
    id: 'cv_27_quartermaster_depot',
    name: 'Covenant — Quartermaster Depot',
    zone: 'covenant',
    act: 1,
    difficulty: 1,
    visited: false,
    flags: { noCombat: true, questHub: true },
    description: 'The depot sits directly south of the granary and exists in total operational symbiosis with it: what the granary stores, the depot distributes; what the militia needs, the depot tracks; what comes in from the field, the depot receives and catalogs. The shelving here is metal, salvaged commercial, organized by category with a ruthlessness that becomes its own kind of beauty when you understand the system: medical supplies on the left, always left, color-coded by priority. Equipment and gear in the center, tagged with unit assignment. Consumables and provisions on the right, organized by caloric value and shelf life. A logistics ledger on the central table is six months of perfect record-keeping in dense handwriting. Quartermaster Okafor runs this room the way a musician runs a difficult piece: from memory, fluently, with zero tolerance for deviation and an almost physical discomfort at disorder.',
    descriptionNight: 'The depot runs a night inventory on the first of every week. Okafor does it herself, moving through the shelves with a lamp and the ledger, cross-referencing the count against the record. She has never once found an error in her own entries.',
    shortDescription: 'The quartermaster depot — every item tracked, every unit accounted for, every supply decision documented by the woman who has made this logistics system from nothing.',
    exits: {
      north: 'cv_13_granary',
    },
    richExits: {},
    items: [],
    enemies: [],
    npcs: [],
    extras: [
      {
        keywords: ['shelving', 'organization', 'system', 'layout', 'categories'],
        description: 'The system is elegant once you see it. Medical on the left because it is always the priority — you go left first without thinking. Equipment in the center because it\'s the most actively accessed category and center minimizes travel distance. Consumables on the right because they can be retrieved last after the higher-priority checks. The color coding on the medical shelf is Okafor\'s addition from year two — three colors, three priority levels, visible at a glance from the door. Marsh was the one who suggested colors. Okafor implemented them within forty-eight hours.',
        skillCheck: { skill: 'perception', dc: 9, successAppend: 'The system also has a secondary coding layer you spotted: small dots on the shelf tags. Not decorative — they mark which items have been requested and not yet filled. You count eleven dots on the medical shelf. That\'s eleven outstanding medical requests that the depot doesn\'t currently have stock for.' },
      },
      {
        keywords: ['ledger', 'records', 'tracking', 'accounting', 'log'],
        description: 'The logistics ledger is six months of inward and outward transfers, each entry dated, initialed by the receiving party, and cross-referenced to the granary and armory counts. The handwriting doesn\'t change — same pressure, same size, same precision at the end of a shift as the beginning. If you look for variances you find one: a category labeled INTERNAL TRANSFER / UNSPECIFIED that appears six times in the last two months, each entry initialed only by Okafor, with no receiving party. The amounts are small. Small enough to be rounding errors. Too regular to be rounding errors.',
        cycleGate: 2,
        questGate: 'cv_supply_investigation',
        skillCheck: { skill: 'perception', dc: 13, successAppend: 'The pattern is real. Six transfers, each on a different day of the week, no pattern to the day — but the same time notation: evening shift, after the day guard rotation. Someone knew when attention would be lowest. The amounts match the granary discrepancy Cross is investigating. The initial on the ledger is Okafor\'s. You don\'t know yet if that means she\'s the problem or the solution.' },
      },
      {
        keywords: ['okafor', 'quartermaster', 'sergeant'],
        description: 'Okafor came to Covenant as a supply sergeant from a military unit that dissolved when its commanding officer died in year one. She arrived with the unit\'s complete supply manifest memorized and offered it to Cross as her introduction. Cross gave her the depot on the second day and hasn\'t regretted it. Okafor never discusses the unit or the officer. She discusses logistics, equipment maintenance, and the ongoing supply shortfall with the focused clarity of someone who has decided that the available work is sufficient to fill all available attention.',
      },
    ],
    npcSpawns: [
      {
        npcId: 'quartermaster_okafor',
        spawnChance: 0.90,
        spawnType: 'anchored',
        activityPool: [
          { desc: 'Okafor moves through the shelves with a clipboard, running a quick visual inventory with the speed of someone who knows exactly what should be where and only needs to confirm it.', weight: 4 },
          { desc: 'Okafor is at the central table, reviewing the logistics ledger with a fine-tipped pen, adding a new entry in her precise handwriting. She finishes the line before looking up.', weight: 3 },
          { desc: 'Okafor is receiving a supply delivery from a militia runner, checking each item against a list, initialing the transfer receipt with the pen she keeps clipped to her vest. She nods once when the count matches.', weight: 2 },
        ],
        tradeInventory: ['field_dressing', 'bandages', 'canned_food', 'scrap_metal', 'basic_repair_kit'],
        dispositionRoll: { friendly: 0.1, neutral: 0.65, wary: 0.25, hostile: 0.0 },
        dialogueTree: 'cv_okafor_depot',
        questGiver: ['cv_supply_investigation', 'cv_quartermaster_delivery'],
      },
    ],
    itemSpawns: [
      {
        entityId: 'field_dressing',
        spawnChance: 0.50,
        quantity: { min: 1, max: 3, distribution: 'weighted_low' },
        conditionRoll: { min: 0.7, max: 1.0 },
        groundDescription: 'Field dressings in standard-issue packaging sit in their designated shelf slot.',
        depletion: { cooldownMinutes: { min: 240, max: 480 }, respawnChance: 0.40 },
      },
      {
        entityId: 'canned_food',
        spawnChance: 0.40,
        quantity: { min: 1, max: 2, distribution: 'weighted_low' },
        conditionRoll: { min: 0.6, max: 1.0 },
        groundDescription: 'Canned provisions are stacked in the consumables section, organized by caloric value.',
        depletion: { cooldownMinutes: { min: 180, max: 360 }, respawnChance: 0.35 },
      },
    ],
    environmentalRolls: {
      flavorLines: [
        { line: 'The shelves are silent. The ledger is open. The system is running. You can feel the precision of it as a kind of presence — someone\'s will, imposed on disorder, still holding.', chance: 0.25, time: null },
        { line: 'Okafor initiates the transfer receipt with a single precise stroke. The runner has already left by the time the pen lifts. This is how supply logistics works at speed.', chance: 0.20, time: ['day'] },
      ],
    },
    narrativeNotes: 'Logistics hub adjacent to granary. Okafor is a key NPC for the supply investigation quest. The ledger discrepancy here is a clue that can either exonerate or implicate her — designed to be ambiguous until Act II resolution.',
  },

  // ----------------------------------------------------------
  // CV-28: Signal Post
  // ----------------------------------------------------------
  {
    id: 'cv_28_signal_post',
    name: 'Covenant — Wall Signal Post',
    zone: 'covenant',
    act: 2,
    difficulty: 2,
    visited: false,
    flags: { noCombat: false, dark: false, combat_narrow_passage: true },
    description: 'A reinforced enclosure bolted to the inner face of the north wall houses the Accord\'s communications relay — the most technically sophisticated thing in Covenant, which is both an achievement and a measure of how far the world has fallen. A salvaged military radio transceiver, its casing cracked and repaired twice, shares the enclosure with a hand-built signal amplifier that the Accord\'s engineer spent three months constructing from salvaged electronics and documented best guesses. The antenna array on the wall\'s exterior — visible from outside as a cluster of aluminum rods at awkward angles — is functional despite its appearance. On a good day, with favorable atmospheric conditions, the relay can reach forty miles. The log beside the equipment is a record of transmissions sent and received, each entry timed and initialed. Most of them are routine: supply request acknowledgments, patrol coordination with outlying posts, the twice-weekly contact window with the river road junction. One entry, three weeks ago, is different. It is logged only as INCOMING / UNKNOWN SOURCE / FREQ: [REDACTED]. Below it, in a different hand: cross notified.',
    descriptionNight: 'The signal post at night has a different quality of work — atmospheric conditions are often better after dark, the operator says, something to do with the ionosphere, he\'s not sure of the mechanism but the results are consistent. He listens more at night and talks less. He has heard things at night that he has not logged.',
    shortDescription: 'The Accord\'s communications relay — forty-mile range, a log of routine transmissions, and one entry three weeks ago from an unknown source that got Cross on the radio immediately.',
    exits: {
      south: 'cv_14_wall_north',
    },
    richExits: {},
    items: [],
    enemies: [],
    npcs: [],
    hollowEncounter: {
      baseChance: 0.05,
      timeModifier: { day: 0.2, dusk: 1.2, night: 2.0, dawn: 0.6 },
      threatPool: [
        { type: 'shuffler', weight: 65, quantity: { min: 1, max: 2, distribution: 'weighted_low' } },
        { type: 'remnant', weight: 35, quantity: { min: 1, max: 1, distribution: 'single' } },
      ],
      awarenessRoll: { unaware: 0.6, awarePassive: 0.3, awareAggressive: 0.1 },
      noiseModifier: 0.5,
    },
    extras: [
      {
        keywords: ['radio', 'transceiver', 'equipment', 'salvaged', 'relay'],
        description: 'The transceiver is a military PRC unit, the model number scraped off, the frequency range modified by someone who knew what they were doing. The amplifier beside it is artisanal — hand-soldered, with component labels written in the engineer\'s handwriting where the original markings have worn off. The whole system works because someone who understood it built it and documented every modification. The documentation is in a binder attached to the enclosure wall by a steel cable. If the operator and the engineer both die, someone could read the binder and maintain the system. Probably.',
        skillCheck: { skill: 'electronics', dc: 12, successAppend: 'You recognize the amplifier design — it\'s based on a published amateur radio technique, adapted well. The modification to the frequency range is less standard. Someone has extended the receive capability into a band that isn\'t civilian broadcast. They\'re listening for something that doesn\'t broadcast on civilian bands.' },
      },
      {
        keywords: ['log', 'transmissions', 'entries', 'unknown source', 'redacted'],
        description: 'The transmission log is dense with routine entries — the Accord\'s communications are voluminous and boring, which is the hallmark of a functional logistics operation. Then: INCOMING / UNKNOWN SOURCE / FREQ: [REDACTED]. The entry below it, in Cross\'s handwriting rather than the operator\'s: notified. Two words. Whatever she did with the notification is not recorded here.',
        cycleGate: 2,
        skillCheck: { skill: 'electronics', dc: 14, successAppend: 'The redacted frequency notation is faint enough that you can make out part of it — the first three digits are 12. That\'s the upper edge of HF, close to the VHF boundary. Not a standard civilian or military channel. Something purpose-built or repurposed for a specific communication. Something that wants to reach Covenant specifically.' },
        questFlagOnSuccess: { flag: 'meridian_signal_traced', value: true },
        reputationGrant: { faction: 'accord', delta: 1 },
      },
      {
        keywords: ['antenna', 'array', 'exterior', 'aluminum', 'rods'],
        description: 'The antenna array looks like an accident — rods at different angles, different heights, one visibly bent and re-bent. It is not an accident. The operator will explain, if asked, that the angles are functional: each rod optimized for a different frequency range, the bends the result of adjustment rather than damage. The bent one points, if you follow its line of sight, toward the mountains. Toward the San Juans. Toward MERIDIAN.',
      },
      {
        keywords: ['operator', 'technician', 'radio', 'listening'],
        description: 'The operator — the only person who understands the full system well enough to run it — is a compact, quiet person who learned radio from a ham operator grandfather and has never found the skill useless. He listens more than he speaks. His logbook entry about the unknown transmission three weeks ago has been rewritten — the original entry is under the current one, faint but legible if you hold the page at an angle: the original had more detail. The current version is the sanitized version. Someone asked him to simplify it.',
        cycleGate: 2,
      },
    ],
    npcSpawns: [],
    itemSpawns: [
      {
        entityId: 'meridian_file_fragment',
        spawnChance: 0.15,
        quantity: { min: 1, max: 1, distribution: 'single' },
        conditionRoll: { min: 0.7, max: 1.0 },
        groundDescription: 'A printed signal intercept report, partially redacted, has been left clipped to the communication log.',
        depletion: { cooldownMinutes: { min: 99999, max: 99999 }, respawnChance: 0.0 },
      },
    ],
    environmentalRolls: {
      flavorLines: [
        { line: 'The equipment hum is continuous — a frequency just below conversation level that you stop noticing after two minutes and start noticing again after ten.', chance: 0.25, time: null },
        { line: 'Static. Then something that might be words, might be pattern. The operator writes nothing. Continues listening.', chance: 0.20, time: ['night'] },
      ],
    },
    narrativeNotes: 'Act II signal mystery node. Connects the MERIDIAN radio signal thread (established in earlier lore items) to Covenant\'s active intelligence capability. The operator\'s edited log entry is a significant detail for players tracking the MERIDIAN arc. Signal post connects south to cv_14_wall_north, sitting on the north wall infrastructure.',
  },
]
