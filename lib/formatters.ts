import { getTranslations } from '@/lib/getTranslations'

/**
 * Format currency values with proper locale and symbol
 */
export function formatPrice(
  price: number | undefined,
  currency: string = 'EUR',
  locale: string = 'pt-PT'
): string {
  const t = getTranslations(locale.split('-')[0])

  if (price === undefined || price === null) {
    return t.common.notAvailable
  }

  return new Intl.NumberFormat(locale, {
    style: 'currency',
    currency,
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(price)
}

/**
 * Format distance/range values with km unit
 */
export function formatKm(
  km: number | undefined,
  locale: string = 'pt-PT'
): string {
  const t = getTranslations(locale.split('-')[0])

  if (km === undefined || km === null) {
    return t.common.notAvailable
  }

  return `${km.toLocaleString(locale)} km`
}

/**
 * Format power values with kW unit
 */
export function formatPower(
  kw: number | undefined,
  locale: string = 'pt-PT'
): string {
  const t = getTranslations(locale.split('-')[0])

  if (kw === undefined || kw === null) {
    return t.common.notAvailable
  }

  return `${kw.toLocaleString(locale)} kW`
}

/**
 * Format consumption values with Wh/km unit
 */
export function formatConsumption(
  whPerKm: number | undefined,
  locale: string = 'pt-PT'
): string {
  const t = getTranslations(locale.split('-')[0])

  if (whPerKm === undefined || whPerKm === null) {
    return t.common.notAvailable
  }

  return `${whPerKm.toLocaleString(locale)} Wh/km`
}

/**
 * Format battery capacity with kWh unit
 */
export function formatBattery(
  kwh: number | undefined,
  locale: string = 'pt-PT'
): string {
  const t = getTranslations(locale.split('-')[0])

  if (kwh === undefined || kwh === null) {
    return t.common.notAvailable
  }

  return `${kwh.toLocaleString(locale)} kWh`
}

/**
 * Format volume with liters unit
 */
export function formatLiters(
  liters: number | undefined,
  locale: string = 'pt-PT'
): string {
  const t = getTranslations(locale.split('-')[0])

  if (liters === undefined || liters === null) {
    return t.common.notAvailable
  }

  return `${liters.toLocaleString(locale)} L`
}

/**
 * Format dimensions in mm, optionally convert to m
 */
export function formatDimension(
  mm: number | undefined,
  inMeters: boolean = false,
  locale: string = 'pt-PT'
): string {
  const t = getTranslations(locale.split('-')[0])

  if (mm === undefined || mm === null) {
    return t.common.notAvailable
  }

  if (inMeters) {
    return `${(mm / 1000).toFixed(2)} m`
  }

  return `${mm.toLocaleString(locale)} mm`
}

/**
 * Format efficiency as km/kWh
 */
export function formatEfficiency(
  watthoursPerKm: number | undefined,
  locale: string = 'pt-PT'
): string {
  const t = getTranslations(locale.split('-')[0])

  if (watthoursPerKm === undefined || watthoursPerKm === null) {
    return t.common.notAvailable
  }

  const kmPerKwh = (1000 / watthoursPerKm).toFixed(2)

  return `${kmPerKwh} km/kWh`
}

/**
 * Format field name from camelCase to Title Case
 */
export function formatFieldName(fieldName: string): string {
  return fieldName
    .replace(/([A-Z])/g, ' $1')
    .replace(/([a-z])([0-9])/g, '$1 $2')
    .replace(/^./, (str) => str.toUpperCase())
    .trim()
}

/**
 * Format boolean as readable text with optional icons
 */
export function formatBoolean(
  value: boolean | undefined,
  withIcon: boolean = true,
  locale: string = 'pt-PT'
): string {
  const t = getTranslations(locale.split('-')[0])

  if (value === undefined || value === null) {
    return t.common.notAvailable
  }

  if (withIcon) {
    return value
      ? `✓ ${t.common.yes}`
      : `✗ ${t.common.no}`
  }

  return value ? t.common.yes : t.common.no
}