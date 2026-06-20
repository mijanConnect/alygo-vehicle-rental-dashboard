import { cn } from '@/utils/cn'

export const ALYGO_LOGO_SRC = '/alygo-logo.png'

export type BrandLogoSize = 'xs' | 'sm' | 'md' | 'lg' | 'xl'

interface BrandLogoProps {
  size?: BrandLogoSize
  showBrandName?: boolean
  brandName?: string
  centered?: boolean
  className?: string
  imageClassName?: string
}

const imageSizes: Record<BrandLogoSize, string> = {
  xs: 'h-7 w-7',
  sm: 'h-9 w-9',
  md: 'h-11 w-11',
  lg: 'h-16 w-16',
  xl: 'h-20 w-20',
}

export function BrandLogo({
  size = 'md',
  showBrandName = false,
  brandName = 'Alygo Operations',
  centered = false,
  className,
  imageClassName,
}: BrandLogoProps) {
  return (
    <div className={cn('flex items-center gap-3', centered && 'flex-col text-center', className)}>
      <img
        src={ALYGO_LOGO_SRC}
        alt="Alygo"
        className={cn('shrink-0 rounded-xl object-cover', imageSizes[size], imageClassName)}
      />
      {showBrandName && (
        <p className={cn('text-sm font-medium tracking-wide text-[#94A3B8]', centered && 'mt-1')}>
          {brandName}
        </p>
      )}
    </div>
  )
}
