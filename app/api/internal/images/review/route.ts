import { NextResponse } from 'next/server'

import {
  internalApiUnauthorizedResponse,
  isInternalAuthorized,
} from '@/lib/internalAuth'
import {
  promoteVehicleImageCandidate,
  updateVehicleImageCandidateStatus,
  type VehicleImageReviewStatus,
} from '@/lib/vehicleImageReview'

export const runtime = 'nodejs'

function isStatus(value: unknown): value is VehicleImageReviewStatus {
  return (
    value === 'ai_selected_pending_review' ||
    value === 'approved' ||
    value === 'rejected'
  )
}

function safeReturnTo(value: FormDataEntryValue | null) {
  if (typeof value !== 'string') return '/internal/images'
  if (!value.startsWith('/') || value.startsWith('//')) return '/internal/images'
  if (!/(^\/internal(?:\/|$)|^\/(?:pt|en|es)\/internal(?:\/|$))/.test(value)) {
    return '/internal/images'
  }
  return value
}

export async function POST(request: Request) {
  if (!isInternalAuthorized(request)) {
    return internalApiUnauthorizedResponse()
  }

  const formData = await request.formData()
  const vehicleId = formData.get('vehicleId')
  const filename = formData.get('filename')
  const status = formData.get('status')
  const action = formData.get('action')
  const returnTo = safeReturnTo(formData.get('returnTo'))

  if (
    typeof vehicleId !== 'string' ||
    typeof filename !== 'string' ||
    !isStatus(status)
  ) {
    return NextResponse.json({ error: 'Invalid image review payload.' }, { status: 400 })
  }

  try {
    if (action === 'promote') {
      await promoteVehicleImageCandidate({
        vehicleId,
        filename,
      })
    } else {
      await updateVehicleImageCandidateStatus({
        vehicleId,
        filename,
        status,
      })
    }
  } catch (error) {
    const redirectUrl = new URL(returnTo, request.url)
    redirectUrl.searchParams.set(
      'imageError',
      error instanceof Error ? error.message : 'Could not update image candidate.'
    )
    return NextResponse.redirect(redirectUrl, { status: 303 })
  }

  const redirectUrl = new URL(returnTo, request.url)
  redirectUrl.searchParams.set(
    'imageUpdated',
    action === 'promote' ? 'promoted' : 'review'
  )
  return NextResponse.redirect(redirectUrl, { status: 303 })
}
