import { Form, Input, Modal, Select } from 'antd'
import type { CancellationReasonType } from '@/types/cancellation'

export interface ReasonFormValues {
  name: string
  description: string
  userType: CancellationReasonType
}

interface ReasonFormModalProps {
  open: boolean
  title: string
  initialValues?: ReasonFormValues
  userTypeDisabled?: boolean
  confirmLoading?: boolean
  onCancel: () => void
  onSubmit: (values: ReasonFormValues) => void
}

const USER_TYPE_OPTIONS = [
  { value: 'passenger', label: 'Passenger' },
  { value: 'driver', label: 'Driver' },
]

const DEFAULT_VALUES: ReasonFormValues = {
  name: '',
  description: '',
  userType: 'passenger',
}

function ReasonFormModal({
  open,
  title,
  initialValues,
  userTypeDisabled,
  confirmLoading,
  onCancel,
  onSubmit,
}: ReasonFormModalProps) {
  const [form] = Form.useForm<ReasonFormValues>()

  return (
    <Modal
      title={title}
      open={open}
      confirmLoading={confirmLoading}
      onCancel={onCancel}
      onOk={() => {
        form.validateFields().then(onSubmit)
      }}
      destroyOnClose
      afterOpenChange={(visible) => {
        if (visible) {
          form.setFieldsValue(initialValues ?? DEFAULT_VALUES)
        }
      }}
    >
      <Form form={form} layout="vertical" className="mt-4">
        <Form.Item
          name="name"
          label="Reason Name"
          rules={[{ required: true, message: 'Please enter a reason name' }]}
        >
          <Input
            placeholder="e.g. Driver is taking too long"
            className="!h-[45px]"
          />
        </Form.Item>
        <Form.Item
          name="description"
          label="Description"
          rules={[{ required: true, message: 'Please enter a description' }]}
        >
          <Input.TextArea
            rows={3}
            placeholder="Explain when this reason should be used"
          />
        </Form.Item>
        <Form.Item
          name="userType"
          label="User Type"
          rules={[{ required: true, message: 'Please select a user type' }]}
        >
          <Select
            options={USER_TYPE_OPTIONS}
            disabled={userTypeDisabled}
            className="!h-[45px] [&_.ant-select-selector]:!h-[45px] [&_.ant-select-selector]:!items-center"
          />
        </Form.Item>
      </Form>
    </Modal>
  )
}

interface CreateReasonModalProps {
  open: boolean
  confirmLoading?: boolean
  onCancel: () => void
  onSubmit: (values: ReasonFormValues) => void
}

export function CreateReasonModal({
  open,
  confirmLoading,
  onCancel,
  onSubmit,
}: CreateReasonModalProps) {
  return (
    <ReasonFormModal
      open={open}
      title="Add Cancellation Reason"
      confirmLoading={confirmLoading}
      onCancel={onCancel}
      onSubmit={onSubmit}
    />
  )
}

interface EditReasonModalProps {
  open: boolean
  initialValues: ReasonFormValues
  confirmLoading?: boolean
  onCancel: () => void
  onSubmit: (values: ReasonFormValues) => void
}

export function EditReasonModal({
  open,
  initialValues,
  confirmLoading,
  onCancel,
  onSubmit,
}: EditReasonModalProps) {
  return (
    <ReasonFormModal
      open={open}
      title="Edit Cancellation Reason"
      initialValues={initialValues}
      confirmLoading={confirmLoading}
      onCancel={onCancel}
      onSubmit={onSubmit}
    />
  )
}
