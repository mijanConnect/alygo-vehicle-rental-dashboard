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

export type EventStatus = 'active' | 'inactive'

export interface EventLocation {
  type: 'Point'
  coordinates: [number, number] // [lng, lat]
}

export interface EventWritePayload {
  eventName: string
  description: string
  timezone: string
  startDateTime: string
  endDateTime: string
  serviceAreaId: string
  location: EventLocation
  coverageRadiusKm: number
  status: EventStatus
}

export interface EventItem {
  _id: string
  eventName: string
  description: string
  timezone: string
  startDateTime: string
  endDateTime: string
  serviceAreaId: string
  location: EventLocation
  coverageRadiusKm: number
  status: EventStatus
  isDeleted?: boolean
  createdAt?: string
  updatedAt?: string
}

export interface EventsQueryParams {
  page?: number
  limit?: number
  searchTerm?: string
  status?: EventStatus | string
}

export interface EventsListResult {
  data: EventItem[]
  meta: {
    page: number
    limit: number
    totalItems: number
    totalPages: number
  }
}

export interface UpdateEventArgs {
  id: string
  body: EventWritePayload
}

export interface UpdateEventStatusArgs {
  id: string
  status: EventStatus
}

function mapMeta(meta: PaginationMeta | undefined, count: number) {
  return {
    page: meta?.page ?? 1,
    limit: meta?.limit ?? 10,
    totalItems: meta?.total ?? count,
    totalPages: meta?.totalPage ?? 1,
  }
}

export const eventsManageApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getEventsList: builder.query<EventsListResult, EventsQueryParams | void>({
      query: ({ page = 1, limit = 10, searchTerm, status } = {}) => ({
        url: '/events',
        method: 'GET',
        params: cleanObject({
          page,
          limit,
          searchTerm: searchTerm?.trim(),
          status,
        }),
      }),
      transformResponse: (response: PaginatedApiResponse<EventItem>) => ({
        data: response.data ?? [],
        meta: mapMeta(response.meta, response.data?.length ?? 0),
      }),
      providesTags: (result) =>
        result
          ? [
              ...result.data.map(({ _id }) => ({ type: 'Events' as const, id: _id })),
              { type: 'Events', id: 'LIST' },
            ]
          : [{ type: 'Events', id: 'LIST' }],
    }),

    getSingleEvent: builder.query<EventItem, string>({
      query: (id) => ({
        url: `/events/${id}`,
        method: 'GET',
      }),
      transformResponse: (response: ApiResponse<EventItem>) => response.data,
      providesTags: (_res, _err, id) => [{ type: 'Events', id }],
    }),

    createEvent: builder.mutation<EventItem, EventWritePayload>({
      query: (body) => ({
        url: '/events',
        method: 'POST',
        body,
      }),
      transformResponse: (response: ApiResponse<EventItem>) => response.data,
      invalidatesTags: [{ type: 'Events', id: 'LIST' }],
    }),

    updateEvent: builder.mutation<EventItem, UpdateEventArgs>({
      query: ({ id, body }) => ({
        url: `/events/${id}`,
        method: 'PATCH',
        body,
      }),
      transformResponse: (response: ApiResponse<EventItem>) => response.data,
      invalidatesTags: (_res, _err, { id }) => [
        { type: 'Events', id },
        { type: 'Events', id: 'LIST' },
      ],
    }),

    updateEventStatus: builder.mutation<EventItem, UpdateEventStatusArgs>({
      query: ({ id, status }) => ({
        url: `/events/status/${id}`,
        method: 'PATCH',
        body: { status },
      }),
      transformResponse: (response: ApiResponse<EventItem>) => response.data,
      invalidatesTags: (_res, _err, { id }) => [
        { type: 'Events', id },
        { type: 'Events', id: 'LIST' },
      ],
    }),

    deleteEvent: builder.mutation<void, string>({
      query: (id) => ({
        url: `/events/${id}`,
        method: 'DELETE',
      }),
      invalidatesTags: (_res, _err, id) => [
        { type: 'Events', id },
        { type: 'Events', id: 'LIST' },
      ],
    }),
  }),
})

export const {
  useGetEventsListQuery,
  useGetSingleEventQuery,
  useCreateEventMutation,
  useUpdateEventMutation,
  useUpdateEventStatusMutation,
  useDeleteEventMutation,
} = eventsManageApi
