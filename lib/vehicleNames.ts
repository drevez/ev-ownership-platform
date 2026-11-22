export function getModelDisplayName(brand: string, model: string): string {
  const brandName = brand.trim()
  const modelName = model.trim()
  return brandName.toLocaleLowerCase() === modelName.toLocaleLowerCase()
    ? brandName
    : [brandName, modelName].filter(Boolean).join(' ')
}

export function formatVehicleName(brand: string, model: string, variant?: string): string {
  return [getModelDisplayName(brand, model), variant?.trim()].filter(Boolean).join(' ')
}
