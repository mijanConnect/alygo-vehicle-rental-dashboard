import { baseApi } from '@/redux/baseApi'
import { cleanObject } from '@/utils/cleanObject'

export interface ApiResponse<T> {
  success: boolean
  message: string
  data: T
}

export interface PaginationMeta {
  page: number
  limit: number
  total: number
  totalPage: number
}

export interface PaginatedApiResponse<T> {
  success: boolean
  message: string
  data: T[]
  meta?: PaginationMeta
}

export interface ActiveTierSummary {
  tierId: string | null
  name: string
  count: number
}

export interface DriverOverviewSummary {
  totalDrivers: number
  onlineDrivers: number
  pendingApproval: number
  suspendedDrivers: number
  compliancePending: number
  complianceExpired: number
  verifiedDrivers: number
  activeTiers: ActiveTierSummary[]
}

export interface DriverSuspensionDetails {
  isSuspended: boolean
  suspendedBy: string | null
  suspendedAt: string | null
  reason: string
  note: string
}

export interface DriverIdDetails {
  _id: string
  averageRating: number
  currentPoints: number
  lifetimePoints: number
  approvalStatus: string
  backgroundCheckStatus: string
  identityVerificationStatus: string
  licenseExpiryDate: string | null
  suspension?: DriverSuspensionDetails
}

export interface DriverOverviewItem {
  driverId: DriverIdDetails | string
  userId: unknown
  fullName: string
  avatar: string
  email: string
  phone: string
  averageRating: number
  completedTrips: number
  tier: string
  tierProgress: string
  tierStatus: string
  vehicle: string
  rideCategories: string[]
  compliance: string
  backgroundCheck: string
  identityVerification: string
  status: string
  city: string
}

export interface DriverDetailInfo {
  driverId: string
  fullName: string
  avatar: string | null
  phone: string
  email: string
  vehicleName: string
  vehicleNumber: string
  completedTrips: number
  averageRating: number
}

export interface IdentityVerificationDetails {
  verificationStatus: string
  verificationDate: string | null
  lastVerificationDate: string | null
  verificationSource: string
  verificationNotes: string
}

export interface VerificationImageItem {
  imageUrl: string
  capturedAt: string
}

export interface VerificationImages {
  profilePhoto: VerificationImageItem | null
  latestLiveSelfie: VerificationImageItem | null
}

export interface DriverDetailsData {
  driver: DriverDetailInfo
  identityVerification: IdentityVerificationDetails
  verificationImages: VerificationImages
  verificationHistory: unknown[]
}

export interface DriverLocation {
  type: string
  coordinates: [number, number]
  address: string
}

export interface OnlineDriverUser {
  _id: string
  name: string
  email: string
  profileImage?: string
  status?: string
  phone?: string
  averageRating?: number
}

export interface VehicleDetails {
  _id: string
  driverId: string
  brand: string
  model: string
  year: number
  carType: string
  seatNumber: number
  licensePlate: string
  vin?: string
  vehicleLicense?: string
  personalAutoInsurance?: string
  insuranceHub?: unknown[]
  isVerified?: boolean
  verifiedAt?: string | null
  isDeleted?: boolean
  createdAt?: string
  updatedAt?: string
  [key: string]: unknown
}

export interface OnlineDriverItem {
  _id: string
  userId?: OnlineDriverUser | null
  location?: DriverLocation
  isStripeOnboarded?: boolean
  liveSelfie?: string
  drivingLicense?: string
  ssn?: string
  serviceAreaId?: unknown
  driverAvailabilityStatus?: string
  averageRating?: number
  currentPoints?: number
  lifetimePoints?: number
  currentTier?: {
    _id: string
    name: string
  }
  progressPercentage?: number
  approvalStatus?: string
  backgroundCheckStatus?: string
  identityVerificationStatus?: string
  suspension?: DriverSuspensionDetails
  vehicle?: VehicleDetails | null
  createdAt?: string
  updatedAt?: string
  [key: string]: unknown
}

export interface PendingApprovalDriverItem {
  _id: string
  userId?: OnlineDriverUser | null
  location?: DriverLocation
  isStripeOnboarded?: boolean
  approvalStatus: string
  backgroundCheckStatus: string
  identityVerificationStatus: string
  averageRating?: number
  currentTier?: {
    _id: string
    name: string
  }
  vehicle?: VehicleDetails | null
  createdAt?: string
  updatedAt?: string
  [key: string]: unknown
}

export interface ComplianceDriverItem {
  _id: string
  userId?: OnlineDriverUser | null
  location?: DriverLocation
  approvalStatus: string
  backgroundCheckStatus: string
  identityVerificationStatus: string
  averageRating?: number
  currentTier?: {
    _id: string
    name: string
  }
  vehicle?: VehicleDetails | null
  licenseExpiryDate?: string | null
  createdAt?: string
  updatedAt?: string
  [key: string]: unknown
}

export interface DriverQueryParams {
  page?: number
  limit?: number
  searchTerm?: string
  status?: string
  tier?: string
}

export interface DriverListResult<T> {
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

export const driverManagementApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getDriverManagementSummary: builder.query<DriverOverviewSummary, void>({
      query: () => ({
        url: '/driver-management/overview',
        method: 'GET',
      }),
      transformResponse: (response: ApiResponse<DriverOverviewSummary>) =>
        response.data,
      providesTags: ['Drivers'],
    }),

    getDriverManagementList: builder.query<
      DriverListResult<DriverOverviewItem>,
      DriverQueryParams | void
    >({
      query: ({ page = 1, limit = 10, searchTerm, status, tier } = {}) => ({
        url: '/driver-management',
        method: 'GET',
        params: cleanObject({
          page,
          limit,
          searchTerm: searchTerm?.trim(),
          status,
          tier,
        }),
      }),
      transformResponse: (response: PaginatedApiResponse<DriverOverviewItem>) => ({
        data: response.data ?? [],
        meta: mapMeta(response.meta, response.data?.length ?? 0),
      }),
      providesTags: ['Drivers'],
    }),

    getSingleDriver: builder.query<DriverDetailsData, string>({
      query: (id) => ({
        url: `/driver-management/drivers/${id}`,
        method: 'GET',
      }),
      transformResponse: (response: ApiResponse<DriverDetailsData>) =>
        response.data,
      providesTags: (_res, _err, id) => [{ type: 'Drivers', id }],
    }),

    getAllOnlineDrivers: builder.query<
      DriverListResult<OnlineDriverItem>,
      DriverQueryParams | void
    >({
      query: ({ page = 1, limit = 10, searchTerm } = {}) => ({
        url: '/driver-management/online',
        method: 'GET',
        params: cleanObject({
          page,
          limit,
          searchTerm: searchTerm?.trim(),
        }),
      }),
      transformResponse: (response: PaginatedApiResponse<OnlineDriverItem>) => ({
        data: response.data ?? [],
        meta: mapMeta(response.meta, response.data?.length ?? 0),
      }),
      providesTags: ['Drivers'],
    }),

    getAllPendingApprovals: builder.query<
      DriverListResult<PendingApprovalDriverItem>,
      DriverQueryParams | void
    >({
      query: ({ page = 1, limit = 10, searchTerm } = {}) => ({
        url: '/driver-management/pending-approval',
        method: 'GET',
        params: cleanObject({
          page,
          limit,
          searchTerm: searchTerm?.trim(),
        }),
      }),
      transformResponse: (
        response: PaginatedApiResponse<PendingApprovalDriverItem>,
      ) => ({
        data: response.data ?? [],
        meta: mapMeta(response.meta, response.data?.length ?? 0),
      }),
      providesTags: ['Drivers'],
    }),

    getAllSuspendedList: builder.query<
      DriverListResult<OnlineDriverItem>,
      DriverQueryParams | void
    >({
      query: ({ page = 1, limit = 10, searchTerm } = {}) => ({
        url: '/driver-management/suspended',
        method: 'GET',
        params: cleanObject({
          page,
          limit,
          searchTerm: searchTerm?.trim(),
        }),
      }),
      transformResponse: (response: PaginatedApiResponse<OnlineDriverItem>) => ({
        data: response.data ?? [],
        meta: mapMeta(response.meta, response.data?.length ?? 0),
      }),
      providesTags: ['Drivers'],
    }),

    getAllComplianceList: builder.query<
      DriverListResult<ComplianceDriverItem>,
      DriverQueryParams | void
    >({
      query: ({ page = 1, limit = 10, searchTerm } = {}) => ({
        url: '/driver-management/compliance',
        method: 'GET',
        params: cleanObject({
          page,
          limit,
          searchTerm: searchTerm?.trim(),
        }),
      }),
      transformResponse: (response: PaginatedApiResponse<ComplianceDriverItem>) => ({
        data: response.data ?? [],
        meta: mapMeta(response.meta, response.data?.length ?? 0),
      }),
      providesTags: ['Drivers'],
    }),

    driverApproval: builder.mutation<ApiResponse<DriverDetailsData>, string>({
      query: (driverId) => ({
        url: `/driver-management/drivers/${driverId}/approve`,
        method: 'POST',
      }),
      transformResponse: (response: ApiResponse<void>) => response.data,
      invalidatesTags: ['Drivers'],
    }),
    driverSuspension: builder.mutation<ApiResponse<void>, string>({
      query: (driverId) => ({
        url: `/driver-management/drivers/${driverId}/suspend`,
        method: 'POST',
      }),
      transformResponse: (response: ApiResponse<DriverDetailsData>) =>
        response.data,
      invalidatesTags: ['Drivers'],
    }),
    driverRejection: builder.mutation<ApiResponse<DriverDetailsData>, string>({
      query: (id) => ({
        url: `/driver-management/drivers/${id}/reject`,
        method: 'POST',
      }),
      transformResponse: (response: ApiResponse<DriverDetailsData>) =>
        response.data,
      invalidatesTags: ['Drivers'],
    }),
    driverUnsuspension: builder.mutation<ApiResponse<void>, string>({
      query: (driverId) => ({
        url: `/driver-management/drivers/${driverId}/unsuspend`,
        method: 'POST',
      }),
      transformResponse: (response: ApiResponse<void>) => response.data,
      invalidatesTags: ['Drivers'],
    }),
  }),
})

export const {
  useGetDriverManagementSummaryQuery,
  useGetDriverManagementListQuery,
  useGetSingleDriverQuery,
  useGetAllOnlineDriversQuery,
  useGetAllPendingApprovalsQuery,
  useGetAllSuspendedListQuery,
  useGetAllComplianceListQuery,
  useDriverApprovalMutation,
  useDriverSuspensionMutation,
  useDriverRejectionMutation,
  useDriverUnsuspensionMutation,
} = driverManagementApi

/** @deprecated Use useGetAllComplianceListQuery */
export const useGetAllComplienceListQuery = useGetAllComplianceListQuery
