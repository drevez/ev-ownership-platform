import { QuizForm } from '@/components/recommendation/QuizForm'

export default function RecommendPage() {
  return (
    <main className="min-h-screen bg-slate-50 px-6 py-12 text-slate-900">
      <div className="mx-auto flex max-w-6xl flex-col gap-10">
        <header className="space-y-3">
          <p className="text-sm font-semibold uppercase tracking-[0.24em] text-slate-500">
            EV recommendation
          </p>
          <h1 className="text-4xl font-bold sm:text-5xl">
            Find your best electric vehicle match
          </h1>
          <p className="max-w-2xl text-base leading-7 text-slate-600">
            Answer a few simple questions about your lifestyle, budget, and commuting needs to get the top recommended EVs for you.
          </p>
        </header>

        <QuizForm />
      </div>
    </main>
  )
}
