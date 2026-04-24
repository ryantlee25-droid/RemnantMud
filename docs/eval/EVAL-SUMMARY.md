# The Remnant — Full-Spectrum Evaluation Summary

_Date: 2026-04-24_
_Baseline: `main @ d5e5607` (1,120 tests passing, typecheck clean)_
_Eval suite: `pnpm test:eval` — 5 files, 400 cases, 33 documented failures on current data._

## TL;DR

**The map is worse than thought. The story spine holds, but with one real blocker and several narrative gates that don't actually gate.**

- ~33% of rooms (87 of 268) are unreachable from the starting room. Three zones — **Salt Creek, Duskhollow, The Pens** — have no inbound graph edge at all.
- One main-arc blocker: the Scar's east door (`scar_02_main_entrance`) accepts only the keycard, silently invalidating two of the four advertised entry routes.
- Dialogue has one critical orphan (Echo's cycle-2 recognition scene is unreachable) plus smart-quote contamination across 17+ trees.
- No faction can hard-lock a player out of the main arc (verified).
- 6 of 7 narrative pillars are wired; Narrative Keys exists as 578 lines of library code with zero call sites from gameplay.
- Combat runs clean on a 1,680-fight matrix, but 5 of 7 classes are combat-indistinguishable (all non-vigor classes resolve identically).

---

## Scope & method

Evaluated across six dimensions, each as an isolated Howler in a worktree, each producing a report + a diagnostic test suite. Tests live in `tests/eval/` and are excluded from the default `pnpm test` — they document current bad state rather than regress CI. Run on demand with `pnpm test:eval`.

A methodology note: all 6 Howler worktrees initially forked from `169f231` (pre-staging). Their tests were re-run against current main (`d5e5607`) before being accepted. Findings below reflect current-main reality, not stale worktree state.

Deferred: Howler G (crafting reachability) and Howler H (parser + save/load round-trip) were part of the original plan. They remain as a follow-up; Batch 1 already answers the user's "map works, story coheres" question.

---

## Findings by track

### A — Map Graph Integrity — **CRITICAL**

Source: `docs/eval/map-report.md.HOWLER`, `tests/eval/mapIntegrity.test.ts` (7 failing assertions).

| Finding | Count | Severity |
|---|---|---|
| Unreachable rooms from start (BFS over exits + richExits) | **87 of 268** | blocker |
| Fully-orphaned zones (no inbound edges from reachable set) | **3** — `salt_creek`, `duskhollow`, `the_pens` | blocker |
| Bidirectionality violations (A→B without B→A) | 83 | major |
| Simple↔richExits destination mismatch | 1 (`rr_20_abandoned_motel`) | major |
| Undefined `questGate` flag (`vesper_trust_level_3` — referenced, never set) | 1 | major |
| Missing `lockedBy` items (keys that don't exist in `data/items.ts`) | 5 — `courthouse_archive_key` (×2), `cold_storage_key`, `red_court_key` (×2) | major |
| Zone-count drift vs research baseline | 6 zones lost rooms | minor |
| README room count (271) vs actual (268) vs Howler research (297 at old main) | — | cosmetic |

The 3 fully-orphaned zones represent entire chunks of hand-crafted narrative content that a normal player can never reach. This is likely a connectivity regression from the staging merge (room count dropped 297 → 268 across the 83-commit ship).

**Renderer drift**: `lib/mapRenderer.ts` reads only `room.exits`, ignoring `richExits` gates — hidden/locked/quest-gated exits render as normal edges on the in-game map. The sibling POC at `/Users/ryan/projects/remnant-poc/lib/mapLayout.ts` has a reverse-edge index that correctly handles one-way corridors. Recommend folding that into main as part of the fix for (1).

### B — Ending Reachability — **1 BLOCKER**

Source: `docs/eval/endings-report.md.HOWLER`, `tests/eval/endingReachability.test.ts` (212 cases, all passing — this test suite validates reachability of correct states, not breakage).

- **BUG-01 (blocker, verified on current main)**: `scar_02_main_entrance` east exit is `locked: true, lockedBy: 'meridian_keycard'`. The room's description and `extras` advertise four routes (keycard, biometric, tunnel, utility) with four different `questGate` flags — but the only programmatic unlock is the keycard. A player who holds `sanguine_biometric_obtained` or `kindling_tunnel_access` and no keycard cannot pass this door. The utility route bypasses scar_02 entirely via `dp_12_sealed_door` → `scar_03_decontamination`, so it still works. **Two of four advertised Scar-entry routes are non-functional in play.**
- **Design-note (not bug)**: all 4 endings are unconditionally interactable at `scar_14_the_core` once cycle ≥ 3 is satisfied. Lore DC 4 checks are flavor; `questFlagOnSuccess` fires regardless of roll. User classified stumble-in as intentional — noted.
- **Design gap, minor**: cycle echoes (faction rep, NPC relationships, death rooms captured by `createCycleSnapshot`) do not feed back into ending flavor. Every player sees identical terminal text regardless of how they got there.

### C — Dialogue Tree Health — **1 CRITICAL + systemic polish**

Source: `docs/eval/dialogue-report.md`, `tests/eval/dialogueHealth.test.ts` (26 failing assertions on current main).

- **CRITICAL**: `echo_tree` references `targetNode: 'echo_recognition'` gated by `requiresCycleMin: 2`, but no node with that id exists. The cycle-2 Echo recognition scene — the emotional core of the Echo arc per the narrative bible — is unreachable for every player.
- **HIGH**: unreachable payoff nodes in `cr_sparks_signal_quest` (`sparks_quest_booster_return`, `sparks_quest_final`) — the vindication scene cannot be navigated to via any branch. Needs either a stub entry or engine-level routing on item return.
- **HIGH (new, found on current main)**: `cv_marshal_cross_intro` also has unreachable nodes.
- **HIGH systemic**: smart/curly Unicode quotes (`'`, `'`, `"`, `"`) in at least 17 of 21 dialogue trees. LESSONS predicted this exact class of bug (treats `'` as string terminator); a one-pass automated replacement fixes it.
- **MEDIUM**: `faction_representatives` referenced as an NPC but missing from `data/npcs.ts`.
- **LOW**: 6 named NPCs without dialogue trees (flag-only, not necessarily a gap if they speak via extras).

### D — Faction Lockout — **CLEAN (no hard-lockout possible)**

Source: `docs/eval/faction-report.md.HOWLER`, `tests/eval/factionLockout.test.ts` (136 cases, all passing).

- Verdict: **a full hard-lockout of the main arc is not possible on current main.** The Reclaimers keycard path (`lev_keycard_gate`) has no rep gate — only quest flags + skill checks, so a Reclaimers-hostile player can still obtain it.
- The biometric/tunnel/utility routes expose their entry via `requiresFlag` OR `requiresRep` — rep gates are convenience shortcuts, not hard locks.
- Active spiral lock is theoretically possible (-2 → inherit -1 → take another hit → stuck) but passive play breaks out: no inheritance fires when rep is above the -2 antagonization threshold, so rep drifts back to 0 naturally.
- **Note**: this clean verdict is invalidated if BUG-01 (A's finding) isn't fixed. With only keycard + utility routes working in code, Reclaimers hostility doesn't lock (keycard still obtainable via skill) but the rationale for the other routes existing becomes moot.

### E — Seven Narrative Pillars — **1 MAJOR GAP**

Source: `docs/eval/pillars-audit.md.HOWLER`.

| Pillar | File | Dispatch in gameEngine | Tests | Verdict |
|---|---|---|---|---|
| World Events | `lib/worldEvents.ts` | `_runNarrativePipeline` §a | yes | ✅ |
| Hollow Pressure | `lib/hollowPressure.ts` | `_runNarrativePipeline` §b | yes | ✅ |
| Companions | `lib/companionSystem.ts` | `_runNarrativePipeline` §c | yes | ✅ |
| Consequences (Faction Web) | `lib/factionWeb.ts` | `adjustReputation` → `_applyFactionRipple` | yes | ✅ |
| **Narrative Keys** | `lib/narrativeKeys.ts` (578 lines) | **none** | only self-tests | ⚠️ **partial** |
| Player Monologue | `lib/playerMonologue.ts` | `_runNarrativePipeline` §d (mutex with narrator) | yes | ✅ |
| Narrator Voice | `lib/narratorVoice.ts` | `_runNarrativePipeline` §d (mutex with monologue) | yes | ✅ |

The Narrative Keys module is real code — `learnKey()`, `checkNarrativeGate()`, `checkNarrativeUnlock()` all exist and are unit-tested. But a git grep finds **zero call sites** from any action handler (`examine.ts`, `social.ts`, `movement.ts`) or `gameEngine.ts`. The player can never acquire or spend a narrative key in gameplay. Either wire it or remove it — carrying 578 lines of unreferenced library code is a tax.

**Correction to prior memory**: the `remnant-narrative-0329` convoy was recorded as COMPLETE with all 7 pillars. That's 6 of 7 accurate — Narrative Keys was shipped but not integrated.

### F — Combat Balance — **CLEAN SYSTEM, POLICY QUESTIONS**

Source: `docs/eval/combat-report.md`, `tests/eval/combatMatrix.test.ts` (4 cases, all passing over 1,680 seeded fights).

- Zero crashes, zero non-terminating fights. Seeded RNG shim (`lib/testing/seededRng.ts`) lands cleanly and is test-only.
- **Design question (not bug)**: Scout, Wraith, Shepherd, Reclaimer, and Broker all produce identical win rates at every level — the matrix cannot distinguish them because combat is purely vigor-gated. At level 9 with tier-5 gear, these five classes cap at 45.8% aggregate vs 100% for Enforcer/Warden. Is this intended (non-fighters are meant to flee/skill-out)? If so, the matrix is the wrong tool and the balance question moves to "are non-fighter routes around combat actually available?" If not, classes need differentiated combat mechanics.
- **Tuning flags**: Hive Mother is a 0% wall for non-fighters at every level (HP 50, atk 5, dmg 5–10) — intentional boss or over-tuned? Elder Sanguine Deep caps Enforcer/Warden at 33.3% across levels — appropriately punishing for late-game if zone-gated.

---

## Severity-ranked fix backlog

### Blockers (ship-preventing)

1. **Reconnect 3 orphaned zones** (Salt Creek, Duskhollow, The Pens) and 87 total unreachable rooms. Likely means adding missing exits on border rooms that were dropped/renamed in the staging merge. Start by running `pnpm test:eval` and reading the `mapIntegrity.test.ts` output — the full orphan list is printed.
2. **Fix BUG-01**: add `lockedBy` entries or `questGate` logic to `scar_02_main_entrance` east exit so that `sanguine_biometric_obtained` and `kindling_tunnel_access` also unlock, OR introduce separate entry rooms per route. The current structure has narrative for 4 routes and code for 1.
3. **Echo `echo_recognition` node missing**. Either add the node to `echo_tree` (what was intended) or remove the `targetNode` reference.

### Major

4. **Dialogue smart-quote sweep** across all 17+ affected trees in `data/dialogueTrees.ts`. A single `sed` or find-and-replace pass with `['']` → `'` and `[""]` → `"` fixes it. Confirm with `pnpm test:eval`.
5. **Sparks quest payoff nodes** — `sparks_quest_booster_return` and `sparks_quest_final` need either a branch pointing to them or explicit engine routing on item return.
6. **Narrative Keys integration** — pick: wire `learnKey()` into `examine.ts` / `social.ts` as intended per the convoy PLAN, OR delete `lib/narrativeKeys.ts` and the associated data if out of scope.
7. **Bidirectionality** — 83 one-way violations. For each, categorize as intentional (elevator, drop-down, death trap) or accidental; add `ONE_WAY_ALLOWLIST` entries or reciprocal exits as appropriate.
8. **Undefined `vesper_trust_level_3`** — either set it somewhere in Vesper's dialogue tree, or remove the gate in `dh_04_vespers_study`.
9. **Missing lockedBy items** — 5 keys referenced but not defined in `data/items.ts`. Add items or remove locks.
10. **Destination mismatch** in `rr_20_abandoned_motel` simple vs richExits.

### Minor / Design

11. **Map renderer truthfulness** — consider merging POC's `mapLayout.ts` (reverse-edge index + gate awareness) into main.
12. **Zone-count reconciliation** — 6 zones lost rooms. Confirm intentional, update README (271 → 268).
13. **Echo → ending flavor** — no variance by cycle history. Add `descriptionPool` or `conditionalDescription` if the cycle arc should matter.
14. **Class combat differentiation** — product decision: should 5 non-vigor classes share identical combat curves, or need unique mechanics?

### Out of scope for this eval

- Crafting reachability (G) — recipe ingredient audit, vendor economics
- Parser coverage + save/load round-trip (H) — verb-to-handler audit, state-shape persistence tests
- Stumble-in endings — user-classified as design
- Probabilistic NPC spawns — user-classified as dice roll

---

## Methodology notes & incident log

1. **Worktree-base staleness.** Agent tool `isolation: worktree` forks from the dispatching context's current commit. My session's primary working directory was a stale worktree at `169f231`, so all 6 Howler worktrees forked from the pre-staging main — not the current `d5e5607`. Detected when Howler E cross-checked and found the 7 pillars "absent from worktree but fully present in main." Recovery: copied Howler test files into real main and re-ran them against current data. All findings above are verified on `d5e5607`.

2. **Pre-commit hook tension.** The repo's pre-commit hook runs `npx vitest run` on every commit. Eval tests that document bugs naturally fail — that would block every commit. Resolution: moved eval tests to `tests/eval/`, excluded from the default `test`, `test:ci`, `test:coverage`, `test:watch`, and `test:ui` scripts, and added `pnpm test:eval` for on-demand runs.

3. **Memory reconciliation.** Prior project memory `plan_remnant_narrative_0329` listed the convoy as COMPLETE. That's 6 of 7 accurate — Narrative Keys was shipped as library code but never integrated. Memory should be updated.

---

## Artifacts

- `docs/eval/EVAL-SUMMARY.md` — this document
- `docs/eval/map-report.md.HOWLER` — Howler A full report (findings against stale baseline; numbers above verified on current main)
- `docs/eval/endings-report.md.HOWLER` — Howler B
- `docs/eval/dialogue-report.md` — Howler C (written directly to main)
- `docs/eval/faction-report.md.HOWLER` — Howler D
- `docs/eval/pillars-audit.md.HOWLER` — Howler E (checked current main)
- `docs/eval/combat-report.md` — Howler F (written directly to main)
- `tests/eval/mapIntegrity.test.ts`
- `tests/eval/endingReachability.test.ts`
- `tests/eval/dialogueHealth.test.ts`
- `tests/eval/factionLockout.test.ts`
- `tests/eval/combatMatrix.test.ts`
- `lib/testing/seededRng.ts` — test-only deterministic PRNG (mulberry32)
