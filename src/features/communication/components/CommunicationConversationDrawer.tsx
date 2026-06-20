import { useMemo, useState } from 'react'
import { Drawer, Input, Select, Tabs, Tag } from 'antd'
import { FileText, Image, Mic, MapPin } from 'lucide-react'
import { ChatPanel } from '@/features/communication/components/ChatPanel'
import {
  priorityLabel,
  statusLabel,
  SUPPORT_AGENT_OPTIONS,
} from '@/features/communication/communicationCenterHelpers'
import {
  COMMUNICATION_TYPE_LABELS,
  STATUS_LABELS,
  useAssignConversationMutation,
  useCreateInternalNoteMutation,
  useGetInternalNotesQuery,
  useGetMessagesQuery,
  useSendMessageMutation,
  useUpdateConversationMutation,
} from '@/services/communicationApi'
import type { ChatMessage, CommunicationInboxItem, ConversationStatus } from '@/types/communication'
import { formatDateTime } from '@/utils/format'

const STATUS_OPTIONS = Object.entries(STATUS_LABELS).map(([value, label]) => ({ value, label }))

interface CommunicationConversationDrawerProps {
  item: CommunicationInboxItem | null
  open: boolean
  onClose: () => void
}

function AttachmentList({ messages }: { messages: ChatMessage[] }) {
  const attachments = messages.filter(
    (m) => m.type !== 'text' && m.type !== 'system',
  )

  if (attachments.length === 0) {
    return <p className="text-sm text-alygo-text-muted">No attachments in this conversation.</p>
  }

  return (
    <ul className="space-y-2">
      {attachments.map((m) => (
        <li
          key={m.id}
          className="flex items-center gap-2 rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-sm text-white"
        >
          {m.type === 'image' && <Image className="h-4 w-4 text-indigo-400" />}
          {m.type === 'document' && <FileText className="h-4 w-4 text-indigo-400" />}
          {m.type === 'voice' && <Mic className="h-4 w-4 text-indigo-400" />}
          {m.type === 'gps' && <MapPin className="h-4 w-4 text-indigo-400" />}
          <span>{m.attachmentName ?? m.gpsLabel ?? m.content}</span>
          <span className="ml-auto text-xs text-alygo-text-muted">{formatDateTime(m.timestamp)}</span>
        </li>
      ))}
    </ul>
  )
}

export function CommunicationConversationDrawer({
  item,
  open,
  onClose,
}: CommunicationConversationDrawerProps) {
  const conversationId = item?.conversationId
  const { data: allNotes = [] } = useGetInternalNotesQuery()
  const { data: messages = [] } = useGetMessagesQuery(conversationId ?? '', { skip: !conversationId })
  const [sendMessage, { isLoading: sending }] = useSendMessageMutation()
  const [assignConversation] = useAssignConversationMutation()
  const [updateConversation] = useUpdateConversationMutation()
  const [createNote] = useCreateInternalNoteMutation()
  const [noteDraft, setNoteDraft] = useState('')
  const [assignedAgent, setAssignedAgent] = useState<string>()
  const [status, setStatus] = useState<string>()

  const notes = useMemo(
    () =>
      allNotes.filter(
        (n) => n.userName === item?.userOrGroup || n.tripId === item?.tripId,
      ),
    [allNotes, item],
  )

  const handleOpen = () => {
    if (!item) return
    setAssignedAgent(item.assignedAgent)
    setStatus(item.status)
  }

  const handleAssign = async (agent: string) => {
    if (!conversationId) return
    setAssignedAgent(agent)
    await assignConversation({ id: conversationId, agent }).unwrap()
  }

  const handleStatusChange = async (next: string) => {
    if (!conversationId) return
    setStatus(next)
    await updateConversation({
      id: conversationId,
      status: next as ConversationStatus,
    }).unwrap()
  }

  const handleAddNote = async () => {
    if (!item || !noteDraft.trim()) return
    await createNote({
      userId: item.userId ?? item.id,
      userName: item.userOrGroup,
      userType: item.communicationType === 'driver' ? 'driver' : 'passenger',
      noteType: item.communicationType === 'safety' ? 'safety' : 'support',
      content: noteDraft.trim(),
      tripId: item.tripId,
    }).unwrap()
    setNoteDraft('')
  }

  return (
    <Drawer
      title={item ? `${item.userOrGroup} — ${item.subject.slice(0, 40)}` : 'Conversation'}
      open={open}
      onClose={onClose}
      width={640}
      destroyOnClose
      afterOpenChange={(visible) => visible && handleOpen()}
    >
      {item && (
        <div className="flex h-full flex-col gap-4">
          <div className="flex flex-wrap gap-2">
            <Tag>{COMMUNICATION_TYPE_LABELS[item.communicationType] ?? item.communicationType}</Tag>
            {item.ticketId && <Tag color="blue">{item.ticketId}</Tag>}
            <Tag>{priorityLabel(item.priority)}</Tag>
            <Tag>{statusLabel(item.status)}</Tag>
          </div>

          <Tabs
            items={[
              {
                key: 'history',
                label: 'Conversation History',
                children: conversationId ? (
                  <div className="h-[360px]">
                    <ChatPanel
                      embedded
                      conversationId={conversationId}
                      userName={item.userOrGroup}
                      onSend={async (content) => {
                        await sendMessage({ conversationId, content }).unwrap()
                      }}
                      sending={sending}
                      className="h-full"
                    />
                  </div>
                ) : (
                  <p className="text-sm text-alygo-text-muted">
                    No linked conversation thread. Use internal notes or assign staff below.
                  </p>
                ),
              },
              {
                key: 'attachments',
                label: 'Attachments',
                children: <AttachmentList messages={messages} />,
              },
              {
                key: 'notes',
                label: 'Internal Notes',
                children: (
                  <div className="space-y-3">
                    {notes.length === 0 && (
                      <p className="text-sm text-alygo-text-muted">No internal notes yet.</p>
                    )}
                    {notes.map((note) => (
                      <div key={note.id} className="rounded-lg border border-white/10 bg-white/5 p-3">
                        <p className="text-sm text-white">{note.content}</p>
                        <p className="mt-1 text-xs text-alygo-text-muted">
                          {note.author} · {formatDateTime(note.createdAt)}
                        </p>
                      </div>
                    ))}
                    <Input.TextArea
                      rows={2}
                      placeholder="Add internal note..."
                      value={noteDraft}
                      onChange={(e) => setNoteDraft(e.target.value)}
                    />
                    <button
                      type="button"
                      onClick={handleAddNote}
                      className="rounded-lg bg-indigo-600 px-3 py-1.5 text-sm text-white hover:bg-indigo-500"
                    >
                      Add Note
                    </button>
                  </div>
                ),
              },
            ]}
          />

          <div className="mt-auto space-y-3 border-t border-white/10 pt-4">
            <div className="grid gap-3 sm:grid-cols-2">
              <label className="flex flex-col gap-1 text-xs text-alygo-text-muted">
                Assign Staff
                <Select
                  placeholder="Select agent"
                  value={assignedAgent}
                  onChange={handleAssign}
                  options={SUPPORT_AGENT_OPTIONS}
                  disabled={!conversationId}
                />
              </label>
              <label className="flex flex-col gap-1 text-xs text-alygo-text-muted">
                Change Status
                <Select
                  value={status}
                  onChange={handleStatusChange}
                  options={STATUS_OPTIONS}
                  disabled={!conversationId}
                />
              </label>
            </div>
          </div>
        </div>
      )}
    </Drawer>
  )
}
