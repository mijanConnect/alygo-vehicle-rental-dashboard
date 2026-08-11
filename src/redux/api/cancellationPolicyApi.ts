import { baseApi } from '@/redux/baseApi'

interface ApiResponse<T> {
  success: boolean
  message: string
  data: T
}

export interface FeeShareRule {
  cancellationFee: number
  platformShare: number
  driverCompensation?: number
}

export interface PassengerCancellationPolicy {
  beforeDriverAccepted: FeeShareRule
  afterDriverAccepted: FeeShareRule
  afterDriverArrived: FeeShareRule
}

export interface DriverCancellationPolicy {
  afterAccept: FeeShareRule
  excessiveCancellation: FeeShareRule
  excessiveCancellationThreshold: number
}

export interface CancellationPolicy {
  _id: string
  passenger: PassengerCancellationPolicy
  driver: DriverCancellationPolicy
  isDeleted?: boolean
  createdAt?: string
  updatedAt?: string
}

/** Body for update — driver stages omit driverCompensation per API contract */
export interface UpdateCancellationPolicyBody {
  passenger: {
    beforeDriverAccepted: Required<Pick<FeeShareRule, 'cancellationFee' | 'platformShare' | 'driverCompensation'>>
    afterDriverAccepted: Required<Pick<FeeShareRule, 'cancellationFee' | 'platformShare' | 'driverCompensation'>>
    afterDriverArrived: Required<Pick<FeeShareRule, 'cancellationFee' | 'platformShare' | 'driverCompensation'>>
  }
  driver: {
    afterAccept: Pick<FeeShareRule, 'cancellationFee' | 'platformShare'>
    excessiveCancellation: Pick<FeeShareRule, 'cancellationFee' | 'platformShare'>
    excessiveCancellationThreshold: number
  }
}

export const cancellationPolicyApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getActiveCancellationPolicy: builder.query<CancellationPolicy, void>({
      query: () => ({
        url: '/cancellation-policies/active',
        method: 'GET',
      }),
      transformResponse: (response: ApiResponse<CancellationPolicy>) => response.data,
      providesTags: ['CancellationPolicy'],
    }),

    updateActiveCancellationPolicy: builder.mutation<
      CancellationPolicy,
      UpdateCancellationPolicyBody
    >({
      query: (body) => ({
        url: '/cancellation-policies',
        method: 'PATCH',
        body,
      }),
      transformResponse: (response: ApiResponse<CancellationPolicy>) => response.data,
      invalidatesTags: ['CancellationPolicy'],
    }),
  }),
})

export const {
  useGetActiveCancellationPolicyQuery,
  useUpdateActiveCancellationPolicyMutation,
} = cancellationPolicyApi
