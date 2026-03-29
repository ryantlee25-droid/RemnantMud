import { createSupabaseBrowserClient } from '@/lib/supabase'
import type { InventoryItem } from '@/types/game'
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
 * Equip an item. Sets equipped=true on the target row and
 * unequips all other rows of the same item type for this player.
 */
export async function equipItem(playerId: string, itemId: string): Promise<void> {
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

  // IDs of rows that are currently equipped with the same item type (excluding target)
  const toUnequip = rows
    .filter((r) => {
      if (r.item_id === itemId) return false
      const def = getItem(r.item_id)
      return def !== undefined && def.type === item.type && r.equipped
    })
    .map((r) => r.id)

  if (toUnequip.length > 0) {
    const { error: unequipError } = await supabase
      .from('player_inventory')
      .update({ equipped: false })
      .in('id', toUnequip)

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
}

/**
 * Unequip an item (set equipped=false).
 */
export async function unequipItem(playerId: string, itemId: string): Promise<void> {
  const supabase = createSupabaseBrowserClient()

  const { error } = await supabase
    .from('player_inventory')
    .update({ equipped: false })
    .eq('player_id', playerId)
    .eq('item_id', itemId)

  if (error) throw new Error(error.message)
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
