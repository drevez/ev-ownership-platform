'use client'

import {
  formatKm,
  formatConsumption,
  formatEfficiency,
} from '@/lib/formatters'
import { useTranslations } from '@/hooks/useTranslations'

interface EfficiencyData {
  wltpRangeKm?: number
  estimatedRealRangeKm?: number
  motorwayRangeKm?: number
  realWorldConsumptionWhKm?: number
  realMotorwayConsumptionWhKm?: number
  [key: string]: unknown
}

interface EfficiencyCardProps {
  efficiency?: EfficiencyData
}

interface RangeMetricProps {
  label: string
  value: number | undefined
  context?: string
  icon: string
}

function RangeMetric({
  label,
  value,
  icon,
  context,
}: RangeMetricProps) {

  if (value === undefined) {
    return null
  }

  return (
    <div className="bg-gradient-to-br from-blue-50 to-cyan-50 rounded-xl p-5 border-2 border-blue-200 hover:shadow-md transition-shadow">

      <div className="flex items-start justify-between mb-3">

        <div className="flex-1">
          <p className="text-sm font-semibold text-slate-900">
            {label}
          </p>

          {context && (
            <p className="text-xs text-slate-500 mt-1">
              {context}
            </p>
          )}
        </div>

        <span className="text-2xl ml-2">
          {icon}
        </span>

      </div>

      <p className="text-2xl font-bold text-blue-900">
        {formatKm(value)}
      </p>

    </div>
  )
}

function ConsumptionMetric({
  label,
  value,
  icon,
  context,
}: {
  label: string
  value: number | undefined
  icon: string
  context?: string
}) {

  if (value === undefined) {
    return null
  }

  return (
    <div className="bg-gradient-to-br from-amber-50 to-orange-50 rounded-xl p-5 border-2 border-amber-200 hover:shadow-md transition-shadow">

      <div className="flex items-start justify-between mb-3">

        <div className="flex-1">
          <p className="text-sm font-semibold text-slate-900">
            {label}
          </p>

          {context && (
            <p className="text-xs text-slate-500 mt-1">
              {context}
            </p>
          )}
        </div>

        <span className="text-2xl ml-2">
          {icon}
        </span>

      </div>

      <p className="text-2xl font-bold text-amber-900">
        {formatConsumption(value)}
      </p>

    </div>
  )
}

export function EfficiencyCard({
  efficiency = {},
}: EfficiencyCardProps) {

  const t = useTranslations()

  const hasData = Object.values(efficiency).some(
    (v) => v !== undefined
  )

  if (!hasData) {
    return null
  }

  return (
    <div className="bg-white rounded-lg shadow-md p-6 md:p-8">

      <h2 className="text-2xl md:text-3xl font-bold text-slate-900 mb-8">
        {t.efficiency.title}
      </h2>

      {/* Range */}
      {(efficiency.wltpRangeKm ||
        efficiency.estimatedRealRangeKm ||
        efficiency.motorwayRangeKm) && (
        <div className="mb-8">

          <h3 className="text-lg font-semibold text-slate-900 mb-4 flex items-center gap-2">
            <span className="text-2xl">🛣️</span>
            {t.efficiency.range}
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">

            <RangeMetric
              label={t.efficiency.wltpRange}
              value={efficiency.wltpRangeKm}
              icon="📋"
              context={t.efficiency.wltpContext}
            />

            <RangeMetric
              label={t.efficiency.realWorldRange}
              value={efficiency.estimatedRealRangeKm}
              icon="🗺️"
              context={t.efficiency.realWorldContext}
            />

            <RangeMetric
              label={t.efficiency.motorwayRange}
              value={efficiency.motorwayRangeKm}
              icon="🛣️"
              context={t.efficiency.motorwayContext}
            />

          </div>
        </div>
      )}

      {/* Consumption */}
      {(efficiency.realWorldConsumptionWhKm ||
        efficiency.realMotorwayConsumptionWhKm) && (
        <div className="mb-8">

          <h3 className="text-lg font-semibold text-slate-900 mb-4 flex items-center gap-2">
            <span className="text-2xl">⚡</span>
            {t.efficiency.energyConsumption}
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">

            <ConsumptionMetric
              label={t.efficiency.realWorldConsumption}
              value={efficiency.realWorldConsumptionWhKm}
              icon="🚗"
              context={t.efficiency.realWorldConsumptionContext}
            />

            <ConsumptionMetric
              label={t.efficiency.motorwayConsumption}
              value={efficiency.realMotorwayConsumptionWhKm}
              icon="🛣️"
              context={t.efficiency.motorwayConsumptionContext}
            />

          </div>
        </div>
      )}

      {/* Summary */}
      {efficiency.wltpRangeKm &&
        efficiency.realWorldConsumptionWhKm && (
          <div className="mt-8 pt-8 border-t border-slate-200">

            <div className="bg-gradient-to-r from-blue-50 to-cyan-50 rounded-xl p-6 border-2 border-blue-200">

              <p className="text-sm font-semibold text-slate-900 mb-3">
                💡 {t.efficiency.summary}
              </p>

              <div className="space-y-3">

                <p className="text-slate-700">
                  {t.efficiency.summaryText}{' '}
                  <span className="font-bold text-blue-900">
                    {formatEfficiency(
                      efficiency.realWorldConsumptionWhKm
                    )}
                  </span>{' '}
                  {t.efficiency.summaryEfficiency}
                </p>

                {efficiency.motorwayRangeKm && (
                  <p className="text-slate-700">
                    {t.efficiency.motorwaySummary}{' '}
                    <span className="font-bold text-blue-900">
                      {formatKm(efficiency.motorwayRangeKm)}
                    </span>.
                  </p>
                )}

              </div>

            </div>

          </div>
        )}
    </div>
  )
}
