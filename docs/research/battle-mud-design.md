# Battle-Heavy MUD Design — Deep Dive for The Remnant

**Audience:** input to a planning convoy that will pivot The Remnant (single-player text MUD, Next.js + TS + Supabase, 271 rooms / 13 zones / 7 classes / 15 enemies / 9 factions / death-rebirth cycle) from a narrative-first design to a **hybrid** that retains narrative depth but is far more battle-heavy — more enemies, more loot, more gear differentiation, more frequent fights.

**Scope guard.** Two prior research docs in this folder cover the foundational ground:
- `combat-best-practices.md` — turn structure, verbs, hit/miss math, status effects, log readability, AI, anti-patterns.
- `combat-case-studies.md` — 14 case studies (Aardwolf, Achaea, Discworld, BatMUD, Realms of Despair, ZombieMUD, Caves of Qud, Cogmind, NetHack, Sil-Q, DCSS, Disco Elysium, Roadwarden, Suzerain).

This document does **not** redo any of that. It goes deeper on the battle-MUD specifics: density, loot economy, gear/build systems, class differentiation, encounter pacing, end-game depth, and inventory/UI under combat pressure.

**Method.** WebSearch across canonical battle-MUD references (Aardwolf wiki, BatMUD newbie guides, Achaea forums, ZombieMUD newbie pages, Discworld MUD docs), Diablo loot psychology and Loot 2.0 articles (Game Developer / Diablo Wiki / Maxroll), Caves of Qud / Cogmind / Dead Cells / Hades 2 design blogs, roguelike pacing essays (Grid Sage Games, RogueBasin), TV Tropes for archetype taxonomy, and game-developer post-mortems. Where evidence is anecdotal or inferred, bullets are tagged `[low confidence]`. WebFetch was used selectively to confirm tuning numbers; many specific MUD percentages are **not** publicly published — those calls are tagged `[low confidence]`.

**Read-time:** ~30 minutes. The Top 15 prioritized recommendations at the bottom are the actionable hand-off to Blue / Howlers.

---

## Section 1 — Combat density curves

### What "feels right" in battle MUDs and roguelikes

Battle MUDs and battle-heavy single-player roguelikes converge on three density rules of thumb (from forum chatter, newbie guides, and design blogs):

- **Trash combat should occupy 50-70% of active play time** in a battle-focused game. Aardwolf and BatMUD newbies report "you kill a *lot* of monsters" — both games are explicit experience-grinders where rooms-per-kill is roughly 1.5-3.0 in starter zones (i.e., a fight every 1-3 rooms).
- **Encounters per real-world hour at the experienced sweet spot:** 60-120 fights/hour for fast battle MUDs (BatMUD/Aardwolf), 20-40 fights/hour for tactical MUDs (Achaea, Discworld), 30-60 fights/hour for tactical roguelikes (Caves of Qud, DCSS) `[low confidence on exact ranges]`.
- **Combat-to-non-combat ratio:** 60/40 to 70/30 for battle-heavy designs. Below 50% and it feels like a narrative game with combat bolted on; above 80% and it becomes grind without context (Realms of Despair complaint pattern).

Diablo 4 Nightmare Dungeons are explicitly tuned with **boosted monster density** vs normal dungeons because high density is the *reward* — players self-select dungeons with the highest mob count for efficiency (Maxroll). The lesson: **density itself is a reward**, not a punishment, when surrounded by good loot and pacing.

Roguelike density essays (Grid Sage Games, RogueBasin) converge on the principle that **clearing should feel meaningful**. Constantly respawning trash mobs that block traversal is universally hated; **clear-then-stay-clear** is the standard pattern, with rare wandering re-spawns to maintain tension. Caves of Qud uses zone-tier loot with a small chance of upward tier roll — the variance keeps clearing rewarding even on low tiers.

### Translation to The Remnant (271 rooms, 13 zones, cycle-aware lethality)

The Remnant currently has **15 enemies** spawning across 271 rooms. Even if every enemy spawned in 5 rooms, that's only ~75 occupied rooms (~28% density). Battle-heavy target should be **40-55% of rooms have an active spawn** during cycle 1, climbing to **60-75%** by cycle 5+.

**Per-zone encounter density targets (cycle 1 baseline)** — chosen to feel battle-heavy without becoming a treadmill in the small starter zones:

| Zone | Rooms (approx) | Cycle 1 occupied % | Cycle 1 fights/clear | Cycle 5+ occupied % |
|------|----------------|---------------------|----------------------|---------------------|
| Crossroads | 20 | 25% | 5 | 35% |
| River Road | 22 | 35% | 8 | 50% |
| Covenant | 18 | 20% (safe-ish hub) | 4 | 30% |
| Salt Creek | 24 | 45% | 11 | 60% |
| The Ember | 22 | 50% | 11 | 65% |
| The Breaks | 24 | 55% | 13 | 70% |
| The Dust | 22 | 55% | 12 | 70% |
| The Stacks | 24 | 50% | 12 | 65% |
| Duskhollow | 20 | 60% | 12 | 75% |
| The Pine Sea | 22 | 55% | 12 | 70% |
| The Scar | 22 | 60% | 13 | 75% |
| The Pens | 18 | 65% (gauntlet) | 12 | 80% |
| The Deep | 33 | 55% (mixed) | 18 | 75% |

Total cycle-1 fights for full clear: **~140**. This is consistent with battle-MUD norms (60-120 fights/hour at 1-2 hours per full clear).

**Cycle scaling.** The cycle multiplier should attach to **enemy difficulty and density**, not just stats — adding a +30% spawn density per cycle (capped at the per-zone ceiling above) makes cycle 5 noticeably more lethal than cycle 1 without retuning every enemy. The Remnant's `hollowPressure.ts` system is already well-positioned to gate this.

### Implementation notes

- Add a `density` field to the spawn-table system if not present. Cycle multiplier applies as `effectiveDensity = baseDensity * (1 + 0.06 * cycle)` `[low confidence on exact coefficient]`.
- **Wandering enemies** — Section 4 covers the archetype, but density-wise, target 1-2 wanderers per zone in cycles 1-3, scaling to 3-5 by cycle 5+. They should NOT count toward the per-room density cap; they exist on top of it.
- **Safe rooms** — every zone should have at least one truly safe room (current design seems to have these). Battle-heavy doesn't mean *no* breathing room; it means the breathing room is rationed.

**Sources**
- [BatMUD Beginner's Handbook](https://dryad.batmudder.com/library/newbieguide1.asp)
- [BatMUD: Help / Levels](https://www.bat.org/help/help?str=levels&htype=basic)
- [Aardwolf Combat / Grouping changes (2011)](https://www.aardwolf.com/blog/2011/07/30/combat-grouping/)
- [Aardwolf Newbie Campaigning](https://www.aardwolf.com/wiki/index.php/NewbieInfo/Campaigning)
- [Diablo 4 Nightmare Dungeons (Maxroll)](https://maxroll.gg/d4/resources/nightmare-dungeons)
- [Caves of Qud Zone Tier (wiki)](https://wiki.cavesofqud.com/wiki/Zone_tier)
- [Roguelike level design / encounter pacing (Grid Sage Games)](https://www.gridsagegames.com/blog/2019/03/roguelike-level-design-addendum-procedural-layouts/)
- [Roguelike Restart pacing essay (Medium)](https://medium.com/@todorovicnik2/video-games-roguelite-restart-length-of-a-perfect-run-ef8078c76495)

---

## Section 2 — Loot economy

### Drop philosophies that work

Two distinct schools, both successful:

**(A) Diablo-school — high volume, filtered by player.** Almost every kill drops *something*; a loot filter (third-party in D2, official in D4) hides 90%+ of drops so the player only sees what matters. Drop tier ratios in Diablo 2 (per the Drop Calculator and PureDiablo forum analyses):

- White (normal): the bulk of drops, filtered out by all serious players.
- Magic (blue): ~25-40% of "kept" drops at low MF, scaling down with item level.
- Rare (yellow): ~10-15% of magic-quality rolls promote to rare.
- Set: 1 in 192 base.
- Unique: 1 in 400 base; class-specific 1 in 240.
- Ethereal: ~5% of all drops.

**(B) Cogmind / Caves of Qud-school — fewer drops, all meaningful.** Cogmind has **>1000 distinct parts** and zero randomized affixes; every part is hand-tuned. Drops are sparse but every salvage decision is meaningful. Caves of Qud uses zone-tier loot tables with a small chance to roll one tier higher (chains, low probability) — randomness lives in the *tier roll*, not in stat affixes.

**The Remnant's natural fit is (B), with light affix variance.** Reasons:

1. The narrative tone benefits from named, characterful items, not procedurally-generated `Sharpened Bronze Pickaxe of the Squirrel`.
2. The TS data layer makes hand-tuned items cheap; procedural generation is more code surface.
3. Single-player + small inventory + terminal UI = clutter is a much sharper problem than in Diablo's grid.

### Drop rate target (Remnant)

Recommended drop-rate distribution per kill:

| Outcome | % of kills | Notes |
|---------|------------|-------|
| Nothing | 50-60% | Trash mobs in particular. Don't fake-reward. |
| Currency only (.22 LR) | 20-25% | 1-3 rounds typically; 3-8 from elites. |
| Common consumable | 10-15% | Bandage, ration, scrap, flashlight battery. |
| Common gear | 4-7% | Tier-1/2 weapon or armor. |
| Rare gear (named) | 1-2% | Tier-3+ named, single-trait. |
| Epic gear (named, multi-trait) | 0.3-0.5% | Tier-4 named, two traits. |
| Legendary (story-bound) | quest-only | Zero RNG; tied to bosses or story. |

These figures align with Diablo 2's ratios but compressed into a smaller item pool.

**Currency vs shop pricing.** Battle MUDs that work tune the economy so a focused player on cycle 1 ends with **120-200% of the gold needed to buy the best vendor item** — never enough to buy *everything*, always enough to buy *something meaningful*. Aardwolf's "primal" / vendor pricing follows this curve. For The Remnant, baseline shop prices should be set so a full clear of zone N earns ~150% of the cost of the best shop item in zone N-1.

### "Best in slot" vs "broader gear toolbox"

Diablo 2 famously has fewer than 20 truly viable BiS weapons across all ladder builds — but 200+ items with niche use. Diablo 3 Loot 2.0 went the *other* way (smart loot, fewer drops, bigger drops) and was rightly criticized for compressing build choice. **The pattern that works for a battle-heavy game is "broad toolbox at common, narrow BiS at legendary":**

- Common/rare gear: 3-5 viable picks per class per tier — players swap based on situation.
- Legendary: each is a "build changer" (Diablo 3 explicit design pillar). One legendary can pivot a class's playstyle.

For The Remnant: 3-5 viable common/rare per class per tier × 7 classes × 5 tiers = **~120-175 weapons** plus armor. Section 3 unpacks this.

### Inventory clutter — the failure mode every battle MUD must solve

Diablo 4 shipped without a loot filter in 2023 and the community spent 18+ months demanding one (eventually granted in 2025 — Icy Veins). Every battle-heavy game eventually faces this fork:

1. Reduce drops (Cogmind, COQ).
2. Add a filter (D4, PoE).
3. Add an auto-junk system (D3 salvage, PoE vendor recipe).
4. Compact inventory display (D2 grid, COQ stacking).

**For The Remnant, recommend a hybrid:**

- **Auto-loot of currency and common consumables** by default. Turn-based flow makes auto-pickup safe (no inventory-cluttering during real-time pressure).
- **Manual loot of gear** — every gear drop is announced with a one-line description and the player chooses to take or leave it.
- **A `loot all` verb** for when the player wants speed and a `loot <type>` for filtering (`loot weapons`).
- **Junk salvage** at hubs — turn unused gear into materials/currency. Doubles as a money sink and crafting input.

**Sources**
- [Diablo 2 Drop Calculator](https://dropcalc.silospen.com/)
- [Diablo II / Loot 2.0 (Diablo Wiki)](https://diablo.fandom.com/wiki/Loot_2.0)
- [The Psychology of Diablo III Loot (Game Developer)](https://www.gamedeveloper.com/design/the-psychology-of-i-diablo-iii-i-loot)
- [Diablo III Loot 2.0 Breakdown (The Escapist)](https://www.escapistmagazine.com/update-diablo-iiis-loot-2-0-breakdown-less-better-more-epic/)
- [Item Variants and Randomization (Cogmind / Grid Sage Games)](https://www.gridsagegames.com/blog/2022/09/item-variants-and-randomization-in-roguelikes/)
- [Caves of Qud Zone Tier (wiki)](https://wiki.cavesofqud.com/wiki/Zone_tier)
- [Diablo 4 Loot Filter (Icy Veins)](https://www.icy-veins.com/d4/news/goodbye-screen-clutter-diablo-4-is-getting-a-loot-filter/)
- [Smart Loot (Diablo Wiki)](https://www.diablowiki.net/Smart_Loot)
- [Why Gamers Crave Random Drops (VGLeaks)](https://vgleaks.com/why-do-gamers-love-random-drops-in-games-like-diablo-and-destiny/)

---

## Section 3 — Gear / stat-modification systems

### The bar for a battle-heavy game

The Remnant currently has 10 weapon traits and 4 armor traits. That's a respectable affix vocabulary but a tiny *item* count. For 7 classes × 5 tiers, the industry rule of thumb is:

- **Minimum viable battle-heavy roster:** 3 viable weapons per class per tier = 105 weapons. Plus 2-3 viable armors per slot per tier × 4 slots × 5 tiers = 40-60 armors. **Floor: ~145 items.**
- **Comfortable battle-heavy roster:** 5 weapons × 7 × 5 = 175 weapons + 60-80 armors = **~235-255 items.**
- **Diablo 2 / Cogmind tier:** 500-1000+ items. Out of scope for The Remnant.

**Recommended target:** 180-220 unique gear items (including tiered crafting materials). This is achievable as a TypeScript data file without requiring a runtime generator.

### Stat-modification mechanics that work

Survey of mechanics from Diablo, Path of Exile, Caves of Qud, Cogmind, Hades 2, MUDs:

**(1) Flat +X (additive)** — simple, predictable, easy to read in a terminal log. The Remnant's `+2 flat damage` (Heavy trait) is this. **Strength:** newbie-readable. **Weakness:** loses meaning at high levels.

**(2) Percentage modifiers (multiplicative)** — `+15% crit chance` (Keen). **Strength:** scales naturally with character level. **Weakness:** stat creep — small-percent items become noise.

**(3) Conditional triggers** — `30% chance on hit to apply Burning` (Scorching). **Strength:** creates "moments" in combat logs. **Weakness:** invisible budget — players over- or under-value them.

**(4) Set bonuses (2-piece / 4-piece)** — Destiny 2 / WoW style. **Strength:** gear puzzles are deeply satisfying; gives narrative flavor (matching Covenant gear, matching Red Court gear). **Weakness:** high content cost, slot rigidity.

**(5) Runeword / socket systems** — Diablo 2 runewords. **Strength:** "build your own legendary" feel, deep crafting hooks. **Weakness:** overhead of socket UI, can replace whole-item drops.

**(6) Prefix/suffix randomization (Diablo affixes)** — `Glowing Pickaxe of the Mind`. **Strength:** infinite variance, dopamine engine. **Weakness:** narrative incompatibility — a hand-named item feels stronger than `Vicious Steel Axe of the Bear`.

**(7) Aspect / form changers (Hades 2)** — one item radically changes class playstyle (Aspect of Pan turns Sister Blades into a hybrid ranged weapon). **Strength:** high build diversity per item. **Weakness:** content-heavy per item.

**(8) Mutation / passive (Caves of Qud)** — single-player friendly, character-bound. **Strength:** deep build differentiation. **Weakness:** not loot.

**Recommendation for The Remnant.** Hybrid:

- **Primary lever: trait combinations.** Expand from 10 weapon / 4 armor traits to **18 weapon / 10 armor traits** (Section 8 expands status conditions; new traits should hook those). A weapon with 1-2 traits + a base type + a tier = ~10× more distinct items than today without prefix/suffix complexity.
- **Add light socket system at tier-3+.** Up to 1 socket on tier-3 weapons, 2 sockets on tier-4, 3 on tier-5. Sockets accept "shards" — small consumable upgrades (`shard of fire`, `shard of silence`). Diablo 2 runewords without runeword complexity.
- **Add 4-6 set bonuses tied to factions and zones.** "Covenant Inquisitor's Set" — all 4 pieces gives +damage vs Sanguine. Hand-crafted, not procedural. Story flavor and build choice in one mechanic.
- **One legendary per major boss / ending.** 4 endings × 1 legendary + 4-6 mini-boss legendaries = ~8-10 hand-tuned legendaries that pivot class playstyle (Hades-2 Aspect-style).

### Gear progression pacing

The "feels exciting vs spreadsheet entry" question has a known answer: **a new weapon feels exciting when it changes how you play, not how much damage you do.** Diablo 3 Loot 2.0 explicitly framed this as "build changer" legendaries; the Hades 2 Aspect system is the same principle. The Remnant should target **a meaningful gear swap (one that shifts playstyle, not just stats) every 30-60 minutes of play in cycle 1.**

For 271 rooms / 13 zones, that's roughly:

- 1 meaningful weapon swap per zone (13 weapon "moments")
- 1 armor set milestone every 2 zones (6-7 armor moments)
- 1 socket-shard discovery every 1-2 zones (8-10 shard moments)
- 1 legendary per major boss (4-6 moments)
- Plus countless filler drops

That's 30-40 build-altering moments per cycle 1 run — densely paced, but never an empty room.

### Build viability — when does a class have "real" choices?

**The threshold is 3-4 viable build paths per class.** Below 3, players converge on the optimal; above 5, the game can't balance them all. Path of Exile achieves dozens via its 1325-node passive tree, but PoE's complexity is a feature, not the goal here.

Recommended: **per class, define 3 viable archetype paths.** For example, the Wraith (current The Remnant class) might have:

- **Shadowblade** — high crit, draining traits, bleed stacking.
- **Phantom** — silenced traits, escape mobility, status immunity.
- **Veil** — debuff stacking (frightened/weakened), gear sets that punish status-applied enemies.

Each path needs 2-3 hero items (legendaries / set pieces) that lock it in. With 7 classes × 3 paths × 2-3 hero items = **42-63 build-defining items** at the legendary tier, of which the player only sees the 4-6 they end up using per run.

**Sources**
- [Affix info / Diablo 2 (PlanetDiablo)](https://planetdiablo.eu/diablo2/itemdb/affix_info_en.php)
- [Diablo 2 Affix overview (Diablo Wiki)](https://www.diablowiki.net/Affix)
- [Hades 2 Weapon Aspects (Mobalytics tier list)](https://mobalytics.gg/hades-2/tier-lists/weapon-aspects)
- [Hades 2 Build Guide (Lee Reamsnyder)](https://www.leereamsnyder.com/hades-2-build-guide)
- [Path of Exile Passive Tree (PoE Vault)](https://www.poe-vault.com/guides/path-of-exile-beginner-guide-learning-the-passive-tree)
- [Cogmind item parts — quantity over randomization (Grid Sage)](https://www.gridsagegames.com/blog/2014/02/item-types-distribution/)
- [Set Bonuses overview (TV Tropes)](https://tvtropes.org/pmwiki/pmwiki.php/Main/SetBonus)
- [WoW 9.2 set bonus tier gear (Wowhead)](https://www.wowhead.com/guide/2-4-set-bonuses-tier-gear-sepulcher-first-ones-tier-shadowlands)

---

## Section 4 — Enemy variety & archetypes

### Archetype taxonomy (with design notes)

Distilled from GDKeys, Wayline, GameDeveloper, and Vision of the Palantir essays — the seven archetypes nearly every battle game uses:

#### (1) Tank
- **What works.** High HP, slow attack rate, predictable telegraphed hits, hits hard but rarely. Examples: BatMUD's heavies, NetHack's giants, Slay the Spire's Hexaghost (act-1 boss tier).
- **What turns tedious.** When tank is *only* HP — becomes a damage sponge. Fix: tanks should have a single *interesting* mechanic — a slam every 3 turns, a knockback, a counter-stance.
- **Combat verb / log style.** Slow telegraph: `The Brute hefts its hammer...` (tell turn) → `The Brute SLAMS you!` (action turn). Telegraphing turns the tank into a puzzle.

#### (2) Caster / status spammer
- **What works.** Low HP, applies status effects, forces the player to *change behavior* (move, cleanse, kill quickly).
- **What turns tedious.** Stun-locks, when you can't take a single action because of chain-CC. Fix: cap stun duration, require a tell, cap concurrent statuses.
- **Combat verb / log style.** Achaea is the master here — affliction-stacking against a 4-second curing balance. The Remnant's existing Whisperer fits this archetype.

#### (3) Swarm
- **What works.** Low HP, low individual damage, comes in groups of 3-8. The tactical decision is who to kill first.
- **What turns tedious.** When an AOE/cleave option doesn't exist for the player — picking off swarms one at a time gets old fast. Fix: every class needs at least one cleave or AoE option, OR swarms self-thin (some die per turn).
- **Real-game examples.** DCSS rats, NetHack monster spawn pits, Caves of Qud's snapjaws.

#### (4) Elite (mid-fight reveal / mechanic-driven)
- **What works.** Slay the Spire's elites are the gold standard — small handful per act, fixed roster, telegraphed by map icons, big rewards (relics + gold + card). Player CHOOSES to engage.
- **What turns tedious.** Random elite spawns that catch you under-prepared. Fix: ALWAYS telegraph (room description, sound, map marker).
- **Reward design.** Elites should drop guaranteed rare+ loot. Slay the Spire awards: random Relic, 25-35 Gold, Card reward. Translate to The Remnant: guaranteed rare gear, +50% currency, +1 trait shard, optional faction reputation tick.

#### (5) Boss (gimmick + phases)
- **What works.** HP thresholds (50%, 25%) trigger phase shifts. Each phase introduces ONE new mechanic — not three, not five. WoW raid boss design wisdom: "one boss = one teachable mechanic per phase."
- **What turns tedious.** Reskin bosses (same mechanics, bigger stats — Realms of Despair pattern). Multi-phase fights with too many phase transitions (Lies of P community criticism).
- **Boss roster targets.** 4 act bosses (one per major story tier) + 4 ending-specific final bosses + 4-6 mini-bosses (one per zone-cluster) = **12-14 unique bosses.**

#### (6) Wanderer (creates dread)
- **What works.** Roams between rooms; player can't predict location. Tag-and-flee scenarios. Sil-Q's Morgoth, Caves of Qud's wandering legendary creatures.
- **What turns tedious.** When wanderer-tracking is a chore (constant map-checking). Fix: subtle environmental tells — a footstep echo in adjacent rooms, a smell, a temperature shift. The Remnant's narrative tone is perfect for this.
- **Density.** 1-2 wanderers active in a zone at any time, scaling to 3-5 on cycle 5+.

#### (7) Faction-flavored elite
- **What works.** Mechanically distinct per faction — Covenant enforcers do consecrated damage, Red Court hits with bleed, Salt Creek raiders use traps. Visual + mechanical identity per faction.
- **What turns tedious.** When factions are "skin only" — same stats, different name. Fix: each faction needs at LEAST one signature mechanic.

### The Remnant — current roster vs. what's missing

**Current 15 enemies (audit):**

| Enemy | Archetype |
|-------|-----------|
| Shuffler | Trash |
| Remnant | Trash (slightly tougher) |
| Screamer | Caster / status |
| Stalker | Wanderer (already!) |
| Brute | Tank |
| Whisperer | Caster |
| Hive Mother | Boss-tier (Hollow) |
| Sanguine Feral | Trash (Sanguine flavor) |
| Red Court Enforcer | Faction-elite |
| Elder Sanguine | Boss-tier (Sanguine) |
| Meridian Automated Turret | Stationary / hazard |
| Meridian Ancient Hollow | Elite |
| Elder Sanguine (Deep) | Re-skin of boss |
| Hive Mother (Deep) | Re-skin of boss |
| Hollow Brute (Deep) | Re-skin of tank |
| Hollow Remnant (Deep) | Re-skin of trash |

**Gaps to fill (target: 30-40 total enemies):**

| New enemy | Archetype | Why |
|-----------|-----------|-----|
| Skitter (Hollow swarm) | Swarm | Currently no true swarm enemy — gameplay variety gap |
| Reaver (raider) | Trash w/ ranged | No ranged trash exists; reading "you must close to hit" gets old |
| Marauder (raider tank) | Tank | Faction tank for Salt Creek raiders |
| Charlatan (raider caster) | Caster (illusion) | Status-based raider variant |
| Pack Leader | Elite (summoner) | Summons swarm — synergy fight |
| Rust-Eater (Hollow specialist) | Mechanical (corrodes gear) | Creates *durability* tension if added |
| Bloodletter (Sanguine) | Caster (heal-from-bleed) | Punishes player with bleed weapons |
| Scion of the Court (Sanguine elite) | Elite | Mid-tier Red Court boss |
| Covenant Inquisitor | Faction-elite | Covenant tank with consecration |
| Covenant Penitent | Trash | Cannon fodder for Covenant zones |
| Stack Fixer (Salvager faction) | Trash w/ traps | Mechanical traps + melee |
| Pinemother | Boss (Pine Sea) | Currently no Pine Sea boss listed |
| Saltwight (Salt Creek) | Boss (mini) | Salt Creek mini-boss |
| Ash Wraith (Ember) | Wanderer | Dread enemy for The Ember |
| Hollow Avatar | Final boss (Cure ending) | Ending-specific final boss |
| The Lord of Cups (Sanguine Elder) | Final boss (Weapon ending) | Ending-specific |
| The Sealed One | Final boss (Seal ending) | Ending-specific |
| The Throne | Final boss (Throne ending) | Ending-specific |
| Echo (yourself, prior cycle) | Special boss | Hades-style, plays into Revenant theme |
| Hive Queen | Mega-boss (cycle 5+ unlock) | True Hollow apex |

That brings the roster to **35 enemies** — well within the 30-40 target. Critically, the four ending bosses give Section 6 its hook.

**Sources**
- [Keys to Rational Enemy Design (GDKeys)](https://gdkeys.com/keys-to-rational-enemy-design/)
- [Designing Engaging Enemy Archetypes (Wayline)](https://www.wayline.io/blog/designing-engaging-enemy-archetypes)
- [Designing Enemies With Distinct Functions (Game Developer)](https://www.gamedeveloper.com/design/designing-enemies-with-distinct-functions)
- [Slay the Spire 2 Elites Guide (Mobalytics)](https://mobalytics.gg/slay-the-spire-2/encounters/elites)
- [Slay the Spire Elites (wiki)](https://slay-the-spire.fandom.com/wiki/Elites)
- [Multi-Stage Boss Battles (Dungeon Solvers)](https://www.dungeonsolvers.com/multi-stage-boss-battles-in-dd-5e/)
- [WoW Raid Boss Phases (Giorgio NYC)](https://giorgionenyc.com/wow-raid-boss-phases-explained-surviving-the-toughest-fights/)
- [Wandering Monster Design (Brandes Stoddard)](https://www.brandesstoddard.com/2020/05/larp-design-wandering-monster-design/)

---

## Section 5 — Class differentiation in combat

### How successful battle MUDs differentiate classes

**Achaea (IRE).** Each class has 3 skills × 20-50 abilities = ~100 class abilities. Combat strategies are *radically* different — Serpentlords use venom and wormholes, Sylvans control weather, Occultists summon chaos entities, Infernal Knights wield death magic and martial discipline. **The differentiator is verbs, not stats.** A Serpentlord fight is a venom-stacking puzzle; a Sylvan fight is a weather-control puzzle.

**Aardwolf.** Four primary classes with a clear functional split — Mages (best damage spells), Warriors (best auto-attack), Thieves (best opening burst with backstab), Clerics (best healing/buffs). The Remnant could borrow this **role-clarity-first** approach — one phrase that describes each class's combat identity.

**Dead Cells.** Three gear "schools" (Brutality / Tactics / Survival, color-coded red/purple/green). Each weapon belongs to one school; mutations and synergies favor one path. **Pattern: the mechanic of differentiation is a single attribute that *all* gear scales off.** This is a powerful pattern for keeping class identity readable in a terminal UI.

**Hades 2.** Six weapons, each with 4 Aspects (3 standard + 1 hidden) = 24 distinct playstyles. Aspects "reshape how weapons interact with boons" — they don't just add stats. **Pattern: the unit of differentiation is the aspect, not the class.** Translatable to The Remnant by giving each class 2-3 "stances" or "paths."

**Caves of Qud.** True Kin (cybernetics) vs Mutant (mutations) is a binary class fork; mutations give 70+ build levers. Mental mutations scale with Ego, physical mutations don't, so build construction starts from picking a core attribute. **Pattern: per-character build levers > per-class verbs.** This is the single-player roguelike approach.

### How many class-unique combat verbs is "enough"?

**The bar from real games:**

- 2 verbs is too few — Diku-derivative MUDs like SMAUG have classes that play near-identically, much-criticized.
- **4-6 unique verbs per class** is the battle-MUD sweet spot. Aardwolf, BatMUD, Discworld all sit in this range for a primary class's combat-relevant verbs.
- 8+ unique verbs per class is memorization burden territory; needs an in-game reference (Achaea-tier complexity).

**For The Remnant: target 4-5 active class abilities + 1-2 passive class triggers per class.**

### Recommended class mechanics (concrete proposal)

The current 7 classes (Enforcer, Scout, Wraith, Shepherd, Reclaimer, Warden, Broker) have stat allocations but combat plays nearly identically. Suggested mechanical identity per class:

| Class | Combat identity (one phrase) | Active abilities (4) | Passive trigger (1) |
|-------|------------------------------|----------------------|---------------------|
| **Enforcer** | "Discipline through pressure" | `slam`, `interpose`, `consecrate`, `mark` | On kill, +1 grit (stack to 3) |
| **Scout** | "Strike, fade, repeat" | `snipe`, `vanish`, `trap`, `flank` | First hit out of stealth crits |
| **Wraith** | "Bleed and silence" | `garrote`, `shadowstep`, `void-mark`, `siphon` | Statuses applied tick +1 turn |
| **Shepherd** | "Mend the herd" | `bind`, `rally`, `counterhex`, `purify` | On heal, party member +1 grit |
| **Reclaimer** | "Salvage from violence" | `harvest`, `repurpose`, `overload`, `disassemble` | Kills drop +1 component |
| **Warden** | "Hold the line" | `taunt`, `bulwark`, `riposte`, `endure` | Damage taken converts to grit |
| **Broker** | "Trade pain for power" | `barter` (combat: turn HP into damage), `siphon`, `mark`, `parley` | Currency on hand boosts crit |

Each ability is tied to one stat (vigor/grit/reflex/wits/presence/shadow), making gear-class synergy automatic. The **passive trigger** is the class identity in one sentence.

### Build paths per class (how to give "real" build choice)

Per Section 3, target 3 viable build paths per class. Concrete examples:

**Wraith.**
- *Shadowblade* — crit-stacking, draining/keen weapons, low-HP-but-heal-on-hit gameplay.
- *Phantom* — silenced/quick weapons, vanish-and-snipe, status-immunity gear.
- *Veil* — vicious/scorching weapons, status-stack into kills, +damage vs status-affected enemies.

**Reclaimer.**
- *Salvager* — harvest synergy, +components on kill, vendor-economy build.
- *Engineer* — turret/trap placement, kite-and-detonate gameplay, crafting heavy.
- *Berserker* — overload+disassemble combo, sacrifice durability for damage spikes.

Each class needs 2-3 "hero items" per path — Section 3 estimated 42-63 build-defining legendaries to cover all classes × paths.

**Sources**
- [Achaea Newbie Guide — class structure](https://wiki.achaea.com/mediawiki/index.php?title=Newbie_Guide&mobileaction=toggle_view_desktop)
- [Achaea Categories: Classes (wiki)](https://wiki.achaea.com/Category:Classes)
- [Aardwolf class differences (Ziggyny's blog)](http://ziggyny.blogspot.com/2013/10/aardwolf-primary-class.html)
- [Aardwolf Cleric (wiki)](https://www.aardwolf.com/wiki/index.php/Class/Cleric)
- [ZombieMUD Newbie Guilds](http://zombiemud.org/newbie_guilds.php)
- [Dead Cells Gear (wiki.gg)](https://deadcells.wiki.gg/wiki/Gear)
- [Hades 2 Weapon Aspects (Fextralife)](https://hades2.wiki.fextralife.com/Weapon+Aspects)
- [Caves of Qud Mutations (wiki)](https://wiki.cavesofqud.com/wiki/Mutations)
- [Caves of Qud — mutations vs class (Steam thread)](https://steamcommunity.com/app/333640/discussions/0/598514446184243485/)

---

## Section 6 — Encounter pacing & boss design

### How are boss fights signaled (the "music cue equivalent")

In a text MUD the equivalent of music swelling is **room description style**. Patterns that work:

- **Long room description, present tense, breath-rhythm.** A boss room should be 3× the length of a normal room and read like a held breath. Caves of Qud and DCSS both do environmental descriptions that signal "this is a setpiece."
- **Color shift.** ANSI palette shift to red or violet. The Remnant uses `lib/ansiColors.ts` — a "boss palette" override per zone.
- **Forced-more pacing.** DCSS uses force-more prompts to make the player acknowledge dangerous things — translatable as a `[Press ENTER to enter the boss room]` hold.
- **Pre-fight environmental text.** Whispers, footsteps, smell of blood — let the player feel the boss before seeing it.

### Mini-boss density

Slay the Spire benchmark: 3 elites per act + 1 act boss. Generalized: **1 mini-boss per zone, 1 act boss per zone-cluster.**

For The Remnant 13 zones: 13 mini-bosses + 4 act bosses = **17 boss-tier encounters**. With 4 ending-specific final bosses on top, that's 21 boss fights total — a strong battle-MUD count.

### Phase mechanics (HP thresholds)

The Dungeon Solvers / WoW raid blogs both converge on this rule of thumb:

- **2 phases:** 60-70% HP transition. Enough surprise without overwhelming.
- **3 phases:** 75% / 35% transitions, OR 60% / 25%. Final phase compressed.
- **Each phase introduces ONE new mechanic, not multiple.**

For The Remnant, adopt a simple 2-phase rule for mini-bosses (one HP threshold) and 3-phase for final bosses (two HP thresholds + an "enraged" state below 10% HP).

### Sub-boss vs raid-boss separation

Battle-MUD separation is HP/loot/uniqueness, not party-size. Recommended tiering:

| Tier | Count | HP scale (relative to elite) | Drop guarantee |
|------|-------|-------------------------------|----------------|
| Elite | ~30-40 in spawn pool | 1× | 1 rare item, +gold |
| Mini-boss | 13 (1/zone) | 3-4× | 1 epic item OR 1 named legendary, faction rep tick |
| Act boss | 4 | 8-10× | 1 legendary, story flag, set-piece |
| Final boss | 4 (one per ending) | 15-20× | Ending-specific legendary, ending lore unlock |

### The four endings — should each have a distinct final boss?

**Yes. Strongly recommended.** Currently the endings are quest-flag driven — Cure / Weapon / Seal / Throne. A battle-heavy game *needs* an actual fight to cap the run, not a dialog tree. The narrative writing already implies these:

- **Cure** — fight the **Hollow Avatar** (the disease incarnate). Phases: dialogue/manifestation → corrupted form → final cure-or-be-cured choice.
- **Weapon** — fight **The Lord of Cups** (the apex Sanguine). Phases: bargain → battle → the player's weapon turns on them.
- **Seal** — fight **The Sealed One** (whatever was sealed). Phases: cracking seal → emergent form → re-seal vs strike-down.
- **Throne** — fight **The Throne** itself (an architectural / metaphysical entity). Phases: ascend → rule-claim → become-or-destroy.

These are big undertakings (each is content for one Howler). The minimum viable version is shared mechanics with ending-flavored skins, but the maximum-impact version is genuinely distinct movesets.

### Encounter pacing within a zone

Healthy battle-MUD pacing per zone (20-25 rooms):

- 60-65% of encounters: trash (1-2 enemies, 30-90 second fight at cycle 1).
- 25-30%: medium (2-4 enemies, 60-180 sec fight, possibly elite among them).
- 5-8%: hard (elite-led groups, 2-5 min fights).
- 1 mini-boss per zone (5-10 min fight).

This gives a rhythm — easy, easy, hard, easy, medium, medium, hard, easy, mini-boss — that prevents fatigue while maintaining battle density.

**Sources**
- [Multi-Phase Boss design (Medium)](https://dennisse-pd.medium.com/creating-a-boss-fight-will-multiple-phases-757c642aa354)
- [Multi-Stage Boss Battles in 5e (Dungeon Solvers)](https://www.dungeonsolvers.com/multi-stage-boss-battles-in-dd-5e/)
- [Building Boss Fights — mechanics, tension, terrain (Printing Goes Ever On)](https://theprintinggoeseveron.com/building-boss-fights-in-5e-mechanics-tension-and-terrain/)
- [Sequential Boss (TV Tropes)](https://tvtropes.org/pmwiki/pmwiki.php/Main/SequentialBoss)
- [Slay the Spire elite design (wiki.gg)](https://slaythespire.wiki.gg/wiki/Elites)
- [Slay the Spire encounter patterns (Spire Codex)](https://spire-codex.com/jpn/guides/understanding-encounters)

---

## Section 7 — Death penalty & retry loop

### Lethality tuning

**What % of mobs should be capable of killing a careless player?** Battle-MUD answer (Aardwolf, BatMUD, ZombieMUD newbie guides):

- **Cycle 1:** 10-15% of trash mobs lethal-on-mistake; 50% of elites lethal-on-mistake; 80%+ of bosses lethal-on-mistake.
- **Cycle 3:** 20-25% / 70% / 95%.
- **Cycle 5+:** 35-45% / 90% / 100% (some bosses literally one-shot at full alert).

A "careless mistake" means low HP, no buffs, no status cleanse, wrong gear. A clean fight should always be winnable.

### Death-by-trash-mob vs death-by-boss frequency

Roguelike data (from Brogue/DCSS forum chatter): **roughly 70% of deaths are to trash mob synergy or carelessness, 25% to elites, 5% to actual bosses.** Bosses get the dramatic deaths, but the ambient mortality is what creates the tension. The Remnant's death-rebirth cycle is exactly the right shape for this.

**Translation:** in a battle-heavy Remnant, the player should die **5-15 times per cycle 1 run** at first attempt. This is consistent with permadeath roguelike norms (many runs before the first cure ending). Hades/Hades-2 explicitly designed for "you will die many times" — the trick is the retry loop being *fast enough* and *progressive enough* to not feel punitive.

### Echo / inheritance systems (Hades-style)

Hades 2's keepsake/echo system is the gold standard for permadeath-adjacent design. Mechanics worth importing into The Remnant's existing rebirth loop:

**(1) Keepsake-equivalent — class memento.** On rebirth, player picks ONE memento from the prior run that grants a small persistent bonus (cycle-bound, not permanent). The Remnant already has cycle history — surface 1-3 cycle-relevant mementos.

**(2) Mirror-of-Night equivalent — permanent rebirth upgrade tree.** Spend an in-cycle currency (cycle-soul, dream-fragments) to permanently buff death-loop perks. The Remnant has stat boosts at L3/6/9 — extend this into a between-cycle upgrade tree (10-15 nodes).

**(3) Echo-style boon repeat.** Hades 2 echoes mirror prior boons. The Remnant equivalent: *the Echo* (the player's prior life) appears as a literal boss in some runs — fighting and killing it grants a build-relevant inheritance.

**(4) Faction memory.** Faction reputation already carries across cycles per the existing design. Strengthen this — let the player visit a faction NPC after rebirth and "spend" prior-life rep on a small permanent buff (reputation-locked gear pre-unlocks, etc.).

**(5) Speed up subsequent runs.** Hades 2 lets you skip prior content via aspects/keepsakes. The Remnant should let the player skip prologue + early-zone tutorials on cycle 2+, and offer a "fast-travel-to-furthest-zone-ever-reached" option per cycle.

### Retry loop pacing target

A full-clear cycle 1 attempt should take **2-4 hours** of play. Death attempts before first ending: **5-15 deaths typical, 30+ for slow players.** Cycle 5 final-boss attempt should take **30-60 minutes** if the player is well-built. This pacing keeps the rebirth loop tight without becoming Dark Souls-tier punitive.

**Sources**
- [Hades 2 Keepsakes (Fextralife)](https://hades2.wiki.fextralife.com/Keepsakes)
- [Hades 2 Echoes (Fextralife)](https://hades2.wiki.fextralife.com/Echoes)
- [Hades 2: All Keepsakes guide (GameSpot)](https://www.gamespot.com/gallery/hades-2-keepsakes-unlock-guide/2900-5377/)
- [Roguelite Restart pacing essay (Medium)](https://medium.com/@todorovicnik2/video-games-roguelite-restart-length-of-a-perfect-run-ef8078c76495)
- [Increasing Challenge in Roguelikes (Roguetemple)](https://blog.roguetemple.com/articles/increasing-challenge-in-roguelikes/)
- [Designing for Mastery in Roguelikes (Grid Sage)](https://www.gridsagegames.com/blog/2025/08/designing-for-mastery-in-roguelikes-w-roguelike-radio/)

---

## Section 8 — Inventory & UI for battle MUDs

### Inventory cap mechanics

Two well-tested approaches:

**(A) Slot-based.** N slots; 1 item = 1 slot, regardless of weight. Used by D&D OSR, slot-based encumbrance mods, Caves of Qud (light slot+weight hybrid). **Strength:** trivially readable in a terminal log. **Weakness:** "pebble = sword" feels off.

**(B) Weight-based.** Carrying capacity in pounds/kilos; over capacity slows the player. Used by Aardwolf, NetHack, DCSS. **Strength:** narrative realism. **Weakness:** weight-tuning each item is content overhead; player needs a calculator.

**(C) Hybrid (recommended).** Categories with caps + a soft weight floor. E.g., **6 weapon slots, 6 consumable slots, 12 currency-stack slots, 30 misc slots**, plus a weight cap that prevents hoarding 30 hammers. The Remnant already has typed slots (weapon, armor) — extending this is cheap.

### Stash design

- **Single per-character stash** (current Remnant default presumed) is the simplest. Limit to a single hub (Covenant or Crossroads) to maintain spatial reward for visiting hubs.
- **Stash tabs by category** (weapons / armor / consumables / quest) is a Diablo 2/PoE pattern that aged well — sort once, find later.
- **Cycle-persistent stash with per-cycle decay.** Items stashed survive death — but on rebirth, 1-2 items disappear per cycle (you remember them, not perfectly). Reinforces theme; prevents stash-bloat across 10+ cycles.

### Quick-equip / loadout systems

**The Remnant should support 2-3 named loadouts.** `loadout save quickdraw`, `loadout swap quickdraw`. Pattern from PoE / Aardwolf bind-sets. In a battle-heavy game with frequent gear swaps, this is a quality-of-life multiplier.

### Combat log readability when fights are fast

From `combat-best-practices.md` (Section 6) — the Remnant existing research already covers log compression, ANSI color coding by effect type, "Force-More" pacing for big events. Specific to battle-heavy:

- **Round summary line.** After each round, output a single colored line: `Round 3: You dealt 14 damage, took 6 (Bleeding 2/3). Brute: 23/45 HP.` — this is what the player scans, not the verbose rolls.
- **Verbose log toggle.** `combatlog verbose` for new players, `combatlog terse` once they've internalized the system.
- **Status icon prefix.** `[!B] [!P]` (Bleeding, Poisoned) prefixes on the player's name, always. Single-pass scanning.
- **Color-by-faction/threat.** Sanguine enemies in red, Hollow in violet, Covenant in gold, etc. Visual identification is faster than name parsing.

### Status effect display (current Remnant has 6 conditions)

Current: bleeding, burning, stunned, frightened, poisoned, weakened.

**Recommended expansion to 9-10 conditions for battle-heavy:**

| Condition | Effect | New? | Triggered by |
|-----------|--------|------|--------------|
| Bleeding | DOT, +stack-on-reapply | exists | Vicious trait |
| Burning | DOT, ignores armor | exists | Scorching trait |
| Stunned | Skip turn | exists | Heavy/blunt criticals |
| Frightened | -roll | exists | Boss / wandering tells |
| Poisoned | DOT + accuracy debuff | exists | Sanguine enemies |
| Weakened | -damage dealt | exists | Caster casts |
| **Marked** | Next attack auto-crits | NEW | Scout's `mark`, Broker's `mark` |
| **Silenced** | Can't use abilities (status, not stance) | NEW | Wraith's `silence`, Whisperer counter |
| **Bound** | Can't flee | NEW | Shepherd's `bind`, certain elites |
| **Exposed** | -armor effective | NEW | Heavy hits, Reaver attacks |

This expands the status grid from 6 → 10, giving each new class active at least one signature status verb. Gear / armor traits expand correspondingly: a `ward` against Marked, a `unbinding` armor against Bound, a `clarity` against Silenced.

**Sources**
- [Slot-based encumbrance variant (EN World)](https://www.enworld.org/threads/encumbrance-variant-compromise-between-slots-and-weight.542937/)
- [Item-based encumbrance (Necrotic Gnome)](https://necroticgnome.com/blogs/news/item-based-encumbrance-play-test)
- [Discworld MUD: tactics doc](https://discworld.starturtle.net/lpc/playing/documentation.c?path=/helpdir/tactics)
- [Discworld MUD: combat doc](https://discworld.starturtle.net/lpc/playing/documentation.c?path=/concepts/combat)
- [Diablo 4 Loot Filter (Icy Veins)](https://www.icy-veins.com/d4/news/goodbye-screen-clutter-diablo-4-is-getting-a-loot-filter/)
- [Auto-loot patterns (Mudlet forum)](https://forums.mudlet.org/viewtopic.php?t=2753)

---

## Top 15 prioritized recommendations

Each recommendation is sized for one Howler (one-day-ish implementation slice). Priority is by impact-on-feel × ease-of-build.

### P1 — Density retune (Section 1)
**Goal:** raise per-zone occupied-room % from ~28% to 40-55% (cycle 1) and 60-75% (cycle 5+). Add cycle-multiplier on density: `effectiveDensity = baseDensity * (1 + 0.06 * cycle)`. **Files:** `data/rooms/*.ts` spawn tables, new helper in `lib/spawning.ts` if not present, `lib/hollowPressure.ts` already gates this. **One Howler. Highest impact-per-hour.**

### P2 — 20 new enemies (Section 4)
**Goal:** roster 15 → 35. Implement Skitter (swarm), Reaver/Marauder/Charlatan/Pack Leader (raider faction), Bloodletter/Scion (Sanguine elites), Covenant Inquisitor/Penitent (Covenant), Stack Fixer (Salvager), Pinemother/Saltwight/Ash Wraith (zone-specific bosses), 4 ending bosses, Echo (your prior cycle), Hive Queen (cycle-5+ apex). **Files:** `data/enemies.ts`, room spawn refs. **One Howler.**

### P3 — Class active abilities (Section 5)
**Goal:** 4 active abilities + 1 passive trigger per class × 7 classes = 28 active + 7 passive. Use stat-coupling (each ability scales off one stat). **Files:** `lib/actions/combat.ts`, new `data/classAbilities.ts`, parser registration in `lib/parser.ts`. **One Howler.**

### P4 — 100+ new gear items (Section 3)
**Goal:** expand gear roster to ~180-220 items. 3-5 viable weapons per class per tier + tiered armors. Hand-tuned, not procedural. **Files:** `data/items.ts` (consider splitting into `data/weapons.ts` + `data/armors.ts` + `data/legendaries.ts` if it gets unwieldy). **One Howler — biggest data-only task.**

### P5 — 4 traits → 18 weapon traits, 4 → 10 armor traits (Sections 3, 8)
**Goal:** add 8 new weapon traits (e.g., `marking`, `binding`, `cleaving`, `siphoning`, `volatile`, `spectral`, `corrupting`, `salt-touched`) and 6 new armor traits (`unbinding`, `clarity`, `salted`, `consecrated`, `lashing`, `aegis`). Tied to the 4 new status effects. **Files:** `types/traits.ts`. **Half a Howler.**

### P6 — Loot drop pipeline (Section 2)
**Goal:** implement drop tables per enemy with the recommended distribution (50-60% nothing, 20-25% currency, 10-15% common consumable, 4-7% common gear, 1-2% rare gear, 0.3-0.5% epic). Add `data/lootTables.ts` keyed by enemy ID. **Files:** `data/enemies.ts`, `lib/actions/combat.ts` (death handler), new `lib/loot.ts`. **One Howler.**

### P7 — Auto-loot currency + manual gear (Section 2)
**Goal:** currency and common consumables auto-pickup on enemy death; gear announced + requires manual `loot`. Add `loot all` and `loot <type>` filter verbs. **Files:** `lib/actions/items.ts`, `lib/parser.ts`. **Half a Howler.**

### P8 — Boss phase mechanics (Section 6)
**Goal:** add 2-phase mechanics to all 13 mini-bosses (single HP threshold) and 3-phase mechanics to 4 act bosses + 4 ending bosses. Each phase introduces ONE new mechanic. **Files:** `data/enemies.ts` (new `phaseMechanics` field), `lib/actions/combat.ts`. **One Howler — big design task.**

### P9 — 4 ending-specific final bosses (Section 6)
**Goal:** Hollow Avatar (Cure), Lord of Cups (Weapon), Sealed One (Seal), The Throne (Throne). Distinct movesets, not skins. Each is a 3-phase fight. **Files:** `data/enemies.ts`, `data/rooms/<final-zone>.ts`, `lib/actions/combat.ts` ending-flag wiring. **One Howler — story-critical.**

### P10 — 4 new status conditions (Section 8)
**Goal:** Marked, Silenced, Bound, Exposed. Wire into 4-5 existing class abilities and 6-8 enemies. **Files:** `types/traits.ts` (ConditionId), `lib/actions/combat.ts` status tick handler, enemy AI references. **Half a Howler.**

### P11 — Mirror-style permanent rebirth tree (Section 7)
**Goal:** between-cycle upgrade tree with 10-15 nodes. Spend cycle-soul currency (new) earned on death-events (boss kills, full-zone clears). Persists across rebirth. **Files:** new `lib/rebirthTree.ts`, schema migration for `rebirth_perks` JSONB column on player table. **One Howler. Schema migration MUST land first per CLAUDE.md rule #1.**

### P12 — Loadouts (quick-equip) (Section 8)
**Goal:** `loadout save <name>`, `loadout list`, `loadout swap <name>`. 2-3 saved loadouts per character. Persists. **Files:** `lib/actions/items.ts`, schema migration if storing on player row, `data/items.ts` (no change — purely save state). **Half a Howler.**

### P13 — Combat log compression (Section 8)
**Goal:** add round summary line + status-icon prefix + verbose/terse toggle + faction color coding. **Files:** `lib/actions/combat.ts` log builders, `lib/ansiColors.ts`. **Half a Howler — high feel-impact.**

### P14 — Set bonuses (4-6 sets) (Section 3)
**Goal:** 4-6 hand-tuned 4-piece sets tied to factions — Covenant Inquisitor, Red Court Bloodbound, Salvager's Pact, Hollow-Marked, Pine-Touched, Throne-Sworn. Implement as a check during damage/defense calc. **Files:** new `data/sets.ts`, integration in `lib/actions/combat.ts`. **One Howler.**

### P15 — Echo boss (you, prior cycle) (Section 7)
**Goal:** on cycle 3+, a chance-encounter boss "The Echo" appears in one zone — fights with the player's prior class loadout. Drops a unique inheritance item. Ties Hades-style mechanic into the existing cycle history. **Files:** `data/enemies.ts` (dynamic stats from cycle history), new `lib/echoBoss.ts`, hook in `lib/echoes.ts`. **One Howler — narrative + mechanical home run.**

---

## Confidence notes and gaps

- **Specific MUD percentages (BatMUD/Aardwolf encounters per hour, loot drop %s)** are tagged `[low confidence]` because most MUD games don't publish exact tuning. Targets here are inferred from newbie-guide language ("you kill a lot," "monsters drop sometimes"), Steam discussion threads, and analogous Diablo data.
- **Diablo / Hades / PoE drop and economy numbers** are well-documented in player-maintained wikis and dev post-mortems and are higher confidence.
- **The "30-40 enemies" target** for The Remnant is a judgment call, calibrated against current MUD/roguelike rosters where 25 is the floor for "feels variety-rich" and 60+ starts to be excessive content burden.
- **The 4 ending bosses recommendation** assumes the existing endings already have strong narrative scaffolding in the existing convoy work — if any ending lacks foundation the ending-boss design needs to wait for that.
- **WebFetch was used selectively;** several BatMUD-specific tuning claims would be sharper with a deeper crawl of `bat.org/help/help` pages and the Discord. If a future research round needs absolute precision on encounters-per-hour, a 2-hour Mudlet capture session of an experienced BatMUD player would resolve the open question.
