'use client'

import { formatPrice } from '@/lib/formatters'
import { useTranslations } from '@/hooks/useTranslations'
import {
  getVehiclePriceSummaries,
  type VehiclePriceSummary,
} from '@/lib/normalizeVehicle'
import type { VehiclePricing } from '@/lib/loadVehicle'

interface PricingCardProps {
  pricing?: VehiclePricing
}

function PriceRange({
  label,
  data,
  currency,
  isHighlight,
}: {
  label: string
  data?: { min?: number; max?: number }
  currency?: string
  isHighlight?: boolean
}) {

  const t = useTranslations()

  if (!data || !data.min) return null

  const minPrice = formatPrice(data.min, currency)
  const maxPrice = data.max
    ? formatPrice(data.max, currency)
    : null

  return (
    <div
      className={`rounded-xl p-6 border-2 transition-all ${
        isHighlight
          ? 'bg-gradient-to-br from-blue-50 to-cyan-50 border-blue-200 shadow-lg'
          : 'bg-slate-50 border-slate-200 hover:border-slate-300'
      }`}
    >

      <p
        className={`text-sm font-semibold mb-3 ${
          isHighlight
            ? 'text-blue-900'
            : 'text-slate-600'
        }`}
      >
        {label}
      </p>

      <div className="space-y-1">

        <p
          className={`text-3xl font-bold ${
            isHighlight
              ? 'text-blue-900'
              : 'text-slate-900'
          }`}
        >
          {minPrice}
        </p>

        {maxPrice && (
          <p className="text-sm text-slate-600">
            {t.pricing.to} {maxPrice}
          </p>
        )}

      </div>

    </div>
  )
}

function getPriceLabel(
  price: VehiclePriceSummary,
  t: ReturnType<typeof useTranslations>
): string {
  if (price.status === 'not_sold_new') return t.modelsExplorer.price.kind.referenceNew
  if (price.kind === 'importedUsed') return t.modelsExplorer.price.kind.importedUsed
  if (price.kind === 'used') return t.modelsExplorer.price.kind.used
  return t.modelsExplorer.price.kind.new
}

function getConfidenceClass(confidence?: string) {
  if (confidence === 'high') return 'border-emerald-200 bg-emerald-50 text-emerald-700'
  if (confidence === 'medium') return 'border-sky-200 bg-sky-50 text-sky-700'
  if (confidence === 'low') return 'border-amber-200 bg-amber-50 text-amber-800'
  return 'border-slate-200 bg-slate-100 text-slate-600'
}

function getConfidenceLabel(
  confidence: string | undefined,
  t: ReturnType<typeof useTranslations>
) {
  if (confidence === 'high') return t.pricing.confidenceValues.high
  if (confidence === 'medium') return t.pricing.confidenceValues.medium
  if (confidence === 'low') return t.pricing.confidenceValues.low
  return t.pricing.confidenceValues.unknown
}

function getSourceTypeLabel(
  sourceType: string | undefined,
  t: ReturnType<typeof useTranslations>
) {
  if (sourceType === 'official_brand') return t.pricing.sourceTypes.official_brand
  if (sourceType === 'dealer') return t.pricing.sourceTypes.dealer
  if (sourceType === 'classifieds') return t.pricing.sourceTypes.classifieds
  if (sourceType === 'market_estimate') return t.pricing.sourceTypes.market_estimate
  if (sourceType === 'manual') return t.pricing.sourceTypes.manual
  return t.pricing.sourceTypes.unknown
}

function getPriceContext(
  offer: VehiclePriceSummary,
  t: ReturnType<typeof useTranslations>
) {
  if (offer.modelYear != null) {
    return t.modelsExplorer.price.modelYear.replace('{year}', String(offer.modelYear))
  }
  if (offer.yearFrom != null || offer.yearTo != null) {
    return t.modelsExplorer.price.years.replace(
      '{years}',
      [offer.yearFrom, offer.yearTo].filter(Boolean).join('-')
    )
  }
  return null
}

function DetailRow({
  label,
  value,
  href,
}: {
  label: string
  value?: string | null
  href?: string
}) {
  if (!value) return null

  return (
    <div className="flex items-start justify-between gap-4 border-t border-slate-200 pt-3 text-sm">
      <span className="text-slate-500">{label}</span>
      {href ? (
        <a
          href={href}
          target="_blank"
          rel="noreferrer"
          className="text-right font-medium text-emerald-700 underline-offset-4 hover:underline"
        >
          {value}
        </a>
      ) : (
        <span className="text-right font-medium text-slate-800">{value}</span>
      )}
    </div>
  )
}

function PriceOfferCard({
  offer,
  isHighlight,
}: {
  offer: VehiclePriceSummary
  isHighlight?: boolean
}) {
  const t = useTranslations()
  const maxPrice = offer.priceTo ? formatPrice(offer.priceTo, offer.currency) : null
  const sourceTypeLabel = getSourceTypeLabel(offer.sourceType, t)
  const sourceLabel =
    offer.sourceType === 'official_brand' || offer.sourceType === 'dealer'
      ? offer.sourceLabel || sourceTypeLabel
      : sourceTypeLabel
  const context = getPriceContext(offer, t)

  return (
    <div
      className={`rounded-lg p-5 border transition-all ${
        isHighlight
          ? 'bg-white border-emerald-300 shadow-sm'
          : 'bg-slate-50 border-slate-200 hover:border-slate-300'
      }`}
    >
      <div className="mb-4 flex items-start justify-between gap-3">
        <p className="text-sm font-semibold text-slate-700">
          {getPriceLabel(offer, t)}
        </p>
        <span
          className={`shrink-0 rounded-full border px-2 py-1 text-xs font-semibold ${getConfidenceClass(offer.confidence)}`}
        >
          {getConfidenceLabel(offer.confidence, t)}
        </span>
      </div>

      <div className="space-y-4">
        <p
          className={`text-3xl font-bold tracking-tight ${
            isHighlight
              ? 'text-slate-950'
              : 'text-slate-900'
          }`}
        >
          {formatPrice(offer.priceFrom, offer.currency)}
        </p>

        {maxPrice && (
          <p className="text-sm text-slate-600">
            {t.pricing.to} {maxPrice}
          </p>
        )}

        <div className="space-y-3">
          <DetailRow
            label={t.pricing.source}
            value={sourceLabel || t.pricing.sourceNotSet}
            href={offer.sourceUrl}
          />
          <DetailRow
            label={t.pricing.date}
            value={offer.updatedAt}
          />
          <DetailRow
            label={t.pricing.context}
            value={context}
          />
          <DetailRow
            label={t.pricing.confidence}
            value={getConfidenceLabel(offer.confidence, t)}
          />
          {offer.isLegacy && (
            <DetailRow
              label={t.pricing.priceNote}
              value={t.modelsExplorer.price.legacy}
            />
          )}
          {offer.estimatedPortugalCostsIncluded === false && (
            <DetailRow
              label={t.pricing.priceNote}
              value={t.modelsExplorer.price.importCostsNotIncluded}
            />
          )}
        </div>

        {offer.confidence === 'low' && (
          <p className="rounded-md border border-amber-200 bg-amber-50 px-3 py-2 text-xs leading-5 text-amber-900">
            {t.pricing.sourceTypes.market_estimate}
          </p>
        )}
      </div>
    </div>
  )
}

export function PricingCard({
  pricing = {},
}: PricingCardProps) {

  const t = useTranslations()

  const offers = getVehiclePriceSummaries(pricing)

  if (offers.length > 0) {
    return (
      <div className="bg-white rounded-lg shadow-md p-6 md:p-8">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-8 gap-4">
          <div>
            <h2 className="text-2xl md:text-3xl font-bold text-slate-900">
              {t.pricing.title}
            </h2>

            <p className="text-sm text-slate-500 mt-1">
              {t.pricing.marketPrices}
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {offers.map((offer, index) => (
            <PriceOfferCard
              key={`${offer.kind}-${offer.marketScope}-${offer.label}-${index}`}
              offer={offer}
              isHighlight={index === 0}
            />
          ))}
        </div>
      </div>
    )
  }

  const ptPricing = pricing.pt

  if (!ptPricing || !ptPricing.consumerPrice) {
    return null
  }

  const currency = ptPricing.currency || 'EUR'

  const consumerMin = ptPricing.consumerPrice?.min
  const consumerMax = ptPricing.consumerPrice?.max

  const usedMin = ptPricing.usedPrice?.min
  const usedMax = ptPricing.usedPrice?.max

  const hasSavings =
    typeof consumerMin === 'number' &&
    typeof consumerMax === 'number' &&
    typeof usedMin === 'number' &&
    typeof usedMax === 'number' &&
    consumerMin > 0 &&
    consumerMax > 0

  return (
    <div className="bg-white rounded-lg shadow-md p-6 md:p-8">

      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-8 gap-4">

        <div>
          <h2 className="text-2xl md:text-3xl font-bold text-slate-900">
            {t.pricing.title}
          </h2>

          <p className="text-sm text-slate-500 mt-1">
            {t.pricing.marketPrices}
          </p>
        </div>

        {ptPricing.updatedAt && (
          <div className="inline-flex items-center gap-2 bg-slate-100 rounded-lg px-3 py-2">

            <span className="text-xs font-medium text-slate-600">
              {t.pricing.updated}
            </span>

            <span className="text-xs font-semibold text-slate-900">
              {ptPricing.updatedAt}
            </span>

          </div>
        )}

      </div>

      {/* Main pricing cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">

        <PriceRange
          label={t.pricing.consumerPrice}
          data={ptPricing.consumerPrice}
          currency={currency}
          isHighlight={true}
        />

        <PriceRange
          label={t.pricing.businessPrice}
          data={ptPricing.businessPriceExVat}
          currency={currency}
        />

        <PriceRange
          label={t.pricing.usedVehicle}
          data={ptPricing.usedPrice}
          currency={currency}
        />

      </div>

      {/* Footer info */}
      {hasSavings && (
        <div className="mt-6 pt-6 border-t border-slate-200">

          <div className="bg-blue-50 rounded-lg p-4 border border-blue-200">

            <p className="text-sm text-slate-700">

              <span className="font-semibold text-slate-900">
                {t.pricing.expectedSavings}
              </span>{' '}

              {t.pricing.usedSavingsText}{' '}

              {Math.round(
                ((consumerMin - usedMax) / consumerMin) * 100
              )}% {t.pricing.to}{' '}

              {Math.round(
                ((consumerMax - usedMin) / consumerMax) * 100
              )}% {t.pricing.overNew}

            </p>

          </div>

        </div>
      )}

    </div>
  )
}
