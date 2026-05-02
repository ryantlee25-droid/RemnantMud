# PT-QUEST Quest Playtest Report

**Agent**: Inline static analysis (PT-QUEST Howler timed out twice)
**Branch**: `dev/playtest-0430`
**Base commit**: `22a42c2` (PR #13 merged — Convoy 2C + release hardening)
**Test file**: `tests/playtest/quests-static.test.ts`
**Date**: 2026-05-01

---

## 1. Summary

| Metric | Value |
|---|---|
| Quest entries in `data/questDescriptions.ts` | 87 (94 flag + completionFlag references) |
| Unique quest flags (start triggers) | 81 |
| Unique completion flags | 14 |
| Quests with at least one verified setter for the start flag | 76 |
| Quests with verified completion-flag setter | 9 of 14 |
| **Orphan completion flags (cannot complete)** | **5** |
| **Affected quests (5 main-arc entries) cannot be marked complete in the journal** | **5** |

**Overall health**: Quest start triggers are in good shape — 76 of 81 quest flags have at least one setter (`setFlag` in dialogue, `questFlagOnSuccess` on a room examine, or direct `questFlags[…]` assignment in `lib/gameEngine.ts` / `lib/actions/*.ts`). The blocker is at the completion layer: **5 main-arc quests reference completion flags that nothing in the codebase ever sets**.

---

## 2. Blockers — quests that cannot be marked complete

All five are in the **main MERIDIAN/CHARON-7 investigation arc** and listed under `category: 'main'`. The quest entries themselves are reachable (their `flag` triggers fire), but the journal entry will permanently show "in progress" because the `completionFlag` it watches is orphaned.

### BLOCKER-Q1: "Origin of the Hollows" (flag: `found_hollow_origin`) — `hollow_origin_understood` is never set

- **Quest entry** (data/questDescriptions.ts): description discusses CHARON-7 producing Hollows; references researcher complicity.
- **Completion flag**: `hollow_origin_understood`
- **Setters found**: NONE (full search of `data/**` + `lib/**`)
- **Impact**: The quest enters the journal whenever `found_hollow_origin` is set (which IS set — verified via `setFlag: { found_hollow_origin: true }` in dialogueTrees.ts and `questFlagOnSuccess: { flag: 'found_hollow_origin' }` in the_scar.ts:1036). It then never marks complete.
- **Proposed fix**: Identify the canonical "moment the player understands the Hollows" — likely a specific Lev or Elder dialogue node — and add `setFlag: 'hollow_origin_understood'` there. Alternative: change `completionFlag` to point to an existing terminal flag like `discovered_archive_meridian_connection`.

### BLOCKER-Q2: "Origin of the Sanguine" (flag: `found_sanguine_origin`) — `sanguine_origin_understood` is never set

- **Completion flag**: `sanguine_origin_understood` — no setter.
- **Hint** in the entry: *"Vesper may be ready to hear what the records say."*
- **Impact**: Same pattern as Q1. The hint suggests a Vesper dialogue node should grant this — but no such node sets it.
- **Proposed fix**: Add `setFlag: 'sanguine_origin_understood'` to the appropriate Vesper response branch (likely the one that gates on `found_sanguine_origin`).

### BLOCKER-Q3: "<broadcaster identity quest>" — `broadcaster_found` is never set

- **Hint**: *"The transmissions came from inside the Scar perimeter. They may still be active."*
- **Completion flag**: `broadcaster_found`
- **Impact**: The Scar broadcaster discovery is one of the optional main-arc threads. Players reach the Scar, find the broadcaster, but the journal won't reflect completion.
- **Proposed fix**: Add a `questFlagOnSuccess: { flag: 'broadcaster_found' }` to whichever room examine action represents reaching the broadcaster (likely in `the_scar.ts` near a transmitter-related extra).

### BLOCKER-Q4: "<fault-entity quest>" — `fault_entity_observed` is never set

- **Hint**: *"The Elder may understand what the Fault-Adjacent Specimen refers to."*
- **Completion flag**: `fault_entity_observed`
- **Impact**: Tied to the Elder dialogue tree; a tier-3 elder lore branch should set this on observation.
- **Proposed fix**: Find the Elder's tier-3 fault-related node and add the setter.

### BLOCKER-Q5: "The Scar and the Fault" (flag: `discovered_fault_scar_connection`) — `fault_scar_connection_confirmed` is never set

- **Completion flag**: `fault_scar_connection_confirmed`
- **Hint**: *"The Scar itself may hold answers the archive only hints at."*
- **Impact**: A Scar-zone discovery should confirm this; the `discovered_fault_scar_connection` flag IS set somewhere (the entry triggers), but the confirmation flag is never set on actually visiting the Scar.
- **Proposed fix**: Add `questFlagOnSuccess: { flag: 'fault_scar_connection_confirmed' }` to a specific Scar-zone room examine (likely `scar_14_the_core` or a deep Scar room).

---

## 3. Major issues

### MAJOR-Q1: 5 of 14 completion flags orphaned (35%)

Out of 14 distinct `completionFlag` values declared in `questDescriptions.ts`, 5 have no setter anywhere. That's 35% of completion conditions broken — a high-impact quality issue for the main arc specifically.

The 9 completion flags that DO work:
- `discovered_archive_meridian_connection`, `charon_choice`, `discovered_charon7_deliberate_release`, `game_ending`, `elder_lore_tier_3`, `kindling_tunnel_access`, `reclaimers_meridian_keycard`, `avery_departed`, `duskhollow_cistern_device_found` — all confirmed set via dialogue trees, room examines, or gameEngine.

### MAJOR-Q2: Quest journal currently silent on quest progress

Beyond completion flags, there is no mid-quest progression annotation. A quest is either listed (its `flag` is set) or complete (its `completionFlag` is set). There's no way to see which sub-objective the player has reached. Not a launch blocker, but worth flagging if "100% playable" implies "100% legible".

---

## 4. Minor issues

### MINOR-Q1: Hint text references NPCs/locations by display name, not by item/flag

Some hints say things like "Lev at The Stacks may know more" — fine for prose. But if those NPCs are renamed or moved, the hints rot. Not actionable now; flagging as drift risk.

### MINOR-Q2: A few faction-quest entries appear under `category: 'main'`

Subjective categorization issue. Not a blocker.

---

## 5. Test deliverable

`tests/playtest/quests-static.test.ts` — performs the same static analysis as this report at `pnpm test --run` time:

1. Loads `data/questDescriptions.ts` via import.
2. For every `completionFlag`, asserts that at least one setter exists in `data/**` or `lib/**`.
3. Currently 5 assertions are `it.fails(...)`-marked (the 5 blockers above).
4. When a future change adds the missing setters, those `it.fails` blocks will start passing — they'll then break the suite and signal to flip them to `it(...)` and ship.

---

## 6. How I derived this list (reproducibility)

```bash
node /tmp/quest-orphan-check.mjs
```

The script lives at `/tmp/quest-orphan-check.mjs` for the duration of this session. It:

1. Parses `data/questDescriptions.ts` with regex to extract every `flag:` and `completionFlag:` value.
2. Walks every `.ts` file under `data/` and `lib/` (excluding `questDescriptions.ts` itself).
3. For each occurrence of a flag, classifies it as either a **read** (`requiresFlag`, `requiresFlagAbsent`, `requiresQuestFlag`) or a **setter** (anything else — `setFlag`, `questFlagOnSuccess`, `setQuestFlag(`, `questFlags[…] =`, `grantNarrativeKey`).
4. Reports the set of flags with no setter as orphans.

The classification is permissive — anything that mentions the flag outside a `requires*` context counts as a setter, so false negatives (a real orphan masked by a comment) are unlikely. False positives (something that looks like a setter but isn't) would skew the orphan count *down*; the orphan list is therefore a lower bound.

---

## 7. Open questions for the human

1. **Are these 5 quests intentional dangling threads** (the player is meant to "investigate" without ever getting closure in-game) — or are these unfinished writes?
2. **Should the quest journal show in-progress hints** as a player accumulates partial flags (e.g., 2 of 3 sub-investigations done)?
3. **Should `game_ending` be a per-ending flag** (e.g., `game_ending_cure`, `game_ending_weapon`) so the journal can show *which* ending was achieved? Currently it's a single flag — replays show identical journal state regardless of choice.
