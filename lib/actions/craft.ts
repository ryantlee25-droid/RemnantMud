// ============================================================
// lib/actions/craft.ts — handleCraft
// ============================================================

import type { EngineCore } from './types'
import { msg, systemMsg, errorMsg } from '@/lib/messages'
import { getAvailableRecipes } from '@/data/recipes'
import { canCraft, attemptCraft } from '@/lib/crafting'
import { getItem } from '@/data/items'
import { removeItem, addItem, getInventory } from '@/lib/inventory'

export async function handleCraft(engine: EngineCore, noun: string | undefined): Promise<void> {
  const state = engine.getState()
  const { player, inventory } = state
  if (!player) return

  // "craft" with no args = list available recipes
  if (!noun) {
    const available = getAvailableRecipes(player.questFlags ?? {})
    if (available.length === 0) {
      engine._appendMessages([systemMsg("You don't know any recipes yet.")])
      return
    }
    const lines = available.map(r => {
      const components = r.components.map(c => {
        const item = getItem(c.itemId)
        return `${item?.name ?? c.itemId} x${c.quantity}`
      }).join(', ')
      return `  ${r.name} — needs: ${components}`
    })
    engine._appendMessages([
      systemMsg('Known recipes:'),
      ...lines.map(l => msg(l)),
    ])
    return
  }

  // Find recipe by name (partial match)
  const nounLower = noun.toLowerCase()
  const allRecipes = getAvailableRecipes(player.questFlags ?? {})
  const recipe = allRecipes.find(r => r.name.toLowerCase().includes(nounLower))
    ?? allRecipes.find(r => r.id.toLowerCase().includes(nounLower))

  if (!recipe) {
    engine._appendMessages([errorMsg(`You don't know how to craft that. Type 'craft' to see available recipes.`)])
    return
  }

  // Check components
  const inventoryItemIds = inventory.map(i => i.itemId)
  const { possible, missing } = canCraft(recipe, inventoryItemIds)

  if (!possible) {
    const missingNames = missing.map(id => getItem(id)?.name ?? id).join(', ')
    engine._appendMessages([errorMsg(`Missing components: ${missingNames}`)])
    return
  }

  // Attempt craft (may have skill check)
  const result = attemptCraft(player, recipe)

  // Consume components regardless of success
  for (const comp of recipe.components) {
    for (let i = 0; i < comp.quantity; i++) {
      const invItem = inventory.find(inv => inv.itemId === comp.itemId)
      if (invItem) {
        await removeItem(player.id, invItem.itemId)
      }
    }
  }

  if (result.success && result.itemProduced) {
    await addItem(player.id, result.itemProduced)
    const freshInv = await getInventory(player.id)
    engine._setState({ inventory: freshInv })
    engine._appendMessages([msg(result.message)])
  } else {
    const freshInv = await getInventory(player.id)
    engine._setState({ inventory: freshInv })
    engine._appendMessages([msg(result.message)])
  }
}
