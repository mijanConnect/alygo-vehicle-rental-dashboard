import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react'
import type { BonusCampaign, BonusCampaignListParams, BonusCampaignListResponse, BonusCampaignFormValues } from '@/types/driverBonus'
import { mockBonusCampaigns } from '@/services/mock/driverBonusData'

// Simulated delay
const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms))

export const driverBonusApi = createApi({
  reducerPath: 'driverBonusApi',
  baseQuery: fetchBaseQuery({ baseUrl: '/' }), // Using mock implementation
  tagTypes: ['BonusCampaigns'],
  endpoints: (builder) => ({
    getBonusCampaigns: builder.query<BonusCampaignListResponse, BonusCampaignListParams | void>({
      queryFn: async (params) => {
        await delay(500)
        let filtered = [...mockBonusCampaigns]

        if (params?.search) {
          const s = params.search.toLowerCase()
          filtered = filtered.filter((c) => c.name.toLowerCase().includes(s))
        }

        if (params?.status) {
          filtered = filtered.filter((c) => c.status === params.status)
        }

        const page = params?.page ?? 1
        const pageSize = params?.pageSize ?? 10
        const start = (page - 1) * pageSize
        const end = start + pageSize

        return {
          data: {
            data: filtered.slice(start, end),
            total: filtered.length,
            page,
            pageSize,
          },
        }
      },
      providesTags: ['BonusCampaigns'],
    }),

    createBonusCampaign: builder.mutation<BonusCampaign, BonusCampaignFormValues>({
      queryFn: async (campaign) => {
        await delay(500)
        
        const newCampaign: BonusCampaign = {
          ...campaign,
          id: `BC-${Math.floor(Math.random() * 1000).toString().padStart(3, '0')}`,
          budgetUsed: 0,
        }
        
        mockBonusCampaigns.unshift(newCampaign)
        return { data: newCampaign }
      },
      invalidatesTags: ['BonusCampaigns'],
    }),

    updateBonusCampaign: builder.mutation<BonusCampaign, Partial<BonusCampaignFormValues> & { id: string }>({
      queryFn: async ({ id, ...updates }) => {
        await delay(500)
        
        const index = mockBonusCampaigns.findIndex((c) => c.id === id)
        if (index === -1) {
          return { error: { status: 404, data: 'Not found' } as any }
        }

        mockBonusCampaigns[index] = {
          ...mockBonusCampaigns[index],
          ...updates,
        }

        return { data: mockBonusCampaigns[index] }
      },
      invalidatesTags: ['BonusCampaigns'],
    }),

    deleteBonusCampaign: builder.mutation<{ success: boolean; id: string }, string>({
      queryFn: async (id) => {
        await delay(500)
        
        const index = mockBonusCampaigns.findIndex((c) => c.id === id)
        if (index === -1) {
          return { error: { status: 404, data: 'Not found' } as any }
        }

        mockBonusCampaigns.splice(index, 1)
        return { data: { success: true, id } }
      },
      invalidatesTags: ['BonusCampaigns'],
    }),

    toggleBonusCampaignStatus: builder.mutation<BonusCampaign, string>({
      queryFn: async (id) => {
        await delay(500)
        
        const index = mockBonusCampaigns.findIndex((c) => c.id === id)
        if (index === -1) {
          return { error: { status: 404, data: 'Not found' } as any }
        }

        const currentStatus = mockBonusCampaigns[index].status
        let newStatus: BonusCampaign['status'] = 'disabled'
        
        if (currentStatus === 'disabled') {
          newStatus = 'active'
        } else if (currentStatus === 'scheduled') {
           newStatus = 'disabled'
        }

        mockBonusCampaigns[index] = {
          ...mockBonusCampaigns[index],
          status: newStatus,
        }

        return { data: mockBonusCampaigns[index] }
      },
      invalidatesTags: ['BonusCampaigns'],
    }),
  }),
})

export const {
  useGetBonusCampaignsQuery,
  useCreateBonusCampaignMutation,
  useUpdateBonusCampaignMutation,
  useDeleteBonusCampaignMutation,
  useToggleBonusCampaignStatusMutation,
} = driverBonusApi
