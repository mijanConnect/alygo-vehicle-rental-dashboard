import { createApi, fakeBaseQuery } from '@reduxjs/toolkit/query/react'
import type {
  OperationsPolicyCategory,
  OperationsPolicyOverview,
  OperationsPolicyRule,
} from '@/types/operationsPolicy'
import {
  computeOperationsPolicyOverview,
  mockOperationsPolicies,
} from '@/services/mock/operationsPolicyData'

const delay = (ms = 300) => new Promise((resolve) => setTimeout(resolve, ms))

export const CATEGORY_LABELS: Record<OperationsPolicyCategory, string> = {
  fare_adjustment: 'Fare Adjustment Rules',
  refund: 'Refund Rules',
  driver_penalty: 'Driver Penalty Rules',
}

export const operationsPolicyApi = createApi({
  reducerPath: 'operationsPolicyApi',
  baseQuery: fakeBaseQuery(),
  tagTypes: ['OperationsPolicies', 'OperationsPolicyOverview'],
  endpoints: (builder) => ({
    getOperationsPolicyOverview: builder.query<OperationsPolicyOverview, void>({
      queryFn: async () => {
        await delay()
        return { data: computeOperationsPolicyOverview() }
      },
      providesTags: ['OperationsPolicyOverview'],
    }),
    getOperationsPolicies: builder.query<OperationsPolicyRule[], OperationsPolicyCategory | void>({
      queryFn: async (category) => {
        await delay()
        const data = category
          ? mockOperationsPolicies.filter((p) => p.category === category)
          : [...mockOperationsPolicies]
        return { data }
      },
      providesTags: ['OperationsPolicies'],
    }),
    updateOperationsPolicy: builder.mutation<OperationsPolicyRule, Partial<OperationsPolicyRule> & { id: string }>({
      queryFn: async ({ id, ...updates }) => {
        await delay()
        const index = mockOperationsPolicies.findIndex((p) => p.id === id)
        if (index === -1) return { error: { status: 404, data: 'Policy not found' } }
        mockOperationsPolicies[index] = {
          ...mockOperationsPolicies[index],
          ...updates,
          lastUpdated: new Date().toISOString(),
          updatedBy: 'Admin',
        }
        return { data: mockOperationsPolicies[index] }
      },
      invalidatesTags: ['OperationsPolicies', 'OperationsPolicyOverview'],
    }),
    createOperationsPolicy: builder.mutation<OperationsPolicyRule, Omit<OperationsPolicyRule, 'id' | 'lastUpdated' | 'updatedBy'>>({
      queryFn: async (body) => {
        await delay()
        const policy: OperationsPolicyRule = {
          ...body,
          id: `op-${Date.now()}`,
          lastUpdated: new Date().toISOString(),
          updatedBy: 'Admin',
        }
        mockOperationsPolicies.push(policy)
        return { data: policy }
      },
      invalidatesTags: ['OperationsPolicies', 'OperationsPolicyOverview'],
    }),
    deleteOperationsPolicy: builder.mutation<void, string>({
      queryFn: async (id) => {
        await delay()
        const index = mockOperationsPolicies.findIndex((p) => p.id === id)
        if (index === -1) return { error: { status: 404, data: 'Policy not found' } }
        mockOperationsPolicies.splice(index, 1)
        return { data: undefined }
      },
      invalidatesTags: ['OperationsPolicies', 'OperationsPolicyOverview'],
    }),
  }),
})

export const {
  useGetOperationsPolicyOverviewQuery,
  useGetOperationsPoliciesQuery,
  useUpdateOperationsPolicyMutation,
  useCreateOperationsPolicyMutation,
  useDeleteOperationsPolicyMutation,
} = operationsPolicyApi
