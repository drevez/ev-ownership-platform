'use client'

import { useTranslations } from '@/hooks/useTranslations'
import { ComparisonVehicle } from '@/types/comparison'

interface ComparisonBadgesSectionProps {
  vehicles: ComparisonVehicle[]
  gridClass: string
}

export function ComparisonBadgesSection({
  vehicles,
  gridClass,
}: ComparisonBadgesSectionProps) {

  const t = useTranslations()

  const hasAnyBadges = vehicles.some(
    (v) => v.badges && v.badges.length > 0
  )

  if (!hasAnyBadges) {
    return null
  }

  const getBadgeColor = (category: string) => {
    const colors: Record<string, string> = {
      range:
        'border-sky-200 bg-sky-50 text-sky-800',

      value:
        'border-emerald-200 bg-emerald-50 text-emerald-800',

      charging:
        'border-amber-200 bg-amber-50 text-amber-800',

      efficiency:
        'border-violet-200 bg-violet-50 text-violet-800',

      performance:
        'border-rose-200 bg-rose-50 text-rose-800',
    }

    return (
      colors[category] ||
      'border-slate-200 bg-slate-50 text-slate-700'
    )
  }

  const getBadgeIcon = (category: string) => {
    const icons: Record<string, string> = {
      range: '🛣️',
      value: '💰',
      charging: '⚡',
      efficiency: '♻️',
      performance: '🏎️',
    }

    return icons[category] || '⭐'
  }

  return (
    <section className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm md:p-6">
      <div className="mb-5 flex items-end justify-between gap-4">
        <h2 className="text-2xl font-bold tracking-tight text-slate-950">
          {t.comparisonBadges.title}
        </h2>
      </div>

      <div className={gridClass}>
        {vehicles.map((vehicle) => (
          <div
            key={vehicle.id}
            className="flex h-full flex-col rounded-lg border border-slate-200 bg-slate-50 p-4"
          >
            <h3 className="min-h-12 text-base font-bold leading-snug text-slate-950">
              {vehicle.displayName}
            </h3>

            <div className="mt-4 grid flex-1 content-start gap-3">
              {vehicle.badges && vehicle.badges.length > 0 ? (
                vehicle.badges.map((badge, idx) => (
                  <div
                    key={idx}
                    className={`${getBadgeColor(
                      badge.category
                    )} rounded-lg p-3 border flex items-start gap-3`}
                  >
                    <span className="text-xl flex-shrink-0 mt-0.5">
                      {getBadgeIcon(badge.category)}
                    </span>

                    <div className="min-w-0">
                      <p className="font-bold text-sm">
                        {badge.label}
                      </p>

                      {badge.description && (
                        <p className="text-xs opacity-80">
                          {badge.description}
                        </p>
                      )}
                    </div>
                  </div>
                ))
              ) : (
                <div className="rounded-lg border border-dashed border-slate-300 bg-white p-3 text-sm text-slate-500">
                  {t.comparisonBadges.noHighlights}
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
    </section>
  )
}
