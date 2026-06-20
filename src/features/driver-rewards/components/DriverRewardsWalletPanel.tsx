import { useMemo, useState } from 'react'
import { Select, Table } from 'antd'
import {
  useGetDriverPointsHistoryQuery,
  useGetDriverRewardsWalletsQuery,
} from '@/services/driverRewardsApi'
import { formatDateTime, formatNumber } from '@/utils/format'

export function DriverRewardsWalletPanel() {
  const { data: wallets = [], isLoading: walletsLoading } = useGetDriverRewardsWalletsQuery()
  const [selectedDriverId, setSelectedDriverId] = useState<string | undefined>(wallets[0]?.driverId)
  const { data: history = [], isLoading: historyLoading } = useGetDriverPointsHistoryQuery(selectedDriverId)

  const selectedWallet = useMemo(
    () => wallets.find((w) => w.driverId === selectedDriverId),
    [wallets, selectedDriverId],
  )

  return (
    <div className="space-y-6">
      <p className="text-sm text-alygo-text-muted">
        Track driver rewards wallets with lifetime points, current balance, earned/lost totals, and full transaction history.
      </p>

      <Table
        loading={walletsLoading}
        rowKey="driverId"
        pagination={{ pageSize: 8 }}
        dataSource={wallets}
        onRow={(record) => ({
          onClick: () => setSelectedDriverId(record.driverId),
          className: record.driverId === selectedDriverId ? 'cursor-pointer bg-indigo-500/10' : 'cursor-pointer',
        })}
        columns={[
          { title: 'Driver', dataIndex: 'driverName' },
          { title: 'Lifetime Points', dataIndex: 'lifetimePoints', render: (v: number) => formatNumber(v) },
          { title: 'Current Points', dataIndex: 'currentPoints', render: (v: number) => formatNumber(v) },
          { title: 'Points Earned', dataIndex: 'pointsEarned', render: (v: number) => <span className="text-emerald-400">+{formatNumber(v)}</span> },
          { title: 'Points Lost', dataIndex: 'pointsLost', render: (v: number) => <span className="text-red-400">-{formatNumber(v)}</span> },
        ]}
      />

      {selectedWallet && (
        <div className="glass-card p-5">
          <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
            <h3 className="text-base font-semibold text-white">
              Points History — {selectedWallet.driverName}
            </h3>
            <Select
              value={selectedDriverId}
              onChange={setSelectedDriverId}
              className="!min-w-[220px]"
              options={wallets.map((w) => ({ value: w.driverId, label: w.driverName }))}
            />
          </div>

          <Table
            loading={historyLoading}
            rowKey="id"
            pagination={{ pageSize: 8 }}
            dataSource={history}
            columns={[
              { title: 'Date', dataIndex: 'createdAt', render: (d: string) => formatDateTime(d) },
              { title: 'Rule', dataIndex: 'ruleName' },
              {
                title: 'Points',
                dataIndex: 'points',
                render: (p: number) => (
                  <span className={p >= 0 ? 'text-emerald-400' : 'text-red-400'}>
                    {p > 0 ? `+${p}` : p}
                  </span>
                ),
              },
              { title: 'Reason', dataIndex: 'reason', ellipsis: true },
            ]}
          />
        </div>
      )}
    </div>
  )
}
