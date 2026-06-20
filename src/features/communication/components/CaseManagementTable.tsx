import { Table, Tag } from 'antd'
import {
  AdminActionHost,
  createActionsColumn,
} from '@/components/admin'
import { useAdminActions } from '@/hooks/useAdminActions'
import {
  CASE_TYPE_LABELS,
  useGetSupportCasesQuery,
  useUpdateSupportCaseMutation,
} from '@/services/communicationApi'
import type { SupportCase } from '@/types/communication'
import {
  priorityColor,
  priorityLabel,
  statusColor,
  statusLabel,
} from '@/features/communication/communicationHelpers'
import { ArrowUp, CheckCircle, Eye } from 'lucide-react'

export function CaseManagementTable() {
  const adminActions = useAdminActions()
  const { data = [], isLoading } = useGetSupportCasesQuery()
  const [updateCase] = useUpdateSupportCaseMutation()

  const handleAction = (key: string, record: SupportCase) => {
    if (key === 'view') {
      adminActions.openDrawer(`Case ${record.caseNumber}`, [
        { label: 'Type', value: CASE_TYPE_LABELS[record.type] ?? record.type },
        { label: 'Subject', value: record.subject },
        { label: 'User', value: record.userName },
        { label: 'Status', value: statusLabel(record.status) },
        { label: 'Priority', value: priorityLabel(record.priority) },
        { label: 'Assigned Agent', value: record.assignedAgent },
        { label: 'Trip ID', value: record.tripId ?? '—' },
        { label: 'City', value: record.city ?? '—' },
      ])
    }
    if (key === 'resolve') {
      updateCase({ id: record.id, status: 'resolved' }).unwrap()
        .then(() => adminActions.notify('Case resolved', record.caseNumber))
    }
    if (key === 'escalate') {
      updateCase({ id: record.id, status: 'escalated' }).unwrap()
        .then(() => adminActions.notify('Case escalated', record.caseNumber))
    }
  }

  return (
    <>
      <p className="mb-4 text-sm text-alygo-text-muted">
        Support ticket system for safety, lost & found, cancellations, fare disputes, refunds, and technical issues.
      </p>
      <Table
        loading={isLoading}
        rowKey="id"
        dataSource={data}
        scroll={{ x: 1200 }}
        columns={[
          { title: 'Case #', dataIndex: 'caseNumber', width: 140 },
          { title: 'Type', dataIndex: 'type', render: (t: string) => <Tag>{CASE_TYPE_LABELS[t] ?? t}</Tag> },
          { title: 'Subject', dataIndex: 'subject', ellipsis: true },
          { title: 'User', dataIndex: 'userName' },
          { title: 'Priority', dataIndex: 'priority', render: (p: string) => <Tag color={priorityColor(p)}>{priorityLabel(p)}</Tag> },
          { title: 'Status', dataIndex: 'status', render: (s: string) => <Tag color={statusColor(s)}>{statusLabel(s)}</Tag> },
          { title: 'Agent', dataIndex: 'assignedAgent' },
          { title: 'Updated', dataIndex: 'updatedAt', render: (d: string) => new Date(d).toLocaleString() },
          createActionsColumn<SupportCase>(
            (record) => [
              { key: 'view', label: 'View', icon: Eye },
              ...(record.status !== 'resolved' ? [
                { key: 'resolve', label: 'Resolve', icon: CheckCircle, group: 1 as const },
                { key: 'escalate', label: 'Escalate', icon: ArrowUp, danger: true, group: 2 as const },
              ] : []),
            ],
            (key, record) => handleAction(key, record),
          ),
        ]}
      />
      <AdminActionHost actions={adminActions} />
    </>
  )
}
