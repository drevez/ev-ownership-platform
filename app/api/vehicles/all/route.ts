import { NextResponse } from 'next/server'
import { loadVehicleRegistry } from '@/lib/loadVehicle'

export async function GET() {
  return NextResponse.json({ vehicles: await loadVehicleRegistry() })
}
