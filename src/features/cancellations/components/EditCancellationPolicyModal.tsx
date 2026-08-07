import { Form, InputNumber, Modal } from 'antd'
import type { UpdateCancellationPolicyBody } from '@/redux/api/cancellationPolicyApi'

export type CancellationPolicyFormValues = UpdateCancellationPolicyBody

interface EditCancellationPolicyModalProps {
  open: boolean
  initialValues: CancellationPolicyFormValues
  confirmLoading?: boolean
  onCancel: () => void
  onSubmit: (values: CancellationPolicyFormValues) => void
}

function FeeFields({
  prefix,
  withDriverCompensation = true,
}: {
  prefix: (string | number)[]
  withDriverCompensation?: boolean
}) {
  return (
    <div className="grid gap-3 sm:grid-cols-3">
      <Form.Item
        name={[...prefix, 'cancellationFee']}
        label="Cancellation Fee"
        rules={[{ required: true, message: 'Required' }]}
        className="!mb-0"
      >
        <InputNumber min={0} className="!h-[45px] w-full" controls={false} />
      </Form.Item>
      <Form.Item
        name={[...prefix, 'platformShare']}
        label="Platform Share"
        rules={[{ required: true, message: 'Required' }]}
        className="!mb-0"
      >
        <InputNumber min={0} className="!h-[45px] w-full" controls={false} />
      </Form.Item>
      {withDriverCompensation && (
        <Form.Item
          name={[...prefix, 'driverCompensation']}
          label="Driver Compensation"
          rules={[{ required: true, message: 'Required' }]}
          className="!mb-0"
        >
          <InputNumber min={0} className="!h-[45px] w-full" controls={false} />
        </Form.Item>
      )}
    </div>
  )
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="rounded-xl border border-white/10 bg-white/[0.03] p-4">
      <h4 className="mb-3 text-sm font-semibold text-white">{title}</h4>
      {children}
    </div>
  )
}

export function EditCancellationPolicyModal({
  open,
  initialValues,
  confirmLoading,
  onCancel,
  onSubmit,
}: EditCancellationPolicyModalProps) {
  const [form] = Form.useForm<CancellationPolicyFormValues>()

  return (
    <Modal
      title="Edit Cancellation Policy"
      open={open}
      confirmLoading={confirmLoading}
      onCancel={onCancel}
      onOk={() => {
        form.validateFields().then(onSubmit)
      }}
      width={720}
      destroyOnClose
      okText="Save Policy"
      afterOpenChange={(visible) => {
        if (visible) form.setFieldsValue(initialValues)
      }}
    >
      <Form form={form} layout="vertical" className="mt-4 space-y-4">
        <div>
          <p className="mb-3 text-xs font-semibold uppercase tracking-wide text-alygo-text-muted">
            Passenger Rules
          </p>
          <div className="space-y-3">
            <Section title="Before Driver Accepted">
              <FeeFields prefix={['passenger', 'beforeDriverAccepted']} />
            </Section>
            <Section title="After Driver Accepted">
              <FeeFields prefix={['passenger', 'afterDriverAccepted']} />
            </Section>
            <Section title="After Driver Arrived">
              <FeeFields prefix={['passenger', 'afterDriverArrived']} />
            </Section>
          </div>
        </div>

        <div>
          <p className="mb-3 text-xs font-semibold uppercase tracking-wide text-alygo-text-muted">
            Driver Rules
          </p>
          <div className="space-y-3">
            <Section title="After Accept">
              <FeeFields prefix={['driver', 'afterAccept']} withDriverCompensation={false} />
            </Section>
            <Section title="Excessive Cancellation">
              <FeeFields
                prefix={['driver', 'excessiveCancellation']}
                withDriverCompensation={false}
              />
            </Section>
            <Section title="Excessive Cancellation Threshold">
              <Form.Item
                name={['driver', 'excessiveCancellationThreshold']}
                label="Threshold (cancellations)"
                rules={[{ required: true, message: 'Required' }]}
                className="!mb-0 max-w-xs"
              >
                <InputNumber min={1} className="!h-[45px] w-full" controls={false} />
              </Form.Item>
            </Section>
          </div>
        </div>
      </Form>
    </Modal>
  )
}
