export interface BackgroundCheckFeeOverview {
  totalFeesCollected: number
  pendingPayments: number
  failedPayments: number
  refundRequests: number
}

export interface BackgroundCheckFeeConfig {
  id: string
  feeName: string
  amount: number
  state: string
  category: BackgroundCheckFeeCategory
  refundable: boolean
  status: 'active' | 'inactive'
}

export type BackgroundCheckFeeCategory = 'standard' | 'premium' | 'commercial' | 'renewal'

export type PaymentResponsible = 'driver_pays' | 'company_pays' | 'split_payment'

export interface BackgroundCheckPaymentRules {
  defaultPaymentMode: PaymentResponsible
  driverPaysEnabled: boolean
  companyPaysEnabled: boolean
  splitPaymentEnabled: boolean
  driverPaysPercent: number
  companyPaysPercent: number
  automaticRefundEnabled: boolean
  refundOnRejection: boolean
  refundOnWithdrawal: boolean
  refundOnDuplicateCharge: boolean
  partialRefundOnAppeal: boolean
  refundProcessingDays: number
}

export interface BackgroundCheckFeeAuditLog {
  id: string
  entityType: 'fee_config' | 'payment_rules'
  entityName: string
  field: string
  previousValue: string
  newValue: string
  changedBy: string
  timestamp: string
}
