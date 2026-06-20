import { Tabs } from 'antd'
import { useSearchParams } from 'react-router-dom'
import { PageShell } from '@/components/common/PageShell'
import {
  AirportsPanel,
  CitiesPanel,
  StatesPanel,
  ZonesPanel,
} from '@/features/locations/components/LocationTabPanels'
import {
  DEFAULT_LOCATION_TAB,
  LOCATION_TAB_KEYS,
  LOCATION_TAB_LABELS,
  type LocationTabKey,
} from '@/features/locations/locationNavigation'
import { useDocumentTitle } from '@/hooks/useDocumentTitle'

const LOCATION_TABS = [
  { key: 'states', label: LOCATION_TAB_LABELS.states, children: <StatesPanel /> },
  { key: 'cities', label: LOCATION_TAB_LABELS.cities, children: <CitiesPanel /> },
  { key: 'zones', label: LOCATION_TAB_LABELS.zones, children: <ZonesPanel /> },
  { key: 'airports', label: LOCATION_TAB_LABELS.airports, children: <AirportsPanel /> },
] as const

export default function LocationDashboardPage() {
  useDocumentTitle('Location Management')
  const [searchParams, setSearchParams] = useSearchParams()
  const activeTab = (searchParams.get('tab') as LocationTabKey | null) ?? DEFAULT_LOCATION_TAB
  const validTab = LOCATION_TAB_KEYS.includes(activeTab) ? activeTab : DEFAULT_LOCATION_TAB

  return (
    <PageShell
      title="Location Management"
      description="Unified geographic command center for states, cities, zones, and airports."
    >
      <div className="glass-card p-4">
        <Tabs
          activeKey={validTab}
          onChange={(key) => setSearchParams({ tab: key })}
          items={[...LOCATION_TABS]}
        />
      </div>
    </PageShell>
  )
}
