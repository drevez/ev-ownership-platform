'use client'

import { useLocale } from '@/context/LocaleContext'
import { getTranslations } from '@/lib/getTranslations'

export function useTranslations() {
  const { locale } = useLocale()

  return getTranslations(locale)
}