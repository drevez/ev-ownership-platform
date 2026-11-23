import Image from 'next/image'

interface BrandLogoProps {
  variant?: 'dark' | 'light' | 'white' | 'black'
  className?: string
  preload?: boolean
}

export function BrandLogo({ variant = 'dark', className = '', preload = false }: BrandLogoProps) {
  return (
    <Image
      src={`/brand/motorzero-${variant}.svg`}
      alt="MotorZero"
      width={1875}
      height={296}
      className={`block h-auto max-w-full ${className}`}
      unoptimized
      preload={preload}
    />
  )
}
