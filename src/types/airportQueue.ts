export type AirportQueueStatus = 'active' | 'disabled'

export type DriverTier = 'journey' | 'pro_go' | 'elite' | 'platinum' | 'diamond'

export interface AirportQueueOverview {
  activeAirports: number
  driversInQueue: number
  averageWaitTimeMinutes: number
  completedAirportTrips: number
}

export interface AirportRecord {
  id: string
  code: string
  name: string
  state: string
  queueSize: number
  status: AirportQueueStatus
  averageWaitMinutes: number
  completedTripsToday: number
}

export interface AirportQueueRules {
  queueEntryRadiusMeters: number
  tierPriorityEnabled: boolean
  tierPriorityOrder: DriverTier[]
  eligibleCategories: string[]
  blackPriorityEnabled: boolean
  blackSuvPriorityEnabled: boolean
  maxQueueTimeMinutes: number
}

export interface QueueDriver {
  id: string
  airportId: string
  airportCode: string
  position: number
  driverName: string
  driverId: string
  tier: DriverTier
  category: string
  waitingMinutes: number
}
