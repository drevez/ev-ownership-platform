'use client'

import Image from 'next/image'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useMemo, useState } from 'react'

import type { ModelExplorerItem, ModelExplorerVariant } from '@/types/model'
import type { VehiclePriceSummary } from '@/lib/normalizeVehicle'
import { useLocalizedHref } from '@/hooks/useLocalizedHref'
import { useTranslations } from '@/hooks/useTranslations'

type ExplorerMode = 'models' | 'variants'
type IntentFilter =
  | 'budget'
  | 'family'
  | 'city'
  | 'longTrips'
  | 'suv'
  | 'fastCharging'
  | 'firstEv'
  | 'range'
type SortKey =
  | 'recommended'
  | 'priceAsc'
  | 'rangeDesc'
  | 'chargingDesc'
  | 'efficiencyAsc'
  | 'newest'
  | 'completeDesc'
  | 'az'

interface ModelsExplorerProps {
  models: ModelExplorerItem[]
  initialBrand?: string
}

const intentFilters: IntentFilter[] = [
  'budget',
  'family',
  'city',
  'longTrips',
  'suv',
  'fastCharging',
  'firstEv',
  'range',
]

const sortKeys: SortKey[] = [
  'recommended',
  'priceAsc',
  'rangeDesc',
  'chargingDesc',
  'efficiencyAsc',
  'newest',
  'completeDesc',
  'az',
]

function formatCurrency(value?: number) {
  if (value == null || value <= 0) return null
  return `${Math.round(value).toLocaleString('pt-PT')} €`
}

function formatNumber(value?: number, unit = '') {
  if (value == null || value <= 0) return null
  return `${Math.round(value).toLocaleString('pt-PT')}${unit ? ` ${unit}` : ''}`
}

function formatPriceContext(price: VehiclePriceSummary | undefined, t: ReturnType<typeof useTranslations>) {
  if (!price) return t.modelsExplorer.price.noConfirmedPrice

  const parts: string[] = []

  if (price.kind === 'new' && price.modelYear) {
    parts.push(t.modelsExplorer.price.modelYear.replace('{year}', String(price.modelYear)))
  }

  if (price.kind !== 'new' && (price.yearFrom || price.yearTo)) {
    const range = [price.yearFrom, price.yearTo].filter(Boolean).join('-')
    parts.push(t.modelsExplorer.price.years.replace('{years}', range))
  }

  parts.push(price.market)

  if (price.updatedAt) {
    parts.push(t.modelsExplorer.price.updated.replace('{date}', price.updatedAt))
  }

  if (price.sourceLabel) {
    parts.push(price.sourceLabel)
  }

  if (price.confidence === 'low') {
    parts.push(`${t.pricing.confidence}: ${t.pricing.confidenceValues.low}`)
  } else if (price.confidence === 'unknown') {
    parts.push(`${t.pricing.confidence}: ${t.pricing.confidenceValues.unknown}`)
  }

  if (price.isLegacy) {
    parts.push(t.modelsExplorer.price.legacy)
  }

  if (price.kind === 'importedUsed' && price.estimatedPortugalCostsIncluded === false) {
    parts.push(t.modelsExplorer.price.importCostsNotIncluded)
  }

  return parts.join(' · ')
}

function priceKindLabel(price: VehiclePriceSummary | undefined, t: ReturnType<typeof useTranslations>) {
  if (!price) return t.modelsExplorer.price.priceValidating
  if (price.status === 'not_sold_new') return t.modelsExplorer.price.kind.referenceNew
  return t.modelsExplorer.price.kind[price.kind]
}

function includesText(value: string, query: string) {
  return value.toLowerCase().includes(query.toLowerCase())
}

function modelMatchesIntent(model: ModelExplorerItem, intent: IntentFilter) {
  const body = model.bodyTypes.join(' ').toLowerCase()
  const segment = model.segment.toLowerCase()
  const price = model.priceFromEur ?? Number.MAX_SAFE_INTEGER
  const range = model.maxRealRangeKm ?? model.maxWltpRangeKm ?? 0
  const dc = model.maxDcChargeKw ?? 0
  const seats = model.maxSeats ?? 0
  const trunk = model.maxTrunkLiters ?? 0
  const consumption = model.bestConsumptionWhKm ?? 999

  if (intent === 'budget') return price <= 35000
  if (intent === 'family') return seats >= 5 && (trunk >= 430 || body.includes('suv'))
  if (intent === 'city') return segment.startsWith('a-') || segment.startsWith('b-') || body.includes('hatch')
  if (intent === 'longTrips') return range >= 420 && dc >= 130
  if (intent === 'suv') return body.includes('suv')
  if (intent === 'fastCharging') return dc >= 170
  if (intent === 'firstEv') return price <= 40000 && consumption <= 185
  if (intent === 'range') return range >= 500
  return true
}

function sortModels(models: ModelExplorerItem[], sortKey: SortKey) {
  return [...models].sort((a, b) => {
    if (sortKey === 'priceAsc') {
      return (a.priceFromEur ?? Number.MAX_SAFE_INTEGER) - (b.priceFromEur ?? Number.MAX_SAFE_INTEGER)
    }
    if (sortKey === 'rangeDesc') {
      return (b.maxRealRangeKm ?? b.maxWltpRangeKm ?? 0) - (a.maxRealRangeKm ?? a.maxWltpRangeKm ?? 0)
    }
    if (sortKey === 'chargingDesc') {
      return (b.maxDcChargeKw ?? 0) - (a.maxDcChargeKw ?? 0)
    }
    if (sortKey === 'efficiencyAsc') {
      return (a.bestConsumptionWhKm ?? Number.MAX_SAFE_INTEGER) - (b.bestConsumptionWhKm ?? Number.MAX_SAFE_INTEGER)
    }
    if (sortKey === 'newest') {
      return (b.newestModelYear ?? 0) - (a.newestModelYear ?? 0)
    }
    if (sortKey === 'completeDesc') {
      return b.dataCompleteness - a.dataCompleteness
    }
    if (sortKey === 'az') {
      return a.displayName.localeCompare(b.displayName, 'pt-PT')
    }

    const scoreA =
      a.dataCompleteness +
      (a.priceFromEur ? 15 : 0) +
      ((a.maxRealRangeKm ?? a.maxWltpRangeKm ?? 0) >= 400 ? 12 : 0) +
      ((a.maxDcChargeKw ?? 0) >= 120 ? 8 : 0)
    const scoreB =
      b.dataCompleteness +
      (b.priceFromEur ? 15 : 0) +
      ((b.maxRealRangeKm ?? b.maxWltpRangeKm ?? 0) >= 400 ? 12 : 0) +
      ((b.maxDcChargeKw ?? 0) >= 120 ? 8 : 0)

    return scoreB - scoreA
  })
}

function flattenVariants(models: ModelExplorerItem[]) {
  return models.flatMap((model) =>
    model.variants.map((variant) => ({
      ...variant,
      modelSlug: model.slug,
      modelDisplayName: model.displayName,
    }))
  )
}

export function ModelsExplorer({ models, initialBrand = 'all' }: ModelsExplorerProps) {
  const t = useTranslations()
  const localizedHref = useLocalizedHref()
  const router = useRouter()
  const [mode, setMode] = useState<ExplorerMode>('models')
  const [query, setQuery] = useState('')
  const [activeIntent, setActiveIntent] = useState<IntentFilter | null>(null)
  const [brand, setBrand] = useState(initialBrand)
  const [bodyType, setBodyType] = useState('all')
  const [maxPrice, setMaxPrice] = useState('all')
  const [minRange, setMinRange] = useState('all')
  const [minDc, setMinDc] = useState('all')
  const [dataState, setDataState] = useState('all')
  const [sortKey, setSortKey] = useState<SortKey>('recommended')
  const [advancedOpen, setAdvancedOpen] = useState(false)

  const stats = useMemo(() => {
    const variants = flattenVariants(models)
    return {
      models: models.length,
      variants: variants.length,
      brands: new Set(models.map((model) => model.brand)).size,
      priceFrom: Math.min(
        ...variants
          .map((variant) => variant.priceFromEur)
          .filter((price): price is number => price != null && price > 0)
      ),
      maxRange: Math.max(
        ...variants.map((variant) => variant.realRangeKm ?? variant.wltpRangeKm ?? 0)
      ),
    }
  }, [models])

  const brands = useMemo(
    () => Array.from(new Set(models.map((model) => model.brand))).sort(),
    [models]
  )
  const bodyTypes = useMemo(
    () => Array.from(new Set(models.flatMap((model) => model.bodyTypes))).sort(),
    [models]
  )

  const filteredModels = useMemo(() => {
    const filtered = models.filter((model) => {
      const normalizedQuery = query.trim()
      const textMatch =
        normalizedQuery.length === 0 ||
        includesText(
          [
            model.brand,
            model.model,
            model.displayName,
            model.segment,
            model.bodyTypes.join(' '),
            model.variants.map((variant) => variant.displayName).join(' '),
          ].join(' '),
          normalizedQuery
        )

      if (!textMatch) return false
      if (activeIntent && !modelMatchesIntent(model, activeIntent)) return false
      if (brand !== 'all' && model.brand !== brand) return false
      if (bodyType !== 'all' && !model.bodyTypes.includes(bodyType)) return false
      if (maxPrice !== 'all' && (model.priceFromEur ?? Number.MAX_SAFE_INTEGER) > Number(maxPrice)) return false
      if (minRange !== 'all' && (model.maxRealRangeKm ?? model.maxWltpRangeKm ?? 0) < Number(minRange)) return false
      if (minDc !== 'all' && (model.maxDcChargeKw ?? 0) < Number(minDc)) return false
      if (dataState === 'complete' && model.dataCompleteness < 100) return false
      if (dataState === 'validating' && model.dataCompleteness >= 100) return false

      return true
    })

    return sortModels(filtered, sortKey)
  }, [activeIntent, bodyType, brand, dataState, maxPrice, minDc, minRange, models, query, sortKey])

  const filteredVariants = useMemo(() => {
    const variants = flattenVariants(filteredModels)

    return variants.sort((a, b) => {
      if (sortKey === 'priceAsc') {
        return (a.priceFromEur ?? Number.MAX_SAFE_INTEGER) - (b.priceFromEur ?? Number.MAX_SAFE_INTEGER)
      }
      if (sortKey === 'rangeDesc') {
        return (b.realRangeKm ?? b.wltpRangeKm ?? 0) - (a.realRangeKm ?? a.wltpRangeKm ?? 0)
      }
      if (sortKey === 'chargingDesc') return (b.dcChargeKw ?? 0) - (a.dcChargeKw ?? 0)
      if (sortKey === 'efficiencyAsc') {
        return (a.consumptionWhKm ?? Number.MAX_SAFE_INTEGER) - (b.consumptionWhKm ?? Number.MAX_SAFE_INTEGER)
      }
      if (sortKey === 'newest') return (b.modelYear ?? 0) - (a.modelYear ?? 0)
      if (sortKey === 'completeDesc') return b.dataCompleteness - a.dataCompleteness
      return a.displayName.localeCompare(b.displayName, 'pt-PT')
    })
  }, [filteredModels, sortKey])

  function clearFilters() {
    setQuery('')
    setActiveIntent(null)
    setBrand('all')
    setBodyType('all')
    setMaxPrice('all')
    setMinRange('all')
    setMinDc('all')
    setDataState('all')
    setSortKey('recommended')
    router.replace(localizedHref('/models'), { scroll: false })
  }

  return (
    <main className="min-h-screen bg-slate-50 text-slate-950">
      <section className="border-b border-slate-200 bg-white">
        <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
          <div className="grid gap-8 lg:grid-cols-[1fr_360px] lg:items-end">
            <div>
              <p className="text-sm font-semibold uppercase tracking-[0.2em] text-emerald-700">
                {t.models.catalog}
              </p>
              <h1 className="mt-3 text-4xl font-bold tracking-tight text-slate-950 md:text-5xl">
                {t.models.title}
              </h1>
              <p className="mt-4 max-w-3xl text-base leading-7 text-slate-600 md:text-lg">
                {t.models.description}
              </p>
            </div>

            <div className="grid grid-cols-2 gap-3 rounded-lg border border-slate-200 bg-slate-50 p-3">
              <Stat label={t.modelsExplorer.stats.models} value={stats.models} />
              <Stat label={t.modelsExplorer.stats.versions} value={stats.variants} />
              <Stat label={t.modelsExplorer.stats.brands} value={stats.brands} />
              <Stat
                label={t.modelsExplorer.stats.priceFrom}
                value={Number.isFinite(stats.priceFrom) ? formatCurrency(stats.priceFrom) : t.common.notAvailable}
              />
              <Stat
                label={t.modelsExplorer.stats.bestRange}
                value={stats.maxRange > 0 ? `${stats.maxRange} km` : t.common.notAvailable}
                wide
              />
            </div>
          </div>

          <div className="mt-8 rounded-lg border border-slate-200 bg-white p-3 shadow-sm">
            <label className="sr-only" htmlFor="model-search">
              {t.modelsExplorer.searchLabel}
            </label>
            <input
              id="model-search"
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder={t.modelsExplorer.searchPlaceholder}
              className="h-12 w-full rounded-md border border-slate-200 bg-slate-50 px-4 text-base outline-none transition focus:border-emerald-500 focus:bg-white"
            />
          </div>

          <div className="mt-5 flex flex-wrap gap-2">
            {intentFilters.map((intent) => (
              <button
                key={intent}
                type="button"
                onClick={() => setActiveIntent((current) => (current === intent ? null : intent))}
                className={`rounded-full border px-4 py-2 text-sm font-medium transition ${
                  activeIntent === intent
                    ? 'border-emerald-600 bg-emerald-600 text-white'
                    : 'border-slate-200 bg-white text-slate-700 hover:border-slate-300'
                }`}
              >
                {t.modelsExplorer.intent[intent]}
              </button>
            ))}
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="flex flex-col gap-4 border-b border-slate-200 pb-5 lg:flex-row lg:items-center lg:justify-between">
          <div className="inline-grid grid-cols-2 rounded-lg bg-slate-200 p-1 text-sm font-semibold">
            <button
              type="button"
              onClick={() => setMode('models')}
              className={`rounded-md px-4 py-2 transition ${
                mode === 'models' ? 'bg-white text-slate-950 shadow-sm' : 'text-slate-600'
              }`}
            >
              {t.modelsExplorer.tabs.models}
            </button>
            <button
              type="button"
              onClick={() => setMode('variants')}
              className={`rounded-md px-4 py-2 transition ${
                mode === 'variants' ? 'bg-white text-slate-950 shadow-sm' : 'text-slate-600'
              }`}
            >
              {t.modelsExplorer.tabs.variants}
            </button>
          </div>

          <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
            <label className="flex items-center gap-2 text-sm text-slate-600">
              <span>{t.modelsExplorer.sortLabel}</span>
              <select
                value={sortKey}
                onChange={(event) => setSortKey(event.target.value as SortKey)}
                className="h-10 rounded-md border border-slate-200 bg-white px-3 text-slate-950"
              >
                {sortKeys.map((key) => (
                  <option key={key} value={key}>
                    {t.modelsExplorer.sort[key]}
                  </option>
                ))}
              </select>
            </label>
            <button
              type="button"
              onClick={() => setAdvancedOpen((open) => !open)}
              className="h-10 rounded-md border border-slate-200 bg-white px-4 text-sm font-semibold text-slate-700 transition hover:border-slate-300"
            >
              {advancedOpen ? t.modelsExplorer.hideFilters : t.modelsExplorer.showFilters}
            </button>
            <button
              type="button"
              onClick={clearFilters}
              className="h-10 rounded-md px-4 text-sm font-semibold text-slate-500 transition hover:text-slate-800"
            >
              {t.modelsExplorer.clearFilters}
            </button>
          </div>
        </div>

        {advancedOpen && (
          <div className="mt-5 grid gap-3 rounded-lg border border-slate-200 bg-white p-4 md:grid-cols-2 lg:grid-cols-6">
            <FilterSelect label={t.modelsExplorer.filters.brand} value={brand} onChange={setBrand}>
              <option value="all">{t.modelsExplorer.filters.allBrands}</option>
              {brands.map((item) => (
                <option key={item} value={item}>{item}</option>
              ))}
            </FilterSelect>
            <FilterSelect label={t.modelsExplorer.filters.body} value={bodyType} onChange={setBodyType}>
              <option value="all">{t.modelsExplorer.filters.allBodies}</option>
              {bodyTypes.map((item) => (
                <option key={item} value={item}>{item}</option>
              ))}
            </FilterSelect>
            <FilterSelect label={t.modelsExplorer.filters.maxPrice} value={maxPrice} onChange={setMaxPrice}>
              <option value="all">{t.modelsExplorer.filters.anyPrice}</option>
              <option value="30000">30.000 €</option>
              <option value="40000">40.000 €</option>
              <option value="50000">50.000 €</option>
              <option value="70000">70.000 €</option>
            </FilterSelect>
            <FilterSelect label={t.modelsExplorer.filters.minRange} value={minRange} onChange={setMinRange}>
              <option value="all">{t.modelsExplorer.filters.anyRange}</option>
              <option value="300">300 km</option>
              <option value="400">400 km</option>
              <option value="500">500 km</option>
            </FilterSelect>
            <FilterSelect label={t.modelsExplorer.filters.minDc} value={minDc} onChange={setMinDc}>
              <option value="all">{t.modelsExplorer.filters.anyCharging}</option>
              <option value="100">100 kW</option>
              <option value="150">150 kW</option>
              <option value="200">200 kW</option>
            </FilterSelect>
            <FilterSelect label={t.modelsExplorer.filters.data} value={dataState} onChange={setDataState}>
              <option value="all">{t.modelsExplorer.filters.allData}</option>
              <option value="complete">{t.modelsExplorer.filters.complete}</option>
              <option value="validating">{t.modelsExplorer.filters.validating}</option>
            </FilterSelect>
          </div>
        )}

        <div className="mt-6 flex items-center justify-between text-sm text-slate-500">
          <p>
            {mode === 'models'
              ? t.modelsExplorer.resultModels.replace('{count}', String(filteredModels.length))
              : t.modelsExplorer.resultVariants.replace('{count}', String(filteredVariants.length))}
          </p>
        </div>

        {mode === 'models' ? (
          <div className="mt-6 grid gap-4 lg:grid-cols-2">
            {filteredModels.map((model) => (
              <ModelCard key={model.slug} model={model} />
            ))}
          </div>
        ) : (
          <div className="mt-6 overflow-hidden rounded-lg border border-slate-200 bg-white">
            <div className="hidden grid-cols-[1.6fr_0.8fr_0.7fr_0.7fr_0.7fr_0.7fr] gap-4 border-b border-slate-200 bg-slate-50 px-4 py-3 text-xs font-semibold uppercase tracking-wide text-slate-500 lg:grid">
              <span>{t.modelsExplorer.variantTable.version}</span>
              <span>{t.modelsExplorer.variantTable.price}</span>
              <span>{t.modelsExplorer.variantTable.range}</span>
              <span>{t.modelsExplorer.variantTable.charging}</span>
              <span>{t.modelsExplorer.variantTable.battery}</span>
              <span>{t.modelsExplorer.variantTable.data}</span>
            </div>
            <div className="divide-y divide-slate-100">
              {filteredVariants.map((variant) => (
                <VariantRow key={variant.id} variant={variant} />
              ))}
            </div>
          </div>
        )}
      </section>
    </main>
  )

  function ModelCard({ model }: { model: ModelExplorerItem }) {
    const price = formatCurrency(model.priceFromEur)
    const priceLabel = priceKindLabel(model.primaryPrice, t)
    const priceContext = formatPriceContext(model.primaryPrice, t)
    const range = formatNumber(model.maxRealRangeKm ?? model.maxWltpRangeKm, 'km')
    const dc = formatNumber(model.maxDcChargeKw, 'kW')
    const isComplete = model.dataCompleteness >= 100

    return (
      <article className="overflow-hidden rounded-lg border border-slate-200 bg-white shadow-sm transition hover:border-emerald-300 hover:shadow-md">
        <div className="grid sm:grid-cols-[220px_1fr]">
          <Link
            href={localizedHref(`/models/${model.slug}`)}
            className="relative block aspect-[16/10] bg-slate-100 sm:aspect-auto"
          >
            <Image
              src={model.heroImage}
              alt={model.displayName}
              fill
              className="object-cover"
              sizes="(max-width: 640px) 100vw, 220px"
            />
          </Link>
          <div className="p-5">
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div>
                <p className="text-sm font-medium text-slate-500">{model.brand}</p>
                <h2 className="mt-1 text-2xl font-bold text-slate-950">
                  <Link href={localizedHref(`/models/${model.slug}`)} className="hover:text-emerald-700">
                    {model.model}
                  </Link>
                </h2>
              </div>
              <span className={`rounded-full px-3 py-1 text-xs font-semibold ${
                isComplete
                  ? 'bg-emerald-50 text-emerald-700'
                  : 'bg-amber-50 text-amber-700'
              }`}>
                {isComplete ? t.modelsExplorer.dataComplete : t.modelsExplorer.dataValidating}
              </span>
            </div>

            <p className="mt-2 text-sm text-slate-500">
              {model.variantCount}{' '}
              {model.variantCount === 1 ? t.models.version : t.models.versions}
              {' · '}
              {model.bodyTypes.join(', ') || t.common.notAvailable}
            </p>

            <div className="mt-4 grid grid-cols-3 gap-2">
              <Metric
                label={priceLabel}
                value={price ?? t.common.notAvailable}
                hint={priceContext}
              />
              <Metric label={t.modelsExplorer.card.rangeUpTo} value={range ?? t.common.notAvailable} />
              <Metric label={t.modelsExplorer.card.fastCharging} value={dc ?? t.common.notAvailable} />
            </div>

            <div className="mt-4 flex flex-wrap gap-2">
              {modelMatchesIntent(model, 'longTrips') && <Tag>{t.modelsExplorer.intent.longTrips}</Tag>}
              {modelMatchesIntent(model, 'family') && <Tag>{t.modelsExplorer.intent.family}</Tag>}
              {modelMatchesIntent(model, 'fastCharging') && <Tag>{t.modelsExplorer.intent.fastCharging}</Tag>}
              {modelMatchesIntent(model, 'budget') && <Tag>{t.modelsExplorer.intent.budget}</Tag>}
            </div>

            <div className="mt-5 flex flex-col gap-2 sm:flex-row">
              <Link
                href={localizedHref(`/models/${model.slug}`)}
                className="inline-flex justify-center rounded-md bg-slate-950 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-slate-800"
              >
                {t.modelsExplorer.card.viewVersions}
              </Link>
              <Link
                href={localizedHref(`/compare?ids=${model.variants[0]?.id ?? ''}`)}
                className="inline-flex justify-center rounded-md border border-slate-200 px-4 py-2.5 text-sm font-semibold text-slate-700 transition hover:border-slate-300"
              >
                {t.modelsExplorer.card.compare}
              </Link>
            </div>
          </div>
        </div>
      </article>
    )
  }

  function VariantRow({
    variant,
  }: {
    variant: ModelExplorerVariant & {
      modelSlug: string
      modelDisplayName: string
    }
  }) {
    return (
      <Link
        href={localizedHref(`/vehicles/${variant.id}`)}
        className="grid gap-3 px-4 py-4 transition hover:bg-slate-50 lg:grid-cols-[1.6fr_0.8fr_0.7fr_0.7fr_0.7fr_0.7fr] lg:items-center"
      >
        <div className="flex items-center gap-3">
          <div className="relative h-14 w-20 shrink-0 overflow-hidden rounded-md bg-slate-100">
            <Image
              src={variant.image}
              alt={variant.displayName}
              fill
              className="object-cover"
              sizes="80px"
            />
          </div>
          <div>
            <p className="font-semibold text-slate-950">{variant.displayName}</p>
            <p className="text-sm text-slate-500">{variant.bodyType} · {variant.drivetrain}</p>
          </div>
        </div>
        <TableValue
          label={priceKindLabel(variant.primaryPrice, t)}
          value={formatCurrency(variant.priceFromEur) ?? t.common.notAvailable}
          hint={formatPriceContext(variant.primaryPrice, t)}
        />
        <TableValue label={t.modelsExplorer.variantTable.range} value={formatNumber(variant.realRangeKm ?? variant.wltpRangeKm, 'km') ?? t.common.notAvailable} />
        <TableValue label={t.modelsExplorer.variantTable.charging} value={formatNumber(variant.dcChargeKw, 'kW') ?? t.common.notAvailable} />
        <TableValue label={t.modelsExplorer.variantTable.battery} value={formatNumber(variant.usableBatteryKwh, 'kWh') ?? t.common.notAvailable} />
        <TableValue
          label={t.modelsExplorer.variantTable.data}
          value={variant.dataCompleteness >= 100 ? t.modelsExplorer.dataComplete : t.modelsExplorer.dataValidating}
        />
      </Link>
    )
  }
}

function Stat({
  label,
  value,
  wide,
}: {
  label: string
  value: React.ReactNode
  wide?: boolean
}) {
  return (
    <div className={wide ? 'col-span-2 rounded-md bg-white p-3' : 'rounded-md bg-white p-3'}>
      <p className="text-xs font-medium uppercase tracking-wide text-slate-500">{label}</p>
      <p className="mt-1 text-lg font-bold text-slate-950">{value}</p>
    </div>
  )
}

function FilterSelect({
  label,
  value,
  onChange,
  children,
}: {
  label: string
  value: string
  onChange: (value: string) => void
  children: React.ReactNode
}) {
  return (
    <label className="space-y-1">
      <span className="text-xs font-semibold uppercase tracking-wide text-slate-500">{label}</span>
      <select
        value={value}
        onChange={(event) => onChange(event.target.value)}
        className="h-10 w-full rounded-md border border-slate-200 bg-slate-50 px-3 text-sm text-slate-950"
      >
        {children}
      </select>
    </label>
  )
}

function Metric({
  label,
  value,
  hint,
}: {
  label: string
  value: string
  hint?: string
}) {
  return (
    <div className="rounded-md bg-slate-50 p-3">
      <p className="text-xs text-slate-500">{label}</p>
      <p className="mt-1 text-sm font-bold text-slate-950">{value}</p>
      {hint && <p className="mt-1 text-[11px] leading-4 text-slate-500">{hint}</p>}
    </div>
  )
}

function Tag({ children }: { children: React.ReactNode }) {
  return (
    <span className="rounded-full bg-blue-50 px-3 py-1 text-xs font-medium text-blue-700">
      {children}
    </span>
  )
}

function TableValue({
  label,
  value,
  hint,
}: {
  label: string
  value: string
  hint?: string
}) {
  return (
    <div>
      <p className="text-xs font-medium uppercase tracking-wide text-slate-400 lg:hidden">{label}</p>
      <p className="text-sm font-semibold text-slate-800">{value}</p>
      {hint && <p className="mt-1 text-xs text-slate-500">{hint}</p>}
    </div>
  )
}
