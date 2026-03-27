# THE REMNANT — Room Display Format Specification

> Addendum to the World Bible. Defines exactly what the player sees upon entering a room, and the data structures that drive it.

---

## THE CLASSIC MUD DISPLAY ORDER

When a player enters a room (or types `look`), the display follows this exact sequence. This order is drawn from the DikuMUD/CircleMUD/ROM tradition — the format that defined the genre in the late '80s and early '90s — adapted for The Remnant's tone and setting.

### Display Sequence

```
1. ROOM NAME (title line)
2. ROOM DESCRIPTION (narrative paragraph)
3. ENVIRONMENTAL NOTES (weather, time-of-day, ambient conditions)
4. EXTRA DETAILS (interactable/examinable objects baked into the room)
5. ITEMS ON GROUND (lootable/takeable objects)
6. NPCs PRESENT (characters in the room)
7. OTHER PLAYERS PRESENT (multiplayer presence)
8. EXITS (available directions)
9. STATUS BAR (optional HUD line — health, infection, time of day)
```

---

## LINE-BY-LINE SPECIFICATION

### 1. Room Name

A short, evocative title. One line. Always displayed. Functions as the room's identity — what the player remembers, what they reference when talking to other players.

**Format:** Displayed in a distinct style (bold, color, or bracketed — implementation decides).

**Rules:**
- Max ~60 characters
- No periods
- Title case
- Should be unique within its zone (two rooms in Covenant can't both be "The Gate")
- Can hint at mood but shouldn't editorialize ("The Dim Corridor" not "The Scary Corridor")

**Examples:**
```
Covenant — Main Gate
The River Road, South Bend
Duskhollow Manor — The Great Hall
The Breaks — Narrow Canyon
Crossroads Trading Post
An Abandoned Gas Station
The Deep — Mineshaft Entrance
```

---

### 2. Room Description

The narrative heart of the room. This is what separates a MUD from a database. The description is a 3-7 sentence paragraph (sometimes two short paragraphs) that tells the player where they are through sensory detail — what they see, hear, smell, and feel.

**Format:** Plain prose, flowing text. No bullet points. No headers.

**Rules:**
- Write in **second person present tense** ("You stand..." / "The walls are..." / "A cold wind pushes through...")
- Lead with the **dominant visual impression** — what hits the player's eyes first
- Include at least **two senses** (sight + one of: sound, smell, touch, temperature)
- Embed **interactable hints** — describe things the player can `look at` for more detail, but don't make it obvious they're interactive ("A rusted filing cabinet sits in the corner" not "You can LOOK AT the filing cabinet")
- **Time-of-day variants** are strongly encouraged for key rooms. At minimum: day version, night version. Dawn/dusk variants for important story locations.
- Keep it **under 500 characters** for standard rooms. Key story rooms can go up to ~800.
- End on something that creates **forward momentum** — a sound, a question, a hint of what lies beyond

**Voice calibration:**
- Terse and punchy in dangerous zones
- Lyrical and spacious in wilderness/beauty
- Claustrophobic and sensory in underground/enclosed spaces
- Unsettling and precise in Sanguine territories

**Example (standard room):**

```
The road is cracked asphalt with weeds pushing through every seam, the
center line long since faded to nothing. To the east, the Animas River
runs shallow over smooth stones, catching midday light. A rusted pickup
truck sits nose-down in the ditch on the west side, its windshield a
spiderweb of fractures. Something has been living in the cab — the
passenger door hangs open, and the seat is torn to stuffing.
```

**Example (time-of-day variant — night):**

```
The road is a black ribbon under starlight. You can hear the river to
the east but can't see it — just the sound of water over stone. The
wrecked pickup truck is a dark shape in the ditch, its open door
creaking in a wind you can barely feel. Something rustles in the cab.
You're not sure if it's fabric or breathing.
```

---

### 3. Environmental Notes

Systemic information displayed as a short line or two below the description. These are generated dynamically based on game state, not hand-written per room.

**Format:** Displayed in a muted or distinct style (italic, dimmed, bracketed).

**What triggers environmental notes:**

| Condition | Example Display |
|-----------|----------------|
| Weather | `A cold rain falls steadily.` |
| Temperature extreme | `The midday heat radiates off the asphalt in visible waves.` |
| Time of day | `The sun is low in the west. Dusk is coming.` |
| Darkness (no light source) | `It is pitch dark. You can barely see your hand in front of your face.` |
| Ambient sound | `You hear distant gunfire to the south.` |
| Hollow presence (nearby) | `A low, rhythmic moaning drifts from somewhere to the north.` |
| Radiation/contamination | `Your skin prickles. The air tastes metallic.` |
| Faction territory marker | `A faded Accord banner hangs from a lamppost.` |

**Rules:**
- Max 2 environmental notes at a time (don't spam the player)
- Prioritize the most immediately relevant/dangerous condition
- These should feel organic, not like system messages

---

### 4. Extra Descriptions (Examinable Details)

Objects, features, and details that are part of the room scenery — not items the player can pick up, but things they can `look at` for additional text. This is the DikuMUD "extra" system: keywords embedded in the room that respond to `look <keyword>`.

**Format:** NOT displayed in the main room output. The player discovers these by examining things mentioned in the room description. They are the reward for paying attention.

**Data structure (per room):**

```
extras: [
  {
    keywords: ["truck", "pickup", "pickup truck", "windshield"],
    description: "A 2028 Ford F-150, once white. The bed is empty
      except for a moldy sleeping bag and three empty cans of
      beans. No keys in the ignition. The gas gauge reads empty,
      but gauges lie."
  },
  {
    keywords: ["river", "animas", "water"],
    description: "The Animas is maybe twenty feet wide here, running
      fast and clear over a gravel bed. You could wade across, but
      the current would be up to your thighs. Good fishing water,
      if you had the time."
  },
  {
    keywords: ["weeds", "road", "asphalt", "cracks"],
    description: "Seven years of neglect. The road is more garden
      than highway now. You recognize dandelions, thistles, and
      something purple you can't name. Life doesn't care about
      the apocalypse."
  }
]
```

**Rules:**
- Every room should have 2-5 examinable extras
- Keywords should overlap with nouns used in the room description
- Extra descriptions should reward curiosity — add lore, mood, or gameplay hints
- Some extras can contain hidden skill checks: "You notice scratches on the lock" → player with Lockpicking sees "The scratches suggest a standard pin tumbler. Pickable, if you have the tools."
- Quest-critical extras should be hinted at in the room description but never spoiled

---

### 5. Items on Ground

Lootable, takeable objects currently in the room. Each item has a "ground description" — a one-line sentence describing the item as it appears lying in the room, not its inventory name.

**Format:** Each item gets its own line. Displayed below the room description.

**Rules:**
- Ground descriptions are **lowercase, one sentence, present tense**
- They should feel like they belong in the scene, not like a database entry
- Items should be described as they'd appear **in context** — a revolver on a desk vs. a revolver in a ditch feel different

**Examples:**

```
A hunting rifle leans against the truck's fender, stock cracked.
A sealed plastic bottle of water sits on the dashboard.
A crumpled road map is caught under the windshield wiper.
Three .22 rounds are scattered in the gravel.
```

**Data structure (item ground descriptions):**

```
item_id: "hunting_rifle_03"
ground_description: "A hunting rifle leans against the truck's fender, stock cracked."
name: "cracked hunting rifle"
```

**Multiple identical items:** Stack and quantify.
```
Three .22 rounds are scattered in the gravel.
```
Not:
```
A .22 round is in the gravel.
A .22 round is in the gravel.
A .22 round is in the gravel.
```

---

### 6. NPCs Present

Non-player characters currently in the room. Each NPC has a "room description" — what the player sees when the NPC is just standing (or sitting, or lurking) in the room. This is different from the NPC's `look at` description (which is what you get when you examine them specifically).

**Format:** Each NPC gets its own line or short sentence. Displayed after items.

**Rules:**
- Room descriptions should show the NPC **doing something** — not just existing
- They should hint at disposition: is this NPC hostile? Friendly? Nervous?
- Named/important NPCs get more descriptive room lines than generic ones
- Hostile NPCs that are unaware of the player should be described doing their thing; hostile NPCs that have spotted the player should reflect that

**Examples (named NPC):**
```
Marshal Adeline Cross stands near the gate, studying a hand-drawn map with
a sentry.
```

**Examples (generic NPC):**
```
An Accord sentry watches the road from the platform above, rifle across
her knees.
```

**Examples (hostile NPC, unaware):**
```
A Shuffler stands motionless in the intersection, its head cocked at an
angle that suggests a broken neck. It hasn't noticed you.
```

**Examples (hostile NPC, aware):**
```
A Shuffler turns toward you, jaw working soundlessly. It begins to move.
```

**Examples (Sanguine NPC):**
```
A pale figure sits in the wingback chair by the fireplace, watching you
with eyes that don't blink often enough.
```

---

### 7. Other Players Present

Other human players in the room.

**Format:** Simple presence line. One per player.

**Rules:**
- Show player name and a brief stance/status indicator
- If the player is in combat, note it
- If the player is sneaking and you fail the perception check, they don't appear at all

**Examples:**
```
Tomás is here, resting against the wall.
Elena "Wires" is here, examining something on the ground.
Cal "Dustmouth" is here, fighting a Brute!
```

---

### 8. Exits

Available directions the player can move. This is the navigation backbone.

**Format:** A single line at the bottom of the room display. Bracketed or prefixed.

**Rules:**
- Standard compass directions: north, south, east, west, up, down, northeast, southeast, northwest, southwest
- Non-standard exits for special cases: "enter", "climb", "crawl", "jump"
- **Obvious exits** are always shown
- **Hidden exits** are not shown unless the player has found them (via Search, Perception check, or quest flag)
- **Locked exits** are shown but marked: `south (locked)`
- **Dangerous exits** can optionally be marked: `north (the moaning is louder)`
- **Skill-gated exits** note the requirement: `up (requires Climbing)`

**Display format:**

```
[Exits: north  south  east (locked)  up (requires Climbing)]
```

Or in a more narrative style:

```
Obvious exits: north, south, east (a locked gate), up (a narrow ledge)
```

**Implementation note:** Support both `brief` mode (just direction words) and `verbose` mode (with short descriptions):

```
# Brief mode
[Exits: n  s  e  w]

# Verbose mode
[Exits: north (deeper into Covenant), south (the River Road),
 east (a locked gate leads to the armory), west (an alley)]
```

---

### 9. Status Bar (Optional HUD)

A persistent or semi-persistent line showing critical player stats. Classic MUDs displayed this as a prompt line. The Remnant should include survival-critical info.

**Format:** A compact single line, always visible at the bottom.

**Recommended fields:**

```
[HP: 45/60  Hunger: ▓▓▓░░  Thirst: ▓▓░░░  Infection: 2%  Time: Dusk]
```

Or more minimal:

```
<45hp 80hun 60thi 2%inf — Dusk>
```

**Rules:**
- Keep it under 80 characters (classic terminal width)
- Show only what's immediately actionable
- Infection % should always be visible as a constant reminder
- Time of day should always be visible (too many systems depend on it)
- Sanguine players swap Hunger/Thirst for Blood Satiation

---

## BRIEF MODE vs. VERBOSE MODE

Classic MUDs offered a `brief` toggle. In brief mode, repeat visits to a room only showed the room name, items, NPCs, players, and exits — skipping the full description. New rooms always showed the full description.

**The Remnant should support three modes:**

| Mode | What's Shown |
|------|-------------|
| **Verbose** (default) | Everything. Full description every time. |
| **Brief** | Room name + items + NPCs + players + exits. Description only on first visit or `look`. |
| **Compact** | Room name + exits only. For speed-running familiar areas. Items/NPCs on `look`. |

---

## FULL EXAMPLE — PUTTING IT ALL TOGETHER

What the player actually sees on their screen when they walk into a room:

```
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
The River Road, South Bend
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

The road is cracked asphalt with weeds pushing through every seam, the
center line long since faded to nothing. To the east, the Animas River
runs shallow over smooth stones, catching midday light. A rusted pickup
truck sits nose-down in the ditch on the west side, its windshield a
spiderweb of fractures. Something has been living in the cab — the
passenger door hangs open, and the seat is torn to stuffing.

The afternoon sun beats down. No clouds.

A hunting rifle leans against the truck's fender, stock cracked.
Three .22 rounds are scattered in the gravel.
A sealed plastic bottle of water sits on the dashboard.

An Accord sentry watches the road from the pickup bed, rifle across
her knees.
A mangy dog sleeps in the shade under the truck.

Tomás is here, studying the road south.

[Exits: north (toward Covenant)  south  east (river crossing — shallow)  west (overgrown trail)]

<45/60hp  hunger:▓▓▓░░  thirst:▓▓░░░  inf:2%  — Afternoon>
```

**What `look truck` would show:**

```
A 2028 Ford F-150, once white. The bed is empty except for a moldy
sleeping bag and three empty cans of beans. No keys in the ignition.
The gas gauge reads empty, but gauges lie.
```

**What `look sentry` would show:**

```
A woman in her thirties wearing a faded Accord armband and a
hand-stitched leather vest with steel plates sewn in. Her boots are
mismatched — one hiking, one military. She has the hollow-eyed look
of someone who hasn't slept enough in years but has gotten used to it.
The rifle is a bolt-action .308, well-maintained. She nods at you but
doesn't smile. Her eyes keep moving to the south road.
```

**What `look dog` would show:**

```
Some kind of shepherd mix, ribs showing, with a notched left ear and
a fresh scar across its muzzle. It's not really asleep — one eye
cracks open when you move. No collar. The sentry seems to know it.
```

---

## COMPLETE DATA MODEL — ROOM OBJECT

```json
{
  "room_id": "river_road_south_bend",
  "zone": "river_road",
  "name": "The River Road, South Bend",
  
  "descriptions": {
    "default": "The road is cracked asphalt with weeds pushing through every seam...",
    "night": "The road is a black ribbon under starlight...",
    "dawn": "Mist clings to the river and spills across the road in low sheets...",
    "dusk": "The truck casts a long shadow across the road. The river has gone from silver to copper..."
  },
  
  "extras": [
    {
      "keywords": ["truck", "pickup", "pickup truck", "f-150", "windshield"],
      "description": "A 2028 Ford F-150, once white..."
    },
    {
      "keywords": ["river", "animas", "water", "stones"],
      "description": "The Animas is maybe twenty feet wide here..."
    },
    {
      "keywords": ["weeds", "road", "asphalt", "cracks"],
      "description": "Seven years of neglect..."
    },
    {
      "keywords": ["cab", "seat", "door", "passenger door"],
      "description": "The cab smells like wet fur and something dead. The seat is shredded down to the springs. Claw marks on the dash — too small for a bear. Dog? Coyote? The glovebox is open and empty.",
      "skill_check": {
        "skill": "tracking",
        "dc": 12,
        "success_append": " The claw pattern is canine, but the spacing is wrong. Too wide. Whatever made these was bigger than any dog you've seen since the Collapse."
      }
    }
  ],
  
  "items": [
    {
      "item_id": "hunting_rifle_03",
      "ground_description": "A hunting rifle leans against the truck's fender, stock cracked.",
      "respawn_chance": 15,
      "max_load": 1
    },
    {
      "item_id": "ammo_22lr",
      "ground_description": "Three .22 rounds are scattered in the gravel.",
      "quantity": 3,
      "respawn_chance": 30,
      "max_load": 5
    },
    {
      "item_id": "water_bottle_sealed",
      "ground_description": "A sealed plastic bottle of water sits on the dashboard.",
      "respawn_chance": 10,
      "max_load": 1
    }
  ],
  
  "npcs": [
    {
      "npc_id": "accord_sentry_01",
      "room_description": "An Accord sentry watches the road from the pickup bed, rifle across her knees.",
      "room_description_night": "An Accord sentry crouches in the pickup bed, a dim lantern at her feet. She has her rifle up.",
      "disposition": "neutral",
      "dialogue_trigger": "talk sentry"
    },
    {
      "npc_id": "stray_dog_01",
      "room_description": "A mangy dog sleeps in the shade under the truck.",
      "room_description_night": "A dog growls softly from under the truck.",
      "disposition": "wary",
      "can_tame": true,
      "tame_skill": "survival",
      "tame_dc": 14
    }
  ],
  
  "exits": {
    "north": {
      "destination": "river_road_north_straight",
      "description_verbose": "toward Covenant",
      "hidden": false,
      "locked": false
    },
    "south": {
      "destination": "river_road_south_crossing",
      "description_verbose": null,
      "hidden": false,
      "locked": false
    },
    "east": {
      "destination": "animas_shallows_01",
      "description_verbose": "river crossing — shallow",
      "hidden": false,
      "locked": false,
      "skill_gate": {
        "skill": "survival",
        "dc": 8,
        "fail_message": "The current is stronger than it looks. You'd need to be more confident in the water."
      }
    },
    "west": {
      "destination": "overgrown_trail_01",
      "description_verbose": "overgrown trail",
      "hidden": true,
      "discover_skill": "tracking",
      "discover_dc": 10,
      "discover_message": "You notice faint boot prints turning off the road into the brush. A trail."
    }
  },
  
  "environmental": {
    "shelter": false,
    "water_source": true,
    "faction_territory": "the_accord",
    "threat_level": 2,
    "hollow_spawn": false,
    "ambient_sounds": {
      "day": ["river", "wind", "birds"],
      "night": ["river", "wind", "distant_howling"],
      "dawn": ["river", "birds"],
      "dusk": ["river", "crickets"]
    }
  },
  
  "flags": {
    "safe_rest": false,
    "no_combat": false,
    "campfire_allowed": true,
    "fast_travel_waypoint": false
  }
}
```

---

## DISPLAY RENDERING PSEUDOCODE

For Claude Code implementation:

```python
def render_room(room, player, mode="verbose"):
    output = []
    
    # 1. Room name (always shown)
    output.append(format_room_name(room.name))
    
    # 2. Room description (verbose or first visit)
    if mode == "verbose" or not player.has_visited(room.room_id):
        time_period = get_time_period()  # day, night, dawn, dusk
        desc = room.descriptions.get(time_period, room.descriptions["default"])
        output.append(desc)
        player.mark_visited(room.room_id)
    
    # 3. Environmental notes (max 2, prioritized)
    env_notes = generate_environmental_notes(room, get_weather(), get_time())
    for note in env_notes[:2]:
        output.append(format_environmental(note))
    
    # 4. Extra descriptions — NOT shown here. Triggered by 'look <keyword>'
    
    # 5. Items on ground
    if mode != "compact":
        for item in room.get_visible_items():
            if item.quantity > 1:
                output.append(item.ground_description_plural)
            else:
                output.append(item.ground_description)
    
    # 6. NPCs present
    if mode != "compact":
        time_period = get_time_period()
        for npc in room.get_present_npcs():
            desc_key = f"room_description_{time_period}"
            desc = getattr(npc, desc_key, npc.room_description)
            output.append(desc)
    
    # 7. Other players
    if mode != "compact":
        for other_player in room.get_visible_players(exclude=player):
            if other_player.is_sneaking and not player.perception_check(other_player.stealth):
                continue
            output.append(format_player_presence(other_player))
    
    # 8. Exits
    exits = build_exit_display(room, player, verbose=(mode != "compact"))
    output.append(exits)
    
    # 9. Status bar
    output.append(render_status_bar(player))
    
    return "\n\n".join(output)


def handle_look(target, room, player):
    """Handle 'look <keyword>' commands"""
    
    # Check room extras
    for extra in room.extras:
        if target.lower() in [k.lower() for k in extra.keywords]:
            desc = extra.description
            # Check for skill-gated bonus text
            if extra.skill_check:
                check = extra.skill_check
                if player.skill_check(check["skill"], check["dc"]):
                    desc += " " + check["success_append"]
            return desc
    
    # Check items in room
    for item in room.get_visible_items():
        if target.lower() in item.keywords:
            return item.examine_description
    
    # Check NPCs
    for npc in room.get_present_npcs():
        if target.lower() in npc.keywords:
            return npc.look_description
    
    # Check other players
    for other in room.get_visible_players():
        if target.lower() in other.get_look_keywords():
            return other.appearance_description
    
    return "You don't see that here."
```

---

## WRITING GUIDELINES FOR ROOM BUILDERS

These rules ensure consistency across all rooms in The Remnant:

1. **Show, don't tell.** "The walls are stained brown at waist height" not "The walls show signs of violence."

2. **One room, one dominant impression.** Every room should have a single thing the player remembers. The truck. The candlelight. The scratch marks. Don't compete with yourself.

3. **Ground descriptions earn their lines.** "A sword is here" is waste. "A short sword is driven point-first into the floorboard, still humming" is a reason to pick it up.

4. **NPCs are mid-action.** Never "An NPC is here." Always "An NPC is doing something specific."

5. **Exits suggest, they don't command.** "A narrow passage continues north" not "Go north to continue."

6. **Extras reward the curious.** The player who types `look scratches` should learn something the player who just passes through doesn't.

7. **Night changes everything.** If a room feels the same at midnight as it does at noon, you haven't finished writing it.

8. **Silence is a sound.** In a world full of danger, describing the absence of sound is as powerful as describing a noise.

9. **Stay in the world.** No fourth-wall breaks. No game-mechanic language in descriptions. "You feel exposed here" not "This is a PvP-enabled zone."

10. **Every room is someone's first room.** A new player could wander anywhere. Make sure every room teaches them how to read The Remnant.

---

*Append this document to the World Bible. Together they give Claude Code everything it needs to build and populate the room system.*
