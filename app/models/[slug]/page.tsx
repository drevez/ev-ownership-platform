import { notFound } from 'next/navigation'
import { ViewEventTracker } from '@/components/analytics/ViewEventTracker'
import { ModelPage } from '@/components/model/ModelPage'
import { getAllModelSlugs, loadModel } from '@/lib/models'
import { getTranslations } from '@/lib/getTranslations'
import { getRequestLanguage } from '@/lib/serverLocale'

interface ModelRouteProps {
  params: Promise<{ slug: string }>
}

export async function generateStaticParams() {
  return getAllModelSlugs()
}

export async function generateMetadata({params,}: ModelRouteProps) {
  const { slug } = await params
  const model = await loadModel(slug)
  const locale = await getRequestLanguage()
  const t = getTranslations(locale)

  if (!model) {
    return { title: t.model.notFoundTitle }
  }

  return {
    title: model.displayName,
    description: t.model.description
      .replace('{count}', String(model.variants.length))
      .replace('{model}', model.displayName),
  }
}

export default async function ModelRoutePage({ params }: ModelRouteProps) {
  const { slug } = await params
  const model = await loadModel(slug)

  if (!model) {
    notFound()
  }

  return (
    <>
      <ViewEventTracker
        event="model_viewed"
        properties={{
          model_slug: model.slug,
          model_name: model.displayName,
          brand: model.brand,
          variant_count: model.variants.length,
        }}
      />
      <ModelPage model={model} />
    </>
  )
}
