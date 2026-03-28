// ============================================================
// lib/actions/trade.ts — handleTrade, handleBuy, handleSell
// NPC trading system using .22 LR rounds as currency
// ============================================================

import type { GameMessage } from '@/types/game'
import type { EngineCore } from './types'
import { getNPC } from '@/data/npcs'
import { getItem } from '@/data/items'
import { getInventory, addItem, removeItem } from '@/lib/inventory'
import { rt } from '@/lib/richText'
import { msg, systemMsg, errorMsg } from '@/lib/messages'

// ------------------------------------------------------------
// Currency helpers
// ------------------------------------------------------------

const CURRENCY_ITEM_ID = 'ammo_22lr'

/** Count how many .22 LR rounds the player has in inventory. */
function getPlayerCurrency(engine: EngineCore): number {
  const { inventory } = engine.getState()
  const currencyItem = inventory.find((ii) => ii.itemId === CURRENCY_ITEM_ID)
  return currencyItem?.quantity ?? 0
}

// ------------------------------------------------------------
// Find a trading NPC in the current room
// ------------------------------------------------------------

function findTradingNpc(engine: EngineCore, noun: string | undefined): { npcId: string; tradeInventory: string[] } | null {
  const { currentRoom } = engine.getState()
  if (!currentRoom) return null

  // Build a map of npcId -> tradeInventory from npcSpawns
  const tradeMap = new Map<string, string[]>()
  if (currentRoom.npcSpawns) {
    for (const spawn of currentRoom.npcSpawns) {
      if (spawn.tradeInventory && spawn.tradeInventory.length > 0) {
        tradeMap.set(spawn.npcId, spawn.tradeInventory)
      }
    }
  }

  // Filter to NPCs that are actually present in the room AND have trade inventory
  const tradingNpcIds = currentRoom.npcs.filter((id) => tradeMap.has(id))

  if (tradingNpcIds.length === 0) return null

  let npcId: string | undefined

  if (noun) {
    const nounLower = noun.toLowerCase()
    npcId = tradingNpcIds.find((id) => {
      const n = getNPC(id)
      if (!n) return false
      if (n.name.toLowerCase().includes(nounLower)) return true
      if (id.toLowerCase().includes(nounLower)) return true
      const rolledNpc = currentRoom.population?.npcs.find((rn) => rn.npcId === id)
      if (rolledNpc?.activity && rolledNpc.activity.toLowerCase().includes(nounLower)) return true
      if (n.faction && n.faction.toLowerCase().includes(nounLower)) return true
      return false
    })
  } else {
    // Default to first trading NPC
    npcId = tradingNpcIds[0]
  }

  if (!npcId) return null

  const tradeInventory = tradeMap.get(npcId)
  if (!tradeInventory) return null

  return { npcId, tradeInventory }
}

// ------------------------------------------------------------
// Handlers
// ------------------------------------------------------------

/**
 * Show the NPC's trade inventory with prices.
 * Usage: trade [npc name]
 */
export async function handleTrade(engine: EngineCore, noun: string | undefined): Promise<void> {
  const { currentRoom, player } = engine.getState()
  if (!currentRoom || !player) return

  const trader = findTradingNpc(engine, noun)
  if (!trader) {
    engine._appendMessages([errorMsg("There's no one here to trade with.")])
    return
  }

  const npc = getNPC(trader.npcId)
  const npcName = npc?.name ?? 'Trader'

  const lines: string[] = [`${rt.npc(npcName)}'s wares:`]

  for (const itemId of trader.tradeInventory) {
    const item = getItem(itemId)
    if (!item) continue
    lines.push(`  ${rt.item(item.name)} — ${rt.currency(`${item.value} rounds`)}`)
  }

  const playerRounds = getPlayerCurrency(engine)
  lines.push(`\nYou have ${rt.currency(`${playerRounds} .22 LR rounds`)}.`)
  lines.push(`Type "buy <item>" to purchase or "sell <item>" to sell.`)

  engine._appendMessages([systemMsg(lines.join('\n'))])
}

/**
 * Buy an item from a trading NPC.
 * Usage: buy <item name>
 */
export async function handleBuy(engine: EngineCore, noun: string | undefined): Promise<void> {
  const { currentRoom, player } = engine.getState()
  if (!currentRoom || !player) return

  if (!noun) {
    engine._appendMessages([errorMsg('Buy what? Try "trade" to see available items.')])
    return
  }

  const trader = findTradingNpc(engine, undefined)
  if (!trader) {
    engine._appendMessages([errorMsg("There's no one here to trade with.")])
    return
  }

  const nounLower = noun.toLowerCase()

  // Match item name against the NPC's trade inventory
  let matchedItemId: string | undefined
  for (const itemId of trader.tradeInventory) {
    const item = getItem(itemId)
    if (item && item.name.toLowerCase().includes(nounLower)) {
      matchedItemId = itemId
      break
    }
  }

  if (!matchedItemId) {
    const npc = getNPC(trader.npcId)
    const npcName = npc?.name ?? 'They'
    engine._appendMessages([errorMsg(`${rt.npc(npcName)} doesn't sell that. Type "trade" to see their wares.`)])
    return
  }

  const item = getItem(matchedItemId)!
  const price = item.value
  const playerRounds = getPlayerCurrency(engine)

  if (playerRounds < price) {
    engine._appendMessages([errorMsg(`You can't afford the ${rt.item(item.name)}. It costs ${rt.currency(`${price} rounds`)} and you have ${rt.currency(`${playerRounds}`)}.`)])
    return
  }

  // Deduct currency and add item
  await removeItem(player.id, CURRENCY_ITEM_ID, price)
  await addItem(player.id, matchedItemId)

  const inventory = await getInventory(player.id)
  engine._setState({ inventory })

  engine._appendMessages([msg(`You buy the ${rt.item(item.name)} for ${rt.currency(`${price} rounds`)}.`)])
}

/**
 * Sell an item to a trading NPC.
 * Usage: sell <item name>
 */
export async function handleSell(engine: EngineCore, noun: string | undefined): Promise<void> {
  const { currentRoom, player, inventory } = engine.getState()
  if (!currentRoom || !player) return

  if (!noun) {
    engine._appendMessages([errorMsg('Sell what?')])
    return
  }

  const trader = findTradingNpc(engine, undefined)
  if (!trader) {
    engine._appendMessages([errorMsg("There's no one here to trade with.")])
    return
  }

  const nounLower = noun.toLowerCase()
  const invItem = inventory.find((ii) =>
    ii.item.name.toLowerCase().includes(nounLower)
  )

  if (!invItem) {
    engine._appendMessages([errorMsg("You don't have that.")])
    return
  }

  if (invItem.item.type === 'key') {
    engine._appendMessages([errorMsg(`You can't sell the ${rt.item(invItem.item.name)}. It might be important.`)])
    return
  }

  // Don't allow selling currency itself
  if (invItem.itemId === CURRENCY_ITEM_ID) {
    engine._appendMessages([errorMsg("You can't sell rounds — they're currency.")])
    return
  }

  const sellPrice = Math.floor(invItem.item.value / 2)

  if (sellPrice <= 0) {
    engine._appendMessages([errorMsg(`The ${rt.item(invItem.item.name)} isn't worth anything to them.`)])
    return
  }

  // Remove item and add currency
  await removeItem(player.id, invItem.itemId)
  if (sellPrice > 0) {
    await addItem(player.id, CURRENCY_ITEM_ID, sellPrice)
  }

  const updatedInventory = await getInventory(player.id)
  engine._setState({ inventory: updatedInventory })

  engine._appendMessages([msg(`You sell the ${rt.item(invItem.item.name)} for ${rt.currency(`${sellPrice} rounds`)}.`)])
}
