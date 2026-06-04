'use client'

import { useEffect, useState } from 'react'
import { SafeImage as Image } from '@/components/SafeImage'
import { useRouter } from 'next/navigation'
import { useCompare } from '@/context/CompareContext'
import { mapRegistryToComparisonVehicle } from '@/lib/comparison'
import { VEHICLE_PLACEHOLDER_IMAGE } from '@/lib/vehicleImages'
import { useTranslations } from '@/hooks/useTranslations'
import { useLocalizedHref } from '@/hooks/useLocalizedHref'

interface VehicleSummary {
  id: string
  brand: string
  model: string
  variant: string
  segment: string
  bodyType: string
  drivetrain: string
  heroImage: string
}

interface VehicleSelectorProps {
  initialSelectedIds?: string[]
}

export function VehicleSelector({
  initialSelectedIds = [],
}: VehicleSelectorProps) {

  const t = useTranslations()
  const localizedHref = useLocalizedHref()

  const router = useRouter()

  const {
    state,
    setSelectedVehicleIds
  } = useCompare()

  const [vehicles, setVehicles] = useState<VehicleSummary[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [query, setQuery] = useState('')
  const [brandFilter, setBrandFilter] = useState('all')
  const [bodyFilter, setBodyFilter] = useState('all')

  const [selectedIds, setSelectedIds] = useState<string[]>(() => {
    if (state.vehicleIds.length > 0) {
      return state.vehicleIds
    }

    return initialSelectedIds
  })

  useEffect(() => {
    async function loadVehicles() {
      try {
        const response = await fetch('/api/vehicles/all')
        const data = await response.json()

        setVehicles(data.vehicles || [])
      } catch (error) {
        console.error('Failed to load vehicles:', error)
      } finally {
        setIsLoading(false)
      }
    }

    loadVehicles()
  }, [])

  const toggleVehicle = (vehicleId: string) => {
    setSelectedIds((prev) => {

      if (prev.includes(vehicleId)) {
        return prev.filter((id) => id !== vehicleId)
      }

      if (prev.length >= 3) {
        return prev
      }

      return [...prev, vehicleId]
    })
  }

  const selectedVehicles = vehicles.filter((v) =>
    selectedIds.includes(v.id)
  )
  const brands = Array.from(
    new Set(vehicles.map((vehicle) => vehicle.brand).filter(Boolean))
  ).sort((a, b) => a.localeCompare(b))
  const bodyTypes = Array.from(
    new Set(vehicles.map((vehicle) => vehicle.bodyType).filter(Boolean))
  ).sort((a, b) => a.localeCompare(b))
  const normalizedQuery = query.trim().toLowerCase()
  const filteredVehicles = vehicles.filter((vehicle) => {
    const searchable = [
      vehicle.brand,
      vehicle.model,
      vehicle.variant,
      vehicle.segment,
      vehicle.bodyType,
      vehicle.drivetrain,
    ].join(' ').toLowerCase()

    return (
      (!normalizedQuery || searchable.includes(normalizedQuery)) &&
      (brandFilter === 'all' || vehicle.brand === brandFilter) &&
      (bodyFilter === 'all' || vehicle.bodyType === bodyFilter)
    )
  })

  const handleCompare = () => {

    if (selectedIds.length < 2) {
      return
    }

    setSelectedVehicleIds(
      selectedIds,
      selectedVehicles.map(mapRegistryToComparisonVehicle)
    )

    const params = new URLSearchParams()

    selectedIds.forEach((id) => {
      params.append('ids', id)
    })

    router.push(localizedHref(`/compare?${params.toString()}`))
  }

  if (isLoading) {
    return (
      <main className="min-h-screen bg-gradient-to-b from-slate-900 via-slate-800 to-slate-900 text-white flex items-center justify-center">

        <div className="text-center">

          <div className="w-12 h-12 mx-auto mb-4 border-4 border-slate-600 border-t-emerald-500 rounded-full animate-spin" />

          <p className="text-lg text-slate-300">
            {t.vehicleSelector.loading}
          </p>
        </div>
      </main>
    )
  }

  return (
    <main className="min-h-screen bg-slate-100 pb-32 text-slate-950">

      <div className="max-w-7xl mx-auto p-8">

        <section className="rounded-lg border border-slate-200 bg-white p-6 shadow-sm md:p-8">
          <div className="grid gap-6 lg:grid-cols-[1fr_340px] lg:items-end">
            <div>
              <p className="text-sm font-semibold uppercase tracking-[0.22em] text-emerald-700">
                {t.comparePage.compare}
              </p>
              <h1 className="mt-2 text-4xl font-bold text-slate-950">
                {t.vehicleSelector.title}
              </h1>
              <p className="mt-3 max-w-3xl text-slate-600">
                {t.vehicleSelector.description}
              </p>
            </div>

            <div className="rounded-lg bg-slate-950 p-4 text-white">
              <p className="text-sm font-semibold text-emerald-300">
                {selectedIds.length} {t.vehicleSelector.selectedCount}
              </p>
              <p className="mt-1 text-sm text-slate-300">
                {selectedIds.length < 2
                  ? t.vehicleSelector.selectOneMore
                  : t.vehicleSelector.ready}
              </p>
            </div>
          </div>
        </section>

        <section className="mt-6 rounded-lg border border-slate-200 bg-white p-4 shadow-sm">
          <div className="grid gap-3 lg:grid-cols-[1fr_220px_220px]">
            <label className="block">
              <span className="text-sm font-semibold text-slate-700">{t.vehicleSelector.searchLabel}</span>
              <input
                type="search"
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                placeholder={t.vehicleSelector.searchPlaceholder}
                className="mt-1 h-11 w-full rounded-md border border-slate-200 bg-slate-50 px-3 text-slate-950 outline-none transition focus:border-emerald-500"
              />
            </label>

            <label className="block">
              <span className="text-sm font-semibold text-slate-700">{t.vehicleSelector.brandFilter}</span>
              <select
                value={brandFilter}
                onChange={(event) => setBrandFilter(event.target.value)}
                className="mt-1 h-11 w-full rounded-md border border-slate-200 bg-slate-50 px-3 text-slate-950 outline-none transition focus:border-emerald-500"
              >
                <option value="all">{t.vehicleSelector.allBrands}</option>
                {brands.map((brand) => (
                  <option key={brand} value={brand}>{brand}</option>
                ))}
              </select>
            </label>

            <label className="block">
              <span className="text-sm font-semibold text-slate-700">{t.vehicleSelector.bodyFilter}</span>
              <select
                value={bodyFilter}
                onChange={(event) => setBodyFilter(event.target.value)}
                className="mt-1 h-11 w-full rounded-md border border-slate-200 bg-slate-50 px-3 text-slate-950 outline-none transition focus:border-emerald-500"
              >
                <option value="all">{t.vehicleSelector.allBodies}</option>
                {bodyTypes.map((bodyType) => (
                  <option key={bodyType} value={bodyType}>{bodyType}</option>
                ))}
              </select>
            </label>
          </div>
          <p className="mt-3 text-sm text-slate-500">
            {filteredVehicles.length} {t.vehicleSelector.resultsCount}
          </p>
        </section>

        <div className="mt-6 grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">

          {filteredVehicles.map((vehicle) => {

            const isSelected = selectedIds.includes(vehicle.id)

            const isMaxReached =
              selectedIds.length >= 3 && !isSelected

            return (
              <div
                key={vehicle.id}
                className={`rounded-lg border bg-white p-4 shadow-sm transition ${
                  isSelected
                    ? 'border-emerald-500 ring-1 ring-emerald-500/50'
                    : 'border-slate-200 hover:border-emerald-300'
                }`}
              >

                <div className="aspect-video relative mb-4 rounded-lg overflow-hidden">

                  <Image
                    src={vehicle.heroImage || VEHICLE_PLACEHOLDER_IMAGE}
                    alt={`${vehicle.brand} ${vehicle.model}`}
                    fill
                    className="object-cover"
                    sizes="(max-width: 768px) 100vw, 25vw"
                  />
                </div>

                <h3 className="font-semibold text-lg mb-1 text-slate-950">
                  {vehicle.brand} {vehicle.model}
                </h3>

                <p className="text-slate-500 text-sm mb-2">
                  {vehicle.variant}
                </p>

                <p className="text-slate-500 text-xs mb-4">
                  {vehicle.segment} • {vehicle.bodyType} • {vehicle.drivetrain}
                </p>

                <button
                  type="button"
                  onClick={() => toggleVehicle(vehicle.id)}
                  disabled={isMaxReached}
                  className={`w-full py-2 px-4 rounded-lg font-medium transition-all duration-200 ${
                    isSelected
                      ? 'bg-emerald-50 text-emerald-800 border border-emerald-500'
                      : isMaxReached
                        ? 'bg-slate-100 text-slate-400 cursor-not-allowed'
                        : 'bg-emerald-500 hover:bg-emerald-600 text-white hover:shadow-lg hover:shadow-emerald-500/25'
                  }`}
                >
                  {isSelected
                    ? t.vehicleSelector.selected
                    : isMaxReached
                      ? t.vehicleSelector.maxVehicles
                      : t.vehicleSelector.select}
                </button>
              </div>
            )
          })}
        </div>
      </div>

      {/* Bottom Compare Bar */}
      <div className="fixed bottom-0 left-0 right-0 z-40 border-t border-slate-200 bg-white/95 shadow-2xl backdrop-blur-md">

        <div className="max-w-7xl mx-auto px-4 py-4">

          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">

            <div className="min-w-0 flex-1">

              {selectedIds.length === 0 ? (

                <p className="text-slate-500 text-sm">
                  {t.vehicleSelector.noneSelected}
                </p>

              ) : (

                <div className="flex flex-wrap items-center gap-2">

                  <span className="text-slate-700 text-sm shrink-0">
                    {selectedIds.length} {t.vehicleSelector.selectedCount}
                  </span>

                  {selectedVehicles.map((vehicle) => (
                    <span
                      key={vehicle.id}
                      className="inline-flex items-center gap-1 rounded-full border border-slate-200 bg-slate-50 px-3 py-1 text-sm text-slate-800"
                    >

                      {vehicle.brand} {vehicle.model}

                      <button
                        type="button"
                        onClick={() => toggleVehicle(vehicle.id)}
                        className="ml-1 text-slate-400 hover:text-red-500"
                        aria-label={`${t.vehicleSelector.remove} ${vehicle.brand} ${vehicle.model}`}
                      >
                        ×
                      </button>
                    </span>
                  ))}
                </div>
              )}
            </div>

            <button
              type="button"
              onClick={handleCompare}
              disabled={selectedIds.length < 2}
              className="shrink-0 px-8 py-3 rounded-lg bg-emerald-600 font-semibold text-white transition hover:bg-emerald-700 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {t.vehicleSelector.compareNow}
              {selectedIds.length >= 2
                ? ` (${selectedIds.length})`
                : ''}
            </button>
          </div>

          {selectedIds.length === 1 && (
            <p className="text-amber-700 text-xs mt-2 text-center sm:text-left">
              {t.vehicleSelector.selectOneMore}
            </p>
          )}
        </div>
      </div>
    </main>
  )
}
