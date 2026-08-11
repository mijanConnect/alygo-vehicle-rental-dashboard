import {
  useGetFinancialRevenueSummaryQuery,
  useGetFinancialWalletsSummaryQuery,
} from '@/redux/api/finalcialCenter'
import { formatCurrency, formatNumber } from '@/utils/format'

export function FinanceOverviewCards() {
  const { data: revenue, isLoading: revenueLoading } = useGetFinancialRevenueSummaryQuery()
  const { data: wallets, isLoading: walletsLoading } = useGetFinancialWalletsSummaryQuery()

  const summary = revenue?.summary
  const period = revenue?.revenue

  const metrics = [
    {
      label: 'Total Revenue',
      value: formatCurrency(summary?.totalRevenue ?? 0),
      meta: period ? `Today ${formatCurrency(period.today)}` : undefined,
    },
    {
      label: 'Platform Earnings',
      value: formatCurrency(summary?.platformEarnings ?? 0),
    },
    {
      label: 'Driver Payouts',
      value: formatCurrency(summary?.driverPayouts ?? 0),
    },
    {
      label: 'Wallet Balance',
      value: formatCurrency(wallets?.totalWalletBalance ?? 0),
      meta: wallets ? `${formatNumber(wallets.activeWallets)} active` : undefined,
    },
    {
      label: 'Pending Top-ups',
      value: formatCurrency(wallets?.pendingTopUps ?? 0),
    },
  ]

  if (revenueLoading || walletsLoading) {
    return (
      <div className="mb-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
        {Array.from({ length: 5 }).map((_, i) => (
          <div key={i} className="glass-card h-28 animate-pulse p-5" />
        ))}
      </div>
    )
  }

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
