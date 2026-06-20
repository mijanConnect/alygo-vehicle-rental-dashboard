export const FINANCE_TAB_KEYS = ['revenue', 'payouts', 'wallets', 'transactions'] as const

export type FinanceTabKey = (typeof FINANCE_TAB_KEYS)[number]

export const FINANCE_TAB_LABELS: Record<FinanceTabKey, string> = {
  revenue: 'Revenue',
  payouts: 'Payouts',
  wallets: 'Wallets',
  transactions: 'Transactions',
}

export const DEFAULT_FINANCE_TAB: FinanceTabKey = 'revenue'

export function financeTabPath(tab: FinanceTabKey) {
  return `/finance?tab=${tab}`
}

export const LEGACY_FINANCE_PATHS: Record<string, FinanceTabKey | 'revenue'> = {
  '/finance/revenue': 'revenue',
  '/finance/payouts': 'payouts',
  '/finance/wallets': 'wallets',
  '/finance/transactions': 'transactions',
}
