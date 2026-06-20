import { Form, Switch, Table } from 'antd'
import { useAdminActions } from '@/hooks/useAdminActions'
import {
  useGetDemotionRulesQuery,
  useGetPromotionEngineSettingsQuery,
  useGetDriverTierHistoryQuery,
  useUpdateDemotionRuleMutation,
  useUpdatePromotionEngineSettingsMutation,
} from '@/services/driverRewardsApi'
import { formatDateTime } from '@/utils/format'

export function PromotionDemotionEngine() {
  const adminActions = useAdminActions()
  const { data: settings, isLoading: settingsLoading } = useGetPromotionEngineSettingsQuery()
  const { data: rules = [], isLoading: rulesLoading } = useGetDemotionRulesQuery()
  const { data: history = [] } = useGetDriverTierHistoryQuery()
  const [updateSettings] = useUpdatePromotionEngineSettingsMutation()
  const [updateRule] = useUpdateDemotionRuleMutation()

  if (settingsLoading || !settings) return null

  return (
    <div className="space-y-6">
      <div className="glass-card p-5">
        <h3 className="mb-4 text-base font-semibold text-white">Automatic Promotion & Demotion Engine</h3>
        <Form layout="vertical">
          <div className="grid gap-4 md:grid-cols-2">
            <Form.Item label="Auto Promotion">
              <Switch
                checked={settings.autoPromotionEnabled}
                onChange={(checked) =>
                  updateSettings({ autoPromotionEnabled: checked }).unwrap().then(() =>
                    adminActions.notify(checked ? 'Auto promotion enabled' : 'Auto promotion disabled'),
                  )
                }
              />
            </Form.Item>
            <Form.Item label="Auto Demotion">
              <Switch
                checked={settings.autoDemotionEnabled}
                onChange={(checked) =>
                  updateSettings({ autoDemotionEnabled: checked }).unwrap().then(() =>
                    adminActions.notify(checked ? 'Auto demotion enabled' : 'Auto demotion disabled'),
                  )
                }
              />
            </Form.Item>
            <Form.Item label="Push Notifications">
              <Switch
                checked={settings.notifyPush}
                onChange={(checked) => updateSettings({ notifyPush: checked }).unwrap()}
              />
            </Form.Item>
            <Form.Item label="In-App Notifications">
              <Switch
                checked={settings.notifyInApp}
                onChange={(checked) => updateSettings({ notifyInApp: checked }).unwrap()}
              />
            </Form.Item>
            <Form.Item label="Email Notifications">
              <Switch
                checked={settings.notifyEmail}
                onChange={(checked) => updateSettings({ notifyEmail: checked }).unwrap()}
              />
            </Form.Item>
          </div>
          <div className="mt-2 rounded-lg border border-white/5 bg-black/20 p-4 text-sm text-alygo-text-muted">
            <p><span className="text-white">Promotion template:</span> {settings.promotionTemplate}</p>
            <p className="mt-2"><span className="text-white">Demotion template:</span> {settings.demotionTemplate}</p>
          </div>
        </Form>
      </div>

      <div className="glass-card p-5">
        <h3 className="mb-4 text-base font-semibold text-white">Demotion Rules</h3>
        <Table
          loading={rulesLoading}
          rowKey="id"
          pagination={false}
          dataSource={rules}
          columns={[
            { title: 'Rule', dataIndex: 'name' },
            { title: 'Metric', dataIndex: 'metric', render: (m: string) => m.replace(/_/g, ' ') },
            { title: 'Threshold', dataIndex: 'threshold' },
            { title: 'Operator', dataIndex: 'operator' },
            {
              title: 'Enabled',
              dataIndex: 'enabled',
              render: (enabled: boolean, record) => (
                <Switch
                  checked={enabled}
                  onChange={(checked) =>
                    updateRule({ id: record.id, enabled: checked }).unwrap().then(() =>
                      adminActions.notify(`${record.name} ${checked ? 'enabled' : 'disabled'}`),
                    )
                  }
                />
              ),
            },
          ]}
        />
      </div>

      <div className="glass-card p-5">
        <h3 className="mb-4 text-base font-semibold text-white">Recent Tier History</h3>
        <Table
          rowKey="id"
          pagination={{ pageSize: 5 }}
          dataSource={history}
          columns={[
            { title: 'Driver', dataIndex: 'driverName' },
            { title: 'Previous Tier', dataIndex: 'previousTierLabel' },
            { title: 'New Tier', dataIndex: 'newTierLabel' },
            { title: 'Reason', dataIndex: 'reason', render: (r: string) => r.replace(/_/g, ' ') },
            { title: 'Date', dataIndex: 'createdAt', render: (d: string) => formatDateTime(d) },
          ]}
        />
      </div>
    </div>
  )
}
