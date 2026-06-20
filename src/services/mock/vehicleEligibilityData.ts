import { mockRideCategories } from '@/services/mock/rideCategoryData'
import type {
  CategoryAssignmentMapping,
  CategoryEligibilityRule,
  CategoryMappingListParams,
  CategoryMappingStatus,
  PremiumVehicleApproval,
  VehicleEligibilityListParams,
  VehicleEligibilityListResponse,
  VehicleEligibilityStatus,
} from '@/types/vehicleEligibility'

function defaultMinYear(slug: string): number {
  if (slug === 'black' || slug === 'black_suv') return 2019
  if (slug === 'comfort' || slug === 'priority') return 2018
  if (slug === 'xl') return 2017
  return 2015
}

export const mockCategoryEligibilityRules: CategoryEligibilityRule[] = mockRideCategories.map((rc) => ({
  id: `CER-${rc.id}`,
  categoryId: rc.id,
  categoryName: rc.name,
  minVehicleYear: defaultMinYear(rc.slug),
  minDriverRating: rc.minDriverRating,
  commercialInsuranceRequired: rc.slug === 'black' || rc.slug === 'black_suv',
  status: rc.status === 'enabled' ? 'enabled' : 'disabled',
}))

export const mockPremiumVehicleApprovals: PremiumVehicleApproval[] = [
  {
    id: 'PV-1',
    make: 'Mercedes-Benz',
    model: 'E-Class',
    yearRequirement: 2019,
    assignedCategoryIds: ['RC-6', 'RC-7'],
    assignedCategoryNames: ['Black', 'Black SUV'],
    status: 'enabled',
  },
  {
    id: 'PV-2',
    make: 'BMW',
    model: '5 Series',
    yearRequirement: 2019,
    assignedCategoryIds: ['RC-6'],
    assignedCategoryNames: ['Black'],
    status: 'enabled',
  },
  {
    id: 'PV-3',
    make: 'Cadillac',
    model: 'Escalade',
    yearRequirement: 2020,
    assignedCategoryIds: ['RC-7'],
    assignedCategoryNames: ['Black SUV'],
    status: 'enabled',
  },
  {
    id: 'PV-4',
    make: 'Tesla',
    model: 'Model S',
    yearRequirement: 2018,
    assignedCategoryIds: ['RC-6', 'RC-2'],
    assignedCategoryNames: ['Black', 'Comfort'],
    status: 'enabled',
  },
]

export const mockCategoryAssignmentMappings: CategoryAssignmentMapping[] = [
  { id: 'CM-1', vehicleType: 'Sedan', rideCategoryId: 'RC-1', rideCategoryName: 'Standard', status: 'active' },
  { id: 'CM-2', vehicleType: 'SUV', rideCategoryId: 'RC-3', rideCategoryName: 'XL', status: 'active' },
  { id: 'CM-3', vehicleType: 'Luxury Sedan', rideCategoryId: 'RC-6', rideCategoryName: 'Black', status: 'active' },
  { id: 'CM-4', vehicleType: 'Luxury SUV', rideCategoryId: 'RC-7', rideCategoryName: 'Black SUV', status: 'active' },
  { id: 'CM-5', vehicleType: 'Minivan', rideCategoryId: 'RC-3', rideCategoryName: 'XL', status: 'active' },
  { id: 'CM-6', vehicleType: 'Compact', rideCategoryId: 'RC-1', rideCategoryName: 'Standard', status: 'active' },
]

export const VEHICLE_TYPE_OPTIONS = [
  { label: 'Sedan', value: 'Sedan' },
  { label: 'SUV', value: 'SUV' },
  { label: 'Luxury Sedan', value: 'Luxury Sedan' },
  { label: 'Luxury SUV', value: 'Luxury SUV' },
  { label: 'Minivan', value: 'Minivan' },
  { label: 'Compact', value: 'Compact' },
  { label: 'Hatchback', value: 'Hatchback' },
  { label: 'Pickup Truck', value: 'Pickup Truck' },
  { label: 'Van', value: 'Van' },
]

export const CATEGORY_MAPPING_STATUS_OPTIONS = [
  { label: 'Active', value: 'active' as CategoryMappingStatus },
  { label: 'Inactive', value: 'inactive' as CategoryMappingStatus },
]

export function resolveCategoryNames(categoryIds: string[]): string[] {
  return categoryIds
    .map((id) => mockRideCategories.find((c) => c.id === id)?.name)
    .filter((name): name is string => Boolean(name))
}

export function resolveCategoryName(categoryId: string): string {
  return mockRideCategories.find((c) => c.id === categoryId)?.name ?? 'Unknown'
}

export function paginateList<T>(
  items: T[],
  params: VehicleEligibilityListParams,
  searchFields: (keyof T)[],
): VehicleEligibilityListResponse<T> {
  const page = params.page ?? 1
  const pageSize = params.pageSize ?? 10
  const search = (params.search ?? '').trim().toLowerCase()
  const status = params.status

  let filtered = [...items]

  if (search) {
    filtered = filtered.filter((item) =>
      searchFields.some((field) => {
        const val = item[field]
        if (Array.isArray(val)) return val.join(', ').toLowerCase().includes(search)
        return String(val ?? '').toLowerCase().includes(search)
      }),
    )
  }

  if (status) {
    filtered = filtered.filter((item) => {
      if (typeof item !== 'object' || item === null || !('status' in item)) return false
      return (item as { status: string }).status === status
    })
  }

  const start = (page - 1) * pageSize
  return {
    data: filtered.slice(start, start + pageSize),
    total: filtered.length,
    page,
    pageSize,
  }
}

export function paginateMappingList(
  items: CategoryAssignmentMapping[],
  params: CategoryMappingListParams,
): VehicleEligibilityListResponse<CategoryAssignmentMapping> {
  const page = params.page ?? 1
  const pageSize = params.pageSize ?? 10
  const search = (params.search ?? '').trim().toLowerCase()
  const status = params.status

  let filtered = [...items]

  if (search) {
    filtered = filtered.filter(
      (item) =>
        item.vehicleType.toLowerCase().includes(search) ||
        item.rideCategoryName.toLowerCase().includes(search),
    )
  }

  if (status) {
    filtered = filtered.filter((item) => item.status === status)
  }

  const start = (page - 1) * pageSize
  return {
    data: filtered.slice(start, start + pageSize),
    total: filtered.length,
    page,
    pageSize,
  }
}

export const VEHICLE_ELIGIBILITY_STATUS_OPTIONS = [
  { label: 'Enabled', value: 'enabled' as VehicleEligibilityStatus },
  { label: 'Disabled', value: 'disabled' as VehicleEligibilityStatus },
]
