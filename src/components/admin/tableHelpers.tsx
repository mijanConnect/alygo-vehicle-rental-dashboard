import type { ColumnsType } from 'antd/es/table'
import type { TableProps } from 'antd'
import { ActionMenu } from '@/components/admin/ActionMenu'
import type { ActionMenuItem } from '@/components/admin/types'

export function createActionsColumn<T>(
  getItems: (record: T) => ActionMenuItem[],
  onAction: (key: string, record: T) => void,
): ColumnsType<T>[number] {
  return {
    title: 'Actions',
    key: 'actions',
    fixed: 'right',
    width: 80,
    align: 'center',
    render: (_, record) => (
      <ActionMenu items={getItems(record)} onAction={(key) => onAction(key, record)} />
    ),
  }
}

export function createTableRowProps<T>(
  onOpenDetails: (record: T) => void,
): Pick<TableProps<T>, 'rowClassName' | 'onRow'> {
  return {
    rowClassName: () => 'cursor-pointer',
    onRow: (record) => ({
      onClick: () => onOpenDetails(record),
    }),
  }
}
