import { Button, Form, InputNumber, Select, Switch } from 'antd'
import { Save } from 'lucide-react'
import { useAdminActions } from '@/hooks/useAdminActions'
import {
  useGetQueueRulesQuery,
  useUpdateQueueRulesMutation,
} from '@/services/airportQueueApi'
import { CATEGORY_OPTIONS, TIER_OPTIONS } from '@/services/mock/airportQueueData'
import type { DriverTier } from '@/types/airportQueue'

export function QueueRulesSettings() {
  const adminActions = useAdminActions()
  const { data, isLoading } = useGetQueueRulesQuery()
  const [updateRules, { isLoading: saving }] = useUpdateQueueRulesMutation()

  if (isLoading || !data) {
    return <div className="p-8 text-center text-alygo-text-muted">Loading queue rules...</div>
  }

  return (
    <div className="max-w-2xl">
      <p className="mb-4 text-sm text-alygo-text-muted">
        Configure airport staging area entry, tier priority, eligible ride categories, and maximum queue duration.
      </p>
      <Form
        layout="vertical"
        initialValues={{
          ...data,
          tierPriorityOrder: data.tierPriorityOrder,
        }}
        onFinish={async (values) => {
          await updateRules({
            ...values,
            tierPriorityOrder: values.tierPriorityOrder as DriverTier[],
          }).unwrap()
          adminActions.notify('Queue rules updated')
        }}
      >
        <Form.Item
          name="queueEntryRadiusMeters"
          label="Queue Entry Radius"
          extra="Drivers must be within this radius to join the airport queue"
          rules={[{ required: true }]}
        >
          <InputNumber min={100} max={5000} addonAfter="meters" className="w-full" />
        </Form.Item>

        <Form.Item
          name="tierPriorityEnabled"
          label="Tier Priority Rules"
          valuePropName="checked"
          extra="Higher-tier drivers receive dispatch priority in the queue"
        >
          <Switch checkedChildren="ON" unCheckedChildren="OFF" />
        </Form.Item>

        <Form.Item
          name="tierPriorityOrder"
          label="Tier Priority Order"
          extra="First tier listed receives highest priority"
        >
          <Select mode="multiple" options={TIER_OPTIONS} className="w-full" />
        </Form.Item>

        <Form.Item
          name="eligibleCategories"
          label="Airport Eligible Categories"
          extra="Ride categories allowed in airport queue"
          rules={[{ required: true }]}
        >
          <Select mode="multiple" options={CATEGORY_OPTIONS} className="w-full" />
        </Form.Item>

        <Form.Item
          name="blackPriorityEnabled"
          label="Black Category Priority"
          valuePropName="checked"
          extra="Black drivers receive elevated queue priority"
        >
          <Switch checkedChildren="ON" unCheckedChildren="OFF" />
        </Form.Item>

        <Form.Item
          name="blackSuvPriorityEnabled"
          label="Black SUV Priority"
          valuePropName="checked"
          extra="Black SUV drivers receive highest category priority"
        >
          <Switch checkedChildren="ON" unCheckedChildren="OFF" />
        </Form.Item>

        <Form.Item
          name="maxQueueTimeMinutes"
          label="Max Queue Time"
          extra="Maximum time a driver can remain in queue before auto-removal"
          rules={[{ required: true }]}
        >
          <InputNumber min={15} max={480} addonAfter="minutes" className="w-full" />
        </Form.Item>

        <Button type="primary" htmlType="submit" loading={saving} icon={<Save className="h-4 w-4" />}>
          Save Queue Rules
        </Button>
      </Form>
    </div>
  )
}
