import { NextResponse } from 'next/server'
import { loadVehicle } from '@/lib/loadVehicle'
import { normalizeVehicleForComparison } from '@/lib/normalizeVehicle'
import {
  buildComparisonApiResponse,
  normalizeComparisonSelection,
} from '@/lib/comparisonSelection'

export async function GET(request: Request) {
  try {
    const url = new URL(request.url)
    const selection = normalizeComparisonSelection(url.searchParams.getAll('ids'))

    if (selection.values.length === 0) {
      return NextResponse.json(buildComparisonApiResponse([], [], selection.rejected))
    }

    const vehicles = await Promise.all(
      selection.values.map(async (id) => {
        const vehicleData = await loadVehicle(id)
        if (!vehicleData) return null

        return normalizeVehicleForComparison(vehicleData)
      })
    )

    return NextResponse.json(
      buildComparisonApiResponse(
        selection.values,
        vehicles.filter((vehicle): vehicle is NonNullable<typeof vehicle> => vehicle != null),
        selection.rejected
      )
    )
  } catch (error) {
    console.error('Failed to load vehicles from API:', error)
    return NextResponse.json(
      { vehicles: [], requested: [], missing: [], rejected: [] },
      { status: 500 }
    )
  }
}
