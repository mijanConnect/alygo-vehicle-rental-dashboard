import { Table, Tag } from 'antd'
import {
  AdminActionHost,
  createActionsColumn,
} from '@/components/admin'
import { useAdminActions } from '@/hooks/useAdminActions'
import { useNavigate } from 'react-router-dom'
import {
  SAFETY_TYPE_LABELS,
  useGetSafetyCommunicationsQuery,
} from '@/services/communicationApi'
import type { SafetyCommunication } from '@/types/communication'
import { buildCommunicationInboxPath } from '@/features/communication/communicationNavigation'
import {
  getSafetyRecordActionItems,
  priorityColor,
  priorityLabel,
  statusColor,
  statusLabel,
} from '@/features/communication/communicationHelpers'

export function SafetyCommunicationsTable() {
  const adminActions = useAdminActions()
  const navigate = useNavigate()
  const { data = [], isLoading } = useGetSafetyCommunicationsQuery()

  const handleAction = (key: string, record: SafetyCommunication) => {
    switch (key) {
      case 'contact-driver':
      case 'contact-passenger':
        navigate(buildCommunicationInboxPath('safety'))
        adminActions.notify(`Opening chat for ${record.userName}`)
        break
      case 'escalate':
        adminActions.openConfirm({
          title: 'Escalate Incident',
          description: `Escalate ${SAFETY_TYPE_LABELS[record.reportType]} for ${record.userName}?`,
          confirmLabel: 'Escalate',
          danger: true,
          onConfirm: async () => adminActions.notify('Incident escalated', record.tripId),
        })
        break
      case 'investigate':
        adminActions.notify('Investigation case created', record.tripId)
        break
      case 'suspend':
        adminActions.openSuspension({
          title: 'Suspend Account',
          entityLabel: record.userName,
          onConfirm: async () => adminActions.notify('Account suspended', record.userName),
        })
        break
      case 'report':
        adminActions.notify('Safety report generated', record.tripId)
        break
    }
  }

  return (
    <>
      <p className="mb-4 text-sm text-alygo-text-muted">
        Dedicated safety communication hub for SOS alerts, emergency reports, harassment cases, and accident investigations.
      </p>
      <Table
        loading={isLoading}
        rowKey="id"
        dataSource={data}
        scroll={{ x: 1200 }}
        columns={[
          { title: 'Report Type', dataIndex: 'reportType', render: (t: string) => <Tag color="red">{SAFETY_TYPE_LABELS[t] ?? t}</Tag> },
          { title: 'User', dataIndex: 'userName' },
          { title: 'User Type', dataIndex: 'userType', render: (t: string) => <Tag>{t}</Tag> },
          { title: 'Trip ID', dataIndex: 'tripId' },
          { title: 'City', dataIndex: 'city' },
          { title: 'Priority', dataIndex: 'priority', render: (p: string) => <Tag color={priorityColor(p)}>{priorityLabel(p)}</Tag> },
          { title: 'Status', dataIndex: 'status', render: (s: string) => <Tag color={statusColor(s)}>{statusLabel(s)}</Tag> },
          { title: 'Agent', dataIndex: 'assignedAgent' },
          { title: 'Description', dataIndex: 'description', ellipsis: true },
          { title: 'Last Activity', dataIndex: 'lastActivity', render: (d: string) => new Date(d).toLocaleString() },
          createActionsColumn<SafetyCommunication>(
            (record) => getSafetyRecordActionItems(record),
            (key, record) => handleAction(key, record),
          ),
        ]}
      />
      <AdminActionHost actions={adminActions} />
    </>
  )
}
