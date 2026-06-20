import { Button } from 'antd'
import { Home } from 'lucide-react'
import { Link } from 'react-router-dom'
import { useDocumentTitle } from '@/hooks/useDocumentTitle'

export default function NotFoundPage() {
  useDocumentTitle('Page Not Found')

  return (
    <div className="flex min-h-[60vh] flex-col items-center justify-center text-center">
      <div className="glass-card p-10">
        <p className="text-6xl font-bold text-indigo-400">404</p>
        <h1 className="mt-4 text-2xl font-semibold text-white">Page not found</h1>
        <p className="mt-2 text-alygo-text-muted">The page you are looking for does not exist or has been moved.</p>
        <Link to="/">
          <Button type="primary" icon={<Home className="h-4 w-4" />} className="mt-6">
            Back to Dashboard
          </Button>
        </Link>
      </div>
    </div>
  )
}
