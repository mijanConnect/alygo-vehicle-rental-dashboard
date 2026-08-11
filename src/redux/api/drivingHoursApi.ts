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

export type DutyPolicyScopeType = 'global' | 'state' | 'city' | 'zone' | 'airport'

export type DutyPolicyStatus = 'active' | 'inactive'

export interface DutyPolicyLocationRef {
  _id: string
  country?: string
  state?: string
  city?: string
  zone?: string
  airport?: string
  type?: string
  maxDrivers?: number
}

export type DutyPolicyLocationField = string | DutyPolicyLocationRef | null | undefined

export interface DutyPolicyLimits {
  maxDrivingHoursPerDay: number
  maxContinuousDrivingHours: number
  breakAfterHours: number
  breakDurationMinutes: number
  maxTripsPerDay: number
  minimumRestHours: number
}

export interface DutyPolicyWritePayload extends DutyPolicyLimits {
  name: string
  scopeType: DutyPolicyScopeType
  countryId?: string
  stateId?: string
  cityId?: string
  zoneId?: string
  airportId?: string
}

export interface DutyPolicyItem extends DutyPolicyLimits {
  _id: string
  name: string
  scopeType: DutyPolicyScopeType
  countryId?: DutyPolicyLocationField
  stateId?: DutyPolicyLocationField
  cityId?: DutyPolicyLocationField
  zoneId?: DutyPolicyLocationField
  airportId?: DutyPolicyLocationField
  status: DutyPolicyStatus
  isDeleted?: boolean
  createdAt?: string
  updatedAt?: string
}

export interface DutyPolicyQueryParams {
  page?: number
  limit?: number
  searchTerm?: string
  status?: DutyPolicyStatus | string
  scopeType?: DutyPolicyScopeType
}

export interface DutyPolicyListResult {
  data: DutyPolicyItem[]
  meta: {
    page: number
    limit: number
    totalItems: number
    totalPages: number
  }
}

export interface UpdateDutyPolicyArgs {
  id: string
  body: DutyPolicyWritePayload
}

export interface UpdateDutyPolicyStatusArgs {
  id: string
  status: DutyPolicyStatus
}

export interface DriverDutyHourMonitoringItem {
  driverId: string
  name: string
  email: string
  phone: string
  profileImage?: string
  city: string
  state: string
  maxHours: number
  resetHours: number
  dailyLimit: number
  weeklyLimit: number
  breakMinutes: number
  drivingHoursToday: number
  remainingHoursToday: number
  continuousDrivingHours: number
  status: string
}

export interface DriverDutyHourMonitoringQueryParams {
  page?: number
  limit?: number
  searchTerm?: string
  status?: string
}

export interface DriverDutyHourMonitoringListResult {
  data: DriverDutyHourMonitoringItem[]
  meta: {
    page: number
    limit: number
    totalItems: number
    totalPages: number
  }
}

export interface DriverDutyHourAnalyticsItem {
  [key: string]: unknown
}

function mapMeta(meta: PaginationMeta | undefined, count: number) {
  return {
    page: meta?.page ?? 1,
    limit: meta?.limit ?? 10,
    totalItems: meta?.total ?? count,
    totalPages: meta?.totalPage ?? 1,
  }
}

export const driverDutyPoliciesApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getDriverDutyPolicies: builder.query<
      DutyPolicyListResult,
      DutyPolicyQueryParams | void
    >({
      query: ({ page = 1, limit = 10, searchTerm, status, scopeType } = {}) => ({
        url: '/driver-duty-policies',
        method: 'GET',
        params: cleanObject({
          page,
          limit,
          searchTerm: searchTerm?.trim(),
          status,
          scopeType,
        }),
      }),
      transformResponse: (response: PaginatedApiResponse<DutyPolicyItem>) => ({
        data: response.data ?? [],
        meta: mapMeta(response.meta, response.data?.length ?? 0),
      }),
      providesTags: (result, _err, arg) => {
        const scope = arg?.scopeType ?? 'all'
        return result
          ? [
              ...result.data.map(({ _id }) => ({ type: 'DrivingHours' as const, id: _id })),
              { type: 'DrivingHours', id: `LIST-${scope}` },
            ]
          : [{ type: 'DrivingHours', id: `LIST-${scope}` }]
      },
    }),

    getSingleDriverDutyPolicy: builder.query<DutyPolicyItem, string>({
      query: (id) => ({
        url: `/driver-duty-policies/${id}`,
        method: 'GET',
      }),
      transformResponse: (response: ApiResponse<DutyPolicyItem>) => response.data,
      providesTags: (_res, _err, id) => [{ type: 'DrivingHours', id }],
    }),

    createDriverDutyPolicy: builder.mutation<DutyPolicyItem, DutyPolicyWritePayload>({
      query: (body) => ({
        url: '/driver-duty-policies',
        method: 'POST',
        body,
      }),
      transformResponse: (response: ApiResponse<DutyPolicyItem>) => response.data,
      invalidatesTags: (_res, _err, body) => [
        { type: 'DrivingHours', id: `LIST-${body.scopeType}` },
        { type: 'DrivingHours', id: 'LIST-all' },
      ],
    }),

    updateDriverDutyPolicy: builder.mutation<DutyPolicyItem, UpdateDutyPolicyArgs>({
      query: ({ id, body }) => ({
        url: `/driver-duty-policies/${id}`,
        method: 'PATCH',
        body,
      }),
      transformResponse: (response: ApiResponse<DutyPolicyItem>) => response.data,
      invalidatesTags: (_res, _err, { id, body }) => [
        { type: 'DrivingHours', id },
        { type: 'DrivingHours', id: `LIST-${body.scopeType}` },
        { type: 'DrivingHours', id: 'LIST-all' },
      ],
    }),

    updateDriverDutyPolicyStatus: builder.mutation<
      DutyPolicyItem,
      UpdateDutyPolicyStatusArgs
    >({
      query: ({ id, status }) => ({
        url: `/driver-duty-policies/status/${id}`,
        method: 'PATCH',
        body: { status },
      }),
      transformResponse: (response: ApiResponse<DutyPolicyItem>) => response.data,
      invalidatesTags: (_res, _err, { id }) => [
        { type: 'DrivingHours', id },
        { type: 'DrivingHours', id: 'LIST-all' },
        { type: 'DrivingHours', id: 'LIST-global' },
        { type: 'DrivingHours', id: 'LIST-state' },
        { type: 'DrivingHours', id: 'LIST-city' },
        { type: 'DrivingHours', id: 'LIST-zone' },
        { type: 'DrivingHours', id: 'LIST-airport' },
      ],
    }),

    deleteDriverDutyPolicy: builder.mutation<void, { id: string; scopeType?: DutyPolicyScopeType }>({
      query: ({ id }) => ({
        url: `/driver-duty-policies/${id}`,
        method: 'DELETE',
      }),
      invalidatesTags: (_res, _err, { id, scopeType }) => [
        { type: 'DrivingHours', id },
        { type: 'DrivingHours', id: `LIST-${scopeType ?? 'all'}` },
        { type: 'DrivingHours', id: 'LIST-all' },
      ],
    }),

    getDriverDutyHourMonitoring: builder.query<
      DriverDutyHourMonitoringListResult,
      DriverDutyHourMonitoringQueryParams | void
    >({
      query: ({ page = 1, limit = 10, searchTerm, status } = {}) => ({
        url: '/admin/duty-hour/monitoring/drivers',
        method: 'GET',
        params: cleanObject({
          page,
          limit,
          searchTerm: searchTerm?.trim(),
          status,
        }),
      }),
      transformResponse: (response: PaginatedApiResponse<DriverDutyHourMonitoringItem>) => ({
        data: response.data ?? [],
        meta: mapMeta(response.meta, response.data?.length ?? 0),
      }),
      providesTags: [{ type: 'DrivingHours', id: 'MONITORING' }],
    }),

    getDriverDutyHourAnalytics: builder.query<DriverDutyHourAnalyticsItem, void>({
      query: () => ({
        url: '/admin/duty-hour/analytics',
        method: 'GET',
      }),
      transformResponse: (response: ApiResponse<DriverDutyHourAnalyticsItem>) => response.data,
      providesTags: [{ type: 'DrivingHours', id: 'ANALYTICS' }],
    }),
  }),
})

export const {
  useGetDriverDutyPoliciesQuery,
  useGetSingleDriverDutyPolicyQuery,
  useCreateDriverDutyPolicyMutation,
  useUpdateDriverDutyPolicyMutation,
  useUpdateDriverDutyPolicyStatusMutation,
  useDeleteDriverDutyPolicyMutation,
  useGetDriverDutyHourMonitoringQuery,
  useGetDriverDutyHourAnalyticsQuery,
} = driverDutyPoliciesApi
