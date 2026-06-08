import { NextResponse } from 'next/server'
import { getModelExplorerData } from '@/lib/models'

export async function GET() {
  const models = await getModelExplorerData()

  return NextResponse.json({ models })
}
