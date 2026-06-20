import { useState } from 'react'
import { Form, Input, InputNumber, Modal, Select, Switch, Table, Tag } from 'antd'
import {
  AdminActionHost,
  createActionsColumn,
  createTableRowProps,
} from '@/components/admin'
import { StatusBadge } from '@/components/common/StatusBadge'
import { useAdminActions } from '@/hooks/useAdminActions'
import {
  useGetBackgroundCheckFeesQuery,
  useUpdateBackgroundCheckFeeMutation,
} from '@/services/backgroundCheckFeeApi'
import { CATEGORY_OPTIONS, STATE_OPTIONS } from '@/services/mock/backgroundCheckFeeData'
import type { BackgroundCheckFeeConfig } from '@/types/backgroundCheckFee'
import {
  buildFeeDetailFields,
  categoryLabel,
  getFeeActionItems,
} from '@/features/background-check-fees/backgroundCheckFeeHelpers'
import { formatCurrency } from '@/utils/format'

export function FeeConfigurationTable() {
  const adminActions = useAdminActions()
  const { data, isLoading } = useGetBackgroundCheckFeesQuery()
  const fees = data?.data ?? []
  const [editRecord, setEditRecord] = useState<BackgroundCheckFeeConfig | null>(null)
  const [updateFee, { isLoading: updating }] = useUpdateBackgroundCheckFeeMutation()

  const handleAction = (key: string, record: BackgroundCheckFeeConfig) => {
    switch (key) {
      case 'view':
        adminActions.openDrawer(record.feeName, buildFeeDetailFields(record))
        break
      case 'edit':
        setEditRecord(record)
        break
      case 'activate':
        updateFee({ id: record.id, status: 'active' }).unwrap()
          .then(() => adminActions.notify('Fee configuration activated'))
        break
      case 'deactivate':
        updateFee({ id: record.id, status: 'inactive' }).unwrap()
          .then(() => adminActions.notify('Fee configuration deactivated'))
        break
    }
  }

  return (
    <>
      <p className="mb-4 text-sm text-alygo-text-muted">
        Configure background check fees by state and category. Set refund eligibility and activation status per fee tier.
      </p>
      <Table
        loading={isLoading}
        rowKey="id"
        dataSource={fees}
        scroll={{ x: 1100 }}
        {...createTableRowProps<BackgroundCheckFeeConfig>((record) =>
          adminActions.openDrawer(record.feeName, buildFeeDetailFields(record)),
        )}
        columns={[
          { title: 'Fee Name', dataIndex: 'feeName' },
          { title: 'Amount', dataIndex: 'amount', render: (a: number) => formatCurrency(a) },
          { title: 'State', dataIndex: 'state' },
          { title: 'Category', dataIndex: 'category', render: (c: string) => <Tag>{categoryLabel(c)}</Tag> },
          { title: 'Refundable', dataIndex: 'refundable', render: (r: boolean) => (r ? 'Yes' : 'No') },
          { title: 'Status', dataIndex: 'status', render: (s: string) => <StatusBadge status={s} /> },
          createActionsColumn<BackgroundCheckFeeConfig>(
            (record) => getFeeActionItems(record),
            (key, record) => handleAction(key, record),
          ),
        ]}
      />

      {editRecord && (
        <Modal
          title={`Edit Fee — ${editRecord.feeName}`}
          open
          confirmLoading={updating}
          onCancel={() => setEditRecord(null)}
          onOk={() => {
            document.getElementById('fee-edit-form')?.dispatchEvent(
              new Event('submit', { cancelable: true, bubbles: true }),
            )
          }}
          destroyOnClose
        >
          <Form
            id="fee-edit-form"
            layout="vertical"
            className="mt-4"
            initialValues={editRecord}
            onFinish={async (values) => {
              await updateFee({ id: editRecord.id, ...values }).unwrap()
              adminActions.notify('Fee configuration updated')
              setEditRecord(null)
            }}
          >
            <Form.Item name="feeName" label="Fee Name" rules={[{ required: true }]}>
              <Input />
            </Form.Item>
            <Form.Item name="amount" label="Amount" rules={[{ required: true }]}>
              <InputNumber min={0} prefix="$" className="w-full" />
            </Form.Item>
            <Form.Item name="state" label="State" rules={[{ required: true }]}>
              <Select options={STATE_OPTIONS} />
            </Form.Item>
            <Form.Item name="category" label="Category" rules={[{ required: true }]}>
              <Select options={CATEGORY_OPTIONS} />
            </Form.Item>
            <Form.Item name="refundable" label="Refundable" valuePropName="checked">
              <Switch checkedChildren="Yes" unCheckedChildren="No" />
            </Form.Item>
            <Form.Item name="status" label="Status" rules={[{ required: true }]}>
              <Select options={[{ value: 'active', label: 'Active' }, { value: 'inactive', label: 'Inactive' }]} />
            </Form.Item>
            <button type="submit" className="hidden" />
          </Form>
        </Modal>
      )}

      <AdminActionHost actions={adminActions} />
    </>
  )
}
