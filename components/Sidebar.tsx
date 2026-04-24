'use client'

// ============================================================
// Sidebar.tsx — Tabbed container: STATS / MAP / INV / DATA
// Renders in the right 30% slot of GameLayout.
// ============================================================

import { useState } from 'react'
import TabBar from '@/components/tabs/TabBar'
import StatsTab from '@/components/tabs/StatsTab'
// @ts-expect-error — provided by parallel Howler
import WorldMapTab from '@/components/tabs/WorldMapTab'
// @ts-expect-error — provided by parallel Howler
import InventoryTab from '@/components/tabs/InventoryTab'
// @ts-expect-error — provided by parallel Howler
import DataTab from '@/components/tabs/DataTab'

const TABS = [
  { id: 'stats', label: 'STATS' },
  { id: 'map',   label: 'MAP'   },
  { id: 'inv',   label: 'INV'   },
  { id: 'data',  label: 'DATA'  },
] as const

type TabId = 'stats' | 'map' | 'inv' | 'data'

export default function Sidebar() {
  const [active, setActive] = useState<TabId>('stats')

  return (
    <div className="bg-gray-950 h-full font-mono text-xs flex flex-col">
      {/* Title bar */}
      <div className="text-amber-400 text-sm tracking-widest border-b border-amber-900 px-3 py-2 text-center">
        THE REMNANT
      </div>

      {/* Tab bar */}
      <TabBar
        tabs={[...TABS]}
        active={active}
        onChange={id => setActive(id as TabId)}
      />

      {/* Tab panels */}
      <div className="flex-1 overflow-y-auto">
        {active === 'stats' && <StatsTab />}
        {active === 'map'   && <WorldMapTab />}
        {active === 'inv'   && <InventoryTab />}
        {active === 'data'  && <DataTab />}
      </div>
    </div>
  )
}
