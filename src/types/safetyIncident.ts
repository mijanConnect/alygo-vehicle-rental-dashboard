export type IncidentType =
  | 'sos_alert'
  | 'passenger_complaint'
  | 'driver_complaint'
  | 'harassment'
  | 'accident'
  | 'vehicle_issue'
  | 'lost_item'
  | 'safety_investigation'

export type IncidentStatus = 'open' | 'in_review' | 'resolved' | 'closed'

export type IncidentPriority = 'critical' | 'high' | 'medium' | 'low'

export interface GpsTimelinePoint {
  timestamp: string
  lat: number
  lng: number
  label: string
}

export interface IncidentNote {
  id: string
  author: string
  content: string
  timestamp: string
}

export interface IncidentAttachment {
  id: string
  name: string
  type: string
  uploadedAt: string
}

export interface TripHistoryEntry {
  event: string
  timestamp: string
}

export interface StatusHistoryEntry {
  status: IncidentStatus
  timestamp: string
  note?: string
}

export interface SafetyIncident {
  id: string
  caseId: string
  type: IncidentType
  driverName: string
  driverId: string
  driverPhone: string
  passengerName: string
  passengerId: string
  passengerPhone: string
  tripId: string
  status: IncidentStatus
  priority: IncidentPriority
  createdAt: string
  description: string
  resolutionNotes?: string
  gpsTimeline: GpsTimelinePoint[]
  tripHistory: TripHistoryEntry[]
  statusHistory: StatusHistoryEntry[]
  notes: IncidentNote[]
  attachments: IncidentAttachment[]
}

export interface SafetyOverview {
  openCases: number
  criticalCases: number
  sosAlerts: number
  resolvedCases: number
}

export interface SafetyDashboardSummary {
  openCases: number
  criticalCases: number
  sosAlerts: number
  recentIncidents: Array<{
    id: string
    caseId: string
    type: IncidentType
    priority: IncidentPriority
    status: IncidentStatus
    createdAt: string
    driverName: string
    passengerName: string
  }>
}

export interface IncidentCategory {
  id: string
  name: string
  description: string
  severityLevel: IncidentPriority
  status: 'active' | 'inactive'
}

export interface SafetySettings {
  sosEnabled: boolean
  emergencyHotlineNumber: string
  pushNotifications: boolean
  emailNotifications: boolean
}

export interface IncidentCategoryFormValues {
  name: string
  description: string
  severityLevel: IncidentPriority
  status: 'active' | 'inactive'
}
