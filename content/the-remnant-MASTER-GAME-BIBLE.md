# THE REMNANT — MASTER GAME BIBLE
## Version 1.0 — Complete Reference for Implementation

> This is the single canonical document for building The Remnant. It consolidates world lore, narrative structure, game mechanics, room display format, randomization systems, death/regeneration, and references the 250-room dungeon script. Feed this document and the accompanying room files to Claude Code.

---

# PART I: THE WORLD

## 1.1 — The Collapse

In 2031, a gene-editing pathogen designated CHARON-7 escaped from a joint military-pharmaceutical black site (codenamed MERIDIAN) buried in the Colorado Rockies. Originally designed as a controllable human augmentation program, CHARON-7 mutated during unauthorized live trials on death row inmates.

Within six weeks, 60% of the global population was infected.

**What the world believes:** CHARON-7 was a bioweapon accident. The military bombed the facility (The Scar) to contain it.

**What is true:** MERIDIAN was designed to create super-soldiers. The Sanguine mutation was the intended outcome. The Hollow were the failure state. The bombing was a cover-up. The facility is intact underground. Someone inside is broadcasting a radio signal.

The game is set in **2038** — seven years after the Collapse.

## 1.2 — The Three Species

### The Hollow (NPC/Enemy)
The infected masses. CHARON-7 rewired their limbic system into permanent predatory hunger while degrading the prefrontal cortex. They retain fragments of motor memory — a Hollow mechanic might fumble with wrenches, a Hollow soldier might shoulder a rifle it can't aim. This makes them unpredictable and deeply unsettling.

**Hollow Types:**

| Type | Description | Threat | Behavior at Pressure 1 | Behavior at Pressure 5 |
|------|------------|--------|------------------------|------------------------|
| Shuffler | Classic slow infected. Degraded motor function. Herds. | Low solo / High in numbers | Wanders. Attacks on proximity. | Flanks. Blocks exits. Retreats to rejoin group. |
| Remnant | Retains fragments of former skill. Unpredictable. | Medium | Uses old skills randomly. | Sets ambushes. Uses bait. Coordinates. |
| Screamer | Piercing vocalization draws other Hollow from wide radius. | Medium (force multiplier) | Screams when it sees you. | Waits until you're engaged, then screams. Blocks retreat first. |
| Brute | Muscle hypertrophy. Larger, stronger, slower to react. | High | Charges directly. | Throws objects. Uses environment. Breaks through walls. |
| Whisperer | Rare. Retains partial speech. Mimics phrases to lure prey. | Very High (psychological) | Mimics random phrases. | Holds conversations. Begs. Asks for help. Leads you into ambushes. |
| Hive Mother | Extremely rare. Pheromonal control over nearby Hollow. | Extreme | N/A (Pressure 4+ only) | Coordinates 15-25 Hollow in formation. |

### The Sanguine (Playable — Advanced)
1 in 10,000 infected didn't become Hollow — CHARON-7 restructured their brains into apex predators. Enhanced senses, inhuman speed, blood dependency. They are not supernatural. They are the virus's masterpiece.

**Traits:** Enhanced senses (hearing, smell, night vision), increased speed/strength, accelerated healing (hours, not seconds), photosensitivity (pain + debuff in daylight, not death), must consume human blood regularly or degrade, lifespan unknown.

**Silver:** Does something to them. Nobody knows why. Could be allergic reaction. Could be psychosomatic. Works regardless. Don't over-explain it.

### The Unturned (Playable)
Baseline humans. No enhancements, no infection. Scattered across fortified settlements, scavenger bands, and underground bunkers.

### The Revenants (Player Characters After Death)
Extraordinarily rare CHARON-7 response — the virus restarts the dead. The brain doesn't come back clean. Motor function and survival instinct persist; episodic memory and fine-grained skill degrade. Each revival is cumulative — Revenants who die many times show faded scars that glow, memories that belong to no one, moments of disorientation.

The horror: you are the virus's project, and you don't know what it's making.

## 1.3 — Factions

### Unturned Factions

| Faction | Philosophy | Base | Leader | Memory Rate |
|---------|-----------|------|--------|-------------|
| The Accord | Rebuild through cooperation and law | Covenant | Marshal Adeline Cross | 0.50 |
| The Salters | Survival through strength | Salt Creek Stronghold | Warlord Briggs | 0.30 |
| The Drifters | No allegiance, trade and move | Crossroads (mobile) | No single leader | 0.20 |
| The Kindling | Divine punishment; seek redemption through fire | The Ember | Deacon Harrow | 0.60 |
| The Reclaimers | Reverse-engineer old-world technology | The Stacks | Lev (head researcher) | 0.70 |

### Sanguine Factions

| Faction | Philosophy | Territory | Notes |
|---------|-----------|-----------|-------|
| Covenant of Dusk | Coexist via blood tithes | Duskhollow Manor | The "civilized" option. Memory Rate: 0.55 |
| The Red Court | Humans are livestock | The Pens | Ruthless, hierarchical. Memory Rate: 0.40 |
| The Ferals | Reject structure. Hunt. Feed. Move. | Nomadic | Closest to pure predator. |
| The Lucid | Retain human identity. Seek a cure. | Hidden | Tragic figures. Constantly hungry. |

## 1.4 — Geography

Set in the **Four Corners region** — where Colorado, New Mexico, Utah, and Arizona meet. Real geography: San Juan Mountains, Animas River, Mesa Verde, Shiprock.

### The 13 Zones (250 rooms total)

| Zone | Rooms | Act | Gate | Theme |
|------|-------|-----|------|-------|
| Crossroads | 18 | I | None (start) | Commerce, orientation |
| River Road | 22 | I | None | Travel, first Hollow encounters |
| Covenant | 28 | I-II | None (inner areas locked) | Civilization, law |
| Salt Creek Stronghold | 20 | I-II | Reputation (Salters ≥ Recognized) | Military, authority |
| The Ember | 16 | I-II | Quest gate | Faith, fire, zealotry |
| The Breaks | 22 | I-II | Skill (Survival ≥ 5) | Canyons, isolation |
| The Dust | 18 | II | Skill (Survival ≥ 8) | Desolation, ruin |
| The Stacks | 14 | II | Reputation (Reclaimers ≥ Recognized) | Technology, knowledge |
| Duskhollow Manor | 18 | II | Faction quest | Vampiric politics |
| The Pens | 14 | II-III | Multi-gate (quest + combat skill) | Horror, rescue |
| The Deep | 20 | II-III | Skill (Survival ≥ 10 + combat ≥ 8) | Underground horror |
| The Pine Sea | 12 | II-III | Knowledge gate (Cycle 2+) | Mountain beauty, respite |
| The Scar / MERIDIAN | 28 | III | Multi-gate (Cycle 3+) | Truth, choice |
| **TOTAL** | **250** | | | |

---

# PART II: THE NARRATIVE

## 2.1 — The Player's Origin

The player is a newcomer — arrived at the Four Corners drawn by a mysterious shortwave radio broadcast:

> *"...Scar site... containment breach... data survives... if you can read, if you can think, if you are still you... come to the Four Corners... the answer is here... repeating..."*

Character creation defines: background (pre-Collapse job → starting skill bonuses), survival method (alone/group/running/fighting → disposition), personal loss (drives a persistent side quest across all cycles).

**Personal Loss Options:**
- A child (name chosen) — evidence surfaces across cycles
- A partner (name chosen) — letters, sightings, rumors
- A community (town chosen) — can eventually visit the ruins
- Your own identity — amnesia; fragments return over time; converges with MERIDIAN storyline
- A promise (player-written) — the game weaves references into NPC dialogue

## 2.2 — Three-Act Structure

**Act I — Arrival (Cycles 1-2, ~80 rooms accessible)**
Theme: Survival and belonging. Learn factions, first Hollow encounter, first Sanguine encounter, choose a home base. Climax: Hollow herd overruns River Road. Settlement defense.

**Act II — Allegiance (Cycles 2-3, ~180 rooms accessible)**
Theme: Power, compromise, cost of safety. Deep faction questlines, moral dilemmas, MERIDIAN evidence gathering. Climax: Factions split on the Scar question. Player chooses who to walk with.

**Act III — The Scar (Cycle 3+, all 250 rooms)**
Theme: Truth, and what you do with it. Journey through MERIDIAN. Revelations about CHARON-7. The broadcaster. The choice.

## 2.3 — The Central Mystery (Layered Revelation)

**Layer 1:** MERIDIAN wasn't just a bioweapon lab. It was a human augmentation program. The Sanguine were the intended product. The Hollow were the failure.

**Layer 2:** The military didn't bomb MERIDIAN to sterilize it. They bombed it to bury evidence. The facility is intact underground. The radio signal comes from inside.

**Layer 3:** Someone survived inside MERIDIAN for seven years. The broadcaster's identity varies based on which evidence the player finds. Possible identities: Dr. Elias Vane (lead virologist), an AI system, a trapped Sanguine elder, or a group of sealed-in survivors.

## 2.4 — The Four Endings

**The Cure** — Develop and deploy a cure. Reverses Hollow infection. Strips Sanguine abilities. They don't consent. Infrastructure doesn't exist for mass distribution. Hope weaponized.

**The Weapon** — Targeted pathogen kills all CHARON-7 carriers. Hollow and Sanguine alike. Genocide or mercy. The quiet afterward isn't the same as peace.

**The Seal** — Destroy MERIDIAN entirely. No cure, no weapon. The world stays broken. Humanity adapts. Possibly the wisest choice. Definitely the quietest.

**The Throne** — Take MERIDIAN for yourself. Control the data. Become the gatekeeper. Every faction serves or fights you. The loneliest ending.

**Final line (all endings):** *What's left is what matters.*

## 2.5 — Narrative Side Threads

**The Tithe:** Covenant of Dusk blood-tithe system. Follows a specific family and Sanguine.
**The Kindling's Fire:** Harrow's purification experiments. 67% survival rate and climbing.
**The Last Doctor:** Dr. Ama Osei, Lucid Sanguine virologist seeking a cure.
**The Dog:** A stray that follows if treated kindly. No combat stats. Pure emotional investment. Only permanent death in the game.
**Letters Home:** 30+ handwritten letters scattered across the world. No mechanical value. Pure story.
**The Broadcaster:** Radio signal fragments collected from different locations. Story changes based on which fragments you find first.

## 2.6 — Key NPCs

| Name | Role | Faction | Location | Core Conflict |
|------|------|---------|----------|---------------|
| Marshal Adeline Cross | Accord leader | The Accord | Covenant | Iron-willed, fair, exhausted. Holds it together through character. |
| Warlord Briggs | Salter commander | The Salters | Salt Creek | Ex-Marine. Was MERIDIAN perimeter security. Knows more than he admits. |
| Vesper | Covenant of Dusk elder | Covenant of Dusk | Duskhollow | Former philosophy professor. Genuinely believes in coexistence. |
| Castellan Rook | Red Court enforcer | Red Court | The Pens | Views humans as cattle. Not cruel — unsentimental. |
| Deacon Harrow | Kindling high priest | The Kindling | The Ember | Charismatic, possibly mad. Purification rituals getting extreme. |
| Patch | Information broker / medic | Drifters | Crossroads | Knows everyone, owes no one. Trades medical care for secrets. |
| Dr. Ama Osei | Virologist | The Lucid | Hidden lab | Sanguine. Refuses to accept it. Brilliant, desperate. |
| Lev | Head researcher | Reclaimers | The Stacks | Studies Revenants. Has files on you. |
| The Wren | Red Court hunter | Red Court | Roaming | Former detective. The best tracker alive. Hates what he's become. |
| Elder Kai Nez | Diné community leader | Independent | Canyon settlement | Deeply wary of outsiders. Open to respectful trade. |
| Moth | Feral Sanguine legend | Ferals | Unknown | May not be real. Watches camps from treelines. Never attacks. |
| Howard | Bridge keeper | Independent | River Road | Former civil engineer. Built the rope bridge. Knows the river road. |
| Sparks | Radio technician | Drifters | Crossroads | Tracking the MERIDIAN signal. Obsessive, brilliant. |
| Marta | Food vendor | Drifters | Crossroads | Practical, sharp, maternal. First friendly NPC most players meet. |

---

# PART III: GAME MECHANICS

## 3.1 — Attributes

| Attribute | Description |
|-----------|------------|
| Vigor | Physical health, stamina, disease resistance |
| Grit | Mental toughness, fear resistance |
| Reflex | Speed, agility, ranged accuracy |
| Wits | Intelligence, perception, crafting |
| Presence | Charisma, intimidation, persuasion |
| Shadow | Stealth, deception, lockpicking |

## 3.2 — Skills

| Skill | Attribute | Echo Retention |
|-------|----------|---------------|
| Marksmanship | Reflex | 60-70% (Physical) |
| Brawling | Vigor | 60-70% (Physical) |
| Bladework | Reflex | 60-70% (Physical) |
| Scavenging | Wits | 30-40% (Cognitive) |
| Field Medicine | Wits | 30-40% (Cognitive) |
| Mechanics | Wits | 30-40% (Cognitive) |
| Tracking | Wits | 70-80% (Instinct) |
| Negotiation | Presence | 40-50% (Social) |
| Intimidation | Presence | 40-50% (Social) |
| Stealth | Shadow | 60-70% (Physical) |
| Lockpicking | Shadow | 60-70% (Physical) |
| Survival | Vigor | 70-80% (Instinct) |
| Electronics | Wits | 30-40% (Cognitive) |
| Lore | Wits | 30-40% (Cognitive) |
| Climbing | Vigor | 60-70% (Physical) |
| Blood Sense | Sanguine only | 50-60% |
| Daystalking | Sanguine only | 50-60% |
| Mesmerize | Sanguine only | 50-60% |

## 3.3 — Reputation System

| Level | Name | Effect |
|-------|------|--------|
| -3 | Hunted | Attack on sight |
| -2 | Hostile | Denied entry. Ambushed. |
| -1 | Distrusted | Limited access. Higher prices. |
| 0 | Unknown | Neutral. Must prove yourself. |
| +1 | Recognized | Basic trade and services |
| +2 | Trusted | Full access. Faction missions. |
| +3 | Blooded | Inner circle. Unique gear. Leadership quests. |

## 3.4 — Currency (Barter Economy)

| Trade Good | Nickname | Relative Value |
|-----------|----------|---------------|
| .22 LR ammunition | Pennies | 1x (base unit) |
| 9mm ammunition | Nines | 3x |
| Clean water (1L) | A clear | 2x |
| Antibiotics (1 dose) | Miracle | 50x |
| Salt (1 kg) | White | 5x |
| Sanguine blood (1 vial) | Red gold | 100x |

## 3.5 — Time of Day System

| Period | Effects |
|--------|---------|
| Dawn | Transition. Most faction activity. Trading, missions. |
| Midday | Safest from Sanguine. Hollow sluggish in heat. Best open travel. |
| Dusk | Transition. Tension rises. Sanguine begin stirring. |
| Night | Sanguine at full power. Hollow more active. Travel dangerous. |
| Deep Night (2-4 AM) | Maximum danger. Herds move. Sanguine hunt. |

## 3.6 — Infection System

Every human has an Infection Resistance stat. Exposure events: Hollow bite/scratch (major), contaminated food/water (moderate), Scar proximity (cumulative), Sanguine blood contact (minor). Failure triggers a degradation period with increasing debuffs, hallucinations, personality shifts before final turn.

---

# PART IV: DEATH & REGENERATION

## 4.1 — The Cycle

Death → Death Screen → The Between (memory allocation) → Rebirth → Changed World

## 4.1a — The Between (Narrative Arc)

The Between is not explained. It is not a loading screen dressed in metaphor. It is a place — or the closest word we have for whatever happens in the gap between dying and waking up again, changed.

**What the player experiences:**

The Between is presented as brief, disorienting fragments of text and sound before character creation/rebirth options appear. It should never feel comfortable. It should feel like something that is almost memory.

**Cycle 1:**
> *White. Not light — absence. You are not cold. You are not warm. You are aware of being aware, which means something is still running. There is a sound at the edge of the nothing: like breathing, but slower than breathing should be. Something is sorting through you.*

**Cycles 2–4:**
> *You've been here before. You don't remember it — you remember that you don't remember it. The breathing again. Slower. It feels like being read.*

**Cycles 5–9:**
> *This time you notice: the nothing has a texture. Not dark — the absence of contrast. The breathing isn't yours. Whatever is reading you is thorough. It takes the parts it wants. It leaves the rest.*
> *You try to hold something. The face of someone. A word. A direction you were walking.*
> *Some of it stays.*

**Cycles 10–14:**
> *You stop trying to hold on. You've learned: what the Between takes, it keeps. What survives, survives because it's too deep to reach.*
> *The breathing is familiar now. Not friendly. Familiar the way a long scar is familiar.*
> *Something here knows your name. You aren't sure you gave it.*

**Cycles 15–19:**
> *You wonder sometimes whether the Between remembers you the way you remember it.*
> *Probably not. It doesn't seem like the kind of thing that keeps notes.*
> *But there's a shape here now, at the edge — like something that waited.*

**Cycles 20+:**
> *You arrive here like coming home to a house that's been searched. Everything slightly wrong. Everything slightly less.*
> *The breathing: steady. It's been breathing since before you came. It'll keep breathing after.*
> *You have been here twenty times. It has never spoken. But tonight — just at the edge of waking — you think you hear it start to.*

**Design rules for The Between:**
- Never explain what it is. Current candidates (CHARON-7's distributed consciousness, the Hollow's collective dream state, an emergent property of the cycle mechanic, the facility's AI observing survivors) should all remain plausible.
- The text advances with cycle count, but subtly — a returning player should notice the shift, not be told about it.
- Sound design (if implemented): the "breathing" is infrasonic, almost subliminal. Players shouldn't be able to tell if they're hearing it or imagining it.
- At Cycle 20+, the almost-spoken word is never revealed in The Between itself. It is revealed only inside MERIDIAN, if the player reaches a specific room and has the right investigation flag. The word is the broadcaster's name.

## 4.2 — Inheritance

| Element | Persistence |
|---------|------------|
| Skill Echoes | Partial (60-80% physical, 30-40% cognitive, 70-80% instinct) |
| Faction Memory | Partial (varies by faction, 20-70%) |
| World State | Full (quest completions, events persist) |
| Discovered Map | Full |
| Letters Collected | Full |
| Stash Items | Full (20-40 slot persistent cache) |
| Carried Items | LOST (everything on person at death) |
| Currency | 10-20% survives |
| The Dog | Conditional (based on kindness counter) |

## 4.3 — Memory Slots

Base: 3. +1 per 5 cycles (max +4). Maximum: 7. Each slot boosts one skill category's retention by +15%.

## 4.4 — World Pressure (Scaling)

| Pressure | Cycles | Effect |
|----------|--------|--------|
| 1 — Quiet | 1-2 | Base spawns. Shufflers dominate. |
| 2 — Stirring | 3-5 | Remnants frequent. Mixed Hollow groups. |
| 3 — Tense | 6-10 | Brutes appear. Sanguine hunting parties. |
| 4 — Volatile | 11-15 | Whisperers real threat. Hollow pack tactics. |
| 5 — Critical | 16+ | Hive Mothers. Settlement overruns. Elder Sanguine. |

Stat scaling is minor (8% HP, 5% damage, 10% awareness per level). Real difficulty is compositional — harder combinations and smarter behaviors.

---

# PART V: ROOM DISPLAY FORMAT

## 5.1 — Display Sequence

```
1. ROOM NAME
2. ROOM DESCRIPTION (narrative paragraph, time-of-day variants)
3. ENVIRONMENTAL NOTES (weather, time, ambient — max 2)
4. EXTRA DETAILS (hidden — triggered by 'look <keyword>')
5. ITEMS ON GROUND (lootable, one-line ground descriptions)
6. NPCs PRESENT (mid-action descriptions)
7. OTHER PLAYERS
8. EXITS (direction + verbose description)
9. STATUS BAR (HP, hunger, thirst, infection%, time)
```

## 5.2 — Display Modes

| Mode | Shows |
|------|-------|
| Verbose (default) | Everything, full description every time |
| Brief | Room name + items + NPCs + exits (description on first visit or `look`) |
| Compact | Room name + exits only |

## 5.3 — Writing Rules

1. Show, don't tell. 2. One dominant impression per room. 3. Ground descriptions earn their lines. 4. NPCs are mid-action, never just "standing here." 5. Exits suggest, don't command. 6. Extras reward the curious. 7. Night changes everything. 8. Silence is a sound. 9. Stay in the world — no fourth-wall breaks. 10. Every room is someone's first room.

---

# PART VI: RANDOMIZATION

## 6.1 — Core Principle

Nothing is guaranteed. Every entity rolls. Hard cap: 0.95 — nothing is ever 100%.

## 6.2 — Six Randomization Layers

1. **Item Spawns** — spawn_chance (0.01-0.85), quantity roll, condition roll
2. **NPC Spawns** — spawn_chance + activity pools + disposition rolls
3. **Hollow Encounters** — threat pool weighted by type, awareness roll, activity pool
4. **Environmental** — weather, ambient sounds (weighted pools with null = silence)
5. **Extra Variants** — description_pool on examinable details, persistence per session/tick
6. **Room Fragments** — template slots with weighted text options in base descriptions

## 6.3 — Modifier Stacking

All modifiers multiplicative: `final = base * time * weather * noise * reputation`

## 6.4 — Spawn Tiers

| Item Type | Typical Chance |
|-----------|---------------|
| Junk/flavor | 0.60-0.85 |
| Basic supplies | 0.20-0.40 |
| Ammunition | 0.10-0.25 |
| Weapons | 0.08-0.15 |
| Quality weapons | 0.02-0.08 |
| Rare items | 0.01-0.04 |
| Legendary | 0.001-0.005 |

## 6.5 — Distribution Types

`flat` (equal chance), `weighted_low` (skews toward min), `weighted_high` (skews toward max), `bell` (clusters midpoint), `single` (exactly 1 if spawns)

---

# PART VII: ROOM DATA MODEL

## 7.1 — Complete Room Schema

```json
{
  "room_id": "string — unique identifier",
  "zone": "string — zone name",
  "name": "string — display title (max 60 chars, title case, no period)",
  "act": "int — 1, 2, or 3",
  "cycle_gate": "int or null — minimum cycle to access",
  
  "descriptions": {
    "default": "string — primary room description",
    "night": "string — night variant",
    "dawn": "string — dawn variant (optional)",
    "dusk": "string — dusk variant (optional)"
  },
  
  "extras": [
    {
      "keywords": ["array", "of", "trigger", "words"],
      "description": "string — what the player sees on 'look <keyword>'",
      "description_pool": "array (optional) — weighted variants",
      "skill_check": {
        "skill": "string",
        "dc": "int",
        "success_append": "string — additional text on skill pass"
      },
      "cycle_gate": "int (optional) — only appears after N cycles",
      "quest_gate": "string (optional) — only appears if quest flag set"
    }
  ],
  
  "npc_spawns": [
    {
      "npc_id": "string",
      "spawn_chance": "float 0.0-0.95",
      "spawn_type": "anchored | patrol | wanderer | event | unique",
      "quantity": { "min": "int", "max": "int", "distribution": "string" },
      "time_modifier": { "day": "float", "night": "float", "dawn": "float", "dusk": "float" },
      "activity_pool": [
        { "desc": "string — room description when present", "weight": "int", "time_restrict": "array (optional)" }
      ],
      "disposition_roll": { "friendly": "float", "neutral": "float", "wary": "float", "hostile": "float" },
      "dialogue_tree": "string (optional)",
      "quest_giver": "array (optional)",
      "trade_inventory": "array (optional)"
    }
  ],
  
  "item_spawns": [
    {
      "entity_id": "string",
      "spawn_chance": "float",
      "quantity": { "min": "int", "max": "int", "distribution": "string" },
      "condition_roll": { "min": "float", "max": "float" },
      "ground_description": "string — how item appears in room",
      "time_modifier": "object (optional)",
      "depletion": { "cooldown_minutes": { "min": "int", "max": "int" }, "respawn_chance": "float" }
    }
  ],
  
  "exits": {
    "direction": {
      "destination": "string — target room_id",
      "description_verbose": "string — exit description",
      "hidden": "bool",
      "locked": "bool",
      "locked_by": "string — item_id of key (optional)",
      "skill_gate": { "skill": "string", "dc": "int", "fail_message": "string" },
      "reputation_gate": { "faction": "string", "min_level": "int" },
      "quest_gate": "string — quest flag required",
      "cycle_gate": "int — minimum cycle",
      "discover_skill": "string (for hidden exits)",
      "discover_dc": "int",
      "discover_message": "string"
    }
  },
  
  "hollow_encounter": {
    "base_chance": "float",
    "time_modifier": "object",
    "noise_modifier": "float",
    "threat_pool": [
      { "type": "string", "weight": "int", "quantity": "object" }
    ],
    "awareness_roll": { "unaware": "float", "aware_passive": "float", "aware_aggressive": "float" },
    "activity_pool": { "type_name": [ { "desc": "string", "weight": "int" } ] }
  },
  
  "environmental_rolls": {
    "ambient_sound_pool": { "day": "array", "night": "array" },
    "ambient_count": { "min": "int", "max": "int" },
    "flavor_lines": [ { "line": "string", "chance": "float", "time": "array or null", "skill_gate": "object (optional)" } ]
  },
  
  "flags": {
    "safe_rest": "bool",
    "no_combat": "bool",
    "campfire_allowed": "bool",
    "fast_travel_waypoint": "bool",
    "tutorial_zone": "bool",
    "dark": "bool",
    "healing_bonus": "float (optional)",
    "hidden_room": "bool",
    "scavenging_zone": "bool",
    "quest_hub": "bool"
  },
  
  "narrative_notes": "string — implementation guidance for Claude Code (not player-facing)"
}
```

---

# PART VIII: ZONE MAP & CONNECTIVITY

```
                              [THE SCAR / MERIDIAN] (28 rooms)
                                    |
                              [THE PINE SEA] (12 rooms)
                                  /    \
                     [THE STACKS]       [THE DEEP] (20 rooms)
                      (14 rooms)  \       |
                          |        \      |
              [COVENANT] --- [RIVER ROAD] --- [SALT CREEK]
              (28 rooms)     (22 rooms)       (20 rooms)
                  |              |                 |
             [THE EMBER]    [CROSSROADS]      [THE DUST]
             (16 rooms)     (18 rooms)        (18 rooms)
                                |
                           [THE BREAKS] (22 rooms)
                              /    \
                   [DUSKHOLLOW]     [THE PENS]
                   (18 rooms)      (14 rooms)
```

### Cycle Access Matrix

| Zone | Cycle 1 | Cycle 2 | Cycle 3+ |
|------|---------|---------|----------|
| Crossroads | FULL | FULL | FULL |
| River Road | FULL | FULL | FULL |
| Covenant | Outer 18/28 | 24/28 | FULL |
| Salt Creek | Gate: Rep | Inner opens | FULL |
| The Ember | Gate: Quest | Deep opens | FULL |
| The Breaks | Outer 12/22 | 18/22 | FULL |
| The Dust | LOCKED | FULL | FULL |
| The Stacks | LOCKED | FULL | FULL |
| Duskhollow | LOCKED | FULL | FULL |
| The Pens | LOCKED | Gate: Quest+Skill | FULL |
| The Deep | LOCKED | Outer 10/20 | FULL |
| The Pine Sea | LOCKED | FULL | FULL |
| The Scar | LOCKED | LOCKED | FULL |

---

# PART IX: QUEST FRAMEWORK

## 9.1 — Main Quest Chain

| Quest | Act | Zone | Summary | Reward |
|-------|-----|------|---------|--------|
| The Signal | I | Crossroads | Investigate the radio broadcast with Sparks | Radio fragment #1, Reclaimers introduction |
| A Place to Stand | I | Any settlement | Establish reputation with first faction | Home base, basic services |
| The Herd | I | River Road | Survive/defend against Hollow herd event | Act I climax, faction reputation |
| Fragments | II | Multiple | Gather MERIDIAN evidence from 3+ factions | Understanding of what MERIDIAN was |
| The Expedition | II | Multiple | Secure MERIDIAN access (keycard/biometric/tunnel/explosives) | Scar access method |
| The Descent | III | The Scar | Enter and navigate MERIDIAN | Revelations |
| The Broadcaster | III | MERIDIAN | Meet whoever is behind the signal | The truth |
| The Choice | III | MERIDIAN Core | Choose the ending | World state transformation |

## 9.2 — Faction Quest Chains (Each 8-12 quests)

**The Accord:** Law enforcement, infrastructure, diplomacy. Culminates in blood-tithe treaty negotiation.
**The Salters:** Military operations, territory expansion. Culminates in Sanguine enclave raid.
**The Kindling:** Faith, purification experiments. Culminates in discovering the MERIDIAN tunnel.
**The Reclaimers:** Technology recovery, signal analysis. Culminates in obtaining MERIDIAN keycards.
**Covenant of Dusk:** Coexistence politics, blood economy. Culminates in obtaining Sanguine biometrics.

## 9.3 — Side Quest Categories

1. Survival — food, water, medicine, shelter
2. Faction Politics — negotiate, spy, sabotage
3. Mystery — CHARON-7 lore, MERIDIAN clues
4. Rescue — people taken, lost, trapped
5. Moral Dilemmas — no clean answers
6. Exploration — ruin delving, cache finding
7. Personal — the player's loss thread

---

# PART X: IMPLEMENTATION NOTES

## 10.1 — For Claude Code

1. **Parse this document first** as the canonical reference for all world rules, tone, and mechanics.
2. **Parse the room files** (Parts A through M) for the complete 250-room dungeon.
3. **Room files are the source of truth** for room data. This master bible defines the systems; the room files define the content.
4. **Every room must follow the Room Schema** in Part VII exactly.
5. **Every NPC must have an activity pool** — no NPC is ever just "standing here."
6. **Every item must have a ground description** — no item is ever just "a sword is here."
7. **Randomization is non-negotiable.** Nothing spawns at 100%. Hard cap 0.95.
8. **Time-of-day variants** are required for all story-critical rooms. Encouraged for all rooms.
9. **Extras should reward curiosity.** Minimum 2 per room. Target 3-5 for key rooms.
10. **Tone is everything.** Reread Part I Section 1.4 voice guidelines before generating any content.

## 10.2 — Voice Guidelines

- Terse and punchy in dangerous zones
- Lyrical and spacious in wilderness/beauty
- Claustrophobic and sensory underground
- Unsettling and precise in Sanguine territories
- Dark humor welcome. Gallows wit. Survivors laugh or they break.
- No "thee/thou." This world had iPhones seven years ago.
- Second person present tense for room descriptions
- Lead with dominant visual, include 2+ senses
- Under 500 chars for standard rooms, up to 800 for key rooms

## 10.3 — World Rules (Canonical)

1. CHARON-7 is not magic. Everything has a biological explanation.
2. Sunlight weakens Sanguine but doesn't kill them.
3. There is no known cure. Whether one can be developed is the central mystery.
4. The Hollow are not mindless — they're reduced. Fragments remain.
5. Silver does something to the Sanguine. Don't over-explain it.
6. Humanity is not doomed. Children are born. Gardens are planted.
7. The Four Corners setting uses real geography.
8. Player choice matters. Faction reputation creates different experiences.
9. The hard cap is 0.95. Nothing is certain. Uncertainty is the engine.

---

*This master bible is complete. The accompanying room files (Parts A through M) contain the full 250-room dungeon script. Together they are the complete implementation blueprint for The Remnant.*

*What's left is what matters.*
