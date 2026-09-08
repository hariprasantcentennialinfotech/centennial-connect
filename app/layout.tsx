import { Analytics } from '@vercel/analytics/next'
import type { Metadata, Viewport } from 'next'
import { Inter, Manrope } from 'next/font/google'
import { Toaster } from '@/components/ui/toaster'
import './globals.css'

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
  display: 'swap',
})

const manrope = Manrope({
  subsets: ['latin'],
  variable: '--font-manrope',
  weight: ['500', '600', '700', '800'],
  display: 'swap',
})

export const metadata: Metadata = {
  title: {
    default: 'Centennial Connect — One platform for smarter business calling',
    template: '%s · Centennial Connect',
  },
  description:
    'Virtual numbers, AI-powered voice agents, and intelligent power dialing — an intelligent business communications platform for sales, support and customer engagement.',
  generator: 'v0.app',
  metadataBase: new URL('https://connect.centennialinfotech.com'),
  keywords: [
    'virtual numbers',
    'AI voice agent',
    'power dialer',
    'business communications',
    'cloud calling',
    'Centennial InfoTech',
  ],
  openGraph: {
    title: 'Centennial Connect',
    description: 'One platform for smarter business calling.',
    type: 'website',
  },
  icons: {
    icon: [
      { url: '/favicon.png', type: 'image/png' },
    ],
    shortcut: '/favicon.png',
    apple: '/favicon.png',
  },
}

export const viewport: Viewport = {
  colorScheme: 'light',
  themeColor: '#ffffff',
  userScalable: true,
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en" className={`${inter.variable} ${manrope.variable} bg-background`}>
      <body className="antialiased">
        {children}
        <Toaster />
        {process.env.NODE_ENV === 'production' && <Analytics />}
      </body>
    </html>
  )
}
