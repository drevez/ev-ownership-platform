'use client'

import { useTranslations } from '@/hooks/useTranslations'
import { useCompare } from '@/context/CompareContext'
import { ComparisonVehicle } from '@/types/comparison'

interface CompareButtonProps {
  vehicle: ComparisonVehicle
  variant?: 'primary' | 'secondary'
  className?: string
}

export function CompareButton({
  vehicle,
  variant = 'primary',
  className = ''
}: CompareButtonProps) {
  const { addVehicle, removeVehicle, isInComparison, canAddMore } = useCompare()
  const isSelected = isInComparison(vehicle.id)
  const t = useTranslations()

  const handleClick = () => {
    if (isSelected) {
      removeVehicle(vehicle.id)
    } else {
      if (canAddMore()) {
        addVehicle(vehicle)
      }
    }
  }

  const baseStyles = 'px-4 py-2 rounded-lg font-medium transition-all duration-200 flex items-center gap-2'
  
  const variantStyles = {
    primary: isSelected
      ? 'bg-emerald-500 text-white hover:bg-emerald-600 shadow-md'
      : 'bg-slate-200 text-slate-900 hover:bg-slate-300',
    secondary: isSelected
      ? 'bg-emerald-500 text-white hover:bg-emerald-600 border-2 border-emerald-600'
      : 'bg-white text-slate-900 hover:bg-slate-50 border-2 border-slate-200'
  }

  const buttonStyles = `${baseStyles} ${variantStyles[variant]} ${className}`

  // Disable if at max and not selected
  const isDisabled = !canAddMore() && !isSelected

  return (
    <button
      onClick={handleClick}
      disabled={isDisabled}
      className={`${buttonStyles} ${isDisabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
      title={isDisabled ? t.compareButton.maxVehicles : ''}
    >
      {isSelected ? (
        <>
          <span>✓</span>
          <span>{t.compareButton.inComparison}</span>
        </>
      ) : (
        <>
          <span>⚖️</span>
          <span>{t.compareButton.compare}</span>
        </>
      )}
    </button>
  )
}
