import { useState } from 'react'
import { Form, Input, Modal, Select, Table, Tag } from 'antd'
import {
  AdminActionHost,
  createActionsColumn,
  createTableRowProps,
} from '@/components/admin'
import { useAdminActions } from '@/hooks/useAdminActions'
import {
  STATUS_OPTIONS,
  useAddIncidentNoteMutation,
  useCloseIncidentMutation,
  useGetIncidentsQuery,
  useReopenIncidentMutation,
  useResolveIncidentMutation,
  useUpdateIncidentStatusMutation,
} from '@/services/safetyIncidentApi'
import type { IncidentStatus, SafetyIncident } from '@/types/safetyIncident'
import {
  getIncidentActionItems,
  priorityColor,
  priorityLabel,
  statusColor,
  statusLabel,
  typeLabel,
} from '@/features/safety-incidents/safetyIncidentHelpers'
import { IncidentDetailDrawer } from '@/features/safety-incidents/components/IncidentDetailDrawer'

export function IncidentTable() {
  const adminActions = useAdminActions()
  const { data = [], isLoading } = useGetIncidentsQuery()
  const [selected, setSelected] = useState<SafetyIncident | null>(null)
  const [noteRecord, setNoteRecord] = useState<SafetyIncident | null>(null)
  const [statusRecord, setStatusRecord] = useState<SafetyIncident | null>(null)
  const [resolveRecord, setResolveRecord] = useState<SafetyIncident | null>(null)
  const [closeRecord, setCloseRecord] = useState<SafetyIncident | null>(null)
  const [reopenRecord, setReopenRecord] = useState<SafetyIncident | null>(null)
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

  const handleAction = (key: string, record: SafetyIncident) => {
    switch (key) {
      case 'view':
        setSelected(record)
        break
      case 'note':
        setNoteRecord(record)
        setInternalNote('')
        break
      case 'status':
        setStatusRecord(record)
        setNewStatus(record.status)
        setStatusNote('')
        break
      case 'resolve':
        setResolveRecord(record)
        setResolveNote('')
        break
      case 'close':
        setCloseRecord(record)
        setCloseNote('')
        break
      case 'reopen':
        setReopenRecord(record)
        setReopenNote('')
        break
    }
  }

  return (
    <>
      <Table
        loading={isLoading}
        rowKey="id"
        dataSource={data}
        scroll={{ x: 1200 }}
        {...createTableRowProps<SafetyIncident>((record) => setSelected(record))}
        columns={[
          { title: 'Case ID', dataIndex: 'caseId', width: 140 },
          { title: 'Case Type', dataIndex: 'type', render: (t: string) => <Tag>{typeLabel(t)}</Tag> },
          { title: 'Driver', dataIndex: 'driverName' },
          { title: 'Passenger', dataIndex: 'passengerName' },
          { title: 'Priority', dataIndex: 'priority', render: (p: string) => <Tag color={priorityColor(p)}>{priorityLabel(p)}</Tag> },
          { title: 'Status', dataIndex: 'status', render: (s: string) => <Tag color={statusColor(s)}>{statusLabel(s)}</Tag> },
          { title: 'Created Date', dataIndex: 'createdAt', render: (d: string) => new Date(d).toLocaleString() },
          createActionsColumn<SafetyIncident>(
            (record) => getIncidentActionItems(record),
            (key, record) => handleAction(key, record),
          ),
        ]}
      />

      <IncidentDetailDrawer
        open={Boolean(selected)}
        incidentId={selected?.id ?? null}
        onClose={() => setSelected(null)}
      />

      <Modal
        title={`Add Note — ${noteRecord?.caseId}`}
        open={Boolean(noteRecord)}
        confirmLoading={addingNote}
        onCancel={() => setNoteRecord(null)}
        onOk={async () => {
          if (!noteRecord || !internalNote.trim()) return
          await addIncidentNote({ id: noteRecord.id, content: internalNote.trim() }).unwrap()
          adminActions.notify('Note added')
          setNoteRecord(null)
        }}
        destroyOnClose
      >
        <Form layout="vertical" className="mt-4">
          <Form.Item label="Internal Note">
            <Input.TextArea
              rows={3}
              value={internalNote}
              onChange={(e) => setInternalNote(e.target.value)}
              placeholder="Add investigation note..."
            />
          </Form.Item>
        </Form>
      </Modal>

      <Modal
        title={`Change Status — ${statusRecord?.caseId}`}
        open={Boolean(statusRecord)}
        confirmLoading={updatingStatus}
        onCancel={() => setStatusRecord(null)}
        onOk={async () => {
          if (!statusRecord) return
          await updateIncidentStatus({
            id: statusRecord.id,
            status: newStatus,
            note: statusNote || undefined,
          }).unwrap()
          adminActions.notify(`Case status updated to ${statusLabel(newStatus)}`)
          setStatusRecord(null)
        }}
        destroyOnClose
      >
        <Form layout="vertical" className="mt-4">
          <Form.Item label="Status">
            <Select
              value={newStatus}
              onChange={setNewStatus}
              options={STATUS_OPTIONS}
            />
          </Form.Item>
          <Form.Item label="Note (optional)">
            <Input.TextArea
              rows={2}
              value={statusNote}
              onChange={(e) => setStatusNote(e.target.value)}
              placeholder="Reason for status change..."
            />
          </Form.Item>
        </Form>
      </Modal>

      <Modal
        title={`Resolve Case — ${resolveRecord?.caseId}`}
        open={Boolean(resolveRecord)}
        confirmLoading={resolving}
        onCancel={() => setResolveRecord(null)}
        onOk={async () => {
          if (!resolveRecord) return
          await resolveIncident({ id: resolveRecord.id, note: resolveNote }).unwrap()
          adminActions.notify(`Case ${resolveRecord.caseId} resolved`)
          setResolveRecord(null)
        }}
        destroyOnClose
      >
        <Form layout="vertical" className="mt-4">
          <Form.Item label="Resolution Notes">
            <Input.TextArea
              rows={3}
              value={resolveNote}
              onChange={(e) => setResolveNote(e.target.value)}
              placeholder="Describe resolution..."
            />
          </Form.Item>
        </Form>
      </Modal>

      <Modal
        title={`Close Case — ${closeRecord?.caseId}`}
        open={Boolean(closeRecord)}
        confirmLoading={closing}
        onCancel={() => setCloseRecord(null)}
        onOk={async () => {
          if (!closeRecord) return
          await closeIncident({ id: closeRecord.id, note: closeNote }).unwrap()
          adminActions.notify(`Case ${closeRecord.caseId} closed`)
          setCloseRecord(null)
        }}
        destroyOnClose
      >
        <Form layout="vertical" className="mt-4">
          <Form.Item label="Closing Notes (optional)">
            <Input.TextArea
              rows={3}
              value={closeNote}
              onChange={(e) => setCloseNote(e.target.value)}
              placeholder="Add any final notes before closing..."
            />
          </Form.Item>
        </Form>
      </Modal>

      <Modal
        title={`Reopen Case — ${reopenRecord?.caseId}`}
        open={Boolean(reopenRecord)}
        confirmLoading={reopening}
        onCancel={() => setReopenRecord(null)}
        onOk={async () => {
          if (!reopenRecord) return
          await reopenIncident({ id: reopenRecord.id, note: reopenNote }).unwrap()
          adminActions.notify(`Case ${reopenRecord.caseId} reopened`)
          setReopenRecord(null)
        }}
        destroyOnClose
      >
        <Form layout="vertical" className="mt-4">
          <Form.Item label="Reopen Notes (optional)">
            <Input.TextArea
              rows={3}
              value={reopenNote}
              onChange={(e) => setReopenNote(e.target.value)}
              placeholder="Reason for reopening..."
            />
          </Form.Item>
        </Form>
      </Modal>

      <AdminActionHost actions={adminActions} />
    </>
  )
}
