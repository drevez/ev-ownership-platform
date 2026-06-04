import { getTranslations } from '@/lib/getTranslations'
import { getRequestLanguage } from '@/lib/serverLocale'

export async function generateMetadata() {
  const locale = await getRequestLanguage()
  const t = getTranslations(locale)

  return {
    title: t.contactsPage.metadataTitle,
    description: t.contactsPage.metadataDescription,
  }
}

export default async function ContactPage() {
  const locale = await getRequestLanguage()
  const t = getTranslations(locale)

  return (
    <main className="max-w-4xl mx-auto px-4 py-16">
      <h1 className="text-4xl font-bold mb-6">
        {t.contactsPage.title}
      </h1>

      <p className="text-slate-600">
        {t.contactsPage.description}
      </p>
    </main>
  )
}
