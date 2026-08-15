import { useState } from 'react'
import { Table, Tag } from 'antd'
import {
  AdminActionHost,
  ConfirmationModal,
  createActionsColumn,
} from '@/components/admin'
import { PageShell } from '@/components/common/PageShell'
import { Filtering } from '@/components/shared/Filtering'
import { Pagination } from '@/components/shared/Pagination'
import { SearchingInput } from '@/components/shared/SearchingInput'
import { SupportDetailsDrawer } from '@/features/help-supports/components/SupportDetailsDrawer'
import {
  SUPPORT_PRIORITY_OPTIONS,
  SUPPORT_STATUS_OPTIONS,
  getSupportActionItems,
  getSupportPriorityColor,
  getSupportStatusColor,
  getSupportStatusLabel,
  isSupportResolved,
} from '@/features/help-supports/helpSupportHelpers'
import { useAdminActions } from '@/hooks/useAdminActions'
import { useDocumentTitle } from '@/hooks/useDocumentTitle'
import {
  useDeleteHelpAndSupportMutation,
  useGetHelpAndSupportsListQuery,
  useUpdateHelpAndSupportStatusMutation,
  type HelpAndSupportsItem,
} from '@/redux/api/heplAndSupportsApi'
import { formatDateTime } from '@/utils/format'

export default function HelpSupportsPage() {
  useDocumentTitle('Help & Supports')
  const adminActions = useAdminActions()

  const [page, setPage] = useState(1)
  const [limit, setLimit] = useState(10)
  const [searchTerm, setSearchTerm] = useState('')
  const [priority, setPriority] = useState('')
  const [status, setStatus] = useState('')
  const [selected, setSelected] = useState<HelpAndSupportsItem | null>(null)
  const [deleteRecord, setDeleteRecord] = useState<HelpAndSupportsItem | null>(null)

  const { data, isLoading, isFetching } = useGetHelpAndSupportsListQuery({
    page,
    limit,
    searchTerm,
    priority: priority || undefined,
    status: status || undefined,
  })

  const [updateStatus, { isLoading: updatingStatus }] =
    useUpdateHelpAndSupportStatusMutation()
  const [deleteSupport, { isLoading: deleting }] = useDeleteHelpAndSupportMutation()

  const rows = data?.data ?? []
  const meta = data?.meta

  const handleAction = async (key: string, record: HelpAndSupportsItem) => {
    switch (key) {
      case 'details':
        setSelected(record)
        break
      case 'resolve': {
        try {
          await updateStatus({ id: record._id, status: 'RESOLVED' }).unwrap()
          adminActions.notify('Marked as resolved', record.subject)
        } catch {
          adminActions.notify('Unable to update status', record.subject)
        }
        break
      }
      case 'delete':
        setDeleteRecord(record)
        break
    }
  }

  const handleDelete = async () => {
    if (!deleteRecord) return
    try {
      await deleteSupport(deleteRecord._id).unwrap()
      adminActions.notify('Support ticket deleted', deleteRecord.subject)
      setDeleteRecord(null)
    } catch {
      adminActions.notify('Unable to delete ticket', deleteRecord.subject)
    }
  }

  return (
    <PageShell
      title="Help & Supports"
      description="Review user support requests and mark tickets as resolved."
    >
      <div className="mb-4 flex flex-wrap items-center gap-3">
        <SearchingInput
          value={searchTerm}
          onChange={(value) => {
            setSearchTerm(value)
            setPage(1)
          }}
          placeholder="Search by name, email, or subject..."
        />
        <Filtering
          variant="inline"
          fields={[
            {
              key: 'status',
              placeholder: 'Filter by status',
              options: SUPPORT_STATUS_OPTIONS,
              value: status,
              minWidth: 160,
              onChange: (value) => {
                setStatus(value)
                setPage(1)
              },
            },
            {
              key: 'priority',
              placeholder: 'Filter by priority',
              options: SUPPORT_PRIORITY_OPTIONS,
              value: priority,
              minWidth: 180,
              onChange: (value) => {
                setPriority(value)
                setPage(1)
              },
            },
          ]}
        />
      </div>

      <div className="glass-card p-4">
        <Table
          loading={isLoading || isFetching || updatingStatus}
          rowKey="_id"
          dataSource={rows}
          pagination={false}
          scroll={{ x: 1100 }}
          locale={{ emptyText: 'No support tickets found' }}
          columns={[
            {
              title: 'Name',
              dataIndex: 'name',
              width: 180,
            },
            {
              title: 'Email',
              dataIndex: 'email',
              ellipsis: true,
            },
            {
              title: 'Subject',
              dataIndex: 'subject',
              ellipsis: true,
            },
            {
              title: 'Priority',
              dataIndex: 'priority',
              width: 110,
              render: (p: string) => (
                <Tag color={getSupportPriorityColor(p)}>{p?.toUpperCase() || 'LOW'}</Tag>
              ),
            },
            {
              title: 'Status',
              dataIndex: 'status',
              width: 120,
              render: (s: string | undefined) => (
                <Tag color={getSupportStatusColor(s)}>{getSupportStatusLabel(s)}</Tag>
              ),
            },
            {
              title: 'Created',
              dataIndex: 'createdAt',
              width: 170,
              render: (d?: string) => (d ? formatDateTime(d) : '—'),
            },
            createActionsColumn<HelpAndSupportsItem>(
              (record) => getSupportActionItems(record),
              (key, record) => void handleAction(key, record),
            ),
          ]}
        />
      </div>

      <Pagination
        currentPage={meta?.page ?? page}
        totalPages={Math.max(meta?.totalPages ?? 1, 1)}
        totalItems={meta?.totalItems ?? 0}
        itemsPerPage={meta?.limit ?? limit}
        onPageChange={setPage}
        onItemsPerPageChange={(size) => {
          setLimit(size)
          setPage(1)
        }}
      />

      <SupportDetailsDrawer
        open={Boolean(selected)}
        record={selected}
        onClose={() => setSelected(null)}
      />

      <ConfirmationModal
        open={Boolean(deleteRecord)}
        title="Delete Support Ticket"
        description={
          deleteRecord
            ? `Delete "${deleteRecord.subject}"${
                isSupportResolved(deleteRecord.status) ? '' : ' (not resolved yet)'
              }?`
            : 'Delete this support ticket?'
        }
        confirmLabel="Delete"
        danger
        loading={deleting}
        onConfirm={handleDelete}
        onCancel={() => setDeleteRecord(null)}
      />

      <AdminActionHost actions={adminActions} />
    </PageShell>
  )
}
