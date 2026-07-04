import { useState } from 'react'
import { Button, Tabs } from 'antd'
import ReactQuill from 'react-quill-new'
import 'react-quill-new/dist/quill.snow.css'
import { PageShell } from '@/components/common/PageShell'
import { AdminActionHost } from '@/components/admin'
import { useAdminActions } from '@/hooks/useAdminActions'
import { useDocumentTitle } from '@/hooks/useDocumentTitle'

const defaultTerms = `
  <h1>Terms and Conditions</h1>
  <p>Welcome to Alygo. By using our services, you agree to these terms.</p>
`

const defaultPrivacy = `
  <h1>Privacy Policy</h1>
  <p>We take your privacy seriously. This document outlines how we collect and use your data.</p>
`

export default function LegalSettingsPage() {
  useDocumentTitle('Legal & Policies')
  const adminActions = useAdminActions()
  const [loading, setLoading] = useState(false)

  const [terms, setTerms] = useState(defaultTerms)
  const [privacy, setPrivacy] = useState(defaultPrivacy)

  const handleSave = async () => {
    setLoading(true)
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000))
      adminActions.notify('Legal settings updated successfully', 'The policies have been saved.')
    } catch (err) {
      adminActions.notify('Error saving legal settings', String(err))
    } finally {
      setLoading(false)
    }
  }

  const quillModules = {
    toolbar: [
      [{ header: [1, 2, 3, 4, 5, 6, false] }],
      ['bold', 'italic', 'underline', 'strike'],
      [{ list: 'ordered' }, { list: 'bullet' }],
      ['link', 'clean'],
    ],
  }

  return (
    <PageShell title="Legal & Policies" description="Manage the platform's Terms and Conditions and Privacy Policy.">
      <div className="glass-card p-6">
        <Tabs
          defaultActiveKey="terms"
          items={[
            {
              key: 'terms',
              label: 'Terms and Conditions',
              children: (
                <div className="mt-4">
                  <ReactQuill
                    theme="snow"
                    value={terms}
                    onChange={setTerms}
                    modules={quillModules}
                    className="text-white h-[400px] mb-12 [&_.ql-toolbar]:border-none [&_.ql-container]:border-none bg-transparent [&_.ql-stroke]:stroke-white [&_.ql-fill]:fill-white [&_.ql-picker]:text-white"
                  />
                </div>
              ),
            },
            {
              key: 'privacy',
              label: 'Privacy Policy',
              children: (
                <div className="mt-4">
                  <ReactQuill
                    theme="snow"
                    value={privacy}
                    onChange={setPrivacy}
                    modules={quillModules}
                    className="text-white h-[400px] mb-12 [&_.ql-toolbar]:border-none [&_.ql-container]:border-none bg-transparent [&_.ql-stroke]:stroke-white [&_.ql-fill]:fill-white [&_.ql-picker]:text-white"
                  />
                </div>
              ),
            },
          ]}
        />
        <div className="mt-6 flex justify-end">
          <Button type="primary" onClick={handleSave} loading={loading}>
            Save Changes
          </Button>
        </div>
      </div>
      <AdminActionHost actions={adminActions} />
    </PageShell>
  )
}
