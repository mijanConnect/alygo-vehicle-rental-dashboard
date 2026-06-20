import { Table } from 'antd'
import { useGetStateActivationAuditLogsQuery } from '@/services/stateActivationApi'

export function StateAuditLogTable() {
  const { data = [], isLoading } = useGetStateActivationAuditLogsQuery()

  return (
    <>
      <p className="mb-4 text-sm text-alygo-text-muted">
        Complete audit trail of state activation changes including previous values, new values, and who made each change.
      </p>
      <Table
        loading={isLoading}
        rowKey="id"
        dataSource={data}
        scroll={{ x: 1100 }}
        columns={[
          { title: 'State', dataIndex: 'stateName' },
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
