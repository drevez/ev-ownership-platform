'use client'

import { useEffect, useRef, useState } from 'react'
import { usePathname, useRouter, useSearchParams } from 'next/navigation'
import dynamic from 'next/dynamic'
import { ComparisonVehicle } from '@/types/comparison'
import Link from 'next/link'
import { VEHICLE_PLACEHOLDER_IMAGE } from '@/lib/vehicleImages'
import { useTranslations } from '@/hooks/useTranslations'
import { useLocalizedHref } from '@/hooks/useLocalizedHref'
import { SafeImage } from '@/components/SafeImage'
import { pushGaEvent } from '@/lib/gaEvents'
import { trackEvent } from '@/lib/posthogClient'
import {
  buildPageContext,
  pageContextToFlatProperties,
  toAnalyticsVehicles,
  vehicleFlatProperties,
} from '@/lib/analytics'
import { getLanguageFromPathname } from '@/lib/i18nRouting'

const AdvancedComparisonContent = dynamic(() =>
  import('./AdvancedComparisonContent').then((module) => module.AdvancedComparisonContent)
)

interface ComparisonPageProps {
  vehicles: ComparisonVehicle[]
  editSelectionHref?: string
}

type ComparisonMode = 'simple' | 'advanced'
type ComparisonType = 'models' | 'versions'
type RangeFeeling = 'unknown' | 'relaxed' | 'comfortable' | 'planning'
type ChargingFeeling = 'unknown' | 'fast' | 'ok' | 'slow'
type CargoFeeling = 'unknown' | 'large' | 'family' | 'compact'
type ComparisonPriceSummary = NonNullable<NonNullable<ComparisonVehicle['pricing']>['priceSummaries']>[number]
type RawComparisonPricing = NonNullable<ComparisonVehicle['pricing']> & {
  offers?: {
    condition?: 'new' | 'used'
    status?: string
    marketScope?: string
    priceFrom?: number
    priceTo?: number
    modelYear?: number
    yearFrom?: number
    yearTo?: number
  }[]
  pt?: {
    new?: RawPricingOffer
    used?: RawPricingOffer
    importedUsed?: RawPricingOffer
    usedPrice?: {
      min?: number
      max?: number
    }
  }
}
type RawPricingOffer = {
  available?: boolean
  priceFrom?: number
  priceTo?: number
  modelYear?: number
  yearFrom?: number
  yearTo?: number
}

function comparisonGridClass(vehicleCount: number) {
  return vehicleCount === 2
    ? 'mx-auto grid max-w-5xl grid-cols-1 gap-6 md:grid-cols-2'
    : 'grid grid-cols-1 gap-6 md:grid-cols-2 xl:grid-cols-3'
}

function comparisonShareGaProperties(
  vehicles: ComparisonVehicle[],
  comparisonType: ComparisonType,
  method: string
) {
  const page = buildPageContext({
    path: window.location.pathname,
    canonicalPath: comparisonType === 'models' ? '/compare/models' : '/compare/versions',
    type: 'comparison',
    language: getLanguageFromPathname(window.location.pathname) ?? 'pt',
  })
  const analyticsVehicles = toAnalyticsVehicles(vehicles)
  const comparison = {
    type: comparisonType,
    vehicle_count: vehicles.length,
  }

  return {
    event_schema_version: 2,
    page,
    comparison,
    vehicles: analyticsVehicles,
    content: {
      type: 'comparison',
      share_method: method,
    },
    content_type: 'comparison',
    comparison_type: comparisonType,
    share_method: method,
    ...pageContextToFlatProperties(page),
    ...vehicleFlatProperties(analyticsVehicles),
  }
}

function formatCurrency(value?: number) {
  if (value == null) return 'N/D'
  return `${Math.round(value).toLocaleString()} €`
}

function formatNumber(value: number | undefined, unit: string) {
  if (value == null) return 'N/D'
  return `${Math.round(value).toLocaleString()} ${unit}`
}

function priceContextLabelFromSummary(
  price: ComparisonPriceSummary | undefined,
  t: ReturnType<typeof useTranslations>
) {
  if (!price) return t.comparisonPage.simplePriceContextUnknown
  if (price.status === 'not_sold_new') return t.modelsExplorer.price.kind.referenceNew
  if (price.kind === 'importedUsed') return t.modelsExplorer.price.kind.importedUsed
  if (price.kind === 'used') return t.modelsExplorer.price.kind.used
  return t.modelsExplorer.price.kind.new
}

function priceContextLabel(
  vehicle: ComparisonVehicle | undefined,
  t: ReturnType<typeof useTranslations>
) {
  return priceContextLabelFromSummary(vehicle?.pricing?.primaryPrice, t)
}

function priceYearContextFromSummary(
  price: ComparisonPriceSummary | undefined,
  t: ReturnType<typeof useTranslations>
) {
  if (!price) return null
  if (price.modelYear != null) {
    return t.modelsExplorer.price.modelYear.replace('{year}', String(price.modelYear))
  }
  if (price.yearFrom != null || price.yearTo != null) {
    return t.modelsExplorer.price.years.replace(
      '{years}',
      [price.yearFrom, price.yearTo].filter(Boolean).join('-')
    )
  }
  return null
}

function priceYearContext(vehicle: ComparisonVehicle | undefined, t: ReturnType<typeof useTranslations>) {
  return priceYearContextFromSummary(vehicle?.pricing?.primaryPrice, t)
}

function comparisonPriceValueFromSummary(
  price: ComparisonPriceSummary | undefined,
  t: ReturnType<typeof useTranslations>
) {
  const priceFrom = price?.priceFrom

  if (priceFrom == null) return 'N/D'

  const label = priceContextLabelFromSummary(price, t)
  const formattedFrom = formatCurrency(priceFrom)
  const yearContext = priceYearContextFromSummary(price, t)

  return yearContext ? `${label} ${formattedFrom} · ${yearContext}` : `${label} ${formattedFrom}`
}

function comparisonPriceSummaries(vehicle: ComparisonVehicle): ComparisonPriceSummary[] {
  const summaries = vehicle.pricing?.priceSummaries?.filter((summary) => summary.priceFrom != null) ?? []

  if (summaries.length > 0) return summaries
  const rawPricing = vehicle.pricing as RawComparisonPricing | undefined
  const rawOffers = rawPricing?.offers
    ?.map((offer) => ({
      kind:
        offer.marketScope === 'imported_to_pt'
          ? 'importedUsed'
          : offer.condition === 'used'
            ? 'used'
            : 'new',
      status: offer.status,
      marketScope: offer.marketScope,
      priceFrom: offer.priceFrom,
      priceTo: offer.priceTo,
      modelYear: offer.modelYear,
      yearFrom: offer.yearFrom,
      yearTo: offer.yearTo,
      isLegacy: false,
    }) satisfies ComparisonPriceSummary)
    .filter((summary) => summary.priceFrom != null) ?? []

  if (rawOffers.length > 0) return rawOffers

  const ptPricing = rawPricing?.pt
  const marketOffers = [
    mapRawMarketPrice('new', ptPricing?.new, 'official_pt'),
    mapRawMarketPrice('used', ptPricing?.used, 'used_pt'),
    mapRawMarketPrice('importedUsed', ptPricing?.importedUsed, 'imported_to_pt'),
  ].filter((summary): summary is ComparisonPriceSummary => summary != null)

  if (marketOffers.length > 0) return marketOffers

  if (ptPricing?.usedPrice?.min != null) {
    return [{
      kind: 'used',
      status: 'available',
      marketScope: 'used_pt',
      priceFrom: ptPricing.usedPrice.min,
      priceTo: ptPricing.usedPrice.max,
      isLegacy: true,
    }]
  }

  return vehicle.pricing?.primaryPrice?.priceFrom != null ? [vehicle.pricing.primaryPrice] : []
}

function mapRawMarketPrice(
  kind: NonNullable<ComparisonPriceSummary['kind']>,
  offer: RawPricingOffer | undefined,
  marketScope: string
): ComparisonPriceSummary | null {
  if (!offer || offer.priceFrom == null) return null

  return {
    kind,
    status: offer.available === false ? 'unknown' : 'available',
    marketScope,
    priceFrom: offer.priceFrom,
    priceTo: offer.priceTo,
    modelYear: offer.modelYear,
    yearFrom: offer.yearFrom,
    yearTo: offer.yearTo,
    isLegacy: false,
  }
}

function bestByHighest(
  vehicles: ComparisonVehicle[],
  getValue: (vehicle: ComparisonVehicle) => number | undefined
) {
  return vehicles
    .map((vehicle) => ({ vehicle, value: getValue(vehicle) }))
    .filter((item): item is { vehicle: ComparisonVehicle; value: number } => item.value != null)
    .sort((a, b) => b.value - a.value)[0]
}

function bestByLowest(
  vehicles: ComparisonVehicle[],
  getValue: (vehicle: ComparisonVehicle) => number | undefined
) {
  return vehicles
    .map((vehicle) => ({ vehicle, value: getValue(vehicle) }))
    .filter((item): item is { vehicle: ComparisonVehicle; value: number } => item.value != null && item.value > 0)
    .sort((a, b) => a.value - b.value)[0]
}

function rangeFeeling(rangeKm?: number): RangeFeeling {
  if (rangeKm == null) return 'unknown'
  if (rangeKm >= 420) return 'relaxed'
  if (rangeKm >= 320) return 'comfortable'
  return 'planning'
}

function chargingFeeling(minutes?: number): ChargingFeeling {
  if (minutes == null) return 'unknown'
  if (minutes <= 27) return 'fast'
  if (minutes <= 38) return 'ok'
  return 'slow'
}

function cargoFeeling(liters?: number): CargoFeeling {
  if (liters == null) return 'unknown'
  if (liters >= 500) return 'large'
  if (liters >= 360) return 'family'
  return 'compact'
}

export function ComparisonPage({
  vehicles,
  editSelectionHref = '/compare/models',
}: ComparisonPageProps) {

  const t = useTranslations()
  const localizedHref = useLocalizedHref()
  const pathname = usePathname()
  const router = useRouter()
  const searchParams = useSearchParams()
  const requestedMode = searchParams.get('mode')
  const mode: ComparisonMode = requestedMode === 'advanced' ? 'advanced' : 'simple'
  const comparisonType: ComparisonType = searchParams.getAll('models').length >= 2 ? 'models' : 'versions'
  const vehicleGridClass = comparisonGridClass(vehicles.length)
  const cheapest = bestByLowest(vehicles, (vehicle) => vehicle.pricing?.basePriceEur)
  const bestRange = bestByHighest(vehicles, (vehicle) => vehicle.efficiency?.wltpRangeKm)
  const fastestCharge = bestByLowest(vehicles, (vehicle) => vehicle.charging?.chargeTime10To80Min)
  const mostSpace = bestByHighest(vehicles, (vehicle) => vehicle.dimensions?.trunkCapacityL)
  const simpleWinnerIds = new Set([
    cheapest?.vehicle.id,
    bestRange?.vehicle.id,
    fastestCharge?.vehicle.id,
    mostSpace?.vehicle.id,
  ].filter((id): id is string => Boolean(id)))

  const updateComparisonMode = (nextMode: ComparisonMode) => {
    const params = new URLSearchParams(searchParams.toString())
    params.set('mode', nextMode)
    router.replace(`${pathname}?${params.toString()}`, { scroll: false })
    const page = buildPageContext({
      path: pathname,
      canonicalPath: comparisonType === 'models' ? '/compare/models' : '/compare/versions',
      type: 'comparison',
      language: getLanguageFromPathname(pathname) ?? 'pt',
    })
    const analyticsVehicles = toAnalyticsVehicles(vehicles)
    trackEvent('comparison_mode_changed', {
      event_schema_version: 2,
      page,
      comparison: {
        type: comparisonType,
        mode: nextMode,
        vehicle_count: vehicles.length,
      },
      vehicles: analyticsVehicles,
      mode: nextMode,
      comparison_type: comparisonType,
      selected_ids: analyticsVehicles.map((vehicle) => vehicle.id),
      ...pageContextToFlatProperties(page),
      ...vehicleFlatProperties(analyticsVehicles),
    })
  }

  if (vehicles.length < 2) {
    return (
      <main className="min-h-screen bg-slate-100 text-slate-950">

        <div className="max-w-7xl mx-auto px-4 py-16">

          <div className="text-center py-20">

            <h1 className="text-4xl md:text-5xl font-bold mb-4">
              {t.comparisonPage.noComparison}
            </h1>

            <p className="text-lg text-slate-600 mb-8">
              {t.comparisonPage.selectAtLeastTwo}
            </p>

            <Link
              href={localizedHref('/models')}
              className="inline-block px-8 py-3 bg-emerald-500 hover:bg-emerald-600 text-white font-semibold rounded-lg transition-all duration-200"
            >
              {t.comparisonPage.browseVehicles}
            </Link>
          </div>
        </div>
      </main>
    )
  }

  return (
    <main className="min-h-screen bg-slate-100 pb-8 text-slate-950 md:pb-10">

      <div className="border-b border-slate-800 bg-slate-950 text-white">
        <div className="mx-auto max-w-7xl px-4 py-5 md:py-8">
          <div className="grid gap-4 md:gap-6 lg:grid-cols-[minmax(0,1fr)_380px] lg:items-end">
            <div className="min-w-0">
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-emerald-300">
                {t.comparePage.compare}
              </p>
              <h1 className="mt-2 text-2xl font-bold tracking-tight text-white md:text-4xl">
                {t.comparisonPage.title}
              </h1>
              <p className="mt-3 max-w-3xl text-sm leading-6 text-slate-300 md:text-base">
                {t.comparisonPage.selectedCount.replace('{count}', String(vehicles.length))}
              </p>
              <div className="mt-4 flex max-w-4xl flex-wrap gap-2">
                {vehicles.map((vehicle) => (
                  <span
                    key={vehicle.id}
                    className="max-w-full truncate rounded-full border border-white/10 bg-white/10 px-3 py-1.5 text-sm font-semibold text-slate-100"
                  >
                    {vehicle.displayName}
                  </span>
                ))}
              </div>
            </div>

            <div className="rounded-lg border border-white/10 bg-white/5 p-3 shadow-sm">
              <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
                <p className="text-sm font-semibold text-slate-100">
                  {t.comparisonPage.modeLabel}
                </p>
                <Link
                  href={localizedHref(editSelectionHref)}
                  className="inline-flex w-full justify-center rounded-md border border-white/15 px-3 py-2 text-xs font-semibold text-slate-100 transition hover:border-emerald-300 hover:text-emerald-200 md:w-auto md:py-1.5"
                >
                  {t.comparePage.editSelection}
                </Link>
              </div>
              <div className="mt-3 grid grid-cols-2 gap-1 rounded-lg border border-white/10 bg-slate-900 p-1">
                {(['simple', 'advanced'] as ComparisonMode[]).map((comparisonMode) => (
                  <button
                    key={comparisonMode}
                    type="button"
                    onClick={() => updateComparisonMode(comparisonMode)}
                    className={`rounded-md px-3 py-2 text-sm font-semibold transition ${
                      mode === comparisonMode
                        ? 'bg-emerald-400 text-slate-950 shadow-sm'
                        : 'text-slate-300 hover:bg-white/10 hover:text-white'
                    }`}
                  >
                    {comparisonMode === 'simple'
                      ? t.comparisonPage.simpleMode
                      : t.comparisonPage.advancedMode}
                  </button>
                ))}
              </div>
              <p className="mt-3 text-xs leading-5 text-slate-300">
                {mode === 'simple'
                  ? t.comparisonPage.simpleModeDescription
                  : t.comparisonPage.advancedModeDescription}
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="mx-auto max-w-7xl space-y-5 px-4 py-5 md:space-y-8 md:py-8">
        {mode === 'simple' ? (
          <>
            <SimpleComparisonDecision
              cheapest={cheapest}
              bestRange={bestRange}
              fastestCharge={fastestCharge}
              mostSpace={mostSpace}
            />
            <SimpleVehicleCards
              vehicles={vehicles}
              highlightedIds={simpleWinnerIds}
              localizedHref={localizedHref}
            />
          </>
        ) : (
          <>
            <AdvancedVehicleCards vehicles={vehicles} localizedHref={localizedHref} gridClass={vehicleGridClass} />
            <AdvancedComparisonContent vehicles={vehicles} gridClass={vehicleGridClass} />
          </>
        )}

        <div className="rounded-lg border border-emerald-200 bg-white p-6 text-center shadow-sm md:p-8">

          <h2 className="mb-3 text-2xl font-bold text-slate-950 md:text-3xl">
            {t.comparisonPage.readyDecision}
          </h2>

          <p className="mx-auto mb-6 max-w-2xl text-sm leading-6 text-slate-600 md:text-base">
            {t.comparisonPage.informedChoice}
          </p>

          <div className="flex flex-col justify-center gap-3 sm:flex-row sm:flex-wrap">
            <ShareComparisonButton
              label={t.comparisonPage.shareComparison}
              copiedLabel={t.comparisonPage.linkCopied}
              errorLabel={t.comparisonPage.shareError}
              copyLinkLabel={t.comparisonPage.copyLink}
              whatsappLabel={t.comparisonPage.shareWhatsapp}
              emailLabel={t.comparisonPage.shareEmail}
              shareText={t.comparisonPage.shareText}
              title={t.comparisonPage.title}
              vehicles={vehicles}
              comparisonType={comparisonType}
            />
            <Link
              href={localizedHref(editSelectionHref)}
              className="inline-flex justify-center rounded-lg border border-slate-300 bg-white px-5 py-3 text-sm font-semibold text-slate-700 transition hover:border-emerald-500 hover:text-emerald-800"
            >
              {t.comparePage.editSelection}
            </Link>
          </div>

          <p className="mt-5 text-sm leading-6 text-slate-500">
            {t.comparisonPage.detailsLinksLabel}{' '}
            {vehicles.map((vehicle, index) => (
              <span key={vehicle.id}>
                <Link
                  href={localizedHref(vehicle.detailPath ?? `/vehicles/${vehicle.id}`)}
                  className="font-semibold text-slate-800 underline decoration-slate-300 underline-offset-4 transition hover:text-emerald-700 hover:decoration-emerald-400"
                >
                  {vehicle.displayName}
                </Link>
                {index < vehicles.length - 1 && <span className="mx-1.5 text-slate-300">·</span>}
              </span>
            ))}
          </p>
        </div>
      </div>
    </main>
  )
}

function ShareComparisonButton({
  label,
  copiedLabel,
  errorLabel,
  copyLinkLabel,
  whatsappLabel,
  emailLabel,
  shareText,
  title,
  vehicles,
  comparisonType,
}: {
  label: string
  copiedLabel: string
  errorLabel: string
  copyLinkLabel: string
  whatsappLabel: string
  emailLabel: string
  shareText: string
  title: string
  vehicles: ComparisonVehicle[]
  comparisonType: ComparisonType
}) {
  const [status, setStatus] = useState<'idle' | 'copied' | 'error'>('idle')
  const [isOpen, setIsOpen] = useState(false)
  const [menuMode, setMenuMode] = useState<'desktop' | 'mobileFallback'>('desktop')
  const menuRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!isOpen) return

    const closeOnOutsideClick = (event: MouseEvent) => {
      if (!menuRef.current?.contains(event.target as Node)) {
        setIsOpen(false)
      }
    }

    document.addEventListener('mousedown', closeOnOutsideClick)
    return () => document.removeEventListener('mousedown', closeOnOutsideClick)
  }, [isOpen])

  const copyLink = async () => {
    const url = window.location.href

    try {
      await navigator.clipboard.writeText(url)
      trackShare('copy_link')
      setStatus('copied')
      setIsOpen(false)
      window.setTimeout(() => setStatus('idle'), 2400)
    } catch {
      setStatus('error')
      window.setTimeout(() => setStatus('idle'), 3000)
    }
  }

  const shareNative = async () => {
    try {
      await navigator.share({ title, text: shareText, url: window.location.href })
      trackShare('native_share')
      setIsOpen(false)
    } catch (error) {
      if (error instanceof DOMException && error.name === 'AbortError') return
      setStatus('error')
      window.setTimeout(() => setStatus('idle'), 3000)
    }
  }

  const hasTouchLikeInput = () => window.matchMedia('(pointer: coarse)').matches
  const usesCompactViewport = () => window.innerWidth < 768
  const trackShare = (method: string) => {
    const gaProperties = comparisonShareGaProperties(vehicles, comparisonType, method)

    trackEvent('content_shared', {
      ...gaProperties,
      share_method: method,
      selected_ids: vehicles.map((vehicle) => vehicle.id),
      selected_names: vehicles.map((vehicle) => vehicle.displayName),
    })
    pushGaEvent('content_shared', gaProperties)
  }

  const handlePrimaryShare = async () => {
    if (hasTouchLikeInput() && 'share' in navigator) {
      await shareNative()
      return
    }

    setMenuMode(usesCompactViewport() ? 'mobileFallback' : 'desktop')
    setIsOpen((current) => !current)
  }

  const shareWhatsapp = () => {
    const message = `${shareText} ${window.location.href}`
    window.open(`https://wa.me/?text=${encodeURIComponent(message)}`, '_blank', 'noopener,noreferrer')
    trackShare('whatsapp')
    setIsOpen(false)
  }

  const shareEmail = () => {
    const subject = title
    const body = `${shareText}\n\n${window.location.href}`
    window.location.href = `mailto:?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`
    trackShare('email')
    setIsOpen(false)
  }

  return (
    <div ref={menuRef} className="relative">
      <button
        type="button"
        onClick={handlePrimaryShare}
        className="inline-flex w-full justify-center rounded-lg bg-slate-950 px-5 py-3 text-sm font-semibold text-white transition hover:bg-slate-800 sm:w-auto"
        aria-expanded={isOpen}
      >
        {status === 'copied' ? copiedLabel : status === 'error' ? errorLabel : label}
      </button>

      {isOpen && (
        <div className="absolute bottom-full left-0 right-0 z-20 mb-2 overflow-hidden rounded-lg border border-slate-200 bg-white text-left shadow-xl sm:left-auto sm:right-auto sm:min-w-56">
          <button
            type="button"
            onClick={copyLink}
            className="block w-full px-4 py-3 text-left text-sm font-semibold text-slate-800 transition hover:bg-emerald-50 hover:text-emerald-800"
          >
            {copyLinkLabel}
          </button>
          <button
            type="button"
            onClick={shareWhatsapp}
            className="block w-full px-4 py-3 text-left text-sm font-semibold text-slate-800 transition hover:bg-emerald-50 hover:text-emerald-800"
          >
            {whatsappLabel}
          </button>
          {menuMode === 'desktop' && (
            <button
              type="button"
              onClick={shareEmail}
              className="block w-full px-4 py-3 text-left text-sm font-semibold text-slate-800 transition hover:bg-emerald-50 hover:text-emerald-800"
            >
              {emailLabel}
            </button>
          )}
        </div>
      )}
    </div>
  )
}

function SimpleVehicleCards({
  vehicles,
  highlightedIds,
  localizedHref,
}: {
  vehicles: ComparisonVehicle[]
  highlightedIds: Set<string>
  localizedHref: (href: string) => string
}) {
  const t = useTranslations()
  const gridClass =
    vehicles.length === 2
      ? 'mx-auto grid max-w-6xl gap-5 lg:grid-cols-2'
      : 'grid gap-5 lg:grid-cols-3'

  return (
    <section className={gridClass}>
      {vehicles.map((vehicle) => {
        const rangeKey = rangeFeeling(vehicle.efficiency?.wltpRangeKm)
        const chargingKey = chargingFeeling(vehicle.charging?.chargeTime10To80Min)
        const cargoKey = cargoFeeling(vehicle.dimensions?.trunkCapacityL)
        const isHighlighted = highlightedIds.has(vehicle.id)

        return (
          <article
            key={vehicle.id}
            className={`flex h-full flex-col overflow-hidden rounded-lg border bg-white shadow-sm ${
              isHighlighted ? 'border-emerald-300 ring-1 ring-emerald-200' : 'border-slate-200'
            }`}
          >
            <Link
              href={localizedHref(vehicle.detailPath ?? `/vehicles/${vehicle.id}`)}
              className="group relative block h-48 overflow-hidden bg-slate-100 md:aspect-[16/9] md:h-auto"
            >
              <SafeImage
                src={vehicle.image || VEHICLE_PLACEHOLDER_IMAGE}
                alt={vehicle.displayName}
                fill
                sizes="(max-width: 1024px) 100vw, 50vw"
                className="object-cover transition duration-500 group-hover:scale-105"
              />
              <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-slate-950/70 to-transparent p-3 sm:p-4">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="rounded-full bg-white/90 px-3 py-1 text-xs font-semibold text-slate-800">
                    {vehicle.bodyType || vehicle.segment || 'EV'}
                  </span>
                </div>
              </div>
            </Link>

            <div className="flex flex-1 flex-col p-4 md:p-5">
              <div className="flex items-start justify-between gap-3">
                <h2 className="min-w-0 text-lg font-bold leading-snug text-slate-950 md:text-xl">
                  {vehicle.displayName}
                </h2>
                {isHighlighted && (
                  <span className="shrink-0 rounded-full bg-emerald-50 px-2.5 py-1 text-xs font-bold text-emerald-800">
                    {t.comparisonPage.simpleStrongOption}
                  </span>
                )}
              </div>

              <div className="mt-4 grid flex-1 gap-3">
                <PlainComparisonPoint
                  label={t.comparisonPage.simpleRangeLabel}
                  text={t.comparisonPage.rangeFeelings[rangeKey]}
                  detail={formatNumber(vehicle.efficiency?.wltpRangeKm, 'km')}
                />
                <PlainComparisonPoint
                  label={t.comparisonPage.simpleChargingLabel}
                  text={t.comparisonPage.chargingFeelings[chargingKey]}
                  detail={formatNumber(vehicle.charging?.chargeTime10To80Min, 'min')}
                />
                <PlainComparisonPoint
                  label={t.comparisonPage.simpleCargoLabel}
                  text={t.comparisonPage.cargoFeelings[cargoKey]}
                  detail={formatNumber(vehicle.dimensions?.trunkCapacityL, 'L')}
                />
              </div>
            </div>
          </article>
        )
      })}
    </section>
  )
}

function PlainComparisonPoint({
  label,
  text,
  detail,
}: {
  label: string
  text: string
  detail: string
}) {
  return (
    <div className="rounded-lg border border-slate-200 bg-slate-50 p-3">
      <div className="grid grid-cols-[1fr_auto] items-start gap-3">
        <div className="min-w-0">
          <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">{label}</p>
          <p className="mt-1 text-sm font-bold leading-5 text-slate-950">{text}</p>
        </div>
        <p className="rounded-full bg-white px-2.5 py-1 text-sm font-semibold text-emerald-700 shadow-sm">{detail}</p>
      </div>
    </div>
  )
}

function AdvancedVehicleCards({
  vehicles,
  localizedHref,
  gridClass,
}: {
  vehicles: ComparisonVehicle[]
  localizedHref: (href: string) => string
  gridClass: string
}) {
  const t = useTranslations()

  return (
    <div className={gridClass}>
      {vehicles.map((vehicle) => (
        <Link
          key={vehicle.id}
          href={localizedHref(vehicle.detailPath ?? `/vehicles/${vehicle.id}`)}
          className="group"
        >
          <div className="overflow-hidden rounded-lg border border-slate-200 bg-white shadow-sm transition hover:border-emerald-300 hover:shadow-md">
            <div className="h-56 bg-slate-100 overflow-hidden relative">
              <SafeImage
                src={vehicle.image || VEHICLE_PLACEHOLDER_IMAGE}
                alt={vehicle.displayName}
                fill
                sizes="(max-width: 768px) 100vw, (max-width: 1280px) 50vw, 33vw"
                className="object-cover transition-transform duration-500 group-hover:scale-110"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-slate-950/35 to-transparent" />
              {vehicle.bestFor && vehicle.bestFor[0] && (
                <div className="absolute bottom-3 left-3 rounded-full bg-white px-3 py-1 text-xs font-bold text-slate-950 shadow-sm">
                  {vehicle.bestFor[0]}
                </div>
              )}
            </div>

            <div className="p-6">
              <div className="space-y-1 mb-4">
                <h3 className="text-xl font-bold text-slate-950 group-hover:text-emerald-700 transition-colors">
                  {vehicle.displayName}
                </h3>
                <p className="text-sm text-slate-500">{vehicle.segment}</p>
              </div>

              <div className="grid grid-cols-1 gap-3 text-sm sm:grid-cols-2">
                {vehicle.efficiency?.wltpRangeKm && (
                  <TechStat label={t.comparisonPage.range} value={`${Math.round(vehicle.efficiency.wltpRangeKm)} km`} />
                )}
                {comparisonPriceSummaries(vehicle).map((price) => (
                  <TechStat
                    key={`${price.kind}-${price.marketScope}-${price.modelYear ?? price.yearFrom ?? 'price'}`}
                    label={t.comparisonPage.price}
                    value={comparisonPriceValueFromSummary(price, t)}
                  />
                ))}
                {vehicle.charging?.dcChargeSpeedKw && (
                  <TechStat label={t.comparisonPage.dcChargingPower} value={`${Math.round(vehicle.charging.dcChargeSpeedKw)} kW`} />
                )}
                {vehicle.charging?.acChargeSpeedKw && (
                  <TechStat label={t.comparisonPage.acChargingPower} value={`${Math.round(vehicle.charging.acChargeSpeedKw)} kW`} />
                )}
                {vehicle.charging?.standardCharger && (
                  <TechStat label={t.comparisonPage.chargingPlug} value={vehicle.charging.standardCharger} />
                )}
                {vehicle.battery?.capacityKwh && (
                  <TechStat label={t.comparisonPage.battery} value={`${vehicle.battery.capacityKwh.toFixed(1)} kWh`} />
                )}
                {vehicle.performance?.acceleration0To100Ms && (
                  <TechStat label="0-100 km/h" value={`${vehicle.performance.acceleration0To100Ms.toFixed(1)}s`} />
                )}
              </div>
            </div>
          </div>
        </Link>
      ))}
    </div>
  )
}

function TechStat({ label, value }: { label: string; value: string }) {
  return (
    <div className="min-w-0 rounded-lg border border-slate-200 bg-slate-50 p-2">
      <p className="text-xs text-slate-400">{label}</p>
      <p className="break-words font-semibold leading-snug text-emerald-700">{value}</p>
    </div>
  )
}

function SimpleComparisonDecision({
  cheapest,
  bestRange,
  fastestCharge,
  mostSpace,
}: {
  cheapest?: { vehicle: ComparisonVehicle; value: number }
  bestRange?: { vehicle: ComparisonVehicle; value: number }
  fastestCharge?: { vehicle: ComparisonVehicle; value: number }
  mostSpace?: { vehicle: ComparisonVehicle; value: number }
}) {
  const t = useTranslations()

  const items = [
    {
      label: t.comparisonPage.simplePrice,
      helper: t.comparisonPage.simplePriceHelp,
      winner: cheapest,
      value: cheapest
        ? `${priceContextLabel(cheapest.vehicle, t)} ${formatCurrency(cheapest.value)}`
        : 'N/D',
      context: priceYearContext(cheapest?.vehicle, t),
    },
    {
      label: t.comparisonPage.simpleRange,
      helper: t.comparisonPage.simpleRangeHelp,
      winner: bestRange,
      value: bestRange ? formatNumber(bestRange.value, 'km') : 'N/D',
      context: t.comparisonPage.simpleWltpContext,
    },
    {
      label: t.comparisonPage.simpleCharging,
      helper: t.comparisonPage.simpleChargingHelp,
      winner: fastestCharge,
      value: fastestCharge ? formatNumber(fastestCharge.value, 'min') : 'N/D',
      context: t.comparisonPage.simpleDcChargeContext,
    },
    {
      label: t.comparisonPage.simpleSpace,
      helper: t.comparisonPage.simpleSpaceHelp,
      winner: mostSpace,
      value: mostSpace ? formatNumber(mostSpace.value, 'L') : 'N/D',
      context: t.comparisonPage.simpleCargoContext,
    },
  ]

  return (
    <section className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm md:p-6">
      <div className="mb-4 flex flex-col gap-2 md:mb-5 md:flex-row md:items-end md:justify-between">
        <div>
          <h2 className="text-xl font-bold tracking-tight text-slate-950 md:text-2xl">
            {t.comparisonPage.simpleDecisionTitle}
          </h2>
          <p className="mt-1 max-w-3xl text-sm leading-5 text-slate-600 md:leading-6">
            {t.comparisonPage.simpleDecisionDescription}
          </p>
        </div>
      </div>

      <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-4">
        {items.map((item) => (
          <div
            key={item.label}
            className="grid gap-3 rounded-lg border border-slate-200 bg-slate-50 p-3 transition hover:border-emerald-200 hover:bg-emerald-50/40 md:min-h-48 md:p-4"
          >
            <div>
              <p className="text-xs font-bold uppercase tracking-wide text-emerald-700">{item.label}</p>
              <p className="mt-1 hidden text-sm leading-5 text-slate-600 md:block">
              {item.helper}
              </p>
            </div>
            <div className="border-t border-slate-200 pt-3 md:mt-auto">
              <p className="break-words text-base font-bold leading-snug text-slate-950">
                {item.winner?.vehicle.displayName ?? 'N/D'}
              </p>
              <p className="mt-1 text-lg font-bold text-emerald-700 md:text-xl">
                {item.value}
              </p>
              {item.context && (
                <p className="mt-1 text-xs font-semibold text-slate-500">{item.context}</p>
              )}
            </div>
          </div>
        ))}
      </div>
    </section>
  )
}
