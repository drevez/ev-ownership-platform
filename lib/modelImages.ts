import modelMedia from '@/data/model-media.json'

const images: Record<string, { heroImage: string }> = modelMedia

export function getModelHeroImage(slug: string, fallback: string): string {
  return images[slug]?.heroImage || fallback
}
