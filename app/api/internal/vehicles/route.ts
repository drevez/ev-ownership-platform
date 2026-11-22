import { NextResponse } from 'next/server'

import {
  saveVehicleFiles,
  vehicleFolderExists,
  type VehicleFiles,
} from '@/lib/internalVehicleFiles'
import {
  internalApiUnauthorizedResponse,
  isInternalAuthorized,
} from '@/lib/internalAuth'
import { validateVehicleFiles } from '@/lib/vehicleDataValidation'

interface CreateVehicleBody {
  id?: string
  revision?: number
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

    const structuralErrors = validateVehicleFiles(id, files)
      .filter((issue) => issue.severity === 'error')
    if (structuralErrors.length > 0) {
      return NextResponse.json(
        { error: 'Vehicle data has structural errors.', issues: structuralErrors },
        { status: 400 }
      )
    }

    const revision = await saveVehicleFiles(id, files, {
      mode: 'create', revision: body.revision, actor: process.env.INTERNAL_AUTH_USERNAME ?? 'internal',
    })

    return NextResponse.json({ ok: true, id, revision })
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to create vehicle.' },
      { status: typeof error === 'object' && error !== null && 'code' in error && (error.code === 'PT409' || error.code === '23505') ? 409 : 400 }
    )
  }
}
