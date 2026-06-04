'use client'

import { useLocale } from '@/context/LocaleContext'
import { buildLocalizedHref } from '@/lib/i18nRouting'

export function useLocalizedHref() {
  const { locale } = useLocale()

  return (href: string) => buildLocalizedHref(href, locale)
}
