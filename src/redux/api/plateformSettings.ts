import { baseApi } from "../baseApi";

const plateformSettingsApi = baseApi.injectEndpoints({
    endpoints: (builder) => ({
        getPlateformSettings: builder.query<PlateformSettingsItem, void>({
            query: () => ({
                url: '/plateform-settings',
                method: 'GET',
            }),
            providesTags: ['PlateformSettings'],
        }),
        updatePlateformSettings: builder.mutation<PlateformSettingsItem, PlateformSettingsWritePayload>({
            query: (body) => ({
                url: '/plateform-settings',
                method: 'PATCH',
                body,
            }),
            providesTags: ['PlateformSettings'],
        }),
    }),
})

export const {
    useGetPlateformSettingsQuery,
    useUpdatePlateformSettingsMutation,
} = plateformSettingsApi