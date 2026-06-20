export const PASSENGER_TAB_KEYS = [
  'overview',
  'active',
  'complaints',
  'refunds',
  'suspended',
] as const

export type PassengerTabKey = (typeof PASSENGER_TAB_KEYS)[number]

export const PASSENGER_TAB_LABELS: Record<PassengerTabKey, string> = {
  overview: 'Overview',
  active: 'Live Activity',
  complaints: 'Complaints',
  refunds: 'Refunds',
  suspended: 'Suspended Passengers',
}

export const DEFAULT_PASSENGER_TAB: PassengerTabKey = 'overview'

export function passengersTabPath(tab: PassengerTabKey) {
  return `/passengers?tab=${tab}`
}
