import { useState } from 'react'
import { Form, Input, InputNumber, Modal, Table, Tag } from 'antd'
import {
  AdminActionHost,
  createActionsColumn,
  createTableRowProps,
} from '@/components/admin'
import { StatusBadge } from '@/components/common/StatusBadge'
import { useAdminActions } from '@/hooks/useAdminActions'
import {
  useAdjustDriverPointsMutation,
  useChangeDriverLevelMutation,
  useGetDriverPerformanceQuery,
  useResetDriverTierMutation,
  useSuspendDriverRewardsMutation,
} from '@/services/driverRewardsApi'
import type { DriverPerformanceRecord } from '@/types/driverRewards'
import {
  getDriverControlActionItems,
  levelLabel,
} from '@/features/driver-rewards/driverRewardsHelpers'
import { DriverProgressDrawer } from '@/features/driver-rewards/components/DriverProgressDrawer'
import { useDriverRewardsPermissions } from '@/features/driver-rewards/hooks/useDriverRewardsPermissions'
import { formatCurrency, formatNumber } from '@/utils/format'

export function DriverPerformanceTable() {
  const adminActions = useAdminActions()
  const { canManagePerformance } = useDriverRewardsPermissions()
  const { data = [], isLoading } = useGetDriverPerformanceQuery()
  const [selectedDriver, setSelectedDriver] = useState<DriverPerformanceRecord | null>(null)
  const [adjustRecord, setAdjustRecord] = useState<DriverPerformanceRecord | null>(null)
  const [adjustPoints, setAdjustPoints] = useState(0)
  const [adjustReason, setAdjustReason] = useState('Admin Adjustment')

  const [adjustDriverPoints, { isLoading: adjusting }] = useAdjustDriverPointsMutation()
  const [changeLevel] = useChangeDriverLevelMutation()
  const [resetTier] = useResetDriverTierMutation()
  const [suspendRewards] = useSuspendDriverRewardsMutation()

  const openDetails = (record: DriverPerformanceRecord) => setSelectedDriver(record)

  const handleAction = (key: string, record: DriverPerformanceRecord) => {
    if (!canManagePerformance && key !== 'view' && key !== 'history') return
    switch (key) {
      case 'view':
      case 'history':
        openDetails(record)
        break
      case 'adjust-points':
        setAdjustRecord(record)
        break
      case 'promote':
        changeLevel({ id: record.id, direction: 'upgrade' }).unwrap()
          .then(() => adminActions.notify(`${record.driverName} promoted`))
        break
      case 'demote':
        changeLevel({ id: record.id, direction: 'downgrade' }).unwrap()
          .then(() => adminActions.notify(`${record.driverName} demoted`))
        break
      case 'reset':
        resetTier(record.id).unwrap()
          .then(() => adminActions.notify(`${record.driverName} tier reset`))
        break
      case 'suspend':
        suspendRewards({ id: record.id, suspended: !record.rewardsSuspended }).unwrap()
          .then(() => adminActions.notify(
            record.rewardsSuspended ? 'Rewards resumed' : 'Rewards suspended',
          ))
        break
    }
  }

  return (
    <>
      <Table
        loading={isLoading}
        rowKey="id"
        dataSource={data}
        scroll={{ x: 1400 }}
        {...createTableRowProps<DriverPerformanceRecord>(openDetails)}
        columns={[
          { title: 'Driver', dataIndex: 'driverName' },
          { title: 'Driver ID', dataIndex: 'driverId', width: 100 },
          {
            title: 'Current Tier',
            dataIndex: 'currentLevel',
            render: (l: string) => <Tag>{levelLabel(l)}</Tag>,
          },
          { title: 'Points', dataIndex: 'currentPoints', render: (p: number) => formatNumber(p) },
          { title: 'Rating', dataIndex: 'driverRating', render: (r: number) => r.toFixed(2) },
          { title: 'Trips', dataIndex: 'totalTrips' },
          { title: 'Online Hours', dataIndex: 'onlineHours' },
          { title: 'Mileage', dataIndex: 'totalMileage', render: (m: number) => `${formatNumber(m)} mi` },
          { title: 'Weekly Earnings', dataIndex: 'weeklyEarnings', render: (e: number) => formatCurrency(e) },
          {
            title: 'Status',
            dataIndex: 'status',
            render: (s: string) => {
              if (s === 'at_risk') return <Tag color="warning">At Risk</Tag>
              if (s === 'suspended') return <Tag color="error">Suspended</Tag>
              return <StatusBadge status="active" />
            },
          },
          ...(canManagePerformance
            ? [
                createActionsColumn<DriverPerformanceRecord>(
                  (record) => getDriverControlActionItems(record),
                  (key, record) => handleAction(key, record),
                ),
              ]
            : []),
        ]}
      />

      <DriverProgressDrawer
        open={Boolean(selectedDriver)}
        driver={selectedDriver}
        onClose={() => setSelectedDriver(null)}
      />

      <Modal
        title={`Adjust Points — ${adjustRecord?.driverName}`}
        open={Boolean(adjustRecord)}
        confirmLoading={adjusting}
        onCancel={() => setAdjustRecord(null)}
        onOk={async () => {
          if (!adjustRecord) return
          await adjustDriverPoints({
            id: adjustRecord.id,
            points: adjustPoints,
            reason: adjustReason,
          }).unwrap()
          adminActions.notify(`Points adjusted for ${adjustRecord.driverName}`)
          setAdjustRecord(null)
        }}
        destroyOnClose
      >
        <Form layout="vertical" className="mt-4">
          <Form.Item label="Points Adjustment (use negative to deduct)">
            <InputNumber value={adjustPoints} onChange={(v) => setAdjustPoints(v ?? 0)} className="w-full" />
          </Form.Item>
          <Form.Item label="Reason">
            <Input value={adjustReason} onChange={(e) => setAdjustReason(e.target.value)} />
          </Form.Item>
        </Form>
      </Modal>

      <AdminActionHost actions={adminActions} />
    </>
  )
}
