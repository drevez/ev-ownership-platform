import Link from 'next/link'

import {
  auditVehicleImages,
  type VehicleImageAuditRow,
} from '@/lib/vehicleImageAudit'
import type { VehicleImageReviewStatus } from '@/lib/vehicleImageReview'

export const dynamic = 'force-dynamic'

type CandidateFilter = 'attention' | 'approved' | 'rejected' | 'all'
type CandidateSort = 'attention' | 'brand' | 'status' | 'recent'

const imageSpec = [
  ['Format', 'WebP'],
  ['Folder', 'public/cars/'],
  ['Target size', '2048 x 1152 px'],
  ['Minimum size', '1200 x 675 px'],
  ['Aspect ratio', '16:9 preferred'],
  ['Color', 'sRGB'],
  ['File size', 'Aim under 300-500 KB when possible'],
  ['Accepted angle', 'Exterior side profile or 3/4 exterior view only'],
  ['Framing', 'Car centered, full vehicle visible, with safe crop space'],
  ['Avoid', 'Front-only, rear-only, interior, detail shots, watermarks, text overlays, dealer branding, screenshots, heavy crops'],
] as const

function buildImagePrompt(filenames: string[]) {
  return `Find or prepare exterior car images for a Next.js car comparison website.

Requirements:
- One image per listed filename.
- Save as WebP.
- Target size 2048x1152 px, minimum 1200x675 px.
- Use clean manufacturer press/media style images where possible.
- Exterior car image only.
- Accepted angle: side profile or 3/4 exterior view.
- Reject front-only, rear-only, interior, wheel/detail, cropped, or lifestyle images where the full car is not clear.
- Car centered, with enough margin for responsive cropping.
- No watermarks, text overlays, dealership branding, screenshots, or distorted images.
- Filename must match exactly.
- Return a table with: filename, car, chosen angle, source URL, license/source note, original image size, final size.

Missing filenames:
${filenames.map((filename) => `- ${filename}`).join('\n')}`
}

function StatCard({
  label,
  value,
  hint,
}: {
  label: string
  value: number | string
  hint?: string
}) {
  return (
    <div className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
      <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
        {label}
      </p>
      <p className="mt-2 text-3xl font-bold text-slate-950">{value}</p>
      {hint && <p className="mt-2 text-sm text-slate-500">{hint}</p>}
    </div>
  )
}

function statusLabel(status?: VehicleImageReviewStatus) {
  if (status === 'approved') return 'Approved'
  if (status === 'rejected') return 'Rejected'
  if (status === 'ai_selected_pending_review') return 'AI selected - review'
  return 'No candidate'
}

function statusClass(status?: VehicleImageReviewStatus) {
  if (status === 'approved') return 'border-emerald-200 bg-emerald-50 text-emerald-700'
  if (status === 'rejected') return 'border-rose-200 bg-rose-50 text-rose-700'
  if (status === 'ai_selected_pending_review') return 'border-amber-200 bg-amber-50 text-amber-700'
  return 'border-slate-200 bg-slate-50 text-slate-500'
}

function candidatePreviewUrl(row: VehicleImageAuditRow) {
  return row.candidate?.candidatePath ?? row.candidate?.sourceImageUrl
}

function formatBytes(value?: number) {
  if (!value) return ''
  if (value < 1024) return `${value} B`
  const kb = value / 1024
  if (kb < 1024) return `${Math.round(kb)} KB`
  return `${(kb / 1024).toFixed(1)} MB`
}

function ReviewAction({
  row,
  status,
  children,
  tone,
  action,
}: {
  row: VehicleImageAuditRow
  status: VehicleImageReviewStatus
  children: React.ReactNode
  tone: 'approve' | 'publish' | 'reject' | 'reset'
  action?: 'promote'
}) {
  const className = {
    approve: 'border-emerald-600 bg-emerald-600 text-white hover:bg-emerald-700',
    publish: 'border-slate-950 bg-slate-950 text-white hover:bg-slate-800',
    reject: 'border-rose-200 bg-white text-rose-700 hover:border-rose-400 hover:bg-rose-50',
    reset: 'border-slate-200 bg-white text-slate-700 hover:border-slate-400 hover:bg-slate-50',
  }[tone]

  return (
    <form action="/api/internal/images/review" method="post">
      <input type="hidden" name="vehicleId" value={row.id} />
      <input type="hidden" name="filename" value={row.filename} />
      <input type="hidden" name="status" value={status} />
      <input type="hidden" name="returnTo" value="/internal/images" />
      {action && <input type="hidden" name="action" value={action} />}
      <button
        type="submit"
        className={`rounded-md border px-3 py-1.5 text-xs font-semibold transition ${className}`}
      >
        {children}
      </button>
    </form>
  )
}

function candidateNeedsAttention(row: VehicleImageAuditRow) {
  return (
    row.candidate?.status === 'ai_selected_pending_review' ||
    Boolean(row.candidate?.promotionError)
  )
}

function candidateFilterLabel(filter: CandidateFilter) {
  if (filter === 'attention') return 'Needs review'
  if (filter === 'approved') return 'Approved'
  if (filter === 'rejected') return 'Rejected'
  return 'All candidates'
}

function normalizeCandidateFilter(value?: string): CandidateFilter {
  if (value === 'approved' || value === 'rejected' || value === 'all') {
    return value
  }
  return 'attention'
}

function normalizeCandidateSort(value?: string): CandidateSort {
  if (value === 'brand' || value === 'status' || value === 'recent') {
    return value
  }
  return 'attention'
}

function filterCandidateRows(
  rows: VehicleImageAuditRow[],
  filter: CandidateFilter
) {
  if (filter === 'approved') {
    return rows.filter((row) => row.candidate?.status === 'approved')
  }
  if (filter === 'rejected') {
    return rows.filter((row) => row.candidate?.status === 'rejected')
  }
  if (filter === 'all') return rows

  return rows.filter(candidateNeedsAttention)
}

function sortCandidateRows(
  rows: VehicleImageAuditRow[],
  sort: CandidateSort
) {
  const statusRank: Record<VehicleImageReviewStatus, number> = {
    ai_selected_pending_review: 0,
    rejected: 1,
    approved: 2,
  }

  return [...rows].sort((a, b) => {
    if (sort === 'recent') {
      return (
        Date.parse(b.candidate?.selectedAt ?? '') -
        Date.parse(a.candidate?.selectedAt ?? '')
      )
    }

    if (sort === 'status') {
      const statusDelta =
        statusRank[a.candidate?.status ?? 'approved'] -
        statusRank[b.candidate?.status ?? 'approved']
      if (statusDelta !== 0) return statusDelta
    }

    if (sort === 'attention') {
      const attentionDelta =
        Number(candidateNeedsAttention(b)) - Number(candidateNeedsAttention(a))
      if (attentionDelta !== 0) return attentionDelta
    }

    return `${a.brand} ${a.model} ${a.variant}`.localeCompare(
      `${b.brand} ${b.model} ${b.variant}`,
      'pt'
    )
  })
}

function filterHref(filter: CandidateFilter, sort: CandidateSort) {
  const params = new URLSearchParams()
  if (filter !== 'attention') params.set('imageFilter', filter)
  if (sort !== 'attention') params.set('imageSort', sort)
  const query = params.toString()
  return query ? `/internal/images?${query}` : '/internal/images'
}

function FilterLink({
  filter,
  activeFilter,
  sort,
  count,
}: {
  filter: CandidateFilter
  activeFilter: CandidateFilter
  sort: CandidateSort
  count: number
}) {
  const isActive = filter === activeFilter
  return (
    <Link
      href={filterHref(filter, sort)}
      className={`rounded-full border px-3 py-1.5 text-xs font-semibold transition ${
        isActive
          ? 'border-slate-950 bg-slate-950 text-white'
          : 'border-slate-200 bg-white text-slate-600 hover:border-emerald-500 hover:text-emerald-800'
      }`}
    >
      {candidateFilterLabel(filter)}
      <span className={isActive ? 'ml-2 text-white/70' : 'ml-2 text-slate-400'}>
        {count}
      </span>
    </Link>
  )
}

function CandidateActions({ row }: { row: VehicleImageAuditRow }) {
  const status = row.candidate?.status
  const hasFinalAsset = Boolean(row.candidate?.finalImagePath)

  if (status === 'approved' && hasFinalAsset) {
    return (
      <div className="space-y-3">
        <div className="rounded-md border border-emerald-200 bg-emerald-50 px-3 py-2 text-xs font-semibold text-emerald-800">
          Approved and final WebP created
        </div>
        <div className="flex flex-wrap gap-2">
          <ReviewAction row={row} status="ai_selected_pending_review" tone="reset">
            Replace final image
          </ReviewAction>
          <ReviewAction row={row} status="rejected" tone="reject">
            Reject and remove final
          </ReviewAction>
        </div>
      </div>
    )
  }

  if (status === 'approved') {
    return (
      <div className="space-y-3">
        <div className="rounded-md border border-emerald-200 bg-emerald-50 px-3 py-2 text-xs font-semibold text-emerald-800">
          Approved, final WebP not created yet
        </div>
        <div className="flex flex-wrap gap-2">
          <ReviewAction row={row} status="approved" tone="publish" action="promote">
            Create WebP
          </ReviewAction>
          <ReviewAction row={row} status="ai_selected_pending_review" tone="reset">
            Replace final image
          </ReviewAction>
          <ReviewAction row={row} status="rejected" tone="reject">
            Reject
          </ReviewAction>
        </div>
      </div>
    )
  }

  if (status === 'rejected') {
    return (
      <div className="space-y-3">
        <div className="rounded-md border border-rose-200 bg-rose-50 px-3 py-2 text-xs font-semibold text-rose-800">
          Rejected, not used as a final asset
        </div>
        <ReviewAction row={row} status="ai_selected_pending_review" tone="reset">
          Back to review
        </ReviewAction>
      </div>
    )
  }

  return (
    <div className="flex flex-wrap gap-2">
      <ReviewAction row={row} status="approved" tone="publish" action="promote">
        Approve + create WebP
      </ReviewAction>
      <ReviewAction row={row} status="approved" tone="approve">
        Approve only
      </ReviewAction>
      <ReviewAction row={row} status="rejected" tone="reject">
        Reject
      </ReviewAction>
    </div>
  )
}

interface InternalImagesPageProps {
  searchParams: Promise<{
    imageError?: string
    imageFilter?: string
    imageSort?: string
    imageUpdated?: string
  }>
}

export default async function InternalImagesPage({
  searchParams,
}: InternalImagesPageProps) {
  const query = await searchParams
  const audit = await auditVehicleImages()
  const prompt = buildImagePrompt(audit.missing.map((row) => row.filename))
  const candidateRows = audit.rows.filter((row) => row.candidate)
  const activeFilter = normalizeCandidateFilter(query.imageFilter)
  const activeSort = normalizeCandidateSort(query.imageSort)
  const candidateCounts = {
    attention: candidateRows.filter(candidateNeedsAttention).length,
    approved: candidateRows.filter((row) => row.candidate?.status === 'approved').length,
    rejected: candidateRows.filter((row) => row.candidate?.status === 'rejected').length,
    all: candidateRows.length,
  }
  const visibleCandidateRows = sortCandidateRows(
    filterCandidateRows(candidateRows, activeFilter),
    activeSort
  )

  return (
    <main className="min-h-screen bg-slate-50 text-slate-950">
      <div className="mx-auto max-w-7xl px-6 py-10">
        <div className="mb-8 flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.24em] text-emerald-700">
              Internal
            </p>
            <h1 className="mt-2 text-4xl font-bold">Vehicle Images</h1>
            <p className="mt-3 max-w-3xl text-slate-600">
              Track expected car image files, missing assets, orphan files, and
              the exact prompt/spec to request new images.
            </p>
          </div>

          <div className="rounded-lg border border-slate-200 bg-white px-4 py-3 text-sm text-slate-700 shadow-sm">
            Add files to <span className="font-mono">public/cars/</span>
          </div>
        </div>

        <div className="mb-8 flex flex-wrap gap-3">
          <Link
            href="/internal"
            className="rounded-md border border-slate-300 bg-white px-4 py-2 text-sm font-semibold text-slate-700 hover:border-emerald-500 hover:text-emerald-800"
          >
            Internal home
          </Link>
          <Link
            href="/internal/vehicles"
            className="rounded-md border border-slate-300 bg-white px-4 py-2 text-sm font-semibold text-slate-700 hover:border-emerald-500 hover:text-emerald-800"
          >
            Vehicle data
          </Link>
        </div>

        <section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <StatCard label="Referenced images" value={audit.stats.referenced} />
          <StatCard label="Available" value={audit.stats.existing} />
          <StatCard label="Missing" value={audit.stats.missing} hint="These will use fallback images." />
          <StatCard label="Orphan files" value={audit.stats.orphanFiles} hint="Files in /cars not referenced by registry." />
          <StatCard label="AI pending review" value={audit.stats.pendingReview} hint="Selected but not approved by you." />
          <StatCard label="Approved candidates" value={audit.stats.approved} hint="Editorially approved in the manifest." />
          <StatCard label="Rejected candidates" value={audit.stats.rejected} />
        </section>

        <section className="mt-8 grid gap-6 lg:grid-cols-[0.85fr_1.15fr]">
          <div className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
            <h2 className="text-lg font-bold">Image Spec</h2>
            <dl className="mt-4 divide-y divide-slate-100">
              {imageSpec.map(([label, value]) => (
                <div key={label} className="grid grid-cols-[9rem_1fr] gap-4 py-3 text-sm">
                  <dt className="font-semibold text-slate-500">{label}</dt>
                  <dd className="text-slate-800">{value}</dd>
                </div>
              ))}
            </dl>
          </div>

          <div className="rounded-lg border border-slate-200 bg-slate-950 p-5 text-white shadow-sm">
            <div className="flex items-center justify-between gap-4">
              <h2 className="text-lg font-bold">Prompt For Image Work</h2>
              <span className="rounded-full bg-white/10 px-3 py-1 text-xs text-slate-200">
                {audit.stats.missing} files
              </span>
            </div>
            <pre className="mt-4 max-h-96 overflow-auto whitespace-pre-wrap rounded-md bg-black/30 p-4 text-xs leading-6 text-slate-100">
              {prompt}
            </pre>
          </div>
        </section>

        {audit.orphanFiles.length > 0 && (
          <section className="mt-8 rounded-lg border border-amber-200 bg-amber-50 p-5 text-amber-950">
            <h2 className="text-lg font-bold">Orphan Image Files</h2>
            <p className="mt-1 text-sm">
              These files exist in <span className="font-mono">public/cars</span> but are not referenced by the registry.
            </p>
            <div className="mt-4 flex flex-wrap gap-2">
              {audit.orphanFiles.map((filePath) => (
                <span key={filePath} className="rounded-full border border-amber-200 bg-white px-3 py-1 font-mono text-xs">
                  {filePath}
                </span>
              ))}
            </div>
          </section>
        )}

        <section className="mt-8 rounded-lg border border-slate-200 bg-white shadow-sm">
          <div className="border-b border-slate-200 p-5">
            <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
              <div>
                <h2 className="text-lg font-bold">Candidate Review</h2>
                <p className="mt-1 max-w-3xl text-sm text-slate-500">
                  Defaults to images that need a decision. Approved assets stay out of the way
                  unless you filter for them, and can still be replaced later.
                </p>
              </div>

              <form action="/internal/images" className="flex items-center gap-2 text-sm">
                {activeFilter !== 'attention' && (
                  <input type="hidden" name="imageFilter" value={activeFilter} />
                )}
                <label htmlFor="imageSort" className="font-semibold text-slate-500">
                  Sort
                </label>
                <select
                  id="imageSort"
                  name="imageSort"
                  defaultValue={activeSort}
                  className="rounded-md border border-slate-300 bg-white px-3 py-2 text-sm font-medium text-slate-700"
                >
                  <option value="attention">Needs attention first</option>
                  <option value="recent">Recently selected</option>
                  <option value="brand">Brand / model</option>
                  <option value="status">Status</option>
                </select>
                <button
                  type="submit"
                  className="rounded-md border border-slate-300 bg-white px-3 py-2 text-sm font-semibold text-slate-700 hover:border-emerald-500 hover:text-emerald-800"
                >
                  Apply
                </button>
              </form>
            </div>

            <div className="mt-5 flex flex-wrap gap-2">
              <FilterLink
                filter="attention"
                activeFilter={activeFilter}
                sort={activeSort}
                count={candidateCounts.attention}
              />
              <FilterLink
                filter="approved"
                activeFilter={activeFilter}
                sort={activeSort}
                count={candidateCounts.approved}
              />
              <FilterLink
                filter="rejected"
                activeFilter={activeFilter}
                sort={activeSort}
                count={candidateCounts.rejected}
              />
              <FilterLink
                filter="all"
                activeFilter={activeFilter}
                sort={activeSort}
                count={candidateCounts.all}
              />
            </div>
          </div>

          {query.imageError && (
            <div className="mx-5 mt-5 rounded-md border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-800">
              Image action failed: {query.imageError}
            </div>
          )}

          {query.imageUpdated && !query.imageError && (
            <div className="mx-5 mt-5 rounded-md border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-800">
              {query.imageUpdated === 'promoted'
                ? 'Approved and created the final WebP asset.'
                : 'Image review status updated.'}
            </div>
          )}

          {visibleCandidateRows.length === 0 ? (
            <div className="p-8 text-sm text-slate-500">
              No candidates in this view. Use the filters above to see approved,
              rejected, or all candidates.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full border-separate border-spacing-0 text-sm">
                <thead className="bg-slate-100 text-left text-xs uppercase tracking-wide text-slate-500">
                  <tr>
                    <th className="whitespace-nowrap px-4 py-3 font-semibold">Preview</th>
                    <th className="whitespace-nowrap px-4 py-3 font-semibold">Vehicle</th>
                    <th className="whitespace-nowrap px-4 py-3 font-semibold">Status</th>
                    <th className="whitespace-nowrap px-4 py-3 font-semibold">Source</th>
                    <th className="whitespace-nowrap px-4 py-3 font-semibold">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {visibleCandidateRows.map((row) => {
                    const previewUrl = candidatePreviewUrl(row)

                    return (
                      <tr key={`${row.id}-${row.filename}`} className="border-b border-slate-100 odd:bg-white even:bg-slate-50/60">
                        <td className="w-52 px-4 py-4 align-top">
                          {previewUrl ? (
                            <a href={previewUrl} target="_blank" rel="noreferrer" className="block">
                              {/* Candidate previews may be remote and unapproved, so avoid Next image optimization here. */}
                              {/* eslint-disable-next-line @next/next/no-img-element */}
                              <img
                                src={previewUrl}
                                alt={`${row.brand} ${row.model}`}
                                className="aspect-video w-48 rounded-md border border-slate-200 bg-slate-100 object-cover"
                              />
                            </a>
                          ) : (
                            <div className="flex aspect-video w-48 items-center justify-center rounded-md border border-dashed border-slate-300 bg-slate-50 text-xs text-slate-400">
                              Source only
                            </div>
                          )}
                        </td>
                        <td className="px-4 py-4 align-top">
                          <div className="font-semibold">{row.brand} {row.model}</div>
                          <div className="text-sm text-slate-600">{row.variant || 'Base'}</div>
                          <div className="mt-1 font-mono text-xs text-slate-500">{row.filename}</div>
                        </td>
                        <td className="whitespace-nowrap px-4 py-4 align-top">
                          <span className={`inline-flex rounded-full border px-2.5 py-1 text-xs font-semibold ${statusClass(row.candidate?.status)}`}>
                            {statusLabel(row.candidate?.status)}
                          </span>
                          <div className="mt-2 text-xs text-slate-500">
                            Selected by {row.candidate?.selectedBy ?? 'unknown'}
                          </div>
                        </td>
                        <td className="max-w-sm px-4 py-4 align-top">
                          {row.candidate?.sourceUrl ? (
                            <a
                              href={row.candidate.sourceUrl}
                              target="_blank"
                              rel="noreferrer"
                              className="break-words text-sm font-medium text-emerald-700 hover:text-emerald-900"
                            >
                              {row.candidate.sourceLabel || row.candidate.sourceUrl}
                            </a>
                          ) : (
                            <span className="text-sm text-slate-400">No source</span>
                          )}
                          {row.candidate?.notes && (
                            <p className="mt-2 text-xs text-slate-500">{row.candidate.notes}</p>
                          )}
                          {row.candidate?.finalImagePath && (
                            <div className="mt-3 rounded-md border border-emerald-200 bg-emerald-50 p-3 text-xs text-emerald-900">
                              <div className="font-semibold">Final asset created</div>
                              <div className="mt-1 font-mono">{row.candidate.finalImagePath}</div>
                              <div className="mt-1 text-emerald-800">
                                {row.candidate.finalImageWidth} x {row.candidate.finalImageHeight}
                                {row.candidate.finalImageBytes
                                  ? ` · ${formatBytes(row.candidate.finalImageBytes)}`
                                  : ''}
                              </div>
                            </div>
                          )}
                          {row.candidate?.promotionError && (
                            <p className="mt-2 rounded-md border border-rose-200 bg-rose-50 p-2 text-xs text-rose-700">
                              Last create attempt failed: {row.candidate.promotionError}
                            </p>
                          )}
                        </td>
                        <td className="px-4 py-4 align-top">
                          <CandidateActions row={row} />
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
          )}
        </section>

        <section className="mt-8 rounded-lg border border-slate-200 bg-white shadow-sm">
          <div className="border-b border-slate-200 p-5">
            <h2 className="text-lg font-bold">Missing Images</h2>
            <p className="mt-1 text-sm text-slate-500">
              Showing {audit.missing.length} missing image files. Use these exact filenames.
            </p>
          </div>

          <div className="overflow-x-auto">
            <table className="min-w-full border-separate border-spacing-0 text-sm">
              <thead className="bg-slate-100 text-left text-xs uppercase tracking-wide text-slate-500">
                <tr>
                  <th className="whitespace-nowrap px-4 py-3 font-semibold">Vehicle</th>
                  <th className="whitespace-nowrap px-4 py-3 font-semibold">Variant</th>
                  <th className="whitespace-nowrap px-4 py-3 font-semibold">Review</th>
                  <th className="whitespace-nowrap px-4 py-3 font-semibold">Expected file</th>
                  <th className="whitespace-nowrap px-4 py-3 font-semibold">Registry path</th>
                </tr>
              </thead>
              <tbody>
                {audit.missing.map((row) => (
                  <tr key={row.id} className="border-b border-slate-100 odd:bg-white even:bg-slate-50/60">
                    <td className="px-4 py-4 align-top">
                      <div className="font-semibold">{row.brand} {row.model}</div>
                      <div className="font-mono text-xs text-slate-500">{row.id}</div>
                    </td>
                    <td className="whitespace-nowrap px-4 py-4 align-top text-slate-700">
                      {row.variant || 'Base'}
                    </td>
                    <td className="whitespace-nowrap px-4 py-4 align-top">
                      <span className={`inline-flex rounded-full border px-2.5 py-1 text-xs font-semibold ${statusClass(row.candidate?.status)}`}>
                        {statusLabel(row.candidate?.status)}
                      </span>
                    </td>
                    <td className="whitespace-nowrap px-4 py-4 align-top font-mono text-xs text-slate-800">
                      {row.filename}
                    </td>
                    <td className="whitespace-nowrap px-4 py-4 align-top font-mono text-xs text-slate-500">
                      {row.expectedPath}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      </div>
    </main>
  )
}
