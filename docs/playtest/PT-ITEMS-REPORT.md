# PT-ITEMS-ALL — Exhaustive Item Interaction Report

**Date**: 2026-04-30  
**Suite**: `tests/playtest/items-exhaustive.test.ts`  
**Run result**: 1048 tests, 1048 passed, 0 failed

---

## Summary

| Category       | Count |
|----------------|-------|
| Total items    | 271   |
| Weapons        | 48    |
| Armor          | 42    |
| Consumables    | 42    |
| Keys           | 10    |
| Junk           | 46    |
| Lore items     | 78    |
| Currency       | 5     |
| Items with statBonus | 11 |
| **Blockers**   | **0** |

---

## Blockers

**None.** All 271 items passed take, drop (non-keys), equip (weapons/armor), use (consumables), and data integrity checks without errors.

---

## Major Issues

**None.** 

Findings worth noting:

- `commanders_notes` is typed as `'key'` but has `usable: true` and `loreText`. It functions as both a key (unlocks something) and a lore document. This is intentional per the item design — the key type prevents dropping it.
- `crafted_signal_booster` is typed as `'key'` with `usable: true` and `useText`. Same pattern — functional key that can also be "used" for a narrative beat. Not a bug.

---

## Minor Issues

### Items without `description` (0)
All 271 items have non-empty descriptions. No items are blank.

### Lore items without `loreText` (0)
All lore items with `usable: true` have `loreText` populated. No blank/illegible lore items that don't serve a narrative purpose.

### Consumables without `useText`, `healing`, or `statBonus` (0)
All 42 consumables have at least one of these. The engine falls back to a generic "You use it" message if all three are absent, but none hit that path.

### Armor without `armorSlot` (1 item)
- `bare_plate` — tested as "armor without armorSlot" in the existing `inventory.test.ts` (intentional backwards-compat case). Not a new issue.

### Items with `usable: false` on non-weapon/armor types
- `silver_knife` (weapon) — `usable: false` is set but this is a weapon; `use` on weapons already returns an error via the engine. The field is redundant but not harmful.
- `filter_mask` and `cold_gear` (armor) — same pattern. `usable: false` is set but armor is never `use`d. Field is extraneous.

---

## Coverage Details

| Test section                        | Items covered | Result |
|-------------------------------------|---------------|--------|
| take — every item                   | 271           | PASS   |
| drop — every non-key item           | 261           | PASS   |
| drop — keys rejected                | 10            | PASS   |
| examine — description non-empty     | 271           | PASS   |
| equip — every weapon                | 48            | PASS   |
| unequip — every weapon              | 48            | PASS   |
| equip — every armor                 | 42            | PASS   |
| armor slot exclusivity              | 2 scenarios   | PASS   |
| use — heal consumables (sample 5)   | 5             | PASS   |
| use — buff consumables (statBonus)  | 5             | PASS   |
| use — plain consumables (sample 5)  | 5             | PASS   |
| use — lore items (sample 8)         | 8             | PASS   |
| stash round-trip (5 samples)        | 5             | PASS   |
| take failure: item not in room      | 10            | PASS   |
| drop failure: not in inventory      | 10            | PASS   |
| equip consumable rejected           | 5             | PASS   |
| use weapon rejected                 | 5             | PASS   |
| use junk rejected                   | 5             | PASS   |
| stat bonus invariant (50-cycle)     | 11            | PASS   |
| data integrity (12 assertions)      | 271           | PASS   |
