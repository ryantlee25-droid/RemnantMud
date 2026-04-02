# Narrative Quality Audit — Items, Enemies, World Events
**Auditor**: Spectrum Howler (narrative review)
**Files reviewed**:
- `data/items.ts`
- `data/enemies.ts`
- `data/worldEvents/act1_events.ts`
- `data/worldEvents/act2_events.ts`
- `data/worldEvents/act3_events.ts`

---

## Executive Summary

The core named items, primary weapons, armor tier, and all enemy entries are excellent — distinctive, world-grounded, and consistently voice the post-apocalyptic tone. The enemies file has zero issues. The lore items are strong throughout. The problem is a two-tier system: the "scavenged goods" section (roughly lines 982–1395 in `items.ts`) was clearly written in a different pass and is dramatically weaker than everything around it. Seventeen items in that block have descriptions that are two sentences or fewer of pure utility, with no flavor. Several amount to tautologies. The world events are clean with one recurring structural weakness noted below.

**Severity scale**: Critical (blocks immersion), Moderate (noticeably flat), Minor (small improvement available)

---

## Section 1 — Items: Thin Descriptions / No Flavor Text

### CRITICAL: Items that are effectively placeholder descriptions

These items exist in the same file as entries like `leather_jacket` ("The road rash on the left shoulder is from asphalt, not teeth") and `ammo_22lr` ("The penny of the post-Collapse. Small, light, everywhere. Nobody respects them until they're the last thing you have"). Against that bar, the following are failures.

---

**`lighter_disposable`** (`id: lighter_disposable`)
> "A plastic lighter. Still has fluid."

Two sentences. Both factual. Zero character. This is a pickup in a post-apocalyptic world where a working lighter is a small miracle.

*Suggested rewrite*:
> "A yellow Bic, the logo mostly worn off. The flint still catches. Fire on demand is a luxury so ordinary it stopped feeling like one — until the world ended and you found out what you'd been taking for granted."

---

**`old_binoculars`** (`id: old_binoculars`)
> "Old binoculars. One lens cracked, the other still works."

This is the description restating the item name.

*Suggested rewrite*:
> "Porro-prism field glasses, one objective lens cracked in a starburst pattern that blurs the right half of everything you see. The left side still gives you eight-times magnification. Half a view is better than none, which is something you used to not have to say."

---

**`binoculars_intact`** (`id: binoculars_intact`)
> "Military-grade binoculars. Both lenses clear."

Three words of description followed by three words of condition. No voice, no world.

*Suggested rewrite*:
> "Military-spec 10x50s, rubber-armored and nitrogen-purged. The reticle is mil-dot. Someone used these professionally and either left them or lost them in a way that suggests they no longer needed them. The optics are clean. Whoever owned these cleaned them last."

---

**`can_opener_quality`** (`id: can_opener_quality`)
> "A good can opener. The kind that doesn't slip."

Nearly content-free.

*Suggested rewrite*:
> "A heavy-frame rotary can opener, the kind with a butterfly key and a broad drive wheel. Pre-Collapse OXO Good Grips, which means someone had an opinion about kitchen tools. In a world full of unlabeled cans, it's the most reliable instrument you own."

---

**`hand_tools_basic`** (`id: hand_tools_basic`)
> "Hammer, screwdriver, pliers. Basic tools. Useful."

The word "useful" doing no work. A flat declaration of utility.

*Suggested rewrite*:
> "A 16-oz claw hammer with a fiberglass handle, a flathead and a Phillips, and a pair of slip-joint pliers with worn grips. Nothing specialized. Everything necessary. The kind of kit that survived the Collapse in a million garages and is now worth more than most weapons."

---

**`gun_oil`** (`id: gun_oil`)
> "Gun oil. Keeps metal from rusting."

This is a Wikipedia definition.

*Suggested rewrite*:
> "Mil-comm TW25B in a small squeeze bottle, about half full. Keeps the action cycling when dust and debris want to stop it. The difference between a gun that fires and one that doesn't is usually maintenance, and this is the first part of maintenance."

---

**`salvaged_engine_part`** (`id: salvaged_engine_part`)
> "An engine component. Heavy and oily. Someone might want this."

The "someone might want this" is almost self-aware about how little effort went into this description.

*Suggested rewrite*:
> "A camshaft from what was probably a V8 — steel lobes, journal surfaces still bright beneath the grime. Dead weight to anyone without a working engine. To someone trying to keep a generator or a vehicle running, this is the difference between mobility and staying put."

---

**`mineral_sample`** (`id: mineral_sample`)
> "A rock sample. Labeled in faded pencil. Worth something to the right buyer."

The label is interesting. The description abandons it.

*Suggested rewrite*:
> "A fist-sized core sample in a labeled canvas bag — 'SJ-7 DEPTH 340M' in faded pencil. Geological survey material, pre-Collapse. The Reclaimers catalog everything that came out of the ground before the facilities went dark. Whether what's in this sample matters or not, they'll want to decide for themselves."

---

**`smooth_river_stone`** (`id: smooth_river_stone`)
> "A smooth river stone. Fits perfectly in the palm."

The stone has a companion — `river_stone_flat` — with a perfectly serviceable description: "Sometimes jokes are worth something." This one has nothing.

*Suggested rewrite*:
> "A basalt pebble, river-polished to an ellipse that fills the hand without effort. No practical use. You carry it because it is one of the few things in this world that the Collapse did not change, and sometimes that matters."

---

**`soap_bar`** (`id: soap_bar`)
> "A bar of soap. Mostly used. Still works."

Soap is a luxury item in a post-collapse setting. The description doesn't acknowledge this.

*Suggested rewrite*:
> "A bar of Ivory soap, worked down to a thin oval but still usable. Smells like something from before — a specific chemical sweetness that means clean, that means the world had hot running water. You use it carefully. You will use every sliver."

---

**`empty_water_bottle`** (`id: empty_water_bottle`)
> "A plastic bottle. Empty. Worth something to someone who's thirsty."

This is the worst offender in the file. "Worth something to someone who's thirsty" describes every item in existence.

*Suggested rewrite*:
> "A one-liter Nalgene, empty, lid still threaded on. Hard plastic that doesn't leach, doesn't crack. A clean vessel is hard to find — water you can carry is the basic unit of survival out here, and you can't carry it in your hands."

---

**`crafting_components`** (`id: crafting_components`)
> "Various small parts. Gears, wires, clips. Something useful in here."

Placeholder description.

*Suggested rewrite*:
> "A ziplock bag of salvaged hardware: brass gears from a clock movement, stripped wire segments, spring clips, a handful of machine screws in two sizes. The Reclaimers call this kind of bag a 'maybe kit.' You don't know what you'll need it for until you need it."

---

**`tinder_bundle`** (`id: tinder_bundle`)
> "Dry bark and grass, bound with twine. Lights fast."

Short enough to be a game UI tooltip rather than flavor text.

*Suggested rewrite*:
> "Cedar bark and dried cheatgrass, bound tight with a length of twine. Someone prepared this deliberately — the bark is shredded fine, the grass is bone-dry. A fire kit is only as good as its first stage, and this stage is good."

---

**`wild_herbs`** (`id: wild_herbs`)
> "A bundle of wild herbs. Medicinal or culinary — you're not sure which."

The uncertainty could be interesting. It isn't developed.

*Suggested rewrite*:
> "A bundled handful of dried plants — yarrow, maybe, and something with small pale flowers you can't name with certainty. Could be wound-packing material. Could be the base of a broth. Could be nothing useful at all. Knowledge of what the land offers is the kind of thing that died with the people who had it."

---

**`fishing_line_improvised`** (`id: fishing_line_improvised`)
> "A length of monofilament with a bent-hook lure."

Functional description. Zero voice.

*Suggested rewrite*:
> "Twenty feet of mono wrapped around a stick, with a bent nail hammered into a hook and a shred of red cloth lashed to it with thread. Ugly. Probably works. Whoever made this knew that fish don't care about the lure as much as the person fishing does."

---

**`ghost_sage_sprig`** (`id: ghost_sage_sprig`)
> "Ghost sage. Pale and aromatic. Used in Covenant purification rites."

The Covenant of Dusk connection makes this item worth more than this treatment.

*Suggested rewrite*:
> "A sprig of ghost sage — the pale variety that grows at elevation, aromatic and slightly bitter. The Covenant uses it in their purification ceremonies, burned or carried. Whether the rite means anything is a theological question. The sage smells like a high-country morning before everything changed. That alone has value."

---

### MODERATE: Items with functional but thin descriptions

These items have descriptions that technically work but don't rise to the standard of the file's best entries.

**`bandages_clean`**
> "Sterile bandages. Still in the wrapper."

Contrast with the named `bandages` item: "Better than nothing, which is the highest praise anything earns out here." The clean variant deserves similar voice.

**`first_aid_kit_basic`**
> "A red cross kit. Half the supplies are still inside."

The detail "half the supplies" is good. It could go further.

**`field_dressing`**
> "Field dressing. The kind you press into a wound with your palm."

The second sentence is strong. The first is the item name restated.

**`fresh_water_container`**
> "A container of clean water. Rare enough to be valuable."

"Rare enough to be valuable" describes almost everything in this game world. The `water_bottle_sealed` entry (earlier in the file) earns its water description: "You forgot how good that felt until the first time you had to think about it." This item is a shorter version of that same beat without the earned emotion.

**`dried_meat_strip`**
> "Salted and dried. Chewy. Better than nothing."

"Better than nothing" is the same phrase used in `bandages`. It's good once. It's a crutch twice. This food item needs its own note.

**`rebar_club`** (in the scavenged weapons section)
> "A length of rebar. Heavy. Blunt. Effective."

The primary weapon `pipe_wrench` gets: "Heavy enough to end an argument permanently." The rebar club gets three adjectives. It's a melee weapon. Give it a sentence.

---

### MINOR: Duplicate items with identical descriptions

**`canned_food` and `canned_food_random`** share identical IDs, names, descriptions, and use text. This appears to be a data duplication that should be resolved — one ID should either be removed or differentiated (different healing value, different use text, etc.). If they must coexist, at minimum give them distinguishing description text so the player experiences variety when finding "another can."

---

## Section 2 — Enemies: No Issues Found

All 15 enemy entries in `data/enemies.ts` meet or exceed the standard set by the best entries. Specific strengths:

- Every enemy is grounded in the CHARON-7 lore with biological specificity (`shuffler`: "grip memory without purpose"; `brute`: "large in a way humans aren't supposed to be")
- Flavor text pools are consistently 4-5 entries with variety in focus (movement, sound, behavior, psychological effect)
- The Deep variants (`hollow_brute_deep`, `hollow_remnant_deep`) show environmental adaptation that earns their existence as separate entries
- The `whisperer` and `hive_mother` descriptions use the tactical threat format without becoming stat sheets
- The `meridian_automated_turret` correctly avoids biological language and reads as mechanical in both tone and detail

No rewrites recommended for enemies.

---

## Section 3 — World Events: Structural Weakness (Telling vs. Showing)

The world events are mostly strong. The atmospheric specificity is high — the Hollow migration tracks, the creek running backward, the children hearing the ground hum at night. However, there is one recurrent structural issue: **several message pool entries use summary-level narration instead of scene-level immediacy**.

### Examples of telling instead of showing:

**`we_a1_10_hollow_behavior`** — second entry:
> "The stalkers near Duskhollow have stopped hunting in the afternoon. They're nocturnal now. Something changed their schedule."

"Something changed their schedule" is the player being told what to think about the information just delivered. The observation stands on its own. The editorial gloss weakens it.

*Trimmed*:
> "The stalkers near Duskhollow have stopped hunting in the afternoon. They're nocturnal now. A Reclaimer tracker has been watching for a week and has not seen them move in daylight once."

---

**`we_a2_10_hollow_pack`** — third entry:
> "The brute carcasses they've been finding: not territorial kills. Execution. One precise wound. Something is culling its own weak."

"Something is culling its own weak" tells the player the interpretation. The previous sentence ("One precise wound") already implies it. The telling deflates what would otherwise be a chilling detail.

*Trimmed*:
> "The brute carcasses they've been finding: not territorial kills. One precise wound, in the same location each time. Nothing feeds on them afterward."

---

**`we_a2_03_hollow_gates`** — third entry:
> "A screamer hit the River Road at the bridge checkpoint. Five people heard it. Two of them haven't spoken since."

This is close to perfect. The last sentence earns its place. Note for consistency: this is the level the other entries should target.

---

**`we_a3_09_sky_changes`** — second entry:
> "At noon, the sun is in the wrong place by eleven degrees. The Reclaimers are insisting it's an atmospheric effect. No one else believes them."

"No one else believes them" tells us the consensus reaction. Consider: "The Reclaimers are insisting it's an atmospheric effect and have stopped answering follow-up questions." Behavior reveals disbelief more than a statement of disbelief.

---

**`we_a3_05_swarm_building`** — second entry:
> "A Salter hunter counted over two hundred hollow in a single column. They weren't attacking anything. Just moving. Purposeful. Guided."

"Guided" is doing the interpretation that "a single column" and "just moving" already imply. The reader doesn't need to be told the conclusion.

*Trimmed*:
> "A Salter hunter counted over two hundred hollow in a single column. They weren't attacking anything. Just moving, maintaining spacing, at a walking pace that matched the lead element's."

---

### One setting-consistency note

**`we_a3_09_sky_changes`** — first entry:
> "The sky east of the Scar is wrong. Not weather — the light. It bends. Everyone who sees it stops walking."

This is excellent. It's the level the whole set should calibrate to. "It bends" does more work than three explanatory sentences.

---

## Section 4 — Setting Fit (Items/Enemies)

No items or enemies were found that break the post-apocalyptic Southwest setting. The geographic specificity (Animas River, Four Corners, high desert terrain) is consistent throughout. The CHARON-7 lore is internally coherent — the Hollow/Sanguine/Revenant distinction is maintained in descriptions without being over-explained.

One soft flag:

**`motel_bible`** (`id: motel_bible`)
> "A Gideons Bible. Someone crossed out the 23rd Psalm and wrote something else."

This is a good detail — but the description stops there. The player cannot see what was written unless a `loreText` field is added. Currently `motel_bible` has no `loreText` despite being type `'junk'` (meaning it's not readable). Either: (a) give it `usable: true` and add a `loreText` with the replacement text, or (b) change the description to not tease content the player cannot access: "A Gideons Bible. Someone has been writing in the margins for years. You don't have time to read it."

---

## Section 5 — Missing or Placeholder Descriptions

No items have empty string descriptions. No enemies have empty or placeholder descriptions. All lore items have `loreText` populated.

The closest to missing content is the `motel_bible` accessibility gap described above, and the duplicate `canned_food`/`canned_food_random` pair.

---

## Priority List for Fixes

| Priority | Item ID | Issue |
|----------|---------|-------|
| Critical | `empty_water_bottle` | Tautological description ("worth something to someone who's thirsty") |
| Critical | `lighter_disposable` | Two-sentence factual stub |
| Critical | `binoculars_intact` | Three-word description body |
| Critical | `gun_oil` | Wikipedia-level definition |
| High | `old_binoculars` | Restates item name |
| High | `can_opener_quality` | Content-free |
| High | `hand_tools_basic` | "Useful" does no work |
| High | `salvaged_engine_part` | Self-aware placeholder energy |
| High | `mineral_sample` | Abandons the interesting detail (the label) |
| High | `crafting_components` | Placeholder description |
| Medium | `smooth_river_stone` | Weak relative to `river_stone_flat` |
| Medium | `soap_bar` | Misses the post-collapse significance |
| Medium | `tinder_bundle` | UI tooltip quality |
| Medium | `wild_herbs` | Abandons interesting premise |
| Medium | `ghost_sage_sprig` | Undersells the Covenant connection |
| Medium | `fishing_line_improvised` | Functional but voiceless |
| Medium | `rebar_club` | Three adjectives for a melee weapon |
| Medium | `dried_meat_strip` | Reuses the "better than nothing" line |
| Low | `motel_bible` | Teases inaccessible content |
| Data | `canned_food_random` | Duplicate of `canned_food` — resolve or differentiate |
| World Event | `we_a1_10`, `we_a2_10`, `we_a3_05`, `we_a3_09` | Editorial "telling" in specific message pool entries |

---

## What's Working (Don't Change)

- All enemy descriptions and flavor text pools
- All named/crafted weapon and armor descriptions (`leather_jacket`, `kevlar_vest`, `silver_knife`, `machete`, `shotgun`, etc.)
- Currency item descriptions — the `.22 LR` entry in particular sets the economic tone perfectly
- All medical consumables in the primary section (`bandages`, `stim_shot`, `field_surgery_kit`, `sanguine_blood_vial`)
- All lore items — every single one, without exception, earns its word count
- World events at `we_a3_09` message 1, `we_a2_03` message 3, `we_a1_06`, and the entire `we_a1_09` environmental decay set
- The `motel_bible` core idea (needs lore access, not a rewrite)
- `scavenging_useful_bones` and `hollow_nest_salvage` (both fine — short but purposeful)
