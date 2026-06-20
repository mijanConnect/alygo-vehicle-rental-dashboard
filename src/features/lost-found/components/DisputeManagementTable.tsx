import { useState } from 'react'
import { Table, Tag } from 'antd'
import {
  AdminActionHost,
  ConfirmationModal,
  createActionsColumn,
  createTableRowProps,
} from '@/components/admin'
import { useAdminActions } from '@/hooks/useAdminActions'
import {
  useEscalateDisputeMutation,
  useGetLostFoundDisputesQuery,
  useResolveDisputeMutation,
} from '@/services/lostFoundApi'
import type { LostFoundDispute } from '@/types/lostFound'
import {
  DISPUTE_TYPE_LABELS,
  getDisputeActionItems,
  openLostFoundDrawer,
} from '@/features/lost-found/lostFoundHelpers'
import type { DetailField } from '@/components/admin/types'

const priorityColors: Record<string, string> = {
  low: 'default',
  medium: 'processing',
  high: 'warning',
  critical: 'error',
}

function buildDisputeDetailFields(record: LostFoundDispute): DetailField[] {
  return [
    { label: 'Case ID', value: record.id },
    { label: 'Report ID', value: record.reportId },
    { label: 'Type', value: DISPUTE_TYPE_LABELS[record.type] ?? record.type },
    { label: 'Passenger', value: record.passengerName },
    { label: 'Driver', value: record.driverName },
    { label: 'Status', value: record.status.replace(/_/g, ' ') },
    { label: 'Priority', value: record.priority },
    { label: 'Assigned Admin', value: record.assignedAdmin },
    { label: 'Evidence', value: record.evidence },
    { label: 'Created', value: new Date(record.createdAt).toLocaleString() },
  ]
}

export function DisputeManagementTable() {
  const adminActions = useAdminActions()
  const { data = [], isLoading } = useGetLostFoundDisputesQuery()
  const [resolveRecord, setResolveRecord] = useState<LostFoundDispute | null>(null)
  const [escalateRecord, setEscalateRecord] = useState<LostFoundDispute | null>(null)

  const [resolveDispute, { isLoading: resolving }] = useResolveDisputeMutation()
  const [escalateDispute, { isLoading: escalating }] = useEscalateDisputeMutation()

  const handleAction = (key: string, record: LostFoundDispute) => {
    switch (key) {
      case 'view':
        openLostFoundDrawer('Dispute Evidence', buildDisputeDetailFields(record), adminActions)
        break
      case 'contact-driver':
        adminActions.notify(`Contacting driver: ${record.driverName}`)
        break
      case 'contact-passenger':
        adminActions.notify(`Contacting passenger: ${record.passengerName}`)
        break
      case 'resolve':
        setResolveRecord(record)
        break
      case 'escalate':
        setEscalateRecord(record)
        break
    }
  }

  return (
    <>
      <Table
        loading={isLoading}
        rowKey="id"
        dataSource={data}
        scroll={{ x: 1100 }}
        {...createTableRowProps<LostFoundDispute>((record) =>
          openLostFoundDrawer('Dispute Evidence', buildDisputeDetailFields(record), adminActions),
        )}
        columns={[
          { title: 'Case ID', dataIndex: 'id', width: 100 },
          { title: 'Passenger', dataIndex: 'passengerName' },
          { title: 'Driver', dataIndex: 'driverName' },
          {
            title: 'Status',
            dataIndex: 'status',
            render: (s: string) => <Tag>{s.replace(/_/g, ' ')}</Tag>,
          },
          {
            title: 'Priority',
            dataIndex: 'priority',
            render: (p: string) => <Tag color={priorityColors[p]}>{p}</Tag>,
          },
          { title: 'Assigned Admin', dataIndex: 'assignedAdmin' },
          createActionsColumn<LostFoundDispute>(
            () => getDisputeActionItems(),
            (key, record) => handleAction(key, record),
          ),
        ]}
      />

      <ConfirmationModal
        open={Boolean(resolveRecord)}
        title="Resolve Dispute"
        description={`Mark dispute ${resolveRecord?.id} as resolved?`}
        confirmLabel="Resolve"
        loading={resolving}
        onCancel={() => setResolveRecord(null)}
        onConfirm={async () => {
          if (!resolveRecord) return
          await resolveDispute(resolveRecord.id).unwrap()
          adminActions.notify(`Dispute ${resolveRecord.id} resolved`)
          setResolveRecord(null)
        }}
      />

      <ConfirmationModal
        open={Boolean(escalateRecord)}
        title="Escalate Dispute"
        description={`Escalate dispute ${escalateRecord?.id} to Ops Manager?`}
        confirmLabel="Escalate"
        danger
        loading={escalating}
        onCancel={() => setEscalateRecord(null)}
        onConfirm={async () => {
          if (!escalateRecord) return
          await escalateDispute(escalateRecord.id).unwrap()
          adminActions.notify(`Dispute ${escalateRecord.id} escalated`)
          setEscalateRecord(null)
        }}
      />

      <AdminActionHost actions={adminActions} />
    </>
  )
}
