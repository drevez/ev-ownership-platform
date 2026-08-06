'use client'

import { useMemo, useState } from 'react'
import { usePathname } from 'next/navigation'

import { useLocale } from '@/context/LocaleContext'
import { useTranslations } from '@/hooks/useTranslations'
import { buildPageContext, pageContextToFlatProperties, type AnalyticsPageType } from '@/lib/analytics'
import { delocalizePathname, stripLanguageFromPathname } from '@/lib/i18nRouting'
import { normalizeSignalText } from '@/lib/productSignals'
import { trackEvent } from '@/lib/posthogClient'

type SuggestionTone = 'light' | 'dark'

function suggestionPageType(pathname: string): AnalyticsPageType {
  const canonicalPath = delocalizePathname(stripLanguageFromPathname(pathname))
  if (canonicalPath === '/') return 'home'
  if (canonicalPath === '/models' || canonicalPath.startsWith('/models/')) return 'models'
  if (canonicalPath.startsWith('/compare')) return 'comparison'
  return 'content'
}

export function VehicleSuggestionPrompt({
  query,
  resultCount,
  sourceComponent,
  tone = 'light',
}: {
  query: string
  resultCount: number
  sourceComponent: string
  tone?: SuggestionTone
}) {
  const t = useTranslations()
  const pathname = usePathname()
  const { locale } = useLocale()
  const queryNormalized = useMemo(() => normalizeSignalText(query), [query])
  const [isOpen, setIsOpen] = useState(false)
  const [brand, setBrand] = useState('')
  const [model, setModel] = useState(queryNormalized)
  const [variant, setVariant] = useState('')
  const [marketContext, setMarketContext] = useState('not_sure')
  const [note, setNote] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submitted, setSubmitted] = useState(false)

  const isDark = tone === 'dark'
  const panelClass = isDark
    ? 'border-white/10 bg-white/[0.04] text-white'
    : 'border-slate-200 bg-white text-slate-950'
  const mutedTextClass = isDark ? 'text-zinc-400' : 'text-slate-500'
  const inputClass = isDark
    ? 'border-white/10 bg-black/30 text-white placeholder:text-zinc-500 focus:border-emerald-400'
    : 'border-slate-200 bg-slate-50 text-slate-950 placeholder:text-slate-400 focus:border-emerald-500 focus:bg-white'
  const secondaryButtonClass = isDark
    ? 'border-white/10 text-zinc-200 hover:bg-white/10'
    : 'border-slate-200 text-slate-700 hover:bg-slate-50'

  function openForm() {
    setIsOpen(true)
    const canonicalPath = delocalizePathname(stripLanguageFromPathname(pathname))
    const page = buildPageContext({
      path: pathname,
      canonicalPath,
      type: suggestionPageType(pathname),
      language: locale,
    })
    trackEvent('vehicle_suggestion_opened', {
      event_schema_version: 2,
      page,
      search: {
        query_normalized: queryNormalized,
        result_count: resultCount,
        source_component: sourceComponent,
      },
      vehicle_suggestion: {
        source_component: sourceComponent,
      },
      ...pageContextToFlatProperties(page),
      source_component: sourceComponent,
      page_path: pathname,
      query_normalized: queryNormalized,
      result_count: resultCount,
    })
  }

  async function submitSuggestion() {
    const cleanModel = model.replace(/\s+/g, ' ').trim()
    if (!cleanModel) return

    setIsSubmitting(true)

    const payload = {
      brand,
      model: cleanModel,
      variant,
      marketContext,
      note,
      sourcePage: pathname,
      sourceComponent,
      locale,
      queryNormalized,
      resultCount,
    }

    try {
      await fetch('/api/vehicle-suggestions', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify(payload),
      })
    } catch (error) {
      console.error('Could not submit vehicle suggestion:', error)
    } finally {
      const canonicalPath = delocalizePathname(stripLanguageFromPathname(pathname))
      const page = buildPageContext({
        path: pathname,
        canonicalPath,
        type: suggestionPageType(pathname),
        language: locale,
      })
      trackEvent('vehicle_suggestion_submitted', {
        event_schema_version: 2,
        page,
        vehicle_suggestion: {
          suggested_brand: normalizeSignalText(brand),
          suggested_model: normalizeSignalText(cleanModel),
          suggested_variant: normalizeSignalText(variant),
          market_context: marketContext,
          source_component: sourceComponent,
          query_normalized: queryNormalized,
          result_count: resultCount,
        },
        ...pageContextToFlatProperties(page),
        source_component: sourceComponent,
        page_path: pathname,
        query_normalized: queryNormalized,
        suggested_brand: normalizeSignalText(brand),
        suggested_model: normalizeSignalText(cleanModel),
        suggested_variant: normalizeSignalText(variant),
        market_context: marketContext,
        result_count: resultCount,
      })
      setSubmitted(true)
      setIsSubmitting(false)
    }
  }

  if (submitted) {
    return (
      <div className={`rounded-lg border p-4 text-sm ${panelClass}`}>
        <p className="font-semibold">{t.vehicleSuggestion.thanksTitle}</p>
        <p className={`mt-1 ${mutedTextClass}`}>{t.vehicleSuggestion.thanksDescription}</p>
      </div>
    )
  }

  return (
    <div className={`rounded-lg border p-4 ${panelClass}`}>
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="text-sm font-semibold">{t.vehicleSuggestion.title}</p>
          <p className={`mt-1 text-sm ${mutedTextClass}`}>
            {t.vehicleSuggestion.description}
          </p>
        </div>
        {!isOpen && (
          <button
            type="button"
            onClick={openForm}
            className="min-h-10 rounded-md bg-emerald-500 px-4 text-sm font-semibold text-black transition hover:bg-emerald-400"
          >
            {t.vehicleSuggestion.action}
          </button>
        )}
      </div>

      {isOpen && (
        <div className="mt-4 grid gap-3">
          <div className="grid gap-3 sm:grid-cols-2">
            <Field
              label={t.vehicleSuggestion.brandLabel}
              value={brand}
              onChange={setBrand}
              className={inputClass}
            />
            <Field
              label={t.vehicleSuggestion.modelLabel}
              value={model}
              onChange={setModel}
              className={inputClass}
              required
            />
          </div>
          <div className="grid gap-3 sm:grid-cols-2">
            <Field
              label={t.vehicleSuggestion.variantLabel}
              value={variant}
              onChange={setVariant}
              className={inputClass}
            />
            <label className="grid gap-1 text-sm font-medium">
              <span>{t.vehicleSuggestion.marketLabel}</span>
              <select
                value={marketContext}
                onChange={(event) => setMarketContext(event.target.value)}
                className={`h-11 rounded-md border px-3 outline-none transition ${inputClass}`}
              >
                <option value="portugal_new">{t.vehicleSuggestion.marketOptions.portugalNew}</option>
                <option value="portugal_used">{t.vehicleSuggestion.marketOptions.portugalUsed}</option>
                <option value="import">{t.vehicleSuggestion.marketOptions.import}</option>
                <option value="not_sure">{t.vehicleSuggestion.marketOptions.notSure}</option>
              </select>
            </label>
          </div>
          <label className="grid gap-1 text-sm font-medium">
            <span>{t.vehicleSuggestion.noteLabel}</span>
            <textarea
              value={note}
              onChange={(event) => setNote(event.target.value)}
              rows={3}
              className={`rounded-md border px-3 py-2 outline-none transition ${inputClass}`}
            />
          </label>
          <div className="flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
            <button
              type="button"
              onClick={() => setIsOpen(false)}
              className={`min-h-10 rounded-md border px-4 text-sm font-semibold transition ${secondaryButtonClass}`}
            >
              {t.vehicleSuggestion.cancel}
            </button>
            <button
              type="button"
              onClick={submitSuggestion}
              disabled={isSubmitting || !model.trim()}
              className="min-h-10 rounded-md bg-emerald-500 px-4 text-sm font-semibold text-black transition hover:bg-emerald-400 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {isSubmitting ? t.vehicleSuggestion.sending : t.vehicleSuggestion.submit}
            </button>
          </div>
        </div>
      )}
    </div>
  )
}

function Field({
  label,
  value,
  onChange,
  className,
  required,
}: {
  label: string
  value: string
  onChange: (value: string) => void
  className: string
  required?: boolean
}) {
  return (
    <label className="grid gap-1 text-sm font-medium">
      <span>{label}</span>
      <input
        value={value}
        onChange={(event) => onChange(event.target.value)}
        required={required}
        className={`h-11 rounded-md border px-3 outline-none transition ${className}`}
      />
    </label>
  )
}
