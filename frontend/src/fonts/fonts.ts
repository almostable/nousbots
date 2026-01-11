import localFont from 'next/font/local'
import { Manrope } from 'next/font/google'

export const satoshi = localFont({
  src: './Satoshi-Variable.woff2',
  variable: '--font-satoshi',
  weight: '400 900',
  display: 'swap',
})

const manrope = Manrope({
  subsets: ['cyrillic'],
  variable: '--font-manrope',
  display: 'swap',
})

export const fonts = `${satoshi.variable} ${manrope.variable}`
