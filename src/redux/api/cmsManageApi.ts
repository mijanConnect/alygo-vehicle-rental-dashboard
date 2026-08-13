import { baseApi } from '@/redux/baseApi'

interface ApiResponse<T> {
  success: boolean
  message: string
  data: T
}

export type CmsRuleType = 'terms' | 'privacy' | 'about'

export interface CmsRuleItem {
  id: string
  content: string
  type?: CmsRuleType
  createdAt?: string
  updatedAt?: string
}

export interface CreateCmsPayload {
  type: CmsRuleType
  content: string
}

function normalizeRule(raw: Record<string, unknown>): CmsRuleItem {
  return {
    id: String(raw.id ?? raw._id ?? ''),
    content: String(raw.content ?? ''),
    type: raw.type as CmsRuleType | undefined,
    createdAt: raw.createdAt ? String(raw.createdAt) : undefined,
    updatedAt: raw.updatedAt ? String(raw.updatedAt) : undefined,
  }
}

export const cmsManageApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getCmsByType: builder.query<CmsRuleItem, CmsRuleType>({
      query: (type) => ({
        url: `/rules/${type}`,
        method: 'GET',
      }),
      transformResponse: (response: ApiResponse<Record<string, unknown>>) =>
        normalizeRule(response.data ?? {}),
      providesTags: (_res, _err, type) => [{ type: 'Cms', id: type }],
    }),

    createCms: builder.mutation<
      { success: boolean; message: string },
      CreateCmsPayload
    >({
      query: (cms) => ({
        url: '/rules',
        method: 'POST',
        body: cms,
      }),
      transformResponse: (response: ApiResponse<unknown>) => ({
        success: response.success,
        message: response.message,
      }),
      invalidatesTags: (_res, _err, arg) => [{ type: 'Cms', id: arg.type }],
    }),
  }),
})

export const { useGetCmsByTypeQuery, useCreateCmsMutation } = cmsManageApi
