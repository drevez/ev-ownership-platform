'use client'

import { formatDimension, formatLiters } from '@/lib/formatters'
import { useTranslations } from '@/hooks/useTranslations'

interface DimensionsData {
  cargoLitersSeatsUp?: number | null
  cargoLitersSeatsDown?: number | null
  frunkLiters?: number | null
  rearLegroomMM?: number | null
  wheelbaseMM?: number | null
  lengthMM?: number | null
  widthMM?: number | null
  heightMM?: number | null
  [key: string]: unknown
}

interface DimensionsCardProps {
  dimensions?: DimensionsData
}

interface DimensionItemProps {
  label: string
  value: number | null | undefined
  format: (val: number | undefined) => string
  icon: string
}

function DimensionItem({
  label,
  value,
  format,
  icon,
}: DimensionItemProps) {

  if (value == null) {
    return null
  }

  return (
    <div className="bg-slate-50 rounded-xl p-5 border-2 border-slate-200 hover:border-slate-300 transition-colors">

      <div className="flex items-center gap-3 mb-3">
        <span className="text-2xl">{icon}</span>
        <p className="text-sm font-semibold text-slate-900">
          {label}
        </p>
      </div>

      <p className="text-2xl font-bold text-slate-900">
        {format(value)}
      </p>
    </div>
  )
}

export function DimensionsCard({
  dimensions = {},
}: DimensionsCardProps) {

  const t = useTranslations()

  const hasData = Object.values(dimensions).some(
    (v) => v != null
  )

  if (!hasData) {
    return null
  }

  return (
    <div className="bg-white rounded-lg shadow-md p-6 md:p-8">

      <h2 className="text-2xl md:text-3xl font-bold text-slate-900 mb-8">
        {t.dimensions.title}
      </h2>

      {/* Exterior Dimensions */}
      {(dimensions.lengthMM ||
        dimensions.widthMM ||
        dimensions.heightMM ||
        dimensions.wheelbaseMM) && (
        <div className="mb-8">

          <h3 className="text-lg font-semibold text-slate-900 mb-4 flex items-center gap-2">
            <span className="text-2xl">📏</span>
            {t.dimensions.exteriorDimensions}
          </h3>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">

            <DimensionItem
              label={t.dimensions.length}
              value={dimensions.lengthMM}
              format={(v) => formatDimension(v, true)}
              icon="→"
            />

            <DimensionItem
              label={t.dimensions.width}
              value={dimensions.widthMM}
              format={(v) => formatDimension(v, true)}
              icon="↔️"
            />

            <DimensionItem
              label={t.dimensions.height}
              value={dimensions.heightMM}
              format={(v) => formatDimension(v, true)}
              icon="↑"
            />

            <DimensionItem
              label={t.dimensions.wheelbase}
              value={dimensions.wheelbaseMM}
              format={(v) => formatDimension(v, true)}
              icon="🛞"
            />
          </div>
        </div>
      )}

      {/* Storage */}
      {(dimensions.cargoLitersSeatsUp ||
        dimensions.cargoLitersSeatsDown ||
        dimensions.frunkLiters) && (
        <div className="mb-8">

          <h3 className="text-lg font-semibold text-slate-900 mb-4 flex items-center gap-2">
            <span className="text-2xl">📦</span>
            {t.dimensions.storageAndSpace}
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">

            <DimensionItem
              label={t.dimensions.trunkSeatsUp}
              value={dimensions.cargoLitersSeatsUp}
              format={formatLiters}
              icon="🚗"
            />

            <DimensionItem
              label={t.dimensions.trunkSeatsDown}
              value={dimensions.cargoLitersSeatsDown}
              format={formatLiters}
              icon="📦"
            />

            <DimensionItem
              label={t.dimensions.frunk}
              value={dimensions.frunkLiters}
              format={formatLiters}
              icon="🔓"
            />
          </div>
        </div>
      )}

      {/* Comfort */}
      {dimensions.rearLegroomMM && (
        <div className="mb-8">

          <h3 className="text-lg font-semibold text-slate-900 mb-4 flex items-center gap-2">
            <span className="text-2xl">💺</span>
            {t.dimensions.comfort}
          </h3>

          <div className="bg-gradient-to-r from-green-50 to-emerald-50 rounded-xl p-6 border-2 border-green-200">

            <p className="text-sm font-semibold text-slate-900 mb-2">
              {t.dimensions.rearLegroom}
            </p>

            <p className="text-3xl font-bold text-green-900">
              {formatDimension(dimensions.rearLegroomMM, true)}
            </p>

            <p className="text-xs text-slate-600 mt-2">
              {t.dimensions.rearPassengers}
            </p>
          </div>
        </div>
      )}

      {/* Summary */}
      {dimensions.lengthMM &&
        dimensions.widthMM &&
        dimensions.cargoLitersSeatsUp && (
          <div className="mt-8 pt-8 border-t border-slate-200">

            <div className="bg-slate-50 rounded-xl p-6 border-2 border-slate-200">

              <p className="text-sm font-semibold text-slate-900 mb-3">
                📐 {t.dimensions.summary}
              </p>

              <div className="space-y-2 text-slate-700">

                <p>
                  {t.dimensions.overallSize}{' '}
                  <span className="font-bold">
                    {formatDimension(dimensions.lengthMM, true)}{' '}
                    {t.dimensions.long}
                  </span>{' '}
                  ×{' '}
                  <span className="font-bold">
                    {formatDimension(dimensions.widthMM, true)}{' '}
                    {t.dimensions.wide}
                  </span>
                </p>

                <p>
                  {t.dimensions.cargoSpace}{' '}
                  <span className="font-bold">
                    {formatLiters(dimensions.cargoLitersSeatsUp)}
                  </span>{' '}
                  {t.dimensions.seatsUp}
                  {dimensions.cargoLitersSeatsDown && (
                    <>
                      ,{' '}
                      <span className="font-bold">
                        {formatLiters(
                          dimensions.cargoLitersSeatsDown
                        )}
                      </span>{' '}
                      {t.dimensions.seatsDown}
                    </>
                  )}
                </p>
              </div>
            </div>
          </div>
        )}
    </div>
  )
}
