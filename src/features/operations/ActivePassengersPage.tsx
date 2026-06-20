import { Navigate } from 'react-router-dom'

export default function ActivePassengersPage() {
  return <Navigate to="/passengers?tab=active" replace />
}
