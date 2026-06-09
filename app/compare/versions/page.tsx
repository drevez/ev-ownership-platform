import { Suspense } from 'react'
import { getTranslations } from '@/lib/getTranslations'
import { getRequestLanguage } from '@/lib/serverLocale'

import {
  CompareLoadingFallback,
  ComparePageContent,
} from '@/components/comparison/ComparePageContent'

export async function generateMetadata() {
  const locale = await getRequestLanguage()
  const t = getTranslations(locale)

  return {
    title: t.compare.versionsMetadataTitle,
    description: t.compare.versionsMetadataDescription,
  }
}

export default function CompareVersionsPage() {
  return (
    <Suspense fallback={<CompareLoadingFallback />}>
      <ComparePageContent kind="versions" />
    </Suspense>
  )
}
