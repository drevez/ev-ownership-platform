import { NextResponse } from 'next/server'
import vehicles from '@/data/registry/vehicles.json'

export async function GET() {
  return NextResponse.json({ vehicles })
}