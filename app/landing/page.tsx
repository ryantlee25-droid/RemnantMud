// ============================================================
// /landing — BBS-style boot screen for The Remnant MUD
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

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-black font-mono text-amber-500">

      {/* CRT scanlines */}
      <div
        className="fixed inset-0 pointer-events-none z-50"
        style={{
          background:
            'repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(0,0,0,0.07) 2px, rgba(0,0,0,0.07) 4px)',
        }}
      />

      <div className="max-w-3xl mx-auto px-4 py-8 relative z-10">

        {/* Boot sequence */}
        <pre className="text-amber-600 text-xs mb-4 leading-tight">{`BIOS v3.14 ... OK
MEM CHECK 640K ... OK
TERMINAL v2.38 ... OK
NETWORK: FOUR CORNERS RELAY ... CONNECTED
SIGNAL LOCK ... ACQUIRED`}</pre>

        {/* Main terminal frame */}
        <pre className="text-amber-400 text-xs leading-tight mb-6">{`
+======================================+
|       T H E   R E M N A N T         |
|   POST-COLLAPSE SURVIVAL TERMINAL   |
+======================================+
|                                      |
|  SYSTEM STATUS: OPERATIONAL          |
|  SIGNAL DETECTED: ACTIVE             |
|  THREAT LEVEL: ELEVATED              |
|  YEAR: 2038  CHARON-7 YEAR SEVEN    |
|                                      |
+--------------------------------------+`}</pre>

        {/* Broadcast */}
        <div className="border border-amber-900 p-4 mb-6">
          <div className="text-amber-600 text-xs mb-2">INCOMING BROADCAST -- SIGNAL ORIGIN: UNKNOWN</div>
          <div className="text-amber-400 text-xs leading-relaxed">
            &quot;...Scar site... containment breach... data survives...
            if you can read, if you can think, if you are still you...
            come to the Four Corners... the answer is here... repeating...&quot;
          </div>
        </div>

        {/* System info */}
        <div className="text-amber-600 text-xs mb-6 space-y-1">
          <div>ROOMS MAPPED: 250+</div>
          <div>ENDINGS DOCUMENTED: 4</div>
          <div>DEATH CYCLES: UNLIMITED</div>
          <div>FACTIONS ACTIVE: 9</div>
          <div>INTERFACE: TEXT COMMAND</div>
        </div>

        {/* Terminal demo */}
        <div className="border border-amber-900 p-4 mb-6">
          <div className="text-amber-600 text-xs mb-2">TERMINAL SESSION EXCERPT</div>
          <div className="text-xs space-y-1">
            <div><span className="text-amber-600">&gt; </span><span className="text-amber-400">look</span></div>
            <div className="text-amber-700 pl-4">The highway curves north through scrub oak and juniper. A hand-painted sign reads COVENANT -- 2 MI.</div>
            <div><span className="text-amber-600">&gt; </span><span className="text-amber-400">go north</span></div>
            <div className="text-amber-700 pl-4">You move toward the road. A dog trots out of the brush and falls in behind you.</div>
            <div><span className="text-amber-600">&gt; </span><span className="text-amber-400">look dog</span></div>
            <div className="text-amber-700 pl-4">Mutt. Medium size. One ear missing. It sits when you stop. It is not growling.</div>
          </div>
        </div>

        {/* Navigation */}
        <div className="mb-6 text-xs space-y-2">
          <div className="text-amber-600 mb-2">SELECT OPTION:</div>
          <div>
            <Link
              href="/login"
              className="text-amber-400 border border-amber-600 px-6 py-2 inline-block text-xs"
            >
              &gt; ENTER TERMINAL
            </Link>
          </div>
        </div>

        {/* Footer */}
        <div className="text-amber-700 text-xs leading-relaxed border-t border-amber-900 pt-4">
          <div>THE REMNANT -- POST-COLLAPSE SURVIVAL TERMINAL</div>
          <div>Four Corners, Colorado -- 2038 -- CHARON-7 Year Seven</div>
          <div>Browser-based. Free. Save persists across sessions.</div>
          <div>NO CLEARANCE REQUIRED. ANONYMOUS ACCESS PERMITTED.</div>
        </div>

      </div>
    </div>
  )
}
