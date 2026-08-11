import { useState } from 'react'
import { Button, Table } from 'antd'
import { Plus } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import {
  AdminActionHost,
  ConfirmationModal,
  createActionsColumn,
} from '@/components/admin'
import { StatusBadge } from '@/components/common/StatusBadge'
import { Pagination } from '@/components/shared/Pagination'
import { SearchingInput } from '@/components/shared/SearchingInput'
import { TierCreateWizard } from '@/features/driver-rewards/components/TierCreateWizard'
import { TierOverviewPanel } from '@/features/driver-rewards/components/TierOverviewPanel'
import {
  apiBenefitsToRules,
  buildTierWritePayload,
  countApiBenefitRules,
} from '@/features/driver-rewards/mapTierManagement'
import { getTierManagementActionItems } from '@/features/driver-rewards/tierManagementHelpers'
import { useAdminActions } from '@/hooks/useAdminActions'
import {
  useCreateTierMutation,
  useDeleteTierMutation,
  useGetTiersListQuery,
  useUpdateTierStatusMutation,
} from '@/redux/api/tiersManagementsApi'
import type { TierItem } from '@/redux/api/tiersManagementsApi'
import type { TierFormValues } from '@/types/tierManagement'

export function TierOverviewTab() {
  return <TierOverviewPanel />
}

export function TierConfigurationTab() {
  const navigate = useNavigate()
  const adminActions = useAdminActions()
  const [page, setPage] = useState(1)
  const [limit, setLimit] = useState(10)
  const [searchTerm, setSearchTerm] = useState('')
  const [wizardOpen, setWizardOpen] = useState(false)
  const [deleteRecord, setDeleteRecord] = useState<TierItem | null>(null)

  const { data, isLoading, isFetching } = useGetTiersListQuery({ page, limit, searchTerm })
  const [createTier, { isLoading: creating }] = useCreateTierMutation()
  const [deleteTier, { isLoading: deleting }] = useDeleteTierMutation()
  const [updateTierStatus, { isLoading: updatingStatus }] = useUpdateTierStatusMutation()

  const tiers = data?.data ?? []
  const meta = data?.meta
  const nextLevel = (meta?.totalItems ?? tiers.length) + 1

  const handleAction = async (key: string, record: TierItem) => {
    switch (key) {
      case 'view':
      case 'edit':
        navigate(`/drivers/tiers/${record._id}`)
        break
      case 'activate':
      case 'deactivate': {
        const status = key === 'activate' ? 'active' : 'inactive'
        try {
          await updateTierStatus({ id: record._id, status }).unwrap()
          adminActions.notify(
            status === 'active' ? 'Tier activated' : 'Tier deactivated',
            record.name,
          )
        } catch (err) {
          adminActions.notify('Unable to update status', String(err))
        }
        break
      }
      case 'delete':
        setDeleteRecord(record)
        break
    }
  }

  const handleCreate = async (values: TierFormValues) => {
    try {
      const created = await createTier(buildTierWritePayload(values)).unwrap()
      if (values.status === 'inactive' && created._id) {
        await updateTierStatus({ id: created._id, status: 'inactive' }).unwrap()
      }
      adminActions.notify('Tier created', values.name)
      setWizardOpen(false)
    } catch (err) {
      adminActions.notify('Unable to create tier', String(err))
    }
  }

  return (
    <>
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <SearchingInput
          value={searchTerm}
          onChange={(value) => {
            setSearchTerm(value)
            setPage(1)
          }}
          placeholder="Search tiers..."
        />
        <Button
          type="primary"
          icon={<Plus className="h-4 w-4" />}
          onClick={() => setWizardOpen(true)}
        >
          Create Tier
        </Button>
      </div>
      <Table
        loading={isLoading || isFetching || creating || deleting || updatingStatus}
        rowKey="_id"
        dataSource={[...tiers].sort((a, b) => a.level - b.level)}
        pagination={false}
        scroll={{ x: 1100 }}
        columns={[
          {
            title: 'Tier Name',
            dataIndex: 'name',
            render: (name: string, record: TierItem) => (
              <button
                type="button"
                className="inline-flex items-center gap-2 text-left text-white hover:text-alygo-primary"
                onClick={() => navigate(`/drivers/tiers/${record._id}`)}
              >
                <span className="inline-flex h-6 w-6 items-center justify-center rounded-md bg-alygo-primary/20 text-xs font-semibold text-alygo-primary">
                  {(record.code || name).slice(0, 2).toUpperCase()}
                </span>
                {name}
              </button>
            ),
          },
          { title: 'Code', dataIndex: 'code', width: 100 },
          { title: 'Level', dataIndex: 'level', width: 80 },
          {
            title: 'Points',
            render: (_: unknown, record: TierItem) => record.requirements?.pointsRequired ?? 0,
          },
          {
            title: 'Trips Required',
            render: (_: unknown, record: TierItem) => record.requirements?.tripsRequired ?? 0,
          },
          {
            title: 'Rating Required',
            render: (_: unknown, record: TierItem) => record.requirements?.ratingRequired ?? 0,
          },
          {
            title: 'Acceptance Rate',
            render: (_: unknown, record: TierItem) =>
              `${record.requirements?.acceptanceRateRequired ?? 0}%`,
          },
          {
            title: 'Active Benefits',
            render: (_: unknown, record: TierItem) =>
              countApiBenefitRules(apiBenefitsToRules(record.benefits)),
          },
          { title: 'Status', dataIndex: 'status', render: (s: string) => <StatusBadge status={s} /> },
          createActionsColumn<TierItem>(
            (record) => getTierManagementActionItems(record),
            (key, record) => {
              void handleAction(key, record)
            },
          ),
        ]}
      />

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

      <TierCreateWizard
        open={wizardOpen}
        nextLevel={nextLevel}
        loading={creating || updatingStatus}
        onCancel={() => setWizardOpen(false)}
        onSubmit={handleCreate}
      />
      <ConfirmationModal
        open={Boolean(deleteRecord)}
        title="Delete Tier"
        description={`Delete tier "${deleteRecord?.name}"? This cannot be undone.`}
        confirmLabel="Delete"
        danger
        loading={deleting}
        onCancel={() => setDeleteRecord(null)}
        onConfirm={async () => {
          if (!deleteRecord) return
          try {
            await deleteTier(deleteRecord._id).unwrap()
            adminActions.notify('Tier deleted', deleteRecord.name)
            setDeleteRecord(null)
          } catch (err) {
            adminActions.notify('Unable to delete tier', String(err))
          }
        }}
      />
      <AdminActionHost actions={adminActions} />
    </>
  )
}
