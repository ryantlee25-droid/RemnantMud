# PLAN: Harness Engineering Score — 3.8 → 4.5+

**Date**: 2026-03-31
**Status**: Ready for spectrum execution
**Goal**: Push The Remnant MUD from 3.8/5 to 4.5+/5 on the harness engineering maturity scorecard
**Source review**: `evaluation/harness-review/HARNESS-REVIEW-V2.md`

---

## Context

The v2 harness review (2026-04-01) scored the project at 3.8/5 (Tier 3 — Systematic). The remaining gaps are:

| Dimension | Current | Gap |
|-----------|---------|-----|
| Architectural Constraints | 3/5 | No pre-commit hooks; CI is the only enforcement gate |
| Architectural Constraints | 3/5 | Coverage thresholds (25/18/24/26) are far below actuals (65/54/68/68) — 40% regression would still pass CI |
| Entropy Management | 3/5 | Schema drift detection relies on humans reading LESSONS.md, not automated scripts |
| Agent Ergonomics | 4/5 | No project-level slash commands for common workflows |
| Access Control | (✗) | No CODEOWNERS file; no branch protection documentation |

All five gaps are independent — no shared files, no integration seams. Reaping mode is appropriate.

---

## Howler Decomposition

### H1 — Pre-commit Hooks

**Goal**: Install husky and add a pre-commit hook that runs `tsc --noEmit` and `vitest run`.

**Scope**:
- Install husky via `pnpm dlx husky init`
- Configure `.husky/pre-commit` to run type check then tests
- Update `package.json` with `prepare` script and `husky` devDependency
- Verify hook fires on a test commit (dry-run or manual check)

**Creates**:
- `.husky/pre-commit` (new)

**Modifies**:
- `package.json` — add `prepare` script + `husky` devDependency

**Effort**: S (30 min)
**Serial risk**: No

**Acceptance criteria**:
- `.husky/pre-commit` exists and is executable
- `pnpm prepare` installs the hook without error
- Hook script contains `tsc --noEmit` and `vitest run`
- `package.json` has `"prepare": "husky"` in scripts

---

### H2 — Raise Coverage Thresholds

**Goal**: Raise vitest coverage thresholds from (25/18/24/26) to (60/50/64/64) — still below actuals but prevents meaningful regression.

**Scope**:
- Edit `vitest.config.ts` thresholds block only
- Verify `pnpm test:coverage` still passes with new thresholds

**Modifies**:
- `vitest.config.ts` — update four threshold values

**Effort**: S (5 min)
**Serial risk**: No

**Acceptance criteria**:
- `vitest.config.ts` thresholds read: `statements: 60, branches: 50, functions: 64, lines: 64`
- `pnpm test:coverage` exits 0 with the new thresholds

---

### H3 — Consistency Validation Script + CI Integration

**Goal**: A Node.js/TypeScript script that catches schema drift and structural inconsistencies automatically. Run in CI.

**Checks the script must perform**:
1. **Save field → migration column check**: Parse `_savePlayer()` in `lib/gameEngine.ts` to extract all fields sent to Supabase. Cross-reference against `supabase/migrations/*.sql` to confirm every field has a matching column. Fail with a list of missing columns.
2. **Room exit validity check**: Load all room files from `data/rooms/index.ts`. For every room's `exits` object, verify each target room ID exists in the full room set. Fail with a list of dangling exits.
3. **NPC topic key check**: Load `data/npcs.ts` and `data/dialogueTrees.ts`. For every NPC's `topics` array, verify each topic key resolves to a node in the dialogue tree (or has a documented alias). Fail with a list of unresolved topic keys.

**Implementation notes**:
- Write as `scripts/validate-consistency.ts`
- Use `tsx` to run it (already available via ts execution chain, or install as devDependency)
- Import data files directly — they are plain TypeScript exports, no DB needed
- For migration parsing: read SQL files as text, look for `ADD COLUMN` or column definitions matching field names. Simple string matching is sufficient — no SQL parser needed.
- For `_savePlayer()` field extraction: read `gameEngine.ts` as text, find the save payload object, extract keys via regex. Focus on the literal object passed to `.upsert()`.
- Exit 0 on clean, exit 1 with a human-readable error list on failure

**Creates**:
- `scripts/validate-consistency.ts` (new)

**Modifies**:
- `package.json` — add `"validate": "tsx scripts/validate-consistency.ts"` script; add `tsx` to devDependencies if not present
- `.github/workflows/ci.yml` — add a `Validate consistency` step after type check, before tests: `pnpm run validate`

**Effort**: L (2-3 hours)
**Serial risk**: No

**Acceptance criteria**:
- `pnpm run validate` exits 0 against current codebase
- Script output lists which checks passed
- CI workflow includes the validate step
- If a fake dangling exit is introduced, `pnpm run validate` exits 1 and names the offending room

---

### H4 — Project-Level Slash Commands

**Goal**: Add `.claude/commands/` with common project workflows so agents (and the human) can invoke them by name without typing full command sequences.

**Commands to create**:

| Command | File | What it does |
|---------|------|--------------|
| `/test` | `.claude/commands/test.md` | Run `pnpm test` and report failures |
| `/coverage` | `.claude/commands/coverage.md` | Run `pnpm test:coverage`, surface uncovered files |
| `/typecheck` | `.claude/commands/typecheck.md` | Run `pnpm exec tsc --noEmit`, report type errors |
| `/validate` | `.claude/commands/validate.md` | Run `pnpm run validate` (consistency script), explain any failures |
| `/audit` | `.claude/commands/audit.md` | Run typecheck + test + validate + build in sequence; summarize pass/fail |
| `/deploy-check` | `.claude/commands/deploy-check.md` | Confirm env vars set in Vercel, run build, check for `NEXT_PUBLIC_DEV_MODE=false` in prod config |
| `/save-field` | `.claude/commands/save-field.md` | Guided checklist for adding a new field to `_savePlayer()`: migration → code → test → validate |

**Creates**:
- `.claude/commands/test.md`
- `.claude/commands/coverage.md`
- `.claude/commands/typecheck.md`
- `.claude/commands/validate.md`
- `.claude/commands/audit.md`
- `.claude/commands/deploy-check.md`
- `.claude/commands/save-field.md`

**Modifies**: nothing

**Effort**: S (45 min)
**Serial risk**: No

**Acceptance criteria**:
- All 7 files exist under `.claude/commands/`
- Each file contains: a one-line description, the exact shell command(s) to run, and instructions for interpreting output
- `/save-field` references Critical Rule #1 from `CLAUDE.md` and lists the migration step first
- `/audit` runs all checks in sequence and produces a single pass/fail summary

---

### H5 — CODEOWNERS + Branch Protection Docs

**Goal**: Add `CODEOWNERS` to document ownership (even for solo) and a brief branch protection note so the project signals production-grade access control hygiene.

**Scope**:
- Create `.github/CODEOWNERS` with `@ryan` as owner of all paths
- Add a `## Branch Protection` section to `CLAUDE.md` documenting the intended protection rules (even if not yet enforced by GitHub): require PR reviews, require CI to pass, no force pushes to `main`

**Creates**:
- `.github/CODEOWNERS` (new)

**Modifies**:
- `CLAUDE.md` — append `## Branch Protection` section at the end

**Effort**: S (15 min)
**Serial risk**: No

**Acceptance criteria**:
- `.github/CODEOWNERS` exists with `* @ryan` and zone-level entries for key directories
- `CLAUDE.md` contains a `## Branch Protection` section listing the three protection rules

---

## File Ownership Matrix

| File | Howler |
|------|--------|
| `.husky/pre-commit` | H1 |
| `package.json` | H1, H3 — **CONFLICT: must coordinate** |
| `vitest.config.ts` | H2 |
| `scripts/validate-consistency.ts` | H3 |
| `.github/workflows/ci.yml` | H3 |
| `.claude/commands/test.md` | H4 |
| `.claude/commands/coverage.md` | H4 |
| `.claude/commands/typecheck.md` | H4 |
| `.claude/commands/validate.md` | H4 |
| `.claude/commands/audit.md` | H4 |
| `.claude/commands/deploy-check.md` | H4 |
| `.claude/commands/save-field.md` | H4 |
| `.github/CODEOWNERS` | H5 |
| `CLAUDE.md` | H5 |

**CONFLICT RESOLUTION — `package.json`**: Both H1 (husky) and H3 (validate script + tsx) modify `package.json`. Resolution: assign `package.json` solely to **H3**. H3 adds both the `validate` script and the husky `prepare` script and both devDependencies in a single edit. H1 reads the final state but does not modify `package.json` — H1's sole file ownership is `.husky/pre-commit`. H3 must run after H1 confirms the husky setup works, OR H3 adds the husky prepare script speculatively and H1 verifies it. Since all Howlers are parallel (no interface deps), H3 will add the `prepare` + `husky` entry to `package.json` and H1 will create only the hook file.

**Revised ownership after conflict resolution**:

| File | Howler |
|------|--------|
| `.husky/pre-commit` | H1 ONLY |
| `package.json` | H3 ONLY (adds husky + tsx devDeps + prepare + validate scripts) |
| `vitest.config.ts` | H2 ONLY |
| `scripts/validate-consistency.ts` | H3 ONLY |
| `.github/workflows/ci.yml` | H3 ONLY |
| `.claude/commands/*.md` (7 files) | H4 ONLY |
| `.github/CODEOWNERS` | H5 ONLY |
| `CLAUDE.md` | H5 ONLY |

---

## DAG

All five Howlers are independent (no shared owned files after conflict resolution). Run in parallel.

```
H1 ──┐
H2 ──┤
H3 ──┼── [all complete] → White + Gray + merge
H4 ──┤
H5 ──┘
```

---

## Expected Score Impact

| Dimension | Before | After | Driver |
|-----------|--------|-------|--------|
| Architectural Constraints | 3/5 | 4/5 | H1 (pre-commit) + H2 (threshold raise) |
| Entropy Management | 3/5 | 4/5 | H3 (consistency validation script) |
| Agent Ergonomics | 4/5 | 4.5/5 | H4 (slash commands) |
| Access Control signal | ✗ | partial ✓ | H5 (CODEOWNERS) |
| **Overall** | **3.8/5** | **4.5+/5** | |

---

## Spectrum Mode

**Reaping mode** — 5 Howlers, all pure-create or single-file-modify, no shared interfaces at drop time.

Skips: ARCHITECTURE.md full regeneration, per-Howler DbC, ENTITIES.md update.
Keeps: White + Gray per Howler, HOOK.md per Howler, LESSONS.md after merge.
