import { Hanken_Grotesk, Shantell_Sans } from 'next/font/google'
import '@/styles/globals.css'
import { Providers } from '@/components/Providers'
import { AuthProvider } from '@/components/AuthProvider'
import { QueryProvider } from '@/components/QueryProvider'
import { SWRegister } from '@/components/SWRegister'

const hankenGrotesk = Hanken_Grotesk({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700', '800'],
  variable: '--font-hanken',
  display: 'swap',
})

const shantellSans = Shantell_Sans({
  subsets: ['latin'],
  weight: ['400', '700'],
  variable: '--font-hand',
  display: 'swap',
})

export const metadata = {
  title: 'Yield',
  description: 'Cook what you already have — turn fridge ingredients into real recipes',
  manifest: '/manifest.json',
  appleWebApp: {
    capable: true,
    statusBarStyle: 'default',
    title: 'Yield',
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" className={`${hankenGrotesk.variable} ${shantellSans.variable} h-full antialiased light`} suppressHydrationWarning>
      <head>
        <link rel="icon" href="/favicon.svg" type="image/svg+xml" />
        <link rel="icon" href="/favicon.ico" sizes="any" />
        <link rel="apple-touch-icon" href="/apple-touch-icon.png" />
        <link rel="manifest" href="/manifest.json" />
        <meta name="theme-color" content="#0d9488" />
        <meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover" />
      </head>
      <body className="min-h-full flex flex-col font-sans text-yield-900 dark:text-white antialiased">
        <noscript>
          <div className="p-4 text-center bg-yellow-50 border-b border-yellow-200 text-yellow-800">
            Yield requires JavaScript to run. Please enable it in your browser settings.
          </div>
        </noscript>
        <Providers>
          <QueryProvider>
            <AuthProvider>
              <a
                href="#main-content"
                className="sr-only focus:not-sr-only focus:fixed focus:top-4 focus:left-4 focus:z-[100] focus:px-4 focus:py-2 focus:bg-teal-600 focus:text-white focus:rounded-lg focus:shadow-lg focus:outline-none focus:ring-2 focus:ring-teal-500 focus:ring-offset-2"
              >
                Skip to main content
              </a>
              <SWRegister />
              {children}
            </AuthProvider>
          </QueryProvider>
        </Providers>
      </body>
    </html>
  )
}
