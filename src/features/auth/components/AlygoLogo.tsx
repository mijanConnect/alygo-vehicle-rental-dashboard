import { BrandLogo } from '@/components/shared/BrandLogo'

interface AlygoLogoProps {
  className?: string
  size?: 'sm' | 'md' | 'lg'
}

export function AlygoLogo({ className, size = 'lg' }: AlygoLogoProps) {
  const sizeMap = { sm: 'sm' as const, md: 'md' as const, lg: 'xl' as const }

  return (
    <BrandLogo
      size={sizeMap[size]}
      showBrandName
      centered
      brandName="Alygo Operations"
      className={className}
    />
  )
}
