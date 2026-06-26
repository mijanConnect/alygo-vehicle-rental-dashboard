import { Badge, Input, Spin, Tag, Tooltip } from 'antd'
import {
  Check,
  CheckCheck,
  FileText,
  Image,
  MapPin,
  Mic,
  Search,
} from 'lucide-react'
import { useMemo, useState } from 'react'
import type { ChatMessage } from '@/types/communication'
import { useGetMessagesQuery } from '@/services/communicationApi'

interface ChatPanelProps {
  conversationId: string
  userName: string
  isOnline?: boolean
  isTyping?: boolean
  onSend: (content: string) => void
  onInsertTemplate?: (content: string) => void
  sending?: boolean
  embedded?: boolean
  className?: string
  quickReplies?: string[]
}

function MessageIcon({ type }: { type: ChatMessage['type'] }) {
  if (type === 'image') return <Image className="h-4 w-4" />
  if (type === 'document') return <FileText className="h-4 w-4" />
  if (type === 'voice') return <Mic className="h-4 w-4" />
  if (type === 'gps') return <MapPin className="h-4 w-4" />
  return null
}

function DeliveryIcon({ status }: { status: ChatMessage['deliveryStatus'] }) {
  if (status === 'read') return <CheckCheck className="h-3 w-3 text-indigo-400" />
  if (status === 'delivered' || status === 'sent') return <Check className="h-3 w-3 text-alygo-text-muted" />
  return <span className="text-[10px] text-alygo-text-muted">...</span>
}

export function ChatPanel({
  conversationId,
  userName,
  isOnline,
  isTyping,
  onSend,
  sending,
  embedded = false,
  className = '',
  quickReplies = [],
}: ChatPanelProps) {
  const { data: messages = [], isLoading } = useGetMessagesQuery(conversationId)
  const [draft, setDraft] = useState('')
  const [search, setSearch] = useState('')

  const filtered = useMemo(() => {
    if (!search.trim()) return messages
    const q = search.toLowerCase()
    return messages.filter((m) => m.content.toLowerCase().includes(q))
  }, [messages, search])

  const handleSend = () => {
    if (!draft.trim()) return
    onSend(draft.trim())
    setDraft('')
  }

  const insertQuickReply = (text: string) => {
    setDraft((prev) => (prev ? `${prev} ${text}` : text))
  }

  return (
    <div className={`flex min-h-0 flex-1 flex-col rounded-xl border border-white/5 bg-white/2 ${className}`}>
      {!embedded && (
        <div className="flex items-center justify-between border-b border-white/5 px-4 py-3">
          <div>
            <div className="flex items-center gap-2">
              <span className="font-medium text-white">{userName}</span>
              <Badge status={isOnline ? 'success' : 'default'} text={isOnline ? 'Online' : 'Offline'} />
            </div>
            {isTyping && <p className="text-xs text-indigo-400">Typing...</p>}
          </div>
          <Input
            prefix={<Search className="h-3.5 w-3.5 text-alygo-text-muted" />}
            placeholder="Search messages"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="max-w-45"
            size="small"
            allowClear
          />
        </div>
      )}

      {embedded && isTyping && (
        <div className="border-b border-white/5 px-4 py-1.5 text-xs text-indigo-400">
          {userName} is typing...
        </div>
      )}

      <div className="flex-1 space-y-3 overflow-y-auto p-4">
        {isLoading ? (
          <div className="flex h-full items-center justify-center"><Spin /></div>
        ) : filtered.length === 0 ? (
          <p className="text-center text-sm text-alygo-text-muted">No messages yet. Start the conversation.</p>
        ) : (
          filtered.map((msg) => {
            const isAdmin = msg.senderRole === 'admin'
            const isSystem = msg.senderRole === 'system'
            if (isSystem) {
              return (
                <div key={msg.id} className="text-center">
                  <Tag className="border-indigo-500/20 bg-indigo-500/10 text-xs text-indigo-200">{msg.content}</Tag>
                  <p className="mt-1 text-[10px] text-alygo-text-muted">{new Date(msg.timestamp).toLocaleTimeString()}</p>
                </div>
              )
            }
            return (
              <div key={msg.id} className={`flex ${isAdmin ? 'justify-end' : 'justify-start'}`}>
                <div
                  className={`max-w-[80%] rounded-2xl px-4 py-2.5 ${
                    isAdmin ? 'bg-indigo-600/30 border border-indigo-500/20' : 'bg-white/5 border border-white/5'
                  }`}
                >
                  {!isAdmin && <p className="mb-1 text-[11px] font-medium text-indigo-300">{msg.senderName}</p>}
                  <div className="flex items-start gap-2">
                    {msg.type !== 'text' && <MessageIcon type={msg.type} />}
                    <div>
                      <p className="text-sm text-white">{msg.content}</p>
                      {msg.gpsLabel && (
                        <p className="mt-1 flex items-center gap-1 text-xs text-emerald-300">
                          <MapPin className="h-3 w-3" /> {msg.gpsLabel}
                        </p>
                      )}
                      {msg.attachmentName && (
                        <p className="mt-1 flex items-center gap-1 text-xs text-indigo-300">
                          <FileText className="h-3 w-3" /> {msg.attachmentName}
                        </p>
                      )}
                    </div>
                  </div>
                  <div className="mt-1 flex items-center justify-end gap-1.5">
                    <span className="text-[10px] text-alygo-text-muted">{new Date(msg.timestamp).toLocaleTimeString()}</span>
                    {isAdmin && <DeliveryIcon status={msg.deliveryStatus} />}
                    {!isAdmin && msg.isRead && <Tooltip title="Read"><CheckCheck className="h-3 w-3 text-indigo-400" /></Tooltip>}
                  </div>
                </div>
              </div>
            )
          })
        )}
      </div>

      <div className="sticky bottom-0 border-t border-white/5 bg-[#0d0f14]/95 p-3 backdrop-blur">
        {quickReplies.length > 0 && (
          <div className="mb-2 flex flex-wrap gap-1.5">
            {quickReplies.map((reply) => (
              <button
                key={reply}
                type="button"
                onClick={() => insertQuickReply(reply)}
                className="rounded-full border border-white/10 px-2.5 py-1 text-[11px] text-alygo-text-muted hover:border-indigo-500/30 hover:bg-indigo-500/10 hover:text-indigo-200"
              >
                {reply.length > 42 ? `${reply.slice(0, 42)}…` : reply}
              </button>
            ))}
          </div>
        )}
        <div className="mb-2 flex gap-2">
          <Tooltip title="Attach image"><button type="button" className="rounded-lg p-2 text-alygo-text-muted hover:bg-white/5"><Image className="h-4 w-4" /></button></Tooltip>
          <Tooltip title="Attach document"><button type="button" className="rounded-lg p-2 text-alygo-text-muted hover:bg-white/5"><FileText className="h-4 w-4" /></button></Tooltip>
          <Tooltip title="Voice note"><button type="button" className="rounded-lg p-2 text-alygo-text-muted hover:bg-white/5"><Mic className="h-4 w-4" /></button></Tooltip>
          <Tooltip title="Share GPS"><button type="button" className="rounded-lg p-2 text-alygo-text-muted hover:bg-white/5"><MapPin className="h-4 w-4" /></button></Tooltip>
        </div>
        <div className="flex gap-2">
          <Input.TextArea
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            placeholder="Type a message..."
            autoSize={{ minRows: 1, maxRows: 4 }}
            onPressEnter={(e) => {
              if (!e.shiftKey) {
                e.preventDefault()
                handleSend()
              }
            }}
          />
          <button
            type="button"
            disabled={sending || !draft.trim()}
            onClick={handleSend}
            className="shrink-0 rounded-lg bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-500 disabled:opacity-50"
          >
            Send
          </button>
        </div>
      </div>
    </div>
  )
}
