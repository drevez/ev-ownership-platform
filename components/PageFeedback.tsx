'use client'

import { useMemo, useState } from 'react'
import { usePathname } from 'next/navigation'
import { useLocale } from '@/context/LocaleContext'
import { delocalizePathname, stripLanguageFromPathname } from '@/lib/i18nRouting'
import { trackEvent } from '@/lib/posthogClient'
import { useTranslations } from '@/hooks/useTranslations'

const PUBLIC_COUNT_THRESHOLD = 1000

type FeedbackVote = 'yes' | 'no'
type FeedbackStats = {
  helpfulCount: number
  notHelpfulCount: number
  totalCount: number
}

function clean(value: string, maxLength: number) {
  return value.replace(/\s+/g, ' ').trim().slice(0, maxLength)
}

export function PageFeedback() {
  const pathname = usePathname()
  const t = useTranslations()
  const { locale } = useLocale()
  const [vote, setVote] = useState<FeedbackVote | null>(null)
  const [message, setMessage] = useState('')
  const [submitted, setSubmitted] = useState(false)
  const [stats, setStats] = useState<FeedbackStats | null>(null)
  const [isSending, setIsSending] = useState(false)
  const basePathname = delocalizePathname(stripLanguageFromPathname(pathname))
  const shouldShowFeedback =
    basePathname === '/models' ||
    basePathname.startsWith('/models/') ||
    basePathname === '/compare' ||
    basePathname.startsWith('/compare/') ||
    basePathname === '/recommend'

  const pageUrl = useMemo(() => {
    if (typeof window === 'undefined') return pathname
    return window.location.href
  }, [pathname])

  if (!shouldShowFeedback) return null

  const submitFeedback = async (nextVote: FeedbackVote, kind: 'vote' | 'note') => {
    const response = await fetch('/api/feedback', {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({
        kind,
        helpful: nextVote === 'yes',
        pagePath: basePathname,
        pageUrl,
        locale,
        message: kind === 'note' ? clean(message, 1200) : '',
        viewport: `${window.innerWidth}x${window.innerHeight}`,
      }),
    })

    if (!response.ok) throw new Error('Feedback request failed.')

    const data = await response.json() as { stats?: FeedbackStats | null }
    setStats(data.stats ?? null)
  }

  const recordVote = async (nextVote: FeedbackVote) => {
    setVote(nextVote)
    setSubmitted(false)

    window.dataLayer = window.dataLayer || []
    window.dataLayer.push({
      event: 'page_feedback_vote',
      page_path: pathname,
      helpful: nextVote === 'yes',
    })
    trackEvent('page_feedback_voted', {
      page_path: basePathname,
      localized_page_path: pathname,
      helpful: nextVote === 'yes',
      locale,
    })

    try {
      await submitFeedback(nextVote, 'vote')
    } catch (error) {
      console.error('Could not submit feedback vote:', error)
    }
  }

  const sendFeedback = async () => {
    if (!vote) return
    setIsSending(true)

    try {
      await submitFeedback(vote, 'note')
      trackEvent('page_feedback_note_sent', {
        page_path: basePathname,
        localized_page_path: pathname,
        helpful: vote === 'yes',
        locale,
        message_length: clean(message, 1200).length,
      })
      setSubmitted(true)
    } catch (error) {
      console.error('Could not submit feedback note:', error)
    } finally {
      setIsSending(false)
    }
  }

  const statsLabel = stats && vote ? formatFeedbackStats(stats, vote, t) : null

  return (
    <section className="border-t border-slate-200 bg-slate-100/80 px-4 py-5 text-slate-950">
      <div className="mx-auto max-w-7xl">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="min-w-0">
            <h2 className="text-sm font-semibold tracking-tight text-slate-700">
            {t.pageFeedback.title}
            </h2>
            <p className="mt-0.5 text-xs leading-5 text-slate-500">
              {t.pageFeedback.description}
            </p>
            {statsLabel && (
              <p className="mt-1 text-xs font-medium text-slate-500">
                {statsLabel}
              </p>
            )}
          </div>

          <div className="flex shrink-0 justify-start gap-2 sm:justify-end">
            <button
              type="button"
              onClick={() => void recordVote('yes')}
              aria-label={t.pageFeedback.helpfulLabel}
              title={t.pageFeedback.helpfulLabel}
              className={`inline-flex h-9 w-9 items-center justify-center rounded-full border transition ${
                vote === 'yes'
                  ? 'border-emerald-500 bg-emerald-50 text-emerald-800'
                  : 'border-slate-300 bg-white/70 text-slate-500 hover:border-emerald-300 hover:text-emerald-800'
              }`}
            >
              <ThumbIcon direction="up" />
            </button>
            <button
              type="button"
              onClick={() => void recordVote('no')}
              aria-label={t.pageFeedback.notHelpfulLabel}
              title={t.pageFeedback.notHelpfulLabel}
              className={`inline-flex h-9 w-9 items-center justify-center rounded-full border transition ${
                vote === 'no'
                  ? 'border-amber-400 bg-amber-50 text-amber-900'
                  : 'border-slate-300 bg-white/70 text-slate-500 hover:border-amber-300 hover:text-amber-900'
              }`}
            >
              <ThumbIcon direction="down" />
            </button>
          </div>
        </div>

        {vote && (
          <div className="mt-3 max-w-2xl">
            <label className="block text-xs">
              <span className="font-medium text-slate-600">
                {t.pageFeedback.commentLabel}
              </span>
              <textarea
                value={message}
                onChange={(event) => setMessage(event.target.value)}
                rows={2}
                maxLength={1200}
                placeholder={t.pageFeedback.placeholder}
                className="mt-1 w-full rounded-md border border-slate-200 bg-white/90 px-3 py-2 text-sm text-slate-950 outline-none transition focus:border-emerald-500"
              />
            </label>
            <div className="mt-2 flex items-center gap-3">
              <button
                type="button"
                onClick={() => void sendFeedback()}
                disabled={isSending}
                className="text-xs font-semibold text-emerald-700 underline decoration-emerald-200 underline-offset-4 transition hover:text-emerald-900"
              >
                {submitted ? t.pageFeedback.sent : isSending ? t.pageFeedback.sending : t.pageFeedback.send}
              </button>
            </div>
          </div>
          )}
      </div>
    </section>
  )
}

function formatFeedbackStats(
  stats: FeedbackStats,
  vote: FeedbackVote,
  t: ReturnType<typeof useTranslations>
) {
  if (stats.totalCount <= 0) return null

  if (stats.totalCount >= PUBLIC_COUNT_THRESHOLD) {
    return t.pageFeedback.publicCount.replace(
      '{count}',
      stats.helpfulCount.toLocaleString()
    )
  }

  const matchingCount = vote === 'yes' ? stats.helpfulCount : stats.notHelpfulCount
  const matchingPercentage = Math.round((matchingCount / stats.totalCount) * 100)

  return t.pageFeedback.sameOpinion.replace(
    '{percentage}',
    String(Math.min(Math.max(matchingPercentage, 0), 100))
  )
}

function ThumbIcon({ direction }: { direction: 'up' | 'down' }) {
  return (
    <svg
      aria-hidden="true"
      className={direction === 'down' ? 'h-4 w-4 rotate-180' : 'h-4 w-4'}
      fill="none"
      stroke="currentColor"
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth="2"
      viewBox="0 0 24 24"
    >
      <path d="M7 10v11" />
      <path d="M15 5.5 14 10h5.3a2 2 0 0 1 1.9 2.5l-1.5 6A2 2 0 0 1 17.8 20H9.5A2.5 2.5 0 0 1 7 17.5v-6.2A3 3 0 0 1 8 9l4.9-5a1.7 1.7 0 0 1 2.1-.2 1.7 1.7 0 0 1 .7 1.7Z" />
      <path d="M3 10h4" />
    </svg>
  )
}
