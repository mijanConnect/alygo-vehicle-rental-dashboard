import { useMemo, useState } from 'react'
import { Button, Table } from 'antd'
import { Plus } from 'lucide-react'
import {
  AdminActionHost,
  ConfirmationModal,
  createActionsColumn,
  createTableRowProps,
} from '@/components/admin'
import { StatusBadge } from '@/components/common/StatusBadge'
import { useAdminActions } from '@/hooks/useAdminActions'
import {
  useCreateCancellationReasonMutation,
  useDeleteCancellationReasonMutation,
  useGetDriverCancellationReasonsQuery,
  useGetPassengerCancellationReasonsQuery,
  useToggleCancellationReasonStatusMutation,
  useUpdateCancellationReasonMutation,
} from '@/services/cancellationApi'
import type { CancellationReasonRow } from '@/types/cancellation'
import {
  buildReasonDetailFields,
  getReasonActionItems,
  getReasonUserTypeLabel,
  openPolicyDrawer,
} from '@/features/cancellations/cancellationHelpers'
import { CreateReasonModal, EditReasonModal } from '@/features/cancellations/components/ReasonFormModal'

export function CancellationReasonTable() {
  const adminActions = useAdminActions()
  const { data: passengerReasons = [], isLoading: loadingPassenger } = useGetPassengerCancellationReasonsQuery()
  const { data: driverReasons = [], isLoading: loadingDriver } = useGetDriverCancellationReasonsQuery()

  const rows = useMemo<CancellationReasonRow[]>(() => {
    const combined = [
      ...passengerReasons.map((reason) => ({ ...reason, userType: 'passenger' as const })),
      ...driverReasons.map((reason) => ({ ...reason, userType: 'driver' as const })),
    ]
    return combined.sort(
      (a, b) => a.userType.localeCompare(b.userType) || a.sortOrder - b.sortOrder,
    )
  }, [passengerReasons, driverReasons])

  const [createOpen, setCreateOpen] = useState(false)
  const [editRecord, setEditRecord] = useState<CancellationReasonRow | null>(null)
  const [deleteRecord, setDeleteRecord] = useState<CancellationReasonRow | null>(null)

  const [createReason, { isLoading: creating }] = useCreateCancellationReasonMutation()
  const [updateReason, { isLoading: updating }] = useUpdateCancellationReasonMutation()
  const [toggleStatus] = useToggleCancellationReasonStatusMutation()
  const [deleteReason, { isLoading: deleting }] = useDeleteCancellationReasonMutation()

  const handleAction = (key: string, record: CancellationReasonRow) => {
    switch (key) {
      case 'view':
        openPolicyDrawer('Cancellation Reason', buildReasonDetailFields(record), adminActions)
        break
      case 'edit':
        setEditRecord(record)
        break
      case 'activate':
        toggleStatus({ type: record.userType, id: record.id, status: 'active' }).unwrap()
          .then(() => adminActions.notify('Reason activated'))
        break
      case 'deactivate':
        toggleStatus({ type: record.userType, id: record.id, status: 'inactive' }).unwrap()
          .then(() => adminActions.notify('Reason deactivated'))
        break
      case 'delete':
        setDeleteRecord(record)
        break
    }
  }

  return (
    <>
      <div className="mb-4 flex justify-end">
        <Button type="primary" icon={<Plus className="h-4 w-4" />} onClick={() => setCreateOpen(true)}>
          Add New Reason
        </Button>
      </div>
      <Table
        loading={loadingPassenger || loadingDriver}
        rowKey="id"
        dataSource={rows}
        scroll={{ x: 900 }}
        {...createTableRowProps<CancellationReasonRow>((record) =>
          openPolicyDrawer('Cancellation Reason', buildReasonDetailFields(record), adminActions),
        )}
        columns={[
          { title: 'Reason Name', dataIndex: 'name' },
          {
            title: 'User Type',
            dataIndex: 'userType',
            render: (userType: CancellationReasonRow['userType']) => getReasonUserTypeLabel(userType),
          },
          { title: 'Sort Order', dataIndex: 'sortOrder' },
          { title: 'Status', dataIndex: 'status', render: (s: string) => <StatusBadge status={s} /> },
          createActionsColumn<CancellationReasonRow>(
            (record) => getReasonActionItems(record),
            (key, record) => handleAction(key, record),
          ),
        ]}
      />

      <CreateReasonModal
        open={createOpen}
        confirmLoading={creating}
        onCancel={() => setCreateOpen(false)}
        onSubmit={async (values) => {
          await createReason({
            type: values.userType,
            name: values.name,
            sortOrder: values.sortOrder,
            status: values.active ? 'active' : 'inactive',
          }).unwrap()
          adminActions.notify('Cancellation reason created')
          setCreateOpen(false)
        }}
      />

      {editRecord && (
        <EditReasonModal
          open={Boolean(editRecord)}
          initialValues={{
            name: editRecord.name,
            userType: editRecord.userType,
            sortOrder: editRecord.sortOrder,
            active: editRecord.status === 'active',
          }}
          confirmLoading={updating}
          onCancel={() => setEditRecord(null)}
          onSubmit={async (values) => {
            await updateReason({
              type: editRecord.userType,
              id: editRecord.id,
              name: values.name,
              sortOrder: values.sortOrder,
              status: values.active ? 'active' : 'inactive',
            }).unwrap()
            adminActions.notify('Cancellation reason updated')
            setEditRecord(null)
          }}
        />
      )}

      <ConfirmationModal
        open={Boolean(deleteRecord)}
        title="Delete Cancellation Reason"
        description={`Are you sure you want to delete "${deleteRecord?.name}"? This action cannot be undone.`}
        confirmLabel="Delete"
        danger
        loading={deleting}
        onCancel={() => setDeleteRecord(null)}
        onConfirm={async () => {
          if (!deleteRecord) return
          await deleteReason({ type: deleteRecord.userType, id: deleteRecord.id }).unwrap()
          adminActions.notify('Cancellation reason deleted')
          setDeleteRecord(null)
        }}
      />

      <AdminActionHost actions={adminActions} />
    </>
  )
}
