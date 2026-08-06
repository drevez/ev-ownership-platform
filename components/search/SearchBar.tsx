'use client'
import { useEffect, useMemo, useRef, useState } from 'react'
import { usePathname, useRouter } from 'next/navigation'
import Link from 'next/link'
import { useTranslations } from '@/hooks/useTranslations'
import { useLocalizedHref } from '@/hooks/useLocalizedHref'
import { useLocale } from '@/context/LocaleContext'
import { buildPageContext, pageContextToFlatProperties } from '@/lib/analytics'
import { delocalizePathname, stripLanguageFromPathname } from '@/lib/i18nRouting'
import { trackEvent } from '@/lib/posthogClient'
import { isTrackableSearchQuery, normalizeSignalText } from '@/lib/productSignals'
import { VehicleSuggestionPrompt } from '@/components/VehicleSuggestionPrompt'

type Vehicle = {
  name: string
  slug: string
  brand: string
}

function slugify(value: string): string {
  return value
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '')
}

function toModelSlug(brand: string, model: string): string {
  return `${slugify(brand)}-${slugify(model)}`
}

export default function SearchBar() {
  const t = useTranslations()
  const localizedHref = useLocalizedHref()
  const pathname = usePathname()
  const { locale } = useLocale()
  const [query, setQuery] = useState('')
  const [isOpen, setIsOpen] = useState(false)
  const [vehicles, setVehicles] = useState<Vehicle[]>([])

  const router = useRouter()
  const containerRef = useRef<HTMLDivElement>(null)
  const lastNoResultSearchRef = useRef('')

  useEffect(() => {
    async function loadSearchData() {
      try {
        const response = await fetch('/api/vehicles/all')
        const data = await response.json()
        if (data && Array.isArray(data.vehicles)) {
          const uniqueModels = new Map<string, Vehicle>()
          for (const item of data.vehicles) {
            const brand = item.brand || ''
            const model = item.model || ''
            const key = `${brand} ${model}`.toLowerCase()
            if (!uniqueModels.has(key)) {
              uniqueModels.set(key, {
                name: `${brand} ${model}`,
                slug: toModelSlug(brand, model),
                brand,
              })
            }
          }
          setVehicles(Array.from(uniqueModels.values()))
        }
      } catch (err) {
        console.error('Error fetching search registry:', err)
      }
    }

    loadSearchData()
  }, [])

  const results = useMemo(() => {
    if (!query.trim()) return []

    const cleanQuery = query.toLowerCase()
    return vehicles.filter(
      (vehicle) =>
        vehicle.name.toLowerCase().includes(cleanQuery) ||
        vehicle.brand.toLowerCase().includes(cleanQuery)
    )
  }, [query, vehicles])

  useEffect(() => {
    if (!isOpen || results.length > 0 || !isTrackableSearchQuery(query)) return

    const queryNormalized = normalizeSignalText(query)
    if (lastNoResultSearchRef.current === queryNormalized) return

    lastNoResultSearchRef.current = queryNormalized
    const canonicalPath = delocalizePathname(stripLanguageFromPathname(pathname))
    const page = buildPageContext({
      path: pathname,
      canonicalPath,
      type: 'home',
      language: locale,
    })
    trackEvent('vehicle_search_no_results', {
      event_schema_version: 2,
      page,
      search: {
        query_normalized: queryNormalized,
        query_length: queryNormalized.length,
        result_count: 0,
        source_component: 'home_search',
      },
      ...pageContextToFlatProperties(page),
      query_normalized: queryNormalized,
      query_length: queryNormalized.length,
      result_count: 0,
      page_type: 'home',
      source_component: 'home_search',
    })
  }, [isOpen, locale, pathname, query, results.length])

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        containerRef.current &&
        !containerRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)

    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [])

  const handleSubmit = () => {
    const cleanQuery = query.trim()
    if (!cleanQuery) return

    const queryNormalized = normalizeSignalText(cleanQuery)
    trackEvent('vehicle_search_performed', {
      query_normalized: queryNormalized,
      query_length: queryNormalized.length,
      result_count: results.length,
      page_type: 'home',
      page_path: pathname,
      locale,
      source_component: 'home_search',
    })

    if (results.length === 0 && lastNoResultSearchRef.current !== queryNormalized) {
      lastNoResultSearchRef.current = queryNormalized
      const canonicalPath = delocalizePathname(stripLanguageFromPathname(pathname))
      const page = buildPageContext({
        path: pathname,
        canonicalPath,
        type: 'home',
        language: locale,
      })
      trackEvent('vehicle_search_no_results', {
        event_schema_version: 2,
        page,
        search: {
          query_normalized: queryNormalized,
          query_length: queryNormalized.length,
          result_count: 0,
          source_component: 'home_search',
        },
        ...pageContextToFlatProperties(page),
        query_normalized: queryNormalized,
        query_length: queryNormalized.length,
        result_count: 0,
        page_type: 'home',
        source_component: 'home_search',
      })
    }

    router.push(localizedHref(`/search?q=${encodeURIComponent(cleanQuery)}`))
    setIsOpen(false)
  }

  return (
    <div
      ref={containerRef}
      className="relative"
    >
      <div className="flex flex-col gap-3 rounded-lg border border-white/10 bg-white/5 p-3 backdrop-blur-2xl md:flex-row md:gap-4 md:p-4">
        <input
          type="text"
          value={query}
          onChange={(e) => {
            setQuery(e.target.value)
            setIsOpen(true)
          }}
          onKeyDown={(e) => {
            if (e.key === 'Enter') {
              handleSubmit()
            }
          }}
          placeholder={t.home.hero.searchPlaceholder}
          className="min-w-0 flex-1 bg-transparent px-3 py-3 text-base text-white outline-none placeholder:text-zinc-500 sm:px-4 sm:py-4 sm:text-lg"
        />

        <button
          onClick={handleSubmit}
          className="rounded-lg bg-emerald-500 px-6 py-3 font-semibold text-black transition hover:bg-emerald-400 sm:px-8 sm:py-4"
        >
          {t.home.hero.searchButton}
        </button>
      </div>

      {isOpen && results.length > 0 && (
        <div className="absolute top-full z-50 mt-3 max-h-96 w-full overflow-y-auto overflow-hidden rounded-lg border border-white/10 bg-[#111111] shadow-2xl backdrop-blur-2xl sm:mt-4">
          {results.map((vehicle) => (
            <Link
              key={vehicle.slug}
              href={localizedHref(`/models/${vehicle.slug}`)}
              className="block border-b border-white/5 px-5 py-4 transition last:border-none hover:bg-white/5 sm:px-6 sm:py-5"
              onClick={() => setIsOpen(false)}
            >
              <p className="text-base font-semibold text-white sm:text-lg">
                {vehicle.name}
              </p>

              <p className="text-zinc-500 text-sm mt-1">
                {vehicle.brand}
              </p>
            </Link>
          ))}
        </div>
      )}

      {isOpen && results.length === 0 && isTrackableSearchQuery(query) && (
        <div className="absolute top-full z-50 mt-3 w-full overflow-hidden rounded-lg border border-white/10 bg-[#111111] p-3 shadow-2xl backdrop-blur-2xl sm:mt-4">
          <VehicleSuggestionPrompt
            query={query}
            resultCount={0}
            sourceComponent="home_search"
            tone="dark"
          />
        </div>
      )}
    </div>
  )
}
