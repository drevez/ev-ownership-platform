import { LegalPage } from '@/components/legal/LegalPage'
import { getTranslations } from '@/lib/getTranslations'
import { getRequestLanguage } from '@/lib/serverLocale'

export async function generateMetadata() {
  const locale = await getRequestLanguage()
  const t = getTranslations(locale)
  return {
    title: t.legalPages.cookies.metadataTitle,
    description: t.legalPages.cookies.metadataDescription,
  }
}

export default async function CookiesPage() {
  const locale = await getRequestLanguage()
  const t = getTranslations(locale)
  return <LegalPage content={t.legalPages.cookies} />
}
