import { MatchCard } from './MatchCard'
import type { RecommendationResult } from '@/types/recommendation'

interface RecommendationResultsProps {
  recommendations: RecommendationResult[]
}

export function RecommendationResults({
  recommendations
}: RecommendationResultsProps) {
  if (recommendations.length === 0) {
    return (
      <div className="rounded-3xl border border-dashed border-slate-200 bg-slate-50 p-8 text-slate-500">
        <p className="text-lg font-medium">
          Submit the quiz to see your top EV matches.
        </p>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {recommendations.map((recommendation, index) => (
        <MatchCard
          key={`${recommendation.vehicle.id}-${index}`}
          recommendation={recommendation}
        />
      ))}
    </div>
  )
}
