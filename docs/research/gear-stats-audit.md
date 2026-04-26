# Gear / Stat-Modification System — Internal Audit (Battle-MUD Pivot)

> **Date:** 2026-04-25
> **Branch:** dev/battle-mud-pivot
> **Audit by:** Explore agent (transcript captured inline; agent could not write directly)
> **Verification flag:** Specific line numbers and counts are agent-recalled. Blue must re-grep against `types/traits.ts`, `lib/combat.ts`, `lib/inventory.ts`, `data/items.ts` before turning specific claims into work.

---

## Headline

The gear / stat-mod system is **fully functional but minimal** for a battle-MUD. All 10 weapon traits and 4 armor traits are implemented and read in combat. **No gear modifies base player stats** — all stat allocation happens at character creation. Only **2 of 7 classes** (Enforcer, Scout) have meaningful combat identity beyond stat allocation. The biggest single-file lever is adding a `statBonus` field to items.

---

## 1. Stat-modification surface — what gear can change today

**Weapon traits (all 10 implemented):** keen, heavy, vicious, scorching, draining, quick, silenced, precise, blessed, disrupting
- Applied in `lib/combat.ts:254` (player attack path)
- Resolved via `lib/traits.ts:18-156`

**Armor traits (all 4 implemented):** fortified, reactive, insulated, warded
- Applied in `lib/combat.ts:721-776` (enemy attack path)
- Resolved via `lib/traits.ts:165-219`

**Player base stats:** vigor, grit, reflex, wits, presence, shadow.
- **No gear modifies base stats today.** Stats are character-creation only.
- HP formula: `8 + (vigor - 2) * 2` — gear-independent

---

## 2. Per-class build viability

| Class | Combat Identity | Score | Notes |
|---|---|---|---|
| Enforcer | YES — tank via HP + Overwhelm finisher | 4/5 | Strongest combat presence |
| Scout | YES — ranged setup via Mark Target | 3/5 | Low reflex scaling in actual rolls |
| Wraith | PARTIAL — 1 crit per fight; locked-in once activated | 3/5 | Too restrictive |
| Shepherd | NO — healer is non-interactive | 2/5 | Needs damage scaling |
| Reclaimer | NO — Analyze is utility only | 2/5 | Needs damage scaling |
| Warden | NO — Brace trade-off too niche | 2/5 | Needs better defense scaling |
| Broker | NO — Intimidate is high-variance | 2/5 | Needs more control mechanics |

**Verdict:** only Enforcer and Scout have meaningful combat identities today. The other 5 classes are cosmetic stat-allocation variants of the same base combat system.

---

## 3. Active abilities (class skills)

- 7 unique abilities total, one per class
- Gated by `characterClass` switch in `lib/abilities.ts:107-129`
- Each ability used **once per combat**; tracked via `combatState.abilityUsed` flag
- **No cooldown** system, no mana/stamina pools, no chaining mechanics
- Triggered via `ability` command only; no class-specific verbs in the parser

---

## 4. Equipment slots

- **2 active slots:** weapon (1) + armor (1)
- Single-item-per-type enforcement via `equipItem()` auto-unequip logic at `lib/inventory.ts:186-201`
- Weight limit: `50 + (vigor × 5)` lbs (soft cap on pickup)
- Stash: separate 20-item persistent storage

**Gap vs. Diku-MUD baseline:** no off-hand, no dual-wield, no accessory slots (head, neck, fingers, back). Diku norm is ~16 slots; The Remnant has 2.

---

## 5. Gear stats currently in use

**Weapons:**
- `damage` (single int, not range)
- `weaponTraits` array
- No stat bonuses, no hit bonuses, no attack speed, no crit modifiers

**Armor:**
- `defense` (flat damage reduction, 0–6)
- `armorTraits` array
- No stat bonuses, no resistances beyond conditions

**Consumables:**
- Only `stim_shot` grants temp stats (+3 grit for 20 actions)
- No other stat-buffing consumables

**Tier field (1–5):** cosmetic/lore label; doesn't gate progression mechanically.

---

## 6. Class abilities deep dive

- All 7 classes get 8 stat points distributed (e.g., Enforcer +4 vigor, +2 grit, +2 reflex)
- Plus 4 free points per class
- No class-specific combat verb; all use the same `playerAttack()` function
- Class identity expressed via stat bonus + 1 ability per fight
- No shared cooldowns, no resource pools, no ability chaining

---

## 7. Gear acquisition pipeline

| Source | Status |
|---|---|
| Drops | Functional — RNG roll on enemy death (e.g., shuffler 10% scrap_metal) |
| Crafting | 15 recipes (medical, armor patch, utility); no weapon crafting |
| Quests | Dialogue trees grant items via `onEnter: { grantItem }`; no quest-gated gear scaling |
| Vendor | NPC trade inventory; no stat-progression vendors |
| Stash | Survives death; enables cross-cycle item preservation |

**Gap:** no dynamic item generation, no affixes, no rare drops, no quest-gated legendaries.

---

## 8. Stat-modification gaps for battle-MUD

Missing vs. Diku baseline:

1. Stat bonuses on gear
2. Damage/hit bonuses on individual items
3. Crit modifiers beyond Keen trait
4. Attack speed / initiative tuning (declared in some types, never coded)
5. Skill bonuses on gear
6. Durability / decay
7. Set bonuses
8. Random affixes / unique drops
9. Sockets / runes
10. Resistance/immunity scaling

---

## 9. Inventory & carry capacity

- Weight tracked on inventory; `maxWeight = 50 + (vigor * 5)`
- Soft cap at pickup (reject if over limit)
- **No encumbrance penalties** (no slowdown, no accuracy debuff)
- Stash is separate 20-item container

---

## 10. Quantitative summary

| Metric | Value |
|---|---|
| Trait coverage | 100% (all 14 traits read in combat) |
| Class viability | Enforcer/Scout strong (3-4/5); others weak (2/5) |
| Gear stat fields in use | damage, defense, traits, tier |
| Tier mechanical effect | None (cosmetic) |
| Equip slots | 2 (weapon + armor) |
| Active abilities | 7 (one per class, once per fight) |

---

## Top 10 gear-system extensions (prioritized)

1. **Stat Bonus Field** (1 day) — Add `statBonus?: Partial<Record<Stat, number>>` to Item; apply on equip
2. **Initiative System** (1 day) — `initiative` field; combat init from fixed 1d10 to `1d10 + reflex + gear_init`
3. **Crit Chance Scaling** (0.5 day) — `critChance?: number` field; Keen → +15%, stack with other sources
4. **Set Bonuses** (2 days) — `setId?: string`; 2+ items → trigger bonus (e.g., +1 all stats)
5. **Armor Slot Expansion** (2–3 days) — Split into head/chest/legs/feet; 4 slots instead of 1
6. **Resistance/Immunity Fields** (1 day) — `resistances?: Record<ConditionId, number>` to armor
7. **Skill Bonus on Gear** (1 day) — `skillBonus?: Partial<Record<SkillType, number>>`; apply on equip
8. **Durability Tracking** (2 days) — `durability?: number` (0.0–1.0) to InventoryItem; decay on hit, repair crafting
9. **Random Affixes on Drops** (2–3 days) — 20% chance to add `affix: string` to loot; affects trait pool
10. **Prestige Items** (3 days) — Hand-author 5–10 unique weapons/armor; special drops only

---

## Top 5 most actionable extensions

1. **Stat bonus field on items** — single biggest unlock for build viability; touches one type, one helper
2. **Class differentiation pass** — give each of the 5 weak classes a real combat verb (Shepherd: heal-strike, Reclaimer: scan-weakness, Warden: counter-attack, Broker: command-shout, Wraith: shadow-step)
3. **Armor slot expansion** — 1 → 4 slots is a force-multiplier on every other gear extension
4. **Initiative system** — turns reflex from a flee-checking stat into a per-fight tactical lever
5. **Random affixes** — single biggest replayability lever (echoes loot-economy R2 finding)

---

## Class identity verdict

Only **Enforcer and Scout** have meaningful combat identities today. Five classes (Wraith, Shepherd, Reclaimer, Warden, Broker) are cosmetic variations of the base combat system. The pivot must rebuild class differentiation if the user wants real build choice.

---

## Caveats

- Line numbers are agent-recalled; verify with `grep -n` before relying on specific cites
- Trait counts (10 weapon, 4 armor) verified against types/traits.ts in earlier audits
- Class ability count (7) and one-per-fight tracking via `combatState.abilityUsed` need direct read
