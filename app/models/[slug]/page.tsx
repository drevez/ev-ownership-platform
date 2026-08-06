import { notFound } from 'next/navigation'
import { ViewEventTracker } from '@/components/analytics/ViewEventTracker'
import { ModelPage } from '@/components/model/ModelPage'
import { getAllModelSlugs, loadModel } from '@/lib/models'
import { getTranslations } from '@/lib/getTranslations'
import { getRequestLanguage } from '@/lib/serverLocale'
import { buildLocalizedHref } from '@/lib/i18nRouting'
import { buildPageContext, pageContextToFlatProperties } from '@/lib/analytics'

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
  const locale = await getRequestLanguage()
  const model = await loadModel(slug)

  if (!model) {
    notFound()
  }
  const page = buildPageContext({
    path: buildLocalizedHref(`/models/${model.slug}`, locale),
    canonicalPath: `/models/${model.slug}`,
    type: 'model',
    language: locale,
  })
  const modelProperties = {
    event_schema_version: 2,
    page,
    model_slug: model.slug,
    model_name: model.displayName,
    brand: model.brand,
    model: model.displayName,
    variant_count: model.variants.length,
    ...pageContextToFlatProperties(page),
  }

  return (
    <>
      <ViewEventTracker
        event="model_viewed"
        properties={modelProperties}
        gaEvent="model_viewed"
        gaProperties={modelProperties}
      />
      <ModelPage model={model} />
    </>
  )
}
