import { describe, expect, it } from 'vitest'

import {
  buildLocalizedHref,
  delocalizePathname,
  getLanguageFromPathname,
  localizePathname,
  stripLanguageFromPathname,
} from '@/lib/i18nRouting'

describe('localized routing', () => {
  it('localizes public routes and nested comparison routes', () => {
    expect(localizePathname('/models', 'pt')).toBe('/pt/modelos')
    expect(localizePathname('/compare/versions', 'es')).toBe('/es/comparador/versiones')
    expect(localizePathname('/recommend', 'en')).toBe('/en/recommender')
  })

  it('converts translated routes back to their internal pathname', () => {
    expect(
      delocalizePathname(stripLanguageFromPathname('/pt/comparador/versoes'))
    ).toBe('/compare/versions')
    expect(
      delocalizePathname(stripLanguageFromPathname('/es/vehiculos/example-id'))
    ).toBe('/vehicles/example-id')
    expect(
      delocalizePathname(stripLanguageFromPathname('/en/about'))
    ).toBe('/about')
  })

  it('switches language while preserving query strings and hashes', () => {
    expect(
      buildLocalizedHref(
        '/pt/comparador/modelos?models=a&models=b&lang=pt#resultado',
        'en'
      )
    ).toBe('/en/compare/models?models=a&models=b#resultado')
  })

  it('does not alter external, API, or fragment links', () => {
    expect(buildLocalizedHref('https://motorzero.pt', 'pt')).toBe('https://motorzero.pt')
    expect(buildLocalizedHref('/api/vehicles?id=a', 'es')).toBe('/api/vehicles?id=a')
    expect(buildLocalizedHref('#specs', 'en')).toBe('#specs')
  })

  it('detects and strips supported language prefixes', () => {
    expect(getLanguageFromPathname('/es/modelos')).toBe('es')
    expect(getLanguageFromPathname('/internal')).toBeNull()
    expect(stripLanguageFromPathname('/pt/modelos/tesla-model-y')).toBe(
      '/modelos/tesla-model-y'
    )
    expect(stripLanguageFromPathname('/')).toBe('/')
  })
})
