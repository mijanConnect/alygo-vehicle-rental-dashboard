import type {
  BackgroundCheckFeeAuditLog,
  BackgroundCheckFeeConfig,
  BackgroundCheckFeeOverview,
  BackgroundCheckPaymentRules,
} from '@/types/backgroundCheckFee'

export let mockBackgroundCheckFees: BackgroundCheckFeeConfig[] = [
  {
    id: 'bcf-1',
    feeName: 'Standard Background Check',
    amount: 35,
    state: 'California',
    category: 'standard',
    refundable: true,
    status: 'active',
  },
  {
    id: 'bcf-2',
    feeName: 'Premium Background Check',
    amount: 55,
    state: 'California',
    category: 'premium',
    refundable: true,
    status: 'active',
  },
  {
    id: 'bcf-3',
    feeName: 'Standard Background Check',
    amount: 32,
    state: 'New York',
    category: 'standard',
    refundable: true,
    status: 'active',
  },
  {
    id: 'bcf-4',
    feeName: 'Commercial Driver Check',
    amount: 75,
    state: 'Texas',
    category: 'commercial',
    refundable: false,
    status: 'active',
  },
  {
    id: 'bcf-5',
    feeName: 'Annual Renewal Check',
    amount: 25,
    state: 'Florida',
    category: 'renewal',
    refundable: true,
    status: 'inactive',
  },
]

export let mockBackgroundCheckPaymentRules: BackgroundCheckPaymentRules = {
  defaultPaymentMode: 'driver_pays',
  driverPaysEnabled: true,
  companyPaysEnabled: true,
  splitPaymentEnabled: true,
  driverPaysPercent: 60,
  companyPaysPercent: 40,
  automaticRefundEnabled: true,
  refundOnRejection: true,
  refundOnWithdrawal: true,
  refundOnDuplicateCharge: true,
  partialRefundOnAppeal: false,
  refundProcessingDays: 5,
}

export let mockBackgroundCheckFeeAuditLogs: BackgroundCheckFeeAuditLog[] = [
  {
    id: 'bca-1',
    entityType: 'fee_config',
    entityName: 'Standard Background Check (CA)',
    field: 'Amount',
    previousValue: '$30.00',
    newValue: '$35.00',
    changedBy: 'Compliance Admin',
    timestamp: '2026-06-10T14:22:00Z',
  },
  {
    id: 'bca-2',
    entityType: 'payment_rules',
    entityName: 'Payment Rules',
    field: 'Default Payment Mode',
    previousValue: 'Company Pays',
    newValue: 'Driver Pays',
    changedBy: 'Super Admin',
    timestamp: '2026-06-08T09:15:00Z',
  },
  {
    id: 'bca-3',
    entityType: 'fee_config',
    entityName: 'Annual Renewal Check (FL)',
    field: 'Status',
    previousValue: 'Active',
    newValue: 'Inactive',
    changedBy: 'Compliance Admin',
    timestamp: '2026-06-05T16:40:00Z',
  },
  {
    id: 'bca-4',
    entityType: 'payment_rules',
    entityName: 'Payment Rules',
    field: 'Automatic Refund',
    previousValue: 'Disabled',
    newValue: 'Enabled',
    changedBy: 'Finance Admin',
    timestamp: '2026-06-03T11:00:00Z',
  },
]

export function computeBackgroundCheckFeeOverview(): BackgroundCheckFeeOverview {
  return {
    totalFeesCollected: 284750,
    pendingPayments: 142,
    failedPayments: 28,
    refundRequests: 19,
  }
}

export const CATEGORY_LABELS: Record<string, string> = {
  standard: 'Standard',
  premium: 'Premium',
  commercial: 'Commercial',
  renewal: 'Renewal',
}

export const PAYMENT_MODE_LABELS: Record<string, string> = {
  driver_pays: 'Driver Pays',
  company_pays: 'Company Pays',
  split_payment: 'Split Payment',
}

export function appendFeeAuditLog(
  entityName: string,
  field: string,
  previousValue: string,
  newValue: string,
  changedBy = 'Admin',
) {
  mockBackgroundCheckFeeAuditLogs.unshift({
    id: `bca-${Date.now()}`,
    entityType: 'fee_config',
    entityName,
    field,
    previousValue,
    newValue,
    changedBy,
    timestamp: new Date().toISOString(),
  })
}

export function appendPaymentRulesAuditLog(
  field: string,
  previousValue: string,
  newValue: string,
  changedBy = 'Admin',
) {
  mockBackgroundCheckFeeAuditLogs.unshift({
    id: `bca-${Date.now()}`,
    entityType: 'payment_rules',
    entityName: 'Payment Rules',
    field,
    previousValue,
    newValue,
    changedBy,
    timestamp: new Date().toISOString(),
  })
}

export function logFeeConfigChanges(
  fee: BackgroundCheckFeeConfig,
  before: BackgroundCheckFeeConfig,
  updates: Partial<BackgroundCheckFeeConfig>,
  changedBy = 'Admin',
) {
  const entityName = `${fee.feeName} (${fee.state})`
  const formatVal = (key: keyof BackgroundCheckFeeConfig, val: unknown) => {
    if (key === 'amount') return `$${Number(val).toFixed(2)}`
    if (key === 'refundable') return val ? 'Yes' : 'No'
    if (key === 'category') return CATEGORY_LABELS[String(val)] ?? String(val)
    if (key === 'status') return String(val) === 'active' ? 'Active' : 'Inactive'
    return String(val)
  }

  for (const key of Object.keys(updates) as (keyof BackgroundCheckFeeConfig)[]) {
    if (key === 'id') continue
    const prev = before[key]
    const next = fee[key]
    if (prev !== next) {
      appendFeeAuditLog(entityName, key.replace(/([A-Z])/g, ' $1').replace(/^./, (s) => s.toUpperCase()), formatVal(key, prev), formatVal(key, next), changedBy)
    }
  }
}

export function logPaymentRulesChanges(
  before: BackgroundCheckPaymentRules,
  after: BackgroundCheckPaymentRules,
  changedBy = 'Admin',
) {
  const formatVal = (key: keyof BackgroundCheckPaymentRules, val: unknown) => {
    if (key === 'defaultPaymentMode') return PAYMENT_MODE_LABELS[String(val)] ?? String(val)
    if (typeof val === 'boolean') return val ? 'Enabled' : 'Disabled'
    if (key === 'driverPaysPercent' || key === 'companyPaysPercent') return `${val}%`
    if (key === 'refundProcessingDays') return `${val} days`
    return String(val)
  }

  for (const key of Object.keys(after) as (keyof BackgroundCheckPaymentRules)[]) {
    if (before[key] !== after[key]) {
      appendPaymentRulesAuditLog(
        key.replace(/([A-Z])/g, ' $1').replace(/^./, (s) => s.toUpperCase()),
        formatVal(key, before[key]),
        formatVal(key, after[key]),
        changedBy,
      )
    }
  }
}

export const STATE_OPTIONS = [
  { value: 'California', label: 'California' },
  { value: 'New York', label: 'New York' },
  { value: 'Texas', label: 'Texas' },
  { value: 'Florida', label: 'Florida' },
  { value: 'Washington', label: 'Washington' },
  { value: 'Illinois', label: 'Illinois' },
]

export const CATEGORY_OPTIONS = [
  { value: 'standard', label: 'Standard' },
  { value: 'premium', label: 'Premium' },
  { value: 'commercial', label: 'Commercial' },
  { value: 'renewal', label: 'Renewal' },
]
