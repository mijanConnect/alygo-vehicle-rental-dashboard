import { BrandLogo } from '@/components/shared/BrandLogo'
import { cn } from '@/utils/cn'

export function AuthPageHeader({ className }: { className?: string }) {
  return <BrandLogo size="md" centered className={cn('mb-6', className)} />
}
