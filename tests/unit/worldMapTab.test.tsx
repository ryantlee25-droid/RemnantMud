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

// NOTE: Keep test colors inside the PipBoy-safe palette
// (amber/red/green/blue/cyan/orange/gray) so mocks cannot smuggle in
// off-brand values that the production contract forbids.
vi.mock('@/data/zoneMetadata', () => ({
  ZONE_META: {
    crossroads:   { label: 'Crossroads',  color: 'text-amber-400', dangerTier: 1 },
    river_road:   { label: 'River Road',  color: 'text-green-500', dangerTier: 2 },
    covenant:     { label: 'Covenant',    color: 'text-blue-400',  dangerTier: 2 },
    salt_creek:   { label: 'Salt Creek',  color: 'text-cyan-500',  dangerTier: 2 },
    the_ember:    { label: 'The Ember',   color: 'text-orange-500',dangerTier: 5 },
    the_breaks:   { label: 'The Breaks',  color: 'text-amber-600', dangerTier: 3 },
    the_dust:     { label: 'The Dust',    color: 'text-amber-500', dangerTier: 3 },
    the_stacks:   { label: 'The Stacks',  color: 'text-cyan-400',  dangerTier: 4 },
    duskhollow:   { label: 'Duskhollow',  color: 'text-blue-500',  dangerTier: 4 },
    the_deep:     { label: 'The Deep',    color: 'text-blue-600',  dangerTier: 5 },
    the_pine_sea: { label: 'The Pine Sea',color: 'text-green-400', dangerTier: 3 },
    the_scar:     { label: 'The Scar',    color: 'text-red-500',   dangerTier: 5 },
    the_pens:     { label: 'The Pens',    color: 'text-red-400',   dangerTier: 4 },
  },
  ZONE_HEX: {
    crossroads:   '#fbbf24',
    river_road:   '#22c55e',
    covenant:     '#60a5fa',
    salt_creek:   '#06b6d4',
    the_ember:    '#f97316',
    the_breaks:   '#d97706',
    the_dust:     '#f59e0b',
    the_stacks:   '#22d3ee',
    duskhollow:   '#3b82f6',
    the_deep:     '#2563eb',
    the_pine_sea: '#4ade80',
    the_scar:     '#ef4444',
    the_pens:     '#f87171',
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
