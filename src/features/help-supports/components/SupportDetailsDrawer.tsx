import { Avatar, Drawer, Empty, Tag } from 'antd'
import {
  getSupportPriorityColor,
  getSupportStatusColor,
  getSupportStatusLabel,
} from '@/features/help-supports/helpSupportHelpers'
import type { HelpAndSupportsItem, SupportUser } from '@/redux/api/heplAndSupportsApi'
import { formatDateTime } from '@/utils/format'

const API_BASE = import.meta.env.VITE_API_BASE_URL?.replace(/\/api\/v1\/?$/, '') ?? ''

function resolveAssetUrl(path?: string | null) {
  if (!path) return undefined
  if (path.startsWith('http')) return path
  return `${API_BASE}${path}`
}

interface SupportDetailsDrawerProps {
  open: boolean
  record: HelpAndSupportsItem | null
  onClose: () => void
}

function Field({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="flex flex-col gap-0.5 sm:flex-row sm:gap-4">
      <span className="min-w-[120px] text-alygo-text-muted">{label}</span>
      <span className="flex-1 text-white">{value || '—'}</span>
    </div>
  )
}

export function SupportDetailsDrawer({ open, record, onClose }: SupportDetailsDrawerProps) {
  const user =
    record?.userId && typeof record.userId === 'object'
      ? (record.userId as SupportUser)
      : null

  return (
    <Drawer
      title={record?.subject || 'Support Details'}
      open={open}
      onClose={onClose}
      width={520}
      destroyOnClose
    >
      {!record ? (
        <Empty description="No support ticket selected" />
      ) : (
        <div className="space-y-6 text-sm">
          <div className="flex flex-wrap items-center gap-2">
            <Tag color={getSupportPriorityColor(record.priority)}>
              {record.priority?.toString().toUpperCase() || 'LOW'}
            </Tag>
            <Tag color={getSupportStatusColor(record.status)}>
              {getSupportStatusLabel(record.status)}
            </Tag>
          </div>

          <div className="space-y-2">
            <Field label="Name" value={record.name} />
            <Field label="Email" value={record.email} />
            <Field
              label="Created"
              value={record.createdAt ? formatDateTime(record.createdAt) : '—'}
            />
          </div>

          {user ? (
            <div>
              <h4 className="mb-3 text-sm font-semibold uppercase tracking-wider text-alygo-text-muted">
                User
              </h4>
              <div className="flex items-start gap-3 rounded-lg border border-white/10 p-3">
                <Avatar src={resolveAssetUrl(user.profileImage)} size={44}>
                  {record.name?.charAt(0) || 'U'}
                </Avatar>
                <div className="space-y-1">
                  <div className="text-white">{user.email || record.email}</div>
                  <div className="text-alygo-text-muted">
                    {user.phone ? `Phone: ${user.phone}` : 'No phone'}
                  </div>
                  <div className="text-alygo-text-muted">
                    Role: {user.role || '—'}
                  </div>
                </div>
              </div>
            </div>
          ) : null}

          <div>
            <h4 className="mb-2 text-sm font-semibold uppercase tracking-wider text-alygo-text-muted">
              Message
            </h4>
            <p className="whitespace-pre-wrap rounded-lg border border-white/10 p-3 text-white">
              {record.message || '—'}
            </p>
          </div>
        </div>
      )}
    </Drawer>
  )
}
