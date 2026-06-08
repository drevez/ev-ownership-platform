import {
  isSupportedLanguage,
  type Language,
} from '@/config/i18n'

export const LOCALE_QUERY_PARAM = 'lang'

const LOCALIZED_ROUTE_SEGMENTS: Record<string, Record<Language, string>> = {
  models: {
    pt: 'modelos',
    en: 'models',
    es: 'modelos',
  },
  vehicles: {
    pt: 'veiculos',
    en: 'vehicles',
    es: 'vehiculos',
  },
  compare: {
    pt: 'comparador',
    en: 'compare',
    es: 'comparador',
  },
  versions: {
    pt: 'versoes',
    en: 'versions',
    es: 'versiones',
  },
  recommend: {
    pt: 'recomendador',
    en: 'recommender',
    es: 'recomendador',
  },
  about: {
    pt: 'sobre',
    en: 'about',
    es: 'sobre',
  },
  contacts: {
    pt: 'contactos',
    en: 'contacts',
    es: 'contacto',
  },
  search: {
    pt: 'pesquisa',
    en: 'search',
    es: 'buscar',
  },
  guides: {
    pt: 'guias',
    en: 'guides',
    es: 'guias',
  },
  charging: {
    pt: 'carregamento',
    en: 'charging',
    es: 'carga',
  },
  privacy: {
    pt: 'privacidade',
    en: 'privacy',
    es: 'privacidad',
  },
  terms: {
    pt: 'termos',
    en: 'terms',
    es: 'terminos',
  },
  cookies: {
    pt: 'cookies',
    en: 'cookies',
    es: 'cookies',
  },
}

const LOCALIZED_TO_INTERNAL_SEGMENT = Object.entries(
  LOCALIZED_ROUTE_SEGMENTS
).reduce<Record<string, string>>((acc, [internalSegment, localized]) => {
  Object.values(localized).forEach((segment) => {
    acc[segment] = internalSegment
  })

  return acc
}, {})

function isExternalHref(href: string) {
  return /^[a-z][a-z\d+.-]*:/i.test(href) || href.startsWith('//')
}

export function getLanguageFromSearchParams(
  searchParams: URLSearchParams
): Language | null {
  const value = searchParams.get(LOCALE_QUERY_PARAM)
  return isSupportedLanguage(value) ? value : null
}

export function getLanguageFromPathname(pathname: string): Language | null {
  const segment = pathname.split('/').filter(Boolean)[0]
  return isSupportedLanguage(segment) ? segment : null
}

export function stripLanguageFromPathname(pathname: string): string {
  const segments = pathname.split('/').filter(Boolean)

  if (isSupportedLanguage(segments[0])) {
    const stripped = `/${segments.slice(1).join('/')}`
    return stripped === '/' ? '/' : stripped.replace(/\/$/, '')
  }

  return pathname || '/'
}

export function delocalizePathname(pathname: string): string {
  const segments = pathname.split('/').filter(Boolean)

  if (segments.length === 0) return '/'

  return `/${segments
    .map((segment) => LOCALIZED_TO_INTERNAL_SEGMENT[segment] ?? segment)
    .join('/')}`
}

export function localizePathname(
  pathname: string,
  language: Language
): string {
  const segments = delocalizePathname(pathname).split('/').filter(Boolean)

  if (segments.length === 0) return `/${language}`

  return `/${language}/${segments
    .map((segment) => LOCALIZED_ROUTE_SEGMENTS[segment]?.[language] ?? segment)
    .join('/')}`
}

export function buildLocalizedHref(
  href: string,
  language: Language
): string {
  if (
    isExternalHref(href) ||
    href.startsWith('#') ||
    href.startsWith('/api/')
  ) {
    return href
  }

  const [pathWithQuery = '/', hash = ''] = href.split('#')
  const [pathname = '/', query = ''] = pathWithQuery.split('?')
  const searchParams = new URLSearchParams(query)
  const basePathname = delocalizePathname(
    stripLanguageFromPathname(pathname || '/')
  )

  searchParams.delete(LOCALE_QUERY_PARAM)

  const nextQuery = searchParams.toString()
  const localizedPath = localizePathname(basePathname, language)

  return `${localizedPath}${nextQuery ? `?${nextQuery}` : ''}${hash ? `#${hash}` : ''}`
}
