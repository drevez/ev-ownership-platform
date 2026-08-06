'use client'

import { useState, type FormEvent } from 'react'
import type {
  BodyPreference,
  CargoNeed,
  ChargingAccess,
  OwnershipPriority,
  OwnershipStyle,
  PurchaseType,
  QuizAnswers,
  RecommendationResult,
  RoadTripFrequency,
} from '@/types/recommendation'
import { RecommendationResults } from './RecommendationResults'
import { useLocale } from '@/context/LocaleContext'
import { useTranslations } from '@/hooks/useTranslations'
import { LANGUAGE_LOCALES } from '@/config/i18n'
import { pushGaEvent } from '@/lib/gaEvents'
import { trackEvent } from '@/lib/posthogClient'
import {
  buildPageContext,
  pageContextToFlatProperties,
  toAnalyticsVehicles,
  vehicleFlatProperties,
} from '@/lib/analytics'

type KnowledgeMode = 'simple' | 'advanced'
type IconName =
  | 'wallet'
  | 'car'
  | 'plug'
  | 'route'
  | 'users'
  | 'road'
  | 'cargo'
  | 'settings'
  | 'spark'

const defaultAnswers: QuizAnswers = {
  budget: 45000,
  purchaseType: 'either',
  chargingAccess: 'mixed',
  familySize: 2,
  dailyCommuteKm: 35,
  roadTrips: 'sometimes',
  cargoNeed: 'medium',
  bodyPreference: 'any',
  ownershipStyle: 'balanced',
  priorities: ['budget', 'range', 'charging'],
}

const priorities: OwnershipPriority[] = [
  'budget',
  'range',
  'charging',
  'space',
  'efficiency',
  'comfort',
]

function togglePriority(
  current: OwnershipPriority[],
  priority: OwnershipPriority
) {
  if (current.includes(priority)) {
    const next = current.filter((item) => item !== priority)
    return next.length > 0 ? next : current
  }

  return [...current, priority]
}

function budgetBand(value: number) {
  if (value < 20000) return 'under_20000'
  if (value < 30000) return '20000_30000'
  if (value < 45000) return '30000_45000'
  if (value < 60000) return '45000_60000'
  return '60000_plus'
}

function familySizeBand(value: number) {
  if (value <= 1) return 'one'
  if (value <= 2) return 'two'
  if (value <= 4) return 'three_four'
  return 'five_plus'
}

function tripFrequency(value: RoadTripFrequency) {
  return value
}

function FieldLabel({ children }: { children: React.ReactNode }) {
  return (
    <span className="text-sm font-semibold text-slate-800">
      {children}
    </span>
  )
}

export function QuizForm() {
  const { locale } = useLocale()
  const t = useTranslations()
  const [answers, setAnswers] = useState<QuizAnswers>(defaultAnswers)
  const [knowledgeMode, setKnowledgeMode] = useState<KnowledgeMode>('simple')
  const [results, setResults] = useState<RecommendationResult[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const numberLocale = LANGUAGE_LOCALES[locale]
  const selectedPriorityLabels = answers.priorities
    .map((priority) => t.recommendQuiz.priorityOptions[priority])
    .join(', ')
  const simpleQuestions = t.recommendQuiz.simpleQuestions
  const questionLabel = (advancedLabel: string, simpleLabel: string) =>
    knowledgeMode === 'simple' ? simpleLabel : advancedLabel

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setError(null)
    setLoading(true)
    const page = buildPageContext({
      path: window.location.pathname,
      canonicalPath: '/recommend',
      type: 'recommender',
      language: locale,
    })
    const recommendationContext = {
      knowledge_mode: knowledgeMode,
      budget_band: budgetBand(answers.budget),
      purchase_type: answers.purchaseType,
      charging_access: answers.chargingAccess,
      family_size_band: familySizeBand(answers.familySize),
      trip_frequency: tripFrequency(answers.roadTrips),
      cargo_need: answers.cargoNeed,
      body_preference: answers.bodyPreference,
      ownership_style: answers.ownershipStyle,
      priority_count: answers.priorities.length,
    }
    trackEvent('recommendation_started', {
      event_schema_version: 2,
      page,
      recommendation: recommendationContext,
      ...pageContextToFlatProperties(page),
      ...recommendationContext,
      purchase_type: answers.purchaseType,
    })

    try {
      const response = await fetch('/api/recommendations', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ ...answers, locale }),
      })

      if (!response.ok) {
        throw new Error('Recommendation request failed')
      }

      const data = (await response.json()) as {
        results?: RecommendationResult[]
      }

      const nextResults = data.results ?? []
      setResults(nextResults)
      const analyticsVehicles = toAnalyticsVehicles(
        nextResults.map((result) => result.vehicle)
      )
      const completedProperties = {
        event_schema_version: 2,
        page,
        recommendation: {
          ...recommendationContext,
          result_count: nextResults.length,
          top_vehicle_id: nextResults[0]?.vehicle.id,
          top_match_percentage: nextResults[0]?.matchPercentage,
        },
        vehicles: analyticsVehicles,
        result_count: nextResults.length,
        top_vehicle_id: nextResults[0]?.vehicle.id,
        top_brand: nextResults[0]?.vehicle.brand,
        top_match_percentage: nextResults[0]?.matchPercentage,
        knowledge_mode: knowledgeMode,
        ...pageContextToFlatProperties(page),
        ...vehicleFlatProperties(analyticsVehicles),
      }
      trackEvent('recommendation_completed', {
        ...completedProperties,
        top_vehicle_id: nextResults[0]?.vehicle.id,
        top_vehicle_name: nextResults[0]?.vehicle.displayName,
      })
      pushGaEvent('recommendation_completed', completedProperties)
    } catch {
      setError(t.recommendQuiz.error)
    } finally {
      setLoading(false)
    }
  }

  return (
    <section className="space-y-8">
      <form
        onSubmit={handleSubmit}
        className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_320px]"
      >
        <div className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm md:p-7">
          <div className="border-b border-slate-200 pb-6">
            <h2 className="text-2xl font-bold text-slate-950 md:text-3xl">
              {t.recommendQuiz.title}
            </h2>
            <p className="mt-2 max-w-3xl text-sm leading-6 text-slate-600">
              {t.recommendQuiz.description}
            </p>
            <div className="mt-5 rounded-lg border border-slate-200 bg-slate-50 p-3">
              <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
                <div>
                  <p className="text-sm font-bold text-slate-950">
                    {t.recommendQuiz.knowledgeLabel}
                  </p>
                  <p className="mt-1 text-sm text-slate-600">
                    {knowledgeMode === 'simple'
                      ? t.recommendQuiz.simpleModeDescription
                      : t.recommendQuiz.advancedModeDescription}
                  </p>
                </div>
                <SegmentedControl
                  value={knowledgeMode}
                  compact
                  options={[
                    { value: 'simple', label: t.recommendQuiz.simpleMode },
                    { value: 'advanced', label: t.recommendQuiz.advancedMode },
                  ]}
                  onChange={(value) => {
                    const nextMode = value as KnowledgeMode
                    setKnowledgeMode(nextMode)
                    const page = buildPageContext({
                      path: window.location.pathname,
                      canonicalPath: '/recommend',
                      type: 'recommender',
                      language: locale,
                    })
                    trackEvent('recommendation_mode_changed', {
                      event_schema_version: 2,
                      page,
                      recommendation: {
                        knowledge_mode: nextMode,
                      },
                      ...pageContextToFlatProperties(page),
                      knowledge_mode: nextMode,
                    })
                  }}
                />
              </div>
            </div>
          </div>

          <div className="mt-6 grid gap-5">
            {knowledgeMode === 'simple' && (
              <div className="rounded-lg border border-emerald-200 bg-emerald-50 p-4 text-sm leading-6 text-emerald-900">
                <p className="font-bold">{t.recommendQuiz.guidedIntroTitle}</p>
                <p className="mt-1">{t.recommendQuiz.guidedIntroDescription}</p>
              </div>
            )}

            <ControlBlock
              title={questionLabel(t.recommendQuiz.maxBudget, simpleQuestions.budget)}
              value={`${answers.budget.toLocaleString(numberLocale)} €`}
              help={t.recommendQuiz.fieldHelp.budget[knowledgeMode]}
              icon="wallet"
            >
              <div className="grid gap-3 sm:grid-cols-[1fr_150px] sm:items-center">
                <input
                  type="range"
                  min={15000}
                  max={150000}
                  step={1000}
                  value={answers.budget}
                  onChange={(event) =>
                    setAnswers((prev) => ({
                      ...prev,
                      budget: Number(event.target.value),
                    }))
                  }
                  className="accent-emerald-600"
                />
                <div className="flex items-center rounded-md border border-slate-200 bg-slate-50 px-3">
                  <span className="text-slate-500">€</span>
                  <input
                    type="number"
                    min={15000}
                    max={150000}
                    step={1000}
                    value={answers.budget}
                    onChange={(event) =>
                      setAnswers((prev) => ({
                        ...prev,
                        budget: Number(event.target.value),
                      }))
                    }
                    className="min-w-0 flex-1 bg-transparent px-2 py-2 text-sm font-semibold text-slate-950 outline-none"
                  />
                </div>
              </div>
            </ControlBlock>

            <div className="grid gap-5 xl:grid-cols-2">
              <ControlBlock
                title={questionLabel(t.recommendQuiz.purchase, simpleQuestions.purchase)}
                help={t.recommendQuiz.fieldHelp.purchase[knowledgeMode]}
                icon="car"
              >
                <SegmentedControl
                  value={answers.purchaseType}
                  options={[
                    { value: 'either', label: t.recommendQuiz.purchaseOptions.either },
                    { value: 'new', label: t.recommendQuiz.purchaseOptions.new },
                    { value: 'used', label: t.recommendQuiz.purchaseOptions.used },
                  ]}
                  onChange={(purchaseType) =>
                    setAnswers((prev) => ({ ...prev, purchaseType: purchaseType as PurchaseType }))
                  }
                />
              </ControlBlock>

              <ControlBlock
                title={questionLabel(t.recommendQuiz.chargingAccess, simpleQuestions.charging)}
                help={t.recommendQuiz.fieldHelp.charging[knowledgeMode]}
                icon="plug"
              >
                <SegmentedControl
                  value={answers.chargingAccess}
                  options={[
                    { value: 'home', label: t.recommendQuiz.chargingOptions.home },
                    { value: 'work', label: t.recommendQuiz.chargingOptions.work },
                    { value: 'public', label: t.recommendQuiz.chargingOptions.public },
                    { value: 'mixed', label: t.recommendQuiz.chargingOptions.mixed },
                  ]}
                  onChange={(chargingAccess) =>
                    setAnswers((prev) => ({ ...prev, chargingAccess: chargingAccess as ChargingAccess }))
                  }
                />
              </ControlBlock>
            </div>

            <div className="grid gap-5 xl:grid-cols-2">
              <ControlBlock
                title={questionLabel(t.recommendQuiz.dailyCommute, simpleQuestions.dailyCommute)}
                value={`${answers.dailyCommuteKm} ${t.recommendQuiz.kmPerDay}`}
                help={t.recommendQuiz.fieldHelp.dailyCommute[knowledgeMode]}
                icon="route"
              >
                <input
                  type="range"
                  min={0}
                  max={250}
                  step={5}
                  value={answers.dailyCommuteKm}
                  onChange={(event) =>
                    setAnswers((prev) => ({
                      ...prev,
                      dailyCommuteKm: Number(event.target.value),
                    }))
                  }
                  className="w-full accent-emerald-600"
                />
              </ControlBlock>

              <ControlBlock
                title={questionLabel(t.recommendQuiz.peopleInCar, simpleQuestions.people)}
                value={String(answers.familySize)}
                help={t.recommendQuiz.fieldHelp.people[knowledgeMode]}
                icon="users"
              >
                <div className="flex items-center gap-3">
                  <button
                    type="button"
                    onClick={() =>
                      setAnswers((prev) => ({
                        ...prev,
                        familySize: Math.max(1, prev.familySize - 1),
                      }))
                    }
                    className="h-10 w-10 rounded-md border border-slate-200 bg-white text-lg font-semibold text-slate-700 hover:border-emerald-500"
                  >
                    -
                  </button>
                  <input
                    type="range"
                    min={1}
                    max={8}
                    value={answers.familySize}
                    onChange={(event) =>
                      setAnswers((prev) => ({
                        ...prev,
                        familySize: Number(event.target.value),
                      }))
                    }
                    className="min-w-0 flex-1 accent-emerald-600"
                  />
                  <button
                    type="button"
                    onClick={() =>
                      setAnswers((prev) => ({
                        ...prev,
                        familySize: Math.min(8, prev.familySize + 1),
                      }))
                    }
                    className="h-10 w-10 rounded-md border border-slate-200 bg-white text-lg font-semibold text-slate-700 hover:border-emerald-500"
                  >
                    +
                  </button>
                </div>
              </ControlBlock>
            </div>

            <div className="grid gap-5 xl:grid-cols-2">
              <ControlBlock
                title={questionLabel(t.recommendQuiz.roadTrips, simpleQuestions.roadTrips)}
                help={t.recommendQuiz.fieldHelp.roadTrips[knowledgeMode]}
                icon="road"
              >
                <SegmentedControl
                  value={answers.roadTrips}
                  options={[
                    { value: 'rarely', label: t.recommendQuiz.roadTripOptions.rarely },
                    { value: 'sometimes', label: t.recommendQuiz.roadTripOptions.sometimes },
                    { value: 'often', label: t.recommendQuiz.roadTripOptions.often },
                  ]}
                  onChange={(roadTrips) =>
                    setAnswers((prev) => ({ ...prev, roadTrips: roadTrips as RoadTripFrequency }))
                  }
                />
              </ControlBlock>

              <ControlBlock
                title={questionLabel(t.recommendQuiz.cargoNeed, simpleQuestions.cargo)}
                help={t.recommendQuiz.fieldHelp.cargo[knowledgeMode]}
                icon="cargo"
              >
                <SegmentedControl
                  value={answers.cargoNeed}
                  options={[
                    { value: 'light', label: t.recommendQuiz.cargoOptions.light },
                    { value: 'medium', label: t.recommendQuiz.cargoOptions.medium },
                    { value: 'large', label: t.recommendQuiz.cargoOptions.large },
                  ]}
                  onChange={(cargoNeed) =>
                    setAnswers((prev) => ({ ...prev, cargoNeed: cargoNeed as CargoNeed }))
                  }
                />
              </ControlBlock>
            </div>

            {knowledgeMode === 'advanced' ? (
              <>
                <ControlBlock
                  title={t.recommendQuiz.bodyPreference}
                  help={t.recommendQuiz.fieldHelp.body.advanced}
                  icon="car"
                >
                  <SegmentedControl
                    value={answers.bodyPreference}
                    options={[
                      { value: 'any', label: t.recommendQuiz.bodyOptions.any },
                      { value: 'hatchback', label: t.recommendQuiz.bodyOptions.hatchback },
                      { value: 'sedan', label: t.recommendQuiz.bodyOptions.sedan },
                      { value: 'suv', label: t.recommendQuiz.bodyOptions.suv },
                      { value: 'wagon', label: t.recommendQuiz.bodyOptions.wagon },
                      { value: 'mpv', label: t.recommendQuiz.bodyOptions.mpv },
                    ]}
                    onChange={(bodyPreference) =>
                      setAnswers((prev) => ({ ...prev, bodyPreference: bodyPreference as BodyPreference }))
                    }
                  />
                </ControlBlock>

                <ControlBlock
                  title={t.recommendQuiz.decisionStyle}
                  help={t.recommendQuiz.fieldHelp.decisionStyle.advanced}
                  icon="settings"
                >
                  <SegmentedControl
                    value={answers.ownershipStyle}
                    options={[
                      { value: 'lowest_cost', label: t.recommendQuiz.ownershipOptions.lowest_cost },
                      { value: 'balanced', label: t.recommendQuiz.ownershipOptions.balanced },
                      { value: 'premium', label: t.recommendQuiz.ownershipOptions.premium },
                    ]}
                    onChange={(ownershipStyle) =>
                      setAnswers((prev) => ({ ...prev, ownershipStyle: ownershipStyle as OwnershipStyle }))
                    }
                  />
                </ControlBlock>

                <div className="rounded-lg border border-slate-200 bg-white p-4">
                  <div className="flex items-start justify-between gap-3">
                    <FieldLabel>{t.recommendQuiz.priorities}</FieldLabel>
                    <HelpText text={t.recommendQuiz.fieldHelp.priorities.advanced} />
                  </div>
                  <div className="mt-3 flex flex-wrap gap-2">
                    {priorities.map((priority) => {
                      const selected = answers.priorities.includes(priority)

                      return (
                        <button
                          key={priority}
                          type="button"
                          onClick={() =>
                            setAnswers((prev) => ({
                              ...prev,
                              priorities: togglePriority(prev.priorities, priority),
                            }))
                          }
                          className={`rounded-full border px-4 py-2 text-sm font-medium transition ${
                            selected
                              ? 'border-emerald-500 bg-emerald-50 text-emerald-800'
                              : 'border-slate-200 bg-slate-50 text-slate-600 hover:border-slate-300'
                          }`}
                        >
                          {t.recommendQuiz.priorityOptions[priority]}
                        </button>
                      )
                    })}
                  </div>
                </div>
              </>
            ) : (
              <div className="rounded-lg border border-emerald-200 bg-emerald-50 p-4 text-sm text-emerald-950">
                <p className="font-bold">{t.recommendQuiz.simpleAssumptionsTitle}</p>
                <ul className="mt-2 space-y-1 text-emerald-800">
                  {t.recommendQuiz.simpleAssumptions.map((item) => (
                    <li key={item}>- {item}</li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        </div>

        <aside className="lg:sticky lg:top-24 lg:self-start">
          <div className="rounded-lg border border-slate-200 bg-slate-950 p-5 text-white shadow-sm">
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-emerald-300">
              {t.recommendQuiz.profileSummary}
            </p>
            <div className="mt-5 space-y-3">
              <SummaryRow label={t.recommendQuiz.maxBudget} value={`${answers.budget.toLocaleString(numberLocale)} €`} />
              <SummaryRow label={t.recommendQuiz.purchase} value={t.recommendQuiz.purchaseOptions[answers.purchaseType]} />
              <SummaryRow label={t.recommendQuiz.chargingAccess} value={t.recommendQuiz.chargingOptions[answers.chargingAccess]} />
              <SummaryRow label={t.recommendQuiz.dailyCommute} value={`${answers.dailyCommuteKm} ${t.recommendQuiz.kmPerDay}`} />
              <SummaryRow label={t.recommendQuiz.roadTrips} value={t.recommendQuiz.roadTripOptions[answers.roadTrips]} />
              <SummaryRow
                label={t.recommendQuiz.knowledgeLabel}
                value={knowledgeMode === 'simple' ? t.recommendQuiz.simpleMode : t.recommendQuiz.advancedMode}
              />
              {knowledgeMode === 'advanced' && (
                <SummaryRow label={t.recommendQuiz.priorities} value={selectedPriorityLabels} />
              )}
            </div>

            <button
              type="submit"
              disabled={loading}
              className="mt-6 inline-flex w-full items-center justify-center rounded-md bg-emerald-500 px-5 py-3 text-sm font-bold text-slate-950 transition hover:bg-emerald-400 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {loading ? t.recommendQuiz.loading : t.recommendQuiz.submit}
            </button>

            <p className="mt-3 text-sm leading-6 text-slate-300">
              {t.recommendQuiz.helper}
            </p>

            {error && (
              <p className="mt-4 rounded-md bg-rose-100 px-4 py-3 text-sm text-rose-800">
                {error}
              </p>
            )}
          </div>
        </aside>
      </form>

      <RecommendationResults recommendations={results} knowledgeMode={knowledgeMode} />
    </section>
  )
}

function ControlBlock({
  title,
  value,
  help,
  icon,
  children,
}: {
  title: string
  value?: string
  help?: string
  icon?: IconName
  children: React.ReactNode
}) {
  return (
    <div className="rounded-lg border border-slate-200 bg-slate-50 p-4">
      <div className="mb-3 flex items-center justify-between gap-3">
        <div className="flex items-start gap-2">
          {icon && <Icon name={icon} className="mt-0.5 h-4 w-4 text-emerald-700" />}
          <FieldLabel>{title}</FieldLabel>
          {help && <HelpText text={help} />}
        </div>
        {value && (
          <span className="rounded-full bg-white px-3 py-1 text-sm font-bold text-slate-950 shadow-sm">
            {value}
          </span>
        )}
      </div>
      {children}
    </div>
  )
}

function Icon({ name, className }: { name: IconName; className?: string }) {
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

  const paths: Record<IconName, React.ReactNode> = {
    wallet: <><path d="M3 7h18v13H3z" /><path d="M16 12h5v4h-5z" /><path d="M3 7l3-4h12l3 4" /></>,
    car: <><path d="M5 17h14l-1.5-6h-11z" /><path d="M7 11l2-4h6l2 4" /><path d="M7 17v2" /><path d="M17 17v2" /></>,
    plug: <><path d="M8 2v7" /><path d="M16 2v7" /><path d="M7 9h10v4a5 5 0 0 1-10 0z" /><path d="M12 18v4" /></>,
    route: <><path d="M6 19a3 3 0 1 0 0-6 3 3 0 0 0 0 6z" /><path d="M18 11a3 3 0 1 0 0-6 3 3 0 0 0 0 6z" /><path d="M8.5 15.5c4-1 3-7 7-8" /></>,
    users: <><path d="M16 21v-2a4 4 0 0 0-8 0v2" /><path d="M12 11a4 4 0 1 0 0-8 4 4 0 0 0 0 8z" /><path d="M20 21v-2a3 3 0 0 0-2-2.8" /></>,
    road: <><path d="M8 22l2-20" /><path d="M16 22 14 2" /><path d="M12 6v2" /><path d="M12 12v2" /><path d="M12 18v2" /></>,
    cargo: <><path d="M3 7h18v11H3z" /><path d="M7 7V5h10v2" /><path d="M3 12h18" /></>,
    settings: <><path d="M12 15a3 3 0 1 0 0-6 3 3 0 0 0 0 6z" /><path d="M19.4 15a1.7 1.7 0 0 0 .3 1.9l.1.1-2 3-.2-.1a1.7 1.7 0 0 0-2 .2 1.7 1.7 0 0 0-.8 1.6V22h-3.6v-.3a1.7 1.7 0 0 0-.8-1.6 1.7 1.7 0 0 0-2-.2l-.2.1-2-3 .1-.1A1.7 1.7 0 0 0 4.6 15 1.7 1.7 0 0 0 3 14H2v-4h1a1.7 1.7 0 0 0 1.6-1 1.7 1.7 0 0 0-.3-1.9l-.1-.1 2-3 .2.1a1.7 1.7 0 0 0 2-.2A1.7 1.7 0 0 0 9.2 2V2h5.6v.3a1.7 1.7 0 0 0 .8 1.6 1.7 1.7 0 0 0 2 .2l.2-.1 2 3-.1.1a1.7 1.7 0 0 0-.3 1.9A1.7 1.7 0 0 0 21 10h1v4h-1a1.7 1.7 0 0 0-1.6 1z" /></>,
    spark: <><path d="M12 2l1.8 6.2L20 10l-6.2 1.8L12 18l-1.8-6.2L4 10l6.2-1.8z" /></>,
  }

  return <svg {...common}>{paths[name]}</svg>
}

function SegmentedControl({
  value,
  options,
  onChange,
  compact = false,
}: {
  value: string
  options: { value: string; label: string }[]
  onChange: (value: string) => void
  compact?: boolean
}) {
  return (
    <div className={`grid gap-2 ${compact ? 'grid-cols-2 md:min-w-80' : 'sm:grid-cols-3'}`}>
      {options.map((option) => {
        const selected = option.value === value

        return (
          <button
            key={option.value}
            type="button"
            onClick={() => onChange(option.value)}
            className={`min-h-11 rounded-md border px-3 py-2 text-sm font-semibold transition ${
              selected
                ? 'border-slate-950 bg-slate-950 text-white'
                : 'border-slate-200 bg-white text-slate-700 hover:border-emerald-500'
            }`}
          >
            {option.label}
          </button>
        )
      })}
    </div>
  )
}

function HelpText({ text }: { text: string }) {
  return (
    <span className="group relative inline-flex">
      <button
        type="button"
        aria-label={text}
        className="flex h-6 w-6 items-center justify-center rounded-full border border-slate-300 bg-white text-xs font-bold text-slate-500 transition hover:border-emerald-500 hover:text-emerald-700 focus:outline-none focus:ring-2 focus:ring-emerald-500/30"
      >
        ?
      </button>
      <span className="pointer-events-none absolute left-0 top-8 z-10 hidden w-[min(18rem,calc(100vw-3rem))] rounded-md border border-slate-200 bg-white p-3 text-xs leading-5 text-slate-600 shadow-lg group-hover:block group-focus-within:block">
        {text}
      </span>
    </span>
  )
}

function SummaryRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="border-b border-white/10 pb-3 last:border-b-0 last:pb-0">
      <p className="text-xs text-slate-400">{label}</p>
      <p className="mt-1 text-sm font-semibold text-white">{value}</p>
    </div>
  )
}
