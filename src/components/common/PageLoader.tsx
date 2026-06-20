import type { ReactNode } from 'react'
import { Spin } from 'antd'

interface PageLoaderProps {
  tip?: string
  fullScreen?: boolean
}

export function PageLoader({ tip = 'Loading...', fullScreen = false }: PageLoaderProps) {
  return (
    <div
      className={`flex items-center justify-center ${fullScreen ? 'min-h-screen' : 'min-h-[320px]'}`}
    >
      <Spin size="large" tip={tip} />
    </div>
  )
}

export function LazyPageFallback() {
  return <PageLoader />
}

interface EmptyStateProps {
  title: string
  description?: string
  action?: ReactNode
}

export function EmptyState({ title, description, action }: EmptyStateProps) {
  return (
    <div className="glass-card flex min-h-[280px] flex-col items-center justify-center gap-3 p-8 text-center">
      <h3 className="text-lg font-semibold text-white">{title}</h3>
      {description && <p className="max-w-md text-sm text-alygo-text-muted">{description}</p>}
      {action}
    </div>
  )
}
