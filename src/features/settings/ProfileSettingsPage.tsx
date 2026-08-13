import { useEffect, useState } from 'react'
import { Avatar, Button, Form, Input, Select, Spin, Tabs, Tag, Upload } from 'antd'
import { Camera } from 'lucide-react'
import { useSearchParams } from 'react-router-dom'
import { AdminActionHost } from '@/components/admin'
import { PageShell } from '@/components/common/PageShell'
import { PlatformSettingsTab } from '@/features/settings/components/PlatformSettingsTab'
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

type SettingsTabKey = 'profile' | 'platform'

function resolveTab(tab: string | null): SettingsTabKey {
  if (tab === 'platform') return 'platform'
  return 'profile'
}

interface ProfileFormValues {
  name: string
  email: string
  phone?: string
  countryCode?: string
  gender?: string
}

function ProfileTab() {
  const adminActions = useAdminActions()
  const [form] = Form.useForm<ProfileFormValues>()
  const { data: profile, isLoading, isFetching } = useGetProfileQuery()
  const [updateProfile, { isLoading: saving }] = useUpdateProfileMutation()
  const [imageFile, setImageFile] = useState<File | undefined>()
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
    setPreviewUrl(resolveAssetUrl(profile.profileImage))
    setImageFile(undefined)
  }, [profile, form])

  const handleSave = async () => {
    try {
      const values = await form.validateFields()
      const payload: UpdateProfileRequest = {
        name: values.name.trim(),
        email: values.email.trim(),
        phone: values.phone?.trim(),
        countryCode: values.countryCode,
        gender: values.gender,
      }
      if (imageFile) payload.profileImage = imageFile
      await updateProfile(payload).unwrap()
      adminActions.notify('Profile updated', values.name)
    } catch {
      adminActions.notify('Unable to update profile')
    }
  }

  if (isLoading || isFetching) {
    return (
      <div className="flex justify-center py-16">
        <Spin />
      </div>
    )
  }

  if (!profile) {
    return <p className="text-alygo-text-muted">Unable to load profile.</p>
  }

  return (
    <>
      <div className="mb-6 flex flex-wrap items-center gap-4">
        <Upload
          accept="image/*"
          showUploadList={false}
          beforeUpload={(file) => {
            setImageFile(file)
            setPreviewUrl(URL.createObjectURL(file))
            return false
          }}
        >
          <button
            type="button"
            className="group relative cursor-pointer rounded-full border-0 bg-transparent p-0"
            title="Change profile image"
          >
            <Avatar size={80} src={previewUrl}>
              {profile.name?.charAt(0) || 'U'}
            </Avatar>
            <span className="absolute inset-0 flex items-center justify-center rounded-full bg-black/50 opacity-0 transition-opacity group-hover:opacity-100">
              <Camera className="h-5 w-5 text-white" />
            </span>
          </button>
        </Upload>
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
          <p className="mt-1 text-xs text-alygo-text-muted">
            Click the avatar to update profile image
          </p>
        </div>
      </div>

      <Form form={form} layout="vertical">
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
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-[120px_1fr]">
            <Form.Item name="countryCode" label="Code">
              <Select options={COUNTRY_CODE_OPTIONS} />
            </Form.Item>
            <Form.Item name="phone" label="Phone">
              <Input placeholder="Phone number" />
            </Form.Item>
          </div>
        </div>
        <div className="mt-2 flex justify-end">
          <Button type="primary" onClick={handleSave} loading={saving}>
            Save Changes
          </Button>
        </div>
      </Form>
      <AdminActionHost actions={adminActions} />
    </>
  )
}

export default function ProfileSettingsPage() {
  useDocumentTitle('Profile')
  const [searchParams, setSearchParams] = useSearchParams()
  const activeTab = resolveTab(searchParams.get('tab'))

  return (
    <PageShell
      title="Profile"
      description="Manage your account profile and platform settings."
    >
      <div className="glass-card max-w-3xl p-4 md:p-6">
        <Tabs
          activeKey={activeTab}
          onChange={(key) => setSearchParams({ tab: key })}
          items={[
            {
              key: 'profile',
              label: 'Profile',
              children: <ProfileTab />,
            },
            {
              key: 'platform',
              label: 'Platform Settings',
              children: <PlatformSettingsTab />,
            },
          ]}
        />
      </div>
    </PageShell>
  )
}
