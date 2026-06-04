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
    <header className="border-b border-white/10 backdrop-blur-xl sticky top-0 z-50 bg-black/60">
      <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">

        {/* Logo */}
        <Link href={localizedHref('/')} className="text-2xl font-bold tracking-tight text-white">
          MotorZero
        </Link>

        {/* Desktop nav */}
        <nav className="hidden md:flex items-center gap-8 text-sm">
          {links.map(({ href, key }) => {
            const isActive = basePathname === href
            return (
              <Link
                key={href}
                href={localizedHref(href)}
                className={`relative pb-1 transition ${
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
        <div className="hidden md:flex items-center gap-4">
          {!isOnRecommend && (
            <Link
              href={localizedHref('/recommend')}
              className="bg-emerald-500 hover:bg-emerald-400 text-black px-5 py-3 rounded-full font-semibold transition"
            >
              {t.navigation.idealEv}
            </Link>
          )}
        </div>

        {/* Mobile hamburger */}
        <button
          className="md:hidden text-white p-2"
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
        <div className="md:hidden border-t border-white/10 bg-black/90 px-6 py-4 flex flex-col gap-4">
          {links.map(({ href, key }) => {
            const isActive = basePathname === href
            return (
              <Link
                key={href}
                href={localizedHref(href)}
                onClick={() => setMenuOpen(false)}
                className={`text-sm py-2 border-b border-white/5 transition ${
                  isActive
                    ? 'text-white font-medium'
                    : 'text-zinc-400 hover:text-white'
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
              className="mt-2 bg-emerald-500 hover:bg-emerald-400 text-black px-5 py-3 rounded-full font-semibold text-center transition"
            >
              {t.navigation.idealEv}
            </Link>
          )}
        </div>
      )}
    </header>
  )
}
