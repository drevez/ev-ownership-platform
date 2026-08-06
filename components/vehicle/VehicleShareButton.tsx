'use client'

import { useState } from 'react'

import type { Language } from '@/config/i18n'
import {
  buildPageContext,
  pageContextToFlatProperties,
  toAnalyticsVehicle,
  vehicleFlatProperties,
} from '@/lib/analytics'
import { pushGaEvent } from '@/lib/gaEvents'
import { trackEvent } from '@/lib/posthogClient'

type VehicleShareButtonProps = {
  vehicle: {
    id: string
    brand: string
    model: string
    variant?: string
    modelYear?: number
  }
  displayName: string
  locale: Language
  label: string
  copiedLabel: string
  errorLabel: string
  shareText: string
}

export function VehicleShareButton({
  vehicle,
  displayName,
  locale,
  label,
  copiedLabel,
  errorLabel,
  shareText,
}: VehicleShareButtonProps) {
  const [status, setStatus] = useState<'idle' | 'copied' | 'error'>('idle')

  async function shareVehicle() {
    const canUseNativeShare = typeof navigator.share === 'function'
    const method = canUseNativeShare ? 'native_share' : 'copy_link'

    try {
      if (canUseNativeShare) {
        await navigator.share({
          title: displayName,
          text: shareText.replace('{vehicle}', displayName),
          url: window.location.href,
        })
      } else {
        await navigator.clipboard.writeText(window.location.href)
        setStatus('copied')
        window.setTimeout(() => setStatus('idle'), 2400)
      }

      const page = buildPageContext({
        path: window.location.pathname,
        canonicalPath: `/vehicles/${vehicle.id}`,
        type: 'vehicle',
        language: locale,
      })
      const analyticsVehicles = [
        toAnalyticsVehicle({
          ...vehicle,
          displayName,
        }),
      ]
      const properties = {
        event_schema_version: 2,
        page,
        content: {
          type: 'vehicle',
          share_method: method,
        },
        vehicles: analyticsVehicles,
        content_type: 'vehicle',
        share_method: method,
        ...pageContextToFlatProperties(page),
        ...vehicleFlatProperties(analyticsVehicles),
      }

      trackEvent('content_shared', properties)
      pushGaEvent('content_shared', properties)
    } catch (error) {
      if (error instanceof DOMException && error.name === 'AbortError') return
      setStatus('error')
      window.setTimeout(() => setStatus('idle'), 3000)
    }
  }

  const statusLabel = status === 'copied' ? copiedLabel : status === 'error' ? errorLabel : null

  return (
    <div className="flex flex-col items-start gap-2 lg:items-end">
      <button
        type="button"
        onClick={shareVehicle}
        className="inline-flex min-h-11 items-center justify-center rounded-md border border-slate-200 bg-white px-4 text-sm font-semibold text-slate-800 shadow-sm transition hover:border-emerald-300 hover:text-emerald-700"
      >
        {label}
      </button>
      {statusLabel && (
        <p className="text-xs font-medium text-slate-500" role="status">
          {statusLabel}
        </p>
      )}
    </div>
  )
}
