import type {
  BroadcastRecord,
  ChatMessage,
  CommunicationAnalytics,
  CommunicationHistoryEntry,
  CommunicationInboxItem,
  CommunicationInboxOverview,
  CommunicationInboxParams,
  CommunicationListResponse,
  CommunicationOverview,
  Conversation,
  InternalNote,
  MessageTemplate,
  SafetyCommunication,
  SupportCase,
  SupportTicket,
} from '@/types/communication'
import type { CommunicationInboxType, CommunicationListParams } from '@/types/communication'
import { mockTrips } from '@/services/mock/data'

export let mockConversations: Conversation[] = [
  {
    id: 'conv-1',
    userName: 'Marcus Johnson',
    userType: 'driver',
    userId: 'd-204',
    lastMessage: 'Passenger is not at pickup location',
    priority: 'high',
    assignedAgent: 'Sarah Kim',
    status: 'in_progress',
    lastActivity: '2026-06-13T14:22:00Z',
    category: 'active_trip',
    tripId: 'TR-5000',
    city: 'San Francisco',
    isOnline: true,
    unreadCount: 2,
    isTyping: true,
  },
  {
    id: 'conv-2',
    userName: 'Sarah Chen',
    userType: 'passenger',
    userId: 'p-4412',
    lastMessage: 'Driver is taking a different route',
    priority: 'medium',
    assignedAgent: 'Mike Torres',
    status: 'open',
    lastActivity: '2026-06-13T14:18:00Z',
    category: 'active_trip',
    tripId: 'TR-5000',
    city: 'San Francisco',
    isOnline: true,
    unreadCount: 1,
  },
  {
    id: 'conv-3',
    userName: 'David Kim',
    userType: 'driver',
    userId: 'd-118',
    lastMessage: 'SOS alert acknowledged — need assistance',
    priority: 'critical',
    assignedAgent: 'Safety Team Alpha',
    status: 'escalated',
    lastActivity: '2026-06-13T14:10:00Z',
    category: 'safety',
    tripId: 'TR-5001',
    city: 'Los Angeles',
    isOnline: true,
    unreadCount: 5,
  },
  {
    id: 'conv-4',
    userName: 'James Wilson',
    userType: 'passenger',
    userId: 'p-3891',
    lastMessage: 'Left my phone in the car',
    priority: 'medium',
    assignedAgent: 'Lisa Park',
    status: 'waiting_user',
    lastActivity: '2026-06-13T13:45:00Z',
    category: 'lost_found',
    tripId: 'TR-5002',
    city: 'Los Angeles',
    isOnline: false,
    unreadCount: 0,
  },
  {
    id: 'conv-5',
    userName: 'Lisa Martinez',
    userType: 'driver',
    userId: 'd-089',
    lastMessage: 'Refund request for background check fee',
    priority: 'low',
    assignedAgent: 'Compliance Admin',
    status: 'in_progress',
    lastActivity: '2026-06-13T12:30:00Z',
    category: 'general',
    city: 'San Francisco',
    isOnline: false,
    unreadCount: 0,
  },
  {
    id: 'conv-6',
    userName: 'Elena Rodriguez',
    userType: 'passenger',
    userId: 'p-2201',
    lastMessage: 'Payment was charged twice',
    priority: 'high',
    assignedAgent: 'Mike Torres',
    status: 'escalated',
    lastActivity: '2026-06-13T11:15:00Z',
    category: 'escalation',
    tripId: 'TR-5003',
    city: 'New York',
    isOnline: true,
    unreadCount: 3,
  },
  {
    id: 'conv-7',
    userName: 'Tom Bradley',
    userType: 'driver',
    userId: 'd-312',
    lastMessage: 'Document upload issue resolved, thanks',
    priority: 'low',
    assignedAgent: 'Sarah Kim',
    status: 'resolved',
    lastActivity: '2026-06-12T22:00:00Z',
    category: 'support',
    city: 'Chicago',
    isOnline: false,
    unreadCount: 0,
  },
  {
    id: 'conv-8',
    userName: 'Amy Foster',
    userType: 'passenger',
    userId: 'p-5501',
    lastMessage: 'Driver was very professional',
    priority: 'low',
    assignedAgent: 'Lisa Park',
    status: 'closed',
    lastActivity: '2026-06-12T18:30:00Z',
    category: 'support',
    city: 'Miami',
    isOnline: false,
    unreadCount: 0,
  },
]

const baseMessages: Record<string, ChatMessage[]> = {
  'conv-1': [
    { id: 'm-1', conversationId: 'conv-1', senderId: 'd-204', senderName: 'Marcus Johnson', senderRole: 'driver', type: 'text', content: 'I arrived at the pickup but passenger is not here.', timestamp: '2026-06-13T14:15:00Z', deliveryStatus: 'read', isRead: true },
    { id: 'm-2', conversationId: 'conv-1', senderId: 'admin-1', senderName: 'Sarah Kim', senderRole: 'admin', type: 'text', content: 'Thank you Marcus. We are contacting the passenger now. Please wait 5 minutes.', timestamp: '2026-06-13T14:17:00Z', deliveryStatus: 'read', isRead: true },
    { id: 'm-3', conversationId: 'conv-1', senderId: 'd-204', senderName: 'Marcus Johnson', senderRole: 'driver', type: 'gps', content: 'Current location shared', gpsLabel: 'Pickup — 123 Market St, SF', timestamp: '2026-06-13T14:20:00Z', deliveryStatus: 'delivered', isRead: false },
    { id: 'm-4', conversationId: 'conv-1', senderId: 'd-204', senderName: 'Marcus Johnson', senderRole: 'driver', type: 'text', content: 'Passenger is not at pickup location', timestamp: '2026-06-13T14:22:00Z', deliveryStatus: 'delivered', isRead: false },
  ],
  'conv-2': [
    { id: 'm-5', conversationId: 'conv-2', senderId: 'p-4412', senderName: 'Sarah Chen', senderRole: 'passenger', type: 'text', content: 'The driver seems to be going the wrong way.', timestamp: '2026-06-13T14:10:00Z', deliveryStatus: 'read', isRead: true },
    { id: 'm-6', conversationId: 'conv-2', senderId: 'admin-2', senderName: 'Mike Torres', senderRole: 'admin', type: 'text', content: 'We are reviewing the route now. Your safety is our priority.', timestamp: '2026-06-13T14:12:00Z', deliveryStatus: 'read', isRead: true },
    { id: 'm-7', conversationId: 'conv-2', senderId: 'p-4412', senderName: 'Sarah Chen', senderRole: 'passenger', type: 'text', content: 'Driver is taking a different route', timestamp: '2026-06-13T14:18:00Z', deliveryStatus: 'delivered', isRead: false },
  ],
  'conv-3': [
    { id: 'm-8', conversationId: 'conv-3', senderId: 'system', senderName: 'System', senderRole: 'system', type: 'system', content: 'SOS alert triggered on trip TRP-88190', timestamp: '2026-06-13T14:05:00Z', deliveryStatus: 'read', isRead: true },
    { id: 'm-9', conversationId: 'conv-3', senderId: 'd-118', senderName: 'David Kim', senderRole: 'driver', type: 'voice', content: 'Voice note attached', attachmentName: 'sos_recording.mp3', timestamp: '2026-06-13T14:06:00Z', deliveryStatus: 'read', isRead: true },
    { id: 'm-10', conversationId: 'conv-3', senderId: 'admin-safety', senderName: 'Safety Team Alpha', senderRole: 'admin', type: 'text', content: 'David, we have received your SOS. Are you safe? Please respond.', timestamp: '2026-06-13T14:08:00Z', deliveryStatus: 'read', isRead: true },
    { id: 'm-11', conversationId: 'conv-3', senderId: 'd-118', senderName: 'David Kim', senderRole: 'driver', type: 'text', content: 'SOS alert acknowledged — need assistance', timestamp: '2026-06-13T14:10:00Z', deliveryStatus: 'delivered', isRead: false },
  ],
}

export let mockChatMessages: Record<string, ChatMessage[]> = { ...baseMessages }

export let mockMessageTemplates: MessageTemplate[] = [
  { id: 'tpl-1', name: 'Ride Accepted', category: 'trip_updates', content: 'Your ride has been accepted. Your driver is on the way.', status: 'active', usageCount: 8420, updatedAt: '2026-06-01T00:00:00Z' },
  { id: 'tpl-2', name: 'Ride Cancelled', category: 'cancellation', content: 'Your ride has been cancelled. You will not be charged for this trip.', status: 'active', usageCount: 3180, updatedAt: '2026-06-01T00:00:00Z' },
  { id: 'tpl-3', name: 'Driver Approved', category: 'compliance', content: 'Congratulations! Your driver application has been approved. You can now go online.', status: 'active', usageCount: 1240, updatedAt: '2026-06-02T00:00:00Z' },
  { id: 'tpl-4', name: 'Driver Rejected', category: 'compliance', content: 'Your driver application could not be approved at this time. Please review the requirements and reapply.', status: 'active', usageCount: 420, updatedAt: '2026-06-02T00:00:00Z' },
  { id: 'tpl-5', name: 'Reservation Reminder', category: 'trip_updates', content: 'Reminder: Your scheduled reservation is coming up. Please be ready at the pickup location.', status: 'active', usageCount: 2100, updatedAt: '2026-06-03T00:00:00Z' },
  { id: 'tpl-6', name: 'Payment Success', category: 'payment', content: 'Payment received successfully. Thank you for riding with Alygo.', status: 'active', usageCount: 5600, updatedAt: '2026-06-03T00:00:00Z' },
  { id: 'tpl-7', name: 'Safety Check', category: 'safety', content: 'This is a safety check from Alygo Support. Are you safe and is everything okay with your trip?', status: 'active', usageCount: 420, updatedAt: '2026-06-04T00:00:00Z' },
  { id: 'tpl-8', name: 'Refund Approved', category: 'payment', content: 'Your refund request has been approved. Funds will be returned within 3-5 business days.', status: 'inactive', usageCount: 340, updatedAt: '2026-06-05T00:00:00Z' },
]

export let mockInternalNotes: InternalNote[] = [
  { id: 'note-1', userId: 'p-5501', userName: 'Amy Foster', userType: 'passenger', noteType: 'vip', content: 'VIP passenger — priority support required.', author: 'Sarah Kim', createdAt: '2026-06-10T10:00:00Z' },
  { id: 'note-2', userId: 'd-312', userName: 'Tom Bradley', userType: 'driver', noteType: 'compliance', content: 'Background check pending re-verification.', author: 'Compliance Admin', createdAt: '2026-06-11T14:00:00Z', tripId: 'TRP-87900' },
  { id: 'note-3', userId: 'd-118', userName: 'David Kim', userType: 'driver', noteType: 'safety', content: 'Previous harassment report filed — handle with care.', author: 'Safety Team Alpha', createdAt: '2026-06-12T09:00:00Z', tripId: 'TRP-88190' },
  { id: 'note-4', userId: 'p-2201', userName: 'Elena Rodriguez', userType: 'passenger', noteType: 'fraud', content: 'Multiple chargeback attempts flagged.', author: 'Finance Admin', createdAt: '2026-06-12T16:00:00Z' },
  { id: 'note-5', userId: 'p-3891', userName: 'James Wilson', userType: 'passenger', noteType: 'support', content: 'Repeat lost item reporter — verify claims.', author: 'Lisa Park', createdAt: '2026-06-13T08:00:00Z', tripId: 'TRP-88102' },
]

export let mockSupportTickets: SupportTicket[] = [
  { id: 'ticket-1', ticketId: 'TCK-2026-0412', ticketType: 'safety', userName: 'David Kim', subject: 'SOS alert during active trip', priority: 'critical', status: 'escalated', createdAt: '2026-06-13T14:05:00Z', assignedAgent: 'Safety Team Alpha', description: 'Driver triggered SOS during active trip', tripId: 'TRP-88190', city: 'Los Angeles' },
  { id: 'ticket-2', ticketId: 'TCK-2026-0411', ticketType: 'passenger', userName: 'James Wilson', subject: 'Phone left in vehicle', priority: 'medium', status: 'investigating', createdAt: '2026-06-13T13:40:00Z', assignedAgent: 'Lisa Park', description: 'Lost item report from passenger', tripId: 'TRP-88102', city: 'Los Angeles' },
  { id: 'ticket-3', ticketId: 'TCK-2026-0410', ticketType: 'passenger', userName: 'Elena Rodriguez', subject: 'Double charge on trip', priority: 'high', status: 'waiting_user', createdAt: '2026-06-13T10:00:00Z', assignedAgent: 'Mike Torres', tripId: 'TRP-88055', city: 'New York' },
  { id: 'ticket-4', ticketId: 'TCK-2026-0409', ticketType: 'driver', userName: 'Lisa Martinez', subject: 'Background check fee refund', priority: 'low', status: 'open', createdAt: '2026-06-13T12:00:00Z', city: 'San Francisco' },
  { id: 'ticket-5', ticketId: 'TCK-2026-0408', ticketType: 'driver', userName: 'Marcus Johnson', subject: 'Passenger no-show dispute', priority: 'medium', status: 'resolved', createdAt: '2026-06-12T20:00:00Z', assignedAgent: 'Sarah Kim', tripId: 'TRP-88241', city: 'San Francisco' },
  { id: 'ticket-6', ticketId: 'TCK-2026-0407', ticketType: 'safety', userName: 'Sarah Chen', subject: 'Route deviation concern', priority: 'high', status: 'in_progress', createdAt: '2026-06-13T14:10:00Z', assignedAgent: 'Mike Torres', description: 'Passenger reported route deviation concern', tripId: 'TRP-88241', city: 'San Francisco' },
  { id: 'ticket-7', ticketId: 'TCK-2026-0406', ticketType: 'safety', userName: 'James Wilson', subject: 'Harassment report filed post-trip', priority: 'high', status: 'open', createdAt: '2026-06-12T18:00:00Z', assignedAgent: 'Safety Team Beta', tripId: 'TRP-87800', city: 'Chicago' },
  { id: 'ticket-8', ticketId: 'TCK-2026-0405', ticketType: 'safety', userName: 'Tom Bradley', subject: 'Minor accident reported — no injuries', priority: 'critical', status: 'assigned', createdAt: '2026-06-11T22:00:00Z', assignedAgent: 'Safety Team Alpha', tripId: 'TRP-87750', city: 'Miami' },
  { id: 'ticket-9', ticketId: 'TCK-2026-0404', ticketType: 'driver', userName: 'Tom Bradley', subject: 'Document upload issue', priority: 'low', status: 'closed', createdAt: '2026-06-12T18:00:00Z', assignedAgent: 'Sarah Kim', city: 'Chicago' },
  { id: 'ticket-10', ticketId: 'TCK-2026-0403', ticketType: 'passenger', userName: 'Amy Foster', subject: 'Payment charged twice', priority: 'high', status: 'assigned', createdAt: '2026-06-13T11:00:00Z', assignedAgent: 'Mike Torres', city: 'Miami' },
]

export let mockSupportCases: SupportCase[] = [
  { id: 'case-1', caseNumber: 'CASE-2026-0412', type: 'safety', status: 'escalated', subject: 'SOS alert during active trip', userName: 'David Kim', userType: 'driver', assignedAgent: 'Safety Team Alpha', priority: 'critical', tripId: 'TRP-88190', city: 'Los Angeles', createdAt: '2026-06-13T14:05:00Z', updatedAt: '2026-06-13T14:10:00Z' },
  { id: 'case-2', caseNumber: 'CASE-2026-0411', type: 'lost_found', status: 'investigating', subject: 'Phone left in vehicle', userName: 'James Wilson', userType: 'passenger', assignedAgent: 'Lisa Park', priority: 'medium', tripId: 'TRP-88102', city: 'Los Angeles', createdAt: '2026-06-13T13:40:00Z', updatedAt: '2026-06-13T13:45:00Z' },
  { id: 'case-3', caseNumber: 'CASE-2026-0410', type: 'fare_dispute', status: 'waiting_user', subject: 'Double charge on trip', userName: 'Elena Rodriguez', userType: 'passenger', assignedAgent: 'Mike Torres', priority: 'high', tripId: 'TRP-88055', city: 'New York', createdAt: '2026-06-13T10:00:00Z', updatedAt: '2026-06-13T11:15:00Z' },
  { id: 'case-4', caseNumber: 'CASE-2026-0409', type: 'refund', status: 'open', subject: 'Background check fee refund', userName: 'Lisa Martinez', userType: 'driver', assignedAgent: 'Compliance Admin', priority: 'low', city: 'San Francisco', createdAt: '2026-06-13T12:00:00Z', updatedAt: '2026-06-13T12:30:00Z' },
  { id: 'case-5', caseNumber: 'CASE-2026-0408', type: 'driver_complaint', status: 'resolved', subject: 'Passenger no-show dispute', userName: 'Marcus Johnson', userType: 'driver', assignedAgent: 'Sarah Kim', priority: 'medium', tripId: 'TRP-88241', city: 'San Francisco', createdAt: '2026-06-12T20:00:00Z', updatedAt: '2026-06-13T14:00:00Z' },
]

export let mockSafetyCommunications: SafetyCommunication[] = [
  { id: 'safe-1', reportType: 'sos', userName: 'David Kim', userType: 'driver', tripId: 'TRP-88190', city: 'Los Angeles', status: 'escalated', priority: 'critical', assignedAgent: 'Safety Team Alpha', lastActivity: '2026-06-13T14:10:00Z', description: 'Driver triggered SOS during active trip' },
  { id: 'safe-2', reportType: 'passenger_report', userName: 'Sarah Chen', userType: 'passenger', tripId: 'TRP-88241', city: 'San Francisco', status: 'in_progress', priority: 'high', assignedAgent: 'Mike Torres', lastActivity: '2026-06-13T14:18:00Z', description: 'Passenger reported route deviation concern' },
  { id: 'safe-3', reportType: 'harassment', userName: 'James Wilson', userType: 'passenger', tripId: 'TRP-87800', city: 'Chicago', status: 'open', priority: 'high', assignedAgent: 'Safety Team Beta', lastActivity: '2026-06-12T18:00:00Z', description: 'Harassment report filed post-trip' },
  { id: 'safe-4', reportType: 'accident', userName: 'Tom Bradley', userType: 'driver', tripId: 'TRP-87750', city: 'Miami', status: 'in_progress', priority: 'critical', assignedAgent: 'Safety Team Alpha', lastActivity: '2026-06-11T22:00:00Z', description: 'Minor accident reported — no injuries' },
]

export let mockBroadcasts: BroadcastRecord[] = [
  { id: 'bc-1', title: 'Platform Maintenance', message: 'Scheduled maintenance tonight 2-4 AM PST. Minimal service disruption expected.', broadcastType: 'maintenance', target: 'all_drivers', recipientCount: 12400, sentBy: 'Super Admin', sentAt: '2026-06-12T20:00:00Z', status: 'sent' },
  { id: 'bc-2', title: 'SF Surge Opportunity', message: 'High demand in downtown SF. Surge pricing active — great earning opportunity.', broadcastType: 'surge', target: 'city', targetValue: 'San Francisco', recipientCount: 3200, sentBy: 'Operations Manager', sentAt: '2026-06-13T08:00:00Z', status: 'sent' },
  { id: 'bc-3', title: 'Weather Alert — LA', message: 'Heavy rain expected. Drive safely and allow extra time for pickups.', broadcastType: 'weather', target: 'city', targetValue: 'Los Angeles', recipientCount: 8900, sentBy: 'Operations Manager', sentAt: '2026-06-13T06:00:00Z', status: 'sent' },
  { id: 'bc-4', title: 'Holiday Service Hours', message: 'Alygo will operate with extended hours during the holiday weekend.', broadcastType: 'service', target: 'all_passengers', recipientCount: 0, sentBy: 'Admin', sentAt: '2026-06-20T09:00:00Z', status: 'scheduled' },
  { id: 'bc-5', title: 'Driver Safety Reminder', message: 'Complete your weekly safety checklist before your next shift.', broadcastType: 'platform_update', target: 'all_drivers', recipientCount: 0, sentBy: 'Admin', sentAt: '2026-06-18T07:00:00Z', status: 'scheduled' },
]

export let mockCommunicationHistory: CommunicationHistoryEntry[] = [
  { id: 'hist-1', eventType: 'message', description: 'Admin sent safety check message', userName: 'David Kim', userType: 'driver', agent: 'Safety Team Alpha', tripId: 'TRP-88190', city: 'Los Angeles', timestamp: '2026-06-13T14:08:00Z' },
  { id: 'hist-2', eventType: 'escalation', description: 'Case escalated to senior safety team', userName: 'David Kim', userType: 'driver', agent: 'Safety Team Alpha', tripId: 'TRP-88190', city: 'Los Angeles', timestamp: '2026-06-13T14:09:00Z' },
  { id: 'hist-3', eventType: 'status_change', description: 'Conversation status changed to In Progress', userName: 'Marcus Johnson', userType: 'driver', agent: 'Sarah Kim', tripId: 'TRP-88241', city: 'San Francisco', timestamp: '2026-06-13T14:17:00Z' },
  { id: 'hist-4', eventType: 'note', description: 'Internal fraud note added', userName: 'Elena Rodriguez', userType: 'passenger', agent: 'Finance Admin', city: 'New York', timestamp: '2026-06-12T16:00:00Z' },
  { id: 'hist-5', eventType: 'attachment', description: 'Voice note uploaded', userName: 'David Kim', userType: 'driver', tripId: 'TRP-88190', city: 'Los Angeles', timestamp: '2026-06-13T14:06:00Z' },
]

export function computeCommunicationOverview(): CommunicationOverview {
  const active = mockConversations.filter((c) => !['resolved', 'closed'].includes(c.status))
  return {
    openConversations: active.length,
    activeSupportAgents: 8,
    activeDriverChats: mockConversations.filter((c) => c.userType === 'driver' && !['resolved', 'closed'].includes(c.status)).length,
    activePassengerChats: mockConversations.filter((c) => c.userType === 'passenger' && !['resolved', 'closed'].includes(c.status)).length,
    averageResponseTimeMinutes: 3.2,
    resolvedConversations: mockConversations.filter((c) => c.status === 'resolved').length,
    safetyCases: mockSafetyCommunications.filter((s) => !['resolved', 'closed'].includes(s.status)).length,
    escalatedCases: mockConversations.filter((c) => c.status === 'escalated').length,
  }
}

export function computeCommunicationAnalytics(): CommunicationAnalytics {
  return {
    summary: {
      totalConversations: 1842,
      averageResolutionTimeHours: 4.6,
      firstResponseTimeMinutes: 2.8,
      escalationRate: 8.4,
      satisfactionScore: 4.6,
    },
    conversationsPerDay: [
      { label: 'Mon', value: 245 },
      { label: 'Tue', value: 268 },
      { label: 'Wed', value: 290 },
      { label: 'Thu', value: 312 },
      { label: 'Fri', value: 285 },
      { label: 'Sat', value: 220 },
      { label: 'Sun', value: 198 },
    ],
    responseTimeTrend: [
      { label: 'Mon', value: 3.8, secondary: 2.1 },
      { label: 'Tue', value: 3.2, secondary: 1.9 },
      { label: 'Wed', value: 2.9, secondary: 1.8 },
      { label: 'Thu', value: 3.1, secondary: 2.0 },
      { label: 'Fri', value: 3.5, secondary: 2.2 },
      { label: 'Sat', value: 4.2, secondary: 2.8 },
      { label: 'Sun', value: 4.0, secondary: 2.5 },
    ],
    resolutionRate: [
      { label: 'Mon', value: 92 },
      { label: 'Tue', value: 94 },
      { label: 'Wed', value: 91 },
      { label: 'Thu', value: 95 },
      { label: 'Fri', value: 89 },
      { label: 'Sat', value: 88 },
      { label: 'Sun', value: 90 },
    ],
    safetyCasesTrend: [
      { label: 'Mon', value: 4 },
      { label: 'Tue', value: 6 },
      { label: 'Wed', value: 3 },
      { label: 'Thu', value: 8 },
      { label: 'Fri', value: 5 },
      { label: 'Sat', value: 7 },
      { label: 'Sun', value: 2 },
    ],
    agentPerformance: [
      { label: 'Sarah K.', value: 98 },
      { label: 'Mike T.', value: 94 },
      { label: 'Lisa P.', value: 91 },
      { label: 'Safety A.', value: 96 },
      { label: 'Compliance', value: 88 },
    ],
    satisfactionTrend: [
      { label: 'Mon', value: 4.5 },
      { label: 'Tue', value: 4.6 },
      { label: 'Wed', value: 4.7 },
      { label: 'Thu', value: 4.6 },
      { label: 'Fri', value: 4.5 },
      { label: 'Sat', value: 4.4 },
      { label: 'Sun', value: 4.5 },
    ],
  }
}

export function getActiveTripChats() {
  const activeTrips = mockTrips.filter((t) => ['accepted', 'in_progress', 'requested'].includes(t.status))
  return activeTrips.slice(0, 10).map((trip, i) => {
    const conv = mockConversations.find((c) => c.tripId === trip.id)
    return {
      trip,
      conversationId: conv?.id ?? mockConversations[i % mockConversations.length]?.id ?? `conv-trip-${trip.id}`,
      driverOnline: i % 2 === 0,
      passengerOnline: i % 3 !== 0,
      unreadCount: conv?.unreadCount ?? i % 4,
      lastMessage: conv?.lastMessage ?? 'No messages yet',
      lastActivity: conv?.lastActivity ?? trip.startedAt,
    }
  })
}

const TICKET_CONVERSATION_MAP: Record<string, string> = {
  'ticket-1': 'conv-3',
  'ticket-2': 'conv-4',
  'ticket-3': 'conv-6',
  'ticket-5': 'conv-1',
}

function mapConversationInboxType(conversation: Conversation): CommunicationInboxType {
  if (conversation.category === 'safety') return 'safety'
  if (['support', 'general', 'lost_found', 'escalation'].includes(conversation.category)) return 'support'
  if (conversation.userType === 'driver') return 'driver'
  if (conversation.userType === 'passenger') return 'passenger'
  return 'support'
}

function conversationToInbox(conversation: Conversation): CommunicationInboxItem {
  return {
    id: conversation.id,
    ticketId: `CONV-${conversation.id.replace('conv-', '').toUpperCase()}`,
    userOrGroup: conversation.userName,
    communicationType: mapConversationInboxType(conversation),
    subject: conversation.lastMessage,
    priority: conversation.priority,
    lastActivity: conversation.lastActivity,
    status: conversation.status,
    conversationId: conversation.id,
    unreadCount: conversation.unreadCount,
    assignedAgent: conversation.assignedAgent,
    tripId: conversation.tripId,
    userId: conversation.userId,
  }
}

function ticketToInbox(ticket: SupportTicket): CommunicationInboxItem {
  const communicationType: CommunicationInboxType =
    ticket.ticketType === 'safety'
      ? 'safety'
      : ticket.ticketType === 'driver'
        ? 'driver'
        : ticket.ticketType === 'passenger'
          ? 'passenger'
          : 'support'

  return {
    id: ticket.id,
    ticketId: ticket.ticketId,
    userOrGroup: ticket.userName,
    communicationType,
    subject: ticket.subject,
    priority: ticket.priority,
    lastActivity: ticket.createdAt,
    status: ticket.status,
    conversationId: TICKET_CONVERSATION_MAP[ticket.id],
    unreadCount: 0,
    assignedAgent: ticket.assignedAgent,
    tripId: ticket.tripId,
  }
}


export function buildCommunicationInbox(): CommunicationInboxItem[] {
  const conversationUsers = new Set(mockConversations.map((c) => c.userName))
  const ticketItems = mockSupportTickets
    .filter((ticket) => !conversationUsers.has(ticket.userName) || ticket.ticketType === 'safety')
    .map(ticketToInbox)
  const systemItems: CommunicationInboxItem[] = [
    {
      id: 'sys-1',
      ticketId: 'SYS-1001',
      userOrGroup: 'Platform Operations',
      communicationType: 'system',
      subject: 'Scheduled maintenance window — driver app v4.2',
      priority: 'medium',
      lastActivity: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
      status: 'open',
      unreadCount: 0,
    },
    {
      id: 'sys-2',
      ticketId: 'SYS-1002',
      userOrGroup: 'Compliance',
      communicationType: 'system',
      subject: 'Background check policy update effective April 1',
      priority: 'high',
      lastActivity: new Date(Date.now() - 26 * 60 * 60 * 1000).toISOString(),
      status: 'in_progress',
      unreadCount: 1,
    },
    {
      id: 'sys-3',
      ticketId: 'SYS-1003',
      userOrGroup: 'Payments',
      communicationType: 'system',
      subject: 'Payout processor reconciliation completed',
      priority: 'low',
      lastActivity: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
      status: 'resolved',
      unreadCount: 0,
    },
  ]
  return [...mockConversations.map(conversationToInbox), ...ticketItems, ...systemItems].sort(
    (a, b) => new Date(b.lastActivity).getTime() - new Date(a.lastActivity).getTime(),
  )
}

export function computeCommunicationInboxOverview(): CommunicationInboxOverview {
  const inbox = buildCommunicationInbox()
  const today = new Date().toISOString().slice(0, 10)
  return {
    totalConversations: mockConversations.length + mockSupportTickets.length,
    unreadMessages: mockConversations.reduce((sum, c) => sum + c.unreadCount, 0),
    openCases: inbox.filter((item) => !['resolved', 'closed', 'sent'].includes(item.status)).length,
    broadcastsSentToday: mockBroadcasts.filter(
      (b) => b.status === 'sent' && b.sentAt.slice(0, 10) === today,
    ).length,
  }
}

export function paginateCommunicationInbox(
  params: CommunicationInboxParams,
): CommunicationListResponse<CommunicationInboxItem> {
  const page = params.page ?? 1
  const pageSize = params.pageSize ?? 10
  const search = (params.search ?? '').trim().toLowerCase()
  const communicationType = (params.communicationType ?? '').trim()
  const status = (params.status ?? '').trim()
  const priority = (params.priority ?? '').trim()

  let filtered = buildCommunicationInbox()

  if (communicationType) {
    filtered = filtered.filter((item) => item.communicationType === communicationType)
  }
  if (status) {
    filtered = filtered.filter((item) => matchesInboxStatusFilter(item.status, status))
  }
  if (priority) {
    filtered = filtered.filter((item) => item.priority === priority)
  }
  if (search) {
    filtered = filtered.filter(
      (item) =>
        item.userOrGroup.toLowerCase().includes(search) ||
        (item.ticketId ?? '').toLowerCase().includes(search) ||
        item.subject.toLowerCase().includes(search),
    )
  }

  const start = (page - 1) * pageSize
  return {
    data: filtered.slice(start, start + pageSize),
    total: filtered.length,
    page,
    pageSize,
  }
}

function matchesInboxStatusFilter(itemStatus: string, filterStatus: string): boolean {
  if (filterStatus === 'in_progress') {
    return ['in_progress', 'waiting_user', 'investigating', 'escalated', 'assigned'].includes(itemStatus)
  }
  return itemStatus === filterStatus
}

export function paginateSupportTickets(
  params: CommunicationListParams,
): CommunicationListResponse<SupportTicket> {
  const page = params.page ?? 1
  const pageSize = params.pageSize ?? 10
  const search = (params.search ?? '').trim().toLowerCase()
  const ticketType = (params.ticketType ?? '').trim()

  let filtered = [...mockSupportTickets].sort(
    (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
  )

  if (search) {
    filtered = filtered.filter(
      (ticket) =>
        ticket.ticketId.toLowerCase().includes(search) ||
        ticket.userName.toLowerCase().includes(search) ||
        ticket.subject.toLowerCase().includes(search),
    )
  }
  if (ticketType) {
    filtered = filtered.filter((ticket) => ticket.ticketType === ticketType)
  }

  const start = (page - 1) * pageSize
  return {
    data: filtered.slice(start, start + pageSize),
    total: filtered.length,
    page,
    pageSize,
  }
}

export const COMMUNICATION_TYPE_LABELS: Record<string, string> = {
  driver: 'Driver',
  passenger: 'Passenger',
  support: 'Support',
  safety: 'Safety',
  system: 'System',
}

export const TICKET_TYPE_LABELS: Record<string, string> = {
  driver: 'Driver',
  passenger: 'Passenger',
  safety: 'Safety',
}

export const STATUS_LABELS: Record<string, string> = {
  assigned: 'Assigned',
  open: 'Open',
  in_progress: 'In Progress',
  waiting_user: 'Waiting User',
  escalated: 'Escalated',
  resolved: 'Resolved',
  closed: 'Closed',
  investigating: 'Investigating',
}

export const PRIORITY_LABELS: Record<string, string> = {
  critical: 'Critical',
  high: 'High',
  medium: 'Medium',
  low: 'Low',
}

export const CATEGORY_LABELS: Record<string, string> = {
  trip_updates: 'Trip Updates',
  safety: 'Safety',
  lost_found: 'Lost & Found',
  cancellation: 'Cancellation',
  payment: 'Payment',
  compliance: 'Compliance',
  general: 'General',
}

export const BROADCAST_TARGET_LABELS: Record<string, string> = {
  all_drivers: 'All Drivers',
  all_passengers: 'All Passengers',
  city: 'City Based',
  state: 'State Based',
  tier_based: 'Tier Based',
  airport_drivers: 'Airport Drivers',
  black_drivers: 'Black Category Drivers',
  black_suv_drivers: 'Black SUV Drivers',
  platinum_drivers: 'Platinum Drivers',
  diamond_drivers: 'Diamond Drivers',
}

export const BROADCAST_TYPE_LABELS: Record<string, string> = {
  maintenance: 'Maintenance Alert',
  service: 'Service Alert',
  weather: 'Weather Alert',
  surge: 'Surge Opportunity',
  airport: 'Airport Notice',
  emergency: 'Emergency Notice',
  platform_update: 'Platform Update',
}

export const CASE_TYPE_LABELS: Record<string, string> = {
  safety: 'Safety',
  lost_found: 'Lost & Found',
  cancellation: 'Cancellation',
  fare_dispute: 'Fare Dispute',
  driver_complaint: 'Driver Complaint',
  passenger_complaint: 'Passenger Complaint',
  refund: 'Refund',
  technical: 'Technical Issue',
}

export const NOTE_TYPE_LABELS: Record<string, string> = {
  fraud: 'Fraud Note',
  compliance: 'Compliance Note',
  safety: 'Safety Note',
  support: 'Support Note',
  vip: 'VIP User Note',
}

export const SAFETY_TYPE_LABELS: Record<string, string> = {
  sos: 'SOS Case',
  emergency: 'Emergency Alert',
  driver_report: 'Driver Safety Report',
  passenger_report: 'Passenger Safety Report',
  harassment: 'Harassment Report',
  accident: 'Accident Report',
}
