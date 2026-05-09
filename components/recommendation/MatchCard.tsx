import Link from 'next/link'
import Image from 'next/image'
import type { RecommendationResult } from '@/types/recommendation'

interface MatchCardProps {
  recommendation: RecommendationResult
}

export function MatchCard({ recommendation }: MatchCardProps) {
  const { vehicle, score, matchPercentage, reasons, tags, estimatedMonthlyCost, drawbacks } = recommendation
  const title = `${vehicle.brand ?? 'EV'} ${vehicle.model ?? ''}`.trim()
  const subtitle = vehicle.variant
    ? `${vehicle.variant} • ${vehicle.segment ?? 'EV'}`
    : vehicle.segment || 'Electric vehicle'
  const href = `/vehicles/${vehicle.id}`
  const heroImage = vehicle.heroImage || '/images/vehicle-placeholder.svg'

  // Extract key specs for the spec row
  const range = vehicle.efficiency?.estimatedRealRangeKm ?? 'N/A'
  const chargingSpeed = vehicle.charging?.dcMaxChargeKW ?? 'N/A'
  const drivetrain = vehicle.drivetrain ?? 'N/A'
  const bodyType = vehicle.bodyType ?? 'N/A'
  const acceleration = vehicle.efficiency?.acceleration0To100Kmh ?? 'N/A'

  const specRow = `${range}km • ${chargingSpeed}kW • ${drivetrain} • ${bodyType} • 0-100 ${acceleration}s`

  // Generate match quality language
  const getMatchQuality = () => {
    if (matchPercentage >= 90) return 'Excellent match'
    if (matchPercentage >= 80) return 'Great family EV'
    if (matchPercentage >= 70) return 'Strong apartment charging option'
    if (matchPercentage >= 60) return 'Ideal commuter EV'
    if (matchPercentage >= 50) return 'Long-distance capable'
    return 'Good value option'
  }

  return (
    <article className="max-w-2xl mx-auto rounded-3xl border border-slate-200 bg-white p-6 shadow-sm hover:shadow-md transition-shadow">
      <div className="flex flex-col gap-6">
        {/* Image and Header Section */}
        <div className="flex flex-col sm:flex-row gap-6">
          <div className="flex-shrink-0">
            <div className="relative w-full sm:w-48 h-36 rounded-2xl overflow-hidden bg-slate-100">
              <Image
                src={heroImage}
                alt={`${title} image`}
                fill
                className="object-cover"
                priority={false}
                onError={(e) => {
                  // Fallback to placeholder if image fails to load
                  const target = e.target as HTMLImageElement
                  target.src = '/images/vehicle-placeholder.svg'
                }}
              />
            </div>
          </div>

          <div className="flex-1 space-y-3">
            {/* Match Score and Quality */}
            <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-2">
              <div className="space-y-1">
                <p className="text-sm font-semibold text-slate-500">
                  {getMatchQuality()} • {matchPercentage}% match
                </p>
                <h3 className="text-xl font-bold text-slate-900">
                  <Link href={href} className="hover:text-slate-700">
                    {title}
                  </Link>
                </h3>
                <p className="text-sm text-slate-500">{subtitle}</p>
              </div>

              <div className="flex flex-col items-start sm:items-end gap-2">
                <div className="rounded-2xl bg-slate-100 px-3 py-2 text-center text-sm font-semibold text-slate-900">
                  {score} pts
                </div>
                <div className="text-sm text-slate-600">
                  ~€{estimatedMonthlyCost}/month charging
                </div>
              </div>
            </div>

            {/* Spec Row */}
            <div className="text-xs text-slate-500 font-medium bg-slate-50 rounded-lg px-3 py-2">
              {specRow}
            </div>
          </div>
        </div>

        {/* Tags */}
        {tags.length > 0 && (
          <div className="flex flex-wrap gap-2">
            {tags.map((tag, idx) => (
              <span
                key={idx}
                className="inline-flex items-center rounded-full bg-blue-50 px-3 py-1 text-xs font-medium text-blue-700"
              >
                {tag}
              </span>
            ))}
          </div>
        )}

        {/* Reasons and Drawbacks */}
        <div className="space-y-4">
          <div>
            <h4 className="text-sm font-semibold text-slate-900 mb-3">Why this vehicle?</h4>
            <div className="space-y-2">
              {reasons.slice(0, 3).map((reason, idx) => (
                <div
                  key={idx}
                  className="flex items-start gap-2 text-xs text-slate-700"
                >
                  <div className="w-1.5 h-1.5 rounded-full bg-green-500 mt-1.5 flex-shrink-0"></div>
                  <span>{reason}</span>
                </div>
              ))}
            </div>
          </div>

          {drawbacks.length > 0 && (
            <div>
              <h4 className="text-sm font-semibold text-slate-900 mb-3">Potential drawbacks</h4>
              <div className="space-y-2">
                {drawbacks.slice(0, 2).map((drawback, idx) => (
                  <div
                    key={idx}
                    className="flex items-start gap-2 text-xs text-slate-700"
                  >
                    <div className="w-1.5 h-1.5 rounded-full bg-amber-500 mt-1.5 flex-shrink-0"></div>
                    <span>{drawback}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* CTA Button */}
        <div className="pt-2">
          <Link
            href={href}
            className="inline-flex items-center justify-center w-full sm:w-auto rounded-xl bg-slate-900 px-6 py-3 text-sm font-semibold text-white transition hover:bg-slate-800"
          >
            View vehicle details
          </Link>
        </div>
      </div>
    </article>
  )
}
