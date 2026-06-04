'use client'

import { useState } from 'react'
import Image, { type ImageProps } from 'next/image'

interface SafeImageProps extends Omit<ImageProps, 'onError'> {
  fallbackSrc?: string
}

export function SafeImage({
  src,
  fallbackSrc = '/images/vehicle-placeholder.svg',
  alt,
  ...props
}: SafeImageProps) {
  const [failedSrc, setFailedSrc] = useState<ImageProps['src'] | null>(null)
  const imgSrc = failedSrc === src ? fallbackSrc : src

  return (
    <Image
      {...props}
      src={imgSrc}
      alt={alt}
      onError={() => {
        setFailedSrc(src)
      }}
    />
  )
}
