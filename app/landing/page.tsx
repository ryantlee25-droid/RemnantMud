// ============================================================
// /landing — Clean landing page for The Remnant MUD
// Server Component: zero client JS, fully static on Vercel
// ============================================================

import Link from 'next/link'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'The Remnant -- Post-Apocalyptic Text MUD',
  description:
    'A single-player text adventure set 7 years after the CHARON-7 bioweapon collapse. 271 rooms, 4 endings, branching dialogue. Play free in your browser.',
  openGraph: {
    title: 'The Remnant',
    description: "What is left is what matters.",
    type: 'website',
  },
}

export const revalidate = false

const FEATURES = [
  { label: '271 hand-crafted rooms across 14 zones' },
  { label: '7 character classes with unique abilities' },
  { label: '4 morally complex endings' },
  { label: 'Faction reputation that shapes the world' },
  { label: 'Death is not the end -- the cycle continues' },
  { label: 'Crafting, combat, companions, mysteries' },
]

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-gray-950 font-mono text-gray-200">
      <div className="max-w-5xl mx-auto px-6 py-16 sm:py-24">

        {/* Title */}
        <div className="text-center mb-16">
          <h1 className="text-4xl sm:text-5xl font-bold text-white tracking-tight mb-4">
            THE REMNANT
          </h1>
          <p className="text-lg text-gray-400">
            A Post-Collapse Text Adventure
          </p>
        </div>

        {/* Hero */}
        <div className="max-w-2xl mx-auto text-center mb-16">
          <p className="text-gray-300 leading-relaxed">
            Seven years after CHARON-7 ended the world, someone is still
            broadcasting from inside the facility everyone said was destroyed.
            You are a Revenant — you die, you come back, you remember. Find the
            source of the signal.
          </p>
        </div>

        {/* Features Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-16 max-w-3xl mx-auto">
          {FEATURES.map((f) => (
            <div
              key={f.label}
              className="border border-gray-800 rounded px-4 py-3 text-sm text-gray-300"
            >
              {f.label}
            </div>
          ))}
        </div>

        {/* Terminal Preview */}
        <div className="max-w-2xl mx-auto mb-16">
          <div className="border border-gray-800 rounded overflow-hidden">
            <div className="bg-gray-900 px-4 py-2 text-xs text-gray-500 border-b border-gray-800">
              Terminal Preview
            </div>
            <div className="bg-black p-4 text-sm leading-relaxed space-y-2">
              <div>
                <span className="text-gray-500">&gt; </span>
                <span className="text-gray-200">look</span>
              </div>
              <div className="text-gray-300 pl-4">
                The market is a sprawl of tarps and salvaged tent poles. A
                hand-lettered sign reads{' '}
                <span className="text-yellow-400">TRADES WELCOME</span>. The
                air smells like woodsmoke and boiled leather.
              </div>
              <div className="text-gray-300 pl-4">
                Exits:{' '}
                <span className="text-green-400">north</span>,{' '}
                <span className="text-green-400">south</span>,{' '}
                <span className="text-green-400">east</span>
              </div>
              <div className="text-gray-300 pl-4">
                A <span className="text-cyan-400">weathered merchant</span>{' '}
                stands behind a counter of scavenged goods.
              </div>
              <div className="mt-2">
                <span className="text-gray-500">&gt; </span>
                <span className="text-gray-200">talk merchant</span>
              </div>
              <div className="text-gray-300 pl-4">
                &quot;What do you need? I&apos;ve got ammunition, bandages, and
                information. The information costs more.&quot;
              </div>
            </div>
          </div>
        </div>

        {/* CTA */}
        <div className="text-center mb-16">
          <Link
            href="/login"
            className="inline-block bg-white text-gray-950 font-bold px-8 py-3 rounded text-sm tracking-wide hover:bg-gray-200 transition-colors"
          >
            PLAY NOW
          </Link>
        </div>

        {/* Footer */}
        <div className="text-center text-sm text-gray-500">
          Free to play. Browser-based. No download required.
        </div>

      </div>
    </div>
  )
}
