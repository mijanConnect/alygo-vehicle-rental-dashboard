import { useState } from 'react'
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
import { StatusBadge } from '@/components/common/StatusBadge'
import { KpiCard } from '@/components/dashboard/KpiCard'
import { ChartCard, RevenueTrendChart } from '@/components/charts/AnalyticsCharts'
import { Pagination } from '@/components/shared/Pagination'
import { SearchingInput } from '@/components/shared/SearchingInput'
import { useAdminActions } from '@/hooks/useAdminActions'
import {
  useGetFinancialPayoutsQuery,
  useGetFinancialRevenueSummaryQuery,
  useGetFinancialTransactionsQuery,
  useGetFinancialWalletsSummaryQuery,
} from '@/redux/api/finalcialCenter'
import type {
  FinancePayoutItem,
  FinanceTransactionItem,
} from '@/redux/api/finalcialCenter'
import type { ChartPoint, KpiMetric } from '@/types'
import { formatCurrency, formatDateTime, formatNumber } from '@/utils/format'

export function FinanceRevenuePanel() {
  const { data, isLoading } = useGetFinancialRevenueSummaryQuery()

  const kpis: KpiMetric[] = [
    {
      key: 'revenueToday',
      label: 'Revenue Today',
      value: data?.revenue.today ?? 0,
      change: 0,
      format: 'currency',
      icon: 'dollar',
    },
    {
      key: 'revenueMonth',
      label: 'Revenue This Month',
      value: data?.revenue.thisMonth ?? 0,
      change: 0,
      format: 'currency',
      icon: 'dollar',
    },
    {
      key: 'totalRevenue',
      label: 'Total Revenue',
      value: data?.summary.totalRevenue ?? 0,
      change: 0,
      format: 'currency',
      icon: 'dollar',
    },
    {
      key: 'platformEarnings',
      label: 'Platform Earnings',
      value: data?.summary.platformEarnings ?? 0,
      change: 0,
      format: 'currency',
      icon: 'dollar',
    },
  ]

  const trend: ChartPoint[] = (data?.trend ?? []).map((point) => ({
    label: point.label,
    value: point.revenue,
  }))

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">
        {kpis.map((k) => (
          <KpiCard key={k.key} metric={k} />
        ))}
      </div>
      <ChartCard title="Revenue Trend" subtitle="Daily revenue">
        {isLoading ? (
          <div className="flex h-full items-center justify-center text-sm text-alygo-text-muted">
            Loading trend...
          </div>
        ) : (
          <RevenueTrendChart data={trend} />
        )}
      </ChartCard>
    </div>
  )
}

export function FinancePayoutsPanel() {
  const adminActions = useAdminActions()
  const [page, setPage] = useState(1)
  const [limit, setLimit] = useState(10)
  const [searchTerm, setSearchTerm] = useState('')

  const { data, isLoading, isFetching } = useGetFinancialPayoutsQuery({
    page,
    limit,
    searchTerm,
  })

  const rows = data?.data ?? []
  const meta = data?.meta

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <SearchingInput
          value={searchTerm}
          onChange={(value) => {
            setSearchTerm(value)
            setPage(1)
          }}
          placeholder="Search payouts..."
        />
        <Button
          type="primary"
          icon={<CreditCard className="h-4 w-4" />}
          onClick={() => adminActions.notify('Payout batch queued')}
        >
          Process Payouts
        </Button>
      </div>
      <Table
        loading={isLoading || isFetching}
        rowKey="payoutId"
        dataSource={rows}
        pagination={false}
        scroll={{ x: 800 }}
        {...createTableRowProps<FinancePayoutItem>((record) =>
          openTransactionDetails(
            {
              id: record.payoutId,
              driver: record.driver?.name,
              amount: record.amount,
              status: record.status,
              date: record.date,
            },
            adminActions,
          ),
        )}
        columns={[
          { title: 'Payout ID', dataIndex: 'payoutId' },
          {
            title: 'Driver',
            render: (_: unknown, record: FinancePayoutItem) => record.driver?.name ?? '—',
          },
          {
            title: 'Amount',
            dataIndex: 'amount',
            render: (a: number) => formatCurrency(a),
          },
          {
            title: 'Status',
            dataIndex: 'status',
            render: (s: string) => <StatusBadge status={s} />,
          },
          {
            title: 'Date',
            dataIndex: 'date',
            render: (d: string) => formatDateTime(d),
          },
          createActionsColumn<FinancePayoutItem>(
            () => getFinanceActionItems(),
            (key, record) =>
              handleFinanceAction(
                key,
                {
                  id: record.payoutId,
                  driver: record.driver?.name,
                  amount: record.amount,
                  status: record.status,
                  date: record.date,
                },
                adminActions,
              ),
          ),
        ]}
      />
      <Pagination
        currentPage={meta?.page ?? page}
        totalPages={Math.max(meta?.totalPages ?? 1, 1)}
        totalItems={meta?.totalItems ?? 0}
        itemsPerPage={meta?.limit ?? limit}
        onPageChange={setPage}
        onItemsPerPageChange={(size) => {
          setLimit(size)
          setPage(1)
        }}
      />
      <AdminActionHost actions={adminActions} />
    </div>
  )
}

export function FinanceWalletsPanel() {
  const { data, isLoading } = useGetFinancialWalletsSummaryQuery()

  if (isLoading || !data) {
    return (
      <div className="glass-card p-6 text-center text-sm text-alygo-text-muted">
        Loading wallets...
      </div>
    )
  }

  return (
    <div className="space-y-4">
      <p className="text-sm text-alygo-text-muted">
        Passenger and driver wallet balances across the platform.
      </p>
      <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
        <div className="glass-card p-5">
          <p className="text-sm text-alygo-text-muted">Total Wallet Balance</p>
          <p className="mt-2 text-3xl font-semibold text-white">
            {formatCurrency(data.totalWalletBalance)}
          </p>
        </div>
        <div className="glass-card p-5">
          <p className="text-sm text-alygo-text-muted">Active Wallets</p>
          <p className="mt-2 text-3xl font-semibold text-white">
            {formatNumber(data.activeWallets)}
          </p>
        </div>
        <div className="glass-card p-5">
          <p className="text-sm text-alygo-text-muted">Pending Top-ups</p>
          <p className="mt-2 text-3xl font-semibold text-white">
            {formatCurrency(data.pendingTopUps)}
          </p>
        </div>
      </div>
    </div>
  )
}

export function FinanceTransactionsPanel() {
  const adminActions = useAdminActions()
  const [page, setPage] = useState(1)
  const [limit, setLimit] = useState(10)
  const [searchTerm, setSearchTerm] = useState('')

  const { data, isLoading, isFetching } = useGetFinancialTransactionsQuery({
    page,
    limit,
    searchTerm,
  })

  const rows = data?.data ?? []
  const meta = data?.meta

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <SearchingInput
          value={searchTerm}
          onChange={(value) => {
            setSearchTerm(value)
            setPage(1)
          }}
          placeholder="Search transactions..."
        />
        <p className="text-sm text-alygo-text-muted">
          Platform transactions including trips, payouts, and refunds.
        </p>
      </div>
      <Table
        loading={isLoading || isFetching}
        rowKey="transactionId"
        dataSource={rows}
        pagination={false}
        scroll={{ x: 900 }}
        {...createTableRowProps<FinanceTransactionItem>((record) =>
          openTransactionDetails(
            {
              id: record.transactionId,
              type: record.type,
              amount: record.amount,
              fee: record.platformFee,
              status: record.status,
              createdAt: record.createdAt,
            },
            adminActions,
          ),
        )}
        columns={[
          { title: 'Transaction ID', dataIndex: 'transactionId' },
          { title: 'Type', dataIndex: 'type' },
          {
            title: 'Amount',
            dataIndex: 'amount',
            render: (a: number) => formatCurrency(Math.abs(a)),
          },
          {
            title: 'Platform Fee',
            dataIndex: 'platformFee',
            render: (f: number) => formatCurrency(f),
          },
          {
            title: 'Status',
            dataIndex: 'status',
            render: (s: string) => <StatusBadge status={s} />,
          },
          {
            title: 'Created',
            dataIndex: 'createdAt',
            render: (d: string) => formatDateTime(d),
          },
          createActionsColumn<FinanceTransactionItem>(
            () => getFinanceActionItems(),
            (key, record) =>
              handleFinanceAction(
                key,
                {
                  id: record.transactionId,
                  type: record.type,
                  amount: record.amount,
                  fee: record.platformFee,
                  status: record.status,
                },
                adminActions,
              ),
          ),
        ]}
      />
      <Pagination
        currentPage={meta?.page ?? page}
        totalPages={Math.max(meta?.totalPages ?? 1, 1)}
        totalItems={meta?.totalItems ?? 0}
        itemsPerPage={meta?.limit ?? limit}
        onPageChange={setPage}
        onItemsPerPageChange={(size) => {
          setLimit(size)
          setPage(1)
        }}
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
        <Button
          icon={<Download className="h-4 w-4" />}
          onClick={() => adminActions.notify('Financial report exported as CSV')}
        >
          Export CSV
        </Button>
        <Button
          icon={<Download className="h-4 w-4" />}
          onClick={() => adminActions.notify('Financial report exported as PDF')}
        >
          Export PDF
        </Button>
        <Button
          type="primary"
          icon={<Download className="h-4 w-4" />}
          onClick={() => adminActions.notify('Financial report exported as Excel')}
        >
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
