'use client'

import { useTranslations } from '@/hooks/useTranslations'
import type { VehicleComfort } from '@/lib/loadVehicle'

const RATING_MAX = 10

interface ComfortAndFeaturesProps {
  comfort?: VehicleComfort
}

function normalizeRatingLevel(level: number) {
  return Math.min(Math.max(level, 0), RATING_MAX)
}

export function ComfortAndFeaturesCard({
  comfort = {},
}: ComfortAndFeaturesProps) {

  const t = useTranslations()

  const features = [
    {
      label: t.comfortAndFeatures.heatPump,
      value: comfort.heatPumpAvailable,
      icon: '🌡️',
    },
    {
      label: t.comfortAndFeatures.vehicleToLoad,
      value: comfort.vehicleToLoad,
      icon: '🔌',
    },
    {
      label: t.comfortAndFeatures.vehicleToGrid,
      value: comfort.vehicleToGrid,
      icon: '⚡',
    },
    {
      label: t.comfortAndFeatures.panoramicRoof,
      value: comfort.panoramicRoof,
      icon: '🪟',
    },
  ]

  const ratings = [
    {
      label: t.comfortAndFeatures.softwareExperience,
      level: comfort.softwareExperienceLevel,
      icon: '💻',
    },
    {
      label: t.comfortAndFeatures.maintenance,
      level: comfort.maintenanceLevel,
      icon: '🔧',
    },
    {
      label: t.comfortAndFeatures.insurance,
      level: comfort.insuranceLevel,
      icon: '📋',
    },
  ]

  const hasFeatures = features.some(
    (f) => f.value !== undefined
  )

  const hasRatings = ratings.some(
    (r) => r.level !== undefined
  )

  if (!hasFeatures && !hasRatings) {
    return null
  }

  return (
    <div className="bg-white rounded-lg shadow-md p-6">

      <h2 className="text-2xl font-bold text-slate-900 mb-6">
        {t.comfortAndFeatures.title}
      </h2>

      {hasFeatures && (
        <div>

          <h3 className="font-semibold text-slate-900 mb-3">
            {t.comfortAndFeatures.features}
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-6">

            {features.map((feature) => {

              if (feature.value === undefined) {
                return null
              }

              return (
                <div
                  key={feature.label}
                  className={`flex items-center gap-3 p-3 rounded-lg border ${
                    feature.value
                      ? 'bg-green-50 border-green-200'
                      : 'bg-slate-50 border-slate-200'
                  }`}
                >

                  <span className="text-xl">
                    {feature.icon}
                  </span>

                  <span
                    className={`font-medium ${
                      feature.value
                        ? 'text-green-900'
                        : 'text-slate-600'
                    }`}
                  >
                    {feature.label}
                  </span>

                  <span
                    className={`ml-auto text-sm font-bold ${
                      feature.value
                        ? 'text-green-600'
                        : 'text-slate-400'
                    }`}
                  >
                    {feature.value ? '✓' : '✗'}
                  </span>
                </div>
              )
            })}
          </div>
        </div>
      )}

      {hasRatings && (
        <div>

          <h3 className="font-semibold text-slate-900 mb-3">
            {t.comfortAndFeatures.ratings}
          </h3>

          <div className="space-y-3">

            {ratings.map((rating) => {

              if (rating.level === undefined) {
                return null
              }

              const displayLevel = normalizeRatingLevel(rating.level)

              return (
                <div key={rating.label}>

                  <div className="flex items-center justify-between mb-1">

                    <div className="flex items-center gap-2">

                      <span className="text-lg">
                        {rating.icon}
                      </span>

                      <span className="font-medium text-slate-900">
                        {rating.label}
                      </span>
                    </div>

                    <span className="text-sm font-bold text-slate-600">
                      {displayLevel}/{RATING_MAX}
                    </span>
                  </div>

                  <div className="w-full bg-slate-200 rounded-full h-2">

                    <div
                      className="bg-blue-500 h-2 rounded-full"
                      style={{
                        width: `${(displayLevel / RATING_MAX) * 100}%`,
                      }}
                    />
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      )}
    </div>
  )
}
