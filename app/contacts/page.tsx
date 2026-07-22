import { ContactMailForm } from '@/components/contact/ContactMailForm'
import { getTranslations } from '@/lib/getTranslations'
import { getRequestLanguage } from '@/lib/serverLocale'

const CONTACT_EMAIL = 'hello@motorzero.pt'

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
    <main className="bg-slate-50 text-slate-950">
      <section className="mx-auto max-w-4xl px-4 py-16 sm:py-20">
        <p className="mb-4 text-sm font-bold uppercase tracking-[0.18em] text-emerald-600">
          {t.contactsPage.eyebrow}
        </p>
        <h1 className="text-4xl font-bold tracking-tight sm:text-5xl">
          {t.contactsPage.title}
        </h1>
        <p className="mt-5 max-w-2xl text-lg leading-8 text-slate-600">
          {t.contactsPage.description}
        </p>

        <div className="mt-10 rounded-lg border border-slate-200 bg-white p-6 shadow-sm">
          <p className="text-sm font-semibold uppercase tracking-[0.18em] text-slate-500">
            {t.contactsPage.formTitle}
          </p>
          <p className="mt-4 max-w-2xl leading-7 text-slate-600">
            {t.contactsPage.directDescription}
          </p>
          <div className="mt-6">
            <ContactMailForm />
          </div>
        </div>

        <section className="mt-6 rounded-lg border border-emerald-200 bg-emerald-50 p-5">
          <h2 className="text-base font-semibold">
            {t.contactsPage.feedbackTitle}
          </h2>
          <p className="mt-2 text-sm leading-6 text-slate-700">
            {t.contactsPage.feedbackDescription}
          </p>
        </section>

        <p className="mt-6 text-sm leading-6 text-slate-500">
          {t.contactsPage.emailFallback}{' '}
          <a
            href={`mailto:${CONTACT_EMAIL}`}
            className="font-medium text-slate-700 underline decoration-slate-300 underline-offset-4 transition hover:text-emerald-700 hover:decoration-emerald-500"
          >
            {CONTACT_EMAIL}
          </a>
        </p>
      </section>
    </main>
  )
}
