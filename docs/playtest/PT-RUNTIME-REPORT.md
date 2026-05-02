# PT-RUNTIME: Runtime NPC Chat Investigation
**Date**: 2026-05-02
**Branch**: `playtest/pt-runtime-early-0501`
**Test file**: `tests/playtest/runtime-chat.test.ts`
**Result**: 245 passing, 5 expected failures, 0 unexpected failures

---

## Smoking Gun

**The tester got stuck talking to Marta in `cr_03_market_south`.** The room's `npcSpawns` array references `npcId: 'food_vendor_marta'`, but that key was deleted from `data/npcs.ts` (line 2032 comment: *"food_vendor_marta removed — duplicate of marta_food_vendor"*). The correct key in NPCS is `marta_food_vendor` (note the reversed word order).

When the player types `talk marta` or `talk to marta` at the South Market, `_applyPopulation` pushes `'food_vendor_marta'` into `currentRoom.npcs`, but `handleTalk` calls `getNPC('food_vendor_marta')` which returns `undefined`. The engine outputs:

```
"That person has nothing to say."
```

The player can see Marta's spawn description ("Marta tends her cook fire, stirring a blackened pot...") but every talk attempt produces that error. **This is the exact user report: visible NPC, no conversation possible.**

**Fix**: In `data/rooms/crossroads.ts`, line 269, change `npcId: 'food_vendor_marta'` to `npcId: 'marta_food_vendor'`.

---

## All Runtime Failures, Categorized

### Category 1: Missing NPC Data (room references non-existent NPC ID)

These are dispatch failures — the NPC spawns visually but `getNPC()` returns `undefined`.

| NPC ID (broken) | Correct ID | Room | Zone | Error output |
|---|---|---|---|---|
| `food_vendor_marta` | `marta_food_vendor` | `cr_03_market_south` | Crossroads | `"That person has nothing to say."` |
| `lucid_sanguine_osei` | `dr_ama_osei` | (covenant zone) | Covenant | `"That person has nothing to say."` |
| `covenant_wall_child` | *(no equivalent)* | (covenant zone) | Covenant | `"That person has nothing to say."` |
| `pens_scheduling_officer` | *(no equivalent)* | `the_pens` (static `npcs[]`) | The Pens | `"That person has nothing to say."` |

**Root cause in all cases**: the NPC ID in room data does not match any key in `NPCS` dictionary.

### Category 2: Parser Issues

**None found.** The parser handles all expected forms correctly:

- `talk marta` → `{verb:'talk', noun:'marta'}` — works
- `talk to marta` → `{verb:'talk', noun:'marta'}` (preposition stripped) — works
- `talk Marta` → `{verb:'talk', noun:'marta'}` (lowercased, still matches) — works
- `speak to marta` → `{verb:'talk', noun:'marta'}` (alias + strip) — works
- `greet marta`, `ask marta` → `{verb:'talk', noun:'marta'}` — works
- `talk marshal cross` (multi-word NPC name) → works via longest-prefix matching in `handleTalk`

**The "talk to X" preposition form is NOT the bug.** The parser has explicit stripping at `lib/parser.ts:358`: `if (normalizedVerb === 'talk' && noun?.startsWith('to ')) { noun = noun.slice(3) }`.

### Category 3: Dispatch Failures

**None found beyond the missing-NPC-data issue above.**

When NPC data exists, the full dispatch chain works: `talk` → `handleTalk` → `getNPC()` succeeds → `DIALOGUE_TREES[treeKey]` resolves → `startDialogueTree` sets `activeDialogue` → node text displayed.

### Category 4: State Failures (dialogue navigation)

**None found.** `dialogue_choice` (branch selection), `dialogue_leave`, and multi-branch walk all work correctly.

**Important nuance documented**: Branch 1 in several start nodes (Sparks, Patch, Cross, Lev) is an echo branch requiring `cycle >= 2`. A cycle-1 tester selecting `1` gets `"You can't choose that option right now."` — this is **intended gate logic**, not a bug. The player needs to select a non-gated branch. The branches display a `(requires previous cycle history)` hint.

### Category 5: NPCs without placement (in NPCS but not in any room)

Not tested in this sweep. PT-DIALOGUE (static analysis) covers this. Focus here was runtime path only.

---

## Per-NPC Matrix (early zones)

| NPC ID | Room | Dialogue Tree | `getNPC()` resolves? | `talk` succeeds? | Notes |
|---|---|---|---|---|---|
| `food_vendor_marta` | `cr_03_market_south` | `cr_marta_intro` | **NO** | **FAIL** | SMOKING GUN |
| `marta_food_vendor` | (not in any room) | `cr_marta_intro` | YES | YES | Correct key, wrong room ref |
| `sparks_radio_repair` | `cr_05_market_north` | `cr_sparks_intro` | YES | YES | Works |
| `patch` | `cr_06_info_broker` | `cr_patch_main` | YES | YES | Works |
| `marshal_cross` | `cv_04_courthouse` | `cv_marshal_cross_intro` | YES | YES | Works |
| `crossroads_gate_guard` | `cr_01_approach` | none | YES | YES | Generic greeting |
| `checkpoint_arbiter` | `cr_02_gate` | none | YES | YES | Generic greeting |
| `weapons_vendor_cole` | `cr_04_market_center` | none | YES | YES | Trade/generic |
| `components_vendor` | `cr_04_market_center` | none | YES | YES | Generic |
| `map_seller_reno` | `cr_05_market_north` | none | YES | YES | Trade/generic |
| `lucid_sanguine_osei` | (covenant zone) | none | **NO** | **FAIL** | Removed as duplicate of `dr_ama_osei` |
| `covenant_wall_child` | (covenant zone) | none | **NO** | **FAIL** | No NPCS entry |
| `pens_scheduling_officer` | `the_pens` | none | **NO** | **FAIL** | Static `npcs[]` ref, no NPCS entry |

All other NPCs enumerated in the programmatic sweep (87 NPC-room pairs tested) produce no error on `talk`.

---

## Repro for Each Failure

### Failure 1: Marta (highest priority — this is the tester's bug)

```typescript
// Setup: player in cr_03_market_south, food_vendor_marta injected
await engine.executeAction({ verb: 'talk', noun: 'marta', raw: 'talk marta' })
// Output: { type: 'error', text: "That person has nothing to say." }
// activeDialogue: undefined

// Also reproduces with:
await engine.executeAction({ verb: 'talk', noun: 'to marta', raw: 'talk to marta' })
// Parser strips "to " → noun='marta' → same result
```

**Why**: `currentRoom.npcs` contains `'food_vendor_marta'`, `getNPC('food_vendor_marta')` returns `undefined`.

### Failure 2: lucid_sanguine_osei

```typescript
// Setup: player in room with lucid_sanguine_osei injected
await engine.executeAction({ verb: 'talk', noun: 'osei', raw: 'talk osei' })
// Output: { type: 'error', text: "That person has nothing to say." }
```

**Why**: `getNPC('lucid_sanguine_osei')` returns `undefined`. The NPCS comment says this was removed as duplicate of `dr_ama_osei`.

### Failure 3: covenant_wall_child

```typescript
// Setup: player in room with covenant_wall_child injected
await engine.executeAction({ verb: 'talk', noun: 'child', raw: 'talk child' })
// Output: { type: 'error', text: "That person has nothing to say." }
```

**Why**: No `covenant_wall_child` entry in NPCS.

### Failure 4: pens_scheduling_officer

```typescript
// Static npcs[] in the_pens room — always present, no spawn chance
// Setup: player in the_pens room
await engine.executeAction({ verb: 'talk', noun: 'officer', raw: 'talk officer' })
// Output: { type: 'error', text: "That person has nothing to say." }
```

**Why**: No `pens_scheduling_officer` entry in NPCS.

---

## Parser Behavior Summary

`talk to X` and `talk X` produce identical results. The preposition strip is at `lib/parser.ts:358`. Both aliases (`speak`, `ask`, `greet`) and the main verb all route to `verb:'talk'` with the preposition stripped. **Parser is not the problem.**

---

## Programmatic Sweep Results

- **Total NPC-room pairs tested**: ~250 (all NPCs in NPCS with room placement)
- **Broken (talk returns error)**: 4 NPC IDs
- **Working**: all others

The 4 broken IDs all share the same root cause: room data references an NPC ID that was deleted or never created in `data/npcs.ts`.

---

## Fix Recommendations (for follow-up Howler)

| Priority | File | Line | Fix |
|---|---|---|---|
| P0 | `data/rooms/crossroads.ts` | 269 | Change `npcId: 'food_vendor_marta'` → `npcId: 'marta_food_vendor'` |
| P1 | `data/rooms/covenant.ts` | (lucid_sanguine_osei spawn) | Change to `npcId: 'dr_ama_osei'` OR add `lucid_sanguine_osei` to NPCS |
| P2 | `data/rooms/covenant.ts` | (covenant_wall_child spawn) | Add `covenant_wall_child` NPC to NPCS (child NPC, minimal data needed) |
| P2 | `data/rooms/the_pens.ts` | static `npcs[]` | Add `pens_scheduling_officer` NPC to NPCS or remove from static array |
