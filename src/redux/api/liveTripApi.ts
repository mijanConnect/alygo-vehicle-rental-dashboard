import { baseApi } from "../baseApi"


// Signup Bonus data type from API
export interface SignupBonus {
    _id: string
    key: string
    __v: number
    createdAt: string
    updatedAt: string
    value: number
}

// API Response type
interface SignupBonusResponse {
    success: boolean
    message: string
    data: SignupBonus
}

// Update payload type
interface UpdateSignupBonusPayload {
    value: number
}

const liveTripApi = baseApi.injectEndpoints({
    endpoints: (builder) => ({
        getLiveTrip: builder.query<LiveTripResponse, void>({
            query: () => ({
                url: '/admin/live-trip',
                method: 'GET',
            }),
            providesTags: ['LiveTrip'],
        }),
    }),
})

export const { useGetSignupBonusQuery, useUpdateSignupBonusMutation } = signupBonusApi
