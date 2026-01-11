import { Host_Grotesk } from 'next/font/google'
import './globals.css'
import { QueryProvider } from '@/lib/query-provider'

const hostGrotesk = Host_Grotesk({
  subsets: ['latin', 'latin-ext'],
  variable: '--font-host',
  adjustFontFallback: false,
  fallback: [
    '-apple-system',
    'ui-sans-serif',
    'system-ui',
    'BlinkMacSystemFont',
    'Arial',
    'Segoe UI',
    'Roboto',
    'sans-serif',
  ],
})

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en" className={`${hostGrotesk.variable}`}>
      <body className={` dark antialiased`}>
        <QueryProvider>{children}</QueryProvider>
      </body>
    </html>
  )
}
