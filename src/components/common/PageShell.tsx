import type { ReactNode } from 'react'
import { cn } from '@/utils/cn'

interface PageShellProps {
  title: string
  description?: string
  actions?: ReactNode
  children: ReactNode
  className?: string
}

export function PageShell({ title, description, actions, children, className }: PageShellProps) {
  return (
    <div className={cn('space-y-6', className)}>
      <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight text-white md:text-3xl">{title}</h1>
          {description && <p className="mt-1 max-w-3xl text-sm text-alygo-text-muted">{description}</p>}
        </div>
        {actions && <div className="flex flex-wrap items-center gap-2">{actions}</div>}
      </div>
      {children}
    </div>
  )
}
