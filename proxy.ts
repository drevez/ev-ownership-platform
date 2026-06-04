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

const LOCALE_HEADER = 'x-motorzero-locale'
const PATHNAME_HEADER = 'x-motorzero-pathname'

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
  ],
}
