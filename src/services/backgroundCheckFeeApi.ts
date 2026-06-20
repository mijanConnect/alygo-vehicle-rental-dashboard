import { createApi, fakeBaseQuery } from '@reduxjs/toolkit/query/react'
import type {
  BackgroundCheckFeeAuditLog,
  BackgroundCheckFeeConfig,
  BackgroundCheckFeeOverview,
  BackgroundCheckPaymentRules,
} from '@/types/backgroundCheckFee'
import {
  computeBackgroundCheckFeeOverview,
  logFeeConfigChanges,
  logPaymentRulesChanges,
  mockBackgroundCheckFeeAuditLogs,
  mockBackgroundCheckFees,
  mockBackgroundCheckPaymentRules,
} from '@/services/mock/backgroundCheckFeeData'

import type { ComplianceListParams, ComplianceListResponse } from '@/types/complianceCenter'

const delay = (ms = 300) => new Promise((resolve) => setTimeout(resolve, ms))

export const backgroundCheckFeeApi = createApi({
  reducerPath: 'backgroundCheckFeeApi',
  baseQuery: fakeBaseQuery(),
  tagTypes: ['BackgroundCheckFeeOverview', 'BackgroundCheckFees', 'BackgroundCheckPaymentRules', 'BackgroundCheckFeeAuditLogs'],
  endpoints: (builder) => ({
    getBackgroundCheckFeeOverview: builder.query<BackgroundCheckFeeOverview, void>({
      queryFn: async () => {
        await delay()
        return { data: computeBackgroundCheckFeeOverview() }
      },
      providesTags: ['BackgroundCheckFeeOverview'],
    }),
    getBackgroundCheckFees: builder.query<
      ComplianceListResponse<BackgroundCheckFeeConfig>,
      ComplianceListParams | void
    >({
      queryFn: async (params) => {
        await delay()
        const search = (params?.search ?? '').trim().toLowerCase()
        let filtered = [...mockBackgroundCheckFees]
        if (search) {
          filtered = filtered.filter(
            (f) =>
              f.feeName.toLowerCase().includes(search) ||
              f.state.toLowerCase().includes(search),
          )
        }
        const page = params?.page ?? 1
        const pageSize = params?.pageSize ?? 10
        const start = (page - 1) * pageSize
        return {
          data: {
            data: filtered.slice(start, start + pageSize),
            total: filtered.length,
            page,
            pageSize,
          },
        }
      },
      providesTags: ['BackgroundCheckFees'],
    }),
    createBackgroundCheckFee: builder.mutation<
      BackgroundCheckFeeConfig,
      Omit<BackgroundCheckFeeConfig, 'id'>
    >({
      queryFn: async (values) => {
        await delay()
        const fee: BackgroundCheckFeeConfig = { id: `bcf-${Date.now()}`, ...values }
        mockBackgroundCheckFees.unshift(fee)
        return { data: fee }
      },
      invalidatesTags: ['BackgroundCheckFees', 'BackgroundCheckFeeAuditLogs'],
    }),
    updateBackgroundCheckFee: builder.mutation<
      BackgroundCheckFeeConfig,
      Partial<BackgroundCheckFeeConfig> & { id: string; changedBy?: string }
    >({
      queryFn: async ({ id, changedBy = 'Admin', ...updates }) => {
        await delay()
        const index = mockBackgroundCheckFees.findIndex((f) => f.id === id)
        if (index === -1) return { error: { status: 404, data: 'Fee configuration not found' } }
        const before = { ...mockBackgroundCheckFees[index] }
        mockBackgroundCheckFees[index] = { ...mockBackgroundCheckFees[index], ...updates }
        logFeeConfigChanges(mockBackgroundCheckFees[index], before, updates, changedBy)
        return { data: mockBackgroundCheckFees[index] }
      },
      invalidatesTags: ['BackgroundCheckFees', 'BackgroundCheckFeeAuditLogs'],
    }),
    getBackgroundCheckPaymentRules: builder.query<BackgroundCheckPaymentRules, void>({
      queryFn: async () => ({ data: { ...mockBackgroundCheckPaymentRules } }),
      providesTags: ['BackgroundCheckPaymentRules'],
    }),
    updateBackgroundCheckPaymentRules: builder.mutation<
      BackgroundCheckPaymentRules,
      Partial<BackgroundCheckPaymentRules> & { changedBy?: string }
    >({
      queryFn: async ({ changedBy = 'Admin', ...updates }) => {
        await delay()
        const before = { ...mockBackgroundCheckPaymentRules }
        Object.assign(mockBackgroundCheckPaymentRules, updates)
        logPaymentRulesChanges(before, { ...mockBackgroundCheckPaymentRules }, changedBy)
        return { data: { ...mockBackgroundCheckPaymentRules } }
      },
      invalidatesTags: ['BackgroundCheckPaymentRules', 'BackgroundCheckFeeAuditLogs'],
    }),
    getBackgroundCheckFeeAuditLogs: builder.query<BackgroundCheckFeeAuditLog[], void>({
      queryFn: async () => ({ data: [...mockBackgroundCheckFeeAuditLogs] }),
      providesTags: ['BackgroundCheckFeeAuditLogs'],
    }),
  }),
})

export const {
  useGetBackgroundCheckFeeOverviewQuery,
  useGetBackgroundCheckFeesQuery,
  useCreateBackgroundCheckFeeMutation,
  useUpdateBackgroundCheckFeeMutation,
  useGetBackgroundCheckPaymentRulesQuery,
  useUpdateBackgroundCheckPaymentRulesMutation,
  useGetBackgroundCheckFeeAuditLogsQuery,
} = backgroundCheckFeeApi

export { CATEGORY_LABELS, PAYMENT_MODE_LABELS } from '@/services/mock/backgroundCheckFeeData'
