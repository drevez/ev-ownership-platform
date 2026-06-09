'use client'

import type { ComparisonVehicle } from '@/types/comparison'
import { ComparisonBadgesSection } from './ComparisonBadgesSection'
import { ComparisonMetricsTable } from './ComparisonMetricsTable'
import { ComparisonSummary } from './ComparisonSummary'

export function AdvancedComparisonContent({
  vehicles,
  gridClass,
}: {
  vehicles: ComparisonVehicle[]
  gridClass: string
}) {
  return (
    <>
      <ComparisonBadgesSection vehicles={vehicles} gridClass={gridClass} />
      <ComparisonSummary vehicles={vehicles} gridClass={gridClass} />
      <ComparisonMetricsTable vehicles={vehicles} />
    </>
  )
}
