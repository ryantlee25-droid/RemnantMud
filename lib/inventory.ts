import { createSupabaseBrowserClient } from '@/lib/supabase'
import type { InventoryItem, Player } from '@/types/game'
import { getItem } from '@/data/items'

// ------------------------------------------------------------
// DB row shape returned by Supabase
// ------------------------------------------------------------

interface InventoryRow {
  id: string
  player_id: string
  item_id: string
  quantity: number
  equipped: boolean
}

// ------------------------------------------------------------
// Helpers
// ------------------------------------------------------------

/** Recompute maxHp from vigor using the canonical formula. */
function computeMaxHp(vigor: number): number {
  return 8 + (vigor - 2) * 2
}

/**
 * Apply an item's statBonus to a player (mutates in place).
 * If vigor changes, recomputes maxHp. Does NOT change current hp.
 */
function applyStatBonus(player: Player, bonus: Partial<Record<string, number>>, sign: 1 | -1): void {
  for (const [stat, delta] of Object.entries(bonus)) {
    if (delta === undefined) continue
    const key = stat as keyof Player
    const current = player[key]
    if (typeof current === 'number') {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      ;(player as any)[key] = current + sign * delta
    }
  }
  // Recompute maxHp if vigor changed
  player.maxHp = computeMaxHp(player.vigor)
}

function rowToInventoryItem(row: InventoryRow): InventoryItem | null {
  const item = getItem(row.item_id)
  if (item === undefined) return null
  return {
    id: row.id,
    playerId: row.player_id,
    itemId: row.item_id,
    item,
    quantity: row.quantity,
    equipped: row.equipped,
  }
}

// ------------------------------------------------------------
// Public API
// ------------------------------------------------------------

/**
 * Load the player's full inventory from the DB, resolving item definitions.
 * Rows whose item_id is not found in the item registry are silently dropped.
 */
export async function getInventory(playerId: string): Promise<InventoryItem[]> {
  const supabase = createSupabaseBrowserClient()

  const { data, error } = await supabase
    .from('player_inventory')
    .select('id, player_id, item_id, quantity, equipped')
    .eq('player_id', playerId)
    .order('item_id')

  if (error) throw new Error(error.message)

  const rows = (data ?? []) as InventoryRow[]
  return rows.flatMap((row) => {
    const item = rowToInventoryItem(row)
    return item !== null ? [item] : []
  })
}

/**
 * Add an item to the player's inventory.
 * If a row for (player_id, item_id) already exists, increment quantity.
 * Otherwise insert a new row.
 */
export async function addItem(
  playerId: string,
  itemId: string,
  quantity: number = 1,
): Promise<void> {
  const supabase = createSupabaseBrowserClient()

  // Check for an existing row
  const { data: existing, error: selectError } = await supabase
    .from('player_inventory')
    .select('id, quantity')
    .eq('player_id', playerId)
    .eq('item_id', itemId)
    .maybeSingle()

  if (selectError) throw new Error(selectError.message)

  if (existing !== null) {
    const { error: updateError } = await supabase
      .from('player_inventory')
      .update({ quantity: (existing as { quantity: number }).quantity + quantity })
      .eq('id', (existing as { id: string }).id)

    if (updateError) throw new Error(updateError.message)
  } else {
    const { error: insertError } = await supabase.from('player_inventory').insert({
      player_id: playerId,
      item_id: itemId,
      quantity,
      equipped: false,
    })

    if (insertError) {
      // Unique constraint violation (23505): a concurrent insert beat us — fall back to UPDATE
      if (insertError.code === '23505') {
        const { data: raceRow, error: raceSelectError } = await supabase
          .from('player_inventory')
          .select('id, quantity')
          .eq('player_id', playerId)
          .eq('item_id', itemId)
          .maybeSingle()

        if (raceSelectError) throw new Error(raceSelectError.message)
        if (raceRow !== null) {
          const row = raceRow as { id: string; quantity: number }
          const { error: retryUpdateError } = await supabase
            .from('player_inventory')
            .update({ quantity: row.quantity + quantity })
            .eq('id', row.id)

          if (retryUpdateError) throw new Error(retryUpdateError.message)
        }
      } else {
        throw new Error(insertError.message)
      }
    }
  }
}

/**
 * Remove an item from the player's inventory.
 * Decrements quantity by the given amount; deletes the row if quantity reaches 0.
 */
export async function removeItem(
  playerId: string,
  itemId: string,
  quantity: number = 1,
): Promise<void> {
  const supabase = createSupabaseBrowserClient()

  const { data: existing, error: selectError } = await supabase
    .from('player_inventory')
    .select('id, quantity')
    .eq('player_id', playerId)
    .eq('item_id', itemId)
    .maybeSingle()

  if (selectError) throw new Error(selectError.message)
  if (existing === null) return // nothing to remove

  const row = existing as { id: string; quantity: number }
  const newQuantity = row.quantity - quantity

  if (newQuantity <= 0) {
    const { error: deleteError } = await supabase
      .from('player_inventory')
      .delete()
      .eq('id', row.id)

    if (deleteError) throw new Error(deleteError.message)
  } else {
    const { error: updateError } = await supabase
      .from('player_inventory')
      .update({ quantity: newQuantity })
      .eq('id', row.id)

    if (updateError) throw new Error(updateError.message)
  }
}

/**
 * Equip an item. Sets equipped=true on the target row.
 *
 * For weapons: unequips all other equipped weapons (single-slot).
 * For armor: slot-aware (H6) — only conflicts with items in the same
 * armorSlot. Equipping a helmet does NOT unequip a chestpiece.
 * Items without armorSlot default to 'chest' for backward compat.
 * Updates player.equippedArmor{Slot} when player is provided.
 *
 * If a `player` object is provided, applies the item's statBonus deltas
 * (and reverses any bonus from the previously-equipped item in the same
 * slot). The player is mutated in place and returned. When `player` is
 * omitted the function behaves exactly as before (DB-only, returns void).
 */
export async function equipItem(playerId: string, itemId: string, player?: Player): Promise<Player | undefined> {
  const item = getItem(itemId)
  if (item === undefined) throw new Error(`Unknown item: ${itemId}`)

  const supabase = createSupabaseBrowserClient()

  // Fetch all rows for this player so we can find same-type items to unequip
  const { data: allRows, error: fetchError } = await supabase
    .from('player_inventory')
    .select('id, item_id, equipped')
    .eq('player_id', playerId)

  if (fetchError) throw new Error(fetchError.message)

  const rows = (allRows ?? []) as Array<{ id: string; item_id: string; equipped: boolean }>

  // ── Slot routing (H6) — determines which rows to unequip ──
  let toUnequipRows: Array<{ id: string; item_id: string; equipped: boolean }>

  if (item.type === 'armor') {
    // Armor: only unequip items in the same armor slot
    const targetSlot = item.armorSlot ?? 'chest'  // default for backward compat
    toUnequipRows = rows.filter((r) => {
      if (r.item_id === itemId) return false
      if (!r.equipped) return false
      const def = getItem(r.item_id)
      if (def === undefined || def.type !== 'armor') return false
      const defSlot = def.armorSlot ?? 'chest'
      return defSlot === targetSlot
    })

    // Update player slot field (slot routing happens BEFORE H4's stat-bonus apply)
    if (player !== undefined) {
      const targetRow = rows.find((r) => r.item_id === itemId)
      if (targetRow !== undefined) {
        const slotCapitalized = targetSlot.charAt(0).toUpperCase() + targetSlot.slice(1)
        const slotField = `equippedArmor${slotCapitalized}` as keyof Player
        // Clear old slot field for items being unequipped
        for (const row of toUnequipRows) {
          const oldSlotField = slotField  // same slot, so same field
          if ((player[oldSlotField] as string | undefined) === row.id) {
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            ;(player as any)[oldSlotField] = undefined
          }
        }
        // Set new slot field to the target row's inventory id
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        ;(player as any)[slotField] = targetRow.id
      }
    }
  } else {
    // Non-armor (weapons, etc.): unequip all other equipped items of the same type
    toUnequipRows = rows.filter((r) => {
      if (r.item_id === itemId) return false
      const def = getItem(r.item_id)
      return def !== undefined && def.type === item.type && r.equipped
    })
  }

  const toUnequipIds = toUnequipRows.map((r) => r.id)

  // Step 1: reverse old item's statBonus (if player provided) — H4's flow
  if (player !== undefined && toUnequipRows.length > 0) {
    for (const row of toUnequipRows) {
      const oldItem = getItem(row.item_id)
      if (oldItem?.statBonus) {
        applyStatBonus(player, oldItem.statBonus, -1)
      }
    }
  }

  if (toUnequipIds.length > 0) {
    const { error: unequipError } = await supabase
      .from('player_inventory')
      .update({ equipped: false })
      .in('id', toUnequipIds)

    if (unequipError) throw new Error(unequipError.message)
  }

  // Equip the target item — find its row UUID and update by id (not item_id)
  const targetRow = rows.find((r) => r.item_id === itemId)
  if (targetRow === undefined) throw new Error(`Item ${itemId} not found in inventory`)

  const { error: equipError } = await supabase
    .from('player_inventory')
    .update({ equipped: true })
    .eq('id', targetRow.id)

  if (equipError) throw new Error(equipError.message)

  // Step 2: apply new item's statBonus (if player provided) — H4's flow
  if (player !== undefined && item.statBonus) {
    applyStatBonus(player, item.statBonus, 1)
  }

  return player
}

/**
 * Unequip an item (set equipped=false).
 *
 * If a `player` object is provided, reverses the item's statBonus deltas.
 * Recomputes maxHp if vigor changed; clamps hp to maxHp if it dropped.
 * The player is mutated in place and returned. When `player` is omitted
 * the function behaves exactly as before (DB-only, returns void).
 */
export async function unequipItem(playerId: string, itemId: string, player?: Player): Promise<Player | undefined> {
  const supabase = createSupabaseBrowserClient()

  const { error } = await supabase
    .from('player_inventory')
    .update({ equipped: false })
    .eq('player_id', playerId)
    .eq('item_id', itemId)

  if (error) throw new Error(error.message)

  if (player !== undefined) {
    const item = getItem(itemId)
    if (item?.statBonus) {
      applyStatBonus(player, item.statBonus, -1)
      // Clamp hp if maxHp dropped below current hp
      if (player.hp > player.maxHp) {
        player.hp = player.maxHp
      }
    }
  }

  return player
}

/**
 * Get the currently equipped item of a given type ('weapon' or 'armor').
 * Returns null if nothing of that type is equipped.
 */
export async function getEquipped(
  playerId: string,
  type: 'weapon' | 'armor',
): Promise<InventoryItem | null> {
  const supabase = createSupabaseBrowserClient()

  const { data, error } = await supabase
    .from('player_inventory')
    .select('id, player_id, item_id, quantity, equipped')
    .eq('player_id', playerId)
    .eq('equipped', true)

  if (error) throw new Error(error.message)

  const rows = (data ?? []) as InventoryRow[]

  for (const row of rows) {
    const resolved = rowToInventoryItem(row)
    if (resolved !== null && resolved.item.type === type) {
      return resolved
    }
  }

  return null
}

// ------------------------------------------------------------
// Item stacking / display grouping (CONTRACT C2 — convoy remnant-ux-0329)
// ------------------------------------------------------------

export interface GroupedItem {
  itemId: string
  name: string
  count: number
  displayName: string  // pre-formatted: "Bandages x3" or "Bandages"
}

/**
 * Default stack format: "{Name} x{count}" for count > 1, or just "{Name}" for count === 1.
 * Canonical format per CONTRACT C2: single space before x, no parens, no brackets.
 * Examples: "Wild Herbs x3", "Bandages x5", "Pipe Wrench"
 */
export function defaultStackFormat(name: string, count: number): string {
  return count > 1 ? `${name} x${count}` : name
}

/**
 * Groups item IDs by type and returns sorted array for display.
 * Items with count === 1 return name only.
 * Items with count > 1 return "Name xN".
 *
 * @param itemIds - Array of item ID strings (may contain duplicates for stacked items)
 * @param format  - Optional custom formatter; defaults to defaultStackFormat
 * @returns       - Array of GroupedItem sorted alphabetically by name
 */
export function groupAndFormatItems(
  itemIds: string[],
  format: (name: string, count: number) => string = defaultStackFormat
): GroupedItem[] {
  // Count occurrences of each itemId
  const counts = new Map<string, number>()
  for (const id of itemIds) {
    counts.set(id, (counts.get(id) ?? 0) + 1)
  }

  // Build GroupedItem array (one entry per unique itemId, preserving first-seen order)
  const grouped: GroupedItem[] = []
  const seen = new Set<string>()

  for (const id of itemIds) {
    if (seen.has(id)) continue
    seen.add(id)

    const item = getItem(id)
    const name = item?.name ?? id
    const count = counts.get(id) ?? 1
    const displayName = format(name, count)

    grouped.push({ itemId: id, name, count, displayName })
  }

  // Sort alphabetically by name for stable display ordering
  grouped.sort((a, b) => a.name.localeCompare(b.name))

  return grouped
}
