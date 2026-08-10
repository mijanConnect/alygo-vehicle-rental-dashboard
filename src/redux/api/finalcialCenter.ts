import { baseApi } from '@/redux/baseApi'
import { cleanObject } from '@/utils/cleanObject'

interface ApiResponse<T> {
  success: boolean
  message: string
  data: T
}

interface PaginationMeta {
  page: number
  limit: number
  total: number
  totalPage: number
}

interface PaginatedApiResponse<T> {
  success: boolean
  message: string
  data: T[]
  meta?: PaginationMeta
}

export interface RevenueSummaryBlock {
  totalRevenue: number
  platformEarnings: number
  driverPayouts: number
}

export interface RevenuePeriodBlock {
  today: number
  thisMonth: number
}

export interface RevenueTrendPoint {
  date: string
  label: string
  revenue: number
}

export interface RevenueSummaryData {
  summary: RevenueSummaryBlock
  revenue: RevenuePeriodBlock
  trend: RevenueTrendPoint[]
}

export interface FinancePayoutDriver {
  id: string
  name: string
}

export interface FinancePayoutItem {
  payoutId: string
  driver: FinancePayoutDriver
  amount: number
  status: string
  date: string
}

export interface WalletsSummaryData {
  totalWalletBalance: number
  activeWallets: number
  pendingTopUps: number
}

export interface FinanceTransactionItem {
  transactionId: string
  type: string
  amount: number
  platformFee: number
  status: string
  createdAt: string
}

export interface FinanceListQueryParams {
  page?: number
  limit?: number
  searchTerm?: string
  status?: string
}

export interface FinanceListResult<T> {
  data: T[]
  meta: {
    page: number
    limit: number
    totalItems: number
    totalPages: number
  }
}

function mapMeta(meta: PaginationMeta | undefined, count: number) {
  return {
    page: meta?.page ?? 1,
    limit: meta?.limit ?? 10,
    totalItems: meta?.total ?? count,
    totalPages: meta?.totalPage ?? 1,
  }
}

export const financialCenterApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getFinancialRevenueSummary: builder.query<RevenueSummaryData, void>({
      query: () => ({
        url: '/financial-center/revenue',
        method: 'GET',
      }),
      transformResponse: (response: ApiResponse<RevenueSummaryData>) => response.data,
      providesTags: [{ type: 'Finance', id: 'REVENUE' }],
    }),

    getFinancialPayouts: builder.query<
      FinanceListResult<FinancePayoutItem>,
      FinanceListQueryParams | void
    >({
      query: ({ page = 1, limit = 10, searchTerm, status } = {}) => ({
        url: '/financial-center/payouts',
        method: 'GET',
        params: cleanObject({
          page,
          limit,
          searchTerm: searchTerm?.trim(),
          status,
        }),
      }),
      transformResponse: (response: PaginatedApiResponse<FinancePayoutItem>) => ({
        data: response.data ?? [],
        meta: mapMeta(response.meta, response.data?.length ?? 0),
      }),
      providesTags: [{ type: 'Finance', id: 'PAYOUTS' }],
    }),

    getFinancialWalletsSummary: builder.query<WalletsSummaryData, void>({
      query: () => ({
        url: '/financial-center/wallets',
        method: 'GET',
      }),
      transformResponse: (response: ApiResponse<WalletsSummaryData>) => response.data,
      providesTags: [{ type: 'Finance', id: 'WALLETS' }],
    }),

    getFinancialTransactions: builder.query<
      FinanceListResult<FinanceTransactionItem>,
      FinanceListQueryParams | void
    >({
      query: ({ page = 1, limit = 10, searchTerm, status } = {}) => ({
        url: '/financial-center/transactions',
        method: 'GET',
        params: cleanObject({
          page,
          limit,
          searchTerm: searchTerm?.trim(),
          status,
        }),
      }),
      transformResponse: (response: PaginatedApiResponse<FinanceTransactionItem>) => ({
        data: response.data ?? [],
        meta: mapMeta(response.meta, response.data?.length ?? 0),
      }),
      providesTags: [{ type: 'Finance', id: 'TRANSACTIONS' }],
    }),
  }),
})

export const {
  useGetFinancialRevenueSummaryQuery,
  useGetFinancialPayoutsQuery,
  useGetFinancialWalletsSummaryQuery,
  useGetFinancialTransactionsQuery,
} = financialCenterApi
