'use client'

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react'
import { usePathname, useRouter, useSearchParams } from 'next/navigation'
import {
  DEFAULT_LANGUAGE,
  LANGUAGE_LOCALES,
  type Language,
} from '@/config/i18n'
import {
  buildLocalizedHref,
  getLanguageFromPathname,
} from '@/lib/i18nRouting'

interface LocaleContextType {
  locale: Language
  setLocale: (locale: Language) => void
}

const LocaleContext = createContext<LocaleContextType | undefined>(undefined)

function persistLocale(locale: Language) {
  window.localStorage.setItem('locale', locale)
  document.cookie = `locale=${locale}; path=/; max-age=31536000; samesite=lax`
  document.documentElement.lang = LANGUAGE_LOCALES[locale]
}

export function LocaleProvider({
  children,
  initialLocale = DEFAULT_LANGUAGE,
}: {
  children: React.ReactNode
  initialLocale?: Language
}) {
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()
  const searchKey = searchParams.toString()
  const pathLocale = useMemo(
    () => getLanguageFromPathname(pathname),
    [pathname]
  )

  const [storedLocale, setStoredLocale] = useState<Language>(initialLocale)
  const locale = pathLocale ?? storedLocale

  useEffect(() => {
    persistLocale(locale)
  }, [locale])

  const setLocale = useCallback(
    (nextLocale: Language) => {
      setStoredLocale(nextLocale)
      persistLocale(nextLocale)

      const currentHref = `${pathname}${searchKey ? `?${searchKey}` : ''}`
      router.replace(buildLocalizedHref(currentHref, nextLocale), {
        scroll: false,
      })
    },
    [pathname, router, searchKey]
  )

  const value = useMemo(
    () => ({
      locale,
      setLocale,
    }),
    [locale, setLocale]
  )

  return (
    <LocaleContext.Provider value={value}>
      {children}
    </LocaleContext.Provider>
  )
}

export function useLocale() {
  const context = useContext(LocaleContext)

  if (!context) {
    throw new Error('useLocale must be used within LocaleProvider')
  }

  return context
}
