import { NextResponse, type NextRequest } from 'next/server'
import {
  DEFAULT_LANGUAGE,
  isSupportedLanguage,
} from '@/config/i18n'
import {
  buildLocalizedHref,
  delocalizePathname,
  getLanguageFromPathname,
  LOCALE_QUERY_PARAM,
  stripLanguageFromPathname,
} from '@/lib/i18nRouting'
import { isInternalAuthorized } from '@/lib/internalAuth'

const LOCALE_HEADER = 'x-motorzero-locale'
const PATHNAME_HEADER = 'x-motorzero-pathname'

function isInternalPath(pathname: string) {
  return (
    pathname === '/internal' ||
    pathname.startsWith('/internal/') ||
    pathname === '/api/internal' ||
    pathname.startsWith('/api/internal/') ||
    /^\/(?:pt|en|es)\/internal(?:\/|$)/.test(pathname)
  )
}

function internalUnauthorizedResponse(pathname: string) {
  const headers = {
    'Cache-Control': 'no-store',
    'WWW-Authenticate': 'Basic realm="MotorZero Internal", charset="UTF-8"',
  }

  if (pathname.startsWith('/api/')) {
    return NextResponse.json(
      { error: 'Authentication required.' },
      { status: 401, headers }
    )
  }

  return new NextResponse('Authentication required.', {
    status: 401,
    headers,
  })
}

function withLocaleCookie(response: NextResponse, locale: string) {
  response.cookies.set('locale', locale, {
    path: '/',
    maxAge: 60 * 60 * 24 * 365,
    sameSite: 'lax',
  })

  return response
}

export function proxy(request: NextRequest) {
  const pathname = request.nextUrl.pathname

  if (isInternalPath(pathname) && !isInternalAuthorized(request)) {
    return internalUnauthorizedResponse(pathname)
  }

  if (pathname.startsWith('/api/')) {
    return NextResponse.next()
  }

  const pathLocale = getLanguageFromPathname(pathname)
  const queryLocale = request.nextUrl.searchParams.get(LOCALE_QUERY_PARAM)
  const cookieLocale = request.cookies.get('locale')?.value

  if (isSupportedLanguage(queryLocale)) {
    const cleanUrl = request.nextUrl.clone()
    cleanUrl.searchParams.delete(LOCALE_QUERY_PARAM)
    const href = `${stripLanguageFromPathname(pathname)}${cleanUrl.search}`
    const redirectUrl = new URL(buildLocalizedHref(href, queryLocale), request.url)

    return withLocaleCookie(NextResponse.redirect(redirectUrl), queryLocale)
  }

  if (!pathLocale) {
    const locale = isSupportedLanguage(cookieLocale)
      ? cookieLocale
      : DEFAULT_LANGUAGE
    const redirectUrl = new URL(buildLocalizedHref(
      `${pathname}${request.nextUrl.search}`,
      locale
    ), request.url)

    return withLocaleCookie(NextResponse.redirect(redirectUrl), locale)
  }

  const requestHeaders = new Headers(request.headers)
  requestHeaders.set(LOCALE_HEADER, pathLocale)
  requestHeaders.set(PATHNAME_HEADER, pathname)

  const rewriteUrl = request.nextUrl.clone()
  rewriteUrl.pathname = delocalizePathname(stripLanguageFromPathname(pathname))

  const response = NextResponse.rewrite(rewriteUrl, {
    request: {
      headers: requestHeaders,
    },
  })

  return withLocaleCookie(response, pathLocale)
}

export const config = {
  matcher: [
    '/((?!api|_next|favicon.ico|.*\\..*).*)',
    '/api/internal/:path*',
  ],
}
