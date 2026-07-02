import fs from 'fs/promises'
import path from 'path'
import {
  readVehicleImageCandidates,
  type VehicleImageCandidate,
} from '@/lib/vehicleImageReview'

const REGISTRY_PATH = path.join(process.cwd(), 'data', 'registry', 'vehicles.json')
const CARS_DIR = path.join(process.cwd(), 'public', 'cars')
const PUBLIC_CARS_PREFIX = '/cars/'

interface RegistryEntry {
  id?: string
  brand?: string
  model?: string
  variant?: string
  heroImage?: string
}

export interface VehicleImageAuditRow {
  id: string
  brand: string
  model: string
  variant: string
  expectedPath: string
  filename: string
  exists: boolean
  candidate?: VehicleImageCandidate
}

export interface VehicleImageAuditResult {
  rows: VehicleImageAuditRow[]
  missing: VehicleImageAuditRow[]
  existing: VehicleImageAuditRow[]
  orphanFiles: string[]
  stats: {
    referenced: number
    existing: number
    missing: number
    orphanFiles: number
    pendingReview: number
    approved: number
    rejected: number
  }
}

function fallbackImagePath(id: string) {
  return `${PUBLIC_CARS_PREFIX}${id}.webp`
}

function imagePathForEntry(entry: RegistryEntry) {
  if (entry.heroImage?.startsWith(PUBLIC_CARS_PREFIX)) return entry.heroImage
  if (entry.id) return fallbackImagePath(entry.id)
  return ''
}

export async function auditVehicleImages(): Promise<VehicleImageAuditResult> {
  const [registryContent, carFiles, candidates] = await Promise.all([
    fs.readFile(REGISTRY_PATH, 'utf8'),
    fs.readdir(CARS_DIR).catch(() => []),
    readVehicleImageCandidates(),
  ])

  const registry = JSON.parse(registryContent) as RegistryEntry[]
  const availablePaths = new Set(
    carFiles
      .filter((file) => file.toLowerCase().endsWith('.webp'))
      .map((file) => `${PUBLIC_CARS_PREFIX}${file}`)
  )

  const rows = registry
    .filter((entry): entry is RegistryEntry & { id: string } => Boolean(entry.id))
    .map((entry): VehicleImageAuditRow => {
      const expectedPath = imagePathForEntry(entry)
      const candidate = candidates.find(
        (item) => item.vehicleId === entry.id && item.filename === path.basename(expectedPath)
      )
      return {
        id: entry.id,
        brand: entry.brand ?? '',
        model: entry.model ?? '',
        variant: entry.variant ?? '',
        expectedPath,
        filename: path.basename(expectedPath),
        exists: availablePaths.has(expectedPath),
        candidate,
      }
    })
    .sort((a, b) =>
      `${a.brand} ${a.model} ${a.variant}`.localeCompare(
        `${b.brand} ${b.model} ${b.variant}`,
        'pt'
      )
    )

  const referencedPaths = new Set(rows.map((row) => row.expectedPath))
  const orphanFiles = Array.from(availablePaths)
    .filter((filePath) => !referencedPaths.has(filePath))
    .sort((a, b) => a.localeCompare(b, 'pt'))
  const missing = rows.filter((row) => !row.exists)
  const existing = rows.filter((row) => row.exists)

  return {
    rows,
    missing,
    existing,
    orphanFiles,
    stats: {
      referenced: rows.length,
      existing: existing.length,
      missing: missing.length,
      orphanFiles: orphanFiles.length,
      pendingReview: rows.filter(
        (row) => row.candidate?.status === 'ai_selected_pending_review'
      ).length,
      approved: rows.filter((row) => row.candidate?.status === 'approved').length,
      rejected: rows.filter((row) => row.candidate?.status === 'rejected').length,
    },
  }
}
