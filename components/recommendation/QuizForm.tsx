'use client'

import { useState, type FormEvent } from 'react'
import { recommendEVs } from '@/logic/recommendation/recommendEVs'
import type {
  QuizAnswers,
  RecommendationResult
} from '@/types/recommendation'
import { RecommendationResults } from './RecommendationResults'

const defaultAnswers: QuizAnswers = {
  budget: 45000,
  homeCharging: false,
  familySize: 2,
  dailyCommuteKm: 30,
  roadTrips: 'sometimes'
}

export function QuizForm() {
  const [answers, setAnswers] = useState<QuizAnswers>(defaultAnswers)
  const [results, setResults] = useState<RecommendationResult[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setError(null)
    setLoading(true)

    try {
      const recommendations = await recommendEVs(answers)
      setResults(recommendations)
    } catch (err) {
      setError('Unable to load recommendations. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <section className="space-y-6">
      <form
        onSubmit={handleSubmit}
        className="grid gap-6 rounded-3xl border border-slate-200 bg-white p-8 shadow-sm"
      >
        <div>
          <h2 className="text-3xl font-bold text-slate-900">
            EV Recommendation Quiz
          </h2>
          <p className="mt-2 text-sm text-slate-500">
            Answer a few questions and get the top EV matches for your lifestyle.
          </p>
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          <label className="space-y-2">
            <span className="text-sm font-medium text-slate-700">
              Budget (€)
            </span>
            <input
              type="number"
              min={15000}
              max={100000}
              value={answers.budget}
              onChange={(event) =>
                setAnswers((prev) => ({
                  ...prev,
                  budget: Number(event.target.value)
                }))
              }
              className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-slate-900"
            />
          </label>

          <label className="space-y-2">
            <span className="text-sm font-medium text-slate-700">
              Daily Commute (km)
            </span>
            <input
              type="number"
              min={0}
              max={500}
              value={answers.dailyCommuteKm}
              onChange={(event) =>
                setAnswers((prev) => ({
                  ...prev,
                  dailyCommuteKm: Number(event.target.value)
                }))
              }
              className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-slate-900"
            />
          </label>

          <label className="space-y-2">
            <span className="text-sm font-medium text-slate-700">
              Family size
            </span>
            <input
              type="number"
              min={1}
              max={8}
              value={answers.familySize}
              onChange={(event) =>
                setAnswers((prev) => ({
                  ...prev,
                  familySize: Number(event.target.value)
                }))
              }
              className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-slate-900"
            />
          </label>

          <label className="space-y-2">
            <span className="text-sm font-medium text-slate-700">
              Home charging
            </span>
            <select
              value={answers.homeCharging ? 'yes' : 'no'}
              onChange={(event) =>
                setAnswers((prev) => ({
                  ...prev,
                  homeCharging: event.target.value === 'yes'
                }))
              }
              className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-slate-900"
            >
              <option value="yes">Yes</option>
              <option value="no">No</option>
            </select>
          </label>

          <label className="space-y-2">
            <span className="text-sm font-medium text-slate-700">
              Road trip frequency
            </span>
            <select
              value={answers.roadTrips}
              onChange={(event) =>
                setAnswers((prev) => ({
                  ...prev,
                  roadTrips: event.target.value as QuizAnswers['roadTrips']
                }))
              }
              className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-slate-900"
            >
              <option value="never">Never</option>
              <option value="sometimes">Sometimes</option>
              <option value="often">Often</option>
            </select>
          </label>
        </div>

        <div className="flex items-center justify-between gap-4">
          <button
            type="submit"
            disabled={loading}
            className="inline-flex items-center justify-center rounded-2xl bg-slate-900 px-6 py-3 text-sm font-semibold text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {loading ? 'Finding matches...' : 'Get recommendations'}
          </button>
          <span className="text-sm text-slate-500">
            Top 3 matches returned.
          </span>
        </div>

        {error && (
          <p className="rounded-2xl bg-rose-50 px-4 py-3 text-sm text-rose-700">
            {error}
          </p>
        )}
      </form>

      <RecommendationResults recommendations={results} />
    </section>
  )
}
