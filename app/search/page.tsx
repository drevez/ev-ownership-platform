import { getTranslations } from '@/lib/getTranslations'
import { getModelExplorerData } from '@/lib/models'
import { getRequestLanguage } from '@/lib/serverLocale'
import Link from 'next/link'
import Image from 'next/image'
import type { VehiclePriceSummary } from '@/lib/normalizeVehicle'
import { buildLocalizedHref } from '@/lib/i18nRouting'

type SearchPageProps = {
  searchParams: Promise<{
    q?: string
  }>
}

function getPriceKindLabel(
  price: VehiclePriceSummary | undefined,
  t: ReturnType<typeof getTranslations>
): string {
  if (!price) return t.modelsExplorer.price.noConfirmedPrice
  if (price.status === 'not_sold_new') return t.modelsExplorer.price.kind.referenceNew
  if (price.kind === 'used') return t.modelsExplorer.price.kind.used
  if (price.kind === 'importedUsed') return t.modelsExplorer.price.kind.importedUsed
  return t.modelsExplorer.price.kind.new
}

export async function generateMetadata({ searchParams }: SearchPageProps) {
  const { q = '' } = await searchParams
  const locale = await getRequestLanguage()
  const t = getTranslations(locale)

  return {
    title: `${t.home.hero.searchButton}: ${q}`,
    description: t.home.hero.searchPlaceholder,
    robots: {
      index: false,
      follow: true,
    },
  }
}

export default async function SearchResultsPage({ searchParams }: SearchPageProps) {
  const { q = '' } = await searchParams
  const locale = await getRequestLanguage()
  const t = getTranslations(locale)

  const allModels = await getModelExplorerData()
  const cleanQuery = q.trim().toLowerCase()

  // Filter models
  const matchedModels = allModels.filter((model) => {
    if (!cleanQuery) return false
    return (
      model.brand.toLowerCase().includes(cleanQuery) ||
      model.model.toLowerCase().includes(cleanQuery) ||
      model.displayName.toLowerCase().includes(cleanQuery) ||
      model.bodyTypes.some(bt => bt.toLowerCase().includes(cleanQuery)) ||
      model.variants.some(v => v.displayName.toLowerCase().includes(cleanQuery))
    )
  })

  return (
    <main className="min-h-screen bg-[#0a0a0a] px-4 py-16 text-white sm:px-6 sm:py-24">
      <div className="mx-auto max-w-7xl">
        <p className="text-emerald-400 font-semibold mb-2 uppercase tracking-wider text-sm">
          {t.searchPage.resultsFor}
        </p>

        <h1 className="mb-10 text-3xl font-bold sm:text-4xl md:mb-12 md:text-5xl">
          &ldquo;{q}&rdquo; <span className="text-zinc-500 font-normal">({matchedModels.length})</span>
        </h1>

        {matchedModels.length === 0 ? (
          <div className="max-w-xl rounded-lg border border-white/10 bg-zinc-900/50 p-6 text-center sm:p-10 md:p-12">
            <h2 className="mb-4 text-2xl font-bold">{t.searchPage.emptyTitle}</h2>
            <p className="mb-8 text-zinc-400">
              {t.searchPage.emptyDescription}
            </p>
            <Link
              href={`/${locale}`}
              className="inline-flex w-full items-center justify-center rounded-full bg-emerald-500 px-6 py-3 font-semibold text-black transition hover:bg-emerald-400 sm:w-auto"
            >
              {t.searchPage.backHome}
            </Link>
          </div>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {matchedModels.map((model) => {
              const price = model.priceFromEur
                ? `${Math.round(model.priceFromEur).toLocaleString(locale === 'pt' ? 'pt-PT' : locale === 'es' ? 'es-ES' : 'en')} €`
                : 'N/D'
              const priceLabel = getPriceKindLabel(model.primaryPrice, t)
              
              const range = model.maxRealRangeKm ?? model.maxWltpRangeKm

              return (
                <Link
                  key={model.slug}
                  href={buildLocalizedHref(`/models/${model.slug}`, locale)}
                  className="group block overflow-hidden rounded-lg border border-white/10 bg-zinc-900 transition hover:border-emerald-500"
                >
                  <div className="relative h-52 w-full bg-zinc-950 sm:h-64">
                    <Image
                      src={model.heroImage}
                      alt={model.displayName}
                      fill
                      className="object-cover"
                      sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                    />
                  </div>

                  <div className="p-5 sm:p-8">
                    <p className="text-zinc-500 text-sm mb-1">{model.brand}</p>
                    <h3 className="mb-6 text-2xl font-bold transition group-hover:text-emerald-400 sm:text-3xl">
                      {model.model}
                    </h3>

                    <div className="mb-6 grid grid-cols-2 gap-4 sm:gap-6">
                      <div>
                        <p className="text-zinc-500 text-sm mb-2">{t.searchPage.realRange}</p>
                        <p className="text-xl font-semibold">{range ? `${range} km` : 'N/D'}</p>
                      </div>

                      <div>
                        <p className="text-zinc-500 text-sm mb-2">{priceLabel}</p>
                        <p className="text-xl font-semibold">{price}</p>
                      </div>
                    </div>

                    <span className="block w-full rounded-lg bg-white/10 py-4 text-center font-semibold text-white transition group-hover:bg-white group-hover:text-black">
                      {t.searchPage.viewVersions.replace('{count}', String(model.variantCount))}
                    </span>
                  </div>
                </Link>
              )
            })}
          </div>
        )}
      </div>
    </main>
  )
}
