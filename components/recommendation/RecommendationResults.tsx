'use client'

import { MatchCard } from './MatchCard'
import type { RecommendationResult } from '@/types/recommendation'
import { useTranslations } from '@/hooks/useTranslations'

interface RecommendationResultsProps {
  recommendations: RecommendationResult[]
  knowledgeMode: 'simple' | 'advanced'
}

export function RecommendationResults({
  recommendations,
  knowledgeMode,
}: RecommendationResultsProps) {
  const t = useTranslations()

  if (recommendations.length === 0) {
    return (
      <div className="rounded-lg border border-dashed border-slate-300 bg-white p-8 text-slate-500 shadow-sm">
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <p className="text-xl font-bold text-slate-950">
              {t.recommendResults.emptyTitle}
            </p>
            <p className="mt-2 max-w-2xl text-sm leading-6">
              {t.recommendResults.emptyDescription}
            </p>
          </div>
          <div className="grid grid-cols-3 gap-2 text-center text-xs font-semibold text-slate-600">
            <span className="rounded-md bg-slate-100 px-3 py-2">{t.recommendCard.realRange}</span>
            <span className="rounded-md bg-slate-100 px-3 py-2">{t.recommendCard.fastDc}</span>
            <span className="rounded-md bg-slate-100 px-3 py-2">{t.recommendCard.trunk}</span>
          </div>
        </div>
      </div>
    )
  }

  const best = recommendations[0]
  const topThree = recommendations.slice(0, 3)

  return (
    <section className="space-y-6">
      <div className="overflow-hidden rounded-lg border border-emerald-200 bg-white shadow-sm">
        <div className="grid gap-0 lg:grid-cols-[1fr_360px]">
          <div className="bg-emerald-50 p-6 text-emerald-950 md:p-7">
            <p className="text-sm font-semibold uppercase tracking-wide">
              {t.recommendResults.bestMatch}
            </p>
            <div className="mt-3 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
              <div>
                <h2 className="text-3xl font-bold">
                  {best.vehicle.displayName}
                </h2>
                <p className="mt-2 max-w-2xl text-sm leading-6 text-emerald-800">
                  {t.recommendResults.bestDescription
                    .replace('{match}', String(best.matchPercentage))
                    .replace('{confidence}', t.recommendCard.confidence[best.confidence])}
                </p>
              </div>
              <div className="shrink-0 rounded-lg bg-white px-5 py-4 text-center shadow-sm">
                <p className="text-4xl font-black text-emerald-700">{best.matchPercentage}%</p>
                <p className="text-xs font-semibold uppercase tracking-wide text-emerald-900">
                  {t.recommendCard.match}
                </p>
              </div>
            </div>
          </div>

          <div className="border-t border-emerald-100 p-5 lg:border-l lg:border-t-0">
            <p className="text-sm font-bold text-slate-950">{t.recommendResults.topMatches}</p>
            <div className="mt-3 space-y-2">
              {topThree.map((recommendation, index) => (
                <div
                  key={recommendation.vehicle.id}
                  className="grid grid-cols-[36px_1fr_auto] items-center gap-3 rounded-md bg-slate-50 px-3 py-2"
                >
                  <span className="font-mono text-sm font-bold text-slate-500">#{index + 1}</span>
                  <span className="truncate text-sm font-semibold text-slate-800">
                    {recommendation.vehicle.displayName}
                  </span>
                  <span className="text-sm font-bold text-emerald-700">
                    {recommendation.matchPercentage}%
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      <div className="grid gap-5">
        {recommendations.map((recommendation, index) => (
          <MatchCard
            key={recommendation.vehicle.id}
            recommendation={recommendation}
            rank={index + 1}
            knowledgeMode={knowledgeMode}
          />
        ))}
      </div>
    </section>
  )
}
