import { NextResponse } from 'next/server'
import {
  getModelExplorerData,
  mapModelExplorerItemToComparisonVehicle,
} from '@/lib/models'

export async function GET(request: Request) {
  try {
    const url = new URL(request.url)
    const slugs = url.searchParams.getAll('models')

    if (slugs.length === 0) {
      return NextResponse.json({ vehicles: [] })
    }

    const models = await getModelExplorerData()
    const selected = slugs
      .map((slug) => models.find((model) => model.slug === slug))
      .filter((model): model is NonNullable<typeof model> => model != null)
      .map(mapModelExplorerItemToComparisonVehicle)

    return NextResponse.json({ vehicles: selected })
  } catch (error) {
    console.error('Failed to load models for comparison:', error)
    return NextResponse.json({ vehicles: [] }, { status: 500 })
  }
}
