export function normalizeSignalText(value: string, maxLength = 80) {
  return value
    .replace(/\s+/g, ' ')
    .trim()
    .toLowerCase()
    .slice(0, maxLength)
}

export function isTrackableSearchQuery(value: string) {
  return normalizeSignalText(value).length >= 2
}

