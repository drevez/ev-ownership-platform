import { InternalLoginForm } from '@/components/internal/InternalLoginForm'

export const dynamic = 'force-dynamic'

interface InternalLoginPageProps {
  searchParams: Promise<{
    next?: string
  }>
}

function getSafeNextPath(value?: string) {
  if (!value?.startsWith('/')) return '/internal'
  if (value.startsWith('//')) return '/internal'
  if (!/(^\/internal(?:\/|$)|^\/(?:pt|en|es)\/internal(?:\/|$))/.test(value)) {
    return '/internal'
  }
  if (value.includes('/internal/login')) return '/internal'

  return value
}

export default async function InternalLoginPage({
  searchParams,
}: InternalLoginPageProps) {
  const query = await searchParams
  const nextPath = getSafeNextPath(query.next)

  return (
    <main className="min-h-screen bg-slate-950 px-6 py-16 text-slate-950">
      <div className="mx-auto max-w-md rounded-lg border border-slate-200 bg-white p-8 shadow-xl">
        <p className="text-sm font-semibold uppercase tracking-[0.24em] text-emerald-700">
          MotorZero Internal
        </p>
        <h1 className="mt-3 text-3xl font-bold">Sign in</h1>
        <p className="mt-3 text-sm leading-6 text-slate-600">
          The internal workspace is protected. Sign in once and the browser will
          keep a secure session cookie for this device.
        </p>

        <InternalLoginForm nextPath={nextPath} />
      </div>
    </main>
  )
}
