import { useEffect, useMemo, useState } from 'react'
import { Button, Form, Input, InputNumber, Modal, Select, Table } from 'antd'
import { Pencil, Plus, Power, PowerOff, Trash2 } from 'lucide-react'
import {
  AdminActionHost,
  createActionsColumn,
} from '@/components/admin'
import type { ActionMenuItem } from '@/components/admin/types'
import { StatusBadge } from '@/components/common/StatusBadge'
import { Pagination } from '@/components/shared/Pagination'
import { SearchingInput } from '@/components/shared/SearchingInput'
import {
  buildDutyPolicyWritePayload,
  defaultDutyPolicyFormValues,
  dutyPolicyToFormValues,
  formatDutyPolicyScopeLabel,
  type DutyPolicyFormValues,
} from '@/features/driving-hours/mapDutyPolicy'
import { useAdminActions } from '@/hooks/useAdminActions'
import {
  useGetServiceAreaAirportsQuery,
  useGetServiceAreaCitiesQuery,
  useGetServiceAreaStatesQuery,
  useGetServiceAreaZonesQuery,
} from '@/redux/api/areaServiceApi'
import {
  useCreateDriverDutyPolicyMutation,
  useDeleteDriverDutyPolicyMutation,
  useGetDriverDutyPoliciesQuery,
  useUpdateDriverDutyPolicyMutation,
  useUpdateDriverDutyPolicyStatusMutation,
} from '@/redux/api/drivingHoursApi'
import type {
  DutyPolicyItem,
  DutyPolicyScopeType,
  DutyPolicyStatus,
} from '@/redux/api/drivingHoursApi'
import { formatDateTime } from '@/utils/format'

const STATUS_OPTIONS = [
  { label: 'Active', value: 'active' },
  { label: 'Inactive', value: 'inactive' },
]

interface DutyPolicyPanelProps {
  scopeType: DutyPolicyScopeType
}

export function DutyPolicyPanel({ scopeType }: DutyPolicyPanelProps) {
  const adminActions = useAdminActions()
  const [page, setPage] = useState(1)
  const [limit, setLimit] = useState(10)
  const [searchTerm, setSearchTerm] = useState('')
  const [status, setStatus] = useState('')
  const [modalOpen, setModalOpen] = useState(false)
  const [editRecord, setEditRecord] = useState<DutyPolicyItem | null>(null)
  const [form] = Form.useForm<DutyPolicyFormValues>()

  const selectedStateId = Form.useWatch('stateId', form)
  const selectedCityId = Form.useWatch('cityId', form)

  const { data, isLoading, isFetching } = useGetDriverDutyPoliciesQuery({
    page,
    limit,
    searchTerm,
    status: status || undefined,
    scopeType,
  })

  const { data: statesData } = useGetServiceAreaStatesQuery(
    { page: 1, limit: 100 },
    { skip: scopeType !== 'state' && scopeType !== 'city' && scopeType !== 'zone' && scopeType !== 'airport' },
  )
  const { data: citiesData } = useGetServiceAreaCitiesQuery(
    { page: 1, limit: 100, stateId: selectedStateId },
    { skip: scopeType !== 'city' && scopeType !== 'zone' && scopeType !== 'airport' },
  )
  const { data: zonesData } = useGetServiceAreaZonesQuery(
    { page: 1, limit: 100, cityId: selectedCityId },
    { skip: scopeType !== 'zone' },
  )
  const { data: airportsData } = useGetServiceAreaAirportsQuery(
    { page: 1, limit: 100, cityId: selectedCityId },
    { skip: scopeType !== 'airport' },
  )

  const [createPolicy, { isLoading: creating }] = useCreateDriverDutyPolicyMutation()
  const [updatePolicy, { isLoading: updating }] = useUpdateDriverDutyPolicyMutation()
  const [updateStatus, { isLoading: updatingStatus }] = useUpdateDriverDutyPolicyStatusMutation()
  const [deletePolicy, { isLoading: deleting }] = useDeleteDriverDutyPolicyMutation()

  const rows = data?.data ?? []
  const meta = data?.meta

  const stateOptions = useMemo(
    () => (statesData?.data ?? []).map((item) => ({ value: item.id, label: item.name })),
    [statesData?.data],
  )
  const cityOptions = useMemo(
    () => (citiesData?.data ?? []).map((item) => ({ value: item.id, label: item.name })),
    [citiesData?.data],
  )
  const zoneOptions = useMemo(
    () => (zonesData?.data ?? []).map((item) => ({ value: item.id, label: item.name })),
    [zonesData?.data],
  )
  const airportOptions = useMemo(
    () => (airportsData?.data ?? []).map((item) => ({ value: item.id, label: item.name })),
    [airportsData?.data],
  )

  useEffect(() => {
    setPage(1)
    setSearchTerm('')
    setStatus('')
  }, [scopeType])

  const openCreate = () => {
    setEditRecord(null)
    form.resetFields()
    form.setFieldsValue(defaultDutyPolicyFormValues(scopeType))
    setModalOpen(true)
  }

  const openEdit = (record: DutyPolicyItem) => {
    setEditRecord(record)
    form.setFieldsValue(dutyPolicyToFormValues(record))
    setModalOpen(true)
  }

  const handleSave = async () => {
    const values = await form.validateFields()
    const payload = buildDutyPolicyWritePayload(values, scopeType)

    try {
      if (editRecord) {
        await updatePolicy({ id: editRecord._id, body: payload }).unwrap()
        adminActions.notify('Policy updated', payload.name)
      } else {
        await createPolicy(payload).unwrap()
        adminActions.notify('Policy created', payload.name)
      }
      setModalOpen(false)
      setEditRecord(null)
    } catch (err) {
      adminActions.notify('Unable to save policy', String(err))
    }
  }

  const toggleStatus = async (record: DutyPolicyItem) => {
    const next: DutyPolicyStatus = record.status === 'active' ? 'inactive' : 'active'
    try {
      await updateStatus({ id: record._id, status: next }).unwrap()
      adminActions.notify(
        next === 'active' ? 'Policy activated' : 'Policy deactivated',
        record.name,
      )
    } catch (err) {
      adminActions.notify('Unable to update status', String(err))
    }
  }

  const confirmDelete = (record: DutyPolicyItem) => {
    adminActions.openConfirm({
      title: 'Delete Duty Policy',
      description: `Delete policy "${record.name}"?`,
      confirmLabel: 'Delete',
      danger: true,
      onConfirm: async () => {
        try {
          await deletePolicy({ id: record._id, scopeType }).unwrap()
          adminActions.notify('Policy deleted', record.name)
        } catch (err) {
          adminActions.notify('Unable to delete policy', String(err))
        }
      },
    })
  }

  const actionItems = (record: DutyPolicyItem): ActionMenuItem[] => [
    { key: 'edit', label: 'Edit', icon: Pencil, group: 1 },
    {
      key: 'toggle',
      label: record.status === 'active' ? 'Deactivate' : 'Activate',
      icon: record.status === 'active' ? PowerOff : Power,
      group: 1,
    },
    { key: 'delete', label: 'Delete', icon: Trash2, danger: true, group: 2 },
  ]

  const scopeColumnTitle =
    scopeType === 'global'
      ? 'Scope'
      : scopeType.charAt(0).toUpperCase() + scopeType.slice(1)

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
        <div className="flex flex-wrap items-center gap-3">
          <SearchingInput
            value={searchTerm}
            onChange={(value) => {
              setSearchTerm(value)
              setPage(1)
            }}
            placeholder={`Search ${scopeType} policies...`}
          />
          <Select
            allowClear
            placeholder="Filter by status"
            className="!min-w-[160px]"
            value={status || undefined}
            options={STATUS_OPTIONS}
            onChange={(value) => {
              setStatus(value ?? '')
              setPage(1)
            }}
          />
        </div>
        <Button type="primary" icon={<Plus className="h-4 w-4" />} onClick={openCreate}>
          Create Policy
        </Button>
      </div>

      <Table
        loading={isLoading || isFetching || creating || updating || updatingStatus || deleting}
        rowKey="_id"
        dataSource={rows}
        pagination={false}
        scroll={{ x: 1200 }}
        columns={[
          { title: 'Policy Name', dataIndex: 'name' },
          {
            title: scopeColumnTitle,
            render: (_: unknown, record: DutyPolicyItem) => formatDutyPolicyScopeLabel(record),
          },
          {
            title: 'Max Hours/Day',
            dataIndex: 'maxDrivingHoursPerDay',
            render: (v: number) => `${v}h`,
          },
          {
            title: 'Continuous',
            dataIndex: 'maxContinuousDrivingHours',
            render: (v: number) => `${v}h`,
          },
          {
            title: 'Break',
            render: (_: unknown, record: DutyPolicyItem) =>
              `${record.breakAfterHours}h / ${record.breakDurationMinutes}m`,
          },
          {
            title: 'Max Trips',
            dataIndex: 'maxTripsPerDay',
          },
          {
            title: 'Min Rest',
            dataIndex: 'minimumRestHours',
            render: (v: number) => `${v}h`,
          },
          {
            title: 'Status',
            dataIndex: 'status',
            render: (s: string) => <StatusBadge status={s} />,
          },
          {
            title: 'Updated',
            dataIndex: 'updatedAt',
            render: (d?: string) => (d ? formatDateTime(d) : '—'),
          },
          createActionsColumn<DutyPolicyItem>(
            (record) => actionItems(record),
            (key, record) => {
              if (key === 'edit') openEdit(record)
              else if (key === 'toggle') void toggleStatus(record)
              else if (key === 'delete') confirmDelete(record)
            },
          ),
        ]}
      />

      <Pagination
        currentPage={meta?.page ?? page}
        totalPages={Math.max(meta?.totalPages ?? 1, 1)}
        totalItems={meta?.totalItems ?? 0}
        itemsPerPage={meta?.limit ?? limit}
        onPageChange={setPage}
        onItemsPerPageChange={(size) => {
          setLimit(size)
          setPage(1)
        }}
      />

      <Modal
        title={editRecord ? `Edit Policy — ${editRecord.name}` : `Create ${scopeColumnTitle} Policy`}
        open={modalOpen}
        confirmLoading={creating || updating}
        onCancel={() => {
          setModalOpen(false)
          setEditRecord(null)
        }}
        onOk={handleSave}
        destroyOnClose
        width={640}
      >
        <Form form={form} layout="vertical" className="mt-4">
          <Form.Item name="name" label="Policy Name" rules={[{ required: true }]}>
            <Input placeholder="e.g. Buffalo Airport Driver Duty Policy" />
          </Form.Item>

          {scopeType === 'state' && (
            <Form.Item name="stateId" label="State" rules={[{ required: true }]}>
              <Select showSearch optionFilterProp="label" options={stateOptions} />
            </Form.Item>
          )}

          {(scopeType === 'city' || scopeType === 'zone' || scopeType === 'airport') && (
            <>
              <Form.Item name="stateId" label="State" rules={[{ required: true }]}>
                <Select
                  showSearch
                  optionFilterProp="label"
                  options={stateOptions}
                  onChange={() => {
                    form.setFieldsValue({ cityId: undefined, zoneId: undefined, airportId: undefined })
                  }}
                />
              </Form.Item>
              <Form.Item name="cityId" label="City" rules={[{ required: true }]}>
                <Select
                  showSearch
                  optionFilterProp="label"
                  options={cityOptions}
                  onChange={() => {
                    form.setFieldsValue({ zoneId: undefined, airportId: undefined })
                  }}
                />
              </Form.Item>
            </>
          )}

          {scopeType === 'zone' && (
            <Form.Item name="zoneId" label="Zone" rules={[{ required: true }]}>
              <Select showSearch optionFilterProp="label" options={zoneOptions} />
            </Form.Item>
          )}

          {scopeType === 'airport' && (
            <Form.Item name="airportId" label="Airport" rules={[{ required: true }]}>
              <Select showSearch optionFilterProp="label" options={airportOptions} />
            </Form.Item>
          )}

          <div className="grid grid-cols-1 gap-0 sm:grid-cols-2 sm:gap-4">
            <Form.Item
              name="maxDrivingHoursPerDay"
              label="Max Driving Hours / Day"
              rules={[{ required: true, message: 'Required' }]}
            >
              <InputNumber min={0} max={24} className="w-full" addonAfter="hours" placeholder="0" />
            </Form.Item>
            <Form.Item
              name="maxContinuousDrivingHours"
              label="Max Continuous Hours"
              rules={[{ required: true, message: 'Required' }]}
            >
              <InputNumber min={0} max={24} className="w-full" addonAfter="hours" placeholder="0" />
            </Form.Item>
            <Form.Item
              name="breakAfterHours"
              label="Break After"
              rules={[{ required: true, message: 'Required' }]}
            >
              <InputNumber min={0} max={24} className="w-full" addonAfter="hours" placeholder="0" />
            </Form.Item>
            <Form.Item
              name="breakDurationMinutes"
              label="Break Duration"
              rules={[{ required: true, message: 'Required' }]}
            >
              <InputNumber min={0} max={240} className="w-full" addonAfter="min" placeholder="0" />
            </Form.Item>
            <Form.Item
              name="maxTripsPerDay"
              label="Max Trips / Day"
              rules={[{ required: true, message: 'Required' }]}
            >
              <InputNumber min={0} max={200} className="w-full" placeholder="0" />
            </Form.Item>
            <Form.Item
              name="minimumRestHours"
              label="Minimum Rest"
              rules={[{ required: true, message: 'Required' }]}
            >
              <InputNumber min={0} max={24} className="w-full" addonAfter="hours" placeholder="0" />
            </Form.Item>
          </div>
        </Form>
      </Modal>

      <AdminActionHost actions={adminActions} />
    </div>
  )
}
