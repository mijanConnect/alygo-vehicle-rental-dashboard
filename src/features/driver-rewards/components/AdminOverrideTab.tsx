import { useMemo, useState } from 'react'
import { Button, Form, Input, InputNumber, Select } from 'antd'
import { AdminActionHost } from '@/components/admin'
import { SearchingInput } from '@/components/shared/SearchingInput'
import { useAdminActions } from '@/hooks/useAdminActions'
import { useGetDriverManagementListQuery } from '@/redux/api/driverManagementApi'
import type { DriverOverviewItem } from '@/redux/api/driverManagementApi'
import {
  useAdminOverridePointsMutation,
  useAdminOverrideTierMutation,
} from '@/redux/api/driverRewardManagementApi'
import { useGetTiersListQuery } from '@/redux/api/tiersManagementsApi'

function resolveDriverUserId(item: DriverOverviewItem): string {
  const userId = item.userId
  if (typeof userId === 'string' && userId.trim()) return userId.trim()
  if (userId && typeof userId === 'object') {
    const nested = userId as { _id?: string; id?: string }
    if (nested._id) return nested._id
    if (nested.id) return nested.id
  }
  if (typeof item.driverId === 'string' && item.driverId.trim()) return item.driverId.trim()
  if (item.driverId && typeof item.driverId === 'object' && item.driverId._id) {
    return item.driverId._id
  }
  return ''
}

interface OverridePointsFormValues {
  driverUserId: string
  points: number
  notes: string
}

interface OverrideTierFormValues {
  driverUserId: string
  tierId: string
  reason: string
}

export function AdminOverrideTab() {
  const adminActions = useAdminActions()
  const [driverSearch, setDriverSearch] = useState('')
  const [pointsForm] = Form.useForm<OverridePointsFormValues>()
  const [tierForm] = Form.useForm<OverrideTierFormValues>()

  const { data: driversData, isFetching: driversLoading } = useGetDriverManagementListQuery({
    page: 1,
    limit: 50,
    searchTerm: driverSearch || undefined,
  })

  const { data: tiersData, isLoading: tiersLoading } = useGetTiersListQuery({
    page: 1,
    limit: 100,
    status: 'active',
  })

  const [overridePoints, { isLoading: overridingPoints }] = useAdminOverridePointsMutation()
  const [overrideTier, { isLoading: overridingTier }] = useAdminOverrideTierMutation()

  const driverOptions = useMemo(
    () =>
      (driversData?.data ?? [])
        .map((driver) => {
          const value = resolveDriverUserId(driver)
          if (!value) return null
          return {
            value,
            label: `${driver.fullName || 'Driver'} · ${driver.email || value}`,
          }
        })
        .filter((option): option is { value: string; label: string } => Boolean(option)),
    [driversData?.data],
  )

  const tierOptions = useMemo(
    () =>
      (tiersData?.data ?? []).map((tier) => ({
        value: tier._id,
        label: `${tier.name} (L${tier.level})`,
      })),
    [tiersData?.data],
  )

  const handleOverridePoints = async () => {
    const values = await pointsForm.validateFields()
    try {
      await overridePoints({
        driverUserId: values.driverUserId,
        points: values.points,
        notes: values.notes.trim(),
      }).unwrap()
      adminActions.notify('Points overridden', values.driverUserId)
      pointsForm.resetFields()
    } catch (err) {
      adminActions.notify('Unable to override points', String(err))
    }
  }

  const handleOverrideTier = async () => {
    const values = await tierForm.validateFields()
    try {
      await overrideTier({
        driverUserId: values.driverUserId,
        tierId: values.tierId,
        reason: values.reason.trim(),
      }).unwrap()
      adminActions.notify('Tier overridden', values.driverUserId)
      tierForm.resetFields()
    } catch (err) {
      adminActions.notify('Unable to override tier', String(err))
    }
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <p className="text-sm text-alygo-text-muted">
          Manually override a driver&apos;s reward points or assigned tier.
        </p>
        <SearchingInput
          value={driverSearch}
          onChange={setDriverSearch}
          placeholder="Search drivers for override..."
          className="w-full max-w-sm"
        />
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <section className="glass-card p-5">
          <div className="mb-4">
            <h3 className="text-base font-semibold text-white">Override Points</h3>
            <p className="text-sm text-alygo-text-muted">
              Set or adjust a driver&apos;s points balance with an audit note.
            </p>
          </div>
          <Form form={pointsForm} layout="vertical" onFinish={handleOverridePoints}>
            <Form.Item
              name="driverUserId"
              label="Driver"
              rules={[{ required: true, message: 'Select a driver' }]}
            >
              <Select
                showSearch
                optionFilterProp="label"
                loading={driversLoading}
                options={driverOptions}
                placeholder="Select driver"
              />
            </Form.Item>
            <Form.Item
              name="points"
              label="Points"
              rules={[{ required: true, message: 'Enter points value' }]}
            >
              <InputNumber className="w-full" placeholder="e.g. 450" />
            </Form.Item>
            <Form.Item
              name="notes"
              label="Notes"
              rules={[{ required: true, message: 'Enter override notes' }]}
            >
              <Input.TextArea rows={3} placeholder="e.g. Compensated for system outage" />
            </Form.Item>
            <Button type="primary" htmlType="submit" loading={overridingPoints} block>
              Override Points
            </Button>
          </Form>
        </section>

        <section className="glass-card p-5">
          <div className="mb-4">
            <h3 className="text-base font-semibold text-white">Override Tier</h3>
            <p className="text-sm text-alygo-text-muted">
              Manually assign a driver to a specific tier with a reason.
            </p>
          </div>
          <Form form={tierForm} layout="vertical" onFinish={handleOverrideTier}>
            <Form.Item
              name="driverUserId"
              label="Driver"
              rules={[{ required: true, message: 'Select a driver' }]}
            >
              <Select
                showSearch
                optionFilterProp="label"
                loading={driversLoading}
                options={driverOptions}
                placeholder="Select driver"
              />
            </Form.Item>
            <Form.Item
              name="tierId"
              label="Tier"
              rules={[{ required: true, message: 'Select a tier' }]}
            >
              <Select
                showSearch
                optionFilterProp="label"
                loading={tiersLoading}
                options={tierOptions}
                placeholder="Select tier"
              />
            </Form.Item>
            <Form.Item
              name="reason"
              label="Reason"
              rules={[{ required: true, message: 'Enter override reason' }]}
            >
              <Input.TextArea rows={3} placeholder="e.g. VIP Support Manual Promotion" />
            </Form.Item>
            <Button type="primary" htmlType="submit" loading={overridingTier} block>
              Override Tier
            </Button>
          </Form>
        </section>
      </div>

      <AdminActionHost actions={adminActions} />
    </div>
  )
}
