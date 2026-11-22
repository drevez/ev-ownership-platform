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

interface UpdateVehicleBody {
  revision?: number
  files?: VehicleFiles
}

interface VehicleRouteContext {
  params: Promise<{ id: string }>
}

export async function PUT(request: Request, { params }: VehicleRouteContext) {
  if (!isInternalAuthorized(request)) {
    return internalApiUnauthorizedResponse()
  }

  try {
    const { id } = await params
    const body = (await request.json()) as UpdateVehicleBody

    if (!body.files?.core) {
      return NextResponse.json({ error: 'Missing files.' }, { status: 400 })
    }

    if (!(await vehicleFolderExists(id))) {
      return NextResponse.json({ error: 'Vehicle not found.' }, { status: 404 })
    }

    const structuralErrors = validateVehicleFiles(id, body.files)
      .filter((issue) => issue.severity === 'error')
    if (structuralErrors.length > 0) {
      return NextResponse.json(
        { error: 'Vehicle data has structural errors.', issues: structuralErrors },
        { status: 400 }
      )
    }

    const revision = await saveVehicleFiles(id, body.files, {
      mode: 'update', revision: body.revision, actor: process.env.INTERNAL_AUTH_USERNAME ?? 'internal',
    })

    return NextResponse.json({ ok: true, id, revision })
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to update vehicle.' },
      { status: typeof error === 'object' && error !== null && 'code' in error && (error.code === 'PT409' || error.code === '23505') ? 409 : 400 }
    )
  }
}
