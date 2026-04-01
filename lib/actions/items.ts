// ============================================================
// lib/actions/items.ts — handleTake, handleDrop, handleEquip, handleUse, handleStash
// ============================================================

import type { GameMessage, Room, Player, InventoryItem, ZoneType, ExplorationProgress } from '@/types/game'
import type { EngineCore } from './types'
import type { StashItem } from '@/types/game'
import {
  getInventory,
  addItem,
  removeItem,
  equipItem,
  unequipItem,
} from '@/lib/inventory'
import { updateRoomItems, updateRoomFlags } from '@/lib/world'
import { getItem } from '@/data/items'
import { createSupabaseBrowserClient } from '@/lib/supabase'
import { rt } from '@/lib/richText'
import { msg, systemMsg, errorMsg } from '@/lib/messages'
import { ALL_ROOMS } from '@/data/rooms/index'
import { ALL_NARRATIVE_KEYS } from '@/data/narrativeKeys/keys_by_zone'

// ------------------------------------------------------------
// Stash loader — reads player_stash rows and maps to StashItem[]
// ------------------------------------------------------------

async function loadStash(playerId: string): Promise<StashItem[]> {
  const supabase = createSupabaseBrowserClient()
  const { data: rows } = await supabase
    .from('player_stash')
    .select('*')
    .eq('player_id', playerId)

  return (rows ?? [])
    .map((row: { id: string; player_id: string; item_id: string; quantity: number }) => {
      const item = getItem(row.item_id)
      if (!item) return null
      return {
        id: row.id,
        playerId: row.player_id,
        itemId: row.item_id,
        item,
        quantity: row.quantity,
      }
    })
    .filter((si: StashItem | null): si is StashItem => si !== null)
}

// ------------------------------------------------------------
// Weight helpers
// ------------------------------------------------------------

function getCurrentWeight(inventory: InventoryItem[]): number {
  return inventory.reduce((sum, inv) => {
    const item = getItem(inv.itemId)
    return sum + (item?.weight ?? 0) * (inv.quantity ?? 1)
  }, 0)
}

function getMaxWeight(player: Player): number {
  return 50 + (player.vigor * 5)
}

// ------------------------------------------------------------
// Handlers
// ------------------------------------------------------------

export async function handleTake(engine: EngineCore, noun: string | undefined): Promise<void> {
  const { player, currentRoom } = engine.getState()
  if (!player || !currentRoom) return

  if (!noun) {
    engine._appendMessages([errorMsg('Take what?')])
    return
  }

  const nounLower = noun.toLowerCase()
  const itemId = currentRoom.items.find((id) => {
    const it = getItem(id)
    return it && it.name.toLowerCase().includes(nounLower)
  })

  if (!itemId) {
    engine._appendMessages([errorMsg(`You don't see that here.`)])
    return
  }

  const item = getItem(itemId)!

  // Weight check — refuse if carrying capacity would be exceeded
  const { inventory: currentInventory } = engine.getState()
  const currentWeight = getCurrentWeight(currentInventory)
  const maxWeight = getMaxWeight(player)
  const itemWeight = item.weight ?? 0

  if (currentWeight + itemWeight > maxWeight) {
    engine._appendMessages([errorMsg(`You can't carry any more (${currentWeight}/${maxWeight} lbs). Drop something first.`)])
    return
  }

  // Remove only the first occurrence (room may contain multiple copies of the same item)
  let removed = false
  const newItems = currentRoom.items.filter((id) => {
    if (!removed && id === itemId) {
      removed = true
      return false
    }
    return true
  })

  // Optimistic update
  const updatedRoom: Room = { ...currentRoom, items: newItems }
  engine._setState({ currentRoom: updatedRoom })

  engine._appendMessages([msg(`You pick up the ${rt.item(item.name)}.`, 'system')])

  // W-3: Record depletion for itemSpawns items so they don't immediately re-spawn
  const isSpawnedItem = currentRoom.itemSpawns?.some(e => e.entityId === itemId) ?? false
  const depletionUpdate = isSpawnedItem
    ? updateRoomFlags(currentRoom.id, player.id, {
        [`depleted_${itemId}`]: true,
        [`depleted_${itemId}_at`]: player.actionsTaken ?? 0,
      })
    : Promise.resolve()

  await Promise.all([
    addItem(player.id, itemId),
    updateRoomItems(currentRoom.id, player.id, newItems),
    depletionUpdate,
  ])

  // Update cached room flags if depletion was recorded
  if (isSpawnedItem) {
    engine._setState({
      currentRoom: {
        ...updatedRoom,
        flags: {
          ...updatedRoom.flags,
          [`depleted_${itemId}`]: true,
          [`depleted_${itemId}_at`]: player.actionsTaken ?? 0,
        },
      },
    })
  }

  const inventory = await getInventory(player.id)
  engine._setState({ inventory })

  // First weapon hint
  const hasOtherWeapons = inventory.filter(ii => ii.item.type === 'weapon' && ii.itemId !== itemId).length > 0
  if (item.type === 'weapon' && !hasOtherWeapons) {
    engine._appendMessages([systemMsg(`Hint: Type 'equip ${item.name.toLowerCase()}' to ready it for combat.`)])
  }
}

export async function handleDrop(engine: EngineCore, noun: string | undefined): Promise<void> {
  const { player, currentRoom, inventory } = engine.getState()
  if (!player || !currentRoom) return

  if (!noun) {
    engine._appendMessages([errorMsg('Drop what?')])
    return
  }

  const nounLower = noun.toLowerCase()
  const invItem = inventory.find((ii) =>
    ii.item.name.toLowerCase().includes(nounLower)
  )

  if (!invItem) {
    engine._appendMessages([errorMsg(`You don't have that.`)])
    return
  }

  if (invItem.item.type === 'key') {
    engine._appendMessages([errorMsg(`You can't drop the ${rt.item(invItem.item.name)}. It seems important.`)])
    return
  }

  const newItems = [...currentRoom.items, invItem.itemId]
  const updatedRoom: Room = { ...currentRoom, items: newItems }
  engine._setState({ currentRoom: updatedRoom })

  engine._appendMessages([msg(`You drop the ${rt.item(invItem.item.name)}.`, 'system')])

  await Promise.all([
    removeItem(player.id, invItem.itemId),
    updateRoomItems(currentRoom.id, player.id, newItems),
  ])

  const updatedInventory = await getInventory(player.id)
  engine._setState({ inventory: updatedInventory })
}

export async function handleEquip(engine: EngineCore, noun: string | undefined): Promise<void> {
  const { player, inventory } = engine.getState()
  if (!player) return

  if (!noun) {
    engine._appendMessages([errorMsg('Equip what?')])
    return
  }

  const nounLower = noun.toLowerCase()
  const invItem = inventory.find((ii) =>
    ii.item.name.toLowerCase().includes(nounLower)
  )

  if (!invItem) {
    engine._appendMessages([errorMsg(`You don't have that.`)])
    return
  }

  if (invItem.item.type !== 'weapon' && invItem.item.type !== 'armor') {
    engine._appendMessages([errorMsg(`You can't equip that.`)])
    return
  }

  await equipItem(player.id, invItem.itemId)
  const updatedInventory = await getInventory(player.id)
  engine._appendMessages([msg(`You equip the ${rt.item(invItem.item.name)}.`, 'system')])
  engine._setState({ inventory: updatedInventory })
}

export async function handleUnequip(engine: EngineCore, noun: string | undefined): Promise<void> {
  const { player, inventory } = engine.getState()
  if (!player) return

  if (!noun) {
    engine._appendMessages([errorMsg('Unequip what?')])
    return
  }

  const nounLower = noun.toLowerCase()
  const invItem = inventory.find((ii) =>
    ii.item.name.toLowerCase().includes(nounLower) && ii.equipped
  )

  if (!invItem) {
    engine._appendMessages([errorMsg(`That item is not equipped.`)])
    return
  }

  await unequipItem(player.id, invItem.itemId)
  const updatedInventory = await getInventory(player.id)
  engine._appendMessages([msg(`You remove the ${rt.item(invItem.item.name)}.`, 'system')])
  engine._setState({ inventory: updatedInventory })
}

export async function handleUse(engine: EngineCore, noun: string | undefined): Promise<void> {
  const { player, inventory } = engine.getState()
  if (!player) return

  if (!noun) {
    engine._appendMessages([errorMsg('Use what?')])
    return
  }

  const nounLower = noun.toLowerCase()
  const invItem = inventory.find((ii) =>
    ii.item.name.toLowerCase().includes(nounLower)
  )

  if (!invItem) {
    engine._appendMessages([errorMsg(`You don't have that.`)])
    return
  }

  // Lore items display their loreText when used
  if (invItem.item.type === 'lore') {
    if (invItem.item.loreText) {
      engine._appendMessages([
        msg(`You read the ${rt.item(invItem.item.name)}:`),
        msg(invItem.item.loreText),
      ])
    } else {
      engine._appendMessages([msg(`The ${rt.item(invItem.item.name)} is blank or illegible.`)])
    }
    return
  }

  if (invItem.item.type !== 'consumable') {
    engine._appendMessages([errorMsg(`You can't use the ${rt.item(invItem.item.name)} like that.`)])
    return
  }

  const healing = invItem.item.healing ?? 0
  const newHp = Math.min(player.maxHp, player.hp + healing)
  let updatedPlayer = { ...player, hp: newHp }

  const messages: GameMessage[] = []

  if (healing > 0) {
    messages.push(msg(`You use the ${rt.item(invItem.item.name)}. +${healing} HP. [${newHp}/${player.maxHp}]`, 'system'))
  }

  // Temporary stat bonuses — last 20 actions then expire automatically.
  if (invItem.item.statBonus) {
    const BUFF_DURATION = 20
    const bonusEntries = Object.entries(invItem.item.statBonus) as Array<[string, number]>
    const expiresAt = (player.actionsTaken ?? 0) + BUFF_DURATION
    const newBuffs: Array<{ stat: string; bonus: number; expiresAt: number }> = []
    for (const [stat, bonus] of bonusEntries) {
      const key = stat as keyof typeof updatedPlayer
      if (key in updatedPlayer && typeof updatedPlayer[key] === 'number') {
        updatedPlayer = { ...updatedPlayer, [key]: (updatedPlayer[key] as number) + bonus }
        newBuffs.push({ stat, bonus, expiresAt })
      }
    }
    const bonusDesc = bonusEntries.map(([s, v]) => `+${v} ${s}`).join(', ')
    messages.push(msg(`${invItem.item.useText ?? 'You feel different.'} [${bonusDesc} for ${BUFF_DURATION} actions]`, 'system'))

    // Register buffs on GameState so the dispatcher can expire them
    const currentBuffs = engine.getState().activeBuffs ?? []
    engine._setState({ activeBuffs: [...currentBuffs, ...newBuffs] })
  }

  if (messages.length === 0 && invItem.item.useText) {
    messages.push(msg(invItem.item.useText))
  }

  if (messages.length === 0) {
    messages.push(msg(`You use the ${rt.item(invItem.item.name)}.`, 'system'))
  }

  // Optimistic update
  engine._setState({ player: updatedPlayer })
  engine._appendMessages(messages)

  await removeItem(player.id, invItem.itemId)
  const updatedInventory = await getInventory(player.id)
  engine._setState({ inventory: updatedInventory })
  await engine._savePlayer()
}

export async function handleStash(engine: EngineCore, noun: string | undefined): Promise<void> {
  const { player, inventory } = engine.getState()
  if (!player) return

  if (!noun) {
    engine._appendMessages([errorMsg('Stash what?')])
    return
  }

  const nounLower = noun.toLowerCase()
  const invItem = inventory.find((ii) =>
    ii.item.name.toLowerCase().includes(nounLower)
  )

  if (!invItem) {
    engine._appendMessages([errorMsg(`You don't have that.`)])
    return
  }

  const supabase = createSupabaseBrowserClient()

  // Check stash capacity
  const { count } = await supabase
    .from('player_stash')
    .select('*', { count: 'exact', head: true })
    .eq('player_id', player.id)

  if ((count ?? 0) >= 20) {
    engine._appendMessages([errorMsg('Your stash is full (20/20). Unstash something first.')])
    return
  }

  // Check if item already in stash
  const { data: existing } = await supabase
    .from('player_stash')
    .select('*')
    .eq('player_id', player.id)
    .eq('item_id', invItem.itemId)
    .maybeSingle()

  if (existing) {
    const { error: stashError } = await supabase
      .from('player_stash')
      .update({ quantity: existing.quantity + 1 })
      .eq('id', existing.id)
    if (stashError) {
      engine._appendMessages([errorMsg(`Failed to stash item — please try again.`)])
      return
    }
  } else {
    const { error: stashError } = await supabase
      .from('player_stash')
      .insert({ player_id: player.id, item_id: invItem.itemId, quantity: 1 })
    if (stashError) {
      engine._appendMessages([errorMsg(`Failed to stash item — please try again.`)])
      return
    }
  }

  await removeItem(player.id, invItem.itemId)

  const item = invItem.item
  engine._appendMessages([systemMsg(`You stash the ${rt.item(item.name)}. It will survive your death.`)])

  const [updatedInventory, updatedStash] = await Promise.all([
    getInventory(player.id),
    loadStash(player.id),
  ])
  engine._setState({ inventory: updatedInventory, stash: updatedStash })
}

export async function handleUnstash(engine: EngineCore, noun: string | undefined): Promise<void> {
  const { player } = engine.getState()
  if (!player) return

  if (!noun) {
    engine._appendMessages([errorMsg('Unstash what?')])
    return
  }

  const supabase = createSupabaseBrowserClient()

  const { data: stashRows } = await supabase
    .from('player_stash')
    .select('*')
    .eq('player_id', player.id)

  const nounLower = noun.toLowerCase()
  const matchingRow = (stashRows ?? []).find((row: { item_id: string; quantity: number; id: string }) => {
    const item = getItem(row.item_id)
    return item && item.name.toLowerCase().includes(nounLower)
  })

  if (!matchingRow) {
    engine._appendMessages([errorMsg(`That's not in your stash.`)])
    return
  }

  const item = getItem(matchingRow.item_id)!

  if (matchingRow.quantity > 1) {
    const { error: unstashError } = await supabase
      .from('player_stash')
      .update({ quantity: matchingRow.quantity - 1 })
      .eq('id', matchingRow.id)
    if (unstashError) {
      engine._appendMessages([errorMsg(`Failed to retrieve item from stash — please try again.`)])
      return
    }
  } else {
    const { error: unstashError } = await supabase
      .from('player_stash')
      .delete()
      .eq('id', matchingRow.id)
    if (unstashError) {
      engine._appendMessages([errorMsg(`Failed to retrieve item from stash — please try again.`)])
      return
    }
  }

  await addItem(player.id, matchingRow.item_id)

  engine._appendMessages([systemMsg(`You retrieve the ${rt.item(item.name)} from your stash.`)])

  const [updatedInventory, updatedStash] = await Promise.all([
    getInventory(player.id),
    loadStash(player.id),
  ])
  engine._setState({ inventory: updatedInventory, stash: updatedStash })
}

export async function handleStashList(engine: EngineCore): Promise<void> {
  const { player } = engine.getState()
  if (!player) return

  const supabase = createSupabaseBrowserClient()

  const { data: stashRows } = await supabase
    .from('player_stash')
    .select('*')
    .eq('player_id', player.id)

  const rows = stashRows ?? []

  if (rows.length === 0) {
    engine._appendMessages([systemMsg('Your stash is empty.')])
    return
  }

  const lines: GameMessage[] = [systemMsg(`Stash (${rows.length}/20):`)]
  for (const row of rows as Array<{ item_id: string; quantity: number }>) {
    const item = getItem(row.item_id)
    const name = item?.name ?? row.item_id
    const qty = row.quantity > 1 ? ` x${row.quantity}` : ''
    lines.push(systemMsg(`  ${rt.item(name)}${qty}`))
  }

  engine._appendMessages(lines)
}

// ------------------------------------------------------------
// Read — display lore text from an inventory item
// ------------------------------------------------------------

export async function handleRead(engine: EngineCore, noun: string | undefined): Promise<void> {
  const { player, inventory } = engine.getState()
  if (!player) return

  if (!noun) {
    engine._appendMessages([errorMsg('Read what?')])
    return
  }

  const nounLower = noun.toLowerCase()
  const invItem = inventory.find((ii) =>
    ii.item.name.toLowerCase().includes(nounLower) ||
    ii.item.id.toLowerCase().includes(nounLower)
  )

  if (!invItem) {
    engine._appendMessages([errorMsg(`You don't have that to read.`)])
    return
  }

  if (invItem.item.type !== 'lore') {
    engine._appendMessages([errorMsg(`${rt.item(invItem.item.name)} isn't something you can read.`)])
    return
  }

  if (invItem.item.loreText) {
    engine._appendMessages([
      msg(`You read the ${rt.item(invItem.item.name)}:`),
      msg(invItem.item.loreText),
    ])
  } else {
    engine._appendMessages([msg(`The ${rt.item(invItem.item.name)} is blank or illegible.`)])
  }
}

// ------------------------------------------------------------
// Zone display names (for journal / exploration output)
// ------------------------------------------------------------

const ZONE_DISPLAY_NAMES: Record<ZoneType, string> = {
  crossroads: 'Crossroads',
  river_road: 'River Road',
  covenant: 'Covenant',
  salt_creek: 'Salt Creek',
  the_ember: 'The Ember',
  the_breaks: 'The Breaks',
  the_dust: 'The Dust',
  the_stacks: 'The Stacks',
  duskhollow: 'Duskhollow',
  the_deep: 'The Deep',
  the_pine_sea: 'The Pine Sea',
  the_scar: 'The Scar',
  the_pens: 'The Pens',
}

// ------------------------------------------------------------
// Exploration progress computation
// NOTE: section owned by Rider C — do not modify without contract
// ------------------------------------------------------------

export function computeExplorationProgress(
  discoveredRoomIds: string[],
  narrativeKeys: string[],
): ExplorationProgress {
  const visitedSet = new Set(discoveredRoomIds)

  // Count rooms per zone from static registry
  const zoneTotals = new Map<ZoneType, number>()
  const zoneVisited = new Map<ZoneType, number>()

  for (const room of ALL_ROOMS) {
    zoneTotals.set(room.zone, (zoneTotals.get(room.zone) ?? 0) + 1)
    if (visitedSet.has(room.id)) {
      zoneVisited.set(room.zone, (zoneVisited.get(room.zone) ?? 0) + 1)
    }
  }

  const zoneProgress: Partial<Record<ZoneType, { visited: number; total: number }>> = {}
  for (const [zone, total] of zoneTotals) {
    zoneProgress[zone] = {
      visited: zoneVisited.get(zone) ?? 0,
      total,
    }
  }

  return {
    roomsVisited: visitedSet.size,
    totalRooms: ALL_ROOMS.length,
    zoneProgress,
    narrativeKeysFound: narrativeKeys.length,
    totalNarrativeKeys: ALL_NARRATIVE_KEYS.length,
  }
}

// ------------------------------------------------------------
// Journal — exploration progress + lore items
// ------------------------------------------------------------

export async function handleJournal(engine: EngineCore): Promise<void> {
  const { player, inventory, ledger } = engine.getState()
  if (!player) return

  const lines: GameMessage[] = []

  // --- Exploration summary ---
  const discoveredRoomIds = ledger?.discoveredRoomIds ?? []
  const narrativeKeys = player.narrativeKeys ?? []
  const progress = computeExplorationProgress(discoveredRoomIds, narrativeKeys)

  const pct = progress.totalRooms > 0
    ? Math.floor((progress.roomsVisited / progress.totalRooms) * 100)
    : 0

  lines.push(systemMsg('EXPLORATION LOG'))
  lines.push(systemMsg(`  You have explored ${progress.roomsVisited}/${progress.totalRooms} rooms (${pct}%) of the known world.`))
  lines.push(systemMsg(''))

  // Zone breakdown — only show zones that have rooms
  const zoneEntries = Object.entries(progress.zoneProgress) as Array<[ZoneType, { visited: number; total: number }]>
  // Sort: visited zones first (descending by visited count), then unvisited
  zoneEntries.sort((a, b) => b[1].visited - a[1].visited)

  for (const [zone, { visited, total }] of zoneEntries) {
    const displayName = ZONE_DISPLAY_NAMES[zone] ?? zone
    const zonePct = total > 0 ? Math.floor((visited / total) * 100) : 0
    const marker = visited === 0 ? '  ' : visited === total ? '* ' : '  '
    lines.push(systemMsg(`${marker}${rt.keyword(displayName)}: ${visited}/${total} (${zonePct}%)`))
  }

  lines.push(systemMsg(''))

  // Narrative keys
  const keyPct = progress.totalNarrativeKeys > 0
    ? Math.floor((progress.narrativeKeysFound / progress.totalNarrativeKeys) * 100)
    : 0
  lines.push(systemMsg(`  ${progress.narrativeKeysFound}/${progress.totalNarrativeKeys} knowledge keys discovered (${keyPct}%).`))

  lines.push(systemMsg(''))

  // --- Lore items ---
  const loreItems = inventory.filter((ii) => ii.item.type === 'lore')

  if (loreItems.length > 0) {
    lines.push(systemMsg(`FIELD NOTES & DOCUMENTS (type 'read <name>' for full text):`))
    for (const ii of loreItems) {
      const preview = ii.item.loreText
        ? ii.item.loreText.length > 60
          ? ii.item.loreText.slice(0, 60) + '...'
          : ii.item.loreText
        : '(blank)'
      lines.push(systemMsg(`  - ${rt.item(ii.item.name)}: ${preview}`))
    }
  } else {
    lines.push(msg('Your satchel holds no written records.'))
  }

  // Store computed progress on game state for DataTab to read
  engine._setState({ explorationProgress: progress })

  engine._appendMessages(lines)
}
