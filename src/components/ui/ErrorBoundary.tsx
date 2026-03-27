import React from 'react'
import { AlertTriangle } from 'lucide-react'

interface ErrorBoundaryProps {
  fallback?: React.ReactNode
  onError?: (error: Error, info: React.ErrorInfo) => void
  children: React.ReactNode
}

interface ErrorBoundaryState {
  hasError: boolean
  error?: Error
}

export class ErrorBoundary extends React.Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props)
    this.state = { hasError: false }
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error }
  }

  componentDidCatch(error: Error, info: React.ErrorInfo): void {
    this.props.onError?.(error, info)
  }

  render(): React.ReactNode {
    if (this.state.hasError) {
      if (this.props.fallback) return this.props.fallback

      return (
        <div className="flex flex-col items-center justify-center p-8 text-center">
          <AlertTriangle className="h-12 w-12 text-amber-500 mb-4" />
          <h2 className="text-lg font-semibold text-slate-900 mb-2">Algo salio mal</h2>
          <p className="text-sm text-slate-600 mb-4">
            {this.state.error?.message || 'Error inesperado'}
          </p>
          <button
            onClick={() => this.setState({ hasError: false, error: undefined })}
            className="px-4 py-2 bg-primary-500 text-white rounded-lg hover:bg-primary-600 text-sm"
          >
            Intentar de nuevo
          </button>
        </div>
      )
    }

    return this.props.children
  }
}
