import { useEffect } from 'react'
import { Form, Input, InputNumber, Modal, Select, Switch } from 'antd'
import {
  AI_SUPPORT_CATEGORY_OPTIONS,
  AI_SUPPORT_MODULE_OPTIONS,
  AI_SUPPORT_ROLE_OPTIONS,
  AI_SUPPORT_TAG_OPTIONS,
  AI_SUPPORT_VISIBILITY_OPTIONS,
} from '@/features/ai-support/aiSupportHelpers'
import {
  AI_KNOWLEDGE_CATEGORY,
  AI_KNOWLEDGE_MODULE,
  type AiKnowledgeCategory,
  type AiKnowledgeModule,
  type AiKnowledgeTag,
  type AiSupportItem,
  type AiSupportWritePayload,
} from '@/redux/api/aiSupportApi'

export interface AiSupportFormValues {
  title: string
  module: AiKnowledgeModule
  category: AiKnowledgeCategory
  content: string
  tags: AiKnowledgeTag[]
  keywords: string[]
  priority: number
  aiEnabled: boolean
  visibility: string
  allowedRoles: string[]
  changeLog: string
}

interface AiSupportFormModalProps {
  open: boolean
  mode: 'create' | 'edit'
  initialValues?: AiSupportItem | null
  loading?: boolean
  onCancel: () => void
  onSubmit: (payload: AiSupportWritePayload) => Promise<void>
}

const defaultValues: AiSupportFormValues = {
  title: '',
  module: AI_KNOWLEDGE_MODULE.REFERRAL,
  category: AI_KNOWLEDGE_CATEGORY.REWARDS,
  content: '',
  tags: [],
  keywords: [],
  priority: 10,
  aiEnabled: true,
  visibility: 'driver',
  allowedRoles: ['driver'],
  changeLog: '',
}

export function AiSupportFormModal({
  open,
  mode,
  initialValues,
  loading,
  onCancel,
  onSubmit,
}: AiSupportFormModalProps) {
  const [form] = Form.useForm<AiSupportFormValues>()

  useEffect(() => {
    if (!open) return

    if (mode === 'edit' && initialValues) {
      form.setFieldsValue({
        title: initialValues.title,
        module: initialValues.module as AiKnowledgeModule,
        category: initialValues.category as AiKnowledgeCategory,
        content: initialValues.content,
        tags: (initialValues.tags ?? []) as AiKnowledgeTag[],
        keywords: initialValues.keywords ?? [],
        priority: initialValues.priority ?? 10,
        aiEnabled: initialValues.aiEnabled ?? true,
        visibility: initialValues.visibility ?? 'driver',
        allowedRoles: initialValues.allowedRoles ?? ['driver'],
        changeLog: initialValues.changeLog ?? '',
      })
    } else {
      form.setFieldsValue(defaultValues)
    }
  }, [open, mode, initialValues, form])

  const handleOk = async () => {
    const values = await form.validateFields()
    await onSubmit({
      title: values.title.trim(),
      module: values.module,
      category: values.category,
      content: values.content.trim(),
      tags: values.tags ?? [],
      keywords: (values.keywords ?? []).map((keyword) => keyword.trim()).filter(Boolean),
      priority: values.priority,
      aiEnabled: values.aiEnabled,
      visibility: values.visibility,
      allowedRoles: values.allowedRoles ?? [],
      changeLog: values.changeLog.trim(),
    })
  }

  return (
    <Modal
      title={mode === 'create' ? 'Create Knowledge Article' : 'Edit Knowledge Article'}
      open={open}
      onCancel={onCancel}
      onOk={() => void handleOk()}
      okText={mode === 'create' ? 'Create Article' : 'Save Changes'}
      confirmLoading={loading}
      destroyOnClose
      width={720}
    >
      <Form form={form} layout="vertical" className="mt-4">
        <Form.Item
          name="title"
          label="Title"
          rules={[{ required: true, message: 'Enter a title' }]}
        >
          <Input placeholder="e.g. Driver Referral Reward Program" />
        </Form.Item>

        <div className="grid gap-4 sm:grid-cols-2">
          <Form.Item
            name="module"
            label="Module"
            rules={[{ required: true, message: 'Select a module' }]}
          >
            <Select
              showSearch
              optionFilterProp="label"
              options={AI_SUPPORT_MODULE_OPTIONS}
              placeholder="Select module"
            />
          </Form.Item>
          <Form.Item
            name="category"
            label="Category"
            rules={[{ required: true, message: 'Select a category' }]}
          >
            <Select
              showSearch
              optionFilterProp="label"
              options={AI_SUPPORT_CATEGORY_OPTIONS}
              placeholder="Select category"
            />
          </Form.Item>
        </div>

        <Form.Item
          name="content"
          label="Content"
          rules={[{ required: true, message: 'Enter content' }]}
        >
          <Input.TextArea rows={6} placeholder="Knowledge article content..." />
        </Form.Item>

        <Form.Item
          name="tags"
          label="Tags"
          rules={[{ required: true, message: 'Select at least one tag' }]}
        >
          <Select
            mode="multiple"
            showSearch
            optionFilterProp="label"
            options={AI_SUPPORT_TAG_OPTIONS}
            placeholder="Select tags"
          />
        </Form.Item>

        <Form.Item
          name="keywords"
          label="Keywords"
          rules={[{ required: true, message: 'Add at least one keyword' }]}
        >
          <Select
            mode="tags"
            tokenSeparators={[',']}
            placeholder="Add keywords and press Enter"
            options={[]}
          />
        </Form.Item>

        <div className="grid gap-4 sm:grid-cols-2">
          <Form.Item
            name="priority"
            label="Priority"
            rules={[{ required: true, message: 'Enter priority' }]}
          >
            <InputNumber min={0} className="w-full" />
          </Form.Item>
          <Form.Item
            name="visibility"
            label="Visibility"
            rules={[{ required: true, message: 'Select visibility' }]}
          >
            <Select options={AI_SUPPORT_VISIBILITY_OPTIONS} />
          </Form.Item>
        </div>

        <Form.Item
          name="allowedRoles"
          label="Allowed Roles"
          rules={[{ required: true, message: 'Select at least one role' }]}
        >
          <Select mode="multiple" options={AI_SUPPORT_ROLE_OPTIONS} placeholder="Select roles" />
        </Form.Item>

        <Form.Item name="aiEnabled" label="AI Enabled" valuePropName="checked">
          <Switch />
        </Form.Item>

        <Form.Item
          name="changeLog"
          label="Change Log"
          rules={[{ required: true, message: 'Enter a change log note' }]}
        >
          <Input.TextArea
            rows={2}
            placeholder="e.g. Initial knowledge article for Driver Referral Reward Program."
          />
        </Form.Item>
      </Form>
    </Modal>
  )
}
