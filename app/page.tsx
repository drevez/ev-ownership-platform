'use client'
import Link from 'next/link'
import SearchBar from '@/components/search/SearchBar'
import { useTranslations } from '@/hooks/useTranslations'
import { useLocalizedHref } from '@/hooks/useLocalizedHref'

const featuredComparisons = [
  {
    title: 'Tesla Model Y Long Range vs Kia EV5 Tech',
    subtitle: 'SUVs elétricos para família',
    image:
      'https://images.unsplash.com/photo-1617788138017-80ad40651399?q=80&w=1600&auto=format&fit=crop',
    ids: ['tesla-model-y-long-range', 'kia-ev5-tech']
  },
  {
    title: 'Volvo EX30 vs Smart #1',
    subtitle: 'Elétricos compactos premium',
    image:
      'https://images.unsplash.com/photo-1553440569-bcc63803a83d?q=80&w=1600&auto=format&fit=crop',
    ids: ['volvo-ex30-69kwh', 'smart-1-66kwh']
  }
]

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

        <div className="relative max-w-7xl mx-auto px-6 py-32 lg:py-44">
          <div className="max-w-4xl">
            <p className="text-emerald-400 font-medium mb-6 tracking-wide uppercase text-sm">
              {t.home.hero.eyebrow}
            </p>

            <h1 className="text-6xl md:text-8xl font-bold leading-[0.95] tracking-tight">
              {t.home.hero.title}
            </h1>

            <p className="text-xl text-zinc-300 mt-8 max-w-2xl leading-relaxed">
              {t.home.hero.subtitle}
            </p>

            <div className="flex flex-wrap gap-4 mt-10">
              <Link
                href={localizedHref('/recommend')}
                className="bg-white text-black px-7 py-4 rounded-full font-semibold hover:scale-105 transition"
              >
                {t.home.hero.primaryButton}
              </Link>

              <Link
                href={localizedHref('/compare')}
                className="border border-white/20 bg-white/5 backdrop-blur-md px-7 py-4 rounded-full font-semibold hover:bg-white/10 transition"
              >
                {t.home.hero.secondaryButton}
              </Link>
            </div>

            {/* Search */}
              <div className="mt-14">
                <SearchBar />
              </div>
          </div>
        </div>
      </section>

      {/* Featured Comparisons */}

      <section className="max-w-7xl mx-auto px-6 py-24">
        <div className="flex items-end justify-between mb-10">
          <div>
            <p className="text-emerald-400 text-sm uppercase tracking-wider mb-3">
              {t.home.featuredComparisons.eyebrow}
            </p>

            <h2 className="text-4xl font-bold">
              {t.home.featuredComparisons.title}
            </h2>
          </div>

          <Link
            href={localizedHref('/compare')}
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
                href={localizedHref(`/compare?${query}`)}
                className="group relative overflow-hidden rounded-[32px] border border-white/10 bg-zinc-900 transition hover:border-emerald-500/40"
                aria-label={t.home.featuredComparisons.compareAriaLabel.replace('{title}',item.title)}
              >
                <div
                  className="h-[420px] bg-cover bg-center group-hover:scale-105 transition duration-700"
                  style={{
                    backgroundImage: `url(${item.image})`
                  }}
                />

                <div className="absolute inset-0 bg-gradient-to-t from-black via-black/20 to-transparent" />

                <div className="absolute bottom-0 left-0 p-8">
                  <p className="text-emerald-400 text-sm mb-3">
                    {item.subtitle}
                  </p>

                  <h3 className="text-4xl font-bold max-w-md leading-tight">
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
        <div className="max-w-7xl mx-auto px-6 py-24">
          <p className="text-emerald-400 text-sm uppercase tracking-wider mb-3">
            {t.home.lifestyle.eyebrow}
          </p>

          <h2 className="text-4xl font-bold mb-12">
            {t.home.lifestyle.title}
          </h2>

          <div className="grid md:grid-cols-3 lg:grid-cols-6 gap-4">
            {t.home.lifestyle.items.map((item) => (
              <div
                key={item}
                className="bg-white/5 border border-white/10 rounded-3xl px-6 py-8 text-center hover:border-emerald-500 hover:bg-white/10 transition cursor-pointer"
              >
                <p className="font-medium text-lg">
                  {item}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Featured EVs */}

      <section className="max-w-7xl mx-auto px-6 py-24">
        <div className="flex items-end justify-between mb-10">
          <div>
            <p className="text-emerald-400 text-sm uppercase tracking-wider mb-3">
              {t.home.featuredVehicles.eyebrow}
            </p>

            <h2 className="text-4xl font-bold">
              {t.home.featuredVehicles.title}
            </h2>
          </div>
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          {featuredVehicles.map((vehicle) => (
            <Link
              key={vehicle.modelSlug}
              href={localizedHref(`/models/${vehicle.modelSlug}`)}
              className="group overflow-hidden rounded-[32px] bg-zinc-900 border border-white/10 hover:border-emerald-500 transition block"
            >
              <div
                className="h-64 bg-cover bg-center"
                style={{
                  backgroundImage: `url(${vehicle.image})`
                }}
              />

              <div className="p-8">
                <h3 className="text-3xl font-bold mb-6">
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

                <span className="mt-8 block w-full text-center bg-white text-black py-4 rounded-2xl font-semibold group-hover:opacity-90 transition">
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

        <div className="relative max-w-5xl mx-auto px-6 py-32 text-center">
          <p className="text-emerald-400 text-sm uppercase tracking-wider mb-4">
            {t.home.finalCta.eyebrow}
          </p>

          <h2 className="text-5xl md:text-6xl font-bold leading-tight">
            {t.home.finalCta.title}
          </h2>

          <p className="text-zinc-400 text-xl mt-8 max-w-3xl mx-auto">
            {t.home.finalCta.description}
          </p>

          <Link
            href={localizedHref('/recommend')}
            className="inline-flex mt-12 bg-emerald-500 text-black px-8 py-5 rounded-full text-lg font-semibold hover:scale-105 transition"
          >
            {t.home.finalCta.button}
          </Link>
        </div>
      </section>
    </main>
  )
}
