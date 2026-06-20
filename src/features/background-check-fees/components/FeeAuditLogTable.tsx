import { Table, Tag } from 'antd'
import { useGetBackgroundCheckFeeAuditLogsQuery } from '@/services/backgroundCheckFeeApi'

export function FeeAuditLogTable() {
  const { data = [], isLoading } = useGetBackgroundCheckFeeAuditLogsQuery()

  return (
    <>
      <p className="mb-4 text-sm text-alygo-text-muted">
        Complete audit trail of fee configuration and payment rule changes including previous values, new values, and who made each change.
      </p>
      <Table
        loading={isLoading}
        rowKey="id"
        dataSource={data}
        scroll={{ x: 1200 }}
        columns={[
          {
            title: 'Type',
            dataIndex: 'entityType',
            width: 130,
            render: (t: string) => (
              <Tag>{t === 'fee_config' ? 'Fee Config' : 'Payment Rules'}</Tag>
            ),
          },
          { title: 'Entity', dataIndex: 'entityName', ellipsis: true },
          { title: 'Field', dataIndex: 'field' },
          { title: 'Previous Value', dataIndex: 'previousValue' },
          { title: 'New Value', dataIndex: 'newValue' },
          { title: 'Changed By', dataIndex: 'changedBy' },
          {
            title: 'Timestamp',
            dataIndex: 'timestamp',
            render: (d: string) => new Date(d).toLocaleString(),
          },
        ]}
      />
    </>
  )
}
