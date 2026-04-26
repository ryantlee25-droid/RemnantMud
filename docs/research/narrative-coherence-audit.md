# Narrative Coherence — Internal Audit (Battle-MUD Pivot)

> **Date:** 2026-04-25
> **Branch:** dev/battle-mud-pivot
> **Audit by:** Explore agent (transcript captured inline; agent could not write directly)
> **Scope:** 13 zones, 18+ NPCs, 5 narrative systems, 4 endings, ~5,700 dialogue lines + ~1,200 world-event lines sampled.

---

## Headline

**The narrative spine is exceptionally strong and compatible with a 5–10× combat increase.** Premise, Revenant loop, faction landscape, and four-ending structure all hold under heavier combat. **The tactical integration is the gap** — NPCs don't acknowledge violence, gear has no lore, death prose repeats, and world events are passive observers. Without addressing those, players will experience cognitive dissonance: kill 50 Hollow outside, NPCs inside react as if nothing happened.

---

## 1. Narrative spine — what works

| System | Status | Battle-compatibility |
|---|---|---|
| CHARON-7 / MERIDIAN / Hollow / Sanguine premise | Strong | ✓ Compatible |
| Four endings (Cure / Weapon / Seal / Throne) — flag-driven | Strong | ✓ Combat-load agnostic |
| Revenant death/rebirth loop | Strong | ✓ Normalizes repeated death |
| 9-faction reputation web | Strong | ✓ Can support factional warfare |
| 13-zone act structure | Strong | ✓ Solid backbone |

The premise can support any combat load. It is the *integration* that needs work, not the spine.

---

## 2. Tone audit — does the world feel "dangerous"?

**Starting zones (Crossroads, Covenant)**
- ✓ Convey settlement competence and order ("NO FACTION WARS INSIDE. VIOLATORS SHOT." sign at Crossroads)
- ✗ Do NOT convey "civilization is fragile; outside is lethal"
- ✗ NPCs reference no recent Hollow kills, no battle pressure

**Mid-tier zones (Salt Creek, The Breaks)**
- ✓ Razor wire, kill zones, dread-filled descriptions
- ✓ Pressure narration escalates credibly (0→10)
- ✗ Combat encounters are *optional* (baseChance 0.05–0.25)
- ✗ NPCs don't acknowledge violence

**Late-tier zones (Pens, Pine Sea, Deep)**
- ✓ Thematic horror (bureaucratic dehumanization at Pens; dread of Deep mine)
- ✓ Beauty stands out because the rest is broken (Elk meadow)
- ✗ Encounters still optional via skill gates / difficulty checks

**Verdict:** the *prose* is good. The *expectation* baked into spawn rates is "exploration-first." Battle-MUD pivot needs combat to feel inevitable, not optional, in zones D2+.

---

## 3. NPC voice — battle awareness

**Strong (acknowledge violence today):**
- **Patch** — references combat patients ("stopped being able to describe it"). Baseline of combat-aware NPC writing.
- **Marshal Cross** — frames everything as conflict resource management. "I don't have capacity for mercy. I have capacity for decisions."
- **Lev** — treats player's death/rebirth as a data point. "Scars accumulate."

**Under-implemented:**
- **Warlord Briggs, Vesper, Harrow, Rook, Howard, Sparks** — referenced in world bible but minimal dialogue acknowledging combat.

**Missing entirely:**
- Faction combat assistance (allies join fights based on rep)
- Combat-aware cycle dialogue ("Cycle 8 — impressive you're still breathing")
- Body-count acknowledgment ("You smell like blood." / "Another Hollow down?")
- Faction-warfare events ("Accord and Salters clashed at the ford")

**Bar:** for a battle-MUD, every named NPC should occasionally riff on the danger. Today, only ~3 of ~18 do.

---

## 4. Quest / faction reward structure

| Reward type | Today | Battle-MUD bar |
|---|---|---|
| Faction rep gates | ✓ Implemented | Keep |
| Faction-specific quests | ✓ Implemented | Keep |
| Gear-as-reward | ✗ Generic flavor only | Need origin lore per item |
| Kill-quotas | ✗ None | "Kill 10 Hollow → +1 rep + 500 XP" pattern |
| Faction-flavored loot | ✗ None | "Red Court issue armor — striped red/black" |
| Boss-specific drops | Partial (silver_knife from Elder Sanguine) | Expand to every boss |

---

## 5. World events / pressure cadence

**Current Act-I event sample:** missing guard, Hollow migration, caravan silent, water contamination, MERIDIAN sighting. All atmospheric, not combat-driven.

**Missing:**
- "Hollow swarm converging on Crossroads — Drifters calling for help"
- "Sanguine raiding party hit caravan — survivors dragged south"
- "Accord/Salter clash at ford — recruitment for both sides"

**Pressure system (`lib/hollowPressure.ts`):**
- Rises +1 per 10 actions, caps at 10
- Encounter multiplier 1.0× → 3.0× (modest, reasonable)
- Internal narration is excellent ("One of the shadows is wrong" → "Then screams")
- **Gap:** narration is *internal* (player psychology). NPCs never reference high pressure.

---

## 6. Personal loss integration

5 types: child / partner / community / identity / promise. Surfaces in dialogue trees + Echo mechanic (Hollow mirrors lost person's gesture). Carries forward across cycles.

**Battle-MUD gaps:**
- Combat buff when fighting near loss location? (+1 damage / +1 grit check)
- NPC dialogue acknowledging loss ("I know your child died in [location]. The Hollow are getting bold there.")
- Echo Hollow as a *boss fight*, not optional observation

---

## 7. Endings — combat alignment

All four endings are flag-accumulated, not XP-dependent. **Excellent — player agency survives any combat load.**

**Gap:** none of the four endings has a defined climax boss fight. Each should have:
- **Cure:** fight through Red Court guards at Pens
- **Weapon:** defend synthesis lab from Sanguine saboteurs
- **Seal:** combat-puzzle to set charges
- **Throne:** gauntlet as factions try to stop you

---

## 8. Death / rebirth narrative

**Current:** single death sequence (~500 chars) — header, narrative, stats, echo explainer, closing. "The Between" sequence is excellent (liminal, poetic). Memory fragments from an 18-element pool.

**Risk:** repeated 50–100 times per playthrough at battle-MUD combat density. Same prose by death #3 starts feeling rote.

**Missing:**
- 5–10 death prose variants (combat death ≠ infection death ≠ environmental death)
- Cycle-aware variants (cycle 1 ≠ cycle 8)
- Location-aware variants (Sanguine territory ≠ Deep mines)
- Reputation-aware variants (Accord ally ≠ Red Court enemy)

---

## 9. What breaks under "more battle, more loot, more gear"

### Stays unchanged ✓
- Central mystery (CHARON-7, MERIDIAN, broadcaster)
- Revenant loop
- Faction philosophy
- Personal loss as identity thread
- Four ending choices

### Needs tone adjustment ⚠
1. Room prose in "safe" zones reads as *permanently* safe. Need: "The gate is holding. For now."
2. NPC dialogue is disconnected from violence — needs body-count/faction-impact references.
3. World events are passive, not combat scenarios.
4. Death prose is single-sequence reused 50–100×.

### Needs extension ⚠
1. Gear lore (50+ items need origin stories)
2. Boss intros (8–12 unique opening lines per boss type)
3. Faction-reactive combat (NPCs acknowledge rep during/after fights)
4. Death prose variants (5–10 versions by cause/context)
5. Combat world events (8–12 new events with player participation)
6. Boss encounters (3–5 named with unique stats/loot — overlaps with R4 enemy roster)
7. NPC cycle awareness (cycle 2+ dialogue branches)
8. Sanguine faction warfare events
9. Pressure-visibility events

### At-risk systems
- **Covenant's pacifist tone vs. constant combat outside** — needs narrative bridge ("Wash before entering the square.")
- **Sanguine political division without actual warfare** — factions divided but never fight; pivot must add events showing Covenant of Dusk vs. Red Court conflict
- **Kindling's fire-as-cure vs. combat-heavy gameplay** — the narrative metaphor weakens if fire becomes a generic weapon. Strengthen: "They don't call it genocide. They call it salvation."

### Cut or rework
- Optional Hollow encounters (baseChance 0.05–0.25 too low; raise to 0.30–0.60)
- Skill gates on zone entry (soft gates feel patronizing; replace with hazard descriptions)
- Radio signal as passive (make it *actively attract* dangerous factions)

---

## 10. Top 12 narrative changes (prioritized by risk-of-incoherence)

| # | Change | Risk | Effort | Hours |
|---|---|---|---|---|
| 1 | Death prose variants (5–10) | CRITICAL | M | 8–10 |
| 2 | Gear lore (50+ items) | CRITICAL | L | 15–20 |
| 3 | Boss intros (8–12 types) | HIGH | L | 12–15 |
| 4 | Faction combat dialogue (5–10 lines per faction) | HIGH | M | 8–10 |
| 5 | Room-prose tone retune (Covenant, Crossroads) | MED | S | 2–3 |
| 6 | NPC cycle awareness (Lev, Patch, Cross) | MED | S | 3–4 |
| 7 | Combat world events (8–12 new) | MED | M | 6–8 |
| 8 | Covenant safe-zone paradox bridge | MED | S | 2–3 |
| 9 | Boss-level enemies (3–5 named) — overlaps R4 | MED | M | 10–12 |
| 10 | Sanguine faction warfare events (2–3) | LOW-MED | S-M | 4–6 |
| 11 | Personal-loss combat triggers | LOW-MED | S | 3–4 |
| 12 | Pressure-visibility events | LOW | S | 3–4 |

**Total:** ~80–100 developer-hours.

---

## 11. The single biggest narrative risk

**Without this, the pivot feels stitched together from two games.**

> Player kills 50 Hollow in the Breaks. Player returns to Covenant. NPCs treat the violence as irrelevant. Covenant remains serene and unchanged. Player feels: *"The combat game and the story game are separate."*

In a fantasy RPG, this is acceptable — towns are safe hubs. In a battle-MUD, combat *is* the main feature. Ignoring 50 kills makes the game feel disjointed.

**Coherence solution:** all five subsystems must align.

| Subsystem | Today | Required |
|---|---|---|
| Combat frequency | Sparse | ✓ Mechanical pass (designed in pivot) |
| NPC awareness | Ignores violence | ⚠ Reference kills, faction impact |
| World reactivity | Static | ⚠ Combat triggers events, faction responses |
| Reward loop | Generic gear | ⚠ Every gear piece has origin lore |
| Pressure system | Internal narration | ⚠ Surface in events, NPC warnings, room prose |

---

## 12. Five must-launch systems

For the pivot to feel coherent, these are blockers (not enhancements):

1. **Death prose variants** — prevents narrative fatigue at death #30
2. **Gear lore** — makes loot feel earned, not spreadsheet
3. **Boss intros** — creates fight memory and dramatic impact
4. **Faction combat reactivity** — confirms factions are real actors
5. **Combat world events** — world responds to player violence

The other 7 changes are enhancements; ship them in later convoys.

---

## Top 5 changes Blue must know

1. **Single biggest risk:** NPCs treat violence as irrelevant. Without retrofitting NPC dialogue, the pivot feels like two games stitched together.
2. **Death prose has only one variant.** Will repeat 50–100× under pivot density. Needs 5–10 variants.
3. **Gear has no lore.** 50+ items need origin stories or loot feels random.
4. **No boss intros exist.** Boss fights are mechanically present but narratively flat.
5. **Faction warfare is implied but never enacted.** No events show factions actually fighting each other.

---

## Caveats

- Audit was line-sampled, not exhaustive — some specific NPC dialogue claims should be re-grep'd before being turned into Howler tasks
- Hour estimates assume 1 narrative writer FTE; subagent-author pace may be different
- The "must-launch 5" set is the agent's prioritization — Blue can re-rank if user signals different weighting
