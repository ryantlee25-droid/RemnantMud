// ============================================================
// supabaseMock.ts — In-memory mock of the Supabase client
// Used in dev mode (NEXT_PUBLIC_DEV_MODE=true) to allow local
// testing without a Supabase account or database.
// ============================================================

/* eslint-disable @typescript-eslint/no-explicit-any */

const DEV_USER_ID = '00000000-0000-0000-0000-000000000001'

// In-memory tables — reset on every module reload (HMR / rebuild)
function freshTables(): Record<string, any[]> {
  return {
    players: [],
    player_inventory: [],
    player_ledger: [],
    player_stash: [],
    generated_rooms: [],
    room_state: [],
  }
}

// Use globalThis to survive HMR but allow explicit reset
const g = globalThis as any
if (!g.__remnantDevDb) g.__remnantDevDb = freshTables()
const tables: Record<string, any[]> = g.__remnantDevDb

/** Clear all in-memory tables. Called on build/reload. */
export function resetDevDb() {
  g.__remnantDevDb = freshTables()
  Object.assign(tables, g.__remnantDevDb)
}

function deepClone<T>(obj: T): T {
  return JSON.parse(JSON.stringify(obj))
}

// Query builder that mimics Supabase's fluent API
function createQueryBuilder(tableName: string) {
  const table = tables[tableName] ?? []
  let filters: Array<{ col: string; val: any }> = []
  let selectCols = '*'
  let selectCount = false
  let pendingInsert: any = null
  let pendingUpdate: any = null
  let pendingDelete = false
  let pendingUpsert: any = null

  const builder: any = {
    select(cols?: string, opts?: { count?: string; head?: boolean }) {
      selectCols = cols ?? '*'
      if (opts?.count === 'exact') selectCount = true
      return builder
    },
    eq(col: string, val: any) {
      filters.push({ col, val })
      return builder
    },
    insert(row: any) {
      pendingInsert = Array.isArray(row) ? row : [row]
      return builder
    },
    upsert(row: any) {
      pendingUpsert = Array.isArray(row) ? row : [row]
      return builder
    },
    update(vals: any) {
      pendingUpdate = vals
      return builder
    },
    delete() {
      pendingDelete = true
      return builder
    },
    order() { return builder },
    limit() { return builder },

    maybeSingle() {
      if (pendingInsert) {
        for (const row of pendingInsert) {
          if (!row.id) row.id = crypto.randomUUID()
          table.push(deepClone(row))
        }
        tables[tableName] = table
        return { data: pendingInsert[0], error: null }
      }
      const match = table.find((r: any) => filters.every(f => r[f.col] === f.val))
      return { data: match ? deepClone(match) : null, error: null }
    },

    single() {
      return builder.maybeSingle()
    },

    then(resolve: any) {
      // Terminal — execute the operation
      if (pendingInsert) {
        for (const row of pendingInsert) {
          if (!row.id) row.id = crypto.randomUUID()
          table.push(deepClone(row))
        }
        tables[tableName] = table
        return resolve({ data: pendingInsert, error: null })
      }

      if (pendingUpsert) {
        for (const row of pendingUpsert) {
          const idx = table.findIndex((r: any) =>
            r.id === row.id ||
            (r.player_id === row.player_id && r.item_id === row.item_id) ||
            (r.player_id === row.player_id && r.room_id === row.room_id) ||
            (tableName === 'generated_rooms' && r.player_id === row.player_id && r.id === row.id)
          )
          if (idx >= 0) {
            table[idx] = { ...table[idx], ...row }
          } else {
            if (!row.id) row.id = crypto.randomUUID()
            table.push(deepClone(row))
          }
        }
        tables[tableName] = table
        return resolve({ data: pendingUpsert, error: null })
      }

      if (pendingUpdate) {
        for (const r of table) {
          if (filters.every(f => r[f.col] === f.val)) {
            Object.assign(r, pendingUpdate)
          }
        }
        return resolve({ data: null, error: null })
      }

      if (pendingDelete) {
        tables[tableName] = table.filter((r: any) => !filters.every(f => r[f.col] === f.val))
        return resolve({ data: null, error: null })
      }

      // Select
      const results = table.filter((r: any) => filters.every(f => r[f.col] === f.val))
      const response: any = { data: deepClone(results), error: null }
      if (selectCount) response.count = results.length
      return resolve(response)
    },
  }

  return builder
}

export function createMockSupabaseClient() {
  return {
    from(table: string) {
      return createQueryBuilder(table)
    },
    auth: {
      getUser() {
        return Promise.resolve({
          data: { user: { id: DEV_USER_ID, email: 'dev@remnant.local' } },
          error: null,
        })
      },
      onAuthStateChange(callback: any) {
        // Immediately notify as signed in
        setTimeout(() => callback('SIGNED_IN', { user: { id: DEV_USER_ID } }), 0)
        return { data: { subscription: { unsubscribe: () => {} } } }
      },
      getSession() {
        return Promise.resolve({
          data: { session: { user: { id: DEV_USER_ID } } },
          error: null,
        })
      },
      signOut() {
        return Promise.resolve({ error: null })
      },
    },
  }
}

export const DEV_USER = { id: DEV_USER_ID, email: 'dev@remnant.local' }
export function isDevMode(): boolean {
  return process.env.NEXT_PUBLIC_DEV_MODE === 'true'
}
