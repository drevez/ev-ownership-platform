import type { Metadata } from 'next'
import { Geist, Geist_Mono } from 'next/font/google'

import './globals.css'

import { CompareProvider } from '@/context/CompareContext'
import { LocaleProvider } from '@/context/LocaleContext'
import { ComparisonBar } from '@/components/comparison/ComparisonBar'
import { ComparisonBarPaddingManager } from '@/components/comparison/ComparisonBarPaddingManager'
import { SiteHeader } from '@/components/SiteHeader'
import { SiteFooter } from '@/components/SiteFooter'

import { getTranslations } from '@/lib/getTranslations'
import { getRequestLanguage, getRequestPathname } from '@/lib/serverLocale'
import { buildLocalizedHref, stripLanguageFromPathname } from '@/lib/i18nRouting'
import {
  LANGUAGE_LOCALES,
  SUPPORTED_LANGUAGES,
  type Language,
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
  const languages = SUPPORTED_LANGUAGES.reduce<Record<Language, string>>(
    (acc, language) => {
      acc[language] = buildLocalizedHref(basePathname, language)
      return acc
    },
    {} as Record<Language, string>
  )

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
    >
      <body className="min-h-full flex flex-col">
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
            <SiteFooter />
            <ComparisonBar />
          </CompareProvider>
        </LocaleProvider>
      </body>
    </html>
  )
}
