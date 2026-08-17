import { Navigate } from 'react-router-dom'

/** Legacy communication sub-routes now land on Broadcasts. */
export function LegacyCommunicationRedirect() {
  return <Navigate to="/communication" replace />
}
