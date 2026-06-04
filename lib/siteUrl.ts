export function getSiteUrl() {
  return (process.env.NEXT_PUBLIC_SITE_URL ?? 'https://motorzero.pt').replace(
    /\/$/,
    ''
  )
}

export function absoluteUrl(pathname: string) {
  return `${getSiteUrl()}${pathname}`
}
