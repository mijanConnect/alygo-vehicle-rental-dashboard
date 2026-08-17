import { useState } from 'react'
import { Button, Table, Tag } from 'antd'
import { Plus } from 'lucide-react'
import {
  AdminActionHost,
  ConfirmationModal,
  createActionsColumn,
} from '@/components/admin'
import { PageShell } from '@/components/common/PageShell'
import { Filtering } from '@/components/shared/Filtering'
import { Pagination } from '@/components/shared/Pagination'
import { SearchingInput } from '@/components/shared/SearchingInput'
import {
  AI_SUPPORT_STATUS_OPTIONS,
  AI_SUPPORT_VISIBILITY_OPTIONS,
  getAiSupportActionItems,
  getAiSupportCategoryLabel,
  getAiSupportStatusColor,
  getAiSupportStatusLabel,
} from '@/features/ai-support/aiSupportHelpers'
import { AiSupportFormModal } from '@/features/ai-support/components/AiSupportFormModal'
import { AiSupportOverviewCards } from '@/features/ai-support/components/AiSupportOverviewCards'
import { useAdminActions } from '@/hooks/useAdminActions'
import { useDocumentTitle } from '@/hooks/useDocumentTitle'
import {
  useCreateAiSupportMutation,
  useDeleteAiSupportMutation,
  useGetAiSupportListQuery,
  useUpdateAiSupportMutation,
  type AiSupportItem,
  type AiSupportWritePayload,
} from '@/redux/api/aiSupportApi'
import { formatDateTime } from '@/utils/format'

export default function AiSupportPage() {
  useDocumentTitle('AI Support')
  const adminActions = useAdminActions()

  const [page, setPage] = useState(1)
  const [limit, setLimit] = useState(10)
  const [searchTerm, setSearchTerm] = useState('')
  const [status, setStatus] = useState('')
  const [visibility, setVisibility] = useState('')
  const [formOpen, setFormOpen] = useState(false)
  const [editRecord, setEditRecord] = useState<AiSupportItem | null>(null)
  const [deleteRecord, setDeleteRecord] = useState<AiSupportItem | null>(null)

  const { data, isLoading, isFetching } = useGetAiSupportListQuery({
    page,
    limit,
    searchTerm,
    status: status || undefined,
    visibility: visibility || undefined,
  })

  const rows = data?.data ?? []
  const meta = data?.meta

  const [createArticle, { isLoading: creating }] = useCreateAiSupportMutation()
  const [updateArticle, { isLoading: updating }] = useUpdateAiSupportMutation()
  const [deleteArticle, { isLoading: deleting }] = useDeleteAiSupportMutation()

  const handleAction = (key: string, record: AiSupportItem) => {
    switch (key) {
      case 'edit':
        setEditRecord(record)
        break
      case 'delete':
        setDeleteRecord(record)
        break
    }
  }

  const handleCreate = async (payload: AiSupportWritePayload) => {
    try {
      await createArticle(payload).unwrap()
      adminActions.notify('Article created', payload.title)
      setFormOpen(false)
    } catch {
      adminActions.notify('Unable to create article', payload.title)
    }
  }

  const handleUpdate = async (payload: AiSupportWritePayload) => {
    if (!editRecord) return
    try {
      await updateArticle({ id: editRecord._id, body: payload }).unwrap()
      adminActions.notify('Article updated', payload.title)
      setEditRecord(null)
    } catch {
      adminActions.notify('Unable to update article', payload.title)
    }
  }

  const handleDelete = async () => {
    if (!deleteRecord) return
    try {
      await deleteArticle(deleteRecord._id).unwrap()
      adminActions.notify('Article deleted', deleteRecord.title)
      setDeleteRecord(null)
    } catch {
      adminActions.notify('Unable to delete article', deleteRecord.title)
    }
  }

  return (
    <PageShell
      title="AI Support"
      description="Manage knowledge base articles used by AI support for drivers and passengers."
      actions={
        <Button type="primary" icon={<Plus className="h-4 w-4" />} onClick={() => setFormOpen(true)}>
          Create Article
        </Button>
      }
    >
      <AiSupportOverviewCards />

      <div className="mb-4 flex flex-wrap items-center gap-3">
        <SearchingInput
          value={searchTerm}
          onChange={(value) => {
            setSearchTerm(value)
            setPage(1)
          }}
          placeholder="Search articles..."
        />
        <Filtering
          variant="inline"
          fields={[
            {
              key: 'status',
              placeholder: 'Filter by status',
              options: AI_SUPPORT_STATUS_OPTIONS,
              value: status,
              minWidth: 160,
              onChange: (value) => {
                setStatus(value)
                setPage(1)
              },
            },
            {
              key: 'visibility',
              placeholder: 'Filter by visibility',
              options: AI_SUPPORT_VISIBILITY_OPTIONS,
              value: visibility,
              minWidth: 170,
              onChange: (value) => {
                setVisibility(value)
                setPage(1)
              },
            },
          ]}
        />
      </div>

      <div className="glass-card p-4">
        <Table
          loading={isLoading || isFetching}
          rowKey="_id"
          dataSource={rows}
          pagination={false}
          scroll={{ x: 1200 }}
          locale={{ emptyText: 'No knowledge articles found' }}
          columns={[
            {
              title: 'Title',
              dataIndex: 'title',
              ellipsis: true,
            },
            {
              title: 'Module',
              dataIndex: 'module',
              width: 130,
            },
            {
              title: 'Category',
              dataIndex: 'category',
              width: 130,
              render: (value?: string) => getAiSupportCategoryLabel(value),
            },
            {
              title: 'Visibility',
              dataIndex: 'visibility',
              width: 110,
              render: (value: string) => value || '—',
            },
            {
              title: 'Priority',
              dataIndex: 'priority',
              width: 90,
            },
            {
              title: 'AI',
              dataIndex: 'aiEnabled',
              width: 90,
              render: (enabled: boolean) => (
                <Tag color={enabled ? 'success' : 'default'}>{enabled ? 'Enabled' : 'Off'}</Tag>
              ),
            },
            {
              title: 'Status',
              dataIndex: 'status',
              width: 120,
              render: (s: string) => (
                <Tag color={getAiSupportStatusColor(s)}>{getAiSupportStatusLabel(s)}</Tag>
              ),
            },
            {
              title: 'Updated',
              dataIndex: 'updatedAt',
              width: 170,
              render: (d?: string) => (d ? formatDateTime(d) : '—'),
            },
            createActionsColumn<AiSupportItem>(
              (record) => getAiSupportActionItems(record),
              (key, record) => handleAction(key, record),
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

      <AiSupportFormModal
        open={formOpen}
        mode="create"
        loading={creating}
        onCancel={() => setFormOpen(false)}
        onSubmit={handleCreate}
      />

      <AiSupportFormModal
        open={Boolean(editRecord)}
        mode="edit"
        initialValues={editRecord}
        loading={updating}
        onCancel={() => setEditRecord(null)}
        onSubmit={handleUpdate}
      />

      <ConfirmationModal
        open={Boolean(deleteRecord)}
        title="Delete Knowledge Article"
        description={`Delete "${deleteRecord?.title}"? This action cannot be undone.`}
        confirmLabel="Delete"
        danger
        loading={deleting}
        onCancel={() => setDeleteRecord(null)}
        onConfirm={handleDelete}
      />

      <AdminActionHost actions={adminActions} />
    </PageShell>
  )
}
