import { useState } from 'react'
import { Table, Tag } from 'antd'
import {
  AdminActionHost,
  createActionsColumn,
  createTableRowProps,
} from '@/components/admin'
import { useAdminActions } from '@/hooks/useAdminActions'
import {
  STATUS_LABELS,
  useGetStateActivationsQuery,
  useSetStateStatusMutation,
  useUpdateStateActivationMutation,
} from '@/services/stateActivationApi'
import type { StateActivationRecord } from '@/types/stateActivation'
import {
  buildStateDetailFields,
  getStateActivationActionItems,
  statusTagColor,
} from '@/features/state-activation/stateActivationHelpers'
import { StateSettingsDrawer } from '@/features/state-activation/components/StateSettingsDrawer'
import { formatNumber } from '@/utils/format'

function FeatureTag({ enabled }: { enabled: boolean }) {
  return <Tag color={enabled ? 'success' : 'default'}>{enabled ? 'Yes' : 'No'}</Tag>
}

export function StateConfigurationTable() {
  const adminActions = useAdminActions()
  const { data = [], isLoading } = useGetStateActivationsQuery()
  const [editState, setEditState] = useState<StateActivationRecord | null>(null)

  const [updateState, { isLoading: updating }] = useUpdateStateActivationMutation()
  const [setStatus] = useSetStateStatusMutation()

  const handleAction = (key: string, record: StateActivationRecord) => {
    switch (key) {
      case 'view':
        adminActions.openDrawer(record.stateName, buildStateDetailFields(record))
        break
      case 'edit':
        setEditState(record)
        break
      case 'enable':
        setStatus({ id: record.id, status: 'active' }).unwrap()
          .then(() => adminActions.notify(`${record.stateName} enabled`))
        break
      case 'disable':
        adminActions.openConfirm({
          title: 'Disable State',
          description: `Disable platform operations in ${record.stateName}? This will turn off all active features.`,
          confirmLabel: 'Disable',
          danger: true,
          onConfirm: async () => {
            await setStatus({ id: record.id, status: 'disabled' }).unwrap()
            adminActions.notify(`${record.stateName} disabled`)
          },
        })
        break
    }
  }

  return (
    <>
      <Table
        loading={isLoading}
        rowKey="id"
        dataSource={data}
        scroll={{ x: 1300 }}
        {...createTableRowProps<StateActivationRecord>((record) =>
          adminActions.openDrawer(record.stateName, buildStateDetailFields(record)),
        )}
        columns={[
          {
            title: 'State',
            dataIndex: 'stateName',
            render: (name: string, record: StateActivationRecord) => (
              <span>
                {name} <span className="text-alygo-text-muted">({record.stateCode})</span>
              </span>
            ),
          },
          {
            title: 'Status',
            dataIndex: 'status',
            render: (s: string) => (
              <Tag color={statusTagColor(s)}>{STATUS_LABELS[s] ?? s}</Tag>
            ),
          },
          { title: 'Drivers', dataIndex: 'activeDrivers', render: (n: number) => formatNumber(n) },
          { title: 'Passengers', dataIndex: 'activePassengers', render: (n: number) => formatNumber(n) },
          {
            title: 'Reservations Enabled',
            dataIndex: 'reservationsEnabled',
            render: (v: boolean) => <FeatureTag enabled={v} />,
          },
          {
            title: 'Airport Operations Enabled',
            dataIndex: 'airportQueueEnabled',
            render: (v: boolean) => <FeatureTag enabled={v} />,
          },
          {
            title: 'Dynamic Pricing Enabled',
            dataIndex: 'dynamicPricingEnabled',
            render: (v: boolean) => <FeatureTag enabled={v} />,
          },
          createActionsColumn<StateActivationRecord>(
            (record) => getStateActivationActionItems(record),
            (key, record) => handleAction(key, record),
          ),
        ]}
      />

      <StateSettingsDrawer
        open={Boolean(editState)}
        state={editState}
        confirmLoading={updating}
        onClose={() => setEditState(null)}
        onSubmit={async (values) => {
          if (!editState) return
          await updateState({ id: editState.id, settings: values }).unwrap()
          adminActions.notify(`${editState.stateName} settings saved`)
          setEditState(null)
        }}
      />

      <AdminActionHost actions={adminActions} />
    </>
  )
}
