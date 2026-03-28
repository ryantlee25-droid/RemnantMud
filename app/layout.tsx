import type { Metadata } from 'next'
import './globals.css'
import { GameProvider } from '@/lib/gameContext'
import ThemeLoader from '@/components/ThemeLoader'

export const metadata: Metadata = {
  title: 'The Remnant — Post-Apocalyptic Text Adventure',
  description: 'A single-player text-based survival game.',
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
