'use client'

import { useEffect } from 'react'

import {
  COOKIE_CONSENT_UPDATED_EVENT,
  readCookieConsent,
} from '@/lib/cookieConsent'
import {
  initPostHogAfterConsent,
  shutdownPostHog,
} from '@/lib/posthogClient'

export function PostHogConsentLoader() {
  useEffect(() => {
    const syncPostHogWithConsent = () => {
      if (readCookieConsent()?.analytics) {
        initPostHogAfterConsent()
      } else {
        shutdownPostHog()
      }
    }

    syncPostHogWithConsent()

    window.addEventListener(COOKIE_CONSENT_UPDATED_EVENT, syncPostHogWithConsent)
    window.addEventListener('storage', syncPostHogWithConsent)

    return () => {
      window.removeEventListener(COOKIE_CONSENT_UPDATED_EVENT, syncPostHogWithConsent)
      window.removeEventListener('storage', syncPostHogWithConsent)
    }
  }, [])

  return null
}
