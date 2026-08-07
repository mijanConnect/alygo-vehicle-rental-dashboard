import { baseApi } from '@/redux/baseApi'
import type { ChartPoint } from '@/types'
import { cleanObject } from '@/utils/cleanObject'

interface ApiResponse<T> {
  success: boolean
  message: string
  data: T
}

export interface LostFoundOverviewSummary {
  totalReports: number
  pendingDriverReview: number
  itemsFound: number
  itemsNotFound: number
  pickupScheduled: number
  deliveryScheduled: number
  completedReturns: number
}

export interface LostFoundPerson {
  _id: string
  name: string
  email: string
  profileImage?: string
  phone: string
}

export interface LostFoundReportApiItem {
  reportId: string
  passenger: LostFoundPerson
  driver: LostFoundPerson
  tripId: string
  itemCategory: string
  itemName: string
  createdDate: string
  status: string
}

export interface LostFoundReportRow {
  id: string
  passengerId: string
  passengerName: string
  passengerEmail: string
  passengerPhone: string
  driverId: string
  driverName: string
  driverEmail: string
  driverPhone: string
  driverRating: number
  tripId: string
  pickup: string
  destination: string
  tripDate: string
  itemCategory: string
  itemName: string
  itemDescription: string
  photos: string[]
  status: string
  createdAt: string
  timeline: []
}

export interface LostFoundReportsMeta {
  page: number
  limit: number
  totalItems: number
  totalPages: number
}

export interface LostFoundReportsResult {
  data: LostFoundReportRow[]
  meta: LostFoundReportsMeta
}

export interface GetLostFoundReportsParams {
  page?: number
  limit?: number
  searchTerm?: string
  status?: string
}

interface LostFoundReportsData {
  items: LostFoundReportApiItem[]
  pagination: {
    page: number
    limit: number
    total: number
    totalPage: number
  }
}

export interface LostFoundReturnApiItem {
  reportId: string
  returnMethod: string
  passenger: LostFoundPerson
  driver: LostFoundPerson
  scheduledDate: string
  returnStatus: string
  fee: number
}

export interface LostFoundReturnRow {
  id: string
  reportId: string
  returnMethod: string
  passengerName: string
  passengerEmail: string
  passengerPhone: string
  driverName: string
  driverEmail: string
  driverPhone: string
  scheduledDate: string
  returnStatus: string
  fee: number
}

export interface LostFoundReturnsResult {
  data: LostFoundReturnRow[]
  meta: LostFoundReportsMeta
}

export type GetLostFoundReturnsParams = GetLostFoundReportsParams

interface LostFoundReturnsData {
  items: LostFoundReturnApiItem[]
  pagination: {
    page: number
    limit: number
    total: number
    totalPage: number
  }
}

function mapReport(item: LostFoundReportApiItem): LostFoundReportRow {
  return {
    id: item.reportId,
    passengerId: item.passenger?._id ?? '',
    passengerName: item.passenger?.name ?? '—',
    passengerEmail: item.passenger?.email ?? '—',
    passengerPhone: item.passenger?.phone ?? '—',
    driverId: item.driver?._id ?? '',
    driverName: item.driver?.name?.trim() || 'Unassigned',
    driverEmail: item.driver?.email ?? '—',
    driverPhone: item.driver?.phone ?? '—',
    driverRating: 0,
    tripId: item.tripId,
    pickup: '—',
    destination: '—',
    tripDate: item.createdDate,
    itemCategory: item.itemCategory,
    itemName: item.itemName,
    itemDescription: '',
    photos: [],
    status: item.status,
    createdAt: item.createdDate,
    timeline: [],
  }
}

function mapReturn(item: LostFoundReturnApiItem): LostFoundReturnRow {
  return {
    id: item.reportId,
    reportId: item.reportId,
    returnMethod: item.returnMethod,
    passengerName: item.passenger?.name ?? '—',
    passengerEmail: item.passenger?.email ?? '—',
    passengerPhone: item.passenger?.phone ?? '—',
    driverName: item.driver?.name?.trim() || 'Unassigned',
    driverEmail: item.driver?.email ?? '—',
    driverPhone: item.driver?.phone ?? '—',
    scheduledDate: item.scheduledDate,
    returnStatus: item.returnStatus,
    fee: item.fee ?? 0,
  }
}

export interface LostFoundDeliveryFeeSettings {
  enabled: boolean
  reportWindowDays: number
  maxFiles: number
  maxFileSizeMb: number
  defaultDeliveryFee: number
  returnConfirmationHours: number
  autoCloseDays: number
}

export interface DriverCompensationApiItem {
  driver: LostFoundPerson
  reportId: string
  amount: number
  status: string
  paidAt: string
}

export interface DriverCompensationRow {
  id: string
  reportId: string
  driverId: string
  driverName: string
  driverEmail: string
  driverPhone: string
  amount: number
  status: string
  paidAt: string
}

export interface DriverCompensationResult {
  data: DriverCompensationRow[]
  meta: LostFoundReportsMeta
}

export type GetDriverCompensationParams = GetLostFoundReportsParams

interface DriverCompensationData {
  items: DriverCompensationApiItem[]
  pagination: {
    page: number
    limit: number
    total: number
    totalPage: number
  }
}

function mapDriverCompensation(item: DriverCompensationApiItem): DriverCompensationRow {
  return {
    id: `${item.reportId}-${item.driver?._id ?? 'unknown'}`,
    reportId: item.reportId,
    driverId: item.driver?._id ?? '',
    driverName: item.driver?.name?.trim() || '—',
    driverEmail: item.driver?.email ?? '—',
    driverPhone: item.driver?.phone ?? '—',
    amount: item.amount ?? 0,
    status: item.status,
    paidAt: item.paidAt,
  }
}

export interface LostFoundAnalyticsOverview {
  reportsThisMonth: number
  foundRate: number
  returnSuccessRate: number
  averageResolutionHours: number
  driverCompensationPaid: number
}

interface AnalyticsTrendPoint {
  month: string
  reports: number
}

interface AnalyticsCategoryPoint {
  category: string
  count: number
}

interface AnalyticsCityPoint {
  city: string
  reports: number
}

function mapPaginatedMeta(
  pagination: LostFoundReportsData['pagination'] | undefined,
  itemCount: number,
): LostFoundReportsMeta {
  return {
    page: pagination?.page ?? 1,
    limit: pagination?.limit ?? 10,
    totalItems: pagination?.total ?? itemCount,
    totalPages: pagination?.totalPage ?? 1,
  }
}

export const lostAndFoundApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getLostAndFoundOverview: builder.query<LostFoundOverviewSummary, void>({
      query: () => ({
        url: '/admin/lost-found/dashboard/cards',
        method: 'GET',
      }),
      transformResponse: (response: ApiResponse<LostFoundOverviewSummary>) =>
        response.data,
      providesTags: ['LostAndFoundOverview'],
    }),

    getLostAndFoundReports: builder.query<
      LostFoundReportsResult,
      GetLostFoundReportsParams | void
    >({
      query: ({ page = 1, limit = 10, searchTerm, status } = {}) => ({
        url: '/admin/lost-found/reports',
        method: 'GET',
        params: cleanObject({
          page,
          limit,
          searchTerm: searchTerm?.trim(),
          status,
        }),
      }),
      transformResponse: (response: ApiResponse<LostFoundReportsData>) => {
        const payload = response.data
        const items = payload?.items ?? []

        return {
          data: items.map(mapReport),
          meta: mapPaginatedMeta(payload?.pagination, items.length),
        }
      },
      providesTags: ['LostAndFoundReports'],
    }),

    getLostAndFoundReturns: builder.query<
      LostFoundReturnsResult,
      GetLostFoundReturnsParams | void
    >({
      query: ({ page = 1, limit = 10, searchTerm, status } = {}) => ({
        url: '/admin/lost-found/returns',
        method: 'GET',
        params: cleanObject({
          page,
          limit,
          searchTerm: searchTerm?.trim(),
          status,
        }),
      }),
      transformResponse: (response: ApiResponse<LostFoundReturnsData>) => {
        const payload = response.data
        const items = payload?.items ?? []

        return {
          data: items.map(mapReturn),
          meta: mapPaginatedMeta(payload?.pagination, items.length),
        }
      },
      providesTags: ['LostAndFoundReturns'],
    }),
    getLostAndFoundDeliveryFee: builder.query<LostFoundDeliveryFeeSettings, void>({
      query: () => ({
        url: '/admin/lost-found/delivery-fee',
        method: 'GET',
      }),
      transformResponse: (response: ApiResponse<LostFoundDeliveryFeeSettings>) =>
        response.data,
      providesTags: ['LostAndFoundDeliveryFees'],
    }),

    updateLostAndFoundDeliveryFee: builder.mutation<
      LostFoundDeliveryFeeSettings,
      LostFoundDeliveryFeeSettings
    >({
      query: (body) => ({
        url: '/admin/lost-found/delivery-fee',
        method: 'PATCH',
        body,
      }),
      transformResponse: (response: ApiResponse<LostFoundDeliveryFeeSettings>) =>
        response.data,
      invalidatesTags: ['LostAndFoundDeliveryFees'],
    }),
    getDriverCompensation: builder.query<
      DriverCompensationResult,
      GetDriverCompensationParams | void
    >({
      query: ({ page = 1, limit = 10, searchTerm, status } = {}) => ({
        url: '/admin/lost-found/driver-compensation',
        method: 'GET',
        params: cleanObject({
          page,
          limit,
          searchTerm: searchTerm?.trim(),
          status,
        }),
      }),
      transformResponse: (response: ApiResponse<DriverCompensationData>) => {
        const payload = response.data
        const items = payload?.items ?? []

        return {
          data: items.map(mapDriverCompensation),
          meta: mapPaginatedMeta(payload?.pagination, items.length),
        }
      },
      providesTags: ['LostAndFoundDriverCompensation'],
    }),



    // analytics
    getLostAndFoundAnalyticsOverview: builder.query<LostFoundAnalyticsOverview, void>({
      query: () => ({
        url: '/admin/lost-found/analytics/overview',
        method: 'GET',
      }),
      transformResponse: (response: ApiResponse<LostFoundAnalyticsOverview>) =>
        response.data,
      providesTags: ['LostAndFoundAnalytics'],
    }),

    getLostAndFoundAnalyticsReportsTrend: builder.query<ChartPoint[], void>({
      query: () => ({
        url: '/admin/lost-found/analytics/report-trend',
        method: 'GET',
      }),
      transformResponse: (response: ApiResponse<AnalyticsTrendPoint[]>) =>
        (response.data ?? []).map((point) => ({
          label: point.month,
          value: point.reports,
        })),
      providesTags: ['LostAndFoundAnalytics'],
    }),

    getLostAndFoundAnalyticsMostLostItems: builder.query<ChartPoint[], void>({
      query: () => ({
        url: '/admin/lost-found/analytics/most-lost-items',
        method: 'GET',
      }),
      transformResponse: (response: ApiResponse<AnalyticsCategoryPoint[]>) =>
        (response.data ?? []).map((point) => ({
          label: point.category,
          value: point.count,
        })),
      providesTags: ['LostAndFoundAnalytics'],
    }),

    getLostAndFoundAnalyticsCityReports: builder.query<ChartPoint[], void>({
      query: () => ({
        url: '/admin/lost-found/analytics/city-reports',
        method: 'GET',
      }),
      transformResponse: (response: ApiResponse<AnalyticsCityPoint[]>) =>
        (response.data ?? []).map((point) => ({
          label: point.city,
          value: point.reports,
        })),
      providesTags: ['LostAndFoundAnalytics'],
    }),

    getLostAndFoundAnalyticsCategoryDistribution: builder.query<ChartPoint[], void>({
      query: () => ({
        url: '/admin/lost-found/analytics/category-distribution',
        method: 'GET',
      }),
      transformResponse: (response: ApiResponse<AnalyticsCategoryPoint[]>) =>
        (response.data ?? []).map((point) => ({
          label: point.category,
          value: point.count,
        })),
      providesTags: ['LostAndFoundAnalytics'],
    }),
  }),
})

export const {
  useGetLostAndFoundOverviewQuery,
  useGetLostAndFoundReportsQuery,
  useGetLostAndFoundReturnsQuery,
  useGetLostAndFoundDeliveryFeeQuery,
  useUpdateLostAndFoundDeliveryFeeMutation,
  useGetDriverCompensationQuery,
  useGetLostAndFoundAnalyticsOverviewQuery,
  useGetLostAndFoundAnalyticsReportsTrendQuery,
  useGetLostAndFoundAnalyticsMostLostItemsQuery,
  useGetLostAndFoundAnalyticsCityReportsQuery,
  useGetLostAndFoundAnalyticsCategoryDistributionQuery,
} = lostAndFoundApi
