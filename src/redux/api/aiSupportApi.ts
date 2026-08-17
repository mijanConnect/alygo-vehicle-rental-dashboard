import { baseApi } from "../baseApi";

const aiSupportApi = baseApi.injectEndpoints({
    endpoints: (builder) => ({
        aiSupportOverviewStats: builder.query<AiSupportOverviewStats, void>({
            query: () => ({
                url: '/admin/ai-support/dashboard/stats',
                method: 'GET',
            }),
            providesTags: ['AiSupport'],
        }),
        getAiSupport: builder.query<AiSupport[], void>({
            query: () => ({
                url: '/admin/ai-support/knowledge',
                method: 'GET',
            }),
            providesTags: ['AiSupport'],
        }),
        createAiSupport: builder.mutation<AiSupport, AiSupport>({
            query: (aiSupport) => ({
                url: '/admin/ai-support/knowledge',
                method: 'POST',
                body: aiSupport,
            }),
            invalidatesTags: ['AiSupport'],
        }),
        updateAiSupport: builder.mutation<AiSupport, AiSupport>({
            query: (aiSupport) => ({
                url: `/admin/ai-support/knowledge/${aiSupport._id}`,
                method: 'PATCH',
                body: aiSupport,
            }),
            invalidatesTags: ['AiSupport'],
        }),
        deleteAiSupport: builder.mutation<AiSupport, AiSupport>({
            query: (aiSupport) => ({
                url: `/admin/ai-support/knowledge/${aiSupport._id}`,
                method: 'DELETE',
                body: aiSupport,
            }),
            invalidatesTags: ['AiSupport'],
        }),
    }),
})

export const { useAiSupportOverviewStatsQuery, useGetAiSupportQuery, useCreateAiSupportMutation, useUpdateAiSupportMutation, useDeleteAiSupportMutation } = aiSupportApi;