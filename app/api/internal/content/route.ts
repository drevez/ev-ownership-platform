import { NextResponse } from 'next/server'

import {
  CONTENT_LANGUAGES,
  EDITABLE_CONTENT_SECTIONS,
  writeEditableContent,
  type ContentLanguage,
  type EditableContentValues,
} from '@/lib/internalContentFiles'
import {
  internalApiUnauthorizedResponse,
  isInternalAuthorized,
} from '@/lib/internalAuth'

interface SaveContentBody {
  values?: EditableContentValues
}

function isContentLanguage(value: string): value is ContentLanguage {
  return CONTENT_LANGUAGES.includes(value as ContentLanguage)
}

function validateValues(values: unknown): values is EditableContentValues {
  if (!values || typeof values !== 'object') return false

  const fields = EDITABLE_CONTENT_SECTIONS.flatMap((section) => section.fields)
  const data = values as Record<string, unknown>

  return CONTENT_LANGUAGES.every((language) => {
    const languageValues = data[language]
    if (!languageValues || typeof languageValues !== 'object') return false

    return fields.every((field) => {
      const value = (languageValues as Record<string, unknown>)[field.id]
      return value == null || typeof value === 'string'
    })
  })
}

export async function POST(request: Request) {
  if (!isInternalAuthorized(request)) {
    return internalApiUnauthorizedResponse()
  }

  try {
    const body = (await request.json()) as SaveContentBody

    if (!validateValues(body.values)) {
      return NextResponse.json({ error: 'Invalid content payload.' }, { status: 400 })
    }

    const normalizedValues = Object.fromEntries(
      Object.entries(body.values).filter(([language]) => isContentLanguage(language))
    ) as EditableContentValues

    await writeEditableContent(normalizedValues)

    return NextResponse.json({ ok: true })
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to save content.' },
      { status: 400 }
    )
  }
}
