import { createApi, fakeBaseQuery } from '@reduxjs/toolkit/query/react'
import {
  mockCategoryAssignmentMappings,
  mockCategoryEligibilityRules,
  mockPremiumVehicleApprovals,
  paginateList,
  paginateMappingList,
  resolveCategoryName,
  resolveCategoryNames,
} from '@/services/mock/vehicleEligibilityData'
import type {
  CategoryAssignmentMapping,
  CategoryEligibilityRule,
  CategoryEligibilityRuleFormValues,
  CategoryMappingFormValues,
  CategoryMappingListParams,
  PremiumVehicleApproval,
  PremiumVehicleFormValues,
  VehicleEligibilityListParams,
  VehicleEligibilityListResponse,
} from '@/types/vehicleEligibility'

const delay = (ms = 300) => new Promise((resolve) => setTimeout(resolve, ms))

export const vehicleEligibilityApi = createApi({
  reducerPath: 'vehicleEligibilityApi',
  baseQuery: fakeBaseQuery(),
  tagTypes: ['CategoryEligibilityRules', 'PremiumVehicles', 'CategoryMappings'],
  endpoints: (builder) => ({
    getCategoryEligibilityRules: builder.query<
      VehicleEligibilityListResponse<CategoryEligibilityRule>,
      VehicleEligibilityListParams | void
    >({
      queryFn: async (params) => {
        await delay()
        return {
          data: paginateList(mockCategoryEligibilityRules, params ?? {}, [
            'categoryName',
            'minVehicleYear',
            'minDriverRating',
          ]),
        }
      },
      providesTags: ['CategoryEligibilityRules'],
    }),
    updateCategoryEligibilityRule: builder.mutation<
      CategoryEligibilityRule,
      { id: string } & CategoryEligibilityRuleFormValues
    >({
      queryFn: async ({ id, categoryId, ...values }) => {
        await delay()
        const index = mockCategoryEligibilityRules.findIndex((r) => r.id === id)
        if (index === -1) return { error: { status: 404, data: 'Rule not found' } }

        mockCategoryEligibilityRules[index] = {
          ...mockCategoryEligibilityRules[index],
          categoryId,
          categoryName: resolveCategoryName(categoryId),
          ...values,
        }
        return { data: mockCategoryEligibilityRules[index] }
      },
      invalidatesTags: ['CategoryEligibilityRules'],
    }),
    toggleCategoryEligibilityRule: builder.mutation<CategoryEligibilityRule, string>({
      queryFn: async (id) => {
        await delay()
        const index = mockCategoryEligibilityRules.findIndex((r) => r.id === id)
        if (index === -1) return { error: { status: 404, data: 'Rule not found' } }

        mockCategoryEligibilityRules[index] = {
          ...mockCategoryEligibilityRules[index],
          status:
            mockCategoryEligibilityRules[index].status === 'enabled' ? 'disabled' : 'enabled',
        }
        return { data: mockCategoryEligibilityRules[index] }
      },
      invalidatesTags: ['CategoryEligibilityRules'],
    }),
    getPremiumVehicleApprovals: builder.query<
      VehicleEligibilityListResponse<PremiumVehicleApproval>,
      VehicleEligibilityListParams | void
    >({
      queryFn: async (params) => {
        await delay()
        return {
          data: paginateList(mockPremiumVehicleApprovals, params ?? {}, [
            'make',
            'model',
            'yearRequirement',
            'assignedCategoryNames',
          ]),
        }
      },
      providesTags: ['PremiumVehicles'],
    }),
    createPremiumVehicle: builder.mutation<PremiumVehicleApproval, PremiumVehicleFormValues>({
      queryFn: async (values) => {
        await delay()
        const vehicle: PremiumVehicleApproval = {
          id: `PV-${Date.now()}`,
          ...values,
          assignedCategoryNames: resolveCategoryNames(values.assignedCategoryIds),
        }
        mockPremiumVehicleApprovals.unshift(vehicle)
        return { data: vehicle }
      },
      invalidatesTags: ['PremiumVehicles'],
    }),
    updatePremiumVehicle: builder.mutation<
      PremiumVehicleApproval,
      { id: string } & PremiumVehicleFormValues
    >({
      queryFn: async ({ id, ...values }) => {
        await delay()
        const index = mockPremiumVehicleApprovals.findIndex((v) => v.id === id)
        if (index === -1) return { error: { status: 404, data: 'Vehicle not found' } }

        mockPremiumVehicleApprovals[index] = {
          ...mockPremiumVehicleApprovals[index],
          ...values,
          assignedCategoryNames: resolveCategoryNames(values.assignedCategoryIds),
        }
        return { data: mockPremiumVehicleApprovals[index] }
      },
      invalidatesTags: ['PremiumVehicles'],
    }),
    deletePremiumVehicle: builder.mutation<void, string>({
      queryFn: async (id) => {
        await delay()
        const index = mockPremiumVehicleApprovals.findIndex((v) => v.id === id)
        if (index === -1) return { error: { status: 404, data: 'Vehicle not found' } }
        mockPremiumVehicleApprovals.splice(index, 1)
        return { data: undefined }
      },
      invalidatesTags: ['PremiumVehicles'],
    }),
    getCategoryAssignmentMappings: builder.query<
      VehicleEligibilityListResponse<CategoryAssignmentMapping>,
      CategoryMappingListParams | void
    >({
      queryFn: async (params) => {
        await delay()
        return { data: paginateMappingList(mockCategoryAssignmentMappings, params ?? {}) }
      },
      providesTags: ['CategoryMappings'],
    }),
    createCategoryAssignmentMapping: builder.mutation<
      CategoryAssignmentMapping,
      CategoryMappingFormValues
    >({
      queryFn: async (values) => {
        await delay()
        if (
          mockCategoryAssignmentMappings.some(
            (m) => m.vehicleType.toLowerCase() === values.vehicleType.toLowerCase(),
          )
        ) {
          return { error: { status: 409, data: 'A mapping for this vehicle type already exists.' } }
        }
        const mapping: CategoryAssignmentMapping = {
          id: `CM-${Date.now()}`,
          vehicleType: values.vehicleType,
          rideCategoryId: values.rideCategoryId,
          rideCategoryName: resolveCategoryName(values.rideCategoryId),
          status: values.status,
        }
        mockCategoryAssignmentMappings.unshift(mapping)
        return { data: mapping }
      },
      invalidatesTags: ['CategoryMappings'],
    }),
    updateCategoryAssignmentMapping: builder.mutation<
      CategoryAssignmentMapping,
      { id: string } & CategoryMappingFormValues
    >({
      queryFn: async ({ id, rideCategoryId, ...values }) => {
        await delay()
        const index = mockCategoryAssignmentMappings.findIndex((m) => m.id === id)
        if (index === -1) return { error: { status: 404, data: 'Mapping not found' } }

        if (
          mockCategoryAssignmentMappings.some(
            (m) =>
              m.id !== id && m.vehicleType.toLowerCase() === values.vehicleType.toLowerCase(),
          )
        ) {
          return { error: { status: 409, data: 'A mapping for this vehicle type already exists.' } }
        }

        mockCategoryAssignmentMappings[index] = {
          ...mockCategoryAssignmentMappings[index],
          ...values,
          rideCategoryId,
          rideCategoryName: resolveCategoryName(rideCategoryId),
        }
        return { data: mockCategoryAssignmentMappings[index] }
      },
      invalidatesTags: ['CategoryMappings'],
    }),
    deleteCategoryAssignmentMapping: builder.mutation<void, string>({
      queryFn: async (id) => {
        await delay()
        const index = mockCategoryAssignmentMappings.findIndex((m) => m.id === id)
        if (index === -1) return { error: { status: 404, data: 'Mapping not found' } }
        mockCategoryAssignmentMappings.splice(index, 1)
        return { data: undefined }
      },
      invalidatesTags: ['CategoryMappings'],
    }),
    toggleCategoryAssignmentMapping: builder.mutation<CategoryAssignmentMapping, string>({
      queryFn: async (id) => {
        await delay()
        const index = mockCategoryAssignmentMappings.findIndex((m) => m.id === id)
        if (index === -1) return { error: { status: 404, data: 'Mapping not found' } }

        mockCategoryAssignmentMappings[index] = {
          ...mockCategoryAssignmentMappings[index],
          status:
            mockCategoryAssignmentMappings[index].status === 'active' ? 'inactive' : 'active',
        }
        return { data: mockCategoryAssignmentMappings[index] }
      },
      invalidatesTags: ['CategoryMappings'],
    }),
  }),
})

export const {
  useGetCategoryEligibilityRulesQuery,
  useUpdateCategoryEligibilityRuleMutation,
  useToggleCategoryEligibilityRuleMutation,
  useGetPremiumVehicleApprovalsQuery,
  useCreatePremiumVehicleMutation,
  useUpdatePremiumVehicleMutation,
  useDeletePremiumVehicleMutation,
  useGetCategoryAssignmentMappingsQuery,
  useCreateCategoryAssignmentMappingMutation,
  useUpdateCategoryAssignmentMappingMutation,
  useDeleteCategoryAssignmentMappingMutation,
  useToggleCategoryAssignmentMappingMutation,
} = vehicleEligibilityApi
