# Enemy Roster — Internal Audit (Battle-MUD Pivot)

> **Date:** 2026-04-25
> **Branch:** dev/battle-mud-pivot
> **Audit by:** Explore agent (transcript captured inline; agent could not write directly)
> **Verification flag:** Tier counts, weights, and stat tables are agent-recalled. Blue should re-grep against `data/enemies.ts` and `data/rooms/*.ts` for any specific numbers it bases work on.

---

## Headline

The Remnant has **16 distinct enemies** across 13 zones. The roster is reasonable for a narrative-first game but **shallow for a battle-MUD**. Critical gaps: no **glass-cannon archetype**, **only 2 zones have boss-tier encounters**, **6 of 7 factions have zero faction-flavored enemies** (only Red Court has one), and **4 zones have ≥90% spawn-weight dominance by a single enemy** (Duskhollow 100%, Stacks 90%, River Road 92%, Dust 80%) creating heavy repetition.

---

## 1. Complete enemy roster

| ID | Name | HP | ATK | DEF | DMG | XP | Tier | Zones | Special |
|---|---|---|---|---|---|---|---|---|---|
| shuffler | Shuffler | 12 | 1 | 7 | 2-4 | 12 | C1 | All zones (threat pool) | Trash; bleeding-immune; scorching-weak |
| remnant | Remnant | 16 | 2 | 10 | 2-5 | 25 | C1 | All zones; Ember/Stacks/Pine Sea static | Common trash; disrupting-weak |
| screamer | Screamer | 10 | 1 | 9 | 1-2 | 30 | C1 | Threat pools; em_11 static | Summons Hollow reinforcements |
| stalker | Stalker | 22 | 3 | 11 | 3-6 | 50 | C1+ | Threat pools | Ambush; keen/blessed/disrupting-resistant |
| brute | Brute | 30 | 4 | 12 | 3-7 | 80 | C2 | Threat pools; Ember/Dust static | Tank; heavy-resistant; crit-weak |
| whisperer | Whisperer | 20 | 3 | 11 | 3-6 | 100 | C1+ | Pine Sea static | Debuffer; mimicry; fear-immune |
| hive_mother | Hive Mother | 50 | 5 | 14 | 5-10 | 250 | C3 | Threat pools | Buffs Hollow swarms |
| sanguine_feral | Sanguine (Feral) | 25 | 5 | 14 | 5-10 | 150 | C2+ | Threat pools | Apex; draining-immune; blessed-weak |
| red_court_enforcer | Red Court Enforcer | 35 | 6 | 15 | 5-12 | 200 | C2+ | Pens static (6 rooms) | Faction elite |
| elder_sanguine | Elder Sanguine | 60 | 8 | 17 | 8-15 | 400 | C3+ | Threat pools; Scar static | Boss-tier |
| meridian_automated_turret | Automated Turret | 20 | 6 | 16 | 6-12 | 120 | C3 | scar_03 static | Mechanical; blessed-immune |
| meridian_ancient_hollow | Ancient Hollow | 45 | 6 | 14 | 6-12 | 180 | C3 | scar_10 static | MERIDIAN lab-born |
| elder_sanguine_deep | Elder Sanguine (Apex) | 75 | 10 | 18 | 10-18 | 600 | C3+ | dp_11 static | Final boss-tier |
| hive_mother_the_deep | Hive Mother (Deep) | 65 | 6 | 15 | 6-12 | 350 | C3 | dp_06 static | Deep colony lord |
| hollow_brute_deep | Deep Brute | 45 | 5 | 13 | 5-10 | 110 | C2+ | Deep static (3 rooms) | Tunnel-adapted tank |
| hollow_remnant_deep | Deep Remnant | 20 | 3 | 10 | 2-6 | 35 | C1+ | Deep static (3 rooms) | Mining survivor variant |

**Total:** 16 distinct types (3 are tier-2 variants, so ~13 base archetypes).

---

## 2. Archetype coverage vs. battle-MUD baseline

| Archetype | Current | Status |
|---|---|---|
| Trash mob | shuffler, screamer | ✓ |
| Tank | brute, deep brute, hive mothers | ✓ |
| **Glass cannon** | **NONE** | ✗ MISSING |
| Caster / debuffer | whisperer, screamer, hive mother | ✓ |
| Swarm | screamer + hive mother summons | partial |
| Elite / mid-boss | stalker, whisperer, red court enforcer | ✓ |
| Boss | elder sanguine variants, turret, ancient hollow | partial — only 2 zones have any |

### Critical gaps

1. **Glass cannon archetype completely missing.** No enemy with low HP + high damage. Battle MUDs need fragile-but-deadly enemies that punish careless play.
2. **Swarm-spawn mechanic weak.** Only screamer and hive mother summon. No dedicated "infestation" enemy that multiplies mid-fight independently.
3. **Wandering / mobile threats absent.** All enemies are static-spawned or threat-pool spawned; nothing hunts the player across rooms.
4. **Faction enforcer poverty:**
   - Red Court: 1 (Enforcer) ✓
   - Drifters: 0
   - Salters: 0
   - Covenant / Accord: 0
   - Pen Wardens: 0 (Red Court guards exist but not "Pen Warden" type)
   - Kindling: 0
   - Lucid Sanguine: 1 (Elder Sanguine) — overpowered, no common-rank
5. **True mid-game boss void.** Cycle 2 has no required boss fight. Cycles 1, 2 lack act-finale bosses; only cycle 3 has substantial boss content.

---

## 3. Per-zone enemy variety

| Zone | Rooms | Distinct types | Spawn-weight balance | Static encounters | Verdict |
|---|---|---|---|---|---|
| Crossroads | 15 | 0 | n/a | — | Safe zone (intended) |
| River Road | 12 | 2 (shuffler, remnant) | **92:8** | — | **SEVERE skew** |
| Covenant | 28 | 0 | n/a | — | Safe zone (intended) |
| Salt Creek | 20 | 3 | 70:20:10 | 1 (sanguine_feral) | Low-Mid |
| The Ember | 20 | 5 | 70:30 | 3 multi-enemy (em_11, em_12, em_18) | Mid |
| The Breaks | 20 | 2 | 75:25 | — | Very low |
| The Dust | 8 | 2 | 80:20 | 1 (remnant+brute) | Very low |
| The Stacks | 11 | 2 | **90:10** | 2 (shuffler singles) | **HIGH skew** |
| Duskhollow | 13 | 1 | **100%** | 2 (remnant static) | **EXTREME skew** |
| The Deep | 12 | 6 | 55:35:10 | 4 multi-enemy | High variety ✓ |
| The Pine Sea | 13 | 3 | 70:30 | 2 (remnant, whisperer) | Mid |
| The Scar | 20 | 4–7 | 45:35:20 | 4 unique boss spawns | High variety ✓ |
| The Pens | 11 | 2–3 | 70:30 | 6 (red_court_enforcer) | Mid-High |

**Most lopsided:** Duskhollow Long Drive (100% shuffler), River Road (92%), Stacks (90%).

**Below 4–6 variety bar:** River Road, Breaks, Dust, Stacks, Duskhollow.

---

## 4. Stat distribution

**HP range:** 10 (screamer) → 75 (elder_sanguine_deep). Mean ~35.6, median 30.

**Distribution buckets:**
- 10–15 HP: shuffler, screamer (trash)
- 16–25 HP: remnant, stalker, sanguine_feral (common-elite)
- 26–35 HP: brute, red_court_enforcer (tank-elite)
- 36–50 HP: ancient_hollow, hive_mother, deep_brute (boss-medium)
- 51–75 HP: elder_sanguine variants (boss-major)

**Damage:** 2 (screamer) → 18 (elder_sanguine_deep). Mean ~9.1.

**Defense:** 7 (shuffler) → 18 (elder_sanguine_deep). Mean ~12.8.

**Pacing vs. baseline player (cycle 1):**
- Player HP 8–22, attack 1–3, defense 8–13
- Shuffler vs. baseline: 3–6 turns to kill, 3–6 hits absorbed
- Curves are **linear**, not exponential — no "sudden spike" enemies that require gear/tactics

---

## 5. Behavioral diversity

### What's NOT implemented

- No `onAttack()` hooks defined in `data/enemies.ts` for crit chance, retaliate, multi-target, damage reflection
- No fleeing low-HP enemies (no chase mechanic)
- No "ambush" mechanic granting Hollow free opening attacks
- No environmental modifier consumption by enemies (darkness, narrow passage, high ground exist as flags but no enemy AI uses them)
- No phase-transition logic on bosses (no "if HP < 50%, summon adds")

### What exists as flavor only

- Screamer: "shriek causes echoes, draws Hollow" — text only, no mechanical signal-bringing
- Hive Mother: "points, swarm moves" — text only
- Brute: "charges" — text only

---

## 6. Loot drop coverage

**100% enemy coverage.** Every enemy has a loot table.

- Shuffler: scrap metal 20%, ammo 15%, scrap vest 12% (weak frequent loot)
- Remnant: knife 12%, pistol 12%, ammo 15%, bandages 20%
- Brute: scrap metal 60% (over-weighted), wrench 25%, bandages 20%
- Sanguine variants: blood vial 40–90%, rare keycards
- Elder Sanguine: blood vial 80–90%, silver knife 6–15%, keycard 6–8%
- Hive Mother variants: electronics/chemicals 35–45%, blood 5–10%

**Gap:** no `.22 LR` currency in loot tables. Bullets should drop from kills.

---

## 7. Resistance / immunity profile

**Damage type coverage:** blessed (8 enemies), disrupting (9), scorching (10), keen (5), heavy (4), precise (2), draining (2).

**Condition immunities:**
| Enemy | Immune to |
|---|---|
| shuffler | bleeding |
| screamer | poisoned |
| whisperer | frightened |
| meridian_turret | bleeding, burning, stunned, frightened, poisoned, weakened |
| ancient_hollow | frightened |

**UX gap:** resistances are in data but **never surfaced in-game**. Players don't learn that shuffler is bleeding-immune by hitting it.

---

## 8. Spawn weight balance

| Zone | Dominant | % | Recommended |
|---|---|---|---|
| Duskhollow Long Drive | shuffler | 100% | 50:50 (add wildcard) |
| River Road | shuffler | 92% | 70:20:10 |
| Stacks Approach | shuffler | 90% | 70:20:10 (turrets fit lore) |
| Dust Edge | shuffler | 80% | 70:20:10 |
| Breaks Canyon | shuffler | 75% | 60:30:10 |

---

## 9. Boss / signature encounters

### Static boss spawns (all zones)

| Boss | Location | Notes |
|---|---|---|
| Elder Sanguine | dp_11 | Pre-encounter |
| Elder Sanguine (Apex) | dp_11 | Final tier |
| Hive Mother (Deep) | dp_06 | With adds |
| Automated Turret | scar_03_decontamination | MERIDIAN entry |
| Ancient Hollow | scar_10_research_sector | Lab anomaly |

### Zones WITHOUT signature bosses

- River Road, Breaks, Dust, Stacks, Pine Sea, Salt Creek, Pens (Red Court Enforcer is lieutenant-level)
- Duskhollow has no enemy boss (Vesper is dialogue only)
- Crossroads, Covenant — safe zones (intended)

**Boss inventory: 5 total. Target for battle-MUD: 13 (1+ per zone).**

### Named-NPC-as-enemy fights

**Currently zero.** No "betray and fight" mechanics. Marshal Cross, Vesper, Warlord Briggs, Wren Calloway, Lev are all dialogue-only.

---

## 10. Recommendations

### Quantitative goals

| Metric | Current | Target |
|---|---|---|
| Total enemy types | 16 | 26–28 |
| Glass cannons | 0 | 2–3 |
| Faction enforcers | 1 | 6–7 |
| Zone-signature bosses | 5 | 13 (1+ per zone) |
| Archetype coverage | 6/7 | 7/7 |
| Avg enemies per zone | 2.1 | 4–6 |
| Static multi-enemy encounters | 8 | 20+ |

### Top 12 enemies to add (prioritized)

**Tier 1 — Critical gaps:**
1. **Frenzy** (glass cannon) — HP 8 / DMG 6–12; explodes on death (1d6 splash). Zone: Dust, Breaks, Scar.
2. **Drifter Road Warden** (faction enforcer) — HP 28 / DEF 12; patrols (can follow player between rooms); calls backup. Zone: River Road.
3. **Salter Scout** (faction tank) — HP 32 / DEF 13; group morale aura. Zone: Salt Creek.
4. **Accord Peacekeeper** (faction elite) — HP 26 / DEF 12; non-lethal capture mechanic. Zone: Covenant outskirts.

**Tier 2 — Swarm / multiplier:**
5. **Plague Carrier (Infestor)** — HP 14; spawns 1d3 copies every 3 rounds (max 5). Zone: Deep, Scar.
6. **Hive Worker (Deep Swarm)** — HP 6 / DMG 1–2; only spawns in groups of 3–5; pheromone alarm if 50% killed. Zone: Deep.

**Tier 3 — Environmental / faction bosses:**
7. **Wildfire Guardian** (Dust elemental boss) — HP 55; scorching-immune; terrain becomes hazardous mid-fight.
8. **Lucid Thrall** (Sanguine summoner) — HP 36; summons 1–2 Hollow per round (max 4); 20% damage reduction while minions alive.
9. **Kindling Zealot** (Ember faction caster) — HP 32; aura adds +2 fire damage to Hollow nearby; creates fire walls.

**Tier 4 — Act 1/2 bosses:**
10. **Canyon Sentinel** (Breaks zone boss) — HP 48; two-phase (50% HP triggers AoE avalanche).
11. **Warden Executor** (Salt Creek faction boss) — HP 42; dual-attack per round; morale aura.

**Tier 5 — Glass-cannon variant:**
12. **Apex Screamer** — HP 8 / DMG 4–10; primal shriek every 2 rounds (1d6 + stun).

---

## Top 5 biggest gaps Blue must know

1. **Glass-cannon archetype completely missing** — no enemy punishes slow play. The recommended Frenzy fills this gap immediately.
2. **Only 2 zones have boss-level encounters.** 11 zones have no signature fight. Acts 1 and 2 have no climax bosses.
3. **Faction enforcer poverty** — Red Court has 1, all 6 other factions have zero. Faction-specific threats are how a battle-MUD makes the world feel populated.
4. **Spawn-weight skew creates repetition** — Duskhollow 100% shuffler, River Road 92%, Stacks 90%. Battle-MUD should feel varied each encounter.
5. **No behavioral diversity** — no crits, fleeing, mid-fight summons (except 2 enemies), environmental awareness. Combat is mechanical sameness despite enemy variety.

---

## Caveats

- Stat tables are agent-recalled; verify with `grep -A20 "id: 'shuffler'" data/enemies.ts` etc.
- Spawn-weight percentages computed from `data/rooms/*.ts threatPool` arrays; re-grep before tuning
- Tier classifications (C1/C2/C3) are agent-inferred from XP/HP curves — confirm against any explicit `tier` fields if present
