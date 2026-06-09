'use client'

import { SafeImage } from '@/components/SafeImage'

interface VehicleImageProps {
  src: string
  alt: string
}

export function VehicleImage({
  src,
  alt,
}: VehicleImageProps) {
  return (
    <SafeImage
      src={src || '/images/vehicle-placeholder.svg'}
      alt={alt}
      fill
      sizes="100vw"
      className="object-cover"
      fallbackSrc="/images/vehicle-placeholder.svg"
    />
  )
}
