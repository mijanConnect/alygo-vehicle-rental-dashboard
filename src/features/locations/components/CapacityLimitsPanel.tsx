import { useState, useMemo } from 'react'
import { Table, Tag, Input, Select } from 'antd'
import { Edit2, PauseCircle, Search } from 'lucide-react'
import { AdminActionHost, createActionsColumn, createTableRowProps } from '@/components/admin'
import { useAdminActions } from '@/hooks/useAdminActions'
import { useGetCapacityLimitsQuery } from '@/services/capacityLimitsApi'
import type { CapacityLimit } from '@/types/capacityLimits'
import { formatNumber } from '@/utils/format'
import { CapacityLimitDrawer } from '@/features/locations/components/CapacityLimitDrawer'

export function CapacityLimitsPanel() {
  const adminActions = useAdminActions()
  const { data: limits = [], isLoading } = useGetCapacityLimitsQuery()
  const [drawerLimit, setDrawerLimit] = useState<CapacityLimit | null>(null)
  const [searchText, setSearchText] = useState('')
  const [locationFilter, setLocationFilter] = useState<string>('all')

  const filteredLimits = useMemo(() => {
    return limits.filter((limit) => {
      const matchesSearch = limit.locationName.toLowerCase().includes(searchText.toLowerCase())
      const matchesType = locationFilter === 'all' || limit.locationType === locationFilter
      return matchesSearch && matchesType
    })
  }, [limits, searchText, locationFilter])

  const handleAction = (key: string, record: CapacityLimit) => {
    switch (key) {
      case 'edit':
        setDrawerLimit(record)
        break
      case 'pause':
        adminActions.openConfirm({
          title: 'Pause Onboarding',
          description: `Are you sure you want to pause driver onboarding for ${record.locationName}?`,
          confirmLabel: 'Pause',
          danger: true,
          onConfirm: () => adminActions.notify(`Onboarding paused for ${record.locationName}`),
        })
        break
    }
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <p className="text-sm text-alygo-text-muted">
          Configure maximum active drivers, onboarding limits, and driver supply balancing by location.
        </p>
        <div className="flex items-center gap-3">
          <Input
            placeholder="Search location..."
            prefix={<Search size={16} className="text-alygo-text-muted" />}
            value={searchText}
            onChange={(e) => setSearchText(e.target.value)}
            className="w-64"
            allowClear
          />
          <Select
            value={locationFilter}
            onChange={setLocationFilter}
            options={[
              { value: 'all', label: 'All Types' },
              { value: 'state', label: 'State' },
              { value: 'city', label: 'City' },
              { value: 'zone', label: 'Zone' },
              { value: 'airport', label: 'Airport' },
            ]}
            className="w-32"
          />
        </div>
      </div>
      <Table
        loading={isLoading}
        rowKey="id"
        dataSource={filteredLimits}
        scroll={{ x: 1000 }}
        {...createTableRowProps<CapacityLimit>((record) => setDrawerLimit(record))}
        columns={[
          {
            title: 'Location',
            dataIndex: 'locationName',
            render: (name: string, record: CapacityLimit) => (
              <span>
                {name} <Tag className="ml-2 uppercase">{record.locationType}</Tag>
              </span>
            ),
          },
          {
            title: 'Active / Max Drivers',
            render: (_: any, record: CapacityLimit) => {
              const perc = (record.currentActiveDrivers / record.maxActiveDrivers) * 100
              const color = perc >= 100 ? 'text-red-500' : perc >= 80 ? 'text-orange-500' : 'text-green-500'
              return (
                <span className={color}>
                  {formatNumber(record.currentActiveDrivers)} / {formatNumber(record.maxActiveDrivers)}
                </span>
              )
            },
          },
          { title: 'New Approvals Limit', dataIndex: 'maxNewApprovals', render: (n: number) => formatNumber(n) },
          { title: 'Waitlist', dataIndex: 'currentWaitlistSize', render: (n: number) => formatNumber(n) },
          {
            title: 'Onboarding',
            dataIndex: 'onboardingPaused',
            render: (paused: boolean) => (
              <Tag color={paused ? 'error' : 'success'}>{paused ? 'Paused' : 'Active'}</Tag>
            ),
          },
          createActionsColumn<CapacityLimit>(
            () => [
              { key: 'edit', label: 'Edit Limits', icon: Edit2, group: 1 },
              { key: 'pause', label: 'Pause Onboarding', icon: PauseCircle, danger: true, group: 2 },
            ],
            (key, record) => handleAction(key, record),
          ),
        ]}
      />

      <CapacityLimitDrawer
        limit={drawerLimit}
        open={Boolean(drawerLimit)}
        onClose={() => setDrawerLimit(null)}
      />

      <AdminActionHost actions={adminActions} />
    </div>
  )
}
