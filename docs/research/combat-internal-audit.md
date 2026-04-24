# Combat System — Internal Audit (Round 1)

> **Date:** 2026-04-24
> **Branch:** dev/followup-0425
> **Audit by:** Explore agent (transcript captured inline; agent could not write directly due to permission restriction)
>
> **VERIFICATION FLAG:** Spot-checks have already shown at least one finding to be inaccurate (called-shot dispatch IS present at `lib/gameEngine.ts:1888`, despite the audit claiming otherwise). Blue should cross-reference every specific claim against the actual code before turning it into work.

---

## Spot-checks performed by the main thread

| Audit claim | Verified state | Source |
|---|---|---|
| `attack_called` dispatch missing in gameEngine | **FALSE** — case exists at `lib/gameEngine.ts:1888` | grep |
| `warded` armor trait defined but not implemented | DEFINED at `types/traits.ts:143-144`. Implementation status TBD — Blue must check `resolveArmorTraits()` directly | grep |

---

## Combat data model

**Core stats used in combat (per audit):**
- `vigor` — hit chance (via statModifier) + damage bonus
- `grit` — fear resistance, frightened-state escape
- `reflex + shadow` — flee DC only
- `wits + presence` — class abilities only

**Enemies:** 17 types across 4 tiers (audit count, verify against `data/enemies.ts`):
- Hollow tier 1: shuffler (12 HP), remnant (16), screamer (10, summons), stalker (22), brute (30)
- Sanguine / advanced: whisperer, hive_mother (50), sanguine_feral (25), red_court_enforcer (35), elder_sanguine (60)
- Deep variants: 7 additional (elder_sanguine_deep 75 HP, hive_mother_the_deep 65, etc.)

**Weapon traits (10 total):**
- `keen` — crit on 9–10 instead of 10
- `heavy` — +2 damage
- `vicious` — bleeding 2/turn × 2
- `scorching` — 30% chance burning
- `draining` — heal 1 HP on hit
- `quick` — 2nd strike at 50%
- `silenced` — no noise
- `precise` — −50% enemy defense
- `blessed` — +3 vs Sanguine
- `disrupting` — block summons

**Armor traits (4 defined, audit claims 3 functional):**
- `fortified` — flat damage reduction
- `reactive` — block bleeding/poison
- `insulated` — block burning
- `warded` — claimed not implemented; Blue must verify in `resolveArmorTraits()`

---

## Combat verbs / handlers

Files of interest:
- `lib/actions/combat.ts` — exported handlers
- `lib/combat.ts` — lower-level math (audit references `doAttackRound`, `doEnemyTurn`, `playerAttack`, `getEnvironmentModifiers`, `computeEnvironmentEffects`, `resolveArmorTraits`)
- `lib/parser.ts` — verb registration
- `lib/gameEngine.ts` `_dispatchAction` switch — combat verb cases

**Verbs (audit claim):**
- `attack` (verified — line 1843)
- `attack_called` (verified — line 1888)
- `flee` (Blue verifies)
- Class abilities (Blue verifies which abilities exist)

---

## Combat math

- **Hit:** vigor + bonuses vs enemy defense DC
- **Damage base:** weapon roll + max(0, vigor modifier)
- **Critical:** 1.5× damage (rounded up); natural 10 always hits & crits
- **Armor:** 15% per defense point, capped at 60%, minimum 1 damage dealt — duplicated in `doAttackRound()` line ~364 and `doEnemyTurn()` line ~706 per audit (no shared util)
- **Specials:** hive_mother +1 to other Hollow; brute 2× on first attack; whisperer −2 to player (grit DC 10 to resist)
- **Fumble:** natural 1 (Blue verifies behavior)

---

## Combat lifecycle

**Start:** enemy spawned → `startCombat()` rolls initiative (1d10 vs 1d10, ties to player) → fear check if room difficulty ≥ 4 → environment narration

**Round:** tick conditions (DOT) → apply hollow effects (screamer summon 30%, whisperer debuff 20% with grit DC 10 resist) → player action (unless stunned) → enemy attack (unless stunned/intimidated) → additional enemies attack → save to DB

**End:** enemy defeated, player defeated, or fled

**Persistence (audit claim — VERIFY):** combat state is **not** persisted to Supabase mid-fight. Page reload loses in-progress combat. No regression test for save/load round-trip during combat.

---

## Combat output / readability

- Color tags via `combatMsg`, ANSI palette
- HP prompt switches in combat (`<HP:hp/maxHp>`)
- No distinct combat log — combat messages are interleaved with narration in `state.log`

---

## Combat onboarding / tutorial

- `handleTutorialHint` exists; combat coverage TBD (Blue verifies)
- No documented tutorial fight per audit

---

## Tests (audit claim — verify with `wc -l`)

| File | Lines | Coverage |
|---|---|---|
| `tests/integration/combat.test.ts` | 240 | handler mocks, start/defeat/loot |
| `tests/integration/combat-math.test.ts` | 156 | damage calc, hit chance, crits, fumbles |
| `tests/integration/combat-abilities.test.ts` | 408 | all 7 class abilities |
| `tests/integration/combat-edge-cases.test.ts` | 355 | conditions, armor, special enemies |
| `tests/integration/combat-social-deep.test.ts` | 569 | Broker intimidate, dialogue, reputation |

**Total ~1700 lines.**

**Critical missing test:** save/load round-trip during combat (TODO-RELEASE B12).

---

## Known issues from TODO-RELEASE.md (claims; Blue verifies)

- **B5 (HIGH):** Ending snapshot persist silent failure
- **W-death (WARN):** Death persist failure only logs to console
- **W-input-maxlength (WARN):** No maxLength on command input — Levenshtein O(m×n) on 10k char paste
- **W-prologue-enter (WARN):** Empty-input early return blocks "Press ENTER" prompt

---

## Performance

- Per-turn: pure math, no Supabase per swing
- Per-round: one batched upsert
- Re-renders: ~5–8 per round (one per appended message)
- Latency: sub-100ms typical (network-dominant)

---

## Code-quality surprises (audit claims; Blue verifies)

1. **Transient flags `_suppressNoise` and `_healPlayer`** — set by `playerAttack()`, consumed downstream, never explicitly cleared. Latent bug if a handler skips consumption.
2. **Overwhelming doesn't force crit** — `success=true, critical=false`; Overwhelm + Keen won't crit.
3. **Elemental resistance is flat −2** rather than percentage. Unintuitive at the design level.
4. **Additional enemies discarded on flee/death** — `additionalEnemies[]` (e.g. screamer summons) lost.
5. **Brute cooldown applies to summoned brutes** — fragile coupling.
6. **Armor formula duplicated** in two places — no shared util.

---

## Environment modifiers

- Implemented in `computeEnvironmentEffects()` and `getEnvironmentModifiers()`
- Effects: darkness (−2 enemy accuracy), high ground (+1 player accuracy/damage), narrow passage (−1 both defenses), collapsing ceiling (1d4 to both)
- **No dedicated integration tests per audit.**
- Owned by "Rider G" comment at `lib/combat.ts:23` — historical convoy artifact.

---

## Top 5 findings Blue should weigh first

1. **Save/load round-trip during combat is untested** — long-tail data-loss risk; the schema-drift class of incidents lives here.
2. **Several traits / mechanics may be defined but not actually implemented** — `warded` armor, possibly others. Need a "is this trait actually checked?" pass.
3. **Armor reduction duplicated** — should be a shared util before more rules pile on.
4. **Environment modifier paths are untested** — works in theory; quietly broken until it isn't.
5. **Combat onboarding is sparse** — relevant to user's "doesn't take extremely long to get into" requirement; the explore audit found no scaffolding for first fights.

---

## Caveats

- Audit was produced from inline analysis without Bash access — line numbers are agent-recalled, not freshly grep'd. Blue must `grep -n` or `Read` to confirm every specific claim before turning it into a Howler task.
- 17 enemy count and 4-tier classification need verification against `data/enemies.ts`.
- `1700+` lines of tests is approximate — verify with `wc -l`.
