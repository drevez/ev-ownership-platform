import { NextResponse } from 'next/server'
import { loadVehicle } from '@/lib/loadVehicle'
import { normalizeVehicleForComparison } from '@/lib/normalizeVehicle'

export async function GET(request: Request) {
  try {
    const url = new URL(request.url)
    const ids = url.searchParams.getAll('ids')

    if (ids.length === 0) {
      return NextResponse.json({ vehicles: [] })
    }

    const vehicles = await Promise.all(
      ids.map(async (id) => {
        const vehicleData = await loadVehicle(id)
        if (!vehicleData) return null

        return normalizeVehicleForComparison(vehicleData)
      })
    )

    return NextResponse.json({ vehicles: vehicles.filter(Boolean) })
  } catch (error) {
    console.error('Failed to load vehicles from API:', error)
    return NextResponse.json({ vehicles: [] }, { status: 500 })
  }
}
