import type { Metadata } from 'next'
import './globals.css'
import { GameProvider } from '@/lib/gameContext'
import ThemeLoader from '@/components/ThemeLoader'

export const metadata: Metadata = {
  title: 'The Remnant — Post-Apocalyptic Text MUD',
  description:
    'A single-player text adventure set 7 years after the CHARON-7 bioweapon collapse. 271 rooms, 4 endings, branching dialogue. Play free in your browser.',
  openGraph: {
    title: 'The Remnant',
    description: "What's left is what matters.",
    type: 'website',
  },
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en" className="h-full">
      <body className="h-full bg-neutral-950 text-amber-400 font-mono">
        <GameProvider>
          <ThemeLoader />
          {children}
        </GameProvider>
      </body>
    </html>
  )
}
