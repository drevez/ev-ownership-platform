'use client'

import Link from 'next/link'

import { useLocale } from '../context/LocaleContext'
import { useTranslations } from '../hooks/useTranslations'
import { useLocalizedHref } from '../hooks/useLocalizedHref'
import { LANGUAGE_LABELS, SUPPORTED_LANGUAGES, type Language } from '@/config/i18n'

export function SiteFooter() {
  const { locale, setLocale } = useLocale()
  const t = useTranslations()
  const localizedHref = useLocalizedHref()
  return (
    <footer className="relative overflow-hidden border-t border-white/5 bg-gradient-to-b from-black via-zinc-950 to-black text-white">

      {/* Ambient glow */}
      <div className="pointer-events-none absolute inset-0 opacity-20">
        <div className="absolute left-1/3 top-0 h-[420px] w-[420px] rounded-full bg-emerald-500/10 blur-3xl" />
      </div>

      <div className="relative mx-auto max-w-6xl px-6 py-20">

        <div className="grid grid-cols-1 gap-20 lg:grid-cols-12">

          {/* Left */}
          <div className="lg:col-span-5">

            <h2 className="text-5xl font-bold tracking-tight text-white">
              MotorZero
            </h2>

            <p className="mt-8 max-w-sm text-lg leading-relaxed text-zinc-400">
              {t.footer.description}
            </p>

            <p className="mt-8 max-w-sm text-base leading-relaxed text-zinc-500">
              {t.footer.subdescription}
            </p>

          </div>

          {/* Right */}
          <div className="lg:col-span-7">

            <div className="grid grid-cols-2 gap-16">

              {/* Explore */}
              <div>

                <h3 className="mb-6 text-sm font-semibold uppercase tracking-[0.18em] text-zinc-300">
                  {t.footer.explore}
                </h3>

                <ul className="space-y-5">

                  <FooterLink href={localizedHref('/recommend')}>
                    {t.footer.findYourEv}
                  </FooterLink>

                  <FooterLink href={localizedHref('/compare')}>
                    {t.footer.compareVehicles}
                  </FooterLink>

                  <FooterLink href={localizedHref('/models')}>
                    {t.footer.browseModels}
                  </FooterLink>

                  <FooterLink href={localizedHref('/guides')}>
                    {t.footer.buyingGuides}
                  </FooterLink>

                  <FooterLink href={localizedHref('/charging')}>
                    {t.footer.charging}
                  </FooterLink>

                </ul>
              </div>

              {/* Other */}
              <div>

                <h3 className="mb-6 text-sm font-semibold uppercase tracking-[0.18em] text-zinc-300">
                  {t.footer.other}
                </h3>

                <ul className="space-y-5">

                  <FooterLink href={localizedHref('/about')}>
                    {t.footer.about}
                  </FooterLink>

                  <FooterLink href={localizedHref('/contacts')}>
                    {t.footer.contacts}
                  </FooterLink>

                </ul>

                {/* Language */}
                <div className="mt-14">

                  <p className="mb-3 text-xs font-semibold uppercase tracking-[0.18em] text-zinc-500">
                    {t.footer.language}
                  </p>

                  <div className="inline-flex items-center rounded-2xl bg-zinc-900/40 backdrop-blur-md ring-1 ring-white/5 transition-all duration-300 hover:bg-zinc-900/60 hover:ring-emerald-500/20">

                    <select
                      value={locale}
                      onChange={(e) => setLocale(e.target.value as Language)}
                      className="appearance-none bg-transparent px-4 py-2.5 pr-10 text-sm text-zinc-300 outline-none transition-colors duration-300 hover:text-white"
                    >
                      {SUPPORTED_LANGUAGES.map((language) => (
                        <option
                          key={language}
                          value={language}
                          className="bg-zinc-950"
                        >
                          {LANGUAGE_LABELS[language]}
                        </option>
                      ))}
                    </select>

                    <div className="pointer-events-none mr-4 text-xs text-zinc-500">
                      ▼
                    </div>

                  </div>
                </div>

              </div>

            </div>
          </div>
        </div>

        {/* Bottom */}
        <div className="mt-20 border-t border-white/5 pt-10">

          <div className="flex flex-col items-center justify-between gap-5 md:flex-row">

            <p className="text-sm text-zinc-600">
              © 2026 MotorZero
            </p>

            <div className="flex items-center gap-6">

              <Link
                href={localizedHref('/privacy')}
                className="text-sm text-zinc-600 transition-colors duration-300 hover:text-zinc-300"
              >
                {t.footer.privacy}
              </Link>

              <Link
                href={localizedHref('/terms')}
                className="text-sm text-zinc-600 transition-colors duration-300 hover:text-zinc-300"
              >
                {t.footer.terms}
              </Link>

              <Link
                href={localizedHref('/cookies')}
                className="text-sm text-zinc-600 transition-colors duration-300 hover:text-zinc-300"
              >
                {t.footer.cookies}
              </Link>

            </div>
          </div>
        </div>
      </div>
    </footer>
  )
}

function FooterLink({
  href,
  children,
}: {
  href: string
  children: React.ReactNode
}) {
  return (
    <li>
      <Link
        href={href}
        className="group inline-flex items-center text-[15px] text-zinc-500 transition-all duration-300 hover:translate-x-0.5 hover:text-zinc-200"
      >
        {children}
      </Link>
    </li>
  )
}
