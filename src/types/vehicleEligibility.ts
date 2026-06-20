export type VehicleEligibilityStatus = 'enabled' | 'disabled'

export interface CategoryEligibilityRule {
  id: string
  categoryId: string
  categoryName: string
  minVehicleYear: number
  minDriverRating: number
  commercialInsuranceRequired: boolean
  status: VehicleEligibilityStatus
}

export interface CategoryEligibilityRuleFormValues {
  categoryId: string
  minVehicleYear: number
  minDriverRating: number
  commercialInsuranceRequired: boolean
  status: VehicleEligibilityStatus
}

export interface PremiumVehicleApproval {
  id: string
  make: string
  model: string
  yearRequirement: number
  assignedCategoryIds: string[]
  assignedCategoryNames: string[]
  status: VehicleEligibilityStatus
}

export interface PremiumVehicleFormValues {
  make: string
  model: string
  yearRequirement: number
  assignedCategoryIds: string[]
  status: VehicleEligibilityStatus
}

export type CategoryMappingStatus = 'active' | 'inactive'

export interface CategoryAssignmentMapping {
  id: string
  vehicleType: string
  rideCategoryId: string
  rideCategoryName: string
  status: CategoryMappingStatus
}

export interface CategoryMappingFormValues {
  vehicleType: string
  rideCategoryId: string
  status: CategoryMappingStatus
}

export interface CategoryMappingListParams {
  page?: number
  pageSize?: number
  search?: string
  status?: CategoryMappingStatus | ''
}

export interface VehicleEligibilityListParams {
  page?: number
  pageSize?: number
  search?: string
  status?: VehicleEligibilityStatus | ''
}

export interface VehicleEligibilityListResponse<T> {
  data: T[]
  total: number
  page: number
  pageSize: number
}
