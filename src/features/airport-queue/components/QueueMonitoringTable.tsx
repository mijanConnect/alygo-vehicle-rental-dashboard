import { useState } from 'react'
import { Select, Table, Tag } from 'antd'
import { useGetAirportsQuery, useGetQueueDriversQuery } from '@/services/airportQueueApi'
import { TIER_LABELS } from '@/services/mock/airportQueueData'

const tierColors: Record<string, string> = {
  journey: 'default',
  pro_go: 'blue',
  elite: 'cyan',
  platinum: 'purple',
  diamond: 'gold',
}

export function QueueMonitoringTable() {
  const { data: airports = [] } = useGetAirportsQuery()
  const [airportFilter, setAirportFilter] = useState<string | undefined>(undefined)
  const { data = [], isLoading, isFetching } = useGetQueueDriversQuery(airportFilter)

  const activeAirports = airports.filter((a) => a.status === 'active')

  return (
    <>
      <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <p className="text-sm text-alygo-text-muted">
          Live driver queue across airport staging areas. Updates in real time via Socket.IO.
        </p>
        <Select
          allowClear
          placeholder="Filter by airport"
          className="w-full sm:w-56"
          value={airportFilter}
          onChange={setAirportFilter}
          options={activeAirports.map((a) => ({ value: a.id, label: `${a.code} — ${a.name}` }))}
        />
      </div>

      <Table
        loading={isLoading || isFetching}
        rowKey="id"
        dataSource={data}
        scroll={{ x: 900 }}
        columns={[
          { title: 'Position', dataIndex: 'position', width: 90 },
          {
            title: 'Airport',
            dataIndex: 'airportCode',
            width: 90,
          },
          { title: 'Driver', dataIndex: 'driverName' },
          {
            title: 'Tier',
            dataIndex: 'tier',
            render: (t: string) => (
              <Tag color={tierColors[t]}>{TIER_LABELS[t] ?? t}</Tag>
            ),
          },
          { title: 'Category', dataIndex: 'category' },
          {
            title: 'Waiting Time',
            dataIndex: 'waitingMinutes',
            render: (m: number) => {
              const color = m >= 60 ? 'text-red-400' : m >= 30 ? 'text-amber-400' : 'text-white'
              return <span className={color}>{m} min</span>
            },
          },
        ]}
        pagination={{ pageSize: 10 }}
      />
    </>
  )
}
