import type { MetadataRoute } from 'next'

import { absoluteUrl } from '@/lib/siteUrl'

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: '*',
      allow: '/',
      disallow: [
        '/api/',
        '/internal/',
        '/pt/internal/',
        '/en/internal/',
        '/es/internal/',
      ],
    },
    sitemap: absoluteUrl('/sitemap.xml'),
  }
}
