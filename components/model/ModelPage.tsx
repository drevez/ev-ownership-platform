'use client'

import Link from 'next/link'
import { SafeImage as Image } from '@/components/SafeImage'
import type { ModelPageData } from '@/types/model'
import { useTranslations } from '@/hooks/useTranslations'
import { useLocalizedHref } from '@/hooks/useLocalizedHref'
import type { VehiclePriceSummary } from '@/lib/normalizeVehicle'

interface ModelPageProps {
  model: ModelPageData
}

function formatPrice(eur?: number): string {
  if (eur == null) return '—'
  return `${eur.toLocaleString('pt-PT')} €`
}

function formatText(template: string, values: Record<string, string | number>): string {
  return Object.entries(values).reduce(
    (text, [key, value]) => text.replace(`{${key}}`, String(value)),
    template
  )
}

function getPriceKindLabel(
  price: VehiclePriceSummary | undefined,
  t: ReturnType<typeof useTranslations>
): string {
  if (!price) return t.modelsExplorer.price.noConfirmedPrice
  if (price.status === 'not_sold_new') return t.modelsExplorer.price.kind.referenceNew
  if (price.kind === 'used') return t.modelsExplorer.price.kind.used
  if (price.kind === 'importedUsed') return t.modelsExplorer.price.kind.importedUsed
  return t.modelsExplorer.price.kind.new
}

function getPriceContext(
  price: VehiclePriceSummary | undefined,
  t: ReturnType<typeof useTranslations>
): string | null {
  if (!price) return null

  const details = [price.market.toUpperCase()]

  if (price.modelYear != null) {
    details.push(formatText(t.modelsExplorer.price.modelYear, { year: price.modelYear }))
  } else if (price.yearFrom != null || price.yearTo != null) {
    details.push(
      formatText(t.modelsExplorer.price.years, {
        years: [price.yearFrom, price.yearTo].filter(Boolean).join('-'),
      })
    )
  }

  if (price.updatedAt) {
    details.push(formatText(t.modelsExplorer.price.updated, { date: price.updatedAt }))
  }

  if (price.sourceLabel) {
    details.push(price.sourceLabel)
  }

  if (price.confidence === 'low') {
    details.push(`${t.pricing.confidence}: ${t.pricing.confidenceValues.low}`)
  } else if (price.confidence === 'unknown') {
    details.push(`${t.pricing.confidence}: ${t.pricing.confidenceValues.unknown}`)
  }

  if (price.isLegacy) {
    details.push(t.modelsExplorer.price.legacy)
  }

  if (price.kind === 'importedUsed' && price.estimatedPortugalCostsIncluded === false) {
    details.push(t.modelsExplorer.price.importCostsNotIncluded)
  }

  return details.join(' · ')
}

export function ModelPage({ model }: ModelPageProps) {
  const t = useTranslations()
  const localizedHref = useLocalizedHref()
  const compareHref =
    model.variants.length >= 2
      ? `/compare?${model.variants.map((v) => `ids=${encodeURIComponent(v.id)}`).join('&')}`
      : null

  return (
    <main className="bg-slate-50 min-h-screen">
      <div className="relative w-full bg-slate-900 overflow-hidden">
        <div className="relative w-full pt-[45%] min-h-[280px] bg-gradient-to-br from-slate-900 to-slate-800">
          <Image
            src={model.heroImage}
            alt={model.displayName}
            fill
            className="object-cover opacity-90"
            sizes="100vw"
            priority
          />
          <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-900/50 to-transparent" />

          <div className="absolute inset-0 flex flex-col justify-end p-6 md:p-10 lg:p-12">
            <div className="max-w-7xl mx-auto w-full">
              <nav className="text-sm text-slate-400 mb-4 flex items-center gap-2">
                <Link href={localizedHref('/')} className="hover:text-white transition">
                  {t.modelPage.home}
                </Link>
                <span>/</span>
                <span className="text-slate-300">{model.displayName}</span>
              </nav>

              <p className="text-emerald-400 text-sm font-medium uppercase tracking-wider mb-2">
                {model.brand}
              </p>
              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-white mb-6">
                {model.model}
              </h1>
              <div className="flex flex-wrap gap-2">
                <Badge label={model.segment} />
                <Badge label={model.bodyType} />
                <span className="inline-block bg-white/15 text-white px-4 py-2 rounded-full text-sm font-semibold border border-white/20">
                  {model.variants.length}{' '}
                  {model.variants.length === 1 ? t.modelPage.version : t.modelPage.versions}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-12">
        <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4 mb-8">
          <div>
            <h2 className="text-2xl font-bold text-slate-900">{t.modelPage.availableVersions}</h2>
            <p className="text-slate-600 mt-1">
              {t.modelPage.availableVersionsSubtitle}
            </p>
          </div>
          {compareHref && (
            <Link
              href={localizedHref(compareHref)}
              className="inline-flex justify-center px-6 py-3 rounded-xl font-semibold bg-emerald-500 text-white hover:bg-emerald-600 transition shrink-0"
            >
              {t.modelPage.compareAll}
            </Link>
          )}
        </div>

        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {model.variants.map((variant) => (
            <Link
              key={variant.id}
              href={localizedHref(`/vehicles/${variant.id}`)}
              className="group overflow-hidden rounded-2xl bg-white border border-slate-200 shadow-sm hover:border-emerald-500 hover:shadow-md transition"
            >
              <div className="relative aspect-[16/10] bg-slate-100">
                <Image
                  src={variant.image}
                  alt={variant.displayName}
                  fill
                  className="object-cover group-hover:scale-105 transition duration-500"
                  sizes="(max-width: 768px) 100vw, 33vw"
                />
              </div>

              <div className="p-6">
                <p className="text-emerald-600 text-sm font-medium mb-1">
                  {variant.variant}
                </p>
                <h3 className="text-xl font-bold text-slate-900 mb-4">
                  {variant.displayName}
                </h3>

                <dl className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <dt className="text-slate-500 mb-1">{t.modelPage.range}</dt>
                    <dd className="font-semibold text-slate-900">
                      {variant.wltpRangeKm != null
                        ? `${variant.wltpRangeKm} km`
                        : '—'}
                    </dd>
                  </div>
                  <div>
                    <dt className="text-slate-500 mb-1">{t.modelPage.charging}</dt>
                    <dd className="font-semibold text-slate-900">
                      {variant.dcChargeKw != null
                        ? `${variant.dcChargeKw} kW`
                        : '—'}
                    </dd>
                  </div>
                  <div className="col-span-2">
                    <dt className="text-slate-500 mb-1">
                      {getPriceKindLabel(variant.primaryPrice, t)}
                    </dt>
                    <dd className="font-semibold text-slate-900">
                      {formatPrice(variant.priceFromEur)}
                    </dd>
                    {getPriceContext(variant.primaryPrice, t) && (
                      <dd className="mt-1 text-xs text-slate-500">
                        {getPriceContext(variant.primaryPrice, t)}
                      </dd>
                    )}
                  </div>
                </dl>

                <span className="mt-6 inline-flex w-full justify-center py-3 rounded-xl bg-slate-900 text-white font-semibold group-hover:bg-emerald-600 transition">
                  {t.modelPage.viewSpecs}
                </span>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </main>
  )
}

function Badge({ label }: { label: string }) {
  return (
    <span className="inline-block bg-white/15 text-white px-4 py-2 rounded-full text-sm font-semibold border border-white/20">
      {label}
    </span>
  )
}
