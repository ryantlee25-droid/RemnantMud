// ============================================================
// /landing — Static marketing page for The Remnant MUD
// Server Component: zero client JS, fully static on Vercel
// ============================================================

import Link from 'next/link'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'The Remnant — Post-Apocalyptic MUD',
  description:
    'A text-based survival RPG set in the American Southwest, seven years after the collapse. Play in your browser. No download.',
}

// Static — never revalidate
export const revalidate = false

// ── Inline components ────────────────────────────────────────

function Divider() {
  return (
    <div className="border-t border-amber-900 my-10 opacity-40" />
  )
}

function StatBadge({ label, value }: { label: string; value: string }) {
  return (
    <div className="border border-amber-900 px-3 py-2 text-center">
      <div className="text-amber-300 text-lg font-mono">{value}</div>
      <div className="text-amber-800 text-xs uppercase tracking-widest mt-0.5">{label}</div>
    </div>
  )
}

function FactionCard({
  name,
  tag,
  description,
}: {
  name: string
  tag: string
  description: string
}) {
  return (
    <div className="border border-amber-900 p-4 hover:border-amber-700 transition-colors">
      <div className="text-amber-600 text-xs uppercase tracking-widest mb-1">{tag}</div>
      <div className="text-amber-300 text-sm mb-2">{name}</div>
      <div className="text-amber-700 text-xs leading-relaxed">{description}</div>
    </div>
  )
}

function CommandLine({ command, response }: { command: string; response: string }) {
  return (
    <div className="text-xs leading-relaxed">
      <span className="text-amber-600">&gt; </span>
      <span className="text-amber-400">{command}</span>
      <br />
      <span className="text-amber-700 pl-4">{response}</span>
    </div>
  )
}

// ── Page ─────────────────────────────────────────────────────

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

      <div className="max-w-3xl mx-auto px-6 py-16 relative z-10">

        {/* ── Boot header ── */}
        <div className="mb-12">
          <div className="text-amber-800 text-xs uppercase tracking-widest mb-4">
            TERMINAL v2.38 — FOUR CORNERS NETWORK — SECURE CHANNEL
          </div>
          <div className="border border-amber-900 p-6 mb-4">
            <div className="text-amber-800 text-xs mb-3">INCOMING BROADCAST — SIGNAL ORIGIN: UNKNOWN</div>
            <div className="text-amber-400 text-xs leading-relaxed italic">
              &ldquo;...Scar site... containment breach... data survives...
              if you can read, if you can think, if you are still you...
              come to the Four Corners... the answer is here... repeating...&rdquo;
            </div>
          </div>
          <div className="text-amber-900 text-xs">
            Signal received 3 weeks ago. Source unconfirmed. Dozens have already followed it north.
          </div>
        </div>

        {/* ── Title ── */}
        <div className="mb-12">
          <div className="text-amber-900 text-xs uppercase tracking-widest mb-2">
            THE REMNANT
          </div>
          <h1 className="text-4xl text-amber-300 mb-3 leading-none tracking-tight">
            What&rsquo;s left<br />is what matters.
          </h1>
          <p className="text-amber-700 text-sm leading-relaxed max-w-xl">
            A text-based survival RPG. Post-apocalyptic American Southwest.
            Seven years after the collapse. You are no one. You have nothing.
            That might be exactly the right credential.
          </p>
        </div>

        {/* ── Stats ── */}
        <div className="grid grid-cols-3 gap-3 mb-12">
          <StatBadge value="250+" label="Rooms" />
          <StatBadge value="4" label="Endings" />
          <StatBadge value="∞" label="Cycles" />
        </div>

        <Divider />

        {/* ── What it is ── */}
        <div className="mb-12">
          <div className="text-amber-600 text-xs uppercase tracking-widest mb-4">
            What is this
          </div>
          <div className="space-y-3 text-amber-700 text-sm leading-relaxed">
            <p>
              The Remnant is a MUD — a multi-user dungeon played entirely in text,
              in your browser. No download. No install. You type commands.
              The world responds.
            </p>
            <p>
              It&rsquo;s 2038. A weaponized pathogen called CHARON-7 escaped a black-site
              facility in the Colorado Rockies seven years ago. Sixty percent of humanity
              became the Hollow — stripped down to hunger and reflex, walking through the
              ruins of their own lives. One in ten thousand became something else. Something
              faster. Something that feeds.
            </p>
            <p>
              You survived. Now you&rsquo;re here, in the Four Corners, where people are still
              trying to be people. You&rsquo;ve heard a signal. You want to know what&rsquo;s
              at the end of it.
            </p>
            <p>
              So does everyone else.
            </p>
          </div>
        </div>

        {/* ── Demo terminal ── */}
        <div className="border border-amber-900 p-5 mb-12 bg-black">
          <div className="text-amber-800 text-xs uppercase tracking-widest mb-4">
            TERMINAL SESSION EXCERPT
          </div>
          <div className="space-y-3">
            <CommandLine
              command="look"
              response="The highway curves north through scrub oak and juniper. A hand-painted sign reads COVENANT — 2 MI. The paint is fresh. Someone lives there."
            />
            <CommandLine
              command="go north"
              response="You move toward the road. A dog trots out of the brush and falls in behind you. It keeps its distance."
            />
            <CommandLine
              command="look dog"
              response="Mutt. Medium size. One ear missing. It sits when you stop. It isn't growling."
            />
            <CommandLine
              command="take jerky"
              response="You hold out a strip of dried meat. The dog takes it from your hand so gently you feel the individual teeth."
            />
            <div className="text-amber-900 text-xs pt-2">
              — it follows you for the rest of the game, if you let it —
            </div>
          </div>
        </div>

        <Divider />

        {/* ── Factions ── */}
        <div className="mb-12">
          <div className="text-amber-600 text-xs uppercase tracking-widest mb-4">
            The factions
          </div>
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <FactionCard
              name="The Accord"
              tag="Unturned — Law"
              description="Former sheriff holds 800 people together through force of character. They share. They ration. They negotiate blood-tithe treaties with vampires so people don't starve. Nobody said it was clean."
            />
            <FactionCard
              name="The Salters"
              tag="Unturned — Strength"
              description="Ex-Marine. Walls. Guns. No compromise. The democracy died with the grid, and Briggs knows something about MERIDIAN he isn't telling you."
            />
            <FactionCard
              name="Covenant of Dusk"
              tag="Sanguine — Coexistence"
              description="Former philosophy professor. She believes in living alongside humans. She feeds on them to survive. These are not contradictions she's resolved. They're contradictions she's chosen to carry."
            />
            <FactionCard
              name="The Kindling"
              tag="Unturned — Faith"
              description="Fire kills the infection. Sometimes it also kills the patient. Harrow's success rate is climbing. His methods are getting more extreme. He is absolutely certain he is doing the right thing."
            />
            <FactionCard
              name="The Reclaimers"
              tag="Unturned — Knowledge"
              description="They have files on you. They study everything — the Hollow, the Sanguine, the signal. They've decoded part of the broadcast. The name on the personnel file is Dr. Elias Vane."
            />
            <FactionCard
              name="The Drifters"
              tag="Unturned — Independence"
              description="No walls. No allegiance. A medic named Patch knows everyone and owes nothing. Information is currency. Medicine is information. She'll see you now."
            />
          </div>
        </div>

        <Divider />

        {/* ── How it plays ── */}
        <div className="mb-12">
          <div className="text-amber-600 text-xs uppercase tracking-widest mb-4">
            How it works
          </div>
          <div className="space-y-2 text-sm">
            {[
              ['You type commands.', 'go north, look, take knife, talk vesper, attack, flee'],
              ['The world is text.', 'Description, atmosphere, consequence. Nothing is hidden behind a UI.'],
              ['Death is not the end.', 'You die. You wake up in The Between. You come back. Changed.'],
              ['Your choices persist.', 'Faction reputation, world events, discovered rooms — they carry across deaths.'],
              ['There is a mystery.', 'MERIDIAN. What happened there. What\'s still inside. Who is broadcasting.'],
              ['There are four endings.', 'None of them are obviously right. The game will not tell you which to choose.'],
            ].map(([label, detail]) => (
              <div key={label} className="flex gap-4 text-xs">
                <span className="text-amber-500 shrink-0 w-40">{label}</span>
                <span className="text-amber-800">{detail}</span>
              </div>
            ))}
          </div>
        </div>

        <Divider />

        {/* ── CTA ── */}
        <div className="text-center py-4">
          <div className="text-amber-800 text-xs uppercase tracking-widest mb-6">
            No download. No account setup. Enter your email and play.
          </div>
          <Link
            href="/login"
            className="inline-block border border-amber-600 text-amber-400 px-10 py-3 text-sm hover:bg-amber-950 hover:border-amber-500 transition-colors"
          >
            Enter the Wasteland
          </Link>
          <div className="mt-4 text-amber-900 text-xs">
            Browser-based · Free during early access · Save persists across sessions
          </div>
        </div>

        <Divider />

        {/* ── Footer ── */}
        <div className="text-amber-900 text-xs text-center leading-relaxed">
          <div className="mb-1">THE REMNANT — Early Access</div>
          <div>Four Corners, Colorado · 2038 · CHARON-7 Year Seven</div>
        </div>

      </div>
    </div>
  )
}
