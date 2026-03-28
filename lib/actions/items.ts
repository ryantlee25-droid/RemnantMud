// ============================================================
// lib/actions/items.ts — handleTake, handleDrop, handleEquip, handleUse, handleStash
// ============================================================

import type { GameMessage, Room } from '@/types/game'
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
// Local message helpers
// ------------------------------------------------------------

function msg(text: string, type: GameMessage['type'] = 'narrative'): GameMessage {
  return { id: crypto.randomUUID(), text, type }
}

function systemMsg(text: string): GameMessage {
  return { id: crypto.randomUUID(), text, type: 'system' }
}

function errorMsg(text: string): GameMessage {
  return { id: crypto.randomUUID(), text, type: 'error' }
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
    await supabase
      .from('player_stash')
      .update({ quantity: existing.quantity + 1 })
      .eq('id', existing.id)
  } else {
    await supabase
      .from('player_stash')
      .insert({ player_id: player.id, item_id: invItem.itemId, quantity: 1 })
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
    await supabase
      .from('player_stash')
      .update({ quantity: matchingRow.quantity - 1 })
      .eq('id', matchingRow.id)
  } else {
    await supabase
      .from('player_stash')
      .delete()
      .eq('id', matchingRow.id)
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
// Journal — list all lore items in inventory
// ------------------------------------------------------------

export async function handleJournal(engine: EngineCore): Promise<void> {
  const { player, inventory } = engine.getState()
  if (!player) return

  const loreItems = inventory.filter((ii) => ii.item.type === 'lore')

  if (loreItems.length === 0) {
    engine._appendMessages([msg('Your satchel holds no written records.')])
    return
  }

  const lines: GameMessage[] = [
    systemMsg(`FIELD NOTES & DOCUMENTS (type 'read <name>' for full text):`),
  ]
  for (const ii of loreItems) {
    const preview = ii.item.loreText
      ? ii.item.loreText.length > 60
        ? ii.item.loreText.slice(0, 60) + '...'
        : ii.item.loreText
      : '(blank)'
    lines.push(systemMsg(`  - ${rt.item(ii.item.name)}: ${preview}`))
  }

  engine._appendMessages(lines)
}
