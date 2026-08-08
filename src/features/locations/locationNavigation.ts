export const LOCATION_TAB_KEYS = [
  'countries',
  'states',
  'cities',
  'zones',
  'airports',
  'limits',
] as const

export type LocationTabKey = (typeof LOCATION_TAB_KEYS)[number]

export const LOCATION_TAB_LABELS: Record<LocationTabKey, string> = {
  countries: 'Countries',
  states: 'States',
  cities: 'Cities',
  zones: 'Zones',
  airports: 'Airports',
  limits: 'Capacity Limits',
}

export const DEFAULT_LOCATION_TAB: LocationTabKey = 'countries'

export function locationTabPath(tab: LocationTabKey) {
  return `/locations?tab=${tab}`
}

export const LEGACY_LOCATION_PATHS: Record<string, LocationTabKey> = {
  '/locations/countries': 'countries',
  '/locations/states': 'states',
  '/locations/cities': 'cities',
  '/locations/zones': 'zones',
  '/locations/airports': 'airports',
  '/locations/limits': 'limits',
}
