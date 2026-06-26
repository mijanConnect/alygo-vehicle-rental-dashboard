import { useEffect, useState } from 'react'
import { Select, Table, Tag } from 'antd'
import { createActionsColumn, createTableRowProps } from '@/components/admin'
import { TableFilters } from '@/components/common/TableFilters'
import { CommunicationConversationDrawer } from '@/features/communication/components/CommunicationConversationDrawer'
import {
  getInboxActionItems,
  priorityColor,
  priorityLabel,
  statusColor,
  statusLabel,
  typeColor,
} from '@/features/communication/communicationCenterHelpers'
import {
  INBOX_PRIORITY_FILTER_OPTIONS,
  INBOX_STATUS_FILTER_OPTIONS,
  INBOX_TYPE_FILTER_OPTIONS,
} from '@/features/communication/communicationNavigation'
import {
  COMMUNICATION_TYPE_LABELS,
  useGetCommunicationInboxQuery,
} from '@/services/communicationApi'
import type { CommunicationInboxItem, CommunicationInboxType } from '@/types/communication'
import { formatRelativeActivity } from '@/features/communication/communicationHelpers'
import { formatDateTime } from '@/utils/format'

const PAGE_SIZE = 10

interface CommunicationInboxTabProps {
  initialType?: string
}

export function CommunicationInboxTab({ initialType = '' }: CommunicationInboxTabProps) {
  const [page, setPage] = useState(1)
  const [search, setSearch] = useState('')
  const [typeFilter, setTypeFilter] = useState(initialType)
  const [statusFilter, setStatusFilter] = useState('')
  const [priorityFilter, setPriorityFilter] = useState('')
  const [selected, setSelected] = useState<CommunicationInboxItem | null>(null)
  const [drawerOpen, setDrawerOpen] = useState(false)

  useEffect(() => {
    setTypeFilter(initialType)
    setPage(1)
  }, [initialType])

  const { data, isLoading } = useGetCommunicationInboxQuery({
    page,
    pageSize: PAGE_SIZE,
    search,
    communicationType: typeFilter,
    status: statusFilter,
    priority: priorityFilter,
  })

  const openDrawer = (record: CommunicationInboxItem) => {
    setSelected(record)
    setDrawerOpen(true)
  }

  const resetPage = () => setPage(1)

  return (
    <>
      <div className="mb-4 flex flex-col gap-3">
        <TableFilters
          variant="inline"
          search={search}
          onSearchChange={(value) => {
            setSearch(value)
            resetPage()
          }}
          searchPlaceholder="Search user, ticket ID, or subject..."
        />
        <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-center">
          <Select
            value={typeFilter || undefined}
            placeholder="Type: All"
            allowClear
            className="min-w-40!"
            options={[...INBOX_TYPE_FILTER_OPTIONS]}
            onChange={(value) => {
              setTypeFilter(value ?? '')
              resetPage()
            }}
          />
          <Select
            value={statusFilter || undefined}
            placeholder="Status: All"
            allowClear
            className="min-w-40!"
            options={[...INBOX_STATUS_FILTER_OPTIONS]}
            onChange={(value) => {
              setStatusFilter(value ?? '')
              resetPage()
            }}
          />
          <Select
            value={priorityFilter || undefined}
            placeholder="Priority: All"
            allowClear
            className="min-w-40!"
            options={[...INBOX_PRIORITY_FILTER_OPTIONS]}
            onChange={(value) => {
              setPriorityFilter(value ?? '')
              resetPage()
            }}
          />
        </div>
      </div>
      <Table
        loading={isLoading}
        rowKey="id"
        dataSource={data?.data ?? []}
        scroll={{ x: 1100 }}
        pagination={{
          current: page,
          total: data?.total ?? 0,
          pageSize: PAGE_SIZE,
          onChange: setPage,
          showSizeChanger: false,
        }}
        {...createTableRowProps<CommunicationInboxItem>(openDrawer)}
        columns={[
          {
            title: 'User / Group',
            dataIndex: 'userOrGroup',
            render: (name: string, record: CommunicationInboxItem) => (
              <span>
                {name}
                {record.unreadCount > 0 && (
                  <Tag color="processing" className="ml-2">
                    {record.unreadCount} new
                  </Tag>
                )}
              </span>
            ),
          },
          {
            title: 'Type',
            dataIndex: 'communicationType',
            width: 120,
            render: (t: CommunicationInboxType) => (
              <Tag color={typeColor(t)}>{COMMUNICATION_TYPE_LABELS[t] ?? t}</Tag>
            ),
          },
          { title: 'Subject', dataIndex: 'subject', ellipsis: true },
          {
            title: 'Priority',
            dataIndex: 'priority',
            width: 110,
            render: (p: string) => <Tag color={priorityColor(p)}>{priorityLabel(p)}</Tag>,
          },
          {
            title: 'Last Activity',
            dataIndex: 'lastActivity',
            width: 140,
            render: (d: string) => (
              <span title={formatDateTime(d)}>{formatRelativeActivity(d)}</span>
            ),
          },
          {
            title: 'Status',
            dataIndex: 'status',
            width: 130,
            render: (s: string) => <Tag color={statusColor(s)}>{statusLabel(s)}</Tag>,
          },
          createActionsColumn<CommunicationInboxItem>(
            () => getInboxActionItems(),
            (key, record) => {
              if (key === 'view') openDrawer(record)
            },
          ),
        ]}
      />
      <CommunicationConversationDrawer
        item={selected}
        open={drawerOpen}
        onClose={() => {
          setDrawerOpen(false)
          setSelected(null)
        }}
      />
    </>
  )
}
