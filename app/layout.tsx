import type { Metadata } from 'next'
import './globals.css'
import { GameProvider } from '@/lib/gameContext'
import { Analytics } from '@vercel/analytics/next'
import { SpeedInsights } from '@vercel/speed-insights/next'

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
      <body className="h-full bg-black text-gray-300 font-mono">
        <GameProvider>
          {children}
        </GameProvider>
        <Analytics />
        <SpeedInsights />
      </body>
    </html>
  )
}
