'use client'

import { useEffect, useRef } from 'react'

import {
  COOKIE_CONSENT_UPDATED_EVENT,
  readCookieConsent,
} from '@/lib/cookieConsent'
import type { AnalyticsProperties } from '@/lib/analytics'
import { pushGaEvent, type GaEventProperties } from '@/lib/gaEvents'
import { trackEvent } from '@/lib/posthogClient'

type ViewEventProperties = AnalyticsProperties

export function ViewEventTracker({
  event,
  properties,
  gaEvent,
  gaProperties,
}: {
  event: string
  properties?: ViewEventProperties
  gaEvent?: string
  gaProperties?: GaEventProperties
}) {
  const hasTracked = useRef(false)

  useEffect(() => {
    const trackOnce = () => {
      if (hasTracked.current || !readCookieConsent()?.analytics) return

      hasTracked.current = true
      trackEvent(event, properties)
      if (gaEvent) {
        pushGaEvent(gaEvent, gaProperties)
      }
    }

    trackOnce()
    window.addEventListener(COOKIE_CONSENT_UPDATED_EVENT, trackOnce)

    return () => {
      window.removeEventListener(COOKIE_CONSENT_UPDATED_EVENT, trackOnce)
    }
  }, [event, properties, gaEvent, gaProperties])

  return null
}
