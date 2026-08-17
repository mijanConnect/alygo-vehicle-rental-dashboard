import { Drawer, Empty, Tag } from 'antd'
import {
  getAiSupportCategoryLabel,
  getAiSupportStatusColor,
  getAiSupportStatusLabel,
} from '@/features/ai-support/aiSupportHelpers'
import type { AiSupportItem } from '@/redux/api/aiSupportApi'

interface AiSupportDetailsDrawerProps {
  open: boolean
  record: AiSupportItem | null
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

export function AiSupportDetailsDrawer({ open, record, onClose }: AiSupportDetailsDrawerProps) {
  return (
    <Drawer
      title={record?.title || 'Article Details'}
      open={open}
      onClose={onClose}
      width={560}
      destroyOnClose
    >
      {!record ? (
        <Empty description="No article selected" />
      ) : (
        <div className="space-y-6 text-sm">
          <div className="flex flex-wrap items-center gap-2">
            <Tag color={getAiSupportStatusColor(record.status)}>
              {getAiSupportStatusLabel(record.status)}
            </Tag>
            <Tag color={record.aiEnabled ? 'success' : 'default'}>
              {record.aiEnabled ? 'AI Enabled' : 'AI Off'}
            </Tag>
          </div>

          <div className="space-y-2">
            <Field label="Module" value={record.module} />
            <Field label="Category" value={getAiSupportCategoryLabel(record.category)} />
            <Field label="Visibility" value={record.visibility} />
            <Field label="Priority" value={record.priority} />
            <Field
              label="Allowed Roles"
              value={(record.allowedRoles ?? []).join(', ') || '—'}
            />
          </div>

          <div>
            <h4 className="mb-2 text-sm font-semibold uppercase tracking-wider text-alygo-text-muted">
              Content
            </h4>
            <div className="whitespace-pre-wrap rounded-lg border border-white/10 bg-white/5 p-4 leading-relaxed text-white">
              {record.content || '—'}
            </div>
          </div>

          {(record.tags?.length ?? 0) > 0 && (
            <div>
              <h4 className="mb-2 text-sm font-semibold uppercase tracking-wider text-alygo-text-muted">
                Tags
              </h4>
              <div className="flex flex-wrap gap-2">
                {record.tags.map((tag) => (
                  <Tag key={tag}>{tag}</Tag>
                ))}
              </div>
            </div>
          )}

          {(record.keywords?.length ?? 0) > 0 && (
            <div>
              <h4 className="mb-2 text-sm font-semibold uppercase tracking-wider text-alygo-text-muted">
                Keywords
              </h4>
              <div className="flex flex-wrap gap-2">
                {record.keywords.map((keyword) => (
                  <Tag key={keyword}>{keyword}</Tag>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </Drawer>
  )
}
