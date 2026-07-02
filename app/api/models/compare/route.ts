import { NextResponse } from 'next/server'
import {
  getModelExplorerData,
  mapModelExplorerItemToComparisonVehicle,
} from '@/lib/models'
import {
  buildComparisonApiResponse,
  normalizeComparisonSelection,
} from '@/lib/comparisonSelection'

export async function GET(request: Request) {
  try {
    const url = new URL(request.url)
    const selection = normalizeComparisonSelection(url.searchParams.getAll('models'))

    if (selection.values.length === 0) {
      return NextResponse.json(buildComparisonApiResponse([], [], selection.rejected))
    }

    const models = await getModelExplorerData()
    const selected = selection.values
      .map((slug) => models.find((model) => model.slug === slug))
      .filter((model): model is NonNullable<typeof model> => model != null)
      .map(mapModelExplorerItemToComparisonVehicle)

    return NextResponse.json(
      buildComparisonApiResponse(
        selection.values,
        selected,
        selection.rejected,
        (vehicle) => vehicle.id.replace(/^model:/, '')
      )
    )
  } catch (error) {
    console.error('Failed to load models for comparison:', error)
    return NextResponse.json(
      { vehicles: [], requested: [], missing: [], rejected: [] },
      { status: 500 }
    )
  }
}
