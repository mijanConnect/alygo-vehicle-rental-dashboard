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
  useGetNoShowPoliciesQuery,
  useUpdateNoShowPolicyMutation,
} from '@/services/cancellationApi'
import { useGetRideCategoriesQuery } from '@/services/rideCategoryApi'
import type { NoShowPolicy } from '@/types/cancellation'
import { formatCurrency } from '@/utils/format'
import {
  buildNoShowDetailFields,
  getNoShowActionItems,
  getRideCategoryLabel,
  openPolicyDrawer,
  POLICY_STATUS_OPTIONS,
} from '@/features/cancellations/cancellationHelpers'

interface NoShowPolicyFormValues {
  waitTimeMinutes: number
  noShowFee: number
  driverCompensation: number
  status: 'active' | 'inactive'
}

export function NoShowPolicyTable() {
  const adminActions = useAdminActions()
  const { data: policies = [], isLoading } = useGetNoShowPoliciesQuery()
  const { data: categoryResponse, isLoading: loadingCategories } = useGetRideCategoriesQuery({
    page: 1,
    pageSize: 100,
  })
  const rideCategories = categoryResponse?.data ?? []

  const [editRecord, setEditRecord] = useState<NoShowPolicy | null>(null)
  const [updatePolicy, { isLoading: updating }] = useUpdateNoShowPolicyMutation()

  const handleAction = (key: string, record: NoShowPolicy) => {
    switch (key) {
      case 'view':
        openPolicyDrawer(
          'No Show Policy',
          buildNoShowDetailFields(record, rideCategories),
          adminActions,
        )
        break
      case 'edit':
        setEditRecord(record)
        break
      case 'activate':
        updatePolicy({ id: record.id, status: 'active' }).unwrap()
          .then(() => adminActions.notify('No-show policy activated'))
        break
      case 'deactivate':
        updatePolicy({ id: record.id, status: 'inactive' }).unwrap()
          .then(() => adminActions.notify('No-show policy deactivated'))
        break
    }
  }

  return (
    <>
      <p className="mb-4 text-sm text-alygo-text-muted">
        No-show rules are configured per ride category. Create or update rules in Ride Categories.
      </p>

      <Table
        loading={isLoading || loadingCategories}
        rowKey="id"
        dataSource={policies}
        scroll={{ x: 1000 }}
        {...createTableRowProps<NoShowPolicy>((record) =>
          openPolicyDrawer(
            'No Show Policy',
            buildNoShowDetailFields(record, rideCategories),
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
          { title: 'Wait Time', dataIndex: 'waitTimeMinutes', render: (m: number) => `${m} minutes` },
          { title: 'No Show Fee', dataIndex: 'noShowFee', render: (f: number) => formatCurrency(f) },
          {
            title: 'Driver Compensation',
            dataIndex: 'driverCompensation',
            render: (f: number) => formatCurrency(f),
          },
          { title: 'Status', dataIndex: 'status', render: (s: string) => <StatusBadge status={s} /> },
          createActionsColumn<NoShowPolicy>(
            (record) => getNoShowActionItems(record),
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
            document.getElementById('noshow-edit-form')?.dispatchEvent(
              new Event('submit', { cancelable: true, bubbles: true }),
            )
          }}
          destroyOnClose
        >
          <Form
            id="noshow-edit-form"
            layout="vertical"
            className="mt-4"
            initialValues={{
              waitTimeMinutes: editRecord.waitTimeMinutes,
              noShowFee: editRecord.noShowFee,
              driverCompensation: editRecord.driverCompensation,
              status: editRecord.status,
            }}
            onFinish={async (values: NoShowPolicyFormValues) => {
              await updatePolicy({
                id: editRecord.id,
                waitTimeMinutes: values.waitTimeMinutes,
                noShowFee: values.noShowFee,
                driverCompensation: values.driverCompensation,
                status: values.status,
              }).unwrap()
              adminActions.notify('No-show policy updated')
              setEditRecord(null)
            }}
          >
            <Form.Item name="waitTimeMinutes" label="Wait Time (minutes)" rules={[{ required: true }]}>
              <InputNumber min={1} max={30} className="w-full" />
            </Form.Item>
            <Form.Item name="noShowFee" label="No Show Fee" rules={[{ required: true }]}>
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
