'use client'

// ============================================================
// WorldMapTab.tsx — Interactive SVG world map with fog of war,
// danger overlay, reveal-all, center-on-player, and room modal.
// Replaces the ASCII MiniMap for the full 13-zone room graph.
// ============================================================

import {
  useState,
  useRef,
  useEffect,
  useMemo,
  useCallback,
  type KeyboardEvent,
} from 'react'
import { useGame } from '@/lib/gameContext'
import { ALL_ROOMS } from '@/data/rooms/index'
import type { Room, ZoneType } from '@/types/game'

import { computeLayout } from '@/lib/mapLayout'
import type { LayoutResult } from '@/lib/mapLayout'
import { ZONE_META, ZONE_HEX } from '@/data/zoneMetadata'
import type { ZoneMeta } from '@/data/zoneMetadata'

// Constants
const CELL = 20
const ROOM_SIZE = 16

// ============================================================
// Inner component — receives all loaded data; all hooks at top
// ============================================================

interface WorldMapInnerProps {
  currentRoomId: string
  discoveredRoomIds: string[]
}

function WorldMapInner({ currentRoomId, discoveredRoomIds }: WorldMapInnerProps) {
  // Toggle controls
  const [fogOfWar, setFogOfWar] = useState(true)
  const [dangerOverlay, setDangerOverlay] = useState(true)
  const [revealAll, setRevealAll] = useState(false)

  // Modal state
  const [selectedRoomId, setSelectedRoomId] = useState<string | null>(null)
  const lastTriggerRef = useRef<SVGGElement | null>(null)

  // Container ref for scroll control
  const containerRef = useRef<HTMLDivElement | null>(null)

  // Modal close-button ref (receives focus when modal opens)
  const closeButtonRef = useRef<HTMLButtonElement | null>(null)

  // ALL_ROOMS is module-stable; roomMap can be built once for the component's lifetime
  const roomMap = useMemo(
    () => new Map<string, Room>(ALL_ROOMS.map((r) => [r.id, r])),
    [],
  )

  // visitedIds depends on the (stable) discoveredRoomIds array and currentRoomId
  const visitedIds = useMemo(
    () => new Set([...discoveredRoomIds, currentRoomId]),
    [discoveredRoomIds, currentRoomId],
  )

  // Layout memoized on anchor + visited set
  const layout = useMemo<LayoutResult>(
    () => computeLayout(ALL_ROOMS, currentRoomId, visitedIds, 10),
    [currentRoomId, visitedIds],
  )
  const { positions, bounds } = layout

  const svgWidth = (bounds.maxX - bounds.minX + 1) * CELL
  const svgHeight = (bounds.maxY - bounds.minY + 1) * CELL

  // Helper: compute SVG coordinates for a room
  function getRoomCoords(roomId: string): { cx: number; cy: number } | null {
    const pos = positions.get(roomId)
    if (!pos) return null
    return {
      cx: (pos.x - bounds.minX) * CELL + CELL / 2,
      cy: (pos.y - bounds.minY) * CELL + CELL / 2,
    }
  }

  // Center on current room
  const centerOnCurrentRoom = useCallback(() => {
    const container = containerRef.current
    if (!container) return
    const pos = positions.get(currentRoomId)
    if (!pos) return
    const cx = (pos.x - bounds.minX) * CELL + CELL / 2
    const cy = (pos.y - bounds.minY) * CELL + CELL / 2
    container.scrollLeft = cx - container.clientWidth / 2
    container.scrollTop = cy - container.clientHeight / 2
  }, [currentRoomId, positions, bounds])

  // Scroll to current room on mount
  useEffect(() => {
    centerOnCurrentRoom()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const closeModal = useCallback(() => {
    setSelectedRoomId(null)
    setTimeout(() => {
      lastTriggerRef.current?.focus()
    }, 0)
  }, [])

  // ESC closes modal
  useEffect(() => {
    if (!selectedRoomId) return
    function onKeyDown(e: globalThis.KeyboardEvent) {
      if (e.key === 'Escape') closeModal()
    }
    window.addEventListener('keydown', onKeyDown)
    return () => window.removeEventListener('keydown', onKeyDown)
  }, [selectedRoomId, closeModal])

  // Move focus into the modal when it opens so keyboard/screen-reader users
  // can reach its controls. Pairs with the focus-restore on close.
  useEffect(() => {
    if (!selectedRoomId) return
    closeButtonRef.current?.focus()
  }, [selectedRoomId])

  // Determine if a room should be rendered at all
  function isRoomVisible(roomId: string): boolean {
    if (visitedIds.has(roomId)) return true
    return !fogOfWar || revealAll
  }

  // ============================================================
  // Render connectors (east + south only to avoid double-draw)
  // ============================================================
  const connectors: React.ReactNode[] = []
  for (const [roomId] of positions) {
    const room = roomMap.get(roomId)
    if (!room) continue
    if (!isRoomVisible(roomId)) continue
    const fromCoords = getRoomCoords(roomId)
    if (!fromCoords) continue

    for (const dir of ['east', 'south'] as const) {
      const neighborId = room.exits?.[dir]
      if (!neighborId) continue
      if (!positions.has(neighborId)) continue
      if (!isRoomVisible(neighborId)) continue
      const toCoords = getRoomCoords(neighborId)
      if (!toCoords) continue

      connectors.push(
        <line
          key={`${roomId}-${dir}`}
          x1={fromCoords.cx}
          y1={fromCoords.cy}
          x2={toCoords.cx}
          y2={toCoords.cy}
          stroke="rgba(146, 64, 14, 0.6)"
          strokeWidth={1}
        />,
      )
    }
  }

  // ============================================================
  // Render room nodes
  // ============================================================
  const roomNodes: React.ReactNode[] = []
  for (const [roomId] of positions) {
    const room = roomMap.get(roomId)
    if (!room) continue
    if (!isRoomVisible(roomId)) continue

    const coords = getRoomCoords(roomId)
    if (!coords) continue
    const { cx, cy } = coords

    const isCurrentRoom = room.id === currentRoomId
    const visited = visitedIds.has(room.id)
    const zoneMeta = (ZONE_META as Record<ZoneType, ZoneMeta>)[room.zone]
    const fillColor = (ZONE_HEX as Record<ZoneType, string>)[room.zone]
    const dangerTier = zoneMeta.dangerTier

    const opacity = visited ? 1 : 0.3

    let strokeColor: string
    let strokeWidth: number
    if (isCurrentRoom) {
      strokeColor = '#fbbf24'
      strokeWidth = 2
    } else if (dangerOverlay && dangerTier >= 4) {
      strokeColor = 'rgba(239,68,68,0.6)'
      strokeWidth = 1
    } else {
      strokeColor = 'none'
      strokeWidth = 0
    }

    const rectClassName = isCurrentRoom ? 'animate-pulse' : undefined

    // Capture room id for closure
    const capturedRoomId = room.id

    roomNodes.push(
      <g
        key={roomId}
        tabIndex={0}
        data-room-id={roomId}
        onClick={(e) => {
          lastTriggerRef.current = e.currentTarget
          setSelectedRoomId(capturedRoomId)
        }}
        onKeyDown={(e: KeyboardEvent<SVGGElement>) => {
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault()
            lastTriggerRef.current = e.currentTarget
            setSelectedRoomId(capturedRoomId)
          }
        }}
        style={{ cursor: 'pointer' }}
      >
        <rect
          x={cx - ROOM_SIZE / 2}
          y={cy - ROOM_SIZE / 2}
          width={ROOM_SIZE}
          height={ROOM_SIZE}
          fill={fillColor}
          opacity={opacity}
          rx={1}
          stroke={strokeColor}
          strokeWidth={strokeWidth}
          className={rectClassName}
        />
        <title>{`${room.name} — ${zoneMeta.label}`}</title>
      </g>,
    )
  }

  // ============================================================
  // Modal content
  // ============================================================
  const selectedRoom = selectedRoomId ? roomMap.get(selectedRoomId) : null
  const selectedVisited = selectedRoomId ? visitedIds.has(selectedRoomId) : false

  return (
    <div role="tabpanel" id="tabpanel-map" aria-labelledby="tab-map" className="flex flex-col h-full">
      {/* Controls row */}
      <div className="flex gap-1 p-2 border-b border-amber-900">
        <button
          className={`text-amber-400 border border-amber-800 px-2 py-0.5 font-mono text-xs hover:border-amber-600${fogOfWar ? ' bg-amber-900' : ''}`}
          aria-pressed={fogOfWar}
          onClick={() => setFogOfWar((v) => !v)}
        >
          FOG
        </button>
        <button
          className={`text-amber-400 border border-amber-800 px-2 py-0.5 font-mono text-xs hover:border-amber-600${dangerOverlay ? ' bg-amber-900' : ''}`}
          aria-pressed={dangerOverlay}
          onClick={() => setDangerOverlay((v) => !v)}
        >
          DANGER
        </button>
        <button
          className={`text-amber-400 border border-amber-800 px-2 py-0.5 font-mono text-xs hover:border-amber-600${revealAll ? ' bg-amber-900' : ''}`}
          aria-pressed={revealAll}
          onClick={() => setRevealAll((v) => !v)}
        >
          REVEAL
        </button>
        <button
          className="text-amber-400 border border-amber-800 px-2 py-0.5 font-mono text-xs hover:border-amber-600"
          aria-label="Center on current room"
          onClick={centerOnCurrentRoom}
        >
          CENTER
        </button>
      </div>

      {/* SVG + modal share this positioned container */}
      <div ref={containerRef} className="relative overflow-auto flex-1">
        <svg
          viewBox={`0 0 ${svgWidth} ${svgHeight}`}
          width={svgWidth}
          height={svgHeight}
          xmlns="http://www.w3.org/2000/svg"
          style={{ display: 'block' }}
        >
          {connectors}
          {roomNodes}
        </svg>

        {/* Modal overlay */}
        {selectedRoomId && selectedRoom && (
          <div
            className="absolute inset-0 bg-black/60 flex items-center justify-center"
            onClick={closeModal}
          >
            <div
              role="dialog"
              aria-modal="true"
              aria-labelledby="world-map-modal-title"
              className="bg-gray-950 border border-amber-600 p-3 font-mono text-xs text-amber-400 min-w-[180px] max-w-[280px] max-h-[80%] overflow-y-auto"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex justify-between items-start mb-2">
                {selectedVisited ? (
                  <h3 id="world-map-modal-title" className="text-amber-300 text-sm">
                    {selectedRoom.name}
                  </h3>
                ) : (
                  <h3 id="world-map-modal-title" className="text-amber-300 text-sm">
                    Unknown
                  </h3>
                )}
                <button
                  ref={closeButtonRef}
                  aria-label="Close"
                  className="text-amber-600 hover:text-amber-400 ml-2"
                  onClick={closeModal}
                >
                  [X]
                </button>
              </div>

              {/* Zone label */}
              <div className="text-amber-600 mb-1">
                {(ZONE_META as Record<ZoneType, ZoneMeta>)[selectedRoom.zone].label}
              </div>

              {selectedVisited ? (
                <>
                  <p className="mb-1">{selectedRoom.shortDescription}</p>

                  {Object.keys(selectedRoom.exits).length > 0 && (
                    <div className="mb-1">
                      <span className="text-amber-600">Exits: </span>
                      {Object.keys(selectedRoom.exits).join(', ')}
                    </div>
                  )}

                  {selectedRoom.npcs && selectedRoom.npcs.length > 0 && (
                    <div className="mb-1">
                      <span className="text-amber-600">NPCs: </span>
                      {selectedRoom.npcs.join(', ')}
                    </div>
                  )}

                  <div>
                    <span className="text-amber-600">Items: </span>
                    {selectedRoom.items?.length ?? 0}
                  </div>
                </>
              ) : (
                <p>Visit to reveal.</p>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

// ============================================================
// Outer component — guards null state; no hooks after guard
// ============================================================

export default function WorldMapTab() {
  const { state } = useGame()

  if (!state.currentRoom || !state.ledger) {
    return (
      <div role="tabpanel" id="tabpanel-map" aria-labelledby="tab-map" className="p-3 text-amber-600 text-xs">
        Loading world...
      </div>
    )
  }

  return (
    <WorldMapInner
      currentRoomId={state.currentRoom.id}
      discoveredRoomIds={state.ledger.discoveredRoomIds}
    />
  )
}
