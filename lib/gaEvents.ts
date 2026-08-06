'use client'

import { readCookieConsent } from '@/lib/cookieConsent'
import type { AnalyticsProperties } from '@/lib/analytics'

export type GaEventProperties = AnalyticsProperties

export function pushGaEvent(event: string, properties: GaEventProperties = {}) {
  if (readCookieConsent()?.analytics !== true) return

  window.dataLayer = window.dataLayer || []
  window.dataLayer.push({
    event,
    ...properties,
  })
}

declare global {
  interface Window {
    dataLayer?: unknown[]
  }
}
