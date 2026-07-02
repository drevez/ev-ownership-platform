'use client'

import React, {
  createContext,
  useContext,
  useState,
  useCallback,
  useEffect,
} from 'react'
import { ComparisonVehicle, ComparisonState } from '@/types/comparison'
import {
  mapApiToComparisonVehicle,
} from '@/lib/comparison'
import {
  clearComparisonIds,
  loadComparisonIds,
  normalizeComparisonIds,
  saveComparisonIds,
} from '@/lib/comparisonStorage'
import type { ComparisonApiResponse } from '@/lib/comparisonSelection'

interface CompareContextType {
  state: ComparisonState
  addVehicle: (vehicle: ComparisonVehicle) => void
  removeVehicle: (vehicleId: string) => void
  setSelectedVehicleIds: (
    vehicleIds: string[],
    vehicles?: ComparisonVehicle[]
  ) => void
  clearComparison: () => void
  isInComparison: (vehicleId: string) => boolean
  getComparisonCount: () => number
  canAddMore: () => boolean
}

const CompareContext = createContext<CompareContextType | undefined>(undefined)

function mergeVehiclesById(
  existing: ComparisonVehicle[],
  incoming: ComparisonVehicle[]
): ComparisonVehicle[] {
  const byId = new Map(existing.map((v) => [v.id, v]))
  for (const vehicle of incoming) {
    byId.set(vehicle.id, vehicle)
  }
  return Array.from(byId.values())
}

export function CompareProvider({ children }: { children: React.ReactNode }) {
  const [state, setState] = useState<ComparisonState>(() => {
    return {
      vehicleIds: loadComparisonIds(),
      vehicles: [],
      isLoading: false,
      error: null,
    }
  })

  const vehicleIdsKey = state.vehicleIds.join(',')

  useEffect(() => {
    const selectedIds = vehicleIdsKey.split(',').filter(Boolean)
    if (selectedIds.length === 0) return

    const controller = new AbortController()

    async function hydrateVehicles() {
      setState((prev) => ({ ...prev, isLoading: true, error: null }))

      try {
        const params = new URLSearchParams()
        selectedIds.forEach((id) => params.append('ids', id))

        const response = await fetch(`/api/vehicles?${params.toString()}`, {
          signal: controller.signal,
        })
        if (!response.ok) throw new Error(`Vehicle hydration failed (${response.status})`)
        const data = await response.json() as ComparisonApiResponse<
          Record<string, unknown> & { id: string }
        >
        const hydrated = (data.vehicles ?? []).map(
          (vehicle: Record<string, unknown> & { id: string }) =>
            mapApiToComparisonVehicle(vehicle)
        )

        setState((prev) => {
          if (prev.vehicleIds.join(',') !== vehicleIdsKey) return prev
          const validIds = selectedIds.filter((id) => !data.missing.includes(id))
          const vehicles = mergeVehiclesById([], hydrated).filter((vehicle) =>
            validIds.includes(vehicle.id)
          )
          if (validIds.length !== selectedIds.length) saveComparisonIds(validIds)
          return {
            ...prev,
            vehicleIds: validIds,
            vehicles,
            isLoading: false,
            error: data.missing.length > 0
              ? 'Some saved comparison vehicles are no longer available'
              : null,
          }
        })
      } catch (error) {
        if (controller.signal.aborted) return
        console.error('Failed to hydrate comparison vehicles:', error)
        setState((prev) => ({
          ...prev,
          isLoading: false,
          error: 'Failed to load comparison vehicles',
        }))
      }
    }

    hydrateVehicles()

    return () => controller.abort()
  }, [vehicleIdsKey])

  const addVehicle = useCallback((vehicle: ComparisonVehicle) => {
    setState((prev) => {
      if (prev.vehicleIds.length >= 3 || prev.vehicleIds.includes(vehicle.id)) {
        return prev
      }
      const newIds = [...prev.vehicleIds, vehicle.id]
      const newVehicles = [...prev.vehicles, vehicle]

      saveComparisonIds(newIds)

      return {
        ...prev,
        vehicleIds: newIds,
        vehicles: newVehicles,
        isLoading: newIds.length > 0 ? prev.isLoading : false,
        error: null,
      }
    })
  }, [])

  const removeVehicle = useCallback((vehicleId: string) => {
    setState((prev) => {
      const newIds = prev.vehicleIds.filter((id) => id !== vehicleId)
      const newVehicles = prev.vehicles.filter((v) => v.id !== vehicleId)

      saveComparisonIds(newIds)

      return {
        ...prev,
        vehicleIds: newIds,
        vehicles: newVehicles,
        error: null,
      }
    })
  }, [])

  const setSelectedVehicleIds = useCallback(
    (vehicleIds: string[], vehicles?: ComparisonVehicle[]) => {
      setState((prev) => {
        const normalizedIds = normalizeComparisonIds(vehicleIds)
        const newVehicles = vehicles
          ? vehicles.filter((v) => normalizedIds.includes(v.id))
          : prev.vehicles.filter((v) => normalizedIds.includes(v.id))

        saveComparisonIds(normalizedIds)

        return {
          ...prev,
          vehicleIds: normalizedIds,
          vehicles: newVehicles,
          isLoading: normalizedIds.length > 0 ? prev.isLoading : false,
          error: null,
        }
      })
    },
    []
  )

  const clearComparison = useCallback(() => {
    setState({
      vehicleIds: [],
      vehicles: [],
      isLoading: false,
      error: null,
    })
    clearComparisonIds()
  }, [])

  const isInComparison = useCallback(
    (vehicleId: string) => {
      return state.vehicleIds.includes(vehicleId)
    },
    [state.vehicleIds]
  )

  const getComparisonCount = useCallback(() => {
    return state.vehicleIds.length
  }, [state.vehicleIds.length])

  const canAddMore = useCallback(() => {
    return state.vehicleIds.length < 3
  }, [state.vehicleIds.length])

  const value: CompareContextType = {
    state,
    addVehicle,
    removeVehicle,
    setSelectedVehicleIds,
    clearComparison,
    isInComparison,
    getComparisonCount,
    canAddMore,
  }

  return (
    <CompareContext.Provider value={value}>{children}</CompareContext.Provider>
  )
}

export function useCompare(): CompareContextType {
  const context = useContext(CompareContext)
  if (!context) {
    throw new Error('useCompare must be used within CompareProvider')
  }
  return context
}
