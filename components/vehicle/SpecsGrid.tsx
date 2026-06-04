'use client'

import type { VehicleDimensions } from '@/lib/loadVehicle'
import {
  getVehicleHeightMm,
  getVehicleLengthMm,
  getVehicleWheelbaseMm,
  getVehicleWidthMm,
} from '@/lib/normalizeVehicle'
import { useTranslations } from '@/hooks/useTranslations'

interface SpecsGridProps {
  brand: string
  model: string
  variant?: string
  modelYear?: number
  doors?: number
  seats?: number
  dimensions?: VehicleDimensions
}

export function SpecsGrid({
  brand,
  model,
  variant,
  modelYear,
  doors,
  seats,
  dimensions = {}
}: SpecsGridProps) {

  const t = useTranslations()
  const lengthMm = getVehicleLengthMm(dimensions)
  const widthMm = getVehicleWidthMm(dimensions)
  const heightMm = getVehicleHeightMm(dimensions)
  const wheelbaseMm = getVehicleWheelbaseMm(dimensions)

  const specs = [
    {
      label: t.specsGrid.brand,
      value: brand,
      icon: '🏢'
    },
    {
      label: t.specsGrid.model,
      value: model,
      icon: '🚗'
    },
    {
      label: t.specsGrid.variant,
      value: variant || t.common.notAvailable,
      icon: '⭐'
    },
    {
      label: t.specsGrid.modelYear,
      value: modelYear || t.common.notAvailable,
      icon: '📅'
    },

    ...(doors
      ? [{
          label: t.specsGrid.doors,
          value: doors,
          icon: '🚪'
        }]
      : []),

    ...(seats
      ? [{
          label: t.specsGrid.seats,
          value: seats,
          icon: '💺'
        }]
      : []),

    ...(lengthMm
      ? [{
          label: t.specsGrid.length,
          value: `${lengthMm} mm`,
          icon: '📏'
        }]
      : []),

    ...(widthMm
      ? [{
          label: t.specsGrid.width,
          value: `${widthMm} mm`,
          icon: '↔️'
        }]
      : []),

    ...(heightMm
      ? [{
          label: t.specsGrid.height,
          value: `${heightMm} mm`,
          icon: '📐'
        }]
      : []),

    ...(wheelbaseMm
      ? [{
          label: t.specsGrid.wheelbase,
          value: `${wheelbaseMm} mm`,
          icon: '🛞'
        }]
      : [])
  ]

  return (
    <div className="bg-white rounded-lg shadow-md p-6">

      <h2 className="text-2xl font-bold text-slate-900 mb-6">
        {t.specsGrid.title}
      </h2>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">

        {specs.map((spec) => (
          <div
            key={spec.label}
            className="bg-slate-50 rounded-lg p-4 border border-slate-200"
          >

            <div className="flex items-center gap-2 mb-2">
              <span className="text-2xl">{spec.icon}</span>

              <p className="text-sm font-medium text-slate-600">
                {spec.label}
              </p>
            </div>

            <p className="text-lg font-bold text-slate-900">
              {spec.value}
            </p>

          </div>
        ))}

      </div>

    </div>
  )
}
