'use client'

import { useState } from 'react'
import { ComparisonVehicle } from '@/types/comparison'
import { ComparisonMetricsTable } from './ComparisonMetricsTable'
import { ComparisonSummary } from './ComparisonSummary'
import { ComparisonBadgesSection } from './ComparisonBadgesSection'
import Link from 'next/link'
import { VEHICLE_PLACEHOLDER_IMAGE } from '@/lib/vehicleImages'
import { useTranslations } from '@/hooks/useTranslations'
import { useLocalizedHref } from '@/hooks/useLocalizedHref'

interface ComparisonPageProps {
  vehicles: ComparisonVehicle[]
}

type ComparisonMode = 'simple' | 'advanced'
type RangeFeeling = 'unknown' | 'relaxed' | 'comfortable' | 'planning'
type ChargingFeeling = 'unknown' | 'fast' | 'ok' | 'slow'
type CargoFeeling = 'unknown' | 'large' | 'family' | 'compact'

function comparisonGridClass(vehicleCount: number) {
  return vehicleCount === 2
    ? 'mx-auto grid max-w-5xl grid-cols-1 gap-6 md:grid-cols-2'
    : 'grid grid-cols-1 gap-6 md:grid-cols-2 xl:grid-cols-3'
}

function formatCurrency(value?: number) {
  if (value == null) return 'N/D'
  return `${Math.round(value).toLocaleString()} €`
}

function formatNumber(value: number | undefined, unit: string) {
  if (value == null) return 'N/D'
  return `${Math.round(value).toLocaleString()} ${unit}`
}

function bestByHighest(
  vehicles: ComparisonVehicle[],
  getValue: (vehicle: ComparisonVehicle) => number | undefined
) {
  return vehicles
    .map((vehicle) => ({ vehicle, value: getValue(vehicle) }))
    .filter((item): item is { vehicle: ComparisonVehicle; value: number } => item.value != null)
    .sort((a, b) => b.value - a.value)[0]
}

function bestByLowest(
  vehicles: ComparisonVehicle[],
  getValue: (vehicle: ComparisonVehicle) => number | undefined
) {
  return vehicles
    .map((vehicle) => ({ vehicle, value: getValue(vehicle) }))
    .filter((item): item is { vehicle: ComparisonVehicle; value: number } => item.value != null && item.value > 0)
    .sort((a, b) => a.value - b.value)[0]
}

function rangeFeeling(rangeKm?: number): RangeFeeling {
  if (rangeKm == null) return 'unknown'
  if (rangeKm >= 420) return 'relaxed'
  if (rangeKm >= 320) return 'comfortable'
  return 'planning'
}

function chargingFeeling(minutes?: number): ChargingFeeling {
  if (minutes == null) return 'unknown'
  if (minutes <= 27) return 'fast'
  if (minutes <= 38) return 'ok'
  return 'slow'
}

function cargoFeeling(liters?: number): CargoFeeling {
  if (liters == null) return 'unknown'
  if (liters >= 500) return 'large'
  if (liters >= 360) return 'family'
  return 'compact'
}

export function ComparisonPage({
  vehicles
}: ComparisonPageProps) {

  const t = useTranslations()
  const localizedHref = useLocalizedHref()
  const [mode, setMode] = useState<ComparisonMode>('simple')
  const vehicleGridClass = comparisonGridClass(vehicles.length)
  const cheapest = bestByLowest(vehicles, (vehicle) => vehicle.pricing?.basePriceEur)
  const bestRange = bestByHighest(vehicles, (vehicle) => vehicle.efficiency?.wltpRangeKm)
  const fastestCharge = bestByLowest(vehicles, (vehicle) => vehicle.charging?.chargeTime10To80Min)
  const mostSpace = bestByHighest(vehicles, (vehicle) => vehicle.dimensions?.trunkCapacityL)
  const simpleWinnerIds = new Set([
    cheapest?.vehicle.id,
    bestRange?.vehicle.id,
    fastestCharge?.vehicle.id,
    mostSpace?.vehicle.id,
  ].filter((id): id is string => Boolean(id)))

  if (vehicles.length < 2) {
    return (
      <main className="min-h-screen bg-slate-100 text-slate-950">

        <div className="max-w-7xl mx-auto px-4 py-16">

          <div className="text-center py-20">

            <h1 className="text-4xl md:text-5xl font-bold mb-4">
              {t.comparisonPage.noComparison}
            </h1>

            <p className="text-lg text-slate-600 mb-8">
              {t.comparisonPage.selectAtLeastTwo}
            </p>

            <Link
              href={localizedHref('/')}
              className="inline-block px-8 py-3 bg-emerald-500 hover:bg-emerald-600 text-white font-semibold rounded-lg transition-all duration-200"
            >
              {t.comparisonPage.browseVehicles}
            </Link>
          </div>
        </div>
      </main>
    )
  }

  return (
    <main className="min-h-screen bg-slate-100 pb-10 text-slate-950">

      <div className="border-b border-slate-800 bg-slate-950 text-white">
        <div className="mx-auto max-w-7xl px-4 py-6 md:py-8">
          <div className="grid gap-5 lg:grid-cols-[1fr_380px] lg:items-end">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-emerald-300">
                {t.comparePage.compare}
              </p>
              <h1 className="mt-2 text-3xl font-bold tracking-tight text-white md:text-4xl">
                {t.comparisonPage.title}
              </h1>
              <p className="mt-3 max-w-3xl text-sm leading-6 text-slate-300 md:text-base">
                {t.comparisonPage.compare}{' '}
                {vehicles.length}{' '}
                {t.comparisonPage.premiumVehicles}
              </p>
            </div>

            <div className="rounded-lg border border-white/10 bg-white/5 p-3 shadow-sm">
              <div className="flex items-center justify-between gap-3">
                <p className="text-sm font-semibold text-slate-100">
                  {t.comparisonPage.modeLabel}
                </p>
                <Link
                  href={localizedHref('/compare')}
                  className="shrink-0 rounded-md border border-white/15 bg-white/10 px-3 py-1.5 text-xs font-semibold text-slate-100 transition hover:border-emerald-300 hover:text-emerald-200"
                >
                  {t.comparePage.editSelection}
                </Link>
              </div>
              <div className="mt-3 grid grid-cols-2 gap-1 rounded-lg border border-white/10 bg-slate-900 p-1">
                {(['simple', 'advanced'] as ComparisonMode[]).map((comparisonMode) => (
                  <button
                    key={comparisonMode}
                    type="button"
                    onClick={() => setMode(comparisonMode)}
                    className={`rounded-md px-3 py-2 text-sm font-semibold transition ${
                      mode === comparisonMode
                        ? 'bg-emerald-400 text-slate-950 shadow-sm'
                        : 'text-slate-300 hover:bg-white/10 hover:text-white'
                    }`}
                  >
                    {comparisonMode === 'simple'
                      ? t.comparisonPage.simpleMode
                      : t.comparisonPage.advancedMode}
                  </button>
                ))}
              </div>
              <p className="mt-3 min-h-10 text-xs leading-5 text-slate-300">
                {mode === 'simple'
                  ? t.comparisonPage.simpleModeDescription
                  : t.comparisonPage.advancedModeDescription}
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-8 space-y-8">
        {mode === 'simple' ? (
          <>
            <SimpleComparisonDecision
              cheapest={cheapest}
              bestRange={bestRange}
              fastestCharge={fastestCharge}
              mostSpace={mostSpace}
            />
            <SimpleVehicleCards
              vehicles={vehicles}
              highlightedIds={simpleWinnerIds}
              localizedHref={localizedHref}
            />
          </>
        ) : (
          <>
            <AdvancedVehicleCards vehicles={vehicles} localizedHref={localizedHref} gridClass={vehicleGridClass} />
            <ComparisonBadgesSection vehicles={vehicles} gridClass={vehicleGridClass} />
            <ComparisonSummary vehicles={vehicles} gridClass={vehicleGridClass} />
            <ComparisonMetricsTable vehicles={vehicles} />
          </>
        )}

        {/* CTA */}
        <div className="rounded-lg border border-emerald-200 bg-white p-6 text-center shadow-sm md:p-8">

          <h2 className="mb-3 text-2xl font-bold text-slate-950 md:text-3xl">
            {t.comparisonPage.readyDecision}
          </h2>

          <p className="mx-auto mb-6 max-w-2xl text-sm leading-6 text-slate-600 md:text-base">
            {t.comparisonPage.informedChoice}
          </p>

          <div className="flex flex-col md:flex-row gap-4 justify-center">

            <Link
              href={localizedHref('/')}
              className="px-8 py-3 bg-emerald-600 text-white font-semibold rounded-lg hover:bg-emerald-700 transition-colors duration-200"
            >
              {t.comparisonPage.backToVehicles}
            </Link>

            <a
              href="#"
              className="px-8 py-3 border border-slate-300 text-slate-700 font-semibold rounded-lg hover:border-emerald-500 hover:text-emerald-800 transition-colors duration-200"
            >
              {t.comparisonPage.testDrive}
            </a>
          </div>
        </div>
      </div>
    </main>
  )
}

function SimpleVehicleCards({
  vehicles,
  highlightedIds,
  localizedHref,
}: {
  vehicles: ComparisonVehicle[]
  highlightedIds: Set<string>
  localizedHref: (href: string) => string
}) {
  const t = useTranslations()
  const gridClass =
    vehicles.length === 2
      ? 'grid gap-5 lg:grid-cols-2'
      : 'grid gap-5 lg:grid-cols-3'

  return (
    <section className={gridClass}>
      {vehicles.map((vehicle) => {
        const rangeKey = rangeFeeling(vehicle.efficiency?.wltpRangeKm)
        const chargingKey = chargingFeeling(vehicle.charging?.chargeTime10To80Min)
        const cargoKey = cargoFeeling(vehicle.dimensions?.trunkCapacityL)
        const isHighlighted = highlightedIds.has(vehicle.id)

        return (
          <article
            key={vehicle.id}
            className={`flex h-full flex-col overflow-hidden rounded-lg border bg-white shadow-sm ${
              isHighlighted ? 'border-emerald-300 ring-1 ring-emerald-200' : 'border-slate-200'
            }`}
          >
            <Link
              href={localizedHref(`/vehicles/${vehicle.id}`)}
              className="group relative block aspect-[16/9] overflow-hidden bg-slate-100"
            >
              <img
                src={vehicle.image || VEHICLE_PLACEHOLDER_IMAGE}
                alt={vehicle.displayName}
                className="h-full w-full object-cover transition duration-500 group-hover:scale-105"
                onError={(event) => {
                  event.currentTarget.src = VEHICLE_PLACEHOLDER_IMAGE
                }}
              />
              <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-slate-950/70 to-transparent p-4">
                <div className="flex flex-wrap items-center gap-2">
                  {isHighlighted && (
                    <span className="rounded-full bg-emerald-300 px-3 py-1 text-xs font-bold text-slate-950">
                      {t.comparisonPage.simpleStrongOption}
                    </span>
                  )}
                  <span className="rounded-full bg-white/90 px-3 py-1 text-xs font-semibold text-slate-800">
                    {vehicle.bodyType || vehicle.segment || 'EV'}
                  </span>
                </div>
              </div>
            </Link>

            <div className="flex flex-1 flex-col p-5">
              <h2 className="text-xl font-bold leading-snug text-slate-950">
                {vehicle.displayName}
              </h2>

              <div className="mt-4 grid flex-1 gap-3">
                <PlainComparisonPoint
                  label={t.comparisonPage.simpleRangeLabel}
                  text={t.comparisonPage.rangeFeelings[rangeKey]}
                  detail={formatNumber(vehicle.efficiency?.wltpRangeKm, 'km')}
                />
                <PlainComparisonPoint
                  label={t.comparisonPage.simpleChargingLabel}
                  text={t.comparisonPage.chargingFeelings[chargingKey]}
                  detail={formatNumber(vehicle.charging?.chargeTime10To80Min, 'min')}
                />
                <PlainComparisonPoint
                  label={t.comparisonPage.simpleCargoLabel}
                  text={t.comparisonPage.cargoFeelings[cargoKey]}
                  detail={formatNumber(vehicle.dimensions?.trunkCapacityL, 'L')}
                />
              </div>
            </div>
          </article>
        )
      })}
    </section>
  )
}

function PlainComparisonPoint({
  label,
  text,
  detail,
}: {
  label: string
  text: string
  detail: string
}) {
  return (
    <div className="rounded-lg border border-slate-200 bg-slate-50 p-3">
      <div className="grid grid-cols-[1fr_auto] items-start gap-3">
        <div className="min-w-0">
          <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">{label}</p>
          <p className="mt-1 text-sm font-bold leading-5 text-slate-950">{text}</p>
        </div>
        <p className="rounded-full bg-white px-2.5 py-1 text-sm font-semibold text-emerald-700 shadow-sm">{detail}</p>
      </div>
    </div>
  )
}

function AdvancedVehicleCards({
  vehicles,
  localizedHref,
  gridClass,
}: {
  vehicles: ComparisonVehicle[]
  localizedHref: (href: string) => string
  gridClass: string
}) {
  const t = useTranslations()

  return (
    <div className={gridClass}>
      {vehicles.map((vehicle) => (
        <Link
          key={vehicle.id}
          href={localizedHref(`/vehicles/${vehicle.id}`)}
          className="group"
        >
          <div className="overflow-hidden rounded-lg border border-slate-200 bg-white shadow-sm transition hover:border-emerald-300 hover:shadow-md">
            <div className="h-56 bg-slate-100 overflow-hidden relative">
              <img
                src={vehicle.image || VEHICLE_PLACEHOLDER_IMAGE}
                alt={vehicle.displayName}
                className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                onError={(event) => {
                  event.currentTarget.src = VEHICLE_PLACEHOLDER_IMAGE
                }}
              />
              <div className="absolute inset-0 bg-gradient-to-t from-slate-950/35 to-transparent" />
              {vehicle.bestFor && vehicle.bestFor[0] && (
                <div className="absolute bottom-3 left-3 rounded-full bg-white px-3 py-1 text-xs font-bold text-slate-950 shadow-sm">
                  {vehicle.bestFor[0]}
                </div>
              )}
            </div>

            <div className="p-6">
              <div className="space-y-1 mb-4">
                <h3 className="text-xl font-bold text-slate-950 group-hover:text-emerald-700 transition-colors">
                  {vehicle.displayName}
                </h3>
                <p className="text-sm text-slate-500">{vehicle.segment}</p>
              </div>

              <div className="grid grid-cols-2 gap-3 text-sm">
                {vehicle.efficiency?.wltpRangeKm && (
                  <TechStat label={t.comparisonPage.range} value={`${Math.round(vehicle.efficiency.wltpRangeKm)} km`} />
                )}
                {vehicle.pricing?.basePriceEur && (
                  <TechStat label={t.comparisonPage.price} value={`€${Math.round(vehicle.pricing.basePriceEur / 1000)}k`} />
                )}
                {vehicle.battery?.capacityKwh && (
                  <TechStat label={t.comparisonPage.battery} value={`${vehicle.battery.capacityKwh.toFixed(1)} kWh`} />
                )}
                {vehicle.performance?.acceleration0To100Ms && (
                  <TechStat label="0-100 km/h" value={`${vehicle.performance.acceleration0To100Ms.toFixed(1)}s`} />
                )}
              </div>
            </div>
          </div>
        </Link>
      ))}
    </div>
  )
}

function TechStat({ label, value }: { label: string; value: string }) {
  return (
    <div className="bg-slate-50 rounded-lg p-2 border border-slate-200">
      <p className="text-xs text-slate-400">{label}</p>
      <p className="font-semibold text-emerald-700">{value}</p>
    </div>
  )
}

function SimpleComparisonDecision({
  cheapest,
  bestRange,
  fastestCharge,
  mostSpace,
}: {
  cheapest?: { vehicle: ComparisonVehicle; value: number }
  bestRange?: { vehicle: ComparisonVehicle; value: number }
  fastestCharge?: { vehicle: ComparisonVehicle; value: number }
  mostSpace?: { vehicle: ComparisonVehicle; value: number }
}) {
  const t = useTranslations()

  const items = [
    {
      label: t.comparisonPage.simplePrice,
      helper: t.comparisonPage.simplePriceHelp,
      winner: cheapest,
      value: cheapest ? formatCurrency(cheapest.value) : 'N/D',
    },
    {
      label: t.comparisonPage.simpleRange,
      helper: t.comparisonPage.simpleRangeHelp,
      winner: bestRange,
      value: bestRange ? formatNumber(bestRange.value, 'km') : 'N/D',
    },
    {
      label: t.comparisonPage.simpleCharging,
      helper: t.comparisonPage.simpleChargingHelp,
      winner: fastestCharge,
      value: fastestCharge ? formatNumber(fastestCharge.value, 'min') : 'N/D',
    },
    {
      label: t.comparisonPage.simpleSpace,
      helper: t.comparisonPage.simpleSpaceHelp,
      winner: mostSpace,
      value: mostSpace ? formatNumber(mostSpace.value, 'L') : 'N/D',
    },
  ]

  return (
    <section className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm md:p-6">
      <div className="mb-5 flex flex-col gap-2 md:flex-row md:items-end md:justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight text-slate-950">
            {t.comparisonPage.simpleDecisionTitle}
          </h2>
          <p className="mt-1 max-w-3xl text-sm leading-6 text-slate-600">
            {t.comparisonPage.simpleDecisionDescription}
          </p>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {items.map((item) => (
          <div
            key={item.label}
            className="flex min-h-56 flex-col rounded-lg border border-slate-200 bg-slate-50 p-4"
          >
            <p className="text-sm font-bold text-slate-950">{item.label}</p>
            <p className="mt-1 text-sm leading-5 text-slate-600">
              {item.helper}
            </p>
            <div className="mt-auto rounded-md bg-white p-3 shadow-sm">
              <p className="text-xs font-semibold uppercase tracking-wide text-emerald-700">
                {t.comparisonPage.simpleWinner}
              </p>
              <p className="mt-1 font-bold text-slate-950">
                {item.winner?.vehicle.displayName ?? 'N/D'}
              </p>
              <p className="mt-1 text-sm font-semibold text-emerald-700">
                {item.value}
              </p>
            </div>
          </div>
        ))}
      </div>
    </section>
  )
}
