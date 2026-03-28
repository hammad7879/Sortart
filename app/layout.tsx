import type { Metadata, Viewport } from 'next'
import { Playfair_Display, Crimson_Pro } from 'next/font/google'
import { Analytics } from '@vercel/analytics/next'
import { ArtistProfileProvider } from '@/components/ArtistProfileProvider'
import { ConvexClientProvider } from '@/components/ConvexClientProvider'
import './globals.css'

const playfairDisplay = Playfair_Display({ 
  subsets: ['latin'],
  variable: '--font-playfair',
  display: 'swap',
})

const crimsonPro = Crimson_Pro({ 
  subsets: ['latin'],
  variable: '--font-crimson',
  display: 'swap',
})

export const metadata: Metadata = {
  title: 'SortArt — Your Canvas Guided by AI',
  description: 'A premium AI companion for artists. Get color analysis, mixing guides, and expert coaching for your artwork.',
  icons: {
    icon: '/image%20copy.png',
    apple: '/image%20copy.png',
  },
}

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  themeColor: '#F5EFE0',
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en">
      <body className={`${playfairDisplay.variable} ${crimsonPro.variable} font-sans antialiased`}>
        <ArtistProfileProvider>
          <ConvexClientProvider>
            {children}
            <Analytics />
          </ConvexClientProvider>
        </ArtistProfileProvider>
      </body>
    </html>
  )
}
