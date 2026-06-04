import { getTranslations } from '@/lib/getTranslations'
import { getModelExplorerData } from '@/lib/models'
import { getRequestLanguage } from '@/lib/serverLocale'
import Link from 'next/link'
import Image from 'next/image'
import type { VehiclePriceSummary } from '@/lib/normalizeVehicle'

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
    title: `${t.home.hero.searchButton}: ${q} | MotorZero`,
    description: t.home.hero.searchPlaceholder,
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
    <main className="min-h-screen bg-[#0a0a0a] text-white px-6 py-24">
      <div className="max-w-7xl mx-auto">
        <p className="text-emerald-400 font-semibold mb-2 uppercase tracking-wider text-sm">
          Resultados para
        </p>

        <h1 className="text-4xl md:text-5xl font-bold mb-12">
          &ldquo;{q}&rdquo; <span className="text-zinc-500 font-normal">({matchedModels.length})</span>
        </h1>

        {matchedModels.length === 0 ? (
          <div className="rounded-3xl border border-white/10 bg-zinc-900/50 p-12 text-center max-w-xl">
            <h2 className="text-2xl font-bold mb-4">Sem resultados encontrados</h2>
            <p className="text-zinc-400 mb-8">
              Não encontrámos nenhum modelo que corresponda à sua pesquisa. Tente pesquisar por marcas como Tesla, BYD, Kia, ou Volvo.
            </p>
            <Link
              href={`/${locale}`}
              className="bg-emerald-500 text-black px-6 py-3 rounded-full font-semibold hover:bg-emerald-400 transition"
            >
              Voltar ao Início
            </Link>
          </div>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {matchedModels.map((model) => {
              const price = model.priceFromEur
                ? `${Math.round(model.priceFromEur).toLocaleString(locale === 'pt' ? 'pt-PT' : 'en')} €`
                : 'N/D'
              const priceLabel = getPriceKindLabel(model.primaryPrice, t)
              
              const range = model.maxRealRangeKm ?? model.maxWltpRangeKm

              return (
                <Link
                  key={model.slug}
                  href={`/${locale}/modelos/${model.slug}`}
                  className="group overflow-hidden rounded-[32px] bg-zinc-900 border border-white/10 hover:border-emerald-500 transition block"
                >
                  <div className="relative h-64 w-full bg-zinc-950">
                    <Image
                      src={model.heroImage}
                      alt={model.displayName}
                      fill
                      className="object-cover"
                      sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                    />
                  </div>

                  <div className="p-8">
                    <p className="text-zinc-500 text-sm mb-1">{model.brand}</p>
                    <h3 className="text-3xl font-bold mb-6 group-hover:text-emerald-400 transition">
                      {model.model}
                    </h3>

                    <div className="grid grid-cols-2 gap-6 mb-6">
                      <div>
                        <p className="text-zinc-500 text-sm mb-2">Autonomia real</p>
                        <p className="text-xl font-semibold">{range ? `${range} km` : 'N/D'}</p>
                      </div>

                      <div>
                        <p className="text-zinc-500 text-sm mb-2">{priceLabel}</p>
                        <p className="text-xl font-semibold">{price}</p>
                      </div>
                    </div>

                    <span className="block w-full text-center bg-white/10 group-hover:bg-white text-white group-hover:text-black py-4 rounded-2xl font-semibold transition">
                      Ver Versões ({model.variantCount})
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
