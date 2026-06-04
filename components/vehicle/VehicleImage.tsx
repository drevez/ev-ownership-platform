'use client'

import { useState } from 'react'
import { useTranslations } from '@/hooks/useTranslations'

interface VehicleImageProps {
  src: string
  alt: string
  vehicleId?: string
  displayName?: string
}

export function VehicleImage({
  src,
  alt,
  vehicleId,
  displayName
}: VehicleImageProps) {

  const t = useTranslations()

  const [imageError, setImageError] = useState(false)

  if (imageError || !src) {
    return (
      <div className="w-full h-full bg-gradient-to-br from-slate-800 via-slate-700 to-slate-900 flex items-center justify-center overflow-hidden">

        {/* Animated background pattern */}
        <div className="absolute inset-0 opacity-10">

          <svg
            className="w-full h-full"
            xmlns="http://www.w3.org/2000/svg"
          >

            <pattern
              id="grid"
              width="40"
              height="40"
              patternUnits="userSpaceOnUse"
            >
              <path
                d="M 40 0 L 0 0 0 40"
                fill="none"
                stroke="white"
                strokeWidth="0.5"
              />
            </pattern>

            <rect
              width="100%"
              height="100%"
              fill="url(#grid)"
            />

          </svg>

        </div>

        {/* Fallback content */}
        <div className="relative z-10 text-center px-6">

          <div className="mb-4">

            <div className="inline-block bg-white/10 backdrop-blur-sm rounded-full p-4 mb-4">

              <svg
                className="w-16 h-16 text-white/60"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >

                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={1.5}
                  d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                />

              </svg>

            </div>

          </div>

          <h3 className="text-lg font-semibold text-white/80 mb-1">
            {t.vehicleImage.comingSoon}
          </h3>

          {displayName && (
            <p className="text-sm text-white/60">
              {displayName}
            </p>
          )}

          {vehicleId && (
            <p className="text-xs text-white/40 mt-2 font-mono">
              {vehicleId}
            </p>
          )}

        </div>

      </div>
    )
  }

  return (
    <img
      src={src}
      alt={alt}
      className="w-full h-full object-cover"
      onError={() => setImageError(true)}
    />
  )
}
