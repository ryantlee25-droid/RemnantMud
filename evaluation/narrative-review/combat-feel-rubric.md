# Combat Feel Rubric
_Phase 5-B | eval-convoy-0503 | Created: 2026-05-03_

---

## Purpose

This rubric is applied manually against the output of:

- `tests/eval/combatMatrix.test.ts` — 7 classes × 16 enemies × 5 levels × 3 seeds (560 unique scenarios, 1,680 total fights)
- `tests/eval/abilityMatrix.test.ts` — 7 classes × 7 enemy archetypes × 3 seeds (147 ability scenarios)

The rubric is **not** a pass/fail automated test. It is a structured scoring document: a human reviewer reads the matrix JSON outputs and combat log samples, applies each dimension below, and records the results in a score sheet. The automated matrix tests enforce hard invariants (zero crashes, finite win rates, no class sweeps); this rubric captures the design-feel dimensions those tests cannot.

**OQ-3 default applies**: no LLM API calls. All scoring is manual.

---

## Scoring Scale

Each dimension is scored **1–5**. The aggregate score is the mean across all dimensions. A dimension score of **3 or higher** is passing. A mean of **3.5 or higher** is a passing overall result.

| Score | Meaning |
|-------|---------|
| 5 | Fully satisfies the criterion — no issues found |
| 4 | Mostly satisfies — minor issues that do not affect feel |
| 3 | Adequate — criterion met but with notable rough edges |
| 2 | Partial — criterion partially met; design review needed |
| 1 | Failing — criterion not met; bug or balance intervention required |

---

## Dimensions

### Dimension 1: Fight Duration (Pacing)

**Definition**: Most fights should feel tense but decisive. A fight that ends in one or two turns feels trivial; a fight exceeding twelve turns becomes an attrition grind.

**Thresholds (from PLAN-EVAL.md Rubric 2)**:
- Pass: 95% or more of fights end in 3–12 turns
- Warning: more than 5% of fights end outside the 3–12 range
- Fail: any fight reaches MAX_TURNS (200)

**How to score**:
1. From the combatMatrix JSON output, extract `avgTurns` for each cell.
2. Count cells where `avgTurns` is below 3 or above 12. These are outlier cells.
3. Assess whether outlier cells are concentrated in logically expected matchups (e.g., level-9 enforcer vs. shuffler is expected to be fast; level-1 broker vs. elder_sanguine may be long).

| Score | Criterion |
|-------|-----------|
| 5 | All cells in 3–12 range; no fight hits MAX_TURNS |
| 4 | Fewer than 3 cells outside 3–12 range; all outliers are level extremes |
| 3 | 3–8 cells outside 3–12 range; no MAX_TURNS fights |
| 2 | More than 8 cells outside 3–12 range OR any fight exceeds 50 turns |
| 1 | Any fight hits MAX_TURNS (200) — automatic failure |

**Source data**: `combatMatrix.test.ts` JSON output, field `avgTurns`.

---

### Dimension 2: Outcome Variety

**Definition**: Every class should be capable of winning, capable of losing, and capable of close wins (player at low HP but alive). Fights that always end the same way — regardless of seed — indicate insufficient variance.

**Thresholds**:
- Pass: all three outcomes (clean win, close win, loss) observed across 20 fights per class
- Warning: any class never loses at level 1 against any enemy
- Fail: any class wins 100% of fights at level 1

**How to score**:
1. From the combatMatrix JSON, identify each class's level-1 win rates across all 16 enemies.
2. Verify that win rates span a meaningful range (not all 0% or all 100%).
3. From log samples (10 sampled fights per class), count how many end with player HP above 50% (clean), below 25% (close), and player dead (loss).

| Score | Criterion |
|-------|-----------|
| 5 | All 3 outcome types observed in sampled fights for all 7 classes |
| 4 | At least 2 outcome types per class; one class missing one outcome type |
| 3 | At least 2 outcome types per class; 2–3 classes missing one outcome type |
| 2 | Any class missing 2 outcome types OR win rate stuck at 0% or 100% across all enemies at a given level |
| 1 | Any class sweeps all 16 enemies at level 1 (100% win rate) — automatic failure |

**Source data**: `combatMatrix.test.ts` JSON output; sampled combat logs from `pnpm test:eval --reporter=verbose`.

---

### Dimension 3: NaN / Inf Damage Integrity

**Definition**: Every damage value, every HP change, every condition tick must be a finite number. Non-finite values indicate arithmetic bugs — typically division by zero in defense formulas, or undefined stat access.

**Thresholds**:
- Pass: zero NaN/Inf values across all 1,680 simulated fights
- Fail: any NaN/Inf value in any fight

**How to score**:
1. Check that the combatMatrix test passes (it has explicit NaN/Inf guards: `!isFinite(pResult.damage)` and `!isFinite(eDmg)`).
2. Check that the abilityMatrix test passes (it checks `isFinite(result.playerHpDelta)`).
3. If either test fails due to a NaN/Inf crash, score is 1.

| Score | Criterion |
|-------|-----------|
| 5 | Both matrix tests pass with zero crashes; no NaN/Inf in any fight |
| 3 | Both matrix tests pass; no NaN/Inf in the matrix, but a manual log sample finds a non-finite value |
| 1 | Either matrix test fails due to NaN/Inf — automatic failure |

**Source data**: `combatMatrix.test.ts` crash assertions; `abilityMatrix.test.ts` crash assertions.

---

### Dimension 4: Status-Effect Readability

**Definition**: When a condition is applied to a player or enemy, the combat log must name the condition and state its duration. Silent condition application (no message, or message without condition name) leaves the player without information needed to make decisions.

**How to score**:
Collect 10 combat log samples that include condition application events (specifically: fights against the Screamer, Whisperer, or Stalker — enemies whose special mechanics apply conditions or behavioral changes). For each condition-application event in the log:

1. Confirm the condition name is present (e.g., "bleeding", "stunned", "frightened", "weakened").
2. Confirm the duration or remaining-turns count is present.
3. Confirm the source (player attack applying condition vs. enemy special mechanic) is identifiable from the message.

The `buildStatusStrip()` function in `lib/actions/combat.ts` produces strip format `[bleeding 2 | stunned 1 | enemy: weakened 1]`. This strip must appear in the log when conditions are active.

| Score | Criterion |
|-------|-----------|
| 5 | All 10 sampled condition events have name + duration; status strip present each turn conditions are active |
| 4 | 9 of 10 events have name + duration; strip may be missing on the same turn conditions are first applied |
| 3 | 7–8 of 10 events have name + duration; strip consistently present once conditions are active |
| 2 | Fewer than 7 events include both name and duration |
| 1 | Any condition applied silently — no name, no duration in the log — automatic failure per PLAN-EVAL.md |

**Source data**: sampled combat logs, `buildStatusStrip()` in `lib/actions/combat.ts`.

---

### Dimension 5: Enemy-Specific Behavior Distinctiveness

**Definition**: Boss-tier enemies (Screamer, Whisperer, Hive Mother) must behave mechanically and narratively differently from the baseline Shuffler. Each has a documented special mechanic. If these mechanics never trigger or if the log messages are identical to a standard melee exchange, the boss tier fails to deliver meaningful encounter variety.

**Enemy-specific mechanics to verify**:

| Enemy | Special Mechanic | Expected Log Signal |
|-------|-----------------|---------------------|
| Screamer (`screamer`, hp=10, fleeThreshold=0.5) | Flees at 50% HP; scream draws noise encounter | Log shows flee attempt or noise encounter trigger; `fleeThreshold` is 0.5 — highest of all base hollow |
| Whisperer (`whisperer`, critChance=0.0, conditionImmunity: frightened) | Immune to frightened condition; uses vocal mimicry flavor | Log does not show frightened applied to Whisperer; flavor text references voice mimicry |
| Hive Mother (`hive_mother`, hp=50, attack=5, defense=14) | High HP pool, coordinated-Hollow flavor; `applyHollowRoundEffects()` should reference pheromone signal | Log shows multi-round engagement; `bossIntro` and `combatIntro` fire on first encounter; `applyHollowRoundEffects` produces distinct messages |
| Stalker (`stalker`, critChance=0.15, resistance: keen 0.5x) | High crit rate; resists keen weapons; patient flavor text | Log shows crit events more frequently than vs. Shuffler; keen weapon users deal reduced damage |
| Elder Sanguine (`elder_sanguine`, critChance=0.20, immunity: disrupting 1.0x) | Full immunity to disrupting damage; high crit rate | Disrupting weapons deal zero bonus damage; crits appear frequently in log |

**How to score**:
For each of the five enemies listed, collect 3 sampled fights and verify that the listed mechanic produced at least one observable log signal. Score by how many of the five pass (maximum 5).

| Score | Criterion |
|-------|-----------|
| 5 | All 5 enemies show their documented mechanic in at least 1 of 3 sampled fights |
| 4 | 4 of 5 enemies show their mechanic |
| 3 | 3 of 5 enemies show their mechanic |
| 2 | 2 of 5 enemies show their mechanic |
| 1 | Any boss-tier enemy (Screamer, Whisperer, Hive Mother) behaves identically to a Shuffler — automatic failure per PLAN-EVAL.md |

**Source data**: `applyHollowRoundEffects()` in `lib/combat.ts`; sampled combat logs; `data/enemies.ts` resistance profiles.

---

### Dimension 6: Class Ability Viability

**Definition**: Each class ability should meaningfully affect fight outcomes when used. An ability that has no measurable effect on win rate or turns-to-kill is dead design weight. Conversely, an ability that guarantees a win against enemies where it should not (e.g., Broker Intimidate against the Hive Mother) is unbalanced.

**How to score**:
Use the abilityMatrix JSON summary (printed by `abilityMatrix.test.ts`). For each class, compare:
- HP delta range: is the range consistent with the documented ability cost/heal?
- Fires count: does the ability fire in all 21 scenarios (7 enemies × 3 seeds)?
- Crashes: zero is required.

Then for three classes (Enforcer, Shepherd, Warden), compare win rates in combatMatrix against typical tier-matched fights. These three have abilities with direct combat impact:
- Enforcer Overwhelm (auto-hit, armor-bypass, −3 HP cost): should increase win rate vs. high-defense enemies
- Shepherd Mend (1d6 + presence heal, doubles on field medicine success): should extend fight survival, increasing close-win count
- Warden Brace (60% incoming damage reduction this turn): should reduce turn damage spikes, increasing survival vs. high-attack enemies

| Score | Criterion |
|-------|-----------|
| 5 | All 7 abilities fire in all scenarios; HP deltas match documented bounds; all 3 impact-class abilities show measurable effect on survival in sampled fights |
| 4 | All 7 fire without crash; 2 of 3 impact-class abilities show measurable effect |
| 3 | All 7 fire without crash; 1 of 3 impact-class abilities shows measurable effect; others unclear |
| 2 | Any ability fires zero times across its 21 scenarios OR any crash |
| 1 | Any ability produces a crash in any scenario — automatic failure |

**Source data**: `abilityMatrix.test.ts` summary table; combatMatrix win-rate comparison.

---

### Dimension 7: Difficulty Curve Coherence

**Definition**: A level-1 player should find most enemies difficult; a level-9 player should win the majority of fights while still losing occasionally against boss-tier enemies. The difficulty curve should rise monotonically for each class across levels 1, 3, 5, 7, 9.

**How to score**:
From the combatMatrix JSON, for each class, extract the average win rate across all 16 enemies at each level. The sequence should be monotonically non-decreasing: level-1 win rate <= level-3 win rate <= level-5 win rate <= level-7 win rate <= level-9 win rate.

Allowed exceptions:
- A non-monotonic step of ≤5 percentage points (within RNG variance)
- A single class with one reversal (not two)

| Score | Criterion |
|-------|-----------|
| 5 | All 7 classes show monotonically increasing average win rate across all 5 levels |
| 4 | 6 of 7 classes monotonic; 1 class has a single ≤5pp reversal |
| 3 | 5–6 classes monotonic; reversals are small and isolated |
| 2 | 3 or more classes show non-monotonic curve with reversals > 5pp |
| 1 | Any class has lower average win rate at level 9 than at level 1 — inverted curve |

**Source data**: combatMatrix JSON `winRate` field by class × level.

---

## Scoring Sheet Template

Copy this table for each review session. Record scores and evidence citations.

```
Session: [date]
Matrix run: [seeds used, combatMatrix output hash or git commit]
Reviewer: [name]

| Dimension | Score (1-5) | Key Evidence | Notes |
|-----------|-------------|--------------|-------|
| 1. Fight Duration | | avgTurns outlier count: __ | |
| 2. Outcome Variety | | classes missing outcomes: __ | |
| 3. NaN/Inf Integrity | | test pass/fail: __ | |
| 4. Status-Effect Readability | | events with name+duration: __/10 | |
| 5. Enemy Distinctiveness | | enemies showing mechanic: __/5 | |
| 6. Class Ability Viability | | abilities firing correctly: __/7 | |
| 7. Difficulty Curve | | monotonic classes: __/7 | |

Mean: __
Overall: PASS (≥3.5) / WARN (3.0–3.4) / FAIL (<3.0)
```

---

## Worked Example: Wraith vs. Hive Mother (seed 42, level 3)

This example applies the rubric to a single ability × enemy interaction from `abilityMatrix.test.ts` (wraith vs. hive_mother, seed 42) and a corresponding fight from `combatMatrix.test.ts`.

**Setup from the matrix**:
- Class: wraith
- Enemy: hive_mother (`hp: 50, attack: 5, defense: 14, damage: [5, 10]`)
- Level: 3 (gear tier 2: combat_knife, leather_jacket; weapon damage 4)
- Seed: 42
- Wraith stats at level 3: vigor 4 + grit 4 + reflex 7 (class bonus +3) = high reflex baseline; shadow 7 (class bonus +3 + 3 free points); maxHP = 8 + (4-2)*2 = 12

**Ability resolution (abilityMatrix.test.ts)**:
The abilityMatrix fires `resolveAbility(wraith, hive_mother_state, seed=42)`. Expected result per `ABILITY_EXPECTATIONS.wraith`:
- `shadowstrikeActive: true`
- `cantFlee: true`
- `abilityUsed: true`
- `playerHpDelta: 0` (no HP cost)

The Hive Mother has no condition immunities relevant to Shadowstrike (Shadowstrike sets a crit flag — it does not apply a condition). The ability fires without issue. Score contribution: positive for Dimension 6 (Class Ability Viability).

**Fight simulation (combatMatrix.test.ts)**:
Wraith at level 3 with tier-2 gear faces the Hive Mother (hp=50) with defense=14. Tier-2 weapon (combat_knife, damage=4) produces a damage range of [1, 4]. Effective damage per hit is low against a high-defense enemy. The Hive Mother deals [5, 10] per turn.

Expected fight duration: wraith maxHP 12 / average enemy damage ~5 = approximately 2–3 turns before death, unless the wraith's Shadowstrike crit fires early and significantly reduces the Hive Mother's HP. Typical fight: 3–6 turns, loss at level 3 against a boss-tier enemy.

**Dimension application**:

| Dimension | Observation | Score Contribution |
|-----------|-------------|-------------------|
| 1. Fight Duration | Expected 3–6 turns: within the 3–12 range | Positive |
| 2. Outcome Variety | Wraith likely loses at level 3 vs. Hive Mother: one of the three outcome types represented | Positive |
| 3. NaN/Inf Integrity | No division-by-zero risk; Hive Mother has `attack: 5`, `defense: 14` — all integers | Positive |
| 4. Status-Effect Readability | Hive Mother has no condition immunities; if Shadowstrike lands a crit applying a condition, the status strip should show it | Positive if strip appears; flag for review if it does not |
| 5. Enemy Distinctiveness | Hive Mother's `bossIntro` and `combatIntro` should fire; `applyHollowRoundEffects` should produce pheromone-related messages | Requires log review |
| 6. Class Ability Viability | Shadowstrike fired correctly (abilityMatrix confirms); the crit from Shadowstrike should produce a noticeably higher damage number in the log vs. a standard wraith attack | Positive; verify in combat log |
| 7. Difficulty Curve | Wraith level 3 vs. Hive Mother is an expected loss; level 7–9 wraith should have a meaningfully higher win rate against the Hive Mother | Check cross-level winRate progression |

**Conclusion**: The wraith vs. hive_mother interaction at level 3 is a useful stress test because the Hive Mother is the highest-HP Hollow enemy (50 HP, roughly 4× the Shuffler). The Shadowstrike crit is the wraith's best tool here. A reviewer should check whether the win rate at this cell (wraith|hive_mother|3) is in the 0–20% range (expected: wraith at level 3 with tier-2 gear should rarely beat a 50-HP boss) and confirm the Shadowstrike ability does produce at least one visible crit event in the sampled logs.

---

## Detecting Balance Regressions Across Updates

### What constitutes a regression

A balance regression is a change in the combatMatrix or abilityMatrix outputs that was not intended by the author of the change. Common causes:
- Stat changes to `CLASS_DEFINITIONS` in `types/game.ts`
- HP formula changes in `lib/combat.ts`
- Defense calculation changes (especially armor reduction in `computeArmorReduction()`)
- Ability flag changes in `lib/abilities.ts`
- Enemy stat changes in `data/enemies.ts`

### Detection procedure

After any PR that touches `lib/combat.ts`, `lib/abilities.ts`, `types/game.ts`, or `data/enemies.ts`:

1. **Run the matrix tests**: `pnpm test:eval`. The tests print the full win-rate table and JSON to console. Capture this output.
2. **Compare to baseline**: Keep a committed copy of the most recent matrix output in `evaluation/test-analysis/combat-matrix-baseline.json`. The comparison is a manual diff or script-assisted diff of win rates.
3. **Flag any cell with a win-rate change greater than 15 percentage points**. These are regression candidates.
4. **Re-apply this rubric against the new output**. Any dimension that drops below 3 is a blocker.

### Regression baseline format

The combatMatrix test already prints JSON in this format:

```json
{
  "enforcer|shuffler|1": { "winRate": 0.667, "wins": 2, "total": 3, "avgTurns": 4 },
  "enforcer|shuffler|3": { "winRate": 1.0, "wins": 3, "total": 3, "avgTurns": 3 },
  ...
}
```

Store this as `evaluation/test-analysis/combat-matrix-baseline.json` after each intentional balance change. Commit the updated baseline in the same PR as the balance change.

### High-sensitivity cells

These cells are the most likely to reveal regressions because they sit near the balance boundaries:

| Cell | Sensitivity | Why |
|------|------------|-----|
| `broker|elder_sanguine|1` | High | Broker has the weakest base attack; elder_sanguine has attack=8, defense=17 — near-certain loss at level 1 |
| `wraith|shuffler|9` | High | Expected near-certain win — any drop below 90% win rate signals a regression in high-level scaling |
| `enforcer|hive_mother|5` | High | Hive Mother is the hardest Hollow; level 5 enforcer with tier-3 gear should be around 40–60% win rate |
| `shepherd|stalker|3` | High | Stalker has critChance=0.15 and can land crits frequently; Shepherd has low reflex — this cell tests whether Mend heals enough to survive the burst damage |
| `warden|brute|1` | High | Brute has heavy weapon resistance (halves heavy bonus damage); Warden's Brace reduces incoming — should be the highest-surviving class at level 1 vs. the Brute |

Monitoring these five cells after any combat-system change gives early warning of unintended regressions before reviewing the full 560-cell matrix.

### RNG distribution gate

If the RNG distribution test (`tests/eval/rngDistribution.test.ts`) begins failing — particularly the `rollCheck` uniformity assertions — the entire combatMatrix output becomes suspect. RNG distribution failures are an upstream blocker: do not interpret win-rate changes until the distribution test is passing again.

---

## Application Method (Full Review)

1. Run `pnpm test:eval` and capture the full console output.
2. Extract the combatMatrix JSON block (between `=== MATRIX JSON (for report) ===` and end of test).
3. Extract the abilityMatrix summary table (between `=== ABILITY MATRIX SUMMARY ===` and end of test).
4. Sample 10 fight logs per class: run combatMatrix with `--reporter=verbose` and collect first 10 lines per fight that show turn-by-turn events.
5. Fill in the scoring sheet above.
6. Record the result in this file under a dated entry at the end.

**Runtime**: a full review should take approximately 45–60 minutes for an experienced reviewer who knows the codebase.

**Frequency**: run after every PR that touches `lib/combat.ts`, `lib/abilities.ts`, `data/enemies.ts`, or `types/game.ts`.

---

## Score History

| Date | Matrix Commit | Mean Score | Notes |
|------|--------------|------------|-------|
| _Not yet scored_ | — | — | Rubric established 2026-05-03 |
