import { Drawer, Tabs, Tag, Timeline } from 'antd'
import { AlertTriangle, MessageSquare, Shield, Users } from 'lucide-react'
import { useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import { RIDE_CATEGORY_LABELS } from '@/constants'
import { useAdminActions } from '@/hooks/useAdminActions'
import {
  useGetConversationsQuery,
  useSendMessageMutation,
} from '@/services/communicationApi'
import { useAppDispatch, useAppSelector } from '@/store/hooks'
import { closeTripCommunicationDrawer, setCommDrawerTab } from '@/store/slices/communicationSlice'
import { formatCurrency } from '@/utils/format'
import { buildCommunicationInboxPath } from '@/features/communication/communicationNavigation'
import { ChatPanel } from '@/features/communication/components/ChatPanel'

export function TripCommunicationDrawer() {
  const dispatch = useAppDispatch()
  const navigate = useNavigate()
  const adminActions = useAdminActions()
  const { tripDrawerOpen, activeTrip, commDrawerTab } = useAppSelector((s) => s.communication)
  const { data: conversations = [] } = useGetConversationsQuery()
  const [sendMessage, { isLoading: sending }] = useSendMessageMutation()

  const mainTab = useMemo(() => {
    if (commDrawerTab === 'timeline') return 'timeline'
    if (commDrawerTab === 'safety') return 'safety'
    return 'chat'
  }, [commDrawerTab])

  const chatRecipient = useMemo(() => {
    if (commDrawerTab === 'driver') return 'driver'
    if (commDrawerTab === 'passenger') return 'passenger'
    return 'driver'
  }, [commDrawerTab])

  if (!activeTrip) return null

  const driverConv = conversations.find((c) => c.tripId === activeTrip.id && c.userType === 'driver')
  const passengerConv = conversations.find((c) => c.tripId === activeTrip.id && c.userType === 'passenger')
  const activeConv = chatRecipient === 'passenger' ? (passengerConv ?? driverConv) : (driverConv ?? passengerConv)

  const timelineItems = [
    { event: 'Trip Requested', time: activeTrip.startedAt },
    { event: 'Driver Accepted', time: activeTrip.startedAt },
    { event: 'Trip In Progress', time: new Date().toISOString() },
  ]

  return (
    <Drawer
      title={`Communication Center — ${activeTrip.id}`}
      open={tripDrawerOpen}
      onClose={() => dispatch(closeTripCommunicationDrawer())}
      width={920}
      destroyOnClose
    >
      <div className="mb-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <div className="rounded-lg border border-white/5 p-3">
          <p className="text-xs text-alygo-text-muted">Trip ID</p>
          <p className="font-medium text-white">{activeTrip.id}</p>
        </div>
        <div className="rounded-lg border border-white/5 p-3">
          <p className="text-xs text-alygo-text-muted">Driver</p>
          <p className="font-medium text-white">{activeTrip.driverName}</p>
        </div>
        <div className="rounded-lg border border-white/5 p-3">
          <p className="text-xs text-alygo-text-muted">Passenger</p>
          <p className="font-medium text-white">{activeTrip.passengerName}</p>
        </div>
        <div className="rounded-lg border border-white/5 p-3">
          <p className="text-xs text-alygo-text-muted">Current Fare</p>
          <p className="font-medium text-white">{formatCurrency(activeTrip.fare)}</p>
        </div>
      </div>

      <div className="mb-4 flex flex-wrap gap-2 text-sm">
        <Tag>{RIDE_CATEGORY_LABELS[activeTrip.category]}</Tag>
        <Tag color="processing">{activeTrip.status.replace(/_/g, ' ')}</Tag>
        <span className="text-alygo-text-muted">Pickup: {activeTrip.pickup}</span>
        <span className="text-alygo-text-muted">→ {activeTrip.dropoff}</span>
      </div>

      <div className="mb-4 flex flex-wrap gap-2">
        <button type="button" onClick={() => dispatch(setCommDrawerTab('driver'))} className="flex items-center gap-1.5 rounded-lg border border-white/10 px-3 py-1.5 text-sm text-white hover:bg-white/5">
          <MessageSquare className="h-4 w-4" /> Message Driver
        </button>
        <button type="button" onClick={() => dispatch(setCommDrawerTab('passenger'))} className="flex items-center gap-1.5 rounded-lg border border-white/10 px-3 py-1.5 text-sm text-white hover:bg-white/5">
          <MessageSquare className="h-4 w-4" /> Message Passenger
        </button>
        <button type="button" onClick={() => dispatch(setCommDrawerTab('both'))} className="flex items-center gap-1.5 rounded-lg border border-white/10 px-3 py-1.5 text-sm text-white hover:bg-white/5">
          <Users className="h-4 w-4" /> Message Both
        </button>
        <button type="button" onClick={() => adminActions.notify('Support case created', activeTrip.id)} className="flex items-center gap-1.5 rounded-lg border border-white/10 px-3 py-1.5 text-sm text-white hover:bg-white/5">
          Create Support Case
        </button>
        <button type="button" onClick={() => { dispatch(closeTripCommunicationDrawer()); navigate(buildCommunicationInboxPath('safety')) }} className="flex items-center gap-1.5 rounded-lg border border-red-500/30 px-3 py-1.5 text-sm text-red-300 hover:bg-red-500/10">
          <Shield className="h-4 w-4" /> Open Safety Review
        </button>
      </div>

      <Tabs
        activeKey={mainTab}
        onChange={(key) => dispatch(setCommDrawerTab(key === 'chat' ? 'both' : key as 'timeline' | 'safety'))}
        items={[
          {
            key: 'chat',
            label: 'Chat',
            children: activeConv ? (
              <ChatPanel
                conversationId={activeConv.id}
                userName={activeConv.userName}
                isOnline={activeConv.isOnline}
                isTyping={activeConv.isTyping}
                sending={sending}
                onSend={(content) => sendMessage({ conversationId: activeConv.id, content }).unwrap()}
              />
            ) : (
              <div className="flex h-[400px] flex-col items-center justify-center gap-3 text-alygo-text-muted">
                <p>No active conversation for this trip.</p>
                <button type="button" onClick={() => navigate(buildCommunicationInboxPath('safety'))} className="text-indigo-400 hover:underline">
                  Open Communication Center
                </button>
              </div>
            ),
          },
          {
            key: 'timeline',
            label: 'Trip Timeline',
            children: (
              <Timeline
                items={timelineItems.map((item) => ({
                  children: (
                    <div>
                      <p className="text-white">{item.event}</p>
                      <p className="text-xs text-alygo-text-muted">{new Date(item.time).toLocaleString()}</p>
                    </div>
                  ),
                }))}
              />
            ),
          },
          {
            key: 'safety',
            label: (
              <span className="flex items-center gap-1">
                <AlertTriangle className="h-3.5 w-3.5" /> Safety
              </span>
            ),
            children: (
              <div className="space-y-4">
                <p className="text-sm text-alygo-text-muted">Review safety indicators and escalate if needed.</p>
                <div className="rounded-lg border border-red-500/20 bg-red-500/5 p-4">
                  <p className="font-medium text-red-300">No active SOS on this trip</p>
                  <p className="mt-1 text-sm text-alygo-text-muted">Monitor driver and passenger communications for safety concerns.</p>
                </div>
                <button type="button" onClick={() => { dispatch(closeTripCommunicationDrawer()); navigate(buildCommunicationInboxPath('safety')) }} className="rounded-lg bg-red-600/20 px-4 py-2 text-sm text-red-300 border border-red-500/30 hover:bg-red-600/30">
                  Open Safety Communications
                </button>
              </div>
            ),
          },
        ]}
      />
    </Drawer>
  )
}
