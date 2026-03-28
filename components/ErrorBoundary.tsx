'use client'

import { Component, type ReactNode } from 'react'

interface Props {
  children: ReactNode
}

interface State {
  hasError: boolean
  error: Error | null
}

export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props)
    this.state = { hasError: false, error: null }
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error }
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('Game error:', error, errorInfo)
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-black flex items-center justify-center p-8">
          <div className="max-w-lg text-center font-mono">
            <h1 className="text-amber-400 text-2xl mb-4">SYSTEM MALFUNCTION</h1>
            <p className="text-amber-600 mb-4">
              Something went wrong. The wasteland glitched.
            </p>
            <p className="text-amber-700 text-sm mb-6">
              {this.state.error?.message}
            </p>
            <button
              onClick={() => {
                this.setState({ hasError: false, error: null })
                window.location.reload()
              }}
              className="px-6 py-2 border border-amber-600 text-amber-400 hover:bg-amber-900/30 transition-colors"
            >
              REBOOT SYSTEM
            </button>
          </div>
        </div>
      )
    }

    return this.props.children
  }
}
