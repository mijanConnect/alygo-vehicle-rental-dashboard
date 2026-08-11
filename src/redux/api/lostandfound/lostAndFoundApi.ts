import { baseApi } from '@/redux/baseApi'
import type { ChartPoint } from '@/types'
import { cleanObject } from '@/utils/cleanObject'

interface ApiResponse<T> {
  success: boolean
  message: string
  data: T
  meta?: {
    page: number
    limit: number
    total: number
    totalPage: number
  }
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

export interface LostFoundReportDetailPhoto {
  id: string
  url: string
}

export interface LostFoundReportDetailTimelineItem {
  status: string
  title: string
  description: string
  createdBy: string
  createdAt: string
}

export interface LostFoundReportDetailApi {
  report: {
    reportId: string
    reportNumber: string
    currentStatus: string
    createdAt: string
  }
  passenger: {
    id: string
    fullName: string
    email: string
    phone: string
    avatar?: string | null
  } | null
  driver: {
    id: string
    fullName: string
    driverId: string
    rating: number
    avatar?: string | null
  } | null
  trip: {
    rideId: string
    bookingReference: string
    pickupAddress: string
    destinationAddress: string
    tripDate: string
  } | null
  lostItem: {
    category: string
    itemName: string
    description: string
    photos: LostFoundReportDetailPhoto[]
  } | null
  timeline: LostFoundReportDetailTimelineItem[]
}

export interface LostFoundReportDetail {
  reportId: string
  reportNumber: string
  status: string
  createdAt: string
  passenger: {
    id: string
    fullName: string
    email: string
    phone: string
    avatar?: string | null
  } | null
  driver: {
    id: string
    fullName: string
    driverCode: string
    rating: number
    avatar?: string | null
  } | null
  trip: {
    rideId: string
    bookingReference: string
    pickupAddress: string
    destinationAddress: string
    tripDate: string
  } | null
  lostItem: {
    category: string
    itemName: string
    description: string
    photos: LostFoundReportDetailPhoto[]
  } | null
  timeline: LostFoundReportDetailTimelineItem[]
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

function mapReportDetail(data: LostFoundReportDetailApi): LostFoundReportDetail {
  return {
    reportId: data.report?.reportId ?? '',
    reportNumber: data.report?.reportNumber ?? '—',
    status: data.report?.currentStatus ?? '—',
    createdAt: data.report?.createdAt ?? '—',
    passenger: data.passenger
      ? {
          id: data.passenger.id,
          fullName: data.passenger.fullName,
          email: data.passenger.email,
          phone: data.passenger.phone,
          avatar: data.passenger.avatar,
        }
      : null,
    driver: data.driver
      ? {
          id: data.driver.id,
          fullName: data.driver.fullName,
          driverCode: data.driver.driverId,
          rating: data.driver.rating ?? 0,
          avatar: data.driver.avatar,
        }
      : null,
    trip: data.trip
      ? {
          rideId: data.trip.rideId || '—',
          bookingReference: data.trip.bookingReference || '—',
          pickupAddress: data.trip.pickupAddress || '—',
          destinationAddress: data.trip.destinationAddress || '—',
          tripDate: data.trip.tripDate || '—',
        }
      : null,
    lostItem: data.lostItem
      ? {
          category: data.lostItem.category || '—',
          itemName: data.lostItem.itemName || '—',
          description: data.lostItem.description || '—',
          photos: data.lostItem.photos ?? [],
        }
      : null,
    timeline: data.timeline ?? [],
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

export interface LostFoundCategoryApiItem {
  _id: string
  name: string
  status: string
  isDeleted?: boolean
  createdAt: string
  updatedAt: string
  deletedAt?: string
}

export interface LostFoundCategoryRow {
  id: string
  name: string
  status: string
  createdAt: string
  updatedAt: string
}

export interface LostFoundCategoryListResult {
  data: LostFoundCategoryRow[]
  meta: LostFoundReportsMeta
}

export type GetLostFoundCategoriesParams = GetLostFoundReportsParams

export interface CreateLostFoundCategoryBody {
  name: string
}

export interface UpdateLostFoundCategoryBody {
  id: string
  name: string
}

function mapCategory(item: LostFoundCategoryApiItem): LostFoundCategoryRow {
  return {
    id: item._id,
    name: item.name,
    status: item.status,
    createdAt: item.createdAt,
    updatedAt: item.updatedAt,
  }
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
    getSingleLostAndFoundReport: builder.query<LostFoundReportDetail, string>({
      query: (id) => ({
        url: `/admin/lost-found/${id}/details`,
        method: 'GET',
      }),
      transformResponse: (response: ApiResponse<LostFoundReportDetailApi>) =>
        mapReportDetail(response.data),
      providesTags: (_res, _err, id) => [{ type: 'LostAndFoundReports', id }],
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

    // category management
    getLostAndFoundCategories: builder.query<
      LostFoundCategoryListResult,
      GetLostFoundCategoriesParams | void
    >({
      query: ({ page = 1, limit = 10, searchTerm, status } = {}) => ({
        url: '/lost-and-found-item-categories/active',
        method: 'GET',
        params: cleanObject({
          page,
          limit,
          searchTerm: searchTerm?.trim(),
          status,
        }),
      }),
      transformResponse: (response: ApiResponse<LostFoundCategoryApiItem[]>) => {
        const rows = (response.data ?? [])
          .filter((item) => !item.isDeleted)
          .map(mapCategory)

        return {
          data: rows,
          meta: {
            page: response.meta?.page ?? 1,
            limit: response.meta?.limit ?? 10,
            totalItems: response.meta?.total ?? rows.length,
            totalPages: response.meta?.totalPage ?? 1,
          },
        }
      },
      providesTags: ['LostAndFoundCategories'],
    }),

    createLostAndFoundCategory: builder.mutation<
      LostFoundCategoryRow,
      CreateLostFoundCategoryBody
    >({
      query: (body) => ({
        url: '/lost-and-found-item-categories',
        method: 'POST',
        body,
      }),
      transformResponse: (response: ApiResponse<LostFoundCategoryApiItem>) =>
        mapCategory(response.data),
      invalidatesTags: ['LostAndFoundCategories'],
    }),

    updateLostAndFoundCategory: builder.mutation<
      LostFoundCategoryRow,
      UpdateLostFoundCategoryBody
    >({
      query: ({ id, name }) => ({
        url: `/lost-and-found-item-categories/${id}`,
        method: 'PATCH',
        body: { name },
      }),
      transformResponse: (response: ApiResponse<LostFoundCategoryApiItem>) =>
        mapCategory(response.data),
      invalidatesTags: ['LostAndFoundCategories'],
    }),

    deleteLostAndFoundCategory: builder.mutation<{ success: boolean; message: string }, string>({
      query: (id) => ({
        url: `/lost-and-found-item-categories/${id}`,
        method: 'DELETE',
      }),
      invalidatesTags: ['LostAndFoundCategories'],
    }),
  }),
})

export const {
  useGetLostAndFoundOverviewQuery,
  useGetLostAndFoundReportsQuery,
  useGetSingleLostAndFoundReportQuery,
  useGetLostAndFoundReturnsQuery,
  useGetLostAndFoundDeliveryFeeQuery,
  useUpdateLostAndFoundDeliveryFeeMutation,
  useGetDriverCompensationQuery,
  useGetLostAndFoundAnalyticsOverviewQuery,
  useGetLostAndFoundAnalyticsReportsTrendQuery,
  useGetLostAndFoundAnalyticsMostLostItemsQuery,
  useGetLostAndFoundAnalyticsCityReportsQuery,
  useGetLostAndFoundAnalyticsCategoryDistributionQuery,
  useGetLostAndFoundCategoriesQuery,
  useCreateLostAndFoundCategoryMutation,
  useUpdateLostAndFoundCategoryMutation,
  useDeleteLostAndFoundCategoryMutation,
} = lostAndFoundApi
