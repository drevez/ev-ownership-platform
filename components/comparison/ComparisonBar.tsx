'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useSyncExternalStore } from 'react'
import { useCompare } from '@/context/CompareContext'
import { VEHICLE_PLACEHOLDER_IMAGE } from '@/lib/vehicleImages'
import { useTranslations } from '@/hooks/useTranslations'
import { useLocalizedHref } from '@/hooks/useLocalizedHref'
import { stripLanguageFromPathname } from '@/lib/i18nRouting'

function useHasHydrated() {
  return useSyncExternalStore(
    () => () => {},
    () => true,
    () => false
  )
}

export function ComparisonBar() {

  const t = useTranslations()
  const localizedHref = useLocalizedHref()

  const pathname = usePathname()
  const basePathname = stripLanguageFromPathname(pathname)
  const hasHydrated = useHasHydrated()

  const {
    state,
    removeVehicle,
    clearComparison
  } = useCompare()

  if (!hasHydrated) {
     return null
  }
  if (basePathname.startsWith('/compare') || state.vehicleIds.length === 0) {
    return null
  }

  const compareHref =
    state.vehicleIds.length >= 2
      ? `/compare/versions?${state.vehicleIds
          .map((id) => `ids=${encodeURIComponent(id)}`)
          .join('&')}`
      : '/compare/versions'

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-gradient-to-r from-slate-900 to-slate-800 text-white z-40 border-t border-slate-700 shadow-2xl">
      <div className="max-w-7xl mx-auto px-4 py-4">

        <div className="flex items-center justify-between gap-4">

          <div className="flex items-center gap-3 overflow-x-auto pb-2 flex-1">
            {state.vehicleIds.map((vehicleId) => {

              const vehicle = state.vehicles.find(
                (v) => v.id === vehicleId
              )

              if (!vehicle) {
                return (
                  <div
                    key={vehicleId}
                    className="flex-shrink-0 bg-slate-800 rounded-lg border border-slate-700 p-3 animate-pulse"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-16 h-16 bg-slate-700 rounded flex-shrink-0" />

                      <div className="space-y-2">
                        <div className="h-3 w-28 bg-slate-700 rounded" />
                        <div className="h-2 w-20 bg-slate-700 rounded" />
                      </div>
                    </div>
                  </div>
                )
              }

              return (
                <div
                  key={vehicle.id}
                  className="flex-shrink-0 bg-slate-800 rounded-lg overflow-hidden border border-slate-700 hover:border-slate-500 transition-colors group"
                >
                  <div className="flex items-center gap-3 p-3">

                    <div className="w-16 h-16 bg-slate-700 rounded flex-shrink-0 overflow-hidden">
                      <img
                        src={vehicle.image || VEHICLE_PLACEHOLDER_IMAGE}
                        alt={vehicle.displayName}
                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                        onError={(event) => {
                          event.currentTarget.src = VEHICLE_PLACEHOLDER_IMAGE
                        }}
                      />
                    </div>

                    <div className="flex flex-col gap-1 min-w-0">
                      <p className="font-semibold text-sm text-white whitespace-nowrap">
                        {vehicle.displayName}
                      </p>

                      <div className="flex gap-2 text-xs text-slate-300">
                        <span>{vehicle.drivetrain}</span>

                        {vehicle.efficiency?.wltpRangeKm != null && (
                          <>
                            <span>•</span>

                            <span>
                              {Math.round(
                                vehicle.efficiency.wltpRangeKm
                              )}{' '}
                              km
                            </span>
                          </>
                        )}
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={() => removeVehicle(vehicle.id)}
                      className="ml-2 p-1 text-slate-400 hover:text-red-400 transition-colors flex-shrink-0 rounded-md hover:bg-slate-700"
                      title={t.comparisonBar.removeVehicle}
                      aria-label={`${t.comparisonBar.remove} ${vehicle.displayName} ${t.comparisonBar.fromComparison}`}
                    >
                      <svg
                        className="w-4 h-4"
                        fill="currentColor"
                        viewBox="0 0 20 20"
                      >
                        <path
                          fillRule="evenodd"
                          d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
                          clipRule="evenodd"
                        />
                      </svg>
                    </button>
                  </div>
                </div>
              )
            })}
          </div>

          <div className="flex items-center gap-3 flex-shrink-0">

            <Link
              href={localizedHref(compareHref)}
              className="px-6 py-2 bg-gradient-to-r from-emerald-500 to-teal-500 text-white font-semibold rounded-lg hover:shadow-lg hover:scale-105 transition-all duration-200 whitespace-nowrap"
            >
              {t.comparisonBar.compare}{' '}
              {state.vehicleIds.length}
            </Link>

            <button
              type="button"
              onClick={clearComparison}
              className="p-2 text-slate-400 hover:text-slate-200 transition-colors rounded-md hover:bg-slate-700"
              title={t.comparisonBar.clearComparison}
              aria-label={t.comparisonBar.clearAll}
            >
              <svg
                className="w-5 h-5"
                fill="currentColor"
                viewBox="0 0 20 20"
              >
                <path
                  fillRule="evenodd"
                  d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
                  clipRule="evenodd"
                />
              </svg>
            </button>
          </div>
        </div>

        <div className="text-xs text-slate-400 mt-2 text-center">
          {state.vehicleIds.length === 1 &&
            t.comparisonBar.selectOneMore}

          {state.vehicleIds.length === 2 &&
            t.comparisonBar.readyToCompare}

          {state.vehicleIds.length === 3 &&
            t.comparisonBar.maxVehicles}
        </div>
      </div>
    </div>
  )
}
