import { baseApi } from '@/redux/baseApi'
import type {
  BackgroundCheckFeeAuditLog,
  BackgroundCheckFeeConfig,
  BackgroundCheckFeeOverview,
  BackgroundCheckPaymentRules,
} from '@/types/backgroundCheckFee'
import { cleanObject } from '@/utils/cleanObject'

export const backgroundCheckFeeApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getBackgroundCheckFeeOverview: builder.query<BackgroundCheckFeeOverview, void>({
      queryFn: () => {
        return {
          data: {
            totalFeesCollected: 284750,
            pendingPayments: 142,
            failedPayments: 28,
            refundRequests: 19,
          },
        }
      },
    }),

    getBackgroundCheckFees: builder.query<
      { data: BackgroundCheckFeeConfig[]; total: number; page: number; pageSize: number },
      { page?: number; pageSize?: number; search?: string } | void
    >({
      query: (params) => ({
        url: '/compliance-center/fees',
        method: 'GET',
        params: cleanObject({
          page: params?.page ?? 1,
          limit: params?.pageSize ?? 10,
          search: params?.search?.trim() || undefined,
        }),
      }),
      transformResponse: (response: any) => {
        const mapped = (response.data ?? []).map((item: any) => {
          const serviceArea = item.serviceAreaId
          const cityName = typeof serviceArea === 'object' ? (serviceArea?.city || serviceArea?.state || serviceArea?.country || item.applicableState || '—') : (item.applicableState || '—')
          return {
            id: item._id ?? item.id,
            feeName: item.feeName,
            amount: item.amount,
            serviceAreaId: typeof serviceArea === 'object' ? serviceArea?._id : serviceArea,
            cityName,
            description: item.description,
            status: item.status,
          }
        })
        return {
          data: mapped,
          total: response.meta?.total ?? mapped.length,
          page: response.meta?.page ?? 1,
          pageSize: response.meta?.limit ?? 10,
        }
      },
      providesTags: ['Compliance'],
    }),

    createBackgroundCheckFee: builder.mutation<
      BackgroundCheckFeeConfig,
      any
    >({
      query: (values) => ({
        url: '/compliance-center/fees',
        method: 'POST',
        body: {
          feeName: values.feeName,
          amount: values.amount,
          serviceAreaId: values.serviceAreaId,
          description: values.description,
        },
      }),
      invalidatesTags: ['Compliance'],
    }),

    updateBackgroundCheckFee: builder.mutation<
      BackgroundCheckFeeConfig,
      { id: string; status?: 'active' | 'inactive'; feeName?: string; amount?: number; serviceAreaId?: string; description?: string }
    >({
      query: ({ id, ...updates }) => {
        const keys = Object.keys(updates)
        if (keys.length === 1 && keys[0] === 'status') {
          return {
            url: `/compliance-center/fees/status/${id}`,
            method: 'PATCH',
            body: { status: updates.status },
          }
        }
        return {
          url: `/compliance-center/fees/${id}`,
          method: 'PATCH',
          body: {
            feeName: updates.feeName,
            amount: updates.amount,
            serviceAreaId: updates.serviceAreaId,
            description: updates.description,
          },
        }
      },
      invalidatesTags: ['Compliance'],
    }),

    getBackgroundCheckPaymentRules: builder.query<BackgroundCheckPaymentRules, void>({
      queryFn: () => ({
        data: {
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
        },
      }),
    }),

    updateBackgroundCheckPaymentRules: builder.mutation<BackgroundCheckPaymentRules, any>({
      queryFn: () => ({
        data: {
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
        },
      }),
    }),

    getBackgroundCheckFeeAuditLogs: builder.query<BackgroundCheckFeeAuditLog[], void>({
      queryFn: () => ({ data: [] }),
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
