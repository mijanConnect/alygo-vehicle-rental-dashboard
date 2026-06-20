export type StateActivationStatus = 'active' | 'disabled' | 'pending_launch'

export interface StateActivationSettings {
  platformActive: boolean
  driverRegistrationEnabled: boolean
  passengerRegistrationEnabled: boolean
  reservationsEnabled: boolean
  airportQueueEnabled: boolean
  dynamicPricingEnabled: boolean
  blackCategoryEnabled: boolean
  blackSuvCategoryEnabled: boolean
}

export interface StateActivationRecord extends StateActivationSettings {
  id: string
  stateCode: string
  stateName: string
  status: StateActivationStatus
  activeDrivers: number
  activePassengers: number
  citiesCount: number
  regionsCount: number
  lastUpdated: string
  updatedBy: string
}

export interface StateActivationOverview {
  totalActiveStates: number
  disabledStates: number
  pendingLaunchStates: number
  totalActiveDrivers: number
  totalActivePassengers: number
}

export interface StateActivationAuditLog {
  id: string
  stateId: string
  stateName: string
  field: string
  previousValue: string
  newValue: string
  changedBy: string
  timestamp: string
}
