import Link from 'next/link'

import { getTranslations } from '@/lib/getTranslations'
import { buildLocalizedHref } from '@/lib/i18nRouting'
import { getRequestLanguage } from '@/lib/serverLocale'

export async function generateMetadata() {
  const locale = await getRequestLanguage()
  const t = getTranslations(locale)

  return {
    title: t.faqPage.metadataTitle,
    description: t.faqPage.metadataDescription,
  }
}

export default async function FaqPage() {
  const locale = await getRequestLanguage()
  const t = getTranslations(locale)

  return (
    <main className="bg-slate-50">
      <section className="mx-auto max-w-5xl px-4 py-16 sm:py-20">
        <div className="max-w-3xl">
          <p className="mb-4 text-sm font-bold uppercase tracking-[0.18em] text-emerald-600">
            {t.faqPage.eyebrow}
          </p>
          <h1 className="text-4xl font-bold tracking-tight text-slate-950 sm:text-5xl">
            {t.faqPage.title}
          </h1>
          <p className="mt-5 text-lg leading-8 text-slate-600">
            {t.faqPage.description}
          </p>
        </div>

        <div className="mt-10 space-y-8">
          {t.faqPage.sections.map((section) => (
            <section key={section.title}>
              <h2 className="text-2xl font-semibold text-slate-950">
                {section.title}
              </h2>
              <div className="mt-4 divide-y divide-slate-200 rounded-lg border border-slate-200 bg-white shadow-sm">
                {section.questions.map((item) => (
                  <details key={item.question} className="group p-5">
                    <summary className="flex cursor-pointer list-none items-start justify-between gap-4 text-base font-semibold text-slate-950">
                      <span>{item.question}</span>
                      <span className="mt-0.5 text-xl leading-none text-emerald-600 transition group-open:rotate-45">
                        +
                      </span>
                    </summary>
                    <p className="mt-3 leading-7 text-slate-600">
                      {item.answer}
                    </p>
                  </details>
                ))}
              </div>
            </section>
          ))}
        </div>

        <section className="mt-8 rounded-lg border border-emerald-200 bg-emerald-50 p-6">
          <h2 className="text-lg font-semibold text-slate-950">
            {t.faqPage.wipTitle}
          </h2>
          <p className="mt-2 leading-7 text-slate-700">
            {t.faqPage.wipDescription}
          </p>
        </section>

        <div className="mt-8 flex flex-wrap gap-3">
          <Link
            href={buildLocalizedHref('/guides', locale)}
            className="rounded-full bg-slate-950 px-5 py-3 text-sm font-semibold text-white transition hover:bg-slate-800"
          >
            {t.faqPage.ctas.guides}
          </Link>
          <Link
            href={buildLocalizedHref('/charging', locale)}
            className="rounded-full border border-slate-300 bg-white px-5 py-3 text-sm font-semibold text-slate-800 transition hover:border-slate-400"
          >
            {t.faqPage.ctas.charging}
          </Link>
        </div>
      </section>
    </main>
  )
}
