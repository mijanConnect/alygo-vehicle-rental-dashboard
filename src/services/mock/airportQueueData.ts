import type {
  AirportQueueOverview,
  AirportQueueRules,
  AirportRecord,
  QueueDriver,
} from '@/types/airportQueue'

export let mockAirports: AirportRecord[] = [
  { id: 'ap-sfo', code: 'SFO', name: 'San Francisco International', state: 'California', queueSize: 89, status: 'active', averageWaitMinutes: 18, completedTripsToday: 342 },
  { id: 'ap-lax', code: 'LAX', name: 'Los Angeles International', state: 'California', queueSize: 124, status: 'active', averageWaitMinutes: 22, completedTripsToday: 518 },
  { id: 'ap-jfk', code: 'JFK', name: 'John F. Kennedy International', state: 'New York', queueSize: 98, status: 'active', averageWaitMinutes: 25, completedTripsToday: 445 },
  { id: 'ap-ord', code: 'ORD', name: "Chicago O'Hare International", state: 'Illinois', queueSize: 76, status: 'active', averageWaitMinutes: 20, completedTripsToday: 389 },
  { id: 'ap-mia', code: 'MIA', name: 'Miami International', state: 'Florida', queueSize: 54, status: 'active', averageWaitMinutes: 16, completedTripsToday: 267 },
  { id: 'ap-sea', code: 'SEA', name: 'Seattle-Tacoma International', state: 'Washington', queueSize: 42, status: 'disabled', averageWaitMinutes: 0, completedTripsToday: 0 },
]

export let mockQueueRules: AirportQueueRules = {
  queueEntryRadiusMeters: 500,
  tierPriorityEnabled: true,
  tierPriorityOrder: ['diamond', 'platinum', 'elite', 'pro_go', 'journey'],
  eligibleCategories: ['standard', 'comfort', 'xl', 'black', 'black_suv'],
  blackPriorityEnabled: true,
  blackSuvPriorityEnabled: true,
  maxQueueTimeMinutes: 120,
}

export let mockQueueDrivers: QueueDriver[] = [
  { id: 'qd-1', airportId: 'ap-sfo', airportCode: 'SFO', position: 1, driverName: 'Marcus Johnson', driverId: 'd-204', tier: 'diamond', category: 'Black SUV', waitingMinutes: 4 },
  { id: 'qd-2', airportId: 'ap-sfo', airportCode: 'SFO', position: 2, driverName: 'Lisa Martinez', driverId: 'd-089', tier: 'platinum', category: 'Black', waitingMinutes: 12 },
  { id: 'qd-3', airportId: 'ap-sfo', airportCode: 'SFO', position: 3, driverName: 'David Kim', driverId: 'd-118', tier: 'elite', category: 'Comfort', waitingMinutes: 18 },
  { id: 'qd-4', airportId: 'ap-lax', airportCode: 'LAX', position: 1, driverName: 'Elena Rodriguez', driverId: 'd-302', tier: 'diamond', category: 'Black', waitingMinutes: 6 },
  { id: 'qd-5', airportId: 'ap-lax', airportCode: 'LAX', position: 2, driverName: 'James Wilson', driverId: 'd-441', tier: 'pro_go', category: 'XL', waitingMinutes: 15 },
  { id: 'qd-6', airportId: 'ap-jfk', airportCode: 'JFK', position: 1, driverName: 'Jennifer Park', driverId: 'd-512', tier: 'platinum', category: 'Black SUV', waitingMinutes: 8 },
  { id: 'qd-7', airportId: 'ap-jfk', airportCode: 'JFK', position: 2, driverName: 'Robert Chen', driverId: 'd-620', tier: 'elite', category: 'Standard', waitingMinutes: 22 },
  { id: 'qd-8', airportId: 'ap-ord', airportCode: 'ORD', position: 1, driverName: 'Sarah Thompson', driverId: 'd-701', tier: 'journey', category: 'Standard', waitingMinutes: 10 },
]

export function computeAirportQueueOverview(): AirportQueueOverview {
  const active = mockAirports.filter((a) => a.status === 'active')
  const totalQueue = active.reduce((s, a) => s + a.queueSize, 0)
  const avgWait = active.length
    ? Math.round(active.reduce((s, a) => s + a.averageWaitMinutes, 0) / active.length)
    : 0
  return {
    activeAirports: active.length,
    driversInQueue: totalQueue,
    averageWaitTimeMinutes: avgWait,
    completedAirportTrips: mockAirports.reduce((s, a) => s + a.completedTripsToday, 0),
  }
}

export const TIER_LABELS: Record<string, string> = {
  journey: 'Journey',
  pro_go: 'Pro Go',
  elite: 'Elite',
  platinum: 'Platinum',
  diamond: 'Diamond',
}

export const CATEGORY_OPTIONS = [
  { value: 'standard', label: 'Standard' },
  { value: 'comfort', label: 'Comfort' },
  { value: 'xl', label: 'XL' },
  { value: 'pet', label: 'Pet' },
  { value: 'priority', label: 'Priority' },
  { value: 'black', label: 'Black' },
  { value: 'black_suv', label: 'Black SUV' },
]

export const TIER_OPTIONS = [
  { value: 'journey', label: 'Journey' },
  { value: 'pro_go', label: 'Pro Go' },
  { value: 'elite', label: 'Elite' },
  { value: 'platinum', label: 'Platinum' },
  { value: 'diamond', label: 'Diamond' },
]
