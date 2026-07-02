const COMPARISON_STORAGE_KEY = 'ev-comparison'
import { normalizeComparisonSelection } from '@/lib/comparisonSelection'

export interface StoredComparison {
  vehicleIds: string[]
}

export function normalizeComparisonIds(value: unknown): string[] {
  return normalizeComparisonSelection(value).values
}

export function parseStoredComparison(value: string | null): StoredComparison {
  if (!value) return { vehicleIds: [] }

  try {
    const parsed: unknown = JSON.parse(value)
    if (Array.isArray(parsed)) {
      return { vehicleIds: normalizeComparisonIds(parsed) }
    }

    if (!parsed || typeof parsed !== 'object') {
      return { vehicleIds: [] }
    }

    return {
      vehicleIds: normalizeComparisonIds(
        (parsed as { vehicleIds?: unknown }).vehicleIds
      ),
    }
  } catch {
    return { vehicleIds: [] }
  }
}

export function loadComparisonIds(): string[] {
  if (typeof window === 'undefined') return []
  return parseStoredComparison(window.localStorage.getItem(COMPARISON_STORAGE_KEY)).vehicleIds
}

export function saveComparisonIds(vehicleIds: string[]) {
  if (typeof window === 'undefined') return
  window.localStorage.setItem(
    COMPARISON_STORAGE_KEY,
    JSON.stringify({ vehicleIds: normalizeComparisonIds(vehicleIds) })
  )
}

export function clearComparisonIds() {
  if (typeof window === 'undefined') return
  window.localStorage.removeItem(COMPARISON_STORAGE_KEY)
}
