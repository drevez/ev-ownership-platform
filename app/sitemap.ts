import type { MetadataRoute } from 'next'

import {
  LANGUAGE_LOCALES,
  SUPPORTED_LANGUAGES,
  type Language,
} from '@/config/i18n'
import { buildLocalizedHref } from '@/lib/i18nRouting'
import { absoluteUrl } from '@/lib/siteUrl'
import { getAllModelSlugs } from '@/lib/models'
import { getVehicleParams } from '@/lib/loadVehicle'

const STATIC_PATHS = [
  '/',
  '/models',
  '/compare',
  '/compare/models',
  '/compare/versions',
  '/recommend',
  '/guides',
  '/charging',
  '/faq',
  '/about',
  '/contacts',
  '/privacy',
  '/cookies',
  '/terms',
]

function localizedUrl(pathname: string, language: Language) {
  return absoluteUrl(buildLocalizedHref(pathname, language))
}

function languageAlternates(pathname: string): Record<string, string> {
  const languages = SUPPORTED_LANGUAGES.reduce<Record<string, string>>(
    (acc, language) => {
      acc[LANGUAGE_LOCALES[language]] = localizedUrl(pathname, language)
      return acc
    },
    {}
  )

  languages['x-default'] = localizedUrl(pathname, 'pt')
  return languages
}

function sitemapEntry(
  pathname: string,
  priority: number,
  changeFrequency: MetadataRoute.Sitemap[number]['changeFrequency']
): MetadataRoute.Sitemap[number] {
  return {
    url: localizedUrl(pathname, 'pt'),
    lastModified: new Date(),
    changeFrequency,
    priority,
    alternates: {
      languages: languageAlternates(pathname),
    },
  }
}

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const modelPaths = getAllModelSlugs().map(
    ({ slug }) => `/models/${slug}`
  )
  const vehicleParams = await getVehicleParams()
  const vehiclePaths = vehicleParams.map(({ id }) => `/vehicles/${id}`)

  return [
    ...STATIC_PATHS.map((pathname) =>
      sitemapEntry(pathname, pathname === '/' ? 1 : 0.8, 'weekly')
    ),
    ...modelPaths.map((pathname) => sitemapEntry(pathname, 0.7, 'weekly')),
    ...vehiclePaths.map((pathname) => sitemapEntry(pathname, 0.65, 'weekly')),
  ]
}
