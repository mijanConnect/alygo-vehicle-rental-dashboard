import { useCallback, useState } from 'react'
import { Button, Table, Tag } from 'antd'
import { Plus } from 'lucide-react'
import {
  AdminActionHost,
  ConfirmationModal,
  createActionsColumn,
  createTableRowProps,
} from '@/components/admin'
import { StatusBadge } from '@/components/common/StatusBadge'
import { Pagination } from '@/components/shared/Pagination'
import { SearchingInput } from '@/components/shared/SearchingInput'
import { useAdminActions } from '@/hooks/useAdminActions'
import {
  useCreateCancellationReasonMutation,
  useDeleteCancellationReasonMutation,
  useGetCancellationReasonsQuery,
  useUpdateCancellationReasonMutation,
  useUpdateCancellationReasonStatusMutation,
  type CancellationReasonRow,
} from '@/redux/api/cancellationApiReason'
import {
  buildReasonDetailFields,
  getReasonActionItems,
  getReasonUserTypeLabel,
  openPolicyDrawer,
} from '@/features/cancellations/cancellationHelpers'
import {
  CreateReasonModal,
  EditReasonModal,
} from '@/features/cancellations/components/ReasonFormModal'

export function CancellationReasonTable() {
  const adminActions = useAdminActions()

  const [page, setPage] = useState(1)
  const [limit, setLimit] = useState(10)
  const [searchTerm, setSearchTerm] = useState('')

  const [createOpen, setCreateOpen] = useState(false)
  const [editRecord, setEditRecord] = useState<CancellationReasonRow | null>(null)
  const [deleteRecord, setDeleteRecord] = useState<CancellationReasonRow | null>(null)

  const { data, isLoading, isFetching } = useGetCancellationReasonsQuery({
    page,
    limit,
    searchTerm,
  })

  const [createReason, { isLoading: creating }] = useCreateCancellationReasonMutation()
  const [updateReason, { isLoading: updating }] = useUpdateCancellationReasonMutation()
  const [updateStatus] = useUpdateCancellationReasonStatusMutation()
  const [deleteReason, { isLoading: deleting }] = useDeleteCancellationReasonMutation()

  const rows = data?.data ?? []
  const meta = data?.meta
  const totalPages = meta?.totalPages ?? 1
  const totalItems = meta?.totalItems ?? 0

  const handleSearchChange = useCallback((value: string) => {
    setSearchTerm(value)
    setPage(1)
  }, [])

  const handleItemsPerPageChange = (nextLimit: number) => {
    setLimit(nextLimit)
    setPage(1)
  }

  const handleAction = (key: string, record: CancellationReasonRow) => {
    switch (key) {
      case 'view':
        openPolicyDrawer('Cancellation Reason', buildReasonDetailFields(record), adminActions)
        break
      case 'edit':
        setEditRecord(record)
        break
      case 'activate':
        updateStatus({ id: record.id, status: 'active' })
          .unwrap()
          .then(() => adminActions.notify('Reason activated'))
          .catch(() => adminActions.notify('Unable to activate reason'))
        break
      case 'deactivate':
        updateStatus({ id: record.id, status: 'inactive' })
          .unwrap()
          .then(() => adminActions.notify('Reason deactivated'))
          .catch(() => adminActions.notify('Unable to deactivate reason'))
        break
      case 'delete':
        setDeleteRecord(record)
        break
    }
  }

  return (
    <>
      <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <SearchingInput
          value={searchTerm}
          onChange={handleSearchChange}
          placeholder="Search cancellation reasons..."
        />
        <Button type="primary" icon={<Plus className="h-4 w-4" />} onClick={() => setCreateOpen(true)}>
          Add New Reason
        </Button>
      </div>

      <Table
        loading={isLoading || isFetching}
        rowKey="id"
        dataSource={rows}
        pagination={false}
        scroll={{ x: 900 }}
        {...createTableRowProps<CancellationReasonRow>((record) =>
          openPolicyDrawer('Cancellation Reason', buildReasonDetailFields(record), adminActions),
        )}
        columns={[
          { title: 'Reason Name', dataIndex: 'name' },
          {
            title: 'Description',
            dataIndex: 'description',
            ellipsis: true,
          },
          {
            title: 'User Type',
            dataIndex: 'userType',
            render: (userType: CancellationReasonRow['userType']) => (
              <Tag>{getReasonUserTypeLabel(userType)}</Tag>
            ),
          },
          {
            title: 'Status',
            dataIndex: 'status',
            render: (s: string) => <StatusBadge status={s} />,
          },
          createActionsColumn<CancellationReasonRow>(
            (record) => getReasonActionItems(record),
            (key, record) => handleAction(key, record),
          ),
        ]}
      />

      <Pagination
        currentPage={page}
        totalPages={Math.max(totalPages, 1)}
        totalItems={totalItems}
        itemsPerPage={limit}
        onPageChange={setPage}
        onItemsPerPageChange={handleItemsPerPageChange}
      />

      <CreateReasonModal
        open={createOpen}
        confirmLoading={creating}
        onCancel={() => setCreateOpen(false)}
        onSubmit={async (values) => {
          try {
            await createReason({
              reasonName: values.name,
              description: values.description,
              userType: values.userType,
            }).unwrap()
            adminActions.notify('Cancellation reason created')
            setCreateOpen(false)
          } catch {
            adminActions.notify('Unable to create reason')
          }
        }}
      />

      {editRecord && (
        <EditReasonModal
          open={Boolean(editRecord)}
          initialValues={{
            name: editRecord.name,
            description: editRecord.description,
            userType: editRecord.userType,
          }}
          confirmLoading={updating}
          onCancel={() => setEditRecord(null)}
          onSubmit={async (values) => {
            try {
              await updateReason({
                id: editRecord.id,
                reasonName: values.name,
                description: values.description,
                userType: values.userType,
              }).unwrap()
              adminActions.notify('Cancellation reason updated')
              setEditRecord(null)
            } catch {
              adminActions.notify('Unable to update reason')
            }
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
          try {
            await deleteReason(deleteRecord.id).unwrap()
            adminActions.notify('Cancellation reason deleted')
            setDeleteRecord(null)
          } catch {
            adminActions.notify('Unable to delete reason')
          }
        }}
      />

      <AdminActionHost actions={adminActions} />
    </>
  )
}
