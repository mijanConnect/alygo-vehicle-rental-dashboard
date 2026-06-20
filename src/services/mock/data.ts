import type {
  ActivityItem,
  AuthUser,
  ChartPoint,
  ComplianceDocument,
  DemandZone,
  Driver,
  EligibilityRule,
  KpiMetric,
  NotificationItem,
  OperationalEvent,
  Passenger,
  Reservation,
  SurgeZone,
  Trip,
} from '@/types'
import { getVerificationForDriver } from '@/services/mock/driverVerificationData'

const cities = ['San Francisco', 'Los Angeles', 'New York', 'Chicago', 'Miami', 'Seattle', 'Austin']
const states = ['CA', 'NY', 'IL', 'FL', 'WA', 'TX']

export const mockKpis: KpiMetric[] = [
  { key: 'totalDrivers', label: 'Total Drivers', value: 12847, change: 4.2, format: 'number', icon: 'users' },
  { key: 'totalPassengers', label: 'Total Passengers', value: 89432, change: 6.8, format: 'number', icon: 'user-check' },
  { key: 'activeTrips', label: 'Active Trips', value: 342, change: 12.5, format: 'number', icon: 'car' },
  { key: 'revenueToday', label: 'Revenue Today', value: 284750, change: 8.3, format: 'currency', icon: 'dollar-sign' },
  { key: 'revenueMonth', label: 'Revenue This Month', value: 8420000, change: 11.2, format: 'currency', icon: 'trending-up' },
  { key: 'approvalQueue', label: 'Driver Approval Queue', value: 47, change: -3.1, format: 'number', icon: 'clipboard-check' },
  { key: 'complianceAlerts', label: 'Compliance Alerts', value: 23, change: 15.0, format: 'number', icon: 'shield-alert' },
  { key: 'airportQueue', label: 'Airport Queue Count', value: 89, change: 5.6, format: 'number', icon: 'plane' },
  { key: 'scheduledRides', label: 'Scheduled Rides', value: 156, change: 9.1, format: 'number', icon: 'calendar' },
]

export const mockRevenueTrend: ChartPoint[] = [
  { label: 'Mon', value: 245000, secondary: 198000 },
  { label: 'Tue', value: 268000, secondary: 210000 },
  { label: 'Wed', value: 252000, secondary: 205000 },
  { label: 'Thu', value: 289000, secondary: 228000 },
  { label: 'Fri', value: 342000, secondary: 275000 },
  { label: 'Sat', value: 398000, secondary: 312000 },
  { label: 'Sun', value: 284750, secondary: 245000 },
]

export const mockDemandTrend: ChartPoint[] = [
  { label: '6AM', value: 120 },
  { label: '9AM', value: 340 },
  { label: '12PM', value: 280 },
  { label: '3PM', value: 310 },
  { label: '6PM', value: 520 },
  { label: '9PM', value: 410 },
  { label: '12AM', value: 180 },
]

export const mockGrowthTrend: ChartPoint[] = [
  { label: 'Jan', value: 8200 },
  { label: 'Feb', value: 9100 },
  { label: 'Mar', value: 9800 },
  { label: 'Apr', value: 10500 },
  { label: 'May', value: 11200 },
  { label: 'Jun', value: 12847 },
]

export const mockCategoryUsage: ChartPoint[] = [
  { label: 'Standard', value: 42 },
  { label: 'Comfort', value: 18 },
  { label: 'XL', value: 12 },
  { label: 'Pet', value: 5 },
  { label: 'Priority', value: 8 },
  { label: 'Black', value: 10 },
  { label: 'Black SUV', value: 5 },
]

export const mockTopCities: ChartPoint[] = [
  { label: 'San Francisco', value: 1240000 },
  { label: 'Los Angeles', value: 980000 },
  { label: 'New York', value: 1560000 },
  { label: 'Chicago', value: 720000 },
  { label: 'Miami', value: 540000 },
]

export const mockTopAirports: ChartPoint[] = [
  { label: 'SFO', value: 8420 },
  { label: 'LAX', value: 12400 },
  { label: 'JFK', value: 9800 },
  { label: 'ORD', value: 6200 },
  { label: 'MIA', value: 5100 },
]

export const mockActivities: ActivityItem[] = [
  {
    id: '1',
    type: 'trip',
    title: 'Trip completed',
    description: 'Driver Marcus J. completed a Black SUV ride in San Francisco',
    timestamp: new Date(Date.now() - 120000).toISOString(),
    severity: 'success',
  },
  {
    id: '2',
    type: 'compliance',
    title: 'Document expiring',
    description: 'Vehicle inspection for driver #DR-4821 expires in 7 days',
    timestamp: new Date(Date.now() - 300000).toISOString(),
    severity: 'warning',
  },
  {
    id: '3',
    type: 'surge',
    title: 'Surge activated',
    description: 'Downtown SF zone multiplier increased to 2.4x',
    timestamp: new Date(Date.now() - 480000).toISOString(),
    severity: 'info',
  },
  {
    id: '4',
    type: 'driver',
    title: 'New driver approved',
    description: 'Sarah Chen approved for Comfort and Standard categories',
    timestamp: new Date(Date.now() - 720000).toISOString(),
    severity: 'success',
  },
  {
    id: '5',
    type: 'reservation',
    title: 'Airport reservation',
    description: 'SFO pickup scheduled for 3:45 PM - Black category',
    timestamp: new Date(Date.now() - 900000).toISOString(),
    severity: 'info',
  },
]

const identityStatuses = [
  'verified',
  'pending_re_verification',
  'verification_required',
  'under_review',
  'failed_verification',
] as const

export const mockDrivers: Driver[] = Array.from({ length: 50 }, (_, i) => {
  const tiers = ['journey', 'pro_go', 'elite', 'platinum', 'diamond'] as const
  return {
    id: `DR-${1000 + i}`,
    name: ['Marcus Johnson', 'Sarah Chen', 'David Kim', 'Emily Rodriguez', 'James Wilson'][i % 5] + ` ${i + 1}`,
    email: `driver${i + 1}@example.com`,
    phone: `+1 (555) ${String(100 + i).padStart(3, '0')}-${String(1000 + i).slice(-4)}`,
    rating: Number((4.2 + (i % 8) * 0.1).toFixed(1)),
    completedTrips: 50 + i * 23,
    vehicle: ['Toyota Camry', 'Honda Accord', 'Tesla Model 3', 'Chevrolet Suburban', 'Mercedes E-Class'][i % 5],
    vehicleYear: 2018 + (i % 6),
    categories: (['standard', 'comfort', 'xl', 'black'] as const).slice(0, (i % 4) + 1),
    complianceStatus: (['approved', 'pending', 'expiring_soon', 'expired'] as const)[i % 4],
    backgroundCheckStatus: (['approved', 'pending', 'rejected'] as const)[i % 3],
    identityVerificationStatus: identityStatuses[i % identityStatuses.length],
    status: (['active', 'pending', 'suspended', 'deactivated'] as const)[i % 4],
    city: cities[i % cities.length],
    state: states[i % states.length],
    joinedAt: new Date(Date.now() - i * 86400000 * 7).toISOString(),
    earnings: 1200 + i * 85,
    currentTier: tiers[i % tiers.length],
    tierProgress: 35 + ((i * 13) % 65),
    tierStatus: i % 11 === 0 ? 'at_risk' : 'good_standing',
    acceptanceRate: 82 + (i % 14),
    safetyScore: 80 + (i % 18),
  }
})

mockDrivers.forEach((d) => {
  const v = getVerificationForDriver(d.id)
  if (v) d.identityVerificationStatus = v.status
})

export const mockPassengers: Passenger[] = Array.from({ length: 40 }, (_, i) => ({
  id: `PS-${2000 + i}`,
  name: ['Alex Turner', 'Jordan Lee', 'Taylor Morgan', 'Casey Brooks', 'Riley Adams'][i % 5] + ` ${i + 1}`,
  email: `passenger${i + 1}@example.com`,
  phone: `+1 (555) ${String(200 + i).padStart(3, '0')}-${String(2000 + i).slice(-4)}`,
  rating: Number((4.5 + (i % 5) * 0.08).toFixed(1)),
  completedTrips: 10 + i * 8,
  walletBalance: 25 + i * 12,
  status: (['active', 'suspended', 'banned'] as const)[i % 10 === 0 ? 2 : i % 15 === 0 ? 1 : 0],
  city: cities[i % cities.length],
  joinedAt: new Date(Date.now() - i * 86400000 * 5).toISOString(),
}))

export const mockTrips: Trip[] = Array.from({ length: 30 }, (_, i) => ({
  id: `TR-${5000 + i}`,
  driverId: mockDrivers[i % mockDrivers.length].id,
  driverName: mockDrivers[i % mockDrivers.length].name,
  passengerId: mockPassengers[i % mockPassengers.length].id,
  passengerName: mockPassengers[i % mockPassengers.length].name,
  category: (['standard', 'comfort', 'xl', 'black', 'priority'] as const)[i % 5],
  status: (['requested', 'accepted', 'in_progress', 'completed'] as const)[i % 4],
  pickup: `${100 + i} Market St, ${cities[i % cities.length]}`,
  dropoff: `${200 + i} Mission St, ${cities[i % cities.length]}`,
  fare: 18 + i * 3,
  startedAt: new Date(Date.now() - i * 600000).toISOString(),
  city: cities[i % cities.length],
}))

export const mockComplianceDocs: ComplianceDocument[] = Array.from({ length: 25 }, (_, i) => ({
  id: `CD-${3000 + i}`,
  driverId: mockDrivers[i].id,
  driverName: mockDrivers[i].name,
  type: ['Driver License', 'Vehicle Registration', 'Vehicle Inspection', 'Commercial Insurance', 'Background Check'][i % 5],
  status: (['approved', 'pending', 'expiring_soon', 'expired', 'rejected'] as const)[i % 5],
  expiresAt: new Date(Date.now() + (i - 2) * 86400000 * 10).toISOString(),
  submittedAt: new Date(Date.now() - i * 86400000 * 3).toISOString(),
}))

export const mockEligibilityRules: EligibilityRule[] = [
  {
    id: 'ER-1',
    name: 'California Black Standard',
    scope: 'state',
    scopeValue: 'CA',
    category: 'black',
    minVehicleYear: 2019,
    maxVehicleAge: 5,
    minRating: 4.8,
    minTrips: 500,
    minExperienceYears: 2,
    seatCount: 4,
    vehicleTypes: ['Sedan', 'Luxury'],
    inspectionRequired: true,
    commercialInsuranceRequired: true,
    active: true,
  },
  {
    id: 'ER-2',
    name: 'SFO Airport XL',
    scope: 'airport',
    scopeValue: 'SFO',
    category: 'xl',
    minVehicleYear: 2017,
    maxVehicleAge: 7,
    minRating: 4.5,
    minTrips: 200,
    minExperienceYears: 1,
    seatCount: 6,
    vehicleTypes: ['SUV', 'Van'],
    inspectionRequired: true,
    commercialInsuranceRequired: false,
    active: true,
  },
]

export const mockSurgeZones: SurgeZone[] = [
  { id: 'SZ-1', name: 'Downtown SF', city: 'San Francisco', multiplier: 2.4, demand: 892, supply: 234, active: true },
  { id: 'SZ-2', name: 'LAX Terminal', city: 'Los Angeles', multiplier: 1.8, demand: 1240, supply: 420, active: true },
  { id: 'SZ-3', name: 'Midtown Manhattan', city: 'New York', multiplier: 3.1, demand: 1560, supply: 380, active: true },
  { id: 'SZ-4', name: 'South Beach', city: 'Miami', multiplier: 1.5, demand: 620, supply: 310, active: false },
]

function demandZoneStatus(ratio: number): DemandZone['status'] {
  if (ratio >= 3) return 'high_demand'
  if (ratio >= 2) return 'medium_demand'
  return 'normal'
}

export const mockDemandZones: DemandZone[] = [
  { id: 'DZ-1', zone: 'SFO Airport', activeRequests: 342, availableDrivers: 89, demandRatio: 3.84, averageEtaMinutes: 8.4, status: demandZoneStatus(3.84) },
  { id: 'DZ-2', zone: 'Downtown SF', activeRequests: 289, availableDrivers: 124, demandRatio: 2.33, averageEtaMinutes: 5.1, status: demandZoneStatus(2.33) },
  { id: 'DZ-3', zone: 'LAX Terminal', activeRequests: 412, availableDrivers: 156, demandRatio: 2.64, averageEtaMinutes: 7.2, status: demandZoneStatus(2.64) },
  { id: 'DZ-4', zone: 'Midtown Manhattan', activeRequests: 378, availableDrivers: 98, demandRatio: 3.86, averageEtaMinutes: 9.1, status: demandZoneStatus(3.86) },
  { id: 'DZ-5', zone: 'Convention Center', activeRequests: 198, availableDrivers: 72, demandRatio: 2.75, averageEtaMinutes: 6.8, status: demandZoneStatus(2.75) },
  { id: 'DZ-6', zone: 'South Beach', activeRequests: 156, availableDrivers: 94, demandRatio: 1.66, averageEtaMinutes: 4.5, status: demandZoneStatus(1.66) },
]

export const mockOperationalEvents: OperationalEvent[] = [
  { id: 'EV-1', eventName: 'Tech Summit', location: 'Moscone Center', date: '2026-06-14T09:00:00Z', status: 'active' },
  { id: 'EV-2', eventName: 'Music Festival', location: 'Golden Gate Park', date: '2026-06-16T14:00:00Z', status: 'upcoming' },
  { id: 'EV-3', eventName: 'Sports Championship', location: 'Crypto.com Arena', date: '2026-06-15T19:00:00Z', status: 'upcoming' },
  { id: 'EV-4', eventName: 'Tech Summit', location: 'Staples Center', date: '2026-06-13T19:30:00Z', status: 'completed' },
]

const reservationTypes = ['scheduled', 'airport', 'event'] as const
const reservationStatuses = ['pending', 'assigned', 'in_progress', 'completed', 'cancelled'] as const
const airports = [
  { code: 'SFO', name: 'San Francisco Intl' },
  { code: 'LAX', name: 'Los Angeles Intl' },
  { code: 'JFK', name: 'JFK Intl' },
]

export const mockReservations: Reservation[] = Array.from({ length: 24 }, (_, i) => {
  const type = reservationTypes[i % 3]
  const city = cities[i % cities.length]
  const status = reservationStatuses[i % reservationStatuses.length]
  const airport = airports[i % airports.length]

  return {
    id: `RS-${4000 + i}`,
    passengerName: mockPassengers[i % mockPassengers.length].name,
    type,
    pickup: type === 'airport' ? `${airport.code} Terminal ${(i % 3) + 1}` : `${100 + i} Main St, ${city}`,
    dropoff: type === 'event' ? 'Convention Center' : type === 'airport' ? `Downtown ${city.split(' ')[0]}` : `${200 + i} Oak Ave, ${city}`,
    scheduledAt: new Date(Date.now() + i * 3600000).toISOString(),
    createdAt: new Date(Date.now() - i * 86400000).toISOString(),
    category: (['standard', 'comfort', 'black', 'xl'] as const)[i % 4],
    status,
    driverName: status === 'pending' ? undefined : mockDrivers[i % mockDrivers.length].name,
    city,
    airportCode: type === 'airport' ? airport.code : undefined,
    flightNumber: type === 'airport' ? `AA${1200 + i}` : undefined,
    terminal: type === 'airport' ? `Terminal ${(i % 3) + 1}` : undefined,
    eventName: type === 'event' ? ['Tech Summit', 'Music Festival', 'Sports Championship'][i % 3] : undefined,
    venue: type === 'event' ? ['Moscone Center', 'Staples Center', 'Madison Square Garden'][i % 3] : undefined,
    eventTime: type === 'event' ? new Date(Date.now() + i * 7200000).toISOString() : undefined,
  }
})

export const mockNotifications: NotificationItem[] = [
  {
    id: 'N-1',
    title: 'Compliance alert',
    message: '12 documents expiring within 7 days',
    read: false,
    createdAt: new Date(Date.now() - 3600000).toISOString(),
    category: 'compliance',
  },
  {
    id: 'N-2',
    title: 'Surge opportunity',
    message: 'High demand detected in Downtown SF',
    read: false,
    createdAt: new Date(Date.now() - 7200000).toISOString(),
    category: 'operations',
  },
  {
    id: 'N-3',
    title: 'Payout processed',
    message: '$842,000 in driver payouts completed',
    read: true,
    createdAt: new Date(Date.now() - 86400000).toISOString(),
    category: 'finance',
  },
]

export const mockAdminUser: AuthUser = {
  id: 'ADM-001',
  email: 'admin@alygo.com',
  name: 'Alexandra Morgan',
  role: 'super_admin',
  permissions: [
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
}
