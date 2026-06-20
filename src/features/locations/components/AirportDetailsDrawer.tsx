import { Button, Drawer, Form, InputNumber, Select, Switch, Tabs } from 'antd'
import { ExternalLink, Save } from 'lucide-react'
import { Link } from 'react-router-dom'
import { QueueMonitoringTable } from '@/features/airport-queue/components/QueueMonitoringTable'
import {
  useGetQueueRulesQuery,
  useUpdateAirportMutation,
  useUpdateQueueRulesMutation,
} from '@/services/airportQueueApi'
import { CATEGORY_OPTIONS, TIER_OPTIONS } from '@/services/mock/airportQueueData'
import type { AirportRecord, DriverTier } from '@/types/airportQueue'
import { useAdminActions } from '@/hooks/useAdminActions'

interface AirportDetailsDrawerProps {
  airport: AirportRecord | null
  open: boolean
  onClose: () => void
}

export function AirportDetailsDrawer({ airport, open, onClose }: AirportDetailsDrawerProps) {
  const adminActions = useAdminActions()
  const { data: queueRules, isLoading: rulesLoading } = useGetQueueRulesQuery()
  const [updateAirport, { isLoading: updatingAirport }] = useUpdateAirportMutation()
  const [updateRules, { isLoading: updatingRules }] = useUpdateQueueRulesMutation()

  if (!airport) return null

  return (
    <Drawer
      title={`${airport.name} (${airport.code})`}
      open={open}
      onClose={onClose}
      width={640}
      destroyOnClose
    >
      <Tabs
        defaultActiveKey="details"
        items={[
          {
            key: 'details',
            label: 'Details',
            children: (
              <Form
                layout="vertical"
                className="mt-2"
                initialValues={airport}
                onFinish={async (values) => {
                  await updateAirport({ id: airport.id, ...values }).unwrap()
                  adminActions.notify(`${airport.code} updated`)
                }}
              >
                <Form.Item name="status" label="Status" rules={[{ required: true }]}>
                  <Select
                    options={[
                      { value: 'active', label: 'Active' },
                      { value: 'disabled', label: 'Disabled' },
                    ]}
                  />
                </Form.Item>
                <Form.Item name="averageWaitMinutes" label="Average Wait (minutes)" rules={[{ required: true }]}>
                  <InputNumber min={0} className="w-full" />
                </Form.Item>
                <Button type="primary" htmlType="submit" loading={updatingAirport} icon={<Save className="h-4 w-4" />}>
                  Save Details
                </Button>
              </Form>
            ),
          },
          {
            key: 'queue',
            label: 'Queue Settings',
            children: rulesLoading || !queueRules ? (
              <p className="text-sm text-alygo-text-muted">Loading queue settings...</p>
            ) : (
              <Form
                layout="vertical"
                className="mt-2"
                initialValues={queueRules}
                onFinish={async (values) => {
                  await updateRules({
                    ...values,
                    tierPriorityOrder: values.tierPriorityOrder as DriverTier[],
                  }).unwrap()
                  adminActions.notify(`Queue settings saved for ${airport.code}`)
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
                <Form.Item name="tierPriorityEnabled" label="Tier Priority Rules" valuePropName="checked">
                  <Switch checkedChildren="ON" unCheckedChildren="OFF" />
                </Form.Item>
                <Form.Item name="tierPriorityOrder" label="Tier Priority Order">
                  <Select mode="multiple" options={TIER_OPTIONS} className="w-full" />
                </Form.Item>
                <Form.Item name="maxQueueTimeMinutes" label="Max Queue Time" rules={[{ required: true }]}>
                  <InputNumber min={15} max={480} addonAfter="minutes" className="w-full" />
                </Form.Item>
                <Button type="primary" htmlType="submit" loading={updatingRules} icon={<Save className="h-4 w-4" />}>
                  Save Queue Settings
                </Button>
              </Form>
            ),
          },
          {
            key: 'driver-rules',
            label: 'Driver Rules',
            children: rulesLoading || !queueRules ? (
              <p className="text-sm text-alygo-text-muted">Loading driver rules...</p>
            ) : (
              <Form
                layout="vertical"
                className="mt-2"
                initialValues={queueRules}
                onFinish={async (values) => {
                  await updateRules({
                    ...values,
                    tierPriorityOrder: values.tierPriorityOrder as DriverTier[],
                  }).unwrap()
                  adminActions.notify(`Driver rules saved for ${airport.code}`)
                }}
              >
                <Form.Item name="eligibleCategories" label="Airport Eligible Categories" rules={[{ required: true }]}>
                  <Select mode="multiple" options={CATEGORY_OPTIONS} className="w-full" />
                </Form.Item>
                <Form.Item name="blackPriorityEnabled" label="Black Category Priority" valuePropName="checked">
                  <Switch checkedChildren="ON" unCheckedChildren="OFF" />
                </Form.Item>
                <Form.Item name="blackSuvPriorityEnabled" label="Black SUV Priority" valuePropName="checked">
                  <Switch checkedChildren="ON" unCheckedChildren="OFF" />
                </Form.Item>
                <Button type="primary" htmlType="submit" loading={updatingRules} icon={<Save className="h-4 w-4" />}>
                  Save Driver Rules
                </Button>
              </Form>
            ),
          },
          {
            key: 'reservations',
            label: 'Reservations',
            children: (
              <div className="mt-2 space-y-4">
                <p className="text-sm text-alygo-text-muted">
                  Manage scheduled airport pickups and reservation demand for {airport.name}.
                </p>
                <Link to="/reservations?type=airport">
                  <Button type="primary" icon={<ExternalLink className="h-4 w-4" />}>
                    Open Airport Reservations
                  </Button>
                </Link>
              </div>
            ),
          },
          {
            key: 'monitoring',
            label: 'Live Queue',
            children: <QueueMonitoringTable />,
          },
        ]}
      />
    </Drawer>
  )
}
