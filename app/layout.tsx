import type { Metadata } from 'next'
import { Geist, Geist_Mono } from 'next/font/google'

import './globals.css'

import { CompareProvider } from '@/context/CompareContext'
import { LocaleProvider } from '@/context/LocaleContext'
import { ComparisonBar } from '@/components/comparison/ComparisonBar'
import { ComparisonBarPaddingManager } from '@/components/comparison/ComparisonBarPaddingManager'
import { CookieConsentBanner } from '@/components/CookieConsentBanner'
import { GoogleTagManager } from '@/components/GoogleTagManager'
import { PageFeedback } from '@/components/PageFeedback'
import { SiteHeader } from '@/components/SiteHeader'
import { SiteFooter } from '@/components/SiteFooter'

import { getTranslations } from '@/lib/getTranslations'
import { getRequestLanguage, getRequestPathname } from '@/lib/serverLocale'
import { buildLocalizedHref, stripLanguageFromPathname } from '@/lib/i18nRouting'
import {
  DEFAULT_LANGUAGE,
  LANGUAGE_LOCALES,
  SUPPORTED_LANGUAGES,
} from '@/config/i18n'
import { getSiteUrl } from '@/lib/siteUrl'

const geistSans = Geist({
  variable: '--font-geist-sans',
  subsets: ['latin'],
})

const geistMono = Geist_Mono({
  variable: '--font-geist-mono',
  subsets: ['latin'],
})

export async function generateMetadata(): Promise<Metadata> {
  const locale = await getRequestLanguage()
  const pathname = await getRequestPathname()
  const basePathname = stripLanguageFromPathname(pathname)
  const t = getTranslations(locale)
  const languages = SUPPORTED_LANGUAGES.reduce<Record<string, string>>(
    (acc, language) => {
      acc[LANGUAGE_LOCALES[language]] = buildLocalizedHref(basePathname, language)
      return acc
    },
    {}
  )
  languages['x-default'] = buildLocalizedHref(basePathname, DEFAULT_LANGUAGE)

  return {
    metadataBase: new URL(getSiteUrl()),
    title: {
      default: t.metadata.title,
      template: t.metadata.titleTemplate,
    },
    description: t.metadata.description,
    applicationName: 'MotorZero',
    alternates: {
      canonical: buildLocalizedHref(basePathname, locale),
      languages,
    },
    openGraph: {
      title: t.metadata.title,
      description: t.metadata.description,
      locale: LANGUAGE_LOCALES[locale],
      type: 'website',
      siteName: 'MotorZero',
    },
  }
}

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  const locale = await getRequestLanguage()
  const t = getTranslations(locale)
  const siteUrl = getSiteUrl()
  const structuredData = [
    {
      '@context': 'https://schema.org',
      '@type': 'Organization',
      name: 'MotorZero',
      url: siteUrl,
    },
    {
      '@context': 'https://schema.org',
      '@type': 'WebSite',
      name: 'MotorZero',
      url: siteUrl,
      description: t.metadata.description,
      inLanguage: LANGUAGE_LOCALES[locale],
    },
  ]

  return (
    <html
      lang={LANGUAGE_LOCALES[locale]}
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
      suppressHydrationWarning
    >
      <head>
        {/* Consent Mode defaults are set before GTM or any Google tag loads. */}
        <script
          id="google-consent-defaults"
          dangerouslySetInnerHTML={{
            __html: `
              window.dataLayer = window.dataLayer || [];
              window.gtag = window.gtag || function(){dataLayer.push(arguments);};
              window.gtag('consent', 'default', {
                ad_storage: 'denied',
                analytics_storage: 'denied',
                ad_user_data: 'denied',
                ad_personalization: 'denied',
                functionality_storage: 'granted',
                security_storage: 'granted',
                wait_for_update: 500
              });

              try {
                var savedConsent = window.localStorage.getItem('motorzero_cookie_consent_v1');
                if (savedConsent) {
                  var consent = JSON.parse(savedConsent);
                  if (
                    typeof consent.analytics === 'boolean' &&
                    typeof consent.marketing === 'boolean' &&
                    consent.policyVersion === 1 &&
                    typeof consent.expiresAt === 'string' &&
                    Date.parse(consent.expiresAt) > Date.now()
                  ) {
                    window.gtag('consent', 'update', {
                      analytics_storage: consent.analytics ? 'granted' : 'denied',
                      ad_storage: consent.marketing ? 'granted' : 'denied',
                      ad_user_data: consent.marketing ? 'granted' : 'denied',
                      ad_personalization: consent.marketing ? 'granted' : 'denied'
                    });
                    window.dataLayer.push({
                      event: 'consent_update',
                      analytics_storage: consent.analytics ? 'granted' : 'denied',
                      ad_storage: consent.marketing ? 'granted' : 'denied',
                      ad_user_data: consent.marketing ? 'granted' : 'denied',
                      ad_personalization: consent.marketing ? 'granted' : 'denied'
                    });
                  } else {
                    window.localStorage.removeItem('motorzero_cookie_consent_v1');
                  }
                }
              } catch (error) {
                // Invalid or unavailable local storage leaves consent denied.
              }
            `,
          }}
        />
      </head>
      <body className="min-h-full flex flex-col">
        <GoogleTagManager />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify(structuredData).replace(/</g, '\\u003c'),
          }}
        />
        <LocaleProvider initialLocale={locale}>
          <CompareProvider>
            <SiteHeader />

            <ComparisonBarPaddingManager />

            <main className="flex-1">
              {children}
            </main>
            <PageFeedback />
            <SiteFooter />
            <ComparisonBar />
            <CookieConsentBanner />
          </CompareProvider>
        </LocaleProvider>
      </body>
    </html>
  )
}
