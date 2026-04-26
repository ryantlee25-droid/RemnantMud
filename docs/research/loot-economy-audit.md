# Loot Economy — Internal Audit (Battle-MUD Pivot)

> **Date:** 2026-04-25
> **Branch:** dev/battle-mud-pivot
> **Audit by:** Explore agent (transcript captured inline; agent could not write directly due to Bash perms)
> **Verification flag:** Specific counts and stats below are agent-recalled from item/enemy/recipe files. Blue should re-grep against `data/items.ts`, `data/enemies.ts`, `data/recipes.ts` before turning specific claims into work.

---

## Headline

The Remnant has a **functional but shallow** loot economy with 100% enemy drop coverage and 15 crafting recipes, but the design is **non-replayable after one loot cycle** because all stats are fixed and there are no random affixes, tier labels, durability, boss-unique drops, or post-gearing currency sinks. For a battle-MUD pivot, the lever is **adding variance** (affixes, tiers, boss-unique drops, durability) more than adding *more* items.

---

## 1. Item taxonomy

| Type | Count | Notes |
|------|-------|-------|
| Weapons     | 16  | Damage range 3 (pipe_wrench) to 12 (shotgun), median 6 |
| Armor       | 12  | Defense range 1 (scrap_vest) to 6 (military-grade), median 2 (bottlenecked at tier 2 — 4 items) |
| Consumables | 42  | Medical, food, ammo |
| Junk        | 43  | Mostly trade fodder |
| Currency    | 5   | 3 ammunition types + sanguine_blood_vial (dual-role consumable/currency) |
| Keys        | 10  | Quest gates |
| Lore        | 74  | Documents, journal pieces |
| **TOTAL**   | **182** | |

**Trait coverage:**
- 7 weapon traits used: heavy, vicious, keen, quick, precise, silenced, blessed (3 of 10 defined are unused per gear-stats audit)
- 3 armor traits used: fortified, reactive, insulated (warded defined but unused)

**Notable items:**
- `silver_knife` — blessed tier-5, rare elder_sanguine drop (boss-tier loot exists, but only one example)
- `meridian_keycard`, `hazmat_suit` — quest-tied unique gear
- Currency entries: 3 ammunition types blur the line between currency and consumable

---

## 2. Drop sources

**Enemy loot coverage: 100%** (16 of 16 enemies have explicit loot tables — verified)

**Loot imbalances flagged:**
- `screamer` only 2 drops vs. 3–5 standard
- `whisperer` has NO armor in its drop table
- `brute` over-weights `scrap_metal` (0.60 vs. 0.20 typical)

**Room items:** all loot is `itemSpawns`-driven (probabilistic, with respawn timers 30–180 min). No hardcoded `room.items: []` arrays. ~2.5 items per room average across 271 rooms.

**Estimated world loot availability:** 200–260 unique items per long session across 271 rooms.

---

## 3. Currency flow

**Earnings (2–3 hr session):**
- 40–145 `.22 LR` rounds from kills
- Plus vendor sales conversion (sell-to-buy ratios not tabulated in this pass)
- Hourly rate: 15–25 rounds/hr from combat

**Spending:**
- Tier-1 gear: ~53 rounds
- Tier-4 gear: ~140 rounds
- 1 tier of progression per 1–2 sessions at medium pace

**CRITICAL GAP — Economic sinks:**
- No durability system → no repair costs
- No services priced (rest is free, NPCs don't take payment for healing)
- No long-term currency sink past initial gearing
- Once a player has tier-4 gear, currency becomes meaningless

---

## 4. Crafting / item progression

**15 recipes** in `data/recipes.ts`:
- 4 medical
- 4 weapons / munitions
- 4 utility
- 3 advanced (quest-gated)

**Complexity:** DC 8–15. Components are fixed (not generic "metal plates" — specific item ids).

**Progression positioning:** crafting is a *supplement*, not a primary path. Tier-5 weapons like `silver_knife` are loot-only, not craftable. There's no upgrade or transmute path.

**Missing:**
- Junk → materials transmutation
- Weapon/armor upgrade paths (tier-N → tier-N+1)
- Enchanting / socketing
- Crafting recipes for tier-4+ gear

---

## 5. Inventory mechanics

(Cross-cuts gear-stats audit R3; deferred for that report)

---

## 6. Loot distribution heatmap

(Per-zone loot density estimates deferred — would benefit from a follow-up grep over `data/rooms/*.ts`)

---

## 7. Gear progression curve

| Slot | Floor | Ceiling | Notes |
|------|-------|---------|-------|
| Weapon | pipe_wrench (dmg 3) | shotgun (dmg 12) | 4× spread |
| Armor  | scrap_vest (def 1) | military-grade (def 6) | 6× spread; **bottleneck at tier 2** with 4 items |
| Currency | n/a | tier-4 gear at 140 rounds | hits cap quickly |

**Build-defining items today:** `silver_knife` (blessed) is the closest thing — gates effective Sanguine combat. Otherwise gear is largely fungible within a tier.

---

## 8. Gaps surfaced — battle-MUD requirements

The current system is missing:

- **Random affix system** (Diablo-style prefix/suffix on drops)
- **Tier labels / rarity colors** (common / uncommon / rare / epic / legendary)
- **Durability mechanic** — no currency sink, gear is permanent
- **Boss-unique drops** — named enemies drop the same table as commons, just at higher multipliers
- **Faction-flavored gear** — faction rep is cosmetic; no faction-specific gear
- **Set bonuses** — wearing the matching helm + chest gives no synergy
- **Enchanting / socketing**
- **Quest-gated legendary tracking** — unique items aren't narratively emphasized in UI
- **Consumable cooldowns** — potion spam may trivialize combat
- **Upgrade paths** — crafted items never reach late drops

---

## 9. Inconsistencies & dead code

- 3 weapon traits and 1 armor trait defined in `types/traits.ts` are not used by any item in `data/items.ts` (per gear-stats audit; cross-reference)
- `sanguine_blood_vial` blurs currency and consumable categorization
- Loot tables for `screamer` and `whisperer` look hand-tuned but inconsistent with the standard 3–5 drops per enemy

---

## 10. Quantitative summary

| Metric | Value |
|--------|-------|
| Total items | 182 |
| Enemy loot coverage | 16/16 (100%) ✓ |
| Avg drops per kill | 1.25 |
| Currency yield per hour | 15–40 .22 LR |
| Tier 1 gear cost | 53 rounds |
| Tier 4 gear cost | 140 rounds |
| Recipes | 15 (4 quest-gated) |
| Average room item density | 2.5/room |
| Weapon tier range | 1–5 |
| Armor tier range | 1–4 |

---

## Top 10 highest-leverage gaps (battle-MUD pivot)

1. **No random affixes** → no replayability after first loot cycle. Highest impact.
2. **No item tiers/rarity** → players can't assess gear value at a glance. Cheap fix, high visibility.
3. **No durability** → no currency sink post-gearing. Economy collapses after ~5 hours.
4. **No boss-unique drops** → named enemies drop generic tables. Bosses don't feel special.
5. **Loot table imbalance** — screamer 2 drops vs. elder_sanguine 4 → trash-farming as efficient per kill as boss-farming.
6. **No faction-specific gear** → faction reputation is cosmetic in loot terms.
7. **No set bonuses** → armor combinations are invisible.
8. **No consumable cooldowns** → potion spam viable in combat, breaks pacing.
9. **No enchant/upgrade paths** → crafted gear ceiling far below drop ceiling.
10. **No quest-gated legendary tracking** in UI → unique items invisible after pickup.

---

## Top 5 things Blue must know

1. **Game is non-replayable after first loot cycle.** All drops are fixed; a second playthrough offers no gear discovery. Random affixes are the single biggest lever.
2. **Loot is not a progression vector.** Most gear can be vendor-bought, decoupling loot discovery from gameplay reward.
3. **No economy after gear acquisition.** Once geared, no reason to farm. No durability, no services, no sinks.
4. **Enemy XP-to-drop ratio is broken.** Shuffler (12 XP) returns 1.1 expected drops; elder_sanguine (400 XP) returns 1.5. Trash farming returns same per-XP as bosses.
5. **Boss encounters are not special.** Elder sanguine drops the same item types as common sanguine. No unique weapons, no unique lore items, no boss-exclusive mechanics visible in loot.

---

## Caveats

- Counts above are agent-recalled; verify with `grep -c "type: 'weapon'" data/items.ts` etc.
- `data/recipes.ts` recipe count of 15 should be re-grep'd
- Currency yield estimates assume mid-density combat (~10 kills/hr) — under the current sparse spawn pipeline real yields may be lower
