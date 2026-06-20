import type { AdminRole, Permission, RideCategory } from '@/types'

export const APP_NAME = 'Alygo Operations'
export const APP_LOGO = '/alygo-logo.png'
export const APP_TAGLINE = 'Enterprise Rideshare Operations'

export const API_BASE_URL = import.meta.env.VITE_API_BASE_URL ?? 'http://localhost:4000/api'
export const SOCKET_URL = import.meta.env.VITE_SOCKET_URL ?? 'http://localhost:4000'
export const GOOGLE_MAPS_API_KEY = import.meta.env.VITE_GOOGLE_MAPS_API_KEY ?? ''

export const STORAGE_KEYS = {
  token: 'alygo_admin_token',
  user: 'alygo_admin_user',
  rememberEmail: 'alygo_remember_email',
} as const

export const ROLE_LABELS: Record<AdminRole, string> = {
  super_admin: 'Super Admin',
  operations_manager: 'Operations Manager',
  compliance_manager: 'Compliance Manager',
  finance_manager: 'Finance Manager',
  support_agent: 'Support Agent',
}

export const ROLE_PERMISSIONS: Record<AdminRole, Permission[]> = {
  super_admin: [
    'dashboard.view',
    'operations.view',
    'operations.manage',
    'drivers.view',
    'drivers.manage',
    'passengers.view',
    'passengers.manage',
    'compliance.view',
    'compliance.manage',
    'eligibility.view',
    'eligibility.manage',
    'pricing.view',
    'pricing.manage',
    'reservations.view',
    'reservations.manage',
    'reservations.create_manual',
    'finance.view',
    'finance.manage',
    'analytics.view',
    'settings.view',
    'settings.manage',
    'communication.view',
    'communication.manage',
  ],
  operations_manager: [
    'dashboard.view',
    'operations.view',
    'operations.manage',
    'communication.view',
    'drivers.view',
    'drivers.manage',
    'passengers.view',
    'passengers.manage',
    'reservations.view',
    'reservations.manage',
    'reservations.create_manual',
    'analytics.view',
  ],
  compliance_manager: [
    'dashboard.view',
    'drivers.view',
    'compliance.view',
    'compliance.manage',
    'eligibility.view',
    'eligibility.manage',
    'analytics.view',
    'communication.view',
  ],
  finance_manager: [
    'dashboard.view',
    'finance.view',
    'finance.manage',
    'analytics.view',
  ],
  support_agent: [
    'dashboard.view',
    'drivers.view',
    'passengers.view',
    'passengers.manage',
    'operations.view',
    'communication.view',
    'communication.manage',
  ],
}

export const RIDE_CATEGORY_LABELS: Record<RideCategory, string> = {
  standard: 'Standard',
  comfort: 'Comfort',
  xl: 'XL',
  pet: 'Pet',
  priority: 'Priority',
  black: 'Black',
  black_suv: 'Black SUV',
}

export const COMPLIANCE_STATUS_COLORS = {
  approved: 'success',
  pending: 'processing',
  expiring_soon: 'warning',
  expired: 'error',
  rejected: 'error',
} as const

export const DRIVER_STATUS_COLORS = {
  active: 'success',
  pending: 'processing',
  suspended: 'warning',
  deactivated: 'default',
  rejected: 'error',
} as const

export const DEMO_CREDENTIALS = {
  email: 'admin@alygo.com',
  password: 'admin123',
}
