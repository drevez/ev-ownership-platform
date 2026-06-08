import { GoogleTagManager as NextGoogleTagManager } from '@next/third-parties/google'

const GTM_ID = process.env.NEXT_PUBLIC_GTM_ID
const GTM_SCRIPT_URL = process.env.NEXT_PUBLIC_GTM_SCRIPT_URL

export function GoogleTagManager() {
  if (!GTM_ID) return null

  return (
    <NextGoogleTagManager
      gtmId={GTM_ID}
      gtmScriptUrl={GTM_SCRIPT_URL}
    />
  )
}
