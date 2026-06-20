/** Exact legacy paths → redirect targets (pathname only; query preserved separately). */
export const LEGACY_ROUTE_REDIRECTS: Record<string, string> = {
  '/operations/ride-monitoring': '/operations/live-trips',
  '/operations/destination-filters': '/drivers/tiers?tab=configuration',
  '/operations/destination-filter-analytics': '/drivers/tiers?tab=overview',
  '/operations/destination-filters/analytics': '/drivers/tiers?tab=overview',
  '/operations/driver-capacity': '/drivers',
  '/operations/driver-capacity-management': '/drivers',
  '/operations/active-drivers': '/drivers?tab=active',
  '/operations/active-passengers': '/passengers?tab=active',
  '/drivers/waitlist': '/drivers',
  '/drivers/capacity': '/drivers',
  '/drivers/driver-capacity': '/drivers',
  '/driver-capacity': '/drivers',
  '/drivers/rewards/tier-management': '/drivers/tiers',
  '/driver-rewards/tier-management': '/drivers/tiers',
  '/operations/safety-incidents/settings': '/settings/safety',
  '/operations/safety-incidents/categories': '/settings/safety',
  '/operations/safety-incidents/cases': '/operations/safety-incidents',
  '/operations/safety-incidents/analytics': '/operations/safety-incidents',
  '/operations/policy-center/driving-hours': '/operations/driving-hours',
  '/operations/policy-center/destination-filters': '/drivers/tiers?tab=configuration',
  '/demand': '/demand-intelligence',
  '/demand/trends': '/demand-intelligence',
  '/demand/forecasting': '/demand-intelligence',
  '/demand/heat-maps': '/demand-intelligence',
  '/demand/earnings-forecasts': '/demand-intelligence',
  '/demand/event-intelligence': '/demand-intelligence',
  '/compliance/background-checks': '/compliance?tab=background-checks',
  '/compliance/background-check-fees': '/compliance?tab=fees',
  '/compliance/documents': '/compliance?tab=documents',
  '/compliance/restrictions': '/compliance?tab=restrictions',
  '/eligibility/rules': '/vehicle-eligibility',
  '/eligibility/categories': '/vehicle-eligibility',
  '/eligibility/assignments': '/vehicle-eligibility',
  '/eligibility/premium-vehicles': '/vehicle-eligibility',
  '/ride-categories/legacy': '/ride-categories',
  '/pricing/rules': '/pricing?tab=rules',
  '/pricing/surge-zones': '/pricing?tab=zones',
  '/pricing/surge-history': '/pricing?tab=analytics',
  '/reservations/scheduled': '/reservations?type=scheduled',
  '/reservations/airport': '/reservations?type=airport',
  '/reservations/events': '/reservations?type=event',
  '/locations/states': '/locations?tab=states',
  '/locations/cities': '/locations?tab=cities',
  '/locations/zones': '/locations?tab=zones',
  '/locations/airports': '/locations?tab=airports',
  '/locations/state-activation': '/locations?tab=states',
  '/locations/airport-queue': '/locations?tab=airports',
  '/finance/revenue': '/finance?tab=revenue',
  '/finance/payouts': '/finance?tab=payouts',
  '/finance/wallets': '/finance?tab=wallets',
  '/finance/transactions': '/finance?tab=transactions',
  '/analytics/drivers': '/analytics?tab=drivers',
  '/analytics/passengers': '/analytics?tab=passengers',
  '/analytics/revenue': '/analytics?tab=revenue',
  '/analytics/demand': '/analytics?tab=demand',
  '/analytics/compliance': '/analytics?tab=compliance',
}

/** Prefix matches for removed module trees; first match wins. */
export const LEGACY_ROUTE_PREFIX_REDIRECTS: Array<{ prefix: string; target: string }> = [
  { prefix: '/demand/', target: '/demand-intelligence' },
  { prefix: '/categories/', target: '/ride-categories' },
  { prefix: '/communication/', target: '/communication' },
]

const REMOVED_MODULE_PREFIXES = [
  '/operations/ride-monitoring',
  '/operations/destination-filter',
  '/operations/driver-capacity',
  '/operations/passenger-warning',
  '/drivers/waitlist',
  '/drivers/capacity',
  '/drivers/driver-capacity',
  '/driver-capacity',
  '/operations/safety-incidents/',
  '/communication/templates',
  '/communication/analytics',
  '/communication/internal-notes',
]

function normalizePathname(pathname: string) {
  if (pathname.length > 1 && pathname.endsWith('/')) {
    return pathname.slice(0, -1)
  }
  return pathname
}

export function resolveLegacyRouteRedirect(pathname: string): string | null {
  const normalized = normalizePathname(pathname)

  const exact = LEGACY_ROUTE_REDIRECTS[normalized]
  if (exact) return exact

  for (const { prefix, target } of LEGACY_ROUTE_PREFIX_REDIRECTS) {
    if (normalized.startsWith(prefix)) return target
  }

  for (const prefix of REMOVED_MODULE_PREFIXES) {
    if (normalized === prefix || normalized.startsWith(`${prefix}/`)) {
      if (prefix.includes('destination-filter')) {
        return '/drivers/tiers?tab=configuration'
      }
      if (prefix.includes('ride-monitoring')) {
        return '/operations/live-trips'
      }
      if (prefix.includes('driver-capacity') || prefix.includes('waitlist')) {
        return '/drivers'
      }
      if (prefix.includes('safety-incidents')) {
        if (normalized.includes('settings') || normalized.includes('categories')) {
          return '/settings/safety'
        }
        return '/operations/safety-incidents'
      }
      if (prefix.startsWith('/communication/')) {
        return '/communication'
      }
      return '/'
    }
  }

  return null
}
