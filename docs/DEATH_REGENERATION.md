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
3. THE BETWEEN — Brief interstitial. Player makes inheritance choices.
4. REBIRTH — Player wakes in a new location with carried-forward attributes.
5. THE WORLD HAS CHANGED — Monster composition shifts. Some world state persists.
```

### The Between

When the player dies, they experience **The Between** — a brief, semi-lucid sequence where the virus is repairing them. This is not a menu screen. It's a narrative moment with mechanical choices embedded in it.

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
| **The Squirrel** | Conditional | See below |
| **Personal Quest** | Evolving | Your loss thread continues, shifted by death |
| **Stash** | Full | Items stored in a persistent stash location survive |
| **Carried Items** | Lost | Everything on your person at death is gone |
| **Currency** | Mostly lost | 10-20% of your liquid currency survives |

---

### Skill Echoes — How Skills Carry Forward

Skills degrade to an **Echo Level** — a floor that your previous mastery establishes for the next life.

```
echo_level = previous_skill_level * echo_retention_rate
```

| Skill Category | Echo Retention | Reasoning |
|---------------|---------------|-----------|
| **Physical / Motor Memory** | 60-70% | The body remembers. Muscle memory is deep. |
| **Cognitive / Knowledge** | 30-40% | Intellectual knowledge degrades faster. |
| **Social / Relational** | 40-50% | You retain instincts but not specific context. |
| **Survival / Instinct** | 70-80% | The virus prioritizes this. |

**Memory Slot allocation:**
```
Base Memory Slots: 3
+1 slot per 5 cycles (max +4 bonus)
Maximum Memory Slots: 7
```

---

### Faction Memory — How the World Remembers You

| Faction | Memory Rate | Why |
|---------|-----------|-----|
| **The Accord** | 0.50 | Bureaucratic. They keep records. |
| **The Salters** | 0.30 | Respect is earned in person. |
| **The Drifters** | 0.20 | "Who? Oh right, that person. They died." |
| **The Kindling** | 0.60 | Revenants are spiritually significant. |
| **The Reclaimers** | 0.70 | They study Revenants. They have files on you. |
| **Covenant of Dusk** | 0.55 | Long memories, keen interest in those who cheat death. |
| **The Red Court** | 0.40 | You're either useful or you're food. |

---

### Item Inheritance — The Stash System

**On your person = lost.** Everything you're carrying when you die is gone.

**The Stash = persistent.** 20 item slots (upgradeable via Reclaimer quests, max 40). Location chosen during Act I. Can be raided by NPCs in high-threat zones.

---

## WORLD SCALING — THE PRESSURE SYSTEM

The world tracks a global **Pressure** value that increments based on cycle count.

| Pressure Level | Cycle Range | Effect |
|---------------|-------------|--------|
| **1 — Quiet** | Cycles 1-2 | Base spawn tables. Shufflers dominate. |
| **2 — Stirring** | Cycles 3-5 | Remnants more frequent. Mixed Hollow groups. |
| **3 — Tense** | Cycles 6-10 | Brutes in open world. Sanguine hunting parties at night. |
| **4 — Volatile** | Cycles 11-15 | Whisperers. Hollow pack tactics. Feral Sanguine in safe zones. |
| **5 — Critical** | Cycles 16+ | Hive Mothers. Settlement overruns. Elder Sanguine. |

### Stat Nudges (Minor)
```
hp_modifier = 1.0 + (pressure_level * 0.08)
damage_modifier = 1.0 + (pressure_level * 0.05)
awareness_modifier = 1.0 + (pressure_level * 0.10)
```

---

## THE REVENANT IDENTITY

| Cycle Range | NPC Reaction |
|------------|-------------|
| Cycle 1 | Newcomer. Standard introductions. |
| Cycles 2-3 | "You look familiar. Have we met?" Kindling takes notice. |
| Cycles 4-7 | Named NPCs acknowledge your returns. Reclaimers want to study you. Memory bleeds begin. |
| Cycles 8-12 | Faction Revenant-specific quest branches. Luminescent viral scarring visible. |
| Cycles 13+ | Legend or cautionary tale. Memory bleeds from *other Revenants' lives*. |

**Hidden endgame revelation (Cycle 15+):** The Revenant effect may not be a side effect. It may be MERIDIAN's *fourth intended outcome.* The Hollow were the failure. The Sanguine were the soldiers. And the Revenants? The **test pilots** — iterating, learning, improving with each cycle. The question is: improving toward *what?*

---

## THE SQUIRREL (ACROSS CYCLES)

| Trust Level at Death | What Happens Next Cycle |
|----------------------|------------------------|
| **Low / Negative** | Gone. Does not appear for 2 cycles. Returns wary. |
| **Moderate** | Appears in starting region. Must be re-befriended (lower threshold). |
| **High** | Finds you within the first few rooms. It remembers. |
| **Max (rare)** | Waiting at your rebirth point. It was looking for you. |

The squirrel ages across cycles. After many cycles, it is old. Gray-muzzled. Slower. One day, the squirrel doesn't come back. That is the only permadeath in the game that cannot be reversed.

---

## IMPLEMENTATION DATA MODEL

```json
{
  "player_id": "unique_id",
  "current_cycle": 7,
  "total_deaths": 6,
  "pressure_level": 3,
  "memory_slots": 4,
  "world_seed": 1234567,
  "discovered_rooms": ["shelter-001", "ruins-003"],
  "letters_collected": ["letter_014"],
  "stash": {
    "location_room_id": "reclaimers_cache_03",
    "capacity": 25,
    "items": []
  },
  "squirrel": {
    "alive": true,
    "trust": 34,
    "cycles_known": 5,
    "name": "Chippy"
  },
  "faction_memory": {
    "the_accord": { "stored_reputation": 1.8 },
    "the_kindling": { "stored_reputation": 2.1 }
  },
  "skill_echoes": {
    "vigor": 5,
    "grit": 4,
    "reflex": 6
  },
  "personal_quest": {
    "type": "lost_child",
    "target_name": "Mia",
    "current_state": "trail_cold_act2"
  }
}
```

---

*Death is not the end. It's a cost. Every Revenant carries the weight of their previous lives — enough to be dangerous, not enough to be invincible. The virus gives you back. It just doesn't give you back whole.*
