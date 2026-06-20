import { useEffect, useState } from 'react'
import { Button, Form, Input, InputNumber, Modal, Select, Steps } from 'antd'
import { TierBenefitsCardGrid } from '@/features/driver-rewards/components/TierBenefitsCardGrid'
import {
  defaultTierFormValues,
} from '@/features/driver-rewards/utils/tierFormHelpers'
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
    const defaults = defaultTierFormValues()
    defaults.level = nextLevel
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
      await form.validateFields(['label', 'level', 'tierColor', 'status'])
    } else if (step === 1) {
      await form.validateFields([
        'requiredTrips',
        'requiredRating',
        'requiredAcceptanceRate',
        'requiredCompletionRate',
        'requiredSafetyScore',
      ])
    }
  }

  const handleNext = async () => {
    await validateStep()
    setStep((s) => s + 1)
  }

  const handleCreate = async () => {
    const values = await form.validateFields()
    await onSubmit({ ...values, benefitRules })
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

      <Form form={form} layout="vertical" preserve={false}>
        {step === 0 && (
          <>
            <Form.Item name="label" label="Tier Name" rules={[{ required: true, message: 'Enter a tier name' }]}>
              <Input placeholder="e.g. Elite" />
            </Form.Item>
            <div className="grid gap-0 sm:grid-cols-2 sm:gap-4">
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
            </div>
            <Form.Item name="tierColor" label="Color" rules={[{ required: true }]}>
              <Input type="color" className="h-10 w-full max-w-[120px]" />
            </Form.Item>
            <Form.Item name="notes" label="Notes">
              <Input.TextArea rows={2} placeholder="Optional admin notes" />
            </Form.Item>
          </>
        )}

        {step === 1 && (
          <>
            <Form.Item name="requiredTrips" label="Trips Required" rules={[{ required: true }]}>
              <InputNumber min={0} className="w-full" />
            </Form.Item>
            <div className="grid gap-0 sm:grid-cols-2 sm:gap-4">
              <Form.Item name="requiredRating" label="Rating Required" rules={[{ required: true }]}>
                <InputNumber min={0} max={5} step={0.1} className="w-full" />
              </Form.Item>
              <Form.Item name="requiredSafetyScore" label="Safety Score" rules={[{ required: true }]}>
                <InputNumber min={0} max={100} className="w-full" />
              </Form.Item>
            </div>
            <div className="grid gap-0 sm:grid-cols-2 sm:gap-4">
              <Form.Item name="requiredAcceptanceRate" label="Acceptance Rate" rules={[{ required: true }]}>
                <InputNumber min={0} max={100} addonAfter="%" className="w-full" />
              </Form.Item>
              <Form.Item name="requiredCompletionRate" label="Completion Rate" rules={[{ required: true }]}>
                <InputNumber min={0} max={100} addonAfter="%" className="w-full" />
              </Form.Item>
            </div>
          </>
        )}

        {step === 2 && (
          <TierBenefitsCardGrid
            rules={benefitRules}
            onRulesChange={setBenefitRules}
            tierLabel={form.getFieldValue('label') || 'New Tier'}
            tierColor={form.getFieldValue('tierColor')}
            tierBadge={(form.getFieldValue('label') || 'NT').slice(0, 2).toUpperCase()}
            showHeader={false}
          />
        )}
      </Form>
    </Modal>
  )
}
