import { createApi, fakeBaseQuery } from '@reduxjs/toolkit/query/react'
import type {
  BroadcastRecord,
  ChatMessage,
  CommunicationAnalytics,
  CommunicationHistoryEntry,
  CommunicationInboxItem,
  CommunicationInboxOverview,
  CommunicationInboxParams,
  CommunicationListParams,
  CommunicationListResponse,
  CommunicationOverview,
  Conversation,
  InternalNote,
  MessageTemplate,
  SafetyCommunication,
  SupportCase,
  SupportTicket,
} from '@/types/communication'
import type { BroadcastFormValues } from '@/types/communication'
import type { ActiveTripChat } from '@/types/communication'
import {
  computeCommunicationAnalytics,
  computeCommunicationInboxOverview,
  computeCommunicationOverview,
  getActiveTripChats,
  mockBroadcasts,
  mockChatMessages,
  mockCommunicationHistory,
  mockConversations,
  mockInternalNotes,
  mockMessageTemplates,
  mockSafetyCommunications,
  mockSupportCases,
  mockSupportTickets,
  paginateCommunicationInbox,
  paginateSupportTickets,
} from '@/services/mock/communicationData'

const delay = (ms = 300) => new Promise((resolve) => setTimeout(resolve, ms))

export const communicationApi = createApi({
  reducerPath: 'communicationApi',
  baseQuery: fakeBaseQuery(),
  tagTypes: [
    'CommunicationOverview',
    'Conversations',
    'Messages',
    'Templates',
    'InternalNotes',
    'SupportCases',
    'SafetyCommunications',
    'Broadcasts',
    'CommunicationHistory',
    'CommunicationAnalytics',
    'ActiveTripChats',
    'SupportTickets',
    'CommunicationInbox',
  ],
  endpoints: (builder) => ({
    getCommunicationOverview: builder.query<CommunicationOverview, void>({
      queryFn: async () => {
        await delay()
        return { data: computeCommunicationOverview() }
      },
      providesTags: ['CommunicationOverview'],
    }),
    getCommunicationInboxOverview: builder.query<CommunicationInboxOverview, void>({
      queryFn: async () => {
        await delay()
        return { data: computeCommunicationInboxOverview() }
      },
      providesTags: ['CommunicationInbox', 'CommunicationOverview'],
    }),
    getCommunicationInbox: builder.query<
      CommunicationListResponse<CommunicationInboxItem>,
      CommunicationInboxParams | void
    >({
      queryFn: async (params) => {
        await delay()
        return { data: paginateCommunicationInbox(params ?? {}) }
      },
      providesTags: ['CommunicationInbox'],
    }),
    getConversations: builder.query<Conversation[], { category?: string; userType?: string } | void>({
      queryFn: async (filters) => {
        await delay()
        let data = [...mockConversations]
        if (filters?.category) {
          data = data.filter((c) => c.category === filters.category)
        }
        if (filters?.userType) {
          data = data.filter((c) => c.userType === filters.userType)
        }
        return { data }
      },
      providesTags: ['Conversations'],
    }),
    getConversationById: builder.query<Conversation | undefined, string>({
      queryFn: async (id) => ({ data: mockConversations.find((c) => c.id === id) }),
      providesTags: ['Conversations'],
    }),
    getMessages: builder.query<ChatMessage[], string>({
      queryFn: async (conversationId) => ({
        data: mockChatMessages[conversationId] ?? [],
      }),
      providesTags: (_r, _e, id) => [{ type: 'Messages', id }],
    }),
    sendMessage: builder.mutation<
      ChatMessage,
      { conversationId: string; content: string; type?: ChatMessage['type'] }
    >({
      queryFn: async ({ conversationId, content, type = 'text' }) => {
        await delay(150)
        const msg: ChatMessage = {
          id: `m-${Date.now()}`,
          conversationId,
          senderId: 'admin-1',
          senderName: 'Admin',
          senderRole: 'admin',
          type,
          content,
          timestamp: new Date().toISOString(),
          deliveryStatus: 'sent',
          isRead: false,
        }
        if (!mockChatMessages[conversationId]) mockChatMessages[conversationId] = []
        mockChatMessages[conversationId].push(msg)
        const conv = mockConversations.find((c) => c.id === conversationId)
        if (conv) {
          conv.lastMessage = content
          conv.lastActivity = msg.timestamp
          conv.status = conv.status === 'open' ? 'in_progress' : conv.status
        }
        return { data: msg }
      },
      invalidatesTags: (_r, _e, { conversationId }) => [
        { type: 'Messages', id: conversationId },
        'Conversations',
        'CommunicationOverview',
        'CommunicationHistory',
        'CommunicationInbox',
      ],
    }),
    updateConversationStatus: builder.mutation<
      Conversation,
      { id: string; status: Conversation['status'] }
    >({
      queryFn: async ({ id, status }) => {
        await delay()
        const index = mockConversations.findIndex((c) => c.id === id)
        if (index === -1) return { error: { status: 404, data: 'Conversation not found' } }
        mockConversations[index] = { ...mockConversations[index], status, lastActivity: new Date().toISOString() }
        return { data: mockConversations[index] }
      },
      invalidatesTags: ['Conversations', 'CommunicationOverview', 'CommunicationHistory', 'CommunicationInbox'],
    }),
    assignConversation: builder.mutation<Conversation, { id: string; agent: string }>({
      queryFn: async ({ id, agent }) => {
        await delay()
        const index = mockConversations.findIndex((c) => c.id === id)
        if (index === -1) return { error: { status: 404, data: 'Conversation not found' } }
        mockConversations[index] = {
          ...mockConversations[index],
          assignedAgent: agent,
          status: 'in_progress',
          lastActivity: new Date().toISOString(),
        }
        return { data: mockConversations[index] }
      },
      invalidatesTags: ['Conversations', 'CommunicationInbox'],
    }),
    updateConversation: builder.mutation<Conversation, Partial<Conversation> & { id: string }>({
      queryFn: async ({ id, ...updates }) => {
        await delay()
        const index = mockConversations.findIndex((c) => c.id === id)
        if (index === -1) return { error: { status: 404, data: 'Conversation not found' } }
        mockConversations[index] = {
          ...mockConversations[index],
          ...updates,
          lastActivity: new Date().toISOString(),
        }
        return { data: mockConversations[index] }
      },
      invalidatesTags: ['Conversations', 'CommunicationOverview'],
    }),
    getMessageTemplates: builder.query<MessageTemplate[], void>({
      queryFn: async () => ({ data: [...mockMessageTemplates] }),
      providesTags: ['Templates'],
    }),
    createMessageTemplate: builder.mutation<MessageTemplate, Omit<MessageTemplate, 'id' | 'usageCount' | 'updatedAt'>>({
      queryFn: async (payload) => {
        await delay()
        const template: MessageTemplate = {
          ...payload,
          id: `tpl-${Date.now()}`,
          usageCount: 0,
          updatedAt: new Date().toISOString(),
        }
        mockMessageTemplates.push(template)
        return { data: template }
      },
      invalidatesTags: ['Templates'],
    }),
    updateMessageTemplate: builder.mutation<MessageTemplate, Partial<MessageTemplate> & { id: string }>({
      queryFn: async ({ id, ...updates }) => {
        await delay()
        const index = mockMessageTemplates.findIndex((t) => t.id === id)
        if (index === -1) return { error: { status: 404, data: 'Template not found' } }
        mockMessageTemplates[index] = { ...mockMessageTemplates[index], ...updates, updatedAt: new Date().toISOString() }
        return { data: mockMessageTemplates[index] }
      },
      invalidatesTags: ['Templates'],
    }),
    deleteMessageTemplate: builder.mutation<void, string>({
      queryFn: async (id) => {
        await delay()
        const index = mockMessageTemplates.findIndex((t) => t.id === id)
        if (index === -1) return { error: { status: 404, data: 'Template not found' } }
        mockMessageTemplates.splice(index, 1)
        return { data: undefined }
      },
      invalidatesTags: ['Templates'],
    }),
    getInternalNotes: builder.query<InternalNote[], void>({
      queryFn: async () => ({ data: [...mockInternalNotes] }),
      providesTags: ['InternalNotes'],
    }),
    createInternalNote: builder.mutation<InternalNote, Omit<InternalNote, 'id' | 'createdAt' | 'author'>>({
      queryFn: async (payload) => {
        await delay()
        const note: InternalNote = {
          ...payload,
          id: `note-${Date.now()}`,
          author: 'Admin',
          createdAt: new Date().toISOString(),
        }
        mockInternalNotes.unshift(note)
        return { data: note }
      },
      invalidatesTags: ['InternalNotes', 'CommunicationHistory'],
    }),
    getSupportTickets: builder.query<
      CommunicationListResponse<SupportTicket>,
      CommunicationListParams | void
    >({
      queryFn: async (params) => {
        await delay()
        return { data: paginateSupportTickets(params ?? {}) }
      },
      providesTags: ['SupportTickets'],
    }),
    updateSupportTicket: builder.mutation<SupportTicket, Partial<SupportTicket> & { id: string }>({
      queryFn: async ({ id, ...updates }) => {
        await delay()
        const index = mockSupportTickets.findIndex((t) => t.id === id)
        if (index === -1) return { error: { status: 404, data: 'Ticket not found' } }
        mockSupportTickets[index] = { ...mockSupportTickets[index], ...updates }
        return { data: mockSupportTickets[index] }
      },
      invalidatesTags: ['SupportTickets'],
    }),
    getSupportCases: builder.query<SupportCase[], void>({
      queryFn: async () => ({ data: [...mockSupportCases] }),
      providesTags: ['SupportCases'],
    }),
    updateSupportCase: builder.mutation<SupportCase, Partial<SupportCase> & { id: string }>({
      queryFn: async ({ id, ...updates }) => {
        await delay()
        const index = mockSupportCases.findIndex((c) => c.id === id)
        if (index === -1) return { error: { status: 404, data: 'Case not found' } }
        mockSupportCases[index] = {
          ...mockSupportCases[index],
          ...updates,
          updatedAt: new Date().toISOString(),
        }
        return { data: mockSupportCases[index] }
      },
      invalidatesTags: ['SupportCases', 'CommunicationOverview'],
    }),
    getSafetyCommunications: builder.query<SafetyCommunication[], void>({
      queryFn: async () => ({ data: [...mockSafetyCommunications] }),
      providesTags: ['SafetyCommunications'],
    }),
    getBroadcasts: builder.query<BroadcastRecord[], void>({
      queryFn: async () => ({ data: [...mockBroadcasts] }),
      providesTags: ['Broadcasts'],
    }),
    createBroadcast: builder.mutation<
      BroadcastRecord,
      Omit<BroadcastFormValues, 'scheduledAt'> & { scheduledAt?: string }
    >({
      queryFn: async (payload) => {
        await delay()
        const broadcast: BroadcastRecord = {
          id: `bc-${Date.now()}`,
          title: payload.title,
          message: payload.message,
          broadcastType: payload.broadcastType,
          target: payload.target,
          targetValue: payload.targetValue,
          recipientCount: 0,
          sentBy: 'Admin',
          sentAt: payload.scheduledAt ?? new Date().toISOString(),
          status: 'scheduled',
        }
        mockBroadcasts.unshift(broadcast)
        return { data: broadcast }
      },
      invalidatesTags: ['Broadcasts'],
    }),
    updateBroadcast: builder.mutation<BroadcastRecord, Partial<BroadcastRecord> & { id: string }>({
      queryFn: async ({ id, ...updates }) => {
        await delay()
        const index = mockBroadcasts.findIndex((b) => b.id === id)
        if (index === -1) return { error: { status: 404, data: 'Broadcast not found' } }
        mockBroadcasts[index] = { ...mockBroadcasts[index], ...updates }
        return { data: mockBroadcasts[index] }
      },
      invalidatesTags: ['Broadcasts'],
    }),
    deleteBroadcast: builder.mutation<void, string>({
      queryFn: async (id) => {
        await delay()
        const index = mockBroadcasts.findIndex((b) => b.id === id)
        if (index === -1) return { error: { status: 404, data: 'Broadcast not found' } }
        mockBroadcasts.splice(index, 1)
        return { data: undefined }
      },
      invalidatesTags: ['Broadcasts'],
    }),
    sendBroadcast: builder.mutation<
      BroadcastRecord,
      Omit<BroadcastRecord, 'id' | 'sentAt' | 'sentBy' | 'recipientCount' | 'status'>
    >({
      queryFn: async (payload) => {
        await delay(500)
        const broadcast: BroadcastRecord = {
          ...payload,
          id: `bc-${Date.now()}`,
          recipientCount: Math.floor(Math.random() * 5000) + 1000,
          sentBy: 'Admin',
          sentAt: new Date().toISOString(),
          status: 'sent',
        }
        mockBroadcasts.unshift(broadcast)
        return { data: broadcast }
      },
      invalidatesTags: ['Broadcasts'],
    }),
    sendBroadcastNow: builder.mutation<BroadcastRecord, string>({
      queryFn: async (id) => {
        await delay(500)
        const index = mockBroadcasts.findIndex((b) => b.id === id)
        if (index === -1) return { error: { status: 404, data: 'Broadcast not found' } }
        mockBroadcasts[index] = {
          ...mockBroadcasts[index],
          status: 'sent',
          sentAt: new Date().toISOString(),
          recipientCount: Math.floor(Math.random() * 5000) + 1000,
          sentBy: 'Admin',
        }
        return { data: mockBroadcasts[index] }
      },
      invalidatesTags: ['Broadcasts'],
    }),
    getCommunicationHistory: builder.query<CommunicationHistoryEntry[], void>({
      queryFn: async () => ({ data: [...mockCommunicationHistory] }),
      providesTags: ['CommunicationHistory'],
    }),
    getCommunicationAnalytics: builder.query<CommunicationAnalytics, void>({
      queryFn: async () => {
        await delay()
        return { data: computeCommunicationAnalytics() }
      },
      providesTags: ['CommunicationAnalytics'],
    }),
    getActiveTripChats: builder.query<ActiveTripChat[], void>({
      queryFn: async () => {
        await delay()
        return { data: getActiveTripChats() }
      },
      providesTags: ['ActiveTripChats'],
    }),
  }),
})

export const {
  useGetCommunicationOverviewQuery,
  useGetCommunicationInboxOverviewQuery,
  useGetCommunicationInboxQuery,
  useGetConversationsQuery,
  useGetConversationByIdQuery,
  useGetMessagesQuery,
  useSendMessageMutation,
  useUpdateConversationStatusMutation,
  useAssignConversationMutation,
  useUpdateConversationMutation,
  useGetMessageTemplatesQuery,
  useCreateMessageTemplateMutation,
  useUpdateMessageTemplateMutation,
  useDeleteMessageTemplateMutation,
  useGetInternalNotesQuery,
  useCreateInternalNoteMutation,
  useGetSupportTicketsQuery,
  useUpdateSupportTicketMutation,
  useGetSupportCasesQuery,
  useUpdateSupportCaseMutation,
  useGetSafetyCommunicationsQuery,
  useGetBroadcastsQuery,
  useCreateBroadcastMutation,
  useUpdateBroadcastMutation,
  useDeleteBroadcastMutation,
  useSendBroadcastMutation,
  useSendBroadcastNowMutation,
  useGetCommunicationHistoryQuery,
  useGetCommunicationAnalyticsQuery,
  useGetActiveTripChatsQuery,
} = communicationApi

export {
  STATUS_LABELS,
  PRIORITY_LABELS,
  CATEGORY_LABELS,
  BROADCAST_TARGET_LABELS,
  BROADCAST_TYPE_LABELS,
  CASE_TYPE_LABELS,
  NOTE_TYPE_LABELS,
  SAFETY_TYPE_LABELS,
  TICKET_TYPE_LABELS,
  COMMUNICATION_TYPE_LABELS,
} from '@/services/mock/communicationData'
