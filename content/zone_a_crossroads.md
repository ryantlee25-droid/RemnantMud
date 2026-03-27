# THE REMNANT — Room File Part A: CROSSROADS (18 Rooms)

> Starting zone. Neutral trading post. No faction warfare. Where every player begins.

---

## CR-01: Highway Junction — The Approach

```json
{
  "room_id": "cr_01_approach",
  "zone": "crossroads",
  "name": "Highway Junction — The Approach",
  "act": 1,
  "cycle_gate": null,
  "descriptions": {
    "default": "Two highways meet here in a cracked X of faded asphalt, the painted lines long surrendered to sun and weeds. To the north, a cluster of buildings rises behind a wall of stacked tires and corrugated steel — that's Crossroads, the only neutral ground in the Four Corners. A hand-painted sign nailed to a leaning telephone pole reads: NO FACTION WARS INSIDE. VIOLATORS SHOT. Below it, someone has added in smaller letters: not kidding.",
    "night": "The junction is a pool of darkness where two dead highways cross. Firelight flickers behind the tire wall to the north — Crossroads, still open, still lit. The sign on the telephone pole is unreadable in the dark, but you've heard what it says. Everyone has.",
    "dawn": "Mist sits low on the asphalt, turning the junction into a gray lake. The Crossroads wall is a dark shape to the north, its gate lanterns burning amber through the fog. A figure moves on the wall — a sentry, or a shadow.",
    "dusk": "The sun drops behind the western mesas and the junction turns copper and long shadow. The Crossroads wall catches the last light. The sign on the pole is backlit, the words burning black against orange sky."
  },
  "extras": [
    {
      "keywords": ["sign", "pole", "telephone pole"],
      "description": "The sign is a slab of plywood with house paint lettering. NO FACTION WARS INSIDE. VIOLATORS SHOT. The smaller text underneath reads: seriously, we will shoot you. ask the last guy. oh wait, you can't. The paint is weathered but the message is maintained — someone re-paints it regularly."
    },
    {
      "keywords": ["wall", "tires", "steel", "barricade"],
      "description": "The wall is improvised but effective — tires filled with packed earth, topped with corrugated roofing steel bent into crude merlons. It wouldn't stop a vehicle but it channels foot traffic to the gate. You can see razor wire glinting along the top in places."
    },
    {
      "keywords": ["highway", "road", "asphalt", "junction"],
      "description": "US-160 runs east-west. US-550 runs north-south. Before the Collapse, this intersection saw maybe a hundred cars a day. Now it sees people on foot, the occasional horse, and once in a while, a vehicle that someone has kept running through sheer stubbornness and scavenged parts."
    },
    {
      "keywords": ["weeds", "cracks", "ground"],
      "description": "Seven years of neglect and the earth is taking back the asphalt one crack at a time. Dandelions, thistles, and a tough grass you can't name have colonized every seam. A single sunflower has grown through a pothole and stands three feet tall, absurdly cheerful among the ruin."
    }
  ],
  "npc_spawns": [
    {
      "npc_id": "crossroads_gate_guard",
      "spawn_chance": 0.90,
      "spawn_type": "anchored",
      "quantity": { "min": 1, "max": 2, "distribution": "weighted_low" },
      "activity_pool": [
        { "desc": "A Drifter arbiter leans against the gate post, shotgun across her chest, watching you approach with professional disinterest.", "weight": 4 },
        { "desc": "A broad-shouldered arbiter stands at the gate, arms crossed, sizing you up as you approach.", "weight": 3 },
        { "desc": "Two arbiters are sharing a canteen by the gate. One nods at you. The other doesn't.", "weight": 2 }
      ],
      "disposition_roll": { "neutral": 0.8, "wary": 0.2 }
    }
  ],
  "item_spawns": [
    {
      "entity_id": "discarded_flyer",
      "spawn_chance": 0.40,
      "quantity": { "min": 1, "max": 1, "distribution": "single" },
      "condition_roll": { "min": 0.3, "max": 0.8 },
      "ground_description": "A crumpled flyer is caught against the base of the telephone pole.",
      "depletion": { "cooldown_minutes": { "min": 60, "max": 180 }, "respawn_chance": 0.40 }
    },
    {
      "entity_id": "empty_water_bottle",
      "spawn_chance": 0.30,
      "quantity": { "min": 1, "max": 2, "distribution": "weighted_low" },
      "condition_roll": { "min": 0.1, "max": 0.5 },
      "ground_description": "An empty plastic bottle lies in the weeds beside the road.",
      "depletion": { "cooldown_minutes": { "min": 30, "max": 90 }, "respawn_chance": 0.30 }
    }
  ],
  "exits": {
    "north": { "destination": "cr_02_gate", "description_verbose": "the Crossroads gate" },
    "east": { "destination": "rr_01_west_approach", "description_verbose": "Highway 160, east toward the River Road" },
    "south": { "destination": "br_01_canyon_mouth", "description_verbose": "Highway 550, south toward The Breaks", "skill_gate": { "skill": "survival", "dc": 5, "fail_message": "The road south looks rough. You're not sure you're ready for open wilderness." } },
    "west": { "destination": "du_01_dust_edge", "description_verbose": "Highway 160, west into The Dust", "skill_gate": { "skill": "survival", "dc": 8, "fail_message": "The heat shimmer to the west is brutal. You'd need more experience to survive out there." } }
  },
  "hollow_encounter": {
    "base_chance": 0.05,
    "time_modifier": { "day": 0.3, "night": 2.5, "dawn": 0.5, "dusk": 1.5 },
    "threat_pool": [
      { "type": "shuffler", "weight": 95, "quantity": { "min": 1, "max": 1, "distribution": "single" } },
      { "type": "remnant", "weight": 5, "quantity": { "min": 1, "max": 1, "distribution": "single" } }
    ],
    "awareness_roll": { "unaware": 0.7, "aware_passive": 0.2, "aware_aggressive": 0.1 },
    "activity_pool": {
      "shuffler": [
        { "desc": "shambles along the highway shoulder, feet dragging, head down, moving with the mechanical persistence of something that has forgotten how to stop", "weight": 3 },
        { "desc": "stands motionless in the center of the junction, face turned skyward, mouth open, as if waiting for rain that isn't coming", "weight": 2 }
      ]
    }
  },
  "environmental_rolls": {
    "ambient_sound_pool": {
      "day": [
        { "sound": "The wind carries dust and the faint smell of cooking from inside Crossroads.", "weight": 3 },
        { "sound": "A hawk circles high above the junction, riding a thermal.", "weight": 2 },
        { "sound": null, "weight": 3 }
      ],
      "night": [
        { "sound": "Coyotes yip somewhere to the west. Normal coyotes, probably.", "weight": 3 },
        { "sound": "The wind has died. The silence is heavy.", "weight": 2 },
        { "sound": null, "weight": 2 }
      ]
    },
    "ambient_count": { "min": 0, "max": 1 },
    "flavor_lines": [
      { "line": "A dust devil spirals across the intersection and dissipates.", "chance": 0.15, "time": ["day"] },
      { "line": "Your shadow stretches long across the cracked asphalt.", "chance": 0.20, "time": ["dawn", "dusk"] },
      { "line": "Boot prints in the dust. Dozens of them. All heading north toward the gate.", "chance": 0.25, "time": null }
    ]
  },
  "flags": { "safe_rest": false, "tutorial_zone": true, "fast_travel_waypoint": true },
  "narrative_notes": "This is the first room every player sees. It needs to orient them geographically (four exits to four zones), establish tone (the sign), and create forward momentum (the wall, the smoke, the voices). The low Hollow encounter chance ensures new players aren't killed immediately but still feel the threat."
}
```

---

## CR-02: Crossroads Gate

```json
{
  "room_id": "cr_02_gate",
  "zone": "crossroads",
  "name": "Crossroads — The Gate",
  "act": 1,
  "cycle_gate": null,
  "descriptions": {
    "default": "The gate is a repurposed livestock chute — steel rails bent into an S-curve that forces everyone to pass single file past an arbiter checkpoint. The arbiters wear no faction colors, just gray armbands and the calm expression of people who have ended arguments permanently. Beyond the chute, you can see market stalls, cook smoke, and movement. The sound of voices — actual human conversation, not whispers or warnings — drifts through.",
    "night": "Lanterns hang from hooks along the chute, throwing orange light across the steel rails. The checkpoint arbiter has her shotgun in her hands now, not slung. Night changes the rules. You can still enter, but she watches harder.",
    "dawn": "The gate is quiet at dawn. One arbiter, half-asleep, straightens when you approach. The market beyond is just waking — the first cook fires sending thin columns of smoke into the gray air.",
    "dusk": "A line has formed at the gate — travelers pushing to get inside before full dark. The arbiter works them through with practiced speed. 'Weapons holstered. Blades sheathed. Move.'"
  },
  "extras": [
    {
      "keywords": ["arbiter", "arbiters", "guard", "checkpoint"],
      "description": "The Drifter arbiters are the closest thing Crossroads has to law enforcement. They don't arrest you. They don't fine you. They shoot you, or they don't. The simplicity is the point. Everyone understands the terms."
    },
    {
      "keywords": ["chute", "rails", "gate", "s-curve"],
      "description": "The S-curve forces you to slow down, turn twice, and present yourself to the checkpoint. You can't rush through. You can't hide what you're carrying. It's a simple piece of tactical architecture that works exactly as well as it needs to."
    },
    {
      "keywords": ["armbands", "gray", "colors"],
      "description": "Gray for neutral. No faction. The arbiters are Drifters by affiliation but independent by practice. Their loyalty is to the market, not to any banner. Crossroads makes money for everyone. That's why everyone lets it exist."
    },
    {
      "keywords": ["voices", "sound", "conversation"],
      "description": "You can hear haggling, laughter, the clatter of a dropped pan, someone calling a name. Ordinary sounds. The sounds of people living in proximity without trying to kill each other. It's remarkable how remarkable that's become."
    }
  ],
  "npc_spawns": [
    {
      "npc_id": "checkpoint_arbiter",
      "spawn_chance": 0.95,
      "spawn_type": "anchored",
      "quantity": { "min": 1, "max": 1, "distribution": "single" },
      "activity_pool": [
        { "desc": "The checkpoint arbiter glances at you, notes your gear, and waves you through with a calloused hand.", "weight": 5 },
        { "desc": "The arbiter holds up a hand. 'Weapons stay holstered inside. Blades stay sheathed. We clear?' She doesn't wait for an answer.", "weight": 3 },
        { "desc": "The arbiter is writing something in a battered ledger. She looks up, looks you over, makes a mark, and nods you through.", "weight": 2 }
      ],
      "dialogue_tree": "cr_arbiter_intro",
      "disposition_roll": { "neutral": 0.9, "wary": 0.1 }
    }
  ],
  "item_spawns": [],
  "exits": {
    "south": { "destination": "cr_01_approach", "description_verbose": "back to the highway junction" },
    "north": { "destination": "cr_03_market_south", "description_verbose": "into the market" }
  },
  "flags": { "safe_rest": false, "no_combat": true },
  "narrative_notes": "The no-combat flag is enforced by the arbiters. If the player attacks here, arbiters respond with lethal force. This teaches the player that safe zones exist and are maintained by threat, not magic."
}
```

---

## CR-03: Market — South End

```json
{
  "room_id": "cr_03_market_south",
  "zone": "crossroads",
  "name": "Crossroads Market — South End",
  "act": 1,
  "cycle_gate": null,
  "descriptions": {
    "default": "The market is a sprawl of tarps, salvaged tent poles, and repurposed vehicle hoods serving as countertops. The south end is where the food vendors cluster — cook smoke from three different fires mingles overhead, carrying the smell of roasted meat, boiled grain, and something spiced that makes your stomach twist with want. People move between the stalls with the focused efficiency of survivors who know exactly what they need and how many rounds it costs.",
    "night": "The market thins at night but doesn't close. The food stalls have banked their fires to embers, but a few vendors remain — the ones who deal in things people need after dark. Medicine. Ammunition. Information. The lantern light makes everything look warmer than it is."
  },
  "extras": [
    {
      "keywords": ["stalls", "vendors", "market", "tarps"],
      "description": "Each stall is a small kingdom. The vendors know their inventory to the last bullet, the last pill, the last clean bandage. Prices aren't posted — they're negotiated, and they change based on who you are and who's watching."
    },
    {
      "keywords": ["food", "meat", "smoke", "fire", "cooking"],
      "description": "Elk jerky. Boiled amaranth porridge. Roasted squash with salt. A suspicious stew that the vendor swears is rabbit. Everything costs more than you'd like and less than you'd pay if you were starving. Which, to be fair, you might be."
    },
    {
      "keywords": ["people", "crowd", "survivors"],
      "description": "Drifters, mostly. A few Accord citizens with their clean armbands. A Salter or two, conspicuously armed, conspicuously watchful. A couple of people in nondescript clothing who could be anyone, which probably means they're someone specific."
    }
  ],
  "npc_spawns": [
    {
      "npc_id": "food_vendor_marta",
      "spawn_chance": 0.85,
      "spawn_type": "anchored",
      "quantity": { "min": 1, "max": 1, "distribution": "single" },
      "activity_pool": [
        { "desc": "Marta tends her cook fire, stirring a blackened pot without looking up. A hand-lettered sign reads: ELK JERKY — 3 PENNIES. STEW — 2 PENNIES. NO CREDIT.", "weight": 4 },
        { "desc": "Marta is haggling with a Drifter over a strip of jerky. Her voice is patient. Her knife hand is not.", "weight": 2 },
        { "desc": "Marta is feeding a scrap of meat to a scrawny cat that lives under her stall. She sees you watching and shrugs. 'Earns its keep. Mice.'", "weight": 1 }
      ],
      "trade_inventory": ["boiled_rations", "elk_jerky", "purification_tabs", "salt_1kg"],
      "dialogue_tree": "cr_marta_intro",
      "disposition_roll": { "friendly": 0.5, "neutral": 0.4, "wary": 0.1 }
    },
    {
      "npc_id": "drifter_newcomer",
      "spawn_chance": 0.35,
      "spawn_type": "wanderer",
      "quantity": { "min": 1, "max": 1, "distribution": "single" },
      "activity_pool": [
        { "desc": "A young man sits against a tent pole, pack between his knees, looking at the market with the wide eyes of someone who hasn't seen this many people in a long time.", "weight": 3 },
        { "desc": "A woman with a fresh scar across her temple eats stew with one hand and keeps the other on the knife at her belt.", "weight": 2 },
        { "desc": "A child — maybe ten, maybe younger, it's hard to tell when kids grow up hungry — darts between the stalls, quick and watchful as a sparrow.", "weight": 1 }
      ]
    }
  ],
  "item_spawns": [
    {
      "entity_id": "dropped_penny_22lr",
      "spawn_chance": 0.15,
      "quantity": { "min": 1, "max": 2, "distribution": "weighted_low" },
      "condition_roll": { "min": 0.8, "max": 1.0 },
      "ground_description": "A .22 round has rolled under the edge of a tarp. Easy to miss.",
      "depletion": { "cooldown_minutes": { "min": 60, "max": 240 }, "respawn_chance": 0.15 }
    }
  ],
  "exits": {
    "south": { "destination": "cr_02_gate", "description_verbose": "the gate" },
    "north": { "destination": "cr_04_market_center", "description_verbose": "deeper into the market" },
    "east": { "destination": "cr_06_info_broker", "description_verbose": "a quieter stall with a curtain" },
    "west": { "destination": "cr_13_water_station", "description_verbose": "a hand-pump water station" }
  },
  "flags": { "safe_rest": false, "no_combat": true },
  "narrative_notes": "Marta is the first friendly NPC most players meet. Her dialogue tree should explain barter basics, mention the factions casually, and hint that Patch (east) is the person to see if you want real information. The child NPC is a worldbuilding touch — children exist in this world. People are building futures."
}
```

---

## CR-04 through CR-18: Remaining Crossroads Rooms

```json
[
  {
    "room_id": "cr_04_market_center",
    "zone": "crossroads",
    "name": "Crossroads Market — Center",
    "act": 1,
    "descriptions": {
      "default": "The heart of the market. A massive tarp stretched between four telephone poles creates a canopy over the main trading floor. This is where the real commerce happens — weapons, armor, tools, components. The vendors here are professionals, not cooks. Their counters are reinforced. Their wares are displayed with precision. A Drifter arbiter stands on an overturned crate in the center, high enough to see everything, hand resting on the butt of a holstered revolver.",
      "night": "The center market is quieter but not empty. The weapons vendors have locked their serious inventory behind steel shutters, but the component traders are still open. Scrap metal, textiles, electronics — the building blocks. The arbiter on the crate has been replaced by one with a rifle."
    },
    "extras": [
      { "keywords": ["weapons", "arms", "guns", "blades"], "description": "Melee weapons are displayed openly — machetes, hatchets, reinforced bats, a few combat knives of varying quality. Firearms are behind the counter. You point, the vendor retrieves. Ammunition is sold separately, always. Nobody gives you a loaded weapon across a counter." },
      { "keywords": ["arbiter", "guard", "crate", "revolver"], "description": "The center arbiter is the market's keystone. From that crate, she can see every transaction, every argument, every hand moving toward a weapon. She hasn't had to draw in weeks. The last person who started trouble in here is buried outside the south wall." },
      { "keywords": ["canopy", "tarp", "poles"], "description": "The canopy was a parachute in a previous life — military surplus, olive drab, faded to the color of dried sage. It filters the sunlight into something almost pleasant. When it rains, the canopy sags in the middle and someone has to poke it with a pole to dump the water." }
    ],
    "npc_spawns": [
      {
        "npc_id": "weapons_vendor_cole",
        "spawn_chance": 0.90,
        "activity_pool": [
          { "desc": "Marcus Cole stands behind his counter, a slab of reinforced plywood on sawhorses, arranging blades by size with the care of a jeweler.", "weight": 3 },
          { "desc": "Cole is field-stripping a pistol, his hands moving with the unconscious speed of deep practice. He glances up. 'Buying or browsing?'", "weight": 3 },
          { "desc": "Cole is arguing with a Salter about the price of 9mm. The Salter wants bulk pricing. Cole doesn't do bulk pricing. The conversation has the energy of two people who've had it before.", "weight": 1 }
        ],
        "trade_inventory": ["pipe_wrench", "hatchet", "combat_knife", "machete", "22_rifle", "9mm_pistol", "ammo_22lr", "ammo_9mm", "ammo_shotgun"],
        "dialogue_tree": "cr_cole_intro"
      },
      {
        "npc_id": "components_vendor",
        "spawn_chance": 0.80,
        "activity_pool": [
          { "desc": "A thin woman with wire-rim glasses sorts through bins of salvaged electronics, occasionally holding a component up to the light and squinting.", "weight": 3 },
          { "desc": "The components vendor is weighing scrap metal on a hand-balanced scale, lips moving as she counts.", "weight": 2 }
        ],
        "trade_inventory": ["scrap_metal", "textiles", "electronics_salvage", "chemicals_basic", "rare_parts_random"]
      }
    ],
    "item_spawns": [],
    "exits": {
      "south": { "destination": "cr_03_market_south", "description_verbose": "the food stalls" },
      "north": { "destination": "cr_05_market_north", "description_verbose": "the north end of the market" },
      "east": { "destination": "cr_07_patch_clinic", "description_verbose": "a building with a red cross painted on the door" },
      "west": { "destination": "cr_08_job_board", "description_verbose": "a wall covered in pinned notes" }
    },
    "flags": { "safe_rest": false, "no_combat": true }
  },
  {
    "room_id": "cr_05_market_north",
    "zone": "crossroads",
    "name": "Crossroads Market — North End",
    "act": 1,
    "descriptions": {
      "default": "The north end of the market is where things get quieter and more interesting. The bulk trading gives way to specialty vendors — a leatherworker, a woman who repairs radios, a man who claims to sell maps of safe routes through The Breaks. A bulletin board leans against the back wall, thick with pinned notes, wanted posters, and hand-drawn advertisements. Beyond the last stall, a trail leads north into the hills.",
      "night": "Most of the specialty vendors have closed up. The radio repair woman is still here, bent over a gutted shortwave set by lantern light, soldering iron in hand. The trail north is a suggestion of pale dirt against the scrub."
    },
    "extras": [
      {
        "keywords": ["bulletin", "board", "notes", "posters"],
        "description_pool": [
          { "desc": "The board is chaos. LOOKING FOR: brother, last seen Farmington, answers to David. WANTED: anyone with medical training, Covenant will pay double rations. FOR TRADE: solar panel, cracked but functional, seeking antibiotics. WARNING: Hollow herd spotted moving east along 160, avoid after dark.", "weight": 3 },
          { "desc": "A new note is pinned over older ones: HAS ANYONE ELSE HEARD THE RADIO SIGNAL? I'm not crazy. Shortwave, repeating loop, something about the Scar. Find me at the north stalls. — E. Someone has written below it: you're crazy. And below that: heard it too.", "weight": 2 },
          { "desc": "REVENANTS — if you've died and come back, the Reclaimers want to talk to you. Discreet. No experiments. Just questions. Ask for Lev at The Stacks.", "weight": 1, "cycle_gate": 2 }
        ]
      },
      { "keywords": ["radio", "woman", "shortwave", "sparks"], "description": "Her name, according to the hand-lettered sign, is Sparks. The workbench is a graveyard of gutted electronics — radios, walkie-talkies, a car stereo, something that might have been a laptop. She works with the intensity of someone who believes she's doing important work." },
      { "keywords": ["maps", "map", "man", "routes"], "description": "The map seller is either a genius or a con artist. His 'maps' are hand-drawn on whatever flat surface was available — notebook paper, cardboard, the back of a fast food tray. He swears they're accurate." }
    ],
    "npc_spawns": [
      {
        "npc_id": "sparks_radio_repair",
        "spawn_chance": 0.75,
        "activity_pool": [
          { "desc": "Sparks is hunched over a shortwave radio, muttering frequencies to herself like a prayer.", "weight": 3 },
          { "desc": "Sparks has a radio playing — static mostly, but every few seconds, a fragment of voice cuts through. She's writing down every word.", "weight": 2, "quest_trigger": "radio_signal_intro" }
        ],
        "dialogue_tree": "cr_sparks_intro",
        "quest_giver": ["quest_radio_signal_fragment_1"]
      },
      {
        "npc_id": "map_seller_reno",
        "spawn_chance": 0.55,
        "activity_pool": [
          { "desc": "A sunburned man in a wide hat is sketching something on cardboard with a stubby pencil, occasionally looking north and squinting as if measuring distance by eye.", "weight": 3 }
        ],
        "trade_inventory": ["map_breaks_basic", "map_river_road", "map_dust_partial"]
      }
    ],
    "item_spawns": [
      { "entity_id": "torn_note_fragment", "spawn_chance": 0.25, "quantity": { "min": 1, "max": 1, "distribution": "single" }, "condition_roll": { "min": 0.5, "max": 0.9 }, "ground_description": "A torn scrap of paper lies on the ground near the bulletin board, blown loose by the wind." }
    ],
    "exits": {
      "south": { "destination": "cr_04_market_center", "description_verbose": "the center market" },
      "north": { "destination": "rr_07_north_fork", "description_verbose": "the trail toward Covenant and the mountains" },
      "west": { "destination": "cr_09_campground", "description_verbose": "an open area with fire rings" },
      "east": { "destination": "cr_14_leather_shop", "description_verbose": "the leatherworker's stall" }
    },
    "flags": { "safe_rest": false, "no_combat": true }
  },
  {
    "room_id": "cr_06_info_broker",
    "zone": "crossroads",
    "name": "The Curtain",
    "act": 1,
    "descriptions": {
      "default": "Behind a heavy canvas curtain, a quieter kind of commerce happens. The space is small — a salvaged desk, two chairs, a lantern, and the overwhelming smell of antiseptic and tobacco. This is where Patch holds court. Information broker, medic, and the most connected person in the Four Corners who claims to owe nobody anything. The curtain muffles the market noise into a distant hum.",
      "night": "The curtain is drawn tight. A thin line of lantern light leaks from underneath. Patch keeps late hours. The question is whether you want to know what that costs."
    },
    "extras": [
      { "keywords": ["desk", "papers", "notes"], "description": "The desk is covered in papers — hand-drawn maps, lists of names, supply inventories, and notes in a shorthand you can't read. Patch notices you looking and shifts a ledger to cover the most interesting page. Not aggressively. Just automatically." },
      { "keywords": ["curtain", "canvas"], "description": "Heavy, waxed canvas. Possibly a military tent section. It blocks sound well enough that conversations inside don't carry to the market." },
      { "keywords": ["antiseptic", "medical", "supplies"], "description": "A locked metal box sits behind the desk — a military field surgery kit, from the look of it. Patch's medical supplies are not for general sale." }
    ],
    "npc_spawns": [
      {
        "npc_id": "patch",
        "spawn_chance": 0.80,
        "activity_pool": [
          { "desc": "Patch sits behind the desk, rolling a cigarette with practiced fingers, watching you with eyes that are cataloging everything about you — gear, posture, how long it's been since you ate.", "weight": 4 },
          { "desc": "Patch is stitching a wound on a Drifter's forearm. Without looking up: 'Sit down. I'll be a minute.'", "weight": 2 },
          { "desc": "Patch is alone, reading a water-stained paperback with their feet on the desk. They dog-ear the page when you enter. 'What do you need?'", "weight": 3 }
        ],
        "dialogue_tree": "cr_patch_main",
        "quest_giver": ["quest_radio_signal", "quest_faction_intro_accord", "quest_faction_intro_salters", "quest_faction_intro_kindling", "quest_faction_intro_reclaimers"],
        "trade_inventory": ["antibiotics_01", "bandages", "quiet_drops", "stim_shot"]
      }
    ],
    "exits": { "west": { "destination": "cr_03_market_south", "description_verbose": "back to the market" } },
    "flags": { "safe_rest": false, "no_combat": true },
    "narrative_notes": "CRITICAL QUEST HUB. Patch is the tutorial NPC who explains factions, offers the radio signal quest, and gives the player their first real choice. Patch's dialogue changes significantly in Cycle 2+ — they recognize Revenants and have specific lines. In Cycle 3+, Patch reveals they know about MERIDIAN."
  },
  {
    "room_id": "cr_07_patch_clinic",
    "zone": "crossroads",
    "name": "The Red Door Clinic",
    "act": 1,
    "descriptions": {
      "default": "A converted storage container with a red cross painted on the door — sloppy, but visible from anywhere in the market. Inside, it's clean. Aggressively clean. Two cots with actual sheets. Medical instruments line a shelf in order of size. This is where Crossroads sends its wounded, and the reason Patch is the most protected person in the Four Corners.",
      "night": "The clinic's lantern burns all night. Someone is always hurt. Someone is always sick."
    },
    "extras": [
      { "keywords": ["cots", "beds", "sheets"], "description": "Two cots, both empty at the moment. The sheets are threadbare but clean — boiled, probably. A luxury most people haven't experienced since the Collapse. The pillow on the left cot has a bloodstain that didn't fully wash out." },
      { "keywords": ["instruments", "tools", "medical", "shelf"], "description": "Scalpels, forceps, suture needles, a hand-cranked aspirator, clamps. Pre-Collapse surgical quality. Patch didn't find these at a pharmacy — this is military field surgery equipment." }
    ],
    "npc_spawns": [
      { "npc_id": "wounded_drifter", "spawn_chance": 0.40, "activity_pool": [
        { "desc": "A Drifter lies on the far cot, bandaged arm across their chest, staring at the ceiling with vacant patience.", "weight": 3 },
        { "desc": "A young woman sits on the edge of the cot, unwrapping a dirty bandage from her ankle while muttering at the wound underneath.", "weight": 2 }
      ] }
    ],
    "item_spawns": [
      { "entity_id": "bandages_clean", "spawn_chance": 0.20, "quantity": { "min": 1, "max": 2, "distribution": "weighted_low" }, "condition_roll": { "min": 0.8, "max": 1.0 }, "ground_description": "A roll of clean bandage material sits on the shelf edge, partially unrolled." }
    ],
    "exits": { "west": { "destination": "cr_04_market_center", "description_verbose": "the market center" } },
    "flags": { "safe_rest": true, "healing_bonus": 1.5, "no_combat": true }
  },
  {
    "room_id": "cr_08_job_board",
    "zone": "crossroads",
    "name": "The Job Board",
    "act": 1,
    "descriptions": {
      "default": "A section of chain-link fence has been repurposed as the market's job board — a ten-foot wall of pinned notes, offers, requests, and warnings. This is how work gets done in the Four Corners. Need a caravan guard? Post it. Need a building cleared of Hollow? Post it. A wooden bench sits in front of it, worn smooth by the backsides of people reading slowly.",
      "night": "The job board is unreadable in the dark. But the bench is occupied. Two figures sit at opposite ends, not speaking, just waiting for morning."
    },
    "extras": [
      {
        "keywords": ["board", "notes", "jobs", "postings"],
        "description_pool": [
          { "desc": "CARAVAN GUARD NEEDED: Crossroads to Salt Creek, 3-day round trip. Pay: 50 Pennies + meals. CLEARING JOB: Hollow nest in gas station off 160 east. Bounty: 30 Pennies per confirmed kill.", "weight": 3 },
          { "desc": "URGENT: Medical supplies needed at The Ember. Will pay triple rate. TRACKER NEEDED: Missing person, last seen heading into The Breaks. WARNING: Do NOT take the 'easy route' through Bone Hollow.", "weight": 2 },
          { "desc": "WORK FOR REVENANTS: The Stacks offers premium rates for non-invasive study. Ask for Lev. Also: If you've heard the radio signal, meet at the north campfire at dusk. Come alone. — unsigned", "weight": 1, "cycle_gate": 2 }
        ]
      },
      { "keywords": ["bench", "wooden", "pew"], "description": "The bench is a church pew. Someone carried it from a chapel and didn't sand off the hymnal rack. People sit and read the board and rest their hands where prayer books used to go." }
    ],
    "npc_spawns": [
      { "npc_id": "board_manager", "spawn_chance": 0.65, "activity_pool": [
        { "desc": "An older man with a clipboard manages the board, pulling down expired postings and pinning new ones with bureaucratic precision.", "weight": 3 },
        { "desc": "The board manager is arguing with someone about posting placement. 'Urgent goes center. Non-urgent on the sides. I've explained this.'", "weight": 2 }
      ], "quest_giver": ["quest_caravan_guard", "quest_clearing_job", "quest_missing_person"] }
    ],
    "exits": { "east": { "destination": "cr_04_market_center", "description_verbose": "the market center" } },
    "flags": { "safe_rest": false, "no_combat": true, "quest_hub": true }
  },
  {
    "room_id": "cr_09_campground",
    "zone": "crossroads",
    "name": "Crossroads — The Campground",
    "act": 1,
    "descriptions": {
      "default": "West of the market, a flat clearing serves as camp for travelers who can't afford indoor stays. Fire rings made from stacked stones dot the ground, most cold, a few smoldering. Bedrolls and lean-tos scatter without pattern. The view west is open desert and sky — a reminder of how big the empty world is.",
      "night": "Three fires burn in the campground. Around the largest, a group shares a bottle and stories in low voices. Around the second, a solitary figure sharpens a blade. The third fire is untended but recent — whoever lit it is nearby, in the dark, watching."
    },
    "extras": [
      { "keywords": ["fire", "fires", "campfire", "stones"], "description": "The fire rings are communal. First come, first served. Fuel is juniper wood, two Pennies an armload from a kid who gathers it." },
      { "keywords": ["desert", "west", "sky", "view"], "description": "The sky to the west is enormous — mountain silhouettes against sunset, or star-field against black. The Milky Way is so vivid it looks painted. Beautiful. Also a reminder that there's nothing between here and the horizon but dust and things that want to eat you." }
    ],
    "npc_spawns": [
      { "npc_id": "campfire_storyteller", "spawn_chance": 0.45, "activity_pool": [
        { "desc": "An older Drifter with a voice like gravel is telling a story about a Hollow herd he outran last winter. His audience is rapt.", "weight": 3 },
        { "desc": "A woman with Salter tattoos sits by the fire alone, drinking from a flask. She doesn't look like she wants company.", "weight": 2 }
      ], "dialogue_tree": "cr_campfire_lore" },
      { "npc_id": "mysterious_stranger_sanguine", "spawn_chance": 0.10, "activity_pool": [
        { "desc": "A figure in a hooded coat sits outside the firelight, face in shadow. They haven't moved in the time you've been watching. But they are awake.", "weight": 1 }
      ], "dialogue_tree": "cr_stranger_sanguine_hint", "narrative_notes": "First optional Sanguine encounter. Lucid Sanguine passing through. Doesn't reveal nature unless Perception 14+ or direct question." }
    ],
    "item_spawns": [
      { "entity_id": "juniper_firewood", "spawn_chance": 0.50, "quantity": { "min": 1, "max": 3, "distribution": "weighted_low" }, "condition_roll": { "min": 0.5, "max": 1.0 }, "ground_description": "A few sticks of juniper firewood are stacked near an unoccupied fire ring." }
    ],
    "exits": {
      "east": { "destination": "cr_05_market_north", "description_verbose": "the north market" },
      "north": { "destination": "cr_10_overlook", "description_verbose": "a rocky rise" },
      "west": { "destination": "cr_11_old_gas_station", "description_verbose": "the ruins of a gas station" },
      "south": { "destination": "cr_15_south_camp", "description_verbose": "the quieter south end of camp" }
    },
    "flags": { "safe_rest": true, "campfire_allowed": true }
  },
  {
    "room_id": "cr_10_overlook",
    "zone": "crossroads",
    "name": "The Overlook",
    "act": 1,
    "descriptions": {
      "default": "A rocky rise twenty feet above the campground, flat on top, with a view that justifies the climb. From here you can see the full layout of Crossroads — the tire wall, the market canopy, the campfire dots — and beyond it, the skeleton of the old world stretching in every direction. To the north, the blue-gray wall of the San Juan Mountains where Covenant and harder places wait. The wind is stronger up here. It smells like sage and distance.",
      "night": "The overlook at night is a planetarium. The Milky Way arcs overhead in cold light. Below, the campfires are orange dots. In the distance, a faint glow on the northern horizon — Covenant, probably. And further, darker, the mountains. Somewhere up there is the Scar."
    },
    "extras": [
      { "keywords": ["mountains", "san juan", "north"], "description": "The San Juan range rises like a wall of teeth. Snow on the peaks year-round. Covenant sits in the foothills. The Scar is higher, deeper, further. People point and say 'up there' and what they mean is: where the answers are, and also the things that will kill you." },
      { "keywords": ["crossroads", "below", "layout"], "description": "From up here, Crossroads looks fragile. A few tarps, a tire wall, a handful of fires. This is what passes for civilization now." },
      { "keywords": ["scar", "glow", "light"], "description": "You can't see the Scar from here. But sometimes, on clear nights, people swear they see a faint light on the mountains that isn't a star and isn't a fire.", "skill_check": { "skill": "perception", "dc": 14, "success_append": "There. For just a second, on the dark slope of the highest visible peak — a light. Steady, not flickering. Not a fire. Something powered. Then gone." } }
    ],
    "item_spawns": [
      { "entity_id": "old_binoculars", "spawn_chance": 0.05, "quantity": { "min": 1, "max": 1, "distribution": "single" }, "condition_roll": { "min": 0.3, "max": 0.7 }, "ground_description": "A pair of binoculars with a cracked left lens sits on the rock." }
    ],
    "exits": { "south": { "destination": "cr_09_campground", "description_verbose": "back down to the campground" } },
    "flags": { "safe_rest": true, "campfire_allowed": true }
  },
  {
    "room_id": "cr_11_old_gas_station",
    "zone": "crossroads",
    "name": "Ruins — Old Gas Station",
    "act": 1,
    "descriptions": {
      "default": "The gas station is a husk. Roof half-collapsed, pumps rusted to abstract sculpture, the convenience store windows shattered and dark. Weeds have colonized the concrete pad. A faded sign that once advertised unleaded at $4.89 a gallon now advertises nothing to no one. But the building isn't empty — things keep turning up in the rubble. The old world hid things in layers.",
      "night": "The gas station is a dark shape against the stars. The collapsed roof creates shadows that move wrong. The concrete pad is pale enough to see by moonlight. The building interior is not."
    },
    "extras": [
      { "keywords": ["pumps", "gas", "fuel"], "description": "The pumps are empty and have been since week two. Someone tried to siphon the underground tanks years ago and found them dry. The pump handles are still attached. Occasionally a traveler grips one and squeezes, out of habit or hope." },
      { "keywords": ["sign", "price"], "description": "$4.89. People complained about that. They wrote angry letters about gas prices. The absurdity of it hits you suddenly, from a direction you weren't expecting." },
      { "keywords": ["floor", "tiles", "hatch"], "description": "The tiles near the back wall are loose. Beneath them, a plywood panel. Beneath that — darkness and the smell of stale air.", "skill_check": { "skill": "scavenging", "dc": 10, "success_append": "You pry the panel aside. Below is a concrete utility space, maybe six feet deep. A metal shelving unit is bolted to the wall. You can see shapes on the shelves — cans, maybe." } }
    ],
    "npc_spawns": [
      { "npc_id": "scavenger_rival", "spawn_chance": 0.25, "activity_pool": [
        { "desc": "Another scavenger is here, prying at the shelving with a crowbar. They freeze when they see you.", "weight": 3 },
        { "desc": "A teenager in oversized clothes is stuffing something into a pack near the back wall. They see you and bolt.", "weight": 2 }
      ], "disposition_roll": { "neutral": 0.4, "wary": 0.4, "hostile": 0.2 } }
    ],
    "item_spawns": [
      { "entity_id": "canned_food_random", "spawn_chance": 0.30, "quantity": { "min": 1, "max": 2, "distribution": "weighted_low" }, "condition_roll": { "min": 0.5, "max": 0.9 }, "ground_description": "A dented can with no label sits behind a fallen shelf bracket." },
      { "entity_id": "rebar_club", "spawn_chance": 0.20, "quantity": { "min": 1, "max": 1, "distribution": "single" }, "condition_roll": { "min": 0.4, "max": 0.8 }, "ground_description": "A length of rebar, one end wrapped in duct tape for a grip, leans against the counter." },
      { "entity_id": "lighter_disposable", "spawn_chance": 0.35, "quantity": { "min": 1, "max": 1, "distribution": "single" }, "condition_roll": { "min": 0.2, "max": 0.9 }, "ground_description": "A disposable lighter is wedged in a crack between the counter and the wall." }
    ],
    "exits": {
      "east": { "destination": "cr_09_campground", "description_verbose": "back to the campground" },
      "down": { "destination": "cr_12_gas_station_basement", "description_verbose": "the crawlspace beneath the floor", "hidden": true, "discover_skill": "scavenging", "discover_dc": 10, "discover_message": "You find a way down beneath the floor tiles." }
    },
    "hollow_encounter": {
      "base_chance": 0.15,
      "time_modifier": { "day": 0.5, "night": 2.0, "dawn": 0.8, "dusk": 1.3 },
      "threat_pool": [
        { "type": "shuffler", "weight": 80, "quantity": { "min": 1, "max": 2, "distribution": "weighted_low" } },
        { "type": "remnant", "weight": 20, "quantity": { "min": 1, "max": 1, "distribution": "single" } }
      ]
    },
    "flags": { "safe_rest": false, "scavenging_zone": true }
  },
  {
    "room_id": "cr_12_gas_station_basement",
    "zone": "crossroads",
    "name": "Beneath the Gas Station",
    "act": 1,
    "descriptions": {
      "default": "A concrete box six feet deep, eight feet square. The air is stale and cool. A metal shelf is bolted to the north wall — whatever was stored here was stored with purpose. The ceiling is the underside of the gas station floor, with a square of daylight where you climbed down. Cobwebs. The smell of old rust and dust. This was someone's emergency stash. They never came back for it.",
      "night": "Darkness. Total, subterranean darkness. Without a light source, you can feel the shelf, the walls, the floor — but see nothing."
    },
    "extras": [
      { "keywords": ["shelf", "shelves"], "description": "Bolted with concrete anchors. Three shelves, heavy-gauge steel. Most of what was here is gone, but the outline of absent objects is visible in the dust: cans, boxes, the rectangular footprint of an ammo can." },
      { "keywords": ["walls", "concrete"], "description": "Poured concrete, smooth. Purpose-built. A prepper's stash. They were right about everything and it didn't save them." }
    ],
    "item_spawns": [
      { "entity_id": "ammo_9mm", "spawn_chance": 0.40, "quantity": { "min": 3, "max": 8, "distribution": "bell" }, "condition_roll": { "min": 0.8, "max": 1.0 }, "ground_description": "A dented ammo can sits on the bottom shelf. Inside, loose 9mm rounds." },
      { "entity_id": "first_aid_kit_basic", "spawn_chance": 0.30, "quantity": { "min": 1, "max": 1, "distribution": "single" }, "condition_roll": { "min": 0.5, "max": 0.9 }, "ground_description": "A red plastic first aid kit is pushed to the back of the middle shelf, dusty but sealed." },
      { "entity_id": "canned_food_premium", "spawn_chance": 0.45, "quantity": { "min": 1, "max": 3, "distribution": "weighted_low" }, "condition_roll": { "min": 0.7, "max": 1.0 }, "ground_description": "Cans of food — real food, labeled. Chili. Peaches. Condensed soup." },
      { "entity_id": "letter_001_prepper", "spawn_chance": 0.60, "quantity": { "min": 1, "max": 1, "distribution": "single" }, "condition_roll": { "min": 1.0, "max": 1.0 }, "ground_description": "A sealed envelope is taped to the underside of the top shelf. Handwritten: FOR WHOEVER FINDS THIS." }
    ],
    "exits": { "up": { "destination": "cr_11_old_gas_station", "description_verbose": "back up to the gas station" } },
    "flags": { "safe_rest": true, "hidden_room": true, "dark": true },
    "narrative_notes": "Tutorial hidden reward room. Teaches: scavenging unlocks hidden areas, hidden areas have better loot, Letters Home collectible exists. The prepper's letter is Letter #1."
  },
  {
    "room_id": "cr_13_water_station",
    "zone": "crossroads",
    "name": "The Water Station",
    "act": 1,
    "descriptions": {
      "default": "A hand-pump well sunk into the hardpan, surrounded by a ring of flat stones where people queue with containers. The water is clean — someone tests it weekly, or claims to. A Drifter attendant manages the line and collects the fee: one Penny per liter. No exceptions. A wooden sign reads: CLEAN WATER IS LIFE. THEFT IS DEATH. The line is never long, but it's never empty either.",
      "night": "The pump stands silent. No one draws water at night. The attendant's stool is empty. The sign is a pale rectangle in the dark."
    },
    "extras": [
      { "keywords": ["pump", "well", "water"], "description": "A deep-well hand pump, cast iron, pre-Collapse. The handle is worn smooth by thousands of hands. Each pump delivers about a pint. Fill a liter bottle, that's seven pumps. The rhythm becomes meditative if you let it." },
      { "keywords": ["sign", "wooden"], "description": "CLEAN WATER IS LIFE. THEFT IS DEATH. Below it, a tally of hash marks. Thirty-seven. You hope that's days since the last incident and not something else." }
    ],
    "npc_spawns": [
      { "npc_id": "water_attendant", "spawn_chance": 0.80, "activity_pool": [
        { "desc": "The water attendant sits on a stool by the pump, counting Pennies into a leather pouch with the methodical focus of someone who takes their job very seriously.", "weight": 3 },
        { "desc": "The attendant is filling a large container for a woman with two children. He's not charging her. He sees you notice and says nothing.", "weight": 1 }
      ], "trade_inventory": ["clean_water_1L", "purification_tabs"] }
    ],
    "item_spawns": [],
    "exits": { "east": { "destination": "cr_03_market_south", "description_verbose": "the south market" } },
    "flags": { "safe_rest": false, "no_combat": true, "water_source": true }
  },
  {
    "room_id": "cr_14_leather_shop",
    "zone": "crossroads",
    "name": "The Leatherworks",
    "act": 1,
    "descriptions": {
      "default": "A stall that's grown into a workshop — three walls of salvaged wood with a tarp roof, the fourth side open to the market. The smell of tanning solution and worked leather is overwhelming. Hides hang from a rack. Finished goods — belts, holsters, sheaths, a few vests — line a shelf. The leatherworker is a large man with scarred hands who moves the awl with surprising delicacy.",
      "night": "The workshop is closed and shuttered. A padlock the size of your fist secures the front."
    },
    "extras": [
      { "keywords": ["hides", "leather", "rack"], "description": "Elk, deer, and something larger — maybe cow, maybe horse. The tanning process takes weeks. The leatherworker does everything by hand, the old way. He learned from YouTube videos before the internet died, he says. The irony is not lost on him." },
      { "keywords": ["goods", "holsters", "belts", "vests"], "description": "Quality work. The stitching is tight and even. The holsters are sized for specific weapons — he'll custom-fit if you bring your gun. The vests have steel plates sewn between leather layers. Not fashionable. Functional." }
    ],
    "npc_spawns": [
      { "npc_id": "leatherworker_vin", "spawn_chance": 0.70, "activity_pool": [
        { "desc": "Vin drives an awl through a belt blank, his massive hands steady as a surgeon's. He doesn't look up.", "weight": 3 },
        { "desc": "Vin is fitting a holster to a customer's hip, adjusting the angle, testing the draw. 'Pull. Again. Faster. Good.'", "weight": 2 }
      ], "trade_inventory": ["leather_belt", "knife_sheath", "pistol_holster", "scrap_vest", "runners_kit"], "dialogue_tree": "cr_vin_intro" }
    ],
    "exits": { "west": { "destination": "cr_05_market_north", "description_verbose": "the north market" } },
    "flags": { "safe_rest": false, "no_combat": true }
  },
  {
    "room_id": "cr_15_south_camp",
    "zone": "crossroads",
    "name": "Crossroads — South Camp",
    "act": 1,
    "descriptions": {
      "default": "The south end of the campground is where the long-timers set up — people who've been 'passing through' for weeks or months. The lean-tos here are more permanent, with walls of scavenged plywood and roofs of layered tarps. A woman is teaching a teenager to clean a rifle. Two old men play a card game with a deck held together by tape. It's almost a neighborhood.",
      "night": "The south camp is quieter than the main camp. People who stay this long learn to sleep light and keep their fires low. A dog barks once, somewhere, and is hushed."
    },
    "extras": [
      { "keywords": ["lean-tos", "shelters", "plywood"], "description": "Semi-permanent structures built by people who've stopped pretending they're leaving soon. One has a door. Another has a window cut into the plywood, covered with plastic sheeting. They're ugly and they're home." },
      { "keywords": ["card game", "cards", "old men"], "description": "The game is some variant of gin rummy played with house rules that have evolved over months. The stakes are matchsticks. The arguments are serious." },
      { "keywords": ["woman", "rifle", "teenager", "teaching"], "description": "The woman is patient and precise. She names every part as the teenager touches it. 'Bolt. Receiver. Barrel. Trigger. Safety. Say them again.' The teenager says them again. This is school now." }
    ],
    "npc_spawns": [
      { "npc_id": "camp_elder_rosa", "spawn_chance": 0.50, "activity_pool": [
        { "desc": "An older woman named Rosa sits mending a jacket by a low fire, humming something that might have been a pop song in another life.", "weight": 3 },
        { "desc": "Rosa is arguing with a younger man about water rationing. She's winning.", "weight": 2 }
      ], "dialogue_tree": "cr_rosa_camp_lore" }
    ],
    "item_spawns": [
      { "entity_id": "textiles_scrap", "spawn_chance": 0.35, "quantity": { "min": 1, "max": 2, "distribution": "weighted_low" }, "condition_roll": { "min": 0.3, "max": 0.7 }, "ground_description": "A scrap of durable fabric, neatly folded, sits on a rock as if someone set it down and forgot it." }
    ],
    "exits": {
      "north": { "destination": "cr_09_campground", "description_verbose": "the main campground" },
      "south": { "destination": "cr_16_south_perimeter", "description_verbose": "the south perimeter" }
    },
    "flags": { "safe_rest": true, "campfire_allowed": true }
  },
  {
    "room_id": "cr_16_south_perimeter",
    "zone": "crossroads",
    "name": "Crossroads — South Perimeter",
    "act": 1,
    "descriptions": {
      "default": "The south edge of Crossroads, where the tire wall meets open scrubland. A gap in the wall serves as a secondary exit — no gate, no arbiter, just a gap wide enough for one person. The locals call it the Back Door. It faces Highway 550 south. Beyond it, the road drops into a valley and the first red-rock formations of The Breaks are visible on the horizon. Three wooden crosses stand in the hardpan outside the wall. No names.",
      "night": "The Back Door is a slot of darker darkness in the wall. Nobody guards it at night. The crosses are silhouettes. The road south is invisible."
    },
    "extras": [
      { "keywords": ["crosses", "wooden", "graves"], "description": "Three crosses, rough-cut juniper, driven into the baked earth. No names. No dates. Somebody knows who's buried here. Nobody talks about it. The dirt around the middle cross has been disturbed more recently than the others." },
      { "keywords": ["gap", "back door", "wall"], "description": "Just wide enough for one person. No checkpoint. No ledger. People who use the Back Door are either leaving quietly or arriving the same way." },
      { "keywords": ["breaks", "south", "horizon", "valley"], "description": "The Breaks begin about ten miles south — red-rock canyon country carved by water and time. Beautiful from here. Dangerous up close. The road drops into the valley and doesn't come back for twenty miles." }
    ],
    "npc_spawns": [
      { "npc_id": "departing_scavenger", "spawn_chance": 0.20, "activity_pool": [
        { "desc": "A lone figure adjusts a heavy pack, checks a knife on their belt, and steps through the gap heading south without looking back.", "weight": 3 }
      ] }
    ],
    "item_spawns": [
      { "entity_id": "letter_002_grave", "spawn_chance": 0.15, "quantity": { "min": 1, "max": 1, "distribution": "single" }, "condition_roll": { "min": 0.6, "max": 0.9 }, "ground_description": "A folded piece of paper is wedged under a stone at the base of the middle cross, weighted against the wind." }
    ],
    "exits": {
      "north": { "destination": "cr_15_south_camp", "description_verbose": "south camp" },
      "south": { "destination": "br_01_canyon_mouth", "description_verbose": "the road south toward The Breaks", "skill_gate": { "skill": "survival", "dc": 5, "fail_message": "The canyon country to the south isn't for beginners." } }
    },
    "flags": { "safe_rest": false }
  },
  {
    "room_id": "cr_17_storage_shed",
    "zone": "crossroads",
    "name": "The Storage Shed",
    "act": 1,
    "descriptions": {
      "default": "A corrugated metal shed behind the market, padlocked and windowless. This is where the Drifter council stores Crossroads' emergency supplies — the reserve that keeps the market running when caravans are late or the weather turns. An arbiter is always within eyeline. The shed itself is unremarkable, but what it represents is everything. This is the last safety net in the Four Corners.",
      "night": "The shed is a dark metal box reflecting lantern light. The padlock gleams. An arbiter sits on a crate nearby, rifle across her lap."
    },
    "extras": [
      { "keywords": ["shed", "storage", "padlock"], "description": "Military-grade padlock. The key is held by the market's three senior arbiters in rotation. What's inside is a carefully guarded secret. Enough to keep Crossroads fed for three weeks if supply lines collapse. Maybe four if they ration hard. The shed is why Crossroads survives." },
      { "keywords": ["arbiter", "guard"], "description": "This arbiter doesn't make conversation. She watches the shed and she watches you and her expression says that the two are mutually exclusive." }
    ],
    "npc_spawns": [
      { "npc_id": "shed_guard", "spawn_chance": 0.90, "activity_pool": [
        { "desc": "An arbiter with a scarred jaw and patient eyes sits near the shed, rifle resting across her knees.", "weight": 4 }
      ], "disposition_roll": { "neutral": 0.6, "wary": 0.4 } }
    ],
    "exits": { "south": { "destination": "cr_04_market_center", "description_verbose": "back to the market center" } },
    "flags": { "safe_rest": false, "no_combat": true },
    "narrative_notes": "The shed becomes a quest location in Act II — a supply theft investigation. The quest reveals internal politics about Crossroads' governance."
  },
  {
    "room_id": "cr_18_the_pit",
    "zone": "crossroads",
    "name": "The Pit",
    "act": 1,
    "descriptions": {
      "default": "Behind the north market, a natural depression in the ground has been repurposed as a sparring ring. The walls are packed earth, the floor is sand, and the spectator seating is whatever you're standing on. Crossroads doesn't officially sanction fighting, but The Pit exists in the gray area between entertainment and training. No weapons. No killing. Everything else is negotiable. The sand is stained darker in patches.",
      "night": "The Pit is empty and dark. But the sand holds the memory of the day's fights — bootprints, drag marks, the occasional bloodstain."
    },
    "extras": [
      { "keywords": ["pit", "ring", "sand", "fighting"], "description": "The rules are simple: both fighters agree to enter. No weapons. No biting. Fight until one person yields or can't stand. Side bets are handled by a Drifter bookie who takes a 10% cut. The Salters love it. The Accord pretends it doesn't exist. The Kindling think it's a waste of energy that could be directed at the Lord's work." },
      { "keywords": ["stains", "blood", "dark"], "description": "The sand absorbs most of it. What it doesn't absorb, it covers. Nobody talks about the fight three weeks ago where a Salter recruit hit a Drifter wrong and the Drifter didn't get up for a long time." }
    ],
    "npc_spawns": [
      { "npc_id": "pit_bookie", "spawn_chance": 0.55, "activity_pool": [
        { "desc": "A wiry Drifter with quick eyes and a leather satchel of Pennies leans against the pit wall, watching for customers.", "weight": 3 },
        { "desc": "The bookie is taking bets on two fighters circling each other in the pit. Money changes hands fast.", "weight": 2, "time_restrict": ["day", "dusk"] }
      ], "dialogue_tree": "cr_pit_bookie" },
      { "npc_id": "pit_fighter", "spawn_chance": 0.40, "activity_pool": [
        { "desc": "A heavyset man wraps his knuckles with strips of cloth, slow and methodical, staring into the pit with the calm focus of someone preparing for violence.", "weight": 3 }
      ] }
    ],
    "exits": {
      "south": { "destination": "cr_05_market_north", "description_verbose": "the north market" }
    },
    "flags": { "safe_rest": false },
    "narrative_notes": "The Pit is an optional combat training area. Players can spar here for XP and reputation. Winning fights raises Salter reputation slightly. The bookie offers side quests — rigged fights, debts to collect."
  }
]
```

---

*Crossroads complete: 18 rooms. All fully scripted with descriptions, time variants, extras, NPC spawn pools, item spawns, exits, gating, and narrative notes.*
