import type { Metadata } from 'next'
import { Plus_Jakarta_Sans } from 'next/font/google'
import './globals.css'
import { Toaster } from '@/components/ui/toaster'
import { SWRConfig } from 'swr'

const font = Plus_Jakarta_Sans({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'MedLog - Medical Case E-Logbook',
  description: 'Track your surgical and medical cases with AI-powered insights',
}

// Default SWR configuration
const swrConfig = {
  revalidateOnFocus: true,
  revalidateOnReconnect: true,
  dedupingInterval: 60000,
  errorRetryCount: 3,
  errorRetryInterval: 5000,
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${font.className} antialiased selection:bg-primary/20 bg-background text-foreground`}>
        <SWRConfig value={swrConfig}>
          {children}
          <Toaster />
        </SWRConfig>
      </body>
    </html>
  )
}
