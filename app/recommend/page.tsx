import { QuizForm } from '@/components/recommendation/QuizForm'
import { getTranslations } from '@/lib/getTranslations'
import { getRequestLanguage } from '@/lib/serverLocale'

export async function generateMetadata() {
  const locale = await getRequestLanguage()
  const t = getTranslations(locale)

  return {
    title: t.recommendPage.metadataTitle,
    description: t.recommendPage.metadataDescription,
  }
}

export default async function RecommendPage() {
  const locale = await getRequestLanguage()
  const t = getTranslations(locale)

  return (
    <div className="min-h-screen bg-slate-100 text-slate-900">
      <main className="px-6 py-10">
        <div className="mx-auto flex max-w-7xl flex-col gap-8">
          <header className="rounded-lg border border-slate-200 bg-white p-6 shadow-sm md:p-8">
            <div className="grid gap-6 lg:grid-cols-[1fr_360px] lg:items-end">
              <div>
                <p className="text-sm font-semibold uppercase tracking-[0.24em] text-emerald-700">
                  {t.recommendPage.eyebrow}
                </p>
                <h1 className="mt-3 max-w-4xl text-4xl font-bold tracking-normal text-slate-950 sm:text-5xl">
                  {t.recommendPage.title}
                </h1>
                <p className="mt-4 max-w-3xl text-base leading-7 text-slate-600">
                  {t.recommendPage.description}
                </p>
              </div>

              <div className="grid grid-cols-3 gap-2 text-center">
                <HeaderMetric label={t.recommendQuiz.maxBudget} value="EUR" />
                <HeaderMetric label={t.recommendCard.realRange} value="km" />
                <HeaderMetric label={t.recommendCard.fastDc} value="kW" />
              </div>
            </div>
          </header>

          <QuizForm />
        </div>
      </main>

    </div>
  )
}

function HeaderMetric({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-md border border-slate-200 bg-slate-50 px-3 py-4">
      <p className="text-lg font-black text-slate-950">{value}</p>
      <p className="mt-1 text-xs font-medium text-slate-500">{label}</p>
    </div>
  )
}
