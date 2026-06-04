'use client'

import Link from 'next/link'
import { CompareButton } from '@/components/comparison/CompareButton'
import { useCompare } from '@/context/CompareContext'
import { ComparisonVehicle } from '@/types/comparison'
import type { VehicleData } from '@/lib/loadVehicle'
import { VEHICLE_PLACEHOLDER_IMAGE } from '@/lib/vehicleImages'
import { useTranslations } from '@/hooks/useTranslations'
import { useLocalizedHref } from '@/hooks/useLocalizedHref'

interface VehicleComparisonSectionProps {
  vehicle: VehicleData
  displayName: string
}

export function VehicleComparisonSection({
  vehicle,
  displayName,
}: VehicleComparisonSectionProps) {

  const t = useTranslations()
  const localizedHref = useLocalizedHref()

  const { state } = useCompare()

  const comparisonVehicle = {
    ...vehicle,
    displayName,
    image: vehicle.image || VEHICLE_PLACEHOLDER_IMAGE,
    bestFor: [],
    badges: [],
  } as unknown as ComparisonVehicle

  const isInComparison = state.vehicleIds.includes(vehicle.id)
  const count = state.vehicleIds.length

  const compareHref =
    count >= 2
      ? `/compare?${state.vehicleIds
          .map((id) => `ids=${encodeURIComponent(id)}`)
          .join('&')}`
      : '/compare'

  return (
    <div className="bg-white rounded-lg shadow-md p-6 border-l-4 border-emerald-500">

      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">

        <div>

          <h3 className="text-lg font-semibold text-slate-900 mb-1">
            {t.vehicleComparison.title}
          </h3>

          <p className="text-sm text-slate-600">
            {isInComparison ? (
              <>
                {t.vehicleComparison.inSelection}{' '}
                <span className="font-semibold">
                  {count} {t.vehicleComparison.of3}
                </span>
              </>
            ) : (
              <>
                {t.vehicleComparison.description}
              </>
            )}
          </p>

        </div>

        <div className="flex gap-3 w-full md:w-auto">

          <CompareButton
            vehicle={comparisonVehicle}
            variant="secondary"
          />

          {count >= 2 && (
            <Link
              href={localizedHref(compareHref)}
              className="px-4 py-2 bg-emerald-500 text-white font-medium rounded-lg hover:bg-emerald-600 transition-colors text-center"
            >
              {t.vehicleComparison.viewComparison} ({count})
            </Link>
          )}

        </div>

      </div>

    </div>
  )
}
