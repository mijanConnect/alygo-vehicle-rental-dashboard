import { useEffect, useMemo, useState } from 'react'
import { Button, Form, Input, InputNumber, Select } from 'antd'
import { ArrowLeft, Save } from 'lucide-react'
import { Link, useParams } from 'react-router-dom'
import { PageShell } from '@/components/common/PageShell'
import { StatusBadge } from '@/components/common/StatusBadge'
import { TierBenefitsCardGrid } from '@/features/driver-rewards/components/TierBenefitsCardGrid'
import {
  countActiveBenefitRules,
  createDefaultBenefitRules,
  parseBenefitRules,
} from '@/features/driver-rewards/utils/tierConfigHelpers'
import {
  buildTierPayload,
  tierToFormValues,
} from '@/features/driver-rewards/utils/tierFormHelpers'
import { useAdminActions } from '@/hooks/useAdminActions'
import { useDocumentTitle } from '@/hooks/useDocumentTitle'
import {
  useGetDriverLevelsQuery,
  useUpdateDriverLevelMutation,
} from '@/services/driverRewardsApi'
import type { TierFormValues } from '@/types/tierManagement'

export default function TierDetailPage() {
  const { id = '' } = useParams()
  const adminActions = useAdminActions()
  const { data: tiers = [], isLoading } = useGetDriverLevelsQuery()
  const [updateLevel, { isLoading: saving }] = useUpdateDriverLevelMutation()
  const tier = useMemo(() => tiers.find((t) => t.id === id), [tiers, id])
  const [form] = Form.useForm<TierFormValues>()
  const [benefitRules, setBenefitRules] = useState(createDefaultBenefitRules)

  useDocumentTitle(tier ? `${tier.label} Tier` : 'Tier Details')

  useEffect(() => {
    if (!tier) return
    form.setFieldsValue(tierToFormValues(tier))
    setBenefitRules(parseBenefitRules(tier.benefits))
  }, [tier, form])

  if (isLoading) return null

  if (!tier) {
    return (
      <PageShell title="Tier Not Found">
        <Link to="/drivers/tiers?tab=configuration">
          <Button icon={<ArrowLeft className="h-4 w-4" />}>Back to Tier Management</Button>
        </Link>
      </PageShell>
    )
  }

  const saveRequirements = async () => {
    const values = await form.validateFields()
    try {
      const payload = buildTierPayload({ ...values, benefitRules }, tier, tier.sortOrder)
      await updateLevel({ id: tier.id, ...payload }).unwrap()
      adminActions.notify('Tier requirements saved', tier.label)
    } catch (err) {
      adminActions.notify('Unable to save requirements', String(err))
    }
  }

  const saveBenefits = async (nextRules: typeof benefitRules) => {
    setBenefitRules(nextRules)
    try {
      const values = form.getFieldsValue(true) as TierFormValues
      const payload = buildTierPayload({ ...values, benefitRules: nextRules }, tier, tier.sortOrder)
      await updateLevel({ id: tier.id, ...payload }).unwrap()
      adminActions.notify('Tier benefits saved', tier.label)
    } catch (err) {
      adminActions.notify('Unable to save benefits', String(err))
    }
  }

  return (
    <PageShell
      title={`${tier.label} Tier`}
      description={`Level ${tier.level} · ${tier.driverCount} drivers · ${countActiveBenefitRules(benefitRules)} active benefits`}
      actions={
        <Link to="/drivers/tiers?tab=configuration">
          <Button icon={<ArrowLeft className="h-4 w-4" />}>Back</Button>
        </Link>
      }
    >
      <div className="mb-6 flex flex-wrap items-center gap-3">
        <span
          className="inline-flex h-8 w-8 items-center justify-center rounded-md text-sm font-semibold text-white"
          style={{ backgroundColor: tier.tierColor }}
        >
          {tier.tierBadge}
        </span>
        <StatusBadge status={tier.status} />
        <span className="text-sm text-alygo-text-muted">Tier ID: {tier.id}</span>
      </div>

      <section className="glass-card mb-6 p-5">
        <div className="mb-4 flex items-center justify-between gap-4">
          <div>
            <h2 className="text-base font-semibold text-white">Requirements</h2>
            <p className="text-sm text-alygo-text-muted">
              Qualification thresholds drivers must meet to reach this tier.
            </p>
          </div>
          <Button
            type="primary"
            icon={<Save className="h-4 w-4" />}
            loading={saving}
            onClick={saveRequirements}
          >
            Save Requirements
          </Button>
        </div>

        <Form form={form} layout="vertical">
          <div className="grid gap-0 sm:grid-cols-2 lg:grid-cols-3 sm:gap-4">
            <Form.Item name="label" label="Tier Name" rules={[{ required: true }]}>
              <Input />
            </Form.Item>
            <Form.Item name="level" label="Level" rules={[{ required: true }]}>
              <InputNumber min={1} max={99} className="w-full" />
            </Form.Item>
            <Form.Item name="status" label="Status" rules={[{ required: true }]}>
              <Select
                options={[
                  { value: 'active', label: 'Active' },
                  { value: 'inactive', label: 'Inactive' },
                ]}
              />
            </Form.Item>
            <Form.Item name="tierColor" label="Color" rules={[{ required: true }]}>
              <Input type="color" className="h-10 w-full" />
            </Form.Item>
            <Form.Item name="requiredTrips" label="Trips Required" rules={[{ required: true }]}>
              <InputNumber min={0} className="w-full" />
            </Form.Item>
            <Form.Item name="requiredRating" label="Rating Required" rules={[{ required: true }]}>
              <InputNumber min={0} max={5} step={0.1} className="w-full" />
            </Form.Item>
            <Form.Item name="requiredAcceptanceRate" label="Acceptance Rate" rules={[{ required: true }]}>
              <InputNumber min={0} max={100} addonAfter="%" className="w-full" />
            </Form.Item>
            <Form.Item name="requiredCompletionRate" label="Completion Rate" rules={[{ required: true }]}>
              <InputNumber min={0} max={100} addonAfter="%" className="w-full" />
            </Form.Item>
            <Form.Item name="requiredSafetyScore" label="Safety Score" rules={[{ required: true }]}>
              <InputNumber min={0} max={100} className="w-full" />
            </Form.Item>
          </div>
          <Form.Item name="notes" label="Notes">
            <Input.TextArea rows={2} />
          </Form.Item>
        </Form>
      </section>

      <section className="glass-card p-5">
        <div className="mb-4">
          <h2 className="text-base font-semibold text-white">Benefits</h2>
          <p className="text-sm text-alygo-text-muted">
            Operational privileges owned by this tier. Toggle or configure each benefit below.
          </p>
        </div>
        <TierBenefitsCardGrid
          rules={benefitRules}
          onRulesChange={saveBenefits}
          tierLabel={tier.label}
          tierColor={tier.tierColor}
          tierBadge={tier.tierBadge}
          saving={saving}
        />
      </section>
    </PageShell>
  )
}
