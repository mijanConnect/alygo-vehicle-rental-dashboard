import { useState } from 'react'
import { Form, InputNumber, Modal, Table, Tag } from 'antd'
import {
  AdminActionHost,
  createActionsColumn,
  createTableRowProps,
} from '@/components/admin'
import { StatusBadge } from '@/components/common/StatusBadge'
import { useAdminActions } from '@/hooks/useAdminActions'
import {
  useGetDeliveryFeeSettingsQuery,
  useUpdateDeliveryFeeSettingMutation,
} from '@/services/lostFoundApi'
import { RIDE_CATEGORY_LABELS } from '@/constants'
import type { DeliveryFeeSetting } from '@/types/lostFound'
import type { RideCategory } from '@/types'
import { formatCurrency } from '@/utils/format'
import {
  getDeliveryFeeActionItems,
  openLostFoundDrawer,
} from '@/features/lost-found/lostFoundHelpers'
import type { DetailField } from '@/components/admin/types'

function buildFeeDetailFields(record: DeliveryFeeSetting): DetailField[] {
  return [
    { label: 'Ride Category', value: RIDE_CATEGORY_LABELS[record.rideCategory] },
    { label: 'Base Fee', value: formatCurrency(record.baseFee) },
    { label: 'Per Mile Fee', value: formatCurrency(record.perMileFee) },
    { label: 'Driver Compensation', value: formatCurrency(record.driverCompensation) },
    { label: 'Status', value: record.status === 'active' ? 'Active' : 'Inactive' },
  ]
}

export function DeliveryFeeSettingsTable() {
  const adminActions = useAdminActions()
  const { data = [], isLoading } = useGetDeliveryFeeSettingsQuery()
  const [editRecord, setEditRecord] = useState<DeliveryFeeSetting | null>(null)
  const [updateSetting, { isLoading: updating }] = useUpdateDeliveryFeeSettingMutation()

  const handleAction = (key: string, record: DeliveryFeeSetting) => {
    switch (key) {
      case 'edit':
        setEditRecord(record)
        break
      case 'activate':
        updateSetting({ id: record.id, status: 'active' }).unwrap()
          .then(() => adminActions.notify('Delivery fee activated'))
        break
      case 'deactivate':
        updateSetting({ id: record.id, status: 'inactive' }).unwrap()
          .then(() => adminActions.notify('Delivery fee deactivated'))
        break
    }
  }

  return (
    <>
      <Table
        loading={isLoading}
        rowKey="id"
        dataSource={data}
        scroll={{ x: 900 }}
        {...createTableRowProps<DeliveryFeeSetting>((record) =>
          openLostFoundDrawer('Delivery Fee Setting', buildFeeDetailFields(record), adminActions),
        )}
        columns={[
          {
            title: 'Ride Category',
            dataIndex: 'rideCategory',
            render: (c: RideCategory) => <Tag>{RIDE_CATEGORY_LABELS[c]}</Tag>,
          },
          { title: 'Base Fee', dataIndex: 'baseFee', render: (f: number) => formatCurrency(f) },
          { title: 'Per Mile Fee', dataIndex: 'perMileFee', render: (f: number) => formatCurrency(f) },
          { title: 'Driver Compensation', dataIndex: 'driverCompensation', render: (f: number) => formatCurrency(f) },
          { title: 'Status', dataIndex: 'status', render: (s: string) => <StatusBadge status={s} /> },
          createActionsColumn<DeliveryFeeSetting>(
            (record) => getDeliveryFeeActionItems(record),
            (key, record) => handleAction(key, record),
          ),
        ]}
      />

      {editRecord && (
        <Modal
          title={`Edit Delivery Fee — ${RIDE_CATEGORY_LABELS[editRecord.rideCategory]}`}
          open
          confirmLoading={updating}
          onCancel={() => setEditRecord(null)}
          onOk={() => {
            document.getElementById('delivery-fee-form')?.dispatchEvent(
              new Event('submit', { cancelable: true, bubbles: true }),
            )
          }}
          destroyOnClose
        >
          <Form
            id="delivery-fee-form"
            layout="vertical"
            className="mt-4"
            initialValues={{
              baseFee: editRecord.baseFee,
              perMileFee: editRecord.perMileFee,
              driverCompensation: editRecord.driverCompensation,
            }}
            onFinish={async (values) => {
              await updateSetting({ id: editRecord.id, ...values }).unwrap()
              adminActions.notify('Delivery fee updated')
              setEditRecord(null)
            }}
          >
            <Form.Item name="baseFee" label="Base Fee" rules={[{ required: true }]}>
              <InputNumber min={0} prefix="$" className="w-full" />
            </Form.Item>
            <Form.Item name="perMileFee" label="Per Mile Fee" rules={[{ required: true }]}>
              <InputNumber min={0} prefix="$" step={0.25} className="w-full" />
            </Form.Item>
            <Form.Item name="driverCompensation" label="Driver Compensation" rules={[{ required: true }]}>
              <InputNumber min={0} prefix="$" className="w-full" />
            </Form.Item>
            <button type="submit" className="hidden" />
          </Form>
        </Modal>
      )}

      <AdminActionHost actions={adminActions} />
    </>
  )
}
