# Playtest harness

Scenario-driven integration tests for The Remnant. `PlayerSession` wraps `GameEngine` with deterministic RNG, Supabase in-memory mock, and ergonomic assertion helpers.

## When to use

Use `PlayerSession` for end-to-end scenario tests: create a character, walk rooms, issue commands, assert state. For pure unit tests (e.g. combat math), use the lightweight mock factories in `tests/integration/`.

## Quick start

```ts
import { describe, it, expect, vi } from 'vitest'
import { buildMockDb, PlayerSession } from './harness'

const mockDb = buildMockDb()
vi.mock('@/lib/supabase', () => ({ createSupabaseBrowserClient: () => mockDb }))
// ... silence narrative pipeline (copy vi.mock calls from harness.smoke.test.ts)

import { PlayerSession } from './harness'

it('walks and fights', async () => {
  const session = new PlayerSession({ mockRandom: 0.8 })
  await session.create({
    name: 'Riven',
    characterClass: 'scout',
    stats: { vigor: 4, grit: 4, reflex: 6, wits: 5, presence: 3, shadow: 6 },
    personalLoss: { type: 'partner' },
  })

  await session.walk(['north'])
  expect(session.isInRoom('cr_02_gate')).toBe(true)

  const mark = session.markLog()
  await session.cmd('look')
  expect(session.logSince(mark).length).toBeGreaterThan(0)

  await session.destroy()
})
```

## API

### `PlayerSession(options?)`

| Option | Default | Description |
|--------|---------|-------------|
| `mockRandom` | `0.5` | Pins `Math.random` for deterministic spawns and combat rolls |
| `mockRoomPopulation` | `true` | Uses pinned RNG in `_applyPopulation` |

**Setup:** `create(spec)` — creates character, resets in-memory DB, pins RNG  
**Teardown:** `destroy()` — restores `Math.random`, safe to call multiple times

**State reads:** `state`, `player`, `currentRoom`, `inventory`, `log`

**Commands:** `cmd(input)` dispatches through the parser; `walk(directions[])` calls `cmd('go <dir>')` for each step

**Assertions:** `hasItem(id)`, `isInRoom(id)`, `isInCombat()`, `isInDialogue()`, `conditionActive(id)`

**Snapshots:** `snapshot()` / `restore(snap)` for save/load round-trip tests

**Log helpers:** `lastLogContains(str)`, `logSince(marker)`, `markLog()`

## Mock boilerplate

Every test file must declare `vi.mock()` calls before importing. Copy the full block from `harness.smoke.test.ts`. Required mocks: `@/lib/supabase`, `@/lib/world`, `@/lib/inventory`, `@/data/items`, plus all narrative pipeline modules.
