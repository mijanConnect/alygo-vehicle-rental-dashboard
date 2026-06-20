import { useState } from 'react'
import { Form, InputNumber, Modal, Select, Table, Tag } from 'antd'
import {
  AdminActionHost,
  createActionsColumn,
  createTableRowProps,
} from '@/components/admin'
import { StatusBadge } from '@/components/common/StatusBadge'
import { useAdminActions } from '@/hooks/useAdminActions'
import {
  useGetCancellationFeesQuery,
  useUpdateCancellationFeeMutation,
} from '@/services/cancellationApi'
import { useGetRideCategoriesQuery } from '@/services/rideCategoryApi'
import type { CancellationFee } from '@/types/cancellation'
import { formatCurrency } from '@/utils/format'
import {
  buildFeeDetailFields,
  getFeeActionItems,
  getRideCategoryLabel,
  openPolicyDrawer,
  POLICY_STATUS_OPTIONS,
} from '@/features/cancellations/cancellationHelpers'

interface CancellationFeeFormValues {
  fee: number
  driverCompensation: number
  status: 'active' | 'inactive'
}

export function CancellationFeeTable() {
  const adminActions = useAdminActions()
  const { data: fees = [], isLoading } = useGetCancellationFeesQuery()
  const { data: categoryResponse, isLoading: loadingCategories } = useGetRideCategoriesQuery({
    page: 1,
    pageSize: 100,
  })
  const rideCategories = categoryResponse?.data ?? []

  const [editRecord, setEditRecord] = useState<CancellationFee | null>(null)
  const [updateFee, { isLoading: updating }] = useUpdateCancellationFeeMutation()

  const handleAction = (key: string, record: CancellationFee) => {
    switch (key) {
      case 'view':
        openPolicyDrawer(
          'Cancellation Fee',
          buildFeeDetailFields(record, rideCategories),
          adminActions,
        )
        break
      case 'edit':
        setEditRecord(record)
        break
      case 'activate':
        updateFee({ id: record.id, status: 'active' }).unwrap()
          .then(() => adminActions.notify('Cancellation policy activated'))
        break
      case 'deactivate':
        updateFee({ id: record.id, status: 'inactive' }).unwrap()
          .then(() => adminActions.notify('Cancellation policy deactivated'))
        break
    }
  }

  return (
    <>
      <p className="mb-4 text-sm text-alygo-text-muted">
        Cancellation fees are configured per ride category. Create or update rules in Ride Categories.
      </p>

      <Table
        loading={isLoading || loadingCategories}
        rowKey="id"
        dataSource={fees}
        scroll={{ x: 900 }}
        {...createTableRowProps<CancellationFee>((record) =>
          openPolicyDrawer(
            'Cancellation Fee',
            buildFeeDetailFields(record, rideCategories),
            adminActions,
          ),
        )}
        columns={[
          {
            title: 'Ride Category',
            dataIndex: 'rideCategory',
            render: (slug: string) => (
              <Tag>{getRideCategoryLabel(slug, rideCategories)}</Tag>
            ),
          },
          { title: 'Cancellation Fee', dataIndex: 'fee', render: (f: number) => formatCurrency(f) },
          {
            title: 'Driver Compensation',
            dataIndex: 'driverCompensation',
            render: (f: number) => formatCurrency(f),
          },
          { title: 'Status', dataIndex: 'status', render: (s: string) => <StatusBadge status={s} /> },
          createActionsColumn<CancellationFee>(
            (record) => getFeeActionItems(record),
            (key, record) => handleAction(key, record),
          ),
        ]}
      />

      {editRecord && (
        <Modal
          title={`Edit Policy — ${getRideCategoryLabel(editRecord.rideCategory, rideCategories)}`}
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
            initialValues={{
              fee: editRecord.fee,
              driverCompensation: editRecord.driverCompensation,
              status: editRecord.status,
            }}
            onFinish={async (values: CancellationFeeFormValues) => {
              await updateFee({
                id: editRecord.id,
                fee: values.fee,
                driverCompensation: values.driverCompensation,
                status: values.status,
              }).unwrap()
              adminActions.notify('Cancellation policy updated')
              setEditRecord(null)
            }}
          >
            <Form.Item name="fee" label="Cancellation Fee" rules={[{ required: true }]}>
              <InputNumber min={0} prefix="$" className="w-full" />
            </Form.Item>
            <Form.Item name="driverCompensation" label="Driver Compensation" rules={[{ required: true }]}>
              <InputNumber min={0} prefix="$" className="w-full" />
            </Form.Item>
            <Form.Item name="status" label="Status" rules={[{ required: true }]}>
              <Select options={[...POLICY_STATUS_OPTIONS]} />
            </Form.Item>
            <button type="submit" className="hidden" />
          </Form>
        </Modal>
      )}

      <AdminActionHost actions={adminActions} />
    </>
  )
}
