import { useEffect, useState } from 'react'
import { Button, Form, InputNumber, Modal, Select, Switch } from 'antd'
import {
  Car,
  Crown,
  Filter,
  Headphones,
  Plane,
  Settings2,
  Sparkles,
  Zap,
} from 'lucide-react'
import type { TierBenefitRules } from '@/types/driverRewards'
import type { BenefitRuleKey } from '@/features/driver-rewards/utils/tierConfigHelpers'
import {
  BENEFIT_CARD_DEFINITIONS,
  DISPATCH_PRIORITY_OPTIONS,
  getBenefitSummaryLines,
  isBenefitEnabled,
  PREMIUM_RIDE_CATEGORY_OPTIONS,
} from '@/features/driver-rewards/utils/tierConfigHelpers'

interface TierBenefitsCardGridProps {
  rules: TierBenefitRules
  onRulesChange: (rules: TierBenefitRules) => void | Promise<void>
  tierLabel: string
  tierColor?: string
  tierBadge?: string
  saving?: boolean
  showHeader?: boolean
}

const BENEFIT_ICONS: Record<BenefitRuleKey, typeof Filter> = {
  destinationFilter: Filter,
  priorityDispatch: Zap,
  reservationAccess: Sparkles,
  premiumRideAccess: Car,
  airportQueuePriority: Plane,
  bonusMultiplier: Crown,
  vipSupport: Headphones,
}

function BenefitConfigureModal({
  benefitKey,
  rules,
  tierLabel,
  open,
  saving,
  onCancel,
  onSave,
}: {
  benefitKey: BenefitRuleKey | null
  rules: TierBenefitRules
  tierLabel: string
  open: boolean
  saving?: boolean
  onCancel: () => void
  onSave: (nextRules: TierBenefitRules) => Promise<void>
}) {
  const [form] = Form.useForm<TierBenefitRules>()
  const definition = BENEFIT_CARD_DEFINITIONS.find((d) => d.key === benefitKey)

  useEffect(() => {
    if (!open || !benefitKey) return
    form.setFieldsValue(rules)
  }, [open, benefitKey, rules, form])

  if (!benefitKey || !definition) return null

  const handleOk = async () => {
    await form.validateFields()
    const patch = form.getFieldsValue(true) as Partial<TierBenefitRules>
    const nextRules: TierBenefitRules = {
      ...rules,
      [benefitKey]: {
        ...rules[benefitKey],
        ...patch[benefitKey],
      },
    }
    await onSave(nextRules)
  }

  return (
    <Modal
      title={`Configure ${definition.title}`}
      open={open}
      onCancel={onCancel}
      onOk={handleOk}
      confirmLoading={saving}
      okText="Save"
      width={520}
      destroyOnClose
    >
      <p className="mb-4 text-sm text-alygo-text-muted">
        {definition.description} — {tierLabel} tier
      </p>
      <Form form={form} layout="vertical">
        {benefitKey === 'destinationFilter' && (
          <>
            <Form.Item name={['destinationFilter', 'enabled']} label="Enabled" valuePropName="checked">
              <Switch checkedChildren="On" unCheckedChildren="Off" />
            </Form.Item>
            <div className="grid gap-4 sm:grid-cols-2">
              <Form.Item name={['destinationFilter', 'filtersAllowed']} label="Filters Allowed">
                <InputNumber min={0} max={99} className="w-full" />
              </Form.Item>
              <Form.Item name={['destinationFilter', 'dailyLimit']} label="Daily Limit">
                <InputNumber min={0} max={999} className="w-full" />
              </Form.Item>
              <Form.Item name={['destinationFilter', 'weeklyLimit']} label="Weekly Limit">
                <InputNumber min={0} max={9999} className="w-full" />
              </Form.Item>
              <Form.Item
                name={['destinationFilter', 'unlimited']}
                label="Unlimited Access"
                valuePropName="checked"
              >
                <Switch />
              </Form.Item>
            </div>
          </>
        )}

        {benefitKey === 'priorityDispatch' && (
          <>
            <Form.Item name={['priorityDispatch', 'enabled']} label="Enabled" valuePropName="checked">
              <Switch checkedChildren="On" unCheckedChildren="Off" />
            </Form.Item>
            <Form.Item name={['priorityDispatch', 'priorityLevel']} label="Priority Level">
              <Select options={DISPATCH_PRIORITY_OPTIONS} />
            </Form.Item>
          </>
        )}

        {benefitKey === 'reservationAccess' && (
          <>
            <Form.Item name={['reservationAccess', 'enabled']} label="Enabled" valuePropName="checked">
              <Switch checkedChildren="On" unCheckedChildren="Off" />
            </Form.Item>
            <Form.Item name={['reservationAccess', 'advanceBookingHours']} label="Advance Booking Hours">
              <InputNumber min={0} max={168} className="w-full" addonAfter="hours" />
            </Form.Item>
          </>
        )}

        {benefitKey === 'premiumRideAccess' && (
          <>
            <Form.Item name={['premiumRideAccess', 'enabled']} label="Enabled" valuePropName="checked">
              <Switch checkedChildren="On" unCheckedChildren="Off" />
            </Form.Item>
            <Form.Item name={['premiumRideAccess', 'allowedCategories']} label="Allowed Ride Categories">
              <Select mode="multiple" options={PREMIUM_RIDE_CATEGORY_OPTIONS} placeholder="Select categories" />
            </Form.Item>
          </>
        )}

        {benefitKey === 'airportQueuePriority' && (
          <>
            <Form.Item name={['airportQueuePriority', 'enabled']} label="Enabled" valuePropName="checked">
              <Switch checkedChildren="On" unCheckedChildren="Off" />
            </Form.Item>
            <Form.Item name={['airportQueuePriority', 'queuePriorityLevel']} label="Queue Priority Level">
              <InputNumber min={1} max={5} className="w-full" />
            </Form.Item>
          </>
        )}

        {benefitKey === 'bonusMultiplier' && (
          <>
            <Form.Item name={['bonusMultiplier', 'enabled']} label="Enabled" valuePropName="checked">
              <Switch checkedChildren="On" unCheckedChildren="Off" />
            </Form.Item>
            <Form.Item name={['bonusMultiplier', 'multiplierValue']} label="Multiplier Value">
              <InputNumber min={1} max={3} step={0.05} className="w-full" addonAfter="x" />
            </Form.Item>
          </>
        )}

        {benefitKey === 'vipSupport' && (
          <Form.Item name={['vipSupport', 'enabled']} label="Enabled" valuePropName="checked">
            <Switch checkedChildren="On" unCheckedChildren="Off" />
          </Form.Item>
        )}
      </Form>
    </Modal>
  )
}

function BenefitCard({
  benefitKey,
  title,
  description,
  rules,
  saving,
  onToggle,
  onConfigure,
}: {
  benefitKey: BenefitRuleKey
  title: string
  description: string
  rules: TierBenefitRules
  saving?: boolean
  onToggle: (enabled: boolean) => void
  onConfigure: () => void
}) {
  const enabled = isBenefitEnabled(benefitKey, rules)
  const summaryLines = getBenefitSummaryLines(benefitKey, rules)
  const Icon = BENEFIT_ICONS[benefitKey]

  return (
    <div
      className={`glass-card flex h-full flex-col p-4 transition-opacity ${enabled ? '' : 'opacity-70'}`}
    >
      <div className="mb-3 flex items-start justify-between gap-3">
        <div className="flex items-start gap-3">
          <span
            className={`mt-0.5 inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-lg ${
              enabled ? 'bg-alygo-primary/15 text-alygo-primary' : 'bg-white/5 text-alygo-text-muted'
            }`}
          >
            <Icon className="h-4 w-4" />
          </span>
          <div>
            <h4 className="font-medium text-white">{title}</h4>
            <p className="text-xs text-alygo-text-muted">{description}</p>
          </div>
        </div>
        <Switch
          checked={enabled}
          checkedChildren="ON"
          unCheckedChildren="OFF"
          loading={saving}
          onChange={onToggle}
        />
      </div>

      <div className="flex-1 rounded-lg border border-white/5 bg-white/[0.02] px-3 py-2.5">
        {enabled ? (
          <dl className="space-y-1.5">
            {summaryLines.map((line) => (
              <div key={line.label} className="flex items-center justify-between gap-3 text-sm">
                <dt className="text-alygo-text-muted">{line.label}</dt>
                <dd className="font-medium text-white">{line.value}</dd>
              </div>
            ))}
          </dl>
        ) : (
          <p className="text-sm text-alygo-text-muted">Benefit is disabled for this tier.</p>
        )}
      </div>

      <Button className="mt-4" icon={<Settings2 className="h-4 w-4" />} onClick={onConfigure}>
        Configure
      </Button>
    </div>
  )
}

export function TierBenefitsCardGrid({
  rules,
  onRulesChange,
  tierLabel,
  tierColor,
  tierBadge,
  saving,
  showHeader = true,
}: TierBenefitsCardGridProps) {
  const [editingBenefit, setEditingBenefit] = useState<BenefitRuleKey | null>(null)
  const activeCount = BENEFIT_CARD_DEFINITIONS.filter((d) => isBenefitEnabled(d.key, rules)).length

  const updateRules = async (nextRules: TierBenefitRules) => {
    await onRulesChange(nextRules)
  }

  const toggleBenefit = async (key: BenefitRuleKey, enabled: boolean) => {
    await updateRules({
      ...rules,
      [key]: { ...rules[key], enabled },
    })
  }

  const saveFromModal = async (nextRules: TierBenefitRules) => {
    await updateRules(nextRules)
    setEditingBenefit(null)
  }

  return (
    <>
      {showHeader && (
        <div className="mb-4 flex flex-wrap items-center justify-between gap-3 rounded-lg border border-white/5 bg-white/[0.02] px-4 py-3">
          <div>
            <p className="text-sm font-medium text-white">{tierLabel} benefits</p>
            <p className="text-xs text-alygo-text-muted">
              {activeCount} of {BENEFIT_CARD_DEFINITIONS.length} benefits active
            </p>
          </div>
          {tierColor && tierBadge && (
            <span className="inline-flex items-center gap-2 rounded-full border border-white/10 px-3 py-1 text-xs text-alygo-text-muted">
              <span
                className="inline-flex h-5 w-5 items-center justify-center rounded-full text-[10px] font-semibold text-white"
                style={{ backgroundColor: tierColor }}
              >
                {tierBadge}
              </span>
              {tierLabel}
            </span>
          )}
        </div>
      )}

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        {BENEFIT_CARD_DEFINITIONS.map((definition) => (
          <BenefitCard
            key={definition.key}
            benefitKey={definition.key}
            title={definition.title}
            description={definition.description}
            rules={rules}
            saving={saving}
            onToggle={(enabled) => toggleBenefit(definition.key, enabled)}
            onConfigure={() => setEditingBenefit(definition.key)}
          />
        ))}
      </div>

      <BenefitConfigureModal
        benefitKey={editingBenefit}
        rules={rules}
        tierLabel={tierLabel}
        open={Boolean(editingBenefit)}
        saving={saving}
        onCancel={() => setEditingBenefit(null)}
        onSave={saveFromModal}
      />
    </>
  )
}
