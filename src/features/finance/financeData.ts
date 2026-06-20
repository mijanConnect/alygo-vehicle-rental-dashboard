/** Single source of truth for finance module mock data. */

export interface FinancePayout {
  driver: string
  amount: number
  status: 'Processed' | 'Pending'
  date: string
}

export interface FinanceTransaction {
  id: string
  type: string
  amount: number
  fee: number
  status: string
}

export const WALLET_SUMMARY = {
  totalBalance: 284_000,
  activeWallets: 12_847,
  pendingTopUps: 12_400,
}

export const MOCK_PAYOUTS: FinancePayout[] = [
  { driver: 'Marcus Johnson', amount: 842, status: 'Processed', date: '2026-06-12' },
  { driver: 'Sarah Chen', amount: 1240, status: 'Pending', date: '2026-06-13' },
  { driver: 'David Kim', amount: 620, status: 'Processed', date: '2026-06-11' },
  { driver: 'Lisa Martinez', amount: 1580, status: 'Pending', date: '2026-06-13' },
]

export const MOCK_TRANSACTIONS: FinanceTransaction[] = [
  { id: 'TX-001', type: 'Trip Payment', amount: 42.5, fee: 8.5, status: 'Completed' },
  { id: 'TX-002', type: 'Driver Payout', amount: -842, fee: 0, status: 'Processed' },
  { id: 'TX-003', type: 'Refund', amount: -18, fee: 0, status: 'Completed' },
  { id: 'TX-004', type: 'Trip Payment', amount: 56, fee: 11.2, status: 'Completed' },
  { id: 'TX-005', type: 'Wallet Top-Up', amount: 50, fee: 0, status: 'Pending' },
]

export function computeFinanceOverview(revenueToday: number, revenueMonth: number) {
  const pendingPayouts = MOCK_PAYOUTS.filter((p) => p.status === 'Pending')
  const completedPayouts = MOCK_PAYOUTS.filter((p) => p.status === 'Processed')
  const refundVolume = MOCK_TRANSACTIONS.filter((t) => t.type === 'Refund')
    .reduce((sum, t) => sum + Math.abs(t.amount), 0)
  const platformCommission = MOCK_TRANSACTIONS.reduce((sum, t) => sum + t.fee, 0)

  return {
    revenueToday,
    revenueThisWeek: Math.round(revenueToday * 6.2),
    revenueThisMonth: revenueMonth,
    pendingDriverPayouts: pendingPayouts.reduce((sum, p) => sum + p.amount, 0),
    pendingPayoutCount: pendingPayouts.length,
    completedPayouts: completedPayouts.reduce((sum, p) => sum + p.amount, 0),
    completedPayoutCount: completedPayouts.length,
    totalWalletBalance: WALLET_SUMMARY.totalBalance,
    pendingTopUps: WALLET_SUMMARY.pendingTopUps,
    refundVolume,
    platformCommission,
  }
}
