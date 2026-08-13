import { baseApi } from '@/redux/baseApi'
import '@/redux/api/authApi' // injectEndpoints — must load before store boots
import '@/redux/api/dashboardOverviewApi'
import '@/redux/api/liveTripApi'
import '@/redux/api/cancellationApiReason'
import '@/redux/api/cancellationAnalyticsApi'
import '@/redux/api/cancellationPolicyApi'
import '@/redux/api/driverManagementApi'
import '@/redux/api/passengersApi'
import '@/redux/api/tiersManagementsApi'
import '@/redux/api/finalcialCenter'
import '@/redux/api/rideCategoriesApi'
import '@/redux/api/driverRewardManagementApi'
import '@/redux/api/dynamicPricingApi'
import '@/redux/api/drivingHoursApi'
import '@/redux/api/lostandfound/lostAndFoundApi'
import '@/redux/api/tripReportApi'
import '@/redux/api/areaServiceApi'
import '@/redux/api/roleBaseAccessApi'
import '@/redux/api/cmsManageApi'
import { api } from '@/services/api'
import { cancellationApi } from '@/services/cancellationApi'
import { lostFoundApi } from '@/services/lostFoundApi'
import { driverRewardsApi } from '@/services/driverRewardsApi'
import { tripCompletionReviewApi } from '@/services/tripCompletionReviewApi'
import { drivingHoursApi } from '@/services/drivingHoursApi'
import { operationsPolicyApi } from '@/services/operationsPolicyApi'
import { stateActivationApi } from '@/services/stateActivationApi'
import { airportQueueApi } from '@/services/airportQueueApi'
import { safetyIncidentApi } from '@/services/safetyIncidentApi'
import { backgroundCheckFeeApi } from '@/services/backgroundCheckFeeApi'
import { communicationApi } from '@/services/communicationApi'
import { driverVerificationApi } from '@/services/driverVerificationApi'
import { rideCategoryApi } from '@/services/rideCategoryApi'
import { vehicleEligibilityApi } from '@/services/vehicleEligibilityApi'
import { complianceCenterApi } from '@/services/complianceCenterApi'
import { driverBonusApi } from '@/services/driverBonusApi'

/**
 * Register every RTK Query API once here.
 * New API → add to this array only (store picks up reducer + middleware automatically).
 *
 * Prefer migrating domain endpoints into `baseApi.injectEndpoints()` over time
 * so this list shrinks toward just `[baseApi]`.
 */
export const apis = [
  baseApi,
  api,
  cancellationApi,
  lostFoundApi,
  driverRewardsApi,
  tripCompletionReviewApi,
  drivingHoursApi,
  operationsPolicyApi,
  stateActivationApi,
  airportQueueApi,
  safetyIncidentApi,
  backgroundCheckFeeApi,
  communicationApi,
  driverVerificationApi,
  rideCategoryApi,
  vehicleEligibilityApi,
  complianceCenterApi,
  driverBonusApi,
] as const
