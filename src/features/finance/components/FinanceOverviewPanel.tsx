import { useGetDashboardKpisQuery } from '@/services/api'
import { computeFinanceOverview } from '@/features/finance/financeData'
import { formatCurrency } from '@/utils/format'

export function FinanceOverviewCards() {
  const { data: kpis = [] } = useGetDashboardKpisQuery()
  const revenueToday = kpis.find((k) => k.key === 'revenueToday')?.value ?? 284_750
  const revenueMonth = kpis.find((k) => k.key === 'revenueMonth')?.value ?? 8_420_000
  const overview = computeFinanceOverview(revenueToday, revenueMonth)

  const metrics = [
    { label: 'Total Revenue', value: formatCurrency(overview.revenueThisMonth) },
    { label: 'Platform Earnings', value: formatCurrency(overview.platformCommission) },
    { label: 'Driver Payouts', value: formatCurrency(overview.completedPayouts) },
    { label: 'Wallet Balance', value: formatCurrency(overview.totalWalletBalance) },
    {
      label: 'Pending Payouts',
      value: formatCurrency(overview.pendingDriverPayouts),
      meta: `${overview.pendingPayoutCount} pending`,
    },
  ]

  return (
    <div className="mb-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
      {metrics.map((m) => (
        <div key={m.label} className="glass-card p-5">
          <p className="text-sm text-alygo-text-muted">{m.label}</p>
          <p className="mt-2 text-2xl font-semibold text-white">{m.value}</p>
          {m.meta && <p className="mt-1 text-xs text-indigo-300">{m.meta}</p>}
        </div>
      ))}
    </div>
  )
}

/** @deprecated Use FinanceOverviewCards on the dashboard shell instead. */
export function FinanceOverviewPanel() {
  return <FinanceOverviewCards />
}
