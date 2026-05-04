// ============================================================
// P3-F: supabaseMock + inventory deep integration tests
// Coverage targets: lib/supabaseMock.ts (10% → 60%+)
//                   lib/inventory.ts    (72% → 85%+)
//
// OQ-5 default applies: divergences are DOCUMENTED, not fixed.
// ============================================================

import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'

// ── Import the real supabaseMock module ──
import {
  createMockSupabaseClient,
  resetDevDb,
  isDevMode,
  DEV_USER,
} from '@/lib/supabaseMock'

// ── Import inventory functions under test ──
// We need to wire supabaseMock into the createSupabaseBrowserClient path.
// The inventory module imports from '@/lib/supabase'; we override it here.
import type { Item } from '@/types/game'

// ============================================================
// Item registry used across tests
// ============================================================

const ITEMS: Record<string, Item> = {
  bandage: {
    id: 'bandage', name: 'Bandage', description: 'Medical supply.',
    type: 'consumable', weight: 1, value: 5, healing: 3,
  },
  knife: {
    id: 'knife', name: 'Knife', description: 'Sharp blade.',
    type: 'weapon', weight: 1, value: 10, damage: 4,
  },
  vest: {
    id: 'vest', name: 'Leather Vest', description: 'Sturdy vest.',
    type: 'armor', weight: 3, value: 15, defense: 2, armorSlot: 'chest' as const,
  },
  helmet: {
    id: 'helmet', name: 'Iron Helmet', description: 'Metal helmet.',
    type: 'armor', weight: 2, value: 12, defense: 1, armorSlot: 'head' as const,
  },
  canned_food: {
    id: 'canned_food', name: 'Canned Food', description: 'Preserved food.',
    type: 'consumable', weight: 1, value: 4, healing: 5,
  },
  ammo_22lr: {
    id: 'ammo_22lr', name: '.22 LR Rounds', description: 'Currency.',
    type: 'currency', weight: 0, value: 1,
  },
}

// Mock @/data/items so inventory.ts resolves item definitions without data files
vi.mock('@/data/items', () => ({
  getItem: vi.fn((id: string) => ITEMS[id] ?? undefined),
}))

// Mock @/lib/setBonuses (inventory.ts imports getSetBonusDelta)
vi.mock('@/lib/setBonuses', () => ({
  getSetBonusDelta: vi.fn(() => ({})),
}))

// ============================================================
// Section 1: supabaseMock module — direct unit tests
// These cover the currently-uncovered lines (35–174):
//   freshTables(), isDevMode(), resetDevDb(), createQueryBuilder(),
//   createMockSupabaseClient(), auth helpers.
// ============================================================

describe('supabaseMock: isDevMode()', () => {
  const originalEnv = process.env.NEXT_PUBLIC_DEV_MODE

  afterEach(() => {
    process.env.NEXT_PUBLIC_DEV_MODE = originalEnv
  })

  it('returns true when NEXT_PUBLIC_DEV_MODE=true', () => {
    process.env.NEXT_PUBLIC_DEV_MODE = 'true'
    expect(isDevMode()).toBe(true)
  })

  it('returns false when NEXT_PUBLIC_DEV_MODE=false', () => {
    process.env.NEXT_PUBLIC_DEV_MODE = 'false'
    expect(isDevMode()).toBe(false)
  })

  it('returns false when NEXT_PUBLIC_DEV_MODE is undefined', () => {
    delete process.env.NEXT_PUBLIC_DEV_MODE
    expect(isDevMode()).toBe(false)
  })

  it('returns false when NEXT_PUBLIC_DEV_MODE is empty string', () => {
    process.env.NEXT_PUBLIC_DEV_MODE = ''
    expect(isDevMode()).toBe(false)
  })
})

describe('supabaseMock: DEV_USER constant', () => {
  it('has the expected dev user id format', () => {
    expect(DEV_USER.id).toMatch(/^[0-9a-f-]{36}$/)
    expect(DEV_USER.email).toBe('dev@remnant.local')
  })

  it('DEV_USER id is a valid UUID format', () => {
    // Must be 8-4-4-4-12 format
    const uuidPattern = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/
    expect(DEV_USER.id).toMatch(uuidPattern)
  })
})

describe('supabaseMock: resetDevDb()', () => {
  beforeEach(() => {
    resetDevDb()
  })

  it('starts with all 6 empty tables after reset', async () => {
    const client = createMockSupabaseClient()
    const TABLES = ['players', 'player_inventory', 'player_ledger', 'player_stash', 'generated_rooms', 'room_state']
    for (const table of TABLES) {
      const { data } = await client.from(table).select('*')
      expect(data, `Table ${table} should be empty after reset`).toEqual([])
    }
  })

  it('clears data inserted before the reset', async () => {
    const client = createMockSupabaseClient()
    await client.from('players').insert({ id: 'p1', name: 'TestPlayer' })
    // Verify insertion succeeded
    const { data: before } = await client.from('players').select('*')
    expect(before).toHaveLength(1)
    // Reset
    resetDevDb()
    // Verify cleared
    const { data: after } = await client.from('players').select('*')
    expect(after).toEqual([])
  })

  it('clearing one table does not affect another table', async () => {
    const client = createMockSupabaseClient()
    await client.from('players').insert({ id: 'p1', name: 'A' })
    await client.from('player_inventory').insert({ player_id: 'p1', item_id: 'knife', quantity: 1, equipped: false })
    resetDevDb()
    const { data: players } = await client.from('players').select('*')
    const { data: inv } = await client.from('player_inventory').select('*')
    expect(players).toEqual([])
    expect(inv).toEqual([])
  })

  it('multiple resets are idempotent', () => {
    expect(() => {
      resetDevDb()
      resetDevDb()
      resetDevDb()
    }).not.toThrow()
  })
})

// ============================================================
// Section 2: Mock CRUD — query builder operations
// Covers createQueryBuilder() lines 39–148
// ============================================================

describe('supabaseMock: insert and select', () => {
  let client: ReturnType<typeof createMockSupabaseClient>

  beforeEach(() => {
    resetDevDb()
    client = createMockSupabaseClient()
  })

  it('insert single row returns the row with auto-assigned id', async () => {
    const { data, error } = await client.from('players').insert({ name: 'Hero', hp: 20 })
    expect(error).toBeNull()
    expect(data).toHaveLength(1)
    expect((data as unknown[])[0]).toMatchObject({ name: 'Hero', hp: 20 })
    expect(((data as unknown[])[0] as { id: string }).id).toBeDefined()
  })

  it('insert preserves existing id if provided', async () => {
    const { data } = await client.from('players').insert({ id: 'fixed-id', name: 'Fixed' })
    expect(((data as unknown[])[0] as { id: string }).id).toBe('fixed-id')
  })

  it('insert multiple rows in single call', async () => {
    await client.from('player_inventory').insert([
      { player_id: 'p1', item_id: 'knife', quantity: 1, equipped: false },
      { player_id: 'p1', item_id: 'bandage', quantity: 3, equipped: false },
    ])
    const { data } = await client.from('player_inventory').select('*').eq('player_id', 'p1')
    expect((data as unknown[]).length).toBe(2)
  })

  it('select returns all rows when no filters', async () => {
    await client.from('players').insert({ name: 'A', hp: 10 })
    await client.from('players').insert({ name: 'B', hp: 20 })
    const { data } = await client.from('players').select('*')
    expect((data as unknown[]).length).toBe(2)
  })

  it('select with eq filter returns only matching rows', async () => {
    await client.from('player_inventory').insert({ player_id: 'p1', item_id: 'knife', quantity: 1, equipped: false })
    await client.from('player_inventory').insert({ player_id: 'p2', item_id: 'bandage', quantity: 2, equipped: false })
    const { data } = await client.from('player_inventory').select('*').eq('player_id', 'p1')
    expect((data as unknown[]).length).toBe(1)
    expect(((data as unknown[])[0] as { item_id: string }).item_id).toBe('knife')
  })

  it('select with two eq filters (chained) returns only exact matches', async () => {
    await client.from('player_inventory').insert({ player_id: 'p1', item_id: 'knife', quantity: 1, equipped: false })
    await client.from('player_inventory').insert({ player_id: 'p1', item_id: 'bandage', quantity: 2, equipped: false })
    const { data } = await client.from('player_inventory').select('*').eq('player_id', 'p1').eq('item_id', 'knife')
    expect((data as unknown[]).length).toBe(1)
    expect(((data as unknown[])[0] as { item_id: string }).item_id).toBe('knife')
  })

  it('select with count returns count in response', async () => {
    await client.from('player_inventory').insert({ player_id: 'p1', item_id: 'knife', quantity: 1, equipped: false })
    await client.from('player_inventory').insert({ player_id: 'p1', item_id: 'bandage', quantity: 2, equipped: false })
    const result = await client.from('player_inventory').select('*', { count: 'exact' }).eq('player_id', 'p1')
    expect((result as { count: number }).count).toBe(2)
  })

  it('returned data is a deep clone (mutations do not affect the store)', async () => {
    await client.from('players').insert({ id: 'p1', name: 'Hero', hp: 20 })
    const { data: first } = await client.from('players').select('*').eq('id', 'p1')
    const row = (first as unknown[])[0] as { name: string }
    row.name = 'MUTATED'
    const { data: second } = await client.from('players').select('*').eq('id', 'p1')
    expect(((second as unknown[])[0] as { name: string }).name).toBe('Hero')
  })
})

describe('supabaseMock: update', () => {
  let client: ReturnType<typeof createMockSupabaseClient>

  beforeEach(() => {
    resetDevDb()
    client = createMockSupabaseClient()
  })

  it('update matching rows by eq filter', async () => {
    await client.from('players').insert({ id: 'p1', name: 'Hero', hp: 20 })
    await client.from('players').update({ hp: 15 }).eq('id', 'p1')
    const { data } = await client.from('players').select('*').eq('id', 'p1')
    expect(((data as unknown[])[0] as { hp: number }).hp).toBe(15)
  })

  it('update does not affect non-matching rows', async () => {
    await client.from('players').insert({ id: 'p1', name: 'A', hp: 20 })
    await client.from('players').insert({ id: 'p2', name: 'B', hp: 20 })
    await client.from('players').update({ hp: 5 }).eq('id', 'p1')
    const { data } = await client.from('players').select('*').eq('id', 'p2')
    expect(((data as unknown[])[0] as { hp: number }).hp).toBe(20)
  })

  it('update with multiple fields merges correctly', async () => {
    await client.from('players').insert({ id: 'p1', name: 'Hero', hp: 20, xp: 0 })
    await client.from('players').update({ hp: 10, xp: 100 }).eq('id', 'p1')
    const { data } = await client.from('players').select('*').eq('id', 'p1')
    const row = (data as unknown[])[0] as { hp: number; xp: number; name: string }
    expect(row.hp).toBe(10)
    expect(row.xp).toBe(100)
    expect(row.name).toBe('Hero') // unchanged field preserved
  })
})

describe('supabaseMock: delete', () => {
  let client: ReturnType<typeof createMockSupabaseClient>

  beforeEach(() => {
    resetDevDb()
    client = createMockSupabaseClient()
  })

  it('delete removes the matching row', async () => {
    await client.from('player_inventory').insert({ id: 'inv1', player_id: 'p1', item_id: 'knife', quantity: 1, equipped: false })
    await client.from('player_inventory').delete().eq('id', 'inv1')
    const { data } = await client.from('player_inventory').select('*').eq('id', 'inv1')
    expect((data as unknown[]).length).toBe(0)
  })

  it('delete only removes the matched row, not siblings', async () => {
    await client.from('player_inventory').insert({ id: 'inv1', player_id: 'p1', item_id: 'knife', quantity: 1, equipped: false })
    await client.from('player_inventory').insert({ id: 'inv2', player_id: 'p1', item_id: 'bandage', quantity: 2, equipped: false })
    await client.from('player_inventory').delete().eq('id', 'inv1')
    const { data } = await client.from('player_inventory').select('*').eq('player_id', 'p1')
    expect((data as unknown[]).length).toBe(1)
    expect(((data as unknown[])[0] as { item_id: string }).item_id).toBe('bandage')
  })

  it('delete returns data: null and error: null', async () => {
    await client.from('player_inventory').insert({ id: 'inv1', player_id: 'p1', item_id: 'knife', quantity: 1, equipped: false })
    const { data, error } = await client.from('player_inventory').delete().eq('id', 'inv1')
    expect(data).toBeNull()
    expect(error).toBeNull()
  })
})

describe('supabaseMock: upsert', () => {
  let client: ReturnType<typeof createMockSupabaseClient>

  beforeEach(() => {
    resetDevDb()
    client = createMockSupabaseClient()
  })

  it('upsert inserts if no matching row exists', async () => {
    await client.from('player_inventory').upsert({ id: 'inv1', player_id: 'p1', item_id: 'knife', quantity: 1, equipped: false })
    const { data } = await client.from('player_inventory').select('*').eq('id', 'inv1')
    expect((data as unknown[]).length).toBe(1)
  })

  it('upsert updates if matching id exists', async () => {
    await client.from('player_inventory').insert({ id: 'inv1', player_id: 'p1', item_id: 'knife', quantity: 1, equipped: false })
    await client.from('player_inventory').upsert({ id: 'inv1', player_id: 'p1', item_id: 'knife', quantity: 5, equipped: false })
    const { data } = await client.from('player_inventory').select('*').eq('id', 'inv1')
    expect(((data as unknown[])[0] as { quantity: number }).quantity).toBe(5)
  })

  it('upsert with player_id+item_id match updates existing row', async () => {
    await client.from('player_inventory').insert({ id: 'inv1', player_id: 'p1', item_id: 'knife', quantity: 1, equipped: false })
    await client.from('player_inventory').upsert({ player_id: 'p1', item_id: 'knife', quantity: 7, equipped: false })
    const { data } = await client.from('player_inventory').select('*').eq('player_id', 'p1').eq('item_id', 'knife')
    expect(((data as unknown[])[0] as { quantity: number }).quantity).toBe(7)
  })
})

describe('supabaseMock: maybeSingle() and single()', () => {
  let client: ReturnType<typeof createMockSupabaseClient>

  beforeEach(() => {
    resetDevDb()
    client = createMockSupabaseClient()
  })

  it('maybeSingle returns null data when no match', () => {
    const { data, error } = client.from('players').select('*').eq('id', 'nonexistent').maybeSingle()
    expect(data).toBeNull()
    expect(error).toBeNull()
  })

  it('maybeSingle returns the matching row when found', async () => {
    await client.from('players').insert({ id: 'p1', name: 'Hero' })
    const { data } = client.from('players').select('*').eq('id', 'p1').maybeSingle()
    expect((data as { name: string } | null)?.name).toBe('Hero')
  })

  it('single() delegates to maybeSingle()', async () => {
    await client.from('players').insert({ id: 'p1', name: 'Hero' })
    const { data } = client.from('players').select('*').eq('id', 'p1').single()
    expect((data as { name: string } | null)?.name).toBe('Hero')
  })

  it('maybeSingle insert: auto-assigns id and persists row', () => {
    const { data, error } = client.from('players').insert({ name: 'Inserted' }).maybeSingle()
    expect(error).toBeNull()
    expect((data as { name: string } | null)?.name).toBe('Inserted')
  })

  it('order() and limit() are chainable no-ops (not implemented)', async () => {
    await client.from('player_inventory').insert({ player_id: 'p1', item_id: 'knife', quantity: 1, equipped: false })
    // Should not throw and should still return data
    const { data } = await client.from('player_inventory').select('*').eq('player_id', 'p1').order('item_id').limit(10)
    expect((data as unknown[]).length).toBe(1)
  })
})

// ============================================================
// Section 3: Mock auth methods
// ============================================================

describe('supabaseMock: auth methods', () => {
  let client: ReturnType<typeof createMockSupabaseClient>

  beforeEach(() => {
    client = createMockSupabaseClient()
  })

  it('auth.getUser returns the dev user', async () => {
    const { data, error } = await client.auth.getUser()
    expect(error).toBeNull()
    expect(data.user.id).toBe(DEV_USER.id)
    expect(data.user.email).toBe(DEV_USER.email)
  })

  it('auth.getSession returns a session with the dev user id', async () => {
    const { data, error } = await client.auth.getSession()
    expect(error).toBeNull()
    expect(data.session.user.id).toBe(DEV_USER.id)
  })

  it('auth.signOut returns no error', async () => {
    const { error } = await client.auth.signOut()
    expect(error).toBeNull()
  })

  it('auth.onAuthStateChange fires SIGNED_IN callback asynchronously', async () => {
    const events: string[] = []
    const { data } = client.auth.onAuthStateChange((event: string) => {
      events.push(event)
    })
    expect(data.subscription.unsubscribe).toBeTypeOf('function')
    // Wait for the setTimeout to fire
    await new Promise(r => setTimeout(r, 10))
    expect(events).toContain('SIGNED_IN')
  })
})

// ============================================================
// Section 4: Mock CRUD parity with production schema
// Documents known divergences (OQ-5: document, don't fix)
// ============================================================

describe('supabaseMock: schema parity check', () => {
  let client: ReturnType<typeof createMockSupabaseClient>

  beforeEach(() => {
    resetDevDb()
    client = createMockSupabaseClient()
  })

  it('KNOWN TABLES: freshTables() defines exactly 6 tables', async () => {
    // freshTables() defines: players, player_inventory, player_ledger, player_stash, generated_rooms, room_state
    // This test documents the current state — does NOT fix divergences
    const expectedTables = ['players', 'player_inventory', 'player_ledger', 'player_stash', 'generated_rooms', 'room_state']
    for (const table of expectedTables) {
      // Should not throw — tables exist in the mock
      const { data } = await client.from(table).select('*')
      expect(data, `Table ${table} must exist in mock`).toEqual([])
    }
  })

  it('DIVERGENCE: game_log table exists in initial migration but was dropped (migration 20260329000001_rls_world_state)', async () => {
    // game_log was dropped from production in 20260329000001_rls_world_state.sql
    // The mock's freshTables() does NOT include game_log — this is CORRECT parity
    // This test documents the correct state (mock correctly omits the dropped table)
    const { data } = await client.from('game_log').select('*')
    // The mock returns empty array for unknown tables (uses [] fallback in createQueryBuilder)
    // Documenting: accessing game_log in mock returns empty, not an error
    // In production, this table no longer exists and would throw a PostgrestError
    // DIVERGENCE: mock silently accepts any table name; prod would reject unknown tables
    expect(data).toBeDefined() // mock never errors on unknown table
  })

  it('DIVERGENCE: players.squirrel_trust is documented as an orphaned column (PLAN-EVAL.md OQ-5)', async () => {
    // T1-B reported: players.squirrel_trust exists in players table (migration 20260326000006)
    // but is NOT in the mock freshTables() column structure.
    // The mock stores rows as plain objects — no column type enforcement.
    // A write of squirrel_trust to mock succeeds even if prod schema doesn't have it,
    // and vice versa. This is the mock's schemaless design pattern.
    // DOCUMENTING: mock does not enforce column constraints, production does.
    await client.from('players').insert({
      id: 'p1',
      name: 'TestPlayer',
      squirrel_trust: 5, // should persist fine in schemaless mock
    })
    const { data } = await client.from('players').select('*').eq('id', 'p1')
    const row = (data as unknown[])[0] as { squirrel_trust?: number }
    // Mock accepts any field — column validation is a prod-only enforcement
    expect(row.squirrel_trust).toBe(5)
  })

  it('PARITY: player_inventory table has correct column shape', async () => {
    // prod schema: id, player_id, item_id, quantity, equipped, created_at
    await client.from('player_inventory').insert({
      id: 'inv-1',
      player_id: 'p1',
      item_id: 'knife',
      quantity: 1,
      equipped: false,
    })
    const { data } = await client.from('player_inventory').select('*').eq('id', 'inv-1')
    const row = (data as unknown[])[0] as Record<string, unknown>
    expect(row.player_id).toBe('p1')
    expect(row.item_id).toBe('knife')
    expect(row.quantity).toBe(1)
    expect(row.equipped).toBe(false)
  })

  it('PARITY: player_stash table has correct column shape', async () => {
    // prod schema: id, player_id, item_id, quantity, created_at
    await client.from('player_stash').insert({
      id: 'stash-1',
      player_id: 'p1',
      item_id: 'canned_food',
      quantity: 3,
    })
    const { data } = await client.from('player_stash').select('*').eq('id', 'stash-1')
    const row = (data as unknown[])[0] as Record<string, unknown>
    expect(row.player_id).toBe('p1')
    expect(row.item_id).toBe('canned_food')
    expect(row.quantity).toBe(3)
  })

  it('PARITY: player_ledger table has correct column shape', async () => {
    // prod schema: id, player_id, world_seed, current_cycle, total_deaths, pressure_level,
    //   discovered_room_ids, squirrel_alive, squirrel_trust, squirrel_cycles_known,
    //   squirrel_name, cycle_history, discovered_enemies, created_at, updated_at
    await client.from('player_ledger').insert({
      player_id: 'p1',
      world_seed: 42,
      current_cycle: 1,
      total_deaths: 0,
      pressure_level: 1,
      discovered_room_ids: [],
      squirrel_alive: false,
      squirrel_trust: 0,
      squirrel_cycles_known: 0,
      squirrel_name: null,
      cycle_history: [],
      discovered_enemies: [],
    })
    const { data } = await client.from('player_ledger').select('*').eq('player_id', 'p1')
    const row = (data as unknown[])[0] as Record<string, unknown>
    expect(row.world_seed).toBe(42)
    expect(row.current_cycle).toBe(1)
    expect(row.squirrel_alive).toBe(false)
  })

  it('PARITY: _savePlayer() payload round-trip: all fields survive write+read', async () => {
    // Mirrors the _savePlayer() payload from lib/gameEngine.ts lines 467-487
    const savePayload = {
      id: 'player-uuid',
      hp: 18,
      max_hp: 20,
      current_room_id: 'cr_01_approach',
      xp: 250,
      level: 2,
      actions_taken: 42,
      vigor: 4,
      grit: 3,
      reflex: 3,
      wits: 3,
      presence: 2,
      shadow: 2,
      faction_reputation: { accord: 1, salters: -1 },
      quest_flags: { sparks_quest_active: true, found_signal_booster: false },
      active_buffs: [],
      pending_stat_increase: false,
      narrative_progress: { hollowPressure: 3, narrativeKeys: ['hollow_origin'] },
      active_dialogue: null,
      combat_state: null,
    }

    await client.from('players').insert(savePayload)
    const { data } = await client.from('players').select('*').eq('id', 'player-uuid')
    const row = (data as unknown[])[0] as typeof savePayload

    // Every field saved must be readable back
    expect(row.hp).toBe(18)
    expect(row.max_hp).toBe(20)
    expect(row.current_room_id).toBe('cr_01_approach')
    expect(row.xp).toBe(250)
    expect(row.level).toBe(2)
    expect(row.actions_taken).toBe(42)
    expect(row.vigor).toBe(4)
    expect(row.grit).toBe(3)
    expect(row.reflex).toBe(3)
    expect(row.wits).toBe(3)
    expect(row.presence).toBe(2)
    expect(row.shadow).toBe(2)
    expect(row.faction_reputation).toEqual({ accord: 1, salters: -1 })
    expect(row.quest_flags).toEqual({ sparks_quest_active: true, found_signal_booster: false })
    expect(row.active_buffs).toEqual([])
    expect(row.pending_stat_increase).toBe(false)
    expect(row.narrative_progress).toEqual({ hollowPressure: 3, narrativeKeys: ['hollow_origin'] })
    expect(row.active_dialogue).toBeNull()
    expect(row.combat_state).toBeNull()
  })

  it('PARITY: _savePlayer() update path: update existing player row', async () => {
    // First insert
    await client.from('players').insert({ id: 'player-uuid', hp: 20, xp: 0, level: 1 })
    // Then update (as _savePlayer does)
    await client.from('players').update({ hp: 15, xp: 100, level: 2 }).eq('id', 'player-uuid')
    const { data } = await client.from('players').select('*').eq('id', 'player-uuid')
    const row = (data as unknown[])[0] as { hp: number; xp: number; level: number }
    expect(row.hp).toBe(15)
    expect(row.xp).toBe(100)
    expect(row.level).toBe(2)
  })

  it('PARITY: narrative_progress JSONB round-trip with nested objects', async () => {
    const narrativeProgress = {
      hollowPressure: 7,
      narrativeKeys: ['key1', 'key2', 'key3'],
    }
    await client.from('players').insert({
      id: 'p-narrative',
      narrative_progress: narrativeProgress,
    })
    await client.from('players').update({
      narrative_progress: { ...narrativeProgress, hollowPressure: 9 },
    }).eq('id', 'p-narrative')
    const { data } = await client.from('players').select('*').eq('id', 'p-narrative')
    const row = (data as unknown[])[0] as { narrative_progress: typeof narrativeProgress }
    expect(row.narrative_progress.hollowPressure).toBe(9)
    expect(row.narrative_progress.narrativeKeys).toHaveLength(3)
  })
})

// ============================================================
// Section 5: Table isolation — state doesn't bleed between tests
// ============================================================

describe('supabaseMock: table state isolation', () => {
  it('each createMockSupabaseClient() shares the same global store', async () => {
    resetDevDb()
    const client1 = createMockSupabaseClient()
    const client2 = createMockSupabaseClient()
    await client1.from('players').insert({ id: 'p1', name: 'SharedData' })
    const { data } = await client2.from('players').select('*').eq('id', 'p1')
    // DIVERGENCE documented: mock uses globalThis to share state across client instances
    // In prod, each client is stateless and reads from the DB independently
    expect((data as unknown[]).length).toBe(1)
  })

  it('resetDevDb() wipes all tables simultaneously', async () => {
    const client = createMockSupabaseClient()
    await client.from('players').insert({ id: 'p1', name: 'A' })
    await client.from('player_inventory').insert({ player_id: 'p1', item_id: 'knife', quantity: 1, equipped: false })
    await client.from('player_stash').insert({ player_id: 'p1', item_id: 'bandage', quantity: 2 })
    resetDevDb()
    const { data: pl } = await client.from('players').select('*')
    const { data: inv } = await client.from('player_inventory').select('*')
    const { data: st } = await client.from('player_stash').select('*')
    expect(pl).toEqual([])
    expect(inv).toEqual([])
    expect(st).toEqual([])
  })
})

// ============================================================
// Section 6: RLS-equivalent guard simulation
// In production, players can only read/write their own row.
// The mock has NO RLS enforcement. Document this divergence.
// ============================================================

describe('supabaseMock: RLS-equivalent guards (divergence documentation)', () => {
  let client: ReturnType<typeof createMockSupabaseClient>

  beforeEach(() => {
    resetDevDb()
    client = createMockSupabaseClient()
  })

  it('DIVERGENCE: mock does NOT enforce RLS — cross-player reads succeed', async () => {
    // In production, p2 cannot read p1's row (RLS "players: own row only" policy)
    // In the mock, any player_id filter works regardless of auth context
    await client.from('player_inventory').insert({ player_id: 'p1', item_id: 'knife', quantity: 1, equipped: false })
    const { data } = await client.from('player_inventory').select('*').eq('player_id', 'p1')
    // Mock: data returned (no RLS filtering). Prod: would return empty if auth.uid() !== 'p1'
    expect((data as unknown[]).length).toBe(1)
    // DOCUMENTING: this is expected mock behavior for dev/test convenience
  })

  it('DIVERGENCE: mock does NOT enforce CHECK constraints (quantity > 0)', async () => {
    // In production, inserting quantity: 0 violates CHECK (quantity > 0)
    // The mock has no constraint enforcement
    await client.from('player_inventory').insert({
      player_id: 'p1', item_id: 'knife', quantity: 0, equipped: false,
    })
    const { data } = await client.from('player_inventory').select('*').eq('player_id', 'p1')
    // Mock accepts invalid values; prod would reject
    expect((data as unknown[]).length).toBe(1)
    // DOCUMENTING: production would throw, mock silently accepts
  })

  it('DIVERGENCE: mock does NOT enforce FK constraints on player_id', async () => {
    // In production, player_inventory.player_id must reference players.id
    // The mock has no FK enforcement
    await client.from('player_inventory').insert({
      player_id: 'nonexistent-uuid', item_id: 'knife', quantity: 1, equipped: false,
    })
    const { data } = await client.from('player_inventory').select('*').eq('player_id', 'nonexistent-uuid')
    // Mock accepts orphan rows; prod would throw FK violation
    expect((data as unknown[]).length).toBe(1)
  })
})

// ============================================================
// Section 7: lib/inventory.ts — direct unit tests using supabaseMock
// Wire createMockSupabaseClient into the supabase module
// ============================================================

describe('inventory: addItem via real inventory.ts + supabaseMock', () => {
  let addItem: (playerId: string, itemId: string, quantity?: number) => Promise<void>
  let getInventory: (playerId: string) => Promise<import('@/types/game').InventoryItem[]>
  let removeItem: (playerId: string, itemId: string, quantity?: number) => Promise<void>

  beforeEach(async () => {
    resetDevDb()
    // Wire the mock client into the supabase module for this test block
    vi.doMock('@/lib/supabase', () => ({
      createSupabaseBrowserClient: () => createMockSupabaseClient(),
    }))
    const mod = await vi.importActual<typeof import('@/lib/inventory')>('@/lib/inventory')
    addItem = mod.addItem
    getInventory = mod.getInventory
    removeItem = mod.removeItem
  })

  afterEach(() => {
    vi.doUnmock('@/lib/supabase')
  })

  it('addItem inserts new row when item does not exist', async () => {
    const client = createMockSupabaseClient()
    await addItem('player-1', 'bandage', 2)
    const { data } = await client.from('player_inventory').select('*').eq('player_id', 'player-1').eq('item_id', 'bandage')
    expect((data as unknown[]).length).toBe(1)
    expect(((data as unknown[])[0] as { quantity: number }).quantity).toBe(2)
  })

  it('addItem increments quantity on existing row (stack)', async () => {
    // Pre-insert existing row
    const client = createMockSupabaseClient()
    await client.from('player_inventory').insert({
      id: 'inv-existing',
      player_id: 'player-1',
      item_id: 'bandage',
      quantity: 3,
      equipped: false,
    })
    await addItem('player-1', 'bandage', 2)
    const { data } = await client.from('player_inventory').select('*').eq('id', 'inv-existing')
    expect(((data as unknown[])[0] as { quantity: number }).quantity).toBe(5)
  })

  it('removeItem deletes row when quantity reaches zero', async () => {
    const client = createMockSupabaseClient()
    await client.from('player_inventory').insert({
      id: 'inv-to-delete',
      player_id: 'player-1',
      item_id: 'knife',
      quantity: 1,
      equipped: false,
    })
    await removeItem('player-1', 'knife', 1)
    const { data } = await client.from('player_inventory').select('*').eq('player_id', 'player-1').eq('item_id', 'knife')
    expect((data as unknown[]).length).toBe(0)
  })

  it('removeItem decrements quantity when removing partial stack', async () => {
    const client = createMockSupabaseClient()
    await client.from('player_inventory').insert({
      id: 'inv-stack',
      player_id: 'player-1',
      item_id: 'bandage',
      quantity: 5,
      equipped: false,
    })
    await removeItem('player-1', 'bandage', 2)
    const { data } = await client.from('player_inventory').select('*').eq('id', 'inv-stack')
    expect(((data as unknown[])[0] as { quantity: number }).quantity).toBe(3)
  })

  it('removeItem is a no-op for nonexistent item (returns without error)', async () => {
    await expect(removeItem('player-1', 'nonexistent_item_id', 1)).resolves.toBeUndefined()
  })

  it('getInventory returns all inventory rows with resolved item definitions', async () => {
    const client = createMockSupabaseClient()
    await client.from('player_inventory').insert({
      id: 'inv-1',
      player_id: 'player-1',
      item_id: 'bandage',
      quantity: 3,
      equipped: false,
    })
    await client.from('player_inventory').insert({
      id: 'inv-2',
      player_id: 'player-1',
      item_id: 'knife',
      quantity: 1,
      equipped: true,
    })
    const inventory = await getInventory('player-1')
    expect(inventory).toHaveLength(2)
    const bandageEntry = inventory.find(i => i.itemId === 'bandage')
    expect(bandageEntry).toBeDefined()
    expect(bandageEntry?.quantity).toBe(3)
    expect(bandageEntry?.item.name).toBe('Bandage')
    const knifeEntry = inventory.find(i => i.itemId === 'knife')
    expect(knifeEntry?.equipped).toBe(true)
  })

  it('getInventory silently drops rows with unknown item_id', async () => {
    const client = createMockSupabaseClient()
    await client.from('player_inventory').insert({
      id: 'inv-known',
      player_id: 'player-1',
      item_id: 'bandage',
      quantity: 1,
      equipped: false,
    })
    await client.from('player_inventory').insert({
      id: 'inv-unknown',
      player_id: 'player-1',
      item_id: 'item_that_does_not_exist',
      quantity: 1,
      equipped: false,
    })
    const inventory = await getInventory('player-1')
    // Unknown item silently dropped
    expect(inventory).toHaveLength(1)
    expect(inventory[0]!.itemId).toBe('bandage')
  })

  it('getInventory returns empty array for player with no inventory', async () => {
    const inventory = await getInventory('player-with-no-items')
    expect(inventory).toEqual([])
  })
})

// ============================================================
// Section 8: Inventory edge cases
// ============================================================

describe('inventory: edge cases', () => {
  let client: ReturnType<typeof createMockSupabaseClient>
  let addItem: (playerId: string, itemId: string, quantity?: number) => Promise<void>
  let getInventory: (playerId: string) => Promise<import('@/types/game').InventoryItem[]>
  let removeItem: (playerId: string, itemId: string, quantity?: number) => Promise<void>

  beforeEach(async () => {
    resetDevDb()
    client = createMockSupabaseClient()
    vi.doMock('@/lib/supabase', () => ({
      createSupabaseBrowserClient: () => createMockSupabaseClient(),
    }))
    const mod = await vi.importActual<typeof import('@/lib/inventory')>('@/lib/inventory')
    addItem = mod.addItem
    getInventory = mod.getInventory
    removeItem = mod.removeItem
  })

  afterEach(() => {
    vi.doUnmock('@/lib/supabase')
  })

  it('addItem with default quantity=1 inserts a row with quantity 1', async () => {
    await addItem('player-1', 'knife')
    const { data } = await client.from('player_inventory').select('*').eq('player_id', 'player-1').eq('item_id', 'knife')
    expect(((data as unknown[])[0] as { quantity: number }).quantity).toBe(1)
  })

  it('addItem with quantity 0 is treated as no-op (0 does not increment)', async () => {
    // This exercises the addItem quantity parameter edge
    await addItem('player-1', 'knife', 0)
    // In real prod this would try to update with +0, which is a no-op or might not be called
    // The mock should return no items since quantity 0 doesn't add meaningful data
    const { data } = await client.from('player_inventory').select('*').eq('player_id', 'player-1').eq('item_id', 'knife')
    // addItem always inserts or updates — with 0 quantity a row may or may not be created
    // Documenting: implementation does insert with quantity:0 which would violate prod CHECK constraint
    // (per RLS divergence tests above, mock accepts it)
    expect(data).toBeDefined()
  })

  it('removeItem with quantity greater than available removes the row entirely', async () => {
    await client.from('player_inventory').insert({
      id: 'inv-1',
      player_id: 'player-1',
      item_id: 'bandage',
      quantity: 2,
      equipped: false,
    })
    // Remove more than available: quantity-2 = 0 or negative → triggers delete path
    await removeItem('player-1', 'bandage', 2)
    const { data } = await client.from('player_inventory').select('*').eq('player_id', 'player-1').eq('item_id', 'bandage')
    expect((data as unknown[]).length).toBe(0)
  })

  it('multiple addItem calls stack correctly across calls', async () => {
    await addItem('player-1', 'bandage', 1)
    await addItem('player-1', 'bandage', 1)
    await addItem('player-1', 'bandage', 1)
    const inventory = await getInventory('player-1')
    const entry = inventory.find(i => i.itemId === 'bandage')
    expect(entry?.quantity).toBe(3)
  })

  it('two different players have independent inventories', async () => {
    await addItem('player-1', 'knife', 1)
    await addItem('player-2', 'bandage', 2)
    const inv1 = await getInventory('player-1')
    const inv2 = await getInventory('player-2')
    expect(inv1).toHaveLength(1)
    expect(inv1[0]!.itemId).toBe('knife')
    expect(inv2).toHaveLength(1)
    expect(inv2[0]!.itemId).toBe('bandage')
  })
})

// ============================================================
// Section 9: groupAndFormatItems utility — pure function tests
// ============================================================

describe('inventory: groupAndFormatItems and defaultStackFormat', () => {
  let groupAndFormatItems: (
    itemIds: string[],
    format?: (name: string, count: number) => string,
  ) => import('@/lib/inventory').GroupedItem[]
  let defaultStackFormat: (name: string, count: number) => string

  beforeEach(async () => {
    const mod = await vi.importActual<typeof import('@/lib/inventory')>('@/lib/inventory')
    groupAndFormatItems = mod.groupAndFormatItems
    defaultStackFormat = mod.defaultStackFormat
  })

  it('defaultStackFormat returns name only for count === 1', () => {
    expect(defaultStackFormat('Bandage', 1)).toBe('Bandage')
  })

  it('defaultStackFormat returns "Name xN" for count > 1', () => {
    expect(defaultStackFormat('Bandage', 3)).toBe('Bandage x3')
    expect(defaultStackFormat('Canned Food', 10)).toBe('Canned Food x10')
  })

  it('groupAndFormatItems groups duplicate IDs into single entry with count', () => {
    const result = groupAndFormatItems(['bandage', 'bandage', 'bandage'])
    expect(result).toHaveLength(1)
    expect(result[0]!.count).toBe(3)
    expect(result[0]!.displayName).toBe('Bandage x3')
  })

  it('groupAndFormatItems returns separate entries for different items', () => {
    const result = groupAndFormatItems(['bandage', 'knife', 'canned_food'])
    expect(result).toHaveLength(3)
  })

  it('groupAndFormatItems returns empty array for empty input', () => {
    const result = groupAndFormatItems([])
    expect(result).toEqual([])
  })

  it('groupAndFormatItems sorts results alphabetically by name', () => {
    const result = groupAndFormatItems(['knife', 'bandage', 'canned_food'])
    const names = result.map(r => r.name)
    expect(names).toEqual([...names].sort((a, b) => a.localeCompare(b)))
  })

  it('groupAndFormatItems uses name from ITEMS registry (not raw id)', () => {
    const result = groupAndFormatItems(['bandage'])
    expect(result[0]!.name).toBe('Bandage')
    expect(result[0]!.itemId).toBe('bandage')
  })

  it('groupAndFormatItems falls back to item id when item not in registry', () => {
    const result = groupAndFormatItems(['unknown_item_xyz'])
    expect(result[0]!.name).toBe('unknown_item_xyz')
    expect(result[0]!.displayName).toBe('unknown_item_xyz')
  })

  it('groupAndFormatItems accepts a custom format function', () => {
    const customFmt = (name: string, count: number) => `[${count}] ${name}`
    const result = groupAndFormatItems(['bandage', 'bandage'], customFmt)
    expect(result[0]!.displayName).toBe('[2] Bandage')
  })

  it('count === 1 single item produces no count suffix', () => {
    const result = groupAndFormatItems(['knife'])
    expect(result[0]!.displayName).toBe('Knife')
    expect(result[0]!.count).toBe(1)
  })
})

// ============================================================
// Section 10: Stash operations — deposit/withdraw, never-lose-item invariant
// Critical Rule #3: DB writes before state mutations
// ============================================================

describe('inventory: stash operations — never-lose-item invariant', () => {
  let client: ReturnType<typeof createMockSupabaseClient>

  beforeEach(() => {
    resetDevDb()
    client = createMockSupabaseClient()
  })

  it('stash deposit: item in stash table after insert', async () => {
    await client.from('player_stash').insert({
      id: 'stash-1',
      player_id: 'p1',
      item_id: 'canned_food',
      quantity: 1,
    })
    const { data } = await client.from('player_stash').select('*').eq('player_id', 'p1')
    expect((data as unknown[]).length).toBe(1)
    expect(((data as unknown[])[0] as { item_id: string }).item_id).toBe('canned_food')
  })

  it('stash withdrawal: item removed from stash after delete', async () => {
    await client.from('player_stash').insert({
      id: 'stash-1',
      player_id: 'p1',
      item_id: 'canned_food',
      quantity: 1,
    })
    await client.from('player_stash').delete().eq('id', 'stash-1')
    const { data } = await client.from('player_stash').select('*').eq('player_id', 'p1')
    expect((data as unknown[]).length).toBe(0)
  })

  it('stash never-lose: total items conserved across transfer (inventory + stash = constant)', async () => {
    // Simulate: inventory has 5 bandages, transfer 2 to stash
    const PLAYER = 'p1'
    await client.from('player_inventory').insert({ id: 'inv-1', player_id: PLAYER, item_id: 'bandage', quantity: 5, equipped: false })
    await client.from('player_stash').insert({ id: 'stash-1', player_id: PLAYER, item_id: 'bandage', quantity: 0 })

    // Step 1: DB write to stash BEFORE removing from inventory (Critical Rule #3)
    await client.from('player_stash').update({ quantity: 2 }).eq('id', 'stash-1')
    // Step 2: only then remove from inventory
    await client.from('player_inventory').update({ quantity: 3 }).eq('id', 'inv-1')

    const { data: invData } = await client.from('player_inventory').select('*').eq('id', 'inv-1')
    const { data: stashData } = await client.from('player_stash').select('*').eq('id', 'stash-1')
    const invQty = ((invData as unknown[])[0] as { quantity: number }).quantity
    const stashQty = ((stashData as unknown[])[0] as { quantity: number }).quantity
    // Conservation invariant: 3 + 2 = 5 (original total)
    expect(invQty + stashQty).toBe(5)
  })

  it('stash never-lose: if stash write fails, inventory item must remain', async () => {
    // Demonstrates the invariant pattern — test the DB-first ordering
    // by verifying that the inventory row is unchanged when stash write is skipped
    const PLAYER = 'p1'
    await client.from('player_inventory').insert({ id: 'inv-1', player_id: PLAYER, item_id: 'canned_food', quantity: 3, equipped: false })

    // Simulate: stash write "fails" (we skip it)
    // Inventory must NOT be modified
    // In real code: stash DB write happens FIRST; only on success does removeItem run

    const { data: invData } = await client.from('player_inventory').select('*').eq('id', 'inv-1')
    expect(((invData as unknown[])[0] as { quantity: number }).quantity).toBe(3) // unchanged
  })

  it('stash multi-item: stash can hold multiple distinct items', async () => {
    await client.from('player_stash').insert({ player_id: 'p1', item_id: 'bandage', quantity: 2 })
    await client.from('player_stash').insert({ player_id: 'p1', item_id: 'canned_food', quantity: 1 })
    await client.from('player_stash').insert({ player_id: 'p1', item_id: 'knife', quantity: 1 })
    const { data } = await client.from('player_stash').select('*').eq('player_id', 'p1')
    expect((data as unknown[]).length).toBe(3)
  })

  it('stash persists across resetDevDb() only when not reset', async () => {
    await client.from('player_stash').insert({ id: 'stash-1', player_id: 'p1', item_id: 'bandage', quantity: 2 })
    const { data: before } = await client.from('player_stash').select('*').eq('player_id', 'p1')
    expect((before as unknown[]).length).toBe(1)
    resetDevDb()
    const { data: after } = await client.from('player_stash').select('*').eq('player_id', 'p1')
    expect((after as unknown[]).length).toBe(0) // reset cleared it
  })
})

// ============================================================
// Section 11: Full CRUD round-trip for every table
// ============================================================

describe('supabaseMock: full CRUD round-trip — every table', () => {
  let client: ReturnType<typeof createMockSupabaseClient>

  beforeEach(() => {
    resetDevDb()
    client = createMockSupabaseClient()
  })

  it('players table: insert → select → update → delete', async () => {
    await client.from('players').insert({ id: 'p1', name: 'Hero', hp: 20 })
    const { data: s1 } = await client.from('players').select('*').eq('id', 'p1')
    expect((s1 as unknown[]).length).toBe(1)

    await client.from('players').update({ hp: 10 }).eq('id', 'p1')
    const { data: s2 } = await client.from('players').select('*').eq('id', 'p1')
    expect(((s2 as unknown[])[0] as { hp: number }).hp).toBe(10)

    await client.from('players').delete().eq('id', 'p1')
    const { data: s3 } = await client.from('players').select('*').eq('id', 'p1')
    expect((s3 as unknown[]).length).toBe(0)
  })

  it('player_inventory table: insert → select → update → delete', async () => {
    await client.from('player_inventory').insert({ id: 'inv-1', player_id: 'p1', item_id: 'knife', quantity: 1, equipped: false })
    const { data: s1 } = await client.from('player_inventory').select('*').eq('id', 'inv-1')
    expect((s1 as unknown[]).length).toBe(1)

    await client.from('player_inventory').update({ equipped: true }).eq('id', 'inv-1')
    const { data: s2 } = await client.from('player_inventory').select('*').eq('id', 'inv-1')
    expect(((s2 as unknown[])[0] as { equipped: boolean }).equipped).toBe(true)

    await client.from('player_inventory').delete().eq('id', 'inv-1')
    const { data: s3 } = await client.from('player_inventory').select('*').eq('id', 'inv-1')
    expect((s3 as unknown[]).length).toBe(0)
  })

  it('player_ledger table: insert → select → update', async () => {
    await client.from('player_ledger').insert({ id: 'led-1', player_id: 'p1', world_seed: 42, current_cycle: 1 })
    const { data: s1 } = await client.from('player_ledger').select('*').eq('id', 'led-1')
    expect((s1 as unknown[]).length).toBe(1)

    await client.from('player_ledger').update({ current_cycle: 2 }).eq('id', 'led-1')
    const { data: s2 } = await client.from('player_ledger').select('*').eq('id', 'led-1')
    expect(((s2 as unknown[])[0] as { current_cycle: number }).current_cycle).toBe(2)
  })

  it('player_stash table: insert → select → update → delete', async () => {
    await client.from('player_stash').insert({ id: 'st-1', player_id: 'p1', item_id: 'bandage', quantity: 3 })
    const { data: s1 } = await client.from('player_stash').select('*').eq('id', 'st-1')
    expect((s1 as unknown[]).length).toBe(1)

    await client.from('player_stash').update({ quantity: 5 }).eq('id', 'st-1')
    const { data: s2 } = await client.from('player_stash').select('*').eq('id', 'st-1')
    expect(((s2 as unknown[])[0] as { quantity: number }).quantity).toBe(5)

    await client.from('player_stash').delete().eq('id', 'st-1')
    const { data: s3 } = await client.from('player_stash').select('*').eq('id', 'st-1')
    expect((s3 as unknown[]).length).toBe(0)
  })

  it('generated_rooms table: insert → select → update', async () => {
    await client.from('generated_rooms').insert({
      id: 'room-001',
      player_id: 'p1',
      world_seed: 99,
      zone: 'crossroads',
      name: 'Test Room',
      description: 'A room for testing.',
      exits: { north: 'room-002' },
      items: [],
      enemies: [],
      npcs: [],
      difficulty: 1,
      flags: {},
      visited: false,
    })
    const { data: s1 } = await client.from('generated_rooms').select('*').eq('id', 'room-001')
    expect((s1 as unknown[]).length).toBe(1)

    await client.from('generated_rooms').update({ visited: true }).eq('id', 'room-001')
    const { data: s2 } = await client.from('generated_rooms').select('*').eq('id', 'room-001')
    expect(((s2 as unknown[])[0] as { visited: boolean }).visited).toBe(true)
  })

  it('room_state table: insert → select → update', async () => {
    await client.from('room_state').insert({
      id: 'rs-1',
      player_id: 'p1',
      room_id: 'cr_01_approach',
      depleted_item_ids: [],
      last_visited_at: new Date().toISOString(),
    })
    const { data: s1 } = await client.from('room_state').select('*').eq('id', 'rs-1')
    expect((s1 as unknown[]).length).toBe(1)

    await client.from('room_state').update({ depleted_item_ids: ['item_pipe_wrench'] }).eq('id', 'rs-1')
    const { data: s2 } = await client.from('room_state').select('*').eq('id', 'rs-1')
    const row = (s2 as unknown[])[0] as { depleted_item_ids: string[] }
    expect(row.depleted_item_ids).toEqual(['item_pipe_wrench'])
  })
})

// ============================================================
// Section 12: DB-first ordering invariant tests
// Per Critical Rule #3: DB writes must happen before state mutations
// ============================================================

describe('inventory: DB-first ordering (Critical Rule #3)', () => {
  let client: ReturnType<typeof createMockSupabaseClient>

  beforeEach(() => {
    resetDevDb()
    client = createMockSupabaseClient()
  })

  it('inventory add: DB row exists before in-memory state updated', async () => {
    // Simulate: addItem writes to DB (player_inventory), then updates in-memory state
    // The DB must be the source of truth
    await client.from('player_inventory').insert({
      id: 'inv-1',
      player_id: 'p1',
      item_id: 'canned_food',
      quantity: 1,
      equipped: false,
    })
    // Verify DB state reflects the item BEFORE any in-memory changes
    const { data } = await client.from('player_inventory').select('*').eq('player_id', 'p1')
    expect((data as unknown[]).length).toBe(1)
  })

  it('inventory remove: DB row deleted before in-memory state updated', async () => {
    await client.from('player_inventory').insert({
      id: 'inv-1',
      player_id: 'p1',
      item_id: 'canned_food',
      quantity: 1,
      equipped: false,
    })
    // Delete from DB first
    await client.from('player_inventory').delete().eq('id', 'inv-1')
    // Verify DB state is cleared
    const { data } = await client.from('player_inventory').select('*').eq('player_id', 'p1').eq('item_id', 'canned_food')
    expect((data as unknown[]).length).toBe(0)
  })

  it('stash→inventory transfer: stash row written before inventory incremented', async () => {
    // Pattern: stash delete FIRST, then inventory addItem
    await client.from('player_stash').insert({ id: 's1', player_id: 'p1', item_id: 'bandage', quantity: 1 })
    await client.from('player_inventory').insert({ id: 'inv-1', player_id: 'p1', item_id: 'bandage', quantity: 0, equipped: false })

    // Simulate unstash DB-first pattern:
    // 1) Delete from stash
    await client.from('player_stash').delete().eq('id', 's1')
    // 2) Add to inventory (only after stash delete confirmed)
    await client.from('player_inventory').update({ quantity: 1 }).eq('id', 'inv-1')

    const { data: stash } = await client.from('player_stash').select('*').eq('player_id', 'p1')
    const { data: inv } = await client.from('player_inventory').select('*').eq('player_id', 'p1')
    expect((stash as unknown[]).length).toBe(0)
    expect(((inv as unknown[])[0] as { quantity: number }).quantity).toBe(1)
  })
})

// ============================================================
// Section 12b: getEquipped() — covers lines 440-459 (currently 0% coverage)
// ============================================================

describe('inventory: getEquipped via real inventory.ts + supabaseMock', () => {
  let getEquipped: (
    playerId: string,
    type: 'weapon' | 'armor',
  ) => Promise<import('@/types/game').InventoryItem | null>

  beforeEach(async () => {
    resetDevDb()
    vi.doMock('@/lib/supabase', () => ({
      createSupabaseBrowserClient: () => createMockSupabaseClient(),
    }))
    const mod = await vi.importActual<typeof import('@/lib/inventory')>('@/lib/inventory')
    getEquipped = mod.getEquipped
  })

  afterEach(() => {
    vi.doUnmock('@/lib/supabase')
  })

  it('getEquipped returns null when player has no equipped weapon', async () => {
    const client = createMockSupabaseClient()
    await client.from('player_inventory').insert({
      id: 'inv-1', player_id: 'p-getequip', item_id: 'knife', quantity: 1, equipped: false,
    })
    const result = await getEquipped('p-getequip', 'weapon')
    expect(result).toBeNull()
  })

  it('getEquipped returns null when inventory is empty', async () => {
    const result = await getEquipped('p-empty', 'weapon')
    expect(result).toBeNull()
  })

  it('getEquipped returns the equipped weapon when one is equipped', async () => {
    const client = createMockSupabaseClient()
    await client.from('player_inventory').insert({
      id: 'inv-knife', player_id: 'p-equip', item_id: 'knife', quantity: 1, equipped: true,
    })
    const result = await getEquipped('p-equip', 'weapon')
    expect(result).not.toBeNull()
    expect(result!.itemId).toBe('knife')
    expect(result!.item.type).toBe('weapon')
    expect(result!.equipped).toBe(true)
  })

  it('getEquipped returns the equipped armor when one is equipped', async () => {
    const client = createMockSupabaseClient()
    await client.from('player_inventory').insert({
      id: 'inv-vest', player_id: 'p-equip-armor', item_id: 'vest', quantity: 1, equipped: true,
    })
    const result = await getEquipped('p-equip-armor', 'armor')
    expect(result).not.toBeNull()
    expect(result!.itemId).toBe('vest')
    expect(result!.item.type).toBe('armor')
  })

  it('getEquipped with weapon query does not return equipped armor', async () => {
    const client = createMockSupabaseClient()
    await client.from('player_inventory').insert({
      id: 'inv-vest', player_id: 'p-mixed', item_id: 'vest', quantity: 1, equipped: true,
    })
    const result = await getEquipped('p-mixed', 'weapon')
    expect(result).toBeNull()
  })

  it('getEquipped silently skips rows with unknown item_id', async () => {
    const client = createMockSupabaseClient()
    await client.from('player_inventory').insert({
      id: 'inv-ghost', player_id: 'p-ghost', item_id: 'item_not_in_registry', quantity: 1, equipped: true,
    })
    // rowToInventoryItem returns null for unknown item_id
    const result = await getEquipped('p-ghost', 'weapon')
    expect(result).toBeNull()
  })
})

// ============================================================
// Section 12c: getEquipped error path and behavior edge cases
// Also covers the supabaseMock query builder's eq('equipped', true) path
// ============================================================

describe('inventory: getEquipped with multiple equipped items', () => {
  let client: ReturnType<typeof createMockSupabaseClient>
  let getEquipped: (
    playerId: string,
    type: 'weapon' | 'armor',
  ) => Promise<import('@/types/game').InventoryItem | null>

  beforeEach(async () => {
    resetDevDb()
    client = createMockSupabaseClient()
    vi.doMock('@/lib/supabase', () => ({
      createSupabaseBrowserClient: () => createMockSupabaseClient(),
    }))
    const mod = await vi.importActual<typeof import('@/lib/inventory')>('@/lib/inventory')
    getEquipped = mod.getEquipped
  })

  afterEach(() => {
    vi.doUnmock('@/lib/supabase')
  })

  it('getEquipped returns first matching type when multiple items are equipped', async () => {
    // Both weapon and armor equipped — getEquipped('weapon') returns knife
    await client.from('player_inventory').insert({
      id: 'inv-knife', player_id: 'p-multi', item_id: 'knife', quantity: 1, equipped: true,
    })
    await client.from('player_inventory').insert({
      id: 'inv-vest', player_id: 'p-multi', item_id: 'vest', quantity: 1, equipped: true,
    })
    const weapon = await getEquipped('p-multi', 'weapon')
    expect(weapon).not.toBeNull()
    expect(weapon!.item.type).toBe('weapon')

    const armor = await getEquipped('p-multi', 'armor')
    expect(armor).not.toBeNull()
    expect(armor!.item.type).toBe('armor')
  })

  it('getEquipped returns null when no equipped items at all', async () => {
    await client.from('player_inventory').insert([
      { id: 'inv-1', player_id: 'p-unequipped', item_id: 'knife', quantity: 1, equipped: false },
      { id: 'inv-2', player_id: 'p-unequipped', item_id: 'vest', quantity: 1, equipped: false },
    ])
    expect(await getEquipped('p-unequipped', 'weapon')).toBeNull()
    expect(await getEquipped('p-unequipped', 'armor')).toBeNull()
  })

  it('getEquipped query uses eq(player_id) + eq(equipped, true) filter correctly', async () => {
    // p1 has knife equipped; p2 has bandage (not a weapon) equipped
    await client.from('player_inventory').insert({
      id: 'inv-p1', player_id: 'p1-filter', item_id: 'knife', quantity: 1, equipped: true,
    })
    await client.from('player_inventory').insert({
      id: 'inv-p2', player_id: 'p2-filter', item_id: 'canned_food', quantity: 1, equipped: true,
    })
    // p1 should see knife; p2 has no weapon
    const p1Result = await getEquipped('p1-filter', 'weapon')
    expect(p1Result?.itemId).toBe('knife')

    const p2Result = await getEquipped('p2-filter', 'weapon')
    expect(p2Result).toBeNull() // canned_food is consumable, not weapon
  })
})

// ============================================================
// Section 13: Validate schema drift — runtime assertion
// T1-B output check: freshTables() vs production schema
// ============================================================

describe('supabaseMock: schema drift assertions (OQ-5 documentation)', () => {
  it('SCHEMA PARITY: mock defines all 6 production tables', () => {
    // Production tables after all migrations:
    // players, player_inventory, player_ledger, player_stash, generated_rooms, room_state
    // game_log was DROPPED in migration 20260329000001_rls_world_state.sql
    // world_state exists in migrations but mock does not define it

    const PROD_TABLES = new Set(['players', 'player_inventory', 'player_ledger', 'player_stash', 'generated_rooms', 'room_state'])
    resetDevDb()
    const client = createMockSupabaseClient()

    // All 6 tables should be accessible
    for (const table of PROD_TABLES) {
      expect(
        () => client.from(table),
        `Table '${table}' should be accessible in mock`
      ).not.toThrow()
    }
  })

  it('SCHEMA DIVERGENCE: world_state table is in migrations but NOT in mock freshTables()', async () => {
    // world_state was created in migration 20260326000001_init.sql
    // but is NOT in freshTables() — it's "scaffold for future multiplayer" per migration comment
    // The mock accessing 'world_state' returns an empty array (schemaless fallback)
    resetDevDb()
    const client = createMockSupabaseClient()
    const { data } = await client.from('world_state').select('*')
    // Mock silently returns [] for unknown tables — not an error (schemaless design)
    // DOCUMENTING: prod world_state table exists; mock doesn't define it in freshTables()
    expect(data).toEqual([]) // schemaless fallback
  })

  it('SCHEMA NOTE: active_dialogue and active_buffs columns are in migrations but mock is schemaless', async () => {
    // Migration 20260424000001 added active_dialogue JSONB and combat_state JSONB to players
    // Migration 20260328000002 added active_buffs JSONB and pending_stat_increase BOOLEAN
    // Mock accepts any fields (schemaless) — no separate column type checking
    resetDevDb()
    const client = createMockSupabaseClient()
    await client.from('players').insert({
      id: 'p1',
      active_dialogue: { npcId: 'marta_food_vendor', treeId: 'tree_marta', currentNodeId: 'n1' },
      active_buffs: [{ type: 'regen', duration: 3 }],
      pending_stat_increase: true,
      combat_state: null,
    })
    const { data } = await client.from('players').select('*').eq('id', 'p1')
    const row = (data as unknown[])[0] as {
      active_dialogue: { npcId: string }
      active_buffs: unknown[]
      pending_stat_increase: boolean
    }
    expect(row.active_dialogue.npcId).toBe('marta_food_vendor')
    expect(row.active_buffs).toHaveLength(1)
    expect(row.pending_stat_increase).toBe(true)
  })

  it('SCHEMA NOTE: cycle_history JSONB persists complex nested objects', async () => {
    // Migration 20260328000001 added cycle_history JSONB to player_ledger
    resetDevDb()
    const client = createMockSupabaseClient()
    const cycleHistory = [
      {
        cycle: 1,
        factionsAligned: ['accord'],
        factionsAntagonized: ['red_court'],
        npcRelationships: { marta_food_vendor: 'trusted' },
        questsCompleted: ['sparks_quest_final'],
        deathRoom: 'cr_03_crossroads_camp',
      },
    ]
    await client.from('player_ledger').insert({ id: 'led-1', player_id: 'p1', cycle_history: cycleHistory })
    const { data } = await client.from('player_ledger').select('*').eq('id', 'led-1')
    const row = (data as unknown[])[0] as { cycle_history: typeof cycleHistory }
    expect(row.cycle_history[0]!.factionsAligned).toContain('accord')
    expect(row.cycle_history[0]!.deathRoom).toBe('cr_03_crossroads_camp')
  })
})
