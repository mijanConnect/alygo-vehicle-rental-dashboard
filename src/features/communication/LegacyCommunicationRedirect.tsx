import { Navigate, useLocation } from 'react-router-dom'
import {
  resolveCommunicationTab,
  resolveLegacyInboxType,
} from '@/features/communication/communicationNavigation'

const LEGACY_PATH_TAB: Record<string, string> = {
  '/communication/conversations': 'inbox',
  '/communication/active-trip-chats': 'inbox',
  '/communication/driver-support': 'driver-support',
  '/communication/passenger-support': 'passenger-support',
  '/communication/safety': 'safety',
  '/communication/broadcast': 'broadcasts',
  '/communication/templates': 'inbox',
  '/communication/analytics': 'inbox',
  '/communication/internal-notes': 'inbox',
}

export function LegacyCommunicationRedirect() {
  const location = useLocation()
  const legacyTab =
    LEGACY_PATH_TAB[location.pathname] ?? new URLSearchParams(location.search).get('tab')
  const tab = resolveCommunicationTab(legacyTab)
  const typeFilter = resolveLegacyInboxType(legacyTab)
  const params = new URLSearchParams({ tab })
  if (tab === 'inbox' && typeFilter) {
    params.set('type', typeFilter)
  }
  return <Navigate to={`/communication?${params.toString()}`} replace />
}
