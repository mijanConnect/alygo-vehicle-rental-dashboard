import { useState } from 'react'
import { Button, Table } from 'antd'
import {
  AdminActionHost,
  createActionsColumn,
  createTableRowProps,
} from '@/components/admin'
import { StatusBadge } from '@/components/common/StatusBadge'
import { useAdminActions } from '@/hooks/useAdminActions'
import {
  useCreateDriverLevelMutation,
  useDuplicateDriverLevelMutation,
  useGetDriverLevelsQuery,
  useUpdateDriverLevelMutation,
} from '@/services/driverRewardsApi'
import type { DriverLevel } from '@/types/driverRewards'
import {
  buildLevelDetailFields,
  getTierActionItems,
  openRewardsDrawer,
  summarizeTierBenefits,
  summarizeTierRequirements,
} from '@/features/driver-rewards/driverRewardsHelpers'
import { TierFormDrawer } from '@/features/driver-rewards/components/TierFormDrawer'
import { useDriverRewardsPermissions } from '@/features/driver-rewards/hooks/useDriverRewardsPermissions'

export function TierManagementTable() {
  const adminActions = useAdminActions()
  const { canManage } = useDriverRewardsPermissions()
  const { data = [], isLoading } = useGetDriverLevelsQuery()
  const [editRecord, setEditRecord] = useState<DriverLevel | null>(null)
  const [createOpen, setCreateOpen] = useState(false)
  const [updateLevel, { isLoading: updating }] = useUpdateDriverLevelMutation()
  const [createLevel, { isLoading: creating }] = useCreateDriverLevelMutation()
  const [duplicateLevel] = useDuplicateDriverLevelMutation()

  const handleAction = (key: string, record: DriverLevel) => {
    if (!canManage) return
    switch (key) {
      case 'view':
        openRewardsDrawer('Driver Tier', buildLevelDetailFields(record), adminActions)
        break
      case 'edit':
        setEditRecord(record)
        break
      case 'duplicate':
        duplicateLevel(record.id).unwrap().then(() => adminActions.notify('Tier duplicated'))
        break
      case 'activate':
        updateLevel({ id: record.id, status: 'active' }).unwrap()
          .then(() => adminActions.notify('Tier activated'))
        break
      case 'deactivate':
        updateLevel({ id: record.id, status: 'inactive' }).unwrap()
          .then(() => adminActions.notify('Tier deactivated'))
        break
    }
  }

  return (
    <>
      {canManage && (
        <div className="mb-4 flex justify-end">
          <Button type="primary" onClick={() => setCreateOpen(true)}>Create Tier</Button>
        </div>
      )}

      <Table
        loading={isLoading}
        rowKey="id"
        dataSource={[...data].sort((a, b) => a.sortOrder - b.sortOrder)}
        scroll={{ x: 1400 }}
        {...createTableRowProps<DriverLevel>((record) =>
          openRewardsDrawer('Driver Tier', buildLevelDetailFields(record), adminActions),
        )}
        columns={[
          {
            title: 'Tier',
            dataIndex: 'label',
            render: (label: string, record: DriverLevel) => (
              <span className="inline-flex items-center gap-2">
                <span
                  className="inline-flex h-6 w-6 items-center justify-center rounded-md text-xs font-semibold text-white"
                  style={{ backgroundColor: record.tierColor }}
                >
                  {record.tierBadge}
                </span>
                {label}
              </span>
            ),
          },
          { title: 'Level', dataIndex: 'level', width: 80 },
          { title: 'Driver Count', dataIndex: 'driverCount' },
          {
            title: 'Requirements',
            render: (_: unknown, record: DriverLevel) => summarizeTierRequirements(record),
            ellipsis: true,
          },
          {
            title: 'Benefits',
            render: (_: unknown, record: DriverLevel) => summarizeTierBenefits(record),
            ellipsis: true,
          },
          { title: 'Status', dataIndex: 'status', render: (s: string) => <StatusBadge status={s} /> },
          ...(canManage
            ? [
                createActionsColumn<DriverLevel>(
                  (record) => getTierActionItems(record),
                  (key, record) => handleAction(key, record),
                ),
              ]
            : []),
        ]}
      />

      {createOpen && (
        <TierFormDrawer
          open
          title="Create Tier"
          confirmLoading={creating}
          onClose={() => setCreateOpen(false)}
          onSubmit={async (values) => {
            await createLevel({
              ...values,
              slug: values.name.replace(/_/g, '-'),
              level: data.length + 1,
              sortOrder: data.length + 1,
              icon: 'award',
              requirements: values.requirements,
              benefits: values.benefits,
            }).unwrap()
            adminActions.notify('Tier created')
            setCreateOpen(false)
          }}
        />
      )}

      {editRecord && (
        <TierFormDrawer
          open
          title={`Edit Tier — ${editRecord.label}`}
          initialValues={editRecord}
          confirmLoading={updating}
          onClose={() => setEditRecord(null)}
          onSubmit={async (values) => {
            await updateLevel({ id: editRecord.id, ...values }).unwrap()
            adminActions.notify('Tier updated')
            setEditRecord(null)
          }}
        />
      )}

      <AdminActionHost actions={adminActions} />
    </>
  )
}

export const LevelManagementTable = TierManagementTable
