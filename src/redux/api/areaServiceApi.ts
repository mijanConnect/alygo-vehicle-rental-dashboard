import { baseApi } from '@/redux/baseApi'
import { cleanObject } from '@/utils/cleanObject'

interface ApiResponse<T> {
  success: boolean
  message: string
  data: T
  meta?: {
    page: number
    limit: number
    total: number
    totalPage: number
  }
}

export type ServiceAreaType =
  | 'global'
  | 'country'
  | 'state'
  | 'city'
  | 'zone'
  | 'airport'

export interface ServiceAreaLocation {
  type: 'Point'
  coordinates: [number, number] // [lng, lat]
}

/** Parent refs may be ObjectId strings or populated documents */
export type ServiceAreaParentRef =
  | string
  | null
  | {
      _id: string
      country?: string
      state?: string
      city?: string
      zone?: string
      airport?: string
      type?: ServiceAreaType
    }

export interface ServiceAreaApiItem {
  _id: string
  type: ServiceAreaType
  country?: string
  state?: string
  city?: string
  zone?: string
  airport?: string
  countryId?: ServiceAreaParentRef
  stateId?: ServiceAreaParentRef
  cityId?: ServiceAreaParentRef
  location: ServiceAreaLocation
  maxDrivers?: number
  coverageRadiusKm?: number
  timezone?: string
  status: string
  isDeleted?: boolean
  createdAt: string
  updatedAt: string
}

export interface ServiceAreaRow {
  id: string
  name: string
  type: ServiceAreaType
  status: string
  maxDrivers: number
  coverageRadiusKm: number
  timezone: string
  countryId: string | null
  stateId: string | null
  cityId: string | null
  countryName: string | null
  stateName: string | null
  cityName: string | null
  lng: number
  lat: number
  createdAt: string
  updatedAt: string
}

export interface ServiceAreaListResult {
  data: ServiceAreaRow[]
  meta: {
    page: number
    limit: number
    totalItems: number
    totalPages: number
  }
}

export interface GetServiceAreasParams {
  page?: number
  limit?: number
  searchTerm?: string
  status?: string
  countryId?: string
  stateId?: string
  cityId?: string
}

export interface CreateServiceAreaBody {
  type: ServiceAreaType
  country?: string
  state?: string
  city?: string
  zone?: string
  airport?: string
  countryId?: string
  stateId?: string
  cityId?: string
  location: ServiceAreaLocation
  maxDrivers?: number
  coverageRadiusKm: number
  timezone: string
  status?: string
}

function resolveName(item: ServiceAreaApiItem): string {
  switch (item.type) {
    case 'country':
      return item.country?.trim() || '—'
    case 'state':
      return item.state?.trim() || '—'
    case 'city':
      return item.city?.trim() || '—'
    case 'zone':
      return item.zone?.trim() || '—'
    case 'airport':
      return item.airport?.trim() || '—'
    case 'global':
      return 'Global'
    default:
      return '—'
  }
}

function resolveParentId(ref: ServiceAreaParentRef | undefined): string | null {
  if (!ref) return null
  if (typeof ref === 'string') return ref
  return ref._id ?? null
}

function resolveParentName(
  ref: ServiceAreaParentRef | undefined,
  kind: 'country' | 'state' | 'city',
): string | null {
  if (!ref || typeof ref === 'string') return null
  const value =
    kind === 'country' ? ref.country : kind === 'state' ? ref.state : ref.city
  const trimmed = value?.trim()
  return trimmed || null
}

function mapServiceArea(item: ServiceAreaApiItem): ServiceAreaRow {
  const [lng = 0, lat = 0] = item.location?.coordinates ?? [0, 0]

  return {
    id: item._id,
    name: resolveName(item),
    type: item.type,
    status: item.status,
    maxDrivers: item.maxDrivers ?? 0,
    coverageRadiusKm: item.coverageRadiusKm ?? 0,
    timezone: item.timezone ?? 'UTC',
    countryId: resolveParentId(item.countryId),
    stateId: resolveParentId(item.stateId),
    cityId: resolveParentId(item.cityId),
    countryName: resolveParentName(item.countryId, 'country') || item.country?.trim() || null,
    stateName: resolveParentName(item.stateId, 'state') || item.state?.trim() || null,
    cityName: resolveParentName(item.cityId, 'city') || item.city?.trim() || null,
    lng,
    lat,
    createdAt: item.createdAt,
    updatedAt: item.updatedAt,
  }
}

function mapListResponse(response: ApiResponse<ServiceAreaApiItem[]>): ServiceAreaListResult {
  const rows = (response.data ?? [])
    .filter((item) => !item.isDeleted)
    .map(mapServiceArea)

  return {
    data: rows,
    meta: {
      page: response.meta?.page ?? 1,
      limit: response.meta?.limit ?? 10,
      totalItems: response.meta?.total ?? rows.length,
      totalPages: response.meta?.totalPage ?? 1,
    },
  }
}

export const areaServiceApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    createServiceArea: builder.mutation<ServiceAreaRow, CreateServiceAreaBody>({
      query: (body) => ({
        url: '/service-areas',
        method: 'POST',
        body,
      }),
      transformResponse: (response: ApiResponse<ServiceAreaApiItem>) =>
        mapServiceArea(response.data),
      invalidatesTags: ['ServiceAreas'],
    }),

    getServiceAreaCountries: builder.query<
      ServiceAreaListResult,
      GetServiceAreasParams | void
    >({
      query: ({ page = 1, limit = 10, searchTerm, status } = {}) => ({
        url: '/service-areas/countries',
        method: 'GET',
        params: cleanObject({
          page,
          limit,
          searchTerm: searchTerm?.trim(),
          status,
        }),
      }),
      transformResponse: mapListResponse,
      providesTags: ['ServiceAreas'],
    }),

    getServiceAreaStates: builder.query<
      ServiceAreaListResult,
      GetServiceAreasParams | void
    >({
      query: ({ page = 1, limit = 10, searchTerm, status, countryId } = {}) => ({
        url: '/service-areas/states',
        method: 'GET',
        params: cleanObject({
          page,
          limit,
          searchTerm: searchTerm?.trim(),
          status,
          countryId,
        }),
      }),
      transformResponse: mapListResponse,
      providesTags: ['ServiceAreas'],
    }),

    getServiceAreaCities: builder.query<
      ServiceAreaListResult,
      GetServiceAreasParams | void
    >({
      query: ({ page = 1, limit = 10, searchTerm, status, stateId } = {}) => ({
        url: '/service-areas/cities',
        method: 'GET',
        params: cleanObject({
          page,
          limit,
          searchTerm: searchTerm?.trim(),
          status,
          stateId,
        }),
      }),
      transformResponse: mapListResponse,
      providesTags: ['ServiceAreas'],
    }),

    getServiceAreaZones: builder.query<
      ServiceAreaListResult,
      GetServiceAreasParams | void
    >({
      query: ({ page = 1, limit = 10, searchTerm, status, cityId } = {}) => ({
        url: '/service-areas/zones',
        method: 'GET',
        params: cleanObject({
          page,
          limit,
          searchTerm: searchTerm?.trim(),
          status,
          cityId,
        }),
      }),
      transformResponse: mapListResponse,
      providesTags: ['ServiceAreas'],
    }),

    getServiceAreaAirports: builder.query<
      ServiceAreaListResult,
      GetServiceAreasParams | void
    >({
      query: ({ page = 1, limit = 10, searchTerm, status, cityId } = {}) => ({
        url: '/service-areas/airports',
        method: 'GET',
        params: cleanObject({
          page,
          limit,
          searchTerm: searchTerm?.trim(),
          status,
          cityId,
        }),
      }),
      transformResponse: mapListResponse,
      providesTags: ['ServiceAreas'],
    }),
  }),
})

export const {
  useCreateServiceAreaMutation,
  useGetServiceAreaCountriesQuery,
  useGetServiceAreaStatesQuery,
  useGetServiceAreaCitiesQuery,
  useGetServiceAreaZonesQuery,
  useGetServiceAreaAirportsQuery,
} = areaServiceApi
