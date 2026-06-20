import { Navigate } from 'react-router-dom'

export default function ActiveDriversPage() {
  return <Navigate to="/drivers?tab=active" replace />
}
