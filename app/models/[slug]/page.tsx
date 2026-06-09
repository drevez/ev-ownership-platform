import { notFound } from 'next/navigation'
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

  return <ModelPage model={model} />
}
