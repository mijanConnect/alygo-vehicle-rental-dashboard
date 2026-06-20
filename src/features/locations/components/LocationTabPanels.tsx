import { useState } from 'react'
import { Button, Form, Input, Modal, Select, Table, Tag } from 'antd'
import { Trash2 } from 'lucide-react'
import {
  AdminActionHost,
  createActionsColumn,
  createTableRowProps,
  getDemandActionItems,
  handleGenericAction,
  openGenericDetails,
} from '@/components/admin'
import { StateConfigurationTable } from '@/features/state-activation/components/StateConfigurationTable'
import { useStateActivationRealtime } from '@/features/state-activation/hooks/useStateActivationRealtime'
import { AirportDetailsDrawer } from '@/features/locations/components/AirportDetailsDrawer'
import { useAirportQueueRealtime } from '@/features/airport-queue/hooks/useAirportQueueRealtime'
import {
  AIRPORT_STATUS_LABELS,
  useGetAirportsQuery,
  useSetAirportStatusMutation,
} from '@/services/airportQueueApi'
import type { AirportRecord } from '@/types/airportQueue'
import { buildAirportDetailFields, getAirportActionItems as getAirportQueueActionItems } from '@/features/airport-queue/airportQueueHelpers'
import { useAdminActions } from '@/hooks/useAdminActions'
import { formatNumber } from '@/utils/format'

export function StatesPanel() {
  useStateActivationRealtime()
  const adminActions = useAdminActions()
  const [addOpen, setAddOpen] = useState(false)

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <p className="text-sm text-alygo-text-muted">
          Manage states, activation toggles, and regional platform settings. Edit a state to configure activation.
        </p>
        <Button type="primary" onClick={() => setAddOpen(true)}>
          Add State
        </Button>
      </div>
      <StateConfigurationTable />
      <Modal
        title="Add State"
        open={addOpen}
        onCancel={() => setAddOpen(false)}
        onOk={() => {
          adminActions.notify('State added')
          setAddOpen(false)
        }}
      >
        <Form layout="vertical" className="mt-4">
          <Form.Item label="State Code" required>
            <Input placeholder="CA" maxLength={2} />
          </Form.Item>
          <Form.Item label="State Name" required>
            <Input placeholder="California" />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  )
}

export function CitiesPanel() {
  const adminActions = useAdminActions()
  const [addOpen, setAddOpen] = useState(false)
  const cities = [
    { name: 'San Francisco', state: 'CA', drivers: 1420, zones: 8, status: 'Active' },
    { name: 'Los Angeles', state: 'CA', drivers: 2100, zones: 12, status: 'Active' },
    { name: 'New York', state: 'NY', drivers: 3200, zones: 15, status: 'Active' },
  ]

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <p className="text-sm text-alygo-text-muted">Manage cities and assign them to states.</p>
        <Button type="primary" onClick={() => setAddOpen(true)}>
          Add City
        </Button>
      </div>
      <Table
        rowKey="name"
        dataSource={cities}
        {...createTableRowProps<{ name: string; state: string; drivers: number; zones: number; status: string }>((record) =>
          openGenericDetails(record as Record<string, unknown>, adminActions, record.name),
        )}
        columns={[
          { title: 'City', dataIndex: 'name' },
          { title: 'State', dataIndex: 'state' },
          { title: 'Drivers', dataIndex: 'drivers' },
          { title: 'Zones', dataIndex: 'zones' },
          { title: 'Status', dataIndex: 'status' },
          createActionsColumn<{ name: string; state: string; drivers: number; zones: number; status: string }>(
            () => getDemandActionItems(),
            (key, record) => handleGenericAction(key, record as Record<string, unknown>, adminActions, record.name),
          ),
        ]}
      />
      <Modal
        title="Add City"
        open={addOpen}
        onCancel={() => setAddOpen(false)}
        onOk={() => {
          adminActions.notify('City added')
          setAddOpen(false)
        }}
      >
        <Form layout="vertical" className="mt-4">
          <Form.Item label="City Name" required>
            <Input placeholder="San Francisco" />
          </Form.Item>
          <Form.Item label="State" required>
            <Select
              placeholder="Select state"
              options={[
                { value: 'CA', label: 'California' },
                { value: 'NY', label: 'New York' },
                { value: 'TX', label: 'Texas' },
                { value: 'FL', label: 'Florida' },
              ]}
            />
          </Form.Item>
        </Form>
      </Modal>
      <AdminActionHost actions={adminActions} />
    </div>
  )
}

export function ZonesPanel() {
  const adminActions = useAdminActions()
  const [addOpen, setAddOpen] = useState(false)
  const zones = [
    { name: 'Downtown SF', city: 'San Francisco', type: 'Surge', active: true },
    { name: 'Financial District', city: 'San Francisco', type: 'Pricing', active: true },
    { name: 'Midtown', city: 'New York', type: 'Surge', active: true },
  ]

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <p className="text-sm text-alygo-text-muted">Manage geographic zones, city assignment, and surge pricing configuration.</p>
        <Button type="primary" onClick={() => setAddOpen(true)}>
          Add Zone
        </Button>
      </div>
      <Table
        rowKey="name"
        dataSource={zones}
        {...createTableRowProps<{ name: string; city: string; type: string; active: boolean }>((record) =>
          openGenericDetails(record as Record<string, unknown>, adminActions, record.name),
        )}
        columns={[
          { title: 'Zone', dataIndex: 'name' },
          { title: 'City', dataIndex: 'city' },
          { title: 'Type', dataIndex: 'type' },
          { title: 'Active', dataIndex: 'active', render: (v: boolean) => (v ? 'Yes' : 'No') },
          createActionsColumn<{ name: string; city: string; type: string; active: boolean }>(
            () => getDemandActionItems(),
            (key, record) => handleGenericAction(key, record as Record<string, unknown>, adminActions, record.name),
          ),
        ]}
      />
      <Modal
        title="Add Zone"
        open={addOpen}
        onCancel={() => setAddOpen(false)}
        onOk={() => {
          adminActions.notify('Zone added')
          setAddOpen(false)
        }}
      >
        <Form layout="vertical" className="mt-4">
          <Form.Item label="Zone Name" required>
            <Input placeholder="Downtown" />
          </Form.Item>
          <Form.Item label="City" required>
            <Select
              placeholder="Select city"
              options={[
                { value: 'San Francisco', label: 'San Francisco' },
                { value: 'Los Angeles', label: 'Los Angeles' },
                { value: 'New York', label: 'New York' },
              ]}
            />
          </Form.Item>
          <Form.Item label="Zone Type" required>
            <Select
              options={[
                { value: 'Surge', label: 'Surge' },
                { value: 'Pricing', label: 'Pricing' },
              ]}
            />
          </Form.Item>
        </Form>
      </Modal>
      <AdminActionHost actions={adminActions} />
    </div>
  )
}

export function AirportsPanel() {
  useAirportQueueRealtime()
  const adminActions = useAdminActions()
  const { data = [], isLoading } = useGetAirportsQuery()
  const [setStatus] = useSetAirportStatusMutation()
  const [drawerAirport, setDrawerAirport] = useState<AirportRecord | null>(null)
  const [addOpen, setAddOpen] = useState(false)

  const handleAction = (key: string, record: AirportRecord) => {
    switch (key) {
      case 'view':
      case 'edit':
        setDrawerAirport(record)
        break
      case 'disable':
        adminActions.openConfirm({
          title: 'Disable Airport',
          description: `Disable queue operations at ${record.name}? All queued drivers will be removed.`,
          confirmLabel: 'Disable',
          danger: true,
          onConfirm: async () => {
            await setStatus({ id: record.id, status: 'disabled' }).unwrap()
            adminActions.notify(`${record.code} disabled`)
          },
        })
        break
      case 'delete':
        adminActions.openConfirm({
          title: 'Delete Airport',
          description: `Permanently remove ${record.name} from the platform?`,
          confirmLabel: 'Delete',
          danger: true,
          onConfirm: () => adminActions.notify(`${record.code} deleted`),
        })
        break
    }
  }

  const actionItems = (record: AirportRecord) => [
    ...getAirportQueueActionItems(record),
    { key: 'delete', label: 'Delete', icon: Trash2, danger: true, group: 2 },
  ]

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <p className="text-sm text-alygo-text-muted">
          Manage airports, queue settings, reservations, and driver rules. Open an airport to configure queue and operations.
        </p>
        <Button type="primary" onClick={() => setAddOpen(true)}>
          Add Airport
        </Button>
      </div>
      <Table
        loading={isLoading}
        rowKey="id"
        dataSource={data}
        scroll={{ x: 1000 }}
        {...createTableRowProps<AirportRecord>((record) =>
          adminActions.openDrawer(record.name, buildAirportDetailFields(record)),
        )}
        columns={[
          {
            title: 'Airport',
            dataIndex: 'name',
            render: (name: string, record: AirportRecord) => (
              <span>
                {name} <span className="text-alygo-text-muted">({record.code})</span>
              </span>
            ),
          },
          { title: 'State', dataIndex: 'state' },
          { title: 'Queue Size', dataIndex: 'queueSize', render: (n: number) => formatNumber(n) },
          {
            title: 'Status',
            dataIndex: 'status',
            render: (s: string) => (
              <Tag color={s === 'active' ? 'success' : 'default'}>
                {AIRPORT_STATUS_LABELS[s as keyof typeof AIRPORT_STATUS_LABELS] ?? s}
              </Tag>
            ),
          },
          {
            title: 'Average Wait',
            dataIndex: 'averageWaitMinutes',
            render: (m: number) => (m > 0 ? `${m} min` : '—'),
          },
          createActionsColumn<AirportRecord>(
            (record) => actionItems(record),
            (key, record) => handleAction(key, record),
          ),
        ]}
      />

      <AirportDetailsDrawer
        airport={drawerAirport}
        open={Boolean(drawerAirport)}
        onClose={() => setDrawerAirport(null)}
      />

      <Modal
        title="Add Airport"
        open={addOpen}
        onCancel={() => setAddOpen(false)}
        onOk={() => {
          adminActions.notify('Airport added')
          setAddOpen(false)
        }}
      >
        <Form layout="vertical" className="mt-4">
          <Form.Item label="Airport Code" required>
            <Input placeholder="SFO" maxLength={4} />
          </Form.Item>
          <Form.Item label="Airport Name" required>
            <Input placeholder="San Francisco International" />
          </Form.Item>
          <Form.Item label="State" required>
            <Select
              options={[
                { value: 'CA', label: 'California' },
                { value: 'NY', label: 'New York' },
                { value: 'TX', label: 'Texas' },
              ]}
            />
          </Form.Item>
        </Form>
      </Modal>

      <AdminActionHost actions={adminActions} />
    </div>
  )
}
