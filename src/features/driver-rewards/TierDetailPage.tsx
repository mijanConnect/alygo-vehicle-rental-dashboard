import { useEffect, useState } from 'react'
import { Button, Form, Input, InputNumber, Select } from 'antd'
import { ArrowLeft, Save } from 'lucide-react'
import { Link, useParams } from 'react-router-dom'
import { AdminActionHost } from '@/components/admin'
import { PageShell } from '@/components/common/PageShell'
import { StatusBadge } from '@/components/common/StatusBadge'
import { TierBenefitsCardGrid } from '@/features/driver-rewards/components/TierBenefitsCardGrid'
import {
  apiBenefitsToRules,
  buildTierWritePayload,
  countApiBenefitRules,
  createDefaultApiBenefitRules,
  tierToFormValues,
} from '@/features/driver-rewards/mapTierManagement'
import { useAdminActions } from '@/hooks/useAdminActions'
import { useDocumentTitle } from '@/hooks/useDocumentTitle'
import {
  useGetSingleTierQuery,
  useUpdateTierMutation,
  useUpdateTierStatusMutation,
} from '@/redux/api/tiersManagementsApi'
import type { TierFormValues } from '@/types/tierManagement'

export default function TierDetailPage() {
  const { id = '' } = useParams()
  const adminActions = useAdminActions()
  const { data: tier, isLoading } = useGetSingleTierQuery(id, { skip: !id })
  const [updateTier, { isLoading: saving }] = useUpdateTierMutation()
  const [updateTierStatus, { isLoading: updatingStatus }] = useUpdateTierStatusMutation()
  const [form] = Form.useForm<TierFormValues>()
  const [benefitRules, setBenefitRules] = useState(createDefaultApiBenefitRules)

  useDocumentTitle(tier ? `${tier.name} Tier` : 'Tier Details')

  useEffect(() => {
    if (!tier) return
    form.setFieldsValue(tierToFormValues(tier))
    setBenefitRules(apiBenefitsToRules(tier.benefits))
  }, [tier, form])

  if (isLoading) {
    return (
      <PageShell title="Tier Details">
        <div className="glass-card p-6 text-center text-sm text-alygo-text-muted">Loading tier...</div>
      </PageShell>
    )
  }

  if (!tier) {
    return (
      <PageShell title="Tier Not Found">
        <Link to="/drivers/tiers?tab=configuration">
          <Button icon={<ArrowLeft className="h-4 w-4" />}>Back to Tier Management</Button>
        </Link>
      </PageShell>
    )
  }

  const persistTier = async (values: TierFormValues) => {
    await updateTier({ id: tier._id, body: buildTierWritePayload(values) }).unwrap()
    if (values.status !== tier.status) {
      await updateTierStatus({ id: tier._id, status: values.status }).unwrap()
    }
  }

  const saveRequirements = async () => {
    const values = await form.validateFields()
    try {
      await persistTier({ ...values, benefitRules })
      adminActions.notify('Tier requirements saved', tier.name)
    } catch (err) {
      adminActions.notify('Unable to save requirements', String(err))
    }
  }

  const saveBenefits = async (nextRules: typeof benefitRules) => {
    setBenefitRules(nextRules)
    try {
      const values = form.getFieldsValue(true) as TierFormValues
      await persistTier({ ...values, benefitRules: nextRules })
      adminActions.notify('Tier benefits saved', tier.name)
    } catch (err) {
      adminActions.notify('Unable to save benefits', String(err))
    }
  }

  const busy = saving || updatingStatus
  const badge = (tier.code || tier.name).slice(0, 2).toUpperCase()

  return (
    <PageShell
      title={`${tier.name} Tier`}
      description={`Level ${tier.level} · ${countApiBenefitRules(benefitRules)} active benefits`}
      actions={
        <Link to="/drivers/tiers?tab=configuration">
          <Button icon={<ArrowLeft className="h-4 w-4" />}>Back</Button>
        </Link>
      }
    >
      <div className="mb-6 flex flex-wrap items-center gap-3">
        <span className="inline-flex h-8 w-8 items-center justify-center rounded-md bg-alygo-primary/20 text-sm font-semibold text-alygo-primary">
          {badge}
        </span>
        <StatusBadge status={tier.status} />
        <span className="text-sm text-alygo-text-muted">Tier ID: {tier._id}</span>
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
            loading={busy}
            onClick={saveRequirements}
          >
            Save Requirements
          </Button>
        </div>

        <Form form={form} layout="vertical">
          <div className="grid gap-0 sm:grid-cols-2 lg:grid-cols-3 sm:gap-4">
            <Form.Item name="name" label="Tier Name" rules={[{ required: true }]}>
              <Input />
            </Form.Item>
            <Form.Item name="code" label="Code" rules={[{ required: true }]}>
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
            <Form.Item name="pointsRequired" label="Points Required" rules={[{ required: true }]}>
              <InputNumber min={0} className="w-full" />
            </Form.Item>
            <Form.Item name="tripsRequired" label="Trips Required" rules={[{ required: true }]}>
              <InputNumber min={0} className="w-full" />
            </Form.Item>
            <Form.Item name="ratingRequired" label="Rating Required" rules={[{ required: true }]}>
              <InputNumber min={0} max={5} step={0.1} className="w-full" />
            </Form.Item>
            <Form.Item name="acceptanceRateRequired" label="Acceptance Rate" rules={[{ required: true }]}>
              <InputNumber min={0} max={100} addonAfter="%" className="w-full" />
            </Form.Item>
          </div>
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
          tierLabel={tier.name}
          tierBadge={badge}
          saving={busy}
        />
      </section>
      <AdminActionHost actions={adminActions} />
    </PageShell>
  )
}
