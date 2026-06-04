import { pt } from '@/locales/pt'
import { en } from '@/locales/en'
import { es } from '@/locales/es'
import { DEFAULT_LANGUAGE, isSupportedLanguage, type Language } from '@/config/i18n'

const translations: Record<Language, typeof pt> = {
  pt,
  en,
  es,
}

export function getTranslations(language: string = DEFAULT_LANGUAGE) {
  return isSupportedLanguage(language)
    ? translations[language]
    : translations[DEFAULT_LANGUAGE]
}
