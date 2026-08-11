import { useEffect, useState } from 'react'
import { Button, Form, Input, InputNumber, Modal, Select, Steps } from 'antd'
import { TierBenefitsCardGrid } from '@/features/driver-rewards/components/TierBenefitsCardGrid'
import { defaultTierFormValues, tierCodeFromName } from '@/features/driver-rewards/mapTierManagement'
import type { TierFormValues } from '@/types/tierManagement'

interface TierCreateWizardProps {
  open: boolean
  nextLevel: number
  loading?: boolean
  onCancel: () => void
  onSubmit: (values: TierFormValues) => Promise<void>
}

const STEP_ITEMS = [
  { title: 'Basic Information' },
  { title: 'Requirements' },
  { title: 'Benefits' },
]

export function TierCreateWizard({ open, nextLevel, loading, onCancel, onSubmit }: TierCreateWizardProps) {
  const [step, setStep] = useState(0)
  const [form] = Form.useForm<TierFormValues>()
  const [benefitRules, setBenefitRules] = useState(defaultTierFormValues().benefitRules)

  useEffect(() => {
    if (!open) return
    setStep(0)
    const defaults = defaultTierFormValues(nextLevel)
    form.setFieldsValue(defaults)
    setBenefitRules(defaults.benefitRules)
  }, [open, nextLevel, form])

  const reset = () => {
    setStep(0)
    form.resetFields()
    setBenefitRules(defaultTierFormValues().benefitRules)
  }

  const handleClose = () => {
    reset()
    onCancel()
  }

  const validateStep = async () => {
    if (step === 0) {
      await form.validateFields(['name', 'code', 'level', 'status'])
    } else if (step === 1) {
      await form.validateFields([
        'pointsRequired',
        'tripsRequired',
        'ratingRequired',
        'acceptanceRateRequired',
      ])
    }
  }

  const handleNext = async () => {
    await validateStep()
    setStep((s) => s + 1)
  }

  const handleCreate = async () => {
    await form.validateFields([
      'name',
      'code',
      'level',
      'status',
      'pointsRequired',
      'tripsRequired',
      'ratingRequired',
      'acceptanceRateRequired',
    ])
    const values: TierFormValues = {
      ...defaultTierFormValues(nextLevel),
      ...(form.getFieldsValue(true) as Partial<TierFormValues>),
      benefitRules,
    }
    await onSubmit(values)
    reset()
  }

  return (
    <Modal
      title="Create Tier"
      open={open}
      onCancel={handleClose}
      width={720}
      destroyOnClose
      footer={
        <div className="flex justify-end gap-2">
          {step > 0 && (
            <Button onClick={() => setStep((s) => s - 1)} disabled={loading}>
              Back
            </Button>
          )}
          <Button onClick={handleClose} disabled={loading}>
            Cancel
          </Button>
          {step < 2 ? (
            <Button type="primary" onClick={handleNext}>
              Continue
            </Button>
          ) : (
            <Button type="primary" loading={loading} onClick={handleCreate}>
              Create Tier
            </Button>
          )}
        </div>
      }
    >
      <Steps current={step} size="small" className="mb-6" items={STEP_ITEMS} />

      <Form form={form} layout="vertical" preserve>
        {step === 0 && (
          <>
            <Form.Item
              name="name"
              label="Tier Name"
              preserve
              rules={[{ required: true, message: 'Enter a tier name' }]}
            >
              <Input
                placeholder="e.g. Bronze"
                onChange={(e) => {
                  const name = e.target.value
                  const currentCode = form.getFieldValue('code')
                  if (!currentCode) {
                    form.setFieldValue('code', tierCodeFromName(name))
                  }
                }}
              />
            </Form.Item>
            <Form.Item
              name="code"
              label="Code"
              preserve
              rules={[{ required: true, message: 'Enter a tier code' }]}
            >
              <Input placeholder="e.g. bronze" />
            </Form.Item>
            <div className="grid gap-0 sm:grid-cols-2 sm:gap-4">
              <Form.Item name="level" label="Level" preserve rules={[{ required: true }]}>
                <InputNumber min={1} max={99} className="w-full" />
              </Form.Item>
              <Form.Item name="status" label="Status" preserve rules={[{ required: true }]}>
                <Select
                  options={[
                    { value: 'active', label: 'Active' },
                    { value: 'inactive', label: 'Inactive' },
                  ]}
                />
              </Form.Item>
            </div>
          </>
        )}

        {step === 1 && (
          <div className="grid gap-0 sm:grid-cols-2 sm:gap-4">
            <Form.Item name="pointsRequired" label="Points Required" preserve rules={[{ required: true }]}>
              <InputNumber min={0} className="w-full" />
            </Form.Item>
            <Form.Item name="tripsRequired" label="Trips Required" preserve rules={[{ required: true }]}>
              <InputNumber min={0} className="w-full" />
            </Form.Item>
            <Form.Item name="ratingRequired" label="Rating Required" preserve rules={[{ required: true }]}>
              <InputNumber min={0} max={5} step={0.1} className="w-full" />
            </Form.Item>
            <Form.Item
              name="acceptanceRateRequired"
              label="Acceptance Rate"
              preserve
              rules={[{ required: true }]}
            >
              <InputNumber min={0} max={100} addonAfter="%" className="w-full" />
            </Form.Item>
          </div>
        )}

        {step === 2 && (
          <TierBenefitsCardGrid
            rules={benefitRules}
            onRulesChange={setBenefitRules}
            tierLabel={form.getFieldValue('name') || 'New Tier'}
            tierBadge={(form.getFieldValue('code') || form.getFieldValue('name') || 'NT')
              .slice(0, 2)
              .toUpperCase()}
            showHeader={false}
          />
        )}
      </Form>
    </Modal>
  )
}
