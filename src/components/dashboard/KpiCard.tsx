import type { LucideIcon } from 'lucide-react'
import {
  Calendar,
  Car,
  ClipboardCheck,
  DollarSign,
  ListOrdered,
  Plane,
  ShieldAlert,
  TrendingUp,
  UserCheck,
  Users,
} from 'lucide-react'
import type { KpiMetric } from '@/types'
import { cn } from '@/utils/cn'
import { formatCurrency, formatNumber, formatPercent } from '@/utils/format'

const iconMap: Record<string, LucideIcon> = {
  users: Users,
  'user-check': UserCheck,
  car: Car,
  'dollar-sign': DollarSign,
  'trending-up': TrendingUp,
  'clipboard-check': ClipboardCheck,
  'shield-alert': ShieldAlert,
  'list-ordered': ListOrdered,
  plane: Plane,
  calendar: Calendar,
}

interface KpiCardProps {
  metric: KpiMetric
  liveValue?: number
  className?: string
}

export function KpiCard({ metric, liveValue, className }: KpiCardProps) {
  const Icon = iconMap[metric.icon] ?? TrendingUp
  const value = liveValue ?? metric.value
  const formatted =
    metric.format === 'currency'
      ? formatCurrency(value)
      : metric.format === 'percent'
        ? `${value}%`
        : formatNumber(value)

  return (
    <div className={cn('glass-card glass-card-hover p-5', className)}>
      <div className="flex items-start justify-between gap-3">
        <div className="rounded-xl bg-indigo-500/10 p-2.5">
          <Icon className="h-5 w-5 text-indigo-400" />
        </div>
        <span
          className={cn(
            'rounded-full px-2 py-0.5 text-xs font-medium',
            metric.change >= 0 ? 'bg-emerald-500/10 text-emerald-400' : 'bg-red-500/10 text-red-400',
          )}
        >
          {formatPercent(metric.change)}
        </span>
      </div>
      <div className="mt-4">
        <p className="text-sm text-alygo-text-muted">{metric.label}</p>
        <p className="mt-1 text-2xl font-semibold tracking-tight text-white">{formatted}</p>
      </div>
    </div>
  )
}
