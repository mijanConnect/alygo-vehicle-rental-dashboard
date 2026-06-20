import { Button, Form, Input, Switch } from 'antd'
import { Save } from 'lucide-react'
import { PageShell } from '@/components/common/PageShell'
import { IncidentTypesTable } from '@/features/settings/components/IncidentTypesTable'
import { useAdminActions } from '@/hooks/useAdminActions'
import { useDocumentTitle } from '@/hooks/useDocumentTitle'
import {
  useGetSafetySettingsQuery,
  useUpdateSafetySettingsMutation,
} from '@/services/safetyIncidentApi'

export default function SafetyConfigurationPage() {
  useDocumentTitle('Safety Configuration')
  const adminActions = useAdminActions()
  const { data, isLoading } = useGetSafetySettingsQuery()
  const [updateSettings, { isLoading: saving }] = useUpdateSafetySettingsMutation()

  if (isLoading || !data) {
    return (
      <PageShell title="Safety Configuration" description="Platform-level safety settings and incident type definitions.">
        <div className="glass-card p-8 text-center text-alygo-text-muted">Loading configuration...</div>
      </PageShell>
    )
  }

  return (
    <PageShell
      title="Safety Configuration"
      description="Platform-level safety settings and incident type definitions. Case handling is managed in Safety & Incident Management."
    >
      <div className="glass-card mb-6 max-w-xl p-6">
        <h3 className="mb-4 text-base font-semibold text-white">Platform Settings</h3>
        <Form
          layout="vertical"
          initialValues={data}
          onFinish={async (values) => {
            await updateSettings(values).unwrap()
            adminActions.notify('Safety configuration saved')
          }}
        >
          <Form.Item name="sosEnabled" label="SOS Enabled" valuePropName="checked">
            <Switch />
          </Form.Item>
          <Form.Item
            name="emergencyHotlineNumber"
            label="Emergency Hotline Number"
            rules={[{ required: true, message: 'Emergency hotline number is required' }]}
          >
            <Input placeholder="+1 (800) 555-0911" />
          </Form.Item>
          <Form.Item name="pushNotifications" label="Push Notifications" valuePropName="checked">
            <Switch />
          </Form.Item>
          <Form.Item name="emailNotifications" label="Email Notifications" valuePropName="checked">
            <Switch />
          </Form.Item>
          <Button type="primary" htmlType="submit" loading={saving} icon={<Save className="h-4 w-4" />}>
            Save Settings
          </Button>
        </Form>
      </div>

      <div className="glass-card p-6">
        <h3 className="mb-4 text-base font-semibold text-white">Incident Types</h3>
        <IncidentTypesTable />
      </div>
    </PageShell>
  )
}
