import { useMemo, useState } from 'react'
import { Button, DatePicker, Form, Input, Modal, Radio, Select, Table, Tag } from 'antd'
import dayjs from 'dayjs'
import { Plus } from 'lucide-react'
import {
  AdminActionHost,
  ConfirmationModal,
  createActionsColumn,
} from '@/components/admin'
import { Filtering } from '@/components/shared/Filtering'
import { Pagination } from '@/components/shared/Pagination'
import { SearchingInput } from '@/components/shared/SearchingInput'
import {
  BROADCAST_AUDIENCE_OPTIONS,
  BROADCAST_DELIVERY_OPTIONS,
  BROADCAST_STATUS_OPTIONS,
  BROADCAST_TYPE_LABELS,
  BROADCAST_TYPE_OPTIONS,
  formatBroadcastAudience,
  getBroadcastActionItems,
  getBroadcastStatusColor,
  getBroadcastStatusLabel,
  getCreatedByName,
} from '@/features/communication/communicationCenterHelpers'
import { useAdminActions } from '@/hooks/useAdminActions'
import {
  useCancelBroadcastMutation,
  useCreateBroadcastMutation,
  useDeleteBroadcastMutation,
  useGetBroadcastsListQuery,
  type BroadcastDeliveryType,
  type BroadcastItem,
  type BroadcastTargetAudience,
  type BroadcastType,
  type BroadcastWritePayload,
} from '@/redux/api/broadcastsApi'
import {
  useGetServiceAreaCitiesQuery,
  useGetServiceAreaStatesQuery,
} from '@/redux/api/areaServiceApi'
import { useGetTiersListQuery } from '@/redux/api/tiersManagementsApi'
import { formatDateTime } from '@/utils/format'

interface BroadcastFormValues {
  title: string
  message: string
  type: BroadcastType
  deliveryType: BroadcastDeliveryType
  targetAudience: BroadcastTargetAudience
  cityId?: string
  stateId?: string
  tierId?: string
  scheduledAt?: dayjs.Dayjs
}

export function BroadcastsTab() {
  const adminActions = useAdminActions()
  const [page, setPage] = useState(1)
  const [limit, setLimit] = useState(10)
  const [searchTerm, setSearchTerm] = useState('')
  const [status, setStatus] = useState('')
  const [typeFilter, setTypeFilter] = useState('')
  const [modalOpen, setModalOpen] = useState(false)
  const [deleteRecord, setDeleteRecord] = useState<BroadcastItem | null>(null)
  const [form] = Form.useForm<BroadcastFormValues>()

  const { data, isLoading, isFetching } = useGetBroadcastsListQuery({
    page,
    limit,
    searchTerm,
    status: status || undefined,
    type: typeFilter || undefined,
  })

  const [createBroadcast, { isLoading: creating }] = useCreateBroadcastMutation()
  const [cancelBroadcast, { isLoading: cancelling }] = useCancelBroadcastMutation()
  const [deleteBroadcast, { isLoading: deleting }] = useDeleteBroadcastMutation()

  const deliveryType = Form.useWatch('deliveryType', form)
  const targetAudience = Form.useWatch('targetAudience', form)

  const { data: statesData } = useGetServiceAreaStatesQuery(
    { page: 1, limit: 200, status: 'active' },
    { skip: !modalOpen || targetAudience !== 'by_state' },
  )
  const { data: citiesData } = useGetServiceAreaCitiesQuery(
    { page: 1, limit: 200, status: 'active' },
    { skip: !modalOpen || targetAudience !== 'by_city' },
  )
  const { data: tiersData } = useGetTiersListQuery(
    { page: 1, limit: 100, status: 'active' },
    { skip: !modalOpen || targetAudience !== 'by_tier' },
  )

  const rows = data?.data ?? []
  const meta = data?.meta

  const stateOptions = useMemo(
    () => (statesData?.data ?? []).map((item) => ({ label: item.name, value: item.id })),
    [statesData?.data],
  )
  const cityOptions = useMemo(
    () => (citiesData?.data ?? []).map((item) => ({ label: item.name, value: item.id })),
    [citiesData?.data],
  )
  const tierOptions = useMemo(
    () => (tiersData?.data ?? []).map((item) => ({ label: item.name, value: item._id })),
    [tiersData?.data],
  )

  const openCreate = () => {
    form.resetFields()
    form.setFieldsValue({
      deliveryType: 'immediate',
      type: 'platform_update',
      targetAudience: 'all_drivers',
      scheduledAt: dayjs().add(1, 'hour'),
    })
    setModalOpen(true)
  }

  const handleAction = async (key: string, record: BroadcastItem) => {
    switch (key) {
      case 'cancel': {
        try {
          await cancelBroadcast(record._id).unwrap()
          adminActions.notify('Broadcast cancelled', record.title)
        } catch {
          adminActions.notify('Unable to cancel broadcast', record.title)
        }
        break
      }
      case 'delete':
        setDeleteRecord(record)
        break
    }
  }

  const buildPayload = (values: BroadcastFormValues): BroadcastWritePayload => {
    const payload: BroadcastWritePayload = {
      title: values.title.trim(),
      message: values.message.trim(),
      type: values.type,
      deliveryType: values.deliveryType,
      targetAudience: values.targetAudience,
    }

    if (values.deliveryType === 'scheduled' && values.scheduledAt) {
      payload.scheduledAt = values.scheduledAt.toISOString()
    }

    if (values.targetAudience === 'by_city' && values.cityId) {
      payload.targetFilters = { city: values.cityId }
    } else if (values.targetAudience === 'by_state' && values.stateId) {
      payload.targetFilters = { state: values.stateId }
    } else if (values.targetAudience === 'by_tier' && values.tierId) {
      payload.targetFilters = { tier: values.tierId }
    }

    return payload
  }

  const handleCreate = async () => {
    const values = await form.validateFields()
    try {
      const payload = buildPayload(values)
      await createBroadcast(payload).unwrap()
      adminActions.notify(
        values.deliveryType === 'immediate' ? 'Broadcast sent' : 'Broadcast scheduled',
        values.title,
      )
      setModalOpen(false)
    } catch {
      adminActions.notify('Unable to create broadcast', values.title)
    }
  }

  return (
    <>
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-wrap items-center gap-3">
          <SearchingInput
            value={searchTerm}
            onChange={(value) => {
              setSearchTerm(value)
              setPage(1)
            }}
            placeholder="Search broadcasts..."
          />
          <Filtering
            variant="inline"
            fields={[
              {
                key: 'status',
                placeholder: 'Filter by status',
                options: BROADCAST_STATUS_OPTIONS,
                value: status,
                minWidth: 160,
                onChange: (value) => {
                  setStatus(value)
                  setPage(1)
                },
              },
              {
                key: 'type',
                placeholder: 'Filter by type',
                options: [...BROADCAST_TYPE_OPTIONS],
                value: typeFilter,
                minWidth: 180,
                onChange: (value) => {
                  setTypeFilter(value)
                  setPage(1)
                },
              },
            ]}
          />
        </div>
        <Button type="primary" icon={<Plus className="h-4 w-4" />} onClick={openCreate}>
          Create Broadcast
        </Button>
      </div>

      <Table
        loading={isLoading || isFetching || creating || cancelling}
        rowKey="_id"
        dataSource={rows}
        pagination={false}
        scroll={{ x: 1100 }}
        locale={{ emptyText: 'No broadcasts found' }}
        columns={[
          { title: 'Title', dataIndex: 'title', ellipsis: true },
          {
            title: 'Type',
            dataIndex: 'type',
            width: 160,
            render: (type: BroadcastType) => BROADCAST_TYPE_LABELS[type] ?? type,
          },
          {
            title: 'Audience',
            width: 150,
            render: (_: unknown, record: BroadcastItem) => formatBroadcastAudience(record),
          },
          {
            title: 'Delivery',
            dataIndex: 'deliveryType',
            width: 120,
            render: (value: string) =>
              value === 'scheduled' ? 'Scheduled' : 'Immediate',
          },
          {
            title: 'Recipients',
            dataIndex: 'recipientCount',
            width: 110,
            render: (count?: number) => count ?? 0,
          },
          {
            title: 'Created By',
            width: 160,
            ellipsis: true,
            render: (_: unknown, record: BroadcastItem) => getCreatedByName(record),
          },
          {
            title: 'Sent / Scheduled',
            width: 170,
            render: (_: unknown, record: BroadcastItem) => {
              const when = record.sentAt || record.scheduledAt || record.createdAt
              return when ? formatDateTime(when) : '—'
            },
          },
          {
            title: 'Status',
            dataIndex: 'status',
            width: 120,
            render: (s: string) => (
              <Tag color={getBroadcastStatusColor(s)}>{getBroadcastStatusLabel(s)}</Tag>
            ),
          },
          createActionsColumn<BroadcastItem>(
            (record) => getBroadcastActionItems(record.status),
            (key, record) => void handleAction(key, record),
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
        title="Create Broadcast"
        open={modalOpen}
        confirmLoading={creating}
        okText={deliveryType === 'immediate' ? 'Send Now' : 'Schedule'}
        cancelText="Cancel"
        onCancel={() => setModalOpen(false)}
        onOk={() => void handleCreate()}
        destroyOnClose
        width={560}
      >
        <Form form={form} layout="vertical" className="mt-4">
          <Form.Item
            name="deliveryType"
            label="Delivery"
            rules={[{ required: true, message: 'Select delivery type' }]}
          >
            <Radio.Group options={[...BROADCAST_DELIVERY_OPTIONS]} />
          </Form.Item>

          <Form.Item
            name="title"
            label="Title"
            rules={[{ required: true, message: 'Enter a title' }]}
          >
            <Input placeholder="e.g. Platform Update" />
          </Form.Item>

          <Form.Item
            name="message"
            label="Message"
            rules={[{ required: true, message: 'Enter a message' }]}
          >
            <Input.TextArea rows={4} placeholder="Broadcast message..." />
          </Form.Item>

          <Form.Item
            name="type"
            label="Broadcast Type"
            rules={[{ required: true, message: 'Select a type' }]}
          >
            <Select options={[...BROADCAST_TYPE_OPTIONS]} />
          </Form.Item>

          <Form.Item
            name="targetAudience"
            label="Target Audience"
            rules={[{ required: true, message: 'Select an audience' }]}
          >
            <Select
              options={[...BROADCAST_AUDIENCE_OPTIONS]}
              onChange={() => {
                form.setFieldsValue({ cityId: undefined, stateId: undefined, tierId: undefined })
              }}
            />
          </Form.Item>

          {targetAudience === 'by_city' && (
            <Form.Item
              name="cityId"
              label="City"
              rules={[{ required: true, message: 'Select a city' }]}
            >
              <Select
                showSearch
                optionFilterProp="label"
                options={cityOptions}
                placeholder="Select city"
              />
            </Form.Item>
          )}

          {targetAudience === 'by_state' && (
            <Form.Item
              name="stateId"
              label="State"
              rules={[{ required: true, message: 'Select a state' }]}
            >
              <Select
                showSearch
                optionFilterProp="label"
                options={stateOptions}
                placeholder="Select state"
              />
            </Form.Item>
          )}

          {targetAudience === 'by_tier' && (
            <Form.Item
              name="tierId"
              label="Tier"
              rules={[{ required: true, message: 'Select a tier' }]}
            >
              <Select
                showSearch
                optionFilterProp="label"
                options={tierOptions}
                placeholder="Select tier"
              />
            </Form.Item>
          )}

          {deliveryType === 'scheduled' && (
            <Form.Item
              name="scheduledAt"
              label="Scheduled At"
              rules={[{ required: true, message: 'Select schedule time' }]}
            >
              <DatePicker showTime className="w-full" />
            </Form.Item>
          )}
        </Form>
      </Modal>

      <ConfirmationModal
        open={Boolean(deleteRecord)}
        title="Delete Broadcast"
        description={`Delete "${deleteRecord?.title}"?`}
        confirmLabel="Delete"
        danger
        loading={deleting}
        onCancel={() => setDeleteRecord(null)}
        onConfirm={async () => {
          if (!deleteRecord) return
          try {
            await deleteBroadcast(deleteRecord._id).unwrap()
            adminActions.notify('Broadcast deleted', deleteRecord.title)
            setDeleteRecord(null)
          } catch {
            adminActions.notify('Unable to delete broadcast', deleteRecord.title)
          }
        }}
      />

      <AdminActionHost actions={adminActions} />
    </>
  )
}
