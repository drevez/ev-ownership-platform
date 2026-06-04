'use client'

import Link from 'next/link'
import Image from 'next/image'
import type { RecommendationBreakdownItem, RecommendationResult } from '@/types/recommendation'
import { VEHICLE_PLACEHOLDER_IMAGE } from '@/lib/vehicleImages'
import { useLocale } from '@/context/LocaleContext'
import { useLocalizedHref } from '@/hooks/useLocalizedHref'
import { useTranslations } from '@/hooks/useTranslations'
import { LANGUAGE_LOCALES } from '@/config/i18n'

interface MatchCardProps {
  recommendation: RecommendationResult
  rank: number
  knowledgeMode: 'simple' | 'advanced'
}

type ResultIconName = 'range' | 'plug' | 'cargo' | 'leaf'

function formatCurrency(value: number | undefined, locale: string, fallback: string) {
  if (value == null) return fallback
  return `${Math.round(value).toLocaleString(locale)} €`
}

function formatSpec(
  value: number | undefined,
  unit: string,
  locale: string,
  fallback: string
) {
  if (value == null) return fallback
  return `${Math.round(value).toLocaleString(locale)}${unit ? ` ${unit}` : ''}`
}

function confidenceClass(confidence: RecommendationResult['confidence']) {
  if (confidence === 'high') return 'border-emerald-200 bg-emerald-50 text-emerald-800'
  if (confidence === 'medium') return 'border-amber-200 bg-amber-50 text-amber-800'
  return 'border-slate-200 bg-slate-50 text-slate-700'
}

function translatedRange(rangeKm: number | undefined, t: ReturnType<typeof useTranslations>) {
  if (rangeKm == null) return t.recommendCard.plainSpecs.range.unknown
  if (rangeKm >= 450) return t.recommendCard.plainSpecs.range.long
  if (rangeKm >= 330) return t.recommendCard.plainSpecs.range.good
  if (rangeKm >= 230) return t.recommendCard.plainSpecs.range.daily
  return t.recommendCard.plainSpecs.range.limited
}

function translatedCharging(dcKw: number | undefined, chargeMinutes: number | undefined, t: ReturnType<typeof useTranslations>) {
  if (dcKw == null && chargeMinutes == null) return t.recommendCard.plainSpecs.charging.unknown
  if ((dcKw != null && dcKw >= 170) || (chargeMinutes != null && chargeMinutes <= 25)) return t.recommendCard.plainSpecs.charging.fast
  if ((dcKw != null && dcKw >= 100) || (chargeMinutes != null && chargeMinutes <= 35)) return t.recommendCard.plainSpecs.charging.ok
  return t.recommendCard.plainSpecs.charging.slow
}

function translatedCargo(liters: number | undefined, t: ReturnType<typeof useTranslations>) {
  if (liters == null) return t.recommendCard.plainSpecs.cargo.unknown
  if (liters >= 520) return t.recommendCard.plainSpecs.cargo.large
  if (liters >= 380) return t.recommendCard.plainSpecs.cargo.family
  return t.recommendCard.plainSpecs.cargo.light
}

function translatedEfficiency(whKm: number | undefined, t: ReturnType<typeof useTranslations>) {
  if (whKm == null) return t.recommendCard.plainSpecs.efficiency.unknown
  if (whKm <= 155) return t.recommendCard.plainSpecs.efficiency.veryGood
  if (whKm <= 180) return t.recommendCard.plainSpecs.efficiency.good
  return t.recommendCard.plainSpecs.efficiency.high
}

function BreakdownBar({ item }: { item: RecommendationBreakdownItem }) {
  const percentage = Math.round((item.score / item.maxScore) * 100)

  return (
    <div>
      <div className="mb-1 flex items-center justify-between gap-3 text-xs">
        <span className="font-medium text-slate-600">{item.label}</span>
        <span className="text-slate-500">{percentage}%</span>
      </div>
      <div className="h-2 overflow-hidden rounded-full bg-slate-100">
        <div
          className="h-full rounded-full bg-emerald-500"
          style={{ width: `${percentage}%` }}
        />
      </div>
    </div>
  )
}

export function MatchCard({ recommendation, rank, knowledgeMode }: MatchCardProps) {
  const { locale } = useLocale()
  const t = useTranslations()
  const localizedHref = useLocalizedHref()
  const numberLocale = LANGUAGE_LOCALES[locale]
  const {
    vehicle,
    matchPercentage,
    confidence,
    reasons,
    drawbacks,
    tags,
    estimatedMonthlyCost,
    priceDeltaEur,
    breakdown,
    keySpecs,
  } = recommendation
  const href = `/vehicles/${vehicle.id}`
  const compareHref = `/compare?ids=${encodeURIComponent(vehicle.id)}`
  const image = vehicle.image || VEHICLE_PLACEHOLDER_IMAGE
  const unavailable = t.recommendCard.unavailable
  const primarySpecs = [
    { label: t.recommendCard.realRange, value: formatSpec(keySpecs.realRangeKm, 'km', numberLocale, unavailable) },
    { label: t.recommendCard.fastDc, value: formatSpec(keySpecs.dcChargeKw, 'kW', numberLocale, unavailable) },
    { label: t.recommendCard.charge10to80, value: formatSpec(keySpecs.charge10to80Min, 'min', numberLocale, unavailable) },
    { label: t.recommendCard.trunk, value: formatSpec(keySpecs.trunkLiters, 'L', numberLocale, unavailable) },
  ]
  const secondarySpecs = [
    { label: t.recommendCard.motorway, value: formatSpec(keySpecs.motorwayRangeKm, 'km', numberLocale, unavailable) },
    { label: t.recommendCard.usableBattery, value: formatSpec(keySpecs.usableBatteryKwh, 'kWh', numberLocale, unavailable) },
    { label: t.recommendCard.consumption, value: formatSpec(keySpecs.consumptionWhKm, 'Wh/km', numberLocale, unavailable) },
    { label: t.recommendCard.seats, value: formatSpec(keySpecs.seats, '', numberLocale, unavailable) },
  ]
  const plainSpecs = [
    {
      label: t.recommendCard.plainSpecs.range.label,
      value: translatedRange(keySpecs.realRangeKm, t),
      detail: formatSpec(keySpecs.realRangeKm, 'km', numberLocale, unavailable),
      icon: 'range' as const,
    },
    {
      label: t.recommendCard.plainSpecs.charging.label,
      value: translatedCharging(keySpecs.dcChargeKw, keySpecs.charge10to80Min, t),
      detail: [
        formatSpec(keySpecs.dcChargeKw, 'kW', numberLocale, unavailable),
        formatSpec(keySpecs.charge10to80Min, 'min', numberLocale, unavailable),
      ].join(' / '),
      icon: 'plug' as const,
    },
    {
      label: t.recommendCard.plainSpecs.cargo.label,
      value: translatedCargo(keySpecs.trunkLiters, t),
      detail: formatSpec(keySpecs.trunkLiters, 'L', numberLocale, unavailable),
      icon: 'cargo' as const,
    },
    {
      label: t.recommendCard.plainSpecs.efficiency.label,
      value: translatedEfficiency(keySpecs.consumptionWhKm, t),
      detail: formatSpec(keySpecs.consumptionWhKm, 'Wh/km', numberLocale, unavailable),
      icon: 'leaf' as const,
    },
  ]

  return (
    <article className="overflow-hidden rounded-lg border border-slate-200 bg-white shadow-sm transition hover:border-emerald-200 hover:shadow-md">
      <div className="grid gap-0 lg:grid-cols-[300px_1fr]">
        <div className="relative min-h-64 bg-slate-100">
          <Image
            src={image}
            alt={vehicle.displayName}
            fill
            className="object-cover"
            sizes="(max-width: 1024px) 100vw, 300px"
          />
          <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-slate-950/90 to-transparent p-4 pt-16">
            <div className="flex items-end justify-between gap-3">
              <div className="rounded-full bg-white px-3 py-1 text-sm font-bold text-slate-950">
                #{rank}
              </div>
              <div className="rounded-lg bg-emerald-500 px-4 py-2 text-right text-slate-950 shadow-sm">
                <p className="text-2xl font-black leading-none">{matchPercentage}%</p>
                <p className="text-[10px] font-bold uppercase tracking-wide">{t.recommendCard.match}</p>
              </div>
            </div>
          </div>
        </div>

        <div className="p-5 md:p-6">
          <div className="flex flex-col gap-4 xl:flex-row xl:items-start xl:justify-between">
            <div>
              <div className="flex flex-wrap items-center gap-2">
                <span className={`rounded-full border px-3 py-1 text-xs font-semibold ${confidenceClass(confidence)}`}>
                  {t.recommendCard.confidence[confidence]}
                </span>
                {tags.slice(0, 3).map((tag) => (
                  <span
                    key={tag}
                    className="rounded-full bg-blue-50 px-3 py-1 text-xs font-medium text-blue-700"
                  >
                    {tag}
                  </span>
                ))}
              </div>

              <h3 className="mt-3 text-2xl font-bold text-slate-950">
                <Link href={localizedHref(href)} className="hover:text-emerald-700">
                  {vehicle.displayName}
                </Link>
              </h3>
              <p className="mt-1 text-sm text-slate-500">
                {vehicle.segment || t.recommendCard.fallbackSegment} ·{' '}
                {vehicle.bodyType || t.recommendCard.fallbackBody} ·{' '}
                {vehicle.drivetrain || t.recommendCard.fallbackDrivetrain}
              </p>
            </div>

            <div className="rounded-lg border border-slate-200 bg-slate-50 p-4 text-sm text-slate-700 xl:min-w-56 xl:text-right">
              <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                {t.recommendCard.priceEstimate}
              </p>
              <p className="mt-1 text-xl font-bold text-slate-950">
                {formatCurrency(keySpecs.priceFromEur, numberLocale, unavailable)}
              </p>
              <p className="mt-1">
                ~{formatCurrency(estimatedMonthlyCost, numberLocale, unavailable)}/{t.recommendCard.monthlyEnergy}
              </p>
              {priceDeltaEur != null && (
                <p className={priceDeltaEur <= 0 ? 'mt-1 text-emerald-700' : 'mt-1 text-amber-700'}>
                  {priceDeltaEur <= 0
                    ? t.recommendCard.belowBudget.replace(
                        '{amount}',
                        formatCurrency(Math.abs(priceDeltaEur), numberLocale, unavailable)
                      )
                    : t.recommendCard.aboveBudget.replace(
                        '{amount}',
                        formatCurrency(priceDeltaEur, numberLocale, unavailable)
                      )}
                </p>
              )}
            </div>
          </div>

          {knowledgeMode === 'simple' ? (
            <div className="mt-5 grid gap-3 text-sm sm:grid-cols-2 xl:grid-cols-4">
              {plainSpecs.map((spec) => (
                <PlainSpec
                  key={spec.label}
                  label={spec.label}
                  value={spec.value}
                  detail={spec.detail}
                  icon={spec.icon}
                />
              ))}
            </div>
          ) : (
            <div className="mt-5 grid gap-3 text-sm sm:grid-cols-2 xl:grid-cols-4">
              {primarySpecs.map((spec) => (
                <Spec key={spec.label} label={spec.label} value={spec.value} prominent />
              ))}
            </div>
          )}

          {knowledgeMode === 'advanced' && (
            <div className="mt-3 grid gap-3 text-sm sm:grid-cols-2 xl:grid-cols-4">
              {secondarySpecs.map((spec) => (
                <Spec key={spec.label} label={spec.label} value={spec.value} />
              ))}
            </div>
          )}

          {tags.length > 3 && (
            <div className="mt-4 flex flex-wrap gap-2">
              {tags.slice(3).map((tag) => (
                <span key={tag} className="rounded-full bg-slate-100 px-3 py-1 text-xs font-medium text-slate-600">
                  {tag}
                </span>
              ))}
            </div>
          )}

          <div className={`mt-6 grid gap-6 ${knowledgeMode === 'advanced' ? 'lg:grid-cols-[1fr_280px]' : ''}`}>
            <div className="grid gap-4 md:grid-cols-2">
              <ReasonList title={t.recommendCard.whyItFits} items={reasons} tone="positive" emptyText={t.recommendCard.noRelevantAlerts} />
              <ReasonList title={t.recommendCard.watchOut} items={drawbacks} tone="warning" emptyText={t.recommendCard.noRelevantAlerts} />
            </div>

            {knowledgeMode === 'advanced' && (
              <div className="space-y-3 rounded-lg border border-slate-200 bg-slate-50 p-4">
                <p className="text-sm font-bold text-slate-950">{t.recommendCard.technicalScore}</p>
                {breakdown.map((item) => (
                  <BreakdownBar key={item.category} item={item} />
                ))}
              </div>
            )}
          </div>

          <div className="mt-6 flex flex-col gap-3 sm:flex-row">
            <Link
              href={localizedHref(href)}
              className="inline-flex justify-center rounded-lg bg-slate-950 px-5 py-3 text-sm font-semibold text-white transition hover:bg-slate-800"
            >
              {t.recommendCard.viewDetails}
            </Link>
            <Link
              href={localizedHref(compareHref)}
              className="inline-flex justify-center rounded-lg border border-slate-200 px-5 py-3 text-sm font-semibold text-slate-700 transition hover:border-slate-300"
            >
              {t.recommendCard.startComparison}
            </Link>
          </div>
        </div>
      </div>
    </article>
  )
}

function Spec({ label, value, prominent = false }: { label: string; value: string; prominent?: boolean }) {
  return (
    <div className={`rounded-lg border p-3 ${prominent ? 'border-emerald-100 bg-emerald-50' : 'border-slate-200 bg-slate-50'}`}>
      <p className="text-xs text-slate-500">{label}</p>
      <p className="mt-1 font-semibold text-slate-950">{value}</p>
    </div>
  )
}

function PlainSpec({
  label,
  value,
  detail,
  icon,
}: {
  label: string
  value: string
  detail: string
  icon: ResultIconName
}) {
  return (
    <div className="rounded-lg border border-emerald-100 bg-emerald-50 p-3">
      <div className="flex items-center gap-2">
        <ResultIcon name={icon} className="h-4 w-4 text-emerald-700" />
        <p className="text-xs font-medium text-emerald-700">{label}</p>
      </div>
      <p className="mt-1 font-bold text-slate-950">{value}</p>
      <p className="mt-1 text-xs text-slate-500">{detail}</p>
    </div>
  )
}

function ResultIcon({ name, className }: { name: ResultIconName; className?: string }) {
  const common = {
    className,
    fill: 'none',
    stroke: 'currentColor',
    strokeLinecap: 'round' as const,
    strokeLinejoin: 'round' as const,
    strokeWidth: 2,
    viewBox: '0 0 24 24',
    'aria-hidden': true,
  }

  const paths: Record<ResultIconName, React.ReactNode> = {
    range: <><path d="M5 12a7 7 0 0 1 14 0" /><path d="M12 12l4-4" /><path d="M4 19h16" /></>,
    plug: <><path d="M8 2v7" /><path d="M16 2v7" /><path d="M7 9h10v4a5 5 0 0 1-10 0z" /><path d="M12 18v4" /></>,
    cargo: <><path d="M3 7h18v11H3z" /><path d="M7 7V5h10v2" /><path d="M3 12h18" /></>,
    leaf: <><path d="M5 19c9 0 14-5 14-14-9 0-14 5-14 14z" /><path d="M5 19c3-5 7-8 14-14" /></>,
  }

  return <svg {...common}>{paths[name]}</svg>
}

function ReasonList({
  title,
  items,
  tone,
  emptyText,
}: {
  title: string
  items: string[]
  tone: 'positive' | 'warning'
  emptyText: string
}) {
  const marker = tone === 'positive' ? 'bg-emerald-500' : 'bg-amber-500'

  return (
    <div>
      <h4 className="text-sm font-bold text-slate-950">{title}</h4>
      {items.length > 0 ? (
        <ul className="mt-3 space-y-2">
          {items.map((item) => (
            <li key={item} className="flex gap-2 text-sm text-slate-600">
              <span className={`mt-2 h-1.5 w-1.5 shrink-0 rounded-full ${marker}`} />
              <span>{item}</span>
            </li>
          ))}
        </ul>
      ) : (
        <p className="mt-3 text-sm text-slate-500">
          {emptyText}
        </p>
      )}
    </div>
  )
}
