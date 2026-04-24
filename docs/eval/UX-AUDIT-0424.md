# The Remnant — UX & Playability Audit

_Date: 2026-04-24_
_Inputs: 5 parallel read-only Explore agents (E1 verb pipeline / E2 phase-state / E3 walkthrough / E4 help & discoverability / E5 save & restart)_

## Thesis

The game's **core systems all work** — 47 verbs parse and dispatch correctly, save/load is solid, the world is reachable. The problem is **discoverability and onboarding**: the engine assumes MUD literacy. New players hit a wall in the first 30 minutes because affordances aren't surfaced, contextual hints exist as dead code, and several commands fail silently in the wrong phases.

Five-line summary of what users hit:

1. `restart` is silently swallowed in 4 of 7 game phases (prologue / creating / ending / load-error)
2. `CONFIRM RESTART` typed alone, without first typing `restart`, instantly wipes the save with no guard
3. Ending phase is a hard stuck state — only `BEGIN` accepted, anything else loops the prompt forever
4. `handleTutorialHint` exists with 6 fully-authored contextual hints — **none of them ever fire**
5. Stat allocation, dialogue numbering (1–9), keyword examination, narrative keys, called shots, companions — all undocumented

## Critical bugs (real broken things)

| # | Bug | File:line | Impact |
|---|---|---|---|
| 1 | `restart` swallowed in prologue / creating / ending / load-error phases | `app/page.tsx:281,305,398,266` | Player reports it "doesn't work" |
| 2 | `CONFIRM RESTART` is unguarded — typing it without prior `restart` wipes immediately | `app/page.tsx:237` | Single keystroke can nuke a save |
| 3 | Ending phase only accepts `BEGIN`; typo or `RESTART` loops forever | `app/page.tsx:398–434` | Hard stuck state, requires page refresh |
| 4 | Ending-phase wipe (`BEGIN`) is silent — no warning before delete | `app/page.tsx:400–425` | Inconsistent with main RESTART flow |
| 5 | `handleTutorialHint` is dead code — 6 contextual hints never fire | `lib/actions/system.ts:404–415` | Authored content lost |
| 6 | Mid-dialogue refresh drops conversation state silently | `types/game.ts:738–742` (memory-only) | Player resumes elsewhere with no notice |
| 7 | Mid-combat refresh drops combat state silently | `gameEngine.ts:199,904` (memory-only) | Same — no resume context |

## High-impact UX gaps

| # | Gap | Source | Fix size |
|---|---|---|---|
| 8 | Stat allocation has no tooltips — what does Vigor do? | E3 | small (10 lines) |
| 9 | First combat: typing `attack` (no target) errors with no help | E3 | small (rewrite error msg) |
| 10 | Echo-stats concept never explained on death/rebirth | E3 | small (5 lines on death msg) |
| 11 | Dialogue choices use 1–9 — never taught | E4 | small (1 line in dialogue render) |
| 12 | Keyword examination undocumented (rooms have 4–10 keywords each) | E4 | small (1 hint on room enter) |
| 13 | Skill-gated exits silently fail with no skill name | E3 | small (improve gate-fail message) |
| 14 | Prologue exit prompt buried at end of ~850 words | E3 | trivial (color-highlight prompt) |
| 15 | Phase-blocked verbs (`go north` in prologue) silently swallowed | E1, E2 | small (per-phase msg) |
| 16 | Narrative keys (a major progression system) have zero in-game visibility | E4 | small (add to journal output) |
| 17 | Companion adoption (Dog) never advertised | E4 | trivial (NPC hint) |

## Documentation drift

9 verbs are fully implemented but missing from the README Commands table or in-game `help`:

`stash` · `craft` · `give` · `unlock` · `climb` · `swim` · `sneak` · `smell` · `listen` · `touch` · `hint`

(README also doesn't mention called shots in combat or class abilities.)

## Save/restart audit details

E5 confirmed save/load is **solid**: manual save is transparent, load is fast (incl. cycle-2+ inherited rep), cross-device works through Supabase, auth-retry already in place from Phase 4b. Issues are concentrated in the **restart flow's lack of guards**:

- `CONFIRM RESTART` should require recent `restart` warning (#2 above)
- Ending-phase wipe should match the RESTART flow's warning ceremony (#4)
- After successful wipe, player gets a page reload with no "Save deleted — starting fresh" intermediate message
- `RESET` alias is documented neither in `help` nor in death-phase prompt
- Two browser tabs to the same account = last-save-wins, no conflict detection

## Phased fix plan

Mirroring the narrative plan structure — each phase shippable independently, in order of impact:

### Phase A — Restart flow safety (bugs #1, #2, #3, #4)
- Guard `CONFIRM RESTART` with a `restartWarningShown` flag set by `handleRestart`
- Route `restart` in prologue/creating/ending/load-error phases (don't swallow)
- Add `SKIP/QUIT/EXIT` escape to ending phase
- Make ending-phase BEGIN show the same warning ceremony as RESTART
- Add `RESET` alias to all relevant feedback messages
- ~30–50 lines, mostly in `app/page.tsx`

### Phase B — Tutorial activation (bug #5 + UX #11, #12)
- Wire `handleTutorialHint` calls into 6 trigger points: first room, first item, first weapon, first enemy, first NPC, first death
- Add a "Type X to continue / try `look [keyword]`" hint when entering a room with extras
- Show dialogue choice numbers inline ("[1] Yes [2] Ask about…") in dialogue render
- ~40 lines split between movement.ts, combat.ts, social.ts, examine.ts

### Phase C — First-time player polish (UX #8, #9, #10, #13, #14, #15)
- Add inline stat tooltips during creation (one-line per stat)
- Improve `attack` no-target error: list visible enemies
- Append echo-stats explainer to first death message
- Improve skill-gated exit failure: name the skill + how to improve
- Color-highlight the prologue's "Type SKIP" prompt
- Per-phase friendly errors for verbs in wrong phase ("You can't move while creating a character — finish character creation first")
- ~80 lines across system.ts, examine.ts, movement.ts, terminalDeath.ts, page.tsx

### Phase D — Discoverability + docs (UX #16, #17 + drift)
- Update README Commands table with the 11 missing verbs
- Add "Knowledge keys: X/Y discovered" line to journal output
- NPC hint when player encounters the_dog ("This stray watches you. You could try giving it food.")
- Update in-game `help` to match README
- ~50 lines mostly content

### Phase E — Refresh resilience (bugs #6, #7)
- Persist `activeDialogue` to a new column on `players` table
- Persist `combatState` similarly OR explicitly tell the player on reload that combat was reset
- Add a brief "Last saved: X minutes ago" indicator
- ~100 lines + 1 small migration

## Recommendation

**Phase A + Phase B together as the first ship** — those address the actual bugs the user reported and the dead-code tutorial hints. Both are small, mostly localized to one file, low-risk. About an hour of work.

**Phase C right after** — the new-player onboarding fixes. Higher line count but each individual change is simple. About 2 hours.

**Phase D + E** — bigger and need design decisions (how should narrative keys surface? do we want migration risk for dialogue persistence?). Worth their own session.

## Appendix — full per-agent reports

Preserved in `docs/eval/UX-AUDIT-0424-reports/` if needed for reference. Not committed here to keep scope tight; raw output remains in conversation.
