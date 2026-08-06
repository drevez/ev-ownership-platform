'use client'

import type { AnchorHTMLAttributes, ReactNode } from 'react'

import { buildPageContext, pageContextToFlatProperties } from '@/lib/analytics'
import { pushGaEvent } from '@/lib/gaEvents'
import { delocalizePathname, getLanguageFromPathname, stripLanguageFromPathname } from '@/lib/i18nRouting'
import { trackEvent } from '@/lib/posthogClient'

export function TrackedExternalLink({
  href,
  label,
  children,
  ...props
}: AnchorHTMLAttributes<HTMLAnchorElement> & {
  href: string
  label: string
  children: ReactNode
}) {
  return (
    <a
      {...props}
      href={href}
      onClick={() => {
        const pathname = window.location.pathname
        const canonicalPath = delocalizePathname(stripLanguageFromPathname(pathname))
        const page = buildPageContext({
          path: pathname,
          canonicalPath,
          type: 'content',
          language: getLanguageFromPathname(pathname) ?? 'pt',
        })
        const url = new URL(href, window.location.origin)
        const properties = {
          event_schema_version: 2,
          page,
          outbound: {
            label,
            url_host: url.host,
          },
          link_url: href,
          link_label: label,
          outbound_label: label,
          outbound_url_host: url.host,
          ...pageContextToFlatProperties(page),
        }
        const gaProperties = Object.fromEntries(
          Object.entries(properties).filter(([key]) => key !== 'link_url')
        )

        trackEvent('outbound_click', properties)
        pushGaEvent('outbound_click', gaProperties)
      }}
    >
      {children}
    </a>
  )
}
