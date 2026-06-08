'use client'

import { useTranslations } from '@/hooks/useTranslations'
import { useLocale } from '@/context/LocaleContext'
import { VehicleDataForComparison } from '@/types/comparison'
import { buildComparisonMetrics } from '@/lib/comparison'

interface ComparisonMetricsTableProps {
  vehicles: VehicleDataForComparison[]
}

export function ComparisonMetricsTable({
  vehicles
}: ComparisonMetricsTableProps) {

  const t = useTranslations()
  const { locale } = useLocale()

  const metrics = buildComparisonMetrics(vehicles, locale)

  if (metrics.length === 0) {
    return null
  }

  // Separate primary and secondary metrics
  const primaryMetrics = metrics.filter(
    (m) => m.category === 'primary'
  )

  const secondaryMetrics = metrics.filter(
    (m) => m.category === 'secondary'
  )

  const renderMetricRow = (
    metricIndex: number,
    isPrimary: boolean
  ) => {

    const metric = isPrimary
      ? primaryMetrics[metricIndex]
      : secondaryMetrics[metricIndex]

    if (!metric) return null

    return (
      <div
        key={`${metric.label}-${isPrimary}`}
        className="border-b border-slate-200 last:border-b-0"
      >

        {/* Label */}
        <div className="flex items-center gap-4 bg-slate-50 px-4 py-4 md:px-6">

          <div className="flex-1 min-w-0">
            <h4 className="font-semibold text-slate-950">
              {metric.label}
            </h4>

            {metric.unit && (
              <p className="text-xs text-slate-500">
                {metric.unit}
              </p>
            )}
          </div>

          <div className="hidden rounded-full bg-white px-3 py-1 text-xs font-semibold text-slate-500 shadow-sm md:block">
            {isPrimary ? t.comparisonMetrics.keyMetric : t.comparisonMetrics.detailMetric}
          </div>
        </div>

        {/* Values */}
        <div
          className={`gap-4 p-4 md:p-6 bg-slate-800/10 ${
            vehicles.length === 2
              ? 'grid-cols-2'
              : 'grid-cols-3'
            } grid bg-white`}
        >
          {metric.values.map((value) => (
            <div
              key={`${metric.label}-${value.vehicleId}`}
              className={`p-3 rounded-lg border transition-all duration-200 ${
                value.isWinner
                  ? 'bg-emerald-50 border-emerald-300 shadow-sm'
                  : 'bg-slate-50 border-slate-200'
              }`}
            >

              {/* Progress Bar */}
              {value.percentageOfMax &&
                value.percentageOfMax > 0 &&
                value.percentageOfMax < 100 && (
                  <div className="mb-2 h-2 bg-slate-200 rounded-full overflow-hidden">
                    <div
                      className={`h-full transition-all duration-500 ${
                        value.isWinner
                          ? 'bg-emerald-500'
                          : 'bg-slate-400'
                      }`}
                      style={{
                        width: `${value.percentageOfMax}%`,
                      }}
                    />
                  </div>
                )}

              {/* Value */}
              <div className="flex items-baseline gap-2">

                <p
                  className={`font-bold text-lg ${
                    value.isWinner
                      ? 'text-emerald-700'
                      : 'text-slate-950'
                  }`}
                >
                  {value.displayValue}
                </p>

                {value.isWinner && (
                    <span className="text-xs text-emerald-700 font-semibold ml-auto">
                    {t.comparisonMetrics.best}
                  </span>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-12">

      {/* Primary Metrics */}
      {primaryMetrics.length > 0 && (
        <div>

          <h2 className="text-2xl font-bold mb-6 text-slate-950 flex items-center gap-2">
            {t.comparisonMetrics.keySpecifications}
          </h2>

          <div className="overflow-hidden rounded-lg border border-slate-200 bg-white shadow-sm">
            {primaryMetrics.map((_, index) =>
              renderMetricRow(index, true)
            )}
          </div>
        </div>
      )}

      {/* Secondary Metrics */}
      {secondaryMetrics.length > 0 && (
        <div>

          <h2 className="text-2xl font-bold mb-6 text-slate-950 flex items-center gap-2">
            {t.comparisonMetrics.additionalDetails}
          </h2>

          <div className="overflow-hidden rounded-lg border border-slate-200 bg-white shadow-sm">
            {secondaryMetrics.map((_, index) =>
              renderMetricRow(index, false)
            )}
          </div>
        </div>
      )}
    </div>
  )
}
