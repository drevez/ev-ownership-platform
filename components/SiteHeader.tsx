'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useState } from 'react'
import { useTranslations } from '@/hooks/useTranslations'
import { useLocalizedHref } from '@/hooks/useLocalizedHref'
import { stripLanguageFromPathname } from '@/lib/i18nRouting'

const links: { href: string; key: 'models' | 'compare' | 'idealEv' }[] = [
  { href: '/models', key: 'models' },
  { href: '/compare', key: 'compare' },
  { href: '/recommend', key: 'idealEv' },
]

export function SiteHeader() {
  const pathname = usePathname()
  const basePathname = stripLanguageFromPathname(pathname)
  const t = useTranslations()
  const localizedHref = useLocalizedHref()
  const [menuOpen, setMenuOpen] = useState(false)
  const isOnRecommend = basePathname === '/recommend'

  return (
    <header className="sticky top-0 z-50 border-b border-white/10 bg-black/70 backdrop-blur-xl">
      <div className="mx-auto flex h-14 max-w-7xl items-center justify-between px-4 sm:h-20 sm:px-6">

        {/* Logo */}
        <Link href={localizedHref('/')} className="text-xl font-bold tracking-tight text-white sm:text-2xl">
          MotorZero
        </Link>

        {/* Desktop nav */}
        <nav className="hidden items-center gap-6 text-sm xl:gap-8 lg:flex">
          {links.map(({ href, key }) => {
            const isActive = basePathname === href
            return (
              <Link
                key={href}
                href={localizedHref(href)}
                className={`relative whitespace-nowrap pb-1 transition ${
                  isActive
                    ? 'text-white font-medium'
                    : 'text-zinc-400 hover:text-white'
                }`}
              >
                {t.navigation[key as keyof typeof t.navigation]}
                {isActive && (
                  <span className="absolute bottom-0 left-0 right-0 h-[2px] bg-emerald-500 rounded-full" />
                )}
              </Link>
            )
          })}
        </nav>

        {/* CTA — hidden when already on /recommend */}
        <div className="hidden items-center gap-4 lg:flex">
          {!isOnRecommend && (
            <Link
              href={localizedHref('/recommend')}
              className="whitespace-nowrap rounded-full bg-emerald-500 px-5 py-3 font-semibold text-black transition hover:bg-emerald-400"
            >
              {t.navigation.idealEv}
            </Link>
          )}
        </div>

        {/* Mobile hamburger */}
        <button
          className="inline-flex h-10 w-10 items-center justify-center rounded-md text-white transition hover:bg-white/10 lg:hidden"
          onClick={() => setMenuOpen(!menuOpen)}
          aria-label="Toggle menu"
        >
          {menuOpen ? (
            <svg className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          ) : (
            <svg className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          )}
        </button>
      </div>

      {/* Mobile menu */}
      {menuOpen && (
        <div className="flex flex-col gap-3 border-t border-white/10 bg-black/95 px-4 py-4 shadow-2xl lg:hidden">
          {links.map(({ href, key }) => {
            const isActive = basePathname === href
            return (
              <Link
                key={href}
                href={localizedHref(href)}
                onClick={() => setMenuOpen(false)}
                className={`rounded-md border border-white/5 px-3 py-3 text-sm transition ${
                  isActive
                    ? 'bg-white/5 text-white font-medium'
                    : 'text-zinc-400 hover:bg-white/5 hover:text-white'
                }`}
              >
                {isActive && <span className="text-emerald-500 mr-2">▸</span>}
                {t.navigation[key as keyof typeof t.navigation]}
              </Link>
            )
          })}
          {!isOnRecommend && (
            <Link
              href={localizedHref('/recommend')}
              onClick={() => setMenuOpen(false)}
              className="mt-1 rounded-full bg-emerald-500 px-5 py-3 text-center font-semibold text-black transition hover:bg-emerald-400"
            >
              {t.navigation.idealEv}
            </Link>
          )}
        </div>
      )}
    </header>
  )
}
