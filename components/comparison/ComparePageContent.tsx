'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { useSearchParams } from 'next/navigation'
import { ComparisonPage } from '@/components/comparison/ComparisonPage'
import { VehicleSelector } from '@/components/comparison/VehicleSelector'
import { ComparisonVehicle } from '@/types/comparison'
import { calculateBadges } from '@/lib/comparison'
import { useTranslations } from '@/hooks/useTranslations'
import { useLocalizedHref } from '@/hooks/useLocalizedHref'
import { getTranslations } from '@/lib/getTranslations'

export function CompareLoadingFallback() {
  const t = useTranslations()
  return (
    <main className="min-h-screen bg-slate-100 text-slate-950 flex items-center justify-center">
      <div className="text-center">
        <div className="w-12 h-12 mx-auto mb-4 border-4 border-slate-200 border-t-emerald-500 rounded-full animate-spin" />
        <p className="text-lg text-slate-600">{t.comparePage.loading}</p>
      </div>
    </main>
  )
}

export function ComparePageContent() {
  const searchParams = useSearchParams()
  const compareIds = searchParams.getAll('ids')

  if (compareIds.length < 2) {
    return <VehicleSelector initialSelectedIds={compareIds} />
  }

  return <CompareResultsView compareIds={compareIds} />
}

function CompareResultsView({ compareIds }: { compareIds: string[] }) {
  const [vehicles, setVehicles] = useState<ComparisonVehicle[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const compareIdsKey = compareIds.join(',')
  const t = useTranslations()
  const localizedHref = useLocalizedHref()

  useEffect(() => {
    async function loadComparisonVehicles() {
      setIsLoading(true)
      try {
        const ids = compareIdsKey.split(',').filter(Boolean)
        const params = new URLSearchParams()
        ids.forEach((id) => params.append('ids', id))

        const response = await fetch(`/api/vehicles?${params.toString()}`)
        const data = await response.json()

        const loadedVehicles = (data.vehicles ?? []) as ComparisonVehicle[]

        setVehicles(
          loadedVehicles.map((vehicle) => ({
            ...vehicle,
            bestFor: getBestForTags(vehicle, t),
            badges: calculateBadges(vehicle, loadedVehicles),
          }))
        )
      } catch (error) {
        console.error('Failed to load comparison vehicles:', error)
        setVehicles([])
      } finally {
        setIsLoading(false)
      }
    }

    loadComparisonVehicles()
  }, [compareIdsKey, t])

  if (isLoading) {
    return <CompareLoadingFallback />
  }

  return (
    <>
      <div className="border-b border-slate-200 bg-white px-6 py-4">
        <nav className="max-w-7xl mx-auto flex items-center gap-2 text-sm text-slate-500">
          <Link href={localizedHref('/')} className="hover:text-slate-900 transition">
            {t.comparePage.home}
          </Link>
          <span>/</span>
          <Link href={localizedHref('/compare')} className="hover:text-slate-900 transition">
            {t.comparePage.compare}
          </Link>
          <span>/</span>
          <span className="text-slate-900">{t.comparePage.result}</span>
          <span className="ml-auto">
            <Link
              href={localizedHref('/compare')}
              className="font-medium text-emerald-700 hover:text-emerald-900 transition"
            >
              {t.comparePage.editSelection}
            </Link>
          </span>
        </nav>
      </div>
      <ComparisonPage vehicles={vehicles} />
    </>
  )
}

function getBestForTags(vehicle: ComparisonVehicle, t: ReturnType<typeof getTranslations>): string[] {
  const tags: string[] = []

  if (vehicle.pricing?.basePriceEur && vehicle.pricing.basePriceEur < 35000) {
    tags.push(t.comparePage.tags.budget)
  }

  if (vehicle.efficiency?.wltpRangeKm && vehicle.efficiency.wltpRangeKm > 500) {
    tags.push(t.comparePage.tags.longDistance)
  } else if (vehicle.efficiency?.wltpRangeKm && vehicle.efficiency.wltpRangeKm < 300) {
    tags.push(t.comparePage.tags.city)
  }

  if (vehicle.doors === 5 && vehicle.seats && vehicle.seats >= 5) {
    tags.push(t.comparePage.tags.families)
  }

  if (vehicle.segment?.includes('SUV')) {
    tags.push(t.comparePage.tags.adventure)
  }

  if (
    vehicle.performance?.acceleration0To100Ms &&
    vehicle.performance.acceleration0To100Ms < 6
  ) {
    tags.push(t.comparePage.tags.performance)
  }

  if (
    vehicle.efficiency?.wltpConsumptionKwh100km &&
    vehicle.efficiency.wltpConsumptionKwh100km < 15
  ) {
    tags.push(t.comparePage.tags.eco)
  }

  return tags.slice(0, 3)
}
