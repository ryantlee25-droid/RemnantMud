'use client'

// ============================================================
// RemnantLogo.tsx — DOOM-style ASCII art logo for THE REMNANT
// ============================================================

interface RemnantLogoProps {
  size: 'full' | 'compact'
}

// Each line is exactly 68 chars wide (fits 70-col terminal)
const FULL_LOGO = [
  '████████╗██╗  ██╗███████╗',
  '╚══██╔══╝██║  ██║██╔════╝',
  '   ██║   ███████║█████╗  ',
  '   ██║   ██╔══██║██╔══╝  ',
  '   ██║   ██║  ██║███████╗',
  '   ╚═╝   ╚═╝  ╚═╝╚══════╝',
  '',
  '████████╗███████╗███╗  ███╗███╗  ██╗ █████╗ ███╗  ██╗████████╗',
  '██╔═══██║██╔════╝████╗████║████╗ ██║██╔══██╗████╗ ██║╚══██╔══╝',
  '████████║█████╗  ██╔███╔██║██╔██╗██║███████║██╔██╗██║   ██║   ',
  '██╔═══██╝██╔══╝  ██║╚█╔╝██║██║╚████║██╔══██║██║╚████║   ██║   ',
  '██║   ██╗███████╗██║ ╚╝ ██║██║ ╚███║██║  ██║██║ ╚███║   ██║   ',
  '╚═╝   ╚═╝╚══════╝╚═╝    ╚═╝╚═╝  ╚══╝╚═╝  ╚═╝╚═╝  ╚══╝   ╚═╝   ',
]

const COMPACT_LOGO = [
  '████████╗███████╗███╗  ███╗███╗  ██╗ █████╗ ███╗  ██╗████████╗',
  '██╔═══██║██╔════╝████╗████║████╗ ██║██╔══██╗████╗ ██║╚══██╔══╝',
  '████████║█████╗  ██╔███╔██║██╔██╗██║███████║██╔██╗██║   ██║   ',
  '██╔═══██╝██╔══╝  ██║╚█╔╝██║██║╚████║██╔══██║██║╚████║   ██║   ',
  '██║   ██╗███████╗██║ ╚╝ ██║██║ ╚███║██║  ██║██║ ╚███║   ██║   ',
  '╚═╝   ╚═╝╚══════╝╚═╝    ╚═╝╚═╝  ╚══╝╚═╝  ╚═╝╚═╝  ╚══╝   ╚═╝   ',
]

export default function RemnantLogo({ size }: RemnantLogoProps) {
  const lines = size === 'full' ? FULL_LOGO : COMPACT_LOGO

  return (
    <div className="flex flex-col items-center">
      <pre
        className="font-mono text-amber-300 leading-none select-none"
        style={{ fontSize: size === 'full' ? '0.55rem' : '0.45rem' }}
        aria-label="The Remnant"
      >
        {lines.join('\n')}
      </pre>
      {size === 'full' && (
        <div className="text-amber-600 text-xs tracking-widest mt-3">
          What&apos;s left is what matters.
        </div>
      )}
    </div>
  )
}
