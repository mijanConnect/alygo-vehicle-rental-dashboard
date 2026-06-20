import { Tabs } from 'antd'
import { useSearchParams } from 'react-router-dom'
import { PageShell } from '@/components/common/PageShell'
import { FinanceOverviewCards } from '@/features/finance/components/FinanceOverviewPanel'
import {
  FinancePayoutsPanel,
  FinanceRevenuePanel,
  FinanceTransactionsPanel,
  FinanceWalletsPanel,
} from '@/features/finance/components/FinanceTabPanels'
import {
  DEFAULT_FINANCE_TAB,
  FINANCE_TAB_KEYS,
  FINANCE_TAB_LABELS,
  type FinanceTabKey,
} from '@/features/finance/financeNavigation'
import { useDocumentTitle } from '@/hooks/useDocumentTitle'

const FINANCE_TABS = [
  { key: 'revenue', label: FINANCE_TAB_LABELS.revenue, children: <FinanceRevenuePanel /> },
  { key: 'payouts', label: FINANCE_TAB_LABELS.payouts, children: <FinancePayoutsPanel /> },
  { key: 'wallets', label: FINANCE_TAB_LABELS.wallets, children: <FinanceWalletsPanel /> },
  { key: 'transactions', label: FINANCE_TAB_LABELS.transactions, children: <FinanceTransactionsPanel /> },
] as const

export default function FinanceDashboardPage() {
  useDocumentTitle('Financial Center')
  const [searchParams, setSearchParams] = useSearchParams()
  const rawTab = searchParams.get('tab')
  const activeTab =
    rawTab === 'overview' || rawTab === 'reports'
      ? DEFAULT_FINANCE_TAB
      : ((rawTab as FinanceTabKey | null) ?? DEFAULT_FINANCE_TAB)
  const validTab = FINANCE_TAB_KEYS.includes(activeTab) ? activeTab : DEFAULT_FINANCE_TAB

  return (
    <PageShell
      title="Financial Center"
      description="Unified financial command center for revenue, driver payouts, wallets, and transactions."
    >
      <FinanceOverviewCards />
      <div className="glass-card p-4">
        <Tabs
          activeKey={validTab}
          onChange={(key) => setSearchParams({ tab: key })}
          items={[...FINANCE_TABS]}
        />
      </div>
    </PageShell>
  )
}
