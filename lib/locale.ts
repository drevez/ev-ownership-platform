export function getLocaleString(
  locale: 'pt' | 'en' | 'es'
) {
  switch (locale) {
    case 'en':
      return 'en-US'

    case 'es':
      return 'es-ES'

    case 'pt':
    default:
      return 'pt-PT'
  }
}