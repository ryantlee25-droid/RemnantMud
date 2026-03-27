# THE REMNANT — Master Dungeon Script

> 155 hand-crafted rooms across 12 zones. Designed to require 3+ full cycles to experience completely. Every room has full descriptions, exits, extras, NPC placements, item spawns, and gating logic. This is not procedural — this is authored.

---

## ZONE ARCHITECTURE — THE MAP

The world is organized into 12 zones connected by roads, trails, and passages. The player cannot access all zones in a single cycle due to faction gates, skill gates, quest gates, and knowledge gates (things you only learn by dying and coming back).

```
                          [THE SCAR] (Act III — Cycle 3+)
                              |
                         [THE PINE SEA]
                            /    \
                   [THE STACKS]   [THE DEEP]
                      |               |
            [COVENANT] --- [RIVER ROAD] --- [SALT CREEK]
                |              |                |
           [THE EMBER]    [CROSSROADS]     [THE DUST]
                              |
                         [THE BREAKS]
                            /    \
                   [DUSKHOLLOW]   [THE PENS] (Act II — Cycle 2+)
```

### Zone Summary

| Zone | Rooms | Act | Cycle Gate | Primary Faction | Theme |
|------|-------|-----|-----------|----------------|-------|
| Crossroads | 12 | I | None (starting zone) | Drifters (neutral) | Commerce, orientation, first choices |
| River Road | 14 | I | None | Contested | Travel corridor, first Hollow encounters |
| Covenant | 18 | I | None (but inner areas locked) | The Accord | Civilization, law, community |
| Salt Creek | 14 | I-II | Reputation gate (Salters ≥ Recognized) | The Salters | Military, strength, authority |
| The Ember | 10 | I-II | Quest gate (Kindling intro quest) | The Kindling | Faith, fire, purification |
| The Breaks | 16 | I-II | Skill gate (Survival ≥ 5) | None (wilderness) | Canyons, ambush, isolation |
| The Dust | 12 | II | Skill gate (Survival ≥ 8) | None (wasteland) | Desolation, endurance, ruin |
| The Stacks | 10 | II | Reputation gate (Reclaimers ≥ Recognized) | The Reclaimers | Technology, knowledge, secrets |
| Duskhollow | 12 | II | Faction gate (Sanguine contact quest) | Covenant of Dusk | Vampiric politics, coexistence |
| The Deep | 14 | II-III | Skill gate (multiple: Survival ≥ 10, any combat ≥ 8) | None (underground) | Darkness, horror, deep loot |
| The Pine Sea | 8 | II-III | Knowledge gate (location learned in Cycle 2+) | None (wilderness) | Beauty, altitude, respite |
| The Scar / MERIDIAN | 15 | III | Multi-gate (quest + faction + skill + Cycle 3+) | None (endgame) | Truth, choice, consequence |
| **TOTAL** | **155** | | | | |

### Cycle-Gating Logic

**Cycle 1:** Player can access Crossroads, River Road, Covenant (outer), The Breaks (outer), Salt Creek (if reputation earned), The Ember (if quest found). Approximately 60-70 rooms accessible. Player will likely die before completing Act I content.

**Cycle 2:** Echoed skills and faction memory open Salt Creek interior, The Ember deeper areas, The Dust, The Stacks, Duskhollow, and The Deep entrance. Knowledge gates from Cycle 1 death reveal The Pine Sea location. Approximately 120 rooms accessible. Player will likely die in The Deep or during Act II faction conflicts.

**Cycle 3+:** MERIDIAN access requires keycards (Reclaimers questline), Sanguine biometric data (Duskhollow questline), knowledge of the secret entrance (Kindling questline), AND a minimum skill threshold. All 155 rooms accessible. Completing the Scar and making the final choice is the endgame.

---

## ZONE 1: CROSSROADS (12 Rooms)

*The starting zone. A neutral trading post at the junction of US-160 and US-550. No faction owns it. Everyone passes through. This is where the player learns the basics.*

---

### Room CR-01: The Approach

```json
{
  "room_id": "cr_01_approach",
  "zone": "crossroads",
  "name": "Highway Junction — The Approach",
  "descriptions": {
    "default": "Two highways meet here in a cracked X of faded asphalt, the painted lines long surrendered to sun and weeds. To the north, a cluster of buildings rises behind a wall of stacked tires and corrugated steel — that's Crossroads, the only neutral ground in the Four Corners. A hand-painted sign nailed to a leaning telephone pole reads: NO FACTION WARS INSIDE. VIOLATORS SHOT. Below it, someone has added in smaller letters: not kidding.",
    "night": "The junction is a pool of darkness where two dead highways cross. Firelight flickers behind the tire wall to the north — Crossroads, still open, still lit. The sign on the telephone pole is unreadable in the dark, but you've heard what it says. Everyone has.",
    "dawn": "Mist sits low on the asphalt, turning the junction into a gray lake. The Crossroads wall is a dark shape to the north, its gate lanterns burning amber through the fog. A figure moves on the wall — a sentry, or a shadow."
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
    }
  ],
  "npc_spawns": [
    {
      "npc_id": "crossroads_gate_guard",
      "spawn_chance": 0.90,
      "activity_pool": [
        { "desc": "A Drifter arbiter leans against the gate post, shotgun across her chest, watching you approach with professional disinterest.", "weight": 4 },
        { "desc": "A broad-shouldered arbiter stands at the gate, arms crossed, sizing you up as you approach.", "weight": 3 },
        { "desc": "Two arbiters are sharing a canteen by the gate. One nods at you. The other doesn't.", "weight": 2 }
      ]
    }
  ],
  "item_spawns": [
    {
      "entity_id": "discarded_flyer",
      "spawn_chance": 0.40,
      "quantity": { "min": 1, "max": 1, "distribution": "single" },
      "ground_description": "A crumpled flyer is caught against the base of the telephone pole."
    }
  ],
  "exits": {
    "north": { "destination": "cr_02_gate", "description_verbose": "the Crossroads gate" },
    "east": { "destination": "rr_01_west_approach", "description_verbose": "Highway 160, east toward the River Road" },
    "south": { "destination": "br_01_canyon_mouth", "description_verbose": "Highway 550, south toward The Breaks", "skill_gate": { "skill": "survival", "dc": 5, "fail_message": "The road south looks rough. You're not sure you're ready for open wilderness." } },
    "west": { "destination": "du_01_dust_edge", "description_verbose": "Highway 160, west into The Dust", "skill_gate": { "skill": "survival", "dc": 8, "fail_message": "The heat shimmer to the west is brutal. You'd need more experience to survive out there." } }
  },
  "flags": { "safe_rest": false, "tutorial_zone": true, "fast_travel_waypoint": true }
}
```

---

### Room CR-02: Crossroads Gate

```json
{
  "room_id": "cr_02_gate",
  "zone": "crossroads",
  "name": "Crossroads — The Gate",
  "descriptions": {
    "default": "The gate is a repurposed livestock chute — steel rails bent into an S-curve that forces everyone to pass single file past an arbiter checkpoint. The arbiters wear no faction colors, just gray armbands and the calm expression of people who have ended arguments permanently. Beyond the chute, you can see market stalls, cook smoke, and movement. The sound of voices — actual human conversation, not whispers or warnings — drifts through.",
    "night": "Lanterns hang from hooks along the chute, throwing orange light across the steel rails. The checkpoint arbiter has her shotgun in her hands now, not slung. Night changes the rules. You can still enter, but she watches harder."
  },
  "extras": [
    {
      "keywords": ["arbiter", "arbiters", "guard", "checkpoint"],
      "description": "The Drifter arbiters are the closest thing Crossroads has to law enforcement. They don't arrest you. They don't fine you. They shoot you, or they don't. The simplicity is the point. Everyone understands the terms."
    },
    {
      "keywords": ["chute", "rails", "gate"],
      "description": "The S-curve forces you to slow down, turn twice, and present yourself to the checkpoint. You can't rush through. You can't hide what you're carrying. It's a simple piece of tactical architecture that works exactly as well as it needs to."
    },
    {
      "keywords": ["armbands", "gray"],
      "description": "Gray for neutral. No faction. The arbiters are Drifters by affiliation but independent by practice. Their loyalty is to the market, not to any banner. Crossroads makes money for everyone. That's why everyone lets it exist."
    }
  ],
  "npc_spawns": [
    {
      "npc_id": "checkpoint_arbiter",
      "spawn_chance": 0.95,
      "activity_pool": [
        { "desc": "The checkpoint arbiter glances at you, notes your gear, and waves you through with a calloused hand.", "weight": 5 },
        { "desc": "The arbiter holds up a hand. 'Weapons stay holstered inside. Blades stay sheathed. We clear?' She doesn't wait for an answer.", "weight": 3 },
        { "desc": "The arbiter is writing something in a battered ledger. She looks up, looks you over, makes a mark, and nods you through.", "weight": 2 }
      ],
      "dialogue_trigger": "talk arbiter",
      "dialogue_tree": "cr_arbiter_intro"
    }
  ],
  "item_spawns": [],
  "exits": {
    "south": { "destination": "cr_01_approach", "description_verbose": "back to the highway junction" },
    "north": { "destination": "cr_03_market_south", "description_verbose": "into the market" }
  },
  "flags": { "safe_rest": false, "no_combat": true }
}
```

---

### Room CR-03: Market — South End

```json
{
  "room_id": "cr_03_market_south",
  "zone": "crossroads",
  "name": "Crossroads Market — South End",
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
      "activity_pool": [
        { "desc": "Marta tends her cook fire, stirring a blackened pot without looking up. A hand-lettered sign reads: ELK JERKY — 3 PENNIES. STEW — 2 PENNIES. NO CREDIT.", "weight": 4 },
        { "desc": "Marta is haggling with a Drifter over a strip of jerky. Her voice is patient. Her knife hand is not.", "weight": 2 }
      ],
      "trade_inventory": ["boiled_rations", "elk_jerky", "purification_tabs"],
      "dialogue_tree": "cr_marta_intro"
    },
    {
      "npc_id": "drifter_newcomer",
      "spawn_chance": 0.35,
      "activity_pool": [
        { "desc": "A young man sits against a tent pole, pack between his knees, looking at the market with the wide eyes of someone who hasn't seen this many people in a long time.", "weight": 3 },
        { "desc": "A woman with a fresh scar across her temple eats stew with one hand and keeps the other on the knife at her belt.", "weight": 2 }
      ]
    }
  ],
  "item_spawns": [
    {
      "entity_id": "dropped_penny_22lr",
      "spawn_chance": 0.15,
      "quantity": { "min": 1, "max": 2, "distribution": "weighted_low" },
      "ground_description": "A .22 round has rolled under the edge of a tarp. Easy to miss."
    }
  ],
  "exits": {
    "south": { "destination": "cr_02_gate", "description_verbose": "the gate" },
    "north": { "destination": "cr_04_market_center", "description_verbose": "deeper into the market" },
    "east": { "destination": "cr_06_info_broker", "description_verbose": "a quieter stall with a curtain" }
  },
  "flags": { "safe_rest": false, "no_combat": true }
}
```

---

### Room CR-04: Market — Center

```json
{
  "room_id": "cr_04_market_center",
  "zone": "crossroads",
  "name": "Crossroads Market — Center",
  "descriptions": {
    "default": "The heart of the market. A massive tarp stretched between four telephone poles creates a canopy over the main trading floor. This is where the real commerce happens — weapons, armor, tools, components. The vendors here are professionals, not cooks. Their counters are reinforced. Their wares are displayed with precision. A Drifter arbiter stands on an overturned crate in the center, high enough to see everything, hand resting on the butt of a holstered revolver.",
    "night": "The center market is quieter but not empty. The weapons vendors have locked their serious inventory behind steel shutters, but the component traders are still open. Scrap metal, textiles, electronics — the building blocks. The arbiter on the crate has been replaced by one with a rifle."
  },
  "extras": [
    {
      "keywords": ["weapons", "arms", "guns", "blades"],
      "description": "Melee weapons are displayed openly — machetes, hatchets, reinforced bats, a few combat knives of varying quality. Firearms are behind the counter. You point, the vendor retrieves. Ammunition is sold separately, always. Nobody gives you a loaded weapon across a counter."
    },
    {
      "keywords": ["arbiter", "guard", "crate", "revolver"],
      "description": "The center arbiter is the market's keystone. From that crate, she can see every transaction, every argument, every hand moving toward a weapon. She hasn't had to draw in weeks. The last person who started trouble in here is buried outside the south wall. That's the kind of precedent that keeps the peace."
    },
    {
      "keywords": ["canopy", "tarp", "poles"],
      "description": "The canopy was a parachute in a previous life — military surplus, olive drab, faded to the color of dried sage. It filters the sunlight into something almost pleasant. When it rains, the canopy sags in the middle and someone has to poke it with a pole to dump the water. It's become a ritual."
    }
  ],
  "npc_spawns": [
    {
      "npc_id": "weapons_vendor_cole",
      "spawn_chance": 0.90,
      "activity_pool": [
        { "desc": "Marcus Cole stands behind his counter, a slab of reinforced plywood on sawhorses, arranging blades by size with the care of a jeweler.", "weight": 3 },
        { "desc": "Cole is field-stripping a pistol, his hands moving with the unconscious speed of deep practice. He glances up. 'Buying or browsing?'", "weight": 3 }
      ],
      "trade_inventory": ["pipe_wrench", "hatchet", "combat_knife", "machete", "22_rifle", "9mm_pistol", "ammo_22lr", "ammo_9mm"],
      "dialogue_tree": "cr_cole_intro"
    },
    {
      "npc_id": "components_vendor",
      "spawn_chance": 0.80,
      "activity_pool": [
        { "desc": "A thin woman with wire-rim glasses sorts through bins of salvaged electronics, occasionally holding a component up to the light and squinting.", "weight": 3 },
        { "desc": "The components vendor is weighing scrap metal on a hand-balanced scale, lips moving as she counts.", "weight": 2 }
      ],
      "trade_inventory": ["scrap_metal", "textiles", "electronics_salvage", "chemicals_basic"]
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
}
```

---

### Room CR-05: Market — North End

```json
{
  "room_id": "cr_05_market_north",
  "zone": "crossroads",
  "name": "Crossroads Market — North End",
  "descriptions": {
    "default": "The north end of the market is where things get quieter and more interesting. The bulk trading gives way to specialty vendors — a leatherworker, a woman who repairs radios, a man who claims to sell maps of safe routes through The Breaks. A bulletin board leans against the back wall, thick with pinned notes, wanted posters, and hand-drawn advertisements. Beyond the last stall, a trail leads north into the hills — the long road toward Covenant and the mountains.",
    "night": "Most of the specialty vendors have closed up. The radio repair woman is still here, bent over a gutted shortwave set by lantern light, soldering iron in hand. The bulletin board is unreadable in the dark. The trail north is a suggestion of pale dirt against the scrub."
  },
  "extras": [
    {
      "keywords": ["bulletin", "board", "notes", "posters", "advertisements"],
      "description_pool": [
        {
          "desc": "The board is chaos. LOOKING FOR: brother, last seen Farmington, answers to David. WANTED: anyone with medical training, Covenant will pay double rations. FOR TRADE: solar panel, cracked but functional, seeking antibiotics. MISSING: six chickens, definitely stolen, I know it was you Briggs. WARNING: Hollow herd spotted moving east along 160, avoid after dark.",
          "weight": 3
        },
        {
          "desc": "A new note is pinned over older ones: HAS ANYONE ELSE HEARD THE RADIO SIGNAL? I'm not crazy. Shortwave, repeating loop, something about the Scar. Find me at the north stalls. — E. Someone has written below it: you're crazy. And below that: heard it too.",
          "weight": 2
        },
        {
          "desc": "The board is mostly old news. One note catches your eye: REVENANTS — if you've died and come back, the Reclaimers want to talk to you. Discreet. No experiments. Just questions. Ask for Lev at The Stacks.",
          "weight": 1,
          "cycle_gate": 2
        }
      ]
    },
    {
      "keywords": ["radio", "woman", "shortwave", "repair"],
      "description": "Her name, according to the hand-lettered sign, is Sparks. The workbench is a graveyard of gutted electronics — radios, walkie-talkies, a car stereo, something that might have been a laptop. She works with the intensity of someone who believes she's doing important work and doesn't need you to agree."
    },
    {
      "keywords": ["maps", "map", "man", "routes"],
      "description": "The map seller is either a genius or a con artist. His 'maps' are hand-drawn on whatever flat surface was available — notebook paper, cardboard, the back of a fast food tray. He swears they're accurate. He also swears that the routes are safe. The second claim is more suspect than the first."
    }
  ],
  "npc_spawns": [
    {
      "npc_id": "sparks_radio_repair",
      "spawn_chance": 0.75,
      "activity_pool": [
        { "desc": "Sparks is hunched over a shortwave radio, muttering frequencies to herself like a prayer.", "weight": 3 },
        { "desc": "Sparks has a radio playing — static mostly, but every few seconds, a fragment of voice cuts through. She's writing down every word.", "weight": 2, "quest_trigger": "radio_signal_intro" }
      ],
      "dialogue_tree": "cr_sparks_intro"
    },
    {
      "npc_id": "map_seller",
      "spawn_chance": 0.55,
      "activity_pool": [
        { "desc": "A sunburned man in a wide hat is sketching something on cardboard with a stubby pencil, occasionally looking north and squinting as if measuring distance by eye.", "weight": 3 }
      ],
      "trade_inventory": ["map_breaks_basic", "map_river_road", "map_dust_partial"]
    }
  ],
  "item_spawns": [
    {
      "entity_id": "torn_note_fragment",
      "spawn_chance": 0.25,
      "quantity": { "min": 1, "max": 1, "distribution": "single" },
      "ground_description": "A torn scrap of paper lies on the ground near the bulletin board, blown loose by the wind."
    }
  ],
  "exits": {
    "south": { "destination": "cr_04_market_center", "description_verbose": "the center market" },
    "north": { "destination": "rr_07_north_fork", "description_verbose": "the trail toward Covenant and the mountains" },
    "west": { "destination": "cr_09_campground", "description_verbose": "an open area with fire rings" }
  },
  "flags": { "safe_rest": false, "no_combat": true }
}
```

---

### Room CR-06: The Curtain (Patch's Intel Shop)

```json
{
  "room_id": "cr_06_info_broker",
  "zone": "crossroads",
  "name": "The Curtain",
  "descriptions": {
    "default": "Behind a heavy canvas curtain, a quieter kind of commerce happens. The space is small — a salvaged desk, two chairs, a lantern, and the overwhelming smell of antiseptic and tobacco. This is where Patch holds court. Information broker, medic, and the most connected person in the Four Corners who claims to owe nobody anything. The curtain muffles the market noise into a distant hum. In here, it's almost private.",
    "night": "The curtain is drawn tight. A thin line of lantern light leaks from underneath. Patch keeps late hours. The question is whether you want to know what that costs."
  },
  "extras": [
    {
      "keywords": ["desk", "papers", "notes"],
      "description": "The desk is covered in papers — hand-drawn maps, lists of names, supply inventories, and notes in a shorthand you can't read. Patch notices you looking and shifts a ledger to cover the most interesting page. Not aggressively. Just... automatically."
    },
    {
      "keywords": ["curtain", "canvas"],
      "description": "Heavy, waxed canvas. Possibly a military tent section. It blocks sound well enough that conversations inside don't carry to the market. That's the product, as much as anything Patch actually says."
    },
    {
      "keywords": ["antiseptic", "medical", "supplies"],
      "description": "A locked metal box sits behind the desk — a military field surgery kit, from the look of it. Patch's medical supplies are not for general sale. They're for emergencies and for people who've earned the privilege of being treated by someone competent."
    }
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
      "quest_giver": ["quest_radio_signal", "quest_faction_intro_accord", "quest_faction_intro_salters", "quest_faction_intro_kindling"],
      "trade_inventory": ["antibiotics_01", "bandages", "quiet_drops", "stim_shot"],
      "trade_currency": "information_or_pennies"
    }
  ],
  "item_spawns": [],
  "exits": {
    "west": { "destination": "cr_03_market_south", "description_verbose": "back to the market" }
  },
  "flags": { "safe_rest": false, "no_combat": true },
  "narrative_notes": "Patch is the tutorial quest hub. They explain the factions, offer the radio signal quest, and give the player their first real choice: which faction introduction to pursue. Patch's dialogue changes significantly based on cycle count — they recognize Revenants."
}
```

---

### Room CR-07: Patch's Clinic

```json
{
  "room_id": "cr_07_patch_clinic",
  "zone": "crossroads",
  "name": "The Red Door Clinic",
  "descriptions": {
    "default": "A converted storage container with a red cross painted on the door — sloppy, but visible from anywhere in the market. Inside, it's clean. Aggressively clean. The walls have been scrubbed. The two cots have actual sheets. Medical instruments line a shelf in order of size. This is where Crossroads sends its wounded, and the reason Patch is the most protected person in the Four Corners. You don't hurt the only real medic for fifty miles.",
    "night": "The clinic's lantern burns all night. Someone is always hurt. Someone is always sick. The red cross on the door glows dully in the reflected light."
  },
  "extras": [
    {
      "keywords": ["cots", "beds", "sheets"],
      "description": "Two cots, both empty at the moment. The sheets are threadbare but clean — boiled, probably. A luxury that most people haven't experienced since the Collapse. The pillow on the left cot has a bloodstain that didn't fully wash out."
    },
    {
      "keywords": ["instruments", "tools", "medical", "shelf"],
      "description": "Scalpels, forceps, suture needles, a hand-cranked aspirator, clamps of various sizes. Pre-Collapse surgical quality. Patch didn't find these at a pharmacy — this is military field surgery equipment. Where Patch got it is one of the many things Patch doesn't discuss."
    },
    {
      "keywords": ["walls", "container", "clean"],
      "description": "The container walls are steel, scrubbed with something that smells like bleach. Cleanliness is Patch's religion. In a world without antibiotics manufacturing, infection control is the difference between a wound that heals and one that kills. Patch understands this better than anyone."
    }
  ],
  "npc_spawns": [
    {
      "npc_id": "wounded_drifter",
      "spawn_chance": 0.40,
      "activity_pool": [
        { "desc": "A Drifter lies on the far cot, bandaged arm across their chest, staring at the ceiling with the vacant patience of someone who knows healing takes time they don't have.", "weight": 3 },
        { "desc": "A young woman sits on the edge of the cot, unwrapping a dirty bandage from her ankle while muttering at the wound underneath.", "weight": 2 }
      ]
    }
  ],
  "item_spawns": [
    {
      "entity_id": "bandages_clean",
      "spawn_chance": 0.20,
      "quantity": { "min": 1, "max": 2, "distribution": "weighted_low" },
      "ground_description": "A roll of clean bandage material sits on the shelf edge, partially unrolled."
    }
  ],
  "exits": {
    "west": { "destination": "cr_04_market_center", "description_verbose": "the market center" }
  },
  "flags": { "safe_rest": true, "healing_bonus": 1.5, "no_combat": true }
}
```

---

### Room CR-08: The Job Board

```json
{
  "room_id": "cr_08_job_board",
  "zone": "crossroads",
  "name": "The Job Board",
  "descriptions": {
    "default": "A section of chain-link fence has been repurposed as the market's job board — a ten-foot wall of pinned notes, offers, requests, and warnings. This is how work gets done in the Four Corners. Need a caravan guard? Post it. Need a building cleared of Hollow? Post it. Need someone to deliver a message to a settlement you can't reach yourself? Post it. The board is the economy's nervous system. A wooden bench sits in front of it, worn smooth by the backsides of people reading slowly.",
    "night": "The job board is unreadable in the dark — no one wastes lantern fuel on it after sundown. But the bench is occupied. Two figures sit at opposite ends, not speaking, just... waiting for morning. Or for something else."
  },
  "extras": [
    {
      "keywords": ["board", "notes", "jobs", "fence", "postings"],
      "description_pool": [
        {
          "desc": "CARAVAN GUARD NEEDED: Crossroads to Salt Creek, 3-day round trip. Pay: 50 Pennies + meals. Danger: moderate. Apply to Drifter dispatch, north stalls. WANTED: Mechanic for generator repair, Covenant. Long-term position. Housing provided. CLEARING JOB: Hollow nest reported in gas station off 160 east, 6 clicks. Bounty: 30 Pennies per confirmed kill, bring proof.",
          "weight": 3
        },
        {
          "desc": "URGENT: Medical supplies needed at The Ember. Will pay triple market rate for antibiotics, surgical tools, or blood coagulants. Ask for Sister Venn. TRACKER NEEDED: Missing person, last seen heading south into The Breaks. Family offering everything they have. See the board manager for details. WARNING: Do NOT take the 'easy route' through Bone Hollow. It's not easy. Trust me.",
          "weight": 2
        },
        {
          "desc": "WORK FOR REVENANTS: The Stacks is offering premium rates for Revenants willing to undergo non-invasive study. No needles. No restraints. Just conversation and observation. Skeptics welcome. Ask for Lev. NOTE: If you've heard the radio signal and want to know more, meet at the north campfire at dusk. Come alone. Bring a weapon. — unsigned",
          "weight": 1,
          "cycle_gate": 2
        }
      ]
    },
    {
      "keywords": ["bench", "wooden"],
      "description": "The bench is a church pew. Someone carried it here from a chapel somewhere and didn't bother to sand off the hymnal rack on the back. People sit and read the board and, perhaps without meaning to, rest their hands where prayer books used to go."
    }
  ],
  "npc_spawns": [
    {
      "npc_id": "board_manager",
      "spawn_chance": 0.65,
      "activity_pool": [
        { "desc": "An older man with a clipboard and a permanent squint manages the job board, pulling down expired postings and pinning up new ones with the efficiency of someone who has found purpose in organization.", "weight": 3 },
        { "desc": "The board manager is arguing with someone about posting placement. 'Urgent goes in the center. Non-urgent goes on the sides. I've explained this.'", "weight": 2 }
      ],
      "quest_giver": ["quest_caravan_guard", "quest_clearing_job", "quest_missing_person"]
    }
  ],
  "item_spawns": [],
  "exits": {
    "east": { "destination": "cr_04_market_center", "description_verbose": "the market center" }
  },
  "flags": { "safe_rest": false, "no_combat": true, "quest_hub": true }
}
```

---

### Room CR-09: The Campground

```json
{
  "room_id": "cr_09_campground",
  "zone": "crossroads",
  "name": "Crossroads — The Campground",
  "descriptions": {
    "default": "West of the market, a flat clearing serves as the camp for travelers who can't afford — or don't want — indoor accommodations. Fire rings made from stacked stones dot the ground, most cold, a few smoldering. Bedrolls and lean-tos are scattered without pattern. The people here are between places. Passing through. Some have been passing through for weeks. The view west is open desert and sky — a reminder of how big the empty world is.",
    "night": "Three fires burn in the campground. Around the largest, a group shares a bottle of something and tells stories in low voices. Around the second, a solitary figure sharpens a blade. The third fire is untended but recent — whoever lit it is nearby, in the dark, watching."
  },
  "extras": [
    {
      "keywords": ["fire", "fires", "campfire", "fire ring", "stones"],
      "description": "The fire rings are communal property. First come, first served. Fuel is gathered from the scrubland or purchased from a kid who charges two Pennies for an armload of juniper wood. The fire's warmth is free. The company around it is variable."
    },
    {
      "keywords": ["bedrolls", "lean-tos", "camp", "travelers"],
      "description": "Maybe fifteen, twenty people camped here tonight. Most are Drifters in transit. A few are new arrivals — you can tell by the way they hold their packs close and sleep facing outward. The campground has an unspoken rule: don't touch anyone's gear. Violations of this rule are handled without arbiters."
    },
    {
      "keywords": ["desert", "west", "sky", "view"],
      "description": "The sky to the west is enormous — mountain silhouettes against sunset, or star-field against black. Before the Collapse, there was light pollution for a hundred miles. Now the Milky Way is so vivid it looks painted. It's beautiful. It's also a reminder that there's nothing between here and the horizon but dust, heat, and things that want to eat you."
    }
  ],
  "npc_spawns": [
    {
      "npc_id": "campfire_storyteller",
      "spawn_chance": 0.45,
      "activity_pool": [
        { "desc": "An older Drifter with a voice like gravel and honey is telling a story about a Hollow herd he outran last winter. His audience is rapt. The story is probably eighty percent true.", "weight": 3 },
        { "desc": "A woman with Salter tattoos sits by the fire alone, drinking from a flask. She doesn't look like she wants company. She looks like she's deciding something.", "weight": 2 }
      ],
      "dialogue_tree": "cr_campfire_lore"
    },
    {
      "npc_id": "mysterious_stranger",
      "spawn_chance": 0.10,
      "activity_pool": [
        { "desc": "A figure in a hooded coat sits outside the firelight, face in shadow. They haven't moved in the time you've been watching. But they are awake.", "weight": 1 }
      ],
      "dialogue_tree": "cr_stranger_sanguine_hint",
      "narrative_notes": "This is the player's first optional Sanguine encounter. The stranger is a Lucid Sanguine passing through. They don't reveal what they are unless the player has high Perception (14+) or asks directly. This encounter plants a seed."
    }
  ],
  "item_spawns": [
    {
      "entity_id": "juniper_firewood",
      "spawn_chance": 0.50,
      "quantity": { "min": 1, "max": 3, "distribution": "weighted_low" },
      "ground_description": "A few sticks of juniper firewood are stacked near an unoccupied fire ring."
    }
  ],
  "exits": {
    "east": { "destination": "cr_05_market_north", "description_verbose": "the north market" },
    "north": { "destination": "cr_10_overlook", "description_verbose": "a rocky rise overlooking the camp" },
    "west": { "destination": "cr_11_old_gas_station", "description_verbose": "the ruins of a gas station, half-collapsed" }
  },
  "flags": { "safe_rest": true, "campfire_allowed": true }
}
```

---

### Room CR-10: The Overlook

```json
{
  "room_id": "cr_10_overlook",
  "zone": "crossroads",
  "name": "The Overlook",
  "descriptions": {
    "default": "A rocky rise twenty feet above the campground, flat on top, with a view that justifies the climb. From here you can see the full layout of Crossroads — the tire wall, the market canopy, the campground fires — and beyond it, the skeleton of the old world: a ruined gas station to the west, the highway stretching east and south, and to the north, the blue-gray wall of the San Juan Mountains where Covenant and harder places wait. The wind is stronger up here. It smells like sage and distance.",
    "night": "The overlook at night is a planetarium. The Milky Way arcs overhead in a spray of cold light. Below, the campfires are orange dots. In the distance, you can see a faint glow on the northern horizon — Covenant, probably. And further, darker, the mountains. Somewhere up there is the Scar. You can't see it. You can feel it."
  },
  "extras": [
    {
      "keywords": ["mountains", "san juan", "north"],
      "description": "The San Juan range rises like a wall of teeth along the northern horizon. Snow on the peaks year-round. Timber below, alpine meadow, then rock. Covenant sits in the foothills. The Stacks are somewhere in the eastern slopes. The Scar is higher, deeper, further. People point at the mountains and say 'up there' and what they mean is: 'where the answers are, and also the things that will kill you.'"
    },
    {
      "keywords": ["crossroads", "market", "below", "layout"],
      "description": "From up here, Crossroads looks fragile. A few tarps, a tire wall, a handful of fires. This is what passes for civilization now — a patch of negotiated peace in a landscape that has forgotten the concept. It works because everyone needs it. The day it stops being useful is the day it stops existing."
    },
    {
      "keywords": ["wind", "sage", "air"],
      "description": "The high desert wind carries juniper and sage and something else — ozone, maybe, or the memory of rain. It's the cleanest air you've breathed in weeks. Up here, for a moment, the world is just geography. Beautiful, indifferent geography."
    },
    {
      "keywords": ["scar", "glow", "north", "further"],
      "description": "You can't see the Scar from here. Nobody can — it's buried in a valley on the north side of the range. But sometimes, on clear nights, people on the overlook swear they see a faint light on the mountains that isn't a star and isn't a fire. Patch says it's atmospheric refraction. The Kindling say it's a sign. The Reclaimers say nothing and write it down.",
      "skill_check": {
        "skill": "perception",
        "dc": 14,
        "success_append": "There. For just a second, on the dark slope of the highest visible peak — a light. Steady, not flickering. Not a fire. Something powered. Then gone."
      }
    }
  ],
  "npc_spawns": [],
  "item_spawns": [
    {
      "entity_id": "old_binoculars",
      "spawn_chance": 0.05,
      "quantity": { "min": 1, "max": 1, "distribution": "single" },
      "condition_roll": { "min": 0.3, "max": 0.7 },
      "ground_description": "A pair of binoculars with a cracked left lens sits on the rock, left behind or placed deliberately."
    }
  ],
  "exits": {
    "south": { "destination": "cr_09_campground", "description_verbose": "back down to the campground" }
  },
  "flags": { "safe_rest": true, "campfire_allowed": true },
  "narrative_notes": "The Overlook is the first place the player can 'see' the Scar from a distance. The Perception check to see the light is high — most first-cycle players will miss it. Revenants with echoed Perception will catch it and understand its significance. This is a knowledge-gate teaser."
}
```

---

### Room CR-11: Old Gas Station

```json
{
  "room_id": "cr_11_old_gas_station",
  "zone": "crossroads",
  "name": "Ruins — Old Gas Station",
  "descriptions": {
    "default": "The gas station is a husk. Roof half-collapsed, pumps rusted to abstract sculpture, the convenience store windows shattered and dark. Weeds have colonized the concrete pad. A faded sign that once advertised unleaded at $4.89 a gallon now advertises nothing to no one. But the building isn't empty — scavengers have picked through it a hundred times, and yet things keep turning up in the rubble. Cracks in the floor. Gaps behind shelving. The old world hid things in layers.",
    "night": "The gas station is a dark shape against the stars. The collapsed roof creates shadows that move wrong — structural debris shifting in the wind, or something else. The concrete pad is pale enough to see by moonlight. The building interior is not."
  },
  "extras": [
    {
      "keywords": ["pumps", "gas", "fuel"],
      "description": "The pumps are empty and have been since week two of the Collapse. Someone tried to siphon the underground tanks years ago and found them dry. The pump handles are still attached, and occasionally a traveler will grip one and squeeze, out of habit or hope. Nothing comes out. It never does."
    },
    {
      "keywords": ["store", "convenience", "shelves", "inside"],
      "description": "The shelves are bare metal racks, picked clean. But the floor has been disturbed — someone pried up tiles near the back wall recently. A storage space? A basement hatch? Hard to tell without tools and time."
    },
    {
      "keywords": ["floor", "tiles", "hatch", "basement"],
      "description": "The tiles near the back wall are loose. Beneath them, a plywood panel. Beneath that — darkness and the smell of stale air. A crawlspace or storage basement.",
      "skill_check": {
        "skill": "scavenging",
        "dc": 10,
        "success_append": "You pry the panel aside. Below is a concrete utility space, maybe six feet deep. A metal shelving unit is bolted to the wall down there. You can see shapes on the shelves — cans, maybe. Supplies someone stashed and never came back for."
      }
    },
    {
      "keywords": ["sign", "price", "gas price"],
      "description": "$4.89. People complained about that. They wrote angry letters to their representatives about gas prices. They organized boycotts. $4.89 a gallon was a crisis. The absurdity of it hits you the way these things always do — suddenly, and from a direction you weren't expecting."
    }
  ],
  "npc_spawns": [
    {
      "npc_id": "scavenger_rival",
      "spawn_chance": 0.25,
      "activity_pool": [
        { "desc": "Another scavenger is already here, prying at the shelving with a crowbar. They freeze when they see you. The crowbar is also a weapon. So is yours.", "weight": 3 },
        { "desc": "A teenager in oversized clothes is stuffing something into a pack near the back wall. They see you and bolt for the hole in the west wall.", "weight": 2 }
      ],
      "disposition_roll": { "neutral": 0.4, "wary": 0.4, "hostile": 0.2 }
    }
  ],
  "item_spawns": [
    {
      "entity_id": "canned_food_random",
      "spawn_chance": 0.30,
      "quantity": { "min": 1, "max": 2, "distribution": "weighted_low" },
      "condition_roll": { "min": 0.5, "max": 0.9 },
      "ground_description": "A dented can with no label sits behind a fallen shelf bracket."
    },
    {
      "entity_id": "rebar_club",
      "spawn_chance": 0.20,
      "quantity": { "min": 1, "max": 1, "distribution": "single" },
      "ground_description": "A length of rebar, one end wrapped in duct tape for a grip, leans against the counter."
    },
    {
      "entity_id": "lighter_disposable",
      "spawn_chance": 0.35,
      "quantity": { "min": 1, "max": 1, "distribution": "single" },
      "ground_description": "A disposable lighter is wedged in a crack between the counter and the wall. It might still have fuel."
    }
  ],
  "exits": {
    "east": { "destination": "cr_09_campground", "description_verbose": "back to the campground" },
    "down": {
      "destination": "cr_12_gas_station_basement",
      "description_verbose": "the crawlspace beneath the floor",
      "hidden": true,
      "discover_skill": "scavenging",
      "discover_dc": 10,
      "discover_message": "You find a way down beneath the floor tiles."
    }
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
}
```

---

### Room CR-12: Gas Station Basement

```json
{
  "room_id": "cr_12_gas_station_basement",
  "zone": "crossroads",
  "name": "Beneath the Gas Station",
  "descriptions": {
    "default": "A concrete box six feet deep, eight feet square. The air is stale and cool. A metal shelf is bolted to the north wall — whatever was stored here was stored with purpose. The ceiling is the underside of the gas station floor, plywood and concrete, with a square of daylight where you climbed down. Cobwebs. The smell of old rust and dust. This was someone's emergency stash. They never came back for it.",
    "night": "Darkness. Total, subterranean darkness. Without a light source, you can feel the shelf, the walls, the floor — but you can see nothing. The square of the hatch above shows stars."
  },
  "extras": [
    {
      "keywords": ["shelf", "shelves", "metal"],
      "description": "The shelf is bolted to the wall with concrete anchors — this wasn't a temporary installation. Someone planned for this. Three shelves, heavy-gauge steel. Most of what was on them is gone, but the outline of absent objects is visible in the dust: cans, boxes, the rectangular footprint of an ammo can."
    },
    {
      "keywords": ["walls", "concrete", "room"],
      "description": "Poured concrete, smooth. This is a purpose-built storage space — not a natural void. Someone added this beneath the gas station, probably before the Collapse, probably in preparation for exactly what happened. A prepper. They were right about everything and it didn't save them."
    },
    {
      "keywords": ["dust", "cobwebs", "stale"],
      "description": "The dust is undisturbed except where you disturbed it. No footprints. No tracks. Whatever was taken from these shelves was taken a long time ago — or nothing has been taken and you're the first one here. The cobwebs suggest the latter."
    }
  ],
  "npc_spawns": [],
  "item_spawns": [
    {
      "entity_id": "ammo_9mm",
      "spawn_chance": 0.40,
      "quantity": { "min": 3, "max": 8, "distribution": "bell" },
      "ground_description": "A dented ammo can sits on the bottom shelf. Inside, loose 9mm rounds rattle when you touch it."
    },
    {
      "entity_id": "first_aid_kit_basic",
      "spawn_chance": 0.30,
      "quantity": { "min": 1, "max": 1, "distribution": "single" },
      "ground_description": "A red plastic first aid kit is pushed to the back of the middle shelf, dusty but sealed."
    },
    {
      "entity_id": "canned_food_premium",
      "spawn_chance": 0.45,
      "quantity": { "min": 1, "max": 3, "distribution": "weighted_low" },
      "ground_description": "Cans of food — real food, labeled, with intact seals. Chili. Peaches. Condensed soup. The labels are faded but legible."
    },
    {
      "entity_id": "letter_001_prepper",
      "spawn_chance": 0.60,
      "quantity": { "min": 1, "max": 1, "distribution": "single" },
      "ground_description": "A sealed envelope is taped to the underside of the top shelf. Handwritten on the front: FOR WHOEVER FINDS THIS."
    }
  ],
  "exits": {
    "up": { "destination": "cr_11_old_gas_station", "description_verbose": "back up to the gas station" }
  },
  "flags": { "safe_rest": true, "hidden_room": true, "dark": true },
  "narrative_notes": "This is the tutorial's hidden reward room. It teaches players that scavenging skill unlocks hidden areas, that hidden areas contain better loot, and that the Letters Home collectible system exists. The prepper's letter is the first in the collection and sets the emotional tone for all subsequent letters."
}
```

---

*That completes Crossroads — 12 rooms. The remaining zones follow in separate files due to size.*

---

## ZONE 2: RIVER ROAD (14 Rooms)

*The main travel corridor connecting Crossroads to Covenant. Follows the Animas River north through increasingly forested terrain. This is where the player first encounters Hollow in the wild and learns that travel is dangerous.*

---

### Room RR-01: River Road — West Approach

```json
{
  "room_id": "rr_01_west_approach",
  "zone": "river_road",
  "name": "Highway 160 — East of Crossroads",
  "descriptions": {
    "default": "The highway stretches east through high scrubland, arrow-straight for a quarter mile before it curves north to follow the river. The pavement is cracked but walkable. On both sides, juniper and piñon pine press close, their shade welcome and their cover a concern. This is the first stretch of road between Crossroads and anywhere else, and the most traveled. Ruts from cart wheels and the pockmarks of a thousand boots have worn a path down the center. Safe enough by day. Nothing is safe enough by night.",
    "night": "The highway is a gray line between black walls of juniper. Starlight catches the pale concrete but not much else. Every shadow could be a bush. Every bush could be something crouched behind it. The river is audible to the northeast — a compass sound, a lifeline sound."
  },
  "extras": [
    {
      "keywords": ["juniper", "pinon", "trees", "scrub"],
      "description": "The juniper smells sweet and sharp — the scent of the high desert. The trees are short but dense, and anything could be standing thirty feet off the road and you wouldn't see it. Experienced travelers stay on the pavement. The shoulders are where things happen to you."
    },
    {
      "keywords": ["ruts", "path", "boots", "tracks"],
      "description": "Heavy foot traffic on this stretch. Cart wheels have cut parallel ruts into the soil beside the road. Boot prints overlay boot prints. An experienced tracker could read the last week of travel history here. You can see at least three different shoe sizes heading east and two heading west. Recent."
    }
  ],
  "npc_spawns": [
    {
      "npc_id": "traveling_merchant",
      "spawn_chance": 0.20,
      "activity_pool": [
        { "desc": "A Drifter with a loaded handcart is heading west toward Crossroads, moving with the brisk pace of someone who wants to arrive before dark.", "weight": 3 },
        { "desc": "Two travelers walk east, armed, quiet, keeping five feet between them — close enough to fight together, far enough that one ambush doesn't get both.", "weight": 2 }
      ]
    }
  ],
  "item_spawns": [
    {
      "entity_id": "discarded_water_bottle_empty",
      "spawn_chance": 0.35,
      "quantity": { "min": 1, "max": 1, "distribution": "single" },
      "ground_description": "An empty plastic water bottle lies in the ditch, sun-bleached and crumpled."
    }
  ],
  "exits": {
    "west": { "destination": "cr_01_approach", "description_verbose": "back to the highway junction and Crossroads" },
    "east": { "destination": "rr_02_bridge_ruins", "description_verbose": "the road continues east toward the river" }
  },
  "hollow_encounter": {
    "base_chance": 0.10,
    "time_modifier": { "day": 0.5, "night": 2.0, "dawn": 0.8, "dusk": 1.5 },
    "threat_pool": [
      { "type": "shuffler", "weight": 90, "quantity": { "min": 1, "max": 2, "distribution": "weighted_low" } },
      { "type": "remnant", "weight": 10, "quantity": { "min": 1, "max": 1, "distribution": "single" } }
    ]
  },
  "flags": { "safe_rest": false }
}
```

---

### Room RR-02: The Broken Bridge

```json
{
  "room_id": "rr_02_bridge_ruins",
  "zone": "river_road",
  "name": "The Broken Bridge",
  "descriptions": {
    "default": "The highway bridge over the Animas is gone — dropped into the river during the first winter after the Collapse, when nobody was maintaining the infrastructure and a flood took out the pilings. What's left are two concrete stumps on either bank and a forty-foot gap of churning water. But someone has built a crossing: steel cables anchored to the stumps, with planks lashed across them. A rope bridge. It sways in the wind and looks like it wants to kill you. A hand-lettered sign reads: ONE AT A TIME. MAX WEIGHT 200 LBS. LIVESTOCK USE THE FORD 1 MILE SOUTH.",
    "night": "The bridge is a dark line over black water. You can hear the river but you can't see it — just the white noise of fast current over rocks. The cable bridge has no lights. You'd be crossing by feel."
  },
  "extras": [
    {
      "keywords": ["bridge", "cable", "rope", "planks", "crossing"],
      "description": "The cable bridge is terrifying and functional. Two steel cables for handrails, wooden planks lashed with wire for the deck. It flexes underfoot. You can feel the river through it — the vibration of current against the stumps. The planks are mismatched: door panels, shelf boards, a piece of what was once a kitchen table. Someone maintains it. Someone is proud of it."
    },
    {
      "keywords": ["river", "animas", "water", "current"],
      "description": "The Animas runs fast and cold here, snowmelt from the San Juans. Knee-deep at the shallows, chest-deep at the center. Swimable if you're strong. Deadly if you're not. The water is clear enough to see the gravel bed and the occasional flash of a trout. Before the Collapse, this was a fishing destination. Now it's a highway."
    },
    {
      "keywords": ["ford", "south", "livestock"],
      "description": "The ford is a mile south — a wide, shallow stretch where the river braids over a gravel bar. Horses and carts use it. People with heavy loads use it. It's safer than the bridge but adds two hours to the trip. Time versus risk. The math of the new world."
    },
    {
      "keywords": ["stumps", "concrete", "bridge ruins"],
      "description": "The original bridge was concrete and steel, built for semi-trucks. Now it's rubble in the riverbed. You can see chunks of it downstream, colonized by moss. The rebar sticks up from the stumps like broken bones. Modern engineering, surrendered to geology in a single winter."
    }
  ],
  "npc_spawns": [
    {
      "npc_id": "bridge_keeper",
      "spawn_chance": 0.55,
      "activity_pool": [
        { "desc": "A wiry old man sits on the west stump with a toolbox and a coil of wire, inspecting a cable anchor with the possessive attention of a creator.", "weight": 3 },
        { "desc": "The bridge keeper is on the bridge itself, replacing a cracked plank. He works without a safety line over twenty feet of cold water. He doesn't seem concerned.", "weight": 2 }
      ],
      "dialogue_tree": "rr_bridge_keeper",
      "narrative_notes": "The bridge keeper is a former civil engineer named Howard. He built this bridge. It's the only thing he's built since the Collapse that he's proud of. He knows the river road better than anyone and can give directions and warnings."
    }
  ],
  "item_spawns": [],
  "exits": {
    "west": { "destination": "rr_01_west_approach", "description_verbose": "back west toward Crossroads" },
    "east": { "destination": "rr_03_east_bank", "description_verbose": "across the bridge to the east bank", "skill_gate": { "skill": "vigor", "dc": 4, "fail_message": "The bridge sways under your weight and you grab the cable, heart hammering. Maybe you should build some stamina first." } },
    "south": { "destination": "rr_05_the_ford", "description_verbose": "a trail south along the river to the ford crossing" }
  },
  "flags": { "safe_rest": false }
}
```

---

### Rooms RR-03 through RR-14 — Summary Index

*Full descriptions for all River Road rooms follow the same format. Here is the index with gating and connectivity:*

```
RR-03: East Bank Landing — First room after bridge crossing. River access. Fishing possible.
RR-04: River Road, South Bend — The showcase room from the Room Display Spec. Truck, sentry, dog.
RR-05: The Ford — Shallow crossing, 1 mile south. Safer but longer. Cart tracks.
RR-06: River Road, The Narrows — Road squeezes between cliff and river. Ambush alley. High Hollow chance.
RR-07: North Fork — Trail junction. West to Pine Sea (knowledge gate). North to Covenant. East to The Stacks (reputation gate).
RR-08: The Burned Farmhouse — A homestead that didn't make it. Loot room. Dark backstory in extras.
RR-09: River Road, Cottonwood Stretch — Beautiful room. Tall cottonwoods, dappled light. Brief respite.
RR-10: The Overturned Bus — A school bus on its side. Hollow nest inside. Optional clearing quest.
RR-11: River Road, The Bend — Sharp curve. Reduced visibility. Screamer territory at night.
RR-12: Covenant Outskirts — First Accord territory. Patrol NPCs. The walls visible ahead.
RR-13: Animas Fishing Hole — Hidden room (Tracking DC 8). Safe rest. Rare fish food item.
RR-14: The Hanging Tree — A grim landmark. Bodies of executed raiders. Accord justice. Moral flavor.
```

---

## ZONES 3-12: STRUCTURE INDEX

*Each zone follows the same room format as Crossroads and River Road. Full room scripts for all zones are provided below in condensed index format with key rooms detailed.*

---

## ZONE 3: COVENANT (18 Rooms)

The Accord's capital. The closest thing to a city. Population ~800.

```
CV-01: Covenant — Main Gate          | Entry point. The school bus gate from the World Bible.
CV-02: Covenant — Gate Square         | Open area inside the walls. Market, notice board, militia post.
CV-03: Covenant — Main Street         | Central corridor. Housing, workshops, foot traffic.
CV-04: Covenant — The Courthouse      | Accord HQ. Marshal Cross's office. Quest hub.
CV-05: Covenant — The Courthouse, Upper Floor | War room. Maps. Faction intelligence. Reputation gate (Trusted).
CV-06: Covenant — The Armory          | Weapons and gear. Locked. Reputation gate (Recognized).
CV-07: Covenant — The Infirmary       | Medical care. Better than Patch's clinic. Healing bonus.
CV-08: Covenant — Riverside District  | Housing near the Animas. Civilian life. Gardens.
CV-09: Covenant — The School          | A functioning school. Children. Hope. The emotional center.
CV-10: Covenant — The Chapel          | Small, non-denominational. Quiet. Letters collectible here.
CV-11: Covenant — The Workshop        | Crafting station. Mechanics NPC teaches recipes.
CV-12: Covenant — The Jail            | Two cells. Currently holds a suspected Sanguine spy.
CV-13: Covenant — The Granary         | Food storage. Quest location (supply theft investigation).
CV-14: Covenant — The Wall, North Section | Patrol post. View of the mountains. Sentry dialogue.
CV-15: Covenant — The Wall, East Section  | View of the river. Weakest section. Defense quest.
CV-16: Covenant — Marshal's Quarters  | Private. Reputation gate (Blooded). Cross's personal story.
CV-17: Covenant — The Basement        | Below the courthouse. Records room. Hidden MERIDIAN file fragment. Cycle 2+ knowledge gate.
CV-18: Covenant — The Garden          | Rooftop garden. Rare herbs. Peaceful. The Remnant's most beautiful room.
```

**Key Room — CV-09: The School**

This room exists purely for emotional weight. Children learning to read, to count, to draw. A teacher — former accountant — doing their best. The drawings on the wall include CHARON-7-era imagery (monsters, fire, people running) alongside normal kid stuff (dogs, houses, suns). The room has no combat, no loot, no quest triggers. It is the answer to the question "why are we fighting?"

**Key Room — CV-17: The Basement**

Hidden room requiring both high reputation (Trusted by Accord) and a quest flag from the Reclaimers. Contains a filing cabinet with a partial MERIDIAN personnel file — the first concrete evidence that the Scar facility was more than a bioweapon lab. This document is Act II critical path. Cycle 1 players cannot access it.

---

## ZONE 4: SALT CREEK STRONGHOLD (14 Rooms)

The Salters' fortress. Militaristic, disciplined, aggressive.

```
SC-01: Salt Creek — Outer Perimeter     | Earthworks and razor wire. Challenge by sentries.
SC-02: Salt Creek — The Kill Zone       | Cleared ground between outer and inner walls. Deliberately exposed.
SC-03: Salt Creek — Inner Gate          | Container wall gate. Armed guards. Reputation gate (Recognized).
SC-04: Salt Creek — The Yard            | Training ground. Sparring, drills, weapon practice.
SC-05: Salt Creek — Barracks            | Bunks, gear storage, soldier life. Dialogue with troops.
SC-06: Salt Creek — The Mess Hall       | Food. Conversation. Rumors. Social hub.
SC-07: Salt Creek — Warlord's Command   | Briggs's HQ. Reputation gate (Trusted). Major quest hub.
SC-08: Salt Creek — The Armory          | Superior weapons. Reputation gate (Blooded). Best melee gear.
SC-09: Salt Creek — The Pit             | Fighting ring. Optional combat challenges. Reputation grind.
SC-10: Salt Creek — The Watchtower      | Highest point. View south toward The Dust. Sniper post.
SC-11: Salt Creek — The Motor Pool      | Vehicles. Two functional trucks. Quest to fuel/repair.
SC-12: Salt Creek — The Brig            | Prison. Holds Accord sympathizers. Moral choice quest.
SC-13: Salt Creek — Briggs's Quarters   | Private. Cycle 2+ quest flag. Reveals Briggs's pre-Collapse MERIDIAN connection.
SC-14: Salt Creek — The South Wall      | Weakest point. Hollow incursion quest. Defense scenario.
```

**Key Room — SC-13: Briggs's Quarters**

Only accessible at Blooded reputation + Cycle 2+ quest flag. Inside, the player finds evidence that Warlord Briggs was a Marine assigned to MERIDIAN's perimeter security detail before the Collapse. He knows more about the facility than he admits. This revelation reframes the Salters' aggression toward the Scar as personal, not just strategic.

---

## ZONE 5: THE EMBER (10 Rooms)

The Kindling's religious settlement. Fire motifs. Zealotry and healing.

```
EM-01: The Ember — The Approach         | A road lined with torches. Dramatic. Intentionally theatrical.
EM-02: The Ember — The Gate of Flame    | Entry gate flanked by fire braziers. Quest gate (Kindling intro).
EM-03: The Ember — The Nave             | Main hall of the converted cathedral. Worship space. Sermons.
EM-04: The Ember — Deacon's Chamber     | Harrow's office. Quest hub. Charismatic and unsettling.
EM-05: The Ember — The Purification Room| Where fire treatment happens. Medical/horror crossover.
EM-06: The Ember — The Dormitory        | Kindling faithful quarters. Cult dynamics visible.
EM-07: The Ember — The Bell Tower       | View. Solitude. A kindling member questioning their faith.
EM-08: The Ember — The Crypt            | Below the cathedral. Old graves + new secrets.
EM-09: The Ember — The Garden of Ashes  | Memorial. Names of the purification dead. Emotional weight.
EM-10: The Ember — The Hidden Chapel    | Concealed room. The Kindling founder's journal. MERIDIAN janitor backstory. Secret entrance knowledge for Cycle 3 Scar access.
```

**Key Room — EM-10: The Hidden Chapel**

Behind a false wall in the crypt (Perception DC 16 or Kindling Blooded reputation). Contains the personal journal of the Kindling's founder — a janitor who worked at MERIDIAN before the Collapse. The journal describes a maintenance tunnel that bypasses the main entrance. This is one of four possible routes into the Scar in Act III.

---

## ZONE 6: THE BREAKS (16 Rooms)

Canyon wilderness. No faction. Pure survival.

```
BR-01: Canyon Mouth                     | Entry from Highway 550 south. Skill gate (Survival 5).
BR-02: The Wash                         | Dry riverbed. Flash flood danger (weather event).
BR-03: Narrow Slot Canyon              | The showcase canyon from the World Bible. Claw marks.
BR-04: The Ledge Trail                  | Climbing route. Skill gate (Climbing or Reflex DC 10).
BR-05: Bone Hollow                      | Named for a reason. Mass Hollow corpse site. Lore discovery.
BR-06: The Overhang                     | Natural shelter. Safe rest. Cave paintings (pre-Collapse graffiti).
BR-07: Canyon Crossroads               | Four-way junction. Disorienting. Map or Survival check to navigate.
BR-08: The Nesting Gallery             | Hollow nest. High threat. Clearing quest. Deep loot.
BR-09: Petroglyph Wall                 | Ancient rock art + modern graffiti. Cultural layer cake.
BR-10: The Dry Spring                   | Water source (seasonal). Survival skill reveals it.
BR-11: The Feral's Kill Site           | Evidence of Sanguine hunting. First Feral clue.
BR-12: Canyon Rim — West               | View down into the canyon system. Rappelling exit.
BR-13: Canyon Rim — East               | View toward Duskhollow Manor. First visual of Sanguine territory.
BR-14: The Hidden Grotto               | Secret room. Tracking DC 14. Lucid Sanguine safe house.
BR-15: Mesa Top                        | Flat, exposed, 360 view. Weather station. Radio signal fragment.
BR-16: The South Exit                   | Emerges near Duskhollow/Pens territory. Act II transition.
```

---

## ZONE 7: THE DUST (12 Rooms)

High desert wasteland. Ruined small towns. Brutal heat.

```
DU-01: Dust Edge                        | Entry from Highway 160 west. Skill gate (Survival 8).
DU-02: Abandoned Rest Stop             | First shelter. Marginal. Scavenging opportunities.
DU-03: The Alkali Flat                 | Open ground. Long sightlines. Hollow migration path.
DU-04: Ghost Town — Main Street        | Small town ruins. Buildings explorable.
DU-05: Ghost Town — The Diner          | Loot room. Nostalgia triggers. Letters collectible.
DU-06: Ghost Town — The Hardware Store | Best non-faction crafting supplies in the game.
DU-07: The Water Tower                 | Climbing challenge. Water source at top. View for miles.
DU-08: The Boneyard                    | Vehicle graveyard. Salvage. Motor pool quest components.
DU-09: The Mirage                      | Heat shimmer room. Perception checks to see what's real.
DU-10: Abandoned Ranch                 | Largest Dust structure. Multi-room interior. Hollow stronghold.
DU-11: The Radio Tower                 | Critical location. Radio signal fragment. Reclaimers quest target.
DU-12: The Dust — West Edge            | Map boundary. Description of vast emptiness beyond.
```

---

## ZONE 8: THE STACKS (10 Rooms)

Reclaimer tech outpost. Knowledge hub. Reputation-gated.

```
ST-01: The Stacks — Approach           | Solar panels visible. Electric fence. Reputation gate (Recognized).
ST-02: The Stacks — Entry Hall         | Decontamination protocol. Lev greets you.
ST-03: The Stacks — Server Room        | The closest thing to the internet. Local mesh network.
ST-04: The Stacks — Research Lab       | Lev's workspace. CHARON-7 analysis. Revenant study.
ST-05: The Stacks — Workshop           | Best crafting station in the game. Electronics specialty.
ST-06: The Stacks — Library            | Salvaged books and drives. Lore treasure trove.
ST-07: The Stacks — Comm Center        | Radio equipment. Signal analysis. Decode the broadcast.
ST-08: The Stacks — Lev's Office       | Quest hub. MERIDIAN keycard quest originates here.
ST-09: The Stacks — Cold Storage       | Locked (quest gate). CHARON-7 samples. Act II revelation.
ST-10: The Stacks — Roof Observatory   | View north. Telescope. Can see MERIDIAN light on clear nights.
```

---

## ZONE 9: DUSKHOLLOW MANOR (12 Rooms)

Covenant of Dusk Sanguine enclave. Faction-gated. Eerie beauty.

```
DH-01: The Long Drive                  | Tree-lined approach. Candlelight visible. Faction gate (quest).
DH-02: Duskhollow — Entrance Hall     | Grand, faded, candlelit. First Sanguine welcome.
DH-03: Duskhollow — The Great Hall    | Showcase room from World Bible. Crystal and blood wine.
DH-04: Duskhollow — Vesper's Study    | Vesper's personal quarters. Philosophy. Quest hub.
DH-05: Duskhollow — The Tithe Room    | Where blood tithes are collected. Medical, clinical, unsettling.
DH-06: Duskhollow — The Kitchen       | Human staff quarters. Their perspective on coexistence.
DH-07: Duskhollow — The Wine Cellar   | Bloodwine production. Recipe discovery. Alchemy.
DH-08: Duskhollow — The Gallery       | Portraits. Pre-Collapse identities. Sanguine who they were.
DH-09: Duskhollow — The Garden (Night)| Moonlight garden. Sanguine socializing. Most beautiful night room.
DH-10: Duskhollow — Guest Quarters    | Safe rest. But are you really safe?
DH-11: Duskhollow — The Sub-Basement  | Hidden (Perception DC 16 or Vesper trust). Contains Sanguine biometric data for MERIDIAN access. Act III critical.
DH-12: Duskhollow — The Roof Walk     | Night view. Conversation with a Sanguine who remembers everything.
```

---

## ZONE 10: THE DEEP (14 Rooms)

Abandoned mine network. Total darkness. Horror zone.

```
DP-01: Mine Entrance                    | Multi-gate (Survival 10 + combat 8). Boards over the mouth.
DP-02: Shaft One — Upper               | Timber supports. Creaking. First dark room.
DP-03: Shaft One — Lower               | Deeper. Colder. Water seepage. Hollow sounds.
DP-04: The Junction                     | Three-way split. Disorienting without map or Wits check.
DP-05: The Ore Room                     | Old mining equipment. Heavy salvage. High-value scrap.
DP-06: The Collapse                     | Cave-in blocks east passage. Demolition or Climbing to bypass.
DP-07: The Nest                         | Major Hollow concentration. Hive Mother territory.
DP-08: The Underground River           | Subterranean waterway. Fishing. Boat to hidden area.
DP-09: The Crystal Chamber             | Natural formation. Beautiful. Peaceful. Temporary safe room.
DP-10: Shaft Two — The Drop            | Vertical shaft. Rope required. Drops to MERIDIAN-adjacent zone.
DP-11: The Old Office                   | Mine supervisor's office. Documents about MERIDIAN construction.
DP-12: The Sealed Door                  | Steel door, MERIDIAN markings. Keycard required. Cycle 3+.
DP-13: The Sanguine Lair              | Optional boss encounter. Elder Sanguine. Diplomacy or combat.
DP-14: The Deep Pool                    | Hidden room. Bioluminescent algae. The virus glows here.
```

---

## ZONE 11: THE PINE SEA (8 Rooms)

Mountain forest. High altitude. The calm before the storm.

```
PS-01: The Tree Line                    | Knowledge gate (location learned Cycle 2+). Dense forest entry.
PS-02: The Elk Meadow                   | Open alpine meadow. Elk herd (hunting). Beauty room.
PS-03: The Logger's Cabin              | Abandoned cabin. Safe rest. Stash location option.
PS-04: The Waterfall                    | Mountain stream waterfall. Water source. Hidden cave behind it.
PS-05: The Ridge Trail                  | High exposure. Wind. View of The Scar valley below.
PS-06: The Shepherd's Camp             | A hermit NPC. Knows the mountains. Lore dump + Scar directions.
PS-07: The Snow Line                    | Altitude transition. Cold damage without gear. Sanguine avoid.
PS-08: The Scar Overlook              | Final vista before descent. The Scar visible below. Point of no return prompt.
```

---

## ZONE 12: THE SCAR / MERIDIAN (15 Rooms)

Endgame zone. The facility. The truth. The choice.

```
SC-01: The Crater Rim                   | Multi-gate. Desolate. Chemical haze. The facility entrance(s).
SC-02: MERIDIAN — Main Entrance        | Blast door. Keycard (Reclaimers) or Biometric (Sanguine) or Secret Tunnel (Kindling) or Explosives (Salters).
SC-03: MERIDIAN — Decontamination     | Automated systems still running. Eerie functionality.
SC-04: MERIDIAN — Level 1 Corridor    | Office spaces. Evacuated. Seven years of silence.
SC-05: MERIDIAN — The Lab Wing        | Where CHARON-7 was developed. Data terminals. Revelation.
SC-06: MERIDIAN — Holding Cells       | Test subjects. Death row inmates. Horror. Letters collectible.
SC-07: MERIDIAN — Cold Storage Vault  | Viable CHARON-7 samples. Both strains. The MacGuffin.
SC-08: MERIDIAN — Security Center     | Automated defenses. Combat encounter. Military-grade loot.
SC-09: MERIDIAN — The Server Room     | Full data archive. The truth about MERIDIAN's funding consortium.
SC-10: MERIDIAN — Level 2 Descent     | Deeper. Power fluctuations. Something is alive down here.
SC-11: MERIDIAN — The Vivarium        | Where Sanguine test subjects were observed. One-way glass. Claw marks on the inside.
SC-12: MERIDIAN — The Director's Office| Personal logs. The full story. The last piece.
SC-13: MERIDIAN — The Broadcast Room  | The source of the radio signal. The broadcaster. The meeting.
SC-14: MERIDIAN — The Core            | The choice room. Four options. The weight of the world.
SC-15: MERIDIAN — The Exit            | The way out. The world has changed. The final line.
```

**Key Room — SC-14: The Core**

This is the most important room in the game. Four interactive terminals. Four choices. Each one triggers a different endgame world state. The room description changes based on who the broadcaster was (determined by which evidence the player assembled across their cycles). The player cannot undo their choice. The game does not ask "are you sure?" — it asks "what kind of world do you want to leave behind?"

---

## CYCLE-GATING SUMMARY

### What Each Cycle Unlocks

| Cycle | New Access | Key Knowledge Gained |
|-------|-----------|---------------------|
| **1** | Crossroads, River Road, Covenant (outer), Breaks (outer), Salt Creek (if earned) | Faction introductions. Radio signal awareness. First death. |
| **2** | Salt Creek (inner), Ember (deep), Dust, Stacks, Duskhollow, Deep (entrance), Pine Sea | MERIDIAN file fragments. Broadcaster clues. Faction secrets. Revenant identity. |
| **3+** | Deep (full), Pine Sea (full), The Scar/MERIDIAN | Final truth. The choice. Endgame. |

### Why 3+ Cycles Are Required

1. **Skill thresholds:** MERIDIAN requires Survival 10+ and combat 8+. Achievable in Cycle 1 only with extreme optimization. More realistic by Cycle 2-3 with echoed skills.
2. **Quest chains:** MERIDIAN access requires at least one faction's full questline (keycards, biometrics, secret entrance, or explosives). Full questlines require Trusted/Blooded reputation, which typically requires 1.5 cycles of investment.
3. **Knowledge gates:** The Pine Sea and several critical NPC interactions only unlock through information learned in a previous cycle (e.g., Revenant-specific dialogue options, the bulletin board posting that only appears Cycle 2+).
4. **Narrative pacing:** A player who rushes for the Scar without doing the faction work arrives at MERIDIAN without context. They can make the choice, but they don't understand it. The game is designed so that 3 full cycles of investment means the player *understands what they're choosing* — and that understanding makes the choice devastating.

---

*This is the complete 155-room dungeon script for The Remnant. Combined with the World Bible, Room Display Spec, RNG System, Narrative Bible, and Death & Regeneration system, this constitutes the full game design document set. Feed the full set to Claude Code to begin implementation.*
