import Link from 'next/link'

import { VehicleDataEditor } from '@/components/internal/VehicleDataEditor'
import { readVehicleFiles, type VehicleFiles } from '@/lib/internalVehicleFiles'
import type { JsonObject } from '@/lib/loadVehicle'

export const dynamic = 'force-dynamic'

interface NewInternalVehiclePageProps {
  searchParams: Promise<{ copyFrom?: string | string[] }>
}

function copyFromParam(value: string | string[] | undefined) {
  return Array.isArray(value) ? value[0] : value
}

function prepareCopiedVehicle(files: VehicleFiles): VehicleFiles {
  return {
    ...files,
    core: {
      ...files.core,
      id: '',
      image: '',
      copiedFromId: files.core.id,
    } as JsonObject,
  }
}

export default async function NewInternalVehiclePage({
  searchParams,
}: NewInternalVehiclePageProps) {
  const copyFrom = copyFromParam((await searchParams).copyFrom)
  const copiedFiles = copyFrom ? await readVehicleFiles(copyFrom) : null
  const initialFiles = copiedFiles ? prepareCopiedVehicle(copiedFiles) : undefined

  return (
    <main className="min-h-screen bg-slate-50 text-slate-950">
      <div className="mx-auto max-w-7xl px-6 py-10">
        <div className="mb-6 flex flex-wrap items-center gap-3 text-sm">
          <Link href="/internal/vehicles" className="text-emerald-700 hover:text-emerald-900">
            Vehicles
          </Link>
          <span className="text-slate-400">/</span>
          <span className="text-slate-600">new</span>
        </div>
        {copyFrom && !copiedFiles && (
          <div className="mb-6 rounded-lg border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-800">
            Could not find vehicle to copy from: <span className="font-mono">{copyFrom}</span>
          </div>
        )}
        <VehicleDataEditor
          mode="create"
          initialFiles={initialFiles}
          copySourceId={copiedFiles ? copyFrom : undefined}
        />
      </div>
    </main>
  )
}
