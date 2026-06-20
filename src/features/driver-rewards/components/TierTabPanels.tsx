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
import { TierCreateWizard } from '@/features/driver-rewards/components/TierCreateWizard'
import { TierOverviewPanel } from '@/features/driver-rewards/components/TierOverviewPanel'
import { getTierManagementActionItems } from '@/features/driver-rewards/tierManagementHelpers'
import { buildTierPayload } from '@/features/driver-rewards/utils/tierFormHelpers'
import { countActiveBenefitRules, parseBenefitRules } from '@/features/driver-rewards/utils/tierConfigHelpers'
import { useAdminActions } from '@/hooks/useAdminActions'
import {
  useCreateDriverLevelMutation,
  useDeleteDriverLevelMutation,
  useGetDriverLevelsQuery,
} from '@/services/driverRewardsApi'
import type { DriverLevel } from '@/types/driverRewards'
import type { TierFormValues } from '@/types/tierManagement'

export function TierOverviewTab() {
  return <TierOverviewPanel />
}

export function TierConfigurationTab() {
  const navigate = useNavigate()
  const adminActions = useAdminActions()
  const { data = [], isLoading } = useGetDriverLevelsQuery()
  const [wizardOpen, setWizardOpen] = useState(false)
  const [deleteRecord, setDeleteRecord] = useState<DriverLevel | null>(null)

  const [createLevel, { isLoading: creating }] = useCreateDriverLevelMutation()
  const [deleteLevel, { isLoading: deleting }] = useDeleteDriverLevelMutation()

  const nextLevel = data.length + 1

  const handleAction = (key: string, record: DriverLevel) => {
    switch (key) {
      case 'view':
      case 'edit':
        navigate(`/drivers/tiers/${record.id}`)
        break
      case 'delete':
        setDeleteRecord(record)
        break
    }
  }

  const handleCreate = async (values: TierFormValues) => {
    try {
      const payload = buildTierPayload(values, undefined, values.level)
      await createLevel(payload).unwrap()
      adminActions.notify('Tier created', values.label)
      setWizardOpen(false)
    } catch (err) {
      adminActions.notify('Unable to create tier', String(err))
    }
  }

  return (
    <>
      <div className="mb-4 flex justify-end">
        <Button
          type="primary"
          icon={<Plus className="h-4 w-4" />}
          onClick={() => setWizardOpen(true)}
        >
          Create Tier
        </Button>
      </div>
      <Table
        loading={isLoading || creating || deleting}
        rowKey="id"
        dataSource={[...data].sort((a, b) => a.sortOrder - b.sortOrder)}
        scroll={{ x: 1100 }}
        columns={[
          {
            title: 'Tier Name',
            dataIndex: 'label',
            render: (label: string, record: DriverLevel) => (
              <button
                type="button"
                className="inline-flex items-center gap-2 text-left text-white hover:text-alygo-primary"
                onClick={() => navigate(`/drivers/tiers/${record.id}`)}
              >
                <span
                  className="inline-flex h-6 w-6 items-center justify-center rounded-md text-xs font-semibold text-white"
                  style={{ backgroundColor: record.tierColor }}
                >
                  {record.tierBadge}
                </span>
                {label}
              </button>
            ),
          },
          { title: 'Level', dataIndex: 'level', width: 80 },
          { title: 'Driver Count', dataIndex: 'driverCount' },
          { title: 'Trips Required', dataIndex: 'requiredTrips' },
          { title: 'Rating Required', dataIndex: 'requiredRating' },
          {
            title: 'Acceptance Rate',
            dataIndex: 'requiredAcceptanceRate',
            render: (v: number) => `${v}%`,
          },
          {
            title: 'Active Benefits',
            render: (_: unknown, record: DriverLevel) =>
              countActiveBenefitRules(parseBenefitRules(record.benefits)),
          },
          { title: 'Status', dataIndex: 'status', render: (s: string) => <StatusBadge status={s} /> },
          createActionsColumn<DriverLevel>(
            () => getTierManagementActionItems(),
            (key, record) => handleAction(key, record),
          ),
        ]}
      />

      <TierCreateWizard
        open={wizardOpen}
        nextLevel={nextLevel}
        loading={creating}
        onCancel={() => setWizardOpen(false)}
        onSubmit={handleCreate}
      />
      <ConfirmationModal
        open={Boolean(deleteRecord)}
        title="Delete Tier"
        description={`Delete tier "${deleteRecord?.label}"? This cannot be undone.`}
        confirmLabel="Delete"
        danger
        loading={deleting}
        onCancel={() => setDeleteRecord(null)}
        onConfirm={async () => {
          if (!deleteRecord) return
          try {
            await deleteLevel(deleteRecord.id).unwrap()
            adminActions.notify('Tier deleted', deleteRecord.label)
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
