'use client'

import { useEffect } from 'react'

import { trackEvent } from '@/lib/posthogClient'

type ViewEventProperties = Record<string, string | number | boolean | null | undefined | string[]>

export function ViewEventTracker({
  event,
  properties,
}: {
  event: string
  properties?: ViewEventProperties
}) {
  useEffect(() => {
    trackEvent(event, properties)
  }, [event, properties])

  return null
}
