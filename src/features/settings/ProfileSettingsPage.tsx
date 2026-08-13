import { useEffect, useState } from 'react'
import { Avatar, Button, Form, Input, Select, Spin, Tag, Upload } from 'antd'
import type { UploadFile } from 'antd/es/upload/interface'
import { ImagePlus } from 'lucide-react'
import { AdminActionHost } from '@/components/admin'
import { PageShell } from '@/components/common/PageShell'
import { useAdminActions } from '@/hooks/useAdminActions'
import { useDocumentTitle } from '@/hooks/useDocumentTitle'
import {
  useGetProfileQuery,
  useUpdateProfileMutation,
  type UpdateProfileRequest,
} from '@/redux/api/authApi'
import { formatDateTime } from '@/utils/format'

const API_BASE = import.meta.env.VITE_API_BASE_URL?.replace(/\/api\/v1\/?$/, '') ?? ''

function resolveAssetUrl(path?: string | null) {
  if (!path) return undefined
  if (path.startsWith('http') || path.startsWith('blob:')) return path
  return `${API_BASE}${path}`
}

const GENDER_OPTIONS = [
  { label: 'Male', value: 'male' },
  { label: 'Female', value: 'female' },
  { label: 'Other', value: 'other' },
]

const COUNTRY_CODE_OPTIONS = [
  { value: '+1', label: '+1 (US/CA)' },
  { value: '+44', label: '+44 (UK)' },
  { value: '+880', label: '+880 (BD)' },
  { value: '+91', label: '+91 (IN)' },
]

interface ProfileFormValues {
  name: string
  email: string
  phone?: string
  countryCode?: string
  gender?: string
}

export default function ProfileSettingsPage() {
  useDocumentTitle('Profile')
  const adminActions = useAdminActions()
  const [form] = Form.useForm<ProfileFormValues>()
  const { data: profile, isLoading, isFetching } = useGetProfileQuery()
  const [updateProfile, { isLoading: saving }] = useUpdateProfileMutation()

  const [fileList, setFileList] = useState<UploadFile[]>([])
  const [previewUrl, setPreviewUrl] = useState<string | undefined>()

  useEffect(() => {
    if (!profile) return
    form.setFieldsValue({
      name: profile.name ?? '',
      email: profile.email ?? '',
      phone: profile.phone ?? '',
      countryCode: profile.countryCode ?? '+1',
      gender: profile.gender,
    })
    const existing = resolveAssetUrl(profile.profileImage)
    setPreviewUrl(existing)
    setFileList(
      existing
        ? [
            {
              uid: '-1',
              name: 'profile-image',
              status: 'done',
              url: existing,
            },
          ]
        : [],
    )
  }, [profile, form])

  const handleSave = async () => {
    try {
      const values = await form.validateFields()
      const imageFile = fileList[0]?.originFileObj as File | undefined
      const payload: UpdateProfileRequest = {
        name: values.name.trim(),
        email: values.email.trim(),
        phone: values.phone?.trim(),
        countryCode: values.countryCode,
        gender: values.gender,
      }
      if (imageFile) {
        payload.profileImage = imageFile
      }

      await updateProfile(payload).unwrap()
      adminActions.notify('Profile updated', values.name)
    } catch {
      adminActions.notify('Unable to update profile')
    }
  }

  return (
    <PageShell
      title="Profile"
      description="View and update your account profile information."
      actions={
        <Button type="primary" onClick={handleSave} loading={saving} disabled={isLoading || isFetching}>
          Save Changes
        </Button>
      }
    >
      <div className="glass-card max-w-3xl p-6">
        {isLoading || isFetching ? (
          <div className="flex justify-center py-16">
            <Spin />
          </div>
        ) : !profile ? (
          <p className="text-alygo-text-muted">Unable to load profile.</p>
        ) : (
          <>
            <div className="mb-6 flex flex-wrap items-center gap-4">
              <Avatar size={72} src={previewUrl}>
                {profile.name?.charAt(0) || 'U'}
              </Avatar>
              <div>
                <h3 className="text-lg font-semibold text-white">{profile.name}</h3>
                <div className="mt-1 flex flex-wrap gap-2">
                  <Tag>{profile.role}</Tag>
                  <Tag color={profile.status === 'active' ? 'success' : 'default'}>
                    {profile.status}
                  </Tag>
                  {profile.verified ? <Tag color="blue">Verified</Tag> : null}
                </div>
                <p className="mt-1 text-sm text-alygo-text-muted">
                  Joined {profile.createdAt ? formatDateTime(profile.createdAt) : '—'}
                </p>
              </div>
            </div>

            <Form form={form} layout="vertical">
              <Form.Item label="Profile Image">
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
                      setPreviewUrl(URL.createObjectURL(file))
                    } else if (latest[0]?.url) {
                      setPreviewUrl(latest[0].url)
                    } else {
                      setPreviewUrl(resolveAssetUrl(profile.profileImage))
                    }
                  }}
                >
                  {fileList.length >= 1 ? null : (
                    <div className="flex flex-col items-center gap-1 text-alygo-text-muted">
                      <ImagePlus className="h-5 w-5" />
                      <span className="text-xs">Upload</span>
                    </div>
                  )}
                </Upload>
              </Form.Item>

              <div className="grid grid-cols-1 gap-x-4 sm:grid-cols-2">
                <Form.Item
                  name="name"
                  label="Full Name"
                  rules={[{ required: true, message: 'Name is required' }]}
                >
                  <Input placeholder="Your name" />
                </Form.Item>
                <Form.Item
                  name="email"
                  label="Email"
                  rules={[
                    { required: true, message: 'Email is required' },
                    { type: 'email', message: 'Enter a valid email' },
                  ]}
                >
                  <Input placeholder="you@example.com" />
                </Form.Item>
                <Form.Item name="gender" label="Gender">
                  <Select allowClear options={GENDER_OPTIONS} placeholder="Select gender" />
                </Form.Item>
                <Form.Item name="countryCode" label="Country Code">
                  <Select options={COUNTRY_CODE_OPTIONS} />
                </Form.Item>
                <Form.Item name="phone" label="Phone" className="sm:col-span-2">
                  <Input placeholder="Phone number" />
                </Form.Item>
              </div>
            </Form>
          </>
        )}
      </div>
      <AdminActionHost actions={adminActions} />
    </PageShell>
  )
}
