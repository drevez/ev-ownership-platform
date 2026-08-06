# EV Comparison System - Implementation Guide

Status: legacy/reference. This document is useful for understanding the comparison subsystem, but it may contain older component names, examples, or implementation assumptions. Check the current code in `components/comparison`, `context/CompareContext.tsx`, `lib/comparison.ts`, and localized routing helpers before copying patterns from here.

## Overview

This document explains the EV comparison subsystem. The current application distinguishes model selection from exact variant comparison and localizes public URLs.

## File Structure

```
/app
  /compare
    page.tsx                 # Comparison entry route
    /models/page.tsx         # Compare model families
    /versions/page.tsx       # Compare exact vehicle variants
  layout.tsx                # Root layout (updated with Provider & Bar)

/components
  /comparison
    CompareButton.tsx       # Add/remove vehicle button
    ComparisonBar.tsx       # Floating sticky bar at bottom
    ComparisonPage.tsx      # Main comparison page component
    ComparisonMetricsTable.tsx
    ComparisonBadgesSection.tsx
    ComparisonSummary.tsx
    ComparisonBarPaddingManager.tsx
    index.ts               # Export barrel

  /vehicle
    VehicleComparisonSection.tsx  # New section in vehicle detail page

/context
  CompareContext.tsx        # Context provider & useCompare hook

/types
  comparison.ts            # All TypeScript types

/lib
  comparison.ts            # Utility functions
```

## Key Features

### 1. Compare Button

- **Location**: Vehicle cards, vehicle detail pages
- **Component**: `CompareButton`
- **Props**:
  - `vehicle: ComparisonVehicle` - Vehicle data
  - `variant?: 'primary' | 'secondary'` - Button style
  - `className?: string` - Additional CSS classes

```tsx
import { CompareButton } from '@/components/comparison'

<CompareButton 
  vehicle={vehicleData} 
  variant="primary"
/>
```

### 2. Comparison Bar

- **Location**: Sticky footer bar (appears when vehicles added)
- **Component**: `ComparisonBar`
- **Features**:
  - Vehicle thumbnails with info
  - Remove buttons for each vehicle
  - Compare CTA button
  - Clear all button
  - Responsive design
  - Smooth animations

### 3. Comparison Pages

- **Internal routes**: `/compare`, `/compare/models`, `/compare/versions`
- **Portuguese URLs**: `/pt/comparador`, `/pt/comparador/modelos`, `/pt/comparador/versoes`
- **Features**:
  - Vehicle header cards with quick stats
  - Badges section (Best Range, Best Value, etc.)
  - Detailed metrics comparison table
  - Summary recommendations
  - Call-to-action sections

### 4. Context & Hook

The `useCompare` hook provides access to comparison state and methods:

```tsx
import { useCompare } from '@/context/CompareContext'

function MyComponent() {
  const {
    state,                  // ComparisonState
    addVehicle,             // Add vehicle to comparison
    removeVehicle,          // Remove vehicle from comparison
    clearComparison,        // Clear all vehicles
    isInComparison,         // Check if vehicle is selected
    getComparisonCount,     // Get number of vehicles
    canAddMore              // Check if can add more (max 3)
  } = useCompare()

  return (
    <>
      {state.vehicles.map(v => <div key={v.id}>{v.displayName}</div>)}
    </>
  )
}
```

## Integration Steps

### Step 1: Add Compare Button to Vehicle Cards

If you have a vehicle card component:

```tsx
import { CompareButton } from '@/components/comparison'

function VehicleCard({ vehicle }) {
  return (
    <div className="vehicle-card">
      <img src={vehicle.image} alt={vehicle.displayName} />
      <h3>{vehicle.displayName}</h3>
      <CompareButton vehicle={vehicle} variant="secondary" />
    </div>
  )
}
```

### Step 2: The System is Already Integrated!

The layout already includes:

- ✅ `CompareProvider` wraps entire app
- ✅ `ComparisonBar` renders at bottom
- ✅ `ComparisonBarPaddingManager` prevents content overlap
- ✅ Vehicle detail pages have comparison section
- ✅ model and version comparison routes are integrated

### Step 3: Add Compare Button to Recommendation Cards

```tsx
import { CompareButton } from '@/components/comparison'

function RecommendationCard({ recommendation }) {
  return (
    <div className="recommendation-card">
      {/* ... existing content ... */}
      <CompareButton 
        vehicle={recommendation.vehicle}
        variant="primary"
      />
    </div>
  )
}
```

## Comparison Metrics

The system automatically compares:

### Primary Metrics (Key Specifications)

- Starting Price (€)
- WLTP Range (km)
- Battery Capacity (kWh)
- WLTP Consumption (kWh/100km)
- Max DC Charging Speed (kW)
- 10-80% Charging Time (min)

### Secondary Metrics (Additional Details)

- Acceleration 0-100 km/h (seconds)
- Horsepower (bhp)
- Seating Capacity (seats)
- Trunk Capacity (L)
- Vehicle Length (mm)

## Automatic Badges

The system automatically awards badges:

- 🛣️ **Best Range** - Longest WLTP range
- 💰 **Best Value** - Most affordable
- ⚡ **Fastest Charging** - Shortest 10-80% charge time
- ♻️ **Most Efficient** - Best kWh/100km
- 🏎️ **Fastest** - Best 0-100 km/h acceleration

## Data Structure

### VehicleDataForComparison

All vehicle data needed for comparison. The system merges data from:

- `core.json` - Brand, model, variant, segment, drivetrain, etc.
- `battery.json` - Capacity, type
- `charging.json` - Max power, charge times
- `efficiency.json` - WLTP range, consumption
- `dimensions.json` - Size, trunk capacity
- `pricing.json` - Price
- normalized performance fields when available in the current data model

### localStorage

Comparison state is persisted in localStorage key: `ev-comparison`
Stores array of vehicle IDs.

## Styling

All components use Tailwind CSS with:

- Dark theme (slate, emerald, teal)
- Smooth transitions (200-500ms)
- Hover effects on cards
- Gradient backgrounds
- Responsive grids
- Mobile-first design

### Color Scheme

- **Primary**: Emerald-500 (#10b981)
- **Background**: Slate-900 (#0f172a)
- **Cards**: Slate-800 (#1e293b)
- **Borders**: Slate-700 (#334155)
- **Accents**: Teal-500 (#14b8a6)

## Customization

### Change Maximum Vehicles

Edit `context/CompareContext.tsx`:

```tsx
if (prev.vehicleIds.length >= 3) {  // Change 3 to desired max
  return prev
}
```

### Add Custom Badges

Edit `lib/comparison.ts` in the `calculateBadges()` function:

```tsx
// Add new badge logic
if (vehicle.someSpec > threshold) {
  badges.push({
    label: 'Custom Badge',
    category: 'custom',
    description: 'Your description'
  })
}
```

### Customize Comparison Metrics

Edit `lib/comparison.ts` in `buildComparisonMetrics()`:

```tsx
// Add new metric
const myMetrics = vehicles.map(v => v.myData)
if (myMetrics.some(m => m > 0)) {
  metrics.push({
    label: 'My Metric',
    category: 'primary',
    unit: 'units',
    values: vehicles.map(v => ({
      vehicleId: v.id,
      value: v.myData,
      displayValue: formatValue(v.myData),
      isWinner: v.myData === Math.max(...myMetrics),
      percentageOfMax: calculatePercentage(v.myData, myMetrics)
    }))
  })
}
```

### Update Yearly Charging Cost Calculation

Edit `lib/comparison.ts` in `calculateYearlyChargingCost()`:

```tsx
const costPerKwh = 0.25  // Change from €0.25/kWh
const averageKmPerYear = 15000  // Change from 15,000 km/year
```

## Best Practices

### For Vehicle Data

1. Keep vehicle JSON in the canonical schema from `VEHICLE_DATA_GUIDE.md`
2. Add canonical-to-comparison mappings in `lib/normalizeVehicle.ts`
3. Use consistent units across all vehicles
4. Run `npm run validate:vehicles` after adding data

### For Components

1. Always wrap comparison features with `CompareProvider`
2. Use `useCompare` hook for comparison access
3. Handle loading and error states
4. Test with 2 and 3 vehicles to ensure responsive layouts

### For UX

1. Provide clear affordances (highlight compare buttons)
2. Show comparison count in buttons and bar
3. Allow quick access to comparison page
4. Persist comparison on page reload (localStorage)
5. Add confirmation before clearing comparison

## Performance Notes

- Context updates are optimized with useCallback
- Metrics calculation is memoized where needed
- localStorage operations are safe for SSR
- Responsive images use proper sizing
- Animations use GPU-accelerated properties

## Browser Support

- Chrome/Edge 90+
- Firefox 88+
- Safari 14+
- Mobile browsers (iOS Safari 14+, Chrome Mobile)

## Troubleshooting

### Comparison bar not appearing

- Check that `CompareProvider` wraps the app in `layout.tsx`
- Verify `ComparisonBar` is imported and rendered
- Check browser console for errors

### Vehicles not persisting

- Ensure localStorage is enabled
- Check that `loadComparisonFromStorage()` is called on mount
- Verify localStorage key name: `ev-comparison`

### Grid layout breaking

- Ensure vehicle count is 2 or 3 (hardcoded in grid-cols-2 and grid-cols-3)
- Check Tailwind config includes these classes
- Verify no custom CSS conflicts

### Missing metrics

- Check vehicle JSON files have required fields
- Ensure field names match exactly in buildComparisonMetrics()
- Verify data types (number for measurements)

## Future Enhancements

- Save multiple comparison sets
- Share comparison via URL/link
- PDF export of comparison
- Custom metric selection
- Total cost of ownership calculator
- Real user reviews integration
- Availability by location
- Test drive booking
- Finance calculator
- Comparison history
