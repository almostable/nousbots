import { NextRequest, NextResponse } from 'next/server'

export function proxy(request: NextRequest) {
  const token = request.cookies.get('auth')
  const { pathname } = request.nextUrl

  if (pathname.startsWith('/app') && !token) {
    return NextResponse.redirect(new URL('/', request.url))
  }

  if (pathname === '/' && token) {
    return NextResponse.redirect(new URL('/app', request.url))
  }

  return NextResponse.next()
}

export const config = {
  matcher: [
    /*
     * Объяснение регулярки:
     * ((?!...)) — это "negative lookahead" (исключение).
     * Мы говорим: Матчи ВСЁ, КРОМЕ путей, начинающихся с:
     * - api (если не хочешь блокировать API роуты)
     * - _next/static (системные файлы JS/CSS)
     * - _next/image (оптимизация картинок)
     * - favicon.ico (иконка сайта)
     */
    '/((?!api|_next/static|_next/image|favicon.ico).*)',
  ],
}
