import { Checkbox, Form, Input, Modal, Spin } from 'antd'
import { useEffect, useMemo } from 'react'
import { getPermissionDisplayName } from '@/features/settings/rbacPermissionLabels'
import {
  useGetAllPermissionsPagelistQuery,
  type CreateRolePayload,
} from '@/redux/api/roleBaseAccessApi'

interface CreateRoleModalProps {
  open: boolean
  loading?: boolean
  onCancel: () => void
  onSubmit: (payload: CreateRolePayload) => Promise<void>
}

export function CreateRoleModal({ open, loading, onCancel, onSubmit }: CreateRoleModalProps) {
  const [form] = Form.useForm<CreateRolePayload>()
  const { data, isLoading, isFetching } = useGetAllPermissionsPagelistQuery(
    { page: 1, limit: 200 },
    { skip: !open },
  )

  const permissionOptions = useMemo(() => {
    return (data?.data ?? []).map((item) => ({
      value: item.permission.id,
      label: getPermissionDisplayName(item.module, item.permission.name),
      description: item.permission.description,
    }))
  }, [data?.data])

  useEffect(() => {
    if (!open) return
    form.resetFields()
  }, [open, form])

  const handleOk = async () => {
    const values = await form.validateFields()
    await onSubmit({
      name: values.name.trim(),
      description: values.description.trim(),
      permissions: values.permissions,
    })
  }

  return (
    <Modal
      title="Add New Role"
      open={open}
      onCancel={onCancel}
      onOk={handleOk}
      okText="Create Role"
      confirmLoading={loading}
      okButtonProps={{ disabled: isLoading || isFetching }}
      destroyOnClose
      width={720}
    >
      {isLoading || isFetching ? (
        <div className="flex justify-center py-10">
          <Spin />
        </div>
      ) : (
        <Form form={form} layout="vertical" className="mt-4">
          <Form.Item
            name="name"
            label="Role Name"
            rules={[{ required: true, message: 'Role name is required' }]}
          >
            <Input placeholder="e.g. Manager" />
          </Form.Item>
          <Form.Item
            name="description"
            label="Description"
            rules={[{ required: true, message: 'Description is required' }]}
          >
            <Input.TextArea
              rows={3}
              placeholder="Describe what this role can manage"
            />
          </Form.Item>
          <Form.Item
            name="permissions"
            label="Permissions"
            rules={[
              { required: true, message: 'Select at least one permission' },
              { type: 'array', min: 1, message: 'Select at least one permission' },
            ]}
          >
            <Checkbox.Group className="w-full !block">
              <div className="grid max-h-72 grid-cols-1 gap-2 overflow-y-auto pr-1 sm:grid-cols-2">
                {permissionOptions.map((option) => (
                  <Checkbox
                    key={option.value}
                    value={option.value}
                    className="!m-0 !pl-1 !mr-0 items-start rounded-lg  px-3 py-2 hover:border-white/50 [&_.ant-checkbox]:mt-1"
                  >
                    <span className="block text-sm text-white">{option.label}</span>
                    {/* {option.description ? (
                      <span className="mt-0.5 block whitespace-normal text-xs text-alygo-text-muted">
                        {option.description}
                      </span>
                    ) : null} */}
                  </Checkbox>
                ))}
              </div>
            </Checkbox.Group>
          </Form.Item>
        </Form>
      )}
    </Modal>
  )
}
