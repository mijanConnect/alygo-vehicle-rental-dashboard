import { baseApi } from "../baseApi";

const helpAndSupportsApi = baseApi.injectEndpoints({
    endpoints: (builder) => ({
        getHelpAndSupportsList: builder.query<HelpAndSupportsListResult, HelpAndSupportsQueryParams | void>({
            query: () => ({
                url: '/supports',
                method: 'GET',
            }),
            providesTags: ['HelpAndSupports'],
        }),
        getSingleHelpAndSupport: builder.query<HelpAndSupportsItem, string>({
            query: (id) => ({
                url: `/supports/${id}`,
                method: 'GET',
            }),
            providesTags: ['HelpAndSupports'],
        }),
        updateHelpAndSupportStatus: builder.mutation<HelpAndSupportsItem, HelpAndSupportsWritePayload>({
            query: ({ id, status }) => ({
                url: `/supports/${id}/review`,
                method: 'PATCH',
                body: { status },
            }),
            providesTags: ['HelpAndSupports'],
        }),
        deleteHelpAndSupport: builder.mutation<HelpAndSupportsItem, string>({
            query: (id) => ({
                url: `/supports/${id}`,
                method: 'DELETE',
            }),
            providesTags: ['HelpAndSupports'],
        }),
    }),
})

export const {
    useGetHelpAndSupportsListQuery,
    useGetSingleHelpAndSupportQuery,
    useUpdateHelpAndSupportStatusMutation,
    useDeleteHelpAndSupportMutation,
} = helpAndSupportsApi