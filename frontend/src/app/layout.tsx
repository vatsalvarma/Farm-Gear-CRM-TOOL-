import type { Metadata, Viewport } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import { ThemeProvider } from '@/components/providers/ThemeProvider'
import { SessionProvider } from '@/components/providers/SessionProvider'
import { Toaster } from '@/components/ui/sonner'
import { SessionHydrator } from '@/components/SessionHydrator'

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
  display: 'swap',
})

export const metadata: Metadata = {
  title: {
    default: 'Farm Gear Connect – Agricultural Equipment Rental',
    template: '%s | Farm Gear Connect',
  },
  description:
    'Rent farm equipment near you. Connect equipment owners with farmers across India. Tractors, harvesters, sprayers and more.',
  keywords: [
    'farm equipment rental',
    'tractor rental',
    'agricultural equipment',
    'farm machinery',
    'equipment hire India',
    'కర్షక యంత్రాల అద్దె',
  ],
  authors: [{ name: 'Farm Gear Connect' }],
  creator: 'Farm Gear Connect',
  metadataBase: new URL(
    process.env.NEXT_PUBLIC_SITE_URL || 'https://farmgearconnect.com'
  ),
  openGraph: {
    type: 'website',
    locale: 'en_IN',
    url: 'https://farmgearconnect.com',
    siteName: 'Farm Gear Connect',
    title: 'Farm Gear Connect – Agricultural Equipment Rental Marketplace',
    description: 'Rent farm equipment near you. Tractors, harvesters, sprayers and more.',
    images: [{ url: '/og-image.png', width: 1200, height: 630 }],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Farm Gear Connect',
    description: 'Rent farm equipment near you.',
    images: ['/og-image.png'],
  },
  manifest: '/manifest.json',
  icons: {
    icon: '/favicon.ico',
    apple: '/apple-touch-icon.png',
  },
}

export const viewport: Viewport = {
  themeColor: '#16a34a',
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" suppressHydrationWarning className={inter.variable}>
      <body className="min-h-screen bg-background font-sans antialiased" suppressHydrationWarning>
        <SessionProvider>
          <ThemeProvider
            attribute="class"
            defaultTheme="light"
            enableSystem
            disableTransitionOnChange
          >
            <SessionHydrator />
            {children}
            <Toaster richColors position="top-right" />
          </ThemeProvider>
        </SessionProvider>
      </body>
    </html>
  )
}
