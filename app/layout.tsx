import type { Metadata } from 'next'
import { Jost } from 'next/font/google'
import './globals.css'
import AgentationProvider from '@/components/AgentationProvider'

const jost = Jost({
  subsets: ['latin'],
  variable: '--font-jost',
  display: 'swap',
})

export const metadata: Metadata = {
  title: 'Kitchen Hub - Partner With Us',
  description: "Canada's First Digital Foodhall. Restaurants launch quickly, cheaply and easily.",
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" className={jost.variable}>
      <body className="font-jost">
        {children}
        <AgentationProvider />
      </body>
    </html>
  )
}
