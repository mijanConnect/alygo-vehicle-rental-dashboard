export const DEFAULT_RESERVATION_TYPE_FILTER = ''

export function reservationTypeFilterPath(type: string) {
  return type ? `/reservations?type=${type}` : '/reservations'
}

export const LEGACY_RESERVATION_PATHS: Record<string, string> = {
  '/reservations/scheduled': 'scheduled',
  '/reservations/airport': 'airport',
  '/reservations/events': 'event',
}
