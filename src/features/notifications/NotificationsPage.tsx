import { useState } from 'react'
import { Button, Table, Tag } from 'antd'
import { CheckCheck } from 'lucide-react'
import { PageShell } from '@/components/common/PageShell'
import { Pagination } from '@/components/shared/Pagination'
import { SearchingInput } from '@/components/shared/SearchingInput'
import { useDocumentTitle } from '@/hooks/useDocumentTitle'
import {
  useGetNotificationsListQuery,
  useMarkAllNotificationsReadMutation,
  useMarkNotificationReadMutation,
  type AdminNotificationItem,
} from '@/redux/api/notificationApi'
import { formatDateTime } from '@/utils/format'

export default function NotificationsPage() {
  useDocumentTitle('Notifications')

  const [page, setPage] = useState(1)
  const [limit, setLimit] = useState(10)
  const [searchTerm, setSearchTerm] = useState('')

  const { data, isLoading, isFetching } = useGetNotificationsListQuery({
    page,
    limit,
    ...(searchTerm.trim() ? { searchTerm: searchTerm.trim() } : {}),
  })
  const [markRead] = useMarkNotificationReadMutation()
  const [markAllRead, { isLoading: markingAll }] = useMarkAllNotificationsReadMutation()

  const rows = data?.data ?? []
  const meta = data?.meta
  const hasUnread = rows.some((item) => !item.read)

  const handleRowClick = async (record: AdminNotificationItem) => {
    if (record.read) return
    try {
      await markRead(record.id).unwrap()
    } catch {
      // ignore — list still shows current state
    }
  }

  const handleReadAll = async () => {
    try {
      await markAllRead().unwrap()
    } catch {
      // ignore — list still shows current state
    }
  }

  return (
    <PageShell
      title="Notifications"
      description="All admin notifications from the platform."
    >
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <SearchingInput
          value={searchTerm}
          onChange={(value) => {
            setSearchTerm(value)
            setPage(1)
          }}
          placeholder="Search notifications..."
        />
        <Button
          type="primary"
          icon={<CheckCheck className="h-4 w-4" />}
          loading={markingAll}
          disabled={!hasUnread}
          onClick={() => void handleReadAll()}
        >
          Read All
        </Button>
      </div>

      <div className="glass-card p-4">
        <Table
          loading={isLoading || isFetching || markingAll}
          rowKey="id"
          dataSource={rows}
          pagination={false}
          scroll={{ x: 900 }}
          locale={{ emptyText: 'No notifications found' }}
          onRow={(record) => ({
            onClick: () => void handleRowClick(record),
            className: 'cursor-pointer',
          })}
          columns={[
            {
              title: 'Title',
              dataIndex: 'title',
              ellipsis: true,
              render: (title: string, record: AdminNotificationItem) => (
                <div className="flex items-center gap-2">
                  <span className={record.read ? 'text-alygo-text-muted' : 'text-white font-medium'}>
                    {title}
                  </span>
                  {!record.read && <Tag color="blue">New</Tag>}
                </div>
              ),
            },
            {
              title: 'Message',
              dataIndex: 'message',
              ellipsis: true,
            },
            {
              title: 'Category',
              dataIndex: 'category',
              width: 140,
              render: (value?: string) => value || '—',
            },
            {
              title: 'Status',
              dataIndex: 'read',
              width: 110,
              render: (read: boolean) => (
                <Tag color={read ? 'default' : 'processing'}>{read ? 'Read' : 'Unread'}</Tag>
              ),
            },
            {
              title: 'Received',
              dataIndex: 'createdAt',
              width: 180,
              render: (d?: string) => (d ? formatDateTime(d) : '—'),
            },
          ]}
        />
      </div>

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
    </PageShell>
  )
}
