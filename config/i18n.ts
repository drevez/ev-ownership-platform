export const DEFAULT_LANGUAGE = 'pt'

export const SUPPORTED_LANGUAGES = [
  'pt',
  'en',
  'es',
] as const

export type Language =
  typeof SUPPORTED_LANGUAGES[number]

export const LANGUAGE_LABELS: Record<Language, string> = {
  pt: 'Português',
  en: 'English',
  es: 'Español',
}

export const LANGUAGE_LOCALES: Record<Language, string> = {
  pt: 'pt-PT',
  en: 'en',
  es: 'es',
}

export function isSupportedLanguage(
  value: string | null | undefined
): value is Language {
  return SUPPORTED_LANGUAGES.includes(value as Language)
}
