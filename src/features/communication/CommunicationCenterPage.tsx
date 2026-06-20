import { Tabs } from 'antd'
import { useSearchParams } from 'react-router-dom'
import { PageShell } from '@/components/common/PageShell'
import { CommunicationCenterKpiCards } from '@/features/communication/components/CommunicationCenterKpiCards'
import { CommunicationInboxTab } from '@/features/communication/components/CommunicationInboxTab'
import { BroadcastsTab } from '@/features/communication/components/CommunicationTabPanels'
import {
  COMMUNICATION_TAB_LABELS,
  resolveCommunicationTab,
  resolveLegacyInboxType,
  type CommunicationTabKey,
} from '@/features/communication/communicationNavigation'
import { useDocumentTitle } from '@/hooks/useDocumentTitle'

const COMMUNICATION_TABS: CommunicationTabKey[] = ['inbox', 'broadcasts']

function renderTabContent(tab: CommunicationTabKey, inboxTypeFilter: string) {
  if (tab === 'broadcasts') return <BroadcastsTab />
  return <CommunicationInboxTab initialType={inboxTypeFilter} />
}

export default function CommunicationCenterPage() {
  useDocumentTitle('Communication Center')
  const [searchParams, setSearchParams] = useSearchParams()
  const tabParam = searchParams.get('tab')
  const validTab = resolveCommunicationTab(tabParam)
  const inboxTypeFilter = searchParams.get('type') ?? resolveLegacyInboxType(tabParam)

  const tabs = COMMUNICATION_TABS.map((key) => ({
    key,
    label: COMMUNICATION_TAB_LABELS[key],
    children: renderTabContent(key, key === 'inbox' ? inboxTypeFilter : ''),
  }))

  return (
    <PageShell
      title="Communication Center"
      description="Real-time operational messaging — centralized inbox and broadcast announcements."
    >
      <CommunicationCenterKpiCards />
      <div className="glass-card p-4">
        <Tabs
          activeKey={validTab}
          onChange={(key) => {
            const next = new URLSearchParams()
            next.set('tab', key)
            setSearchParams(next)
          }}
          items={tabs}
        />
      </div>
    </PageShell>
  )
}
