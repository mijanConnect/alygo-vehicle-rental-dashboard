import { Component, type ErrorInfo, type ReactNode } from 'react'
import { AlertTriangle, RefreshCw } from 'lucide-react'
import { Button } from 'antd'

interface Props {
  children: ReactNode
  fallback?: ReactNode
}

interface State {
  hasError: boolean
}

export class ErrorBoundary extends Component<Props, State> {
  state: State = { hasError: false }

  static getDerivedStateFromError(): State {
    return { hasError: true }
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    console.error('ErrorBoundary caught:', error, info)
  }

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) return this.props.fallback

      return (
        <div className="flex min-h-[400px] flex-col items-center justify-center gap-4 p-8 text-center">
          <div className="glass-card flex h-16 w-16 items-center justify-center">
            <AlertTriangle className="h-8 w-8 text-alygo-danger" />
          </div>
          <div>
            <h2 className="text-xl font-semibold text-white">Something went wrong</h2>
            <p className="mt-2 text-alygo-text-muted">An unexpected error occurred. Please try again.</p>
          </div>
          <Button
            type="primary"
            icon={<RefreshCw className="h-4 w-4" />}
            onClick={() => this.setState({ hasError: false })}
          >
            Retry
          </Button>
        </div>
      )
    }

    return this.props.children
  }
}
