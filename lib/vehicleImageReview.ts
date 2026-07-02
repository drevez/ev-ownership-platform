import fs from 'fs/promises'
import path from 'path'

export type VehicleImageReviewStatus =
  | 'ai_selected_pending_review'
  | 'approved'
  | 'rejected'

export interface VehicleImageCandidate {
  vehicleId: string
  filename: string
  expectedPath: string
  candidatePath?: string
  sourceUrl: string
  sourceImageUrl?: string
  sourceLabel?: string
  sourceType?: 'official_press' | 'manufacturer' | 'dealer' | 'editorial' | 'unknown'
  selectedBy: 'ai' | 'manual'
  selectedAt: string
  status: VehicleImageReviewStatus
  reviewedBy?: string
  reviewedAt?: string
  finalImagePath?: string
  finalImageCreatedAt?: string
  finalImageWidth?: number
  finalImageHeight?: number
  finalImageBytes?: number
  promotionError?: string
  notes?: string
}

interface VehicleImageCandidateManifest {
  candidates: VehicleImageCandidate[]
}

const MANIFEST_PATH = path.join(
  process.cwd(),
  'data',
  'internal',
  'vehicle-image-candidates.json'
)

function isReviewStatus(value: unknown): value is VehicleImageReviewStatus {
  return (
    value === 'ai_selected_pending_review' ||
    value === 'approved' ||
    value === 'rejected'
  )
}

function normalizeCandidate(value: unknown): VehicleImageCandidate | null {
  if (!value || typeof value !== 'object') return null
  const item = value as Record<string, unknown>

  if (
    typeof item.vehicleId !== 'string' ||
    typeof item.filename !== 'string' ||
    typeof item.expectedPath !== 'string' ||
    typeof item.sourceUrl !== 'string' ||
    !isReviewStatus(item.status)
  ) {
    return null
  }

  return {
    vehicleId: item.vehicleId,
    filename: item.filename,
    expectedPath: item.expectedPath,
    candidatePath: typeof item.candidatePath === 'string' ? item.candidatePath : undefined,
    sourceUrl: item.sourceUrl,
    sourceImageUrl: typeof item.sourceImageUrl === 'string' ? item.sourceImageUrl : undefined,
    sourceLabel: typeof item.sourceLabel === 'string' ? item.sourceLabel : undefined,
    sourceType: typeof item.sourceType === 'string'
      ? item.sourceType as VehicleImageCandidate['sourceType']
      : undefined,
    selectedBy: item.selectedBy === 'manual' ? 'manual' : 'ai',
    selectedAt: typeof item.selectedAt === 'string' ? item.selectedAt : '',
    status: item.status,
    reviewedBy: typeof item.reviewedBy === 'string' ? item.reviewedBy : undefined,
    reviewedAt: typeof item.reviewedAt === 'string' ? item.reviewedAt : undefined,
    finalImagePath: typeof item.finalImagePath === 'string' ? item.finalImagePath : undefined,
    finalImageCreatedAt: typeof item.finalImageCreatedAt === 'string'
      ? item.finalImageCreatedAt
      : undefined,
    finalImageWidth: typeof item.finalImageWidth === 'number' ? item.finalImageWidth : undefined,
    finalImageHeight: typeof item.finalImageHeight === 'number' ? item.finalImageHeight : undefined,
    finalImageBytes: typeof item.finalImageBytes === 'number' ? item.finalImageBytes : undefined,
    promotionError: typeof item.promotionError === 'string' ? item.promotionError : undefined,
    notes: typeof item.notes === 'string' ? item.notes : undefined,
  }
}

export async function readVehicleImageCandidates(): Promise<VehicleImageCandidate[]> {
  try {
    const content = await fs.readFile(MANIFEST_PATH, 'utf8')
    const parsed = JSON.parse(content) as Partial<VehicleImageCandidateManifest>
    if (!Array.isArray(parsed.candidates)) return []

    return parsed.candidates
      .map(normalizeCandidate)
      .filter((candidate): candidate is VehicleImageCandidate => candidate != null)
  } catch {
    return []
  }
}

export async function writeVehicleImageCandidates(
  candidates: VehicleImageCandidate[]
) {
  await fs.mkdir(path.dirname(MANIFEST_PATH), { recursive: true })
  await fs.writeFile(
    MANIFEST_PATH,
    `${JSON.stringify({ candidates }, null, 2)}\n`
  )
}

export async function updateVehicleImageCandidateStatus({
  vehicleId,
  filename,
  status,
  reviewedBy = 'internal',
}: {
  vehicleId: string
  filename: string
  status: VehicleImageReviewStatus
  reviewedBy?: string
}) {
  const candidates = await readVehicleImageCandidates()
  const index = candidates.findIndex(
    (candidate) =>
      candidate.vehicleId === vehicleId && candidate.filename === filename
  )

  if (index < 0) {
    throw new Error('Image candidate not found.')
  }

  const candidate = candidates[index]
  const shouldClearFinalAsset = status !== 'approved' && candidate.finalImagePath

  if (shouldClearFinalAsset) {
    await fs.unlink(carsOutputPath(candidate)).catch((error: NodeJS.ErrnoException) => {
      if (error.code !== 'ENOENT') throw error
    })
  }

  candidates[index] = {
    ...candidate,
    status,
    reviewedBy,
    reviewedAt: new Date().toISOString(),
    finalImagePath: shouldClearFinalAsset ? undefined : candidate.finalImagePath,
    finalImageCreatedAt: shouldClearFinalAsset
      ? undefined
      : candidate.finalImageCreatedAt,
    finalImageWidth: shouldClearFinalAsset ? undefined : candidate.finalImageWidth,
    finalImageHeight: shouldClearFinalAsset ? undefined : candidate.finalImageHeight,
    finalImageBytes: shouldClearFinalAsset ? undefined : candidate.finalImageBytes,
    promotionError: status === 'approved' ? undefined : candidate.promotionError,
  }

  await writeVehicleImageCandidates(candidates)
}

function carsOutputPath(candidate: VehicleImageCandidate) {
  if (!candidate.expectedPath.startsWith('/cars/')) {
    throw new Error('Only /cars image paths can be promoted.')
  }

  const filename = path.basename(candidate.expectedPath)
  if (filename !== candidate.filename || !filename.endsWith('.webp')) {
    throw new Error('Candidate filename must match the expected WebP path.')
  }

  return path.join(process.cwd(), 'public', 'cars', filename)
}

async function readCandidateImage(candidate: VehicleImageCandidate) {
  if (candidate.candidatePath?.startsWith('/')) {
    return fs.readFile(path.join(process.cwd(), 'public', candidate.candidatePath))
  }

  const remoteUrl = candidate.sourceImageUrl
  if (!remoteUrl || !/^https?:\/\//.test(remoteUrl)) {
    throw new Error('Candidate needs a direct sourceImageUrl or local candidatePath.')
  }

  const response = await fetch(remoteUrl, {
    headers: {
      accept: 'image/avif,image/webp,image/apng,image/svg+xml,image/*,*/*;q=0.8',
      'user-agent': 'MotorZero internal image review',
    },
  })

  if (!response.ok) {
    throw new Error(`Could not download image candidate (${response.status}).`)
  }

  const contentType = response.headers.get('content-type') ?? ''
  if (contentType && !contentType.startsWith('image/')) {
    throw new Error(`Downloaded file is not an image (${contentType}).`)
  }

  return Buffer.from(await response.arrayBuffer())
}

export async function promoteVehicleImageCandidate({
  vehicleId,
  filename,
  reviewedBy = 'internal',
}: {
  vehicleId: string
  filename: string
  reviewedBy?: string
}) {
  const candidates = await readVehicleImageCandidates()
  const index = candidates.findIndex(
    (candidate) =>
      candidate.vehicleId === vehicleId && candidate.filename === filename
  )

  if (index < 0) {
    throw new Error('Image candidate not found.')
  }

  const candidate = candidates[index]
  const outputPath = carsOutputPath(candidate)

  try {
    const { default: sharp } = await import('sharp')
    const originalBuffer = await readCandidateImage(candidate)
    const finalBuffer = await sharp(originalBuffer)
      .rotate()
      .resize(2048, 1152, {
        fit: 'cover',
        position: 'attention',
        withoutEnlargement: true,
      })
      .webp({ quality: 82, effort: 5 })
      .toBuffer()

    const metadata = await sharp(finalBuffer).metadata()
    await fs.mkdir(path.dirname(outputPath), { recursive: true })
    await fs.writeFile(outputPath, finalBuffer)

    candidates[index] = {
      ...candidate,
      status: 'approved',
      reviewedBy,
      reviewedAt: new Date().toISOString(),
      finalImagePath: candidate.expectedPath,
      finalImageCreatedAt: new Date().toISOString(),
      finalImageWidth: metadata.width,
      finalImageHeight: metadata.height,
      finalImageBytes: finalBuffer.byteLength,
      promotionError: undefined,
    }

    await writeVehicleImageCandidates(candidates)

    return candidates[index]
  } catch (error) {
    candidates[index] = {
      ...candidate,
      promotionError: error instanceof Error ? error.message : 'Unknown promotion error.',
    }
    await writeVehicleImageCandidates(candidates)
    throw error
  }
}
