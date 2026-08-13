import { useEffect, useState } from 'react'
import { Button, Spin, Tabs } from 'antd'
import ReactQuill from 'react-quill-new'
import 'react-quill-new/dist/quill.snow.css'
import { useSearchParams } from 'react-router-dom'
import { AdminActionHost } from '@/components/admin'
import { PageShell } from '@/components/common/PageShell'
import { useAdminActions } from '@/hooks/useAdminActions'
import { useDocumentTitle } from '@/hooks/useDocumentTitle'
import {
  useCreateCmsMutation,
  useGetCmsByTypeQuery,
  type CmsRuleType,
} from '@/redux/api/cmsManageApi'

const LEGAL_TABS: { key: CmsRuleType; label: string }[] = [
  { key: 'terms', label: 'Terms and Conditions' },
  { key: 'privacy', label: 'Privacy Policy' },
  { key: 'about', label: 'About Us' },
]

function resolveLegalTab(tab: string | null): CmsRuleType {
  if (tab === 'privacy' || tab === 'about' || tab === 'terms') return tab
  return 'terms'
}

const quillModules = {
  toolbar: [
    [{ header: [1, 2, 3, 4, 5, 6, false] }],
    ['bold', 'italic', 'underline', 'strike'],
    [{ list: 'ordered' }, { list: 'bullet' }],
    ['link', 'clean'],
  ],
}

const quillClassName =
  'mb-12 h-[400px] bg-transparent text-white [&_.ql-container]:border-none [&_.ql-fill]:fill-white [&_.ql-picker]:text-white [&_.ql-stroke]:stroke-white [&_.ql-toolbar]:border-none'

export default function LegalSettingsPage() {
  useDocumentTitle('Legal & Policies')
  const adminActions = useAdminActions()
  const [searchParams, setSearchParams] = useSearchParams()
  const activeTab = resolveLegalTab(searchParams.get('tab'))

  const [content, setContent] = useState('')
  const { data, isLoading, isFetching, isError } = useGetCmsByTypeQuery(activeTab)
  const [createCms, { isLoading: saving }] = useCreateCmsMutation()

  useEffect(() => {
    if (data?.content != null) {
      setContent(data.content)
      return
    }
    if (isError) {
      setContent('')
    }
  }, [data, isError, activeTab])

  const handleSave = async () => {
    try {
      await createCms({
        type: activeTab,
        content,
      }).unwrap()
      adminActions.notify('Legal content saved', LEGAL_TABS.find((t) => t.key === activeTab)?.label)
    } catch {
      adminActions.notify('Unable to save legal content')
    }
  }

  return (
    <PageShell
      title="Legal & Policies"
      description="Manage Terms, Privacy Policy, and About Us content."
    >
      <div className="glass-card p-6">
        <Tabs
          activeKey={activeTab}
          onChange={(key) => setSearchParams({ tab: key })}
          items={LEGAL_TABS.map((tab) => ({
            key: tab.key,
            label: tab.label,
            children: (
              <div className="mt-4">
                {isLoading || isFetching ? (
                  <div className="flex h-[400px] items-center justify-center">
                    <Spin />
                  </div>
                ) : (
                  <ReactQuill
                    theme="snow"
                    value={content}
                    onChange={setContent}
                    modules={quillModules}
                    className={quillClassName}
                  />
                )}
              </div>
            ),
          }))}
        />
        <div className="mt-6 flex justify-end">
          <Button type="primary" onClick={handleSave} loading={saving} disabled={isLoading || isFetching}>
            Save Changes
          </Button>
        </div>
      </div>
      <AdminActionHost actions={adminActions} />
    </PageShell>
  )
}
