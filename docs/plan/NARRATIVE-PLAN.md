# The Remnant — Narrative Enrichment Plan

_Date: 2026-04-24_
_Branch: `dev/eval-fixes-0424` (proposed; will fork `feat/narrative-intrigue` for execution)_
_Inputs: 4 research agents (narrative keys / Red Court arc / contradictions / companion). Full reports preserved at `docs/plan/research/` (to be written alongside execution)._

## Thesis

**The intrigue is what nobody says out loud.** Each faction has a self-mythology that's technically defensible and materially incomplete. The player reaches the Scar carrying a bag of half-truths handed to them by people who each thought they were being honest. The moment of insight is not "who lied?" — it's "what couldn't be spoken, and who paid for the silence?"

Three things the research converged on:

1. **The MERIDIAN bombing was theater.** Cross and Briggs both know. They've been silent for seven years — independently, for different reasons. Everything else (Sanguine design, Lucid origin, Hollow as acceptable casualty rate) radiates from this central coverup.
2. **Every observer has partial sight.** The Dog smells the Revenant's infection. Lev sees the player as a data point. Vesper preserves her ethics by not investigating her own design. Rook runs three sides. The player is told fragments, and has to assemble the shape.
3. **Cycles are the slow reveal.** What the Dog knows on Cycle 1 and what Lev admits on Cycle 3 are different because the player has earned the right to hear. Cycle-aware dialogue is the mechanism; narrative keys are the currency.

This plan organizes 4 domains of content work into 5 shippable phases. Each phase stands alone: if you want to stop after phase 2 or merge phase 3 first and ship phases 1/4/5 later, nothing breaks.

---

## Load-bearing spine

**Work every phase against this question:** *when the player reaches `scar_14_the_core`, what do they believe they know, and which NPCs helped or hindered that knowledge?*

The central mystery: **the bombing was theater, calibrated to preserve MERIDIAN's deep levels; the facility has been broadcasting for seven years; someone engineered both the CHARON-7 strains and the cover story.** Every piece of content in this plan should either directly advance this reveal or deepen a faction's complicity with it.

---

## Phase 1 — Foundation: tier-1 narrative keys (small, visible win)

**Ship goal:** Five narrative keys actually grantable in-game. Players discover something. The feature that we wired in eval-fixes-0424 is no longer dormant.

### Keys

| Key | Source room | Extra / method | Intrigue pattern |
|---|---|---|---|
| `crossroads_hidden_cellar` | `cr_05_market_north` | examine `floor` / `stall` after Marta dialogue | Inherited Knowledge (Drifter memory) |
| `crossroads_signal_source` | `cr_06_north_market` | examine `radio_equipment` with Sparks present | Technical Exposition |
| `river_road_submerged_cache` | `rr_06_the_narrows` | dialogue with Howard (`requiresRep: drifters +1`) | Inherited Knowledge |
| `dust_caravan_cache` | `du_06_hardware` | dialogue with Campfire Storyteller | Inherited Knowledge |
| `crossroads_guard_rotation` | `cr_02_gate` | examine `arbiter_schedule` (Survival DC 9, 3+ visits) | Deduction |

### Work

- 5× `narrativeKeyOnExamine: 'key_id'` added to existing room extras
- 1 new room extra in `cr_02_gate` for the arbiter_schedule (observation-based)
- No new dialogue nodes — all 5 use existing NPC lines or examine extras
- Update `ROOM_EXIT_GATES` (if applicable — most of these unlock dialogue, not doors)

### Files

- `data/rooms/crossroads.ts`, `data/rooms/river_road.ts`, `data/rooms/the_dust.ts`
- No engine changes

### Ship gate

- `pnpm test` stays 1,120 green
- `pnpm test:eval` stays 400 green
- Manual: acquire all 5 keys in dev mode, confirm narration fires

**Effort:** ~1.5 hr. Safest phase — establishes the wiring works end-to-end.

---

## Phase 2 — The Bombing Mystery (load-bearing)

**Ship goal:** The central contradiction becomes detectable and resolvable. This is the phase that justifies the whole plan.

### Content

- **Two bridging dialogue nodes** — one on Marshal Cross's tree, one on Warlord Briggs's — that unlock *only* when the player has heard both independent admissions. Each says some version of *"You already knew. How long have the Accord and Salters both been sitting on this and not telling each other?"* Cross's version is cold; Briggs's is darker.
- **Three narrative keys:**
  - `scar_bombing_truth` — granted by deduction when the player has examined the crater geometry (`scar_01_crater_rim`, new extra) AND the facility blueprints (`scar_05_lab_wing`, existing) AND the authorization order (`scar_12_directors_office`, new extra if missing)
  - `meridian_bombing_orders` — granted by examining the CLASSIFIED filing cabinet in `scar_12_directors_office` (new extra)
  - `cross_concealed_truth` vs `cross_followed_orders` — mutually-exclusive flags set by the player's chosen line in the new Cross bridging node
- **One Vane line** in `scar_14_the_core`: if the player has `scar_bombing_truth` set, Vane acknowledges it without re-explaining ("Someone told you already. Good. That saves the breath I don't have anymore.")

### Ripple to existing content

- If `bombing_cover_confirmed` is true at ending time, each of the 4 endings gets a 2–3-line epilogue variant reflecting the political aftermath (Cure = Accord loses legitimacy; Weapon = Cross + Briggs consolidate; Seal = both sides tear at each other; Throne = the coverup becomes the new order's founding lie)

### Files

- `data/dialogueTrees.ts` (Cross and Briggs trees: ~4 new nodes total)
- `data/rooms/the_scar.ts` (new extras on crater_rim, lab_wing if missing, directors_office)
- `lib/narrativeKeys.ts` (register the 3 keys in ROOM_EXIT_GATES if any gates; register in the 30-key registry file)

### Ship gate

- Both contradictions detectable in a single playthrough (verified by adding a test in `tests/eval/` that constructs the player state and asserts the bridging nodes unlock when both prerequisites are met)
- All 4 endings still reachable; new epilogue variants tested via ending-reachability suite

**Effort:** ~3–4 hr. Heaviest narrative-authoring phase. High ROI — single contradiction resolution reshapes every ending.

---

## Phase 3 — Red Court arc (new dialogue, new playable thread)

**Ship goal:** Kade / Vex / Lyris become functional NPCs with a 3-act arc. The allowlist entries we added in `dev/eval-fixes-0424` get removed.

### Content

- **Three full dialogue trees** (`kade_pens_philosophy`, `vex_pens_manifest`, `lyris_pens_conflict`) — 8–12 nodes each
- **Lyris's arc branches:** `aid_lyris_extraction` / `join_kade_philosophy` / `disrupt_vex_system` / `rook_confrontation_direct` / `passive_observer` — each sets distinct flags
- **New extra** in `pens_14_rooks_office`: the 3.2% yield discrepancy ledger (the intrigue opening)
- **Alternate Sanguine biometric route:** if `aid_lyris_extraction` is set, Lyris gives the player a Sanguine biometric item, which sets `sanguine_biometric_obtained` flag — same flag Vesper sets, but earned via the Red Court path instead of Covenant
- **Vesper contradiction beat:** if the player has `pens_covenant_arrangement` (learned from Vex's manifests), a new Vesper dialogue branch unlocks where she's forced to admit the Covenant's "ethical" supply is partly Red Court blood

### Files

- `data/dialogueTrees.ts` (3 new trees, 1 modification to vesper_philosophy_main)
- `data/rooms/the_pens.ts` (assign Kade/Vex/Lyris to specific rooms, add ledger extra, add transit-point extras)
- `data/npcs.ts` (flesh out the 3 stubs with personality metadata)
- `tests/eval/dialogueHealth.test.ts` — remove the 3 Red Court entries from `NAMED_NPCS_WITHOUT_TREE` allowlist
- `tests/eval/endingReachability.test.ts` — add test that `sanguine_biometric_obtained` can be set via BOTH Vesper and Lyris paths

### Ship gate

- Red Court NPCs removed from allowlist; eval suite stays green
- Both Sanguine biometric acquisition paths verified reachable
- Vesper's new beat is gated properly (only unlocks when player has the Red Court evidence)

**Effort:** ~5–6 hr. Heaviest writing phase. Delivers a self-contained quest arc + surfaces a major Vesper contradiction "for free."

---

## Phase 4 — The Dog companion (prose-only, cycle-aware)

**Ship goal:** The Dog is adoptable, narrates meaningfully across ~6 context types, survives or dies based on cycle, and carries the "bloodhound trained for Sanguine detection" hook across cycles.

### Content

- **~300 lines** in `data/companionNarration.ts` organized by context (DANGER / RUINS / OPEN / TECH / GENERIC / JOIN / LEAVE-by-reason)
- **Adoption flow:** new `adopt_dog` action or inline in examine handler — player must feed 2×, then Dog joins on third encounter
- **Cycle semantics:** cycle 1–3 Dog `canDie: true`; cycle 4+ flipped to `canDie: false` (scarred survivor)
- **Four ending-specific reactions** (Cure / Weapon / Seal / Throne)
- **Hidden reveal:** seeded across cycle-2 Lev dialogue ("that dog keeps looking at you like it's tracking something") and cycle-3 Patch/Osei line about the breeder's mark — answer is earned across cycles, never explicitly stated

### Files

- `data/companionNarration.ts` (main content volume)
- `data/npcs.ts` (the_dog entry: add metadata)
- `lib/actions/social.ts` or `examine.ts` (adoption flow)
- `lib/echoes.ts` (cycle graffiti + NPC references to Dog's absence if died)
- `tests/eval/dialogueHealth.test.ts` — remove `the_dog` from `NAMED_NPCS_WITHOUT_TREE` only if we give it a minimal companion-dialogue tree; otherwise keep allowlist entry with a comment pointing to companion system

### Ship gate

- Adoption flow works in dev mode
- Companion narration fires at expected ~20% chance over 50-room playthrough
- Cycle-2 Lev + cycle-3 Patch/Osei lines seeded and gated properly

**Effort:** ~4–5 hr. Mostly prose. Zero engine work per Agent D's recommendation.

---

## Phase 5 — Remaining contradictions (deepen everything)

**Ship goal:** The other 7 contradictions Agent C identified become detectable. Lev stops being the single source of truth.

### The 7

| # | Contradiction | Primary resolution |
|---|---|---|
| 1 | CHARON-7 accident vs designed | `found_sanguine_origin` flag via lab whiteboards + Lev cross-ref |
| 3 | Vesper's Sanguine nature: chosen vs engineered | `vesper_echo_shared_origin` cycle-2 dialogue (already exists — needs prereq tightening) |
| 4 | Hollow: inevitable failure vs deliberate underclass | `hollow_origin_understood` flag via Elder + Lev combo |
| 5 | Kindling doctrine: preparation vs theater | `harrow_doctrine_examined` via Avery's admission |
| 6 | Broadcaster: 7-year continuous vs 6-month planning gap | `meridian_timeline_clarified` from scar_02 terminal extra |
| 7 | Lucid: separate species vs R-2 variant | `found_lucid_origin` via deep archive read |
| 8 | Cross: ordered-to-conceal vs chose-to-conceal | new Cross branch distinguishing `cross_followed_orders` vs `cross_concealed_truth` (overlaps Phase 2 — may land together) |

### Work pattern

Each contradiction is roughly **2–4 dialogue nodes** + **1 flag** + **1 narrative key tie-in**. They're small individually; volume is the cost.

### Rook recharacterization (out of agents' scope but falls naturally here)

Per Agent C: make Rook **systemically dishonest — not evil, self-protecting**. Three-side player (Red Court / external contact / personal survival). Existing trees already support this; needs 2–3 node additions to make the pattern visible. Gives the player's paranoia a valid target.

### Files

- `data/dialogueTrees.ts` (largest volume; ~15–20 new nodes distributed across existing trees)
- `data/narrativeKeys/keys_by_zone.ts` (may add 2–3 new keys)
- `lib/narrativeKeys.ts` (contradiction registry — may need new exported pairs)
- `tests/eval/` — add cross-reference tests that assert each contradiction has distinct A-claim and B-claim nodes reachable in the same playthrough

### Ship gate

- Each of 7 contradictions has a simulated-playthrough test proving both sides are reachable and resolution flag fires
- `MILESTONE_FLAGS` in `lib/echoes.ts` does NOT bloat — use `contradiction_resolved_*` family instead (doesn't propagate across cycles by design)

**Effort:** ~6–8 hr. Spread across 2–3 sessions because of volume.

---

## Cross-phase risks

1. **Lev overload (Agent C).** Contradictions 1, 3, 6 all route through Lev. Add a reputation threshold where Lev refuses to discuss certain topics, forcing the player to the Elder / Vesper / Vane. Mitigate in Phase 2 and 5.
2. **Cycle-2 dialogue drift.** Any cycle-gated content needs testing at cycle 1 (must be absent) AND cycle 2+ (must unlock). Add a helper in eval tests for this.
3. **`MILESTONE_FLAGS` bloat.** Phases 2 + 5 together add ~15 new flags. Only the load-bearing ones go in `MILESTONE_FLAGS`; contradictions use a parallel `contradiction_resolved_*` system that doesn't propagate.
4. **The 3 orphaned Key sources** (Agent A's risk flags — `rr_02_checkpoint`, `cv_03_accord_barracks`, `ember_incinerator_truth` multi-room chain). Defer these keys — they need room content that doesn't exist yet. Phase 5 may populate them if the rooms get built; otherwise they stay in the registry as authored-but-ungranted.
5. **Worktree staleness** (the session-level issue we hit before). Every parallel-agent dispatch during execution needs the current-main verification step baked into the Howler prompt.
6. **Ending payoff scope creep.** Phase 2's epilogue variants for all 4 endings could expand into a full "consequence pass" across the game. Box it: 2–3 lines per ending, period.

---

## Sequencing rationale

- **Phase 1 first** because it proves the narrativeKeys wiring works and gives a fast visible win (5 keys grantable in Act I).
- **Phase 2 second** because the bombing contradiction is the spine everything else leans on — resolving it early lets Phase 3/4/5 reference `bombing_cover_confirmed` as given context.
- **Phase 3 third** because the Red Court arc is self-contained and surfaces the Vesper supply contradiction as a bonus.
- **Phase 4 fourth** because The Dog is prose-only and fits a "smaller scope week" rhythm, while also seeding hints referenced in Phase 5's cycle-2 reveals.
- **Phase 5 last** because it depends on content patterns established in 1–4 (narrative keys wired, bridging dialogue nodes demonstrated, cycle-aware content working in practice).

**Total effort estimate:** 20–26 hours content authoring, plus test writing.

---

## What I recommend next

1. **Approve or edit this plan.** Push back on anything that feels off-thesis. Key decisions to confirm:
   - Is the MERIDIAN-bombing-theater beat the right spine, or do you want a different central mystery?
   - Red Court arc scope (5 resolution branches) OK, or should we trim to 3?
   - The Dog's hidden origin (trained bloodhound, Sanguine-detection) — is that the reveal you want, or is there a different answer that fits the narrative bible better?
   - Do we ship phase-by-phase (merge each to main as it lands) or bundle all 5 into a single PR?
2. **Once approved, I'll dispatch Phase 1 as a narrow Howler convoy** — 2–3 agents in parallel touching disjoint zone files.
3. **Each phase gets its own commit series + release-notes entry**, matching the eval-fixes-0424 discipline.

Full per-agent research reports can be preserved at `docs/plan/research/{agent-a,agent-b,agent-c,agent-d}.md` if useful. Recommend saving them — they contain prose cues and specific node-id references that phase execution will want to cite.
