import { NAVIGATION } from '@/constants/navigation'

/** Friendly labels for RBAC modules (sidebar-style names for the UI). */
const MODULE_LABELS: Record<string, string> = {
  adminrewards: 'Driver Rewards Management',
  adminRewards: 'Driver Rewards Management',
  auth: 'Authentication',
  banner: 'Banner Management',
  banners: 'Banner Management',
  broadcast: 'Broadcasts',
  call: 'Calls',
  cancellationanalytics: 'Cancellation Analytics',
  cancellationAnalytics: 'Cancellation Analytics',
  cancellationreason: 'Cancellation Reasons',
  cancellationReason: 'Cancellation Reasons',
  servicecategory: 'Ride Categories',
  serviceCategory: 'Ride Categories',
  stripe: 'Stripe / Payments',
  support: 'Support',
  surgerule: 'Surge Rules',
  surgeRule: 'Surge Rules',
  systemconfiguration: 'System Configuration',
  systemConfiguration: 'System Configuration',
  tier: 'Tier Management',
  tracking: 'Live Tracking',
  tripreport: 'Trip Reports',
  tripReport: 'Trip Reports',
  user: 'Users',
  users: 'Users',
  driver: 'Driver Management',
  drivers: 'Driver Management',
  passenger: 'Passenger Management',
  passengers: 'Passenger Management',
  dashboard: 'Dashboard',
  operations: 'Operations',
  communication: 'Broadcasts',
  broadcasts: 'Broadcasts',
  broadcast: 'Broadcasts',
  aisupport: 'AI Support',
  aiSupport: 'AI Support',
  events: 'Events Management',
  holidays: 'Holiday Management',
  peakhours: 'Peak Hours Management',
  peakHours: 'Peak Hours Management',
  compliance: 'Compliance',
  pricing: 'Dynamic Pricing',
  reservations: 'Reservations',
  locations: 'Location Management',
  finance: 'Financial Center',
  analytics: 'Analytics Center',
  settings: 'System Settings',
  lostandfound: 'Lost & Found',
  lostAndFound: 'Lost & Found',
}

function titleFromKey(value: string) {
  return value
    .replace(/([a-z])([A-Z])/g, '$1 $2')
    .replace(/[_-]+/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
    .replace(/\b\w/g, (c) => c.toUpperCase())
}

function flattenNavLabels(items = NAVIGATION): Map<string, string> {
  const map = new Map<string, string>()
  const walk = (list: typeof NAVIGATION) => {
    for (const item of list) {
      map.set(item.key.toLowerCase(), item.label)
      map.set(item.key.replace(/-/g, '').toLowerCase(), item.label)
      if (item.children?.length) walk(item.children)
    }
  }
  walk(items)
  return map
}

const NAV_LABELS = flattenNavLabels()

export function getPermissionDisplayName(module: string, permissionName?: string) {
  if (MODULE_LABELS[module]) return MODULE_LABELS[module]

  const key = module.toLowerCase()
  if (MODULE_LABELS[key]) return MODULE_LABELS[key]

  const fromNav =
    NAV_LABELS.get(key) ||
    NAV_LABELS.get(key.replace(/s$/, '')) ||
    NAV_LABELS.get(`${key}s`)
  if (fromNav) return fromNav

  if (permissionName && MODULE_LABELS[permissionName]) return MODULE_LABELS[permissionName]

  return titleFromKey(module || permissionName || 'Permission')
}
