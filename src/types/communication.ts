import type { Trip } from '@/types'

export type UserType = 'driver' | 'passenger' | 'both'

export type ConversationStatus =
  | 'open'
  | 'in_progress'
  | 'waiting_user'
  | 'escalated'
  | 'resolved'
  | 'closed'

export type ConversationPriority = 'critical' | 'high' | 'medium' | 'low'

export type ConversationCategory =
  | 'general'
  | 'active_trip'
  | 'safety'
  | 'lost_found'
  | 'escalation'
  | 'support'

export type MessageType =
  | 'text'
  | 'image'
  | 'document'
  | 'voice'
  | 'gps'
  | 'system'

export type MessageDeliveryStatus = 'sending' | 'sent' | 'delivered' | 'read'

export type InternalNoteType =
  | 'fraud'
  | 'compliance'
  | 'safety'
  | 'support'
  | 'vip'

export type CaseType =
  | 'safety'
  | 'lost_found'
  | 'cancellation'
  | 'fare_dispute'
  | 'driver_complaint'
  | 'passenger_complaint'
  | 'refund'
  | 'technical'

export type CaseStatus = 'open' | 'investigating' | 'waiting_user' | 'escalated' | 'resolved'

export type SafetyReportType =
  | 'sos'
  | 'emergency'
  | 'driver_report'
  | 'passenger_report'
  | 'harassment'
  | 'accident'

export type BroadcastTarget =
  | 'all_drivers'
  | 'all_passengers'
  | 'city'
  | 'state'
  | 'tier_based'
  | 'airport_drivers'
  | 'black_drivers'
  | 'black_suv_drivers'
  | 'platinum_drivers'
  | 'diamond_drivers'

export type BroadcastType =
  | 'maintenance'
  | 'service'
  | 'weather'
  | 'surge'
  | 'airport'
  | 'emergency'
  | 'platform_update'

export type TemplateCategory =
  | 'trip_updates'
  | 'safety'
  | 'lost_found'
  | 'cancellation'
  | 'payment'
  | 'compliance'
  | 'general'

export interface CommunicationInboxOverview {
  totalConversations: number
  unreadMessages: number
  openCases: number
  broadcastsSentToday: number
}

export type CommunicationInboxType = 'driver' | 'passenger' | 'support' | 'safety' | 'system'

export interface CommunicationInboxItem {
  id: string
  ticketId?: string
  userOrGroup: string
  communicationType: CommunicationInboxType
  subject: string
  priority: ConversationPriority
  lastActivity: string
  status: string
  conversationId?: string
  unreadCount: number
  assignedAgent?: string
  tripId?: string
  userId?: string
}

export interface CommunicationInboxParams {
  page?: number
  pageSize?: number
  search?: string
  communicationType?: string
  status?: string
  priority?: string
}

export interface CommunicationOverview {
  openConversations: number
  activeSupportAgents: number
  activeDriverChats: number
  activePassengerChats: number
  averageResponseTimeMinutes: number
  resolvedConversations: number
  safetyCases: number
  escalatedCases: number
}

export interface Conversation {
  id: string
  userName: string
  userType: UserType
  userId: string
  lastMessage: string
  priority: ConversationPriority
  assignedAgent: string
  status: ConversationStatus
  lastActivity: string
  category: ConversationCategory
  tripId?: string
  city?: string
  isOnline: boolean
  unreadCount: number
  isTyping?: boolean
}

export interface ChatMessage {
  id: string
  conversationId: string
  senderId: string
  senderName: string
  senderRole: 'admin' | 'driver' | 'passenger' | 'system'
  type: MessageType
  content: string
  attachmentName?: string
  attachmentUrl?: string
  gpsLabel?: string
  timestamp: string
  deliveryStatus: MessageDeliveryStatus
  isRead: boolean
}

export interface MessageTemplate {
  id: string
  name: string
  category: TemplateCategory
  content: string
  status: 'active' | 'inactive'
  usageCount: number
  updatedAt: string
}

export interface InternalNote {
  id: string
  userId: string
  userName: string
  userType: UserType
  noteType: InternalNoteType
  content: string
  author: string
  createdAt: string
  tripId?: string
}

export interface SupportCase {
  id: string
  caseNumber: string
  type: CaseType
  status: CaseStatus
  subject: string
  userName: string
  userType: UserType
  assignedAgent: string
  priority: ConversationPriority
  tripId?: string
  city?: string
  createdAt: string
  updatedAt: string
}

export interface SafetyCommunication {
  id: string
  reportType: SafetyReportType
  userName: string
  userType: UserType
  tripId: string
  city: string
  status: ConversationStatus
  priority: ConversationPriority
  assignedAgent: string
  lastActivity: string
  description: string
}

export interface BroadcastRecord {
  id: string
  title: string
  message: string
  broadcastType: BroadcastType
  target: BroadcastTarget
  targetValue?: string
  recipientCount: number
  sentBy: string
  sentAt: string
  status: 'scheduled' | 'sent' | 'failed'
}

export type SupportTicketType = 'driver' | 'passenger' | 'safety'

export type SupportTicketStatus =
  | 'open'
  | 'assigned'
  | 'in_progress'
  | 'investigating'
  | 'waiting_user'
  | 'escalated'
  | 'resolved'
  | 'closed'

export interface SupportTicket {
  id: string
  ticketId: string
  ticketType: SupportTicketType
  userName: string
  subject: string
  priority: ConversationPriority
  status: SupportTicketStatus
  createdAt: string
  assignedAgent?: string
  description?: string
  tripId?: string
  city?: string
}

export interface CommunicationListParams {
  page?: number
  pageSize?: number
  search?: string
  ticketType?: string
  status?: string
}

export interface CommunicationListResponse<T> {
  data: T[]
  total: number
  page: number
  pageSize: number
}

export interface BroadcastFormValues {
  title: string
  message: string
  broadcastType: BroadcastType
  target: BroadcastTarget
  targetValue?: string
  scheduledAt: string
}

export interface NotificationTemplateFormValues {
  name: string
  category: TemplateCategory
  content: string
  status: 'active' | 'inactive'
}

export interface CommunicationHistoryEntry {
  id: string
  eventType: 'message' | 'attachment' | 'admin_action' | 'status_change' | 'escalation' | 'note'
  description: string
  userName: string
  userType: UserType
  agent?: string
  tripId?: string
  city?: string
  timestamp: string
}

export interface CommunicationAnalytics {
  summary: {
    totalConversations: number
    averageResolutionTimeHours: number
    firstResponseTimeMinutes: number
    escalationRate: number
    satisfactionScore: number
  }
  conversationsPerDay: { label: string; value: number }[]
  responseTimeTrend: { label: string; value: number; secondary?: number }[]
  resolutionRate: { label: string; value: number }[]
  safetyCasesTrend: { label: string; value: number }[]
  agentPerformance: { label: string; value: number }[]
  satisfactionTrend: { label: string; value: number }[]
}

export interface ActiveTripChat {
  trip: Trip
  conversationId: string
  driverOnline: boolean
  passengerOnline: boolean
  unreadCount: number
  lastMessage: string
  lastActivity: string
}

export interface TripCommunicationContext {
  trip: Trip
  conversationId?: string
  initialTab?: 'driver' | 'passenger' | 'both' | 'timeline' | 'safety'
}
