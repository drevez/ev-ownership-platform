'use client'
import { useEffect, useMemo, useRef, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { useTranslations } from '@/hooks/useTranslations'
import { useLocalizedHref } from '@/hooks/useLocalizedHref'

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
  const [query, setQuery] = useState('')
  const [isOpen, setIsOpen] = useState(false)
  const [vehicles, setVehicles] = useState<Vehicle[]>([])

  const router = useRouter()
  const containerRef = useRef<HTMLDivElement>(null)

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
    if (!query.trim()) return

    router.push(localizedHref(`/search?q=${encodeURIComponent(query)}`))
    setIsOpen(false)
  }

  return (
    <div
      ref={containerRef}
      className="relative"
    >
      <div className="bg-white/5 border border-white/10 backdrop-blur-2xl rounded-3xl p-4 flex flex-col md:flex-row gap-4">
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
          className="flex-1 bg-transparent outline-none px-4 py-4 text-lg placeholder:text-zinc-500 text-white"
        />

        <button
          onClick={handleSubmit}
          className="bg-emerald-500 text-black px-8 py-4 rounded-2xl font-semibold hover:bg-emerald-400 transition"
        >
          {t.home.hero.searchButton}
        </button>
      </div>

      {isOpen && results.length > 0 && (
        <div className="absolute top-full mt-4 w-full rounded-3xl border border-white/10 bg-[#111111] backdrop-blur-2xl overflow-hidden shadow-2xl z-50 max-h-96 overflow-y-auto">
          {results.map((vehicle) => (
            <Link
              key={vehicle.slug}
              href={localizedHref(`/models/${vehicle.slug}`)}
              className="block px-6 py-5 hover:bg-white/5 transition border-b border-white/5 last:border-none"
              onClick={() => setIsOpen(false)}
            >
              <p className="font-semibold text-lg text-white">
                {vehicle.name}
              </p>

              <p className="text-zinc-500 text-sm mt-1">
                {vehicle.brand}
              </p>
            </Link>
          ))}
        </div>
      )}
    </div>
  )
}

