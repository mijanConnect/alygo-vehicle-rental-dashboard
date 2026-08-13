import React from 'react'
import { ChartCard } from '@/components/charts/AnalyticsCharts'

interface ChartPanelWrapperProps {
  title: string
  subtitle?: string
  isLoading: boolean
  error: any
  loadingMessage?: string
  errorMessage?: string
  children: React.ReactNode
}

export function ChartPanelWrapper({
  title,
  subtitle,
  isLoading,
  error,
  loadingMessage = 'Loading analytics...',
  errorMessage = 'Failed to load analytics data.',
  children,
}: ChartPanelWrapperProps) {
  if (isLoading) {
    return (
      <ChartCard title={title} subtitle={subtitle}>
        <div className="h-full w-full animate-pulse bg-slate-800/10 rounded-lg flex items-center justify-center text-alygo-text-muted">
          {loadingMessage}
        </div>
      </ChartCard>
    )
  }

  if (error) {
    return (
      <ChartCard title={title} subtitle={subtitle}>
        <div className="h-full w-full rounded-lg flex items-center justify-center text-red-400">
          {errorMessage}
        </div>
      </ChartCard>
    )
  }

  return (
    <ChartCard title={title} subtitle={subtitle}>
      {children}
    </ChartCard>
  )
}
