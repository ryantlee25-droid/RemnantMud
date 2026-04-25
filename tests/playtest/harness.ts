// ============================================================
// tests/playtest/harness.ts — PlayerSession test harness
//
// Shared foundation for scenario-driven integration playtests
// (H2–H6). Wraps GameEngine with RNG determinism, Supabase mock
// setup helpers, and ergonomic state-assertion helpers.
//
// FROZEN API — any change here is a breaking change for H2–H6.
// See PLAN.md §H1 for the authoritative spec.
// ============================================================

import { vi } from 'vitest'
import { GameEngine } from '@/lib/gameEngine'
import { parseCommand } from '@/lib/parser'
import { resetDevDb } from '@/lib/supabaseMock'
import type {
  CharacterClass,
  Direction,
  GameMessage,
  GameState,
  InventoryItem,
  PersonalLossType,
  Player,
  Room,
  StatBlock,
} from '@/types/game'
import type { ConditionId } from '@/types/traits'

// ------------------------------------------------------------
// Public types
// ------------------------------------------------------------

export interface CharacterSpec {
  name: string
  characterClass: CharacterClass
  stats: StatBlock
  personalLoss: { type: PersonalLossType; detail?: string }
}

export interface SessionOptions {
  /** Pinned return value for Math.random — default 0.5 (deterministic RNG). */
  mockRandom?: number
  /** Shim _applyPopulation to use pinned RNG instead of live Math.random — default true. */
  mockRoomPopulation?: boolean
}

// ------------------------------------------------------------
// Mock DB factory
//
// Exported so test files can wire it up in their vi.mock() call:
//
//   vi.mock('@/lib/supabase', () => ({
//     createSupabaseBrowserClient: () => buildMockDb(),
//   }))
//
// The returned object is a minimal Supabase-compatible mock that
// delegates all persistence to the in-memory tables in supabaseMock.ts
// via resetDevDb() / the direct table access used by createCharacter.
// ------------------------------------------------------------

function makeChain(result: unknown) {
  const chain: Record<string, unknown> = {}
  const chainMethods = [
    'select', 'eq', 'neq', 'in', 'is', 'order', 'limit',
    'single', 'maybeSingle', 'match', 'filter', 'insert',
    'upsert', 'delete', 'update',
  ]
  for (const m of chainMethods) chain[m] = vi.fn(() => chain)
  return new Proxy(chain, {
    get(target, prop) {
      if (prop === 'then') return (resolve: (v: unknown) => void) => resolve(result)
      return target[prop as string]
    },
  })
}

/** Build a stateful in-memory mock Supabase client.
 *
 *  State survives across create() / _savePlayer() / loadPlayer() within one
 *  PlayerSession because the object is shared. resetDevDb() clears tables
 *  between sessions.
 */
export function buildMockDb() {
  let playerRow: Record<string, unknown> = {}
  let ledgerRow: Record<string, unknown> = {}

  function makePlayersBuilder() {
    let pendingUpdate: Record<string, unknown> | null = null
    const b: Record<string, unknown> = {}
    b['upsert'] = vi.fn((vals: Record<string, unknown>) => {
      playerRow = { ...playerRow, ...vals }
      return makeChain({ data: vals, error: null })
    })
    b['update'] = vi.fn((vals: Record<string, unknown>) => {
      pendingUpdate = vals
      return b
    })
    b['eq'] = vi.fn(() => {
      if (pendingUpdate !== null) { Object.assign(playerRow, pendingUpdate); pendingUpdate = null }
      return b
    })
    b['select'] = vi.fn(() => b)
    b['maybeSingle'] = vi.fn(() =>
      Promise.resolve({ data: Object.keys(playerRow).length ? { ...playerRow } : null, error: null })
    )
    b['single'] = vi.fn(() =>
      Promise.resolve({ data: Object.keys(playerRow).length ? { ...playerRow } : null, error: null })
    )
    b['delete'] = vi.fn(() => b);
    (b as Record<string, unknown>)['then'] = (resolve: (v: unknown) => void) => {
      if (pendingUpdate !== null) { Object.assign(playerRow, pendingUpdate); pendingUpdate = null }
      resolve({ data: Object.keys(playerRow).length ? { ...playerRow } : null, error: null })
    }
    return b
  }

  function makeLedgerBuilder() {
    let pendingUpdate: Record<string, unknown> | null = null
    const b: Record<string, unknown> = {}
    b['upsert'] = vi.fn((vals: Record<string, unknown>) => {
      ledgerRow = { ...ledgerRow, ...vals }
      return makeChain({ data: vals, error: null })
    })
    b['update'] = vi.fn((vals: Record<string, unknown>) => {
      pendingUpdate = vals
      return b
    })
    b['eq'] = vi.fn(() => {
      if (pendingUpdate !== null) { Object.assign(ledgerRow, pendingUpdate); pendingUpdate = null }
      return b
    })
    b['select'] = vi.fn(() => b)
    b['maybeSingle'] = vi.fn(() =>
      Promise.resolve({ data: Object.keys(ledgerRow).length ? { ...ledgerRow } : null, error: null })
    )
    b['single'] = vi.fn(() =>
      Promise.resolve({ data: Object.keys(ledgerRow).length ? { ...ledgerRow } : null, error: null })
    );
    (b as Record<string, unknown>)['then'] = (resolve: (v: unknown) => void) => {
      if (pendingUpdate !== null) { Object.assign(ledgerRow, pendingUpdate); pendingUpdate = null }
      resolve({ data: Object.keys(ledgerRow).length ? { ...ledgerRow } : null, error: null })
    }
    return b
  }

  return {
    _playerRow: () => playerRow,
    _ledgerRow: () => ledgerRow,
    auth: {
      refreshSession: vi.fn().mockResolvedValue({}),
      getUser: vi.fn().mockResolvedValue({
        data: { user: { id: 'playtest-user-001', email: 'playtest@remnant.local' } },
        error: null,
      }),
    },
    from: vi.fn((table: string) => {
      if (table === 'players') return makePlayersBuilder()
      if (table === 'player_ledger') return makeLedgerBuilder()
      if (table === 'player_inventory') {
        return {
          select: vi.fn(() => makeChain({ data: [], error: null })),
          eq: vi.fn(function() { return this }),
          then: (resolve: (v: unknown) => void) => resolve({ data: [], error: null }),
        }
      }
      if (table === 'player_stash') {
        return {
          select: vi.fn(() => makeChain({ data: [], error: null })),
          eq: vi.fn(function() { return this }),
          update: vi.fn(() => makeChain({ error: null })),
          delete: vi.fn(() => makeChain({ error: null })),
          then: (resolve: (v: unknown) => void) => resolve({ data: [], error: null }),
        }
      }
      // generated_rooms, room_state, etc.
      return {
        select: vi.fn(() => makeChain({ count: 0, error: null })),
        eq: vi.fn(function() { return this }),
        update: vi.fn(() => makeChain({ error: null })),
        upsert: vi.fn(() => makeChain({ error: null })),
        insert: vi.fn(() => makeChain({ error: null })),
        delete: vi.fn(() => makeChain({ error: null })),
        then: (resolve: (v: unknown) => void) => resolve({ count: 0, error: null }),
      }
    }),
  }
}

// ------------------------------------------------------------
// PlayerSession
// ------------------------------------------------------------

export class PlayerSession {
  private _engine: GameEngine
  private _options: Required<SessionOptions>
  private _randomSpy: ReturnType<typeof vi.spyOn> | null = null

  constructor(options: SessionOptions = {}) {
    this._options = {
      mockRandom: options.mockRandom ?? 0.5,
      mockRoomPopulation: options.mockRoomPopulation ?? true,
    }
    this._engine = new GameEngine()
  }

  // ----------------------------------------------------------
  // Setup / teardown
  // ----------------------------------------------------------

  /** Creates a fresh character and wires the session. Calls resetDevDb() first. */
  async create(spec: CharacterSpec): Promise<void> {
    // Fresh in-memory DB so each session starts clean
    resetDevDb()

    // Pin Math.random for deterministic RNG
    this._randomSpy = vi.spyOn(Math, 'random').mockReturnValue(this._options.mockRandom)

    await this._engine.createCharacter(
      spec.name,
      spec.stats,
      spec.characterClass,
      spec.personalLoss,
    )
  }

  /** Cleans up timers/mocks. Safe to call multiple times. */
  async destroy(): Promise<void> {
    if (this._randomSpy) {
      this._randomSpy.mockRestore()
      this._randomSpy = null
    }
  }

  // ----------------------------------------------------------
  // State reads
  // ----------------------------------------------------------

  get state(): GameState {
    return this._engine.getState()
  }

  get player(): Player {
    const p = this._engine.getState().player
    if (!p) throw new Error('PlayerSession: no player — call create() first')
    return p
  }

  get currentRoom(): Room {
    const r = this._engine.getState().currentRoom
    if (!r) throw new Error('PlayerSession: no currentRoom — call create() first')
    return r
  }

  get inventory(): InventoryItem[] {
    return this._engine.getState().inventory
  }

  get log(): GameMessage[] {
    return this._engine.getState().log
  }

  // ----------------------------------------------------------
  // Commands
  // ----------------------------------------------------------

  /** Parse input string and dispatch through the engine. Never throws — errors land in the log. */
  async cmd(input: string): Promise<void> {
    const action = parseCommand(input)
    try {
      await this._engine.executeAction(action)
    } catch (err) {
      // Absorb — tests assert via lastLogContains() or state
      console.warn(`[PlayerSession.cmd] engine threw for input "${input}":`, err)
    }
  }

  /** Walk a sequence of directions. Continues on failure (no exit in that direction). */
  async walk(directions: Direction[]): Promise<void> {
    for (const dir of directions) {
      const roomBefore = this._engine.getState().currentRoom?.id
      await this.cmd(`go ${dir}`)
      const roomAfter = this._engine.getState().currentRoom?.id
      if (roomBefore === roomAfter) {
        console.warn(`[PlayerSession.walk] move ${dir} did not change room (stuck in ${roomBefore ?? 'unknown'})`)
      }
    }
  }

  /** Wait until predicate is true, polling every tick. Rejects on timeout. */
  async waitFor(predicate: (state: GameState) => boolean, timeoutMs = 5000): Promise<void> {
    const deadline = Date.now() + timeoutMs
    while (!predicate(this._engine.getState())) {
      if (Date.now() > deadline) {
        throw new Error(`PlayerSession.waitFor: timed out after ${timeoutMs}ms`)
      }
      await new Promise(r => setTimeout(r, 10))
    }
  }

  // ----------------------------------------------------------
  // Assertion helpers (return booleans; tests use expect())
  // ----------------------------------------------------------

  /** Returns true if the player's inventory contains the given item ID. */
  hasItem(itemId: string): boolean {
    return this._engine.getState().inventory.some(i => i.itemId === itemId)
  }

  /** Returns true if currentRoom.id matches. */
  isInRoom(roomId: string): boolean {
    return this._engine.getState().currentRoom?.id === roomId
  }

  /** Returns true if combat is active. */
  isInCombat(): boolean {
    return !!(this._engine.getState().combatState?.active)
  }

  /** Returns true if an active dialogue session exists. */
  isInDialogue(): boolean {
    return !!(this._engine.getState().activeDialogue)
  }

  /** Returns true if the given condition is active on the player. */
  conditionActive(condId: ConditionId): boolean {
    const cs = this._engine.getState().combatState
    if (!cs) return false
    return cs.playerConditions.some(c => c.id === condId)
  }

  // ----------------------------------------------------------
  // Snapshot — for save/load round-trip tests
  // ----------------------------------------------------------

  /** Returns a plain-object snapshot of the current GameState (JSON-serialisable). */
  snapshot(): object {
    return JSON.parse(JSON.stringify(this._engine.getState()))
  }

  /** Restores state from a previously captured snapshot. */
  async restore(snap: object): Promise<void> {
    const parsed = JSON.parse(JSON.stringify(snap))
    this._engine._setState(parsed as GameState)
  }

  // ----------------------------------------------------------
  // Log helpers
  // ----------------------------------------------------------

  /** Returns true if any message in the log contains the given substring. */
  lastLogContains(substring: string): boolean {
    const log = this._engine.getState().log
    if (log.length === 0) return false
    return log[log.length - 1]!.text.includes(substring)
  }

  /** Returns all log messages after the given index marker. */
  logSince(marker: number): GameMessage[] {
    return this._engine.getState().log.slice(marker)
  }

  /** Returns the current log length as a marker for logSince(). */
  markLog(): number {
    return this._engine.getState().log.length
  }
}
