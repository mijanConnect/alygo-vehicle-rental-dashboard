export const ANALYTICS_TAB_KEYS = [
  'overview',
  'drivers',
  'passengers',
  'revenue',
  'demand',
  'compliance',
] as const

export type AnalyticsTabKey = (typeof ANALYTICS_TAB_KEYS)[number]

export const ANALYTICS_TAB_LABELS: Record<AnalyticsTabKey, string> = {
  overview: 'Overview',
  drivers: 'Driver Analytics',
  passengers: 'Passenger Analytics',
  revenue: 'Revenue Analytics',
  demand: 'Demand Analytics',
  compliance: 'Compliance Analytics',
}

export const DEFAULT_ANALYTICS_TAB: AnalyticsTabKey = 'overview'

export function analyticsTabPath(tab: AnalyticsTabKey) {
  return `/analytics?tab=${tab}`
}

/** Legacy standalone analytics routes consolidated under /analytics */
export const LEGACY_ANALYTICS_PATHS: Record<string, AnalyticsTabKey> = {
  '/analytics/drivers': 'drivers',
  '/analytics/passengers': 'passengers',
  '/analytics/revenue': 'revenue',
  '/analytics/demand': 'demand',
  '/analytics/compliance': 'compliance',
}
