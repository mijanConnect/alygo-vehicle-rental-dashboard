import {
  Ban,
  CheckCircle,
  Clock,
  Download,
  Eye,
  FileText,
  GitCompare,
  History,
  MapPin,
  MessageSquare,
  Pencil,
  Plus,
  RefreshCw,
  RotateCcw,
  ScanFace,
  Shield,
  Trash2,
  UserPlus,
  XCircle,
} from 'lucide-react'
import type { ActionMenuItem, DetailField } from '@/components/admin/types'
import type { ComplianceDocument, Driver, EligibilityRule, Passenger, Reservation, SurgeZone, Trip } from '@/types'
import type { DriverVerificationFocus } from '@/features/drivers/driverVerificationHelpers'
import { buildCommunicationInboxPath } from '@/features/communication/communicationNavigation'
import { RIDE_CATEGORY_LABELS } from '@/constants'
import { formatCurrency, formatDateTime } from '@/utils/format'
import type { useAdminActions } from '@/hooks/useAdminActions'
import { store } from '@/store'
import { openTripCommunicationDrawer } from '@/store/slices/communicationSlice'

type AdminActions = ReturnType<typeof useAdminActions>

export type DriverActionHandlers = {
  onOpenVerificationDrawer?: (driver: Driver, focus?: DriverVerificationFocus) => void
  onApproveVerification?: (driver: Driver) => void
  onRejectVerification?: (driver: Driver) => void
}

export function openTripDetails(record: Trip, actions: AdminActions) {
  actions.openDrawer(`Trip ${record.id}`, [
    { label: 'Trip ID', value: record.id },
    { label: 'Driver', value: record.driverName },
    { label: 'Passenger', value: record.passengerName },
    { label: 'Category', value: RIDE_CATEGORY_LABELS[record.category] },
    { label: 'Pickup', value: record.pickup },
    { label: 'Dropoff', value: record.dropoff },
    { label: 'Distance', value: '12.4 mi' },
    { label: 'Duration', value: '28 min' },
    { label: 'Fare', value: formatCurrency(record.fare) },
    { label: 'Payment Method', value: 'Card ending 4242' },
    { label: 'Trip Status', value: record.status },
    { label: 'Created Time', value: formatDateTime(record.startedAt) },
  ])
}

export function getTripActionItems(): ActionMenuItem[] {
  return [
    { key: 'view-details', label: 'View Details', icon: Eye, group: 1 },
    { key: 'communication-center', label: 'Communication Center', icon: MessageSquare, group: 1 },
    { key: 'trip-timeline', label: 'Trip Timeline', icon: Clock, group: 1 },
    { key: 'safety-review', label: 'Safety Review', icon: Shield, group: 2 },
    { key: 'cancel', label: 'Cancel Trip', icon: XCircle, danger: true, group: 2 },
  ]
}

export function handleTripAction(
  key: string,
  record: Trip,
  actions: AdminActions,
  options?: { onNavigate?: (path: string) => void },
) {
  const name = record.id
  switch (key) {
    case 'view-details':
      if (options?.onNavigate) {
        options.onNavigate(`/operations/live-trips/${record.id}`)
      } else {
        openTripDetails(record, actions)
      }
      break
    case 'communication-center':
      store.dispatch(openTripCommunicationDrawer({ trip: record, tab: 'both' }))
      break
    case 'trip-timeline':
      store.dispatch(openTripCommunicationDrawer({ trip: record, tab: 'timeline' }))
      break
    case 'safety-review':
      if (options?.onNavigate) {
        options.onNavigate(buildCommunicationInboxPath('safety'))
      } else {
        store.dispatch(openTripCommunicationDrawer({ trip: record, tab: 'safety' }))
      }
      break
    case 'cancel':
      actions.openConfirm({
        title: 'Cancel Trip',
        description: `Cancel trip ${record.id}? This action cannot be undone.`,
        confirmLabel: 'Cancel Trip',
        danger: true,
        onConfirm: async () => actions.notify('Trip cancelled', name),
      })
      break
    default:
      break
  }
}

export function openDriverDetails(record: Driver, actions: AdminActions) {
  actions.openDrawer(`Driver — ${record.name}`, [
    { label: 'Driver ID', value: record.id },
    { label: 'Email', value: record.email },
    { label: 'Phone', value: record.phone },
    { label: 'Vehicle', value: record.vehicle },
    { label: 'Rating', value: `${record.rating} ★` },
    { label: 'Completed Trips', value: record.completedTrips },
    { label: 'Compliance', value: record.complianceStatus },
    { label: 'Background Check', value: record.backgroundCheckStatus },
    { label: 'Status', value: record.status },
    { label: 'Earnings', value: formatCurrency(record.earnings) },
  ])
}

export function getActiveDriverActionItems(): ActionMenuItem[] {
  return [
    { key: 'edit', label: 'Edit Driver', icon: Pencil, group: 1 },
    { key: 'message', label: 'Open Communication', icon: MessageSquare, group: 1 },
    { key: 'documents', label: 'View Documents', icon: FileText, group: 1 },
    { key: 'compliance', label: 'View Compliance', icon: FileText, group: 1 },
    { key: 'eligibility', label: 'View Eligibility', icon: FileText, group: 1 },
    { key: 'earnings', label: 'View Earnings', icon: FileText, group: 1 },
    { key: 'suspend', label: 'Suspend Driver', icon: Ban, group: 2 },
    { key: 'reactivate', label: 'Reactivate Driver', icon: RefreshCw, group: 2 },
  ]
}

export function getDriverManagementActionItems(): ActionMenuItem[] {
  return [
    ...getActiveDriverActionItems(),
    { key: 'message', label: 'Open Communication', icon: MessageSquare, group: 1 },
    { key: 'view-verification-history', label: 'View Verification History', icon: History, group: 4 },
    { key: 'request-re-verification', label: 'Request Re-Verification', icon: RefreshCw, group: 4 },
    { key: 'review-live-selfie', label: 'Review Live Selfie', icon: ScanFace, group: 4 },
    { key: 'compare-photos', label: 'Compare Profile Photo vs Live Selfie', icon: GitCompare, group: 4 },
    { key: 'approve-verification', label: 'Approve Verification', icon: CheckCircle, group: 4 },
    { key: 'reject-verification', label: 'Reject Verification', icon: XCircle, danger: true, group: 4 },
    { key: 'approve', label: 'Approve Driver', icon: CheckCircle, group: 3 },
    { key: 'reject', label: 'Reject Driver', icon: XCircle, danger: true, group: 3 },
  ]
}

export function handleDriverAction(
  key: string,
  record: Driver,
  actions: AdminActions,
  handlers?: DriverActionHandlers,
) {
  const label = record.name
  switch (key) {
    case 'edit':
      actions.openDrawer(`Edit ${label}`, [
        { label: 'Email', value: record.email },
        { label: 'Phone', value: record.phone },
        { label: 'Vehicle', value: record.vehicle },
        { label: 'Status', value: record.status },
      ])
      break
    case 'approve':
      actions.openApproval({
        title: 'Approve Driver',
        entityLabel: label,
        onApprove: async () => actions.notify('Driver approved', label),
      })
      break
    case 'reject':
      actions.openConfirm({
        title: 'Reject Driver',
        description: `Reject driver application for ${label}?`,
        confirmLabel: 'Reject',
        danger: true,
        onConfirm: async () => actions.notify('Driver rejected', label),
      })
      break
    case 'suspend':
      actions.openSuspension({
        title: 'Suspend Driver',
        entityLabel: `Suspend ${label}`,
        onConfirm: async () => actions.notify('Driver suspended', label),
      })
      break
    case 'reactivate':
      actions.openConfirm({
        title: 'Reactivate Driver',
        description: `Restore access for ${label}?`,
        confirmLabel: 'Reactivate',
        onConfirm: async () => actions.notify('Driver reactivated', label),
      })
      break
    case 'message':
      globalThis.location.assign(buildCommunicationInboxPath('driver'))
      break
    case 'documents':
    case 'compliance':
    case 'eligibility':
    case 'earnings':
      actions.openDrawer(`${key.replace('-', ' ')} — ${label}`, [
        { label: 'Driver ID', value: record.id },
        { label: 'Compliance', value: record.complianceStatus },
        { label: 'Background Check', value: record.backgroundCheckStatus },
        { label: 'Earnings', value: formatCurrency(record.earnings) },
      ])
      break
    case 'view-verification-history':
      handlers?.onOpenVerificationDrawer?.(record, 'history')
      break
    case 'request-re-verification':
      handlers?.onOpenVerificationDrawer?.(record, 'security')
      break
    case 'review-live-selfie':
      handlers?.onOpenVerificationDrawer?.(record, 'selfie')
      break
    case 'compare-photos':
      handlers?.onOpenVerificationDrawer?.(record, 'compare')
      break
    case 'approve-verification':
      if (handlers?.onApproveVerification) {
        handlers.onApproveVerification(record)
      } else {
        actions.openConfirm({
          title: 'Approve Verification',
          description: `Approve identity verification for ${label}?`,
          confirmLabel: 'Approve',
          onConfirm: async () => actions.notify('Verification approved', label),
        })
      }
      break
    case 'reject-verification':
      if (handlers?.onRejectVerification) {
        handlers.onRejectVerification(record)
      } else {
        actions.openConfirm({
          title: 'Reject Verification',
          description: `Reject identity verification for ${label}?`,
          confirmLabel: 'Reject',
          danger: true,
          onConfirm: async () => actions.notify('Verification rejected', label),
        })
      }
      break
    default:
      break
  }
}

export function openPassengerDetails(record: Passenger, actions: AdminActions) {
  actions.openDrawer(`Passenger — ${record.name}`, [
    { label: 'Passenger ID', value: record.id },
    { label: 'Email', value: record.email },
    { label: 'Phone', value: record.phone },
    { label: 'Rating', value: `${record.rating} ★` },
    { label: 'Completed Trips', value: record.completedTrips },
    { label: 'Wallet Balance', value: formatCurrency(record.walletBalance) },
    { label: 'City', value: record.city },
    { label: 'Status', value: record.status },
  ])
}

export function getPassengerActionItems(): ActionMenuItem[] {
  return [
    { key: 'edit', label: 'Edit Passenger', icon: Pencil, group: 1 },
    { key: 'message', label: 'Open Communication', icon: MessageSquare, group: 1 },
    { key: 'wallet', label: 'Wallet History', icon: FileText, group: 1 },
    { key: 'trips', label: 'Trip History', icon: FileText, group: 1 },
    { key: 'suspend', label: 'Suspend Passenger', icon: Ban, group: 2 },
    { key: 'reactivate', label: 'Reactivate Passenger', icon: RefreshCw, group: 2 },
  ]
}

export function handlePassengerAction(key: string, record: Passenger, actions: AdminActions) {
  const label = record.name
  switch (key) {
    case 'edit':
      actions.openDrawer(`Edit ${label}`, [
        { label: 'Email', value: record.email },
        { label: 'Phone', value: record.phone },
        { label: 'City', value: record.city },
        { label: 'Status', value: record.status },
      ])
      break
    case 'suspend':
      actions.openSuspension({
        title: 'Suspend Passenger',
        entityLabel: `Suspend ${label}`,
        onConfirm: async () => actions.notify('Passenger suspended', label),
      })
      break
    case 'reactivate':
      actions.openConfirm({
        title: 'Reactivate Passenger',
        description: `Restore access for ${label}?`,
        confirmLabel: 'Reactivate',
        onConfirm: async () => actions.notify('Passenger reactivated', label),
      })
      break
    case 'wallet':
      actions.openDrawer(`Wallet History — ${label}`, [
        { label: 'Current Balance', value: formatCurrency(record.walletBalance) },
        { label: 'Completed Trips', value: record.completedTrips },
      ])
      break
    case 'trips':
      actions.openDrawer(`Trip History — ${label}`, [
        { label: 'Completed Trips', value: record.completedTrips },
        { label: 'Rating', value: `${record.rating} ★` },
        { label: 'City', value: record.city },
      ])
      break
    case 'message':
      globalThis.location.assign(buildCommunicationInboxPath('passenger'))
      break
    default:
      break
  }
}

export function openComplianceDetails(record: ComplianceDocument, actions: AdminActions) {
  actions.openDrawer('Document Details', [
    { label: 'Driver', value: record.driverName },
    { label: 'Document Type', value: record.type },
    { label: 'Status', value: record.status },
    { label: 'Submitted', value: formatDateTime(record.submittedAt) },
    { label: 'Expires', value: record.expiresAt ? formatDateTime(record.expiresAt) : '—' },
  ])
}

export function getComplianceActionItems(): ActionMenuItem[] {
  return [
    { key: 'approve', label: 'Approve', icon: CheckCircle, group: 1 },
    { key: 'reject', label: 'Reject', icon: XCircle, danger: true, group: 1 },
    { key: 'reupload', label: 'Request Reupload', icon: RotateCcw, group: 2 },
    { key: 'download', label: 'Download Document', icon: Download, group: 2 },
  ]
}

export function handleComplianceAction(key: string, record: ComplianceDocument, actions: AdminActions) {
  const label = `${record.driverName} — ${record.type}`
  switch (key) {
    case 'download':
      actions.notify('Document downloaded', label)
      break
    case 'approve':
      actions.openApproval({
        title: 'Approve Document',
        entityLabel: label,
        onApprove: async () => actions.notify('Document approved', label),
      })
      break
    case 'reject':
      actions.openConfirm({
        title: 'Reject Document',
        description: `Reject ${record.type} for ${record.driverName}?`,
        confirmLabel: 'Reject',
        danger: true,
        onConfirm: async () => actions.notify('Document rejected', label),
      })
      break
    case 'reupload':
      actions.notify('Reupload requested', label)
      break
    default:
      break
  }
}

export function openReservationDetails(record: Reservation, actions: AdminActions) {
  actions.openDrawer(`Reservation ${record.id}`, [
    { label: 'Passenger', value: record.passengerName },
    { label: 'Type', value: record.type },
    { label: 'Pickup', value: record.pickup },
    { label: 'Dropoff', value: record.dropoff },
    { label: 'Scheduled', value: formatDateTime(record.scheduledAt) },
    { label: 'Category', value: RIDE_CATEGORY_LABELS[record.category] },
    { label: 'Driver', value: record.driverName ?? 'Unassigned' },
    { label: 'Status', value: record.status },
  ])
}

export function getReservationActionItems(): ActionMenuItem[] {
  return [
    { key: 'edit', label: 'Edit Reservation', icon: Pencil, group: 1 },
    { key: 'assign', label: 'Assign Driver', icon: UserPlus, group: 1 },
    { key: 'reassign', label: 'Reassign Driver', icon: RefreshCw, group: 1 },
    { key: 'cancel', label: 'Cancel Reservation', icon: XCircle, danger: true, group: 2 },
  ]
}

export function handleReservationAction(key: string, record: Reservation, actions: AdminActions) {
  const label = record.id
  switch (key) {
    case 'edit':
      actions.openDrawer(`Edit Reservation ${record.id}`, [
        { label: 'Passenger', value: record.passengerName },
        { label: 'Pickup', value: record.pickup },
        { label: 'Dropoff', value: record.dropoff },
      ])
      break
    case 'assign':
    case 'reassign':
      actions.notify(key === 'assign' ? 'Driver assigned' : 'Driver reassigned', label)
      break
    case 'cancel':
      actions.openConfirm({
        title: 'Cancel Reservation',
        description: `Cancel reservation ${record.id}?`,
        confirmLabel: 'Cancel Reservation',
        danger: true,
        onConfirm: async () => actions.notify('Reservation cancelled', label),
      })
      break
    default:
      break
  }
}

export function openEligibilityDetails(record: EligibilityRule, actions: AdminActions) {
  actions.openDrawer(`Eligibility — ${record.name}`, [
    { label: 'Rule Name', value: record.name },
    { label: 'Scope', value: record.scope },
    { label: 'Scope Value', value: record.scopeValue },
    { label: 'Category', value: RIDE_CATEGORY_LABELS[record.category] },
    { label: 'Min Year', value: record.minVehicleYear },
    { label: 'Max Age', value: record.maxVehicleAge },
    { label: 'Min Rating', value: record.minRating },
    { label: 'Active', value: record.active ? 'Yes' : 'No' },
  ])
}

export function openEligibilityRecordDetails(
  record: Record<string, unknown>,
  actions: AdminActions,
  title?: string,
) {
  const fields: DetailField[] = Object.entries(record)
    .filter(([key]) => key !== 'key')
    .slice(0, 10)
    .map(([label, value]) => ({ label, value: String(value ?? '—') }))
  actions.openDrawer(title ?? 'Eligibility Details', fields)
}

export function getEligibilityActionItems(): ActionMenuItem[] {
  return [
    { key: 'add-category', label: 'Add Category', icon: Plus, group: 1 },
    { key: 'remove-category', label: 'Remove Category', icon: XCircle, group: 1 },
    { key: 'override', label: 'Override Eligibility', icon: Pencil, group: 2 },
    { key: 'restore', label: 'Restore Eligibility', icon: RefreshCw, group: 2 },
  ]
}

export function handleEligibilityRuleAction(key: string, record: EligibilityRule, actions: AdminActions) {
  handleGenericAction(key, record as unknown as Record<string, unknown>, actions, record.name)
}

export function openTransactionDetails(record: Record<string, unknown>, actions: AdminActions) {
  const name = String(record.id ?? record.driver ?? 'Transaction')
  actions.openDrawer(`Transaction — ${name}`, Object.entries(record).slice(0, 8).map(([label, value]) => ({
    label,
    value: String(value ?? '—'),
  })))
}

export function getFinanceActionItems(): ActionMenuItem[] {
  return [
    { key: 'refund', label: 'Refund Payment', icon: RotateCcw, group: 1 },
    { key: 'export', label: 'Export Transaction', icon: Download, group: 1 },
    { key: 'payout', label: 'View Payout Details', icon: FileText, group: 2 },
  ]
}

export function handleFinanceAction(key: string, record: Record<string, unknown>, actions: AdminActions) {
  const name = String(record.id ?? record.driver ?? 'Transaction')
  switch (key) {
    case 'refund':
      actions.openConfirm({
        title: 'Refund Payment',
        description: `Issue refund for ${name}?`,
        confirmLabel: 'Refund',
        danger: true,
        onConfirm: async () => actions.notify('Refund processed', name),
      })
      break
    case 'export':
      actions.notify('Transaction exported', name)
      break
    case 'payout':
      actions.openDrawer(`Payout Details — ${name}`, Object.entries(record).slice(0, 6).map(([k, v]) => ({
        label: k,
        value: String(v ?? '—'),
      })))
      break
    default:
      break
  }
}

export function openReportDetails(record: Record<string, unknown>, actions: AdminActions, title?: string) {
  const name = String(record.event ?? record.name ?? record.label ?? 'Report')
  actions.openDrawer(title ?? `Report — ${name}`, Object.entries(record).slice(0, 8).map(([label, value]) => ({
    label,
    value: String(value ?? '—'),
  })))
}

export function getReportActionItems(): ActionMenuItem[] {
  return [
    { key: 'export-pdf', label: 'Export PDF', icon: Download, group: 1 },
    { key: 'export-csv', label: 'Export CSV', icon: Download, group: 1 },
    { key: 'export-excel', label: 'Export Excel', icon: Download, group: 1 },
    { key: 'schedule', label: 'Schedule Report', icon: FileText, group: 2 },
  ]
}

export function handleReportAction(key: string, record: Record<string, unknown>, actions: AdminActions) {
  const name = String(record.event ?? record.name ?? record.label ?? 'Report')
  switch (key) {
    case 'export-pdf':
      actions.notify('Report exported as PDF', name)
      break
    case 'export-csv':
      actions.notify('Report exported as CSV', name)
      break
    case 'export-excel':
      actions.notify('Report exported as Excel', name)
      break
    case 'schedule':
      actions.notify('Report scheduled', name)
      break
    default:
      break
  }
}

export function openSurgeDetails(record: SurgeZone, actions: AdminActions) {
  actions.openDrawer(`Surge Zone — ${record.name}`, [
    { label: 'Zone', value: record.name },
    { label: 'City', value: record.city },
    { label: 'Multiplier', value: `${record.multiplier}x` },
    { label: 'Demand', value: record.demand },
    { label: 'Supply', value: record.supply },
    { label: 'Active', value: record.active ? 'Yes' : 'No' },
  ])
}

export function getSurgeActionItems(): ActionMenuItem[] {
  return [
    { key: 'edit', label: 'Edit Surge Multiplier', icon: Pencil, group: 1 },
    { key: 'history', label: 'View Surge History', icon: FileText, group: 1 },
    { key: 'disable', label: 'Disable Surge', icon: Ban, group: 2 },
  ]
}

export function handleSurgeAction(key: string, record: SurgeZone, actions: AdminActions) {
  const name = record.name
  switch (key) {
    case 'edit':
      actions.openDrawer(`Edit Multiplier — ${name}`, [
        { label: 'Current Multiplier', value: `${record.multiplier}x` },
        { label: 'City', value: record.city },
      ])
      break
    case 'disable':
      actions.openConfirm({
        title: 'Disable Surge',
        description: `Disable surge pricing for ${name}?`,
        confirmLabel: 'Disable',
        danger: true,
        onConfirm: async () => actions.notify('Surge disabled', name),
      })
      break
    default:
      actions.notify(key.replace(/-/g, ' '), name)
      break
  }
}

export function getDemandActionItems(): ActionMenuItem[] {
  return [
    { key: 'create', label: 'Create Opportunity', icon: Plus, group: 1 },
    { key: 'edit', label: 'Edit Opportunity', icon: Pencil, group: 1 },
    { key: 'assign', label: 'Assign Drivers', icon: UserPlus, group: 2 },
    { key: 'predictions', label: 'View Predictions', icon: FileText, group: 2 },
  ]
}

export function getAirportActionItems(): ActionMenuItem[] {
  return [
    { key: 'edit', label: 'Edit Airport Rules', icon: Pencil, group: 1 },
    { key: 'queue', label: 'Manage Queue', icon: MapPin, group: 1 },
    { key: 'priority', label: 'Assign Priority Drivers', icon: UserPlus, group: 2 },
    { key: 'analytics', label: 'View Airport Analytics', icon: FileText, group: 2 },
  ]
}

export function getRideCategoryActionItems(): ActionMenuItem[] {
  return [
    { key: 'edit', label: 'Edit Category', icon: Pencil, group: 1 },
    { key: 'activate', label: 'Activate Category', icon: CheckCircle, group: 1 },
    { key: 'deactivate', label: 'Deactivate Category', icon: Ban, group: 1 },
    { key: 'requirements', label: 'Configure Requirements', icon: FileText, group: 2 },
  ]
}

export function getSettingsActionItems(): ActionMenuItem[] {
  return [
    { key: 'edit', label: 'Edit Settings', icon: Pencil, group: 1 },
    { key: 'save', label: 'Save Changes', icon: CheckCircle, group: 1 },
    { key: 'reset', label: 'Reset Settings', icon: RotateCcw, group: 2 },
    { key: 'audit', label: 'View Audit Logs', icon: FileText, group: 2 },
  ]
}

export function getGenericActionItems(options?: {
  edit?: boolean
  remove?: boolean
  export?: boolean
  extra?: ActionMenuItem[]
}): ActionMenuItem[] {
  const items: ActionMenuItem[] = []
  if (options?.edit !== false) items.push({ key: 'edit', label: 'Edit', icon: Pencil, group: 1 })
  if (options?.extra) items.push(...options.extra.map((item) => ({ ...item, group: item.group ?? 1 })))
  if (options?.export) items.push({ key: 'export', label: 'Export', icon: Download, group: 1 })
  if (options?.remove) items.push({ key: 'delete', label: 'Delete', icon: Trash2, danger: true, group: 2 })
  return items
}

export function openGenericDetails(
  record: Record<string, unknown>,
  actions: AdminActions,
  title?: string,
) {
  const name = String(record.name ?? record.id ?? record.driver ?? record.driverName ?? record.event ?? 'Details')
  actions.openDrawer(title ?? name, Object.entries(record).slice(0, 10).map(([label, value]) => ({
    label,
    value: String(value ?? '—'),
  })))
}

export function handleGenericAction(
  key: string,
  record: Record<string, unknown>,
  actions: AdminActions,
  entityName = 'Record',
) {
  const name = String(record.name ?? record.id ?? record.driver ?? record.driverName ?? entityName)
  switch (key) {
    case 'edit':
      actions.openDrawer(`Edit ${name}`, Object.entries(record).slice(0, 6).map(([k, v]) => ({
        label: k,
        value: String(v ?? '—'),
      })))
      break
    case 'export':
      actions.notify('Exported', name)
      break
    case 'delete':
      actions.openConfirm({
        title: 'Delete Record',
        description: `Delete ${name}? This action cannot be undone.`,
        confirmLabel: 'Delete',
        danger: true,
        onConfirm: async () => actions.notify('Deleted', name),
      })
      break
    default:
      actions.notify(key.replace(/-/g, ' '), name)
      break
  }
}
