# THE REMNANT — Room File Part B: RIVER ROAD (22 Rooms)

> The main travel corridor connecting Crossroads to Covenant. Follows the Animas River north. First Hollow encounters in the wild. Where travel becomes dangerous.

---

```json
[
  {
    "room_id": "rr_01_west_approach",
    "zone": "river_road",
    "name": "Highway 160 — East of Crossroads",
    "act": 1,
    "descriptions": {
      "default": "The highway stretches east through high scrubland, arrow-straight for a quarter mile before it curves north to follow the river. The pavement is cracked but walkable. On both sides, juniper and piñon pine press close, their shade welcome and their cover a concern. Ruts from cart wheels and the pockmarks of a thousand boots have worn a path down the center.",
      "night": "The highway is a gray line between black walls of juniper. Starlight catches the pale concrete but not much else. Every shadow could be a bush. Every bush could be something crouched behind it. The river is audible to the northeast — a compass sound.",
      "dawn": "Mist pools in the low ground on either side of the highway. The juniper tops catch the first gold light while the road itself is still in shadow. Bird calls — real ones, not the mimicry of Whisperers.",
      "dusk": "The sun drops behind you and your shadow stretches ahead on the asphalt, impossibly long. The juniper darkens. The road ahead curves into shadow. You can hear the river. You can't see what's between you and it."
    },
    "extras": [
      { "keywords": ["juniper", "pinon", "trees"], "description": "The juniper smells sweet and sharp. The trees are short but dense — anything could be standing thirty feet off the road and you wouldn't see it. Experienced travelers stay on the pavement." },
      { "keywords": ["ruts", "tracks", "boots", "path"], "description": "Heavy foot traffic on this stretch. Cart wheels have cut parallel ruts. An experienced tracker could read the last week here.", "skill_check": { "skill": "tracking", "dc": 8, "success_append": "At least three separate groups have passed in the last two days heading east, and one — a heavy cart, possibly loaded with trade goods — heading west. Fresh bootprints, size large, heading east alone. Moving fast. Running?" } },
      { "keywords": ["highway", "road", "pavement"], "description": "US-160 once connected Durango to Cortez. Sixty miles of mountain highway that saw semis and tourists and commuters. Now it sees survivors." }
    ],
    "npc_spawns": [
      { "npc_id": "traveling_merchant", "spawn_chance": 0.20, "spawn_type": "wanderer", "activity_pool": [
        { "desc": "A Drifter with a loaded handcart is heading west toward Crossroads, moving at the brisk pace of someone who wants to arrive before dark.", "weight": 3 },
        { "desc": "Two travelers walk east, armed, quiet, keeping five feet between them — close enough to fight together, far enough that one ambush doesn't get both.", "weight": 2 }
      ] }
    ],
    "item_spawns": [
      { "entity_id": "empty_water_bottle", "spawn_chance": 0.30, "quantity": { "min": 1, "max": 1, "distribution": "single" }, "condition_roll": { "min": 0.1, "max": 0.5 }, "ground_description": "An empty plastic water bottle lies in the ditch, sun-bleached." }
    ],
    "exits": {
      "west": { "destination": "cr_01_approach", "description_verbose": "back to the highway junction" },
      "east": { "destination": "rr_02_bridge_ruins", "description_verbose": "the road continues toward the river" }
    },
    "hollow_encounter": {
      "base_chance": 0.10,
      "time_modifier": { "day": 0.5, "night": 2.0, "dawn": 0.8, "dusk": 1.5 },
      "threat_pool": [
        { "type": "shuffler", "weight": 85, "quantity": { "min": 1, "max": 2, "distribution": "weighted_low" } },
        { "type": "remnant", "weight": 15, "quantity": { "min": 1, "max": 1, "distribution": "single" } }
      ],
      "awareness_roll": { "unaware": 0.6, "aware_passive": 0.3, "aware_aggressive": 0.1 },
      "activity_pool": {
        "shuffler": [
          { "desc": "shambles along the highway shoulder, feet dragging, heading nowhere with terrible patience", "weight": 3 },
          { "desc": "stands in the juniper just off the road, swaying slightly, face turned toward a sound only it can hear", "weight": 2 }
        ],
        "remnant": [
          { "desc": "crouches by the ditch, picking at something on the ground with fingers that still remember dexterity", "weight": 2 },
          { "desc": "walks the center line with purpose, hands at its sides, moving like someone late for an appointment that ended seven years ago", "weight": 2 }
        ]
      }
    },
    "environmental_rolls": {
      "ambient_sound_pool": {
        "day": [
          { "sound": "The river is audible to the northeast, a low murmur over stone.", "weight": 3 },
          { "sound": "A magpie scolds from a juniper branch, indignant at your presence.", "weight": 2 },
          { "sound": null, "weight": 2 }
        ],
        "night": [
          { "sound": "The river sounds louder at night. Everything else has gone quiet.", "weight": 3 },
          { "sound": "Something moves in the juniper to the south. Heavy. Slow. Probably an elk. Probably.", "weight": 2 },
          { "sound": "Distant gunfire. Two shots, east. Then nothing.", "weight": 1 },
          { "sound": null, "weight": 2 }
        ]
      },
      "ambient_count": { "min": 0, "max": 1 },
      "flavor_lines": [
        { "line": "A rusted speed limit sign reads 55. It feels like a message from another civilization.", "chance": 0.20, "time": ["day"] },
        { "line": "Your boots crunch on broken glass. Tail light fragments, scattered across the lane.", "chance": 0.25, "time": null },
        { "line": "A deer trail crosses the highway. Fresh tracks, delicate hooves in the dust.", "chance": 0.15, "time": ["dawn", "day"] }
      ]
    },
    "flags": { "safe_rest": false },
    "narrative_notes": "First room outside Crossroads' protection. The Hollow encounter chance is low but real — this is where players learn that the wild is dangerous. The tracking skill check on the ruts rewards early investment in Wits-based skills."
  },
  {
    "room_id": "rr_02_bridge_ruins",
    "zone": "river_road",
    "name": "The Broken Bridge",
    "act": 1,
    "descriptions": {
      "default": "The highway bridge over the Animas is gone — dropped into the river the first winter after the Collapse. What's left are two concrete stumps and a forty-foot gap of churning water. Someone built a crossing: steel cables anchored to the stumps, with planks lashed across them. A rope bridge. It sways in the wind and looks like it wants to kill you. A hand-lettered sign: ONE AT A TIME. MAX WEIGHT 200 LBS.",
      "night": "The bridge is a dark line over black water. You can hear the river but can't see it. The cable bridge has no lights. You'd be crossing by feel.",
      "dawn": "Morning mist rises from the river in thick columns, wreathing the bridge cables in white. The crossing appears and disappears as the mist shifts. The water below is invisible. You'd be walking on clouds.",
      "dusk": "The river catches the sunset and turns copper. The bridge cables throw long shadows downstream. The bridge keeper is packing up for the night, tucking tools into a canvas roll with the care of a ritual."
    },
    "extras": [
      { "keywords": ["bridge", "cable", "rope", "planks"], "description": "Two steel cables for handrails, wooden planks lashed with wire for the deck. It flexes underfoot. You can feel the river through it. The planks are mismatched: door panels, shelf boards, a piece of kitchen table. Someone maintains it. Someone is proud of it." },
      { "keywords": ["river", "animas", "water"], "description": "The Animas runs fast and cold, snowmelt from the San Juans. Knee-deep at shallows, chest-deep at center. The water is clear enough to see trout flashing over the gravel bed." },
      { "keywords": ["stumps", "concrete", "bridge ruins"], "description": "The original bridge was concrete and steel, built for semi-trucks. Now it's rubble colonized by moss. The rebar sticks up from the stumps like broken bones." },
      { "keywords": ["sign", "weight"], "description": "200 lbs. That's person plus gear. A heavy pack could put you over. The bridge keeper weighs people by eye and tells them if they need to make two trips. He's usually right." }
    ],
    "npc_spawns": [
      { "npc_id": "bridge_keeper_howard", "spawn_chance": 0.70, "spawn_type": "anchored", "activity_pool": [
        { "desc": "A wiry old man sits on the west stump with a toolbox and a coil of wire, inspecting a cable anchor with the possessive attention of a creator.", "weight": 3 },
        { "desc": "Howard is on the bridge itself, replacing a cracked plank. He works without a safety line over twenty feet of cold water. He doesn't seem concerned.", "weight": 2 },
        { "desc": "Howard is sitting on the stump, eating an apple, watching the river. He nods at you. 'She's running high today. Watch the third plank from center — it's new and I haven't worn it in yet.'", "weight": 2 }
      ], "dialogue_tree": "rr_howard_bridge_keeper", "narrative_notes": "Howard is a former civil engineer. He built this bridge. Knows the river road better than anyone. Gives directions, warnings, and — in Cycle 2+ — reveals he was part of a road crew that did contract work near the Scar before the Collapse. He saw trucks going in and out of a facility that wasn't supposed to exist." }
    ],
    "item_spawns": [
      { "entity_id": "wire_coil", "spawn_chance": 0.10, "quantity": { "min": 1, "max": 1, "distribution": "single" }, "condition_roll": { "min": 0.6, "max": 1.0 }, "ground_description": "A short coil of steel wire sits near Howard's toolbox, possibly forgotten or possibly a spare." }
    ],
    "exits": {
      "west": { "destination": "rr_01_west_approach", "description_verbose": "west toward Crossroads" },
      "east": { "destination": "rr_03_east_bank", "description_verbose": "across the bridge to the east bank", "skill_gate": { "skill": "vigor", "dc": 4, "fail_message": "The bridge sways under your weight and you grab the cable. Maybe build some stamina first." } },
      "south": { "destination": "rr_05_the_ford", "description_verbose": "a trail south to the ford crossing" }
    },
    "flags": { "safe_rest": false }
  },
  {
    "room_id": "rr_03_east_bank",
    "zone": "river_road",
    "name": "East Bank Landing",
    "act": 1,
    "descriptions": {
      "default": "The east bank of the Animas is a wide gravel bar where the river bends. Cottonwood trees lean over the water, their leaves turning the light green and dappled. The bridge cables anchor into a concrete block here, bolted to bedrock. A flat area of packed earth shows signs of regular camping — fire rings, boot tracks, a rope tied to a cottonwood for hanging packs away from animals. This is a waypoint, not a destination.",
      "night": "The cottonwoods are black shapes against stars. The river is silver where moonlight hits it, invisible everywhere else. The gravel bar crunches underfoot. Every sound carries."
    },
    "extras": [
      { "keywords": ["cottonwood", "trees", "leaves"], "description": "Old-growth cottonwoods, their trunks three feet wide, bark furrowed like canyon walls. In a breeze, the leaves make a sound like distant applause. In fall, the leaves turn gold and the river carries them downstream in flotillas." },
      { "keywords": ["fire rings", "camp", "tracks"], "description": "Multiple fire rings, some cold, some with recent ash. This is a popular overnight spot — close to the bridge, close to water, defensible with the river at your back. You're not the first person to think it's a good idea." },
      { "keywords": ["river", "water", "gravel"], "description": "The gravel bar extends twenty feet into the river before the water deepens. Clean water — you can drink it if you boil it or use purification tablets. The Animas has been clean since the humans stopped polluting it. Silver lining." },
      { "keywords": ["rope", "cottonwood", "hanging"], "description": "A rope with a carabiner clip, tied to a high branch. Bear hang technique — keep your food off the ground or the bears and coyotes will take it. In this case, the rope also keeps it away from Hollow. They can't climb. Mostly." }
    ],
    "npc_spawns": [
      { "npc_id": "fisher_npc", "spawn_chance": 0.30, "spawn_type": "wanderer", "activity_pool": [
        { "desc": "A man stands knee-deep in the shallows, a makeshift fishing rod bent with the weight of something alive. He hasn't noticed you.", "weight": 3 },
        { "desc": "A woman sits on the gravel bar, cleaning a trout with a short knife. Three more fish lie on a flat rock beside her. She looks up and nods.", "weight": 2 }
      ] }
    ],
    "item_spawns": [
      { "entity_id": "firewood_cottonwood", "spawn_chance": 0.55, "quantity": { "min": 1, "max": 4, "distribution": "bell" }, "condition_roll": { "min": 0.5, "max": 1.0 }, "ground_description": "Fallen cottonwood branches, dry and ready to burn, are scattered along the bank." },
      { "entity_id": "river_stone_flat", "spawn_chance": 0.40, "quantity": { "min": 1, "max": 2, "distribution": "weighted_low" }, "condition_roll": { "min": 0.8, "max": 1.0 }, "ground_description": "A flat river stone, smooth and palm-sized, sits on the gravel. Good for sharpening." }
    ],
    "exits": {
      "west": { "destination": "rr_02_bridge_ruins", "description_verbose": "back across the bridge" },
      "north": { "destination": "rr_04_south_bend", "description_verbose": "the river road continues north" },
      "east": { "destination": "rr_13_fishing_hole", "description_verbose": "a faint trail along the bank", "hidden": true, "discover_skill": "tracking", "discover_dc": 8, "discover_message": "Boot prints and drag marks — someone has been hauling fish this way repeatedly. A trail." }
    },
    "flags": { "safe_rest": true, "campfire_allowed": true, "water_source": true }
  },
  {
    "room_id": "rr_04_south_bend",
    "zone": "river_road",
    "name": "The River Road, South Bend",
    "act": 1,
    "descriptions": {
      "default": "The road is cracked asphalt with weeds pushing through every seam, the center line long since faded to nothing. To the east, the Animas River runs shallow over smooth stones, catching midday light. A rusted pickup truck sits nose-down in the ditch on the west side, its windshield a spiderweb of fractures. Something has been living in the cab — the passenger door hangs open, and the seat is torn to stuffing.",
      "night": "The road is a black ribbon under starlight. The river is a sound, not a sight. The wrecked pickup is a dark shape. Its open door creaks in a wind you can barely feel. Something rustles in the cab. You're not sure if it's fabric or breathing.",
      "dawn": "Mist clings to the river and spills across the road in low sheets. The truck is a ghost shape in the fog. The world is pearl-gray and hushed.",
      "dusk": "The truck casts a long shadow across the road. The river has gone from silver to copper. The light is golden and brief and makes everything beautiful, including the things that shouldn't be."
    },
    "extras": [
      { "keywords": ["truck", "pickup", "f-150", "windshield"], "description_pool": [
        { "desc": "A 2028 Ford F-150, once white. The bed is empty except for a moldy sleeping bag and three empty cans of beans. No keys in the ignition. The gas gauge reads empty, but gauges lie.", "weight": 3 },
        { "desc": "A 2028 Ford F-150. Someone has scratched STILL ALIVE into the dust on the tailgate. The handwriting is shaky. The bed holds a wadded-up tarp and a rusted toolbox — locked.", "weight": 2 },
        { "desc": "A 2028 Ford F-150. The hood is up. Someone has stripped the battery and wiring harness, recently — the cuts are clean and the exposed metal hasn't rusted yet.", "weight": 1 }
      ] },
      { "keywords": ["river", "animas", "water", "stones"], "description": "The Animas is twenty feet wide here, running fast and clear over gravel. You could wade across, but the current would be thigh-deep. Good fishing water, if you had the time." },
      { "keywords": ["cab", "seat", "door"], "description": "The cab smells like wet fur and something dead. The seat is shredded to the springs. Claw marks on the dash.", "skill_check": { "skill": "tracking", "dc": 12, "success_append": "The claw pattern is canine, but the spacing is wrong. Too wide. Whatever made these was bigger than any dog you've seen since the Collapse." } }
    ],
    "npc_spawns": [
      { "npc_id": "accord_sentry_river", "spawn_chance": 0.45, "spawn_type": "patrol", "activity_pool": [
        { "desc": "An Accord sentry watches the road from the pickup bed, rifle across her knees.", "weight": 3, "time_restrict": ["day", "dawn", "dusk"] },
        { "desc": "An Accord sentry crouches in the pickup bed, a dim lantern at her feet. She has her rifle up.", "weight": 2, "time_restrict": ["night"] },
        { "desc": "An Accord sentry is talking with a traveler, pointing north. Giving directions.", "weight": 1 }
      ] },
      { "npc_id": "stray_dog", "spawn_chance": 0.25, "spawn_type": "wanderer", "activity_pool": [
        { "desc": "A mangy dog sleeps in the shade under the truck.", "weight": 3, "time_restrict": ["day"] },
        { "desc": "A dog with a notched ear watches you from the ditch, body low, tail still. Not aggressive. Not friendly. Deciding.", "weight": 2 },
        { "desc": "A shepherd mix trots along the road shoulder, nose working. It pauses when it sees you, one ear up.", "weight": 2 }
      ], "narrative_notes": "THE DOG. This is the dog from the narrative bible. If the player feeds it, it follows. If treated kindly, it becomes a companion. Kindness counter starts here." }
    ],
    "item_spawns": [
      { "entity_id": "hunting_rifle_damaged", "spawn_chance": 0.08, "quantity": { "min": 1, "max": 1, "distribution": "single" }, "condition_roll": { "min": 0.15, "max": 0.55 }, "ground_description": "A hunting rifle leans against the truck's fender, stock cracked." },
      { "entity_id": "ammo_22lr", "spawn_chance": 0.20, "quantity": { "min": 1, "max": 5, "distribution": "weighted_low" }, "condition_roll": { "min": 0.8, "max": 1.0 }, "ground_description": "A few .22 rounds are scattered in the gravel." },
      { "entity_id": "water_bottle_sealed", "spawn_chance": 0.12, "quantity": { "min": 1, "max": 1, "distribution": "single" }, "condition_roll": { "min": 0.9, "max": 1.0 }, "ground_description": "A sealed plastic bottle of water sits on the dashboard." }
    ],
    "exits": {
      "south": { "destination": "rr_03_east_bank", "description_verbose": "south along the river" },
      "north": { "destination": "rr_06_the_narrows", "description_verbose": "the road narrows ahead" },
      "east": { "destination": "rr_14_riverbank_camp", "description_verbose": "a path down to the riverbank" }
    },
    "hollow_encounter": {
      "base_chance": 0.12,
      "time_modifier": { "day": 0.6, "night": 1.8, "dawn": 0.9, "dusk": 1.3 },
      "threat_pool": [
        { "type": "shuffler", "weight": 70, "quantity": { "min": 1, "max": 3, "distribution": "weighted_low" } },
        { "type": "remnant", "weight": 25, "quantity": { "min": 1, "max": 1, "distribution": "single" } },
        { "type": "screamer", "weight": 5, "quantity": { "min": 1, "max": 1, "distribution": "single" } }
      ],
      "awareness_roll": { "unaware": 0.55, "aware_passive": 0.30, "aware_aggressive": 0.15 },
      "activity_pool": {
        "shuffler": [
          { "desc": "stands motionless in the road, head cocked at an angle that suggests a broken neck. It hasn't noticed you.", "weight": 3 },
          { "desc": "is on its knees in the ditch, pawing at something in the dirt", "weight": 2 },
          { "desc": "shuffles in a slow circle near the truck, bumping against the fender on each pass", "weight": 2 }
        ],
        "remnant": [
          { "desc": "stands near the truck with its hand on the door handle, opening and closing it. Open. Close. Open. Close.", "weight": 3 },
          { "desc": "walks the center line with purpose, as if it remembers having somewhere to be", "weight": 2 }
        ],
        "screamer": [
          { "desc": "crouches on the truck roof, head swiveling, throat working. It hasn't screamed yet. When it does, everything within a mile will hear.", "weight": 2 }
        ]
      }
    },
    "flags": { "safe_rest": false },
    "narrative_notes": "This is the showcase room from the Room Display Spec. First real Hollow encounter zone. The dog spawn is critical — this is where the player's relationship with the game's most emotionally significant NPC potentially begins."
  },
  {
    "room_id": "rr_05_the_ford",
    "zone": "river_road",
    "name": "The Ford",
    "act": 1,
    "descriptions": {
      "default": "A mile south of the broken bridge, the Animas widens and shallows over a broad gravel bar. Ankle-deep at the edges, knee-deep at the center. Cart tracks mark the crossing on both banks — this is where heavy loads go. The water is cold and fast but manageable. Flat stones break the current into channels. Someone has placed stepping stones across the deepest section, not quite evenly spaced.",
      "night": "The ford is audible as a broad hiss of water over stone. In moonlight, the shallows are silver sheets. The stepping stones are dark humps in the current. Missing one would mean wet boots at best, a dunking at worst."
    },
    "extras": [
      { "keywords": ["stepping stones", "stones", "crossing"], "description": "Flat stones, placed deliberately but not recently — they've settled into the riverbed. The gaps between them are a long stride for a tall person, a jump for a short one. Whoever placed them wasn't thinking about children." },
      { "keywords": ["cart tracks", "tracks", "banks"], "description": "Deep ruts on both banks where carts have been hauled through the shallows. The Drifters use this crossing for their trade caravans. It adds two hours versus the bridge, but a loaded cart can't cross on cable and plank." },
      { "keywords": ["water", "river", "current"], "description": "Cold. Mountain snowmelt cold. Your legs will ache after thirty seconds. But the water is clean and the footing is solid gravel. Worse crossings exist." }
    ],
    "npc_spawns": [
      { "npc_id": "drifter_cart_team", "spawn_chance": 0.20, "spawn_type": "wanderer", "activity_pool": [
        { "desc": "A two-person cart team is hauling a loaded wagon through the shallows, water to their calves, cursing creatively at the cold.", "weight": 3 }
      ] }
    ],
    "item_spawns": [
      { "entity_id": "lost_cargo_crate", "spawn_chance": 0.10, "quantity": { "min": 1, "max": 1, "distribution": "single" }, "condition_roll": { "min": 0.3, "max": 0.7 }, "ground_description": "A small wooden crate has washed up against the stepping stones, snagged by the current. Water-damaged but sealed." }
    ],
    "exits": {
      "north": { "destination": "rr_02_bridge_ruins", "description_verbose": "north to the broken bridge" },
      "east": { "destination": "rr_03_east_bank", "description_verbose": "across the ford to the east bank" },
      "south": { "destination": "rr_15_south_river", "description_verbose": "the river trail continues south" }
    },
    "flags": { "safe_rest": false, "water_source": true }
  },
  {
    "room_id": "rr_06_the_narrows",
    "zone": "river_road",
    "name": "The River Road, The Narrows",
    "act": 1,
    "descriptions": {
      "default": "The road squeezes between a sheer rock face to the west and the river to the east. No shoulder. No ditch. Just asphalt, cliff, and water. The passage is maybe fifty yards long and barely wide enough for two people to walk abreast. Above, the cliff leans out over the road, creating a permanent shadow. This is ambush country. Everyone knows it. Everyone walks through it anyway because there's no other route north.",
      "night": "The Narrows at night is a throat of darkness. The cliff blocks the stars on one side. The river is a black rush on the other. Your footsteps echo off the rock face and come back to you doubled."
    },
    "extras": [
      { "keywords": ["cliff", "rock", "wall"], "description": "Sandstone, layered red and tan, carved by millennia of water and wind. It's beautiful in an academic sense. In a practical sense, it's a wall that funnels you into a kill zone. Someone has scratched hash marks into the rock at waist height. You count seventeen." },
      { "keywords": ["hash marks", "scratches", "marks"], "description": "Seventeen hash marks scratched into the sandstone. Each one the same depth, the same spacing. Deliberate. A count. Of what — days? Kills? People lost? The last mark looks fresher than the others.", "skill_check": { "skill": "lore", "dc": 10, "success_append": "These are Salter patrol marks. One mark per sweep through The Narrows. Seventeen sweeps since the last time someone cleaned the slate." } },
      { "keywords": ["river", "water", "east"], "description": "The river is close enough to touch if you leaned right. Running fast, hip-deep minimum. If something came at you from the north, your only escape route would be into the current. Not great." }
    ],
    "npc_spawns": [
      { "npc_id": "narrows_ambusher", "spawn_chance": 0.15, "spawn_type": "event", "activity_pool": [
        { "desc": "A figure steps out from a crack in the cliff face ahead of you. Armed. Blocking the road. 'Toll road. Five Pennies or your best weapon. Your choice.'", "weight": 2 }
      ], "disposition_roll": { "hostile": 0.6, "wary": 0.4 }, "narrative_notes": "Road bandit encounter. Player can fight, pay, negotiate (Presence DC 12), or intimidate (Presence DC 14). If Salter reputation is Recognized+, the bandit recognizes the affiliation and backs down." }
    ],
    "item_spawns": [
      { "entity_id": "dropped_pennies", "spawn_chance": 0.15, "quantity": { "min": 1, "max": 3, "distribution": "weighted_low" }, "condition_roll": { "min": 0.8, "max": 1.0 }, "ground_description": "A few .22 rounds lie scattered against the cliff base, as if dropped in a hurry." }
    ],
    "exits": {
      "south": { "destination": "rr_04_south_bend", "description_verbose": "south along the river road" },
      "north": { "destination": "rr_07_north_fork", "description_verbose": "through The Narrows to the fork" }
    },
    "hollow_encounter": {
      "base_chance": 0.18,
      "time_modifier": { "day": 0.7, "night": 2.2, "dawn": 1.0, "dusk": 1.5 },
      "threat_pool": [
        { "type": "shuffler", "weight": 60, "quantity": { "min": 1, "max": 3, "distribution": "weighted_low" } },
        { "type": "remnant", "weight": 25, "quantity": { "min": 1, "max": 2, "distribution": "weighted_low" } },
        { "type": "screamer", "weight": 15, "quantity": { "min": 1, "max": 1, "distribution": "single" } }
      ],
      "awareness_roll": { "unaware": 0.4, "aware_passive": 0.35, "aware_aggressive": 0.25 }
    },
    "flags": { "safe_rest": false },
    "narrative_notes": "Highest threat room in early River Road. The confined space makes combat dangerous — no flanking, no retreat without turning your back. The Screamer entry in the threat pool means that even a small encounter can escalate fast if a Screamer calls reinforcements. This room teaches players that terrain matters."
  },
  {
    "room_id": "rr_07_north_fork",
    "zone": "river_road",
    "name": "The North Fork",
    "act": 1,
    "descriptions": {
      "default": "The road widens as it exits The Narrows and reaches a junction where three trails diverge. North: a well-worn path climbing into foothills, the direction of Covenant, marked by an Accord signpost. East: a narrower trail following the river upstream toward rougher country. West: a barely-visible path switchbacking up a steep hillside into dense pine forest. The junction has a stone cairn at its center, shoulder-high, with colored ribbons tied to sticks at the top — trail markers in the Drifter tradition.",
      "night": "The junction is an open space under stars. The cairn is a dark pillar. The three trails are suggestions of lesser darkness leading into greater. The Accord signpost is unreadable."
    },
    "extras": [
      { "keywords": ["signpost", "accord", "sign"], "description": "A wooden post with a painted arrow: COVENANT — 8 MILES NORTH. Below it, smaller: ALL TRAVELERS WELCOME. WEAPONS CHECKED AT THE GATE. The paint is maintained. The Accord takes its signage seriously." },
      { "keywords": ["cairn", "ribbons", "markers"], "description": "The cairn is river stones stacked carefully. The ribbons are colored strips of fabric: red for danger, green for safe passage, blue for water. The current configuration has red on the east trail and green on the north. No ribbon on the west trail. That's either an oversight or a message." },
      { "keywords": ["west", "trail", "pine", "hill", "forest"], "description": "The west trail is overgrown. Whoever made it hasn't maintained it. The switchbacks are steep and the pine forest above is dense enough to block the sky. From here, you can't see where it goes.", "skill_check": { "skill": "survival", "dc": 12, "success_append": "Game trail, overlaid on something older — a human path, abandoned. It leads west and up, toward the high ridges. If you had to guess, it connects to the mountain forest the locals call The Pine Sea." }, "cycle_gate": 2 }
    ],
    "npc_spawns": [
      { "npc_id": "accord_trail_marker", "spawn_chance": 0.35, "spawn_type": "patrol", "activity_pool": [
        { "desc": "An Accord scout is refreshing the paint on the signpost, a small can of white paint and a brush balanced on the post top.", "weight": 2 },
        { "desc": "Two Accord scouts rest at the cairn, sharing water and scanning the trails. One waves.", "weight": 2 }
      ] }
    ],
    "item_spawns": [],
    "exits": {
      "south": { "destination": "rr_06_the_narrows", "description_verbose": "back through The Narrows" },
      "north": { "destination": "rr_08_burned_farmhouse", "description_verbose": "north toward Covenant" },
      "east": { "destination": "rr_09_cottonwood_stretch", "description_verbose": "east along the river" },
      "west": { "destination": "ps_01_tree_line", "description_verbose": "a faint trail climbing west into dense forest", "hidden": true, "discover_skill": "survival", "discover_dc": 12, "cycle_gate": 2, "discover_message": "You spot an overgrown trail climbing into the mountains. The Pine Sea." }
    },
    "flags": { "safe_rest": false, "fast_travel_waypoint": true }
  },
  {
    "room_id": "rr_08_burned_farmhouse",
    "zone": "river_road",
    "name": "The Burned Farmhouse",
    "act": 1,
    "descriptions": {
      "default": "A homestead that didn't make it. The farmhouse is a blackened skeleton — stone foundation, charred timbers, a chimney standing alone like a tombstone. The fire was years ago, but the smell lingers in the stone. A barn behind the house still stands, roof sagging but walls intact. The yard is overgrown with wild grass that reaches your waist. A swing set rusts in what was once a side yard, one swing still hanging, turning slowly in the wind.",
      "night": "The chimney is a black finger against the stars. The barn is a dark shape. The swing turns. You hear the chain creak. That's the only sound."
    },
    "extras": [
      { "keywords": ["farmhouse", "house", "ruins", "chimney"], "description": "The fire took everything above the foundation. Stone walls remain to knee height. You can see the layout: living room, kitchen, two bedrooms. Small. A family home. In the kitchen area, a cast-iron skillet sits on what's left of the stove, fused there by heat. Someone was cooking when the world ended." },
      { "keywords": ["barn", "building"], "description": "The barn is weathered but standing. The doors are open — one hangs from a single hinge. Inside: the rusted shell of a tractor, hay bales that have composted to black earth, and a workbench with tools still on it. Wrenches. A vise. A hacksaw. The owner was organized. The tools are arranged by size.", "skill_check": { "skill": "scavenging", "dc": 8, "success_append": "Behind the workbench, a loose board in the wall. Behind that — a metal box. Locked, but the lock is cheap." } },
      { "keywords": ["swing", "swing set", "yard"], "description": "A metal frame, rusted orange. Two swings — one broken, chain trailing in the grass. One still hanging, seat twisted, turning in any breeze. It's a small thing. It breaks your heart anyway." },
      { "keywords": ["grass", "yard", "overgrown"], "description": "Wild grass, waist-high. Could be hiding anything. You push through carefully. Your hand brushes something hard in the grass — a bicycle wheel, spokes bent, tire rotted. A child's bike." }
    ],
    "npc_spawns": [],
    "item_spawns": [
      { "entity_id": "hand_tools_basic", "spawn_chance": 0.35, "quantity": { "min": 1, "max": 3, "distribution": "weighted_low" }, "condition_roll": { "min": 0.3, "max": 0.7 }, "ground_description": "Rusted hand tools lie on the barn workbench — still usable, if you clean them." },
      { "entity_id": "scrap_metal", "spawn_chance": 0.50, "quantity": { "min": 2, "max": 5, "distribution": "bell" }, "condition_roll": { "min": 0.2, "max": 0.6 }, "ground_description": "Scrap metal from the tractor and farm equipment is scattered through the barn." },
      { "entity_id": "letter_003_farmhouse", "spawn_chance": 0.30, "quantity": { "min": 1, "max": 1, "distribution": "single" }, "condition_roll": { "min": 0.8, "max": 1.0 }, "ground_description": "In the barn's metal box, a letter. The paper is dry. The handwriting is a child's." },
      { "entity_id": "cast_iron_skillet", "spawn_chance": 0.25, "quantity": { "min": 1, "max": 1, "distribution": "single" }, "condition_roll": { "min": 0.4, "max": 0.6 }, "ground_description": "A cast-iron skillet sits on the ruined stove, fused to the surface but pryable with effort." }
    ],
    "exits": {
      "south": { "destination": "rr_07_north_fork", "description_verbose": "south to the fork" },
      "north": { "destination": "rr_10_overturned_bus", "description_verbose": "the road continues north" }
    },
    "hollow_encounter": {
      "base_chance": 0.12,
      "time_modifier": { "day": 0.6, "night": 1.8, "dawn": 0.8, "dusk": 1.4 },
      "threat_pool": [
        { "type": "shuffler", "weight": 75, "quantity": { "min": 1, "max": 2, "distribution": "weighted_low" } },
        { "type": "remnant", "weight": 25, "quantity": { "min": 1, "max": 1, "distribution": "single" } }
      ],
      "activity_pool": {
        "shuffler": [
          { "desc": "wanders through the tall grass in the yard, hands trailing through the seed heads, like someone remembering a summer lawn", "weight": 3 }
        ],
        "remnant": [
          { "desc": "sits on the barn workbench, turning a wrench in its hands. Over and over. The motion is smooth. Practiced. It was a mechanic.", "weight": 2 }
        ]
      }
    },
    "flags": { "safe_rest": false, "scavenging_zone": true },
    "narrative_notes": "Emotional weight room. The swing, the child's bike, the child's letter. This room exists to make the player feel the Collapse on a human scale. The Remnant in the barn — still turning a wrench — is the most disturbing Hollow encounter in Act I because it's the most human."
  },
  {
    "room_id": "rr_09_cottonwood_stretch",
    "zone": "river_road",
    "name": "The Cottonwood Stretch",
    "act": 1,
    "descriptions": {
      "default": "The trail follows the river through a corridor of towering cottonwood trees, their canopy so dense the light filters down in green-gold shafts. The river runs beside you, wide and slow in this section, with deep pools where the current eddies against fallen logs. The air is cooler here, ten degrees below the open road. Birdsong. Actual birdsong. A woodpecker hammers somewhere upstream. For fifty yards, you could forget what the world has become.",
      "night": "The cottonwoods are cathedral columns in the dark. The river reflects starlight in broken silver. The birdsong is gone, replaced by the chirp of crickets and the occasional splash of a fish. It's peaceful. The kind of peaceful that makes you nervous."
    },
    "extras": [
      { "keywords": ["cottonwood", "trees", "canopy"], "description": "These cottonwoods are ancient — a hundred years old, maybe more. They survived the Collapse because they don't need people. They just need water. Their roots drink from the river and their branches hold the sky and they will be here long after the last human argument is settled." },
      { "keywords": ["pools", "river", "water", "logs"], "description": "Deep, dark pools where the current slows. Trout hold in the shadow of submerged logs, visible as flashes of silver when they turn. This is food, if you have the patience and a way to catch it." },
      { "keywords": ["birdsong", "birds", "woodpecker"], "description": "Downy woodpecker, from the rhythm of the drumming. Blue jays in the upper canopy. A pair of dippers — small, round, gray — bob on a midstream rock, hunting aquatic insects. The birds came back fast after the Collapse. Fewer humans, fewer cats, fewer cars. For the birds, the apocalypse was a promotion." }
    ],
    "npc_spawns": [],
    "item_spawns": [
      { "entity_id": "wild_herbs", "spawn_chance": 0.40, "quantity": { "min": 1, "max": 3, "distribution": "bell" }, "condition_roll": { "min": 0.7, "max": 1.0 }, "ground_description": "Wild mint grows along the riverbank, fragrant and green." }
    ],
    "exits": {
      "west": { "destination": "rr_07_north_fork", "description_verbose": "back to the fork" },
      "east": { "destination": "rr_16_deep_pools", "description_verbose": "upstream along the river" }
    },
    "flags": { "safe_rest": true, "campfire_allowed": true, "water_source": true },
    "narrative_notes": "Respite room. After The Narrows and the Burned Farmhouse, the player needs beauty. This room is the game keeping its promise that the world is beautiful when nothing is trying to kill you. Low threat by design."
  },
  {
    "room_id": "rr_10_overturned_bus",
    "zone": "river_road",
    "name": "The Overturned Bus",
    "act": 1,
    "descriptions": {
      "default": "A school bus lies on its side across the road, blocking the entire lane. It went over during the first weeks — you can tell because the weeds have grown up through the shattered windows and the paint has weathered to dull yellow-gray. The interior is dark. Something moves inside. Something always moves inside. The locals call this one the Hive and give it a wide berth. A footpath detours around the wreckage through the scrub on the east side.",
      "night": "The bus is a beached whale of shadow. The sounds from inside are louder at night — shuffling, scraping, the occasional moan that rises and falls like breathing. The detour path is visible as a pale line through the dark scrub."
    },
    "extras": [
      { "keywords": ["bus", "school bus", "interior", "inside"], "description": "Through the broken windshield, you can see the interior: seats torn from their mounts, papers and backpacks rotted to mulch, and movement. Shufflers. At least three, possibly more. They mill in the confined space, bumping against walls and each other. A permanent nest. They don't leave and they don't die. They just... exist in there. It's worse than dangerous. It's sad." },
      { "keywords": ["path", "detour", "footpath", "scrub"], "description": "The footpath is well-worn — everyone detours. It adds five minutes to the walk but keeps you fifteen feet from the bus. Close enough to hear. Far enough to run." },
      { "keywords": ["hive", "locals"], "description": "The locals have names for the permanent Hollow nests: the Hive, the Pit, the School (that one is in Covenant's zone and nobody talks about it without flinching). The Hive is the bus. It's been here since Year One. Nobody has cleared it because nobody wants to climb into a bus full of Hollow. The Salters offered. The Accord said no — it serves as a warning to travelers about staying alert." }
    ],
    "npc_spawns": [],
    "item_spawns": [
      { "entity_id": "backpack_child", "spawn_chance": 0.15, "quantity": { "min": 1, "max": 1, "distribution": "single" }, "condition_roll": { "min": 0.2, "max": 0.5 }, "ground_description": "A child's backpack, faded purple, lies in the weeds near the bus. It's been rained on a thousand times." }
    ],
    "exits": {
      "south": { "destination": "rr_08_burned_farmhouse", "description_verbose": "south toward the farmhouse" },
      "north": { "destination": "rr_11_the_bend", "description_verbose": "north along the road" },
      "enter": { "destination": "rr_10b_bus_interior", "description_verbose": "climb into the bus", "skill_gate": { "skill": "grit", "dc": 8, "fail_message": "The sounds from inside the bus root you to the spot. You're not ready for this." } }
    },
    "flags": { "safe_rest": false },
    "narrative_notes": "Optional clearing quest location. The bus interior (RR-10b) is a single-room Hollow nest encounter — 3-5 Shufflers in close quarters. Clearing it earns Accord reputation and opens the road for safe travel. It's also deeply unpleasant: the Hollow inside were children."
  },
  {
    "room_id": "rr_10b_bus_interior",
    "zone": "river_road",
    "name": "Inside the Overturned Bus",
    "act": 1,
    "descriptions": {
      "default": "The bus is on its side, so the floor is the windows and the ceiling is the opposite row of seats. You crawl in through the emergency exit. The air is thick — decay, mold, and something sour. The seats are torn. Papers, backpacks, and lunch boxes form a layer of mulch on the 'floor.' Shufflers turn toward you. They're small. They were children when this happened. They're not children now. They're not anything now. But they're the size of children, and your brain won't stop telling you that.",
      "night": "Total darkness. The smell is worse. The sounds are closer. You can feel them moving before you see them."
    },
    "extras": [
      { "keywords": ["seats", "papers", "backpacks", "lunch boxes"], "description": "A Finding Nemo lunchbox. A notebook with MATH written on the cover in purple marker. A sneaker, tiny, untied. The details are worse than the danger. Every detail is a person who was eight years old and sitting in this seat when the world changed." },
      { "keywords": ["shufflers", "hollow", "children"], "description": "Four of them. Small. Their clothes are in tatters. One wears a backpack — hasn't taken it off in seven years. They move in the close space with the aimlessness of things that have nowhere to go. When they see you, they orient. They approach. They are hungry. They are always hungry." }
    ],
    "npc_spawns": [],
    "item_spawns": [
      { "entity_id": "letter_004_bus", "spawn_chance": 0.50, "quantity": { "min": 1, "max": 1, "distribution": "single" }, "condition_roll": { "min": 0.4, "max": 0.8 }, "ground_description": "A folded note in the driver's seat area. The handwriting is adult. It reads: I'm sorry. I tried to get them out. I couldn't get them all out." }
    ],
    "exits": {
      "out": { "destination": "rr_10_overturned_bus", "description_verbose": "back out of the bus" }
    },
    "hollow_encounter": {
      "base_chance": 0.95,
      "threat_pool": [
        { "type": "shuffler", "weight": 100, "quantity": { "min": 3, "max": 5, "distribution": "bell" } }
      ],
      "awareness_roll": { "unaware": 0.1, "aware_passive": 0.3, "aware_aggressive": 0.6 }
    },
    "flags": { "safe_rest": false, "dark": true },
    "narrative_notes": "The hardest room in Act I emotionally. The Hollow are child-sized. The letter is from the bus driver. This room is not fun. It is necessary. It is the game saying: this is what the Collapse took. Every time you fight a Hollow, this is what you're fighting. The question of whether there's a cure isn't academic. It's personal."
  },
  {
    "room_id": "rr_11_the_bend",
    "zone": "river_road",
    "name": "The River Road, The Bend",
    "act": 1,
    "descriptions": {
      "default": "The road curves sharply around a rock outcrop, reducing visibility to about thirty feet in either direction. The river runs close on the east side, loud enough to mask footsteps. Bushes crowd the west shoulder. This is the kind of place where you walk with your hand on your weapon and your eyes moving. Someone has painted WATCH YOUR SIX on the rock face in faded red.",
      "night": "The bend is a blind corner in the dark. The river masks all sound. You can't see what's ahead and you can't hear what's behind you. Move fast or don't move at all."
    },
    "extras": [
      { "keywords": ["rock", "outcrop", "bend"], "description": "Natural rock formation — the road was cut through here when the highway was built. The exposed stone is layered sandstone, the same red-and-tan as The Breaks. It creates a natural blind corner that no amount of caution fully solves." },
      { "keywords": ["paint", "graffiti", "watch your six"], "description": "WATCH YOUR SIX in faded red spray paint. Below it, in different handwriting: RIP JACKSON. Below that: 4/17/35. Someone died here three years ago. The warning came after." }
    ],
    "npc_spawns": [],
    "item_spawns": [],
    "exits": {
      "south": { "destination": "rr_10_overturned_bus", "description_verbose": "south past the bus" },
      "north": { "destination": "rr_12_covenant_outskirts", "description_verbose": "north toward Covenant" }
    },
    "hollow_encounter": {
      "base_chance": 0.20,
      "time_modifier": { "day": 0.7, "night": 2.0, "dawn": 1.0, "dusk": 1.5 },
      "threat_pool": [
        { "type": "shuffler", "weight": 50, "quantity": { "min": 2, "max": 4, "distribution": "weighted_low" } },
        { "type": "screamer", "weight": 30, "quantity": { "min": 1, "max": 1, "distribution": "single" } },
        { "type": "remnant", "weight": 20, "quantity": { "min": 1, "max": 2, "distribution": "weighted_low" } }
      ],
      "awareness_roll": { "unaware": 0.3, "aware_passive": 0.3, "aware_aggressive": 0.4 }
    },
    "flags": { "safe_rest": false }
  },
  {
    "room_id": "rr_12_covenant_outskirts",
    "zone": "river_road",
    "name": "Covenant Outskirts",
    "act": 1,
    "descriptions": {
      "default": "The road widens as it approaches the first signs of Covenant. A cleared buffer zone — trees felled, brush burned, sightlines opened — surrounds the settlement for a hundred yards in every direction. Stakes with sharpened points angle outward from the ground like a medieval defense. Beyond them, the walls of Covenant rise: school buses, shipping containers, earthworks, and razor wire. The gate is visible to the north, flanked by watchtowers. An Accord banner — blue field, white hand — hangs from the tallest tower.",
      "night": "The buffer zone is pale dirt under moonlight. Lanterns burn in the watchtowers. The walls are dark shapes. You can see sentries moving on the wall — silhouettes against lamp glow. They can see you too."
    },
    "extras": [
      { "keywords": ["buffer zone", "cleared", "stakes"], "description": "The buffer zone is maintained weekly by Accord work crews. Every bush, every sapling, every piece of cover that could hide an approaching threat is removed. The stakes are pressure-treated fence posts, sharpened to points, angled at 45 degrees. They won't stop a Brute. They'll slow a herd." },
      { "keywords": ["walls", "containers", "buses", "banner"], "description": "Covenant's walls are improvised but serious. The foundation is shipping containers filled with earth and gravel. School buses fill the gaps. On top, a walkway of pallets and planks where sentries patrol. The Accord banner is visible from a mile in good light. It says: we're here. We're organized. Think twice." },
      { "keywords": ["watchtowers", "sentries", "gate"], "description": "Two watchtowers flank the main gate — scaffolding platforms with corrugated steel windbreaks. Each has a sentry with a scoped rifle and a megaphone. They watch the road and they watch you and they see everything that happens in the buffer zone." }
    ],
    "npc_spawns": [
      { "npc_id": "covenant_gate_sentry", "spawn_chance": 0.90, "spawn_type": "anchored", "activity_pool": [
        { "desc": "A sentry on the wall raises a megaphone. 'Halt there. State your business and approach slowly.'", "weight": 3 },
        { "desc": "Two sentries watch from the towers. One tracks you with a scope. The other speaks into a radio.", "weight": 2 }
      ] }
    ],
    "exits": {
      "south": { "destination": "rr_11_the_bend", "description_verbose": "south along the river road" },
      "north": { "destination": "cv_01_main_gate", "description_verbose": "the main gate of Covenant" }
    },
    "flags": { "safe_rest": false },
    "narrative_notes": "Transition room from River Road to Covenant zone. The sentry megaphone is the first direct NPC interaction that establishes Covenant's character — organized, cautious, procedural."
  },
  {
    "room_id": "rr_13_fishing_hole",
    "zone": "river_road",
    "name": "The Fishing Hole",
    "act": 1,
    "descriptions": {
      "default": "A secluded bend in the river, screened from the road by a stand of willows. The water is deep here — a pool carved by centuries of current against a rock shelf. The surface is dark and still except where insects dimple it. Someone has built a rough bench from a split log. A forked stick for holding a fishing line is driven into the bank. This is someone's secret spot. Or it was.",
      "night": "The willows form a curtain. The pool is black glass. An owl calls from across the river. This might be the most peaceful place in the Four Corners."
    },
    "extras": [
      { "keywords": ["pool", "water", "deep"], "description": "The pool is eight feet deep at its center — you can see the bottom in clear conditions. Trout hold in the shadow of the rock shelf. Big ones. This is food that doesn't shoot back." },
      { "keywords": ["bench", "log", "stick", "fishing"], "description": "Someone comes here regularly. The bench is worn smooth. The forked stick is fresh — replaced recently. A pile of fish bones near the water's edge confirms it. Whoever fishes here is good at it and doesn't share the location." },
      { "keywords": ["willows", "trees", "screen"], "description": "Weeping willows, their trailing branches forming a green curtain between you and the road. From the road, this spot is invisible. From here, you can see through the branches to the road. A watcher's advantage." }
    ],
    "npc_spawns": [
      { "npc_id": "lone_fisher", "spawn_chance": 0.25, "spawn_type": "wanderer", "activity_pool": [
        { "desc": "A woman sits on the bench, line in the water, expression of total concentration. She doesn't acknowledge you. The concentration is real — or a convincing way to avoid conversation.", "weight": 3 }
      ], "dialogue_tree": "rr_fisher_lore" }
    ],
    "item_spawns": [
      { "entity_id": "fresh_fish", "spawn_chance": 0.35, "quantity": { "min": 1, "max": 2, "distribution": "weighted_low" }, "condition_roll": { "min": 0.8, "max": 1.0 }, "ground_description": "A fresh trout lies on the rock shelf, gutted and ready to cook. Left behind or left as an offering." },
      { "entity_id": "fishing_line_improvised", "spawn_chance": 0.20, "quantity": { "min": 1, "max": 1, "distribution": "single" }, "condition_roll": { "min": 0.5, "max": 0.9 }, "ground_description": "A coil of fishing line with a bent pin hook is tucked under the bench." }
    ],
    "exits": {
      "west": { "destination": "rr_03_east_bank", "description_verbose": "back along the bank to the east landing" }
    },
    "flags": { "safe_rest": true, "hidden_room": true, "water_source": true, "campfire_allowed": true }
  },
  {
    "room_id": "rr_14_riverbank_camp",
    "zone": "river_road",
    "name": "Riverbank Camp",
    "act": 1,
    "descriptions": {
      "default": "A flat area of packed sand on the riverbank, sheltered by a natural rock overhang that keeps the rain off. Someone has established a semi-permanent camp: a fire ring with a grill grate, a rope strung between trees for drying clothes or meat, and a lean-to made of pine branches. The river is six feet away. The road is thirty feet above.",
      "night": "The overhang blocks the sky. The fire ring is cold. The river is close and loud. This is the kind of place where you sleep with one eye open because the sound of the water would mask anything approaching."
    },
    "extras": [
      { "keywords": ["overhang", "rock", "shelter"], "description": "Natural sandstone overhang, deep enough to keep rain off a sleeping area. The rock is blackened from years of campfire smoke. Someone carved their initials: M.C. + J.L., inside a heart. Pre-Collapse, probably. People used to come here for fun." },
      { "keywords": ["camp", "fire ring", "lean-to", "grill"], "description": "A well-established river camp. The grill grate is a repurposed oven rack. The lean-to would sleep two, tightly. This is someone's regular spot, but the ashes in the fire ring are cold and the lean-to has a cobweb across the entrance. They haven't been back recently." }
    ],
    "npc_spawns": [],
    "item_spawns": [
      { "entity_id": "dried_meat_strip", "spawn_chance": 0.20, "quantity": { "min": 1, "max": 2, "distribution": "weighted_low" }, "condition_roll": { "min": 0.4, "max": 0.8 }, "ground_description": "A strip of dried meat hangs from the rope line, forgotten or deliberately left." },
      { "entity_id": "fire_starter_kit", "spawn_chance": 0.15, "quantity": { "min": 1, "max": 1, "distribution": "single" }, "condition_roll": { "min": 0.5, "max": 0.9 }, "ground_description": "A small tin of fire-starting supplies — char cloth, a ferro rod, and dry tinder — sits on a rock shelf." }
    ],
    "exits": {
      "west": { "destination": "rr_04_south_bend", "description_verbose": "back up to the road" }
    },
    "flags": { "safe_rest": true, "campfire_allowed": true, "water_source": true }
  },
  {
    "room_id": "rr_15_south_river",
    "zone": "river_road",
    "name": "South River Trail",
    "act": 1,
    "descriptions": {
      "default": "The trail follows the river south, narrowing as the terrain steepens. The water quickens here, tumbling over boulders in white rapids. The scrubland gives way to exposed rock and sparse piñon. The trail is less traveled — boot prints are fewer, fainter. A cairn of stacked stones marks a junction where a side trail climbs west toward higher ground.",
      "night": "The rapids are white noise. The trail is barely visible between the rocks. The cairn is a dark stack. West, the terrain climbs into blackness."
    },
    "extras": [
      { "keywords": ["rapids", "boulders", "water"], "description": "Too fast and too rocky to cross here. The current would tumble you. But the rapids aerate the water — this is where the fish are thickest, fighting upstream." },
      { "keywords": ["cairn", "stones", "junction"], "description": "A trail cairn, Drifter-style. The side trail west is steep and unmarked beyond the cairn. It leads toward the breaks — the canyon country." }
    ],
    "npc_spawns": [],
    "item_spawns": [],
    "exits": {
      "north": { "destination": "rr_05_the_ford", "description_verbose": "north to the ford" },
      "west": { "destination": "br_01_canyon_mouth", "description_verbose": "a steep trail climbing west into canyon country" },
      "south": { "destination": "rr_17_river_bend_south", "description_verbose": "further south along the river" }
    },
    "flags": { "safe_rest": false }
  },
  {
    "room_id": "rr_16_deep_pools",
    "zone": "river_road",
    "name": "The Deep Pools",
    "act": 1,
    "descriptions": {
      "default": "The river widens into a series of deep pools connected by shallow riffles. The water is crystalline, ten feet deep in places, the bottom visible as a mosaic of colored stone. Cliff walls rise on both sides, striped red and cream. This is a box canyon carved by water — beautiful, enclosed, and with limited exits. An old rope swing hangs from a cottonwood branch over the largest pool, frayed but still attached.",
      "night": "The pools are mirrors reflecting the canyon walls and a strip of stars overhead. The water is black and bottomless-looking. The rope swing turns slowly."
    },
    "extras": [
      { "keywords": ["pools", "water", "deep"], "description": "Deep enough to swim. Cold enough to gasp. The pools were a swimming hole before the Collapse — you can see faded spray paint on the cliff walls from years of teenagers marking their territory. SENIORS 2029. JAKE LOVES EMMA. The human equivalent of the cottonwoods' growth rings." },
      { "keywords": ["rope swing", "swing", "rope"], "description": "The rope is frayed at the top where it wraps the branch. Good for maybe a dozen more swings before it snaps. You could test it. The water below is deep enough. Probably." },
      { "keywords": ["cliffs", "walls", "canyon"], "description": "Thirty-foot sandstone walls on three sides. One way in, one way out — the trail to the west. Defensible in a siege. Inescapable in a trap. Depends on which side of the math you're on." }
    ],
    "npc_spawns": [],
    "item_spawns": [
      { "entity_id": "smooth_river_stone", "spawn_chance": 0.60, "quantity": { "min": 2, "max": 5, "distribution": "bell" }, "condition_roll": { "min": 0.8, "max": 1.0 }, "ground_description": "Smooth, palm-sized river stones in a range of colors line the bank." }
    ],
    "exits": {
      "west": { "destination": "rr_09_cottonwood_stretch", "description_verbose": "back through the cottonwoods" }
    },
    "flags": { "safe_rest": true, "water_source": true, "campfire_allowed": true }
  },
  {
    "room_id": "rr_17_river_bend_south",
    "zone": "river_road",
    "name": "South River Bend",
    "act": 1,
    "descriptions": {
      "default": "The river bends east and the trail peters out against a wall of tumbled boulders. The terrain here is transitional — scrubland giving way to red-rock canyon formations. You can see the first slot canyons of The Breaks to the south, narrow dark lines cut into the mesa. The river drops through a series of cascades, the sound filling the air. This is the edge of the settled world.",
      "night": "The cascades are a roar in the dark. The Breaks are a wall of shadow to the south. Stars are visible between the canyon rims like diamonds set in bone."
    },
    "extras": [
      { "keywords": ["boulders", "rocks", "tumbled"], "description": "A rockfall, maybe decades old, blocks the old trail. Climbable, but you'd need Climbing skill and both hands free." },
      { "keywords": ["breaks", "canyons", "south"], "description": "The Breaks begin here — a maze of slot canyons, mesas, and hidden valleys that extends south for thirty miles. Few people go in. Fewer come out with all their supplies. The ones who do come back with stories they don't tell sober." },
      { "keywords": ["cascades", "waterfalls", "drops"], "description": "The river drops ten feet over three cascades, each one a curtain of white water over dark rock. The mist from the falls keeps the surrounding rock perpetually wet and the moss perpetually green." }
    ],
    "npc_spawns": [],
    "item_spawns": [],
    "exits": {
      "north": { "destination": "rr_15_south_river", "description_verbose": "north along the river" },
      "south": { "destination": "br_01_canyon_mouth", "description_verbose": "into the canyon country", "skill_gate": { "skill": "survival", "dc": 5, "fail_message": "The canyon country ahead is not forgiving of mistakes." } }
    },
    "flags": { "safe_rest": false }
  },
  {
    "room_id": "rr_18_hanging_tree",
    "zone": "river_road",
    "name": "The Hanging Tree",
    "act": 1,
    "descriptions": {
      "default": "A massive ponderosa pine stands alone on a rise overlooking the road, its lowest branch twenty feet up and thick as a man's torso. Three ropes hang from that branch. Two are empty. One is not. The body wears the tattered remains of clothing but no identification. A wooden sign nailed to the trunk reads: RAIDER. CONVICTED BY ACCORD TRIBUNAL. SENTENCE CARRIED OUT 3/12/37. THIS IS JUSTICE. The road below is quieter than it should be. People don't linger here.",
      "night": "The tree is a black shape against the sky. The ropes are dark lines. The body turns slowly in whatever wind finds this hill. You don't look up."
    },
    "extras": [
      { "keywords": ["body", "hanging", "ropes"], "description": "The body has been here at least a year — desiccated by the dry mountain air rather than decomposed. The face is leather and bone. The clothes are sun-faded. One boot is missing. Birds have been at the eyes. The other two ropes are empty, their nooses still tied. Ready." },
      { "keywords": ["sign", "tribunal", "justice", "raider"], "description": "The Accord doesn't execute often. When they do, they make it public. The sign is official — formatted, dated, signed by Marshal Cross. RAIDER. The word is simple. The act it condemns — attacking caravans, stealing supplies, killing travelers — is not." },
      { "keywords": ["tree", "ponderosa", "branch"], "description": "The tree predates the Collapse by centuries. It has been used for this purpose before — you can see the rope scars on the branch. Not all of them are seven years old. This has been an execution site for longer than CHARON-7 has existed. Some things about human beings don't change." }
    ],
    "npc_spawns": [],
    "item_spawns": [
      { "entity_id": "letter_005_hanging_tree", "spawn_chance": 0.20, "quantity": { "min": 1, "max": 1, "distribution": "single" }, "condition_roll": { "min": 0.5, "max": 0.8 }, "ground_description": "A folded note is wedged into a crack in the tree bark, low, where someone kneeling could reach." }
    ],
    "exits": {
      "south": { "destination": "rr_11_the_bend", "description_verbose": "south along the road" },
      "north": { "destination": "rr_12_covenant_outskirts", "description_verbose": "north toward Covenant" }
    },
    "flags": { "safe_rest": false },
    "narrative_notes": "Moral weight room. The Accord isn't just nice people with good intentions — they execute raiders. Is this justice or brutality? The player's reaction to this room starts shaping their relationship with the Accord before they even enter Covenant. The letter at the tree base is from the executed raider to someone they loved. It doesn't justify what they did. It humanizes it."
  },
  {
    "room_id": "rr_19_old_highway_rest",
    "zone": "river_road",
    "name": "Highway Rest Stop Ruins",
    "act": 1,
    "descriptions": {
      "default": "The concrete skeleton of a highway rest stop — bathrooms, a covered picnic area, and a parking lot that nature is slowly reclaiming. The restroom building is still standing, its cinder-block walls impervious to everything except time. The picnic tables have collapsed. A vending machine lies face-down in the parking lot, its glass shattered, its contents long since raided. But the covered area still provides shade, and the bathrooms have intact walls that block the wind.",
      "night": "The rest stop is a series of angular shadows. The bathroom building is a dark block. The vending machine is a beached metal corpse. The covered area would keep the dew off. It would also screen you from seeing anything approaching."
    },
    "extras": [
      { "keywords": ["bathrooms", "restroom", "building"], "description": "Cinder block, built to last. The fixtures are useless — no water pressure, no electricity. But the walls are solid, the roof is intact, and someone has swept one of the stalls and laid a bedroll inside. A shelter of last resort." },
      { "keywords": ["vending machine", "machine"], "description": "A Coca-Cola machine, face-down. The glass is broken. The coin slot is jammed with a fork — someone tried to get free drinks and failed at the worst possible time. The inside is empty. Picked clean years ago. But the machine itself is heavy-gauge steel. Good scrap." },
      { "keywords": ["parking lot", "concrete", "lot"], "description": "Fifteen parking spaces, two of them handicapped. Three rusted vehicle husks: a sedan, an SUV, and a motorcycle tipped on its side. The motorcycle is stripped to the frame. Someone knew what they were doing." }
    ],
    "npc_spawns": [
      { "npc_id": "rest_stop_squatter", "spawn_chance": 0.20, "spawn_type": "wanderer", "activity_pool": [
        { "desc": "A gaunt figure emerges from the bathroom building, blinking. They look like they've been sleeping in there. They look like they've been sleeping in there for a while.", "weight": 3 }
      ], "disposition_roll": { "friendly": 0.1, "neutral": 0.3, "wary": 0.5, "hostile": 0.1 } }
    ],
    "item_spawns": [
      { "entity_id": "scrap_metal", "spawn_chance": 0.40, "quantity": { "min": 1, "max": 3, "distribution": "weighted_low" }, "condition_roll": { "min": 0.3, "max": 0.7 }, "ground_description": "Scrap metal from the vehicle husks is piled loosely near the motorcycle frame." },
      { "entity_id": "empty_cola_can", "spawn_chance": 0.50, "quantity": { "min": 1, "max": 2, "distribution": "weighted_low" }, "condition_roll": { "min": 0.1, "max": 0.3 }, "ground_description": "A crushed cola can lies under the picnic shelter, faded red." }
    ],
    "exits": {
      "east": { "destination": "rr_04_south_bend", "description_verbose": "east back to the river road" },
      "west": { "destination": "rr_20_abandoned_motel", "description_verbose": "a service road leads to an old motel" }
    },
    "hollow_encounter": {
      "base_chance": 0.14,
      "time_modifier": { "day": 0.6, "night": 2.0, "dawn": 0.8, "dusk": 1.4 },
      "threat_pool": [
        { "type": "shuffler", "weight": 70, "quantity": { "min": 1, "max": 3, "distribution": "weighted_low" } },
        { "type": "remnant", "weight": 30, "quantity": { "min": 1, "max": 1, "distribution": "single" } }
      ]
    },
    "flags": { "safe_rest": false, "scavenging_zone": true }
  },
  {
    "room_id": "rr_20_abandoned_motel",
    "zone": "river_road",
    "name": "Abandoned Motel — Parking Lot",
    "act": 1,
    "descriptions": {
      "default": "The Mountain View Motor Lodge — a two-story L-shaped motel from the 1970s, its neon sign dark, its pool drained and cracked, its parking lot a garden of determined weeds. The building is intact but weathered. Most of the ground-floor doors are open, their rooms visible as dark rectangles. The second floor has a walkway with a rusted railing. A faded billboard out front advertises HBO, A/C, AND REASONABLE RATES. The rates seem very reasonable now.",
      "night": "The motel is a series of dark doorways. The empty pool is a black pit. The second-floor walkway catches moonlight on its railing. Every room is a potential encounter."
    },
    "extras": [
      { "keywords": ["sign", "neon", "billboard", "mountain view"], "description": "MOUNTAIN VIEW MOTOR LODGE. The neon tubes are intact but dark. The mountain view is still accurate — you can see the San Juans from the parking lot. The lodge isn't wrong. It's just not relevant." },
      { "keywords": ["pool", "empty", "drained"], "description": "An in-ground pool, kidney-shaped, now a concrete pit full of dead leaves, a shopping cart, and what appears to be a mattress. Something has nested in the shallow end — the leaves are arranged in a circular depression." },
      { "keywords": ["rooms", "doors", "motel"], "description": "Twelve rooms on the ground floor, twelve above. Most doors are open. The rooms are stripped — mattresses gone or destroyed, fixtures ripped out. But the walls are solid, the roofs don't leak, and the doors still close. For a traveler, that's luxury." }
    ],
    "npc_spawns": [
      { "npc_id": "motel_survivor", "spawn_chance": 0.15, "spawn_type": "wanderer", "activity_pool": [
        { "desc": "A man sits on the second-floor walkway, legs dangling over the edge, eating something from a can. He watches you without much interest.", "weight": 2 },
        { "desc": "Sounds of someone rummaging come from one of the ground-floor rooms. A crash. A muttered curse.", "weight": 2 }
      ] }
    ],
    "item_spawns": [
      { "entity_id": "motel_bible", "spawn_chance": 0.30, "quantity": { "min": 1, "max": 1, "distribution": "single" }, "condition_roll": { "min": 0.5, "max": 0.9 }, "ground_description": "A Gideon Bible lies face-down in the parking lot, pages riffling in the wind." },
      { "entity_id": "soap_bar", "spawn_chance": 0.40, "quantity": { "min": 1, "max": 3, "distribution": "weighted_low" }, "condition_roll": { "min": 0.6, "max": 1.0 }, "ground_description": "Individually wrapped soap bars are scattered near a broken supply cart." },
      { "entity_id": "room_key_motel", "spawn_chance": 0.10, "quantity": { "min": 1, "max": 1, "distribution": "single" }, "condition_roll": { "min": 0.5, "max": 1.0 }, "ground_description": "A room key with a plastic fob — Room 7 — lies on the sidewalk." }
    ],
    "exits": {
      "east": { "destination": "rr_19_old_highway_rest", "description_verbose": "the service road back to the rest stop" },
      "enter": { "destination": "rr_21_motel_room7", "description_verbose": "Room 7 (locked — key required)", "locked": true, "locked_by": "room_key_motel" },
      "up": { "destination": "rr_22_motel_second_floor", "description_verbose": "the second-floor walkway" }
    },
    "hollow_encounter": {
      "base_chance": 0.18,
      "time_modifier": { "day": 0.5, "night": 2.5, "dawn": 0.7, "dusk": 1.5 },
      "threat_pool": [
        { "type": "shuffler", "weight": 65, "quantity": { "min": 1, "max": 3, "distribution": "bell" } },
        { "type": "remnant", "weight": 30, "quantity": { "min": 1, "max": 2, "distribution": "weighted_low" } },
        { "type": "whisperer", "weight": 5, "quantity": { "min": 1, "max": 1, "distribution": "single" } }
      ],
      "activity_pool": {
        "whisperer": [
          { "desc": "sits in one of the open doorways, watching the parking lot. As you approach, it speaks. 'Room for the night?' The voice is almost normal. Almost.", "weight": 2 }
        ]
      }
    },
    "flags": { "safe_rest": false, "scavenging_zone": true },
    "narrative_notes": "First possible Whisperer encounter. The Whisperer saying 'Room for the night?' in a motel is the game at its most unsettling. It's not a jump scare — it's a moment of wrongness that the player will remember."
  },
  {
    "room_id": "rr_21_motel_room7",
    "zone": "river_road",
    "name": "Mountain View Motor Lodge — Room 7",
    "act": 1,
    "descriptions": {
      "default": "Room 7 was locked for a reason. Someone lived here after the Collapse — really lived, not just sheltered. The bed is made. A water jug sits on the nightstand, empty. Canned food is stacked on the dresser, all opened, all empty, arranged in a line by brand. A journal lies open on the pillow. The last entry is dated 4/3/32 — one year after the Collapse. After that, nothing. The room is clean. Whoever lived here was organized, methodical, and alone.",
      "night": "The room is dark. The made bed is a pale rectangle. The journal on the pillow is a shadow."
    },
    "extras": [
      { "keywords": ["journal", "diary", "book", "pillow"], "description": "The journal is a composition notebook, half-filled. The handwriting is small and precise. The entries begin on Day 1 of the Collapse and document one person's methodical survival: water purification, food rationing, fortification of the room. The tone is calm. Almost clinical. The last entry reads: 'Day 367. Water gone. Will try the river. If this is the last entry, it was a good run.' It was the last entry." },
      { "keywords": ["cans", "food", "dresser", "line"], "description": "Twenty-three cans, arranged in a line. Beans, corn, peaches, soup. All opened cleanly with a can opener, all washed, all placed right-side up. Someone ate these over the course of a year and kept the empties as a record. Twenty-three cans. Three hundred sixty-seven days. The math doesn't work. They were hungry for a long time." },
      { "keywords": ["bed", "made", "clean"], "description": "Hospital corners. The sheet is tucked tight enough to bounce a coin. In a world that had stopped requiring order, this person maintained it. The discipline of someone who knew that keeping the bed made was keeping themselves sane." }
    ],
    "npc_spawns": [],
    "item_spawns": [
      { "entity_id": "letter_006_room7", "spawn_chance": 0.80, "quantity": { "min": 1, "max": 1, "distribution": "single" }, "condition_roll": { "min": 0.9, "max": 1.0 }, "ground_description": "The journal is here. It is the room's only treasure." },
      { "entity_id": "can_opener_quality", "spawn_chance": 0.60, "quantity": { "min": 1, "max": 1, "distribution": "single" }, "condition_roll": { "min": 0.7, "max": 0.9 }, "ground_description": "A metal can opener sits on the nightstand, clean and sharp." }
    ],
    "exits": {
      "out": { "destination": "rr_20_abandoned_motel", "description_verbose": "back to the parking lot" }
    },
    "flags": { "safe_rest": true, "hidden_room": true },
    "narrative_notes": "One of the game's most emotionally powerful rooms. No combat. No threat. Just the evidence of one person's year-long survival, told through objects. The journal is a Letters Home collectible but also a significant lore piece — it documents early Collapse observations."
  },
  {
    "room_id": "rr_22_motel_second_floor",
    "zone": "river_road",
    "name": "Mountain View Motor Lodge — Second Floor",
    "act": 1,
    "descriptions": {
      "default": "The second-floor walkway runs the length of the building, an exterior corridor with a rusted iron railing overlooking the parking lot. The view is the motel's only honest amenity — the San Juan Mountains fill the northern horizon, snow-capped and indifferent. Most of the second-floor doors are closed. One is ajar, its interior dark. A concrete stairwell at the far end leads back down. The railing creaks when you touch it but holds.",
      "night": "The walkway is a narrow ledge in the dark. The railing is cold under your hand. The view north shows the faint glow of Covenant's fires against the mountain's base. Closer, the parking lot is a gray square. The open door is a rectangle of absolute black."
    },
    "extras": [
      { "keywords": ["view", "mountains", "san juan", "north"], "description": "The mountains are massive from here — closer than they seemed from Crossroads. You can see the foothills, the timber line, and above it, bare rock and snow. Somewhere up there is the Scar. From this distance, it's just another valley." },
      { "keywords": ["railing", "walkway", "corridor"], "description": "The railing is original — 1970s iron, now rusted to a warm brown. It flexes slightly under weight but the bolts hold. The walkway concrete is cracked but stable. A defensible position, if you needed one — one stairwell, one ladder, limited approach." },
      { "keywords": ["door", "open", "ajar", "dark"], "description": "Room 11. The door is ajar. You can see the edge of a bed frame, a curtain moving in the draft. The room smells like dust and something animal. Claw marks on the door frame, at hip height. Small.", "skill_check": { "skill": "tracking", "dc": 10, "success_append": "Raccoon. The claw marks are raccoon. The room has been claimed by wildlife. Probably safe, if you don't mind the roommate." } }
    ],
    "npc_spawns": [],
    "item_spawns": [
      { "entity_id": "binoculars_intact", "spawn_chance": 0.08, "quantity": { "min": 1, "max": 1, "distribution": "single" }, "condition_roll": { "min": 0.6, "max": 0.9 }, "ground_description": "A pair of binoculars hangs from the railing by a strap, left behind by someone who was watching the road." }
    ],
    "exits": {
      "down": { "destination": "rr_20_abandoned_motel", "description_verbose": "the stairs back to the parking lot" }
    },
    "flags": { "safe_rest": true }
  }
]
```

---

*River Road complete: 22 rooms. All fully scripted.*
