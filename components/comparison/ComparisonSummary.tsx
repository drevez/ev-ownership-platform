'use client'

import { useTranslations } from '@/hooks/useTranslations'
import { useLocale } from '@/context/LocaleContext'
import { ComparisonVehicle } from '@/types/comparison'
import { generateComparisonSummary } from '@/lib/comparison'

interface ComparisonSummaryProps {
  vehicles: ComparisonVehicle[]
  gridClass: string
}

export function ComparisonSummary({
  vehicles,
  gridClass,
}: ComparisonSummaryProps) {

  const t = useTranslations()
  const { locale } = useLocale()

  const summary = generateComparisonSummary(vehicles, locale)
  const priceLabel = (vehicle: ComparisonVehicle) => {
    const price = vehicle.pricing?.primaryPrice
    if (price?.status === 'not_sold_new') return t.modelsExplorer.price.kind.referenceNew
    if (price?.kind === 'importedUsed') return t.modelsExplorer.price.kind.importedUsed
    if (price?.kind === 'used') return t.modelsExplorer.price.kind.used
    return t.modelsExplorer.price.kind.new
  }

  const summaryItems = [
    {
      label: t.comparisonSummary.bestValue,
      value: summary.bestValue,
      tone: 'emerald'
    },
    {
      label: t.comparisonSummary.bestRange,
      value: summary.bestRange,
      tone: 'sky'
    },
    {
      label: t.comparisonSummary.fastestCharging,
      value: summary.fastestCharging,
      tone: 'amber'
    },
    {
      label: t.comparisonSummary.mostEfficient,
      value: summary.mostEfficient,
      tone: 'violet'
    }
  ]

  return (
    <section className="space-y-8">

      {/* Summary Grid */}
      <div className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm md:p-6">

        <h2 className="mb-5 text-2xl font-bold tracking-tight text-slate-950">
          {t.comparisonSummary.title}
        </h2>

        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">

          {summaryItems.map((item) => (
            <div
              key={item.label}
              className={`rounded-lg border p-4 ${summaryToneClass(item.tone)}`}
            >
              <p className="text-xs mb-2 uppercase font-semibold tracking-wider opacity-75">
                {item.label}
              </p>

              <p className="text-lg font-bold">
                {item.value}
              </p>
            </div>
          ))}
        </div>
      </div>

      {/* Recommendation Card */}
      <div className="rounded-lg border border-emerald-200 bg-emerald-50 p-5 md:p-6">
        <div className="max-w-5xl">
            <h3 className="text-sm font-bold uppercase tracking-wide text-emerald-800">
              {t.comparisonSummary.recommendation}
            </h3>

            <p className="mt-2 text-base font-medium leading-7 text-slate-800">
              {summary.recommendation}
            </p>
        </div>
      </div>

      {/* Detailed Summary */}
      <div className={gridClass}>

        {vehicles.map((vehicle) => (
          <div
            key={vehicle.id}
            className="flex h-full flex-col rounded-lg border border-slate-200 bg-white p-5 shadow-sm"
          >

            <h3 className="min-h-12 text-base font-bold leading-snug text-slate-950">
              {vehicle.displayName}
            </h3>

            {vehicle.bestFor && vehicle.bestFor.length > 0 && (
              <div className="mt-4">

                <h4 className="text-sm font-semibold text-slate-500 mb-3 uppercase tracking-wider">
                  {t.comparisonSummary.bestFor}
                </h4>

                <ul className="space-y-2">

                  {vehicle.bestFor.map((item, idx) => (
                    <li
                      key={idx}
                      className="flex items-center gap-2 text-slate-700"
                    >
                      <span className="text-emerald-600">
                        ✓
                      </span>

                      {item}
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Key Stats */}
            {(vehicle.pricing?.basePriceEur ||
              vehicle.efficiency?.wltpRangeKm) && (
              <div className="mt-auto pt-6">
                <div className="border-t border-slate-200 pt-5">

                <h4 className="text-sm font-semibold text-slate-500 mb-3 uppercase tracking-wider">
                  {t.comparisonSummary.keyHighlights}
                </h4>

                <div className="space-y-2 text-sm">

                  {vehicle.pricing?.basePriceEur && (
                    <div className="flex min-w-0 flex-wrap justify-between gap-2">

                      <span className="min-w-0 text-slate-600">
                        {priceLabel(vehicle)}
                      </span>

                      <span className="shrink-0 font-semibold text-emerald-700">
                        {Math.round(vehicle.pricing.basePriceEur).toLocaleString(locale)} €
                      </span>
                    </div>
                  )}

                  {vehicle.efficiency?.wltpRangeKm && (
                    <div className="flex min-w-0 flex-wrap justify-between gap-2">

                      <span className="min-w-0 text-slate-600">
                        {t.comparisonSummary.wltpRange}
                      </span>

                      <span className="shrink-0 font-semibold text-emerald-700">
                        {Math.round(
                          vehicle.efficiency.wltpRangeKm
                        )}{' '}
                        km
                      </span>
                    </div>
                  )}

                  {vehicle.battery?.capacityKwh && (
                    <div className="flex min-w-0 flex-wrap justify-between gap-2">

                      <span className="min-w-0 text-slate-600">
                        {t.comparisonSummary.battery}
                      </span>

                      <span className="shrink-0 font-semibold text-emerald-700">
                        {vehicle.battery.capacityKwh.toFixed(1)}{' '}
                        kWh
                      </span>
                    </div>
                  )}
                </div>
                </div>
              </div>
            )}
          </div>
        ))}
      </div>
    </section>
  )
}

function summaryToneClass(tone: string) {
  const tones: Record<string, string> = {
    emerald: 'border-emerald-200 bg-emerald-50 text-emerald-950',
    sky: 'border-sky-200 bg-sky-50 text-sky-950',
    amber: 'border-amber-200 bg-amber-50 text-amber-950',
    violet: 'border-violet-200 bg-violet-50 text-violet-950',
  }

  return tones[tone] ?? 'border-slate-200 bg-slate-50 text-slate-950'
}
