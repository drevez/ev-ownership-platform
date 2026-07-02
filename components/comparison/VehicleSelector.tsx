'use client'

import { useEffect, useState } from 'react'
import { SafeImage as Image } from '@/components/SafeImage'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useCompare } from '@/context/CompareContext'
import { mapRegistryToComparisonVehicle } from '@/lib/comparison'
import { VEHICLE_PLACEHOLDER_IMAGE } from '@/lib/vehicleImages'
import { useTranslations } from '@/hooks/useTranslations'
import { useLocalizedHref } from '@/hooks/useLocalizedHref'
import {
  modelSlugsToVersionIds,
  versionIdsToModelSlugs,
} from '@/lib/comparisonSelection'

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

interface ModelSummary {
  slug: string
  brand: string
  model: string
  displayName: string
  heroImage: string
  segment: string
  bodyTypes: string[]
  drivetrains: string[]
  variantCount: number
  variants: Array<{
    id: string
    variant: string
    segment: string
    bodyType: string
    drivetrain: string
    image: string
  }>
}

interface VehicleSelectorProps {
  initialSelectedIds?: string[]
  initialSelectedModelSlugs?: string[]
  initialMode?: SelectionMode
}

type SelectionMode = 'models' | 'versions'

export function VehicleSelector({
  initialSelectedIds = [],
  initialSelectedModelSlugs = [],
  initialMode,
}: VehicleSelectorProps) {
  const t = useTranslations()
  const localizedHref = useLocalizedHref()
  const router = useRouter()

  const { state, setSelectedVehicleIds } = useCompare()

  const [vehicles, setVehicles] = useState<VehicleSummary[]>([])
  const [models, setModels] = useState<ModelSummary[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [mode, setMode] = useState<SelectionMode>(
    initialMode ?? (initialSelectedIds.length > 0 ? 'versions' : 'models')
  )
  const [query, setQuery] = useState('')
  const [brandFilter, setBrandFilter] = useState('all')
  const [bodyFilter, setBodyFilter] = useState('all')

  const [selectedIds, setSelectedIds] = useState<string[]>(() => {
    if (initialSelectedIds.length > 0) {
      return initialSelectedIds
    }
    return state.vehicleIds
  })
  const [selectedModelSlugs, setSelectedModelSlugs] = useState<string[]>(initialSelectedModelSlugs)

  useEffect(() => {
    async function loadData() {
      try {
        const response = await fetch('/api/models/all')
        if (!response.ok) {
          throw new Error(`Comparison choices request failed (${response.status})`)
        }

        const data = await response.json() as { models?: ModelSummary[] }
        const loadedModels = data.models ?? []
        const loadedVehicles = loadedModels.flatMap((model) =>
          model.variants.map((variant): VehicleSummary => ({
            id: variant.id,
            brand: model.brand,
            model: model.model,
            variant: variant.variant,
            segment: variant.segment,
            bodyType: variant.bodyType,
            drivetrain: variant.drivetrain,
            heroImage: variant.image || VEHICLE_PLACEHOLDER_IMAGE,
          }))
        )

        setVehicles(loadedVehicles)
        setModels(loadedModels)
      } catch (error) {
        console.error('Failed to load comparison choices:', error)
      } finally {
        setIsLoading(false)
      }
    }
    loadData()
  }, [])

  const activeSelectedIds = mode === 'models' ? selectedModelSlugs : selectedIds

  const versionCountLabel = (count: number) => {
    if (count === 1) return t.vehicleSelector.versionAvailable
    return t.vehicleSelector.versionsAvailable
  }

  const toggleSelection = (id: string) => {
    const setter = mode === 'models' ? setSelectedModelSlugs : setSelectedIds

    setter((prev) => {
      if (prev.includes(id)) {
        return prev.filter((selectedId) => selectedId !== id)
      }
      if (prev.length >= 3) {
        return prev
      }
      return [...prev, id]
    })
  }

  const selectedVehicles = vehicles.filter((v) => selectedIds.includes(v.id))
  const selectedModels = models.filter((model) => selectedModelSlugs.includes(model.slug))
  const selectedChoices = mode === 'models' ? selectedModels : selectedVehicles
  const choiceCount = activeSelectedIds.length
  const choices = mode === 'models' ? models : vehicles
  const brands = Array.from(
    new Set(choices.map((choice) => choice.brand).filter(Boolean))
  ).sort((a, b) => a.localeCompare(b))
  const bodyTypes = Array.from(
    new Set(
      choices.flatMap((choice) =>
        'bodyTypes' in choice ? choice.bodyTypes : [choice.bodyType]
      ).filter(Boolean)
    )
  ).sort((a, b) => a.localeCompare(b))
  const normalizedQuery = query.trim().toLowerCase()
  const filteredChoices = choices.filter((choice) => {
    const searchable = [
      choice.brand,
      choice.model,
      'variant' in choice ? choice.variant : '',
      choice.segment,
      'bodyTypes' in choice ? choice.bodyTypes.join(' ') : choice.bodyType,
      'drivetrains' in choice ? choice.drivetrains.join(' ') : choice.drivetrain,
    ]
      .join(' ')
      .toLowerCase()

    return (
      (!normalizedQuery || searchable.includes(normalizedQuery)) &&
      (brandFilter === 'all' || choice.brand === brandFilter) &&
      (bodyFilter === 'all' ||
        ('bodyTypes' in choice ? choice.bodyTypes.includes(bodyFilter) : choice.bodyType === bodyFilter))
    )
  })

  const comparisonParams = new URLSearchParams()
  if (mode === 'models') {
    selectedModelSlugs.forEach((slug) => comparisonParams.append('models', slug))
  } else {
    selectedIds.forEach((id) => comparisonParams.append('ids', id))
  }
  comparisonParams.set('mode', 'simple')
  const comparisonHref = localizedHref(
    `/compare/${mode}?${comparisonParams.toString()}`
  )

  const persistComparison = () => {
    if (mode === 'models') {
      setSelectedVehicleIds([], [])
    } else {
      setSelectedVehicleIds(
        selectedIds,
        selectedVehicles.map(mapRegistryToComparisonVehicle)
      )
    }
  }

  const switchMode = (nextMode: SelectionMode) => {
    if (nextMode === mode) return

    const params = new URLSearchParams()

    if (nextMode === 'versions') {
      const nextSelectedIds = modelSlugsToVersionIds(
        selectedModelSlugs,
        models,
        selectedIds
      )
      setSelectedIds(nextSelectedIds)
      nextSelectedIds.forEach((id) => params.append('ids', id))
    } else {
      const nextSelectedModelSlugs = versionIdsToModelSlugs(selectedIds, models)
      setSelectedModelSlugs(nextSelectedModelSlugs)
      nextSelectedModelSlugs.forEach((slug) => params.append('models', slug))
    }

    params.set('edit', '1')
    setMode(nextMode)
    setQuery('')
    setBrandFilter('all')
    setBodyFilter('all')
    router.replace(
      localizedHref(`/compare/${nextMode}?${params.toString()}`),
      { scroll: false }
    )
  }

  if (isLoading) {
    return (
      <main className="min-h-screen bg-slate-950 text-white flex items-center justify-center">
        <div className="text-center">
          <div className="w-10 h-10 mx-auto mb-4 border-2 border-slate-700 border-t-emerald-400 rounded-full animate-spin" />
          <p className="text-sm text-slate-400">{t.vehicleSelector.loading}</p>
        </div>
      </main>
    )
  }

  return (
    <main className="min-h-screen bg-slate-50 pb-36 md:pb-28">
      {/* Header */}
      <div className="border-b border-slate-200 bg-white">
        <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
            <div className="min-w-0">
              <p className="text-xs font-semibold uppercase tracking-widest text-emerald-600">
                {t.comparePage.compare}
              </p>
              <h1 className="mt-1 text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">
                {t.vehicleSelector.title}
              </h1>
              <p className="mt-2 max-w-2xl text-sm leading-relaxed text-slate-600">
                {t.vehicleSelector.description}
              </p>
            </div>

            {/* Selection Status */}
            <div className="flex shrink-0 flex-col gap-3 rounded-lg border border-slate-200 bg-slate-50 px-4 py-3">
              <div className="grid grid-cols-2 gap-1 rounded-lg border border-slate-200 bg-white p-1">
                {(['models', 'versions'] as SelectionMode[]).map((selectionMode) => (
                  <button
                    key={selectionMode}
                    type="button"
                    onClick={() => switchMode(selectionMode)}
                    className={`rounded-md px-3 py-1.5 text-sm font-semibold transition ${
                      mode === selectionMode
                        ? 'bg-slate-950 text-white'
                        : 'text-slate-600 hover:bg-slate-100'
                    }`}
                  >
                    {selectionMode === 'models'
                      ? t.vehicleSelector.modelMode
                      : t.vehicleSelector.versionMode}
                  </button>
                ))}
              </div>
              <div className="flex items-center gap-3">
              <div className="flex gap-1">
                {[0, 1, 2].map((i) => (
                  <div
                    key={i}
                    className={`h-2 w-6 rounded-full transition-colors ${
                      i < choiceCount ? 'bg-emerald-500' : 'bg-slate-200'
                    }`}
                  />
                ))}
              </div>
              <span className="text-sm font-medium text-slate-700">
                {choiceCount} {t.vehicleSelector.selectedCount}
              </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="border-b border-slate-200 bg-white">
        <div className="mx-auto max-w-7xl px-4 py-4 sm:px-6 lg:px-8">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-end">
            <label className="flex-1">
              <span className="sr-only">{t.vehicleSelector.searchLabel}</span>
              <input
                type="search"
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                placeholder={t.vehicleSelector.searchPlaceholder}
                className="h-10 w-full rounded-lg border border-slate-200 bg-slate-50 px-3 text-sm text-slate-900 placeholder-slate-400 outline-none transition focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500"
              />
            </label>

            <div className="flex gap-2">
              <select
                value={brandFilter}
                onChange={(event) => setBrandFilter(event.target.value)}
                className="h-10 rounded-lg border border-slate-200 bg-slate-50 px-3 pr-8 text-sm text-slate-900 outline-none transition focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500"
              >
                <option value="all">{t.vehicleSelector.allBrands}</option>
                {brands.map((brand) => (
                  <option key={brand} value={brand}>
                    {brand}
                  </option>
                ))}
              </select>

              <select
                value={bodyFilter}
                onChange={(event) => setBodyFilter(event.target.value)}
                className="h-10 rounded-lg border border-slate-200 bg-slate-50 px-3 pr-8 text-sm text-slate-900 outline-none transition focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500"
              >
                <option value="all">{t.vehicleSelector.allBodies}</option>
                {bodyTypes.map((bodyType) => (
                  <option key={bodyType} value={bodyType}>
                    {bodyType}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <p className="mt-3 text-xs text-slate-500">
            {filteredChoices.length} {mode === 'models'
              ? t.vehicleSelector.modelResultsCount
              : t.vehicleSelector.versionResultsCount}
          </p>
        </div>
      </div>

      {/* Vehicle Grid */}
      <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {filteredChoices.map((choice) => {
            const id = 'slug' in choice ? choice.slug : choice.id
            const image = 'heroImage' in choice ? choice.heroImage : VEHICLE_PLACEHOLDER_IMAGE
            const title = 'displayName' in choice ? choice.displayName : `${choice.brand} ${choice.model}`
            const subtitle = 'variantCount' in choice
              ? `${choice.variantCount} ${versionCountLabel(choice.variantCount)}`
              : choice.variant
            const bodyTags = 'bodyTypes' in choice
              ? [choice.bodyTypes[0], choice.drivetrains[0]]
              : [choice.bodyType, choice.drivetrain]
            const isSelected = activeSelectedIds.includes(id)
            const isMaxReached = choiceCount >= 3 && !isSelected

            return (
              <article
                key={id}
                className={`group relative flex flex-col overflow-hidden rounded-xl border bg-white transition-shadow ${
                  isSelected
                    ? 'border-emerald-500 shadow-md shadow-emerald-500/10'
                    : 'border-slate-200 hover:border-slate-300 hover:shadow-sm'
                }`}
              >
                {/* Selection indicator */}
                {isSelected && (
                  <div className="absolute right-3 top-3 z-10 flex h-6 w-6 items-center justify-center rounded-full bg-emerald-500 text-white shadow-sm">
                    <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
                )}

                {/* Image */}
                <div className="relative aspect-[4/3] overflow-hidden bg-slate-100">
                  <Image
                    src={image || VEHICLE_PLACEHOLDER_IMAGE}
                    alt={title}
                    fill
                    className="object-cover transition-transform duration-300 group-hover:scale-105"
                    sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
                  />
                </div>

                {/* Content */}
                <div className="flex flex-1 flex-col p-4">
                  <h3 className="font-semibold leading-snug text-slate-900">
                    {title}
                  </h3>
                  <p className="mt-0.5 text-sm text-slate-500 line-clamp-1">
                    {subtitle}
                  </p>
                  <div className="mt-2 flex flex-wrap gap-1.5">
                    {bodyTags
                      .filter(Boolean)
                      .map((tag) => (
                        <span
                          key={tag}
                          className="rounded-full bg-slate-100 px-2 py-0.5 text-xs text-slate-600"
                        >
                          {tag}
                        </span>
                      ))}
                  </div>

                  <button
                    type="button"
                    onClick={() => toggleSelection(id)}
                    disabled={isMaxReached}
                    className={`mt-4 w-full rounded-lg py-2.5 text-sm font-medium transition ${
                      isSelected
                        ? 'border border-emerald-500 bg-emerald-50 text-emerald-700 hover:bg-emerald-100'
                        : isMaxReached
                          ? 'cursor-not-allowed bg-slate-100 text-slate-400'
                          : 'bg-slate-900 text-white hover:bg-slate-800'
                    }`}
                  >
                    {isSelected
                      ? t.vehicleSelector.selected
                      : isMaxReached
                        ? t.vehicleSelector.maxVehicles
                        : t.vehicleSelector.select}
                  </button>
                </div>
              </article>
            )
          })}
        </div>

        {/* Empty state */}
        {filteredChoices.length === 0 && (
          <div className="py-16 text-center">
            <p className="text-slate-500">Nenhum veículo encontrado.</p>
          </div>
        )}
      </div>

      {/* Bottom Compare Bar */}
      <div className="fixed inset-x-0 bottom-0 z-40 border-t border-slate-200 bg-white/95 shadow-lg backdrop-blur-sm">
        <div className="mx-auto max-w-7xl px-4 py-3 sm:px-6 lg:px-8">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            {/* Selected vehicles pills */}
            <div className="min-w-0 flex-1">
              {choiceCount === 0 ? (
                <p className="text-sm text-slate-500">
                  {t.vehicleSelector.noneSelected}
                </p>
              ) : (
                <div className="flex flex-wrap items-center gap-2">
                  <span className="text-slate-700 text-sm shrink-0">
                    {choiceCount} {t.vehicleSelector.selectedCount2}
                  </span>
                  {selectedChoices.map((choice) => {
                    const id = 'slug' in choice ? choice.slug : choice.id
                    const title = 'displayName' in choice ? choice.displayName : `${choice.brand} ${choice.model}`

                    return (
                    <span
                      key={id}
                      className="inline-flex items-center gap-1.5 rounded-full border border-slate-200 bg-white px-3 py-1 text-sm text-slate-700 shadow-sm"
                    >
                      <span className="max-w-[120px] truncate sm:max-w-none">
                        {title}
                      </span>
                      <button
                        type="button"
                        onClick={() => toggleSelection(id)}
                        className="flex h-4 w-4 items-center justify-center rounded-full text-slate-400 transition hover:bg-slate-100 hover:text-red-500"
                        aria-label={`${t.vehicleSelector.remove} ${title}`}
                      >
                        <svg className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                        </svg>
                      </button>
                    </span>
                    )
                  })}
                </div>
              )}

              {choiceCount === 1 && (
                <p className="mt-1 text-xs text-amber-600">
                  {t.vehicleSelector.selectOneMore}
                </p>
              )}
            </div>

            {/* Compare button */}
            {choiceCount >= 2 ? (
              <Link
                href={comparisonHref}
                onClick={persistComparison}
                className="shrink-0 rounded-lg bg-emerald-600 px-6 py-2.5 text-center text-sm font-semibold text-white transition hover:bg-emerald-700 sm:px-8"
              >
                {t.vehicleSelector.compareNow} ({choiceCount})
              </Link>
            ) : (
              <button
                type="button"
                disabled
                className="shrink-0 cursor-not-allowed rounded-lg bg-emerald-600 px-6 py-2.5 text-sm font-semibold text-white opacity-50 sm:px-8"
              >
                {t.vehicleSelector.compareNow}
              </button>
            )}
          </div>
        </div>
      </div>
    </main>
  )
}
