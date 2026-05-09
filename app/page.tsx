'use client'

import { useEffect, useState } from 'react'

export default function Home() {
  const [budget, setBudget] = useState(45000)
  const [homeCharging, setHomeCharging] =
    useState(false)
  const [roadTrips, setRoadTrips] = useState<
    'never' | 'sometimes' | 'often'
  >('often')
  const [recommendations, setRecommendations] =
    useState<any[]>([])

  useEffect(() => {
    async function loadRecommendations() {
      const searchParams = new URLSearchParams({
        budget: budget.toString(),
        homeCharging: homeCharging ? '1' : '0',
        roadTrips
      })

      const response = await fetch(
        `/api/recommendations?${searchParams.toString()}`,
        { cache: 'no-store' }
      )

      if (!response.ok) {
        setRecommendations([])
        return
      }

      const data = await response.json()
      setRecommendations(data.results ?? [])
    }

    loadRecommendations()
  }, [budget, homeCharging, roadTrips])

  return (
    <main className="min-h-screen bg-white text-black p-10">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-5xl font-bold mb-2">
          Which EV Fits My Life?
        </h1>

        <p className="text-gray-500 mb-10 text-lg">
          Intelligent EV ownership recommendations.
        </p>

        {/* Controls */}

        <div className="bg-gray-50 border border-gray-200 rounded-2xl p-6 mb-10">
          <div className="grid md:grid-cols-3 gap-8">
            {/* Budget */}

            <div>
              <label className="block text-sm font-medium mb-2">
                Budget
              </label>

              <input
                type="range"
                min="20000"
                max="100000"
                step="5000"
                value={budget}
                onChange={(e) =>
                  setBudget(Number(e.target.value))
                }
                className="w-full"
              />

              <p className="mt-2 font-semibold">
                €{budget.toLocaleString()}
              </p>
            </div>

            {/* Home Charging */}

            <div>
              <label className="block text-sm font-medium mb-2">
                Home Charging
              </label>

              <select
                value={homeCharging ? 'yes' : 'no'}
                onChange={(e) =>
                  setHomeCharging(
                    e.target.value === 'yes'
                  )
                }
                className="w-full border border-gray-300 rounded-xl p-3 bg-white"
              >
                <option value="yes">
                  Yes
                </option>

                <option value="no">
                  No
                </option>
              </select>
            </div>

            {/* Roadtrips */}

            <div>
              <label className="block text-sm font-medium mb-2">
                Roadtrips
              </label>

              <select
                value={roadTrips}
                onChange={(e) =>
                  setRoadTrips(
                    e.target.value as
                      | 'never'
                      | 'sometimes'
                      | 'often'
                  )
                }
                className="w-full border border-gray-300 rounded-xl p-3 bg-white"
              >
                <option value="never">
                  Never
                </option>

                <option value="sometimes">
                  Sometimes
                </option>

                <option value="often">
                  Often
                </option>
              </select>
            </div>
          </div>
        </div>

        {/* Results */}

        <div className="grid gap-6">
          {recommendations.map((ev: any) => (
            <div
              key={ev.id}
              className="bg-gray-50 border border-gray-200 rounded-2xl p-6 shadow-sm"
            >
              <div className="flex items-start justify-between">
                <div>
                  <h2 className="text-2xl font-semibold">
                    {ev.brand} {ev.model}
                  </h2>

                  <p className="text-gray-500">
                    {ev.variant}
                  </p>
                </div>

                <div className="text-right">
                  <p className="text-sm text-gray-500">
                    Match Score
                  </p>

                  <p className="text-3xl font-bold">
                    {ev.recommendationScore}
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6">
                <div>
                  <p className="text-sm text-gray-500">
                    Real Range
                  </p>

                  <p className="font-semibold">
                    {ev.efficiency.estimatedRealRangeKm} km
                  </p>
                </div>

                <div>
                  <p className="text-sm text-gray-500">
                    DC Charging
                  </p>

                  <p className="font-semibold">
                    {ev.charging.dcMaxChargeKW} kW
                  </p>
                </div>

                <div>
                  <p className="text-sm text-gray-500">
                    Battery
                  </p>

                  <p className="font-semibold">
                    {ev.battery?.batteryUsableKWh || '-'} kWh
                  </p>
                </div>

                <div>
                  <p className="text-sm text-gray-500">
                    Motorway
                  </p>

                  <p className="font-semibold">
                    {ev.efficiency.motorwayRangeKm} km
                  </p>
                </div>
              </div>
              
            </div>
          ))}
        </div>
      </div>
    </main>
  )
}