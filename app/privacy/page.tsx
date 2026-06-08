import { LegalPage } from '@/components/legal/LegalPage'
import { getTranslations } from '@/lib/getTranslations'
import { getRequestLanguage } from '@/lib/serverLocale'

export async function generateMetadata() {
  const locale = await getRequestLanguage()
  const t = getTranslations(locale)
  return {
    title: t.legalPages.privacy.metadataTitle,
    description: t.legalPages.privacy.metadataDescription,
  }
}

export default async function PrivacyPage() {
  const locale = await getRequestLanguage()
  const t = getTranslations(locale)
  return <LegalPage content={t.legalPages.privacy} />
}
