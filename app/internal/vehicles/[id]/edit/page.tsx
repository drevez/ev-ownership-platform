import Link from 'next/link'
import { notFound } from 'next/navigation'

import { VehicleDataEditor } from '@/components/internal/VehicleDataEditor'
import { readVehicleFiles } from '@/lib/internalVehicleFiles'

interface InternalVehicleEditPageProps {
  params: Promise<{ id: string }>
}

export const dynamic = 'force-dynamic'

export default async function InternalVehicleEditPage({
  params,
}: InternalVehicleEditPageProps) {
  const { id } = await params
  const files = await readVehicleFiles(id)

  if (!files) notFound()

  return (
    <main className="min-h-screen bg-slate-50 text-slate-950">
      <div className="mx-auto max-w-7xl px-6 py-10">
        <div className="mb-6 flex flex-wrap items-center gap-3 text-sm">
          <Link href="/internal/vehicles" className="text-emerald-700 hover:text-emerald-900">
            Vehicles
          </Link>
          <span className="text-slate-400">/</span>
          <Link href={`/internal/vehicles/${id}`} className="text-emerald-700 hover:text-emerald-900">
            {id}
          </Link>
          <span className="text-slate-400">/</span>
          <span className="text-slate-600">edit</span>
        </div>
        <VehicleDataEditor mode="edit" vehicleId={id} initialFiles={files} />
      </div>
    </main>
  )
}
