import { headers } from 'next/headers'
import {
  DEFAULT_LANGUAGE,
  isSupportedLanguage,
  type Language,
} from '@/config/i18n'

export const LOCALE_HEADER = 'x-motorzero-locale'
export const PATHNAME_HEADER = 'x-motorzero-pathname'

export async function getRequestLanguage(): Promise<Language> {
  const headerStore = await headers()
  const value = headerStore.get(LOCALE_HEADER)

  return isSupportedLanguage(value) ? value : DEFAULT_LANGUAGE
}

export async function getRequestPathname(): Promise<string> {
  const headerStore = await headers()
  return headerStore.get(PATHNAME_HEADER) ?? '/'
}
