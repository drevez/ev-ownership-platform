import Link from 'next/link'

import { getTranslations } from '@/lib/getTranslations'
import { buildLocalizedHref } from '@/lib/i18nRouting'
import { getRequestLanguage } from '@/lib/serverLocale'

export async function generateMetadata() {
  const locale = await getRequestLanguage()
  const t = getTranslations(locale)

  return {
    title: t.guidesPage.metadataTitle,
    description: t.guidesPage.metadataDescription,
  }
}

export default async function GuidesPage() {
  const locale = await getRequestLanguage()
  const t = getTranslations(locale)

  const ctas = [
    {
      href: '/recommend',
      label: t.guidesPage.ctas.recommend,
    },
    {
      href: '/models',
      label: t.guidesPage.ctas.models,
    },
    {
      href: '/compare',
      label: t.guidesPage.ctas.compare,
    },
    {
      href: '/faq',
      label: t.guidesPage.ctas.faq,
    },
  ]

  return (
    <main className="bg-slate-50">
      <section className="mx-auto max-w-6xl px-4 py-16 sm:py-20">
        <div className="max-w-3xl">
          <p className="mb-4 text-sm font-bold uppercase tracking-[0.18em] text-emerald-600">
            {t.guidesPage.eyebrow}
          </p>
          <h1 className="text-4xl font-bold tracking-tight text-slate-950 sm:text-5xl">
            {t.guidesPage.title}
          </h1>
          <p className="mt-5 text-lg leading-8 text-slate-600">
            {t.guidesPage.description}
          </p>
        </div>

        <div className="mt-10 grid gap-4 md:grid-cols-3">
          {t.guidesPage.sections.map((section) => (
            <article
              key={section.title}
              className="rounded-lg border border-slate-200 bg-white p-6 shadow-sm"
            >
              <h2 className="text-xl font-semibold text-slate-950">
                {section.title}
              </h2>
              <p className="mt-3 leading-7 text-slate-600">
                {section.description}
              </p>
            </article>
          ))}
        </div>

        <section className="mt-8 rounded-lg border border-amber-200 bg-amber-50 p-6">
          <h2 className="text-lg font-semibold text-slate-950">
            {t.guidesPage.wipTitle}
          </h2>
          <p className="mt-2 leading-7 text-slate-700">
            {t.guidesPage.wipDescription}
          </p>
        </section>

        <div className="mt-8 flex flex-wrap gap-3">
          {ctas.map((cta, index) => (
            <Link
              key={cta.href}
              href={buildLocalizedHref(cta.href, locale)}
              className={
                index === 0
                  ? 'rounded-full bg-slate-950 px-5 py-3 text-sm font-semibold text-white transition hover:bg-slate-800'
                  : 'rounded-full border border-slate-300 bg-white px-5 py-3 text-sm font-semibold text-slate-800 transition hover:border-slate-400'
              }
            >
              {cta.label}
            </Link>
          ))}
        </div>
      </section>
    </main>
  )
}
