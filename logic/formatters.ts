/**
 * Format currency values with proper locale and symbol
 */
export function formatPrice(
  price: number | undefined,
  currency: string = 'EUR',
  locale: string = 'pt-PT'
): string {
  if (price === undefined || price === null) return 'N/A'

  return new Intl.NumberFormat(locale, {
    style: 'currency',
    currency,
    minimumFractionDigits: 0,
    maximumFractionDigits: 0
  }).format(price)
}

/**
 * Format distance/range values with km unit
 */
export function formatKm(km: number | undefined): string {
  if (km === undefined || km === null) return 'N/A'
  return `${km.toLocaleString('pt-PT')} km`
}

/**
 * Format power values with kW unit
 */
export function formatPower(kw: number | undefined): string {
  if (kw === undefined || kw === null) return 'N/A'
  return `${kw.toLocaleString('pt-PT')} kW`
}

/**
 * Format consumption values with Wh/km unit
 */
export function formatConsumption(whPerKm: number | undefined): string {
  if (whPerKm === undefined || whPerKm === null) return 'N/A'
  return `${whPerKm.toLocaleString('pt-PT')} Wh/km`
}

/**
 * Format battery capacity with kWh unit
 */
export function formatBattery(kwh: number | undefined): string {
  if (kwh === undefined || kwh === null) return 'N/A'
  return `${kwh.toLocaleString('pt-PT')} kWh`
}

/**
 * Format volume with liters unit
 */
export function formatLiters(liters: number | undefined): string {
  if (liters === undefined || liters === null) return 'N/A'
  return `${liters.toLocaleString('pt-PT')} L`
}

/**
 * Format dimensions in mm, optionally convert to m
 */
export function formatDimension(mm: number | undefined, inMeters: boolean = false): string {
  if (mm === undefined || mm === null) return 'N/A'
  if (inMeters) {
    return `${(mm / 1000).toFixed(2)} m`
  }
  return `${mm.toLocaleString('pt-PT')} mm`
}

/**
 * Format efficiency as km/kWh
 */
export function formatEfficiency(watthoursPerKm: number | undefined): string {
  if (watthoursPerKm === undefined || watthoursPerKm === null) return 'N/A'
  const kmPerKwh = (1000 / watthoursPerKm).toFixed(2)
  return `${kmPerKwh} km/kWh`
}

/**
 * Format field name from camelCase to Title Case
 */
export function formatFieldName(fieldName: string): string {
  return fieldName
    .replace(/([A-Z])/g, ' $1') // Add space before capitals
    .replace(/([a-z])([0-9])/g, '$1 $2') // Add space before numbers
    .replace(/^./, (str) => str.toUpperCase()) // Capitalize first letter
    .trim()
}

/**
 * Format boolean as readable text with optional icons
 */
export function formatBoolean(value: boolean | undefined, withIcon: boolean = true): string {
  if (value === undefined || value === null) return 'N/A'
  if (withIcon) {
    return value ? '✓ Yes' : '✗ No'
  }
  return value ? 'Yes' : 'No'
}
