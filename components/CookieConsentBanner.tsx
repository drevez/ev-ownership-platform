'use client'

import { useCallback, useEffect, useState } from 'react'

import {
  OPEN_COOKIE_SETTINGS_EVENT,
  readCookieConsent,
  saveCookieConsent,
} from '@/lib/cookieConsent'
import { useTranslations } from '@/hooks/useTranslations'

export function CookieConsentBanner() {
  const t = useTranslations()
  const [isVisible, setIsVisible] = useState(false)
  const [isManaging, setIsManaging] = useState(false)
  const [analytics, setAnalytics] = useState(false)
  const [marketing, setMarketing] = useState(false)

  const openSettings = useCallback(() => {
    const savedChoice = readCookieConsent()
    setAnalytics(savedChoice?.analytics ?? false)
    setMarketing(savedChoice?.marketing ?? false)
    setIsManaging(true)
    setIsVisible(true)
  }, [])

  useEffect(() => {
    queueMicrotask(() => {
      const savedChoice = readCookieConsent()
      if (!savedChoice) setIsVisible(true)
    })

    window.addEventListener(OPEN_COOKIE_SETTINGS_EVENT, openSettings)
    return () => {
      window.removeEventListener(OPEN_COOKIE_SETTINGS_EVENT, openSettings)
    }
  }, [openSettings])

  function persistChoice(nextAnalytics: boolean, nextMarketing: boolean) {
    saveCookieConsent({
      analytics: nextAnalytics,
      marketing: nextMarketing,
    })
    setAnalytics(nextAnalytics)
    setMarketing(nextMarketing)
    setIsManaging(false)
    setIsVisible(false)
  }

  if (!isVisible) return null

  return (
    <section
      aria-label={t.cookieConsent.title}
      className="fixed inset-x-0 bottom-0 z-[60] max-h-[calc(100dvh-1rem)] overflow-y-auto border-t border-white/10 bg-zinc-950/95 text-white shadow-[0_-24px_70px_rgba(0,0,0,0.55)] backdrop-blur-xl"
    >
      <div className="mx-auto max-w-6xl px-5 py-5 sm:px-6 sm:py-6">
        <div className={isManaging
          ? 'grid gap-5 lg:grid-cols-[minmax(0,0.85fr)_minmax(340px,1fr)] lg:gap-8'
          : 'grid gap-5 lg:grid-cols-[minmax(0,1fr)_auto] lg:items-center lg:gap-10'
        }>
          <div className="max-w-2xl">
            <div className="mb-3 flex items-center gap-3">
              <span
                aria-hidden="true"
                className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-emerald-400/10 text-emerald-300 ring-1 ring-emerald-400/20"
              >
                <PrivacyIcon />
              </span>
              <div>
                <p className="text-xs font-semibold uppercase text-emerald-300">
                  MotorZero
                </p>
                <h2 className="text-lg font-semibold leading-tight">
                  {t.cookieConsent.title}
                </h2>
              </div>
            </div>
            <p className="text-sm leading-6 text-zinc-300">
              {isManaging
                ? t.cookieConsent.preferencesDescription
                : t.cookieConsent.description}
            </p>
          </div>

          {isManaging ? (
            <div className="grid gap-4">
              <div className="grid gap-2 sm:grid-cols-2">
                <ConsentToggle
                  checked={analytics}
                  label={t.cookieConsent.analytics}
                  description={t.cookieConsent.analyticsDescription}
                  onChange={setAnalytics}
                />
                <ConsentToggle
                  checked={marketing}
                  label={t.cookieConsent.marketing}
                  description={t.cookieConsent.marketingDescription}
                  onChange={setMarketing}
                />
              </div>
              <div className="flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
              <EqualChoiceButton onClick={() => persistChoice(false, false)}>
                {t.cookieConsent.rejectAll}
              </EqualChoiceButton>
                <PrimaryButton onClick={() => persistChoice(analytics, marketing)}>
                  {t.cookieConsent.savePreferences}
                </PrimaryButton>
              </div>
            </div>
          ) : (
            <div className="flex flex-col-reverse gap-2 sm:flex-row lg:justify-end">
              <button
                type="button"
                onClick={openSettings}
                className="min-h-11 px-4 text-sm font-semibold text-zinc-300 transition-colors hover:text-white"
              >
                {t.cookieConsent.managePreferences}
              </button>
              <EqualChoiceButton onClick={() => persistChoice(false, false)}>
                {t.cookieConsent.rejectAll}
              </EqualChoiceButton>
              <PrimaryButton onClick={() => persistChoice(true, true)}>
                {t.cookieConsent.acceptAll}
              </PrimaryButton>
            </div>
          )}
        </div>
      </div>
    </section>
  )
}

function ConsentToggle({
  checked,
  label,
  description,
  onChange,
}: {
  checked: boolean
  label: string
  description: string
  onChange: (checked: boolean) => void
}) {
  return (
    <label className="flex min-h-24 cursor-pointer items-start justify-between gap-4 rounded-lg border border-white/10 bg-white/[0.035] p-4 transition-colors hover:border-white/20 hover:bg-white/[0.055]">
      <span>
        <span className="block text-sm font-semibold">{label}</span>
        <span className="mt-1 block text-xs leading-5 text-zinc-400">
          {description}
        </span>
      </span>
      <input
        type="checkbox"
        checked={checked}
        onChange={(event) => onChange(event.target.checked)}
        className="peer sr-only"
      />
      <span
        aria-hidden="true"
        className="relative mt-0.5 h-6 w-11 shrink-0 rounded-full bg-zinc-700 ring-1 ring-white/10 transition-colors after:absolute after:left-1 after:top-1 after:h-4 after:w-4 after:rounded-full after:bg-white after:shadow-sm after:transition-transform after:content-[''] peer-checked:bg-emerald-400 peer-checked:after:translate-x-5"
      />
    </label>
  )
}

function PrimaryButton({
  children,
  onClick,
}: {
  children: React.ReactNode
  onClick: () => void
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="min-h-11 rounded-md bg-emerald-400 px-5 text-sm font-semibold text-black transition-colors hover:bg-emerald-300 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-emerald-300"
    >
      {children}
    </button>
  )
}

function EqualChoiceButton({
  children,
  onClick,
}: {
  children: React.ReactNode
  onClick: () => void
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="min-h-11 rounded-md bg-zinc-100 px-5 text-sm font-semibold text-zinc-950 transition-colors hover:bg-white focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white"
    >
      {children}
    </button>
  )
}

function PrivacyIcon() {
  return (
    <svg
      width="18"
      height="18"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10Z" />
      <path d="m9 12 2 2 4-4" />
    </svg>
  )
}
