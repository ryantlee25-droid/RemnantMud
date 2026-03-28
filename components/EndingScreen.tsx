'use client'

// ============================================================
// EndingScreen.tsx — Full-screen narrative component for game endings
// Shown after the player activates a terminal in The Core (scar_14)
// ============================================================

import { useState, useEffect } from 'react'
import RemnantLogo from '@/components/RemnantLogo'

export type EndingChoice = 'cure' | 'weapon' | 'seal' | 'throne'

interface EndingScreenProps {
  choice: EndingChoice
  cycle: number
  totalDeaths: number
  roomsExplored: number
  xpEarned: number
  onNewGame: () => void
}

const ENDING_TITLES: Record<EndingChoice, string> = {
  cure: 'THE CURE',
  weapon: 'THE WEAPON',
  seal: 'THE SEAL',
  throne: 'THE THRONE',
}

const ENDING_NARRATIVES: Record<EndingChoice, string[]> = {
  cure: [
    'The modified R-1 compound moves through the atmosphere like a rumor — invisible, inevitable, touching everything it reaches. Within weeks, the Hollow begin to stir. Not violently. Slowly. Like sleepers surfacing from a dream they cannot name. They blink. They look at their hands. Some of them remember their names. Most do not.',
    'The Sanguine feel it first as a numbness in the extremities, then as a narrowing of the senses they had grown to trust. Night vision dims. The preternatural hearing flattens to merely human. The Covenant of Dusk holds an emergency conclave and the vote is split: half call it liberation, half call it murder by another name. The Red Court calls it war, but by the time they mobilize, the war is already over. You cannot fight a cure.',
    'The Accord deploys medical teams to the regions where the Hollow are waking — thousands of people with seven years of absence behind their eyes, standing in a world that moved on without them. The Reclaimers build shelters. The Kindling hold vigils. The Salters, for once, open their gates.',
    'Years from now, someone will write the history of what you did. They will call it a mercy. You will call it something else. The name doesn\'t matter anymore. You made it because you believed it was right, and you will never be certain, and that uncertainty is the price of having been the one who decided. The world heals. The scars remain. The silence of consent never given settles over everything — the Hollow waking into lives they did not choose to leave, the Sanguine diminished by a formula they never agreed to. The world wakes different. Whether it wakes better is not yours to say.',
  ],
  weapon: [
    'The pathogen is elegant in its cruelty. It finds CHARON-7 wherever it hides — in the neural tissue of the Hollow, in the enhanced blood of the Sanguine, in the subclinical traces carried by sixty percent of the surviving human population. Thirty days. The timeline is precise. The dying is not.',
    'The Hollow go first, and no one mourns them because no one knew they were still in there. The Sanguine go next, and the Covenant of Dusk burns its own archives rather than let the Accord find them. The carriers — the farmers, the traders, the children who played too close to the wrong water source — they go last, and by then the world has stopped counting.',
    'The Accord inherits a continent emptied of its most dangerous elements and most of its people. Marshal Eckert calls it "the hard peace." The Salters close their gates and do not open them for a year. The Kindling stop lighting their signal fires. The Drifters, who were everywhere and nowhere, are mostly nowhere now.',
    'You did the math. The math was correct. The weapon worked exactly as described, and the silence it left behind is the specific quiet of absence, not peace. Historians will call you a monster or a savior depending on which side of the population curve they stand on. You will call yourself nothing, because you do not owe the dead an explanation. The world survives. It is quieter than it should be. The quiet that follows is not the quiet of a wound healing. It is the quiet of a room where someone was, and then was not.',
  ],
  seal: [
    'The shaped charges fire in sequence — a controlled cascade that turns MERIDIAN into calcium powder and slag in ninety seconds. The data dies. The samples die. The formula that could have cured or killed or ruled dies with them. The broadcaster stays inside. They do not run. They knew, when they gave you the choice, what SEAL meant for them.',
    'The crater fills with new rubble. The chemical haze thickens for a week, then thins. The Scar heals the way scars do — slowly, imperfectly, leaving a mark that tells the story of what happened there. The factions learn, eventually, that MERIDIAN is gone. The Accord sends an expedition. They find nothing usable.',
    'The Hollow remain what they are. The Sanguine remain what they are. The world remains exactly as broken as it was the day you walked into the Scar, and must find its own way from here — the slow, grinding, human way, without shortcuts or silver bullets or someone else\'s formula to solve it for them.',
    'You chose to trust the world with its own problems. Some will call it cowardice. Some will call it wisdom. The broadcaster called it "the quietest option" and they were right — it is the choice that makes the least noise and changes the least, and asks the most of everyone who comes after. The world continues. It does not thank you. The rubble settles. The mountain closes its mouth. Somewhere beneath a thousand tons of calcium powder and silence, the formula that could have changed everything becomes geology.',
  ],
  throne: [
    'MERIDIAN locks around you like a second skin. The facility\'s systems recognize your biometrics, your neural pattern, the specific signature of your CHARON-7 strain. You are the gatekeeper now. The data is yours. The formula is yours. The leverage is absolute.',
    'The factions learn within weeks. The Accord sends diplomats first, then soldiers, then diplomats again when the soldiers do not return. The Salters offer trade agreements written in language so careful it takes three readings to find the threats. The Covenant of Dusk sends a single emissary — an old Sanguine who looks at you for a long time and says nothing, then leaves.',
    'You hold the cure that could heal the Hollow and strip the Sanguine. You hold the weapon that could end CHARON-7 and most of its carriers. You hold the seal that could destroy it all. You hold all four options in your hands, and every day you do not choose is a choice in itself — the choice to remain the gatekeeper, to keep the world balanced on the edge of your decision.',
    'Power is not what you expected. It is not dramatic. It is the specific weight of being the person everyone needs something from, and knowing that whatever you give them will be wrong in some way you cannot predict. The broadcaster watches from the next room and says nothing. They have seen this before. The world orbits you now, and you orbit the data, and the data does not care. You hold a key that opens everything. The room it locks you in is the loneliest in the world.',
  ],
}

export default function EndingScreen({
  choice,
  cycle,
  totalDeaths,
  roomsExplored,
  xpEarned,
  onNewGame,
}: EndingScreenProps) {
  const [visible, setVisible] = useState(false)
  const [narrativeVisible, setNarrativeVisible] = useState<boolean[]>([false, false, false, false])
  const [statsVisible, setStatsVisible] = useState(false)
  const [endVisible, setEndVisible] = useState(false)
  const [buttonVisible, setButtonVisible] = useState(false)

  useEffect(() => {
    const timers: ReturnType<typeof setTimeout>[] = []

    // Fade in header
    timers.push(setTimeout(() => setVisible(true), 200))

    // Stagger narrative paragraphs
    const narratives = ENDING_NARRATIVES[choice]
    narratives.forEach((_, i) => {
      timers.push(
        setTimeout(() => {
          setNarrativeVisible((prev) => {
            const next = [...prev]
            next[i] = true
            return next
          })
        }, 1200 + i * 1800)
      )
    })

    const afterNarrative = 1200 + narratives.length * 1800 + 600
    timers.push(setTimeout(() => setStatsVisible(true), afterNarrative))
    timers.push(setTimeout(() => setEndVisible(true), afterNarrative + 1200))
    timers.push(setTimeout(() => setButtonVisible(true), afterNarrative + 2400))

    return () => timers.forEach(clearTimeout)
  }, [choice])

  return (
    <div className="flex flex-col items-center justify-center flex-1 overflow-y-auto font-mono text-amber-400 p-6">
      <div className="max-w-xl w-full space-y-8 py-12">

        {/* Logo + ending name */}
        <div
          className="text-center"
          style={{
            opacity: visible ? 1 : 0,
            transition: 'opacity 1.4s ease-in',
          }}
        >
          <div className="mb-4 opacity-60">
            <RemnantLogo size="compact" />
          </div>
          <div className="text-amber-600 text-xs uppercase tracking-widest mb-2">
            Cycle {cycle}
          </div>
          <h1 className="text-2xl tracking-[0.3em] uppercase text-amber-300 mb-1">
            {ENDING_TITLES[choice]}
          </h1>
          <p className="text-amber-600 text-sm italic">
            The choice is made. The world responds.
          </p>
        </div>

        {/* Narrative paragraphs */}
        <div className="space-y-5 text-sm text-amber-400 leading-relaxed text-left">
          {ENDING_NARRATIVES[choice].map((paragraph, i) => (
            <p
              key={i}
              style={{
                opacity: narrativeVisible[i] ? 1 : 0,
                transition: 'opacity 1.2s ease-in',
              }}
            >
              {paragraph}
            </p>
          ))}
        </div>

        {/* Player stats */}
        <div
          style={{
            opacity: statsVisible ? 1 : 0,
            transition: 'opacity 1.0s ease-in',
          }}
        >
          <div className="flex justify-center gap-8 text-sm border border-amber-900 py-4 px-6">
            <div className="text-center">
              <div className="text-amber-600 text-xs uppercase tracking-widest mb-1">Cycles</div>
              <div className="text-amber-300 text-xl">{cycle}</div>
            </div>
            <div className="text-center">
              <div className="text-amber-600 text-xs uppercase tracking-widest mb-1">Deaths</div>
              <div className="text-amber-300 text-xl">{totalDeaths}</div>
            </div>
            <div className="text-center">
              <div className="text-amber-600 text-xs uppercase tracking-widest mb-1">Rooms</div>
              <div className="text-amber-300 text-xl">{roomsExplored}</div>
            </div>
            <div className="text-center">
              <div className="text-amber-600 text-xs uppercase tracking-widest mb-1">XP</div>
              <div className="text-amber-300 text-xl">{xpEarned}</div>
            </div>
          </div>
        </div>

        {/* THE END */}
        <div
          className="text-center space-y-3"
          style={{
            opacity: endVisible ? 1 : 0,
            transition: 'opacity 1.4s ease-in',
          }}
        >
          <h2 className="text-3xl tracking-[0.4em] uppercase text-amber-300">
            THE END
          </h2>
          <p className="text-amber-500 text-sm">
            Thank you for playing The Remnant.
          </p>
          <p className="text-amber-700 text-xs italic">
            What&apos;s left is what matters.
          </p>
        </div>

        {/* New Game button */}
        <div
          className="text-center"
          style={{
            opacity: buttonVisible ? 1 : 0,
            transition: 'opacity 0.8s ease-in',
          }}
        >
          <button
            onClick={onNewGame}
            disabled={!buttonVisible}
            className="border border-amber-600 text-amber-400 px-8 py-2 text-sm hover:bg-amber-900 transition-colors disabled:cursor-not-allowed"
            autoFocus={buttonVisible}
          >
            NEW GAME
          </button>
          <p className="text-amber-700 text-xs mt-3">
            Each ending tells a different story. There are four.
          </p>
        </div>
      </div>
    </div>
  )
}
