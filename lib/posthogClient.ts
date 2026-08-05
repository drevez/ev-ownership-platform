'use client'

import { readCookieConsent } from '@/lib/cookieConsent'

type PostHogClient = {
  capture: (event: string, properties?: EventProperties) => void
  opt_in_capturing: () => void
  opt_out_capturing: () => void
  reset: () => void
}

type EventProperties = Record<string, string | number | boolean | null | undefined | string[]>

const POSTHOG_KEY = process.env.NEXT_PUBLIC_POSTHOG_KEY
const POSTHOG_HOST = process.env.NEXT_PUBLIC_POSTHOG_HOST || 'https://eu.i.posthog.com'

let posthogClient: PostHogClient | null = null
let posthogLoadPromise: Promise<PostHogClient | null> | null = null
let isPostHogReady = false
const pendingEvents: Array<{ event: string; properties?: EventProperties }> = []

function runWhenIdle(callback: () => void) {
  if (window.requestIdleCallback) {
    window.requestIdleCallback(callback, { timeout: 3000 })
    return
  }

  globalThis.setTimeout(callback, 1200)
}

function hasAnalyticsConsent() {
  return readCookieConsent()?.analytics === true
}

function flushPendingEvents() {
  if (!posthogClient || !isPostHogReady) return

  while (pendingEvents.length > 0) {
    const event = pendingEvents.shift()
    if (event) {
      posthogClient.capture(event.event, event.properties)
    }
  }
}

export function initPostHogAfterConsent() {
  if (!POSTHOG_KEY || posthogClient || posthogLoadPromise) return
  if (!hasAnalyticsConsent()) return

  posthogLoadPromise = new Promise((resolve) => {
    runWhenIdle(() => {
      if (!hasAnalyticsConsent()) {
        posthogLoadPromise = null
        resolve(null)
        return
      }

      void import('posthog-js').then((module) => {
        const posthog = module.default

        posthog.init(POSTHOG_KEY, {
          api_host: POSTHOG_HOST,
          defaults: '2026-01-30',
          autocapture: false,
          capture_pageview: false,
          capture_pageleave: false,
          disable_session_recording: true,
          persistence: 'localStorage',
          respect_dnt: true,
          loaded: (loadedPostHog) => {
            posthogClient = loadedPostHog as PostHogClient
            posthogClient.opt_in_capturing()
            isPostHogReady = true
            flushPendingEvents()
          },
        })

        posthogClient = posthog as PostHogClient
        resolve(posthog)
      }).catch((error) => {
        console.error('PostHog failed to load:', error)
        posthogLoadPromise = null
        resolve(null)
      })
    })
  })
}

export function shutdownPostHog() {
  if (posthogClient) {
    posthogClient.opt_out_capturing()
    posthogClient.reset()
  }

  posthogClient = null
  posthogLoadPromise = null
  isPostHogReady = false
  pendingEvents.length = 0
}

export function trackEvent(event: string, properties?: EventProperties) {
  if (!POSTHOG_KEY || !hasAnalyticsConsent()) return

  if (!posthogClient || !isPostHogReady) {
    pendingEvents.push({ event, properties })
    initPostHogAfterConsent()
    return
  }

  posthogClient.capture(event, properties)
}
