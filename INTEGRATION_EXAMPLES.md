# Comparison Feature Integration Examples

These snippets are illustrative. Prefer the existing components and localized routing helpers in the current codebase. The canonical comparison flows are `/compare/models` and `/compare/versions`, localized through `useLocalizedHref`.

## Example 1: Add Compare Button to Home Page Recommendation Cards

If you have a recommendation card component on your home page:

```tsx
// app/page.tsx or components/recommendation/MatchCard.tsx

'use client'

import { CompareButton } from '@/components/comparison'
import { ComparisonVehicle } from '@/types/comparison'
import Link from 'next/link'

interface MatchCardProps {
  vehicle: ComparisonVehicle
  matchPercentage: number
  reasons: string[]
}

export function MatchCard({ vehicle, matchPercentage, reasons }: MatchCardProps) {
  return (
    <div className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow">
      {/* Vehicle Image */}
      <div className="mb-4 h-40 bg-slate-200 rounded-lg overflow-hidden">
        <img
          src={vehicle.image}
          alt={vehicle.displayName}
          className="w-full h-full object-cover"
        />
      </div>

      {/* Match Percentage */}
      <div className="mb-4">
        <div className="flex justify-between items-center mb-2">
          <h3 className="text-lg font-bold">{vehicle.displayName}</h3>
          <span className="text-2xl font-bold text-emerald-500">
            {matchPercentage}%
          </span>
        </div>
        <div className="w-full bg-slate-200 rounded-full h-2">
          <div
            className="bg-emerald-500 h-2 rounded-full"
            style={{ width: `${matchPercentage}%` }}
          />
        </div>
      </div>

      {/* Reasons */}
      <div className="mb-4">
        <p className="text-sm text-slate-600 mb-2">Why it matches:</p>
        <ul className="text-sm space-y-1">
          {reasons.map((reason, idx) => (
            <li key={idx} className="flex gap-2">
              <span className="text-emerald-500">✓</span>
              <span>{reason}</span>
            </li>
          ))}
        </ul>
      </div>

      {/* Actions */}
      <div className="flex gap-3">
        <Link
          href={`/vehicles/${vehicle.id}`}
          className="flex-1 px-4 py-2 bg-slate-200 text-slate-900 rounded-lg hover:bg-slate-300 transition-colors text-center font-medium"
        >
          View Details
        </Link>
        
        <div className="flex-1">
          <CompareButton vehicle={vehicle} variant="secondary" />
        </div>
      </div>
    </div>
  )
}
```

## Example 2: Vehicle Card with Compare Button

```tsx
// components/VehicleCard.tsx

'use client'

import { CompareButton } from '@/components/comparison'
import { ComparisonVehicle } from '@/types/comparison'
import Link from 'next/link'

interface VehicleCardProps {
  vehicle: ComparisonVehicle
}

export function VehicleCard({ vehicle }: VehicleCardProps) {
  return (
    <div className="bg-white rounded-xl shadow-md overflow-hidden hover:shadow-lg transition-all hover:-translate-y-1">
      {/* Image */}
      <Link href={`/vehicles/${vehicle.id}`}>
        <div className="h-40 bg-slate-200 overflow-hidden">
          <img
            src={vehicle.image}
            alt={vehicle.displayName}
            className="w-full h-full object-cover hover:scale-110 transition-transform"
          />
        </div>
      </Link>

      {/* Content */}
      <div className="p-4">
        <h3 className="font-bold text-lg mb-2">{vehicle.displayName}</h3>
        
        {/* Quick Stats */}
        <div className="grid grid-cols-2 gap-2 mb-4 text-sm">
          {vehicle.efficiency?.wltpRangeKm && (
            <div className="bg-slate-50 rounded p-2">
              <p className="text-xs text-slate-600">Range</p>
              <p className="font-semibold">{Math.round(vehicle.efficiency.wltpRangeKm)} km</p>
            </div>
          )}
          {vehicle.pricing?.basePriceEur && (
            <div className="bg-slate-50 rounded p-2">
              <p className="text-xs text-slate-600">Price</p>
              <p className="font-semibold">€{Math.round(vehicle.pricing.basePriceEur / 1000)}k</p>
            </div>
          )}
          {vehicle.battery?.capacityKwh && (
            <div className="bg-slate-50 rounded p-2">
              <p className="text-xs text-slate-600">Battery</p>
              <p className="font-semibold">{vehicle.battery.capacityKwh} kWh</p>
            </div>
          )}
          {vehicle.performance?.acceleration0To100Ms && (
            <div className="bg-slate-50 rounded p-2">
              <p className="text-xs text-slate-600">0-100</p>
              <p className="font-semibold">{vehicle.performance.acceleration0To100Ms}s</p>
            </div>
          )}
        </div>

        {/* Actions */}
        <div className="flex gap-2">
          <Link
            href={`/vehicles/${vehicle.id}`}
            className="flex-1 px-3 py-2 bg-slate-100 text-slate-900 rounded-lg hover:bg-slate-200 transition-colors text-center text-sm font-medium"
          >
            Details
          </Link>
          <div className="flex-1">
            <CompareButton vehicle={vehicle} variant="secondary" />
          </div>
        </div>
      </div>
    </div>
  )
}
```

## Example 3: Using useCompare Hook

```tsx
// components/ComparisonStats.tsx

'use client'

import { useCompare } from '@/context/CompareContext'
import Link from 'next/link'

export function ComparisonStats() {
  const { state, getComparisonCount } = useCompare()
  const count = getComparisonCount()

  if (count === 0) {
    return null
  }

  return (
    <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 flex items-center justify-between">
      <div>
        <p className="text-sm text-blue-900">
          <span className="font-bold">{count}</span> vehicle{count !== 1 ? 's' : ''} selected for comparison
        </p>
      </div>
      <Link
        href="/compare"
        className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors text-sm font-medium"
      >
        Compare Now
      </Link>
    </div>
  )
}
```

## Example 4: Custom Vehicle List with Comparison

```tsx
// components/VehicleGrid.tsx

'use client'

import { ComparisonVehicle } from '@/types/comparison'
import { VehicleCard } from './VehicleCard'

interface VehicleGridProps {
  vehicles: ComparisonVehicle[]
  title?: string
}

export function VehicleGrid({ vehicles, title }: VehicleGridProps) {
  return (
    <section className="py-12">
      {title && (
        <h2 className="text-3xl font-bold mb-8">{title}</h2>
      )}
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {vehicles.map((vehicle) => (
          <VehicleCard key={vehicle.id} vehicle={vehicle} />
        ))}
      </div>
    </section>
  )
}
```

## Example 5: Comparison Button in Modal/Dialog

```tsx
// components/VehicleModal.tsx

'use client'

import { CompareButton } from '@/components/comparison'
import { ComparisonVehicle } from '@/types/comparison'
import { useState } from 'react'

interface VehicleModalProps {
  vehicle: ComparisonVehicle
  onClose: () => void
}

export function VehicleModal({ vehicle, onClose }: VehicleModalProps) {
  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg max-w-md w-full">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-500 hover:text-gray-700"
        >
          ✕
        </button>

        {/* Content */}
        <div className="p-6">
          <img
            src={vehicle.image}
            alt={vehicle.displayName}
            className="w-full h-40 object-cover rounded-lg mb-4"
          />
          
          <h3 className="text-2xl font-bold mb-2">{vehicle.displayName}</h3>
          <p className="text-slate-600 mb-6">{vehicle.segment}</p>

          {/* Actions */}
          <div className="flex gap-3">
            <button
              onClick={onClose}
              className="flex-1 px-4 py-2 bg-slate-200 text-slate-900 rounded-lg hover:bg-slate-300 transition-colors font-medium"
            >
              Close
            </button>
            
            <div className="flex-1">
              <CompareButton vehicle={vehicle} variant="primary" />
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
```

## Example 6: Navigation with Comparison Link

```tsx
// components/Navigation.tsx

'use client'

import { useCompare } from '@/context/CompareContext'
import Link from 'next/link'

export function Navigation() {
  const { state } = useCompare()
  const comparisonCount = state.vehicles.length

  return (
    <nav className="bg-white shadow-md">
      <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
        <Link href="/" className="text-xl font-bold">
          EV Ownership Platform
        </Link>

        <div className="flex items-center gap-4">
          <Link href="/" className="text-slate-700 hover:text-slate-900">
            Home
          </Link>
          
          <Link href="/vehicles" className="text-slate-700 hover:text-slate-900">
            All Vehicles
          </Link>

          {/* Comparison Link with Badge */}
          <Link
            href="/compare"
            className={`relative px-4 py-2 rounded-lg transition-colors ${
              comparisonCount > 0
                ? 'bg-emerald-500 text-white hover:bg-emerald-600'
                : 'text-slate-700 hover:bg-slate-100'
            }`}
          >
            Compare
            {comparisonCount > 0 && (
              <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                {comparisonCount}
              </span>
            )}
          </Link>
        </div>
      </div>
    </nav>
  )
}
```

## Usage Notes

### Props Reference

#### CompareButton
```tsx
interface CompareButtonProps {
  vehicle: ComparisonVehicle
  variant?: 'primary' | 'secondary'  // Default: 'primary'
  className?: string
}
```

#### useCompare Hook Returns
```tsx
interface CompareContextType {
  state: ComparisonState                      // Current comparison state
  addVehicle: (vehicle: ComparisonVehicle) => void
  removeVehicle: (vehicleId: string) => void
  clearComparison: () => void
  isInComparison: (vehicleId: string) => boolean
  getComparisonCount: () => number
  canAddMore: () => boolean                   // Max 3 vehicles
}
```

### States & Events

The comparison system automatically:
- ✅ Persists to localStorage on every change
- ✅ Prevents adding more than 3 vehicles
- ✅ Shows loading state on comparison page
- ✅ Updates button state based on selection
- ✅ Manages padding to prevent content overlap
- ✅ Handles SSR safely (no hydration mismatch)

### Important Notes

1. **Must be wrapped with CompareProvider** - All comparison features require the provider in layout
2. **localStorage persistence** - Comparison survives page reload
3. **Max 3 vehicles** - Hardcoded limit, change in CompareContext.tsx if needed
4. **Responsive design** - Works on mobile, tablet, desktop
5. **Dark theme** - Uses slate/emerald color scheme (customize in components)
