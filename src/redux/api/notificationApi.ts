import { baseApi } from '@/redux/baseApi'
import { cleanObject } from '@/utils/cleanObject'

interface ApiResponse<T> {
  success: boolean
  message: string
  data: T
}

interface PaginationBlock {
  page: number
  limit: number
  total: number
  totalPage: number
}

export interface AdminNotificationItem {
  id: string
  title: string
  message: string
  read: boolean
  createdAt: string
  category?: string
  type?: string
  raw?: Record<string, unknown>
}

export interface AdminNotificationPayload {
  _id?: string
  id?: string
  title?: string
  message?: string
  body?: string
  content?: string
  description?: string
  read?: boolean
  isRead?: boolean
  createdAt?: string
  updatedAt?: string
  category?: string
  type?: string
  [key: string]: unknown
}

export interface NotificationsQueryParams {
  page?: number
  limit?: number
  searchTerm?: string
  status?: string
}

export interface NotificationsListResult {
  data: AdminNotificationItem[]
  meta: {
    page: number
    limit: number
    totalItems: number
    totalPages: number
  }
}

function asRecord(value: unknown): Record<string, unknown> | null {
  if (!value || typeof value !== 'object' || Array.isArray(value)) return null
  return value as Record<string, unknown>
}

function pickString(...values: unknown[]) {
  for (const value of values) {
    if (typeof value === 'string' && value.trim()) return value
  }
  return ''
}

export function mapAdminNotification(
  payload: AdminNotificationPayload | Record<string, unknown> | null | undefined,
): AdminNotificationItem | null {
  const record = asRecord(payload)
  if (!record) return null

  const id = pickString(record._id, record.id)
  const title = pickString(record.title, record.type, 'Notification')
  const message = pickString(
    record.message,
    record.body,
    record.content,
    record.description,
  )
  const createdAt =
    pickString(record.createdAt, record.updatedAt) || new Date().toISOString()
  const read =
    typeof record.read === 'boolean'
      ? record.read
      : typeof record.isRead === 'boolean'
        ? record.isRead
        : false

  if (!id && !title && !message) return null

  return {
    id: id || crypto.randomUUID(),
    title,
    message: message || title,
    read,
    createdAt,
    category: pickString(record.category) || undefined,
    type: pickString(record.type) || undefined,
    raw: record,
  }
}

function unwrapNotificationList(response: unknown): AdminNotificationPayload[] {
  if (Array.isArray(response)) return response as AdminNotificationPayload[]

  const root = asRecord(response)
  if (!root) return []

  if (Array.isArray(root.data)) return root.data as AdminNotificationPayload[]

  const nested = asRecord(root.data)
  if (nested && Array.isArray(nested.data)) {
    return nested.data as AdminNotificationPayload[]
  }

  return []
}

function mapListResponse(response: unknown): NotificationsListResult {
  const root = asRecord(response)
  const pagination =
    (root?.pagination as PaginationBlock | undefined) ??
    (root?.meta as PaginationBlock | undefined) ??
    (asRecord(root?.data)?.pagination as PaginationBlock | undefined) ??
    (asRecord(root?.data)?.meta as PaginationBlock | undefined)

  const rows = unwrapNotificationList(response)
    .map((item) => mapAdminNotification(item))
    .filter((item): item is AdminNotificationItem => Boolean(item))

  return {
    data: rows,
    meta: {
      page: pagination?.page ?? 1,
      limit: pagination?.limit ?? 10,
      totalItems: pagination?.total ?? rows.length,
      totalPages: pagination?.totalPage ?? 1,
    },
  }
}

export const notificationApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getNotificationsList: builder.query<
      NotificationsListResult,
      NotificationsQueryParams | void
    >({
      query: ({ page = 1, limit = 20, searchTerm, status } = {}) => ({
        url: '/notifications/admin',
        method: 'GET',
        params: cleanObject({
          page,
          limit,
          searchTerm: searchTerm?.trim(),
          status,
        }),
      }),
      transformResponse: (response: unknown) => mapListResponse(response),
      providesTags: (result) =>
        result
          ? [
              ...result.data.map(({ id }) => ({
                type: 'Notifications' as const,
                id,
              })),
              { type: 'Notifications', id: 'LIST' },
            ]
          : [{ type: 'Notifications', id: 'LIST' }],
    }),

    createNotification: builder.mutation<
      AdminNotificationItem,
      Partial<AdminNotificationPayload>
    >({
      query: (body) => ({
        url: '/notifications',
        method: 'POST',
        body,
      }),
      transformResponse: (response: ApiResponse<AdminNotificationPayload>) => {
        const mapped = mapAdminNotification(response.data)
        if (!mapped) {
          throw new Error(response.message || 'Invalid notification response')
        }
        return mapped
      },
      invalidatesTags: [{ type: 'Notifications', id: 'LIST' }],
    }),

    markNotificationRead: builder.mutation<AdminNotificationItem, string>({
      query: (id) => ({
        url: `/notifications/${id}/read`,
        method: 'PATCH',
      }),
      transformResponse: (response: ApiResponse<AdminNotificationPayload>) => {
        const mapped = mapAdminNotification(response.data)
        if (!mapped) {
          throw new Error(response.message || 'Invalid notification response')
        }
        return mapped
      },
      invalidatesTags: (_res, _err, id) => [
        { type: 'Notifications', id },
        { type: 'Notifications', id: 'LIST' },
      ],
    }),

    markAllNotificationsRead: builder.mutation<void, void>({
      query: () => ({
        url: '/notifications/admin',
        method: 'PATCH',
      }),
      invalidatesTags: [{ type: 'Notifications', id: 'LIST' }],
    }),
  }),
})

export const {
  useGetNotificationsListQuery,
  useCreateNotificationMutation,
  useMarkNotificationReadMutation,
  useMarkAllNotificationsReadMutation,
} = notificationApi
