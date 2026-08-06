'use client'

import { useEffect, useRef, useState } from 'react'
import Link from 'next/link'
import { useSearchParams } from 'next/navigation'
import { ComparisonPage } from '@/components/comparison/ComparisonPage'
import { VehicleSelector } from '@/components/comparison/VehicleSelector'
import { ComparisonVehicle } from '@/types/comparison'
import { calculateBadges } from '@/lib/comparison'
import { useTranslations } from '@/hooks/useTranslations'
import { useLocalizedHref } from '@/hooks/useLocalizedHref'
import { getTranslations } from '@/lib/getTranslations'
import { useLocale } from '@/context/LocaleContext'
import { pushGaEvent } from '@/lib/gaEvents'
import {
  buildPageContext,
  pageContextToFlatProperties,
  toAnalyticsVehicles,
  vehicleFlatProperties,
} from '@/lib/analytics'
import {
  MIN_COMPARISON_ITEMS,
  normalizeComparisonSelection,
  type ComparisonApiResponse,
} from '@/lib/comparisonSelection'
import { trackEvent } from '@/lib/posthogClient'

type CompareContentKind = 'auto' | 'models' | 'versions'

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

export function ComparePageContent({
  kind = 'auto',
}: {
  kind?: CompareContentKind
}) {
  const searchParams = useSearchParams()
  const compareIds = normalizeComparisonSelection(searchParams.getAll('ids')).values
  const compareModels = normalizeComparisonSelection(searchParams.getAll('models')).values
  const isEditingSelection = searchParams.get('edit') === '1'
  const effectiveKind: Exclude<CompareContentKind, 'auto'> =
    kind === 'auto'
      ? compareIds.length >= 2 && compareModels.length < 2
        ? 'versions'
        : 'models'
      : kind

  if (
    isEditingSelection ||
    (effectiveKind === 'models' && compareModels.length < 2) ||
    (effectiveKind === 'versions' && compareIds.length < 2)
  ) {
    return (
      <VehicleSelector
        initialSelectedIds={compareIds}
        initialSelectedModelSlugs={compareModels}
        initialMode={effectiveKind}
      />
    )
  }

  return (
    <CompareResultsView
      compareIds={compareIds}
      compareModels={compareModels}
      kind={effectiveKind}
    />
  )
}

function CompareResultsView({
  compareIds,
  compareModels,
  kind,
}: {
  compareIds: string[]
  compareModels: string[]
  kind: Exclude<CompareContentKind, 'auto'>
}) {
  const [vehicles, setVehicles] = useState<ComparisonVehicle[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [loadError, setLoadError] = useState(false)
  const [missing, setMissing] = useState<string[]>([])
  const compareKey = kind === 'models'
    ? `models:${compareModels.join(',')}`
    : `ids:${compareIds.join(',')}`
  const trackedComparisonKey = useRef<string | null>(null)
  const t = useTranslations()
  const { locale } = useLocale()
  const localizedHref = useLocalizedHref()
  const editSelectionParams = new URLSearchParams()
  const editSelectionKey = kind === 'models' ? 'models' : 'ids'
  const editSelectionValues = kind === 'models' ? compareModels : compareIds
  editSelectionValues.forEach((value) =>
    editSelectionParams.append(editSelectionKey, value)
  )
  editSelectionParams.set('edit', '1')
  const editSelectionHref =
    `${kind === 'models' ? '/compare/models' : '/compare/versions'}?${editSelectionParams.toString()}`

  useEffect(() => {
    const controller = new AbortController()

    async function loadComparisonVehicles() {
      setIsLoading(true)
      setLoadError(false)
      setMissing([])
      try {
        const isModelComparison = kind === 'models'
        const selected = compareKey
          .replace(isModelComparison ? 'models:' : 'ids:', '')
          .split(',')
          .filter(Boolean)
        const params = new URLSearchParams()
        selected.forEach((id) => params.append(isModelComparison ? 'models' : 'ids', id))

        const response = await fetch(
          `${isModelComparison ? '/api/models/compare' : '/api/vehicles'}?${params.toString()}`,
          { signal: controller.signal }
        )
        if (!response.ok) throw new Error(`Comparison request failed (${response.status})`)
        const data = await response.json() as ComparisonApiResponse<ComparisonVehicle>

        const loadedVehicles = (data.vehicles ?? []) as ComparisonVehicle[]
        setMissing(data.missing ?? [])

        const nextVehicles = loadedVehicles.map((vehicle) => ({
            ...vehicle,
            bestFor: getBestForTags(vehicle, t),
            badges: calculateBadges(vehicle, loadedVehicles, locale),
          }))
        setVehicles(nextVehicles)

        if (
          nextVehicles.length >= MIN_COMPARISON_ITEMS &&
          trackedComparisonKey.current !== compareKey
        ) {
          trackedComparisonKey.current = compareKey
          const page = buildPageContext({
            path: window.location.pathname,
            canonicalPath: kind === 'models' ? '/compare/models' : '/compare/versions',
            type: 'comparison',
            language: locale,
          })
          const analyticsVehicles = toAnalyticsVehicles(nextVehicles)
          const comparison = {
            type: kind,
            vehicle_count: nextVehicles.length,
            selection_source: 'url',
          }
          const properties = {
            event_schema_version: 2,
            page,
            comparison,
            vehicles: analyticsVehicles,
            comparison_type: kind,
            selected_ids: analyticsVehicles.map((vehicle) => vehicle.id),
            selected_names: nextVehicles.map((vehicle) => vehicle.displayName),
            ...pageContextToFlatProperties(page),
            ...vehicleFlatProperties(analyticsVehicles),
          }

          trackEvent('comparison_created', {
            ...properties,
            comparison_type: kind,
            vehicle_count: nextVehicles.length,
          })
          pushGaEvent('comparison_created', properties)
        }
      } catch (error) {
        if (controller.signal.aborted) return
        console.error('Failed to load comparison vehicles:', error)
        setVehicles([])
        setLoadError(true)
      } finally {
        if (!controller.signal.aborted) setIsLoading(false)
      }
    }

    loadComparisonVehicles()
    return () => controller.abort()
  }, [compareKey, kind, locale, t])

  if (isLoading) {
    return <CompareLoadingFallback />
  }

  if (loadError || vehicles.length < MIN_COMPARISON_ITEMS) {
    const selectionPath = kind === 'models' ? '/compare/models' : '/compare/versions'
    return (
      <main className="min-h-[70vh] bg-slate-100 px-6 py-20 text-slate-950">
        <div className="mx-auto max-w-xl rounded-lg border border-slate-200 bg-white p-8 text-center shadow-sm">
          <h1 className="text-2xl font-bold">{t.comparePage.unavailableTitle}</h1>
          <p className="mt-3 text-slate-600">
            {loadError
              ? t.comparePage.loadError
              : t.comparePage.missingSelection.replace('{count}', String(missing.length))}
          </p>
          <Link
            href={localizedHref(selectionPath)}
            className="mt-6 inline-flex rounded-md bg-emerald-600 px-5 py-2.5 font-semibold text-white transition hover:bg-emerald-700"
          >
            {t.comparePage.chooseAgain}
          </Link>
        </div>
      </main>
    )
  }

  return (
    <>
      <div className="border-b border-slate-200 bg-white px-6 py-4">
        <nav className="max-w-7xl mx-auto flex items-center gap-2 text-sm text-slate-500">
          <Link href={localizedHref('/')} className="hover:text-slate-900 transition">
            {t.comparePage.home}
          </Link>
          <span>/</span>
          <Link href={localizedHref('/compare/models')} className="hover:text-slate-900 transition">
            {t.comparePage.compare}
          </Link>
          <span>/</span>
          <span className="text-slate-900">{t.comparePage.result}</span>
        </nav>
      </div>
      <ComparisonPage
        vehicles={vehicles}
        editSelectionHref={editSelectionHref}
      />
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
