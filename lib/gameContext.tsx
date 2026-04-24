'use client'

// ============================================================
// gameContext.tsx — React context wrapping GameEngine
// ============================================================

import {
  createContext,
  useContext,
  useState,
  useEffect,
  useRef,
  useCallback,
  type ReactNode,
} from 'react'
import { GameEngine } from '@/lib/gameEngine'
import type { GameState, Action } from '@/types/game'

// ------------------------------------------------------------
// Context shape
// ------------------------------------------------------------

interface GameContextValue {
  state: GameState
  dispatch: (action: Action) => Promise<void>
  engine: GameEngine
}

const GameContext = createContext<GameContextValue | null>(null)

// ------------------------------------------------------------
// Provider
// ------------------------------------------------------------

export function GameProvider({ children }: { children: ReactNode }) {
  const engineRef = useRef<GameEngine>(new GameEngine())
  const engine = engineRef.current

  const [state, setStateLocal] = useState<GameState>(engine.getState())

  useEffect(() => {
    const unsub = engine.subscribe((newState) => {
      setStateLocal(newState)
    })
    return unsub
  }, [engine])

  const isDispatching = useRef(false)

  const dispatch = useCallback(
    async (action: Action) => {
      if (isDispatching.current) return
      isDispatching.current = true
      try {
        await engine.executeAction(action)
      } finally {
        isDispatching.current = false
      }
    },
    [engine],
  )

  return (
    <GameContext.Provider value={{ state, dispatch, engine }}>
      {children}
    </GameContext.Provider>
  )
}

// ------------------------------------------------------------
// Hook
// ------------------------------------------------------------

export function useGame(): GameContextValue {
  const ctx = useContext(GameContext)
  if (!ctx) throw new Error('useGame must be used inside <GameProvider>')
  return ctx
}
