export type LocationType = 'state' | 'city' | 'zone' | 'airport'

export interface CapacityLimit {
  id: string
  locationId: string
  locationName: string
  locationType: LocationType
  maxActiveDrivers: number
  maxNewApprovals: number
  onboardingPaused: boolean
  currentActiveDrivers: number
  currentWaitlistSize: number
  // Notifications
  notifyAt80: boolean
  notifyAt90: boolean
  notifyAt100: boolean
  // Zone & Airport specific
  minDriverSupply?: number
  maxDriverSupply?: number
  maxAirportQueueSize?: number
  autoWaitingQueue?: boolean
  autoMoveFromWaitlist?: boolean
  // Meta
  lastUpdated: string
  updatedBy: string
}
