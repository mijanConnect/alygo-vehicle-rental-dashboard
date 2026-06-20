import { useState } from 'react'
import { Button, Form, Input, InputNumber, Modal, Select, Table, Tag } from 'antd'
import { Plus } from 'lucide-react'
import {
  AdminActionHost,
  ConfirmationModal,
  createActionsColumn,
  createTableRowProps,
} from '@/components/admin'
import { StatusBadge } from '@/components/common/StatusBadge'
import { useAdminActions } from '@/hooks/useAdminActions'
import {
  RIDE_CATEGORY_OPTIONS,
  useCreateCityPolicyMutation,
  useDeleteCityPolicyMutation,
  useGetCityPoliciesQuery,
  useUpdateCityPolicyMutation,
} from '@/services/cancellationApi'
import { RIDE_CATEGORY_LABELS } from '@/constants'
import type { CityCancellationPolicy } from '@/types/cancellation'
import type { RideCategory } from '@/types'
import { formatCurrency } from '@/utils/format'
import {
  buildCityPolicyDetailFields,
  getCityPolicyActionItems,
  openPolicyDrawer,
} from '@/features/cancellations/cancellationHelpers'

interface CityPolicyFormValues {
  state: string
  city: string
  rideCategory: RideCategory
  cancellationFee: number
  noShowFee: number
  waitTime: number
  status: 'active' | 'inactive'
}

function CityPolicyForm({
  id,
  initialValues,
  onFinish,
}: {
  id: string
  initialValues?: Partial<CityPolicyFormValues>
  onFinish: (values: CityPolicyFormValues) => void
}) {
  return (
    <Form
      id={id}
      layout="vertical"
      className="mt-4"
      initialValues={{
        status: 'active',
        waitTime: 5,
        ...initialValues,
      }}
      onFinish={onFinish}
    >
      <Form.Item name="state" label="State" rules={[{ required: true, message: 'State is required' }]}>
        <Input placeholder="e.g. California" />
      </Form.Item>
      <Form.Item name="city" label="City" rules={[{ required: true, message: 'City is required' }]}>
        <Input placeholder="e.g. Los Angeles" />
      </Form.Item>
      <Form.Item name="rideCategory" label="Ride Category" rules={[{ required: true }]}>
        <Select options={RIDE_CATEGORY_OPTIONS} />
      </Form.Item>
      <Form.Item name="cancellationFee" label="Cancellation Fee" rules={[{ required: true }]}>
        <InputNumber min={0} prefix="$" className="w-full" />
      </Form.Item>
      <Form.Item name="noShowFee" label="No Show Fee" rules={[{ required: true }]}>
        <InputNumber min={0} prefix="$" className="w-full" />
      </Form.Item>
      <Form.Item name="waitTime" label="Wait Time (minutes)" rules={[{ required: true }]}>
        <InputNumber min={1} max={30} className="w-full" />
      </Form.Item>
      <Form.Item name="status" label="Status" rules={[{ required: true }]}>
        <Select
          options={[
            { value: 'active', label: 'Active' },
            { value: 'inactive', label: 'Inactive' },
          ]}
        />
      </Form.Item>
      <button type="submit" className="hidden" />
    </Form>
  )
}

export function CityPolicyTable() {
  const adminActions = useAdminActions()
  const { data = [], isLoading } = useGetCityPoliciesQuery()
  const [createOpen, setCreateOpen] = useState(false)
  const [editRecord, setEditRecord] = useState<CityCancellationPolicy | null>(null)
  const [deleteRecord, setDeleteRecord] = useState<CityCancellationPolicy | null>(null)

  const [createPolicy, { isLoading: creating }] = useCreateCityPolicyMutation()
  const [updatePolicy, { isLoading: updating }] = useUpdateCityPolicyMutation()
  const [deletePolicy, { isLoading: deleting }] = useDeleteCityPolicyMutation()

  const handleAction = (key: string, record: CityCancellationPolicy) => {
    switch (key) {
      case 'view':
        openPolicyDrawer('City / State Policy', buildCityPolicyDetailFields(record), adminActions)
        break
      case 'edit':
        setEditRecord(record)
        break
      case 'delete':
        setDeleteRecord(record)
        break
    }
  }

  return (
    <>
      <div className="mb-4 flex items-center justify-between gap-4">
        <p className="text-sm text-alygo-text-muted">
          Configure location-specific cancellation policies. Hierarchy: United States → State → City.
        </p>
        <Button type="primary" icon={<Plus className="h-4 w-4" />} onClick={() => setCreateOpen(true)}>
          Add Policy
        </Button>
      </div>
      <Table
        loading={isLoading}
        rowKey="id"
        dataSource={data}
        scroll={{ x: 1100 }}
        {...createTableRowProps<CityCancellationPolicy>((record) =>
          openPolicyDrawer('City / State Policy', buildCityPolicyDetailFields(record), adminActions),
        )}
        columns={[
          { title: 'State', dataIndex: 'state' },
          { title: 'City', dataIndex: 'city' },
          {
            title: 'Ride Category',
            dataIndex: 'rideCategory',
            render: (c: RideCategory) => <Tag>{RIDE_CATEGORY_LABELS[c]}</Tag>,
          },
          { title: 'Cancellation Fee', dataIndex: 'cancellationFee', render: (f: number) => formatCurrency(f) },
          { title: 'No Show Fee', dataIndex: 'noShowFee', render: (f: number) => formatCurrency(f) },
          { title: 'Wait Time', dataIndex: 'waitTime', render: (m: number) => `${m} min` },
          { title: 'Status', dataIndex: 'status', render: (s: string) => <StatusBadge status={s} /> },
          createActionsColumn<CityCancellationPolicy>(
            () => getCityPolicyActionItems(),
            (key, record) => handleAction(key, record),
          ),
        ]}
      />

      <Modal
        title="Add City / State Policy"
        open={createOpen}
        confirmLoading={creating}
        onCancel={() => setCreateOpen(false)}
        onOk={() => {
          document.getElementById('city-policy-create-form')?.dispatchEvent(
            new Event('submit', { cancelable: true, bubbles: true }),
          )
        }}
        destroyOnClose
      >
        <CityPolicyForm
          id="city-policy-create-form"
          onFinish={async (values) => {
            await createPolicy(values).unwrap()
            adminActions.notify('City policy created')
            setCreateOpen(false)
          }}
        />
      </Modal>

      {editRecord && (
        <Modal
          title={`Edit Policy — ${editRecord.city}, ${editRecord.state}`}
          open
          confirmLoading={updating}
          onCancel={() => setEditRecord(null)}
          onOk={() => {
            document.getElementById('city-policy-edit-form')?.dispatchEvent(
              new Event('submit', { cancelable: true, bubbles: true }),
            )
          }}
          destroyOnClose
        >
          <CityPolicyForm
            id="city-policy-edit-form"
            initialValues={editRecord}
            onFinish={async (values) => {
              await updatePolicy({ id: editRecord.id, ...values }).unwrap()
              adminActions.notify('City policy updated')
              setEditRecord(null)
            }}
          />
        </Modal>
      )}

      <ConfirmationModal
        open={Boolean(deleteRecord)}
        title="Delete City Policy"
        description={`Delete policy for ${deleteRecord?.city}, ${deleteRecord?.state}?`}
        confirmLabel="Delete"
        danger
        loading={deleting}
        onCancel={() => setDeleteRecord(null)}
        onConfirm={async () => {
          if (!deleteRecord) return
          await deletePolicy(deleteRecord.id).unwrap()
          adminActions.notify('City policy deleted')
          setDeleteRecord(null)
        }}
      />

      <AdminActionHost actions={adminActions} />
    </>
  )
}
