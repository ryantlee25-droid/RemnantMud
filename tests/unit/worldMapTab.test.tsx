// ============================================================
// tests/unit/worldMapTab.test.tsx
// WorldMapTab — interactive SVG world map component tests
// ============================================================

import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import type { Room, ZoneType, PlayerLedger, GameState } from '@/types/game'

// ── Hoist room stubs so vi.mock factories can reference them ────────────────
// vi.mock calls are hoisted to top of file; top-level consts are NOT available
// inside factory functions unless hoisted via vi.hoisted.

const { ROOM_A, ROOM_B } = vi.hoisted(() => {
  const ROOM_A: Room = {
    id: 'room_a',
    name: 'Room Alpha',
    description: 'First room.',
    shortDescription: 'Alpha.',
    zone: 'crossroads' as ZoneType,
    difficulty: 1,
    visited: true,
    flags: {},
    exits: { east: 'room_b' },
    items: ['item_1'],
    enemies: [],
    npcs: [],
  }

  const ROOM_B: Room = {
    id: 'room_b',
    name: 'Room Beta',
    description: 'Second room.',
    shortDescription: 'Beta.',
    zone: 'the_ember' as ZoneType,
    difficulty: 4,
    visited: false,
    flags: {},
    exits: { west: 'room_a' },
    items: [],
    enemies: [],
    npcs: [],
  }

  return { ROOM_A, ROOM_B }
})

// ── Mock ALL_ROOMS ──────────────────────────────────────────────────────────

vi.mock('@/data/rooms/index', () => ({
  ALL_ROOMS: [ROOM_A, ROOM_B],
}))

// ── Mock H2 computeLayout ───────────────────────────────────────────────────

vi.mock('@/lib/mapLayout', () => ({
  computeLayout: vi.fn(() => ({
    positions: new Map([
      ['room_a', { x: 0, y: 0 }],
      ['room_b', { x: 1, y: 0 }],
    ]),
    bounds: { minX: 0, maxX: 1, minY: 0, maxY: 0 },
  })),
}))

// ── Mock H2 zoneMetadata ────────────────────────────────────────────────────

vi.mock('@/data/zoneMetadata', () => ({
  ZONE_META: {
    crossroads:   { label: 'The Crossroads',  color: 'text-amber-400',   dangerTier: 1 },
    river_road:   { label: 'River Road',       color: 'text-blue-400',    dangerTier: 2 },
    covenant:     { label: 'The Covenant',     color: 'text-purple-400',  dangerTier: 2 },
    salt_creek:   { label: 'Salt Creek',        color: 'text-yellow-400',  dangerTier: 2 },
    the_ember:    { label: 'The Ember',         color: 'text-red-400',     dangerTier: 5 },
    the_breaks:   { label: 'The Breaks',        color: 'text-orange-400',  dangerTier: 3 },
    the_dust:     { label: 'The Dust',          color: 'text-gray-400',    dangerTier: 3 },
    the_stacks:   { label: 'The Stacks',        color: 'text-green-400',   dangerTier: 4 },
    duskhollow:   { label: 'Duskhollow',        color: 'text-indigo-400',  dangerTier: 4 },
    the_deep:     { label: 'The Deep',          color: 'text-cyan-400',    dangerTier: 5 },
    the_pine_sea: { label: 'The Pine Sea',      color: 'text-emerald-400', dangerTier: 3 },
    the_scar:     { label: 'The Scar',          color: 'text-rose-400',    dangerTier: 5 },
    the_pens:     { label: 'The Pens',          color: 'text-stone-400',   dangerTier: 4 },
  },
  ZONE_HEX: {
    crossroads:   '#d97706',
    river_road:   '#3b82f6',
    covenant:     '#a855f7',
    salt_creek:   '#eab308',
    the_ember:    '#ef4444',
    the_breaks:   '#f97316',
    the_dust:     '#6b7280',
    the_stacks:   '#22c55e',
    duskhollow:   '#6366f1',
    the_deep:     '#06b6d4',
    the_pine_sea: '#10b981',
    the_scar:     '#f43f5e',
    the_pens:     '#78716c',
  },
}))

// ── Mock useGame ────────────────────────────────────────────────────────────

const makeState = (overrides: Partial<GameState> = {}): GameState => ({
  player: null,
  currentRoom: ROOM_A,
  inventory: [],
  combatState: null,
  log: [],
  loading: false,
  initialized: true,
  playerDead: false,
  ledger: {
    playerId: 'p1',
    worldSeed: 1,
    currentCycle: 1,
    totalDeaths: 0,
    pressureLevel: 0,
    discoveredRoomIds: ['room_a', 'room_b'],
    squirrelAlive: true,
    squirrelTrust: 0,
    squirrelCyclesKnown: 0,
  } satisfies PlayerLedger,
  stash: [],
  roomsExplored: 1,
  endingTriggered: false,
  endingChoice: null,
  activeBuffs: [],
  ...overrides,
})

vi.mock('@/lib/gameContext', () => ({
  useGame: vi.fn(() => ({
    state: makeState(),
    dispatch: vi.fn(),
    engine: {},
  })),
}))

import { useGame } from '@/lib/gameContext'
import WorldMapTab from '@/components/tabs/WorldMapTab'

// Helper to set useGame return value
function setGameState(overrides: Partial<GameState> = {}) {
  vi.mocked(useGame).mockReturnValue({
    state: makeState(overrides),
    dispatch: vi.fn(),
    engine: {} as never,
  })
}

// ============================================================
// Tests
// ============================================================

describe('WorldMapTab', () => {
  beforeEach(() => {
    setGameState({
      currentRoom: ROOM_A,
      ledger: {
        playerId: 'p1',
        worldSeed: 1,
        currentCycle: 1,
        totalDeaths: 0,
        pressureLevel: 0,
        discoveredRoomIds: ['room_a', 'room_b'],
        squirrelAlive: true,
        squirrelTrust: 0,
        squirrelCyclesKnown: 0,
      },
    })
  })

  // 1. Loading state
  it('renders "Loading world..." when ledger is null', () => {
    setGameState({ currentRoom: ROOM_A, ledger: null })
    render(<WorldMapTab />)
    expect(screen.getByText('Loading world...')).toBeTruthy()
  })

  it('renders "Loading world..." when currentRoom is null', () => {
    setGameState({ currentRoom: null })
    render(<WorldMapTab />)
    expect(screen.getByText('Loading world...')).toBeTruthy()
  })

  // 2. Both visited rooms render their rects
  it('renders both room rects when both rooms are visited', () => {
    setGameState({
      currentRoom: ROOM_A,
      ledger: {
        playerId: 'p1',
        worldSeed: 1,
        currentCycle: 1,
        totalDeaths: 0,
        pressureLevel: 0,
        discoveredRoomIds: ['room_a', 'room_b'],
        squirrelAlive: true,
        squirrelTrust: 0,
        squirrelCyclesKnown: 0,
      },
    })
    const { container } = render(<WorldMapTab />)
    const rects = container.querySelectorAll('rect')
    expect(rects.length).toBe(2)
  })

  // 3. Fog on + only A visited → B rect NOT rendered
  it('does not render unvisited room rect when fog of war is on (default)', () => {
    setGameState({
      currentRoom: ROOM_A,
      ledger: {
        playerId: 'p1',
        worldSeed: 1,
        currentCycle: 1,
        totalDeaths: 0,
        pressureLevel: 0,
        discoveredRoomIds: [], // only room_a is visible (via currentRoomId)
        squirrelAlive: true,
        squirrelTrust: 0,
        squirrelCyclesKnown: 0,
      },
    })
    const { container } = render(<WorldMapTab />)
    const rects = container.querySelectorAll('rect')
    // Only room_a renders (fog is on, room_b not in visitedIds)
    expect(rects.length).toBe(1)
  })

  // 4. After clicking FOG toggle off, B's rect renders at opacity 0.3
  it('renders unvisited room rect with low opacity after toggling fog off', () => {
    setGameState({
      currentRoom: ROOM_A,
      ledger: {
        playerId: 'p1',
        worldSeed: 1,
        currentCycle: 1,
        totalDeaths: 0,
        pressureLevel: 0,
        discoveredRoomIds: [],
        squirrelAlive: true,
        squirrelTrust: 0,
        squirrelCyclesKnown: 0,
      },
    })
    const { container } = render(<WorldMapTab />)

    // Initially only 1 rect
    expect(container.querySelectorAll('rect').length).toBe(1)

    // Click the FOG button to disable fog
    const fogButton = screen.getByRole('button', { name: 'FOG' })
    fireEvent.click(fogButton)

    // Now both rects should render
    const rects = container.querySelectorAll('rect')
    expect(rects.length).toBe(2)

    // The unvisited room (room_b) should have opacity 0.3
    const opacities = Array.from(rects).map((r) => r.getAttribute('opacity'))
    expect(opacities).toContain('0.3')
  })

  // 5. Clicking a visited room's <g> opens modal with the room name
  it('opens modal with room name when clicking a visited room', () => {
    setGameState({
      currentRoom: ROOM_A,
      ledger: {
        playerId: 'p1',
        worldSeed: 1,
        currentCycle: 1,
        totalDeaths: 0,
        pressureLevel: 0,
        discoveredRoomIds: ['room_a', 'room_b'],
        squirrelAlive: true,
        squirrelTrust: 0,
        squirrelCyclesKnown: 0,
      },
    })
    const { container } = render(<WorldMapTab />)

    // Find the <g> for room_a and click it
    const gElements = container.querySelectorAll('g[data-room-id="room_a"]')
    expect(gElements.length).toBeGreaterThan(0)
    fireEvent.click(gElements[0])

    // Modal should be open with room_a's name
    const dialog = screen.getByRole('dialog')
    expect(dialog).toBeTruthy()
    expect(screen.getByText('Room Alpha')).toBeTruthy()
  })

  // 6. Clicking the backdrop closes the modal
  it('closes the modal when clicking the backdrop', () => {
    setGameState({
      currentRoom: ROOM_A,
      ledger: {
        playerId: 'p1',
        worldSeed: 1,
        currentCycle: 1,
        totalDeaths: 0,
        pressureLevel: 0,
        discoveredRoomIds: ['room_a', 'room_b'],
        squirrelAlive: true,
        squirrelTrust: 0,
        squirrelCyclesKnown: 0,
      },
    })
    const { container } = render(<WorldMapTab />)

    // Open the modal first
    const gElements = container.querySelectorAll('g[data-room-id="room_a"]')
    fireEvent.click(gElements[0])
    expect(screen.getByRole('dialog')).toBeTruthy()

    // Click the backdrop
    const backdrop = container.querySelector('.absolute.inset-0')
    expect(backdrop).toBeTruthy()
    fireEvent.click(backdrop!)

    // Modal should be gone
    expect(screen.queryByRole('dialog')).toBeNull()
  })
})
