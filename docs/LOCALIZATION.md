# Localization Guide

The EV Ownership Platform supports dynamic internationalization (i18n) and route translation. The current translation files are Portuguese (`pt`), English (`en`), and Spanish (`es`).

---

## 1. Directory Structure

```txt
config/i18n.ts                  Supported languages, labels, default language configuration
lib/i18nRouting.ts              Route segment localization and delocalization logic
lib/serverLocale.ts             Server components helper for header/locale resolution
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
| `/en/compare` | `/pt/comparador` | `/es/comparador` | `compare` page |
| `/en/recommender` | `/pt/recomendador` | `/es/recomendador` | `recommend` page |

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
   const fr = {
     common: { ... },
     // ...
   }
   export default fr
   ```

4. **Register in Local Loader**:
   Open `lib/getTranslations.ts` (and standard locales configurations) and import the new file:
   ```typescript
   import fr from '@/locales/fr'
   // Add fr mapping to translations map
   ```
