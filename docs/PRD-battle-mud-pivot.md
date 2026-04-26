# PRD: Battle-MUD Pivot — The Remnant

**Version:** 1.0
**Date:** 2026-04-24
**Status:** Draft — awaiting Blue planning pass
**Author:** Primus (product strategy)
**Branch:** dev/battle-mud-pivot

---

## Table of Contents

1. [Problem Statement](#1-problem-statement)
2. [Vision Statement](#2-vision-statement)
3. [Non-Goals](#3-non-goals)
4. [User Stories](#4-user-stories)
5. [Success Metrics](#5-success-metrics)
6. [Functional Requirements](#6-functional-requirements)
7. [Phasing and Convoy Roadmap](#7-phasing-and-convoy-roadmap)
8. [Risks and Mitigations](#8-risks-and-mitigations)
9. [Open Questions](#9-open-questions)
10. [Out of Scope](#10-out-of-scope)

---

## 1. Problem Statement

### The mismatch

The Remnant is built on a battle-MUD shell — 7 classes, combat verbs, traits, a threat pool, a full action-economy engine — but currently runs a narrative-first body inside that shell. A player walking from Crossroads to The Scar can traverse 50 rooms and trigger 2 fights if spawn rolls break against them. Respawn timers run 30–180 minutes, meaning cleared zones stay clear for the rest of the session. The result is a game that *describes* combat as the defining pressure of a post-collapse world but *delivers* a quiet exploration experience interrupted by occasional fights.

The research briefs are direct about the numbers:

- **16 enemies** across 271 rooms. Even at full occupancy that is a 28% room-fill rate. Battle-MUDs target 40–75% (see `docs/research/battle-mud-design.md §Section 1`).
- **5 of 7 classes have no meaningful combat identity.** They are stat-allocation variants of the same attack loop (see `docs/research/gear-stats-audit.md §2`).
- **182 items** in the economy with no random affixes, no rarity tiers, and no boss-unique drops. After one full loot cycle, a second playthrough offers zero gear discovery (see `docs/research/loot-economy-audit.md §8`).
- **Zone spawn-weight skew** is severe: Duskhollow is 100% Shuffler, River Road 92%, Stacks 90% (see `docs/research/enemy-variety-audit.md §3`).
- **No NPC acknowledges violence.** A player who kills 50 Hollow in The Breaks returns to Covenant and finds NPCs chatting as if nothing happened. Only 3 of 18 NPCs have any combat-aware dialogue today (see `docs/research/narrative-coherence-audit.md §3`).

### The risk of doing nothing

The game has strong foundations: a compelling Revenant loop, four genuinely different endings, a faction web with meaningful reputation consequences, and prose that earned its quality through the narrative overhaul convoy. But foundations without density are a demo, not a game. Players who arrive expecting a battle-MUD — the genre framing implied by the UI, classes, and combat verbs — will bounce at cycle 1 when they spend an hour exploring without meaningful combat. The game is currently mis-titled relative to its content.

### The risk of pivoting badly

A brute-force density increase without narrative coherence produces a different failure mode: combat that feels stapled onto the wrong game. The prior-round convoy already established that the narrative spine is compatible with 5–10x combat density (see `docs/research/narrative-coherence-audit.md §1`). The gap is integration, not structure. The pivot must ship mechanics and their narrative counterparts in the same convoy, or players will experience two games stitched together.

---

## 2. Vision Statement

After the pivot, The Remnant becomes a **battle-driven single-player text MUD with Disco Elysium-level narrative density** — where killing and dying are constant, and yet every fight lands in a world that notices. The Revenant does not merely pass through a post-collapse landscape; they cut through it. Zones feel dangerous from the first step, not just from the zone description. Gear drops carry lore, bosses earn their room descriptions, and NPCs respond to the smell of blood on the Revenant's coat.

The design reference points are precise. **Caves of Qud** for the discipline of hand-authored, characterful drops inside a high-density combat encounter structure. **Cogmind** for the idea that every gear swap is a meaningful choice, not a spreadsheet update. **Achaea-style affliction depth** for the principle that combat identity lives in class verbs, not just stats — that each class should play like a different puzzle. **Disco Elysium dialogue** as the benchmark for what NPC awareness of player action looks like at the top of the craft.

What stays the same: the Revenant cycle, the 4 endings (Cure / Weapon / Seal / Throne), the 9-faction reputation web, the personal-loss ritual, the tone (post-apocalyptic dread with poetic interiority), and the TypeScript/Supabase/Next.js architecture.

What changes fundamentally: combat is no longer a door to the narrative — it is the dominant activity. The player should fight 20–40 times per zone clear, meet 6 archetypally distinct enemy types per zone cluster, and discover gear that shifts their build at least once per zone. By cycle 3, the game should feel like a battle-MUD that was always this way.

---

## 3. Non-Goals

The following are explicitly out of scope for this pivot. Any proposal that drifts toward these must be rejected or deferred.

- **Real-time or action combat.** The game remains fully turn-based. No timers, no reaction windows.
- **Multiplayer or co-op.** Single-player only. No shared instances, no server-side synchronization of combat state.
- **Voice acting or audio.** Text-only experience. No sound design work is implied by this PRD.
- **A full UI re-skin.** The terminal aesthetic stays. The pivot may extend the combat log UI, status strip, and color palette; it does not rebuild the UI from scratch.
- **Procedural generation of rooms or maps.** The 271-room, 13-zone structure is fixed. Combat density increases come from tuning spawn tables, not generating new maps.
- **New character classes.** The 7 existing classes (Enforcer, Scout, Wraith, Shepherd, Reclaimer, Warden, Broker) are the class roster. This PRD calls for differentiation, not expansion.
- **Full economy rework beyond the identified gaps.** Crafting, vendor pricing, and stash are patched, not rebuilt from scratch. The economy model remains item-centric.
- **Graphical assets.** No sprites, icons, or imagery. ANSI color codes and text formatting remain the full visual language.
- **Achievements or external meta-progression platforms.** No Steamworks, no cloud leaderboards, no achievement system.

---

## 4. User Stories

**Cycle 1 — First-time player (approx. 0–4 hours)**

> As a first-time player entering Salt Creek for the first time, I want to feel that crossing open ground is a genuine risk — with enemies appearing frequently enough that I'm thinking about loadout and spacing — so that the "post-collapse" premise lands as a lived experience, not a flavor description.

**Cycle 3 — Mid-game player who has cleared their first ending**

> As a cycle-3 Wraith player who achieved the Cure ending, I want a materially different combat experience on this run — because I built around the Shadowblade path and found a named weapon that enables bleed-stacking — so that replaying the same 13 zones feels like a new build experiment rather than a repetition.

**Cycle 5 — Endgame player pushing for a second ending**

> As a cycle-5 Reclaimer targeting the Throne ending, I want the final boss (The Throne itself) to be a genuinely distinct three-phase fight tied to the ending's metaphysics, so that reaching it feels like the climax the lore earned, not a stat check with familiar mechanics.

**Returning player after a break**

> As a player returning after two weeks, I want the combat log, status strip, and gear summaries to be readable at a glance — without re-reading the help docs — so that I re-enter the game's feel in the first 10 minutes rather than the first hour.

**Screenshot / demo audience**

> As a developer showing The Remnant to a potential collaborator or player for the first time, I want to be able to paste a combat sequence that reads like a real fight — with faction-flavored enemies, meaningful gear on the line, a status effect or two, and a boss intro that earns its room — so that the game's identity is legible in a 20-line paste.

**New player evaluating the game (demo window)**

> As a player who has heard "it is a battle-MUD but with real story," I want to encounter my first mini-boss by the end of my second zone and find a named gear item in its drops, so that the promise of the description matches the experience in the first 30 minutes.

**Experienced roguelike player**

> As a player who has finished Caves of Qud and Hades 2, I want each of The Remnant's 7 classes to offer at least 3 build paths that interact differently with the enemy roster — not just different stat spreads — so that I have a reason to attempt multiple full-cycle runs before exhausting the design space.

---

## 5. Success Metrics

These are the launch-readiness gates for the pivot. Each has a baseline drawn from the audit research and a target. A metric without a number attached to a playtest cannot be considered passing.

| Metric | Baseline (today) | Target (post-pivot) | Source |
|--------|-----------------|---------------------|--------|
| **M1 — Combat density** (encounters per 50-room walk, cycle 1, mid-game zones) | ~2–5 fights (28% room occupancy across all zones) | 18–25 fights (40–55% occupancy in zones tier 3+) | `battle-mud-design.md §Section 1` |
| **M2 — Enemy variety** (distinct enemy types per zone, excluding safe hubs) | 2.1 avg distinct types per zone; 4 zones at 80–100% single-enemy skew | 4–6 distinct types per zone; no zone above 70% single-enemy weight | `enemy-variety-audit.md §3` |
| **M3 — Gear discovery rate** (named or unique items found per full zone clear, cycle 1) | ~0 unique/named per zone (all fixed-stat drops; no boss-unique tables) | 1 named/rare item per zone on average; 1 legendary per act boss | `loot-economy-audit.md §4`, `battle-mud-design.md §Section 2` |
| **M4 — Class build viability** (qualitative: each class has 3 distinct viable build paths, assessed via playtest) | 2 of 7 classes have meaningful combat identity (Enforcer, Scout) | All 7 classes have at least 3 viable build paths (Shadowblade / Phantom / Veil example for Wraith); verified via structured playtest across 3 runs per class | `gear-stats-audit.md §2`, `battle-mud-design.md §Section 5` |
| **M5 — Narrative coherence** (qualitative: no reachable game state where 10+ enemies have been killed in a zone and no NPC, world event, or room prose acknowledges it) | NPCs ignore violence in all zones; 0 combat-triggered world events; death prose has 1 variant | Combat-aware NPC dialogue in all 6 named NPCs; 8+ combat world events; 5+ death prose variants; every mini-boss has a named intro; every act-boss has a boss intro | `narrative-coherence-audit.md §3, §8, §12` |

### Stretch metrics (not launch-blocking, tracked post-ship)

| Metric | Target |
|--------|--------|
| Items per hour (full zone clear, cycle 1) | 8–12 items including consumables and currency; 1–2 gear pieces |
| Currency yield per hour (cycle 1) | 40–80 .22 LR per hour (up from 15–40 baseline) |
| Boss encounters per cycle 1 full clear | 13+ (1 per zone); 4 act-boss fights; 4 ending-specific final bosses |
| Schema round-trip tests passing | 100% before each convoy lands |

---

## 6. Functional Requirements

### Pillar A — Combat Density and Spawn Pipeline

The goal is to raise the ambient combat rate from a sparse-encounter exploration game to a battle-MUD baseline of 40–55% room occupancy in mid-game zones (cycle 1), scaling to 60–75% by cycle 5.

| Requirement | Detail | Research ref |
|-------------|--------|--------------|
| **A1** Raise base spawn chance per zone | `baseChance` floors: River Road 0.35, Salt Creek 0.45, Breaks/Dust/Stacks 0.55, Scar/Pens 0.60–0.65. Current values are 0.05–0.25. | `battle-mud-design.md §Section 1`, `narrative-coherence-audit.md §9` |
| **A2** Cycle density multiplier | `effectiveDensity = baseDensity * (1 + 0.06 * cycle)` applied in spawning pipeline. Caps at per-zone ceiling (35% Crossroads / 80% Pens). | `battle-mud-design.md §Section 1` |
| **A3** Reduce respawn timers | Drop respawn timers from 30–180 min to 10–60 min by zone tier. Safe hubs (Crossroads, Covenant) are exempted. | `battle-mud-design.md §Section 1` |
| **A4** Wandering enemies | 1–2 wandering enemies per zone (cycles 1–3), scaling to 3–5 on cycle 5+. Wanderers do not count against per-room cap. Implement via a zone-level wanderer tick in `lib/spawning.ts`. | `battle-mud-design.md §Section 4` |
| **A5** Rebalance single-enemy-skew zones | Duskhollow (100% Shuffler), River Road (92%), Stacks (90%), Dust (80%): add 2–3 zone-appropriate enemy types; redistribute weights to max 70% dominant. | `enemy-variety-audit.md §3, §8` |
| **A6** Guaranteed safe rooms | Every zone retains at least 1 room with zero spawn chance. Battle-heavy does not mean no breathing room. | `battle-mud-design.md §Section 1` |

### Pillar B — Enemy Roster Expansion

Target: 16 distinct enemies → 28–32 (plus 4 ending bosses and 1 optional apex enemy = 33–37 total in data). The expansion addresses four documented gaps: glass-cannon archetype missing, 6 of 7 factions have zero faction-flavored enemies, only 2 zones have boss encounters, and no enemy has true behavioral diversity.

| Requirement | Detail | Research ref |
|-------------|--------|--------------|
| **B1** Glass-cannon enemies (2–3 new) | `Frenzy` — HP 8, DMG 6–12, explodes on death (1d6 splash). `Apex Screamer` — HP 8, DMG 4–10, primal shriek every 2 rounds (stun). Fast-kill enemies that punish carelessness. | `enemy-variety-audit.md §10` |
| **B2** Faction enforcers (5–6 new) | One per missing faction: Drifter Road Warden (River Road), Salter Scout (Salt Creek), Accord Peacekeeper (Covenant outskirts), Kindling Zealot (Ember), Lucid Thrall (Sanguine summoner, Deep). Each has a signature faction mechanic, not just a reskin. | `enemy-variety-audit.md §2`, `battle-mud-design.md §Section 4` |
| **B3** Swarm mechanics (2 new) | `Plague Carrier` — spawns 1d3 copies every 3 rounds (max 5). `Hive Worker` — spawns in groups of 3–5; pheromone alarm if 50% killed. Requires player to have AoE/cleave option first. | `enemy-variety-audit.md §10`, `battle-mud-design.md §Section 4` |
| **B4** Zone-signature mini-bosses (8 new) | 1 per currently-bossless zone: Canyon Sentinel (Breaks), Wildfire Guardian (Dust), Warden Executor (Salt Creek), Pinemother (Pine Sea), Saltwight (Salt Creek alt), Ash Wraith (Ember wanderer-boss), Stack Fixer (Stacks), Drifter Pack Leader (River Road). 2-phase HP mechanic (single threshold). | `battle-mud-design.md §Section 6`, `enemy-variety-audit.md §9` |
| **B5** Boss phase mechanics | All mini-bosses: 1 HP threshold introducing 1 new mechanic. Act bosses (Hive Mother, Elder Sanguine variants): 2 thresholds (75%/35%) + enraged state below 10%. Mechanic per phase: one new behavior, not a stat multiply. | `battle-mud-design.md §Section 6` |
| **B6** Behavioral diversity | Implement `onAttack()` hooks for: crit chance, low-HP flee (some trash), mid-fight summon (existing screamer/hive mother — make it mechanical, not flavor text), environmental awareness (darkness/narrow-passage flags already in room data). At minimum 6 enemies must use a distinct hook. | `enemy-variety-audit.md §5` |
| **B7** 4 ending-specific final bosses | Hollow Avatar (Cure), The Lord of Cups (Weapon), The Sealed One (Seal), The Throne (Throne). 3-phase design: phases driven by ending metaphysics. Distinct movesets, not shared mechanics with skin swap. | `battle-mud-design.md §Section 6`, `narrative-coherence-audit.md §7` |
| **B8** Echo boss (cycle 3+) | Optional encounter: the Revenant's prior-cycle self appears as a boss in one zone per run (cycle 3+). Fights using the player's prior class loadout stats. Drops a unique inheritance item. | `battle-mud-design.md §Section 7` |
| **B9** Surface resistances in-game | When a player hits an enemy and the damage type is resisted or immune, output a one-line tell ("The Shuffler's skin ignores the wound — something else will work better."). Today resistances exist in data but are invisible. | `enemy-variety-audit.md §7` |

### Pillar C — Loot Economy

Current state: 182 fixed-stat items, no random affixes, no rarity tiers, no boss-unique drops, no currency sinks post-initial gearing. Target state: 220–260 items with meaningful variance, a readable rarity layer, and boss-exclusive drops that make boss fights economically distinctive.

| Requirement | Detail | Research ref |
|-------------|--------|--------------|
| **C1** Rarity tier system | 5 tiers: Common / Uncommon / Rare / Epic / Legendary. Tier displayed in item name prefix (color-coded via `lib/ansiColors.ts`). Cosmetic today; gates bonus rules below. | `loot-economy-audit.md §8`, `battle-mud-design.md §Section 2` |
| **C2** Light random affixes (Uncommon+) | Uncommon and Rare items roll 1 optional affix from a curated pool (not a full prefix/suffix generator). Affix pool: 20–30 entries drawn from expanded trait list. Preserves hand-authored item identity at Legendary tier. | `battle-mud-design.md §Section 2`, `loot-economy-audit.md §1` |
| **C3** Boss-unique drop tables | Every mini-boss and act boss has a drop table with at least 1 item unavailable from any other source. These do not need to be Legendary — a named Rare with a short lore line is sufficient. | `loot-economy-audit.md §4, §5` |
| **C4** Drop rate rebalancing | Per-kill distribution targets: 50–60% nothing (trash), 20–25% currency only, 10–15% common consumable, 4–7% common gear, 1–2% rare gear, 0.3–0.5% epic gear, quest-only Legendary. Implement in new `lib/loot.ts` drop resolver. | `battle-mud-design.md §Section 2` |
| **C5** Faction-flavored gear | 6–8 items with faction origin in their name and lore (e.g., "Red Court Issue Armor," "Accord Peacekeeper's Shield"). These are Rare or Epic tier, gated behind faction rep +1 or faction-zone boss drop. | `loot-economy-audit.md §8`, `narrative-coherence-audit.md §4` |
| **C6** 4–6 gear set bonuses | Hand-authored 4-piece sets tied to factions (Covenant Inquisitor Set, Red Court Bloodbound, Salvager's Pact, Hollow-Marked, Throne-Sworn). 2-piece gives minor stat bonus, 4-piece gives a build-altering trait. | `battle-mud-design.md §Section 3` |
| **C7** Durability system | Optional implementation: `durability: number (0.0–1.0)` field on `InventoryItem`. Decays per hit received. Repair via crafting or hubs. If durability is added, repair cost must be priced as a real currency sink (see Open Questions §9 on whether this ships). | `loot-economy-audit.md §3, §8`, `gear-stats-audit.md §8` |
| **C8** Currency sink additions | At minimum: repair services at hub NPCs (if durability ships), junk-salvage-to-materials at hubs (regardless of durability). Salvage prevents stash bloat and adds light crafting input flow. | `loot-economy-audit.md §3` |
| **C9** Auto-loot UX | Currency and common consumables auto-pickup on enemy death. Gear prompts manual pickup with a one-line description. Add `loot all` and `loot <type>` verbs. | `battle-mud-design.md §Section 2` |

### Pillar D — Gear and Class Differentiation

The single biggest design gap: only 2 of 7 classes have meaningful combat identities. All 7 share the same attack loop, 1 ability per fight, no cooldowns, no resource pools. The pivot must rebuild class differentiation without requiring 7 totally separate combat systems.

| Requirement | Detail | Research ref |
|-------------|--------|--------------|
| **D1** Stat bonus field on items | Add `statBonus?: Partial<Record<Stat, number>>` to `Item` type. Apply on equip via `lib/inventory.ts`. This is the single highest-leverage unlock for build viability — gear can now push Wraith toward shadow, Warden toward grit, Broker toward presence. | `gear-stats-audit.md §1, §10` |
| **D2** 4 active abilities + 1 passive per class | Replace the current "1 ability per fight, no cooldown" system with: 4 active abilities per class (each scales off one stat), 1 passive trigger per class. Active abilities have cooldown counts (not timers). Full ability table per `battle-mud-design.md §Section 5`. | `battle-mud-design.md §Section 5`, `gear-stats-audit.md §3` |
| **D3** Class-specific combat verbs in parser | Register class verbs in `lib/parser.ts` gated on `characterClass`. Enforcer: `slam`, `interpose`, `consecrate`, `mark`. Scout: `snipe`, `vanish`, `trap`, `flank`. Etc. Today all classes use `attack` only. | `battle-mud-design.md §Section 5`, `gear-stats-audit.md §3` |
| **D4** Armor slot expansion (1 → 4) | Split single armor slot into head / chest / legs / feet. Each slot has 2–3 viable options per tier. Requires schema migration for equippedArmor to support 4 slots. This is a force-multiplier on every other gear extension. | `gear-stats-audit.md §5, §10` |
| **D5** Initiative system | Add `initiative` field to Item and base calc: `initiativeRoll = 1d10 + reflex + gearInitiative`. Combat order resolves on this roll. Makes reflex a per-fight tactical lever, not just a flee-check stat. | `gear-stats-audit.md §2, §10` |
| **D6** 4 new status conditions | `Marked` (next attack auto-crits), `Silenced` (can't use abilities), `Bound` (can't flee), `Exposed` (-armor effective). Wire into class abilities and 6–8 enemies. Expands condition grid from 6 → 10. | `battle-mud-design.md §Section 8` |
| **D7** 18 weapon traits, 10 armor traits | Expand from 10 weapon / 4 armor traits to 18 weapon / 10 armor traits. New weapon traits: `marking`, `binding`, `cleaving`, `siphoning`, `volatile`, `spectral`, `corrupting`, `salt-touched`. New armor traits: `unbinding`, `clarity`, `salted`, `consecrated`, `lashing`, `aegis`. Each new trait hooks into at least one new status condition. | `battle-mud-design.md §Section 3, §8` |
| **D8** Expand gear item count | Raise total gear items from 28 (16 weapons + 12 armor) to 120–140 (targeting 3–5 viable weapons per class per tier across 5 tiers, plus 4-slot armor). Data-file authoring, not runtime generation. | `battle-mud-design.md §Section 3`, `gear-stats-audit.md §1` |
| **D9** 3 viable build paths per class | For each of the 7 classes, document 3 build paths (e.g., Wraith: Shadowblade / Phantom / Veil). Each path is supported by 2–3 gear items (Rare or Epic) that lock in the path and interact with the class's active abilities. Required for M4. | `battle-mud-design.md §Section 3, §5` |
| **D10** Loadouts (quick-equip) | `loadout save <name>`, `loadout list`, `loadout swap <name>`. 2–3 saved loadouts per character. Persists in player state. Essential once 4-slot armor + frequent swapping is live. | `battle-mud-design.md §Section 8` |

### Pillar E — Narrative Coherence

These are the 5 must-launch narrative systems identified in `docs/research/narrative-coherence-audit.md §12`. They are not enhancements — they are blockers. Each must ship in the same convoy as its mechanical counterpart, not before or after. Shipping gear without gear lore, or bosses without boss intros, produces the "two games stitched together" failure mode the audit describes.

| Requirement | Detail | Research ref |
|-------------|--------|--------------|
| **E1** Death prose variants | 5–10 death sequence variants by cause (combat death, infection death, environmental death), cycle number (cycle 1 vs. cycle 8+), and location (Sanguine territory, Deep mines). Current single sequence will repeat 50–100× at pivot density. Ships with Pillar A (density). | `narrative-coherence-audit.md §8` |
| **E2** Gear lore (50+ items) | Every named item (Rare tier and above) receives a 2–4 sentence origin story surfaced in the `examine <item>` command. Common and Uncommon items get a 1-line descriptor. Ships with Pillar C (loot economy) and Pillar D (gear count expansion). | `narrative-coherence-audit.md §10` |
| **E3** Boss intros | Each boss (mini-boss and act boss) gets a dedicated room-entry description (~3–6 lines) plus an in-combat intro line on first encounter. Final bosses get a full scene introduction. Ships with Pillar B (enemy roster). | `narrative-coherence-audit.md §10`, `battle-mud-design.md §Section 6` |
| **E4** Faction combat reactivity | 5–10 dialogue lines per named faction NPC that reference the player's combat activity. Triggers: kill count in faction-aligned zone, faction rep, hollow pressure. At minimum: Patch, Marshal Cross, Lev, Vesper, Warlord Briggs, Rook. Ships with Pillar A and Pillar B. | `narrative-coherence-audit.md §3, §12` |
| **E5** Combat world events (8–12 new) | Add 8–12 world events with a combat-participation hook: "Hollow swarm converging on Crossroads — Drifters calling for help," "Sanguine raiding party hit caravan," "Accord/Salter clash at the ford." Player can participate and receive rep/loot reward. Ships with Pillar A (density rebalance). | `narrative-coherence-audit.md §5, §12` |

### Pillar F — UX and Readability

A battle-heavy game fails in the terminal if the player can't parse what just happened in 2 seconds. These are UI changes, not feature additions.

| Requirement | Detail | Research ref |
|-------------|--------|--------------|
| **F1** Round summary line | After each combat round, output one colored summary line: `Round 3: You dealt 14 dmg, took 6 (Bleeding 2/3). Brute: 23/45 HP.` This is the signal line; verbose rolls remain available below it. | `battle-mud-design.md §Section 8` |
| **F2** Status icon prefix | `[!B][!P]` (Bleeding, Poisoned) prefix on the player's name in relevant output lines. Single-pass scanning for status state. | `battle-mud-design.md §Section 8` |
| **F3** Verbose / terse combat log toggle | `combatlog verbose` (default for new players) / `combatlog terse`. Persists per session. | `battle-mud-design.md §Section 8` |
| **F4** Faction color coding | Sanguine enemies in red, Hollow in violet, Covenant in gold, Drifters in amber, Meridian in cyan. Applied in combat output and room descriptions via `lib/ansiColors.ts`. | `battle-mud-design.md §Section 8` |
| **F5** Loot summary post-fight | After the last enemy dies, output a compact loot summary: `Loot: 3x .22 LR, 1x bandage, [Uncommon] Reaver's Hatchet.` No auto-scroll hunt for dropped items. | `battle-mud-design.md §Section 2` |
| **F6** Resistance reveal on first hit | On first hit with a damage type that is resisted or immune, surface a one-line tell. Remove the invisible resistance discovery problem. | `enemy-variety-audit.md §7` |

### Pillar G — Endings and Act Structure

The pivot requires four genuine finale fights. Today all four endings are flag-accumulated with no climax combat encounter.

| Requirement | Detail | Research ref |
|-------------|--------|--------------|
| **G1** Hollow Avatar (Cure ending) | 3-phase final boss. Phase 1: the disease made manifest — status-stacking fight. Phase 2: corrupted Revenant form — mirror mechanics (Avatar mimics player's last 3 abilities). Phase 3: the cure-or-be-cured choice expressed as a combat decision, not just a flag. | `battle-mud-design.md §Section 6` |
| **G2** The Lord of Cups (Weapon ending) | 3-phase final boss. Phase 1: the apex Sanguine in political form — dialogue-combat hybrid (Disco Elysium-style, where words do damage). Phase 2: full combat, Sanguine bleed-drain mechanics at scale. Phase 3: the player's own weapon is temporarily turned against them (Bound + Exposed combo). | `battle-mud-design.md §Section 6` |
| **G3** The Sealed One (Seal ending) | 3-phase final boss. Phase 1: the Sealed One half-emergent — player fights while solving the seal-setting mechanic (interleaved combat + puzzle). Phase 2: fully emergent form — high HP, slow telegraphed hits. Phase 3: re-seal vs. strike-down choice expressed through final-round mechanics. | `battle-mud-design.md §Section 6` |
| **G4** The Throne (Throne ending) | 3-phase final boss. Phase 1: the factions try to stop the ascent — gauntlet wave of faction enemies. Phase 2: the Throne itself as architectural/metaphysical entity (environmental damage, room-state mutations). Phase 3: become-or-destroy decision expressed as the final hit. | `battle-mud-design.md §Section 6`, `narrative-coherence-audit.md §7` |

---

## 7. Phasing and Convoy Roadmap

Four convoys, sequenced by dependency. The rule for sequencing is: validate riskiest assumptions earliest, and narrative counterparts ship in the same convoy as their mechanical parents.

### How to read this table

- **Convoy-cycles** = estimated number of parallel Howler runs (not calendar time). Each cycle is one Gold dispatch + Howler execution + White/Gray quality gate.
- **Launch-blocking** = a Yes here means the game should not ship a public release without this convoy.
- **Narrative gate** = which Pillar E systems must ship within this convoy.

| Convoy | Name | Pillar scope | Narrative gate | Dependencies | Cycles (est.) | Launch-blocking |
|--------|------|-------------|----------------|--------------|--------------|-----------------|
| 1 | **Combat Spine** | A (spawn density + wanderers), B (glass-cannon + faction enforcers + behavioral diversity + resistance reveal), F (combat log UX) | E1 (death prose variants), E4 (faction reactivity, partial — priority NPCs only), E5 (combat world events) | None — first convoy | 3–4 | Yes |
| 2 | **Gear Overhaul** | C (rarity tiers, random affixes, drop tables, boss-unique drops, auto-loot UX), D1 (stat bonus field), D4 (armor slot expansion), D5 (initiative), D7 (new traits), D8 (gear count expansion) | E2 (gear lore — all Rare+ items in this convoy's new gear batch) | Pillar A live (density must exist for drop rates to be testable) | 3–4 | Yes |
| 3 | **Class Identity** | D2 (4 active + 1 passive per class), D3 (class verbs), D6 (new status conditions), D9 (build paths), D10 (loadouts), C6 (set bonuses) | E2 (gear lore — remaining items from set bonuses + class gear), E3 (boss intros for mini-bosses added in this convoy) | Pillar D1 + D4 + D7 live (stat bonus and armor slots must exist before abilities that key off them) | 3–4 | Yes |
| 4 | **Endings and Apex Content** | B7 (4 ending bosses), B8 (Echo boss), G1–G4 (ending mechanics), C7 (durability — if approved in Open Questions), C8 (currency sinks) | E3 (full boss intros including final bosses), E4 (faction reactivity — remaining NPCs), E2 (ending-specific legendaries) | All prior convoys — ending bosses require class abilities, gear system, and density to be testable | 2–3 | Yes (for soft-launch); can ship without C7 if durability deferred |

### Sequencing rationale

Convoy 1 ships first because density is the core premise test. If the game doesn't feel like a battle-MUD after Convoy 1, the rest of the pivot is building on a failing foundation. The risk is caught early and cheap to correct.

Convoy 2 can begin as soon as Convoy 1's spawn tables are testable — it does not need Convoy 1 fully stable, only its data outputs available to test drop rates against. This creates a potential 1-convoy overlap.

Convoy 3 is gated on Convoy 2's `statBonus` field and 4-slot armor because class abilities that reference `+vigor gear` or `shadow armor sets` cannot be authored without those systems live.

Convoy 4 is the only truly serial dependency — final bosses must be tested against a fully built class system and gear economy, or the balance is fiction.

---

## 8. Risks and Mitigations

| # | Risk | Probability | Impact | Mitigation |
|---|------|-------------|--------|-----------|
| **R1** | Convoy 1 density increase makes cycle-1 punishing for new players — Revenant dies 20+ times in the first zone and bounces | Medium | High | The prior combat onboarding research (`combat-onboarding-accessibility.md`) identified tutorial scaffolding hooks. Covenant and Crossroads remain zero-spawn safe zones. Pillar A requires a guaranteed safe room per zone. Add a cycle-1 explicit tip: "Combat is frequent and lethal. The Between is not a failure state." Tune Crossroads and River Road to the lower end of density targets on first run. |
| **R2** | Narrative dissonance accumulates during the long retrofit window — Convoys 1–3 land mechanics without their full narrative counterpart, and playtesters experience the "two games" problem | High | High | The must-launch 5 (Pillar E) are gated per convoy. Convoy 1 does not close without E1 (death prose), E4 (partial), and E5 (combat world events). No convoy ships a mechanic without its narrative parent in the same batch. White's post-convoy review includes a narrative coherence check, not just a code review. |
| **R3** | Save/load schema drift — 4 convoys each adding fields (armor slots, stat bonuses, ability cooldowns, durability, rebirth perks) causes round-trip failures in production or test | High | Critical | Per CLAUDE.md rule #1, every new save field requires a Supabase migration before the save payload changes. Blue must include a schema-migration task at the top of every Howler task list. Gray runs round-trip save/load tests every convoy as a quality-gate requirement. No convoy passes White + Gray gate without a passing round-trip test. |
| **R4** | Class differentiation balance — giving 7 classes 4 active abilities each creates 28 new verbs that interact with new status conditions, new enemy behaviors, and new gear; balance is untestable in one pass | Medium | High | The active-ability framework (4 + 1 passive) is designed so each ability scales off exactly one stat (`slam` → vigor, `vanish` → shadow, etc.). This constrains the interaction surface. Convoy 3 ships abilities class-by-class, not all 7 at once, so each class can be smoke-tested before the next is added. Balance targets are "3 viable paths" (qualitative), not min-maxed numerical targets. |
| **R5** | Content-authoring bottleneck on gear lore — 50+ items need 2–4 sentence origin stories; this is creative writing, not logic work, and a single Howler may produce inconsistent voice | Medium | Medium | Lore-batch Howlers are given the NARRATIVE_BIBLE.md as their style brief. Gear lore tasks are batched by faction (all Covenant gear in one task, all Sanguine gear in another) so each Howler has a coherent thematic frame. White's quality gate includes a tone-consistency check on lore output. |
| **R6** | Player-experience whiplash for existing playtesters who have a mental model of a quieter game | Low | Medium | Versioned release notes per convoy ship alongside the build. The playtest harness (if available) is updated to flag before/after comparisons explicitly. The PRD's vision statement is shared with playtesters before Convoy 1 ships so the pivot intent is explicit, not a surprise. |
| **R7** | Armor slot expansion (1 → 4 slots) causes schema migration to be larger and riskier than anticipated, blocking Convoy 2 | Medium | High | This migration is scoped as Convoy 2's first task, before any Howler writes gear data. Blue's plan must include a rollback plan for the migration. Dev-mode round-trip tests run against the new schema before any gear content is authored against it. |
| **R8** | Ending bosses (Convoy 4) are underspecified — the 3-phase fight designs in Pillar G are outlines, and full implementation requires story decisions not yet made | High | Medium | The 4 ending boss briefs in `battle-mud-design.md §Section 6` are sufficient for Convoy 4 planning only if the ending flag structure is stable. Open Question OQ3 (whether cycle-3 cycleGate-locked Scar/Pens design survives) must be resolved before Convoy 4 scoping. If OQ3 is unresolved, Convoy 4 is still executable with placeholder bosses, but final mechanics must wait. |

---

## 9. Open Questions

These are decisions that the research cannot resolve. Blue and the user must answer each before or during the convoy it gates.

| # | Question | Gates | Recommended default if unanswered |
|---|----------|-------|----------------------------------|
| **OQ1** | Does the cycle-3 endgame design (cycleGate-locked Scar and Pens zones) survive the pivot, or is access loosened for battle-MUD density reasons? A player locked out of 2 zones loses 20% of the best boss encounters. | Convoy 4 scoping | Keep gate; add a "Scar reputation shortcut" so high-rep players can enter at cycle 2. |
| **OQ2** | Are random affixes (Pillar C, req C2) the right lever, or do we keep strictly hand-tuned drops for narrative curation? Random affixes add replayability but risk procedurally generated text breaking the voice of named items. | Convoy 2 design | Light affixes only (1 optional trait roll from 20–30 curated entries) — not full prefix/suffix generation. |
| **OQ3** | Does durability ship in Convoy 4 (as a currency sink), or is it deferred indefinitely? Durability creates a real economic loop but adds friction in a game where death is already the primary consequence. | Convoy 4 scope | Defer to post-launch unless currency sink problem becomes critical in playtests. |
| **OQ4** | Do the 7 classes stay as-is, or does the pivot add 1–2 new classes optimized for the battle-heavy design (e.g., a dedicated summoner or berserker)? | Convoy 3 scope | No new classes in this pivot. Differentiation work on existing 7 classes first. |
| **OQ5** | Should the pivot ship as one big public release after all 4 convoys land, or as rolling preview branches (e.g., Convoy 1 goes to a dev-preview branch after passing quality gate)? | All convoys | Rolling preview branches: each passing convoy becomes a testable state on a named branch. Full public release after Convoy 4 quality gate. |

---

## 10. Out of Scope for This PRD

The following are explicitly deferred to Blue (implementation planning) or Howlers (execution):

- File-level work breakdown (which files each Howler owns, line-level scope)
- Supabase migration SQL
- TypeScript interface definitions and implementation specifics
- Test case authoring
- SPLIT.md file ownership matrices
- Visual design, typography, or Tailwind class choices
- Exact enemy stat tuning (HP/ATK/DEF numbers beyond the archetypes noted)
- Specific dialogue line authoring (that is Howler creative writing work within the boss-intro and gear-lore briefs)
- Rebirth tree / permanent upgrade system design (referenced in `battle-mud-design.md §Section 7` as P11 — a strong candidate for a future wave but not in scope for this pivot)
- Socket / rune system (flagged as a future extension in `battle-mud-design.md §Section 3` — deferred until gear count expansion lands first)

---

*Research citations in this document trace to five Wave-1 briefs in `docs/research/`: `battle-mud-design.md`, `loot-economy-audit.md`, `gear-stats-audit.md`, `enemy-variety-audit.md`, `narrative-coherence-audit.md`. All baselines are drawn from those audits. Blue should re-verify specific counts via grep before committing to Howler task sizes.*
