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

interface PaginatedApiResponse<T> {
  success: boolean
  message: string
  data: T[]
  pagination?: PaginationBlock
  meta?: PaginationBlock
}

export type AiSupportVisibility = 'driver' | 'passenger' | 'all' | string
export type AiSupportStatus = 'published' | 'draft' | 'archived' | string
export type AiSupportRole = 'driver' | 'passenger' | string

export const AI_KNOWLEDGE_MODULE = {
  RIDE: 'Ride',
  WALLET: 'Wallet',
  REFERRAL: 'Referral',
  TIER: 'Tier',
  POINTS: 'Points',
  DESTINATION_FILTER: 'Destination Filter',
  LOST_FOUND: 'Lost Found',
  SUPPORT: 'Support',
  FAQ: 'FAQ',
  DOCUMENTS: 'Documents',
  ACCOUNT: 'Account',
  VEHICLE: 'Vehicle',
  SAFETY: 'Safety',
  CANCELLATION: 'Cancellation',
  RATINGS: 'Ratings',
  COMPLIANCE: 'Compliance',
  FARES: 'Fares',
  SERVICE_AREA: 'Service Area',
} as const

export type AiKnowledgeModule =
  (typeof AI_KNOWLEDGE_MODULE)[keyof typeof AI_KNOWLEDGE_MODULE]

export const AI_KNOWLEDGE_CATEGORY = {
  GENERAL: 'general',
  PAYMENT: 'payment',
  POLICY: 'policy',
  REWARDS: 'rewards',
  VERIFICATION: 'verification',
  GUIDELINES: 'guidelines',
  SAFETY: 'safety',
  FARES: 'fares',
  TROUBLESHOOTING: 'troubleshooting',
  FAQ: 'faq',
} as const

export type AiKnowledgeCategory =
  (typeof AI_KNOWLEDGE_CATEGORY)[keyof typeof AI_KNOWLEDGE_CATEGORY]

export const AI_KNOWLEDGE_TAG = {
  DRIVER: 'driver',
  PASSENGER: 'passenger',
  PAYOUT: 'payout',
  BOOKING: 'booking',
  CANCELLATION: 'cancellation',
  REGISTRATION: 'registration',
  DOCUMENT_UPLOAD: 'document_upload',
  HELP: 'help',
  RULES: 'rules',
  PROMO: 'promo',
  SECURITY: 'security',
  EMERGENCY: 'emergency',
  VEHICLE_APPROVAL: 'vehicle_approval',
  IMPORTED: 'imported',
  MARKDOWN: 'markdown',
} as const

export type AiKnowledgeTag = (typeof AI_KNOWLEDGE_TAG)[keyof typeof AI_KNOWLEDGE_TAG]

export interface AiSupportUserRef {
  _id: string
  email?: string
  name?: string
}

export interface AiSupportWritePayload {
  title: string
  module: AiKnowledgeModule
  category: AiKnowledgeCategory
  content: string
  tags: AiKnowledgeTag[]
  keywords: string[]
  priority: number
  aiEnabled: boolean
  visibility: AiSupportVisibility
  allowedRoles: AiSupportRole[]
  changeLog: string
}

export interface AiSupportItem {
  _id: string
  title: string
  module: AiKnowledgeModule | string
  category: AiKnowledgeCategory | string
  content: string
  searchableContent?: string
  tags: Array<AiKnowledgeTag | string>
  keywords: string[]
  language?: string
  priority: number
  version?: number
  isActive?: boolean
  aiEnabled: boolean
  visibility: AiSupportVisibility
  status: AiSupportStatus
  allowedRoles: AiSupportRole[]
  previousVersionId?: string
  publishedAt?: string
  publishedBy?: string
  changeLog?: string
  isLatest?: boolean
  createdBy?: AiSupportUserRef | string
  updatedBy?: AiSupportUserRef | string
  createdAt?: string
  updatedAt?: string
  isDeleted?: boolean
}

export interface AiSupportQueryParams {
  page?: number
  limit?: number
  searchTerm?: string
  status?: string
  visibility?: string
  module?: string
  category?: string
}

export interface AiSupportListResult {
  data: AiSupportItem[]
  meta: {
    page: number
    limit: number
    totalItems: number
    totalPages: number
  }
}

export interface AiSupportOverviewStats {
  totalArticles?: number
  publishedArticles?: number
  aiEnabledArticles?: number
  draftArticles?: number
  [key: string]: number | undefined
}

export interface UpdateAiSupportArgs {
  id: string
  body: AiSupportWritePayload
}

function mapPagination(response: PaginatedApiResponse<AiSupportItem>): AiSupportListResult {
  const pagination = response.pagination ?? response.meta
  return {
    data: response.data ?? [],
    meta: {
      page: pagination?.page ?? 1,
      limit: pagination?.limit ?? 10,
      totalItems: pagination?.total ?? response.data?.length ?? 0,
      totalPages: pagination?.totalPage ?? 1,
    },
  }
}

export const aiSupportApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    aiSupportOverviewStats: builder.query<AiSupportOverviewStats, void>({
      query: () => ({
        url: '/admin/ai-support/dashboard/stats',
        method: 'GET',
      }),
      transformResponse: (response: ApiResponse<AiSupportOverviewStats>) => response.data,
      providesTags: [{ type: 'AiSupport', id: 'STATS' }],
    }),

    getAiSupportList: builder.query<AiSupportListResult, AiSupportQueryParams | void>({
      query: ({
        page = 1,
        limit = 10,
        searchTerm,
        status,
        visibility,
        module,
        category,
      } = {}) => ({
        url: '/admin/ai-support/knowledge',
        method: 'GET',
        params: cleanObject({
          page,
          limit,
          searchTerm: searchTerm?.trim(),
          status,
          visibility,
          module,
          category,
        }),
      }),
      transformResponse: (response: PaginatedApiResponse<AiSupportItem>) =>
        mapPagination(response),
      providesTags: (result) =>
        result
          ? [
              ...result.data.map(({ _id }) => ({ type: 'AiSupport' as const, id: _id })),
              { type: 'AiSupport', id: 'LIST' },
            ]
          : [{ type: 'AiSupport', id: 'LIST' }],
    }),

    createAiSupport: builder.mutation<AiSupportItem, AiSupportWritePayload>({
      query: (body) => ({
        url: '/admin/ai-support/knowledge',
        method: 'POST',
        body,
      }),
      transformResponse: (response: ApiResponse<AiSupportItem>) => response.data,
      invalidatesTags: [
        { type: 'AiSupport', id: 'LIST' },
        { type: 'AiSupport', id: 'STATS' },
      ],
    }),

    updateAiSupport: builder.mutation<AiSupportItem, UpdateAiSupportArgs>({
      query: ({ id, body }) => ({
        url: `/admin/ai-support/knowledge/${id}`,
        method: 'PATCH',
        body,
      }),
      transformResponse: (response: ApiResponse<AiSupportItem>) => response.data,
      invalidatesTags: (_res, _err, { id }) => [
        { type: 'AiSupport', id },
        { type: 'AiSupport', id: 'LIST' },
        { type: 'AiSupport', id: 'STATS' },
      ],
    }),

    deleteAiSupport: builder.mutation<void, string>({
      query: (id) => ({
        url: `/admin/ai-support/knowledge/${id}`,
        method: 'DELETE',
      }),
      invalidatesTags: (_res, _err, id) => [
        { type: 'AiSupport', id },
        { type: 'AiSupport', id: 'LIST' },
        { type: 'AiSupport', id: 'STATS' },
      ],
    }),
  }),
})

export const {
  useAiSupportOverviewStatsQuery,
  useGetAiSupportListQuery,
  useCreateAiSupportMutation,
  useUpdateAiSupportMutation,
  useDeleteAiSupportMutation,
} = aiSupportApi
