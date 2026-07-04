export type RideCategoryStatus = 'enabled' | 'disabled'

export type CancellationPolicyStatus = 'active' | 'inactive'

export interface RideCategoryCancellationRules {
  cancellationFee: number
  noShowFee: number
  waitTimeMinutes: number
  driverCompensation: number
  status: CancellationPolicyStatus
}

export interface RideCategoryDefinition {
  id: string
  name: string
  slug: string
  description: string
  fareMultiplier: number
  minDriverRating: number
  vehicleRequirements: string
  status: RideCategoryStatus
  cancellationRules: RideCategoryCancellationRules
  commissionRate: number
  createdAt: string
}

export interface RideCategoryFormValues {
  name: string
  description: string
  fareMultiplier: number
  minDriverRating: number
  vehicleRequirements: string
  status: RideCategoryStatus
  cancellationRules: RideCategoryCancellationRules
  commissionRate: number
}

export interface RideCategoryListParams {
  page?: number
  pageSize?: number
  search?: string
  status?: RideCategoryStatus | ''
}

export interface RideCategoryListResponse {
  data: RideCategoryDefinition[]
  total: number
  page: number
  pageSize: number
}
