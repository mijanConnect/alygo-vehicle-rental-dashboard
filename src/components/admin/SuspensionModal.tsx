import { Form, Input, Modal } from 'antd'

interface SuspensionModalProps {
  open: boolean
  title: string
  entityLabel: string
  loading?: boolean
  onConfirm: (reason?: string) => void
  onCancel: () => void
}

export function SuspensionModal({
  open,
  title,
  entityLabel,
  loading,
  onConfirm,
  onCancel,
}: SuspensionModalProps) {
  const [form] = Form.useForm<{ reason?: string }>()

  return (
    <Modal
      title={title}
      open={open}
      okText="Confirm"
      okButtonProps={{ danger: true }}
      onCancel={() => {
        form.resetFields()
        onCancel()
      }}
      onOk={() => form.validateFields().then((values) => onConfirm(values.reason))}
      confirmLoading={loading}
      destroyOnClose
    >
      <p className="mb-4 text-alygo-text-muted">{entityLabel}</p>
      <Form form={form} layout="vertical">
        <Form.Item name="reason" label="Reason" rules={[{ required: true, message: 'Reason is required' }]}>
          <Input.TextArea rows={3} placeholder="Enter reason..." />
        </Form.Item>
      </Form>
    </Modal>
  )
}
