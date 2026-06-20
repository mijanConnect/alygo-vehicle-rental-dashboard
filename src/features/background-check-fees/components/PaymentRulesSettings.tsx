import { Button, Form, InputNumber, Select, Switch } from 'antd'
import { Save } from 'lucide-react'
import { useAdminActions } from '@/hooks/useAdminActions'
import {
  useGetBackgroundCheckPaymentRulesQuery,
  useUpdateBackgroundCheckPaymentRulesMutation,
} from '@/services/backgroundCheckFeeApi'
import { PAYMENT_MODE_LABELS } from '@/services/mock/backgroundCheckFeeData'

const paymentModeOptions = Object.entries(PAYMENT_MODE_LABELS).map(([value, label]) => ({ value, label }))

export function PaymentRulesSettings() {
  const adminActions = useAdminActions()
  const { data, isLoading } = useGetBackgroundCheckPaymentRulesQuery()
  const [updateRules, { isLoading: saving }] = useUpdateBackgroundCheckPaymentRulesMutation()

  if (isLoading || !data) {
    return <div className="p-8 text-center text-alygo-text-muted">Loading payment rules...</div>
  }

  return (
    <div className="max-w-2xl">
      <p className="mb-4 text-sm text-alygo-text-muted">
        Configure who pays for background checks and define automatic refund rules for rejected or withdrawn applications.
      </p>
      <Form
        layout="vertical"
        initialValues={data}
        onFinish={async (values) => {
          await updateRules(values).unwrap()
          adminActions.notify('Payment rules updated')
        }}
      >
        <h4 className="mb-3 text-sm font-semibold uppercase tracking-wider text-alygo-text-muted">Payment Responsibility</h4>

        <Form.Item name="defaultPaymentMode" label="Default Payment Mode" rules={[{ required: true }]}>
          <Select options={paymentModeOptions} />
        </Form.Item>

        <Form.Item name="driverPaysEnabled" label="Driver Pays" valuePropName="checked" extra="Allow drivers to pay the full background check fee">
          <Switch checkedChildren="ON" unCheckedChildren="OFF" />
        </Form.Item>

        <Form.Item name="companyPaysEnabled" label="Company Pays" valuePropName="checked" extra="Allow Alygo to cover the full background check fee">
          <Switch checkedChildren="ON" unCheckedChildren="OFF" />
        </Form.Item>

        <Form.Item name="splitPaymentEnabled" label="Split Payment" valuePropName="checked" extra="Enable shared payment between driver and company">
          <Switch checkedChildren="ON" unCheckedChildren="OFF" />
        </Form.Item>

        <div className="grid gap-4 sm:grid-cols-2">
          <Form.Item name="driverPaysPercent" label="Driver Share (%)" rules={[{ required: true }]}>
            <InputNumber min={0} max={100} className="w-full" addonAfter="%" />
          </Form.Item>
          <Form.Item name="companyPaysPercent" label="Company Share (%)" rules={[{ required: true }]}>
            <InputNumber min={0} max={100} className="w-full" addonAfter="%" />
          </Form.Item>
        </div>

        <h4 className="mb-3 mt-6 text-sm font-semibold uppercase tracking-wider text-alygo-text-muted">Automatic Refund Rules</h4>

        <Form.Item name="automaticRefundEnabled" label="Automatic Refunds" valuePropName="checked" extra="Process eligible refunds without manual review">
          <Switch checkedChildren="ON" unCheckedChildren="OFF" />
        </Form.Item>

        <Form.Item name="refundOnRejection" label="Refund on Rejection" valuePropName="checked" extra="Refund fee when background check is rejected">
          <Switch checkedChildren="ON" unCheckedChildren="OFF" />
        </Form.Item>

        <Form.Item name="refundOnWithdrawal" label="Refund on Withdrawal" valuePropName="checked" extra="Refund fee when driver withdraws application before processing">
          <Switch checkedChildren="ON" unCheckedChildren="OFF" />
        </Form.Item>

        <Form.Item name="refundOnDuplicateCharge" label="Refund on Duplicate Charge" valuePropName="checked" extra="Automatically refund duplicate payment attempts">
          <Switch checkedChildren="ON" unCheckedChildren="OFF" />
        </Form.Item>

        <Form.Item name="partialRefundOnAppeal" label="Partial Refund on Appeal" valuePropName="checked" extra="Allow partial refund when appeal is partially upheld">
          <Switch checkedChildren="ON" unCheckedChildren="OFF" />
        </Form.Item>

        <Form.Item name="refundProcessingDays" label="Refund Processing Time" rules={[{ required: true }]}>
          <InputNumber min={1} max={30} className="w-full" addonAfter="business days" />
        </Form.Item>

        <Button type="primary" htmlType="submit" loading={saving} icon={<Save className="h-4 w-4" />}>
          Save Payment Rules
        </Button>
      </Form>
    </div>
  )
}
