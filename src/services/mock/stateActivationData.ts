import type {
  StateActivationAuditLog,
  StateActivationOverview,
  StateActivationRecord,
  StateActivationSettings,
} from '@/types/stateActivation'

function createState(
  id: string,
  stateCode: string,
  stateName: string,
  status: StateActivationRecord['status'],
  drivers: number,
  passengers: number,
  cities: number,
  settings: Partial<StateActivationSettings> = {},
): StateActivationRecord {
  const defaults: StateActivationSettings = {
    platformActive: status === 'active',
    driverRegistrationEnabled: status !== 'disabled',
    passengerRegistrationEnabled: status !== 'disabled',
    reservationsEnabled: status === 'active',
    airportQueueEnabled: status === 'active',
    dynamicPricingEnabled: status === 'active',
    blackCategoryEnabled: status === 'active',
    blackSuvCategoryEnabled: status === 'active',
  }
  return {
    id,
    stateCode,
    stateName,
    status,
    activeDrivers: drivers,
    activePassengers: passengers,
    citiesCount: cities,
    regionsCount: Math.max(1, Math.floor(cities / 2)),
    lastUpdated: '2026-06-01T00:00:00Z',
    updatedBy: 'Super Admin',
    ...defaults,
    ...settings,
  }
}

export let mockStateActivations: StateActivationRecord[] = [
  createState('sa-ca', 'CA', 'California', 'active', 4200, 12800, 12),
  createState('sa-ny', 'NY', 'New York', 'active', 3800, 11200, 8),
  createState('sa-tx', 'TX', 'Texas', 'active', 2900, 8600, 10),
  createState('sa-fl', 'FL', 'Florida', 'active', 2100, 6400, 9),
  createState('sa-wa', 'WA', 'Washington', 'active', 980, 3200, 4),
  createState('sa-il', 'IL', 'Illinois', 'disabled', 0, 0, 6, {
    platformActive: false,
    driverRegistrationEnabled: false,
    passengerRegistrationEnabled: false,
    reservationsEnabled: false,
    airportQueueEnabled: false,
    dynamicPricingEnabled: false,
    blackCategoryEnabled: false,
    blackSuvCategoryEnabled: false,
  }),
  createState('sa-az', 'AZ', 'Arizona', 'pending_launch', 0, 0, 5, {
    platformActive: false,
    driverRegistrationEnabled: true,
    passengerRegistrationEnabled: false,
    reservationsEnabled: false,
    airportQueueEnabled: false,
    dynamicPricingEnabled: false,
    blackCategoryEnabled: false,
    blackSuvCategoryEnabled: false,
  }),
  createState('sa-co', 'CO', 'Colorado', 'pending_launch', 0, 0, 4, {
    platformActive: false,
    driverRegistrationEnabled: true,
    passengerRegistrationEnabled: true,
    reservationsEnabled: false,
    airportQueueEnabled: false,
    dynamicPricingEnabled: false,
    blackCategoryEnabled: false,
    blackSuvCategoryEnabled: false,
  }),
  createState('sa-nv', 'NV', 'Nevada', 'disabled', 0, 0, 3, {
    platformActive: false,
    driverRegistrationEnabled: false,
    passengerRegistrationEnabled: false,
    reservationsEnabled: false,
    airportQueueEnabled: false,
    dynamicPricingEnabled: false,
    blackCategoryEnabled: false,
    blackSuvCategoryEnabled: false,
  }),
]

export let mockStateActivationAuditLogs: StateActivationAuditLog[] = [
  {
    id: 'sal-1',
    stateId: 'sa-il',
    stateName: 'Illinois',
    field: 'Platform Active',
    previousValue: 'Active',
    newValue: 'Inactive',
    changedBy: 'Operations Manager',
    timestamp: '2026-05-28T14:30:00Z',
  },
  {
    id: 'sal-2',
    stateId: 'sa-az',
    stateName: 'Arizona',
    field: 'Driver Registration',
    previousValue: 'OFF',
    newValue: 'ON',
    changedBy: 'Super Admin',
    timestamp: '2026-05-25T09:15:00Z',
  },
  {
    id: 'sal-3',
    stateId: 'sa-ca',
    stateName: 'California',
    field: 'Dynamic Pricing',
    previousValue: 'OFF',
    newValue: 'ON',
    changedBy: 'Finance Manager',
    timestamp: '2026-05-20T16:45:00Z',
  },
  {
    id: 'sal-4',
    stateId: 'sa-ny',
    stateName: 'New York',
    field: 'Black SUV Category',
    previousValue: 'OFF',
    newValue: 'ON',
    changedBy: 'Operations Manager',
    timestamp: '2026-05-18T11:00:00Z',
  },
  {
    id: 'sal-5',
    stateId: 'sa-tx',
    stateName: 'Texas',
    field: 'Airport Queue',
    previousValue: 'OFF',
    newValue: 'ON',
    changedBy: 'Super Admin',
    timestamp: '2026-05-15T08:30:00Z',
  },
]

const FIELD_LABELS: Record<keyof StateActivationSettings, string> = {
  platformActive: 'Platform Active',
  driverRegistrationEnabled: 'Driver Registration',
  passengerRegistrationEnabled: 'Passenger Registration',
  reservationsEnabled: 'Reservation Feature',
  airportQueueEnabled: 'Airport Queue',
  dynamicPricingEnabled: 'Dynamic Pricing',
  blackCategoryEnabled: 'Black Category',
  blackSuvCategoryEnabled: 'Black SUV Category',
}

function formatBool(value: boolean) {
  return value ? 'ON' : 'OFF'
}

export function computeStateActivationOverview(): StateActivationOverview {
  const active = mockStateActivations.filter((s) => s.status === 'active')
  return {
    totalActiveStates: active.length,
    disabledStates: mockStateActivations.filter((s) => s.status === 'disabled').length,
    pendingLaunchStates: mockStateActivations.filter((s) => s.status === 'pending_launch').length,
    totalActiveDrivers: active.reduce((sum, s) => sum + s.activeDrivers, 0),
    totalActivePassengers: active.reduce((sum, s) => sum + s.activePassengers, 0),
  }
}

export function appendStateAuditLog(
  stateId: string,
  stateName: string,
  field: keyof StateActivationSettings | 'Status',
  previousValue: string,
  newValue: string,
  changedBy = 'Admin',
) {
  mockStateActivationAuditLogs.unshift({
    id: `sal-${Date.now()}`,
    stateId,
    stateName,
    field: field === 'Status' ? 'Status' : FIELD_LABELS[field],
    previousValue,
    newValue,
    changedBy,
    timestamp: new Date().toISOString(),
  })
}

export function settingsFromRecord(record: StateActivationRecord): StateActivationSettings {
  return {
    platformActive: record.platformActive,
    driverRegistrationEnabled: record.driverRegistrationEnabled,
    passengerRegistrationEnabled: record.passengerRegistrationEnabled,
    reservationsEnabled: record.reservationsEnabled,
    airportQueueEnabled: record.airportQueueEnabled,
    dynamicPricingEnabled: record.dynamicPricingEnabled,
    blackCategoryEnabled: record.blackCategoryEnabled,
    blackSuvCategoryEnabled: record.blackSuvCategoryEnabled,
  }
}

export function logSettingsChanges(
  stateId: string,
  stateName: string,
  before: StateActivationSettings,
  after: StateActivationSettings,
  changedBy = 'Admin',
) {
  ;(Object.keys(FIELD_LABELS) as Array<keyof StateActivationSettings>).forEach((key) => {
    if (before[key] !== after[key]) {
      appendStateAuditLog(stateId, stateName, key, formatBool(before[key]), formatBool(after[key]), changedBy)
    }
  })
}

export const STATUS_LABELS: Record<string, string> = {
  active: 'Active',
  disabled: 'Disabled',
  pending_launch: 'Pending Launch',
}
