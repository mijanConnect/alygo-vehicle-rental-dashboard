import { Button, Form, InputNumber, Switch } from 'antd'
import { Save, ShieldCheck } from 'lucide-react'
import {
  useGetIdentityVerificationSettingsQuery,
  useUpdateIdentityVerificationSettingsMutation,
} from '@/services/driverVerificationApi'
import { useAdminActions } from '@/hooks/useAdminActions'

export function IdentityVerificationSettings() {
  const adminActions = useAdminActions()
  const { data, isLoading } = useGetIdentityVerificationSettingsQuery()
  const [updateSettings, { isLoading: saving }] = useUpdateIdentityVerificationSettingsMutation()

  if (isLoading || !data) {
    return <div className="p-8 text-center text-alygo-text-muted">Loading identity verification rules...</div>
  }

  return (
    <div className="max-w-2xl">
      <div className="mb-6 flex items-center gap-3">
        <div className="rounded-xl bg-indigo-500/10 p-2.5">
          <ShieldCheck className="h-5 w-5 text-indigo-400" />
        </div>
        <div>
          <h3 className="text-base font-semibold text-white">Identity Verification Rules</h3>
          <p className="text-sm text-alygo-text-muted">
            Configure automated re-verification triggers and admin controls for driver identity checks.
          </p>
        </div>
      </div>
      <Form
        layout="vertical"
        initialValues={data}
        onFinish={async (values) => {
          await updateSettings(values).unwrap()
          adminActions.notify('Identity verification rules updated')
        }}
      >
        <Form.Item name="enabled" label="Enable re-verification system" valuePropName="checked">
          <Switch />
        </Form.Item>
        <Form.Item name="reVerificationEveryDays" label="Require re-verification every X days">
          <InputNumber min={1} max={365} className="w-full" addonAfter="days" />
        </Form.Item>
        <Form.Item name="reVerificationEveryTrips" label="Require re-verification every X trips">
          <InputNumber min={1} max={10000} className="w-full" addonAfter="trips" />
        </Form.Item>
        <Form.Item name="allowManualAdminRequests" label="Allow manual admin verification requests" valuePropName="checked">
          <Switch />
        </Form.Item>
        <Form.Item name="autoPauseAfterFailed" label="Auto-pause drivers after failed verification" valuePropName="checked">
          <Switch />
        </Form.Item>
        <Form.Item name="enableSuspiciousActivityChecks" label="Enable suspicious activity verification checks" valuePropName="checked">
          <Switch />
        </Form.Item>
        <Button type="primary" htmlType="submit" loading={saving} icon={<Save className="h-4 w-4" />}>
          Save Rules
        </Button>
      </Form>
    </div>
  )
}
