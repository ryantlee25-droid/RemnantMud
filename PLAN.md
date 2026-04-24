# PLAN.md — Narrative Quality Review & Fix
## The Remnant MUD — Targeted Text Improvement

> Blue (Sonnet) — 2026-03-31
> Status: Awaiting Gold muster confirmation

---

## 1. Situation Assessment

After reading all 13 zone files, `npcs.ts`, `npcTopics.ts`, `dialogueTrees.ts`, `narratorVoices.ts`,
`items.ts`, `enemies.ts`, `worldEvents/`, and all 7 `playerMonologues/` files, the picture is more
nuanced than the prompt assumed:

**The named NPC layer (Patch, Marshal Cross, Warlord Briggs, Vesper, Lev, Howard, Sparks, Marta,
Dr. Osei, The Wren, Deacon Harrow, Rook, Elder Kai Nez, Cole, Wren Calloway) is already strong.**
These have voice, specificity, named vendor comments, personality-driven activity pools, and
immersive dialogue trees. The problem the prompt describes — "the components vendor is weighing
scrap metal" — is real but localized to the **generic NPC tier** and a subset of zone files.

**The actual problem areas, in priority order:**

### Critical — Generic NPCs with Role-Not-Name Descriptions

These NPCs appear in rooms and ambient descriptions with role labels rather than personality:

- `components_vendor` — name: "Components Vendor" — anonymous role label. Has no name. Referenced
  in room ambient text as "the components vendor weighing scrap metal." This is the specific example
  cited in the prompt.
- `board_manager` — name: "Board Manager" — role label, no personality beyond functional
- `food_vendor_generic` — name: "Food Vendor" — exists alongside named Marta; unclear when the
  generic fires vs. the named NPC. Redundant and weaker.
- `crossroads_gate_guard` — name: "Gate Guard" — sparse description, thin 3-entry activity pool
- `checkpoint_arbiter` — name: "Checkpoint Arbiter" — functional but characterless
- `campfire_storyteller` — name: "Campfire Storyteller" — role label; the dialogue is good but
  the NPC has no name to anchor them
- `mysterious_stranger` — name: "Stranger" — intentionally anonymous (possibly acceptable)
- `salter_perimeter_guard` — referenced in salt_creek npcSpawns, not found in visible npcs.ts
  export (possible missing definition)
- `accord_gate_militiaman` — referenced in covenant npcSpawns, not found in visible npcs.ts export
  (possible missing definition)

### Significant — Ambient Activity Lines Using Role References

Room `npcSpawns.activityPool` entries in some zones use generic labels — "the vendor," "a guard,"
"a Drifter arbiter" — even for locations where a named NPC should be the specific anchor.

Examples found in initial read:
- `crossroads.ts` gate spawns: "A Drifter arbiter leans against the gate post" — no name, generic
- `covenant.ts` gate spawns: "A militiaman in a stitched canvas vest stands at the gate bar" — flat
- `the_pens.ts` pens_01 has `npcs: ['crossroads_gate_guard']` in a Red Court zone — likely a
  copy-paste error assigning the wrong NPC to a room

### Moderate — Room Descriptions That Are Underspecified

The strongest zone files (the_dust, the_ember, the_breaks, the_pine_sea, the_scar, duskhollow)
have excellent room prose with time-of-day variants, environmental detail, and specific sensory
grounding. Weaker zones:

- `river_road.ts` — RR-01's description ("cracked but walkable," "ruts from cart wheels") is thin
  compared to the zone's character. Several river_road rooms likely share this gap.
- `covenant.ts` — CV-01 main gate is strong; interior rooms (market square, housing districts,
  administrative buildings) may drop in quality. CV-02 Gate Square description needs audit.
- `salt_creek.ts` — SC-01 outer perimeter is solid; inner compound rooms likely vary.

### Moderate — Items with Missing or Generic Descriptions

Most weapon/armor items have specific, evocative descriptions. Consumables and crafting components
are weaker — likely one-line functional entries that don't earn their place in the world.

### Low Priority (Already Strong — Verify Only)
- `playerMonologues/*.ts` — follows a consistent system with good class-specific voice
- `narratorVoices.ts` — clear literary voice, deliberately-false flag pattern works
- `worldEvents/act1_events.ts` — uses named NPCs (Harlan Voss), specific locations
- `enemies.ts` — Hollow types avoid generic zombie tropes, have personality-appropriate flavor
- `dialogueTrees.ts` — named NPCs throughout; Sparks and Lev trees are particularly strong

---

## 2. Problem Taxonomy

| Category | Files | Priority |
|---|---|---|
| Generic NPC names + thin descriptions | `npcs.ts` (generic NPC section, ~line 640+) | P1 |
| Missing NPC definitions (salter_perimeter_guard, accord_gate_militiaman) | `npcs.ts` | P1 |
| Room npcSpawn activityPool role-references | `rooms/*.ts` (all 13 zone files) | P1 |
| Copy-paste NPC assignment error (crossroads_gate_guard in the_pens) | `rooms/the_pens.ts` | P1 |
| Weak room descriptions (river_road, covenant interior, others) | `rooms/river_road.ts`, `rooms/covenant.ts` | P2 |
| Thin item descriptions (consumables, crafting components) | `items.ts` | P2 |
| World events Act 2+3 audit | `worldEvents/act2_events.ts`, `worldEvents/act3_events.ts` | P3 |
| Dialogue topics — remaining named NPCs topic coverage gaps | `npcTopics.ts` | P3 |
| Companion narration + convergence events tone check | `companionNarration.ts`, `convergenceEvents.ts` | P3 |

---

## 3. Howler Decomposition

Five audit Howlers run in parallel (H1–H5). Audit output is reviewed, then fix Howlers
(FH-A through FH-H) are dropped — split by file ownership to prevent conflicts.

**No fix Howler modifies a file owned by another fix Howler. No exceptions.**

---

### H1 — Zone Audit: Crossroads + River Road + Salt Creek + Covenant

**Scope (read-only)**: `data/rooms/crossroads.ts`, `data/rooms/river_road.ts`,
`data/rooms/salt_creek.ts`, `data/rooms/covenant.ts`

Audit for:
1. npcSpawn activityPool entries using role labels ("the guard," "a vendor") instead of character
   names or characterizing specifics
2. Room descriptions that are thin, vague, or use "there is/there are" constructions
3. Atmospheric text that tells ("quiet," "still") without grounding in specific detail
4. shortDescription fields that merely truncate the main description rather than evoking
5. Rooms beyond the first 1-2 in the zone that may have dropped prose quality
6. Any NPC referenced in npcs[] or npcSpawns that doesn't match the zone's established NPCs

Output: `AUDIT-H1.md` — every issue logged with file path, room ID, field name, issue type,
severity (P1/P2/P3), and specific proposed fix direction (not the fix text itself).

---

### H2 — Zone Audit: The Ember + Duskhollow + The Stacks + The Pens + The Deep

**Scope (read-only)**: `data/rooms/the_ember.ts`, `data/rooms/duskhollow.ts`,
`data/rooms/the_stacks.ts`, `data/rooms/the_pens.ts`, `data/rooms/the_deep.ts`

Audit for the same criteria as H1, plus:
- `the_pens.ts` pens_01: `npcs: ['crossroads_gate_guard']` — confirm this is a copy-paste error.
  What NPC should actually be here? (Likely a Red Court checkpoint NPC.)
- `the_stacks.ts` entry hall: room description says "Lev stands at the inner door" — this
  hard-codes NPC placement in room prose. Flag as an issue: if Lev doesn't spawn, the description
  is wrong. Is this intentional (Lev always spawns here) or a narrative mistake?
- Duskhollow: are there anonymous Sanguine NPC templates? Do they have names and personality?

Output: `AUDIT-H2.md`

---

### H3 — Zone Audit: The Breaks + The Dust + The Pine Sea + The Scar

**Scope (read-only)**: `data/rooms/the_breaks.ts`, `data/rooms/the_dust.ts`,
`data/rooms/the_pine_sea.ts`, `data/rooms/the_scar.ts`

From initial reads, these are the stronger wilderness zones. H3's job is confirmation and
identification of weaker rooms within them:

1. Do all rooms within each zone maintain the quality of the zone's opening room?
2. Environmental roll flavorLines — are they zone-specific or could they appear in any zone?
3. Act 3 rooms in `the_scar.ts` — do all rooms beyond scar_01_crater_rim have full prose or
   are some stubs/placeholders?
4. Check `personalLossEchoes` presence: the_ember has them; the_dust, the_pine_sea should too —
   if missing, flag as P2

Output: `AUDIT-H3.md`

---

### H4 — NPC Audit: npcs.ts + npcTopics.ts

**Scope (read-only)**: `data/npcs.ts`, `data/npcTopics.ts`

This is the most important audit. Read npcs.ts in full.

1. List every NPC whose `name` field is a role label ("Gate Guard," "Food Vendor," etc.). For each,
   propose a proper name consistent with zone and faction (see naming conventions below).
2. Identify missing NPC definitions: `salter_perimeter_guard` and `accord_gate_militiaman` are
   referenced in room npcSpawns. Do they exist in npcs.ts? If not, they need full definitions.
3. Flag NPCs with thin activity pools (fewer than 3 entries or no time-restricted variety).
4. Flag NPCs whose `description` field begins with "A [role]..." or uses generic construction.
5. Flag `food_vendor_generic` — does it serve a purpose distinct from `marta_food_vendor`?
   If not, recommend retirement and which rooms should reference Marta instead.
6. `npcTopics.ts` — check every named NPC with a topic entry. Flag: fewer than 4 topics is thin.
   Note which named NPCs have NO topic entry (missing entirely).
7. Check `traveling_merchant` in river_road npcSpawns — is there a definition in npcs.ts?

Output: `AUDIT-H4.md` — section A: NPCs needing names, section B: missing definitions,
section C: thin descriptions/activity pools, section D: npcTopics gaps

---

### H5 — Items + Enemies + World Events + Companion Text Audit

**Scope (read-only)**: `data/items.ts`, `data/enemies.ts`, `data/worldEvents/act2_events.ts`,
`data/worldEvents/act3_events.ts`, `data/companionNarration.ts`, `data/convergenceEvents.ts`

1. Items: read all items. Flag descriptions that are purely functional (no sensory detail, no
   world context, no provenance). Consumables and crafting components are the expected weak spots.
2. Enemies: read all flavor text pools. Flag lines that feel generic — could be in any game —
   vs. lines that are specific to the Remnant's world and CHARON-7 mythology.
3. World events Act 2 + Act 3: do they use named NPCs? Specific locations (named rooms, named
   settlements)? Or generic faction labels ("a Drifter came through")?
4. `companionNarration.ts`: tone check — consistent with the narrative bible's voice? Any lines
   that break character?
5. `convergenceEvents.ts`: same tone check. Are convergence events specific or atmospheric vague?

Output: `AUDIT-H5.md`

---

## 4. Fix Howler Decomposition (Post-Audit)

Fix Howlers are dropped after audit review. Each owns specific files and reads its audit report(s)
before making changes. Every fix Howler must also read the Fix Standards in this PLAN.

### FH-A — NPC Fixes
**Owns**: `data/npcs.ts`, `data/npcTopics.ts`
**Reads**: `AUDIT-H4.md`
**Work**:
- Give proper names to all generic NPCs flagged by H4
- Add missing NPC definitions (salter_perimeter_guard, accord_gate_militiaman, traveling_merchant)
  — full definitions matching the RichNPC interface: activityPool (4+ entries), dispositionRoll,
  spawnChance, zone, description, dialogue
- Rewrite thin descriptions to use specific physical detail and characterization
- Expand thin activity pools to minimum 4 entries with time restrictions
- Add missing npcTopics entries for named NPCs with gaps
- Retire or repurpose food_vendor_generic per H4's recommendation
- **CRITICAL**: Do not change any NPC's `id` field. Only name/description/dialogue/activityPool/
  npcTopics fields may change. ID changes break room spawn references throughout all zone files.

### FH-B — Room Fixes: Crossroads + River Road
**Owns**: `data/rooms/crossroads.ts`, `data/rooms/river_road.ts`
**Reads**: `AUDIT-H1.md`, `AUDIT-H4.md` (for NPC names assigned by FH-A)
**Note**: FH-B must coordinate with FH-A on NPC names. FH-B should be dropped after FH-A
completes or dropped with STABLE signal from FH-A once naming decisions are made (see §6).

### FH-C — Room Fixes: Salt Creek + Covenant
**Owns**: `data/rooms/salt_creek.ts`, `data/rooms/covenant.ts`
**Reads**: `AUDIT-H1.md`, `AUDIT-H4.md`

### FH-D — Room Fixes: The Ember + Duskhollow + The Stacks
**Owns**: `data/rooms/the_ember.ts`, `data/rooms/duskhollow.ts`, `data/rooms/the_stacks.ts`
**Reads**: `AUDIT-H2.md`, `AUDIT-H4.md`

### FH-E — Room Fixes: The Pens + The Deep
**Owns**: `data/rooms/the_pens.ts`, `data/rooms/the_deep.ts`
**Reads**: `AUDIT-H2.md`, `AUDIT-H4.md`
**Note**: Must fix the copy-paste NPC assignment error in pens_01. H2 will identify the correct
NPC; FH-E applies the fix.

### FH-F — Room Fixes: Wilderness Zones
**Owns**: `data/rooms/the_breaks.ts`, `data/rooms/the_dust.ts`, `data/rooms/the_pine_sea.ts`,
`data/rooms/the_scar.ts`
**Reads**: `AUDIT-H3.md`

### FH-G — Items + Enemies
**Owns**: `data/items.ts`, `data/enemies.ts`
**Reads**: `AUDIT-H5.md`
**Work**: Rewrite flagged item descriptions. Strengthen generic enemy flavor text lines.

### FH-H — World Events + Companion Text
**Owns**: `data/worldEvents/act2_events.ts`, `data/worldEvents/act3_events.ts`,
`data/companionNarration.ts`, `data/convergenceEvents.ts`
**Reads**: `AUDIT-H5.md`
**Work**: Revise world event messages using named NPCs and specific locations. Fix tone issues
in companion narration and convergence events.

---

## 5. Execution Order and Dependencies

```
Phase 1 (parallel): H1, H2, H3, H4, H5
                    ↓ (all complete)
Phase 2: Gold reads audit reports, presents summary, human confirms fix scope
                    ↓ (human approval)
FH-A starts first (naming decisions must exist before room Howlers reference names)
FH-A sends STABLE signal when naming decisions are committed to AUDIT-H4.md amendment
                    ↓ (FH-A STABLE)
FH-B, FH-C, FH-D, FH-E, FH-F, FH-G, FH-H — all parallel
                    ↓ (all complete)
Phase 4: White + tsc --noEmit + Gray
```

**Serial dependency**: FH-B through FH-F depend on FH-A's naming decisions (not FH-A completion).
FH-A signals STABLE after producing an amendment to AUDIT-H4.md listing final name assignments.
Room Howlers wait for this signal only, not FH-A's full completion.

FH-G and FH-H have no NPC name dependencies and can start concurrently with FH-A.

---

## 6. Fix Standards (Contract Preview)

Gold will reproduce these verbatim in CONTRACT.md. Every fix Howler follows these without exception.

### NPC Fix Rules
- Generic NPCs get actual names. Names fit zone and faction:
  - Crossroads (Drifter/neutral): American Southwest worn-common names — Ardis, Delmar, Greta,
    Cass, Ruben, Nell, Kit
  - Covenant (Accord): Competent, slightly formal — Sable, Orin, Tamsin, Brecke, Vance
  - Salt Creek (Salter): Military-adjacent, no-nonsense — Flynn, Harker, Stroud, Deeks, Mace
  - Duskhollow (Covenant of Dusk): Deliberate, slightly archaic — Elara, Dorin, Sable, Nox
- NPC description must NOT begin with "A [role] who..." — start with a specific physical detail,
  action in progress, or observable characteristic. The role emerges from the specifics.
- Named NPCs are referenced by name in room activityPool descriptions, not by role.
  Wrong: "A Drifter arbiter leans against the gate post"
  Right: "Ardis leans against the gate post, one hand resting on the guardrail bar, watching
  the approach road like she's memorized every footfall that's ever come up it."

### Room Description Fix Rules
- Room descriptions reference named NPCs by name when that NPC is the primary fixture
  (e.g., "Marta's stall" not "the food vendor's stall")
- No atmospheric text is purely abstract: "quiet" must say what is quiet and why that quiet
  has weight here. "Still" must say what the stillness is made of.
- Time-of-day variants must include at least one sensory detail unique to that time — not just
  lighting changes.
- Avoid "there is/there are" constructions — start with the object or action.
- Avoid "you can see" unless the visibility is itself notable ("through the smoke you can see
  that the door is open" is fine; "you can see a gate" is not).
- shortDescription should evoke, not just label. If the main description has a memorable image
  or specific detail, distill that into the short version.

### Item Description Fix Rules
- Every item description earns the right to exist: tell something about the world through
  the item's condition, provenance, use history, or scarcity.
- Consumables: describe texture, smell, packaging material, pre-Collapse origin where relevant.
  A bandage is not just cloth. It was cut from something specific.
- Components: describe why they're scarce, what they were originally, what the Reclaimers want
  them for. "Electronics salvage" is a category — make it specific to what was salvaged.
- Post-Collapse world is ~7 years old. Nothing is new. Everything was once something else.

### Voice Consistency Rules
- No character refers to themselves by their role ("I'm the board manager").
- Post-Collapse tone: exhausted competence. People do hard things without drama. The drama is
  in the specific detail, not in exclamation.
- Currency is .22 LR rounds ("pennies"). Item values exist in that frame.
- The world has named factions, named NPCs, named places. Use them.

---

## 7. Acceptance Criteria

### Audit Howlers (H1–H5)
- [ ] Each produces a structured `AUDIT-Hx.md` with: file path, room/NPC ID, field, issue type,
  severity, fix direction
- [ ] No audit Howler modifies source files — read only
- [ ] Missing NPC definitions are identified and listed
- [ ] Copy-paste NPC assignment errors are identified with correct replacement noted

### Fix Howlers (FH-A through FH-H)
- [ ] All P1 issues from audit reports are resolved
- [ ] All P2 issues are resolved or explicitly deferred with written rationale in HOOK.md
- [ ] Every generic NPC that appears in any room text has an actual name
- [ ] No room `npcSpawn.activityPool` entry uses "the [role]" pattern for a named NPC
- [ ] No NPC `id` field was changed (only display name and text fields)
- [ ] All fixed files pass `npx tsc --noEmit` with zero errors introduced
- [ ] No room exit connections modified (out of scope)
- [ ] No TypeScript interface changes (out of scope)

### Final Quality Gate
- White review: zero blockers
- `npx tsc --noEmit`: zero new errors
- Gray: zero test regressions in NPC, room, or dialogue tests

---

## 8. File Ownership Matrix

| File | Phase 1 Reader | Phase 2 Owner |
|---|---|---|
| `data/npcs.ts` | H4 | FH-A |
| `data/npcTopics.ts` | H4 | FH-A |
| `data/rooms/crossroads.ts` | H1 | FH-B |
| `data/rooms/river_road.ts` | H1 | FH-B |
| `data/rooms/salt_creek.ts` | H1 | FH-C |
| `data/rooms/covenant.ts` | H1 | FH-C |
| `data/rooms/the_ember.ts` | H2 | FH-D |
| `data/rooms/duskhollow.ts` | H2 | FH-D |
| `data/rooms/the_stacks.ts` | H2 | FH-D |
| `data/rooms/the_pens.ts` | H2 | FH-E |
| `data/rooms/the_deep.ts` | H2 | FH-E |
| `data/rooms/the_breaks.ts` | H3 | FH-F |
| `data/rooms/the_dust.ts` | H3 | FH-F |
| `data/rooms/the_pine_sea.ts` | H3 | FH-F |
| `data/rooms/the_scar.ts` | H3 | FH-F |
| `data/items.ts` | H5 | FH-G |
| `data/enemies.ts` | H5 | FH-G |
| `data/worldEvents/act2_events.ts` | H5 | FH-H |
| `data/worldEvents/act3_events.ts` | H5 | FH-H |
| `data/companionNarration.ts` | H5 | FH-H |
| `data/convergenceEvents.ts` | H5 | FH-H |

**Not in scope** (already strong or structural):
`data/dialogueTrees.ts`, `data/playerMonologues/*.ts`, `data/narratorVoices.ts`,
`data/rooms/index.ts`, `data/questDescriptions.ts`, `data/recipes.ts`,
all files in `lib/`, `types/`, `tests/`

---

## 9. High-Risk Items for Gold

1. **NPC ID stability**: FH-A must not rename `id` fields. The game engine and every room file
   reference NPCs by ID. A renamed ID = broken spawns across all zone files with no TypeScript
   error to catch it. Gold should explicitly state this in the CONTRACT.md invariant.

2. **The copy-paste NPC issue**: `the_pens.ts` pens_01 has `npcs: ['crossroads_gate_guard']` in a
   Red Court zone. H2 must identify the correct NPC (likely a Red Court checkpoint NPC). FH-E
   applies the fix, but Gold must verify before fix Howlers drop: does a correct Red Court
   checkpoint NPC already exist in npcs.ts, or does FH-A need to create one?

3. **Missing NPC definitions**: If `salter_perimeter_guard` and `accord_gate_militiaman` don't
   exist in npcs.ts, the game currently references undefined NPC IDs. FH-A creates these. Room
   Howlers (FH-C for salt_creek/covenant) must not assume the definitions exist until FH-A's
   STABLE signal confirms them.

4. **food_vendor_generic vs. Marta**: Both are in the crossroads zone. Gold must decide — before
   fix Howlers drop — whether `food_vendor_generic` should be: (a) retired entirely, with its
   room references changed to Marta; (b) renamed and repurposed for non-Crossroads zones only;
   (c) kept as a secondary vendor distinct from Marta. This decision affects FH-A and FH-B.

5. **The Stacks hard-coded NPC prose**: `st_02_entry_hall` says "Lev stands at the inner door"
   in the room description. If Lev's spawnChance of 0.80 means 20% of visits Lev isn't there,
   the description is wrong 20% of the time. H2 must flag; Gold decides whether FH-D softens
   this to "Lev is typically at the inner door" or removes the hard-reference.
