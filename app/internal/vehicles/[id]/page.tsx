import Link from 'next/link'
import { notFound } from 'next/navigation'

import { auditVehicles } from '@/lib/vehicleAudit'
import { readVehicleFiles } from '@/lib/internalVehicleFiles'

interface InternalVehicleDetailPageProps {
  params: Promise<{ id: string }>
}

export const dynamic = 'force-dynamic'

export default async function InternalVehicleDetailPage({
  params,
}: InternalVehicleDetailPageProps) {
  const { id } = await params
  const [files, audit] = await Promise.all([
    readVehicleFiles(id),
    auditVehicles(),
  ])

  if (!files) notFound()

  const row = audit.rows.find((item) => item.id === id)

  return (
    <main className="min-h-screen bg-slate-50 text-slate-950">
      <div className="mx-auto max-w-7xl px-6 py-10">
        <div className="mb-6 flex flex-wrap items-center gap-3 text-sm">
          <Link href="/internal/vehicles" className="text-emerald-700 hover:text-emerald-900">
            Vehicles
          </Link>
          <span className="text-slate-400">/</span>
          <span className="font-mono text-slate-600">{id}</span>
        </div>

        <section className="rounded-lg border border-slate-200 bg-white p-6 shadow-sm">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
            <div>
              <p className="text-sm font-semibold uppercase tracking-[0.24em] text-emerald-700">
                Internal vehicle
              </p>
              <h1 className="mt-2 text-3xl font-bold">
                {[files.core.brand, files.core.model, files.core.variant].filter(Boolean).join(' ')}
              </h1>
              <p className="mt-2 font-mono text-sm text-slate-500">{id}</p>
            </div>
            <div className="flex flex-wrap gap-2">
              <Link
                href={`/internal/vehicles/${id}/edit`}
                className="rounded-md bg-emerald-600 px-4 py-2 text-sm font-semibold text-white hover:bg-emerald-700"
              >
                Edit vehicle
              </Link>
              <Link
                href={`/internal/vehicles/new?copyFrom=${id}`}
                className="rounded-md border border-slate-300 px-4 py-2 text-sm font-semibold text-slate-700 hover:border-emerald-500"
              >
                Duplicate as new
              </Link>
              <Link
                href={`/pt/veiculos/${id}`}
                className="rounded-md border border-slate-300 px-4 py-2 text-sm font-semibold text-slate-700 hover:border-emerald-500"
              >
                Public page
              </Link>
            </div>
          </div>
        </section>

        {row && (
          <section className="mt-6 grid gap-4 md:grid-cols-2">
            <StatusCard
              title="Public status"
              value={row.publicStatus === 'ready' ? 'Public ready' : 'Public incomplete'}
              items={row.publicIssues}
            />
            <StatusCard
              title="Verification status"
              value={row.verificationStatus === 'verified' ? 'Verified' : 'Needs review'}
              items={[...row.verificationIssues, ...row.pricingTags]}
            />
            <StatusCard
              title="Structural validation"
              value={
                row.structuralErrorCount > 0
                  ? `${row.structuralErrorCount} errors`
                  : `${row.structuralWarningCount} warnings`
              }
              items={row.structuralIssues.map(
                (issue) => `${issue.severity}: ${issue.path} - ${issue.message}`
              )}
            />
          </section>
        )}

        <section className="mt-6 rounded-lg border border-slate-200 bg-white p-6 shadow-sm">
          <h2 className="text-lg font-bold">Files preview</h2>
          <div className="mt-4 grid gap-4 lg:grid-cols-2">
            {Object.entries(files).map(([name, data]) => (
              <details key={name} className="rounded-md border border-slate-200 bg-slate-50">
                <summary className="cursor-pointer px-4 py-3 font-semibold">{name}.json</summary>
                <pre className="max-h-96 overflow-auto border-t border-slate-200 bg-slate-950 p-4 text-xs text-slate-100">
                  {JSON.stringify(data, null, 2)}
                </pre>
              </details>
            ))}
          </div>
        </section>
      </div>
    </main>
  )
}

function StatusCard({
  title,
  value,
  items,
}: {
  title: string
  value: string
  items: string[]
}) {
  return (
    <div className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
      <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">{title}</p>
      <p className="mt-2 text-2xl font-bold text-slate-950">{value}</p>
      {items.length > 0 ? (
        <ul className="mt-4 space-y-1 text-sm text-slate-600">
          {items.map((item) => <li key={item}>- {item}</li>)}
        </ul>
      ) : (
        <p className="mt-4 text-sm text-slate-500">No issues found.</p>
      )}
    </div>
  )
}
