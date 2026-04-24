# Test Harness Analysis Report

**Project**: The Remnant MUD  
**Date**: 2026-03-31  
**Analyst**: Opus-level test engineer  
**Suite**: 417 tests | 3.13s | Vitest + jsdom  
**Coverage**: 26.57% statements | 20.64% branches | 26.03% functions | 28.05% lines

---

## 1. Coverage Assessment

### What's Covered Well (and Why)

| File | Stmts | Why It's High |
|------|-------|---------------|
| dice.ts | 100% | Pure math, zero dependencies, deterministic when mocking Math.random |
| spawn.ts | 95.38% | Pure logic with injected randomness, no DB/IO |
| hollowPressure.ts | 100% | Standalone numeric calculations |
| conditions.ts | 80.7% | Status effect logic, self-contained state machines |
| fear.ts | 85% | Pure computation with simple inputs |
| traits.ts | 78.57% | Data-driven lookup logic |
| All room data | 100% | Static data structures validated by worldGen.test.ts BFS invariants |
| All world events | 96-100% | Pure event trigger logic |

**Pattern**: Every well-covered file is a pure function module with no database access, no async I/O, and no coupling to the game engine. This is the right code to cover first, but it represents the easy wins, not the risky paths.

### What's Dangerously Uncovered

| File | Stmts | Risk Level | What's Missing |
|------|-------|------------|----------------|
| gameEngine.ts | 4.95% | **CRITICAL** | The entire command dispatch loop, save/load, initialization, state transitions |
| world.ts | 0% | **CRITICAL** | Room loading, room state persistence, world mutation |
| stealth.ts | 0% | **HIGH** | Entire stealth system untested |
| crafting.ts | 14.28% | **HIGH** | Recipe resolution, material consumption, output generation |
| travel.ts | 2.12% | **HIGH** | Zone transitions, fast travel, travel events |
| narrativeKeys.ts | 0% | **HIGH** | Narrative trigger system completely blind |
| terminalDeath.ts | 0% | **HIGH** | Permadeath conditions, save deletion |
| terminalCreation.ts | 0% | **HIGH** | Character creation flow |
| inventory.ts | 16.34% | **HIGH** | Stash operations, weight limits, stack logic |
| movement.ts | 21.9% | **MEDIUM** | Room transitions, exit validation, locked doors |
| combat.ts | 31.39% | **MEDIUM** | Real combat math (tests mock the combat module entirely) |
| items.ts (actions) | 27.48% | **MEDIUM** | Use effects, consumable logic, quest item interactions |

### Practical Risk of 26.57% Coverage

This is a **failing grade for a production game**. The coverage number is misleading because it's bimodal: pure math modules are 80-100% covered while the entire persistence and engine layer sits near 0%. In practice:

- **Save corruption** would go undetected. gameEngine.ts at 4.95% means save/load round-trips are untested.
- **State machine transitions** (alive -> combat -> dead -> between -> rebirth) have no integration test that exercises the real engine.
- **Any refactor to the engine** is flying blind. The 417 passing tests would stay green while the game breaks.
- **Regression risk is concentrated** in the exact code that changes most often (engine, movement, combat resolution).

A MUD lives or dies by state consistency. The most critical state management code has essentially zero test coverage.

---

## 2. Test Quality Assessment

### Unit Tests: Strong

The unit tests (dice.test.ts, parser.test.ts, spawn.test.ts) are **genuinely good**:

- **Boundary conditions**: Tests pin Math.random at 0 and 0.999 to verify edge behavior. dice.test.ts checks nat-1 fumbles, nat-10 criticals, and exact DC thresholds.
- **Statistical validation**: spawn.test.ts runs 1000 iterations to verify weighted_low biases toward min (mean < 4.5) and weighted_high biases toward max (mean > 6.5). This catches distribution bugs that single-run tests miss.
- **Error paths**: weightedRoll throws on empty pool. parseCommand handles empty strings, whitespace, and unknown commands.
- **Domain modeling**: Parser tests cover 60+ command synonyms across movement, combat, inventory, interaction, and system verbs. Multi-word forms ("pick up", "take off") are covered.
- **Invariant assertions**: worldGen.test.ts uses BFS to prove all rooms are reachable and all exits are bidirectional. This is structural verification, not just smoke testing.

**Verdict**: A-tier unit tests. They test meaningful behavior with proper edge cases.

### Integration Tests: Hollow

The integration tests have a fundamental problem: **they mock away the system under test**.

**combat.test.ts** mocks `@/lib/combat` (startCombat, playerAttack, enemyAttack, flee), then tests `handleAttack` from `@/lib/actions/combat`. What this actually tests:
- Does handleAttack call startCombat? (mock verification)
- Does handleAttack set combatState to null when the mock says the enemy died? (wiring test)
- Does handleAttack show an error when no enemies are present? (guard clause)

What it does NOT test:
- Whether playerAttack actually calculates damage correctly
- Whether conditions (bleeding, frightened) apply during combat
- Whether the enemy's defense stat matters
- Whether critical hits or fumbles produce correct state changes

**inventory.test.ts** has the same pattern: it mocks `@/lib/inventory` (addItem, removeItem, equipItem, unequipItem), then verifies the action handlers call those mocks correctly. The actual inventory logic (weight limits, stacking, slot conflicts) is never exercised.

**death-rebirth.test.ts** is the exception: it tests pure functions (createCycleSnapshot, computeInheritedReputation, echoRetentionFactor) directly without mocking. These are meaningful behavioral tests.

**combat-edge-cases.test.ts** demonstrates the mock problem at its worst: it re-implements mock behavior inline to test "ability used twice" -- effectively testing a hand-written stub, not the real ability system.

### Mock Infrastructure

The Supabase mock (`tests/mocks/supabase.ts`) is a **clever chainable proxy** that mimics the Supabase client's fluent API. It returns `{ data, error }` tuples via a Proxy `then` trap.

**Strengths**:
- Supports full method chaining (select, eq, filter, etc.)
- `_setFromResult` allows per-test overrides
- Clean vi.fn() wrapping for call verification

**Weaknesses**:
- **Every query returns the same data** regardless of table or filter. A test can't verify that `from('players').eq('id', 'p1')` returns different data than `from('rooms').eq('id', 'room_1')`.
- **No error simulation patterns**. The mock defaults to `{ data: null, error: null }`, but there are no helper functions for common failure modes (network timeout, constraint violation, auth expired).
- **No schema validation**. Inserts and updates accept any shape -- the mock won't catch a misspelled column name.

The mock is sufficient for verifying that code paths call Supabase, but insufficient for testing that they call it correctly.

---

## 3. Critical Untested Paths (Ranked by Risk)

| Rank | Path | Risk | Effort | Why It Matters |
|------|------|------|--------|----------------|
| 1 | **Save/load round-trip** (gameEngine save -> DB -> load -> state equality) | CRITICAL | Medium | Data loss corrupts player progress. Currently 0% tested. A single field omission in the save function silently destroys state. |
| 2 | **Character creation -> first room** (terminalCreation -> gameEngine.init -> room load) | CRITICAL | Medium | If this breaks, no new player can start the game. 0% coverage on both files. |
| 3 | **Death -> between -> rebirth cycle** (hp=0 -> death screen -> echo snapshot -> new cycle) | CRITICAL | High | The death cycle is the core game loop. Tests cover snapshot creation (pure functions) but NOT the state machine transitions through the engine. |
| 4 | **Real combat math** (attack rolls, defense, damage ranges, condition application) | HIGH | Low | Integration tests mock all combat math. If the damage formula changes, no test breaks. |
| 5 | **Movement between rooms** (exit validation, locked doors, zone transitions, room population) | HIGH | Low | movement.ts at 21.9% means most exit conditions are untested. A broken exit silently traps players. |
| 6 | **Stash operations** (deposit, withdraw, persistence, cross-death survival) | HIGH | Low | Stash is the only persistent cross-death storage. If it breaks, players lose their hoarded items. |
| 7 | **Crafting end-to-end** (recipe lookup, material check, material consumption, output creation) | HIGH | Medium | 14.28% coverage. Crafting failures that consume materials without producing output would go undetected. |
| 8 | **Stealth system** (sneak, hide, detection checks, stealth-modified encounters) | HIGH | Medium | 0% coverage on an entire game system. Any regression is invisible. |
| 9 | **Travel system** (zone-to-zone movement, travel events, time passage) | HIGH | Medium | 2.12% coverage. Travel events firing incorrectly or zone transitions corrupting state would be silent. |
| 10 | **Narrative key triggers** (narrativeKeys.ts at 0%) | MEDIUM | Low | Narrative keys gate story progression. If a key fails to set, players get stuck without knowing why. |

---

## 4. Recommendations

### Priority 1: Highest Risk x Lowest Effort

**Write these first (estimated: 8-10 new test files, ~40 tests)**:

1. **Save/load round-trip test**: Create a player state, serialize it through the real save path (with Supabase mock that captures the payload), then load it back and assert deep equality. This catches field omissions, serialization bugs, and type coercions. Estimated: 5-8 tests.

2. **Real combat math tests**: Stop mocking `@/lib/combat` in combat integration tests. Import the real module. Verify that a stat-7 player attacking a defense-8 enemy produces the correct hit probability. Pin Math.random to test criticals, fumbles, and condition application. Estimated: 10-15 tests.

3. **Movement integration tests**: Test `handleGo` with the real movement module. Verify locked door rejection, exit validation, room population on entry, and visited flag setting. Estimated: 6-8 tests.

4. **Narrative key trigger tests**: These are likely pure functions. Import and test directly, similar to how death-rebirth.test.ts tests echoes. Estimated: 5-8 tests.

5. **Stash operation tests**: Deposit, withdraw, deposit-when-full, withdraw-nonexistent. Estimated: 4-6 tests.

### Priority 2: Getting from 26% to 60%

The fastest path to 60% coverage targets the large, low-coverage files:

| Target | Current | Strategy | Estimated Tests |
|--------|---------|----------|----------------|
| gameEngine.ts | 4.95% | Test init, processCommand dispatch, save, load | 15-20 |
| combat.ts | 31.39% | Remove mocks, test real combat functions | 10-15 |
| movement.ts | 21.9% | Test handleGo with real module | 8-10 |
| items.ts | 27.48% | Test use effects, quest items | 8-10 |
| inventory.ts | 16.34% | Test weight limits, stacking, slot conflicts | 8-10 |
| crafting.ts | 14.28% | Test recipe system end-to-end | 6-8 |
| stealth.ts | 0% | Test detection checks, stealth modifiers | 6-8 |

**Total: ~65-80 new tests** to reach approximately 60% statement coverage. This is achievable in 2-3 focused sessions.

### Architecture Changes

1. **Split the Supabase mock into table-aware responses**. Create a `MockDB` class that stores per-table data and returns filtered results. This enables save/load round-trip testing without rewriting the production code.

2. **Stop mocking the module under test**. The combat integration tests should import real `@/lib/combat` and only mock external dependencies (DB, random). The current pattern tests wiring, not behavior.

3. **Add a `TestEngine` factory** that wires up the real gameEngine with a mock DB. The `makeEngine` helper in every test file recreates 40 lines of boilerplate. A shared factory reduces this to 1 line and ensures consistency.

4. **Consider a test fixtures directory** for canonical player states (fresh character, mid-game, near-death, post-rebirth). Multiple test files recreate these from scratch with slight variations.

---

## 5. Performance

### Speed

- **417 tests in 3.13s** = 7.5ms per test average. This is excellent.
- At this rate, even 1000 tests would complete in under 8 seconds. The suite is not a CI bottleneck.
- No evidence of slow tests in the current suite. The spawn.test.ts statistical tests (1000 iterations) are the heaviest and still complete in milliseconds.

### Bottleneck Analysis

- **Mock setup overhead**: Each integration test file re-declares `vi.mock()` for 3-5 modules with inline implementations. This is a maintenance burden but not a performance issue -- Vitest hoists mocks at compile time.
- **No async test bottlenecks**: All database operations are mocked to resolve immediately. There are no real network calls, file I/O, or timers.

### Environment

- **jsdom is appropriate** for the current test suite. The MUD has terminal-style UI rendering that may touch DOM APIs.
- **Pure logic tests** (dice, spawn, parser, echoes, fear) could run in `node` environment for marginal speedup, but the savings would be < 500ms total. Not worth the configuration complexity.
- If the suite grows past 1000 tests, consider splitting into `node` (pure logic) and `jsdom` (UI-touching) test pools via Vitest workspace configuration.

---

## 6. Overall Verdict

### Grade: D+

**Justification**:

The test harness has a strong foundation and a fatal blind spot.

**What earns points**:
- Unit test quality is A-tier. The dice, parser, spawn, and worldGen tests demonstrate deep understanding of boundary testing, statistical validation, and structural invariants.
- Test infrastructure (mock builder, helper factories, Vitest configuration) is clean and well-organized.
- 417 tests running in 3.13s is fast enough for tight CI feedback loops.
- 20 test files across unit and integration directories show disciplined file organization.

**What costs points**:
- **26.57% overall coverage is unacceptable for a production game**. The industry floor for shipped software is 60%; games with persistent state should target 70%+.
- **The engine layer is effectively untested**. gameEngine.ts (4.95%), world.ts (0%), and the entire terminal flow (0%) mean the most critical code paths have no safety net.
- **Integration tests are mostly mock-verification tests**, not behavioral tests. They prove wiring, not correctness. A combat formula bug, a save field omission, or a movement logic error would pass every current test.
- **Three entire game systems have 0% coverage**: stealth, narrative keys, and terminal flows. These are not edge features -- they are core game mechanics.
- **No save/load round-trip test exists**. For a game that persists to Supabase, this is the single most dangerous gap. Data corruption is silent until a player reports it.

### Is It Production-Ready?

**No.** The test suite protects math utilities and static data but provides almost no safety for the code that players actually interact with. A developer could break character creation, corrupt saves, or disable movement, and the test suite would report 417 passing tests.

The path forward is clear: stop mocking the modules under test, write save/load round-trip tests, and target 60% coverage by focusing on the large uncovered files listed above. The existing test quality proves the team knows how to write good tests -- the gap is in what they chose to test, not how they test it.
