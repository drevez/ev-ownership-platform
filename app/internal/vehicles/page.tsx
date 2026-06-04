import Link from 'next/link'
import { auditVehicles, type VehicleAuditRow } from '@/lib/vehicleAudit'

export const dynamic = 'force-dynamic'

type SortKey =
  | 'id'
  | 'brand'
  | 'model'
  | 'status'
  | 'completeness'
  | 'issues'

type FilterKey =
  | 'all'
  | 'ok'
  | 'needs_fix'
  | 'public_ready'
  | 'public_incomplete'
  | 'verified'
  | 'needs_review'
  | 'missing_price'
  | 'legacy_pricing'
  | 'offers_pricing'
  | 'missing_price_source'
  | 'missing_price_source_url'
  | 'missing_price_year'
  | 'low_confidence_price'
  | 'missing_translation'
  | 'missing_image'

interface InternalVehiclesPageProps {
  searchParams: Promise<{
    sort?: string
    dir?: string
    filter?: string
    brand?: string
  }>
}

const sortLabels: Record<SortKey, string> = {
  id: 'ID',
  brand: 'Brand',
  model: 'Model',
  status: 'Status',
  completeness: 'Completeness',
  issues: 'Issues',
}

function getSort(value?: string): SortKey {
  if (
    value === 'id' ||
    value === 'brand' ||
    value === 'model' ||
    value === 'status' ||
    value === 'completeness' ||
    value === 'issues'
  ) {
    return value
  }

  return 'status'
}

function getFilter(value?: string): FilterKey {
  if (
    value === 'ok' ||
    value === 'needs_fix' ||
    value === 'public_ready' ||
    value === 'public_incomplete' ||
    value === 'verified' ||
    value === 'needs_review' ||
    value === 'missing_price' ||
    value === 'legacy_pricing' ||
    value === 'offers_pricing' ||
    value === 'missing_price_source' ||
    value === 'missing_price_source_url' ||
    value === 'missing_price_year' ||
    value === 'low_confidence_price' ||
    value === 'missing_translation' ||
    value === 'missing_image'
  ) {
    return value
  }

  return 'all'
}

function publicStatusClass(status: VehicleAuditRow['publicStatus']) {
  return status === 'ready'
    ? 'bg-emerald-100 text-emerald-800 border-emerald-200'
    : 'bg-sky-100 text-sky-900 border-sky-200'
}

function verificationStatusClass(status: VehicleAuditRow['verificationStatus']) {
  return status === 'verified'
    ? 'bg-violet-100 text-violet-800 border-violet-200'
    : 'bg-amber-100 text-amber-900 border-amber-200'
}

function compareRows(a: VehicleAuditRow, b: VehicleAuditRow, sort: SortKey) {
  if (sort === 'completeness') return a.completeness - b.completeness
  if (sort === 'issues') return a.issueCount - b.issueCount
  if (sort === 'status') return a.status.localeCompare(b.status)
  if (sort === 'brand') return a.brand.localeCompare(b.brand, 'pt')
  if (sort === 'model') return a.model.localeCompare(b.model, 'pt')
  return a.id.localeCompare(b.id, 'pt')
}

function makeHref(params: {
  sort?: SortKey
  dir?: 'asc' | 'desc'
  filter?: FilterKey
  brand?: string
}) {
  const search = new URLSearchParams()

  if (params.sort && params.sort !== 'status') search.set('sort', params.sort)
  if (params.dir && params.dir !== 'asc') search.set('dir', params.dir)
  if (params.filter && params.filter !== 'all') search.set('filter', params.filter)
  if (params.brand) search.set('brand', params.brand)

  const query = search.toString()
  return query ? `/internal/vehicles?${query}` : '/internal/vehicles'
}

function statusClass(status: VehicleAuditRow['status']) {
  return status === 'ok'
    ? 'bg-emerald-100 text-emerald-800 border-emerald-200'
    : 'bg-amber-100 text-amber-900 border-amber-200'
}

function yesNoClass(value: boolean) {
  return value
    ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
    : 'bg-rose-50 text-rose-700 border-rose-200'
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

function Pill({ children, className = '' }: { children: React.ReactNode; className?: string }) {
  return (
    <span className={`inline-flex rounded-full border px-2 py-1 text-xs font-medium ${className}`}>
      {children}
    </span>
  )
}

export default async function InternalVehiclesPage({
  searchParams,
}: InternalVehiclesPageProps) {
  const query = await searchParams
  const sort = getSort(query.sort)
  const dir = query.dir === 'desc' ? 'desc' : 'asc'
  const filter = getFilter(query.filter)
  const brand = query.brand || ''
  const audit = await auditVehicles()

  let rows = audit.rows

  if (filter === 'ok') rows = rows.filter((row) => row.status === 'ok')
  if (filter === 'needs_fix') rows = rows.filter((row) => row.status === 'needs_fix')
  if (filter === 'public_ready') rows = rows.filter((row) => row.publicStatus === 'ready')
  if (filter === 'public_incomplete') rows = rows.filter((row) => row.publicStatus === 'incomplete')
  if (filter === 'verified') rows = rows.filter((row) => row.verificationStatus === 'verified')
  if (filter === 'needs_review') rows = rows.filter((row) => row.verificationStatus === 'needs_review')
  if (filter === 'missing_price') rows = rows.filter((row) => !row.hasPricing)
  if (filter === 'legacy_pricing') rows = rows.filter((row) => !row.hasStructuredPricing && row.hasPricing)
  if (filter === 'offers_pricing') rows = rows.filter((row) => row.pricingSchema === 'offers')
  if (filter === 'missing_price_source') rows = rows.filter((row) => !row.hasPricingSource)
  if (filter === 'missing_price_source_url') rows = rows.filter((row) => !row.hasPricingSourceUrl)
  if (filter === 'missing_price_year') rows = rows.filter((row) => !row.hasPricingYearContext)
  if (filter === 'low_confidence_price') rows = rows.filter((row) => row.hasLowConfidencePricing)
  if (filter === 'missing_translation') rows = rows.filter((row) => !row.hasCompleteLocalization)
  if (filter === 'missing_image') rows = rows.filter((row) => !row.hasImage)
  if (brand) rows = rows.filter((row) => row.brand === brand)

  rows = [...rows].sort((a, b) => {
    const result = compareRows(a, b, sort)
    return dir === 'desc' ? -result : result
  })

  const nextDir = dir === 'asc' ? 'desc' : 'asc'
  const filterLinks: { label: string; value: FilterKey }[] = [
    { label: 'All', value: 'all' },
    { label: 'OK', value: 'ok' },
    { label: 'Needs fix', value: 'needs_fix' },
    { label: 'Public ready', value: 'public_ready' },
    { label: 'Public incomplete', value: 'public_incomplete' },
    { label: 'Verified', value: 'verified' },
    { label: 'Needs review', value: 'needs_review' },
    { label: 'Missing price', value: 'missing_price' },
    { label: 'Offers schema', value: 'offers_pricing' },
    { label: 'Legacy pricing', value: 'legacy_pricing' },
    { label: 'Missing price source', value: 'missing_price_source' },
    { label: 'Missing source URL', value: 'missing_price_source_url' },
    { label: 'Missing price year', value: 'missing_price_year' },
    { label: 'Low confidence price', value: 'low_confidence_price' },
    { label: 'Missing translation', value: 'missing_translation' },
    { label: 'Missing image', value: 'missing_image' },
  ]

  return (
    <main className="min-h-screen bg-slate-50 text-slate-950">
      <div className="mx-auto max-w-7xl px-6 py-10">
        <div className="mb-8 flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.24em] text-emerald-700">
              Internal
            </p>
            <h1 className="mt-2 text-4xl font-bold">Vehicle Data Health</h1>
            <p className="mt-3 max-w-3xl text-slate-600">
              Private working view for tracking catalog size, brands, data completeness,
              missing fields, image placeholders, registry mismatches, and JSON issues.
            </p>
          </div>

          <div className="rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-900">
            This page is internal by route only. It is not auth-protected yet.
          </div>
        </div>

        <div className="mb-8 flex flex-wrap gap-3">
          <Link
            href="/internal/vehicles/new"
            className="rounded-md bg-emerald-600 px-4 py-2 text-sm font-semibold text-white hover:bg-emerald-700"
          >
            Add vehicle
          </Link>
          <Link
            href="/internal/content"
            className="rounded-md border border-slate-300 bg-white px-4 py-2 text-sm font-semibold text-slate-700 hover:border-emerald-500 hover:text-emerald-800"
          >
            Edit content & SEO
          </Link>
        </div>

        <section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <StatCard label="Vehicle folders" value={audit.stats.totalFolders} />
          <StatCard label="Registry entries" value={audit.stats.registryEntries} />
          <StatCard label="Public ready" value={audit.stats.publicReady} hint="Enough data to show well to users." />
          <StatCard label="Public incomplete" value={audit.stats.publicIncomplete} />
          <StatCard label="Internally verified" value={audit.stats.verified} hint="Public ready plus sources, dates, confidence, localization." />
          <StatCard label="Needs review" value={audit.stats.needsReview} />
          <StatCard label="Brands in registry" value={audit.stats.brandCountFromRegistry} />
          <StatCard label="Brands in core files" value={audit.stats.brandCountFromCore} />
          <StatCard label="Offers pricing" value={audit.stats.offersPricing} hint="Using pricing.offers[]." />
          <StatCard label="Legacy pricing" value={audit.stats.legacyPricing} hint="Old consumerPrice/usedPrice format." />
          <StatCard label="Missing images" value={audit.stats.missingImage} hint="Placeholder will be used." />
          <StatCard label="Missing prices" value={audit.stats.missingPricing} />
          <StatCard label="Missing price source" value={audit.stats.missingPricingSource} />
          <StatCard label="Missing source URL" value={audit.stats.missingPricingSourceUrl} />
          <StatCard label="Missing price year" value={audit.stats.missingPricingYearContext} />
          <StatCard label="Missing price updated" value={audit.stats.missingPricingUpdatedAt} />
          <StatCard label="Low confidence price" value={audit.stats.lowConfidencePricing} />
          <StatCard label="Missing translations" value={audit.stats.missingLocalization} />
        </section>

        <section className="mt-8 grid gap-6 lg:grid-cols-[1fr_1fr]">
          <div className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
            <h2 className="text-lg font-bold">Issue Buckets</h2>
            <div className="mt-4 space-y-2">
              {audit.issueBuckets.map((bucket) => (
                <div
                  key={bucket.issue}
                  className="flex items-center justify-between gap-4 rounded-md bg-slate-50 px-3 py-2"
                >
                  <span className="text-sm text-slate-700">{bucket.issue}</span>
                  <span className="font-semibold text-slate-950">{bucket.count}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
            <h2 className="text-lg font-bold">Brands From Registry</h2>
            <div className="mt-4 grid grid-cols-2 gap-2 sm:grid-cols-3">
              {audit.brandsFromRegistry.map((item) => (
                <Link
                  key={item.brand}
                  href={makeHref({ filter, sort, dir, brand: item.brand })}
                  className={`rounded-md border px-3 py-2 text-sm transition hover:border-emerald-400 ${
                    brand === item.brand
                      ? 'border-emerald-500 bg-emerald-50 text-emerald-900'
                      : 'border-slate-200 bg-slate-50 text-slate-700'
                  }`}
                >
                  <span className="font-medium">{item.brand}</span>
                  <span className="float-right">{item.count}</span>
                </Link>
              ))}
            </div>
            {brand && (
              <Link
                href={makeHref({ filter, sort, dir })}
                className="mt-4 inline-flex text-sm font-medium text-emerald-700 hover:text-emerald-900"
              >
                Clear brand filter
              </Link>
            )}
          </div>
        </section>

        {audit.registryWithoutFolder.length > 0 && (
          <section className="mt-8 rounded-lg border border-rose-200 bg-rose-50 p-5 text-rose-900">
            <h2 className="font-bold">Registry Entries Without Folders</h2>
            <p className="mt-2 text-sm">{audit.registryWithoutFolder.join(', ')}</p>
          </section>
        )}

        <section className="mt-8 rounded-lg border border-slate-200 bg-white shadow-sm">
          <div className="border-b border-slate-200 p-5">
            <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
              <div>
                <h2 className="text-lg font-bold">Vehicles</h2>
                <p className="mt-1 text-sm text-slate-500">
                  Showing {rows.length} of {audit.rows.length} vehicle folders.
                </p>
              </div>

              <div className="flex flex-wrap gap-2">
                {filterLinks.map((item) => (
                  <Link
                    key={item.value}
                    href={makeHref({ filter: item.value, sort, dir, brand })}
                    className={`rounded-full border px-3 py-1.5 text-sm font-medium ${
                      filter === item.value
                        ? 'border-emerald-500 bg-emerald-50 text-emerald-800'
                        : 'border-slate-200 bg-white text-slate-600 hover:border-slate-300'
                    }`}
                  >
                    {item.label}
                  </Link>
                ))}
              </div>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="min-w-full border-separate border-spacing-0 text-sm">
              <thead className="bg-slate-100 text-left text-xs uppercase tracking-wide text-slate-500">
                <tr>
                  {(['status', 'brand', 'model', 'id', 'completeness', 'issues'] as SortKey[]).map((key) => (
                    <th key={key} className="whitespace-nowrap px-4 py-3 font-semibold">
                      <Link
                        href={makeHref({
                          filter,
                          brand,
                          sort: key,
                          dir: sort === key ? nextDir : 'asc',
                        })}
                        className="hover:text-slate-950"
                      >
                        {sortLabels[key]}
                        {sort === key && <span className="ml-1">{dir === 'asc' ? '↑' : '↓'}</span>}
                      </Link>
                    </th>
                  ))}
                  <th className="whitespace-nowrap px-4 py-3 font-semibold">Quality</th>
                  <th className="whitespace-nowrap px-4 py-3 font-semibold">Signals</th>
                  <th className="whitespace-nowrap px-4 py-3 font-semibold">Fix notes</th>
                  <th className="whitespace-nowrap px-4 py-3 font-semibold">Actions</th>
                </tr>
              </thead>
              <tbody>
                {rows.map((row) => (
                  <tr key={row.id} className="border-b border-slate-100 odd:bg-white even:bg-slate-50/60">
                    <td className="whitespace-nowrap px-4 py-4 align-top">
                      <Pill className={statusClass(row.status)}>
                        {row.status === 'ok' ? 'OK' : 'Needs fix'}
                      </Pill>
                    </td>
                    <td className="whitespace-nowrap px-4 py-4 align-top font-medium">{row.brand}</td>
                    <td className="px-4 py-4 align-top">
                      <div className="font-medium">{row.model}</div>
                      {row.variant && <div className="text-xs text-slate-500">{row.variant}</div>}
                    </td>
                    <td className="whitespace-nowrap px-4 py-4 align-top font-mono text-xs text-slate-600">
                      {row.id}
                    </td>
                    <td className="whitespace-nowrap px-4 py-4 align-top">
                      <div className="flex items-center gap-2">
                        <div className="h-2 w-24 overflow-hidden rounded-full bg-slate-200">
                          <div
                            className="h-full rounded-full bg-emerald-500"
                            style={{ width: `${row.completeness}%` }}
                          />
                        </div>
                        <span className="font-semibold">{row.completeness}%</span>
                      </div>
                    </td>
                    <td className="whitespace-nowrap px-4 py-4 align-top font-semibold">
                      {row.issueCount}
                    </td>
                    <td className="px-4 py-4 align-top">
                      <div className="flex flex-wrap gap-1.5">
                        <Pill className={publicStatusClass(row.publicStatus)}>
                          {row.publicStatus === 'ready' ? 'Public ready' : 'Public incomplete'}
                        </Pill>
                        <Pill className={verificationStatusClass(row.verificationStatus)}>
                          {row.verificationStatus === 'verified' ? 'Verified' : 'Needs review'}
                        </Pill>
                        <Pill className="bg-slate-100 text-slate-700 border-slate-200">
                          {row.pricingSchema}
                        </Pill>
                      </div>
                    </td>
                    <td className="px-4 py-4 align-top">
                      <div className="flex flex-wrap gap-1.5">
                        <Pill className={yesNoClass(row.hasPricing)}>price</Pill>
                        <Pill className={yesNoClass(row.hasStructuredPricing)}>structured</Pill>
                        <Pill className={yesNoClass(row.hasNewPricing)}>new</Pill>
                        <Pill className={yesNoClass(row.hasUsedPricing)}>used</Pill>
                        <Pill className={yesNoClass(row.hasImportedUsedPricing)}>import</Pill>
                        <Pill className={yesNoClass(row.hasPricingSource)}>source</Pill>
                        <Pill className={yesNoClass(row.hasPricingSourceUrl)}>url</Pill>
                        <Pill className={yesNoClass(row.hasPricingYearContext)}>year</Pill>
                        <Pill className={yesNoClass(!row.hasLowConfidencePricing)}>confidence</Pill>
                        <Pill className={yesNoClass(row.hasCompleteLocalization)}>i18n</Pill>
                        <Pill className={yesNoClass(row.hasImage)}>image</Pill>
                        <Pill className={yesNoClass(row.hasRange)}>range</Pill>
                        <Pill className={yesNoClass(row.hasCharging)}>charge</Pill>
                        <Pill className={yesNoClass(row.hasBattery)}>battery</Pill>
                        <Pill className={yesNoClass(row.hasDimensions)}>dims</Pill>
                      </div>
                    </td>
                    <td className="min-w-80 px-4 py-4 align-top">
                      {row.issues.length > 0 ? (
                        <ul className="space-y-1 text-xs text-slate-600">
                          {row.publicIssues.map((issue) => (
                            <li key={`public-${issue}`} className="font-medium text-sky-700">
                              public: add {issue}
                            </li>
                          ))}
                          {row.verificationIssues.map((issue) => (
                            <li key={`verify-${issue}`} className="font-medium text-violet-700">
                              verify: {issue}
                            </li>
                          ))}
                          {row.missingLocalization.map((issue) => (
                            <li key={`i18n-${issue}`} className="font-medium text-rose-700">
                              i18n: add {issue}
                            </li>
                          ))}
                          {row.pricingTags.map((tag) => (
                            <li key={tag} className="font-medium text-amber-700">
                              pricing: {tag}
                            </li>
                          ))}
                          {row.issues.map((issue) => (
                            <li key={issue}>{issue}</li>
                          ))}
                        </ul>
                      ) : (
                        <span className="text-xs text-slate-400">No data issues</span>
                      )}
                    </td>
                    <td className="whitespace-nowrap px-4 py-4 align-top">
                      <div className="flex flex-col gap-2">
                        <Link
                          href={`/internal/vehicles/${row.id}`}
                          className="text-sm font-medium text-emerald-700 hover:text-emerald-900"
                        >
                          Open
                        </Link>
                        <Link
                          href={`/internal/vehicles/${row.id}/edit`}
                          className="text-sm font-medium text-slate-600 hover:text-slate-950"
                        >
                          Edit
                        </Link>
                        <Link
                          href={`/internal/vehicles/new?copyFrom=${row.id}`}
                          className="text-sm font-medium text-slate-600 hover:text-slate-950"
                        >
                          Duplicate
                        </Link>
                      </div>
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
