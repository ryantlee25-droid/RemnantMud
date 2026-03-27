# THE REMNANT — Randomization & Procedural Presence System

> Addendum to the World Bible. Nothing is guaranteed. Every room is a dice roll. This document defines the RNG layer that governs what exists, what appears, and what happens in every room on every visit.

---

## CORE PRINCIPLE

**No room should ever feel the same twice.**

Every entity in a room — items, NPCs, extras, environmental conditions, ambient sounds, even descriptive flavor lines — is governed by probability, not certainty. The player should never walk into a room and know exactly what they'll find. Scarcity is real. Danger is unpredictable. The world breathes.

The only exceptions are **structural fixtures**: walls, terrain, exits, and permanent installations (e.g., the gate of Covenant doesn't vanish). Everything else rolls.

---

## THE SPAWN TABLE FORMAT

Every entity that can appear in a room uses a **spawn entry**. A spawn entry is not the entity itself — it's the *chance* of the entity.

```json
{
  "entity_id": "hunting_rifle_03",
  "entity_type": "item",
  "spawn_chance": 0.15,
  "quantity": { "min": 0, "max": 1, "distribution": "flat" },
  "condition_roll": { "min": 0.1, "max": 1.0 },
  "time_modifier": {
    "day": 1.0,
    "night": 0.5,
    "dawn": 0.8,
    "dusk": 0.8
  },
  "faction_modifier": {
    "the_accord": 0.7,
    "the_salters": 1.3
  },
  "depletion": {
    "enabled": true,
    "cooldown_minutes": 180,
    "global_stock": null
  },
  "group_id": null,
  "weight_in_group": null
}
```

---

## RANDOMIZATION LAYERS

Every room runs these rolls in order when a player enters (or when the room refreshes on a tick cycle):

### Layer 1: Item Spawns

No item is guaranteed. Every item in every room has a `spawn_chance` between 0.0 and 1.0.

**Spawn chance examples:**

| Item Type | Typical spawn_chance | Reasoning |
|-----------|---------------------|-----------|
| Junk/flavor items (empty cans, rags) | 0.60 - 0.85 | Common debris, makes the world feel lived-in |
| Basic supplies (boiled rations, purification tabs) | 0.20 - 0.40 | Available but never abundant |
| Ammunition (.22 LR) | 0.10 - 0.25 | Scarce enough to matter |
| Weapons (knives, bats) | 0.08 - 0.15 | Finding one is a small event |
| Quality weapons (rifles, compound bows) | 0.02 - 0.08 | Finding one is a story |
| Rare items (military gear, medical supplies) | 0.01 - 0.04 | Finding one changes your day |
| Legendary items (suppressed weapons, CHARON-7 samples) | 0.001 - 0.005 | Finding one changes your week |

**Quantity rolls:** When an item does spawn, the quantity is also random.

```json
"quantity": {
  "min": 1,
  "max": 6,
  "distribution": "weighted_low"
}
```

Distribution types:
- `"flat"` — equal chance of any value between min and max
- `"weighted_low"` — skews toward min (most common for ammo, supplies)
- `"weighted_high"` — skews toward max (rare, used for junk piles)
- `"bell"` — clusters around midpoint (used for moderate-value items)
- `"single"` — always exactly 1 if it spawns at all

**Condition rolls:** Items that spawn also roll for condition/durability.

```json
"condition_roll": { "min": 0.1, "max": 1.0 }
```

A hunting rifle at condition 0.95 is nearly pristine. At 0.15 it might jam every other shot. This means even when two players find "the same" rifle, they have different experiences.

---

### Layer 2: NPC Spawns

NPCs are not furniture. They come and go.

**NPC spawn categories:**

| Category | Behavior | Example |
|----------|----------|---------|
| **Anchored** | High spawn chance (0.70-0.95), always in same room. The "expected" residents. | Marshal Cross in Covenant HQ |
| **Patrol** | Moderate chance (0.30-0.60) in each room of a patrol route. Moves between rooms on ticks. | Accord sentries on the River Road |
| **Wanderer** | Low chance (0.05-0.20) per room in a defined zone. Could be anywhere. | A Drifter trader, a stray dog |
| **Event** | Near-zero base chance (0.01-0.05), boosted by triggers (time, quest state, world events). | A Feral Sanguine during deep night, a Hive Mother |
| **Unique** | Spawn controlled by quest flags and world state, not pure RNG. But WHEN they appear in a room, their exact position/activity is randomized. | Dr. Ama Osei, The Wren |

**NPC spawn entry:**

```json
{
  "npc_id": "accord_sentry_01",
  "spawn_chance": 0.45,
  "spawn_type": "patrol",
  "patrol_rooms": ["river_road_north", "river_road_south_bend", "river_road_crossing"],
  "quantity": { "min": 1, "max": 2, "distribution": "weighted_low" },
  "time_modifier": {
    "day": 1.0,
    "night": 1.5,
    "dawn": 0.8,
    "dusk": 1.2
  },
  "activity_pool": [
    { "activity": "watches the road from the pickup bed, rifle across her knees", "weight": 3 },
    { "activity": "is crouched behind the truck, cleaning her rifle", "weight": 2 },
    { "activity": "is talking quietly with a traveler", "weight": 1 },
    { "activity": "is asleep against the truck wheel, rifle in her lap", "weight": 1, "time_restrict": ["night", "dawn"] }
  ],
  "disposition_roll": {
    "friendly": 0.3,
    "neutral": 0.5,
    "wary": 0.15,
    "hostile": 0.05
  }
}
```

**Activity pools:** When an NPC spawns, they roll from their activity pool to determine their room description. This means the sentry isn't always "watching the road" — sometimes she's cleaning her rifle, sometimes she's asleep. The `weight` value controls probability within the pool. The `time_restrict` field limits certain activities to specific times.

**Disposition rolls:** Some NPCs have variable starting disposition. That sentry has a 5% chance of being hostile on any given encounter — maybe she's had a bad day, maybe she mistakes you for a threat. This creates organic tension.

---

### Layer 3: Hollow Spawns (Enemy Encounters)

Hollow encounters use a **threat pool** system rather than fixed spawns. Each room has a threat level and a pool of possible Hollow types. The system rolls:

1. **Does an encounter happen at all?** (base chance modified by time, noise, player actions)
2. **What type?** (weighted roll from the room's threat pool)
3. **How many?** (quantity roll based on type)
4. **What state are they in?** (aware/unaware, activity, positioning)

```json
{
  "room_id": "river_road_south_bend",
  "hollow_encounter": {
    "base_chance": 0.12,
    "time_modifier": {
      "day": 0.6,
      "night": 1.8,
      "dawn": 0.9,
      "dusk": 1.3
    },
    "noise_modifier": 0.15,
    "threat_pool": [
      {
        "type": "shuffler",
        "weight": 60,
        "quantity": { "min": 1, "max": 4, "distribution": "weighted_low" }
      },
      {
        "type": "remnant",
        "weight": 25,
        "quantity": { "min": 1, "max": 2, "distribution": "single" }
      },
      {
        "type": "screamer",
        "weight": 10,
        "quantity": { "min": 1, "max": 1, "distribution": "single" }
      },
      {
        "type": "brute",
        "weight": 4,
        "quantity": { "min": 1, "max": 1, "distribution": "single" }
      },
      {
        "type": "whisperer",
        "weight": 1,
        "quantity": { "min": 1, "max": 1, "distribution": "single" }
      }
    ],
    "awareness_roll": {
      "unaware": 0.55,
      "aware_passive": 0.30,
      "aware_aggressive": 0.15
    },
    "activity_pool": {
      "shuffler": [
        { "desc": "stands motionless in the road, head cocked at an angle that suggests a broken neck", "weight": 3 },
        { "desc": "is on its knees in the ditch, pawing at something in the dirt", "weight": 2 },
        { "desc": "shuffles in a slow circle near the truck, bumping against the fender on each pass", "weight": 2 },
        { "desc": "sits slumped against a road sign, jaw working soundlessly", "weight": 1 }
      ],
      "remnant": [
        { "desc": "stands near the truck with its hand on the door handle, opening and closing it. Open. Close. Open. Close.", "weight": 3 },
        { "desc": "is crouched over something in the weeds, making a sound that might once have been humming", "weight": 2 },
        { "desc": "walks the center line of the road with purpose, as if it remembers having somewhere to be", "weight": 2 }
      ],
      "whisperer": [
        { "desc": "stands at the edge of the road, facing away from you. It is speaking softly. You can almost make out the words.", "weight": 1 },
        { "desc": "is sitting in the truck cab. As you approach, it turns and says something that sounds like a name. Not yours.", "weight": 1 }
      ]
    }
  }
}
```

**Noise modifier:** Player actions that generate noise (combat, gunfire, yelling) add to the encounter chance for adjacent rooms. Fire a gun in one room and the `noise_modifier` stacks onto the base chance of rooms within earshot. This creates a real cost to loud combat.

---

### Layer 4: Environmental Randomization

Weather, ambient conditions, and atmospheric details roll per room visit or per game tick.

```json
{
  "room_id": "river_road_south_bend",
  "environmental_rolls": {
    "weather_override": null,
    "ambient_sound_pool": {
      "day": [
        { "sound": "The river murmurs over the stones to the east.", "weight": 4 },
        { "sound": "A hawk circles high above, riding a thermal.", "weight": 2 },
        { "sound": "Somewhere south, a dog barks once and goes silent.", "weight": 1 },
        { "sound": "The wind picks up, rattling the truck's loose door.", "weight": 2 },
        { "sound": null, "weight": 3 }
      ],
      "night": [
        { "sound": "The river is louder at night. Or maybe everything else is quieter.", "weight": 3 },
        { "sound": "Coyotes. West, maybe a mile out. They sound wrong lately.", "weight": 2 },
        { "sound": "Something heavy moves through the brush on the far bank.", "weight": 1 },
        { "sound": "The truck's door creaks. Wind, probably.", "weight": 2 },
        { "sound": null, "weight": 2 }
      ]
    },
    "ambient_count": { "min": 0, "max": 2 },
    "flavor_lines": [
      { "line": "Grasshoppers scatter from the weeds as you walk.", "chance": 0.3, "time": ["day"] },
      { "line": "A dragonfly hovers over the river, iridescent blue.", "chance": 0.15, "time": ["day", "dawn"] },
      { "line": "Your boot crunches broken glass. Someone's been here.", "chance": 0.4, "time": null },
      { "line": "The air smells like sage and hot asphalt.", "chance": 0.25, "time": ["day", "dusk"] },
      { "line": "A breeze carries the faint smell of woodsmoke from the north. Covenant.", "chance": 0.35, "time": null },
      { "line": "You spot a bootprint in the soft shoulder. Fresh. Headed south.", "chance": 0.2, "time": null, "skill_gate": { "skill": "tracking", "dc": 10 } }
    ]
  }
}
```

**Flavor lines** are single-sentence atmospheric details that have a chance of appearing below the room description. They're not structural — they're the sensory texture that makes a room feel alive. A `null` in the ambient sound pool means silence — and silence should have weight.

**ambient_count** controls how many ambient sounds/flavor lines can appear at once. Rolling `0` means the room is quiet. That's intentional.

---

### Layer 5: Extra Description Variants

Even the `look at` details shouldn't be static. Extras can have variant descriptions that rotate.

```json
{
  "keywords": ["truck", "pickup", "pickup truck"],
  "description_pool": [
    {
      "desc": "A 2028 Ford F-150, once white. The bed is empty except for a moldy sleeping bag and three empty cans of beans. No keys in the ignition. The gas gauge reads empty, but gauges lie.",
      "weight": 3
    },
    {
      "desc": "A 2028 Ford F-150, listing into the ditch. Someone has scratched STILL ALIVE into the dust on the tailgate. The handwriting is shaky. The bed holds a wadded-up tarp and a rusted toolbox — locked.",
      "weight": 2
    },
    {
      "desc": "A 2028 Ford F-150. The hood is up. Someone has stripped the battery and most of the wiring harness, recently — the cuts are clean and the exposed metal hasn't rusted yet.",
      "weight": 1
    }
  ],
  "variant_persistence": "session"
}
```

**Variant persistence:** Controls how long a rolled variant sticks.
- `"visit"` — rerolls every time the player looks (too chaotic for most uses)
- `"session"` — stays consistent for the player's current session, rerolls next login
- `"tick"` — rerolls on the game's world tick cycle (e.g., every 30 minutes)
- `"permanent"` — rolled once at world generation, never changes (for structural details)

---

### Layer 6: Room Description Fragments

The base room description itself can have randomized fragment slots. This is the nuclear option — use sparingly for rooms the player will revisit frequently.

```
"descriptions": {
  "default": {
    "template": "The road is cracked asphalt with weeds pushing through every seam, the center line long since faded to nothing. {{river_detail}} A rusted pickup truck sits nose-down in the ditch on the west side, {{truck_detail}} {{ground_detail}}",
    "fragments": {
      "river_detail": [
        { "text": "To the east, the Animas River runs shallow over smooth stones, catching midday light.", "weight": 3 },
        { "text": "The Animas is running high today, brown with upstream runoff. It sounds angry.", "weight": 1 },
        { "text": "The river is low — you can see the gravel bed exposed in wide patches.", "weight": 1 },
        { "text": "A dead elk lies half-submerged at the river's edge, bloated. The water parts around it.", "weight": 0.5 }
      ],
      "truck_detail": [
        { "text": "its windshield a spiderweb of fractures. Something has been living in the cab — the passenger door hangs open, and the seat is torn to stuffing.", "weight": 3 },
        { "text": "its tires long since rotted flat. Someone has piled sandbags in the bed, turning it into a low firing position.", "weight": 1 },
        { "text": "its hood propped open with a stick. The engine is gone. Stripped clean.", "weight": 1 }
      ],
      "ground_detail": [
        { "text": "Shell casings glint in the gravel near the ditch. Old, but not ancient.", "weight": 1 },
        { "text": "A child's shoe sits in the middle of the road. Just one.", "weight": 0.5 },
        { "text": "Tire tracks cross the shoulder heading west. Something drove through here recently.", "weight": 1 },
        { "text": "", "weight": 2 }
      ]
    }
  }
}
```

The empty string `""` in ground_detail with weight 2 means most of the time, there's no ground detail. When there is one, it hits harder because it's not always there.

---

## RESPAWN AND DEPLETION

Items and NPCs don't just appear — they also get taken and killed. The system needs to handle what happens after.

### Item Depletion & Respawn

```json
{
  "item_id": "hunting_rifle_03",
  "depletion": {
    "enabled": true,
    "cooldown_minutes": { "min": 120, "max": 360 },
    "respawn_chance_after_cooldown": 0.15,
    "global_stock": {
      "enabled": false,
      "max_in_world": null
    }
  }
}
```

When a player takes an item, it enters a **cooldown period** (itself randomized between min and max). After the cooldown, it rolls its `respawn_chance_after_cooldown` on each world tick. This means a taken rifle doesn't reappear in exactly 3 hours — it *might* reappear sometime between 2 and 6 hours, with only a 15% chance per tick after cooldown.

**Global stock** (optional): For rare items, you can cap the total number that exist in the world at any given time. If `max_in_world` is 3 and three players already have one, no more spawn until one is lost, destroyed, or dropped.

### NPC Respawn

```json
{
  "npc_id": "accord_sentry_01",
  "respawn": {
    "cooldown_minutes": { "min": 30, "max": 90 },
    "respawn_chance_per_tick": 0.40,
    "max_concurrent_in_zone": 3,
    "death_consequence": "replacement",
    "replacement_pool": [
      { "npc_id": "accord_sentry_01", "weight": 3 },
      { "npc_id": "accord_sentry_02", "weight": 2 },
      { "npc_id": "accord_recruit_01", "weight": 1, "flavor": "younger, nervous, clearly new to the post" }
    ]
  }
}
```

**Replacement pools:** When a killed NPC respawns, it doesn't have to be the "same" NPC. The sentry you killed might be replaced by a different sentry, or by a raw recruit who's clearly less experienced. This makes the world feel reactive.

---

## ENCOUNTER TABLES — ZONE LEVEL

Zones have their own master encounter tables that overlay room-level spawns. These handle roaming threats, random events, and zone-wide conditions.

```json
{
  "zone_id": "river_road",
  "roaming_encounters": [
    {
      "encounter_id": "drifter_caravan",
      "type": "npc_group",
      "chance_per_tick": 0.08,
      "npcs": [
        { "npc_id": "drifter_trader", "quantity": { "min": 1, "max": 1 } },
        { "npc_id": "drifter_guard", "quantity": { "min": 1, "max": 3, "distribution": "weighted_low" } },
        { "npc_id": "pack_mule", "quantity": { "min": 0, "max": 1 } }
      ],
      "behavior": "moves_through",
      "rooms_per_tick": 1,
      "time_restrict": ["day", "dawn", "dusk"],
      "description_on_approach": "You hear the creak of a loaded cart and low voices from the {{direction}}."
    },
    {
      "encounter_id": "hollow_herd_migration",
      "type": "enemy_group",
      "chance_per_tick": 0.03,
      "enemies": [
        { "type": "shuffler", "quantity": { "min": 8, "max": 20, "distribution": "bell" } },
        { "type": "screamer", "quantity": { "min": 0, "max": 2, "distribution": "weighted_low" } }
      ],
      "behavior": "moves_through",
      "rooms_per_tick": 0.5,
      "time_restrict": ["night", "dusk"],
      "warning_rooms_ahead": 2,
      "warning_description": "The ground trembles faintly. A low, collective moan rises from the {{direction}} — not one voice but dozens. A herd is moving.",
      "avoidable": true,
      "avoid_skill": "stealth",
      "avoid_dc": 14
    },
    {
      "encounter_id": "lone_sanguine_hunter",
      "type": "enemy_single",
      "chance_per_tick": 0.02,
      "enemies": [
        { "type": "feral_sanguine", "quantity": { "min": 1, "max": 1 } }
      ],
      "behavior": "stalks_player",
      "time_restrict": ["night"],
      "detection_skill": "perception",
      "detection_dc": 16,
      "undetected_description": "You feel watched. The hair on your arms is standing up. You can't explain why.",
      "detected_description": "A figure stands on the ridge to the {{direction}}, silhouetted against the stars. It is perfectly still. It is looking at you."
    }
  ],
  "zone_events": [
    {
      "event_id": "rainstorm",
      "chance_per_day": 0.20,
      "duration_hours": { "min": 1, "max": 6 },
      "effects": {
        "visibility": -0.3,
        "tracking_dc_modifier": +4,
        "hollow_spawn_modifier": -0.2,
        "fire_allowed": false,
        "ambient_override": "Rain hammers the ground. Everything beyond fifty yards is gray noise."
      }
    },
    {
      "event_id": "gunfire_echo",
      "chance_per_tick": 0.05,
      "effects": {
        "ambient_inject": "Gunfire. {{random_direction}}, distant. Three shots, then silence. Then two more.",
        "hollow_spawn_modifier_adjacent": +0.3,
        "duration_ticks": 2
      }
    }
  ]
}
```

---

## DICE ROLL REFERENCE

For consistency across all systems, The Remnant uses these roll types:

| Roll Name | Mechanic | Use Case |
|-----------|----------|----------|
| `d100` | 1-100, flat | Spawn chance checks (roll under threshold) |
| `dN` | 1-N, flat | General purpose (quantity, selection) |
| `weighted_pool` | Weighted random from a list | Activity selection, encounter type, loot tables |
| `bell_curve` | 2d6 or 3d6 style distribution | Quantity rolls where extremes should be rare |
| `advantage` | Roll twice, take better result | Player has favorable conditions |
| `disadvantage` | Roll twice, take worse result | Player has unfavorable conditions |
| `exploding` | On max roll, roll again and add | Rare critical events (Hive Mother encounter, legendary loot) |

### Modifier Stacking

All modifiers are **multiplicative**, not additive. This prevents runaway values.

```
final_chance = base_chance * time_modifier * weather_modifier * player_reputation_modifier * noise_modifier
```

Example: Base hollow spawn chance is 0.12. It's night (1.8x). It's raining (-0.2, so 0.8x). Player just fired a gun (+0.15 noise, so 1.15x).

```
0.12 * 1.8 * 0.8 * 1.15 = 0.199 (roughly 20% chance)
```

Compared to the quiet daytime baseline:
```
0.12 * 0.6 * 1.0 * 1.0 = 0.072 (roughly 7% chance)
```

Night + noise nearly triples encounter odds. Quiet day travel is genuinely safer. This is the math that makes player decisions matter.

---

## SEED AND PERSISTENCE RULES

### What persists vs. what rerolls:

| Element | Persistence | Reroll Trigger |
|---------|------------|---------------|
| Room description fragments | Per session | New session / game tick |
| Extra description variants | Per session | New session |
| Item spawns | Per world tick | Tick cycle (configurable, default 30 min) |
| Item condition | Permanent once spawned | Never (item keeps its condition) |
| NPC spawns | Per world tick | Tick cycle |
| NPC activity | Per room entry | Every time any player enters |
| NPC disposition | Per encounter | Rerolls each new encounter |
| Hollow encounters | Per room entry | Every time a player enters |
| Weather | Per zone per day | Daily roll + event triggers |
| Ambient sounds | Per room entry | Every entry |
| Flavor lines | Per room entry | Every entry |
| Roaming encounters | Per tick | Each world tick |
| Zone events | Per day | Daily |

### Room Seed

Each room can optionally carry a **daily seed** derived from `hash(room_id + date + world_tick)`. This ensures that if two players enter the same room on the same tick, they see the same world state (items, NPCs). Prevents the weird feeling of one player saying "I see a rifle here" and another player in the same room saying "I don't."

Encounters (Hollow, roaming) are per-player and do NOT share the room seed. Two players can have different encounter rolls in the same room at the same time. This is intentional — danger is personal.

---

## IMPLEMENTATION PSEUDOCODE

```python
import random
from typing import Optional

def weighted_roll(pool: list[dict]) -> dict:
    """Roll from a weighted pool. Each entry needs a 'weight' key."""
    total = sum(entry["weight"] for entry in pool)
    roll = random.uniform(0, total)
    cumulative = 0
    for entry in pool:
        cumulative += entry["weight"]
        if roll <= cumulative:
            return entry
    return pool[-1]  # fallback


def quantity_roll(qty_config: dict) -> int:
    """Roll a quantity based on distribution type."""
    lo, hi = qty_config["min"], qty_config["max"]
    dist = qty_config.get("distribution", "flat")
    
    if lo == hi:
        return lo
    
    if dist == "flat":
        return random.randint(lo, hi)
    elif dist == "weighted_low":
        # Roll twice, take the lower
        return min(random.randint(lo, hi), random.randint(lo, hi))
    elif dist == "weighted_high":
        # Roll twice, take the higher
        return max(random.randint(lo, hi), random.randint(lo, hi))
    elif dist == "bell":
        # Average of two rolls — clusters toward middle
        r1 = random.randint(lo, hi)
        r2 = random.randint(lo, hi)
        return (r1 + r2) // 2
    elif dist == "single":
        return 1 if random.random() < 1.0 else 0
    
    return random.randint(lo, hi)


def spawn_check(
    base_chance: float,
    time_of_day: str,
    time_modifiers: dict,
    weather_modifier: float = 1.0,
    noise_modifier: float = 1.0,
    reputation_modifier: float = 1.0
) -> bool:
    """Check if an entity spawns."""
    modifier = time_modifiers.get(time_of_day, 1.0)
    final_chance = base_chance * modifier * weather_modifier * noise_modifier * reputation_modifier
    final_chance = min(final_chance, 0.95)  # hard cap — nothing is ever 100%
    return random.random() < final_chance


def populate_room(room_data: dict, player: "Player", world_state: "WorldState") -> dict:
    """Master function: rolls everything for a room."""
    
    result = {
        "name": room_data["name"],
        "description": None,
        "environmental": [],
        "items": [],
        "npcs": [],
        "hollow_encounter": None,
        "flavor_lines": [],
        "ambient_sounds": []
    }
    
    time = world_state.time_of_day
    weather = world_state.weather_modifier
    noise = world_state.get_noise_level(room_data["room_id"])
    
    # --- Room description (with fragment rolls) ---
    desc_data = room_data["descriptions"].get(time, room_data["descriptions"]["default"])
    if isinstance(desc_data, dict) and "template" in desc_data:
        text = desc_data["template"]
        for key, pool in desc_data["fragments"].items():
            chosen = weighted_roll(pool)
            text = text.replace("{{" + key + "}}", chosen["text"])
        result["description"] = text
    else:
        result["description"] = desc_data
    
    # --- Item spawns ---
    for item_entry in room_data.get("item_spawns", []):
        if world_state.is_depleted(item_entry["entity_id"], room_data["room_id"]):
            continue
        if spawn_check(item_entry["spawn_chance"], time, item_entry.get("time_modifier", {}), weather, noise):
            qty = quantity_roll(item_entry["quantity"])
            if qty > 0:
                condition = random.uniform(
                    item_entry["condition_roll"]["min"],
                    item_entry["condition_roll"]["max"]
                )
                result["items"].append({
                    "item_id": item_entry["entity_id"],
                    "quantity": qty,
                    "condition": round(condition, 2)
                })
    
    # --- NPC spawns ---
    for npc_entry in room_data.get("npc_spawns", []):
        if spawn_check(npc_entry["spawn_chance"], time, npc_entry.get("time_modifier", {})):
            qty = quantity_roll(npc_entry["quantity"])
            for _ in range(qty):
                activity = weighted_roll(npc_entry["activity_pool"])
                # Check time restriction on activity
                if activity.get("time_restrict") and time not in activity["time_restrict"]:
                    activity = weighted_roll(npc_entry["activity_pool"])  # reroll once
                disposition = weighted_roll_from_dict(npc_entry.get("disposition_roll", {"neutral": 1.0}))
                result["npcs"].append({
                    "npc_id": npc_entry["npc_id"],
                    "activity_description": activity["desc"],
                    "disposition": disposition
                })
    
    # --- Hollow encounter ---
    hollow_data = room_data.get("hollow_encounter")
    if hollow_data:
        if spawn_check(hollow_data["base_chance"], time, hollow_data["time_modifier"], weather, noise):
            enemy_type = weighted_roll(hollow_data["threat_pool"])
            qty = quantity_roll(enemy_type["quantity"])
            awareness = weighted_roll_from_dict(hollow_data["awareness_roll"])
            activity_pool = hollow_data["activity_pool"].get(enemy_type["type"], [])
            activities = [weighted_roll(activity_pool) for _ in range(qty)] if activity_pool else []
            result["hollow_encounter"] = {
                "type": enemy_type["type"],
                "count": qty,
                "awareness": awareness,
                "activities": [a["desc"] for a in activities]
            }
    
    # --- Ambient sounds ---
    sound_pool = room_data.get("environmental_rolls", {}).get("ambient_sound_pool", {}).get(time, [])
    if sound_pool:
        count_config = room_data.get("environmental_rolls", {}).get("ambient_count", {"min": 0, "max": 2})
        count = quantity_roll(count_config)
        chosen_sounds = []
        available = list(sound_pool)
        for _ in range(count):
            if not available:
                break
            s = weighted_roll(available)
            if s["sound"] is not None:
                chosen_sounds.append(s["sound"])
            available.remove(s)
        result["ambient_sounds"] = chosen_sounds
    
    # --- Flavor lines ---
    for fl in room_data.get("environmental_rolls", {}).get("flavor_lines", []):
        if fl.get("time") and time not in fl["time"]:
            continue
        if fl.get("skill_gate"):
            if not player.skill_check(fl["skill_gate"]["skill"], fl["skill_gate"]["dc"]):
                continue
        if random.random() < fl["chance"]:
            result["flavor_lines"].append(fl["line"])
    
    return result
```

---

## BALANCE LEVERS

These are the knobs designers turn to tune the player experience without rewriting content:

| Lever | What It Controls | Turn Up = | Turn Down = |
|-------|-----------------|-----------|-------------|
| `base_chance` per item | Individual item scarcity | More loot, easier survival | Harsher, more desperate |
| `time_modifier` night multiplier | Nighttime danger scaling | Night is terrifying | Night is manageable |
| `noise_modifier` coefficient | Cost of loud actions | Every gunshot is a decision | Combat has fewer consequences |
| `depletion cooldown` range | How fast the world replenishes | Rooms feel fresh quickly | Picked-over rooms stay empty |
| `threat_pool` weights | Which enemy types appear | More Brutes = harder, more Shufflers = easier | Shift the fear profile |
| `activity_pool` weights | NPC variety | More unpredictable NPCs | More consistent, readable world |
| `flavor_line` chances | Atmospheric density | Rich, detailed, slower-paced | Sparse, faster, more mechanical |
| `disposition_roll` hostile % | NPC unpredictability | Tenser social interactions | Safer faction interactions |
| Global `max_spawn_cap` | Hard ceiling: 0.95 | Never change this. Nothing is ever certain. | — |

---

*The hard cap of 0.95 is non-negotiable. A player should never walk into a room with 100% certainty of what they'll find. Uncertainty is the engine of this world.*

*Append this document to the World Bible and Room Display Spec. Together, the three documents give Claude Code the complete system: what the world is, how to show it, and how to make it breathe.*
