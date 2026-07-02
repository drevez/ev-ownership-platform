import Link from 'next/link'

import { auditVehicles } from '@/lib/vehicleAudit'

export const dynamic = 'force-dynamic'

const tools = [
  {
    title: 'Vehicle data',
    description: 'Review every vehicle, filter data issues, and open individual records.',
    href: '/internal/vehicles',
    action: 'Open vehicle dashboard',
    accent: 'emerald',
  },
  {
    title: 'Add a vehicle',
    description: 'Create a new vehicle or use an existing version as a starting point.',
    href: '/internal/vehicles/new',
    action: 'Create vehicle',
    accent: 'blue',
  },
  {
    title: 'Content & SEO',
    description: 'Edit public copy, translations, titles, and metadata across three languages.',
    href: '/internal/content',
    action: 'Edit content',
    accent: 'violet',
  },
  {
    title: 'Vehicle images',
    description: 'See missing car images, orphan files, naming rules, and the prompt for new assets.',
    href: '/internal/images',
    action: 'Review images',
    accent: 'amber',
  },
] as const

export default async function InternalPage() {
  const audit = await auditVehicles()

  return (
    <main className="min-h-screen bg-slate-50 text-slate-950">
      <div className="mx-auto max-w-7xl px-6 py-10">
        <header className="border-b border-slate-200 pb-8">
          <div className="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
            <div>
              <p className="text-sm font-semibold uppercase tracking-[0.24em] text-emerald-700">
                MotorZero Internal
              </p>
              <h1 className="mt-2 text-4xl font-bold">Workspace</h1>
              <p className="mt-3 max-w-2xl text-slate-600">
                Maintain the vehicle catalog, public content, translations, and
                operational data from one place.
              </p>
            </div>

            <div className="border-l-4 border-emerald-500 bg-emerald-50 px-4 py-3 text-sm text-emerald-950">
              Protected by server-side authentication
            </div>
          </div>
        </header>

        <section className="grid gap-px border border-slate-200 bg-slate-200 sm:grid-cols-2 lg:grid-cols-4">
          <DashboardStat label="Vehicle folders" value={audit.stats.totalFolders} />
          <DashboardStat label="Brands" value={audit.stats.brandCountFromCore} />
          <DashboardStat label="Public ready" value={audit.stats.publicReady} />
          <DashboardStat label="Needs review" value={audit.stats.needsReview} />
        </section>

        <section className="py-10">
          <div className="mb-5">
            <h2 className="text-xl font-bold">Tools</h2>
            <p className="mt-1 text-sm text-slate-600">
              Choose an area to manage. New internal tools can be added here as
              the platform grows.
            </p>
          </div>

          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
            {tools.map((tool) => (
              <ToolLink key={tool.href} {...tool} />
            ))}
          </div>
        </section>

        <section className="grid gap-6 border-t border-slate-200 pt-8 lg:grid-cols-2">
          <div>
            <h2 className="text-lg font-bold">Catalog attention</h2>
            <div className="mt-4 grid grid-cols-2 gap-px overflow-hidden border border-slate-200 bg-slate-200">
              <DashboardStat label="Missing images" value={audit.stats.missingImage} compact />
              <DashboardStat label="Missing prices" value={audit.stats.missingPricing} compact />
              <DashboardStat label="Legacy pricing" value={audit.stats.legacyPricing} compact />
              <DashboardStat label="Missing translations" value={audit.stats.missingLocalization} compact />
            </div>
          </div>

          <div>
            <h2 className="text-lg font-bold">Quick access</h2>
            <div className="mt-4 divide-y divide-slate-200 border-y border-slate-200">
              <QuickLink href="/internal/vehicles?filter=needs_fix">
                Vehicles that need fixing
              </QuickLink>
              <QuickLink href="/internal/vehicles?filter=missing_image">
                Vehicles using placeholder images
              </QuickLink>
              <QuickLink href="/internal/images">
                Missing image filenames and prompt
              </QuickLink>
              <QuickLink href="/internal/vehicles?filter=missing_translation">
                Vehicles missing translations
              </QuickLink>
            </div>
          </div>
        </section>
      </div>
    </main>
  )
}

function ToolLink({
  title,
  description,
  href,
  action,
  accent,
}: (typeof tools)[number]) {
  const accentClass = {
    emerald: 'bg-emerald-500',
    blue: 'bg-blue-500',
    violet: 'bg-violet-500',
    amber: 'bg-amber-500',
  }[accent]

  return (
    <Link
      href={href}
      className="group relative overflow-hidden rounded-lg border border-slate-200 bg-white p-6 shadow-sm transition hover:-translate-y-0.5 hover:border-slate-300 hover:shadow-md"
    >
      <span className={`absolute inset-y-0 left-0 w-1 ${accentClass}`} />
      <h3 className="text-lg font-bold">{title}</h3>
      <p className="mt-2 min-h-12 text-sm leading-6 text-slate-600">
        {description}
      </p>
      <span className="mt-6 inline-flex items-center gap-2 text-sm font-semibold text-slate-900">
        {action}
        <span aria-hidden="true" className="transition-transform group-hover:translate-x-1">
          →
        </span>
      </span>
    </Link>
  )
}

function DashboardStat({
  label,
  value,
  compact = false,
}: {
  label: string
  value: number
  compact?: boolean
}) {
  return (
    <div className={`bg-white ${compact ? 'p-4' : 'p-5'}`}>
      <p className="text-xs font-semibold uppercase tracking-[0.14em] text-slate-500">
        {label}
      </p>
      <p className={`${compact ? 'mt-2 text-2xl' : 'mt-3 text-3xl'} font-bold`}>
        {value}
      </p>
    </div>
  )
}

function QuickLink({
  href,
  children,
}: {
  href: string
  children: React.ReactNode
}) {
  return (
    <Link
      href={href}
      className="flex items-center justify-between gap-4 py-3 text-sm font-medium text-slate-700 transition hover:text-emerald-700"
    >
      {children}
      <span aria-hidden="true">→</span>
    </Link>
  )
}
