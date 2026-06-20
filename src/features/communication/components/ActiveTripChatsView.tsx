import { Tag } from 'antd'
import { MessageSquare } from 'lucide-react'
import { RIDE_CATEGORY_LABELS } from '@/constants'
import { useGetActiveTripChatsQuery, useSendMessageMutation } from '@/services/communicationApi'
import { formatCurrency } from '@/utils/format'
import { ChatPanel } from '@/features/communication/components/ChatPanel'
import { useState } from 'react'

export function ActiveTripChatsView() {
  const { data = [], isLoading } = useGetActiveTripChatsQuery()
  const [selectedIdx, setSelectedIdx] = useState(0)
  const [sendMessage, { isLoading: sending }] = useSendMessageMutation()

  if (isLoading) {
    return <div className="p-8 text-center text-alygo-text-muted">Loading active trip chats...</div>
  }

  const selected = data[selectedIdx]

  return (
    <div className="grid gap-4 lg:grid-cols-5">
      <div className="space-y-2 lg:col-span-2">
        <p className="mb-2 text-sm text-alygo-text-muted">
          Real-time communication for all active trips. Select a trip to message driver or passenger.
        </p>
        {data.map((item, idx) => (
          <button
            key={item.trip.id}
            type="button"
            onClick={() => setSelectedIdx(idx)}
            className={`w-full rounded-xl border p-4 text-left transition-colors ${
              selectedIdx === idx ? 'border-indigo-500/40 bg-indigo-500/10' : 'border-white/5 bg-white/[0.02] hover:bg-white/5'
            }`}
          >
            <div className="flex items-center justify-between">
              <span className="font-medium text-white">{item.trip.id}</span>
              <Tag>{RIDE_CATEGORY_LABELS[item.trip.category]}</Tag>
            </div>
            <p className="mt-1 text-xs text-alygo-text-muted">{item.trip.driverName} → {item.trip.passengerName}</p>
            <p className="mt-1 text-xs text-slate-500">{item.trip.pickup}</p>
            <div className="mt-2 flex items-center justify-between">
              <span className="text-xs text-alygo-text-muted truncate max-w-[180px]">{item.lastMessage}</span>
              <div className="flex items-center gap-2">
                {item.unreadCount > 0 && <Tag color="blue">{item.unreadCount}</Tag>}
                <MessageSquare className="h-3.5 w-3.5 text-indigo-400" />
              </div>
            </div>
            <div className="mt-2 flex gap-2 text-[10px]">
              <Tag color={item.driverOnline ? 'success' : 'default'}>Driver {item.driverOnline ? 'Online' : 'Offline'}</Tag>
              <Tag color={item.passengerOnline ? 'success' : 'default'}>Passenger {item.passengerOnline ? 'Online' : 'Offline'}</Tag>
            </div>
          </button>
        ))}
      </div>

      <div className="lg:col-span-3">
        {selected ? (
          <div>
            <div className="mb-4 grid grid-cols-2 gap-3 sm:grid-cols-4">
              <div className="rounded-lg border border-white/5 p-3">
                <p className="text-[10px] text-alygo-text-muted">Status</p>
                <p className="text-sm text-white">{selected.trip.status.replace(/_/g, ' ')}</p>
              </div>
              <div className="rounded-lg border border-white/5 p-3">
                <p className="text-[10px] text-alygo-text-muted">City</p>
                <p className="text-sm text-white">{selected.trip.city}</p>
              </div>
              <div className="rounded-lg border border-white/5 p-3">
                <p className="text-[10px] text-alygo-text-muted">Fare</p>
                <p className="text-sm text-white">{formatCurrency(selected.trip.fare)}</p>
              </div>
              <div className="rounded-lg border border-white/5 p-3">
                <p className="text-[10px] text-alygo-text-muted">Destination</p>
                <p className="text-sm text-white truncate">{selected.trip.dropoff}</p>
              </div>
            </div>
            <ChatPanel
              conversationId={selected.conversationId}
              userName={`${selected.trip.driverName} / ${selected.trip.passengerName}`}
              isOnline={selected.driverOnline || selected.passengerOnline}
              sending={sending}
              onSend={(content) => sendMessage({ conversationId: selected.conversationId, content }).unwrap()}
            />
          </div>
        ) : (
          <div className="flex h-[560px] items-center justify-center rounded-xl border border-white/5 text-alygo-text-muted">
            No active trips with open chats
          </div>
        )}
      </div>
    </div>
  )
}
