import { useEffect } from 'react'
import { Button, Form, InputNumber } from 'antd'
import { Save } from 'lucide-react'
import { useAdminActions } from '@/hooks/useAdminActions'
import {
  useGetDriverCompensationSettingsQuery,
  useUpdateDriverCompensationSettingsMutation,
} from '@/services/lostFoundApi'
import { formatCurrency } from '@/utils/format'

export function CompensationSettings() {
  const adminActions = useAdminActions()
  const { data, isLoading } = useGetDriverCompensationSettingsQuery()
  const [updateSettings, { isLoading: saving }] = useUpdateDriverCompensationSettingsMutation()
  const [form] = Form.useForm()

  useEffect(() => {
    if (data) {
      form.setFieldsValue(data)
    }
  }, [data, form])

  if (isLoading || !data) {
    return <div className="glass-card p-8 text-center text-alygo-text-muted">Loading settings...</div>
  }

  return (
    <div className="max-w-xl">
      <p className="mb-4 text-sm text-alygo-text-muted">
        Configure driver rewards for lost item pickup and delivery returns.
      </p>
      <Form
        form={form}
        layout="vertical"
        initialValues={data}
        onFinish={async (values) => {
          await updateSettings(values).unwrap()
          adminActions.notify('Compensation settings saved')
        }}
      >
        <Form.Item
          name="pickupCompensation"
          label="Pickup Compensation"
          tooltip="Reward when passenger picks up item at hub"
          rules={[{ required: true }]}
        >
          <InputNumber min={0} prefix="$" className="w-full" />
        </Form.Item>
        <Form.Item
          name="deliveryCompensation"
          label="Delivery Compensation"
          tooltip="Base reward for driver delivery returns"
          rules={[{ required: true }]}
        >
          <InputNumber min={0} prefix="$" className="w-full" />
        </Form.Item>
        <Form.Item
          name="distanceBonus"
          label="Distance Bonus (per mile)"
          rules={[{ required: true }]}
        >
          <InputNumber min={0} prefix="$" step={0.5} className="w-full" />
        </Form.Item>
        <Form.Item
          name="premiumCategoryBonus"
          label="Premium Category Bonus"
          tooltip="Additional bonus for Black / Black SUV lost items"
          rules={[{ required: true }]}
        >
          <InputNumber min={0} prefix="$" className="w-full" />
        </Form.Item>

        <div className="mb-6 rounded-lg border border-white/5 bg-white/[0.02] p-4 text-sm text-alygo-text-muted">
          <p>Example: Pickup Return = {formatCurrency(data.pickupCompensation)}</p>
          <p>Driver Delivery = {formatCurrency(data.deliveryCompensation)}</p>
          <p>Premium Lost Item = {formatCurrency(data.premiumCategoryBonus)}</p>
        </div>

        <Button type="primary" htmlType="submit" loading={saving} icon={<Save className="h-4 w-4" />}>
          Save Settings
        </Button>
      </Form>
    </div>
  )
}
