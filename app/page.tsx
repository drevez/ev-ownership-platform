'use client'
import Link from 'next/link'
import SearchBar from '@/components/search/SearchBar'
import { useTranslations } from '@/hooks/useTranslations'
import { useLocalizedHref } from '@/hooks/useLocalizedHref'

const featuredComparisons = [
  {
    title: 'Tesla Model Y Long Range vs Kia EV5 Tech',
    subtitleKey: 'familySuvs',
    image:
      'https://images.unsplash.com/photo-1617788138017-80ad40651399?q=80&w=1600&auto=format&fit=crop',
    ids: ['tesla-model-y-long-range', 'kia-ev5-tech']
  },
  {
    title: 'Volvo EX30 vs Smart #1',
    subtitleKey: 'compactPremium',
    image:
      'https://images.unsplash.com/photo-1553440569-bcc63803a83d?q=80&w=1600&auto=format&fit=crop',
    ids: ['volvo-ex30-69kwh', 'smart-1-66kwh']
  }
] as const

const featuredVehicles = [
  {
    name: 'Kia EV5',
    modelSlug: 'kia-ev5',
    range: '520 km',
    charging: '150 kW',
    image:
      'https://images.unsplash.com/photo-1492144534655-ae79c964c9d7?q=80&w=1600&auto=format&fit=crop'
  },
  {
    name: 'Volvo EX30',
    modelSlug: 'volvo-ex30',
    range: '475 km',
    charging: '153 kW',
    image:
      'https://images.unsplash.com/photo-1503376780353-7e6692767b70?q=80&w=1600&auto=format&fit=crop'
  },
  {
    name: 'Tesla Model 3',
    modelSlug: 'tesla-model-3',
    range: '629 km',
    charging: '250 kW',
    image:
      'https://images.unsplash.com/photo-1494976388531-d1058494cdd8?q=80&w=1600&auto=format&fit=crop'
  }
]

export default function HomePage() {
  const t = useTranslations()
  const localizedHref = useLocalizedHref()
  return (
    <main className="bg-[#0a0a0a] text-white min-h-screen overflow-hidden">

      {/* Hero */}

      <section className="relative">
        <div
          className="absolute inset-0 bg-cover bg-center opacity-30"
          style={{
            backgroundImage:
              'url(https://images.unsplash.com/photo-1552519507-da3b142c6e3d?q=80&w=2000&auto=format&fit=crop)'
          }}
        />

        <div className="absolute inset-0 bg-gradient-to-b from-black/30 via-black/70 to-[#0a0a0a]" />

        <div className="relative mx-auto max-w-7xl px-4 py-20 sm:px-6 sm:py-28 lg:py-40">
          <div className="max-w-4xl">
            <p className="text-emerald-400 font-medium mb-6 tracking-wide uppercase text-sm">
              {t.home.hero.eyebrow}
            </p>

            <h1 className="text-5xl font-bold leading-[0.95] tracking-tight sm:text-6xl md:text-7xl lg:text-8xl">
              {t.home.hero.title}
            </h1>

            <p className="mt-7 max-w-2xl text-lg leading-relaxed text-zinc-300 sm:text-xl">
              {t.home.hero.subtitle}
            </p>

            <div className="mt-9 flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:gap-4">
              <Link
                href={localizedHref('/recommend')}
                className="inline-flex w-full items-center justify-center rounded-full bg-white px-6 py-4 text-center font-semibold text-black transition hover:scale-105 sm:w-auto sm:px-7"
              >
                {t.home.hero.primaryButton}
              </Link>

              <Link
                href={localizedHref('/compare')}
                className="inline-flex w-full items-center justify-center rounded-full border border-white/20 bg-white/5 px-6 py-4 text-center font-semibold backdrop-blur-md transition hover:bg-white/10 sm:w-auto sm:px-7"
              >
                {t.home.hero.secondaryButton}
              </Link>
            </div>

            {/* Search */}
              <div className="mt-10 sm:mt-14">
                <SearchBar />
              </div>
          </div>
        </div>
      </section>

      {/* Featured Comparisons */}

      <section className="mx-auto max-w-7xl px-4 py-16 sm:px-6 sm:py-20 lg:py-24">
        <div className="mb-8 flex flex-col gap-4 sm:mb-10 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-emerald-400 text-sm uppercase tracking-wider mb-3">
              {t.home.featuredComparisons.eyebrow}
            </p>

            <h2 className="text-3xl font-bold sm:text-4xl">
              {t.home.featuredComparisons.title}
            </h2>
          </div>

          <Link
            href={localizedHref('/compare/models')}
            className="text-zinc-400 hover:text-white"
          >
            {t.home.featuredComparisons.viewAll}
          </Link>
        </div>

        <div className="grid lg:grid-cols-2 gap-8">
          {featuredComparisons.map((item) => {
            const query = item.ids?.map((id) => `ids=${encodeURIComponent(id)}`).join('&')

            return (
              <Link
                key={item.title}
                href={localizedHref(`/compare/versions?${query}`)}
                className="group relative overflow-hidden rounded-lg border border-white/10 bg-zinc-900 transition hover:border-emerald-500/40"
                aria-label={t.home.featuredComparisons.compareAriaLabel.replace('{title}',item.title)}
              >
                <div
                  className="h-72 bg-cover bg-center transition duration-700 group-hover:scale-105 sm:h-[360px] lg:h-[420px]"
                  style={{
                    backgroundImage: `url(${item.image})`
                  }}
                />

                <div className="absolute inset-0 bg-gradient-to-t from-black via-black/20 to-transparent" />

                <div className="absolute bottom-0 left-0 p-5 sm:p-8">
                  <p className="text-emerald-400 text-sm mb-3">
                    {t.home.featuredComparisons.items[item.subtitleKey]}
                  </p>

                  <h3 className="max-w-md text-2xl font-bold leading-tight sm:text-3xl lg:text-4xl">
                    {item.title}
                  </h3>
                </div>
              </Link>
            )
          })}
        </div>
      </section>

      {/* Lifestyle */}

      <section className="border-y border-white/10 bg-white/[0.02]">
        <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 sm:py-20 lg:py-24">
          <p className="text-emerald-400 text-sm uppercase tracking-wider mb-3">
            {t.home.lifestyle.eyebrow}
          </p>

          <h2 className="mb-8 text-3xl font-bold sm:mb-12 sm:text-4xl">
            {t.home.lifestyle.title}
          </h2>

          <div className="grid grid-cols-2 gap-3 md:grid-cols-3 lg:grid-cols-6 lg:gap-4">
            {t.home.lifestyle.items.map((item) => (
              <div
                key={item}
                className="cursor-pointer rounded-lg border border-white/10 bg-white/5 px-4 py-6 text-center transition hover:border-emerald-500 hover:bg-white/10 sm:px-6 sm:py-8"
              >
                <p className="text-base font-medium sm:text-lg">
                  {item}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Featured EVs */}

      <section className="mx-auto max-w-7xl px-4 py-16 sm:px-6 sm:py-20 lg:py-24">
        <div className="mb-8 flex items-end justify-between sm:mb-10">
          <div>
            <p className="text-emerald-400 text-sm uppercase tracking-wider mb-3">
              {t.home.featuredVehicles.eyebrow}
            </p>

            <h2 className="text-3xl font-bold sm:text-4xl">
              {t.home.featuredVehicles.title}
            </h2>
          </div>
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          {featuredVehicles.map((vehicle) => (
            <Link
              key={vehicle.modelSlug}
              href={localizedHref(`/models/${vehicle.modelSlug}`)}
              className="group block overflow-hidden rounded-lg border border-white/10 bg-zinc-900 transition hover:border-emerald-500"
            >
              <div
                className="h-52 bg-cover bg-center sm:h-64"
                style={{
                  backgroundImage: `url(${vehicle.image})`
                }}
              />

              <div className="p-5 sm:p-8">
                <h3 className="mb-6 text-2xl font-bold sm:text-3xl">
                  {vehicle.name}
                </h3>

                <div className="grid grid-cols-2 gap-6">
                  <div>
                    <p className="text-zinc-500 text-sm mb-2">
                      {t.home.featuredVehicles.realRange}
                    </p>

                    <p className="text-xl font-semibold">
                      {vehicle.range}
                    </p>
                  </div>

                  <div>
                    <p className="text-zinc-500 text-sm mb-2">
                      {t.home.featuredVehicles.fastCharging}
                    </p>

                    <p className="text-xl font-semibold">
                      {vehicle.charging}
                    </p>
                  </div>
                </div>

                <span className="mt-8 block w-full rounded-lg bg-white py-4 text-center font-semibold text-black transition group-hover:opacity-90">
                  {t.home.featuredVehicles.viewModel}
                </span>
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* Final CTA */}

      <section className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-emerald-500/20 to-cyan-500/20 blur-3xl" />

        <div className="relative mx-auto max-w-5xl px-4 py-20 text-center sm:px-6 sm:py-28">
          <p className="text-emerald-400 text-sm uppercase tracking-wider mb-4">
            {t.home.finalCta.eyebrow}
          </p>

          <h2 className="text-3xl font-bold leading-tight sm:text-5xl lg:text-6xl">
            {t.home.finalCta.title}
          </h2>

          <p className="mx-auto mt-6 max-w-3xl text-lg text-zinc-400 sm:mt-8 sm:text-xl">
            {t.home.finalCta.description}
          </p>

          <Link
            href={localizedHref('/recommend')}
            className="mt-10 inline-flex w-full items-center justify-center rounded-full bg-emerald-500 px-7 py-4 text-center font-semibold text-black transition hover:scale-105 sm:mt-12 sm:w-auto sm:px-8 sm:py-5 sm:text-lg"
          >
            {t.home.finalCta.button}
          </Link>
        </div>
      </section>
    </main>
  )
}
