import { DollarSign, FileText, Shield } from 'lucide-react'
import { useGetOperationsPolicyOverviewQuery } from '@/services/operationsPolicyApi'
import { formatNumber } from '@/utils/format'

const overviewConfig = [
  { key: 'totalPolicies', label: 'Total Policies', icon: FileText },
  { key: 'fareAdjustmentRules', label: 'Fare Adjustment Rules', icon: DollarSign },
  { key: 'refundRules', label: 'Refund Rules', icon: DollarSign },
  { key: 'driverPenaltyRules', label: 'Driver Penalty Rules', icon: Shield },
] as const

export function OperationsPolicyOverviewCards() {
  const { data, isLoading } = useGetOperationsPolicyOverviewQuery()

  if (isLoading || !data) {
    return (
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="glass-card h-28 animate-pulse p-5" />
        ))}
      </div>
    )
  }

  return (
    <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
      {overviewConfig.map(({ key, label, icon: Icon }) => (
        <div key={key} className="glass-card p-5">
          <div className="w-fit rounded-xl bg-indigo-500/10 p-2.5">
            <Icon className="h-5 w-5 text-indigo-400" />
          </div>
          <div className="mt-4">
            <p className="text-sm text-alygo-text-muted">{label}</p>
            <p className="mt-1 text-2xl font-semibold tracking-tight text-white">
              {formatNumber(data[key])}
            </p>
          </div>
        </div>
      ))}
    </div>
  )
}
