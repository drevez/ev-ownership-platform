import Link from 'next/link'

import { ContentEditor } from '@/components/internal/ContentEditor'
import {
  EDITABLE_CONTENT_SECTIONS,
  readEditableContent,
} from '@/lib/internalContentFiles'

export const dynamic = 'force-dynamic'

export default function InternalContentPage() {
  const values = readEditableContent()

  return (
    <main className="min-h-screen bg-slate-50 text-slate-950">
      <div className="mx-auto max-w-7xl px-6 py-10">
        <div className="mb-8 flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.24em] text-emerald-700">
              Internal
            </p>
            <h1 className="mt-2 text-4xl font-bold">Content & SEO</h1>
            <p className="mt-3 max-w-3xl text-slate-600">
              Edit public page copy, translations, and SEO metadata for Portuguese,
              English, and Spanish without opening the locale files manually.
            </p>
          </div>

          <div className="flex flex-wrap gap-3">
            <Link
              href="/internal/vehicles"
              className="rounded-md border border-slate-300 bg-white px-4 py-2 text-sm font-semibold text-slate-700 transition hover:border-emerald-500 hover:text-emerald-800"
            >
              Vehicle data
            </Link>
            <div className="rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-900">
              Internal route only. Not auth-protected yet.
            </div>
          </div>
        </div>

        <ContentEditor
          sections={EDITABLE_CONTENT_SECTIONS}
          initialValues={values}
        />
      </div>
    </main>
  )
}
