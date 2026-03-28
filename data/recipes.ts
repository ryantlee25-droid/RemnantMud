// ============================================================
// The Remnant MUD — Crafting Recipes
// data/recipes.ts
// ============================================================
// Rider B: New file — do NOT modify existing files.
// Result item IDs with prefix `crafted_` are new items
// not yet in items.ts; Rider G will add them later.
// ============================================================

export interface Recipe {
  id: string
  name: string
  description: string
  components: { itemId: string; quantity: number }[]
  result: { itemId: string; quantity: number }
  skillCheck?: { skill: string; dc: number }
  discoveredBy?: string // quest flag that unlocks recipe knowledge
}

export const RECIPES: Record<string, Recipe> = {

  // ----------------------------------------------------------
  // Medical (4)
  // ----------------------------------------------------------

  field_dressing: {
    id: 'field_dressing',
    name: 'Field Dressing',
    description: 'Combine gauze with antiseptic to produce a proper field dressing — cleaned, sealed, ready. The difference between this and a bare wrap is the difference between a wound that closes and a wound that festers.',
    components: [
      { itemId: 'gauze', quantity: 2 },
      { itemId: 'antiseptic', quantity: 1 },
    ],
    result: { itemId: 'field_dressing', quantity: 1 },
    skillCheck: { skill: 'field_medicine', dc: 8 },
  },

  purified_antiseptic: {
    id: 'purified_antiseptic',
    name: 'Purified Antiseptic',
    description: 'Distill basic chemicals with clean water to produce a concentrated antiseptic solution — stronger, more stable, and less likely to cause secondary irritation. Reclaimers call this "useful chemistry." Shepherds call it essential.',
    components: [
      { itemId: 'chemicals_basic', quantity: 1 },
      { itemId: 'water_container_clean', quantity: 1 },
    ],
    result: { itemId: 'crafted_purified_antiseptic', quantity: 2 },
    skillCheck: { skill: 'field_medicine', dc: 10 },
  },

  combat_medkit: {
    id: 'combat_medkit',
    name: 'Combat Medkit',
    description: 'Bandages reinforced with pain tablets and a compression wrap — meant for use during or immediately after fighting, when you cannot stop to think and every second of unconsciousness is permanent. Crude. Effective. The Salters build these for their enforcers.',
    components: [
      { itemId: 'bandages', quantity: 2 },
      { itemId: 'pain_tabs', quantity: 1 },
    ],
    result: { itemId: 'crafted_combat_medkit', quantity: 1 },
    skillCheck: { skill: 'field_medicine', dc: 9 },
  },

  trauma_kit: {
    id: 'trauma_kit',
    name: 'Trauma Kit',
    description: 'A proper trauma package assembled from components: clean gauze, antiseptic, bandages, and antibiotics packaged together for catastrophic injury management. The kind of kit a field medic carries when they expect real casualties.',
    components: [
      { itemId: 'gauze', quantity: 2 },
      { itemId: 'bandages', quantity: 1 },
      { itemId: 'antiseptic', quantity: 1 },
      { itemId: 'antibiotics_single_dose', quantity: 1 },
    ],
    result: { itemId: 'crafted_trauma_kit', quantity: 1 },
    skillCheck: { skill: 'field_medicine', dc: 12 },
  },

  // ----------------------------------------------------------
  // Weapons / Munitions (4)
  // ----------------------------------------------------------

  improvised_trap: {
    id: 'improvised_trap',
    name: 'Improvised Trap',
    description: 'Scrap metal fashioned into a spring-loaded spike trap using wire coil as the tension mechanism. Set it in a doorway or on a trail and something will bleed for passing through. The Hollows don\'t watch their step. Ferals do. Travelers have stepped on Drifter traps before. Leave a marker if you have any conscience.',
    components: [
      { itemId: 'scrap_metal', quantity: 2 },
      { itemId: 'wire_coil', quantity: 1 },
    ],
    result: { itemId: 'crafted_improvised_trap', quantity: 2 },
    skillCheck: { skill: 'mechanics', dc: 9 },
  },

  reinforced_plate: {
    id: 'reinforced_plate',
    name: 'Reinforced Plate',
    description: 'Two pieces of scrap metal welded or bolted together to create a rigid armor panel. Rough but thick. Used as a component in heavier armor construction or as a standalone breastplate that stops the first hit with authority.',
    components: [
      { itemId: 'scrap_metal', quantity: 3 },
    ],
    result: { itemId: 'crafted_reinforced_plate', quantity: 1 },
    skillCheck: { skill: 'mechanics', dc: 8 },
  },

  pipe_weapon_improved: {
    id: 'pipe_weapon_improved',
    name: 'Improved Pipe Weapon',
    description: 'A salvaged firearm part grafted onto a reinforced scrap-metal chassis — a longer barrel, a better grip, some semblance of accuracy beyond "point and pray." Not military hardware. Better than nothing, which in this world is a category of its own.',
    components: [
      { itemId: 'salvaged_firearm_part', quantity: 1 },
      { itemId: 'scrap_metal', quantity: 2 },
    ],
    result: { itemId: 'crafted_pipe_weapon_improved', quantity: 1 },
    skillCheck: { skill: 'mechanics', dc: 11 },
  },

  incendiary_charge: {
    id: 'incendiary_charge',
    name: 'Incendiary Charge',
    description: 'Basic chemicals packed into a scrap-metal casing with a short fuse — a throwable incendiary device. The Kindling use these for their own purposes, which they do not discuss. The Salters stockpile them and call them "persuasion tools." The Ferals just like the fire.',
    components: [
      { itemId: 'chemicals_basic', quantity: 2 },
      { itemId: 'scrap_metal', quantity: 1 },
    ],
    result: { itemId: 'crafted_incendiary_charge', quantity: 1 },
    skillCheck: { skill: 'mechanics', dc: 12 },
  },

  // ----------------------------------------------------------
  // Utility (4)
  // ----------------------------------------------------------

  signal_booster: {
    id: 'signal_booster',
    name: 'Signal Booster',
    description: 'A directional antenna array built from electronics salvage and wire coil — wired together with enough precision to pull in faint broadcasts and triangulate transmission sources. The Reclaimers make better ones. This version finds the signal. What you do with it is your problem.',
    components: [
      { itemId: 'electronics_salvage', quantity: 2 },
      { itemId: 'wire_coil', quantity: 2 },
    ],
    result: { itemId: 'crafted_signal_booster', quantity: 1 },
    skillCheck: { skill: 'electronics', dc: 11 },
  },

  armor_patch: {
    id: 'armor_patch',
    name: 'Armor Patch',
    description: 'A scrap metal backer bonded to a leather patch kit reinforcement — a field repair kit for damaged plate or leather armor. Not a full restoration. Keeps the gear from getting worse before you can reach someone who knows what they\'re doing.',
    components: [
      { itemId: 'scrap_metal', quantity: 1 },
      { itemId: 'leather_patch_kit', quantity: 1 },
    ],
    result: { itemId: 'crafted_armor_patch', quantity: 2 },
    skillCheck: { skill: 'mechanics', dc: 8 },
  },

  chemical_light: {
    id: 'chemical_light',
    name: 'Chemical Light',
    description: 'A clean water container repurposed as a diffusion vessel for a basic chemical luminescence reaction — bleach oxidation with a scavenged indicator compound. Glows blue-green for approximately four hours. Completely silent. Doesn\'t attract Hollows the way fire does. Reclaimers figured this out in the first cycle. Everyone else learned from them.',
    components: [
      { itemId: 'chemicals_basic', quantity: 1 },
      { itemId: 'water_container_clean', quantity: 1 },
    ],
    result: { itemId: 'crafted_chemical_light', quantity: 3 },
    skillCheck: { skill: 'electronics', dc: 9 },
  },

  lockpick_set: {
    id: 'lockpick_set',
    name: 'Improvised Lockpick Set',
    description: 'Wire coil drawn to gauge and heat-bent into tension wrenches and picks using electronics salvage as a reference guide for standard pre-Collapse lock dimensions. Not elegant. Works on anything up to a Grade 3 deadbolt if you have patience. Drifters carry these. So do Wraiths who don\'t want to announce their presence with a boot.',
    components: [
      { itemId: 'wire_coil', quantity: 1 },
      { itemId: 'electronics_salvage', quantity: 1 },
    ],
    result: { itemId: 'crafted_lockpick_set', quantity: 1 },
    skillCheck: { skill: 'mechanics', dc: 10 },
  },

  // ----------------------------------------------------------
  // Advanced (3 — require quest flag discovery)
  // ----------------------------------------------------------

  antiviral_compound: {
    id: 'antiviral_compound',
    name: 'Antiviral Compound',
    description: 'A synthesized antiretroviral formulation built on an antibiotics base, modified using the R1 sequencing data found in the Stacks. It doesn\'t cure CHARON-7 infection. Nothing cures CHARON-7. But it extends the viable window before conversion and suppresses the early-stage neurological symptoms — long enough to get somewhere, do something, say goodbye. The Reclaimers have been trying to build this for three cycles.',
    components: [
      { itemId: 'antibiotics_01', quantity: 2 },
      { itemId: 'chemicals_basic', quantity: 1 },
    ],
    result: { itemId: 'crafted_antiviral_compound', quantity: 1 },
    skillCheck: { skill: 'field_medicine', dc: 15 },
    discoveredBy: 'found_r1_sequencing_data',
  },

  emp_device: {
    id: 'emp_device',
    name: 'EMP Device',
    description: 'An electromagnetic pulse device assembled from The Stacks blueprint — electronics salvage capacitor bank, salvaged firearm part as the discharge casing, and a scrap-metal housing. Single use. Kills electronics in a fifteen-meter radius instantly: MERIDIAN security panels, Salter comms gear, the kind of automated defense systems that don\'t need to see you to shoot you. The Reclaimers drew up this design. They are very careful about who they give the plans to.',
    components: [
      { itemId: 'electronics_salvage', quantity: 3 },
      { itemId: 'salvaged_firearm_part', quantity: 1 },
      { itemId: 'scrap_metal', quantity: 2 },
    ],
    result: { itemId: 'crafted_emp_device', quantity: 1 },
    skillCheck: { skill: 'electronics', dc: 14 },
    discoveredBy: 'stacks_blueprint_found',
  },

  fortified_armor: {
    id: 'fortified_armor',
    name: 'Fortified Armor',
    description: 'A kevlar vest reinforced with a crafted plate backing — the best of what pre-Collapse manufacturing produced married to what the wastes forced survivors to build. Heavier than either component alone. Stops more. The technique was worked out by a Salter armorer named Calloway who has since died and left no written instructions. The instructions are here now.',
    components: [
      { itemId: 'crafted_reinforced_plate', quantity: 1 },
      { itemId: 'kevlar_vest', quantity: 1 },
    ],
    result: { itemId: 'crafted_fortified_armor', quantity: 1 },
    skillCheck: { skill: 'mechanics', dc: 13 },
    discoveredBy: 'briggs_confessed_bombing',
  },
}

export function getRecipe(id: string): Recipe | undefined {
  return RECIPES[id]
}

export function getAllRecipes(): Recipe[] {
  return Object.values(RECIPES)
}

export function getAvailableRecipes(questFlags: Record<string, unknown>): Recipe[] {
  return getAllRecipes().filter(
    (r) => !r.discoveredBy || questFlags[r.discoveredBy]
  )
}
