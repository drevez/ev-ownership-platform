# Localization Guide

The EV Ownership Platform supports dynamic internationalization (i18n) and route translation. The current translation files are Portuguese (`pt`), English (`en`), and Spanish (`es`).

---

## 1. Directory Structure

```txt
config/i18n.ts                  Supported languages, labels, default language configuration
lib/i18nRouting.ts              Route segment localization and delocalization logic
lib/serverLocale.ts             Server components helper for header/locale resolution
lib/internalContentFiles.ts     Internal content/SEO editor field map and locale-file writer
hooks/useTranslations.ts        Client hook for loading the locale object
hooks/useLocalizedHref.ts       Client hook for constructing route localized URLs
locales/
├── pt.ts                       Portuguese translations dictionary
├── en.ts                       English translations dictionary
└── es.ts                       Spanish translations dictionary
```

---

## 2. Route Translation Mapping

Instead of a generic path like `/models` or `/compare`, the URL paths are translated based on the active language. These translations are defined in [lib/i18nRouting.ts](file:///Users/danielarevez/ev-ownership-platform/lib/i18nRouting.ts):

| English | Portuguese | Spanish | Internal Target |
|---|---|---|---|
| `/en/models` | `/pt/modelos` | `/es/modelos` | `models` page |
| `/en/vehicles` | `/pt/veiculos` | `/es/vehiculos` | `vehicles` page |
| `/en/compare` | `/pt/comparador` | `/es/comparador` | `compare` page |
| `/en/recommender` | `/pt/recomendador` | `/es/recomendador` | `recommend` page |
| `/en/about` | `/pt/sobre` | `/es/sobre` | `about` page |
| `/en/contacts` | `/pt/contactos` | `/es/contacto` | `contacts` page |
| `/en/search` | `/pt/pesquisa` | `/es/buscar` | `search` page |
| `/en/privacy` | `/pt/privacidade` | `/es/privacidad` | privacy page |
| `/en/terms` | `/pt/termos` | `/es/terminos` | terms page |
| `/en/cookies` | `/pt/cookies` | `/es/cookies` | cookie policy |

---

## 3. Resolving Hrefs Dynamically

### Client Components
Always wrap internal relative paths in `useLocalizedHref` (or custom wrapper) so they generate the translated, prefixed URL:

```typescript
'use client'
import { useLocalizedHref } from '@/hooks/useLocalizedHref'
import Link from 'next/link'

export default function MyComponent() {
  const localizedHref = useLocalizedHref()

  return (
    <Link href={localizedHref('/compare')}>
      {/* Generates /pt/comparador when PT is active */}
      Compare Vehicles
    </Link>
  )
}
```

### Server Components / Middleware
Use `buildLocalizedHref(href, language)` from [lib/i18nRouting.ts](file:///Users/danielarevez/ev-ownership-platform/lib/i18nRouting.ts).

---

## 4. Retrieving Translations

### Client-Side
Use `useTranslations` from [hooks/useTranslations.ts](file:///Users/danielarevez/ev-ownership-platform/hooks/useTranslations.ts) to retrieve the active dictionary:

```typescript
'use client'
import { useTranslations } from '@/hooks/useTranslations'

export default function Welcome() {
  const t = useTranslations()
  return <h1>{t.home.hero.title}</h1>
}
```

### Server-Side
Retrieve the headers in server components or API routes:

```typescript
import { getRequestLanguage } from '@/lib/serverLocale'
import { getTranslations } from '@/lib/getTranslations'

export default async function Page() {
  const locale = await getRequestLanguage()
  const t = getTranslations(locale)
  
  return <p>{t.common.loading}</p>
}
```

---

## 5. Adding a New Language (e.g., French `fr`)

Follow these steps to add a new supported language to the platform:

1. **Add to Supported Languages**:
   Open [config/i18n.ts](file:///Users/danielarevez/ev-ownership-platform/config/i18n.ts) and add the code (`fr`) to `SUPPORTED_LANGUAGES`, its label to `LANGUAGE_LABELS`, and its locale specifier to `LANGUAGE_LOCALES`:
   ```typescript
   export const SUPPORTED_LANGUAGES = ['pt', 'en', 'es', 'fr'] as const
   
   export const LANGUAGE_LABELS = {
     pt: 'Português',
     en: 'English',
     es: 'Español',
     fr: 'Français',
   }
   
   export const LANGUAGE_LOCALES = {
     pt: 'pt-PT',
     en: 'en',
     es: 'es',
     fr: 'fr-FR',
   }
   ```

2. **Add Segment Translations**:
   Open [lib/i18nRouting.ts](file:///Users/danielarevez/ev-ownership-platform/lib/i18nRouting.ts) and define localized route segments for the new language under `LOCALIZED_ROUTE_SEGMENTS`:
   ```typescript
   models: {
     pt: 'modelos',
     en: 'models',
     es: 'modelos',
     fr: 'modeles',
   }
   ```

3. **Create Translation File**:
   Create `locales/fr.ts` copying the structure of `locales/en.ts` and translate all values:
   ```typescript
   export const fr = {
     common: { ... },
     // ...
   }
   ```

4. **Register in Local Loader**:
   Open `lib/getTranslations.ts` (and standard locales configurations) and import the new file:
   ```typescript
   import { fr } from '@/locales/fr'
   // Add fr mapping to translations map
   ```

5. **Update Internal Content Editor**:
   Open [lib/internalContentFiles.ts](/Users/danielarevez/ev-ownership-platform/lib/internalContentFiles.ts) and add the new language to `CONTENT_LANGUAGES`, `LOCALE_FILES`, and `LOCALE_EXPORTS` if the internal editor should support it.

---

## 6. Editing Page Copy And SEO

Most public page copy and SEO metadata live in:

```txt
locales/pt.ts
locales/en.ts
locales/es.ts
```

For non-technical editing, use the internal content editor:

```txt
/internal/content
```

It currently edits:

- global metadata defaults
- homepage copy
- recommender page and quiz intro copy
- model and vehicle SEO descriptions
- comparison page copy
- about and contacts page copy
- footer copy
Cookie banner copy and privacy, cookie, and terms content currently live in the locale files but are not yet exposed by `/internal/content`.

The editor writes back to the locale files. After saving content changes, run:

```bash
npm run build
```

`/internal/content` is protected by the server-side Basic Auth used for all internal routes.

---

## 7. Internal Routes

Internal tooling routes such as `/internal/vehicles` and `/internal/content` should be linked directly and should not be translated for public SEO. They are development/admin surfaces, not public localized pages.
