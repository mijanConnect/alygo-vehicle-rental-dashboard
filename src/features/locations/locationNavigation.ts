export const LOCATION_TAB_KEYS = ['states', 'cities', 'zones', 'airports'] as const

export type LocationTabKey = (typeof LOCATION_TAB_KEYS)[number]

export const LOCATION_TAB_LABELS: Record<LocationTabKey, string> = {
  states: 'States',
  cities: 'Cities',
  zones: 'Zones',
  airports: 'Airports',
}

export const DEFAULT_LOCATION_TAB: LocationTabKey = 'states'

export function locationTabPath(tab: LocationTabKey) {
  return `/locations?tab=${tab}`
}

export const LEGACY_LOCATION_PATHS: Record<string, LocationTabKey> = {
  '/locations/states': 'states',
  '/locations/cities': 'cities',
  '/locations/zones': 'zones',
  '/locations/airports': 'airports',
}
