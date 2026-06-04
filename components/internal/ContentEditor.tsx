'use client'

import { useMemo, useState } from 'react'

type ContentLanguage = 'pt' | 'en' | 'es'
type EditableContentValues = Record<ContentLanguage, Record<string, string>>

interface EditableContentField {
  id: string
  label: string
  path: string[]
  multiline?: boolean
  seo?: boolean
  hint?: string
}

interface EditableContentSection {
  id: string
  label: string
  description: string
  fields: EditableContentField[]
}

interface ContentEditorProps {
  sections: EditableContentSection[]
  initialValues: EditableContentValues
}

const LANGUAGES: { id: ContentLanguage; label: string; helper: string }[] = [
  { id: 'pt', label: 'Português', helper: 'Principal' },
  { id: 'en', label: 'English', helper: 'Tradução' },
  { id: 'es', label: 'Español', helper: 'Tradução' },
]

function cloneValues(values: EditableContentValues): EditableContentValues {
  return JSON.parse(JSON.stringify(values)) as EditableContentValues
}

function fieldLimit(field: EditableContentField) {
  if (!field.seo) return null
  if (field.id.toLowerCase().includes('title')) return 60
  if (field.id.toLowerCase().includes('description')) return 160
  return null
}

function countTone(length: number, limit: number | null) {
  if (!limit) return 'text-slate-400'
  if (length <= limit) return 'text-emerald-700'
  if (length <= limit + 20) return 'text-amber-700'
  return 'text-rose-700'
}

export function ContentEditor({ sections, initialValues }: ContentEditorProps) {
  const [activeSectionId, setActiveSectionId] = useState(sections[0]?.id ?? '')
  const [values, setValues] = useState(() => cloneValues(initialValues))
  const [status, setStatus] = useState<'idle' | 'saving' | 'saved' | 'error'>('idle')
  const [error, setError] = useState('')

  const activeSection = useMemo(
    () => sections.find((section) => section.id === activeSectionId) ?? sections[0],
    [activeSectionId, sections]
  )

  const isDirty = JSON.stringify(values) !== JSON.stringify(initialValues)

  function updateValue(language: ContentLanguage, fieldId: string, value: string) {
    setStatus('idle')
    setValues((current) => ({
      ...current,
      [language]: {
        ...current[language],
        [fieldId]: value,
      },
    }))
  }

  function copyFromPortuguese(language: ContentLanguage, fieldId: string) {
    if (language === 'pt') return
    updateValue(language, fieldId, values.pt[fieldId] ?? '')
  }

  async function save() {
    setStatus('saving')
    setError('')

    try {
      const response = await fetch('/api/internal/content', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ values }),
      })

      const data = (await response.json()) as { error?: string }

      if (!response.ok) {
        throw new Error(data.error ?? 'Failed to save content.')
      }

      setStatus('saved')
    } catch (saveError) {
      setStatus('error')
      setError(saveError instanceof Error ? saveError.message : 'Failed to save content.')
    }
  }

  if (!activeSection) {
    return null
  }

  return (
    <div className="grid gap-6 lg:grid-cols-[280px_1fr]">
      <aside className="rounded-lg border border-slate-200 bg-white p-3 shadow-sm">
        <div className="space-y-1">
          {sections.map((section) => (
            <button
              key={section.id}
              type="button"
              onClick={() => setActiveSectionId(section.id)}
              className={`w-full rounded-md px-3 py-2 text-left text-sm font-semibold transition ${
                activeSection.id === section.id
                  ? 'bg-slate-950 text-white'
                  : 'text-slate-700 hover:bg-slate-100'
              }`}
            >
              {section.label}
            </button>
          ))}
        </div>
      </aside>

      <section className="rounded-lg border border-slate-200 bg-white shadow-sm">
        <div className="border-b border-slate-200 p-5">
          <div className="flex flex-col gap-4 xl:flex-row xl:items-start xl:justify-between">
            <div>
              <p className="text-sm font-semibold uppercase tracking-[0.18em] text-emerald-700">
                Conteúdo interno
              </p>
              <h2 className="mt-2 text-2xl font-bold text-slate-950">
                {activeSection.label}
              </h2>
              <p className="mt-2 max-w-3xl text-sm leading-6 text-slate-600">
                {activeSection.description}
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-3">
              {status === 'saved' && (
                <span className="rounded-full border border-emerald-200 bg-emerald-50 px-3 py-1 text-sm font-semibold text-emerald-800">
                  Guardado
                </span>
              )}
              {isDirty && status !== 'saved' && (
                <span className="rounded-full border border-amber-200 bg-amber-50 px-3 py-1 text-sm font-semibold text-amber-900">
                  Alterações por guardar
                </span>
              )}
              <button
                type="button"
                onClick={() => setValues(cloneValues(initialValues))}
                disabled={!isDirty || status === 'saving'}
                className="rounded-md border border-slate-300 bg-white px-4 py-2 text-sm font-semibold text-slate-700 transition hover:border-slate-500 disabled:cursor-not-allowed disabled:opacity-50"
              >
                Repor
              </button>
              <button
                type="button"
                onClick={save}
                disabled={!isDirty || status === 'saving'}
                className="rounded-md bg-emerald-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-emerald-700 disabled:cursor-not-allowed disabled:opacity-50"
              >
                {status === 'saving' ? 'A guardar...' : 'Guardar textos'}
              </button>
            </div>
          </div>

          {status === 'error' && (
            <div className="mt-4 rounded-md border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-900">
              {error}
            </div>
          )}
        </div>

        <div className="divide-y divide-slate-200">
          {activeSection.fields.map((field) => {
            const limit = fieldLimit(field)

            return (
              <div key={field.id} className="p-5">
                <div className="mb-4 flex flex-col gap-2 md:flex-row md:items-start md:justify-between">
                  <div>
                    <h3 className="text-base font-bold text-slate-950">{field.label}</h3>
                    <p className="mt-1 text-xs text-slate-500">{field.path.join('.')}</p>
                    {field.hint && (
                      <p className="mt-1 text-sm text-slate-600">{field.hint}</p>
                    )}
                  </div>
                  {field.seo && (
                    <span className="w-fit rounded-full border border-sky-200 bg-sky-50 px-3 py-1 text-xs font-semibold text-sky-800">
                      SEO
                    </span>
                  )}
                </div>

                <div className="grid gap-4 xl:grid-cols-3">
                  {LANGUAGES.map((language) => {
                    const value = values[language.id][field.id] ?? ''

                    return (
                      <label
                        key={language.id}
                        className="block rounded-lg border border-slate-200 bg-slate-50 p-3"
                      >
                        <div className="mb-2 flex items-center justify-between gap-3">
                          <div>
                            <span className="text-sm font-bold text-slate-950">
                              {language.label}
                            </span>
                            <span className="ml-2 text-xs text-slate-500">
                              {language.helper}
                            </span>
                          </div>
                          <div className="flex items-center gap-2">
                            {language.id !== 'pt' && (
                              <button
                                type="button"
                                onClick={() => copyFromPortuguese(language.id, field.id)}
                                className="rounded-md border border-slate-200 bg-white px-2 py-1 text-xs font-semibold text-slate-600 transition hover:border-emerald-400 hover:text-emerald-800"
                              >
                                Copiar PT
                              </button>
                            )}
                            <span className={`text-xs font-semibold ${countTone(value.length, limit)}`}>
                              {limit ? `${value.length}/${limit}` : value.length}
                            </span>
                          </div>
                        </div>

                        {field.multiline ? (
                          <textarea
                            value={value}
                            onChange={(event) => updateValue(language.id, field.id, event.target.value)}
                            rows={5}
                            className="min-h-32 w-full resize-y rounded-md border border-slate-300 bg-white px-3 py-2 text-sm leading-6 text-slate-950 shadow-sm outline-none transition focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100"
                          />
                        ) : (
                          <input
                            value={value}
                            onChange={(event) => updateValue(language.id, field.id, event.target.value)}
                            className="w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm text-slate-950 shadow-sm outline-none transition focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100"
                          />
                        )}
                      </label>
                    )
                  })}
                </div>
              </div>
            )
          })}
        </div>
      </section>
    </div>
  )
}
