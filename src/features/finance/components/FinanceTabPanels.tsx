import { Button, Table } from 'antd'
import { CreditCard, Download } from 'lucide-react'
import {
  AdminActionHost,
  createActionsColumn,
  createTableRowProps,
  getFinanceActionItems,
  handleFinanceAction,
  openTransactionDetails,
} from '@/components/admin'
import { KpiCard } from '@/components/dashboard/KpiCard'
import { ChartCard, RevenueTrendChart } from '@/components/charts/AnalyticsCharts'
import {
  MOCK_PAYOUTS,
  MOCK_TRANSACTIONS,
  WALLET_SUMMARY,
} from '@/features/finance/financeData'
import { useAdminActions } from '@/hooks/useAdminActions'
import { useGetDashboardKpisQuery, useGetRevenueTrendQuery } from '@/services/api'
import { formatCurrency } from '@/utils/format'

export function FinanceRevenuePanel() {
  const { data: trend = [] } = useGetRevenueTrendQuery()
  const { data: kpis = [] } = useGetDashboardKpisQuery()
  const revenueKpis = kpis.filter((k) => k.key.includes('revenue') || k.key.includes('Revenue'))

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        {revenueKpis.map((k) => (
          <KpiCard key={k.key} metric={k} />
        ))}
      </div>
      <ChartCard title="Revenue Trend" subtitle="Daily revenue vs forecast">
        <RevenueTrendChart data={trend} />
      </ChartCard>
    </div>
  )
}

export function FinancePayoutsPanel() {
  const adminActions = useAdminActions()

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <p className="text-sm text-alygo-text-muted">Stripe Connect payout management and driver disbursements.</p>
        <Button type="primary" icon={<CreditCard className="h-4 w-4" />} onClick={() => adminActions.notify('Payout batch queued')}>
          Process Payouts
        </Button>
      </div>
      <div className="glass-card flex items-center gap-3 p-4 text-sm text-alygo-text-muted">
        <CreditCard className="h-5 w-5 text-indigo-400" />
        Stripe integration configured for automated driver payouts
      </div>
      <Table
        rowKey="driver"
        dataSource={MOCK_PAYOUTS}
        scroll={{ x: 700 }}
        {...createTableRowProps<typeof MOCK_PAYOUTS[number]>((record) =>
          openTransactionDetails(record as unknown as Record<string, unknown>, adminActions),
        )}
        columns={[
          { title: 'Driver', dataIndex: 'driver' },
          { title: 'Amount', dataIndex: 'amount', render: (a: number) => formatCurrency(a) },
          { title: 'Status', dataIndex: 'status' },
          { title: 'Date', dataIndex: 'date' },
          createActionsColumn<typeof MOCK_PAYOUTS[number]>(
            () => getFinanceActionItems(),
            (key, record) => handleFinanceAction(key, record as unknown as Record<string, unknown>, adminActions),
          ),
        ]}
      />
      <AdminActionHost actions={adminActions} />
    </div>
  )
}

export function FinanceWalletsPanel() {
  return (
    <div className="space-y-4">
      <p className="text-sm text-alygo-text-muted">Passenger and driver wallet balances across the platform.</p>
      <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
        <div className="glass-card p-5">
          <p className="text-sm text-alygo-text-muted">Total Wallet Balance</p>
          <p className="mt-2 text-3xl font-semibold text-white">{formatCurrency(WALLET_SUMMARY.totalBalance)}</p>
        </div>
        <div className="glass-card p-5">
          <p className="text-sm text-alygo-text-muted">Active Wallets</p>
          <p className="mt-2 text-3xl font-semibold text-white">{WALLET_SUMMARY.activeWallets.toLocaleString()}</p>
        </div>
        <div className="glass-card p-5">
          <p className="text-sm text-alygo-text-muted">Pending Top-ups</p>
          <p className="mt-2 text-3xl font-semibold text-white">{formatCurrency(WALLET_SUMMARY.pendingTopUps)}</p>
        </div>
      </div>
    </div>
  )
}

export function FinanceTransactionsPanel() {
  const adminActions = useAdminActions()

  return (
    <div className="space-y-4">
      <p className="text-sm text-alygo-text-muted">All platform financial transactions including trips, payouts, and refunds.</p>
      <Table
        rowKey="id"
        dataSource={MOCK_TRANSACTIONS}
        scroll={{ x: 800 }}
        {...createTableRowProps<typeof MOCK_TRANSACTIONS[number]>((record) =>
          openTransactionDetails(record as unknown as Record<string, unknown>, adminActions),
        )}
        columns={[
          { title: 'Transaction ID', dataIndex: 'id' },
          { title: 'Type', dataIndex: 'type' },
          { title: 'Amount', dataIndex: 'amount', render: (a: number) => formatCurrency(Math.abs(a)) },
          { title: 'Platform Fee', dataIndex: 'fee', render: (f: number) => formatCurrency(f) },
          { title: 'Status', dataIndex: 'status' },
          createActionsColumn<typeof MOCK_TRANSACTIONS[number]>(
            () => getFinanceActionItems(),
            (key, record) => handleFinanceAction(key, record as unknown as Record<string, unknown>, adminActions),
          ),
        ]}
      />
      <AdminActionHost actions={adminActions} />
    </div>
  )
}

export function FinanceReportsPanel() {
  const adminActions = useAdminActions()

  const reportTypes = [
    { name: 'Revenue Summary', description: 'Daily, weekly, and monthly revenue breakdown' },
    { name: 'Payout Ledger', description: 'Driver payout history and pending disbursements' },
    { name: 'Wallet Activity', description: 'Top-ups, balances, and wallet movements' },
    { name: 'Transaction Audit', description: 'Full transaction log with platform fees' },
    { name: 'Refund Report', description: 'Refund volume and dispute-related credits' },
    { name: 'Commission Report', description: 'Platform commission and fee collection' },
  ]

  return (
    <div className="space-y-6">
      <p className="text-sm text-alygo-text-muted">
        Export financial reports for accounting, reconciliation, and executive review.
      </p>
      <div className="flex flex-wrap gap-2">
        <Button icon={<Download className="h-4 w-4" />} onClick={() => adminActions.notify('Financial report exported as CSV')}>
          Export CSV
        </Button>
        <Button icon={<Download className="h-4 w-4" />} onClick={() => adminActions.notify('Financial report exported as PDF')}>
          Export PDF
        </Button>
        <Button type="primary" icon={<Download className="h-4 w-4" />} onClick={() => adminActions.notify('Financial report exported as Excel')}>
          Export Excel
        </Button>
      </div>
      <div className="grid gap-4 md:grid-cols-2">
        {reportTypes.map((report) => (
          <div key={report.name} className="glass-card p-4">
            <p className="font-medium text-white">{report.name}</p>
            <p className="mt-1 text-sm text-alygo-text-muted">{report.description}</p>
          </div>
        ))}
      </div>
      <AdminActionHost actions={adminActions} />
    </div>
  )
}
