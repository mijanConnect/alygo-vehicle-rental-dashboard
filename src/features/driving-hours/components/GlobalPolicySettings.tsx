import { Button, Form, InputNumber, Select } from 'antd'
import { Save } from 'lucide-react'
import { StatusBadge } from '@/components/common/StatusBadge'
import {
  useGetDrivingHoursPolicyQuery,
  useUpdateDrivingHoursPolicyMutation,
} from '@/services/drivingHoursApi'
import { useAdminActions } from '@/hooks/useAdminActions'

export function GlobalPolicySettings() {
  const adminActions = useAdminActions()
  const { data, isLoading } = useGetDrivingHoursPolicyQuery()
  const [updatePolicy, { isLoading: saving }] = useUpdateDrivingHoursPolicyMutation()

  if (isLoading || !data) {
    return <div className="p-8 text-center text-alygo-text-muted">Loading policy...</div>
  }

  return (
    <div className="max-w-xl">
      <p className="mb-4 text-sm text-alygo-text-muted">
        Configure global driving hour limits and reset requirements applied platform-wide.
      </p>
      <Form
        layout="vertical"
        initialValues={data}
        onFinish={async (values) => {
          await updatePolicy(values).unwrap()
          adminActions.notify('Global driving hours policy updated')
        }}
      >
        <Form.Item name="maxDrivingHours" label="Maximum Driving Hours" rules={[{ required: true }]}>
          <InputNumber min={1} max={24} className="w-full" addonAfter="hours" />
        </Form.Item>
        <Form.Item name="requiredResetHours" label="Required Reset Hours" rules={[{ required: true }]}>
          <InputNumber min={1} max={24} className="w-full" addonAfter="hours" />
        </Form.Item>
        <Form.Item name="warningThresholdHours" label="Warning Threshold" rules={[{ required: true }]}>
          <InputNumber min={1} max={24} className="w-full" addonAfter="hours before limit" />
        </Form.Item>
        <Form.Item name="status" label="Status" rules={[{ required: true }]}>
          <Select options={[{ value: 'active', label: 'Active' }, { value: 'inactive', label: 'Inactive' }]} />
        </Form.Item>
        <div className="mb-4">
          <StatusBadge status={data.status} />
        </div>
        <Button type="primary" htmlType="submit" loading={saving} icon={<Save className="h-4 w-4" />}>
          Save Policy
        </Button>
      </Form>
    </div>
  )
}
