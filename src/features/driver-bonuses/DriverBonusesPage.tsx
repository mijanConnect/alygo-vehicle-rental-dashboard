import { useState } from 'react'
import { Button, Table, Tag, Progress, Space } from 'antd'
import { Plus } from 'lucide-react'
import {
  AdminActionHost,
  ConfirmationModal,
  createActionsColumn,
  getGenericActionItems,
} from '@/components/admin'
import { PageShell } from '@/components/common/PageShell'
import { TableFilters } from '@/components/common/TableFilters'
import { KpiCard } from '@/components/dashboard/KpiCard'
import { BonusCampaignFormModal } from '@/features/driver-bonuses/components/BonusCampaignFormModal'
import { useAdminActions } from '@/hooks/useAdminActions'
import { useDocumentTitle } from '@/hooks/useDocumentTitle'
import {
  useGetBonusCampaignsQuery,
  useCreateBonusCampaignMutation,
  useUpdateBonusCampaignMutation,
  useDeleteBonusCampaignMutation,
  useToggleBonusCampaignStatusMutation,
} from '@/services/driverBonusApi'
import type { BonusCampaign, BonusCampaignFormValues } from '@/types/driverBonus'
import { formatCurrency, formatDateTime } from '@/utils/format'

const STATUS_OPTIONS = [
  { value: 'active', label: 'Active', color: 'success' },
  { value: 'scheduled', label: 'Scheduled', color: 'processing' },
  { value: 'disabled', label: 'Disabled', color: 'default' },
  { value: 'completed', label: 'Completed', color: 'success' },
]

function getStatusColor(status: string) {
  return STATUS_OPTIONS.find((o) => o.value === status)?.color || 'default'
}

export default function DriverBonusesPage() {
  useDocumentTitle('Driver Bonuses')
  const adminActions = useAdminActions()

  const [page, setPage] = useState(1)
  const [search, setSearch] = useState('')
  const [status, setStatus] = useState('')
  
  const [formOpen, setFormOpen] = useState(false)
  const [editRecord, setEditRecord] = useState<BonusCampaign | null>(null)
  const [deleteRecord, setDeleteRecord] = useState<BonusCampaign | null>(null)

  const { data, isLoading } = useGetBonusCampaignsQuery({
    page,
    pageSize: 10,
    search,
    status,
  })

  const [createCampaign, { isLoading: creating }] = useCreateBonusCampaignMutation()
  const [updateCampaign, { isLoading: updating }] = useUpdateBonusCampaignMutation()
  const [deleteCampaign, { isLoading: deleting }] = useDeleteBonusCampaignMutation()
  const [toggleStatus, { isLoading: toggling }] = useToggleBonusCampaignStatusMutation()

  const handleAction = async (key: string, record: BonusCampaign) => {
    switch (key) {
      case 'edit':
        setEditRecord(record)
        break
      case 'toggle':
        try {
          await toggleStatus(record.id).unwrap()
          adminActions.notify(
            record.status === 'active' || record.status === 'scheduled' ? 'Campaign disabled' : 'Campaign activated',
            record.name
          )
        } catch (err) {
          adminActions.notify('Unable to update campaign status', String(err))
        }
        break
      case 'delete':
        setDeleteRecord(record)
        break
    }
  }

  const handleCreate = async (values: BonusCampaignFormValues) => {
    try {
      await createCampaign(values).unwrap()
      adminActions.notify('Campaign created', values.name)
      setFormOpen(false)
    } catch (err) {
      adminActions.notify('Unable to create campaign', String(err))
    }
  }

  const handleUpdate = async (values: BonusCampaignFormValues) => {
    if (!editRecord) return
    try {
      await updateCampaign({ id: editRecord.id, ...values }).unwrap()
      adminActions.notify('Campaign updated', editRecord.name)
      setEditRecord(null)
    } catch (err) {
      adminActions.notify('Unable to update campaign', String(err))
    }
  }

  const handleDelete = async () => {
    if (!deleteRecord) return
    try {
      await deleteCampaign(deleteRecord.id).unwrap()
      adminActions.notify('Campaign deleted', deleteRecord.name)
      setDeleteRecord(null)
    } catch (err) {
      adminActions.notify('Unable to delete campaign', String(err))
    }
  }

  const totalActive = data?.data.filter(c => c.status === 'active').length || 0
  const totalBudget = data?.data.reduce((acc, curr) => acc + curr.budgetLimit, 0) || 0
  const totalSpent = data?.data.reduce((acc, curr) => acc + curr.budgetUsed, 0) || 0

  return (
    <PageShell
      title="Driver Bonus & Incentive Center"
      description="Manage temporary cash bonus campaigns to incentivize drivers independently from surge pricing."
      actions={
        <Button type="primary" icon={<Plus className="h-4 w-4" />} onClick={() => setFormOpen(true)}>
          Create Campaign
        </Button>
      }
    >
      <div className="mb-6 grid grid-cols-1 gap-4 sm:grid-cols-3">
        <KpiCard metric={{ key: 'active', label: 'Active Campaigns', value: totalActive, format: 'number', change: 0, icon: 'activity' }} liveValue={totalActive} />
        <KpiCard metric={{ key: 'budget', label: 'Total Budget Allocated', value: totalBudget, format: 'currency', change: 0, icon: 'wallet' }} liveValue={totalBudget} />
        <KpiCard metric={{ key: 'spent', label: 'Total Budget Spent', value: totalSpent, format: 'currency', change: 5.2, icon: 'trending-up' }} liveValue={totalSpent} />
      </div>

      <TableFilters
        search={search}
        onSearchChange={(value) => {
          setSearch(value)
          setPage(1)
        }}
        searchPlaceholder="Search campaigns..."
        statusOptions={STATUS_OPTIONS.map((s) => ({ value: s.value, label: s.label }))}
        status={status}
        onStatusChange={(value) => {
          setStatus(value ?? '')
          setPage(1)
        }}
      />

      <div className="glass-card p-4">
        <Table
          loading={isLoading || toggling}
          rowKey="id"
          dataSource={data?.data ?? []}
          scroll={{ x: 1200 }}
          pagination={{
            current: page,
            total: data?.total ?? 0,
            pageSize: 10,
            onChange: setPage,
            showSizeChanger: false,
          }}
          columns={[
            {
              title: 'Campaign',
              dataIndex: 'name',
              render: (name: string, record: BonusCampaign) => (
                <Space direction="vertical" size={0}>
                  <span className="font-medium">{name}</span>
                  <span className="text-xs text-alygo-text-muted uppercase">{record.type.replace('_', ' ')}</span>
                </Space>
              ),
            },
            {
              title: 'Location / Eligibility',
              render: (_: any, record: BonusCampaign) => (
                <Space direction="vertical" size={0}>
                  <span>{record.location}</span>
                  <span className="text-xs text-alygo-text-muted">
                    {record.tierEligibility.length} Tiers, {record.rideCategoryEligibility.length} Categories
                  </span>
                </Space>
              ),
            },
            {
              title: 'Amount',
              dataIndex: 'amount',
              render: (amount: number) => <span className="font-semibold text-green-500">{formatCurrency(amount)}</span>,
            },
            {
              title: 'Active Period',
              render: (_: any, record: BonusCampaign) => (
                <Space direction="vertical" size={0}>
                  <span className="text-xs">{formatDateTime(record.startDate)}</span>
                  <span className="text-xs text-alygo-text-muted">to {formatDateTime(record.endDate)}</span>
                </Space>
              ),
            },
            {
              title: 'Budget Usage',
              render: (_: any, record: BonusCampaign) => {
                const percent = Math.round((record.budgetUsed / record.budgetLimit) * 100) || 0
                return (
                  <div className="w-32">
                    <Progress percent={percent} size="small" status={percent >= 100 ? 'exception' : 'active'} />
                    <div className="text-xs text-alygo-text-muted mt-1">
                      {formatCurrency(record.budgetUsed)} / {formatCurrency(record.budgetLimit)}
                    </div>
                  </div>
                )
              },
            },
            {
              title: 'Status',
              dataIndex: 'status',
              render: (s: string) => (
                <Tag color={getStatusColor(s)} className="uppercase">{s}</Tag>
              ),
            },
            createActionsColumn<BonusCampaign>(
              () => {
                return getGenericActionItems({
                  edit: true,
                  remove: true,
                })
              },
              (key, record) => void handleAction(key, record),
            ),
          ]}
        />
      </div>

      <BonusCampaignFormModal
        open={formOpen}
        mode="create"
        loading={creating}
        onCancel={() => setFormOpen(false)}
        onSubmit={handleCreate}
      />

      <BonusCampaignFormModal
        open={Boolean(editRecord)}
        mode="edit"
        initialValues={editRecord}
        loading={updating}
        onCancel={() => setEditRecord(null)}
        onSubmit={handleUpdate}
      />

      <ConfirmationModal
        open={Boolean(deleteRecord)}
        title="Delete Campaign"
        description="Are you sure you want to delete this campaign? This action cannot be undone."
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
