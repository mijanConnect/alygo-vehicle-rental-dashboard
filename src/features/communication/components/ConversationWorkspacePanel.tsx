import { useMemo, useState } from 'react'
import { Badge, Button, Form, Input, Modal, Select, Tag, message } from 'antd'
import {
  AlertTriangle,
  ArrowLeft,
  CheckCircle,
  MessageSquarePlus,
  Phone,
  Shield,
  StickyNote,
} from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { AdminActionHost } from '@/components/admin'
import { StatusBadge } from '@/components/common/StatusBadge'
import { useAdminActions } from '@/hooks/useAdminActions'
import {
  avatarUrl,
  userTypeLabel,
} from '@/features/communication/communicationHelpers'
import { CaseManagementPanel } from '@/features/communication/components/CaseManagementPanel'
import { ChatPanel } from '@/features/communication/components/ChatPanel'
import { SafetyCasePanel } from '@/features/communication/components/SafetyCasePanel'
import { TripContextPanel } from '@/features/communication/components/TripContextPanel'
import type { Conversation, InternalNote } from '@/types/communication'
import { mockTrips, mockDrivers } from '@/services/mock/data'
import {
  useAssignConversationMutation,
  useCreateInternalNoteMutation,
  useGetInternalNotesQuery,
  useGetMessageTemplatesQuery,
  useGetSafetyCommunicationsQuery,
  useSendMessageMutation,
  useUpdateConversationMutation,
  useUpdateConversationStatusMutation,
  NOTE_TYPE_LABELS,
} from '@/services/communicationApi'

interface ConversationWorkspacePanelProps {
  conversation: Conversation | null
  onBack?: () => void
  showBackButton?: boolean
}

export function ConversationWorkspacePanel({
  conversation,
  onBack,
  showBackButton,
}: ConversationWorkspacePanelProps) {
  const navigate = useNavigate()
  const adminActions = useAdminActions()
  const [resolutionNotes, setResolutionNotes] = useState('')
  const [noteModalOpen, setNoteModalOpen] = useState(false)
  const [noteForm] = Form.useForm()

  const [sendMessage, { isLoading: sending }] = useSendMessageMutation()
  const [updateStatus] = useUpdateConversationStatusMutation()
  const [updateConversation] = useUpdateConversationMutation()
  const [assignConversation, { isLoading: assigning }] = useAssignConversationMutation()
  const [createInternalNote, { isLoading: creatingNote }] = useCreateInternalNoteMutation()
  const { data: templates = [] } = useGetMessageTemplatesQuery()
  const { data: allNotes = [] } = useGetInternalNotesQuery()
  const { data: safetyRecords = [] } = useGetSafetyCommunicationsQuery()

  const trip = useMemo(
    () => (conversation?.tripId ? mockTrips.find((t) => t.id === conversation.tripId) : undefined),
    [conversation?.tripId],
  )

  const vehicle = useMemo(
    () => (trip ? mockDrivers.find((d) => d.id === trip.driverId)?.vehicle : undefined),
    [trip],
  )

  const relatedNotes = useMemo(() => {
    if (!conversation) return []
    return allNotes.filter(
      (n) => n.userId === conversation.userId || (conversation.tripId && n.tripId === conversation.tripId),
    )
  }, [allNotes, conversation])

  const safetyRecord = useMemo(() => {
    if (!conversation || conversation.category !== 'safety') return undefined
    return safetyRecords.find(
      (s) => s.tripId === conversation.tripId || s.userName === conversation.userName,
    )
  }, [conversation, safetyRecords])

  const quickReplies = useMemo(
    () => templates.filter((t) => t.status === 'active').slice(0, 4).map((t) => t.content),
    [templates],
  )

  if (!conversation) {
    return (
      <div className="flex h-full flex-col items-center justify-center bg-white/1 p-8 text-center">
        <MessageSquarePlus className="mb-3 h-10 w-10 text-indigo-400/50" />
        <p className="text-base font-medium text-white">Select a conversation</p>
        <p className="mt-1 max-w-sm text-sm text-alygo-text-muted">
          Choose a conversation from the list to view messages, trip context, and case details.
        </p>
      </div>
    )
  }

  const handleResolve = async () => {
    await updateStatus({ id: conversation.id, status: 'resolved' }).unwrap()
    adminActions.notify('Case resolved', conversation.userName)
    message.success('Conversation resolved')
  }

  const handleEscalate = async () => {
    await updateStatus({ id: conversation.id, status: 'escalated' }).unwrap()
    adminActions.notify('Conversation escalated', conversation.userName)
    message.success('Conversation escalated')
  }

  return (
    <>
      <div className="flex h-full flex-col overflow-hidden bg-white/1">
        <header className="shrink-0 border-b border-white/5 bg-[#0d0f14]/95 px-4 py-3 backdrop-blur">
          <div className="flex flex-wrap items-start gap-3">
            {showBackButton && (
              <button
                type="button"
                onClick={onBack}
                className="rounded-lg border border-white/10 p-2 text-alygo-text-muted hover:bg-white/5 lg:hidden"
              >
                <ArrowLeft className="h-4 w-4" />
              </button>
            )}
            <img
              src={avatarUrl(conversation.userName)}
              alt=""
              className="h-11 w-11 rounded-full border border-white/10"
            />
            <div className="min-w-0 flex-1">
              <div className="flex flex-wrap items-center gap-2">
                <h2 className="text-base font-semibold text-white">{conversation.userName}</h2>
                <Badge status={conversation.isOnline ? 'success' : 'default'} text={conversation.isOnline ? 'Online' : 'Offline'} />
                <Tag className="m-0!">{userTypeLabel(conversation.userType)}</Tag>
                {trip && <StatusBadge status={trip.status} />}
              </div>
              <p className="mt-0.5 text-xs text-alygo-text-muted">
                {conversation.city ?? '—'} · Agent: {conversation.assignedAgent}
              </p>
            </div>
            <div className="flex flex-wrap gap-1.5">
              <ActionButton icon={Phone} label="Call Driver" onClick={() => adminActions.notify('Calling driver', conversation.userName)} />
              <ActionButton icon={Phone} label="Call Passenger" onClick={() => adminActions.notify('Calling passenger', conversation.userName)} />
              <ActionButton icon={AlertTriangle} label="Escalate" onClick={handleEscalate} />
              <ActionButton icon={Shield} label="Create Incident" onClick={() => navigate('/operations/safety-incidents')} />
              <ActionButton icon={StickyNote} label="Add Internal Note" onClick={() => setNoteModalOpen(true)} />
              <ActionButton icon={CheckCircle} label="Resolve Case" onClick={handleResolve} primary />
            </div>
          </div>
        </header>

        <div className="flex min-h-0 flex-1 flex-col overflow-y-auto lg:flex-row">
          <div className="flex min-h-105 flex-1 flex-col border-b border-white/5 lg:min-h-0 lg:border-b-0 lg:border-r">
            <div className="flex min-h-0 flex-1 flex-col p-4">
              <ChatPanel
                embedded
                conversationId={conversation.id}
                userName={conversation.userName}
                isOnline={conversation.isOnline}
                isTyping={conversation.isTyping}
                sending={sending}
                quickReplies={quickReplies}
                className="h-full! min-h-90! border-0! bg-transparent!"
                onSend={(content) => sendMessage({ conversationId: conversation.id, content }).unwrap()}
              />
            </div>
          </div>

          <aside className="w-full shrink-0 overflow-y-auto p-4 lg:w-85 xl:w-95">
            <div className="space-y-4">
              {trip && <TripContextPanel trip={trip} vehicle={vehicle} />}
              {safetyRecord && (
                <SafetyCasePanel
                  safety={safetyRecord}
                  onContactDriver={() => adminActions.notify('Contacting driver', safetyRecord.tripId)}
                  onContactPassenger={() => adminActions.notify('Contacting passenger', safetyRecord.tripId)}
                  onEscalate={handleEscalate}
                  onCreateIncident={() => navigate('/operations/safety-incidents')}
                />
              )}
              <CaseManagementPanel
                conversation={conversation}
                resolutionNotes={resolutionNotes}
                onResolutionNotesChange={setResolutionNotes}
                onPriorityChange={(priority) => updateConversation({ id: conversation.id, priority }).unwrap()}
                onStatusChange={(status) => updateStatus({ id: conversation.id, status }).unwrap()}
                onAssignAgent={(agent) => assignConversation({ id: conversation.id, agent }).unwrap()}
                assigning={assigning}
              />
              <RelatedInternalNotes notes={relatedNotes} />
            </div>
          </aside>
        </div>
      </div>

      <Modal
        title="Add Internal Note"
        open={noteModalOpen}
        confirmLoading={creatingNote}
        onCancel={() => setNoteModalOpen(false)}
        onOk={async () => {
          const values = await noteForm.validateFields()
          await createInternalNote({
            userId: conversation.userId,
            userName: conversation.userName,
            userType: conversation.userType,
            noteType: values.noteType,
            content: values.content,
            tripId: conversation.tripId,
          }).unwrap()
          adminActions.notify('Internal note added')
          setNoteModalOpen(false)
          noteForm.resetFields()
        }}
        destroyOnClose
      >
        <Form form={noteForm} layout="vertical" className="mt-4">
          <Form.Item name="noteType" label="Note Type" initialValue="support" rules={[{ required: true }]}>
            <Select options={Object.entries(NOTE_TYPE_LABELS).map(([value, label]) => ({ value, label }))} />
          </Form.Item>
          <Form.Item name="content" label="Note" rules={[{ required: true }]}>
            <Input.TextArea rows={3} placeholder="Visible to support agents only" />
          </Form.Item>
        </Form>
      </Modal>

      <AdminActionHost actions={adminActions} />
    </>
  )
}

function RelatedInternalNotes({ notes }: { notes: InternalNote[] }) {
  return (
    <div className="rounded-xl border border-white/10 bg-white/3 p-4">
      <div className="mb-3 flex items-center gap-2">
        <StickyNote className="h-4 w-4 text-amber-400" />
        <h4 className="text-sm font-semibold text-white">Related Internal Notes</h4>
      </div>
      {notes.length === 0 ? (
        <p className="text-sm text-alygo-text-muted">No internal notes for this conversation yet.</p>
      ) : (
        <div className="space-y-3">
          {notes.map((note) => (
            <div key={note.id} className="rounded-lg border border-white/5 bg-black/20 p-3">
              <div className="mb-1 flex flex-wrap items-center gap-2">
                <Tag className="m-0!">{NOTE_TYPE_LABELS[note.noteType]}</Tag>
                <span className="text-xs text-alygo-text-muted">{note.author}</span>
                <span className="text-xs text-alygo-text-muted">{new Date(note.createdAt).toLocaleString()}</span>
              </div>
              <p className="text-sm text-white">{note.content}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

function ActionButton({
  icon: Icon,
  label,
  onClick,
  primary,
}: {
  icon: typeof Phone
  label: string
  onClick: () => void
  primary?: boolean
}) {
  return (
    <Button
      size="small"
      type={primary ? 'primary' : 'default'}
      icon={<Icon className="h-3.5 w-3.5" />}
      onClick={onClick}
      className="text-xs!"
    >
      <span className="hidden xl:inline">{label}</span>
    </Button>
  )
}
