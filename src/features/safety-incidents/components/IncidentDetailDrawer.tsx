import { useState } from 'react'
import { Button, Drawer, Form, Input, Modal, Select, Space, Table, Tag, Timeline } from 'antd'
import { FileText, MapPin, Paperclip } from 'lucide-react'
import { useAdminActions } from '@/hooks/useAdminActions'
import {
  STATUS_OPTIONS,
  useAddIncidentNoteMutation,
  useCloseIncidentMutation,
  useGetIncidentByIdQuery,
  useReopenIncidentMutation,
  useResolveIncidentMutation,
  useUpdateIncidentStatusMutation,
} from '@/services/safetyIncidentApi'
import type { IncidentStatus } from '@/types/safetyIncident'
import {
  priorityColor,
  priorityLabel,
  statusColor,
  statusLabel,
  typeLabel,
} from '@/features/safety-incidents/safetyIncidentHelpers'

interface IncidentDetailDrawerProps {
  open: boolean
  incidentId: string | null
  onClose: () => void
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="mb-6">
      <h4 className="mb-3 text-sm font-semibold uppercase tracking-wider text-alygo-text-muted">{title}</h4>
      {children}
    </div>
  )
}

export function IncidentDetailDrawer({ open, incidentId, onClose }: IncidentDetailDrawerProps) {
  const adminActions = useAdminActions()
  const { data: incident } = useGetIncidentByIdQuery(incidentId ?? '', { skip: !open || !incidentId })

  const [noteOpen, setNoteOpen] = useState(false)
  const [statusOpen, setStatusOpen] = useState(false)
  const [resolveOpen, setResolveOpen] = useState(false)
  const [closeOpen, setCloseOpen] = useState(false)
  const [reopenOpen, setReopenOpen] = useState(false)
  const [internalNote, setInternalNote] = useState('')
  const [newStatus, setNewStatus] = useState<IncidentStatus>('open')
  const [statusNote, setStatusNote] = useState('')
  const [resolveNote, setResolveNote] = useState('')
  const [closeNote, setCloseNote] = useState('')
  const [reopenNote, setReopenNote] = useState('')

  const [addIncidentNote, { isLoading: addingNote }] = useAddIncidentNoteMutation()
  const [updateIncidentStatus, { isLoading: updatingStatus }] = useUpdateIncidentStatusMutation()
  const [resolveIncident, { isLoading: resolving }] = useResolveIncidentMutation()
  const [closeIncident, { isLoading: closing }] = useCloseIncidentMutation()
  const [reopenIncident, { isLoading: reopening }] = useReopenIncidentMutation()

  if (!incident) return null

  const timelineEvents = [
    ...incident.tripHistory.map((entry) => ({
      key: `trip-${entry.timestamp}-${entry.event}`,
      label: entry.event,
      timestamp: entry.timestamp,
    })),
  ].sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime())

  const canResolve = incident.status !== 'resolved' && incident.status !== 'closed'
  const canClose = incident.status === 'resolved'
  const canReopen = incident.status === 'closed'

  return (
    <>
      <Drawer
        title={`Case ${incident.caseId}`}
        open={open}
        onClose={onClose}
        width={720}
        destroyOnClose
        extra={
          <Space wrap>
            <Button onClick={() => { setInternalNote(''); setNoteOpen(true) }}>Add Note</Button>
            <Button onClick={() => { setNewStatus(incident.status); setStatusNote(''); setStatusOpen(true) }}>
              Update Status
            </Button>
            {canResolve && (
              <Button onClick={() => { setResolveNote(''); setResolveOpen(true) }}>Resolve</Button>
            )}
            {canClose && (
              <Button onClick={() => { setCloseNote(''); setCloseOpen(true) }}>Close</Button>
            )}
            {canReopen && (
              <Button onClick={() => { setReopenNote(''); setReopenOpen(true) }}>Reopen</Button>
            )}
          </Space>
        }
      >
        <div className="mb-4 flex flex-wrap gap-2">
          <Tag>{typeLabel(incident.type)}</Tag>
          <Tag color={statusColor(incident.status)}>{statusLabel(incident.status)}</Tag>
          <Tag color={priorityColor(incident.priority)}>{priorityLabel(incident.priority)}</Tag>
        </div>

        <Section title="Case Information">
          <p className="text-sm text-white">{incident.description}</p>
          <p className="mt-2 text-xs text-alygo-text-muted">
            Reported {new Date(incident.createdAt).toLocaleString()} · Trip {incident.tripId}
          </p>
        </Section>

        <Section title="Driver Information">
          <div className="space-y-2 text-sm">
            <p><span className="text-alygo-text-muted">Name:</span> {incident.driverName}</p>
            <p><span className="text-alygo-text-muted">Driver ID:</span> {incident.driverId}</p>
            <p><span className="text-alygo-text-muted">Phone:</span> {incident.driverPhone}</p>
          </div>
        </Section>

        <Section title="Passenger Information">
          <div className="space-y-2 text-sm">
            <p><span className="text-alygo-text-muted">Name:</span> {incident.passengerName}</p>
            <p><span className="text-alygo-text-muted">Passenger ID:</span> {incident.passengerId}</p>
            <p><span className="text-alygo-text-muted">Phone:</span> {incident.passengerPhone}</p>
          </div>
        </Section>

        <Section title="Timeline">
          {timelineEvents.length === 0 ? (
            <p className="text-sm text-alygo-text-muted">No timeline events.</p>
          ) : (
            <Timeline
              items={timelineEvents.map((event) => ({
                dot: <MapPin className="h-3 w-3 text-indigo-400" />,
                children: (
                  <div>
                    <p className="text-white">{event.label}</p>
                    <p className="text-xs text-alygo-text-muted">{new Date(event.timestamp).toLocaleString()}</p>
                  </div>
                ),
              }))}
            />
          )}
        </Section>

        <Section title="Internal Notes">
          {incident.notes.length === 0 ? (
            <p className="text-sm text-alygo-text-muted">No internal notes yet.</p>
          ) : (
            <Table
              size="small"
              pagination={false}
              rowKey="id"
              dataSource={incident.notes}
              columns={[
                { title: 'Author', dataIndex: 'author', width: 120 },
                { title: 'Note', dataIndex: 'content', ellipsis: true },
                { title: 'Time', dataIndex: 'timestamp', render: (d: string) => new Date(d).toLocaleString() },
              ]}
            />
          )}
        </Section>

        <Section title="Attachments / Evidence">
          {incident.attachments.length === 0 ? (
            <p className="text-sm text-alygo-text-muted">No attachments uploaded.</p>
          ) : (
            <div className="space-y-2">
              {incident.attachments.map((att) => (
                <div key={att.id} className="flex items-center gap-2 rounded-lg border border-white/5 p-3 text-sm">
                  <Paperclip className="h-4 w-4 text-alygo-text-muted" />
                  <FileText className="h-4 w-4 text-indigo-400" />
                  <span className="text-white">{att.name}</span>
                  <span className="ml-auto text-xs text-alygo-text-muted">
                    {att.type} · {new Date(att.uploadedAt).toLocaleString()}
                  </span>
                </div>
              ))}
            </div>
          )}
        </Section>

        <Section title="Status History">
          <Timeline
            items={incident.statusHistory.map((entry, index) => ({
              key: `${entry.status}-${entry.timestamp}-${index}`,
              children: (
                <div>
                  <p className="font-medium text-white">{statusLabel(entry.status)}</p>
                  {entry.note && <p className="text-sm text-alygo-text-muted">{entry.note}</p>}
                  <p className="text-xs text-alygo-text-muted">{new Date(entry.timestamp).toLocaleString()}</p>
                </div>
              ),
            }))}
          />
        </Section>

        {incident.resolutionNotes && (
          <Section title="Resolution">
            <p className="text-sm text-white">{incident.resolutionNotes}</p>
          </Section>
        )}
      </Drawer>

      <Modal
        title={`Add Note — ${incident.caseId}`}
        open={noteOpen}
        confirmLoading={addingNote}
        onCancel={() => setNoteOpen(false)}
        onOk={async () => {
          if (!internalNote.trim()) return
          await addIncidentNote({ id: incident.id, content: internalNote.trim() }).unwrap()
          adminActions.notify('Note added')
          setNoteOpen(false)
        }}
        destroyOnClose
      >
        <Form layout="vertical" className="mt-4">
          <Form.Item label="Internal Note">
            <Input.TextArea rows={3} value={internalNote} onChange={(e) => setInternalNote(e.target.value)} />
          </Form.Item>
        </Form>
      </Modal>

      <Modal
        title={`Update Status — ${incident.caseId}`}
        open={statusOpen}
        confirmLoading={updatingStatus}
        onCancel={() => setStatusOpen(false)}
        onOk={async () => {
          await updateIncidentStatus({ id: incident.id, status: newStatus, note: statusNote || undefined }).unwrap()
          adminActions.notify(`Status updated to ${statusLabel(newStatus)}`)
          setStatusOpen(false)
        }}
        destroyOnClose
      >
        <Form layout="vertical" className="mt-4">
          <Form.Item label="Status">
            <Select value={newStatus} onChange={setNewStatus} options={STATUS_OPTIONS} />
          </Form.Item>
          <Form.Item label="Note (optional)">
            <Input.TextArea rows={2} value={statusNote} onChange={(e) => setStatusNote(e.target.value)} />
          </Form.Item>
        </Form>
      </Modal>

      <Modal
        title={`Resolve Case — ${incident.caseId}`}
        open={resolveOpen}
        confirmLoading={resolving}
        onCancel={() => setResolveOpen(false)}
        onOk={async () => {
          await resolveIncident({ id: incident.id, note: resolveNote }).unwrap()
          adminActions.notify(`Case ${incident.caseId} resolved`)
          setResolveOpen(false)
        }}
        destroyOnClose
      >
        <Form layout="vertical" className="mt-4">
          <Form.Item label="Resolution Notes">
            <Input.TextArea rows={3} value={resolveNote} onChange={(e) => setResolveNote(e.target.value)} />
          </Form.Item>
        </Form>
      </Modal>

      <Modal
        title={`Close Case — ${incident.caseId}`}
        open={closeOpen}
        confirmLoading={closing}
        onCancel={() => setCloseOpen(false)}
        onOk={async () => {
          await closeIncident({ id: incident.id, note: closeNote }).unwrap()
          adminActions.notify(`Case ${incident.caseId} closed`)
          setCloseOpen(false)
        }}
        destroyOnClose
      >
        <Form layout="vertical" className="mt-4">
          <Form.Item label="Closing Notes (optional)">
            <Input.TextArea rows={3} value={closeNote} onChange={(e) => setCloseNote(e.target.value)} />
          </Form.Item>
        </Form>
      </Modal>

      <Modal
        title={`Reopen Case — ${incident.caseId}`}
        open={reopenOpen}
        confirmLoading={reopening}
        onCancel={() => setReopenOpen(false)}
        onOk={async () => {
          await reopenIncident({ id: incident.id, note: reopenNote }).unwrap()
          adminActions.notify(`Case ${incident.caseId} reopened`)
          setReopenOpen(false)
        }}
        destroyOnClose
      >
        <Form layout="vertical" className="mt-4">
          <Form.Item label="Reopen Notes (optional)">
            <Input.TextArea rows={3} value={reopenNote} onChange={(e) => setReopenNote(e.target.value)} />
          </Form.Item>
        </Form>
      </Modal>
    </>
  )
}
