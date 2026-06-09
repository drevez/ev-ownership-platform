import { getTranslations } from '@/lib/getTranslations'
import { getModelExplorerData } from '@/lib/models'
import { getRequestLanguage } from '@/lib/serverLocale'
import { ModelsExplorer } from '@/components/model/ModelsExplorer'

export async function generateMetadata() {
  const locale = await getRequestLanguage()
  const t = getTranslations(locale)

  return {
    title: t.models.title,
    description: t.models.description,
  }
}

type ModelsIndexPageProps = {
  searchParams: Promise<{
    brand?: string
  }>
}

export default async function ModelsIndexPage({ searchParams }: ModelsIndexPageProps) {
  const { brand } = await searchParams
  const models = await getModelExplorerData()
  const brands = new Set(models.map((model) => model.brand))
  const initialBrand = brand && brands.has(brand) ? brand : 'all'

  return <ModelsExplorer models={models} initialBrand={initialBrand} />
}
