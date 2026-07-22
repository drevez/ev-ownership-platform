import Link from 'next/link'

import { getTranslations } from '@/lib/getTranslations'
import { buildLocalizedHref } from '@/lib/i18nRouting'
import { getRequestLanguage } from '@/lib/serverLocale'

export async function generateMetadata() {
  const locale = await getRequestLanguage()
  const t = getTranslations(locale)

  return {
    title: t.aboutPage.metadataTitle,
    description: t.aboutPage.metadataDescription,
  }
}

export default async function AboutPage() {
  const locale = await getRequestLanguage()
  const t = getTranslations(locale)

  return (
    <main className="bg-slate-50 text-slate-950">
      <section className="border-b border-emerald-400/10 bg-slate-950 text-white">
        <div className="mx-auto grid max-w-6xl gap-10 px-4 py-16 sm:py-20 lg:grid-cols-[1.05fr_0.95fr] lg:items-center">
          <div>
            <p className="mb-4 text-sm font-bold uppercase tracking-[0.18em] text-emerald-300">
              {t.aboutPage.eyebrow}
            </p>
            <h1 className="max-w-3xl text-4xl font-bold tracking-tight sm:text-5xl lg:text-6xl">
              {t.aboutPage.title}
            </h1>
            <p className="mt-6 max-w-3xl text-lg leading-8 text-slate-300">
              {t.aboutPage.description}
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              {t.aboutPage.heroPoints.map((point) => (
                <span
                  key={point}
                  className="rounded-full border border-white/10 bg-white/5 px-4 py-2 text-sm font-semibold text-slate-200"
                >
                  {point}
                </span>
              ))}
            </div>
          </div>

          <aside className="rounded-lg border border-white/10 bg-white/[0.06] p-6 shadow-sm">
            <p className="text-sm font-semibold uppercase tracking-[0.18em] text-emerald-300">
              {t.aboutPage.originLabel}
            </p>
            <p className="mt-4 text-2xl font-semibold leading-snug">
              {t.aboutPage.originTitle}
            </p>
            <p className="mt-4 leading-7 text-slate-300">
              {t.aboutPage.originDescription}
            </p>
          </aside>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-4 py-12 sm:py-16">
        <div className="mb-8 max-w-3xl">
          <p className="text-sm font-bold uppercase tracking-[0.18em] text-emerald-600">
            {t.aboutPage.storyEyebrow}
          </p>
          <h2 className="mt-3 text-3xl font-bold tracking-tight text-slate-950">
            {t.aboutPage.storyTitle}
          </h2>
        </div>

        <div className="grid gap-4 md:grid-cols-3">
          {t.aboutPage.sections.map((section) => (
            <article
              key={section.title}
              className="rounded-lg border border-slate-200 bg-white p-6 shadow-sm transition hover:-translate-y-0.5 hover:border-emerald-200 hover:shadow-md"
            >
              <p className="mb-4 flex h-10 w-10 items-center justify-center rounded-full bg-emerald-50 text-lg font-bold text-emerald-700">
                {section.marker}
              </p>
              <h2 className="text-xl font-semibold">
                {section.title}
              </h2>
              <p className="mt-3 leading-7 text-slate-600">
                {section.description}
              </p>
            </article>
          ))}
        </div>

        <section className="mt-8 rounded-lg border border-slate-200 bg-white p-6 shadow-sm">
          <div className="grid gap-6 lg:grid-cols-[0.8fr_1.2fr] lg:items-start">
            <div>
              <p className="text-sm font-bold uppercase tracking-[0.18em] text-emerald-600">
                {t.aboutPage.principlesEyebrow}
              </p>
              <h2 className="mt-3 text-2xl font-semibold text-slate-950">
                {t.aboutPage.principlesTitle}
              </h2>
            </div>
            <div className="grid gap-3 sm:grid-cols-2">
              {t.aboutPage.principles.map((principle) => (
                <div
                  key={principle.title}
                  className="rounded-lg border border-slate-200 bg-slate-50 p-4"
                >
                  <h3 className="font-semibold text-slate-950">
                    {principle.title}
                  </h3>
                  <p className="mt-2 text-sm leading-6 text-slate-600">
                    {principle.description}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </section>

        <div className="mt-8 grid gap-4 lg:grid-cols-[1fr_auto] lg:items-center">
          <section className="rounded-lg border border-emerald-200 bg-emerald-50 p-6">
            <h2 className="text-lg font-semibold">
              {t.aboutPage.noteTitle}
            </h2>
            <p className="mt-2 leading-7 text-slate-700">
              {t.aboutPage.noteDescription}
            </p>
          </section>

          <Link
            href={buildLocalizedHref('/contacts', locale)}
            className="inline-flex rounded-full bg-slate-950 px-5 py-3 text-sm font-semibold text-white transition hover:bg-slate-800"
          >
            {t.aboutPage.contactCta}
          </Link>
        </div>

        <p className="mt-8 text-sm leading-6 text-slate-500">
          {t.aboutPage.creatorNote}{' '}
          <a
            href="https://danielarevez.com"
            target="_blank"
            rel="noreferrer"
            className="font-medium text-slate-700 underline decoration-slate-300 underline-offset-4 transition hover:text-emerald-700 hover:decoration-emerald-500"
          >
            danielarevez.com
          </a>
        </p>
      </section>
    </main>
  )
}
