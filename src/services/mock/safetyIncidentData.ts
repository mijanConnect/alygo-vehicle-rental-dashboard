import type {
  IncidentCategory,
  IncidentStatus,
  SafetyDashboardSummary,
  SafetyIncident,
  SafetyOverview,
  SafetySettings,
  StatusHistoryEntry,
} from '@/types/safetyIncident'

const baseTimeline = [
  { timestamp: '2026-06-12T14:00:00Z', lat: 37.7749, lng: -122.4194, label: 'Trip Start' },
  { timestamp: '2026-06-12T14:08:00Z', lat: 37.781, lng: -122.415, label: 'En Route' },
  { timestamp: '2026-06-12T14:16:00Z', lat: 37.785, lng: -122.408, label: 'Incident Reported' },
]

function statusHistory(
  entries: Array<{ status: IncidentStatus; timestamp: string; note?: string }>,
): StatusHistoryEntry[] {
  return entries
}

export let mockSafetyIncidents: SafetyIncident[] = [
  {
    id: 'si-1',
    caseId: 'INC-2026-0412',
    type: 'sos_alert',
    driverName: 'Marcus Johnson',
    driverId: 'd-204',
    driverPhone: '+1 (415) 555-0142',
    passengerName: 'Sarah Chen',
    passengerId: 'p-4412',
    passengerPhone: '+1 (415) 555-0198',
    tripId: 'trip-88241',
    status: 'open',
    priority: 'critical',
    createdAt: '2026-06-12T14:16:00Z',
    description: 'Passenger activated SOS button during active trip. Driver reported feeling unsafe.',
    gpsTimeline: baseTimeline,
    tripHistory: [
      { event: 'Trip Started', timestamp: '2026-06-12T14:00:00Z' },
      { event: 'SOS Alert Triggered', timestamp: '2026-06-12T14:16:00Z' },
    ],
    statusHistory: statusHistory([{ status: 'open', timestamp: '2026-06-12T14:16:00Z', note: 'Case created' }]),
    notes: [],
    attachments: [{ id: 'att-1', name: 'sos_audio_recording.mp3', type: 'audio', uploadedAt: '2026-06-12T14:17:00Z' }],
  },
  {
    id: 'si-2',
    caseId: 'INC-2026-0411',
    type: 'passenger_complaint',
    driverName: 'David Kim',
    driverId: 'd-118',
    driverPhone: '+1 (310) 555-0234',
    passengerName: 'James Wilson',
    passengerId: 'p-3891',
    passengerPhone: '+1 (310) 555-0456',
    tripId: 'trip-88190',
    status: 'in_review',
    priority: 'high',
    createdAt: '2026-06-11T22:30:00Z',
    description: 'Passenger reported aggressive driving and route deviation.',
    gpsTimeline: [
      { timestamp: '2026-06-11T22:00:00Z', lat: 34.0522, lng: -118.2437, label: 'Pickup' },
      { timestamp: '2026-06-11T22:20:00Z', lat: 34.06, lng: -118.25, label: 'Route Deviation' },
      { timestamp: '2026-06-11T22:30:00Z', lat: 34.065, lng: -118.24, label: 'Report Filed' },
    ],
    tripHistory: [
      { event: 'Trip Started', timestamp: '2026-06-11T22:00:00Z' },
      { event: 'Passenger Complaint Submitted', timestamp: '2026-06-11T22:30:00Z' },
    ],
    statusHistory: statusHistory([
      { status: 'open', timestamp: '2026-06-11T22:30:00Z', note: 'Case created' },
      { status: 'in_review', timestamp: '2026-06-11T23:00:00Z', note: 'Investigation started' },
    ]),
    notes: [{ id: 'n-1', author: 'Super Admin', content: 'Contacted passenger for statement.', timestamp: '2026-06-11T23:00:00Z' }],
    attachments: [],
  },
  {
    id: 'si-3',
    caseId: 'INC-2026-0410',
    type: 'harassment',
    driverName: 'Lisa Martinez',
    driverId: 'd-089',
    driverPhone: '+1 (415) 555-0312',
    passengerName: 'Elena Rodriguez',
    passengerId: 'p-2201',
    passengerPhone: '+1 (415) 555-0789',
    tripId: 'trip-88102',
    status: 'in_review',
    priority: 'high',
    createdAt: '2026-06-10T19:45:00Z',
    description: 'Driver reported passenger harassment and verbal abuse.',
    gpsTimeline: baseTimeline,
    tripHistory: [
      { event: 'Trip Started', timestamp: '2026-06-10T19:30:00Z' },
      { event: 'Harassment Report Filed', timestamp: '2026-06-10T19:45:00Z' },
      { event: 'Case Under Review', timestamp: '2026-06-10T20:15:00Z' },
    ],
    statusHistory: statusHistory([
      { status: 'open', timestamp: '2026-06-10T19:45:00Z', note: 'Case created' },
      { status: 'in_review', timestamp: '2026-06-10T20:15:00Z', note: 'Statements under review' },
    ]),
    notes: [{ id: 'n-2', author: 'Super Admin', content: 'Statements collected from both parties.', timestamp: '2026-06-10T20:15:00Z' }],
    attachments: [{ id: 'att-2', name: 'driver_statement.pdf', type: 'document', uploadedAt: '2026-06-10T19:46:00Z' }],
  },
  {
    id: 'si-4',
    caseId: 'INC-2026-0409',
    type: 'accident',
    driverName: 'Jennifer Park',
    driverId: 'd-512',
    driverPhone: '+1 (212) 555-0421',
    passengerName: 'Michael Brown',
    passengerId: 'p-5510',
    passengerPhone: '+1 (212) 555-0654',
    tripId: 'trip-88055',
    status: 'resolved',
    priority: 'critical',
    createdAt: '2026-06-09T08:20:00Z',
    description: 'Vehicle accident reported. Emergency services dispatched.',
    resolutionNotes: 'All parties safe. Insurance claim initiated.',
    gpsTimeline: [
      { timestamp: '2026-06-09T08:00:00Z', lat: 40.7128, lng: -74.006, label: 'Trip Start' },
      { timestamp: '2026-06-09T08:18:00Z', lat: 40.72, lng: -74.01, label: 'Accident Location' },
    ],
    tripHistory: [
      { event: 'Trip Started', timestamp: '2026-06-09T08:00:00Z' },
      { event: 'Accident Reported', timestamp: '2026-06-09T08:20:00Z' },
      { event: 'Case Resolved', timestamp: '2026-06-09T12:00:00Z' },
    ],
    statusHistory: statusHistory([
      { status: 'open', timestamp: '2026-06-09T08:20:00Z', note: 'Case created' },
      { status: 'in_review', timestamp: '2026-06-09T09:00:00Z', note: 'Emergency response verified' },
      { status: 'resolved', timestamp: '2026-06-09T12:00:00Z', note: 'All parties safe. Insurance claim initiated.' },
    ]),
    notes: [{ id: 'n-3', author: 'Super Admin', content: 'All parties safe. Insurance claim initiated.', timestamp: '2026-06-09T12:00:00Z' }],
    attachments: [{ id: 'att-3', name: 'accident_photos.zip', type: 'archive', uploadedAt: '2026-06-09T08:25:00Z' }],
  },
  {
    id: 'si-5',
    caseId: 'INC-2026-0408',
    type: 'vehicle_issue',
    driverName: 'Robert Chen',
    driverId: 'd-620',
    driverPhone: '+1 (305) 555-0333',
    passengerName: 'Emily Davis',
    passengerId: 'p-3302',
    passengerPhone: '+1 (305) 555-0444',
    tripId: 'trip-87998',
    status: 'open',
    priority: 'medium',
    createdAt: '2026-06-08T16:10:00Z',
    description: 'Passenger reported brake issue and requested trip termination.',
    gpsTimeline: baseTimeline,
    tripHistory: [{ event: 'Vehicle Issue Reported', timestamp: '2026-06-08T16:10:00Z' }],
    statusHistory: statusHistory([{ status: 'open', timestamp: '2026-06-08T16:10:00Z', note: 'Case created' }]),
    notes: [],
    attachments: [],
  },
  {
    id: 'si-6',
    caseId: 'INC-2026-0407',
    type: 'lost_item',
    driverName: 'Tom Bradley',
    driverId: 'd-312',
    driverPhone: '+1 (312) 555-0199',
    passengerName: 'Amy Foster',
    passengerId: 'p-5501',
    passengerPhone: '+1 (312) 555-0288',
    tripId: 'trip-87950',
    status: 'closed',
    priority: 'low',
    createdAt: '2026-06-07T11:00:00Z',
    description: 'Passenger left phone in vehicle. Item returned.',
    resolutionNotes: 'Phone returned to passenger at hub location.',
    gpsTimeline: baseTimeline,
    tripHistory: [
      { event: 'Lost Item Reported', timestamp: '2026-06-07T11:00:00Z' },
      { event: 'Item Returned', timestamp: '2026-06-07T15:30:00Z' },
      { event: 'Case Closed', timestamp: '2026-06-07T16:00:00Z' },
    ],
    statusHistory: statusHistory([
      { status: 'open', timestamp: '2026-06-07T11:00:00Z', note: 'Case created' },
      { status: 'in_review', timestamp: '2026-06-07T12:00:00Z', note: 'Driver contacted' },
      { status: 'resolved', timestamp: '2026-06-07T15:30:00Z', note: 'Item returned to passenger' },
      { status: 'closed', timestamp: '2026-06-07T16:00:00Z', note: 'Case closed' },
    ]),
    notes: [{ id: 'n-4', author: 'Super Admin', content: 'Driver confirmed item handoff.', timestamp: '2026-06-07T15:30:00Z' }],
    attachments: [],
  },
  {
    id: 'si-7',
    caseId: 'INC-2026-0406',
    type: 'driver_complaint',
    driverName: 'Kevin Nguyen',
    driverId: 'd-445',
    driverPhone: '+1 (408) 555-0333',
    passengerName: 'Rachel Green',
    passengerId: 'p-4420',
    passengerPhone: '+1 (408) 555-0444',
    tripId: 'trip-87920',
    status: 'in_review',
    priority: 'medium',
    createdAt: '2026-06-06T09:30:00Z',
    description: 'Driver complaint regarding passenger no-show at pickup.',
    gpsTimeline: baseTimeline,
    tripHistory: [{ event: 'Driver Complaint Filed', timestamp: '2026-06-06T09:30:00Z' }],
    statusHistory: statusHistory([
      { status: 'open', timestamp: '2026-06-06T09:30:00Z', note: 'Case created' },
      { status: 'in_review', timestamp: '2026-06-06T10:00:00Z', note: 'Reviewing trip logs' },
    ]),
    notes: [],
    attachments: [],
  },
  {
    id: 'si-8',
    caseId: 'INC-2026-0405',
    type: 'safety_investigation',
    driverName: 'Elena Rodriguez',
    driverId: 'd-331',
    driverPhone: '+1 (646) 555-0555',
    passengerName: 'Chris Martinez',
    passengerId: 'p-3310',
    passengerPhone: '+1 (646) 555-0666',
    tripId: 'trip-87880',
    status: 'in_review',
    priority: 'high',
    createdAt: '2026-06-05T14:00:00Z',
    description: 'System flagged unusual trip pattern for safety investigation.',
    gpsTimeline: baseTimeline,
    tripHistory: [{ event: 'Investigation Opened', timestamp: '2026-06-05T14:00:00Z' }],
    statusHistory: statusHistory([
      { status: 'open', timestamp: '2026-06-05T14:00:00Z', note: 'Case created' },
      { status: 'in_review', timestamp: '2026-06-05T15:00:00Z', note: 'Reviewing GPS and trip metadata' },
    ]),
    notes: [{ id: 'n-5', author: 'Super Admin', content: 'Reviewing GPS and trip metadata.', timestamp: '2026-06-05T15:00:00Z' }],
    attachments: [],
  },
]

export let mockIncidentCategories: IncidentCategory[] = [
  { id: 'cat-1', name: 'SOS Alert', description: 'Emergency SOS button activation during active trips', severityLevel: 'critical', status: 'active' },
  { id: 'cat-2', name: 'Accident', description: 'Vehicle accident or collision reports', severityLevel: 'critical', status: 'active' },
  { id: 'cat-3', name: 'Harassment', description: 'Verbal or physical harassment reports', severityLevel: 'critical', status: 'active' },
  { id: 'cat-4', name: 'Vehicle Issue', description: 'Vehicle safety or mechanical concerns', severityLevel: 'high', status: 'active' },
  { id: 'cat-5', name: 'Medical Emergency', description: 'Medical emergencies requiring immediate response', severityLevel: 'critical', status: 'active' },
  { id: 'cat-6', name: 'Safety Complaint', description: 'General safety complaints from drivers or passengers', severityLevel: 'high', status: 'active' },
]

export let mockSafetySettings: SafetySettings = {
  sosEnabled: true,
  emergencyHotlineNumber: '+1 (800) 555-0911',
  pushNotifications: true,
  emailNotifications: true,
}

const OPEN_STATUSES: SafetyIncident['status'][] = ['open', 'in_review']

export function computeSafetyOverview(): SafetyOverview {
  return {
    openCases: mockSafetyIncidents.filter((i) => OPEN_STATUSES.includes(i.status)).length,
    criticalCases: mockSafetyIncidents.filter(
      (i) => i.priority === 'critical' && OPEN_STATUSES.includes(i.status),
    ).length,
    sosAlerts: mockSafetyIncidents.filter((i) => i.type === 'sos_alert' && i.status !== 'closed').length,
    resolvedCases: mockSafetyIncidents.filter((i) => i.status === 'resolved' || i.status === 'closed').length,
  }
}

export function computeSafetyDashboardSummary(): SafetyDashboardSummary {
  const overview = computeSafetyOverview()
  const recentIncidents = [...mockSafetyIncidents]
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
    .slice(0, 5)
    .map((i) => ({
      id: i.id,
      caseId: i.caseId,
      type: i.type,
      priority: i.priority,
      status: i.status,
      createdAt: i.createdAt,
      driverName: i.driverName,
      passengerName: i.passengerName,
    }))

  return { ...overview, recentIncidents }
}

export const TYPE_LABELS: Record<string, string> = {
  sos_alert: 'SOS Alert',
  passenger_complaint: 'Passenger Complaint',
  driver_complaint: 'Driver Complaint',
  harassment: 'Harassment',
  accident: 'Accident',
  vehicle_issue: 'Vehicle Issue',
  lost_item: 'Lost Item',
  safety_investigation: 'Safety Investigation',
}

export const STATUS_LABELS: Record<string, string> = {
  open: 'Open',
  in_review: 'In Review',
  resolved: 'Resolved',
  closed: 'Closed',
}

export const STATUS_OPTIONS = (Object.keys(STATUS_LABELS) as IncidentStatus[]).map((value) => ({
  value,
  label: STATUS_LABELS[value],
}))

export const PRIORITY_LABELS: Record<string, string> = {
  critical: 'Critical',
  high: 'High',
  medium: 'Medium',
  low: 'Low',
}

export const SEVERITY_LABELS = PRIORITY_LABELS
