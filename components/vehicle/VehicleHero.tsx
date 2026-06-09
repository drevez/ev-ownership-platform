'use client'

import { VehicleImage } from './VehicleImage'

interface VehicleHeroProps {
  displayName: string
  image: string
  segment?: string
  bodyType?: string
  drivetrain?: string
}

export function VehicleHero({
  displayName,
  image,
  segment,
  bodyType,
  drivetrain
}: VehicleHeroProps) {
  return (
    <div className="relative w-full bg-slate-900 overflow-hidden">
      {/* Hero container with fixed aspect ratio */}
      <div className="relative w-full pt-[60%] bg-gradient-to-br from-slate-900 to-slate-800">
        {/* Background image */}
        <div className="absolute inset-0">
          <VehicleImage
            src={image}
            alt={displayName}
          />
          {/* Gradient overlay - from bottom to top */}
          <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-900/40 to-transparent" />
          {/* Additional dark overlay on sides */}
          <div className="absolute inset-0 bg-gradient-to-r from-slate-950/20 to-slate-950/20" />
        </div>

        {/* Content overlay - positioned absolutely over the image */}
        <div className="absolute inset-0 flex flex-col justify-end p-6 md:p-10 lg:p-12">
          <div className="max-w-4xl mx-auto w-full">
            {/* Main title */}
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-white mb-6 leading-tight">
              {displayName}
            </h1>

            {/* Badges */}
            <div className="flex flex-wrap gap-2 sm:gap-3">
              <Badge label={segment} />
              <Badge label={bodyType} />
              <Badge label={drivetrain} />
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

function Badge({ label }: { label?: string }) {
  return (
    <span className="inline-block bg-white/15 hover:bg-white/25 backdrop-blur-md text-white px-4 py-2 rounded-full text-sm font-semibold transition-colors border border-white/20">
      {label || 'TBD'}
    </span>
  )
}
