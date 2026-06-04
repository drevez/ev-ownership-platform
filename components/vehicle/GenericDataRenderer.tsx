'use client'

import { useTranslations } from '@/hooks/useTranslations'

interface GenericDataRendererProps {
  title: string
  data: Record<string, unknown>
}

function formatKey(key: string): string {
  return key
    .replace(/([A-Z])/g, ' $1')
    .replace(/([a-z])([0-9])/g, '$1 $2')
    .replace(/^./, (str) => str.toUpperCase())
    .trim()
}

function renderValue(
  value: unknown,
  t: ReturnType<typeof useTranslations>
): React.ReactNode {

  if (value === null || value === undefined) {
    return (
      <span className="text-slate-400">
        {t.generic.na}
      </span>
    )
  }

  if (typeof value === 'boolean') {
    return value ? (
      <span className="inline-flex items-center gap-1 text-green-700 font-semibold">
        <span>✓</span> {t.generic.yes}
      </span>
    ) : (
      <span className="inline-flex items-center gap-1 text-slate-400 font-semibold">
        <span>✗</span> {t.generic.no}
      </span>
    )
  }

  if (typeof value === 'number') {
    return (
      <span className="font-semibold text-slate-900">
        {value.toLocaleString('pt-PT')}
      </span>
    )
  }

  if (typeof value === 'string') {
    return (
      <span className="text-slate-900">
        {value}
      </span>
    )
  }

  if (Array.isArray(value)) {

    if (value.length === 0) {
      return (
        <span className="text-slate-400">
          —
        </span>
      )
    }

    return (
      <ul className="list-disc list-inside space-y-1">

        {value.map((item, idx) => (
          <li
            key={idx}
            className="text-slate-900"
          >
            {typeof item === 'object'
              ? JSON.stringify(item)
              : String(item)}
          </li>
        ))}

      </ul>
    )
  }

  if (typeof value === 'object') {

    const entries = Object.entries(value).filter(
      ([, v]) =>
        v !== undefined &&
        v !== null &&
        v !== ''
    )

    if (entries.length === 0) {
      return (
        <span className="text-slate-400">
          —
        </span>
      )
    }

    return (
      <div className="space-y-2 bg-slate-50 rounded p-3 border border-slate-200">

        {entries.map(([k, v]) => (
          <div
            key={k}
            className="flex justify-between gap-4"
          >

            <span className="text-sm font-medium text-slate-600">
              {formatKey(k)}:
            </span>

            <span className="text-sm text-slate-900">
              {renderValue(v, t)}
            </span>

          </div>
        ))}

      </div>
    )
  }

  return (
    <span className="text-slate-900">
      {String(value)}
    </span>
  )
}

export function GenericDataRenderer({
  title,
  data,
}: GenericDataRendererProps) {

  const t = useTranslations()

  const entries = Object.entries(data).filter(
    ([, value]) =>
      value !== undefined &&
      value !== null &&
      value !== '' &&
      value !== false
  )

  if (entries.length === 0) {
    return null
  }

  return (
    <div className="bg-white rounded-lg shadow-md p-6">

      <h2 className="text-2xl font-bold text-slate-900 mb-6">
        {title}
      </h2>

      <div className="space-y-4">

        {entries.map(([key, value]) => (
          <div
            key={key}
            className="border-b border-slate-200 pb-4 last:border-b-0 last:pb-0"
          >

            <p className="text-sm font-semibold text-slate-600 mb-2">
              {formatKey(key)}
            </p>

            <div className="text-slate-900">
              {renderValue(value, t)}
            </div>

          </div>
        ))}

      </div>

    </div>
  )
}
