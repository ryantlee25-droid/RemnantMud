# NPC Narrative Quality Audit
**Scope**: `data/npcs.ts`, `data/npcTopics.ts`, `data/dialogueTrees.ts`
**Date**: 2026-03-31
**Auditor**: Spectrum Howler (narrative audit pass)

---

## Summary

| Category | Count |
|---|---|
| Total NPCs defined in npcs.ts | ~90 |
| Named NPCs (isNamed: true) | 17 |
| Generic-named NPCs (role as name) | 31 |
| NPCs with personality in description | ~60 |
| NPCs with generic/flat descriptions | ~30 |
| Missing NPC definitions (spawned but undefined) | 5 |
| Zone mislabels (NPC spawned outside declared zone) | 2 |
| Dialogue tree coverage (named NPCs) | 4 of 17 have full trees |

**Headline finding**: The named NPC writing is excellent — Patch, Lev, Cross, Vesper, Sparks, Harrow, Briggs, Vane, Rook all have distinct, compelling voices. The generic NPC layer has good situational writing but ~31 NPCs are still identified by function rather than name, and 5 NPC IDs referenced in room spawns have no definition in npcs.ts.

---

## Part 1 — Missing NPC Definitions (BLOCKER)

These NPC IDs are referenced in room spawn tables but have **no entry in `NPCS`**. The engine will return `undefined` from `getNPC()`, which will cause silent failures or crashes on interaction.

---

### BLOCKER-01: `wren_shelter` and `wren_ruins`
**Severity**: BLOCKER
**Referenced in**: `REVENANT_DIALOGUE` (npcs.ts lines 2434–2456) — cycle-gated dialogue for cycles 2, 4, 8 and cycles 2, 6
**Definition in NPCS**: None
**Room spawns**: None found

These two IDs exist in the `REVENANT_DIALOGUE` registry, which means the engine will attempt to find an NPC with these IDs to display cycle-aware dialogue. Without corresponding `NPCS` entries, `getNPC()` returns `undefined`. The dialogue text references "a loom" and "weaving" (The Wren in a shelter) and "ruins" — these appear to be two alternate room-context instances of The Wren (who is defined as `the_wren`). The ID naming convention implies they were planned as room-scoped variants but were never defined.

**Action required**: Either (a) create `wren_shelter` and `wren_ruins` NPC entries as zone-specific Wren instances, or (b) remap the REVENANT_DIALOGUE keys to `the_wren` and handle context via room ID instead. The loom/weaving imagery in the shelter dialogue doesn't match The Wren's current characterization (hunter/detective) and may be a copy-paste artifact.

---

### BLOCKER-02: `old_mae`
**Severity**: BLOCKER
**Referenced in**: `REVENANT_DIALOGUE` (npcs.ts lines 2458–2467) — cycle-gated dialogue for cycles 2 and 6
**Definition in NPCS**: None
**Room spawns**: None found

Old Mae has two strong cycle-aware lines ("You always come back. You again, and you again" / "The static is what keeps us safe from remembering everything") that are thematically coherent and would land well. She appears to be a seer/elder archetype tied to the Revenant identity. She is fully written in the dialogue layer but has no NPC definition, no description, no zone assignment, and no room spawn.

**Action required**: Create the `old_mae` NPC definition. The dialogue implies she belongs somewhere liminal — the Crossroads or the Pine Sea are good candidates.

---

### BLOCKER-03: `salter_perimeter_worker`
**Severity**: BLOCKER
**Referenced in**: `salt_creek.ts` room spawn (line 138)
**Definition in NPCS**: None

A distinct ID from `salter_perimeter_guard` — possibly intended as a civilian worker variant vs. a guard variant, but no definition exists. The engine will silently skip or error when trying to spawn this NPC.

**Action required**: Define `salter_perimeter_worker` as a Salter camp worker (non-combat), or alias the spawn to `salter_off_duty`.

---

### BLOCKER-04: `duskhollow_child`
**Severity**: BLOCKER
**Referenced in**: `duskhollow.ts` room spawn (line 1134)
**Definition in NPCS**: None

A child NPC in Duskhollow — the human settlement under the blood tithe. This is narratively meaningful (children in the tithe arrangement is a powerful implicit detail) but completely undefined. No name, no description, no dialogue.

**Action required**: Define `duskhollow_child`. Even a minimal definition with a one-line description and a single dialogue line would satisfy the spawn. The narrative potential here is high — a child who has grown up inside the tithe arrangement has a very different perspective than the adults.

---

### BLOCKER-05: `mess_hall_children` / `south_wall_children`
**Severity**: BLOCKER
**Referenced in**: `salt_creek.ts` room spawns (lines 411, 1008)
**Definition in NPCS**: None

Two child NPC IDs for the Salter camp — children in the mess hall and children at the south wall. Neither is defined. These are atmospheric, not story-critical, but the engine will fail on spawn.

**Action required**: Define both as simple atmospheric NPCs. Single-sentence descriptions and short dialogue lines will suffice.

---

## Part 2 — Generic-Named NPCs (WARNING)

These NPCs are identified by role, not by name. They are listed with a proposed name and personality for each.

---

### WARNING-06: `crossroads_gate_guard`
**Current name**: "Gate Guard"
**Description quality**: Acceptable — "eyes do a threat-assessment sweep" is specific
**Dialogue**: "Eyes up. Arms out. Everyone gets checked." — functional, not generic
**Personality**: The description has more texture than the name suggests. The name is the weakest part.
**Proposed name**: **Doyle** — A former county sheriff's deputy who applied his old procedures to the new world because they still mostly work. Blunt, fair, has seen too many people try to talk their way through.

---

### WARNING-07: `checkpoint_arbiter`
**Current name**: "Checkpoint Arbiter"
**Description quality**: "Clipboard in hand, expression neutral and professional" — competent but thin
**Dialogue**: "Purpose of entry? How long are you staying?" — pure function
**Personality**: None. The description is entirely role. No personality trait, no history, no voice.
**Proposed name**: **Sable** — An ex-paralegal who treats the checkpoint like a deposition. Precise, not unkind, permanently exhausted by people who think rules are optional for them specifically.

---

### WARNING-08: `food_vendor_generic`
**Current name**: "Food Vendor"
**Description quality**: "A vendor operating a food stall" — role description, no person
**Dialogue**: "Hot rations, two pennies. Clean water, two pennies." — transactional, characterless
**Personality**: None. Notably, the named equivalent (`marta_food_vendor`) has a rich description and voice. This generic version is significantly weaker and placed in the same zone.
**Note**: Two food vendors exist in Crossroads — named Marta and unnamed Food Vendor. The generic one should either be cut, or differentiated as a distinct personality (different cooking style, different faction affiliation, different personality).
**Proposed name**: **Solis** — A former line cook who is very precise about what he will and won't prepare given available ingredients, and treats this precision as a form of integrity. Quieter than Marta. More particular.

---

### WARNING-09: `components_vendor`
**Current name**: "Components Vendor"
**Description quality**: "A Reclaimer-affiliated trader dealing in electronics, tools, and mechanical parts. Their stall smells like solder and machine oil." — the smell detail is good, but the opener is pure role.
**Dialogue**: "Electronics, tools, components. If the Reclaimers want it, I probably have it." — functional
**Personality**: Hints at Reclaimer affiliation but no individual traits
**Vendor comments**: The component-specific lines are solid ("Test each one before you solder. Half of them are borderline.")
**Proposed name**: **Fuse** — A Reclaimer technician who traded down to the market level because she found she could do more good getting tools into people's hands than keeping them in the Stacks. Has strong opinions about salvage quality.

---

### WARNING-10: `board_manager`
**Current name**: "Board Manager"
**Description quality**: "The person who manages the job board" — literal role description
**Dialogue**: "Board jobs pay on verified completion. No advance. No partial." — functional, slightly bureaucratic
**Personality**: The line "yes, it's annoying, and yes, you should still go through it" has personality but it's buried
**Proposed name**: **Nance** — Has run this board through three settlement administrations and has the patience of someone who has heard every possible excuse for why a job was "technically complete." Knows everyone's work history.

---

### WARNING-11: `accord_sentry_river`
**Current name**: "Accord Sentry"
**Description quality**: "Alert, professional, polite as the situation allows" — generic professional description
**Dialogue**: Solid — "River Road is Accord-patrolled as far as the bridge. Past Howard's crossing, you're on your own. We've had Hollow movement north of the old campsite." — geographic specificity gives it life
**Proposed name**: **Birch** — Has walked this river road stretch for two years and knows every bend. Gets genuinely angry about people who travel north of the old campsite in daylight and then need to be rescued.

---

### WARNING-12: `fisher_npc`
**Current name**: "Fisher"
**Description quality**: "someone who has learned that some things cannot be hurried" — good but could belong to anyone
**Dialogue**: "The fish don't know about any of it." — this line is excellent and should be the opening
**Note**: There's also a `lone_fisher` defined separately with nearly identical text. Duplication issue.
**Proposed name**: **Yael** — Has lived on this river stretch since before the Crossroads was established. Keeps meticulous records of the water level. Nobody asked them to.

---

### WARNING-13: `traveling_merchant`
**Current name**: "Traveling Merchant"
**Description quality**: "the cheerful wariness of someone who has survived the roads by being careful about who they trust and fast about getting out" — good texture
**Dialogue**: Strong — the mention of pre-Collapse canned protein "I'm not going to ask you to verify the contents of" has real voice. The signal reference is a good hook.
**Issue**: The name undercuts the writing. This is one of the better generic NPCs but the name makes it invisible.
**Proposed name**: **Oya** — Runs a three-week trade circuit through five settlements, has made the circuit eleven times without losing cargo, and is irrationally proud of this record.

---

### WARNING-14: `accord_militia`
**Current name**: "Accord Militia"
**Description quality**: "Well-equipped by regional standards. The Accord's investment in its people is visible in their kit." — specific to faction but no individual
**Dialogue**: Infrastructure fee line is good
**Proposed name**: **Wicks** — Three years in, knows the checkpoint rules cold, will explain them in detail to anyone who seems confused. Not unfriendly. Just extremely committed to the procedure.

---

### WARNING-15: `salters_soldier`
**Current name**: "Salter Soldier"
**Description quality**: "Professional and territorial" — adequate
**Dialogue**: "Salt Creek perimeter. You need a reason to be here" — solid. The ghost-broadcast dismissal is character-specific.
**Proposed name**: **Kane** — Seven years military, two with the Salters. Has adopted Briggs's worldview because it's the most coherent one available. Has doubts she's not going to share with you.

---

### WARNING-16: `kindling_faithful`
**Current name**: "Kindling Faithful"
**Description quality**: "moves through the Ember settlement with the quiet certainty of someone who believes completely in something" — good, but abstract
**Dialogue**: "The fire will find its own. Harrow says the purification isn't about punishment — it's about selection. I believe him. I went through it. I came out the other side." — this is quite good, actually
**Proposed name**: **Reese** — Went through the preparation rite eighteen months ago. Came out different. Doesn't say different in a bad way. Just different. Still working out the specifics.

---

### WARNING-17: `reclaimer_technician`
**Current name**: "Reclaimer Technician"
**Description quality**: "A Stacks technician surrounded by partially disassembled equipment, working with focused competence." — adequate
**Dialogue**: "The Collapse was survivable at the system level — we just lost the information infrastructure." — the intellectual framing is Reclaimer-specific
**Proposed name**: **Priya** — Joined the Reclaimers because she was a librarian before and the mission felt continuous. Now solders circuit boards, which was not in her job description, but she's good at it.

---

### WARNING-18: `bridge_keeper_generic`
**Current name**: "Bridge Keeper"
**Severity**: STYLE — this is a near-duplicate of `howard_bridge_keeper`
**Issue**: The Animas crossing is explicitly Howard's bridge (built in '32, "forty-year-old cable"). This generic bridge keeper is in zone `river_road` with nearly identical behavior. Are there two bridges? If not, this is redundant and potentially confusing.
**Proposed resolution**: Either (a) this is a different crossing — give it a distinct location, personality, and name, or (b) cut it and use Howard for all bridge encounters.

---

### WARNING-19: `drifter_newcomer`
**Current name**: "Newcomer"
**Description quality**: "Not all the way settled yet. Looking for footing." — good compression
**Dialogue**: "Came in from the east. Three days." — this is genuinely good ambient dialogue
**Proposed name**: No strong need for a proper name here — "Newcomer" reads as a type rather than an individual, which is appropriate for a 0.60 spawn. Could rename to **The New Arrival** for slightly more texture.

---

### WARNING-20: `wounded_drifter`
**Current name**: "Wounded Drifter"
**Description quality**: "the specific economy of someone managing pain" — strong
**Dialogue**: "Hollow herd on the south track, maybe two days out. I made it through the edge of it. Three people I came in with didn't." — excellent. The most useful ambient NPC line in the zone.
**Proposed name**: **Cass** — Keep the wounded anonymity for first encounter, but give a name if the player speaks to them. The "three people I came in with didn't" deserves a named speaker.

---

### WARNING-21: `campfire_storyteller`
**Current name**: "Campfire Storyteller"
**Description quality**: "An older Drifter who has traded stories for food and shelter since before the Crossroads was the Crossroads." — specific, earns its description
**Dialogue**: "You want news or stories? News costs a meal. Stories are free but you have to stay for the whole thing." — excellent. This NPC has real voice.
**Issue**: The name doesn't match the quality of the writing. This feels like a named character waiting to happen.
**Proposed name**: **Gavel** — Has a reputation across three settlements. People travel to the Crossroads specifically to hear Gavel's account of the first month after the Collapse, which changes slightly each telling in ways nobody can prove are inaccurate.

---

### WARNING-22: `mysterious_stranger`
**Current name**: "Stranger"
**Description quality**: "Watching too many things at once. Here for a reason they haven't announced." — competent
**Dialogue**: "There's a Reclaimer with a file that has your name on it." — solid hook
**Note**: There's also `mysterious_stranger_sanguine` defined separately — the Sanguine version. The baseline `mysterious_stranger` isn't referenced in any room spawn found during audit. May be orphaned.

---

### WARNING-23: `brig_guard` and `jail_guard`
**Current names**: "Brig Guard" / "Jail Guard"
**Issue**: These are two separate NPC IDs (`brig_guard` and `jail_guard`) with nearly identical descriptions and dialogue. They spawn in covenant.ts and salt_creek.ts respectively. This is functional redundancy — consider merging into one NPC ID with faction parameter.

---

### WARNING-24: `accord_gate_militiaman` vs `accord_militia`
**Issue**: Two nearly identical Accord checkpoint NPCs. `accord_gate_militiaman` is defined with a name ("Gate Militiaman") that is indistinguishable from `accord_militia` ("Accord Militia"). Both spawn in Covenant. Their descriptions are nearly identical. Consider merging.

---

### WARNING-25: `east_wall_sentry`, `north_wall_sentry`, `south_wall_sentry`
**Severity**: STYLE
**Issue**: Three near-identical sentry NPCs distinguished only by cardinal direction. Each has a one-line directional dialogue and identical activity pools. The north wall sentry has the best dialogue ("quiet this week — that's either good or the Hollow are moving differently") and that line should inform all three. Consider collapsing to two (north-facing / south-facing) with better differentiation.

---

## Part 3 — Named NPC Voice Assessment

### Patch — PASS (Excellent)
Patch's description ("They look at wounds the way other people look at locks") is one of the strongest character introductions in the file. The transactional dialogue is perfectly calibrated — clinical curiosity, not warmth. Topics maintain voice consistently: the information-cost economy appears in every response, the three-finger counting gesture anchors body language. Vendor comments ("This is broad-spectrum. Don't use them unless you're sure it's bacterial.") are character-specific, not generic vendor lines.

**Minor note**: The `vendorGreeting` ("You're buying bandages. That's either optimism or planning. Which one are you?") is excellent. The `vendorFarewell` ("Try not to need me again. But you will.") is equally good. No issues.

---

### Lev — PASS (Excellent)
Lev's dialogue across topics, trees, and REVENANT_DIALOGUE is remarkably consistent. The voice is: clinical precision, emotional suppression that occasionally slips ("That was clinical. I'm aware"), and the specific professional warmth of someone who has decided attachment is a data point. The echo-trust branch in the dialogue tree — "That sounded like sentiment. It was data-driven sentiment. There's a difference" — is exactly right. The keycard branches (lore/negotiate/intimidate) each produce distinct relationship outcomes that are mechanically and narratively coherent.

**No issues.**

---

### Marshal Cross — PASS (Strong)
Cross's military cadence is well-maintained. The 60-second opener, the statement-not-feeling affect, and the topic responses all hold. "2031. National Guard, forward element. Fourteen in, three out." is the kind of line that rewards players who ask about the Scar. The REVENANT_DIALOGUE entries ("I've started keeping a separate log for people like you. Not to track you. To understand what the Accord owes you.") show good character evolution.

**Minor issue**: `cross_expedition_gate` requires either `cross_admitted_bombing_theater` OR `patch_mentioned_scar` flag — but `cross_admitted_bombing_theater` doesn't appear to be set anywhere in the visible dialogue tree. Possible dangling flag reference.

---

### Vesper — PASS (Excellent)
The most complete named NPC in terms of voice consistency across all layers. "I am not certain I want to be cured. That is something I have not said aloud before" lands correctly — the practiced detachment that slips into vulnerability then recovers is the defining rhythm. The death condition note (fountain pen in hand, open to Kant) is perfect.

**No issues.**

---

### Sparks — PASS (Excellent)
Sparks is the emotional center of the game's main mystery and her dialogue carries that weight. The echo-broadcaster scene ("She sits down. Hard. Like her legs decided before she did.") is the strongest single dialogue moment in the file. The quest tree maintains the "controlled desperation" affect throughout. The personal-backstory branch ("Three weeks after the Collapse. I'd lost — everyone.") earns its sentiment.

**No issues.**

---

### Deacon Harrow — PASS (Strong)
Harrow's voice — conviction that's quieter than it should be — is well-executed. "The fire does not ask permission. It selects." The Hollow grief crack ("My sister was among the first. She screamed for three days") is the best moment — it shows the true believer's wound. REVENANT_DIALOGUE entry ("The Kindling calls people like you the Persistent") is character-appropriate and plot-significant.

**Minor issue**: The activity pool includes "is running two fingers along a long scar on the back of his right hand" — this is a strong physical detail but the scar is never mentioned in the description or dialogue. Consider incorporating a reference to establish it.

---

### Warlord Briggs — PASS (Strong)
Briggs's dialogue across topics and trees maintains consistent voice: strategic pragmatism as moral framework. "The Hollow don't have a truce. The Red Court doesn't have a truce. Every settlement we don't control is a settlement that can be turned against us. That's not aggression. That's geometry." The tribunal line ("I've offered to submit to a tribunal — once the eastern perimeter is secure. Not before.") is excellent character-specific evasion.

**Minor issue**: REVENANT_DIALOGUE entry ("I've heard about the revenant type. Thought it was Reclaimer mythology.") is notably thinner than other named NPCs' cycle-2 responses. Briggs should have a more tactically framed reaction.

---

### Howard (Bridge Keeper) — PASS (Strong)
Howard's engineering-as-philosophy voice is consistent. "A bridge is a permanent argument with gravity. You have to keep making the argument." The grief detail ("She would have been twelve this year. He doesn't say who.") is correctly restrained. The night activity ("standing at the bridge center, mug cold in his hands") makes that grief visual without stating it.

**No issues.**

---

### Dr. Ama Osei — PASS (Strong)
"I am not asking for your blood for reasons you should find frightening. I am asking for a voluntary sample with full informed consent" — this is the character in one sentence. The death condition ("The hunger won. I was two samples short.") is devastating. Topics maintain the researcher-subject irony.

**Minor issue**: She appears twice in npcs.ts — once as `dr_ama_osei` (zone: the_breaks, spawnChance: 0.55) and once as `lucid_sanguine_osei` (zone: the_breaks, spawnChance: 0.50). Two separate NPC entries for the same character in the same zone will cause double-spawning. `lucid_sanguine_osei` is redundant with `dr_ama_osei` and should be collapsed into one entry or used as a zone-context variant with explicit room-scoping.

---

### The Wren — PASS (Strong)
"I used to find missing people. Now I find people who don't want to be found, which is a different skill set." The detective-turned-hunter premise is fully realized. Death condition (knife in the wall, three hunters sent) is excellent. Topics maintain the flat-affect economy of someone who has stopped asking certain questions.

**Issue**: See BLOCKER-01 above — `wren_shelter` and `wren_ruins` in REVENANT_DIALOGUE reference dialogue that doesn't match The Wren's current characterization (the loom/weaving imagery is not his). These appear to be misattributed entries from a different NPC concept.

---

### Elder Kai Nez — WARNING
Elder Kai Nez has a strong description and opener. However, topics in `npcTopics.ts` are thin — only three entries, each quite short. More critically, there is no dialogue tree. For a named NPC who is the primary contact for an entire faction/community, the depth is insufficient.

**The description** ("He has assessed you thoroughly before you have finished entering the room") is strong. The **dialogue** ("I am not hostile to you. I am cautious, which has the same shape and a different meaning.") is excellent. The topics need more development.

**Recommended**: Add 3-4 more topic entries — the Breaks' history, the Collapse, the Hollow, and the elder's assessment of the other factions. His perspective on the Red Court and the Scar should be distinct from everyone else's.

---

### Rook — PASS (Strong)
"I don't have the investment in you required for enmity." Rook's voice is the most difficult to sustain — pure transactionalism without becoming a cartoon — and it holds. "A deal isn't trust. A deal is math." The Red Court/Vesper comparison in topics shows genuine analytical intelligence.

**No issues.**

---

### Kade (Red Court) — PASS (Strong)
The ideological antagonist voice: "The first year was the loudest. Everyone was deciding what they were... I made my decision early. I've been thinking about it ever since. Not regretting. Thinking." The activity pool (writing in a journal, looking at the wall "as if it had said something worth considering") is character-appropriate.

**No issues.**

---

### Vex (Red Court) — WARNING
Vex has a strong premise — the logistics of horror — but the description and dialogue lean heavily on the premise statement without showing it. "The ledger is always open. The pen is always moving" is good. But the dialogue ("Supply chain. Territory management. Resource allocation. What I do isn't complicated — it just sounds worse once you know what the supply is.") explains the character concept rather than embodying it.

**Recommended**: The vendor comments and activity pool carry more personality than the main dialogue line. Move one of the activity pool details (counting collection bags with businesslike speed) closer to the surface — show the ledger before naming it.

---

### Lyris (Red Court) — PASS (Strong)
The recently-turned perspective is well-handled. "There's a version of me that's still figuring out the rules. Not the Red Court rules. The other rules." The topics ("I hate that it's better") show internal conflict without melodrama. The activity pool — "looking at her own hands with the focused expression of someone doing inventory" — is exactly right.

**No issues.**

---

### Avery (Kindling Doubter) — PASS (Strong)
"Harrow says the fire selects. I've been watching the people the virus takes, and — I've been watching for two years. I haven't found the pattern." This is the most honest self-disclosure in the file. Topics maintain the doubt-without-crisis register. The activity pool ("facing away from the chapel") is correct.

**No issues.**

---

### Dory (Duskhollow Tithe) — PASS
Brief but correct. "The math works out. I know how that sounds." The compression bandage as a visible prop is exactly right. She doesn't need more dialogue — she needs to be found in the right room at the right time.

**No issues.**

---

### Vane (The Broadcaster) — PASS (Excellent)
"I've been trying to figure out what to say. I've had seven years and I still haven't got it right." The wait-as-posture activity ("simply sitting, watching the door, waiting — the posture of someone who has practiced patience until it became natural") is exactly right for someone who has been alone for seven years. The spawnChance of 1.00 is appropriate.

**No issues.**

---

### Marta — PASS (Strong)
"Everyone eats. Which means I know everyone." Marta's food-as-information-network premise is well-established. Topics ("Feeding someone is the fastest way to make them forget you're in the room") show intelligence beneath the maternal surface. The survival topic ("A person who feeds people is hard to kill — too many people would notice. Too many people would be hungry.") is the best character-reveals-stakes moment outside the main story beats.

**Note**: `marta_food_vendor` and `food_vendor_marta` are two separate entries for the same character. They're in the same zone, both are vendors, and both have nearly identical descriptions and vendor comments. This will double-spawn Marta or cause inconsistent behavior. Pick one ID and delete the other.

---

### Sparks (Scar Instance) — STYLE
`sparks_radio_repair` is a zone-context variant of Sparks placed in the Scar. The description and dialogue are distinct from the Crossroads instance. This is intentional and correct — Sparks in the Scar is further along, more confident. The two instances are well-differentiated.

**Minor issue**: The primary zone for `sparks_radio` is `crossroads` but `sparks_radio_repair` is zone `the_scar`. Room spawns show `sparks_radio_repair` in crossroads.ts (line 436). Zone field may be wrong on one of them.

---

## Part 4 — Zone Mislabels and Spawn Errors

### `camp_elder_rosa` — Spawning in wrong zone
`camp_elder_rosa` is defined with `zone: 'salt_creek'` but is referenced as a spawn in `crossroads.ts` (line 752). Rosa is a Salt Creek community elder — she should not appear at the Crossroads. This is a copy-paste spawn error.

### `medic_marsh` — Spawning outside zone
`medic_marsh` is defined with `zone: 'salt_creek'` but is referenced in `covenant.ts` (line 475) and `the_pens.ts` (lines 229, 945). The Salter medic appearing in the Accord's Covenant settlement and the Red Court's Pens is inconsistent with his characterization. Either the zone field is wrong (he operates across zones) or the spawns are errors.

### `sparks_radio_repair` — Zone mismatch (see above)
Defined as `zone: 'the_scar'` but spawned in crossroads.ts.

---

## Part 5 — Dialogue Voice Consistency Issues

### Generic NPC dialogues that break voice consistency

Several generic NPCs have `vendorGreeting` and `vendorFarewell` lines that are interchangeable with any vendor in any faction:

- **`market_vendor_covenant`**: `vendorGreeting: "The Accord ensures fair pricing. Have a look at what I've got."` and `vendorFarewell: "Safe travels. Come back if you need anything."` — completely generic. Could be lifted word-for-word from any market NPC.

- **`quartermaster_okafor`**: `vendorGreeting: "The Accord ensures fair pricing. What are you looking for?"` — **identical opening clause** to `market_vendor_covenant`. This is a copy-paste that survived into production.

- **`accord_soldier`** and **`salter_guard`** in npcTopics.ts: Both have hollow response topics ("Threat classification: persistent, manageable, context-dependent. We have protocols.") that read as placeholder text rather than character voice.

### Named NPC topics that under-serve the character

- **`warlord_briggs` topic — 'strength'**: "Fear is a tool. Strength is using it correctly — knowing when to be feared and when to be something else." This is the least specific of Briggs's responses. The topic deserves a more concrete example — Briggs should reference a specific tactical decision, not an abstraction.

- **`elder_kai_nez` topic — 'outsider'**: "You're welcome until you're not. That moment comes faster than people think." This is the shortest named NPC topic in the file. Kai Nez has been established as someone who gives considered, specific answers. This is neither.

---

## Part 6 — Structural Issues

### Duplicate NPC entries for the same character
1. `marta_food_vendor` and `food_vendor_marta` — same character, two entries, same zone, both vendors
2. `dr_ama_osei` and `lucid_sanguine_osei` — same character, two entries, same zone, same faction

Both duplications will cause inconsistent behavior (double spawns or random-which-version encounters). The extra entries should be deleted and their room spawns consolidated.

### REVENANT_DIALOGUE with undefined NPCs
Three IDs in `REVENANT_DIALOGUE` have no corresponding `NPCS` entries: `wren_shelter`, `wren_ruins`, `old_mae`. The engine's `getRevenantDialogue()` function doesn't check for NPC existence — it only checks the dialogue registry. If the game shows cycle-aware dialogue through a talk command that also calls `getNPC()`, the undefined NPC will cause a runtime error.

---

## Quick Reference: Full Generic NPC List with Proposed Names

| ID | Current Name | Zone | Proposed Name | Personality Hook |
|---|---|---|---|---|
| `crossroads_gate_guard` | Gate Guard | crossroads | **Doyle** | Ex-deputy applying old procedures to new world |
| `checkpoint_arbiter` | Checkpoint Arbiter | covenant | **Sable** | Ex-paralegal, treats checkpoint like deposition |
| `food_vendor_generic` | Food Vendor | crossroads | **Solis** | Precise about what he'll cook given available ingredients |
| `components_vendor` | Components Vendor | crossroads | **Fuse** | Reclaimer who went market-side to get tools to people |
| `board_manager` | Board Manager | crossroads | **Nance** | Knows everyone's work history, heard every excuse |
| `campfire_storyteller` | Campfire Storyteller | crossroads | **Gavel** | Reputation across three settlements, known account of month-1 |
| `mysterious_stranger` | Stranger | crossroads | (intentional type) | May be orphaned — no room spawn found |
| `accord_sentry_river` | Accord Sentry | river_road | **Birch** | Knows every bend of this river road stretch |
| `fisher_npc` | Fisher | river_road | **Yael** | Meticulous water-level records, nobody asked them to |
| `traveling_merchant` | Traveling Merchant | river_road | **Oya** | 11-circuit veteran, irrationally proud of no lost cargo |
| `accord_militia` | Accord Militia | covenant | **Wicks** | Committed to procedure, will explain it in detail |
| `salters_soldier` | Salter Soldier | salt_creek | **Kane** | Seven years military, doubts she's not sharing |
| `kindling_faithful` | Kindling Faithful | the_ember | **Reese** | Went through the rite 18 months ago, still integrating |
| `reclaimer_technician` | Reclaimer Technician | the_stacks | **Priya** | Former librarian, now solder — considers it continuous |
| `bridge_keeper_generic` | Bridge Keeper | river_road | Resolve duplication with Howard | |
| `drifter_newcomer` | Newcomer | crossroads | (type is appropriate) | — |
| `wounded_drifter` | Wounded Drifter | crossroads | **Cass** | Name earned by "three people I came in with didn't" |
| `brig_guard` | Brig Guard | covenant | **Stern** | Has heard everything through cell bars, reacts to nothing |
| `jail_guard` | Jail Guard | covenant | Merge with brig_guard | |
| `market_vendor_covenant` | Market Vendor | covenant | **Prater** | Prices at "what I'd want to pay for it" — radical fairness |
| `accord_gate_militiaman` | Gate Militiaman | covenant | Merge with accord_militia | |
| `accord_square_patrol` | Accord Patrol | covenant | **Fen** | Walks the circuit twice a shift, knows which windows are dark too long |
| `accord_trail_marker` | Accord Scout | covenant | **Velez** | Always moving, always with a sealed report, always late |
| `accord_war_room_officer` | Accord Officer | covenant | **Cahill** | Senior, exhausted, everything goes through the duty officer |
| `east_wall_sentry` / `north_wall_sentry` / `south_wall_sentry` | Wall Sentries | covenant | Consolidate to two, differentiate | |
| `garden_keeper` | Garden Keeper | covenant | **Theo** | 18 months of composting work, knows the soil like a patient |
| `dusk_covenant_patrol` | Dusk Patrol | duskhollow | **Cress** | Sees in the dark, patrols with complete thoroughness |
| `kindling_gatekeeper` | Kindling Gatekeeper | the_ember | **Fallow** | Spiritual certainty is the only credential that matters here |
| `reclaimer_craftsperson` | Reclaimer Crafter | the_stacks | **Voss** | Workspace has its own logic, takes assessment requests seriously |
| `reclaimer_signal_tech` | Signal Technician | the_stacks | **Watt** | 17 meters of decoded content, has the technical breakdown |
| `pit_bookie` | Pit Bookie | salt_creek | **Odds** | Comfortable with violence-as-entertainment math |

---

## Priority Action List

| Priority | Issue | Action |
|---|---|---|
| 1 | BLOCKER-01: `wren_shelter` / `wren_ruins` undefined | Create definitions or remap REVENANT_DIALOGUE to `the_wren` |
| 2 | BLOCKER-02: `old_mae` undefined | Create NPC definition — she's written, just not defined |
| 3 | BLOCKER-03: `salter_perimeter_worker` undefined | Define or alias to existing NPC |
| 4 | BLOCKER-04: `duskhollow_child` undefined | Create minimal definition — high narrative potential |
| 5 | BLOCKER-05: `mess_hall_children` / `south_wall_children` undefined | Create minimal atmospheric definitions |
| 6 | Duplicate Marta entries | Delete `food_vendor_marta`, consolidate to `marta_food_vendor` |
| 7 | Duplicate Osei entries | Delete `lucid_sanguine_osei`, consolidate to `dr_ama_osei` |
| 8 | `camp_elder_rosa` zone spawn error | Remove from crossroads.ts spawn, ensure salt_creek.ts spawn |
| 9 | `medic_marsh` zone spawn in covenant + the_pens | Fix zone field or remove out-of-zone spawns |
| 10 | `quartermaster_okafor` copy-paste vendorGreeting | Write character-specific greeting |
| 11 | Name ~12 highest-traffic generic NPCs | Start with: Doyle, Nance, Gavel, Cutter's-zone vendors |
| 12 | Elder Kai Nez topic depth | Add 3-4 topics; he deserves a dialogue tree |
| 13 | Consolidate near-duplicate sentry/militia NPCs | Merge brig_guard + jail_guard; east/south wall sentries |
