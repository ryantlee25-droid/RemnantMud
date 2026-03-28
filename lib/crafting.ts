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
      return {
        success: false,
        recipe,
        message: `You attempt to craft ${recipe.name} but fail. The components are consumed.`,
      }
    }
  }

  return {
    success: true,
    recipe,
    message: `You successfully craft: ${recipe.name}.`,
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
