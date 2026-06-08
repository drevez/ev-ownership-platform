import { LegalPage } from '@/components/legal/LegalPage'
import { getTranslations } from '@/lib/getTranslations'
import { getRequestLanguage } from '@/lib/serverLocale'

export async function generateMetadata() {
  const locale = await getRequestLanguage()
  const t = getTranslations(locale)
  return {
    title: t.legalPages.terms.metadataTitle,
    description: t.legalPages.terms.metadataDescription,
  }
}

export default async function TermsPage() {
  const locale = await getRequestLanguage()
  const t = getTranslations(locale)
  return <LegalPage content={t.legalPages.terms} />
}
