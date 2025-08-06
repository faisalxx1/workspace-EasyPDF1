'use client'

import React, { Component, ErrorInfo, ReactNode } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { 
  AlertTriangle, 
  RefreshCw, 
  Home, 
  HelpCircle,
  Bug,
  FileText
} from "lucide-react"

interface Props {
  children: ReactNode
  fallback?: ReactNode
}

interface State {
  hasError: boolean
  error: Error | null
  errorInfo: ErrorInfo | null
}

export class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null,
    errorInfo: null
  }

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error, errorInfo: null }
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('ErrorBoundary caught an error:', error, errorInfo)
    
    // Here you could log the error to an error reporting service
    // logErrorToService(error, errorInfo)
    
    this.setState({
      error,
      errorInfo
    })
  }

  private handleReload = () => {
    window.location.reload()
  }

  private handleGoHome = () => {
    window.location.href = '/'
  }

  private handleReportError = () => {
    // In a real application, this would open a support ticket or error report form
    const subject = encodeURIComponent('Error Report - EasyPDF Tools')
    const body = encodeURIComponent(
      `Error Details:\n\n` +
      `Error: ${this.state.error?.message}\n\n` +
      `Component Stack:\n${this.state.errorInfo?.componentStack}\n\n` +
      `URL: ${window.location.href}\n` +
      `User Agent: ${navigator.userAgent}\n` +
      `Timestamp: ${new Date().toISOString()}`
    )
    
    window.open(`mailto:support@easypdftools.com?subject=${subject}&body=${body}`, '_blank')
  }

  public render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback
      }

      return (
        <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center p-4">
          <Card className="w-full max-w-2xl">
            <CardHeader className="text-center">
              <div className="flex justify-center mb-4">
                <AlertTriangle className="h-12 w-12 text-red-500" />
              </div>
              <CardTitle className="text-xl text-red-600 dark:text-red-400">
                Oops! Something went wrong
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <Alert variant="destructive">
                <AlertDescription className="text-sm">
                  We're sorry, but something unexpected happened. Our team has been notified of this issue.
                </AlertDescription>
              </Alert>

              {process.env.NODE_ENV === 'development' && this.state.error && (
                <div className="bg-gray-100 dark:bg-gray-800 p-4 rounded-lg">
                  <h4 className="font-medium mb-2 flex items-center">
                    <Bug className="h-4 w-4 mr-2" />
                    Error Details (Development Mode)
                  </h4>
                  <div className="space-y-2 text-sm font-mono">
                    <p className="text-red-600 dark:text-red-400">
                      {this.state.error.toString()}
                    </p>
                    {this.state.errorInfo && (
                      <details className="cursor-pointer">
                        <summary className="text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200">
                          Component Stack
                        </summary>
                        <pre className="mt-2 p-2 bg-gray-200 dark:bg-gray-700 rounded text-xs overflow-x-auto">
                          {this.state.errorInfo.componentStack}
                        </pre>
                      </details>
                    )}
                  </div>
                </div>
              )}

              <div className="flex flex-col sm:flex-row gap-3">
                <Button onClick={this.handleReload} className="flex-1">
                  <RefreshCw className="h-4 w-4 mr-2" />
                  Reload Page
                </Button>
                <Button variant="outline" onClick={this.handleGoHome} className="flex-1">
                  <Home className="h-4 w-4 mr-2" />
                  Go Home
                </Button>
              </div>

              <div className="text-center">
                <Button 
                  variant="ghost" 
                  onClick={this.handleReportError}
                  className="text-sm"
                >
                  <HelpCircle className="h-4 w-4 mr-2" />
                  Report This Issue
                </Button>
              </div>

              <div className="text-center text-sm text-gray-500 dark:text-gray-400">
                <p>If this problem persists, please contact our support team.</p>
                <p className="mt-1">Error ID: {Date.now().toString(36)}</p>
              </div>
            </CardContent>
          </Card>
        </div>
      )
    }

    return this.props.children
  }
}

// Hook-based error boundary for functional components
export function useErrorHandler() {
  const [error, setError] = React.useState<Error | null>(null)

  React.useEffect(() => {
    if (error) {
      // Log error to error reporting service
      console.error('Hook error:', error)
      // logErrorToService(error)
    }
  }, [error])

  const captureError = (error: Error) => {
    setError(error)
  }

  const clearError = () => {
    setError(null)
  }

  return { error, captureError, clearError }
}

// Component for handling API errors
interface APIErrorProps {
  error: string | null
  onRetry?: () => void
  retryText?: string
  className?: string
}

export function APIError({ error, onRetry, retryText = "Try Again", className = "" }: APIErrorProps) {
  if (!error) return null

  const getErrorMessage = (error: string) => {
    const errorMessages: { [key: string]: string } = {
      'Network Error': 'Unable to connect to the server. Please check your internet connection.',
      'Timeout': 'The request took too long. Please try again.',
      'Unauthorized': 'Please sign in to access this feature.',
      'Forbidden': 'You don\'t have permission to access this resource.',
      'Not Found': 'The requested resource was not found.',
      'Too Many Requests': 'Too many requests. Please wait a moment and try again.',
      'Internal Server Error': 'Something went wrong on our end. Please try again later.',
      'Service Unavailable': 'Our service is temporarily unavailable. Please try again later.'
    }

    return errorMessages[error] || error
  }

  const getSuggestion = (error: string) => {
    const suggestions: { [key: string]: string } = {
      'Network Error': 'Check your internet connection and try again.',
      'Timeout': 'Refresh the page and try again. If the problem persists, contact support.',
      'Unauthorized': 'Please sign in to your account and try again.',
      'Forbidden': 'This feature may require a premium subscription. Check your plan details.',
      'Too Many Requests': 'Please wait a few minutes before trying again.',
      'Internal Server Error': 'This is a problem on our end. Our team has been notified.',
      'Service Unavailable': 'We\'re currently performing maintenance. Please try again later.'
    }

    return suggestions[error] || 'If this problem continues, please contact our support team.'
  }

  return (
    <Card className={`w-full ${className}`}>
      <CardContent className="pt-6">
        <div className="text-center">
          <AlertTriangle className="h-12 w-12 text-amber-500 mx-auto mb-4" />
          <h3 className="text-lg font-semibold mb-2">Something went wrong</h3>
          <p className="text-gray-600 dark:text-gray-400 mb-2">
            {getErrorMessage(error)}
          </p>
          <p className="text-sm text-gray-500 dark:text-gray-500 mb-4">
            {getSuggestion(error)}
          </p>
          {onRetry && (
            <Button onClick={onRetry}>
              <RefreshCw className="h-4 w-4 mr-2" />
              {retryText}
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  )
}

// Component for handling loading states with skeleton
interface LoadingStateProps {
  message?: string
  className?: string
}

export function LoadingState({ message = "Loading...", className = "" }: LoadingStateProps) {
  return (
    <div className={`flex items-center justify-center p-8 ${className}`}>
      <div className="text-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
        <p className="text-gray-600 dark:text-gray-400">{message}</p>
      </div>
    </div>
  )
}

// Component for empty states
interface EmptyStateProps {
  title: string
  description?: string
  action?: ReactNode
  icon?: ReactNode
  className?: string
}

export function EmptyState({ 
  title, 
  description, 
  action, 
  icon = <FileText className="h-12 w-12" />,
  className = "" 
}: EmptyStateProps) {
  return (
    <div className={`text-center py-12 ${className}`}>
      <div className="flex justify-center mb-4">
        <div className="p-3 bg-gray-100 dark:bg-gray-800 rounded-full text-gray-400">
          {icon}
        </div>
      </div>
      <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
        {title}
      </h3>
      {description && (
        <p className="text-gray-500 dark:text-gray-400 mb-6">
          {description}
        </p>
      )}
      {action}
    </div>
  )
}