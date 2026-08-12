import { Button, Form, Input, Select, Switch, Table } from 'antd'
import {
  AdminActionHost,
  ActionMenu,
  createActionsColumn,
  createTableRowProps,
  getGenericActionItems,
  getSettingsActionItems,
  handleGenericAction,
  openGenericDetails,
} from '@/components/admin'
import { PageShell } from '@/components/common/PageShell'
import { useAdminActions } from '@/hooks/useAdminActions'
import { useDocumentTitle } from '@/hooks/useDocumentTitle'

export function PlatformSettingsPage() {
  useDocumentTitle('Platform Settings')
  const adminActions = useAdminActions()

  return (
    <PageShell title="Platform Settings" description="Core platform configuration and operational defaults.">
      <div className="glass-card max-w-2xl p-6">
        <Form layout="vertical">
          <Form.Item label="Platform Name"><Input defaultValue="Alygo" /></Form.Item>
          <Form.Item label="Default Currency"><Select defaultValue="USD" options={[{ value: 'USD', label: 'USD' }, { value: 'CAD', label: 'CAD' }]} /></Form.Item>
          <Form.Item label="Maintenance Mode"><Switch /></Form.Item>
          <div className="flex items-center gap-2">
            <Button type="primary" onClick={() => adminActions.notify('Settings saved')}>Save Changes</Button>
            <ActionMenu
              items={getSettingsActionItems().filter((i) => !['save'].includes(i.key))}
              onAction={(key) => handleGenericAction(key, { section: 'Platform Settings' }, adminActions, 'Platform Settings')}
            />
          </div>
        </Form>
      </div>
      <AdminActionHost actions={adminActions} />
    </PageShell>
  )
}

export function NotificationsSettingsPage() {
  useDocumentTitle('Notifications')
  return (
    <PageShell title="Notification Settings" description="Configure admin and system notification preferences.">
      <div className="glass-card max-w-2xl space-y-4 p-6">
        {['Compliance Alerts', 'Surge Notifications', 'Payout Alerts', 'System Health'].map((item) => (
          <div key={item} className="flex items-center justify-between rounded-xl border border-white/5 p-4">
            <span className="text-white">{item}</span>
            <Switch defaultChecked />
          </div>
        ))}
      </div>
    </PageShell>
  )
}

export function IntegrationsPage() {
  useDocumentTitle('Integrations')
  const adminActions = useAdminActions()
  const integrations = [
    { name: 'Stripe', status: 'Connected', type: 'Payments' },
    { name: 'Google Maps', status: 'Configured', type: 'Maps' },
    { name: 'Checkr', status: 'Connected', type: 'Background Checks' },
    { name: 'Socket.IO', status: 'Active', type: 'Real-time' },
  ]

  return (
    <PageShell title="Integrations" description="Third-party service connections.">
      <div className="glass-card p-4">
        <Table
          rowKey="name"
          dataSource={integrations}
          {...createTableRowProps<{ name: string; status: string; type: string }>((record) => openGenericDetails(record as Record<string, unknown>, adminActions, record.name))}
          columns={[
            { title: 'Service', dataIndex: 'name' },
            { title: 'Type', dataIndex: 'type' },
            { title: 'Status', dataIndex: 'status' },
            createActionsColumn<{ name: string; status: string; type: string }>(
              () => getGenericActionItems({ edit: true, export: true }),
              (key, record) => handleGenericAction(key, record as Record<string, unknown>, adminActions, record.name),
            ),
          ]}
        />
      </div>
      <AdminActionHost actions={adminActions} />
    </PageShell>
  )
}

export default PlatformSettingsPage
