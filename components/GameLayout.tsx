'use client'

// ============================================================
// GameLayout.tsx — Split-pane terminal layout
// Left: terminal + command input. Right: sidebar. Full viewport.
// ============================================================

import React from 'react'

interface GameLayoutProps {
  children: React.ReactNode   // terminal content area
  sidebar: React.ReactNode    // sidebar panel
  input: React.ReactNode      // command input at bottom of terminal column
  showSidebar?: boolean       // default true; false hides sidebar
}

export default function GameLayout({
  children,
  sidebar,
  input,
  showSidebar = true,
}: GameLayoutProps) {
  return (
    <div className="h-screen w-screen bg-black flex flex-col overflow-hidden">
      {/* Main content: terminal + sidebar */}
      <div className="flex-1 flex min-h-0">
        {/* Left column: terminal */}
        <div className="flex-1 flex flex-col min-w-0">
          <div className="flex-1 overflow-y-auto min-h-0">
            {children}
          </div>
        </div>

        {/* Right column: sidebar */}
        {showSidebar && (
          <div className="hidden lg:flex w-72 xl:w-80 flex-shrink-0 flex-col border-l border-gray-800 overflow-y-auto">
            {sidebar}
          </div>
        )}
      </div>

      {/* Bottom: command input spanning full width */}
      {input !== null && (
        <div className="flex-shrink-0 border-t border-gray-800">
          {input}
        </div>
      )}
    </div>
  )
}
