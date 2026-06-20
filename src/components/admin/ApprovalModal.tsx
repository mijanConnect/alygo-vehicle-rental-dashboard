import { Form, Input, Modal } from 'antd'

interface ApprovalModalProps {
  open: boolean
  title: string
  entityLabel: string
  loading?: boolean
  onApprove: (notes?: string) => void
  onCancel: () => void
}

export function ApprovalModal({
  open,
  title,
  entityLabel,
  loading,
  onApprove,
  onCancel,
}: ApprovalModalProps) {
  const [form] = Form.useForm<{ notes?: string }>()

  return (
    <Modal
      title={title}
      open={open}
      okText="Approve"
      onCancel={() => {
        form.resetFields()
        onCancel()
      }}
      onOk={() => form.validateFields().then((values) => onApprove(values.notes))}
      confirmLoading={loading}
      destroyOnClose
    >
      <p className="mb-4 text-alygo-text-muted">Approve {entityLabel}?</p>
      <Form form={form} layout="vertical">
        <Form.Item name="notes" label="Approval Notes (optional)">
          <Input.TextArea rows={3} placeholder="Add internal notes..." />
        </Form.Item>
      </Form>
    </Modal>
  )
}
