import { baseApi } from '@/redux/baseApi'
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
        const pagination = payload?.pagination

        return {
          data: items.map(mapReport),
          meta: {
            page: pagination?.page ?? 1,
            limit: pagination?.limit ?? 10,
            totalItems: pagination?.total ?? items.length,
            totalPages: pagination?.totalPage ?? 1,
          },
        }
      },
      providesTags: ['LostAndFoundReports'],
    }),
  }),
})

export const {
  useGetLostAndFoundOverviewQuery,
  useGetLostAndFoundReportsQuery,
} = lostAndFoundApi
