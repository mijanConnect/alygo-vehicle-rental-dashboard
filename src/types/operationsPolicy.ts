export type OperationsPolicyCategory = 'fare_adjustment' | 'refund' | 'driver_penalty'

export interface OperationsPolicyRule {
  id: string
  category: OperationsPolicyCategory
  name: string
  description: string
  value: string
  numericValue?: number
  unit?: string
  status: 'active' | 'inactive'
  lastUpdated: string
  updatedBy: string
}

export interface OperationsPolicyOverview {
  totalPolicies: number
  fareAdjustmentRules: number
  refundRules: number
  driverPenaltyRules: number
}
