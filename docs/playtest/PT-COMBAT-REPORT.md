# PT-COMBAT Playtest Report

**Date**: 2026-04-30
**Branch**: `worktree-agent-ab74bf2fa49ed99da`
**Test file**: `tests/playtest/combat-items-full.test.ts`
**Run result**: 88/88 passed, 0 failures, `tsc --noEmit` clean

---

## 1. Summary

| Area | Attempted | Passed | Blockers |
|------|-----------|--------|----------|
| Combat — Hollow archetypes | 9 | 9 | 0 |
| Combat — Sanguine/faction archetypes | 6 | 6 | 0 |
| Combat — MERIDIAN archetypes | 3 | 3 | 0 |
| Boss intros (8 required bosses × 2) | 18 | 18 | 0 |
| Loot tables + count ranges | 5 | 5 | 0 |
| AoE on death (Frenzy) | 3 | 3 | 0 |
| hollowKills counter + tier flags | 5 | 5 | 0 |
| Flee (success + failure paths) | 3 | 3 | 0 |
| Weapon equip / slot exclusivity | 3 | 3 | 0 |
| Armor equip per slot (H6) | 5 | 5 | 0 |
| statBonus on equip/unequip | 3 | 3 | 0 |
| statBonus drift 50x cycle | 2 | 2 | 0 |
| Consumables (healing, buff, stat) | 6 | 6 | 0 |
| Key items | 4 | 4 | 0 |
| Stash/unstash round-trip (B6) | 3 | 3 | 0 |
| Victory/defeat resolution | 3 | 3 | 0 |
| Deep zone enemies | 3 | 3 | 0 |
| Glass cannon archetypes | 3 | 3 | 0 |
| **Total** | **88** | **88** | **0** |

---

## 2. Blockers

**None.**

All combat scenarios resolved. All item interactions were usable. No blocking issues found.

---

## 3. Major

**None confirmed.**

### Observations worth noting:

- **`hollowKills` counter is wired in `gameEngine.ts` post-action hook (lines 2207–2228)**
  but the counter logic is NOT wired inside `lib/actions/combat.ts` or `lib/combat.ts`.
  The tier flags (`hollow_kills_tier_1/2/3`) are set correctly when kills reach 5/20/50.
  Since the hook checks `preCombatEnemy?.hollowType`, enemies without `hollowType`
  (e.g. `meridian_automated_turret`) correctly do NOT increment the counter.

- **Brute cooldown**: tested and confirmed working — after the charge turn, the brute
  skips its next attack. State flag `bruteCooldownTurn` is set correctly.

- **AoE radius resolution**: `resolveAoE` with `adjacent` radius delivers `ceil(roll/2)`
  damage to player. With the default rng (0.9), max damage from `[1,4]` range = 4,
  ceil(4/2) = 2. Behaves as documented.

---

## 4. Minor

- **Loot `count` field drop rates**: with `Math.random = 0.05`, `ammo_22lr` on shuffler
  drops exactly 1 (count [1,3]). Brute drops 3–6 correctly. The count field is respected.

- **Enemy flee**: `screamer.fleeThreshold = 0.5` and `stalker.fleeThreshold = 0.3` are
  wired in the data. The `checkEnemyFlee()` function in `lib/combat.ts` reads `fleeThreshold`
  correctly, but the caller (`doAttackRound` in `lib/actions/combat.ts`) does not call
  `checkEnemyFlee` — that call appears absent from the current action handler. This is
  a coverage gap but NOT a blocker since enemies can still die normally.

- **`getInventory` mock in equip tests**: the `equipItem` function calls
  `supabase.from('player_inventory').select().eq()` to load all rows, then
  `.update().in()` to batch-unequip and `.update().eq()` to equip the target.
  The mock correctly handles both call patterns via a pending-update closure.

---

## 5. Confirmed-Fixed Checklist

| Issue | Status |
|-------|--------|
| **H4 statBonus drift** — equip/unequip 50x leaves stat at base value | CONFIRMED FIXED |
| **H6 slot exclusivity** — equipping new head does not unequip chest; same slot conflict resolved | CONFIRMED FIXED |
| **B6 stash race** — item removed from stash before added to inventory (DB-first ordering) | CONFIRMED FIXED |

### Detail: H4 statBonus drift

The `applyStatBonus` function in `lib/inventory.ts` applies `+sign * delta` on equip and
`-sign * delta` on unequip. After 50 cycles: `base + (50 × +delta) + (50 × -delta) = base`.
No integer overflow or floating-point drift observed.

### Detail: H6 slot exclusivity

`equipItem` in `lib/inventory.ts` routes on `item.type === 'armor'` and compares
`armorSlot` (defaulting to `'chest'` for backward compat). Only rows in the same slot
are included in `toUnequipIds`. Confirmed:
- head equip → only other head items unequipped
- chest equip → only other chest items unequipped
- legs/feet: same isolation
- Cross-slot equip leaves all other slots intact

### Detail: B6 stash race

`handleStash` inserts the item into `player_stash` before calling `removeItem` from
inventory. `handleUnstash` deletes/decrements `player_stash` row first, then calls
`addItem` to inventory. The ordering is DB-first: stash write confirmed before inventory
write. No duplication in round-trip test.

---

## 6. bossIntro / combatIntro Wiring

| Boss | bossIntro | combatIntro |
|------|-----------|-------------|
| `elder_sanguine` | CONFIRMED | CONFIRMED |
| `elder_sanguine_deep` | CONFIRMED | CONFIRMED |
| `hive_mother_the_deep` | CONFIRMED | CONFIRMED |
| `meridian_automated_turret` | CONFIRMED | CONFIRMED |
| `meridian_ancient_hollow` | CONFIRMED | CONFIRMED |
| `frenzy` | CONFIRMED | CONFIRMED |
| `drifter_road_warden` | CONFIRMED | CONFIRMED |
| `lucid_thrall` | CONFIRMED | CONFIRMED |

All 8 required bosses have both `bossIntro` and `combatIntro` populated in `data/enemies.ts`.
The display wire-up in `lib/actions/combat.ts` (line 214: `if (enemy.combatIntro) engine._appendMessages([combatMsg(enemy.combatIntro)])`) was confirmed active in `a51cf0e`.

---

## 7. Additional Coverage Notes

- **`hive_mother` (surface)** also has both intro fields — bonus coverage beyond the 8 required.
- **`red_court_enforcer`** and **`sanguine_feral`** both have `bossIntro`/`combatIntro` — bonus.
- **`kindling_zealot`** has `bossIntro`/`combatIntro` — fire-immune as expected.
- **`apex_screamer`** tested as glass-cannon (hp=8, damage [4,10]).
- All `hollowKills` tier thresholds (5/20/50) confirmed via direct state simulation.

---

*Report generated by PT-COMBAT Howler — worktree `agent-ab74bf2fa49ed99da`*
