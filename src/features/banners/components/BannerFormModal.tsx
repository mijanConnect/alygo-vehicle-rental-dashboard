import { Form, Input, Modal, Upload } from 'antd'
import type { UploadFile } from 'antd/es/upload/interface'
import { ImagePlus } from 'lucide-react'
import { useEffect, useState } from 'react'
import { resolveBannerImageUrl } from '@/features/banners/bannerHelpers'
import type { BannerItem } from '@/redux/api/bannerManageApi'

export interface BannerFormValues {
  name: string
  description: string
  image?: File
}

interface BannerFormModalProps {
  open: boolean
  mode: 'create' | 'edit'
  initialValues?: BannerItem | null
  loading?: boolean
  onCancel: () => void
  onSubmit: (values: BannerFormValues) => Promise<void>
}

export function BannerFormModal({
  open,
  mode,
  initialValues,
  loading,
  onCancel,
  onSubmit,
}: BannerFormModalProps) {
  const [form] = Form.useForm<BannerFormValues>()
  const [fileList, setFileList] = useState<UploadFile[]>([])
  const [previewUrl, setPreviewUrl] = useState<string | undefined>()

  useEffect(() => {
    if (!open) return

    if (mode === 'edit' && initialValues) {
      form.setFieldsValue({
        name: initialValues.name,
        description: initialValues.description,
      })
      const existingUrl = resolveBannerImageUrl(initialValues.image)
      setPreviewUrl(existingUrl)
      setFileList(
        existingUrl
          ? [
              {
                uid: '-1',
                name: 'banner-image',
                status: 'done',
                url: existingUrl,
              },
            ]
          : [],
      )
    } else {
      form.resetFields()
      setPreviewUrl(undefined)
      setFileList([])
    }
  }, [open, mode, initialValues, form])

  const handleOk = async () => {
    const values = await form.validateFields()
    const imageFile = fileList[0]?.originFileObj as File | undefined

    if (mode === 'create' && !imageFile) {
      form.setFields([
        {
          name: 'image',
          errors: ['Banner image is required'],
        },
      ])
      return
    }

    await onSubmit({
      name: values.name,
      description: values.description,
      image: imageFile,
    })
  }

  return (
    <Modal
      title={mode === 'create' ? 'Create Banner' : 'Edit Banner'}
      open={open}
      onCancel={onCancel}
      onOk={handleOk}
      okText={mode === 'create' ? 'Create Banner' : 'Save Changes'}
      confirmLoading={loading}
      destroyOnClose
      width={560}
    >
      <Form form={form} layout="vertical" className="mt-4">
        <Form.Item
          name="name"
          label="Banner Name"
          rules={[{ required: true, message: 'Banner name is required' }]}
        >
          <Input placeholder="e.g. Summer Promo" />
        </Form.Item>
        <Form.Item
          name="description"
          label="Description"
          rules={[{ required: true, message: 'Description is required' }]}
        >
          <Input.TextArea rows={3} placeholder="Describe this banner" />
        </Form.Item>
        <Form.Item
          name="image"
          label="Banner Image"
          required={mode === 'create'}
          extra={mode === 'edit' ? 'Leave empty to keep the current image.' : undefined}
        >
          <Upload
            listType="picture-card"
            accept="image/*"
            maxCount={1}
            fileList={fileList}
            beforeUpload={() => false}
            onChange={({ fileList: next }) => {
              const latest = next.slice(-1)
              setFileList(latest)
              const file = latest[0]?.originFileObj
              if (file) {
                const url = URL.createObjectURL(file)
                setPreviewUrl(url)
              } else if (!latest[0]?.url) {
                setPreviewUrl(undefined)
              }
              form.setFields([{ name: 'image', errors: [] }])
            }}
            onRemove={() => {
              setFileList([])
              setPreviewUrl(mode === 'edit' ? resolveBannerImageUrl(initialValues?.image) : undefined)
            }}
          >
            {fileList.length >= 1 ? null : (
              <div className="flex flex-col items-center gap-1 text-alygo-text-muted">
                <ImagePlus className="h-5 w-5" />
                <span className="text-xs">Upload</span>
              </div>
            )}
          </Upload>
          {previewUrl && fileList.length === 0 ? (
            <img
              src={previewUrl}
              alt="Current banner"
              className="mt-2 h-24 w-auto rounded-md object-cover"
            />
          ) : null}
        </Form.Item>
      </Form>
    </Modal>
  )
}
