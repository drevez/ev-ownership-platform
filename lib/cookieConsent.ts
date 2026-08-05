'use client'

export const CONSENT_STORAGE_KEY = 'motorzero_cookie_consent_v1'
export const OPEN_COOKIE_SETTINGS_EVENT = 'motorzero:open-cookie-settings'
export const COOKIE_CONSENT_UPDATED_EVENT = 'motorzero:consent-updated'
export const CONSENT_POLICY_VERSION = 1
export const CONSENT_MAX_AGE_DAYS = 180

export interface CookieConsentChoice {
  analytics: boolean
  marketing: boolean
  updatedAt: string
  expiresAt: string
  policyVersion: number
}

export function readCookieConsent(): CookieConsentChoice | null {
  try {
    const value = window.localStorage.getItem(CONSENT_STORAGE_KEY)
    if (!value) return null

    const parsed = JSON.parse(value) as Partial<CookieConsentChoice>
    if (
      typeof parsed.analytics !== 'boolean' ||
      typeof parsed.marketing !== 'boolean' ||
      parsed.policyVersion !== CONSENT_POLICY_VERSION ||
      typeof parsed.expiresAt !== 'string' ||
      Date.parse(parsed.expiresAt) <= Date.now()
    ) {
      window.localStorage.removeItem(CONSENT_STORAGE_KEY)
      return null
    }

    return {
      analytics: parsed.analytics,
      marketing: parsed.marketing,
      updatedAt: typeof parsed.updatedAt === 'string' ? parsed.updatedAt : '',
      expiresAt: parsed.expiresAt,
      policyVersion: parsed.policyVersion,
    }
  } catch {
    return null
  }
}

export function applyCookieConsent(choice: CookieConsentChoice) {
  window.dataLayer = window.dataLayer || []

  if (!choice.analytics) deleteGoogleAnalyticsCookies()

  // Consent updates happen here after the visitor makes or restores a choice.
  window.gtag?.('consent', 'update', {
    analytics_storage: choice.analytics ? 'granted' : 'denied',
    ad_storage: choice.marketing ? 'granted' : 'denied',
    ad_user_data: choice.marketing ? 'granted' : 'denied',
    ad_personalization: choice.marketing ? 'granted' : 'denied',
  })

  window.dataLayer.push({
    event: 'consent_update',
    analytics_storage: choice.analytics ? 'granted' : 'denied',
    ad_storage: choice.marketing ? 'granted' : 'denied',
    ad_user_data: choice.marketing ? 'granted' : 'denied',
    ad_personalization: choice.marketing ? 'granted' : 'denied',
  })

  window.dispatchEvent(
    new CustomEvent(COOKIE_CONSENT_UPDATED_EVENT, { detail: choice })
  )
}

export function saveCookieConsent(
  choice: Pick<CookieConsentChoice, 'analytics' | 'marketing'>
) {
  const now = new Date()
  const expiresAt = new Date(now)
  expiresAt.setDate(expiresAt.getDate() + CONSENT_MAX_AGE_DAYS)

  const storedChoice: CookieConsentChoice = {
    ...choice,
    updatedAt: now.toISOString(),
    expiresAt: expiresAt.toISOString(),
    policyVersion: CONSENT_POLICY_VERSION,
  }

  window.localStorage.setItem(
    CONSENT_STORAGE_KEY,
    JSON.stringify(storedChoice)
  )
  applyCookieConsent(storedChoice)

  return storedChoice
}

function deleteGoogleAnalyticsCookies() {
  const cookieNames = document.cookie
    .split(';')
    .map((cookie) => cookie.trim().split('=')[0])
    .filter((name) => name === '_ga' || name.startsWith('_ga_'))

  const hostParts = window.location.hostname.split('.')
  const parentDomain = hostParts.length > 1
    ? `.${hostParts.slice(-2).join('.')}`
    : null

  cookieNames.forEach((name) => {
    document.cookie = `${name}=; Max-Age=0; path=/; SameSite=Lax`
    if (parentDomain) {
      document.cookie = `${name}=; Max-Age=0; path=/; domain=${parentDomain}; SameSite=Lax`
    }
  })
}

declare global {
  interface Window {
    gtag?: (...args: unknown[]) => void
  }
}
