'use client'

import Image from 'next/image'
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { useEffect, useMemo, useRef, useState } from 'react'

import { VehicleSuggestionPrompt } from '@/components/VehicleSuggestionPrompt'
import { useLocale } from '@/context/LocaleContext'
import type { ModelExplorerItem } from '@/types/model'
import type { VehiclePriceSummary } from '@/lib/normalizeVehicle'
import { useLocalizedHref } from '@/hooks/useLocalizedHref'
import { useTranslations } from '@/hooks/useTranslations'
import { buildPageContext, pageContextToFlatProperties } from '@/lib/analytics'
import { delocalizePathname, stripLanguageFromPathname } from '@/lib/i18nRouting'
import { trackEvent } from '@/lib/posthogClient'
import { isTrackableSearchQuery, normalizeSignalText } from '@/lib/productSignals'
import {
  flattenVariants,
  intentFilters,
  modelIncludesQuery,
  modelMatchesIntent,
  sortKeys,
  sortModels,
  sortVariants,
  type ExplorerMode,
  type FlattenedModelVariant,
  type IntentFilter,
  type SortKey,
} from '@/lib/modelExplorer'

interface ModelsExplorerProps {
  models: ModelExplorerItem[]
  initialBrand?: string
}

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

export function ModelsExplorer({ models, initialBrand = 'all' }: ModelsExplorerProps) {
  const t = useTranslations()
  const localizedHref = useLocalizedHref()
  const router = useRouter()
  const pathname = usePathname()
  const { locale } = useLocale()
  const lastNoResultSearchRef = useRef('')
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
      if (!modelIncludesQuery(model, query)) return false
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
    return sortVariants(flattenVariants(filteredModels), sortKey)
  }, [filteredModels, sortKey])

  const currentResultCount = mode === 'models' ? filteredModels.length : filteredVariants.length

  useEffect(() => {
    if (!isTrackableSearchQuery(query) || currentResultCount > 0) return

    const queryNormalized = normalizeSignalText(query)
    const key = `${mode}:${queryNormalized}`
    if (lastNoResultSearchRef.current === key) return

    lastNoResultSearchRef.current = key
    const canonicalPath = delocalizePathname(stripLanguageFromPathname(pathname))
    const page = buildPageContext({
      path: pathname,
      canonicalPath,
      type: 'models',
      language: locale,
    })
    trackEvent('vehicle_search_no_results', {
      event_schema_version: 2,
      page,
      search: {
        query_normalized: queryNormalized,
        query_length: queryNormalized.length,
        result_count: 0,
        source_component: 'models_explorer',
        mode,
      },
      ...pageContextToFlatProperties(page),
      query_normalized: queryNormalized,
      query_length: queryNormalized.length,
      result_count: 0,
      page_type: 'models',
      source_component: 'models_explorer',
      mode,
    })
  }, [currentResultCount, locale, mode, pathname, query])

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
    trackEvent('model_filter_used', {
      filter_type: 'clear_all',
      value: 'all',
      mode,
    })
  }

  function trackFilter(filterType: string, value: string) {
    trackEvent('model_filter_used', {
      filter_type: filterType,
      value,
      mode,
      result_count: mode === 'models' ? filteredModels.length : filteredVariants.length,
    })
  }

  function trackSearch() {
    if (!isTrackableSearchQuery(query)) return

    const queryNormalized = normalizeSignalText(query)
    trackEvent('vehicle_search_performed', {
      query_normalized: queryNormalized,
      query_length: queryNormalized.length,
      result_count: currentResultCount,
      page_type: 'models',
      page_path: pathname,
      locale,
      source_component: 'models_explorer',
      mode,
    })
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
              onBlur={() => {
                const value = query.trim()
                if (value.length >= 2) {
                  trackFilter('search', value)
                  trackSearch()
                }
              }}
              placeholder={t.modelsExplorer.searchPlaceholder}
              className="h-12 w-full rounded-md border border-slate-200 bg-slate-50 px-4 text-base outline-none transition focus:border-emerald-500 focus:bg-white"
            />
          </div>

          <div className="mt-5 flex flex-wrap gap-2">
            {intentFilters.map((intent) => (
              <button
                key={intent}
                type="button"
                onClick={() => {
                  setActiveIntent((current) => {
                    const nextIntent = current === intent ? null : intent
                    trackFilter('intent', nextIntent ?? 'all')
                    return nextIntent
                  })
                }}
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
              onClick={() => {
                setMode('models')
                trackFilter('explorer_mode', 'models')
              }}
              className={`rounded-md px-4 py-2 transition ${
                mode === 'models' ? 'bg-white text-slate-950 shadow-sm' : 'text-slate-600'
              }`}
            >
              {t.modelsExplorer.tabs.models}
            </button>
            <button
              type="button"
              onClick={() => {
                setMode('variants')
                trackFilter('explorer_mode', 'variants')
              }}
              className={`rounded-md px-4 py-2 transition ${
                mode === 'variants' ? 'bg-white text-slate-950 shadow-sm' : 'text-slate-600'
              }`}
            >
              {t.modelsExplorer.tabs.variants}
            </button>
          </div>

          <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
            <label className="flex flex-col gap-2 text-sm text-slate-600 sm:flex-row sm:items-center">
              <span>{t.modelsExplorer.sortLabel}</span>
              <select
                value={sortKey}
                onChange={(event) => {
                  const nextSort = event.target.value as SortKey
                  setSortKey(nextSort)
                  trackFilter('sort', nextSort)
                }}
                className="h-11 w-full rounded-md border border-slate-200 bg-white px-3 text-slate-950 sm:h-10 sm:w-auto"
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
              className="h-11 rounded-md border border-slate-200 bg-white px-4 text-sm font-semibold text-slate-700 transition hover:border-slate-300 sm:h-10"
            >
              {advancedOpen ? t.modelsExplorer.hideFilters : t.modelsExplorer.showFilters}
            </button>
            <button
              type="button"
              onClick={clearFilters}
              className="h-11 rounded-md px-4 text-sm font-semibold text-slate-500 transition hover:bg-slate-100 hover:text-slate-800 sm:h-10"
            >
              {t.modelsExplorer.clearFilters}
            </button>
          </div>
        </div>

        {advancedOpen && (
          <div className="mt-5 grid gap-3 rounded-lg border border-slate-200 bg-white p-4 md:grid-cols-2 lg:grid-cols-6">
            <FilterSelect
              label={t.modelsExplorer.filters.brand}
              value={brand}
              onChange={(value) => {
                setBrand(value)
                trackFilter('brand', value)
              }}
            >
              <option value="all">{t.modelsExplorer.filters.allBrands}</option>
              {brands.map((item) => (
                <option key={item} value={item}>{item}</option>
              ))}
            </FilterSelect>
            <FilterSelect
              label={t.modelsExplorer.filters.body}
              value={bodyType}
              onChange={(value) => {
                setBodyType(value)
                trackFilter('body_type', value)
              }}
            >
              <option value="all">{t.modelsExplorer.filters.allBodies}</option>
              {bodyTypes.map((item) => (
                <option key={item} value={item}>{item}</option>
              ))}
            </FilterSelect>
            <FilterSelect
              label={t.modelsExplorer.filters.maxPrice}
              value={maxPrice}
              onChange={(value) => {
                setMaxPrice(value)
                trackFilter('max_price', value)
              }}
            >
              <option value="all">{t.modelsExplorer.filters.anyPrice}</option>
              <option value="30000">30.000 €</option>
              <option value="40000">40.000 €</option>
              <option value="50000">50.000 €</option>
              <option value="70000">70.000 €</option>
            </FilterSelect>
            <FilterSelect
              label={t.modelsExplorer.filters.minRange}
              value={minRange}
              onChange={(value) => {
                setMinRange(value)
                trackFilter('min_range', value)
              }}
            >
              <option value="all">{t.modelsExplorer.filters.anyRange}</option>
              <option value="300">300 km</option>
              <option value="400">400 km</option>
              <option value="500">500 km</option>
            </FilterSelect>
            <FilterSelect
              label={t.modelsExplorer.filters.minDc}
              value={minDc}
              onChange={(value) => {
                setMinDc(value)
                trackFilter('min_dc', value)
              }}
            >
              <option value="all">{t.modelsExplorer.filters.anyCharging}</option>
              <option value="100">100 kW</option>
              <option value="150">150 kW</option>
              <option value="200">200 kW</option>
            </FilterSelect>
            <FilterSelect
              label={t.modelsExplorer.filters.data}
              value={dataState}
              onChange={(value) => {
                setDataState(value)
                trackFilter('data_state', value)
              }}
            >
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

        {currentResultCount === 0 && isTrackableSearchQuery(query) && (
          <div className="mt-6">
            <VehicleSuggestionPrompt
              query={query}
              resultCount={0}
              sourceComponent="models_explorer"
            />
          </div>
        )}

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
                href={localizedHref(`/compare/models?models=${encodeURIComponent(model.slug)}`)}
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
    variant: FlattenedModelVariant
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
