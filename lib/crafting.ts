import { rollCheck } from '@/lib/dice'
import { getClassSkillBonus } from '@/lib/skillBonus'
import { getRecipe, getAvailableRecipes } from '@/data/recipes'
import type { Recipe } from '@/data/recipes'
import type { Player, SkillType } from '@/types/game'

export type { Recipe }

export interface CraftResult {
  success: boolean
  recipe: Recipe
  message: string
  itemProduced?: string  // item ID if successful
}

/**
 * Check whether all required components are present in the player's inventory.
 * Returns `possible: true` when nothing is missing, or a list of missing item IDs.
 */
export function canCraft(
  recipe: Recipe,
  inventoryItemIds: string[]
): { possible: boolean; missing: string[] } {
  const missing: string[] = []

  for (const comp of recipe.components) {
    const count = inventoryItemIds.filter(id => id === comp.itemId).length
    if (count < comp.quantity) {
      missing.push(comp.itemId)
    }
  }

  return { possible: missing.length === 0, missing }
}

// Recipe-specific success flavor text, keyed by recipe ID.
const CRAFT_SUCCESS_FLAVOR: Record<string, string> = {
  field_dressing: 'The gauze wraps clean. Antiseptic soaks through, sharp and clinical. A proper field dressing -- the kind that heals instead of just covering.',
  purified_antiseptic: 'The chemicals hiss as the solution clarifies. Clear liquid, sharp smell, stable compound. The difference between infection and recovery, measured out in capfuls.',
  combat_medkit: 'Compression bandages rolled tight, pain tabs sealed in foil, tourniquet tubing coiled and ready. The whole kit fits in your palm. Crude, effective, and built for the ten seconds when your life depends on not fumbling.',
  trauma_kit: 'Gauze, antiseptic, bandages, antibiotics -- each component checked, sealed, and arranged in order of use. The case latches shut with a click. Someone will owe their life to what is inside this box. Possibly you.',
  improvised_trap: 'The spring tension catches with a metallic snap. Teeth aligned, trigger set, pressure plate flush. It smells like rust and solder. Anything that steps on this deserves what happens next.',
  reinforced_plate: 'Metal on metal, eight bolts tightened until the edges warp. The plate is heavy and ugly and will stop the first thing that hits it. That is the only specification that matters.',
  pipe_weapon_improved: 'The receiver seats into the stock with a satisfying click. Barrel threaded, grip wrapped, action tested -- rack, chamber, release. The grouping will never be precise. It will be enough.',
  incendiary_charge: 'The accelerant is sealed inside the casing. The fuse is soaked and ready. The whole device fits in one hand and smells like a chemical burn waiting to happen. Handle with the respect it demands.',
  signal_booster: 'Copper wire wound tight, capacitors wired to the base, antenna mounted on the swivel bracket. You power it on and static fills the air -- then, underneath, the faint hum of signals you could not hear before. Something is broadcasting. Now you can find it.',
  armor_patch: 'Metal bonded to leather bonded to adhesive. Sixty seconds of pressure and the patch is set. Not elegant. Functional. The damaged section is reinforced and the gear lives to take another hit.',
  chemical_light: 'You seal the vessel and shake. The reaction starts -- blue-green light blooming through the liquid, cold and steady. Four hours of silent illumination. The darkness just became negotiable.',
  lockpick_set: 'Six picks, two wrenches, each piece filed to gauge and tested against a practice lock. The canvas roll ties shut with a cord. A quiet toolkit for quiet work.',
  antiviral_compound: 'The synthesis completes. Pale amber liquid in a glass vial, sealed with wax. You hold it up to the light. This is not a cure. It is time -- forty-eight hours, maybe seventy-two -- and in this world, time is the most valuable thing anyone can make.',
  emp_device: 'Capacitor bank charged, antenna coiled, trigger mechanism armed. The device hums at a frequency you feel in your teeth rather than hear. One pulse. Fifteen meters. Every electronic system in range dies. The Reclaimers built this design for a reason. You are holding that reason.',
  fortified_armor: 'Kevlar and steel, riveted and strapped and padded at the contact points. You lift it and the weight settles across your shoulders like a promise. This is the best protection the wastes can produce. Everything it stops is something you survive.',
}

// Skill-type-specific failure flavor text.
const CRAFT_FAIL_BY_SKILL: Record<string, string> = {
  field_medicine: 'Your hands slip at the critical step. The chemicals react wrong -- acrid smoke curls up from the ruined components, and the sharp smell of wasted antiseptic fills the air. The materials are gone. Next time, steadier hands.',
  mechanics: 'Metal grinds against metal at the wrong angle. Something snaps -- a tension bar, a weld joint, the part that was supposed to hold everything together. Scrap and wire, scattered and useless. The components are consumed. You will need more.',
  electronics: 'The solder bridge fails. A capacitor pops with a sound like a snapping finger, and thin smoke rises from the circuit that was supposed to carry the signal. Dead components, dead ends. The materials are spent.',
}

const CRAFT_FAIL_DEFAULT = 'The attempt fails. Components are consumed, the result is nothing but waste. You will need fresh materials to try again.'

/**
 * Attempt to craft a recipe.  If the recipe has a skill check, roll it using
 * the player's wits stat plus any class skill bonus.  On failure the components
 * are still consumed (caller is responsible for removing them from inventory).
 */
export function attemptCraft(player: Player, recipe: Recipe): CraftResult {
  if (recipe.skillCheck) {
    const skill = recipe.skillCheck.skill as SkillType
    const classSkillBonus = getClassSkillBonus(player.characterClass, skill)
    // Crafting checks are wits-governed; class bonus is additive on top.
    const effectiveStat = player.wits + classSkillBonus
    const check = rollCheck(effectiveStat, recipe.skillCheck.dc)

    if (!check.success) {
      const failMessage = CRAFT_FAIL_BY_SKILL[skill] ?? CRAFT_FAIL_DEFAULT
      return {
        success: false,
        recipe,
        message: failMessage,
      }
    }
  }

  const successFlavor = CRAFT_SUCCESS_FLAVOR[recipe.id]
    ?? `You successfully craft: ${recipe.name}.`

  return {
    success: true,
    recipe,
    message: successFlavor,
    itemProduced: recipe.result.itemId,
  }
}

/**
 * Return all recipes the player currently has access to, filtered by quest flags.
 */
export function listAvailableRecipes(questFlags: Record<string, string | boolean | number>): Recipe[] {
  return getAvailableRecipes(questFlags)
}

// Re-export for consumers that want recipe lookups without importing data directly.
export { getRecipe, getAvailableRecipes }
