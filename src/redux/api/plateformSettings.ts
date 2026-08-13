import { baseApi } from '@/redux/baseApi'

interface ApiResponse<T> {
  success: boolean
  message: string
  data: T
}

export interface PlateformSettingsWritePayload {
  platformName: string
  currency: string
  isMaintenanceMode: boolean
  supportEmail: string
  contactNumber: string
}

export interface PlateformSettingsItem extends PlateformSettingsWritePayload {
  _id?: string
  isDeleted?: boolean
  createdAt?: string
  updatedAt?: string
}

export const DEFAULT_PLATFORM_SETTINGS: PlateformSettingsWritePayload = {
  platformName: '',
  currency: 'usd',
  isMaintenanceMode: false,
  supportEmail: '',
  contactNumber: '',
}

export const plateformSettingsApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getPlateformSettings: builder.query<PlateformSettingsItem, void>({
      query: () => ({
        url: '/platform-settings',
        method: 'GET',
      }),
      transformResponse: (response: ApiResponse<PlateformSettingsItem>) => response.data,
      providesTags: ['PlatformSettings'],
    }),

    updatePlateformSettings: builder.mutation<
      PlateformSettingsItem,
      PlateformSettingsWritePayload
    >({
      query: (body) => ({
        url: '/platform-settings',
        method: 'PATCH',
        body,
      }),
      transformResponse: (response: ApiResponse<PlateformSettingsItem>) => response.data,
      invalidatesTags: ['PlatformSettings'],
    }),
  }),
})

export const {
  useGetPlateformSettingsQuery,
  useUpdatePlateformSettingsMutation,
} = plateformSettingsApi
