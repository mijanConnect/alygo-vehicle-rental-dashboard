import { Form, Input, Modal, Select } from 'antd'
import { useEffect, useMemo } from 'react'
import {
  useGetRolesListQuery,
  type CreateControllerPayload,
} from '@/redux/api/roleBaseAccessApi'

interface CreateControllerModalProps {
  open: boolean
  loading?: boolean
  onCancel: () => void
  onSubmit: (payload: CreateControllerPayload) => Promise<void>
}

const COUNTRY_CODE_OPTIONS = [
  { value: '+1', label: '+1 (US/CA)' },
  { value: '+44', label: '+44 (UK)' },
  { value: '+880', label: '+880 (BD)' },
  { value: '+91', label: '+91 (IN)' },
]

export function CreateControllerModal({
  open,
  loading,
  onCancel,
  onSubmit,
}: CreateControllerModalProps) {
  const [form] = Form.useForm<CreateControllerPayload>()
  const { data: rolesData, isLoading: rolesLoading } = useGetRolesListQuery(
    { page: 1, limit: 100 },
    { skip: !open },
  )

  const roleOptions = useMemo(
    () =>
      (rolesData?.data ?? []).map((role) => ({
        value: role.id,
        label: role.name,
      })),
    [rolesData?.data],
  )

  useEffect(() => {
    if (!open) return
    form.resetFields()
    form.setFieldsValue({ countryCode: '+1' })
  }, [open, form])

  const handleOk = async () => {
    const values = await form.validateFields()
    await onSubmit({
      name: values.name.trim(),
      email: values.email.trim(),
      password: values.password,
      phone: values.phone.trim(),
      countryCode: values.countryCode,
      roleId: values.roleId,
    })
  }

  return (
    <Modal
      title="Add New Controller"
      open={open}
      onCancel={onCancel}
      onOk={handleOk}
      okText="Create Controller"
      confirmLoading={loading}
      destroyOnClose
      width={560}
    >
      <Form form={form} layout="vertical" className="mt-4">
        <Form.Item
          name="name"
          label="Full Name"
          rules={[{ required: true, message: 'Name is required' }]}
        >
          <Input placeholder="e.g. Jowel Ahmed" />
        </Form.Item>
        <Form.Item
          name="email"
          label="Email"
          rules={[
            { required: true, message: 'Email is required' },
            { type: 'email', message: 'Enter a valid email' },
          ]}
        >
          <Input placeholder="name@example.com" />
        </Form.Item>
        <Form.Item
          name="password"
          label="Password"
          rules={[
            { required: true, message: 'Password is required' },
            { min: 6, message: 'Password must be at least 6 characters' },
          ]}
        >
          <Input.Password placeholder="Enter password" />
        </Form.Item>
        <div className="grid grid-cols-1 gap-0 sm:grid-cols-[140px_1fr] sm:gap-3">
          <Form.Item
            name="countryCode"
            label="Code"
            rules={[{ required: true, message: 'Required' }]}
          >
            <Select options={COUNTRY_CODE_OPTIONS} />
          </Form.Item>
          <Form.Item
            name="phone"
            label="Phone"
            rules={[{ required: true, message: 'Phone is required' }]}
          >
            <Input placeholder="Phone number" />
          </Form.Item>
        </div>
        <Form.Item
          name="roleId"
          label="Role"
          rules={[{ required: true, message: 'Select a role' }]}
        >
          <Select
            showSearch
            optionFilterProp="label"
            loading={rolesLoading}
            placeholder="Select role"
            options={roleOptions}
          />
        </Form.Item>
      </Form>
    </Modal>
  )
}
