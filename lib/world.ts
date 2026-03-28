// ============================================================
// world.ts — Room loading, navigation, and Supabase persistence
// ============================================================

import type { Room, Exit, Direction } from '@/types/game'
import { createSupabaseBrowserClient } from '@/lib/supabase'
import { ALL_ROOMS } from '@/data/rooms/index'

// ------------------------------------------------------------
// Module-level in-memory cache (per browser session)
// Key: roomId
// ------------------------------------------------------------

const MAX_CACHE_SIZE = 150

class LRUCache<K, V> {
  private map = new Map<K, V>()
  private maxSize: number

  constructor(maxSize: number) { this.maxSize = maxSize }

  get(key: K): V | undefined {
    if (!this.map.has(key)) return undefined
    // Move to end (most recently used)
    const val = this.map.get(key)!
    this.map.delete(key)
    this.map.set(key, val)
    return val
  }

  set(key: K, val: V): void {
    if (this.map.has(key)) this.map.delete(key)
    else if (this.map.size >= this.maxSize) {
      // Evict least recently used (first entry)
      this.map.delete(this.map.keys().next().value!)
    }
    this.map.set(key, val)
  }

  has(key: K): boolean { return this.map.has(key) }

  delete(key: K): void { this.map.delete(key) }

  clear(): void { this.map.clear() }

  get size(): number { return this.map.size }
}

const roomCache = new LRUCache<string, Room>(MAX_CACHE_SIZE)

// ------------------------------------------------------------
// Supabase row shape
// The `generated_rooms` table stores one row per (playerId, roomId).
// JSON columns: exits, items, enemies, npcs, flags
// ------------------------------------------------------------

interface WorldRoomRow {
  player_id: string
  id: string
  world_seed: number
  name: string
  description: string
  short_description: string
  exits: Record<string, string>
  items: string[]
  enemies: string[]
  npcs: string[]
  zone: string
  difficulty: number
  visited: boolean
  flags: Record<string, boolean | number>
}

function rowToRoom(row: WorldRoomRow): Room {
  // Merge DB-persisted state with the static room definition so that rich
  // fields (itemSpawns, npcSpawns, hollowEncounter, richExits, extras,
  // description variants, environmentalRolls, personalLossEchoes, etc.)
  // survive a page reload.  DB wins for mutable fields (visited, items,
  // enemies, npcs, flags).
  const staticDef = ALL_ROOMS.find(r => r.id === row.id)

  const base: Room = {
    id: row.id,
    name: row.name,
    description: row.description,
    shortDescription: row.short_description,
    exits: row.exits as Partial<Record<Direction, string>>,
    items: row.items,
    enemies: row.enemies,
    npcs: row.npcs,
    zone: row.zone as Room['zone'],
    difficulty: row.difficulty,
    visited: row.visited,
    flags: row.flags,
  }

  if (!staticDef) return base

  return {
    ...staticDef,  // all rich/static fields
    ...base,       // DB-persisted mutable fields overwrite
  }
}

// ------------------------------------------------------------
// persistWorld
// Upsert all generated rooms for a player into Supabase.
// Called once on new game creation.
// ------------------------------------------------------------

export async function persistWorld(
  rooms: Room[],
  playerId: string,
  seed: number,
): Promise<void> {
  const supabase = createSupabaseBrowserClient()

  const rows: WorldRoomRow[] = rooms.map((room) => ({
    player_id: playerId,
    id: room.id,
    world_seed: seed,
    name: room.name,
    description: room.description,
    short_description: room.shortDescription,
    exits: room.exits as Record<string, string>,
    items: room.items,
    enemies: room.enemies,
    npcs: room.npcs,
    zone: room.zone,
    difficulty: room.difficulty,
    visited: room.visited,
    flags: room.flags,
  }))

  // Batch upserts in chunks of 100 to avoid request size limits
  const CHUNK = 100
  for (let i = 0; i < rows.length; i += CHUNK) {
    const chunk = rows.slice(i, i + CHUNK)
    const { error } = await supabase
      .from('generated_rooms')
      .upsert(chunk, { onConflict: 'player_id,id' })
    if (error) {
      throw new Error(`Failed to persist world chunk ${i}–${i + chunk.length}: ${error.message}`)
    }
  }

  // Warm the cache
  for (const room of rooms) {
    roomCache.set(room.id, room)
  }
}

// ------------------------------------------------------------
// getRoom
// Load a single room. Returns cached value if available.
// ------------------------------------------------------------

export async function getRoom(roomId: string, playerId: string): Promise<Room | null> {
  const cached = roomCache.get(roomId)
  if (cached !== undefined) return cached

  const supabase = createSupabaseBrowserClient()

  const { data, error } = await supabase
    .from('generated_rooms')
    .select('*')
    .eq('player_id', playerId)
    .eq('id', roomId)
    .single()

  if (error) {
    if (error.code === 'PGRST116') {
      // No DB row — fall back to static world definition
      const staticRoom = getRoomDefinition(roomId)
      if (staticRoom) roomCache.set(roomId, staticRoom)
      return staticRoom
    }
    throw new Error(`getRoom failed for ${roomId}: ${error.message}`)
  }

  if (!data) {
    // Fall back to static world definition
    const staticRoom = getRoomDefinition(roomId)
    if (staticRoom) roomCache.set(roomId, staticRoom)
    return staticRoom
  }

  const room = rowToRoom(data as WorldRoomRow)
  roomCache.set(roomId, room)
  return room
}

// ------------------------------------------------------------
// getExits
// Return all exits as a Direction/roomId array.
// ------------------------------------------------------------

export function getExits(room: Room): Exit[] {
  const directions = Object.keys(room.exits) as Direction[]
  return directions.reduce<Exit[]>((acc, direction) => {
    const roomId = room.exits[direction]
    if (roomId !== undefined) {
      // Filter out hidden exits that haven't been discovered yet
      const richExit = room.richExits?.[direction]
      if (richExit?.hidden && !room.flags[`discovered_exit_${direction}`]) {
        return acc
      }
      acc.push({ direction, roomId })
    }
    return acc
  }, [])
}

// ------------------------------------------------------------
// canMove
// Return true if a move in the given direction is valid.
// Hidden exits require discovery before they can be traversed.
// ------------------------------------------------------------

export function canMove(room: Room, direction: string): boolean {
  const dir = direction as Direction
  if (room.exits[dir] === undefined) return false
  // Block hidden exits that haven't been discovered
  const richExit = room.richExits?.[dir]
  if (richExit?.hidden && !room.flags[`discovered_exit_${dir}`]) return false
  return true
}

// ------------------------------------------------------------
// markVisited
// Set visited = true in DB and update cache.
// ------------------------------------------------------------

export async function markVisited(roomId: string, playerId: string): Promise<void> {
  const supabase = createSupabaseBrowserClient()

  const { error } = await supabase
    .from('generated_rooms')
    .update({ visited: true })
    .eq('player_id', playerId)
    .eq('id', roomId)

  if (error) {
    throw new Error(`markVisited failed for ${roomId}: ${error.message}`)
  }

  const cached = roomCache.get(roomId)
  if (cached !== undefined) {
    roomCache.set(roomId, { ...cached, visited: true })
  }
}

// ------------------------------------------------------------
// updateRoomFlags
// Merge new flag values into existing flags in DB and cache.
// ------------------------------------------------------------

export async function updateRoomFlags(
  roomId: string,
  playerId: string,
  flags: Record<string, boolean | number>,
): Promise<void> {
  const supabase = createSupabaseBrowserClient()

  // Read current flags first so we can merge rather than overwrite
  const current = roomCache.get(roomId)
  let mergedFlags: Record<string, boolean | number>
  if (current) {
    mergedFlags = { ...current.flags, ...flags }
  } else {
    // Cache miss (e.g. after page reload) — fetch existing flags from DB
    const { data: existingRow, error: fetchError } = await supabase
      .from('generated_rooms')
      .select('flags')
      .eq('player_id', playerId)
      .eq('id', roomId)
      .single()
    if (fetchError) {
      throw new Error(`updateRoomFlags: failed to fetch existing flags for ${roomId}: ${fetchError.message}`)
    }
    const existingFlags = (existingRow as { flags: Record<string, boolean | number> } | null)?.flags ?? {}
    mergedFlags = { ...existingFlags, ...flags }
  }

  const { error } = await supabase
    .from('generated_rooms')
    .update({ flags: mergedFlags })
    .eq('player_id', playerId)
    .eq('id', roomId)

  if (error) {
    throw new Error(`updateRoomFlags failed for ${roomId}: ${error.message}`)
  }

  if (current !== undefined) {
    roomCache.set(roomId, { ...current, flags: mergedFlags })
  }
}

// ------------------------------------------------------------
// updateRoomItems
// Replace the items array in DB and cache.
// Called after the player takes or drops items.
// ------------------------------------------------------------

export async function updateRoomItems(
  roomId: string,
  playerId: string,
  items: string[],
): Promise<void> {
  const supabase = createSupabaseBrowserClient()

  const { error } = await supabase
    .from('generated_rooms')
    .update({ items })
    .eq('player_id', playerId)
    .eq('id', roomId)

  if (error) {
    throw new Error(`updateRoomItems failed for ${roomId}: ${error.message}`)
  }

  const cached = roomCache.get(roomId)
  if (cached !== undefined) {
    roomCache.set(roomId, { ...cached, items })
  }
}

// ------------------------------------------------------------
// clearRoomCache
// Discard all in-memory room data. Call on logout.
// ------------------------------------------------------------

export function clearRoomCache(): void {
  roomCache.clear()
}

// ------------------------------------------------------------
// getRoomDefinition
// Get a room from the static world definition (not from DB).
// Used for first-time room population and as fallback.
// ------------------------------------------------------------

export function getRoomDefinition(roomId: string): Room | null {
  return ALL_ROOMS.find(r => r.id === roomId) ?? null
}
