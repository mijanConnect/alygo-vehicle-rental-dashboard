import { useState } from 'react'
import { Form, InputNumber, Modal, Select, Table, Tag } from 'antd'
import {
  AdminActionHost,
  createActionsColumn,
  createTableRowProps,
} from '@/components/admin'
import { useAdminActions } from '@/hooks/useAdminActions'
import {
  AIRPORT_STATUS_LABELS,
  useGetAirportsQuery,
  useSetAirportStatusMutation,
  useUpdateAirportMutation,
} from '@/services/airportQueueApi'
import type { AirportRecord } from '@/types/airportQueue'
import {
  buildAirportDetailFields,
  getAirportActionItems,
} from '@/features/airport-queue/airportQueueHelpers'
import { formatNumber } from '@/utils/format'

export function AirportTable() {
  const adminActions = useAdminActions()
  const { data = [], isLoading } = useGetAirportsQuery()
  const [editRecord, setEditRecord] = useState<AirportRecord | null>(null)
  const [updateAirport, { isLoading: updating }] = useUpdateAirportMutation()
  const [setStatus] = useSetAirportStatusMutation()

  const handleAction = (key: string, record: AirportRecord) => {
    switch (key) {
      case 'view':
        adminActions.openDrawer(record.name, buildAirportDetailFields(record))
        break
      case 'edit':
        setEditRecord(record)
        break
      case 'disable':
        adminActions.openConfirm({
          title: 'Disable Airport Queue',
          description: `Disable queue operations at ${record.name}? All queued drivers will be removed.`,
          confirmLabel: 'Disable',
          danger: true,
          onConfirm: async () => {
            await setStatus({ id: record.id, status: 'disabled' }).unwrap()
            adminActions.notify(`${record.code} queue disabled`)
          },
        })
        break
    }
  }

  return (
    <>
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
              <span>{name} <span className="text-alygo-text-muted">({record.code})</span></span>
            ),
          },
          { title: 'State', dataIndex: 'state' },
          { title: 'Queue Size', dataIndex: 'queueSize', render: (n: number) => formatNumber(n) },
          {
            title: 'Status',
            dataIndex: 'status',
            render: (s: string) => (
              <Tag color={s === 'active' ? 'success' : 'default'}>{AIRPORT_STATUS_LABELS[s as keyof typeof AIRPORT_STATUS_LABELS] ?? s}</Tag>
            ),
          },
          {
            title: 'Average Wait',
            dataIndex: 'averageWaitMinutes',
            render: (m: number) => (m > 0 ? `${m} min` : '—'),
          },
          createActionsColumn<AirportRecord>(
            (record) => getAirportActionItems(record),
            (key, record) => handleAction(key, record),
          ),
        ]}
      />

      {editRecord && (
        <Modal
          title={`Edit Airport — ${editRecord.code}`}
          open
          confirmLoading={updating}
          onCancel={() => setEditRecord(null)}
          onOk={() => {
            document.getElementById('airport-edit-form')?.dispatchEvent(
              new Event('submit', { cancelable: true, bubbles: true }),
            )
          }}
          destroyOnClose
        >
          <Form
            id="airport-edit-form"
            layout="vertical"
            className="mt-4"
            initialValues={editRecord}
            onFinish={async (values) => {
              await updateAirport({ id: editRecord.id, ...values }).unwrap()
              adminActions.notify(`${editRecord.code} updated`)
              setEditRecord(null)
            }}
          >
            <Form.Item name="status" label="Status" rules={[{ required: true }]}>
              <Select options={[{ value: 'active', label: 'Active' }, { value: 'disabled', label: 'Disabled' }]} />
            </Form.Item>
            <Form.Item name="averageWaitMinutes" label="Average Wait (minutes)" rules={[{ required: true }]}>
              <InputNumber min={0} className="w-full" />
            </Form.Item>
            <button type="submit" className="hidden" />
          </Form>
        </Modal>
      )}

      <AdminActionHost actions={adminActions} />
    </>
  )
}
