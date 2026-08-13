import { useEffect } from 'react'
import { Button, Form, Input, Select, Spin, Switch } from 'antd'
import { AdminActionHost } from '@/components/admin'
import { useAdminActions } from '@/hooks/useAdminActions'
import {
  DEFAULT_PLATFORM_SETTINGS,
  useGetPlateformSettingsQuery,
  useUpdatePlateformSettingsMutation,
  type PlateformSettingsWritePayload,
} from '@/redux/api/plateformSettings'

const CURRENCY_OPTIONS = [
  { label: 'USD', value: 'usd' },
  { label: 'CAD', value: 'cad' },
  { label: 'BDT', value: 'bdt' },
  { label: 'EUR', value: 'eur' },
]

export function PlatformSettingsTab() {
  const adminActions = useAdminActions()
  const [form] = Form.useForm<PlateformSettingsWritePayload>()
  const { data, isLoading, isFetching, isError } = useGetPlateformSettingsQuery()
  const [updateSettings, { isLoading: saving }] = useUpdatePlateformSettingsMutation()

  useEffect(() => {
    if (data) {
      form.setFieldsValue({
        platformName: data.platformName ?? '',
        currency: (data.currency ?? 'usd').toLowerCase(),
        isMaintenanceMode: Boolean(data.isMaintenanceMode),
        supportEmail: data.supportEmail ?? '',
        contactNumber: data.contactNumber ?? '',
      })
    } else if (isError) {
      form.setFieldsValue(DEFAULT_PLATFORM_SETTINGS)
    }
  }, [data, isError, form])

  const handleSave = async () => {
    try {
      const values = await form.validateFields()
      await updateSettings({
        platformName: values.platformName.trim(),
        currency: values.currency.toLowerCase(),
        isMaintenanceMode: Boolean(values.isMaintenanceMode),
        supportEmail: values.supportEmail.trim(),
        contactNumber: values.contactNumber.trim(),
      }).unwrap()
      adminActions.notify('Platform settings saved')
    } catch {
      adminActions.notify('Unable to save platform settings')
    }
  }

  if (isLoading || isFetching) {
    return (
      <div className="flex justify-center py-16">
        <Spin />
      </div>
    )
  }

  return (
    <Form form={form} layout="vertical" className="max-w-2xl">
      <Form.Item
        name="platformName"
        label="Platform Name"
        rules={[{ required: true, message: 'Platform name is required' }]}
      >
        <Input placeholder="e.g. RideConnect BD" />
      </Form.Item>
      <Form.Item
        name="currency"
        label="Currency"
        rules={[{ required: true, message: 'Currency is required' }]}
      >
        <Select options={CURRENCY_OPTIONS} />
      </Form.Item>
      <Form.Item
        name="supportEmail"
        label="Support Email"
        rules={[
          { required: true, message: 'Support email is required' },
          { type: 'email', message: 'Enter a valid email' },
        ]}
      >
        <Input placeholder="support@example.com" />
      </Form.Item>
      <Form.Item
        name="contactNumber"
        label="Contact Number"
        rules={[{ required: true, message: 'Contact number is required' }]}
      >
        <Input placeholder="+8801712345678" />
      </Form.Item>
      <Form.Item name="isMaintenanceMode" label="Maintenance Mode" valuePropName="checked">
        <Switch />
      </Form.Item>
      <div className="flex justify-end">
        <Button type="primary" onClick={handleSave} loading={saving}>
          Save Changes
        </Button>
      </div>
      <AdminActionHost actions={adminActions} />
    </Form>
  )
}
