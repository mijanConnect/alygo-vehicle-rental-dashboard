import { Form, Input, InputNumber, Modal, Select, Switch } from 'antd'
import type { CancellationReasonType } from '@/types/cancellation'

export interface ReasonFormValues {
  name: string
  userType: CancellationReasonType
  sortOrder: number
  active: boolean
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
  userType: 'passenger',
  sortOrder: 1,
  active: true,
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
          <Input placeholder="e.g. Changed My Mind" />
        </Form.Item>
        <Form.Item
          name="userType"
          label="User Type"
          rules={[{ required: true, message: 'Please select a user type' }]}
        >
          <Select options={USER_TYPE_OPTIONS} disabled={userTypeDisabled} />
        </Form.Item>
        <Form.Item
          name="sortOrder"
          label="Sort Order"
          rules={[{ required: true, message: 'Please enter a sort order' }]}
        >
          <InputNumber min={1} className="w-full" placeholder="Display order in the mobile app" />
        </Form.Item>
        <Form.Item name="active" label="Active" valuePropName="checked">
          <Switch checkedChildren="Active" unCheckedChildren="Inactive" />
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
      userTypeDisabled
      confirmLoading={confirmLoading}
      onCancel={onCancel}
      onSubmit={onSubmit}
    />
  )
}
