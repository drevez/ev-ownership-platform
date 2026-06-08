import { NextResponse } from 'next/server'

import {
  buildRegistryEntryFromCore,
  upsertRegistryEntry,
  vehicleFolderExists,
  writeVehicleFiles,
  type VehicleFiles,
} from '@/lib/internalVehicleFiles'
import {
  internalApiUnauthorizedResponse,
  isInternalAuthorized,
} from '@/lib/internalAuth'

interface CreateVehicleBody {
  id?: string
  files?: VehicleFiles
}

export async function POST(request: Request) {
  if (!isInternalAuthorized(request)) {
    return internalApiUnauthorizedResponse()
  }

  try {
    const body = (await request.json()) as CreateVehicleBody
    const id = body.id
    const files = body.files

    if (!id || !files?.core) {
      return NextResponse.json({ error: 'Missing vehicle id or files.' }, { status: 400 })
    }

    if (await vehicleFolderExists(id)) {
      return NextResponse.json({ error: 'Vehicle already exists.' }, { status: 409 })
    }

    await writeVehicleFiles(id, files)
    await upsertRegistryEntry(buildRegistryEntryFromCore(files.core))

    return NextResponse.json({ ok: true, id })
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to create vehicle.' },
      { status: 400 }
    )
  }
}
