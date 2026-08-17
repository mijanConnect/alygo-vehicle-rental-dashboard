import { useState } from 'react'
import { Button, Image, Table, Tag } from 'antd'
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
  BANNER_STATUS_OPTIONS,
  getBannerActionItems,
  getBannerStatusColor,
  getBannerStatusLabel,
  resolveBannerImageUrl,
} from '@/features/banners/bannerHelpers'
import {
  BannerFormModal,
  type BannerFormValues,
} from '@/features/banners/components/BannerFormModal'
import { useAdminActions } from '@/hooks/useAdminActions'
import { useDocumentTitle } from '@/hooks/useDocumentTitle'
import {
  useCreateBannerMutation,
  useDeleteBannerMutation,
  useGetBannerListQuery,
  useUpdateBannerMutation,
  useUpdateBannerStatusMutation,
  type BannerItem,
  type BannerStatus,
} from '@/redux/api/bannerManageApi'
import { formatDateTime } from '@/utils/format'

export default function BannerManagementPage() {
  useDocumentTitle('Banner Management')
  const adminActions = useAdminActions()

  const [page, setPage] = useState(1)
  const [limit, setLimit] = useState(10)
  const [searchTerm, setSearchTerm] = useState('')
  const [status, setStatus] = useState('')
  const [formOpen, setFormOpen] = useState(false)
  const [editRecord, setEditRecord] = useState<BannerItem | null>(null)
  const [deleteRecord, setDeleteRecord] = useState<BannerItem | null>(null)

  const { data, isLoading, isFetching } = useGetBannerListQuery({
    page,
    limit,
    searchTerm,
    status: status || undefined,
  })

  const rows = data?.data ?? []
  const meta = data?.meta

  const [createBanner, { isLoading: creating }] = useCreateBannerMutation()
  const [updateBanner, { isLoading: updating }] = useUpdateBannerMutation()
  const [deleteBanner, { isLoading: deleting }] = useDeleteBannerMutation()
  const [updateStatus, { isLoading: updatingStatus }] = useUpdateBannerStatusMutation()

  const handleAction = async (key: string, record: BannerItem) => {
    switch (key) {
      case 'edit':
        setEditRecord(record)
        break
      case 'toggle': {
        const nextActive = record.status !== 'active'
        try {
          await updateStatus({ id: record._id, status: nextActive }).unwrap()
          adminActions.notify(
            nextActive ? 'Banner activated' : 'Banner deactivated',
            record.name,
          )
        } catch (err) {
          adminActions.notify('Unable to update banner status', String(err))
        }
        break
      }
      case 'delete':
        setDeleteRecord(record)
        break
    }
  }

  const handleCreate = async (values: BannerFormValues) => {
    try {
      await createBanner({
        name: values.name,
        description: values.description,
        image: values.image,
      }).unwrap()
      adminActions.notify('Banner created', values.name)
      setFormOpen(false)
    } catch (err) {
      adminActions.notify('Unable to create banner', String(err))
    }
  }

  const handleUpdate = async (values: BannerFormValues) => {
    if (!editRecord) return
    try {
      await updateBanner({
        id: editRecord._id,
        body: {
          name: values.name,
          description: values.description,
          image: values.image,
        },
      }).unwrap()
      adminActions.notify('Banner updated', editRecord.name)
      setEditRecord(null)
    } catch (err) {
      adminActions.notify('Unable to update banner', String(err))
    }
  }

  const handleDelete = async () => {
    if (!deleteRecord) return
    try {
      await deleteBanner(deleteRecord._id).unwrap()
      adminActions.notify('Banner deleted', deleteRecord.name)
      setDeleteRecord(null)
    } catch (err) {
      adminActions.notify('Unable to delete banner', String(err))
    }
  }

  return (
    <PageShell
      title="Banner Management"
      description="Create, update, and manage promotional banners shown in the app."
      actions={
        <Button type="primary" icon={<Plus className="h-4 w-4" />} onClick={() => setFormOpen(true)}>
          Create Banner
        </Button>
      }
    >
      <div className="mb-4 flex flex-wrap items-center gap-3">
        <SearchingInput
          value={searchTerm}
          onChange={(value) => {
            setSearchTerm(value)
            setPage(1)
          }}
          placeholder="Search banners..."
        />
        <Filtering
          variant="inline"
          fields={[
            {
              key: 'status',
              placeholder: 'Filter by status',
              options: BANNER_STATUS_OPTIONS,
              value: status,
              minWidth: 160,
              onChange: (value) => {
                setStatus(value)
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
          scroll={{ x: 1000 }}
          columns={[
            {
              title: 'Image',
              dataIndex: 'image',
              width: 100,
              render: (path: string) => {
                const src = resolveBannerImageUrl(path)
                return src ? (
                  <Image
                    src={src}
                    alt="Banner"
                    width={64}
                    height={40}
                    className="rounded object-cover"
                    preview={{ mask: 'View' }}
                  />
                ) : (
                  '—'
                )
              },
            },
            { title: 'Name', dataIndex: 'name' },
            {
              title: 'Description',
              dataIndex: 'description',
              ellipsis: true,
            },
            {
              title: 'Status',
              dataIndex: 'status',
              render: (s: BannerStatus) => (
                <Tag color={getBannerStatusColor(s)}>{getBannerStatusLabel(s)}</Tag>
              ),
            },
            {
              title: 'Created At',
              dataIndex: 'createdAt',
              render: (d: string) => (d ? formatDateTime(d) : '—'),
            },
            createActionsColumn<BannerItem>(
              (record) => getBannerActionItems(record),
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

      <BannerFormModal
        open={formOpen}
        mode="create"
        loading={creating}
        onCancel={() => setFormOpen(false)}
        onSubmit={handleCreate}
      />

      <BannerFormModal
        open={Boolean(editRecord)}
        mode="edit"
        initialValues={editRecord}
        loading={updating}
        onCancel={() => setEditRecord(null)}
        onSubmit={handleUpdate}
      />

      <ConfirmationModal
        open={Boolean(deleteRecord)}
        title="Delete Banner"
        description="Are you sure you want to delete this banner? This action cannot be undone."
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
