'use client'

import { useEffect } from 'react'
import { usePathname } from 'next/navigation'
import { useCompare } from '@/context/CompareContext'
import { stripLanguageFromPathname } from '@/lib/i18nRouting'

const COMPARISON_BAR_HEIGHT = '280px'

/**
 * Manages body padding when comparison bar is visible
 */
export function ComparisonBarPaddingManager() {

  const pathname = usePathname()
  const basePathname = stripLanguageFromPathname(pathname)

  const { state } = useCompare()

  useEffect(() => {

    const body = document.body

    const barVisible =
      basePathname !== '/compare' &&
      state.vehicleIds.length > 0

    body.style.paddingBottom = barVisible
      ? COMPARISON_BAR_HEIGHT
      : '0'

    return () => {
      body.style.paddingBottom = '0'
    }

  }, [
    basePathname,
    state.vehicleIds.length,
  ])

  return null
}
