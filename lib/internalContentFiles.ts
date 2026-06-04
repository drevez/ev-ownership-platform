import fs from 'fs/promises'
import path from 'path'

import { en } from '@/locales/en'
import { es } from '@/locales/es'
import { pt } from '@/locales/pt'

export const CONTENT_LANGUAGES = ['pt', 'en', 'es'] as const
export type ContentLanguage = (typeof CONTENT_LANGUAGES)[number]

type LocaleData = typeof pt
type EditableLocaleData = Record<string, unknown>

export interface EditableContentField {
  id: string
  label: string
  path: string[]
  multiline?: boolean
  seo?: boolean
  hint?: string
}

export interface EditableContentSection {
  id: string
  label: string
  description: string
  fields: EditableContentField[]
}

export type EditableContentValues = Record<ContentLanguage, Record<string, string>>

const LOCALE_FILES: Record<ContentLanguage, string> = {
  pt: path.join(process.cwd(), 'locales', 'pt.ts'),
  en: path.join(process.cwd(), 'locales', 'en.ts'),
  es: path.join(process.cwd(), 'locales', 'es.ts'),
}

const LOCALE_EXPORTS: Record<ContentLanguage, LocaleData> = {
  pt,
  en: en as LocaleData,
  es: es as LocaleData,
}

export const EDITABLE_CONTENT_SECTIONS: EditableContentSection[] = [
  {
    id: 'globalSeo',
    label: 'SEO global',
    description: 'Defaults usados pelo layout quando uma página não define SEO próprio.',
    fields: [
      {
        id: 'metadata.title',
        label: 'Título default',
        path: ['metadata', 'title'],
        seo: true,
      },
      {
        id: 'metadata.titleTemplate',
        label: 'Template de título',
        path: ['metadata', 'titleTemplate'],
        seo: true,
        hint: 'Mantém %s para o título de cada página.',
      },
      {
        id: 'metadata.description',
        label: 'Meta description default',
        path: ['metadata', 'description'],
        multiline: true,
        seo: true,
      },
    ],
  },
  {
    id: 'home',
    label: 'Homepage',
    description: 'Hero, pesquisa, secções principais e CTA final.',
    fields: [
      { id: 'home.hero.eyebrow', label: 'Hero eyebrow', path: ['home', 'hero', 'eyebrow'] },
      { id: 'home.hero.title', label: 'Hero título', path: ['home', 'hero', 'title'] },
      {
        id: 'home.hero.subtitle',
        label: 'Hero subtítulo',
        path: ['home', 'hero', 'subtitle'],
        multiline: true,
      },
      {
        id: 'home.hero.searchPlaceholder',
        label: 'Placeholder pesquisa',
        path: ['home', 'hero', 'searchPlaceholder'],
      },
      {
        id: 'home.featuredComparisons.title',
        label: 'Título comparações',
        path: ['home', 'featuredComparisons', 'title'],
      },
      {
        id: 'home.featuredVehicles.title',
        label: 'Título veículos em destaque',
        path: ['home', 'featuredVehicles', 'title'],
      },
      {
        id: 'home.finalCta.title',
        label: 'CTA final título',
        path: ['home', 'finalCta', 'title'],
      },
      {
        id: 'home.finalCta.description',
        label: 'CTA final descrição',
        path: ['home', 'finalCta', 'description'],
        multiline: true,
      },
    ],
  },
  {
    id: 'recommend',
    label: 'Recomendador',
    description: 'Texto e SEO da página /recommend.',
    fields: [
      {
        id: 'recommendPage.metadataTitle',
        label: 'SEO título',
        path: ['recommendPage', 'metadataTitle'],
        seo: true,
      },
      {
        id: 'recommendPage.metadataDescription',
        label: 'SEO descrição',
        path: ['recommendPage', 'metadataDescription'],
        multiline: true,
        seo: true,
      },
      { id: 'recommendPage.eyebrow', label: 'Eyebrow', path: ['recommendPage', 'eyebrow'] },
      { id: 'recommendPage.title', label: 'Título', path: ['recommendPage', 'title'] },
      {
        id: 'recommendPage.description',
        label: 'Descrição',
        path: ['recommendPage', 'description'],
        multiline: true,
      },
      { id: 'recommendQuiz.title', label: 'Quiz título', path: ['recommendQuiz', 'title'] },
      {
        id: 'recommendQuiz.description',
        label: 'Quiz descrição',
        path: ['recommendQuiz', 'description'],
        multiline: true,
      },
    ],
  },
  {
    id: 'models',
    label: 'Modelos',
    description: 'Catálogo, listagem de modelos e SEO dinâmico de modelos.',
    fields: [
      { id: 'models.title', label: 'Título listagem', path: ['models', 'title'] },
      {
        id: 'models.description',
        label: 'Descrição listagem',
        path: ['models', 'description'],
        multiline: true,
      },
      {
        id: 'model.description',
        label: 'SEO descrição página de modelo',
        path: ['model', 'description'],
        multiline: true,
        seo: true,
        hint: 'Podes usar {count} e {model}.',
      },
      {
        id: 'vehicle.description',
        label: 'SEO descrição página de veículo',
        path: ['vehicle', 'description'],
        multiline: true,
        seo: true,
        hint: 'Podes usar {vehicle}.',
      },
    ],
  },
  {
    id: 'compare',
    label: 'Comparador',
    description: 'SEO e textos principais da experiência de comparação.',
    fields: [
      {
        id: 'compare.metadataTitle',
        label: 'SEO título',
        path: ['compare', 'metadataTitle'],
        seo: true,
      },
      {
        id: 'compare.metadataDescription',
        label: 'SEO descrição',
        path: ['compare', 'metadataDescription'],
        multiline: true,
        seo: true,
      },
      { id: 'comparisonPage.title', label: 'Título resultado', path: ['comparisonPage', 'title'] },
      {
        id: 'comparisonPage.simpleModeDescription',
        label: 'Descrição modo simples',
        path: ['comparisonPage', 'simpleModeDescription'],
        multiline: true,
      },
      {
        id: 'comparisonPage.advancedModeDescription',
        label: 'Descrição modo avançado',
        path: ['comparisonPage', 'advancedModeDescription'],
        multiline: true,
      },
      {
        id: 'vehicleSelector.description',
        label: 'Descrição seletor',
        path: ['vehicleSelector', 'description'],
        multiline: true,
      },
    ],
  },
  {
    id: 'aboutContacts',
    label: 'Sobre e contactos',
    description: 'Páginas institucionais simples.',
    fields: [
      {
        id: 'aboutPage.metadataTitle',
        label: 'Sobre SEO título',
        path: ['aboutPage', 'metadataTitle'],
        seo: true,
      },
      {
        id: 'aboutPage.metadataDescription',
        label: 'Sobre SEO descrição',
        path: ['aboutPage', 'metadataDescription'],
        multiline: true,
        seo: true,
      },
      { id: 'aboutPage.title', label: 'Sobre título', path: ['aboutPage', 'title'] },
      {
        id: 'aboutPage.description',
        label: 'Sobre descrição',
        path: ['aboutPage', 'description'],
        multiline: true,
      },
      {
        id: 'contactsPage.metadataTitle',
        label: 'Contactos SEO título',
        path: ['contactsPage', 'metadataTitle'],
        seo: true,
      },
      {
        id: 'contactsPage.metadataDescription',
        label: 'Contactos SEO descrição',
        path: ['contactsPage', 'metadataDescription'],
        multiline: true,
        seo: true,
      },
      { id: 'contactsPage.title', label: 'Contactos título', path: ['contactsPage', 'title'] },
      {
        id: 'contactsPage.description',
        label: 'Contactos descrição',
        path: ['contactsPage', 'description'],
        multiline: true,
      },
    ],
  },
  {
    id: 'footer',
    label: 'Footer',
    description: 'Texto institucional usado em todas as páginas.',
    fields: [
      {
        id: 'footer.description',
        label: 'Descrição',
        path: ['footer', 'description'],
        multiline: true,
      },
      {
        id: 'footer.subdescription',
        label: 'Subdescrição',
        path: ['footer', 'subdescription'],
        multiline: true,
      },
    ],
  },
]

function cloneLocale(language: ContentLanguage): EditableLocaleData {
  return JSON.parse(JSON.stringify(LOCALE_EXPORTS[language])) as EditableLocaleData
}

function getNestedValue(data: unknown, keys: string[]) {
  let current = data

  for (const key of keys) {
    if (!current || typeof current !== 'object' || !(key in current)) return ''
    current = (current as Record<string, unknown>)[key]
  }

  return typeof current === 'string' ? current : ''
}

function setNestedValue(data: EditableLocaleData, keys: string[], value: string) {
  let current: Record<string, unknown> = data

  keys.slice(0, -1).forEach((key) => {
    const next = current[key]
    if (!next || typeof next !== 'object' || Array.isArray(next)) {
      current[key] = {}
    }
    current = current[key] as Record<string, unknown>
  })

  current[keys[keys.length - 1]] = value
}

function tsStringify(data: unknown) {
  return JSON.stringify(data, null, 2)
    .replace(/"([^"]+)":/g, (_match, key: string) =>
      /^[A-Za-z_$][A-Za-z0-9_$]*$/.test(key) ? `${key}:` : `"${key}":`
    )
}

export function readEditableContent(): EditableContentValues {
  return Object.fromEntries(
    CONTENT_LANGUAGES.map((language) => [
      language,
      Object.fromEntries(
        EDITABLE_CONTENT_SECTIONS.flatMap((section) => section.fields).map((field) => [
          field.id,
          getNestedValue(LOCALE_EXPORTS[language], field.path),
        ])
      ),
    ])
  ) as EditableContentValues
}

export async function writeEditableContent(values: EditableContentValues) {
  await Promise.all(
    CONTENT_LANGUAGES.map(async (language) => {
      const nextLocale = cloneLocale(language)

      EDITABLE_CONTENT_SECTIONS.flatMap((section) => section.fields).forEach((field) => {
        const value = values[language]?.[field.id]
        if (typeof value === 'string') {
          setNestedValue(nextLocale, field.path, value)
        }
      })

      await fs.writeFile(
        LOCALE_FILES[language],
        `export const ${language} = ${tsStringify(nextLocale)}\n`,
        'utf8'
      )
    })
  )
}
