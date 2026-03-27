# THE REMNANT — Death, Regeneration & The Cycle

> Addendum to the World Bible. Defines the permadeath system, what carries forward, what's lost, how the world scales, and why dying is part of the story.

---

## DESIGN PHILOSOPHY

The Remnant is a **narrative roguelike** — permadeath is real, but death is not the end. It's a transformation.

The goal is a system where:

- Death **hurts** — the player loses something meaningful every time
- Death **teaches** — the player carries forward knowledge, some capability, and a sense of progression
- Death **changes the world** — each new life ("cycle") enters a world that has shifted in response to what came before
- Death **tells a story** — the fiction explains why you come back, and each return has a cost that deepens the narrative

This is not New Game+. This is not a simple respawn. This is a world where the virus that ended civilization also refuses to let you stay dead — and every time it brings you back, it takes a piece of what made you who you were.

---

## THE FICTION — WHY YOU COME BACK

### The Revenant Effect

CHARON-7 doesn't just create Hollow and Sanguine. In an extraordinarily rare subset of the population — perhaps one in a hundred thousand — the virus has a third response to the host's death. Instead of letting the body stop, it **restarts** it.

The infected cells flood the dying brain with a cascade of repair signals. The heart restarts. The wounds close — slowly, imperfectly. The body reboots.

But the brain doesn't come back clean.

The virus prioritizes motor function and survival instinct over episodic memory and fine-grained skill. You wake up knowing *how* to survive but not always remembering the specific details of the life you just lived. Muscle memory persists better than intellectual memory. Relationships blur. The name of the settlement you called home fades. The feel of a rifle in your hands does not.

The people of the Four Corners have a name for those who come back: **Revenants**.

Revenants are not Sanguine. They don't need blood. They don't gain superhuman abilities. They are human — damaged, patched-together human — with a virus that refuses to let them go quiet. Nobody knows why some people revive and others don't. The Kindling believe Revenants are being punished. The Reclaimers believe they hold the key to understanding CHARON-7's full potential. The Sanguine find them... interesting.

**The cost is cumulative.** Each revival degrades the host slightly. Revenants who have died many times begin to show signs: faded scars that glow faintly in certain light, memories that belong to no one, moments of disorientation where the current life and the previous ones blur together. After enough cycles, a Revenant starts to wonder if they're still the person who first entered the Four Corners — or something the virus is building out of spare parts.

This is the horror at the center of the system: **you are the virus's project, and you don't know what it's making.**

---

## THE CYCLE — MECHANICAL FRAMEWORK

### What Happens When You Die

```
1. DEATH EVENT — HP reaches 0 through combat, infection, environmental damage, etc.
2. DEATH SCREEN — Narrative moment. The world goes dark. A final sensory fragment.
3. THE BETWEEN — Brief interstitial (see below). Player makes inheritance choices.
4. REBIRTH — Player wakes in a new location with carried-forward attributes.
5. THE WORLD HAS CHANGED — Monster composition shifts. Some world state persists.
```

### The Between

When the player dies, they experience **The Between** — a brief, semi-lucid sequence where the virus is repairing them. This is not a menu screen. It's a narrative moment with mechanical choices embedded in it.

**What the player experiences:**

Fragments. Flashes of their previous life — rooms they visited, people they spoke to, choices they made. The fragments are pulled from actual gameplay data: if the player spent significant time in Covenant, they see flashes of Covenant. If they befriended Vesper, they hear her voice. If they killed someone, they see the moment.

The fragments fade. Some stick. The player chooses — narratively and mechanically — what to hold onto and what to let go.

**What the player chooses in The Between:**

The player has a limited number of **Memory Slots** (see below) that determine how much they carry forward. They must allocate these slots among different categories. They cannot keep everything.

---

## INHERITANCE MODEL — WHAT CARRIES FORWARD

### The Ledger

Every player has a persistent **Ledger** — a meta-progression tracker that survives across all cycles. The Ledger records:

| Ledger Entry | Persistence | Notes |
|-------------|-------------|-------|
| **Cycle count** | Permanent | How many times you've died and returned |
| **Skill Echoes** | Partial (see below) | Ghost impressions of skills from previous lives |
| **Faction Memory** | Partial (see below) | NPCs and factions partially remember you |
| **World State** | Full | Quest completions, faction events, world changes persist |
| **The Map** | Full | Rooms you've discovered stay discovered |
| **Letters Found** | Full | Collected letters persist in a journal |
| **The Dog** | Conditional | See below |
| **Personal Quest** | Evolving | Your loss thread continues, shifted by death |
| **Stash** | Full | Items stored in a persistent stash location survive |
| **Carried Items** | Lost | Everything on your person at death is gone |
| **Currency** | Mostly lost | 10-20% of your liquid currency survives (hidden on your body, muscle memory of a cache) |

---

### Skill Echoes — How Skills Carry Forward

Skills are not fully retained or fully lost. They degrade to an **Echo Level** — a floor that your previous mastery establishes for the next life.

**The formula:**

```
echo_level = previous_skill_level * echo_retention_rate
```

The **echo retention rate** depends on the skill type:

| Skill Category | Echo Retention | Reasoning |
|---------------|---------------|-----------|
| **Physical / Motor Memory** (Brawling, Bladework, Marksmanship, Stealth) | 60-70% | The body remembers. Muscle memory is deep. |
| **Cognitive / Knowledge** (Lore, Electronics, Mechanics, Field Medicine) | 30-40% | Intellectual knowledge degrades faster. You remember *that* you knew something, not always the details. |
| **Social / Relational** (Negotiation, Intimidation, Presence-based skills) | 40-50% | You retain the instincts but not the specific relationships and context that made them effective. |
| **Survival / Instinct** (Survival, Tracking, Scavenging) | 70-80% | The virus prioritizes this. You wake up knowing how to find water and start fire almost as well as before. |
| **Sanguine-specific** (Blood Sense, Daystalking, Mesmerize) | 50-60% | The viral systems rebuild these, but imperfectly each time. |

**Echo floor:** Skills cannot echo below level 1. If your Marksmanship was 15 and you die, you come back at roughly 10. If it was 3, you come back at 2. A new player and a Cycle 5 Revenant feel meaningfully different even at "level 1."

**Memory Slots affect this.** In The Between, the player can spend Memory Slots to boost specific skill echoes above their default retention. One slot spent on a skill category raises its retention by +15%. This is the "what do you hold onto" choice — you can't boost everything.

**Memory Slot allocation:**

```
Base Memory Slots: 3
+1 slot per 5 cycles (max +4 bonus)
Maximum Memory Slots: 7
```

A first-death player gets 3 slots. A veteran Revenant on Cycle 20+ gets 7 — they carry forward significantly more, but they're still losing something every time. The system has diminishing returns, not infinite growth.

---

### Faction Memory — How the World Remembers You

Faction reputation does not fully reset. The factions have **institutional memory.**

**The mechanic:**

```
new_reputation = previous_reputation * faction_memory_rate + cycle_modifier
```

| Faction | Memory Rate | Why |
|---------|-----------|-----|
| **The Accord** | 0.50 | Bureaucratic. They keep records. They remember you, vaguely. |
| **The Salters** | 0.30 | Respect is earned in person. Dead people lose credibility fast. |
| **The Drifters** | 0.20 | "Who? Oh right, that person. They died." Drifters move on. |
| **The Kindling** | 0.60 | They believe Revenants are spiritually significant. Your history with them is *doctrine.* |
| **The Reclaimers** | 0.70 | They study Revenants. They have *files* on you. |
| **Covenant of Dusk** | 0.55 | The Sanguine have long memories and a keen interest in those who cheat death. |
| **The Red Court** | 0.40 | You're either useful or you're food. Previous arrangements are... renegotiable. |

**Cycle modifier:** Each cycle adds a small positive or negative nudge depending on how you died:

- Died fighting Hollow near a faction settlement: +0.1 (they noticed your sacrifice)
- Died attacking a faction: -0.2 (they remember *that*)
- Died in the wilderness, unwitnessed: +0.0 (nobody saw it)
- Died in MERIDIAN or the Scar: +0.15 to Reclaimers, +0.1 to Kindling (they're *very* interested)

**NPC memory:** Named NPCs remember you with more specificity than faction scores suggest. Marshal Cross might not trust you on paper (reputation 0.5x decay), but her dialogue acknowledges that she's met you before. Vesper definitely remembers. Dr. Osei keeps notes.

This creates the eerie, haunted quality of the Revenant experience: people know you, sort of. They've seen your face before. You're not a stranger, but you're not quite the person they knew, either.

---

### Item Inheritance — The Stash System

**On your person = lost.** Everything you're carrying when you die is gone. Dropped in the room where you died. Other players can loot your corpse (PvP servers) or the items decay after a set period.

**The Stash = persistent.** Every player has access to a hidden stash location — a cache they maintain between lives. The stash has limited capacity and is tied to a specific room in the world.

**Stash rules:**

| Rule | Detail |
|------|--------|
| Capacity | 20 item slots (upgradeable via Reclaimer quests, max 40) |
| Location | Player chooses during Act I. Can be relocated once per cycle at significant cost. |
| Security | Can be raided by NPCs if located in a high-threat zone (chance per cycle). Safer locations have smaller capacity. |
| Access | Available from the start of each new cycle. Player wakes up and can travel to their stash. |
| Sharing | Stash is per-player. Not accessible by other players. |

**Strategic implication:** Smart players bank critical items between runs. You don't carry your best gear into a dangerous situation — you carry your second-best and leave the good stuff in the stash. This creates a natural risk/reward calculation for every expedition.

**Death site loot:** Your corpse persists for a configurable period (default: 48 real-time hours). You can return in your next cycle to loot your own body. But so can anyone else. And Hollow are attracted to corpses. Your death site becomes a point of interest in the world.

---

## WORLD SCALING — HOW THE WORLD CHANGES PER CYCLE

### Not Harder. Smarter.

The world does not simply inflate monster HP and damage per cycle. That's lazy and it feels like a treadmill. Instead, the world evolves **compositionally** — the *types* of threats, their *behaviors*, and their *combinations* shift.

### The Pressure System

The world tracks a global **Pressure** value that increments based on collective player cycles (on multiplayer) or individual cycles (on solo). Pressure affects spawn tables, not stat blocks.

**What Pressure changes:**

| Pressure Level | Cycle Range | Effect |
|---------------|-------------|--------|
| **1 — Quiet** | Cycles 1-2 | Base spawn tables. Shufflers dominate. Sanguine encounters are rare. The world is dangerous but learnable. |
| **2 — Stirring** | Cycles 3-5 | Remnants appear more frequently. Hollow begin traveling in mixed groups (Shufflers + Screamer). Sanguine patrols extend their territory. |
| **3 — Tense** | Cycles 6-10 | Brutes enter the open-world spawn tables. Hollow herds increase in size. Sanguine hunting parties (2-3 coordinated Sanguine) appear at night. Red Court activity increases. |
| **4 — Volatile** | Cycles 11-15 | Whisperers become a real threat. Hollow show rudimentary pack tactics (Screamers call, Brutes charge, Shufflers flank). Feral Sanguine appear in previously safe zones. Faction tensions escalate — NPC conflicts trigger more frequently. |
| **5 — Critical** | Cycles 16+ | Hive Mothers appear. Hollow herds can overrun minor settlements (world events). Sanguine elder-class enemies emerge. The Scar zone becomes actively hostile (things are coming *out* of MERIDIAN). The world is pushing back. |

### Compositional Scaling Details

Instead of a Shuffler with 100 HP becoming a Shuffler with 200 HP, the spawn tables shift:

**Pressure 1 — A typical River Road encounter:**
```
Roll: 1d100
01-60: 1-3 Shufflers
61-85: 1 Remnant
86-95: 1 Shuffler + 1 Screamer
96-00: No encounter (lucky)
```

**Pressure 3 — Same room, same time of day:**
```
Roll: 1d100
01-30: 2-4 Shufflers
31-50: 1-2 Remnants (one may be armed)
51-70: 2-3 Shufflers + 1 Screamer
71-85: 1 Brute
86-92: 1 Brute + 2 Shufflers
93-97: 1 Remnant with ranged weapon (actively hunting)
98-00: No encounter
```

**Pressure 5 — Same room:**
```
Roll: 1d100
01-20: 3-6 Shufflers in a loose herd
21-40: 2 Remnants (armed, coordinated, flanking)
41-55: 1 Brute + 1 Screamer + 2-4 Shufflers
56-70: 1 Whisperer (mimicking a voice you've heard before)
71-80: Sanguine hunting party (2 Ferals, cooperative)
81-90: Hollow herd (8-15 mixed types, moving through)
91-97: Remnant ambush (3 Remnants with weapons, set up in cover)
98-99: Hive Mother + entourage (15-25 Hollow in coordinated formation)
00: The road is empty. Completely. Unnaturally. Something cleared it. What?
```

The "00" result at Pressure 5 is intentional. At the highest threat level, **silence becomes the scariest possible outcome.** The absence of enemies means something worse is nearby.

### Stat Nudges (Minor, Not Primary)

Enemy stats *do* increase slightly per Pressure level, but modestly:

```
hp_modifier = 1.0 + (pressure_level * 0.08)
damage_modifier = 1.0 + (pressure_level * 0.05)
awareness_modifier = 1.0 + (pressure_level * 0.10)
```

At Pressure 5, a Shuffler has 40% more HP, 25% more damage, and 50% better awareness than at Pressure 1. Meaningful but not the primary difficulty vector. The real difficulty is that it's no longer alone.

### Behavioral Evolution

At higher Pressure levels, enemies gain new **behaviors**, not just better stats:

| Enemy | Pressure 1-2 Behavior | Pressure 3-4 Behavior | Pressure 5 Behavior |
|-------|----------------------|----------------------|---------------------|
| **Shuffler** | Wanders. Attacks on proximity. | Responds to Screamer calls. Moves in loose groups. | Flanks. Blocks exits. Retreats when injured to rejoin group. |
| **Remnant** | Uses fragments of old skills randomly. | Actively uses weapons found on the ground. Takes cover. | Sets ambushes. Uses bait (objects, sounds). Coordinates with other Remnants. |
| **Screamer** | Screams when it sees you, drawing others. | Screams tactically — waits until you're engaged with another Hollow. | Moves to block your retreat *before* screaming. |
| **Brute** | Charges directly. | Charges but breaks off if outmatched. Returns with others. | Throws objects. Uses environment (flips cars, breaks through walls). |
| **Whisperer** | Mimics random phrases. | Mimics specific player names and NPC names it's heard. | Holds conversations. Asks for help. Begs. Leads you into ambushes. |

---

## THE REVENANT IDENTITY — NARRATIVE EFFECTS OF MULTIPLE CYCLES

The game tracks your cycle count and reflects it in the world:

### Cycle 1 (First Life)
- NPCs treat you as a newcomer. Standard introductions.
- No Revenant-specific dialogue.
- The world is at its most "normal."

### Cycles 2-3 (Recently Returned)
- Some NPCs recognize your face: *"You look familiar. Have we met?"*
- The Kindling take notice: *"You've been touched by the fire and walked back. That means something."*
- Faint scarring appears on your character description — thin lines, barely visible, where you died.

### Cycles 4-7 (Established Revenant)
- Most named NPCs have specific dialogue acknowledging your returns.
- The Reclaimers want to study you. Actively.
- Your scars are more pronounced. Other players can see them.
- Occasional **memory bleed** events: you get a flash of a room you've never visited in this life, a skill check you passed in a previous cycle, or an NPC interaction that happened to "a previous you." These are disorienting and unreliable.
- Some NPCs are uncomfortable around you. You're not natural. You know it. They know it.

### Cycles 8-12 (Veteran Revenant)
- You are a known quantity. Factions have Revenant-specific quest branches.
- The Sanguine are overtly curious: *"How many times now? Do you still dream? Do the dreams change?"*
- Your character description includes visible viral scarring — luminescent lines under the skin, particularly around wounds.
- Memory bleeds are more frequent and more vivid. Occasionally useful (a shortcut you "remember," a danger you sense before it manifests). Occasionally terrifying (you remember dying).
- Unique dialogue option: *"I've been here before."* Opens Revenant-only quest paths.

### Cycles 13+ (Ancient Revenant)
- You are a legend. Or a cautionary tale.
- NPCs who've met you in multiple lives have long, complicated feelings about you.
- The Kindling may worship you or fear you, depending on your history with them.
- The question the world asks shifts from "who are you?" to "what are you?"
- Memory bleeds can now include fragments from *other Revenants'* lives — the virus is networked, sharing data between its projects. You see through someone else's eyes. You remember a death that isn't yours.
- The MERIDIAN storyline gains a new dimension: the broadcaster knows about Revenants. Has been studying them. You are not an anomaly. You are a data point.
- Hidden endgame revelation (Cycle 15+): The Revenant effect may not be a side effect. It may be MERIDIAN's *fourth intended outcome.* The Hollow were the failure. The Sanguine were the soldiers. And the Revenants? The Revenants were the **test pilots** — iterating, learning, improving with each cycle. The question is: improving toward *what?*

---

## THE DOG (ACROSS CYCLES)

The dog persists across cycles **if the player's kindness counter was high enough at death.**

| Kindness Level at Death | What Happens Next Cycle |
|------------------------|------------------------|
| **Low / Negative** | The dog is gone. It does not appear again for 2 cycles. When it reappears, it's wary. |
| **Moderate** | The dog appears in the same starting region, but doesn't follow immediately. Must be re-befriended (lower threshold). |
| **High** | The dog finds you. Within the first few rooms of your new cycle, it appears. It remembers. It is the only thing in the world that recognizes you without hesitation. |
| **Max (rare)** | The dog is waiting at your rebirth point. It was looking for you. |

The dog aging across cycles is subtle but present. After many cycles, the dog is old. Gray-muzzled. Slower. One day, the dog doesn't come back. That is the only permadeath in the game that cannot be reversed.

---

## BALANCE NOTES

### The Death Spiral Problem

Roguelikes can create a death spiral: you die, come back weaker, die faster, come back weaker. The Remnant avoids this through:

1. **Echo floors.** Skills can't degrade below level 1 regardless of how many deaths. A 10-cycle Revenant with echoed skills starts significantly ahead of a brand-new character.
2. **The Stash.** Banked items persist. A smart player always has a fallback loadout.
3. **Map persistence.** You never have to re-explore discovered areas. Navigation knowledge is your most durable asset.
4. **Faction memory.** You're never starting from zero socially. Even degraded reputation is better than Unknown.
5. **Pressure scales to cycles, not difficulty.** A Cycle 1 player at Pressure 1 and a Cycle 10 player at Pressure 4 are facing proportionally similar challenges relative to their capabilities. The world gets harder, but you get more persistent.

### The Immortality Problem

If the player never truly loses, death loses its weight. The Remnant counters this with:

1. **Carried items are gone.** That legendary rifle you found? Hope it was in the Stash.
2. **Faction reputation decays.** Inner-circle access takes significant effort to rebuild.
3. **The personal quest evolves.** Each death changes your personal loss thread — the child you're searching for has moved on. The trail is colder. Time passes even when you don't.
4. **The Revenant identity.** After enough cycles, the game starts asking whether "you" still exist in any meaningful sense. The existential cost is real even if the mechanical cost is manageable.
5. **The dog.** You can lose the dog. That hurts more than losing a rifle.

---

## IMPLEMENTATION DATA MODEL

### Player Ledger (Persistent)

```json
{
  "player_id": "unique_id",
  "current_cycle": 7,
  "total_deaths": 6,
  "pressure_level": 3,
  "memory_slots": 4,
  
  "skill_echoes": {
    "marksmanship": { "echo_level": 8, "retention_category": "physical" },
    "field_medicine": { "echo_level": 4, "retention_category": "cognitive" },
    "survival": { "echo_level": 12, "retention_category": "instinct" },
    "negotiation": { "echo_level": 3, "retention_category": "social" }
  },
  
  "faction_memory": {
    "the_accord": { "stored_reputation": 1.8, "memory_rate": 0.50 },
    "covenant_of_dusk": { "stored_reputation": 2.1, "memory_rate": 0.55 },
    "the_salters": { "stored_reputation": -0.5, "memory_rate": 0.30 }
  },
  
  "discovered_rooms": ["covenant_main_gate", "river_road_south_bend", "..."],
  "letters_collected": ["letter_014", "letter_003", "letter_027"],
  
  "stash": {
    "location_room_id": "reclaimers_cache_03",
    "capacity": 25,
    "items": [
      { "item_id": "hunting_rifle_03", "condition": 0.72 },
      { "item_id": "ammo_9mm", "quantity": 14 },
      { "item_id": "antibiotics_01", "quantity": 1 }
    ]
  },
  
  "dog": {
    "alive": true,
    "kindness_counter": 34,
    "cycles_known": 5,
    "age_cycles": 5,
    "name": null
  },
  
  "personal_quest": {
    "type": "lost_child",
    "target_name": "Mia",
    "current_state": "trail_cold_act2",
    "cycle_mutations": [
      "cycle_3: heard Mia's name on a Drifter manifest heading south",
      "cycle_5: found a drawing signed M in a ruined school near The Breaks",
      "cycle_7: a Whisperer said her name. You don't know how it knew."
    ]
  },
  
  "revenant_markers": {
    "visible_scarring": "moderate",
    "memory_bleeds_enabled": true,
    "other_revenant_bleed": false,
    "npc_recognition_level": "established"
  },
  
  "death_history": [
    {
      "cycle": 1,
      "cause": "hollow_combat",
      "location": "the_breaks_narrow_canyon",
      "level_at_death": 8,
      "notable_items_lost": ["scrap_vest_01", "ammo_22lr x12"]
    },
    {
      "cycle": 2,
      "cause": "infection",
      "location": "the_dust_abandoned_clinic",
      "level_at_death": 11,
      "notable_items_lost": ["reclaimer_goggles"]
    }
  ]
}
```

---

*Death is not the end. It's a cost. Every Revenant carries the weight of their previous lives — enough to be dangerous, not enough to be invincible. The virus gives you back. It just doesn't give you back whole.*

*Append this document to the existing game bible. The five documents together — World Bible, Room Display Spec, RNG System, Narrative Bible, and this Death & Regeneration system — constitute the complete design foundation for The Remnant.*
