export const DRIVER_TAB_KEYS = [
  'overview',
  'active',
  'pending',
  'suspended',
  'compliance',
] as const

export type DriverTabKey = (typeof DRIVER_TAB_KEYS)[number]

export const DRIVER_TAB_LABELS: Record<DriverTabKey, string> = {
  overview: 'Overview',
  active: 'Online Drivers',
  pending: 'Pending Approval',
  suspended: 'Suspended Drivers',
  compliance: 'Compliance',
}

export const DEFAULT_DRIVER_TAB: DriverTabKey = 'overview'

export function driversTabPath(tab: DriverTabKey) {
  return `/drivers?tab=${tab}`
}
