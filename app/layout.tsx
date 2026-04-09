import type { Metadata, Viewport } from 'next'
import { Playfair_Display, Inter, Anton } from 'next/font/google'
import './globals.css'
import { Navbar } from '@/components/layout/Navbar'
import { Footer } from '@/components/layout/Footer'
import { ChatWidget } from '@/components/chat/ChatWidget'
import { VoiceCallButton } from '@/components/voice/VoiceCallButton'

// ── Fonts ──────────────────────────────────────────────────────
const playfair = Playfair_Display({
  subsets: ['latin'],
  variable: '--font-display',
  display: 'swap',
})

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-sans',
  display: 'swap',
})

const anton = Anton({
  subsets: ['latin'],
  weight: ['400'],
  variable: '--font-impact',
  display: 'swap',
})

// ── Metadata ───────────────────────────────────────────────────
export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_APP_URL || 'https://salon-ai.vercel.app'),
  title: {
    default: 'Nakshatra Sharma — Luxury Hair Salon',
    template: '%s | Nakshatra Sharma',
  },
  description:
    'Premium hair salon specialising in precision cuts, balayage, keratin treatments, and bridal styling. Book your appointment online.',
  keywords: [
    'luxury hair salon',
    'balayage',
    'keratin treatment',
    'bridal hair',
    'hair stylist',
    'Nakshatra Sharma',
  ],
  authors: [{ name: 'Nakshatra Sharma' }],
  creator: 'Nakshatra Sharma',
  openGraph: {
    type: 'website',
    locale: 'en_GB',
    siteName: 'Nakshatra Sharma',
    title: 'Nakshatra Sharma — Luxury Hair Salon',
    description: 'Premium hair salon. Precision cuts, balayage, and bridal styling.',
    images: [
      {
        url: '/og-image.jpg',
        width: 1200,
        height: 630,
        alt: 'Nakshatra Sharma Luxury Hair Salon',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Nakshatra Sharma — Luxury Hair Salon',
    description: 'Premium hair salon. Precision cuts, balayage, and bridal styling.',
    images: ['/og-image.jpg'],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
}

export const viewport: Viewport = {
  themeColor: '#080808',
  colorScheme: 'dark',
  width: 'device-width',
  initialScale: 1,
}

// ── Root Layout ────────────────────────────────────────────────
export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html
      lang="en"
      className={`${playfair.variable} ${inter.variable} ${anton.variable}`}
      suppressHydrationWarning
    >
      <body className="bg-ink text-chalk font-sans antialiased overflow-x-hidden">
        {/* Navigation */}
        <Navbar />

        {/* Page content */}
        <main id="main-content">{children}</main>

        {/* Footer */}
        <Footer />

        {/* Persistent AI widgets — bottom-right */}
        <div className="fixed bottom-6 right-6 z-modal flex flex-col items-end gap-3">
          <VoiceCallButton />
          <ChatWidget />
        </div>
      </body>
    </html>
  )
}
